import psycopg2
from config import get_settings

settings = get_settings()

# Connect to PostgreSQL
conn = psycopg2.connect(settings.database_url)
cursor = conn.cursor()

print("Checking user_details table structure...\n")

try:
    # Get column information
    cursor.execute("""
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'user_details'
        ORDER BY ordinal_position
    """)
    
    columns = cursor.fetchall()
    
    print("user_details columns:")
    for col in columns:
        length = f"({col[2]})" if col[2] else ""
        print(f"  - {col[0]}: {col[1]}{length}")
    
    # Sample data
    print("\nSample data:")
    cursor.execute("SELECT * FROM user_details LIMIT 1")
    if cursor.description:
        col_names = [desc[0] for desc in cursor.description]
        print(f"Columns: {', '.join(col_names)}")
        
        row = cursor.fetchone()
        if row:
            for i, val in enumerate(row):
                print(f"  {col_names[i]}: {val}")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    cursor.close()
    conn.close()
