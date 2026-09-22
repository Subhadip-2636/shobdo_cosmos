// =========================================================
// SHOBDO API CONFIGURATION
// =========================================================

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000"
).replace(/\/+$/, "");

const TOKEN_KEY = "shobdo_token";


// =========================================================
// TOKEN HELPERS
// =========================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (!token) return;

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
// INTERNAL HELPERS
// =========================================================

function buildHeaders({
  customHeaders = {},
  isFormData = false,
} = {}) {

  const headers = {
    ...customHeaders,
  };


  // Never manually set Content-Type for FormData.
  // Browser adds multipart boundary automatically.

  if (!isFormData) {

    headers["Content-Type"] =
      "application/json";

  }


  const token =
    getToken();


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

      const text =
        await response.text();


      data =
        text
          ? {
              message:
                text,
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
  {
    method = "GET",
    body,
    customHeaders = {},
    isFormData = false,
    signal,
  } = {}
) {

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

  } catch (
    error
  ) {

    if (
      error?.name ===
      "AbortError"
    ) {

      throw error;

    }


    if (
      error instanceof TypeError
    ) {

      const networkError =
        new Error(
          "Backend server-এর সঙ্গে সংযোগ করা যাচ্ছে না। Backend চালু আছে কি না পরীক্ষা করুন।"
        );


      networkError.cause =
        error;


      throw networkError;

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

  const params =
    new URLSearchParams();


  Object.entries(
    parameters
  ).forEach(
    (
      [
        key,
        value,
      ]
    ) => {

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {

        return;

      }


      params.set(
        key,
        String(
          value
        )
      );

    }
  );


  const query =
    params.toString();


  return query
    ? `?${query}`
    : "";
}


// =========================================================
// VALIDATION HELPERS
// =========================================================

function validatePositiveInteger(
  value,
  label = "ID"
) {

  const id =
    Number(
      value
    );


  if (
    !Number.isInteger(
      id
    ) ||
    id <= 0
  ) {

    throw new Error(
      `Valid ${label} is required.`
    );

  }


  return id;
}


function validateUserId(
  userId
) {

  return validatePositiveInteger(
    userId,
    "user ID"
  );
}


function validateWritingId(
  writingId
) {

  return validatePositiveInteger(
    writingId,
    "writing ID"
  );
}


function validateCommentId(
  commentId
) {

  return validatePositiveInteger(
    commentId,
    "comment ID"
  );
}


// =========================================================
// WRITINGS
// =========================================================


// =========================================================
// GET ALL WRITINGS
// =========================================================

export async function getWritings(
  parameters = {}
) {

  return apiRequest(
    `/api/writings${createQueryString(
      parameters
    )}`
  );
}


// =========================================================
// GLOBAL SEARCH
// =========================================================

export async function globalSearch({
  query = "",
  type = "all",
  page = 1,
  limit = 12,
} = {}) {

  const normalizedQuery =
    String(
      query || ""
    ).trim();


  const requestedType =
    String(
      type || "all"
    ).toLowerCase();


  const normalizedType =
    [
      "all",
      "writers",
      "writings",
    ].includes(
      requestedType
    )
      ? requestedType
      : "all";


  const normalizedPage =
    Math.max(
      Number(
        page
      ) || 1,
      1
    );


  const normalizedLimit =
    Math.min(
      Math.max(
        Number(
          limit
        ) || 12,
        1
      ),
      30
    );


  const queryString =
    createQueryString({
      q:
        normalizedQuery,

      type:
        normalizedType,

      page:
        normalizedPage,

      limit:
        normalizedLimit,
    });


  return apiRequest(
    `/api/search${queryString}`
  );
}


// =========================================================
// GET ONE WRITING
// =========================================================

export async function getWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}`
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

  return apiRequest(
    `/api/writings/mine${createQueryString(
      parameters
    )}`
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
      method:
        "POST",

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

  if (
    !writingData
  ) {

    throw new Error(
      "Writing data is required."
    );

  }


  return apiRequest(
    "/api/writings",
    {
      method:
        "POST",

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

  const id =
    validateWritingId(
      writingId
    );


  if (
    !writingData
  ) {

    throw new Error(
      "Writing data is required."
    );

  }


  return apiRequest(
    `/api/writings/${id}`,
    {
      method:
        "PATCH",

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

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// RESTORE WRITING
// =========================================================

export async function restoreWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}/restore`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// PERMANENTLY DELETE WRITING
// =========================================================

export async function permanentlyDeleteWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}/permanent`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// PUBLISH WRITING
// =========================================================

export async function publishWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}/publish`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// UNPUBLISH WRITING
// =========================================================

