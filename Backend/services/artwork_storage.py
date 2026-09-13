import io
import os
import uuid

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
    Validate that CLOUDINARY_URL exists and configure
    Cloudinary for secure HTTPS delivery.
    """

    cloudinary_url = (
        os.getenv("CLOUDINARY_URL")
        or ""
    ).strip()

    if not cloudinary_url:
        raise RuntimeError(
            "CLOUDINARY_URL is not configured."
        )

    if not cloudinary_url.startswith(
        "cloudinary://"
    ):
        raise RuntimeError(
            "CLOUDINARY_URL has an invalid format. "
            "It must start with 'cloudinary://'."
        )

    cloudinary.config(
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

    unique_id = uuid.uuid4().hex

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
    dict
        Cloudinary metadata required by the Artwork model.
    """

    if not file_bytes:
        raise ValueError(
            "Artwork data is empty."
        )

    ensure_cloudinary_configured()

    public_id = (
        generate_artwork_public_id()
    )

    try:
        result = (
            cloudinary.uploader.upload(
                io.BytesIO(
                    file_bytes
                ),
                resource_type="image",
                public_id=public_id,
                overwrite=False,
                unique_filename=False,
            )
        )

    except Exception as error:
        raise RuntimeError(
            "Unable to upload artwork "
            "to Cloudinary."
        ) from error


    # =====================================================
    # VALIDATE CLOUDINARY RESPONSE
    # =====================================================

    image_url = (
        result.get(
            "secure_url"
        )
    )

    if not image_url:
        raise RuntimeError(
            "Cloudinary upload succeeded "
            "but no secure URL was returned."
        )


    uploaded_public_id = (
        result.get(
            "public_id"
        )
        or public_id
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
            result.get(
                "bytes"
            )
            or len(
                file_bytes
            ),

        "width":
            result.get(
                "width"
            )
            or 0,

        "height":
            result.get(
                "height"
            )
            or 0,

        "format":
            result.get(
                "format"
            ),

        "resource_type":
            result.get(
                "resource_type"
            )
            or "image",
    }


# =========================================================
# DELETE ARTWORK
# =========================================================

def delete_artwork(
    public_id,
):
    """
    Delete an artwork from Cloudinary.

    The public_id must be the actual Cloudinary
    public ID stored in Artwork.storage_public_id.
    """

    public_id = (
        public_id
        or ""
    ).strip()

    if not public_id:
        return {
            "result":
                "no_public_id",
        }

    ensure_cloudinary_configured()

    try:
        result = (
            cloudinary.uploader.destroy(
                public_id,
                resource_type="image",
                invalidate=True,
            )
        )

        return result

    except Exception as error:
        raise RuntimeError(
            "Unable to delete artwork "
            "from Cloudinary."
        ) from error