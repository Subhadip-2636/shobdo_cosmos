"""add shares count to writings

Revision ID: 0cd1726c59c0
Revises: 1e0619445e70
Create Date: 2026-09-22 01:01:56.075845

"""

from alembic import op
import sqlalchemy as sa


# =========================================================
# REVISION IDENTIFIERS
# =========================================================

revision = "0cd1726c59c0"
down_revision = "1e0619445e70"
branch_labels = None
depends_on = None


# =========================================================
# UPGRADE
# =========================================================

def upgrade():

    op.add_column(
        "writings",
        sa.Column(
            "shares_count",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )


# =========================================================
# DOWNGRADE
# =========================================================

def downgrade():

    op.drop_column(
        "writings",
        "shares_count",
    )