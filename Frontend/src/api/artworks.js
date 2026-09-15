// =========================================================
// SHOBDO - ARTWORK API
// =========================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const CLEAN_API_URL =
  RAW_API_URL
    .trim()
    .replace(/\/+$/, "");


const API_URL =
  CLEAN_API_URL.endsWith("/api")
    ? CLEAN_API_URL
    : `${CLEAN_API_URL}/api`;


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


  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Artwork request failed with status ${response.status}.`
    );
  }


  return data;
}


// =========================================================
// GET PUBLIC ARTWORKS
//
// GET /api/artworks
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
      `${API_URL}/artworks?${params.toString()}`,
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
// GET ONE PUBLIC ARTWORK
//
// GET /api/artworks/<id>
// =========================================================

export async function getArtwork(
  artworkId
) {

  const id =
    Number(
      artworkId
    );


  if (
    !Number.isFinite(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid artwork ID."
    );
  }


  const response =
    await fetch(
      `${API_URL}/artworks/${id}`,
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