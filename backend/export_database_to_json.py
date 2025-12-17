"""
Export all data from the database to JSON format
"""
import json
import sys
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import inspect, text
from database import engine

def serialize_value(val):
    """Convert value to JSON-serializable format"""
    if val is None:
        return None
    elif isinstance(val, (datetime, date)):
        return val.isoformat()
    elif isinstance(val, Decimal):
        return float(val)
    elif isinstance(val, (bytes, memoryview)):
        # For binary data, convert to base64
        import base64
        if isinstance(val, memoryview):
            val = val.tobytes()
        return base64.b64encode(val).decode('utf-8')
    else:
        return val

def export_table_data(table_name):
    """Export data from a table as list of dicts"""
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT * FROM {table_name}"))
        rows = result.fetchall()
        columns = result.keys()
        
        if not rows:
            return []
        
        data_list = []
        for row in rows:
            row_dict = {}
            for col, val in zip(columns, row):
                row_dict[col] = serialize_value(val)
            data_list.append(row_dict)
        
        return data_list

def main():
    print("Exporting all data from database to JSON...")
    
    # Define tables in order (respecting foreign key dependencies)
    tables = [
        "vendors",
        "user_details",
        "bank_details",
        "payment_history",
        "payment_schedule_headers",
        "payment_schedule_items",
        "remittance_documents",
        "remittance_reports",
        "geographical_documents",
        "wayleave_agreements",
        "moving_house_notifications",
        "bank_details_audit",
        "vendor_audit",
    ]
    
    all_data = {}
    total_records = 0
    
    for table_name in tables:
        try:
            print(f"Exporting {table_name}...")
            data = export_table_data(table_name)
            all_data[table_name] = data
            total_records += len(data)
            print(f"  ✓ {len(data)} rows")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            all_data[table_name] = []
    
    # Add metadata
    export_metadata = {
        "export_date": datetime.now().isoformat(),
        "database": "ukpn_portal",
        "total_tables": len(tables),
        "total_records": total_records,
        "tables": list(all_data.keys())
    }
    
    # Create final JSON structure
    final_data = {
        "metadata": export_metadata,
        "data": all_data
    }
    
    # Write to JSON file
    output_file = "database_export.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Data exported to {output_file}")
    print(f"\n📊 Export Summary:")
    print(f"  - Total Tables: {len(tables)}")
    print(f"  - Total Records: {total_records}")
    print(f"  - Export Date: {export_metadata['export_date']}")
    
    print(f"\n📋 Records by Table:")
    for table_name, data in all_data.items():
        if len(data) > 0:
            print(f"  - {table_name}: {len(data)} records")

if __name__ == "__main__":
    main()
