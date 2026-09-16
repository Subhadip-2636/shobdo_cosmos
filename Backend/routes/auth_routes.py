import hashlib
import os
import re
import secrets

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from html import escape

import requests as http_requests

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

HTTP_TIMEOUT_SECONDS = 12


GOOGLE_ISSUERS = {
    "accounts.google.com",
    "https://accounts.google.com",
}


FACEBOOK_GRAPH_ROOT = (
    "https://graph.facebook.com"
)


# =========================================================
# TIME
# =========================================================

def utc_now():

    return datetime.now(
        timezone.utc
    )


# =========================================================
# DATETIME NORMALIZER
# =========================================================

def ensure_utc(
    value,
):

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
# RESET TOKEN EXPIRATION
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
# EMAIL NORMALIZATION
# =========================================================

def normalize_email(
    email,
):

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

    if (
        not email
        or
        len(email) >
        MAX_EMAIL_LENGTH
    ):

        return False


    return bool(
        re.match(
            r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
            email,
        )
    )


# =========================================================
# NAME NORMALIZATION
# =========================================================

def normalize_name(
    name,
    fallback="SHOBDO User",
):

    value = str(
        name or ""
    ).strip()[
        :MAX_NAME_LENGTH
    ]


    if (
        len(value) <
        2
    ):

        value = (
            fallback[
                :MAX_NAME_LENGTH
            ]
        )


    return value


# =========================================================
# AVATAR URL NORMALIZATION
# =========================================================

def normalize_avatar_url(
    value,
):

    url = str(
        value or ""
    ).strip()


    if not url:

        return None


    if (
        len(url) >
        500
    ):

        return None


    if not (
        url.startswith(
            "https://"
        )
        or
        url.startswith(
            "http://"
        )
    ):

        return None


    return url


# =========================================================
# PASSWORD VALIDATION
# =========================================================

def validate_password(
    password,
):

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

    return hashlib.sha256(
        token.encode(
            "utf-8"
        )
    ).hexdigest()


# =========================================================
# USER LOOKUP FROM JWT
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
# COMMON LOGIN RESPONSE
# =========================================================

def create_login_response(
    user,
    *,
    message,
    status_code=200,
    auth_provider=None,
):

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


        "access_token":
            access_token,


        # Backward compatibility
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
# GOOGLE CONFIG
# =========================================================

