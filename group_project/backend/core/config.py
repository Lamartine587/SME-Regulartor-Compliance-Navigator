import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # --- Databases ---
    NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
    MONGODB_URL = os.getenv("MONGODB_URL")

    # --- Security & JWT ---
    SECRET_KEY = os.getenv("SECRET_KEY", "your-default-dev-key-change-this")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

    # --- DevText SMS Gateway (Updated) ---
    DEVTEXT_API_KEY = os.getenv("DEVTEXT_API_KEY")
    DEVTEXT_BASE_URL = os.getenv("DEVTEXT_BASE_URL", "https://devtext.site/api/v1/send")

    # --- Email (Gmail SMTP) ---
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 465 

    # --- AI Engine (Featherless) ---
    FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")
    # Added: Allows you to swap models (e.g., Llama-3.1-70B to 8B) from .env
    AI_MODEL_NAME = os.getenv("AI_MODEL_NAME", "meta-llama/Llama-3.1-70B-Instruct")

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

    def __init__(self):
        """
        Fail-safe Gatekeeper: Ensures the backend won't start if 
        critical infrastructure keys are missing.
        """
        critical_keys = [
            "NEON_DATABASE_URL", 
            "MONGODB_URL", 
            "DEVTEXT_API_KEY",
            "FEATHERLESS_API_KEY"
        ]
        
        for key in critical_keys:
            if not getattr(self, key, None):
                # We raise a clear error to stop the server before it crashes in production
                raise ValueError(f"❌ CONFIG ERROR: {key} is missing from your .env file.")

# Instantiate the settings to be used across the app
settings = Settings()