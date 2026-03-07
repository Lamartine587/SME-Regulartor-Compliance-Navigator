import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from schemas.auth_schema import UserCreate, UserLogin, OTPVerify, Token
from services import auth_service
from services.sms_service import send_sms_otp
from services.email_service import send_email_otp
from core.security import verify_password, create_access_token
from db.neon_session import get_neon_db
from db.mongo_session import get_mongo_db
from schemas.auth_schema import ForgotPassword, ResetPassword

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
        user: UserCreate,
        neon_db: Session = Depends(get_neon_db),
        mongo_db=Depends(get_mongo_db)
):
    # 1. Check if user already exists
    if auth_service.get_user_by_email(neon_db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if auth_service.get_user_by_phone(neon_db, user.phone):
        raise HTTPException(status_code=400, detail="Phone already registered")

    # 2. Save core user data to NeonDB (PostgreSQL)
    new_user = auth_service.create_user(neon_db, user)

    # 3. Generate 6-digit OTPs
    email_otp = str(random.randint(100000, 999999))
    sms_otp = str(random.randint(100000, 999999))

    # 4. Save OTPs to MongoDB Atlas
    await mongo_db.otps.insert_one({
        "user_id": new_user.id,
        "email_otp": email_otp,
        "sms_otp": sms_otp,
        "createdAt": datetime.utcnow()
    })

    # 5. Send OTPs (With Debugging Logs!)
    print("\n--- ATTEMPTING TO SEND OTPs ---")

    print(f"Sending Email to: {user.email}")
    email_response = send_email_otp(user.email, email_otp)
    print(f"EMAIL RESPONSE: {email_response}")

    print(f"Sending SMS to: {user.phone}")
    sms_response = send_sms_otp(user.phone, sms_otp)
    print(f"AFRICA'S TALKING RESPONSE: {sms_response}")

    print("-------------------------------\n")

    return {"message": "Registration successful. Please check SMS and Email for OTPs.", "user_id": new_user.id}


@router.post("/verify-otp")
async def verify_otp(
        payload: OTPVerify,
        neon_db: Session = Depends(get_neon_db),
        mongo_db=Depends(get_mongo_db)
):
    # 1. Find OTP record in MongoDB Atlas
    record = await mongo_db.otps.find_one({"user_id": payload.user_id})
    if not record:
        raise HTTPException(status_code=400, detail="OTP expired or invalid. Please request a new one.")

    # 2. Validate the specific OTP type requested by the user
    if payload.verification_type == "sms" and payload.otp_code == record.get('sms_otp'):
        auth_service.update_verification_status(neon_db, payload.user_id, "sms")
        return {"message": "Phone number verified."}

    elif payload.verification_type == "email" and payload.otp_code == record.get('email_otp'):
        auth_service.update_verification_status(neon_db, payload.user_id, "email")
        return {"message": "Email address verified."}

    raise HTTPException(status_code=400, detail="Incorrect OTP.")


@router.post("/login", response_model=Token)
async def login(
        user_credentials: UserLogin,
        neon_db: Session = Depends(get_neon_db)
):
    # 1. Fetch user from NeonDB
    user = auth_service.get_user_by_email(neon_db, user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")

    # 2. Prevent login if not fully verified
    if not user.is_email_verified or not user.is_phone_verified:
        raise HTTPException(status_code=403, detail="Please verify both email and phone before logging in.")

    # 3. Issue JWT Token
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPassword,
    neon_db: Session = Depends(get_neon_db),
    mongo_db = Depends(get_mongo_db)
):
    # 1. Check if user exists
    user = auth_service.get_user_by_email(neon_db, payload.email)
    if not user:
        # We return a generic message for security (prevents email enumeration)
        return {"message": "If an account with that email exists, a reset code has been sent."}

    # 2. Generate Reset OTP
    reset_otp = str(random.randint(100000, 999999))

    # 3. Save to a dedicated MongoDB collection
    await mongo_db.password_resets.insert_one({
        "email": user.email,
        "reset_otp": reset_otp,
        "createdAt": datetime.utcnow()
    })

    # 4. Send Email
    print(f"--- ATTEMPTING TO SEND PASSWORD RESET OTP ---")
    print(f"Sending Email to: {user.email}")
    send_email_otp(user.email, reset_otp) # Reusing your existing email sender!
    print(f"---------------------------------------------")

    return {"message": "If an account with that email exists, a reset code has been sent."}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPassword,
    neon_db: Session = Depends(get_neon_db),
    mongo_db = Depends(get_mongo_db)
):
    # 1. Find the latest OTP sent to this email in MongoDB Atlas
    # The sort=[("createdAt", -1)] ensures we get the most recently generated code
    record = await mongo_db.password_resets.find_one(
        {"email": payload.email},
        sort=[("createdAt", -1)]
    )

    if not record or record.get('reset_otp') != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # 2. Find user in NeonDB
    user = auth_service.get_user_by_email(neon_db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # 3. Hash and update the new password
    auth_service.update_password(neon_db, user.id, payload.new_password)

    # 4. Delete the OTP from MongoDB so it can't be reused by a hacker
    await mongo_db.password_resets.delete_many({"email": payload.email})

    return {"message": "Password successfully reset. You can now log in."}