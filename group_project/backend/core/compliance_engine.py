import os
import json
import re
import hashlib
import logging
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from devsms import DevSMSClient

# Pydantic & GenAI
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from google import genai 
from google.genai import types

# LOCAL SCANNING / OCR FALLBACK
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

from core.config import settings
from models.document_model import ComplianceDocument
from models.user_model import User 
from models.notification_model import Notification

# --- 1. ENHANCED SYSTEM LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AngaSystems.ComplianceEngine")

# --- 2. THE MASTER REGULATORY BLUEPRINT ---
# This expanded matrix covers all business scales across Kenya.
BUSINESS_REQUIREMENTS = {
    "micro_kiosk": ["Single Business Permit", "KRA PIN"],
    "retail_hardware": ["Single Business Permit", "KRA PIN", "Fire Clearance", "Weights & Measures", "VAT Certificate"],
    "pharmacy_medical": ["Single Business Permit", "PPB License", "Pharmacist Practicing License", "KRA PIN"],
    "catering_hospitality": ["Single Business Permit", "Health Certificate", "Liquor License", "Fire Clearance", "MCSK"],
    "logistics_transport": ["Single Business Permit", "NTSA Operating License", "Transit Goods Permit", "Insurance"],
    "construction_eng": ["Single Business Permit", "NCA Registration", "CR12 Certificate", "Tax Compliance"],
    "professional_firm": ["Single Business Permit", "Professional Practicing License", "KRA PIN", "Indemnity Insurance"],
    "tech_startup": ["Single Business Permit", "KRA PIN", "Data Protection Registration", "IP Certificates"]
}

# --- 3. DATA SCHEMAS (Exhaustive) ---

class DocumentClassification(BaseModel):
    document_type: str = Field(description="Strictly: 'license', 'invoice', 'delivery_note', 'tax_cert', or 'unknown'")
    business_niche: str = Field(description="The sector the business operates in.")
    confidence_score: float = Field(default=0.0)

class InvoiceItem(BaseModel):
    item_name: str
    quantity: int = 1
    unit_price: float
    total_price: float

class UniversalExtractionSchema(BaseModel):
    title: str = Field(description="Official heading, e.g., 'TAX INVOICE' or 'SINGLE BUSINESS PERMIT'")
    authority: str = Field(description="Issuing body, e.g., KRA, County Govt, NTSA")
    county: Optional[str] = Field(description="The specific Kenyan County, e.g., Kakamega, Nairobi[cite: 1]")
    vendor_details: Optional[str] = Field(description="Name and PIN of the issuing entity")
    invoice_number: Optional[str] = Field(description="Unique reference, e.g., INV-7991")
    total_amount: float = Field(default=0.0, description="Grand total, e.g., 257,102.40[cite: 1]")
    issue_date: Optional[str] = Field(description="YYYY-MM-DD")
    expiry_date: Optional[str] = Field(description="YYYY-MM-DD[cite: 1]")
    items: List[InvoiceItem] = []
    summary: str = Field(description="A technical breakdown of the document context.")

    @validator('total_amount')
    def validate_amount(cls, v):
        return round(v, 2)

# --- 4. THE COMPLIANCE ENGINE ---

