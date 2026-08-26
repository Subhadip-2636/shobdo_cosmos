from flask_jwt_extended import JWTManager
from flask_mail import Mail

from database import db


# =========================================================
# SHARED FLASK EXTENSIONS
# =========================================================

jwt = JWTManager()

mail = Mail()


# =========================================================
# EXPORTS
# =========================================================

__all__ = [
    "db",
    "jwt",
    "mail",
]