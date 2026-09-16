// =========================================================
// SHOBDO DOCUMENT API
// =========================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const CLEAN_API_URL =
  String(
    RAW_API_URL
  )
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
// VALID DOCUMENT ID
// =========================================================

function normalizeDocumentId(
  documentId
) {

  const id =
    Number(
      documentId
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid document ID."
    );
  }


  return id;
}


// =========================================================
// AUTH HEADER
// =========================================================

function getAuthHeaders({
  required = false,
} = {}) {

  const token =
    getDocumentToken();


  if (
    required &&
    !token
  ) {

    throw new Error(
      "Please log in to continue."
    );
  }


  const headers = {
    Accept:
      "application/json",
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

  let data = null;


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  try {

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();


      data =
        text
          ? {
              message:
                text,
            }
          : null;
    }


  } catch (
    error
  ) {

    console.error(
      "DOCUMENT RESPONSE PARSE ERROR:",
      error
    );


    data = null;
  }


  if (
    !response.ok
  ) {

    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      (
        response.status === 401
          ? "Your login session has expired. Please log in again."
          : response.status === 403
            ? "You do not have permission to perform this action."
            : response.status === 404
              ? "Document was not found."
              : `Document request failed with status ${response.status}.`
      );


    const requestError =
      new Error(
        message
      );


    requestError.status =
      response.status;


    requestError.data =
      data;


    throw requestError;
  }


  return data;
}


// =========================================================
// GET PUBLIC DOCUMENTS
//
// GET /api/documents
//
// Only public + published PDFs are returned.
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
    String(
      language
    ).trim()
  ) {

    params.set(
      "language",
      String(
        language
      ).trim()
    );
  }


  if (
    category &&
    String(
      category
    ).trim()
  ) {

    params.set(
      "category",
      String(
        category
      ).trim()
    );
  }


  const response =
    await fetch(
      `${API_URL}/documents?${params.toString()}`,
      {
        method:
          "GET",

        headers:
          getAuthHeaders(),
      }
    );


  return parseResponse(
    response
  );
}


// =========================================================
// GET ONE DOCUMENT
//
// GET /api/documents/<id>
//
// Optional JWT is included when available.
//
// This allows the owner to inspect their own:
// - published PDF
// - draft PDF
// - deleted PDF
//
// Public visitors can only access documents permitted
// by the backend.
// =========================================================

export async function getDocument(
  documentId
) {

  const id =
    normalizeDocumentId(
      documentId
    );


  const response =
    await fetch(
      `${API_URL}/documents/${id}`,
      {
        method:
          "GET",

        headers:
          getAuthHeaders(),
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
//
// status:
//
// active
// published
// draft
// deleted
// all
//
// Default:
// active
//
// active = published + draft
// =========================================================

export async function getMyDocuments({
  status = "active",
  page = 1,
  limit = 50,
} = {}) {

  const token =
    getDocumentToken();


  if (!token) {

    throw new Error(
      "Please log in to view your documents."
    );
  }


  const allowedStatuses =
    new Set([
      "active",
      "published",
      "draft",
      "deleted",
      "all",
    ]);


  const normalizedStatus =
    String(
      status ||
      "active"
    )
      .trim()
      .toLowerCase();


  if (
    !allowedStatuses.has(
      normalizedStatus
    )
  ) {

    throw new Error(
      "Invalid document status filter."
    );
  }


  const params =
    new URLSearchParams();


  params.set(
    "status",
    normalizedStatus
  );


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
          100,
          Number(limit) || 50
        )
      )
    )
  );


  const response =
    await fetch(
      `${API_URL}/documents/mine?${params.toString()}`,
      {
        method:
          "GET",

        headers:
          getAuthHeaders({
            required:
              true,
          }),
      }
    );


  return parseResponse(
    response
  );
}


// =========================================================
// GET ACTIVE DOCUMENTS
//
// Convenience helper.
//
// Includes:
//
// draft
// published
// =========================================================

export async function getMyActiveDocuments({
  page = 1,
  limit = 50,
} = {}) {

  return getMyDocuments({
    status:
      "active",

    page,

    limit,
  });
}


// =========================================================
// GET PUBLISHED DOCUMENTS
// =========================================================

export async function getMyPublishedDocuments({
  page = 1,
  limit = 50,
} = {}) {

  return getMyDocuments({
    status:
      "published",

    page,

    limit,
  });
}


// =========================================================
// GET DRAFT DOCUMENTS
// =========================================================

export async function getMyDraftDocuments({
  page = 1,
  limit = 50,
} = {}) {

  return getMyDocuments({
    status:
      "draft",

    page,

    limit,
  });
}


// =========================================================
// GET DOCUMENT TRASH
//
// GET /api/documents/mine?status=deleted
// =========================================================

export async function getDeletedDocuments({
  page = 1,
  limit = 50,
} = {}) {

  return getMyDocuments({
    status:
      "deleted",

    page,

    limit,
  });
}


// =========================================================
// SOFT DELETE DOCUMENT
//
// DELETE /api/documents/<id>
//
// IMPORTANT:
//
// This does NOT permanently delete the PDF.
//
// Backend changes:
//
// status:
// published/draft -> deleted
//
// previous_status:
// remembers published/draft
//
// deleted_at:
// current deletion date/time
//
// Cloudinary PDF remains available for Restore.
// =========================================================

export async function deleteDocument(
  documentId
) {

  const id =
    normalizeDocumentId(
      documentId
    );


  const response =
    await fetch(
      `${API_URL}/documents/${id}`,
      {
        method:
          "DELETE",

        headers:
          getAuthHeaders({
            required:
              true,
          }),
      }
    );


  return parseResponse(
    response
  );
}


// =========================================================
// ALIAS - MOVE DOCUMENT TO TRASH
// =========================================================

export async function moveDocumentToTrash(
  documentId
) {

  return deleteDocument(
    documentId
  );
}


// =========================================================
// RESTORE DOCUMENT
//
// POST /api/documents/<id>/restore
//
// Restores to:
//
// previous_status = published
//              OR
// previous_status = draft
// =========================================================

export async function restoreDocument(
  documentId
) {

  const id =
    normalizeDocumentId(
      documentId
    );


  const response =
    await fetch(
      `${API_URL}/documents/${id}/restore`,
      {
        method:
          "POST",

        headers:
          getAuthHeaders({
            required:
              true,
          }),
      }
    );


  return parseResponse(
    response
  );
}


// =========================================================
// PERMANENT DELETE DOCUMENT
//
// DELETE /api/documents/<id>/permanent
//
// Backend permits this only when:
//
// status === "deleted"
//
// This removes:
//
// 1. PostgreSQL document row
// 2. Cloudinary PDF asset
//
// This CANNOT be restored.
// =========================================================

export async function permanentlyDeleteDocument(
  documentId
) {

  const id =
    normalizeDocumentId(
      documentId
    );


  const response =
    await fetch(
      `${API_URL}/documents/${id}/permanent`,
      {
        method:
          "DELETE",

        headers:
          getAuthHeaders({
            required:
              true,
          }),
      }
    );


  return parseResponse(
    response
  );
}


// =========================================================
// DOCUMENT API INFORMATION
// =========================================================

export const DOCUMENT_STATUS = {

  ACTIVE:
    "active",

  DRAFT:
    "draft",

  PUBLISHED:
    "published",

  DELETED:
    "deleted",

  ALL:
    "all",
};


// =========================================================
// EXPORT API BASE
//
// Mainly useful for debugging.
// =========================================================

export const DOCUMENT_API_URL =
  `${API_URL}/documents`;