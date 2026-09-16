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
  FACEBOOK_APP_ID,
  GOOGLE_CLIENT_ID,
  isFacebookAuthConfigured,
  isGoogleAuthConfigured,
  loginWithFacebook,
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
// FACEBOOK JAVASCRIPT SDK
// =========================================================

const FACEBOOK_SCRIPT_ID =
  "shobdo-facebook-javascript-sdk";

const FACEBOOK_SCRIPT_URL =
  "https://connect.facebook.net/en_US/sdk.js";


const FACEBOOK_GRAPH_API_VERSION =
  String(
    import.meta.env
      .VITE_FACEBOOK_GRAPH_API_VERSION ||
    "v26.0"
  ).trim();


// =========================================================
// FACEBOOK SDK PROMISE
// =========================================================

let facebookSdkPromise =
  null;


// =========================================================
// GOOGLE SCRIPT LOADER
// =========================================================

function loadGoogleIdentityServices() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (
        window.google?.accounts?.id
      ) {

        resolve(
          window.google
        );

        return;

      }


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

            existingScript
              .removeEventListener(
                "load",
                handleLoad
              );


            existingScript
              .removeEventListener(
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
// FACEBOOK SDK LOADER
// =========================================================

function loadFacebookSdk() {

  if (
    typeof window ===
    "undefined"
  ) {

    return Promise.reject(
      new Error(
        "Facebook SDK requires a browser."
      )
    );

  }


  if (
    window.FB?.init &&
    window.FB?.login
  ) {

    return Promise.resolve(
      window.FB
    );

  }


  if (facebookSdkPromise) {

    return facebookSdkPromise;

  }


  facebookSdkPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {

        let finished =
          false;


        let timeoutId =
          null;


        const previousAsyncInit =
          window.fbAsyncInit;


        function cleanup() {

          if (timeoutId) {

            window.clearTimeout(
              timeoutId
            );

          }

        }


        function finish() {

          if (finished) {

            return;

          }


          if (
            !window.FB?.init ||
            !window.FB?.login
          ) {

            return;

          }


          finished =
            true;


          cleanup();


          resolve(
            window.FB
          );

        }


        function fail(
          error
        ) {

          if (finished) {

            return;

          }


          finished =
            true;


          cleanup();


          reject(
            error instanceof Error
              ? error
              : new Error(
                  "Unable to load Facebook SDK."
                )
          );

        }


        window.fbAsyncInit =
          () => {

            try {

              if (
                typeof previousAsyncInit ===
                "function"
              ) {

                previousAsyncInit();

              }

            } catch {

              // Ignore errors from previous callbacks.

            }


            finish();

          };


        const existingScript =
          document.getElementById(
            FACEBOOK_SCRIPT_ID
          );


        if (existingScript) {

          existingScript.addEventListener(
            "load",
            finish,
            {
              once:
                true,
            }
          );


          existingScript.addEventListener(
            "error",
            () => {

              fail(
                new Error(
                  "Unable to load Facebook SDK."
                )
              );

            },
            {
              once:
                true,
            }
          );


          timeoutId =
            window.setTimeout(
              () => {

                if (
                  window.FB?.init &&
                  window.FB?.login
                ) {

                  finish();

                } else {

                  fail(
                    new Error(
                      "Facebook SDK initialization timed out."
                    )
                  );

                }

              },
              10000
            );


          return;

        }


        const script =
          document.createElement(
            "script"
          );


        script.id =
          FACEBOOK_SCRIPT_ID;


        script.src =
          FACEBOOK_SCRIPT_URL;


        script.async =
          true;


        script.defer =
          true;


        script.crossOrigin =
          "anonymous";


        script.onload =
          () => {

            window.setTimeout(
              finish,
              0
            );

          };


        script.onerror =
          () => {

            fail(
              new Error(
                "Unable to load Facebook SDK."
              )
            );

          };


        document.body.appendChild(
          script
        );


        timeoutId =
          window.setTimeout(
            () => {

              if (
                window.FB?.init &&
                window.FB?.login
              ) {

                finish();

              } else {

                fail(
                  new Error(
                    "Facebook SDK initialization timed out."
                  )
                );

              }

            },
            10000
          );

      }
    )
      .catch(
        (
          error
        ) => {

          facebookSdkPromise =
            null;


          throw error;

        }
      );


  return facebookSdkPromise;

}


// =========================================================
// FACEBOOK INITIALIZER
// =========================================================

