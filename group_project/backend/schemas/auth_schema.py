from enum import Enum
from pydantic import BaseModel, EmailStr, constr

class VerificationType(str, Enum):
    REGISTRATION = "registration"
    PASSWORD_RESET = "password_reset"

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
    verification_type: VerificationType 

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str = "customer"

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: constr(min_length=8)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str