import io
from datetime import datetime, timezone

from flask import (
    Blueprint,
    jsonify,
    request,
)
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from PIL import Image, UnidentifiedImageError

from database import db
from models.artwork import Artwork
from services.artwork_storage import (
    delete_artwork,
    upload_artwork,
)


# =========================================================
# BLUEPRINT
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

MAX_DESCRIPTION_LENGTH = 5000

MAX_TITLE_LENGTH = 200

MAX_CATEGORY_LENGTH = 80


ALLOWED_IMAGE_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
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


ALLOWED_STATUSES = {
    "draft",
    "published",
}


# =========================================================
# HELPERS
# =========================================================

def get_current_user_id():
    """
    Convert JWT identity into an integer user ID.
    """

    identity = (
        get_jwt_identity()
    )

    try:
        return int(identity)

    except (
        TypeError,
        ValueError,
    ):
        return None


def parse_boolean(
    value,
    default=False,
):
    """
    Convert common form values to bool.
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

    return normalized in {
        "true",
        "1",
        "yes",
        "on",
    }


def get_extension(
    filename,
):
    """
    Return lowercase extension,
    including the leading dot.
    """

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


def inspect_artwork(
    file_bytes,
):
    """
    Validate image bytes and return
    normalized artwork information.
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
            image.format or ""
        ).upper()

        width = (
            image.width or 0
        )

        height = (
            image.height or 0
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
        detected_format not in
        ALLOWED_IMAGE_FORMATS
    ):
        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP "
            "artwork files are supported."
        )


    if (
        width <= 0 or
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


def serialize_artwork(
    artwork,
):
    """
    Serialize one Artwork model.
    """

    return (
        artwork.to_dict()
    )


# =========================================================
# CREATE ARTWORK
# =========================================================

@artwork_bp.route(
    "",
    methods=[
        "POST",
    ],
)
@jwt_required()
def create_artwork():

    user_id = (
        get_current_user_id()
    )

    if not user_id:
        return jsonify({
            "message":
                "Invalid user identity.",
        }), 401


    # =====================================================
    # FILE
    # =====================================================

    uploaded_file = (
        request.files.get(
            "artwork"
        )
    )

    if not uploaded_file:
        return jsonify({
            "message":
                "Artwork image is required.",
        }), 400


    original_filename = (
        uploaded_file.filename
        or ""
    ).strip()


    if not original_filename:
        return jsonify({
            "message":
                "Artwork filename is required.",
        }), 400


    extension = (
        get_extension(
            original_filename
        )
    )


    if (
        extension not in
        ALLOWED_EXTENSIONS
    ):
        return jsonify({
            "message":
                "Only JPG, JPEG, PNG and WEBP "
                "files are supported.",
        }), 400


    try:
        file_bytes = (
            uploaded_file.read()
        )

    except Exception:
        return jsonify({
            "message":
                "Unable to read artwork file.",
        }), 400


    if not file_bytes:
        return jsonify({
            "message":
                "Artwork file is empty.",
        }), 400


    if (
        len(file_bytes) >
        MAX_ARTWORK_SIZE
    ):
        return jsonify({
            "message":
                "Artwork size cannot exceed 10 MB.",
        }), 400


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
                str(error),
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
        or "অন্যান্য"
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
                "Artwork title is required.",
        }), 400


    if (
        len(title) >
        MAX_TITLE_LENGTH
    ):
        return jsonify({
            "message":
                "Artwork title cannot exceed "
                "200 characters.",
        }), 400


    if (
        len(description) >
        MAX_DESCRIPTION_LENGTH
    ):
        return jsonify({
            "message":
                "Artwork description cannot exceed "
                "5000 characters.",
        }), 400


    if (
        len(category) >
        MAX_CATEGORY_LENGTH
    ):
        return jsonify({
            "message":
                "Artwork category cannot exceed "
                "80 characters.",
        }), 400


    if (
        language not in
        ALLOWED_LANGUAGES
    ):
        return jsonify({
            "message":
                "Unsupported artwork language.",
        }), 400


    if (
        visibility not in
        ALLOWED_VISIBILITIES
    ):
        return jsonify({
            "message":
                "Visibility must be public "
                "or unlisted.",
        }), 400


    if (
        status not in
        ALLOWED_STATUSES
    ):
        return jsonify({
            "message":
                "Status must be draft "
                "or published.",
        }), 400


    # =====================================================
    # CLOUDINARY UPLOAD
    # =====================================================

    try:
        storage_result = (
            upload_artwork(
                file_bytes
            )
        )

    except Exception as error:

        print(
            "ARTWORK CLOUDINARY UPLOAD ERROR:",
            repr(error),
        )

        return jsonify({
            "message":
                "Unable to upload artwork image.",
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


    if not image_url:

        if public_id:
            try:
                delete_artwork(
                    public_id
                )
            except Exception:
                pass

        return jsonify({
            "message":
                "Artwork storage returned "
                "an invalid image URL.",
        }), 500


    # =====================================================
    # DATABASE RECORD
    # =====================================================

    published_at = None

    if (
        status ==
        "published"
    ):
        published_at = (
            datetime.now(
                timezone.utc
            )
        )


    artwork = Artwork(

        user_id=
            user_id,

        title=
            title,

        description=
            description or None,

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
            len(file_bytes),

        width=
            storage_result.get(
                "width"
            )
            or image_info[
                "width"
            ],

        height=
            storage_result.get(
                "height"
            )
            or image_info[
                "height"
            ],

        allow_download=
            allow_download,

        visibility=
            visibility,

        status=
            status,

        published_at=
            published_at,
    )


    try:
        db.session.add(
            artwork
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "ARTWORK DATABASE ERROR:",
            repr(error),
        )


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
                "Unable to save artwork.",
        }), 500


    return jsonify({
        "message":
            (
                "Artwork published successfully."
                if status == "published"
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

@artwork_bp.route(
    "",
    methods=[
        "GET",
    ],
)
def get_artworks():

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


    try:
        per_page = int(
            request.args.get(
                "per_page",
                12,
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


    query = (
        Artwork.query
        .filter(
            Artwork.status ==
            "published",
            Artwork.visibility ==
            "public",
        )
        .order_by(
            Artwork.created_at.desc()
        )
    )


    pagination = (
        query.paginate(
            page=page,
            per_page=per_page,
            error_out=False,
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

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },
    }), 200


# =========================================================
# CURRENT USER ARTWORKS
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

    if not user_id:
        return jsonify({
            "message":
                "Invalid user identity.",
        }), 401


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


    try:
        per_page = int(
            request.args.get(
                "per_page",
                20,
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        per_page = 20


    per_page = min(
        max(
            per_page,
            1,
        ),
        50,
    )


    query = (
        Artwork.query
        .filter_by(
            user_id=
                user_id
        )
        .order_by(
            Artwork.created_at.desc()
        )
    )


    pagination = (
        query.paginate(
            page=page,
            per_page=per_page,
            error_out=False,
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

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },
    }), 200


# =========================================================
# SINGLE PUBLIC ARTWORK
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>",
    methods=[
        "GET",
    ],
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


    if not artwork:
        return jsonify({
            "message":
                "Artwork not found.",
        }), 404


    if (
        artwork.status !=
        "published"
    ):
        return jsonify({
            "message":
                "Artwork not found.",
        }), 404


    if (
        artwork.visibility
        not in {
            "public",
            "unlisted",
        }
    ):
        return jsonify({
            "message":
                "Artwork not found.",
        }), 404


    return jsonify({
        "artwork":
            serialize_artwork(
                artwork
            ),
    }), 200


# =========================================================
# DELETE ARTWORK
# =========================================================

@artwork_bp.route(
    "/<int:artwork_id>",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def remove_artwork(
    artwork_id,
):

    user_id = (
        get_current_user_id()
    )

    if not user_id:
        return jsonify({
            "message":
                "Invalid user identity.",
        }), 401


    artwork = (
        db.session.get(
            Artwork,
            artwork_id,
        )
    )


    if not artwork:
        return jsonify({
            "message":
                "Artwork not found.",
        }), 404


    if (
        artwork.user_id !=
        user_id
    ):
        return jsonify({
            "message":
                "You cannot delete this artwork.",
        }), 403


    storage_public_id = (
        artwork.storage_public_id
    )


    try:
        db.session.delete(
            artwork
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "ARTWORK DELETE DATABASE ERROR:",
            repr(error),
        )

        return jsonify({
            "message":
                "Unable to delete artwork.",
        }), 500


    # Cloudinary cleanup is intentionally
    # performed after the DB commit.
    #
    # A Cloudinary failure should not restore
    # a database record that the user deleted.

    if storage_public_id:

        try:
            delete_artwork(
                storage_public_id
            )

        except Exception as error:

            print(
                "ARTWORK CLOUDINARY DELETE ERROR:",
                repr(error),
            )


    return jsonify({
        "message":
            "Artwork deleted successfully.",
    }), 200