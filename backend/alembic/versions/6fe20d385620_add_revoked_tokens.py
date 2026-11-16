"""add revoked tokens

Revision ID: 6fe20d385620
Revises: fe65a5d0401b
Create Date: 2026-11-16 14:32:12.086917

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6fe20d385620'
down_revision: Union[str, Sequence[str], None] = 'fe65a5d0401b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "revoked_tokens",
        sa.Column("jti", sa.String(36), primary_key=True),
        sa.Column("expires_at", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("revoked_tokens")