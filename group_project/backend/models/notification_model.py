# backend/models/notification_model.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from db.neon_session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    document_type = Column(String, nullable=True)  # e.g., "KRA_PIN", "FIRE_SAFETY"
    
    # These match your React frontend exactly
    expiry_date = Column(String, nullable=True) 
    days_remaining = Column(Integer, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))