from devsms import DevSMSClient
from core.config import settings

def send_sms_otp(phone_number: str, otp: str):
    # Initialize the client using the key from your settings
    client = DevSMSClient(api_key=settings.DEVTEXT_API_KEY)
    
    # 1. Format the phone number to +254 standard (Match the test format)
    if phone_number.startswith("0"):
        formatted_phone = "+254" + phone_number[1:]
    elif not phone_number.startswith("+"):
        formatted_phone = "+" + phone_number
    else:
        formatted_phone = phone_number

    # 2. Prepare the message
    message_text = f"Your SME Navigator code is: {otp}. Valid for 5 minutes."

    try:
        # 3. Use the SDK send method (Removed sender_id as it's not supported in v0.1.0)
        response = client.send(
            to=formatted_phone,
            message=message_text
        )
        
        # Log the response status to your Uvicorn terminal for tracking
        print(f"📡 DevSMS Status: {response.status}")
        
        # Returns True if status is "success", False otherwise
        return response.status == "success"

    except Exception as e:
        # Catch SDK-specific or connection errors
        print(f"🚨 DevSMS SDK Error: {str(e)}")
        return False