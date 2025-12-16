-- Add grantor_postcode and tq_number columns to wayleave_agreements table

-- Add grantor_postcode column
ALTER TABLE wayleave_agreements 
ADD COLUMN IF NOT EXISTS grantor_postcode VARCHAR(20);

-- Add tq_number column
ALTER TABLE wayleave_agreements 
ADD COLUMN IF NOT EXISTS tq_number VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN wayleave_agreements.grantor_postcode IS 'Postcode extracted separately from grantor address';
COMMENT ON COLUMN wayleave_agreements.tq_number IS 'TQ number extracted from wayleave agreement document';

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'wayleave_agreements' 
AND column_name IN ('grantor_postcode', 'tq_number');
