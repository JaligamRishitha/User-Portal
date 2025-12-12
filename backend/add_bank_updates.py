#!/usr/bin/env python3
"""
Add 3 bank details update entries for the 2 existing users
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
print("Adding 3 Bank Details Updates")
print("=" * 60)
print()

try:
    # Get the 2 users
    cursor.execute("""
        SELECT vendor_id, first_name, last_name
        FROM vendors 
        WHERE vendor_id IN ('5000000015', '5000000061')
        ORDER BY vendor_id
    """)
    users = cursor.fetchall()
    
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"  • {user[0]}: {user[1]} {user[2]}")
    print()
    
    # Update 1: User 5000000015 - Account number change
    print(f"1. Bank Details Update - {users[0][0]} (Account Number)")
    
    # First, ensure bank details exist
    cursor.execute("""
        SELECT vendor_id FROM bank_details WHERE vendor_id = %s
    """, (users[0][0],))
    
    if not cursor.fetchone():
        # Create bank details if not exists
        cursor.execute("""
            INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (users[0][0], "11111111", "20-00-00", f"{users[0][1]} {users[0][2]}", "BACS", "-", "-", "-", datetime.now() - timedelta(days=60), datetime.now() - timedelta(days=60)))
    
    # Update account number
    updated_time = datetime.now() - timedelta(hours=5)
    cursor.execute("""
        UPDATE bank_details 
        SET account_number = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("22222222", updated_time, users[0][0]))
    print(f"   ✓ Account number updated")
    
    # Update 2: User 5000000061 - Sort code change
    print(f"2. Bank Details Update - {users[1][0]} (Sort Code)")
    
    cursor.execute("""
        SELECT vendor_id FROM bank_details WHERE vendor_id = %s
    """, (users[1][0],))
    
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (users[1][0], "33333333", "40-00-00", f"{users[1][1]} {users[1][2]}", "BACS", "-", "-", "-", datetime.now() - timedelta(days=60), datetime.now() - timedelta(days=60)))
    
    updated_time = datetime.now() - timedelta(hours=18)
    cursor.execute("""
        UPDATE bank_details 
        SET sort_code = %s, updated_at = %s
        WHERE vendor_id = %s
    """, ("50-60-70", updated_time, users[1][0]))
    print(f"   ✓ Sort code updated")
    
    # Update 3: User 5000000015 - Account holder name change
    print(f"3. Bank Details Update - {users[0][0]} (Account Holder Name)")
    
    updated_time = datetime.now() - timedelta(hours=32)
    cursor.execute("""
        UPDATE bank_details 
        SET account_holder_name = %s, updated_at = %s
        WHERE vendor_id = %s
    """, (f"{users[0][1]} {users[0][2]} UPDATED", updated_time, users[0][0]))
    print(f"   ✓ Account holder name updated")
    
    conn.commit()
    
    print()
    print("=" * 60)
    print("✅ 3 Bank Details Updates Created!")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  {users[0][0]}: 2 updates (Account Number, Account Holder Name)")
    print(f"  {users[1][0]}: 1 update (Sort Code)")
    print()
    print("These will appear in the Request Console as 'Bank Details Update'")
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
