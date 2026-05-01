import ast
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional
from datetime import datetime, date

from sqlalchemy.orm import Session
from models.document_model import ComplianceDocument
from schemas.knowledge_schema import BusinessProfile, ComplianceReport, DeadlineItem, ComplianceItem as SchemaItem

KB_SOURCE_FILE = Path(__file__).resolve()
logger = logging.getLogger("KnowledgeService")

def ComplianceItem(id, title, authority, penalty, status, category, priority, description="Regulatory requirement", steps=None, links=None, county=None):
    return {
        "id": id, "title": title, "authority": authority, "penalty": penalty,
        "status": status, "category": category, "priority": priority,
        "description": description, "steps": steps or [], "links": links or [], "county": county
    }

COUNTIES = ["Nairobi", "Kakamega", "Kisumu", "Mombasa"]

INDUSTRY_MAP = {
    "retail_kiosk": ["KRA-PIN-01", "KK-SBP-01", "NRB-SBP-01"],
    "hardware_store": ["KRA-PIN-01", "KK-SBP-02", "NRB-SBP-05", "FIRE-01", "WM-01"],
    "general_trade": ["KRA-PIN-01", "NRB-SBP-01"],
    "pharmacy": ["KRA-PIN-01", "PPB-01", "NRB-SBP-05"],
    "logistics": ["KRA-PIN-01", "NTSA-01", "NRB-SBP-05"]
}

COMPLIANCE_DB = {
    "KRA-PIN-01": ComplianceItem(id="KRA-PIN-01", title="KRA PIN Registration", authority="KRA", penalty="KES 2,000/mo fine", status="required", category="Tax", priority="high"),
    "NRB-SBP-01": ComplianceItem(id="NRB-SBP-01", title="Single Business Permit (Small)", authority="Nairobi County", penalty="Closure", status="required", category="Trade", priority="high", county="Nairobi"),
    "KK-SBP-01": ComplianceItem(id="KK-SBP-01", title="Small Stall License", authority="Kakamega County", penalty="Daily fines", status="required", category="Trade", priority="high", county="Kakamega"),
    "NRB-SBP-05": ComplianceItem(id="NRB-SBP-05", title="Single Business Permit (Large)", authority="Nairobi County", penalty="KES 5,000 fine", status="required", category="Trade", priority="high", county="Nairobi"),
    "KK-SBP-02": ComplianceItem(id="KK-SBP-02", title="General Trade License", authority="Kakamega County", penalty="Revocation", status="required", category="Trade", priority="high", county="Kakamega"),
    "FIRE-01": ComplianceItem(id="FIRE-01", title="Fire Safety Certificate", authority="Fire Dept", penalty="Prosecution", status="required", category="Safety", priority="high"),
    "WM-01": ComplianceItem(id="WM-01", title="Weights & Measures", authority="Min. Trade", penalty="Equipment seizure", status="required", category="Trade", priority="medium"),
    "KRA-VAT-01": ComplianceItem(id="KRA-VAT-01", title="VAT Registration", authority="KRA", penalty="High interest", status="conditional", category="Tax", priority="high")
}

def get_live_compliance_report(db: Session, user_id: int, profile: BusinessProfile) -> ComplianceReport:
    # 1. Determine Requirements
    req_ids = requirements_for_industry(profile.industry, profile.annual_turnover_kes)
    _, compliance_db, _ = load_knowledge_base()

    required_items_data = [
        compliance_db[rid] for rid in req_ids 
        if rid in compliance_db and (not compliance_db[rid].get("county") or compliance_db[rid].get("county").lower() == profile.county.lower() or compliance_db[rid].get("county") == "National")
    ]

    # 2. Audit Vault
    vault_docs = db.query(ComplianceDocument).filter(ComplianceDocument.user_id == user_id, ComplianceDocument.status == "Active").all()
    active_titles = [doc.title.upper() for doc in vault_docs]
    
    met_count = 0
    items_for_report = []
    for req in required_items_data:
        is_met = any(req["title"].upper() in t for t in active_titles)
        if is_met: met_count += 1
        items_for_report.append(SchemaItem(**req))

    # 3. Calculate Score
    total_req = len(required_items_data)
    score = int((met_count / total_req * 100)) if total_req > 0 else 100

    # 4. Timeline Extraction
    upcoming = []
    today = date.today()
    expiring_docs = sorted([d for d in vault_docs if d.expiry_date], key=lambda x: x.expiry_date)
    
    for doc in expiring_docs[:4]:
        expiry = doc.expiry_date.date() if isinstance(doc.expiry_date, datetime) else doc.expiry_date
        days_left = (expiry - today).days
        upcoming.append(DeadlineItem(
            title=doc.title,
            deadline=expiry.strftime("%b %d, %Y"),
            authority=doc.issuing_authority or "Regulatory Body",
            days_left=max(0, days_left)
        ))

    return ComplianceReport(
        business_name=profile.business_name,
        industry=profile.industry,
        total_requirements=total_req,
        high_priority=sum(1 for i in items_for_report if i.priority == "high" and i.title.upper() not in active_titles),
        compliance_score=score,
        items=items_for_report,
        upcoming_deadlines=upcoming
    )

def requirements_for_industry(industry: str, annual_turnover_kes: float | None = None) -> List[str]:
    industry_map, _, _ = load_knowledge_base()
    industry_key = industry.lower().replace(" ", "_")
    reqs = list(industry_map.get(industry_key, ["KRA-PIN-01", "NRB-SBP-01"]))
    if annual_turnover_kes and annual_turnover_kes >= 5000000:
        if "KRA-VAT-01" not in reqs: reqs.append("KRA-VAT-01")
    return reqs

# --- AST ENGINE ---
def _literal(node):
    return ast.literal_eval(node)

def _extract_map(tree):
    for node in tree.body:
        if isinstance(node, ast.Assign) and node.targets[0].id == "INDUSTRY_MAP":
            return _literal(node.value)
    return {}

def _extract_db(tree):
    for node in tree.body:
        if isinstance(node, ast.Assign) and node.targets[0].id == "COMPLIANCE_DB":
            return { _literal(k): {kw.arg: _literal(kw.value) for kw in v.keywords} for k, v in zip(node.value.keys, node.value.values) if isinstance(v, ast.Call) }
    return {}

@lru_cache(maxsize=1)
def load_knowledge_base():
    source = KB_SOURCE_FILE.read_text(encoding="utf-8")
    tree = ast.parse(source)
    return _extract_map(tree), _extract_db(tree), COUNTIES

def get_industries():
    m, _, _ = load_knowledge_base()
    return sorted(m.keys())

def get_counties(): return COUNTIES