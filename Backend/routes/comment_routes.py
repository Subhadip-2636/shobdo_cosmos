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


comment_bp = Blueprint(
    "comments",
    __name__,
    url_prefix="/api/comments",
)


MAX_COMMENT_LENGTH = 2000


def get_current_user():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(
        User,
        user_id,
    )


@comment_bp.get(
    "/writing/<int:writing_id>"
)
def get_comments(
    writing_id,
):
    writing = db.session.get(
        Writing,
        writing_id,
    )

    if not writing:
        return jsonify({
            "message": "Writing not found."
        }), 404

    if getattr(
        writing,
        "status",
        None,
    ) != "published":
        return jsonify({
            "message": "Writing not found."
        }), 404

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
        "count": len(comments),
    }), 200


@comment_bp.post(
    "/writing/<int:writing_id>"
)
@jwt_required()
def create_comment(
    writing_id,
):
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    writing = db.session.get(
        Writing,
        writing_id,
    )

    if not writing:
        return jsonify({
            "message": "Writing not found."
        }), 404

    if getattr(
        writing,
        "status",
        None,
    ) != "published":
        return jsonify({
            "message":
                "Only published writings can receive comments."
        }), 400

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

    if not content:
        return jsonify({
            "message":
                "Comment cannot be empty."
        }), 400

    if len(content) > MAX_COMMENT_LENGTH:
        return jsonify({
            "message":
                f"Comment cannot exceed "
                f"{MAX_COMMENT_LENGTH} characters."
        }), 400

    comment = Comment(
        content=content,
        user_id=user.id,
        writing_id=writing_id,
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "message":
            "Comment added successfully.",
        "comment":
            comment.to_dict(),
    }), 201


@comment_bp.delete(
    "/<int:comment_id>"
)
@jwt_required()
def delete_comment(
    comment_id,
):
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    comment = db.session.get(
        Comment,
        comment_id,
    )

    if not comment:
        return jsonify({
            "message":
                "Comment not found."
        }), 404

    if comment.user_id != user.id:
        return jsonify({
            "message":
                "You can only delete your own comments."
        }), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({
        "message":
            "Comment deleted successfully."
    }), 200