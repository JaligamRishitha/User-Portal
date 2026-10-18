# Complete Data Migration Guide

## Overview

This guide explains how to create a migration file with ALL data from your Docker database, so when you deploy to the server, all your current data will be automatically inserted.

## Quick Start

### Step 1: Start Docker

Make sure Docker Desktop is running and your containers are up:

```bash
docker-compose up -d
```

### Step 2: Run the Complete Export Script

**Windows:**
```cmd
create_complete_seed_migration.bat
```

**Linux/Mac:**
```bash
chmod +x create_complete_seed_migration.sh
./create_complete_seed_migration.sh
```

**Or manually:**
```bash
# Export all data
docker exec -it ukpn-backend python export_all_data_complete.py

# Create migration file
docker exec -it ukpn-backend python create_complete_seed_migration.py
```

### Step 3: Verify the Migration

Check that the migration file was created:
```bash
ls backend/alembic/versions/complete_seed_data.py
```

### Step 4: Deploy to Server

When deploying to your production server:

```bash
cd User-Portal/backend
alembic upgrade head
```

This will:
1. Create all tables (from initial migration)
2. Insert ALL your data (from complete seed migration)

## What Gets Exported

The script exports ALL data from these tables:

1. **vendors** - All vendor records
2. **user_details** - All user detail records
3. **bank_details** - All bank account information
4. **payment_history** - All payment records
5. **payment_schedule_headers** - All payment schedule headers
6. **payment_schedule_items** - All payment schedule items
7. **remittance_documents** - All remittance documents (including file data)
8. **wayleave_agreements** - All wayleave agreements

## Files Created

### 1. Export Script
- **File**: `backend/export_all_data_complete.py`
- **Purpose**: Exports all data from Docker database to Python format
- **Output**: `backend/all_data_export.py`

### 2. Migration Generator
- **File**: `backend/create_complete_seed_migration.py`
- **Purpose**: Creates Alembic migration from exported data
- **Output**: `backend/alembic/versions/complete_seed_data.py`

### 3. Batch Script
- **File**: `create_complete_seed_migration.bat`
- **Purpose**: Runs both scripts automatically

## Migration File Structure

The generated migration file (`complete_seed_data.py`) will contain:

```python
"""Complete seed data with all records

Revision ID: complete_seed_data
Revises: 95b6c1509bb5
Create Date: 2025-12-16...
"""

def upgrade() -> None:
    """Insert complete seed data."""
    # Inserts all vendors
    # Inserts all user_details
    # Inserts all bank_details
    # Inserts all payment_history
    # Inserts all payment_schedule_headers
    # Inserts all payment_schedule_items
    # Inserts all remittance_documents
    # Inserts all wayleave_agreements

def downgrade() -> None:
    """Remove all seed data."""
    # Deletes all data in reverse order
```

## Deployment Workflow

### Development (Docker)

1. Make changes to your data in Docker
2. Run export script to capture changes:
   ```bash
   docker exec -it ukpn-backend python export_all_data_complete.py
   docker exec -it ukpn-backend python create_complete_seed_migration.py
   ```
3. Commit the new migration file to git

### Production (Server)

1. Pull latest code (includes new migration)
2. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```
3. All your data is now on the server!

## Updating Data

If you add/modify data in Docker and want to update the migration:

### Option 1: Create New Migration (Recommended)

```bash
# Export current data
docker exec -it ukpn-backend python export_all_data_complete.py

# Create new migration with timestamp
docker exec -it ukpn-backend alembic revision -m "Update seed data $(date +%Y%m%d)"

# Manually add the data to the new migration file
```

### Option 2: Replace Existing Migration (Development Only)

```bash
# Delete old migration
rm backend/alembic/versions/complete_seed_data.py

# Create new one
docker exec -it ukpn-backend python export_all_data_complete.py
docker exec -it ukpn-backend python create_complete_seed_migration.py
```

⚠️ **Warning**: Only do this if the migration hasn't been applied to production yet!

## Handling Large Data

### Binary Data (Remittance Documents)

The script automatically handles binary data (PDF files) by:
1. Converting to base64
2. Including in migration file
3. Decoding on insert

### Large Text Fields

Long text fields (like extracted_text in wayleave_agreements) are:
1. Properly escaped
2. Included in full
3. Inserted correctly

## Troubleshooting

### "Docker not running" Error

Start Docker Desktop and wait for it to fully start, then run the script again.

### "Table already exists" Error

If deploying to a database that already has tables:

```bash
# Mark migrations as applied without running them
alembic stamp head
```

### "Data already exists" Error

If data already exists in the database:

```bash
# Skip the seed migration
alembic upgrade 95b6c1509bb5  # Stop before seed migration
```

Or clear the database first (DESTRUCTIVE):

```bash
# Drop all data
psql -U your_user -d ukpn_portal -c "TRUNCATE vendors CASCADE;"

# Run migrations
alembic upgrade head
```

### Migration File Too Large

If the migration file is very large (>10MB):

1. Consider splitting into multiple migrations
2. Or use a data import script instead
3. Or store large files separately and reference them

## Verifying Data After Migration

After running migrations on the server, verify the data:

```bash
# Check record counts
psql -U your_user -d ukpn_portal -c "
SELECT 
    'vendors' as table_name, COUNT(*) as count FROM vendors
UNION ALL
SELECT 'user_details', COUNT(*) FROM user_details
UNION ALL
SELECT 'bank_details', COUNT(*) FROM bank_details
UNION ALL
SELECT 'payment_history', COUNT(*) FROM payment_history
UNION ALL
SELECT 'payment_schedule_headers', COUNT(*) FROM payment_schedule_headers
UNION ALL
SELECT 'payment_schedule_items', COUNT(*) FROM payment_schedule_items
UNION ALL
SELECT 'remittance_documents', COUNT(*) FROM remittance_documents
UNION ALL
SELECT 'wayleave_agreements', COUNT(*) FROM wayleave_agreements;
"
```

## Best Practices

1. **Version Control**: Always commit migration files to git
2. **Test First**: Test migrations in development before production
3. **Backup**: Backup production database before running migrations
4. **Document**: Add comments to migration files explaining what data is included
5. **Incremental**: For ongoing changes, create new migrations instead of modifying existing ones

## Example: Complete Deployment

```bash
# On your development machine
cd User-Portal
docker-compose up -d
create_complete_seed_migration.bat
git add backend/alembic/versions/complete_seed_data.py
git commit -m "Add complete seed data migration"
git push

# On production server
cd User-Portal
git pull
cd backend
pip install -r requirements.txt
alembic upgrade head

# Verify
alembic current
psql -U your_user -d ukpn_portal -c "SELECT COUNT(*) FROM vendors;"
```

## Summary

- ✅ Export script captures ALL data from Docker database
- ✅ Migration generator creates Alembic migration file
- ✅ One command deployment on server
- ✅ All data automatically inserted
- ✅ Rollback support included
- ✅ Version controlled in git

Your complete database with all data will be ready on the server after running `alembic upgrade head`!
