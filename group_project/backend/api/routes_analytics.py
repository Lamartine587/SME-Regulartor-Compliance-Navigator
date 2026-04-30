import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict

from db.neon_session import get_neon_db
from models.document_model import ComplianceDocument
from core.deps import get_current_user
from core.compliance_engine import mongo_db

router = APIRouter(prefix="/api/analytics", tags=["Financial & Compliance Analytics"])

@router.get("/summary")
async def get_financial_analytics(
    db: Session = Depends(get_neon_db), 
    current_user = Depends(get_current_user)
):
    """
    Calculates total Paid vs Owed balances and retrieves itemized data from MongoDB.
    """
    today = datetime.now().date()
    thirty_days = today + timedelta(days=30)
    
    # 1. FINANCIAL CALCULATIONS (Paid vs Owed)
    # We aggregate based on the 'status' and 'financial_amount' columns in Neon
    financial_stats = db.query(
        func.sum(ComplianceDocument.financial_amount).filter(
            ComplianceDocument.status == "Paid"
        ).label("total_paid"),
        func.sum(ComplianceDocument.financial_amount).filter(
            ComplianceDocument.status != "Paid"
        ).label("total_owed")
    ).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.category == "transaction"
    ).first()

    total_paid = financial_stats.total_paid or 0.0
    total_owed = financial_stats.total_owed or 0.0

    # 2. COMPLIANCE TRACKING
    # Counts documents in business/personal categories expiring within 30 days
    critical_renewals = db.query(ComplianceDocument).filter(
        ComplianceDocument.user_id == current_user.id,
        ComplianceDocument.category.in_(["business", "personal"]),
        ComplianceDocument.expiry_date.between(today, thirty_days)
    ).count()

    # 3. ITEM-LEVEL DATA (MongoDB)
    # Fetch recent itemized extractions stored by the AI Compliance Engine
    mongo_cursor = mongo_db.document_meta.find(
        {"user": current_user.email, "category": "transaction"},
        {"items": 1, "total_value": 1, "processed_at": 1}
    ).sort("processed_at", -1).limit(10)

    recent_items = []
    async for record in mongo_cursor:
        if "items" in record:
            for item in record["items"]:
                # Add metadata to each item for the frontend ledger
                recent_items.append({
                    "name": item.get("item_name"),
                    "qty": item.get("quantity"),
                    "unit_price": item.get("unit_price"),
                    "total": item.get("total_price"),
                    "date": record.get("processed_at")
                })

    return {
        "status": "success",
        "financials": {
            "paid": total_paid,
            "owed": total_owed,
            "total_liability": total_owed,
            "currency": "KES"
        },
        "compliance": {
            "upcoming_expiries": critical_renewals,
            "monitoring_period_days": 30
        },
        "ledger_details": {
            "recent_extracted_items": recent_items
        }
    }