# schemas/profile_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class BusinessProfileBase(BaseModel):
    business_name: Optional[str] = None
    registration_number: Optional[str] = None
    industry: Optional[str] = None
    county_location: Optional[str] = None
    role_title: Optional[str] = None

class PersonalProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    national_id: Optional[str] = None
    personal_kra_pin: Optional[str] = None
    date_of_birth: Optional[date] = None
    profession: Optional[str] = None

class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    business: Optional[BusinessProfileBase] = None
    personal: Optional[PersonalProfileBase] = None

class ProfileResponse(BaseModel):
    id: int
    email: str
    phone: Optional[str]
    is_phone_verified: bool
    role: str
    personal: PersonalProfileBase
    business: BusinessProfileBase