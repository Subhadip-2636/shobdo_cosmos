import base64
import hashlib
import hmac
import json
import os
import re
import secrets

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from html import escape

from urllib.parse import (
    quote,
    urlencode,
    urlsplit,
)

import requests as http_requests

from flask import (
    Blueprint,
    current_app,
    jsonify,
    redirect,
    request,
)

from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from flask_mail import Message

from itsdangerous import (
    BadSignature,
    SignatureExpired,
    URLSafeTimedSerializer,
)

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
# BLUEPRINT
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
# COMMON HELPERS
# =========================================================

def utc_now():

    return datetime.now(
        timezone.utc
    )


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


def normalize_name(
    name,
    fallback="SHOBDO User",
):

    value = str(
        name or ""
    ).strip()[
        :MAX_NAME_LENGTH
    ]


    if len(value) < 2:

        value = (
            fallback[
                :MAX_NAME_LENGTH
            ]
        )


    return value


def normalize_avatar_url(
    value,
):

    url = str(
        value or ""
    ).strip()


    if not url:

        return None


    if len(url) > 500:

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


def hash_reset_token(
    token,
):

    return hashlib.sha256(
        token.encode(
            "utf-8"
        )
    ).hexdigest()


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
# GOOGLE CONFIGURATION
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
# FACEBOOK CONFIGURATION
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
            "Facebook authentication is not configured."
        )


    return (
        f"{app_id}|"
        f"{app_secret}"
    )


def facebook_response_json(
    response,
):

    try:

        payload = (
            response.json()
        )


    except ValueError as error:

        raise RuntimeError(
            "Facebook returned an invalid response."
        ) from error


    if not isinstance(
        payload,
        dict,
    ):

        raise RuntimeError(
            "Facebook returned an invalid response."
        )


    return payload


def verify_facebook_access_token(
    user_access_token,
):

    app_id = (
        get_facebook_app_id()
    )


    if not app_id:

        raise RuntimeError(
            "Facebook authentication is not configured."
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
            "Facebook token debug data is missing."
        )


    if (
        data.get(
            "is_valid"
        )
        is not True
    ):

        raise ValueError(
            "Facebook access token is invalid."
        )


    token_app_id = str(
        data.get(
            "app_id",
            "",
        )
    ).strip()


    if token_app_id != app_id:

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
            "Facebook profile could not be retrieved."
        )


    return payload


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
# INSTAGRAM CONFIGURATION
# =========================================================

INSTAGRAM_AUTHORIZATION_URL = (
    "https://www.instagram.com/oauth/authorize"
)

INSTAGRAM_TOKEN_URL = (
    "https://api.instagram.com/oauth/access_token"
)

INSTAGRAM_GRAPH_ROOT = (
    "https://graph.instagram.com"
)

INSTAGRAM_BASIC_SCOPE = (
    "instagram_business_basic"
)

INSTAGRAM_STATE_COOKIE = (
    "shobdo_instagram_oauth_state"
)

INSTAGRAM_OAUTH_STATE_MAX_AGE_SECONDS = 600

INSTAGRAM_LINK_TOKEN_MAX_AGE_SECONDS = 900

INSTAGRAM_HANDOFF_TOKEN_MAX_AGE_SECONDS = 180

INSTAGRAM_DELETION_STATUS_MAX_AGE_SECONDS = (
    60 * 60 * 24 * 30
)


def get_frontend_url():

    # =====================================================
    # PRODUCTION FIRST
    # =====================================================
    #
    # On Render always prefer the production frontend URL.
    #
    # Local FRONTEND_URL is used only when no production
    # frontend has been configured.
    #
    # =====================================================

    production_url = (

        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        )

        or

        current_app.config.get(
            "PRODUCTION_FRONTEND_URL"
        )

        or

        ""

    )


    production_url = str(
        production_url
    ).strip().rstrip(
        "/"
    )


    if production_url:

        return production_url


    # =====================================================
    # DEVELOPMENT FALLBACK
    # =====================================================

    development_url = (

        os.getenv(
            "FRONTEND_URL"
        )

        or

        current_app.config.get(
            "FRONTEND_URL"
        )

        or

        "http://localhost:5173"

    )


    return str(
        development_url
    ).strip().rstrip(
        "/"
    )


