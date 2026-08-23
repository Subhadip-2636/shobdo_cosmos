import os

from flask import Flask, app, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from database import db


load_dotenv()

jwt = JWTManager()


def create_app():

    app = Flask(__name__)

    # =====================================================
    # DATABASE CONFIG
    # =====================================================

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")


    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # =====================================================
    # JWT CONFIG
    # =====================================================

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    # =====================================================
    # INITIALIZE EXTENSIONS
    # =====================================================

    db.init_app(app)
    jwt.init_app(app)

    # =====================================================
    # CORS
    # =====================================================

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                ]
            }
        }
    )

    # =====================================================
    # IMPORT MODELS
    # =====================================================

    from models import User, Writing

    # =====================================================
    # IMPORT ROUTES
    # =====================================================

    from routes.auth_routes import auth_bp
    from routes.writing_routes import writings_bp

    # =====================================================
    # REGISTER BLUEPRINTS
    # =====================================================

    app.register_blueprint(auth_bp)
    app.register_blueprint(writings_bp)

    # =====================================================
    # ROOT ROUTE
    # =====================================================

    @app.route("/", methods=["GET"])
    def home():

        return jsonify({
            "message": "SHOBDO Backend API is running"
        }), 200

    # =====================================================
    # HEALTH CHECK
    # =====================================================

    @app.route("/api/health", methods=["GET"])
    def health():

        return jsonify({
            "status": "ok",
            "message": "SHOBDO backend is running"
        }), 200

    # =====================================================
    # CREATE DATABASE TABLES
    # =====================================================

    with app.app_context():

        db.create_all()

        print("Database tables checked successfully.")

    return app


# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":

    app = create_app()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )