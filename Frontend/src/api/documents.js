// =========================================================
// SHOBDO DOCUMENT API
// =========================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const CLEAN_API_URL =
  RAW_API_URL
    .trim()
    .replace(
      /\/+$/,
      ""
    );


const API_URL =
  CLEAN_API_URL.endsWith(
    "/api"
  )
    ? CLEAN_API_URL
    : `${CLEAN_API_URL}/api`;


// =========================================================
// TOKEN
// =========================================================

function getDocumentToken() {

  return (
    localStorage.getItem(
      "shobdo_token"
    ) ||
    ""
  );
}


// =========================================================
// RESPONSE HANDLER
// =========================================================

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


  if (
    !response.ok
  ) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Document request failed with status ${response.status}.`
    );
  }


  return data;
}


// =========================================================
// GET PUBLIC DOCUMENTS
//
// GET /api/documents
// =========================================================

export async function getDocuments({
  page = 1,
  limit = 12,
  language = "",
  category = "",
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "page",
    String(
      Math.max(
        1,
        Number(page) || 1
      )
    )
  );


  params.set(
    "limit",
    String(
      Math.max(
        1,
        Math.min(
          50,
          Number(limit) || 12
        )
      )
    )
  );


  if (
    language &&
    language.trim()
  ) {

    params.set(
      "language",
      language.trim()
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


  const response =
    await fetch(
      `${API_URL}/documents?${params.toString()}`,
      {
        method:
          "GET",

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
// GET ONE PUBLIC DOCUMENT
//
// GET /api/documents/<id>
// =========================================================

export async function getDocument(
  documentId
) {

  const id =
    Number(
      documentId
    );


  if (
    !Number.isFinite(
      id
    ) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid document ID."
    );
  }


  const response =
    await fetch(
      `${API_URL}/documents/${id}`,
      {
        method:
          "GET",

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
// GET CURRENT USER DOCUMENTS
//
// GET /api/documents/mine
// =========================================================

export async function getMyDocuments() {

  const token =
    getDocumentToken();


  if (
    !token
  ) {

    throw new Error(
      "Please log in to view your documents."
    );
  }


  const response =
    await fetch(
      `${API_URL}/documents/mine`,
      {
        method:
          "GET",

        headers: {
          Accept:
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return parseResponse(
    response
  );
}