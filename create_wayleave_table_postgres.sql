-- Create wayleave_agreements table for PostgreSQL
CREATE TABLE IF NOT EXISTS wayleave_agreements (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    
    -- Grantor Details
    grantor_name VARCHAR(255),
    grantor_address TEXT,
    grantor_telephone VARCHAR(50),
    grantor_email VARCHAR(255),
    
    -- Agreement Details
    agreement_date VARCHAR(100),
    agreement_ref VARCHAR(100),
    payment VARCHAR(50),
    duration VARCHAR(50),
    
    -- Wayleave Information
    property_location TEXT,
    works_description TEXT,
    drawing_number VARCHAR(100),
    
    -- Full extracted text
    extracted_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_wayleave_created_at ON wayleave_agreements(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wayleave_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wayleave_updated_at
    BEFORE UPDATE ON wayleave_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_wayleave_updated_at();
