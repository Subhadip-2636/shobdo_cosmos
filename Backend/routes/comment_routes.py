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

from models.comment import Comment
from models.user import User
from models.writing import Writing

from services.notification_service import (
    delete_notification,
    emit_notification,
    notify_comment,
    notify_comment_reply,
)


# =========================================================
# BLUEPRINT
# =========================================================

comment_bp = Blueprint(
    "comments",
    __name__,
    url_prefix="/api/comments",
)


# =========================================================
# CONFIGURATION
# =========================================================

MAX_COMMENT_LENGTH = 2000


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
# COMMENT CONTENT VALIDATION
# =========================================================

def validate_comment_content(
    value,
):

    content = str(
        value or ""
    ).strip()


    if not content:

        return (
            None,
            "Comment cannot be empty.",
        )


    if (
        len(content) >
        MAX_COMMENT_LENGTH
    ):

        return (
            None,
            (
                "Comment cannot exceed "
                f"{MAX_COMMENT_LENGTH} characters."
            ),
        )


    return (
        content,
        None,
    )


# =========================================================
# GET COMMENTS FOR WRITING
# =========================================================
#
# GET
# /api/comments/writing/<writing_id>
#
# Returns only top-level comments in the main array.
#
# Replies are nested inside:
#
# comment.replies
#
# =========================================================

@comment_bp.get(
    "/writing/<int:writing_id>"
)
def get_comments(
    writing_id,
):

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
                "Writing not found.",
        }), 404


    # -----------------------------------------------------
    # TOP-LEVEL COMMENTS
    # -----------------------------------------------------

    comments = (
        Comment.query

        .filter(
            Comment.writing_id
            == writing_id,

            Comment.parent_id
            .is_(None),
        )

        .order_by(
            Comment.created_at.desc()
        )

        .all()
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "comments": [

            comment.to_dict(
                include_replies=True,
                reply_depth=5,
            )

            for comment
            in comments

        ],

        "count":
            len(comments),

        "total_comments":
            Comment.query
            .filter(
                Comment.writing_id
                == writing_id
            )
            .count(),

    }), 200


# =========================================================
# CREATE COMMENT OR REPLY
# =========================================================
#
# POST
# /api/comments/writing/<writing_id>
#
# Normal comment:
#
# {
#     "content": "Beautiful writing"
# }
#
# Reply:
#
# {
#     "content": "Thank you",
#     "parent_id": 12
# }
#
# =========================================================

@comment_bp.post(
    "/writing/<int:writing_id>"
)
@jwt_required()
def create_comment(
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
                (
                    "Only published writings "
                    "can receive comments."
                ),
        }), 400


    # -----------------------------------------------------
    # REQUEST BODY
    # -----------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}


    # -----------------------------------------------------
    # CONTENT
    # -----------------------------------------------------

    content, validation_error = (
        validate_comment_content(
            data.get(
                "content"
            )
        )
    )


    if validation_error:

        return jsonify({
            "success": False,
            "message":
                validation_error,
        }), 400


    # -----------------------------------------------------
    # OPTIONAL PARENT COMMENT
    # -----------------------------------------------------

    parent_id = data.get(
        "parent_id"
    )


    parent_comment = None


    if parent_id not in (
        None,
        "",
    ):

        try:

            parent_id = int(
                parent_id
            )

        except (
            TypeError,
            ValueError,
        ):

            return jsonify({
                "success": False,
                "message":
                    "Invalid parent comment.",
            }), 400


        parent_comment = db.session.get(
            Comment,
            parent_id,
        )


        if not parent_comment:

            return jsonify({
                "success": False,
                "message":
                    "Parent comment not found.",
            }), 404


        # -------------------------------------------------
        # SECURITY / DATA INTEGRITY
        #
        # Cannot reply to a comment from another writing.
        # -------------------------------------------------

        if (
            parent_comment.writing_id
            != writing.id
        ):

            return jsonify({
                "success": False,
                "message":
                    (
                        "Parent comment does not "
                        "belong to this writing."
                    ),
            }), 400


    # -----------------------------------------------------
    # CREATE COMMENT
    # -----------------------------------------------------

    comment = Comment(
        content=content,
        user_id=user.id,
        writing_id=writing.id,
        parent_id=(
            parent_comment.id
            if parent_comment
            else None
        ),
    )


    notification = None


    try:

        # -------------------------------------------------
        # ADD COMMENT
        # -------------------------------------------------

        db.session.add(
            comment
        )


        # -------------------------------------------------
        # FLUSH
        #
        # Gives comment.id before commit.
        # -------------------------------------------------

        db.session.flush()


        # =================================================
        # REPLY NOTIFICATION
        # =================================================

        if parent_comment:

            notification = (
                notify_comment_reply(
                    recipient_id=
                        parent_comment.user_id,

                    actor_id=
                        user.id,

                    writing_id=
                        writing.id,

                    comment_id=
                        comment.id,

                    commit=False,
                )
            )


        # =================================================
        # NORMAL COMMENT NOTIFICATION
        # =================================================

        else:

            notification = (
                notify_comment(
                    recipient_id=
                        writing.user_id,

                    actor_id=
                        user.id,

                    writing_id=
                        writing.id,

                    comment_id=
                        comment.id,

                    commit=False,
                )
            )


        # -------------------------------------------------
        # COMMIT COMMENT + NOTIFICATION TOGETHER
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "CREATE COMMENT ERROR:",
            error,
        )


        return jsonify({
            "success": False,
            "message":
                "Unable to add comment.",
        }), 500


    # -----------------------------------------------------
    # REAL-TIME NOTIFICATION
    # -----------------------------------------------------

    if notification:

        try:

            emit_notification(
                notification
            )


        except Exception as error:

            # Comment is already safely committed.
            # Socket failure must not undo it.

            print(
                "COMMENT REAL-TIME "
                "NOTIFICATION ERROR:",
                error,
            )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "message":
            (
                "Reply added successfully."
                if parent_comment
                else
                "Comment added successfully."
            ),

        "is_reply":
            parent_comment
            is not None,

        "comment":
            comment.to_dict(
                include_replies=True,
                reply_depth=1,
            ),

    }), 201


