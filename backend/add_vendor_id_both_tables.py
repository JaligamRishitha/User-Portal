import psycopg2
from config import get_settings

settings = get_settings()

# Connect to PostgreSQL
conn = psycopg2.connect(settings.database_url)
cursor = conn.cursor()

print("Adding vendor_id to both tables...")

try:
    # ===== REMITTANCE_REPORTS =====
    print("\n=== REMITTANCE_REPORTS ===")
    
    # Step 1: Add column
    print("\n1. Adding vendor_id column...")
    try:
        cursor.execute("""
            ALTER TABLE remittance_reports 
            ADD COLUMN vendor_id VARCHAR(50)
        """)
        print("   ✓ Column added")
    except psycopg2.errors.DuplicateColumn:
        print("   ⚠ Column already exists")
        conn.rollback()
    
    # Step 2: Populate from postcode
    print("\n2. Populating vendor_id from postcode matches...")
    cursor.execute("""
        UPDATE remittance_reports rr
        SET vendor_id = (
            SELECT v.vendor_id 
            FROM vendors v
            JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE ud.postcode = rr.postcode 
            LIMIT 1
        )
        WHERE rr.postcode IS NOT NULL AND rr.vendor_id IS NULL
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    # Step 3: Add foreign key
    print("\n3. Adding foreign key constraint...")
    try:
        cursor.execute("""
            ALTER TABLE remittance_reports
            ADD CONSTRAINT fk_remittance_vendor
            FOREIGN KEY (vendor_id) 
            REFERENCES vendors(vendor_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        """)
        print("   ✓ Foreign key added")
    except psycopg2.errors.DuplicateObject:
        print("   ⚠ Foreign key already exists")
        conn.rollback()
    
    # Step 4: Create index
    print("\n4. Creating index...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id 
        ON remittance_reports(vendor_id)
    """)
    print("   ✓ Index created")
    
    # ===== GEOGRAPHICAL_DOCUMENTS =====
    print("\n=== GEOGRAPHICAL_DOCUMENTS ===")
    
    # Step 1: Add column
    print("\n1. Adding vendor_id column...")
    try:
        cursor.execute("""
            ALTER TABLE geographical_documents 
            ADD COLUMN vendor_id VARCHAR(50)
        """)
        print("   ✓ Column added")
    except psycopg2.errors.DuplicateColumn:
        print("   ⚠ Column already exists")
        conn.rollback()
    
    # Step 2: Populate from postcode
    print("\n2. Populating vendor_id from postcode matches...")
    cursor.execute("""
        UPDATE geographical_documents gd
        SET vendor_id = (
            SELECT v.vendor_id 
            FROM vendors v
            JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE ud.postcode = gd.postcode 
            LIMIT 1
        )
        WHERE gd.postcode IS NOT NULL AND gd.vendor_id IS NULL
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    # Step 3: Add foreign key
    print("\n3. Adding foreign key constraint...")
    try:
        cursor.execute("""
            ALTER TABLE geographical_documents
            ADD CONSTRAINT fk_geographical_vendor
            FOREIGN KEY (vendor_id) 
            REFERENCES vendors(vendor_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        """)
        print("   ✓ Foreign key added")
    except psycopg2.errors.DuplicateObject:
        print("   ⚠ Foreign key already exists")
        conn.rollback()
    
    # Step 4: Create index
    print("\n4. Creating index...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_geographical_vendor_id 
        ON geographical_documents(vendor_id)
    """)
    print("   ✓ Index created")
    
    # Commit all changes
    conn.commit()
    print("\n✓ All migrations completed successfully!")
    
    # ===== VERIFICATION =====
    print("\n=== VERIFICATION ===")
    
    # Remittance reports
    cursor.execute("""
        SELECT COUNT(*) as total, 
               COUNT(vendor_id) as with_vendor 
        FROM remittance_reports
    """)
    total, with_vendor = cursor.fetchone()
    print(f"\nRemittance Reports:")
    print(f"  Total records: {total}")
    print(f"  Records with vendor_id: {with_vendor}")
    
    cursor.execute("""
        SELECT rr.id, rr.fiscal_year, rr.vendor_id, 
               v.first_name, v.last_name
        FROM remittance_reports rr
        LEFT JOIN vendors v ON rr.vendor_id = v.vendor_id
        LIMIT 3
    """)
    print("  Sample data:")
    for row in cursor.fetchall():
        print(f"    ID:{row[0]} FY:{row[1]} Vendor:{row[2]} Name:{row[3]} {row[4]}")
    
    # Geographical documents
    cursor.execute("""
        SELECT COUNT(*) as total, 
               COUNT(vendor_id) as with_vendor 
        FROM geographical_documents
    """)
    total, with_vendor = cursor.fetchone()
    print(f"\nGeographical Documents:")
    print(f"  Total records: {total}")
    print(f"  Records with vendor_id: {with_vendor}")
    
    cursor.execute("""
        SELECT gd.id, gd.postcode, gd.vendor_id, 
               v.first_name, v.last_name
        FROM geographical_documents gd
        LEFT JOIN vendors v ON gd.vendor_id = v.vendor_id
        LIMIT 3
    """)
    print("  Sample data:")
    for row in cursor.fetchall():
        print(f"    ID:{row[0]} Postcode:{row[1]} Vendor:{row[2]} Name:{row[3]} {row[4]}")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cursor.close()
    conn.close()

print("\nDone!")
