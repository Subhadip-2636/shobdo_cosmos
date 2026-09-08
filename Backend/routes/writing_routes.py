# =========================================================
# SHOBDO WRITING ROUTES
# =========================================================

from datetime import datetime, timezone
import io
import os
import shutil
from pathlib import Path

import pymupdf
import pytesseract

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
    ImageOps,
    UnidentifiedImageError,
)

from database import db

from models.writing import Writing
from models.comment import Comment
from models.like import Like


# =========================================================
# BLUEPRINT
# =========================================================

writings_bp = Blueprint(
    "writings",
    __name__,
)


# Compatibility alias if App.py imports writing_bp
writing_bp = writings_bp


# =========================================================
# CONSTANTS
# =========================================================

MAX_FILE_SIZE = (
    10 * 1024 * 1024
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}


OCR_LANGUAGE_MAP = {
    "bn": "ben",
    "en": "eng",
    "hi": "hin",
}


ALLOWED_WRITING_LANGUAGES = {
    "bn",
    "en",
    "hi",
}


ALLOWED_CATEGORIES = {
    "কবিতা",
    "গল্প",
    "অনুভূতি",
    "প্রবন্ধ",
    "অন্যান্য",
}


# Prevent extremely large PDFs from taking too long
MAX_PDF_PAGES = 30


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

def configure_tesseract():
    """
    Find the Windows Tesseract executable.

    Search order:
    1. TESSERACT_CMD environment variable
    2. Windows PATH
    3. Standard Program Files installation paths
    """

    environment_command = os.getenv(
        "TESSERACT_CMD"
    )


    if (
        environment_command
        and
        Path(
            environment_command
        ).is_file()
    ):

        pytesseract.pytesseract.tesseract_cmd = (
            environment_command
        )

        return


    path_command = shutil.which(
        "tesseract"
    )


    if path_command:

        pytesseract.pytesseract.tesseract_cmd = (
            path_command
        )

        return


    possible_locations = [
        Path(
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        ),
        Path(
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        ),
    ]


    for location in possible_locations:

        if location.is_file():

            pytesseract.pytesseract.tesseract_cmd = (
                str(location)
            )

            return


configure_tesseract()


# =========================================================
# GENERAL HELPERS
# =========================================================

def error_response(
    message,
    status_code=400,
):

    return (
        jsonify({
            "message": message,
        }),
        status_code,
    )


def get_current_user_id():

    identity = get_jwt_identity()


    try:

        return int(identity)

    except (
        TypeError,
        ValueError,
    ):

        return None


def get_model_item(
    model,
    item_id,
):

    return db.session.get(
        model,
        item_id,
    )


def get_author_name(
    user,
):

    if user is None:

        return "Unknown Author"


    return (
        getattr(
            user,
            "name",
            None,
        )
        or
        getattr(
            user,
            "username",
            None,
        )
        or
        "Unknown Author"
    )


def get_author_id(
    user,
):

    if user is None:

        return None


    return getattr(
        user,
        "id",
        None,
    )


def get_created_at(
    item,
):

    created_at = getattr(
        item,
        "created_at",
        None,
    )


    if created_at is None:

        return None


    return created_at.isoformat()


def get_updated_at(
    item,
):

    updated_at = getattr(
        item,
        "updated_at",
        None,
    )


    if updated_at is None:

        return None


    return updated_at.isoformat()


# =========================================================
# COMMENT SERIALIZATION
# =========================================================

def serialize_comment(
    comment,
):

    user = getattr(
        comment,
        "user",
        None,
    )


    if user is None:

        user = getattr(
            comment,
            "author",
            None,
        )


    author_name = get_author_name(
        user
    )


    author_id_value = get_author_id(
        user
    )


    return {
        "id":
            comment.id,

        "content":
            comment.content,

        "user_id":
            getattr(
                comment,
                "user_id",
                None,
            ),

        "author_id":
            author_id_value,

        "author_name":
            author_name,

        "author": {
            "id":
                author_id_value,

            "name":
                author_name,
        },

        "created_at":
            get_created_at(
                comment
            ),
    }


# =========================================================
# WRITING SERIALIZATION
# =========================================================

