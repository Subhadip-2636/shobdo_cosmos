import {
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  Feather,
  FileText,
  Globe2,
  LogIn,
  LogOut,
  Search,
  Settings,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  logoutUser,
} from "../api/auth";

import {
  getUnreadNotificationCount,
} from "../api/notifications";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./Navbar.css";


// =========================================================
// CONSTANTS
// =========================================================

const MOBILE_BREAKPOINT =
  700;

const NOTIFICATION_REFRESH_MS =
  60000;


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


  if (
    !safeName
  ) {

    return "U";
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
  ).toUpperCase();
}


// =========================================================
// SEARCH QUERY FROM URL
// =========================================================

function getSearchQueryFromLocation(
  pathname,
  search
) {

  if (
    pathname !== "/search"
  ) {

    return "";
  }


  try {

    const params =
      new URLSearchParams(
        search
      );


    return (
      params.get("q") ||
      ""
    );

  } catch {

    return "";
  }
}


// =========================================================
// NAVBAR
// =========================================================

function Navbar({
  user,
  setUser,
}) {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    t,
    language,
    setLanguage,
    currentLanguage,
    languages,
  } = useLanguage();


  // =======================================================
  // STATE
  // =======================================================

  const [
    searchQuery,
    setSearchQuery,
  ] = useState(
    () =>
      getSearchQueryFromLocation(
        location.pathname,
        location.search
      )
  );


  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(
    false
  );


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(
    false
  );


  const [
    mobileSearchOpen,
    setMobileSearchOpen,
  ] = useState(
    false
  );


  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(
    0
  );


  const [
    scrolled,
    setScrolled,
  ] = useState(
    false
  );


  // =======================================================
  // REFS
  // =======================================================

  const languageMenuRef =
    useRef(
      null
    );


  const profileMenuRef =
    useRef(
      null
    );


  const mobileSearchInputRef =
    useRef(
      null
    );


  // =======================================================
  // TRANSLATION HELPER
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

      // Local fallback below.
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

    search:
      translate(
        "navbar.search",
        "লেখা, লেখক ও বিষয় খুঁজুন",
        "Search writings, people and topics",
        "लेख, लेखक और विषय खोजें"
      ),

    searchButton:
      translate(
        "navbar.searchButton",
        "খুঁজুন",
        "Search",
        "खोजें"
      ),

    searchHint:
      translate(
        "navbar.searchHint",
        "লেখা, লেখক, বিষয় বা হ্যাশট্যাগ খুঁজুন",
        "Search writings, writers, topics or hashtags",
        "रचनाएँ, लेखक, विषय या हैशटैग खोजें"
      ),

    clearSearch:
      translate(
        "navbar.clearSearch",
        "সার্চ মুছুন",
        "Clear search",
        "खोज साफ़ करें"
      ),

    closeSearch:
      translate(
        "navbar.closeSearch",
        "সার্চ বন্ধ করুন",
        "Close search",
        "खोज बंद करें"
      ),

    notifications:
      translate(
        "navbar.notifications",
        "বিজ্ঞপ্তি",
        "Notifications",
        "सूचनाएँ"
      ),

    language:
      translate(
        "navbar.websiteLanguage",
        "ওয়েবসাইটের ভাষা",
        "Website language",
        "वेबसाइट भाषा"
      ),

    profile:
      translate(
        "navbar.profile",
        "প্রোফাইল",
        "Profile",
        "प्रोफ़ाइल"
      ),

    openProfile:
      translate(
        "navbar.openProfile",
        "প্রোফাইল মেনু খুলুন",
        "Open profile menu",
        "प्रोफ़ाइल मेनू खोलें"
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
        "navbar.saved",
        "সংরক্ষিত",
        "Saved",
        "सहेजे गए"
      ),

    editProfile:
      translate(
        "navbar.editProfile",
        "প্রোফাইল সম্পাদনা",
        "Edit profile",
        "प्रोफ़ाइल संपादित करें"
      ),

    logout:
      translate(
        "navbar.logout",
        "লগ আউট",
        "Log out",
        "लॉग आउट"
      ),

    login:
      translate(
        "navbar.login",
        "লগ ইন",
        "Log in",
        "लॉग इन"
      ),

    register:
      translate(
        "navbar.register",
        "যোগ দিন",
        "Join",
        "जुड़ें"
      ),

    writer:
      translate(
        "common.writer",
        "লেখক",
        "Writer",
        "लेखक"
      ),

  };


  // =======================================================
  // DERIVED USER DATA
  // =======================================================

  const userInitials =
    getInitials(
      user?.name ||
      user?.username
    );


  const profilePath =
    user?.id
      ? `/users/${user.id}`
      : "/login";


  const notificationBadge =
    unreadNotificationCount > 99
      ? "99+"
      : unreadNotificationCount;


  const currentLanguageName =
    currentLanguage
      ?.nativeName ||
    String(
      language || ""
    ).toUpperCase() ||
    "Language";


  // =======================================================
  // CLOSE MENUS
  // =======================================================

  function closeMenus() {

    setLanguageOpen(
      false
    );


    setProfileOpen(
      false
    );
  }


  // =======================================================
  // SEARCH
  // =======================================================

  function handleSearchSubmit(
    event
  ) {

    event.preventDefault();


    const query =
      searchQuery.trim();


    closeMenus();


    setMobileSearchOpen(
      false
    );


    if (
      !query
    ) {

      navigate(
        "/search"
      );

      return;
    }


    navigate(
      `/search?q=${encodeURIComponent(
        query
      )}`
    );
  }


  function handleSearchClear() {

    setSearchQuery(
      ""
    );


    if (
      mobileSearchOpen
    ) {

      requestAnimationFrame(
        () => {

          mobileSearchInputRef
            .current
            ?.focus();

        }
      );
    }
  }


  function openMobileSearch() {

    closeMenus();


    setMobileSearchOpen(
      true
    );
  }


  function closeMobileSearch() {

    setMobileSearchOpen(
      false
    );
  }


  // =======================================================
  // LANGUAGE
  // =======================================================

  function handleLanguageChange(
    code
  ) {

    setLanguage(
      code
    );


    setLanguageOpen(
      false
    );
  }


  function toggleLanguageMenu() {

    setLanguageOpen(
      (
        current
      ) =>
        !current
    );


    setProfileOpen(
      false
    );
  }


  // =======================================================
  // PROFILE MENU
  // =======================================================

  function toggleProfileMenu() {

    setProfileOpen(
      (
        current
      ) =>
        !current
    );


    setLanguageOpen(
      false
    );
  }


  // =======================================================
  // LOGOUT
  // =======================================================

  async function handleLogout() {

    try {

      await logoutUser();

    } catch (
      error
    ) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    } finally {

      if (
        setUser
      ) {

        setUser(
          null
        );
      }


      setUnreadNotificationCount(
        0
      );


      closeMenus();


      navigate(
        "/",
        {
          replace: true,
        }
      );
    }
  }


  // =======================================================
  // CLICK / POINTER OUTSIDE DROPDOWNS
  // =======================================================

  useEffect(
    () => {

      function handleOutsidePointer(
        event
      ) {

        if (
          languageMenuRef.current &&
          !languageMenuRef.current.contains(
            event.target
          )
        ) {

          setLanguageOpen(
            false
          );
        }


        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(
            false
          );
        }
      }


      document.addEventListener(
        "pointerdown",
        handleOutsidePointer
      );


      return () => {

        document.removeEventListener(
          "pointerdown",
          handleOutsidePointer
        );
      };

    },
    []
  );


  // =======================================================
  // ESCAPE KEY
  // =======================================================

  useEffect(
    () => {

      function handleKeyDown(
        event
      ) {

        if (
          event.key !==
          "Escape"
        ) {

          return;
        }


        closeMenus();


        setMobileSearchOpen(
          false
        );
      }


      document.addEventListener(
        "keydown",
        handleKeyDown
      );


      return () => {

        document.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };

    },
    []
  );


  // =======================================================
  // CLOSE UI AFTER ROUTE CHANGE
  // =======================================================

  useEffect(
    () => {

      closeMenus();


      setMobileSearchOpen(
        false
      );

    },
    [
      location.pathname,
      location.search,
    ]
  );


  // =======================================================
  // KEEP SEARCH INPUT IN SYNC WITH SEARCH PAGE URL
  // =======================================================

  useEffect(
    () => {

      if (
        location.pathname !==
        "/search"
      ) {

        return;
      }


      setSearchQuery(
        getSearchQueryFromLocation(
          location.pathname,
          location.search
        )
      );

    },
    [
      location.pathname,
      location.search,
    ]
  );


  // =======================================================
  // MOBILE SEARCH AUTOFOCUS
  // =======================================================

  useEffect(
    () => {

      if (
        !mobileSearchOpen
      ) {

        return undefined;
      }


      const timerId =
        window.setTimeout(
          () => {

            mobileSearchInputRef
              .current
              ?.focus();

          },
          50
        );


      return () => {

        window.clearTimeout(
          timerId
        );
      };

    },
    [
      mobileSearchOpen,
    ]
  );


  // =======================================================
  // LOCK PAGE SCROLL WHILE MOBILE SEARCH IS OPEN
  // =======================================================

  useEffect(
    () => {

      if (
        !mobileSearchOpen
      ) {

        return undefined;
      }


      const previousOverflow =
        document.body.style
          .overflow;


      document.body.style.overflow =
        "hidden";


      return () => {

        document.body.style.overflow =
          previousOverflow;
      };

    },
    [
      mobileSearchOpen,
    ]
  );


  // =======================================================
  // CLOSE MOBILE SEARCH AFTER RESIZE TO DESKTOP
  // =======================================================

  useEffect(
    () => {

      function handleResize() {

        if (
          window.innerWidth >
          MOBILE_BREAKPOINT
        ) {

          setMobileSearchOpen(
            false
          );
        }
      }


      window.addEventListener(
        "resize",
        handleResize
      );


      return () => {

        window.removeEventListener(
          "resize",
          handleResize
        );
      };

    },
    []
  );


  // =======================================================
  // NAVBAR SCROLL STATE
  // =======================================================

  useEffect(
    () => {

      function handleScroll() {

        setScrolled(
          window.scrollY > 6
        );
      }


      handleScroll();


      window.addEventListener(
        "scroll",
        handleScroll,
        {
          passive: true,
        }
      );


      return () => {

        window.removeEventListener(
          "scroll",
          handleScroll
        );
      };

    },
    []
  );


  // =======================================================
  // UNREAD NOTIFICATION COUNT
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      if (
        !user
      ) {

        setUnreadNotificationCount(
          0
        );

        return undefined;
      }


      async function loadUnreadCount() {

        if (
          document.visibilityState ===
          "hidden"
        ) {

          return;
        }


        try {

          const data =
            await getUnreadNotificationCount();


          if (
            cancelled
          ) {

            return;
          }


          const count =
            Number(
              data?.unread_count
            );


          setUnreadNotificationCount(
            Number.isFinite(
              count
            )
              ? Math.max(
                  count,
                  0
                )
              : 0
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

            setUnreadNotificationCount(
              0
            );

            return;
          }


          console.error(
            "NOTIFICATION COUNT ERROR:",
            error
          );
        }
      }


      function handleNotificationChange() {

        loadUnreadCount();
      }


      function handleWindowFocus() {

        loadUnreadCount();
      }


      function handleVisibilityChange() {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadUnreadCount();
        }
      }


      loadUnreadCount();


      window.addEventListener(
        "shobdo:notifications-changed",
        handleNotificationChange
      );


      window.addEventListener(
        "focus",
        handleWindowFocus
      );


      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      const intervalId =
        window.setInterval(
          loadUnreadCount,
          NOTIFICATION_REFRESH_MS
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


        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );


        window.clearInterval(
          intervalId
        );
      };

    },
    [
      user?.id,
    ]
  );


  // =======================================================
  // UI
  // =======================================================

  return (

    <header
      className={
        [
          "shobdo-navbar",
          scrolled
            ? "shobdo-navbar-scrolled"
            : "",
          mobileSearchOpen
            ? "shobdo-navbar-search-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >

      <div
        className="shobdo-navbar-inner"
      >

        {/* =================================================
            BRAND
        ================================================== */}

        <Link
          to="/"
          className="shobdo-navbar-brand"
          aria-label="SHOBDO home"
        >

          <span
            className="shobdo-navbar-logo"
            aria-hidden="true"
          >

            <Feather
              size={21}
              strokeWidth={2}
            />

          </span>


          <span
            className="shobdo-navbar-brand-name"
          >
            SHOBDO
          </span>

        </Link>


        {/* =================================================
            DESKTOP / TABLET SEARCH
        ================================================== */}

        <form
          className="shobdo-navbar-search"
          role="search"
          onSubmit={
            handleSearchSubmit
          }
        >

          <Search
            className="shobdo-navbar-search-icon"
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
          />


          <input
            type="search"
            value={
              searchQuery
            }
            onChange={
              (
                event
              ) => {

                setSearchQuery(
                  event.target.value
                );

              }
            }
            placeholder={
              labels.search
            }
            aria-label={
              labels.search
            }
            autoComplete="off"
            enterKeyHint="search"
            spellCheck="false"
          />


          {searchQuery && (

            <button
              type="button"
              className="shobdo-search-clear"
              aria-label={
                labels.clearSearch
              }
              title={
                labels.clearSearch
              }
              onClick={
                handleSearchClear
              }
            >

              <X
                size={15}
              />

            </button>

          )}


          <button
            type="submit"
            className="shobdo-sr-only"
          >
            {
              labels.searchButton
            }
          </button>

        </form>


        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="shobdo-navbar-actions"
        >

          {/* ===============================================
              MOBILE SEARCH
          ================================================ */}

          <button
            type="button"
            className="shobdo-navbar-icon-button shobdo-mobile-search-trigger"
            aria-label={
              labels.search
            }
            title={
              labels.search
            }
            onClick={
              openMobileSearch
            }
          >

            <Search
              size={20}
            />

          </button>


          {/* ===============================================
              NOTIFICATIONS
          ================================================ */}

          {user && (

            <Link
              to="/notifications"
              className={
                location.pathname ===
                "/notifications"
                  ? "shobdo-navbar-icon-button shobdo-notification-button active"
                  : "shobdo-navbar-icon-button shobdo-notification-button"
              }
              aria-label={
                unreadNotificationCount > 0
                  ? `${labels.notifications}: ${unreadNotificationCount}`
                  : labels.notifications
              }
              aria-current={
                location.pathname ===
                "/notifications"
                  ? "page"
                  : undefined
              }
              title={
                labels.notifications
              }
            >

              <Bell
                size={20}
                strokeWidth={1.9}
              />


              {unreadNotificationCount > 0 && (

                <span
                  className="shobdo-navbar-notification-badge"
                  aria-hidden="true"
                >
                  {
                    notificationBadge
                  }
                </span>

              )}

            </Link>

          )}


          {/* ===============================================
              LANGUAGE
          ================================================ */}

          <div
            className="shobdo-navbar-dropdown"
            ref={
              languageMenuRef
            }
          >

            <button
              type="button"
              className={
                languageOpen
                  ? "shobdo-language-button active"
                  : "shobdo-language-button"
              }
              onClick={
                toggleLanguageMenu
              }
              aria-expanded={
                languageOpen
              }
              aria-haspopup="menu"
              aria-label={
                `${labels.language}: ${currentLanguageName}`
              }
              title={
                labels.language
              }
            >

              <Globe2
                size={18}
                aria-hidden="true"
              />


              <span
                className="shobdo-language-name"
              >
                {
                  currentLanguageName
                }
              </span>


              <ChevronDown
                size={14}
                aria-hidden="true"
                className={
                  languageOpen
                    ? "rotate"
                    : ""
                }
              />

            </button>


            {languageOpen && (

              <div
                className="shobdo-language-dropdown shobdo-dropdown-animate"
                role="menu"
                aria-label={
                  labels.language
                }
              >

                <div
                  className="shobdo-dropdown-heading"
                >

                  <Globe2
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    {
                      labels.language
                    }
                  </span>

                </div>


                <div
                  className="shobdo-language-options"
                >

                  {languages.map(
                    (
                      item
                    ) => {

                      const selected =
                        language ===
                        item.code;


                      return (

                        <button
                          key={
                            item.code
                          }
                          type="button"
                          role="menuitemradio"
                          aria-checked={
                            selected
                          }
                          className={
                            selected
                              ? "shobdo-language-option selected"
                              : "shobdo-language-option"
                          }
                          onClick={
                            () =>
                              handleLanguageChange(
                                item.code
                              )
                          }
                        >

                          <span
                            className="shobdo-language-check"
                            aria-hidden="true"
                          >

                            {selected && (

                              <Check
                                size={14}
                              />

                            )}

                          </span>


                          <span
                            className="shobdo-language-option-text"
                          >

                            <strong>
                              {
                                item.nativeName
                              }
                            </strong>


                            {item.name &&
                              item.nativeName !==
                                item.name && (

                                <small>
                                  {
                                    item.name
                                  }
                                </small>

                              )}

                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            )}

          </div>


          {/* ===============================================
              AUTHENTICATED USER
          ================================================ */}

          {user
            ? (

                <div
                  className="shobdo-navbar-dropdown shobdo-profile-wrapper"
                  ref={
                    profileMenuRef
                  }
                >

                  <button
                    type="button"
                    className={
                      profileOpen
                        ? "shobdo-profile-trigger active"
                        : "shobdo-profile-trigger"
                    }
                    onClick={
                      toggleProfileMenu
                    }
                    aria-expanded={
                      profileOpen
                    }
                    aria-haspopup="menu"
                    aria-label={
                      `${labels.openProfile}: ${
                        user?.name ||
                        labels.writer
                      }`
                    }
                    title={
                      labels.profile
                    }
                  >

                    <span
                      className="shobdo-profile-avatar"
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
                                userInitials
                              }
                            </span>

                          )}

                    </span>


                    <span
                      className="shobdo-profile-trigger-text"
                    >

                      <strong>
                        {
                          user?.name ||
                          labels.writer
                        }
                      </strong>


                      {user?.username && (

                        <small>
                          @{user.username}
                        </small>

                      )}

                    </span>


                    <ChevronDown
                      size={15}
                      aria-hidden="true"
                      className={
                        profileOpen
                          ? "rotate"
                          : ""
                      }
                    />

                  </button>


                  {profileOpen && (

                    <div
                      className="shobdo-profile-dropdown shobdo-dropdown-animate"
                      role="menu"
                      aria-label={
                        labels.profile
                      }
                    >

                      {/* =====================================
                          PROFILE HEADER
                      ====================================== */}

                      <Link
                        to={
                          profilePath
                        }
                        className="shobdo-profile-dropdown-user"
                        role="menuitem"
                      >

                        <span
                          className="shobdo-profile-dropdown-avatar"
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
                                    userInitials
                                  }
                                </span>

                              )}

                        </span>


                        <span
                          className="shobdo-profile-dropdown-user-text"
                        >

                          <strong>
                            {
                              user?.name ||
                              labels.writer
                            }
                          </strong>


                          {user?.username
                            ? (

                                <small>
                                  @{user.username}
                                </small>

                              )
                            : (

                                <small>
                                  {
                                    labels.profile
                                  }
                                </small>

                              )}

                        </span>

                      </Link>


                      <div
                        className="shobdo-dropdown-divider"
                      />


                      {/* =====================================
                          PROFILE
                      ====================================== */}

                      <Link
                        to={
                          profilePath
                        }
                        className="shobdo-profile-menu-item"
                        role="menuitem"
                      >

                        <UserRound
                          size={18}
                        />

                        <span>
                          {
                            labels.profile
                          }
                        </span>

                      </Link>


                      {/* =====================================
                          MY WRITINGS
                      ====================================== */}

                      <Link
                        to="/my-writings"
                        className="shobdo-profile-menu-item"
                        role="menuitem"
                      >

                        <FileText
                          size={18}
                        />

                        <span>
                          {
                            labels.myWritings
                          }
                        </span>

                      </Link>


                      {/* =====================================
                          SAVED
                      ====================================== */}

                      <Link
                        to="/saved"
                        className="shobdo-profile-menu-item"
                        role="menuitem"
                      >

                        <Bookmark
                          size={18}
                        />

                        <span>
                          {
                            labels.saved
                          }
                        </span>

                      </Link>


                      {/* =====================================
                          EDIT PROFILE
                      ====================================== */}

                      <Link
                        to="/profile/edit"
                        className="shobdo-profile-menu-item"
                        role="menuitem"
                      >

                        <Settings
                          size={18}
                        />

                        <span>
                          {
                            labels.editProfile
                          }
                        </span>

                      </Link>


                      <div
                        className="shobdo-dropdown-divider"
                      />


                      {/* =====================================
                          LOGOUT
                      ====================================== */}

                      <button
                        type="button"
                        className="shobdo-profile-menu-item shobdo-logout-item"
                        role="menuitem"
                        onClick={
                          handleLogout
                        }
                      >

                        <LogOut
                          size={18}
                        />

                        <span>
                          {
                            labels.logout
                          }
                        </span>

                      </button>

                    </div>

                  )}

                </div>

              )
            : (

                <div
                  className="shobdo-guest-actions"
                >

                  <Link
                    to="/login"
                    className="shobdo-login-button"
                  >

                    <LogIn
                      size={17}
                    />

                    <span>
                      {
                        labels.login
                      }
                    </span>

                  </Link>


                  <Link
                    to="/register"
                    className="shobdo-register-button"
                  >

                    <UserPlus
                      size={17}
                    />

                    <span>
                      {
                        labels.register
                      }
                    </span>

                  </Link>

                </div>

              )}

        </div>

      </div>


      {/* =================================================
          MOBILE SEARCH DIALOG
      ================================================== */}

      {mobileSearchOpen && (

        <div
          className="shobdo-mobile-search-panel"
          role="dialog"
          aria-modal="true"
          aria-label={
            labels.search
          }
          onPointerDown={
            (
              event
            ) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                closeMobileSearch();
              }
            }
          }
        >

          <div
            className="shobdo-mobile-search-shell"
          >

            <form
              onSubmit={
                handleSearchSubmit
              }
              className="shobdo-mobile-search-form"
              role="search"
            >

              <Search
                size={19}
                aria-hidden="true"
              />


              <input
                ref={
                  mobileSearchInputRef
                }
                type="search"
                value={
                  searchQuery
                }
                onChange={
                  (
                    event
                  ) => {

                    setSearchQuery(
                      event.target.value
                    );

                  }
                }
                placeholder={
                  labels.search
                }
                aria-label={
                  labels.search
                }
                autoComplete="off"
                enterKeyHint="search"
                spellCheck="false"
              />


              {searchQuery && (

                <button
                  type="button"
                  className="shobdo-mobile-search-clear"
                  aria-label={
                    labels.clearSearch
                  }
                  title={
                    labels.clearSearch
                  }
                  onClick={
                    handleSearchClear
                  }
                >

                  <X
                    size={17}
                  />

                </button>

              )}


              <button
                type="button"
                className="shobdo-mobile-search-close"
                aria-label={
                  labels.closeSearch
                }
                title={
                  labels.closeSearch
                }
                onClick={
                  closeMobileSearch
                }
              >

                <X
                  size={20}
                />

              </button>

            </form>


            <p
              className="shobdo-mobile-search-hint"
            >
              {
                labels.searchHint
              }
            </p>

          </div>

        </div>

      )}

    </header>
  );
}


export default Navbar;