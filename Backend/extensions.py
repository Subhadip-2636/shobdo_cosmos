from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy


# =========================================================
# DATABASE
# =========================================================

db = SQLAlchemy()


# =========================================================
# JWT
# =========================================================

jwt = JWTManager()


# =========================================================
# MAIL
# =========================================================

mail = Mail()


# =========================================================
# MIGRATIONS
# =========================================================

migrate = Migrate()


# =========================================================
# SOCKET.IO
# =========================================================

socketio = SocketIO(
    async_mode="threading",
    ping_interval=25,
    ping_timeout=60,
)