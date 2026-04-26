# backend/api/routes_notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from core.security import get_current_user
from db.neon_session import get_neon_db
from models.user_model import User
from models.notification_model import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# Schema for sending data to React
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    document_type: str | None
    expiry_date: str | None
    days_remaining: int | None
    is_read: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    """Fetches all notifications for the logged-in user, sorted by newest first."""
    notifications = neon_db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    neon_db: Session = Depends(get_neon_db)
):
    """Allows the frontend to mark an alert as read."""
    notification = neon_db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    neon_db.commit()
    return {"message": "Marked as read"}