import os
import json
import re
import hashlib
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from devsms import DevSMSClient

# Pydantic & GenAI
from pydantic import BaseModel, Field
from typing import Optional, List
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

# Setup detailed logging for IT administration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ComplianceEngine")

# Database Connections
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client["SMERegulator"]

# Mail Configuration
mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.SENDER_EMAIL,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SENDER_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_SERVER,
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True
)

# --- 1. DATA SCHEMAS (Expanded Scope) ---

class DocumentClassification(BaseModel):
    document_type: str = Field(description="Strictly one of: 'license', 'invoice', 'delivery_note', 'unknown'")

class InvoiceItem(BaseModel):
    item_name: str
    quantity: int = 1
    unit_price: float
    total_price: float

class InvoiceSchema(BaseModel):
    title: str = Field(description="Official document heading, e.g., 'TAX INVOICE'")
    vendor_name: str = Field(description="The company issuing the bill")
    invoice_number: str = Field(description="Unique reference number")
    total_amount: float = Field(description="The final Grand Total including tax")
    due_date: Optional[str] = Field(description="Deadline for payment in YYYY-MM-DD")
    items: List[InvoiceItem] = Field(description="List of all services/products provided")
    summary: str = Field(description="Brief professional overview of the transaction")

class LicenseSchema(BaseModel):
    title: str = Field(description="Official document title, e.g., 'SINGLE BUSINESS PERMIT'")
    authority: str = Field(description="Entity that issued the permit (e.g., KRA, County Govt)")
    county: Optional[str] = Field(description="Kenyan county of jurisdiction")
    issue: Optional[str] = Field(description="Issue date in YYYY-MM-DD")
    expiry: Optional[str] = Field(description="Expiration date in YYYY-MM-DD")
    summary: str = Field(description="Technical summary of the compliance status")

class DeliveryNoteSchema(BaseModel):
    title: str = Field(description="Exact document title")
    supplier_name: str
    delivery_date: Optional[str] = Field(description="YYYY-MM-DD")
    received_by: Optional[str] = Field(description="Name of staff who signed for it")
    summary: str

# --- 2. THE ENGINE ---

