import hashlib
import re
import secrets

from datetime import datetime, timedelta

from flask import (
    Blueprint,
    current_app,
    jsonify,
    request,
)

from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from flask_mail import Message

from extensions import db, mail
from models.user import User


# =========================================================
# AUTHENTICATION BLUEPRINT
# =========================================================

auth_bp = Blueprint(
    "auth",
    __name__,
)


# =========================================================
# CONSTANTS
# =========================================================

PASSWORD_MIN_LENGTH = 8

RESET_TOKEN_EXPIRY_MINUTES = 30


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def normalize_email(email):
    """
    Normalize an email address before saving/searching.
    """

    if not isinstance(email, str):
        return ""

    return email.strip().lower()


def valid_email(email):
    """
    Basic email-format validation.
    """

    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return bool(
        re.match(
            pattern,
            email,
        )
    )


def validate_password(password):
    """
    Validate password strength.

    Returns:
        (True, None) when valid.
        (False, message) when invalid.
    """

    if not isinstance(password, str):
        return (
            False,
            "Password is required.",
        )

    if len(password) < PASSWORD_MIN_LENGTH:
        return (
            False,
            (
                f"Password must contain at least "
                f"{PASSWORD_MIN_LENGTH} characters."
            ),
        )

    if not re.search(
        r"[A-Z]",
        password,
    ):
        return (
            False,
            (
                "Password must contain at least "
                "one uppercase letter."
            ),
        )

    if not re.search(
        r"[a-z]",
        password,
    ):
        return (
            False,
            (
                "Password must contain at least "
                "one lowercase letter."
            ),
        )

    if not re.search(
        r"\d",
        password,
    ):
        return (
            False,
            (
                "Password must contain at least "
                "one number."
            ),
        )

    return True, None


def hash_reset_token(token):
    """
    Hash reset token before database storage.

    Raw reset tokens must never be stored
    directly in the database.
    """

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def get_user_by_identity(identity):
    """
    Safely convert JWT identity to user ID.
    """

    try:

        user_id = int(identity)

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
# REGISTER
# =========================================================

@auth_bp.route(
    "/register",
    methods=["POST"],
)
def register():

    data = request.get_json(
        silent=True
    ) or {}

    name = str(
        data.get(
            "name",
            "",
        )
    ).strip()

    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )

    password = data.get(
        "password",
        "",
    )

    confirm_password = data.get(
        "confirm_password"
    )

    # -----------------------------------------------------
    # NAME VALIDATION
    # -----------------------------------------------------

    if not name:

        return jsonify({
            "message": "Name is required."
        }), 400

    if len(name) < 2:

        return jsonify({
            "message": (
                "Name must contain at least "
                "2 characters."
            )
        }), 400

    if len(name) > 100:

        return jsonify({
            "message": (
                "Name cannot exceed "
                "100 characters."
            )
        }), 400

    # -----------------------------------------------------
    # EMAIL VALIDATION
    # -----------------------------------------------------

    if not email:

        return jsonify({
            "message": (
                "Email address is required."
            )
        }), 400

    if not valid_email(email):

        return jsonify({
            "message": (
                "Please enter a valid "
                "email address."
            )
        }), 400

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    password_valid, password_error = (
        validate_password(password)
    )

    if not password_valid:

        return jsonify({
            "message": password_error
        }), 400

    # Optional confirmation support
    if (
        confirm_password is not None
        and password != confirm_password
    ):

        return jsonify({
            "message": (
                "Password and confirm password "
                "do not match."
            )
        }), 400

    # -----------------------------------------------------
    # EXISTING ACCOUNT CHECK
    # -----------------------------------------------------

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "message": (
                "An account already exists "
                "with this email address."
            )
        }), 409

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    try:

        user = User(
            name=name,
            email=email,
        )

        user.set_password(
            password
        )

        db.session.add(
            user
        )

        db.session.commit()

        # Create immediate login token
        access_token = create_access_token(
            identity=str(user.id)
        )

        return jsonify({

            "message": (
                "Account created successfully."
            ),

            "access_token": access_token,

            "token": access_token,

            "user": user.to_dict(),

        }), 201

    except Exception as error:

        db.session.rollback()

        current_app.logger.exception(
            "Registration failed: %s",
            error,
        )

        return jsonify({
            "message": (
                "Unable to create account "
                "right now."
            )
        }), 500


