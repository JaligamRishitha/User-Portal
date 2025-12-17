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
        remittance_reports_data, geographical_documents_data,
        wayleave_agreements_data, moving_house_notifications_data,
        bank_details_audit_data, vendor_audit_data
    )
    
    def dict_to_insert(table_name, data_list):
        """Convert list of dicts to INSERT statements"""
        if not data_list:
            return "    # No data for " + table_name
        
        inserts = []
        for row in data_list:
            columns = list(row.keys())
            values = [str(v) for v in row.values()]  # Convert all to strings
            
            cols_str = ", ".join(columns)
            vals_str = ", ".join(values)
            
            insert = f"    op.execute(text(\"INSERT INTO {table_name} ({cols_str}) VALUES ({vals_str})\"))"
            inserts.append(insert)
        
        return "\n".join(inserts)
    
    # Create migration content
    migration_content = f'''"""Complete seed data with all records

Revision ID: complete_seed_data
Revises: 95b6c1509bb5
Create Date: {datetime.now().isoformat()}

"""
from typing import Sequence, Union
from alembic import op
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
    print("Inserting {len(vendors_data)} vendors...")
{dict_to_insert("vendors", vendors_data)}
    
    # USER DETAILS ({len(user_details_data)} records)
    print("Inserting {len(user_details_data)} user_details...")
{dict_to_insert("user_details", user_details_data)}
    
    # BANK DETAILS ({len(bank_details_data)} records)
    print("Inserting {len(bank_details_data)} bank_details...")
{dict_to_insert("bank_details", bank_details_data)}
    
    # PAYMENT HISTORY ({len(payment_history_data)} records)
    print("Inserting {len(payment_history_data)} payment_history...")
{dict_to_insert("payment_history", payment_history_data)}
    
    # PAYMENT SCHEDULE HEADERS ({len(payment_schedule_headers_data)} records)
    print("Inserting {len(payment_schedule_headers_data)} payment_schedule_headers...")
{dict_to_insert("payment_schedule_headers", payment_schedule_headers_data)}
    
    # PAYMENT SCHEDULE ITEMS ({len(payment_schedule_items_data)} records)
    print("Inserting {len(payment_schedule_items_data)} payment_schedule_items...")
{dict_to_insert("payment_schedule_items", payment_schedule_items_data)}
    
    # REMITTANCE DOCUMENTS ({len(remittance_documents_data)} records)
    print("Inserting {len(remittance_documents_data)} remittance_documents...")
{dict_to_insert("remittance_documents", remittance_documents_data)}
    
    # REMITTANCE REPORTS ({len(remittance_reports_data)} records)
    print("Inserting {len(remittance_reports_data)} remittance_reports...")
{dict_to_insert("remittance_reports", remittance_reports_data)}
    
    # GEOGRAPHICAL DOCUMENTS ({len(geographical_documents_data)} records)
    print("Inserting {len(geographical_documents_data)} geographical_documents...")
{dict_to_insert("geographical_documents", geographical_documents_data)}
    
    # WAYLEAVE AGREEMENTS ({len(wayleave_agreements_data)} records)
    print("Inserting {len(wayleave_agreements_data)} wayleave_agreements...")
{dict_to_insert("wayleave_agreements", wayleave_agreements_data)}
    
    # MOVING HOUSE NOTIFICATIONS ({len(moving_house_notifications_data)} records)
    print("Inserting {len(moving_house_notifications_data)} moving_house_notifications...")
{dict_to_insert("moving_house_notifications", moving_house_notifications_data)}
    
    # BANK DETAILS AUDIT ({len(bank_details_audit_data)} records)
    print("Inserting {len(bank_details_audit_data)} bank_details_audit...")
{dict_to_insert("bank_details_audit", bank_details_audit_data)}
    
    # VENDOR AUDIT ({len(vendor_audit_data)} records)
    print("Inserting {len(vendor_audit_data)} vendor_audit...")
{dict_to_insert("vendor_audit", vendor_audit_data)}
    
    # Re-enable triggers
    op.execute("SET session_replication_role = 'origin'")
    
    print("✓ All seed data inserted successfully!")


def downgrade() -> None:
    """Remove all seed data."""
    # Delete in reverse order of foreign key dependencies
    op.execute("DELETE FROM vendor_audit")
    op.execute("DELETE FROM bank_details_audit")
    op.execute("DELETE FROM moving_house_notifications")
    op.execute("DELETE FROM wayleave_agreements")
    op.execute("DELETE FROM geographical_documents")
    op.execute("DELETE FROM remittance_reports")
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
    print(f"\n✓ Total records:")
    print(f"  - Vendors: {len(vendors_data)}")
    print(f"  - User Details: {len(user_details_data)}")
    print(f"  - Bank Details: {len(bank_details_data)}")
    print(f"  - Payment History: {len(payment_history_data)}")
    print(f"  - Payment Schedule Headers: {len(payment_schedule_headers_data)}")
    print(f"  - Payment Schedule Items: {len(payment_schedule_items_data)}")
    print(f"  - Remittance Documents: {len(remittance_documents_data)}")
    print(f"  - Remittance Reports: {len(remittance_reports_data)}")
    print(f"  - Geographical Documents: {len(geographical_documents_data)}")
    print(f"  - Wayleave Agreements: {len(wayleave_agreements_data)}")
    print(f"  - Moving House Notifications: {len(moving_house_notifications_data)}")
    print(f"  - Bank Details Audit: {len(bank_details_audit_data)}")
    print(f"  - Vendor Audit: {len(vendor_audit_data)}")
    print(f"\n✓ Migration file ready for deployment!")

if __name__ == "__main__":
    create_migration()