# =========================================================
# EDIT COMMENT
# =========================================================
#
# PATCH
# /api/comments/<comment_id>
#
# {
#     "content": "Updated comment"
# }
#
# =========================================================

@comment_bp.patch(
    "/<int:comment_id>"
)
@jwt_required()
def update_comment(
    comment_id,
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
    # COMMENT
    # -----------------------------------------------------

    comment = db.session.get(
        Comment,
        comment_id,
    )


    if not comment:

        return jsonify({
            "success": False,
            "message":
                "Comment not found.",
        }), 404


    # -----------------------------------------------------
    # OWNERSHIP
    # -----------------------------------------------------

    if (
        comment.user_id
        != user.id
    ):

        return jsonify({
            "success": False,
            "message":
                (
                    "You can only edit "
                    "your own comments."
                ),
        }), 403


    # -----------------------------------------------------
    # REQUEST BODY
    # -----------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}


    content, validation_error = (
        validate_comment_content(
            data.get(
                "content"
            )
        )
    )


    if validation_error:

        return jsonify({
            "success": False,
            "message":
                validation_error,
        }), 400


    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    try:

        comment.update_content(
            content
        )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "UPDATE COMMENT ERROR:",
            error,
        )


        return jsonify({
            "success": False,
            "message":
                "Unable to update comment.",
        }), 500


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "message":
            "Comment updated successfully.",

        "comment":
            comment.to_dict(
                include_replies=True,
                reply_depth=1,
            ),

    }), 200


# =========================================================
# DELETE COMMENT
# =========================================================
#
# DELETE
# /api/comments/<comment_id>
#
# Deleting a parent comment also deletes its replies
# through ON DELETE CASCADE / SQLAlchemy relationship.
#
# =========================================================

@comment_bp.delete(
    "/<int:comment_id>"
)
@jwt_required()
def delete_comment(
    comment_id,
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
    # COMMENT
    # -----------------------------------------------------

    comment = db.session.get(
        Comment,
        comment_id,
    )


    if not comment:

        return jsonify({
            "success": False,
            "message":
                "Comment not found.",
        }), 404


    # -----------------------------------------------------
    # OWNERSHIP
    # -----------------------------------------------------

    if (
        comment.user_id
        != user.id
    ):

        return jsonify({
            "success": False,
            "message":
                (
                    "You can only delete "
                    "your own comments."
                ),
        }), 403


    # -----------------------------------------------------
    # RELATED WRITING
    # -----------------------------------------------------

    writing = db.session.get(
        Writing,
        comment.writing_id,
    )


    # -----------------------------------------------------
    # SAVE VALUES BEFORE DELETE
    # -----------------------------------------------------

    writing_id = (
        comment.writing_id
    )

    comment_user_id = (
        comment.user_id
    )

    deleted_comment_id = (
        comment.id
    )

    was_reply = (
        comment.parent_id
        is not None
    )


    parent_comment = (
        comment.parent
        if was_reply
        else None
    )


    try:

        # =================================================
        # REMOVE MATCHING NOTIFICATION
        # =================================================

        if was_reply:

            if parent_comment:

                delete_notification(
                    recipient_id=
                        parent_comment.user_id,

                    actor_id=
                        comment_user_id,

                    notification_type=
                        "comment_reply",

                    writing_id=
                        writing_id,

                    comment_id=
                        deleted_comment_id,

                    commit=False,
                )


        elif writing:

            delete_notification(
                recipient_id=
                    writing.user_id,

                actor_id=
                    comment_user_id,

                notification_type=
                    "comment",

                writing_id=
                    writing_id,

                comment_id=
                    deleted_comment_id,

                commit=False,
            )


        # -------------------------------------------------
        # DELETE COMMENT
        # -------------------------------------------------

        db.session.delete(
            comment
        )


        # -------------------------------------------------
        # COMMIT
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "DELETE COMMENT ERROR:",
            error,
        )


        return jsonify({
            "success": False,
            "message":
                "Unable to delete comment.",
        }), 500


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "message":
            (
                "Reply deleted successfully."
                if was_reply
                else
                "Comment deleted successfully."
            ),

        "comment_id":
            deleted_comment_id,

        "is_reply":
            was_reply,

    }), 200