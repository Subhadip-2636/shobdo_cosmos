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

  clearPendingInstagramLink,
  hasPendingInstagramLink,

  isFacebookAuthConfigured,
  isGoogleAuthConfigured,
  isInstagramAuthConfigured,

  linkFacebookAccount,
  linkPendingInstagramAccount,

  loginUser,
  loginWithFacebook,
  loginWithGoogle,
  loginWithInstagram,
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
        window.google
          ?.accounts
          ?.id
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

            if (
              window.google
                ?.accounts
                ?.id
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


        existingScript.addEventListener(
          "load",
          handleLoad,
          {
            once: true,
          }
        );


        existingScript.addEventListener(
          "error",
          () => {

            reject(
              new Error(
                "Unable to load Google Identity Services."
              )
            );

          },
          {
            once: true,
          }
        );


        setTimeout(
          () => {

            if (
              window.google
                ?.accounts
                ?.id
            ) {

              resolve(
                window.google
              );

            }

          },
          0
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
            window.google
              ?.accounts
              ?.id
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

              // Ignore another integration's callback error.

            }

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
            once: true,
          }
        );


        existingScript.addEventListener(
          "error",
          fail,
          {
            once: true,
          }
        );


        setTimeout(
          finish,
          0
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
// FACEBOOK LOGIN POPUP
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
// LOGIN COMPONENT
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
    useRef(
      null
    );


  const googleInitializedRef =
    useRef(
      false
    );


  const googleCallbackRef =
    useRef(
      null
    );


  // Facebook token stays only in memory while the user
  // authenticates the existing SHOBDO account.

  const pendingFacebookTokenRef =
    useRef(
      ""
    );


  // =======================================================
  // FORM
  // =======================================================

  const [
    email,
    setEmail,
  ] = useState(
    ""
  );


  const [
    password,
    setPassword,
  ] = useState(
    ""
  );


  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false
  );


  // =======================================================
  // PASSWORD LOGIN STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  // =======================================================
  // GOOGLE STATE
  // =======================================================

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(
    false
  );


  const [
    googleReady,
    setGoogleReady,
  ] = useState(
    false
  );


  const [
    googleLoadError,
    setGoogleLoadError,
  ] = useState(
    ""
  );


  // =======================================================
  // FACEBOOK STATE
  // =======================================================

  const [
    facebookLoading,
    setFacebookLoading,
  ] = useState(
    false
  );


  const [
    facebookLinking,
    setFacebookLinking,
  ] = useState(
    false
  );


  const [
    facebookReady,
    setFacebookReady,
  ] = useState(
    false
  );


  const [
    facebookLoadError,
    setFacebookLoadError,
  ] = useState(
    ""
  );


  const [
    facebookLinkPending,
    setFacebookLinkPending,
  ] = useState(
    false
  );


  // =======================================================
  // INSTAGRAM STATE
  // =======================================================

  const [
    instagramLoading,
    setInstagramLoading,
  ] = useState(
    false
  );


  const [
    instagramLinking,
    setInstagramLinking,
  ] = useState(
    false
  );


  const [
    instagramLinkPending,
    setInstagramLinkPending,
  ] = useState(
    false
  );


  // =======================================================
  // COMMON ERROR
  // =======================================================

  const [
    error,
    setError,
  ] = useState(
    ""
  );


  // =======================================================
  // BUSY
  // =======================================================

  const busy =
    loading ||
    googleLoading ||
    facebookLoading ||
    facebookLinking ||
    instagramLoading ||
    instagramLinking;


  // =======================================================
  // LOCAL FALLBACK TEXT
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
        "এই ইমেইলে ইতিমধ্যে একটি SHOBDO অ্যাকাউন্ট রয়েছে। আপনার বর্তমান SHOBDO অ্যাকাউন্টে Google অথবা পাসওয়ার্ড দিয়ে লগইন করুন। সফল লগইনের পরে Facebook একই অ্যাকাউন্টের সঙ্গে যুক্ত হবে।",

      facebookLinkFailed:
        "SHOBDO লগইন সফল হয়েছে, কিন্তু Facebook অ্যাকাউন্টটি যুক্ত করা যায়নি। আবার চেষ্টা করুন।",

      instagramButton:
        "Instagram দিয়ে চালিয়ে যান",

      instagramLoading:
        "Instagram দিয়ে লগইন হচ্ছে...",

      instagramLinking:
        "Instagram অ্যাকাউন্ট যুক্ত হচ্ছে...",

      instagramUnavailable:
        "Instagram লগইন এই মুহূর্তে উপলব্ধ নয়।",

      instagramGenericError:
        "Instagram দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",

      instagramCancelled:
        "Instagram লগইন বাতিল করা হয়েছে।",

      instagramPopupBlocked:
        "Instagram লগইন উইন্ডোটি ব্রাউজার ব্লক করেছে। SHOBDO-এর জন্য pop-up অনুমতি দিন।",

      instagramTimeout:
        "Instagram লগইনের সময়সীমা শেষ হয়েছে। আবার চেষ্টা করুন।",

      instagramAccountConflict:
        "এই Instagram অ্যাকাউন্টটি অন্য একটি SHOBDO অ্যাকাউন্টের সঙ্গে যুক্ত রয়েছে।",

      instagramLinkRequired:
        "Instagram অ্যাকাউন্টটি যাচাই হয়েছে। এখন আপনার বর্তমান SHOBDO অ্যাকাউন্টে Google, Facebook অথবা পাসওয়ার্ড দিয়ে লগইন করুন। এরপর Instagram একই SHOBDO অ্যাকাউন্টের সঙ্গে যুক্ত হবে।",

      instagramLinkFailed:
        "SHOBDO লগইন সফল হয়েছে, কিন্তু Instagram অ্যাকাউন্টটি যুক্ত করা যায়নি। আবার চেষ্টা করুন।",

      instagramProfessionalOnly:
        "Instagram Creator অথবা Business account প্রয়োজন।",

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
        "A SHOBDO account already exists with this email. Sign in below using your existing SHOBDO password or Google account. Facebook will then be connected automatically to that SHOBDO account.",

      facebookLinkFailed:
        "Your SHOBDO sign-in succeeded, but Facebook could not be connected. Please try again.",

      instagramButton:
        "Continue with Instagram",

      instagramLoading:
        "Signing in with Instagram...",

      instagramLinking:
        "Connecting Instagram account...",

      instagramUnavailable:
        "Instagram Login is currently unavailable.",

      instagramGenericError:
        "Unable to sign in with Instagram. Please try again.",

      instagramCancelled:
        "Instagram sign-in was cancelled.",

      instagramPopupBlocked:
        "Your browser blocked the Instagram sign-in window. Allow popups for SHOBDO and try again.",

      instagramTimeout:
        "Instagram sign-in timed out. Please try again.",

      instagramAccountConflict:
        "This Instagram account is already connected to another SHOBDO account.",

      instagramLinkRequired:
        "Your Instagram account has been verified. Now sign in to your existing SHOBDO account using password, Google, or Facebook. Instagram will then be connected to the same SHOBDO account.",

      instagramLinkFailed:
        "Your SHOBDO sign-in succeeded, but Instagram could not be connected. Please try again.",

      instagramProfessionalOnly:
        "Instagram login currently requires a Creator or Business account.",

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
        "इस ईमेल से पहले से SHOBDO खाता मौजूद है। नीचे अपने मौजूदा SHOBDO पासवर्ड या Google से लॉग इन करें। सफल लॉगिन के बाद Facebook उसी खाते से जुड़ जाएगा।",

      facebookLinkFailed:
        "SHOBDO लॉगिन सफल हुआ, लेकिन Facebook खाता जोड़ा नहीं जा सका। कृपया फिर प्रयास करें।",

      instagramButton:
        "Instagram से जारी रखें",

      instagramLoading:
        "Instagram से लॉग इन हो रहा है...",

      instagramLinking:
        "Instagram खाता जोड़ा जा रहा है...",

      instagramUnavailable:
        "Instagram लॉगिन अभी उपलब्ध नहीं है।",

      instagramGenericError:
        "Instagram से लॉग इन नहीं हो सका। कृपया फिर प्रयास करें।",

      instagramCancelled:
        "Instagram लॉगिन रद्द कर दिया गया।",

      instagramPopupBlocked:
        "ब्राउज़र ने Instagram लॉगिन विंडो को ब्लॉक कर दिया। SHOBDO के लिए pop-up की अनुमति दें।",

      instagramTimeout:
        "Instagram लॉगिन का समय समाप्त हो गया। कृपया फिर प्रयास करें।",

      instagramAccountConflict:
        "यह Instagram खाता किसी अन्य SHOBDO खाते से जुड़ा हुआ है।",

      instagramLinkRequired:
        "Instagram खाता सत्यापित हो गया है। अब अपने मौजूदा SHOBDO खाते में password, Google या Facebook से लॉग इन करें। इसके बाद Instagram उसी SHOBDO खाते से जुड़ जाएगा।",

      instagramLinkFailed:
        "SHOBDO लॉगिन सफल हुआ, लेकिन Instagram खाता जोड़ा नहीं जा सका। कृपया फिर प्रयास करें।",

      instagramProfessionalOnly:
        "Instagram लॉगिन के लिए Creator या Business account आवश्यक है।",

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
  // RESTORE PENDING INSTAGRAM LINK
  // =======================================================

  useEffect(
    () => {

      setInstagramLinkPending(
        hasPendingInstagramLink()
      );

    },
    []
  );


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
  // CLEAR INSTAGRAM LINK
  // =======================================================

  function clearPendingInstagramConnection() {

    clearPendingInstagramLink();


    setInstagramLinkPending(
      false
    );

  }


  // =======================================================
  // LINK PENDING FACEBOOK
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
  // LINK PENDING INSTAGRAM
  // =======================================================

  async function linkPendingInstagramIdentity() {

    if (
      !hasPendingInstagramLink()
    ) {

      setInstagramLinkPending(
        false
      );


      return null;

    }


    setInstagramLinking(
      true
    );


    try {

      const result =
        await linkPendingInstagramAccount();


      setInstagramLinkPending(
        false
      );


      return result;

    } catch (err) {

      if (
        err?.code ===
          "instagram_account_conflict" ||
        err?.code ===
          "instagram_link_token_invalid" ||
        err?.code ===
          "instagram_link_token_expired"
      ) {

        clearPendingInstagramConnection();

      }


      throw err;

    } finally {

      setInstagramLinking(
        false
      );

    }

  }


  // =======================================================
  // SOCIAL LINK ERROR MESSAGE
  // =======================================================

  function getSocialLinkErrorMessage(
    err
  ) {

    const code =
      String(
        err?.code ||
        ""
      );


    if (
      code.startsWith(
        "instagram_"
      )
    ) {

      if (
        code ===
        "instagram_account_conflict"
      ) {

        return localText
          .instagramAccountConflict;

      }


      return (
        err?.message ||
        localText.instagramLinkFailed
      );

    }


    if (
      code.startsWith(
        "facebook_"
      )
    ) {

      return (
        err?.message ||
        localText.facebookLinkFailed
      );

    }


    if (
      instagramLinkPending ||
      hasPendingInstagramLink()
    ) {

      return (
        err?.message ||
        localText.instagramLinkFailed
      );

    }


    if (
      facebookLinkPending ||
      pendingFacebookTokenRef.current
    ) {

      return (
        err?.message ||
        localText.facebookLinkFailed
      );

    }


    return (
      err?.message ||
      t(
        "errors.generic"
      )
    );

  }


  // =======================================================
  // FINISH AUTHENTICATION
  // =======================================================
  //
  // The user has now authenticated to SHOBDO.
  //
  // If Facebook or Instagram linking was pending, connect
  // those identities before navigating away.
  //
  // =======================================================

  async function finishAuthenticatedLogin() {

    if (
      pendingFacebookTokenRef.current
    ) {

      await linkPendingFacebookAccount();

    }


    if (
      hasPendingInstagramLink()
    ) {

      await linkPendingInstagramIdentity();

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


    setError(
      ""
    );


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
        shobdoLoginSucceeded
      ) {

        setError(
          getSocialLinkErrorMessage(
            err
          )
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


      setError(
        ""
      );


      setGoogleLoadError(
        ""
      );


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
          shobdoLoginSucceeded
        ) {

          setError(
            getSocialLinkErrorMessage(
              err
            )
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
              "Sign in using another existing " +
              "SHOBDO method first."
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
              "Google Identity Services API is unavailable."
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

                    setError(
                      ""
                    );

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


    setError(
      ""
    );


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


    let facebookLoginSucceeded =
      false;


    try {

      const facebookAccessToken =
        await openFacebookLogin();


      try {

        await loginWithFacebook({

          accessToken:
            facebookAccessToken,

        });


        facebookLoginSucceeded =
          true;


        clearPendingFacebookLink();


        await finishAuthenticatedLogin();


        return;

      } catch (err) {

        if (
          !facebookLoginSucceeded &&
          err?.code ===
          "account_link_required"
        ) {

          pendingFacebookTokenRef.current =
            facebookAccessToken;


          setFacebookLinkPending(
            true
          );


          setError(
            ""
          );


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
        facebookLoginSucceeded
      ) {

        setError(
          getSocialLinkErrorMessage(
            err
          )
        );


        return;

      }


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
  // INSTAGRAM LOGIN
  // =======================================================

  async function handleInstagramLogin() {

    if (busy) {

      return;

    }


    setError(
      ""
    );


    if (
      !isInstagramAuthConfigured()
    ) {

      setError(
        localText
          .instagramUnavailable
      );


      return;

    }


    setInstagramLoading(
      true
    );


    try {

      const result =
        await loginWithInstagram();


      // ---------------------------------------------------
      // EXISTING INSTAGRAM-LINKED SHOBDO USER
      // ---------------------------------------------------

      if (
        result?.status ===
        "authenticated"
      ) {

        setInstagramLinkPending(
          false
        );


        await finishAuthenticatedLogin();


        return;

      }


      // ---------------------------------------------------
      // INSTAGRAM VERIFIED, SHOBDO LINK REQUIRED
      // ---------------------------------------------------

      if (
        result?.status ===
        "link_required"
      ) {

        setInstagramLinkPending(
          true
        );


        setError(
          ""
        );


        return;

      }


      throw new Error(
        "Instagram authentication returned an unexpected response."
      );

    } catch (err) {

      console.error(
        "INSTAGRAM LOGIN ERROR:",
        err
      );


      if (
        err?.code ===
        "instagram_cancelled"
      ) {

        setError(
          localText
            .instagramCancelled
        );


        return;

      }


      if (
        err?.code ===
        "instagram_popup_blocked"
      ) {

        setError(
          localText
            .instagramPopupBlocked
        );


        return;

      }


      if (
        err?.code ===
        "instagram_popup_timeout"
      ) {

        setError(
          localText
            .instagramTimeout
        );


        return;

      }


      if (
        err?.code ===
        "instagram_account_conflict"
      ) {

        clearPendingInstagramConnection();


        setError(
          localText
            .instagramAccountConflict
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
        localText
          .instagramGenericError
      );

    } finally {

      setInstagramLoading(
        false
      );

    }

  }


  // =======================================================
  // LOGIN BUTTON LABEL
  // =======================================================

  function getPasswordButtonLabel() {

    if (
      facebookLinking
    ) {

      return localText
        .facebookLinking;

    }


    if (
      instagramLinking
    ) {

      return localText
        .instagramLinking;

    }


    if (loading) {

      return t(
        "login.loggingIn"
      );

    }


    if (
      facebookLinkPending &&
      instagramLinkPending
    ) {

      return (
        "Login & connect social accounts"
      );

    }


    if (
      facebookLinkPending
    ) {

      return (
        "Login & connect Facebook"
      );

    }


    if (
      instagramLinkPending
    ) {

      return (
        "Login & connect Instagram"
      );

    }


    return t(
      "login.loginButton"
    );

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
                  "14px",

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
                    busy
                      ? "not-allowed"
                      : "pointer",

                  font:
                    "inherit",

                }}
              >

                Cancel Facebook connection

              </button>

            </div>

          )}


          {/* ===========================================
              INSTAGRAM ACCOUNT LINK NOTICE
          ============================================ */}

          {instagramLinkPending && (

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
                  "14px",

                border:
                  "1px solid #D9A3C7",

                borderRadius:
                  "8px",

                background:
                  "#FFF7FB",

                color:
                  "#7A315F",

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

                Connect Instagram to your existing SHOBDO account

              </strong>


              {
                localText
                  .instagramLinkRequired
              }


              <button
                type="button"

                onClick={
                  clearPendingInstagramConnection
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
                    busy
                      ? "not-allowed"
                      : "pointer",

                  font:
                    "inherit",

                }}
              >

                Cancel Instagram connection

              </button>

            </div>

          )}


          {/* ===========================================
              GOOGLE
          ============================================ */}

          <div
            className="shobdo-google-login-section"

            aria-label={
              localText
                .googleSectionLabel
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
                "12px",

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
              INSTAGRAM
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
                handleInstagramLogin
              }

              disabled={
                busy ||
                !isInstagramAuthConfigured()
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
                  (
                    "linear-gradient(" +
                    "90deg," +
                    "#833AB4 0%," +
                    "#C13584 35%," +
                    "#E1306C 65%," +
                    "#F77737 100%" +
                    ")"
                  ),

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
                    !isInstagramAuthConfigured()
                  )
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  (
                    busy ||
                    !isInstagramAuthConfigured()
                  )
                    ? 0.65
                    : 1,

                transition:
                  "opacity 0.2s ease",

              }}
            >

              {
                (
                  instagramLoading ||
                  instagramLinking
                )
                  ? (

                      <Loader2
                        size={19}
                        className="spin"
                      />

                    )
                  : (

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="5"
                          ry="5"
                        />
                        <path
                          d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                        />
                        <line
                          x1="17.5"
                          x2="17.51"
                          y1="6.5"
                          y2="6.5"
                        />
                      </svg>

                    )
              }


              {
                instagramLinking
                  ? localText
                      .instagramLinking

                  : instagramLoading
                    ? localText
                        .instagramLoading

                    : localText
                        .instagramButton
              }

            </button>


            <div
              style={{

                marginTop:
                  "7px",

                textAlign:
                  "center",

                fontSize:
                  "0.75rem",

                lineHeight:
                  1.4,

                opacity:
                  0.62,

              }}
            >

              {
                localText
                  .instagramProfessionalOnly
              }

            </div>

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


                      setError(
                        ""
                      );

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


                      setError(
                        ""
                      );

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
                  facebookLinking ||
                  instagramLinking
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
                getPasswordButtonLabel()
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