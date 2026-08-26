// =========================================================
// SHOBDO — SUPPORTED LANGUAGES
// =========================================================

export const LANGUAGES = [
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
  },

  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },

  {
    code: "en",
    name: "English",
    nativeName: "English",
  },

  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
  },

  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
  },

  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
  },

  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
  },

  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
  },

  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
  },

  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
  },

  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
  },

  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
  },

  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
  },

  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
  },

  {
    code: "other",
    name: "Other",
    nativeName: "Other",
  },
];


// =========================================================
// DEFAULT LANGUAGE
// =========================================================

export const DEFAULT_LANGUAGE =
  "bn";


// =========================================================
// GET LANGUAGE BY CODE
// =========================================================

export function getLanguageByCode(
  code
) {

  return (
    LANGUAGES.find(
      (language) =>
        language.code === code
    )
    || LANGUAGES.find(
      (language) =>
        language.code ===
        DEFAULT_LANGUAGE
    )
  );
}


// =========================================================
// GET DISPLAY LABEL
// =========================================================

export function getLanguageLabel(
  code
) {

  const language =
    getLanguageByCode(
      code
    );


  if (!language) {
    return "Unknown";
  }


  if (
    language.nativeName ===
    language.name
  ) {

    return language.name;

  }


  return (
    `${language.nativeName} · ${language.name}`
  );
}


// =========================================================
// CHECK SUPPORTED LANGUAGE
// =========================================================

export function isSupportedLanguage(
  code
) {

  return LANGUAGES.some(
    (language) =>
      language.code === code
  );
}


// =========================================================
// SELECT OPTIONS
// =========================================================

export function getLanguageOptions() {

  return LANGUAGES.map(
    (language) => ({
      value: language.code,

      label:
        language.nativeName ===
        language.name
          ? language.name
          : (
            `${language.nativeName} — ${language.name}`
          ),
    })
  );
}