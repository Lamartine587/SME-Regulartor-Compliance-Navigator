from sqlalchemy.orm import Session
from models.user_model import User
from schemas.auth_schema import UserCreate
from core.security import hash_password
from core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(User).filter(User.phone == phone).first()

def create_user(db: Session, user: UserCreate):
    hashed_pw = hash_password(user.password)
    db_user = User(
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_verification_status(db: Session, user_id: int, verify_type: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        if verify_type == "email":
            user.is_email_verified = True
        elif verify_type == "sms":
            user.is_phone_verified = True
        db.commit()
        return True
    return False

def update_password(db: Session, user_id: int, new_password: str):
    """Hashes the new password and saves it to NeonDB."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        db.refresh(user)
    return user