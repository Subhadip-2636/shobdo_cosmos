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


// =========================================================
// LAYOUTS
// =========================================================

import SocialLayout from "./layouts/SocialLayout";


// =========================================================
// COMPONENTS
// =========================================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import NotificationToast from "./components/NotificationToast";


// =========================================================
// MAIN PAGES
// =========================================================

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Write from "./pages/Write";
import WritingDetails from "./pages/WritingDetails";
import MyWritings from "./pages/MyWritings";
import ConnectionsPage from "./pages/ConnectionsPage";
import SearchPage from "./pages/SearchPage";


// =========================================================
// NEW: HASHTAG / TAG PAGE
// =========================================================

import TagPage from "./pages/TagPage";


// =========================================================
// SAVED WRITINGS
// =========================================================

import Saved from "./pages/Saved";


// =========================================================
// NOTIFICATIONS
// =========================================================

import Notifications from "./pages/Notifications";


// =========================================================
// AUTH PAGES
// =========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


// =========================================================
// INFORMATION / LEGAL
// =========================================================

import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataDeletion from "./pages/DataDeletion";


// =========================================================
// USER PAGES
// =========================================================

import WriterProfile from "./pages/WriterProfile";
import EditProfile from "./pages/EditProfile";


// =========================================================
// API
// =========================================================

import {
  getWritings,
} from "./api/api";

import {
  getCurrentUser,
} from "./api/auth";

import {
  connectSocket,
  disconnectSocket,
} from "./api/socket";


// =========================================================
// PRIVATE ROUTE
// =========================================================

