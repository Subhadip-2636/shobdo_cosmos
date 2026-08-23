import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Write from "./pages/Write";
import WritingDetails from "./pages/WritingDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";


function App() {
  // =====================================================
  // AUTH STATE
  // =====================================================

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const isLoggedIn = !!token;


  // =====================================================
  // WRITINGS STATE
  // =====================================================

  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // BACKEND URL
  // =====================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000";


  // =====================================================
  // FETCH WRITINGS FROM BACKEND
  // =====================================================

  const fetchWritings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/writings`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch writings: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Writings from backend:", data);

      /*
        This handles several possible backend responses:

        1.
        [
          {...},
          {...}
        ]

        2.
        {
          writings: [...]
        }

        3.
        {
          data: [...]
        }
      */

      if (Array.isArray(data)) {
        setWritings(data);
      } else if (Array.isArray(data.writings)) {
        setWritings(data.writings);
      } else if (Array.isArray(data.data)) {
        setWritings(data.data);
      } else {
        console.warn(
          "Unexpected writings response:",
          data
        );

        setWritings([]);
      }
    } catch (err) {
      console.error(
        "Error fetching writings:",
        err
      );

      setError(
        "লেখাগুলো লোড করা যায়নি।"
      );

      setWritings([]);
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FETCH ON APP LOAD
  // =====================================================

  useEffect(() => {
    fetchWritings();
  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (newToken) => {
    localStorage.setItem(
      "token",
      newToken
    );

    setToken(newToken);
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setToken(null);
  };


  // =====================================================
  // NEW WRITING PUBLISHED
  // =====================================================

  const handleWritingPublished = (
    newWriting
  ) => {
    /*
      Immediately add the new writing to the UI.

      Then you can optionally fetch again from
      PostgreSQL to keep everything synchronized.
    */

    if (newWriting) {
      setWritings((previousWritings) => [
        newWriting,
        ...previousWritings,
      ]);
    }

    fetchWritings();
  };


  // =====================================================
  // APP UI
  // =====================================================

  return (
    <BrowserRouter>

      <div className="app">

        {/* ================= NAVBAR ================= */}

        <Navbar
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />


        {/* ================= ROUTES ================= */}

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={
              <Home
                writings={writings}
                loading={loading}
                error={error}
              />
            }
          />


          {/* EXPLORE */}

          <Route
            path="/explore"
            element={
              <Explore
                writings={writings}
                loading={loading}
                error={error}
              />
            }
          />


          {/* WRITE */}

          <Route
            path="/write"
            element={
              isLoggedIn ? (
                <Write
                  token={token}
                  apiUrl={API_URL}
                  onPublished={
                    handleWritingPublished
                  }
                />
              ) : (
                <Navigate
                  to="/login"
                  replace
                />
              )
            }
          />
          
          {/* WRITING DETAILS */}

          <Route
            path="/writings/:id"
            element={
              <WritingDetails
                apiUrl={API_URL}
              />
            }
          />


          {/* LOGIN */}

          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate
                  to="/"
                  replace
                />
              ) : (
                <Login
                  onLogin={handleLogin}
                  apiUrl={API_URL}
                />
              )
            }
          />

          {/* REGISTER */}

          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate
                  to="/"
                  replace
                />
              ) : (
                <Register
                  apiUrl={API_URL}
                />
              )
            }
          />


          {/* 404 / UNKNOWN ROUTES */}

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


        {/* ================= FOOTER ================= */}

        <Footer />

      </div>

    </BrowserRouter>
  );
}

export default App;