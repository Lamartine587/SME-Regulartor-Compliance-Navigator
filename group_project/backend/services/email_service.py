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
    msg['Subject'] = 'Action Required: Verify Your Anga Systems Account'
    msg['From'] = SENDER_EMAIL
    msg['To'] = target_email

    # 1. Plain Text Fallback (Required for spam filters and older clients)
    msg.set_content(
        f"Welcome to the Anga Systems SME Portal!\n\n"
        f"Your verification code is: {otp_code}\n\n"
        f"This code will expire in 5 minutes."
    )

    # 2. The HTML Version (This is what most users will see)
    html_content = f"""\
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }}
            .header {{ background-color: #0d47a1; color: #ffffff; padding: 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; letter-spacing: 1px; }}
            .content {{ padding: 30px; color: #333333; line-height: 1.6; }}
            .otp-box {{ background-color: #f0f4f8; border: 2px dashed #0d47a1; padding: 20px; text-align: center; margin: 25px 0; border-radius: 6px; }}
            .otp-code {{ font-size: 36px; font-weight: bold; color: #0d47a1; letter-spacing: 8px; }}
            .warning {{ font-size: 13px; color: #d32f2f; margin-top: 20px; }}
            .footer {{ background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #dddddd; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Anga Systems SME Portal</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering. To securely access your account, please use the verification code below:</p>

                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                </div>

                <p>This code is valid for the next <strong>5 minutes</strong>.</p>
                <p class="warning">If you did not request this verification, please ignore this email and ensure your account password is secure.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 Anga Systems. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Attach the HTML content to the email
    msg.add_alternative(html_content, subtype='html')

    try:
        # Port 465 uses implicit SSL
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SENDER_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)
        # Port 587 uses explicit TLS
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SENDER_EMAIL, SMTP_PASSWORD)
                server.send_message(msg)

        return {"status": "success"}

    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"status": "error", "details": str(e)}