# =========================================================
# LOGIN
# =========================================================

@auth_bp.route(
    "/login",
    methods=["POST"],
)
def login():

    data = request.get_json(
        silent=True
    ) or {}

    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )

    password = data.get(
        "password",
        "",
    )

    # -----------------------------------------------------
    # REQUIRED FIELDS
    # -----------------------------------------------------

    if not email or not password:

        return jsonify({
            "message": (
                "Email and password "
                "are required."
            )
        }), 400

    # -----------------------------------------------------
    # FIND ACCOUNT
    # -----------------------------------------------------

    user = User.query.filter_by(
        email=email
    ).first()

    # Same response for bad email/bad password.
    # This avoids exposing account existence.
    if (
        not user
        or not user.check_password(
            password
        )
    ):

        return jsonify({
            "message": (
                "Invalid email or password."
            )
        }), 401

    # -----------------------------------------------------
    # ACCOUNT STATUS
    # -----------------------------------------------------

    if not user.is_active:

        return jsonify({
            "message": (
                "This account is currently "
                "disabled."
            )
        }), 403

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({

        "message": (
            "Login successful."
        ),

        "access_token": access_token,

        # Kept for compatibility if your
        # existing frontend uses data.token
        "token": access_token,

        "user": user.to_dict(),

    }), 200


# =========================================================
# CURRENT USER
# =========================================================

@auth_bp.route(
    "/me",
    methods=["GET"],
)
@jwt_required()
def current_user():

    identity = get_jwt_identity()

    user = get_user_by_identity(
        identity
    )

    if not user:

        return jsonify({
            "message": (
                "User account was not found."
            )
        }), 404

    if not user.is_active:

        return jsonify({
            "message": (
                "This account is currently "
                "disabled."
            )
        }), 403

    return jsonify({
        "user": user.to_dict()
    }), 200


# =========================================================
# FORGOT PASSWORD
# =========================================================

