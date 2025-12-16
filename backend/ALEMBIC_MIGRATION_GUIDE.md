# Alembic Database Migration Guide

This project uses Alembic for database schema migrations and seed data management.

## Setup

Alembic is already configured and initialized in the `backend` directory.

## Migration Files

- **Initial Migration**: `alembic/versions/95b6c1509bb5_initial_migration_with_all_tables.py`
  - Creates all database tables with proper schema
  - Includes: vendors, user_details, bank_details, payment_history, payment_schedules, remittance_documents, wayleave_agreements

- **Seed Data Migration**: `alembic/versions/seed_initial_data.py`
  - Inserts initial seed data for testing and development
  - Includes sample vendors, user details, and bank details

## Running Migrations

### In Docker (Recommended for Development)

```bash
# Apply all migrations
docker exec -it ukpn-backend alembic upgrade head

# Check current migration status
docker exec -it ukpn-backend alembic current

# View migration history
docker exec -it ukpn-backend alembic history

# Rollback one migration
docker exec -it ukpn-backend alembic downgrade -1

# Rollback to specific revision
docker exec -it ukpn-backend alembic downgrade <revision_id>

# Rollback all migrations
docker exec -it ukpn-backend alembic downgrade base
```

### On Server (Production Deployment)

```bash
# Navigate to backend directory
cd /path/to/User-Portal/backend

# Apply all migrations
alembic upgrade head

# Check status
alembic current
```

## Creating New Migrations

### Auto-generate from model changes

```bash
# In Docker
docker exec -it ukpn-backend alembic revision --autogenerate -m "Description of changes"

# On server
alembic revision --autogenerate -m "Description of changes"
```

### Create empty migration (for data changes)

```bash
# In Docker
docker exec -it ukpn-backend alembic revision -m "Description of changes"

# On server
alembic revision -m "Description of changes"
```

## Deployment Workflow

### First Time Deployment (Fresh Database)

1. Ensure PostgreSQL database is created
2. Update `.env` file with correct database credentials
3. Run migrations:
   ```bash
   alembic upgrade head
   ```

This will:
- Create all tables
- Insert seed data
- Set up the database ready for use

### Updating Existing Deployment

1. Pull latest code with new migrations
2. Run migrations:
   ```bash
   alembic upgrade head
   ```

Alembic will automatically apply only the new migrations that haven't been run yet.

## Migration Files Location

- **Configuration**: `alembic.ini`
- **Environment**: `alembic/env.py`
- **Migrations**: `alembic/versions/`

## Important Notes

1. **Never edit applied migrations** - Create new migrations instead
2. **Test migrations** in development before deploying to production
3. **Backup database** before running migrations in production
4. **Version control** - All migration files are tracked in git

## Troubleshooting

### Check if migrations are applied

```bash
docker exec -it ukpn-backend alembic current
```

### View pending migrations

```bash
docker exec -it ukpn-backend alembic history
```

### Reset database (Development only - DESTRUCTIVE)

```bash
# Drop all tables
docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reapply all migrations
docker exec -it ukpn-backend alembic upgrade head
```

## Environment Variables

Alembic uses the same database configuration as the application:

```env
DATABASE_URL=postgresql://ukpn_user:ukpn_password@postgres:5432/ukpn_portal
```

Or individual variables:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ukpn_portal
DB_USER=ukpn_user
DB_PASSWORD=ukpn_password
```

## Adding More Seed Data

To add more seed data, create a new migration:

```bash
docker exec -it ukpn-backend alembic revision -m "Add more seed data"
```

Then edit the generated file in `alembic/versions/` to add your data using `op.bulk_insert()` or `op.execute()`.
