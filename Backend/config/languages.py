# =========================================================
# SHOBDO — LANGUAGE CONFIGURATION
# =========================================================


SUPPORTED_LANGUAGES = {

    "bn": {
        "name": "Bengali",
        "native_name": "বাংলা",
    },

    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
    },

    "en": {
        "name": "English",
        "native_name": "English",
    },

    "as": {
        "name": "Assamese",
        "native_name": "অসমীয়া",
    },

    "or": {
        "name": "Odia",
        "native_name": "ଓଡ଼ିଆ",
    },

    "mr": {
        "name": "Marathi",
        "native_name": "मराठी",
    },

    "gu": {
        "name": "Gujarati",
        "native_name": "ગુજરાતી",
    },

    "pa": {
        "name": "Punjabi",
        "native_name": "ਪੰਜਾਬੀ",
    },

    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
    },

    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
    },

    "kn": {
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
    },

    "ml": {
        "name": "Malayalam",
        "native_name": "മലയാളം",
    },

    "ur": {
        "name": "Urdu",
        "native_name": "اردو",
    },

    "ne": {
        "name": "Nepali",
        "native_name": "नेपाली",
    },

    "other": {
        "name": "Other",
        "native_name": "Other",
    },
}


# =========================================================
# DEFAULT LANGUAGE
# =========================================================

DEFAULT_LANGUAGE = "bn"


# =========================================================
# SUPPORTED LANGUAGE CODES
# =========================================================

SUPPORTED_LANGUAGE_CODES = frozenset(
    SUPPORTED_LANGUAGES.keys()
)


# =========================================================
# NORMALIZE LANGUAGE
# =========================================================

def normalize_language(value):
    """
    Normalize and validate a language code.

    Examples:
        "BN" -> "bn"
        " hi " -> "hi"
        None -> DEFAULT_LANGUAGE
        "xyz" -> None
    """

    if value is None:
        return DEFAULT_LANGUAGE

    language = str(value).strip().lower()

    if not language:
        return DEFAULT_LANGUAGE

    if language not in SUPPORTED_LANGUAGE_CODES:
        return None

    return language


# =========================================================
# CHECK WHETHER LANGUAGE IS SUPPORTED
# =========================================================

def is_supported_language(value):
    """
    Return True when the supplied language code is supported.
    """

    if value is None:
        return False

    language = str(value).strip().lower()

    return language in SUPPORTED_LANGUAGE_CODES


# =========================================================
# GET SINGLE LANGUAGE INFORMATION
# =========================================================

def get_language(code):
    """
    Return serialized information for one language.

    Returns None for unsupported language codes.
    """

    normalized = normalize_language(code)

    if normalized is None:
        return None

    language = SUPPORTED_LANGUAGES[
        normalized
    ]

    return {
        "code": normalized,
        "name": language["name"],
        "native_name": language["native_name"],
    }


# =========================================================
# SERIALIZE ALL LANGUAGES
# =========================================================

def serialize_languages():
    """
    Return all supported languages as a list.
    """

    return [
        {
            "code": code,
            "name": information["name"],
            "native_name": information[
                "native_name"
            ],
        }
        for code, information
        in SUPPORTED_LANGUAGES.items()
    ]