from flask import (
    Blueprint,
    jsonify,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from database import db

from models.like import Like
from models.user import User
from models.writing import Writing

from services.notification_service import (
    create_notification,
    delete_notification,
    emit_notification,
)


# =========================================================
# BLUEPRINT
# =========================================================

like_bp = Blueprint(
    "likes",
    __name__,
    url_prefix="/api/likes",
)


# =========================================================
# HELPERS
# =========================================================


def get_current_user():
    """
    Return the currently authenticated active User.

    Returns None when:
    - JWT identity is missing
    - JWT identity is invalid
    - user does not exist
    - user is inactive
    """

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



def get_published_writing(
    writing_id,
):
    """
    Return a published Writing or None.

    Private, draft, deleted, archived, or otherwise
    unpublished writings are treated as unavailable.
    """

    writing = db.session.get(
        Writing,
        writing_id,
    )


    if not writing:
        return None


    if getattr(
        writing,
        "status",
        None,
    ) != "published":

        return None


    return writing



def get_like_count(
    writing_id,
):
    """
    Return total number of likes for a writing.
    """

    return (
        Like.query
        .filter(
            Like.writing_id
            == writing_id
        )
        .count()
    )



def get_user_like(
    user_id,
    writing_id,
):
    """
    Return the Like relationship for one user/writing
    combination, or None.
    """

    return (
        Like.query
        .filter_by(
            user_id=user_id,
            writing_id=writing_id,
        )
        .first()
    )



def serialize_like(
    like,
):
    """
    Safely serialize a Like object.

    Uses model.to_dict() when available, otherwise
    returns a minimal fallback representation.
    """

    if like is None:
        return None


    if hasattr(
        like,
        "to_dict",
    ):

        try:

            return like.to_dict()

        except Exception as error:

            print(
                "LIKE SERIALIZATION WARNING:",
                error,
            )


    created_at = getattr(
        like,
        "created_at",
        None,
    )


    return {
        "id":
            getattr(
                like,
                "id",
                None,
            ),

        "user_id":
            getattr(
                like,
                "user_id",
                None,
            ),

        "writing_id":
            getattr(
                like,
                "writing_id",
                None,
            ),

        "created_at":
            (
                created_at.isoformat()
                if created_at
                else None
            ),
    }


# =========================================================
# GET WRITING LIKE COUNT
#
# GET:
# /api/likes/writing/<writing_id>
#
# Public endpoint
# =========================================================


@like_bp.get(
    "/writing/<int:writing_id>"
)
def get_writing_likes(
    writing_id,
):

    # -----------------------------------------------------
    # WRITING
    # -----------------------------------------------------

    writing = get_published_writing(
        writing_id
    )


    if not writing:

        return jsonify({
            "success": False,
            "message":
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # LIKE COUNT
    # -----------------------------------------------------

    count = get_like_count(
        writing.id
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "success": True,

        "writing_id":
            writing.id,

        "likes_count":
            count,
    }), 200


# =========================================================
# GET CURRENT USER LIKE STATUS
#
# GET:
# /api/likes/writing/<writing_id>/me
#
# Requires JWT
# =========================================================


@like_bp.get(
    "/writing/<int:writing_id>/me"
)
@jwt_required()
def get_my_like_status(
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
                "Authenticated user not found.",
        }), 404


    # -----------------------------------------------------
    # PUBLISHED WRITING
    # -----------------------------------------------------

    writing = get_published_writing(
        writing_id
    )


    if not writing:

        return jsonify({
            "success": False,
            "message":
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # LIKE STATUS
    # -----------------------------------------------------

    like = get_user_like(
        user.id,
        writing.id,
    )


    count = get_like_count(
        writing.id
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "success": True,

        "writing_id":
            writing.id,

        "liked":
            like is not None,

        "likes_count":
            count,

        "like":
            serialize_like(
                like
            ),
    }), 200


# =========================================================
# LIKE WRITING
#
# POST:
# /api/likes/writing/<writing_id>
#
# Requires JWT
# =========================================================


@like_bp.post(
    "/writing/<int:writing_id>"
)
@jwt_required()
def like_writing(
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
                "Authenticated user not found.",
        }), 404


    # -----------------------------------------------------
    # WRITING
    # -----------------------------------------------------

    writing = get_published_writing(
        writing_id
    )


    if not writing:

        return jsonify({
            "success": False,
            "message":
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # CHECK EXISTING LIKE
    # -----------------------------------------------------

    existing_like = get_user_like(
        user.id,
        writing.id,
    )


    # -----------------------------------------------------
    # IDEMPOTENT RESPONSE
    # -----------------------------------------------------

    if existing_like:

        count = get_like_count(
            writing.id
        )


        return jsonify({
            "success": True,

            "message":
                "You already liked this writing.",

            "writing_id":
                writing.id,

            "liked":
                True,

            "likes_count":
                count,

            "like":
                serialize_like(
                    existing_like
                ),
        }), 200


    # -----------------------------------------------------
    # CREATE LIKE OBJECT
    # -----------------------------------------------------

    like = Like(
        user_id=user.id,
        writing_id=writing.id,
    )


    notification = None


    try:

        # -------------------------------------------------
        # ADD LIKE
        # -------------------------------------------------

        db.session.add(
            like
        )


        # -------------------------------------------------
        # FLUSH
        #
        # Gives like.id before final commit when required.
        # -------------------------------------------------

        db.session.flush()


        # -------------------------------------------------
        # CREATE LIKE NOTIFICATION
        #
        # recipient = writing author
        # actor     = user liking the writing
        #
        # Self-likes automatically create no notification
        # because notification_service handles that.
        # -------------------------------------------------

        notification = (
            create_notification(
                recipient_id=
                    writing.user_id,

                actor_id=
                    user.id,

                notification_type=
                    "like",

                writing_id=
                    writing.id,

                commit=False,
            )
        )


        # -------------------------------------------------
        # COMMIT LIKE + NOTIFICATION ATOMICALLY
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "LIKE CREATE ERROR:",
            error,
        )


        return jsonify({
            "success": False,
            "message":
                "Unable to like this writing.",
        }), 500


    # -----------------------------------------------------
    # REAL-TIME NOTIFICATION
    #
    # Only emit after successful database commit.
    #
    # Socket.IO failure should never undo a successful like.
    # -----------------------------------------------------

    if notification:

        try:

            emit_notification(
                notification
            )

        except Exception as error:

            print(
                "LIKE REAL-TIME "
                "NOTIFICATION ERROR:",
                error,
            )


    # -----------------------------------------------------
    # UPDATED COUNT
    # -----------------------------------------------------

    count = get_like_count(
        writing.id
    )


    # -----------------------------------------------------
    # INFORM OTHER FRONTEND COMPONENTS
    #
    # This is returned to the caller. The frontend can use
    # it to immediately update WritingCard / WritingDetails.
    # -----------------------------------------------------

    return jsonify({
        "success": True,

        "message":
            "Writing liked successfully.",

        "writing_id":
            writing.id,

        "liked":
            True,

        "likes_count":
            count,

        "like":
            serialize_like(
                like
            ),
    }), 201


# =========================================================
# UNLIKE WRITING
#
# DELETE:
# /api/likes/writing/<writing_id>
#
# Requires JWT
# =========================================================


@like_bp.delete(
    "/writing/<int:writing_id>"
)
@jwt_required()
def unlike_writing(
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
                "Authenticated user not found.",
        }), 404


    # -----------------------------------------------------
    # WRITING
    # -----------------------------------------------------

    writing = get_published_writing(
        writing_id
    )


    if not writing:

        return jsonify({
            "success": False,
            "message":
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # EXISTING LIKE
    # -----------------------------------------------------

    like = get_user_like(
        user.id,
        writing.id,
    )


    # -----------------------------------------------------
    # IDEMPOTENT RESPONSE
    # -----------------------------------------------------

    if not like:

        count = get_like_count(
            writing.id
        )


        return jsonify({
            "success": True,

            "message":
                "Writing was not liked.",

            "writing_id":
                writing.id,

            "liked":
                False,

            "likes_count":
                count,
        }), 200


    # -----------------------------------------------------
    # DELETE LIKE + NOTIFICATION
    # -----------------------------------------------------

    try:

        # -------------------------------------------------
        # DELETE LIKE
        # -------------------------------------------------

        db.session.delete(
            like
        )


        # -------------------------------------------------
        # DELETE MATCHING LIKE NOTIFICATION
        #
        # Removing a like should remove the corresponding
        # social notification generated by that like.
        # -------------------------------------------------

        delete_notification(
            recipient_id=
                writing.user_id,

            actor_id=
                user.id,

            notification_type=
                "like",

            writing_id=
                writing.id,

            commit=False,
        )


        # -------------------------------------------------
        # COMMIT BOTH ATOMICALLY
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "LIKE DELETE ERROR:",
            error,
        )


        return jsonify({
            "success": False,
            "message":
                "Unable to remove like.",
        }), 500


    # -----------------------------------------------------
    # UPDATED COUNT
    # -----------------------------------------------------

    count = get_like_count(
        writing.id
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "success": True,

        "message":
            "Like removed successfully.",

        "writing_id":
            writing.id,

        "liked":
            False,

        "likes_count":
            count,
    }), 200