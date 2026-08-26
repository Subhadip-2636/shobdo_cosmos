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

    # Store language codes instead of display names.
    #
    # Examples:
    # bn = Bengali
    # hi = Hindi
    # en = English
    # as = Assamese
    # or = Odia
    # ta = Tamil
    # te = Telugu

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
        default=lambda:
            datetime.now(timezone.utc),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda:
            datetime.now(timezone.utc),
        onupdate=lambda:
            datetime.now(timezone.utc),
    )

    published_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    author = db.relationship(
        "User",
        back_populates="writings",
    )

    comments = db.relationship(
    "Comment",
    back_populates="writing",
    cascade="all, delete-orphan",
    lazy=True,
    )


    likes = db.relationship(
    "Like",
    back_populates="writing",
    cascade="all, delete-orphan",
    lazy=True,
    )


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
            self.status == "draft"
        )


    @property
    def is_published(self):

        return (
            self.status == "published"
        )


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {

            "id":
                self.id,

            "title":
                self.title,

            "content":
                self.content,

            "category":
                self.category,

            # NEW
            "language":
                self.language,

            "status":
                self.status,

            "user_id":
                self.user_id,

            "author": {
                "id":
                    self.author.id,

                "name":
                    self.author.name,
            }
            if self.author
            else None,

            "created_at":
                self.created_at.isoformat()
                if self.created_at
                else None,

            "updated_at":
                self.updated_at.isoformat()
                if self.updated_at
                else None,

            "published_at":
                self.published_at.isoformat()
                if self.published_at
                else None,

            "likes_count":
                len(self.likes),

            "comments_count":
                len(self.comments),

            "tags": [
                tag.to_dict()
                for tag in self.tags
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
            f"status={self.status!r}>"
        )