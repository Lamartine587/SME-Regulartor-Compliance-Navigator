from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: constr(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    user_id: int
    otp_code: str
    verification_type: str 

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int  # <-- This prevents the 422 on login

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str