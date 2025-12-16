#!/bin/bash

# UKPN Portal - Database Migration Deployment Script
# This script applies all database migrations on the server

echo "========================================="
echo "UKPN Portal - Database Migration"
echo "========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "backend/alembic.ini" ]; then
    echo "❌ Error: alembic.ini not found. Please run this script from the User-Portal directory."
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📋 Checking current migration status..."
alembic current

echo ""
echo "📜 Viewing migration history..."
alembic history --verbose

echo ""
read -p "Do you want to apply all pending migrations? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🚀 Applying migrations..."
    alembic upgrade head
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migrations applied successfully!"
        echo ""
        echo "📋 Current migration status:"
        alembic current
    else
        echo ""
        echo "❌ Migration failed! Please check the error messages above."
        exit 1
    fi
else
    echo ""
    echo "⏭️  Migration cancelled."
    exit 0
fi

echo ""
echo "========================================="
echo "Migration deployment complete!"
echo "========================================="