function initializeFacebookSdk() {

  if (
    !window.FB?.init
  ) {

    throw new Error(
      "Facebook SDK API is unavailable."
    );

  }


  const initializationKey =
    `${FACEBOOK_APP_ID}:${FACEBOOK_GRAPH_API_VERSION}`;


  if (
    window.__shobdoFacebookInitializationKey ===
    initializationKey
  ) {

    return;

  }


  window.FB.init({

    appId:
      FACEBOOK_APP_ID,


    cookie:
      true,


    xfbml:
      false,


    version:
      FACEBOOK_GRAPH_API_VERSION,

  });


  window.__shobdoFacebookInitializationKey =
    initializationKey;

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
  // FACEBOOK STATE
  // =======================================================

  const [
    facebookLoading,
    setFacebookLoading,
  ] = useState(false);


  const [
    facebookReady,
    setFacebookReady,
  ] = useState(false);


  const [
    facebookLoadError,
    setFacebookLoadError,
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
  // BUSY STATE
  // =======================================================

  const busy =
    loading ||
    googleLoading ||
    facebookLoading;


  // =======================================================
  // MULTILINGUAL FALLBACK TEXT
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

      googleAccountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে আপনার বিদ্যমান SHOBDO অ্যাকাউন্টে লগইন করুন।",

      googleSectionLabel:
        "Google দিয়ে চালিয়ে যান",


      continueWithFacebook:
        "Facebook দিয়ে চালিয়ে যান",

      facebookLoading:
        "Facebook দিয়ে অ্যাকাউন্ট তৈরি হচ্ছে...",

      facebookUnavailable:
        "Facebook নিবন্ধন এই মুহূর্তে উপলব্ধ নয়।",

      facebookConfigurationMissing:
        "Facebook নিবন্ধন এখনও কনফিগার করা হয়নি।",

      facebookGenericError:
        "Facebook দিয়ে চালিয়ে যাওয়া যায়নি। আবার চেষ্টা করুন।",

      facebookCancelled:
        "Facebook লগইন বাতিল করা হয়েছে।",

      facebookAccountConflict:
        "এই Facebook অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি SHOBDO অ্যাকাউন্টের সঙ্গে যুক্ত।",

      facebookAccountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে আপনার বিদ্যমান SHOBDO অ্যাকাউন্টে লগইন করুন, তারপর Facebook সংযুক্ত করুন।",

      facebookEmailRequired:
        "Facebook আপনার ইমেইল ঠিকানা দেয়নি। ইমেইল অনুমতি দিন অথবা অন্য নিবন্ধন পদ্ধতি ব্যবহার করুন।",

      facebookSectionLabel:
        "Facebook দিয়ে চালিয়ে যান",


      networkError:
        "SHOBDO সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।",


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

      hidePassword:
        "পাসওয়ার্ড লুকান",

      showPassword:
        "পাসওয়ার্ড দেখুন",

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

      googleAccountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in to your existing SHOBDO account first.",

      googleSectionLabel:
        "Continue with Google",


      continueWithFacebook:
        "Continue with Facebook",

      facebookLoading:
        "Creating your account with Facebook...",

      facebookUnavailable:
        "Facebook registration is currently unavailable.",

      facebookConfigurationMissing:
        "Facebook registration has not been configured yet.",

      facebookGenericError:
        "Unable to continue with Facebook. Please try again.",

      facebookCancelled:
        "Facebook sign-in was cancelled.",

      facebookAccountConflict:
        "This Facebook account is already connected to another SHOBDO account.",

      facebookAccountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in to your existing SHOBDO account first, then connect Facebook.",

      facebookEmailRequired:
        "Facebook did not provide your email address. Allow email access or use another registration method.",

      facebookSectionLabel:
        "Continue with Facebook",


      networkError:
        "Unable to connect to SHOBDO. Please try again.",


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

      hidePassword:
        "Hide password",

      showPassword:
        "Show password",

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

      googleAccountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने मौजूदा SHOBDO खाते में लॉग इन करें।",

      googleSectionLabel:
        "Google से जारी रखें",


      continueWithFacebook:
        "Facebook से जारी रखें",

      facebookLoading:
        "Facebook से खाता बनाया जा रहा है...",

      facebookUnavailable:
        "Facebook पंजीकरण अभी उपलब्ध नहीं है।",

      facebookConfigurationMissing:
        "Facebook पंजीकरण अभी कॉन्फ़िगर नहीं किया गया है।",

      facebookGenericError:
        "Facebook से आगे नहीं बढ़ सके। कृपया फिर से प्रयास करें।",

      facebookCancelled:
        "Facebook लॉगिन रद्द कर दिया गया।",

      facebookAccountConflict:
        "यह Facebook खाता पहले से किसी अन्य SHOBDO खाते से जुड़ा है।",

      facebookAccountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने मौजूदा SHOBDO खाते में लॉग इन करें और फिर Facebook कनेक्ट करें।",

      facebookEmailRequired:
        "Facebook ने आपका ईमेल पता उपलब्ध नहीं कराया। ईमेल अनुमति दें या कोई अन्य पंजीकरण तरीका उपयोग करें।",

      facebookSectionLabel:
        "Facebook से जारी रखें",


      networkError:
        "SHOBDO सर्वर से कनेक्ट नहीं हो सका। कृपया फिर से प्रयास करें।",


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

      hidePassword:
        "पासवर्ड छिपाएँ",

      showPassword:
        "पासवर्ड दिखाएँ",

    },

  };


  const localText =
    REGISTER_TEXT[
      uiLanguage
    ] ||
    REGISTER_TEXT.en;


  // =======================================================
  // SAFE TRANSLATION
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

      // Fallback below.

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
  // PASSWORD RULES
  // =======================================================

  const passwordRules =
    useMemo(
      () => ({

        length:
          password.length >=
          8,


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
    )
      .filter(
        Boolean
      )
      .length;


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
  // FINISH AUTHENTICATION
  // =======================================================

  async function finishAuthentication() {

    if (onRegister) {

      await onRegister();

    }


    navigate(
      "/",
      {
        replace:
          true,
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

    setFacebookLoadError("");


    const cleanName =
      name.trim();


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!cleanName) {

      setError(
        t(
          "register.namePlaceholder"
        )
      );

      return;

    }


    if (!normalizedEmail) {

      setError(
        t(
          "register.emailPlaceholder"
        )
      );

      return;

    }


    if (
      password.length <
      8
    ) {

      setError(
        t(
          "register.passwordPlaceholder"
        )
      );

      return;

    }


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


    setLoading(
      true
    );


    try {

      const result =
        await registerUser({

          name:
            cleanName,


          email:
            normalizedEmail,


          password,


          confirmPassword,

        });


      setSuccess(
        result?.message ||
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
  // GOOGLE CALLBACK
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


        await finishAuthentication();


      } catch (err) {

        console.error(
          "GOOGLE REGISTER ERROR:",
          err
        );


        if (
          err?.code ===
          "account_link_required"
        ) {

          setError(
            translate(
              "register.googleAccountLinkRequired",
              localText.googleAccountLinkRequired
            )
          );

          return;

        }


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
  // FACEBOOK AUTHENTICATION
  // =======================================================

  async function finishFacebookAuthentication(
    accessToken
  ) {

    try {

      const result =
        await loginWithFacebook({

          accessToken,

        });


      setSuccess(
        result?.message ||
        t(
          "register.success"
        )
      );


      await finishAuthentication();


    } catch (err) {

      console.error(
        "FACEBOOK REGISTER ERROR:",
        err
      );


      if (
        err?.code ===
        "account_link_required"
      ) {

        setError(
          translate(
            "register.facebookAccountLinkRequired",
            localText.facebookAccountLinkRequired
          )
        );

        return;

      }


      if (
        err?.code ===
        "facebook_account_conflict"
      ) {

        setError(
          translate(
            "register.facebookAccountConflict",
            localText.facebookAccountConflict
          )
        );

        return;

      }


      if (
        err?.code ===
        "facebook_email_required"
      ) {

        setError(
          translate(
            "register.facebookEmailRequired",
            localText.facebookEmailRequired
          )
        );

        return;

      }


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


      setError(
        err?.message ||
        translate(
          "register.facebookGenericError",
          localText.facebookGenericError
        )
      );

    }

  }


  // =======================================================
  // FACEBOOK BUTTON
  // =======================================================

  function handleFacebookRegistration() {

    if (
      busy ||
      !facebookReady
    ) {

      return;

    }


    setError("");

    setSuccess("");

    setFacebookLoadError("");


    if (
      !window.FB?.login
    ) {

      setError(
        translate(
          "register.facebookUnavailable",
          localText.facebookUnavailable
        )
      );

      return;

    }


    setFacebookLoading(
      true
    );


    try {

      window.FB.login(
        (
          response
        ) => {

          const accessToken =
            response
              ?.authResponse
              ?.accessToken;


          if (!accessToken) {

            setFacebookLoading(
              false
            );


            setError(
              translate(
                "register.facebookCancelled",
                localText.facebookCancelled
              )
            );


            return;

          }


          Promise.resolve(
            finishFacebookAuthentication(
              accessToken
            )
          )
            .finally(
              () => {

                setFacebookLoading(
                  false
                );

              }
            );

        },
        {
          scope:
            "public_profile,email",

          return_scopes:
            true,
        }
      );


    } catch (err) {

      console.error(
        "FACEBOOK SDK REGISTER ERROR:",
        err
      );


      setFacebookLoading(
        false
      );


      setError(
        translate(
          "register.facebookGenericError",
          localText.facebookGenericError
        )
      );

    }

  }


  // =======================================================
  // GOOGLE INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupGoogleRegistration() {

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


          const container =
            googleButtonRef.current;


          if (!container) {

            return;

          }


          container.innerHTML =
            "";


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
  // FACEBOOK INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupFacebookRegistration() {

        if (
          !isFacebookAuthConfigured() ||
          !FACEBOOK_APP_ID
        ) {

          setFacebookReady(
            false
          );


          setFacebookLoadError(
            translate(
              "register.facebookConfigurationMissing",
              localText.facebookConfigurationMissing
            )
          );


          return;

        }


        try {

          setFacebookLoadError("");


          await loadFacebookSdk();


          if (cancelled) {

            return;

          }


          if (
            !window.FB?.init ||
            !window.FB?.login
          ) {

            throw new Error(
              "Facebook SDK API is unavailable."
            );

          }


          initializeFacebookSdk();


          if (!cancelled) {

            setFacebookReady(
              true
            );

          }


        } catch (err) {

          console.error(
            "FACEBOOK SDK LOAD ERROR:",
            err
          );


          if (!cancelled) {

            setFacebookReady(
              false
            );


            setFacebookLoadError(
              translate(
                "register.facebookUnavailable",
                localText.facebookUnavailable
              )
            );

          }

        }

      }


      setupFacebookRegistration();


      return () => {

        cancelled =
          true;

      };

    },
    []
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
                "12px",
            }}
          >

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


            {
              googleLoadError &&
              !googleReady &&
              !googleLoading &&
              (
                <div
                  role="status"
                  style={{
                    marginTop:
                      "9px",

                    textAlign:
                      "center",

                    fontSize:
                      "0.78rem",

                    lineHeight:
                      1.5,

                    opacity:
                      0.72,
                  }}
                >

                  {googleLoadError}

                </div>
              )
            }

          </div>


          {/* ===========================================
              FACEBOOK
          ============================================ */}

          <div
            className="shobdo-facebook-register-section"
            aria-label={
              localText.facebookSectionLabel
            }
            style={{
              width:
                "100%",

              marginBottom:
                "18px",
            }}
          >

            <button
              type="button"

              onClick={
                handleFacebookRegistration
              }

              disabled={
                busy ||
                !facebookReady
              }

              aria-label={
                localText.continueWithFacebook
              }

              style={{
                width:
                  "100%",

                minHeight:
                  "44px",

                border:
                  "1px solid #1877f2",

                borderRadius:
                  "6px",

                background:
                  facebookReady
                    ? "#1877f2"
                    : "#9cbde8",

                color:
                  "#ffffff",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  "11px",

                padding:
                  "0 16px",

                fontSize:
                  "14px",

                fontWeight:
                  600,

                cursor:
                  busy ||
                  !facebookReady
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  busy &&
                  !facebookLoading
                    ? 0.65
                    : 1,

                transition:
                  "opacity 0.2s ease, transform 0.2s ease",
              }}
            >

              {
                facebookLoading
                  ? (
                      <Loader2
                        size={19}
                        className="spin"
                      />
                    )
                  : (
                      <span
                        aria-hidden="true"
                        style={{
                          width:
                            "22px",

                          height:
                            "22px",

                          borderRadius:
                            "50%",

                          background:
                            "#ffffff",

                          color:
                            "#1877f2",

                          display:
                            "inline-flex",

                          alignItems:
                            "flex-end",

                          justifyContent:
                            "center",

                          fontFamily:
                            "Arial, Helvetica, sans-serif",

                          fontSize:
                            "20px",

                          lineHeight:
                            1,

                          fontWeight:
                            700,

                          overflow:
                            "hidden",

                          paddingTop:
                            "4px",
                        }}
                      >
                        f
                      </span>
                    )
              }


              <span>

                {
                  facebookLoading
                    ? translate(
                        "register.facebookLoading",
                        localText.facebookLoading
                      )
                    : translate(
                        "register.continueWithFacebook",
                        localText.continueWithFacebook
                      )
                }

              </span>

            </button>


            {
              facebookLoadError &&
              !facebookReady &&
              !facebookLoading &&
              (
                <div
                  role="status"
                  style={{
                    marginTop:
                      "9px",

                    textAlign:
                      "center",

                    fontSize:
                      "0.78rem",

                    lineHeight:
                      1.5,

                    opacity:
                      0.72,
                  }}
                >

                  {facebookLoadError}

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
                          localText.hidePassword
                        )
                      : translate(
                          "register.showPassword",
                          localText.showPassword
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
                          localText.hidePassword
                        )
                      : translate(
                          "register.showPassword",
                          localText.showPassword
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