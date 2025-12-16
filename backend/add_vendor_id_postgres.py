import psycopg2
from config import get_settings

settings = get_settings()

# Connect to PostgreSQL
conn = psycopg2.connect(settings.database_url)
cursor = conn.cursor()

print("Adding vendor_id to geographical_documents...")

try:
    # Step 1: Add column
    print("\n1. Adding vendor_id column...")
    cursor.execute("""
        ALTER TABLE geographical_documents 
        ADD COLUMN IF NOT EXISTS vendor_id VARCHAR(50)
    """)
    print("   ✓ Column added")
    
    # Step 2: Populate from postcode
    print("\n2. Populating vendor_id from postcode matches...")
    cursor.execute("""
        UPDATE geographical_documents gd
        SET vendor_id = (
            SELECT ud.vendor_id 
            FROM user_details ud 
            WHERE ud.postcode = gd.postcode 
            LIMIT 1
        )
        WHERE gd.postcode IS NOT NULL AND gd.vendor_id IS NULL
    """)
    print(f"   ✓ Updated {cursor.rowcount} records")
    
    # Step 3: Add foreign key (if not exists)
    print("\n3. Adding foreign key constraint...")
    try:
        cursor.execute("""
            ALTER TABLE geographical_documents
            ADD CONSTRAINT fk_geographical_vendor
            FOREIGN KEY (vendor_id) 
            REFERENCES user_details(vendor_id)
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
    
    # Commit
    conn.commit()
    print("\n✓ Migration completed successfully!")
    
    # Verification
    print("\n--- Verification ---")
    cursor.execute("""
        SELECT COUNT(*) as total, 
               COUNT(vendor_id) as with_vendor 
        FROM geographical_documents
    """)
    total, with_vendor = cursor.fetchone()
    print(f"Total records: {total}")
    print(f"Records with vendor_id: {with_vendor}")
    
    # Sample data
    cursor.execute("""
        SELECT gd.id, gd.postcode, gd.vendor_id, 
               ud.first_name, ud.last_name, ud.vendor_name
        FROM geographical_documents gd
        LEFT JOIN user_details ud ON gd.vendor_id = ud.vendor_id
        LIMIT 3
    """)
    print("\nSample data:")
    for row in cursor.fetchall():
        print(f"  ID:{row[0]} Postcode:{row[1]} Vendor:{row[2]} Name:{row[3]} {row[4]} ({row[5]})")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()

print("\nDone!")
