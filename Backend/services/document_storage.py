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
import cloudinary.utils


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# CONSTANTS
# =========================================================

DOCUMENT_FOLDER = (
    "shobdo/documents"
)

MAX_PDF_SIZE = (
    10 * 1024 * 1024
)


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================


def ensure_cloudinary_configured():
    """
    Configure Cloudinary.

    Supported configuration methods:

    1. CLOUDINARY_URL
       cloudinary://API_KEY:API_SECRET@CLOUD_NAME

    OR

    2. CLOUDINARY_CLOUD_NAME
       CLOUDINARY_API_KEY
       CLOUDINARY_API_SECRET
    """

    cloudinary_url = (
        os.getenv(
            "CLOUDINARY_URL"
        )
        or ""
    ).strip()


    # =====================================================
    # OPTION 1 — CLOUDINARY_URL
    # =====================================================

    if cloudinary_url:

        if not cloudinary_url.startswith(
            "cloudinary://"
        ):

            raise RuntimeError(
                (
                    "CLOUDINARY_URL has an invalid "
                    "format. It must begin with "
                    "'cloudinary://'."
                )
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
                (
                    "Unable to parse "
                    "CLOUDINARY_URL."
                )
            ) from error


        if not cloud_name:

            raise RuntimeError(
                (
                    "Cloudinary cloud name is "
                    "missing from CLOUDINARY_URL."
                )
            )


        if not api_key:

            raise RuntimeError(
                (
                    "Cloudinary API key is "
                    "missing from CLOUDINARY_URL."
                )
            )


        if not api_secret:

            raise RuntimeError(
                (
                    "Cloudinary API secret is "
                    "missing from CLOUDINARY_URL."
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


        return {
            "cloud_name":
                cloud_name,

            "configured":
                True,
        }


    # =====================================================
    # OPTION 2 — INDIVIDUAL VARIABLES
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


    if not (
        cloud_name
        and
        api_key
        and
        api_secret
    ):

        raise RuntimeError(
            (
                "Cloudinary is not configured. "
                "Set CLOUDINARY_URL or set "
                "CLOUDINARY_CLOUD_NAME, "
                "CLOUDINARY_API_KEY and "
                "CLOUDINARY_API_SECRET."
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


    return {
        "cloud_name":
            cloud_name,

        "configured":
            True,
    }


# =========================================================
# GENERATE DOCUMENT PUBLIC ID
# =========================================================


def generate_document_public_id():
    """
    Generate a unique Cloudinary public ID.

    Example:

    shobdo/documents/
    3c8c77e46a664c56b19a75ba01f2e813
    """

    unique_id = (
        uuid.uuid4().hex
    )


    return (
        f"{DOCUMENT_FOLDER}/"
        f"{unique_id}"
    )


# =========================================================
# VALIDATE PDF BYTES
# =========================================================


def validate_pdf_bytes(
    file_bytes
):
    """
    Basic storage-level validation.

    Full page/PDF validation is handled by
    document_routes.py using PyMuPDF.
    """

    if not file_bytes:

        raise ValueError(
            "PDF data is empty."
        )


    if not isinstance(
        file_bytes,
        (
            bytes,
            bytearray,
        ),
    ):

        raise TypeError(
            (
                "PDF data must be "
                "bytes."
            )
        )


    if (
        len(file_bytes) >
        MAX_PDF_SIZE
    ):

        raise ValueError(
            "PDF size cannot exceed 10 MB."
        )


    if not file_bytes.startswith(
        b"%PDF-"
    ):

        raise ValueError(
            (
                "The provided data is "
                "not a valid PDF."
            )
        )


# =========================================================
# CREATE PDF THUMBNAIL URL
# =========================================================


def build_thumbnail_url(
    public_id
):
    """
    Build a Cloudinary URL for page 1
    of the PDF as a JPG preview.
    """

    if not public_id:

        return None


    try:

        thumbnail_url, _ = (
            cloudinary.utils.cloudinary_url(

                public_id,

                resource_type=
                    "image",

                type=
                    "upload",

                format=
                    "jpg",

                secure=
                    True,

                transformation=[
                    {
                        "page":
                            1,

                        "width":
                            700,

                        "height":
                            900,

                        "crop":
                            "limit",

                        "quality":
                            "auto",

                        "fetch_format":
                            "auto",
                    }
                ],
            )
        )


        return (
            thumbnail_url
            or None
        )


    except Exception as error:

        # Thumbnail failure should NOT cause
        # the actual PDF upload to fail.

        print(
            "DOCUMENT THUMBNAIL ERROR:",
            error,
        )


        return None


# =========================================================
# UPLOAD PDF
# =========================================================


def upload_pdf(
    file_bytes
):
    """
    Upload PDF to Cloudinary.

    PDFs are uploaded using resource_type='image'
    because Cloudinary treats PDF documents as an
    image resource when PDF transformations and
    page previews are required.

    Returns:

    {
        public_id,
        file_url,
        thumbnail_url,
        bytes,
        format,
        resource_type,
        version
    }
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    validate_pdf_bytes(
        file_bytes
    )


    # =====================================================
    # CONFIGURE CLOUDINARY
    # =====================================================

    ensure_cloudinary_configured()


    # =====================================================
    # PUBLIC ID
    # =====================================================

    public_id = (
        generate_document_public_id()
    )


    # =====================================================
    # CREATE FILE OBJECT
    # =====================================================

    pdf_stream = io.BytesIO(
        file_bytes
    )


    pdf_stream.seek(
        0
    )


    # =====================================================
    # CLOUDINARY UPLOAD
    # =====================================================

    try:

        upload_result = (
            cloudinary.uploader.upload(

                pdf_stream,

                resource_type=
                    "image",

                type=
                    "upload",

                public_id=
                    public_id,

                format=
                    "pdf",

                overwrite=
                    False,

                unique_filename=
                    False,

                use_filename=
                    False,

                invalidate=
                    True,
            )
        )


    except Exception as error:

        print(
            "CLOUDINARY PDF UPLOAD ERROR:",
            error,
        )


        raise RuntimeError(
            (
                "Unable to upload PDF "
                "to Cloudinary."
            )
        ) from error


    # =====================================================
    # VALIDATE CLOUDINARY RESPONSE
    # =====================================================

    if not isinstance(
        upload_result,
        dict,
    ):

        raise RuntimeError(
            (
                "Cloudinary returned an "
                "invalid upload response."
            )
        )


    returned_public_id = (
        upload_result.get(
            "public_id"
        )
        or public_id
    )


    file_url = (
        upload_result.get(
            "secure_url"
        )
        or ""
    ).strip()


    if not returned_public_id:

        raise RuntimeError(
            (
                "Cloudinary upload succeeded "
                "but no public ID was returned."
            )
        )


    if not file_url:

        # If upload succeeded but response is
        # unusable, remove the orphaned asset.

        try:

            cloudinary.uploader.destroy(

                returned_public_id,

                resource_type=
                    "image",

                type=
                    "upload",

                invalidate=
                    True,
            )

        except Exception as cleanup_error:

            print(
                (
                    "CLOUDINARY PDF "
                    "CLEANUP ERROR:"
                ),
                cleanup_error,
            )


        raise RuntimeError(
            (
                "Cloudinary upload succeeded "
                "but no secure URL was returned."
            )
        )


    # =====================================================
    # THUMBNAIL
    # =====================================================

    thumbnail_url = (
        build_thumbnail_url(
            returned_public_id
        )
    )


    # =====================================================
    # RESULT
    # =====================================================

    return {

        "public_id":
            returned_public_id,

        "file_url":
            file_url,

        "thumbnail_url":
            thumbnail_url,

        "bytes":
            upload_result.get(
                "bytes"
            )
            or len(
                file_bytes
            ),

        "format":
            upload_result.get(
                "format"
            )
            or "pdf",

        "resource_type":
            upload_result.get(
                "resource_type"
            )
            or "image",

        "version":
            upload_result.get(
                "version"
            ),
    }


# =========================================================
# DELETE PDF
# =========================================================


def delete_pdf(
    public_id
):
    """
    Delete a previously uploaded PDF from Cloudinary.
    """

    if not public_id:

        return {
            "result":
                "no_public_id"
        }


    public_id = (
        str(public_id)
        .strip()
    )


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

                resource_type=
                    "image",

                type=
                    "upload",

                invalidate=
                    True,
            )
        )


    except Exception as error:

        print(
            "CLOUDINARY PDF DELETE ERROR:",
            error,
        )


        raise RuntimeError(
            (
                "Unable to delete PDF "
                "from Cloudinary."
            )
        ) from error


    if not isinstance(
        result,
        dict,
    ):

        return {
            "result":
                "unknown"
        }


    return result


# =========================================================
# CLOUDINARY STATUS CHECK
# =========================================================


def get_document_storage_status():
    """
    Useful for testing Cloudinary configuration
    without exposing API secrets.
    """

    try:

        config_info = (
            ensure_cloudinary_configured()
        )


        return {
            "configured":
                True,

            "cloud_name":
                config_info.get(
                    "cloud_name"
                ),
        }


    except Exception as error:

        return {
            "configured":
                False,

            "error":
                str(error),
        }