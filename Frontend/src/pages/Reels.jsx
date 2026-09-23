import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Share2,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  getReels,
  registerReelView,
} from "../api/reels";

import "./Reels.css";


// =========================================================
// BACKGROUND
// =========================================================

const REELS_BACKGROUND_VIDEO =
  "/backgrounds/shobdo-reels-bg.mp4";


// =========================================================
// MULTILINGUAL COPY
// =========================================================

const COPY = {

  // =======================================================
  // BENGALI
  // =======================================================

  bn: {
    reels: "রিলস",

    loadingTitle:
      "রিলস লোড হচ্ছে",

    loadingDescription:
      "SHOBDO কমিউনিটির গল্প, কবিতা, পরিবেশনা ও সৃজনশীল কণ্ঠ আবিষ্কার করুন।",

    unavailableTitle:
      "রিলস এখন উপলভ্য নয়",

    unavailableDescription:
      "রিলস লোড করা যায়নি।",

    retry:
      "আবার চেষ্টা করুন",

    eyebrow:
      "SHOBDO রিলস",

    emptyTitle:
      "আপনার গল্পেরও একটি মঞ্চ প্রাপ্য।",

    emptyDescription:
      "কবিতা আবৃত্তি, গল্প বলা, সাহিত্যিক পরিবেশনা এবং ছোট সৃজনশীল ভিডিও প্রকাশ করুন।",

    createFirst:
      "আপনার প্রথম রিল তৈরি করুন",

    formats:
      "MP4, WEBM, MOV বা M4V · সর্বোচ্চ 100 MB",

    guestTitle:
      "SHOBDO-তে রিলস আসছে",

    guestDescription:
      "ছোট সাহিত্যিক ভিডিও, কবিতা আবৃত্তি, গল্প বলা এবং সৃজনশীল কণ্ঠ এখানে দেখা যাবে।",

    loginToCreate:
      "রিল তৈরি করতে লগ ইন করুন",

    explore:
      "SHOBDO অন্বেষণ করুন",

    create:
      "তৈরি করুন",

    login:
      "লগ ইন",

    play:
      "রিল চালান",

    pause:
      "রিল থামান",

    mute:
      "শব্দ বন্ধ করুন",

    unmute:
      "শব্দ চালু করুন",

    like:
      "পছন্দ",

    comment:
      "মন্তব্য",

    save:
      "সংরক্ষণ",

    share:
      "শেয়ার",

    more:
      "আরও বিকল্প",

    previous:
      "আগের রিল",

    next:
      "পরের রিল",

    yourReel:
      "আপনার রিল",

    follow:
      "অনুসরণ",

    views:
      "ভিউ",

    sharedText:
      "SHOBDO-তে এই রিলটি দেখুন।",

    copied:
      "রিলের লিংক কপি হয়েছে।",
  },


  // =======================================================
  // ENGLISH
  // =======================================================

  en: {
    reels: "Reels",

    loadingTitle:
      "Loading Reels",

    loadingDescription:
      "Discover stories, poetry, performances and creative voices from the SHOBDO community.",

    unavailableTitle:
      "Reels are unavailable",

    unavailableDescription:
      "Unable to load Reels.",

    retry:
      "Try again",

    eyebrow:
      "SHOBDO REELS",

    emptyTitle:
      "Your stories deserve a stage.",

    emptyDescription:
      "Publish poetry recitations, storytelling, literary performances and short creative videos.",

    createFirst:
      "Create your first Reel",

    formats:
      "MP4, WEBM, MOV or M4V · Up to 100 MB",

    guestTitle:
      "Reels are coming to SHOBDO",

    guestDescription:
      "Short literary videos, poetry recitations, storytelling and creative voices will appear here.",

    loginToCreate:
      "Log in to create a Reel",

    explore:
      "Explore SHOBDO",

    create:
      "Create",

    login:
      "Log in",

    play:
      "Play Reel",

    pause:
      "Pause Reel",

    mute:
      "Mute",

    unmute:
      "Unmute",

    like:
      "Like",

    comment:
      "Comment",

    save:
      "Save",

    share:
      "Share",

    more:
      "More options",

    previous:
      "Previous Reel",

    next:
      "Next Reel",

    yourReel:
      "Your Reel",

    follow:
      "Follow",

    views:
      "views",

    sharedText:
      "Watch this Reel on SHOBDO.",

    copied:
      "Reel link copied.",
  },


  // =======================================================
  // HINDI
  // =======================================================

  hi: {
    reels: "रील्स",

    loadingTitle:
      "रील्स लोड हो रही हैं",

    loadingDescription:
      "SHOBDO समुदाय की कहानियाँ, कविताएँ, प्रस्तुतियाँ और रचनात्मक आवाज़ें खोजें।",

    unavailableTitle:
      "रील्स उपलब्ध नहीं हैं",

    unavailableDescription:
      "रील्स लोड नहीं हो सकीं।",

    retry:
      "फिर कोशिश करें",

    eyebrow:
      "SHOBDO रील्स",

    emptyTitle:
      "आपकी कहानियाँ भी एक मंच की हकदार हैं।",

    emptyDescription:
      "कविता पाठ, कहानी, साहित्यिक प्रस्तुतियाँ और छोटे रचनात्मक वीडियो प्रकाशित करें।",

    createFirst:
      "अपनी पहली रील बनाएँ",

    formats:
      "MP4, WEBM, MOV या M4V · अधिकतम 100 MB",

    guestTitle:
      "SHOBDO पर रील्स आ रही हैं",

    guestDescription:
      "छोटे साहित्यिक वीडियो, कविता पाठ, कहानी और रचनात्मक आवाज़ें यहाँ दिखाई देंगी।",

    loginToCreate:
      "रील बनाने के लिए लॉग इन करें",

    explore:
      "SHOBDO एक्सप्लोर करें",

    create:
      "बनाएँ",

    login:
      "लॉग इन",

    play:
      "रील चलाएँ",

    pause:
      "रील रोकें",

    mute:
      "आवाज़ बंद करें",

    unmute:
      "आवाज़ चालू करें",

    like:
      "पसंद",

    comment:
      "टिप्पणी",

    save:
      "सहेजें",

    share:
      "शेयर",

    more:
      "और विकल्प",

    previous:
      "पिछली रील",

    next:
      "अगली रील",

    yourReel:
      "आपकी रील",

    follow:
      "फ़ॉलो",

    views:
      "व्यू",

    sharedText:
      "SHOBDO पर यह रील देखें।",

    copied:
      "रील लिंक कॉपी हो गया।",
  },

};


