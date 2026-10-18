"""Store grantor names for map pins without a vendor record

The admin Map view now labels each pin with the grantor's name. The name
comes from the vendors table; for pins whose grantor number has no vendor
row (or has no grantor number at all) this adds
geographical_documents.grantor_name, filled from the "BETWEEN:" line of
each pin's User Agreement (title dropped, to match the vendor-based names).

Revision ID: map_pin_grantor_names
Revises: remittance_grantor_names
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = 'map_pin_grantor_names'
down_revision: Union[str, None] = 'remittance_grantor_names'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# grantor number -> name as printed on the agreement / remittance schedule
AGREEMENT_NAMES = {
    '5000000015': 'S F ROGERS',
    '5000000054': 'G J GEORGE',
    '5000000058': 'B M CLENSHAW',
    '5000000068': 'JAQUELINE JANET',
    '5000000078': 'Beam',
    '5000000081': 'JOHN SMITH',
    '5000000083': 'DAVID BROWN',
    '5000000685': 'J L PEARCE',
    '5000003289': 'A D POOLE',
}


def upgrade() -> None:
    op.execute(text("ALTER TABLE geographical_documents ADD COLUMN IF NOT EXISTS grantor_name VARCHAR(255)"))
    for vendor_id, name in AGREEMENT_NAMES.items():
        op.execute(
            text("UPDATE geographical_documents SET grantor_name = :name WHERE vendor_id = :vendor_id")
            .bindparams(name=name, vendor_id=vendor_id)
        )
    # Evans agreement has no grantor number
    op.execute(text(
        "UPDATE geographical_documents SET grantor_name = 'Graham & Louise Evans' "
        "WHERE vendor_id IS NULL AND document_url LIKE '%agreement_UKPN2464_EVANS.pdf'"
    ))


def downgrade() -> None:
    op.execute(text("ALTER TABLE geographical_documents DROP COLUMN IF EXISTS grantor_name"))
