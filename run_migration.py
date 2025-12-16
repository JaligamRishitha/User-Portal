import sqlite3

# Read the SQL file
with open('create_wayleave_table.sql', 'r') as f:
    sql_script = f.read()

# Connect to database
conn = sqlite3.connect('backend/ukpn.db')
cursor = conn.cursor()

try:
    # Execute the SQL script
    cursor.executescript(sql_script)
    conn.commit()
    print("✓ Migration completed successfully!")
    print("✓ wayleave_agreements table created")
    
    # Verify table was created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='wayleave_agreements'")
    result = cursor.fetchone()
    if result:
        print(f"✓ Table verified: {result[0]}")
    else:
        print("✗ Table not found")
        
except Exception as e:
    print(f"✗ Error: {e}")
    conn.rollback()
finally:
    conn.close()
