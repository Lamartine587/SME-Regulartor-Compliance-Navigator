import os
import hashlib
from pathlib import Path
from typing import List
from datetime import date

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form, BackgroundTasks
from sqlalchemy.orm import Session

from core.deps import get_current_user
from db.neon_session import get_db, SessionLocal
from models.document_model import ComplianceDocument
from schemas.document_schema import DocumentResponse
from core.compliance_engine import ComplianceEngine

router = APIRouter(prefix="/api/vault", tags=["Document Vault"])

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def calculate_file_hash(file: UploadFile):
    sha256_hash = hashlib.sha256()
    # Read in chunks to handle larger files efficiently
    for byte_block in iter(lambda: file.file.read(4096), b""):
        sha256_hash.update(byte_block)
    file.file.seek(0) 
    return sha256_hash.hexdigest()

async def safe_ai_processor(doc_id: int, user_email: str, phone: str):
    db = SessionLocal()
    try:
        await ComplianceEngine.process_new_upload(doc_id, db, user_email, phone)
    finally:
        db.close()

@router.post(
    "/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    category: str = Form(default="business"),
    document_type: str = Form(default="unknown"),
    issuing_authority: str | None = Form(default=None),
    issue_date: str | None = Form(default=None),
    expiry_date: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. Generate hash and check for duplicates
    file_signature = calculate_file_hash(file)
    
    existing_file = db.query(ComplianceDocument).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.file_hash == file_signature
    ).first()

    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duplicate detected: You already uploaded this file as '{existing_file.title}'."
        )

    # 2. Save file to disk
    safe_filename = f"user_{current_user.id}_{file_signature[:12]}_{file.filename.replace(' ', '_')}"
    file_path = UPLOAD_DIR / safe_filename

    with file_path.open("wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # 3. Parse dates
    parsed_issue_date = None
    parsed_expiry_date = None
    if issue_date:
        try: parsed_issue_date = date.fromisoformat(issue_date)
        except ValueError: raise HTTPException(status_code=400, detail="Invalid issue_date format.")
    if expiry_date:
        try: parsed_expiry_date = date.fromisoformat(expiry_date)
        except ValueError: raise HTTPException(status_code=400, detail="Invalid expiry_date format.")

    # 4. Save to Database
    document = ComplianceDocument(
        user_id=current_user.id,
        title=title,
        category=category,
        document_type=document_type,
        file_hash=file_signature,
        issuing_authority=issuing_authority,
        file_path=str(file_path.relative_to(BASE_DIR)),
        issue_date=parsed_issue_date,
        expiry_date=parsed_expiry_date,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    background_tasks.add_task(
        safe_ai_processor,
        doc_id=document.id,
        user_email=current_user.email,
        phone=current_user.phone
    )

    return document

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(ComplianceDocument)
        .filter(ComplianceDocument.user_id == current_user.id)
        .order_by(ComplianceDocument.created_at.desc())
        .all()
    )

@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = db.query(ComplianceDocument).filter(
        ComplianceDocument.id == document_id,
        ComplianceDocument.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = db.query(ComplianceDocument).filter(
        ComplianceDocument.id == document_id,
        ComplianceDocument.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Unauthorized or not found")

    try:
        full_file_path = BASE_DIR / document.file_path
        if full_file_path.exists():
            os.remove(full_file_path)
    except Exception as e:
        print(f"⚠️ File cleanup warning: {e}")

    db.delete(document)
    db.commit()
    return None