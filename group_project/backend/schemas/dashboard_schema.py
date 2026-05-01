from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class UpcomingExpiry(BaseModel):
    """
    Represents an individual document reaching its expiration.
    Used for the 'Critical Alerts' section of the dashboard.
    """
    id: int
    title: str = "Unspecified Document"
    document_type: str
    expiry_date: Optional[date]
    days_remaining: Optional[int] 

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    """
    The master data structure for the Dashboard's top-level stats cards.
    Calculated by comparing the Knowledge Base requirements against the Vault.
    """
    compliance_score: float 
    total_required_documents: int 
    total_active_documents: int 
    total_expired_or_missing: int 
    upcoming_expiries: List[UpcomingExpiry]