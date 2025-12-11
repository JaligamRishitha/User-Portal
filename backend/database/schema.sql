-- UKPN Power Portal Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS remittance_documents CASCADE;
DROP TABLE IF EXISTS moving_house_notifications CASCADE;
DROP TABLE IF EXISTS payment_schedule_items CASCADE;
DROP TABLE IF EXISTS payment_schedule_headers CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS bank_details CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Vendors/Users Table
CREATE TABLE vendors (
    vendor_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    mobile VARCHAR(20),
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Details/Address Table
CREATE TABLE user_details (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    street VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    house VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Details Table
CREATE TABLE bank_details (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    account_number VARCHAR(20),
    sort_code VARCHAR(10),
    account_holder_name VARCHAR(255),
    payment_method VARCHAR(10),
    zahls VARCHAR(10),
    confs VARCHAR(10),
    sperr VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment History Table
CREATE TABLE payment_history (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    company_code VARCHAR(10),
    fiscal_year VARCHAR(10),
    clearing_doc VARCHAR(20),
    document_number VARCHAR(20),
    reference_doc VARCHAR(20),
    gross_amount DECIMAL(15, 2),
    net_amount DECIMAL(15, 2),
    tax_amount DECIMAL(15, 2),
    tax_code VARCHAR(10),
    tax_text VARCHAR(255),
    purchase_order VARCHAR(20),
    document_type VARCHAR(10),
    posting_date DATE,
    document_date DATE,
    doc_type VARCHAR(10),
    rental_amount DECIMAL(15, 2),
    compensation_amount DECIMAL(15, 2),
    lease_amount DECIMAL(15, 2),
    cheque_number VARCHAR(20),
    payment_date DATE,
    payment_method VARCHAR(10),
    payment_amount DECIMAL(15, 2),
    encashment_date DATE,
    void_reason VARCHAR(10),
    void_text VARCHAR(255),
    void_date DATE,
    void_user VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Schedule Headers Table
CREATE TABLE payment_schedule_headers (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    agreement_number VARCHAR(20) UNIQUE NOT NULL,
    agreement_type VARCHAR(10),
    location VARCHAR(255),
    last_payment_date DATE,
    next_payment_date DATE,
    total_consent DECIMAL(15, 2),
    currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Schedule Items Table
CREATE TABLE payment_schedule_items (
    id SERIAL PRIMARY KEY,
    agreement_number VARCHAR(20) REFERENCES payment_schedule_headers(agreement_number) ON DELETE CASCADE,
    item_number VARCHAR(10),
    agreement_type VARCHAR(10),
    start_date DATE,
    location VARCHAR(255),
    land_reg_number VARCHAR(50),
    functional_location VARCHAR(50),
    asset_type VARCHAR(100),
    asset_number VARCHAR(50),
    short_text VARCHAR(255),
    last_payment_date DATE,
    next_payment_date DATE,
    multiplier DECIMAL(10, 3),
    rental DECIMAL(15, 2),
    compensation DECIMAL(15, 2),
    lease_amount DECIMAL(15, 2),
    currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moving House Notifications Table
CREATE TABLE moving_house_notifications (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    old_address TEXT NOT NULL,
    old_postcode VARCHAR(20) NOT NULL,
    new_address TEXT NOT NULL,
    new_postcode VARCHAR(20) NOT NULL,
    new_owner_name VARCHAR(255) NOT NULL,
    new_owner_email VARCHAR(255) NOT NULL,
    new_owner_mobile VARCHAR(20) NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Remittance Documents Table
CREATE TABLE remittance_documents (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    fiscal_year VARCHAR(10) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_data BYTEA NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_payment_history_vendor ON payment_history(vendor_id);
CREATE INDEX idx_payment_history_date ON payment_history(posting_date);
CREATE INDEX idx_payment_schedule_vendor ON payment_schedule_headers(vendor_id);
CREATE INDEX idx_payment_schedule_items_agreement ON payment_schedule_items(agreement_number);
CREATE INDEX idx_moving_house_vendor ON moving_house_notifications(vendor_id);
CREATE INDEX idx_moving_house_status ON moving_house_notifications(status);
CREATE INDEX idx_remittance_vendor ON remittance_documents(vendor_id);
CREATE INDEX idx_remittance_fiscal_year ON remittance_documents(fiscal_year);
CREATE INDEX idx_remittance_vendor_year ON remittance_documents(vendor_id, fiscal_year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_details_updated_at BEFORE UPDATE ON user_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_details_updated_at BEFORE UPDATE ON bank_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedule_headers_updated_at BEFORE UPDATE ON payment_schedule_headers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedule_items_updated_at BEFORE UPDATE ON payment_schedule_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moving_house_notifications_updated_at BEFORE UPDATE ON moving_house_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remittance_documents_updated_at BEFORE UPDATE ON remittance_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
