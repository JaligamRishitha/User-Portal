# Database JSON Export Guide

## Overview

This guide explains how to export all your Docker database data to a JSON file for backup, analysis, or data migration purposes.

## Quick Export

### Windows
```cmd
export_database_to_json.bat
```

### Linux/Mac
```bash
chmod +x export_database_to_json.sh
./export_database_to_json.sh
```

### Manual Export
```bash
# Run export script in Docker
docker exec -it ukpn-backend python export_database_to_json.py

# Copy JSON file to local machine
docker cp ukpn-backend:/app/database_export.json ./backend/database_export.json
```

## Output File

**Location:** `backend/database_export.json`
**Size:** ~1.2 MB
**Format:** JSON with metadata and all table data

## JSON Structure

```json
{
  "metadata": {
    "export_date": "2025-12-17T07:43:20.128051",
    "database": "ukpn_portal",
    "total_tables": 13,
    "total_records": 44,
    "tables": ["vendors", "user_details", ...]
  },
  "data": {
    "vendors": [
      {
        "vendor_id": "5000000015",
        "title": "0002",
        "first_name": "John A",
        "last_name": "DREIER",
        "email": "susanfrogers@gmail.com",
        ...
      }
    ],
    "user_details": [...],
    "bank_details": [...],
    ...
  }
}
```

## Exported Data

### Tables Included (13 total)

| Table | Records | Description |
|-------|---------|-------------|
| vendors | 8 | All vendor accounts |
| user_details | 2 | User address information |
| bank_details | 2 | Bank account details |
| payment_history | 3 | Payment records |
| payment_schedule_headers | 2 | Payment schedule headers |
| payment_schedule_items | 7 | Payment schedule items |
| remittance_documents | 3 | Remittance PDFs (base64) |
| remittance_reports | 7 | Remittance report records |
| geographical_documents | 7 | Geographical document records |
| wayleave_agreements | 1 | Wayleave agreement data |
| moving_house_notifications | 2 | Moving house requests |
| bank_details_audit | 0 | Audit trail (empty) |
| vendor_audit | 0 | Vendor audit trail (empty) |

**Total Records:** 44

## Data Types

The export handles various data types:

- **Strings**: Exported as-is
- **Numbers**: Integers and decimals
- **Dates/Times**: ISO 8601 format (e.g., "2025-12-17T07:43:20")
- **Binary Data**: Base64 encoded (PDFs, images)
- **NULL values**: Exported as `null`

## Use Cases

### 1. Backup
Keep a JSON backup of your database:
```bash
export_database_to_json.bat
copy backend\database_export.json backups\backup_2025-12-17.json
```

### 2. Data Analysis
Import into Python for analysis:
```python
import json

with open('backend/database_export.json', 'r') as f:
    data = json.load(f)

# Access vendor data
vendors = data['data']['vendors']
print(f"Total vendors: {len(vendors)}")

# Access metadata
print(f"Export date: {data['metadata']['export_date']}")
```

### 3. Data Migration
Use the JSON to migrate data to another system:
```python
import json

with open('database_export.json', 'r') as f:
    data = json.load(f)

# Migrate to another database
for vendor in data['data']['vendors']:
    # Insert into new database
    new_db.insert('vendors', vendor)
```

### 4. Documentation
Generate documentation from the data:
```python
import json

with open('database_export.json', 'r') as f:
    data = json.load(f)

# Generate report
for table, records in data['data'].items():
    print(f"{table}: {len(records)} records")
```

## Binary Data (PDFs)

Binary data (like remittance PDFs) is base64 encoded in the JSON.

To decode:
```python
import json
import base64

with open('database_export.json', 'r') as f:
    data = json.load(f)

# Get first remittance document
doc = data['data']['remittance_documents'][0]
file_data_base64 = doc['file_data']

# Decode base64 to binary
pdf_bytes = base64.b64decode(file_data_base64)

# Save as PDF
with open('output.pdf', 'wb') as f:
    f.write(pdf_bytes)
```

## Importing Data

To import the JSON data into a new database:

```python
import json
from sqlalchemy import create_engine, text

# Load JSON
with open('database_export.json', 'r') as f:
    data = json.load(f)

# Connect to database
engine = create_engine('postgresql://user:pass@localhost/newdb')

# Import data
with engine.connect() as conn:
    for table_name, records in data['data'].items():
        for record in records:
            columns = ', '.join(record.keys())
            placeholders = ', '.join([f":{k}" for k in record.keys()])
            sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
            conn.execute(text(sql), record)
    conn.commit()
```

## Comparing Exports

Compare two exports to see what changed:

```python
import json

# Load two exports
with open('export1.json', 'r') as f:
    data1 = json.load(f)
with open('export2.json', 'r') as f:
    data2 = json.load(f)

# Compare record counts
for table in data1['data'].keys():
    count1 = len(data1['data'][table])
    count2 = len(data2['data'][table])
    if count1 != count2:
        print(f"{table}: {count1} -> {count2} ({count2-count1:+d})")
```

## Scheduling Automatic Exports

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 2 AM)
4. Action: Start a program
5. Program: `C:\path\to\User-Portal\export_database_to_json.bat`

### Linux Cron
```bash
# Edit crontab
crontab -e

# Add daily export at 2 AM
0 2 * * * cd /path/to/User-Portal && ./export_database_to_json.sh
```

## File Size

The JSON file size depends on your data:
- Current size: ~1.2 MB
- Includes 44 records
- Includes 3 base64-encoded PDFs

If the file becomes too large:
- Consider excluding binary data
- Export specific tables only
- Use compression (gzip)

## Troubleshooting

### "Docker not running"
Start Docker Desktop and try again.

### "File too large"
The JSON file includes base64-encoded PDFs which can be large. This is normal.

### "Permission denied"
Run the command prompt as Administrator (Windows) or use `sudo` (Linux/Mac).

### "Cannot find file"
Make sure you're in the User-Portal directory when running the script.

## Security Note

⚠️ **Important**: The JSON file contains sensitive data including:
- Passwords (hashed)
- Email addresses
- Bank account numbers
- Personal information

**Keep this file secure:**
- Don't commit to public repositories
- Store in encrypted location
- Delete after use if not needed
- Use secure transfer methods

## Summary

- ✅ Export all database data to JSON
- ✅ 13 tables, 44 records
- ✅ Includes binary data (base64)
- ✅ Easy to use batch script
- ✅ Perfect for backups and analysis
- ✅ Human-readable format

**Run:** `export_database_to_json.bat`
**Output:** `backend/database_export.json`
