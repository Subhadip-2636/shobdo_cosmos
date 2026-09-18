// =========================================================
// SHOBDO API CONFIGURATION
// =========================================================

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000"
).replace(/\/+$/, "");


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// TOKEN HELPERS
// =========================================================

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}


export function saveToken(
  token
) {
  if (!token) {
    return;
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}


export function removeToken() {
  localStorage.removeItem(
    TOKEN_KEY
  );
}


// =========================================================
// BUILD REQUEST HEADERS
// =========================================================

function buildHeaders({
  customHeaders = {},
  isFormData = false,
} = {}) {

  const token =
    getToken();


  const headers = {
    ...customHeaders,
  };


  // IMPORTANT:
  // Never manually set Content-Type for FormData.
  // The browser automatically adds the multipart boundary.

  if (!isFormData) {
    headers["Content-Type"] =
      "application/json";
  }


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

  if (
    response.status === 204
  ) {
    return null;
  }


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  let data = {};


  try {

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const responseText =
        await response.text();


      data =
        responseText
          ? {
              message:
                responseText,
            }
          : {};
    }

  } catch {

    data = {};

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
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
// GENERAL API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  const {
    method = "GET",
    body,
    customHeaders = {},
    isFormData = false,
    signal,
  } = options;


  let requestBody =
    body;


  if (
    body !== undefined &&
    body !== null &&
    !isFormData
  ) {

    requestBody =
      JSON.stringify(
        body
      );
  }


  try {

    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          method,

          headers:
            buildHeaders({
              customHeaders,
              isFormData,
            }),

          body:
            requestBody,

          signal,
        }
      );


    return await parseResponse(
      response
    );

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {
      throw error;
    }


    // Usually backend unavailable,
    // network error, or CORS problem.

    if (
      error instanceof TypeError
    ) {

      throw new Error(
        "Backend server-এর সঙ্গে সংযোগ করা যাচ্ছে না। Backend চালু আছে কি না পরীক্ষা করুন।"
      );
    }


    throw error;
  }
}


// =========================================================
// QUERY STRING HELPER
// =========================================================

function createQueryString(
  parameters = {}
) {

  const searchParams =
    new URLSearchParams();


  Object.entries(
    parameters
  ).forEach(
    ([key, value]) => {

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }


      searchParams.set(
        key,
        String(
          value
        )
      );
    }
  );


  const queryString =
    searchParams.toString();


  return queryString
    ? `?${queryString}`
    : "";
}


// =========================================================
// GET ALL WRITINGS
// =========================================================

export async function getWritings(
  parameters = {}
) {

  const queryString =
    createQueryString(
      parameters
    );


  return apiRequest(
    `/api/writings${queryString}`
  );
}


// =========================================================
// GET ONE WRITING
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
    `/api/writings/${writingId}`
  );
}


// =========================================================
// COMPATIBILITY EXPORT
// =========================================================

export const getWritingById =
  getWriting;


// =========================================================
// GET CURRENT USER WRITINGS
// =========================================================

export async function getMyWritings(
  parameters = {}
) {

  const queryString =
    createQueryString(
      parameters
    );


  return apiRequest(
    `/api/writings/mine${queryString}`
  );
}


// =========================================================
// CREATE DRAFT
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

      body: {
        title,
        content,
        category,
        language,
      },
    }
  );
}


// =========================================================
// CREATE WRITING
// =========================================================

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

      body: {

        title:
          writingData.title
            ?.trim(),

        content:
          writingData.content
            ?.trim(),

        category:
          writingData.category,

        language:
          writingData.language ||
          "bn",

        status:
          writingData.status,

        is_published:
          writingData.is_published,
      },
    }
  );
}


// =========================================================
// UPDATE WRITING
// =========================================================

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
      method: "PATCH",
      body:
        writingData,
    }
  );
}


// =========================================================
// DELETE WRITING
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
// RESTORE WRITING
// =========================================================

export async function restoreWriting(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/writings/${writingId}/restore`,
    {
      method: "POST",
    }
  );
}


// =========================================================
// PERMANENTLY DELETE WRITING
// =========================================================

export async function permanentlyDeleteWriting(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/writings/${writingId}/permanent`,
    {
      method: "DELETE",
    }
  );
}


// =========================================================
// PUBLISH WRITING
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
// UNPUBLISH WRITING
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
// LIKE WRITING
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
// UNLIKE WRITING
// =========================================================

export async function unlikeWriting(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  // Backend currently uses
  // the same endpoint as a toggle.

  return likeWriting(
    writingId
  );
}


// =========================================================
// COMPATIBILITY LIKE EXPORT
// =========================================================

export const toggleLike =
  likeWriting;


// =========================================================
// GET WRITING LIKE COUNT
// =========================================================

