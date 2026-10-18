# Quick Start: Complete Data Migration

## 🎯 Goal
Create a migration file with ALL data from your Docker database for server deployment.

## ⚡ Quick Steps

### 1. Start Docker
```bash
docker-compose up -d
```

### 2. Run Export Script

**Windows:**
```cmd
create_complete_seed_migration.bat
```

**Linux/Mac:**
```bash
chmod +x create_complete_seed_migration.sh
./create_complete_seed_migration.sh
```

### 3. Verify
```bash
# Check the migration file was created
dir backend\alembic\versions\complete_seed_data.py
```

### 4. Deploy to Server
```bash
cd backend
alembic upgrade head
```

## ✅ What You Get

A single migration file (`complete_seed_data.py`) containing:

- ✅ All 8 vendors (not just 2!)
- ✅ All user details
- ✅ All bank details
- ✅ All payment history
- ✅ All payment schedules
- ✅ All remittance documents
- ✅ All wayleave agreements
- ✅ Everything in your Docker database!

## 📊 Expected Output

```
Exporting vendors...
  ✓ 8 rows
Exporting user_details...
  ✓ 2 rows
Exporting bank_details...
  ✓ 2 rows
Exporting payment_history...
  ✓ 3 rows
Exporting payment_schedule_headers...
  ✓ 2 rows
Exporting payment_schedule_items...
  ✓ 7 rows
Exporting remittance_documents...
  ✓ 3 rows
Exporting wayleave_agreements...
  ✓ 1 rows

✓ Data exported to all_data_export.py
✓ Created complete seed migration
```

## 🚀 Server Deployment

Once you have the migration file:

1. **Commit to git:**
   ```bash
   git add backend/alembic/versions/complete_seed_data.py
   git commit -m "Add complete seed data"
   git push
   ```

2. **On server:**
   ```bash
   git pull
   cd backend
   alembic upgrade head
   ```

3. **Done!** All your data is now on the server.

## 🔄 Updating Data

If you add more data to Docker and want to update:

```bash
# Delete old migration (if not yet deployed)
rm backend/alembic/versions/complete_seed_data.py

# Create new one with updated data
create_complete_seed_migration.bat
```

## 📝 Files Created

1. `backend/all_data_export.py` - Exported data in Python format
2. `backend/alembic/versions/complete_seed_data.py` - Migration file

## ⚠️ Important Notes

- **Run this BEFORE deploying to production** to capture all your current data
- The migration file will be large if you have lots of data (that's normal)
- Binary data (PDFs) is automatically converted to base64
- All data is properly escaped and safe

## 🆘 Troubleshooting

**Docker not running?**
```bash
# Start Docker Desktop, then run the script again
```

**Migration already exists?**
```bash
# Delete it first (if not deployed yet)
rm backend/alembic/versions/complete_seed_data.py
# Then run the script again
```

**Want to see what's in the migration?**
```bash
# Open the file
code backend/alembic/versions/complete_seed_data.py
```

## 📚 More Info

See `COMPLETE_DATA_MIGRATION_GUIDE.md` for detailed documentation.

---

**That's it!** Run the script, commit the file, deploy to server. All your data will be there! 🎉
