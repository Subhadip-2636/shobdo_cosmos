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
// - Facebook account linking
// - Current authenticated user
// - Logout
// - Forgot password
// - Password-reset token validation
// - Password reset
// - JWT token storage
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
// API URL NORMALIZATION
// =========================================================
//
// Supports:
//
// VITE_API_URL=http://127.0.0.1:5000
//
// OR:
//
// VITE_API_URL=http://127.0.0.1:5000/api
//
// without producing:
//
// /api/api
//
// =========================================================

const API_URL =
  RAW_API_URL.endsWith("/api")
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


// =========================================================
// GOOGLE CLIENT ID
// =========================================================
//
// Frontend/.env:
//
// VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
//
// This value is public frontend configuration.
// It is NOT the Google Client Secret.
//
// =========================================================

export const GOOGLE_CLIENT_ID =
  String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();


// =========================================================
// FACEBOOK APP ID
// =========================================================
//
// Frontend/.env:
//
// VITE_FACEBOOK_APP_ID=1234567890
//
// The Facebook App ID is public frontend configuration.
//
// NEVER put FACEBOOK_APP_SECRET in Vite.
// The App Secret belongs only on the Flask backend.
//
// =========================================================

export const FACEBOOK_APP_ID =
  String(
    import.meta.env.VITE_FACEBOOK_APP_ID ||
    ""
  ).trim();


// =========================================================
// TOKEN CONFIGURATION
// =========================================================

const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// STORAGE AVAILABILITY
// =========================================================

function canUseLocalStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
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
      String(token)
    );

  } catch {

    // Storage may be blocked in privacy mode.
    // Authentication result is still returned.

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
// CREATE API ERROR
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
        ? "The server could not complete the request."
        : "Something went wrong. Please try again."
    );


  const error =
    new Error(
      message
    );


  // -------------------------------------------------------
  // HTTP INFORMATION
  // -------------------------------------------------------

  error.status =
    response.status;


  error.statusText =
    response.statusText;


  // -------------------------------------------------------
  // BACKEND APPLICATION ERROR CODE
  // -------------------------------------------------------
  //
  // Examples:
  //
  // account_link_required
  // google_account_conflict
  // facebook_account_conflict
  // facebook_email_required
  //
  // -------------------------------------------------------

  error.code =
    data?.code ||
    null;


  // -------------------------------------------------------
  // PROVIDER
  // -------------------------------------------------------

  error.provider =
    data?.provider ||
    null;


  // -------------------------------------------------------
  // FULL BACKEND RESPONSE
  // -------------------------------------------------------

  error.data =
    data ||
    {};


  return error;

}


// =========================================================
// RESPONSE HANDLER
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
      "Unable to connect to SHOBDO. Please check your internet connection and try again."
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
// AUTH REQUEST
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


  // -------------------------------------------------------
  // SHOBDO JWT
  // -------------------------------------------------------

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

    // API-generated errors already have status information.

    if (
      error?.status !==
      undefined
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
// PASSWORD LOGIN
// =========================================================
//
// Supports:
//
// loginUser({
//   email,
//   password,
// })
//
// AND:
//
// loginUser(
//   email,
//   password
// )
//
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
//
// Google Identity Services provides:
//
// response.credential
//
// The credential is sent to:
//
// POST /api/auth/google
//
// Flask verifies it and returns the normal SHOBDO JWT.
//
// =========================================================

export async function loginWithGoogle(
  input
) {

  const credential =
    typeof input ===
      "object" &&
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
        "Google sign-in credential is missing."
      );


    error.code =
      "google_credential_missing";


    error.provider =
      "google";


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
// GOOGLE LOGIN ALIASES
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
// GET GOOGLE CLIENT ID
// =========================================================

export function getGoogleClientId() {

  return (
    GOOGLE_CLIENT_ID ||
    null
  );

}


// =========================================================
// FACEBOOK ACCESS TOKEN NORMALIZER
// =========================================================

function normalizeFacebookAccessToken(
  input
) {

  const accessToken =
    typeof input ===
      "object" &&
    input !== null

      ? (
          input.accessToken ||
          input.access_token ||
          input.token ||
          ""
        )

      : input;


  return String(
    accessToken ||
    ""
  ).trim();

}


// =========================================================
// FACEBOOK SIGN-IN
// =========================================================
//
// Facebook JavaScript SDK returns:
//
// authResponse.accessToken
//
// We send it to:
//
// POST /api/auth/facebook
//
// The Flask backend verifies the token with Meta before
// issuing the normal SHOBDO JWT.
//
// =========================================================

export async function loginWithFacebook(
  input
) {

  const cleanAccessToken =
    normalizeFacebookAccessToken(
      input
    );


  if (!cleanAccessToken) {

    const error =
      new Error(
        "Facebook access token is missing."
      );


    error.code =
      "facebook_access_token_missing";


    error.provider =
      "facebook";


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
              cleanAccessToken,
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
// FACEBOOK ACCOUNT LINKING
// =========================================================
//
// Requires an existing authenticated SHOBDO user.
//
// POST /api/auth/facebook/link
//
// Authorization:
//
// Bearer <shobdo_token>
//
// =========================================================

export async function linkFacebookAccount(
  input
) {

  const cleanAccessToken =
    normalizeFacebookAccessToken(
      input
    );


  if (!cleanAccessToken) {

    const error =
      new Error(
        "Facebook access token is missing."
      );


    error.code =
      "facebook_access_token_missing";


    error.provider =
      "facebook";


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
            cleanAccessToken,
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
// GET FACEBOOK APP ID
// =========================================================

export function getFacebookAppId() {

  return (
    FACEBOOK_APP_ID ||
    null
  );

}


// =========================================================
// AUTH PROVIDER CONFIGURATION
// =========================================================
//
// Useful for account/security UI later.
//
// =========================================================

export function getAuthProviderConfig() {

  return {

    google: {
      configured:
        isGoogleAuthConfigured(),

      clientId:
        getGoogleClientId(),
    },


    facebook: {
      configured:
        isFacebookAuthConfigured(),

      appId:
        getFacebookAppId(),
    },

  };

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

    // -----------------------------------------------------
    // REMOVE TOKEN ONLY WHEN AUTHENTICATION IS INVALID
    // -----------------------------------------------------
    //
    // Do not log the user out for:
    //
    // - network failure
    // - temporary backend outage
    // - HTTP 500
    //
    // -----------------------------------------------------

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

    // JWT is currently client-managed.
    //
    // Removing the local JWT logs this browser session out
    // even if the backend cannot currently be reached.

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
//
// Supports:
//
// forgotPassword({
//   email,
// })
//
// AND:
//
// forgotPassword(
//   email
// )
//
// =========================================================

export async function forgotPassword(
  input
) {

  const email =
    typeof input ===
      "object" &&
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
// VALIDATE RESET TOKEN
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
        "Password reset token is missing."
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
//
// Supports:
//
// resetPassword(
//   token,
//   {
//     password,
//     confirmPassword,
//   }
// )
//
// AND:
//
// resetPassword(
//   token,
//   password,
//   confirmPassword
// )
//
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
        "Password reset token is missing."
      );


    error.code =
      "reset_token_missing";


    throw error;

  }


  let password;

  let confirmPassword;


  if (
    typeof input ===
      "object" &&
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
// AUTH TOKEN KEY
// =========================================================

export const AUTH_TOKEN_KEY =
  TOKEN_KEY;


// =========================================================
// AUTH API URL
// =========================================================

export const AUTH_API_URL =
  API_URL;