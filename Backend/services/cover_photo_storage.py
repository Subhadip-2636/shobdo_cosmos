import io

import cloudinary.uploader

from PIL import Image

from services.artwork_storage import (
    ensure_cloudinary_configured,
)


# ============================================================
# COVER PHOTO SETTINGS
# ============================================================

MAX_COVER_PHOTO_SIZE = (
    10 * 1024 * 1024
)


ALLOWED_COVER_PHOTO_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


MIN_COVER_WIDTH = 600
MIN_COVER_HEIGHT = 200

MAX_COVER_DIMENSION = 16000


# ============================================================
# PUBLIC ID
# ============================================================

def get_cover_photo_public_id(
    user_id,
):
    """
    Return the deterministic Cloudinary public ID for a
    SHOBDO user's profile cover.

    Example:

    shobdo/covers/user_12

    Re-uploading a cover for the same user overwrites the
    previous image instead of creating orphaned resources.
    """

    try:

        normalized_user_id = int(
            user_id
        )

    except (
        TypeError,
        ValueError,
    ) as error:

        raise ValueError(
            "Invalid user ID."
        ) from error


    if normalized_user_id <= 0:

        raise ValueError(
            "Invalid user ID."
        )


    return (
        f"shobdo/covers/"
        f"user_{normalized_user_id}"
    )


# ============================================================
# VALIDATE COVER PHOTO
# ============================================================

def validate_cover_photo(
    file_bytes,
    content_type,
):
    """
    Validate an uploaded cover photo before sending it to
    Cloudinary.

    Validation includes:

    - file existence
    - byte data
    - maximum file size
    - supported MIME type
    - actual image verification with Pillow
    - minimum image dimensions
    - maximum image dimensions
    """

    # --------------------------------------------------------
    # EMPTY FILE
    # --------------------------------------------------------

    if not file_bytes:

        raise ValueError(
            "Cover photo is empty."
        )


    # --------------------------------------------------------
    # DATA TYPE
    # --------------------------------------------------------

    if not isinstance(
        file_bytes,
        (
            bytes,
            bytearray,
        ),
    ):

        raise ValueError(
            "Invalid cover photo."
        )


    # --------------------------------------------------------
    # FILE SIZE
    # --------------------------------------------------------

    if (
        len(file_bytes)
        >
        MAX_COVER_PHOTO_SIZE
    ):

        raise ValueError(
            "Cover photo cannot exceed 10 MB."
        )


    # --------------------------------------------------------
    # MIME TYPE
    # --------------------------------------------------------

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
        ALLOWED_COVER_PHOTO_TYPES
    ):

        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP cover photos "
            "are supported."
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


        # Pillow verify() consumes the image object.
        # Open it again to inspect dimensions.

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
            "The selected cover file is not a valid image."
        ) from error


    # --------------------------------------------------------
    # MINIMUM DIMENSIONS
    # --------------------------------------------------------

    if (
        width < MIN_COVER_WIDTH
        or
        height < MIN_COVER_HEIGHT
    ):

        raise ValueError(
            "Cover photo must be at least "
            "600 × 200 pixels."
        )


    # --------------------------------------------------------
    # MAXIMUM DIMENSIONS
    # --------------------------------------------------------

    if (
        width > MAX_COVER_DIMENSION
        or
        height > MAX_COVER_DIMENSION
    ):

        raise ValueError(
            "Cover photo dimensions are too large."
        )


    return {
        "width":
            int(
                width
            ),

        "height":
            int(
                height
            ),

        "content_type":
            normalized_content_type,
    }


# ============================================================
# UPLOAD COVER PHOTO
# ============================================================

def upload_profile_cover(
    user_id,
    file_bytes,
    content_type,
):
    """
    Upload or replace a SHOBDO user's profile cover.

    The image is intentionally NOT forced into a fixed
    crop here.

    The frontend profile banner uses
    cover_photo_position_y to control how the image is
    positioned inside the visible cover area.
    """

    validation = (
        validate_cover_photo(
            file_bytes,
            content_type,
        )
    )


    ensure_cloudinary_configured()


    public_id = (
        get_cover_photo_public_id(
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
                        # Prevent oversized originals while
                        # preserving the uploaded aspect ratio.

                        "width":
                            2400,

                        "height":
                            1600,

                        "crop":
                            "limit",

                        "quality":
                            "auto",
                    }
                ],
            )
        )


    except Exception as error:

        print(
            "PROFILE COVER UPLOAD ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to upload cover photo."
        ) from error


    # --------------------------------------------------------
    # VALIDATE CLOUDINARY RESPONSE
    # --------------------------------------------------------

    if not isinstance(
        result,
        dict,
    ):

        raise RuntimeError(
            "Cloudinary returned an invalid response."
        )


    cover_photo_url = (
        result.get(
            "secure_url"
        )
        or result.get(
            "url"
        )
        or ""
    )


    cover_photo_url = (
        str(
            cover_photo_url
        )
        .strip()
    )


    if not cover_photo_url:

        raise RuntimeError(
            "Cover photo upload succeeded, "
            "but no image URL was returned."
        )


    returned_public_id = (
        str(
            result.get(
                "public_id"
            )
            or public_id
        )
        .strip()
    )


    return {
        "cover_photo_url":
            cover_photo_url,

        "public_id":
            returned_public_id,

        "width":
            int(
                result.get(
                    "width"
                )
                or validation[
                    "width"
                ]
                or 0
            ),

        "height":
            int(
                result.get(
                    "height"
                )
                or validation[
                    "height"
                ]
                or 0
            ),
    }


# ============================================================
# DELETE COVER PHOTO
# ============================================================

def delete_profile_cover(
    user_id=None,
    public_id=None,
):
    """
    Delete a SHOBDO profile cover from Cloudinary.

    public_id may be supplied from the database.

    If it is unavailable, the deterministic public ID is
    generated from user_id.
    """

    normalized_public_id = (
        str(
            public_id or ""
        )
        .strip()
    )


    if not normalized_public_id:

        if user_id is None:

            raise ValueError(
                "User ID or cover photo public ID is required."
            )


        normalized_public_id = (
            get_cover_photo_public_id(
                user_id
            )
        )


    ensure_cloudinary_configured()


    try:

        result = (
            cloudinary.uploader.destroy(
                normalized_public_id,

                resource_type=
                    "image",

                invalidate=
                    True,
            )
        )


        return result


    except Exception as error:

        print(
            "PROFILE COVER DELETE ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to remove cover photo."
        ) from error