@auth_bp.route(
    "/forgot-password",
    methods=["POST"],
)
def forgot_password():

    data = request.get_json(
        silent=True
    ) or {}

    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )

    if not email:

        return jsonify({
            "message": (
                "Email address is required."
            )
        }), 400

    if not valid_email(email):

        return jsonify({
            "message": (
                "Please enter a valid "
                "email address."
            )
        }), 400

    # -----------------------------------------------------
    # GENERIC RESPONSE
    # -----------------------------------------------------
    #
    # We intentionally return the same response
    # whether the account exists or not.
    #
    # This prevents account enumeration attacks.
    # -----------------------------------------------------

    generic_message = (
        "If an account exists with that email "
        "address, a password reset link has "
        "been sent."
    )

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({
            "message": generic_message
        }), 200

    if not user.is_active:

        return jsonify({
            "message": generic_message
        }), 200

    # -----------------------------------------------------
    # GENERATE SECURE RESET TOKEN
    # -----------------------------------------------------

    raw_token = secrets.token_urlsafe(
        48
    )

    token_hash = hash_reset_token(
        raw_token
    )

    expiry_time = (
        datetime.utcnow()
        + timedelta(
            minutes=(
                RESET_TOKEN_EXPIRY_MINUTES
            )
        )
    )

    user.password_reset_token = (
        token_hash
    )

    user.password_reset_expires = (
        expiry_time
    )

    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        current_app.logger.exception(
            (
                "Unable to save password "
                "reset token: %s"
            ),
            error,
        )

        return jsonify({
            "message": (
                "Unable to process your "
                "request right now."
            )
        }), 500

    # -----------------------------------------------------
    # GENERATE FRONTEND RESET URL
    # -----------------------------------------------------

    frontend_url = (
        current_app.config.get(
            "FRONTEND_URL",
            "http://localhost:5173",
        )
    )

    frontend_url = (
        frontend_url.rstrip("/")
    )

    reset_url = (
        f"{frontend_url}"
        f"/reset-password/"
        f"{raw_token}"
    )

    # -----------------------------------------------------
    # EMAIL
    # -----------------------------------------------------

    subject = (
        "Reset your SHOBDO password"
    )

    text_body = f"""
Hello {user.name},

We received a request to reset the password for your SHOBDO account.

Use the link below to create a new password:

{reset_url}

This link will expire in {RESET_TOKEN_EXPIRY_MINUTES} minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email.

SHOBDO
তোমার শব্দ, তোমার গল্প।
"""

    html_body = f"""
<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f6f3ec;
    font-family: Arial, Helvetica, sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
        background: #f6f3ec;
        padding: 40px 16px;
    "
>
<tr>
<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
        max-width: 560px;
        background: #ffffff;
        border: 1px solid #e5dfd4;
    "
>

<tr>
<td style="
    padding: 42px 40px;
">

<div style="
    text-align: center;
    margin-bottom: 32px;
">

<div style="
    font-family: Georgia, serif;
    font-size: 26px;
    font-weight: bold;
    letter-spacing: 4px;
    color: #4d1778;
">
SHOBDO
</div>

<div style="
    margin-top: 5px;
    color: #927641;
    font-size: 13px;
">
তোমার শব্দ, তোমার গল্প।
</div>

</div>


<h1 style="
    margin: 0 0 18px;
    font-family: Georgia, serif;
    font-size: 28px;
    color: #191816;
">
Reset your password
</h1>


<p style="
    margin: 0 0 16px;
    color: #655f55;
    font-size: 15px;
    line-height: 1.7;
">
Hello {user.name},
</p>


<p style="
    margin: 0 0 26px;
    color: #655f55;
    font-size: 15px;
    line-height: 1.7;
">
We received a request to reset the
password for your SHOBDO account.
Click the button below to create a
new password.
</p>


<div style="
    text-align: center;
    margin: 32px 0;
">

<a
    href="{reset_url}"
    style="
        display: inline-block;
        padding: 15px 28px;
        background: #181817;
        color: #ffffff;
        text-decoration: none;
        font-size: 15px;
        font-weight: bold;
    "
>
Reset Password
</a>

</div>


<p style="
    margin: 26px 0 0;
    color: #81786b;
    font-size: 13px;
    line-height: 1.7;
">
This secure link expires in
{RESET_TOKEN_EXPIRY_MINUTES} minutes
and can only be used once.
</p>


<p style="
    margin: 18px 0 0;
    color: #81786b;
    font-size: 13px;
    line-height: 1.7;
">
If you did not request this password
reset, no action is required.
</p>


<div style="
    margin-top: 32px;
    padding-top: 22px;
    border-top: 1px solid #eee8dd;
    color: #a09789;
    font-size: 11px;
    line-height: 1.6;
">
For security, never share this password
reset link with another person.
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
"""

    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:

        message = Message(
            subject=subject,
            recipients=[
                user.email
            ],
        )

        message.body = text_body

        message.html = html_body

        mail.send(
            message
        )

    except Exception as error:

        # Do not expose mail-server information
        # to the frontend.

        current_app.logger.exception(
            (
                "Unable to send password "
                "reset email: %s"
            ),
            error,
        )

        # Clear the token because the email
        # was not successfully delivered.

        user.clear_password_reset_token()

        try:

            db.session.commit()

        except Exception:

            db.session.rollback()

        return jsonify({
            "message": (
                "We could not send the reset "
                "email right now. Please try "
                "again later."
            )
        }), 500

    return jsonify({
        "message": generic_message
    }), 200


# =========================================================
# VALIDATE PASSWORD RESET TOKEN
# =========================================================

