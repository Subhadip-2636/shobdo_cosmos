import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Globe2,
  Hash,
  Headphones,
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share2,
  Sparkles,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getSavedWritingStatus,
  getToken,
  recordWritingShare,
  repostWriting,
  saveWriting,
  toggleLike,
  unrepostWriting,
  unsaveWriting,
} from "../api/api";

import {
  generateAudioSummary,
  getAudioSummaryLanguages,
  getCachedAudioSummary,
} from "../api/audioSummary";

import {
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./WritingCard.css";


// =========================================================
// SHARED AUDIO-LANGUAGE CACHE
// =========================================================
//
// The language list is identical for every WritingCard.
//
// Without this cache, a feed containing 20 cards could make
// 20 identical requests to:
//
// /api/writings/audio-summary/languages
//
// This keeps it to one request for the current page session.
//
// IMPORTANT:
// This caches only the list of available languages.
// It does NOT cache or remember the listener's selected
// language.
//
// Every WritingCard still starts independently with:
// "Choose language".
//
// =========================================================

let sharedAudioLanguages = null;

let sharedAudioLanguagesPromise = null;


async function loadSharedAudioLanguages() {

  if (
    Array.isArray(
      sharedAudioLanguages
    )
  ) {

    return sharedAudioLanguages;
  }


  if (
    sharedAudioLanguagesPromise
  ) {

    return sharedAudioLanguagesPromise;
  }


  sharedAudioLanguagesPromise =
    getAudioSummaryLanguages()
      .then(
        (
          languages
        ) => {

          sharedAudioLanguages =
            Array.isArray(
              languages
            )
              ? languages
              : [];


          return sharedAudioLanguages;

        }
      )
      .catch(
        (
          error
        ) => {

          sharedAudioLanguagesPromise =
            null;


          throw error;

        }
      );


  return sharedAudioLanguagesPromise;
}


// =========================================================
// NUMBER HELPER
// =========================================================

function safeNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? Math.max(
        0,
        number
      )
    : 0;
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(
  value
) {

  const text =
    String(
      value || ""
    ).trim();


  if (!text) {

    return "";
  }


  const parts =
    text
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }


  return (
    `${parts[0][0]}${parts[1][0]}`
  ).toUpperCase();
}


// =========================================================
// WRITING SHARE URL
// =========================================================

function getWritingShareUrl(
  writingId
) {

  const path =
    `/writings/${writingId}`;


  if (
    typeof window ===
    "undefined"
  ) {

    return path;
  }


  try {

    return new URL(
      path,
      window.location.origin
    ).toString();

  } catch {

    return (
      `${window.location.origin}${path}`
    );
  }
}


// =========================================================
// COPY TEXT
// =========================================================

async function copyText(
  text
) {

  if (
    typeof navigator !==
      "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard
      .writeText ===
      "function"
  ) {

    await navigator.clipboard.writeText(
      text
    );


    return true;
  }


  if (
    typeof document ===
    "undefined"
  ) {

    return false;
  }


  const textarea =
    document.createElement(
      "textarea"
    );


  textarea.value =
    text;


  textarea.setAttribute(
    "readonly",
    ""
  );


  textarea.style.position =
    "fixed";

  textarea.style.opacity =
    "0";

  textarea.style.pointerEvents =
    "none";

  textarea.style.left =
    "-9999px";


  document.body.appendChild(
    textarea
  );


  textarea.select();


  textarea.setSelectionRange(
    0,
    textarea.value.length
  );


  let success =
    false;


  try {

    success =
      document.execCommand(
        "copy"
      );

  } catch {

    success =
      false;
  }


  document.body.removeChild(
    textarea
  );


  return success;
}


// =========================================================
// AUDIO SUMMARY INLINE STYLES
// =========================================================
//
// Kept here intentionally so the feature works immediately
// without requiring WritingCard.css changes.
//
// We can move these into WritingCard.css after everything is
// confirmed working.
//
// =========================================================

