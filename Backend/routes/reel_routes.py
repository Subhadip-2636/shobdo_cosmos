# =========================================================
# SHOBDO REEL ROUTES
# =========================================================

from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from sqlalchemy import desc

from extensions import db

from models.reel import Reel


# =========================================================
# BLUEPRINT
# =========================================================

reel_bp = Blueprint(
    "reels",
    __name__,
    url_prefix="/api/reels",
)


# =========================================================
# CONSTANTS
# =========================================================

ALLOWED_VISIBILITIES = {
    "public",
    "followers",
    "private",
}


ALLOWED_LANGUAGES = {
    "bn",
    "hi",
    "en",
    "as",
    "or",
    "ta",
    "te",
}


DEFAULT_PAGE_SIZE = 10

MAX_PAGE_SIZE = 50


# =========================================================
# HELPERS
# =========================================================

def get_current_user_id():
    """
    Return JWT user ID as integer.

    SHOBDO JWT identity may arrive as either an integer
    or a numeric string.
    """

    identity = get_jwt_identity()


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


def clean_text(
    value,
    max_length=None,
):
    """
    Normalize optional user text.
    """

    if value is None:
        return None


    value = str(
        value
    ).strip()


    if not value:
        return None


    if (
        max_length
        and
        len(value) > max_length
    ):

        value = value[
            :max_length
        ]


    return value


# =========================================================


def parse_positive_integer(
    value,
    default,
    maximum=None,
):
    """
    Safely parse positive integer query parameters.
    """

    try:

        number = int(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        number = default


    if number < 1:

        number = default


    if (
        maximum is not None
        and
        number > maximum
    ):

        number = maximum


    return number


# =========================================================


def serialize_reel(
    reel,
):
    """
    Serialize a Reel model.

    Keeping serialization in one place makes it easy to
    extend later with creator, liked, saved and follow state.
    """

    data = reel.to_dict()


    data[
        "type"
    ] = "reel"


    return data


# =========================================================
# GET REELS FEED
# =========================================================

@reel_bp.route(
    "",
    methods=[
        "GET",
    ],
)
@reel_bp.route(
    "/",
    methods=[
        "GET",
    ],
)
def get_reels():
    """
    Public SHOBDO Reels feed.

    Query parameters:

        page
        per_page
        language
    """

    page = parse_positive_integer(
        request.args.get(
            "page"
        ),
        1,
    )


    per_page = parse_positive_integer(
        request.args.get(
            "per_page"
        ),
        DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE,
    )


    language = clean_text(
        request.args.get(
            "language"
        ),
        max_length=10,
    )


    query = Reel.query.filter(
        Reel.visibility == "public"
    )


    if language:

        query = query.filter(
            Reel.language == language
        )


    pagination = (
        query
        .order_by(
            desc(
                Reel.created_at
            ),
            desc(
                Reel.id
            ),
        )
        .paginate(
            page=page,
            per_page=per_page,
            error_out=False,
        )
    )


    reels = [

        serialize_reel(
            reel
        )

        for reel in pagination.items

    ]


    return jsonify({

        "success":
            True,

        "reels":
            reels,

        "pagination": {

            "page":
                pagination.page,

            "per_page":
                pagination.per_page,

            "total":
                pagination.total,

            "pages":
                pagination.pages,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,

        },

    }), 200


# =========================================================
# GET SINGLE REEL
# =========================================================

@reel_bp.route(
    "/<int:reel_id>",
    methods=[
        "GET",
    ],
)
def get_reel(
    reel_id,
):

    reel = db.session.get(
        Reel,
        reel_id,
    )


    if not reel:

        return jsonify({

            "success":
                False,

            "message":
                "Reel not found.",

        }), 404


    if (
        reel.visibility
        !=
        "public"
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Reel is not publicly available.",

        }), 403


    return jsonify({

        "success":
            True,

        "reel":
            serialize_reel(
                reel
            ),

    }), 200


# =========================================================
# CREATE REEL
# =========================================================

