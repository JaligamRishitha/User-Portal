-- Migration script for Reports and Maps feature
-- Creates tables for geographical documents and remittance reports

-- Create geographical_documents table
CREATE TABLE IF NOT EXISTS geographical_documents (
    id SERIAL PRIMARY KEY,
    postcode VARCHAR(10) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT,
    document_type VARCHAR(50) DEFAULT 'PDF',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on postcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_geographical_postcode ON geographical_documents(postcode);

-- Create remittance_reports table
CREATE TABLE IF NOT EXISTS remittance_reports (
    id SERIAL PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT,
    document_type VARCHAR(50) DEFAULT 'PDF',
    upload_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on fiscal_year for faster lookups
CREATE INDEX IF NOT EXISTS idx_remittance_fiscal_year ON remittance_reports(fiscal_year);

-- Add comments
COMMENT ON TABLE geographical_documents IS 'Stores documents linked to geographical locations (postcodes)';
COMMENT ON TABLE remittance_reports IS 'Stores remittance reports organized by fiscal year';
