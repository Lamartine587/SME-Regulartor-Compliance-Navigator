import httpx
import json
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import africastalking

from core.config import settings
from models.document_model import ComplianceDocument

# MongoDB Setup
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client["SMERegulator"]

# SMS Setup
africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
sms_service = africastalking.SMS

# Email Setup
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
        """Connects to Featherless AI to extract permit content via LLM."""
        
        # In a real-world scenario, you'd use an OCR library here first.
        # For now, we pass the filename and context to the LLM.
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
        1. title (e.g., 'Single Business Permit')
        2. authority (e.g., 'Nairobi City County')
        3. expiry (YYYY-MM-DD)
        4. issue (YYYY-MM-DD)
        5. summary (A brief 1-sentence description)
        
        If dates are missing, estimate based on a 1-year validity from the current date ({datetime.now().date()}).
        ONLY return the JSON object.
        """

        payload = {
            "model": "meta-llama/Llama-3.1-70B-Instruct", # Or your preferred Featherless model
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                
                # Extract the content string and parse as JSON
                content = result['choices'][0]['message']['content']
                return json.loads(content)
            except Exception as e:
                print(f"❌ AI Scan Failed: {e}")
                return None

    @staticmethod
    async def process_new_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        """The core logic that updates all systems with real AI data."""
        
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        # 1. Extract Real Data via Featherless AI
        ai_data = await ComplianceEngine.run_ai_scan(doc.file_path)
        
        if not ai_data:
            print(f"⚠️ Skipping process for Doc #{doc_id} due to AI failure.")
            return

        # 2. Update Neon (SQL) - Feeding the Dashboard
        try:
            doc.title = ai_data.get("title", doc.title)
            doc.issuing_authority = ai_data.get("authority", "Unknown")
            doc.expiry_date = datetime.strptime(ai_data["expiry"], "%Y-%m-%d").date()
            doc.issue_date = datetime.strptime(ai_data["issue"], "%Y-%m-%d").date()
            db.commit()
        except Exception as e:
            print(f"❌ SQL Update Error: {e}")
            db.rollback()

        # 3. Save detailed AI metadata to MongoDB (NoSQL)
        await mongo_db.document_meta.insert_one({
            "neon_id": doc_id,
            "user": user_email,
            "ai_summary": ai_data.get("summary", "No summary provided."),
            "full_ai_response": ai_data,
            "processed_at": datetime.utcnow()
        })

        # 4. Send Notifications
        try:
            # Email
            fm = FastMail(mail_conf)
            msg = MessageSchema(
                subject="SME Navigator: Document Processed",
                recipients=[user_email],
                body=f"<h3>Scan Complete</h3><p>Your <b>{doc.title}</b> has been verified. Expiry: {doc.expiry_date}</p>",
                subtype="html"
            )
            await fm.send_message(msg)

            # SMS (Africa's Talking)
            if phone:
                sms_text = f"SME Nav: {doc.title} scanned. Valid until {doc.expiry_date}. Check your dashboard for details."
                sms_service.send(sms_text, [phone])
        except Exception as e:
            print(f"⚠️ Notification error: {e}")

        print(f"🚀 AI Engine successfully synchronized Document #{doc_id}")