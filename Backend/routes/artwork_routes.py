import io

from datetime import (
    datetime,
    timezone,
)

from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from PIL import (
    Image,
    UnidentifiedImageError,
)

from database import db

from models.artwork import Artwork

from services.artwork_storage import (
    delete_artwork,
    upload_artwork,
)


# =========================================================
# BLUEPRINT
# =========================================================
#
# artwork_bp already contains:
#
# /api/artworks
#
# app.py should register this blueprint directly:
#
# app.register_blueprint(
#     artwork_bp
# )
#
# Final API routes:
#
# POST   /api/artworks
# GET    /api/artworks
# GET    /api/artworks/mine
# GET    /api/artworks/<id>
#
# DELETE /api/artworks/<id>
#     -> soft delete / move to Trash
#
# POST   /api/artworks/<id>/restore
#     -> restore from Trash
#
# DELETE /api/artworks/<id>/permanent
#     -> permanent DB + Cloudinary deletion
#
# =========================================================

artwork_bp = Blueprint(
    "artworks",
    __name__,
    url_prefix="/api/artworks",
)


# =========================================================
# CONSTANTS
# =========================================================

MAX_ARTWORK_SIZE = (
    10 * 1024 * 1024
)

MAX_DESCRIPTION_LENGTH = (
    5000
)

MAX_TITLE_LENGTH = (
    200
)

MAX_CATEGORY_LENGTH = (
    80
)

MAX_FILENAME_LENGTH = (
    255
)


ALLOWED_IMAGE_FORMATS = {
    "JPEG":
        "image/jpeg",

    "PNG":
        "image/png",

    "WEBP":
        "image/webp",
}


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


ALLOWED_LANGUAGES = {
    "bn",
    "en",
    "hi",
    "as",
    "or",
    "ta",
    "te",
}


ALLOWED_VISIBILITIES = {
    "public",
    "unlisted",
}


# Status values accepted when initially
# creating an artwork.
CREATE_STATUSES = {
    "draft",
    "published",
}


# All internal artwork statuses.
ARTWORK_STATUSES = {
    "draft",
    "published",
    "deleted",
}


# =========================================================
# CURRENT UTC TIME
# =========================================================

def utc_now():

    return datetime.now(
        timezone.utc
    )


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user_id():
    """
    Convert JWT identity into an integer user ID.

    With @jwt_required(optional=True), a missing JWT
    simply returns None.
    """

    identity = (
        get_jwt_identity()
    )


    if identity is None:

        return None


    try:

        return int(
            identity
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


# =========================================================
# BOOLEAN PARSER
# =========================================================

def parse_boolean(
    value,
    default=False,
):
    """
    Convert common HTML form values into bool.
    """

    if value is None:

        return default


    if isinstance(
        value,
        bool,
    ):

        return value


    normalized = (
        str(value)
        .strip()
        .lower()
    )


    if normalized in {
        "true",
        "1",
        "yes",
        "on",
    }:

        return True


    if normalized in {
        "false",
        "0",
        "no",
        "off",
    }:

        return False


    return default


# =========================================================
# FILE EXTENSION
# =========================================================

def get_extension(
    filename,
):

    if not filename:

        return ""


    dot_index = (
        filename.rfind(".")
    )


    if dot_index == -1:

        return ""


    return (
        filename[
            dot_index:
        ]
        .lower()
    )


# =========================================================
# ARTWORK INSPECTION
# =========================================================

def inspect_artwork(
    file_bytes,
):
    """
    Validate image bytes and return normalized metadata.
    """

    if not file_bytes:

        raise ValueError(
            "Artwork file is empty."
        )


    try:

        image = Image.open(
            io.BytesIO(
                file_bytes
            )
        )


        detected_format = (
            image.format
            or ""
        ).upper()


        width = (
            image.width
            or 0
        )


        height = (
            image.height
            or 0
        )


        image.verify()


    except UnidentifiedImageError as error:

        raise ValueError(
            "The uploaded file is not a valid image."
        ) from error


    except Exception as error:

        raise ValueError(
            "Unable to read the uploaded artwork."
        ) from error


    if (
        detected_format
        not in
        ALLOWED_IMAGE_FORMATS
    ):

        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP "
            "artwork files are supported."
        )


    if (
        width <= 0
        or
        height <= 0
    ):

        raise ValueError(
            "Artwork dimensions are invalid."
        )


    return {

        "format":
            detected_format,

        "mime_type":
            ALLOWED_IMAGE_FORMATS[
                detected_format
            ],

        "width":
            width,

        "height":
            height,
    }


# =========================================================
# SERIALIZE ARTWORK
# =========================================================

def serialize_artwork(
    artwork,
):

    return (
        artwork.to_dict()
    )


# =========================================================
# OWNER CHECK
# =========================================================

def verify_artwork_owner(
    artwork,
    user_id,
):
    """
    Return a Flask error response tuple when ownership
    validation fails.

    Otherwise return None.
    """

    if artwork is None:

        return (
            jsonify({
                "message":
                    "Artwork not found."
            }),
            404,
        )


    if (
        str(
            artwork.user_id
        )
        !=
        str(
            user_id
        )
    ):

        return (
            jsonify({
                "message":
                    "You do not have permission "
                    "to modify this artwork."
            }),
            403,
        )


    return None


# =========================================================
# ARTWORK ACCESS CHECK
# =========================================================

def can_view_artwork(
    artwork,
    user_id=None,
):
    """
    Owner may view their own:
    - draft
    - published
    - deleted artwork

    Everyone else may only see:
    - published
    - public/unlisted artwork
    """

    if (
        user_id is not None
        and
        str(
            artwork.user_id
        )
        ==
        str(
            user_id
        )
    ):

        return True


    if (
        artwork.status
        !=
        "published"
    ):

        return False


    return (
        artwork.visibility
        in {
            "public",
            "unlisted",
        }
    )


# =========================================================
# CREATE ARTWORK
# =========================================================
#
# POST /api/artworks
#
# multipart/form-data:
#
# artwork
# title
# description
# category
# language
# visibility
# allow_download
# status
#
# =========================================================

