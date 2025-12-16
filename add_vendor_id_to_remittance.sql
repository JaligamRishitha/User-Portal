-- Migration: Add vendor_id column to remittance_reports table
-- Description: Adds vendor_id as a foreign key referencing user_details table

-- Step 1: Add vendor_id column (nullable initially to allow existing data)
ALTER TABLE remittance_reports 
ADD COLUMN vendor_id VARCHAR(50);

-- Step 2: Update existing records to link with user_details based on postcode
-- This will populate vendor_id for existing remittance reports
UPDATE remittance_reports rr
SET vendor_id = (
    SELECT ud.vendor_id 
    FROM user_details ud 
    WHERE ud.postcode = rr.postcode 
    LIMIT 1
)
WHERE rr.postcode IS NOT NULL;

-- Step 3: Add foreign key constraint
-- Note: This assumes user_details table has vendor_id as primary key or unique key
ALTER TABLE remittance_reports
ADD CONSTRAINT fk_remittance_vendor
FOREIGN KEY (vendor_id) 
REFERENCES user_details(vendor_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 4: Create index for better query performance
CREATE INDEX idx_remittance_vendor_id ON remittance_reports(vendor_id);

-- Verification queries:
-- Check the updated structure
-- SELECT * FROM remittance_reports LIMIT 5;

-- Verify foreign key relationship
-- SELECT 
--     rr.id,
--     rr.fiscal_year,
--     rr.vendor_id,
--     ud.vendor_name,
--     ud.first_name,
--     ud.last_name
-- FROM remittance_reports rr
-- LEFT JOIN user_details ud ON rr.vendor_id = ud.vendor_id
-- LIMIT 10;
