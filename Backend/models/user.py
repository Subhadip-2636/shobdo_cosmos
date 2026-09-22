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
    # Users created through social authentication may not
    # initially have a SHOBDO password.
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
    # google_sub is Google's stable account identifier.
    #
    # Never use email as Google's permanent identity key.
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
    # facebook_user_id is Meta's stable app-scoped user ID.
    #
    # Email must not be used as the permanent Facebook
    # identity identifier.
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
    # INSTAGRAM AUTHENTICATION
    # =====================================================
    #
    # instagram_user_id:
    #
    # Stable Instagram Professional account identifier
    # returned by the Instagram API.
    #
    # This is the identity key used by SHOBDO.
    #
    # DO NOT use:
    #
    # - Instagram username
    # - profile name
    # - email
    #
    # as the permanent identity key.
    #
    # Instagram usernames may change.
    #
    # =====================================================

    instagram_user_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True,
        index=True,
    )


    # Instagram username is profile information only.
    #
    # It is intentionally NOT unique because usernames may
    # change and should never be SHOBDO's identity key.

    instagram_username = db.Column(
        db.String(255),
        nullable=True,
        index=True,
    )


    instagram_linked_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=True,
    )


    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================
    #
    # Google can provide an explicit verified-email claim.
    #
    # Facebook and Instagram authentication should NOT
    # automatically mark SHOBDO email as verified unless
    # SHOBDO has another trusted verification mechanism.
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


    # =====================================================
    # COVER PHOTO
    # =====================================================
    #
    # cover_photo_url:
    # Public delivery URL for the user's custom cover.
    #
    # cover_photo_public_id:
    # Internal storage-provider identifier used by the
    # backend when replacing or deleting the cover.
    # It is intentionally NOT exposed by to_dict().
    #
    # cover_photo_position_y:
    # Vertical focal position from 0 to 100.
    #
    # 0   = top
    # 50  = center
    # 100 = bottom
    #
    # =====================================================

    cover_photo_url = db.Column(
        db.String(500),
        nullable=True,
    )


    cover_photo_public_id = db.Column(
        db.String(255),
        nullable=True,
    )


    cover_photo_position_y = db.Column(
        db.Integer,
        nullable=False,
        default=50,
        server_default="50",
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
        Hash and save a SHOBDO password.

        Social-login-only users may initially have no
        SHOBDO password.
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
        Whether the account has a SHOBDO password.
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
        Link a verified Google identity.

        Only call after Google's token has been verified
        by the SHOBDO backend.
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


        # Do not overwrite an existing/custom SHOBDO avatar.

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
        Remove Google authentication.
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
        Whether Facebook authentication is linked.
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

        Only call after Facebook's user access token has
        been verified by the SHOBDO backend.
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
        Remove Facebook authentication.
        """

        self.facebook_user_id = (
            None
        )


        self.facebook_linked_at = (
            None
        )


    # =====================================================
    # INSTAGRAM ACCOUNT HELPERS
    # =====================================================

    def has_instagram_account(
        self,
    ):
        """
        Whether an Instagram account is linked.
        """

        return bool(
            self.instagram_user_id
        )


    def link_instagram_account(
        self,
        instagram_user_id,
        *,
        instagram_username=None,
        avatar_url=None,
    ):
        """
        Link a verified Instagram Professional identity.

        IMPORTANT:

        Only call this after the SHOBDO backend has
        successfully completed Instagram OAuth and verified
        the Instagram account.

        The Instagram user ID is the permanent identity key.

        The username is profile metadata only and may change.
        """

        normalized_user_id = str(
            instagram_user_id or ""
        ).strip()


        if not normalized_user_id:

            raise ValueError(
                "Instagram account identifier is required."
            )


        self.instagram_user_id = (
            normalized_user_id
        )


        # -------------------------------------------------
        # USERNAME
        # -------------------------------------------------

        normalized_username = str(
            instagram_username or ""
        ).strip()


        if normalized_username:

            self.instagram_username = (
                normalized_username
            )


        # -------------------------------------------------
        # LINKED AT
        # -------------------------------------------------

        if (
            self.instagram_linked_at
            is None
        ):

            self.instagram_linked_at = (
                utc_now()
            )


        # -------------------------------------------------
        # PROFILE PICTURE
        # -------------------------------------------------

        normalized_avatar = str(
            avatar_url or ""
        ).strip()


        # Never replace a user-selected SHOBDO avatar.

        if (
            normalized_avatar
            and
            not self.avatar_url
        ):

            self.avatar_url = (
                normalized_avatar
            )


    def update_instagram_profile(
        self,
        *,
        instagram_username=None,
        avatar_url=None,
    ):
        """
        Refresh Instagram profile metadata.

        The Instagram user ID itself is intentionally not
        changed here.
        """

        normalized_username = str(
            instagram_username or ""
        ).strip()


        if normalized_username:

            self.instagram_username = (
                normalized_username
            )


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


    def unlink_instagram_account(
        self,
    ):
        """
        Remove Instagram authentication.

        A future security endpoint should prevent unlinking
        Instagram when it is the user's only authentication
        method.
        """

        self.instagram_user_id = (
            None
        )


        self.instagram_username = (
            None
        )


        self.instagram_linked_at = (
            None
        )


    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================

    def mark_email_verified(
        self,
    ):
        """
        Mark the SHOBDO email as verified.
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
    # COVER PHOTO HELPERS
    # =====================================================

    def has_cover_photo(
        self,
    ):
        """
        Whether the user currently has a custom cover photo.
        """

        return bool(
            self.cover_photo_url
        )


    def set_cover_photo(
        self,
        cover_photo_url,
        *,
        public_id=None,
        position_y=50,
    ):
        """
        Save cover-photo metadata.

        The actual image file is stored by the configured
        media provider. SHOBDO stores only the delivery URL,
        provider identifier, and vertical focal position.
        """

        normalized_url = str(
            cover_photo_url or ""
        ).strip()


        if not normalized_url:

            raise ValueError(
                "Cover photo URL is required."
            )


        normalized_public_id = str(
            public_id or ""
        ).strip()


        try:

            normalized_position_y = int(
                position_y
            )

        except (
            TypeError,
            ValueError,
        ):

            normalized_position_y = 50


        normalized_position_y = max(
            0,
            min(
                100,
                normalized_position_y,
            ),
        )


        self.cover_photo_url = (
            normalized_url
        )


        self.cover_photo_public_id = (
            normalized_public_id
            or None
        )


        self.cover_photo_position_y = (
            normalized_position_y
        )


    def set_cover_photo_position(
        self,
        position_y,
    ):
        """
        Update only the vertical focal position of the cover.
        """

        try:

            normalized_position_y = int(
                position_y
            )

        except (
            TypeError,
            ValueError,
        ):

            raise ValueError(
                "Cover photo position must be a number."
            )


        if not (
            0
            <= normalized_position_y
            <= 100
        ):

            raise ValueError(
                "Cover photo position must be between 0 and 100."
            )


        self.cover_photo_position_y = (
            normalized_position_y
        )


    def clear_cover_photo(
        self,
    ):
        """
        Remove cover-photo metadata from the user profile.

        Deleting the image from the media provider should be
        handled by the backend route/service before or after
        this method is called.
        """

        self.cover_photo_url = (
            None
        )


        self.cover_photo_public_id = (
            None
        )


        self.cover_photo_position_y = (
            50
        )


    # =====================================================
    # PASSWORD RESET
    # =====================================================

    def clear_password_reset_token(
        self,
    ):
        """
        Clear all password-reset information.
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
        Return all currently connected login methods.

        Examples:

        ["password"]

        ["google"]

        ["facebook"]

        ["instagram"]

        ["password", "google", "facebook", "instagram"]
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


        if self.has_instagram_account():

            methods.append(
                "instagram"
            )


        return methods


    def has_any_auth_method(
        self,
    ):
        """
        Whether at least one usable authentication method
        remains on the account.
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
        Safe user information for API responses.

        Sensitive authentication values are NOT returned:

        - password_hash
        - google_sub
        - facebook_user_id
        - instagram_user_id
        - password_reset_token
        - password_reset_expires
        - cover_photo_public_id
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


            "cover_photo_url":
                self.cover_photo_url,


            "cover_photo_position_y":
                int(
                    self.cover_photo_position_y
                    if self.cover_photo_position_y
                    is not None
                    else 50
                ),


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


            "instagram_connected":
                self.has_instagram_account(),


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
            # INSTAGRAM
            # =============================================

            "instagram_username":
                self.instagram_username,


            "instagram_linked_at":
                (
                    self.instagram_linked_at.isoformat()
                    if self.instagram_linked_at
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
            f"{self.has_facebook_account()} "
            f"instagram_connected="
            f"{self.has_instagram_account()}>"
        )