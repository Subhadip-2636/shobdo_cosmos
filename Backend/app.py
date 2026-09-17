import os

from datetime import timedelta

from dotenv import load_dotenv

from flask import (
    Flask,
    jsonify,
)

from flask_cors import CORS

from werkzeug.middleware.proxy_fix import ProxyFix

from routes.saved_routes import saved_bp

from extensions import (
    db,
    jwt,
    mail,
    migrate,
    socketio,
)


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# HELPERS
# =========================================================


def clean_url(value):
    """
    Remove spaces and trailing slashes from an origin URL.

    Example:
        https://shobdo.com/
    becomes:
        https://shobdo.com
    """

    if not value:
        return None

    value = (
        str(value)
        .strip()
        .rstrip("/")
    )

    return value or None


def add_origin(
    origins,
    value,
):
    """
    Safely add a frontend origin without duplicates.
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


def get_allowed_origins():
    """
    Build CORS origin list for both development and production.
    """

    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # =====================================================
    # PRIMARY FRONTEND URL
    # =====================================================

    add_origin(
        origins,
        os.getenv(
            "FRONTEND_URL"
        ),
    )

    # =====================================================
    # PRODUCTION FRONTEND URL
    # =====================================================

    add_origin(
        origins,
        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        ),
    )

    # =====================================================
    # OPTIONAL EXTRA ORIGINS
    # =====================================================
    #
    # Example Render environment variable:
    #
    # CORS_ORIGINS=https://shobdo.com,https://www.shobdo.com
    #
    # =====================================================

    extra_origins = os.getenv(
        "CORS_ORIGINS",
        "",
    )

    if extra_origins:

        for origin in (
            extra_origins
            .split(",")
        ):

            add_origin(
                origins,
                origin,
            )

    return origins


# =========================================================
# CREATE APPLICATION
# =========================================================


def create_app():

    app = Flask(
        __name__
    )

    # =====================================================
    # PRODUCTION PROXY SUPPORT
    # =====================================================
    #
    # Render / Cloudflare sit behind reverse proxies.
    #
    # ProxyFix ensures Flask correctly understands:
    #
    #   HTTPS
    #   host
    #   client forwarding
    #
    # It also helps url_for(..., _external=True) generate
    # https:// URLs instead of http:// URLs in production.
    #
    # =====================================================

    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_for=1,
        x_proto=1,
        x_host=1,
        x_port=1,
    )

    # =====================================================
    # DATABASE CONFIGURATION
    # =====================================================

    database_url = os.getenv(
        "DATABASE_URL"
    )

    if not database_url:

        raise RuntimeError(
            "DATABASE_URL is missing."
        )

    database_url = (
        database_url
        .strip()
    )

    # =====================================================
    # SQLALCHEMY
    # =====================================================

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
    # JWT CONFIGURATION
    # =====================================================

    jwt_secret = os.getenv(
        "JWT_SECRET_KEY"
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

    # JWT is sent from React through:
    #
    # Authorization: Bearer <token>

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
    # MAIL CONFIGURATION
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
        os.getenv(
            "MAIL_USE_TLS",
            "true",
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
        os.getenv(
            "MAIL_USE_SSL",
            "false",
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
    ] = os.getenv(
        "MAIL_DEFAULT_SENDER"
    ) or app.config.get(
        "MAIL_USERNAME"
    )

    # =====================================================
    # FRONTEND CONFIGURATION
    # =====================================================

    frontend_url = (
        clean_url(
            os.getenv(
                "FRONTEND_URL"
            )
        )
        or
        "http://localhost:5173"
    )

    app.config[
        "FRONTEND_URL"
    ] = frontend_url

    # =====================================================
    # FILE UPLOAD CONFIGURATION
    # =====================================================
    #
    # Actual PDF/image validation remains 10 MB.
    #
    # We allow 12 MB HTTP request size because multipart
    # requests have some additional encoding overhead.
    #
    # =====================================================

    app.config[
        "MAX_CONTENT_LENGTH"
    ] = (
        12
        * 1024
        * 1024
    )

    # =====================================================
    # JSON CONFIGURATION
    # =====================================================

    app.config[
        "JSON_SORT_KEYS"
    ] = False

    # =====================================================
    # SECURITY / PRODUCTION CONFIG
    # =====================================================

    app.config[
        "PREFERRED_URL_SCHEME"
    ] = (
        "https"
        if os.getenv(
            "RENDER"
        )
        else "http"
    )

    # =====================================================
    # ALLOWED ORIGINS
    # =====================================================

    allowed_origins = (
        get_allowed_origins()
    )

    # =====================================================
    # INITIALIZE DATABASE
    # =====================================================

    db.init_app(
        app
    )

    # =====================================================
    # MIGRATIONS
    # =====================================================

    migrate.init_app(
        app,
        db,
    )

    # =====================================================
    # JWT
    # =====================================================

    jwt.init_app(
        app
    )

    # =====================================================
    # MAIL
    # =====================================================

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

        logger=False,

        engineio_logger=False,
    )

    # =====================================================
    # SOCKET.IO EVENT HANDLERS
    # =====================================================

    import socket_handlers

    _ = socket_handlers

    # =====================================================
    # IMPORT ALL MODELS
    # =====================================================
    #
    # Importing every model is important because
    # Flask-Migrate / Alembic needs to know about them.
    #
    # Do NOT use db.create_all() here.
    #
    # =====================================================

    from models.user import (
        User,
    )

    from models.writing import (
        Writing,
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

    from models.saved_writing import SavedWriting

    _models = (
        User,
        Writing,
        Notification,
        Document,
        Artwork,
    )

    if not _models:

        raise RuntimeError(
            "Unable to load database models."
        )

    # =====================================================
    # IMPORT BLUEPRINTS
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

    # =====================================================
    # REGISTER AUTH BLUEPRINT
    # =====================================================

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth",
    )

    # =====================================================
    # REGISTER WRITING BLUEPRINT
    # =====================================================

    app.register_blueprint(
        writings_bp,
        url_prefix="/api/writings",
    )

    # =====================================================
    # REGISTER LIKE BLUEPRINT
    # =====================================================

    app.register_blueprint(
        like_bp,
        url_prefix="/api/likes",
    )

    # =====================================================
    # REGISTER COMMENT BLUEPRINT
    # =====================================================

    app.register_blueprint(
        comment_bp,
        url_prefix="/api/comments",
    )

    # =====================================================
    # REGISTER USER BLUEPRINT
    # =====================================================
    #
    # user_bp already contains /api/users...
    #
    # Therefore DO NOT add another /api prefix here.
    #
    # =====================================================

    app.register_blueprint(
        user_bp
    )

    # =====================================================
    # REGISTER NOTIFICATION BLUEPRINT
    # =====================================================
    #
    # notification_bp already contains /api/notifications.
    #
    # =====================================================

    app.register_blueprint(
        notification_bp
    )

    # =====================================================
    # REGISTER DOCUMENT BLUEPRINT
    # =====================================================
    #
    # document_routes.py should contain routes such as:
    #
    #     /documents
    #     /documents/<id>
    #     /documents/<id>/file
    #
    # Final routes become:
    #
    #     /api/documents
    #     /api/documents/<id>
    #     /api/documents/<id>/file
    #
    # =====================================================

    app.register_blueprint(
        document_bp,
        url_prefix="/api",
    )

    # =====================================================
    # REGISTER ARTWORK BLUEPRINT
    # =====================================================
    #
    # artwork_bp currently contains its own /api routes.
    #
    # =====================================================

    app.register_blueprint(
        artwork_bp
    )

    app.register_blueprint(
        saved_bp
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

            "api":
                "/api",

            "health":
                "/api/health",
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
                "1.0.0",

            "realtime":
                True,

            "documents":
                "/api/documents",

            "health":
                "/api/health",
        }), 200

    # =====================================================
    # HEALTH CHECK
    # =====================================================

    @app.route(
        "/api/health",
        methods=[
            "GET",
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
        }), 200

    # =====================================================
    # JWT - MISSING TOKEN
    # =====================================================

    @jwt.unauthorized_loader
    def missing_token_callback(
        reason
    ):

        return jsonify({
            "message":
                "Authentication token is required."
        }), 401

    # =====================================================
    # JWT - INVALID TOKEN
    # =====================================================

    @jwt.invalid_token_loader
    def invalid_token_callback(
        reason
    ):

        return jsonify({
            "message":
                "Invalid authentication token."
        }), 422

    # =====================================================
    # JWT - EXPIRED TOKEN
    # =====================================================

    @jwt.expired_token_loader
    def expired_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({
            "message":
                (
                    "Your session has expired. "
                    "Please log in again."
                )
        }), 401

    # =====================================================
    # JWT - REVOKED TOKEN
    # =====================================================

    @jwt.revoked_token_loader
    def revoked_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({
            "message":
                (
                    "This authentication token "
                    "has been revoked."
                )
        }), 401

    # =====================================================
    # JWT - FRESH TOKEN REQUIRED
    # =====================================================

    @jwt.needs_fresh_token_loader
    def fresh_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({
            "message":
                (
                    "A fresh login is required "
                    "for this action."
                )
        }), 401

    # =====================================================
    # 404
    # =====================================================

    @app.errorhandler(
        404
    )
    def not_found(
        error
    ):

        return jsonify({
            "message":
                "Requested resource was not found."
        }), 404

    # =====================================================
    # 405
    # =====================================================

    @app.errorhandler(
        405
    )
    def method_not_allowed(
        error
    ):

        return jsonify({
            "message":
                "HTTP method not allowed."
        }), 405

    # =====================================================
    # 413
    # =====================================================

    @app.errorhandler(
        413
    )
    def file_too_large(
        error
    ):

        return jsonify({
            "message":
                (
                    "Uploaded file is too large. "
                    "Maximum file size is 10 MB."
                )
        }), 413

    # =====================================================
    # 500
    # =====================================================

    @app.errorhandler(
        500
    )
    def internal_server_error(
        error
    ):

        try:

            db.session.rollback()

        except Exception:

            pass

        app.logger.exception(
            "Internal server error"
        )

        return jsonify({
            "message":
                (
                    "An internal server "
                    "error occurred."
                )
        }), 500

    # =====================================================
    # DEVELOPMENT INFORMATION
    # =====================================================

    if app.debug:

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
# APP INSTANCE
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
        os.getenv(
            "FLASK_DEBUG",
            "true",
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