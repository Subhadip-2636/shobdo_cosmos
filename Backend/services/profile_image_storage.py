import io

import cloudinary.uploader

from PIL import Image

from services.artwork_storage import (
    ensure_cloudinary_configured,
)


# ============================================================
# PROFILE IMAGE SETTINGS
# ============================================================

MAX_AVATAR_SIZE = (
    5 * 1024 * 1024
)

ALLOWED_AVATAR_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


# ============================================================
# PUBLIC ID
# ============================================================

def get_avatar_public_id(
    user_id,
):
    """
    Every SHOBDO user gets one deterministic
    Cloudinary avatar location.

    Example:
    shobdo/avatars/user_12

    Uploading a new avatar overwrites the
    previous image instead of creating
    orphaned files.
    """

    try:

        user_id = int(
            user_id
        )

    except (
        TypeError,
        ValueError,
    ) as error:

        raise ValueError(
            "Invalid user ID."
        ) from error


    if user_id <= 0:

        raise ValueError(
            "Invalid user ID."
        )


    return (
        f"shobdo/avatars/user_{user_id}"
    )


# ============================================================
# VALIDATE AVATAR
# ============================================================

def validate_avatar(
    file_bytes,
    content_type,
):

    if not file_bytes:

        raise ValueError(
            "Profile image is empty."
        )


    if not isinstance(
        file_bytes,
        (
            bytes,
            bytearray,
        ),
    ):

        raise ValueError(
            "Invalid profile image."
        )


    if (
        len(file_bytes)
        >
        MAX_AVATAR_SIZE
    ):

        raise ValueError(
            "Profile image cannot exceed 5 MB."
        )


    normalized_content_type = (
        str(
            content_type or ""
        )
        .lower()
        .strip()
    )


    if (
        normalized_content_type
        not in
        ALLOWED_AVATAR_TYPES
    ):

        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP images are supported."
        )


    # --------------------------------------------------------
    # VERIFY ACTUAL IMAGE CONTENT
    # --------------------------------------------------------

    try:

        image_stream = (
            io.BytesIO(
                bytes(
                    file_bytes
                )
            )
        )


        with Image.open(
            image_stream
        ) as image:

            image.verify()


        # Open again because verify()
        # invalidates the first image object.

        image_stream.seek(
            0
        )


        with Image.open(
            image_stream
        ) as image:

            width, height = (
                image.size
            )


    except Exception as error:

        raise ValueError(
            "The selected file is not a valid image."
        ) from error


    if (
        width < 64
        or height < 64
    ):

        raise ValueError(
            "Profile image must be at least 64 × 64 pixels."
        )


    if (
        width > 12000
        or height > 12000
    ):

        raise ValueError(
            "Profile image dimensions are too large."
        )


# ============================================================
# UPLOAD PROFILE IMAGE
# ============================================================

def upload_profile_avatar(
    user_id,
    file_bytes,
    content_type,
):

    validate_avatar(
        file_bytes,
        content_type,
    )


    ensure_cloudinary_configured()


    public_id = (
        get_avatar_public_id(
            user_id
        )
    )


    upload_stream = (
        io.BytesIO(
            bytes(
                file_bytes
            )
        )
    )


    upload_stream.seek(
        0
    )


    try:

        result = (
            cloudinary.uploader.upload(
                upload_stream,

                resource_type=
                    "image",

                public_id=
                    public_id,

                overwrite=
                    True,

                invalidate=
                    True,

                unique_filename=
                    False,

                use_filename=
                    False,

                transformation=[
                    {
                        "width":
                            512,

                        "height":
                            512,

                        "crop":
                            "fill",

                        "gravity":
                            "auto",

                        "quality":
                            "auto",
                    }
                ],
            )
        )


    except Exception as error:

        print(
            "PROFILE AVATAR UPLOAD ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to upload profile image."
        ) from error


    if not isinstance(
        result,
        dict,
    ):

        raise RuntimeError(
            "Cloudinary returned an invalid response."
        )


    avatar_url = (
        result.get(
            "secure_url"
        )
        or result.get(
            "url"
        )
        or ""
    )


    avatar_url = (
        str(
            avatar_url
        )
        .strip()
    )


    if not avatar_url:

        raise RuntimeError(
            "Profile image upload succeeded, but no URL was returned."
        )


    return {
        "avatar_url":
            avatar_url,

        "public_id":
            str(
                result.get(
                    "public_id"
                )
                or public_id
            ),

        "width":
            int(
                result.get(
                    "width"
                )
                or 0
            ),

        "height":
            int(
                result.get(
                    "height"
                )
                or 0
            ),
    }


# ============================================================
# DELETE PROFILE IMAGE
# ============================================================

def delete_profile_avatar(
    user_id,
):

    ensure_cloudinary_configured()


    public_id = (
        get_avatar_public_id(
            user_id
        )
    )


    try:

        result = (
            cloudinary.uploader.destroy(
                public_id,

                resource_type=
                    "image",

                invalidate=
                    True,
            )
        )


        return result


    except Exception as error:

        print(
            "PROFILE AVATAR DELETE ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to remove profile image."
        ) from error