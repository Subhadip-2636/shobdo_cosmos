# =========================================================
# SHOBDO - WRITINGS ROUTES
# =========================================================

from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from database import db
from models import User, Writing


# =========================================================
# WRITINGS BLUEPRINT
# =========================================================

writings_bp = Blueprint(
    "writings",
    __name__,
    url_prefix="/api/writings"
)


# =========================================================
# HELPER FUNCTION
# =========================================================

def writing_to_dict(writing):
    return {
        "id": writing.id,
        "title": writing.title,
        "content": writing.content,
        "category": writing.category,
        "author_id": writing.author_id,

        "created_at": (
            writing.created_at.isoformat()
            if writing.created_at
            else None
        ),

        "updated_at": (
            writing.updated_at.isoformat()
            if writing.updated_at
            else None
        ),

        "author": {
            "id": writing.author.id,
            "name": writing.author.name,
        } if writing.author else None,
    }


# =========================================================
# GET ALL WRITINGS
#
# PUBLIC ROUTE
#
# GET /api/writings
# =========================================================

@writings_bp.route("", methods=["GET"])
def get_all_writings():

    try:

        writings = Writing.query.order_by(
            Writing.created_at.desc()
        ).all()

        return jsonify({
            "writings": [
                writing_to_dict(writing)
                for writing in writings
            ]
        }), 200

    except Exception as error:

        print(
            "GET ALL WRITINGS ERROR:",
            error
        )

        return jsonify({
            "message": "Unable to load writings",
            "writings": []
        }), 500


# =========================================================
# GET ONE WRITING
#
# PUBLIC ROUTE
#
# GET /api/writings/1
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["GET"]
)
def get_single_writing(writing_id):

    try:

        writing = db.session.get(
            Writing,
            writing_id
        )

        if not writing:

            return jsonify({
                "message": "Writing not found"
            }), 404

        return jsonify({
            "writing":
                writing_to_dict(writing)
        }), 200

    except Exception as error:

        print(
            "GET SINGLE WRITING ERROR:",
            error
        )

        return jsonify({
            "message":
                "Unable to load writing"
        }), 500


# =========================================================
# CREATE / PUBLISH WRITING
#
# PRIVATE ROUTE
# JWT REQUIRED
#
# POST /api/writings
# =========================================================

@writings_bp.route("", methods=["POST"])
@jwt_required()
def create_writing():

    try:

        # -------------------------------------------------
        # GET CURRENT USER
        # -------------------------------------------------

        user_id = get_jwt_identity()

        user = db.session.get(
            User,
            int(user_id)
        )

        if not user:

            return jsonify({
                "message": "User not found"
            }), 404


        # -------------------------------------------------
        # GET REQUEST DATA
        # -------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "message": "Invalid request"
            }), 400


        title = data.get(
            "title",
            ""
        ).strip()


        content = data.get(
            "content",
            ""
        ).strip()


        category = data.get(
            "category",
            "অন্যান্য"
        ).strip()


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not title:

            return jsonify({
                "message": "Title is required"
            }), 400


        if not content:

            return jsonify({
                "message":
                    "Writing content is required"
            }), 400


        allowed_categories = [
            "কবিতা",
            "গল্প",
            "অনুভূতি",
            "প্রবন্ধ",
            "অন্যান্য"
        ]


        if category not in allowed_categories:
            category = "অন্যান্য"


        # -------------------------------------------------
        # CREATE WRITING
        # -------------------------------------------------

        writing = Writing(
            title=title,
            content=content,
            category=category,
            author_id=user.id
        )


        db.session.add(
            writing
        )

        db.session.commit()


        # -------------------------------------------------
        # SUCCESS RESPONSE
        # -------------------------------------------------

        return jsonify({

            "message":
                "Writing published successfully",

            "writing":
                writing_to_dict(writing)

        }), 201


    except Exception as error:

        db.session.rollback()

        print(
            "CREATE WRITING ERROR:",
            error
        )

        return jsonify({
            "message":
                "Unable to publish writing"
        }), 500


