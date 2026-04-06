import traceback
import asyncio
from datetime import datetime, timezone
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from core.config import settings
from db.neon_session import engine
from models.user_model import User

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

def get_error_level(status_code: int) -> str:
    if status_code >= 500: return "CRITICAL (Server Crash)"
    if status_code in [401, 403]: return "SECURITY (Auth Failure)"
    if status_code >= 400: return "WARNING (Client Bad Request)"
    return "INFO"

async def send_admin_email_alert(endpoint: str, status_code: int, error_detail: str, error_level: str):
    try:
        with Session(engine) as db:
            admins = db.query(User).filter(User.role == "admin").all()
            admin_emails = [admin.email for admin in admins if admin.email]

        if not admin_emails:
            return

        # Dynamic color based on severity
        header_color = "#e11d48" if "CRITICAL" in error_level else "#d97706" if "SECURITY" in error_level else "#475569"
        bg_color = "#fef2f2" if "CRITICAL" in error_level else "#fffbeb" if "SECURITY" in error_level else "#f8fafc"

        html_body = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: {bg_color};">
            <h2 style="color: {header_color}; margin-top: 0;">🚨 System Alert: {error_level}</h2>
            <p><b>Status Code:</b> <span style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-weight: 900; color: #1e293b;">{status_code}</span></p>
            <p><b>Endpoint:</b> <code style="color: #4f46e5;">{endpoint}</code></p>
            <p><b>Error Detail:</b></p>
            <pre style="background-color: #1e293b; color: #f87171; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px;">{error_detail}</pre>
            <p style="margin-top: 20px;">
                <a href="http://localhost:3000/admin/errors" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View in Admin Monitor
                </a>
            </p>
        </div>
        """

        message = MessageSchema(
            subject=f"[{error_level.split(' ')[0]}] SME System Alert: {status_code} on {endpoint}",
            recipients=admin_emails,
            body=html_body,
            subtype="html"
        )

        fm = FastMail(mail_conf)
        await fm.send_message(message)
        
    except Exception as e:
        print(f"Failed to send admin alert email: {e}")

async def log_api_error(request: Request, status_code: int, error_detail: str, trace: str = None):
    error_level = get_error_level(status_code)
    
    error_log = {
        "timestamp": datetime.now(timezone.utc),
        "method": request.method,
        "endpoint": request.url.path,
        "query_params": dict(request.query_params),
        "status_code": status_code,
        "error_level": error_level,
        "error_detail": error_detail,
        "traceback": trace,
        "client_ip": request.client.host if request.client else "Unknown"
    }
    
    await mongo_db.api_errors.insert_one(error_log)

    # REMOVED the >= 500 check. This now fires for EVERY logged error.
    asyncio.create_task(send_admin_email_alert(request.url.path, status_code, error_detail, error_level))

def setup_error_handlers(app):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        await log_api_error(request, exc.status_code, str(exc.detail))
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        trace = traceback.format_exc()
        await log_api_error(request, 500, str(exc), trace)
        return JSONResponse(
            status_code=500, 
            content={"detail": "An internal server error occurred. Admin has been notified."}
        )