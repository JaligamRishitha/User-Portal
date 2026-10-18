# 🚀 UKPN Portal - Database Migrations with Alembic

## ✅ Setup Complete!

Your database migration system is now fully configured with Alembic. All your current database schema and data have been captured in version-controlled migration files.

## 📦 What's Included

### Migration Files
1. **Initial Schema** (`95b6c1509bb5_initial_migration_with_all_tables.py`)
   - All database tables
   - Foreign key relationships
   - Indexes and constraints
   - Column types and defaults

2. **Seed Data** (`seed_initial_data.py`)
   - Sample vendors
   - User details
   - Bank information
   - Ready-to-use test data

### Helper Scripts
- `deploy_migrations.sh` (Linux/Mac)
- `deploy_migrations.bat` (Windows)
- `run_migration_docker.bat` (Docker)

### Documentation
- `ALEMBIC_MIGRATION_GUIDE.md` - Complete Alembic guide
- `DEPLOYMENT_GUIDE.md` - Server deployment instructions
- `MIGRATION_SUMMARY.md` - Quick reference

## 🎯 Quick Commands

### Docker (Development)

```bash
# Apply all migrations (creates tables + inserts data)
docker exec -it ukpn-backend alembic upgrade head

# Check current version
docker exec -it ukpn-backend alembic current

# View migration history
docker exec -it ukpn-backend alembic history

# Rollback one migration
docker exec -it ukpn-backend alembic downgrade -1

# Create new migration
docker exec -it ukpn-backend alembic revision --autogenerate -m "Your description"
```

### Server (Production)

```bash
# Navigate to backend
cd User-Portal/backend

# Apply migrations
alembic upgrade head

# Check status
alembic current

# View history
alembic history
```

## 🌟 For Server Deployment

When deploying to your production server:

### Option 1: Use Deployment Script (Recommended)

**Linux/Mac:**
```bash
chmod +x deploy_migrations.sh
./deploy_migrations.sh
```

**Windows:**
```cmd
deploy_migrations.bat
```

### Option 2: Manual Deployment

1. **Set up environment**:
   ```bash
   cd User-Portal/backend
   pip install -r requirements.txt
   ```

2. **Configure database** in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/ukpn_portal
   ```

3. **Run migrations**:
   ```bash
   alembic upgrade head
   ```

4. **Verify**:
   ```bash
   alembic current
   ```

## 📋 What Happens on First Deployment

When you run `alembic upgrade head` on a fresh database:

1. ✅ Creates `alembic_version` table (tracks migrations)
2. ✅ Creates all application tables:
   - vendors
   - user_details
   - bank_details
   - payment_history
   - payment_schedule_headers
   - payment_schedule_items
   - remittance_documents
   - wayleave_agreements
3. ✅ Sets up all foreign keys and indexes
4. ✅ Inserts seed data (2 vendors with details)
5. ✅ Database is ready to use!

## 🔄 Updating Your Application

When you add new features that require database changes:

### 1. Update Your Models

Edit `backend/models.py` to add/modify tables or columns.

### 2. Generate Migration

```bash
docker exec -it ukpn-backend alembic revision --autogenerate -m "Add new feature"
```

### 3. Review Generated Migration

Check the file in `backend/alembic/versions/` and adjust if needed.

### 4. Apply Migration

```bash
docker exec -it ukpn-backend alembic upgrade head
```

### 5. Commit to Git

```bash
git add backend/alembic/versions/
git commit -m "Add database migration for new feature"
git push
```

### 6. Deploy to Server

```bash
# On server
git pull
cd backend
alembic upgrade head
```

## 🎓 Example: Adding a New Column

Let's say you want to add a `phone_verified` column to the `vendors` table:

### 1. Update Model

```python
# backend/models.py
class Vendor(Base):
    __tablename__ = "vendors"
    # ... existing columns ...
    phone_verified = Column(Boolean, default=False)  # NEW
```

### 2. Generate Migration

```bash
docker exec -it ukpn-backend alembic revision --autogenerate -m "Add phone_verified to vendors"
```

### 3. Apply Migration

```bash
docker exec -it ukpn-backend alembic upgrade head
```

Done! The column is now in your database.

## 🛡️ Safety Features

### Rollback Support

Made a mistake? Roll back:

```bash
# Undo last migration
alembic downgrade -1

# Go back to specific version
alembic downgrade <revision_id>

# Remove all migrations (CAREFUL!)
alembic downgrade base
```

### Version Control

All migrations are tracked in git, so:
- ✅ Team members get the same database structure
- ✅ You can see history of all changes
- ✅ Easy to deploy to multiple environments
- ✅ Can recreate database at any point in time

## 📊 Checking Your Database

### View Tables

```bash
docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "\dt"
```

### View Data

```bash
docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT * FROM vendors;"
```

### Check Migration Status

```bash
docker exec -it ukpn-backend alembic current
```

## 🚨 Troubleshooting

### "Table already exists" Error

Your database already has tables. You have two options:

**Option A: Mark migrations as applied (if tables match)**
```bash
# Mark all migrations as applied without running them
docker exec -it ukpn-backend alembic stamp head
```

**Option B: Fresh start (DESTRUCTIVE - Development only)**
```bash
# Drop all tables
docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Apply migrations
docker exec -it ukpn-backend alembic upgrade head
```

### Migration Conflicts

If you get conflicts after pulling new code:

```bash
# Check current state
alembic current

# View all migrations
alembic history

# Apply missing migrations
alembic upgrade head
```

## 📚 Additional Resources

- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Project Guides**:
  - `backend/ALEMBIC_MIGRATION_GUIDE.md`
  - `DEPLOYMENT_GUIDE.md`
  - `MIGRATION_SUMMARY.md`

## ✨ Benefits of This Setup

1. **Version Control**: Database schema is in git
2. **Reproducible**: Same structure everywhere
3. **Team Friendly**: Everyone stays in sync
4. **Safe Deployments**: Test migrations before production
5. **Rollback Support**: Undo changes if needed
6. **Automated**: One command to update database
7. **Documented**: Clear history of all changes

## 🎉 You're All Set!

Your database migration system is ready. When you deploy to your server:

1. Install dependencies: `pip install -r requirements.txt`
2. Configure `.env` with database credentials
3. Run: `alembic upgrade head`
4. Start your application!

The database will be created with all tables and seed data automatically.

---

**Need Help?** Check the detailed guides in:
- `backend/ALEMBIC_MIGRATION_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`
