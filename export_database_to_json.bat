@echo off
echo ========================================
echo Exporting Database to JSON
echo ========================================
echo.

echo Step 1: Running export script in Docker...
docker exec -it ukpn-backend python export_database_to_json.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to export data. Make sure Docker is running.
    pause
    exit /b 1
)

echo.
echo Step 2: Copying JSON file from Docker to local...
docker cp ukpn-backend:/app/database_export.json ./backend/database_export.json

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to copy file.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Export Complete!
echo ========================================
echo.
echo JSON file created at:
echo backend\database_export.json
echo.
echo File size: 
dir backend\database_export.json | find "database_export.json"
echo.
pause
