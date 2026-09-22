import base64
import io
import os
import wave
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# CONFIGURATION
# =========================================================

GEMINI_MODEL = (
    os.getenv(
        "GEMINI_MODEL",
        "gemini-3.1-flash-lite",
    )
    .strip()
)


GEMINI_TTS_MODEL = (
    os.getenv(
        "GEMINI_TTS_MODEL",
        "gemini-3.1-flash-tts-preview",
    )
    .strip()
)


GEMINI_TTS_VOICE = (
    os.getenv(
        "GEMINI_TTS_VOICE",
        "Sulafat",
    )
    .strip()
)


MAX_WRITING_CHARACTERS = 60000


# =========================================================
# GEMINI TTS AUDIO FORMAT
# =========================================================
#
# Gemini TTS currently returns raw PCM:
#
# sample rate  : 24000 Hz
# channels     : 1
# sample width : 16 bit / 2 bytes
#
# SHOBDO converts the PCM bytes into WAV bytes in memory.
#
# =========================================================

TTS_SAMPLE_RATE = 24000
TTS_CHANNELS = 1
TTS_SAMPLE_WIDTH = 2


# =========================================================
# SUPPORTED SHOBDO LANGUAGES
# =========================================================
#
# A WritingCard keeps its own selected language.
#
# Example:
#
# Writing 1 -> Bengali
# Writing 2 -> English
# Writing 3 -> Hindi
#
# The selection is NOT stored as a global listener
# preference.
#
# Assamese is available for:
#
# - original writing
# - Gemini summarization
# - Gemini translation
#
# but is currently marked unavailable for Gemini TTS.
#
# =========================================================

SUPPORTED_LANGUAGES = {

    "bn": {
        "name": "Bengali",
        "native_name": "বাংলা",
        "locale": "bn-IN",
        "tts_supported": True,
    },

    "en": {
        "name": "English",
        "native_name": "English",
        "locale": "en-IN",
        "tts_supported": True,
    },

    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "locale": "hi-IN",
        "tts_supported": True,
    },

    "as": {
        "name": "Assamese",
        "native_name": "অসমীয়া",
        "locale": "as-IN",
        "tts_supported": False,
    },

    "or": {
        "name": "Odia",
        "native_name": "ଓଡ଼ିଆ",
        "locale": "or-IN",
        "tts_supported": True,
    },

    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "locale": "ta-IN",
        "tts_supported": True,
    },

    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
        "locale": "te-IN",
        "tts_supported": True,
    },

}


# =========================================================
# EXCEPTIONS
# =========================================================

class AudioSummaryError(Exception):
    """
    Base exception for SHOBDO audio-summary failures.
    """

    pass


class UnsupportedLanguageError(
    AudioSummaryError
):

    pass


class UnsupportedTTSLanguageError(
    AudioSummaryError
):

    pass


class SummaryGenerationError(
    AudioSummaryError
):

    pass


class TranslationError(
    AudioSummaryError
):

    pass


class SpeechGenerationError(
    AudioSummaryError
):

    pass


# =========================================================
# ENVIRONMENT HELPERS
# =========================================================

def _required_environment_variable(
    name: str,
) -> str:

    value = (
        os.getenv(name)
        or ""
    ).strip()

    if not value:

        raise AudioSummaryError(
            f"Missing required environment variable: {name}"
        )

    return value


# =========================================================
# LANGUAGE HELPERS
# =========================================================

def normalize_language_code(
    language: str,
) -> str:

    code = (
        str(language or "")
        .strip()
        .lower()
    )

    aliases = {

        # Bengali
        "bengali": "bn",
        "bangla": "bn",
        "বাংলা": "bn",
        "bn-in": "bn",

        # English
        "english": "en",
        "en-in": "en",

        # Hindi
        "hindi": "hi",
        "हिन्दी": "hi",
        "हिंदी": "hi",
        "hi-in": "hi",

        # Assamese
        "assamese": "as",
        "অসমীয়া": "as",
        "অসমীয়া": "as",
        "as-in": "as",

        # Odia
        "odia": "or",
        "oriya": "or",
        "ଓଡ଼ିଆ": "or",
        "or-in": "or",

        # Tamil
        "tamil": "ta",
        "தமிழ்": "ta",
        "ta-in": "ta",

        # Telugu
        "telugu": "te",
        "తెలుగు": "te",
        "te-in": "te",

    }

    code = aliases.get(
        code,
        code,
    )

    if code not in SUPPORTED_LANGUAGES:

        raise UnsupportedLanguageError(
            f"Unsupported SHOBDO language: {language}"
        )

    return code