def get_google_client_id():

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

    if not email_verified:

        return False


    normalized_email = (
        normalize_email(
            email
        )
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
# VERIFY GOOGLE TOKEN
# =========================================================

def verify_google_credential(
    credential,
):

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


    issuer = str(
        id_info.get(
            "iss",
            "",
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
# FACEBOOK CONFIG
# =========================================================

def get_facebook_app_id():

    value = (
        current_app.config.get(
            "FACEBOOK_APP_ID"
        )
        or
        os.getenv(
            "FACEBOOK_APP_ID"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


def get_facebook_app_secret():

    value = (
        current_app.config.get(
            "FACEBOOK_APP_SECRET"
        )
        or
        os.getenv(
            "FACEBOOK_APP_SECRET"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


# =========================================================
# FACEBOOK GRAPH API VERSION
# =========================================================
#
# Optional:
#
# FACEBOOK_GRAPH_API_VERSION=vXX.X
#
# If omitted, graph.facebook.com uses the app/default
# version configured by Meta.
#
# =========================================================

def get_facebook_graph_api_version():

    value = (
        current_app.config.get(
            "FACEBOOK_GRAPH_API_VERSION"
        )
        or
        os.getenv(
            "FACEBOOK_GRAPH_API_VERSION"
        )
        or
        ""
    )


    value = str(
        value
    ).strip()


    if not value:

        return ""


    if not re.fullmatch(
        r"v\d+\.\d+",
        value,
    ):

        raise RuntimeError(
            (
                "FACEBOOK_GRAPH_API_VERSION "
                "must look like vXX.X."
            )
        )


    return value


# =========================================================
# FACEBOOK GRAPH URL
# =========================================================

def facebook_graph_url(
    path,
):

    path = str(
        path or ""
    ).strip().lstrip(
        "/"
    )


    version = (
        get_facebook_graph_api_version()
    )


    if version:

        return (
            f"{FACEBOOK_GRAPH_ROOT}/"
            f"{version}/"
            f"{path}"
        )


    return (
        f"{FACEBOOK_GRAPH_ROOT}/"
        f"{path}"
    )


# =========================================================
# FACEBOOK APP ACCESS TOKEN
# =========================================================

def get_facebook_app_access_token():

    app_id = (
        get_facebook_app_id()
    )


    app_secret = (
        get_facebook_app_secret()
    )


    if (
        not app_id
        or
        not app_secret
    ):

        raise RuntimeError(
            (
                "Facebook authentication "
                "is not configured."
            )
        )


    return (
        f"{app_id}|"
        f"{app_secret}"
    )


# =========================================================
# FACEBOOK JSON RESPONSE
# =========================================================

def facebook_response_json(
    response,
):

    try:

        payload = (
            response.json()
        )


    except ValueError as error:

        raise RuntimeError(
            (
                "Facebook returned "
                "an invalid response."
            )
        ) from error


    if not isinstance(
        payload,
        dict,
    ):

        raise RuntimeError(
            (
                "Facebook returned "
                "an invalid response."
            )
        )


    return payload


# =========================================================
# VERIFY FACEBOOK ACCESS TOKEN
# =========================================================

def verify_facebook_access_token(
    user_access_token,
):

    app_id = (
        get_facebook_app_id()
    )


    if not app_id:

        raise RuntimeError(
            (
                "Facebook authentication "
                "is not configured."
            )
        )


    response = (
        http_requests.get(

            facebook_graph_url(
                "debug_token"
            ),

            params={

                "input_token":
                    user_access_token,


                "access_token":
                    get_facebook_app_access_token(),

            },

            timeout=
                HTTP_TIMEOUT_SECONDS,

        )
    )


    payload = (
        facebook_response_json(
            response
        )
    )


    if (
        response.status_code >=
        400
    ):

        raise ValueError(
            (
                "Facebook access token "
                "could not be verified."
            )
        )


    data = payload.get(
        "data"
    )


    if not isinstance(
        data,
        dict,
    ):

        raise ValueError(
            (
                "Facebook token debug "
                "data is missing."
            )
        )


    if (
        data.get(
            "is_valid"
        )
        is not True
    ):

        raise ValueError(
            (
                "Facebook access token "
                "is invalid."
            )
        )


    token_app_id = str(
        data.get(
            "app_id",
            "",
        )
    ).strip()


    if (
        token_app_id !=
        app_id
    ):

        raise ValueError(
            (
                "Facebook access token "
                "belongs to another app."
            )
        )


    user_id = str(
        data.get(
            "user_id",
            "",
        )
    ).strip()


    if not user_id:

        raise ValueError(
            (
                "Facebook token does not "
                "contain a user identifier."
            )
        )


    return data


# =========================================================
# FACEBOOK PROFILE
# =========================================================

def fetch_facebook_profile(
    user_access_token,
):

    response = (
        http_requests.get(

            facebook_graph_url(
                "me"
            ),

            params={

                "fields":
                    (
                        "id,"
                        "name,"
                        "email,"
                        "picture.type(large)"
                    ),


                "access_token":
                    user_access_token,

            },

            timeout=
                HTTP_TIMEOUT_SECONDS,

        )
    )


    payload = (
        facebook_response_json(
            response
        )
    )


    if (
        response.status_code >=
        400
        or
        payload.get(
            "error"
        )
    ):

        raise ValueError(
            (
                "Facebook profile could "
                "not be retrieved."
            )
        )


    return payload


# =========================================================
# FACEBOOK PROFILE PICTURE
# =========================================================

def facebook_picture_url(
    profile,
):

    picture = profile.get(
        "picture"
    )


    if not isinstance(
        picture,
        dict,
    ):

        return None


    data = picture.get(
        "data"
    )


    if not isinstance(
        data,
        dict,
    ):

        return None


    return normalize_avatar_url(
        data.get(
            "url"
        )
    )


# =========================================================
# REGISTER
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


    name = str(
        data.get(
            "name",
            "",
        )
        or ""
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


    confirm_password = (
        data.get(
            "confirm_password"
        )
    )


    # =====================================================
    # NAME
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
    # EMAIL
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
                (
                    "Please enter a valid "
                    "email address."
                )
        }), 400


    # =====================================================
    # PASSWORD
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
    # EXISTING
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
    # CREATE
    # =====================================================

    try:

        user = User(

            name=
                name,

            email=
                email,

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

            message=
                "Account created successfully.",

            status_code=
                201,

            auth_provider=
                "password",

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


    password = data.get(
        "password",
        "",
    )


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


    user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


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


    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


    try:

        user.mark_login()

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        current_app.logger.warning(
            (
                "Could not update last_login_at "
                "for user %s: %s"
            ),
            user.id,
            error,
        )


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


    credential = str(

        data.get(
            "credential",
            "",
        )

        or

        data.get(
            "id_token",
            "",
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


    if not get_google_client_id():

        current_app.logger.error(
            "GOOGLE_CLIENT_ID is missing."
        )


        return jsonify({
            "message":
                (
                    "Google sign-in is temporarily "
                    "unavailable."
                )
        }), 503


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
                "Google authentication "
                "transport error: %s"
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
            (
                "Google authentication "
                "error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Google sign-in could not "
                    "be completed."
                )
        }), 401


    except RuntimeError as error:

        current_app.logger.error(
            (
                "Google configuration "
                "error: %s"
            ),
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
            "",
        )
        or ""
    ).strip()


    email = normalize_email(
        google_profile.get(
            "email",
            "",
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
            "",
        )
        or ""
    ).strip()


    google_name = str(
        google_profile.get(
            "name",
            "",
        )
        or ""
    ).strip()


    google_picture = (
        normalize_avatar_url(
            google_profile.get(
                "picture"
            )
        )
    )


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
                    "Google did not provide "
                    "a valid email address."
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
    # EXISTING GOOGLE USER
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
    # MATCH EXISTING EMAIL
    # =====================================================

    existing_user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if existing_user:

        if not existing_user.is_active:

            return jsonify({
                "message":
                    (
                        "This account is currently "
                        "disabled."
                    )
            }), 403


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

                "provider":
                    "google",

                "message":
                    (
                        "A SHOBDO account already exists "
                        "with this email address. Sign in "
                        "with an existing SHOBDO method "
                        "first before connecting Google."
                    ),

            }), 409


        try:

            existing_user.link_google_account(

                google_sub,

                email_verified=
                    True,

                avatar_url=
                    google_picture,

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
                    "Existing SHOBDO account "
                    "Google link failed: %s"
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

            message=
                (
                    "Google account connected and "
                    "sign-in completed successfully."
                ),

            auth_provider=
                "google",

        )


    # =====================================================
    # NEW GOOGLE USER
    # =====================================================

    google_name = normalize_name(

        google_name,

        fallback=(
            email.split(
                "@",
                1,
            )[0]
            or
            "SHOBDO User"
        ),

    )


    try:

        user = User(

            name=
                google_name,

            email=
                email,

            password_hash=
                None,

            google_sub=
                google_sub,

            google_linked_at=
                utc_now(),

            email_verified=
                True,

            avatar_url=
                google_picture,

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

        message=
            (
                "SHOBDO account created "
                "successfully with Google."
            ),

        status_code=
            201,

        auth_provider=
            "google",

    )


# =========================================================
# FACEBOOK LOGIN
# =========================================================
#
# POST /api/auth/facebook
#
# JSON:
#
# {
#     "access_token": "<FACEBOOK_USER_ACCESS_TOKEN>"
# }
#
# The browser Facebook SDK obtains the user access token.
#
# The backend does NOT trust it directly.
#
# Flow:
#
# user token
#     ↓
# /debug_token
#     ↓
# validate app_id + is_valid + user_id
#     ↓
# /me
#     ↓
# compare IDs
#     ↓
# issue SHOBDO JWT
#
# =========================================================

@auth_bp.route(
    "/facebook",
    methods=[
        "POST",
    ],
)
def facebook_login():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    user_access_token = str(

        data.get(
            "access_token",
            "",
        )

        or

        data.get(
            "token",
            "",
        )

        or

        ""

    ).strip()


    if not user_access_token:

        return jsonify({
            "message":
                (
                    "Facebook access token "
                    "is required."
                )
        }), 400


    # =====================================================
    # CONFIGURATION
    # =====================================================

    if (
        not get_facebook_app_id()
        or
        not get_facebook_app_secret()
    ):

        current_app.logger.error(
            (
                "FACEBOOK_APP_ID or "
                "FACEBOOK_APP_SECRET is missing."
            )
        )


        return jsonify({
            "message":
                (
                    "Facebook sign-in is temporarily "
                    "unavailable."
                )
        }), 503


    # =====================================================
    # VERIFY TOKEN + FETCH PROFILE
    # =====================================================

    try:

        debug_data = (
            verify_facebook_access_token(
                user_access_token
            )
        )


        facebook_profile = (
            fetch_facebook_profile(
                user_access_token
            )
        )


    except http_requests.exceptions.Timeout as error:

        current_app.logger.exception(
            (
                "Facebook authentication "
                "timed out: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Facebook authentication "
                    "timed out. Please try again."
                )
        }), 503


    except (
        http_requests
        .exceptions
        .RequestException
    ) as error:

        current_app.logger.exception(
            (
                "Facebook authentication "
                "network error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to contact Facebook "
                    "authentication services. "
                    "Please try again."
                )
        }), 503


    except ValueError as error:

        current_app.logger.warning(
            (
                "Invalid Facebook authentication "
                "response: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Facebook sign-in could not "
                    "be verified. Please try again."
                )
        }), 401


    except RuntimeError as error:

        current_app.logger.error(
            (
                "Facebook authentication "
                "configuration/service error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Facebook sign-in is temporarily "
                    "unavailable."
                )
        }), 503


    except Exception as error:

        current_app.logger.exception(
            (
                "Unexpected Facebook sign-in "
                "error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to complete Facebook "
                    "sign-in right now."
                )
        }), 500


    # =====================================================
    # FACEBOOK PROFILE VALUES
    # =====================================================

    facebook_user_id = str(
        facebook_profile.get(
            "id",
            "",
        )
        or ""
    ).strip()


    debug_user_id = str(
        debug_data.get(
            "user_id",
            "",
        )
        or ""
    ).strip()


    facebook_name = str(
        facebook_profile.get(
            "name",
            "",
        )
        or ""
    ).strip()


    email = normalize_email(
        facebook_profile.get(
            "email",
            "",
        )
    )


    facebook_picture = (
        facebook_picture_url(
            facebook_profile
        )
    )


    # =====================================================
    # VERIFY SAME FACEBOOK USER
    # =====================================================

    if (
        not facebook_user_id
        or
        facebook_user_id !=
        debug_user_id
    ):

        current_app.logger.warning(
            (
                "Facebook user ID mismatch "
                "during authentication."
            )
        )


        return jsonify({
            "message":
                (
                    "Facebook sign-in could "
                    "not be verified."
                )
        }), 401


    # =====================================================
    # EXISTING FACEBOOK-LINKED USER
    # =====================================================

    user = (
        User.query
        .filter_by(
            facebook_user_id=
                facebook_user_id
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

            if (
                facebook_picture
                and
                not user.avatar_url
            ):

                user.avatar_url = (
                    facebook_picture
                )


            user.mark_login()


            db.session.commit()


        except Exception as error:

            db.session.rollback()


            current_app.logger.exception(
                (
                    "Facebook-linked account "
                    "update failed: %s"
                ),
                error,
            )


            return jsonify({
                "message":
                    (
                        "Unable to complete Facebook "
                        "sign-in right now."
                    )
            }), 500


        return create_login_response(

            user,

            message=
                "Facebook sign-in successful.",

            auth_provider=
                "facebook",

        )


    # =====================================================
    # FACEBOOK EMAIL REQUIRED FOR NEW ACCOUNT
    # =====================================================

    if (
        not email
        or
        not valid_email(
            email
        )
    ):

        return jsonify({

            "code":
                "facebook_email_required",

            "provider":
                "facebook",

            "message":
                (
                    "Facebook did not provide an email "
                    "address. Please allow email access "
                    "or use another SHOBDO sign-in "
                    "method."
                ),

        }), 422


    # =====================================================
    # EXISTING SHOBDO EMAIL
    # =====================================================

    existing_user = (
        User.query
        .filter_by(
            email=email
        )
        .first()
    )


    if existing_user:

        if not existing_user.is_active:

            return jsonify({
                "message":
                    (
                        "This account is currently "
                        "disabled."
                    )
            }), 403


        if (
            existing_user.facebook_user_id
            and
            existing_user.facebook_user_id
            != facebook_user_id
        ):

            return jsonify({

                "code":
                    "facebook_account_conflict",

                "provider":
                    "facebook",

                "message":
                    (
                        "This SHOBDO account is already "
                        "connected to another Facebook "
                        "account."
                    ),

            }), 409


        # -------------------------------------------------
        # IMPORTANT SECURITY RULE
        # -------------------------------------------------
        #
        # We do not automatically link an existing SHOBDO
        # account only because Facebook returned the same
        # email address.
        #
        # The user should first authenticate to SHOBDO,
        # then use /facebook/link.
        #
        # -------------------------------------------------

        return jsonify({

            "code":
                "account_link_required",

            "provider":
                "facebook",

            "message":
                (
                    "A SHOBDO account already exists "
                    "with this email address. Sign in "
                    "using an existing SHOBDO method "
                    "first, then connect Facebook to "
                    "that account."
                ),

        }), 409


    # =====================================================
    # NEW FACEBOOK USER
    # =====================================================

    facebook_name = normalize_name(

        facebook_name,

        fallback=(
            email.split(
                "@",
                1,
            )[0]
            or
            "SHOBDO User"
        ),

    )


    try:

        user = User(

            name=
                facebook_name,

            email=
                email,

            password_hash=
                None,

            facebook_user_id=
                facebook_user_id,

            facebook_linked_at=
                utc_now(),

            # Facebook profile email is intentionally not
            # treated as Google's email_verified claim.
            email_verified=
                False,

            avatar_url=
                facebook_picture,

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
                "Facebook account creation "
                "integrity conflict: %s"
            ),
            error,
        )


        user = (
            User.query
            .filter_by(
                facebook_user_id=
                    facebook_user_id
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
                    "Facebook sign-in successful.",

                auth_provider=
                    "facebook",

            )


        return jsonify({
            "message":
                (
                    "An account already exists "
                    "for this Facebook identity."
                )
        }), 409


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Facebook account creation "
                "failed: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to create your SHOBDO "
                    "account using Facebook."
                )
        }), 500


    return create_login_response(

        user,

        message=
            (
                "SHOBDO account created successfully "
                "with Facebook."
            ),

        status_code=
            201,

        auth_provider=
            "facebook",

    )


