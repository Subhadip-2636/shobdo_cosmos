from datetime import datetime, timezone

from database import db


class Artwork(db.Model):

    __tablename__ = "artworks"

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
    # ARTWORK INFORMATION
    # =====================================================

    title = db.Column(
        db.String(200),
        nullable=False,
    )

    description = db.Column(
        db.Text,
        nullable=True,
    )

    category = db.Column(
        db.String(80),
        nullable=False,
        default="অন্যান্য",
        index=True,
    )

    language = db.Column(
        db.String(10),
        nullable=False,
        default="bn",
        index=True,
    )


    # =====================================================
    # IMAGE STORAGE
    # =====================================================

    original_filename = db.Column(
        db.String(255),
        nullable=False,
    )

    image_url = db.Column(
        db.Text,
        nullable=False,
    )

    storage_public_id = db.Column(
        db.String(500),
        nullable=True,
        unique=True,
    )

    mime_type = db.Column(
        db.String(100),
        nullable=False,
    )

    file_size = db.Column(
        db.BigInteger,
        nullable=False,
        default=0,
    )

    width = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    height = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )


    # =====================================================
    # PUBLISHING SETTINGS
    # =====================================================

    allow_download = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )

    visibility = db.Column(
        db.String(20),
        nullable=False,
        default="public",
        index=True,
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="published",
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
        index=True,
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
        index=True,
    )


    # =====================================================
    # RELATIONSHIP
    # =====================================================

    user = db.relationship(
        "User",
        backref=db.backref(
            "artworks",
            lazy="dynamic",
            cascade="all, delete-orphan",
        ),
    )


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        author = None

        if self.user:

            author = {
                "id": self.user.id,
                "name": self.user.name,
                "username": getattr(
                    self.user,
                    "username",
                    None,
                ),
                "avatar_url": getattr(
                    self.user,
                    "avatar_url",
                    None,
                ),
            }


        return {

            "id": self.id,

            "content_type": "artwork",

            "user_id": self.user_id,

            "title": self.title,

            "description": self.description,

            "category": self.category,

            "language": self.language,

            "original_filename":
                self.original_filename,

            "image_url":
                self.image_url,

            "mime_type":
                self.mime_type,

            "file_size":
                self.file_size,

            "width":
                self.width,

            "height":
                self.height,

            "allow_download":
                self.allow_download,

            "visibility":
                self.visibility,

            "status":
                self.status,

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

            "author":
                author,
        }


    def __repr__(self):

        return (
            f"<Artwork "
            f"id={self.id} "
            f"title={self.title!r}>"
        )