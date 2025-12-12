#!/usr/bin/env python3
"""
Create 2 real users and realistic admin console data for them
"""
import psycopg2
from datetime import datetime, timedelta
import random
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "postgres"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("DB_NAME", "ukpn_portal"),
    user=os.getenv("DB_USER", "ukpn_user"),
    password=os.getenv("DB_PASSWORD", "ukpn_password")
)
cursor = conn.cursor()

print("=" * 60)
print("Creating 2 Real Users + Request Console Data")
print("=" * 60)
print()

try:
    # Create 2 real users
    users = [
        {
            "vendor_id": "5000000015",
            "first_name": "James",
            "last_name": "Wilson",
            "email": "james.wilson@example.com",
            "mobile": "07700 900 123",
            "telephone": "020 7946 0958",
            "password": "Password@123"
        },
        {
            "vendor_id": "5000000061",
            "first_name": "Sarah",
            "last_name": "Thompson",
            "email": "sarah.thompson@example.com",
            "mobile": "07811 234 567",
            "telephone": "020 7946 0876",
            "password": "Password@123"
        }
    ]
    
    print("Creating 2 real users...")
    for user in users:
        hashed_password = pwd_context.hash(user["password"])
        created_at = datetime.now() - timedelta(days=random.randint(60, 180))
        
        cursor.execute("""
            INSERT INTO vendors (
                vendor_id, first_name, last_name, email, mobile, telephone,
                hashed_password, is_active, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (vendor_id) DO NOTHING
        """, (
            user["vendor_id"],
            user["first_name"],
            user["last_name"],
            user["email"],
            user["mobile"],
            user["telephone"],
            hashed_password,
            True,
            created_at,
            created_at
        ))
        print(f"  ✓ {user['vendor_id']}: {user['first_name']} {user['last_name']}")
    
    conn.commit()
    print()
    
    # User 1: Bank Details Update (account number change)
    print(f"1. Bank Details Update for {users[0]['vendor_id']}...")
    
    # Create old bank details
    old_created = datetime.now() - timedelta(days=45)
    cursor.execute("""
        INSERT INTO bank_details (
            vendor_id, account_number, sort_code, account_holder_name,
            payment_method, zahls, confs, sperr, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (vendor_id) DO UPDATE SET
            account_number = EXCLUDED.account_number,
            updated_at = EXCLUDED.updated_at
    """, (
        users[0]["vendor_id"],
        "12345678",
        "20-00-00",
        f"{users[0]['first_name']} {users[0]['last_name']}",
        "BACS",
        "-",
        "-",
        "-",
        old_created,
        old_created
    ))
    
    # Update to new account number (recent change)
    new_updated = datetime.now() - timedelta(hours=6)
    cursor.execute("""
        UPDATE bank_details 
        SET account_number = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("87654321", new_updated, users[0]["vendor_id"]))
    
    print(f"   ✓ Account number: 12345678 → 87654321")
    
    # User 2: User Details Update (mobile number change)
    print(f"2. User Details Update for {users[1]['vendor_id']}...")
    
    new_mobile = "07999 888 777"
    mobile_updated = datetime.now() - timedelta(hours=12)
    
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, (new_mobile, mobile_updated, users[1]["vendor_id"]))
    
    print(f"   ✓ Mobile: {users[1]['mobile']} → {new_mobile}")
    
    # User 1: Moving House Notification
    print(f"3. Moving House Request for {users[0]['vendor_id']}...")
    
    submission_date = datetime.now() - timedelta(hours=3)
    cursor.execute("""
        INSERT INTO moving_house_notifications (
            vendor_id, old_address, old_postcode, new_address, new_postcode,
            new_owner_name, new_owner_email, new_owner_mobile,
            submission_date, status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        users[0]["vendor_id"],
        "15 OLD STREET, LONDON",
        "EC1V 9NR",
        "42 NEW ROAD, LONDON",
        "SW1A 1AA",
        "Michael Brown",
        "m.brown@example.com",
        "07800 123 456",
        submission_date,
        "pending",
        datetime.now(),
        datetime.now()
    ))
    
    print(f"   ✓ Moving house: Pending status")
    
    conn.commit()
    
    print()
    print("=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print()
    print("Real Users Created:")
    for user in users:
        print(f"  • {user['vendor_id']}: {user['first_name']} {user['last_name']}")
        print(f"    Email: {user['email']}")
        print(f"    Password: {user['password']}")
    print()
    print("Request Console Data:")
    print(f"  • Bank Details Update: 1 (Grantor {users[0]['vendor_id']})")
    print(f"  • User Details Update: 1 (Grantor {users[1]['vendor_id']})")
    print(f"  • Moving House: 1 (Grantor {users[0]['vendor_id']})")
    print()
    print("Next Steps:")
    print("  1. Login as admin: admin@ukpn.com / Admin@123")
    print("  2. Go to Request Console")
    print("  3. View realistic requests for these 2 grantors!")
    print()

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    raise
finally:
    cursor.close()
    conn.close()
