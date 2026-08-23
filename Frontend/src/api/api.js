// ============================================================
// SHOBDO API
// Writing / Explore / Like / Draft API
// Vite + React + Flask
// ============================================================


// ============================================================
// BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";

// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(
  endpoint,
  options = {}
) {
  try {

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          ...(options.headers || {}),
        },

        // Important for Flask authentication
        credentials: "include",
      }
    );


    // --------------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------------

    let data = null;

    const contentType =
      response.headers.get("content-type");


    if (
      contentType &&
      contentType.includes("application/json")
    ) {

      data = await response.json();

    } else {

      const text =
        await response.text();

      data = text
        ? { message: text }
        : null;

    }


    // --------------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------------

    if (!response.ok) {

      const errorMessage =
        data?.message ||
        data?.error ||
        data?.msg ||
        `Request failed with status ${response.status}`;


      throw new Error(
        errorMessage
      );

    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return data;

  } catch (error) {

    console.error(
      `API Error [${endpoint}]:`,
      error
    );


    throw error;

  }
}


// ============================================================
// GET ALL WRITINGS
// ============================================================

export async function getWritings({
  search = "",
  category = "",
  limit = 12,
  page = 1,
} = {}) {

  const params =
    new URLSearchParams();


  if (search.trim()) {

    params.append(
      "search",
      search.trim()
    );

  }


  if (category.trim()) {

    params.append(
      "category",
      category.trim()
    );

  }


  params.append(
    "limit",
    String(limit)
  );


  params.append(
    "page",
    String(page)
  );


  const query =
    params.toString();


  return apiRequest(
    `/api/writings${
      query
        ? `?${query}`
        : ""
    }`
  );
}


// ============================================================
// GET SINGLE WRITING
// ============================================================

export async function getWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}`
  );
}


// ============================================================
// CREATE WRITING
// ============================================================

export async function createWriting(
  writingData
) {

  if (!writingData) {

    throw new Error(
      "Writing data is required."
    );

  }


  return apiRequest(
    "/api/writings",
    {
      method: "POST",

      body: JSON.stringify(
        writingData
      ),
    }
  );
}


// ============================================================
// UPDATE WRITING
// ============================================================

export async function updateWriting(
  writingId,
  writingData
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );

  }


  if (!writingData) {

    throw new Error(
      "Writing data is required."
    );

  }


  return apiRequest(
    `/api/writings/${writingId}`,
    {
      method: "PUT",

      body: JSON.stringify(
        writingData
      ),
    }
  );
}


// ============================================================
// DELETE WRITING
// ============================================================

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


// ============================================================
// LIKE WRITING
// ============================================================

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


// ============================================================
// UNLIKE WRITING
// ============================================================

export async function unlikeWriting(
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
      method: "DELETE",
    }
  );
}


// ============================================================
// GET MY WRITINGS
// ============================================================

export async function getMyWritings({
  status = "",
  limit = 12,
  page = 1,
} = {}) {

  const params =
    new URLSearchParams();


  if (status.trim()) {

    params.append(
      "status",
      status.trim()
    );

  }


  params.append(
    "limit",
    String(limit)
  );


  params.append(
    "page",
    String(page)
  );


  return apiRequest(
    `/api/writings/my?${params.toString()}`
  );
}


// ============================================================
// SAVE DRAFT
// ============================================================

export async function saveDraft(
  writingData
) {

  if (!writingData) {

    throw new Error(
      "Draft data is required."
    );

  }


  return apiRequest(
    "/api/writings/draft",
    {
      method: "POST",

      body: JSON.stringify({
        ...writingData,

        status: "draft",
      }),
    }
  );
}


// ============================================================
// GET DRAFTS
// ============================================================

export async function getDrafts({
  limit = 12,
  page = 1,
} = {}) {

  const params =
    new URLSearchParams({

      limit: String(limit),

      page: String(page),

    });


  return apiRequest(
    `/api/writings/drafts?${params.toString()}`
  );
}


// ============================================================
// SEARCH WRITINGS
// ============================================================

export async function searchWritings(
  query,
  options = {}
) {

  return getWritings({
    ...options,
    search: query || "",
  });

}


// ============================================================
// API HEALTH CHECK
// ============================================================

export async function checkApiHealth() {

  return apiRequest(
    "/api/health"
  );

}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const api = {

  getWritings,

  getWriting,

  createWriting,

  updateWriting,

  deleteWriting,

  likeWriting,

  unlikeWriting,

  getMyWritings,

  saveDraft,

  getDrafts,

  searchWritings,

  checkApiHealth,

};


export default api;