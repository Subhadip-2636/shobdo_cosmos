import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clapperboard,
  Film,
  LoaderCircle,
  Plus,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  getReels,
} from "../api/reels";

import Reels
  from "./Reels";

import ReelsTab from "./ReelsTab";

import "./Videos.css";


// =========================================================
// API
// =========================================================

const RAW_API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000"
  ).replace(
    /\/+$/,
    ""
  );


const API_URL =
  RAW_API_URL.endsWith(
    "/api"
  )
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


// =========================================================
// CONSTANTS
// =========================================================

const VIDEO_LIMIT = 40;

const FOLLOWING_LIMIT = 50;

const REEL_LIMIT = 40;

const VALID_TABS = [
  "videos",
  "reels",
  "following",
];


// =========================================================
// MULTILINGUAL COPY
// =========================================================

const COPY = {

  // =======================================================
  // ENGLISH
  // =======================================================

  en: {

    eyebrow:
      "SHOBDO MEDIA",

    title:
      "Video",

    description:
      "Watch videos, discover Reels and keep up with creators you follow.",

    videos:
      "Videos",

    reels:
      "Reels",

    following:
      "Following",

    createVideo:
      "Add Video",

    createReel:
      "Create Reel",

    loading:
      "Loading videos...",

    loadingFollowing:
      "Loading media from writers you follow...",

    retry:
      "Try again",

    refresh:
      "Refresh",

    unavailable:
      "Unable to load videos.",

    followingUnavailable:
      "Unable to load your Following media.",

    emptyVideos:
      "No videos have been published yet.",

    emptyVideosDescription:
      "Published SHOBDO videos will appear here.",

    emptyFollowing:
      "Your Following media feed is quiet.",

    emptyFollowingDescription:
      "Follow more writers and their videos and Reels will appear here.",

    discoverWriters:
      "Discover writers",

    loginRequired:
      "Log in to view your Following media.",

    login:
      "Log in",

    unknownCreator:
      "SHOBDO creator",

    untitled:
      "Untitled video",

    reel:
      "Reel",

    video:
      "Video",

    views:
      "views",

    public:
      "Public",

    published:
      "Published",

  },


  // =======================================================
  // BENGALI
  // =======================================================

  bn: {

    eyebrow:
      "SHOBDO মিডিয়া",

    title:
      "ভিডিও",

    description:
      "ভিডিও দেখুন, রিলস আবিষ্কার করুন এবং আপনার অনুসরণ করা স্রষ্টাদের নতুন মিডিয়া দেখুন।",

    videos:
      "ভিডিও",

    reels:
      "রিলস",

    following:
      "অনুসরণ",

    createVideo:
      "ভিডিও যোগ করুন",

    createReel:
      "রিল তৈরি করুন",

    loading:
      "ভিডিও লোড হচ্ছে...",

    loadingFollowing:
      "আপনি যাদের অনুসরণ করেন তাদের মিডিয়া লোড হচ্ছে...",

    retry:
      "আবার চেষ্টা করুন",

    refresh:
      "রিফ্রেশ",

    unavailable:
      "ভিডিও লোড করা যায়নি।",

    followingUnavailable:
      "Following মিডিয়া লোড করা যায়নি।",

    emptyVideos:
      "এখনও কোনো ভিডিও প্রকাশিত হয়নি।",

    emptyVideosDescription:
      "প্রকাশিত SHOBDO ভিডিও এখানে দেখা যাবে।",

    emptyFollowing:
      "আপনার Following মিডিয়া ফিড এখনও খালি।",

    emptyFollowingDescription:
      "আরও লেখককে অনুসরণ করুন। তাদের ভিডিও ও রিলস এখানে দেখা যাবে।",

    discoverWriters:
      "লেখক খুঁজুন",

    loginRequired:
      "Following মিডিয়া দেখতে লগ ইন করুন।",

    login:
      "লগ ইন",

    unknownCreator:
      "SHOBDO স্রষ্টা",

    untitled:
      "শিরোনামহীন ভিডিও",

    reel:
      "রিল",

    video:
      "ভিডিও",

    views:
      "ভিউ",

    public:
      "পাবলিক",

    published:
      "প্রকাশিত",

  },


  // =======================================================
  // HINDI
  // =======================================================

  hi: {

    eyebrow:
      "SHOBDO मीडिया",

    title:
      "वीडियो",

    description:
      "वीडियो देखें, रील्स खोजें और जिन रचनाकारों को आप फ़ॉलो करते हैं उनकी नई मीडिया देखें।",

    videos:
      "वीडियो",

    reels:
      "रील्स",

    following:
      "फ़ॉलोइंग",

    createVideo:
      "वीडियो जोड़ें",

    createReel:
      "रील बनाएँ",

    loading:
      "वीडियो लोड हो रहे हैं...",

    loadingFollowing:
      "आप जिन लोगों को फ़ॉलो करते हैं उनकी मीडिया लोड हो रही है...",

    retry:
      "फिर कोशिश करें",

    refresh:
      "रीफ़्रेश",

    unavailable:
      "वीडियो लोड नहीं हो सके।",

    followingUnavailable:
      "Following मीडिया लोड नहीं हो सकी।",

    emptyVideos:
      "अभी कोई वीडियो प्रकाशित नहीं हुआ है।",

    emptyVideosDescription:
      "प्रकाशित SHOBDO वीडियो यहाँ दिखाई देंगे।",

    emptyFollowing:
      "आपकी Following मीडिया फ़ीड अभी खाली है।",

    emptyFollowingDescription:
      "और लेखकों को फ़ॉलो करें। उनके वीडियो और रील्स यहाँ दिखाई देंगे।",

    discoverWriters:
      "लेखक खोजें",

    loginRequired:
      "Following मीडिया देखने के लिए लॉग इन करें।",

    login:
      "लॉग इन",

    unknownCreator:
      "SHOBDO creator",

    untitled:
      "Untitled video",

    reel:
      "रील",

    video:
      "वीडियो",

    views:
      "व्यू",

    public:
      "पब्लिक",

    published:
      "प्रकाशित",

  },

};


