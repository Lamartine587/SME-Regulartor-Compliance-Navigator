from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from db.neon_session import Base


class ComplianceDocument(Base):
    """
    Represents a regulatory document stored in the Secure Document Vault.
    Each document belongs to a specific user and has metadata used by
    the Dashboard and Tracking & Reminder Engine.
    """

    __tablename__ = "compliance_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # e.g. SINGLE_BUSINESS_PERMIT, KRA_COMPLIANCE
    issuing_authority = Column(String, nullable=True)

    file_path = Column(String, nullable=False)  # Relative path on disk or object storage key

    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

