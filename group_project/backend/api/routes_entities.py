# api/routes_entities.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.neon_session import get_db
from models.document_model import ComplianceDocument
from core.deps import get_current_user

router = APIRouter(prefix="/entities", tags=["Vendors & Authorities"])

@router.get("/")
async def list_all_entities(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Returns a unique list of all Vendors, Suppliers, and Government Authorities."""
    entities = db.query(ComplianceDocument.issuing_authority, func.count(ComplianceDocument.id).label('doc_count')).\
        filter(ComplianceDocument.user_id == current_user.id).\
        group_by(ComplianceDocument.issuing_authority).all()
        
    return [{"name": e[0], "document_count": e[1]} for e in entities if e[0]]

@router.get("/{entity_name}/documents")
async def get_entity_documents(entity_name: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """E.g., Show me every invoice and delivery note from 'Hardware Store X'"""
    docs = db.query(ComplianceDocument).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.issuing_authority == entity_name
    ).all()
    
    return {"entity": entity_name, "documents": docs}