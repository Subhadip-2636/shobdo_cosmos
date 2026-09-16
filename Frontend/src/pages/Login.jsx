import {
  useEffect,
  useRef,
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
  GOOGLE_CLIENT_ID,
  isGoogleAuthConfigured,
  loginUser,
  loginWithGoogle,
} from "../api/auth";

import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// GOOGLE IDENTITY SERVICES
// =========================================================

const GOOGLE_SCRIPT_ID =
  "shobdo-google-identity-services";

const GOOGLE_SCRIPT_URL =
  "https://accounts.google.com/gsi/client";


// =========================================================
// GOOGLE SCRIPT LOADER
// =========================================================

function loadGoogleIdentityServices() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      // ---------------------------------------------------
      // ALREADY AVAILABLE
      // ---------------------------------------------------

      if (
        window.google?.accounts?.id
      ) {

        resolve(
          window.google
        );

        return;

      }


      // ---------------------------------------------------
      // SCRIPT ALREADY EXISTS
      // ---------------------------------------------------

      const existingScript =
        document.getElementById(
          GOOGLE_SCRIPT_ID
        );


      if (existingScript) {

        const handleLoad =
          () => {

            cleanup();


            if (
              window.google?.accounts?.id
            ) {

              resolve(
                window.google
              );

            } else {

              reject(
                new Error(
                  "Google Identity Services failed to initialize."
                )
              );

            }

          };


        const handleError =
          () => {

            cleanup();

            reject(
              new Error(
                "Unable to load Google Identity Services."
              )
            );

          };


        const cleanup =
          () => {

            existingScript.removeEventListener(
              "load",
              handleLoad
            );

            existingScript.removeEventListener(
              "error",
              handleError
            );

          };


        existingScript.addEventListener(
          "load",
          handleLoad
        );

        existingScript.addEventListener(
          "error",
          handleError
        );


        return;

      }


      // ---------------------------------------------------
      // CREATE SCRIPT
      // ---------------------------------------------------

      const script =
        document.createElement(
          "script"
        );


      script.id =
        GOOGLE_SCRIPT_ID;


      script.src =
        GOOGLE_SCRIPT_URL;


      script.async =
        true;


      script.defer =
        true;


      script.onload =
        () => {

          if (
            window.google?.accounts?.id
          ) {

            resolve(
              window.google
            );

          } else {

            reject(
              new Error(
                "Google Identity Services failed to initialize."
              )
            );

          }

        };


      script.onerror =
        () => {

          reject(
            new Error(
              "Unable to load Google Identity Services."
            )
          );

        };


      document.head.appendChild(
        script
      );

    }
  );

}


// =========================================================
// LOGIN PAGE
// =========================================================

