import os

from flask import (
    Flask,
    jsonify,
)

from flask_cors import CORS
from dotenv import load_dotenv

from extensions import (
    db,
    jwt,
    mail,
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


    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
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


    # 24 hours
    app.config[
        "JWT_ACCESS_TOKEN_EXPIRES"
    ] = 60 * 60 * 24


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
        ).lower()
        == "true"
    )


    app.config[
        "MAIL_USE_SSL"
    ] = (
        os.getenv(
            "MAIL_USE_SSL",
            "False",
        ).lower()
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

    app.config[
        "FRONTEND_URL"
    ] = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )


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
    # INITIALIZE EXTENSIONS
    # =====================================================

    db.init_app(
        app
    )

    jwt.init_app(
        app
    )

    mail.init_app(
        app
    )


    # =====================================================
    # CORS
    # =====================================================

    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


    production_frontend_url = (
        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        )
    )


    if production_frontend_url:

        allowed_origins.append(
            production_frontend_url
        )


    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": (
                    allowed_origins
                )
            }
        },
        supports_credentials=True,
    )


    # =====================================================
    # IMPORT MODELS
    # =====================================================

    from models.user import User
    from models.writing import Writing


    # =====================================================
    # REGISTER BLUEPRINTS
    # =====================================================

    from routes.auth_routes import (
        auth_bp,
    )

    from routes.writing_routes import (
        writings_bp,
    )
    from routes.like_routes import like_bp
    from routes.comment_routes import comment_bp
    from routes.user_routes import user_bp


    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth",
    )


    app.register_blueprint(
        writings_bp,
        url_prefix="/api/writings",
    )

    app.register_blueprint(
        like_bp,
        url_prefix="/api/likes",
    )

    app.register_blueprint(
        comment_bp,
        url_prefix="/api/comments",
    )

    app.register_blueprint(user_bp)

    
    # =====================================================
    # ROOT API
    # =====================================================

    @app.route(
        "/api",
        methods=["GET"],
    )
    def api_root():

        return jsonify({
            "name": "SHOBDO API",
            "status": "running",
            "version": "1.0.0",
        }), 200


    # =====================================================
    # HEALTH CHECK
    # =====================================================

    @app.route(
        "/api/health",
        methods=["GET"],
    )
    def health():

        return jsonify({
            "status": "ok",
            "service": "SHOBDO Backend",
        }), 200


    # =====================================================
    # JWT ERROR HANDLERS
    # =====================================================

    @jwt.unauthorized_loader
    def missing_token_callback(
        reason
    ):

        return jsonify({
            "message": (
                "Authentication token is required."
            )
        }), 401


    @jwt.invalid_token_loader
    def invalid_token_callback(
        reason
    ):

        return jsonify({
            "message": (
                "Invalid authentication token."
            )
        }), 422


    @jwt.expired_token_loader
    def expired_token_callback(
        jwt_header,
        jwt_payload,
    ):

        return jsonify({
            "message": (
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
            "message": (
                "Requested resource was not found."
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
            "message": (
                "HTTP method not allowed."
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
            "message": (
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

        return jsonify({
            "message": (
                "An internal server error occurred."
            )
        }), 500


    # =====================================================
    # DATABASE CHECK
    # =====================================================

    with app.app_context():

        try:

            db.create_all()

            print(
                "SHOBDO database tables checked successfully."
            )

        except Exception as error:

            print(
                "Database initialization error:"
            )

            print(
                error
            )


    return app


# =========================================================
# APP INSTANCE
# =========================================================

app = create_app()


# =========================================================
# DEVELOPMENT SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )