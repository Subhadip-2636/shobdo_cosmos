import io
import os
import uuid

from dotenv import load_dotenv

import cloudinary
import cloudinary.uploader
import cloudinary.utils


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

def ensure_cloudinary_configured():

    cloudinary_url = (
        os.getenv(
            "CLOUDINARY_URL"
        )
        or ""
    ).strip()

    if not cloudinary_url:

        raise RuntimeError(
            "CLOUDINARY_URL is not configured "
            "in the Backend .env file."
        )

    if not cloudinary_url.startswith(
        "cloudinary://"
    ):

        raise RuntimeError(
            "CLOUDINARY_URL has an invalid format."
        )

    cloudinary.config(
        secure=True
    )


# =========================================================
# DOCUMENT PUBLIC ID
# =========================================================

def generate_document_public_id():

    unique_id = uuid.uuid4().hex

    return (
        "shobdo/documents/"
        f"{unique_id}"
    )


# =========================================================
# UPLOAD PDF
# =========================================================

def upload_pdf(
    file_bytes
):

    if not file_bytes:

        raise ValueError(
            "PDF data is empty."
        )

    ensure_cloudinary_configured()

    public_id = (
        generate_document_public_id()
    )

    try:

        upload_result = (
            cloudinary.uploader.upload(
                io.BytesIO(
                    file_bytes
                ),

                resource_type="image",

                public_id=
                    public_id,

                format="pdf",

                overwrite=False,

                unique_filename=False,
            )
        )

    except Exception as error:

        raise RuntimeError(
            "Unable to upload PDF "
            "to Cloudinary."
        ) from error


    file_url = (
        upload_result.get(
            "secure_url"
        )
    )

    if not file_url:

        raise RuntimeError(
            "Cloudinary upload succeeded "
            "but no secure URL was returned."
        )


    # =====================================================
    # FIRST PAGE THUMBNAIL
    # =====================================================

    thumbnail_url, _ = (
        cloudinary.utils.cloudinary_url(
            public_id,

            resource_type="image",

            format="jpg",

            secure=True,

            transformation=[
                {
                    "page": 1,
                    "width": 700,
                    "crop": "limit",
                    "quality": "auto",
                }
            ],
        )
    )


    return {
        "public_id":
            public_id,

        "file_url":
            file_url,

        "thumbnail_url":
            thumbnail_url,

        "bytes":
            upload_result.get(
                "bytes"
            ),

        "format":
            upload_result.get(
                "format"
            ),
    }


# =========================================================
# DELETE PDF
# =========================================================

def delete_pdf(
    public_id
):

    if not public_id:

        return {
            "result":
                "no_public_id"
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
            "Unable to delete PDF "
            "from Cloudinary."
        ) from error