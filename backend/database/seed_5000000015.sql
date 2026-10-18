-- Seed data for vendor 5000000015 (J A DREIER / Ms S F ROGERS)

-- Insert Vendor
-- Password: Test@123 (hashed with bcrypt)
INSERT INTO vendors (vendor_id, title, first_name, last_name, email, password_hash, mobile, telephone)
VALUES ('5000000015', '0002', 'J A', 'DREIER', 'susanfrogers@gmail.com', '$2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC', NULL, '07940 012016');

-- Insert User Details
INSERT INTO user_details (vendor_id, street, address_line1, address_line2, city, postcode, house)
VALUES ('5000000015', 'TAMLEY COTTAGE', 'TAMLEY LANE', 'HASTINGLEIGH', 'ASHFORD', 'TN25 5HW', NULL);

-- Insert Bank Details
INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr)
VALUES ('5000000015', '', '', NULL, 'K', '-', '-', '-');

-- Insert Payment History (2023)
INSERT INTO payment_history (
    vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc,
    gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type,
    posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount,
    cheque_number, payment_date, payment_method, payment_amount, encashment_date,
    void_reason, void_text
) VALUES (
    '5000000015', '1900', '2023', '2000017143', '5110697500', '5110697500',
    888.0, 888.0, 0.0, 'V0', 'Exempt from input VAT', '1000000003', 'ZWLT',
    '2023-11-01', '2023-11-01', 'YW', 0.0, 2280.0, 0.0,
    '171572', '2023-11-02', 'K', 888.0, '2023-11-09',
    '00', ''
);

-- Insert Payment Schedule Header
INSERT INTO payment_schedule_headers (
    vendor_id, agreement_number, agreement_type, location, last_payment_date, 
    next_payment_date, total_consent, currency
) VALUES (
    '5000000015', '1000000003', 'ZWLT', '', '2023-11-01', 
    NULL, 0.0, ''
);

-- Insert Payment Schedule Items
INSERT INTO payment_schedule_items (
    agreement_number, item_number, agreement_type, start_date, location, land_reg_number,
    functional_location, asset_type, asset_number, short_text, last_payment_date,
    next_payment_date, multiplier, rental, compensation, lease_amount, currency
) VALUES 
(
    '1000000003', '00010', 'ZWLT', '2021-10-20', '', 'K651089',
    '', '', '', 'ARABLE SINGLE POLE WITH 1 STAY 884095', '2023-11-01',
    NULL, 1.000, 0.0, 0.0, 0.0, ''
),
(
    '1000000003', '00020', 'ZWLT', '2021-10-20', '', 'K758844',
    '', '', '', 'HEDGEROW SINGLE POLE 884094', '2023-11-01',
    NULL, 1.000, 0.0, 0.0, 0.0, ''
),
(
    '1000000003', '00030', 'ZWLT', '2021-10-20', '', 'K758844',
    '', '', '', 'HEDGEROW SINGLE POLE 884062', '2023-11-01',
    NULL, 1.000, 0.0, 0.0, 0.0, ''
),
(
    '1000000003', '00040', 'ZWLT', '2021-10-20', '', 'K768575',
    '', '', '', 'HEDGEROW SINGLE POLE 884086', '2023-11-01',
    NULL, 1.000, 0.0, 0.0, 0.0, ''
),
(
    '1000000003', '00050', 'ZWLT', '2021-10-20', '', 'K758844',
    '', '', '', 'HEDGEROW SINGLE POLE WITH 1 STAY 884085', '2023-11-01',
    NULL, 1.000, 0.0, 0.0, 0.0, ''
);
