const RAW_API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000"
  )
    .trim()
    .replace(/\/+$/, "");

const API_URL =
  RAW_API_URL.endsWith("/api")
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


// =========================================================
// GOOGLE
// =========================================================

export const GOOGLE_CLIENT_ID =
  String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();


// =========================================================
// FACEBOOK
// =========================================================

export const FACEBOOK_APP_ID =
  String(
    import.meta.env.VITE_FACEBOOK_APP_ID ||
    ""
  ).trim();


export const FACEBOOK_GRAPH_API_VERSION =
  String(
    import.meta.env
      .VITE_FACEBOOK_GRAPH_API_VERSION ||
    ""
  ).trim();


// =========================================================
// INSTAGRAM
// =========================================================

const INSTAGRAM_POPUP_SOURCE =
  "shobdo-instagram-auth";

const INSTAGRAM_POPUP_NAME =
  "shobdo-instagram-auth";

const INSTAGRAM_POPUP_TIMEOUT_MS =
  5 * 60 * 1000;

const INSTAGRAM_LINK_TOKEN_KEY =
  "shobdo_instagram_link_token";

const INSTAGRAM_LINK_USERNAME_KEY =
  "shobdo_instagram_username";


// =========================================================
// SHOBDO JWT
// =========================================================

const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// LOCAL STORAGE
// =========================================================

function canUseLocalStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );

}


// =========================================================
// SESSION STORAGE
// =========================================================

function canUseSessionStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !==
      "undefined"
  );

}


// =========================================================
// GET STORED SHOBDO JWT
// =========================================================

function getStoredToken() {

  if (!canUseLocalStorage()) {

    return null;

  }


  try {

    return localStorage.getItem(
      TOKEN_KEY
    );

  } catch {

    return null;

  }

}


// =========================================================
// STORE SHOBDO JWT
// =========================================================