@artwork_bp.route(
    "",
    methods=[
        "POST",
    ],
)
@jwt_required()
def create_artwork():

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid user identity."
        }), 401


    # =====================================================
    # FILE
    # =====================================================

    uploaded_file = (
        request.files.get(
            "artwork"
        )
    )


    if uploaded_file is None:

        return jsonify({
            "message":
                "Artwork image is required."
        }), 400


    original_filename = (
        uploaded_file.filename
        or ""
    ).strip()


    if not original_filename:

        return jsonify({
            "message":
                "Artwork filename is required."
        }), 400


    if (
        len(
            original_filename
        )
        >
        MAX_FILENAME_LENGTH
    ):

        return jsonify({
            "message":
                "Artwork filename cannot exceed "
                "255 characters."
        }), 400


    extension = (
        get_extension(
            original_filename
        )
    )


    if (
        extension
        not in
        ALLOWED_EXTENSIONS
    ):

        return jsonify({
            "message":
                "Only JPG, JPEG, PNG and WEBP "
                "files are supported."
        }), 400


    # =====================================================
    # READ IMAGE
    # =====================================================

    try:

        file_bytes = (
            uploaded_file.read(
                MAX_ARTWORK_SIZE + 1
            )
        )


    except Exception as error:

        print(
            "ARTWORK FILE READ ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "message":
                "Unable to read artwork file."
        }), 400


    if not file_bytes:

        return jsonify({
            "message":
                "Artwork file is empty."
        }), 400


    if (
        len(
            file_bytes
        )
        >
        MAX_ARTWORK_SIZE
    ):

        return jsonify({
            "message":
                "Artwork size cannot exceed 10 MB."
        }), 413


    # =====================================================
    # VALIDATE IMAGE CONTENT
    # =====================================================

    try:

        image_info = (
            inspect_artwork(
                file_bytes
            )
        )


    except ValueError as error:

        return jsonify({
            "message":
                str(
                    error
                )
        }), 400


    # =====================================================
    # FORM FIELDS
    # =====================================================

    title = (
        request.form.get(
            "title",
            "",
        )
        .strip()
    )


    description = (
        request.form.get(
            "description",
            "",
        )
        .strip()
    )


    category = (
        request.form.get(
            "category",
            "অন্যান্য",
        )
        .strip()
        or
        "অন্যান্য"
    )


    language = (
        request.form.get(
            "language",
            "bn",
        )
        .strip()
        .lower()
    )


    visibility = (
        request.form.get(
            "visibility",
            "public",
        )
        .strip()
        .lower()
    )


    status = (
        request.form.get(
            "status",
            "published",
        )
        .strip()
        .lower()
    )


    allow_download = (
        parse_boolean(
            request.form.get(
                "allow_download"
            ),
            default=True,
        )
    )


    # =====================================================
    # FIELD VALIDATION
    # =====================================================

    if not title:

        return jsonify({
            "message":
                "Artwork title is required."
        }), 400


    if (
        len(
            title
        )
        >
        MAX_TITLE_LENGTH
    ):

        return jsonify({
            "message":
                "Artwork title cannot exceed "
                "200 characters."
        }), 400


    if (
        len(
            description
        )
        >
        MAX_DESCRIPTION_LENGTH
    ):

        return jsonify({
            "message":
                "Artwork description cannot exceed "
                "5000 characters."
        }), 400


    if (
        len(
            category
        )
        >
        MAX_CATEGORY_LENGTH
    ):

        return jsonify({
            "message":
                "Artwork category cannot exceed "
                "80 characters."
        }), 400


    if (
        language
        not in
        ALLOWED_LANGUAGES
    ):

        return jsonify({
            "message":
                "Unsupported artwork language."
        }), 400


    if (
        visibility
        not in
        ALLOWED_VISIBILITIES
    ):

        return jsonify({
            "message":
                "Visibility must be public "
                "or unlisted."
        }), 400


    if (
        status
        not in
        CREATE_STATUSES
    ):

        return jsonify({
            "message":
                "Status must be draft "
                "or published."
        }), 400


    # =====================================================
    # CLOUDINARY UPLOAD
    # =====================================================

    storage_result = None


    try:

        storage_result = (
            upload_artwork(
                file_bytes
            )
        )


        if not isinstance(
            storage_result,
            dict,
        ):

            raise RuntimeError(
                "Artwork storage returned "
                "an invalid response."
            )


    except Exception as error:

        print(
            "ARTWORK CLOUDINARY UPLOAD ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "message":
                "Unable to upload artwork image."
        }), 500


    public_id = (
        storage_result.get(
            "public_id"
        )
    )


    image_url = (
        storage_result.get(
            "image_url"
        )
    )


    if not public_id:

        return jsonify({
            "message":
                "Artwork storage did not return "
                "a public ID."
        }), 500


    if not image_url:

        # Prevent orphaned Cloudinary upload.

        try:

            delete_artwork(
                public_id
            )

        except Exception as cleanup_error:

            print(
                "ARTWORK INVALID URL CLEANUP ERROR:",
                repr(
                    cleanup_error
                ),
            )


        return jsonify({
            "message":
                "Artwork storage returned "
                "an invalid image URL."
        }), 500


    # =====================================================
    # PUBLISHING TIME
    # =====================================================

    published_at = (
        utc_now()
        if status ==
        "published"
        else None
    )


    # =====================================================
    # DATABASE RECORD
    # =====================================================

    artwork = Artwork(

        user_id=
            user_id,

        title=
            title,

        description=(
            description
            or None
        ),

        category=
            category,

        language=
            language,

        original_filename=
            original_filename,

        image_url=
            image_url,

        storage_public_id=
            public_id,

        mime_type=
            image_info[
                "mime_type"
            ],

        file_size=
            len(
                file_bytes
            ),

        width=(
            storage_result.get(
                "width"
            )
            or
            image_info[
                "width"
            ]
        ),

        height=(
            storage_result.get(
                "height"
            )
            or
            image_info[
                "height"
            ]
        ),

        allow_download=
            allow_download,

        visibility=
            visibility,

        status=
            status,

        previous_status=
            None,

        deleted_at=
            None,

        published_at=
            published_at,
    )


    try:

        db.session.add(
            artwork
        )


        db.session.commit()


        db.session.refresh(
            artwork
        )


    except Exception as error:

        db.session.rollback()


        print(
            "ARTWORK DATABASE ERROR:",
            repr(
                error
            ),
        )


        # Cloudinary upload succeeded,
        # DB insertion failed.
        #
        # Remove orphaned Cloudinary image.

        if public_id:

            try:

                delete_artwork(
                    public_id
                )


            except Exception as cleanup_error:

                print(
                    "ARTWORK CLOUDINARY CLEANUP ERROR:",
                    repr(
                        cleanup_error
                    ),
                )


        return jsonify({
            "message":
                "Unable to save artwork."
        }), 500


    return jsonify({

        "message":
            (
                "Artwork published successfully."
                if status ==
                "published"
                else
                "Artwork saved as draft."
            ),

        "artwork":
            serialize_artwork(
                artwork
            ),

    }), 201