export async function unpublishWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/writings/${id}/unpublish`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// SHARES
//
// Persistent public share counter.
//
// POST /api/writings/<writing_id>/share
// =========================================================

export async function recordWritingShare(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  const data =
    await apiRequest(
      `/api/writings/${id}/share`,
      {
        method:
          "POST",
      }
    );


  const sharesCount =
    Number(
      data?.shares_count ??
      data?.share_count ??
      0
    );


  return {
    ...data,

    shares_count:
      Number.isFinite(
        sharesCount
      )
        ? Math.max(
            0,
            sharesCount
          )
        : 0,

    share_count:
      Number.isFinite(
        sharesCount
      )
        ? Math.max(
            0,
            sharesCount
          )
        : 0,
  };
}


// =========================================================
// LIKES
//
// Backend:
// /api/likes
// =========================================================


// =========================================================
// LIKE WRITING
//
// POST /api/likes/writing/<writing_id>
// =========================================================

export async function likeWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/likes/writing/${id}`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// UNLIKE WRITING
//
// DELETE /api/likes/writing/<writing_id>
// =========================================================

export async function unlikeWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/likes/writing/${id}`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// GET LIKE COUNT
//
// GET /api/likes/writing/<writing_id>
// =========================================================

export async function getWritingLikes(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  const data =
    await apiRequest(
      `/api/likes/writing/${id}`
    );


  const likesCount =
    Number(
      data?.likes_count ??
      0
    );


  return {
    ...data,

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
// GET MY LIKE STATUS
//
// GET /api/likes/writing/<writing_id>/me
// =========================================================

export async function getMyLikeStatus(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  const data =
    await apiRequest(
      `/api/likes/writing/${id}/me`
    );


  const liked =
    Boolean(
      data?.liked ??
      false
    );


  return {
    ...data,

    liked,

    is_liked:
      liked,
  };
}


// =========================================================
// TOGGLE LIKE
//
// Compatibility helper.
// =========================================================

export async function toggleLike(
  writingId,
  currentlyLiked
) {

  let liked =
    currentlyLiked;


  if (
    typeof liked !==
    "boolean"
  ) {

    const status =
      await getMyLikeStatus(
        writingId
      );


    liked =
      Boolean(
        status?.liked
      );

  }


  return liked
    ? unlikeWriting(
        writingId
      )
    : likeWriting(
        writingId
      );
}


// =========================================================
// COMMENTS / THREADED REPLIES
// =========================================================


// =========================================================
// GET COMMENTS
// =========================================================

export async function getComments(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/comments/writing/${id}`
  );
}


// =========================================================
// CREATE COMMENT / REPLY
// =========================================================

export async function createComment(
  writingId,
  content,
  parentId = null
) {

  const id =
    validateWritingId(
      writingId
    );


  const normalizedContent =
    typeof content ===
      "string"
      ? content.trim()
      : String(
          content?.content ||
          ""
        ).trim();


  if (
    !normalizedContent
  ) {

    throw new Error(
      "Comment cannot be empty."
    );

  }


  const body = {
    content:
      normalizedContent,
  };


  if (
    parentId !== null &&
    parentId !== undefined &&
    parentId !== ""
  ) {

    body.parent_id =
      validateCommentId(
        parentId
      );

  }


  return apiRequest(
    `/api/comments/writing/${id}`,
    {
      method:
        "POST",

      body,
    }
  );
}