export async function getWritingLikes(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  const writing =
    await getWriting(
      writingId
    );


  const likesCount =
    Number(
      writing?.likes_count ??
      writing?.likes ??
      0
    );


  return {
    likes:
      likesCount,

    likes_count:
      likesCount,

    count:
      likesCount,

    total:
      likesCount,
  };
}


// =========================================================
// GET CURRENT USER LIKE STATUS
// =========================================================

export async function getMyLikeStatus(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  const writing =
    await getWriting(
      writingId
    );


  const liked =
    Boolean(
      writing?.is_liked ??
      writing?.liked ??
      false
    );


  return {
    liked,

    is_liked:
      liked,
  };
}


// =========================================================
// COMMENTS
// =========================================================


// =========================================================
// GET COMMENTS FOR WRITING
// =========================================================

export async function getComments(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/comments/writing/${writingId}`
  );
}


// =========================================================
// CREATE COMMENT OR REPLY
// =========================================================

export async function createComment(
  writingId,
  content,
  parentId = null
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  const commentContent =
    typeof content ===
      "string"
      ? content.trim()
      : content?.content
          ?.trim();


  if (!commentContent) {
    throw new Error(
      "Comment cannot be empty."
    );
  }


  const body = {
    content:
      commentContent,
  };


  if (
    parentId !== null &&
    parentId !== undefined &&
    parentId !== ""
  ) {

    const normalizedParentId =
      Number(
        parentId
      );


    if (
      !Number.isInteger(
        normalizedParentId
      ) ||
      normalizedParentId <= 0
    ) {

      throw new Error(
        "Valid parent comment ID is required."
      );
    }


    body.parent_id =
      normalizedParentId;
  }


  return apiRequest(
    `/api/comments/writing/${writingId}`,
    {
      method: "POST",
      body,
    }
  );
}


// =========================================================
// ADD NORMAL COMMENT
// =========================================================

export async function addComment(
  writingId,
  content
) {

  return createComment(
    writingId,
    content,
    null
  );
}


// =========================================================
// REPLY TO COMMENT
// =========================================================

export async function replyToComment(
  writingId,
  parentCommentId,
  content
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  if (!parentCommentId) {
    throw new Error(
      "Parent comment ID is required."
    );
  }


  return createComment(
    writingId,
    content,
    parentCommentId
  );
}


// =========================================================
// UPDATE COMMENT
// =========================================================

export async function updateComment(
  commentId,
  content
) {

  if (!commentId) {
    throw new Error(
      "Comment ID is required."
    );
  }


  const normalizedContent =
    String(
      content || ""
    ).trim();


  if (!normalizedContent) {
    throw new Error(
      "Comment cannot be empty."
    );
  }


  return apiRequest(
    `/api/comments/${commentId}`,
    {
      method: "PATCH",

      body: {
        content:
          normalizedContent,
      },
    }
  );
}


// =========================================================
// DELETE COMMENT
// =========================================================

export async function deleteComment(
  commentId
) {

  if (!commentId) {
    throw new Error(
      "Comment ID is required."
    );
  }


  return apiRequest(
    `/api/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );
}


// =========================================================
// OCR FILE VALIDATION
// =========================================================

function validateOcrFile(
  file
) {

  if (
    !(file instanceof File)
  ) {

    throw new Error(
      "Please select a valid PDF, JPG or PNG file."
    );
  }


  const maximumFileSize =
    10 * 1024 * 1024;


  if (
    file.size >
    maximumFileSize
  ) {

    throw new Error(
      "File size cannot exceed 10 MB."
    );
  }


  if (
    file.size === 0
  ) {

    throw new Error(
      "The selected file is empty."
    );
  }


  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];


  const allowedExtensions = [
    "pdf",
    "jpg",
    "jpeg",
    "png",
  ];


  const fileExtension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();


  const validMimeType =
    allowedTypes.includes(
      file.type
    );


  const validExtension =
    allowedExtensions.includes(
      fileExtension
    );


  if (
    !validMimeType &&
    !validExtension
  ) {

    throw new Error(
      "Only PDF, JPG, JPEG and PNG files are supported."
    );
  }
}


// =========================================================
// EXTRACT TEXT FROM SCANNED FILE
// =========================================================

export async function extractScannedText(
  file,
  language = "bn"
) {

  validateOcrFile(
    file
  );


  const supportedLanguages = [
    "bn",
    "en",
    "hi",
  ];


  const selectedLanguage =
    supportedLanguages.includes(
      language
    )
      ? language
      : "bn";


  const formData =
    new FormData();


  formData.append(
    "document",
    file
  );


  formData.append(
    "language",
    selectedLanguage
  );


  return apiRequest(
    "/api/writings/ocr",
    {
      method: "POST",

      body:
        formData,

      isFormData:
        true,
    }
  );
}