# =========================================================
# PUBLIC ARTWORK LIST
# =========================================================
#
# GET /api/artworks
#
# Query parameters:
#
# page
# limit
# per_page
# language
# category
#
# Only published + public artwork is returned.
#
# Deleted artwork can never appear publicly.
#
# =========================================================

@artwork_bp.route(
    "",
    methods=[
        "GET",
    ],
)
def get_artworks():

    # =====================================================
    # PAGE
    # =====================================================

    try:

        page = max(
            int(
                request.args.get(
                    "page",
                    1,
                )
            ),
            1,
        )


    except (
        TypeError,
        ValueError,
    ):

        page = 1


    # =====================================================
    # LIMIT
    # =====================================================
    #
    # Frontend currently uses `limit`.
    # Older code may use `per_page`.
    #
    # Support both.
    #
    # =====================================================

    raw_limit = (
        request.args.get(
            "limit"
        )
        or
        request.args.get(
            "per_page"
        )
        or
        12
    )


    try:

        per_page = (
            int(
                raw_limit
            )
        )


    except (
        TypeError,
        ValueError,
    ):

        per_page = 12


    per_page = min(
        max(
            per_page,
            1,
        ),
        50,
    )


    # =====================================================
    # FILTERS
    # =====================================================

    language = (
        request.args.get(
            "language",
            "",
        )
        .strip()
        .lower()
    )


    category = (
        request.args.get(
            "category",
            "",
        )
        .strip()
    )


    if (
        language
        and
        language
        not in
        ALLOWED_LANGUAGES
    ):

        return jsonify({
            "message":
                "Unsupported artwork language."
        }), 400


    # =====================================================
    # QUERY
    # =====================================================

    query = (
        Artwork.query
        .filter(
            Artwork.status
            ==
            "published",

            Artwork.visibility
            ==
            "public",
        )
    )


    if language:

        query = (
            query.filter(
                Artwork.language
                ==
                language
            )
        )


    if category:

        query = (
            query.filter(
                Artwork.category
                ==
                category
            )
        )


    query = (
        query.order_by(
            Artwork.published_at.desc(),
            Artwork.created_at.desc(),
        )
    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                per_page,

            error_out=
                False,
        )
    )


    return jsonify({

        "artworks": [

            serialize_artwork(
                artwork
            )

            for artwork
            in pagination.items
        ],


        "pagination": {

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "per_page":
                pagination.per_page,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },

    }), 200


# =========================================================
# CURRENT USER ARTWORKS
# =========================================================
#
# GET /api/artworks/mine
#
# Supported status filters:
#
# ?status=active
# ?status=published
# ?status=draft
# ?status=deleted
# ?status=all
#
# Default:
#
# active = draft + published
#
# =========================================================