function PrivateRoute({
  user,
  authLoading,
  children,
}) {

  // -------------------------------------------------------
  // WAIT FOR AUTHENTICATION CHECK
  // -------------------------------------------------------

  if (authLoading) {

    return (
      <div className="app-route-loading">
        Loading...
      </div>
    );

  }


  // -------------------------------------------------------
  // NOT LOGGED IN
  // -------------------------------------------------------

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
// PUBLIC-ONLY ROUTE
// =========================================================

function PublicOnlyRoute({
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


  if (user) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  return children;
}


// =========================================================
// STANDALONE PAGE
//
// Used by authentication, About and legal pages.
// Social pages are rendered inside SocialLayout.
// =========================================================

function StandalonePage({
  children,
  showFooter = true,
}) {

  return (
    <>

      <main className="app-standalone-content">
        {children}
      </main>


      {showFooter && (
        <Footer />
      )}

    </>
  );
}


// =========================================================
// APP
// =========================================================

function App() {

  // =======================================================
  // AUTH STATE
  // =======================================================

  const [
    user,
    setUser,
  ] = useState(
    null
  );


  const [
    authLoading,
    setAuthLoading,
  ] = useState(
    true
  );


  // =======================================================
  // WRITINGS STATE
  // =======================================================

  const [
    writings,
    setWritings,
  ] = useState(
    []
  );


  const [
    writingsLoading,
    setWritingsLoading,
  ] = useState(
    true
  );


  // =======================================================
  // REAL-TIME NOTIFICATION STATE
  // =======================================================

  const [
    realtimeNotification,
    setRealtimeNotification,
  ] = useState(
    null
  );


  // =======================================================
  // LOAD CURRENT USER
  // =======================================================

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

        } catch (
          error
        ) {

          console.error(
            "CURRENT USER ERROR:",
            error
          );


          setUser(
            null
          );


          return null;

        } finally {

          setAuthLoading(
            false
          );

        }

      },
      []
    );


  // =======================================================
  // LOAD PUBLIC WRITINGS
  // =======================================================

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


          const items =
            Array.isArray(
              data?.writings
            )
              ? data.writings
              : Array.isArray(
                    data?.items
                  )
                ? data.items
                : [];


          setWritings(
            items
          );

        } catch (
          error
        ) {

          console.error(
            "LOAD WRITINGS ERROR:",
            error
          );


          setWritings(
            []
          );

        } finally {

          setWritingsLoading(
            false
          );

        }

      },
      []
    );


  // =======================================================
  // INITIAL APPLICATION LOAD
  // =======================================================

  useEffect(
    () => {

      loadCurrentUser();

      loadWritings();

    },
    [
      loadCurrentUser,
      loadWritings,
    ]
  );


  // =======================================================
  // SOCKET.IO CONNECTION
  // =======================================================

  useEffect(
    () => {

      // ---------------------------------------------------
      // WAIT UNTIL AUTH CHECK IS FINISHED
      // ---------------------------------------------------

      if (authLoading) {

        return undefined;

      }


      // ---------------------------------------------------
      // LOGGED OUT
      // ---------------------------------------------------

      if (!user) {

        disconnectSocket();


        setRealtimeNotification(
          null
        );


        return undefined;

      }


      // ---------------------------------------------------
      // CONNECT SOCKET
      // ---------------------------------------------------

      const socket =
        connectSocket();


      if (!socket) {

        console.warn(
          "SHOBDO SOCKET: No socket created."
        );

        return undefined;

      }


      // ===================================================
      // CONNECTED
      // ===================================================

      function handleConnect() {

        console.log(
          "SHOBDO SOCKET CONNECTED:",
          socket.id
        );

      }


      // ===================================================
      // SERVER READY
      // ===================================================

      function handleSocketReady(
        data
      ) {

        console.log(
          "SHOBDO SOCKET READY:",
          data
        );

      }


      // ===================================================
      // CONNECTION ERROR
      // ===================================================

      function handleConnectError(
        error
      ) {

        console.error(
          "SHOBDO SOCKET CONNECTION ERROR:",
          error?.message ||
          error
        );

      }


      // ===================================================
      // DISCONNECTED
      // ===================================================

      function handleDisconnect(
        reason
      ) {

        console.log(
          "SHOBDO SOCKET DISCONNECTED:",
          reason
        );

      }


      // ===================================================
      // NEW REAL-TIME NOTIFICATION
      // ===================================================

      function handleNewNotification(
        notification
      ) {

        console.log(
          "SHOBDO NEW NOTIFICATION:",
          notification
        );


        // -------------------------------------------------
        // SHOW TOAST
        // -------------------------------------------------

        setRealtimeNotification(
          notification
        );


        // -------------------------------------------------
        // INFORM NAVBAR / SIDEBAR / NOTIFICATION PAGE
        // -------------------------------------------------

        window.dispatchEvent(

          new CustomEvent(
            "shobdo:notifications-changed",
            {
              detail:
                notification,
            }
          )

        );

      }


      // ===================================================
      // SOCKET TEST RESPONSE
      // ===================================================

      function handleSocketPong(
        data
      ) {

        console.log(
          "SHOBDO SOCKET PONG:",
          data
        );

      }


      // ===================================================
      // REGISTER SOCKET EVENTS
      // ===================================================

      socket.on(
        "connect",
        handleConnect
      );


      socket.on(
        "socket:ready",
        handleSocketReady
      );


      socket.on(
        "connect_error",
        handleConnectError
      );


      socket.on(
        "disconnect",
        handleDisconnect
      );


      socket.on(
        "notification:new",
        handleNewNotification
      );


      socket.on(
        "socket:pong",
        handleSocketPong
      );


      if (
        socket.connected
      ) {

        console.log(
          "SHOBDO SOCKET ALREADY CONNECTED:",
          socket.id
        );

      }


      // ===================================================
      // CLEANUP
      // ===================================================

      return () => {

        socket.off(
          "connect",
          handleConnect
        );


        socket.off(
          "socket:ready",
          handleSocketReady
        );


        socket.off(
          "connect_error",
          handleConnectError
        );


        socket.off(
          "disconnect",
          handleDisconnect
        );


        socket.off(
          "notification:new",
          handleNewNotification
        );


        socket.off(
          "socket:pong",
          handleSocketPong
        );

      };

    },
    [
      user?.id,
      authLoading,
    ]
  );


  // =======================================================
  // AUTO-HIDE REAL-TIME NOTIFICATION
  // =======================================================

  useEffect(
    () => {

      if (
        !realtimeNotification
      ) {

        return undefined;

      }


      const timer =
        window.setTimeout(
          () => {

            setRealtimeNotification(
              null
            );

          },
          5000
        );


      return () => {

        window.clearTimeout(
          timer
        );

      };

    },
    [
      realtimeNotification,
    ]
  );


  // =======================================================
  // AUTH SUCCESS
  // =======================================================

  async function handleAuthSuccess() {

    return loadCurrentUser();

  }


  // =======================================================
  // WRITING CHANGED
  // =======================================================

  async function handleWritingChanged() {

    await loadWritings();

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <BrowserRouter>

      {/* ===================================================
          SCROLL TO TOP
      ==================================================== */}

      <ScrollToTop />


      {/* ===================================================
          GLOBAL REAL-TIME NOTIFICATION TOAST
      ==================================================== */}

      <NotificationToast
        notification={
          realtimeNotification
        }
        onClose={
          () => {

            setRealtimeNotification(
              null
            );

          }
        }
      />


      {/* ===================================================
          APPLICATION
      ==================================================== */}

      <div className="app-shell">

        {/* ===============================================
            GLOBAL NAVBAR
        ================================================ */}

        <Navbar
          user={
            user
          }
          setUser={
            setUser
          }
        />


        {/* ===============================================
            ROUTER
        ================================================ */}

        <Routes>

          {/* =================================================
              SOCIAL APPLICATION
          ================================================== */}

          <Route
            element={
              <SocialLayout
                user={user}
              />
            }
          >

            {/* =============================================
                HOME
            ============================================== */}

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


            {/* =============================================
                EXPLORE
            ============================================== */}

            <Route
              path="/explore"
              element={
                <Explore />
              }
            />


            {/* =============================================
                GLOBAL SEARCH
            ============================================== */}

            <Route
              path="/search"
              element={
                <SearchPage />
              }
            />


            {/* =============================================
                HASHTAG PAGE

                Example:

                /tag/কবিতা
                /tag/Poetry
                /tag/प्रकृति
            ============================================== */}

            <Route
              path="/tag/:tagName"
              element={
                <TagPage />
              }
            />


            {/* =============================================
                WRITING DETAILS
            ============================================== */}

            <Route
              path="/writings/:id"
              element={
                <WritingDetails />
              }
            />


            {/* =============================================
                PUBLIC WRITER PROFILE
            ============================================== */}

            <Route
              path="/users/:id"
              element={
                <WriterProfile />
              }
            />


            {/* =============================================
                FOLLOWERS
            ============================================== */}

            <Route
              path="/users/:id/followers"
              element={
                <ConnectionsPage
                  mode="followers"
                />
              }
            />


            {/* =============================================
                FOLLOWING
            ============================================== */}

            <Route
              path="/users/:id/following"
              element={
                <ConnectionsPage
                  mode="following"
                />
              }
            />


            {/* =============================================
                WRITE
            ============================================== */}

            <Route
              path="/write"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Write
                    user={
                      user
                    }
                    onWritingCreated={
                      handleWritingChanged
                    }
                  />

                </PrivateRoute>

              }
            />


            {/* =============================================
                EDIT WRITING
            ============================================== */}

            <Route
              path="/write/:id"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Write
                    user={
                      user
                    }
                    onWritingCreated={
                      handleWritingChanged
                    }
                  />

                </PrivateRoute>

              }
            />


            {/* =============================================
                MY WRITINGS
            ============================================== */}

            <Route
              path="/my-writings"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <MyWritings />

                </PrivateRoute>

              }
            />


            {/* =============================================
                SAVED WRITINGS
            ============================================== */}

            <Route
              path="/saved"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Saved />

                </PrivateRoute>

              }
            />


            {/* =============================================
                NOTIFICATIONS
            ============================================== */}

            <Route
              path="/notifications"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Notifications />

                </PrivateRoute>

              }
            />


            {/* =============================================
                EDIT PROFILE
            ============================================== */}

            <Route
              path="/profile/edit"
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <EditProfile
                    user={
                      user
                    }
                    onProfileUpdated={
                      loadCurrentUser
                    }
                  />

                </PrivateRoute>

              }
            />

          </Route>


          {/* =================================================
              AUTHENTICATION PAGES
          ================================================== */}

          <Route
            path="/login"
            element={

              <StandalonePage>

                <PublicOnlyRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Login
                    onLogin={
                      handleAuthSuccess
                    }
                  />

                </PublicOnlyRoute>

              </StandalonePage>

            }
          />


          <Route
            path="/register"
            element={

              <StandalonePage>

                <PublicOnlyRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <Register
                    onRegister={
                      handleAuthSuccess
                    }
                  />

                </PublicOnlyRoute>

              </StandalonePage>

            }
          />


          <Route
            path="/forgot-password"
            element={

              <StandalonePage>

                <PublicOnlyRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <ForgotPassword />

                </PublicOnlyRoute>

              </StandalonePage>

            }
          />


          <Route
            path="/reset-password/:token"
            element={

              <StandalonePage>

                <PublicOnlyRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <ResetPassword />

                </PublicOnlyRoute>

              </StandalonePage>

            }
          />


          {/* =================================================
              ABOUT
          ================================================== */}

          <Route
            path="/about"
            element={

              <StandalonePage>

                <About />

              </StandalonePage>

            }
          />


          {/* =================================================
              PRIVACY
          ================================================== */}

          <Route
            path="/privacy"
            element={

              <StandalonePage>

                <Privacy />

              </StandalonePage>

            }
          />


          {/* =================================================
              TERMS
          ================================================== */}

          <Route
            path="/terms"
            element={

              <StandalonePage>

                <Terms />

              </StandalonePage>

            }
          />


          {/* =================================================
              DATA DELETION
          ================================================== */}

          <Route
            path="/data-deletion"
            element={

              <StandalonePage>

                <DataDeletion />

              </StandalonePage>

            }
          />


          {/* =================================================
              404
          ================================================== */}

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

    </BrowserRouter>

  );

}


export default App;