def get_instagram_app_id():

    value = (
        current_app.config.get(
            "INSTAGRAM_APP_ID"
        )
        or
        os.getenv(
            "INSTAGRAM_APP_ID"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


def get_instagram_app_secret():

    value = (
        current_app.config.get(
            "INSTAGRAM_APP_SECRET"
        )
        or
        os.getenv(
            "INSTAGRAM_APP_SECRET"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


def get_instagram_redirect_uri():

    value = (
        current_app.config.get(
            "INSTAGRAM_REDIRECT_URI"
        )
        or
        os.getenv(
            "INSTAGRAM_REDIRECT_URI"
        )
        or
        ""
    )


    return str(
        value
    ).strip()


def get_instagram_backend_base_url():

    redirect_uri = (
        get_instagram_redirect_uri()
    )


    if not redirect_uri:

        return ""


    parsed = urlsplit(
        redirect_uri
    )


    if (
        not parsed.scheme
        or
        not parsed.netloc
    ):

        return ""


    return (
        f"{parsed.scheme}://"
        f"{parsed.netloc}"
    )


def validate_instagram_configuration():

    if (
        not get_instagram_app_id()
        or
        not get_instagram_app_secret()
        or
        not get_instagram_redirect_uri()
    ):

        raise RuntimeError(
            "Instagram authentication is not configured."
        )


def get_oauth_signing_secret():

    value = (
        current_app.config.get(
            "JWT_SECRET_KEY"
        )
        or
        os.getenv(
            "JWT_SECRET_KEY"
        )
        or
        current_app.secret_key
        or
        ""
    )


    value = str(
        value
    ).strip()


    if not value:

        raise RuntimeError(
            (
                "A server signing secret is "
                "required for social authentication."
            )
        )


    return value


def instagram_serializer(
    salt,
):

    return URLSafeTimedSerializer(

        secret_key=
            get_oauth_signing_secret(),

        salt=
            salt,

    )


# =========================================================
# INSTAGRAM OAUTH STATE
# =========================================================

def create_instagram_oauth_state(
    nonce,
):

    return (
        instagram_serializer(
            "shobdo-instagram-oauth-state"
        )
        .dumps({

            "purpose":
                "instagram_oauth",

            "nonce":
                nonce,

        })
    )


def verify_instagram_oauth_state(
    state,
):

    payload = (
        instagram_serializer(
            "shobdo-instagram-oauth-state"
        )
        .loads(

            state,

            max_age=
                INSTAGRAM_OAUTH_STATE_MAX_AGE_SECONDS,

        )
    )


    if (
        not isinstance(
            payload,
            dict,
        )
        or
        payload.get(
            "purpose"
        )
        !=
        "instagram_oauth"
    ):

        raise BadSignature(
            "Invalid Instagram OAuth state."
        )


    return payload


# =========================================================
# INSTAGRAM LINK TOKEN
# =========================================================

def create_instagram_link_token(
    *,
    instagram_user_id,
    instagram_username,
):

    return (
        instagram_serializer(
            "shobdo-instagram-link"
        )
        .dumps({

            "purpose":
                "instagram_link",

            "instagram_user_id":
                str(
                    instagram_user_id
                ),

            "instagram_username":
                str(
                    instagram_username
                    or
                    ""
                ),

        })
    )


def verify_instagram_link_token(
    token,
):

    payload = (
        instagram_serializer(
            "shobdo-instagram-link"
        )
        .loads(

            token,

            max_age=
                INSTAGRAM_LINK_TOKEN_MAX_AGE_SECONDS,

        )
    )


    if (
        not isinstance(
            payload,
            dict,
        )
        or
        payload.get(
            "purpose"
        )
        !=
        "instagram_link"
    ):

        raise BadSignature(
            "Invalid Instagram link token."
        )


    instagram_user_id = str(
        payload.get(
            "instagram_user_id",
            "",
        )
        or
        ""
    ).strip()


    if not instagram_user_id:

        raise BadSignature(
            "Instagram user identifier is missing."
        )


    return payload


# =========================================================
# INSTAGRAM REDIRECT HANDOFF TOKEN
# =========================================================

def create_instagram_handoff_token(
    *,
    action,
    user_id=None,
    instagram_user_id=None,
    instagram_username=None,
):

    normalized_action = str(
        action or ""
    ).strip().lower()


    if normalized_action not in {
        "login",
        "link",
    }:

        raise ValueError(
            "Invalid Instagram handoff action."
        )


    payload = {

        "purpose":
            "instagram_handoff",

        "action":
            normalized_action,

    }


    if user_id is not None:

        payload[
            "user_id"
        ] = str(
            user_id
        )


    if instagram_user_id is not None:

        payload[
            "instagram_user_id"
        ] = str(
            instagram_user_id
        )


    if instagram_username is not None:

        payload[
            "instagram_username"
        ] = str(
            instagram_username
            or
            ""
        )


    if (
        normalized_action ==
        "login"
        and
        not payload.get(
            "user_id"
        )
    ):

        raise ValueError(
            (
                "User ID is required for "
                "Instagram login handoff."
            )
        )


    if (
        normalized_action ==
        "login"
        and
        not payload.get(
            "instagram_user_id"
        )
    ):

        raise ValueError(
            (
                "Instagram user ID is required for "
                "Instagram login handoff."
            )
        )


    if (
        normalized_action ==
        "link"
        and
        not payload.get(
            "instagram_user_id"
        )
    ):

        raise ValueError(
            (
                "Instagram user ID is required "
                "for account linking."
            )
        )


    return (
        instagram_serializer(
            "shobdo-instagram-handoff"
        )
        .dumps(
            payload
        )
    )


def verify_instagram_handoff_token(
    token,
):

    clean_token = str(
        token or ""
    ).strip()


    if not clean_token:

        raise BadSignature(
            "Instagram handoff token is missing."
        )


    payload = (
        instagram_serializer(
            "shobdo-instagram-handoff"
        )
        .loads(

            clean_token,

            max_age=
                INSTAGRAM_HANDOFF_TOKEN_MAX_AGE_SECONDS,

        )
    )


    if (
        not isinstance(
            payload,
            dict,
        )
        or
        payload.get(
            "purpose"
        )
        !=
        "instagram_handoff"
    ):

        raise BadSignature(
            "Invalid Instagram handoff token."
        )


    action = str(
        payload.get(
            "action",
            "",
        )
        or
        ""
    ).strip().lower()


    if action not in {
        "login",
        "link",
    }:

        raise BadSignature(
            "Invalid Instagram handoff action."
        )


    if (
        action == "login"
        and
        (
            not payload.get(
                "user_id"
            )
            or
            not payload.get(
                "instagram_user_id"
            )
        )
    ):

        raise BadSignature(
            "Incomplete Instagram login handoff."
        )


    if (
        action == "link"
        and
        not payload.get(
            "instagram_user_id"
        )
    ):

        raise BadSignature(
            "Incomplete Instagram link handoff."
        )


    return payload


# =========================================================
# INSTAGRAM FRONTEND REDIRECT
# =========================================================

def instagram_frontend_redirect(
    *,
    handoff_token=None,
    error_code=None,
    message=None,
):

    frontend_url = (
        get_frontend_url()
    )


    login_url = (
        f"{frontend_url}/login"
    )


    if handoff_token:

        fragment = urlencode({

            "instagram":
                "callback",

            "handoff":
                str(
                    handoff_token
                ),

        })


    else:

        fragment = urlencode({

            "instagram":
                "error",

            "code":
                str(
                    error_code
                    or
                    "instagram_authentication_failed"
                ),

            "message":
                str(
                    message
                    or
                    (
                        "Unable to complete "
                        "Instagram sign-in."
                    )
                ),

        })


    response = redirect(

        f"{login_url}#{fragment}",

        code=302,

    )


    response.headers[
        "Cache-Control"
    ] = (
        "no-store, no-cache, "
        "must-revalidate, max-age=0"
    )


    response.headers[
        "Pragma"
    ] = (
        "no-cache"
    )


    response.headers[
        "Referrer-Policy"
    ] = (
        "no-referrer"
    )


    response.delete_cookie(

        INSTAGRAM_STATE_COOKIE,

        path=
            "/api/auth/instagram",

    )


    return response


# =========================================================
# INSTAGRAM DATA DELETION TOKEN
# =========================================================

def create_instagram_deletion_status_token(
    instagram_user_id,
):

    return (
        instagram_serializer(
            "shobdo-instagram-data-deletion"
        )
        .dumps({

            "purpose":
                "instagram_data_deletion",

            "instagram_user_id":
                str(
                    instagram_user_id
                    or
                    ""
                ),

        })
    )


def verify_instagram_deletion_status_token(
    token,
):

    payload = (
        instagram_serializer(
            "shobdo-instagram-data-deletion"
        )
        .loads(

            token,

            max_age=
                INSTAGRAM_DELETION_STATUS_MAX_AGE_SECONDS,

        )
    )


    if (
        not isinstance(
            payload,
            dict,
        )
        or
        payload.get(
            "purpose"
        )
        !=
        "instagram_data_deletion"
    ):

        raise BadSignature(
            (
                "Invalid Instagram data-deletion "
                "confirmation token."
            )
        )


    return payload


# =========================================================
# INSTAGRAM API HELPERS
# =========================================================

def instagram_response_json(
    response,
):

    try:

        payload = (
            response.json()
        )


    except ValueError as error:

        raise RuntimeError(
            "Instagram returned an invalid response."
        ) from error


    if not isinstance(
        payload,
        dict,
    ):

        raise RuntimeError(
            "Instagram returned an invalid response."
        )


    return payload


def exchange_instagram_authorization_code(
    authorization_code,
):

    validate_instagram_configuration()


    code = str(
        authorization_code or ""
    ).strip()


    if code.endswith(
        "#_"
    ):

        code = code[
            :-2
        ]


    if not code:

        raise ValueError(
            "Instagram authorization code is missing."
        )


    response = (
        http_requests.post(

            INSTAGRAM_TOKEN_URL,

            data={

                "client_id":
                    get_instagram_app_id(),

                "client_secret":
                    get_instagram_app_secret(),

                "grant_type":
                    "authorization_code",

                "redirect_uri":
                    get_instagram_redirect_uri(),

                "code":
                    code,

            },

            timeout=
                HTTP_TIMEOUT_SECONDS,

        )
    )


    payload = (
        instagram_response_json(
            response
        )
    )


    if (
        response.status_code >=
        400
        or
        payload.get(
            "error_type"
        )
        or
        payload.get(
            "error"
        )
    ):

        current_app.logger.warning(
            (
                "Instagram authorization-code "
                "exchange failed: %s"
            ),
            payload,
        )


        raise ValueError(
            (
                "Instagram authorization code "
                "could not be exchanged."
            )
        )


    access_token = str(
        payload.get(
            "access_token",
            "",
        )
        or
        ""
    ).strip()


    instagram_user_id = str(
        payload.get(
            "user_id",
            "",
        )
        or
        ""
    ).strip()


    if not access_token:

        raise ValueError(
            (
                "Instagram did not return "
                "an access token."
            )
        )


    return {

        "access_token":
            access_token,

        "instagram_user_id":
            instagram_user_id,

        "permissions":
            payload.get(
                "permissions"
            ),

    }


def fetch_instagram_profile(
    user_access_token,
):

    token = str(
        user_access_token or ""
    ).strip()


    if not token:

        raise ValueError(
            "Instagram access token is missing."
        )


    response = (
        http_requests.get(

            f"{INSTAGRAM_GRAPH_ROOT}/me",

            params={

                "fields":
                    "id,username",

                "access_token":
                    token,

            },

            timeout=
                HTTP_TIMEOUT_SECONDS,

        )
    )


    payload = (
        instagram_response_json(
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

        current_app.logger.warning(
            (
                "Instagram profile request "
                "failed: %s"
            ),
            payload,
        )


        raise ValueError(
            "Instagram profile could not be retrieved."
        )


    return payload


def build_instagram_authorization_url(
    state,
):

    validate_instagram_configuration()


    query = urlencode({

        "client_id":
            get_instagram_app_id(),

        "redirect_uri":
            get_instagram_redirect_uri(),

        "response_type":
            "code",

        "scope":
            INSTAGRAM_BASIC_SCOPE,

        "state":
            state,

        "enable_fb_login":
            "0",

        "force_reauth":
            "true",

    })


    return (
        f"{INSTAGRAM_AUTHORIZATION_URL}"
        f"?{query}"
    )


# =========================================================
# INSTAGRAM SIGNED REQUEST HELPERS
# =========================================================

def decode_base64url(
    value,
):

    value = str(
        value
        or
        ""
    )


    padding = (
        "=" *
        (
            (
                4 -
                len(
                    value
                )
                %
                4
            )
            %
            4
        )
    )


    return (
        base64.urlsafe_b64decode(
            (
                value +
                padding
            ).encode(
                "utf-8"
            )
        )
    )


def parse_instagram_signed_request(
    signed_request,
):

    validate_instagram_configuration()


    value = str(
        signed_request
        or
        ""
    ).strip()


    if (
        not value
        or
        "."
        not in value
    ):

        raise ValueError(
            (
                "Instagram signed request "
                "is missing or invalid."
            )
        )


    (
        encoded_signature,
        encoded_payload,
    ) = value.split(
        ".",
        1,
    )


    try:

        signature = (
            decode_base64url(
                encoded_signature
            )
        )


        raw_payload = (
            decode_base64url(
                encoded_payload
            )
        )


        payload = json.loads(
            raw_payload.decode(
                "utf-8"
            )
        )


    except (
        ValueError,
        UnicodeDecodeError,
        json.JSONDecodeError,
    ) as error:

        raise ValueError(
            (
                "Instagram signed request "
                "could not be decoded."
            )
        ) from error


    if not isinstance(
        payload,
        dict,
    ):

        raise ValueError(
            (
                "Instagram signed request "
                "payload is invalid."
            )
        )


    algorithm = str(
        payload.get(
            "algorithm",
            "HMAC-SHA256",
        )
        or
        ""
    ).upper()


    if (
        algorithm !=
        "HMAC-SHA256"
    ):

        raise ValueError(
            (
                "Unsupported Instagram "
                "signed-request algorithm."
            )
        )


    expected_signature = (
        hmac.new(

            get_instagram_app_secret()
            .encode(
                "utf-8"
            ),

            msg=
                encoded_payload.encode(
                    "utf-8"
                ),

            digestmod=
                hashlib.sha256,

        )
        .digest()
    )


    if not hmac.compare_digest(
        signature,
        expected_signature,
    ):

        raise ValueError(
            (
                "Instagram signed-request "
                "signature is invalid."
            )
        )


    return payload


def get_signed_request_from_request():

    value = str(
        request.form.get(
            "signed_request",
            "",
        )
        or
        ""
    ).strip()


    if value:

        return value


    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    if isinstance(
        data,
        dict,
    ):

        return str(
            data.get(
                "signed_request",
                "",
            )
            or
            ""
        ).strip()


    return ""


def instagram_user_id_from_signed_payload(
    payload,
):

    if not isinstance(
        payload,
        dict,
    ):

        return ""


    return str(

        payload.get(
            "user_id"
        )

        or

        payload.get(
            "instagram_user_id"
        )

        or

        ""

    ).strip()


def remove_instagram_connection_by_user_id(
    instagram_user_id,
):

    instagram_user_id = str(
        instagram_user_id
        or
        ""
    ).strip()


    if not instagram_user_id:

        return None


    user = (
        User.query
        .filter_by(

            instagram_user_id=
                instagram_user_id

        )
        .first()
    )


    if not user:

        return None


    user.unlink_instagram_account()


    db.session.commit()


    return user


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
        or
        ""
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


    if not name:

        return jsonify({
            "message":
                "Name is required."
        }), 400


    if len(name) < 2:

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
                "Unable to create account right now."
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


    google_sub = str(
        google_profile.get(
            "sub",
            "",
        )
        or
        ""
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
        or
        ""
    ).strip()


    google_name = str(
        google_profile.get(
            "name",
            "",
        )
        or
        ""
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
            existing_user.google_sub !=
            google_sub
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
                        "connected to another SHOBDO account."
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


    google_name = normalize_name(

        google_name,

        fallback=
            email.split(
                "@",
                1,
            )[0]
            or
            "SHOBDO User",

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
                "Facebook access token is required."
        }), 400


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
                    "Facebook sign-in could not be "
                    "verified. Please try again."
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


    facebook_user_id = str(
        facebook_profile.get(
            "id",
            "",
        )
        or
        ""
    ).strip()


    debug_user_id = str(
        debug_data.get(
            "user_id",
            "",
        )
        or
        ""
    ).strip()


    facebook_name = str(
        facebook_profile.get(
            "name",
            "",
        )
        or
        ""
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
                    "or use another SHOBDO sign-in method."
                ),

        }), 422


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
            existing_user.facebook_user_id !=
            facebook_user_id
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


    facebook_name = normalize_name(

        facebook_name,

        fallback=
            email.split(
                "@",
                1,
            )[0]
            or
            "SHOBDO User",

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
# LINK FACEBOOK
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
                "Facebook access token is required."
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
        or
        ""
    ).strip()


    debug_user_id = str(
        debug_data.get(
            "user_id",
            "",
        )
        or
        ""
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
                    "connected to another SHOBDO account."
                ),

        }), 409


    if (
        user.facebook_user_id
        and
        user.facebook_user_id !=
        facebook_user_id
    ):

        return jsonify({

            "code":
                "facebook_account_conflict",

            "message":
                (
                    "Your SHOBDO account is already "
                    "connected to another Facebook account."
                ),

        }), 409


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
                    "connected to another SHOBDO account."
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
# INSTAGRAM START
# =========================================================

@auth_bp.route(
    "/instagram/start",
    methods=[
        "GET",
    ],
)
def instagram_login_start():

    try:

        validate_instagram_configuration()


        nonce = (
            secrets.token_urlsafe(
                32
            )
        )


        state = (
            create_instagram_oauth_state(
                nonce
            )
        )


        authorization_url = (
            build_instagram_authorization_url(
                state
            )
        )


        response = redirect(
            authorization_url,
            code=302,
        )


        response.headers[
            "Cache-Control"
        ] = (
            "no-store"
        )


        response.set_cookie(

            INSTAGRAM_STATE_COOKIE,

            nonce,

            max_age=
                INSTAGRAM_OAUTH_STATE_MAX_AGE_SECONDS,

            secure=
                get_instagram_redirect_uri()
                .lower()
                .startswith(
                    "https://"
                ),

            httponly=
                True,

            samesite=
                "Lax",

            path=
                "/api/auth/instagram",

        )


        return response


    except RuntimeError as error:

        current_app.logger.error(
            (
                "Instagram login start "
                "configuration error: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_not_configured",

            message=
                (
                    "Instagram sign-in is temporarily "
                    "unavailable."
                ),

        )


    except Exception as error:

        current_app.logger.exception(
            (
                "Instagram login start "
                "failed: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_start_failed",

            message=
                (
                    "Unable to start Instagram "
                    "sign-in right now."
                ),

        )


# =========================================================
# INSTAGRAM CALLBACK
# =========================================================

@auth_bp.route(
    "/instagram/callback",
    methods=[
        "GET",
    ],
)
def instagram_login_callback():

    instagram_error = str(
        request.args.get(
            "error",
            "",
        )
        or
        ""
    ).strip()


    if instagram_error:

        error_description = str(

            request.args.get(
                "error_description",
                "",
            )

            or

            request.args.get(
                "error_reason",
                "",
            )

            or

            ""

        ).strip()


        current_app.logger.info(
            (
                "Instagram OAuth was not completed: "
                "%s - %s"
            ),
            instagram_error,
            error_description,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_cancelled",

            message=
                (
                    "Instagram sign-in was cancelled "
                    "or permission was not granted."
                ),

        )


    authorization_code = str(
        request.args.get(
            "code",
            "",
        )
        or
        ""
    ).strip()


    state = str(
        request.args.get(
            "state",
            "",
        )
        or
        ""
    ).strip()


    cookie_nonce = str(
        request.cookies.get(
            INSTAGRAM_STATE_COOKIE,
            "",
        )
        or
        ""
    ).strip()


    if (
        not authorization_code
        or
        not state
    ):

        return instagram_frontend_redirect(

            error_code=
                "instagram_callback_invalid",

            message=
                (
                    "Instagram did not return a valid "
                    "authorization response."
                ),

        )


    try:

        state_payload = (
            verify_instagram_oauth_state(
                state
            )
        )


    except SignatureExpired:

        return instagram_frontend_redirect(

            error_code=
                "instagram_state_expired",

            message=
                (
                    "The Instagram sign-in request "
                    "expired. Please try again."
                ),

        )


    except BadSignature:

        return instagram_frontend_redirect(

            error_code=
                "instagram_state_invalid",

            message=
                (
                    "The Instagram sign-in request "
                    "could not be verified."
                ),

        )


    expected_nonce = str(
        state_payload.get(
            "nonce",
            "",
        )
        or
        ""
    ).strip()


    if (
        not cookie_nonce
        or
        not expected_nonce
        or
        not hmac.compare_digest(
            cookie_nonce,
            expected_nonce,
        )
    ):

        current_app.logger.warning(
            (
                "Instagram OAuth state cookie "
                "validation failed."
            )
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_state_mismatch",

            message=
                (
                    "The Instagram sign-in session "
                    "could not be verified. "
                    "Please try again."
                ),

        )


    try:

        token_data = (
            exchange_instagram_authorization_code(
                authorization_code
            )
        )


        instagram_profile = (
            fetch_instagram_profile(
                token_data[
                    "access_token"
                ]
            )
        )


    except http_requests.exceptions.Timeout as error:

        current_app.logger.exception(
            (
                "Instagram authentication "
                "timed out: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_timeout",

            message=
                (
                    "Instagram authentication timed "
                    "out. Please try again."
                ),

        )


    except (
        http_requests
        .exceptions
        .RequestException
    ) as error:

        current_app.logger.exception(
            (
                "Instagram authentication "
                "network error: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_network_error",

            message=
                (
                    "Unable to contact Instagram "
                    "authentication services. "
                    "Please try again."
                ),

        )


    except ValueError as error:

        current_app.logger.warning(
            (
                "Instagram authentication "
                "verification failed: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_verification_failed",

            message=
                (
                    "Instagram sign-in could not "
                    "be verified."
                ),

        )


    except RuntimeError as error:

        current_app.logger.error(
            (
                "Instagram authentication "
                "configuration error: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_not_configured",

            message=
                (
                    "Instagram sign-in is temporarily "
                    "unavailable."
                ),

        )


    except Exception as error:

        current_app.logger.exception(
            (
                "Unexpected Instagram "
                "authentication error: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_authentication_failed",

            message=
                (
                    "Unable to complete Instagram "
                    "sign-in right now."
                ),

        )


    instagram_user_id = str(
        instagram_profile.get(
            "id",
            "",
        )
        or
        ""
    ).strip()


    token_user_id = str(
        token_data.get(
            "instagram_user_id",
            "",
        )
        or
        ""
    ).strip()


    instagram_username = str(
        instagram_profile.get(
            "username",
            "",
        )
        or
        ""
    ).strip()


    if not instagram_user_id:

        return instagram_frontend_redirect(

            error_code=
                "instagram_user_id_missing",

            message=
                (
                    "Instagram did not provide "
                    "a valid account identifier."
                ),

        )


    if (
        token_user_id
        and
        token_user_id !=
        instagram_user_id
    ):

        current_app.logger.warning(
            (
                "Instagram user ID mismatch "
                "during OAuth callback."
            )
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_user_id_mismatch",

            message=
                (
                    "Instagram sign-in could "
                    "not be verified."
                ),

        )


    user = (
        User.query
        .filter_by(

            instagram_user_id=
                instagram_user_id

        )
        .first()
    )


    if user:

        if not user.is_active:

            return instagram_frontend_redirect(

                error_code=
                    "account_disabled",

                message=
                    (
                        "This SHOBDO account is "
                        "currently disabled."
                    ),

            )


        try:

            user.update_instagram_profile(

                instagram_username=
                    instagram_username,

            )


            db.session.commit()


        except Exception as error:

            db.session.rollback()


            current_app.logger.exception(
                (
                    "Instagram-linked account "
                    "update failed: %s"
                ),
                error,
            )


            return instagram_frontend_redirect(

                error_code=
                    "instagram_login_update_failed",

                message=
                    (
                        "Unable to complete Instagram "
                        "sign-in right now."
                    ),

            )


        try:

            handoff_token = (
                create_instagram_handoff_token(

                    action=
                        "login",

                    user_id=
                        user.id,

                    instagram_user_id=
                        instagram_user_id,

                    instagram_username=
                        instagram_username,

                )
            )


        except Exception as error:

            current_app.logger.exception(
                (
                    "Instagram login handoff "
                    "creation failed: %s"
                ),
                error,
            )


            return instagram_frontend_redirect(

                error_code=
                    "instagram_handoff_failed",

                message=
                    (
                        "Unable to finish Instagram "
                        "sign-in right now."
                    ),

            )


        return instagram_frontend_redirect(

            handoff_token=
                handoff_token,

        )


    try:

        handoff_token = (
            create_instagram_handoff_token(

                action=
                    "link",

                instagram_user_id=
                    instagram_user_id,

                instagram_username=
                    instagram_username,

            )
        )


    except Exception as error:

        current_app.logger.exception(
            (
                "Instagram link handoff "
                "creation failed: %s"
            ),
            error,
        )


        return instagram_frontend_redirect(

            error_code=
                "instagram_handoff_failed",

            message=
                (
                    "Unable to prepare Instagram "
                    "account linking right now."
                ),

        )


    return instagram_frontend_redirect(

        handoff_token=
            handoff_token,

    )


# =========================================================
# EXCHANGE INSTAGRAM REDIRECT HANDOFF
# =========================================================

@auth_bp.route(
    "/instagram/exchange",
    methods=[
        "POST",
    ],
)
def exchange_instagram_handoff():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    handoff_token = str(

        data.get(
            "handoff_token",
            "",
        )

        or

        data.get(
            "handoff",
            "",
        )

        or

        ""

    ).strip()


    if not handoff_token:

        return jsonify({

            "code":
                "instagram_handoff_missing",

            "provider":
                "instagram",

            "message":
                (
                    "Instagram sign-in information "
                    "is missing."
                ),

        }), 400


    try:

        payload = (
            verify_instagram_handoff_token(
                handoff_token
            )
        )


    except SignatureExpired:

        return jsonify({

            "code":
                "instagram_handoff_expired",

            "provider":
                "instagram",

            "message":
                (
                    "Instagram sign-in expired. "
                    "Please try again."
                ),

        }), 400


    except BadSignature:

        return jsonify({

            "code":
                "instagram_handoff_invalid",

            "provider":
                "instagram",

            "message":
                (
                    "Instagram sign-in could "
                    "not be verified."
                ),

        }), 400


    action = str(
        payload.get(
            "action",
            "",
        )
        or
        ""
    ).strip().lower()


    instagram_user_id = str(
        payload.get(
            "instagram_user_id",
            "",
        )
        or
        ""
    ).strip()


    instagram_username = str(
        payload.get(
            "instagram_username",
            "",
        )
        or
        ""
    ).strip()


    if action == "login":

        try:

            user_id = int(
                payload.get(
                    "user_id"
                )
            )


        except (
            TypeError,
            ValueError,
        ):

            return jsonify({

                "code":
                    "instagram_handoff_invalid",

                "provider":
                    "instagram",

                "message":
                    (
                        "Instagram sign-in could "
                        "not be verified."
                    ),

            }), 400


        user = (
            db.session.get(
                User,
                user_id,
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


        if (
            not user.instagram_user_id
            or
            str(
                user.instagram_user_id
            )
            !=
            instagram_user_id
        ):

            return jsonify({

                "code":
                    "instagram_account_mismatch",

                "provider":
                    "instagram",

                "message":
                    (
                        "Instagram account verification "
                        "failed."
                    ),

            }), 409


        try:

            user.update_instagram_profile(

                instagram_username=
                    instagram_username,

            )


            user.mark_login()


            db.session.commit()


        except Exception as error:

            db.session.rollback()


            current_app.logger.exception(
                (
                    "Instagram login exchange "
                    "failed: %s"
                ),
                error,
            )


            return jsonify({
                "message":
                    (
                        "Unable to complete Instagram "
                        "sign-in right now."
                    )
            }), 500


        return create_login_response(

            user,

            message=
                "Instagram sign-in successful.",

            auth_provider=
                "instagram",

        )


    if action == "link":

        if not instagram_user_id:

            return jsonify({

                "code":
                    "instagram_handoff_invalid",

                "provider":
                    "instagram",

                "message":
                    (
                        "Instagram account information "
                        "is missing."
                    ),

            }), 400


        existing_user = (
            User.query
            .filter_by(

                instagram_user_id=
                    instagram_user_id

            )
            .first()
        )


        if existing_user:

            return jsonify({

                "code":
                    "instagram_account_conflict",

                "provider":
                    "instagram",

                "message":
                    (
                        "This Instagram account is "
                        "already connected to a "
                        "SHOBDO account."
                    ),

            }), 409


        try:

            link_token = (
                create_instagram_link_token(

                    instagram_user_id=
                        instagram_user_id,

                    instagram_username=
                        instagram_username,

                )
            )


        except Exception as error:

            current_app.logger.exception(
                (
                    "Instagram link token "
                    "creation failed: %s"
                ),
                error,
            )


            return jsonify({
                "message":
                    (
                        "Unable to prepare Instagram "
                        "account linking right now."
                    )
            }), 500


        return jsonify({

            "status":
                "link_required",

            "code":
                "instagram_link_required",

            "provider":
                "instagram",

            "message":
                (
                    "Instagram was verified. "
                    "Sign in to your existing "
                    "SHOBDO account to connect it."
                ),

            "instagram_username":
                instagram_username,

            "link_token":
                link_token,

        }), 200


    return jsonify({

        "code":
            "instagram_handoff_invalid",

        "provider":
            "instagram",

        "message":
            (
                "Instagram sign-in could "
                "not be verified."
            ),

    }), 400


# =========================================================
# LINK INSTAGRAM
# =========================================================

@auth_bp.route(
    "/instagram/link",
    methods=[
        "POST",
    ],
)
@jwt_required()
def link_instagram_account():

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


    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    link_token = str(

        data.get(
            "link_token",
            "",
        )

        or

        data.get(
            "instagram_link_token",
            "",
        )

        or

        ""

    ).strip()


    if not link_token:

        return jsonify({

            "code":
                "instagram_link_token_missing",

            "message":
                (
                    "Instagram link token "
                    "is required."
                ),

        }), 400


    try:

        instagram_identity = (
            verify_instagram_link_token(
                link_token
            )
        )


    except SignatureExpired:

        return jsonify({

            "code":
                "instagram_link_token_expired",

            "message":
                (
                    "The Instagram connection request "
                    "expired. Please start Instagram "
                    "sign-in again."
                ),

        }), 400


    except BadSignature:

        return jsonify({

            "code":
                "instagram_link_token_invalid",

            "message":
                (
                    "The Instagram connection request "
                    "could not be verified."
                ),

        }), 400


    instagram_user_id = str(
        instagram_identity.get(
            "instagram_user_id",
            "",
        )
        or
        ""
    ).strip()


    instagram_username = str(
        instagram_identity.get(
            "instagram_username",
            "",
        )
        or
        ""
    ).strip()


    other_user = (
        User.query
        .filter(

            User.instagram_user_id
            ==
            instagram_user_id,

            User.id
            !=
            user.id,

        )
        .first()
    )


    if other_user:

        return jsonify({

            "code":
                "instagram_account_conflict",

            "provider":
                "instagram",

            "message":
                (
                    "This Instagram account is already "
                    "connected to another SHOBDO account."
                ),

        }), 409


    if (
        user.instagram_user_id
        and
        user.instagram_user_id !=
        instagram_user_id
    ):

        return jsonify({

            "code":
                "instagram_account_conflict",

            "provider":
                "instagram",

            "message":
                (
                    "Your SHOBDO account is already "
                    "connected to another Instagram account."
                ),

        }), 409


    try:

        user.link_instagram_account(

            instagram_user_id,

            instagram_username=
                instagram_username,

        )


        db.session.commit()


    except IntegrityError:

        db.session.rollback()


        return jsonify({

            "code":
                "instagram_account_conflict",

            "provider":
                "instagram",

            "message":
                (
                    "This Instagram account is already "
                    "connected to another SHOBDO account."
                ),

        }), 409


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Instagram account linking "
                "failed: %s"
            ),
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to connect your Instagram "
                    "account right now."
                )
        }), 500


    return jsonify({

        "message":
            (
                "Instagram account connected "
                "successfully."
            ),

        "provider":
            "instagram",

        "user":
            user.to_dict(),

    }), 200


# =========================================================
# INSTAGRAM DEAUTHORIZE
# =========================================================

@auth_bp.route(
    "/instagram/deauthorize",
    methods=[
        "POST",
    ],
)
def instagram_deauthorize():
    """
    Meta/Instagram deauthorization callback.

    Meta sends a signed_request. We verify the HMAC signature,
    identify the Instagram account, and remove only the stored
    Instagram connection from the matching SHOBDO account.

    The operation is intentionally idempotent: if the Instagram
    account is already unlinked, the callback still succeeds.
    """

    signed_request = (
        get_signed_request_from_request()
    )


    if not signed_request:

        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram signed request "
                    "is required."
                ),

        }), 400


    try:

        payload = (
            parse_instagram_signed_request(
                signed_request
            )
        )


    except (
        ValueError,
        RuntimeError,
    ) as error:

        current_app.logger.warning(
            (
                "Invalid Instagram "
                "deauthorization request: %s"
            ),
            error,
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram deauthorization request "
                    "could not be verified."
                ),

        }), 400


    instagram_user_id = (
        instagram_user_id_from_signed_payload(
            payload
        )
    )


    if not instagram_user_id:

        current_app.logger.warning(
            "Verified Instagram deauthorization request "
            "did not contain a user identifier."
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram deauthorization request "
                    "did not contain an account identifier."
                ),

        }), 400


    try:

        remove_instagram_connection_by_user_id(
            instagram_user_id
        )


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Instagram deauthorization "
                "cleanup failed: %s"
            ),
            error,
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram deauthorization "
                    "could not be completed."
                ),

        }), 500


    response = jsonify({

        "success":
            True,

        "status":
            "deauthorized",

        "provider":
            "instagram",

        "message":
            (
                "Instagram authorization data "
                "was removed from SHOBDO."
            ),

    })


    response.headers[
        "Cache-Control"
    ] = (
        "no-store, no-cache, "
        "must-revalidate, max-age=0"
    )


    response.headers[
        "Pragma"
    ] = "no-cache"


    return response, 200