@artwork_bp.route(
    "/mine",
    methods=[
        "GET",
    ],
)
@jwt_required()
def get_my_artworks():

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid user identity."
        }), 401


    # =====================================================
    # STATUS FILTER
    # =====================================================

    status = (
        request.args.get(
            "status",
            "active",
        )
        or
        "active"
    ).strip().lower()


    allowed_filters = {
        "active",
        "all",
        "draft",
        "published",
        "deleted",
    }


    if (
        status
        not in
        allowed_filters
    ):

        return jsonify({
            "message":
                "Invalid artwork status filter."
        }), 400


    # =====================================================
    # PAGE
    # =====================================================

    try:

        page = max(
            int(
                request.args.get(
                    "page",
                    1,
                )
            ),
            1,
        )


    except (
        TypeError,
        ValueError,
    ):

        page = 1


    # =====================================================
    # LIMIT
    # =====================================================

    raw_limit = (
        request.args.get(
            "limit"
        )
        or
        request.args.get(
            "per_page"
        )
        or
        50
    )


    try:

        per_page = int(
            raw_limit
        )


    except (
        TypeError,
        ValueError,
    ):

        per_page = 50


    per_page = min(
        max(
            per_page,
            1,
        ),
        100,
    )


    # =====================================================
    # OWNER QUERY
    # =====================================================

    query = (
        Artwork.query
        .filter(
            Artwork.user_id
            ==
            user_id
        )
    )


    # =====================================================
    # STATUS QUERY
    # =====================================================

    if (
        status ==
        "active"
    ):

        query = (
            query.filter(
                Artwork.status.in_({
                    "draft",
                    "published",
                })
            )
        )


    elif (
        status !=
        "all"
    ):

        query = (
            query.filter(
                Artwork.status
                ==
                status
            )
        )


    # =====================================================
    # SORT
    # =====================================================

    if (
        status ==
        "deleted"
    ):

        query = (
            query.order_by(
                Artwork.deleted_at.desc(),
                Artwork.updated_at.desc(),
            )
        )


    else:

        query = (
            query.order_by(
                Artwork.updated_at.desc(),
                Artwork.created_at.desc(),
            )
        )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                per_page,

            error_out=
                False,
        )
    )


    return jsonify({

        "artworks": [

            serialize_artwork(
                artwork
            )

            for artwork
            in pagination.items
        ],


        "pagination": {

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "per_page":
                pagination.per_page,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },

    }), 200


# =========================================================
# SINGLE ARTWORK
# =========================================================
#
# GET /api/artworks/<id>
#
# Owner:
# can view own draft/published/deleted item.
#
# Everyone else:
# published + public/unlisted only.
#
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>",
    methods=[
        "GET",
    ],
)
@jwt_required(
    optional=True
)
def get_artwork(
    artwork_id,
):

    artwork = (
        db.session.get(
            Artwork,
            artwork_id,
        )
    )


    if artwork is None:

        return jsonify({
            "message":
                "Artwork not found."
        }), 404


    user_id = (
        get_current_user_id()
    )


    if not can_view_artwork(
        artwork,
        user_id,
    ):

        return jsonify({
            "message":
                "Artwork not found."
        }), 404


    return jsonify({

        "artwork":
            serialize_artwork(
                artwork
            ),

    }), 200