// =========================================================
// ADD COMMENT
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

  validateCommentId(
    parentCommentId
  );


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

  const id =
    validateCommentId(
      commentId
    );


  const normalizedContent =
    String(
      content || ""
    ).trim();


  if (
    !normalizedContent
  ) {

    throw new Error(
      "Comment cannot be empty."
    );

  }


  return apiRequest(
    `/api/comments/${id}`,
    {
      method:
        "PATCH",

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

  const id =
    validateCommentId(
      commentId
    );


  return apiRequest(
    `/api/comments/${id}`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// OCR VALIDATION
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
    10 *
    1024 *
    1024;


  if (
    file.size === 0
  ) {

    throw new Error(
      "The selected file is empty."
    );

  }


  if (
    file.size >
    maximumFileSize
  ) {

    throw new Error(
      "File size cannot exceed 10 MB."
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


  const extension =
    file.name
      ?.split(".")
      .pop()
      ?.toLowerCase();


  if (
    !allowedTypes.includes(
      file.type
    ) &&
    !allowedExtensions.includes(
      extension
    )
  ) {

    throw new Error(
      "Only PDF, JPG, JPEG and PNG files are supported."
    );

  }
}


// =========================================================
// EXTRACT SCANNED TEXT
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
      method:
        "POST",

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
// HEALTH CHECK
// =========================================================

export async function checkApiHealth() {

  return apiRequest(
    "/api/health"
  );
}


// =========================================================
// PROFILE
// =========================================================


// =========================================================
// UPDATE MY PROFILE
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
      method:
        "PATCH",

      body:
        profileData,
    }
  );
}


// =========================================================
// VALIDATE PROFILE AVATAR
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
    5 *
    1024 *
    1024;


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


  const extension =
    file.name
      ?.split(".")
      .pop()
      ?.toLowerCase();


  if (
    !allowedTypes.includes(
      file.type
    ) &&
    !allowedExtensions.includes(
      extension
    )
  ) {

    throw new Error(
      "Only JPG, JPEG, PNG and WEBP profile images are supported."
    );

  }


  return true;
}


// =========================================================
// UPLOAD PROFILE AVATAR
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
      method:
        "POST",

      body:
        formData,

      isFormData:
        true,
    }
  );
}


// =========================================================
// REMOVE PROFILE AVATAR
// =========================================================

export async function removeMyProfileAvatar() {

  return apiRequest(
    "/api/users/me/avatar",
    {
      method:
        "DELETE",
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
// VALIDATE PROFILE COVER
// =========================================================

export function validateProfileCover(
  file
) {

  if (
    !(file instanceof File)
  ) {

    throw new Error(
      "Please select a valid cover photo."
    );

  }


  const maximumFileSize =
    10 *
    1024 *
    1024;


  if (
    file.size === 0
  ) {

    throw new Error(
      "The selected cover photo is empty."
    );

  }


  if (
    file.size >
    maximumFileSize
  ) {

    throw new Error(
      "Cover photo cannot exceed 10 MB."
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


  const extension =
    file.name
      ?.split(".")
      .pop()
      ?.toLowerCase();


  if (
    !allowedTypes.includes(
      file.type
    ) &&
    !allowedExtensions.includes(
      extension
    )
  ) {

    throw new Error(
      "Only JPG, JPEG, PNG and WEBP cover photos are supported."
    );

  }


  return true;
}


// =========================================================
// UPLOAD / REPLACE PROFILE COVER
//
// POST /api/users/me/cover
// multipart/form-data
// field: cover
// =========================================================

export async function uploadMyProfileCover(
  file
) {

  validateProfileCover(
    file
  );


  const formData =
    new FormData();


  formData.append(
    "cover",
    file
  );


  return apiRequest(
    "/api/users/me/cover",
    {
      method:
        "POST",

      body:
        formData,

      isFormData:
        true,
    }
  );
}


// =========================================================
// UPDATE PROFILE COVER POSITION
//
// PATCH /api/users/me/cover/position
//
// 0   = top
// 50  = center
// 100 = bottom
// =========================================================

export async function updateMyProfileCoverPosition(
  positionY
) {

  const normalizedPosition =
    Number(
      positionY
    );


  if (
    !Number.isFinite(
      normalizedPosition
    )
  ) {

    throw new Error(
      "Cover photo position must be a number."
    );

  }


  const roundedPosition =
    Math.round(
      normalizedPosition
    );


  if (
    roundedPosition < 0 ||
    roundedPosition > 100
  ) {

    throw new Error(
      "Cover photo position must be between 0 and 100."
    );

  }


  return apiRequest(
    "/api/users/me/cover/position",
    {
      method:
        "PATCH",

      body: {
        position_y:
          roundedPosition,
      },
    }
  );
}


// =========================================================
// REMOVE PROFILE COVER
// =========================================================

export async function removeMyProfileCover() {

  return apiRequest(
    "/api/users/me/cover",
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// PROFILE COVER COMPATIBILITY EXPORTS
// =========================================================

export const uploadProfileCover =
  uploadMyProfileCover;


export const updateProfileCoverPosition =
  updateMyProfileCoverPosition;


export const removeProfileCover =
  removeMyProfileCover;


// Friendly aliases for components that use "CoverPhoto" naming.

export const uploadMyCoverPhoto =
  uploadMyProfileCover;


export const updateMyCoverPosition =
  updateMyProfileCoverPosition;


export const deleteMyCoverPhoto =
  removeMyProfileCover;


// =========================================================
// GET PUBLIC WRITER PROFILE
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
// SUGGESTED WRITERS
//
// GET /api/users/suggestions?page=1&limit=5
// =========================================================

export async function getSuggestedUsers({
  page = 1,
  limit = 5,
} = {}) {

  const normalizedPage =
    Math.max(
      Number(
        page
      ) || 1,
      1
    );


  const normalizedLimit =
    Math.min(
      Math.max(
        Number(
          limit
        ) || 5,
        1
      ),
      20
    );


  const queryString =
    createQueryString({
      page:
        normalizedPage,

      limit:
        normalizedLimit,
    });


  return apiRequest(
    `/api/users/suggestions${queryString}`
  );
}


// =========================================================
// ALIAS
// =========================================================

export const getUserSuggestions =
  getSuggestedUsers;


// =========================================================
// FOLLOW SYSTEM
// =========================================================


// =========================================================
// GET FOLLOW STATUS
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
      method:
        "POST",
    }
  );
}


// =========================================================
// UNFOLLOW USER
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
      method:
        "DELETE",
    }
  );
}


// =========================================================
// GET FOLLOWING FEED
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
// SAVED / BOOKMARKS
// =========================================================


// =========================================================
// SAVE WRITING
// =========================================================

export async function saveWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/saved/writing/${id}`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// UNSAVE WRITING
// =========================================================

export async function unsaveWriting(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/saved/writing/${id}`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// GET SAVED STATUS
// =========================================================

export async function getSavedWritingStatus(
  writingId
) {

  const id =
    validateWritingId(
      writingId
    );


  return apiRequest(
    `/api/saved/writing/${id}/status`
  );
}


// =========================================================
// GET SAVED WRITINGS
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

  return currentlySaved
    ? unsaveWriting(
        writingId
      )
    : saveWriting(
        writingId
      );
}


