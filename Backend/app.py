# =========================================================
# SHOBDO BACKEND APPLICATION
# =========================================================

import os

from datetime import timedelta

from dotenv import load_dotenv

from flask import (
    Flask,
    jsonify,
)

from flask_cors import CORS

from werkzeug.middleware.proxy_fix import (
    ProxyFix,
)

from extensions import (
    db,
    jwt,
    mail,
    migrate,
    socketio,
)


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# CONSTANTS
# =========================================================

LOCAL_FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


PRODUCTION_FRONTEND_ORIGINS = [
    "https://shobdoverse.com",
    "https://www.shobdoverse.com",
    "https://shobdo-cosmos.pages.dev",
]


DEFAULT_PRODUCTION_FRONTEND_URL = (
    "https://www.shobdoverse.com"
)


# =========================================================
# URL HELPERS
# =========================================================

def clean_url(
    value,
):
    """
    Normalize an origin / frontend URL.

    Example:

        https://www.shobdoverse.com/

    becomes:

        https://www.shobdoverse.com
    """

    if not value:
        return None


    value = (
        str(
            value
        )
        .strip()
        .rstrip("/")
    )


    return (
        value
        or
        None
    )


# =========================================================


def add_origin(
    origins,
    value,
):
    """
    Add a normalized origin without duplicates.
    """

    origin = clean_url(
        value
    )


    if (
        origin
        and
        origin not in origins
    ):

        origins.append(
            origin
        )


# =========================================================


def is_render_environment():
    """
    Detect a Render production environment.
    """

    value = (
        os.getenv(
            "RENDER",
            "",
        )
        or
        ""
    )


    return (
        value
        .strip()
        .lower()
        in {
            "true",
            "1",
            "yes",
            "on",
        }
    )


# =========================================================


def get_frontend_url():
    """
    Resolve SHOBDO's canonical frontend URL.

    Priority:

    1. FRONTEND_URL
    2. PRODUCTION_FRONTEND_URL
    3. PUBLIC_SITE_URL
    4. production SHOBDO domain on Render
    5. localhost during local development
    """

    candidates = [

        os.getenv(
            "FRONTEND_URL"
        ),

        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        ),

        os.getenv(
            "PUBLIC_SITE_URL"
        ),

    ]


    for candidate in candidates:

        url = clean_url(
            candidate
        )


        if url:
            return url


    if is_render_environment():

        return (
            DEFAULT_PRODUCTION_FRONTEND_URL
        )


    return (
        "http://localhost:5173"
    )


# =========================================================


def get_allowed_origins():
    """
    Build the complete CORS origin list.

    Includes:

    - local Vite development
    - Cloudflare Pages URL
    - shobdoverse.com
    - www.shobdoverse.com
    - Render environment values
    - optional additional origins
    """

    origins = []


    # -----------------------------------------------------
    # LOCAL DEVELOPMENT
    # -----------------------------------------------------

    for origin in (
        LOCAL_FRONTEND_ORIGINS
    ):

        add_origin(
            origins,
            origin,
        )


    # -----------------------------------------------------
    # KNOWN PRODUCTION FRONTENDS
    # -----------------------------------------------------

    for origin in (
        PRODUCTION_FRONTEND_ORIGINS
    ):

        add_origin(
            origins,
            origin,
        )


    # -----------------------------------------------------
    # FRONTEND_URL
    # -----------------------------------------------------

    add_origin(

        origins,

        os.getenv(
            "FRONTEND_URL"
        ),

    )


    # -----------------------------------------------------
    # PRODUCTION_FRONTEND_URL
    # -----------------------------------------------------

    add_origin(

        origins,

        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        ),

    )


    # -----------------------------------------------------
    # PUBLIC_SITE_URL
    # -----------------------------------------------------

    add_origin(

        origins,

        os.getenv(
            "PUBLIC_SITE_URL"
        ),

    )


    # -----------------------------------------------------
    # EXTRA FRONTEND ORIGINS
    # -----------------------------------------------------

    extra_origins = (

        os.getenv(
            "CORS_ORIGINS",
            "",
        )

        or
        ""

    )


    for origin in (
        extra_origins.split(",")
    ):

        add_origin(
            origins,
            origin,
        )


    return origins


