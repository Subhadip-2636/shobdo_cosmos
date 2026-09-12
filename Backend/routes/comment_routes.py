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
    create_notification,
    delete_notification,
    emit_notification,
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
# CURRENT USER HELPER
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

    return db.session.get(
        User,
        user_id,
    )


# =========================================================
# GET COMMENTS FOR A WRITING
# =========================================================

@comment_bp.get(
    "/writing/<int:writing_id>"
)
def get_comments(
    writing_id,
):

    # -----------------------------------------------------
    # GET WRITING
    # -----------------------------------------------------

    writing = db.session.get(
        Writing,
        writing_id,
    )

    if not writing:

        return jsonify({
            "message":
                "Writing not found."
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
            "message":
                "Writing not found."
        }), 404


    # -----------------------------------------------------
    # GET COMMENTS
    # -----------------------------------------------------

    comments = (
        Comment.query
        .filter_by(
            writing_id=writing_id
        )
        .order_by(
            Comment.created_at.desc()
        )
        .all()
    )


    return jsonify({
        "comments": [
            comment.to_dict()
            for comment
            in comments
        ],
        "count":
            len(comments),
    }), 200


# =========================================================
# CREATE COMMENT
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
            "message":
                "User not found."
        }), 404


    # -----------------------------------------------------
    # GET WRITING
    # -----------------------------------------------------

    writing = db.session.get(
        Writing,
        writing_id,
    )


    if not writing:

        return jsonify({
            "message":
                "Writing not found."
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
            "message":
                (
                    "Only published writings "
                    "can receive comments."
                )
        }), 400


    # -----------------------------------------------------
    # GET REQUEST DATA
    # -----------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}


    content = (
        data.get(
            "content",
            ""
        )
        .strip()
    )


    # -----------------------------------------------------
    # VALIDATE COMMENT
    # -----------------------------------------------------

    if not content:

        return jsonify({
            "message":
                "Comment cannot be empty."
        }), 400


    if len(content) > MAX_COMMENT_LENGTH:

        return jsonify({
            "message":
                (
                    f"Comment cannot exceed "
                    f"{MAX_COMMENT_LENGTH} characters."
                )
        }), 400


    # -----------------------------------------------------
    # CREATE COMMENT
    # -----------------------------------------------------

    comment = Comment(
        content=content,
        user_id=user.id,
        writing_id=writing_id,
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
        # FLUSH COMMENT
        # -------------------------------------------------
        #
        # This gives us comment.id without committing.
        #
        # -------------------------------------------------

        db.session.flush()


        # -------------------------------------------------
        # CREATE COMMENT NOTIFICATION
        # -------------------------------------------------
        #
        # Recipient = writing author
        # Actor     = commenting user
        #
        # Self-comments automatically return None.
        #
        # -------------------------------------------------

        notification = create_notification(
            recipient_id=
                writing.user_id,

            actor_id=
                user.id,

            notification_type=
                "comment",

            writing_id=
                writing.id,

            comment_id=
                comment.id,
        )


        # -------------------------------------------------
        # COMMIT COMMENT + NOTIFICATION
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "CREATE COMMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to add comment."
        }), 500


    # -----------------------------------------------------
    # REAL-TIME NOTIFICATION
    # -----------------------------------------------------
    #
    # Emit only AFTER the database transaction succeeds.
    #
    # If Socket.IO fails, the comment remains saved.
    #
    # -----------------------------------------------------

    if notification:

        try:

            emit_notification(
                notification
            )

        except Exception as error:

            print(
                "COMMENT REAL-TIME "
                "NOTIFICATION ERROR:",
                error,
            )


    # -----------------------------------------------------
    # SUCCESS RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "message":
            "Comment added successfully.",

        "comment":
            comment.to_dict(),
    }), 201


# =========================================================
# DELETE COMMENT
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
            "message":
                "User not found."
        }), 404


    # -----------------------------------------------------
    # GET COMMENT
    # -----------------------------------------------------

    comment = db.session.get(
        Comment,
        comment_id,
    )


    if not comment:

        return jsonify({
            "message":
                "Comment not found."
        }), 404


    # -----------------------------------------------------
    # OWNERSHIP CHECK
    # -----------------------------------------------------

    if comment.user_id != user.id:

        return jsonify({
            "message":
                (
                    "You can only delete "
                    "your own comments."
                )
        }), 403


    # -----------------------------------------------------
    # GET RELATED WRITING
    # -----------------------------------------------------

    writing = db.session.get(
        Writing,
        comment.writing_id,
    )


    # -----------------------------------------------------
    # SAVE VALUES BEFORE DELETE
    # -----------------------------------------------------

    writing_id = comment.writing_id

    comment_user_id = comment.user_id

    deleted_comment_id = comment.id


    try:

        # -------------------------------------------------
        # DELETE ASSOCIATED NOTIFICATION
        # -------------------------------------------------

        if writing:

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
            )


        # -------------------------------------------------
        # DELETE COMMENT
        # -------------------------------------------------

        db.session.delete(
            comment
        )


        # -------------------------------------------------
        # COMMIT BOTH TOGETHER
        # -------------------------------------------------

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "DELETE COMMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to delete comment."
        }), 500


    # -----------------------------------------------------
    # SUCCESS RESPONSE
    # -----------------------------------------------------

    return jsonify({
        "message":
            "Comment deleted successfully."
    }), 200