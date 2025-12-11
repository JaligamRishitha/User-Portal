#!/usr/bin/env python3
"""
Import data for vendor 5000000015 from 5000000015_data.txt into PostgreSQL
"""

import psycopg2
from datetime import datetime

# Database connection
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="ukpn_portal",
    user="ukpn_user",
    password="ukpn_password"
)
cursor = conn.cursor()

vendor_id = "5000000015"

print("=" * 60)
print("Importing data for vendor 5000000015")
print("=" * 60)
print()

try:
    # 1. Insert Vendor
    print("1. Inserting vendor...")
    vendor_data = {
        "vendor_id": vendor_id,
        "title": "0002",
        "first_name": "J A",
        "last_name": "DREIER",
        "email": "susanfrogers@gmail.com",
        "mobile": None,
        "telephone": "07940 012016"
    }

    cursor.execute("""
        INSERT INTO vendors (vendor_id, title, first_name, last_name, email, mobile, telephone, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (vendor_id) DO UPDATE SET
            title = EXCLUDED.title,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            mobile = EXCLUDED.mobile,
            telephone = EXCLUDED.telephone,
            updated_at = NOW()
    """, (
        vendor_data["vendor_id"],
        vendor_data["title"],
        vendor_data["first_name"],
        vendor_data["last_name"],
        vendor_data["email"],
        vendor_data["mobile"],
        vendor_data["telephone"]
    ))
    print(f"   ✓ Vendor {vendor_id} inserted")

    # 2. Insert User Details
    print("2. Inserting user details...")
    cursor.execute("""
        DELETE FROM user_details WHERE vendor_id = %s
    """, (vendor_id,))
    
    cursor.execute("""
        INSERT INTO user_details (vendor_id, street, address_line1, address_line2, city, postcode, house, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, (
        vendor_id,
        "TAMLEY COTTAGE",
        "TAMLEY LANE",
        "HASTINGLEIGH",
        "ASHFORD",
        "TN25 5HW",
        None
    ))
    print("   ✓ User details inserted")

    # 3. Insert Bank Details
    print("3. Inserting bank details...")
    cursor.execute("""
        DELETE FROM bank_details WHERE vendor_id = %s
    """, (vendor_id,))
    
    cursor.execute("""
        INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, (
        vendor_id,
        "",
        "",
        None,
        "K",
        "-",
        "-",
        "-"
    ))
    print("   ✓ Bank details inserted")

    # 4. Insert Payment Schedule Header
    print("4. Inserting payment schedule header...")
    agreement_number = "1000000003"
    
    cursor.execute("""
        INSERT INTO payment_schedule_headers 
        (vendor_id, agreement_number, agreement_type, location, last_payment_date, next_payment_date, total_consent, currency, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (agreement_number) DO UPDATE SET
            vendor_id = EXCLUDED.vendor_id,
            agreement_type = EXCLUDED.agreement_type,
            location = EXCLUDED.location,
            last_payment_date = EXCLUDED.last_payment_date,
            next_payment_date = EXCLUDED.next_payment_date,
            total_consent = EXCLUDED.total_consent,
            currency = EXCLUDED.currency,
            updated_at = NOW()
    """, (
        vendor_id,
        agreement_number,
        "ZWLT",
        "",
        "2023-11-01",
        None,
        0.0,
        ""
    ))
    print(f"   ✓ Payment schedule header {agreement_number} inserted")

    # 5. Insert Payment Schedule Items
    print("5. Inserting payment schedule items...")
    
    # Delete existing items for this agreement
    cursor.execute("""
        DELETE FROM payment_schedule_items WHERE agreement_number = %s
    """, (agreement_number,))
    
    items = [
        {
            "item_number": "00010",
            "start_date": "2021-10-20",
            "land_reg_number": "K651089",
            "short_text": "ARABLE SINGLE POLE WITH 1 STAY 884095",
            "multiplier": 1.000
        },
        {
            "item_number": "00020",
            "start_date": "2021-10-20",
            "land_reg_number": "K758844",
            "short_text": "HEDGEROW SINGLE POLE 884094",
            "multiplier": 1.000
        },
        {
            "item_number": "00030",
            "start_date": "2021-10-20",
            "land_reg_number": "K758844",
            "short_text": "HEDGEROW SINGLE POLE 884062",
            "multiplier": 1.000
        },
        {
            "item_number": "00040",
            "start_date": "2021-10-20",
            "land_reg_number": "K768575",
            "short_text": "HEDGEROW SINGLE POLE 884086",
            "multiplier": 1.000
        },
        {
            "item_number": "00050",
            "start_date": "2021-10-20",
            "land_reg_number": "K758844",
            "short_text": "HEDGEROW SINGLE POLE WITH 1 STAY 884085",
            "multiplier": 1.000
        }
    ]

    for item in items:
        cursor.execute("""
            INSERT INTO payment_schedule_items 
            (agreement_number, item_number, agreement_type, start_date, location, land_reg_number, 
             functional_location, asset_type, asset_number, short_text, last_payment_date, 
             next_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            agreement_number,
            item["item_number"],
            "ZWLT",
            item["start_date"],
            "",
            item["land_reg_number"],
            "",
            "",
            "",
            item["short_text"],
            "2023-11-01",
            None,
            item["multiplier"],
            0.0,
            0.0,
            0.0,
            ""
        ))
        print(f"   ✓ Item {item['item_number']} inserted")

    # 6. Insert Payment History for 2023
    print("6. Inserting payment history for 2023...")
    
    # Delete existing payment history for this vendor and year
    cursor.execute("""
        DELETE FROM payment_history WHERE vendor_id = %s AND fiscal_year = %s
    """, (vendor_id, "2023"))
    
    cursor.execute("""
        INSERT INTO payment_history 
        (vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc,
         gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type,
         posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount,
         cheque_number, payment_date, payment_method, payment_amount, encashment_date,
         void_reason, void_text, void_date, void_user, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (
        vendor_id,
        "1900",
        "2023",
        "2000017143",
        "5110697500",
        "5110697500",
        888.0,
        888.0,
        0.0,
        "V0",
        "Exempt from input VAT",
        "1000000003",
        "ZWLT",
        "2023-11-01",
        "2023-11-01",
        "YW",
        0.0,
        2280.0,
        0.0,
        "171572",
        "2023-11-02",
        "K",
        888.0,
        "2023-11-09",
        "00",
        "",
        None,
        ""
    ))
    print("   ✓ Payment history for 2023 inserted")

    # Commit changes
    conn.commit()

    print()
    print("=" * 60)
    print("✅ Data import completed successfully!")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  Vendor ID: {vendor_id}")
    print(f"  Name: J A DREIER / Ms S F ROGERS")
    print(f"  Email: susanfrogers@gmail.com")
    print(f"  Agreement: {agreement_number}")
    print(f"  Payment Schedule Items: {len(items)}")
    print(f"  Payment History Records: 1 (2023)")
    print()
    print("Next steps:")
    print("  1. Upload the PDF: python upload_remittance.py 5000000015 2023 5000000015_2023.pdf")
    print("  2. Test in frontend: Login with vendor 5000000015")
    print()

except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
    raise

finally:
    cursor.close()
    conn.close()
