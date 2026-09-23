import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  Clapperboard,
  Clock3,
  Copy,
  Eye,
  Film,
  Globe2,
  Link2,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  getReels,
} from "../api/reels";

import ReelsTab from "./ReelsTab";

import "./Videos.css";


// =========================================================
// API CONFIG
// =========================================================

const RAW_API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000"
  )
    .trim()
    .replace(/\/+$/, "");


const API_URL =
  RAW_API_URL.endsWith("/api")
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


const API_ORIGIN =
  API_URL.replace(
    /\/api$/,
    ""
  );


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// CONSTANTS
// =========================================================

const VALID_TABS = [
  "videos",
  "reels",
  "following",
];


const PAGE_SIZE =
  40;


// =========================================================
// TOKEN
// =========================================================

function getToken() {

  try {

    return (
      window.localStorage.getItem(
        TOKEN_KEY
      ) || ""
    );

  } catch {

    return "";

  }

}


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  {
    method = "GET",
    authenticated = false,
    signal,
  } = {}
) {

  const headers = {
    Accept:
      "application/json",
  };


  if (authenticated) {

    const token =
      getToken();


    if (token) {

      headers.Authorization =
        `Bearer ${token}`;

    }

  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        method,
        headers,
        signal,
      }
    );


  let data = {};


  try {

    data =
      await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
        data?.error ||
        data?.detail ||
        `Request failed with status ${response.status}.`
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
// HELPERS
// =========================================================

function absoluteMediaUrl(
  value
) {

  const url =
    String(
      value || ""
    ).trim();


  if (!url) {

    return "";

  }


  if (
    url.startsWith(
      "http://"
    ) ||
    url.startsWith(
      "https://"
    ) ||
    url.startsWith(
      "blob:"
    ) ||
    url.startsWith(
      "data:"
    )
  ) {

    return url;

  }


  if (
    url.startsWith("/")
  ) {

    return (
      `${API_ORIGIN}${url}`
    );

  }


  return (
    `${API_ORIGIN}/${url}`
  );

}


// =========================================================

function getCreator(
  item
) {

  return (
    item?.creator ||
    item?.user ||
    item?.author ||
    item?.owner ||
    {}
  );

}


// =========================================================

function getOwnerId(
  item
) {

  const creator =
    getCreator(
      item
    );


  return (
    item?.user_id ??
    item?.creator_id ??
    item?.owner_id ??
    item?.author_id ??
    creator?.id ??
    creator?.user_id ??
    null
  );

}


// =========================================================

function isOwnItem(
  item,
  user
) {

  if (!item || !user) {

    return false;

  }


  if (
    item.is_owner ===
      true ||
    item.is_mine ===
      true ||
    item.owned_by_current_user ===
      true
  ) {

    return true;

  }


  const ownerId =
    Number(
      getOwnerId(
        item
      )
    );


  const currentUserId =
    Number(
      user?.id
    );


  return (
    Number.isFinite(
      ownerId
    ) &&
    Number.isFinite(
      currentUserId
    ) &&
    ownerId ===
      currentUserId
  );

}


// =========================================================

function getCreatorName(
  item
) {

  const creator =
    getCreator(
      item
    );


  return (
    creator?.name ||
    creator?.full_name ||
    creator?.display_name ||
    item?.user_name ||
    item?.creator_name ||
    item?.author_name ||
    "SHOBDO Creator"
  );

}


// =========================================================

function getCreatorAvatar(
  item
) {

  const creator =
    getCreator(
      item
    );


  const avatar =
    creator?.avatar_url ||
    creator?.profile_picture ||
    creator?.profile_image ||
    creator?.avatar ||
    item?.user_avatar ||
    item?.creator_avatar ||
    "";


  return absoluteMediaUrl(
    avatar
  );

}


// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name || ""
    )
      .trim();


  if (!safeName) {

    return "S";

  }


  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();

  }


  return (
    `${parts[0][0]}${parts[1][0]}`
      .toUpperCase()
  );

}


// =========================================================

function getMediaSource(
  item
) {

  return absoluteMediaUrl(
    item?.video_url ||
    item?.media_url ||
    item?.playback_url ||
    item?.file_url ||
    item?.video ||
    item?.url ||
    ""
  );

}


// =========================================================

function getPoster(
  item
) {

  return absoluteMediaUrl(
    item?.thumbnail_url ||
    item?.poster_url ||
    item?.cover_url ||
    item?.preview_url ||
    ""
  );

}


// =========================================================