# =========================================================
# SOFT DELETE ARTWORK
# =========================================================
#
# DELETE /api/artworks/<id>
#
# Moves artwork to Trash.
#
# IMPORTANT:
#
# This endpoint DOES NOT delete:
#
# - database row
# - Cloudinary image
# - storage_public_id
# - image_url
#
# Those are retained so the artwork can be restored.
#
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def soft_delete_artwork(
    artwork_id,
):

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid user identity."
        }), 401


    artwork = (
        db.session.get(
            Artwork,
            artwork_id,
        )
    )


    owner_error = (
        verify_artwork_owner(
            artwork,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        artwork.status
        ==
        "deleted"
    ):

        return jsonify({
            "message":
                "Artwork is already in Trash."
        }), 400


    try:

        # =================================================
        # SAVE ORIGINAL STATUS
        # =================================================

        artwork.previous_status = (
            artwork.status

            if artwork.status
            in {
                "draft",
                "published",
            }

            else "draft"
        )


        # =================================================
        # SOFT DELETE
        # =================================================

        artwork.status = (
            "deleted"
        )


        artwork.deleted_at = (
            utc_now()
        )


        # Keep:
        #
        # published_at
        # image_url
        # storage_public_id
        #
        # because Restore needs them.


        db.session.commit()


        db.session.refresh(
            artwork
        )


        return jsonify({

            "message":
                "Artwork moved to Trash successfully.",

            "artwork":
                serialize_artwork(
                    artwork
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "SOFT DELETE ARTWORK ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "message":
                "Unable to move artwork to Trash."
        }), 500


# =========================================================
# RESTORE ARTWORK
# =========================================================
#
# POST /api/artworks/<id>/restore
#
# published
#    ↓
# deleted
#    ↓ restore
# published
#
# draft
#    ↓
# deleted
#    ↓ restore
# draft
#
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>/restore",
    methods=[
        "POST",
    ],
)
@jwt_required()
def restore_artwork(
    artwork_id,
):

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid user identity."
        }), 401


    artwork = (
        db.session.get(
            Artwork,
            artwork_id,
        )
    )


    owner_error = (
        verify_artwork_owner(
            artwork,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        artwork.status
        !=
        "deleted"
    ):

        return jsonify({
            "message":
                "This artwork is not in Trash."
        }), 400


    # =====================================================
    # DETERMINE RESTORE STATUS
    # =====================================================

    restore_status = (
        artwork.previous_status

        if artwork.previous_status
        in {
            "draft",
            "published",
        }

        else "draft"
    )


    try:

        artwork.status = (
            restore_status
        )


        artwork.previous_status = (
            None
        )


        artwork.deleted_at = (
            None
        )


        # =================================================
        # PUBLISHED RESTORE
        # =================================================

        if (
            restore_status
            ==
            "published"
        ):

            if (
                artwork.published_at
                is None
            ):

                artwork.published_at = (
                    utc_now()
                )


        # =================================================
        # DRAFT RESTORE
        # =================================================

        elif (
            restore_status
            ==
            "draft"
        ):

            artwork.published_at = (
                None
            )


        db.session.commit()


        db.session.refresh(
            artwork
        )


        return jsonify({

            "message":
                "Artwork restored successfully.",

            "restored_status":
                restore_status,

            "artwork":
                serialize_artwork(
                    artwork
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "RESTORE ARTWORK ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "message":
                "Unable to restore artwork."
        }), 500


# =========================================================
# PERMANENT DELETE ARTWORK
# =========================================================
#
# DELETE /api/artworks/<id>/permanent
#
# Only artwork already in Trash may be permanently deleted.
#
# Steps:
#
# 1. Validate owner
# 2. Validate status == deleted
# 3. Save Cloudinary public ID
# 4. Delete database row
# 5. Commit database transaction
# 6. Delete Cloudinary image
#
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>/permanent",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def permanently_delete_artwork(
    artwork_id,
):

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid user identity."
        }), 401


    artwork = (
        db.session.get(
            Artwork,
            artwork_id,
        )
    )


    owner_error = (
        verify_artwork_owner(
            artwork,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        artwork.status
        !=
        "deleted"
    ):

        return jsonify({
            "message":
                (
                    "Only artwork in Trash "
                    "can be permanently deleted."
                )
        }), 400


    storage_public_id = (
        artwork.storage_public_id
    )


    # =====================================================
    # DATABASE DELETE
    # =====================================================

    try:

        db.session.delete(
            artwork
        )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "PERMANENT ARTWORK DELETE "
            "DATABASE ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "message":
                "Unable to permanently delete artwork."
        }), 500


    # =====================================================
    # CLOUDINARY DELETE
    # =====================================================

    storage_deleted = (
        True
    )


    if storage_public_id:

        try:

            delete_artwork(
                storage_public_id
            )


        except Exception as error:

            storage_deleted = (
                False
            )


            print(
                "PERMANENT ARTWORK "
                "CLOUDINARY DELETE ERROR:",
                repr(
                    error
                ),
            )


    return jsonify({

        "message":
            "Artwork permanently deleted.",

        "storage_deleted":
            storage_deleted,

    }), 200