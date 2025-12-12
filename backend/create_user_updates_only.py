#!/usr/bin/env python3
"""
Create 4 user details updates for the 2 grantors
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
print("Creating 4 User Details Updates")
print("=" * 60)
print()

try:
    # Update 1: Grantor 5000000015 - Mobile change
    print(f"1. User Details Update - Grantor 5000000015...")
    updated_time = datetime.now() - timedelta(hours=12)
    cursor.execute("""
        ALTER TABLE vendors DISABLE TRIGGER ALL;
    """)
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("07700 111 222", updated_time, "5000000015"))
    cursor.execute("""
        ALTER TABLE vendors ENABLE TRIGGER ALL;
    """)
    print(f"   ✓ Mobile updated to: 07700 111 222")
    
    # Update 2: Grantor 5000000061 - Telephone change
    print(f"2. User Details Update - Grantor 5000000061...")
    updated_time = datetime.now() - timedelta(hours=24)
    cursor.execute("""
        ALTER TABLE vendors DISABLE TRIGGER ALL;
    """)
    cursor.execute("""
        UPDATE vendors 
        SET telephone = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("020 7946 5678", updated_time, "5000000061"))
    cursor.execute("""
        ALTER TABLE vendors ENABLE TRIGGER ALL;
    """)
    print(f"   ✓ Telephone updated to: 020 7946 5678")
    
    # Update 3: Grantor 5000000015 - First name change
    print(f"3. User Details Update - Grantor 5000000015...")
    updated_time = datetime.now() - timedelta(hours=36)
    cursor.execute("""
        ALTER TABLE vendors DISABLE TRIGGER ALL;
    """)
    cursor.execute("""
        UPDATE vendors 
        SET first_name = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("John A", updated_time, "5000000015"))
    cursor.execute("""
        ALTER TABLE vendors ENABLE TRIGGER ALL;
    """)
    print(f"   ✓ First name updated to: John A")
    
    # Update 4: Grantor 5000000061 - Mobile change
    print(f"4. User Details Update - Grantor 5000000061...")
    updated_time = datetime.now() - timedelta(hours=48)
    cursor.execute("""
        ALTER TABLE vendors DISABLE TRIGGER ALL;
    """)
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("07822 333 444", updated_time, "5000000061"))
    cursor.execute("""
        ALTER TABLE vendors ENABLE TRIGGER ALL;
    """)
    print(f"   ✓ Mobile updated to: 07822 333 444")
    
    conn.commit()
    
    # Verify
    print("\nVerifying...")
    cursor.execute("""
        SELECT 
            v.vendor_id,
            v.first_name,
            v.mobile,
            v.telephone,
            v.updated_at > v.created_at as vendor_updated,
            COALESCE((SELECT bd.updated_at > bd.created_at FROM bank_details bd WHERE bd.vendor_id = v.vendor_id), false) as bank_updated
        FROM vendors v
        WHERE v.vendor_id IN ('5000000015', '5000000061')
        ORDER BY v.vendor_id
    """)
    
    results = cursor.fetchall()
    
    print()
    print("=" * 60)
    print("✅ 4 User Details Updates Created!")
    print("=" * 60)
    print()
    for row in results:
        print(f"Grantor {row[0]}:")
        print(f"  Name: {row[1]}")
        print(f"  Mobile: {row[2]}")
        print(f"  Telephone: {row[3]}")
        print(f"  Vendor updated: {row[4]} ✓")
        print(f"  Bank updated: {row[5]} {'✓' if not row[5] else '❌ (should be False)'}")
        print()
    
    if all(not row[5] for row in results):
        print("✅ All checks passed! User Details Updates should appear in Request Console!")
    else:
        print("⚠️  Bank details still showing as updated. May not appear correctly.")
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
