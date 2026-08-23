import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Feather,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";


function Register({ apiUrl }) {
  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // NAME CHANGE
  // =========================================================

  function handleNameChange(event) {
    setName(
      event.target.value
    );

    setError("");
    setSuccess("");
  }


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
  // CONFIRM PASSWORD CHANGE
  // =========================================================

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(
      event.target.value
    );

    setError("");
    setSuccess("");
  }


  // =========================================================
  // REGISTER
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!name.trim()) {
      setError(
        "Name is required."
      );

      return;
    }


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


    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    if (!confirmPassword) {
      setError(
        "Please confirm your password."
      );

      return;
    }


    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );

      return;
    }


    // -------------------------------------------------------
    // START LOADING
    // -------------------------------------------------------

    setLoading(true);


    try {
      // -----------------------------------------------------
      // REGISTER API
      // -----------------------------------------------------

      const response = await fetch(
        `${apiUrl}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            email: email
              .trim()
              .toLowerCase(),

            password: password,
          }),
        }
      );


      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      const data =
        await response.json();


      // -----------------------------------------------------
      // FAILED
      // -----------------------------------------------------

      if (!response.ok) {
        setError(
          data.message ||
          "Registration failed."
        );

        return;
      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSuccess(
        "Registration সফল হয়েছে। এখন Login করুন।"
      );


      // -----------------------------------------------------
      // CLEAR FORM
      // -----------------------------------------------------

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");


      // -----------------------------------------------------
      // GO TO LOGIN
      // -----------------------------------------------------

      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }, 900);

    } catch (err) {
      console.error(
        "REGISTER ERROR:",
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
         REGISTER CARD
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
            JOIN SHOBDO
          </span>

          <h1>
            আপনার যাত্রা শুরু করুন
          </h1>

          <p>
            লিখুন, পড়ুন এবং বাংলা সাহিত্যপ্রেমীদের
            সঙ্গে আপনার শব্দ ভাগ করে নিন।
          </p>

        </div>


        {/* =================================================
           REGISTER FORM
           ================================================= */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* ===============================================
             NAME
             =============================================== */}

          <div className="form-group">

            <label htmlFor="register-name">
              Name
            </label>

            <div className="input-wrapper">

              <User
                size={18}
                className="input-icon"
              />

              <input
                id="register-name"
                className="auth-input"
                type="text"
                value={name}
                onChange={
                  handleNameChange
                }
                placeholder="Your name"
                autoComplete="name"
                disabled={loading}
                required
              />

            </div>

          </div>


          {/* ===============================================
             EMAIL
             =============================================== */}

          <div className="form-group">

            <label htmlFor="register-email">
              Email address
            </label>

            <div className="input-wrapper">

              <Mail
                size={18}
                className="input-icon"
              />

              <input
                id="register-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={
                  handleEmailChange
                }
                placeholder="your@email.com"
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

            <label htmlFor="register-password">
              Password
            </label>

            <div className="input-wrapper">

              <Lock
                size={18}
                className="input-icon"
              />

              <input
                id="register-password"
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
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
                required
              />


              <button
                type="button"
                className="password-toggle"
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
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )
                }
              </button>

            </div>

          </div>


          {/* ===============================================
             CONFIRM PASSWORD
             =============================================== */}

          <div className="form-group">

            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <div className="input-wrapper">

              <Lock
                size={18}
                className="input-icon"
              />

              <input
                id="confirm-password"
                className="
                  auth-input
                  password-input
                "
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={
                  handleConfirmPasswordChange
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
                required
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {
                  showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
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
             REGISTER BUTTON
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
              !name.trim() ||
              !email.trim() ||
              !password ||
              !confirmPassword
            }
          >
            {
              loading ? (

                <>
                  <span
                    className="button-loader"
                  />

                  Creating account...
                </>

              ) : (

                <>
                  <UserPlus
                    size={18}
                  />

                  Create account
                </>

              )
            }
          </button>

        </form>


        {/* =================================================
           LOGIN
           ================================================= */}

        <div className="auth-switch">

          <span>
            ইতিমধ্যে SHOBDO-তে আছেন?
          </span>

          <Link
            to="/login"
            className="auth-switch-link"
          >
            Login
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


export default Register;