def serialize_writing(
    writing,
    current_user_id=None,
):

    author = getattr(
        writing,
        "author",
        None,
    )


    if author is None:

        author = getattr(
            writing,
            "user",
            None,
        )


    writing_likes = getattr(
        writing,
        "likes",
        [],
    )


    writing_comments = getattr(
        writing,
        "comments",
        [],
    )


    try:

        likes_count = len(
            writing_likes
        )

    except TypeError:

        likes_count = 0


    try:

        comments_count = len(
            writing_comments
        )

    except TypeError:

        comments_count = 0


    is_liked = False


    if current_user_id:

        try:

            is_liked = any(
                getattr(
                    like,
                    "user_id",
                    None,
                ) == current_user_id
                for like in writing_likes
            )

        except TypeError:

            is_liked = False


    return {
        "id":
            writing.id,

        "title":
            writing.title,

        "content":
            writing.content,

        "category":
            writing.category,

        "language":
            getattr(
                writing,
                "language",
                "bn",
            ),

        "user_id":
            getattr(
                writing,
                "user_id",
                None,
            ),

        "author_id":
            get_author_id(
                author
            ),

        "author_name":
            get_author_name(
                author
            ),

        "author": {
            "id":
                get_author_id(
                    author
                ),

            "name":
                get_author_name(
                    author
                ),
        },

        "likes":
            likes_count,

        "likes_count":
            likes_count,

        "comments_count":
            comments_count,

        "is_liked":
            is_liked,

        "created_at":
            get_created_at(
                writing
            ),

        "updated_at":
            get_updated_at(
                writing
            ),
        "status":
            getattr(
                writing,
                "status",
                "draft",
            ),
        "previous_status": 
            getattr(
                writing,
                "previous_status",
                None,
            ),
        "deleted_at":
            (
                writing.deleted_at.isoformat()
                if getattr(
                    writing,
                    "deleted_at",
                    None,
                )
                else None
            ),
    }


# =========================================================
# OPTIONAL JWT IDENTITY
# =========================================================

def get_optional_user_id():

    identity = get_jwt_identity()


    if identity is None:

        return None


    try:

        return int(identity)

    except (
        TypeError,
        ValueError,
    ):

        return None


# =========================================================
# GET SUPPORTED LANGUAGES
# =========================================================

@writings_bp.route(
    "/languages",
    methods=["GET"],
)
def get_supported_languages():
    """
    Return the writing languages supported by SHOBDO.
    This endpoint is public and does not require JWT.
    """

    try:

        languages = [
            {
                "code": "bn",
                "name": "Bengali",
                "label": "বাংলা",
                "nativeName": "বাংলা",
                "native_name": "বাংলা",
            },
            {
                "code": "en",
                "name": "English",
                "label": "English",
                "nativeName": "English",
                "native_name": "English",
            },
            {
                "code": "hi",
                "name": "Hindi",
                "label": "हिन्दी",
                "nativeName": "हिन्दी",
                "native_name": "हिन्दी",
            },
        ]

        return jsonify({
            "languages": languages,
        }), 200

    except Exception as error:

        print(
            "Get supported languages error:",
            error,
        )

        return error_response(
            "Unable to load supported languages.",
            500,
        )


# =========================================================
# GET ALL WRITINGS
# =========================================================

@writings_bp.route(
    "",
    methods=["GET"],
)
@jwt_required(optional=True)
def get_writings():

    try:

        current_user_id = (
            get_optional_user_id()
        )


        search = request.args.get(
            "search",
            "",
        ).strip()


        category = request.args.get(
            "category",
            "",
        ).strip()


        language = request.args.get(
            "language",
            "",
        ).strip()


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

        except ValueError:

            page = 1


        try:

            limit = int(
                request.args.get(
                    "limit",
                    12,
                )
            )

        except ValueError:

            limit = 12


        limit = min(
            max(
                limit,
                1,
            ),
            50,
        )


        query = Writing.query.filter(
            Writing.status == "published"
        )

        if search:

            search_pattern = (
                f"%{search}%"
            )


            query = query.filter(
                db.or_(
                    Writing.title.ilike(
                        search_pattern
                    ),
                    Writing.content.ilike(
                        search_pattern
                    ),
                )
            )


        if category:

            query = query.filter(
                Writing.category
                ==
                category
            )


        if (
            language
            and
            hasattr(
                Writing,
                "language",
            )
        ):

            query = query.filter(
                Writing.language
                ==
                language
            )


        if hasattr(
            Writing,
            "created_at",
        ):

            query = query.order_by(
                Writing.created_at.desc()
            )

        else:

            query = query.order_by(
                Writing.id.desc()
            )


        pagination = query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )


        writings = [
            serialize_writing(
                writing,
                current_user_id,
            )
            for writing
            in pagination.items
        ]


        return jsonify({
            "writings":
                writings,

            "items":
                writings,

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "limit":
                limit,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        }), 200


    except Exception as error:

        print(
            "Get writings error:",
            error,
        )


        return error_response(
            "Unable to load writings.",
            500,
        )


