import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Write from "./pages/Write";
import WritingDetails from "./pages/WritingDetails";
import MyWritings from "./pages/MyWritings";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import {
  getWritings,
} from "./api/api";

import {
  getCurrentUser,
} from "./api/auth";


// =========================================================
// PRIVATE ROUTE
// =========================================================

function PrivateRoute({
  user,
  authLoading,
  children,
}) {

  if (authLoading) {

    return (
      <div className="app-route-loading">

        Loading...

      </div>
    );

  }


  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;
}


// =========================================================
// APP
// =========================================================

function App() {

  // =====================================================
  // AUTH STATE
  // =====================================================

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);


  // =====================================================
  // WRITINGS STATE
  // =====================================================

  const [
    writings,
    setWritings,
  ] = useState([]);

  const [
    writingsLoading,
    setWritingsLoading,
  ] = useState(true);


  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  const loadCurrentUser =
    useCallback(
      async () => {

        try {

          const currentUser =
            await getCurrentUser();


          setUser(
            currentUser
          );


          return currentUser;


        } catch (error) {

          console.error(
            "CURRENT USER ERROR:",
            error
          );


          setUser(null);

          return null;


        } finally {

          setAuthLoading(
            false
          );

        }

      },
      []
    );


  // =====================================================
  // LOAD PUBLIC WRITINGS
  // =====================================================

  const loadWritings =
    useCallback(
      async () => {

        setWritingsLoading(
          true
        );


        try {

          const data =
            await getWritings({
              page: 1,
              limit: 12,
            });


          setWritings(
            Array.isArray(
              data?.writings
            )
              ? data.writings
              : []
          );


        } catch (error) {

          console.error(
            "LOAD WRITINGS ERROR:",
            error
          );


          setWritings([]);


        } finally {

          setWritingsLoading(
            false
          );

        }

      },
      []
    );


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadCurrentUser();

    loadWritings();

  }, [
    loadCurrentUser,
    loadWritings,
  ]);


  // =====================================================
  // AUTH CALLBACK
  // =====================================================

  async function handleAuthSuccess() {

    return loadCurrentUser();

  }


  // =====================================================
  // WRITING CREATED / UPDATED
  // =====================================================

  async function handleWritingChanged() {

    await loadWritings();

  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <BrowserRouter>

      <div className="app-shell">


        {/* =============================================
            NAVBAR
        ============================================== */}

        <Navbar
          user={user}
          setUser={setUser}
        />


        {/* =============================================
            PAGE CONTENT
        ============================================== */}

        <div className="app-content">

          <Routes>


            {/* =========================================
                PUBLIC
            ========================================== */}

            <Route
              path="/"
              element={
                <Home
                  writings={
                    writings
                  }

                  loading={
                    writingsLoading
                  }
                />
              }
            />


            <Route
              path="/explore"
              element={
                <Explore />
              }
            />


            <Route
              path="/writings/:id"
              element={
                <WritingDetails />
              }
            />


            {/* =========================================
                AUTH
            ========================================== */}

            <Route
              path="/login"
              element={
                user
                  ? (
                    <Navigate
                      to="/"
                      replace
                    />
                  )
                  : (
                    <Login
                      onLogin={
                        handleAuthSuccess
                      }
                    />
                  )
              }
            />


            <Route
              path="/register"
              element={
                user
                  ? (
                    <Navigate
                      to="/"
                      replace
                    />
                  )
                  : (
                    <Register
                      onRegister={
                        handleAuthSuccess
                      }
                    />
                  )
              }
            />


            <Route
              path="/forgot-password"
              element={
                <ForgotPassword />
              }
            />


            <Route
              path="/reset-password/:token"
              element={
                <ResetPassword />
              }
            />


            {/* =========================================
                PROTECTED
            ========================================== */}

            <Route
              path="/write"
              element={
                <PrivateRoute
                  user={user}
                  authLoading={
                    authLoading
                  }
                >

                  <Write
                    user={user}

                    onWritingCreated={
                      handleWritingChanged
                    }
                  />

                </PrivateRoute>
              }
            />


            <Route
              path="/write/:id"
              element={
                <PrivateRoute
                  user={user}
                  authLoading={
                    authLoading
                  }
                >

                  <Write
                    user={user}

                    onWritingCreated={
                      handleWritingChanged
                    }
                  />

                </PrivateRoute>
              }
            />


            <Route
              path="/my-writings"
              element={
                <PrivateRoute
                  user={user}
                  authLoading={
                    authLoading
                  }
                >

                  <MyWritings />

                </PrivateRoute>
              }
            />


            {/* =========================================
                INFORMATION / LEGAL
            ========================================== */}

            <Route
              path="/about"
              element={
                <About />
              }
            />


            <Route
              path="/privacy"
              element={
                <Privacy />
              }
            />


            <Route
              path="/terms"
              element={
                <Terms />
              }
            />


            {/* =========================================
                404
            ========================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </div>


        {/* =============================================
            FOOTER — ONLY ONCE
        ============================================== */}

        <Footer />

      </div>

    </BrowserRouter>
  );

}


export default App;