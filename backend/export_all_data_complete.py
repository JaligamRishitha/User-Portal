"""
Export ALL data from the database to Python migration format
"""
import sys
from sqlalchemy import inspect, text
from database import engine
from datetime import datetime

def python_repr(val):
    """Convert value to Python representation for migration file"""
    if val is None:
        return "None"
    elif isinstance(val, str):
        # Use repr() which properly escapes all special characters
        return repr(val)
    elif isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, datetime):
        return repr(val.isoformat())
    elif isinstance(val, bool):
        return str(val)
    elif isinstance(val, bytes):
        # For binary data, use base64
        import base64
        b64 = base64.b64encode(val).decode('utf-8')
        return f"base64.b64decode('{b64}')"
    else:
        return repr(str(val))

def export_table_data(table_name):
    """Export data from a table as Python dict"""
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
                if val is not None:
                    row_dict[col] = python_repr(val)
            data_list.append(row_dict)
        
        return data_list

def main():
    print("Exporting all data from database...")
    
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
    
    for table_name in tables:
        try:
            print(f"Exporting {table_name}...")
            data = export_table_data(table_name)
            all_data[table_name] = data
            print(f"  ✓ {len(data)} rows")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            all_data[table_name] = []
    
    # Write to Python file
    output_file = "all_data_export.py"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# Complete database export\n")
        f.write("# Generated automatically\n\n")
        f.write("import base64\n\n")
        
        for table_name, data in all_data.items():
            f.write(f"\n# {table_name.upper()} ({len(data)} rows)\n")
            f.write(f"{table_name}_data = [\n")
            for row_dict in data:
                f.write("    {\n")
                for key, val in row_dict.items():
                    f.write(f"        '{key}': {val},\n")
                f.write("    },\n")
            f.write("]\n")
    
    print(f"\n✓ Data exported to {output_file}")
    
    # Print summary
    print("\nSummary:")
    for table_name, data in all_data.items():
        print(f"  {table_name}: {len(data)} rows")

if __name__ == "__main__":
    main()