# =========================================================
# GET CURRENT USER'S WRITINGS
# =========================================================

@writings_bp.route(
    "/mine",
    methods=["GET"],
)
@jwt_required()
def get_my_writings():

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        search = request.args.get(
            "search",
            "",
        ).strip()


        language = request.args.get(
            "language",
            "",
        ).strip()


        status = request.args.get(
            "status",
            "",
        ).strip().lower()


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

        except ValueError:

            page = 1


        try:

            limit = int(
                request.args.get(
                    "limit",
                    12,
                )
            )

        except ValueError:

            limit = 12


        limit = min(
            max(
                limit,
                1,
            ),
            50,
        )


        query = Writing.query.filter(
            Writing.user_id
            ==
            user_id
        )
        if (
            hasattr(
                Writing,
                "status"
            )
            and
            status != "deleted"
        ):

            query = query.filter(
                Writing.status
                !=
                "deleted"
            )


        if search:

            search_pattern = (
                f"%{search}%"
            )


            query = query.filter(
                db.or_(
                    Writing.title.ilike(
                        search_pattern
                    ),
                    Writing.content.ilike(
                        search_pattern
                    ),
                )
            )


        if (
            language
            and
            hasattr(
                Writing,
                "language",
            )
        ):

            query = query.filter(
                Writing.language
                ==
                language
            )


        # Only applies if the Writing model has a
        # status / is_published column. Safe to ignore
        # otherwise.
        if (
            status
            and
            hasattr(
                Writing,
                "status",
            )
        ):

            query = query.filter(
                Writing.status
                ==
                status
            )

        elif (
            status
            and
            hasattr(
                Writing,
                "is_published",
            )
        ):

            is_published = (
                status
                ==
                "published"
            )


            query = query.filter(
                Writing.is_published
                ==
                is_published
            )


        if hasattr(
            Writing,
            "created_at",
        ):

            query = query.order_by(
                Writing.created_at.desc()
            )

        else:

            query = query.order_by(
                Writing.id.desc()
            )


        pagination = query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )


        writings = [
            serialize_writing(
                writing,
                user_id,
            )
            for writing
            in pagination.items
        ]


        return jsonify({
            "writings":
                writings,

            "items":
                writings,

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "limit":
                limit,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        }), 200


    except Exception as error:

        print(
            "Get my writings error:",
            error,
        )


        return error_response(
            "Unable to load your writings.",
            500,
        )


# =========================================================
# GET ONE WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["GET"],
)
@jwt_required(optional=True)
def get_writing(
    writing_id,
):

    try:

        current_user_id = (
            get_optional_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )
        
        if (
            hasattr(Writing, "status")
            and writing.status != "published"
        ):
            return error_response(
                "Writing not found.",
                404,
            )


        writing_data = (
            serialize_writing(
                writing,
                current_user_id,
            )
        )


        comments = getattr(
            writing,
            "comments",
            [],
        )


        try:

            writing_data["comments"] = [
                serialize_comment(
                    comment
                )
                for comment
                in sorted(
                    comments,
                    key=lambda item:
                        getattr(
                            item,
                            "created_at",
                            item.id,
                        ),
                )
            ]

        except TypeError:

            writing_data["comments"] = []


        return jsonify(
            writing_data
        ), 200


    except Exception as error:

        print(
            "Get writing error:",
            error,
        )


        return error_response(
            "Unable to load the writing.",
            500,
        )


# =========================================================
# CREATE WRITING
# =========================================================

