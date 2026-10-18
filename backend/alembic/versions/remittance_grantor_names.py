"""Store grantor names for remittance reports without a vendor record

The admin Remittance Reports list takes the grantor name from the vendors
table. Some reports belong to grantor numbers that have no vendor row, so
their Grantor column was blank even though the name is printed on the
report itself. This adds remittance_reports.grantor_name as a fallback and
fills it from the "Grantor Name:" line of each of those PDFs (title
dropped, to match the vendor-based names).

Also title-cases the demo grantors' surnames (SMITH -> Smith etc.) for
databases seeded before complete_seed_data was changed.

Revision ID: remittance_grantor_names
Revises: fix_double_ext
Create Date: 2026-10-15

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = 'remittance_grantor_names'
down_revision: Union[str, None] = 'fix_double_ext'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# grantor number -> name as printed on its remittance schedule
REPORT_NAMES = {
    '5000000015': 'S F ROGERS',
    '5000000068': 'JAQUELINE JANET',
    '5000000078': 'Beam',
    '5000000685': 'J L PEARCE',
    '5000003289': 'A D POOLE',
}


def upgrade() -> None:
    op.execute(text("ALTER TABLE remittance_reports ADD COLUMN IF NOT EXISTS grantor_name VARCHAR(255)"))
    for vendor_id, name in REPORT_NAMES.items():
        op.execute(
            text("UPDATE remittance_reports SET grantor_name = :name WHERE vendor_id = :vendor_id")
            .bindparams(name=name, vendor_id=vendor_id)
        )
    op.execute(text("UPDATE vendors SET last_name = INITCAP(last_name) WHERE vendor_id LIKE '50000091%'"))


def downgrade() -> None:
    op.execute(text("ALTER TABLE remittance_reports DROP COLUMN IF EXISTS grantor_name"))
