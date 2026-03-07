from typing import List, Optional

from pydantic import BaseModel


class BusinessProfile(BaseModel):
    business_name: str
    industry: str
    employee_count: int
    annual_turnover_kes: float
    years_in_operation: int
    county: str


class ComplianceItem(BaseModel):
    id: str
    title: str
    description: str
    authority: str
    deadline: Optional[str] = None
    penalty: str
    status: str  # required | optional | conditional
    category: str
    priority: str  # high | medium | low
    steps: List[str]
    links: List[str]


class ComplianceReport(BaseModel):
    business_name: str
    industry: str
    total_requirements: int
    high_priority: int
    compliance_score: int
    items: List[ComplianceItem]
    upcoming_deadlines: List[dict]

