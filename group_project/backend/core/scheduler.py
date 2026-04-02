import requests
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from db.neon_session import SessionLocal
from models.document_model import ComplianceDocument
from core.config import settings

def check_expiring_permits():
    """Queries NeonDB for permits expiring in 7 and 30 days and sends DevSMS alerts."""
    db = SessionLocal()
    try:
        today = datetime.now().date()
        reminders = [7, 30] # Notify at 30 days and 7 days left

        for days in reminders:
            target_date = today + timedelta(days=days)
            # Find docs expiring exactly on the target date
            docs = db.query(ComplianceDocument).filter(ComplianceDocument.expiry_date == target_date).all()

            for doc in docs:
                message = f"ALERT: Your {doc.title} expires in {days} days ({doc.expiry_date}). Renew now to avoid fines!"
                print(f"📡 Sending {days}-day reminder for {doc.title}")

                # --- DevSMS Integration ---
                # IMPORTANT: Replace with the actual DevSMS endpoint
                devsms_url = "https://api.devsms.example.com/v1/messages" 

                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.DEVSMS_API_KEY}"
                }

                # NOTE: You will need to join your User table or relationship to get the actual phone number.
                # Assuming your model has a relationship like doc.owner.phone_number
                phone_number = "+254700000000" # Replace with actual dynamic variable

                payload = {
                    "recipient": phone_number,
                    "text": message
                }

                try:
                    response = requests.post(devsms_url, json=payload, headers=headers)
                    response.raise_for_status()
                    print(f"✅ SMS sent successfully to {phone_number}")
                except requests.exceptions.RequestException as e:
                    print(f"❌ DevSMS Error: {e}")

    except Exception as e:
        print(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_reminder_scheduler():
    scheduler = BackgroundScheduler()
    # Runs every day at 8:00 AM
    scheduler.add_job(check_expiring_permits, 'cron', hour=8, minute=0)
    scheduler.start()
    print("⏰ Daily Compliance Scheduler is active (powered by DevSMS).")