from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.neon_session import get_neon_db
from models.user_model import BusinessProfile, User
from schemas.profile_schema import ProfileUpdate, ProfileResponse
from core.security import get_current_user 

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    profile = neon_db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    
    if not profile:
        profile = BusinessProfile(user_id=current_user.id)
        neon_db.add(profile)
        neon_db.commit()
        neon_db.refresh(profile)
        
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "email": current_user.email, # Added: Pulled from User table
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "role_title": profile.role_title,
        "business_name": profile.business_name,
        "registration_number": profile.registration_number,
        "industry": profile.industry,
        "county_location": profile.county_location,
        "updated_at": profile.updated_at,
        "phone": current_user.phone,
        "is_phone_verified": current_user.is_phone_verified 
    }

@router.put("/", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    profile = neon_db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.phone and payload.phone != current_user.phone:
        existing_phone = neon_db.query(User).filter(User.phone == payload.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already in use.")
        
        current_user.phone = payload.phone
        current_user.is_phone_verified = False 

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        # Security: email is never allowed to be updated here
        if hasattr(profile, key) and key not in ["phone", "email"]: 
            setattr(profile, key, value)

    neon_db.commit()
    neon_db.refresh(profile)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "email": current_user.email, # Return the same email
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "role_title": profile.role_title,
        "business_name": profile.business_name,
        "registration_number": profile.registration_number,
        "industry": profile.industry,
        "county_location": profile.county_location,
        "updated_at": profile.updated_at,
        "phone": current_user.phone,
        "is_phone_verified": current_user.is_phone_verified
    }