@reel_bp.route(
    "",
    methods=[
        "POST",
    ],
)
@reel_bp.route(
    "/",
    methods=[
        "POST",
    ],
)
@jwt_required()
def create_reel():
    """
    Create a Reel after the video has already been uploaded
    through SHOBDO's video-upload system.

    Expected JSON:

    {
        "video_url": "...",
        "thumbnail_url": "...",
        "caption": "...",
        "language": "bn",
        "duration_seconds": 20.5,
        "aspect_ratio": "9:16",
        "visibility": "public",
        "comments_enabled": true
    }
    """

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401


    data = (
        request.get_json(
            silent=True
        )
        or
        {}
    )


    # =====================================================
    # VIDEO URL
    # =====================================================

    video_url = clean_text(
        data.get(
            "video_url"
        )
    )


    if not video_url:

        return jsonify({

            "success":
                False,

            "message":
                "video_url is required.",

        }), 400


    # =====================================================
    # OPTIONAL METADATA
    # =====================================================

    thumbnail_url = clean_text(
        data.get(
            "thumbnail_url"
        )
    )


    caption = clean_text(
        data.get(
            "caption"
        ),
        max_length=5000,
    )


    language = (
        clean_text(
            data.get(
                "language"
            ),
            max_length=10,
        )
        or
        "bn"
    )


    language = (
        language.lower()
    )


    if (
        language
        not in ALLOWED_LANGUAGES
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Unsupported reel language.",

        }), 400


    visibility = (
        clean_text(
            data.get(
                "visibility"
            ),
            max_length=20,
        )
        or
        "public"
    )


    visibility = (
        visibility.lower()
    )


    if (
        visibility
        not in ALLOWED_VISIBILITIES
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "visibility must be "
                    "public, followers or private."
                ),

        }), 400


    aspect_ratio = (
        clean_text(
            data.get(
                "aspect_ratio"
            ),
            max_length=20,
        )
        or
        "9:16"
    )


    # =====================================================
    # DURATION
    # =====================================================

    duration_seconds = (
        data.get(
            "duration_seconds"
        )
    )


    if duration_seconds is not None:

        try:

            duration_seconds = float(
                duration_seconds
            )

        except (
            TypeError,
            ValueError,
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    (
                        "duration_seconds "
                        "must be a number."
                    ),

            }), 400


        if duration_seconds < 0:

            return jsonify({

                "success":
                    False,

                "message":
                    (
                        "duration_seconds "
                        "cannot be negative."
                    ),

            }), 400


    # =====================================================
    # COMMENTS
    # =====================================================

    comments_enabled = (
        data.get(
            "comments_enabled",
            True,
        )
    )


    if not isinstance(
        comments_enabled,
        bool,
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "comments_enabled "
                    "must be true or false."
                ),

        }), 400


    # =====================================================
    # CREATE DATABASE RECORD
    # =====================================================

    reel = Reel(

        user_id=
            user_id,

        video_url=
            video_url,

        thumbnail_url=
            thumbnail_url,

        caption=
            caption,

        language=
            language,

        duration_seconds=
            duration_seconds,

        aspect_ratio=
            aspect_ratio,

        visibility=
            visibility,

        comments_enabled=
            comments_enabled,

    )


    try:

        db.session.add(
            reel
        )

        db.session.commit()


    except Exception:

        db.session.rollback()

        raise


    return jsonify({

        "success":
            True,

        "message":
            "Reel created successfully.",

        "reel":
            serialize_reel(
                reel
            ),

    }), 201


# =========================================================
# UPDATE REEL
# =========================================================

