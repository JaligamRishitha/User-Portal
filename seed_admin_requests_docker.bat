@echo off
echo ============================================================
echo Seeding Admin Request Console Data
echo ============================================================
echo.

docker cp backend/seed_admin_requests.py ukpn-backend:/app/seed_admin_requests.py
docker exec ukpn-backend python seed_admin_requests.py

echo.
echo ============================================================
echo Done!
echo ============================================================
echo.
echo Login as admin to see the requests:
echo   URL: http://localhost:5173/login
echo   Email: admin@ukpn.com
echo   Password: Admin@123
echo.
pause