// =========================================================
// TRENDING TOPICS
// =========================================================


// =========================================================
// NORMALIZE TAG NAME
// =========================================================

function normalizeTagName(
  tagName
) {

  const normalized =
    String(
      tagName || ""
    )
      .trim()
      .replace(
        /^#+/,
        ""
      )
      .trim();


  if (!normalized) {

    throw new Error(
      "Tag name is required."
    );

  }


  return normalized;
}


// =========================================================
// GET TRENDING TOPICS
//
// GET /api/trending/topics
//
// Examples:
//
// getTrendingTopics()
//
// getTrendingTopics({
//   limit: 8,
//   period: 7,
// })
//
// getTrendingTopics({
//   limit: 10,
//   period: "all",
// })
// =========================================================

export async function getTrendingTopics({
  limit = 8,
  period = 7,
} = {}) {

  const normalizedLimit =
    Math.min(
      Math.max(
        Number(
          limit
        ) || 8,
        1
      ),
      20
    );


  let normalizedPeriod =
    period;


  if (
    typeof normalizedPeriod ===
    "string"
  ) {

    normalizedPeriod =
      normalizedPeriod
        .trim()
        .toLowerCase();

  }


  const validPeriods = [
    1,
    7,
    30,
    90,
    "1",
    "7",
    "30",
    "90",
    "all",
  ];


  if (
    !validPeriods.includes(
      normalizedPeriod
    )
  ) {

    normalizedPeriod =
      7;

  }


  const queryString =
    createQueryString({

      limit:
        normalizedLimit,

      period:
        normalizedPeriod,

    });


  return apiRequest(
    `/api/trending/topics${queryString}`
  );
}


// =========================================================
// GET ONE TRENDING TOPIC SUMMARY
//
// GET /api/trending/topics/<tag_name>
// =========================================================

export async function getTrendingTopic(
  tagName
) {

  const normalizedTag =
    normalizeTagName(
      tagName
    );


  return apiRequest(

    `/api/trending/topics/${encodeURIComponent(
      normalizedTag
    )}`

  );
}


// =========================================================
// GET WRITINGS BY HASHTAG
//
// GET /api/writings/tags/<tag_name>
//
// Examples:
//
// getWritingsByTag("কবিতা")
//
// getWritingsByTag("#কবিতা", {
//   page: 1,
//   limit: 12,
// })
// =========================================================

export async function getWritingsByTag(
  tagName,
  {
    page = 1,
    limit = 12,
  } = {}
) {

  const normalizedTag =
    normalizeTagName(
      tagName
    );


  const normalizedPage =
    Math.max(
      Number(
        page
      ) || 1,
      1
    );


  const normalizedLimit =
    Math.min(
      Math.max(
        Number(
          limit
        ) || 12,
        1
      ),
      50
    );


  const queryString =
    createQueryString({

      page:
        normalizedPage,

      limit:
        normalizedLimit,

    });


  return apiRequest(

    `/api/writings/tags/${encodeURIComponent(
      normalizedTag
    )}${queryString}`

  );
}


