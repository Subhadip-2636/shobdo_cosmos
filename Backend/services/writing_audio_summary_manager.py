import io
import os
from datetime import datetime, timezone

import cloudinary
import cloudinary.uploader

from database import db
from models.writing_audio_summary import WritingAudioSummary

from services.audio_summary_service import (
    GEMINI_MODEL,
    SUPPORTED_LANGUAGES,
    build_audio_summary,
    generate_canonical_summary,
    normalize_language_code,
)


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

def _configure_cloudinary():

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

    if not all([
        cloud_name,
        api_key,
        api_secret,
    ]):

        raise RuntimeError(
            "Cloudinary configuration is incomplete."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


# =========================================================
# CLOUDINARY AUDIO UPLOAD
# =========================================================

def _upload_audio(
    *,
    writing_id: int,
    language: str,
    audio_bytes: bytes,
):

    _configure_cloudinary()

    if not audio_bytes:

        raise RuntimeError(
            "Cannot upload empty audio."
        )

    public_id = (
        f"shobdo/audio_summaries/"
        f"writing_{writing_id}/"
        f"summary_{language}"
    )

    upload_result = (
        cloudinary.uploader.upload(
            io.BytesIO(
                audio_bytes
            ),
            resource_type="video",
            public_id=public_id,
            overwrite=True,
            invalidate=True,
            format="wav",
        )
    )

    secure_url = (
        upload_result.get(
            "secure_url"
        )
        or ""
    ).strip()

    if not secure_url:

        raise RuntimeError(
            "Cloudinary returned no secure audio URL."
        )

    return {

        "audio_url":
            secure_url,

        "audio_public_id":
            upload_result.get(
                "public_id"
            ),

        "audio_duration_seconds":
            upload_result.get(
                "duration"
            ),

    }


# =========================================================
# DATABASE HELPERS
# =========================================================

def _find_summary(
    writing_id: int,
    language: str,
):

    return (
        WritingAudioSummary.query
        .filter_by(
            writing_id=writing_id,
            language=language,
        )
        .first()
    )


def _get_or_create_summary(
    *,
    writing_id: int,
    language: str,
):

    existing = (
        _find_summary(
            writing_id,
            language,
        )
    )

    if existing:

        return existing

    row = WritingAudioSummary(
        writing_id=writing_id,
        language=language,
        status="pending",
    )

    db.session.add(
        row
    )

    db.session.commit()

    return row


# =========================================================
# CANONICAL SUMMARY
# =========================================================

def _get_or_generate_canonical_summary(
    writing,
):

    original_language = (
        normalize_language_code(
            writing.language
        )
    )

    canonical_row = (
        _get_or_create_summary(
            writing_id=writing.id,
            language=original_language,
        )
    )

    # -----------------------------------------------------
    # Reuse existing canonical summary
    # -----------------------------------------------------

    existing_summary = (
        str(
            canonical_row.summary_text
            or ""
        )
        .strip()
    )

    if existing_summary:

        return (
            existing_summary,
            canonical_row,
        )

    # -----------------------------------------------------
    # Generate canonical summary
    # -----------------------------------------------------

    canonical_row.status = (
        "summarizing"
    )

    canonical_row.error_message = (
        None
    )

    db.session.commit()

    try:

        summary_text = (
            generate_canonical_summary(
                title=writing.title,
                content=writing.content,
                original_language=
                    original_language,
            )
        )

        canonical_row.summary_text = (
            summary_text
        )

        canonical_row.summary_provider = (
            "gemini"
        )

        canonical_row.summary_model = (
            GEMINI_MODEL
        )

        canonical_row.status = (
            "summary_ready"
        )

        canonical_row.error_message = (
            None
        )

        canonical_row.updated_at = (
            datetime.now(
                timezone.utc
            )
        )

        db.session.commit()

        return (
            summary_text,
            canonical_row,
        )

    except Exception as exc:

        db.session.rollback()

        canonical_row = (
            _find_summary(
                writing.id,
                original_language,
            )
        )

        if canonical_row:

            canonical_row.status = (
                "failed"
            )

            canonical_row.error_message = (
                str(exc)
            )

            db.session.commit()

        raise


# =========================================================
# MAIN AUDIO SUMMARY ORCHESTRATOR
# =========================================================

def get_or_generate_audio_summary(
    *,
    writing,
    target_language: str,
):

    target_code = (
        normalize_language_code(
            target_language
        )
    )

    target_config = (
        SUPPORTED_LANGUAGES[
            target_code
        ]
    )

    # -----------------------------------------------------
    # CHECK TTS SUPPORT
    # -----------------------------------------------------

    if not target_config.get(
        "tts_supported"
    ):

        raise ValueError(
            (
                "Audio output is currently "
                f"unavailable for "
                f"{target_config['name']}."
            )
        )

    # -----------------------------------------------------
    # CACHE CHECK
    # -----------------------------------------------------

    cached_row = (
        _find_summary(
            writing.id,
            target_code,
        )
    )

    if (
        cached_row
        and
        cached_row.status == "ready"
        and
        cached_row.audio_url
    ):

        return {

            "cached":
                True,

            "audio_summary":
                cached_row.to_dict(),

        }

    # -----------------------------------------------------
    # CANONICAL SUMMARY
    # -----------------------------------------------------

    (
        canonical_summary,
        _canonical_row,
    ) = (
        _get_or_generate_canonical_summary(
            writing
        )
    )

    original_language = (
        normalize_language_code(
            writing.language
        )
    )

    # -----------------------------------------------------
    # TARGET LANGUAGE DATABASE ROW
    # -----------------------------------------------------

    target_row = (
        _get_or_create_summary(
            writing_id=writing.id,
            language=target_code,
        )
    )

    target_row.error_message = (
        None
    )

    if (
        target_code
        ==
        original_language
    ):

        target_row.status = (
            "synthesizing"
        )

    else:

        target_row.status = (
            "translating"
        )

    db.session.commit()

    try:

        # -------------------------------------------------
        # GENERATE TARGET SUMMARY + AUDIO
        # -------------------------------------------------

        result = (
            build_audio_summary(
                title=writing.title,
                content=writing.content,
                original_language=
                    original_language,
                target_language=
                    target_code,
                canonical_summary=
                    canonical_summary,
            )
        )

        # -------------------------------------------------
        # SAVE TEXT / PROVIDER METADATA
        # -------------------------------------------------

        target_row.summary_text = (
            result[
                "summary_text"
            ]
        )

        target_row.summary_provider = (
            result[
                "summary_provider"
            ]
        )

        target_row.summary_model = (
            result[
                "summary_model"
            ]
        )

        target_row.translation_provider = (
            result[
                "translation_provider"
            ]
        )

        target_row.translation_model = (
            result[
                "translation_model"
            ]
        )

        target_row.tts_provider = (
            result[
                "tts_provider"
            ]
        )

        target_row.tts_model = (
            result[
                "tts_model"
            ]
        )

        target_row.voice = (
            result[
                "voice"
            ]
        )

        target_row.status = (
            "synthesizing"
        )

        db.session.commit()

        # -------------------------------------------------
        # UPLOAD AUDIO TO CLOUDINARY
        # -------------------------------------------------

        uploaded = (
            _upload_audio(
                writing_id=
                    writing.id,
                language=
                    target_code,
                audio_bytes=
                    result[
                        "audio_bytes"
                    ],
            )
        )

        # -------------------------------------------------
        # SAVE AUDIO INFORMATION
        # -------------------------------------------------

        target_row.audio_url = (
            uploaded[
                "audio_url"
            ]
        )

        target_row.audio_public_id = (
            uploaded[
                "audio_public_id"
            ]
        )

        target_row.audio_duration_seconds = (
            uploaded[
                "audio_duration_seconds"
            ]
        )

        target_row.status = (
            "ready"
        )

        target_row.generated_at = (
            datetime.now(
                timezone.utc
            )
        )

        target_row.updated_at = (
            datetime.now(
                timezone.utc
            )
        )

        target_row.error_message = (
            None
        )

        db.session.commit()

        return {

            "cached":
                False,

            "audio_summary":
                target_row.to_dict(),

        }

    except Exception as exc:

        db.session.rollback()

        failed_row = (
            _find_summary(
                writing.id,
                target_code,
            )
        )

        if failed_row:

            failed_row.status = (
                "failed"
            )

            failed_row.error_message = (
                str(exc)
            )

            failed_row.updated_at = (
                datetime.now(
                    timezone.utc
                )
            )

            db.session.commit()

        raise