const audioStyles = {

  shell: {
    marginTop: "14px",
    marginBottom: "14px",
    border:
      "1px solid rgba(114, 78, 145, 0.16)",
    borderRadius: "16px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(249,245,252,0.96))",
    boxShadow:
      "0 7px 24px rgba(72, 40, 92, 0.05)",
  },

  toggle: {
    width: "100%",
    border: "0",
    background: "transparent",
    padding: "13px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "12px",
    cursor: "pointer",
    color: "inherit",
    font: "inherit",
  },

  toggleMain: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  iconBubble: {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    background:
      "rgba(112, 63, 148, 0.10)",
    color: "#71428f",
  },

  toggleText: {
    minWidth: 0,
    textAlign: "left",
  },

  title: {
    display: "block",
    fontSize: "14px",
    lineHeight: 1.3,
    fontWeight: 700,
  },

  subtitle: {
    display: "block",
    marginTop: "2px",
    fontSize: "12px",
    lineHeight: 1.35,
    opacity: 0.66,
  },

  badge: {
    flexShrink: 0,
    fontSize: "10px",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    padding: "6px 8px",
    borderRadius: "999px",
    background:
      "rgba(112, 63, 148, 0.09)",
    color: "#71428f",
  },

  body: {
    padding:
      "0 14px 14px",
  },

  divider: {
    height: "1px",
    background:
      "rgba(114, 78, 145, 0.11)",
    marginBottom: "13px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 700,
    opacity: 0.72,
  },

  select: {
    width: "100%",
    minHeight: "42px",
    padding:
      "0 12px",
    border:
      "1px solid rgba(114, 78, 145, 0.20)",
    borderRadius: "11px",
    background: "#fff",
    color: "inherit",
    font: "inherit",
    fontSize: "13px",
    outline: "none",
  },

  status: {
    marginTop: "11px",
    padding: "10px 11px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    lineHeight: 1.45,
    background:
      "rgba(112, 63, 148, 0.065)",
  },

  error: {
    marginTop: "11px",
    padding: "10px 11px",
    borderRadius: "11px",
    fontSize: "12px",
    lineHeight: 1.45,
    background:
      "rgba(196, 54, 67, 0.07)",
    color: "#a82b3b",
  },

  button: {
    marginTop: "11px",
    width: "100%",
    minHeight: "42px",
    border: "0",
    borderRadius: "11px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    gap: "8px",
    cursor: "pointer",
    font: "inherit",
    fontSize: "13px",
    fontWeight: 700,
    background:
      "linear-gradient(135deg, #71428f, #8f5aa8)",
    color: "#fff",
  },

  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  player: {
    width: "100%",
    marginTop: "11px",
    height: "42px",
  },

  summaryDetails: {
    marginTop: "9px",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  summaryText: {
    margin:
      "8px 0 0",
    padding: "10px 11px",
    borderRadius: "10px",
    background:
      "rgba(255,255,255,0.75)",
    whiteSpace: "pre-wrap",
  },

  footerNote: {
    margin:
      "9px 0 0",
    fontSize: "11px",
    lineHeight: 1.4,
    opacity: 0.58,
  },

};


// =========================================================
// WRITING CARD
// =========================================================

function WritingCard({
  writing,
}) {

  const navigate =
    useNavigate();


  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  const shareResetTimerRef =
    useRef(
      null
    );


  const menuRef =
    useRef(
      null
    );


  const repostMenuRef =
    useRef(
      null
    );


  const audioRequestIdRef =
    useRef(
      0
    );


  // =======================================================
  // TRANSLATION FALLBACK
  // =======================================================

  function translate(
    key,
    fallbackBn,
    fallbackEn,
    fallbackHi = null
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

      // Local fallback below.
    }


    if (
      uiLanguage ===
      "bn"
    ) {

      return fallbackBn;
    }


    if (
      uiLanguage ===
      "hi"
    ) {

      return (
        fallbackHi ||
        fallbackEn
      );
    }


    return fallbackEn;
  }


  // =======================================================
  // LABELS
  // =======================================================

  const labels = {

    unknownAuthor:
      translate(
        "common.unknownAuthor",
        "অজানা লেখক",
        "Unknown author",
        "अज्ञात लेखक"
      ),

    untitled:
      translate(
        "common.untitled",
        "শিরোনামহীন লেখা",
        "Untitled writing",
        "बिना शीर्षक"
      ),

    writer:
      uiLanguage === "bn"
        ? "লেখক"
        : uiLanguage === "hi"
          ? "लेखक"
          : "Writer",

    previewUnavailable:
      translate(
        "writingCard.previewUnavailable",
        "এই লেখার কোনো প্রিভিউ নেই।",
        "No preview is available for this writing.",
        "इस रचना का पूर्वावलोकन उपलब्ध नहीं है।"
      ),

    minutes:
      translate(
        "writingCard.minutes",
        "মিনিট পড়া",
        "min read",
        "मिनट पढ़ें"
      ),

    words:
      translate(
        "writingCard.words",
        "শব্দ",
        "words",
        "शब्द"
      ),

    like:
      uiLanguage === "bn"
        ? "পছন্দ করুন"
        : uiLanguage === "hi"
          ? "पसंद करें"
          : "Like",

    unlike:
      uiLanguage === "bn"
        ? "পছন্দ সরান"
        : uiLanguage === "hi"
          ? "पसंद हटाएँ"
          : "Unlike",

    comment:
      uiLanguage === "bn"
        ? "মন্তব্য"
        : uiLanguage === "hi"
          ? "टिप्पणी"
          : "Comment",

    repost:
      uiLanguage === "bn"
        ? "রিপোস্ট"
        : uiLanguage === "hi"
          ? "रीपोस्ट"
          : "Repost",

    unrepost:
      uiLanguage === "bn"
        ? "রিপোস্ট সরান"
        : uiLanguage === "hi"
          ? "रीपोस्ट हटाएँ"
          : "Remove repost",

    repostWriting:
      uiLanguage === "bn"
        ? "রিপোস্ট করুন"
        : uiLanguage === "hi"
          ? "रीपोस्ट करें"
          : "Repost",

    repostDescription:
      uiLanguage === "bn"
        ? "এই লেখাটি আপনার রিপোস্টে দেখাবে"
        : uiLanguage === "hi"
          ? "यह रचना आपके रीपोस्ट में दिखाई देगी"
          : "Show this writing in your reposts",

    removeRepostDescription:
      uiLanguage === "bn"
        ? "আপনার রিপোস্ট থেকে এই লেখাটি সরান"
        : uiLanguage === "hi"
          ? "इस रचना को अपने रीपोस्ट से हटाएँ"
          : "Remove this writing from your reposts",

    share:
      uiLanguage === "bn"
        ? "শেয়ার"
        : uiLanguage === "hi"
          ? "शेयर"
          : "Share",

    shared:
      uiLanguage === "bn"
        ? "শেয়ার হয়েছে"
        : uiLanguage === "hi"
          ? "शेयर किया गया"
          : "Shared",

    copied:
      uiLanguage === "bn"
        ? "লিংক কপি হয়েছে"
        : uiLanguage === "hi"
          ? "लिंक कॉपी हो गया"
          : "Link copied",

    shareFailed:
      uiLanguage === "bn"
        ? "শেয়ার করা যায়নি"
        : uiLanguage === "hi"
          ? "शेयर नहीं हो सका"
          : "Unable to share",

    save:
      uiLanguage === "bn"
        ? "সংরক্ষণ"
        : uiLanguage === "hi"
          ? "सहेजें"
          : "Save",

    removeSaved:
      uiLanguage === "bn"
        ? "সংরক্ষিত তালিকা থেকে সরান"
        : uiLanguage === "hi"
          ? "सहेजी गई सूची से हटाएँ"
          : "Remove from saved",

    more:
      uiLanguage === "bn"
        ? "আরও অপশন"
        : uiLanguage === "hi"
          ? "अधिक विकल्प"
          : "More options",

    openPost:
      uiLanguage === "bn"
        ? "লেখাটি খুলুন"
        : uiLanguage === "hi"
          ? "रचना खोलें"
          : "Open post",

    copyLink:
      uiLanguage === "bn"
        ? "লিংক কপি করুন"
        : uiLanguage === "hi"
          ? "लिंक कॉपी करें"
          : "Copy link",

    audioSummary:
      uiLanguage === "bn"
        ? "AI অডিও সারাংশ"
        : uiLanguage === "hi"
          ? "AI ऑडियो सारांश"
          : "AI Audio Summary",

    audioDescription:
      uiLanguage === "bn"
        ? "আপনার পছন্দের ভাষায় লেখাটির সংক্ষিপ্ত সারাংশ শুনুন"
        : uiLanguage === "hi"
          ? "अपनी पसंद की भाषा में रचना का संक्षिप्त सारांश सुनें"
          : "Listen to a short summary in your preferred language",

    chooseLanguage:
      uiLanguage === "bn"
        ? "অডিওর ভাষা বেছে নিন"
        : uiLanguage === "hi"
          ? "ऑडियो की भाषा चुनें"
          : "Choose audio language",

    chooseLanguageOption:
      uiLanguage === "bn"
        ? "ভাষা নির্বাচন করুন"
        : uiLanguage === "hi"
          ? "भाषा चुनें"
          : "Choose language",

    loadingLanguages:
      uiLanguage === "bn"
        ? "ভাষার তালিকা লোড হচ্ছে..."
        : uiLanguage === "hi"
          ? "भाषाएँ लोड हो रही हैं..."
          : "Loading languages...",

    checkingAudio:
      uiLanguage === "bn"
        ? "আগে থেকে তৈরি অডিও খোঁজা হচ্ছে..."
        : uiLanguage === "hi"
          ? "पहले से बना ऑडियो खोजा जा रहा है..."
          : "Checking for an existing audio summary...",

    audioReady:
      uiLanguage === "bn"
        ? "অডিও সারাংশ প্রস্তুত"
        : uiLanguage === "hi"
          ? "ऑडियो सारांश तैयार है"
          : "Audio summary is ready",

    cachedAudio:
      uiLanguage === "bn"
        ? "আগে তৈরি করা অডিও পাওয়া গেছে"
        : uiLanguage === "hi"
          ? "पहले से बनाया गया ऑडियो मिल गया"
          : "Existing audio summary found",

    generateAudio:
      uiLanguage === "bn"
        ? "অডিও সারাংশ তৈরি করুন"
        : uiLanguage === "hi"
          ? "ऑडियो सारांश बनाएं"
          : "Generate audio summary",

    generatingAudio:
      uiLanguage === "bn"
        ? "AI অডিও সারাংশ তৈরি করছে..."
        : uiLanguage === "hi"
          ? "AI ऑडियो सारांश बना रहा है..."
          : "AI is generating the audio summary...",

    noCachedAudio:
      uiLanguage === "bn"
        ? "এই ভাষায় এখনও অডিও তৈরি হয়নি।"
        : uiLanguage === "hi"
          ? "इस भाषा में अभी ऑडियो नहीं बनाया गया है।"
          : "No audio has been generated in this language yet.",

    viewSummary:
      uiLanguage === "bn"
        ? "সারাংশের লেখা দেখুন"
        : uiLanguage === "hi"
          ? "सारांश का टेक्स्ट देखें"
          : "View summary text",

    generatedWithAI:
      uiLanguage === "bn"
        ? "Gemini AI দ্বারা তৈরি সংক্ষিপ্ত অডিও সারাংশ"
        : uiLanguage === "hi"
          ? "Gemini AI द्वारा बनाया गया संक्षिप्त ऑडियो सारांश"
          : "Short audio summary generated with Gemini AI",

    audioUnavailable:
      uiLanguage === "bn"
        ? "এই ভাষায় অডিও এখনও উপলভ্য নয়"
        : uiLanguage === "hi"
          ? "इस भाषा में ऑडियो अभी उपलब्ध नहीं है"
          : "Audio is not available in this language yet",

    audioLoadFailed:
      uiLanguage === "bn"
        ? "অডিও সারাংশ লোড করা যায়নি।"
        : uiLanguage === "hi"
          ? "ऑडियो सारांश लोड नहीं हो सका।"
          : "Unable to load the audio summary.",

    audioGenerationFailed:
      uiLanguage === "bn"
        ? "অডিও সারাংশ তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        : uiLanguage === "hi"
          ? "ऑडियो सारांश नहीं बन सका। फिर से कोशिश करें।"
          : "Unable to generate the audio summary. Please try again.",

    loginForAudio:
      uiLanguage === "bn"
        ? "নতুন অডিও সারাংশ তৈরি করতে লগ ইন করুন।"
        : uiLanguage === "hi"
          ? "नया ऑडियो सारांश बनाने के लिए लॉग इन करें।"
          : "Log in to generate a new audio summary.",

    retry:
      uiLanguage === "bn"
        ? "আবার চেষ্টা করুন"
        : uiLanguage === "hi"
          ? "फिर कोशिश करें"
          : "Try again",

    comingSoon:
      uiLanguage === "bn"
        ? "শীঘ্রই"
        : uiLanguage === "hi"
          ? "जल्द उपलब्ध"
          : "Coming soon",

  };


  // =======================================================
  // WRITING ID
  // =======================================================

  const writingId =
    Number(
      writing?.id
    );


  const hasWritingId =
    Number.isInteger(
      writingId
    ) &&
    writingId > 0;


  // =======================================================
  // LIKE STATE
  // =======================================================

  const [
    likesCount,
    setLikesCount,
  ] = useState(
    safeNumber(
      writing?.likes_count ??
      writing?.likes
    )
  );


  const [
    liked,
    setLiked,
  ] = useState(
    Boolean(
      writing?.liked_by_current_user ??
      writing?.is_liked ??
      writing?.liked ??
      false
    )
  );


  const [
    liking,
    setLiking,
  ] = useState(
    false
  );


  // =======================================================
  // REPOST STATE
  // =======================================================

  const [
    repostsCount,
    setRepostsCount,
  ] = useState(
    safeNumber(
      writing?.reposts_count ??
      writing?.repost_count ??
      0
    )
  );


  const [
    reposted,
    setReposted,
  ] = useState(
    Boolean(
      writing?.reposted_by_me ??
      writing?.reposted_by_current_user ??
      writing?.is_reposted ??
      writing?.reposted ??
      false
    )
  );


  const [
    reposting,
    setReposting,
  ] = useState(
    false
  );


  const [
    repostMenuOpen,
    setRepostMenuOpen,
  ] = useState(
    false
  );


  // =======================================================
  // SAVE STATE
  // =======================================================

  const [
    saved,
    setSaved,
  ] = useState(
    Boolean(
      writing?.saved_by_current_user ??
      writing?.is_saved ??
      writing?.saved ??
      false
    )
  );


  const [
    saving,
    setSaving,
  ] = useState(
    false
  );


  const [
    saveStatusLoaded,
    setSaveStatusLoaded,
  ] = useState(
    false
  );


  // =======================================================
  // SHARE STATE
  // =======================================================

  const [
    sharesCount,
    setSharesCount,
  ] = useState(
    safeNumber(
      writing?.shares_count ??
      writing?.share_count ??
      0
    )
  );


  const [
    shareState,
    setShareState,
  ] = useState(
    "idle"
  );


  // =======================================================
  // MORE MENU
  // =======================================================

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(
    false
  );


  // =======================================================
  // AUDIO SUMMARY STATE
  // =======================================================

  const [
    audioPanelOpen,
    setAudioPanelOpen,
  ] = useState(
    false
  );


  const [
    audioLanguages,
    setAudioLanguages,
  ] = useState(
    []
  );


  const [
    audioLanguagesLoading,
    setAudioLanguagesLoading,
  ] = useState(
    false
  );


  const [
    selectedAudioLanguage,
    setSelectedAudioLanguage,
  ] = useState(
    ""
  );


  // idle
  // checking
  // missing
  // generating
  // ready
  // error

  const [
    audioStatus,
    setAudioStatus,
  ] = useState(
    "idle"
  );


  const [
    audioSummary,
    setAudioSummary,
  ] = useState(
    null
  );


  const [
    audioError,
    setAudioError,
  ] = useState(
    ""
  );


  const [
    audioWasCached,
    setAudioWasCached,
  ] = useState(
    false
  );


  // =======================================================
  // SYNC LIKE STATE
  // =======================================================

  useEffect(
    () => {

      setLikesCount(
        safeNumber(
          writing?.likes_count ??
          writing?.likes
        )
      );


      setLiked(
        Boolean(
          writing?.liked_by_current_user ??
          writing?.is_liked ??
          writing?.liked ??
          false
        )
      );

    },
    [
      writing?.id,
      writing?.likes_count,
      writing?.likes,
      writing?.liked_by_current_user,
      writing?.is_liked,
      writing?.liked,
    ]
  );


  // =======================================================
  // SYNC REPOST STATE
  // =======================================================

  useEffect(
    () => {

      setRepostsCount(
        safeNumber(
          writing?.reposts_count ??
          writing?.repost_count ??
          0
        )
      );


      setReposted(
        Boolean(
          writing?.reposted_by_me ??
          writing?.reposted_by_current_user ??
          writing?.is_reposted ??
          writing?.reposted ??
          false
        )
      );


      setReposting(
        false
      );

    },
    [
      writing?.id,
      writing?.reposts_count,
      writing?.repost_count,
      writing?.reposted_by_me,
      writing?.reposted_by_current_user,
      writing?.is_reposted,
      writing?.reposted,
    ]
  );


  // =======================================================
  // SYNC SHARE COUNT
  // =======================================================

  useEffect(
    () => {

      setSharesCount(
        safeNumber(
          writing?.shares_count ??
          writing?.share_count ??
          0
        )
      );

    },
    [
      writing?.id,
      writing?.shares_count,
      writing?.share_count,
    ]
  );


  // =======================================================
  // SYNC SAVE STATE
  // =======================================================

  useEffect(
    () => {

      setSaved(
        Boolean(
          writing?.saved_by_current_user ??
          writing?.is_saved ??
          writing?.saved ??
          false
        )
      );


      setSaveStatusLoaded(
        false
      );

    },
    [
      writing?.id,
      writing?.saved_by_current_user,
      writing?.is_saved,
      writing?.saved,
    ]
  );


  // =======================================================
  // RESET AUDIO WHEN CARD CHANGES
  // =======================================================
  //
  // This is important when React reuses the component.
  //
  // No listener language is carried from one WritingCard
  // writing to another.
  //
  // =======================================================

  useEffect(
    () => {

      audioRequestIdRef.current +=
        1;


      setAudioPanelOpen(
        false
      );


      setSelectedAudioLanguage(
        ""
      );


      setAudioStatus(
        "idle"
      );


      setAudioSummary(
        null
      );


      setAudioError(
        ""
      );


      setAudioWasCached(
        false
      );

    },
    [
      writingId,
    ]
  );


  // =======================================================
  // LOAD SAVED STATUS
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function loadSavedStatus() {

        if (
          !hasWritingId
        ) {

          if (
            !cancelled
          ) {

            setSaveStatusLoaded(
              true
            );
          }


          return;
        }


        if (
          !getToken()
        ) {

          if (
            !cancelled
          ) {

            setSaved(
              false
            );


            setSaveStatusLoaded(
              true
            );
          }


          return;
        }


        try {

          const data =
            await getSavedWritingStatus(
              writingId
            );


          if (
            !cancelled
          ) {

            setSaved(
              Boolean(
                data?.saved ??
                data?.is_saved ??
                false
              )
            );
          }

        } catch (
          error
        ) {

          if (
            !cancelled
          ) {

            console.error(
              "GET SAVED STATUS ERROR:",
              error
            );
          }

        } finally {

          if (
            !cancelled
          ) {

            setSaveStatusLoaded(
              true
            );
          }
        }
      }


      loadSavedStatus();


      return () => {

        cancelled =
          true;
      };

    },
    [
      hasWritingId,
      writingId,
    ]
  );


  // =======================================================
  // LOAD AUDIO LANGUAGE LIST
  // =======================================================

  useEffect(
    () => {

      let cancelled =
        false;


      if (
        !audioPanelOpen
      ) {

        return undefined;
      }


      if (
        audioLanguages.length >
        0
      ) {

        return undefined;
      }


      async function loadLanguages() {

        setAudioLanguagesLoading(
          true
        );


        setAudioError(
          ""
        );


        try {

          const languages =
            await loadSharedAudioLanguages();


          if (
            cancelled
          ) {

            return;
          }


          setAudioLanguages(
            languages
          );

        } catch (
          error
        ) {

          if (
            cancelled
          ) {

            return;
          }


          console.error(
            "AUDIO LANGUAGE LOAD ERROR:",
            error
          );


          setAudioError(
            error?.message ||
            labels.audioLoadFailed
          );

        } finally {

          if (
            !cancelled
          ) {

            setAudioLanguagesLoading(
              false
            );
          }
        }
      }


      loadLanguages();


      return () => {

        cancelled =
          true;
      };

    },
    [
      audioPanelOpen,
      audioLanguages.length,
    ]
  );


  // =======================================================
  // CLOSE MENUS ON OUTSIDE CLICK
  // =======================================================

  useEffect(
    () => {

      function handleDocumentPointerDown(
        event
      ) {

        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
        ) {

          setMenuOpen(
            false
          );
        }


        if (
          repostMenuRef.current &&
          !repostMenuRef.current.contains(
            event.target
          )
        ) {

          setRepostMenuOpen(
            false
          );
        }
      }


      if (
        typeof document !==
        "undefined"
      ) {

        document.addEventListener(
          "pointerdown",
          handleDocumentPointerDown
        );
      }


      return () => {

        if (
          typeof document !==
          "undefined"
        ) {

          document.removeEventListener(
            "pointerdown",
            handleDocumentPointerDown
          );
        }
      };

    },
    []
  );


  // =======================================================
  // SHARE TIMER CLEANUP
  // =======================================================

  useEffect(
    () => {

      return () => {

        if (
          shareResetTimerRef.current &&
          typeof window !==
            "undefined"
        ) {

          window.clearTimeout(
            shareResetTimerRef.current
          );
        }
      };

    },
    []
  );


  // =======================================================
  // COMMENT COUNT
  // =======================================================

  const commentsCount =
    safeNumber(
      writing?.comments_count ??
      (
        Array.isArray(
          writing?.comments
        )
          ? writing.comments.length
          : writing?.comments
      )
    );


  // =======================================================
  // CATEGORY
  // =======================================================

  function getCategoryLabel(
    value
  ) {

    const map = {

      "কবিতা":
        translate(
          "categories.poetry",
          "কবিতা",
          "Poetry",
          "कविता"
        ),

      "গল্প":
        translate(
          "categories.story",
          "গল্প",
          "Story",
          "कहानी"
        ),

      "অনুভূতি":
        translate(
          "categories.reflection",
          "অনুভূতি",
          "Reflection",
          "अनुभूति"
        ),

      "প্রবন্ধ":
        translate(
          "categories.essay",
          "প্রবন্ধ",
          "Essay",
          "निबंध"
        ),

      "অন্যান্য":
        translate(
          "categories.other",
          "অন্যান্য",
          "Other",
          "अन्य"
        ),

    };


    return (
      map[value] ||
      value ||
      map["অন্যান্য"]
    );
  }


  // =======================================================
  // AUTHOR
  // =======================================================

  const authorId =
    Number(
      writing?.author?.id ??
      writing?.user?.id ??
      writing?.user_id ??
      writing?.author_id ??
      0
    );


  const hasAuthorId =
    Number.isInteger(
      authorId
    ) &&
    authorId > 0;


  const authorName =
    writing?.author?.name ||
    writing?.user?.name ||
    writing?.author_name ||
    writing?.user_name ||
    labels.unknownAuthor;


  const authorUsername =
    String(
      writing?.author?.username ||
      writing?.user?.username ||
      writing?.author_username ||
      writing?.username ||
      ""
    )
      .trim()
      .replace(
        /^@+/,
        ""
      );


  const authorAvatar =
    writing?.author?.avatar_url ||
    writing?.user?.avatar_url ||
    writing?.author_avatar_url ||
    writing?.avatar_url ||
    "";


  const authorInitials =
    getInitials(
      authorName ||
      authorUsername
    );


  // =======================================================
  // LANGUAGE / CATEGORY
  // =======================================================

  const writingLanguageCode =
    writing?.language ||
    "bn";


  const languageLabel =
    getLanguageLabel(
      writingLanguageCode
    );


  const category =
    getCategoryLabel(
      writing?.category
    );


  // =======================================================
  // TAGS
  // =======================================================

  const tags =
    useMemo(
      () => {

        const collected =
          [];


        if (
          Array.isArray(
            writing?.tags
          )
        ) {

          writing.tags.forEach(
            (
              tag
            ) => {

              if (
                typeof tag ===
                "string"
              ) {

                collected.push({
                  name:
                    tag,
                });

              } else if (
                tag &&
                typeof tag ===
                "object"
              ) {

                collected.push({

                  id:
                    tag.id,

                  name:
                    tag.name ||
                    tag.hashtag ||
                    "",

                });
              }
            }
          );
        }


        if (
          collected.length ===
            0 &&
          Array.isArray(
            writing?.hashtags
          )
        ) {

          writing.hashtags.forEach(
            (
              hashtag
            ) => {

              collected.push({
                name:
                  hashtag,
              });
            }
          );
        }


        const seen =
          new Set();


        return collected
          .map(
            (
              tag
            ) => {

              const name =
                String(
                  tag?.name ||
                  ""
                )
                  .trim()
                  .replace(
                    /^#+/,
                    ""
                  )
                  .trim();


              if (
                !name
              ) {

                return null;
              }


              const key =
                name
                  .toLocaleLowerCase();


              if (
                seen.has(
                  key
                )
              ) {

                return null;
              }


              seen.add(
                key
              );


              return {

                id:
                  tag?.id ||
                  null,

                name,

              };
            }
          )
          .filter(Boolean)
          .slice(
            0,
            6
          );

      },
      [
        writing?.tags,
        writing?.hashtags,
      ]
    );


  // =======================================================
  // PREVIEW
  // =======================================================

  const preview =
    useMemo(
      () => {

        const text =
          String(
            writing?.content ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim();


        if (
          !text
        ) {

          return (
            labels.previewUnavailable
          );
        }


        if (
          text.length <=
          320
        ) {

          return text;
        }


        return (
          `${text
            .slice(
              0,
              320
            )
            .trim()}…`
        );

      },
      [
        writing?.content,
        labels.previewUnavailable,
      ]
    );


  // =======================================================
  // WORD COUNT
  // =======================================================

  const wordCount =
    useMemo(
      () => {

        const content =
          String(
            writing?.content ||
            ""
          ).trim();


        if (
          !content
        ) {

          return 0;
        }


        return content
          .split(
            /\s+/
          )
          .filter(Boolean)
          .length;

      },
      [
        writing?.content,
      ]
    );


  // =======================================================
  // READING TIME
  // =======================================================

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        wordCount /
        180
      )
    );


  // =======================================================
  // DATE
  // =======================================================

  const publishedValue =
    writing?.published_at ||
    writing?.created_at;


  function formatDate(
    value
  ) {

    if (
      !value
    ) {

      return "";
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";
    }


    try {

      return new Intl.DateTimeFormat(

        uiLanguage === "bn"
          ? "bn-IN"
          : uiLanguage === "hi"
            ? "hi-IN"
            : "en-IN",

        {
          day:
            "numeric",

          month:
            "short",

          year:
            "numeric",
        }

      ).format(
        date
      );

    } catch {

      return (
        date.toLocaleDateString()
      );
    }
  }


  function formatRelativeTime(
    value
  ) {

    if (
      !value
    ) {

      return "";
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";
    }


    const difference =
      date.getTime() -
      Date.now();


    const absolute =
      Math.abs(
        difference
      );


    const minute =
      60 *
      1000;


    const hour =
      60 *
      minute;


    const day =
      24 *
      hour;


    const week =
      7 *
      day;


    let valueNumber;
    let unit;


    if (
      absolute <
      hour
    ) {

      valueNumber =
        Math.round(
          difference /
          minute
        );

      unit =
        "minute";

    } else if (
      absolute <
      day
    ) {

      valueNumber =
        Math.round(
          difference /
          hour
        );

      unit =
        "hour";

    } else if (
      absolute <
      week
    ) {

      valueNumber =
        Math.round(
          difference /
          day
        );

      unit =
        "day";

    } else {

      return formatDate(
        value
      );
    }


    if (
      valueNumber ===
      0
    ) {

      if (
        uiLanguage ===
        "bn"
      ) {

        return "এইমাত্র";
      }


      if (
        uiLanguage ===
        "hi"
      ) {

        return "अभी";
      }


      return "just now";
    }


    try {

      return new Intl.RelativeTimeFormat(

        uiLanguage === "bn"
          ? "bn"
          : uiLanguage === "hi"
            ? "hi"
            : "en",

        {
          numeric:
            "auto",
        }

      ).format(
        valueNumber,
        unit
      );

    } catch {

      return formatDate(
        value
      );
    }
  }


  const publishedDate =
    formatDate(
      publishedValue
    );


  const relativePublishedDate =
    formatRelativeTime(
      publishedValue
    );


  // =======================================================
  // AUDIO HELPERS
  // =======================================================

  const selectedAudioLanguageConfig =
    useMemo(
      () => {

        return (
          audioLanguages.find(
            (
              item
            ) =>
              item?.code ===
              selectedAudioLanguage
          ) ||
          null
        );

      },
      [
        audioLanguages,
        selectedAudioLanguage,
      ]
    );


  // =======================================================
  // AUDIO PANEL TOGGLE
  // =======================================================

  function handleAudioPanelToggle(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    setAudioPanelOpen(
      (
        current
      ) =>
        !current
    );
  }


  // =======================================================
  // AUDIO LANGUAGE CHANGE
  // =======================================================

  async function handleAudioLanguageChange(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    const nextLanguage =
      String(
        event.target.value ||
        ""
      )
        .trim()
        .toLowerCase();


    audioRequestIdRef.current +=
      1;


    const requestId =
      audioRequestIdRef.current;


    setSelectedAudioLanguage(
      nextLanguage
    );


    setAudioSummary(
      null
    );


    setAudioError(
      ""
    );


    setAudioWasCached(
      false
    );


    if (
      !nextLanguage
    ) {

      setAudioStatus(
        "idle"
      );


      return;
    }


    const config =
      audioLanguages.find(
        (
          item
        ) =>
          item?.code ===
          nextLanguage
      );


    if (
      config &&
      config.tts_supported ===
        false
    ) {

      setAudioStatus(
        "error"
      );


      setAudioError(
        `${config.native_name || config.name}: ${labels.audioUnavailable}`
      );


      return;
    }


    setAudioStatus(
      "checking"
    );


    try {

      const result =
        await getCachedAudioSummary(
          writingId,
          nextLanguage
        );


      if (
        requestId !==
        audioRequestIdRef.current
      ) {

        return;
      }


      if (
        result?.cached &&
        result?.audio_summary?.audio_url
      ) {

        setAudioSummary(
          result.audio_summary
        );


        setAudioWasCached(
          true
        );


        setAudioStatus(
          "ready"
        );


        return;
      }


      setAudioStatus(
        "missing"
      );

    } catch (
      error
    ) {

      if (
        requestId !==
        audioRequestIdRef.current
      ) {

        return;
      }


      console.error(
        "CHECK AUDIO SUMMARY ERROR:",
        error
      );


      setAudioError(
        error?.message ||
        labels.audioLoadFailed
      );


      setAudioStatus(
        "error"
      );
    }
  }


  // =======================================================
  // GENERATE AUDIO SUMMARY
  // =======================================================

  async function handleGenerateAudioSummary(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      !selectedAudioLanguage ||
      audioStatus ===
        "generating"
    ) {

      return;
    }


    if (
      selectedAudioLanguageConfig &&
      selectedAudioLanguageConfig
        .tts_supported ===
        false
    ) {

      setAudioError(
        labels.audioUnavailable
      );


      setAudioStatus(
        "error"
      );


      return;
    }


    if (
      !getToken()
    ) {

      setAudioError(
        labels.loginForAudio
      );


      navigate(
        "/login"
      );


      return;
    }


    audioRequestIdRef.current +=
      1;


    const requestId =
      audioRequestIdRef.current;


    setAudioStatus(
      "generating"
    );


    setAudioSummary(
      null
    );


    setAudioError(
      ""
    );


    setAudioWasCached(
      false
    );


    try {

      const result =
        await generateAudioSummary(
          writingId,
          selectedAudioLanguage
        );


      if (
        requestId !==
        audioRequestIdRef.current
      ) {

        return;
      }


      const summary =
        result?.audio_summary;


      if (
        !summary?.audio_url
      ) {

        throw new Error(
          labels.audioGenerationFailed
        );
      }


      setAudioSummary(
        summary
      );


      setAudioWasCached(
        Boolean(
          result?.cached
        )
      );


      setAudioStatus(
        "ready"
      );

    } catch (
      error
    ) {

      if (
        requestId !==
        audioRequestIdRef.current
      ) {

        return;
      }


      console.error(
        "GENERATE AUDIO SUMMARY ERROR:",
        error
      );


      if (
        Number(
          error?.status
        ) ===
        401
      ) {

        setAudioError(
          labels.loginForAudio
        );


        navigate(
          "/login"
        );


        return;
      }


      setAudioError(
        error?.message ||
        labels.audioGenerationFailed
      );


      setAudioStatus(
        "error"
      );
    }
  }


  // =======================================================
  // RETRY AUDIO
  // =======================================================

  async function handleRetryAudio(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !selectedAudioLanguage
    ) {

      setAudioStatus(
        "idle"
      );


      setAudioError(
        ""
      );


      return;
    }


    await handleGenerateAudioSummary(
      event
    );
  }


  // =======================================================
  // LIKE
  // =======================================================

  async function handleLike(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      liking
    ) {

      return;
    }


    if (
      !getToken()
    ) {

      navigate(
        "/login"
      );


      return;
    }


    const previousLiked =
      liked;


    const previousCount =
      likesCount;


    const nextLiked =
      !previousLiked;


    setLiked(
      nextLiked
    );


    setLikesCount(
      Math.max(
        0,
        previousCount +
        (
          previousLiked
            ? -1
            : 1
        )
      )
    );


    setLiking(
      true
    );


    try {

      const data =
        await toggleLike(
          writingId,
          previousLiked
        );


      const serverLiked =
        data?.liked ??
        data?.is_liked ??
        data?.liked_by_current_user;


      if (
        typeof serverLiked ===
        "boolean"
      ) {

        setLiked(
          serverLiked
        );
      }


      const serverCount =
        data?.likes_count ??
        data?.writing?.likes_count ??
        data?.likes;


      if (
        Number.isFinite(
          Number(
            serverCount
          )
        )
      ) {

        setLikesCount(
          safeNumber(
            serverCount
          )
        );
      }

    } catch (
      error
    ) {

      setLiked(
        previousLiked
      );


      setLikesCount(
        previousCount
      );


      console.error(
        "LIKE WRITING ERROR:",
        error
      );

    } finally {

      setLiking(
        false
      );
    }
  }


  // =======================================================
  // SAVE
  // =======================================================

  async function handleSave(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      saving ||
      !saveStatusLoaded
    ) {

      return;
    }


    if (
      !getToken()
    ) {

      navigate(
        "/login"
      );


      return;
    }


    const previousSaved =
      saved;


    const nextSaved =
      !previousSaved;


    setSaved(
      nextSaved
    );


    setSaving(
      true
    );


    try {

      const data =
        previousSaved
          ? await unsaveWriting(
              writingId
            )
          : await saveWriting(
              writingId
            );


      const serverSaved =
        data?.saved ??
        data?.is_saved;


      if (
        typeof serverSaved ===
        "boolean"
      ) {

        setSaved(
          serverSaved
        );
      }

    } catch (
      error
    ) {

      setSaved(
        previousSaved
      );


      console.error(
        "SAVE WRITING ERROR:",
        error
      );

    } finally {

      setSaving(
        false
      );
    }
  }


  // =======================================================
  // REPOST MENU
  // =======================================================

  function handleRepostMenuToggle(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      reposting
    ) {

      return;
    }


    if (
      !getToken()
    ) {

      navigate(
        "/login"
      );


      return;
    }


    setMenuOpen(
      false
    );


    setRepostMenuOpen(
      (
        current
      ) =>
        !current
    );
  }


  // =======================================================
  // REPOST / REMOVE REPOST
  // =======================================================

  async function handleRepostAction(
    event,
    shouldRepost
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      reposting
    ) {

      return;
    }


    if (
      !getToken()
    ) {

      navigate(
        "/login"
      );


      return;
    }


    if (
      shouldRepost ===
      reposted
    ) {

      setRepostMenuOpen(
        false
      );


      return;
    }


    const previousReposted =
      reposted;


    const previousCount =
      repostsCount;


    setReposted(
      shouldRepost
    );


    setRepostsCount(
      Math.max(
        0,
        previousCount +
        (
          shouldRepost
            ? 1
            : -1
        )
      )
    );


    setReposting(
      true
    );


    setRepostMenuOpen(
      false
    );


    try {

      const data =
        shouldRepost
          ? await repostWriting(
              writingId
            )
          : await unrepostWriting(
              writingId
            );


      const serverReposted =
        data?.reposted ??
        data?.reposted_by_me ??
        data?.reposted_by_current_user ??
        data?.is_reposted;


      if (
        typeof serverReposted ===
        "boolean"
      ) {

        setReposted(
          serverReposted
        );
      }


      if (
        Number.isFinite(
          Number(
            data?.reposts_count
          )
        )
      ) {

        setRepostsCount(
          safeNumber(
            data.reposts_count
          )
        );
      }


      if (
        typeof window !==
        "undefined"
      ) {

        window.dispatchEvent(

          new CustomEvent(
            "shobdo:repost-changed",
            {

              detail: {

                writingId,

                reposted:
                  typeof serverReposted ===
                  "boolean"
                    ? serverReposted
                    : shouldRepost,

              },

            }
          )

        );
      }

    } catch (
      error
    ) {

      setReposted(
        previousReposted
      );


      setRepostsCount(
        previousCount
      );


      console.error(
        "REPOST WRITING ERROR:",
        error
      );

    } finally {

      setReposting(
        false
      );
    }
  }


  // =======================================================
  // SHARE FEEDBACK RESET
  // =======================================================

  function resetShareStateLater() {

    if (
      shareResetTimerRef.current &&
      typeof window !==
        "undefined"
    ) {

      window.clearTimeout(
        shareResetTimerRef.current
      );
    }


    if (
      typeof window ===
      "undefined"
    ) {

      return;
    }


    shareResetTimerRef.current =
      window.setTimeout(
        () => {

          setShareState(
            "idle"
          );


          shareResetTimerRef.current =
            null;

        },
        2200
      );
  }


  // =======================================================
  // RECORD SUCCESSFUL SHARE
  // =======================================================

  async function recordSuccessfulShare() {

    if (
      !hasWritingId
    ) {

      return;
    }


    try {

      const data =
        await recordWritingShare(
          writingId
        );


      const serverCount =
        Number(
          data?.shares_count ??
          data?.share_count
        );


      if (
        Number.isFinite(
          serverCount
        )
      ) {

        setSharesCount(
          safeNumber(
            serverCount
          )
        );

      } else {

        setSharesCount(
          (
            currentCount
          ) =>
            currentCount + 1
        );
      }

    } catch (
      error
    ) {

      console.warn(
        "RECORD WRITING SHARE ERROR:",
        error
      );
    }
  }


  // =======================================================
  // COPY SHARE URL
  // =======================================================

  async function copyShareUrl(
    url,
    {
      record = true,
    } = {}
  ) {

    const copied =
      await copyText(
        url
      );


    if (
      !copied
    ) {

      throw new Error(
        "Unable to copy link."
      );
    }


    setShareState(
      "copied"
    );


    if (
      record
    ) {

      void recordSuccessfulShare();
    }


    resetShareStateLater();
  }


  // =======================================================
  // SHARE
  // =======================================================

  async function handleShare(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      shareState ===
        "sharing"
    ) {

      return;
    }


    const shareUrl =
      getWritingShareUrl(
        writingId
      );


    const shareTitle =
      String(
        writing?.title ||
        labels.untitled
      ).trim();


    const shareText =
      uiLanguage === "bn"
        ? `${authorName}-এর "${shareTitle}" লেখাটি SHOBDO-তে পড়ুন।`
        : uiLanguage === "hi"
          ? `${authorName} की "${shareTitle}" रचना SHOBDO पर पढ़ें।`
          : `Read "${shareTitle}" by ${authorName} on SHOBDO.`;


    setShareState(
      "sharing"
    );


    if (
      typeof navigator !==
        "undefined" &&
      typeof navigator.share ===
        "function"
    ) {

      try {

        await navigator.share({

          title:
            `${shareTitle} — SHOBDO`,

          text:
            shareText,

          url:
            shareUrl,

        });


        setShareState(
          "shared"
        );


        void recordSuccessfulShare();


        resetShareStateLater();


        return;

      } catch (
        error
      ) {

        if (
          error?.name ===
          "AbortError"
        ) {

          setShareState(
            "idle"
          );


          return;
        }
      }
    }


    try {

      await copyShareUrl(
        shareUrl
      );

    } catch (
      error
    ) {

      console.error(
        "SHARE WRITING ERROR:",
        error
      );


      setShareState(
        "error"
      );


      resetShareStateLater();
    }
  }


  // =======================================================
  // COPY LINK FROM MORE MENU
  // =======================================================

  async function handleMenuCopyLink(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId
    ) {

      return;
    }


    setMenuOpen(
      false
    );


    try {

      await copyShareUrl(
        getWritingShareUrl(
          writingId
        )
      );

    } catch (
      error
    ) {

      console.error(
        "COPY WRITING LINK ERROR:",
        error
      );


      setShareState(
        "error"
      );


      resetShareStateLater();
    }
  }


  // =======================================================
  // SHARE DISPLAY STATE
  // =======================================================

  const shareSuccessful =
    shareState ===
      "shared" ||
    shareState ===
      "copied";


  const shareLabel =
    shareState ===
    "shared"
      ? labels.shared
      : shareState ===
        "copied"
        ? labels.copied
        : shareState ===
          "error"
          ? labels.shareFailed
          : labels.share;


  // =======================================================
  // INVALID WRITING
  // =======================================================

  if (
    !hasWritingId
  ) {

    return null;
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <article
      className="writing-card"
    >

      {/* =================================================
          AUTHOR HEADER
      ================================================== */}

      <header
        className="writing-card-header"
      >

        <div
          className="writing-author-section"
        >

          <div
            className="writing-author-avatar"
            aria-hidden="true"
          >

            {authorAvatar
              ? (

                <img
                  src={
                    authorAvatar
                  }
                  alt=""
                  loading="lazy"
                />

              )
              : authorInitials
                ? (

                  <span>
                    {authorInitials}
                  </span>

                )
                : (

                  <User
                    size={18}
                  />

                )}

          </div>


          <div
            className="writing-author-content"
          >

            <div
              className="writing-author-primary"
            >

              {hasAuthorId
                ? (

                  <Link
                    to={
                      `/users/${authorId}`
                    }
                    className="writing-author-name"
                  >
                    {authorName}
                  </Link>

                )
                : (

                  <strong
                    className="writing-author-name"
                  >
                    {authorName}
                  </strong>

                )}


              {authorUsername && (

                <span
                  className="writing-author-username"
                >
                  @{authorUsername}
                </span>

              )}

            </div>


            <div
              className="writing-author-secondary"
            >

              <span>
                {labels.writer}
              </span>


              {relativePublishedDate && (

                <>

                  <span
                    className="writing-meta-dot"
                  >
                    ·
                  </span>

                  <time
                    title={
                      publishedDate
                    }
                  >
                    {
                      relativePublishedDate
                    }
                  </time>

                </>

              )}

            </div>

          </div>

        </div>


        {/* ===============================================
            MORE MENU
        ================================================ */}

        <div
          className="writing-more-menu"
          ref={
            menuRef
          }
        >

          <button
            type="button"
            className={
              menuOpen
                ? "writing-more-button active"
                : "writing-more-button"
            }
            aria-label={
              labels.more
            }
            aria-expanded={
              menuOpen
            }
            onClick={
              (
                event
              ) => {

                event.preventDefault();

                event.stopPropagation();


                setRepostMenuOpen(
                  false
                );


                setMenuOpen(
                  (
                    current
                  ) =>
                    !current
                );
              }
            }
          >

            <MoreHorizontal
              size={20}
            />

          </button>


          {menuOpen && (

            <div
              className="writing-more-dropdown"
            >

              <button
                type="button"
                onClick={
                  (
                    event
                  ) => {

                    event.preventDefault();

                    event.stopPropagation();


                    setMenuOpen(
                      false
                    );


                    navigate(
                      `/writings/${writingId}`
                    );
                  }
                }
              >

                <BookOpen
                  size={16}
                />

                <span>
                  {labels.openPost}
                </span>

              </button>


              <button
                type="button"
                onClick={
                  handleMenuCopyLink
                }
              >

                <Copy
                  size={16}
                />

                <span>
                  {labels.copyLink}
                </span>

              </button>

            </div>

          )}

        </div>

      </header>


      {/* =================================================
          BADGES
      ================================================== */}

      <div
        className="writing-card-badges"
      >

        <span
          className="writing-language-badge"
        >

          <Globe2
            size={12}
          />

          <span>
            {languageLabel}
          </span>

        </span>


        <span
          className="writing-category-badge"
        >
          {category}
        </span>

      </div>


      {/* =================================================
          TITLE
      ================================================== */}

      <Link
        to={
          `/writings/${writingId}`
        }
        className="writing-card-title-link"
      >

        <h2
          className="writing-card-title"
        >
          {
            writing?.title ||
            labels.untitled
          }
        </h2>

      </Link>


      {/* =================================================
          PREVIEW
      ================================================== */}

      <p
        className="writing-card-preview"
      >
        {preview}
      </p>


      {/* =================================================
          TAGS
      ================================================== */}

      {tags.length >
        0 && (

        <div
          className="writing-card-tags"
        >

          {tags.map(
            (
              tag
            ) => (

              <Link
                key={
                  tag.id ||
                  tag.name
                }
                to={
                  `/tag/${encodeURIComponent(
                    tag.name
                  )}`
                }
                className="writing-card-tag"
              >

                <Hash
                  size={12}
                />

                <span>
                  {tag.name}
                </span>

              </Link>

            )
          )}

        </div>

      )}


      {/* =================================================
          READING META
      ================================================== */}

      <div
        className="writing-card-meta"
      >

        {publishedDate && (

          <span>

            <CalendarDays
              size={14}
            />

            <span>
              {publishedDate}
            </span>

          </span>

        )}


        <span>

          <Clock3
            size={14}
          />

          <span>
            {readingTime}
            {" "}
            {labels.minutes}
          </span>

        </span>


        <span>

          <BookOpen
            size={14}
          />

          <span>
            {wordCount}
            {" "}
            {labels.words}
          </span>

        </span>

      </div>


      {/* =================================================
          AI MULTILINGUAL AUDIO SUMMARY
      ================================================== */}

      <section
        style={
          audioStyles.shell
        }
        aria-label={
          labels.audioSummary
        }
      >

        <button
          type="button"
          style={
            audioStyles.toggle
          }
          onClick={
            handleAudioPanelToggle
          }
          aria-expanded={
            audioPanelOpen
          }
        >

          <span
            style={
              audioStyles.toggleMain
            }
          >

            <span
              style={
                audioStyles.iconBubble
              }
            >

              <Headphones
                size={18}
                strokeWidth={1.9}
              />

            </span>


            <span
              style={
                audioStyles.toggleText
              }
            >

              <span
                style={
                  audioStyles.title
                }
              >
                {labels.audioSummary}
              </span>

              <span
                style={
                  audioStyles.subtitle
                }
              >
                {labels.audioDescription}
              </span>

            </span>

          </span>


          <span
            style={
              audioStyles.badge
            }
          >
            AI
          </span>

        </button>


        {audioPanelOpen && (

          <div
            style={
              audioStyles.body
            }
          >

            <div
              style={
                audioStyles.divider
              }
            />


            <label>

              <span
                style={
                  audioStyles.label
                }
              >
                {labels.chooseLanguage}
              </span>


              <select
                value={
                  selectedAudioLanguage
                }
                onChange={
                  handleAudioLanguageChange
                }
                disabled={
                  audioLanguagesLoading ||
                  audioStatus ===
                    "generating"
                }
                style={
                  audioStyles.select
                }
              >

                <option
                  value=""
                >
                  {
                    audioLanguagesLoading
                      ? labels.loadingLanguages
                      : labels.chooseLanguageOption
                  }
                </option>


                {audioLanguages.map(
                  (
                    item
                  ) => (

                    <option
                      key={
                        item.code
                      }
                      value={
                        item.code
                      }
                      disabled={
                        item.tts_supported ===
                        false
                      }
                    >
                      {
                        `${item.native_name || item.name} — ${item.name}${
                          item.tts_supported === false
                            ? ` (${labels.comingSoon})`
                            : ""
                        }`
                      }
                    </option>

                  )
                )}

              </select>

            </label>


            {/* ===========================================
                CHECKING CACHE
            ============================================ */}

            {audioStatus ===
              "checking" && (

              <div
                style={
                  audioStyles.status
                }
              >

                <LoaderCircle
                  size={16}
                  className="spin"
                />

                <span>
                  {labels.checkingAudio}
                </span>

              </div>

            )}


            {/* ===========================================
                NOT GENERATED YET
            ============================================ */}

            {audioStatus ===
              "missing" && (

              <>

                <div
                  style={
                    audioStyles.status
                  }
                >

                  <Sparkles
                    size={16}
                  />

                  <span>
                    {labels.noCachedAudio}
                  </span>

                </div>


                <button
                  type="button"
                  style={
                    audioStyles.button
                  }
                  onClick={
                    handleGenerateAudioSummary
                  }
                >

                  <Sparkles
                    size={16}
                  />

                  <span>
                    {labels.generateAudio}
                  </span>

                </button>

              </>

            )}


            {/* ===========================================
                GENERATING
            ============================================ */}

            {audioStatus ===
              "generating" && (

              <>

                <div
                  style={
                    audioStyles.status
                  }
                >

                  <LoaderCircle
                    size={16}
                    className="spin"
                  />

                  <span>
                    {labels.generatingAudio}
                  </span>

                </div>


                <button
                  type="button"
                  disabled
                  style={{
                    ...audioStyles.button,
                    ...audioStyles.buttonDisabled,
                  }}
                >

                  <LoaderCircle
                    size={16}
                    className="spin"
                  />

                  <span>
                    {labels.generatingAudio}
                  </span>

                </button>

              </>

            )}


            {/* ===========================================
                READY
            ============================================ */}

            {audioStatus ===
              "ready" &&
              audioSummary?.audio_url && (

              <>

                <div
                  style={
                    audioStyles.status
                  }
                >

                  <Check
                    size={16}
                  />

                  <span>
                    {
                      audioWasCached
                        ? labels.cachedAudio
                        : labels.audioReady
                    }
                  </span>

                </div>


                <audio
                  key={
                    audioSummary.audio_url
                  }
                  controls
                  preload="metadata"
                  src={
                    audioSummary.audio_url
                  }
                  style={
                    audioStyles.player
                  }
                >
                  Your browser does not support
                  the audio element.
                </audio>


                {audioSummary?.summary_text && (

                  <details
                    style={
                      audioStyles.summaryDetails
                    }
                  >

                    <summary>
                      {labels.viewSummary}
                    </summary>


                    <p
                      style={
                        audioStyles.summaryText
                      }
                    >
                      {
                        audioSummary.summary_text
                      }
                    </p>

                  </details>

                )}


                <p
                  style={
                    audioStyles.footerNote
                  }
                >
                  {labels.generatedWithAI}
                </p>

              </>

            )}


            {/* ===========================================
                ERROR
            ============================================ */}

            {audioStatus ===
              "error" && (

              <>

                <div
                  style={
                    audioStyles.error
                  }
                >
                  {
                    audioError ||
                    labels.audioLoadFailed
                  }
                </div>


                {selectedAudioLanguage &&
                  selectedAudioLanguageConfig
                    ?.tts_supported !== false && (

                  <button
                    type="button"
                    style={
                      audioStyles.button
                    }
                    onClick={
                      handleRetryAudio
                    }
                  >

                    <Sparkles
                      size={16}
                    />

                    <span>
                      {labels.retry}
                    </span>

                  </button>

                )}

              </>

            )}

          </div>

        )}

      </section>


      {/* =================================================
          SOCIAL ACTION BAR
      ================================================== */}

      <footer
        className="writing-card-footer writing-card-footer--compact"
      >

        <div
          className="writing-card-actions writing-card-actions--icons"
          role="group"
          aria-label={
            uiLanguage === "bn"
              ? "লেখার কার্যক্রম"
              : uiLanguage === "hi"
                ? "रचना क्रियाएँ"
                : "Writing actions"
          }
        >

          {/* =============================================
              LIKE
          ============================================== */}

          <button
            type="button"
            className={
              liked
                ? "writing-action-button writing-like-button active"
                : "writing-action-button writing-like-button"
            }
            onClick={
              handleLike
            }
            disabled={
              liking
            }
            aria-pressed={
              liked
            }
            aria-label={
              `${
                liked
                  ? labels.unlike
                  : labels.like
              } (${likesCount})`
            }
            title={
              `${
                liked
                  ? labels.unlike
                  : labels.like
              } · ${likesCount}`
            }
          >

            <Heart
              size={20}
              strokeWidth={1.9}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
              aria-hidden="true"
            />


            <span
              className="writing-visible-action-count writing-like-count"
              aria-hidden="true"
            >
              {likesCount}
            </span>

          </button>


          {/* =============================================
              COMMENT
          ============================================== */}

          <Link
            to={
              `/writings/${writingId}#comments`
            }
            className="writing-action-button writing-comment-button"
            aria-label={
              `${labels.comment} (${commentsCount})`
            }
            title={
              `${labels.comment} · ${commentsCount}`
            }
          >

            <MessageCircle
              size={20}
              strokeWidth={1.9}
              aria-hidden="true"
            />


            <span
              className="writing-visible-action-count"
              aria-hidden="true"
            >
              {commentsCount}
            </span>

          </Link>


          {/* =============================================
              REPOST
          ============================================== */}

          <div
            className="writing-repost-control"
            ref={
              repostMenuRef
            }
          >

            <button
              type="button"
              className={
                reposted
                  ? "writing-action-button writing-repost-button active"
                  : "writing-action-button writing-repost-button"
              }
              onClick={
                handleRepostMenuToggle
              }
              disabled={
                reposting
              }
              aria-pressed={
                reposted
              }
              aria-expanded={
                repostMenuOpen
              }
              aria-label={
                `${
                  reposted
                    ? labels.unrepost
                    : labels.repost
                } (${repostsCount})`
              }
              title={
                `${
                  reposted
                    ? labels.unrepost
                    : labels.repost
                } · ${repostsCount}`
              }
            >

              <Repeat2
                size={20}
                strokeWidth={1.9}
                aria-hidden="true"
              />


              <span
                className="writing-visible-action-count"
                aria-hidden="true"
              >
                {repostsCount}
              </span>

            </button>


            {repostMenuOpen && (

              <div
                className="writing-repost-popover"
                role="menu"
                aria-label={
                  labels.repost
                }
              >

                {!reposted
                  ? (

                    <button
                      type="button"
                      className="writing-repost-popover-option"
                      onClick={
                        (
                          event
                        ) =>
                          handleRepostAction(
                            event,
                            true
                          )
                      }
                      disabled={
                        reposting
                      }
                      role="menuitem"
                    >

                      <span
                        className="writing-repost-popover-icon"
                      >

                        <Repeat2
                          size={19}
                          strokeWidth={2}
                        />

                      </span>


                      <span
                        className="writing-repost-popover-copy"
                      >

                        <strong>
                          {
                            labels.repostWriting
                          }
                        </strong>

                        <small>
                          {
                            labels.repostDescription
                          }
                        </small>

                      </span>

                    </button>

                  )
                  : (

                    <button
                      type="button"
                      className="writing-repost-popover-option writing-repost-popover-option--remove"
                      onClick={
                        (
                          event
                        ) =>
                          handleRepostAction(
                            event,
                            false
                          )
                      }
                      disabled={
                        reposting
                      }
                      role="menuitem"
                    >

                      <span
                        className="writing-repost-popover-icon"
                      >

                        <Repeat2
                          size={19}
                          strokeWidth={2}
                        />

                      </span>


                      <span
                        className="writing-repost-popover-copy"
                      >

                        <strong>
                          {labels.unrepost}
                        </strong>

                        <small>
                          {
                            labels.removeRepostDescription
                          }
                        </small>

                      </span>

                    </button>

                  )}

              </div>

            )}

          </div>


          {/* =============================================
              SHARE
          ============================================== */}

          <button
            type="button"
            className={[
              "writing-action-button",
              "writing-share-button",

              shareSuccessful
                ? "success"
                : "",

              shareState ===
              "error"
                ? "error"
                : "",

            ]
              .filter(Boolean)
              .join(" ")
            }
            onClick={
              handleShare
            }
            disabled={
              shareState ===
              "sharing"
            }
            aria-label={
              `${shareLabel} (${sharesCount})`
            }
            title={
              `${shareLabel} · ${sharesCount}`
            }
          >

            {shareSuccessful
              ? (

                <Check
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                />

              )
              : (

                <Share2
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />

              )}


            <span
              className="writing-visible-action-count"
              aria-hidden="true"
            >
              {sharesCount}
            </span>

          </button>


          {/* =============================================
              SAVE
          ============================================== */}

          <button
            type="button"
            className={
              saved
                ? "writing-action-button writing-save-button active"
                : "writing-action-button writing-save-button"
            }
            onClick={
              handleSave
            }
            disabled={
              saving ||
              !saveStatusLoaded
            }
            aria-pressed={
              saved
            }
            aria-label={
              saved
                ? labels.removeSaved
                : labels.save
            }
            title={
              saved
                ? labels.removeSaved
                : labels.save
            }
          >

            <Bookmark
              size={20}
              strokeWidth={1.9}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
              aria-hidden="true"
            />

          </button>

        </div>

      </footer>

    </article>
  );
}


export default WritingCard;