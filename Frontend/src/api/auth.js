// =========================================================
// SHOBDO AUTHENTICATION API
// =========================================================
//
// Supports:
//
// - Email/password registration
// - Email/password login
// - Google Sign-In
// - Facebook Sign-In
// - Secure Facebook account linking
// - Current authenticated user
// - Logout
// - Forgot password
// - Password reset
// - JWT storage
//
// =========================================================


// =========================================================
// ENVIRONMENT
// =========================================================

const RAW_API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000"
  )
    .trim()
    .replace(/\/+$/, "");


// =========================================================
// API URL
// =========================================================

const API_URL =
  RAW_API_URL.endsWith("/api")
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


// =========================================================
// GOOGLE CONFIGURATION
// =========================================================

export const GOOGLE_CLIENT_ID =
  String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();


// =========================================================
// FACEBOOK CONFIGURATION
// =========================================================
//
// Facebook App ID is PUBLIC configuration.
//
// NEVER put FACEBOOK_APP_SECRET in the React frontend.
//
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
// TOKEN CONFIGURATION
// =========================================================

const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// STORAGE CHECK
// =========================================================

function canUseLocalStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );

}


// =========================================================
// GET STORED TOKEN
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
// STORE TOKEN
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

    // Storage may be unavailable in privacy mode.

  }

}


// =========================================================
// REMOVE TOKEN
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

    // Ignore storage cleanup errors.

  }

}


// =========================================================
// EXTRACT SHOBDO JWT
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
// COMMON AUTH REQUEST
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
// GOOGLE SIGN-IN
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


// =========================================================
// GOOGLE ALIASES
// =========================================================

export const googleLogin =
  loginWithGoogle;


export const loginUserWithGoogle =
  loginWithGoogle;


// =========================================================
// GOOGLE CONFIG CHECK
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
// FACEBOOK SIGN-IN
// =========================================================
//
// Browser flow:
//
// FB.login()
//      ↓
// Facebook user access token
//      ↓
// POST /api/auth/facebook
//      ↓
// Flask validates token with Meta
//      ↓
// SHOBDO JWT
//
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


// =========================================================
// FACEBOOK LOGIN ALIASES
// =========================================================

export const facebookLogin =
  loginWithFacebook;


export const loginUserWithFacebook =
  loginWithFacebook;


// =========================================================
// LINK FACEBOOK TO EXISTING SHOBDO USER
// =========================================================
//
// IMPORTANT:
//
// This request requires an existing SHOBDO JWT.
//
// Flow:
//
// 1. User clicks Facebook.
// 2. Backend detects existing SHOBDO email.
// 3. Frontend keeps Facebook token temporarily.
// 4. User signs into existing SHOBDO account.
// 5. SHOBDO JWT is stored.
// 6. This endpoint links Facebook securely.
//
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
// FACEBOOK CONFIG CHECK
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
// AUTH STATUS
// =========================================================

export function isAuthenticated() {

  return Boolean(
    getStoredToken()
  );

}


// =========================================================
// GET AUTH TOKEN
// =========================================================

export function getAuthToken() {

  return getStoredToken();

}


// =========================================================
// SET AUTH TOKEN
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
// CLEAR AUTH TOKEN
// =========================================================

export function clearAuthToken() {

  removeStoredToken();

}


// =========================================================
// PUBLIC CONSTANTS
// =========================================================

export const AUTH_TOKEN_KEY =
  TOKEN_KEY;


export const AUTH_API_URL =
  API_URL;