@writings_bp.route(
    "",
    methods=["POST"],
)
@jwt_required()
def create_writing():

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        data = (
            request.get_json(
                silent=True
            )
            or
            {}
        )


        title = str(
            data.get(
                "title",
                "",
            )
        ).strip()


        content = str(
            data.get(
                "content",
                "",
            )
        ).strip()


        category = str(
            data.get(
                "category",
                "অন্যান্য",
            )
        ).strip()


        language = str(
            data.get(
                "language",
                "bn",
            )
        ).strip().lower()


        if not title:

            return error_response(
                "Title is required."
            )


        if not content:

            return error_response(
                "Writing content is required."
            )


        if len(title) > 200:

            return error_response(
                "Title cannot exceed 200 characters."
            )


        if (
            category
            not in
            ALLOWED_CATEGORIES
        ):

            category = "অন্যান্য"


        if (
            language
            not in
            ALLOWED_WRITING_LANGUAGES
        ):

            language = "bn"


        writing_arguments = {
            "title":
                title,

            "content":
                content,

            "category":
                category,

            "user_id":
                user_id,
             # This endpoint is POST /api/writings,
            # so a new writing created here is published.
            "status":
                "published",
        }


        if hasattr(
            Writing,
            "published_at",
        ):

            writing_arguments[
                "published_at"
            ] = datetime.now(
                timezone.utc
            )


        writing = Writing(
            **writing_arguments
        )


        db.session.add(
            writing
        )

        db.session.commit()


        return jsonify(
            serialize_writing(
                writing,
                user_id,
            )
        ), 201


    except Exception as error:

        db.session.rollback()


        print(
            "Create writing error:",
            error,
        )


        return error_response(
            "Unable to publish the writing.",
            500,
        )


# =========================================================
# CREATE DRAFT
# =========================================================

@writings_bp.route(
    "/drafts",
    methods=["POST"],
)
@jwt_required()
def create_draft():

    try:

        user_id = get_current_user_id()

        if user_id is None:
            return error_response(
                "Invalid authentication identity.",
                401,
            )

        data = request.get_json(
            silent=True
        ) or {}

        title = (
            data.get("title")
            or ""
        ).strip()

        content = (
            data.get("content")
            or ""
        ).strip()

        category = (
            data.get("category")
            or "অন্যান্য"
        ).strip()

        language = (
            data.get("language")
            or "bn"
        ).strip()

        if (
            not title
            and not content
        ):
            return error_response(
                "Draft must contain a title or content.",
                400,
            )

        writing_arguments = {
            "title":
                title or "Untitled Draft",

            "content":
                content,

            "category":
                category,

            "user_id":
                user_id,

            "status":
                "draft",
        }

        if hasattr(
            Writing,
            "language",
        ):
            writing_arguments[
                "language"
            ] = language

        writing = Writing(
            **writing_arguments
        )

        db.session.add(
            writing
        )

        db.session.commit()

        return jsonify({
            "message":
                "Draft saved successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),
        }), 201

    except Exception as error:

        db.session.rollback()

        print(
            "Create draft error:",
            error,
        )

        return error_response(
            "Unable to save draft.",
            500,
        )


# =========================================================
# UPDATE WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["PUT", "PATCH"],
)
@jwt_required()
def update_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to edit this writing.",
                403,
            )


        data = (
            request.get_json(
                silent=True
            )
            or
            {}
        )


        if "title" in data:

            title = str(
                data.get(
                    "title",
                    "",
                )
            ).strip()


            if not title:

                return error_response(
                    "Title cannot be empty."
                )


            if len(title) > 200:

                return error_response(
                    "Title cannot exceed 200 characters."
                )


            writing.title = title


        if "content" in data:

            content = str(
                data.get(
                    "content",
                    "",
                )
            ).strip()


            if not content:

                return error_response(
                    "Writing content cannot be empty."
                )


            writing.content = content


        if "category" in data:

            category = str(
                data.get(
                    "category",
                    "",
                )
            ).strip()


            if (
                category
                not in
                ALLOWED_CATEGORIES
            ):

                return error_response(
                    "Invalid writing category."
                )


            writing.category = (
                category
            )


        if (
            "language" in data
            and
            hasattr(
                Writing,
                "language",
            )
        ):

            language = str(
                data.get(
                    "language",
                    "",
                )
            ).strip().lower()


            if (
                language
                not in
                ALLOWED_WRITING_LANGUAGES
            ):

                return error_response(
                    "Invalid writing language."
                )


            writing.language = (
                language
            )


        db.session.commit()


        return jsonify(
            serialize_writing(
                writing,
                user_id,
            )
        ), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Update writing error:",
            error,
        )


        return error_response(
            "Unable to update the writing.",
            500,
        )


# =========================================================
# PUBLISH EXISTING DRAFT
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/publish",
    methods=["POST"],
)
@jwt_required()
def publish_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message":
                    "Writing not found."
            }), 404


        if (
            writing.user_id
            !=
            user_id
        ):

            return jsonify({
                "message":
                    "You are not allowed to publish this writing."
            }), 403


        if (
            writing.status
            == "deleted"
        ):

            return jsonify({
                "message":
                    "Deleted writings cannot be published."
            }), 400


        writing.status = (
            "published"
        )

        writing.published_at = (
            datetime.now(
                timezone.utc
            )
        )


        db.session.commit()


        return jsonify({

            "message":
                "Writing published successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "PUBLISH WRITING ERROR:",
            error,
        )

        return jsonify({
            "message":
                "Unable to publish writing."
        }), 500

# =========================================================
# UNPUBLISH WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/unpublish",
    methods=["POST"],
)
@jwt_required()
def unpublish_writing(writing_id):

    try:
        user_id = int(
            get_jwt_identity()
        )

    except (TypeError, ValueError):
        return error_response(
            "Invalid user identity.",
            401,
        )


    writing = db.session.get(
        Writing,
        writing_id,
    )


    if not writing:
        return error_response(
            "Writing not found.",
            404,
        )


    if writing.user_id != user_id:
        return error_response(
            "You are not allowed to modify this writing.",
            403,
        )


    writing.status = "draft"

    if hasattr(
        Writing,
        "published_at",
    ):
        writing.published_at = None


    db.session.commit()

    db.session.refresh(
        writing
    )


    return jsonify({
        "message":
            "Writing unpublished successfully.",

        "writing":
            serialize_writing(
                writing,
                user_id,
            ),
    }), 200



# =========================================================
# DELETE WRITING — SOFT DELETE
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to delete this writing.",
                403,
            )


        # Already in Trash
        if (
            getattr(
                writing,
                "status",
                None,
            )
            ==
            "deleted"
        ):

            return error_response(
                "Writing is already in Trash.",
                400,
            )


        # =================================================
        # SOFT DELETE
        # =================================================

        # Remember whether this was a draft or published writing
        # before moving it to Trash.
        writing.previous_status = writing.status

        writing.status = "deleted"
        writing.deleted_at = datetime.now(timezone.utc)


        db.session.commit()


        return jsonify({
            "message":
                "Writing moved to Trash successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),
        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Delete writing error:",
            error,
        )


        return error_response(
            "Unable to move the writing to Trash.",
            500,
        )


# =========================================================
# RESTORE WRITING FROM TRASH
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/restore",
    methods=["POST"],
)
@jwt_required()
def restore_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to restore this writing.",
                403,
            )


        if (
            getattr(
                writing,
                "status",
                None,
            )
            !=
            "deleted"
        ):

            return error_response(
                "This writing is not in Trash.",
                400,
            )


        restore_status = (
            writing.previous_status
            if writing.previous_status in ("draft", "published")
            else "draft"
        )

        writing.status = restore_status
        writing.deleted_at = None
        writing.previous_status = None

        if restore_status == "published":
            if writing.published_at is None:
                writing.published_at = datetime.now(timezone.utc)
        else:
            writing.published_at = None

        db.session.commit()


        return jsonify({
            "message":
                "Writing restored successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),
        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Restore writing error:",
            error,
        )


        return error_response(
            "Unable to restore the writing.",
            500,
        )


# =========================================================
# PERMANENTLY DELETE WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/permanent",
    methods=["DELETE"],
)
@jwt_required()
def permanently_delete_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to delete this writing.",
                403,
            )


        if (
            getattr(
                writing,
                "status",
                None,
            )
            !=
            "deleted"
        ):

            return error_response(
                "Only writings in Trash can be permanently deleted.",
                400,
            )


        db.session.delete(
            writing
        )

        db.session.commit()


        return jsonify({
            "message":
                "Writing permanently deleted."
        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "Permanent delete writing error:",
            error,
        )

        return error_response(
            "Unable to permanently delete the writing.",
            500,
        )

    
# =========================================================
# LIKE OR UNLIKE WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/like",
    methods=["POST"],
)
@jwt_required()
def toggle_writing_like(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        existing_like = (
            Like.query.filter_by(
                user_id=user_id,
                writing_id=writing_id,
            ).first()
        )


        if existing_like:

            db.session.delete(
                existing_like
            )

            liked = False

            message = (
                "Like removed successfully."
            )

        else:

            new_like = Like(
                user_id=user_id,
                writing_id=writing_id,
            )


            db.session.add(
                new_like
            )

            liked = True

            message = (
                "Writing liked successfully."
            )


        db.session.commit()


        likes_count = (
            Like.query.filter_by(
                writing_id=writing_id
            ).count()
        )


        return jsonify({
            "message":
                message,

            "liked":
                liked,

            "is_liked":
                liked,

            "likes":
                likes_count,

            "likes_count":
                likes_count,
        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Like writing error:",
            error,
        )


        return error_response(
            "Unable to update the like.",
            500,
        )


# =========================================================
# GET COMMENTS
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/comments",
    methods=["GET"],
)
def get_comments(
    writing_id,
):

    try:

        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        comments = (
            Comment.query
            .filter_by(
                writing_id=writing_id
            )
            .order_by(
                Comment.created_at.asc()
            )
            .all()
        )


        serialized_comments = [
            serialize_comment(
                comment
            )
            for comment
            in comments
        ]


        return jsonify({
            "comments":
                serialized_comments,

            "total":
                len(
                    serialized_comments
                ),
        }), 200


    except Exception as error:

        print(
            "Get comments error:",
            error,
        )


        return error_response(
            "Unable to load comments.",
            500,
        )


# =========================================================
# CREATE COMMENT
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/comments",
    methods=["POST"],
)
@jwt_required()
def create_comment(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        data = (
            request.get_json(
                silent=True
            )
            or
            {}
        )


        content = str(
            data.get(
                "content",
                "",
            )
        ).strip()


        if not content:

            return error_response(
                "Comment cannot be empty."
            )


        comment = Comment(
            content=content,
            user_id=user_id,
            writing_id=writing_id,
        )


        db.session.add(
            comment
        )

        db.session.commit()


        return jsonify(
            serialize_comment(
                comment
            )
        ), 201


    except Exception as error:

        db.session.rollback()


        print(
            "Create comment error:",
            error,
        )


        return error_response(
            "Unable to publish the comment.",
            500,
        )


# =========================================================
# OCR HELPERS
# =========================================================

def get_file_extension(
    filename,
):

    return Path(
        filename or ""
    ).suffix.lower()


def validate_ocr_file(
    uploaded_file,
):

    if uploaded_file is None:

        return (
            False,
            "Please select a PDF, JPG or PNG file.",
        )


    if not uploaded_file.filename:

        return (
            False,
            "The selected file has no filename.",
        )


    extension = get_file_extension(
        uploaded_file.filename
    )


    mime_type = (
        uploaded_file.mimetype
        or
        ""
    ).lower()


    if (
        extension
        not in
        ALLOWED_EXTENSIONS
    ):

        return (
            False,
            "Only PDF, JPG, JPEG and PNG files are supported.",
        )


    if (
        mime_type
        and
        mime_type
        not in
        ALLOWED_MIME_TYPES
    ):

        return (
            False,
            "The selected file type is not supported.",
        )


    return (
        True,
        None,
    )


def prepare_image_for_ocr(
    image,
):

    image = ImageOps.exif_transpose(
        image
    )


    if image.mode not in (
        "RGB",
        "L",
    ):

        image = image.convert(
            "RGB"
        )


    # Enlarging small images can improve OCR accuracy
    width, height = image.size


    if max(
        width,
        height,
    ) < 1600:

        image = image.resize(
            (
                width * 2,
                height * 2,
            ),
            Image.Resampling.LANCZOS,
        )


    return image


def extract_text_from_image(
    file_bytes,
    tesseract_language,
):

    with Image.open(
        io.BytesIO(
            file_bytes
        )
    ) as image:

        prepared_image = (
            prepare_image_for_ocr(
                image
            )
        )


        text = (
            pytesseract
            .image_to_string(
                prepared_image,
                lang=tesseract_language,
                config="--oem 3 --psm 6",
            )
        )


    return text.strip()


def extract_text_from_pdf(
    file_bytes,
    tesseract_language,
):

    extracted_pages = []


    document = pymupdf.open(
        stream=file_bytes,
        filetype="pdf",
    )


    try:

        if document.page_count == 0:

            return ""


        if (
            document.page_count
            >
            MAX_PDF_PAGES
        ):

            raise ValueError(
                f"PDF cannot contain more than {MAX_PDF_PAGES} pages."
            )


        for page_number in range(
            document.page_count
        ):

            page = document.load_page(
                page_number
            )


            # First try normal PDF text extraction
            direct_text = (
                page.get_text(
                    "text"
                )
                or
                ""
            ).strip()


            if direct_text:

                extracted_pages.append(
                    direct_text
                )

                continue


            # If the page is scanned, render it as an image
            zoom = 2.5


            matrix = pymupdf.Matrix(
                zoom,
                zoom,
            )


            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False,
            )


            image = Image.open(
                io.BytesIO(
                    pixmap.tobytes(
                        "png"
                    )
                )
            )


            try:

                prepared_image = (
                    prepare_image_for_ocr(
                        image
                    )
                )


                page_text = (
                    pytesseract
                    .image_to_string(
                        prepared_image,
                        lang=tesseract_language,
                        config="--oem 3 --psm 6",
                    )
                ).strip()


                if page_text:

                    extracted_pages.append(
                        page_text
                    )

            finally:

                image.close()


    finally:

        document.close()


    return "\n\n".join(
        extracted_pages
    ).strip()


