import os
import africastalking

# 1. Load credentials from the environment
AT_USERNAME = os.getenv("AT_USERNAME", "sandbox")
AT_API_KEY = os.getenv("AT_API_KEY")

# 2. Initialize the Africa's Talking SDK
africastalking.initialize(AT_USERNAME, AT_API_KEY)

# 3. Get the SMS service instance
sms = africastalking.SMS


def send_sms_otp(target_phone: str, otp_code: str):
    """
    Sends a 6-digit OTP via Africa's Talking.
    Example target_phone: '+254797428075'
    """
    message_body = f"Your verification code is: {otp_code}. It expires in 5 minutes."

    try:
        # Africa's Talking expects recipients as a list, even for a single number
        recipients = [target_phone]

        # Send the SMS
        # (The 'sender_id' parameter is omitted here so the Sandbox defaults handle the routing)
        response = sms.send(message_body, recipients)

        return {"status": "success", "data": response}

    except Exception as e:
        return {"status": "error", "details": str(e)}