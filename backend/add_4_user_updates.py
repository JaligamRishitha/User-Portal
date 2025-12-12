#!/usr/bin/env python3
"""
Add 4 more user details updates randomly for the 2 grantors
"""
import psycopg2
from datetime import datetime, timedelta
import random
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
print("Adding 4 User Details Updates")
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
    
    # Randomly distribute 4 updates between the 2 users
    updates = [
        # Update 1: Grantor 5000000015 - Mobile change
        {
            "grantor": users[0][0],
            "field": "mobile",
            "value": "07700 111 222",
            "hours_ago": 72
        },
        # Update 2: Grantor 5000000061 - Telephone change
        {
            "grantor": users[1][0],
            "field": "telephone",
            "value": "020 7946 5678",
            "hours_ago": 84
        },
        # Update 3: Grantor 5000000015 - Email change
        {
            "grantor": users[0][0],
            "field": "email",
            "value": "dreier.rogers@example.com",
            "hours_ago": 96
        },
        # Update 4: Grantor 5000000061 - Mobile change
        {
            "grantor": users[1][0],
            "field": "mobile",
            "value": "07822 333 444",
            "hours_ago": 108
        }
    ]
    
    # Shuffle for randomness
    random.shuffle(updates)
    
    for i, update in enumerate(updates, start=9):
        print(f"{i}. User Details Update - Grantor {update['grantor']}...")
        
        updated_time = datetime.now() - timedelta(hours=update['hours_ago'])
        
        cursor.execute(f"""
            UPDATE vendors 
            SET {update['field']} = %s, updated_at = %s
            WHERE vendor_id = %s
        """, (update['value'], updated_time, update['grantor']))
        
        print(f"   ✓ {update['field'].capitalize()} updated to: {update['value']}")
    
    conn.commit()
    
    # Count updates per grantor
    cursor.execute("""
        SELECT vendor_id, COUNT(*) 
        FROM (
            SELECT vendor_id FROM vendors WHERE updated_at > NOW() - INTERVAL '120 hours'
        ) AS recent
        GROUP BY vendor_id
    """)
    
    print()
    print("=" * 60)
    print("✅ 4 User Details Updates Added!")
    print("=" * 60)
    print()
    print("Total Request Console Entries: 12")
    print()
    print("New User Details Updates:")
    for update in updates:
        print(f"  • {update['grantor']}: {update['field']} → {update['value']}")
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
