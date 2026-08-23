# =========================================================
# SHOBDO - AUTHENTICATION ROUTES
# =========================================================

from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from database import db
from models import User


# =========================================================
# AUTH BLUEPRINT
# =========================================================

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =========================================================
# REGISTER
#
# POST /api/auth/register
# =========================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "message": "Invalid request"
            }), 400


        # -------------------------------------------------
        # GET FORM DATA
        # -------------------------------------------------

        name = data.get("name", "").strip()

        email = data.get(
            "email",
            ""
        ).strip().lower()

        password = data.get(
            "password",
            ""
        )


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not name:
            return jsonify({
                "message": "Name is required"
            }), 400


        if not email:
            return jsonify({
                "message": "Email is required"
            }), 400


        if not password:
            return jsonify({
                "message": "Password is required"
            }), 400


        if len(password) < 6:
            return jsonify({
                "message":
                "Password must be at least 6 characters"
            }), 400


        # -------------------------------------------------
        # CHECK WHETHER EMAIL ALREADY EXISTS
        # -------------------------------------------------

        existing_user = User.query.filter_by(
            email=email
        ).first()


        if existing_user:
            return jsonify({
                "message":
                "An account already exists with this email"
            }), 409


        # -------------------------------------------------
        # HASH PASSWORD
        # -------------------------------------------------

        hashed_password = generate_password_hash(
            password
        )


        # -------------------------------------------------
        # CREATE USER
        # -------------------------------------------------

        new_user = User(
            name=name,
            email=email,
            password_hash=hashed_password
        )


        db.session.add(
            new_user
        )


        db.session.commit()


        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        return jsonify({

            "message":
            "Registration successful",

            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }

        }), 201


    except Exception as error:

        db.session.rollback()

        print(
            "REGISTER ERROR:",
            error
        )

        return jsonify({
            "message":
            "Something went wrong during registration"
        }), 500


# =========================================================
# LOGIN
#
# POST /api/auth/login
# =========================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()


        if not data:
            return jsonify({
                "message":
                "Invalid request"
            }), 400


        # -------------------------------------------------
        # GET LOGIN DATA
        # -------------------------------------------------

        email = data.get(
            "email",
            ""
        ).strip().lower()


        password = data.get(
            "password",
            ""
        )


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not email:
            return jsonify({
                "message":
                "Email is required"
            }), 400


        if not password:
            return jsonify({
                "message":
                "Password is required"
            }), 400


        # -------------------------------------------------
        # FIND USER
        # -------------------------------------------------

        user = User.query.filter_by(
            email=email
        ).first()


        if not user:
            return jsonify({
                "message":
                "Invalid email or password"
            }), 401


        # -------------------------------------------------
        # VERIFY PASSWORD
        # -------------------------------------------------

        password_correct = check_password_hash(
            user.password_hash,
            password
        )


        if not password_correct:
            return jsonify({
                "message":
                "Invalid email or password"
            }), 401


        # -------------------------------------------------
        # CREATE JWT ACCESS TOKEN
        # -------------------------------------------------

        access_token = create_access_token(
            identity=str(user.id)
        )


        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        return jsonify({

            "message":
            "Login successful",

            "access_token":
            access_token,

            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }

        }), 200


    except Exception as error:

        print(
            "LOGIN ERROR:",
            error
        )

        return jsonify({
            "message":
            "Something went wrong during login"
        }), 500


# =========================================================
# CURRENT LOGGED-IN USER
#
# GET /api/auth/me
#
# JWT REQUIRED
# =========================================================

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def current_user():

    try:

        user_id = get_jwt_identity()


        user = db.session.get(
            User,
            int(user_id)
        )


        if not user:
            return jsonify({
                "message":
                "User not found"
            }), 404


        return jsonify({

            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,

                "created_at": (
                    user.created_at.isoformat()
                    if user.created_at
                    else None
                )
            }

        }), 200


    except Exception as error:

        print(
            "CURRENT USER ERROR:",
            error
        )

        return jsonify({
            "message":
            "Unable to fetch current user"
        }), 500