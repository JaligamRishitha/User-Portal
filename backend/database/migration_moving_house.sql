-- Migration: Add moving_house_notifications table
-- Date: 2024-12-11

CREATE TABLE IF NOT EXISTS moving_house_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id TEXT NOT NULL,
    old_address TEXT NOT NULL,
    old_postcode TEXT NOT NULL,
    new_address TEXT NOT NULL,
    new_postcode TEXT NOT NULL,
    new_owner_name TEXT NOT NULL,
    new_owner_email TEXT NOT NULL,
    new_owner_mobile TEXT NOT NULL,
    submission_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster vendor lookups
CREATE INDEX IF NOT EXISTS idx_moving_house_vendor_id ON moving_house_notifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_moving_house_status ON moving_house_notifications(status);
