"""Collapse doubled file extensions in document_name

Some documents were stored with the extension repeated
(e.g. "CM3 3DQ.pdf.pdf"), which surfaces verbatim in the admin
report lists. This normalises the display names. document_url is
left untouched -- those paths were always well formed.

The names are recomputed in Python rather than with a SQL
regexp_replace backreference, so this stays in step with
normalize_document_name() in routers/reports.py.

Revision ID: fix_double_ext
Revises: complete_seed_data
Create Date: 2026-09-10

"""
import os
from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision: str = 'fix_double_ext'
down_revision: Union[str, None] = 'complete_seed_data'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = ("geographical_documents", "remittance_reports")


def collapse_repeated_extension(filename: str) -> str:
    """Strip trailing extensions that repeat, e.g. "a.pdf.pdf" -> "a.pdf"."""
    if not filename:
        return filename

    name, ext = os.path.splitext(filename)
    while ext and os.path.splitext(name)[1].lower() == ext.lower():
        name = os.path.splitext(name)[0]
    return f"{name}{ext}"


def upgrade() -> None:
    """Normalise document_name values that carry a duplicated extension."""
    conn = op.get_bind()

    for table in TABLES:
        rows = conn.execute(
            text(f"SELECT id, document_name FROM {table}")
        ).fetchall()

        fixed = 0
        for row_id, name in rows:
            collapsed = collapse_repeated_extension(name)
            if collapsed == name:
                continue

            conn.execute(
                text(
                    f"UPDATE {table} SET document_name = :name WHERE id = :id"
                ),
                {"name": collapsed, "id": row_id},
            )
            fixed += 1

        print(f"  {table}: normalised {fixed} name(s)")


def downgrade() -> None:
    """No-op: the original names carried a duplicated extension by mistake."""
    pass