# =========================================================
# LINK FACEBOOK TO LOGGED-IN USER
# =========================================================
#
# POST /api/auth/facebook/link
#
# Authorization:
#
# Bearer <SHOBDO JWT>
#
# Body:
#
# {
#     "access_token": "<FACEBOOK_TOKEN>"
# }
#
# This route solves the safe account-linking case where a
# Facebook email already belongs to an existing SHOBDO user.
#
# =========================================================

@auth_bp.route(
    "/facebook/link",
    methods=[
        "POST",
    ],
)
@jwt_required()
def link_facebook_account():

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
                (
                    "User account was not found."
                )
        }), 404


    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    user_access_token = str(

        data.get(
            "access_token",
            "",
        )

        or

        data.get(
            "token",
            "",
        )

        or

        ""

    ).strip()


    if not user_access_token:

        return jsonify({
            "message":
                (
                    "Facebook access token "
                    "is required."
                )
        }), 400


    try:

        debug_data = (
            verify_facebook_access_token(
                user_access_token
            )
        )


        facebook_profile = (
            fetch_facebook_profile(
                user_access_token
            )
        )


    except http_requests.exceptions.Timeout as error:

        current_app.logger.exception(
            (
                "Facebook link request "
                "timed out: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Facebook authentication timed "
                    "out. Please try again."
                )
        }), 503


    except (
        http_requests
        .exceptions
        .RequestException
    ) as error:

        current_app.logger.exception(
            (
                "Facebook link network "
                "error: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to contact Facebook "
                    "authentication services. "
                    "Please try again."
                )
        }), 503


    except (
        ValueError,
        RuntimeError,
    ) as error:

        current_app.logger.warning(
            (
                "Facebook link verification "
                "failed: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Facebook account could "
                    "not be verified."
                )
        }), 401


    facebook_user_id = str(
        facebook_profile.get(
            "id",
            "",
        )
        or ""
    ).strip()


    debug_user_id = str(
        debug_data.get(
            "user_id",
            "",
        )
        or ""
    ).strip()


    facebook_picture = (
        facebook_picture_url(
            facebook_profile
        )
    )


    if (
        not facebook_user_id
        or
        facebook_user_id !=
        debug_user_id
    ):

        return jsonify({
            "message":
                (
                    "Facebook account could "
                    "not be verified."
                )
        }), 401


    # =====================================================
    # CHECK IF FACEBOOK ACCOUNT BELONGS TO ANOTHER USER
    # =====================================================

    other_user = (
        User.query
        .filter(

            User.facebook_user_id
            ==
            facebook_user_id,

            User.id
            !=
            user.id,

        )
        .first()
    )


    if other_user:

        return jsonify({

            "code":
                "facebook_account_conflict",

            "message":
                (
                    "This Facebook account is already "
                    "connected to another SHOBDO "
                    "account."
                ),

        }), 409


    # =====================================================
    # CURRENT USER ALREADY HAS DIFFERENT FACEBOOK
    # =====================================================

    if (
        user.facebook_user_id
        and
        user.facebook_user_id
        != facebook_user_id
    ):

        return jsonify({

            "code":
                "facebook_account_conflict",

            "message":
                (
                    "Your SHOBDO account is already "
                    "connected to another Facebook "
                    "account."
                ),

        }), 409


    # =====================================================
    # LINK
    # =====================================================

    try:

        user.link_facebook_account(

            facebook_user_id,

            avatar_url=
                facebook_picture,

            mark_email_verified=
                False,

        )


        db.session.commit()


    except IntegrityError:

        db.session.rollback()


        return jsonify({

            "code":
                "facebook_account_conflict",

            "message":
                (
                    "This Facebook account is already "
                    "connected to another SHOBDO "
                    "account."
                ),

        }), 409


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Facebook account linking "
                "failed: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to connect your Facebook "
                    "account right now."
                )
        }), 500


    return jsonify({

        "message":
            (
                "Facebook account connected "
                "successfully."
            ),

        "user":
            user.to_dict(),

    }), 200


