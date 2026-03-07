from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: constr(min_length=8) # Forces users to have strong passwords

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    user_id: int
    otp_code: str
    verification_type: str # Must be either "email" or "sms"

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str