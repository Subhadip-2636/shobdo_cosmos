const RAW_API_URL = (
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
// SHOBDO JWT
// =========================================================

const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// INSTAGRAM STORAGE
// =========================================================
//
// link token:
// Verified Instagram identity waiting to be connected to an
// authenticated SHOBDO user.
//
// handoff token:
// Very short-lived backend-signed token returned after the
// full-page Instagram OAuth redirect.
//
// =========================================================

const INSTAGRAM_LINK_TOKEN_KEY =
  "shobdo_instagram_link_token";

const INSTAGRAM_LINK_USERNAME_KEY =
  "shobdo_instagram_username";

const INSTAGRAM_HANDOFF_TOKEN_KEY =
  "shobdo_instagram_handoff_token";


// =========================================================
// LOCAL STORAGE
// =========================================================

function canUseLocalStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );

}


// =========================================================
// SESSION STORAGE
// =========================================================

function canUseSessionStorage() {

  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
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

    return window.localStorage.getItem(
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

    window.localStorage.setItem(
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

    window.localStorage.removeItem(
      TOKEN_KEY
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// EXTRACT JWT
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
              String(
                name ||
                ""
              ).trim(),

            email:
              String(
                email ||
                ""
              )
                .trim()
                .toLowerCase(),

            password:
              String(
                password ||
                ""
              ),

            confirm_password:
              String(
                confirmPassword ??
                password ??
                ""
              ),

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

export async function loginUser(
  credentials,
  legacyPassword
) {

  let email;
  let password;


  if (
    typeof credentials === "object" &&
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
              String(
                email ||
                ""
              )
                .trim()
                .toLowerCase(),

            password:
              String(
                password ||
                ""
              ),

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
    (
      typeof input === "object" &&
      input !== null
    )
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


export const googleLogin =
  loginWithGoogle;


export const loginUserWithGoogle =
  loginWithGoogle;


// =========================================================
// GOOGLE CONFIGURATION
// =========================================================

export function isGoogleAuthConfigured() {

  return Boolean(
    GOOGLE_CLIENT_ID
  );

}


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
    (
      typeof input === "object" &&
      input !== null
    )
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
        "Facebook access token is missing."
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
// LINK FACEBOOK
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
        "Facebook access token is missing."
      );


    error.code =
      "facebook_token_missing";


    throw error;

  }


  if (!getStoredToken()) {

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
// FACEBOOK CONFIGURATION
// =========================================================

export function isFacebookAuthConfigured() {

  return Boolean(
    FACEBOOK_APP_ID
  );

}


export function getFacebookAppId() {

  return (
    FACEBOOK_APP_ID ||
    null
  );

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
// INSTAGRAM CONFIGURATION
// =========================================================

export function isInstagramAuthConfigured() {

  return Boolean(
    API_URL
  );

}


// =========================================================
// INSTAGRAM HANDOFF STORAGE
// =========================================================

function setPendingInstagramHandoff(
  token
) {

  if (
    !token ||
    !canUseSessionStorage()
  ) {

    return false;

  }


  try {

    window.sessionStorage.setItem(
      INSTAGRAM_HANDOFF_TOKEN_KEY,
      String(
        token
      )
    );


    return true;

  } catch {

    return false;

  }

}


function getPendingInstagramHandoff() {

  if (!canUseSessionStorage()) {

    return "";

  }


  try {

    return String(
      window.sessionStorage.getItem(
        INSTAGRAM_HANDOFF_TOKEN_KEY
      )
      ||
      ""
    ).trim();

  } catch {

    return "";

  }

}


function clearPendingInstagramHandoff() {

  if (!canUseSessionStorage()) {

    return;

  }


  try {

    window.sessionStorage.removeItem(
      INSTAGRAM_HANDOFF_TOKEN_KEY
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// SAVE PENDING INSTAGRAM LINK
// =========================================================

export function setPendingInstagramLink(
  input
) {

  const payload =
    (
      typeof input === "object" &&
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

    window.sessionStorage.setItem(
      INSTAGRAM_LINK_TOKEN_KEY,
      linkToken
    );


    if (username) {

      window.sessionStorage.setItem(
        INSTAGRAM_LINK_USERNAME_KEY,
        username
      );

    } else {

      window.sessionStorage.removeItem(
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
      window.sessionStorage.getItem(
        INSTAGRAM_LINK_TOKEN_KEY
      );


    if (!linkToken) {

      return null;

    }


    return {

      link_token:
        linkToken,

      instagram_username:
        window.sessionStorage.getItem(
          INSTAGRAM_LINK_USERNAME_KEY
        )
        ||
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

    window.sessionStorage.removeItem(
      INSTAGRAM_LINK_TOKEN_KEY
    );


    window.sessionStorage.removeItem(
      INSTAGRAM_LINK_USERNAME_KEY
    );

  } catch {

    // Ignore browser storage restrictions.

  }

}


// =========================================================
// REMOVE INSTAGRAM CALLBACK FROM ADDRESS BAR
// =========================================================
//
// Backend returns:
//
// /login#instagram=callback&handoff=...
//
// Once read, remove it immediately from the visible URL.
//
// =========================================================

function clearInstagramHash() {

  if (
    typeof window === "undefined"
  ) {

    return;

  }


  try {

    const cleanUrl =
      (
        window.location.pathname +
        window.location.search
      );


    window.history.replaceState(

      window.history.state,

      document.title,

      cleanUrl

    );

  } catch {

    // Authentication can still continue if this fails.

  }

}


// =========================================================
// PARSE INSTAGRAM CALLBACK HASH
// =========================================================

function parseInstagramHash() {

  if (
    typeof window === "undefined"
  ) {

    return null;

  }


  const rawHash =
    String(
      window.location.hash ||
      ""
    );


  if (
    !rawHash.startsWith(
      "#"
    )
  ) {

    return null;

  }


  const params =
    new URLSearchParams(
      rawHash.slice(
        1
      )
    );


  const mode =
    String(
      params.get(
        "instagram"
      )
      ||
      ""
    ).trim();


  if (
    mode !== "callback" &&
    mode !== "error"
  ) {

    return null;

  }


  return {

    mode,

    handoff:
      String(
        params.get(
          "handoff"
        )
        ||
        ""
      ).trim(),

    code:
      String(
        params.get(
          "code"
        )
        ||
        ""
      ).trim(),

    message:
      String(
        params.get(
          "message"
        )
        ||
        ""
      ).trim(),

  };

}


// =========================================================
// HAS INSTAGRAM REDIRECT CALLBACK
// =========================================================

export function hasInstagramRedirectCallback() {

  const parsed =
    parseInstagramHash();


  return Boolean(
    parsed ||
    getPendingInstagramHandoff()
  );

}


// =========================================================
// START INSTAGRAM LOGIN
// =========================================================
//
// IMPORTANT:
//
// This is no longer a popup.
//
// The browser navigates:
//
// SHOBDO
//   ↓
// Render /instagram/start
//   ↓
// Instagram
//   ↓
// Render /instagram/callback
//   ↓
// SHOBDO /login#instagram=callback&handoff=...
//
// =========================================================

export function startInstagramLogin() {

  if (
    typeof window === "undefined"
  ) {

    const error =
      new Error(
        "Instagram sign-in requires a browser."
      );


    error.code =
      "instagram_browser_required";


    throw error;

  }


  // A new OAuth attempt must not accidentally consume
  // an older Instagram identity.

  clearPendingInstagramHandoff();

  clearPendingInstagramLink();


  window.location.assign(
    getInstagramStartUrl()
  );

}


// =========================================================
// BACKWARD-COMPATIBLE INSTAGRAM LOGIN EXPORT
// =========================================================
//
// Current Login.jsx imports loginWithInstagram().
//
// The browser navigates away, so this promise intentionally
// does not resolve after successful navigation.
//
// =========================================================

export function loginWithInstagram() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      try {

        startInstagramLogin();

      } catch (error) {

        reject(
          error
        );

      }

    }
  );

}


export const instagramLogin =
  loginWithInstagram;


export const loginUserWithInstagram =
  loginWithInstagram;


// =========================================================
// EXCHANGE INSTAGRAM HANDOFF
// =========================================================

async function exchangeInstagramHandoff(
  handoffToken
) {

  const cleanToken =
    String(
      handoffToken ||
      ""
    ).trim();


  if (!cleanToken) {

    const error =
      new Error(
        "Instagram sign-in information is missing."
      );


    error.code =
      "instagram_handoff_missing";


    throw error;

  }


  const data =
    await authRequest(
      "/auth/instagram/exchange",
      {

        method:
          "POST",

        includeAuth:
          false,

        body:
          JSON.stringify({

            handoff_token:
              cleanToken,

          }),

      }
    );


  // -------------------------------------------------------
  // INSTAGRAM VERIFIED BUT NOT LINKED TO SHOBDO
  // -------------------------------------------------------

  if (
    data?.status ===
    "link_required"
  ) {

    setPendingInstagramLink(
      data
    );


    return data;

  }


  // -------------------------------------------------------
  // EXISTING INSTAGRAM-LINKED SHOBDO USER
  // -------------------------------------------------------

  if (
    data?.status ===
      "authenticated"
    ||
    extractAccessToken(
      data
    )
  ) {

    clearPendingInstagramLink();


    return saveAuthenticationResponse(
      data
    );

  }


  const error =
    new Error(
      data?.message ||
      (
        "Instagram authentication returned " +
        "an unexpected response."
      )
    );


  error.code =
    data?.code ||
    "instagram_authentication_failed";


  error.provider =
    "instagram";


  error.data =
    data ||
    {};


  throw error;

}


// =========================================================
// CONSUME INSTAGRAM REDIRECT CALLBACK
// =========================================================
//
// Login.jsx calls this when it loads.
//
// SUCCESS, EXISTING LINK:
// backend exchange returns SHOBDO JWT.
//
// SUCCESS, FIRST LINK:
// backend exchange returns link_required.
// Signed link token is stored in sessionStorage.
//
// ERROR:
// throws a normal API-style Error.
//
// =========================================================

export async function consumeInstagramRedirectCallback() {

  if (
    typeof window === "undefined"
  ) {

    return null;

  }


  const callback =
    parseInstagramHash();


  // =======================================================
  // BACKEND RETURNED AN OAUTH ERROR
  // =======================================================

  if (
    callback?.mode ===
    "error"
  ) {

    clearPendingInstagramHandoff();


    clearInstagramHash();


    const error =
      new Error(
        callback.message ||
        (
          "Unable to complete " +
          "Instagram sign-in."
        )
      );


    error.code =
      callback.code ||
      "instagram_authentication_failed";


    error.provider =
      "instagram";


    throw error;

  }


  // =======================================================
  // OBTAIN HANDOFF
  // =======================================================

  let handoffToken =
    "";


  if (
    callback?.mode ===
    "callback"
  ) {

    handoffToken =
      callback.handoff;


    if (!handoffToken) {

      clearInstagramHash();


      const error =
        new Error(
          "Instagram sign-in information is missing."
        );


      error.code =
        "instagram_handoff_missing";


      error.provider =
        "instagram";


      throw error;

    }


    // Save temporarily so an accidental reload during the
    // exchange can retry while the handoff remains valid.

    setPendingInstagramHandoff(
      handoffToken
    );


    // Remove token from visible browser URL immediately.

    clearInstagramHash();

  } else {

    handoffToken =
      getPendingInstagramHandoff();

  }


  // No Instagram callback on this page.

  if (!handoffToken) {

    return null;

  }


  // =======================================================
  // EXCHANGE WITH BACKEND
  // =======================================================

  try {

    const result =
      await exchangeInstagramHandoff(
        handoffToken
      );


    clearPendingInstagramHandoff();


    return result;

  } catch (error) {

    // For a temporary network failure, retain the very
    // short-lived handoff in sessionStorage so a refresh can
    // retry. Invalid/expired tokens are removed immediately.

    if (
      error?.code !==
      "network_error"
    ) {

      clearPendingInstagramHandoff();

    }


    throw error;

  }

}


// =========================================================
// INSTAGRAM LINK TOKEN NORMALIZER
// =========================================================

function getInstagramLinkTokenFromInput(
  input
) {

  if (
    typeof input === "object" &&
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
    (
      providedToken ||
      pendingLink?.link_token ||
      ""
    );


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


  if (!getStoredToken()) {

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
        "instagram_link_token_expired"
      ||
      error?.code ===
        "instagram_link_token_invalid"
      ||
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

    clearPendingInstagramHandoff();

    clearPendingInstagramLink();


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

    clearPendingInstagramHandoff();

    clearPendingInstagramLink();


    return data;

  } catch {

    removeStoredToken();

    clearPendingInstagramHandoff();

    clearPendingInstagramLink();


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
    (
      typeof input === "object" &&
      input !== null
    )
      ? input.email
      : input;


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
            String(
              email ||
              ""
            )
              .trim()
              .toLowerCase(),

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
            String(
              password ||
              ""
            ),

          confirm_password:
            String(
              confirmPassword ||
              ""
            ),

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


export const INSTAGRAM_PENDING_HANDOFF_TOKEN_KEY =
  INSTAGRAM_HANDOFF_TOKEN_KEY;


export const AUTH_API_URL =
  API_URL;