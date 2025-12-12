#!/usr/bin/env python3
"""
Create realistic request console data for the 2 existing grantors only
- 5000000015: J A DREIER
- 5000000061: D L BOLTON
"""
import psycopg2
from datetime import datetime, timedelta
import os

conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "postgres"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("DB_NAME", "ukpn_portal"),
    user=os.getenv("DB_USER", "ukpn_user"),
    password=os.getenv("DB_PASSWORD", "ukpn_password")
)
cursor = conn.cursor()

print("=" * 60)
print("Creating Request Console Data - 2 Grantors Only")
print("=" * 60)
print()

try:
    # Clean up any existing dummy data
    print("Cleaning up old request console data...")
    cursor.execute("DELETE FROM moving_house_notifications;")
    print("  ✓ Cleared moving house notifications")
    
    # Get the 2 real users
    cursor.execute("""
        SELECT vendor_id, first_name, last_name, email 
        FROM vendors 
        WHERE vendor_id IN ('5000000015', '5000000061')
        ORDER BY vendor_id
    """)
    users = cursor.fetchall()
    
    if len(users) != 2:
        print(f"❌ Expected 2 users, found {len(users)}")
        exit(1)
    
    print(f"\nFound 2 grantors:")
    for user in users:
        print(f"  • {user[0]}: {user[1]} {user[2]}")
    print()
    
    # Grantor 5000000015: Bank Details Update (sort code change)
    print(f"1. Bank Details Update - Grantor {users[0][0]}...")
    
    # Update bank details with new sort code
    updated_time = datetime.now() - timedelta(hours=8)
    cursor.execute("""
        UPDATE bank_details 
        SET sort_code = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("20-30-40", updated_time, users[0][0]))
    
    print(f"   ✓ Sort code updated to: 20-30-40")
    
    # Grantor 5000000061: User Details Update (mobile number change)
    print(f"2. User Details Update - Grantor {users[1][0]}...")
    
    new_mobile = "07811 999 888"
    mobile_updated = datetime.now() - timedelta(hours=15)
    
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, (new_mobile, mobile_updated, users[1][0]))
    
    print(f"   ✓ Mobile updated to: {new_mobile}")
    
    # Grantor 5000000015: Moving House Notification
    print(f"3. Moving House Request - Grantor {users[0][0]}...")
    
    submission_date = datetime.now() - timedelta(hours=4)
    cursor.execute("""
        INSERT INTO moving_house_notifications (
            vendor_id, old_address, old_postcode, new_address, new_postcode,
            new_owner_name, new_owner_email, new_owner_mobile,
            submission_date, status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        users[0][0],
        "TAMLEY COTTAGE, TAMLEY LANE, HASTINGLEIGH",
        "TN25 5HW",
        "15 PARK AVENUE, ASHFORD",
        "TN24 8EX",
        "Robert Smith",
        "r.smith@example.com",
        "07700 123 456",
        submission_date,
        "pending",
        datetime.now(),
        datetime.now()
    ))
    
    print(f"   ✓ Moving house notification created")
    
    conn.commit()
    
    print()
    print("=" * 60)
    print("✅ Request Console Data Created Successfully!")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  Grantors: 2 ({users[0][0]}, {users[1][0]})")
    print(f"  Bank Details Updates: 1")
    print(f"  User Details Updates: 1")
    print(f"  Moving House Requests: 1")
    print()
    print("Request Console will show:")
    print(f"  • Bank Details Update for {users[0][0]} (sort code change)")
    print(f"  • User Details Update for {users[1][0]} (mobile change)")
    print(f"  • Moving House Request for {users[0][0]} (pending)")
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
