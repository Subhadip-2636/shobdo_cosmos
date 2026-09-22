# =========================================================
# SHOBDO REEL MODEL
# =========================================================

from datetime import (
    datetime,
    timezone,
)

from extensions import db


# =========================================================
# HELPERS
# =========================================================

def utc_now():
    """
    Return the current UTC datetime.
    """

    return datetime.now(
        timezone.utc
    )


# =========================================================
# REEL MODEL
# =========================================================

class Reel(db.Model):

    __tablename__ = "reels"


    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )


    # =====================================================
    # CREATOR
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
    # VIDEO
    # =====================================================

    video_url = db.Column(
        db.Text,
        nullable=False,
    )


    thumbnail_url = db.Column(
        db.Text,
        nullable=True,
    )


    # =====================================================
    # CONTENT
    # =====================================================

    caption = db.Column(
        db.Text,
        nullable=True,
    )


    language = db.Column(
        db.String(10),
        nullable=False,
        default="bn",
        server_default="bn",
        index=True,
    )


    # =====================================================
    # VIDEO METADATA
    # =====================================================

    duration_seconds = db.Column(
        db.Float,
        nullable=True,
    )


    aspect_ratio = db.Column(
        db.String(20),
        nullable=False,
        default="9:16",
        server_default="9:16",
    )


    # =====================================================
    # VISIBILITY
    # =====================================================

    visibility = db.Column(
        db.String(20),
        nullable=False,
        default="public",
        server_default="public",
        index=True,
    )


    # =====================================================
    # SETTINGS
    # =====================================================

    comments_enabled = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
        server_default=db.text(
            "true"
        ),
    )


    # =====================================================
    # ENGAGEMENT COUNTERS
    # =====================================================

    views_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


    likes_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


    comments_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


    shares_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


    saves_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


    updated_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )


    # =====================================================
    # DATABASE CONSTRAINTS
    # =====================================================

    __table_args__ = (

        db.CheckConstraint(
            "visibility IN "
            "('public', 'followers', 'private')",
            name="ck_reels_visibility",
        ),

        db.CheckConstraint(
            "views_count >= 0",
            name="ck_reels_views_count",
        ),

        db.CheckConstraint(
            "likes_count >= 0",
            name="ck_reels_likes_count",
        ),

        db.CheckConstraint(
            "comments_count >= 0",
            name="ck_reels_comments_count",
        ),

        db.CheckConstraint(
            "shares_count >= 0",
            name="ck_reels_shares_count",
        ),

        db.CheckConstraint(
            "saves_count >= 0",
            name="ck_reels_saves_count",
        ),

    )


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(
        self,
    ):

        return {

            "id":
                self.id,

            "user_id":
                self.user_id,

            "video_url":
                self.video_url,

            "thumbnail_url":
                self.thumbnail_url,

            "caption":
                self.caption,

            "language":
                self.language,

            "duration_seconds":
                self.duration_seconds,

            "aspect_ratio":
                self.aspect_ratio,

            "visibility":
                self.visibility,

            "comments_enabled":
                bool(
                    self.comments_enabled
                ),

            "views_count":
                self.views_count,

            "likes_count":
                self.likes_count,

            "comments_count":
                self.comments_count,

            "shares_count":
                self.shares_count,

            "saves_count":
                self.saves_count,

            "created_at":
                (
                    self.created_at.isoformat()
                    if self.created_at
                    else None
                ),

            "updated_at":
                (
                    self.updated_at.isoformat()
                    if self.updated_at
                    else None
                ),

        }


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(
        self,
    ):

        return (
            f"<Reel "
            f"id={self.id} "
            f"user_id={self.user_id}>"
        )