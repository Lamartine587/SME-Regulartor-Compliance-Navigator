from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from db.neon_session import get_db
from core.deps import get_current_user
from schemas.knowledge_schema import BusinessProfile, ComplianceItem, ComplianceReport
from services import knowledge_service

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])

@router.get("/industries")
def industries():
    """Returns a list of all supported business categories."""
    return {"industries": knowledge_service.get_industries()}

@router.get("/counties")
def counties():
    """Returns supported Kenyan counties (Nairobi, Kakamega, etc.)."""
    return {"counties": knowledge_service.get_counties()}

@router.get("/items", response_model=List[ComplianceItem])
def list_items():
    """Exposes the full compliance database."""
    return knowledge_service.list_compliance_items()

@router.get("/item/{item_id}", response_model=ComplianceItem)
def get_item(item_id: str):
    item = knowledge_service.get_compliance_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Compliance item not found")
    return item

@router.get("/search")
def search(q: str):
    results = knowledge_service.search_items(q)
    return {"results": results, "count": len(results)}

# --- THE LIVE INTELLIGENCE ENDPOINT ---

@router.post("/compliance/check", response_model=ComplianceReport)
def check_compliance(
    profile: BusinessProfile, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    The Core Intelligence Endpoint:
    Performs a real-time audit by comparing required documents against 
    the user's actual 'Active' documents in the Vault.
    """
    try:
        # Call the live audit logic from the service
        # This replaces the mock scoring with a mechanical count of verified docs.
        report = knowledge_service.get_live_compliance_report(
            db=db, 
            user_id=current_user.id, 
            profile=profile
        )
        return report
        
    except Exception as e:
        # Standard fallback if the audit fails
        raise HTTPException(status_code=500, detail=f"Compliance audit failed: {str(e)}")