from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.neon_session import get_neon_db
# Make sure to import your new PersonalProfile model
from models.user_model import BusinessProfile, PersonalProfile, User 
from schemas.profile_schema import ProfileUpdate, ProfileResponse
from core.security import get_current_user 

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    # 1. Fetch or Create Business Profile
    bus_profile = neon_db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not bus_profile:
        bus_profile = BusinessProfile(user_id=current_user.id)
        neon_db.add(bus_profile)

    # 2. Fetch or Create Personal Profile
    pers_profile = neon_db.query(PersonalProfile).filter(PersonalProfile.user_id == current_user.id).first()
    if not pers_profile:
        pers_profile = PersonalProfile(user_id=current_user.id)
        neon_db.add(pers_profile)

    if not bus_profile.id or not pers_profile.id:
        neon_db.commit()
        neon_db.refresh(bus_profile)
        neon_db.refresh(pers_profile)
        
    return {
        "id": current_user.id,
        "email": current_user.email,
        "phone": current_user.phone,
        "is_phone_verified": current_user.is_phone_verified,
        "role": current_user.role, 
        "personal": {
            "first_name": bus_profile.first_name, # Assuming these were on the business profile previously
            "last_name": bus_profile.last_name,
            "national_id": pers_profile.national_id,
            "personal_kra_pin": pers_profile.personal_kra_pin,
            "date_of_birth": pers_profile.date_of_birth,
            "profession": pers_profile.profession
        },
        "business": {
            "business_name": bus_profile.business_name,
            "registration_number": bus_profile.registration_number,
            "industry": bus_profile.industry,
            "county_location": bus_profile.county_location,
            "role_title": bus_profile.role_title
        }
    }

@router.put("/", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    bus_profile = neon_db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    pers_profile = neon_db.query(PersonalProfile).filter(PersonalProfile.user_id == current_user.id).first()
    
    if not bus_profile or not pers_profile:
        raise HTTPException(status_code=404, detail="Profile records not found. Please GET /profile first.")

    # 1. Update Core User (Phone)
    if payload.phone and payload.phone != current_user.phone:
        existing_phone = neon_db.query(User).filter(User.phone == payload.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already in use.")
        current_user.phone = payload.phone
        current_user.is_phone_verified = False 

    # 2. Update Business Profile
    if payload.business:
        bus_data = payload.business.dict(exclude_unset=True)
        for key, value in bus_data.items():
            setattr(bus_profile, key, value)

    # 3. Update Personal Profile
    if payload.personal:
        pers_data = payload.personal.dict(exclude_unset=True)
        for key, value in pers_data.items():
            # If you are migrating first_name/last_name to personal, handle it here
            if key in ["first_name", "last_name"] and hasattr(bus_profile, key):
                setattr(bus_profile, key, value) # Keeping it on business table for backwards compatibility
            elif hasattr(pers_profile, key):
                setattr(pers_profile, key, value)

    neon_db.commit()
    
    # Return via the GET method logic to ensure formatted payload
    return await get_profile(current_user, neon_db)