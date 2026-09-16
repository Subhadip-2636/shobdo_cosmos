// =========================================================
// SHOBDO - ARTWORK API
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

function getArtworkToken() {

  return (
    localStorage.getItem(
      "shobdo_token"
    ) ||
    ""
  );
}


// =========================================================
// NORMALIZE ARTWORK ID
// =========================================================

function normalizeArtworkId(
  artworkId
) {

  const id =
    Number(
      artworkId
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid artwork ID."
    );
  }


  return id;
}


// =========================================================
// AUTH HEADERS
// =========================================================

function getAuthHeaders({
  required = false,
} = {}) {

  const token =
    getArtworkToken();


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
// RESPONSE PARSER
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
      "ARTWORK RESPONSE PARSE ERROR:",
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
            ? "You do not have permission to perform this artwork action."
            : response.status === 404
              ? "Artwork was not found."
              : `Artwork request failed with status ${response.status}.`
      );


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
// PUBLIC ARTWORKS
//
// GET /api/artworks
//
// Only:
// published + public
// =========================================================

export async function getArtworks({
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
      `${API_URL}/artworks?${params.toString()}`,
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
// SINGLE ARTWORK
//
// GET /api/artworks/<id>
//
// Optional JWT is sent when available.
//
// Owner can inspect:
// - published
// - draft
// - deleted
//
// Public users are still restricted by backend.
// =========================================================

export async function getArtwork(
  artworkId
) {

  const id =
    normalizeArtworkId(
      artworkId
    );


  const response =
    await fetch(
      `${API_URL}/artworks/${id}`,
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
// CURRENT USER ARTWORKS
//
// GET /api/artworks/mine
//
// Supported status:
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
// active = draft + published
// =========================================================

export async function getMyArtworks({
  status = "active",
  page = 1,
  limit = 50,
} = {}) {

  const token =
    getArtworkToken();


  if (!token) {

    throw new Error(
      "Please log in to view your artwork."
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
      "Invalid artwork status filter."
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
      `${API_URL}/artworks/mine?${params.toString()}`,
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
// GET ACTIVE ARTWORK
//
// active = draft + published
// =========================================================

export async function getMyActiveArtworks({
  page = 1,
  limit = 50,
} = {}) {

  return getMyArtworks({
    status:
      "active",

    page,

    limit,
  });
}


// =========================================================
// GET PUBLISHED ARTWORK
// =========================================================

export async function getMyPublishedArtworks({
  page = 1,
  limit = 50,
} = {}) {

  return getMyArtworks({
    status:
      "published",

    page,

    limit,
  });
}


// =========================================================
// GET DRAFT ARTWORK
// =========================================================

export async function getMyDraftArtworks({
  page = 1,
  limit = 50,
} = {}) {

  return getMyArtworks({
    status:
      "draft",

    page,

    limit,
  });
}


// =========================================================
// GET ARTWORK TRASH
//
// GET /api/artworks/mine?status=deleted
// =========================================================

export async function getDeletedArtworks({
  page = 1,
  limit = 50,
} = {}) {

  return getMyArtworks({
    status:
      "deleted",

    page,

    limit,
  });
}


// =========================================================
// SOFT DELETE ARTWORK
//
// DELETE /api/artworks/<id>
//
// IMPORTANT:
//
// This moves Artwork to Trash.
//
// Backend changes:
//
// status:
// draft/published -> deleted
//
// previous_status:
// remembers previous state
//
// deleted_at:
// stores deletion date/time
//
// Cloudinary image remains available for Restore.
// =========================================================

export async function deleteArtwork(
  artworkId
) {

  const id =
    normalizeArtworkId(
      artworkId
    );


  const response =
    await fetch(
      `${API_URL}/artworks/${id}`,
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
// ALIAS - MOVE ARTWORK TO TRASH
// =========================================================

export async function moveArtworkToTrash(
  artworkId
) {

  return deleteArtwork(
    artworkId
  );
}


// =========================================================
// RESTORE ARTWORK
//
// POST /api/artworks/<id>/restore
//
// Restores:
//
// previous_status = published
//              OR
// previous_status = draft
// =========================================================

export async function restoreArtwork(
  artworkId
) {

  const id =
    normalizeArtworkId(
      artworkId
    );


  const response =
    await fetch(
      `${API_URL}/artworks/${id}/restore`,
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
// PERMANENT DELETE ARTWORK
//
// DELETE /api/artworks/<id>/permanent
//
// Backend only allows this when:
//
// status === "deleted"
//
// Permanent deletion removes:
//
// 1. PostgreSQL artwork record
// 2. Cloudinary artwork image
//
// Cannot be restored.
// =========================================================

export async function permanentlyDeleteArtwork(
  artworkId
) {

  const id =
    normalizeArtworkId(
      artworkId
    );


  const response =
    await fetch(
      `${API_URL}/artworks/${id}/permanent`,
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
// STATUS CONSTANTS
// =========================================================

export const ARTWORK_STATUS = {

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
// API URL
//
// Useful for debugging.
// =========================================================

export const ARTWORK_API_URL =
  `${API_URL}/artworks`;