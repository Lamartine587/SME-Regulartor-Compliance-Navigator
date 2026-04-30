# api/routes_transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from db.neon_session import get_db
from db.mongo_session import mongo_db
from models.document_model import ComplianceDocument
from models.user_model import User
from core.deps import get_current_user # Assuming you have a JWT dependency

router = APIRouter(prefix="/transactions", tags=["Transactions Layer"])

@router.get("/")
async def get_all_transactions(status: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch all financial and supply chain documents."""
    query = db.query(ComplianceDocument).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.category == "transaction"
    )
    
    if status:
        query = query.filter(ComplianceDocument.status == status)
        
    transactions = query.all()
    return {"data": transactions}

@router.get("/{doc_id}")
async def get_transaction_details(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch SQL data AND the flexible AI metadata from MongoDB."""
    # 1. Get structured data from NeonDB
    doc = db.query(ComplianceDocument).filter(
        ComplianceDocument.id == doc_id, 
        ComplianceDocument.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # 2. Get the AI extracted metadata from MongoDB
    meta = await mongo_db.document_meta.find_one({"neon_id": doc_id}, {"_id": 0})

    return {
        "core_data": doc,
        "metadata": meta or {"ai_summary": "No AI metadata found."}
    }

@router.put("/{doc_id}/status")
async def update_transaction_status(doc_id: int, new_status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """E.g., Mark an invoice as 'Paid'"""
    doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id, ComplianceDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
        
    doc.status = new_status
    db.commit()
    return {"message": f"Status updated to {new_status}"}