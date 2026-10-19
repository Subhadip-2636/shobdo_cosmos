
/**
 * SHOBDO — Notifications API
 *
 * Compatible with:
 * - React + Vite
 * - Flask JWT authentication
 * - Existing SHOBDO notification routes
 * - Production and development environments
 */

const DEFAULT_API_URL = "http://127.0.0.1:5000";
const TOKEN_KEY = "shobdo_token";
const REQUEST_TIMEOUT_MS = 20000;

// ---------------------------------------------------------
// API CONFIGURATION
// ---------------------------------------------------------

function normalizeApiUrl(value) {
  const raw = String(value || DEFAULT_API_URL)
    .trim()
    .replace(/\/+$/, "");

  if (!/^https?:\/\/[^/\s]+/i.test(raw)) {
    throw new Error(
      "Invalid SHOBDO API URL. Check VITE_API_URL."
    );
  }

  return /\/api$/i.test(raw)
    ? raw
    : `${raw}/api`;
}

const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL
);

// ---------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ---------------------------------------------------------
// INPUT VALIDATION
// ---------------------------------------------------------

function positiveInteger(value, name) {
  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number <= 0
  ) {
    throw new Error(
      `${name} must be a positive integer.`
    );
  }

  return number;
}

// ---------------------------------------------------------
// COMMON REQUEST HANDLER
// ---------------------------------------------------------

async function notificationRequest(
  endpoint,
  {
    method = "GET",
    signal,
  } = {}
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const abortFromCaller = () => {
    controller.abort();
  };

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener(
      "abort",
      abortFromCaller,
      { once: true }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/notifications${endpoint}`,
      {
        method,
        headers: getAuthHeaders(),
        signal: controller.signal,
        cache: "no-store",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
        data?.error ||
        `Notification request failed (${response.status}).`
      );

      error.status = response.status;
      error.data = data;

      if (response.status === 401) {
        error.code = "AUTH_REQUIRED";
      }

      if (response.status === 403) {
        error.code = "ACCESS_DENIED";
      }

      throw error;
    }

    if (!data || typeof data !== "object") {
      throw new Error(
        "Invalid response from SHOBDO notification API."
      );
    }

    return data;
  } catch (error) {
    if (
      controller.signal.aborted &&
      !signal?.aborted
    ) {
      const timeoutError = new Error(
        "The notification request timed out."
      );

      timeoutError.code = "REQUEST_TIMEOUT";
      throw timeoutError;
    }

    if (
      error instanceof TypeError &&
      !error.status
    ) {
      const networkError = new Error(
        "Unable to connect to SHOBDO. Check your connection."
      );

      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);

    signal?.removeEventListener(
      "abort",
      abortFromCaller
    );
  }
}

// ---------------------------------------------------------
// GET NOTIFICATIONS
// ---------------------------------------------------------

export async function getNotifications({
  page = 1,
  perPage = 20,
  unreadOnly = false,
  signal,
} = {}) {
  const safePage = positiveInteger(
    page,
    "Page"
  );

  const safePerPage = Math.min(
    positiveInteger(perPage, "Per-page limit"),
    100
  );

  const params = new URLSearchParams({
    page: String(safePage),
    per_page: String(safePerPage),
  });

  if (unreadOnly) {
    params.set("unread", "true");
  }

  return notificationRequest(
    `?${params.toString()}`,
    { signal }
  );
}

// ---------------------------------------------------------
// GET UNREAD COUNT
// ---------------------------------------------------------

export async function getUnreadNotificationCount({
  signal,
} = {}) {
  return notificationRequest(
    "/unread-count",
    { signal }
  );
}

// ---------------------------------------------------------
// MARK ONE AS READ
// ---------------------------------------------------------

export async function markNotificationRead(
  notificationId
) {
  const id = positiveInteger(
    notificationId,
    "Notification ID"
  );

  return notificationRequest(
    `/${id}/read`,
    { method: "PATCH" }
  );
}

// ---------------------------------------------------------
// MARK ALL AS READ
// ---------------------------------------------------------

export async function markAllNotificationsRead() {
  return notificationRequest(
    "/read-all",
    { method: "PATCH" }
  );
}

// ---------------------------------------------------------
// DELETE ONE NOTIFICATION
// ---------------------------------------------------------

export async function deleteNotification(
  notificationId
) {
  const id = positiveInteger(
    notificationId,
    "Notification ID"
  );

  return notificationRequest(
    `/${id}`,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------
// SAFE INTERNAL NOTIFICATION NAVIGATION
// ---------------------------------------------------------

export function getSafeNotificationTarget(
  targetUrl
) {
  if (
    typeof targetUrl !== "string" ||
    !targetUrl.trim()
  ) {
    return "/notifications";
  }

  const target = targetUrl.trim();

  // Only accept internal absolute application paths.
  // Reject protocol-relative URLs, backslashes and
  // control characters.
  if (
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(target)
  ) {
    return "/notifications";
  }

  return target;
}

// ---------------------------------------------------------
// DEBUG HELPER
// ---------------------------------------------------------

export function getNotificationApiUrl() {
  return API_URL;
}
