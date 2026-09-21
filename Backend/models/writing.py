from datetime import datetime, timezone

from database import db


class Writing(db.Model):

    __tablename__ = "writings"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # WRITING CONTENT
    # =====================================================

    title = db.Column(
        db.String(200),
        nullable=False,
    )

    content = db.Column(
        db.Text,
        nullable=False,
        default="",
    )

    category = db.Column(
        db.String(50),
        nullable=False,
        default="অন্যান্য",
        index=True,
    )

    # =====================================================
    # LANGUAGE
    # =====================================================
    #
    # Store language codes rather than display names.
    #
    # Examples:
    # bn = Bengali
    # hi = Hindi
    # en = English
    # as = Assamese
    # or = Odia
    # ta = Tamil
    # te = Telugu
    #
    # =====================================================

    language = db.Column(
        db.String(20),
        nullable=False,
        default="bn",
        server_default="bn",
        index=True,
    )

    # =====================================================
    # DRAFT / PUBLISHED STATUS
    # =====================================================

    status = db.Column(
        db.String(20),
        nullable=False,
        default="draft",
        server_default="draft",
        index=True,
    )

    # =====================================================
    # AUTHOR
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
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        onupdate=lambda: datetime.now(
            timezone.utc
        ),
    )

    published_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    deleted_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    previous_status = db.Column(
        db.String(20),
        nullable=True,
    )

    # =====================================================
    # PERSISTENT ENGAGEMENT METRICS
    # =====================================================
    #
    # Likes and comments are derived from their relationship
    # tables.
    #
    # Shares are external actions. Therefore they are stored
    # as a persistent database counter.
    #
    # Example:
    #
    # shares_count = 0
    # shares_count = 1
    # shares_count = 25
    #
    # =====================================================

    shares_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    # -----------------------------------------------------
    # Author
    # -----------------------------------------------------

    author = db.relationship(
        "User",
        back_populates="writings",
    )

    # -----------------------------------------------------
    # Comments
    # -----------------------------------------------------

    comments = db.relationship(
        "Comment",
        back_populates="writing",
        cascade="all, delete-orphan",
        lazy=True,
    )

    # -----------------------------------------------------
    # Likes
    # -----------------------------------------------------

    likes = db.relationship(
        "Like",
        back_populates="writing",
        cascade="all, delete-orphan",
        lazy=True,
    )

    # -----------------------------------------------------
    # Tags
    # -----------------------------------------------------

    tags = db.relationship(
        "Tag",
        secondary="writing_tags",
        back_populates="writings",
        lazy="select",
    )

    # =====================================================
    # HELPERS
    # =====================================================

    @property
    def is_draft(self):
        return (
            self.status
            ==
            "draft"
        )

    @property
    def is_published(self):
        return (
            self.status
            ==
            "published"
        )

    # =====================================================
    # ENGAGEMENT COUNTS
    # =====================================================

    @property
    def likes_count(self):

        return len(
            self.likes
        )

    @property
    def comments_count(self):

        return len(
            self.comments
        )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {

            # -------------------------------------------------
            # WRITING
            # -------------------------------------------------

            "id":
                self.id,

            "title":
                self.title,

            "content":
                self.content,

            "category":
                self.category,

            "language":
                self.language,

            "status":
                self.status,

            # -------------------------------------------------
            # AUTHOR
            # -------------------------------------------------

            "user_id":
                self.user_id,

            "author":
                (
                    {
                        "id":
                            self.author.id,

                        "name":
                            self.author.name,

                        "username":
                            getattr(
                                self.author,
                                "username",
                                None,
                            ),

                        "avatar_url":
                            getattr(
                                self.author,
                                "avatar_url",
                                None,
                            ),
                    }

                    if self.author

                    else None
                ),

            # -------------------------------------------------
            # DATES
            # -------------------------------------------------

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

            "previous_status":
                self.previous_status,

            # -------------------------------------------------
            # ENGAGEMENT
            # -------------------------------------------------

            "likes_count":
                self.likes_count,

            "comments_count":
                self.comments_count,

            "shares_count":
                int(
                    self.shares_count
                    or 0
                ),

            # -------------------------------------------------
            # COMPATIBILITY ALIAS
            #
            # Some frontend code may still look for:
            #
            # share_count
            #
            # while the preferred field is:
            #
            # shares_count
            # -------------------------------------------------

            "share_count":
                int(
                    self.shares_count
                    or 0
                ),

            # -------------------------------------------------
            # TAGS
            # -------------------------------------------------

            "tags": [

                tag.to_dict()

                for tag
                in self.tags

            ],
        }

    # =====================================================
    # DEBUG REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (

            f"<Writing "

            f"id={self.id} "

            f"title={self.title!r} "

            f"language={self.language!r} "

            f"status={self.status!r} "

            f"shares_count={self.shares_count}>"

        )