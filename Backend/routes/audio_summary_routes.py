from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    jwt_required,
)

from database import db

from models.writing import Writing
from models.writing_audio_summary import (
    WritingAudioSummary,
)

from services.audio_summary_service import (
    SUPPORTED_LANGUAGES,
    get_supported_languages,
    normalize_language_code,
)

from services.writing_audio_summary_manager import (
    get_or_generate_audio_summary,
)


# =========================================================
# BLUEPRINT
# =========================================================

audio_summary_bp = Blueprint(
    "audio_summary",
    __name__,
)


# =========================================================
# SUPPORTED AUDIO SUMMARY LANGUAGES
# =========================================================

@audio_summary_bp.route(
    "/audio-summary/languages",
    methods=["GET"],
)
def get_audio_summary_languages():

    languages = (
        get_supported_languages()
    )

    return jsonify({

        "success":
            True,

        "languages":
            languages,

    }), 200


# =========================================================
# GET CACHED AUDIO SUMMARY
# =========================================================
#
# This endpoint does NOT generate anything.
#
# It only checks whether SHOBDO already has a cached
# summary/audio version for:
#
# writing + selected language
#
# This will later help WritingCard avoid unnecessary
# Gemini requests.
#
# =========================================================

@audio_summary_bp.route(
    "/<int:writing_id>/audio-summary/<string:language>",
    methods=["GET"],
)
def get_cached_audio_summary(
    writing_id,
    language,
):

    writing = (
        db.session.get(
            Writing,
            writing_id,
        )
    )

    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

        }), 404

    # -----------------------------------------------------
    # Only expose published writings publicly
    # -----------------------------------------------------

    if (
        getattr(
            writing,
            "status",
            None,
        )
        !=
        "published"
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Writing is not published.",

        }), 404

    try:

        language_code = (
            normalize_language_code(
                language
            )
        )

    except Exception:

        return jsonify({

            "success":
                False,

            "message":
                "Unsupported language.",

        }), 400

    summary = (
        WritingAudioSummary.query
        .filter_by(
            writing_id=writing.id,
            language=language_code,
        )
        .first()
    )

    if not summary:

        return jsonify({

            "success":
                True,

            "cached":
                False,

            "audio_summary":
                None,

        }), 200

    return jsonify({

        "success":
            True,

        "cached":
            bool(
                summary.status == "ready"
                and
                summary.audio_url
            ),

        "audio_summary":
            summary.to_dict(),

    }), 200


# =========================================================
# GENERATE / GET AUDIO SUMMARY
# =========================================================
#
# First request:
#
# Writing
#   ↓
# canonical summary
#   ↓
# translation if required
#   ↓
# Gemini TTS
#   ↓
# Cloudinary
#   ↓
# Neon cache
#
# Later request:
#
# Neon cache
#   ↓
# existing Cloudinary audio
#
# Generation is authenticated because it consumes
# Gemini resources.
#
# =========================================================

@audio_summary_bp.route(
    "/<int:writing_id>/audio-summary",
    methods=["POST"],
)
@jwt_required()
def generate_audio_summary(
    writing_id,
):

    writing = (
        db.session.get(
            Writing,
            writing_id,
        )
    )

    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

        }), 404

    # -----------------------------------------------------
    # Only published writings should generate listener audio
    # -----------------------------------------------------

    if (
        getattr(
            writing,
            "status",
            None,
        )
        !=
        "published"
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Audio summaries are available only for published writings.",

        }), 400

    # -----------------------------------------------------
    # REQUEST BODY
    # -----------------------------------------------------

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    requested_language = (
        str(
            data.get(
                "language",
                "",
            )
        )
        .strip()
    )

    if not requested_language:

        return jsonify({

            "success":
                False,

            "message":
                "Please choose an audio-summary language.",

        }), 400

    # -----------------------------------------------------
    # NORMALIZE LANGUAGE
    # -----------------------------------------------------

    try:

        language_code = (
            normalize_language_code(
                requested_language
            )
        )

    except Exception:

        return jsonify({

            "success":
                False,

            "message":
                "Unsupported audio-summary language.",

        }), 400

    language_config = (
        SUPPORTED_LANGUAGES[
            language_code
        ]
    )

    # -----------------------------------------------------
    # TTS SUPPORT CHECK
    # -----------------------------------------------------

    if not language_config.get(
        "tts_supported"
    ):

        return jsonify({

            "success":
                False,

            "message":
                (
                    "Audio output is currently unavailable "
                    f"for {language_config['name']}."
                ),

            "language":
                language_code,

            "tts_supported":
                False,

        }), 400

    # -----------------------------------------------------
    # GENERATE OR RETURN CACHE
    # -----------------------------------------------------

    try:

        result = (
            get_or_generate_audio_summary(
                writing=writing,
                target_language=
                    language_code,
            )
        )

    except ValueError as exc:

        return jsonify({

            "success":
                False,

            "message":
                str(exc),

        }), 400

    except Exception as exc:

        print(
            "AUDIO SUMMARY ERROR:",
            repr(exc),
        )

        return jsonify({

            "success":
                False,

            "message":
                (
                    "Unable to generate the audio summary "
                    "right now."
                ),

        }), 500

    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return jsonify({

        "success":
            True,

        "cached":
            bool(
                result.get(
                    "cached"
                )
            ),

        "language":
            language_code,

        "audio_summary":
            result.get(
                "audio_summary"
            ),

    }), 200