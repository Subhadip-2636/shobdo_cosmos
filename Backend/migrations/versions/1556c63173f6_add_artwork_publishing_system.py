"""add artwork publishing system

Revision ID: 1556c63173f6
Revises: a632d17d264b
Create Date: 2026-09-13 00:47:06.563576
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision = "1556c63173f6"
down_revision = "a632d17d264b"
branch_labels = None
depends_on = None


# =========================================================
# UPGRADE
# =========================================================

def upgrade():

    # =====================================================
    # ARTWORKS TABLE
    # =====================================================

    op.create_table(
        "artworks",

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
            "image_url",
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
            "width",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "height",
            sa.Integer(),
            nullable=False,
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


        # ================================================
        # FOREIGN KEY
        # ================================================

        sa.ForeignKeyConstraint(
            [
                "user_id",
            ],
            [
                "users.id",
            ],
            ondelete="CASCADE",
        ),


        # ================================================
        # PRIMARY KEY
        # ================================================

        sa.PrimaryKeyConstraint(
            "id"
        ),


        # ================================================
        # UNIQUE CLOUDINARY PUBLIC ID
        # ================================================

        sa.UniqueConstraint(
            "storage_public_id"
        ),
    )


    # =====================================================
    # INDEXES
    # =====================================================

    op.create_index(
        "ix_artworks_user_id",
        "artworks",
        [
            "user_id",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_category",
        "artworks",
        [
            "category",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_language",
        "artworks",
        [
            "language",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_visibility",
        "artworks",
        [
            "visibility",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_status",
        "artworks",
        [
            "status",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_created_at",
        "artworks",
        [
            "created_at",
        ],
        unique=False,
    )


    op.create_index(
        "ix_artworks_published_at",
        "artworks",
        [
            "published_at",
        ],
        unique=False,
    )


# =========================================================
# DOWNGRADE
# =========================================================

def downgrade():

    # =====================================================
    # REMOVE INDEXES
    # =====================================================

    op.drop_index(
        "ix_artworks_published_at",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_created_at",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_status",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_visibility",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_language",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_category",
        table_name="artworks",
    )


    op.drop_index(
        "ix_artworks_user_id",
        table_name="artworks",
    )


    # =====================================================
    # REMOVE TABLE
    # =====================================================

    op.drop_table(
        "artworks"
    )