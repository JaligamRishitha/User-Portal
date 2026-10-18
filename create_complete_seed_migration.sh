#!/bin/bash

echo "========================================"
echo "Creating Complete Seed Data Migration"
echo "========================================"
echo ""

echo "Step 1: Exporting all data from Docker database..."
docker exec -it ukpn-backend python export_all_data_complete.py

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Failed to export data. Make sure Docker is running."
    exit 1
fi

echo ""
echo "Step 2: Creating comprehensive seed migration..."
docker exec -it ukpn-backend python create_complete_seed_migration.py

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Failed to create migration."
    exit 1
fi

echo ""
echo "========================================"
echo "Complete seed migration created!"
echo "========================================"
echo ""
echo "The migration file has been created in:"
echo "backend/alembic/versions/"
echo ""
echo "To apply it on the server, run:"
echo "  alembic upgrade head"
echo ""
