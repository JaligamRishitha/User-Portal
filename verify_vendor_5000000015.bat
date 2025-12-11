@echo off
echo ============================================================
echo Verifying vendor 5000000015 data
echo ============================================================
echo.

echo Checking vendor...
docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT vendor_id, first_name, last_name, email FROM vendors WHERE vendor_id = '5000000015';"

echo.
echo Checking user details...
docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT street, city, postcode FROM user_details WHERE vendor_id = '5000000015';"

echo.
echo Checking payment history...
docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT fiscal_year, payment_amount, payment_date FROM payment_history WHERE vendor_id = '5000000015';"

echo.
echo Checking payment schedule...
docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT agreement_number, agreement_type, last_payment_date FROM payment_schedule_headers WHERE vendor_id = '5000000015';"

echo.
echo Checking payment schedule items...
docker exec -i ukpn-postgres psql -U ukpn_user -d ukpn_portal -c "SELECT item_number, land_reg_number, short_text FROM payment_schedule_items WHERE agreement_number = '1000000003';"

echo.
echo ============================================================
echo Verification complete!
echo ============================================================
pause