// =========================================================
// TOKEN
// =========================================================

function getToken() {

  return localStorage.getItem(
    "shobdo_token"
  );

}


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  {
    signal,
  } = {}
) {

  const token =
    getToken();


  const headers = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        method:
          "GET",

        headers,

        signal,
      }
    );


  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}.`
      );


    error.status =
      response.status;


    throw error;

  }


  return data;

}


// =========================================================
// HELPERS
// =========================================================

function safeNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


// =========================================================

function formatCount(
  value
) {

  const number =
    safeNumber(
      value
    );


  if (
    number >=
    1_000_000
  ) {

    return `${(
      number /
      1_000_000
    ).toFixed(1)}M`;

  }


  if (
    number >=
    1_000
  ) {

    return `${(
      number /
      1_000
    ).toFixed(1)}K`;

  }


  return String(
    number
  );

}


// =========================================================

function formatDate(
  value
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


  try {

    return new Intl.DateTimeFormat(
      undefined,
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

    return "";

  }

}


// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name ||
      "Writer"
    ).trim();


  if (!safeName) {
    return "W";
  }


  return safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(
      0,
      2
    )
    .map(
      (
        part
      ) =>
        part[0]
    )
    .join("")
    .toUpperCase();

}


// =========================================================
// EXTRACT VIDEO ARRAY
// =========================================================

function extractVideos(
  payload
) {

  if (
    Array.isArray(
      payload
    )
  ) {

    return payload;

  }


  const candidates = [

    payload?.videos,

    payload?.items,

    payload?.results,

    payload?.data?.videos,

    payload?.data?.items,

    payload?.data,

  ];


  for (
    const candidate
    of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {

      return candidate;

    }

  }


  return [];

}


// =========================================================
// EXTRACT REELS
// =========================================================

function extractReels(
  payload
) {

  if (
    Array.isArray(
      payload
    )
  ) {

    return payload;

  }


  const candidates = [

    payload?.reels,

    payload?.items,

    payload?.results,

    payload?.data?.reels,

    payload?.data?.items,

  ];


  for (
    const candidate
    of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {

      return candidate;

    }

  }


  return [];

}


// =========================================================
// EXTRACT FOLLOWING USERS
// =========================================================

function extractFollowingUsers(
  payload
) {

  if (
    Array.isArray(
      payload
    )
  ) {

    return payload;

  }


  const candidates = [

    payload?.users,

    payload?.following,

    payload?.items,

    payload?.results,

    payload?.data?.users,

    payload?.data?.following,

  ];


  for (
    const candidate
    of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {

      return candidate;

    }

  }


  return [];

}


// =========================================================
// AUTHOR
// =========================================================

function getMediaAuthor(
  media
) {

  return (
    media?.author ||
    media?.creator ||
    media?.user ||
    media?.owner ||
    {}
  );

}


// =========================================================
// CREATOR ID
// =========================================================

function getMediaUserId(
  media
) {

  const author =
    getMediaAuthor(
      media
    );


  const value =
    media?.user_id ??
    media?.author_id ??
    media?.creator_id ??
    media?.owner_id ??
    author?.id ??
    null;


  const id =
    Number(
      value
    );


  return Number.isFinite(
    id
  )
    ? id
    : null;

}


// =========================================================
// VIDEO URL
// =========================================================

function getVideoUrl(
  media
) {

  return (
    media?.video_url ||
    media?.file_url ||
    media?.url ||
    media?.media_url ||
    media?.cloudinary_url ||
    ""
  );

}


// =========================================================
// POSTER URL
// =========================================================

function getPosterUrl(
  media
) {

  return (
    media?.thumbnail_url ||
    media?.poster_url ||
    media?.thumbnail ||
    media?.poster ||
    ""
  );

}


// =========================================================
// DATE
// =========================================================

function getMediaDate(
  media
) {

  return (
    media?.published_at ||
    media?.created_at ||
    media?.updated_at ||
    null
  );

}


// =========================================================
// PUBLISHED / PUBLIC VIDEO
// =========================================================

function isVisibleVideo(
  video
) {

  const status =
    String(
      video?.status ||
      ""
    )
      .trim()
      .toLowerCase();


  const visibility =
    String(
      video?.visibility ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    status &&
    status !== "published"
  ) {

    return false;

  }


  if (
    visibility ===
    "private"
  ) {

    return false;

  }


  return true;

}


// =========================================================
// NORMALIZE TAB
// =========================================================

function normalizeTab(
  value
) {

  const tab =
    String(
      value ||
      ""
    )
      .trim()
      .toLowerCase();


  return VALID_TABS.includes(
    tab
  )
    ? tab
    : "videos";

}


// =========================================================
// VIDEO CARD
// =========================================================

function VideoCard({
  video,
  copy,
  mediaKind = "video",
}) {

  const author =
    getMediaAuthor(
      video
    );


  const authorName =
    author?.name ||
    author?.full_name ||
    author?.username ||
    video?.user_name ||
    video?.author_name ||
    copy.unknownCreator;


  const authorId =
    getMediaUserId(
      video
    );


  const avatar =
    author?.profile_picture ||
    author?.avatar_url ||
    author?.avatar ||
    video?.user_avatar ||
    video?.author_avatar ||
    "";


  const videoUrl =
    getVideoUrl(
      video
    );


  const posterUrl =
    getPosterUrl(
      video
    );


  const title =
    mediaKind ===
      "reel"
      ? (
          video?.caption ||
          video?.title ||
          copy.reel
        )
      : (
          video?.title ||
          copy.untitled
        );


  const description =
    mediaKind ===
      "reel"
      ? ""
      : (
          video?.description ||
          video?.caption ||
          ""
        );


  const views =
    safeNumber(
      video?.views_count ??
      video?.view_count ??
      video?.views
    );


  const date =
    formatDate(
      getMediaDate(
        video
      )
    );


  return (

    <article
      className="shobdo-video-card"
    >

      {/* =================================================
          AUTHOR
      ================================================== */}

      <div
        className="shobdo-video-author-row"
      >

        <Link
          to={
            authorId
              ? `/users/${authorId}`
              : "#"
          }
          className="shobdo-video-author"
        >

          <span
            className="shobdo-video-avatar"
          >

            {avatar
              ? (

                <img
                  src={
                    avatar
                  }
                  alt=""
                />

              )
              : (

                <span>
                  {
                    getInitials(
                      authorName
                    )
                  }
                </span>

              )}

          </span>


          <span
            className="shobdo-video-author-copy"
          >

            <strong>
              {authorName}
            </strong>


            <small>

              {
                mediaKind ===
                  "reel"
                  ? copy.reel
                  : copy.video
              }

              {date
                ? ` · ${date}`
                : ""}

            </small>

          </span>

        </Link>


        <span
          className="shobdo-video-card-label"
        >

          {mediaKind ===
            "reel"
            ? (

              <Clapperboard
                size={15}
              />

            )
            : (

              <Film
                size={15}
              />

            )}

          {
            mediaKind ===
              "reel"
              ? copy.reel
              : copy.video
          }

        </span>

      </div>


      {/* =================================================
          COPY
      ================================================== */}

      <div
        className="shobdo-video-copy"
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


      {/* =================================================
          PLAYER
      ================================================== */}

      <div
        className={[
          "shobdo-video-player-shell",

          mediaKind ===
            "reel"
            ? "shobdo-video-player-shell-reel"
            : "",

        ]
          .filter(Boolean)
          .join(" ")
        }
      >

        {videoUrl
          ? (

            <video
              className="shobdo-video-player"
              src={
                videoUrl
              }
              poster={
                posterUrl ||
                undefined
              }
              controls
              playsInline
              preload="metadata"
            />

          )
          : (

            <div
              className="shobdo-video-missing"
            >

              {mediaKind ===
                "reel"
                ? (

                  <Clapperboard
                    size={32}
                  />

                )
                : (

                  <Film
                    size={32}
                  />

                )}

              <span>
                Media unavailable
              </span>

            </div>

          )}

      </div>


      {/* =================================================
          META
      ================================================== */}

      <footer
        className="shobdo-video-meta"
      >

        <span>

          {formatCount(
            views
          )}

          {" "}

          {copy.views}

        </span>


        {video?.language && (

          <span>
            {
              String(
                video.language
              ).toUpperCase()
            }
          </span>

        )}


        {video?.category && (

          <span>
            {video.category}
          </span>

        )}

      </footer>

    </article>

  );

}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  icon:
    Icon,
  title,
  description,
  action,
}) {

  return (

    <div
      className="shobdo-video-state"
    >

      <div
        className="shobdo-video-empty-icon"
      >

        <Icon
          size={31}
        />

      </div>


      <h2>
        {title}
      </h2>


      <p>
        {description}
      </p>


      {action}

    </div>

  );

}


// =========================================================
// VIDEOS PAGE
// =========================================================

export default function Videos({
  user,
}) {

  const navigate =
    useNavigate();


  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const {
    language,
  } =
    useLanguage();


  const copy =
    COPY[
      language
    ] ||
    COPY.en;


  // =======================================================
  // ACTIVE TAB
  // =======================================================

  const activeTab =
    normalizeTab(
      searchParams.get(
        "tab"
      )
    );


  // =======================================================
  // VIDEO STATE
  // =======================================================

  const [
    videos,
    setVideos,
  ] =
    useState([]);


  const [
    videosLoading,
    setVideosLoading,
  ] =
    useState(true);


  const [
    videosError,
    setVideosError,
  ] =
    useState("");


  // =======================================================
  // FOLLOWING STATE
  // =======================================================

  const [
    followingMedia,
    setFollowingMedia,
  ] =
    useState([]);


  const [
    followingLoading,
    setFollowingLoading,
  ] =
    useState(false);


  const [
    followingError,
    setFollowingError,
  ] =
    useState("");


  const [
    followingLoaded,
    setFollowingLoaded,
  ] =
    useState(false);


  // =======================================================
  // SET TAB
  // =======================================================

  const setTab =
    useCallback(
      (
        tab
      ) => {

        const normalized =
          normalizeTab(
            tab
          );


        if (
          normalized ===
            "following" &&
          !user?.id
        ) {

          navigate(
            "/login"
          );

          return;

        }


        const nextParams =
          new URLSearchParams(
            searchParams
          );


        if (
          normalized ===
          "videos"
        ) {

          nextParams.delete(
            "tab"
          );

        } else {

          nextParams.set(
            "tab",
            normalized
          );

        }


        setSearchParams(
          nextParams
        );

      },
      [
        navigate,
        searchParams,
        setSearchParams,
        user?.id,
      ]
    );


  // =======================================================
  // LOAD VIDEOS
  // =======================================================

  const loadVideos =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (!silent) {

          setVideosLoading(
            true
          );

        }


        setVideosError(
          ""
        );


        try {

          const data =
            await apiRequest(
              `/videos?page=1&limit=${VIDEO_LIMIT}`
            );


          const items =
            extractVideos(
              data
            )
              .filter(
                isVisibleVideo
              );


          setVideos(
            items
          );

        } catch (
          error
        ) {

          console.error(
            "LOAD VIDEOS ERROR:",
            error
          );


          setVideosError(
            error?.message ||
            copy.unavailable
          );

        } finally {

          setVideosLoading(
            false
          );

        }

      },
      [
        copy.unavailable,
      ]
    );


  // =======================================================
  // INITIAL VIDEOS
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
  // LOAD FOLLOWING MEDIA
  // =======================================================

  const loadFollowingMedia =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (
          !user?.id
        ) {

          setFollowingMedia(
            []
          );

          setFollowingLoaded(
            false
          );

          return;

        }


        if (!silent) {

          setFollowingLoading(
            true
          );

        }


        setFollowingError(
          ""
        );


        try {

          // -----------------------------------------------
          // 1. LOAD USERS CURRENT USER FOLLOWS
          // -----------------------------------------------

          const followingData =
            await apiRequest(
              `/users/${user.id}/following?page=1&limit=${FOLLOWING_LIMIT}`
            );


          const followingUsers =
            extractFollowingUsers(
              followingData
            );


          const followedIds =
            new Set(
              followingUsers
                .map(
                  (
                    followedUser
                  ) =>
                    Number(
                      followedUser?.id
                    )
                )
                .filter(
                  Number.isFinite
                )
            );


          if (
            followedIds.size ===
            0
          ) {

            setFollowingMedia(
              []
            );

            setFollowingLoaded(
              true
            );

            return;

          }


          // -----------------------------------------------
          // 2. LOAD VIDEO + REEL FEEDS IN PARALLEL
          // -----------------------------------------------

          const [
            videosResult,
            reelsResult,
          ] =
            await Promise.allSettled([

              apiRequest(
                `/videos?page=1&limit=${VIDEO_LIMIT}`
              ),

              getReels({
                page:
                  1,

                perPage:
                  REEL_LIMIT,
              }),

            ]);


          // -----------------------------------------------
          // VIDEOS
          // -----------------------------------------------

          const allVideos =
            videosResult.status ===
              "fulfilled"
              ? extractVideos(
                  videosResult.value
                )
                  .filter(
                    isVisibleVideo
                  )
              : [];


          const followedVideos =
            allVideos
              .filter(
                (
                  video
                ) => {

                  const creatorId =
                    getMediaUserId(
                      video
                    );


                  return (
                    creatorId !==
                      null &&
                    followedIds.has(
                      creatorId
                    )
                  );

                }
              )
              .map(
                (
                  video
                ) => ({

                  ...video,

                  _mediaKind:
                    "video",

                  _sortDate:
                    getMediaDate(
                      video
                    ),

                })
              );


          // -----------------------------------------------
          // REELS
          // -----------------------------------------------

          const allReels =
            reelsResult.status ===
              "fulfilled"
              ? extractReels(
                  reelsResult.value
                )
              : [];


          const followedReels =
            allReels
              .filter(
                (
                  reel
                ) => {

                  const creatorId =
                    getMediaUserId(
                      reel
                    );


                  return (
                    creatorId !==
                      null &&
                    followedIds.has(
                      creatorId
                    )
                  );

                }
              )
              .map(
                (
                  reel
                ) => ({

                  ...reel,

                  _mediaKind:
                    "reel",

                  _sortDate:
                    getMediaDate(
                      reel
                    ),

                })
              );


          // -----------------------------------------------
          // 3. MERGE + NEWEST FIRST
          // -----------------------------------------------

          const merged =
            [
              ...followedVideos,
              ...followedReels,
            ]
              .sort(
                (
                  a,
                  b
                ) => {

                  const aTime =
                    a?._sortDate
                      ? new Date(
                          a._sortDate
                        ).getTime()
                      : 0;


                  const bTime =
                    b?._sortDate
                      ? new Date(
                          b._sortDate
                        ).getTime()
                      : 0;


                  return (
                    bTime -
                    aTime
                  );

                }
              );


          setFollowingMedia(
            merged
          );


          setFollowingLoaded(
            true
          );

        } catch (
          error
        ) {

          console.error(
            "LOAD FOLLOWING MEDIA ERROR:",
            error
          );


          setFollowingError(
            error?.message ||
            copy.followingUnavailable
          );


          setFollowingLoaded(
            true
          );

        } finally {

          setFollowingLoading(
            false
          );

        }

      },
      [
        copy.followingUnavailable,
        user?.id,
      ]
    );


  // =======================================================
  // LOAD FOLLOWING WHEN OPENED
  // =======================================================

  useEffect(
    () => {

      if (
        activeTab !==
          "following"
      ) {

        return;

      }


      if (
        !user?.id
      ) {

        return;

      }


      if (
        followingLoaded
      ) {

        return;

      }


      loadFollowingMedia();

    },
    [
      activeTab,
      followingLoaded,
      loadFollowingMedia,
      user?.id,
    ]
  );


  // =======================================================
  // RESET FOLLOWING CACHE WHEN USER CHANGES
  // =======================================================

  useEffect(
    () => {

      setFollowingLoaded(
        false
      );

      setFollowingMedia(
        []
      );

      setFollowingError(
        ""
      );

    },
    [
      user?.id,
    ]
  );


  // =======================================================
  // PAGE TITLE
  // =======================================================

  useEffect(
    () => {

      if (
        activeTab ===
        "reels"
      ) {

        document.title =
          `${copy.reels} | SHOBDO`;

        return;

      }


      if (
        activeTab ===
        "following"
      ) {

        document.title =
          `${copy.following} | SHOBDO`;

        return;

      }


      document.title =
        `${copy.title} | SHOBDO`;

    },
    [
      activeTab,
      copy.following,
      copy.reels,
      copy.title,
    ]
  );


  // =======================================================
  // CURRENT VIDEO LIST
  // =======================================================

  const visibleVideos =
    useMemo(
      () =>
        videos.filter(
          isVisibleVideo
        ),
      [
        videos,
      ]
    );


  // =======================================================
  // REELS MODE CLASS
  // =======================================================

  const reelsActive =
    activeTab ===
    "reels";


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className={[
        "shobdo-video-hub",

        reelsActive
          ? "shobdo-video-hub-reels-active"
          : "",

      ]
        .filter(Boolean)
        .join(" ")
      }
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <header
        className="shobdo-video-hub-header"
      >

        <div
          className="shobdo-video-hub-heading"
        >

          <span
            className="shobdo-video-hub-icon"
          >
            <Film
              size={22}
            />
          </span>


          <div>

            <span
              className="shobdo-video-hub-eyebrow"
            >
              {copy.eyebrow}
            </span>


            <h1>
              {copy.title}
            </h1>


            <p>
              {copy.description}
            </p>

          </div>

        </div>


        {/* ===============================================
            CREATE ACTIONS
        ================================================ */}

        {user && (

          <div
            className="shobdo-video-create-actions"
          >

            <Link
              to="/write?mode=video"
              className="shobdo-video-create-button"
            >

              <Plus
                size={17}
              />

              <span>
                {copy.createVideo}
              </span>

            </Link>


            <Link
              to="/reels/create"
              className="shobdo-video-create-button shobdo-video-create-button-secondary"
            >

              <Clapperboard
                size={17}
              />

              <span>
                {copy.createReel}
              </span>

            </Link>

          </div>

        )}

      </header>


      {/* =================================================
          TABS
      ================================================== */}

      <nav
        className="shobdo-video-tabs"
        aria-label="Video feed"
      >

        {/* VIDEOS */}

        <button
          type="button"
          className={
            activeTab ===
              "videos"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            () =>
              setTab(
                "videos"
              )
          }
          aria-current={
            activeTab ===
              "videos"
              ? "page"
              : undefined
          }
        >

          <Film
            size={17}
          />

          <span>
            {copy.videos}
          </span>

        </button>


        {/* REELS */}

        <button
          type="button"
          className={
            activeTab ===
              "reels"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            () =>
              setTab(
                "reels"
              )
          }
          aria-current={
            activeTab ===
              "reels"
              ? "page"
              : undefined
          }
        >

          <Clapperboard
            size={17}
          />

          <span>
            {copy.reels}
          </span>

        </button>


        {/* FOLLOWING */}

        <button
          type="button"
          className={
            activeTab ===
              "following"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            () =>
              setTab(
                "following"
              )
          }
          aria-current={
            activeTab ===
              "following"
              ? "page"
              : undefined
          }
        >

          <UsersRound
            size={17}
          />

          <span>
            {copy.following}
          </span>

        </button>

      </nav>


      {/* =================================================
          VIDEOS TAB
      ================================================== */}

      {activeTab ===
        "videos" && (

        <section
          className="shobdo-videos-section"
        >

          {/* REFRESH */}

          {!videosLoading &&
            !videosError && (

            <div
              className="shobdo-video-section-actions"
            >

              <button
                type="button"
                className="shobdo-video-refresh-button"
                onClick={
                  () =>
                    loadVideos()
                }
                title={
                  copy.refresh
                }
                aria-label={
                  copy.refresh
                }
              >

                <RefreshCw
                  size={16}
                />

              </button>

            </div>

          )}


          {/* LOADING */}

          {videosLoading && (

            <div
              className="shobdo-video-state"
            >

              <LoaderCircle
                className="spin"
                size={32}
              />

              <p>
                {copy.loading}
              </p>

            </div>

          )}


          {/* ERROR */}

          {!videosLoading &&
            videosError && (

            <div
              className="shobdo-video-state"
            >

              <Film
                size={31}
              />

              <h2>
                {copy.unavailable}
              </h2>

              <p>
                {videosError}
              </p>

              <button
                type="button"
                className="shobdo-video-empty-create"
                onClick={
                  () =>
                    loadVideos()
                }
              >
                {copy.retry}
              </button>

            </div>

          )}


          {/* EMPTY */}

          {!videosLoading &&
            !videosError &&
            visibleVideos.length ===
              0 && (

            <EmptyState
              icon={
                Film
              }
              title={
                copy.emptyVideos
              }
              description={
                copy.emptyVideosDescription
              }
              action={
                user
                  ? (

                    <Link
                      to="/write?mode=video"
                      className="shobdo-video-empty-create"
                    >
                      <Plus
                        size={16}
                      />

                      {copy.createVideo}
                    </Link>

                  )
                  : null
              }
            />

          )}


          {/* VIDEO FEED */}

          {!videosLoading &&
            !videosError &&
            visibleVideos.length >
              0 && (

            <div
              className="shobdo-video-feed"
            >

              {visibleVideos.map(
                (
                  video
                ) => (

                  <VideoCard
                    key={
                      `video-${video.id}`
                    }
                    video={
                      video
                    }
                    copy={
                      copy
                    }
                    mediaKind="video"
                  />

                )
              )}

            </div>

          )}

        </section>

      )}


      {/* =================================================
          REELS TAB
      ================================================== */}

      {activeTab ===
        "reels" && (

        <section
          className="shobdo-video-reels-section"
        >

          <ReelsTab
            user={
              user
            }
          />

        </section>

      )}


      {/* =================================================
          FOLLOWING TAB
      ================================================== */}

      {activeTab ===
        "following" && (

        <section
          className="shobdo-videos-section"
        >

          {/* NOT LOGGED IN */}

          {!user?.id && (

            <EmptyState
              icon={
                UserRound
              }
              title={
                copy.loginRequired
              }
              description={
                copy.loginRequired
              }
              action={

                <Link
                  to="/login"
                  className="shobdo-video-empty-create"
                >
                  {copy.login}
                </Link>

              }
            />

          )}


          {/* LOGGED IN */}

          {user?.id && (
            <>

              {/* REFRESH */}

              {!followingLoading && (

                <div
                  className="shobdo-video-section-actions"
                >

                  <button
                    type="button"
                    className="shobdo-video-refresh-button"
                    onClick={
                      () =>
                        loadFollowingMedia({
                          silent:
                            false,
                        })
                    }
                    title={
                      copy.refresh
                    }
                    aria-label={
                      copy.refresh
                    }
                  >

                    <RefreshCw
                      size={16}
                    />

                  </button>

                </div>

              )}


              {/* LOADING */}

              {followingLoading && (

                <div
                  className="shobdo-video-state"
                >

                  <LoaderCircle
                    className="spin"
                    size={32}
                  />

                  <p>
                    {
                      copy.loadingFollowing
                    }
                  </p>

                </div>

              )}


              {/* ERROR */}

              {!followingLoading &&
                followingError && (

                <div
                  className="shobdo-video-state"
                >

                  <UsersRound
                    size={31}
                  />

                  <h2>
                    {
                      copy.followingUnavailable
                    }
                  </h2>

                  <p>
                    {
                      followingError
                    }
                  </p>

                  <button
                    type="button"
                    className="shobdo-video-empty-create"
                    onClick={
                      () =>
                        loadFollowingMedia()
                    }
                  >
                    {copy.retry}
                  </button>

                </div>

              )}


              {/* EMPTY */}

              {!followingLoading &&
                !followingError &&
                followingLoaded &&
                followingMedia.length ===
                  0 && (

                <EmptyState
                  icon={
                    UsersRound
                  }
                  title={
                    copy.emptyFollowing
                  }
                  description={
                    copy.emptyFollowingDescription
                  }
                  action={

                    <Link
                      to="/explore"
                      className="shobdo-video-empty-create"
                    >
                      <UserRound
                        size={16}
                      />

                      {
                        copy.discoverWriters
                      }
                    </Link>

                  }
                />

              )}


              {/* FOLLOWING FEED */}

              {!followingLoading &&
                !followingError &&
                followingMedia.length >
                  0 && (

                <div
                  className="shobdo-video-feed"
                >

                  {followingMedia.map(
                    (
                      media,
                      index
                    ) => (

                      <VideoCard
                        key={
                          `${
                            media._mediaKind
                          }-${
                            media.id
                          }-${index}`
                        }
                        video={
                          media
                        }
                        copy={
                          copy
                        }
                        mediaKind={
                          media._mediaKind ||
                          "video"
                        }
                      />

                    )
                  )}

                </div>

              )}

            </>
          )}

        </section>

      )}

    </main>

  );

}