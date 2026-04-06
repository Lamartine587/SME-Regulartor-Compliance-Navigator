from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import settings
from core.security import get_current_user
from models.user_model import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client["SMERegulator"]

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )
    return current_user

@router.get("/errors")
async def get_error_logs(
    limit: int = 50, 
    skip: int = 0,
    admin_user: User = Depends(get_current_admin_user)
):
    cursor = mongo_db.api_errors.find().sort("timestamp", -1).skip(skip).limit(limit)
    errors = await cursor.to_list(length=limit)
    
    for error in errors:
        error["_id"] = str(error["_id"])
        
    return errors

@router.delete("/errors")
async def clear_error_logs(
    admin_user: User = Depends(get_current_admin_user)
):
    await mongo_db.api_errors.delete_many({})
    return {"message": "Error logs cleared successfully."}


@router.get("/test-error")
async def trigger_test_error():
    """Temporary endpoint to test the error logging system."""
    # This will cause a Python ZeroDivisionError (500 Server Error)
    # and should generate a nice, juicy traceback for your database.
    return 1 / 0