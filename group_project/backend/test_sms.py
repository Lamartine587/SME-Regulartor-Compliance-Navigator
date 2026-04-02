from devsms import DevSMSClient

# Configuration
API_KEY = "dsk_live_2ed8cd3d77c5dcc273bd18c70d43edd63c1e3c0f81d4ff55"
PHONE = "+254797428075"
MESSAGE = "SDK Test: Hello! This works perfectly without a sender ID."

if PHONE.startswith("0"):
    FORMATTED_PHONE = "+254" + PHONE[1:]
elif not PHONE.startswith("+"):
    FORMATTED_PHONE = "+" + PHONE
else:
    FORMATTED_PHONE = PHONE

client = DevSMSClient(api_key=API_KEY)

try:
    response = client.send(
        to=FORMATTED_PHONE,
        message=MESSAGE
    )

    print(f"📡 API Status: {response.status}")
    
    if response.status == "success":
        print("✅ Success! The SDK is now communicating correctly.")
    else:
        error_info = getattr(response, 'message', 'Check API Key/Balance')
        print(f"❌ Failed: {error_info}")

except Exception as e:
    print(f"🚨 SDK Error: {str(e)}")