"""
Create a complete seed data migration from exported data
"""
import os
import sys
from datetime import datetime

def create_migration():
    # Check if export file exists
    if not os.path.exists("all_data_export.py"):
        print("Error: all_data_export.py not found. Run export_all_data_complete.py first.")
        sys.exit(1)
    
    # Import the exported data
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from all_data_export import (
        vendors_data, user_details_data, bank_details_data,
        payment_history_data, payment_schedule_headers_data,
        payment_schedule_items_data, remittance_documents_data,
        wayleave_agreements_data
    )
    
    # Create migration content
    migration_content = f'''"""Complete seed data with all records

Revision ID: complete_seed_data
Revises: 95b6c1509bb5
Create Date: {datetime.now().isoformat()}

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
import base64

# revision identifiers, used by Alembic.
revision: str = 'complete_seed_data'
down_revision: Union[str, None] = '95b6c1509bb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert complete seed data."""
    
    # Disable triggers during bulk insert
    op.execute("SET session_replication_role = 'replica'")
    
    # VENDORS ({len(vendors_data)} records)
    print("Inserting vendors...")
    for vendor in {repr(vendors_data)}:
        columns = ', '.join(vendor.keys())
        placeholders = ', '.join([f":{k}" for k in vendor.keys()])
        op.execute(
            text(f"INSERT INTO vendors ({{columns}}) VALUES ({{placeholders}})"),
            vendor
        )
    
    # USER DETAILS ({len(user_details_data)} records)
    print("Inserting user_details...")
    for user_detail in {repr(user_details_data)}:
        columns = ', '.join(user_detail.keys())
        placeholders = ', '.join([f":{k}" for k in user_detail.keys()])
        op.execute(
            text(f"INSERT INTO user_details ({{columns}}) VALUES ({{placeholders}})"),
            user_detail
        )
    
    # BANK DETAILS ({len(bank_details_data)} records)
    print("Inserting bank_details...")
    for bank_detail in {repr(bank_details_data)}:
        columns = ', '.join(bank_detail.keys())
        placeholders = ', '.join([f":{k}" for k in bank_detail.keys()])
        op.execute(
            text(f"INSERT INTO bank_details ({{columns}}) VALUES ({{placeholders}})"),
            bank_detail
        )
    
    # PAYMENT HISTORY ({len(payment_history_data)} records)
    print("Inserting payment_history...")
    for payment in {repr(payment_history_data)}:
        columns = ', '.join(payment.keys())
        placeholders = ', '.join([f":{k}" for k in payment.keys()])
        op.execute(
            text(f"INSERT INTO payment_history ({{columns}}) VALUES ({{placeholders}})"),
            payment
        )
    
    # PAYMENT SCHEDULE HEADERS ({len(payment_schedule_headers_data)} records)
    print("Inserting payment_schedule_headers...")
    for header in {repr(payment_schedule_headers_data)}:
        columns = ', '.join(header.keys())
        placeholders = ', '.join([f":{k}" for k in header.keys()])
        op.execute(
            text(f"INSERT INTO payment_schedule_headers ({{columns}}) VALUES ({{placeholders}})"),
            header
        )
    
    # PAYMENT SCHEDULE ITEMS ({len(payment_schedule_items_data)} records)
    print("Inserting payment_schedule_items...")
    for item in {repr(payment_schedule_items_data)}:
        columns = ', '.join(item.keys())
        placeholders = ', '.join([f":{k}" for k in item.keys()])
        op.execute(
            text(f"INSERT INTO payment_schedule_items ({{columns}}) VALUES ({{placeholders}})"),
            item
        )
    
    # REMITTANCE DOCUMENTS ({len(remittance_documents_data)} records)
    print("Inserting remittance_documents...")
    for doc in {repr(remittance_documents_data)}:
        columns = ', '.join(doc.keys())
        placeholders = ', '.join([f":{k}" for k in doc.keys()])
        op.execute(
            text(f"INSERT INTO remittance_documents ({{columns}}) VALUES ({{placeholders}})"),
            doc
        )
    
    # WAYLEAVE AGREEMENTS ({len(wayleave_agreements_data)} records)
    print("Inserting wayleave_agreements...")
    for agreement in {repr(wayleave_agreements_data)}:
        columns = ', '.join(agreement.keys())
        placeholders = ', '.join([f":{k}" for k in agreement.keys()])
        op.execute(
            text(f"INSERT INTO wayleave_agreements ({{columns}}) VALUES ({{placeholders}})"),
            agreement
        )
    
    # Re-enable triggers
    op.execute("SET session_replication_role = 'origin'")
    
    print("✓ All seed data inserted successfully!")


def downgrade() -> None:
    """Remove all seed data."""
    # Delete in reverse order of foreign key dependencies
    op.execute("DELETE FROM wayleave_agreements")
    op.execute("DELETE FROM remittance_documents")
    op.execute("DELETE FROM payment_schedule_items")
    op.execute("DELETE FROM payment_schedule_headers")
    op.execute("DELETE FROM payment_history")
    op.execute("DELETE FROM bank_details")
    op.execute("DELETE FROM user_details")
    op.execute("DELETE FROM vendors")
'''
    
    # Write the migration file
    output_file = "alembic/versions/complete_seed_data.py"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(migration_content)
    
    print(f"✓ Created complete seed migration: {output_file}")
    print(f"✓ Total records:")
    print(f"  - Vendors: {len(vendors_data)}")
    print(f"  - User Details: {len(user_details_data)}")
    print(f"  - Bank Details: {len(bank_details_data)}")
    print(f"  - Payment History: {len(payment_history_data)}")
    print(f"  - Payment Schedule Headers: {len(payment_schedule_headers_data)}")
    print(f"  - Payment Schedule Items: {len(payment_schedule_items_data)}")
    print(f"  - Remittance Documents: {len(remittance_documents_data)}")
    print(f"  - Wayleave Agreements: {len(wayleave_agreements_data)}")

if __name__ == "__main__":
    create_migration()
