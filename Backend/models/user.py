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
    # A user who registered only through Google or Facebook
    # may initially have no SHOBDO password.
    #
    # Existing email/password accounts continue to work
    # normally.
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
    # google_sub is Google's stable unique account ID.
    #
    # Never use the Google email address as the permanent
    # Google identity key.
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
    # FACEBOOK AUTHENTICATION
    # =====================================================
    #
    # Facebook / Meta returns an app-scoped user ID.
    #
    # That ID is the stable identity we associate with the
    # SHOBDO account.
    #
    # Do not use a Facebook email address as the permanent
    # Facebook identity key.
    #
    # =====================================================

    facebook_user_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True,
        index=True,
    )


    facebook_linked_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
    )


    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================
    #
    # This refers to SHOBDO's knowledge that an email
    # address has been verified.
    #
    # Google can provide an explicit verified-email claim.
    #
    # Facebook does not provide exactly the same verified
    # email claim in the normal profile response, therefore
    # Facebook linking must not automatically mark an email
    # verified unless the backend has another trusted reason
    # to do so.
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

        Social-login-only users may initially have no
        SHOBDO password. They can later create one.
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
        Check a plain-text password against the saved
        password hash.

        Social-login-only accounts safely return False.
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
        Whether this user has a SHOBDO password.
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
        Whether a Google account is linked.
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
        Link a verified Google identity.

        IMPORTANT:
        Only call this after the backend has successfully
        verified Google's ID token.
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


        normalized_avatar = str(
            avatar_url or ""
        ).strip()


        # Keep the user's manually selected SHOBDO avatar.

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
        Remove Google authentication from the account.

        A future API endpoint should prevent unlinking
        when this would leave the user with no valid
        authentication method.
        """

        self.google_sub = (
            None
        )


        self.google_linked_at = (
            None
        )


    # =====================================================
    # FACEBOOK ACCOUNT HELPERS
    # =====================================================

    def has_facebook_account(
        self,
    ):
        """
        Whether a Facebook account is linked.
        """

        return bool(
            self.facebook_user_id
        )


    def link_facebook_account(
        self,
        facebook_user_id,
        *,
        avatar_url=None,
        mark_email_verified=False,
    ):
        """
        Link a verified Facebook / Meta identity.

        IMPORTANT:
        Only call this after the backend has verified the
        Facebook user access token with Meta.

        mark_email_verified defaults to False because
        Facebook's normal profile response should not be
        treated the same as Google's explicit
        `email_verified` claim.
        """

        normalized_user_id = str(
            facebook_user_id or ""
        ).strip()


        if not normalized_user_id:

            raise ValueError(
                "Facebook account identifier is required."
            )


        self.facebook_user_id = (
            normalized_user_id
        )


        if (
            self.facebook_linked_at
            is None
        ):

            self.facebook_linked_at = (
                utc_now()
            )


        if mark_email_verified:

            self.email_verified = (
                True
            )


        normalized_avatar = str(
            avatar_url or ""
        ).strip()


        # Do not overwrite a custom SHOBDO avatar.

        if (
            normalized_avatar
            and
            not self.avatar_url
        ):

            self.avatar_url = (
                normalized_avatar
            )


    def unlink_facebook_account(
        self,
    ):
        """
        Remove Facebook authentication from the account.

        A future account-security endpoint should block
        this operation if Facebook is the user's only
        remaining authentication method.
        """

        self.facebook_user_id = (
            None
        )


        self.facebook_linked_at = (
            None
        )


    # =====================================================
    # EMAIL VERIFICATION HELPERS
    # =====================================================

    def mark_email_verified(
        self,
    ):
        """
        Mark the SHOBDO account email as verified.
        """

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
        Return all authentication methods currently
        connected to the account.

        Examples:

        ["password"]

        ["google"]

        ["facebook"]

        ["password", "google"]

        ["google", "facebook"]

        ["password", "google", "facebook"]
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


        if self.has_facebook_account():

            methods.append(
                "facebook"
            )


        return methods


    def has_any_auth_method(
        self,
    ):
        """
        Whether the account has at least one usable
        authentication method.
        """

        return bool(
            self.get_auth_methods()
        )


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
        - facebook_user_id
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
            # AUTHENTICATION METHODS
            # =============================================

            "has_password":
                self.has_password(),


            "google_connected":
                self.has_google_account(),


            "facebook_connected":
                self.has_facebook_account(),


            "auth_methods":
                self.get_auth_methods(),


            # =============================================
            # GOOGLE
            # =============================================

            "google_linked_at":
                (
                    self.google_linked_at.isoformat()
                    if self.google_linked_at
                    else None
                ),


            # =============================================
            # FACEBOOK
            # =============================================

            "facebook_linked_at":
                (
                    self.facebook_linked_at.isoformat()
                    if self.facebook_linked_at
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
            f"{self.has_google_account()} "
            f"facebook_connected="
            f"{self.has_facebook_account()}>"
        )