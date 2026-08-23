import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Feather,
  Search,
  Menu,
  X,
} from "lucide-react";

import { logoutUser } from "../api/auth";
import { useState } from "react";


function Navbar({ user, setUser }) {

  const location = useLocation();

  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] =
    useState(false);


  function isActive(path) {

    return location.pathname === path;

  }


  async function handleLogout() {

    try {

      await logoutUser();

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    } finally {

      setUser(null);

      setMobileMenu(false);

      navigate("/");

    }

  }


  return (

    <header className="site-header">

      <nav className="navbar">


        {/* BRAND */}

        <Link
          to="/"
          className="brand"
          onClick={() =>
            setMobileMenu(false)
          }
        >

          <div className="brand-symbol">

            <Feather size={22} />

          </div>


          <div>

            <div className="brand-name">
              SHOBDO
            </div>

            <div className="brand-bengali">
              শব্দ
            </div>

          </div>

        </Link>


        {/* NAVIGATION */}

        <nav
          className={`nav-links ${
            mobileMenu ? "open" : ""
          }`}
        >

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Home
          </Link>


          <Link
            to="/explore"
            className={
              isActive("/explore")
                ? "active"
                : ""
            }
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Explore
          </Link>


          <Link
            to="/write"
            className={
              isActive("/write")
                ? "active"
                : ""
            }
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Write
          </Link>

        </nav>


        {/* ACTIONS */}

        <div className="nav-actions">


          <Link
            to="/explore"
            className="icon-button"
            aria-label="Search"
          >

            <Search size={19} />

          </Link>


          {user ? (

            <button
              className="login-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          ) : (

            <Link
              to="/login"
              className="login-button"
            >
              Login
            </Link>

          )}


          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
            aria-label="Toggle navigation"
          >

            {mobileMenu
              ? <X />
              : <Menu />
            }

          </button>

        </div>

      </nav>

    </header>

  );

}


export default Navbar;