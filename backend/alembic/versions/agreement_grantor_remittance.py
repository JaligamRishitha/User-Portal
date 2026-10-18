"""Remittance reports for the map grantors that only had a User Agreement

Every map pin now shows the grantor's User Agreement and latest Remittance
Report. These five grantors had an agreement but no report, so each gets
one (documents/remittance/demo/remittance_<grantor no>_<year>.pdf), built
from the details on their agreement. None of them has a vendor row, so the
name is stored on the report.

complete_seed_data inserts the rows on new databases; this adds them to
databases seeded before that, then sets the names on both.

The Evans agreement has no grantor number: its report has a NULL vendor_id
and is matched to the map pin by postcode.

Revision ID: agreement_grantor_remittance
Revises: map_pin_grantor_names
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = 'agreement_grantor_remittance'
down_revision: Union[str, None] = 'map_pin_grantor_names'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (grantor no, name, postcode, fiscal year, file key)
REPORTS = [
    ('5000000054', 'G J GEORGE',            'RH158NB', 2024, '5000000054'),
    ('5000000058', 'B M CLENSHAW',          'TN126HT', 2023, '5000000058'),
    ('5000000081', 'JOHN SMITH',            'TN299ND', 2024, '5000000081'),
    ('5000000083', 'DAVID BROWN',           'BN84HG',  2023, '5000000083'),
    (None,         'Graham & Louise Evans', 'KT234HQ', 2024, 'UKPN2464_EVANS'),
]


def url(file_key, year):
    return f'/documents/remittance/demo/remittance_{file_key}_{year}.pdf'


def upgrade() -> None:
    op.execute(text(
        "SELECT setval('remittance_reports_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM remittance_reports), false)"
    ))
    for vendor_id, name, postcode, year, file_key in REPORTS:
        op.execute(
            text("""
                INSERT INTO remittance_reports
                    (fiscal_year, document_name, document_url, document_type, postcode, vendor_id, grantor_name, created_at, updated_at)
                SELECT :year, :document_name, :url, 'PDF', :postcode, :vendor_id, :name, '2026-10-18 09:00:00', '2026-10-18 09:00:00'
                WHERE NOT EXISTS (SELECT 1 FROM remittance_reports WHERE document_url = :url)
            """).bindparams(
                year=year,
                document_name=f'{vendor_id or postcode}.pdf',
                url=url(file_key, year),
                postcode=postcode,
                vendor_id=vendor_id,
                name=name,
            )
        )
        op.execute(
            text("UPDATE remittance_reports SET grantor_name = :name WHERE document_url = :url")
            .bindparams(name=name, url=url(file_key, year))
        )


def downgrade() -> None:
    # The rows themselves come from complete_seed_data on new databases, so only the names are undone
    for _, _, _, year, file_key in REPORTS:
        op.execute(
            text("UPDATE remittance_reports SET grantor_name = NULL WHERE document_url = :url").bindparams(url=url(file_key, year))
        )