# =========================================================
# INSTAGRAM DATA DELETION
# =========================================================

@auth_bp.route(
    "/instagram/data-deletion",
    methods=[
        "POST",
    ],
)
def instagram_data_deletion():
    """
    Meta/Instagram user-data deletion callback.

    Meta posts a signed_request. After verification, SHOBDO
    removes the stored Instagram connection and returns the
    confirmation payload required by Meta:

        {
            "url": "https://.../data-deletion/status?code=...",
            "confirmation_code": "..."
        }
    """

    signed_request = (
        get_signed_request_from_request()
    )


    if not signed_request:

        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram signed request "
                    "is required."
                ),

        }), 400


    try:

        payload = (
            parse_instagram_signed_request(
                signed_request
            )
        )


    except (
        ValueError,
        RuntimeError,
    ) as error:

        current_app.logger.warning(
            (
                "Invalid Instagram data-deletion "
                "request: %s"
            ),
            error,
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram data-deletion request "
                    "could not be verified."
                ),

        }), 400


    instagram_user_id = (
        instagram_user_id_from_signed_payload(
            payload
        )
    )


    if not instagram_user_id:

        current_app.logger.warning(
            "Verified Instagram data-deletion request "
            "did not contain a user identifier."
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram data-deletion request "
                    "did not contain an account identifier."
                ),

        }), 400


    try:

        remove_instagram_connection_by_user_id(
            instagram_user_id
        )


        confirmation_code = (
            create_instagram_deletion_status_token(
                instagram_user_id
            )
        )


    except Exception as error:

        db.session.rollback()


        current_app.logger.exception(
            (
                "Instagram data-deletion "
                "processing failed: %s"
            ),
            error,
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram data-deletion request "
                    "could not be completed."
                ),

        }), 500


    backend_base_url = (
        get_instagram_backend_base_url()
    )


    if not backend_base_url:

        current_app.logger.error(
            (
                "Could not determine public backend "
                "URL for Instagram data deletion."
            )
        )


        return jsonify({

            "success":
                False,

            "provider":
                "instagram",

            "message":
                (
                    "Instagram data-deletion status "
                    "URL is not configured."
                ),

        }), 503


    status_url = (

        f"{backend_base_url}"
        f"/api/auth/instagram/data-deletion/status"
        f"?code="
        f"{quote(confirmation_code, safe='')}"

    )


    response = jsonify({

        "url":
            status_url,

        "confirmation_code":
            confirmation_code,

    })


    response.headers[
        "Cache-Control"
    ] = (
        "no-store, no-cache, "
        "must-revalidate, max-age=0"
    )


    response.headers[
        "Pragma"
    ] = "no-cache"


    return response, 200


