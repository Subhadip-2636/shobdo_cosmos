// ============================================================
// SHOBDO AUTH API
// Authentication / JWT / User Session
// Vite + React + Flask
// ============================================================


// ============================================================
// BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


// ============================================================
// AUTH REQUEST HELPER
// ============================================================

async function authRequest(
  endpoint,
  options = {}
) {

  try {

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          ...(options.headers || {}),
        },

        /*
         * Required when your Flask backend
         * uses cookies/session authentication.
         */
        credentials: "include",
      }
    );


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    let data = null;

    const contentType =
      response.headers.get(
        "content-type"
      );


    if (
      contentType &&
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();

      data = text
        ? {
            message: text,
          }
        : null;
    }


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    if (!response.ok) {

      const message =
        data?.message ||
        data?.error ||
        data?.msg ||
        `Authentication request failed (${response.status})`;


      throw new Error(message);
    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return data;

  } catch (error) {

    console.error(
      `Auth API Error [${endpoint}]:`,
      error
    );


    throw error;
  }
}


// ============================================================
// LOGIN
// ============================================================

export async function loginUser(
  email,
  password
) {

  if (!email || !password) {

    throw new Error(
      "Email and password are required."
    );
  }


  const data =
    await authRequest(
      "/api/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );


  /*
   * Store JWT if Flask returns one.
   *
   * This supports:
   *
   * {
   *   access_token: "...",
   *   user: {...}
   * }
   */

  if (data?.access_token) {

    localStorage.setItem(
      "shobdo_access_token",
      data.access_token
    );
  }


  /*
   * Some Flask backends may return:
   *
   * token
   *
   * instead of:
   *
   * access_token
   */

  if (
    !data?.access_token &&
    data?.token
  ) {

    localStorage.setItem(
      "shobdo_access_token",
      data.token
    );
  }


  if (data?.refresh_token) {

    localStorage.setItem(
      "shobdo_refresh_token",
      data.refresh_token
    );
  }


  if (data?.user) {

    localStorage.setItem(
      "shobdo_user",
      JSON.stringify(data.user)
    );
  }


  return data;
}


// ============================================================
// REGISTER
// ============================================================

export async function registerUser(
  userData
) {

  if (!userData) {

    throw new Error(
      "Registration data is required."
    );
  }


  const {
    name,
    username,
    email,
    password,
  } = userData;


  if (
    !name ||
    !username ||
    !email ||
    !password
  ) {

    throw new Error(
      "Name, username, email and password are required."
    );
  }


  const data =
    await authRequest(
      "/api/auth/register",
      {
        method: "POST",

        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      }
    );


  // --------------------------------------------------------
  // SAVE TOKEN
  // --------------------------------------------------------

  if (data?.access_token) {

    localStorage.setItem(
      "shobdo_access_token",
      data.access_token
    );
  }


  if (
    !data?.access_token &&
    data?.token
  ) {

    localStorage.setItem(
      "shobdo_access_token",
      data.token
    );
  }


  if (data?.refresh_token) {

    localStorage.setItem(
      "shobdo_refresh_token",
      data.refresh_token
    );
  }


  // --------------------------------------------------------
  // SAVE USER
  // --------------------------------------------------------

  if (data?.user) {

    localStorage.setItem(
      "shobdo_user",
      JSON.stringify(data.user)
    );
  }


  return data;
}


// ============================================================
// GET CURRENT USER
// ============================================================

export async function getCurrentUser() {

  const token =
    localStorage.getItem(
      "shobdo_access_token"
    );


  /*
   * If there is no JWT, there is no
   * authenticated user.
   */

  if (!token) {

    const savedUser =
      localStorage.getItem(
        "shobdo_user"
      );


    if (savedUser) {

      try {

        return JSON.parse(
          savedUser
        );

      } catch {

        localStorage.removeItem(
          "shobdo_user"
        );

      }
    }


    return null;
  }


  try {

    const data =
      await authRequest(
        "/api/auth/me",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    /*
     * Flask may return:
     *
     * {
     *   user: {...}
     * }
     */

    const user =
      data?.user ||
      data;


    if (user) {

      localStorage.setItem(
        "shobdo_user",
        JSON.stringify(user)
      );
    }


    return user;

  } catch (error) {

    /*
     * Invalid / expired token.
     */

    if (
      error.message?.includes(
        "401"
      ) ||
      error.message
        ?.toLowerCase()
        .includes("unauthorized")
    ) {

      clearAuthStorage();

      return null;
    }


    throw error;
  }
}


// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {

  const token =
    localStorage.getItem(
      "shobdo_access_token"
    );


  try {

    /*
     * If your Flask backend has
     * a logout endpoint, notify it.
     */

    if (token) {

      await authRequest(
        "/api/auth/logout",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );
    }

  } catch (error) {

    /*
     * Even if backend logout fails,
     * local authentication should still
     * be removed.
     */

    console.warn(
      "Backend logout failed:",
      error
    );

  } finally {

    clearAuthStorage();
  }
}


// ============================================================
// CLEAR AUTH STORAGE
// ============================================================

export function clearAuthStorage() {

  localStorage.removeItem(
    "shobdo_access_token"
  );

  localStorage.removeItem(
    "shobdo_refresh_token"
  );

  localStorage.removeItem(
    "shobdo_user"
  );
}


// ============================================================
// CHECK LOGIN STATUS
// ============================================================

export function isAuthenticated() {

  return Boolean(
    localStorage.getItem(
      "shobdo_access_token"
    )
  );
}


// ============================================================
// GET ACCESS TOKEN
// ============================================================

export function getAccessToken() {

  return localStorage.getItem(
    "shobdo_access_token"
  );
}


// ============================================================
// AUTHORIZED HEADERS
// ============================================================

export function getAuthHeaders() {

  const token =
    getAccessToken();


  if (!token) {

    return {
      "Content-Type":
        "application/json",
    };
  }


  return {

    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,

  };
}


// ============================================================
// REFRESH TOKEN
// ============================================================

export async function refreshAccessToken() {

  const refreshToken =
    localStorage.getItem(
      "shobdo_refresh_token"
    );


  if (!refreshToken) {

    throw new Error(
      "No refresh token available."
    );
  }


  const data =
    await authRequest(
      "/api/auth/refresh",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${refreshToken}`,
        },
      }
    );


  const newToken =
    data?.access_token ||
    data?.token;


  if (!newToken) {

    throw new Error(
      "No access token returned by server."
    );
  }


  localStorage.setItem(
    "shobdo_access_token",
    newToken
  );


  return newToken;
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const auth = {

  loginUser,

  registerUser,

  getCurrentUser,

  logoutUser,

  clearAuthStorage,

  isAuthenticated,

  getAccessToken,

  getAuthHeaders,

  refreshAccessToken,

};


export default auth;