// =========================================================
// HELPERS
// =========================================================

function formatCount(
  value
) {

  const number =
    Number(value) || 0;


  if (
    number >=
    1_000_000
  ) {

    return `${(
      number /
      1_000_000
    ).toFixed(1)}M`;

  }


  if (
    number >=
    1_000
  ) {

    return `${(
      number /
      1_000
    ).toFixed(1)}K`;

  }


  return String(
    number
  );

}


// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name ||
      "Writer"
    ).trim();


  if (
    !safeName
  ) {

    return "W";

  }


  return safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (
        part
      ) =>
        part[0]
    )
    .join("")
    .toUpperCase();

}


// =========================================================
// FULL-SCREEN REELS BACKGROUND
//
// IMPORTANT:
//
// Do NOT portal this to document.body.
//
// SHOBDO already has a global PageBackground component.
// Keeping this inside the application tree lets its z-index
// sit ABOVE the ordinary PageBackground but BELOW the Reels
// interface.
// =========================================================

function ReelsBackground() {

  const videoRef =
    useRef(null);


  useEffect(
    () => {

      const video =
        videoRef.current;


      if (
        !video
      ) {

        return;

      }


      video.muted =
        true;


      const playPromise =
        video.play();


      if (
        playPromise &&
        typeof playPromise.catch ===
          "function"
      ) {

        playPromise.catch(
          () => {}
        );

      }

    },
    []
  );


  function ensurePlayback() {

    const video =
      videoRef.current;


    if (
      !video
    ) {

      return;

    }


    video.muted =
      true;


    if (
      video.paused
    ) {

      video
        .play()
        .catch(
          () => {}
        );

    }

  }


  return (

    <div
      className="shobdo-reels-animated-background"
      aria-hidden="true"
    >

      <video
        ref={videoRef}
        className="shobdo-reels-background-video"
        src={
          REELS_BACKGROUND_VIDEO
        }
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
        onLoadedData={
          ensurePlayback
        }
        onCanPlay={
          ensurePlayback
        }
      />


      <div
        className="shobdo-reels-background-overlay"
      />


      <div
        className="shobdo-reels-background-focus"
      />


      <div
        className="shobdo-reels-background-vignette"
      />

    </div>

  );

}


