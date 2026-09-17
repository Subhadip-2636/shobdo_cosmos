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

from models.saved_writing import SavedWriting
from models.user import User
from models.writing import Writing


# =========================================================
# BLUEPRINT
# =========================================================

saved_bp = Blueprint(
    "saved",
    __name__,
    url_prefix="/api/saved",
)


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user():

    identity = get_jwt_identity()

    try:

        user_id = int(
            identity
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


    user = db.session.get(
        User,
        user_id,
    )


    if not user:

        return None


    if not getattr(
        user,
        "is_active",
        True,
    ):

        return None


    return user


# =========================================================
# SAVE WRITING
# =========================================================
#
# POST
# /api/saved/writing/<writing_id>
#
# =========================================================

@saved_bp.post(
    "/writing/<int:writing_id>"
)
@jwt_required()
def save_writing(
    writing_id,
):

    # -----------------------------------------------------
    # CURRENT USER
    # -----------------------------------------------------

    user = get_current_user()


    if not user:

        return jsonify({
            "success": False,
            "message":
                "User not found.",
        }), 404


    # -----------------------------------------------------
    # WRITING
    # -----------------------------------------------------

    writing = db.session.get(
        Writing,
        writing_id,
    )


    if not writing:

        return jsonify({
            "success": False,
            "message":
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # ONLY PUBLISHED WRITINGS
    # -----------------------------------------------------

    if getattr(
        writing,
        "status",
        None,
    ) != "published":

        return jsonify({
            "success": False,
            "message":
                "Only published writings can be saved.",
        }), 400


    # -----------------------------------------------------
    # CHECK EXISTING SAVE
    # -----------------------------------------------------

    existing = (
        SavedWriting.query
        .filter_by(
            user_id=user.id,
            writing_id=writing.id,
        )
        .first()
    )


    # -----------------------------------------------------
    # IDEMPOTENT RESPONSE
    # -----------------------------------------------------

    if existing:

        return jsonify({
            "success": True,

            "message":
                "Writing is already saved.",

            "saved":
                True,

            "saved_writing":
                existing.to_dict(),
        }), 200


    # -----------------------------------------------------
    # CREATE SAVE
    # -----------------------------------------------------

    saved_writing = SavedWriting(
        user_id=user.id,
        writing_id=writing.id,
    )


    try:

        db.session.add(
            saved_writing
        )

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "SAVE WRITING ERROR:",
            error,
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to save writing.",
        }), 500


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "success": True,

        "message":
            "Writing saved successfully.",

        "saved":
            True,

        "saved_writing":
            saved_writing.to_dict(),
    }), 201


# =========================================================
# UNSAVE WRITING
# =========================================================
#
# DELETE
# /api/saved/writing/<writing_id>
#
# =========================================================

@saved_bp.delete(
    "/writing/<int:writing_id>"
)
@jwt_required()
def unsave_writing(
    writing_id,
):

    user = get_current_user()


    if not user:

        return jsonify({
            "success": False,
            "message":
                "User not found.",
        }), 404


    saved_writing = (
        SavedWriting.query
        .filter_by(
            user_id=user.id,
            writing_id=writing_id,
        )
        .first()
    )


    # -----------------------------------------------------
    # IDEMPOTENT
    # -----------------------------------------------------

    if not saved_writing:

        return jsonify({
            "success": True,

            "message":
                "Writing is not saved.",

            "saved":
                False,
        }), 200


    try:

        db.session.delete(
            saved_writing
        )

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "UNSAVE WRITING ERROR:",
            error,
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to remove saved writing.",
        }), 500


    return jsonify({
        "success": True,

        "message":
            "Writing removed from saved items.",

        "saved":
            False,
    }), 200


# =========================================================
# GET SAVE STATUS
# =========================================================
#
# GET
# /api/saved/writing/<writing_id>/status
#
# =========================================================

@saved_bp.get(
    "/writing/<int:writing_id>/status"
)
@jwt_required()
def get_save_status(
    writing_id,
):

    user = get_current_user()


    if not user:

        return jsonify({
            "success": False,
            "message":
                "User not found.",
        }), 404


    saved_writing = (
        SavedWriting.query
        .filter_by(
            user_id=user.id,
            writing_id=writing_id,
        )
        .first()
    )


    return jsonify({
        "success": True,

        "writing_id":
            writing_id,

        "saved":
            saved_writing is not None,
    }), 200


# =========================================================
# GET CURRENT USER SAVED WRITINGS
# =========================================================
#
# GET:
#
# /api/saved
#
# Optional:
#
# ?page=1
# ?per_page=20
#
# =========================================================

@saved_bp.get("")
@jwt_required()
def get_saved_writings():

    user = get_current_user()


    if not user:

        return jsonify({
            "success": False,
            "message":
                "User not found.",
        }), 404


    # -----------------------------------------------------
    # PAGINATION
    # -----------------------------------------------------

    page = request.args.get(
        "page",
        default=1,
        type=int,
    )

    per_page = request.args.get(
        "per_page",
        default=20,
        type=int,
    )


    if page is None or page < 1:
        page = 1


    if per_page is None or per_page < 1:
        per_page = 20


    per_page = min(
        per_page,
        50,
    )


    # -----------------------------------------------------
    # QUERY
    # -----------------------------------------------------

    query = (
        SavedWriting.query

        .filter(
            SavedWriting.user_id
            == user.id
        )

        .order_by(
            SavedWriting.created_at.desc(),
            SavedWriting.id.desc(),
        )
    )


    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False,
    )


    # -----------------------------------------------------
    # BUILD RESPONSE
    # -----------------------------------------------------

    items = []


    for saved_item in pagination.items:

        writing = saved_item.writing


        if not writing:
            continue


        # Do not expose draft/private/deleted writings.

        if getattr(
            writing,
            "status",
            None,
        ) != "published":

            continue


        items.append({

            "saved_id":
                saved_item.id,

            "saved_at": (
                saved_item.created_at.isoformat()
                if saved_item.created_at
                else None
            ),

            "writing":
                writing.to_dict(),
        })


    return jsonify({
        "success": True,

        "saved_writings":
            items,

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