# =========================================================
# APPLICATION FACTORY
# =========================================================

def create_app():

    app = Flask(
        __name__
    )


    # =====================================================
    # REVERSE PROXY
    # =====================================================

    app.wsgi_app = ProxyFix(

        app.wsgi_app,

        x_for=1,
        x_proto=1,
        x_host=1,
        x_port=1,

    )


    # =====================================================
    # DATABASE
    # =====================================================

    database_url = (

        os.getenv(
            "DATABASE_URL"
        )

    )


    if not database_url:

        raise RuntimeError(
            "DATABASE_URL is missing."
        )


    database_url = (
        database_url.strip()
    )


    app.config[
        "SQLALCHEMY_DATABASE_URI"
    ] = database_url


    app.config[
        "SQLALCHEMY_TRACK_MODIFICATIONS"
    ] = False


    app.config[
        "SQLALCHEMY_ENGINE_OPTIONS"
    ] = {

        "pool_pre_ping":
            True,

        "pool_recycle":
            300,

        "pool_size":
            5,

        "max_overflow":
            10,

    }


    # =====================================================
    # JWT
    # =====================================================

    jwt_secret = (

        os.getenv(
            "JWT_SECRET_KEY"
        )

    )


    if not jwt_secret:

        raise RuntimeError(
            "JWT_SECRET_KEY is missing."
        )


    app.config[
        "JWT_SECRET_KEY"
    ] = jwt_secret


    app.config[
        "JWT_ACCESS_TOKEN_EXPIRES"
    ] = timedelta(
        hours=24
    )


    app.config[
        "JWT_TOKEN_LOCATION"
    ] = [
        "headers",
    ]


    app.config[
        "JWT_HEADER_NAME"
    ] = "Authorization"


    app.config[
        "JWT_HEADER_TYPE"
    ] = "Bearer"


    # =====================================================
    # MAIL
    # =====================================================

    app.config[
        "MAIL_SERVER"
    ] = os.getenv(
        "MAIL_SERVER",
        "smtp.gmail.com",
    )


    app.config[
        "MAIL_PORT"
    ] = int(

        os.getenv(
            "MAIL_PORT",
            "587",
        )

    )


    app.config[
        "MAIL_USE_TLS"
    ] = (

        (
            os.getenv(
                "MAIL_USE_TLS",
                "true",
            )
            or
            "true"
        )

        .strip()
        .lower()

        in {
            "true",
            "1",
            "yes",
            "on",
        }

    )


    app.config[
        "MAIL_USE_SSL"
    ] = (

        (
            os.getenv(
                "MAIL_USE_SSL",
                "false",
            )
            or
            "false"
        )

        .strip()
        .lower()

        in {
            "true",
            "1",
            "yes",
            "on",
        }

    )


    app.config[
        "MAIL_USERNAME"
    ] = os.getenv(
        "MAIL_USERNAME"
    )


    app.config[
        "MAIL_PASSWORD"
    ] = os.getenv(
        "MAIL_PASSWORD"
    )


    app.config[
        "MAIL_DEFAULT_SENDER"
    ] = (

        os.getenv(
            "MAIL_DEFAULT_SENDER"
        )

        or

        app.config.get(
            "MAIL_USERNAME"
        )

    )


    # =====================================================
    # FRONTEND / PUBLIC URL
    # =====================================================

    frontend_url = (
        get_frontend_url()
    )


    app.config[
        "FRONTEND_URL"
    ] = frontend_url


    app.config[
        "PUBLIC_SITE_URL"
    ] = frontend_url


    # =====================================================
    # FILE UPLOADS
    #
    # - Writing/OCR/artwork/PDF routes can keep smaller
    #   route-specific limits.
    # - Videos and Reels can use uploads up to 100 MB.
    # - 110 MB leaves multipart overhead.
    # =====================================================

    app.config[
        "MAX_CONTENT_LENGTH"
    ] = (
        110
        *
        1024
        *
        1024
    )


    # =====================================================
    # JSON
    # =====================================================

    app.config[
        "JSON_SORT_KEYS"
    ] = False


    try:

        app.json.sort_keys = False

    except Exception:

        pass


    # =====================================================
    # HTTPS
    # =====================================================

    app.config[
        "PREFERRED_URL_SCHEME"
    ] = (

        "https"

        if is_render_environment()

        else "http"

    )


    # =====================================================
    # CORS
    # =====================================================

    allowed_origins = (
        get_allowed_origins()
    )


    # =====================================================
    # INITIALIZE EXTENSIONS
    # =====================================================

    db.init_app(
        app
    )


    migrate.init_app(
        app,
        db,
    )


    jwt.init_app(
        app
    )


    mail.init_app(
        app
    )


    # =====================================================
    # HTTP CORS
    # =====================================================

    CORS(

        app,

        resources={

            r"/api/*": {

                "origins":
                    allowed_origins,

                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                    "Accept",
                    "Origin",
                ],

                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS",
                ],

                "expose_headers": [
                    "Content-Type",
                    "Content-Length",
                ],

            },

        },

        supports_credentials=True,

        max_age=86400,

    )


    # =====================================================
    # SOCKET.IO
    # =====================================================

    socketio.init_app(

        app,

        cors_allowed_origins=
            allowed_origins,

        async_mode=
            "threading",

        ping_timeout=
            60,

        ping_interval=
            25,

        logger=
            False,

        engineio_logger=
            False,

    )


    # =====================================================
    # SOCKET.IO HANDLERS
    # =====================================================

    import socket_handlers

    _ = socket_handlers


    # =====================================================
    # DATABASE MODELS
    #
    # Import every model so SQLAlchemy and Alembic know it.
    # =====================================================

    from models.user import (
        User,
    )

    from models.writing import (
        Writing,
    )

    from models.tag import (
        Tag,
        writing_tags,
    )

    from models.notification import (
        Notification,
    )

    from models.document import (
        Document,
    )

    from models.artwork import (
        Artwork,
    )

    from models.video import (
        Video,
    )

    from models.reel import (
        Reel,
    )

    from models.saved_writing import (
        SavedWriting,
    )

    from models.repost import (
        Repost,
    )


    _models = (

        User,
        Writing,
        Tag,
        Notification,
        Document,
        Artwork,
        Video,
        Reel,
        SavedWriting,
        Repost,

    )


    _association_tables = (
        writing_tags,
    )


    if (
        not _models
        or
        not _association_tables
    ):

        raise RuntimeError(
            "Unable to load database models."
        )


    # =====================================================
    # BLUEPRINT IMPORTS
    # =====================================================

    from routes.auth_routes import (
        auth_bp,
    )

    from routes.writing_routes import (
        writings_bp,
    )

    from routes.like_routes import (
        like_bp,
    )

    from routes.comment_routes import (
        comment_bp,
    )

    from routes.user_routes import (
        user_bp,
    )

    from routes.notification_routes import (
        notification_bp,
    )

    from routes.document_routes import (
        document_bp,
    )

    from routes.artwork_routes import (
        artwork_bp,
    )

    from routes.video_routes import (
        video_bp,
    )

    from routes.reel_routes import (
        reel_bp,
    )

    from routes.saved_routes import (
        saved_bp,
    )

    from routes.search_routes import (
        search_bp,
    )

    from routes.trending_routes import (
        trending_bp,
    )

    from routes.repost_routes import (
        repost_bp,
    )

    from routes.seo_routes import (
        seo_bp,
    )

    from routes.audio_summary_routes import audio_summary_bp


    # =====================================================
    # REGISTER SEO
    # =====================================================

    app.register_blueprint(
        seo_bp
    )


    # =====================================================
    # REGISTER AUTH
    # =====================================================

    app.register_blueprint(

        auth_bp,

        url_prefix=
            "/api/auth",

    )


    # =====================================================
    # REGISTER WRITINGS
    # =====================================================

    app.register_blueprint(

        writings_bp,

        url_prefix=
            "/api/writings",

    )


    # =====================================================
    # REGISTER LIKES
    # =====================================================

    app.register_blueprint(

        like_bp,

        url_prefix=
            "/api/likes",

    )


    # =====================================================
    # REGISTER COMMENTS
    # =====================================================

    app.register_blueprint(

        comment_bp,

        url_prefix=
            "/api/comments",

    )


    # =====================================================
    # REGISTER USERS
    # =====================================================

    app.register_blueprint(
        user_bp
    )


    # =====================================================
    # REGISTER NOTIFICATIONS
    # =====================================================

    app.register_blueprint(
        notification_bp
    )


    # =====================================================
    # REGISTER DOCUMENTS
    # =====================================================

    app.register_blueprint(

        document_bp,

        url_prefix=
            "/api",

    )


    # =====================================================
    # REGISTER ARTWORK
    # =====================================================

    app.register_blueprint(
        artwork_bp
    )


    # =====================================================
    # REGISTER VIDEOS
    #
    # video_bp already contains its /api/videos prefix.
    # =====================================================

    app.register_blueprint(
        video_bp
    )


    # =====================================================
    # REGISTER REELS
    #
    # reel_bp already contains:
    #
    #     url_prefix="/api/reels"
    #
    # Therefore no additional prefix is added here.
    # =====================================================

    app.register_blueprint(
        reel_bp
    )


    # =====================================================
    # REGISTER SAVED
    # =====================================================

    app.register_blueprint(
        saved_bp
    )


    # =====================================================
    # REGISTER SEARCH
    # =====================================================

    app.register_blueprint(
        search_bp
    )


    # =====================================================
    # REGISTER TRENDING
    # =====================================================

    app.register_blueprint(
        trending_bp
    )


    # =====================================================
    # REGISTER REPOST
    # =====================================================

    app.register_blueprint(
        repost_bp
    )

    app.register_blueprint(
        audio_summary_bp,
        url_prefix="/api/writings",
    )


    # =====================================================
    # ROOT
    # =====================================================

    @app.route(
        "/",
        methods=[
            "GET",
        ],
    )
    def root():

        return jsonify({

            "name":
                "SHOBDO Backend",

            "status":
                "running",

            "environment":
                (
                    "production"
                    if is_render_environment()
                    else "development"
                ),

            "frontend":
                frontend_url,

            "api":
                "/api",

            "health":
                "/api/health",

            "reels":
                "/api/reels",

            "trending":
                "/api/trending/topics",

        }), 200


    # =====================================================
    # API ROOT
    # =====================================================

    @app.route(
        "/api",
        methods=[
            "GET",
        ],
    )
    def api_root():

        return jsonify({

            "name":
                "SHOBDO API",

            "status":
                "running",

            "version":
                "1.4.0",

            "realtime":
                True,

            "frontend":
                frontend_url,

            "health":
                "/api/health",

            "writings":
                "/api/writings",

            "reels":
                "/api/reels",

            "search":
                "/api/search",

            "users":
                "/api/users",

            "notifications":
                "/api/notifications",

            "saved":
                "/api/saved",

            "documents":
                "/api/documents",

            "videos":
                "/api/videos",

            "trending":
                "/api/trending/topics",

        }), 200


    # =====================================================
    # HEALTH
    # =====================================================

    @app.route(
        "/api/health",
        methods=[
            "GET",
            "OPTIONS",
        ],
    )
    def health():

        return jsonify({

            "status":
                "ok",

            "service":
                "SHOBDO Backend",

            "database":
                "configured",

            "socketio":
                "enabled",

            "trending":
                "enabled",

            "videos":
                "enabled",

            "reels":
                "enabled",

            "hashtags":
                "enabled",

            "frontend":
                frontend_url,

        }), 200


    # =====================================================
    # JWT — MISSING TOKEN
    # =====================================================

    @jwt.unauthorized_loader
    def missing_token_callback(
        reason,
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Authentication token is required.",

        }), 401


    # =====================================================
    # JWT — INVALID TOKEN
    # =====================================================

    @jwt.invalid_token_loader
    def invalid_token_callback(
        reason,
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authentication token.",

        }), 422


    # =====================================================
    # JWT — EXPIRED TOKEN
    # =====================================================

    @jwt.expired_token_loader
    def expired_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "Your session has expired. "
                    "Please log in again."
                ),

        }), 401


    # =====================================================
    # JWT — REVOKED TOKEN
    # =====================================================

    @jwt.revoked_token_loader
    def revoked_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "This authentication token "
                    "has been revoked."
                ),

        }), 401


    # =====================================================
    # JWT — FRESH TOKEN REQUIRED
    # =====================================================

    @jwt.needs_fresh_token_loader
    def fresh_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "A fresh login is required "
                    "for this action."
                ),

        }), 401


    # =====================================================
    # 404
    # =====================================================

    @app.errorhandler(
        404
    )
    def not_found(
        error,
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Requested resource was not found.",

        }), 404


    # =====================================================
    # 405
    # =====================================================

    @app.errorhandler(
        405
    )
    def method_not_allowed(
        error,
    ):

        return jsonify({

            "success":
                False,

            "message":
                "HTTP method not allowed.",

        }), 405


    # =====================================================
    # 413
    # =====================================================

    @app.errorhandler(
        413
    )
    def file_too_large(
        error,
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "Uploaded file is too large. "
                    "Videos can be up to 100 MB; "
                    "other upload types may have "
                    "smaller route-specific limits."
                ),

        }), 413


    # =====================================================
    # 500
    # =====================================================

    @app.errorhandler(
        500
    )
    def internal_server_error(
        error,
    ):

        try:

            db.session.rollback()

        except Exception:

            pass


        app.logger.exception(
            "Internal server error"
        )


        return jsonify({

            "success":
                False,

            "message":
                (
                    "An internal server "
                    "error occurred."
                ),

        }), 500


    # =====================================================
    # DEVELOPMENT INFORMATION
    # =====================================================

    if app.debug:

        print(
            "\nSHOBDO frontend:"
        )

        print(
            f" - {frontend_url}"
        )


        print(
            "\nAllowed frontend origins:"
        )


        for origin in (
            allowed_origins
        ):

            print(
                f" - {origin}"
            )


        print(
            "\nRegistered routes:"
        )


        for rule in sorted(

            app.url_map.iter_rules(),

            key=lambda item:
                item.rule,

        ):

            print(
                f" - {rule}"
            )


        print()


    # =====================================================
    # RETURN APPLICATION
    # =====================================================

    return app


# =========================================================
# APPLICATION INSTANCE
# =========================================================

app = create_app()


# =========================================================
# DEVELOPMENT SERVER
# =========================================================

if __name__ == "__main__":

    port = int(

        os.getenv(
            "PORT",
            "5000",
        )

    )


    debug = (

        (
            os.getenv(
                "FLASK_DEBUG",
                "true",
            )
            or
            "true"
        )

        .strip()
        .lower()

        in {
            "true",
            "1",
            "yes",
            "on",
        }

    )


    socketio.run(

        app,

        host=
            "0.0.0.0",

        port=
            port,

        debug=
            debug,

        allow_unsafe_werkzeug=
            debug,

    )