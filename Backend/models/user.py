from datetime import datetime

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from database import db


class User(db.Model):

    __tablename__ = "users"

    # =====================================================
    # BASIC USER INFORMATION
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    name = db.Column(
        db.String(100),
        nullable=False,
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False,
    )


    # =====================================================
    # PASSWORD RESET
    # =====================================================

    password_reset_token = db.Column(
        db.String(128),
        nullable=True,
        index=True,
    )

    password_reset_expires = db.Column(
        db.DateTime,
        nullable=True,
    )


    # =====================================================
    # ACCOUNT STATUS
    # =====================================================

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
    )


    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    writings = db.relationship(
        "Writing",
        back_populates="author",
        cascade="all, delete-orphan",
        lazy=True,
    )


    # =====================================================
    # PASSWORD METHODS
    # =====================================================

    def set_password(self, password):
        """
        Hash and store a user's password.
        """

        self.password_hash = (
            generate_password_hash(
                password
            )
        )


    def check_password(self, password):
        """
        Check a plain-text password against
        the stored password hash.
        """

        return check_password_hash(
            self.password_hash,
            password,
        )


    # =====================================================
    # PASSWORD RESET HELPERS
    # =====================================================

    def clear_password_reset_token(self):
        """
        Remove password reset token information.
        """

        self.password_reset_token = None

        self.password_reset_expires = None


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):
        """
        Safe user data for API responses.

        Password hashes and reset tokens are
        intentionally excluded.
        """

        return {
            "id": self.id,

            "name": self.name,

            "email": self.email,

            "is_active": self.is_active,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),

            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }


    # =====================================================
    # DEBUG REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<User "
            f"id={self.id} "
            f"email={self.email}>"
        )