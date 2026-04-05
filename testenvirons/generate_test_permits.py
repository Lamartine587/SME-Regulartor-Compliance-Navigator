from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from datetime import datetime, timedelta
import os

class DocumentGenerator:
    def __init__(self, output_dir="test_docs"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def _draw_header(self, c, authority, doc_title):
        width, height = letter
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width / 2.0, height - 60, "REPUBLIC OF KENYA")
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(width / 2.0, height - 80, authority.upper())
        c.setLineWidth(1)
        c.line(50, height - 90, width - 50, height - 90)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(width / 2.0, height - 120, doc_title)

    def generate_kra_tcc(self, company_name, pin):
        filename = f"{self.output_dir}/kra_tcc_{company_name.lower().replace(' ', '_')}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "KENYA REVENUE AUTHORITY", "TAX COMPLIANCE CERTIFICATE")
        
        data = [
            ["PIN:", pin],
            ["Taxpayer Name:", company_name.upper()],
            ["Certificate Number:", f"KRA{datetime.now().year}0012345"],
            ["Issue Date:", datetime.now().strftime("%Y-%m-%d")],
            ["Expiry Date:", (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")],
            ["Status:", "COMPLIANT"]
        ]
        
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (1, 5), (1, 5), colors.green)
        ]))
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, height - 300)
        
        c.save()
        return filename

    def generate_health_permit(self, company_name):
        filename = f"{self.output_dir}/health_permit_{company_name.lower().replace(' ', '_')}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "MINISTRY OF HEALTH", "FOOD HYGIENE PERMIT")
        
        data = [
            ["Premises Name:", company_name.upper()],
            ["Category:", "RESTAURANT / CATERING"],
            ["Location:", "PLOT 12, KAKAMEGA ROAD"],
            ["Inspection Date:", (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")],
            ["VALID UNTIL:", (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")]
        ]
        
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 2, colors.darkblue),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BACKGROUND', (0,-1), (-1,-1), colors.lightyellow)
        ]))
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, height - 300)
        
        c.save()
        return filename

    def generate_fire_permit(self, company_name):
        filename = f"{self.output_dir}/fire_safety_{company_name.lower().replace(' ', '_')}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "COUNTY FIRE & RESCUE SERVICES", "FIRE SAFETY CERTIFICATE")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 160, "This is to certify that the premises has been inspected and found")
        c.drawString(50, height - 175, "to comply with the Fire Prevention Act Cap 185.")
        
        data = [
            ["Business:", company_name.upper()],
            ["Serial No:", "FIRE-9901-X"],
            ["EQUIPMENT:", "EXTINGUISHERS, HOSE REEL"],
            ["EXPIRY:", (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")]
        ]
        
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.red),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold')
        ]))
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, height - 320)
        
        c.save()
        return filename

    def generate_sbp(self, company_name):
        filename = f"{self.output_dir}/sbp_permit_{company_name.lower().replace(' ', '_')}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        c.setFillColor(colors.HexColor("#FFF9E6"))
        c.rect(0, 0, width, height, fill=1)
        c.setFillColor(colors.black)
        
        self._draw_header(c, "NAIROBI CITY COUNTY", "UNIFIED BUSINESS PERMIT")
        
        data = [
            ["Business ID:", "UBP-2026-8871"],
            ["Entity Name:", company_name.upper()],
            ["Activity:", "RESTAURANT WITH BAR"],
            ["Area:", "ZONE A - CBD"],
            ["VALID UNTIL:", "2026-12-31"]
        ]
        
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER')
        ]))
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, height - 300)
        
        c.save()
        return filename

if __name__ == "__main__":
    gen = DocumentGenerator()
    name = "Anga Systems"
    
    gen.generate_kra_tcc(name, "P051234567Z")
    gen.generate_health_permit(name)
    gen.generate_fire_permit(name)
    gen.generate_sbp(name)
    
    print(f"✅ Success: 4 unique compliance documents generated in 'test_docs/'")