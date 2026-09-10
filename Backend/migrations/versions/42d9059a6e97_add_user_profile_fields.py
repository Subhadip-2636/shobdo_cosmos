"""Add user profile fields

Revision ID: 42d9059a6e97
Revises: e65863a00c5b
"""

from alembic import op
import sqlalchemy as sa


revision = "42d9059a6e97"
down_revision = "e65863a00c5b"
branch_labels = None
depends_on = None


def upgrade():

    op.add_column(
        "users",
        sa.Column(
            "username",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "bio",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "avatar_url",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "location",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "website",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_username",
        "users",
        ["username"],
        unique=True,
    )


def downgrade():

    op.drop_index(
        "ix_users_username",
        table_name="users",
    )

    op.drop_column(
        "users",
        "website",
    )

    op.drop_column(
        "users",
        "location",
    )

    op.drop_column(
        "users",
        "avatar_url",
    )

    op.drop_column(
        "users",
        "bio",
    )

    op.drop_column(
        "users",
        "username",
    )
