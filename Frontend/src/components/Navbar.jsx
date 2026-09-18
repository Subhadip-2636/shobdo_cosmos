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
// HELPERS
// =========================================================

function getInitials(name) {

  const safeName =
    String(name || "")
      .trim();

  if (!safeName) {
    return "U";
  }

  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }

  return (
    `${parts[0][0]}${parts[1][0]}`
  ).toUpperCase();
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
  ] = useState("");


  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false);


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  const [
    mobileSearchOpen,
    setMobileSearchOpen,
  ] = useState(false);


  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);


  // =======================================================
  // REFS
  // =======================================================

  const languageMenuRef =
    useRef(null);

  const profileMenuRef =
    useRef(null);

  const searchInputRef =
    useRef(null);


  // =======================================================
  // TRANSLATION FALLBACK
  // =======================================================

  function translate(
    key,
    fallback,
  ) {

    try {

      const translated =
        t(key);

      if (
        translated &&
        translated !== key
      ) {

        return translated;

      }

    } catch {

      // Ignore missing translation.
    }

    return fallback;
  }


  const labels = {

    search:
      language === "bn"
        ? "লেখা, লেখক ও বিষয় খুঁজুন"
        : language === "hi"
          ? "लेख, लेखक और विषय खोजें"
          : "Search writings, people and topics",

    notifications:
      translate(
        "navbar.notifications",
        language === "bn"
          ? "বিজ্ঞপ্তি"
          : language === "hi"
            ? "सूचनाएँ"
            : "Notifications"
      ),

    profile:
      language === "bn"
        ? "প্রোফাইল"
        : language === "hi"
          ? "प्रोफ़ाइल"
          : "Profile",

    myWritings:
      translate(
        "navbar.myWritings",
        language === "bn"
          ? "আমার লেখা"
          : language === "hi"
            ? "मेरी रचनाएँ"
            : "My writings"
      ),

    saved:
      language === "bn"
        ? "সংরক্ষিত"
        : language === "hi"
          ? "सहेजे गए"
          : "Saved",

    editProfile:
      language === "bn"
        ? "প্রোফাইল সম্পাদনা"
        : language === "hi"
          ? "प्रोफ़ाइल संपादित करें"
          : "Edit profile",

    logout:
      translate(
        "navbar.logout",
        language === "bn"
          ? "লগ আউট"
          : language === "hi"
            ? "लॉग आउट"
            : "Log out"
      ),

    login:
      translate(
        "navbar.login",
        language === "bn"
          ? "লগ ইন"
          : language === "hi"
            ? "लॉग इन"
            : "Log in"
      ),

    language:
      translate(
        "navbar.websiteLanguage",
        language === "bn"
          ? "ওয়েবসাইটের ভাষা"
          : language === "hi"
            ? "वेबसाइट भाषा"
            : "Website language"
      ),

  };


  // =======================================================
  // USER INFO
  // =======================================================

  const userInitials =
    getInitials(
      user?.name
    );


  const profilePath =
    user?.id
      ? `/users/${user.id}`
      : "/login";


  const notificationBadge =
    unreadNotificationCount > 99
      ? "99+"
      : unreadNotificationCount;


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


    if (!query) {

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


  function openMobileSearch() {

    setMobileSearchOpen(
      true
    );

    setLanguageOpen(
      false
    );

    setProfileOpen(
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

      if (setUser) {

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
  // CLICK OUTSIDE MENUS
  // =======================================================

  useEffect(
    () => {

      function handleOutsideClick(
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
        "mousedown",
        handleOutsideClick
      );


      return () => {

        document.removeEventListener(
          "mousedown",
          handleOutsideClick
        );

      };

    },
    []
  );


  // =======================================================
  // CLOSE ON ROUTE CHANGE
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
  // MOBILE SEARCH AUTOFOCUS
  // =======================================================

  useEffect(
    () => {

      if (
        mobileSearchOpen
      ) {

        window.setTimeout(
          () => {

            searchInputRef.current
              ?.focus();

          },
          50
        );

      }

    },
    [
      mobileSearchOpen,
    ]
  );


  // =======================================================
  // UNREAD NOTIFICATION COUNT
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      if (!user) {

        setUnreadNotificationCount(
          0
        );

        return undefined;

      }


      async function loadUnreadCount() {

        try {

          const data =
            await getUnreadNotificationCount();


          if (cancelled) {
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

          if (cancelled) {
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
      user?.id,
    ]
  );


  // =======================================================
  // UI
  // =======================================================

  return (

    <header
      className="shobdo-navbar"
    >

      <div
        className="shobdo-navbar-inner"
      >

        {/* ===============================================
            BRAND
        ================================================ */}

        <Link
          to="/"
          className="shobdo-navbar-brand"
          aria-label="SHOBDO"
        >

          <span
            className="shobdo-navbar-logo"
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


        {/* ===============================================
            DESKTOP GLOBAL SEARCH
        ================================================ */}

        <form
          className="shobdo-navbar-search"
          onSubmit={
            handleSearchSubmit
          }
        >

          <Search
            className="shobdo-navbar-search-icon"
            size={18}
            strokeWidth={1.9}
          />


          <input
            type="search"
            value={
              searchQuery
            }
            onChange={
              (
                event
              ) =>
                setSearchQuery(
                  event.target.value
                )
            }
            placeholder={
              labels.search
            }
            aria-label={
              labels.search
            }
            autoComplete="off"
          />


          {searchQuery && (

            <button
              type="button"
              className="shobdo-search-clear"
              aria-label="Clear search"
              onClick={
                () =>
                  setSearchQuery("")
              }
            >

              <X
                size={15}
              />

            </button>

          )}

        </form>


        {/* ===============================================
            RIGHT SIDE
        ================================================ */}

        <div
          className="shobdo-navbar-actions"
        >

          {/* MOBILE SEARCH */}

          <button
            type="button"
            className="shobdo-navbar-icon-button shobdo-mobile-search-trigger"
            aria-label={
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


          {/* =============================================
              NOTIFICATIONS
          ============================================== */}

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
                labels.notifications
              }
              title={
                labels.notifications
              }
            >

              <Bell
                size={20}
                strokeWidth={1.9}
              />


              {unreadNotificationCount >
                0 && (

                <span
                  className="shobdo-navbar-notification-badge"
                >
                  {notificationBadge}
                </span>

              )}

            </Link>

          )}


          {/* =============================================
              LANGUAGE
          ============================================== */}

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
                () => {

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
              }
              aria-expanded={
                languageOpen
              }
              aria-haspopup="menu"
              title={
                labels.language
              }
            >

              <Globe2
                size={18}
              />


              <span
                className="shobdo-language-name"
              >
                {
                  currentLanguage
                    ?.nativeName ||
                  language
                    ?.toUpperCase()
                }
              </span>


              <ChevronDown
                size={14}
                className={
                  languageOpen
                    ? "rotate"
                    : ""
                }
              />

            </button>


            {languageOpen && (

              <div
                className="shobdo-language-dropdown"
                role="menu"
              >

                <div
                  className="shobdo-dropdown-heading"
                >

                  <Globe2
                    size={17}
                  />

                  <span>
                    {labels.language}
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


                            {
                              item.name &&
                              item.nativeName !==
                                item.name && (

                                <small>
                                  {
                                    item.name
                                  }
                                </small>

                              )
                            }

                          </span>

                        </button>

                      );

                    }
                  )}

                </div>

              </div>

            )}

          </div>


          {/* =============================================
              PROFILE / AUTH
          ============================================== */}

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
                    () => {

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
                  }
                  aria-expanded={
                    profileOpen
                  }
                  aria-haspopup="menu"
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
                        "Writer"
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
                    className={
                      profileOpen
                        ? "rotate"
                        : ""
                    }
                  />

                </button>


                {profileOpen && (

                  <div
                    className="shobdo-profile-dropdown"
                    role="menu"
                  >

                    {/* PROFILE HEADER */}

                    <Link
                      to={
                        profilePath
                      }
                      className="shobdo-profile-dropdown-user"
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
                            "Writer"
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
                              {labels.profile}
                            </small>

                          )}

                      </span>

                    </Link>


                    <div
                      className="shobdo-dropdown-divider"
                    />


                    {/* PROFILE */}

                    <Link
                      to={
                        profilePath
                      }
                      className="shobdo-profile-menu-item"
                    >

                      <UserRound
                        size={18}
                      />

                      <span>
                        {labels.profile}
                      </span>

                    </Link>


                    {/* MY WRITINGS */}

                    <Link
                      to="/my-writings"
                      className="shobdo-profile-menu-item"
                    >

                      <FileText
                        size={18}
                      />

                      <span>
                        {labels.myWritings}
                      </span>

                    </Link>


                    {/* SAVED */}

                    <Link
                      to="/saved"
                      className="shobdo-profile-menu-item"
                    >

                      <Bookmark
                        size={18}
                      />

                      <span>
                        {labels.saved}
                      </span>

                    </Link>


                    {/* SETTINGS / EDIT */}

                    <Link
                      to="/profile/edit"
                      className="shobdo-profile-menu-item"
                    >

                      <Settings
                        size={18}
                      />

                      <span>
                        {labels.editProfile}
                      </span>

                    </Link>


                    <div
                      className="shobdo-dropdown-divider"
                    />


                    {/* LOGOUT */}

                    <button
                      type="button"
                      className="shobdo-profile-menu-item shobdo-logout-item"
                      onClick={
                        handleLogout
                      }
                    >

                      <LogOut
                        size={18}
                      />

                      <span>
                        {labels.logout}
                      </span>

                    </button>

                  </div>

                )}

              </div>

            )
            : (

              <Link
                to="/login"
                className="shobdo-login-button"
              >

                <LogIn
                  size={17}
                />

                <span>
                  {labels.login}
                </span>

              </Link>

            )}

        </div>

      </div>


      {/* ===============================================
          MOBILE SEARCH OVERLAY
      ================================================ */}

      {mobileSearchOpen && (

        <div
          className="shobdo-mobile-search-panel"
        >

          <form
            onSubmit={
              handleSearchSubmit
            }
            className="shobdo-mobile-search-form"
          >

            <Search
              size={19}
            />


            <input
              ref={
                searchInputRef
              }
              type="search"
              value={
                searchQuery
              }
              onChange={
                (
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
              }
              placeholder={
                labels.search
              }
              autoComplete="off"
            />


            <button
              type="button"
              aria-label="Close search"
              onClick={
                () =>
                  setMobileSearchOpen(
                    false
                  )
              }
            >

              <X
                size={19}
              />

            </button>

          </form>

        </div>

      )}

    </header>

  );
}


export default Navbar;