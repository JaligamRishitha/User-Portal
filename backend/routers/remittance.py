from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from datetime import datetime
import io
import logging
import base64

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/remittance-schedule/{vendor_id}/{fiscal_year}")
async def get_remittance_schedule(vendor_id: str, fiscal_year: str, db: Session = Depends(get_db)):
    """
    Generate or retrieve remittance schedule for a vendor and fiscal year
    """
    try:
        # First check if there's any payment data for this fiscal year
        check_query = text("""
            SELECT COUNT(*) 
            FROM payment_history 
            WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
        """)
        
        count_result = db.execute(check_query, {
            "vendor_id": vendor_id,
            "fiscal_year": fiscal_year
        }).fetchone()
        
        if count_result[0] == 0:
            raise HTTPException(
                status_code=404, 
                detail=f"No payment data found for fiscal year {fiscal_year}"
            )
        
        # Check if document already exists in database
        query = text("""
            SELECT id, file_data, file_name, mime_type, created_at
            FROM remittance_documents
            WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
            ORDER BY created_at DESC
            LIMIT 1
        """)
        
        result = db.execute(query, {
            "vendor_id": vendor_id,
            "fiscal_year": fiscal_year
        }).fetchone()

        if result:
            # Return existing document
            file_data = result[1]
            file_name = result[2]
            mime_type = result[3]
            
            return StreamingResponse(
                io.BytesIO(file_data),
                media_type=mime_type,
                headers={
                    "Content-Disposition": f"attachment; filename={file_name}"
                }
            )
        else:
            # Generate new document
            pdf_content = generate_remittance_pdf(vendor_id, fiscal_year, db)
            file_name = f"Remittance_Schedule_{fiscal_year}_{vendor_id}.pdf"
            
            # Store in database
            insert_query = text("""
                INSERT INTO remittance_documents (
                    vendor_id,
                    fiscal_year,
                    file_name,
                    file_data,
                    mime_type,
                    file_size,
                    created_at
                ) VALUES (
                    :vendor_id,
                    :fiscal_year,
                    :file_name,
                    :file_data,
                    :mime_type,
                    :file_size,
                    :created_at
                )
            """)
            
            db.execute(insert_query, {
                "vendor_id": vendor_id,
                "fiscal_year": fiscal_year,
                "file_name": file_name,
                "file_data": pdf_content,
                "mime_type": "application/pdf",
                "file_size": len(pdf_content),
                "created_at": datetime.now().isoformat()
            })
            db.commit()
            
            return StreamingResponse(
                io.BytesIO(pdf_content),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={file_name}"
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating remittance schedule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_remittance_pdf(vendor_id: str, fiscal_year: str, db: Session):
    """
    Generate PDF content for remittance schedule matching the sample design
    """
    try:
        # Fetch vendor details
        vendor_query = text("""
            SELECT 
                v.vendor_id,
                CONCAT(v.title, ' ', v.first_name, ' ', v.last_name) as name,
                CONCAT(ud.street, ', ', ud.address_line1, ', ', ud.address_line2, ', ', ud.city, ' ', ud.postcode) as address
            FROM vendors v
            LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE v.vendor_id = :vendor_id
        """)
        vendor = db.execute(vendor_query, {"vendor_id": vendor_id}).fetchone()
        
        # Fetch payment schedule header
        schedule_query = text("""
            SELECT 
                agreement_number,
                location,
                last_payment_date
            FROM payment_schedule_headers
            WHERE vendor_id = :vendor_id
            LIMIT 1
        """)
        schedule_header = db.execute(schedule_query, {"vendor_id": vendor_id}).fetchone()
        
        # Fetch payment schedule items (asset details)
        items_query = text("""
            SELECT 
                item_number,
                land_reg_number,
                asset_type,
                asset_number,
                short_text,
                multiplier,
                rental,
                compensation,
                lease_amount
            FROM payment_schedule_items
            WHERE agreement_number = :agreement_number
            ORDER BY item_number
        """)
        
        agreement_number = schedule_header[0] if schedule_header else None
        items = []
        if agreement_number:
            items = db.execute(items_query, {"agreement_number": agreement_number}).fetchall()
        
        # Fetch payment totals for the fiscal year
        totals_query = text("""
            SELECT 
                SUM(rental_amount) as total_rental,
                SUM(compensation_amount) as total_compensation,
                SUM(lease_amount) as total_lease,
                SUM(tax_amount) as total_tax,
                SUM(payment_amount) as total_paid
            FROM payment_history
            WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
        """)
        totals = db.execute(totals_query, {
            "vendor_id": vendor_id,
            "fiscal_year": fiscal_year
        }).fetchone()

        # Generate PDF with all the data
        pdf_content = generate_ukpn_remittance_pdf(
            vendor, 
            schedule_header, 
            items, 
            totals, 
            fiscal_year
        )
        
        return pdf_content

    except Exception as e:
        logger.error(f"Error in generate_remittance_pdf: {str(e)}")
        raise


def generate_ukpn_remittance_pdf(vendor, schedule_header, items, totals, fiscal_year):
    """
    Generate UKPN-styled remittance schedule PDF matching the sample design
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    elements = []
    styles = getSampleStyleSheet()
    
    # Define custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.black,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.black,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=5
    )
    
    # PAGE 1
    # Title
    title = Paragraph("Remittance Schedule", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.3*cm))
    
    # Grantor Details Section with Logo
    grantor_heading = Paragraph("<b>Grantor Details:</b>", heading_style)
    
    # Create a table with grantor info on left and logo on right
    if vendor:
        grantor_info = f"""
        <b>Grantor Number:</b> {vendor[0]}<br/>
        <b>Grantor Name:</b> {vendor[1]}<br/>
        <b>Grantor Address:</b> {vendor[2]}
        """
        grantor_para = Paragraph(grantor_info, normal_style)
        
        # Try to load logo
        try:
            from reportlab.platypus import Image as RLImage
            import os
            logo_path = os.path.join(os.path.dirname(__file__), '..', 'ukpn-pdf-logo.jpeg')
            if os.path.exists(logo_path):
                logo = RLImage(logo_path, width=4*cm, height=2*cm)
            else:
                logo = Paragraph("", normal_style)
        except:
            logo = Paragraph("", normal_style)
        
        # Create table with grantor details and logo
        header_data = [[grantor_heading, '']]
        header_table = Table(header_data, colWidths=[12*cm, 5*cm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(header_table)
        
        info_data = [[grantor_para, logo]]
        info_table = Table(info_data, colWidths=[12*cm, 5*cm])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(info_table)
    
    elements.append(Spacer(1, 0.3*cm))
    
    # Document summary
    summary_text = f"""
    This document is a summary of the grantor's wayleave and lease information for the {fiscal_year} fiscal year.
    These details are valid as per our records on {datetime.now().strftime('%d/%m/%Y')}
    """
    summary_para = Paragraph(summary_text, normal_style)
    elements.append(summary_para)
    elements.append(Spacer(1, 0.8*cm))
    
    # Wayleave Details Section
    wayleave_heading = Paragraph("<b>Wayleave Details</b>", heading_style)
    elements.append(wayleave_heading)
    
    if schedule_header:
        wayleave_data = [
            ['Wayleave Agreement No', 'Location', 'Payment Date'],
            [
                str(schedule_header[0] or ''),
                str(schedule_header[1] or ''),
                str(schedule_header[2])[:10] if schedule_header[2] else ''
            ]
        ]
        
        wayleave_table = Table(wayleave_data, colWidths=[6*cm, 6*cm, 4*cm])
        wayleave_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#CC0000')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('PADDING', (0, 1), (-1, -1), 8),
        ]))
        elements.append(wayleave_table)
    
    elements.append(Spacer(1, 0.8*cm))
    
    # Asset Details Section
    asset_heading = Paragraph("<b>Asset Details</b>", heading_style)
    elements.append(asset_heading)
    
    if items:
        asset_data = [[
            Paragraph('<b>Item<br/>No</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Land<br/>Registration<br/>Number</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Asset<br/>Type</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Asset<br/>Number</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Short Text</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Multiplier</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Rental(£)</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white)),
            Paragraph('<b>Compensation(£)</b>', ParagraphStyle('Center', parent=normal_style, fontSize=8, alignment=TA_CENTER, textColor=colors.white))
        ]]
        
        for item in items:
            asset_data.append([
                str(item[0] or ''),
                str(item[1] or ''),
                str(item[2] or ''),
                str(item[3] or ''),
                Paragraph(str(item[4] or ''), ParagraphStyle('Left', parent=normal_style, fontSize=8, alignment=TA_LEFT)),
                f"{item[5]:.3f}" if item[5] else '0.000',
                str(int(item[6])) if item[6] else '0',
                str(int(item[7])) if item[7] else '0'
            ])
        
        asset_table = Table(asset_data, colWidths=[1.3*cm, 2.2*cm, 1.8*cm, 1.8*cm, 4.5*cm, 1.8*cm, 1.8*cm, 2.3*cm])
        asset_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#CC0000')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (4, 1), (4, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 1), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(asset_table)
        
        # Add total consent right after the table
        total_consent = sum(item[6] + item[7] for item in items if item[6] and item[7])
        total_consent_style_inline = ParagraphStyle(
            'TotalConsentInline',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.black,
            alignment=TA_RIGHT,
            spaceAfter=5,
            fontName='Helvetica-Bold'
        )
        total_consent_para = Paragraph(f"Total on this consent(£): {total_consent:.0f}", total_consent_style_inline)
        elements.append(total_consent_para)
    
    # PAGE BREAK
    elements.append(PageBreak())
    
    # Totals heading
    totals_heading = Paragraph("<b>Totals</b>", heading_style)
    elements.append(totals_heading)
    elements.append(Spacer(1, 0.3*cm))
    
    # Totals table
    if totals:
        totals_data = [
            ['Component', 'Value(£)'],
            ['Lease Rent', str(int(totals[2])) if totals[2] else '0'],
            ['Wayleaves Compensation', str(int(totals[1])) if totals[1] else '0'],
            ['Wayleaves Rental', str(int(totals[0])) if totals[0] else '0'],
            ['Less Tax Deducted', str(int(totals[3])) if totals[3] else '0']
        ]
        
        totals_table = Table(totals_data, colWidths=[12*cm, 4*cm])
        totals_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#CC0000')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('PADDING', (0, 1), (-1, -1), 10),
        ]))
        elements.append(totals_table)
        
        elements.append(Spacer(1, 0.5*cm))
        
        # Total Paid
        total_paid_style = ParagraphStyle(
            'TotalPaid',
            parent=styles['Normal'],
            fontSize=14,
            textColor=colors.black,
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        )
        total_paid = totals[4] if totals[4] else 0
        total_paid_para = Paragraph(f"<b>Total Paid :£ {total_paid:.0f}</b>", total_paid_style)
        elements.append(total_paid_para)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def generate_simple_pdf(vendor_id: str, fiscal_year: str, payments):
    """
    Generate a professional remittance schedule PDF matching the sample design
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import inch, cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.pdfgen import canvas
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    elements = []
    styles = getSampleStyleSheet()
    
    # Header Section
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=20,
        textColor=colors.HexColor('#ea580c'),
        spaceAfter=5,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    header = Paragraph("REMITTANCE SCHEDULE", header_style)
    elements.append(header)
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    subtitle = Paragraph(f"Fiscal Year {fiscal_year}", subtitle_style)
    elements.append(subtitle)
    elements.append(Spacer(1, 0.5*cm))
    
    # Vendor Information Box
    vendor_data = [
        ['Vendor ID:', vendor_id],
        ['Generated:', datetime.now().strftime('%d %B %Y')],
        ['Time:', datetime.now().strftime('%H:%M:%S')]
    ]
    
    vendor_table = Table(vendor_data, colWidths=[3*cm, 6*cm])
    vendor_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(vendor_table)
    elements.append(Spacer(1, 0.8*cm))
    
    # Payment Details Section
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#ea580c'),
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    section_header = Paragraph("PAYMENT DETAILS", section_style)
    elements.append(section_header)
    
    # Payment table
    if payments:
        # Calculate totals
        total_payment = sum(payment[3] for payment in payments if payment[3])
        total_rental = sum(payment[5] for payment in payments if payment[5])
        total_compensation = sum(payment[6] for payment in payments if payment[6])
        total_gross = sum(payment[8] for payment in payments if payment[8])
        
        # Table headers
        data = [[
            'Agreement\nNumber',
            'Document\nNumber', 
            'Posting\nDate', 
            'Payment\nDate', 
            'Payment\nAmount (£)', 
            'Rental\n(£)', 
            'Compensation\n(£)', 
            'Gross\nAmount (£)'
        ]]
        
        # Add payment rows
        for payment in payments:
            data.append([
                str(payment[0] or '-'),  # Agreement number (purchase_order)
                str(payment[1] or '-'),  # Document number
                str(payment[2])[:10] if payment[2] else '-',  # Posting date
                str(payment[3])[:10] if payment[3] else '-',  # Payment date
                f"{payment[4]:.2f}" if payment[4] else '-',  # Payment amount
                f"{payment[5]:.2f}" if payment[5] else '-',  # Rental
                f"{payment[6]:.2f}" if payment[6] else '-',  # Compensation
                f"{payment[8]:.2f}" if payment[8] else '-',  # Gross amount
            ])
        
        # Add totals row
        data.append([
            '', '', '', 'TOTAL:',
            f"{total_payment:.2f}",
            f"{total_rental:.2f}",
            f"{total_compensation:.2f}",
            f"{total_gross:.2f}"
        ])
        
        # Create table with appropriate column widths
        col_widths = [2.5*cm, 2.5*cm, 2*cm, 2*cm, 2.2*cm, 2*cm, 2.5*cm, 2.2*cm]
        table = Table(data, colWidths=col_widths, repeatRows=1)
        
        table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ea580c')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            
            # Data rows styling
            ('ALIGN', (0, 1), (3, -2), 'CENTER'),
            ('ALIGN', (4, 1), (-1, -2), 'RIGHT'),
            ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -2), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9f9f9')]),
            ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor('#cccccc')),
            ('PADDING', (0, 1), (-1, -2), 6),
            
            # Totals row styling
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#333333')),
            ('ALIGN', (0, -1), (3, -1), 'RIGHT'),
            ('ALIGN', (4, -1), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 9),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#ea580c')),
            ('PADDING', (0, -1), (-1, -1), 8),
        ]))
        
        elements.append(table)
    else:
        no_data_style = ParagraphStyle(
            'NoData',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        no_data = Paragraph("No payment data available for this fiscal year.", no_data_style)
        elements.append(no_data)
    
    elements.append(Spacer(1, 1*cm))
    
    # Footer note
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER
    )
    footer = Paragraph(
        "This is a computer-generated document. No signature is required.<br/>"
        "For queries, please contact UKPN Property and Consent Team.",
        footer_style
    )
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


