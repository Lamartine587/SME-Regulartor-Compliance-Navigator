import random
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from schemas.auth_schema import (
    UserCreate, UserLogin, OTPVerify, Token, 
    ForgotPassword, ResetPassword
)
from services import auth_service
from services.sms_service import send_sms_otp
from services.email_service import send_email_otp
from core.security import verify_password, create_access_token, get_current_user 
from db.neon_session import get_neon_db
from db.mongo_session import get_mongo_db
from models.user_model import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user: UserCreate,
    neon_db: Session = Depends(get_neon_db),
    mongo_db=Depends(get_mongo_db)
):
    if auth_service.get_user_by_email(neon_db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if auth_service.get_user_by_phone(neon_db, user.phone):
        raise HTTPException(status_code=400, detail="Phone already registered")

    new_user = auth_service.create_user(neon_db, user)

    try:
        email_otp = str(random.randint(100000, 999999))
        sms_otp = str(random.randint(100000, 999999))

        await mongo_db.otps.insert_one({
            "user_id": new_user.id,
            "email_otp": email_otp,
            "sms_otp": sms_otp,
            "createdAt": datetime.now(timezone.utc)
        })

        send_email_otp(user.email, email_otp)
        send_sms_otp(user.phone, sms_otp)

        return {"message": "Registration successful. Please check SMS and Email.", "user_id": new_user.id}

    except Exception as e:
        neon_db.delete(new_user)
        neon_db.commit()
        print(f"❌ Registration Rollback: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again later.")

@router.post("/google", response_model=Token)
async def google_login(
    payload: GoogleLoginRequest,
    neon_db: Session = Depends(get_neon_db)
):
    try:
        id_info = id_token.verify_oauth2_token(
            payload.token, 
            google_requests.Request(), 
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = id_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account lacks email.")

        user = auth_service.get_user_by_email(neon_db, email)

        if not user:
            user = User(
                email=email,
                is_email_verified=True, 
                hashed_password=None,
                phone=None 
            )
            neon_db.add(user)
            neon_db.commit()
            neon_db.refresh(user)

        access_token = create_access_token(data={"sub": user.email, "id": user.id})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_id": user.id
        }

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token.")

@router.post("/verify-otp")
async def verify_otp(
    payload: OTPVerify,
    neon_db: Session = Depends(get_neon_db),
    mongo_db=Depends(get_mongo_db)
):
    record = await mongo_db.otps.find_one({"user_id": payload.user_id})
    if not record:
        raise HTTPException(status_code=400, detail="OTP expired or invalid.")

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
    user = auth_service.get_user_by_email(neon_db, user_credentials.email)
    if not user or not user.hashed_password or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email address.")

    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPassword,
    neon_db: Session = Depends(get_neon_db),
    mongo_db = Depends(get_mongo_db)
):
    user = auth_service.get_user_by_email(neon_db, payload.email)
    if not user:
        return {"message": "Reset code sent if email exists."}

    reset_otp = str(random.randint(100000, 999999))
    await mongo_db.password_resets.insert_one({
        "email": user.email,
        "reset_otp": reset_otp,
        "createdAt": datetime.now(timezone.utc)
    })

    send_email_otp(user.email, reset_otp) 
    return {"message": "Reset code sent if email exists."}

@router.post("/reset-password")
async def reset_password(
    payload: ResetPassword,
    neon_db: Session = Depends(get_neon_db),
    mongo_db = Depends(get_mongo_db)
):
    record = await mongo_db.password_resets.find_one(
        {"email": payload.email},
        sort=[("createdAt", -1)]
    )

    if not record or record.get('reset_otp') != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    user = auth_service.get_user_by_email(neon_db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    auth_service.update_password(neon_db, user.id, payload.new_password)
    await mongo_db.password_resets.delete_many({"email": payload.email})

    return {"message": "Password successfully reset."}


@router.post("/request-otp")
async def request_otp(
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db),
    mongo_db = Depends(get_mongo_db)
):
    if not current_user.phone:
        raise HTTPException(status_code=400, detail="No phone number found. Please update your profile first.")

    new_otp = str(random.randint(100000, 999999))

    await mongo_db.otps.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "sms_otp": new_otp,
            "createdAt": datetime.now(timezone.utc)
        }},
        upsert=True
    )

    try:
        send_sms_otp(current_user.phone, new_otp)
        return {"message": f"OTP sent successfully to {current_user.phone}"}
    except Exception as e:
        print(f"❌ SMS Gateway Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send SMS. Please try again later.")