import os
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

from database import db

from models.video import Video

from services.video_storage import (
    delete_video,
    upload_video,
)


# =========================================================
# BLUEPRINT
# =========================================================

video_bp = Blueprint(
    "videos",
    __name__,
    url_prefix="/api/videos",
)


# =========================================================
# CONSTANTS
# =========================================================

MAX_VIDEO_SIZE = (
    100 * 1024 * 1024
)


MAX_TITLE_LENGTH = 200

MAX_DESCRIPTION_LENGTH = 5000

MAX_CATEGORY_LENGTH = 80


ALLOWED_VIDEO_EXTENSIONS = {
    ".mp4",
    ".webm",
    ".mov",
    ".m4v",
}


ALLOWED_VIDEO_MIME_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
    "application/octet-stream",
}


ALLOWED_LANGUAGES = {
    "bn",
    "en",
    "hi",
    "as",
    "or",
    "mr",
    "gu",
    "pa",
    "ta",
    "te",
    "kn",
    "ml",
    "ur",
    "ne",
    "other",
}


ALLOWED_VISIBILITIES = {
    "public",
    "unlisted",
}


ALLOWED_STATUSES = {
    "draft",
    "published",
}


DEFAULT_PAGE_SIZE = 12

MAX_PAGE_SIZE = 50


# =========================================================
# HELPERS
# =========================================================

def utc_now():

    return datetime.now(
        timezone.utc
    )