def get_language_config(
    language: str,
):

    code = normalize_language_code(
        language
    )

    return (
        code,
        SUPPORTED_LANGUAGES[code],
    )


def get_supported_languages():

    return [

        {
            "code":
                code,

            "name":
                config["name"],

            "native_name":
                config["native_name"],

            "locale":
                config["locale"],

            "tts_supported":
                bool(
                    config["tts_supported"]
                ),
        }

        for code, config
        in SUPPORTED_LANGUAGES.items()

    ]


def get_tts_supported_languages():

    return [

        {
            "code":
                code,

            "name":
                config["name"],

            "native_name":
                config["native_name"],

            "locale":
                config["locale"],
        }

        for code, config
        in SUPPORTED_LANGUAGES.items()

        if config.get(
            "tts_supported"
        )
    ]


def is_tts_supported(
    language: str,
) -> bool:

    code = normalize_language_code(
        language
    )

    return bool(
        SUPPORTED_LANGUAGES[
            code
        ].get(
            "tts_supported"
        )
    )


def ensure_tts_supported(
    language: str,
) -> str:

    code = normalize_language_code(
        language
    )

    config = (
        SUPPORTED_LANGUAGES[
            code
        ]
    )

    if not config.get(
        "tts_supported"
    ):

        raise UnsupportedTTSLanguageError(
            (
                f"Audio output is currently unavailable "
                f"for {config['name']}."
            )
        )

    return code


# =========================================================
# GEMINI CLIENT
# =========================================================

def _get_gemini_client():

    api_key = (
        _required_environment_variable(
            "GEMINI_API_KEY"
        )
    )

    return genai.Client(
        api_key=api_key
    )


# =========================================================
# MODEL OUTPUT CLEANING
# =========================================================

def _clean_model_text(
    value: Optional[str],
) -> str:

    text = (
        str(value or "")
        .strip()
    )

    if not text:

        return ""

    # -----------------------------------------------------
    # Remove accidental Markdown code fences
    # -----------------------------------------------------

    if text.startswith("```"):

        lines = text.splitlines()

        if lines:

            lines = lines[1:]

        if (
            lines
            and
            lines[-1].strip() == "```"
        ):

            lines = lines[:-1]

        text = "\n".join(
            lines
        ).strip()

    # -----------------------------------------------------
    # Remove accidental surrounding quotation marks
    # -----------------------------------------------------

    quote_pairs = [

        ('"', '"'),
        ("'", "'"),
        ("“", "”"),
        ("‘", "’"),

    ]

    for (
        start_quote,
        end_quote,
    ) in quote_pairs:

        if (
            text.startswith(
                start_quote
            )
            and
            text.endswith(
                end_quote
            )
            and
            len(text) > 2
        ):

            text = text[
                len(start_quote):
                -len(end_quote)
            ].strip()

            break

    return text


# =========================================================
# WRITING VALIDATION
# =========================================================

def _validate_writing_text(
    title: str,
    content: str,
):

    safe_title = (
        str(title or "")
        .strip()
    )

    safe_content = (
        str(content or "")
        .strip()
    )

    if not safe_content:

        raise SummaryGenerationError(
            "Writing content is empty."
        )

    total_characters = (
        len(safe_title)
        +
        len(safe_content)
    )

    if (
        total_characters
        >
        MAX_WRITING_CHARACTERS
    ):

        raise SummaryGenerationError(
            (
                "Writing is too large for "
                "audio-summary generation."
            )
        )

    return (
        safe_title,
        safe_content,
    )


# =========================================================
# GENERATE CANONICAL SUMMARY
# =========================================================

