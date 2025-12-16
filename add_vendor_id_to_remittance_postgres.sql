-- Add vendor_id column to remittance_reports table (PostgreSQL)

-- Step 1: Add vendor_id column
ALTER TABLE remittance_reports 
ADD COLUMN vendor_id VARCHAR(50);

-- Step 2: Populate vendor_id from postcode matches
UPDATE remittance_reports rr
SET vendor_id = (
    SELECT v.vendor_id 
    FROM vendors v
    JOIN user_details ud ON v.vendor_id = ud.vendor_id
    WHERE ud.postcode = rr.postcode 
    LIMIT 1
)
WHERE rr.postcode IS NOT NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE remittance_reports
ADD CONSTRAINT fk_remittance_vendor
FOREIGN KEY (vendor_id) 
REFERENCES vendors(vendor_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 4: Create index for performance
CREATE INDEX idx_remittance_vendor_id ON remittance_reports(vendor_id);

-- Verification
SELECT COUNT(*) as total_records, 
       COUNT(vendor_id) as records_with_vendor 
FROM remittance_reports;

-- Sample data
SELECT rr.id, rr.fiscal_year, rr.vendor_id, v.first_name, v.last_name
FROM remittance_reports rr
LEFT JOIN vendors v ON rr.vendor_id = v.vendor_id
LIMIT 5;
