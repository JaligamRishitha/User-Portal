-- Seed data for UKPN Power Portal

-- Insert Vendor
-- Password: Test@123 (hashed with bcrypt)
INSERT INTO vendors (vendor_id, title, first_name, last_name, email, password_hash, mobile, telephone)
VALUES ('5000000061', 'Mr.', 'D L', 'BOLTON', 'farm@boltonfarms.co.uk', '$2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC', '07700 900 123', '020 7946 0123');

-- Insert User Details
INSERT INTO user_details (vendor_id, street, address_line1, address_line2, city, postcode, house)
VALUES ('5000000061', 'BORHEAM HALL', 'THE CHASE', 'BOREHAM', 'CHELMSFORD', 'CM3 3DQ', NULL);

-- Insert Bank Details
INSERT INTO bank_details (vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr)
VALUES ('5000000061', '12345678', '20-00-00', 'D L BOLTON', 'BACS', '-', '-', '-');

-- Insert Payment History (2023)
INSERT INTO payment_history (
    vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc,
    gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type,
    posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount,
    cheque_number, payment_date, payment_method, payment_amount, encashment_date
) VALUES (
    '5000000061', '1700', '2023', '2000026151', '5110702087', '5110702087',
    268.40, 268.40, 0.0, 'V0', 'Exempt from input VAT', '1000000121', 'ZWLA',
    '2023-11-07', '2023-11-07', 'YW', 207.76, 325.50, 0.0,
    '257577', '2023-11-08', 'K', 268.40, '2023-11-21'
);

-- Insert Payment History (2024)
INSERT INTO payment_history (
    vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc,
    gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type,
    posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount,
    cheque_number, payment_date, payment_method, payment_amount, encashment_date
) VALUES (
    '5000000061', '1700', '2024', '2000005034', '5110846809', '5110846809',
    264.86, 264.86, 0.0, 'V0', 'Exempt from input VAT', '1000000121', 'ZWLA',
    '2024-03-26', '2024-03-26', 'YW', 103.88, 160.98, 0.0,
    '268615', '2024-03-27', 'K', 264.86, '2024-04-12'
);

-- Insert Payment Schedule Header
INSERT INTO payment_schedule_headers (
    vendor_id, agreement_number, agreement_type, location, last_payment_date, 
    next_payment_date, total_consent, currency
) VALUES (
    '5000000061', '1000000121', 'ZWLA', 'LAND LYING', '2024-03-20', 
    '2025-03-20', 264.86, 'GBP'
);

-- Insert Payment Schedule Items
INSERT INTO payment_schedule_items (
    agreement_number, item_number, agreement_type, start_date, location, land_reg_number,
    functional_location, asset_type, asset_number, short_text, last_payment_date,
    next_payment_date, multiplier, rental, compensation, lease_amount, currency
) VALUES 
(
    '1000000121', '00010', 'ZWLA', '2022-03-21', 'LAND LYING', 'EX345302',
    '016', 'Pole/Tower', '016', 'ARABLE TOWER SYSTEM- BROAD BASE', '2024-03-20',
    '2025-03-20', 1.000, 51.94, 80.49, 0.0, 'GBP'
),
(
    '1000000121', '00020', 'ZWLA', '2022-03-21', 'LAND LYING', 'EX345302',
    '017', 'Pole/Tower', '017', 'ARABLE TOWER SYSTEM- BROAD BASE', '2024-03-20',
    '2025-03-20', 1.000, 51.94, 80.49, 0.0, 'GBP'
);


