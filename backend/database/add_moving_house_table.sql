-- Add moving_house_notifications table
-- This script can be run on existing database without dropping data

CREATE TABLE IF NOT EXISTS moving_house_notifications (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_moving_house_vendor ON moving_house_notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_moving_house_status ON moving_house_notifications(status);

-- Add trigger for updated_at
CREATE TRIGGER update_moving_house_notifications_updated_at BEFORE UPDATE ON moving_house_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
