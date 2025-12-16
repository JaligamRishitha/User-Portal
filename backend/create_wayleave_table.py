"""
Create wayleave_agreements table
"""
from database import engine, Base
from models import WayleaveAgreement
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_wayleave_table():
    """Create the wayleave_agreements table"""
    try:
        logger.info("Creating wayleave_agreements table...")
        Base.metadata.create_all(bind=engine, tables=[WayleaveAgreement.__table__])
        logger.info("✓ wayleave_agreements table created successfully")
    except Exception as e:
        logger.error(f"Error creating table: {str(e)}")
        raise

if __name__ == "__main__":
    create_wayleave_table()
