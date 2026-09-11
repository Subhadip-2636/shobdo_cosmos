// =========================================================
// SHOBDO - NOTIFICATIONS API
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================
//
// Works with BOTH:
//
// VITE_API_URL=https://shobdo-cosmos.onrender.com
//
// and:
//
// VITE_API_URL=https://shobdo-cosmos.onrender.com/api
//
// Final API URL will always become:
// https://shobdo-cosmos.onrender.com/api
//
// =========================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const CLEAN_API_URL =
  RAW_API_URL
    .trim()
    .replace(/\/+$/, "");


const API_URL =
  CLEAN_API_URL.endsWith("/api")
    ? CLEAN_API_URL
    : `${CLEAN_API_URL}/api`;


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// TOKEN
// =========================================================

function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


// =========================================================
// AUTH HEADERS
// =========================================================

function getAuthHeaders() {

  const token =
    getToken();


  const headers = {

    Accept:
      "application/json",

    "Content-Type":
      "application/json",

  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  return headers;

}


// =========================================================
// RESPONSE HANDLER
// =========================================================

async function handleResponse(
  response
) {

  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
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
// GET ALL / UNREAD NOTIFICATIONS
// =========================================================
//
// Example:
//
// getNotifications()
//
// getNotifications({
//   page: 1,
//   perPage: 20,
//   unreadOnly: true,
// });
//
// =========================================================

export async function getNotifications({
  page = 1,
  perPage = 20,
  unreadOnly = false,
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "page",
    String(page)
  );


  params.set(
    "per_page",
    String(perPage)
  );


  if (unreadOnly) {

    params.set(
      "unread",
      "true"
    );

  }


  const url =
    `${API_URL}/notifications?${params.toString()}`;


  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers:
          getAuthHeaders(),
      }
    );


  return handleResponse(
    response
  );

}


// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

export async function getUnreadNotificationCount() {

  const response =
    await fetch(
      `${API_URL}/notifications/unread-count`,
      {
        method: "GET",

        headers:
          getAuthHeaders(),
      }
    );


  return handleResponse(
    response
  );

}


// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

export async function markNotificationRead(
  notificationId
) {

  if (
    notificationId === undefined ||
    notificationId === null
  ) {

    throw new Error(
      "Notification ID is required."
    );

  }


  const response =
    await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",

        headers:
          getAuthHeaders(),
      }
    );


  return handleResponse(
    response
  );

}


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

export async function markAllNotificationsRead() {

  const response =
    await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PATCH",

        headers:
          getAuthHeaders(),
      }
    );


  return handleResponse(
    response
  );

}


// =========================================================
// DELETE ONE NOTIFICATION
// =========================================================

export async function deleteNotification(
  notificationId
) {

  if (
    notificationId === undefined ||
    notificationId === null
  ) {

    throw new Error(
      "Notification ID is required."
    );

  }


  const response =
    await fetch(
      `${API_URL}/notifications/${notificationId}`,
      {
        method: "DELETE",

        headers:
          getAuthHeaders(),
      }
    );


  return handleResponse(
    response
  );

}


// =========================================================
// DEBUG HELPER
// =========================================================
//
// You can temporarily use:
//
// console.log(getNotificationApiUrl());
//
// Expected production result:
//
// https://shobdo-cosmos.onrender.com/api
//
// =========================================================

export function getNotificationApiUrl() {

  return API_URL;

}