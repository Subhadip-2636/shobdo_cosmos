import {
  useState,
} from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../api/auth";

import {
  useLanguage,
} from "../Language/LanguageContext";


function Login({
  onLogin,
}) {

  const navigate =
    useNavigate();

  const {
    t,
  } = useLanguage();


  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError("");


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !normalizedEmail ||
      !password
    ) {

      setError(
        t(
          "errors.generic"
        )
      );

      return;
    }


    setLoading(true);


    try {

      await loginUser({
        email:
          normalizedEmail,

        password,
      });


      if (onLogin) {

        await onLogin();

      }


      navigate(
        "/",
        {
          replace: true,
        }
      );


    } catch (err) {

      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setLoading(false);

    }

  }


  return (
    <main className="shobdo-auth-page">

      <div className="shobdo-auth-layout">


        {/* =============================================
            LEFT INTRO
        ============================================== */}

        <section className="shobdo-auth-intro">

          <div className="shobdo-auth-eyebrow">

            <ShieldCheck
              size={15}
            />

            <span>

              {t(
                "login.eyebrow"
              )}

            </span>

          </div>


          <h1>

            {t(
              "login.title"
            )}

          </h1>


          <p>

            {t(
              "login.description"
            )}

          </p>


          <div className="shobdo-auth-quote">

            <span>
              SHOBDO
            </span>

            <blockquote>

              “Your words deserve a place
              where they can be heard.”

            </blockquote>

          </div>

        </section>


        {/* =============================================
            LOGIN CARD
        ============================================== */}

        <section className="shobdo-auth-card">

          <div className="shobdo-auth-card-icon">

            <LockKeyhole
              size={22}
            />

          </div>


          <div className="shobdo-auth-card-heading">

            <span>
              SHOBDO
            </span>

            <h2>

              {t(
                "login.loginButton"
              )}

            </h2>

          </div>


          {error && (

            <div
              className="shobdo-auth-error"
              role="alert"
            >

              {error}

            </div>

          )}


          <form
            className="shobdo-auth-form"
            onSubmit={
              handleSubmit
            }
          >


            {/* EMAIL */}

            <div className="shobdo-auth-field">

              <label
                htmlFor="login-email"
              >

                {t(
                  "login.email"
                )}

              </label>


              <div className="shobdo-auth-input">

                <Mail
                  size={17}
                />

                <input
                  id="login-email"
                  type="email"

                  value={
                    email
                  }

                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }

                  placeholder={
                    t(
                      "login.emailPlaceholder"
                    )
                  }

                  autoComplete="email"

                  disabled={
                    loading
                  }

                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="shobdo-auth-field">

              <div className="shobdo-auth-label-row">

                <label
                  htmlFor="login-password"
                >

                  {t(
                    "login.password"
                  )}

                </label>


                <Link
                  to="/forgot-password"
                >

                  {t(
                    "login.forgotPassword"
                  )}

                </Link>

              </div>


              <div className="shobdo-auth-input">

                <LockKeyhole
                  size={17}
                />

                <input
                  id="login-password"

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    password
                  }

                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }

                  placeholder={
                    t(
                      "login.passwordPlaceholder"
                    )
                  }

                  autoComplete="current-password"

                  disabled={
                    loading
                  }

                  required
                />


                <button
                  type="button"

                  className="shobdo-password-toggle"

                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }

                  aria-label={
                    showPassword
                      ? t(
                        "login.hidePassword"
                      )
                      : t(
                        "login.showPassword"
                      )
                  }
                >

                  {
                    showPassword
                      ? (
                        <EyeOff
                          size={17}
                        />
                      )
                      : (
                        <Eye
                          size={17}
                        />
                      )
                  }

                </button>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="shobdo-auth-submit"
              disabled={
                loading
              }
            >

              {
                loading
                  ? (
                    <Loader2
                      size={18}
                      className="spin"
                    />
                  )
                  : (
                    <ArrowRight
                      size={18}
                    />
                  )
              }

              {
                loading
                  ? t(
                    "login.loggingIn"
                  )
                  : t(
                    "login.loginButton"
                  )
              }

            </button>

          </form>


          <div className="shobdo-auth-divider">

            <span />

            <small>
              SHOBDO
            </small>

            <span />

          </div>


          <div className="shobdo-auth-bottom">

            <span>

              {t(
                "login.noAccount"
              )}

            </span>

            <Link
              to="/register"
            >

              {t(
                "login.createAccount"
              )}

            </Link>

          </div>

        </section>

      </div>

    </main>
  );

}


export default Login;