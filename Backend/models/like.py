from datetime import datetime, timezone

from database import db


class Like(db.Model):

    __tablename__ = "likes"

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
    # TIMESTAMP
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda:
            datetime.now(
                timezone.utc
            ),
    )

    # =====================================================
    # UNIQUE CONSTRAINT
    # =====================================================
    #
    # One user can like one writing only once.
    # =====================================================

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "writing_id",
            name="uq_like_user_writing",
        ),
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    user = db.relationship(
        "User",
        backref=db.backref(
            "likes",
            lazy=True,
            cascade="all, delete-orphan",
        ),
    )

    writing = db.relationship(
        "Writing",
        back_populates="likes",
    )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {
            "id":
                self.id,

            "user_id":
                self.user_id,

            "writing_id":
                self.writing_id,

            "created_at":
                self.created_at.isoformat()
                if self.created_at
                else None,
        }

    def __repr__(self):

        return (
            f"<Like "
            f"user_id={self.user_id} "
            f"writing_id={self.writing_id}>"
        )