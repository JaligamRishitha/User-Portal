-- Sample SQL commands to add postcodes to existing remittance_reports rows
-- Run these commands in PostgreSQL to update existing records

-- Example 1: Update specific rows by ID
UPDATE remittance_reports SET postcode = 'SW1A 1AA' WHERE id = 1;
UPDATE remittance_reports SET postcode = 'E1 6AN' WHERE id = 2;
UPDATE remittance_reports SET postcode = 'W1A 0AX' WHERE id = 3;

-- Example 2: Update by fiscal year
UPDATE remittance_reports SET postcode = 'TN25 5HW' WHERE fiscal_year = '2023';
UPDATE remittance_reports SET postcode = 'SE1 9SG' WHERE fiscal_year = '2024';

-- Example 3: View all remittance reports to see what needs updating
SELECT id, fiscal_year, document_name, postcode FROM remittance_reports ORDER BY fiscal_year;

-- Example 4: Bulk update multiple rows with different postcodes
-- (You'll need to adjust IDs and postcodes based on your data)
UPDATE remittance_reports SET postcode = 'N1 9AG' WHERE id IN (1, 2, 3);
UPDATE remittance_reports SET postcode = 'EC1A 1BB' WHERE id IN (4, 5, 6);

-- To run these commands, use:
-- docker-compose exec postgres psql -U ukpn_user -d ukpn_portal -f /path/to/this/file.sql
-- OR copy and paste individual commands into:
-- docker-compose exec postgres psql -U ukpn_user -d ukpn_portal
