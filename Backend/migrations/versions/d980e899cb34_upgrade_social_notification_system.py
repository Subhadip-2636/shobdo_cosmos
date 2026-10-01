"""upgrade social notification system

Revision ID: d980e899cb34
Revises: 2346a1dc2bc5
Create Date: 2026-09-29 15:39:30.478085

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d980e899cb34"
down_revision = "2346a1dc2bc5"
branch_labels = None
depends_on = None


def upgrade():

    # =====================================================
    # ADD SOCIAL NOTIFICATION FIELDS
    # =====================================================

    with op.batch_alter_table(
        "notifications",
        schema=None,
    ) as batch_op:

        batch_op.add_column(
            sa.Column(
                "target_url",
                sa.String(length=500),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "group_key",
                sa.String(length=255),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "read_at",
                sa.DateTime(timezone=True),
                nullable=True,
            )
        )

        # Existing rows must receive False.
        batch_op.add_column(
            sa.Column(
                "email_sent",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )

        batch_op.add_column(
            sa.Column(
                "email_sent_at",
                sa.DateTime(timezone=True),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "email_error",
                sa.String(length=500),
                nullable=True,
            )
        )

        # Existing rows need a valid timestamp.
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            )
        )

        batch_op.create_index(
            batch_op.f(
                "ix_notifications_email_sent"
            ),
            ["email_sent"],
            unique=False,
        )

        batch_op.create_index(
            batch_op.f(
                "ix_notifications_group_key"
            ),
            ["group_key"],
            unique=False,
        )

    # =====================================================
    # REMOVE TEMPORARY SERVER DEFAULTS
    # =====================================================
    #
    # Python model defaults will control new records.
    # Defaults above are primarily required so existing
    # notification rows migrate safely.
    #
    # =====================================================

    with op.batch_alter_table(
        "notifications",
        schema=None,
    ) as batch_op:

        batch_op.alter_column(
            "email_sent",
            server_default=None,
        )

        batch_op.alter_column(
            "updated_at",
            server_default=None,
        )


def downgrade():

    with op.batch_alter_table(
        "notifications",
        schema=None,
    ) as batch_op:

        batch_op.drop_index(
            batch_op.f(
                "ix_notifications_group_key"
            )
        )

        batch_op.drop_index(
            batch_op.f(
                "ix_notifications_email_sent"
            )
        )

        batch_op.drop_column(
            "updated_at"
        )

        batch_op.drop_column(
            "email_error"
        )

        batch_op.drop_column(
            "email_sent_at"
        )

        batch_op.drop_column(
            "email_sent"
        )

        batch_op.drop_column(
            "read_at"
        )

        batch_op.drop_column(
            "group_key"
        )

        batch_op.drop_column(
            "target_url"
        )