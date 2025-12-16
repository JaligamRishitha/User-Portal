-- Rollback Migration: Remove vendor_id column from remittance_reports table
-- Description: Removes the vendor_id foreign key and column

-- Step 1: Drop the foreign key constraint
ALTER TABLE remittance_reports
DROP CONSTRAINT IF EXISTS fk_remittance_vendor;

-- Step 2: Drop the index
DROP INDEX IF EXISTS idx_remittance_vendor_id;

-- Step 3: Drop the vendor_id column
ALTER TABLE remittance_reports
DROP COLUMN IF EXISTS vendor_id;

-- Verification: Check the table structure
-- SELECT * FROM remittance_reports LIMIT 5;