def generate_canonical_summary(
    *,
    title: str,
    content: str,
    original_language: str,
) -> str:

    (
        safe_title,
        safe_content,
    ) = _validate_writing_text(
        title,
        content,
    )

    (
        language_code,
        language_config,
    ) = get_language_config(
        original_language
    )

    language_name = (
        language_config[
            "name"
        ]
    )

    client = (
        _get_gemini_client()
    )

    prompt = f"""
You are the multilingual literary summary engine for SHOBDO,
an Indian multilingual literature and social-writing platform.

Your task is to create a concise spoken summary of the writing
provided below.

STRICT RULES:

1. Write ONLY in {language_name}.
2. Preserve the author's actual meaning.
3. Preserve the central theme and emotional tone.
4. Preserve important events, ideas, characters, and context.
5. Never invent facts, events, characters, motives, symbolism,
   arguments, or conclusions.
6. Do not review, praise, criticize, rank, or judge the writing.
7. Do not explain your own reasoning.
8. Do not mention that an AI created the summary.
9. Avoid unnecessary phrases such as:
   "This writing discusses",
   "This poem is about",
   "The author says",
   "In summary".
10. Make the result natural when spoken aloud.
11. Prefer approximately 80 to 130 words.
12. For poetry:
    capture its meaning, imagery, atmosphere, and emotional movement
    without mechanically explaining every line.
13. For stories:
    preserve the essential narrative and central conflict without
    unnecessary detail.
14. For essays/articles:
    preserve the central argument and most important ideas.
15. Do not use Markdown.
16. Do not use headings.
17. Do not use bullet points.
18. Do not wrap the answer in quotation marks.
19. Return ONLY the summary.

Original language:
{language_name}

Original language code:
{language_code}

Title:
{safe_title}

BEGIN WRITING

{safe_content}

END WRITING
""".strip()

    try:

        response = (
            client.models
            .generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types
                .GenerateContentConfig(
                    temperature=0.25,
                    max_output_tokens=700,
                ),
            )
        )

    except Exception as exc:

        raise SummaryGenerationError(
            (
                "Gemini summary generation "
                f"failed: {exc}"
            )
        ) from exc

    summary = (
        _clean_model_text(
            getattr(
                response,
                "text",
                None,
            )
        )
    )

    if not summary:

        raise SummaryGenerationError(
            "Gemini returned an empty summary."
        )

    return summary


# =========================================================
# TRANSLATE CANONICAL SUMMARY
# =========================================================

def translate_summary(
    *,
    summary_text: str,
    source_language: str,
    target_language: str,
) -> str:

    safe_summary = (
        str(
            summary_text
            or ""
        )
        .strip()
    )

    if not safe_summary:

        raise TranslationError(
            "Summary text is empty."
        )

    (
        source_code,
        source_config,
    ) = get_language_config(
        source_language
    )

    (
        target_code,
        target_config,
    ) = get_language_config(
        target_language
    )

    # -----------------------------------------------------
    # Same language -> nothing to translate
    # -----------------------------------------------------

    if (
        source_code
        ==
        target_code
    ):

        return safe_summary

    client = (
        _get_gemini_client()
    )

    prompt = f"""
Translate the literary summary below from
{source_config["name"]} into {target_config["name"]}.

STRICT RULES:

1. Translate the supplied summary faithfully.
2. Do NOT summarize it again.
3. Do NOT expand it.
4. Do NOT shorten it unnecessarily.
5. Do NOT add facts, interpretations, symbolism, commentary,
   explanations, or opinions.
6. Preserve proper names and places accurately.
7. Preserve literary references when possible.
8. Preserve the emotional tone.
9. Use natural and fluent {target_config["name"]}.
10. Make the translation sound natural when spoken aloud.
11. Do not use Markdown.
12. Do not add headings or labels.
13. Do not wrap the translation in quotation marks.
14. Return ONLY the translated summary.

Source language:
{source_config["name"]}

Target language:
{target_config["name"]}

BEGIN SUMMARY

{safe_summary}

END SUMMARY
""".strip()

    try:

        response = (
            client.models
            .generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types
                .GenerateContentConfig(
                    temperature=0.15,
                    max_output_tokens=700,
                ),
            )
        )

    except Exception as exc:

        raise TranslationError(
            (
                "Gemini translation "
                f"failed: {exc}"
            )
        ) from exc

    translation = (
        _clean_model_text(
            getattr(
                response,
                "text",
                None,
            )
        )
    )

    if not translation:

        raise TranslationError(
            "Gemini returned an empty translation."
        )

    return translation


# =========================================================
# TTS PROMPT
# =========================================================

