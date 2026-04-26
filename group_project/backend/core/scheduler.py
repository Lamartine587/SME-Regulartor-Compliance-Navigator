import requests
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from db.neon_session import SessionLocal

# Make sure these models exist in your project
from models.document_model import ComplianceDocument
from models.user_model import User
from models.notification_model import Notification # You will need to create this model!
from core.config import settings

# Import your email service helper (assuming you have one)
from services.email_service import send_email_alert 

def check_expiring_permits():
    """Queries NeonDB for expiring permits and sends Web, SMS, and Email alerts."""
    db = SessionLocal()
    try:
        today = datetime.now().date()
        # Notify at 30 days, 7 days, and 0 days (day of expiry)
        reminders = [30, 7, 0] 

        for days in reminders:
            target_date = today + timedelta(days=days)
            # Find docs expiring exactly on the target date
            docs = db.query(ComplianceDocument).filter(ComplianceDocument.expiry_date == target_date).all()

            for doc in docs:
                # 1. Fetch the actual user who owns this document
                user = db.query(User).filter(User.id == doc.user_id).first()
                if not user:
                    continue

                # 2. Format the message
                urgency = "URGENT" if days <= 7 else "REMINDER"
                message = f"{urgency}: Your {doc.title} expires in {days} days ({doc.expiry_date}). Renew now to avoid fines!"
                if days == 0:
                    message = f"CRITICAL: Your {doc.title} has expired TODAY ({doc.expiry_date}). Renew immediately!"

                print(f"📡 Processing {days}-day alert for {doc.title} (User: {user.email})")

                # 3. --- WEB/APP NOTIFICATION (Saves to DB for Reminders.jsx) ---
                new_alert = Notification(
                    user_id=user.id,
                    title=f"{doc.title} Expiring",
                    message=message,
                    document_type=getattr(doc, 'document_type', 'PERMIT'), 
                    expiry_date=str(doc.expiry_date),
                    days_remaining=days
                )
                db.add(new_alert)

                # 4. --- DEVSMS INTEGRATION ---
                if user.phone:
                    devsms_url = "https://api.devsms.example.com/v1/messages" 
                    headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {settings.DEVSMS_API_KEY}"
                    }
                    payload = {
                        "recipient": user.phone, # Dynamically pulls the user's phone
                        "text": message
                    }
                    try:
                        response = requests.post(devsms_url, json=payload, headers=headers)
                        response.raise_for_status()
                        print(f"✅ SMS sent successfully to {user.phone}")
                    except requests.exceptions.RequestException as e:
                        print(f"❌ DevSMS Error: {e}")

                # 5. --- EMAIL INTEGRATION ---
                if user.email:
                    try:
                        send_email_alert(
                            to_email=user.email, 
                            subject=f"SME Compliance Alert: {doc.title}", 
                            body=message
                        )
                        print(f"✅ Email sent successfully to {user.email}")
                    except Exception as e:
                        print(f"❌ Email Error: {e}")

        # Commit all the new web notifications to the database at the end
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_reminder_scheduler():
    scheduler = BackgroundScheduler()
    # Runs every day at 8:00 AM
    scheduler.add_job(check_expiring_permits, 'cron', hour=8, minute=0)
    scheduler.start()
    print("⏰ Daily Compliance Scheduler (Web, SMS & Email) is active.")