// =========================================================
// OCR COMPATIBILITY EXPORTS
// =========================================================

export const scanWriting =
  extractScannedText;


export const extractTextFromFile =
  extractScannedText;


// =========================================================
// API HEALTH CHECK
// =========================================================

export async function checkApiHealth() {
  return apiRequest(
    "/api/health"
  );
}


// =========================================================
// VALIDATE USER ID
// =========================================================

function validateUserId(
  userId
) {

  const id =
    Number(
      userId
    );


  if (
    !Number.isFinite(
      id
    ) ||
    id <= 0
  ) {

    throw new Error(
      "Valid user ID is required."
    );
  }


  return id;
}


// =========================================================
// UPDATE CURRENT USER PROFILE
//
// PATCH /api/users/me/profile
// =========================================================

export async function updateMyProfile(
  profileData
) {

  if (
    !profileData ||
    typeof profileData !==
      "object" ||
    Array.isArray(
      profileData
    )
  ) {

    throw new Error(
      "Invalid profile data."
    );
  }


  return apiRequest(
    "/api/users/me/profile",
    {
      method: "PATCH",

      body:
        profileData,
    }
  );
}


// =========================================================
// PROFILE AVATAR VALIDATION
// =========================================================

export function validateProfileAvatar(
  file
) {

  if (
    !(file instanceof File)
  ) {

    throw new Error(
      "Please select a valid profile image."
    );
  }


  const maximumFileSize =
    5 * 1024 * 1024;


  if (
    file.size === 0
  ) {

    throw new Error(
      "The selected image is empty."
    );
  }


  if (
    file.size >
    maximumFileSize
  ) {

    throw new Error(
      "Profile image cannot exceed 5 MB."
    );
  }


  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];


  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
  ];


  const fileExtension =
    file.name
      ?.split(".")
      .pop()
      ?.toLowerCase();


  const validMimeType =
    allowedTypes.includes(
      file.type
    );


  const validExtension =
    allowedExtensions.includes(
      fileExtension
    );


  if (
    !validMimeType &&
    !validExtension
  ) {

    throw new Error(
      "Only JPG, JPEG, PNG and WEBP profile images are supported."
    );
  }


  return true;
}


// =========================================================
// UPLOAD CURRENT USER PROFILE AVATAR
//
// POST /api/users/me/avatar
//
// multipart/form-data
// field: avatar
// =========================================================

export async function uploadMyProfileAvatar(
  file
) {

  validateProfileAvatar(
    file
  );


  const formData =
    new FormData();


  formData.append(
    "avatar",
    file
  );


  return apiRequest(
    "/api/users/me/avatar",
    {
      method: "POST",

      body:
        formData,

      isFormData:
        true,
    }
  );
}


// =========================================================
// REMOVE CURRENT USER PROFILE AVATAR
//
// DELETE /api/users/me/avatar
// =========================================================

export async function removeMyProfileAvatar() {

  return apiRequest(
    "/api/users/me/avatar",
    {
      method: "DELETE",
    }
  );
}


// =========================================================
// PROFILE AVATAR COMPATIBILITY EXPORTS
// =========================================================

export const uploadProfileAvatar =
  uploadMyProfileAvatar;


export const removeProfileAvatar =
  removeMyProfileAvatar;


// =========================================================
// GET PUBLIC WRITER PROFILE
//
// GET /api/users/<user_id>
// =========================================================

export async function getWriterProfile(
  userId
) {

  const id =
    validateUserId(
      userId
    );


  return apiRequest(
    `/api/users/${id}`
  );
}


// =========================================================
// GET WRITER WRITINGS
//
// GET /api/users/<user_id>/writings
// =========================================================

export async function getWriterWritings(
  userId
) {

  const id =
    validateUserId(
      userId
    );


  return apiRequest(
    `/api/users/${id}/writings`
  );
}


// =========================================================
// GET FOLLOW STATUS
//
// GET /api/users/<user_id>/follow-status
// =========================================================

export async function getFollowStatus(
  userId
) {

  const id =
    validateUserId(
      userId
    );


  return apiRequest(
    `/api/users/${id}/follow-status`
  );
}


// =========================================================
// FOLLOW USER
//
// POST /api/users/<user_id>/follow
// =========================================================

export async function followUser(
  userId
) {

  const id =
    validateUserId(
      userId
    );


  return apiRequest(
    `/api/users/${id}/follow`,
    {
      method: "POST",
    }
  );
}


// =========================================================
// UNFOLLOW USER
//
// DELETE /api/users/<user_id>/follow
// =========================================================

export async function unfollowUser(
  userId
) {

  const id =
    validateUserId(
      userId
    );


  return apiRequest(
    `/api/users/${id}/follow`,
    {
      method: "DELETE",
    }
  );
}


