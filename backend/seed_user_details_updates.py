#!/usr/bin/env python3
"""
Create user details updates by updating the user_details table
This will show in Request Console as separate from bank updates
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
print("Creating User Details Updates (user_details table)")
print("=" * 60)
print()

try:
    # Get the 2 real users
    cursor.execute("""
        SELECT v.vendor_id, v.first_name, v.last_name, ud.street, ud.city, ud.postcode
        FROM vendors v
        LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
        WHERE v.vendor_id IN ('5000000015', '5000000061')
        ORDER BY v.vendor_id
    """)
    users = cursor.fetchall()
    
    print(f"Found {len(users)} grantors:")
    for user in users:
        print(f"  • {user[0]}: {user[1]} {user[2]}")
    print()
    
    # Update 1: Grantor 5000000015 - Address change
    print(f"1. User Details Update - Grantor {users[0][0]}...")
    updated_time = datetime.now() - timedelta(hours=10)
    cursor.execute("""
        UPDATE user_details 
        SET street = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("NEW COTTAGE", updated_time, users[0][0]))
    print(f"   ✓ Street updated to: NEW COTTAGE")
    
    # Update 2: Grantor 5000000061 - City change
    print(f"2. User Details Update - Grantor {users[1][0]}...")
    updated_time = datetime.now() - timedelta(hours=22)
    cursor.execute("""
        UPDATE user_details 
        SET city = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("LONDON", updated_time, users[1][0]))
    print(f"   ✓ City updated to: LONDON")
    
    # Update 3: Grantor 5000000015 - Postcode change
    print(f"3. User Details Update - Grantor {users[0][0]}...")
    updated_time = datetime.now() - timedelta(hours=34)
    cursor.execute("""
        UPDATE user_details 
        SET postcode = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("TN25 6XX", updated_time, users[0][0]))
    print(f"   ✓ Postcode updated to: TN25 6XX")
    
    # Update 4: Grantor 5000000061 - Address line change
    print(f"4. User Details Update - Grantor {users[1][0]}...")
    updated_time = datetime.now() - timedelta(hours=46)
    cursor.execute("""
        UPDATE user_details 
        SET address_line1 = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("THE MEADOW", updated_time, users[1][0]))
    print(f"   ✓ Address line 1 updated to: THE MEADOW")
    
    conn.commit()
    
    # Verify the updates
    cursor.execute("""
        SELECT ud.vendor_id, ud.created_at, ud.updated_at
        FROM user_details ud
        WHERE ud.vendor_id IN ('5000000015', '5000000061')
        AND ud.updated_at > ud.created_at
        ORDER BY ud.updated_at DESC
    """)
    
    results = cursor.fetchall()
    
    print()
    print("=" * 60)
    print("✅ User Details Updates Created!")
    print("=" * 60)
    print()
    print(f"Total user_details updates: {len(results)}")
    for row in results:
        print(f"  • {row[0]}: updated_at > created_at ✓")
    print()
    print("These should now appear in Request Console!")
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
