import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";


import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  PageBackgroundProvider,
} from "./context/PageBackgroundContext";


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
import PageBackground from "./components/PageBackground";
import BackgroundPicker from "./components/BackgroundPicker";


// =========================================================
// PUBLIC HOME
// =========================================================

import PublicHome from "./pages/PublicHome";


// =========================================================
// PUBLIC / SOCIAL REELS + VIDEO HUB
// =========================================================

import Reels from "./pages/Reels";
import CreateReel from "./pages/CreateReel";
import Videos from "./pages/Videos";


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
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";


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
// ROUTE LOADING
// =========================================================

function RouteLoading() {

  return (

    <div
      className="app-route-loading"
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>

  );

}


// =========================================================
// PRIVATE ROUTE
// =========================================================

function PrivateRoute({
  user,
  authLoading,
  children,
}) {

  // -------------------------------------------------------
  // WAIT FOR AUTH CHECK
  // -------------------------------------------------------

  if (authLoading) {

    return (
      <RouteLoading />
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


  // -------------------------------------------------------
  // AUTHENTICATED
  // -------------------------------------------------------

  return children;

}


// =========================================================
// PUBLIC-ONLY ROUTE
// =========================================================
//
// Login/register/password pages should not be shown after
// authentication succeeds.
//
// =========================================================

function PublicOnlyRoute({
  user,
  authLoading,
  children,
}) {

  if (authLoading) {

    return (
      <RouteLoading />
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
// =========================================================
//
// Authentication / About / legal pages.
//
// Navbar remains global.
// Footer is rendered here.
//
// Use DIV instead of another MAIN because many page
// components already contain their own <main> element.
//
// =========================================================

function StandalonePage({
  children,
  showFooter = true,
}) {

  return (

    <>

      <div className="app-standalone-content">

        {children}

      </div>


      {
        showFooter && (
          <Footer />
        )
      }

    </>

  );

}


// =========================================================
// HOME ROUTE
// =========================================================
//
// Guest:
//   PublicHome + public footer
//
// Logged in:
//   SocialLayout
//      └── Home through <Outlet />
//
// This prevents the old duplicate SocialLayout problem.
//
// =========================================================

function HomeRoute({
  user,
  authLoading,
}) {

  // -------------------------------------------------------
  // AUTH STATE IS STILL BEING RESOLVED
  // -------------------------------------------------------

  if (authLoading) {

    return (
      <RouteLoading />
    );

  }


  // -------------------------------------------------------
  // LOGGED-IN SOCIAL HOME
  // -------------------------------------------------------

  if (user) {

    return (

      <SocialLayout
        user={user}
      />

    );

  }


  // -------------------------------------------------------
  // PUBLIC WEBSITE HOME
  // -------------------------------------------------------

  return (

    <>

      <PublicHome />

      <Footer />

    </>

  );

}


// =========================================================
// REELS ROUTE
// =========================================================
//
// Guest:
//   Public immersive Reels experience
//
// Logged in:
//   SocialLayout
//      └── Reels through <Outlet />
//
// /reels/create is protected separately.
//
// =========================================================

function ReelsRoute({
  user,
  authLoading,
}) {

  // -------------------------------------------------------
  // AUTH STATE IS STILL BEING RESOLVED
  // -------------------------------------------------------

  if (authLoading) {

    return (
      <RouteLoading />
    );

  }


  // -------------------------------------------------------
  // LOGGED-IN SOCIAL REELS
  // -------------------------------------------------------

  if (user) {

    return (

      <SocialLayout
        user={user}
      />

    );

  }


  // -------------------------------------------------------
  // PUBLIC REELS
  // -------------------------------------------------------

  return (
    <Outlet />
  );

}


// =========================================================
// PUBLIC BROWSING LAYOUT
// =========================================================
//
// These routes are public:
//
//   /explore
//   /search
//   /tag/:tagName
//   /writings/:id
//   /users/:id
//   /users/:id/followers
//   /users/:id/following
//
// Guest:
//   Clean public page + Footer
//
// Logged in:
//   Same page inside SocialLayout
//
// Therefore the URL stays identical while the shell adapts
// automatically to authentication.
//
// =========================================================

function BrowseLayout({
  user,
  authLoading,
}) {

  if (authLoading) {

    return (
      <RouteLoading />
    );

  }


  // -------------------------------------------------------
  // LOGGED-IN SOCIAL EXPERIENCE
  // -------------------------------------------------------

  if (user) {

    return (

      <SocialLayout
        user={user}
      />

    );

  }


  // -------------------------------------------------------
  // PUBLIC WEBSITE EXPERIENCE
  // -------------------------------------------------------

  return (

    <>

      <div className="app-public-browse-content">

        <Outlet />

      </div>


      <Footer />

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
      // WAIT UNTIL AUTH CHECK IS COMPLETE
      // ---------------------------------------------------

      if (
        authLoading
      ) {

        return undefined;

      }


      // ---------------------------------------------------
      // LOGGED OUT
      // ---------------------------------------------------

      if (
        !user
      ) {

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


      if (
        !socket
      ) {

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
        // UPDATE NAVBAR / SIDEBAR / NOTIFICATION PAGE
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
      // REGISTER EVENTS
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
      // CLEANUP SOCKET LISTENERS
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

      <PageBackgroundProvider>

        <PageBackground />

        <BackgroundPicker />


        {/* =================================================
            SCROLL TO TOP
        ================================================== */}

        <ScrollToTop />


        {/* =================================================
            REAL-TIME NOTIFICATION TOAST
        ================================================== */}

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


        {/* =================================================
            APPLICATION
        ================================================== */}

        <div
          className="app-shell"
        >


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


            {/* =============================================
                HOME

                Guest:
                  Public landing website

                Logged in:
                  Social feed
            ============================================== */}

            <Route
              path="/"
              element={
                <HomeRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                />
              }
            >

              <Route
                index
                element={
                  <Home
                    user={
                      user
                    }
                    writings={
                      writings
                    }
                    loading={
                      writingsLoading
                    }
                  />
                }
              />

            </Route>


            {/* =============================================
                REELS

                /reels
                  Public feed

                /reels/:reelId
                  Shareable public Reel

                /reels/create
                  Protected creator studio
            ============================================== */}

            <Route
              path="/reels"
              element={
                <ReelsRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                />
              }
            >

              {/* ===========================================
                  REELS FEED
              ============================================ */}

              <Route
                index
                element={
                  <Reels
                    user={
                      user
                    }
                  />
                }
              />


              {/* ===========================================
                  CREATE REEL

                  Static route is intentionally defined
                  before :reelId.

                  Guest:
                    Redirect to /login

                  Logged in:
                    CreateReel inside SocialLayout
              ============================================ */}

              <Route
                path="create"
                element={
                  <PrivateRoute
                    user={
                      user
                    }
                    authLoading={
                      authLoading
                    }
                  >

                    <CreateReel />

                  </PrivateRoute>
                }
              />


              {/* ===========================================
                  SHARED / SINGLE REEL
              ============================================ */}

              <Route
                path=":reelId"
                element={
                  <Reels
                    user={
                      user
                    }
                  />
                }
              />

            </Route>


            {/* =============================================
                PUBLIC BROWSING ROUTES

                Guest:
                  Clean public website

                Logged in:
                  SocialLayout
            ============================================== */}

            <Route
              element={
                <BrowseLayout
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                />
              }
            >


              {/* =============================================
                VIDEO HUB
                Videos + Reels
              ============================================== */}

              <Route
                path="/videos"
                element={
                  <PrivateRoute
                    user={
                      user
                    }
                    authLoading={
                      authLoading
                    }
                  >
                    <Videos
                      user={
                        user
                      }
                    />
                  </PrivateRoute>
                }
              />

              {/* ===========================================
                  EXPLORE
              ============================================ */}

              <Route
                path="/explore"
                element={
                  <Explore />
                }
              />


              {/* ===========================================
                  GLOBAL SEARCH
              ============================================ */}

              <Route
                path="/search"
                element={
                  <SearchPage />
                }
              />


              {/* ===========================================
                  HASHTAG / TAG
              ============================================ */}

              <Route
                path="/tag/:tagName"
                element={
                  <TagPage />
                }
              />


              {/* ===========================================
                  PUBLIC WRITING DETAILS
              ============================================ */}

              <Route
                path="/writings/:id"
                element={
                  <WritingDetails />
                }
              />


              {/* ===========================================
                  PUBLIC WRITER PROFILE
              ============================================ */}

              <Route
                path="/users/:id"
                element={
                  <WriterProfile />
                }
              />


              {/* ===========================================
                  WRITER PROFILE ALIAS FOR REELS
              ============================================ */}

              <Route
                path="/writer/:id"
                element={
                  <WriterProfile />
                }
              />


              {/* ===========================================
                  FOLLOWERS
              ============================================ */}

              <Route
                path="/users/:id/followers"
                element={
                  <ConnectionsPage
                    mode="followers"
                  />
                }
              />


              {/* ===========================================
                  FOLLOWING
              ============================================ */}

              <Route
                path="/users/:id/following"
                element={
                  <ConnectionsPage
                    mode="following"
                  />
                }
              />


            </Route>


            {/* =============================================
                AUTHENTICATED SOCIAL APPLICATION
            ============================================== */}

            <Route
              element={

                <PrivateRoute
                  user={
                    user
                  }
                  authLoading={
                    authLoading
                  }
                >

                  <SocialLayout
                    user={
                      user
                    }
                  />

                </PrivateRoute>

              }
            >


              {/* ===========================================
                  WRITE
              ============================================ */}

              <Route
                path="/write"
                element={
                  <Write
                    user={
                      user
                    }
                    onWritingCreated={
                      handleWritingChanged
                    }
                  />
                }
              />


              {/* ===========================================
                  EDIT WRITING
              ============================================ */}

              <Route
                path="/write/:id"
                element={
                  <Write
                    user={
                      user
                    }
                    onWritingCreated={
                      handleWritingChanged
                    }
                  />
                }
              />


              {/* ===========================================
                  MY WRITINGS
              ============================================ */}

              <Route
                path="/my-writings"
                element={
                  <MyWritings />
                }
              />


              {/* ===========================================
                  SAVED WRITINGS
              ============================================ */}

              <Route
                path="/saved"
                element={
                  <Saved />
                }
              />


              {/* ===========================================
                  NOTIFICATIONS
              ============================================ */}

              <Route
                path="/notifications"
                element={
                  <Notifications />
                }
              />


              {/* ===========================================
                  EDIT PROFILE
              ============================================ */}

              <Route
                path="/profile/edit"
                element={
                  <EditProfile
                    user={
                      user
                    }
                    onProfileUpdated={
                      loadCurrentUser
                    }
                  />
                }
              />


            </Route>


            {/* =============================================
                LOGIN
            ============================================== */}

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


            {/* =============================================
                REGISTER
            ============================================== */}

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


            {/* =============================================
                FORGOT PASSWORD
            ============================================== */}

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


            {/* =============================================
                RESET PASSWORD
            ============================================== */}

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


            {/* =============================================
                ABOUT
            ============================================== */}

            <Route
              path="/about"
              element={

                <StandalonePage>

                  <About />

                </StandalonePage>

              }
            />


            {/* =============================================
                PRIVACY
            ============================================== */}

            <Route
              path="/privacy"
              element={

                <StandalonePage>

                  <Privacy />

                </StandalonePage>

              }
            />


            {/* =============================================
                TERMS
            ============================================== */}

            <Route
              path="/terms"
              element={

                <StandalonePage>

                  <Terms />

                </StandalonePage>

              }
            />


            {/* =============================================
                DATA DELETION
            ============================================== */}

            <Route
              path="/data-deletion"
              element={

                <StandalonePage>

                  <DataDeletion />

                </StandalonePage>

              }
            />


            {/* =============================================
                404
            ============================================== */}

            <Route
              path="*"
              element={

                <StandalonePage>

                  <NotFound />

                </StandalonePage>

              }
            />


          </Routes>

        </div>

      </PageBackgroundProvider>

    </BrowserRouter>

  );

}


export default App;