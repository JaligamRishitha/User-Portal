-- Add remittance_documents table for storing PDF files

CREATE TABLE IF NOT EXISTS remittance_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id VARCHAR(20) NOT NULL,
    fiscal_year VARCHAR(10) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_data TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_remittance_vendor ON remittance_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_remittance_fiscal_year ON remittance_documents(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_remittance_vendor_year ON remittance_documents(vendor_id, fiscal_year);
