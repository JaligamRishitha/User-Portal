@echo off
echo ============================================================
echo Inserting vendor 5000000015 data into database
echo ============================================================
echo.

docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal < backend/database/seed_5000000015.sql

echo.
echo ============================================================
echo Done! Vendor 5000000015 data inserted successfully
echo ============================================================
echo.
echo Login credentials:
echo   Vendor ID: 5000000015
echo   Email: susanfrogers@gmail.com
echo   Password: Test@123
echo.
echo Next step: Upload PDF with Postman
echo   POST http://localhost:8000/api/remittance-documents/upload
echo   Body (form-data):
echo     vendor_id: 5000000015
echo     fiscal_year: 2023
echo     file: [Select 5000000015_2023.pdf]
echo.
pause
