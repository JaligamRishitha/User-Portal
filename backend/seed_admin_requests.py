#!/usr/bin/env python3
"""
Seed script to create mock user requests for the admin console
"""

import psycopg2
from datetime import datetime, timedelta
import random

# Database connection
# Use 'postgres' as host when running in Docker, 'localhost' when running locally
import os
db_host = os.getenv('DB_HOST', 'postgres')

conn = psycopg2.connect(
    host=db_host,
    port=5432,
    database="ukpn_portal",
    user="ukpn_user",
    password="ukpn_password"
)
cursor = conn.cursor()

print("=" * 60)
print("Seeding Admin Request Console Data")
print("=" * 60)
print()

try:
    # First, let's create some additional vendors if they don't exist
    vendors = [
        {
            "vendor_id": "5000000020",
            "title": "Mr.",
            "first_name": "James",
            "last_name": "Anderson",
            "email": "j.anderson@example.com",
            "mobile": "07700 900 001",
            "telephone": "020 7946 0001"
        },
        {
            "vendor_id": "5000000021",
            "title": "Ms.",
            "first_name": "Sarah",
            "last_name": "Miller",
            "email": "s.miller@firm.com",
            "mobile": "07700 900 002",
            "telephone": "020 7946 0002"
        },
        {
            "vendor_id": "5000000022",
            "title": "Mr.",
            "first_name": "David",
            "last_name": "Clark",
            "email": "d.clark@land.co.uk",
            "mobile": "07700 900 003",
            "telephone": "020 7946 0003"
        },
        {
            "vendor_id": "5000000023",
            "title": "Mrs.",
            "first_name": "Emma",
            "last_name": "Wilson",
            "email": "emma.w@estate.com",
            "mobile": "07700 900 004",
            "telephone": "020 7946 0004"
        },
        {
            "vendor_id": "5000000024",
            "title": "Mr.",
            "first_name": "Michael",
            "last_name": "Brown",
            "email": "m.brown@property.com",
            "mobile": "07700 900 005",
            "telephone": "020 7946 0005"
        },
        {
            "vendor_id": "5000000025",
            "title": "Ms.",
            "first_name": "Lisa",
            "last_name": "Taylor",
            "email": "lisa.t@homes.co.uk",
            "mobile": "07700 900 006",
            "telephone": "020 7946 0006"
        },
        {
            "vendor_id": "5000000026",
            "title": "Mr.",
            "first_name": "Robert",
            "last_name": "Davies",
            "email": "r.davies@realty.com",
            "mobile": "07700 900 007",
            "telephone": "020 7946 0007"
        },
        {
            "vendor_id": "5000000027",
            "title": "Mrs.",
            "first_name": "Jennifer",
            "last_name": "Evans",
            "email": "j.evans@properties.uk",
            "mobile": "07700 900 008",
            "telephone": "020 7946 0008"
        }
    ]

    print("1. Creating vendors...")
    for vendor in vendors:
        cursor.execute("""
            INSERT INTO vendors (vendor_id, title, first_name, last_name, email, password_hash, mobile, telephone, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (vendor_id) DO UPDATE SET
                title = EXCLUDED.title,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                email = EXCLUDED.email,
                mobile = EXCLUDED.mobile,
                telephone = EXCLUDED.telephone,
                updated_at = NOW()
        """, (
            vendor["vendor_id"],
            vendor["title"],
            vendor["first_name"],
            vendor["last_name"],
            vendor["email"],
            "$2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC",  # Test@123
            vendor["mobile"],
            vendor["telephone"],
            datetime.now() - timedelta(days=random.randint(1, 30)),
            datetime.now()
        ))
    print(f"   ✓ Created {len(vendors)} vendors")

    # Create user details for vendors
    print("2. Creating user details...")
    user_details = [
        {"vendor_id": "5000000020", "street": "15 PARK AVENUE", "address_line1": "KENSINGTON", "address_line2": "", "city": "LONDON", "postcode": "SW1A 1AA"},
        {"vendor_id": "5000000021", "street": "42 HIGH STREET", "address_line1": "CHELSEA", "address_line2": "", "city": "LONDON", "postcode": "SW3 2AB"},
        {"vendor_id": "5000000022", "street": "78 MANOR ROAD", "address_line1": "RICHMOND", "address_line2": "", "city": "LONDON", "postcode": "TW9 1XY"},
        {"vendor_id": "5000000023", "street": "23 CHURCH LANE", "address_line1": "WIMBLEDON", "address_line2": "", "city": "LONDON", "postcode": "SW19 3NN"},
        {"vendor_id": "5000000024", "street": "56 STATION ROAD", "address_line1": "CROYDON", "address_line2": "", "city": "LONDON", "postcode": "CR0 2AP"},
        {"vendor_id": "5000000025", "street": "89 VICTORIA STREET", "address_line1": "WESTMINSTER", "address_line2": "", "city": "LONDON", "postcode": "SW1E 5JL"},
        {"vendor_id": "5000000026", "street": "34 BAKER STREET", "address_line1": "MARYLEBONE", "address_line2": "", "city": "LONDON", "postcode": "NW1 6XE"},
        {"vendor_id": "5000000027", "street": "67 OXFORD STREET", "address_line1": "SOHO", "address_line2": "", "city": "LONDON", "postcode": "W1D 2ES"},
    ]

    for detail in user_details:
        cursor.execute("""
            DELETE FROM user_details WHERE vendor_id = %s
        """, (detail["vendor_id"],))
        
        cursor.execute("""
            INSERT INTO user_details (vendor_id, street, address_line1, address_line2, city, postcode, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            detail["vendor_id"],
            detail["street"],
            detail["address_line1"],
            detail["address_line2"],
            detail["city"],
            detail["postcode"]
        ))
    print(f"   ✓ Created {len(user_details)} user details")

    # Create diverse update requests (mix of bank details and user details)
    print("3. Creating update requests...")
    
    # Bank details update requests (some vendors)
    bank_update_requests = [
        {
            "vendor_id": "5000000020",
            "old_data": {"account_number": "12345678", "sort_code": "20-00-00", "account_holder": "James Anderson"},
            "new_data": {"account_number": "87654321", "sort_code": "20-65-18", "account_holder": "James R Anderson"}
        },
        {
            "vendor_id": "5000000022",
            "old_data": {"account_number": "34567890", "sort_code": "40-00-00", "account_holder": "David Clark"},
            "new_data": {"account_number": "98765432", "sort_code": "40-47-84", "account_holder": "David Clark"}
        },
        {
            "vendor_id": "5000000024",
            "old_data": {"sort_code": "50-00-00"},
            "new_data": {"sort_code": "50-30-00"}
        },
    ]
    
    for request in bank_update_requests:
        vendor_idx = int(request["vendor_id"][-2:]) - 20
        vendor = vendors[vendor_idx]
        
        # Delete existing bank details
        cursor.execute("DELETE FROM bank_details WHERE vendor_id = %s", (request["vendor_id"],))
        
        # Insert old bank details with past created_at
        created_time = datetime.now() - timedelta(days=random.randint(30, 90))
        old_account = request["old_data"].get("account_number", f"{random.randint(10000000, 99999999)}")
        old_sort = request["old_data"].get("sort_code", f"{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}")
        old_holder = request["old_data"].get("account_holder", f"{vendor['first_name']} {vendor['last_name']}")
        
        cursor.execute("""
            INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            request["vendor_id"],
            old_account,
            old_sort,
            old_holder,
            "BACS",
            "-",
            "-",
            "-",
            created_time,
            created_time
        ))
        
        # Update with new bank details (recent updated_at to show as pending update)
        updated_time = datetime.now() - timedelta(hours=random.randint(1, 48))
        new_account = request["new_data"].get("account_number", old_account)
        new_sort = request["new_data"].get("sort_code", old_sort)
        new_holder = request["new_data"].get("account_holder", old_holder)
        
        cursor.execute("""
            UPDATE bank_details 
            SET account_number = %s, sort_code = %s, account_holder_name = %s, updated_at = %s
            WHERE vendor_id = %s
        """, (new_account, new_sort, new_holder, updated_time, request["vendor_id"]))
    
    print(f"   ✓ Created {len(bank_update_requests)} bank details update requests")
    
    # User details update requests (other vendors)
    user_update_requests = [
        {
            "vendor_id": "5000000021",
            "fields": ["mobile"],
            "old_data": {"mobile": "07700 900 002"},
            "new_data": {"mobile": "07811 234 567"}
        },
        {
            "vendor_id": "5000000023",
            "fields": ["first_name", "email"],
            "old_data": {"first_name": "Emma", "email": "emma.w@estate.com"},
            "new_data": {"first_name": "Emma Jane", "email": "emma.wilson@newestate.com"}
        },
        {
            "vendor_id": "5000000025",
            "fields": ["mobile", "telephone"],
            "old_data": {"mobile": "07700 900 006", "telephone": "020 7946 0006"},
            "new_data": {"mobile": "07922 345 678", "telephone": "020 8123 4567"}
        },
        {
            "vendor_id": "5000000026",
            "fields": ["email"],
            "old_data": {"email": "r.davies@realty.com"},
            "new_data": {"email": "robert.davies@newrealty.co.uk"}
        },
        {
            "vendor_id": "5000000027",
            "fields": ["first_name", "mobile"],
            "old_data": {"first_name": "Jennifer", "mobile": "07700 900 008"},
            "new_data": {"first_name": "Jenny", "mobile": "07733 456 789"}
        },
    ]
    
    for request in user_update_requests:
        vendor_idx = int(request["vendor_id"][-2:]) - 20
        vendor = vendors[vendor_idx]
        
        # Update vendor with new data (recent updated_at to show as pending update)
        updated_time = datetime.now() - timedelta(hours=random.randint(2, 72))
        
        update_fields = []
        update_values = []
        
        if "first_name" in request["fields"]:
            update_fields.append("first_name = %s")
            update_values.append(request["new_data"]["first_name"])
        
        if "email" in request["fields"]:
            update_fields.append("email = %s")
            update_values.append(request["new_data"]["email"])
        
        if "mobile" in request["fields"]:
            update_fields.append("mobile = %s")
            update_values.append(request["new_data"]["mobile"])
        
        if "telephone" in request["fields"]:
            update_fields.append("telephone = %s")
            update_values.append(request["new_data"]["telephone"])
        
        if update_fields:
            update_fields.append("updated_at = %s")
            update_values.append(updated_time)
            update_values.append(request["vendor_id"])
            
            cursor.execute(f"""
                UPDATE vendors 
                SET {', '.join(update_fields)}
                WHERE vendor_id = %s
            """, update_values)
    
    print(f"   ✓ Created {len(user_update_requests)} user details update requests")

    # Create moving house notifications
    print("4. Creating moving house notifications...")
    moving_house_requests = [
        {
            "vendor_id": "5000000021",
            "old_address": "42 HIGH STREET, CHELSEA",
            "old_postcode": "SW3 2AB",
            "new_address": "100 NEW ROAD, FULHAM",
            "new_postcode": "SW6 4TG",
            "new_owner_name": "Thomas Wright",
            "new_owner_email": "t.wright@example.com",
            "new_owner_mobile": "07800 123 456",
            "status": "pending",
            "days_ago": 0.1  # 2-3 hours ago
        },
        {
            "vendor_id": "5000000023",
            "old_address": "23 CHURCH LANE, WIMBLEDON",
            "old_postcode": "SW19 3NN",
            "new_address": "45 PARK VIEW, PUTNEY",
            "new_postcode": "SW15 2RS",
            "new_owner_name": "Sophie Green",
            "new_owner_email": "s.green@example.com",
            "new_owner_mobile": "07800 234 567",
            "status": "pending",
            "days_ago": 0.5  # 12 hours ago
        },
        {
            "vendor_id": "5000000025",
            "old_address": "89 VICTORIA STREET, WESTMINSTER",
            "old_postcode": "SW1E 5JL",
            "new_address": "12 RIVERSIDE WALK, BATTERSEA",
            "new_postcode": "SW11 3UX",
            "new_owner_name": "Oliver Harris",
            "new_owner_email": "o.harris@example.com",
            "new_owner_mobile": "07800 345 678",
            "status": "approved",
            "days_ago": 2
        },
        {
            "vendor_id": "5000000026",
            "old_address": "34 BAKER STREET, MARYLEBONE",
            "old_postcode": "NW1 6XE",
            "new_address": "78 REGENT STREET, MAYFAIR",
            "new_postcode": "W1B 5AH",
            "new_owner_name": "Charlotte King",
            "new_owner_email": "c.king@example.com",
            "new_owner_mobile": "07800 456 789",
            "status": "rejected",
            "days_ago": 3
        },
        {
            "vendor_id": "5000000027",
            "old_address": "67 OXFORD STREET, SOHO",
            "old_postcode": "W1D 2ES",
            "new_address": "90 PICCADILLY, WESTMINSTER",
            "new_postcode": "W1J 8DX",
            "new_owner_name": "James Martin",
            "new_owner_email": "j.martin@example.com",
            "new_owner_mobile": "07800 567 890",
            "status": "pending",
            "days_ago": 1
        }
    ]

    for request in moving_house_requests:
        submission_date = datetime.now() - timedelta(days=request["days_ago"])
        
        cursor.execute("""
            INSERT INTO moving_house_notifications (
                vendor_id, old_address, old_postcode, new_address, new_postcode,
                new_owner_name, new_owner_email, new_owner_mobile,
                submission_date, status, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            request["vendor_id"],
            request["old_address"],
            request["old_postcode"],
            request["new_address"],
            request["new_postcode"],
            request["new_owner_name"],
            request["new_owner_email"],
            request["new_owner_mobile"],
            submission_date,
            request["status"]
        ))
    print(f"   ✓ Created {len(moving_house_requests)} moving house notifications")

    # Commit all changes
    conn.commit()

    print()
    print("=" * 60)
    print("✅ Seed data created successfully!")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  Vendors: {len(vendors)}")
    print(f"  User Details: {len(user_details)}")
    print(f"  Bank Details Update Requests: {len(bank_update_requests)}")
    print(f"  User Details Update Requests: {len(user_update_requests)}")
    print(f"  Moving House Requests: {len(moving_house_requests)}")
    print()
    print("Request Types in Console:")
    print(f"  - Moving House: {len(moving_house_requests)} requests")
    print(f"  - Login Activity: {len(vendors)} records")
    print(f"  - Bank Details Updates: {len(bank_update_requests)} requests")
    print(f"  - User Details Updates: {len(user_update_requests)} requests")
    print()
    print("Status Distribution:")
    pending = sum(1 for r in moving_house_requests if r['status'] == 'pending')
    approved = sum(1 for r in moving_house_requests if r['status'] == 'approved')
    rejected = sum(1 for r in moving_house_requests if r['status'] == 'rejected')
    print(f"  - Pending: {pending}")
    print(f"  - Approved: {approved}")
    print(f"  - Rejected: {rejected}")
    print()
    print("Next steps:")
    print("  1. Login as admin: admin@ukpn.com / Admin@123")
    print("  2. Go to Request Console")
    print("  3. See all the mock requests!")
    print()

except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
    raise

finally:
    cursor.close()
    conn.close()