# =========================================================
# INSTAGRAM DATA DELETION STATUS
# =========================================================

@auth_bp.route(
    "/instagram/data-deletion/status",
    methods=[
        "GET",
    ],
)
def instagram_data_deletion_status():
    """
    Public confirmation endpoint returned to Meta after a
    successful data-deletion request.

    Do not expose the Instagram user ID in the response. The
    signed confirmation token is enough to prove completion.
    """

    confirmation_code = str(
        request.args.get(
            "code",
            "",
        )
        or
        ""
    ).strip()


    if not confirmation_code:

        return jsonify({

            "status":
                "invalid",

            "provider":
                "instagram",

            "message":
                (
                    "Data-deletion confirmation "
                    "code is missing."
                ),

        }), 400


    try:

        verify_instagram_deletion_status_token(
            confirmation_code
        )


    except SignatureExpired:

        return jsonify({

            "status":
                "expired",

            "provider":
                "instagram",

            "message":
                (
                    "This data-deletion confirmation "
                    "has expired."
                ),

        }), 400


    except BadSignature:

        return jsonify({

            "status":
                "invalid",

            "provider":
                "instagram",

            "message":
                (
                    "This data-deletion confirmation "
                    "could not be verified."
                ),

        }), 400


    response = jsonify({

        "status":
            "completed",

        "provider":
            "instagram",

        "message":
            (
                "Instagram authentication data "
                "has been removed from SHOBDO."
            ),

    })


    response.headers[
        "Cache-Control"
    ] = (
        "no-store, no-cache, "
        "must-revalidate, max-age=0"
    )


    response.headers[
        "Pragma"
    ] = "no-cache"


    return response, 200


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
                (
                    "Please enter a valid "
                    "email address."
                )
        }), 400


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


    frontend_url = (
        get_frontend_url()
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
                "Invalid password reset link.",

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
            "Password reset link is valid.",

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