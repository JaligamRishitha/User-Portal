@echo off
REM UKPN Portal - Database Migration Deployment Script
REM This script applies all database migrations on the server

echo =========================================
echo UKPN Portal - Database Migration
echo =========================================
echo.

REM Check if we're in the correct directory
if not exist "backend\alembic.ini" (
    echo Error: alembic.ini not found. Please run this script from the User-Portal directory.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

echo Checking current migration status...
alembic current

echo.
echo Viewing migration history...
alembic history --verbose

echo.
set /p CONFIRM="Do you want to apply all pending migrations? (y/n): "

if /i "%CONFIRM%"=="y" (
    echo.
    echo Applying migrations...
    alembic upgrade head
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Migrations applied successfully!
        echo.
        echo Current migration status:
        alembic current
    ) else (
        echo.
        echo Migration failed! Please check the error messages above.
        pause
        exit /b 1
    )
) else (
    echo.
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo =========================================
echo Migration deployment complete!
echo =========================================
pause
