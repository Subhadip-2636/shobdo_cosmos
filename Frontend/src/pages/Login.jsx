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
  FACEBOOK_GRAPH_API_VERSION,
  GOOGLE_CLIENT_ID,
  isFacebookAuthConfigured,
  isGoogleAuthConfigured,
  linkFacebookAccount,
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
  "shobdo-facebook-jssdk";

const FACEBOOK_SCRIPT_URL =
  "https://connect.facebook.net/en_US/sdk.js";


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

        const checkGoogle =
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
                  "Google Identity Services " +
                  "failed to initialize."
                )
              );

            }

          };


        existingScript.addEventListener(
          "load",
          checkGoogle,
          {
            once:
              true,
          }
        );


        existingScript.addEventListener(
          "error",
          () => {

            reject(
              new Error(
                "Unable to load Google " +
                "Identity Services."
              )
            );

          },
          {
            once:
              true,
          }
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
                "Google Identity Services " +
                "failed to initialize."
              )
            );

          }

        };


      script.onerror =
        () => {

          reject(
            new Error(
              "Unable to load Google " +
              "Identity Services."
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
// INITIALIZE FACEBOOK
// =========================================================

function initializeFacebook(
  facebook
) {

  if (!facebook) {

    throw new Error(
      "Facebook SDK is unavailable."
    );

  }


  const config = {

    appId:
      FACEBOOK_APP_ID,

    cookie:
      true,

    xfbml:
      false,

    status:
      false,

  };


  // Graph version stays environment configurable.
  //
  // This prevents the frontend source from becoming tied
  // permanently to one Meta Graph API version.

  if (
    FACEBOOK_GRAPH_API_VERSION
  ) {

    config.version =
      FACEBOOK_GRAPH_API_VERSION;

  }


  facebook.init(
    config
  );


  return facebook;

}


// =========================================================
// FACEBOOK SCRIPT LOADER
// =========================================================

function loadFacebookSdk() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (!FACEBOOK_APP_ID) {

        reject(
          new Error(
            "Facebook App ID is missing."
          )
        );

        return;

      }


      // -----------------------------------------------------
      // SDK ALREADY LOADED
      // -----------------------------------------------------

      if (window.FB) {

        try {

          resolve(
            initializeFacebook(
              window.FB
            )
          );

        } catch (error) {

          reject(
            error
          );

        }


        return;

      }


      let completed =
        false;


      const finish =
        () => {

          if (completed) {

            return;

          }


          if (!window.FB) {

            return;

          }


          completed =
            true;


          try {

            resolve(
              initializeFacebook(
                window.FB
              )
            );

          } catch (error) {

            reject(
              error
            );

          }

        };


      const fail =
        () => {

          if (completed) {

            return;

          }


          completed =
            true;


          reject(
            new Error(
              "Unable to load the Facebook SDK."
            )
          );

        };


      // -----------------------------------------------------
      // META ASYNC CALLBACK
      // -----------------------------------------------------

      const previousCallback =
        window.fbAsyncInit;


      window.fbAsyncInit =
        () => {

          if (
            typeof previousCallback ===
            "function"
          ) {

            try {

              previousCallback();

            } catch {

              // Do not let another callback block SHOBDO.

            }

          }


          finish();

        };


      // -----------------------------------------------------
      // EXISTING SCRIPT
      // -----------------------------------------------------

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
          fail,
          {
            once:
              true,
          }
        );


        // SDK may have completed before this listener
        // was attached.

        setTimeout(
          finish,
          0
        );


        return;

      }


      // -----------------------------------------------------
      // CREATE SCRIPT
      // -----------------------------------------------------

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
        finish;


      script.onerror =
        fail;


      document.body.appendChild(
        script
      );

    }
  );

}


// =========================================================
// FACEBOOK POPUP
// =========================================================

