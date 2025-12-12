@echo off
echo ============================================================
echo Seeding Admin Request Console Data
echo ============================================================
echo.

cd backend
python seed_admin_requests.py

echo.
echo ============================================================
echo Done!
echo ============================================================
echo.
pause
