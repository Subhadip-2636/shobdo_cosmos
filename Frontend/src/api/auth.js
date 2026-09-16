// =========================================================
// SHOBDO AUTHENTICATION API
// =========================================================
//
// Supports:
//
// - Email/password registration
// - Email/password login
// - Google Sign-In
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
// Supports either:
//
// VITE_API_URL=http://127.0.0.1:5000
//
// OR:
//
// VITE_API_URL=http://127.0.0.1:5000/api
//
// without accidentally producing:
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
// This value is public configuration for Google Identity
// Services. It is NOT the Google Client Secret.
//
// Frontend/.env:
//
// VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
//
// =========================================================

export const GOOGLE_CLIENT_ID =
  String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
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

    return (
      localStorage.getItem(
        TOKEN_KEY
      )
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

    // Local storage may be unavailable in privacy mode.
    // Authentication response is still returned to caller.

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

    // Ignore local-storage cleanup errors.

  }

}


// =========================================================
// EXTRACT TOKEN
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
  // HTTP information
  // -------------------------------------------------------

  error.status =
    response.status;

  error.statusText =
    response.statusText;


  // -------------------------------------------------------
  // Backend application error code
  // -------------------------------------------------------
  //
  // Example:
  //
  // account_link_required
  // google_account_conflict
  //
  // -------------------------------------------------------

  error.code =
    data?.code ||
    null;


  // Entire backend response, useful to calling components.

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


  // -------------------------------------------------------
  // READ BODY
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // ERROR RESPONSE
  // -------------------------------------------------------

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
  // JWT
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

    // API-generated error.
    if (
      error?.status !== undefined
    ) {

      throw error;

    }


    // Browser/network fetch error.
    throw createNetworkError(
      error
    );

  }

}


// =========================================================
// SAVE AUTH RESPONSE
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


  // -------------------------------------------------------
  // OBJECT STYLE
  // -------------------------------------------------------

  if (
    typeof credentials ===
      "object" &&
    credentials !== null
  ) {

    email =
      credentials.email;

    password =
      credentials.password;

  }


  // -------------------------------------------------------
  // LEGACY STYLE
  // -------------------------------------------------------

  else {

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
// Google Identity Services calls the frontend with:
//
// response.credential
//
// That credential is Google's ID-token JWT.
//
// We send it to:
//
// POST /api/auth/google
//
// The Flask backend verifies it before issuing the normal
// SHOBDO JWT.
//
// =========================================================

export async function loginWithGoogle(
  input
) {

  // -------------------------------------------------------
  // SUPPORT BOTH:
  //
  // loginWithGoogle("credential")
  //
  // loginWithGoogle({
  //   credential: "credential"
  // })
  //
  // -------------------------------------------------------

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
//
// These aliases make future components easier to integrate
// without breaking if a component uses another reasonable
// function name.
//
// =========================================================

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
// GET GOOGLE CLIENT ID
// =========================================================

export function getGoogleClientId() {

  return (
    GOOGLE_CLIENT_ID ||
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

    // -----------------------------------------------------
    // Remove token only when authentication is invalid.
    //
    // Do NOT automatically log the user out because of:
    //
    // - temporary network failure
    // - backend outage
    // - 500 response
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


  // -------------------------------------------------------
  // ALREADY LOGGED OUT
  // -------------------------------------------------------

  if (!token) {

    removeStoredToken();


    return {
      message:
        "Logged out successfully.",
    };

  }


  // -------------------------------------------------------
  // SERVER LOGOUT
  // -------------------------------------------------------

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

    // JWT is client-managed currently.
    //
    // Even if backend logout cannot be reached, removing
    // the local token logs the current browser session out.

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


  // -------------------------------------------------------
  // OBJECT STYLE
  // -------------------------------------------------------

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

  }


  // -------------------------------------------------------
  // LEGACY STYLE
  // -------------------------------------------------------

  else {

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
//
// Useful if another authentication flow receives a
// SHOBDO JWT and needs to store it.
//
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
//
// Useful for debugging only.
//
// =========================================================

export const AUTH_API_URL =
  API_URL;