import os
import json
import re
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from devsms import DevSMSClient

# FALLBACK IMPORTS
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

from google import genai 
from core.config import settings
from models.document_model import ComplianceDocument
from models.user_model import User 
from models.notification_model import Notification # Needed for the Web Alert

mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client["SMERegulator"]

mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.SENDER_EMAIL,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SENDER_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_SERVER,
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True
)

class ComplianceEngine:
    
    @staticmethod
    def run_fallback_ocr(file_path: str):
        """
        The Fail-Safe: Uses Tesseract OCR and Regex to extract data locally if Gemini fails.
        """
        print(f"🔄 Triggering OCR Fallback for: {file_path}")
        text = ""
        try:
            # 1. Read the file (Handle both PDFs and Images)
            if file_path.lower().endswith('.pdf'):
                images = convert_from_path(file_path)
                for img in images:
                    text += pytesseract.image_to_string(img)
            else:
                img = Image.open(file_path)
                text += pytesseract.image_to_string(img)
            
            # 2. Use Regex to find Dates (Standard formats: YYYY-MM-DD or DD/MM/YYYY)
            date_pattern = r'\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b'
            found_dates = re.findall(date_pattern, text)
            
            # Convert found dates to YYYY-MM-DD for consistency
            clean_dates = []
            for d in found_dates:
                try:
                    # Try DD/MM/YYYY first, then YYYY-MM-DD
                    if '/' in d or '-' in d and len(d.split('-')[0]) == 2:
                        parsed = datetime.strptime(d.replace('/', '-'), "%d-%m-%Y").strftime("%Y-%m-%d")
                    else:
                        parsed = datetime.strptime(d.replace('/', '-'), "%Y-%m-%d").strftime("%Y-%m-%d")
                    clean_dates.append(parsed)
                except ValueError:
                    continue
            
            # Sort dates: Oldest is likely issue date, newest is likely expiry
            clean_dates.sort()
            issue_date = clean_dates[0] if len(clean_dates) > 0 else None
            expiry_date = clean_dates[-1] if len(clean_dates) > 1 else (clean_dates[0] if len(clean_dates) == 1 else None)

            # 3. Guess Authority based on keywords in text
            text_upper = text.upper()
            authority = "Unknown Authority"
            if "KRA" in text_upper or "REVENUE" in text_upper:
                authority = "Kenya Revenue Authority"
            elif "COUNTY" in text_upper or "NBI" in text_upper:
                authority = "County Government"
            elif "FIRE" in text_upper:
                authority = "Fire & Rescue Services"
            elif "HEALTH" in text_upper or "HYGIENE" in text_upper:
                authority = "Ministry of Health"

            # 4. Return data formatted exactly like the Gemini output
            if expiry_date:
                return {
                    "title": f"{authority} Document",
                    "authority": authority,
                    "expiry": expiry_date,
                    "issue": issue_date or expiry_date,
                    "summary": "Document processed via localized OCR Fallback. Please verify dates."
                }
            return None # OCR failed to find dates

        except Exception as e:
            print(f"❌ OCR Fallback completely failed: {e}")
            return None

    @staticmethod
    async def run_ai_scan(file_path: str):
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            sample_file = client.files.upload(file=file_path)
            
            prompt = f"""
            Analyze this Kenyan compliance document. 
            Identify the authority (e.g., KRA, NSSF, County Government) and extract:
            1. title
            2. authority
            3. expiry (YYYY-MM-DD)
            4. issue (YYYY-MM-DD)
            5. summary (A clear 2-sentence explanation)
            
            Return ONLY a valid JSON object.
            Today's date is {datetime.now().date()}.
            """

            response = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=[prompt, sample_file]
            )
            
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            client.files.delete(name=sample_file.name)
            return json.loads(clean_json)

        except Exception as e:
            print(f"⚠️ Gemini API Error: {e}")
            return None # Return None to trigger fallback

    @staticmethod
    async def process_new_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        # 1. ATTEMPT PRIMARY AI
        ai_data = await ComplianceEngine.run_ai_scan(doc.file_path)
        is_fallback = False

        # 2. ATTEMPT FAIL-SAFE OCR
        if not ai_data:
            ai_data = ComplianceEngine.run_fallback_ocr(doc.file_path)
            is_fallback = True

        # 3. IF BOTH FAIL -> FLAG FOR MANUAL REVIEW
        if not ai_data:
            doc.document_type = "MANUAL_REVIEW"
            db.commit()
            await ComplianceEngine.send_failure_notifications(doc, user_email, phone, db)
            return

        # 4. SUCCESS LOGIC (AI OR OCR WORKED)
        try:
            doc.title = ai_data.get("title", doc.title)
            doc.issuing_authority = ai_data.get("authority", "Unknown")
            doc.expiry_date = datetime.strptime(ai_data["expiry"], "%Y-%m-%d").date()
            if ai_data.get("issue"):
                doc.issue_date = datetime.strptime(ai_data["issue"], "%Y-%m-%d").date()
            db.commit()
        except Exception as e:
            print(f"❌ SQL Sync Error: {e}")
            db.rollback()
            return

        await mongo_db.document_meta.insert_one({
            "neon_id": doc_id,
            "user": user_email,
            "ai_summary": ai_data.get("summary", ""),
            "processed_via_fallback": is_fallback,
            "processed_at": datetime.now(timezone.utc)
        })

        await ComplianceEngine.send_success_notifications(doc, ai_data, user_email, phone, is_fallback, db)


    # --- NOTIFICATION HELPERS ---

    @staticmethod
    async def send_success_notifications(doc, ai_data, user_email, phone, is_fallback, db):
        method = "Local Backup Scanner" if is_fallback else "AI Engine"
        summary = ai_data.get('summary')
        
        # Web Alert
        new_alert = Notification(
            user_id=doc.user_id,
            title=f"Document Processed ({method})",
            message=f"Your {doc.title} was successfully processed. Expires: {doc.expiry_date}.",
        )
        db.add(new_alert)
        db.commit()

        try:
            # Email
            email_body = f"""
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5;">Verification Success</h2>
                <p>Your <b>{doc.title}</b> has been processed by our {method}.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><b>Issuing Authority:</b> {doc.issuing_authority}</p>
                    <p style="margin: 5px 0; color: #e11d48;"><b>Expires:</b> {doc.expiry_date}</p>
                </div>
                <p><b>Summary:</b> {summary}</p>
            </div>
            """
            fm = FastMail(mail_conf)
            msg = MessageSchema(subject=f"SME Navigator: {doc.title} Verified", recipients=[user_email], body=email_body, subtype="html")
            await fm.send_message(msg)

            # SMS
            if phone:
                formatted_phone = "+254" + phone[1:] if phone.startswith("0") else (phone if phone.startswith("+") else "+" + phone)
                sms_text = f"SME Nav: {doc.title} verified via {method}. Expires: {doc.expiry_date}. Check dashboard."
                DevSMSClient(api_key=settings.DEVTEXT_API_KEY).send(to=formatted_phone, message=sms_text)

        except Exception as e:
            print(f"⚠️ Success Notification error: {e}")

    @staticmethod
    async def send_failure_notifications(doc, user_email, phone, db):
        # Web Alert
        new_alert = Notification(
            user_id=doc.user_id,
            title="Action Required: Manual Entry",
            message=f"We could not automatically read your '{doc.title}'. Please update the expiry date manually.",
        )
        db.add(new_alert)
        db.commit()

        try:
            # Email
            email_body = f"""
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #e11d48;">Manual Action Required</h2>
                <p>We received your document <b>{doc.title}</b>, but our automated systems could not clearly read the expiry date.</p>
                <p>To ensure you continue receiving compliance reminders, please log in to your dashboard and enter the expiry date manually.</p>
            </div>
            """
            fm = FastMail(mail_conf)
            msg = MessageSchema(subject=f"Action Required: Update {doc.title}", recipients=[user_email], body=email_body, subtype="html")
            await fm.send_message(msg)

            # SMS
            if phone:
                formatted_phone = "+254" + phone[1:] if phone.startswith("0") else (phone if phone.startswith("+") else "+" + phone)
                sms_text = f"SME Nav Action Required: Could not auto-read {doc.title}. Please log in and enter the expiry date manually."
                DevSMSClient(api_key=settings.DEVTEXT_API_KEY).send(to=formatted_phone, message=sms_text)

        except Exception as e:
            print(f"⚠️ Failure Notification error: {e}")