// =========================================================
// COMPATIBILITY / CONVENIENCE ALIASES
// =========================================================

export const getTopicSummary =
  getTrendingTopic;


export const getTagWritings =
  getWritingsByTag;


// =========================================================
// REPOSTS
// =========================================================


// =========================================================
// CREATE REPOST
//
// POST /api/reposts/writing/<writing_id>
// =========================================================

export async function repostWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/reposts/writing/${writingId}`,
    {
      method:
        "POST",
    }
  );
}


// =========================================================
// REMOVE REPOST
//
// DELETE /api/reposts/writing/<writing_id>
// =========================================================

export async function unrepostWriting(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/reposts/writing/${writingId}`,
    {
      method:
        "DELETE",
    }
  );
}


// =========================================================
// GET CURRENT USER REPOST STATUS
//
// GET /api/reposts/writing/<writing_id>/me
// =========================================================

export async function getMyRepostStatus(
  writingId
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );
  }


  return apiRequest(
    `/api/reposts/writing/${writingId}/me`
  );
}


// =========================================================
// GET USERS WHO REPOSTED A WRITING
//
// GET /api/reposts/writing/<writing_id>
// =========================================================

export async function getWritingReposts(
  writingId,
  {
    page = 1,
    limit = 20,
  } = {}
) {

  if (!writingId) {

    throw new Error(
      "Writing ID is required."
    );
  }


  const queryString =
    createQueryString({
      page,
      limit,
    });


  return apiRequest(
    `/api/reposts/writing/${writingId}${queryString}`
  );
}


// =========================================================
// GET USER REPOSTS
//
// GET /api/users/<user_id>/reposts
// =========================================================

export async function getUserReposts(
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
    `/api/users/${id}/reposts${queryString}`
  );
}


// =========================================================
// TOGGLE REPOST
// =========================================================

export async function toggleRepost(
  writingId,
  currentlyReposted = false
) {

  if (
    currentlyReposted
  ) {

    return unrepostWriting(
      writingId
    );
  }


  return repostWriting(
    writingId
  );
}


// =========================================================
// DEFAULT EXPORT
// =========================================================

const writingApi = {

  API_URL,


  // TOKEN

  getToken,

  saveToken,

  removeToken,


  // WRITINGS

  getWritings,

  globalSearch,

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


  // SHARES

  recordWritingShare,


  // LIKES

  likeWriting,

  unlikeWriting,

  toggleLike,

  getWritingLikes,

  getMyLikeStatus,


  // COMMENTS

  getComments,

  createComment,

  addComment,

  replyToComment,

  updateComment,

  deleteComment,


  // OCR

  extractScannedText,

  scanWriting,

  extractTextFromFile,


  // PROFILE

  updateMyProfile,

  validateProfileAvatar,

  uploadMyProfileAvatar,

  removeMyProfileAvatar,

  uploadProfileAvatar,

  removeProfileAvatar,

  validateProfileCover,

  uploadMyProfileCover,

  updateMyProfileCoverPosition,

  removeMyProfileCover,

  uploadProfileCover,

  updateProfileCoverPosition,

  removeProfileCover,

  uploadMyCoverPhoto,

  updateMyCoverPosition,

  deleteMyCoverPhoto,

  getWriterProfile,

  getWriterWritings,

  getSuggestedUsers,

  getUserSuggestions,


  // FOLLOW

  getFollowStatus,

  followUser,

  unfollowUser,

  getFollowingFeed,

  getUserFollowers,

  getUserFollowing,


  // SAVED

  saveWriting,

  unsaveWriting,

  getSavedWritingStatus,

  getSavedWritings,

  toggleSavedWriting,

  // -------------------------------------------------------
  // TRENDING / HASHTAGS
  // -------------------------------------------------------

  getTrendingTopics,

  getTrendingTopic,

  getTopicSummary,

  getWritingsByTag,

  getTagWritings,

  // -------------------------------------------------------
  // REPOSTS
  // -------------------------------------------------------

  repostWriting,

  unrepostWriting,

  toggleRepost,

  getMyRepostStatus,

  getWritingReposts,

  getUserReposts,


  // HEALTH

  checkApiHealth,
};


export default writingApi;