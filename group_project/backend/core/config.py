import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Databases
    NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
    MONGODB_URL = os.getenv("MONGODB_URL")

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    ALGORITHM = "HS256"

    # Africa's Talking
    AT_USERNAME = os.getenv("AT_USERNAME", "sandbox")
    AT_API_KEY = os.getenv("AT_API_KEY")

    # Email (Gmail SMTP)
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 465 
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") # App Password

    # AI (Featherless)
    FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")

    def __init__(self):
        # Fail-safe: Server won't start if critical keys are missing
        for key in ["NEON_DATABASE_URL", "MONGODB_URL", "AT_API_KEY"]:
            if not getattr(self, key):
                raise ValueError(f"CRITICAL ERROR: {key} is missing from .env")

settings = Settings()