// =========================================================
// SHOBDO PAGE BACKGROUNDS
// =========================================================

export const PAGE_BACKGROUNDS = [

  // =======================================================
  // SYSTEM / BASIC BACKGROUNDS
  // =======================================================

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


  // =======================================================
  // SHOBDO OFFICIAL PAGE BACKGROUNDS
  // =======================================================

  {
    id: "shobdo-literary",
    name: "SHOBDO Literary",
    type: "image",
    value:
      "/backgrounds/shobdo-literary.jpg",
  },

  {
    id: "shobdo-explore",
    name: "SHOBDO Explore",
    type: "image",
    value:
      "/backgrounds/shobdo-explore.jpg",
  },

  {
    id: "shobdo-search",
    name: "SHOBDO Search",
    type: "image",
    value:
      "/backgrounds/shobdo-search.jpg",
  },

  {
    id: "shobdo-notifications",
    name: "SHOBDO Notifications",
    type: "video",
    value:
      "/backgrounds/shobdo-notifications-bg.mp4",
  },

  {
    id: "shobdo-my-writings",
    name: "SHOBDO My Writings",
    type: "video",
    value:
      "/backgrounds/shobdo-my-writings-bg.mp4",
  },


  // =======================================================
  // OPTIONAL EXISTING BACKGROUNDS
  // =======================================================

  {
    id: "paper",
    name: "Paper",
    type: "image",
    value:
      "/backgrounds/paper.webp",
  },

  {
    id: "nature",
    name: "Nature",
    type: "image",
    value:
      "/backgrounds/nature.webp",
  },

  {
    id: "books",
    name: "Library",
    type: "image",
    value:
      "/backgrounds/books.webp",
  },
];


// =========================================================
// OFFICIAL DEFAULT BACKGROUND FOR EACH PAGE
// =========================================================
//
// These defaults are used only when the user has not already
// selected their own background for that page.
//
// =========================================================

export const PAGE_DEFAULT_BACKGROUNDS = {

  home:
    "shobdo-literary",

  explore:
    "shobdo-explore",

  search:
    "shobdo-search",


  // -------------------------------------------------------
  // NOT CONNECTED YET
  // -------------------------------------------------------

  notifications:
    "shobdo-notifications",

  myWritings:
    "shobdo-my-writings",

  saved:
    "default",

  write:
    "default",

  connections:
    "default",

  profile:
    "default",

  settings:
    "default",

  default:
    "default",
};


// =========================================================
// GET DEFAULT BACKGROUND
// =========================================================

export function getDefaultBackgroundId(
  pageKey
) {

  return (
    PAGE_DEFAULT_BACKGROUNDS[
      pageKey
    ] ||
    PAGE_DEFAULT_BACKGROUNDS.default
  );

}


// =========================================================
// DETECT CURRENT PAGE
// =========================================================

export function getBackgroundPageKey(
  pathname = "/"
) {

  const path =
    String(
      pathname || "/"
    )
      .toLowerCase()
      .trim();


  // =======================================================
  // HOME
  // =======================================================

  if (
    path === "/" ||
    path === "/home" ||
    path.startsWith(
      "/home/"
    )
  ) {

    return "home";

  }


  // =======================================================
  // EXPLORE
  // =======================================================

  if (
    path === "/explore" ||
    path.startsWith(
      "/explore/"
    )
  ) {

    return "explore";

  }


  // =======================================================
  // SEARCH
  // =======================================================

  if (
    path === "/search" ||
    path.startsWith(
      "/search/"
    )
  ) {

    return "search";

  }


  // =======================================================
  // MY WRITINGS
  // =======================================================

  if (
    path === "/my-writings" ||
    path.startsWith(
      "/my-writings/"
    )
  ) {

    return "myWritings";

  }


  // =======================================================
  // WRITE / EDIT WRITING
  // =======================================================

  if (
    path === "/write" ||
    path.startsWith(
      "/write/"
    )
  ) {

    return "write";

  }


  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  if (
    path === "/notifications" ||
    path.startsWith(
      "/notifications/"
    )
  ) {

    return "notifications";

  }


  // =======================================================
  // SAVED
  // =======================================================

  if (
    path === "/saved" ||
    path.startsWith(
      "/saved/"
    ) ||
    path === "/bookmarks" ||
    path.startsWith(
      "/bookmarks/"
    )
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
    path.startsWith(
      "/profile/"
    ) ||
    path.startsWith(
      "/user/"
    ) ||
    path.startsWith(
      "/users/"
    )
  ) {

    return "profile";

  }


  // =======================================================
  // SETTINGS
  // =======================================================

  if (
    path === "/settings" ||
    path.startsWith(
      "/settings/"
    )
  ) {

    return "settings";

  }


  // =======================================================
  // FALLBACK
  // =======================================================

  return "default";

}