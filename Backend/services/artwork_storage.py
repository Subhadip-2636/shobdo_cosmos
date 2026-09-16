import io
import os
import uuid

from urllib.parse import (
    unquote,
    urlparse,
)

from dotenv import load_dotenv

import cloudinary
import cloudinary.uploader


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

def ensure_cloudinary_configured():
    """
    Configure Cloudinary for SHOBDO artwork storage.

    Supported configuration methods:

    OPTION 1
    --------
    CLOUDINARY_URL

    Example:
    cloudinary://API_KEY:API_SECRET@CLOUD_NAME

    OPTION 2
    --------
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
    """

    # =====================================================
    # OPTION 1 - CLOUDINARY_URL
    # =====================================================

    cloudinary_url = (
        os.getenv(
            "CLOUDINARY_URL"
        )
        or ""
    ).strip()


    if cloudinary_url:

        if not cloudinary_url.startswith(
            "cloudinary://"
        ):

            raise RuntimeError(
                "CLOUDINARY_URL has an invalid format. "
                "It must start with 'cloudinary://'."
            )


        try:

            parsed = urlparse(
                cloudinary_url
            )


            cloud_name = (
                parsed.hostname
                or ""
            ).strip()


            api_key = (
                unquote(
                    parsed.username
                    or ""
                )
            ).strip()


            api_secret = (
                unquote(
                    parsed.password
                    or ""
                )
            ).strip()


        except Exception as error:

            raise RuntimeError(
                "Unable to parse CLOUDINARY_URL."
            ) from error


        if not cloud_name:

            raise RuntimeError(
                "Cloudinary cloud name is missing "
                "from CLOUDINARY_URL."
            )


        if not api_key:

            raise RuntimeError(
                "Cloudinary API key is missing "
                "from CLOUDINARY_URL."
            )


        if not api_secret:

            raise RuntimeError(
                "Cloudinary API secret is missing "
                "from CLOUDINARY_URL."
            )


        cloudinary.config(
            cloud_name=
                cloud_name,

            api_key=
                api_key,

            api_secret=
                api_secret,

            secure=True,
        )


        return


    # =====================================================
    # OPTION 2 - INDIVIDUAL CLOUDINARY VARIABLES
    # =====================================================

    cloud_name = (
        os.getenv(
            "CLOUDINARY_CLOUD_NAME"
        )
        or ""
    ).strip()


    api_key = (
        os.getenv(
            "CLOUDINARY_API_KEY"
        )
        or ""
    ).strip()


    api_secret = (
        os.getenv(
            "CLOUDINARY_API_SECRET"
        )
        or ""
    ).strip()


    missing_variables = []


    if not cloud_name:

        missing_variables.append(
            "CLOUDINARY_CLOUD_NAME"
        )


    if not api_key:

        missing_variables.append(
            "CLOUDINARY_API_KEY"
        )


    if not api_secret:

        missing_variables.append(
            "CLOUDINARY_API_SECRET"
        )


    if missing_variables:

        raise RuntimeError(
            "Cloudinary is not configured. "
            "Set CLOUDINARY_URL or configure: "
            + ", ".join(
                missing_variables
            )
        )


    cloudinary.config(
        cloud_name=
            cloud_name,

        api_key=
            api_key,

        api_secret=
            api_secret,

        secure=True,
    )


# =========================================================
# PUBLIC ID GENERATOR
# =========================================================

def generate_artwork_public_id():
    """
    Generate a unique Cloudinary public ID.

    Example:
    shobdo/artworks/7cf6d8a7...
    """

    unique_id = (
        uuid.uuid4().hex
    )


    return (
        f"shobdo/artworks/{unique_id}"
    )


# =========================================================
# UPLOAD ARTWORK
# =========================================================