function openFacebookLogin() {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (
        !window.FB?.login
      ) {

        const error =
          new Error(
            "Facebook Login is not ready."
          );


        error.code =
          "facebook_sdk_unavailable";


        reject(
          error
        );


        return;

      }


      window.FB.login(
        (
          response
        ) => {

          const accessToken =
            response
              ?.authResponse
              ?.accessToken;


          if (!accessToken) {

            const error =
              new Error(
                "Facebook sign-in was cancelled."
              );


            error.code =
              "facebook_cancelled";


            reject(
              error
            );


            return;

          }


          resolve(
            accessToken
          );

        },
        {

          scope:
            "public_profile,email",

          return_scopes:
            true,

        }
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


  // Facebook access token is intentionally stored only
  // in memory while account linking is pending.
  //
  // We do NOT put it in localStorage.

  const pendingFacebookTokenRef =
    useRef("");


  // =======================================================
  // FORM
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
  // PASSWORD STATE
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
    facebookLinking,
    setFacebookLinking,
  ] = useState(false);


  const [
    facebookReady,
    setFacebookReady,
  ] = useState(false);


  const [
    facebookLoadError,
    setFacebookLoadError,
  ] = useState("");


  const [
    facebookLinkPending,
    setFacebookLinkPending,
  ] = useState(false);


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
    facebookLoading ||
    facebookLinking;


  // =======================================================
  // FALLBACK TEXT
  // =======================================================

  const AUTH_TEXT = {

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

      googleAccountConflict:
        "এই SHOBDO অ্যাকাউন্টটি অন্য একটি Google অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      googleSectionLabel:
        "Google দিয়ে লগইন",

      facebookButton:
        "Facebook দিয়ে চালিয়ে যান",

      facebookLoading:
        "Facebook দিয়ে লগইন হচ্ছে...",

      facebookLinking:
        "Facebook অ্যাকাউন্ট যুক্ত হচ্ছে...",

      facebookUnavailable:
        "Facebook লগইন এই মুহূর্তে উপলব্ধ নয়।",

      facebookConfigurationMissing:
        "Facebook লগইন এখনও কনফিগার করা হয়নি।",

      facebookGenericError:
        "Facebook দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",

      facebookCancelled:
        "Facebook লগইন বাতিল করা হয়েছে।",

      facebookEmailRequired:
        "Facebook আপনার ইমেইল দেয়নি। Facebook-এ email permission অনুমোদন করুন।",

      facebookAccountConflict:
        "এই Facebook অ্যাকাউন্টটি অন্য একটি SHOBDO অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      facebookLinkRequired:
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। এখন আপনার বর্তমান SHOBDO অ্যাকাউন্টে Google অথবা পাসওয়ার্ড দিয়ে লগইন করুন। লগইন সফল হলেই Facebook একই অ্যাকাউন্টের সঙ্গে স্বয়ংক্রিয়ভাবে যুক্ত হবে।",

      facebookLinkFailed:
        "SHOBDO-তে লগইন সফল হয়েছে, কিন্তু Facebook অ্যাকাউন্টটি যুক্ত করা যায়নি। আবার চেষ্টা করুন।",

      networkError:
        "SHOBDO সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।",

      quote:
        "তোমার শব্দ এমন একটি স্থান পাওয়ার যোগ্য, যেখানে তা শোনা যায়।",

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

      googleAccountConflict:
        "This SHOBDO account is already connected to another Google account.",

      googleSectionLabel:
        "Sign in with Google",

      facebookButton:
        "Continue with Facebook",

      facebookLoading:
        "Signing in with Facebook...",

      facebookLinking:
        "Connecting Facebook account...",

      facebookUnavailable:
        "Facebook Login is currently unavailable.",

      facebookConfigurationMissing:
        "Facebook Login has not been configured yet.",

      facebookGenericError:
        "Unable to sign in with Facebook. Please try again.",

      facebookCancelled:
        "Facebook sign-in was cancelled.",

      facebookEmailRequired:
        "Facebook did not provide your email address. Allow the email permission and try again.",

      facebookAccountConflict:
        "This Facebook account is already connected to another SHOBDO account.",

      facebookLinkRequired:
        "A SHOBDO account already exists with this email. Sign in below using your existing SHOBDO password or Google account. After you sign in, Facebook will be connected automatically to the same SHOBDO account.",

      facebookLinkFailed:
        "Your SHOBDO sign-in succeeded, but Facebook could not be connected. Please try again.",

      networkError:
        "Unable to connect to SHOBDO. Please try again.",

      quote:
        "Your words deserve a place where they can be heard.",

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

      googleAccountConflict:
        "यह SHOBDO खाता पहले से किसी अन्य Google खाते से जुड़ा है।",

      googleSectionLabel:
        "Google से लॉग इन करें",

      facebookButton:
        "Facebook से जारी रखें",

      facebookLoading:
        "Facebook से लॉग इन हो रहा है...",

      facebookLinking:
        "Facebook खाता जोड़ा जा रहा है...",

      facebookUnavailable:
        "Facebook लॉगिन अभी उपलब्ध नहीं है।",

      facebookConfigurationMissing:
        "Facebook लॉगिन अभी कॉन्फ़िगर नहीं किया गया है।",

      facebookGenericError:
        "Facebook से लॉग इन नहीं हो सका। कृपया फिर प्रयास करें।",

      facebookCancelled:
        "Facebook लॉगिन रद्द कर दिया गया।",

      facebookEmailRequired:
        "Facebook ने आपका ईमेल पता नहीं दिया। Email permission की अनुमति देकर फिर प्रयास करें।",

      facebookAccountConflict:
        "यह Facebook खाता किसी अन्य SHOBDO खाते से जुड़ा हुआ है।",

      facebookLinkRequired:
        "इस ईमेल से पहले से SHOBDO खाता मौजूद है। नीचे अपने मौजूदा SHOBDO पासवर्ड या Google से लॉग इन करें। सफल लॉगिन के बाद Facebook उसी खाते से अपने आप जुड़ जाएगा।",

      facebookLinkFailed:
        "SHOBDO लॉगिन सफल हुआ, लेकिन Facebook खाता जोड़ा नहीं जा सका। कृपया फिर प्रयास करें।",

      networkError:
        "SHOBDO सर्वर से कनेक्ट नहीं हो सका। कृपया फिर प्रयास करें।",

      quote:
        "आपके शब्दों को ऐसी जगह मिलनी चाहिए जहाँ उन्हें सुना जा सके।",

    },

  };


  const localText =
    AUTH_TEXT[
      uiLanguage
    ] ||
    AUTH_TEXT.en;


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

      // Use local fallback.

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
  // CLEAR FACEBOOK LINK
  // =======================================================

  function clearPendingFacebookLink() {

    pendingFacebookTokenRef.current =
      "";


    setFacebookLinkPending(
      false
    );

  }


  // =======================================================
  // LINK PENDING FACEBOOK ACCOUNT
  // =======================================================

  async function linkPendingFacebookAccount() {

    const facebookToken =
      pendingFacebookTokenRef.current;


    if (!facebookToken) {

      return null;

    }


    setFacebookLinking(
      true
    );


    try {

      const result =
        await linkFacebookAccount({

          accessToken:
            facebookToken,

        });


      clearPendingFacebookLink();


      return result;

    } catch (err) {

      // A permanent identity conflict should not retain
      // the pending Facebook credential.

      if (
        err?.code ===
        "facebook_account_conflict"
      ) {

        clearPendingFacebookLink();

      }


      throw err;

    } finally {

      setFacebookLinking(
        false
      );

    }

  }


  // =======================================================
  // FINISH AUTH + OPTIONAL FACEBOOK LINK
  // =======================================================

  async function finishAuthenticatedLogin() {

    if (
      pendingFacebookTokenRef.current
    ) {

      await linkPendingFacebookAccount();

    }


    await completeLogin();

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


    let shobdoLoginSucceeded =
      false;


    try {

      await loginUser({

        email:
          normalizedEmail,

        password,

      });


      shobdoLoginSucceeded =
        true;


      await finishAuthenticatedLogin();

    } catch (err) {

      console.error(
        "PASSWORD LOGIN ERROR:",
        err
      );


      if (
        shobdoLoginSucceeded &&
        facebookLinkPending
      ) {

        setError(
          err?.message ||
          localText.facebookLinkFailed
        );

        return;

      }


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
        !credentialResponse
          ?.credential
      ) {

        setError(
          localText.googleGenericError
        );

        return;

      }


      setError("");


      setGoogleLoadError("");


      setGoogleLoading(
        true
      );


      let shobdoLoginSucceeded =
        false;


      try {

        await loginWithGoogle({

          credential:
            credentialResponse
              .credential,

        });


        shobdoLoginSucceeded =
          true;


        await finishAuthenticatedLogin();

      } catch (err) {

        console.error(
          "GOOGLE LOGIN ERROR:",
          err
        );


        if (
          shobdoLoginSucceeded &&
          facebookLinkPending
        ) {

          setError(
            err?.message ||
            localText.facebookLinkFailed
          );

          return;

        }


        if (
          err?.code ===
          "account_link_required"
        ) {

          setError(
            err?.message ||
            (
              "Sign in using another " +
              "existing SHOBDO method first."
            )
          );

          return;

        }


        if (
          err?.code ===
          "google_account_conflict"
        ) {

          setError(
            localText
              .googleAccountConflict
          );

          return;

        }


        if (
          err?.code ===
          "network_error"
        ) {

          setError(
            localText.networkError
          );

          return;

        }


        setError(
          err?.message ||
          localText.googleGenericError
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


      async function setupGoogleLogin() {

        if (
          !isGoogleAuthConfigured() ||
          !GOOGLE_CLIENT_ID
        ) {

          setGoogleReady(
            false
          );


          setGoogleLoadError(
            localText
              .googleConfigurationMissing
          );


          return;

        }


        try {

          setGoogleLoadError(
            ""
          );


          await loadGoogleIdentityServices();


          if (cancelled) {

            return;

          }


          if (
            !window.google
              ?.accounts
              ?.id
          ) {

            throw new Error(
              "Google Identity Services " +
              "API is unavailable."
            );

          }


          if (
            !googleInitializedRef.current
          ) {

            window.google
              .accounts
              .id
              .initialize({

                client_id:
                  GOOGLE_CLIENT_ID,

                callback:
                  (
                    response
                  ) => {

                    googleCallbackRef
                      .current
                      ?.(
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


          window.google
            .accounts
            .id
            .renderButton(
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
            "GOOGLE SDK ERROR:",
            err
          );


          if (!cancelled) {

            setGoogleReady(
              false
            );


            setGoogleLoadError(
              localText
                .googleUnavailable
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
  // FACEBOOK INITIALIZATION
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function setupFacebook() {

        if (
          !isFacebookAuthConfigured() ||
          !FACEBOOK_APP_ID
        ) {

          setFacebookReady(
            false
          );


          setFacebookLoadError(
            localText
              .facebookConfigurationMissing
          );


          return;

        }


        try {

          setFacebookLoadError(
            ""
          );


          await loadFacebookSdk();


          if (!cancelled) {

            setFacebookReady(
              true
            );

          }

        } catch (err) {

          console.error(
            "FACEBOOK SDK ERROR:",
            err
          );


          if (!cancelled) {

            setFacebookReady(
              false
            );


            setFacebookLoadError(
              localText
                .facebookUnavailable
            );

          }

        }

      }


      setupFacebook();


      return () => {

        cancelled =
          true;

      };

    },
    []
  );


  // =======================================================
  // FACEBOOK LOGIN
  // =======================================================

  async function handleFacebookLogin() {

    if (busy) {

      return;

    }


    setError("");


    if (
      !facebookReady ||
      !window.FB
    ) {

      setError(
        facebookLoadError ||
        localText.facebookUnavailable
      );

      return;

    }


    setFacebookLoading(
      true
    );


    try {

      // ---------------------------------------------------
      // 1. FACEBOOK POPUP
      // ---------------------------------------------------

      const facebookAccessToken =
        await openFacebookLogin();


      // ---------------------------------------------------
      // 2. TRY DIRECT SHOBDO FACEBOOK LOGIN
      // ---------------------------------------------------

      try {

        await loginWithFacebook({

          accessToken:
            facebookAccessToken,

        });


        clearPendingFacebookLink();


        await completeLogin();


        return;

      } catch (err) {

        // -------------------------------------------------
        // EXISTING SHOBDO ACCOUNT
        // -------------------------------------------------
        //
        // Keep Facebook token only in this page's memory.
        //
        // The user now authenticates using the existing
        // SHOBDO account. After successful authentication
        // finishAuthenticatedLogin() calls /facebook/link.
        //
        // -------------------------------------------------

        if (
          err?.code ===
          "account_link_required"
        ) {

          pendingFacebookTokenRef.current =
            facebookAccessToken;


          setFacebookLinkPending(
            true
          );


          setError("");


          return;

        }


        throw err;

      }

    } catch (err) {

      console.error(
        "FACEBOOK LOGIN ERROR:",
        err
      );


      if (
        err?.code ===
        "facebook_cancelled"
      ) {

        setError(
          localText.facebookCancelled
        );

        return;

      }


      if (
        err?.code ===
        "facebook_email_required"
      ) {

        setError(
          localText.facebookEmailRequired
        );

        return;

      }


      if (
        err?.code ===
        "facebook_account_conflict"
      ) {

        clearPendingFacebookLink();


        setError(
          localText
            .facebookAccountConflict
        );

        return;

      }


      if (
        err?.code ===
        "network_error"
      ) {

        setError(
          localText.networkError
        );

        return;

      }


      setError(
        err?.message ||
        localText.facebookGenericError
      );

    } finally {

      setFacebookLoading(
        false
      );

    }

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="shobdo-auth-page"
    >

      <div
        className="shobdo-auth-layout"
      >


        {/* =============================================
            LEFT SIDE
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

              “{translate(
                "login.quote",
                localText.quote
              )}”

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
              NORMAL ERROR
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
              FACEBOOK ACCOUNT LINK NOTICE
          ============================================ */}

          {facebookLinkPending && (

            <div
              role="status"
              style={{

                width:
                  "100%",

                boxSizing:
                  "border-box",

                padding:
                  "14px 16px",

                marginBottom:
                  "18px",

                border:
                  "1px solid #D8B36A",

                borderRadius:
                  "8px",

                background:
                  "#FFF9ED",

                color:
                  "#77571D",

                fontSize:
                  "0.88rem",

                lineHeight:
                  1.55,

              }}
            >

              <strong
                style={{
                  display:
                    "block",

                  marginBottom:
                    "5px",
                }}
              >

                Connect Facebook to your existing SHOBDO account

              </strong>


              {
                localText
                  .facebookLinkRequired
              }


              <button
                type="button"
                onClick={
                  clearPendingFacebookLink
                }
                disabled={
                  busy
                }
                style={{

                  display:
                    "block",

                  marginTop:
                    "9px",

                  padding:
                    0,

                  border:
                    0,

                  background:
                    "transparent",

                  color:
                    "inherit",

                  textDecoration:
                    "underline",

                  cursor:
                    "pointer",

                  font:
                    "inherit",

                }}
              >

                Cancel Facebook connection

              </button>

            </div>

          )}


          {/* ===========================================
              GOOGLE
          ============================================ */}

          <div
            className="shobdo-google-login-section"
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

            {googleLoading ? (

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

                {
                  localText
                    .loadingGoogle
                }

              </button>

            ) : (

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
                      ? 0.6
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
                      "8px",

                    textAlign:
                      "center",

                    fontSize:
                      "0.8rem",

                    lineHeight:
                      1.4,

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
              FACEBOOK
          ============================================ */}

          <div
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
              style={{

                width:
                  "100%",

                minHeight:
                  "48px",

                border:
                  0,

                borderRadius:
                  "7px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  "11px",

                padding:
                  "0 18px",

                background:
                  "#1877F2",

                color:
                  "#FFFFFF",

                fontFamily:
                  "inherit",

                fontSize:
                  "1rem",

                fontWeight:
                  600,

                cursor:
                  (
                    busy ||
                    !facebookReady
                  )
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  (
                    busy ||
                    !facebookReady
                  )
                    ? 0.65
                    : 1,

                transition:
                  "opacity 0.2s ease",

              }}
            >

              {
                (
                  facebookLoading ||
                  facebookLinking
                )
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
                            "26px",

                          height:
                            "26px",

                          borderRadius:
                            "50%",

                          display:
                            "inline-flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          background:
                            "#FFFFFF",

                          color:
                            "#1877F2",

                          fontFamily:
                            "Arial, sans-serif",

                          fontWeight:
                            800,

                          fontSize:
                            "19px",

                          lineHeight:
                            1,

                        }}
                      >

                        f

                      </span>

                    )
              }


              {
                facebookLinking
                  ? localText
                      .facebookLinking

                  : facebookLoading
                    ? localText
                        .facebookLoading

                    : localText
                        .facebookButton
              }

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
                      "8px",

                    textAlign:
                      "center",

                    fontSize:
                      "0.8rem",

                    lineHeight:
                      1.4,

                    opacity:
                      0.75,

                  }}
                >

                  {facebookLoadError}

                </div>

              )
            }

          </div>


          {/* ===========================================
              DIVIDER
          ============================================ */}

          <div
            className="shobdo-auth-divider"
          >

            <span />

            <small>

              {translate(
                "login.or",
                localText.or
              )}

            </small>

            <span />

          </div>


          {/* ===========================================
              PASSWORD LOGIN
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
                    ) => {

                      setEmail(
                        event
                          .target
                          .value
                      );


                      setError("");

                    }
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
                    ) => {

                      setPassword(
                        event
                          .target
                          .value
                      );


                      setError("");

                    }
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
                (
                  loading ||
                  facebookLinking
                )
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
                facebookLinking

                  ? localText
                      .facebookLinking

                  : loading
                    ? t(
                        "login.loggingIn"
                      )

                    : facebookLinkPending
                      ? (
                          "Login & connect Facebook"
                        )

                      : t(
                          "login.loginButton"
                        )
              }

            </button>

          </form>


          {/* ===========================================
              REGISTER
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