import sqlite3

conn = sqlite3.connect('ukpn.db')
cursor = conn.cursor()

print("Adding vendor_id columns to tables...")

try:
    # Check if remittance_reports exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='remittance_reports'")
    if cursor.fetchone():
        print("\n1. Adding vendor_id to remittance_reports...")
        try:
            cursor.execute("ALTER TABLE remittance_reports ADD COLUMN vendor_id VARCHAR(50)")
            print("   ✓ Column added")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e):
                print("   ⚠ Column already exists")
            else:
                raise
        
        # Update existing records
        print("   Populating vendor_id from postcode...")
        cursor.execute("""
            UPDATE remittance_reports 
            SET vendor_id = (
                SELECT vendor_id 
                FROM user_details 
                WHERE user_details.postcode = remittance_reports.postcode 
                LIMIT 1
            )
            WHERE postcode IS NOT NULL AND vendor_id IS NULL
        """)
        print(f"   ✓ Updated {cursor.rowcount} records")
        
        # Create index
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id ON remittance_reports(vendor_id)")
        print("   ✓ Index created")
    else:
        print("\n⚠ remittance_reports table not found")
    
    # Check if geographical_documents exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='geographical_documents'")
    if cursor.fetchone():
        print("\n2. Adding vendor_id to geographical_documents...")
        try:
            cursor.execute("ALTER TABLE geographical_documents ADD COLUMN vendor_id VARCHAR(50)")
            print("   ✓ Column added")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e):
                print("   ⚠ Column already exists")
            else:
                raise
        
        # Update existing records
        print("   Populating vendor_id from postcode...")
        cursor.execute("""
            UPDATE geographical_documents 
            SET vendor_id = (
                SELECT vendor_id 
                FROM user_details 
                WHERE user_details.postcode = geographical_documents.postcode 
                LIMIT 1
            )
            WHERE postcode IS NOT NULL AND vendor_id IS NULL
        """)
        print(f"   ✓ Updated {cursor.rowcount} records")
        
        # Create index
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_geographical_vendor_id ON geographical_documents(vendor_id)")
        print("   ✓ Index created")
    else:
        print("\n⚠ geographical_documents table not found")
    
    # Commit changes
    conn.commit()
    print("\n✓ Migration completed successfully!")
    
    # Verification
    print("\n--- Verification ---")
    
    # Check remittance_reports
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='remittance_reports'")
    if cursor.fetchone():
        cursor.execute("SELECT COUNT(*) FROM remittance_reports WHERE vendor_id IS NOT NULL")
        count = cursor.fetchone()[0]
        print(f"remittance_reports: {count} records with vendor_id")
        
        cursor.execute("""
            SELECT rr.id, rr.fiscal_year, rr.vendor_id, ud.vendor_name, ud.first_name, ud.last_name
            FROM remittance_reports rr
            LEFT JOIN user_details ud ON rr.vendor_id = ud.vendor_id
            LIMIT 3
        """)
        print("Sample data:")
        for row in cursor.fetchall():
            print(f"  ID:{row[0]} FY:{row[1]} Vendor:{row[2]} Name:{row[3]} ({row[4]} {row[5]})")
    
    # Check geographical_documents
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='geographical_documents'")
    if cursor.fetchone():
        cursor.execute("SELECT COUNT(*) FROM geographical_documents WHERE vendor_id IS NOT NULL")
        count = cursor.fetchone()[0]
        print(f"\ngeographical_documents: {count} records with vendor_id")
        
        cursor.execute("""
            SELECT gd.id, gd.postcode, gd.vendor_id, ud.first_name, ud.last_name
            FROM geographical_documents gd
            LEFT JOIN user_details ud ON gd.vendor_id = ud.vendor_id
            LIMIT 3
        """)
        print("Sample data:")
        for row in cursor.fetchall():
            print(f"  ID:{row[0]} Postcode:{row[1]} Vendor:{row[2]} Name:{row[3]} {row[4]}")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    conn.close()

print("\nDone!")
