from datetime import datetime, timezone

from extensions import db


class Follow(db.Model):

    __tablename__ = "user_follows"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # FOLLOW RELATIONSHIP
    # =====================================================

    # The user who follows another user.
    follower_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # The user being followed.
    following_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # CREATED AT
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
    )

    # =====================================================
    # CONSTRAINTS
    # =====================================================

    __table_args__ = (

        db.UniqueConstraint(
            "follower_id",
            "following_id",
            name="uq_user_follows_pair",
        ),

        db.CheckConstraint(
            "follower_id <> following_id",
            name="chk_user_follows_not_self",
        ),

    )

    # =====================================================
    # SERIALIZER
    # =====================================================

    def to_dict(self):

        return {
            "id": self.id,

            "follower_id":
                self.follower_id,

            "following_id":
                self.following_id,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }