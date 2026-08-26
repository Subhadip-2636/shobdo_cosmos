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

from sqlalchemy import or_

from database import db

from config.languages import (
    normalize_language,
    serialize_languages,
)

from models.user import User
from models.writing import Writing


# =========================================================
# BLUEPRINT
# =========================================================

writings_bp = Blueprint(
    "writings",
    __name__,
)


# =========================================================
# CONSTANTS
# =========================================================

VALID_STATUSES = {
    "draft",
    "published",
}

MAX_TITLE_LENGTH = 200
MAX_PAGE_SIZE = 50
DEFAULT_PAGE_SIZE = 12


# =========================================================
# HELPERS
# =========================================================

def get_current_user():
    """
    Resolve the currently authenticated user from JWT.
    """

    identity = get_jwt_identity()

    try:
        user_id = int(identity)

    except (TypeError, ValueError):
        return None

    return db.session.get(
        User,
        user_id,
    )


def sanitize_title(value):
    """
    Normalize a writing title.
    """

    return str(
        value or ""
    ).strip()


def sanitize_content(value):
    """
    Normalize writing content.
    """

    return str(
        value or ""
    ).strip()


def sanitize_category(value):
    """
    Normalize category.
    """

    category = str(
        value or ""
    ).strip()

    return category or "অন্যান্য"


def get_validated_language(value):
    """
    Normalize and validate language.

    normalize_language() returns:
    - valid normalized language code
    - default language when appropriate
    - None for unsupported codes
    """

    return normalize_language(
        value
    )


def validate_title(title):
    """
    Return an error message when title is invalid.
    """

    if len(title) > MAX_TITLE_LENGTH:
        return (
            f"Title cannot exceed "
            f"{MAX_TITLE_LENGTH} characters."
        )

    return None


