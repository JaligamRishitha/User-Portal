import sqlite3

# Connect to database
conn = sqlite3.connect('ukpn.db')
cursor = conn.cursor()

print("Applying migrations...")

try:
    # Migration 1: Add vendor_id to remittance_reports
    print("\n1. Adding vendor_id column to remittance_reports...")
    cursor.execute("ALTER TABLE remittance_reports ADD COLUMN vendor_id VARCHAR(50)")
    print("   ✓ Column added")
    
    # Update existing records
    print("\n2. Populating vendor_id from postcode matches...")
    cursor.execute("""
        UPDATE remittance_reports 
        SET vendor_id = (
            SELECT vendor_id 
            FROM user_details 
            WHERE user_details.postcode = remittance_reports.postcode 
            LIMIT 1
        )
        WHERE postcode IS NOT NULL
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    # Create index
    print("\n3. Creating index on vendor_id...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id ON remittance_reports(vendor_id)")
    print("   ✓ Index created")
    
    # Migration 2: Add vendor_id to geographical_documents
    print("\n4. Adding vendor_id column to geographical_documents...")
    cursor.execute("ALTER TABLE geographical_documents ADD COLUMN vendor_id VARCHAR(50)")
    print("   ✓ Column added")
    
    # Update existing records
    print("\n5. Populating vendor_id from postcode matches...")
    cursor.execute("""
        UPDATE geographical_documents 
        SET vendor_id = (
            SELECT vendor_id 
            FROM user_details 
            WHERE user_details.postcode = geographical_documents.postcode 
            LIMIT 1
        )
        WHERE postcode IS NOT NULL
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    # Create index
    print("\n6. Creating index on vendor_id...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_geographical_vendor_id ON geographical_documents(vendor_id)")
    print("   ✓ Index created")
    
    # Commit changes
    conn.commit()
    print("\n✓ All migrations applied successfully!")
    
    # Verify remittance_reports
    print("\n--- Remittance Reports Verification ---")
    cursor.execute("PRAGMA table_info(remittance_reports)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Columns: {', '.join(columns)}")
    
    cursor.execute("SELECT COUNT(*) FROM remittance_reports WHERE vendor_id IS NOT NULL")
    count = cursor.fetchone()[0]
    print(f"Records with vendor_id: {count}")
    
    # Verify geographical_documents
    print("\n--- Geographical Documents Verification ---")
    cursor.execute("PRAGMA table_info(geographical_documents)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Columns: {', '.join(columns)}")
    
    cursor.execute("SELECT COUNT(*) FROM geographical_documents WHERE vendor_id IS NOT NULL")
    count = cursor.fetchone()[0]
    print(f"Records with vendor_id: {count}")
    
    # Sample data
    print("\n--- Sample Data ---")
    cursor.execute("""
        SELECT rr.id, rr.fiscal_year, rr.vendor_id, ud.vendor_name 
        FROM remittance_reports rr
        LEFT JOIN user_details ud ON rr.vendor_id = ud.vendor_id
        LIMIT 3
    """)
    print("Remittance Reports:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, FY: {row[1]}, Vendor: {row[2]}, Name: {row[3]}")
    
    cursor.execute("""
        SELECT gd.id, gd.postcode, gd.vendor_id, ud.first_name, ud.last_name 
        FROM geographical_documents gd
        LEFT JOIN user_details ud ON gd.vendor_id = ud.vendor_id
        LIMIT 3
    """)
    print("\nGeographical Documents:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, Postcode: {row[1]}, Vendor: {row[2]}, Name: {row[3]} {row[4]}")
    
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print(f"\n⚠ Column already exists: {e}")
        print("Migration may have been applied previously.")
    else:
        print(f"\n✗ Error: {e}")
        conn.rollback()
except Exception as e:
    print(f"\n✗ Error: {e}")
    conn.rollback()
finally:
    conn.close()

print("\nDone!")