// =========================================================
// REELS SCENE
// =========================================================

function ReelsScene({
  children,
  embedded = false,
}) {

  return (

    <div
      className={
        embedded
          ? "shobdo-reels-shell shobdo-reels-shell-embedded"
          : "shobdo-reels-shell"
      }
    >

      {!embedded && (
        <ReelsBackground />
      )}


      <div
        className={
          embedded
            ? "shobdo-reels-content-layer shobdo-reels-content-layer-embedded"
            : "shobdo-reels-content-layer"
        }
      >

        {children}

      </div>

    </div>

  );

}


// =========================================================
// REEL ITEM
// =========================================================

function ReelItem({

  reel,

  active,

  user,

  copy,

  createPath,

  onVisible,

  onPrevious,

  onNext,

  hasPrevious,

  hasNext,

}) {

  const videoRef =
    useRef(null);


  const itemRef =
    useRef(null);


  const [
    muted,
    setMuted,
  ] =
    useState(true);


  const [
    playing,
    setPlaying,
  ] =
    useState(false);


  const [
    progress,
    setProgress,
  ] =
    useState(0);


  // =======================================================
  // INTERSECTION OBSERVER
  // =======================================================

  useEffect(
    () => {

      const element =
        itemRef.current;


      if (
        !element
      ) {

        return undefined;

      }


      const observer =
        new IntersectionObserver(
          (
            [entry]
          ) => {

            if (
              entry.isIntersecting &&
              entry.intersectionRatio >=
                0.65
            ) {

              onVisible(
                reel.id
              );

            }

          },
          {
            threshold: [
              0.65,
            ],
          }
        );


      observer.observe(
        element
      );


      return () => {

        observer.disconnect();

      };

    },
    [
      onVisible,
      reel.id,
    ]
  );


  // =======================================================
  // ACTIVE REEL AUTOPLAY
  // =======================================================

  useEffect(
    () => {

      const video =
        videoRef.current;


      if (
        !video
      ) {

        return;

      }


      if (
        active
      ) {

        video.muted =
          muted;


        video
          .play()
          .then(
            () => {

              setPlaying(
                true
              );

            }
          )
          .catch(
            () => {

              setPlaying(
                false
              );

            }
          );

      } else {

        video.pause();


        setPlaying(
          false
        );

      }

    },
    [
      active,
      muted,
    ]
  );


  // =======================================================
  // PLAY / PAUSE
  // =======================================================

  function togglePlay() {

    const video =
      videoRef.current;


    if (
      !video
    ) {

      return;

    }


    if (
      video.paused
    ) {

      video
        .play()
        .then(
          () => {

            setPlaying(
              true
            );

          }
        )
        .catch(
          () => {}
        );

    } else {

      video.pause();


      setPlaying(
        false
      );

    }

  }


  // =======================================================
  // SOUND
  // =======================================================

  function toggleMute(
    event
  ) {

    event.stopPropagation();


    const nextMuted =
      !muted;


    setMuted(
      nextMuted
    );


    if (
      videoRef.current
    ) {

      videoRef.current.muted =
        nextMuted;

    }

  }


  // =======================================================
  // VIDEO PROGRESS
  // =======================================================

  function handleTimeUpdate(
    event
  ) {

    const video =
      event.currentTarget;


    if (
      !video.duration ||
      Number.isNaN(
        video.duration
      )
    ) {

      setProgress(
        0
      );

      return;

    }


    setProgress(
      (
        video.currentTime /
        video.duration
      ) *
        100
    );

  }


  // =======================================================
  // SHARE
  // =======================================================

  async function handleShare(
    event
  ) {

    event.stopPropagation();


    const reelUrl =
      `${window.location.origin}/reels/${reel.id}`;


    try {

      if (
        navigator.share
      ) {

        await navigator.share({
          title:
            "SHOBDO Reel",

          text:
            reel.caption ||
            copy.sharedText,

          url:
            reelUrl,
        });


        return;

      }


      if (
        navigator.clipboard
      ) {

        await navigator
          .clipboard
          .writeText(
            reelUrl
          );


        window.alert(
          copy.copied
        );

      }

    } catch {

      // User cancelled sharing.

    }

  }


  // =======================================================
  // CREATOR
  // =======================================================

  const creator =
    reel.creator ||
    reel.user ||
    {};


  const creatorName =
    creator.name ||
    creator.full_name ||
    creator.display_name ||
    reel.user_name ||
    `Writer ${
      reel.user_id ||
      ""
    }`;


  const avatar =
    creator.profile_picture ||
    creator.avatar_url ||
    creator.avatar ||
    reel.user_avatar ||
    null;


  const creatorPath =
    reel.user_id
      ? `/users/${reel.user_id}`
      : "/reels";


  const isOwnReel =
    Boolean(
      user &&
      Number(
        user.id
      ) ===
        Number(
          reel.user_id
        )
    );


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      ref={
        itemRef
      }
      className="shobdo-reel"
      data-reel-id={
        reel.id
      }
    >

      {/* =================================================
          REEL VIDEO
      ================================================== */}

      <button
        type="button"
        className="shobdo-reel-video-button"
        onClick={
          togglePlay
        }
        aria-label={
          playing
            ? copy.pause
            : copy.play
        }
      >

        <video
          ref={
            videoRef
          }
          className="shobdo-reel-video"
          src={
            reel.video_url
          }
          poster={
            reel.thumbnail_url ||
            undefined
          }
          muted={
            muted
          }
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={
            () =>
              setPlaying(
                true
              )
          }
          onPause={
            () =>
              setPlaying(
                false
              )
          }
        />

      </button>


      <div
        className="shobdo-reel-gradient"
        aria-hidden="true"
      />


      {/* =================================================
          TOP BAR
      ================================================== */}

      <div
        className="shobdo-reel-topbar"
      >

        <div
          className="shobdo-reel-topbar-title"
        >

          <span
            className="shobdo-reel-logo-mark"
          >
            শ
          </span>


          <span>
            {
              copy.reels
            }
          </span>

        </div>


        {user
          ? (

            <Link
              to={
                createPath
              }
              className="shobdo-reel-create-top"
            >

              <Plus
                size={16}
              />

              {
                copy.create
              }

            </Link>

          )
          : (

            <Link
              to="/login"
              className="shobdo-reel-login"
            >

              {
                copy.login
              }

            </Link>

          )}

      </div>


      {/* =================================================
          CENTER PLAY BUTTON
      ================================================== */}

      {!playing && (

        <button
          type="button"
          className="shobdo-reel-center-play"
          onClick={
            togglePlay
          }
          aria-label={
            copy.play
          }
        >

          <Play
            size={32}
            fill="currentColor"
          />

        </button>

      )}


      {/* =================================================
          SOUND
      ================================================== */}

      <button
        type="button"
        className="shobdo-reel-sound"
        onClick={
          toggleMute
        }
        aria-label={
          muted
            ? copy.unmute
            : copy.mute
        }
      >

        {muted
          ? (

            <VolumeX
              size={20}
            />

          )
          : (

            <Volume2
              size={20}
            />

          )}

      </button>


      {/* =================================================
          ACTION BAR
      ================================================== */}

      <aside
        className="shobdo-reel-actions"
      >

        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.like
          }
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Heart
              size={24}
            />

          </span>


          <span>
            {
              formatCount(
                reel.likes_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.comment
          }
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <MessageCircle
              size={24}
            />

          </span>


          <span>
            {
              formatCount(
                reel.comments_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.save
          }
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Bookmark
              size={23}
            />

          </span>


          <span>
            {
              formatCount(
                reel.saves_count
              )
            }
          </span>

        </Link>


        <button
          type="button"
          className="shobdo-reel-action"
          onClick={
            handleShare
          }
          aria-label={
            copy.share
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Share2
              size={23}
            />

          </span>


          <span>
            {
              formatCount(
                reel.shares_count
              )
            }
          </span>

        </button>


        <button
          type="button"
          className="shobdo-reel-action"
          aria-label={
            copy.more
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <MoreHorizontal
              size={24}
            />

          </span>

        </button>

      </aside>


      {/* =================================================
          CREATOR / CAPTION
      ================================================== */}

      <div
        className="shobdo-reel-info"
      >

        <div
          className="shobdo-reel-author-row"
        >

          <Link
            to={
              creatorPath
            }
            className="shobdo-reel-author"
          >

            {avatar
              ? (

                <img
                  src={
                    avatar
                  }
                  alt=""
                  className="shobdo-reel-avatar"
                />

              )
              : (

                <div
                  className="shobdo-reel-avatar shobdo-reel-avatar-fallback"
                >

                  {
                    getInitials(
                      creatorName
                    )
                  }

                </div>

              )}


            <span
              className="shobdo-reel-author-name"
            >

              {
                creatorName
              }

            </span>

          </Link>


          {isOwnReel
            ? (

              <span
                className="shobdo-reel-own-badge"
              >

                {
                  copy.yourReel
                }

              </span>

            )
            : (

              <Link
                to={
                  user
                    ? creatorPath
                    : "/login"
                }
                className="shobdo-reel-follow"
              >

                {
                  copy.follow
                }

              </Link>

            )}

        </div>


        {reel.caption && (

          <p
            className="shobdo-reel-caption"
          >

            {
              reel.caption
            }

          </p>

        )}


        <div
          className="shobdo-reel-meta"
        >

          <span
            className="shobdo-reel-language"
          >

            {
              String(
                reel.language ||
                "bn"
              )
                .toUpperCase()
            }

          </span>


          <span>

            {
              formatCount(
                reel.views_count
              )
            }

            {" "}

            {
              copy.views
            }

          </span>

        </div>

      </div>


      {/* =================================================
          DESKTOP PREVIOUS / NEXT
      ================================================== */}

      <div
        className="shobdo-reel-navigation"
      >

        <button
          type="button"
          disabled={
            !hasPrevious
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              onPrevious();

            }
          }
          aria-label={
            copy.previous
          }
        >

          <ChevronUp
            size={24}
          />

        </button>


        <button
          type="button"
          disabled={
            !hasNext
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              onNext();

            }
          }
          aria-label={
            copy.next
          }
        >

          <ChevronDown
            size={24}
          />

        </button>

      </div>


      {/* =================================================
          PROGRESS
      ================================================== */}

      <div
        className="shobdo-reel-progress"
      >

        <div
          className="shobdo-reel-progress-value"
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

    </article>

  );

}


