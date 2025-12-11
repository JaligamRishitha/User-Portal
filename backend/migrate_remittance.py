import sqlite3

# Connect to database
conn = sqlite3.connect('ukpn.db')
cursor = conn.cursor()

# Read and execute migration
with open('database/add_remittance_documents_table.sql', 'r') as f:
    migration_sql = f.read()
    cursor.executescript(migration_sql)

conn.commit()
conn.close()

print('Migration completed successfully!')
