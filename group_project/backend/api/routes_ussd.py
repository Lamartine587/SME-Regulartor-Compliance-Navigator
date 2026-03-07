from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.orm import Session

from db.neon_session import get_neon_db
from db.mongo_session import get_mongo_db
from services import auth_service

router = APIRouter(tags=["USSD Gateway"])


@router.post("/api/ussd/")
@router.post("/api/ussd")
async def ussd_callback(
        request: Request,
        neon_db: Session = Depends(get_neon_db),
        mongo_db=Depends(get_mongo_db)
):
    # AT sends data as Form Data
    form_data = await request.form()

    session_id = form_data.get("sessionId")
    service_code = form_data.get("serviceCode")
    phone_number = form_data.get("phoneNumber")  # e.g., +254797428075
    text = form_data.get("text", "")

    # 1. User dials the shortcode (Empty text)
    if text == "":
        response_text = "CON Welcome to Anga Systems SME Portal.\nPlease enter your 6-digit OTP:"

    # 2. User enters the 6-digit OTP
    elif len(text) == 6 and text.isdigit():

        # Step A: Find the user in NeonDB (PostgreSQL) using the phone number they dialed from
        user = auth_service.get_user_by_phone(neon_db, phone_number)

        if not user:
            response_text = "END Phone number not registered. Please sign up on the web portal first."
        else:
            # Step B: Find their OTP record in MongoDB Atlas
            record = await mongo_db.otps.find_one({"user_id": user.id})

            if not record:
                response_text = "END OTP expired or invalid. Please request a new one."

            # Step C: Check if the OTP matches
            elif text == record.get('sms_otp'):
                # Step D: Update their verification status in NeonDB!
                auth_service.update_verification_status(neon_db, user.id, "sms")
                response_text = "END Verification successful!\nYour SME account is now fully active."
            else:
                response_text = "END Incorrect OTP. Please try again."

    # 3. User entered gibberish
    else:
        response_text = "END Invalid input. Please enter the 6-digit code we sent you."

    return Response(content=response_text, media_type="text/plain")