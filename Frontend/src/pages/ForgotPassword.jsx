import {
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  forgotPassword,
} from "../api/auth";

import {
  useLanguage,
} from "../Language/LanguageContext";


function ForgotPassword() {

  const {
    t,
  } = useLanguage();


  // =====================================================
  // STATE
  // =====================================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {

      setError(
        t(
          "forgotPassword.emailPlaceholder"
        )
      );

      return;

    }


    setLoading(true);


    try {

      const data =
        await forgotPassword({
          email:
            normalizedEmail,
        });


      setSuccess(
        data?.message ||
        t(
          "forgotPassword.success"
        )
      );


    } catch (err) {

      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );


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


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="auth-page">

      <div className="auth-shell">


        {/* ===============================================
            INTRO
        ================================================ */}

        <section className="auth-intro">

          <div className="auth-eyebrow">

            <ShieldCheck
              size={16}
            />

            <span>

              {t(
                "forgotPassword.eyebrow"
              )}

            </span>

          </div>


          <h1>

            {t(
              "forgotPassword.title"
            )}

          </h1>


          <p>

            {t(
              "forgotPassword.description"
            )}

          </p>

        </section>


        {/* ===============================================
            CARD
        ================================================ */}

        <section className="auth-card">


          <div className="auth-card-icon">

            <KeyRound
              size={22}
            />

          </div>


          {/* ERROR */}

          {error && (

            <div
              className="auth-message error"
              role="alert"
            >

              {error}

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div
              className="auth-message success"
              role="status"
            >

              <CheckCircle2
                size={17}
              />

              <span>
                {success}
              </span>

            </div>

          )}


          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={
              handleSubmit
            }
          >


            <div className="auth-field">

              <label
                htmlFor="forgot-email"
              >

                {t(
                  "forgotPassword.email"
                )}

              </label>


              <div className="auth-input-wrap">

                <Mail
                  size={17}
                />


                <input
                  id="forgot-email"

                  type="email"

                  value={email}

                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }

                  placeholder={
                    t(
                      "forgotPassword.emailPlaceholder"
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


            <button
              type="submit"

              className="auth-submit-button"

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
                    <Mail
                      size={18}
                    />
                  )
              }


              {
                loading
                  ? t(
                    "forgotPassword.submitting"
                  )
                  : t(
                    "forgotPassword.submit"
                  )
              }

            </button>

          </form>


          {/* BACK */}

          <div className="auth-bottom">

            <Link
              to="/login"
              className="auth-back-link"
            >

              <ArrowLeft
                size={15}
              />

              {t(
                "forgotPassword.backToLogin"
              )}

            </Link>

          </div>

        </section>

      </div>

    </main>
  );

}


export default ForgotPassword;