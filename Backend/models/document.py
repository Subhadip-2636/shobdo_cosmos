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
    Return a timezone-aware UTC datetime.
    """

    return datetime.now(
        timezone.utc
    )


# =========================================================
# DOCUMENT MODEL
# =========================================================

class Document(db.Model):

    __tablename__ = "documents"


    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
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
    # DOCUMENT INFORMATION
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
    # Stores the status that the document had before
    # being moved to Trash.
    #
    # Example:
    #
    # published -> deleted
    #
    # previous_status = published
    #
    # This allows Restore to return the document to its
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
    # FILE INFORMATION
    # =====================================================

    original_filename = db.Column(
        db.String(255),
        nullable=False,
    )


    # Public Cloudinary PDF URL.

    file_url = db.Column(
        db.Text,
        nullable=False,
    )


    # Cloudinary public_id.

    storage_public_id = db.Column(
        db.String(500),
        nullable=True,
        unique=True,
    )


    mime_type = db.Column(
        db.String(100),
        nullable=False,
        default="application/pdf",
    )


    file_size = db.Column(
        db.BigInteger,
        nullable=False,
        default=0,
    )


    page_count = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )


    # =====================================================
    # PREVIEW / THUMBNAIL
    # =====================================================

    thumbnail_url = db.Column(
        db.Text,
        nullable=True,
    )


    # =====================================================
    # SEARCH / OCR TEXT
    # =====================================================

    extracted_text = db.Column(
        db.Text,
        nullable=True,
    )


    # =====================================================
    # DOWNLOAD CONTROL
    # =====================================================

    allow_download = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )


    # =====================================================
    # VISIBILITY
    # =====================================================
    #
    # public
    # unlisted
    #
    # =====================================================

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
    # deleted = soft deleted / currently in Trash
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
            "documents",

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
    # SERIALIZER
    # =====================================================

    def to_dict(
        self,
        include_extracted_text=False,
        include_storage_id=False,
    ):
        """
        Convert the Document object to JSON-compatible data.

        Public responses normally exclude:
        - extracted_text
        - storage_public_id

        Soft-delete information is included so My Writings
        can display Trash/Restore state.
        """

        data = {

            # =============================================
            # BASIC
            # =============================================

            "id":
                self.id,


            "content_type":
                "document",


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
            # FILE
            # =============================================

            "original_filename":
                self.original_filename,


            "file_url":
                self.file_url,


            "mime_type":
                self.mime_type,


            "file_size":
                self.file_size,


            "page_count":
                self.page_count,


            # =============================================
            # PREVIEW
            # =============================================

            "thumbnail_url":
                self.thumbnail_url,


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
            # STATUS / SOFT DELETE
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
        # OPTIONAL SEARCH / OCR CONTENT
        # =================================================

        if include_extracted_text:

            data[
                "extracted_text"
            ] = (
                self.extracted_text
            )


        # =================================================
        # OPTIONAL PRIVATE STORAGE INFORMATION
        # =================================================
        #
        # Do not normally expose the Cloudinary public ID
        # to public frontend requests.
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
    # STATUS HELPERS
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
    # MOVE TO TRASH — SOFT DELETE
    # =====================================================

    def move_to_trash(
        self,
    ):
        """
        Soft delete the PDF document.

        The Cloudinary PDF is NOT deleted here.
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
        Restore a soft-deleted PDF document.

        Returns the status that the document was restored to.
        """

        if (
            self.status
            !=
            "deleted"
        ):

            return None


        restore_status = (
            self.previous_status
            if self.previous_status
            in {
                "draft",
                "published",
            }
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
    # DATE / TIME HELPERS
    # =====================================================

    def get_activity_datetime(
        self,
    ):
        """
        Return the most relevant datetime for management UI.

        Trash:
            deleted_at

        Normal document:
            updated_at
            created_at
        """

        if (
            self.status
            ==
            "deleted"

            and

            self.deleted_at
        ):

            return self.deleted_at


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
            f"<Document "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"status={self.status!r} "
            f"previous_status={self.previous_status!r} "
            f"title={self.title!r}>"
        )