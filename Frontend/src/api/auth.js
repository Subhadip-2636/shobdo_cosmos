const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api";


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// TOKEN HELPERS
// =========================================================

function getStoredToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}


function storeToken(
  token
) {
  if (token) {
    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  }
}


function removeStoredToken() {
  localStorage.removeItem(
    TOKEN_KEY
  );
}


// =========================================================
// RESPONSE HANDLER
// =========================================================

async function parseResponse(
  response
) {

  let data = {};

  try {

    data =
      await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Something went wrong. Please try again."
    );

  }


  return data;
}


// =========================================================
// AUTH REQUEST
// =========================================================

async function authRequest(
  endpoint,
  options = {}
) {

  const token =
    getStoredToken();


  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {}),
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );


  return parseResponse(
    response
  );
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
      name || ""
    ).trim();


  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();


  const cleanPassword =
    String(
      password || ""
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
        method: "POST",

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


  const token =
    data.access_token ||
    data.token;


  if (token) {

    storeToken(
      token
    );

  }


  return data;
}


// =========================================================
// LOGIN
// =========================================================
//
// Supports BOTH:
//
// loginUser({
//   email,
//   password,
// })
//
// and:
//
// loginUser(
//   email,
//   password
// )
//
// This keeps older components compatible.
// =========================================================

export async function loginUser(
  credentials,
  legacyPassword
) {

  let email;
  let password;


  if (
    typeof credentials ===
    "object"
    &&
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
      email || ""
    )
      .trim()
      .toLowerCase();


  const cleanPassword =
    String(
      password || ""
    );


  const data =
    await authRequest(
      "/auth/login",
      {
        method: "POST",

        body:
          JSON.stringify({
            email:
              cleanEmail,

            password:
              cleanPassword,
          }),
      }
    );


  const token =
    data.access_token ||
    data.token;


  if (token) {

    storeToken(
      token
    );

  }


  return data;
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
          method: "GET",
        }
      );


    return (
      data.user ||
      null
    );


  } catch (error) {

    removeStoredToken();

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
          method: "POST",
        }
      );


    removeStoredToken();


    return data;


  } catch (error) {

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
// Supports BOTH:
//
// forgotPassword({
//   email,
// })
//
// and:
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
    "object"
    &&
    input !== null
      ? input.email
      : input;


  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();


  return authRequest(
    "/auth/forgot-password",
    {
      method: "POST",

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

  if (!token) {

    throw new Error(
      "Password reset token is missing."
    );

  }


  return authRequest(
    `/auth/reset-password/${encodeURIComponent(
      token
    )}`,
    {
      method: "GET",
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
// AND old style:
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

  if (!token) {

    throw new Error(
      "Password reset token is missing."
    );

  }


  let password;
  let confirmPassword;


  if (
    typeof input ===
    "object"
    &&
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
      password || ""
    );


  const cleanConfirmPassword =
    String(
      confirmPassword || ""
    );


  return authRequest(
    `/auth/reset-password/${encodeURIComponent(
      token
    )}`,
    {
      method: "POST",

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
// AUTH UTILITIES
// =========================================================

export function isAuthenticated() {

  return Boolean(
    getStoredToken()
  );
}


export function getAuthToken() {

  return getStoredToken();
}


export function clearAuthToken() {

  removeStoredToken();
}