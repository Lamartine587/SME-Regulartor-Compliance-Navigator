from datetime import date
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import get_current_user
from db.neon_session import get_neon_db
from models.document_model import ComplianceDocument
from schemas.dashboard_schema import DashboardSummary, UpcomingExpiry


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


REQUIRED_DOCUMENT_TYPES: List[str] = [
    "SINGLE_BUSINESS_PERMIT",
    "KRA_COMPLIANCE_CERTIFICATE",
    "PUBLIC_HEALTH_LICENSE",
    "FIRE_SAFETY_CLEARANCE",
]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_neon_db),
    current_user=Depends(get_current_user),
):
    today = date.today()

    documents: List[ComplianceDocument] = (
        db.query(ComplianceDocument)
        .filter(ComplianceDocument.user_id == current_user.id)
        .all()
    )

    # Compute active (non-expired) documents per type
    active_types = set()
    total_active_documents = 0
    total_expired_or_missing = 0

    for doc in documents:
        if doc.expiry_date is None or doc.expiry_date >= today:
            total_active_documents += 1
            active_types.add(doc.document_type)
        else:
            total_expired_or_missing += 1

    # Count missing required types (where user has no active document of that type)
    for required in REQUIRED_DOCUMENT_TYPES:
        if required not in active_types:
            total_expired_or_missing += 1

    total_required = len(REQUIRED_DOCUMENT_TYPES)

    if total_required == 0:
        compliance_score = 100.0
    else:
        # Compliance is based on how many required document types are currently active
        active_required = sum(1 for t in REQUIRED_DOCUMENT_TYPES if t in active_types)
        compliance_score = round((active_required / total_required) * 100, 2)

    # Build upcoming expiries list (next 90 days)
    upcoming_items: List[UpcomingExpiry] = []
    for doc in documents:
        if doc.expiry_date is None:
            continue

        days_remaining = (doc.expiry_date - today).days
        if 0 <= days_remaining <= 90:
            upcoming_items.append(
                UpcomingExpiry(
                    id=doc.id,
                    title=doc.title,
                    document_type=doc.document_type,
                    expiry_date=doc.expiry_date,
                    days_remaining=days_remaining,
                )
            )

    # Sort upcoming expiries by soonest expiry
    upcoming_items.sort(key=lambda x: (x.days_remaining or 0))

    return DashboardSummary(
        compliance_score=compliance_score,
        total_required_documents=total_required,
        total_active_documents=total_active_documents,
        total_expired_or_missing=total_expired_or_missing,
        upcoming_expiries=upcoming_items,
    )