def _build_tts_prompt(
    *,
    text: str,
    language: str,
) -> str:

    code = ensure_tts_supported(
        language
    )

    config = (
        SUPPORTED_LANGUAGES[
            code
        ]
    )

    language_name = (
        config["name"]
    )

    return f"""
Read the following {language_name} literary summary aloud.

VOICE STYLE:

- warm
- natural
- clear
- expressive but not theatrical
- calm literary narration
- comfortable listening pace
- natural pauses
- respectful pronunciation

IMPORTANT:

- Speak in {language_name}.
- Read the summary only.
- Do not translate it.
- Do not summarize it again.
- Do not paraphrase it.
- Do not add an introduction.
- Do not say "summary".
- Do not add a conclusion.
- Do not add any words that are not present in the text.
- Preserve names and punctuation naturally.

BEGIN TEXT

{text}

END TEXT
""".strip()


# =========================================================
# AUDIO HELPERS
# =========================================================

def _decode_interaction_audio(
    value,
) -> bytes:

    if value is None:

        raise SpeechGenerationError(
            "Gemini TTS returned no audio data."
        )

    # -----------------------------------------------------
    # Interactions API currently returns Base64 text.
    # -----------------------------------------------------

    if isinstance(
        value,
        str,
    ):

        try:

            decoded = (
                base64.b64decode(
                    value
                )
            )

        except Exception as exc:

            raise SpeechGenerationError(
                (
                    "Could not decode Gemini "
                    f"TTS audio: {exc}"
                )
            ) from exc

        if not decoded:

            raise SpeechGenerationError(
                "Decoded Gemini audio is empty."
            )

        return decoded

    # -----------------------------------------------------
    # Some SDK responses may expose raw bytes directly.
    # -----------------------------------------------------

    if isinstance(
        value,
        (
            bytes,
            bytearray,
        ),
    ):

        result = bytes(
            value
        )

        if not result:

            raise SpeechGenerationError(
                "Gemini audio is empty."
            )

        return result

    raise SpeechGenerationError(
        (
            "Unexpected Gemini audio "
            f"data type: {type(value).__name__}"
        )
    )


def _pcm_to_wav_bytes(
    pcm_bytes: bytes,
    *,
    channels: int = TTS_CHANNELS,
    sample_rate: int = TTS_SAMPLE_RATE,
    sample_width: int = TTS_SAMPLE_WIDTH,
) -> bytes:

    if not pcm_bytes:

        raise SpeechGenerationError(
            "Cannot create WAV from empty PCM audio."
        )

    output = io.BytesIO()

    try:

        with wave.open(
            output,
            "wb",
        ) as wav_file:

            wav_file.setnchannels(
                channels
            )

            wav_file.setsampwidth(
                sample_width
            )

            wav_file.setframerate(
                sample_rate
            )

            wav_file.writeframes(
                pcm_bytes
            )

        wav_bytes = (
            output.getvalue()
        )

    except Exception as exc:

        raise SpeechGenerationError(
            (
                "Could not convert Gemini "
                f"PCM audio to WAV: {exc}"
            )
        ) from exc

    finally:

        output.close()

    if not wav_bytes:

        raise SpeechGenerationError(
            "Generated WAV audio is empty."
        )

    return wav_bytes


# =========================================================
# GEMINI INTERACTIONS TTS
# =========================================================

def _synthesize_with_interactions_api(
    *,
    client,
    prompt: str,
) -> bytes:

    try:

        interaction = (
            client.interactions.create(
                model=GEMINI_TTS_MODEL,
                input=prompt,
                response_format={
                    "type":
                        "audio",
                },
                generation_config={
                    "speech_config": [
                        {
                            "voice":
                                GEMINI_TTS_VOICE,
                        }
                    ]
                },
            )
        )

    except Exception as exc:

        raise SpeechGenerationError(
            (
                "Gemini Interactions TTS "
                f"request failed: {exc}"
            )
        ) from exc

    output_audio = getattr(
        interaction,
        "output_audio",
        None,
    )

    if output_audio is None:

        raise SpeechGenerationError(
            (
                "Gemini Interactions API "
                "returned no output_audio."
            )
        )

    audio_data = getattr(
        output_audio,
        "data",
        None,
    )

    pcm_bytes = (
        _decode_interaction_audio(
            audio_data
        )
    )

    return pcm_bytes


# =========================================================
# LEGACY GEMINI GENERATE CONTENT TTS FALLBACK
# =========================================================

