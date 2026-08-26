// =========================================================
// SHOBDO API CONFIG
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";

const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// TOKEN HELPERS
// =========================================================

function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


function buildHeaders(
  customHeaders = {}
) {

  const token =
    getToken();


  const headers = {
    "Content-Type":
      "application/json",

    ...customHeaders,
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  return headers;

}


// =========================================================
// RESPONSE HANDLER
// =========================================================

async function parseResponse(
  response
) {

  let data = {};


  try {

    data =
      await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Something went wrong. Please try again."
    );

  }


  return data;

}


// =========================================================
// GENERIC API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers:
          buildHeaders(
            options.headers
          ),
      }
    );


  return parseResponse(
    response
  );

}


// =========================================================
// PUBLIC — GET WRITINGS
// =========================================================

export async function getWritings({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  language = "",
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "page",
    String(page)
  );


  params.set(
    "limit",
    String(limit)
  );


  if (
    search &&
    search.trim()
  ) {

    params.set(
      "search",
      search.trim()
    );

  }


  if (
    category &&
    category.trim()
  ) {

    params.set(
      "category",
      category.trim()
    );

  }


  if (
    language &&
    language.trim()
  ) {

    params.set(
      "language",
      language.trim()
    );

  }


  return apiRequest(
    `/api/writings?${params.toString()}`,
    {
      method: "GET",
    }
  );

}


// =========================================================
// PUBLIC — GET SINGLE PUBLISHED WRITING
// =========================================================

export async function getWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}`,
    {
      method: "GET",
    }
  );

}


// =========================================================
// AUTH — GET MY WRITINGS
// =========================================================

export async function getMyWritings({
  status = "",
  language = "",
} = {}) {

  const params =
    new URLSearchParams();


  if (status) {

    params.set(
      "status",
      status
    );

  }


  if (language) {

    params.set(
      "language",
      language
    );

  }


  const query =
    params.toString();


  return apiRequest(
    `/api/writings/mine${
      query
        ? `?${query}`
        : ""
    }`,
    {
      method: "GET",
    }
  );

}


// =========================================================
// AUTH — GET SINGLE OWN WRITING
// =========================================================

export async function getMyWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/mine/${writingId}`,
    {
      method: "GET",
    }
  );

}


// =========================================================
// AUTH — CREATE DRAFT
// =========================================================

export async function createDraft({
  title = "",
  content = "",
  category = "অন্যান্য",
  language = "bn",
} = {}) {

  return apiRequest(
    "/api/writings/drafts",
    {
      method: "POST",

      body:
        JSON.stringify({
          title,
          content,
          category,
          language,
        }),
    }
  );

}


// =========================================================
// AUTH — CREATE AND PUBLISH DIRECTLY
// =========================================================

export async function createWriting({
  title,
  content,
  category,
  language = "bn",
}) {

  return apiRequest(
    "/api/writings",
    {
      method: "POST",

      body:
        JSON.stringify({
          title,
          content,
          category,
          language,
        }),
    }
  );

}


// =========================================================
// AUTH — UPDATE OWN WRITING
// =========================================================

export async function updateWriting(
  writingId,
  {
    title,
    content,
    category,
    language,
  }
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}`,
    {
      method: "PUT",

      body:
        JSON.stringify({
          title,
          content,
          category,
          language,
        }),
    }
  );

}


// =========================================================
// AUTH — PUBLISH WRITING
// =========================================================

export async function publishWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}/publish`,
    {
      method: "POST",
    }
  );

}


// =========================================================
// AUTH — UNPUBLISH WRITING
// =========================================================

export async function unpublishWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}/unpublish`,
    {
      method: "POST",
    }
  );

}


// =========================================================
// AUTH — DELETE OWN WRITING
// =========================================================

export async function deleteWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}`,
    {
      method: "DELETE",
    }
  );

}


// =========================================================
// GET SUPPORTED LANGUAGES FROM BACKEND
// =========================================================

export async function getSupportedLanguages() {

  return apiRequest(
    "/api/writings/languages",
    {
      method: "GET",
    }
  );

}


// =========================================================
// LIKE WRITING
// =========================================================
// Keep this for compatibility with your existing UI.
// It requires a matching backend endpoint:
// POST /api/writings/:id/like
// =========================================================

export async function likeWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}/like`,
    {
      method: "POST",
    }
  );

}


// =========================================================
// EXPORT BASE URL
// =========================================================

export {
  API_URL,
};