function Login({
  onLogin,
}) {

  const navigate =
    useNavigate();


  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  // =======================================================
  // REFERENCES
  // =======================================================

  const googleButtonRef =
    useRef(null);


  const googleInitializedRef =
    useRef(false);


  const googleCallbackRef =
    useRef(null);


  // =======================================================
  // FORM STATE
  // =======================================================

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


  // =======================================================
  // PASSWORD LOGIN STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =======================================================
  // GOOGLE STATE
  // =======================================================

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);


  const [
    googleReady,
    setGoogleReady,
  ] = useState(false);


  const [
    googleLoadError,
    setGoogleLoadError,
  ] = useState("");


  // =======================================================
  // COMMON ERROR
  // =======================================================

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // BUSY STATE
  // =======================================================

  const busy =
    loading ||
    googleLoading;


  // =======================================================
  // LOCAL FALLBACK TEXT
  // =======================================================
  //
  // Your existing translations continue to work normally.
  //
  // These fallbacks make the new Google UI multilingual
  // immediately, even before the new translation keys are
  // added to translations.js.
  //
  // =======================================================

  const GOOGLE_TEXT = {

    bn: {

      or:
        "অথবা",

      loadingGoogle:
        "Google দিয়ে লগইন হচ্ছে...",

      googleUnavailable:
        "Google লগইন এই মুহূর্তে উপলব্ধ নয়।",

      googleConfigurationMissing:
        "Google লগইন এখনও কনফিগার করা হয়নি।",

      googleGenericError:
        "Google দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",

      accountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে SHOBDO পাসওয়ার্ড দিয়ে লগইন করুন।",

      googleAccountConflict:
        "এই SHOBDO অ্যাকাউন্টটি অন্য একটি Google অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      networkError:
        "SHOBDO সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।",

      quote:
        "তোমার শব্দ এমন একটি স্থান পাওয়ার যোগ্য, যেখানে তা শোনা যায়।",

      googleSectionLabel:
        "Google দিয়ে লগইন",

    },


    en: {

      or:
        "or",

      loadingGoogle:
        "Signing in with Google...",

      googleUnavailable:
        "Google Sign-In is currently unavailable.",

      googleConfigurationMissing:
        "Google Sign-In has not been configured yet.",

      googleGenericError:
        "Unable to sign in with Google. Please try again.",

      accountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in with your SHOBDO password first.",

      googleAccountConflict:
        "This SHOBDO account is already connected to another Google account.",

      networkError:
        "Unable to connect to SHOBDO. Please try again.",

      quote:
        "Your words deserve a place where they can be heard.",

      googleSectionLabel:
        "Sign in with Google",

    },


    hi: {

      or:
        "या",

      loadingGoogle:
        "Google से लॉग इन हो रहा है...",

      googleUnavailable:
        "Google लॉगिन अभी उपलब्ध नहीं है।",

      googleConfigurationMissing:
        "Google लॉगिन अभी कॉन्फ़िगर नहीं किया गया है।",

      googleGenericError:
        "Google से लॉग इन नहीं हो सका। कृपया फिर से प्रयास करें।",

      accountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने SHOBDO पासवर्ड से लॉग इन करें।",

      googleAccountConflict:
        "यह SHOBDO खाता पहले से किसी अन्य Google खाते से जुड़ा है।",

      networkError:
        "SHOBDO सर्वर से कनेक्ट नहीं हो सका। कृपया फिर से प्रयास करें।",

      quote:
        "आपके शब्दों को ऐसी जगह मिलनी चाहिए जहाँ उन्हें सुना जा सके।",

      googleSectionLabel:
        "Google से लॉग इन करें",

    },

  };


  const localGoogleText =
    GOOGLE_TEXT[
      uiLanguage
    ] ||
    GOOGLE_TEXT.en;


  // =======================================================
  // SAFE TRANSLATION
  // =======================================================
  //
  // If a translation key exists, use it.
  //
  // If translations.js does not contain it yet,
  // use our multilingual fallback instead.
  //
  // =======================================================

  function translate(
    key,
    fallback
  ) {

    try {

      const translated =
        t(
          key
        );


      if (
        translated &&
        translated !== key
      ) {

        return translated;

      }

    } catch {

      // Use fallback.

    }


    return fallback;

  }


  // =======================================================
  // GOOGLE LOCALE
  // =======================================================

  const googleLocale =
    uiLanguage === "bn"
      ? "bn"
      : uiLanguage === "hi"
        ? "hi"
        : "en";


  // =======================================================
  // COMPLETE LOGIN
  // =======================================================

  async function completeLogin() {

    if (onLogin) {

      await onLogin();

    }


    navigate(
      "/",
      {
        replace: true,
      }
    );

  }


  // =======================================================
  // PASSWORD LOGIN
  // =======================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (busy) {

      return;

    }


    setError("");

    setGoogleLoadError("");


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


    setLoading(
      true
    );


    try {

      await loginUser({
        email:
          normalizedEmail,

        password,
      });


      await completeLogin();


    } catch (err) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setLoading(
        false
      );

    }

  }


  // =======================================================
  // GOOGLE CREDENTIAL CALLBACK
  // =======================================================

  googleCallbackRef.current =
    async (
      credentialResponse
    ) => {

      if (
        !credentialResponse?.credential
      ) {

        setError(
          translate(
            "login.googleGenericError",
            localGoogleText.googleGenericError
          )
        );

        return;

      }


      setError("");

      setGoogleLoadError("");

      setGoogleLoading(
        true
      );


      try {

        await loginWithGoogle({
          credential:
            credentialResponse.credential,
        });


        await completeLogin();


      } catch (err) {

        console.error(
          "GOOGLE LOGIN ERROR:",
          err
        );


        // ===============================================
        // EXISTING ACCOUNT REQUIRES MANUAL LINK
        // ===============================================

        if (
          err?.code ===
          "account_link_required"
        ) {

          setError(
            translate(
              "login.googleAccountLinkRequired",
              localGoogleText.accountLinkRequired
            )
          );

          return;

        }


        // ===============================================
        // GOOGLE ACCOUNT CONFLICT
        // ===============================================

        if (
          err?.code ===
          "google_account_conflict"
        ) {

          setError(
            translate(
              "login.googleAccountConflict",
              localGoogleText.googleAccountConflict
            )
          );

          return;

        }


        // ===============================================
        // NETWORK FAILURE
        // ===============================================

        if (
          err?.code ===
          "network_error"
        ) {

          setError(
            translate(
              "login.networkError",
              localGoogleText.networkError
            )
          );

          return;

        }


        // ===============================================
        // BACKEND MESSAGE
        // ===============================================

        setError(
          err?.message ||
          translate(
            "login.googleGenericError",
            localGoogleText.googleGenericError
          )
        );


      } finally {

        setGoogleLoading(
          false
        );

      }

    };


  // =======================================================
  // GOOGLE IDENTITY SERVICES INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupGoogleLogin() {

        // ===============================================
        // CLIENT ID CHECK
        // ===============================================

        if (
          !isGoogleAuthConfigured() ||
          !GOOGLE_CLIENT_ID
        ) {

          setGoogleReady(
            false
          );


          setGoogleLoadError(
            translate(
              "login.googleConfigurationMissing",
              localGoogleText.googleConfigurationMissing
            )
          );


          return;

        }


        try {

          setGoogleLoadError("");


          // =============================================
          // LOAD GOOGLE SCRIPT
          // =============================================

          await loadGoogleIdentityServices();


          if (cancelled) {

            return;

          }


          if (
            !window.google?.accounts?.id
          ) {

            throw new Error(
              "Google Identity Services API is unavailable."
            );

          }


          // =============================================
          // INITIALIZE ONCE
          // =============================================

          if (
            !googleInitializedRef.current
          ) {

            window.google.accounts.id.initialize({

              client_id:
                GOOGLE_CLIENT_ID,


              callback:
                (
                  response
                ) => {

                  googleCallbackRef.current?.(
                    response
                  );

                },


              auto_select:
                false,


              ux_mode:
                "popup",

            });


            googleInitializedRef.current =
              true;

          }


          // =============================================
          // GOOGLE BUTTON CONTAINER
          // =============================================

          const container =
            googleButtonRef.current;


          if (!container) {

            return;

          }


          // Remove previous language/version of button.

          container.innerHTML =
            "";


          // =============================================
          // RESPONSIVE WIDTH
          // =============================================

          const measuredWidth =
            container.clientWidth ||
            360;


          const buttonWidth =
            Math.max(
              240,
              Math.min(
                measuredWidth,
                400
              )
            );


          // =============================================
          // RENDER OFFICIAL GOOGLE BUTTON
          // =============================================

          window.google.accounts.id.renderButton(
            container,
            {

              type:
                "standard",

              theme:
                "outline",

              size:
                "large",

              text:
                "continue_with",

              shape:
                "rectangular",

              logo_alignment:
                "left",

              width:
                String(
                  buttonWidth
                ),

              locale:
                googleLocale,

              click_listener:
                () => {

                  setError("");

                  setGoogleLoadError("");

                },

            }
          );


          if (!cancelled) {

            setGoogleReady(
              true
            );

          }


        } catch (err) {

          console.error(
            "GOOGLE GIS LOAD ERROR:",
            err
          );


          if (!cancelled) {

            setGoogleReady(
              false
            );


            setGoogleLoadError(
              translate(
                "login.googleUnavailable",
                localGoogleText.googleUnavailable
              )
            );

          }

        }

      }


      setupGoogleLogin();


      return () => {

        cancelled =
          true;

      };

    },

    // Re-render Google's button when the selected
    // SHOBDO interface language changes.
    [
      googleLocale,
    ]
  );


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main
      className="shobdo-auth-page"
    >

      <div
        className="shobdo-auth-layout"
      >


        {/* =============================================
            LEFT INTRO
        ============================================== */}

        <section
          className="shobdo-auth-intro"
        >

          <div
            className="shobdo-auth-eyebrow"
          >

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


          <div
            className="shobdo-auth-quote"
          >

            <span>
              SHOBDO
            </span>

            <blockquote>

              “{
                translate(
                  "login.quote",
                  localGoogleText.quote
                )
              }”

            </blockquote>

          </div>

        </section>


        {/* =============================================
            LOGIN CARD
        ============================================== */}

        <section
          className="shobdo-auth-card"
        >

          <div
            className="shobdo-auth-card-icon"
          >

            <LockKeyhole
              size={22}
            />

          </div>


          <div
            className="shobdo-auth-card-heading"
          >

            <span>
              SHOBDO
            </span>

            <h2>

              {t(
                "login.loginButton"
              )}

            </h2>

          </div>


          {/* ===========================================
              ERROR
          ============================================ */}

          {error && (

            <div
              className="shobdo-auth-error"
              role="alert"
            >

              {error}

            </div>

          )}


          {/* ===========================================
              GOOGLE SIGN-IN
          ============================================ */}

          <div
            className="shobdo-google-login-section"
            aria-label={
              localGoogleText.googleSectionLabel
            }
            style={{
              width:
                "100%",

              marginBottom:
                "18px",
            }}
          >

            {/* GOOGLE LOGIN IN PROGRESS */}

            {googleLoading && (

              <button
                type="button"
                className="shobdo-auth-submit"
                disabled
                style={{
                  width:
                    "100%",
                }}
              >

                <Loader2
                  size={18}
                  className="spin"
                />

                {translate(
                  "login.googleLoading",
                  localGoogleText.loadingGoogle
                )}

              </button>

            )}


            {/* OFFICIAL GOOGLE BUTTON */}

            {!googleLoading && (

              <div
                ref={
                  googleButtonRef
                }
                style={{
                  width:
                    "100%",

                  minHeight:
                    "44px",

                  display:
                    "flex",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  opacity:
                    busy
                      ? 0.65
                      : 1,

                  pointerEvents:
                    busy
                      ? "none"
                      : "auto",
                }}
              />

            )}


            {/* GOOGLE SCRIPT / CONFIG ERROR */}

            {
              googleLoadError &&
              !googleReady &&
              !googleLoading &&
              (
                <div
                  role="status"
                  style={{
                    marginTop:
                      "10px",

                    textAlign:
                      "center",

                    fontSize:
                      "0.82rem",

                    lineHeight:
                      1.5,

                    opacity:
                      0.75,
                  }}
                >

                  {googleLoadError}

                </div>
              )
            }

          </div>


          {/* ===========================================
              OR DIVIDER
          ============================================ */}

          <div
            className="shobdo-auth-divider"
          >

            <span />

            <small>

              {translate(
                "login.or",
                localGoogleText.or
              )}

            </small>

            <span />

          </div>


          {/* ===========================================
              EMAIL/PASSWORD FORM
          ============================================ */}

          <form
            className="shobdo-auth-form"
            onSubmit={
              handleSubmit
            }
          >


            {/* =========================================
                EMAIL
            ========================================== */}

            <div
              className="shobdo-auth-field"
            >

              <label
                htmlFor="login-email"
              >

                {t(
                  "login.email"
                )}

              </label>


              <div
                className="shobdo-auth-input"
              >

                <Mail
                  size={17}
                />


                <input
                  id="login-email"

                  type="email"

                  value={
                    email
                  }

                  onChange={
                    (
                      event
                    ) =>
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
                    busy
                  }

                  required
                />

              </div>

            </div>


            {/* =========================================
                PASSWORD
            ========================================== */}

            <div
              className="shobdo-auth-field"
            >

              <div
                className="shobdo-auth-label-row"
              >

                <label
                  htmlFor="login-password"
                >

                  {t(
                    "login.password"
                  )}

                </label>


                <Link
                  to="/forgot-password"
                  tabIndex={
                    busy
                      ? -1
                      : 0
                  }
                >

                  {t(
                    "login.forgotPassword"
                  )}

                </Link>

              </div>


              <div
                className="shobdo-auth-input"
              >

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

                  onChange={
                    (
                      event
                    ) =>
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
                    busy
                  }

                  required
                />


                <button
                  type="button"

                  className="shobdo-password-toggle"

                  onClick={
                    () =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                  }

                  disabled={
                    busy
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


            {/* =========================================
                PASSWORD LOGIN BUTTON
            ========================================== */}

            <button
              type="submit"

              className="shobdo-auth-submit"

              disabled={
                busy
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


          {/* ===========================================
              BOTTOM ACCOUNT LINK
          ============================================ */}

          <div
            className="shobdo-auth-divider"
          >

            <span />

            <small>
              SHOBDO
            </small>

            <span />

          </div>


          <div
            className="shobdo-auth-bottom"
          >

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