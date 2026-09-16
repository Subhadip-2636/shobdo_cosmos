import hashlib
import os
import re
import secrets

from datetime import (
    datetime,
    timedelta,
    timezone,
)

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

from google.auth.exceptions import (
    GoogleAuthError,
    TransportError,
)

from google.auth.transport import (
    requests as google_requests,
)

from google.oauth2 import (
    id_token as google_id_token,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from extensions import (
    db,
    mail,
)

from models.user import User


# =========================================================
# AUTHENTICATION BLUEPRINT
# =========================================================
#
# app.py should register this blueprint using:
#
# app.register_blueprint(
#     auth_bp,
#     url_prefix="/api/auth",
# )
#
# Final routes:
#
# POST /api/auth/register
# POST /api/auth/login
# POST /api/auth/google
# GET  /api/auth/me
#
# POST /api/auth/forgot-password
# GET  /api/auth/reset-password/<token>
# POST /api/auth/reset-password/<token>
#
# POST /api/auth/logout
#
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

MAX_NAME_LENGTH = 120

MAX_EMAIL_LENGTH = 150


GOOGLE_ISSUERS = {
    "accounts.google.com",
    "https://accounts.google.com",
}


# =========================================================
# TIME
# =========================================================

def utc_now():
    """
    Return a timezone-aware UTC datetime.
    """

    return datetime.now(
        timezone.utc
    )


# =========================================================
# DATETIME NORMALIZER
# =========================================================

def ensure_utc(
    value,
):
    """
    Normalize a datetime into timezone-aware UTC.

    This also keeps compatibility with older database
    rows that may contain naive UTC datetimes.
    """

    if value is None:

        return None


    if value.tzinfo is None:

        return value.replace(
            tzinfo=timezone.utc
        )


    return value.astimezone(
        timezone.utc
    )


# =========================================================
# RESET EXPIRATION CHECK
# =========================================================

def reset_token_expired(
    expires_at,
):

    expires_at = ensure_utc(
        expires_at
    )


    if expires_at is None:

        return True


    return (
        expires_at <
        utc_now()
    )


# =========================================================
# EMAIL NORMALIZER
# =========================================================

def normalize_email(
    email,
):
    """
    Normalize an email before saving/searching.
    """

    if not isinstance(
        email,
        str,
    ):

        return ""


    return (
        email
        .strip()
        .lower()
    )


# =========================================================
# EMAIL VALIDATION
# =========================================================

def valid_email(
    email,
):

    if not email:

        return False


    if (
        len(email) >
        MAX_EMAIL_LENGTH
    ):

        return False


    pattern = (
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )


    return bool(
        re.match(
            pattern,
            email,
        )
    )


# =========================================================
# PASSWORD VALIDATION
# =========================================================

def validate_password(
    password,
):
    """
    Validate SHOBDO password strength.

    Requirements:
    - 8+ characters
    - uppercase letter
    - lowercase letter
    - number
    """

    if not isinstance(
        password,
        str,
    ):

        return (
            False,
            "Password is required.",
        )


    if (
        len(password) <
        PASSWORD_MIN_LENGTH
    ):

        return (
            False,
            (
                "Password must contain at least "
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


    return (
        True,
        None,
    )


# =========================================================
# RESET TOKEN HASH
# =========================================================

def hash_reset_token(
    token,
):
    """
    Store only a SHA-256 hash of password-reset tokens.

    The raw token is sent to the user but is never
    persisted in the database.
    """

    return hashlib.sha256(
        token.encode(
            "utf-8"
        )
    ).hexdigest()


# =========================================================
# CURRENT USER LOOKUP
# =========================================================

def get_user_by_identity(
    identity,
):

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
# CREATE JWT RESPONSE
# =========================================================

def create_login_response(
    user,
    *,
    message,
    status_code=200,
    auth_provider=None,
):
    """
    Issue the same SHOBDO JWT response for password
    authentication and Google authentication.
    """

    access_token = (
        create_access_token(
            identity=str(
                user.id
            )
        )
    )


    payload = {

        "message":
            message,

        # Current preferred name.
        "access_token":
            access_token,

        # Compatibility with existing frontend code.
        "token":
            access_token,

        "user":
            user.to_dict(),
    }


    if auth_provider:

        payload[
            "auth_provider"
        ] = auth_provider


    return jsonify(
        payload
    ), status_code


# =========================================================
# GOOGLE CLIENT ID
# =========================================================

def get_google_client_id():
    """
    Read the Google Web Client ID.

    Supports either Flask configuration or environment
    configuration.
    """

    value = (
        current_app.config.get(
            "GOOGLE_CLIENT_ID"
        )
        or
        os.getenv(
            "GOOGLE_CLIENT_ID"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


# =========================================================
# GOOGLE BOOLEAN
# =========================================================

def google_claim_is_true(
    value,
):

    if value is True:

        return True


    if isinstance(
        value,
        str,
    ):

        return (
            value
            .strip()
            .lower()
            ==
            "true"
        )


    return False


# =========================================================
# GOOGLE AUTHORITATIVE EMAIL
# =========================================================

def google_is_authoritative_for_email(
    *,
    email,
    email_verified,
    hosted_domain,
):
    """
    Determine whether Google is authoritative for the
    supplied email address.

    This matters when automatically linking Google to
    an EXISTING SHOBDO account.

    Safe automatic cases:

    1. @gmail.com
    2. verified Google Workspace account with `hd`

    A Google account can also be created using an
    external email provider. In that situation, we do
    not silently attach it to an existing SHOBDO account.
    """

    if not email_verified:

        return False


    normalized_email = normalize_email(
        email
    )


    if normalized_email.endswith(
        "@gmail.com"
    ):

        return True


    if (
        hosted_domain
        and
        str(
            hosted_domain
        ).strip()
    ):

        return True


    return False


# =========================================================
# VERIFY GOOGLE ID TOKEN
# =========================================================

def verify_google_credential(
    credential,
):
    """
    Verify a Google Identity Services ID token.

    google-auth verifies token signature, audience,
    expiration and related OpenID Connect information.
    """

    google_client_id = (
        get_google_client_id()
    )


    if not google_client_id:

        raise RuntimeError(
            "Google authentication is not configured."
        )


    id_info = (
        google_id_token
        .verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id,
        )
    )


    # Additional explicit issuer validation.
    issuer = str(
        id_info.get(
            "iss",
            ""
        )
    ).strip()


    if (
        issuer not in
        GOOGLE_ISSUERS
    ):

        raise ValueError(
            "Invalid Google token issuer."
        )


    return id_info


# =========================================================
# REGISTER
# =========================================================
#
# POST /api/auth/register
#
# =========================================================

@auth_bp.route(
    "/register",
    methods=[
        "POST",
    ],
)
def register():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    # =====================================================
    # NAME
    # =====================================================

    name = str(
        data.get(
            "name",
            "",
        )
        or ""
    ).strip()


    # =====================================================
    # EMAIL
    # =====================================================

    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )


    # =====================================================
    # PASSWORD
    # =====================================================

    password = (
        data.get(
            "password",
            "",
        )
    )


    confirm_password = (
        data.get(
            "confirm_password"
        )
    )


    # =====================================================
    # NAME VALIDATION
    # =====================================================

    if not name:

        return jsonify({
            "message":
                "Name is required."
        }), 400


    if (
        len(name) <
        2
    ):

        return jsonify({
            "message":
                (
                    "Name must contain at least "
                    "2 characters."
                )
        }), 400


    if (
        len(name) >
        MAX_NAME_LENGTH
    ):

        return jsonify({
            "message":
                (
                    "Name cannot exceed "
                    f"{MAX_NAME_LENGTH} characters."
                )
        }), 400


    # =====================================================
    # EMAIL VALIDATION
    # =====================================================

    if not email:

        return jsonify({
            "message":
                "Email address is required."
        }), 400


    if not valid_email(
        email
    ):

        return jsonify({
            "message":
                "Please enter a valid email address."
        }), 400


    # =====================================================
    # PASSWORD VALIDATION
    # =====================================================

    (
        password_valid,
        password_error,
    ) = validate_password(
        password
    )


    if not password_valid:

        return jsonify({
            "message":
                password_error
        }), 400


    # Optional confirmation support.

    if (
        confirm_password
        is not None
        and
        password !=
        confirm_password
    ):

        return jsonify({
            "message":
                (
                    "Password and confirm password "
                    "do not match."
                )
        }), 400


    # =====================================================
    # EXISTING ACCOUNT
    # =====================================================

    existing_user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if existing_user:

        return jsonify({
            "message":
                (
                    "An account already exists "
                    "with this email address."
                )
        }), 409


    # =====================================================
    # CREATE ACCOUNT
    # =====================================================

    try:

        user = User(
            name=
                name,

            email=
                email,

            # Password-created accounts still need
            # independent email verification.
            email_verified=
                False,

            last_login_at=
                utc_now(),
        )


        user.set_password(
            password
        )


        db.session.add(
            user
        )


        db.session.commit()


        return create_login_response(
            user,
            message=(
                "Account created successfully."
            ),
            status_code=201,
            auth_provider="password",
        )


    except IntegrityError:

        db.session.rollback()


        return jsonify({
            "message":
                (
                    "An account already exists "
                    "with this email address."
                )
        }), 409


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            "Registration failed: %s",
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to create account "
                    "right now."
                )
        }), 500


