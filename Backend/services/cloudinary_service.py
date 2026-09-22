import os

import cloudinary
import cloudinary.uploader


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

def configure_cloudinary():
    """
    Configure Cloudinary using SHOBDO backend environment
    variables.

    Configuration is performed when an upload/delete action
    is requested instead of during module import. This keeps
    migrations and other CLI operations independent from
    Cloudinary availability.
    """

    cloud_name = str(
        os.getenv(
            "CLOUDINARY_CLOUD_NAME",
            "",
        )
    ).strip()

    api_key = str(
        os.getenv(
            "CLOUDINARY_API_KEY",
            "",
        )
    ).strip()

    api_secret = str(
        os.getenv(
            "CLOUDINARY_API_SECRET",
            "",
        )
    ).strip()


    missing = []


    if not cloud_name:

        missing.append(
            "CLOUDINARY_CLOUD_NAME"
        )


    if not api_key:

        missing.append(
            "CLOUDINARY_API_KEY"
        )


    if not api_secret:

        missing.append(
            "CLOUDINARY_API_SECRET"
        )


    if missing:

        raise RuntimeError(
            "Missing Cloudinary environment variables: "
            + ", ".join(
                missing
            )
        )


    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


# =========================================================
# COVER PHOTO PUBLIC ID
# =========================================================

def get_cover_photo_public_id(
    user_id,
):
    """
    Build a stable Cloudinary public ID for a user's cover.

    Each SHOBDO user has one active cover photo.

    Example:

    shobdo/users/42/cover
    """

    try:

        normalized_user_id = int(
            user_id
        )

    except (
        TypeError,
        ValueError,
    ):

        raise ValueError(
            "A valid user ID is required."
        )


    if normalized_user_id <= 0:

        raise ValueError(
            "A valid user ID is required."
        )


    return (
        f"shobdo/users/"
        f"{normalized_user_id}/cover"
    )


# =========================================================
# UPLOAD COVER PHOTO
# =========================================================

def upload_cover_photo(
    file,
    user_id,
):
    """
    Upload or replace a user's SHOBDO cover photo.

    The same Cloudinary public ID is reused whenever the
    user changes the cover photo.

    Returns normalized metadata required by the User model.
    """

    if file is None:

        raise ValueError(
            "Cover photo file is required."
        )


    public_id = (
        get_cover_photo_public_id(
            user_id
        )
    )


    configure_cloudinary()


    try:

        result = (
            cloudinary.uploader.upload(
                file,
                public_id=public_id,
                resource_type="image",
                overwrite=True,
                invalidate=True,

                # -----------------------------------------
                # IMAGE OPTIMIZATION
                # -----------------------------------------
                #
                # Limit extremely large uploads while
                # preserving the original aspect ratio.
                #
                # -----------------------------------------

                width=2400,
                height=1600,
                crop="limit",

                quality="auto:good",
            )
        )

    except Exception as exc:

        raise RuntimeError(
            "Cloudinary cover photo upload failed."
        ) from exc


    secure_url = str(
        result.get(
            "secure_url",
            "",
        )
    ).strip()


    uploaded_public_id = str(
        result.get(
            "public_id",
            "",
        )
    ).strip()


    if not secure_url:

        raise RuntimeError(
            "Cloudinary did not return a secure image URL."
        )


    if not uploaded_public_id:

        uploaded_public_id = (
            public_id
        )


    return {
        "url":
            secure_url,

        "public_id":
            uploaded_public_id,

        "width":
            result.get(
                "width"
            ),

        "height":
            result.get(
                "height"
            ),

        "format":
            result.get(
                "format"
            ),

        "bytes":
            result.get(
                "bytes"
            ),
    }


# =========================================================
# DELETE COVER PHOTO
# =========================================================

def delete_cover_photo(
    public_id,
):
    """
    Delete a cover photo from Cloudinary.

    Returns True when the resource was deleted or was already
    absent.

    This makes deletion idempotent for SHOBDO.
    """

    normalized_public_id = str(
        public_id or ""
    ).strip()


    if not normalized_public_id:

        return True


    configure_cloudinary()


    try:

        result = (
            cloudinary.uploader.destroy(
                normalized_public_id,
                resource_type="image",
                invalidate=True,
            )
        )

    except Exception as exc:

        raise RuntimeError(
            "Cloudinary cover photo deletion failed."
        ) from exc


    deletion_result = str(
        result.get(
            "result",
            "",
        )
    ).strip().lower()


    return deletion_result in {
        "ok",
        "not found",
    }