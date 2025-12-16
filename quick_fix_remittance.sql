-- Quick fix for remittance_reports table
-- Run this in your PostgreSQL database

-- 1. Add vendor_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='remittance_reports' AND column_name='vendor_id'
    ) THEN
        ALTER TABLE remittance_reports ADD COLUMN vendor_id VARCHAR(50);
    END IF;
END $$;

-- 2. Try to populate vendor_id from document_name if it contains vendor ID
-- (assuming document names like "5000000061.pdf" where the number is the vendor_id)
UPDATE remittance_reports
SET vendor_id = SUBSTRING(document_name FROM '^(\d+)')
WHERE vendor_id IS NULL 
  AND document_name ~ '^\d+';

-- 3. If that doesn't work, try from postcode
UPDATE remittance_reports rr
SET vendor_id = (
    SELECT v.vendor_id 
    FROM vendors v
    JOIN user_details ud ON v.vendor_id = ud.vendor_id
    WHERE ud.postcode = rr.postcode 
    LIMIT 1
)
WHERE rr.vendor_id IS NULL 
  AND rr.postcode IS NOT NULL;

-- 4. Create index
CREATE INDEX IF NOT EXISTS idx_remittance_vendor_id ON remittance_reports(vendor_id);

-- 5. Verify
SELECT 
    COUNT(*) as total_records,
    COUNT(vendor_id) as records_with_vendor_id,
    COUNT(*) - COUNT(vendor_id) as missing_vendor_id
FROM remittance_reports;

-- 6. Show sample data
SELECT 
    rr.id,
    rr.document_name,
    rr.vendor_id,
    rr.postcode,
    v.first_name,
    v.last_name
FROM remittance_reports rr
LEFT JOIN vendors v ON rr.vendor_id = v.vendor_id
LIMIT 5;
