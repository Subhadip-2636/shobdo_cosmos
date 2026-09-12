import os

from datetime import timedelta

from dotenv import load_dotenv

from flask import (
    Flask,
    jsonify,
)

from flask_cors import CORS

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
# CREATE APPLICATION
# =========================================================

def create_app():

    app = Flask(__name__)


    # =====================================================
    # DATABASE CONFIG
    # =====================================================

    database_url = os.getenv(
        "DATABASE_URL"
    )

    if not database_url:

        raise RuntimeError(
            "DATABASE_URL is missing from the .env file."
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
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }


    # =====================================================
    # JWT CONFIG
    # =====================================================

    jwt_secret = os.getenv(
        "JWT_SECRET_KEY"
    )

    if not jwt_secret:

        raise RuntimeError(
            "JWT_SECRET_KEY is missing from the .env file."
        )


    app.config[
        "JWT_SECRET_KEY"
    ] = jwt_secret


    app.config[
        "JWT_ACCESS_TOKEN_EXPIRES"
    ] = timedelta(
        hours=24
    )


    # =====================================================
    # MAIL CONFIG
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
            587,
        )
    )


    app.config[
        "MAIL_USE_TLS"
    ] = (
        os.getenv(
            "MAIL_USE_TLS",
            "True",
        )
        .strip()
        .lower()
        == "true"
    )


    app.config[
        "MAIL_USE_SSL"
    ] = (
        os.getenv(
            "MAIL_USE_SSL",
            "False",
        )
        .strip()
        .lower()
        == "true"
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
        "MAIL_DEFAULT_SENDER",
        app.config[
            "MAIL_USERNAME"
        ],
    )


    # =====================================================
    # FRONTEND CONFIG
    # =====================================================

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    frontend_url = (
        frontend_url
        .strip()
        .rstrip("/")
    )


    app.config[
        "FRONTEND_URL"
    ] = frontend_url


    # =====================================================
    # FILE UPLOAD CONFIG
    # =====================================================

    app.config[
        "MAX_CONTENT_LENGTH"
    ] = (
        10
        * 1024
        * 1024
    )


    # =====================================================
    # ALLOWED ORIGINS
    # =====================================================

    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


    # -----------------------------------------------------
    # FRONTEND_URL
    # -----------------------------------------------------

    if (
        frontend_url
        and
        frontend_url not in allowed_origins
    ):

        allowed_origins.append(
            frontend_url
        )


    # -----------------------------------------------------
    # PRODUCTION FRONTEND URL
    # -----------------------------------------------------

    production_frontend_url = os.getenv(
        "PRODUCTION_FRONTEND_URL"
    )


    if production_frontend_url:

        production_frontend_url = (
            production_frontend_url
            .strip()
            .rstrip("/")
        )


        if (
            production_frontend_url
            not in allowed_origins
        ):

            allowed_origins.append(
                production_frontend_url
            )


    # =====================================================
    # INITIALIZE FLASK EXTENSIONS
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
                "origins": allowed_origins,
            },
        },
        supports_credentials=True,
    )


    # =====================================================
    # SOCKET.IO
    # =====================================================

    socketio.init_app(
        app,
        cors_allowed_origins=allowed_origins,
    )


    # =====================================================
    # SOCKET.IO EVENT HANDLERS
    # =====================================================
    #
    # Importing this module registers all @socketio.on(...)
    # handlers.
    #
    # =====================================================

    import socket_handlers


    # =====================================================
    # IMPORT MODELS
    # =====================================================
    #
    # Models must be imported before db.create_all()
    # so SQLAlchemy knows about their tables.
    #
    # =====================================================

    from models.user import User
    from models.writing import Writing
    from models.notification import Notification


    # Keep explicit references to imported models.
    _models = (
        User,
        Writing,
        Notification,
    )


    # Prevent optimization/tools from considering it unused.
    if not _models:

        raise RuntimeError(
            "Unable to load database models."
        )


    # =====================================================
    # REGISTER BLUEPRINTS
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


    # -----------------------------------------------------
    # AUTH
    # -----------------------------------------------------

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth",
    )


    # -----------------------------------------------------
    # WRITINGS
    # -----------------------------------------------------

    app.register_blueprint(
        writings_bp,
        url_prefix="/api/writings",
    )


    # -----------------------------------------------------
    # LIKES
    # -----------------------------------------------------

    app.register_blueprint(
        like_bp,
        url_prefix="/api/likes",
    )


    # -----------------------------------------------------
    # COMMENTS
    # -----------------------------------------------------

    app.register_blueprint(
        comment_bp,
        url_prefix="/api/comments",
    )


    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    app.register_blueprint(
        user_bp
    )


    # -----------------------------------------------------
    # NOTIFICATIONS
    # -----------------------------------------------------

    app.register_blueprint(
        notification_bp
    )


    # =====================================================
    # ROOT API
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

            "socketio":
                "enabled",
        }), 200


    # =====================================================
    # JWT ERROR HANDLERS
    # =====================================================

    @jwt.unauthorized_loader
    def missing_token_callback(
        reason
    ):

        return jsonify({
            "message":
                (
                    "Authentication token "
                    "is required."
                )
        }), 401


    @jwt.invalid_token_loader
    def invalid_token_callback(
        reason
    ):

        return jsonify({
            "message":
                (
                    "Invalid authentication "
                    "token."
                )
        }), 422


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
                (
                    "Requested resource "
                    "was not found."
                )
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
                (
                    "HTTP method "
                    "not allowed."
                )
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
                    "Maximum allowed size is 10 MB."
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

        db.session.rollback()


        print(
            "Internal server error:"
        )

        print(
            error
        )


        return jsonify({
            "message":
                (
                    "An internal server "
                    "error occurred."
                )
        }), 500


    # =====================================================
    # DATABASE CHECK
    # =====================================================

    with app.app_context():

        try:

            db.create_all()


            print(
                "SHOBDO database tables "
                "checked successfully."
            )

        except Exception as error:

            print(
                "Database initialization error:"
            )

            print(
                error
            )


    # =====================================================
    # DEVELOPMENT INFORMATION
    # =====================================================

    if app.debug:

        print(
            "Allowed frontend origins:"
        )

        for origin in allowed_origins:

            print(
                f" - {origin}"
            )


    # =====================================================
    # RETURN APP
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

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True,
    )
