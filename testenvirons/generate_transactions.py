# testenvirons/generate_transactions.py
import os
import random
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# --- TEST DATA POOLS (Kenyan Context) ---
VENDORS = [
    "Nairobi Tech Supplies Ltd", "Hardware Masters Kakamega", 
    "Rift Valley Office Solutions", "Mombasa Logistics & Freight", 
    "Kenya Power (KPLC)", "Safaricom PLC"
]
CLIENT_NAME = "Anga Systems"
ITEMS = [
    "Server Rack Maintenance", "Cisco Router Setup", "Office Desks",
    "Monthly Cloud Hosting", "Fiber Optic Installation", "Consulting Hours"
]
RECEIVERS = ["John Doe", "Jane Kamau", "Security Desk", "Warehouse Manager"]

# Ensure output directory exists
OUTPUT_DIR = "test_docs/transactions"
os.makedirs(OUTPUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()
title_style = styles['Heading1']
title_style.alignment = 1 # Center
normal_style = styles['Normal']

def create_invoice(file_path, vendor, is_overdue=False):
    doc = SimpleDocTemplate(file_path, pagesize=A4)
    elements = []

    # Generate Dates
    today = datetime.now()
    if is_overdue:
        issue_date = today - timedelta(days=random.randint(40, 60))
        due_date = issue_date + timedelta(days=30)
    else:
        issue_date = today - timedelta(days=random.randint(1, 10))
        due_date = issue_date + timedelta(days=30)

    invoice_number = f"INV-{random.randint(1000, 9999)}"
    
    # Generate Line Items
    num_items = random.randint(1, 4)
    table_data = [["Description", "Qty", "Unit Price (KES)", "Total (KES)"]]
    subtotal = 0
    
    for _ in range(num_items):
        item = random.choice(ITEMS)
        qty = random.randint(1, 5)
        price = random.randint(5000, 50000)
        total = qty * price
        subtotal += total
        table_data.append([item, str(qty), f"{price:,}", f"{total:,}"])

    tax = subtotal * 0.16 # 16% VAT
    grand_total = subtotal + tax

    table_data.extend([
        ["", "", "Subtotal:", f"{subtotal:,.2f}"],
        ["", "", "VAT (16%):", f"{tax:,.2f}"],
        ["", "", "GRAND TOTAL:", f"{grand_total:,.2f}"]
    ])

    # Build PDF Elements
    elements.append(Paragraph(f"<b>TAX INVOICE</b>", title_style))
    elements.append(Spacer(1, 20))
    
    header_text = f"""
    <b>Vendor Name:</b> {vendor}<br/>
    <b>Billed To:</b> {CLIENT_NAME}<br/>
    <b>Invoice Number:</b> {invoice_number}<br/>
    <b>Issue Date:</b> {issue_date.strftime('%Y-%m-%d')}<br/>
    <b>Due Date:</b> <font color='red'>{due_date.strftime('%Y-%m-%d')}</font>
    """
    elements.append(Paragraph(header_text, normal_style))
    elements.append(Spacer(1, 20))

    # Create Table
    t = Table(table_data, colWidths=[200, 50, 120, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'), # Bold Grand Total
    ]))
    elements.append(t)
    
    doc.build(elements)
    print(f"✅ Generated Invoice: {file_path}")

def create_delivery_note(file_path, supplier):
    doc = SimpleDocTemplate(file_path, pagesize=A4)
    elements = []

    delivery_date = datetime.now() - timedelta(days=random.randint(1, 5))
    note_number = f"DN-{random.randint(10000, 99999)}"
    receiver = random.choice(RECEIVERS)

    elements.append(Paragraph(f"<b>DELIVERY NOTE</b>", title_style))
    elements.append(Spacer(1, 20))

    header_text = f"""
    <b>Supplier Name:</b> {supplier}<br/>
    <b>Delivered To:</b> {CLIENT_NAME}<br/>
    <b>Delivery Note #:</b> {note_number}<br/>
    <b>Delivery Date:</b> {delivery_date.strftime('%Y-%m-%d')}<br/>
    """
    elements.append(Paragraph(header_text, normal_style))
    elements.append(Spacer(1, 20))

    # Generate Delivery Items (No Prices)
    num_items = random.randint(2, 5)
    table_data = [["Item Code", "Description", "Quantity Delivered"]]
    for _ in range(num_items):
        table_data.append([f"ITM-{random.randint(100,999)}", random.choice(ITEMS), str(random.randint(1, 10))])

    t = Table(table_data, colWidths=[100, 250, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 40))

    footer_text = f"""
    <b>Goods Received in Good Condition By:</b> {receiver}<br/>
    <b>Signature:</b> ___________________________
    """
    elements.append(Paragraph(footer_text, normal_style))

    doc.build(elements)
    print(f"📦 Generated Delivery Note: {file_path}")

if __name__ == "__main__":
    print("🚀 Generating Test Transaction Documents...")
    
    # Generate 5 Invoices (Mix of active and overdue)
    for i in range(5):
        vendor = random.choice(VENDORS)
        is_overdue = random.choice([True, False])
        status = "overdue" if is_overdue else "active"
        filename = f"{OUTPUT_DIR}/invoice_{vendor.replace(' ', '_').lower()}_{status}_{i}.pdf"
        create_invoice(filename, vendor, is_overdue)

    # Generate 5 Delivery Notes
    for i in range(5):
        supplier = random.choice(VENDORS)
        filename = f"{OUTPUT_DIR}/delivery_note_{supplier.replace(' ', '_').lower()}_{i}.pdf"
        create_delivery_note(filename, supplier)

    print(f"\n🎉 Done! 10 documents generated in '{OUTPUT_DIR}'")