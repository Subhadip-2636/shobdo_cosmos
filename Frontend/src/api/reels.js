// =========================================================
// SHOBDO REELS API
// =========================================================


// =========================================================
// API CONFIGURATION
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


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// REEL FILE LIMITS
// =========================================================

export const MAX_REEL_FILE_SIZE =
  100 *
  1024 *
  1024;


export const REEL_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];


export const REEL_VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
];


// =========================================================
// REEL LANGUAGES
// =========================================================

export const REEL_LANGUAGES = [

  {
    code:
      "bn",

    nativeName:
      "বাংলা",

    name:
      "Bengali",
  },

  {
    code:
      "hi",

    nativeName:
      "हिन्दी",

    name:
      "Hindi",
  },

  {
    code:
      "en",

    nativeName:
      "English",

    name:
      "English",
  },

  {
    code:
      "as",

    nativeName:
      "অসমীয়া",

    name:
      "Assamese",
  },

  {
    code:
      "or",

    nativeName:
      "ଓଡ଼ିଆ",

    name:
      "Odia",
  },

  {
    code:
      "ta",

    nativeName:
      "தமிழ்",

    name:
      "Tamil",
  },

  {
    code:
      "te",

    nativeName:
      "తెలుగు",

    name:
      "Telugu",
  },

];


// =========================================================
// TOKEN
// =========================================================

function getToken() {

  return (
    window.localStorage.getItem(
      TOKEN_KEY
    ) ||
    ""
  );

}


// =========================================================
// FILE EXTENSION
// =========================================================

function getFileExtension(
  fileName = ""
) {

  const dotIndex =
    String(
      fileName
    ).lastIndexOf(
      "."
    );


  if (
    dotIndex === -1
  ) {

    return "";

  }


  return String(
    fileName
  )
    .slice(
      dotIndex
    )
    .toLowerCase();

}


// =========================================================
// VALIDATE REEL VIDEO
// =========================================================

export function validateReelVideo(
  file
) {

  if (
    !(file instanceof File)
  ) {

    throw new Error(
      "Please select a video."
    );

  }


  if (
    file.size <= 0
  ) {

    throw new Error(
      "The selected video is empty."
    );

  }


  if (
    file.size >
    MAX_REEL_FILE_SIZE
  ) {

    throw new Error(
      "Reel video cannot exceed 100 MB."
    );

  }


  const extension =
    getFileExtension(
      file.name
    );


  const validType =
    REEL_VIDEO_TYPES.includes(
      file.type
    );


  const validExtension =
    REEL_VIDEO_EXTENSIONS.includes(
      extension
    );


  if (
    !validType &&
    !validExtension
  ) {

    throw new Error(
      "Only MP4, WEBM, MOV and M4V videos are supported."
    );

  }


  return true;

}


// =========================================================
// RESPONSE PARSER
// =========================================================

