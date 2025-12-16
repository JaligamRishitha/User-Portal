-- Add vendor_id column to geographical_documents table (PostgreSQL)

-- Step 1: Add vendor_id column
ALTER TABLE geographical_documents 
ADD COLUMN vendor_id VARCHAR(50);

-- Step 2: Populate vendor_id from postcode matches
UPDATE geographical_documents gd
SET vendor_id = (
    SELECT ud.vendor_id 
    FROM user_details ud 
    WHERE ud.postcode = gd.postcode 
    LIMIT 1
)
WHERE gd.postcode IS NOT NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE geographical_documents
ADD CONSTRAINT fk_geographical_vendor
FOREIGN KEY (vendor_id) 
REFERENCES user_details(vendor_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 4: Create index for performance
CREATE INDEX idx_geographical_vendor_id ON geographical_documents(vendor_id);

-- Verification
SELECT COUNT(*) as total_records, 
       COUNT(vendor_id) as records_with_vendor 
FROM geographical_documents;
