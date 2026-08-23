import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Feather,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";


function Login({ onLogin, apiUrl }) {
  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // CHECK IF ALREADY LOGGED IN
  // =========================================================

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (token) {

      navigate("/", {
        replace: true,
      });

    }

  }, [navigate]);


  // =========================================================
  // EMAIL CHANGE
  // =========================================================

  function handleEmailChange(event) {

    setEmail(
      event.target.value
    );

    setError("");

    setSuccess("");
  }


  // =========================================================
  // PASSWORD CHANGE
  // =========================================================

  function handlePasswordChange(event) {

    setPassword(
      event.target.value
    );

    setError("");

    setSuccess("");
  }


  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    setSuccess("");


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!email.trim()) {

      setError(
        "Email address is required."
      );

      return;
    }


    if (!password) {

      setError(
        "Password is required."
      );

      return;
    }


    // -------------------------------------------------------
    // START LOADING
    // -------------------------------------------------------

    setLoading(true);


    try {

      // -----------------------------------------------------
      // LOGIN API
      // -----------------------------------------------------

      const response = await fetch(
        `${apiUrl}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),

            password: password,
          }),
        }
      );


      // -----------------------------------------------------
      // RESPONSE DATA
      // -----------------------------------------------------

      const data =
        await response.json();


      // -----------------------------------------------------
      // LOGIN FAILED
      // -----------------------------------------------------

      if (!response.ok) {

        setError(
          data.message ||
          "Login failed. Please check your email and password."
        );

        return;
      }


      // -----------------------------------------------------
      // TOKEN CHECK
      // -----------------------------------------------------

      if (!data.access_token) {

        setError(
          "Login succeeded but no authentication token was received."
        );

        return;
      }


      // -----------------------------------------------------
      // SAVE TOKEN THROUGH APP.JSX
      // -----------------------------------------------------

      onLogin(
        data.access_token
      );


      // -----------------------------------------------------
      // OPTIONAL USER INFORMATION
      // -----------------------------------------------------

      if (data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSuccess(
        "Login সফল হয়েছে। আপনাকে হোম পেজে নিয়ে যাওয়া হচ্ছে..."
      );


      // -----------------------------------------------------
      // REDIRECT
      // -----------------------------------------------------

      navigate("/", {
        replace: true,
      });


    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );


      setError(
        "Backend-এর সাথে সংযোগ করা যায়নি। Flask server চলছে কিনা পরীক্ষা করুন।"
      );


    } finally {

      setLoading(false);

    }

  }


  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  function handleForgotPassword() {

    setError("");

    setSuccess(
      "Password reset functionality শীঘ্রই যোগ করা হবে।"
    );

  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <main className="auth-page">


      {/* ===================================================
         BACK TO HOME
         =================================================== */}

      <Link
        to="/"
        className="auth-back"
      >

        <ArrowLeft size={16} />

        হোমে ফিরে যান

      </Link>


      {/* ===================================================
         LOGIN CARD
         =================================================== */}

      <div className="auth-card">


        {/* =================================================
           BRAND
           ================================================= */}

        <Link
          to="/"
          className="auth-logo"
          aria-label="SHOBDO Home"
        >

          <div
            className="
              brand-symbol
              large-symbol
            "
          >

            <Feather size={27} />

          </div>


          <div className="auth-logo-text">

            <div className="brand-name">
              SHOBDO
            </div>


            <div className="brand-bengali">
              তোমার শব্দ, তোমার গল্প।
            </div>

          </div>

        </Link>


        {/* =================================================
           HEADER
           ================================================= */}

        <div className="auth-header">

          <span className="section-kicker">
            WELCOME BACK
          </span>


          <h1>
            আবার ফিরে আসুন
          </h1>


          <p>
            আপনার শব্দের জগতে আবার প্রবেশ করুন।
          </p>

        </div>


        {/* =================================================
           LOGIN FORM
           ================================================= */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >


          {/* ===============================================
             EMAIL
             =============================================== */}

          <div className="form-group">

            <label htmlFor="login-email">
              Email address
            </label>


            <div className="input-wrapper">

              <Mail
                size={18}
                className="input-icon"
              />


              <input
                id="login-email"

                className="auth-input"

                type="email"

                value={email}

                onChange={
                  handleEmailChange
                }

                placeholder="
                  your@email.com
                "

                autoComplete="email"

                disabled={loading}

                required
              />

            </div>

          </div>


          {/* ===============================================
             PASSWORD
             =============================================== */}

          <div className="form-group">

            <div className="password-label-row">

              <label htmlFor="login-password">
                Password
              </label>


              <button
                type="button"

                className="
                  forgot-password
                "

                onClick={
                  handleForgotPassword
                }

                disabled={loading}
              >

                Forgot password?

              </button>

            </div>


            <div className="input-wrapper">

              <Lock
                size={18}
                className="input-icon"
              />


              <input
                id="login-password"

                className="
                  auth-input
                  password-input
                "

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                value={password}

                onChange={
                  handlePasswordChange
                }

                placeholder="
                  Enter your password
                "

                autoComplete="
                  current-password
                "

                disabled={loading}

                required
              />


              {/* -----------------------------------------
                 SHOW / HIDE PASSWORD
                 ----------------------------------------- */}

              <button
                type="button"

                className="
                  password-toggle
                "

                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }

                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }

                disabled={loading}
              >

                {
                  showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )
                }

              </button>

            </div>

          </div>


          {/* ===============================================
             ERROR
             =============================================== */}

          {error && (

            <div
              className="auth-error"
              role="alert"
            >

              <AlertCircle
                size={18}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* ===============================================
             SUCCESS
             =============================================== */}

          {success && (

            <div
              className="auth-success"
              role="status"
            >

              <CheckCircle2
                size={18}
              />

              <span>
                {success}
              </span>

            </div>

          )}


          {/* ===============================================
             LOGIN BUTTON
             =============================================== */}

          <button
            type="submit"

            className="
              primary-button
              full
              auth-submit
            "

            disabled={
              loading ||
              !email.trim() ||
              !password
            }
          >

            {
              loading ? (

                <>

                  <span
                    className="
                      button-loader
                    "
                  />

                  Logging in...

                </>

              ) : (

                <>

                  <LogIn
                    size={18}
                  />

                  Login

                </>

              )
            }

          </button>

        </form>


        {/* =================================================
           REGISTER
           ================================================= */}

        <div className="auth-switch">

          <span>
            SHOBDO-তে নতুন?
          </span>


          <Link
            to="/register"
            className="
              auth-switch-link
            "
          >

            Create account

          </Link>

        </div>


        {/* =================================================
           FOOTER NOTE
           ================================================= */}

        <p className="auth-footer-note">

          বাংলা সাহিত্য ও সৃষ্টিশীলতার জন্য
          নির্মিত একটি স্বাধীন প্ল্যাটফর্ম।

        </p>

      </div>

    </main>

  );
}


export default Login;