def _synthesize_with_generate_content(
    *,
    client,
    prompt: str,
) -> bytes:

    try:

        response = (
            client.models
            .generate_content(
                model=GEMINI_TTS_MODEL,
                contents=prompt,
                config=types
                .GenerateContentConfig(
                    response_modalities=[
                        "AUDIO"
                    ],
                    speech_config=types
                    .SpeechConfig(
                        voice_config=types
                        .VoiceConfig(
                            prebuilt_voice_config=types
                            .PrebuiltVoiceConfig(
                                voice_name=
                                    GEMINI_TTS_VOICE,
                            )
                        )
                    ),
                ),
            )
        )

    except Exception as exc:

        raise SpeechGenerationError(
            (
                "Gemini GenerateContent TTS "
                f"request failed: {exc}"
            )
        ) from exc

    try:

        candidates = (
            response.candidates
        )

        if not candidates:

            raise ValueError(
                "No candidates returned."
            )

        content = (
            candidates[0].content
        )

        if (
            content is None
            or
            not content.parts
        ):

            raise ValueError(
                "No audio content returned."
            )

        inline_data = (
            content
            .parts[0]
            .inline_data
        )

        if inline_data is None:

            raise ValueError(
                "No inline audio data returned."
            )

        audio_data = (
            inline_data.data
        )

    except Exception as exc:

        raise SpeechGenerationError(
            (
                "Could not read Gemini TTS "
                f"response audio: {exc}"
            )
        ) from exc

    if isinstance(
        audio_data,
        str,
    ):

        try:

            return (
                base64.b64decode(
                    audio_data
                )
            )

        except Exception as exc:

            raise SpeechGenerationError(
                (
                    "Could not decode legacy "
                    f"Gemini TTS audio: {exc}"
                )
            ) from exc

    if isinstance(
        audio_data,
        (
            bytes,
            bytearray,
        ),
    ):

        result = bytes(
            audio_data
        )

        if not result:

            raise SpeechGenerationError(
                "Gemini returned empty PCM audio."
            )

        return result

    raise SpeechGenerationError(
        (
            "Unexpected legacy Gemini audio "
            f"type: {type(audio_data).__name__}"
        )
    )


# =========================================================
# SYNTHESIZE SUMMARY AUDIO
# =========================================================

def synthesize_summary_audio(
    *,
    summary_text: str,
    language: str,
) -> bytes:

    safe_text = (
        str(
            summary_text
            or ""
        )
        .strip()
    )

    if not safe_text:

        raise SpeechGenerationError(
            (
                "Cannot generate audio "
                "from empty summary text."
            )
        )

    language_code = (
        ensure_tts_supported(
            language
        )
    )

    client = (
        _get_gemini_client()
    )

    prompt = (
        _build_tts_prompt(
            text=safe_text,
            language=language_code,
        )
    )

    # -----------------------------------------------------
    # Prefer current Interactions API
    # -----------------------------------------------------

    interactions = getattr(
        client,
        "interactions",
        None,
    )

    if interactions is not None:

        try:

            pcm_bytes = (
                _synthesize_with_interactions_api(
                    client=client,
                    prompt=prompt,
                )
            )

        except SpeechGenerationError as interaction_error:

            # -------------------------------------------------
            # Compatibility fallback for an SDK/API combination
            # where the current Interactions request is not
            # available or fails because of schema differences.
            # -------------------------------------------------

            try:

                pcm_bytes = (
                    _synthesize_with_generate_content(
                        client=client,
                        prompt=prompt,
                    )
                )

            except SpeechGenerationError as legacy_error:

                raise SpeechGenerationError(
                    (
                        "Gemini TTS failed using both APIs. "
                        f"Interactions error: {interaction_error}. "
                        f"GenerateContent error: {legacy_error}"
                    )
                ) from legacy_error

    else:

        pcm_bytes = (
            _synthesize_with_generate_content(
                client=client,
                prompt=prompt,
            )
        )

    # -----------------------------------------------------
    # Gemini TTS audio is raw PCM.
    #
    # Convert it into a browser-friendly WAV container.
    # -----------------------------------------------------

    wav_bytes = (
        _pcm_to_wav_bytes(
            pcm_bytes
        )
    )

    return wav_bytes


# =========================================================
# BUILD ONE LISTENER-SELECTED LANGUAGE VERSION
# =========================================================