# =========================================================
# PASSWORD LOGIN
# =========================================================
#
# POST /api/auth/login
#
# =========================================================

@auth_bp.route(
    "/login",
    methods=[
        "POST",
    ],
)
def login():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )


    password = (
        data.get(
            "password",
            "",
        )
    )


    # =====================================================
    # REQUIRED FIELDS
    # =====================================================

    if (
        not email
        or
        not password
    ):

        return jsonify({
            "message":
                (
                    "Email and password "
                    "are required."
                )
        }), 400


    # =====================================================
    # FIND USER
    # =====================================================

    user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    # Same error for unknown email and wrong password,
    # preventing account enumeration.

    if (
        not user
        or
        not user.check_password(
            password
        )
    ):

        return jsonify({
            "message":
                "Invalid email or password."
        }), 401


    # =====================================================
    # ACTIVE STATUS
    # =====================================================

    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


    # =====================================================
    # LOGIN ACTIVITY
    # =====================================================

    try:

        user.mark_login()

        db.session.commit()


    except Exception as error:

        # Login should not fail merely because
        # last-login analytics could not be stored.

        db.session.rollback()


        current_app.logger.warning(
            (
                "Could not update last_login_at "
                "for user %s: %s"
            ),
            user.id,
            error,
        )


    # =====================================================
    # JWT
    # =====================================================

    return create_login_response(
        user,
        message=
            "Login successful.",
        auth_provider=
            "password",
    )


