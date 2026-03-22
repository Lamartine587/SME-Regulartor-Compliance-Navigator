import os
from pathlib import Path
from typing import List
from datetime import date

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form, BackgroundTasks
from sqlalchemy.orm import Session

from core.deps import get_current_user
from db.neon_session import get_neon_db
from models.document_model import ComplianceDocument
from schemas.document_schema import DocumentResponse

# Import the new Engine
from core.compliance_engine import ComplianceEngine

router = APIRouter(prefix="/api/vault", tags=["Document Vault"])

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post(
    "/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    background_tasks: BackgroundTasks, # Added for AI processing
    title: str = Form(...),
    document_type: str = Form(...),
    issuing_authority: str | None = Form(default=None),
    issue_date: str | None = Form(default=None),
    expiry_date: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_neon_db),
    current_user=Depends(get_current_user),
):
    # 1. Save file to disk
    safe_filename = f"user_{current_user.id}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    with file_path.open("wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # 2. Parse manual dates if provided
    parsed_issue_date = None
    parsed_expiry_date = None

    if issue_date:
        try:
            parsed_issue_date = date.fromisoformat(issue_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid issue_date format. Use YYYY-MM-DD.")

    if expiry_date:
        try:
            parsed_expiry_date = date.fromisoformat(expiry_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expiry_date format. Use YYYY-MM-DD.")

    # 3. Create initial SQL record in Neon
    document = ComplianceDocument(
        user_id=current_user.id,
        title=title,
        document_type=document_type,
        issuing_authority=issuing_authority,
        file_path=str(file_path.relative_to(BASE_DIR)),
        issue_date=parsed_issue_date,
        expiry_date=parsed_expiry_date,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # 4. 🚀 TRIGGER THE AI COMPLIANCE ENGINE
    # This runs in the background so the user doesn't have to wait.
    # It will extract data, update the Dashboard (SQL), and store metadata (Mongo).
    background_tasks.add_task(
        ComplianceEngine.process_new_upload,
        document.id,
        db,
        current_user.email,
        # Pass the phone number for SMS notifications
        getattr(current_user, "phone_number", None) 
    )

    return document

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_neon_db),
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
    db: Session = Depends(get_neon_db),
    current_user=Depends(get_current_user),
):
    document = db.query(ComplianceDocument).filter(
        ComplianceDocument.id == document_id,
        ComplianceDocument.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document