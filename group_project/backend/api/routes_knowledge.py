from fastapi import APIRouter, HTTPException

from schemas.knowledge_schema import BusinessProfile, ComplianceItem, ComplianceReport
from services import knowledge_service


router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])


@router.get("/industries")
def industries():
    return {"industries": knowledge_service.get_industries()}


@router.get("/counties")
def counties():
    return {"counties": knowledge_service.get_counties()}


@router.get("/items", response_model=list[ComplianceItem])
def list_items():
    return knowledge_service.list_compliance_items()


@router.get("/item/{item_id}", response_model=ComplianceItem)
def get_item(item_id: str):
    item = knowledge_service.get_compliance_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Compliance item not found")
    return item


@router.get("/search")
def search(q: str):
    results = knowledge_service.search_items(q)
    return {"results": results, "count": len(results)}


@router.post("/compliance/check", response_model=ComplianceReport)
def check_compliance(profile: BusinessProfile):
    req_names = knowledge_service.requirements_for_industry(
        profile.industry, annual_turnover_kes=profile.annual_turnover_kes
    )

    industry_map, compliance_db, _ = knowledge_service.load_knowledge_base()
    _ = industry_map  # loaded for cache warm-up / validation

    items = [compliance_db[name] for name in req_names if name in compliance_db]
    high_priority = sum(1 for item in items if item.get("priority") == "high")

    # Same mock scoring concept as the original knowledge base (until user completion is tracked)
    compliance_score = max(20, 100 - (high_priority * 8))

    upcoming = [
        {
            "title": "Single Business Permit Renewal",
            "deadline": "March 31, 2026",
            "authority": "County Government",
            "days_left": 45,
        },
        {
            "title": "VAT Monthly Return",
            "deadline": "20th of every month",
            "authority": "KRA",
            "days_left": 12,
        },
        {
            "title": "NSSF Monthly Remittance",
            "deadline": "9th of every month",
            "authority": "NSSF",
            "days_left": 3,
        },
        {
            "title": "NHIF Monthly Remittance",
            "deadline": "9th of every month",
            "authority": "NHIF/SHA",
            "days_left": 3,
        },
    ]

    return ComplianceReport(
        business_name=profile.business_name,
        industry=profile.industry,
        total_requirements=len(items),
        high_priority=high_priority,
        compliance_score=compliance_score,
        items=items,
        upcoming_deadlines=upcoming,
    )

