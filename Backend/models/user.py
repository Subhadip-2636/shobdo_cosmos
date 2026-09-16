from datetime import (
    datetime,
    timezone,
)

from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from database import db


# =========================================================
# TIME HELPER
# =========================================================

def utc_now():
    """
    Return the current timezone-aware UTC datetime.
    """

    return datetime.now(
        timezone.utc
    )


# =========================================================
# USER MODEL
# =========================================================

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
        db.String(120),
        nullable=False,
    )


    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True,
    )


    # =====================================================
    # PASSWORD AUTHENTICATION
    # =====================================================
    #
    # nullable=True is intentional.
    #
    # A Google-only account may not have a SHOBDO password.
    #
    # Existing email/password accounts continue to store
    # their normal Werkzeug password hash.
    #
    # =====================================================

    password_hash = db.Column(
        db.String(255),
        nullable=True,
    )


    # =====================================================
    # GOOGLE AUTHENTICATION
    # =====================================================
    #
    # google_sub:
    #
    # Google's stable unique identifier for the account.
    #
    # Never use the email address as Google's permanent
    # identity key.
    #
    # Existing SHOBDO accounts can later be linked to
    # Google by storing the verified Google "sub" here.
    #
    # =====================================================

    google_sub = db.Column(
        db.String(255),
        unique=True,
        nullable=True,
        index=True,
    )


    google_linked_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
    )


    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================
    #
    # Password-created accounts can remain False until
    # SHOBDO email verification is implemented.
    #
    # A verified Google identity can set this to True.
    #
    # =====================================================

    email_verified = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )


    # =====================================================
    # LAST LOGIN
    # =====================================================

    last_login_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
    )


    # =====================================================
    # PUBLIC PROFILE
    # =====================================================

    username = db.Column(
        db.String(50),
        unique=True,
        nullable=True,
        index=True,
    )


    bio = db.Column(
        db.Text,
        nullable=True,
    )


    avatar_url = db.Column(
        db.String(500),
        nullable=True,
    )


    location = db.Column(
        db.String(100),
        nullable=True,
    )


    website = db.Column(
        db.String(255),
        nullable=True,
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
        db.DateTime(
            timezone=True
        ),
        nullable=True,
    )


    # =====================================================
    # ACCOUNT STATUS
    # =====================================================

    is_active = db.Column(
        db.Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )


    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        default=utc_now,
        nullable=False,
    )


    updated_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        default=utc_now,
        onupdate=utc_now,
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

    def set_password(
        self,
        password,
    ):
        """
        Hash and store a SHOBDO password.

        Google-only accounts may initially have no
        password. If they later create one, this method
        can be used normally.
        """

        if (
            not isinstance(
                password,
                str,
            )
            or
            not password
        ):

            raise ValueError(
                "Password cannot be empty."
            )


        self.password_hash = (
            generate_password_hash(
                password
            )
        )


    def check_password(
        self,
        password,
    ):
        """
        Check a plain-text password.

        Google-only users have password_hash=None,
        so password login must fail safely rather than
        raising an exception.
        """

        if (
            not self.password_hash
            or
            not isinstance(
                password,
                str,
            )
            or
            not password
        ):

            return False


        try:

            return check_password_hash(
                self.password_hash,
                password,
            )


        except (
            TypeError,
            ValueError,
        ):

            return False


    def has_password(
        self,
    ):
        """
        Whether this user currently has a SHOBDO password.
        """

        return bool(
            self.password_hash
        )


    # =====================================================
    # GOOGLE ACCOUNT HELPERS
    # =====================================================

    def has_google_account(
        self,
    ):
        """
        Whether Google authentication is linked.
        """

        return bool(
            self.google_sub
        )


    def link_google_account(
        self,
        google_sub,
        *,
        email_verified=True,
        avatar_url=None,
    ):
        """
        Link a verified Google identity to this user.

        IMPORTANT:
        Only call this after Google's ID token has been
        successfully verified by the backend.
        """

        normalized_sub = str(
            google_sub or ""
        ).strip()


        if not normalized_sub:

            raise ValueError(
                "Google account identifier is required."
            )


        self.google_sub = (
            normalized_sub
        )


        if (
            self.google_linked_at
            is None
        ):

            self.google_linked_at = (
                utc_now()
            )


        if email_verified:

            self.email_verified = (
                True
            )


        # Only use Google's profile photo automatically
        # when the user does not already have a SHOBDO
        # profile picture.

        normalized_avatar = str(
            avatar_url or ""
        ).strip()


        if (
            normalized_avatar
            and
            not self.avatar_url
        ):

            self.avatar_url = (
                normalized_avatar
            )


    def unlink_google_account(
        self,
    ):
        """
        Remove Google login from the account.

        This should only be allowed by a future API route
        when the account still has another valid sign-in
        method, such as a SHOBDO password.
        """

        self.google_sub = (
            None
        )


        self.google_linked_at = (
            None
        )


    # =====================================================
    # EMAIL VERIFICATION HELPERS
    # =====================================================

    def mark_email_verified(
        self,
    ):

        self.email_verified = (
            True
        )


    # =====================================================
    # LOGIN ACTIVITY
    # =====================================================

    def mark_login(
        self,
    ):
        """
        Record the most recent successful login.
        """

        self.last_login_at = (
            utc_now()
        )


    # =====================================================
    # PASSWORD RESET HELPERS
    # =====================================================

    def clear_password_reset_token(
        self,
    ):
        """
        Remove password reset token information.
        """

        self.password_reset_token = (
            None
        )


        self.password_reset_expires = (
            None
        )


    # =====================================================
    # AUTHENTICATION INFORMATION
    # =====================================================

    def get_auth_methods(
        self,
    ):
        """
        Return the sign-in methods currently available
        for this account.

        Examples:

        ["password"]

        ["google"]

        ["password", "google"]
        """

        methods = []


        if self.has_password():

            methods.append(
                "password"
            )


        if self.has_google_account():

            methods.append(
                "google"
            )


        return methods


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(
        self,
    ):
        """
        Safe user data for authenticated API responses.

        Sensitive authentication values are intentionally
        excluded:

        - password_hash
        - google_sub
        - password_reset_token
        - password_reset_expires
        """

        return {

            # =============================================
            # BASIC
            # =============================================

            "id":
                self.id,


            "name":
                self.name,


            "email":
                self.email,


            # =============================================
            # PUBLIC PROFILE
            # =============================================

            "username":
                self.username,


            "bio":
                self.bio,


            "avatar_url":
                self.avatar_url,


            "location":
                self.location,


            "website":
                self.website,


            # =============================================
            # ACCOUNT
            # =============================================

            "is_active":
                bool(
                    self.is_active
                ),


            "email_verified":
                bool(
                    self.email_verified
                ),


            # =============================================
            # AUTH METHODS
            # =============================================

            "has_password":
                self.has_password(),


            "google_connected":
                self.has_google_account(),


            "auth_methods":
                self.get_auth_methods(),


            # =============================================
            # GOOGLE LINK DATE
            # =============================================

            "google_linked_at":
                (
                    self.google_linked_at.isoformat()
                    if self.google_linked_at
                    else None
                ),


            # =============================================
            # LOGIN ACTIVITY
            # =============================================

            "last_login_at":
                (
                    self.last_login_at.isoformat()
                    if self.last_login_at
                    else None
                ),


            # =============================================
            # TIMESTAMPS
            # =============================================

            "created_at":
                (
                    self.created_at.isoformat()
                    if self.created_at
                    else None
                ),


            "updated_at":
                (
                    self.updated_at.isoformat()
                    if self.updated_at
                    else None
                ),
        }


    # =====================================================
    # DEBUG REPRESENTATION
    # =====================================================

    def __repr__(
        self,
    ):

        return (
            f"<User "
            f"id={self.id} "
            f"email={self.email!r} "
            f"google_connected="
            f"{self.has_google_account()}>"
        )