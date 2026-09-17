from datetime import datetime, timezone

from database import db


class SavedWriting(db.Model):

    __tablename__ = "saved_writings"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # USER
    # =====================================================

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # WRITING
    # =====================================================

    writing_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "writings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # CREATED DATE
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        index=True,
    )

    # =====================================================
    # PREVENT DUPLICATE SAVES
    # =====================================================

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "writing_id",
            name="uq_saved_writing_user_writing",
        ),
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    user = db.relationship(
        "User",
        foreign_keys=[user_id],
        lazy="joined",
    )

    writing = db.relationship(
        "Writing",
        foreign_keys=[writing_id],
        lazy="joined",
    )

    # =====================================================
    # JSON
    # =====================================================

    def to_dict(self):

        return {
            "id": self.id,

            "user_id":
                self.user_id,

            "writing_id":
                self.writing_id,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }