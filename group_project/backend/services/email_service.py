import smtplib
from email.message import EmailMessage
import os

# Load credentials from the .env file
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Default to 587 if not found
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_email_otp(target_email: str, otp_code: str):
    """
    Sends a 6-digit OTP via Email with a styled HTML template.
    """
    msg = EmailMessage()
    msg['Subject'] = 'Your Security Code for SME Navigator'
    
    # This formats the sender so it displays "SME Navigator" instead of the raw email address
    msg['From'] = f"SME Navigator <{SENDER_EMAIL}>"
    msg['To'] = target_email

    # 1. Plain Text Fallback (Required for spam filters and older clients)
    msg.set_content(
        f"Welcome to the SME Regulatory Compliance Navigator!\n\n"
        f"Your verification code is: {otp_code}\n\n"
        f"This code will expire in 5 minutes."
    )

    # 2. The HTML Version (Modern SaaS Styling)
    html_content = f"""\
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }}
            .content {{ padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }}
            .otp-box {{ background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 24px; text-align: center; margin: 24px 0; border-radius: 8px; }}
            .otp-code {{ font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 8px; }}
            .warning {{ font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
            .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SME Compliance Navigator</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering. To securely access your account, please enter the verification code below:</p>

                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                </div>

                <p>This code is valid for the next <strong>5 minutes</strong>.</p>
                <p class="warning">If you did not request this verification, please ignore this email and ensure your account password is secure.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 SME Compliance Navigator. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg.add_alternative(html_content, subtype='html')

    return _send_via_smtp(msg)


def send_email_alert(target_email: str, subject: str, message_body: str):
    """
    Sends a Compliance Alert (Reminder/Expiry) with a styled HTML template.
    Called automatically by the background scheduler.
    """
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"SME Compliance Alerts <{SENDER_EMAIL}>"
    msg['To'] = target_email

    # Plain text fallback
    msg.set_content(f"SME Navigator Alert\n\n{message_body}\n\nPlease log in to your dashboard to view details.")

    # HTML Version tailored for system alerts
    html_content = f"""\
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #4f46e5; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }}
            .content {{ padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }}
            .alert-box {{ background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px; color: #92400e; font-weight: 500; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 16px; text-align: center; }}
            .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SME Compliance Alert</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>This is an automated system notification regarding your business compliance documents.</p>

                <div class="alert-box">
                    {message_body}
                </div>

                <p>Please log in to your dashboard to review your documents and take the necessary actions to remain compliant.</p>
                
                <div style="text-align: center;">
                    <a href="http://localhost:5173/dashboard" class="btn">View Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2026 SME Compliance Navigator. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg.add_alternative(html_content, subtype='html')

    return _send_via_smtp(msg)


def _send_via_smtp(msg: EmailMessage):
    """
    Internal helper function to prevent repeating the SMTP connection code.
    """
    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SENDER_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SENDER_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)

        return {"status": "success"}

    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"status": "error", "details": str(e)}