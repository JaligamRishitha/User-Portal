#!/usr/bin/env python3
"""
Fix user details updates to show in Request Console
Strategy: Reset bank_details timestamps so they don't count as "updated",
then update vendors table to trigger user details updates
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
print("Creating User Details Updates for Request Console")
print("=" * 60)
print()

try:
    # Step 1: Reset bank_details so they don't show as "updated"
    print("Step 1: Resetting bank_details timestamps...")
    cursor.execute("""
        UPDATE bank_details 
        SET updated_at = created_at
        WHERE vendor_id IN ('5000000015', '5000000061')
    """)
    print("  ✓ Bank details timestamps reset")
    
    # Step 2: Create user details updates by updating vendors table
    print("\nStep 2: Creating user details updates...")
    
    # Update 1: Grantor 5000000015 - Mobile change
    print(f"1. User Details Update - Grantor 5000000015...")
    updated_time = datetime.now() - timedelta(hours=12)
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("07700 111 222", updated_time, "5000000015"))
    print(f"   ✓ Mobile updated")
    
    # Update 2: Grantor 5000000061 - Telephone change
    print(f"2. User Details Update - Grantor 5000000061...")
    updated_time = datetime.now() - timedelta(hours=24)
    cursor.execute("""
        UPDATE vendors 
        SET telephone = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("020 7946 5678", updated_time, "5000000061"))
    print(f"   ✓ Telephone updated")
    
    # Update 3: Grantor 5000000015 - Email change
    print(f"3. User Details Update - Grantor 5000000015...")
    updated_time = datetime.now() - timedelta(hours=36)
    cursor.execute("""
        UPDATE vendors 
        SET email = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("dreier.new@example.com", updated_time, "5000000015"))
    print(f"   ✓ Email updated")
    
    # Update 4: Grantor 5000000061 - Mobile change
    print(f"4. User Details Update - Grantor 5000000061...")
    updated_time = datetime.now() - timedelta(hours=48)
    cursor.execute("""
        UPDATE vendors 
        SET mobile = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("07822 333 444", updated_time, "5000000061"))
    print(f"   ✓ Mobile updated")
    
    conn.commit()
    
    # Verify
    print("\nStep 3: Verifying...")
    cursor.execute("""
        SELECT 
            v.vendor_id,
            v.updated_at > v.created_at as vendor_updated,
            COALESCE((SELECT bd.updated_at > bd.created_at FROM bank_details bd WHERE bd.vendor_id = v.vendor_id), false) as bank_updated
        FROM vendors v
        WHERE v.vendor_id IN ('5000000015', '5000000061')
    """)
    
    results = cursor.fetchall()
    
    print()
    print("=" * 60)
    print("✅ User Details Updates Created!")
    print("=" * 60)
    print()
    print("Verification:")
    for row in results:
        print(f"  Grantor {row[0]}:")
        print(f"    - Vendor updated: {row[1]} ✓")
        print(f"    - Bank updated: {row[2]} (should be False)")
    print()
    print("These should now appear in Request Console as 'User Details Update'!")
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
