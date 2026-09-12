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
// COMPONENTS
// =========================================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";


// =========================================================
// MAIN PAGES
// =========================================================

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Write from "./pages/Write";
import WritingDetails from "./pages/WritingDetails";
import MyWritings from "./pages/MyWritings";


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
  // WAIT FOR AUTH CHECK
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


  // -------------------------------------------------------
  // AUTHENTICATED
  // -------------------------------------------------------

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
  // SOCKET.IO CONNECTION
  // =====================================================

  useEffect(() => {

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

      return undefined;

    }


    // ---------------------------------------------------
    // CONNECT
    // ---------------------------------------------------

    const socket =
      connectSocket();


    if (!socket) {

      console.warn(
        "SHOBDO SOCKET: No socket created."
      );

      return undefined;

    }


    // ---------------------------------------------------
    // CONNECTED
    // ---------------------------------------------------

    function handleConnect() {

      console.log(
        "SHOBDO SOCKET CONNECTED:",
        socket.id
      );

    }


    // ---------------------------------------------------
    // PRIVATE ROOM READY
    // ---------------------------------------------------

    function handleSocketReady(
      data
    ) {

      console.log(
        "SHOBDO SOCKET READY:",
        data
      );

    }


    // ---------------------------------------------------
    // CONNECTION ERROR
    // ---------------------------------------------------

    function handleConnectError(
      error
    ) {

      console.error(
        "SHOBDO SOCKET CONNECTION ERROR:",
        error?.message || error
      );

    }


    // ---------------------------------------------------
    // DISCONNECTED
    // ---------------------------------------------------

    function handleDisconnect(
      reason
    ) {

      console.log(
        "SHOBDO SOCKET DISCONNECTED:",
        reason
      );

    }


    // ---------------------------------------------------
    // NEW REAL-TIME NOTIFICATION
    // ---------------------------------------------------
    //
    // Backend will emit:
    //
    // notification:new
    //
    // Navbar already listens for:
    //
    // shobdo:notifications-changed
    //
    // Therefore this event immediately refreshes
    // the unread notification badge.
    //
    // ---------------------------------------------------

    function handleNewNotification(
      notification
    ) {

      console.log(
        "SHOBDO NEW NOTIFICATION:",
        notification
      );


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


    // ---------------------------------------------------
    // TEST PONG
    // ---------------------------------------------------

    function handleSocketPong(
      data
    ) {

      console.log(
        "SHOBDO SOCKET PONG:",
        data
      );

    }


    // ---------------------------------------------------
    // REGISTER LISTENERS
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // HANDLE ALREADY CONNECTED SOCKET
    // ---------------------------------------------------

    if (
      socket.connected
    ) {

      console.log(
        "SHOBDO SOCKET ALREADY CONNECTED:",
        socket.id
      );

    }


    // ---------------------------------------------------
    // CLEANUP LISTENERS
    // ---------------------------------------------------

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

  }, [
    user?.id,
    authLoading,
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

      <ScrollToTop />


      <div className="app-shell">


        {/* =============================================
            NAVBAR
        ============================================== */}

        <Navbar
          user={
            user
          }
          setUser={
            setUser
          }
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


            <Route
              path="/users/:id"
              element={
                <WriterProfile />
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
                PROTECTED — WRITE
            ========================================== */}

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


            {/* =========================================
                PROTECTED — EDIT WRITING
            ========================================== */}

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


            {/* =========================================
                PROTECTED — MY WRITINGS
            ========================================== */}

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


            {/* =========================================
                PROTECTED — NOTIFICATIONS
            ========================================== */}

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


            {/* =========================================
                PROTECTED — EDIT PROFILE
            ========================================== */}

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
            FOOTER
        ============================================== */}

        <Footer />


      </div>

    </BrowserRouter>

  );

}


export default App;