import requests
import os
from dotenv import load_dotenv

load_dotenv()

def send_sms_otp(phone_number: str, otp: str):
    """
    Integrates with the DevText API to send verification codes.
    """
    api_key = os.getenv("DEVTEXT_API_KEY")
    url = os.getenv("DEVTEXT_BASE_URL")
    sender_id = os.getenv("DEVTEXT_SENDER_ID")

    # 1. Format the phone number (DevText likely requires international format)
    if phone_number.startswith("0"):
        formatted_phone = "254" + phone_number[1:]
    elif phone_number.startswith("+"):
        formatted_phone = phone_number[1:]
    else:
        formatted_phone = phone_number

    # 2. Build the Payload (Verify these keys from devtext.site/api-docs)
    # Common keys: 'api_key', 'to', 'message', 'from'
    payload = {
        "api_key": api_key,
        "to": formatted_phone,
        "message": f"Your SME Navigator code is: {otp}. Valid for 5 minutes.",
        "from": sender_id
    }

    try:
        # 3. Make the POST request
        response = requests.post(url, json=payload, timeout=10)
        
        # Log the response to your terminal so you can debug
        print(f"📡 DevText Response: {response.status_code} - {response.text}")
        
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"❌ DevText Error: {response.text}")
            return False

    except Exception as e:
        print(f"🚨 Connection to DevText failed: {str(e)}")
        return False