import os
import json
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from devsms import DevSMSClient

# NEW IMPORT SYNTAX
from google import genai 
from core.config import settings
from models.document_model import ComplianceDocument

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
    async def run_ai_scan(file_path: str):
        try:
            # 1. Initialize the new Client
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            # 2. Upload file to Gemini's temporary storage
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

            # 3. Generate Content using the new syntax and latest model
            response = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=[prompt, sample_file]
            )
            
            # Clean up the text (Gemini sometimes adds ```json markers)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            
            # 4. Clean up: Delete the file from Google's servers after processing
            client.files.delete(name=sample_file.name)
            
            return json.loads(clean_json)

        except Exception as e:
            print(f"❌ Gemini Scan Failed: {e}")
            return None

    @staticmethod
    async def process_new_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        ai_data = await ComplianceEngine.run_ai_scan(doc.file_path)
        if not ai_data: return

        try:
            doc.title = ai_data.get("title", doc.title)
            doc.issuing_authority = ai_data.get("authority", "Unknown")
            doc.expiry_date = datetime.strptime(ai_data["expiry"], "%Y-%m-%d").date()
            doc.issue_date = datetime.strptime(ai_data["issue"], "%Y-%m-%d").date()
            db.commit()
        except Exception as e:
            print(f"❌ SQL Sync Error: {e}")
            db.rollback()

        await mongo_db.document_meta.insert_one({
            "neon_id": doc_id,
            "user": user_email,
            "ai_summary": ai_data.get("summary", "Verified by Gemini AI."),
            "full_ai_response": ai_data,
            "processed_at": datetime.now(timezone.utc)
        })

        # --- Notifications ---
        try:
            email_body = f"""
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5;">Verification Success</h2>
                <p>Your <b>{doc.title}</b> has been processed by our AI engine.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><b>Issuing Authority:</b> {doc.issuing_authority}</p>
                    <p style="margin: 5px 0;"><b>Issue Date:</b> {doc.issue_date}</p>
                    <p style="margin: 5px 0; color: #e11d48;"><b>Expires:</b> {doc.expiry_date}</p>
                </div>
                <p><b>Summary:</b> {ai_data.get('summary')}</p>
            </div>
            """
            fm = FastMail(mail_conf)
            msg = MessageSchema(subject=f"SME Navigator: {doc.title} Verified", recipients=[user_email], body=email_body, subtype="html")
            await fm.send_message(msg)

            if phone:
                # Sanitize phone for DevText
                if phone.startswith("0"):
                    formatted_phone = "+254" + phone[1:]
                elif not phone.startswith("+"):
                    formatted_phone = "+" + phone
                else:
                    formatted_phone = phone

                sms_text = f"SME Nav: Your {doc.title} from {doc.issuing_authority} is verified. Expires: {doc.expiry_date}. Check dashboard for details."
                sms_client = DevSMSClient(api_key=settings.DEVTEXT_API_KEY)
                sms_response = sms_client.send(to=formatted_phone, message=sms_text)
                
                if sms_response.status != "success":
                    print(f"⚠️ SMS Delivery failed: {sms_response.status}")

        except Exception as e:
            print(f"⚠️ Notification error: {e}")

        print(f"🚀 Gemini successfully synchronized Document #{doc_id}")