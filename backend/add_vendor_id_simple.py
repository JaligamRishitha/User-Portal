import psycopg2
import os

# Get database URL from environment or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/dbname')

print(f"Connecting to database...")
print(f"URL: {DATABASE_URL[:30]}...")

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("\nAdding vendor_id to both tables...")
    
    # ===== REMITTANCE_REPORTS =====
    print("\n=== REMITTANCE_REPORTS ===")
    
    print("1. Adding vendor_id column...")
    try:
        cursor.execute("ALTER TABLE remittance_reports ADD COLUMN vendor_id VARCHAR(50)")
        print("   ✓ Column added")
    except psycopg2.errors.DuplicateColumn:
        print("   ⚠ Column already exists")
        conn.rollback()
    
    print("2. Populating vendor_id...")
    cursor.execute("""
        UPDATE remittance_reports rr
        SET vendor_id = (
            SELECT v.vendor_id 
            FROM vendors v
            JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE ud.postcode = rr.postcode 
            LIMIT 1
        )
        WHERE rr.postcode IS NOT NULL AND (rr.vendor_id IS NULL OR rr.vendor_id = '')
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    print("3. Creating index...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id ON remittance_reports(vendor_id)")
    print("   ✓ Index created")
    
    # ===== GEOGRAPHICAL_DOCUMENTS =====
    print("\n=== GEOGRAPHICAL_DOCUMENTS ===")
    
    print("1. Adding vendor_id column...")
    try:
        cursor.execute("ALTER TABLE geographical_documents ADD COLUMN vendor_id VARCHAR(50)")
        print("   ✓ Column added")
    except psycopg2.errors.DuplicateColumn:
        print("   ⚠ Column already exists")
        conn.rollback()
    
    print("2. Populating vendor_id...")
    cursor.execute("""
        UPDATE geographical_documents gd
        SET vendor_id = (
            SELECT v.vendor_id 
            FROM vendors v
            JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE ud.postcode = gd.postcode 
            LIMIT 1
        )
        WHERE gd.postcode IS NOT NULL AND (gd.vendor_id IS NULL OR gd.vendor_id = '')
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    print("3. Creating index...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_geographical_vendor_id ON geographical_documents(vendor_id)")
    print("   ✓ Index created")
    
    # Commit
    conn.commit()
    print("\n✓ Migration completed!")
    
    # Verification
    print("\n=== VERIFICATION ===")
    cursor.execute("SELECT COUNT(*), COUNT(vendor_id) FROM remittance_reports")
    total, with_vendor = cursor.fetchone()
    print(f"Remittance: {with_vendor}/{total} records with vendor_id")
    
    cursor.execute("SELECT COUNT(*), COUNT(vendor_id) FROM geographical_documents")
    total, with_vendor = cursor.fetchone()
    print(f"Geographical: {with_vendor}/{total} records with vendor_id")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    if 'conn' in locals():
        conn.close()

print("\nDone!")
