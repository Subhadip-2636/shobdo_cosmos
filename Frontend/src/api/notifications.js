// =========================================================
// SHOBDO NOTIFICATIONS API
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api";


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// GET TOKEN
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

  const token = getToken();

  return {
    "Content-Type":
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };

}


// =========================================================
// HANDLE RESPONSE
// =========================================================

async function handleResponse(
  response
) {

  let data = null;

  try {

    data = await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
        "Notification request failed."
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
// GET NOTIFICATIONS
// =========================================================
//
// Example:
//
// getNotifications({
//   page: 1,
//   perPage: 20,
//   unreadOnly: false,
// })
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


  const response =
    await fetch(
      `${API_URL}/notifications?${params.toString()}`,
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
// GET UNREAD COUNT
// =========================================================
//
// Used by the Navbar notification bell.
//
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

  if (!notificationId) {

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
// DELETE NOTIFICATION
// =========================================================

export async function deleteNotification(
  notificationId
) {

  if (!notificationId) {

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