# =========================================================
# GET CURRENT USER'S WRITINGS
#
# PRIVATE ROUTE
# JWT REQUIRED
#
# GET /api/writings/mine
# =========================================================

@writings_bp.route(
    "/mine",
    methods=["GET"]
)
@jwt_required()
def get_my_writings():

    try:

        user_id = int(
            get_jwt_identity()
        )


        writings = Writing.query.filter_by(
            author_id=user_id
        ).order_by(
            Writing.created_at.desc()
        ).all()


        return jsonify({

            "writings": [
                writing_to_dict(writing)
                for writing in writings
            ]

        }), 200


    except Exception as error:

        print(
            "GET MY WRITINGS ERROR:",
            error
        )

        return jsonify({
            "message":
                "Unable to load your writings"
        }), 500


# =========================================================
# UPDATE WRITING
#
# PRIVATE ROUTE
# JWT REQUIRED
#
# PUT /api/writings/1
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["PUT"]
)
@jwt_required()
def update_writing(writing_id):

    try:

        user_id = int(
            get_jwt_identity()
        )


        writing = db.session.get(
            Writing,
            writing_id
        )


        if not writing:

            return jsonify({
                "message":
                    "Writing not found"
            }), 404


        # -------------------------------------------------
        # ONLY AUTHOR CAN UPDATE
        # -------------------------------------------------

        if writing.author_id != user_id:

            return jsonify({
                "message":
                    "You are not allowed to edit this writing"
            }), 403


        data = request.get_json()


        if not data:

            return jsonify({
                "message":
                    "Invalid request"
            }), 400


        # -------------------------------------------------
        # UPDATE TITLE
        # -------------------------------------------------

        if "title" in data:

            title = str(
                data.get("title", "")
            ).strip()

            if not title:

                return jsonify({
                    "message":
                        "Title cannot be empty"
                }), 400

            writing.title = title


        # -------------------------------------------------
        # UPDATE CONTENT
        # -------------------------------------------------

        if "content" in data:

            content = str(
                data.get("content", "")
            ).strip()

            if not content:

                return jsonify({
                    "message":
                        "Content cannot be empty"
                }), 400

            writing.content = content


        # -------------------------------------------------
        # UPDATE CATEGORY
        # -------------------------------------------------

        if "category" in data:

            category = str(
                data.get(
                    "category",
                    "অন্যান্য"
                )
            ).strip()


            allowed_categories = [
                "কবিতা",
                "গল্প",
                "অনুভূতি",
                "প্রবন্ধ",
                "অন্যান্য"
            ]


            if category not in allowed_categories:
                category = "অন্যান্য"


            writing.category = category


        db.session.commit()


        return jsonify({

            "message":
                "Writing updated successfully",

            "writing":
                writing_to_dict(writing)

        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "UPDATE WRITING ERROR:",
            error
        )

        return jsonify({
            "message":
                "Unable to update writing"
        }), 500


# =========================================================
# DELETE WRITING
#
# PRIVATE ROUTE
# JWT REQUIRED
#
# DELETE /api/writings/1
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_writing(writing_id):

    try:

        user_id = int(
            get_jwt_identity()
        )


        writing = db.session.get(
            Writing,
            writing_id
        )


        if not writing:

            return jsonify({
                "message":
                    "Writing not found"
            }), 404


        # -------------------------------------------------
        # ONLY AUTHOR CAN DELETE
        # -------------------------------------------------

        if writing.author_id != user_id:

            return jsonify({
                "message":
                    "You are not allowed to delete this writing"
            }), 403


        db.session.delete(
            writing
        )

        db.session.commit()


        return jsonify({
            "message":
                "Writing deleted successfully"
        }), 200


    except Exception as error:

        db.session.rollback()

        print(
            "DELETE WRITING ERROR:",
            error
        )

        return jsonify({
            "message":
                "Unable to delete writing"
        }), 500