def build_audio_summary(
    *,
    title: str,
    content: str,
    original_language: str,
    target_language: str,
    canonical_summary: Optional[str] = None,
):
    """
    Build one multilingual SHOBDO audio-summary version.

    This function:

    1. creates/reuses the canonical summary
    2. translates it when necessary
    3. synthesizes listener-selected language audio
    4. returns WAV bytes and metadata

    This function intentionally DOES NOT:

    - save to Neon
    - upload to Cloudinary
    - manage database cache rows

    Those operations belong to the orchestration/storage layer.
    """

    original_code = (
        normalize_language_code(
            original_language
        )
    )

    target_code = (
        normalize_language_code(
            target_language
        )
    )

    # -----------------------------------------------------
    # Stop early if selected language cannot currently
    # produce speech.
    #
    # This prevents unnecessary Gemini summary/translation
    # requests.
    # -----------------------------------------------------

    ensure_tts_supported(
        target_code
    )

    # -----------------------------------------------------
    # CANONICAL SUMMARY
    # -----------------------------------------------------

    supplied_canonical = (
        str(
            canonical_summary
            or ""
        )
        .strip()
    )

    if supplied_canonical:

        source_summary = (
            supplied_canonical
        )

    else:

        source_summary = (
            generate_canonical_summary(
                title=title,
                content=content,
                original_language=
                    original_code,
            )
        )

    # -----------------------------------------------------
    # TARGET-LANGUAGE SUMMARY
    # -----------------------------------------------------

    if (
        target_code
        ==
        original_code
    ):

        target_summary = (
            source_summary
        )

        translation_provider = (
            None
        )

        translation_model = (
            None
        )

    else:

        target_summary = (
            translate_summary(
                summary_text=
                    source_summary,

                source_language=
                    original_code,

                target_language=
                    target_code,
            )
        )

        translation_provider = (
            "gemini"
        )

        translation_model = (
            GEMINI_MODEL
        )

    # -----------------------------------------------------
    # TEXT TO SPEECH
    # -----------------------------------------------------

    audio_bytes = (
        synthesize_summary_audio(
            summary_text=
                target_summary,

            language=
                target_code,
        )
    )

    target_config = (
        SUPPORTED_LANGUAGES[
            target_code
        ]
    )

    # -----------------------------------------------------
    # RESULT
    # -----------------------------------------------------

    return {

        "original_language":
            original_code,

        "language":
            target_code,

        "canonical_summary":
            source_summary,

        "summary_text":
            target_summary,

        # -------------------------------------------------
        # Audio
        # -------------------------------------------------

        "audio_bytes":
            audio_bytes,

        "audio_content_type":
            "audio/wav",

        "audio_extension":
            "wav",

        "audio_sample_rate":
            TTS_SAMPLE_RATE,

        "audio_channels":
            TTS_CHANNELS,

        "audio_sample_width":
            TTS_SAMPLE_WIDTH,

        # -------------------------------------------------
        # Summary metadata
        # -------------------------------------------------

        "summary_provider":
            "gemini",

        "summary_model":
            GEMINI_MODEL,

        # -------------------------------------------------
        # Translation metadata
        # -------------------------------------------------

        "translation_provider":
            translation_provider,

        "translation_model":
            translation_model,

        # -------------------------------------------------
        # TTS metadata
        # -------------------------------------------------

        "tts_provider":
            "gemini",

        "tts_model":
            GEMINI_TTS_MODEL,

        "voice":
            GEMINI_TTS_VOICE,

        "locale":
            target_config[
                "locale"
            ],

        "tts_supported":
            True,

    }


# =========================================================
# SERVICE INFORMATION
# =========================================================

def get_audio_summary_service_info():

    return {

        "summary_provider":
            "gemini",

        "summary_model":
            GEMINI_MODEL,

        "translation_provider":
            "gemini",

        "translation_model":
            GEMINI_MODEL,

        "tts_provider":
            "gemini",

        "tts_model":
            GEMINI_TTS_MODEL,

        "tts_voice":
            GEMINI_TTS_VOICE,

        "audio_format":
            "wav",

        "audio_sample_rate":
            TTS_SAMPLE_RATE,

        "audio_channels":
            TTS_CHANNELS,

        "audio_sample_width":
            TTS_SAMPLE_WIDTH,

        "supported_languages":
            get_supported_languages(),

        "tts_supported_languages":
            get_tts_supported_languages(),

    }