class ComplianceEngine:
    
    @staticmethod
    def run_fallback_ocr(file_path: str):
        """
        The Robust Fail-Safe: Optimized for Kenyan typography and local stamps.
        """
        trace_id = str(uuid.uuid4())[:8]
        logger.info(f"[{trace_id}] Manual Sync Triggered: {file_path}")
        text = ""
        try:
            # Multi-page handling
            if file_path.lower().endswith('.pdf'):
                images = convert_from_path(file_path)
                for i, img in enumerate(images):
                    text += pytesseract.image_to_string(img)
                    logger.info(f"[{trace_id}] Processed page {i+1}")
            else:
                img = Image.open(file_path)
                text += pytesseract.image_to_string(img)
            
            text_upper = text.upper()
            lines = [l.strip() for l in text_upper.split('\n') if l.strip()]

            # 1. Heading Analysis[cite: 1]
            title = "UNIDENTIFIED DOCUMENT"
            potential_titles = ["INVOICE", "PERMIT", "LICENSE", "CERTIFICATE", "DELIVERY", "RECEIPT"]
            for line in lines[:10]:
                if any(pt in line for pt in potential_titles):
                    title = line
                    break

            # 2. County & Authority Logic[cite: 1]
            counties = ["NAIROBI", "MOMBASA", "KISUMU", "NAKURU", "KIAMBU", "KAKAMEGA", "UASIN GISHU", "MACHAKOS"]
            found_county = next((c for c in counties if c in text_upper), "National")
            
            authority = "Public Authority"
            if "KRA" in text_upper or "REVENUE" in text_upper:
                authority = "Kenya Revenue Authority"
            elif "COUNTY" in text_upper:
                authority = f"{found_county.capitalize()} County Government"
            elif "NTSA" in text_upper:
                authority = "National Transport and Safety Authority"

            # 3. Financial Totals (Greedy Search)[cite: 1]
            total_val = 0.0
            # Matches formats like 257,102.40 or 215,981.56
            amt_match = re.search(r'(?:GRAND TOTAL|TOTAL|KES|KSH)\s*[:=]?\s*([\d,]+\.\d{2})', text_upper)
            if amt_match:
                total_val = float(amt_match.group(1).replace(',', ''))

            # 4. Temporal Scanning (Issue & Expiry)
            date_regex = r'\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b'
            raw_dates = re.findall(date_regex, text)
            clean_dates = []
            for rd in raw_dates:
                try:
                    d_fmt = rd.replace('/', '-')
                    if len(d_fmt.split('-')[0]) == 2:
                        parsed = datetime.strptime(d_fmt, "%d-%m-%Y").strftime("%Y-%m-%d")
                    else:
                        parsed = datetime.strptime(d_fmt, "%Y-%m-%d").strftime("%Y-%m-%d")
                    clean_dates.append(parsed)
                except ValueError: continue
            
            clean_dates.sort()
            expiry = clean_dates[-1] if clean_dates else None

            return {
                "system_doc_type": "invoice" if "INVOICE" in text_upper else "license",
                "title": title,
                "authority": authority,
                "county": found_county,
                "total_amount": total_val,
                "expiry_date": expiry,
                "items": [],
                "summary": f"Fallback verification success. {title} from {found_county} recorded."
            }
        except Exception as e:
            logger.error(f"[{trace_id}] Fallback Critical Failure: {e}")
            return None

    @staticmethod
    async def run_universal_ai_scan(file_path: str):
        """
        Primary Intelligence Layer: Gemini 2.0 Flash.
        """
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            sample_file = client.files.upload(file=file_path)
            
            # PHASE 1: Business Context Discovery
            meta_res = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=["Examine this document. What is the business type and document category?", sample_file],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DocumentClassification,
                    temperature=0.1
                )
            )
            meta = json.loads(meta_res.text)

            # PHASE 2: Deep Regulatory Extraction[cite: 1]
            prompt = f"""
            Perform a full regulatory extraction for a {meta['business_niche']} business.
            Identify: Official Title, Issuing Body, County (e.g. Kakamega), Expiry, and all line items.
            If an invoice, capture total liabilities like KES 257,102.40.[cite: 1]
            """
            
            ext_res = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=[prompt, sample_file],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=UniversalExtractionSchema,
                    temperature=0.1
                )
            )

            client.files.delete(name=sample_file.name)
            data = json.loads(ext_res.text)
            data["business_type"] = meta["business_niche"]
            data["system_doc_type"] = meta["document_type"]
            return data
        except Exception as e:
            logger.error(f"AI Scan Error: {e}")
            return None 

    @staticmethod
    async def process_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        """
        Master Pipeline. Manages PostgreSQL, MongoDB, and 3-Channel Notifications.
        """
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        # 1. EXECUTION
        data = await ComplianceEngine.run_universal_ai_scan(doc.file_path)
        if not data:
            data = ComplianceEngine.run_fallback_ocr(doc.file_path)

        # 2. VALIDATION & FALLBACK
        if not data:
            doc.document_type = "MANUAL_REVIEW"
            db.commit()
            await ComplianceEngine.dispatch_alerts(doc, None, user_email, phone, db, success=False)
            return

        # 3. DATABASE SYNCHRONIZATION
        try:
            # Sync to Neon SQL (PostgreSQL)
            doc.document_type = data.get("system_doc_type", "license")
            doc.title = data.get("title", doc.title)
            doc.issuing_authority = data.get("authority", "Unknown")
            # Capture totals like 215,981.56
            doc.financial_amount = data.get("total_amount", 0.0)
            
            if data.get("expiry_date"):
                doc.expiry_date = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date()
            
            doc.category = "transaction" if doc.document_type == "invoice" else "business"
            db.commit()

            # Sync to MongoDB (Granular Analysis)[cite: 1]
            await mongo_db.document_meta.insert_one({
                "neon_id": doc_id,
                "user": user_email,
                "business_type": data.get("business_type"),
                "county": data.get("county"),
                "authority": doc.issuing_authority,
                "items": data.get("items", []), # Detailed breakdown
                "total": data.get("total_amount", 0.0),
                "summary": data.get("summary", ""),
                "processed_at": datetime.now(timezone.utc)
            })

            # 4. NOTIFICATION DISPATCH
            await ComplianceEngine.dispatch_alerts(doc, data, user_email, phone, db, success=True)
            
        except Exception as e:
            logger.critical(f"Database Integrity Error: {e}")
            db.rollback()

    @staticmethod
    async def dispatch_alerts(doc, data, user_email, phone, db, success=True):
        """
        The 3-Channel Notification Suite (Web, Email, SMS).
        """
        if not success:
            # Web Alert for failure
            db.add(Notification(user_id=doc.user_id, title="Action Required", message=f"Manual sync needed for {doc.title}."))
            db.commit()
            return

        # 1. WEB ALERT
        db.add(Notification(
            user_id=doc.user_id, 
            title="Compliance Verified", 
            message=f"'{doc.title}' added to vault for {data.get('county')} jurisdiction."
        ))
        db.commit()

        # 2. STYLIZED EMAIL (The "Meat")[cite: 1]
        items_html = "".join([
            f"<tr><td style='padding:12px; border-bottom:1px solid #e2e8f0;'>{i['item_name']}</td>"
            f"<td style='text-align:right; padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold;'>KES {i['total_price']:,}</td></tr>" 
            for i in data.get('items', [])
        ])

        email_body = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 650px; margin: auto; border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 50px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; letter-spacing: -1px;">Vault Verification Success</h1>
                <p style="opacity: 0.9; font-size: 16px;">SME Regulatory Compliance Navigator</p>
            </div>
            <div style="padding: 40px; background: #ffffff;">
                <p style="font-size: 16px; color: #475569;">The document <b style="color: #1e293b;">{doc.title}</b> has been successfully verified for your <b>{data.get('business_type', 'enterprise')}</b>.</p>
                <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <table style="width: 100%;">
                        <tr><td style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800;">Jurisdiction</td></tr>
                        <tr><td style="font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 15px;">{data.get('county', 'National')} County</td></tr>
                        <tr><td style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800;">Issuing Authority</td></tr>
                        <tr><td style="font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 15px;">{doc.issuing_authority}</td></tr>
                        <tr><td style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 800;">Expiration / Due Date</td></tr>
                        <tr><td style="font-size: 18px; font-weight: 700; color: #e11d48;">{doc.expiry_date or 'ACTIVE'}</td></tr>
                    </table>
                </div>
                {f'<h3 style="font-size: 14px; color: #64748b; text-transform: uppercase;">Ledger Entries</h3><table style="width:100%; margin-bottom: 20px;">{items_html}</table>' if items_html else ''}
                <div style="padding: 20px; background: #f1f5f9; border-radius: 12px; text-align: right;">
                    <span style="font-size: 14px; color: #64748b;">Transaction Total:</span><br/>
                    <b style="font-size: 24px; color: #1e293b;">KES {data.get('total_amount', 0.0):,}</b>
                </div>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="{settings.FRONTEND_URL}/dashboard" style="background: #4f46e5; color: white; padding: 18px 35px; border-radius: 14px; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Open SME Navigator</a>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                Official system alert from Anga Systems Compliance Hub.
            </div>
        </div>
        """
        try:
            fm = FastMail(mail_conf)
            await fm.send_message(MessageSchema(subject=f"✅ Verified: {doc.title}", recipients=[user_email], body=email_body, subtype="html"))
        except Exception as e: logger.error(f"Email failure: {e}")

        # 3. MANDATORY SMS
        if phone:
            try:
                fmt_phone = "+254" + phone[1:] if phone.startswith("0") else (phone if phone.startswith("+") else "+" + phone)
                sms_msg = f"SME Nav: {doc.title} verified. Authority: {doc.issuing_authority}. County: {data.get('county')}. Expires: {doc.expiry_date}. KES {data.get('total_amount', 0.0):,} recorded."
                DevSMSClient(api_key=settings.DEVTEXT_API_KEY).send(to=fmt_phone, message=sms_msg)
            except Exception as e: logger.error(f"SMS failure: {e}")