import {
  BookOpen,
  Check,
  ChevronDown,
  Feather,
  Globe2,
  LogOut,
  Menu,
  PenLine,
  Search,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
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
  useLanguage,
} from "../Language/LanguageContext";


function Navbar({
  user,
  setUser,
}) {

  const navigate =
    useNavigate();

  const {
    t,
    language,
    setLanguage,
    currentLanguage,
    languages,
  } = useLanguage();


  // =====================================================
  // STATE
  // =====================================================

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false);


  const languageMenuRef =
    useRef(null);


  // =====================================================
  // CLOSE MENUS
  // =====================================================

  function closeMenus() {

    setMobileOpen(false);

    setLanguageOpen(false);
  }


  // =====================================================
  // LANGUAGE
  // =====================================================

  function handleLanguageChange(
    code
  ) {

    setLanguage(code);

    setLanguageOpen(false);
  }


  // =====================================================
  // CLICK OUTSIDE LANGUAGE MENU
  // =====================================================

  useEffect(() => {

    function handleClickOutside(
      event
    ) {

      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(
          event.target
        )
      ) {

        setLanguageOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {

    try {

      await logoutUser();

    } catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    } finally {

      if (setUser) {
        setUser(null);
      }

      closeMenus();

      navigate(
        "/",
        {
          replace: true,
        }
      );

    }

  }


  // =====================================================
  // USER INITIAL
  // =====================================================

  const userInitial =
    user?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase()
    || "U";


  // =====================================================
  // UI
  // =====================================================

  return (
    <header className="shobdo-navbar-header">

      <div className="shobdo-navbar-container">


        {/* ===============================================
            BRAND
        ================================================ */}

        <Link
          to="/"
          className="shobdo-navbar-brand"
          onClick={closeMenus}
        >

          <span className="shobdo-navbar-logo">

            <Feather size={22} />

          </span>


          <span className="shobdo-navbar-brand-text">

            <strong>
              SHOBDO
            </strong>

            <small>
              শব্দ
            </small>

          </span>

        </Link>


        {/* ===============================================
            DESKTOP NAVIGATION
        ================================================ */}

        <nav className="shobdo-navbar-links">


          {/* HOME */}

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "shobdo-nav-link active"
                : "shobdo-nav-link"
            }
          >

            {t("navbar.home")}

          </NavLink>


          {/* EXPLORE */}

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              isActive
                ? "shobdo-nav-link active"
                : "shobdo-nav-link"
            }
          >

            {t("navbar.explore")}

          </NavLink>


          {/* ABOUT */}

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "shobdo-nav-link active"
                : "shobdo-nav-link"
            }
          >

            {t("navbar.about")}

          </NavLink>


          {/* MY WRITINGS */}

          {user && (

            <NavLink
              to="/my-writings"
              className={({ isActive }) =>
                isActive
                  ? "shobdo-nav-link active"
                  : "shobdo-nav-link"
              }
            >

              <BookOpen size={15} />

              <span>
                {t("navbar.myWritings")}
              </span>

            </NavLink>

          )}


          {/* WRITE */}

          {user && (

            <NavLink
              to="/write"
              className={({ isActive }) =>
                isActive
                  ? "shobdo-nav-link active"
                  : "shobdo-nav-link"
              }
            >

              <PenLine size={15} />

              <span>
                {t("navbar.write")}
              </span>

            </NavLink>

          )}

        </nav>


        {/* ===============================================
            RIGHT ACTIONS
        ================================================ */}

        <div className="shobdo-navbar-actions">


          {/* SEARCH */}

          <Link
            to="/explore"
            className="shobdo-navbar-search"
            aria-label={
              t("navbar.search")
            }
            title={
              t("navbar.search")
            }
            onClick={closeMenus}
          >

            <Search size={19} />

          </Link>


          {/* =============================================
              LANGUAGE SELECTOR
          ============================================== */}

          <div
            className="shobdo-language"
            ref={languageMenuRef}
          >

            <button
              type="button"
              className={
                languageOpen
                  ? "shobdo-language-trigger active"
                  : "shobdo-language-trigger"
              }
              onClick={() =>
                setLanguageOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                languageOpen
              }
              aria-haspopup="menu"
              title={
                t(
                  "navbar.websiteLanguage"
                )
              }
            >

              <Globe2 size={15} />


              <span>

                {
                  currentLanguage
                    ?.nativeName
                }

              </span>


              <ChevronDown
                size={13}
                className={
                  languageOpen
                    ? "open"
                    : ""
                }
              />

            </button>


            {languageOpen && (

              <div
                className="shobdo-language-menu"
                role="menu"
              >

                <div className="shobdo-language-menu-title">

                  <Globe2 size={14} />

                  <span>

                    {t(
                      "navbar.websiteLanguage"
                    )}

                  </span>

                </div>


                {languages.map(
                  (item) => {

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
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleLanguageChange(
                            item.code
                          )
                        }
                      >

                        <span className="language-check">

                          {
                            selected
                              ? (
                                <Check
                                  size={13}
                                />
                              )
                              : null
                          }

                        </span>


                        <span>

                          <strong>

                            {
                              item.nativeName
                            }

                          </strong>


                          {
                            item.nativeName !==
                              item.name && (

                              <small>
                                {item.name}
                              </small>

                            )
                          }

                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            )}

          </div>


          {/* =============================================
              AUTH
          ============================================== */}

          {user ? (

            <>

              {/* USER */}

              <Link
                to="/my-writings"
                className="shobdo-navbar-user"
                onClick={closeMenus}
              >

                <span className="shobdo-navbar-avatar">

                  {userInitial}

                </span>


                <span className="shobdo-navbar-user-name">

                  {
                    user?.name ||
                    "Writer"
                  }

                </span>

              </Link>


              {/* LOGOUT */}

              <button
                type="button"
                className="shobdo-navbar-logout"
                onClick={
                  handleLogout
                }
              >

                <LogOut size={15} />

                <span>

                  {t(
                    "navbar.logout"
                  )}

                </span>

              </button>

            </>

          ) : (

            <Link
              to="/login"
              className="shobdo-navbar-login"
              onClick={closeMenus}
            >

              {t("navbar.login")}

            </Link>

          )}


          {/* =============================================
              MOBILE MENU BUTTON
          ============================================== */}

          <button
            type="button"
            className="shobdo-mobile-menu-button"
            onClick={() =>
              setMobileOpen(
                (current) =>
                  !current
              )
            }
            aria-expanded={
              mobileOpen
            }
            aria-label={
              mobileOpen
                ? t(
                  "navbar.closeMenu"
                )
                : t(
                  "navbar.openMenu"
                )
            }
          >

            {
              mobileOpen
                ? (
                  <X size={21} />
                )
                : (
                  <Menu size={21} />
                )
            }

          </button>

        </div>

      </div>


      {/* ===============================================
          MOBILE NAVIGATION
      ================================================ */}

      {mobileOpen && (

        <div className="shobdo-mobile-nav">


          {/* HOME */}

          <NavLink
            to="/"
            end
            onClick={closeMenus}
          >

            {t("navbar.home")}

          </NavLink>


          {/* EXPLORE */}

          <NavLink
            to="/explore"
            onClick={closeMenus}
          >

            {t(
              "navbar.explore"
            )}

          </NavLink>


          {/* ABOUT */}

          <NavLink
            to="/about"
            onClick={closeMenus}
          >

            {t(
              "navbar.about"
            )}

          </NavLink>


          {/* MY WRITINGS */}

          {user && (

            <NavLink
              to="/my-writings"
              onClick={closeMenus}
            >

              <BookOpen size={16} />

              {t(
                "navbar.myWritings"
              )}

            </NavLink>

          )}


          {/* WRITE */}

          {user && (

            <NavLink
              to="/write"
              onClick={closeMenus}
            >

              <PenLine size={16} />

              {t(
                "navbar.write"
              )}

            </NavLink>

          )}


          {/* =============================================
              MOBILE LANGUAGE
          ============================================== */}

          <div className="shobdo-mobile-language">

            <span>

              <Globe2 size={15} />

              {t(
                "navbar.websiteLanguage"
              )}

            </span>


            <div>

              {languages.map(
                (item) => (

                  <button
                    key={
                      item.code
                    }
                    type="button"
                    className={
                      language ===
                        item.code
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleLanguageChange(
                        item.code
                      )
                    }
                  >

                    {
                      language ===
                        item.code && (
                        <Check
                          size={12}
                        />
                      )
                    }

                    {
                      item.nativeName
                    }

                  </button>

                )
              )}

            </div>

          </div>


          {/* =============================================
              MOBILE AUTH
          ============================================== */}

          {user ? (

            <>

              <div className="shobdo-mobile-user">

                <span className="shobdo-navbar-avatar">

                  {userInitial}

                </span>


                <div>

                  <small>

                    {t(
                      "navbar.signedInAs"
                    )}

                  </small>

                  <strong>

                    {
                      user?.name ||
                      "Writer"
                    }

                  </strong>

                </div>

              </div>


              <button
                type="button"
                className="shobdo-mobile-logout"
                onClick={
                  handleLogout
                }
              >

                <LogOut size={16} />

                {t(
                  "navbar.logout"
                )}

              </button>

            </>

          ) : (

            <Link
              to="/login"
              className="shobdo-mobile-login"
              onClick={closeMenus}
            >

              {t(
                "navbar.login"
              )}

            </Link>

          )}

        </div>

      )}

    </header>
  );

}


export default Navbar;