@router.get("/remittance-documents/{vendor_id}")
async def get_remittance_documents(vendor_id: str, db: Session = Depends(get_db)):
    """
    Get all remittance documents for a vendor
    """
    try:
        query = text("""
            SELECT 
                id,
                fiscal_year,
                file_name,
                file_size,
                created_at
            FROM remittance_documents
            WHERE vendor_id = :vendor_id
            ORDER BY fiscal_year DESC, created_at DESC
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id})
        documents = []
        
        for row in result:
            documents.append({
                "id": row[0],
                "fiscal_year": row[1],
                "file_name": row[2],
                "file_size": row[3],
                "created_at": row[4]
            })
        
        return {
            "success": True,
            "documents": documents
        }

    except Exception as e:
        logger.error(f"Error fetching remittance documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remittance-documents/upload")
async def upload_remittance_document(
    vendor_id: str = Form(...),
    fiscal_year: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a remittance PDF document for a specific vendor and fiscal year
    """
    try:
        # Validate file type
        if not file.content_type == "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Encode to base64 for storage
        file_data_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Check if document already exists for this vendor and year
        check_query = text("""
            SELECT id FROM remittance_documents
            WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
        """)
        
        existing = db.execute(check_query, {
            "vendor_id": vendor_id,
            "fiscal_year": fiscal_year
        }).fetchone()
        
        if existing:
            # Update existing document
            update_query = text("""
                UPDATE remittance_documents
                SET file_name = :file_name,
                    file_data = :file_data,
                    mime_type = :mime_type,
                    file_size = :file_size,
                    updated_at = :updated_at
                WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
            """)
            
            db.execute(update_query, {
                "vendor_id": vendor_id,
                "fiscal_year": fiscal_year,
                "file_name": file.filename,
                "file_data": file_data_base64,
                "mime_type": file.content_type,
                "file_size": file_size,
                "updated_at": datetime.now()
            })
            message = "Document updated successfully"
        else:
            # Insert new document
            insert_query = text("""
                INSERT INTO remittance_documents (
                    vendor_id,
                    fiscal_year,
                    file_name,
                    file_data,
                    mime_type,
                    file_size,
                    created_at
                ) VALUES (
                    :vendor_id,
                    :fiscal_year,
                    :file_name,
                    :file_data,
                    :mime_type,
                    :file_size,
                    :created_at
                )
            """)
            
            db.execute(insert_query, {
                "vendor_id": vendor_id,
                "fiscal_year": fiscal_year,
                "file_name": file.filename,
                "file_data": file_data_base64,
                "mime_type": file.content_type,
                "file_size": file_size,
                "created_at": datetime.now()
            })
            message = "Document uploaded successfully"
        
        db.commit()
        
        return {
            "success": True,
            "message": message,
            "data": {
                "vendor_id": vendor_id,
                "fiscal_year": fiscal_year,
                "file_name": file.filename,
                "file_size": file_size
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading remittance document: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/remittance-documents/download/{vendor_id}/{fiscal_year}")
async def download_remittance_document(
    vendor_id: str,
    fiscal_year: str,
    db: Session = Depends(get_db)
):
    """
    Download remittance PDF document for a specific vendor and fiscal year
    """
    try:
        query = text("""
            SELECT file_data, file_name, mime_type
            FROM remittance_documents
            WHERE vendor_id = :vendor_id AND fiscal_year = :fiscal_year
            ORDER BY created_at DESC
            LIMIT 1
        """)
        
        result = db.execute(query, {
            "vendor_id": vendor_id,
            "fiscal_year": fiscal_year
        }).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No remittance document found for fiscal year {fiscal_year}"
            )
        
        # Decode base64 data
        file_data_base64 = result[0]
        file_data = base64.b64decode(file_data_base64)
        file_name = result[1]
        mime_type = result[2]
        
        return Response(
            content=file_data,
            media_type=mime_type,
            headers={
                "Content-Disposition": f"attachment; filename={file_name}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading remittance document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/remittance-years/{vendor_id}")
async def get_available_years(vendor_id: str, db: Session = Depends(get_db)):
    """
    Get list of fiscal years that have remittance documents for a vendor
    """
    try:
        query = text("""
            SELECT DISTINCT fiscal_year
            FROM remittance_documents
            WHERE vendor_id = :vendor_id
            ORDER BY fiscal_year DESC
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id})
        years = [row[0] for row in result]
        
        return {
            "success": True,
            "years": years
        }

    except Exception as e:
        logger.error(f"Error fetching available years: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
