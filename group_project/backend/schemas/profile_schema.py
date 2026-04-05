from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role_title: Optional[str] = None
    business_name: Optional[str] = None
    registration_number: Optional[str] = None
    industry: Optional[str] = None
    county_location: Optional[str] = None

class ProfileResponse(ProfileUpdate):
    id: int
    user_id: int
    email: str
    is_phone_verified: bool
    updated_at: datetime

    class Config:
        from_attributes = True