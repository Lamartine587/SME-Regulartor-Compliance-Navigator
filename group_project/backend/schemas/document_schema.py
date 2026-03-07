from datetime import date
from typing import Optional

from pydantic import BaseModel


class DocumentBase(BaseModel):
    title: str
    document_type: str
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    file_path: str

    class Config:
        orm_mode = True

