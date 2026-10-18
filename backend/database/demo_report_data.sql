-- Demo data for the admin Reports page (remittance filters + map view).
--
-- Adds grantors that share a name but have different grantor numbers,
-- postcodes and years, plus geographical documents at extra addresses.
-- All demo grantor numbers are 5000009101-5000009115 (prefix 50000091), so the script is safe to re-run
-- and easy to remove:
--
--   DELETE FROM remittance_reports     WHERE vendor_id LIKE '50000091%';
--   DELETE FROM geographical_documents WHERE vendor_id LIKE '50000091%';
--   DELETE FROM vendors                WHERE vendor_id LIKE '50000091%';
--
-- Document files are reused from documents/remittance and documents/geographical.

BEGIN;

DELETE FROM remittance_reports     WHERE vendor_id LIKE '50000091%';
DELETE FROM geographical_documents WHERE vendor_id LIKE '50000091%';

-- Seed data was loaded with explicit ids, so bring the sequences up to date
SELECT setval('remittance_reports_id_seq',     (SELECT COALESCE(MAX(id), 0) + 1 FROM remittance_reports), false);
SELECT setval('geographical_documents_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM geographical_documents), false);

-- Grantors: three names, each used by several grantor numbers
INSERT INTO vendors (vendor_id, title, first_name, last_name, email, mobile, telephone) VALUES
    ('5000009101', 'Mr',  'John',  'Smith', 'demo.john.smith1@example.com',  '07700 900101', '01233 900101'),
    ('5000009102', 'Mr',  'John',  'Smith', 'demo.john.smith2@example.com',  '07700 900102', '01622 900102'),
    ('5000009103', 'Mr',  'John',  'Smith', 'demo.john.smith3@example.com',  '07700 900103', '01245 900103'),
    ('5000009104', 'Mrs', 'Sarah', 'Jones', 'demo.sarah.jones1@example.com', '07700 900104', '01444 900104'),
    ('5000009105', 'Ms',  'Sarah', 'Jones', 'demo.sarah.jones2@example.com', '07700 900105', '01227 900105'),
    ('5000009106', 'Mr',  'David', 'Brown', 'demo.david.brown1@example.com', '07700 900106', '01702 900106'),
    ('5000009107', 'Mr',  'David', 'Brown', 'demo.david.brown2@example.com', '07700 900107', '01892 900107'),
    ('5000009108', 'Dr',  'David', 'Brown', 'demo.david.brown3@example.com', '07700 900108', '01206 900108'),
    ('5000009109', 'Mr',  'David', 'Brown', 'demo.david.brown4@example.com', '07700 900109', '01424 900109'),
    ('5000009110', 'Mr',  'David', 'Brown', 'demo.david.brown5@example.com', '07700 900110', '01376 900110'),
    ('5000009111', 'Mr',  'John',  'Smith', 'demo.john.smith4@example.com',  '07700 900111', '01233 900111'),
    ('5000009112', 'Mr',  'John',  'Smith', 'demo.john.smith5@example.com',  '07700 900112', '01634 900112'),
    ('5000009113', 'Mrs', 'Sarah', 'Jones', 'demo.sarah.jones3@example.com', '07700 900113', '01233 900113'),
    ('5000009114', 'Ms',  'Sarah', 'Jones', 'demo.sarah.jones4@example.com', '07700 900114', '01444 900114'),
    ('5000009115', 'Mr',  'David', 'Brown', 'demo.david.brown6@example.com', '07700 900115', '01245 900115')
ON CONFLICT (vendor_id) DO UPDATE SET title = EXCLUDED.title, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Remittance reports: 20 rows, duplicate names across numbers / postcodes / years.
-- Each opens its own schedule (documents/remittance/demo/remittance_<grantor no>_<year>.pdf).
INSERT INTO remittance_reports (fiscal_year, document_name, document_url, document_type, postcode, vendor_id, created_at) VALUES
    (2022, '5000009101.pdf', '/documents/remittance/demo/remittance_5000009101_2022.pdf', 'PDF', 'TN231PL', '5000009101', '2026-01-05 09:12:00'),
    (2023, '5000009101.pdf', '/documents/remittance/demo/remittance_5000009101_2023.pdf', 'PDF', 'TN231PL', '5000009101', '2026-01-06 10:20:00'),
    (2023, '5000009102.pdf', '/documents/remittance/demo/remittance_5000009102_2023.pdf', 'PDF', 'ME141XQ', '5000009102', '2026-01-07 11:05:00'),
    (2024, '5000009103.pdf', '/documents/remittance/demo/remittance_5000009103_2024.pdf', 'PDF', 'CM35BN',  '5000009103', '2026-01-08 14:30:00'),
    (2022, '5000009104.pdf', '/documents/remittance/demo/remittance_5000009104_2022.pdf', 'PDF', 'RH163AE', '5000009104', '2026-01-09 09:45:00'),
    (2024, '5000009104.pdf', '/documents/remittance/demo/remittance_5000009104_2024.pdf', 'PDF', 'RH163AE', '5000009104', '2026-01-12 15:10:00'),
    (2023, '5000009105.pdf', '/documents/remittance/demo/remittance_5000009105_2023.pdf', 'PDF', 'CT12RA',  '5000009105', '2026-01-13 08:55:00'),
    (2022, '5000009106.pdf', '/documents/remittance/demo/remittance_5000009106_2022.pdf', 'PDF', 'SS11AA',  '5000009106', '2026-01-14 13:25:00'),
    (2023, '5000009107.pdf', '/documents/remittance/demo/remittance_5000009107_2023.pdf', 'PDF', 'TN126BX', '5000009107', '2026-01-15 10:40:00'),
    (2024, '5000009108.pdf', '/documents/remittance/demo/remittance_5000009108_2024.pdf', 'PDF', 'CO11JR',  '5000009108', '2026-01-16 16:05:00'),
    (2023, '5000009106.pdf', '/documents/remittance/demo/remittance_5000009106_2023.pdf', 'PDF', 'SS11AA',  '5000009106', '2026-01-19 09:30:00'),
    (2024, '5000009107.pdf', '/documents/remittance/demo/remittance_5000009107_2024.pdf', 'PDF', 'TN126BX', '5000009107', '2026-01-20 11:15:00'),
    (2022, '5000009108.pdf', '/documents/remittance/demo/remittance_5000009108_2022.pdf', 'PDF', 'CO11JR',  '5000009108', '2026-01-21 14:50:00'),
    (2023, '5000009109.pdf', '/documents/remittance/demo/remittance_5000009109_2023.pdf', 'PDF', 'TN341QR', '5000009109', '2026-01-22 10:05:00'),
    (2024, '5000009110.pdf', '/documents/remittance/demo/remittance_5000009110_2024.pdf', 'PDF', 'CM71TW',  '5000009110', '2026-01-23 15:35:00'),
    (2024, '5000009111.pdf', '/documents/remittance/demo/remittance_5000009111_2024.pdf', 'PDF', 'TN255DH', '5000009111', '2026-01-26 09:10:00'),
    (2023, '5000009112.pdf', '/documents/remittance/demo/remittance_5000009112_2023.pdf', 'PDF', 'ME11EW',  '5000009112', '2026-01-26 09:20:00'),
    (2024, '5000009113.pdf', '/documents/remittance/demo/remittance_5000009113_2024.pdf', 'PDF', 'TN248YD', '5000009113', '2026-01-26 09:30:00'),
    (2022, '5000009114.pdf', '/documents/remittance/demo/remittance_5000009114_2022.pdf', 'PDF', 'RH159AL', '5000009114', '2026-01-26 09:40:00'),
    (2024, '5000009115.pdf', '/documents/remittance/demo/remittance_5000009115_2024.pdf', 'PDF', 'CM33DH',  '5000009115', '2026-01-26 09:50:00');

-- Geographical documents: one pin per demo address, each opening its own
-- User Agreement for that grantor and postcode (documents/user_agreements/
-- agreement_<grantor no>_<postcode>.pdf)
INSERT INTO geographical_documents (postcode, document_name, document_url, document_type, latitude, longitude, vendor_id, created_at) VALUES
    ('TN231PL', 'User Agreement - 5000009101.pdf', '/documents/user_agreements/agreement_5000009101_TN231PL.pdf', 'PDF', 51.14673600, 0.87654500, '5000009101', '2026-01-05 09:15:00'),
    ('TN255DH', 'User Agreement - 5000009111.pdf', '/documents/user_agreements/agreement_5000009111_TN255DH.pdf', 'PDF', 51.19816500, 0.95459100, '5000009111', '2026-01-05 09:20:00'),
    ('ME141XQ', 'User Agreement - 5000009102.pdf', '/documents/user_agreements/agreement_5000009102_ME141XQ.pdf', 'PDF', 51.27859700, 0.52234200, '5000009102', '2026-01-07 11:10:00'),
    ('ME11EW',  'User Agreement - 5000009112.pdf', '/documents/user_agreements/agreement_5000009112_ME11EW.pdf', 'PDF', 51.38696900, 0.50649300, '5000009112', '2026-01-07 11:15:00'),
    ('CM35BN',  'User Agreement - 5000009103.pdf', '/documents/user_agreements/agreement_5000009103_CM35BN.pdf', 'PDF', 51.65190100, 0.59833000, '5000009103', '2026-01-08 14:35:00'),
    ('RH163AE', 'User Agreement - 5000009104.pdf', '/documents/user_agreements/agreement_5000009104_RH163AE.pdf', 'PDF', 51.00165100, -0.10195100, '5000009104', '2026-01-09 09:50:00'),
    ('TN248YD', 'User Agreement - 5000009113.pdf', '/documents/user_agreements/agreement_5000009113_TN248YD.pdf', 'PDF', 51.15350500, 0.87855400, '5000009113', '2026-01-09 09:55:00'),
    ('CT12RA',  'User Agreement - 5000009105.pdf', '/documents/user_agreements/agreement_5000009105_CT12RA.pdf', 'PDF', 51.27962700, 1.07922500, '5000009105', '2026-01-13 09:00:00'),
    ('RH159AL', 'User Agreement - 5000009114.pdf', '/documents/user_agreements/agreement_5000009114_RH159AL.pdf', 'PDF', 50.95136300, -0.15096900, '5000009114', '2026-01-13 09:05:00'),
    ('SS11AA',  'User Agreement - 5000009106.pdf', '/documents/user_agreements/agreement_5000009106_SS11AA.pdf', 'PDF', 51.54352700, 0.71240000, '5000009106', '2026-01-14 13:30:00'),
    ('CM33DH',  'User Agreement - 5000009115.pdf', '/documents/user_agreements/agreement_5000009115_CM33DH.pdf', 'PDF', 51.75645800, 0.53953900, '5000009115', '2026-01-14 13:35:00'),
    ('TN126BX', 'User Agreement - 5000009107.pdf', '/documents/user_agreements/agreement_5000009107_TN126BX.pdf', 'PDF', 51.18785000, 0.39042500, '5000009107', '2026-01-15 10:45:00'),
    ('CO11JR',  'User Agreement - 5000009108.pdf', '/documents/user_agreements/agreement_5000009108_CO11JR.pdf', 'PDF', 51.88919000, 0.89969200, '5000009108', '2026-01-16 16:10:00'),
    ('TN341QR', 'User Agreement - 5000009109.pdf', '/documents/user_agreements/agreement_5000009109_TN341QR.pdf', 'PDF', 50.85639300, 0.58061000, '5000009109', '2026-01-22 10:10:00'),
    ('CM71TW',  'User Agreement - 5000009110.pdf', '/documents/user_agreements/agreement_5000009110_CM71TW.pdf', 'PDF', 51.86986300, 0.56728200, '5000009110', '2026-01-23 15:40:00');

COMMIT;
