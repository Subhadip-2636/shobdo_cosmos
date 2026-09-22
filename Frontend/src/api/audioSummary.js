// =========================================================
// SHOBDO — MULTILINGUAL AUDIO SUMMARY API
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000"
).replace(/\/+$/, "");


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// HELPERS
// =========================================================

function getToken() {

  return (
    localStorage.getItem(
      TOKEN_KEY
    ) || ""
  );

}


async function parseResponse(
  response
) {

  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}.`;


    const error =
      new Error(
        message
      );


    error.status =
      response.status;


    error.data =
      data;


    throw error;

  }


  return data;

}


// =========================================================
// GET SUPPORTED AUDIO LANGUAGES
// =========================================================
//
// Public endpoint.
//
// Response example:
//
// {
//   success: true,
//   languages: [
//     {
//       code: "bn",
//       name: "Bengali",
//       native_name: "বাংলা",
//       locale: "bn-IN",
//       tts_supported: true
//     }
//   ]
// }
//
// =========================================================

export async function getAudioSummaryLanguages() {

  const response =
    await fetch(
      `${API_URL}/api/writings/audio-summary/languages`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      }
    );


  const data =
    await parseResponse(
      response
    );


  return (
    Array.isArray(
      data?.languages
    )
      ? data.languages
      : []
  );

}


// =========================================================
// GET CACHED AUDIO SUMMARY
// =========================================================
//
// Public endpoint.
//
// This does NOT generate AI audio.
//
// It only checks whether:
// writing + selected language
//
// already exists in the SHOBDO cache.
//
// =========================================================

export async function getCachedAudioSummary(
  writingId,
  language
) {

  const safeWritingId =
    Number(
      writingId
    );


  const safeLanguage =
    String(
      language || ""
    )
      .trim()
      .toLowerCase();


  if (
    !Number.isInteger(
      safeWritingId
    ) ||
    safeWritingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  if (!safeLanguage) {

    throw new Error(
      "Audio-summary language is required."
    );

  }


  const response =
    await fetch(
      (
        `${API_URL}/api/writings/` +
        `${safeWritingId}/audio-summary/` +
        `${encodeURIComponent(safeLanguage)}`
      ),
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      }
    );


  return parseResponse(
    response
  );

}


// =========================================================
// GENERATE OR GET AUDIO SUMMARY
// =========================================================
//
// Authenticated endpoint.
//
// First request:
// Gemini summary
// → translation
// → Gemini TTS
// → Cloudinary
// → Neon
//
// Later request:
// cached audio returned immediately.
//
// =========================================================

export async function generateAudioSummary(
  writingId,
  language
) {

  const safeWritingId =
    Number(
      writingId
    );


  const safeLanguage =
    String(
      language || ""
    )
      .trim()
      .toLowerCase();


  if (
    !Number.isInteger(
      safeWritingId
    ) ||
    safeWritingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  if (!safeLanguage) {

    throw new Error(
      "Please choose a language."
    );

  }


  const token =
    getToken();


  if (!token) {

    const error =
      new Error(
        "Please log in to generate an audio summary."
      );


    error.status = 401;


    throw error;

  }


  const response =
    await fetch(
      `${API_URL}/api/writings/${safeWritingId}/audio-summary`,
      {
        method:
          "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            language:
              safeLanguage,
          }),
      }
    );


  return parseResponse(
    response
  );

}


// =========================================================
// LOAD OR GENERATE AUDIO SUMMARY
// =========================================================
//
// Convenience method for WritingCard:
//
// 1. Check cache.
// 2. If cached → return immediately.
// 3. Otherwise generate.
// 4. Return resulting audio.
//
// =========================================================

export async function loadAudioSummary(
  writingId,
  language
) {

  const cached =
    await getCachedAudioSummary(
      writingId,
      language
    );


  if (
    cached?.cached &&
    cached?.audio_summary?.audio_url
  ) {

    return {

      ...cached,

      source:
        "cache",

    };

  }


  const generated =
    await generateAudioSummary(
      writingId,
      language
    );


  return {

    ...generated,

    source:
      generated?.cached
        ? "cache"
        : "generated",

  };

}


// =========================================================
// AUDIO URL HELPER
// =========================================================

export function getAudioSummaryUrl(
  result
) {

  return (
    result?.audio_summary?.audio_url ||
    ""
  );

}


// =========================================================
// AUDIO SUMMARY STATUS HELPERS
// =========================================================

export function isAudioSummaryReady(
  result
) {

  return Boolean(
    result?.audio_summary?.status === "ready" &&
    result?.audio_summary?.audio_url
  );

}


export function isAudioLanguageSupported(
  language
) {

  return Boolean(
    language?.tts_supported
  );

}