@reel_bp.route(
    "/<int:reel_id>",
    methods=[
        "PATCH",
    ],
)
@jwt_required()
def update_reel(
    reel_id,
):

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401


    reel = db.session.get(
        Reel,
        reel_id,
    )


    if not reel:

        return jsonify({

            "success":
                False,

            "message":
                "Reel not found.",

        }), 404


    if (
        reel.user_id
        !=
        user_id
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "You cannot edit "
                    "this reel."
                ),

        }), 403


    data = (
        request.get_json(
            silent=True
        )
        or
        {}
    )


    # =====================================================
    # CAPTION
    # =====================================================

    if (
        "caption"
        in data
    ):

        reel.caption = clean_text(
            data.get(
                "caption"
            ),
            max_length=5000,
        )


    # =====================================================
    # THUMBNAIL
    # =====================================================

    if (
        "thumbnail_url"
        in data
    ):

        reel.thumbnail_url = clean_text(
            data.get(
                "thumbnail_url"
            )
        )


    # =====================================================
    # LANGUAGE
    # =====================================================

    if (
        "language"
        in data
    ):

        language = (
            clean_text(
                data.get(
                    "language"
                ),
                max_length=10,
            )
            or
            ""
        ).lower()


        if (
            language
            not in ALLOWED_LANGUAGES
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    "Unsupported reel language.",

            }), 400


        reel.language = (
            language
        )


    # =====================================================
    # VISIBILITY
    # =====================================================

    if (
        "visibility"
        in data
    ):

        visibility = (
            clean_text(
                data.get(
                    "visibility"
                ),
                max_length=20,
            )
            or
            ""
        ).lower()


        if (
            visibility
            not in ALLOWED_VISIBILITIES
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    (
                        "visibility must be "
                        "public, followers or private."
                    ),

            }), 400


        reel.visibility = (
            visibility
        )


    # =====================================================
    # COMMENTS SETTING
    # =====================================================

    if (
        "comments_enabled"
        in data
    ):

        comments_enabled = (
            data.get(
                "comments_enabled"
            )
        )


        if not isinstance(
            comments_enabled,
            bool,
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    (
                        "comments_enabled "
                        "must be true or false."
                    ),

            }), 400


        reel.comments_enabled = (
            comments_enabled
        )


    try:

        db.session.commit()


    except Exception:

        db.session.rollback()

        raise


    return jsonify({

        "success":
            True,

        "message":
            "Reel updated successfully.",

        "reel":
            serialize_reel(
                reel
            ),

    }), 200


# =========================================================
# DELETE REEL
# =========================================================

@reel_bp.route(
    "/<int:reel_id>",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def delete_reel(
    reel_id,
):

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401


    reel = db.session.get(
        Reel,
        reel_id,
    )


    if not reel:

        return jsonify({

            "success":
                False,

            "message":
                "Reel not found.",

        }), 404


    if (
        reel.user_id
        !=
        user_id
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "You cannot delete "
                    "this reel."
                ),

        }), 403


    try:

        db.session.delete(
            reel
        )

        db.session.commit()


    except Exception:

        db.session.rollback()

        raise


    return jsonify({

        "success":
            True,

        "message":
            "Reel deleted successfully.",

    }), 200


# =========================================================
# REGISTER REEL VIEW
# =========================================================

@reel_bp.route(
    "/<int:reel_id>/view",
    methods=[
        "POST",
    ],
)
def register_reel_view(
    reel_id,
):

    reel = db.session.get(
        Reel,
        reel_id,
    )


    if not reel:

        return jsonify({

            "success":
                False,

            "message":
                "Reel not found.",

        }), 404


    if (
        reel.visibility
        !=
        "public"
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Reel is not publicly available.",

        }), 403


    reel.views_count = (
        (
            reel.views_count
            or
            0
        )
        +
        1
    )


    try:

        db.session.commit()


    except Exception:

        db.session.rollback()

        raise


    return jsonify({

        "success":
            True,

        "views_count":
            reel.views_count,

    }), 200


# =========================================================
# GET CURRENT USER'S REELS
# =========================================================

@reel_bp.route(
    "/mine",
    methods=[
        "GET",
    ],
)
@jwt_required()
def get_my_reels():

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401


    page = parse_positive_integer(
        request.args.get(
            "page"
        ),
        1,
    )


    per_page = parse_positive_integer(
        request.args.get(
            "per_page"
        ),
        DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE,
    )


    pagination = (

        Reel.query

        .filter(
            Reel.user_id
            ==
            user_id
        )

        .order_by(
            desc(
                Reel.created_at
            ),
            desc(
                Reel.id
            ),
        )

        .paginate(
            page=page,
            per_page=per_page,
            error_out=False,
        )

    )


    return jsonify({

        "success":
            True,

        "reels": [

            serialize_reel(
                reel
            )

            for reel
            in pagination.items

        ],

        "pagination": {

            "page":
                pagination.page,

            "per_page":
                pagination.per_page,

            "total":
                pagination.total,

            "pages":
                pagination.pages,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,

        },

    }), 200