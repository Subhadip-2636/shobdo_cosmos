import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  Bookmark,
  BookOpen,
  Clapperboard,
  Compass,
  Feather,
  Film,
  Home,
  Loader2,
  PenLine,
  RefreshCw,
  Search,
  TrendingUp,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  followUser,
  getSuggestedUsers,
  getTrendingTopics,
} from "../api/api";

import {
  getUnreadNotificationCount,
} from "../api/notifications";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./SocialLayout.css";


// =========================================================
// HELPERS
// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name || ""
    ).trim();


  if (!safeName) {
    return "?";
  }


  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    `${parts[0][0]}${parts[1][0]}`
  ).toUpperCase();
}


// =========================================================
// NUMBER HELPER
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
    ? Math.max(
        0,
        number
      )
    : 0;
}


// =========================================================
// SIDEBAR LINK
// =========================================================

function SidebarLink({
  to,
  icon: Icon,
  label,
  end = false,
  badge = null,
}) {

  return (

    <NavLink
      to={to}
      end={end}
      title={label}
      className={({
        isActive,
      }) =>
        [
          "social-nav-item",

          isActive
            ? "social-nav-item-active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >

      <span
        className="social-nav-icon"
      >

        <Icon
          size={22}
          strokeWidth={1.9}
        />

      </span>


      <span
        className="social-nav-label"
      >
        {label}
      </span>


      {badge !== null &&
        Number(badge) > 0 && (

          <span
            className="social-nav-badge"
          >

            {
              Number(badge) > 99
                ? "99+"
                : badge
            }

          </span>

        )}

    </NavLink>

  );
}


// =========================================================
// MOBILE NAV LINK
// =========================================================

function MobileNavLink({
  to,
  icon: Icon,
  label,
  end = false,
  badge = null,
}) {

  return (

    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({
        isActive,
      }) =>
        [
          "social-mobile-link",

          isActive
            ? "social-mobile-link-active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >

      <span
        className="social-mobile-icon-wrap"
      >

        <Icon
          size={21}
          strokeWidth={2}
        />


        {badge !== null &&
          Number(badge) > 0 && (

            <span
              className="social-mobile-badge"
            >

              {
                Number(badge) > 9
                  ? "9+"
                  : badge
              }

            </span>

          )}

      </span>


      <span>
        {label}
      </span>

    </NavLink>

  );
}


// =========================================================
// SOCIAL LAYOUT
// =========================================================

export default function SocialLayout({
  user,
}) {

  const navigate =
    useNavigate();


  const {
    t,
    language,
  } = useLanguage();


  // =======================================================
  // AUTH
  // =======================================================

  const authenticated =
    Boolean(
      user?.id
    );


  const profilePath =
    authenticated
      ? `/users/${user.id}`
      : "/login";


  function protectedPath(
    path
  ) {

    return authenticated
      ? path
      : "/login";

  }


  // =======================================================
  // TRANSLATION FALLBACK
  // =======================================================

  function translate(
    key,
    fallbackBn,
    fallbackEn,
    fallbackHi = null,
  ) {

    try {

      const translated =
        t(
          key
        );


      if (
        translated &&
        translated !== key
      ) {

        return translated;

      }

    } catch {

      // Fallback below.

    }


    if (
      language === "bn"
    ) {

      return fallbackBn;

    }


    if (
      language === "hi"
    ) {

      return (
        fallbackHi ||
        fallbackEn
      );

    }


    return fallbackEn;

  }


  // =======================================================
  // LABELS
  // =======================================================

  const labels = {

    home:
      translate(
        "navbar.home",
        "হোম",
        "Home",
        "होम"
      ),

    explore:
      translate(
        "navbar.explore",
        "অন্বেষণ",
        "Explore",
        "एक्सप्लोर"
      ),

    video:
      translate(
        "navbar.video",
        "ভিডিও",
        "Video",
        "वीडियो"
      ),

    search:
      translate(
        "navbar.search",
        "খুঁজুন",
        "Search",
        "खोज"
      ),

    notifications:
      translate(
        "navbar.notifications",
        "বিজ্ঞপ্তি",
        "Notifications",
        "सूचनाएँ"
      ),

    myWritings:
      translate(
        "navbar.myWritings",
        "আমার লেখা",
        "My writings",
        "मेरी रचनाएँ"
      ),

    saved:
      translate(
        "saved.title",
        "সংরক্ষিত",
        "Saved",
        "सहेजे गए"
      ),

    profile:
      translate(
        "profile.title",
        "প্রোফাইল",
        "Profile",
        "प्रोफ़ाइल"
      ),

    write:
      translate(
        "navbar.write",
        "নতুন লেখা",
        "Create",
        "नई रचना"
      ),

    whoToFollow:
      language === "bn"
        ? "কাদের অনুসরণ করবেন"
        : language === "hi"
          ? "किसे फ़ॉलो करें"
          : "Who to follow",

    follow:
      language === "bn"
        ? "অনুসরণ"
        : language === "hi"
          ? "फ़ॉलो"
          : "Follow",

    followers:
      language === "bn"
        ? "অনুসারী"
        : language === "hi"
          ? "फ़ॉलोअर्स"
          : "followers",

    writings:
      language === "bn"
        ? "লেখা"
        : language === "hi"
          ? "रचनाएँ"
          : "writings",

    refresh:
      language === "bn"
        ? "রিফ্রেশ"
        : language === "hi"
          ? "रीफ़्रेश"
          : "Refresh",

    viewMore:
      language === "bn"
        ? "আরও লেখক খুঁজুন"
        : language === "hi"
          ? "और लेखक खोजें"
          : "Find more writers",

    noSuggestions:
      language === "bn"
        ? "এই মুহূর্তে নতুন কোনো লেখকের পরামর্শ নেই।"
        : language === "hi"
          ? "अभी कोई नया लेखक सुझाव उपलब्ध नहीं है।"
          : "No new writer suggestions right now.",

    suggestionError:
      language === "bn"
        ? "লেখকদের পরামর্শ লোড করা যায়নি।"
        : language === "hi"
          ? "लेखक सुझाव लोड नहीं हो सके।"
          : "Writer suggestions could not be loaded.",

    retry:
      language === "bn"
        ? "আবার চেষ্টা করুন"
        : language === "hi"
          ? "फिर कोशिश करें"
          : "Try again",

    trendingTopics:
      language === "bn"
        ? "SHOBDO-তে ট্রেন্ডিং"
        : language === "hi"
          ? "SHOBDO पर ट्रेंडिंग"
          : "Trending on SHOBDO",

    trendingLoading:
      language === "bn"
        ? "ট্রেন্ডিং বিষয় লোড হচ্ছে..."
        : language === "hi"
          ? "ट्रेंडिंग विषय लोड हो रहे हैं..."
          : "Loading trending topics...",

    trendingError:
      language === "bn"
        ? "ট্রেন্ডিং বিষয় লোড করা যায়নি।"
        : language === "hi"
          ? "ट्रेंडिंग विषय लोड नहीं हो सके।"
          : "Trending topics could not be loaded.",

    noTrendingTopics:
      language === "bn"
        ? "এখনও কোনো ট্রেন্ডিং হ্যাশট্যাগ নেই।"
        : language === "hi"
          ? "अभी कोई ट्रेंडिंग हैशटैग नहीं है।"
          : "No trending hashtags yet.",

    trendingFallback:
      language === "bn"
        ? "সাম্প্রতিক কার্যকলাপ কম, তাই সর্বকালের জনপ্রিয় বিষয় দেখানো হচ্ছে।"
        : language === "hi"
          ? "हाल की गतिविधि कम है, इसलिए सर्वकालिक लोकप्रिय विषय दिखाए जा रहे हैं।"
          : "Recent activity is low, so all-time popular topics are shown.",

    community:
      language === "bn"
        ? "SHOBDO কমিউনিটি"
        : language === "hi"
          ? "SHOBDO समुदाय"
          : "SHOBDO community",

    loginMessage:
      language === "bn"
        ? (
          "লেখকদের অনুসরণ করুন, "
          + "লেখা সংরক্ষণ করুন এবং "
          + "কমিউনিটির সঙ্গে যুক্ত থাকুন।"
        )
        : language === "hi"
          ? (
            "लेखकों को फ़ॉलो करें, "
            + "रचनाएँ सहेजें और समुदाय "
            + "से जुड़े रहें।"
          )
          : (
            "Follow writers, save writings "
            + "and stay connected with the community."
          ),

    login:
      translate(
        "navbar.login",
        "লগ ইন",
        "Log in",
        "लॉग इन"
      ),

  };


  // =======================================================
  // NOTIFICATION COUNT
  // =======================================================

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(
    0
  );


  useEffect(
    () => {

      let cancelled =
        false;


      if (
        !authenticated
      ) {

        setUnreadCount(
          0
        );

        return undefined;

      }


      async function loadUnreadCount() {

        try {

          const response =
            await getUnreadNotificationCount();


          if (
            cancelled
          ) {

            return;

          }


          setUnreadCount(
            safeNumber(
              response?.unread_count
            )
          );

        } catch (
          error
        ) {

          if (
            cancelled
          ) {

            return;

          }


          if (
            error?.status === 401 ||
            error?.status === 422
          ) {

            setUnreadCount(
              0
            );

            return;

          }


          console.error(
            "SOCIAL LAYOUT NOTIFICATION COUNT ERROR:",
            error
          );

        }

      }


      loadUnreadCount();


      function handleNotificationChange() {

        loadUnreadCount();

      }


      function handleWindowFocus() {

        loadUnreadCount();

      }


      window.addEventListener(
        "shobdo:notifications-changed",
        handleNotificationChange
      );


      window.addEventListener(
        "focus",
        handleWindowFocus
      );


      const intervalId =
        window.setInterval(
          loadUnreadCount,
          60000
        );


      return () => {

        cancelled =
          true;


        window.removeEventListener(
          "shobdo:notifications-changed",
          handleNotificationChange
        );


        window.removeEventListener(
          "focus",
          handleWindowFocus
        );


        window.clearInterval(
          intervalId
        );

      };

    },
    [
      authenticated,
      user?.id,
    ]
  );


  // =======================================================
  // SUGGESTED WRITERS STATE
  // =======================================================

  const [
    suggestedUsers,
    setSuggestedUsers,
  ] = useState(
    []
  );


  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] = useState(
    true
  );


  const [
    suggestionsError,
    setSuggestionsError,
  ] = useState(
    ""
  );


  const [
    followingUserIds,
    setFollowingUserIds,
  ] = useState(
    []
  );


  // =======================================================
  // LOAD SUGGESTED WRITERS
  // =======================================================

  const loadSuggestedUsers =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (
          !silent
        ) {

          setSuggestionsLoading(
            true
          );

        }


        try {

          const response =
            await getSuggestedUsers({
              page: 1,
              limit: 4,
            });


          const users =
            Array.isArray(
              response?.users
            )
              ? response.users
              : [];


          const uniqueUsers =
            Array.from(

              new Map(

                users
                  .filter(
                    (
                      suggestedUser
                    ) =>
                      suggestedUser?.id
                  )
                  .map(
                    (
                      suggestedUser
                    ) => [

                      Number(
                        suggestedUser.id
                      ),

                      suggestedUser,

                    ]
                  )

              ).values()

            );


          setSuggestedUsers(
            uniqueUsers
          );


          setSuggestionsError(
            ""
          );

        } catch (
          error
        ) {

          console.error(
            "SUGGESTED USERS ERROR:",
            error
          );


          if (
            !silent
          ) {

            setSuggestionsError(
              error?.message ||
              "Unable to load writer suggestions."
            );

          }

        } finally {

          if (
            !silent
          ) {

            setSuggestionsLoading(
              false
            );

          }

        }

      },
      []
    );


  // =======================================================
  // LOAD SUGGESTIONS
  // =======================================================

  useEffect(
    () => {

      loadSuggestedUsers();

    },
    [
      loadSuggestedUsers,
      user?.id,
    ]
  );


  // =======================================================
  // FOLLOW SUGGESTED WRITER
  // =======================================================

  async function handleFollowSuggestedUser(
    suggestedUserId
  ) {

    if (
      !authenticated
    ) {

      navigate(
        "/login"
      );

      return;

    }


    const id =
      Number(
        suggestedUserId
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return;

    }


    if (
      followingUserIds.includes(
        id
      )
    ) {

      return;

    }


    setFollowingUserIds(
      (
        previous
      ) => [

        ...previous,

        id,

      ]
    );


    try {

      await followUser(
        id
      );


      setSuggestedUsers(
        (
          previous
        ) =>
          previous.filter(
            (
              suggestedUser
            ) =>
              Number(
                suggestedUser?.id
              )
              !==
              id
          )
      );


      await loadSuggestedUsers({
        silent: true,
      });


      window.dispatchEvent(

        new CustomEvent(
          "shobdo:follow-changed",
          {
            detail: {

              user_id:
                id,

              following:
                true,

            },
          }
        )

      );

    } catch (
      error
    ) {

      console.error(
        "FOLLOW SUGGESTED USER ERROR:",
        error
      );


      window.alert(

        error?.message ||

        (
          language === "bn"
            ? "লেখককে অনুসরণ করা যায়নি।"
            : language === "hi"
              ? "लेखक को फ़ॉलो नहीं किया जा सका।"
              : "Unable to follow this writer."
        )

      );

    } finally {

      setFollowingUserIds(
        (
          previous
        ) =>
          previous.filter(
            (
              existingId
            ) =>
              existingId !== id
          )
      );

    }

  }


  // =======================================================
  // REAL TRENDING TOPICS STATE
  // =======================================================

  const [
    trendingTopics,
    setTrendingTopics,
  ] = useState(
    []
  );


  const [
    trendingLoading,
    setTrendingLoading,
  ] = useState(
    true
  );


  const [
    trendingError,
    setTrendingError,
  ] = useState(
    ""
  );


  const [
    trendingFallbackUsed,
    setTrendingFallbackUsed,
  ] = useState(
    false
  );


  // =======================================================
  // LOAD REAL TRENDING TOPICS
  // =======================================================

  const loadTrendingTopics =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (
          !silent
        ) {

          setTrendingLoading(
            true
          );

        }


        try {

          const response =
            await getTrendingTopics({
              limit: 6,
              period: 7,
            });


          const topics =
            Array.isArray(
              response?.topics
            )
              ? response.topics
              : [];


          // Remove malformed and duplicate topics.

          const uniqueTopics =
            Array.from(

              new Map(

                topics
                  .filter(
                    (
                      topic
                    ) =>
                      String(
                        topic?.name || ""
                      ).trim()
                  )
                  .map(
                    (
                      topic
                    ) => {

                      const name =
                        String(
                          topic?.name || ""
                        ).trim();


                      return [

                        name.toLocaleLowerCase(),

                        {
                          ...topic,

                          name,

                          hashtag:
                            topic?.hashtag ||
                            `#${name}`,

                          writings_count:
                            safeNumber(
                              topic?.writings_count
                            ),

                        },

                      ];

                    }
                  )

              ).values()

            );


          setTrendingTopics(
            uniqueTopics
          );


          setTrendingFallbackUsed(
            Boolean(
              response?.fallback_used
            )
          );


          setTrendingError(
            ""
          );

        } catch (
          error
        ) {

          console.error(
            "TRENDING TOPICS ERROR:",
            error
          );


          if (
            !silent
          ) {

            setTrendingError(
              error?.message ||
              "Unable to load trending topics."
            );

          }

        } finally {

          if (
            !silent
          ) {

            setTrendingLoading(
              false
            );

          }

        }

      },
      []
    );


  // =======================================================
  // LOAD / AUTO REFRESH TRENDING
  // =======================================================

  useEffect(
    () => {

      loadTrendingTopics();


      function handleFocus() {

        loadTrendingTopics({
          silent: true,
        });

      }


      window.addEventListener(
        "focus",
        handleFocus
      );


      // Trending data does not need extremely frequent
      // polling. Refresh every five minutes.

      const intervalId =
        window.setInterval(
          () => {

            loadTrendingTopics({
              silent: true,
            });

          },
          5 * 60 * 1000
        );


      return () => {

        window.removeEventListener(
          "focus",
          handleFocus
        );


        window.clearInterval(
          intervalId
        );

      };

    },
    [
      loadTrendingTopics,
    ]
  );


  // =======================================================
  // UI
  // =======================================================

  return (

    <>

      <div
        className="social-layout"
      >

        {/* ===============================================
            LEFT SIDEBAR
        ================================================ */}

        <aside
          className="social-left-sidebar"
        >

          <div
            className="social-left-inner"
          >

            {/* ===========================================
                NAVIGATION
            ============================================ */}

            <nav
              className="social-navigation"
              aria-label="Main navigation"
            >

              <SidebarLink
                to="/"
                icon={Home}
                label={
                  labels.home
                }
                end
              />


              <SidebarLink
                to="/explore"
                icon={Compass}
                label={
                  labels.explore
                }
              />

              <SidebarLink
                to="/videos"
                icon={Film}
                label={
                  labels.video
                }
              />

              <SidebarLink
                to="/search"
                icon={Search}
                label={
                  labels.search
                }
              />


              <SidebarLink
                to={
                  protectedPath(
                    "/notifications"
                  )
                }
                icon={Bell}
                label={
                  labels.notifications
                }
                badge={
                  authenticated
                    ? unreadCount
                    : null
                }
              />


              <SidebarLink
                to={
                  protectedPath(
                    "/my-writings"
                  )
                }
                icon={BookOpen}
                label={
                  labels.myWritings
                }
              />


              <SidebarLink
                to={
                  protectedPath(
                    "/saved"
                  )
                }
                icon={Bookmark}
                label={
                  labels.saved
                }
              />


              <SidebarLink
                to={
                  profilePath
                }
                icon={UserRound}
                label={
                  labels.profile
                }
              />

            </nav>


            {/* ===========================================
                CREATE WRITING
            ============================================ */}

            <NavLink
              to={
                protectedPath(
                  "/write"
                )
              }
              className="social-create-button"
            >

              <PenLine
                size={20}
                strokeWidth={2}
              />


              <span>
                {labels.write}
              </span>

            </NavLink>


            {/* ===========================================
                CURRENT USER
            ============================================ */}

            {authenticated && (

              <NavLink
                to={
                  profilePath
                }
                className="social-sidebar-user"
              >

                <div
                  className="social-sidebar-avatar"
                >

                  {user?.avatar_url
                    ? (

                      <img
                        src={
                          user.avatar_url
                        }
                        alt=""
                      />

                    )
                    : (

                      <span>

                        {
                          getInitials(
                            user?.name ||
                            user?.username
                          )
                        }

                      </span>

                    )}

                </div>


                <div
                  className="social-sidebar-user-text"
                >

                  <strong>

                    {
                      user?.name ||
                      "SHOBDO User"
                    }

                  </strong>


                  <span>

                    {
                      user?.username
                        ? `@${user.username}`
                        : "SHOBDO"
                    }

                  </span>

                </div>

              </NavLink>

            )}

          </div>

        </aside>


        {/* ===============================================
            MAIN CONTENT
        ================================================ */}

        <main
          className="social-main-content"
        >

          <Outlet />

        </main>


        {/* ===============================================
            RIGHT SIDEBAR
        ================================================ */}

        <aside
          className="social-right-sidebar"
        >

          <div
            className="social-right-inner"
          >

            {/* ===========================================
                WHO TO FOLLOW
            ============================================ */}

            <section
              className="social-side-card social-suggestions-card"
            >

              <div
                className="social-suggestions-header"
              >

                <div
                  className="social-side-card-heading"
                >

                  <span
                    className="social-side-heading-icon"
                  >

                    <UsersRound
                      size={18}
                    />

                  </span>


                  <h3>
                    {labels.whoToFollow}
                  </h3>

                </div>


                <button
                  type="button"
                  className="social-side-refresh"
                  onClick={
                    () =>
                      loadSuggestedUsers()
                  }
                  disabled={
                    suggestionsLoading
                  }
                  aria-label={
                    labels.refresh
                  }
                  title={
                    labels.refresh
                  }
                >

                  {suggestionsLoading
                    ? (

                      <Loader2
                        size={16}
                        className="social-spin"
                      />

                    )
                    : (

                      <RefreshCw
                        size={16}
                      />

                    )}

                </button>

              </div>


              {/* =========================================
                  SUGGESTIONS LOADING
              ========================================== */}

              {suggestionsLoading && (

                <div
                  className="social-suggestions-loading"
                >

                  {[1, 2, 3].map(
                    (
                      item
                    ) => (

                      <div
                        key={
                          item
                        }
                        className="social-suggestion-skeleton"
                      >

                        <span
                          className="social-skeleton-avatar"
                        />


                        <span
                          className="social-skeleton-lines"
                        >

                          <span />

                          <span />

                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


              {/* =========================================
                  SUGGESTION ERROR
              ========================================== */}

              {!suggestionsLoading &&
                suggestionsError && (

                  <div
                    className="social-suggestions-state"
                  >

                    <p>
                      {
                        labels.suggestionError
                      }
                    </p>


                    <button
                      type="button"
                      onClick={
                        () =>
                          loadSuggestedUsers()
                      }
                    >

                      {
                        labels.retry
                      }

                    </button>

                  </div>

                )}


              {/* =========================================
                  NO SUGGESTIONS
              ========================================== */}

              {!suggestionsLoading &&
                !suggestionsError &&
                suggestedUsers.length === 0 && (

                  <div
                    className="social-suggestions-state"
                  >

                    <UserPlus
                      size={22}
                    />


                    <p>
                      {
                        labels.noSuggestions
                      }
                    </p>


                    <button
                      type="button"
                      onClick={
                        () =>
                          loadSuggestedUsers()
                      }
                    >

                      <RefreshCw
                        size={14}
                      />

                      {
                        labels.refresh
                      }

                    </button>

                  </div>

                )}


              {/* =========================================
                  SUGGESTED WRITERS
              ========================================== */}

              {!suggestionsLoading &&
                !suggestionsError &&
                suggestedUsers.length > 0 && (

                  <div
                    className="social-suggestion-list"
                  >

                    {suggestedUsers.map(
                      (
                        suggestedUser
                      ) => {

                        const suggestedUserId =
                          Number(
                            suggestedUser?.id
                          );


                        const followLoading =
                          followingUserIds.includes(
                            suggestedUserId
                          );


                        const followersCount =
                          safeNumber(
                            suggestedUser
                              ?.followers_count
                          );


                        const writingsCount =
                          safeNumber(
                            suggestedUser
                              ?.writings_count
                          );


                        return (

                          <article
                            key={
                              suggestedUserId
                            }
                            className="social-suggestion-item"
                          >

                            <NavLink
                              to={
                                `/users/${suggestedUserId}`
                              }
                              className="social-suggestion-profile"
                            >

                              <div
                                className="social-suggestion-avatar"
                              >

                                {suggestedUser
                                  ?.avatar_url
                                  ? (

                                    <img
                                      src={
                                        suggestedUser
                                          .avatar_url
                                      }
                                      alt=""
                                    />

                                  )
                                  : (

                                    <span>

                                      {
                                        getInitials(
                                          suggestedUser
                                            ?.name ||
                                          suggestedUser
                                            ?.username
                                        )
                                      }

                                    </span>

                                  )}

                              </div>


                              <div
                                className="social-suggestion-info"
                              >

                                <strong>

                                  {
                                    suggestedUser
                                      ?.name ||
                                    "SHOBDO Writer"
                                  }

                                </strong>


                                <span
                                  className="social-suggestion-username"
                                >

                                  {
                                    suggestedUser
                                      ?.username
                                      ? `@${suggestedUser.username}`
                                      : `@writer${suggestedUserId}`
                                  }

                                </span>


                                <small
                                  className="social-suggestion-stats"
                                >

                                  {followersCount}

                                  {" "}

                                  {labels.followers}

                                  <span
                                    className="social-suggestion-separator"
                                    aria-hidden="true"
                                  >
                                    ·
                                  </span>

                                  {writingsCount}

                                  {" "}

                                  {labels.writings}

                                </small>

                              </div>

                            </NavLink>


                            <button
                              type="button"
                              className="social-follow-button"
                              disabled={
                                followLoading
                              }
                              aria-label={`${labels.follow} ${
                                suggestedUser?.name ||
                                suggestedUser?.username ||
                                "SHOBDO Writer"
                              }`}
                              title={labels.follow}
                              onClick={
                                () =>
                                  handleFollowSuggestedUser(
                                    suggestedUserId
                                  )
                              }
                            >

                              {followLoading
                                ? (

                                  <Loader2
                                    size={14}
                                    className="social-spin"
                                  />

                                )
                                : (

                                  <UserPlus
                                    size={14}
                                  />

                                )}


                              <span>
                                {
                                  labels.follow
                                }
                              </span>

                            </button>

                          </article>

                        );

                      }
                    )}

                  </div>

                )}


              {!suggestionsLoading &&
                !suggestionsError &&
                suggestedUsers.length > 0 && (

                  <NavLink
                    to="/search?type=writers"
                    className="social-suggestions-more"
                  >

                    <Search
                      size={15}
                    />


                    <span>
                      {
                        labels.viewMore
                      }
                    </span>

                  </NavLink>

                )}

            </section>


            {/* ===========================================
                REAL TRENDING TOPICS
            ============================================ */}

            <section
              className="social-side-card"
            >

              <div
                className="social-suggestions-header"
              >

                <div
                  className="social-side-card-heading"
                >

                  <span
                    className="social-side-heading-icon"
                  >

                    <TrendingUp
                      size={18}
                    />

                  </span>


                  <h3>
                    {
                      labels.trendingTopics
                    }
                  </h3>

                </div>


                <button
                  type="button"
                  className="social-side-refresh"
                  onClick={
                    () =>
                      loadTrendingTopics()
                  }
                  disabled={
                    trendingLoading
                  }
                  aria-label={
                    labels.refresh
                  }
                  title={
                    labels.refresh
                  }
                >

                  {trendingLoading
                    ? (

                      <Loader2
                        size={16}
                        className="social-spin"
                      />

                    )
                    : (

                      <RefreshCw
                        size={16}
                      />

                    )}

                </button>

              </div>


              {/* =========================================
                  TRENDING LOADING
              ========================================== */}

              {trendingLoading && (

                <div
                  className="social-suggestions-state"
                >

                  <Loader2
                    size={21}
                    className="social-spin"
                  />


                  <p>
                    {
                      labels.trendingLoading
                    }
                  </p>

                </div>

              )}


              {/* =========================================
                  TRENDING ERROR
              ========================================== */}

              {!trendingLoading &&
                trendingError && (

                  <div
                    className="social-suggestions-state"
                  >

                    <TrendingUp
                      size={22}
                    />


                    <p>
                      {
                        labels.trendingError
                      }
                    </p>


                    <button
                      type="button"
                      onClick={
                        () =>
                          loadTrendingTopics()
                      }
                    >

                      <RefreshCw
                        size={14}
                      />

                      {
                        labels.retry
                      }

                    </button>

                  </div>

                )}


              {/* =========================================
                  NO TRENDING TOPICS
              ========================================== */}

              {!trendingLoading &&
                !trendingError &&
                trendingTopics.length === 0 && (

                  <div
                    className="social-suggestions-state"
                  >

                    <TrendingUp
                      size={22}
                    />


                    <p>
                      {
                        labels.noTrendingTopics
                      }
                    </p>


                    <button
                      type="button"
                      onClick={
                        () =>
                          loadTrendingTopics()
                      }
                    >

                      <RefreshCw
                        size={14}
                      />

                      {
                        labels.refresh
                      }

                    </button>

                  </div>

                )}


              {/* =========================================
                  TRENDING LIST
              ========================================== */}

              {!trendingLoading &&
                !trendingError &&
                trendingTopics.length > 0 && (

                  <>

                    <div
                      className="social-topic-list"
                    >

                      {trendingTopics.map(
                        (
                          topic
                        ) => {

                          const topicName =
                            String(
                              topic?.name || ""
                            ).trim();


                          const topicLabel =
                            topic?.hashtag ||
                            `#${topicName}`;


                          const writingsCount =
                            safeNumber(
                              topic?.writings_count
                            );


                          return (

                            <NavLink
                              key={
                                topic?.id ||
                                topicName
                              }
                              to={
                                `/tag/${encodeURIComponent(
                                  topicName
                                )}`
                              }
                              className="social-topic-item"
                              title={
                                topicLabel
                              }
                            >

                              <span
                                className="social-topic-name"
                              >

                                {topicLabel}

                                {" · "}

                                {writingsCount}

                                {" "}

                                {labels.writings}

                              </span>


                              <span
                                className="social-topic-arrow"
                                aria-hidden="true"
                              >
                                →
                              </span>

                            </NavLink>

                          );

                        }
                      )}

                    </div>


                    {trendingFallbackUsed && (

                      <p
                        className="social-side-description"
                      >
                        {
                          labels.trendingFallback
                        }
                      </p>

                    )}

                  </>

                )}

            </section>


            {/* ===========================================
                GUEST COMMUNITY CARD
            ============================================ */}

            {!authenticated && (

              <section
                className="social-side-card social-community-card"
              >

                <div
                  className="social-community-icon"
                >

                  <Feather
                    size={22}
                  />

                </div>


                <h3>
                  {
                    labels.community
                  }
                </h3>


                <p>
                  {
                    labels.loginMessage
                  }
                </p>


                <NavLink
                  to="/login"
                  className="social-community-button"
                >

                  {
                    labels.login
                  }

                </NavLink>

              </section>

            )}


            {/* ===========================================
                MINI FOOTER
            ============================================ */}

            <footer
              className="social-mini-footer"
            >

              <NavLink
                to="/about"
              >
                About
              </NavLink>


              <NavLink
                to="/privacy"
              >
                Privacy
              </NavLink>


              <NavLink
                to="/terms"
              >
                Terms
              </NavLink>


              <span>
                © 2026 SHOBDO
              </span>

            </footer>

          </div>

        </aside>

      </div>


      {/* ===============================================
          MOBILE BOTTOM NAVIGATION
      ================================================ */}

      <nav
        className="social-mobile-nav"
        aria-label="Mobile navigation"
      >

        <MobileNavLink
          to="/"
          icon={Home}
          label={
            labels.home
          }
          end
        />


        <MobileNavLink
          to="/explore"
          icon={Compass}
          label={
            labels.explore
          }
        />

        <MobileNavLink
          to="/videos"
          icon={Film}
          label={
            labels.video
          }
        />

        <NavLink
          to={
            protectedPath(
              "/write"
            )
          }
          className="social-mobile-create"
          aria-label={
            labels.write
          }
          title={
            labels.write
          }
        >

          <PenLine
            size={23}
            strokeWidth={2.2}
          />

        </NavLink>


        <MobileNavLink
          to={
            protectedPath(
              "/notifications"
            )
          }
          icon={Bell}
          label={
            labels.notifications
          }
          badge={
            authenticated
              ? unreadCount
              : null
          }
        />


        <MobileNavLink
          to={
            profilePath
          }
          icon={UserRound}
          label={
            labels.profile
          }
        />

      </nav>

    </>

  );
}