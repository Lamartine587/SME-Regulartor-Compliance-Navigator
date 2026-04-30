from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from db.neon_session import Base

class ComplianceDocument(Base):
    __tablename__ = "compliance_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_hash = Column(String, index=True, nullable=True) # For duplicate detection

    category = Column(String, default="business", index=True) 
    document_type = Column(String, default="unknown")

    issuing_authority = Column(String, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)

    financial_amount = Column(Float, nullable=True)
    status = Column(String, default="Active", index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())