from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime, timedelta
import os

def create_official_document(filename, authority, permit_title, company_name, expiry_date):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Double Border for "Official" look
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)
    c.setLineWidth(0.5)
    c.rect(35, 35, width - 70, height - 70)
    
    # 1. Government Header
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2.0, height - 80, "REPUBLIC OF KENYA")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2.0, height - 105, authority.upper())
    
    c.setLineWidth(1)
    c.line(100, height - 120, width - 100, height - 120)
    
    # 2. Document Title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2.0, height - 160, permit_title)
    
    # 3. Ref Number (Useful for AI extraction testing)
    ref_no = f"REF-{datetime.now().year}-{os.urandom(2).hex().upper()}"
    c.setFont("Helvetica", 10)
    c.drawString(400, height - 190, f"Serial No: {ref_no}")

    # 4. Main Details
    c.setFont("Helvetica", 12)
    y_pos = height - 250
    
    details = [
        ("Entity Name:", company_name),
        ("Business Type:", "Information Technology Services"),
        ("Physical Address:", "Kakamega, Kenya"),
        ("Issue Date:", (datetime.now() - timedelta(days=300)).strftime('%Y-%m-%d')),
    ]
    
    for label, value in details:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, y_pos, label)
        c.setFont("Helvetica", 12)
        c.drawString(220, y_pos, value)
        y_pos -= 30

    # 5. Expiry Date Highlight
    c.setLineWidth(1)
    c.rect(100, y_pos - 40, 400, 50, fill=0)
    
    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(0.8, 0.1, 0.1)  # Red for visibility
    c.drawCentredString(width / 2.0, y_pos - 20, f"VALID UNTIL: {expiry_date}")
    
    # 6. Seal / Stamp Area
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Times-Italic", 10)
    c.drawString(100, 150, "Authorized Signatory: ____________________")
    c.drawCentredString(width / 2.0, 60, "This document is generated for system testing purposes only.")

    c.save()
    print(f"📄 Generated: {filename}")

if __name__ == "__main__":
    # Create directory if it doesn't exist
    if not os.path.exists("test_docs"):
        os.makedirs("test_docs")

    company = "Anga Systems"
    today = datetime.now()

    # 1. Valid - Single Business Permit (Nairobi City County)
    create_official_document(
        "test_docs/nairobi_sbp_valid.pdf",
        "Nairobi City County",
        "SINGLE BUSINESS PERMIT",
        company,
        (today + timedelta(days=280)).strftime('%Y-%m-%d')
    )

    # 2. Expiring Soon - KRA Tax Compliance Certificate
    # We set this to 7 days from now to trigger the "Critical" alert
    create_official_document(
        "test_docs/kra_tcc_expiring.pdf",
        "Kenya Revenue Authority",
        "TAX COMPLIANCE CERTIFICATE",
        company,
        (today + timedelta(days=7)).strftime('%Y-%m-%d')
    )

    # 3. Expired - NHIF Compliance Certificate
    create_official_document(
        "test_docs/nhif_expired.pdf",
        "National Hospital Insurance Fund",
        "NHIF COMPLIANCE CERTIFICATE",
        company,
        (today - timedelta(days=45)).strftime('%Y-%m-%d')
    )

    # 4. Valid - Fire Safety Certificate
    create_official_document(
        "test_docs/fire_safety_valid.pdf",
        "Directorate of Occupational Safety",
        "FIRE SAFETY CERTIFICATE",
        company,
        (today + timedelta(days=120)).strftime('%Y-%m-%d')
    )