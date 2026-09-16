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
  FACEBOOK_APP_ID,
  GOOGLE_CLIENT_ID,
  isFacebookAuthConfigured,
  isGoogleAuthConfigured,
  loginUser,
  loginWithFacebook,
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
// FACEBOOK JAVASCRIPT SDK
// =========================================================

const FACEBOOK_SCRIPT_ID =
  "shobdo-facebook-javascript-sdk";

const FACEBOOK_SCRIPT_URL =
  "https://connect.facebook.net/en_US/sdk.js";


// ---------------------------------------------------------
// Keep the Graph API version configurable.
//
// Frontend/.env:
//
// VITE_FACEBOOK_GRAPH_API_VERSION=v26.0
//
// ---------------------------------------------------------

const FACEBOOK_GRAPH_API_VERSION =
  String(
    import.meta.env
      .VITE_FACEBOOK_GRAPH_API_VERSION ||
    "v26.0"
  ).trim();


// =========================================================
// FACEBOOK SDK SHARED PROMISE
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
// FACEBOOK SCRIPT LOADER
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


  // -------------------------------------------------------
  // ALREADY AVAILABLE
  // -------------------------------------------------------

  if (
    window.FB?.init &&
    window.FB?.login
  ) {

    return Promise.resolve(
      window.FB
    );

  }


  // -------------------------------------------------------
  // A LOAD IS ALREADY RUNNING
  // -------------------------------------------------------

  if (facebookSdkPromise) {

    return facebookSdkPromise;

  }


  facebookSdkPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {

        let completed =
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

          if (completed) {

            return;

          }


          if (
            !window.FB?.init ||
            !window.FB?.login
          ) {

            return;

          }


          completed =
            true;


          cleanup();


          resolve(
            window.FB
          );

        }


        function fail(
          error
        ) {

          if (completed) {

            return;

          }


          completed =
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


        // -------------------------------------------------
        // META SDK READY CALLBACK
        // -------------------------------------------------

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

              // Ignore errors from another listener.

            }


            finish();

          };


        // -------------------------------------------------
        // EXISTING SCRIPT
        // -------------------------------------------------

        const existingScript =
          document.getElementById(
            FACEBOOK_SCRIPT_ID
          );


        if (existingScript) {

          existingScript
            .addEventListener(
              "load",
              finish,
              {
                once: true,
              }
            );


          existingScript
            .addEventListener(
              "error",
              () => {

                fail(
                  new Error(
                    "Unable to load Facebook SDK."
                  )
                );

              },
              {
                once: true,
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


        // -------------------------------------------------
        // CREATE SCRIPT
        // -------------------------------------------------

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

            // fbAsyncInit normally handles completion.
            //
            // This is a backup for browsers where FB is
            // already available when the load event fires.

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

          // Allow another attempt after a failed load.

          facebookSdkPromise =
            null;


          throw error;

        }
      );


  return facebookSdkPromise;

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


  const facebookInitializedRef =
    useRef(false);


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
  // COMMON ERROR
  // =======================================================

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // BUSY
  // =======================================================

  const busy =
    loading ||
    googleLoading ||
    facebookLoading;


  // =======================================================
  // LOCAL MULTILINGUAL FALLBACKS
  // =======================================================

  const SOCIAL_TEXT = {

    bn: {

      or:
        "অথবা",

      quote:
        "তোমার শব্দ এমন একটি স্থান পাওয়ার যোগ্য, যেখানে তা শোনা যায়।",


      // GOOGLE

      loadingGoogle:
        "Google দিয়ে লগইন হচ্ছে...",

      googleUnavailable:
        "Google লগইন এই মুহূর্তে উপলব্ধ নয়।",

      googleConfigurationMissing:
        "Google লগইন এখনও কনফিগার করা হয়নি।",

      googleGenericError:
        "Google দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",

      googleAccountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে আপনার বিদ্যমান SHOBDO অ্যাকাউন্টে লগইন করুন।",

      googleAccountConflict:
        "এই SHOBDO অ্যাকাউন্টটি অন্য একটি Google অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      googleSectionLabel:
        "Google দিয়ে লগইন",


      // FACEBOOK

      continueWithFacebook:
        "Facebook দিয়ে চালিয়ে যান",

      loadingFacebook:
        "Facebook দিয়ে লগইন হচ্ছে...",

      facebookUnavailable:
        "Facebook লগইন এই মুহূর্তে উপলব্ধ নয়।",

      facebookConfigurationMissing:
        "Facebook লগইন এখনও কনফিগার করা হয়নি।",

      facebookGenericError:
        "Facebook দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",

      facebookCancelled:
        "Facebook লগইন বাতিল করা হয়েছে।",

      facebookAccountLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। প্রথমে আপনার বিদ্যমান SHOBDO অ্যাকাউন্টে লগইন করুন, তারপর Facebook সংযুক্ত করুন।",

      facebookAccountConflict:
        "এই Facebook অ্যাকাউন্টটি ইতিমধ্যে অন্য একটি SHOBDO অ্যাকাউন্টের সঙ্গে যুক্ত।",

      facebookEmailRequired:
        "Facebook আপনার ইমেইল ঠিকানা দেয়নি। ইমেইল অনুমতি দিন অথবা অন্য লগইন পদ্ধতি ব্যবহার করুন।",

      facebookSectionLabel:
        "Facebook দিয়ে লগইন",


      // NETWORK

      networkError:
        "SHOBDO সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।",

    },


    en: {

      or:
        "or",

      quote:
        "Your words deserve a place where they can be heard.",


      // GOOGLE

      loadingGoogle:
        "Signing in with Google...",

      googleUnavailable:
        "Google Sign-In is currently unavailable.",

      googleConfigurationMissing:
        "Google Sign-In has not been configured yet.",

      googleGenericError:
        "Unable to sign in with Google. Please try again.",

      googleAccountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in to your existing SHOBDO account first.",

      googleAccountConflict:
        "This SHOBDO account is already connected to another Google account.",

      googleSectionLabel:
        "Sign in with Google",


      // FACEBOOK

      continueWithFacebook:
        "Continue with Facebook",

      loadingFacebook:
        "Signing in with Facebook...",

      facebookUnavailable:
        "Facebook Login is currently unavailable.",

      facebookConfigurationMissing:
        "Facebook Login has not been configured yet.",

      facebookGenericError:
        "Unable to sign in with Facebook. Please try again.",

      facebookCancelled:
        "Facebook sign-in was cancelled.",

      facebookAccountLinkRequired:
        "A SHOBDO account already exists with this email. Sign in to your existing SHOBDO account first, then connect Facebook.",

      facebookAccountConflict:
        "This Facebook account is already connected to another SHOBDO account.",

      facebookEmailRequired:
        "Facebook did not provide your email address. Allow email access or use another sign-in method.",

      facebookSectionLabel:
        "Sign in with Facebook",


      // NETWORK

      networkError:
        "Unable to connect to SHOBDO. Please try again.",

    },


    hi: {

      or:
        "या",

      quote:
        "आपके शब्दों को ऐसी जगह मिलनी चाहिए जहाँ उन्हें सुना जा सके।",


      // GOOGLE

      loadingGoogle:
        "Google से लॉग इन हो रहा है...",

      googleUnavailable:
        "Google लॉगिन अभी उपलब्ध नहीं है।",

      googleConfigurationMissing:
        "Google लॉगिन अभी कॉन्फ़िगर नहीं किया गया है।",

      googleGenericError:
        "Google से लॉग इन नहीं हो सका। कृपया फिर से प्रयास करें।",

      googleAccountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने मौजूदा SHOBDO खाते में लॉग इन करें।",

      googleAccountConflict:
        "यह SHOBDO खाता पहले से किसी अन्य Google खाते से जुड़ा है।",

      googleSectionLabel:
        "Google से लॉग इन करें",


      // FACEBOOK

      continueWithFacebook:
        "Facebook से जारी रखें",

      loadingFacebook:
        "Facebook से लॉग इन हो रहा है...",

      facebookUnavailable:
        "Facebook लॉगिन अभी उपलब्ध नहीं है।",

      facebookConfigurationMissing:
        "Facebook लॉगिन अभी कॉन्फ़िगर नहीं किया गया है।",

      facebookGenericError:
        "Facebook से लॉग इन नहीं हो सका। कृपया फिर से प्रयास करें।",

      facebookCancelled:
        "Facebook लॉगिन रद्द कर दिया गया।",

      facebookAccountLinkRequired:
        "इस ईमेल से पहले से एक SHOBDO खाता मौजूद है। पहले अपने मौजूदा SHOBDO खाते में लॉग इन करें और फिर Facebook कनेक्ट करें।",

      facebookAccountConflict:
        "यह Facebook खाता पहले से किसी अन्य SHOBDO खाते से जुड़ा है।",

      facebookEmailRequired:
        "Facebook ने आपका ईमेल पता उपलब्ध नहीं कराया। ईमेल अनुमति दें या कोई अन्य लॉगिन तरीका उपयोग करें।",

      facebookSectionLabel:
        "Facebook से लॉग इन करें",


      // NETWORK

      networkError:
        "SHOBDO सर्वर से कनेक्ट नहीं हो सका। कृपया फिर से प्रयास करें।",

    },

  };


  const localSocialText =
    SOCIAL_TEXT[
      uiLanguage
    ] ||
    SOCIAL_TEXT.en;


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
        replace:
          true,
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

    setFacebookLoadError("");


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
            "login.googleGenericError",
            localSocialText.googleGenericError
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


        if (
          err?.code ===
          "account_link_required"
        ) {

          setError(
            translate(
              "login.googleAccountLinkRequired",
              localSocialText.googleAccountLinkRequired
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
              "login.googleAccountConflict",
              localSocialText.googleAccountConflict
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
              "login.networkError",
              localSocialText.networkError
            )
          );

          return;

        }


        setError(
          err?.message ||
          translate(
            "login.googleGenericError",
            localSocialText.googleGenericError
          )
        );


      } finally {

        setGoogleLoading(
          false
        );

      }

    };


  // =======================================================
  // FACEBOOK BACKEND LOGIN
  // =======================================================

  async function completeFacebookLogin(
    accessToken
  ) {

    try {

      await loginWithFacebook({

        accessToken,

      });


      await completeLogin();


    } catch (err) {

      console.error(
        "FACEBOOK LOGIN ERROR:",
        err
      );


      // ---------------------------------------------------
      // EXISTING SHOBDO EMAIL ACCOUNT
      // ---------------------------------------------------

      if (
        err?.code ===
        "account_link_required"
      ) {

        setError(
          translate(
            "login.facebookAccountLinkRequired",
            localSocialText.facebookAccountLinkRequired
          )
        );

        return;

      }


      // ---------------------------------------------------
      // FACEBOOK ACCOUNT CONFLICT
      // ---------------------------------------------------

      if (
        err?.code ===
        "facebook_account_conflict"
      ) {

        setError(
          translate(
            "login.facebookAccountConflict",
            localSocialText.facebookAccountConflict
          )
        );

        return;

      }


      // ---------------------------------------------------
      // FACEBOOK DID NOT PROVIDE EMAIL
      // ---------------------------------------------------

      if (
        err?.code ===
        "facebook_email_required"
      ) {

        setError(
          translate(
            "login.facebookEmailRequired",
            localSocialText.facebookEmailRequired
          )
        );

        return;

      }


      // ---------------------------------------------------
      // NETWORK
      // ---------------------------------------------------

      if (
        err?.code ===
        "network_error"
      ) {

        setError(
          translate(
            "login.networkError",
            localSocialText.networkError
          )
        );

        return;

      }


      // ---------------------------------------------------
      // BACKEND MESSAGE
      // ---------------------------------------------------

      setError(
        err?.message ||
        translate(
          "login.facebookGenericError",
          localSocialText.facebookGenericError
        )
      );

    }

  }


  // =======================================================
  // FACEBOOK LOGIN BUTTON
  // =======================================================

  function handleFacebookLogin() {

    if (
      busy ||
      !facebookReady
    ) {

      return;

    }


    setError("");

    setFacebookLoadError("");


    if (
      !window.FB?.login
    ) {

      setError(
        translate(
          "login.facebookUnavailable",
          localSocialText.facebookUnavailable
        )
      );

      return;

    }


    // IMPORTANT:
    //
    // FB.login() is called directly from this click handler.
    // This avoids browsers blocking the authentication popup.

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
                "login.facebookCancelled",
                localSocialText.facebookCancelled
              )
            );


            return;

          }


          Promise.resolve(
            completeFacebookLogin(
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
        "FACEBOOK SDK LOGIN ERROR:",
        err
      );


      setFacebookLoading(
        false
      );


      setError(
        translate(
          "login.facebookGenericError",
          localSocialText.facebookGenericError
        )
      );

    }

  }


  // =======================================================
  // GOOGLE SDK INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupGoogleLogin() {

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
              localSocialText.googleConfigurationMissing
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


          // -------------------------------------------------
          // INITIALIZE
          // -------------------------------------------------

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


          // -------------------------------------------------
          // BUTTON
          // -------------------------------------------------

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
                localSocialText.googleUnavailable
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
    [
      googleLocale,
    ]
  );


  // =======================================================
  // FACEBOOK SDK INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupFacebookLogin() {

        // -------------------------------------------------
        // APP ID
        // -------------------------------------------------

        if (
          !isFacebookAuthConfigured() ||
          !FACEBOOK_APP_ID
        ) {

          setFacebookReady(
            false
          );


          setFacebookLoadError(
            translate(
              "login.facebookConfigurationMissing",
              localSocialText.facebookConfigurationMissing
            )
          );


          return;

        }


        try {

          setFacebookLoadError("");


          // -------------------------------------------------
          // LOAD SDK
          // -------------------------------------------------

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


          // -------------------------------------------------
          // INITIALIZE SDK
          // -------------------------------------------------

          if (
            !facebookInitializedRef.current
          ) {

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


            facebookInitializedRef.current =
              true;

          }


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
                "login.facebookUnavailable",
                localSocialText.facebookUnavailable
              )
            );

          }

        }

      }


      setupFacebookLogin();


      return () => {

        cancelled =
          true;

      };

    },
    []
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
                  localSocialText.quote
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
              localSocialText.googleSectionLabel
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
                  localSocialText.loadingGoogle
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
              FACEBOOK SIGN-IN
          ============================================ */}

          <div
            className="shobdo-facebook-login-section"
            aria-label={
              localSocialText.facebookSectionLabel
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
                handleFacebookLogin
              }

              disabled={
                busy ||
                !facebookReady
              }

              aria-label={
                localSocialText.continueWithFacebook
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
                        "login.facebookLoading",
                        localSocialText.loadingFacebook
                      )
                    : translate(
                        "login.continueWithFacebook",
                        localSocialText.continueWithFacebook
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
              OR
          ============================================ */}

          <div
            className="shobdo-auth-divider"
          >

            <span />

            <small>

              {translate(
                "login.or",
                localSocialText.or
              )}

            </small>

            <span />

          </div>


          {/* ===========================================
              EMAIL/PASSWORD
          ============================================ */}

          <form
            className="shobdo-auth-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* EMAIL */}

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


            {/* PASSWORD */}

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


            {/* LOGIN BUTTON */}

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
              BOTTOM
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