@echo off
echo ========================================
echo Creating Complete Seed Data Migration
echo ========================================
echo.

echo Step 1: Exporting all data from Docker database...
docker exec -it ukpn-backend python export_all_data_complete.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to export data. Make sure Docker is running.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating comprehensive seed migration...
docker exec -it ukpn-backend python create_complete_seed_migration.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to create migration.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Complete seed migration created!
echo ========================================
echo.
echo The migration file has been created in:
echo backend/alembic/versions/
echo.
echo To apply it on the server, run:
echo   alembic upgrade head
echo.
pause
