"""
Create wayleave_agreements table in PostgreSQL
"""
from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Read the SQL file
with open('../create_wayleave_table_postgres.sql', 'r') as f:
    sql_script = f.read()

def create_wayleave_table():
    """Create the wayleave_agreements table in PostgreSQL"""
    try:
        logger.info("Creating wayleave_agreements table in PostgreSQL...")
        
        with engine.connect() as conn:
            # Execute the SQL script
            conn.execute(text(sql_script))
            conn.commit()
            
            logger.info("✓ wayleave_agreements table created successfully")
            
            # Verify table was created
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'wayleave_agreements'
            """))
            
            table = result.fetchone()
            if table:
                logger.info(f"✓ Table verified: {table[0]}")
                
                # Show table structure
                result = conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'wayleave_agreements'
                    ORDER BY ordinal_position
                """))
                
                columns = result.fetchall()
                logger.info("\nTable structure:")
                for col in columns:
                    logger.info(f"  - {col[0]}: {col[1]}")
            else:
                logger.error("✗ Table not found after creation")
                
    except Exception as e:
        logger.error(f"Error creating table: {str(e)}")
        raise

if __name__ == "__main__":
    create_wayleave_table()
