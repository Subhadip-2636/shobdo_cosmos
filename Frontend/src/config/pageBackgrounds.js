// =========================================================
// SHOBDO PAGE BACKGROUNDS
// =========================================================

export const PAGE_BACKGROUNDS = [
  {
    id: "default",
    name: "Default",
    type: "gradient",
    value:
      "linear-gradient(135deg, #f8f5ef 0%, #fffdf8 50%, #f4eee4 100%)",
  },

  {
    id: "none",
    name: "No background",
    type: "solid",
    value: "#f8f6f1",
  },

  {
    id: "paper",
    name: "Paper",
    type: "image",
    value: "/backgrounds/paper.webp",
  },

  {
    id: "nature",
    name: "Nature",
    type: "image",
    value: "/backgrounds/nature.webp",
  },

  {
    id: "books",
    name: "Library",
    type: "image",
    value: "/backgrounds/books.webp",
  },
];


// =========================================================
// DETECT CURRENT PAGE
// =========================================================

export function getBackgroundPageKey(pathname = "/") {
  const path =
    String(pathname || "/")
      .toLowerCase()
      .trim();


  // =======================================================
  // HOME
  // =======================================================

  if (
    path === "/" ||
    path === "/home" ||
    path.startsWith("/home/")
  ) {
    return "home";
  }


  // =======================================================
  // EXPLORE
  // =======================================================

  if (
    path === "/explore" ||
    path.startsWith("/explore/")
  ) {
    return "explore";
  }


  // =======================================================
  // WRITE
  // =======================================================

  if (
    path === "/write" ||
    path.startsWith("/write/")
  ) {
    return "write";
  }


  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  if (
    path === "/notifications" ||
    path.startsWith("/notifications/")
  ) {
    return "notifications";
  }


  // =======================================================
  // SAVED / BOOKMARKS
  // =======================================================

  if (
    path === "/saved" ||
    path.startsWith("/saved/") ||
    path === "/bookmarks" ||
    path.startsWith("/bookmarks/")
  ) {
    return "saved";
  }


  // =======================================================
  // CONNECTIONS
  // =======================================================

  if (
    path.includes(
      "/followers"
    ) ||
    path.includes(
      "/following"
    ) ||
    path.includes(
      "/connections"
    )
  ) {
    return "connections";
  }


  // =======================================================
  // PROFILE
  // =======================================================

  if (
    path === "/profile" ||
    path.startsWith("/profile/") ||
    path.startsWith("/user/") ||
    path.startsWith("/users/")
  ) {
    return "profile";
  }


  // =======================================================
  // SETTINGS
  // =======================================================

  if (
    path === "/settings" ||
    path.startsWith("/settings/")
  ) {
    return "settings";
  }


  // =======================================================
  // FALLBACK
  // =======================================================

  return "default";
}