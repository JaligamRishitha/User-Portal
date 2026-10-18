-- Admin Map view: show User Agreement documents instead of Remittance Schedules.
--
-- The agreement PDFs live in documents/user_agreements/agreement_<grantor no>.pdf
-- (copied from the User-agreements folder). Needs the grantor_name column
-- (alembic revision map_pin_grantor_names). Each map pin is matched to an
-- agreement by grantor number first, then by postcode. Every agreement also
-- gets a pin at its own address. Safe to re-run.
--
-- Demo pins (grantor nos 50000091xx) are handled in demo_report_data.sql, each
-- with its own agreement_<grantor no>_<postcode>.pdf.

BEGIN;

SELECT setval('geographical_documents_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM geographical_documents), false);

-- 1. Grantor number has its own agreement
UPDATE geographical_documents
SET document_url  = '/documents/user_agreements/agreement_' || vendor_id || '.pdf',
    document_name = 'User Agreement - ' || vendor_id || '.pdf'
WHERE vendor_id IN ('5000000015', '5000000054', '5000000058', '5000000061', '5000000685', '5000003289');

-- 2. No agreement for the grantor number, but the postcode matches one
--    (TN25 5HW: Ms S F ROGERS, 5000000015)
UPDATE geographical_documents
SET document_url  = '/documents/user_agreements/agreement_5000000015.pdf',
    document_name = 'User Agreement - 5000000015.pdf'
WHERE postcode = 'TN255HW'
  AND vendor_id NOT IN ('5000000015', '5000000054', '5000000058', '5000000061', '5000000685', '5000003289')
  AND vendor_id NOT LIKE '50000091%';

-- 3. Pins at each agreement's own address, where the map had none
DELETE FROM geographical_documents
WHERE document_url LIKE '/documents/user_agreements/%'
  AND (postcode IN ('TN299ND', 'BN84HG', 'HP170TR', 'KT234HQ')
       OR (vendor_id = '5000003289' AND postcode = 'TN126HT'));

INSERT INTO geographical_documents (postcode, document_name, document_url, document_type, latitude, longitude, vendor_id, grantor_name, created_at) VALUES
    -- Mr JOHN SMITH, Marina, New Romney
    ('TN299ND', 'User Agreement - 5000000081.pdf', '/documents/user_agreements/agreement_5000000081.pdf', 'PDF', 50.91482200, 0.97475300, '5000000081', 'JOHN SMITH', '2026-10-15 09:00:00'),
    -- Mr DAVID BROWN, Glendene Cottage, Lewes
    ('BN84HG',  'User Agreement - 5000000083.pdf', '/documents/user_agreements/agreement_5000000083.pdf', 'PDF', 50.97241500, -0.01229600, '5000000083', 'DAVID BROWN', '2026-10-15 09:00:00'),
    -- J L PEARCE, Malt House Farm, Aylesbury (map already has 5000000685 at CM3 3DQ)
    ('HP170TR', 'User Agreement - 5000000685.pdf', '/documents/user_agreements/agreement_5000000685.pdf', 'PDF', 51.76042300, -0.78253800, '5000000685', 'J L PEARCE', '2026-10-15 09:00:00'),
    -- A D POOLE: the agreement's postcode is unreadable ("FRATING 3223 56"),
    -- so the pin uses the grantor's postcode from remittance reports
    ('TN126HT', 'User Agreement - 5000003289.pdf', '/documents/user_agreements/agreement_5000003289.pdf', 'PDF', 51.17817100, 0.39182800, '5000003289', 'A D POOLE', '2026-10-15 09:00:00'),
    -- Graham & Louise Evans, Bookham: no grantor number on the agreement
    ('KT234HQ', 'User Agreement - EVANS (UKPN2464).pdf', '/documents/user_agreements/agreement_UKPN2464_EVANS.pdf', 'PDF', 51.26725700, -0.39028500, NULL, 'Graham & Louise Evans', '2026-10-15 09:00:00');

COMMIT;