async function parseResponse(
  response
) {

  let data = null;


  try {

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


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


  if (
    !response.ok
  ) {

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
// CREATE AUTH HEADERS
// =========================================================

function getAuthHeaders() {

  const token =
    getToken();


  if (
    !token
  ) {

    throw new Error(
      "Please log in before creating a Reel."
    );

  }


  return {
    Authorization:
      `Bearer ${token}`,
  };

}


// =========================================================
// EXTRACT VIDEO OBJECT
// =========================================================

function extractVideo(
  response
) {

  if (
    !response ||
    typeof response !==
      "object"
  ) {

    return null;

  }


  return (
    response.video ||
    response.data?.video ||
    response
  );

}


// =========================================================
// EXTRACT VIDEO URL
// =========================================================

export function getUploadedVideoUrl(
  response
) {

  const video =
    extractVideo(
      response
    );


  return (
    video?.video_url ||
    video?.file_url ||
    video?.url ||
    video?.secure_url ||
    response?.video_url ||
    response?.file_url ||
    ""
  );

}


// =========================================================
// EXTRACT THUMBNAIL URL
// =========================================================

export function getUploadedVideoThumbnail(
  response
) {

  const video =
    extractVideo(
      response
    );


  return (
    video?.thumbnail_url ||
    video?.poster_url ||
    video?.thumbnail ||
    response?.thumbnail_url ||
    ""
  );

}


// =========================================================
// UPLOAD VIDEO FOR REEL
//
// Existing SHOBDO video infrastructure:
//
// POST /api/videos
//
// The Reel record itself is created afterwards.
// =========================================================

export function uploadReelVideo({
  file,
  caption = "",
  language = "bn",
  visibility = "public",
  durationSeconds = 0,
  onProgress,
}) {

  validateReelVideo(
    file
  );


  const token =
    getToken();


  if (
    !token
  ) {

    return Promise.reject(

      new Error(
        "Please log in before uploading a Reel."
      )

    );

  }


  const cleanCaption =
    String(
      caption || ""
    ).trim();


  const titleFromCaption =
    cleanCaption
      ? cleanCaption.slice(
          0,
          160
        )
      : String(
          file.name || "SHOBDO Reel"
        )
          .replace(
            /\.(mp4|webm|mov|m4v)$/i,
            ""
          )
          .replace(
            /[_-]+/g,
            " "
          )
          .trim()
          .slice(
            0,
            160
          );


  const formData =
    new FormData();


  formData.append(
    "video",
    file
  );


  formData.append(
    "title",
    titleFromCaption ||
    "SHOBDO Reel"
  );


  formData.append(
    "description",
    cleanCaption
  );


  formData.append(
    "category",
    "Creative Video"
  );


  formData.append(
    "language",
    language || "bn"
  );


  formData.append(
    "visibility",
    visibility || "public"
  );


  formData.append(
    "status",
    "published"
  );


  if (
    Number.isFinite(
      Number(
        durationSeconds
      )
    ) &&
    Number(
      durationSeconds
    ) > 0
  ) {

    formData.append(
      "duration_seconds",
      String(
        Math.round(
          Number(
            durationSeconds
          )
        )
      )
    );

  }


  return new Promise(
    (
      resolve,
      reject
    ) => {

      const request =
        new XMLHttpRequest();


      request.open(
        "POST",
        `${API_URL}/videos`
      );


      request.setRequestHeader(
        "Authorization",
        `Bearer ${token}`
      );


      request.upload.onprogress =
        (
          event
        ) => {

          if (
            !event.lengthComputable
          ) {

            return;

          }


          const progress =
            Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  (
                    event.loaded /
                    event.total
                  ) *
                    100
                )
              )
            );


          if (
            typeof onProgress ===
            "function"
          ) {

            onProgress(
              progress
            );

          }

        };


      request.onerror =
        () => {

          reject(

            new Error(
              "Unable to connect to SHOBDO while uploading the Reel."
            )

          );

        };


      request.onabort =
        () => {

          reject(

            new Error(
              "Reel upload was cancelled."
            )

          );

        };


      request.onload =
        () => {

          let data = null;


          try {

            data =
              request.responseText
                ? JSON.parse(
                    request.responseText
                  )
                : {};

          } catch {

            data = {
              message:
                request.responseText ||
                "",
            };

          }


          if (
            request.status >= 200 &&
            request.status < 300
          ) {

            if (
              typeof onProgress ===
              "function"
            ) {

              onProgress(
                100
              );

            }


            resolve(
              data
            );


            return;

          }


          let message =
            data?.message ||
            data?.error ||
            data?.detail ||
            "";


          if (
            request.status === 401
          ) {

            message =
              message ||
              "Your login session has expired. Please log in again.";

          }


          if (
            request.status === 403
          ) {

            message =
              message ||
              "You do not have permission to upload this Reel.";

          }


          if (
            request.status === 404
          ) {

            message =
              "The SHOBDO video upload API was not found.";

          }


          if (
            request.status === 413
          ) {

            message =
              "The Reel video is too large. Maximum size is 100 MB.";

          }


          if (
            request.status >= 500
          ) {

            message =
              message ||
              "The server could not upload this Reel video.";

          }


          const error =
            new Error(
              message ||
              `Unable to upload Reel. Server returned ${request.status}.`
            );


          error.status =
            request.status;


          error.data =
            data;


          reject(
            error
          );

        };


      request.send(
        formData
      );

    }
  );

}


// =========================================================
// CREATE REEL DATABASE RECORD
//
// POST /api/reels
// =========================================================

