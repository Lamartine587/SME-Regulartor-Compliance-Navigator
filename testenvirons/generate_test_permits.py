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

    def _get_status_label(self, days):
        """Helper to create clean filenames based on the days remaining"""
        if days < 0:
            return "expired"
        elif days == 0:
            return "expires_today"
        else:
            return f"expires_in_{days}_days"

    def generate_kra_tcc(self, company_name, pin, days_to_expiry):
        status_label = self._get_status_label(days_to_expiry)
        filename = f"{self.output_dir}/kra_tcc_{company_name.lower().replace(' ', '_')}_{status_label}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "KENYA REVENUE AUTHORITY", "TAX COMPLIANCE CERTIFICATE")
        
        expiry_date = (datetime.now() + timedelta(days=days_to_expiry)).strftime("%Y-%m-%d")
        
        data = [
            ["PIN:", pin],
            ["Taxpayer Name:", company_name.upper()],
            ["Certificate Number:", f"KRA{datetime.now().year}0012345"],
            ["Issue Date:", (datetime.now() - timedelta(days=100)).strftime("%Y-%m-%d")],
            ["Expiry Date:", expiry_date],
            ["Status:", "COMPLIANT" if days_to_expiry >= 0 else "EXPIRED"]
        ]
        
        table = Table(data, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (1, 5), (1, 5), colors.green if days_to_expiry >= 0 else colors.red)
        ]))
        table.wrapOn(c, width, height)
        table.drawOn(c, 50, height - 300)
        
        c.save()
        return filename

    def generate_health_permit(self, company_name, days_to_expiry):
        status_label = self._get_status_label(days_to_expiry)
        filename = f"{self.output_dir}/health_permit_{company_name.lower().replace(' ', '_')}_{status_label}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "MINISTRY OF HEALTH", "FOOD HYGIENE PERMIT")
        
        expiry_date = (datetime.now() + timedelta(days=days_to_expiry)).strftime("%Y-%m-%d")
        
        data = [
            ["Premises Name:", company_name.upper()],
            ["Category:", "RESTAURANT / CATERING"],
            ["Location:", "PLOT 12, KAKAMEGA ROAD"],
            ["Inspection Date:", (datetime.now() - timedelta(days=100)).strftime("%Y-%m-%d")],
            ["VALID UNTIL:", expiry_date]
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

    def generate_fire_permit(self, company_name, days_to_expiry):
        status_label = self._get_status_label(days_to_expiry)
        filename = f"{self.output_dir}/fire_safety_{company_name.lower().replace(' ', '_')}_{status_label}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        self._draw_header(c, "COUNTY FIRE & RESCUE SERVICES", "FIRE SAFETY CERTIFICATE")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 160, "This is to certify that the premises has been inspected and found")
        c.drawString(50, height - 175, "to comply with the Fire Prevention Act Cap 185.")
        
        expiry_date = (datetime.now() + timedelta(days=days_to_expiry)).strftime("%Y-%m-%d")
        
        data = [
            ["Business:", company_name.upper()],
            ["Serial No:", "FIRE-9901-X"],
            ["EQUIPMENT:", "EXTINGUISHERS, HOSE REEL"],
            ["EXPIRY:", expiry_date]
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

    def generate_sbp(self, company_name, days_to_expiry):
        status_label = self._get_status_label(days_to_expiry)
        filename = f"{self.output_dir}/sbp_permit_{company_name.lower().replace(' ', '_')}_{status_label}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        c.setFillColor(colors.HexColor("#FFF9E6"))
        c.rect(0, 0, width, height, fill=1)
        c.setFillColor(colors.black)
        
        self._draw_header(c, "NAIROBI CITY COUNTY", "UNIFIED BUSINESS PERMIT")
        
        expiry_date = (datetime.now() + timedelta(days=days_to_expiry)).strftime("%Y-%m-%d")
        
        data = [
            ["Business ID:", "UBP-2026-8871"],
            ["Entity Name:", company_name.upper()],
            ["Activity:", "RESTAURANT WITH BAR"],
            ["Area:", "ZONE A - CBD"],
            ["VALID UNTIL:", expiry_date]
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
    
    # We test: Expired(-5), Today(0), scheduler triggers (7, 30), and futures (10, 20, 60)
    test_intervals = [-5, 0, 7, 10, 20, 30, 60] 
    
    print("Generating test documents...")
    
    for days in test_intervals:
        gen.generate_kra_tcc(name, "P051234567Z", days)
        gen.generate_health_permit(name, days)
        gen.generate_fire_permit(name, days)
        gen.generate_sbp(name, days)
    
    print(f"✅ Success: {len(test_intervals) * 4} test documents generated in 'test_docs/'")