function storeToken(
  token
) {

  if (
    !token ||
    !canUseLocalStorage()
  ) {

    return;

  }


  try {

    localStorage.setItem(
      TOKEN_KEY,
      String(
        token
      )
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// REMOVE SHOBDO JWT
// =========================================================

function removeStoredToken() {

  if (!canUseLocalStorage()) {

    return;

  }


  try {

    localStorage.removeItem(
      TOKEN_KEY
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// EXTRACT JWT FROM BACKEND RESPONSE
// =========================================================

function extractAccessToken(
  data
) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    return null;

  }


  return (
    data.access_token ||
    data.token ||
    null
  );

}


// =========================================================
// API ERROR
// =========================================================

function createApiError({
  response,
  data,
}) {

  const message =
    data?.message ||
    data?.error ||
    (
      response.status >= 500
        ? (
            "The server could not " +
            "complete the request."
          )
        : (
            "Something went wrong. " +
            "Please try again."
          )
    );


  const error =
    new Error(
      message
    );


  error.status =
    response.status;


  error.statusText =
    response.statusText;


  error.code =
    data?.code ||
    null;


  error.provider =
    data?.provider ||
    null;


  error.data =
    data ||
    {};


  return error;

}


// =========================================================
// RESPONSE PARSER
// =========================================================

async function parseResponse(
  response
) {

  let data = {};


  const responseText =
    await response.text();


  if (responseText) {

    try {

      data =
        JSON.parse(
          responseText
        );

    } catch {

      data = {

        message:
          responseText,

      };

    }

  }


  if (!response.ok) {

    throw createApiError({
      response,
      data,
    });

  }


  return data;

}


// =========================================================
// NETWORK ERROR
// =========================================================

function createNetworkError(
  originalError
) {

  const error =
    new Error(
      "Unable to connect to SHOBDO. " +
      "Please check your internet " +
      "connection and try again."
    );


  error.code =
    "network_error";


  error.status =
    0;


  error.originalError =
    originalError;


  return error;

}


// =========================================================
// COMMON API REQUEST
// =========================================================

async function authRequest(
  endpoint,
  options = {}
) {

  const {

    includeAuth = true,

    headers:
      customHeaders = {},

    ...fetchOptions

  } = options;


  const token =
    getStoredToken();


  const headers = {

    "Content-Type":
      "application/json",

    ...customHeaders,

  };


  if (
    includeAuth &&
    token
  ) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  try {

    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          ...fetchOptions,
          headers,
        }
      );


    return await parseResponse(
      response
    );

  } catch (error) {

    if (
      error?.status !== undefined
    ) {

      throw error;

    }


    throw createNetworkError(
      error
    );

  }

}


// =========================================================
// SAVE AUTHENTICATION RESPONSE
// =========================================================

function saveAuthenticationResponse(
  data
) {

  const token =
    extractAccessToken(
      data
    );


  if (token) {

    storeToken(
      token
    );

  }


  return data;

}


// =========================================================
// REGISTER
// =========================================================

export async function registerUser({
  name,
  email,
  password,
  confirmPassword,
}) {

  const cleanName =
    String(
      name ||
      ""
    ).trim();


  const cleanEmail =
    String(
      email ||
      ""
    )
      .trim()
      .toLowerCase();


  const cleanPassword =
    String(
      password ||
      ""
    );


  const cleanConfirmPassword =
    String(
      confirmPassword ??
      password ??
      ""
    );


  const data =
    await authRequest(
      "/auth/register",
      {

        method:
          "POST",

        includeAuth:
          false,

        body:
          JSON.stringify({

            name:
              cleanName,

            email:
              cleanEmail,

            password:
              cleanPassword,

            confirm_password:
              cleanConfirmPassword,

          }),

      }
    );


  return saveAuthenticationResponse(
    data
  );

}


// =========================================================
// EMAIL / PASSWORD LOGIN
// =========================================================

export async function loginUser(
  credentials,
  legacyPassword
) {

  let email;
  let password;


  if (
    typeof credentials ===
      "object" &&
    credentials !== null
  ) {

    email =
      credentials.email;

    password =
      credentials.password;

  } else {

    email =
      credentials;

    password =
      legacyPassword;

  }


  const cleanEmail =
    String(
      email ||
      ""
    )
      .trim()
      .toLowerCase();


  const cleanPassword =
    String(
      password ||
      ""
    );


  const data =
    await authRequest(
      "/auth/login",
      {

        method:
          "POST",

        includeAuth:
          false,

        body:
          JSON.stringify({

            email:
              cleanEmail,

            password:
              cleanPassword,

          }),

      }
    );


  return saveAuthenticationResponse(
    data
  );

}


// =========================================================
// GOOGLE LOGIN
// =========================================================

export async function loginWithGoogle(
  input
) {

  const credential =
    typeof input === "object" &&
    input !== null

      ? (
          input.credential ||
          input.id_token ||
          input.idToken ||
          ""
        )

      : input;


  const cleanCredential =
    String(
      credential ||
      ""
    ).trim();


  if (!cleanCredential) {

    const error =
      new Error(
        "Google sign-in credential " +
        "is missing."
      );


    error.code =
      "google_credential_missing";


    throw error;

  }


  const data =
    await authRequest(
      "/auth/google",
      {

        method:
          "POST",

        includeAuth:
          false,

        body:
          JSON.stringify({

            credential:
              cleanCredential,

          }),

      }
    );


  return saveAuthenticationResponse(
    data
  );

}


export const googleLogin =
  loginWithGoogle;


export const loginUserWithGoogle =
  loginWithGoogle;


// =========================================================
// GOOGLE CONFIGURATION CHECK
// =========================================================

export function isGoogleAuthConfigured() {

  return Boolean(
    GOOGLE_CLIENT_ID
  );

}


// =========================================================
// GOOGLE CLIENT ID
// =========================================================

export function getGoogleClientId() {

  return (
    GOOGLE_CLIENT_ID ||
    null
  );

}


// =========================================================
// FACEBOOK TOKEN NORMALIZER
// =========================================================

function getFacebookTokenFromInput(
  input
) {

  const token =
    typeof input === "object" &&
    input !== null

      ? (
          input.access_token ||
          input.accessToken ||
          input.token ||
          ""
        )

      : input;


  return String(
    token ||
    ""
  ).trim();

}


// =========================================================
// FACEBOOK LOGIN
// =========================================================

export async function loginWithFacebook(
  input
) {

  const accessToken =
    getFacebookTokenFromInput(
      input
    );


  if (!accessToken) {

    const error =
      new Error(
        "Facebook access token " +
        "is missing."
      );


    error.code =
      "facebook_token_missing";


    throw error;

  }


  const data =
    await authRequest(
      "/auth/facebook",
      {

        method:
          "POST",

        includeAuth:
          false,

        body:
          JSON.stringify({

            access_token:
              accessToken,

          }),

      }
    );


  return saveAuthenticationResponse(
    data
  );

}


export const facebookLogin =
  loginWithFacebook;


export const loginUserWithFacebook =
  loginWithFacebook;


// =========================================================
// LINK FACEBOOK TO EXISTING SHOBDO USER
// =========================================================

export async function linkFacebookAccount(
  input
) {

  const accessToken =
    getFacebookTokenFromInput(
      input
    );


  if (!accessToken) {

    const error =
      new Error(
        "Facebook access token " +
        "is missing."
      );


    error.code =
      "facebook_token_missing";


    throw error;

  }


  const shobdoToken =
    getStoredToken();


  if (!shobdoToken) {

    const error =
      new Error(
        "Sign in to your existing " +
        "SHOBDO account before " +
        "connecting Facebook."
      );


    error.code =
      "shobdo_auth_required";


    error.status =
      401;


    throw error;

  }


  return authRequest(
    "/auth/facebook/link",
    {

      method:
        "POST",

      includeAuth:
        true,

      body:
        JSON.stringify({

          access_token:
            accessToken,

        }),

    }
  );

}


// =========================================================
// FACEBOOK CONFIGURATION CHECK
// =========================================================

export function isFacebookAuthConfigured() {

  return Boolean(
    FACEBOOK_APP_ID
  );

}


// =========================================================
// FACEBOOK APP ID
// =========================================================

export function getFacebookAppId() {

  return (
    FACEBOOK_APP_ID ||
    null
  );

}


// =========================================================
// API ORIGIN
// =========================================================
//
// Used to make sure Instagram popup messages come from
// SHOBDO's own backend and not another website.
//
// =========================================================

function getApiOrigin() {

  try {

    if (
      typeof window !==
      "undefined"
    ) {

      return new URL(
        RAW_API_URL,
        window.location.origin
      ).origin;

    }


    return new URL(
      RAW_API_URL
    ).origin;

  } catch {

    return "";

  }

}


// =========================================================
// INSTAGRAM START URL
// =========================================================

export function getInstagramStartUrl() {

  return (
    `${API_URL}/auth/instagram/start`
  );

}


// =========================================================
// INSTAGRAM CONFIGURATION CHECK
// =========================================================

export function isInstagramAuthConfigured() {

  return Boolean(
    API_URL
  );

}


// =========================================================
// SAVE PENDING INSTAGRAM LINK
// =========================================================
//
// Instagram does not provide the same email identity flow
// used by Google/Facebook.
//
// If the Instagram identity is not already linked to SHOBDO,
// the backend returns a temporary signed link token.
//
// That token stays in sessionStorage until the user logs in
// to an existing SHOBDO account.
//
// =========================================================

export function setPendingInstagramLink(
  input
) {

  const payload =
    (
      typeof input ===
        "object" &&
      input !== null
    )
      ? input

      : {

          link_token:
            input,

        };


  const linkToken =
    String(
      payload.link_token ||
      payload.instagram_link_token ||
      ""
    ).trim();


  const username =
    String(
      payload.instagram_username ||
      ""
    ).trim();


  if (
    !linkToken ||
    !canUseSessionStorage()
  ) {

    return false;

  }


  try {

    sessionStorage.setItem(
      INSTAGRAM_LINK_TOKEN_KEY,
      linkToken
    );


    if (username) {

      sessionStorage.setItem(
        INSTAGRAM_LINK_USERNAME_KEY,
        username
      );

    } else {

      sessionStorage.removeItem(
        INSTAGRAM_LINK_USERNAME_KEY
      );

    }


    return true;

  } catch {

    return false;

  }

}


// =========================================================
// GET PENDING INSTAGRAM LINK
// =========================================================

export function getPendingInstagramLink() {

  if (!canUseSessionStorage()) {

    return null;

  }


  try {

    const linkToken =
      sessionStorage.getItem(
        INSTAGRAM_LINK_TOKEN_KEY
      );


    if (!linkToken) {

      return null;

    }


    return {

      link_token:
        linkToken,

      instagram_username:
        sessionStorage.getItem(
          INSTAGRAM_LINK_USERNAME_KEY
        ) ||
        "",

    };

  } catch {

    return null;

  }

}


// =========================================================
// HAS PENDING INSTAGRAM LINK
// =========================================================

export function hasPendingInstagramLink() {

  return Boolean(
    getPendingInstagramLink()
      ?.link_token
  );

}


// =========================================================
// CLEAR PENDING INSTAGRAM LINK
// =========================================================

export function clearPendingInstagramLink() {

  if (!canUseSessionStorage()) {

    return;

  }


  try {

    sessionStorage.removeItem(
      INSTAGRAM_LINK_TOKEN_KEY
    );


    sessionStorage.removeItem(
      INSTAGRAM_LINK_USERNAME_KEY
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// INSTAGRAM POPUP ERROR
// =========================================================

function createInstagramPopupError(
  payload = {}
) {

  const error =
    new Error(
      payload.message ||
      "Unable to complete Instagram sign-in."
    );


  error.code =
    payload.code ||
    "instagram_authentication_failed";


  error.provider =
    "instagram";


  error.data =
    payload;


  return error;

}


// =========================================================
// INSTAGRAM BUSINESS LOGIN
// =========================================================
//
// Flow:
//
// Login.jsx
//     ↓
// window.open()
//     ↓
// GET /api/auth/instagram/start
//     ↓
// Instagram OAuth
//     ↓
// GET /api/auth/instagram/callback
//     ↓
// backend validates OAuth
//     ↓
// backend sends window.opener.postMessage()
//     ↓
// this function receives the result
//
// Possible result:
//
// authenticated
//      → backend returned SHOBDO JWT
//
// link_required
//      → Instagram identity verified
//      → user must authenticate SHOBDO
//      → temporary Instagram link token saved
//
// =========================================================

export function loginWithInstagram(
  options = {}
) {

  if (
    typeof window ===
    "undefined"
  ) {

    const error =
      new Error(
        "Instagram sign-in requires a browser."
      );


    error.code =
      "instagram_browser_required";


    return Promise.reject(
      error
    );

  }


  const expectedOrigin =
    getApiOrigin();


  if (!expectedOrigin) {

    const error =
      new Error(
        "Instagram sign-in is not configured correctly."
      );


    error.code =
      "instagram_api_origin_invalid";


    return Promise.reject(
      error
    );

  }


  const popupWidth =
    Number(
      options.width
    ) ||
    600;


  const popupHeight =
    Number(
      options.height
    ) ||
    760;


  const left =
    Math.max(
      0,
      Math.round(

        window.screenX +

        (
          window.outerWidth -
          popupWidth
        ) / 2

      )
    );


  const top =
    Math.max(
      0,
      Math.round(

        window.screenY +

        (
          window.outerHeight -
          popupHeight
        ) / 2

      )
    );


  const popupFeatures = [

    `width=${popupWidth}`,

    `height=${popupHeight}`,

    `left=${left}`,

    `top=${top}`,

    "resizable=yes",

    "scrollbars=yes",

    "toolbar=no",

    "menubar=no",

    "location=yes",

    "status=no",

  ].join(",");


  return new Promise(
    (
      resolve,
      reject
    ) => {

      let popup =
        null;


      let timeoutTimer =
        null;


      let settled =
        false;


      // ===================================================
      // CLEANUP
      // ===================================================

      const cleanup =
        () => {

          window.removeEventListener(
            "message",
            handleMessage
          );


          if (timeoutTimer) {

            window.clearTimeout(
              timeoutTimer
            );

          }

        };


      // ===================================================
      // RESOLVE
      // ===================================================

      const finishResolve =
        (
          value
        ) => {

          if (settled) {

            return;

          }


          settled =
            true;


          cleanup();


          resolve(
            value
          );

        };


      // ===================================================
      // REJECT
      // ===================================================

      const finishReject =
        (
          error
        ) => {

          if (settled) {

            return;

          }


          settled =
            true;


          cleanup();


          try {

            if (
              popup &&
              !popup.closed
            ) {

              popup.close();

            }

          } catch {

            // Ignore popup cleanup problems.

          }


          reject(
            error
          );

        };


      // ===================================================
      // RECEIVE RESULT FROM BACKEND CALLBACK
      // ===================================================

      function handleMessage(
        event
      ) {

        // -------------------------------------------------
        // SECURITY:
        // only trust messages coming from SHOBDO backend.
        // -------------------------------------------------

        if (
          event.origin !==
          expectedOrigin
        ) {

          return;

        }


        // -------------------------------------------------
        // Make sure the message belongs to this popup.
        // -------------------------------------------------

        if (
          popup &&
          event.source !== popup
        ) {

          return;

        }


        const payload =
          event.data;


        if (
          !payload ||
          typeof payload !== "object" ||
          payload.source !==
            INSTAGRAM_POPUP_SOURCE
        ) {

          return;

        }


        // -------------------------------------------------
        // INSTAGRAM ALREADY CONNECTED
        // -------------------------------------------------

        if (
          payload.status ===
          "authenticated"
        ) {

          clearPendingInstagramLink();


          finishResolve(

            saveAuthenticationResponse(
              payload
            )

          );


          return;

        }


        // -------------------------------------------------
        // FIRST-TIME LINK REQUIRED
        // -------------------------------------------------

        if (
          payload.status ===
          "link_required"
        ) {

          setPendingInstagramLink(
            payload
          );


          finishResolve(
            payload
          );


          return;

        }


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        finishReject(

          createInstagramPopupError(
            payload
          )

        );

      }


      // ===================================================
      // LISTEN FOR CALLBACK MESSAGE
      // ===================================================

      window.addEventListener(
        "message",
        handleMessage
      );


      // ===================================================
      // OPEN POPUP
      // ===================================================

      try {

        popup =
          window.open(
            getInstagramStartUrl(),
            INSTAGRAM_POPUP_NAME,
            popupFeatures
          );

      } catch (error) {

        finishReject(
          error
        );


        return;

      }


      // ===================================================
      // POPUP BLOCKED
      // ===================================================

      if (!popup) {

        const error =
          new Error(
            "The Instagram sign-in popup was blocked. " +
            "Allow popups for SHOBDO and try again."
          );


        error.code =
          "instagram_popup_blocked";


        finishReject(
          error
        );


        return;

      }


      try {

        popup.focus();

      } catch {

        // Browser may block programmatic focus.

      }


      // ===================================================
      // TIMEOUT
      // ===================================================

      timeoutTimer =
        window.setTimeout(
          () => {

            const error =
              new Error(
                "Instagram sign-in timed out. " +
                "Please try again."
              );


            error.code =
              "instagram_popup_timeout";


            finishReject(
              error
            );

          },
          INSTAGRAM_POPUP_TIMEOUT_MS
        );

    }
  );

}


// =========================================================
// INSTAGRAM ALIASES
// =========================================================

export const instagramLogin =
  loginWithInstagram;


export const loginUserWithInstagram =
  loginWithInstagram;


// =========================================================
// INSTAGRAM LINK TOKEN NORMALIZER
// =========================================================

function getInstagramLinkTokenFromInput(
  input
) {

  if (
    typeof input ===
      "object" &&
    input !== null
  ) {

    return String(

      input.link_token ||
      input.instagram_link_token ||
      ""

    ).trim();

  }


  return String(
    input ||
    ""
  ).trim();

}


// =========================================================
// LINK INSTAGRAM TO CURRENT SHOBDO USER
// =========================================================

export async function linkInstagramAccount(
  input
) {

  const providedToken =
    getInstagramLinkTokenFromInput(
      input
    );


  const pendingLink =
    getPendingInstagramLink();


  const linkToken =
    providedToken ||
    pendingLink?.link_token ||
    "";


  if (!linkToken) {

    const error =
      new Error(
        "Instagram connection information is missing. " +
        "Start Instagram sign-in again."
      );


    error.code =
      "instagram_link_token_missing";


    throw error;

  }


  const shobdoToken =
    getStoredToken();


  if (!shobdoToken) {

    const error =
      new Error(
        "Sign in to your SHOBDO account " +
        "before connecting Instagram."
      );


    error.code =
      "shobdo_auth_required";


    error.status =
      401;


    throw error;

  }


  try {

    const data =
      await authRequest(
        "/auth/instagram/link",
        {

          method:
            "POST",

          includeAuth:
            true,

          body:
            JSON.stringify({

              link_token:
                linkToken,

            }),

        }
      );


    clearPendingInstagramLink();


    return data;

  } catch (error) {

    if (
      error?.code ===
        "instagram_link_token_expired" ||
      error?.code ===
        "instagram_link_token_invalid" ||
      error?.code ===
        "instagram_account_conflict"
    ) {

      clearPendingInstagramLink();

    }


    throw error;

  }

}


// =========================================================
// LINK CURRENT PENDING INSTAGRAM IDENTITY
// =========================================================

export async function linkPendingInstagramAccount() {

  const pending =
    getPendingInstagramLink();


  if (
    !pending?.link_token
  ) {

    return null;

  }


  return linkInstagramAccount(
    pending
  );

}


// =========================================================
// CURRENT USER
// =========================================================

export async function getCurrentUser() {

  const token =
    getStoredToken();


  if (!token) {

    return null;

  }


  try {

    const data =
      await authRequest(
        "/auth/me",
        {

          method:
            "GET",

        }
      );


    return (
      data.user ||
      null
    );

  } catch (error) {

    if (
      error?.status === 401 ||
      error?.status === 403
    ) {

      removeStoredToken();

    }


    return null;

  }

}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {

  const token =
    getStoredToken();


  if (!token) {

    removeStoredToken();


    return {

      message:
        "Logged out successfully.",

    };

  }


  try {

    const data =
      await authRequest(
        "/auth/logout",
        {

          method:
            "POST",

        }
      );


    removeStoredToken();


    return data;

  } catch {

    removeStoredToken();


    return {

      message:
        "Logged out locally.",

    };

  }

}


// =========================================================
// FORGOT PASSWORD
// =========================================================

export async function forgotPassword(
  input
) {

  const email =
    typeof input === "object" &&
    input !== null

      ? input.email

      : input;


  const cleanEmail =
    String(
      email ||
      ""
    )
      .trim()
      .toLowerCase();


  return authRequest(
    "/auth/forgot-password",
    {

      method:
        "POST",

      includeAuth:
        false,

      body:
        JSON.stringify({

          email:
            cleanEmail,

        }),

    }
  );

}


// =========================================================
// VALIDATE PASSWORD RESET TOKEN
// =========================================================

export async function validateResetToken(
  token
) {

  const cleanToken =
    String(
      token ||
      ""
    ).trim();


  if (!cleanToken) {

    const error =
      new Error(
        "Password reset token " +
        "is missing."
      );


    error.code =
      "reset_token_missing";


    throw error;

  }


  return authRequest(
    `/auth/reset-password/${encodeURIComponent(
      cleanToken
    )}`,
    {

      method:
        "GET",

      includeAuth:
        false,

    }
  );

}


// =========================================================
// RESET PASSWORD
// =========================================================

export async function resetPassword(
  token,
  input,
  legacyConfirmPassword
) {

  const cleanToken =
    String(
      token ||
      ""
    ).trim();


  if (!cleanToken) {

    const error =
      new Error(
        "Password reset token " +
        "is missing."
      );


    error.code =
      "reset_token_missing";


    throw error;

  }


  let password;
  let confirmPassword;


  if (
    typeof input === "object" &&
    input !== null
  ) {

    password =
      input.password;


    confirmPassword =
      input.confirmPassword ??
      input.confirm_password ??
      input.password;

  } else {

    password =
      input;


    confirmPassword =
      legacyConfirmPassword ??
      input;

  }


  const cleanPassword =
    String(
      password ||
      ""
    );


  const cleanConfirmPassword =
    String(
      confirmPassword ||
      ""
    );


  return authRequest(
    `/auth/reset-password/${encodeURIComponent(
      cleanToken
    )}`,
    {

      method:
        "POST",

      includeAuth:
        false,

      body:
        JSON.stringify({

          password:
            cleanPassword,

          confirm_password:
            cleanConfirmPassword,

        }),

    }
  );

}


// =========================================================
// AUTHENTICATION STATUS
// =========================================================

export function isAuthenticated() {

  return Boolean(
    getStoredToken()
  );

}


// =========================================================
// GET SHOBDO JWT
// =========================================================

export function getAuthToken() {

  return getStoredToken();

}


// =========================================================
// SET SHOBDO JWT
// =========================================================

export function setAuthToken(
  token
) {

  if (!token) {

    removeStoredToken();


    return;

  }


  storeToken(
    token
  );

}


// =========================================================
// CLEAR SHOBDO JWT
// =========================================================

export function clearAuthToken() {

  removeStoredToken();

}


// =========================================================
// PUBLIC CONSTANTS
// =========================================================

export const AUTH_TOKEN_KEY =
  TOKEN_KEY;


export const INSTAGRAM_PENDING_LINK_TOKEN_KEY =
  INSTAGRAM_LINK_TOKEN_KEY;


export const AUTH_API_URL =
  API_URL;