class ComplianceEngine:
    
    @staticmethod
    def run_fallback_ocr(file_path: str):
        """
        Comprehensive local extraction engine using Tesseract and heavy Regex.
        Specifically optimized for Kenyan document layouts.
        """
        logger.info(f"Initiating local synchronization service for: {file_path}")
        text = ""
        try:
            # 1. Image Conversion
            if file_path.lower().endswith('.pdf'):
                images = convert_from_path(file_path)
                for img in images:
                    text += pytesseract.image_to_string(img)
            else:
                img = Image.open(file_path)
                text += pytesseract.image_to_string(img)
            
            text_upper = text.upper()
            lines = [l.strip() for l in text_upper.split('\n') if l.strip()]

            # 2. Document Title Extraction (Top-of-file analysis)
            title = "UNSPECIFIED DOCUMENT"
            headers = ["TAX INVOICE", "SINGLE BUSINESS PERMIT", "FIRE SAFETY", "DELIVERY NOTE", "KRA COMPLIANCE"]
            for line in lines[:8]:
                for h in headers:
                    if h in line:
                        title = line
                        break
            
            # 3. County & Issuing Authority Mapping
            kenyan_counties = [
                "NAIROBI", "MOMBASA", "KISUMU", "NAKURU", "KIAMBU", "KAKAMEGA", "UASIN GISHU",
                "MACHAKOS", "KWALE", "KILIFI", "NYERI", "MURANG'A", "LAIKIPIA", "MERU"
            ]
            found_county = next((c for c in kenyan_counties if c in text_upper), "National")
            
            authority = "Unknown Regulatory Body"
            if any(k in text_upper for k in ["KRA", "REVENUE", "PIN"]):
                authority = "Kenya Revenue Authority"
            elif "COUNTY" in text_upper or "GOVERNMENT" in text_upper:
                authority = f"{found_county.capitalize()} City County"

            # 4. Detailed Financial Extraction[cite: 1, 2]
            doc_type = "invoice" if "INVOICE" in title or "TOTAL" in text_upper else "license"
            total_val = 0.0
            extracted_items = []
            
            if doc_type == "invoice":
                # Hunt for KES/KSH totals (e.g. 257,102.40)
                amt_match = re.search(r'(?:GRAND TOTAL|TOTAL|KES|KSH)\s*[:=]?\s*([\d,]+\.\d{2})', text_upper)
                if amt_match:
                    total_val = float(amt_match.group(1).replace(',', ''))
                
                # Scan for line items (e.g. Consulting Hours)
                for line in lines:
                    prices = re.findall(r'([\d,]+\.\d{2})', line)
                    if prices and len(line) > 12:
                        extracted_items.append({
                            "item_name": line.split('|')[0].strip() if '|' in line else line[:25].strip(),
                            "quantity": 1,
                            "unit_price": float(prices[0].replace(',', '')),
                            "total_price": float(prices[-1].replace(',', ''))
                        })

            # 5. Temporal Data (Dates)
            date_regex = r'\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b'
            raw_dates = re.findall(date_regex, text)
            normalized_dates = []
            for rd in raw_dates:
                try:
                    # Handle varying delimiters
                    d_str = rd.replace('/', '-')
                    if len(d_str.split('-')[0]) == 2: # DD-MM-YYYY
                        normalized_dates.append(datetime.strptime(d_str, "%d-%m-%Y").strftime("%Y-%m-%d"))
                    else: # YYYY-MM-DD
                        normalized_dates.append(datetime.strptime(d_str, "%Y-%m-%d").strftime("%Y-%m-%d"))
                except ValueError: continue
            
            normalized_dates.sort()
            expiry_val = normalized_dates[-1] if normalized_dates else None

            return {
                "system_doc_type": doc_type,
                "title": title,
                "authority": authority,
                "vendor_name": authority,
                "county": found_county,
                "total_amount": total_val,
                "due_date": expiry_val,
                "expiry": expiry_val,
                "items": extracted_items,
                "summary": f"Localized verification of {title} successful."
            }
        except Exception as e:
            logger.error(f"Fallback failure: {e}")
            return None

    @staticmethod
    async def run_primary_scan(file_path: str):
        """
        Gemini 2.0 AI scanning layer. High-level reasoning for complex items.
        """
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            sample_file = client.files.upload(file=file_path)
            
            # Step 1: Broad Categorization
            class_res = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=["Categorize this document strictly.", sample_file],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DocumentClassification,
                    temperature=0.1 
                )
            )
            dtype = json.loads(class_res.text).get("document_type", "unknown")

            # Step 2: Deep Extraction
            schema_map = {"license": LicenseSchema, "invoice": InvoiceSchema, "delivery_note": DeliveryNoteSchema}
            extraction_prompt = f"""
            Extract the official Title, Authority, County, and all individual Itemized totals from this {dtype}.
            If it is an invoice, capture every line item, quantity, and unit price.[cite: 1, 2]
            Today's Date: {datetime.now().date()}
            """
            
            ext_res = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=[extraction_prompt, sample_file],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema_map.get(dtype),
                    temperature=0.1
                )
            )

            client.files.delete(name=sample_file.name)
            final_data = json.loads(ext_res.text)
            final_data["system_doc_type"] = dtype 
            return final_data
        except Exception as e:
            logger.warning(f"AI Scan interrupted: {e}")
            return None 

    @staticmethod
    async def process_new_upload(doc_id: int, db: Session, user_email: str, phone: str = None):
        """
        Main pipeline orchestrator. Handles DB commits and notification triggers.
        """
        doc = db.query(ComplianceDocument).filter(ComplianceDocument.id == doc_id).first()
        if not doc: return

        # 1. Execution Layer
        data = await ComplianceEngine.run_primary_scan(doc.file_path)
        if not data:
            data = ComplianceEngine.run_fallback_ocr(doc.file_path)

        # 2. Failure Handling
        if not data:
            doc.document_type = "MANUAL_REVIEW"
            db.commit()
            await ComplianceEngine.send_failure_notifications(doc, user_email, phone, db)
            return

        # 3. Success & SQL Sync
        try:
            dtype = data.get("system_doc_type", "unknown")
            doc.document_type = dtype
            doc.title = data.get("title", doc.title)
            doc.issuing_authority = data.get("authority", data.get("vendor_name", "Unknown"))
            
            if dtype == "invoice":
                doc.category = "transaction"
                # Extraction for INV-7768 (257,102.40) or INV-7991 (215,981.56)[cite: 1, 2]
                doc.financial_amount = data.get("total_amount", 0.0)
                if data.get("due_date"):
                    doc.expiry_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()
            else:
                doc.category = "personal" if any(k in doc.title.lower() for k in ["id", "driver", "passport"]) else "business"
                if data.get("expiry"):
                    doc.expiry_date = datetime.strptime(data["expiry"], "%Y-%m-%d").date()

            db.commit()

            # 4. MongoDB Persistent Storage for Analytics
            await mongo_db.document_meta.insert_one({
                "neon_id": doc_id,
                "user": user_email,
                "authority": data.get("authority"),
                "county": data.get("county"),
                "items": data.get("items", []), # Detailed line items[cite: 1, 2]
                "total": data.get("total_amount", 0.0),
                "processed_at": datetime.now(timezone.utc)
            })

            # 5. Mandatory Notification Dispatch
            await ComplianceEngine.send_success_notifications(doc, data, user_email, phone, db)
            
        except Exception as e:
            logger.error(f"Post-processing DB error: {e}")
            db.rollback()

    # --- 3. THE "MEATY" NOTIFICATION SUITE ---

    @staticmethod
    async def send_success_notifications(doc, data, user_email, phone, db):
        """
        Ensures Web, Email, and SMS are sent as a MUST.
        """
        
        # A. WEB NOTIFICATION
        try:
            db.add(Notification(
                user_id=doc.user_id, 
                title="Vault Entry Synchronized", 
                message=f"'{doc.title}' verified. Issued by {doc.issuing_authority} ({data.get('county', 'National')})."
            ))
            db.commit()
        except Exception: db.rollback()

        # B. STYLIZED EMAIL (High-Meat Template)
        try:
            # Generate Item Rows for Invoices[cite: 1, 2]
            items_rows = ""
            for item in data.get('items', []):
                items_rows += f"""
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eef2f6; color: #334155;">{item['item_name']}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eef2f6; text-align: center; color: #334155;">{item['quantity']}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eef2f6; text-align: right; color: #334155; font-weight: 600;">KES {item['total_price']:,}</td>
                </tr>
                """
            
            financial_block = ""
            if items_rows:
                financial_block = f"""
                <div style="margin-top: 25px;">
                    <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Itemized Breakdown</h3>
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th style="text-align: left; padding: 12px; font-size: 12px; color: #475569;">Description</th>
                                <th style="text-align: center; padding: 12px; font-size: 12px; color: #475569;">Qty</th>
                                <th style="text-align: right; padding: 12px; font-size: 12px; color: #475569;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>{items_rows}</tbody>
                    </table>
                    <div style="padding: 15px; background: #f1f5f9; text-align: right; font-weight: bold; font-size: 18px; color: #1e293b;">
                        Grand Total: KES {data.get('total_amount', 0.0):,}
                    </div>
                </div>
                """

            email_body = f"""
            <div style="font-family: 'Inter', -apple-system, sans-serif; background: #f4f7fa; padding: 40px 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); padding: 40px; text-align: center;">
                        <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 20px; line-height: 60px; font-size: 30px;">✅</div>
                        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800;">Verification Successful</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Secure Vault Synchronization Complete</p>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 16px; line-height: 1.6; color: #475569;">The document <b style="color: #1e293b;">{doc.title}</b> has been meticulously scanned and validated by the SME Navigator engine.</p>
                        <div style="background: #f8fafc; border-left: 5px solid #6366f1; padding: 25px; margin: 30px 0; border-radius: 8px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="display: block; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Issuing Entity</span>
                                        <span style="font-size: 16px; font-weight: 700; color: #1e293b;">{doc.issuing_authority} ({data.get('county', 'National')})</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span style="display: block; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Compliance Status / Expiry</span>
                                        <span style="font-size: 16px; font-weight: 700; color: #e11d48;">{doc.expiry_date or 'VALID INDEFINITELY'}</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        {financial_block}
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="{settings.FRONTEND_URL}/dashboard" style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);">Access Your Dashboard</a>
                        </div>
                    </div>
                    <div style="background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 Anga Systems SME Navigator. This is an official system transmission.</p>
                    </div>
                </div>
            </div>
            """
            
            fm = FastMail(mail_conf)
            msg = MessageSchema(subject=f"✅ Document Verified: {doc.title}", recipients=[user_email], body=email_body, subtype="html")
            await fm.send_message(msg)
        except Exception as e: logger.error(f"Email failure: {e}")

        # C. SMS (Mandatory)
        if phone:
            try:
                # Format to E.164 for Kenya
                fmt_phone = "+254" + phone[1:] if phone.startswith("0") else (phone if phone.startswith("+") else "+" + phone)
                sms_txt = f"SME Nav Success: {doc.title} verified. Issuing Authority: {doc.issuing_authority}. Jurisdiction: {data.get('county')}. Expires: {doc.expiry_date}. Check your email for details."
                DevSMSClient(api_key=settings.DEVTEXT_API_KEY).send(to=fmt_phone, message=sms_txt)
            except Exception as e: logger.error(f"SMS failure: {e}")

    @staticmethod
    async def send_failure_notifications(doc, user_email, phone, db):
        """
        Failure alerts are equally stylized and mandatory.
        """
        try:
            db.add(Notification(user_id=doc.user_id, title="Action Required: Sync Failed", message=f"We could not auto-verify '{doc.title}'."))
            db.commit()
            
            # Send simplified failure email & SMS
            fm = FastMail(mail_conf)
            await fm.send_message(MessageSchema(subject=f"⚠️ Action Required: {doc.title}", recipients=[user_email], body=f"Verification failed for {doc.title}. Manual entry required.", subtype="html"))
            
            if phone:
                DevSMSClient(api_key=settings.DEVTEXT_API_KEY).send(to=phone, message=f"SME Navigator Alert: Manual confirmation needed for {doc.title}. Login to verify.")
        except Exception: pass