export async function createReel({
  videoUrl,
  thumbnailUrl = "",
  caption = "",
  language = "bn",
  durationSeconds = null,
  aspectRatio = "9:16",
  visibility = "public",
  commentsEnabled = true,
}) {

  const headers =
    getAuthHeaders();


  const cleanVideoUrl =
    String(
      videoUrl || ""
    ).trim();


  if (
    !cleanVideoUrl
  ) {

    throw new Error(
      "Uploaded video URL is missing."
    );

  }


  const payload = {

    video_url:
      cleanVideoUrl,

    thumbnail_url:
      String(
        thumbnailUrl || ""
      ).trim() ||
      null,

    caption:
      String(
        caption || ""
      ).trim() ||
      null,

    language:
      language ||
      "bn",

    duration_seconds:
      Number.isFinite(
        Number(
          durationSeconds
        )
      )
        ? Number(
            durationSeconds
          )
        : null,

    aspect_ratio:
      aspectRatio ||
      "9:16",

    visibility:
      visibility ||
      "public",

    comments_enabled:
      Boolean(
        commentsEnabled
      ),

  };


  const response =
    await fetch(
      `${API_URL}/reels`,
      {

        method:
          "POST",

        headers: {
          ...headers,

          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),

      }
    );


  return parseResponse(
    response
  );

}


// =========================================================
// PUBLISH COMPLETE REEL
//
// 1. Upload video
// 2. Extract hosted URL
// 3. Create Reel record
// =========================================================

export async function publishReel({
  file,
  caption = "",
  language = "bn",
  visibility = "public",
  commentsEnabled = true,
  durationSeconds = 0,
  aspectRatio = "9:16",
  onProgress,
}) {

  // -------------------------------------------------------
  // STEP 1 — VIDEO UPLOAD
  // -------------------------------------------------------

  const uploadResponse =
    await uploadReelVideo({

      file,

      caption,

      language,

      visibility,

      durationSeconds,

      onProgress,

    });


  // -------------------------------------------------------
  // STEP 2 — GET HOSTED VIDEO URL
  // -------------------------------------------------------

  const videoUrl =
    getUploadedVideoUrl(
      uploadResponse
    );


  if (
    !videoUrl
  ) {

    const error =
      new Error(
        "The video uploaded successfully, but SHOBDO did not return its video URL."
      );


    error.data =
      uploadResponse;


    throw error;

  }


  const thumbnailUrl =
    getUploadedVideoThumbnail(
      uploadResponse
    );


  // -------------------------------------------------------
  // STEP 3 — CREATE REEL
  // -------------------------------------------------------

  const reelResponse =
    await createReel({

      videoUrl,

      thumbnailUrl,

      caption,

      language,

      durationSeconds,

      aspectRatio,

      visibility,

      commentsEnabled,

    });


  return {

    upload:
      uploadResponse,

    reel:
      reelResponse?.reel ||
      reelResponse,

    response:
      reelResponse,

  };

}


// =========================================================
// GET PUBLIC REELS
// =========================================================

export async function getReels({
  page = 1,
  perPage = 10,
  language = "",
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "page",
    String(
      Math.max(
        1,
        Number(
          page
        ) || 1
      )
    )
  );


  params.set(
    "per_page",
    String(
      Math.min(
        50,
        Math.max(
          1,
          Number(
            perPage
          ) || 10
        )
      )
    )
  );


  if (
    language
  ) {

    params.set(
      "language",
      language
    );

  }


  const response =
    await fetch(
      `${API_URL}/reels?${params.toString()}`,
      {
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
// GET CURRENT USER REELS
// =========================================================

export async function getMyReels({
  page = 1,
  perPage = 20,
} = {}) {

  const headers =
    getAuthHeaders();


  const params =
    new URLSearchParams({
      page:
        String(
          page
        ),

      per_page:
        String(
          perPage
        ),
    });


  const response =
    await fetch(
      `${API_URL}/reels/mine?${params.toString()}`,
      {
        headers: {
          ...headers,

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
// GET ONE REEL
// =========================================================

export async function getReel(
  reelId
) {

  const response =
    await fetch(
      `${API_URL}/reels/${reelId}`,
      {
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
// REGISTER VIEW
// =========================================================

export async function registerReelView(
  reelId
) {

  const response =
    await fetch(
      `${API_URL}/reels/${reelId}/view`,
      {
        method:
          "POST",

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
// UPDATE REEL
// =========================================================

export async function updateReel(
  reelId,
  updates
) {

  const headers =
    getAuthHeaders();


  const response =
    await fetch(
      `${API_URL}/reels/${reelId}`,
      {

        method:
          "PATCH",

        headers: {
          ...headers,

          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            updates || {}
          ),

      }
    );


  return parseResponse(
    response
  );

}


// =========================================================
// DELETE REEL
// =========================================================

export async function deleteReel(
  reelId
) {

  const headers =
    getAuthHeaders();


  const response =
    await fetch(
      `${API_URL}/reels/${reelId}`,
      {

        method:
          "DELETE",

        headers: {
          ...headers,

          Accept:
            "application/json",
        },

      }
    );


  return parseResponse(
    response
  );

}