def get_current_user_id():
    """
    Convert the JWT identity into
    an integer SHOBDO user ID.
    """

    identity = (
        get_jwt_identity()
    )

    try:

        return int(
            identity
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


def clean_text(
    value,
):

    if value is None:

        return ""

    return str(
        value
    ).strip()


def get_extension(
    filename,
):

    if not filename:

        return ""

    return (
        os.path.splitext(
            filename
        )[1]
        .lower()
        .strip()
    )


def parse_positive_float(
    value,
):

    if (
        value is None
        or value == ""
    ):

        return None

    try:

        result = float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return None

    if result < 0:

        return None

    return result


def parse_page_number(
    value,
    default,
):

    try:

        value = int(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return default

    if value < 1:

        return default

    return value


def serialize_video(
    video,
    include_owner=True,
):
    """
    Public/API representation
    of one video.
    """

    return video.to_dict(
        include_owner=
            include_owner
    )


def video_error(
    message,
    status_code=400,
    code=None,
):

    payload = {
        "success":
            False,

        "message":
            message,
    }

    if code:

        payload["code"] = (
            code
        )

    return jsonify(
        payload
    ), status_code


# =========================================================
# CREATE VIDEO
# =========================================================
#
# POST /api/videos
#
# multipart/form-data:
#
# video
# title
# description
# category
# language
# visibility
# status
# duration_seconds
#
# =========================================================

@video_bp.route(
    "",
    methods=[
        "POST",
    ],
)
@jwt_required()
def create_video():

    # =====================================================
    # USER
    # =====================================================

    user_id = (
        get_current_user_id()
    )

    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    # =====================================================
    # VIDEO FILE
    # =====================================================

    video_file = (
        request.files.get(
            "video"
        )
    )

    if not video_file:

        return video_error(
            "Video file is required.",
            400,
            "video_required",
        )


    filename = clean_text(
        video_file.filename
    )

    if not filename:

        return video_error(
            "Video filename is required.",
            400,
            "filename_required",
        )


    extension = (
        get_extension(
            filename
        )
    )


    if (
        extension
        not in
        ALLOWED_VIDEO_EXTENSIONS
    ):

        return video_error(
            (
                "Unsupported video format. "
                "Please upload MP4, WEBM, "
                "MOV or M4V."
            ),
            400,
            "unsupported_video_format",
        )


    mime_type = clean_text(
        video_file.mimetype
    ).lower()


    if (
        mime_type
        and
        mime_type
        not in
        ALLOWED_VIDEO_MIME_TYPES
    ):

        return video_error(
            (
                "Unsupported video content type."
            ),
            400,
            "unsupported_video_type",
        )


    # =====================================================
    # READ FILE
    # =====================================================

    try:

        file_bytes = (
            video_file.read()
        )

    except Exception as error:

        print(
            "VIDEO FILE READ ERROR:",
            repr(
                error
            ),
        )

        return video_error(
            "Unable to read the uploaded video.",
            400,
            "video_read_failed",
        )


    if not file_bytes:

        return video_error(
            "The selected video file is empty.",
            400,
            "empty_video",
        )


    file_size = len(
        file_bytes
    )


    if (
        file_size >
        MAX_VIDEO_SIZE
    ):

        return video_error(
            (
                "Video size cannot exceed "
                "100 MB."
            ),
            413,
            "video_too_large",
        )


    # =====================================================
    # FORM DATA
    # =====================================================

    title = clean_text(
        request.form.get(
            "title"
        )
    )

    description = clean_text(
        request.form.get(
            "description"
        )
    )

    category = clean_text(
        request.form.get(
            "category"
        )
    ) or "Other"

    language = clean_text(
        request.form.get(
            "language"
        )
    ) or "bn"

    visibility = clean_text(
        request.form.get(
            "visibility"
        )
    ) or "public"

    status = clean_text(
        request.form.get(
            "status"
        )
    ) or "published"

    duration_seconds = (
        parse_positive_float(
            request.form.get(
                "duration_seconds"
            )
        )
    )


    # =====================================================
    # TITLE VALIDATION
    # =====================================================

    if not title:

        return video_error(
            "Video title is required.",
            400,
            "title_required",
        )


    if (
        len(title) >
        MAX_TITLE_LENGTH
    ):

        return video_error(
            (
                "Video title cannot exceed "
                "200 characters."
            ),
            400,
            "title_too_long",
        )


    # =====================================================
    # DESCRIPTION VALIDATION
    # =====================================================

    if (
        len(description) >
        MAX_DESCRIPTION_LENGTH
    ):

        return video_error(
            (
                "Video description cannot exceed "
                "5000 characters."
            ),
            400,
            "description_too_long",
        )


    # =====================================================
    # CATEGORY VALIDATION
    # =====================================================

    if (
        len(category) >
        MAX_CATEGORY_LENGTH
    ):

        return video_error(
            (
                "Video category cannot exceed "
                "80 characters."
            ),
            400,
            "category_too_long",
        )


    # =====================================================
    # LANGUAGE
    # =====================================================

    if (
        language
        not in
        ALLOWED_LANGUAGES
    ):

        return video_error(
            "Unsupported video language.",
            400,
            "unsupported_language",
        )


    # =====================================================
    # VISIBILITY
    # =====================================================

    if (
        visibility
        not in
        ALLOWED_VISIBILITIES
    ):

        return video_error(
            "Invalid video visibility.",
            400,
            "invalid_visibility",
        )


    # =====================================================
    # STATUS
    # =====================================================

    if (
        status
        not in
        ALLOWED_STATUSES
    ):

        return video_error(
            "Invalid video status.",
            400,
            "invalid_status",
        )


    # =====================================================
    # STORAGE UPLOAD
    # =====================================================

    storage_result = None

    try:

        storage_result = (
            upload_video(
                file_bytes=
                    file_bytes,

                filename=
                    filename,

                content_type=
                    (
                        mime_type
                        or "video/mp4"
                    ),

                user_id=
                    user_id,
            )
        )

    except Exception as error:

        print(
            "VIDEO STORAGE UPLOAD ERROR:",
            repr(
                error
            ),
        )

        return video_error(
            (
                "Unable to upload the video. "
                "Please try again."
            ),
            500,
            "video_upload_failed",
        )


    if not isinstance(
        storage_result,
        dict,
    ):

        return video_error(
            (
                "Video storage returned "
                "an invalid response."
            ),
            500,
            "invalid_storage_response",
        )


    video_url = (
        storage_result.get(
            "video_url"
        )
        or
        storage_result.get(
            "secure_url"
        )
        or
        storage_result.get(
            "url"
        )
    )


    if not video_url:

        storage_public_id = (
            storage_result.get(
                "public_id"
            )
        )

        if storage_public_id:

            try:

                delete_video(
                    storage_public_id
                )

            except Exception:

                pass


        return video_error(
            (
                "Video storage did not return "
                "a playable video URL."
            ),
            500,
            "video_url_missing",
        )


    public_id = (
        storage_result.get(
            "public_id"
        )
    )


    thumbnail_url = (
        storage_result.get(
            "thumbnail_url"
        )
    )


    storage_duration = (
        parse_positive_float(
            storage_result.get(
                "duration"
            )
        )
    )


    if (
        storage_duration
        is not None
    ):

        duration_seconds = (
            storage_duration
        )


    width = (
        storage_result.get(
            "width"
        )
    )

    height = (
        storage_result.get(
            "height"
        )
    )


    try:

        width = (
            int(width)
            if width is not None
            else None
        )

    except (
        TypeError,
        ValueError,
    ):

        width = None


    try:

        height = (
            int(height)
            if height is not None
            else None
        )

    except (
        TypeError,
        ValueError,
    ):

        height = None


    # =====================================================
    # DATABASE OBJECT
    # =====================================================

    video = Video(

        user_id=
            user_id,

        title=
            title,

        description=
            description,

        category=
            category,

        language=
            language,

        video_url=
            video_url,

        thumbnail_url=
            thumbnail_url,

        public_id=
            public_id,

        original_filename=
            filename[:500],

        mime_type=
            mime_type[:100]
            if mime_type
            else None,

        file_size=
            file_size,

        duration_seconds=
            duration_seconds,

        width=
            width,

        height=
            height,

        status=
            status,

        visibility=
            visibility,

        published_at=
            (
                utc_now()
                if status ==
                "published"
                else None
            ),

    )


    # =====================================================
    # DATABASE SAVE
    # =====================================================

    try:

        db.session.add(
            video
        )

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "VIDEO DATABASE ERROR:",
            repr(
                error
            ),
        )


        if public_id:

            try:

                delete_video(
                    public_id
                )

            except Exception as cleanup_error:

                print(
                    (
                        "VIDEO STORAGE "
                        "CLEANUP ERROR:"
                    ),
                    repr(
                        cleanup_error
                    ),
                )


        return video_error(
            "Unable to save video.",
            500,
            "video_save_failed",
        )


    # =====================================================
    # RESPONSE
    # =====================================================

    message = (

        "Video published successfully."

        if status ==
        "published"

        else

        "Video saved as draft."
    )


    return jsonify({

        "success":
            True,

        "message":
            message,

        "video":
            serialize_video(
                video,
                include_owner=True,
            ),

    }), 201


# =========================================================
# PUBLIC VIDEO LIST
# =========================================================
#
# GET /api/videos
#
# /api/videos?page=1&limit=12
#
# =========================================================

@video_bp.route(
    "",
    methods=[
        "GET",
    ],
)
def get_videos():

    page = parse_page_number(
        request.args.get(
            "page"
        ),
        1,
    )

    limit = parse_page_number(
        request.args.get(
            "limit"
        ),
        DEFAULT_PAGE_SIZE,
    )


    limit = min(
        limit,
        MAX_PAGE_SIZE,
    )


    query = (

        Video.query

        .filter(
            Video.status ==
                "published",

            Video.visibility ==
                "public",
        )

        .order_by(
            Video.published_at.desc(),
            Video.created_at.desc(),
        )

    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    videos = [

        serialize_video(
            video,
            include_owner=True,
        )

        for video
        in pagination.items

    ]


    return jsonify({

        "success":
            True,

        "videos":
            videos,

        "items":
            videos,

        "page":
            pagination.page,

        "per_page":
            pagination.per_page,

        "total":
            pagination.total,

        "total_pages":
            pagination.pages,

        "has_more":
            pagination.has_next,

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
# CURRENT USER VIDEOS
# =========================================================
#
# GET /api/videos/mine
#
# =========================================================

@video_bp.route(
    "/mine",
    methods=[
        "GET",
    ],
)
@jwt_required()
def get_my_videos():

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    page = parse_page_number(
        request.args.get(
            "page"
        ),
        1,
    )

    limit = parse_page_number(
        request.args.get(
            "limit"
        ),
        DEFAULT_PAGE_SIZE,
    )


    limit = min(
        limit,
        MAX_PAGE_SIZE,
    )


    query = (

        Video.query

        .filter(
            Video.user_id ==
                user_id,

            Video.status !=
                "deleted",
        )

        .order_by(
            Video.created_at.desc()
        )

    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    videos = [

        serialize_video(
            video,
            include_owner=True,
        )

        for video
        in pagination.items

    ]


    return jsonify({

        "success":
            True,

        "videos":
            videos,

        "items":
            videos,

        "page":
            pagination.page,

        "per_page":
            pagination.per_page,

        "total":
            pagination.total,

        "total_pages":
            pagination.pages,

        "has_more":
            pagination.has_next,

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
# GET SINGLE VIDEO
# =========================================================
#
# GET /api/videos/<video_id>
#
# Published public + unlisted videos can be accessed here.
#
# =========================================================

@video_bp.route(
    "/<int:video_id>",
    methods=[
        "GET",
    ],
)
def get_video(
    video_id,
):

    video = (
        db.session.get(
            Video,
            video_id,
        )
    )


    if not video:

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    if (
        video.status !=
        "published"
    ):

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    return jsonify({

        "success":
            True,

        "video":
            serialize_video(
                video,
                include_owner=True,
            ),

    }), 200


# =========================================================
# VIDEO TRASH
# =========================================================
#
# GET /api/videos/trash
#
# Returns only soft-deleted videos belonging
# to the currently logged-in user.
#
# =========================================================

@video_bp.route(
    "/trash",
    methods=[
        "GET",
    ],
)
@jwt_required()
def get_video_trash():

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    page = parse_page_number(
        request.args.get(
            "page"
        ),
        1,
    )


    limit = parse_page_number(
        request.args.get(
            "limit"
        ),
        DEFAULT_PAGE_SIZE,
    )


    limit = min(
        limit,
        MAX_PAGE_SIZE,
    )


    query = (

        Video.query

        .filter(
            Video.user_id ==
                user_id,

            Video.status ==
                "deleted",
        )

        .order_by(
            Video.deleted_at.desc(),
            Video.created_at.desc(),
        )

    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    videos = [

        serialize_video(
            video,
            include_owner=True,
        )

        for video
        in pagination.items

    ]


    return jsonify({

        "success":
            True,

        "videos":
            videos,

        "items":
            videos,

        "page":
            pagination.page,

        "per_page":
            pagination.per_page,

        "total":
            pagination.total,

        "total_pages":
            pagination.pages,

        "has_more":
            pagination.has_next,

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
# MOVE VIDEO TO TRASH
# =========================================================
#
# DELETE /api/videos/<video_id>
#
# This is a SOFT DELETE.
#
# The database record and stored video remain available
# so the owner can restore the video later.
#
# =========================================================

@video_bp.route(
    "/<int:video_id>",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def remove_video(
    video_id,
):

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    video = (
        db.session.get(
            Video,
            video_id,
        )
    )


    if not video:

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    if (
        video.user_id !=
        user_id
    ):

        return video_error(
            (
                "You cannot delete "
                "this video."
            ),
            403,
            "video_delete_forbidden",
        )


    if (
        video.status ==
        "deleted"
    ):

        return video_error(
            "Video is already in Trash.",
            400,
            "video_already_deleted",
        )


    # =====================================================
    # SOFT DELETE
    # =====================================================

    try:

        moved = (
            video.move_to_trash()
        )


        if not moved:

            return video_error(
                "Video is already in Trash.",
                400,
                "video_already_deleted",
            )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "VIDEO SOFT DELETE ERROR:",
            repr(
                error
            ),
        )


        return video_error(
            (
                "Unable to move "
                "video to Trash."
            ),
            500,
            "video_soft_delete_failed",
        )


    return jsonify({

        "success":
            True,

        "message":
            (
                "Video moved to Trash "
                "successfully."
            ),

        "video":
            serialize_video(
                video,
                include_owner=True,
            ),

    }), 200


# =========================================================
# RESTORE VIDEO FROM TRASH
# =========================================================
#
# POST /api/videos/<video_id>/restore
#
# =========================================================

@video_bp.route(
    "/<int:video_id>/restore",
    methods=[
        "POST",
    ],
)
@jwt_required()
def restore_video(
    video_id,
):

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    video = (
        db.session.get(
            Video,
            video_id,
        )
    )


    if not video:

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    if (
        video.user_id !=
        user_id
    ):

        return video_error(
            (
                "You cannot restore "
                "this video."
            ),
            403,
            "video_restore_forbidden",
        )


    if (
        video.status !=
        "deleted"
    ):

        return video_error(
            (
                "This video is not "
                "in Trash."
            ),
            400,
            "video_not_deleted",
        )


    try:

        restored = (
            video.restore_from_trash()
        )


        if not restored:

            return video_error(
                (
                    "This video is not "
                    "in Trash."
                ),
                400,
                "video_not_deleted",
            )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "VIDEO RESTORE ERROR:",
            repr(
                error
            ),
        )


        return video_error(
            (
                "Unable to restore "
                "video."
            ),
            500,
            "video_restore_failed",
        )


    return jsonify({

        "success":
            True,

        "message":
            (
                "Video restored "
                "successfully."
            ),

        "video":
            serialize_video(
                video,
                include_owner=True,
            ),

    }), 200


# =========================================================
# PERMANENTLY DELETE VIDEO
# =========================================================
#
# DELETE /api/videos/<video_id>/permanent
#
# Only videos already in Trash may be permanently deleted.
#
# This removes:
#
# 1. The database record
# 2. The stored video asset
#
# =========================================================

@video_bp.route(
    "/<int:video_id>/permanent",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def permanently_delete_video(
    video_id,
):

    user_id = (
        get_current_user_id()
    )


    if not user_id:

        return video_error(
            "Invalid login session.",
            401,
            "invalid_identity",
        )


    video = (
        db.session.get(
            Video,
            video_id,
        )
    )


    if not video:

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    if (
        video.user_id !=
        user_id
    ):

        return video_error(
            (
                "You cannot permanently "
                "delete this video."
            ),
            403,
            "video_permanent_delete_forbidden",
        )


    if (
        video.status !=
        "deleted"
    ):

        return video_error(
            (
                "Move the video to Trash "
                "before deleting it permanently."
            ),
            400,
            "video_not_in_trash",
        )


    public_id = (
        video.public_id
    )


    # =====================================================
    # DELETE DATABASE RECORD
    # =====================================================

    try:

        db.session.delete(
            video
        )

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            (
                "VIDEO PERMANENT DELETE "
                "DATABASE ERROR:"
            ),
            repr(
                error
            ),
        )


        return video_error(
            (
                "Unable to permanently "
                "delete video."
            ),
            500,
            "video_permanent_delete_failed",
        )


    # =====================================================
    # STORAGE CLEANUP
    # =====================================================

    storage_cleanup_succeeded = (
        True
    )


    if public_id:

        try:

            delete_video(
                public_id
            )


        except Exception as error:

            storage_cleanup_succeeded = (
                False
            )


            print(
                (
                    "VIDEO STORAGE "
                    "DELETE ERROR:"
                ),
                repr(
                    error
                ),
            )


    return jsonify({

        "success":
            True,

        "message":
            (
                (
                    "Video permanently "
                    "deleted successfully."
                )

                if storage_cleanup_succeeded

                else
                (
                    "Video was permanently removed "
                    "from SHOBDO, but storage cleanup "
                    "did not complete successfully."
                )
            ),

        "storage_cleanup_succeeded":
            storage_cleanup_succeeded,

    }), 200


# =========================================================
# REGISTER VIDEO VIEW
# =========================================================
#
# POST /api/videos/<video_id>/view
#
# This is intentionally simple for the first version.
# Later we can add unique-view protection.
#
# =========================================================

@video_bp.route(
    "/<int:video_id>/view",
    methods=[
        "POST",
    ],
)
def register_video_view(
    video_id,
):

    video = (
        db.session.get(
            Video,
            video_id,
        )
    )


    if (
        not video
        or
        video.status !=
        "published"
    ):

        return video_error(
            "Video not found.",
            404,
            "video_not_found",
        )


    try:

        video.views_count = (
            int(
                video.views_count
                or 0
            )
            + 1
        )


        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "VIDEO VIEW ERROR:",
            repr(
                error
            ),
        )

        return video_error(
            (
                "Unable to register "
                "video view."
            ),
            500,
            "video_view_failed",
        )


    return jsonify({

        "success":
            True,

        "video_id":
            video.id,

        "views_count":
            video.views_count,

    }), 200