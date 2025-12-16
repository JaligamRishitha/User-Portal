import sqlite3
import sys

def run_migration(db_path, sql_file):
    """Run SQL migration file"""
    try:
        # Read SQL file
        with open(sql_file, 'r') as f:
            sql_script = f.read()
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Execute SQL script
        cursor.executescript(sql_script)
        
        # Commit changes
        conn.commit()
        
        print(f"✓ Successfully executed {sql_file}")
        
        # Verify changes
        cursor.execute("PRAGMA table_info(remittance_reports)")
        columns = cursor.fetchall()
        print("\nRemittance Reports Table Structure:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Check data
        cursor.execute("SELECT id, fiscal_year, vendor_id, postcode FROM remittance_reports LIMIT 3")
        rows = cursor.fetchall()
        print("\nSample Data:")
        for row in rows:
            print(f"  ID: {row[0]}, FY: {row[1]}, Vendor: {row[2]}, Postcode: {row[3]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Error executing {sql_file}: {str(e)}")
        return False

if __name__ == "__main__":
    db_path = "ukpn.db"
    sql_file = "../add_vendor_id_to_remittance.sql"
    
    success = run_migration(db_path, sql_file)
    sys.exit(0 if success else 1)
