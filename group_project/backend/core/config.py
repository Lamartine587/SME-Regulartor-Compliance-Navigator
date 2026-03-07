# backend/app/core/config.py
import os
from dotenv import load_dotenv

# Load the variables from the .env file
load_dotenv()

class Settings:
    NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
    # If the URL is missing, throw an error immediately so the server doesn't crash silently later
    if not NEON_DATABASE_URL:
        raise ValueError("NEON_DATABASE_URL is missing from the .env file!")

settings = Settings()