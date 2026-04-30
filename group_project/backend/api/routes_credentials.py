# api/routes_credentials.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.neon_session import get_db
from models.document_model import ComplianceDocument
from core.deps import get_current_user

router = APIRouter(prefix="/credentials", tags=["Personal Credentials"])

@router.get("/personal")
async def get_personal_credentials(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Fetch ID cards, Driver's Licenses, TSC Numbers, etc."""
    creds = db.query(ComplianceDocument).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.category == "personal"
    ).all()
    
    return {"data": creds}

@router.post("/{doc_id}/verify")
async def trigger_credential_verification(doc_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Placeholder for future API integrations (e.g., eCitizen or NTSA background checks)"""
    doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id, ComplianceDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Credential not found")
        
    # Later: Call external API here
    doc.status = "Verified"
    db.commit()
    
    return {"message": f"{doc.title} marked as verified."}