# =========================================================
# GOOGLE LOGIN
# =========================================================
#
# POST /api/auth/google
#
# JSON:
#
# {
#     "credential": "<GOOGLE_ID_TOKEN>"
# }
#
# Google Identity Services returns the ID token in the
# `credential` field.
#
# =========================================================

@auth_bp.route(
    "/google",
    methods=[
        "POST",
    ],
)
def google_login():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    # =====================================================
    # CREDENTIAL
    # =====================================================

    credential = str(
        data.get(
            "credential",
            ""
        )
        or
        data.get(
            "id_token",
            ""
        )
        or
        ""
    ).strip()


    if not credential:

        return jsonify({
            "message":
                (
                    "Google sign-in credential "
                    "is required."
                )
        }), 400


    # =====================================================
    # CONFIGURATION
    # =====================================================

    if not get_google_client_id():

        current_app.logger.error(
            (
                "GOOGLE_CLIENT_ID is missing. "
                "Google authentication cannot run."
            )
        )


        return jsonify({
            "message":
                (
                    "Google sign-in is temporarily "
                    "unavailable."
                )
        }), 503


    # =====================================================
    # VERIFY GOOGLE TOKEN
    # =====================================================

    try:

        google_profile = (
            verify_google_credential(
                credential
            )
        )


    except ValueError as error:

        current_app.logger.warning(
            "Invalid Google ID token: %s",
            error,
        )


        return jsonify({
            "message":
                (
                    "Google sign-in could not be "
                    "verified. Please try again."
                )
        }), 401


    except TransportError as error:

        current_app.logger.exception(
            (
                "Google authentication transport "
                "error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to contact Google "
                    "authentication services. "
                    "Please try again."
                )
        }), 503


    except GoogleAuthError as error:

        current_app.logger.exception(
            "Google authentication error: %s",
            error,
        )


        return jsonify({
            "message":
                (
                    "Google sign-in could not be "
                    "completed."
                )
        }), 401


    except RuntimeError as error:

        current_app.logger.error(
            "Google configuration error: %s",
            error,
        )


        return jsonify({
            "message":
                (
                    "Google sign-in is temporarily "
                    "unavailable."
                )
        }), 503


    except Exception as error:

        current_app.logger.exception(
            (
                "Unexpected Google sign-in "
                "verification error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to complete Google "
                    "sign-in right now."
                )
        }), 500


    # =====================================================
    # GOOGLE CLAIMS
    # =====================================================

    google_sub = str(
        google_profile.get(
            "sub",
            ""
        )
        or ""
    ).strip()


    email = normalize_email(
        google_profile.get(
            "email",
            ""
        )
    )


    email_verified = (
        google_claim_is_true(
            google_profile.get(
                "email_verified"
            )
        )
    )


    hosted_domain = str(
        google_profile.get(
            "hd",
            ""
        )
        or ""
    ).strip()


    google_name = str(
        google_profile.get(
            "name",
            ""
        )
        or ""
    ).strip()


    google_picture = str(
        google_profile.get(
            "picture",
            ""
        )
        or ""
    ).strip()


    # =====================================================
    # REQUIRED GOOGLE CLAIMS
    # =====================================================

    if not google_sub:

        return jsonify({
            "message":
                (
                    "Google did not provide a "
                    "valid account identifier."
                )
        }), 401


    if (
        not email
        or
        not valid_email(
            email
        )
    ):

        return jsonify({
            "message":
                (
                    "Google did not provide a "
                    "valid email address."
                )
        }), 400


    if not email_verified:

        return jsonify({
            "message":
                (
                    "Your Google email address "
                    "has not been verified."
                )
        }), 403


    # =====================================================
    # 1. EXISTING GOOGLE-LINKED USER
    # =====================================================
    #
    # `sub` is Google's stable account identifier.
    #
    # Once linked, this is always the primary lookup.
    #
    # =====================================================

    user = (
        User.query
        .filter_by(
            google_sub=
                google_sub
        )
        .first()
    )


    if user:

        if not user.is_active:

            return jsonify({
                "message":
                    (
                        "This account is currently "
                        "disabled."
                    )
            }), 403


        try:

            # Do not overwrite a user's chosen avatar.
            if (
                google_picture
                and
                not user.avatar_url
            ):

                user.avatar_url = (
                    google_picture
                )


            user.email_verified = (
                True
            )


            user.mark_login()


            db.session.commit()


        except Exception as error:

            db.session.rollback()


            current_app.logger.exception(
                (
                    "Google-linked account "
                    "update failed: %s"
                ),
                error,
            )


            return jsonify({
                "message":
                    (
                        "Unable to complete Google "
                        "sign-in right now."
                    )
            }), 500


        return create_login_response(
            user,
            message=
                "Google sign-in successful.",
            auth_provider=
                "google",
        )


    # =====================================================
    # 2. CHECK EXISTING SHOBDO EMAIL ACCOUNT
    # =====================================================

    existing_user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if existing_user:

        # =================================================
        # DISABLED ACCOUNT
        # =================================================

        if not existing_user.is_active:

            return jsonify({
                "message":
                    (
                        "This account is currently "
                        "disabled."
                    )
            }), 403


        # =================================================
        # CONFLICTING GOOGLE LINK
        # =================================================

        if (
            existing_user.google_sub
            and
            existing_user.google_sub
            != google_sub
        ):

            return jsonify({

                "code":
                    "google_account_conflict",

                "message":
                    (
                        "This SHOBDO account is already "
                        "connected to another Google "
                        "account."
                    ),

            }), 409


        # =================================================
        # SAFE AUTOMATIC LINKING CHECK
        # =================================================
        #
        # Google warns that it is not authoritative for
        # every third-party email used to create a Google
        # account.
        #
        # For an existing SHOBDO account, automatically
        # link only Gmail or verified Workspace identities.
        #
        # =================================================

        authoritative_email = (
            google_is_authoritative_for_email(

                email=
                    email,

                email_verified=
                    email_verified,

                hosted_domain=
                    hosted_domain,
            )
        )


        if not authoritative_email:

            return jsonify({

                "code":
                    "account_link_required",

                "message":
                    (
                        "A SHOBDO account already exists "
                        "with this email address. Sign in "
                        "with your SHOBDO password first "
                        "before connecting this Google "
                        "account."
                    ),

            }), 409


        # =================================================
        # LINK EXISTING ACCOUNT
        # =================================================

        try:

            existing_user.link_google_account(

                google_sub,

                email_verified=
                    True,

                avatar_url=(
                    google_picture
                    or None
                ),
            )


            existing_user.mark_login()


            db.session.commit()


        except IntegrityError:

            db.session.rollback()


            return jsonify({

                "code":
                    "google_account_conflict",

                "message":
                    (
                        "This Google account is already "
                        "connected to another SHOBDO "
                        "account."
                    ),

            }), 409


        except Exception as error:

            db.session.rollback()


            current_app.logger.exception(
                (
                    "Existing SHOBDO account Google "
                    "link failed: %s"
                ),
                error,
            )


            return jsonify({
                "message":
                    (
                        "Unable to connect your "
                        "Google account right now."
                    )
            }), 500


        return create_login_response(
            existing_user,
            message=(
                "Google account connected and "
                "sign-in completed successfully."
            ),
            auth_provider=
                "google",
        )


    # =====================================================
    # 3. CREATE NEW GOOGLE-ONLY SHOBDO USER
    # =====================================================

    if not google_name:

        # Safe fallback when Google did not supply a name.

        google_name = (
            email
            .split(
                "@",
                1,
            )[0]
        )


    google_name = (
        google_name[
            :MAX_NAME_LENGTH
        ]
        .strip()
    )


    if (
        len(
            google_name
        )
        <
        2
    ):

        google_name = (
            "SHOBDO User"
        )


    try:

        user = User(

            name=
                google_name,

            email=
                email,

            # Google-only user initially has
            # no SHOBDO password.
            password_hash=
                None,

            google_sub=
                google_sub,

            google_linked_at=
                utc_now(),

            email_verified=
                True,

            avatar_url=(
                google_picture
                or None
            ),

            last_login_at=
                utc_now(),
        )


        db.session.add(
            user
        )


        db.session.commit()


    except IntegrityError as error:

        db.session.rollback()


        current_app.logger.warning(
            (
                "Google account creation "
                "integrity conflict: %s"
            ),
            error,
        )


        # Race-condition safety:
        # another request may have created the same
        # Google user immediately before this commit.

        user = (
            User.query
            .filter_by(
                google_sub=
                    google_sub
            )
            .first()
        )


        if (
            user
            and
            user.is_active
        ):

            return create_login_response(
                user,
                message=
                    "Google sign-in successful.",
                auth_provider=
                    "google",
            )


        return jsonify({
            "message":
                (
                    "An account already exists "
                    "for this Google identity."
                )
        }), 409


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Google account creation "
                "failed: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to create your SHOBDO "
                    "account using Google."
                )
        }), 500


    return create_login_response(
        user,
        message=(
            "SHOBDO account created successfully "
            "with Google."
        ),
        status_code=201,
        auth_provider=
            "google",
    )


