from datetime import (
    datetime,
    timezone,
)

from database import db


# =========================================================
# HELPERS
# =========================================================

def utc_now():
    """
    Return the current timezone-aware UTC datetime.
    """

    return datetime.now(
        timezone.utc
    )


# =========================================================
# ARTWORK MODEL
# =========================================================

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
    # SOFT DELETE INFORMATION
    # =====================================================
    #
    # previous_status:
    #
    # Stores the artwork status before it was moved
    # to Trash.
    #
    # Example:
    #
    # published -> deleted
    #
    # previous_status = "published"
    #
    # Restore can then return the artwork to the
    # original state.
    #
    # =====================================================

    previous_status = db.Column(
        db.String(20),
        nullable=True,
    )


    deleted_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
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


    # Cloudinary public ID.
    #
    # IMPORTANT:
    # This should NOT be deleted when the artwork
    # is only moved to Trash.
    #
    # It should be deleted from Cloudinary only
    # during permanent deletion.

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


    # public
    # unlisted

    visibility = db.Column(
        db.String(20),
        nullable=False,
        default="public",
        index=True,
    )


    # =====================================================
    # STATUS
    # =====================================================
    #
    # draft
    # published
    # deleted
    #
    # deleted means:
    #     soft deleted and currently in Trash.
    #
    # =====================================================

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


    published_at = db.Column(
        db.DateTime(
            timezone=True
        ),
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

            cascade=
                "all, delete-orphan",
        ),
    )


    # =====================================================
    # AUTHOR SERIALIZER
    # =====================================================

    def get_author_dict(
        self,
    ):

        if not self.user:

            return None


        return {

            "id":
                self.user.id,


            "name":
                getattr(
                    self.user,
                    "name",
                    None,
                ),


            "username":
                getattr(
                    self.user,
                    "username",
                    None,
                ),


            "avatar_url":
                getattr(
                    self.user,
                    "avatar_url",
                    None,
                ),
        }


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(
        self,
        include_storage_id=False,
    ):
        """
        Convert Artwork into frontend-safe JSON data.

        Includes:
        - status
        - previous_status
        - deleted_at
        - created_at
        - updated_at
        - published_at

        so My Writings can implement:
        - Trash
        - Restore
        - permanent delete
        - localized date and time.
        """

        data = {

            # =============================================
            # BASIC
            # =============================================

            "id":
                self.id,


            "content_type":
                "artwork",


            "user_id":
                self.user_id,


            # =============================================
            # CONTENT
            # =============================================

            "title":
                self.title,


            "description":
                self.description,


            "category":
                self.category,


            "language":
                self.language,


            # =============================================
            # IMAGE
            # =============================================

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


            # =============================================
            # SETTINGS
            # =============================================

            "allow_download":
                bool(
                    self.allow_download
                ),


            "visibility":
                self.visibility,


            # =============================================
            # STATUS / TRASH
            # =============================================

            "status":
                self.status,


            "previous_status":
                self.previous_status,


            "deleted_at":
                (
                    self.deleted_at.isoformat()
                    if self.deleted_at
                    else None
                ),


            # =============================================
            # TIMESTAMPS
            # =============================================

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


            "published_at":
                (
                    self.published_at.isoformat()
                    if self.published_at
                    else None
                ),


            # =============================================
            # AUTHOR
            # =============================================

            "author":
                self.get_author_dict(),
        }


        # =================================================
        # PRIVATE CLOUDINARY INFORMATION
        # =================================================
        #
        # Normally this should not be exposed publicly.
        #
        # Backend owner-management routes may request it.
        #
        # =================================================

        if include_storage_id:

            data[
                "storage_public_id"
            ] = (
                self.storage_public_id
            )


        return data


    # =====================================================
    # OWNERSHIP
    # =====================================================

    def is_owned_by(
        self,
        user_id,
    ):

        if user_id is None:

            return False


        return (
            str(
                self.user_id
            )
            ==
            str(
                user_id
            )
        )


    # =====================================================
    # STATUS CHECKS
    # =====================================================

    def is_draft(
        self,
    ):

        return (
            self.status
            ==
            "draft"
        )


    def is_published(
        self,
    ):

        return (
            self.status
            ==
            "published"
        )


    def is_deleted(
        self,
    ):

        return (
            self.status
            ==
            "deleted"
        )


    # =====================================================
    # PUBLIC CHECK
    # =====================================================

    def is_public(
        self,
    ):

        return (
            self.status
            ==
            "published"

            and

            self.visibility
            ==
            "public"
        )


    # =====================================================
    # UNLISTED CHECK
    # =====================================================

    def is_unlisted(
        self,
    ):

        return (
            self.status
            ==
            "published"

            and

            self.visibility
            ==
            "unlisted"
        )


    # =====================================================
    # MARK PUBLISHED
    # =====================================================

    def mark_published(
        self,
    ):

        self.status = (
            "published"
        )


        self.previous_status = (
            None
        )


        self.deleted_at = (
            None
        )


        if not self.published_at:

            self.published_at = (
                utc_now()
            )


    # =====================================================
    # MARK DRAFT
    # =====================================================

    def mark_draft(
        self,
    ):

        self.status = (
            "draft"
        )


        self.previous_status = (
            None
        )


        self.deleted_at = (
            None
        )


        self.published_at = (
            None
        )


    # =====================================================
    # MOVE TO TRASH
    # SOFT DELETE
    # =====================================================

    def move_to_trash(
        self,
    ):
        """
        Soft delete this artwork.

        IMPORTANT:
        This does NOT delete the image from Cloudinary.

        Cloudinary deletion must happen only after the
        user explicitly chooses Delete Permanently.
        """

        if (
            self.status
            ==
            "deleted"
        ):

            return False


        if (
            self.status
            in {
                "draft",
                "published",
            }
        ):

            self.previous_status = (
                self.status
            )

        else:

            self.previous_status = (
                "draft"
            )


        self.status = (
            "deleted"
        )


        self.deleted_at = (
            utc_now()
        )


        return True


    # =====================================================
    # RESTORE FROM TRASH
    # =====================================================

    def restore_from_trash(
        self,
    ):
        """
        Restore artwork from Trash.

        Returns:
            "draft"
            or
            "published"

        depending on the artwork's status before deletion.
        """

        if (
            self.status
            !=
            "deleted"
        ):

            return None


        restore_status = (
            self.previous_status

            if (
                self.previous_status
                in {
                    "draft",
                    "published",
                }
            )

            else "draft"
        )


        self.status = (
            restore_status
        )


        self.previous_status = (
            None
        )


        self.deleted_at = (
            None
        )


        if (
            restore_status
            ==
            "published"
        ):

            if not self.published_at:

                self.published_at = (
                    utc_now()
                )


        else:

            self.published_at = (
                None
            )


        return restore_status


    # =====================================================
    # MANAGEMENT DATE/TIME
    # =====================================================

    def get_activity_datetime(
        self,
    ):
        """
        Return the datetime that should normally be shown
        in My Writings.

        Normal artwork:
            updated_at / created_at

        Trash artwork:
            deleted_at
        """

        if (
            self.status
            ==
            "deleted"

            and

            self.deleted_at
        ):

            return (
                self.deleted_at
            )


        return (
            self.updated_at
            or
            self.created_at
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(
        self,
    ):

        return (
            f"<Artwork "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"status={self.status!r} "
            f"previous_status={self.previous_status!r} "
            f"title={self.title!r}>"
        )