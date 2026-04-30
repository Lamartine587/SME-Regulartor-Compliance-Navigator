from datetime import date
from typing import Optional
from pydantic import BaseModel

class DocumentBase(BaseModel):
    title: str
    category: str  # <--- CRITICAL: Add this field here
    document_type: str
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    # If you want to show the total amount on the transaction page:
    financial_amount: Optional[float] = None 

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    file_path: str

    class Config:
        from_attributes = True