import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  resetPassword,
} from "../api/auth";

import {
  useLanguage,
} from "../Language/LanguageContext";


function ResetPassword() {

  const {
    token,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    t,
  } = useLanguage();


  // =====================================================
  // STATE
  // =====================================================

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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
  // PASSWORD RULES
  // =====================================================

  const passwordRules =
    useMemo(
      () => ({

        length:
          password.length >= 8,

        uppercase:
          /[A-Z]/.test(
            password
          ),

        lowercase:
          /[a-z]/.test(
            password
          ),

        number:
          /\d/.test(
            password
          ),

      }),
      [password]
    );


  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const passwordScore =
    Object.values(
      passwordRules
    ).filter(Boolean).length;


  const passwordStrength =
    passwordScore <= 1
      ? "weak"
      : passwordScore <= 3
        ? "medium"
        : "strong";


  const passwordsMatch =
    Boolean(
      confirmPassword
    )
    &&
    password ===
      confirmPassword;


  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!token) {

      setError(
        t(
          "resetPassword.invalidToken"
        )
      );

      return;

    }


    if (
      password.length < 8
    ) {

      setError(
        t(
          "register.passwordPlaceholder"
        )
      );

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        t(
          "register.passwordMismatch"
        )
      );

      return;

    }


    setLoading(true);


    try {

      const data =
        await resetPassword(
          token,
          {
            password,
            confirmPassword,
          }
        );


      setSuccess(
        data?.message ||
        t(
          "resetPassword.success"
        )
      );


      window.setTimeout(
        () => {

          navigate(
            "/login",
            {
              replace: true,
            }
          );

        },
        1000
      );


    } catch (err) {

      console.error(
        "RESET PASSWORD ERROR:",
        err
      );


      setError(
        err.message ||
        t(
          "resetPassword.invalidToken"
        )
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // PASSWORD RULE COMPONENT
  // =====================================================

  function PasswordRule({
    passed,
    children,
  }) {

    return (
      <div
        className={
          passed
            ? "password-rule passed"
            : "password-rule"
        }
      >

        {
          passed
            ? (
              <Check
                size={13}
              />
            )
            : (
              <X
                size={13}
              />
            )
        }

        <span>
          {children}
        </span>

      </div>
    );

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
                "resetPassword.eyebrow"
              )}

            </span>

          </div>


          <h1>

            {t(
              "resetPassword.title"
            )}

          </h1>


          <p>

            {t(
              "resetPassword.description"
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


            {/* ===========================================
                PASSWORD
            ============================================ */}

            <div className="auth-field">

              <label
                htmlFor="reset-password"
              >

                {t(
                  "resetPassword.password"
                )}

              </label>


              <div className="auth-input-wrap">

                <LockKeyhole
                  size={17}
                />


                <input
                  id="reset-password"

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
                      "resetPassword.passwordPlaceholder"
                    )
                  }

                  autoComplete="new-password"

                  disabled={
                    loading
                  }

                  required
                />


                <button
                  type="button"

                  className="auth-password-toggle"

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


            {/* ===========================================
                PASSWORD STRENGTH
            ============================================ */}

            {password && (

              <div className="password-strength-panel">

                <div className="password-strength-header">

                  <span>

                    {t(
                      "register.passwordStrength"
                    )}

                  </span>


                  <strong
                    className={
                      `password-strength-${passwordStrength}`
                    }
                  >

                    {t(
                      `register.${passwordStrength}`
                    )}

                  </strong>

                </div>


                <div className="password-strength-bar">

                  <span
                    className={
                      `score-${passwordScore}`
                    }
                  />

                </div>


                <div className="password-rules">

                  <PasswordRule
                    passed={
                      passwordRules.length
                    }
                  >
                    8+ characters
                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.uppercase
                    }
                  >
                    A–Z
                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.lowercase
                    }
                  >
                    a–z
                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.number
                    }
                  >
                    0–9
                  </PasswordRule>

                </div>

              </div>

            )}


            {/* ===========================================
                CONFIRM PASSWORD
            ============================================ */}

            <div className="auth-field">

              <label
                htmlFor="reset-confirm-password"
              >

                {t(
                  "resetPassword.confirmPassword"
                )}

              </label>


              <div className="auth-input-wrap">

                <LockKeyhole
                  size={17}
                />


                <input
                  id="reset-confirm-password"

                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    confirmPassword
                  }

                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }

                  placeholder={
                    t(
                      "resetPassword.confirmPasswordPlaceholder"
                    )
                  }

                  autoComplete="new-password"

                  disabled={
                    loading
                  }

                  required
                />


                <button
                  type="button"

                  className="auth-password-toggle"

                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }

                  aria-label={
                    showConfirmPassword
                      ? t(
                        "login.hidePassword"
                      )
                      : t(
                        "login.showPassword"
                      )
                  }
                >

                  {
                    showConfirmPassword
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


              {confirmPassword && (

                <div
                  className={
                    passwordsMatch
                      ? "password-match matched"
                      : "password-match mismatch"
                  }
                >

                  {
                    passwordsMatch
                      ? (
                        <Check
                          size={13}
                        />
                      )
                      : (
                        <X
                          size={13}
                        />
                      )
                  }


                  <span>

                    {
                      passwordsMatch
                        ? t(
                          "register.strong"
                        )
                        : t(
                          "register.passwordMismatch"
                        )
                    }

                  </span>

                </div>

              )}

            </div>


            {/* ===========================================
                SUBMIT
            ============================================ */}

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
                    <ArrowRight
                      size={18}
                    />
                  )
              }


              {
                loading
                  ? t(
                    "resetPassword.submitting"
                  )
                  : t(
                    "resetPassword.submit"
                  )
              }

            </button>

          </form>


          {/* =============================================
              BACK TO LOGIN
          ============================================== */}

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


export default ResetPassword;