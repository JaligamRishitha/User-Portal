#!/usr/bin/env python3
"""
Add 5 more realistic request console entries for the 2 existing grantors
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
print("Adding 5 More Request Console Entries")
print("=" * 60)
print()

try:
    # Get the 2 real users
    cursor.execute("""
        SELECT vendor_id, first_name, last_name, email, mobile, telephone
        FROM vendors 
        WHERE vendor_id IN ('5000000015', '5000000061')
        ORDER BY vendor_id
    """)
    users = cursor.fetchall()
    
    print(f"Using 2 grantors:")
    for user in users:
        print(f"  • {user[0]}: {user[1]} {user[2]}")
    print()
    
    # Request 4: Grantor 5000000061 - Bank Details Update (account number change)
    print(f"4. Bank Details Update - Grantor {users[1][0]}...")
    
    updated_time = datetime.now() - timedelta(hours=20)
    cursor.execute("""
        UPDATE bank_details 
        SET account_number = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("98765432", updated_time, users[1][0]))
    
    print(f"   ✓ Account number updated to: 98765432")
    
    # Request 5: Grantor 5000000015 - User Details Update (telephone change)
    print(f"5. User Details Update - Grantor {users[0][0]}...")
    
    new_telephone = "020 7946 1234"
    tel_updated = datetime.now() - timedelta(hours=28)
    
    cursor.execute("""
        UPDATE vendors 
        SET telephone = %s, updated_at = %s
        WHERE vendor_id = %s
    """, (new_telephone, tel_updated, users[0][0]))
    
    print(f"   ✓ Telephone updated to: {new_telephone}")
    
    # Request 6: Grantor 5000000061 - Moving House Notification
    print(f"6. Moving House Request - Grantor {users[1][0]}...")
    
    submission_date = datetime.now() - timedelta(hours=36)
    cursor.execute("""
        INSERT INTO moving_house_notifications (
            vendor_id, old_address, old_postcode, new_address, new_postcode,
            new_owner_name, new_owner_email, new_owner_mobile,
            submission_date, status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        users[1][0],
        "BORHEAM HALL, THE CHASE, BOREHAM",
        "CM3 3DQ",
        "25 HIGH STREET, CHELMSFORD",
        "CM1 1BE",
        "Emma Johnson",
        "e.johnson@example.com",
        "07900 654 321",
        submission_date,
        "pending",
        datetime.now(),
        datetime.now()
    ))
    
    print(f"   ✓ Moving house notification created")
    
    # Request 7: Grantor 5000000015 - Bank Details Update (account holder name change)
    print(f"7. Bank Details Update - Grantor {users[0][0]}...")
    
    updated_time = datetime.now() - timedelta(hours=48)
    cursor.execute("""
        UPDATE bank_details 
        SET account_holder_name = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("S F ROGERS", updated_time, users[0][0]))
    
    print(f"   ✓ Account holder name updated to: S F ROGERS")
    
    # Request 8: Grantor 5000000061 - User Details Update (email change)
    print(f"8. User Details Update - Grantor {users[1][0]}...")
    
    new_email = "bolton.farms@example.com"
    email_updated = datetime.now() - timedelta(hours=60)
    
    cursor.execute("""
        UPDATE vendors 
        SET email = %s, updated_at = %s
        WHERE vendor_id = %s
    """, (new_email, email_updated, users[1][0]))
    
    print(f"   ✓ Email updated to: {new_email}")
    
    conn.commit()
    
    print()
    print("=" * 60)
    print("✅ 5 More Requests Added Successfully!")
    print("=" * 60)
    print()
    print("Total Request Console Entries: 8")
    print()
    print("Breakdown by Grantor:")
    print(f"  {users[0][0]} (J A DREIER):")
    print(f"    • Bank Details Updates: 2")
    print(f"    • User Details Updates: 2")
    print(f"    • Moving House: 1")
    print()
    print(f"  {users[1][0]} (D L BOLTON):")
    print(f"    • Bank Details Updates: 2")
    print(f"    • User Details Updates: 2")
    print(f"    • Moving House: 1")
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
