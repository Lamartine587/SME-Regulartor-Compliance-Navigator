import httpx
import json
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

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
        filename = os.path.basename(file_path)
        
        url = "https://api.featherless.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.FEATHERLESS_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        Analyze this compliance document filename: {filename}.
        Based on Kenyan regulatory standards (KRA, NHIF, NSSF, County Permits), 
        extract the following information in valid JSON format:
        1. title
        2. authority
        3. expiry (YYYY-MM-DD)
        4. issue (YYYY-MM-DD)
        5. summary
        
        If dates are missing, estimate based on a 1-year validity from the current date ({datetime.now().date()}).
        ONLY return the JSON object.
        """

        payload = {
            "model": settings.AI_MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=45.0)
                response.raise_for_status()
                result = response.json()
                
                content = result['choices'][0]['message']['content']
                return json.loads(content)
            except Exception as e:
                print(f"❌ AI Scan Failed: {e}")
                return None

    @staticmethod
    async def process_new_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        ai_data = await ComplianceEngine.run_ai_scan(doc.file_path)
        
        if not ai_data:
            return

        try:
            doc.title = ai_data.get("title", doc.title)
            doc.issuing_authority = ai_data.get("authority", "Unknown")
            doc.expiry_date = datetime.strptime(ai_data["expiry"], "%Y-%m-%d").date()
            doc.issue_date = datetime.strptime(ai_data["issue"], "%Y-%m-%d").date()
            db.commit()
        except Exception as e:
            print(f"❌ SQL Update Error: {e}")
            db.rollback()

        await mongo_db.document_meta.insert_one({
            "neon_id": doc_id,
            "user": user_email,
            "ai_summary": ai_data.get("summary", "No summary provided."),
            "full_ai_response": ai_data,
            "processed_at": datetime.now(timezone.utc)
        })

        try:
            fm = FastMail(mail_conf)
            msg = MessageSchema(
                subject="SME Navigator: Document Processed",
                recipients=[user_email],
                body=f"<h3>Scan Complete</h3><p>Your <b>{doc.title}</b> has been verified. Expiry: {doc.expiry_date}</p>",
                subtype="html"
            )
            await fm.send_message(msg)

            if phone:
                if phone.startswith("0"):
                    formatted_phone = "254" + phone[1:]
                elif phone.startswith("+"):
                    formatted_phone = phone[1:]
                else:
                    formatted_phone = phone

                sms_text = f"SME Nav: {doc.title} scanned. Valid until {doc.expiry_date}. Check your dashboard."
                
                sms_payload = {
                    "api_key": settings.DEVTEXT_API_KEY,
                    "to": formatted_phone,
                    "message": sms_text,
                    "from": settings.DEVTEXT_SENDER_ID
                }
                
                async with httpx.AsyncClient() as client:
                    sms_response = await client.post(
                        settings.DEVTEXT_BASE_URL, 
                        json=sms_payload, 
                        timeout=10.0
                    )
                    sms_response.raise_for_status()

        except Exception as e:
            print(f"⚠️ Notification error: {e}")

        print(f"🚀 AI Engine successfully synchronized Document #{doc_id}")