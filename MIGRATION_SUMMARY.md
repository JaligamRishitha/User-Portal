# Database Migration Setup - Summary

## What Was Created

### 1. Alembic Configuration
- **Location**: `backend/alembic/`
- **Config File**: `backend/alembic.ini`
- **Environment**: `backend/alembic/env.py` (configured to use your models and database settings)

### 2. Migration Files

#### Initial Schema Migration
- **File**: `backend/alembic/versions/95b6c1509bb5_initial_migration_with_all_tables.py`
- **Purpose**: Creates all database tables
- **Tables Created**:
  - vendors
  - user_details
  - bank_details
  - payment_history
  - payment_schedule_headers
  - payment_schedule_items
  - remittance_documents
  - wayleave_agreements (with company_with column)

#### Seed Data Migration
- **File**: `backend/alembic/versions/seed_initial_data.py`
- **Purpose**: Inserts initial test/development data
- **Data Included**:
  - 2 sample vendors (5000000015, 5000000061)
  - 2 user detail records
  - 2 bank detail records

### 3. Helper Scripts

#### Data Export Script
- **File**: `backend/export_database_data.py`
- **Purpose**: Exports current database data to SQL INSERT statements
- **Output**: `backend/database_data_export.sql`

#### Seed Data Generator
- **File**: `backend/create_seed_data_migration.py`
- **Purpose**: Creates the seed data migration file

#### Migration Scripts
- **File**: `backend/add_company_with_column.py`
- **Purpose**: Adds company_with column to wayleave_agreements table

### 4. Deployment Scripts

#### Linux/Mac
- **File**: `deploy_migrations.sh`
- **Usage**: `./deploy_migrations.sh`

#### Windows
- **File**: `deploy_migrations.bat`
- **Usage**: `deploy_migrations.bat`

#### Docker
- **File**: `run_migration_docker.bat`
- **Usage**: Runs migrations in Docker container

### 5. Documentation

- **ALEMBIC_MIGRATION_GUIDE.md**: Complete guide for using Alembic
- **DEPLOYMENT_GUIDE.md**: Full server deployment instructions
- **MIGRATION_SUMMARY.md**: This file

## Quick Start

### For Development (Docker)

```bash
# Apply all migrations
docker exec -it ukpn-backend alembic upgrade head

# Check status
docker exec -it ukpn-backend alembic current
```

### For Production Server

```bash
# Navigate to backend directory
cd User-Portal/backend

# Apply all migrations
alembic upgrade head

# Verify
alembic current
```

## What Happens When You Run Migrations

1. **First Migration** (95b6c1509bb5):
   - Creates all database tables
   - Sets up foreign key relationships
   - Adds indexes for performance
   - Configures column types and constraints

2. **Seed Data Migration** (seed_initial_data):
   - Inserts 2 sample vendors
   - Adds corresponding user details
   - Adds bank account information
   - Ready for testing immediately

## Benefits

✅ **Version Control**: All database changes are tracked in git
✅ **Reproducible**: Same database structure on all environments
✅ **Rollback**: Can undo migrations if needed
✅ **Team Collaboration**: Everyone uses the same schema
✅ **Deployment**: Simple one-command deployment
✅ **Seed Data**: Automatic test data insertion

## Migration Workflow

### Creating New Migrations

```bash
# Auto-generate from model changes
docker exec -it ukpn-backend alembic revision --autogenerate -m "Add new column"

# Create manual migration
docker exec -it ukpn-backend alembic revision -m "Add seed data"
```

### Applying Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply one migration
alembic upgrade +1

# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

### Checking Status

```bash
# Current version
alembic current

# Migration history
alembic history

# Show pending migrations
alembic history --verbose
```

## Files Updated

### Backend
- ✅ `requirements.txt` - Added alembic==1.17.2
- ✅ `alembic.ini` - Alembic configuration
- ✅ `alembic/env.py` - Environment setup with models
- ✅ `alembic/versions/` - Migration files

### Root Directory
- ✅ `deploy_migrations.sh` - Linux deployment script
- ✅ `deploy_migrations.bat` - Windows deployment script
- ✅ `DEPLOYMENT_GUIDE.md` - Full deployment guide
- ✅ `MIGRATION_SUMMARY.md` - This summary

## Next Steps

1. **Test Migrations Locally**:
   ```bash
   docker exec -it ukpn-backend alembic upgrade head
   ```

2. **Verify Database**:
   ```bash
   docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "\dt"
   ```

3. **Check Data**:
   ```bash
   docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT * FROM vendors;"
   ```

4. **Deploy to Server**:
   - Follow `DEPLOYMENT_GUIDE.md`
   - Run `deploy_migrations.sh` or `deploy_migrations.bat`

## Important Notes

⚠️ **Never edit applied migrations** - Create new ones instead
⚠️ **Always backup production database** before running migrations
⚠️ **Test migrations in development** before production deployment
⚠️ **Commit migration files to git** for team collaboration

## Support

For detailed information, see:
- `backend/ALEMBIC_MIGRATION_GUIDE.md` - Alembic usage
- `DEPLOYMENT_GUIDE.md` - Server deployment
- Alembic Documentation: https://alembic.sqlalchemy.org/