def validate_for_publish(
    title,
    content,
    language,
):
    """
    Validate a writing before publication.

    Returns:
        str | None
    """

    if (
        not title
        or title == "Untitled"
    ):
        return (
            "Please add a title before publishing."
        )

    if len(title) > MAX_TITLE_LENGTH:
        return (
            f"Title cannot exceed "
            f"{MAX_TITLE_LENGTH} characters."
        )

    if not content:
        return (
            "Please add content before publishing."
        )

    if len(content) < 10:
        return (
            "Writing is too short to publish."
        )

    if language is None:
        return (
            "Writing has an unsupported language."
        )

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
    Public list of languages supported by SHOBDO.
    """

    return jsonify({
        "languages": serialize_languages(),
    }), 200


# =========================================================
# GET ALL PUBLIC / PUBLISHED WRITINGS
# =========================================================

@writings_bp.route(
    "",
    methods=["GET"],
)
def get_all_writings():

    try:

        # =================================================
        # QUERY PARAMETERS
        # =================================================

        page = request.args.get(
            "page",
            default=1,
            type=int,
        )

        limit = request.args.get(
            "limit",
            default=DEFAULT_PAGE_SIZE,
            type=int,
        )

        search = request.args.get(
            "search",
            default="",
            type=str,
        ).strip()

        category = request.args.get(
            "category",
            default="",
            type=str,
        ).strip()

        language_raw = request.args.get(
            "language",
            default="",
            type=str,
        ).strip()


        # =================================================
        # PAGINATION SAFETY
        # =================================================

        if page is None or page < 1:
            page = 1

        if limit is None or limit < 1:
            limit = DEFAULT_PAGE_SIZE

        if limit > MAX_PAGE_SIZE:
            limit = MAX_PAGE_SIZE


        # =================================================
        # BASE QUERY
        # =================================================

        query = Writing.query.filter(
            Writing.status == "published"
        )


        # =================================================
        # SEARCH
        # =================================================

        if search:

            pattern = f"%{search}%"

            query = query.filter(
                or_(
                    Writing.title.ilike(
                        pattern
                    ),
                    Writing.content.ilike(
                        pattern
                    ),
                )
            )


        # =================================================
        # CATEGORY FILTER
        # =================================================

        if category:

            query = query.filter(
                Writing.category == category
            )


        # =================================================
        # LANGUAGE FILTER
        # =================================================

        if language_raw:

            language = (
                get_validated_language(
                    language_raw
                )
            )

            if language is None:

                return jsonify({
                    "message": (
                        "Unsupported language."
                    )
                }), 400

            query = query.filter(
                Writing.language == language
            )


        # =================================================
        # SORT
        # =================================================

        query = query.order_by(
            Writing.published_at.desc(),
            Writing.created_at.desc(),
        )


        # =================================================
        # PAGINATION
        # =================================================

        pagination = query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )


        return jsonify({

            "writings": [
                writing.to_dict()
                for writing
                in pagination.items
            ],

            "pagination": {

                "page":
                    pagination.page,

                "limit":
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


    except Exception as error:

        print(
            "GET ALL WRITINGS ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to load writings."
            )
        }), 500


# =========================================================
# GET SINGLE PUBLIC WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["GET"],
)
def get_writing(
    writing_id
):

    try:

        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "লেখাটি পাওয়া যায়নি।"
                )
            }), 404


        # Drafts are private.

        if writing.status != "published":

            return jsonify({
                "message": (
                    "লেখাটি পাওয়া যায়নি।"
                )
            }), 404


        return jsonify({
            "writing":
                writing.to_dict()
        }), 200


    except Exception as error:

        print(
            "GET WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to load this writing."
            )
        }), 500


# =========================================================
# GET MY WRITINGS
# =========================================================

@writings_bp.route(
    "/mine",
    methods=["GET"],
)
@jwt_required()
def get_my_writings():

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        # =================================================
        # FILTERS
        # =================================================

        status = request.args.get(
            "status",
            default="",
            type=str,
        ).strip().lower()

        language_raw = request.args.get(
            "language",
            default="",
            type=str,
        ).strip()


        # =================================================
        # BASE QUERY
        # =================================================

        query = Writing.query.filter(
            Writing.user_id == user.id
        )


        # =================================================
        # STATUS
        # =================================================

        if status:

            if status not in VALID_STATUSES:

                return jsonify({
                    "message": (
                        "Unsupported writing status."
                    )
                }), 400

            query = query.filter(
                Writing.status == status
            )


        # =================================================
        # LANGUAGE
        # =================================================

        if language_raw:

            language = (
                get_validated_language(
                    language_raw
                )
            )

            if language is None:

                return jsonify({
                    "message": (
                        "Unsupported language."
                    )
                }), 400

            query = query.filter(
                Writing.language == language
            )


        # =================================================
        # SORT
        # =================================================

        query = query.order_by(
            Writing.updated_at.desc()
        )


        writings = query.all()


        return jsonify({

            "writings": [
                writing.to_dict()
                for writing
                in writings
            ]

        }), 200


    except Exception as error:

        print(
            "GET MY WRITINGS ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to load your writings."
            )
        }), 500


# =========================================================
# GET SINGLE OWN WRITING
# =========================================================

@writings_bp.route(
    "/mine/<int:writing_id>",
    methods=["GET"],
)
@jwt_required()
def get_my_writing(
    writing_id
):

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "Writing not found."
                )
            }), 404


        if writing.user_id != user.id:

            return jsonify({
                "message": (
                    "You are not allowed to "
                    "access this writing."
                )
            }), 403


        return jsonify({
            "writing":
                writing.to_dict()
        }), 200


    except Exception as error:

        print(
            "GET MY WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to load this writing."
            )
        }), 500


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

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        data = request.get_json(
            silent=True
        ) or {}


        # =================================================
        # SANITIZE INPUT
        # =================================================

        title = sanitize_title(
            data.get("title")
        )

        content = sanitize_content(
            data.get("content")
        )

        category = sanitize_category(
            data.get("category")
        )

        language = (
            get_validated_language(
                data.get("language")
            )
        )


        # =================================================
        # VALIDATION
        # =================================================

        if language is None:

            return jsonify({
                "message": (
                    "Unsupported language."
                )
            }), 400


        title_error = validate_title(
            title
        )

        if title_error:

            return jsonify({
                "message": title_error
            }), 400


        # =================================================
        # CREATE
        # =================================================

        writing = Writing(
            title=(
                title
                or "Untitled"
            ),
            content=content,
            category=category,
            language=language,
            status="draft",
            user_id=user.id,
        )


        db.session.add(
            writing
        )

        db.session.commit()


        return jsonify({

            "message": (
                "Draft saved successfully."
            ),

            "writing":
                writing.to_dict(),

        }), 201


    except Exception as error:

        db.session.rollback()

        print(
            "CREATE DRAFT ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to save draft."
            )
        }), 500


# =========================================================
# UPDATE OWN WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["PUT"],
)
@jwt_required()
def update_writing(
    writing_id
):

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "Writing not found."
                )
            }), 404


        if writing.user_id != user.id:

            return jsonify({
                "message": (
                    "You are not allowed to "
                    "edit this writing."
                )
            }), 403


        data = request.get_json(
            silent=True
        ) or {}


        # =================================================
        # TITLE
        # =================================================

        if "title" in data:

            title = sanitize_title(
                data.get("title")
            )

            title_error = (
                validate_title(
                    title
                )
            )

            if title_error:

                return jsonify({
                    "message":
                        title_error
                }), 400

            writing.title = (
                title
                or "Untitled"
            )


        # =================================================
        # CONTENT
        # =================================================

        if "content" in data:

            writing.content = (
                sanitize_content(
                    data.get("content")
                )
            )


        # =================================================
        # CATEGORY
        # =================================================

        if "category" in data:

            writing.category = (
                sanitize_category(
                    data.get("category")
                )
            )


        # =================================================
        # LANGUAGE
        # =================================================

        if "language" in data:

            language = (
                get_validated_language(
                    data.get("language")
                )
            )

            if language is None:

                return jsonify({
                    "message": (
                        "Unsupported language."
                    )
                }), 400

            writing.language = (
                language
            )


        db.session.commit()


        return jsonify({

            "message": (
                "Writing updated successfully."
            ),

            "writing":
                writing.to_dict(),

        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "UPDATE WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to update writing."
            )
        }), 500


# =========================================================
# PUBLISH WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/publish",
    methods=["POST"],
)
@jwt_required()
def publish_writing(
    writing_id
):

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "Writing not found."
                )
            }), 404


        if writing.user_id != user.id:

            return jsonify({
                "message": (
                    "You are not allowed to "
                    "publish this writing."
                )
            }), 403


        # =================================================
        # VALIDATE CURRENT RECORD
        # =================================================

        title = sanitize_title(
            writing.title
        )

        content = sanitize_content(
            writing.content
        )

        language = (
            get_validated_language(
                writing.language
            )
        )


        validation_error = (
            validate_for_publish(
                title,
                content,
                language,
            )
        )


        if validation_error:

            return jsonify({
                "message":
                    validation_error
            }), 400


        # Normalize before publication.

        writing.title = title
        writing.content = content
        writing.language = language

        writing.status = (
            "published"
        )


        if not writing.published_at:

            writing.published_at = (
                datetime.now(
                    timezone.utc
                )
            )


        db.session.commit()


        return jsonify({

            "message": (
                "Writing published successfully."
            ),

            "writing":
                writing.to_dict(),

        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "PUBLISH WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to publish writing."
            )
        }), 500


# =========================================================
# UNPUBLISH WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/unpublish",
    methods=["POST"],
)
@jwt_required()
def unpublish_writing(
    writing_id
):

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "Writing not found."
                )
            }), 404


        if writing.user_id != user.id:

            return jsonify({
                "message": (
                    "You are not allowed to "
                    "unpublish this writing."
                )
            }), 403


        writing.status = "draft"

        writing.published_at = None


        db.session.commit()


        return jsonify({

            "message": (
                "Writing moved back to drafts."
            ),

            "writing":
                writing.to_dict(),

        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "UNPUBLISH WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to move writing "
                "to drafts."
            )
        }), 500


# =========================================================
# CREATE + PUBLISH DIRECTLY
# =========================================================

@writings_bp.route(
    "",
    methods=["POST"],
)
@jwt_required()
def create_published_writing():

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        data = request.get_json(
            silent=True
        ) or {}


        # =================================================
        # SANITIZE
        # =================================================

        title = sanitize_title(
            data.get("title")
        )

        content = sanitize_content(
            data.get("content")
        )

        category = sanitize_category(
            data.get("category")
        )

        language = (
            get_validated_language(
                data.get("language")
            )
        )


        # =================================================
        # VALIDATE
        # =================================================

        validation_error = (
            validate_for_publish(
                title,
                content,
                language,
            )
        )


        if validation_error:

            return jsonify({
                "message":
                    validation_error
            }), 400


        # =================================================
        # CREATE
        # =================================================

        writing = Writing(
            title=title,
            content=content,
            category=category,
            language=language,
            status="published",
            published_at=(
                datetime.now(
                    timezone.utc
                )
            ),
            user_id=user.id,
        )


        db.session.add(
            writing
        )

        db.session.commit()


        return jsonify({

            "message": (
                "Writing published successfully."
            ),

            "writing":
                writing.to_dict(),

        }), 201


    except Exception as error:

        db.session.rollback()

        print(
            "CREATE PUBLISHED WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to publish writing."
            )
        }), 500


# =========================================================
# DELETE OWN WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_writing(
    writing_id
):

    try:

        user = get_current_user()


        if not user:

            return jsonify({
                "message": (
                    "Authenticated user not found."
                )
            }), 401


        writing = db.session.get(
            Writing,
            writing_id,
        )


        if not writing:

            return jsonify({
                "message": (
                    "Writing not found."
                )
            }), 404


        if writing.user_id != user.id:

            return jsonify({
                "message": (
                    "You are not allowed to "
                    "delete this writing."
                )
            }), 403


        db.session.delete(
            writing
        )

        db.session.commit()


        return jsonify({
            "message": (
                "Writing deleted successfully."
            )
        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "DELETE WRITING ERROR:",
            error,
        )

        return jsonify({
            "message": (
                "Unable to delete writing."
            )
        }), 500