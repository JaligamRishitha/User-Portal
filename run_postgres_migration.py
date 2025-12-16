import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv('backend/.env')

# Build database URL from individual components
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'ukpn_portal')
DB_USER = os.getenv('DB_USER', 'ukpn_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'ukpn_password')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"Connecting to: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")

# Read the SQL file
with open('create_wayleave_table_postgres.sql', 'r') as f:
    sql_script = f.read()

try:
    # Connect to PostgreSQL database
    print("Connecting to PostgreSQL database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Execute the SQL script
    print("Creating wayleave_agreements table...")
    cursor.execute(sql_script)
    conn.commit()
    
    print("✓ Migration completed successfully!")
    print("✓ wayleave_agreements table created in PostgreSQL")
    
    # Verify table was created
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wayleave_agreements'
    """)
    result = cursor.fetchone()
    
    if result:
        print(f"✓ Table verified: {result[0]}")
        
        # Show table structure
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'wayleave_agreements'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        print("\nTable structure:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
    else:
        print("✗ Table not found")
        
except Exception as e:
    print(f"✗ Error: {e}")
    if conn:
        conn.rollback()
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