# =========================================================
# CURRENT USER
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
                (
                    "User account was not found."
                )
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
                (
                    "Email address is required."
                )
        }), 400


    if not valid_email(
        email
    ):

        return jsonify({
            "message":
                (
                    "Please enter a valid "
                    "email address."
                )
        }), 400


    # =====================================================
    # GENERIC RESPONSE
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


    if (
        not user
        or
        not user.is_active
    ):

        return jsonify({
            "message":
                generic_message
        }), 200


    # =====================================================
    # TOKEN
    # =====================================================

    raw_token = (
        secrets.token_urlsafe(
            48
        )
    )


    user.password_reset_token = (
        hash_reset_token(
            raw_token
        )
    )


    user.password_reset_expires = (

        utc_now()

        +

        timedelta(
            minutes=
                RESET_TOKEN_EXPIRY_MINUTES
        )

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
    # RESET URL
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


    frontend_url = str(
        frontend_url
    ).strip().rstrip(
        "/"
    )


    reset_url = (
        f"{frontend_url}"
        f"/reset-password/"
        f"{raw_token}"
    )


    # =====================================================
    # EMAIL
    # =====================================================

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
""".strip()


    safe_name = escape(
        str(
            user.name
            or
            "SHOBDO user"
        )
    )


    safe_reset_url = escape(
        reset_url,
        quote=True,
    )


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
    margin:0;
    padding:0;
    background:#f6f3ec;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
        background:#f6f3ec;
        padding:40px 16px;
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
        width:100%;
        max-width:560px;
        background:#ffffff;
        border:1px solid #e5dfd4;
        border-radius:14px;
    "
>

<tr>

<td style="
    padding:42px 40px;
">

<div style="
    text-align:center;
    margin-bottom:32px;
">

<div style="
    font-family:Georgia,serif;
    font-size:26px;
    font-weight:bold;
    letter-spacing:4px;
    color:#4d1778;
">
SHOBDO
</div>

<div style="
    margin-top:5px;
    color:#927641;
    font-size:13px;
">
তোমার শব্দ, তোমার গল্প।
</div>

</div>


<h1 style="
    margin:0 0 18px;
    font-family:Georgia,serif;
    font-size:28px;
    color:#191816;
">
Reset your password
</h1>


<p style="
    margin:0 0 16px;
    color:#655f55;
    font-size:15px;
    line-height:1.7;
">
Hello {safe_name},
</p>


<p style="
    margin:0 0 26px;
    color:#655f55;
    font-size:15px;
    line-height:1.7;
">
We received a request to reset the password for your
SHOBDO account. Click the button below to create a
new password.
</p>


<div style="
    text-align:center;
    margin:32px 0;
">

<a
    href="{safe_reset_url}"
    style="
        display:inline-block;
        padding:15px 28px;
        border-radius:10px;
        background:#181817;
        color:#ffffff;
        text-decoration:none;
        font-size:15px;
        font-weight:bold;
    "
>
Reset Password
</a>

</div>


<p style="
    margin:26px 0 0;
    color:#81786b;
    font-size:13px;
    line-height:1.7;
">
This secure link expires in
{RESET_TOKEN_EXPIRY_MINUTES} minutes
and can only be used once.
</p>


<p style="
    margin:18px 0 0;
    color:#81786b;
    font-size:13px;
    line-height:1.7;
">
If you did not request this password reset,
no action is required.
</p>


<div style="
    margin-top:32px;
    padding-top:22px;
    border-top:1px solid #eee8dd;
    color:#a09789;
    font-size:11px;
    line-height:1.6;
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
# VALIDATE RESET TOKEN
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


    password = data.get(
        "password",
        "",
    )


    confirm_password = data.get(
        "confirm_password",
        "",
    )


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


    if not user.is_active:

        return jsonify({
            "message":
                (
                    "This account is currently "
                    "disabled."
                )
        }), 403


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


    try:

        user.set_password(
            password
        )


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