# =========================================================
# CURRENT USER
# =========================================================
#
# GET /api/auth/me
#
# =========================================================

@auth_bp.route(
    "/me",
    methods=[
        "GET",
    ],
)
@jwt_required()
def current_user():

    identity = (
        get_jwt_identity()
    )


    user = (
        get_user_by_identity(
            identity
        )
    )


    if not user:

        return jsonify({
            "message":
                "User account was not found."
        }), 404


    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


    return jsonify({

        "user":
            user.to_dict(),

    }), 200


# =========================================================
# FORGOT PASSWORD
# =========================================================
#
# POST /api/auth/forgot-password
#
# =========================================================

@auth_bp.route(
    "/forgot-password",
    methods=[
        "POST",
    ],
)
def forgot_password():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    email = normalize_email(
        data.get(
            "email",
            "",
        )
    )


    if not email:

        return jsonify({
            "message":
                "Email address is required."
        }), 400


    if not valid_email(
        email
    ):

        return jsonify({
            "message":
                "Please enter a valid email address."
        }), 400


    # =====================================================
    # GENERIC RESPONSE
    # =====================================================
    #
    # Same response for existing and non-existing users
    # prevents account enumeration.
    #
    # =====================================================

    generic_message = (
        "If an account exists with that email "
        "address, a password reset link has "
        "been sent."
    )


    user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if not user:

        return jsonify({
            "message":
                generic_message
        }), 200


    if not user.is_active:

        return jsonify({
            "message":
                generic_message
        }), 200


    # =====================================================
    # GENERATE SECURE RESET TOKEN
    # =====================================================

    raw_token = (
        secrets.token_urlsafe(
            48
        )
    )


    token_hash = (
        hash_reset_token(
            raw_token
        )
    )


    expiry_time = (
        utc_now()
        +
        timedelta(
            minutes=
                RESET_TOKEN_EXPIRY_MINUTES
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
            "message":
                (
                    "Unable to process your "
                    "request right now."
                )
        }), 500


    # =====================================================
    # FRONTEND RESET URL
    # =====================================================

    frontend_url = (
        current_app.config.get(
            "FRONTEND_URL"
        )
        or
        os.getenv(
            "FRONTEND_URL"
        )
        or
        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        )
        or
        "http://localhost:5173"
    )


    frontend_url = (
        str(
            frontend_url
        )
        .strip()
        .rstrip(
            "/"
        )
    )


    reset_url = (
        f"{frontend_url}"
        f"/reset-password/"
        f"{raw_token}"
    )


    # =====================================================
    # EMAIL SUBJECT
    # =====================================================

    subject = (
        "Reset your SHOBDO password"
    )


    # =====================================================
    # PLAIN TEXT EMAIL
    # =====================================================

    text_body = f"""
Hello {user.name},

We received a request to reset the password for your SHOBDO account.

Use the link below to create a new password:

{reset_url}

This link will expire in {RESET_TOKEN_EXPIRY_MINUTES} minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email.

SHOBDO
তোমার শব্দ, তোমার গল্প।
""".strip()


    # =====================================================
    # HTML EMAIL
    # =====================================================

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
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
        width: 100%;
        max-width: 560px;
        background: #ffffff;
        border: 1px solid #e5dfd4;
        border-radius: 14px;
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
We received a request to reset the password for your
SHOBDO account. Click the button below to create a
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
        border-radius: 10px;
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
If you did not request this password reset,
no action is required.
</p>


