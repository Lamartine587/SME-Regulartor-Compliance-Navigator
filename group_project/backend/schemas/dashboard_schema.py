from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class UpcomingExpiry(BaseModel):
    id: int
    title: str
    document_type: str
    expiry_date: Optional[date]
    days_remaining: Optional[int]

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    compliance_score: float
    total_required_documents: int
    total_active_documents: int
    total_expired_or_missing: int
    upcoming_expiries: List[UpcomingExpiry]

