"""Add documents publishing system

Revision ID: a632d17d264b
Revises: 42d9059a6e97
Create Date: 2026-09-12 19:21:47.027269

"""

from alembic import op
import sqlalchemy as sa


# =========================================================
# REVISION IDENTIFIERS
# =========================================================

revision = "a632d17d264b"
down_revision = "42d9059a6e97"
branch_labels = None
depends_on = None


# =========================================================
# UPGRADE
# =========================================================

def upgrade():

    # -----------------------------------------------------
    # DOCUMENTS TABLE
    # -----------------------------------------------------

    op.create_table(
        "documents",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "title",
            sa.String(
                length=200
            ),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "category",
            sa.String(
                length=80
            ),
            nullable=False,
        ),

        sa.Column(
            "language",
            sa.String(
                length=10
            ),
            nullable=False,
        ),

        sa.Column(
            "original_filename",
            sa.String(
                length=255
            ),
            nullable=False,
        ),

        sa.Column(
            "file_url",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "storage_public_id",
            sa.String(
                length=500
            ),
            nullable=True,
        ),

        sa.Column(
            "mime_type",
            sa.String(
                length=100
            ),
            nullable=False,
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False,
        ),

        sa.Column(
            "page_count",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "thumbnail_url",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "extracted_text",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "allow_download",
            sa.Boolean(),
            nullable=False,
        ),

        sa.Column(
            "visibility",
            sa.String(
                length=20
            ),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.String(
                length=20
            ),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(
                timezone=True
            ),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(
                timezone=True
            ),
            nullable=False,
        ),

        sa.Column(
            "published_at",
            sa.DateTime(
                timezone=True
            ),
            nullable=True,
        ),

        sa.ForeignKeyConstraint(
            [
                "user_id"
            ],
            [
                "users.id"
            ],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint(
            "id"
        ),

        sa.UniqueConstraint(
            "storage_public_id",
            name=
                "uq_documents_storage_public_id",
        ),
    )


    # -----------------------------------------------------
    # INDEXES
    # -----------------------------------------------------

    op.create_index(
        "ix_documents_category",
        "documents",
        [
            "category"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_created_at",
        "documents",
        [
            "created_at"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_language",
        "documents",
        [
            "language"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_published_at",
        "documents",
        [
            "published_at"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_status",
        "documents",
        [
            "status"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_user_id",
        "documents",
        [
            "user_id"
        ],
        unique=False,
    )

    op.create_index(
        "ix_documents_visibility",
        "documents",
        [
            "visibility"
        ],
        unique=False,
    )


# =========================================================
# DOWNGRADE
# =========================================================

def downgrade():

    # -----------------------------------------------------
    # DROP INDEXES
    # -----------------------------------------------------

    op.drop_index(
        "ix_documents_visibility",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_user_id",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_status",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_published_at",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_language",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_created_at",
        table_name="documents",
    )

    op.drop_index(
        "ix_documents_category",
        table_name="documents",
    )


    # -----------------------------------------------------
    # DROP TABLE
    # -----------------------------------------------------

    op.drop_table(
        "documents"
    )