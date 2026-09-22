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
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# CONSTANTS
# =========================================================

VIDEO_FOLDER = (
    "shobdo/videos"
)


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

def ensure_cloudinary_configured():
    """
    Configure Cloudinary for SHOBDO video storage.

    Supported configuration:

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
    # OPTION 1 — CLOUDINARY_URL
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
                (
                    "CLOUDINARY_URL has an invalid "
                    "format. It must start with "
                    "'cloudinary://'."
                )
            )


        try:

            parsed = (
                urlparse(
                    cloudinary_url
                )
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

            secure=
                True,

        )


        return


    # =====================================================
    # OPTION 2 — SEPARATE ENVIRONMENT VARIABLES
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


    if (
        not cloud_name
        or
        not api_key
        or
        not api_secret
    ):

        raise RuntimeError(
            (
                "Cloudinary is not configured. "
                "Set CLOUDINARY_URL or "
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

        secure=
            True,

    )


# =========================================================
# GENERATE PUBLIC ID
# =========================================================

def generate_video_public_id(
    user_id=None,
):
    """
    Generate a unique Cloudinary public ID.

    Example:

    shobdo/videos/user_4/abc123...
    """

    unique_id = (
        uuid.uuid4().hex
    )


    if user_id is not None:

        try:

            safe_user_id = int(
                user_id
            )

            return (
                f"{VIDEO_FOLDER}/"
                f"user_{safe_user_id}/"
                f"{unique_id}"
            )

        except (
            TypeError,
            ValueError,
        ):

            pass


    return (
        f"{VIDEO_FOLDER}/"
        f"{unique_id}"
    )


# =========================================================
# BUILD THUMBNAIL URL
# =========================================================

def build_video_thumbnail_url(
    public_id,
):
    """
    Build an automatic poster/thumbnail image
    from the uploaded Cloudinary video.
    """

    if not public_id:

        return None


    try:

        thumbnail_url, _ = (
            cloudinary.utils.cloudinary_url(

                public_id,

                resource_type=
                    "video",

                format=
                    "jpg",

                secure=
                    True,

                transformation=[
                    {
                        "width":
                            1280,

                        "height":
                            720,

                        "crop":
                            "limit",

                        "quality":
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

        print(
            "VIDEO THUMBNAIL URL ERROR:",
            repr(
                error
            ),
        )

        return None


# =========================================================
# UPLOAD VIDEO
# =========================================================

def upload_video(
    *,
    file_bytes,
    filename=None,
    content_type=None,
    user_id=None,
):
    """
    Upload a video to Cloudinary.

    Parameters
    ----------
    file_bytes:
        Raw bytes of the uploaded video.

    filename:
        Original client filename.

    content_type:
        MIME type supplied by the browser.

    user_id:
        SHOBDO account ID.

    Returns
    -------
    dict

    {
        "video_url": "...",
        "secure_url": "...",
        "public_id": "...",
        "thumbnail_url": "...",
        "duration": 12.4,
        "width": 1080,
        "height": 1920,
        "format": "mp4",
        ...
    }
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    if not file_bytes:

        raise ValueError(
            "Video data is empty."
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
                "Video data must be bytes "
                "or bytearray."
            )
        )


    # =====================================================
    # CLOUDINARY
    # =====================================================

    ensure_cloudinary_configured()


    public_id = (
        generate_video_public_id(
            user_id=
                user_id
        )
    )


    file_stream = (
        io.BytesIO(
            file_bytes
        )
    )


    # Give Cloudinary a useful filename when possible.
    if filename:

        try:

            file_stream.name = (
                str(
                    filename
                )
            )

        except Exception:

            pass


    # =====================================================
    # UPLOAD
    # =====================================================

    try:

        result = (
            cloudinary.uploader.upload(

                file_stream,

                resource_type=
                    "video",

                public_id=
                    public_id,

                overwrite=
                    False,

                unique_filename=
                    False,

                use_filename=
                    False,

                secure=
                    True,

                invalidate=
                    True,

            )
        )


    except Exception as error:

        raise RuntimeError(
            (
                "Unable to upload video "
                "to Cloudinary."
            )
        ) from error


    if not isinstance(
        result,
        dict,
    ):

        raise RuntimeError(
            (
                "Cloudinary returned an "
                "invalid upload response."
            )
        )


    # =====================================================
    # EXTRACT RESPONSE
    # =====================================================

    returned_public_id = (
        result.get(
            "public_id"
        )
        or public_id
    )


    secure_url = (
        result.get(
            "secure_url"
        )
        or
        result.get(
            "url"
        )
    )


    if not secure_url:

        try:

            cloudinary.uploader.destroy(

                returned_public_id,

                resource_type=
                    "video",

                invalidate=
                    True,
            )

        except Exception:

            pass


        raise RuntimeError(
            (
                "Cloudinary uploaded the video "
                "but returned no playable URL."
            )
        )


    # =====================================================
    # THUMBNAIL
    # =====================================================

    thumbnail_url = (
        build_video_thumbnail_url(
            returned_public_id
        )
    )


    # =====================================================
    # NORMALIZED RESPONSE
    # =====================================================

    response = {

        "video_url":
            secure_url,

        "secure_url":
            secure_url,

        "url":
            result.get(
                "url"
            ),

        "public_id":
            returned_public_id,

        "thumbnail_url":
            thumbnail_url,

        "duration":
            result.get(
                "duration"
            ),

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

        "resource_type":
            result.get(
                "resource_type"
            ),

        "bytes":
            result.get(
                "bytes"
            ),

        "created_at":
            result.get(
                "created_at"
            ),

        "playback_url":
            secure_url,

        "original_filename":
            filename,

        "content_type":
            content_type,

    }


    return response


# =========================================================
# DELETE VIDEO
# =========================================================

def delete_video(
    public_id,
):
    """
    Delete a video from Cloudinary.

    Returns True when Cloudinary reports
    successful deletion or that the resource
    is already absent.
    """

    public_id = (
        str(
            public_id
            or ""
        )
        .strip()
    )


    if not public_id:

        return False


    ensure_cloudinary_configured()


    try:

        result = (
            cloudinary.uploader.destroy(

                public_id,

                resource_type=
                    "video",

                invalidate=
                    True,

            )
        )


    except Exception as error:

        raise RuntimeError(
            (
                "Unable to delete video "
                "from Cloudinary."
            )
        ) from error


    if not isinstance(
        result,
        dict,
    ):

        return False


    status = (
        str(
            result.get(
                "result"
            )
            or ""
        )
        .strip()
        .lower()
    )


    return status in {
        "ok",
        "not found",
    }