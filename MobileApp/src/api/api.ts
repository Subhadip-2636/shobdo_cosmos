import {
  authFetch,
} from "./auth";

import {
  API_URL,
} from "./config";


// ==========================================================
// RE-EXPORT API URL
// ==========================================================

export {
  API_URL,
};


// ==========================================================
// TYPES
// ==========================================================

export type WritingAuthor = {
  id?: number;
  name?: string;
  email?: string;
};


export type Writing = {
  id: number;

  title: string;

  content: string;

  category?: string;

  language?: string;

  status?: string;

  user_id?: number;

  author?: WritingAuthor;

  user?: WritingAuthor;

  author_name?: string;

  likes_count?: number;

  comments_count?: number;

  created_at?: string;

  updated_at?: string;

  published_at?: string;
};


export type WritingPayload = {
  title: string;
  content: string;
  category?: string;
  language?: string;
};


export type Language = {
  code: string;
  name?: string;
  label?: string;
  native_name?: string;
};


export type OCRFile = {
  uri: string;
  name: string;
  type: string;
};


export type OCRResponse = {
  message?: string;
  text: string;
  filename?: string;
  language?: string;
};


export type LikeResponse = {
  liked?: boolean;
  is_liked?: boolean;
  has_liked?: boolean;

  likes_count?: number;
  count?: number;

  message?: string;
};


export type CommentAuthor = {
  id?: number;
  name?: string;
};


export type Comment = {
  id: number;

  content: string;

  user_id?: number;

  writing_id?: number;

  created_at?: string;

  author?: CommentAuthor;
};


export type CommentsResponse = {
  comments?: Comment[];
  count?: number;
};


export type FollowingFeedResponse = {
  page: number;

  limit: number;

  total: number;

  pages: number;

  has_next: boolean;

  has_prev: boolean;

  writings: Writing[];
};


// ==========================================================
// FOLLOW TYPES
// ==========================================================

export type FollowStatusResponse = {
  following: boolean;
  is_self?: boolean;
  followers_count?: number;
  following_count?: number;
  message?: string;
};


export type FollowActionResponse = {
  following: boolean;
  followers_count?: number;
  following_count?: number;
  message?: string;
};


// ==========================================================
// GENERIC PUBLIC REQUEST
// ==========================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const url =
    `${API_URL}${endpoint}`;


  console.log(
    "API REQUEST:",
    {
      url,
      method:
        options.method || "GET",
    }
  );


  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          ...options.headers,
        },
      }
    );


  console.log(
    "API RESPONSE:",
    {
      url,
      status:
        response.status,
      ok:
        response.ok,
    }
  );


  let data: any = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    console.error(
      "API ERROR RESPONSE:",
      {
        url,
        status:
          response.status,
        data,
      }
    );


    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}.`
    );

  }


  return data as T;
}


// ==========================================================
// GENERIC AUTHENTICATED REQUEST
// ==========================================================

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  console.log(
    "AUTHENTICATED API REQUEST:",
    {
      endpoint,
      method:
        options.method || "GET",
    }
  );


  const response =
    await authFetch(
      endpoint,
      options
    );


  let data: any = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  console.log(
    "AUTHENTICATED API RESPONSE:",
    {
      endpoint,
      status:
        response.status,
      ok:
        response.ok,
    }
  );


  if (!response.ok) {

    console.error(
      "AUTHENTICATED API ERROR:",
      {
        endpoint,
        status:
          response.status,
        data,
      }
    );


    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}.`
    );

  }


  return data as T;
}


// ==========================================================
// NORMALIZE WRITING
// ==========================================================

function normalizeWriting(
  value: any
): Writing {

  return value as Writing;
}


// ==========================================================
// NORMALIZE WRITINGS
// ==========================================================

function normalizeWritings(
  data: any
): Writing[] {

  if (
    Array.isArray(data)
  ) {

    return data.map(
      normalizeWriting
    );

  }


  if (
    Array.isArray(
      data?.writings
    )
  ) {

    return data.writings.map(
      normalizeWriting
    );

  }


  if (
    Array.isArray(
      data?.items
    )
  ) {

    return data.items.map(
      normalizeWriting
    );

  }


  return [];
}


