from flask import Blueprint, jsonify
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from database import db
from models.like import Like
from models.user import User
from models.writing import Writing


like_bp = Blueprint(
    "likes",
    __name__,
    url_prefix="/api/likes",
)


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


@like_bp.get("/writing/<int:writing_id>")
def get_writing_likes(
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

    count = Like.query.filter_by(
        writing_id=writing_id,
    ).count()

    return jsonify({
        "writing_id": writing_id,
        "likes_count": count,
    }), 200


@like_bp.get(
    "/writing/<int:writing_id>/me"
)
@jwt_required()
def get_my_like_status(
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

    like = Like.query.filter_by(
        user_id=user.id,
        writing_id=writing_id,
    ).first()

    count = Like.query.filter_by(
        writing_id=writing_id,
    ).count()

    return jsonify({
        "liked": like is not None,
        "likes_count": count,
    }), 200


@like_bp.post(
    "/writing/<int:writing_id>"
)
@jwt_required()
def like_writing(
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

    print(
        "LIKE DEBUG:",
        "writing_id =", writing_id,
        "status =", repr(
            getattr(
                writing,
                "status",
                None,
            )
        ) if writing else None,
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
                "Only published writings can be liked."
        }), 400

    existing_like = Like.query.filter_by(
        user_id=user.id,
        writing_id=writing_id,
    ).first()

    if existing_like:
        count = Like.query.filter_by(
            writing_id=writing_id,
        ).count()

        return jsonify({
            "message":
                "You already liked this writing.",
            "liked": True,
            "likes_count": count,
        }), 200

    like = Like(
        user_id=user.id,
        writing_id=writing_id,
    )

    db.session.add(like)
    db.session.commit()

    count = Like.query.filter_by(
        writing_id=writing_id,
    ).count()

    return jsonify({
        "message":
            "Writing liked successfully.",
        "liked": True,
        "likes_count": count,
        "like": like.to_dict(),
    }), 201


@like_bp.delete(
    "/writing/<int:writing_id>"
)
@jwt_required()
def unlike_writing(
    writing_id,
):
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    like = Like.query.filter_by(
        user_id=user.id,
        writing_id=writing_id,
    ).first()

    if not like:
        count = Like.query.filter_by(
            writing_id=writing_id,
        ).count()

        return jsonify({
            "message":
                "Writing was not liked.",
            "liked": False,
            "likes_count": count,
        }), 200

    db.session.delete(like)
    db.session.commit()

    count = Like.query.filter_by(
        writing_id=writing_id,
    ).count()

    return jsonify({
        "message":
            "Like removed successfully.",
        "liked": False,
        "likes_count": count,
    }), 200