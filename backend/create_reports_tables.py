import sqlite3

conn = sqlite3.connect('ukpn.db')
cursor = conn.cursor()

print("Creating reports tables...")

try:
    # Create remittance_reports table
    print("\n1. Creating remittance_reports table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS remittance_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fiscal_year INTEGER NOT NULL,
            document_name VARCHAR(255),
            document_url VARCHAR(500),
            document_type VARCHAR(50),
            upload_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            postcode VARCHAR(20),
            vendor_id VARCHAR(50),
            FOREIGN KEY (vendor_id) REFERENCES user_details(vendor_id)
                ON DELETE SET NULL
                ON UPDATE CASCADE
        )
    """)
    print("   ✓ remittance_reports table created")
    
    # Create index
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id ON remittance_reports(vendor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_remittance_fiscal_year ON remittance_reports(fiscal_year)")
    print("   ✓ Indexes created")
    
    # Create geographical_documents table
    print("\n2. Creating geographical_documents table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS geographical_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            postcode VARCHAR(20) NOT NULL,
            document_name VARCHAR(255),
            document_url VARCHAR(500),
            document_type VARCHAR(50),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            vendor_id VARCHAR(50),
            FOREIGN KEY (vendor_id) REFERENCES user_details(vendor_id)
                ON DELETE SET NULL
                ON UPDATE CASCADE
        )
    """)
    print("   ✓ geographical_documents table created")
    
    # Create indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_geographical_vendor_id ON geographical_documents(vendor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_geographical_postcode ON geographical_documents(postcode)")
    print("   ✓ Indexes created")
    
    # Commit changes
    conn.commit()
    print("\n✓ All tables created successfully!")
    
    # Show table structure
    print("\n--- Remittance Reports Structure ---")
    cursor.execute("PRAGMA table_info(remittance_reports)")
    for col in cursor.fetchall():
        print(f"  {col[1]} ({col[2]})")
    
    print("\n--- Geographical Documents Structure ---")
    cursor.execute("PRAGMA table_info(geographical_documents)")
    for col in cursor.fetchall():
        print(f"  {col[1]} ({col[2]})")
    
    # Show all tables
    print("\n--- All Tables in Database ---")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    for table in cursor.fetchall():
        print(f"  - {table[0]}")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    conn.rollback()
finally:
    conn.close()

print("\nDone!")
