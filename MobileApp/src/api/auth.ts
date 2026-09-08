import * as SecureStore from "expo-secure-store";

import {
  API_URL,
} from "./config";


// ==========================================================
// TYPES
// ==========================================================

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}


export interface LoginPayload {
  email: string;
  password: string;
}


export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}


export interface LoginResponse {
  user?: User;
  access_token?: string;
  token?: string;
  message?: string;
}


// ==========================================================
// TOKEN KEY
// ==========================================================

const TOKEN_KEY =
  "shobdo_access_token";


// ==========================================================
// SAVE TOKEN
// ==========================================================

export async function saveToken(
  token: string
): Promise<void> {

  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );

}


// ==========================================================
// GET TOKEN
// ==========================================================

export async function getToken():
Promise<string | null> {

  return await SecureStore.getItemAsync(
    TOKEN_KEY
  );

}


// ==========================================================
// REMOVE TOKEN
// ==========================================================

export async function removeToken():
Promise<void> {

  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  );

}


// ==========================================================
// PARSE RESPONSE
// ==========================================================

async function parseResponse(
  response: Response
): Promise<any> {

  try {

    return await response.json();

  } catch {

    return {};

  }

}


// ==========================================================
// AUTH FETCH
// ==========================================================

export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {

  const token =
    await getToken();


  // ========================================================
  // DETECT MULTIPART / FORM DATA
  // ========================================================

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;


  const headers:
    Record<string, string> = {
      Accept:
        "application/json",
    };


  // JSON requests need Content-Type.
  // FormData must NOT set Content-Type manually because
  // fetch() creates the multipart boundary automatically.
  if (!isFormData) {

    headers[
      "Content-Type"
    ] =
      "application/json";

  }


  // Merge custom headers.
  if (options.headers) {

    Object.assign(
      headers,
      options.headers
    );

  }


  // JWT
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


  // --------------------------------------------------------
  // INVALID / EXPIRED TOKEN
  // --------------------------------------------------------

  if (
    response.status === 401 ||
    response.status === 422
  ) {

    await removeToken();

  }


  return response;

}


// ==========================================================
// LOGIN
// ==========================================================

export async function loginUser(
  payload: LoginPayload
): Promise<User> {

  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
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


  const data =
    await parseResponse(
      response
    );


  if (!response.ok) {

    throw new Error(
      data.message ||
      data.error ||
      "Unable to login."
    );

  }


  const token =
    data.access_token ||
    data.token;


  if (!token) {

    throw new Error(
      "Login succeeded, but the server did not return an access token."
    );

  }


  await saveToken(
    token
  );


  // --------------------------------------------------------
  // SOME BACKENDS RETURN USER DIRECTLY
  // --------------------------------------------------------

  if (data.user) {

    return data.user;

  }


  // --------------------------------------------------------
  // OTHERWISE GET USER USING /ME
  // --------------------------------------------------------

  const user =
    await getCurrentUser();


  if (!user) {

    throw new Error(
      "Unable to load your account."
    );

  }


  return user;

}


// ==========================================================
// REGISTER
// ==========================================================

export async function registerUser(
  payload: RegisterPayload
): Promise<User> {

  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",

      headers: {
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


  const data =
    await parseResponse(
      response
    );


  if (!response.ok) {

    throw new Error(
      data.message ||
      data.error ||
      "Unable to register."
    );

  }


  const token =
    data.access_token ||
    data.token;


  // --------------------------------------------------------
  // IF REGISTER ENDPOINT RETURNS A TOKEN
  // --------------------------------------------------------

  if (token) {

    await saveToken(
      token
    );


    if (data.user) {

      return data.user;

    }


    const user =
      await getCurrentUser();


    if (user) {

      return user;

    }

  }


  // --------------------------------------------------------
  // IF REGISTER DOES NOT RETURN A TOKEN,
  // LOGIN AUTOMATICALLY
  // --------------------------------------------------------

  return await loginUser({
    email:
      payload.email,

    password:
      payload.password,
  });

}


// ==========================================================
// GET CURRENT USER
// ==========================================================

export async function getCurrentUser():
Promise<User | null> {

  const token =
    await getToken();


  if (!token) {

    return null;

  }


  try {

    const response =
      await authFetch(
        "/auth/me",
        {
          method: "GET",
        }
      );


    const data =
      await parseResponse(
        response
      );


    if (
      response.status === 401
    ) {

      await removeToken();

      return null;

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "Unable to load current user."
      );

    }


    return (
      data.user ||
      data
    );

  } catch (error) {

    console.error(
      "GET CURRENT USER ERROR:",
      error
    );


    return null;

  }

}


// ==========================================================
// LOGOUT
// ==========================================================

export async function logoutUser():
Promise<void> {

  await removeToken();

}


// ==========================================================
// CHECK AUTHENTICATION
// ==========================================================

export async function isAuthenticated():
Promise<boolean> {

  const token =
    await getToken();


  if (!token) {

    return false;

  }


  const user =
    await getCurrentUser();


  return user !== null;

}