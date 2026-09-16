import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  GOOGLE_CLIENT_ID,
  isGoogleAuthConfigured,
  loginWithGoogle,
  registerUser,
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
// LOAD GOOGLE IDENTITY SERVICES SCRIPT
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
      // SCRIPT ALREADY ADDED
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
// REGISTER PAGE
// =========================================================

function Register({
  onRegister,
}) {

  const navigate =
    useNavigate();


  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  // =======================================================
  // GOOGLE REFERENCES
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
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


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


  // =======================================================
  // PASSWORD REGISTRATION STATE
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
  // MESSAGE STATE
  // =======================================================

  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =======================================================
  // BUSY
  // =======================================================

  const busy =
    loading ||
    googleLoading;


  // =======================================================
  // MULTILINGUAL FALLBACKS
  // =======================================================

  const REGISTER_TEXT = {

    bn: {

      or:
        "অথবা",

      note:
        "নিজের ভাষায় লিখুন। নিজের কণ্ঠস্বর নিজেরই রাখুন।",

      googleLoading:
        "Google দিয়ে অ্যাকাউন্ট তৈরি হচ্ছে...",

      googleUnavailable:
        "Google দিয়ে নিবন্ধন এই মুহূর্তে উপলব্ধ নয়।",

      googleConfigurationMissing:
        "Google নিবন্ধন এখনও কনফিগার করা হয়নি।",

      googleGenericError:
        "Google দিয়ে চালিয়ে যাওয়া যায়নি। আবার চেষ্টা করুন।",

      googleAccountConflict:
        "এই SHOBDO অ্যাকাউন্টটি অন্য একটি Google অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      accountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে আপনার SHOBDO পাসওয়ার্ড দিয়ে লগইন করুন।",

      networkError:
        "SHOBDO সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।",

      googleSectionLabel:
        "Google দিয়ে চালিয়ে যান",

      ruleLength:
        "৮+ অক্ষর",

      ruleUppercase:
        "বড় হাতের ইংরেজি অক্ষর",

      ruleLowercase:
        "ছোট হাতের ইংরেজি অক্ষর",

      ruleNumber:
        "সংখ্যা",

      passwordsMatch:
        "পাসওয়ার্ড মিলেছে",

    },


    en: {

      or:
        "or",

      note:
        "Write in your language. Keep your voice yours.",

      googleLoading:
        "Creating your account with Google...",

      googleUnavailable:
        "Google registration is currently unavailable.",

      googleConfigurationMissing:
        "Google registration has not been configured yet.",

      googleGenericError:
        "Unable to continue with Google. Please try again.",

      googleAccountConflict:
        "This SHOBDO account is already connected to another Google account.",

      accountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in with your SHOBDO password first.",

      networkError:
        "Unable to connect to SHOBDO. Please try again.",

      googleSectionLabel:
        "Continue with Google",

      ruleLength:
        "8+ characters",

      ruleUppercase:
        "Uppercase",

      ruleLowercase:
        "Lowercase",

      ruleNumber:
        "Number",

      passwordsMatch:
        "Passwords match",

    },


    hi: {

      or:
        "या",

      note:
        "अपनी भाषा में लिखें। अपनी आवाज़ को अपनी ही रहने दें।",

      googleLoading:
        "Google से खाता बनाया जा रहा है...",

      googleUnavailable:
        "Google पंजीकरण अभी उपलब्ध नहीं है।",

      googleConfigurationMissing:
        "Google पंजीकरण अभी कॉन्फ़िगर नहीं किया गया है।",

      googleGenericError:
        "Google से आगे नहीं बढ़ सके। कृपया फिर से प्रयास करें।",

      googleAccountConflict:
        "यह SHOBDO खाता पहले से किसी अन्य Google खाते से जुड़ा है।",

      accountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने SHOBDO पासवर्ड से लॉग इन करें।",

      networkError:
        "SHOBDO सर्वर से कनेक्ट नहीं हो सका। कृपया फिर से प्रयास करें।",

      googleSectionLabel:
        "Google से जारी रखें",

      ruleLength:
        "8+ अक्षर",

      ruleUppercase:
        "बड़ा अक्षर",

      ruleLowercase:
        "छोटा अक्षर",

      ruleNumber:
        "संख्या",

      passwordsMatch:
        "पासवर्ड मेल खाते हैं",

    },

  };


  const localText =
    REGISTER_TEXT[
      uiLanguage
    ] ||
    REGISTER_TEXT.en;


  // =======================================================
  // SAFE TRANSLATION HELPER
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
  // GOOGLE BUTTON LOCALE
  // =======================================================

  const googleLocale =
    uiLanguage === "bn"
      ? "bn"
      : uiLanguage === "hi"
        ? "hi"
        : "en";


  // =======================================================
  // PASSWORD RULES
  // =======================================================

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
      [
        password,
      ]
    );


  // =======================================================
  // PASSWORD SCORE
  // =======================================================

  const passwordScore =
    Object.values(
      passwordRules
    ).filter(
      Boolean
    ).length;


  // =======================================================
  // PASSWORD STRENGTH
  // =======================================================

  const strength =
    passwordScore <= 1
      ? "weak"
      : passwordScore <= 3
        ? "medium"
        : "strong";


  // =======================================================
  // PASSWORD MATCH
  // =======================================================

  const passwordsMatch =
    Boolean(
      confirmPassword
    ) &&
    password ===
      confirmPassword;


  // =======================================================
  // FINISH AUTHENTICATED FLOW
  // =======================================================
  //
  // Both password registration and Google registration
  // return a SHOBDO JWT, therefore the user is already
  // authenticated after successful registration.
  //
  // =======================================================

  async function finishAuthentication() {

    if (onRegister) {

      await onRegister();

    }


    navigate(
      "/",
      {
        replace: true,
      }
    );

  }


  // =======================================================
  // NORMAL REGISTRATION
  // =======================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (busy) {

      return;

    }


    setError("");

    setSuccess("");

    setGoogleLoadError("");


    const cleanName =
      name.trim();


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    // =====================================================
    // NAME
    // =====================================================

    if (!cleanName) {

      setError(
        t(
          "register.namePlaceholder"
        )
      );

      return;

    }


    // =====================================================
    // EMAIL
    // =====================================================

    if (!normalizedEmail) {

      setError(
        t(
          "register.emailPlaceholder"
        )
      );

      return;

    }


    // =====================================================
    // PASSWORD LENGTH
    // =====================================================

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


    // =====================================================
    // PASSWORD RULES
    // =====================================================

    if (
      !passwordRules.uppercase ||
      !passwordRules.lowercase ||
      !passwordRules.number
    ) {

      setError(
        t(
          "register.passwordPlaceholder"
        )
      );

      return;

    }


    // =====================================================
    // PASSWORD MATCH
    // =====================================================

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


    // =====================================================
    // REGISTER
    // =====================================================

    setLoading(
      true
    );


    try {

      await registerUser({

        name:
          cleanName,


        email:
          normalizedEmail,


        password,


        confirmPassword,

      });


      setSuccess(
        t(
          "register.success"
        )
      );


      await finishAuthentication();


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

      // ---------------------------------------------------
      // GOOGLE DID NOT PROVIDE TOKEN
      // ---------------------------------------------------

      if (
        !credentialResponse?.credential
      ) {

        setError(
          translate(
            "register.googleGenericError",
            localText.googleGenericError
          )
        );

        return;

      }


      setError("");

      setSuccess("");

      setGoogleLoadError("");


      setGoogleLoading(
        true
      );


      try {

        // -------------------------------------------------
        // SEND GOOGLE ID TOKEN TO SHOBDO BACKEND
        // -------------------------------------------------

        const result =
          await loginWithGoogle({

            credential:
              credentialResponse.credential,

          });


        setSuccess(
          result?.message ||
          t(
            "register.success"
          )
        );


        // -------------------------------------------------
        // REFRESH APP AUTH STATE
        // -------------------------------------------------

        await finishAuthentication();


      } catch (err) {

        console.error(
          "GOOGLE REGISTER ERROR:",
          err
        );


        // ===============================================
        // MANUAL ACCOUNT LINK REQUIRED
        // ===============================================

        if (
          err?.code ===
          "account_link_required"
        ) {

          setError(
            translate(
              "register.googleAccountLinkRequired",
              localText.accountLinkRequired
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
              "register.googleAccountConflict",
              localText.googleAccountConflict
            )
          );

          return;

        }


        // ===============================================
        // NETWORK
        // ===============================================

        if (
          err?.code ===
          "network_error"
        ) {

          setError(
            translate(
              "register.networkError",
              localText.networkError
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
            "register.googleGenericError",
            localText.googleGenericError
          )
        );


      } finally {

        setGoogleLoading(
          false
        );

      }

    };


  // =======================================================
  // GOOGLE INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupGoogleRegistration() {

        // ===============================================
        // CONFIGURATION
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
              "register.googleConfigurationMissing",
              localText.googleConfigurationMissing
            )
          );


          return;

        }


        try {

          setGoogleLoadError("");


          // =============================================
          // LOAD GIS
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
          // INITIALIZE
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
          // BUTTON CONTAINER
          // =============================================

          const container =
            googleButtonRef.current;


          if (!container) {

            return;

          }


          // Remove previous button version.

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
          // RENDER GOOGLE BUTTON
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
                buttonWidth,


              locale:
                googleLocale,

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
                "register.googleUnavailable",
                localText.googleUnavailable
              )
            );

          }

        }

      }


      setupGoogleRegistration();


      return () => {

        cancelled =
          true;

      };

    },
    [
      googleLocale,
    ]
  );


  // =======================================================
  // PASSWORD RULE COMPONENT
  // =======================================================

  function PasswordRule({
    passed,
    children,
  }) {

    return (

      <div
        className={
          passed
            ? "register-rule passed"
            : "register-rule"
        }
      >

        {
          passed
            ? (
                <Check
                  size={12}
                />
              )
            : (
                <X
                  size={12}
                />
              )
        }


        <span>
          {children}
        </span>

      </div>

    );

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main
      className="shobdo-register-page"
    >

      <div
        className="shobdo-register-layout"
      >


        {/* =============================================
            LEFT INTRO
        ============================================== */}

        <section
          className="shobdo-register-intro"
        >

          <div
            className="shobdo-register-eyebrow"
          >

            <ShieldCheck
              size={15}
            />


            <span>

              {t(
                "register.eyebrow"
              )}

            </span>

          </div>


          <h1>

            {t(
              "register.title"
            )}

          </h1>


          <p>

            {t(
              "register.description"
            )}

          </p>


          <div
            className="shobdo-register-note"
          >

            <span>
              SHOBDO
            </span>


            <p>

              {translate(
                "register.note",
                localText.note
              )}

            </p>

          </div>

        </section>


        {/* =============================================
            REGISTER CARD
        ============================================== */}

        <section
          className="shobdo-register-card"
        >

          <div
            className="shobdo-register-card-top"
          >

            <div
              className="shobdo-register-icon"
            >

              <User
                size={21}
              />

            </div>


            <div>

              <span>
                SHOBDO
              </span>


              <h2>

                {t(
                  "register.createAccount"
                )}

              </h2>

            </div>

          </div>


          {/* ===========================================
              ERROR
          ============================================ */}

          {error && (

            <div
              className="shobdo-register-message error"
              role="alert"
            >

              {error}

            </div>

          )}


          {/* ===========================================
              SUCCESS
          ============================================ */}

          {success && (

            <div
              className="shobdo-register-message success"
              role="status"
            >

              {success}

            </div>

          )}


          {/* ===========================================
              GOOGLE
          ============================================ */}

          <div
            className="shobdo-google-register-section"
            aria-label={
              localText.googleSectionLabel
            }
            style={{
              width:
                "100%",

              marginBottom:
                "18px",
            }}
          >

            {/* GOOGLE LOADING */}

            {googleLoading && (

              <button
                type="button"
                className="shobdo-register-submit"
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
                  "register.googleLoading",
                  localText.googleLoading
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

                  alignItems:
                    "center",

                  justifyContent:
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


            {/* GOOGLE CONFIG/LOAD ERROR */}

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
            style={{
              marginBottom:
                "20px",
            }}
          >

            <span />


            <small>

              {translate(
                "register.or",
                localText.or
              )}

            </small>


            <span />

          </div>


          {/* ===========================================
              NORMAL REGISTER FORM
          ============================================ */}

          <form
            className="shobdo-register-form"
            onSubmit={
              handleSubmit
            }
          >


            {/* =========================================
                NAME
            ========================================== */}

            <div
              className="shobdo-register-field"
            >

              <label
                htmlFor="register-name"
              >

                {t(
                  "register.name"
                )}

              </label>


              <div
                className="shobdo-register-input"
              >

                <User
                  size={17}
                />


                <input
                  id="register-name"

                  type="text"

                  value={
                    name
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setName(
                        event.target.value
                      )
                  }

                  placeholder={
                    t(
                      "register.namePlaceholder"
                    )
                  }

                  autoComplete="name"

                  disabled={
                    busy
                  }

                  required
                />

              </div>

            </div>


            {/* =========================================
                EMAIL
            ========================================== */}

            <div
              className="shobdo-register-field"
            >

              <label
                htmlFor="register-email"
              >

                {t(
                  "register.email"
                )}

              </label>


              <div
                className="shobdo-register-input"
              >

                <Mail
                  size={17}
                />


                <input
                  id="register-email"

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
                      "register.emailPlaceholder"
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
              className="shobdo-register-field"
            >

              <label
                htmlFor="register-password"
              >

                {t(
                  "register.password"
                )}

              </label>


              <div
                className="shobdo-register-input"
              >

                <LockKeyhole
                  size={17}
                />


                <input
                  id="register-password"

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
                      "register.passwordPlaceholder"
                    )
                  }

                  autoComplete="new-password"

                  disabled={
                    busy
                  }

                  required
                />


                <button
                  type="button"

                  className="shobdo-register-toggle"

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
                      ? translate(
                          "register.hidePassword",
                          "Hide password"
                        )
                      : translate(
                          "register.showPassword",
                          "Show password"
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
                PASSWORD STRENGTH
            ========================================== */}

            {password && (

              <div
                className="shobdo-register-strength"
              >

                <div
                  className="register-strength-header"
                >

                  <span>

                    {t(
                      "register.passwordStrength"
                    )}

                  </span>


                  <strong
                    className={
                      `strength-${strength}`
                    }
                  >

                    {t(
                      `register.${strength}`
                    )}

                  </strong>

                </div>


                <div
                  className="register-strength-bar"
                >

                  <span
                    className={
                      `score-${passwordScore}`
                    }
                  />

                </div>


                <div
                  className="register-rules"
                >

                  <PasswordRule
                    passed={
                      passwordRules.length
                    }
                  >

                    {translate(
                      "register.ruleLength",
                      localText.ruleLength
                    )}

                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.uppercase
                    }
                  >

                    {translate(
                      "register.ruleUppercase",
                      localText.ruleUppercase
                    )}

                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.lowercase
                    }
                  >

                    {translate(
                      "register.ruleLowercase",
                      localText.ruleLowercase
                    )}

                  </PasswordRule>


                  <PasswordRule
                    passed={
                      passwordRules.number
                    }
                  >

                    {translate(
                      "register.ruleNumber",
                      localText.ruleNumber
                    )}

                  </PasswordRule>

                </div>

              </div>

            )}


            {/* =========================================
                CONFIRM PASSWORD
            ========================================== */}

            <div
              className="shobdo-register-field"
            >

              <label
                htmlFor="register-confirm-password"
              >

                {t(
                  "register.confirmPassword"
                )}

              </label>


              <div
                className="shobdo-register-input"
              >

                <LockKeyhole
                  size={17}
                />


                <input
                  id="register-confirm-password"

                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    confirmPassword
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setConfirmPassword(
                        event.target.value
                      )
                  }

                  placeholder={
                    t(
                      "register.confirmPasswordPlaceholder"
                    )
                  }

                  autoComplete="new-password"

                  disabled={
                    busy
                  }

                  required
                />


                <button
                  type="button"

                  className="shobdo-register-toggle"

                  onClick={
                    () =>
                      setShowConfirmPassword(
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
                    showConfirmPassword
                      ? translate(
                          "register.hidePassword",
                          "Hide password"
                        )
                      : translate(
                          "register.showPassword",
                          "Show password"
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


              {/* PASSWORD MATCH */}

              {confirmPassword && (

                <div
                  className={
                    passwordsMatch
                      ? "register-match matched"
                      : "register-match mismatch"
                  }
                >

                  {
                    passwordsMatch
                      ? (
                          <Check
                            size={12}
                          />
                        )
                      : (
                          <X
                            size={12}
                          />
                        )
                  }


                  <span>

                    {
                      passwordsMatch
                        ? translate(
                            "register.passwordsMatch",
                            localText.passwordsMatch
                          )
                        : t(
                            "register.passwordMismatch"
                          )
                    }

                  </span>

                </div>

              )}

            </div>


            {/* =========================================
                REGISTER BUTTON
            ========================================== */}

            <button
              type="submit"

              className="shobdo-register-submit"

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
                      "register.creatingAccount"
                    )
                  : t(
                      "register.createAccount"
                    )
              }

            </button>

          </form>


          {/* ===========================================
              LOGIN LINK
          ============================================ */}

          <div
            className="shobdo-register-bottom"
          >

            <span>

              {t(
                "register.alreadyAccount"
              )}

            </span>


            <Link
              to="/login"
            >

              {t(
                "register.login"
              )}

            </Link>

          </div>

        </section>

      </div>

    </main>

  );

}


export default Register;