def upload_artwork(
    file_bytes,
):
    """
    Upload an artwork image to Cloudinary.

    Parameters
    ----------
    file_bytes:
        Raw bytes of the uploaded image.

    Returns
    -------
    dict:
        Normalized Cloudinary metadata required
        by the Artwork model.
    """

    # =====================================================
    # VALIDATE INPUT
    # =====================================================

    if not file_bytes:

        raise ValueError(
            "Artwork data is empty."
        )


    if not isinstance(
        file_bytes,
        (
            bytes,
            bytearray,
        ),
    ):

        raise TypeError(
            "Artwork data must be raw bytes."
        )


    # =====================================================
    # CONFIGURE CLOUDINARY
    # =====================================================

    ensure_cloudinary_configured()


    # =====================================================
    # GENERATE PUBLIC ID
    # =====================================================

    public_id = (
        generate_artwork_public_id()
    )


    # =====================================================
    # CREATE UPLOAD STREAM
    # =====================================================

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


    # =====================================================
    # CLOUDINARY UPLOAD
    # =====================================================

    try:

        result = (
            cloudinary.uploader.upload(
                upload_stream,

                resource_type=
                    "image",

                public_id=
                    public_id,

                overwrite=
                    False,

                unique_filename=
                    False,

                use_filename=
                    False,
            )
        )


    except Exception as error:

        print(
            "CLOUDINARY ARTWORK UPLOAD ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to upload artwork "
            "to Cloudinary."
        ) from error


    # =====================================================
    # VALIDATE CLOUDINARY RESPONSE
    # =====================================================

    if not isinstance(
        result,
        dict,
    ):

        raise RuntimeError(
            "Cloudinary returned an invalid "
            "artwork upload response."
        )


    image_url = (
        result.get(
            "secure_url"
        )
        or result.get(
            "url"
        )
        or ""
    ).strip()


    uploaded_public_id = (
        result.get(
            "public_id"
        )
        or public_id
    )


    uploaded_public_id = (
        str(
            uploaded_public_id
        )
        .strip()
    )


    if not uploaded_public_id:

        raise RuntimeError(
            "Cloudinary upload succeeded "
            "but no public ID was returned."
        )


    if not image_url:

        raise RuntimeError(
            "Cloudinary upload succeeded "
            "but no image URL was returned."
        )


    # =====================================================
    # NORMALIZE METADATA
    # =====================================================

    width = (
        result.get(
            "width"
        )
        or 0
    )


    height = (
        result.get(
            "height"
        )
        or 0
    )


    uploaded_bytes = (
        result.get(
            "bytes"
        )
        or len(
            file_bytes
        )
    )


    image_format = (
        result.get(
            "format"
        )
        or ""
    )


    resource_type = (
        result.get(
            "resource_type"
        )
        or "image"
    )


    try:

        width = int(
            width
        )

    except (
        TypeError,
        ValueError,
    ):

        width = 0


    try:

        height = int(
            height
        )

    except (
        TypeError,
        ValueError,
    ):

        height = 0


    try:

        uploaded_bytes = int(
            uploaded_bytes
        )

    except (
        TypeError,
        ValueError,
    ):

        uploaded_bytes = len(
            file_bytes
        )


    # =====================================================
    # RETURN NORMALIZED DATA
    # =====================================================

    return {

        "public_id":
            uploaded_public_id,

        "image_url":
            image_url,

        "bytes":
            uploaded_bytes,

        "width":
            width,

        "height":
            height,

        "format":
            image_format,

        "resource_type":
            resource_type,
    }


# =========================================================
# DELETE ARTWORK
# =========================================================

def delete_artwork(
    public_id,
):
    """
    Delete an artwork image from Cloudinary.

    public_id must be the same Cloudinary public ID
    stored in Artwork.storage_public_id.
    """

    public_id = (
        str(
            public_id
            or ""
        )
        .strip()
    )


    if not public_id:

        return {
            "result":
                "no_public_id",
        }


    # =====================================================
    # CONFIGURE CLOUDINARY
    # =====================================================

    ensure_cloudinary_configured()


    # =====================================================
    # DELETE
    # =====================================================

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
            "CLOUDINARY ARTWORK DELETE ERROR:",
            repr(
                error
            ),
        )


        raise RuntimeError(
            "Unable to delete artwork "
            "from Cloudinary."
        ) from error