@auth_bp.route(
    "/reset-password/<token>",
    methods=["GET"],
)
def validate_reset_token(token):

    if not token:

        return jsonify({
            "valid": False,
            "message": (
                "Invalid password reset link."
            ),
        }), 400

    token_hash = hash_reset_token(
        token
    )

    user = User.query.filter_by(
        password_reset_token=(
            token_hash
        )
    ).first()

    if not user:

        return jsonify({
            "valid": False,
            "message": (
                "This password reset link "
                "is invalid or has already "
                "been used."
            ),
        }), 400

    if (
        not user.password_reset_expires
        or user.password_reset_expires
        < datetime.utcnow()
    ):

        user.clear_password_reset_token()

        try:

            db.session.commit()

        except Exception:

            db.session.rollback()

        return jsonify({
            "valid": False,
            "message": (
                "This password reset link "
                "has expired."
            ),
        }), 400

    return jsonify({
        "valid": True,
        "message": (
            "Password reset link is valid."
        ),
    }), 200


# =========================================================
# RESET PASSWORD
# =========================================================

@auth_bp.route(
    "/reset-password/<token>",
    methods=["POST"],
)
def reset_password(token):

    data = request.get_json(
        silent=True
    ) or {}

    password = data.get(
        "password",
        "",
    )

    confirm_password = data.get(
        "confirm_password",
        "",
    )

    # -----------------------------------------------------
    # PASSWORD CHECK
    # -----------------------------------------------------

    password_valid, password_error = (
        validate_password(
            password
        )
    )

    if not password_valid:

        return jsonify({
            "message": password_error
        }), 400

    if (
        password
        != confirm_password
    ):

        return jsonify({
            "message": (
                "Passwords do not match."
            )
        }), 400

    # -----------------------------------------------------
    # FIND TOKEN
    # -----------------------------------------------------

    token_hash = hash_reset_token(
        token
    )

    user = User.query.filter_by(
        password_reset_token=(
            token_hash
        )
    ).first()

    if not user:

        return jsonify({
            "message": (
                "This password reset link "
                "is invalid or has already "
                "been used."
            )
        }), 400

    # -----------------------------------------------------
    # CHECK EXPIRATION
    # -----------------------------------------------------

    if (
        not user.password_reset_expires
        or user.password_reset_expires
        < datetime.utcnow()
    ):

        user.clear_password_reset_token()

        try:

            db.session.commit()

        except Exception:

            db.session.rollback()

        return jsonify({
            "message": (
                "This password reset link "
                "has expired. Please request "
                "a new one."
            )
        }), 400

    # -----------------------------------------------------
    # ACCOUNT STATUS
    # -----------------------------------------------------

    if not user.is_active:

        return jsonify({
            "message": (
                "This account is currently "
                "disabled."
            )
        }), 403

    # -----------------------------------------------------
    # PREVENT SAME PASSWORD
    # -----------------------------------------------------

    try:

        if user.check_password(
            password
        ):

            return jsonify({
                "message": (
                    "Your new password must "
                    "be different from your "
                    "current password."
                )
            }), 400

    except Exception:

        pass

    # -----------------------------------------------------
    # UPDATE PASSWORD
    # -----------------------------------------------------

    try:

        user.set_password(
            password
        )

        # Makes the token single-use.
        user.clear_password_reset_token()

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        current_app.logger.exception(
            (
                "Password reset failed: %s"
            ),
            error,
        )

        return jsonify({
            "message": (
                "Unable to update your "
                "password right now."
            )
        }), 500

    return jsonify({

        "message": (
            "Password changed successfully. "
            "You can now log in using your "
            "new password."
        )

    }), 200


# =========================================================
# LOGOUT
# =========================================================

@auth_bp.route(
    "/logout",
    methods=["POST"],
)
@jwt_required()
def logout():

    # JWT is currently stored/managed by
    # the frontend.
    #
    # The frontend removes the token when
    # logging out.
    #
    # Token revocation/blacklisting can be
    # added later if required.

    return jsonify({
        "message": (
            "Logged out successfully."
        )
    }), 200