# =========================================================
# OCR ENDPOINT
# =========================================================

@writings_bp.route(
    "/ocr",
    methods=["POST"],
)
@jwt_required()
def extract_scanned_writing():

    try:

        uploaded_file = (
            request.files.get(
                "document"
            )
        )


        language = (
            request.form.get(
                "language",
                "bn",
            )
            .strip()
            .lower()
        )


        valid_file, validation_error = (
            validate_ocr_file(
                uploaded_file
            )
        )


        if not valid_file:

            return error_response(
                validation_error
            )


        if (
            language
            not in
            OCR_LANGUAGE_MAP
        ):

            return error_response(
                "OCR language must be bn, en or hi."
            )


        file_bytes = (
            uploaded_file.read(
                MAX_FILE_SIZE + 1
            )
        )


        if not file_bytes:

            return error_response(
                "The selected file is empty."
            )


        if (
            len(file_bytes)
            >
            MAX_FILE_SIZE
        ):

            return error_response(
                "File size cannot exceed 10 MB.",
                413,
            )


        extension = get_file_extension(
            uploaded_file.filename
        )


        tesseract_language = (
            OCR_LANGUAGE_MAP[
                language
            ]
        )


        if extension == ".pdf":

            extracted_text = (
                extract_text_from_pdf(
                    file_bytes,
                    tesseract_language,
                )
            )

        else:

            extracted_text = (
                extract_text_from_image(
                    file_bytes,
                    tesseract_language,
                )
            )


        if not extracted_text:

            return error_response(
                "No readable text was found in the selected file.",
                422,
            )


        return jsonify({
            "message":
                "Text extracted successfully.",

            "text":
                extracted_text,

            "content":
                extracted_text,

            "extracted_text":
                extracted_text,

            "language":
                language,

            "ocr_language":
                tesseract_language,

            "filename":
                uploaded_file.filename,
        }), 200


    except (
        pytesseract
        .pytesseract
        .TesseractNotFoundError
    ):

        return error_response(
            "Tesseract OCR is not installed or is not available in the Windows PATH.",
            500,
        )


    except (
        pytesseract
        .pytesseract
        .TesseractError
    ) as error:

        print(
            "Tesseract OCR error:",
            error,
        )


        return error_response(
            "The selected OCR language data is missing. Check eng, ben and hin traineddata files.",
            500,
        )


    except UnidentifiedImageError:

        return error_response(
            "The selected image is damaged or cannot be read.",
            422,
        )


    except pymupdf.FileDataError:

        return error_response(
            "The selected PDF is damaged or cannot be read.",
            422,
        )


    except ValueError as error:

        return error_response(
            str(error)
        )


    except Exception as error:

        print(
            "OCR extraction error:",
            error,
        )


        return error_response(
            "Unable to extract text from the selected file.",
            500,
        )


# =========================================================
# OPTIONAL REGISTRATION FUNCTION
# =========================================================

def register_writing_routes(
    app,
):
    """
    Compatibility helper for an App.py that calls:

        register_writing_routes(app)

    If App.py already uses:

        app.register_blueprint(writings_bp)

    this function is not needed.
    """

    app.register_blueprint(
        writings_bp
    )