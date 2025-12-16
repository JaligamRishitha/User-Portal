"""
Export all data from the database to SQL INSERT statements
"""
import sys
from sqlalchemy import inspect, text
from database import engine
from models import (
    Vendor, UserDetail, BankDetail, PaymentHistory,
    PaymentScheduleHeader, PaymentScheduleItem,
    RemittanceDocument, WayleaveAgreement
)

def export_table_data(table_name, model_class):
    """Export data from a table as SQL INSERT statements"""
    with engine.connect() as conn:
        # Get all records
        result = conn.execute(text(f"SELECT * FROM {table_name}"))
        rows = result.fetchall()
        columns = result.keys()
        
        if not rows:
            print(f"-- No data in {table_name}")
            return []
        
        print(f"-- Data for {table_name} ({len(rows)} rows)")
        
        inserts = []
        for row in rows:
            # Build column names and values
            col_names = ", ".join(columns)
            values = []
            
            for val in row:
                if val is None:
                    values.append("NULL")
                elif isinstance(val, str):
                    # Escape single quotes
                    escaped = val.replace("'", "''")
                    values.append(f"'{escaped}'")
                elif isinstance(val, (int, float)):
                    values.append(str(val))
                else:
                    # For dates and other types
                    values.append(f"'{val}'")
            
            values_str = ", ".join(values)
            insert_sql = f"INSERT INTO {table_name} ({col_names}) VALUES ({values_str});"
            inserts.append(insert_sql)
        
        return inserts

def main():
    print("-- Database Data Export")
    print("-- Generated automatically")
    print()
    
    # Define tables in order (respecting foreign key dependencies)
    tables = [
        ("vendors", Vendor),
        ("user_details", UserDetail),
        ("bank_details", BankDetail),
        ("payment_history", PaymentHistory),
        ("payment_schedule_headers", PaymentScheduleHeader),
        ("payment_schedule_items", PaymentScheduleItem),
        ("remittance_documents", RemittanceDocument),
        ("wayleave_agreements", WayleaveAgreement),
    ]
    
    all_inserts = []
    
    for table_name, model_class in tables:
        try:
            inserts = export_table_data(table_name, model_class)
            all_inserts.extend(inserts)
            print()
        except Exception as e:
            print(f"-- Error exporting {table_name}: {str(e)}")
            print()
    
    # Write to file
    output_file = "database_data_export.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- Database Data Export\n")
        f.write("-- Generated automatically\n\n")
        f.write("-- Disable triggers and constraints during import\n")
        f.write("SET session_replication_role = 'replica';\n\n")
        
        for insert in all_inserts:
            f.write(insert + "\n")
        
        f.write("\n-- Re-enable triggers and constraints\n")
        f.write("SET session_replication_role = 'origin';\n")
    
    print(f"✓ Data exported to {output_file}")
    print(f"✓ Total INSERT statements: {len(all_inserts)}")

if __name__ == "__main__":
    main()
