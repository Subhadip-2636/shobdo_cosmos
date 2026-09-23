from datetime import (
    datetime,
    timezone,
)

from database import db


class Video(db.Model):

    __tablename__ = "videos"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # OWNER
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
    # BASIC INFORMATION
    # =====================================================

    title = db.Column(
        db.String(200),
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    category = db.Column(
        db.String(80),
        nullable=False,
        default="Other",
        index=True,
    )

    language = db.Column(
        db.String(20),
        nullable=False,
        default="bn",
        index=True,
    )

    # =====================================================
    # MEDIA
    # =====================================================

    video_url = db.Column(
        db.Text,
        nullable=False,
    )

    thumbnail_url = db.Column(
        db.Text,
        nullable=True,
    )

    public_id = db.Column(
        db.String(500),
        nullable=True,
        index=True,
    )

    original_filename = db.Column(
        db.String(500),
        nullable=True,
    )

    mime_type = db.Column(
        db.String(100),
        nullable=True,
    )

    file_size = db.Column(
        db.BigInteger,
        nullable=True,
    )

    duration_seconds = db.Column(
        db.Float,
        nullable=True,
    )

    width = db.Column(
        db.Integer,
        nullable=True,
    )

    height = db.Column(
        db.Integer,
        nullable=True,
    )

    # =====================================================
    # PUBLISHING
    # =====================================================

    status = db.Column(
        db.String(20),
        nullable=False,
        default="published",
        index=True,
    )

    visibility = db.Column(
        db.String(20),
        nullable=False,
        default="public",
        index=True,
    )

    # =====================================================
    # SOCIAL COUNTERS
    # =====================================================

    views_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    likes_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    comments_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    shares_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    saves_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        index=True,
    )

    updated_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        onupdate=lambda: datetime.now(
            timezone.utc
        ),
    )

    published_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # TRASH / SOFT DELETE
    # =====================================================

    deleted_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
        index=True,
    )

    previous_status = db.Column(
        db.String(20),
        nullable=True,
    )

    # =====================================================
    # STATUS HELPERS
    # =====================================================

    @property
    def is_published(self):

        return (
            self.status ==
            "published"
        )

    @property
    def is_public(self):

        return (
            self.visibility ==
            "public"
        )

    @property
    def is_deleted(self):

        return (
            self.status ==
            "deleted"
        )

    # =====================================================
    # SOFT DELETE
    # =====================================================

    def move_to_trash(
        self
    ):

        if self.is_deleted:

            return False

        self.previous_status = (
            self.status
            if self.status
            else "published"
        )

        self.status = (
            "deleted"
        )

        self.deleted_at = (
            datetime.now(
                timezone.utc
            )
        )

        return True

    # =====================================================
    # RESTORE
    # =====================================================

    def restore_from_trash(
        self
    ):

        if not self.is_deleted:

            return False

        restore_status = (
            self.previous_status
            if self.previous_status
            in {
                "draft",
                "published",
                "unpublished",
            }
            else "published"
        )

        self.status = (
            restore_status
        )

        self.deleted_at = (
            None
        )

        self.previous_status = (
            None
        )

        return True

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(
        self,
        include_owner=False,
    ):

        data = {

            "id":
                self.id,

            "user_id":
                self.user_id,

            "title":
                self.title,

            "description":
                self.description,

            "category":
                self.category,

            "language":
                self.language,

            "video_url":
                self.video_url,

            "thumbnail_url":
                self.thumbnail_url,

            "public_id":
                self.public_id,

            "original_filename":
                self.original_filename,

            "mime_type":
                self.mime_type,

            "file_size":
                self.file_size,

            "duration_seconds":
                self.duration_seconds,

            "width":
                self.width,

            "height":
                self.height,

            "status":
                self.status,

            "visibility":
                self.visibility,

            "is_published":
                self.is_published,

            "is_public":
                self.is_public,

            "is_deleted":
                self.is_deleted,

            "previous_status":
                self.previous_status,

            "views_count":
                self.views_count or 0,

            "likes_count":
                self.likes_count or 0,

            "comments_count":
                self.comments_count or 0,

            "shares_count":
                self.shares_count or 0,

            "saves_count":
                self.saves_count or 0,

            "created_at":
                (
                    self.created_at
                    .isoformat()
                    if self.created_at
                    else None
                ),

            "updated_at":
                (
                    self.updated_at
                    .isoformat()
                    if self.updated_at
                    else None
                ),

            "published_at":
                (
                    self.published_at
                    .isoformat()
                    if self.published_at
                    else None
                ),

            "deleted_at":
                (
                    self.deleted_at
                    .isoformat()
                    if self.deleted_at
                    else None
                ),
        }

        # =================================================
        # OPTIONAL CREATOR INFORMATION
        # =================================================

        if include_owner:

            try:

                from models.user import User

                owner = db.session.get(
                    User,
                    self.user_id,
                )

                if owner:

                    data["user"] = {

                        "id":
                            owner.id,

                        "name":
                            getattr(
                                owner,
                                "name",
                                None,
                            ),

                        "avatar_url":
                            getattr(
                                owner,
                                "avatar_url",
                                None,
                            ),
                    }

                else:

                    data["user"] = (
                        None
                    )

            except Exception:

                data["user"] = (
                    None
                )

        return data

    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(
        self
    ):

        return (
            f"<Video "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"status={self.status!r} "
            f"title={self.title!r}>"
        )