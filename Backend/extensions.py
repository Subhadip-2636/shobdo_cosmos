from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate

from database import db


# =========================================================
# SHARED FLASK EXTENSIONS
# =========================================================

jwt = JWTManager()

mail = Mail()

migrate = Migrate()


# =========================================================
# EXPORTS
# =========================================================

__all__ = [
    "db",
    "jwt",
    "mail",
    "migrate",
]