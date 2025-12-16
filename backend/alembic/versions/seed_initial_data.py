"""Seed initial data

Revision ID: seed_initial_data
Revises: 95b6c1509bb5
Create Date: 2025-12-16 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Numeric, Date, DateTime, Text

# revision identifiers, used by Alembic.
revision: str = 'seed_initial_data'
down_revision: Union[str, None] = '95b6c1509bb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert seed data."""
    
    # Define table structures for bulk insert
    vendors_table = table('vendors',
        column('vendor_id', String),
        column('title', String),
        column('first_name', String),
        column('last_name', String),
        column('email', String),
        column('password_hash', String),
        column('mobile', String),
        column('telephone', String),
    )
    
    # Insert vendors
    op.bulk_insert(vendors_table, [
        {
            'vendor_id': '5000000015',
            'title': '0002',
            'first_name': 'John A',
            'last_name': 'DREIER',
            'email': 'susanfrogers@gmail.com',
            'password_hash': '$2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC',
            'mobile': '07700 111 222',
            'telephone': '020 7946 1234',
        },
        {
            'vendor_id': '5000000061',
            'title': 'Mr.',
            'first_name': 'D',
            'last_name': 'L BOLTON',
            'email': 'farm@boltonfarms.co.uk',
            'password_hash': '$2b$12$kdGQQ35qWZnH8GPvHygOyuXY4gSrn0y/I5MI.s55fzumxYUIot7CC',
            'mobile': '07822 333 444',
            'telephone': '020 7946 5678',
        },
    ])
    
    # Define user_details table
    user_details_table = table('user_details',
        column('vendor_id', String),
        column('street', String),
        column('address_line1', String),
        column('address_line2', String),
        column('city', String),
        column('postcode', String),
    )
    
    # Insert user details
    op.bulk_insert(user_details_table, [
        {
            'vendor_id': '5000000015',
            'street': 'TAMLEY COTTAGE',
            'address_line1': 'TAMLEY LANE',
            'address_line2': 'HASTINGLEIGH',
            'city': 'ASHFORD',
            'postcode': 'TN25 5HW',
        },
        {
            'vendor_id': '5000000061',
            'street': 'BORHEAM HALL',
            'address_line1': 'THE CHASE',
            'address_line2': 'BOREHAM',
            'city': 'CHELMSFORD',
            'postcode': 'CM3 3DQ',
        },
    ])
    
    # Define bank_details table
    bank_details_table = table('bank_details',
        column('vendor_id', String),
        column('account_number', String),
        column('sort_code', String),
        column('account_holder_name', String),
        column('payment_method', String),
        column('zahls', String),
        column('confs', String),
        column('sperr', String),
    )
    
    # Insert bank details
    op.bulk_insert(bank_details_table, [
        {
            'vendor_id': '5000000061',
            'account_number': '98765432',
            'sort_code': '50-60-70',
            'account_holder_name': 'D L BOLTON',
            'payment_method': 'BACS',
            'zahls': '-',
            'confs': '-',
            'sperr': '-',
        },
        {
            'vendor_id': '5000000015',
            'account_number': '22222222',
            'sort_code': '20-30-40',
            'account_holder_name': 'John A DREIER UPDATED',
            'payment_method': 'K',
            'zahls': '-',
            'confs': '-',
            'sperr': '-',
        },
    ])


def downgrade() -> None:
    """Remove seed data."""
    # Delete in reverse order of foreign key dependencies
    op.execute("DELETE FROM bank_details WHERE vendor_id IN ('5000000015', '5000000061')")
    op.execute("DELETE FROM user_details WHERE vendor_id IN ('5000000015', '5000000061')")
    op.execute("DELETE FROM vendors WHERE vendor_id IN ('5000000015', '5000000061')")