// ==========================================================
// BACKEND HEALTH CHECK
// ==========================================================

export async function checkBackend() {

  return apiRequest<any>(
    "/health"
  );

}


// ==========================================================
// PUBLIC WRITINGS
//
// GET
// /api/writings?page=1&limit=20&search=...
// ==========================================================

export async function getWritings(
  page = 1,
  limit = 20,
  search = ""
): Promise<Writing[]> {

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


  if (search.trim()) {

    params.set(
      "search",
      search.trim()
    );

  }


  const data =
    await apiRequest<any>(
      `/writings?${params.toString()}`
    );


  return normalizeWritings(
    data
  );

}


// ==========================================================
// PUBLIC WRITING DETAILS
//
// GET
// /api/writings/<id>
// ==========================================================

export async function getWriting(
  id: number
): Promise<Writing> {

  if (
    !Number.isFinite(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  const data =
    await apiRequest<any>(
      `/writings/${id}`
    );


  const result =
    data?.writing ??
    data;


  return normalizeWriting(
    result
  );

}


// ==========================================================
// LANGUAGES
//
// GET
// /api/writings/languages
// ==========================================================

export async function getLanguages():
Promise<Language[]> {

  const data =
    await apiRequest<any>(
      "/writings/languages"
    );


  if (
    Array.isArray(data)
  ) {

    return data;

  }


  if (
    Array.isArray(
      data?.languages
    )
  ) {

    return data.languages;

  }


  return [];
}

// ==========================================================
// OCR — EXTRACT TEXT FROM IMAGE / PDF
//
// POST
// /api/writings/ocr
// ==========================================================

export async function extractScannedText(
  file: OCRFile,
  language = "bn"
): Promise<OCRResponse> {

  if (!file?.uri) {

    throw new Error(
      "Please select an image or PDF first."
    );

  }


  const formData =
    new FormData();


  // React Native FormData accepts an object with
  // uri, name and type for file uploads.
  formData.append(
    "document",
    {
      uri:
        file.uri,

      name:
        file.name ||
        "document.jpg",

      type:
        file.type ||
        "image/jpeg",
    } as any
  );


  formData.append(
    "language",
    language
  );


  const data =
    await authenticatedRequest<OCRResponse>(
      "/writings/ocr",
      {
        method:
          "POST",

        body:
          formData,
      }
    );


  if (
    !data?.text ||
    !data.text.trim()
  ) {

    throw new Error(
      "No readable text was found."
    );

  }


  return data;

}


// ==========================================================
// PUBLISH NEW WRITING
//
// POST
// /api/writings
// ==========================================================

export async function publishWriting(
  payload: WritingPayload
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      "/writings",
      {
        method: "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );


  const writing =
    data?.writing ??
    data;


  return normalizeWriting(
    writing
  );

}


// ==========================================================
// SAVE DRAFT
//
// POST
// /api/writings/drafts
// ==========================================================

export async function saveDraft(
  payload: WritingPayload
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      "/writings/drafts",
      {
        method: "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );


  const writing =
    data?.writing ??
    data;


  return normalizeWriting(
    writing
  );

}


// ==========================================================
// MY WRITINGS
//
// GET
// /api/writings/mine
//
// Optional:
// ?status=draft
// ?status=published
// ==========================================================

export async function getMyWritings(
  status = ""
): Promise<Writing[]> {

  const params =
    new URLSearchParams();


  if (
    status.trim()
  ) {

    params.set(
      "status",
      status.trim()
    );

  }


  const query =
    params.toString();


  const endpoint =
    query
      ? `/writings/mine?${query}`
      : "/writings/mine";


  const data =
    await authenticatedRequest<any>(
      endpoint,
      {
        method: "GET",
      }
    );


  return normalizeWritings(
    data
  );

}


// ==========================================================
// MY WRITING DETAILS
//
// GET
// /api/writings/mine/<id>
// ==========================================================

export async function getMyWriting(
  id: number
): Promise<Writing> {

  if (
    !Number.isFinite(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  const data =
    await authenticatedRequest<any>(
      `/writings/mine/${id}`,
      {
        method: "GET",
      }
    );


  return normalizeWriting(
    data?.writing ??
    data
  );

}


// ==========================================================
// UPDATE WRITING
//
// PUT
// /api/writings/<id>
// ==========================================================

export async function updateWriting(
  id: number,
  payload: Partial<WritingPayload>
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      `/writings/${id}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            payload
          ),
      }
    );


  return normalizeWriting(
    data?.writing ??
    data
  );

}


// ==========================================================
// PUBLISH EXISTING DRAFT
//
// POST
// /api/writings/<id>/publish
// ==========================================================

export async function publishExistingWriting(
  id: number
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      `/writings/${id}/publish`,
      {
        method: "POST",
      }
    );


  return normalizeWriting(
    data?.writing ??
    data
  );

}


// ==========================================================
// UNPUBLISH WRITING
//
// POST
// /api/writings/<id>/unpublish
// ==========================================================

export async function unpublishWriting(
  id: number
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      `/writings/${id}/unpublish`,
      {
        method: "POST",
      }
    );


  return normalizeWriting(
    data?.writing ??
    data
  );

}

// =========================================================
// RESTORE WRITING FROM TRASH
// =========================================================

export async function restoreWriting(
  writingId: number
): Promise<Writing> {

  const data =
    await authenticatedRequest<any>(
      `/writings/${writingId}/restore`,
      {
        method: "POST",
      }
    );

  const writing =
    data?.writing ?? data;

  return normalizeWriting(
    writing
  );
}


// =========================================================
// PERMANENTLY DELETE WRITING
// =========================================================

export async function permanentlyDeleteWriting(
  writingId: number
): Promise<void> {

  await authenticatedRequest(
    `/writings/${writingId}/permanent`,
    {
      method: "DELETE",
    }
  );

}


// ==========================================================
// DELETE WRITING
//
// DELETE
// /api/writings/<id>
// ==========================================================

export async function deleteWriting(
  id: number
): Promise<any> {

  if (
    !Number.isFinite(id) ||
    id <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return authenticatedRequest<any>(
    `/writings/${id}`,
    {
      method: "DELETE",
    }
  );

}


// ==========================================================
// PUBLIC LIKE COUNT
//
// GET
// /api/likes/writing/<writing_id>
// ==========================================================

export async function getWritingLikes(
  writingId: number
): Promise<LikeResponse> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return apiRequest<LikeResponse>(
    `/likes/writing/${writingId}`
  );

}


// ==========================================================
// CURRENT USER LIKE STATUS
//
// GET
// /api/likes/writing/<writing_id>/me
// ==========================================================

export async function getMyLikeStatus(
  writingId: number
): Promise<LikeResponse> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return authenticatedRequest<LikeResponse>(
    `/likes/writing/${writingId}/me`,
    {
      method: "GET",
    }
  );

}


// ==========================================================
// LIKE WRITING
//
// POST
// /api/likes/writing/<writing_id>
// ==========================================================

export async function likeWriting(
  writingId: number
): Promise<LikeResponse> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return authenticatedRequest<LikeResponse>(
    `/likes/writing/${writingId}`,
    {
      method: "POST",
    }
  );

}


// ==========================================================
// UNLIKE WRITING
//
// DELETE
// /api/likes/writing/<writing_id>
// ==========================================================

export async function unlikeWriting(
  writingId: number
): Promise<LikeResponse> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return authenticatedRequest<LikeResponse>(
    `/likes/writing/${writingId}`,
    {
      method: "DELETE",
    }
  );

}


// ==========================================================
// GET COMMENTS
//
// GET
// /api/comments/writing/<writing_id>
// ==========================================================

export async function getComments(
  writingId: number
): Promise<
  CommentsResponse | Comment[]
> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  return apiRequest<
    CommentsResponse | Comment[]
  >(
    `/comments/writing/${writingId}`
  );

}


// ==========================================================
// ADD COMMENT
//
// POST
// /api/comments/writing/<writing_id>
// ==========================================================

export async function addComment(
  writingId: number,
  content: string
): Promise<Comment> {

  if (
    !Number.isFinite(writingId) ||
    writingId <= 0
  ) {

    throw new Error(
      "Invalid writing ID."
    );

  }


  const trimmedContent =
    content.trim();


  if (!trimmedContent) {

    throw new Error(
      "Comment cannot be empty."
    );

  }


  const data =
    await authenticatedRequest<any>(
      `/comments/writing/${writingId}`,
      {
        method: "POST",

        body:
          JSON.stringify({
            content:
              trimmedContent,
          }),
      }
    );


  return (
    data?.comment ??
    data
  ) as Comment;

}


// ==========================================================
// DELETE COMMENT
//
// DELETE
// /api/comments/<comment_id>
// ==========================================================

export async function deleteComment(
  commentId: number
): Promise<any> {

  if (
    !Number.isFinite(commentId) ||
    commentId <= 0
  ) {

    throw new Error(
      "Invalid comment ID."
    );

  }


  return authenticatedRequest<any>(
    `/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );

}


// ==========================================================
// FOLLOWING FEED
//
// GET
// /api/users/me/following-feed?page=1&limit=20
//
// Requires JWT.
// ==========================================================

export async function getFollowingFeed(
  page = 1,
  limit = 20
): Promise<FollowingFeedResponse> {

  const safePage =
    Math.max(
      1,
      Number(page) || 1
    );


  const safeLimit =
    Math.max(
      1,
      Math.min(
        50,
        Number(limit) || 20
      )
    );


  const data =
    await authenticatedRequest<any>(
      `/users/me/following-feed?page=${safePage}&limit=${safeLimit}`,
      {
        method: "GET",
      }
    );


  return {

    page:
      Number(
        data?.page ??
        safePage
      ),

    limit:
      Number(
        data?.limit ??
        safeLimit
      ),

    total:
      Number(
        data?.total ??
        0
      ),

    pages:
      Number(
        data?.pages ??
        0
      ),

    has_next:
      Boolean(
        data?.has_next
      ),

    has_prev:
      Boolean(
        data?.has_prev
      ),

    writings:
      normalizeWritings(
        data
      ),

  };

}

// ==========================================================
// FOLLOW STATUS
//
// GET
// /api/users/<user_id>/follow-status
//
// Requires JWT.
// ==========================================================

export async function getFollowStatus(
  userId: number
): Promise<FollowStatusResponse> {

  if (
    !Number.isFinite(userId) ||
    userId <= 0
  ) {

    throw new Error(
      "Invalid user ID."
    );

  }


  return authenticatedRequest<FollowStatusResponse>(
    `/users/${userId}/follow-status`,
    {
      method: "GET",
    }
  );

}


// ==========================================================
// FOLLOW WRITER
//
// POST
// /api/users/<user_id>/follow
//
// Requires JWT.
// ==========================================================

export async function followUser(
  userId: number
): Promise<FollowActionResponse> {

  if (
    !Number.isFinite(userId) ||
    userId <= 0
  ) {

    throw new Error(
      "Invalid user ID."
    );

  }


  return authenticatedRequest<FollowActionResponse>(
    `/users/${userId}/follow`,
    {
      method: "POST",
    }
  );

}


// ==========================================================
// UNFOLLOW WRITER
//
// DELETE
// /api/users/<user_id>/follow
//
// Requires JWT.
// ==========================================================

export async function unfollowUser(
  userId: number
): Promise<FollowActionResponse> {

  if (
    !Number.isFinite(userId) ||
    userId <= 0
  ) {

    throw new Error(
      "Invalid user ID."
    );

  }


  return authenticatedRequest<FollowActionResponse>(
    `/users/${userId}/follow`,
    {
      method: "DELETE",
    }
  );

}