<div style="
    margin-top: 32px;
    padding-top: 22px;
    border-top: 1px solid #eee8dd;
    color: #a09789;
    font-size: 11px;
    line-height: 1.6;
">
For security, never share this password-reset
link with another person.
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
""".strip()


    # =====================================================
    # SEND EMAIL
    # =====================================================

    try:

        message = Message(
            subject=
                subject,

            recipients=[
                user.email,
            ],
        )


        message.body = (
            text_body
        )


        message.html = (
            html_body
        )


        mail.send(
            message
        )


    except Exception as error:

        current_app.logger.exception(
            (
                "Unable to send password "
                "reset email: %s"
            ),
            error,
        )


        # The user never received the token,
        # therefore invalidate it.

        user.clear_password_reset_token()


        try:

            db.session.commit()

        except Exception:

            db.session.rollback()


        return jsonify({
            "message":
                (
                    "We could not send the reset "
                    "email right now. Please try "
                    "again later."
                )
        }), 500


    return jsonify({
        "message":
            generic_message
    }), 200


# =========================================================
# VALIDATE PASSWORD RESET TOKEN
# =========================================================
#
# GET /api/auth/reset-password/<token>
#
# =========================================================

@auth_bp.route(
    "/reset-password/<token>",
    methods=[
        "GET",
    ],
)
def validate_reset_token(
    token,
):

    if not token:

        return jsonify({

            "valid":
                False,

            "message":
                (
                    "Invalid password reset link."
                ),

        }), 400


    token_hash = (
        hash_reset_token(
            token
        )
    )


    user = (
        User.query
        .filter_by(
            password_reset_token=
                token_hash
        )
        .first()
    )


    if not user:

        return jsonify({

            "valid":
                False,

            "message":
                (
                    "This password reset link "
                    "is invalid or has already "
                    "been used."
                ),

        }), 400


    # =====================================================
    # EXPIRATION
    # =====================================================

    if reset_token_expired(
        user.password_reset_expires
    ):

        user.clear_password_reset_token()


        try:

            db.session.commit()

        except Exception:

            db.session.rollback()


        return jsonify({

            "valid":
                False,

            "message":
                (
                    "This password reset link "
                    "has expired."
                ),

        }), 400


    # =====================================================
    # ACCOUNT STATUS
    # =====================================================

    if not user.is_active:

        return jsonify({

            "valid":
                False,

            "message":
                (
                    "This account is currently "
                    "disabled."
                ),

        }), 403


    return jsonify({

        "valid":
            True,

        "message":
            (
                "Password reset link is valid."
            ),

    }), 200


# =========================================================
# RESET PASSWORD
# =========================================================
#
# POST /api/auth/reset-password/<token>
#
# Allows a Google-only user to create a SHOBDO password
# as well.
#
# =========================================================

@auth_bp.route(
    "/reset-password/<token>",
    methods=[
        "POST",
    ],
)
def reset_password(
    token,
):

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    password = (
        data.get(
            "password",
            "",
        )
    )


    confirm_password = (
        data.get(
            "confirm_password",
            "",
        )
    )


    # =====================================================
    # PASSWORD VALIDATION
    # =====================================================

    (
        password_valid,
        password_error,
    ) = validate_password(
        password
    )


    if not password_valid:

        return jsonify({
            "message":
                password_error
        }), 400


    if (
        password !=
        confirm_password
    ):

        return jsonify({
            "message":
                "Passwords do not match."
        }), 400


    # =====================================================
    # LOOK UP TOKEN
    # =====================================================

    token_hash = (
        hash_reset_token(
            token
        )
    )


    user = (
        User.query
        .filter_by(
            password_reset_token=
                token_hash
        )
        .first()
    )


    if not user:

        return jsonify({
            "message":
                (
                    "This password reset link "
                    "is invalid or has already "
                    "been used."
                )
        }), 400


    # =====================================================
    # EXPIRATION
    # =====================================================

    if reset_token_expired(
        user.password_reset_expires
    ):

        user.clear_password_reset_token()


        try:

            db.session.commit()

        except Exception:

            db.session.rollback()


        return jsonify({
            "message":
                (
                    "This password reset link "
                    "has expired. Please request "
                    "a new one."
                )
        }), 400


    # =====================================================
    # ACCOUNT STATUS
    # =====================================================

    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


    # =====================================================
    # PREVENT REUSING CURRENT PASSWORD
    # =====================================================
    #
    # Google-only accounts return False safely because
    # password_hash is None.
    #
    # =====================================================

    if user.check_password(
        password
    ):

        return jsonify({
            "message":
                (
                    "Your new password must "
                    "be different from your "
                    "current password."
                )
        }), 400


    # =====================================================
    # SET NEW PASSWORD
    # =====================================================

    try:

        user.set_password(
            password
        )


        # Reset token is single-use.
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
            "message":
                (
                    "Unable to update your "
                    "password right now."
                )
        }), 500


    return jsonify({

        "message":
            (
                "Password changed successfully. "
                "You can now log in using your "
                "new password."
            ),

    }), 200


# =========================================================
# LOGOUT
# =========================================================
#
# POST /api/auth/logout
#
# JWT is currently stored client-side.
#
# The frontend removes shobdo_token during logout.
#
# Token revocation / blocklisting can be added later.
#
# =========================================================

@auth_bp.route(
    "/logout",
    methods=[
        "POST",
    ],
)
@jwt_required()
def logout():

    return jsonify({

        "message":
            "Logged out successfully.",

    }), 200