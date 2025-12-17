"""Complete seed data with all records

Revision ID: complete_seed_data
Revises: 95b6c1509bb5
Create Date: 2025-12-17T05:37:18.206227

"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy.sql import text
import base64

# revision identifiers, used by Alembic.
revision: str = 'complete_seed_data'
down_revision: Union[str, None] = '95b6c1509bb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert complete seed data."""
    
    # Disable triggers during bulk insert
    op.execute("SET session_replication_role = 'replica'")
    
    # VENDORS (8 records)
    print("Inserting 8 vendors...")
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, password_hash, mobile, telephone, created_at, updated_at) VALUES (5000000015, 0002, John A, DREIER, susanfrogers@gmail.com, $2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC, 07700 111 222, 020 7946 1234, 2025-12-11T22:21:21.793398, 2025-12-12T04:56:15.325945)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, password_hash, mobile, telephone, created_at, updated_at) VALUES (5000000061, Mr., D, L BOLTON, farm@boltonfarms.co.uk, $2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC, 07822 333 444, 020 7946 5678, 2025-12-11T22:21:19.580554, 2025-12-12T05:29:50.474288)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, email, created_at, updated_at) VALUES (5000000078, Mr, Beam, beam@ukpn.co.com, 2025-12-16T07:48:28.368474, 2025-12-16T07:48:28.368474)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, created_at, updated_at) VALUES (5000000068, , AQUELINE, JANET, janet@ukpn.co.com, 2025-12-16T08:06:25.145499, 2025-12-16T08:06:25.145499)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, created_at, updated_at) VALUES (5000000685, Mrs, J L, PEARCE, pearce@ukpn.co.com, 2025-12-16T08:08:16.572511, 2025-12-16T08:08:16.572511)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, created_at, updated_at) VALUES (5000000054, MR, G J, GEORGE, george@ukpn.co.com, 2025-12-16T08:37:07.505795, 2025-12-16T08:37:07.505795)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, created_at, updated_at) VALUES (5000000058, , B M, CLENSHAW, clenshaw@ukpn.co.com, 2025-12-16T08:38:27.416423, 2025-12-16T08:38:27.416423)"))
    op.execute(text("INSERT INTO vendors (vendor_id, title, first_name, last_name, email, created_at, updated_at) VALUES (5000003289, MR, A D, POOLE, poole@ukpn.co.com, 2025-12-16T08:45:15.866656, 2025-12-16T08:45:15.866656)"))
    
    # USER DETAILS (2 records)
    print("Inserting 2 user_details...")
    op.execute(text("INSERT INTO user_details (id, vendor_id, street, address_line1, address_line2, city, postcode, created_at, updated_at, user_agreement_url) VALUES (28, 5000000015, TAMLEY COTTAGE, TAMLEY LANE, HASTINGLEIGH, ASHFORD, TN25 5HW, 2025-12-11T22:21:21.796316, 2025-12-12T10:15:58.999667, /documents/user_agreements/user_agreement_5000000015_20251212_101558.pdf)"))
    op.execute(text("INSERT INTO user_details (id, vendor_id, street, address_line1, address_line2, city, postcode, created_at, updated_at, user_agreement_url) VALUES (27, 5000000061, BORHEAM HALL, THE CHASE, BOREHAM, CHELMSFORD, CM3 3DQ, 2025-12-11T22:21:19.583462, 2025-12-16T13:27:19.483615, /documents/user_agreements/user_agreement_5000000061_20251216_132719.pdf)"))
    
    # BANK DETAILS (2 records)
    print("Inserting 2 bank_details...")
    op.execute(text("INSERT INTO bank_details (id, vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at) VALUES (13, 5000000061, 98765432, 50-60-70, D L BOLTON, BACS, -, -, -, 2025-12-01T10:00:00, 2025-12-12T05:55:00.229982)"))
    op.execute(text("INSERT INTO bank_details (id, vendor_id, account_number, sort_code, account_holder_name, payment_method, zahls, confs, sperr, created_at, updated_at) VALUES (14, 5000000015, 22222222, 20-30-40, John A DREIER UPDATED, K, -, -, -, 2025-12-01T10:00:00, 2025-12-12T05:55:00.229982)"))
    
    # PAYMENT HISTORY (3 records)
    print("Inserting 3 payment_history...")
    op.execute(text("INSERT INTO payment_history (id, vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc, gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type, posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount, cheque_number, payment_date, payment_method, payment_amount, encashment_date, created_at) VALUES (8, 5000000061, 1700, 2023, 2000026151, 5110702087, 5110702087, 268.40, 268.40, 0.00, V0, Exempt from input VAT, 1000000121, ZWLA, 2023-11-07, 2023-11-07, YW, 207.76, 325.50, 0.00, 257577, 2023-11-08, K, 268.40, 2023-11-21, 2025-12-11T22:21:19.588859)"))
    op.execute(text("INSERT INTO payment_history (id, vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc, gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type, posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount, cheque_number, payment_date, payment_method, payment_amount, encashment_date, created_at) VALUES (9, 5000000061, 1700, 2024, 2000005034, 5110846809, 5110846809, 264.86, 264.86, 0.00, V0, Exempt from input VAT, 1000000121, ZWLA, 2024-03-26, 2024-03-26, YW, 103.88, 160.98, 0.00, 268615, 2024-03-27, K, 264.86, 2024-04-12, 2025-12-11T22:21:19.592110)"))
    op.execute(text("INSERT INTO payment_history (id, vendor_id, company_code, fiscal_year, clearing_doc, document_number, reference_doc, gross_amount, net_amount, tax_amount, tax_code, tax_text, purchase_order, document_type, posting_date, document_date, doc_type, rental_amount, compensation_amount, lease_amount, cheque_number, payment_date, payment_method, payment_amount, encashment_date, void_reason, void_text, created_at) VALUES (10, 5000000015, 1900, 2023, 2000017143, 5110697500, 5110697500, 888.00, 888.00, 0.00, V0, Exempt from input VAT, 1000000003, ZWLT, 2023-11-01, 2023-11-01, YW, 0.00, 2280.00, 0.00, 171572, 2023-11-02, K, 888.00, 2023-11-09, 00, , 2025-12-11T22:21:21.802355)"))
    
    # PAYMENT SCHEDULE HEADERS (2 records)
    print("Inserting 2 payment_schedule_headers...")
    op.execute(text("INSERT INTO payment_schedule_headers (id, vendor_id, agreement_number, agreement_type, location, last_payment_date, next_payment_date, total_consent, currency, created_at, updated_at) VALUES (3, 5000000061, 1000000121, ZWLA, LAND LYING, 2024-03-20, 2025-03-20, 264.86, GBP, 2025-12-11T22:21:19.593550, 2025-12-11T22:21:19.593550)"))
    op.execute(text("INSERT INTO payment_schedule_headers (id, vendor_id, agreement_number, agreement_type, location, last_payment_date, total_consent, currency, created_at, updated_at) VALUES (4, 5000000015, 1000000003, ZWLT, , 2023-11-01, 0.00, , 2025-12-11T22:21:21.805724, 2025-12-11T22:21:21.805724)"))
    
    # PAYMENT SCHEDULE ITEMS (7 records)
    print("Inserting 7 payment_schedule_items...")
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, next_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (8, 1000000121, 00010, ZWLA, 2022-03-21, LAND LYING, EX345302, 016, Pole/Tower, 016, ARABLE TOWER SYSTEM- BROAD BASE, 2024-03-20, 2025-03-20, 1.000, 51.94, 80.49, 0.00, GBP, 2025-12-11T22:21:19.596743, 2025-12-11T22:21:19.596743)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, next_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (9, 1000000121, 00020, ZWLA, 2022-03-21, LAND LYING, EX345302, 017, Pole/Tower, 017, ARABLE TOWER SYSTEM- BROAD BASE, 2024-03-20, 2025-03-20, 1.000, 51.94, 80.49, 0.00, GBP, 2025-12-11T22:21:19.596743, 2025-12-11T22:21:19.596743)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (10, 1000000003, 00010, ZWLT, 2021-10-20, , K651089, , , , ARABLE SINGLE POLE WITH 1 STAY 884095, 2023-11-01, 1.000, 0.00, 0.00, 0.00, , 2025-12-11T22:21:21.808826, 2025-12-11T22:21:21.808826)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (11, 1000000003, 00020, ZWLT, 2021-10-20, , K758844, , , , HEDGEROW SINGLE POLE 884094, 2023-11-01, 1.000, 0.00, 0.00, 0.00, , 2025-12-11T22:21:21.808826, 2025-12-11T22:21:21.808826)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (12, 1000000003, 00030, ZWLT, 2021-10-20, , K758844, , , , HEDGEROW SINGLE POLE 884062, 2023-11-01, 1.000, 0.00, 0.00, 0.00, , 2025-12-11T22:21:21.808826, 2025-12-11T22:21:21.808826)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (13, 1000000003, 00040, ZWLT, 2021-10-20, , K768575, , , , HEDGEROW SINGLE POLE 884086, 2023-11-01, 1.000, 0.00, 0.00, 0.00, , 2025-12-11T22:21:21.808826, 2025-12-11T22:21:21.808826)"))
    op.execute(text("INSERT INTO payment_schedule_items (id, agreement_number, item_number, agreement_type, start_date, location, land_reg_number, functional_location, asset_type, asset_number, short_text, last_payment_date, multiplier, rental, compensation, lease_amount, currency, created_at, updated_at) VALUES (14, 1000000003, 00050, ZWLT, 2021-10-20, , K758844, , , , HEDGEROW SINGLE POLE WITH 1 STAY 884085, 2023-11-01, 1.000, 0.00, 0.00, 0.00, , 2025-12-11T22:21:21.808826, 2025-12-11T22:21:21.808826)"))
    
    # REMITTANCE DOCUMENTS (3 records)
    print("Inserting 3 remittance_documents...")
    op.execute(text("INSERT INTO remittance_documents (id, vendor_id, fiscal_year, file_name, file_data, mime_type, file_size, created_at, updated_at) VALUES (9, 5000000061, 2024, 5000000061_2025-12-10T10_32_28.4654212Z.pdf, <memory at 0x7667d4783d00>, application/pdf, 235329, 2025-12-15T12:43:39.218338, 2025-12-15T12:43:39.217340)"))
    op.execute(text("INSERT INTO remittance_documents (id, vendor_id, fiscal_year, file_name, file_data, mime_type, file_size, created_at, updated_at) VALUES (10, 5000000061, 2023, 5000000061_2023.pdf, <memory at 0x7667d46b8040>, application/pdf, 172941, 2025-12-15T12:43:56.133822, 2025-12-15T12:43:56.132996)"))
    op.execute(text("INSERT INTO remittance_documents (id, vendor_id, fiscal_year, file_name, file_data, mime_type, file_size, created_at, updated_at) VALUES (11, 5000000015, 2023, Remittance_Schedule_2023_5000000015.pdf, <memory at 0x7667d46b8100>, application/pdf, 238503, 2025-12-15T12:44:48.549170, 2025-12-15T12:44:48.548607)"))
    
    # REMITTANCE REPORTS (7 records)
    print("Inserting 7 remittance_reports...")
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (10, 2023, 5000000015.pdf, /documents/remittance/2023/2023_20251211_212239.pdf, PDF, 2025-12-11T21:22:39.614534, 2025-12-11T21:22:39.614534, TN255HW, 5000000015)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (11, 2023, 5000000061.pdf, /documents/remittance/2023/2023_20251211_212723.pdf, PDF, 2025-12-11T21:27:23.105464, 2025-12-11T21:27:23.105464, CM33DQ, 5000000061)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (13, 2024, 5000000061.pdf, /documents/remittance/2024/2024_20251211_212901.pdf, PDF, 2025-12-11T21:29:01.557993, 2025-12-11T21:29:01.557993, CM33DQ, 5000000061)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (12, 2024, 5000003289.pdf, /documents/remittance/2024/2024_20251211_212831.pdf, PDF, 2025-12-11T21:28:31.510559, 2025-12-11T21:28:31.510559, TN126HT, 5000003289)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (19, 2022, CM3 3DQ.pdf.pdf, /documents/remittance/2022/2022_20251216_085529.pdf, PDF, 2025-12-16T08:55:29.899676, 2025-12-16T08:55:29.899676, CM33DQ, 5000000685)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (18, 2022, TN25 5HW_1.pdf.pdf, /documents/remittance/2022/2022_20251216_085450.pdf, PDF, 2025-12-16T08:54:50.435222, 2025-12-16T08:54:50.435222, TN255HW, 5000000068)"))
    op.execute(text("INSERT INTO remittance_reports (id, fiscal_year, document_name, document_url, document_type, created_at, updated_at, postcode, vendor_id) VALUES (17, 2022, TN25 5HW.pdf.pdf, /documents/remittance/2022/2022_20251216_085417.pdf, PDF, 2025-12-16T08:54:17.769963, 2025-12-16T08:54:17.769963, TN255HW, 5000000078)"))
    
    # GEOGRAPHICAL DOCUMENTS (7 records)
    print("Inserting 7 geographical_documents...")
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (19, CM33DQ, 5000000061.pdf, /documents/geographical/CM33DQ_20251211_213430.pdf, PDF, 51.75184320, 0.53884900, 2025-12-11T21:34:30.865003, 2025-12-11T21:34:30.865003, 5000000061)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (20, TN126HT, 5000000058.pdf, /documents/geographical/TN126HT_20251211_213502.pdf, PDF, 51.17817280, 0.39179870, 2025-12-11T21:35:03.032489, 2025-12-11T21:35:03.032489, 5000000058)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (21, RH158NB, 5000000054.pdf, /documents/geographical/RH158NB_20251211_213526.pdf, PDF, 50.96287300, -0.13869130, 2025-12-11T21:35:26.845565, 2025-12-11T21:35:26.845565, 5000000054)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (22, TN255HW, 5000000015.pdf, /documents/geographical/TN255HW_20251211_213550.pdf, PDF, 51.16310380, 0.99620720, 2025-12-11T21:35:50.703388, 2025-12-11T21:35:50.703388, 5000000015)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (23, TN255HW, TN25 5HW.pdf.pdf, /documents/geographical/TN255HW_20251216_062855.pdf, PDF, 51.16310380, 0.99620720, 2025-12-16T06:28:57.787046, 2025-12-16T06:28:57.787046, 5000000078)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (24, TN255HW, TN25 5HW_1.pdf.pdf, /documents/geographical/TN255HW_20251216_063015.pdf, PDF, 51.16310380, 0.99620720, 2025-12-16T06:30:15.992427, 2025-12-16T06:30:15.992427, 5000000068)"))
    op.execute(text("INSERT INTO geographical_documents (id, postcode, document_name, document_url, document_type, latitude, longitude, created_at, updated_at, vendor_id) VALUES (25, CM33DQ, CM3 3DQ.pdf.pdf, /documents/geographical/CM33DQ_20251216_063107.pdf, PDF, 51.75184320, 0.53884900, 2025-12-16T06:31:08.552987, 2025-12-16T06:31:08.552987, 5000000685)"))
    
    # WAYLEAVE AGREEMENTS (1 records)
    print("Inserting 1 wayleave_agreements...")
    op.execute(text("INSERT INTO wayleave_agreements (id, filename, grantor_name, grantor_address, grantor_telephone, grantor_email, agreement_date, agreement_ref, payment, duration, property_location, works_description, drawing_number, extracted_text, created_at, updated_at, grantor_postcode, tq_number, company_with) VALUES (4, User Agreement -61_up.pdf, D L Bolton, of Borheam Hall, The Chase, Borheam, Chelmsford, 02079469678, farm@bottonfarms.co.uk, 24 day of Feb 2018, 5443c, £150.00, 15 years, Borheam Hall, overhead electric line consisting of two, , === TEXT CONTENT (3 pages) ===
--- Page 1 ---
```
No. 20024547
OWNER/OCCUPIER
(delete as appropriate)

Ref: 5443c
TL4366-4653
Tel: 02079469678, E-mail: farm@bottonfarms.co.uk

## Wayleave Agreement

made the 24 day of Feb 2018

BETWEEN D L Bolton ("the Grantee") of Borheam Hall, The Chase, Borheam, Chelmsford, CM3 3DQ of the one part and

Eastern Power Networks plc whose registered office is Newington House, 237 Southwark Bridge Road, London, SE1 6NP ("the Company") of the other part.

IT IS AGREED as follows:-

### 1. DEFINITIONS

"the Company" includes its Subsidiaries, Associated Companies, successors and assigns

"the Grantee" includes its tenants, licensees and employees

"the Plan" means the plan annexed hereto

"the Property" means the land shown on the Plan and situated at Borheam Hall

"the Works" means the works shown on the Plan and described in the Schedule

### 2. THE RIGHTS

THE Grantee hereby grants consent for the Company:-

(a) To install, maintain, inspect, alter, renew, remove and retain the Works and to enter the Property at all reasonable times (or at any time in the case of emergency) with or without vehicles plant or machinery for such purposes

(b) To fell or lop in a woodman like manner any tree or hedge on the Property which obstructs or interferes with the Works

### 3. THE COMPANY'S COVENANTS

THE Company shall:-

(a) Not cause any unnecessary damage or injury to the Property and shall take all reasonable precautions to avoid obstruction or interference with the use of any road or footpath sewer drain or watercourse that may be crossed by the Works

(b) Make good to the reasonable satisfaction of the Grantee any damage caused by or arising out of the execution of the Works. If for any reason, any such damage cannot be made good the Company shall compensate the Grantee in an amount which has previously been approved by the Company

(c) Give to the Grantee not less than three days' previous notice (except in cases of emergency when as long notice as practicable shall be given) of the intended exercise of any of the rights conferred by Clause 2 above

(d) On the completion of this Agreement pay the Grantee a total one-off payment of £150.00

(e) At all times keep the Grantee indemnified against all losses, damages and expenses reasonably foreseeable at the date of this Agreement which he suffers or incurs, by reason or on account of any breach of this Agreement including any registrant act or omission of the Company in connection with the execution or existence of the Works provided that this indemnity shall not extend to any such losses damages or expenses to the extent caused by the default of the Grantee
```

--- Page 2 ---
# 4. THE GRANTOR'S COVENANTS

THE Grantor shall not:

(a) Do or cause or permit to be done on the Property anything likely to cause damage or interference of any kind to the Works

(b) Make or cause or permit to be made any material alteration to the Property so as to interfere with or obstruct the access to the Works or so as to interfere with the support afforded to the Works by the surrounding soil without the prior written consent of the Company

# 5. TERMINATION

This Agreement shall remain in force for a period of 15 years from the date hereof and thereafter until determined at the expiry of not less than twelve months' previous written notice given at any time by either party but without prejudice to the rights which the Company might exercise under the Electricity Act 1989

# THE SCHEDULE

(a) THE placing of an overhead electric line consisting of two, three or four conductors together with any ancillary apparatus across the Property in the line indicated in the approximate position shown on the Plan

(13) THE erection of x anc. appliances for the purpose of supporting the a.l.t.n.e.Rtentloose electric line in the approximate positions indicated on the Plan i.e. a rect circle (red) or T (sky)

(c) THE placing of x underground Lead3Lea(a) for Transmitting electricity at a frequency of SO.herds and at a pressure of 1000 volts anc. low voltage telephone anc. signalling cables such cables(a) to 13m in the approximate position indicated i.e. 13m a rect 13m line on the Plan

THE parties hereto have set their hands the day and year first above written

SIGNED BY

(Grantor's Signature) __________________________

(please also sign plan)

SIGNED BY

(Agent's Signature) __________________________

For and on behalf of Eastern Power Networks plc
Tel: 03301 991841
Email: eastham.connections@ukpowernetworks.co.uk

--- Page 3 ---
```
WAYLEAVE

Barbara Poxton

Overhead Line   EHV   c.1980CJ   Pro
Overhead Line   HV    - - - - - -
Overhead Line   LV    - - - - - -
Underground Cable EHV   - - - - - -
Underground Cable LV    - - - - - -
H-Pole(s)       O-O    - - - - - -
Pole(s)         - - - - - -
Stayte(s)       r--    r--    - - - - -
Substation      - - - - - -
Tower/Pylon     - - - - - -

Site: 5 Lower Street, Thrplow, Combs, SG8 7RJ
Drawing No.: 5443c   TQ Number: TQ 64731
Plotted On: 17/01/2018   Map Centre: TL 4366 4653
Scale: 1:400   Drawn by: Kristina Green

Stained concrete conductor may be fixed from any pole. This is not a precise drawing and is for guidance only. The exact position of the overhead line network (Operated by UK Power Networks) before any excavation is omitted in the drawing. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead line network. The drawing is not to be used for any purpose other than to indicate the approximate position of the overhead, 2025-12-16T17:34:08.817289+00:00, 2025-12-16T17:34:08.817289+00:00, CM3 3DQ, TQ64731, Eastern Power Networks plc whose registered office is Newington House, 237 Southwark Bridge Road, London, SE1 6NP)"))
    
    # MOVING HOUSE NOTIFICATIONS (2 records)
    print("Inserting 2 moving_house_notifications...")
    op.execute(text("INSERT INTO moving_house_notifications (id, vendor_id, old_address, old_postcode, new_address, new_postcode, new_owner_name, new_owner_email, new_owner_mobile, submission_date, status, created_at, updated_at) VALUES (17, 5000000015, TAMLEY COTTAGE, TAMLEY LANE, HASTINGLEIGH, TN25 5HW, 15 PARK AVENUE, ASHFORD, TN24 8EX, Robert Smith, r.smith@example.com, 07700 123 456, 2025-12-11T18:22:08.014766, pending, 2025-12-11T22:22:08.014774, 2025-12-11T22:22:08.014774)"))
    op.execute(text("INSERT INTO moving_house_notifications (id, vendor_id, old_address, old_postcode, new_address, new_postcode, new_owner_name, new_owner_email, new_owner_mobile, submission_date, status, created_at, updated_at) VALUES (18, 5000000061, BORHEAM HALL, THE CHASE, BOREHAM, CM3 3DQ, 25 HIGH STREET, CHELMSFORD, CM1 1BE, Emma Johnson, e.johnson@example.com, 07900 654 321, 2025-12-10T10:23:09.789246, pending, 2025-12-11T22:23:09.789251, 2025-12-11T22:23:09.789251)"))
    
    # BANK DETAILS AUDIT (0 records)
    print("Inserting 0 bank_details_audit...")
    # No data for bank_details_audit
    
    # VENDOR AUDIT (0 records)
    print("Inserting 0 vendor_audit...")
    # No data for vendor_audit
    
    # Re-enable triggers
    op.execute("SET session_replication_role = 'origin'")
    
    print("✓ All seed data inserted successfully!")


def downgrade() -> None:
    """Remove all seed data."""
    # Delete in reverse order of foreign key dependencies
    op.execute("DELETE FROM vendor_audit")
    op.execute("DELETE FROM bank_details_audit")
    op.execute("DELETE FROM moving_house_notifications")
    op.execute("DELETE FROM wayleave_agreements")
    op.execute("DELETE FROM geographical_documents")
    op.execute("DELETE FROM remittance_reports")
    op.execute("DELETE FROM remittance_documents")
    op.execute("DELETE FROM payment_schedule_items")
    op.execute("DELETE FROM payment_schedule_headers")
    op.execute("DELETE FROM payment_history")
    op.execute("DELETE FROM bank_details")
    op.execute("DELETE FROM user_details")
    op.execute("DELETE FROM vendors")