// =========================================================
// GET FOLLOWING FEED
//
// GET /api/users/me/following-feed
// =========================================================

export async function getFollowingFeed({
  page = 1,
  limit = 20,
} = {}) {

  const queryString =
    createQueryString({
      page,
      limit,
    });


  return apiRequest(
    `/api/users/me/following-feed${queryString}`
  );
}


// =========================================================
// GET USER FOLLOWERS
//
// GET /api/users/<user_id>/followers
// =========================================================

export async function getUserFollowers(
  userId,
  {
    page = 1,
    limit = 20,
  } = {}
) {

  const id =
    validateUserId(
      userId
    );


  const queryString =
    createQueryString({
      page,
      limit,
    });


  return apiRequest(
    `/api/users/${id}/followers${queryString}`
  );
}


// =========================================================
// GET USER FOLLOWING
//
// GET /api/users/<user_id>/following
// =========================================================

export async function getUserFollowing(
  userId,
  {
    page = 1,
    limit = 20,
  } = {}
) {

  const id =
    validateUserId(
      userId
    );


  const queryString =
    createQueryString({
      page,
      limit,
    });


  return apiRequest(
    `/api/users/${id}/following${queryString}`
  );
}


// =========================================================
// SAVE / BOOKMARK WRITING
//
// POST /api/saved/writing/<writing_id>
// =========================================================

export async function saveWriting(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/saved/writing/${writingId}`,
    {
      method: "POST",
    }
  );
}


// =========================================================
// UNSAVE WRITING
//
// DELETE /api/saved/writing/<writing_id>
// =========================================================

export async function unsaveWriting(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/saved/writing/${writingId}`,
    {
      method: "DELETE",
    }
  );
}


// =========================================================
// GET SAVED STATUS
//
// GET /api/saved/writing/<writing_id>/status
// =========================================================

export async function getSavedWritingStatus(
  writingId
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/saved/writing/${writingId}/status`
  );
}


// =========================================================
// GET CURRENT USER SAVED WRITINGS
//
// GET /api/saved
// =========================================================

export async function getSavedWritings({
  page = 1,
  perPage = 20,
} = {}) {

  const queryString =
    createQueryString({
      page,

      per_page:
        perPage,
    });


  return apiRequest(
    `/api/saved${queryString}`
  );
}


// =========================================================
// TOGGLE SAVED WRITING
// =========================================================

export async function toggleSavedWriting(
  writingId,
  currentlySaved = false
) {

  if (!writingId) {
    throw new Error(
      "Writing ID is required."
    );
  }


  if (
    currentlySaved
  ) {

    return unsaveWriting(
      writingId
    );
  }


  return saveWriting(
    writingId
  );
}


// =========================================================
// DEFAULT EXPORT
// =========================================================

const writingApi = {

  // -------------------------------------------------------
  // CONFIG / TOKEN
  // -------------------------------------------------------

  API_URL,

  getToken,

  saveToken,

  removeToken,


  // -------------------------------------------------------
  // WRITINGS
  // -------------------------------------------------------

  getWritings,

  getWriting,

  getWritingById,

  getMyWritings,

  createDraft,

  createWriting,

  updateWriting,

  deleteWriting,

  restoreWriting,

  permanentlyDeleteWriting,

  publishWriting,

  unpublishWriting,


  // -------------------------------------------------------
  // LIKES
  // -------------------------------------------------------

  likeWriting,

  unlikeWriting,

  toggleLike,

  getWritingLikes,

  getMyLikeStatus,


  // -------------------------------------------------------
  // SAVED / BOOKMARKS
  // -------------------------------------------------------

  saveWriting,

  unsaveWriting,

  getSavedWritingStatus,

  getSavedWritings,

  toggleSavedWriting,


  // -------------------------------------------------------
  // COMMENTS / THREADED REPLIES
  // -------------------------------------------------------

  getComments,

  createComment,

  addComment,

  replyToComment,

  updateComment,

  deleteComment,


  // -------------------------------------------------------
  // OCR
  // -------------------------------------------------------

  extractScannedText,

  scanWriting,

  extractTextFromFile,


  // -------------------------------------------------------
  // PROFILE
  // -------------------------------------------------------

  updateMyProfile,

  validateProfileAvatar,

  uploadMyProfileAvatar,

  removeMyProfileAvatar,

  uploadProfileAvatar,

  removeProfileAvatar,

  getWriterProfile,

  getWriterWritings,


  // -------------------------------------------------------
  // FOLLOW SYSTEM
  // -------------------------------------------------------

  getFollowStatus,

  followUser,

  unfollowUser,

  getFollowingFeed,

  getUserFollowers,

  getUserFollowing,


  // -------------------------------------------------------
  // HEALTH
  // -------------------------------------------------------

  checkApiHealth,
};


export default writingApi;