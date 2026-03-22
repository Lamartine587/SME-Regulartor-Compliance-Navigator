from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from db.neon_session import SessionLocal
from models.document_model import ComplianceDocument
import africastalking
from core.config import settings

# Initialize Africa's Talking
africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
sms = africastalking.SMS

def check_expiring_permits():
    """Queries NeonDB for permits expiring in 7 and 30 days."""
    db = SessionLocal()
    try:
        today = datetime.now().date()
        reminders = [7, 30] # Notify at 30 days and 7 days left

        for days in reminders:
            target_date = today + timedelta(days=days)
            # Find docs expiring exactly on the target date
            docs = db.query(ComplianceDocument).filter(ComplianceDocument.expiry_date == target_date).all()

            for doc in docs:
                # 1. Send SMS Alert
                message = f"ALERT: Your {doc.title} expires in {days} days ({doc.expiry_date}). Renew now to avoid fines!"
                # phone_number = doc.user.phone_number (Join with User table if needed)
                print(f"📡 Sending {days}-day reminder for {doc.title}")
                # sms.send(message, ["+254..."])

    except Exception as e:
        print(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_reminder_scheduler():
    scheduler = BackgroundScheduler()
    # Runs every day at 8:00 AM
    scheduler.add_job(check_expiring_permits, 'cron', hour=8, minute=0)
    scheduler.start()
    print("⏰ Daily Compliance Scheduler is active.")