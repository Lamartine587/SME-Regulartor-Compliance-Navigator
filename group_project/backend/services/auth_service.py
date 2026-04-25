from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.user_model import User
from schemas.auth_schema import UserCreate
from core.security import get_password_hash  # Use a single, consistent hashing function

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str) -> User | None:
    return db.query(User).filter(User.phone == phone).first()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_pw = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pw
    )
    
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        # Rolls back the transaction if a duplicate email/phone is inserted
        db.rollback()
        raise ValueError("User with this email or phone already exists.")

def update_verification_status(db: Session, user_id: int, verify_type: str) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        if verify_type == "email":
            user.is_email_verified = True
        elif verify_type == "sms":
            user.is_phone_verified = True
            
        db.commit()
        return True
    return False

def update_password(db: Session, user_id: int, new_password: str) -> User | None:
    """Hashes the new password and saves it to the database."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        db.refresh(user)
    return user