// =========================================================
// REELS PAGE
// =========================================================

export default function Reels({
  user,
  embedded = false,
  createPath = "/reels/create",
}) {

  const {
    reelId,
  } =
    useParams();


  const {
    language,
  } =
    useLanguage();


  const copy =
    COPY[
      language
    ] ||
    COPY.en;


  const containerRef =
    useRef(null);


  const viewedReelsRef =
    useRef(
      new Set()
    );


  const [
    reels,
    setReels,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    activeReelId,
    setActiveReelId,
  ] =
    useState(null);


  // =======================================================
  // GLOBAL REELS ROUTE MODE
  // =======================================================

  useEffect(
    () => {

      if (
        embedded
      ) {

        return undefined;

      }


      const body =
        document.body;


      const html =
        document.documentElement;


      body.classList.add(
        "shobdo-reels-route-active"
      );


      html.classList.add(
        "shobdo-reels-route-active"
      );


      return () => {

        body.classList.remove(
          "shobdo-reels-route-active"
        );


        html.classList.remove(
          "shobdo-reels-route-active"
        );

      };

    },
    [
      embedded,
    ]
  );


  // =======================================================
  // PAGE TITLE
  // =======================================================

  useEffect(
    () => {

      if (
        embedded
      ) {

        return undefined;

      }


      const previousTitle =
        document.title;


      document.title =
        `${copy.reels} | SHOBDO`;


      return () => {

        document.title =
          previousTitle;

      };

    },
    [
      copy.reels,
      embedded,
    ]
  );


  // =======================================================
  // LOAD REELS
  // =======================================================

  const loadReels =
    useCallback(
      async () => {

        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          const data =
            await getReels({
              page:
                1,

              perPage:
                30,
            });


          let items =
            Array.isArray(
              data?.reels
            )
              ? [
                  ...data.reels,
                ]
              : [];


          // -------------------------------------------------
          // Deep link support inside loaded feed.
          // -------------------------------------------------

          if (
            reelId
          ) {

            const requestedId =
              Number(
                reelId
              );


            const requestedIndex =
              items.findIndex(
                (
                  reel
                ) =>
                  Number(
                    reel.id
                  ) ===
                  requestedId
              );


            if (
              requestedIndex >
              0
            ) {

              const [
                requestedReel,
              ] =
                items.splice(
                  requestedIndex,
                  1
                );


              items = [
                requestedReel,
                ...items,
              ];

            }

          }


          setReels(
            items
          );


          setActiveReelId(
            items[0]?.id ||
            null
          );

        } catch (
          loadError
        ) {

          console.error(
            "LOAD REELS ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            copy.unavailableDescription
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        reelId,
        copy.unavailableDescription,
      ]
    );


  useEffect(
    () => {

      loadReels();

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // REFRESH AFTER NEW REEL
  // =======================================================

  useEffect(
    () => {

      function handlePublished() {

        loadReels();

      }


      window.addEventListener(
        "shobdo:reel-published",
        handlePublished
      );


      return () => {

        window.removeEventListener(
          "shobdo:reel-published",
          handlePublished
        );

      };

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // ACTIVE / VIEW REGISTRATION
  // =======================================================

  const handleVisible =
    useCallback(
      (
        reelIdValue
      ) => {

        setActiveReelId(
          reelIdValue
        );


        if (
          viewedReelsRef
            .current
            .has(
              reelIdValue
            )
        ) {

          return;

        }


        viewedReelsRef
          .current
          .add(
            reelIdValue
          );


        registerReelView(
          reelIdValue
        )
          .catch(
            () => {}
          );

      },
      []
    );


  // =======================================================
  // SCROLL
  // =======================================================

  function scrollToIndex(
    index
  ) {

    if (
      index <
        0 ||
      index >=
        reels.length
    ) {

      return;

    }


    const reel =
      reels[
        index
      ];


    const element =
      containerRef
        .current
        ?.querySelector(
          `[data-reel-id="${reel.id}"]`
        );


    element
      ?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });

  }


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {

    return (

      <ReelsScene
        embedded={
          embedded
        }
      >

        <main
          className="shobdo-reels-state shobdo-reels-loading-state"
        >

          <LoaderCircle
            className="shobdo-reels-spinner"
            size={38}
          />


          <h1>
            {
              copy.loadingTitle
            }
          </h1>


          <p>
            {
              copy.loadingDescription
            }
          </p>

        </main>

      </ReelsScene>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error
  ) {

    return (

      <ReelsScene
        embedded={
          embedded
        }
      >

        <main
          className="shobdo-reels-state shobdo-reels-error-state"
        >

          <div
            className="shobdo-reels-empty-icon"
          >

            <Clapperboard
              size={34}
            />

          </div>


          <h1>
            {
              copy.unavailableTitle
            }
          </h1>


          <p>
            {
              error
            }
          </p>


          <button
            type="button"
            onClick={
              loadReels
            }
            className="shobdo-reels-retry"
          >

            {
              copy.retry
            }

          </button>

        </main>

      </ReelsScene>

    );

  }


  // =======================================================
  // EMPTY
  // =======================================================

  if (
    reels.length ===
    0
  ) {

    return (

      <ReelsScene
        embedded={
          embedded
        }
      >

        <main
          className="shobdo-reels-state shobdo-reels-empty-state"
        >

          <div
            className="shobdo-reels-empty-icon"
          >

            <Clapperboard
              size={35}
            />

          </div>


          <span
            className="shobdo-reels-empty-eyebrow"
          >

            {
              copy.eyebrow
            }

          </span>


          {user
            ? (

              <>

                <h1>
                  {
                    copy.emptyTitle
                  }
                </h1>


                <p>
                  {
                    copy.emptyDescription
                  }
                </p>


                <Link
                  to={
                    createPath
                  }
                  className="shobdo-reels-create-button"
                >

                  <Upload
                    size={18}
                  />

                  {
                    copy.createFirst
                  }

                </Link>


                <small
                  className="shobdo-reels-empty-note"
                >

                  {
                    copy.formats
                  }

                </small>

              </>

            )
            : (

              <>

                <h1>
                  {
                    copy.guestTitle
                  }
                </h1>


                <p>
                  {
                    copy.guestDescription
                  }
                </p>


                <div
                  className="shobdo-reels-empty-actions"
                >

                  <Link
                    to="/login"
                    className="shobdo-reels-create-button"
                  >

                    <Video
                      size={18}
                    />

                    {
                      copy.loginToCreate
                    }

                  </Link>


                  <Link
                    to="/"
                    className="shobdo-reels-home-link"
                  >

                    {
                      copy.explore
                    }

                  </Link>

                </div>

              </>

            )}

        </main>

      </ReelsScene>

    );

  }


  // =======================================================
  // REEL FEED
  // =======================================================

  return (

    <ReelsScene
        embedded={
          embedded
        }
      >

      <main
        ref={
          containerRef
        }
        className="shobdo-reels-page"
      >

        {reels.map(
          (
            reel,
            index
          ) => (

            <ReelItem
              key={
                reel.id
              }
              reel={
                reel
              }
              user={
                user
              }
              copy={
                copy
              }
              createPath={
                createPath
              }
              active={
                reel.id ===
                activeReelId
              }
              onVisible={
                handleVisible
              }
              hasPrevious={
                index >
                0
              }
              hasNext={
                index <
                reels.length -
                  1
              }
              onPrevious={
                () =>
                  scrollToIndex(
                    index -
                      1
                  )
              }
              onNext={
                () =>
                  scrollToIndex(
                    index +
                      1
                  )
              }
            />

          )
        )}


        {user && (

          <Link
            to={
              createPath
            }
            className="shobdo-reels-floating-create"
            aria-label={
              copy.create
            }
            title={
              copy.create
            }
          >

            <Plus
              size={23}
            />

          </Link>

        )}

      </main>

    </ReelsScene>

  );

}