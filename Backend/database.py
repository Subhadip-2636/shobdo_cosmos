# =========================================================
# SHOBDO - DATABASE CONFIGURATION
# =========================================================

from flask_sqlalchemy import SQLAlchemy


# =========================================================
# CREATE SQLALCHEMY INSTANCE
# =========================================================
#
# We do NOT connect to PostgreSQL here.
#
# app.py will provide:
#
# app.config["SQLALCHEMY_DATABASE_URI"]
#
# and then initialize this database using:
#
# db.init_app(app)
#
# Keeping db here prevents circular imports between:
#
# app.py
# models.py
# auth_routes.py
# writing_routes.py
#
# =========================================================

db = SQLAlchemy()