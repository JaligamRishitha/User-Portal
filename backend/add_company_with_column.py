"""
Migration script to add company_with column to wayleave_agreements table
"""
import sys
import os

# Add parent directory to path to import database module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

def add_company_with_column():
    try:
        with engine.connect() as conn:
            # Check if column already exists
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='wayleave_agreements' 
                AND column_name='company_with'
            """)
            result = conn.execute(check_query)
            
            if result.fetchone():
                print("✓ Column 'company_with' already exists in wayleave_agreements table")
                return
            
            # Add the column
            alter_query = text("""
                ALTER TABLE wayleave_agreements 
                ADD COLUMN company_with TEXT
            """)
            
            conn.execute(alter_query)
            conn.commit()
            
            print("✓ Successfully added 'company_with' column to wayleave_agreements table")
            
    except Exception as e:
        print(f"✗ Error adding column: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    print("Adding company_with column to wayleave_agreements table...")
    add_company_with_column()
    print("Migration completed!")