function getTitle(
  item,
  type
) {

  if (
    item?.title
  ) {

    return item.title;

  }


  if (
    item?.caption
  ) {

    const caption =
      String(
        item.caption
      ).trim();


    if (
      caption.length <=
      90
    ) {

      return caption;

    }


    return (
      `${caption.slice(
        0,
        87
      )}...`
    );

  }


  return (
    type === "reel"
      ? "SHOBDO Reel"
      : "Untitled video"
  );

}


// =========================================================

function getDescription(
  item
) {

  const description =
    item?.description ||
    item?.caption ||
    "";


  const title =
    item?.title ||
    "";


  if (
    description ===
    title
  ) {

    return "";

  }


  return String(
    description || ""
  ).trim();

}


// =========================================================

function getCreatedAt(
  item
) {

  return (
    item?.published_at ||
    item?.created_at ||
    item?.uploaded_at ||
    item?.updated_at ||
    null
  );

}


// =========================================================

function formatDate(
  value,
  language
) {

  if (!value) {

    return "";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  const localeMap = {

    bn:
      "bn-IN",

    hi:
      "hi-IN",

    en:
      "en-IN",

    as:
      "as-IN",

    or:
      "or-IN",

    ta:
      "ta-IN",

    te:
      "te-IN",

  };


  try {

    return new Intl.DateTimeFormat(
      localeMap[
        language
      ] ||
      "en-IN",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    ).format(
      date
    );

  } catch {

    return date
      .toLocaleDateString();

  }

}


// =========================================================

function formatDuration(
  value
) {

  const seconds =
    Math.max(
      0,
      Math.round(
        Number(
          value
        ) || 0
      )
    );


  if (!seconds) {

    return "";

  }


  const hours =
    Math.floor(
      seconds /
      3600
    );


  const minutes =
    Math.floor(
      (
        seconds %
        3600
      ) /
      60
    );


  const remainingSeconds =
    seconds %
    60;


  if (hours > 0) {

    return (
      `${hours}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        remainingSeconds
      ).padStart(
        2,
        "0"
      )}`
    );

  }


  return (
    `${minutes}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`
  );

}


// =========================================================

function getViews(
  item
) {

  return Number(
    item?.views_count ??
    item?.view_count ??
    item?.views ??
    0
  ) || 0;

}


// =========================================================

function getLanguageLabel(
  value
) {

  const language =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();


  const labels = {

    bn:
      "বাংলা",

    hi:
      "हिन्दी",

    en:
      "English",

    as:
      "অসমীয়া",

    or:
      "ଓଡ଼ିଆ",

    ta:
      "தமிழ்",

    te:
      "తెలుగు",

  };


  return (
    labels[
      language
    ] ||
    ""
  );

}


// =========================================================
// CREATOR AVATAR
// =========================================================

function CreatorAvatar({
  item,
}) {

  const creatorName =
    getCreatorName(
      item
    );


  const avatar =
    getCreatorAvatar(
      item
    );


  if (avatar) {

    return (

      <img
        className="shobdo-video-avatar"
        src={avatar}
        alt=""
        loading="lazy"
      />

    );

  }


  return (

    <div
      className="shobdo-video-avatar shobdo-video-avatar-fallback"
      aria-hidden="true"
    >
      {getInitials(
        creatorName
      )}
    </div>

  );

}


// =========================================================
// VIDEO CARD
// =========================================================

function VideoCard({
  item,
  type = "video",
  user,
  language,
  menuOpen,
  deleting,
  onToggleMenu,
  onDelete,
  onShare,
  onCopy,
  onPlay,
  t,
}) {

  const source =
    getMediaSource(
      item
    );


  const poster =
    getPoster(
      item
    );


  const creatorName =
    getCreatorName(
      item
    );


  const createdAt =
    formatDate(
      getCreatedAt(
        item
      ),
      language
    );


  const own =
    type === "video" &&
    isOwnItem(
      item,
      user
    );


  const title =
    getTitle(
      item,
      type
    );


  const description =
    getDescription(
      item
    );


  const views =
    getViews(
      item
    );


  const duration =
    formatDuration(
      item?.duration_seconds ||
      item?.duration
    );


  const languageLabel =
    getLanguageLabel(
      item?.language
    );


  return (

    <article
      className="shobdo-video-post"
    >

      {/* ===============================================
          POST HEADER
      ================================================ */}

      <header
        className="shobdo-video-post-header"
      >

        <div
          className="shobdo-video-author"
        >

          <CreatorAvatar
            item={item}
          />


          <div
            className="shobdo-video-author-copy"
          >

            <div
              className="shobdo-video-author-name-row"
            >

              <strong>
                {creatorName}
              </strong>


              {own && (

                <span
                  className="shobdo-video-owner-badge"
                >
                  {t(
                    "videos.you",
                    "You"
                  )}
                </span>

              )}

            </div>


            <div
              className="shobdo-video-post-meta"
            >

              {createdAt && (

                <span>
                  {createdAt}
                </span>

              )}


              {createdAt && (
                <span
                  aria-hidden="true"
                >
                  ·
                </span>
              )}


              <span
                className="shobdo-video-visibility"
                title={
                  item?.visibility ||
                  "public"
                }
              >

                <Globe2
                  size={13}
                />

                {type === "reel"
                  ? t(
                      "videos.reel",
                      "Reel"
                    )
                  : t(
                      "videos.video",
                      "Video"
                    )}

              </span>

            </div>

          </div>

        </div>


        <div
          className="shobdo-video-menu-shell"
          onClick={
            (
              event
            ) =>
              event
                .stopPropagation()
          }
        >

          <button
            type="button"
            className={
              menuOpen
                ? "shobdo-video-menu-trigger active"
                : "shobdo-video-menu-trigger"
            }
            aria-label={t(
              "videos.moreOptions",
              "More options"
            )}
            aria-expanded={
              menuOpen
            }
            onClick={onToggleMenu}
          >

            <MoreHorizontal
              size={22}
            />

          </button>


          {menuOpen && (

            <div
              className="shobdo-video-menu"
              role="menu"
            >

              <button
                type="button"
                role="menuitem"
                onClick={onShare}
              >

                <Share2
                  size={17}
                />

                <span>
                  {t(
                    "videos.share",
                    "Share"
                  )}
                </span>

              </button>


              <button
                type="button"
                role="menuitem"
                onClick={onCopy}
              >

                <Link2
                  size={17}
                />

                <span>
                  {t(
                    "videos.copyLink",
                    "Copy link"
                  )}
                </span>

              </button>


              {own && (

                <>

                  <div
                    className="shobdo-video-menu-divider"
                  />


                  <button
                    type="button"
                    role="menuitem"
                    className="danger"
                    disabled={
                      deleting
                    }
                    onClick={
                      () =>
                        onDelete(
                          item
                        )
                    }
                  >

                    {deleting
                      ? (
                        <LoaderCircle
                          size={17}
                          className="shobdo-video-spin"
                        />
                      )
                      : (
                        <Trash2
                          size={17}
                        />
                      )}


                    <span>
                      {deleting
                        ? t(
                            "videos.deleting",
                            "Deleting..."
                          )
                        : t(
                            "videos.deleteVideo",
                            "Delete video"
                          )}
                    </span>

                  </button>

                </>

              )}

            </div>

          )}

        </div>

      </header>


      {/* ===============================================
          TITLE / DESCRIPTION
      ================================================ */}

      <div
        className="shobdo-video-post-copy"
      >

        <h2>
          {title}
        </h2>


        {description && (

          <p>
            {description}
          </p>

        )}

      </div>


      {/* ===============================================
          MEDIA
      ================================================ */}

      {source ? (

        <div
          className={
            type === "reel"
              ? "shobdo-video-media shobdo-video-media-reel"
              : "shobdo-video-media"
          }
        >

          <video
            controls
            playsInline
            preload="metadata"
            poster={
              poster ||
              undefined
            }
            src={source}
            onPlay={
              () =>
                onPlay(
                  item,
                  type
                )
            }
          />

        </div>

      ) : (

        <div
          className="shobdo-video-media-missing"
        >

          <Film
            size={30}
          />

          <span>
            {t(
              "videos.mediaUnavailable",
              "Video unavailable"
            )}
          </span>

        </div>

      )}


      {/* ===============================================
          SOCIAL INFORMATION
      ================================================ */}

      <div
        className="shobdo-video-stats"
      >

        <div
          className="shobdo-video-stat-group"
        >

          <span>

            <Eye
              size={15}
            />

            {views.toLocaleString()}

            {" "}

            {t(
              "videos.views",
              "views"
            )}

          </span>


          {duration && (

            <span>

              <Clock3
                size={15}
              />

              {duration}

            </span>

          )}


          {languageLabel && (

            <span>

              <Globe2
                size={15}
              />

              {languageLabel}

            </span>

          )}

        </div>

      </div>


      {/* ===============================================
          ACTION BAR
      ================================================ */}

      <footer
        className="shobdo-video-actions"
      >

        <button
          type="button"
          onClick={onShare}
        >

          <Share2
            size={18}
          />

          <span>
            {t(
              "videos.share",
              "Share"
            )}
          </span>

        </button>


        <button
          type="button"
          onClick={onCopy}
        >

          <Link2
            size={18}
          />

          <span>
            {t(
              "videos.copyLink",
              "Copy link"
            )}
          </span>

        </button>


        {own && (

          <button
            type="button"
            className="shobdo-video-action-delete"
            onClick={
              () =>
                onDelete(
                  item
                )
            }
          >

            <Trash2
              size={18}
            />

            <span>
              {t(
                "videos.delete",
                "Delete"
              )}
            </span>

          </button>

        )}

      </footer>

    </article>

  );

}


// =========================================================
// MAIN PAGE
// =========================================================

export default function Videos({
  user,
}) {

  const {
    t,
    language,
  } =
    useLanguage();


  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const requestedTab =
    String(
      searchParams.get(
        "tab"
      ) ||
      "videos"
    )
      .trim()
      .toLowerCase();


  const activeTab =
    VALID_TABS.includes(
      requestedTab
    )
      ? requestedTab
      : "videos";


  // =======================================================
  // STATE
  // =======================================================

  const [
    videos,
    setVideos,
  ] =
    useState([]);


  const [
    followingMedia,
    setFollowingMedia,
  ] =
    useState([]);


  const [
    loadingVideos,
    setLoadingVideos,
  ] =
    useState(true);


  const [
    loadingFollowing,
    setLoadingFollowing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    followingError,
    setFollowingError,
  ] =
    useState("");


  const [
    openMenuId,
    setOpenMenuId,
  ] =
    useState(null);


  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState(null);


  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);


  const [
    toast,
    setToast,
  ] =
    useState("");


  const viewedVideoIds =
    useRef(
      new Set()
    );


  // =======================================================
  // TITLE
  // =======================================================

  useEffect(
    () => {

      const previousTitle =
        document.title;


      document.title =
        `${t(
          "videos.title",
          "Video"
        )} | SHOBDO`;


      return () => {

        document.title =
          previousTitle;

      };

    },
    [
      t,
    ]
  );


  // =======================================================
  // TOAST AUTO CLOSE
  // =======================================================

  useEffect(
    () => {

      if (!toast) {

        return undefined;

      }


      const timer =
        window.setTimeout(
          () => {

            setToast("");

          },
          2600
        );


      return () =>
        window.clearTimeout(
          timer
        );

    },
    [
      toast,
    ]
  );


  // =======================================================
  // SET TAB
  // =======================================================

  function changeTab(
    tab
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    next.set(
      "tab",
      tab
    );


    if (
      tab !==
      "reels"
    ) {

      next.delete(
        "view"
      );

    }


    setSearchParams(
      next
    );


    setOpenMenuId(
      null
    );

  }


  // =======================================================
  // LOAD VIDEOS
  // =======================================================

  const loadVideos =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (!silent) {

          setLoadingVideos(
            true
          );

        }


        setError("");


        try {

          const data =
            await apiRequest(
              `/videos?page=1&limit=${PAGE_SIZE}`,
              {
                authenticated:
                  Boolean(
                    getToken()
                  ),
              }
            );


          const items =
            Array.isArray(
              data?.videos
            )
              ? data.videos
              : Array.isArray(
                    data?.items
                  )
                ? data.items
                : [];


          setVideos(
            items
          );


        } catch (
          loadError
        ) {

          console.error(
            "LOAD VIDEOS ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            t(
              "videos.loadError",
              "Unable to load videos."
            )
          );


        } finally {

          if (!silent) {

            setLoadingVideos(
              false
            );

          }

        }

      },
      [
        t,
      ]
    );


  // =======================================================
  // INITIAL VIDEO LOAD
  // =======================================================

  useEffect(
    () => {

      loadVideos();

    },
    [
      loadVideos,
    ]
  );


  // =======================================================
  // FOLLOWING MEDIA
  // =======================================================

  const loadFollowingMedia =
    useCallback(
      async () => {

        if (
          !user?.id
        ) {

          setFollowingMedia(
            []
          );

          return;

        }


        setLoadingFollowing(
          true
        );

        setFollowingError(
          ""
        );


        try {

          const [
            followingResponse,
            videoResponse,
            reelsResponse,
          ] =
            await Promise.all([

              apiRequest(
                `/users/${user.id}/following?page=1&limit=50`,
                {
                  authenticated:
                    true,
                }
              ),

              apiRequest(
                `/videos?page=1&limit=${PAGE_SIZE}`,
                {
                  authenticated:
                    true,
                }
              ),

              getReels({
                page:
                  1,

                perPage:
                  PAGE_SIZE,
              }),

            ]);


          const followingUsers =
            Array.isArray(
              followingResponse
                ?.users
            )
              ? followingResponse
                  .users
              : [];


          const followingIds =
            new Set(
              followingUsers
                .map(
                  (
                    followedUser
                  ) =>
                    Number(
                      followedUser
                        ?.id
                    )
                )
                .filter(
                  Number.isFinite
                )
            );


          const followedVideos =
            (
              Array.isArray(
                videoResponse
                  ?.videos
              )
                ? videoResponse
                    .videos
                : Array.isArray(
                      videoResponse
                        ?.items
                    )
                  ? videoResponse
                      .items
                  : []
            )
              .filter(
                (
                  video
                ) =>
                  followingIds.has(
                    Number(
                      getOwnerId(
                        video
                      )
                    )
                  )
              )
              .map(
                (
                  video
                ) => ({
                  ...video,

                  __mediaType:
                    "video",
                })
              );


          const followedReels =
            (
              Array.isArray(
                reelsResponse
                  ?.reels
              )
                ? reelsResponse
                    .reels
                : []
            )
              .filter(
                (
                  reel
                ) =>
                  followingIds.has(
                    Number(
                      getOwnerId(
                        reel
                      )
                    )
                  )
              )
              .map(
                (
                  reel
                ) => ({
                  ...reel,

                  __mediaType:
                    "reel",
                })
              );


          const merged = [
            ...followedVideos,
            ...followedReels,
          ];


          merged.sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  getCreatedAt(
                    first
                  ) || 0
                ).getTime();


              const secondDate =
                new Date(
                  getCreatedAt(
                    second
                  ) || 0
                ).getTime();


              return (
                secondDate -
                firstDate
              );

            }
          );


          setFollowingMedia(
            merged
          );


        } catch (
          loadError
        ) {

          console.error(
            "LOAD FOLLOWING MEDIA ERROR:",
            loadError
          );


          setFollowingError(
            loadError?.message ||
            t(
              "videos.followingLoadError",
              "Unable to load media from people you follow."
            )
          );


        } finally {

          setLoadingFollowing(
            false
          );

        }

      },
      [
        user?.id,
        t,
      ]
    );


  useEffect(
    () => {

      if (
        activeTab ===
        "following"
      ) {

        loadFollowingMedia();

      }

    },
    [
      activeTab,
      loadFollowingMedia,
    ]
  );


  // =======================================================
  // DELETE
  // =======================================================

  async function confirmDelete() {

    const videoId =
      Number(
        deleteTarget?.id
      );


    if (
      !Number.isFinite(
        videoId
      )
    ) {

      return;

    }


    try {

      setDeletingId(
        videoId
      );


      await apiRequest(
        `/videos/${videoId}`,
        {
          method:
            "DELETE",

          authenticated:
            true,
        }
      );


      setVideos(
        (
          current
        ) =>
          current.filter(
            (
              video
            ) =>
              Number(
                video?.id
              ) !==
              videoId
          )
      );


      setFollowingMedia(
        (
          current
        ) =>
          current.filter(
            (
              media
            ) =>
              !(
                media
                  ?.__mediaType ===
                  "video" &&
                Number(
                  media?.id
                ) ===
                videoId
              )
          )
      );


      setDeleteTarget(
        null
      );


      setOpenMenuId(
        null
      );


      setToast(
        t(
          "videos.deletedSuccess",
          "Video deleted successfully."
        )
      );


    } catch (
      deleteError
    ) {

      console.error(
        "DELETE VIDEO ERROR:",
        deleteError
      );


      window.alert(
        deleteError?.message ||
        t(
          "videos.deleteError",
          "Unable to delete this video."
        )
      );


    } finally {

      setDeletingId(
        null
      );

    }

  }


  // =======================================================
  // SHARE
  // =======================================================

  function getShareUrl(
    item,
    type
  ) {

    if (
      type === "reel"
    ) {

      return (
        `${window.location.origin}/reels/${item.id}`
      );

    }


    return (
      `${window.location.origin}/videos?video=${item.id}`
    );

  }


  async function shareItem(
    item,
    type
  ) {

    const url =
      getShareUrl(
        item,
        type
      );


    const title =
      getTitle(
        item,
        type
      );


    try {

      if (
        navigator.share
      ) {

        await navigator.share({
          title:
            title,

          text:
            type === "reel"
              ? t(
                  "videos.shareReelText",
                  "Watch this Reel on SHOBDO."
                )
              : t(
                  "videos.shareVideoText",
                  "Watch this video on SHOBDO."
                ),

          url,
        });


        return;

      }


      await navigator.clipboard
        .writeText(
          url
        );


      setToast(
        t(
          "videos.linkCopied",
          "Link copied."
        )
      );


    } catch (
      shareError
    ) {

      if (
        shareError?.name ===
        "AbortError"
      ) {

        return;

      }


      console.error(
        "SHARE VIDEO ERROR:",
        shareError
      );

    }

  }


  // =======================================================
  // COPY
  // =======================================================

  async function copyItemLink(
    item,
    type
  ) {

    const url =
      getShareUrl(
        item,
        type
      );


    try {

      await navigator.clipboard
        .writeText(
          url
        );


      setToast(
        t(
          "videos.linkCopied",
          "Link copied."
        )
      );


    } catch {

      window.prompt(
        t(
          "videos.copyThisLink",
          "Copy this link:"
        ),
        url
      );

    }

  }


  // =======================================================
  // REGISTER VIEW
  // =======================================================

  async function handlePlay(
    item,
    type
  ) {

    if (
      type !==
      "video"
    ) {

      return;

    }


    const id =
      Number(
        item?.id
      );


    if (
      !Number.isFinite(
        id
      ) ||
      viewedVideoIds
        .current
        .has(
          id
        )
    ) {

      return;

    }


    viewedVideoIds
      .current
      .add(
        id
      );


    try {

      await apiRequest(
        `/videos/${id}/view`,
        {
          method:
            "POST",

          authenticated:
            Boolean(
              getToken()
            ),
        }
      );


      setVideos(
        (
          current
        ) =>
          current.map(
            (
              video
            ) => {

              if (
                Number(
                  video?.id
                ) !==
                id
              ) {

                return video;

              }


              return {
                ...video,

                views_count:
                  getViews(
                    video
                  ) +
                  1,
              };

            }
          )
      );


    } catch {

      // View registration should never block playback.

    }

  }


  // =======================================================
  // DISPLAY ITEMS
  // =======================================================

  const currentItems =
    useMemo(
      () => {

        if (
          activeTab ===
          "following"
        ) {

          return (
            followingMedia
          );

        }


        return videos.map(
          (
            video
          ) => ({
            ...video,

            __mediaType:
              "video",
          })
        );

      },
      [
        activeTab,
        videos,
        followingMedia,
      ]
    );


  // =======================================================
  // REFRESH
  // =======================================================

  async function refreshCurrent() {

    if (
      activeTab ===
      "following"
    ) {

      await loadFollowingMedia();

      return;

    }


    await loadVideos();

  }


  const currentLoading =
    activeTab ===
    "following"
      ? loadingFollowing
      : loadingVideos;


  const currentError =
    activeTab ===
    "following"
      ? followingError
      : error;


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main
      className="shobdo-video-page"
      onClick={
        () =>
          setOpenMenuId(
            null
          )
      }
    >

      {/* =================================================
          HERO
      ================================================== */}

      <section
        className="shobdo-video-hero"
      >

        <div
          className="shobdo-video-hero-main"
        >

          <div
            className="shobdo-video-hero-icon"
          >

            <Film
              size={28}
            />

          </div>


          <div
            className="shobdo-video-hero-copy"
          >

            <span
              className="shobdo-video-eyebrow"
            >
              SHOBDO MEDIA
            </span>


            <h1>
              {t(
                "videos.title",
                "Video"
              )}
            </h1>


            <p>
              {t(
                "videos.description",
                "Watch videos, discover Reels and keep up with creators you follow."
              )}
            </p>

          </div>

        </div>


        <div
          className="shobdo-video-create-actions"
        >

          <Link
            to="/write?mode=video"
            className="shobdo-video-create-button"
          >

            <Plus
              size={18}
            />

            <span>
              {t(
                "videos.addVideo",
                "Add Video"
              )}
            </span>

          </Link>


          <button
            type="button"
            className="shobdo-video-create-button shobdo-video-create-button-secondary"
            onClick={
              (
                event
              ) => {

                event.stopPropagation();


                const next =
                  new URLSearchParams(
                    searchParams
                  );


                next.set(
                  "tab",
                  "reels"
                );

                next.set(
                  "view",
                  "create"
                );


                setSearchParams(
                  next
                );

              }
            }
          >

            <Clapperboard
              size={18}
            />

            <span>
              {t(
                "videos.createReel",
                "Create Reel"
              )}
            </span>

          </button>

        </div>

      </section>


      {/* =================================================
          TABS
      ================================================== */}

      <section
        className="shobdo-video-tabs-shell"
      >

        <button
          type="button"
          className={
            activeTab ===
            "videos"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "videos"
              );

            }
          }
        >

          <Film
            size={18}
          />

          <span>
            {t(
              "videos.videos",
              "Videos"
            )}
          </span>

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "reels"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "reels"
              );

            }
          }
        >

          <Clapperboard
            size={18}
          />

          <span>
            {t(
              "videos.reels",
              "Reels"
            )}
          </span>

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "following"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "following"
              );

            }
          }
        >

          <Users
            size={18}
          />

          <span>
            {t(
              "videos.following",
              "Following"
            )}
          </span>

        </button>

      </section>


      {/* =================================================
          REELS
      ================================================== */}

      {activeTab ===
        "reels" && (

        <section
          className="shobdo-video-reels-container"
          onClick={
            (
              event
            ) =>
              event
                .stopPropagation()
          }
        >

          <ReelsTab
            user={user}
          />

        </section>

      )}


      {/* =================================================
          VIDEOS / FOLLOWING FEED
      ================================================== */}

      {activeTab !==
        "reels" && (

        <section
          className="shobdo-video-feed"
        >

          <div
            className="shobdo-video-feed-toolbar"
          >

            <div>

              <span
                className="shobdo-video-feed-kicker"
              >
                {activeTab ===
                "following"
                  ? t(
                      "videos.yourNetwork",
                      "YOUR NETWORK"
                    )
                  : t(
                      "videos.communityFeed",
                      "COMMUNITY FEED"
                    )}
              </span>


              <h2>
                {activeTab ===
                "following"
                  ? t(
                      "videos.fromPeopleYouFollow",
                      "From people you follow"
                    )
                  : t(
                      "videos.latestVideos",
                      "Latest videos"
                    )}
              </h2>

            </div>


            <button
              type="button"
              className="shobdo-video-refresh-button"
              disabled={
                currentLoading
              }
              onClick={
                (
                  event
                ) => {

                  event.stopPropagation();

                  refreshCurrent();

                }
              }
              aria-label={t(
                "videos.refresh",
                "Refresh videos"
              )}
              title={t(
                "videos.refresh",
                "Refresh videos"
              )}
            >

              <RefreshCw
                size={18}
                className={
                  currentLoading
                    ? "shobdo-video-spin"
                    : ""
                }
              />

              <span>
                {t(
                  "videos.refresh",
                  "Refresh"
                )}
              </span>

            </button>

          </div>


          {/* =============================================
              LOADING
          ============================================== */}

          {currentLoading && (

            <div
              className="shobdo-video-state"
            >

              <LoaderCircle
                size={30}
                className="shobdo-video-spin"
              />


              <strong>
                {t(
                  "videos.loading",
                  "Loading videos..."
                )}
              </strong>

            </div>

          )}


          {/* =============================================
              ERROR
          ============================================== */}

          {!currentLoading &&
            currentError && (

            <div
              className="shobdo-video-state shobdo-video-state-error"
            >

              <AlertTriangle
                size={30}
              />


              <strong>
                {t(
                  "videos.unavailable",
                  "Unable to load videos"
                )}
              </strong>


              <p>
                {currentError}
              </p>


              <button
                type="button"
                onClick={
                  refreshCurrent
                }
              >

                <RefreshCw
                  size={17}
                />

                {t(
                  "videos.tryAgain",
                  "Try again"
                )}

              </button>

            </div>

          )}


          {/* =============================================
              EMPTY
          ============================================== */}

          {!currentLoading &&
            !currentError &&
            currentItems
              .length ===
              0 && (

            <div
              className="shobdo-video-state shobdo-video-state-empty"
            >

              {activeTab ===
              "following"
                ? (
                  <Users
                    size={34}
                  />
                )
                : (
                  <Film
                    size={34}
                  />
                )}


              <strong>
                {activeTab ===
                "following"
                  ? t(
                      "videos.noFollowingMedia",
                      "No videos or Reels here yet"
                    )
                  : t(
                      "videos.noVideos",
                      "No videos yet"
                    )}
              </strong>


              <p>
                {activeTab ===
                "following"
                  ? t(
                      "videos.noFollowingMediaDescription",
                      "Follow creators to see their latest videos and Reels here."
                    )
                  : t(
                      "videos.noVideosDescription",
                      "Be the first to share a video with the SHOBDO community."
                    )}
              </p>


              {activeTab ===
                "videos" && (

                <Link
                  to="/write?mode=video"
                >

                  <Plus
                    size={17}
                  />

                  {t(
                    "videos.addVideo",
                    "Add Video"
                  )}

                </Link>

              )}

            </div>

          )}


          {/* =============================================
              POSTS
          ============================================== */}

          {!currentLoading &&
            !currentError &&
            currentItems
              .length >
              0 && (

            <div
              className="shobdo-video-post-list"
            >

              {currentItems.map(
                (
                  item
                ) => {

                  const mediaType =
                    item
                      ?.__mediaType ||
                    "video";


                  const menuKey =
                    `${mediaType}-${item.id}`;


                  return (

                    <VideoCard
                      key={menuKey}
                      item={item}
                      type={mediaType}
                      user={user}
                      language={
                        language
                      }
                      t={t}
                      menuOpen={
                        openMenuId ===
                        menuKey
                      }
                      deleting={
                        mediaType ===
                          "video" &&
                        Number(
                          deletingId
                        ) ===
                          Number(
                            item.id
                          )
                      }
                      onToggleMenu={
                        (
                          event
                        ) => {

                          event
                            .stopPropagation();


                          setOpenMenuId(
                            (
                              current
                            ) =>
                              current ===
                              menuKey
                                ? null
                                : menuKey
                          );

                        }
                      }
                      onDelete={
                        (
                          video
                        ) => {

                          setOpenMenuId(
                            null
                          );


                          setDeleteTarget(
                            video
                          );

                        }
                      }
                      onShare={
                        async (
                          event
                        ) => {

                          event
                            ?.stopPropagation?.();


                          setOpenMenuId(
                            null
                          );


                          await shareItem(
                            item,
                            mediaType
                          );

                        }
                      }
                      onCopy={
                        async (
                          event
                        ) => {

                          event
                            ?.stopPropagation?.();


                          setOpenMenuId(
                            null
                          );


                          await copyItemLink(
                            item,
                            mediaType
                          );

                        }
                      }
                      onPlay={
                        handlePlay
                      }
                    />

                  );

                }
              )}

            </div>

          )}

        </section>

      )}


      {/* =================================================
          DELETE CONFIRMATION
      ================================================== */}

      {deleteTarget && (

        <div
          className="shobdo-video-modal-backdrop"
          role="presentation"
          onClick={
            () => {

              if (
                deletingId
              ) {

                return;

              }


              setDeleteTarget(
                null
              );

            }
          }
        >

          <div
            className="shobdo-video-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-video-title"
            onClick={
              (
                event
              ) =>
                event
                  .stopPropagation()
            }
          >

            <button
              type="button"
              className="shobdo-video-modal-close"
              disabled={
                Boolean(
                  deletingId
                )
              }
              onClick={
                () =>
                  setDeleteTarget(
                    null
                  )
              }
              aria-label={t(
                "videos.close",
                "Close"
              )}
            >

              <X
                size={20}
              />

            </button>


            <div
              className="shobdo-video-delete-icon"
            >

              <Trash2
                size={25}
              />

            </div>


            <span
              className="shobdo-video-modal-eyebrow"
            >
              {t(
                "videos.removeVideo",
                "REMOVE VIDEO"
              )}
            </span>


            <h2
              id="delete-video-title"
            >
              {t(
                "videos.deleteConfirmTitle",
                "Delete this video?"
              )}
            </h2>


            <p>
              {t(
                "videos.deleteConfirmDescription",
                "This video will be permanently removed from SHOBDO. This action cannot be undone."
              )}
            </p>


            <div
              className="shobdo-video-delete-preview"
            >

              <Film
                size={17}
              />

              <span>
                {getTitle(
                  deleteTarget,
                  "video"
                )}
              </span>

            </div>


            <div
              className="shobdo-video-modal-actions"
            >

              <button
                type="button"
                className="shobdo-video-modal-cancel"
                disabled={
                  Boolean(
                    deletingId
                  )
                }
                onClick={
                  () =>
                    setDeleteTarget(
                      null
                    )
                }
              >
                {t(
                  "videos.cancel",
                  "Cancel"
                )}
              </button>


              <button
                type="button"
                className="shobdo-video-modal-delete"
                disabled={
                  Boolean(
                    deletingId
                  )
                }
                onClick={
                  confirmDelete
                }
              >

                {deletingId
                  ? (
                    <LoaderCircle
                      size={18}
                      className="shobdo-video-spin"
                    />
                  )
                  : (
                    <Trash2
                      size={18}
                    />
                  )}


                <span>
                  {deletingId
                    ? t(
                        "videos.deleting",
                        "Deleting..."
                      )
                    : t(
                        "videos.deleteVideo",
                        "Delete video"
                      )}
                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          TOAST
      ================================================== */}

      {toast && (

        <div
          className="shobdo-video-toast"
          role="status"
        >

          <Check
            size={17}
          />

          <span>
            {toast}
          </span>

        </div>

      )}

    </main>

  );

}