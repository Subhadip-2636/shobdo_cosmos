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
  Globe2,
  Hash,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getSavedWritingStatus,
  getToken,
  repostWriting,
  saveWriting,
  toggleLike,
  unrepostWriting,
  unsaveWriting,
} from "../api/api";

import {
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./WritingCard.css";


// =========================================================
// HELPERS
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
// SHARE URL
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
      "undefined"
    &&
    navigator.clipboard
    &&
    typeof navigator.clipboard
      .writeText === "function"
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
// WRITING CARD
// =========================================================

function WritingCard({
  writing,
}) {

  const {
    t,
    language,
  } = useLanguage();


  const navigate =
    useNavigate();


  const shareResetTimerRef =
    useRef(
      null
    );


  // =======================================================
  // TRANSLATION FALLBACK
  // =======================================================

  function translate(
    key,
    fallbackBn,
    fallbackEn,
    fallbackHi = null,
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

      // Use fallback below.
    }


    if (
      language === "bn"
    ) {

      return fallbackBn;
    }


    if (
      language === "hi"
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

    by:
      translate(
        "writingCard.by",
        "লেখক",
        "By",
        "लेखक"
      ),

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
        "শিরোনামহীন",
        "Untitled",
        "बिना शीर्षक"
      ),

    previewUnavailable:
      translate(
        "writingCard.previewUnavailable",
        "লেখার কোনো প্রিভিউ নেই।",
        "No preview available.",
        "कोई पूर्वावलोकन उपलब्ध नहीं है।"
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

    read:
      translate(
        "writingCard.read",
        "পড়ুন",
        "Read",
        "पढ़ें"
      ),

    like:
      language === "bn"
        ? "পছন্দ করুন"
        : language === "hi"
          ? "पसंद करें"
          : "Like",

    unlike:
      language === "bn"
        ? "পছন্দ সরান"
        : language === "hi"
          ? "पसंद हटाएँ"
          : "Unlike",

    comments:
      language === "bn"
        ? "মন্তব্য"
        : language === "hi"
          ? "टिप्पणियाँ"
          : "Comments",

    repost:
      language === "bn"
        ? "পুনরায় শেয়ার করুন"
        : language === "hi"
          ? "रीपोस्ट करें"
          : "Repost",

    unrepost:
      language === "bn"
        ? "রিপোস্ট সরান"
        : language === "hi"
          ? "रीपोस्ट हटाएँ"
          : "Remove repost",

    reposted:
      language === "bn"
        ? "রিপোস্ট হয়েছে"
        : language === "hi"
          ? "रीपोस्ट किया गया"
          : "Reposted",

    save:
      language === "bn"
        ? "সংরক্ষণ করুন"
        : language === "hi"
          ? "सहेजें"
          : "Save",

    saved:
      language === "bn"
        ? "সংরক্ষিত"
        : language === "hi"
          ? "सहेजा गया"
          : "Saved",

    removeSaved:
      language === "bn"
        ? "সংরক্ষিত তালিকা থেকে সরান"
        : language === "hi"
          ? "सहेजी गई सूची से हटाएँ"
          : "Remove from saved writings",

    share:
      language === "bn"
        ? "শেয়ার করুন"
        : language === "hi"
          ? "शेयर करें"
          : "Share",

    shared:
      language === "bn"
        ? "শেয়ার হয়েছে"
        : language === "hi"
          ? "शेयर किया गया"
          : "Shared",

    copied:
      language === "bn"
        ? "লিংক কপি হয়েছে"
        : language === "hi"
          ? "लिंक कॉपी हो गया"
          : "Link copied",

    shareFailed:
      language === "bn"
        ? "লিংক শেয়ার করা যায়নি"
        : language === "hi"
          ? "लिंक शेयर नहीं हो सका"
          : "Unable to share",

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
    )
    &&
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
    shareState,
    setShareState,
  ] = useState(
    "idle"
  );


  // =======================================================
  // RESET SAVE STATE
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
  // RESET SHARE STATE WHEN WRITING CHANGES
  // =======================================================

  useEffect(
    () => {

      setShareState(
        "idle"
      );


      if (
        shareResetTimerRef.current
      ) {

        window.clearTimeout(
          shareResetTimerRef.current
        );

        shareResetTimerRef.current =
          null;
      }

    },
    [
      writing?.id,
    ]
  );


  // =======================================================
  // CLEAN SHARE TIMER
  // =======================================================

  useEffect(
    () => {

      return () => {

        if (
          shareResetTimerRef.current
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


        const token =
          getToken();


        if (
          !token
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


        try {

          const data =
            await getSavedWritingStatus(
              writingId
            );


          if (
            cancelled
          ) {
            return;
          }


          setSaved(
            Boolean(
              data?.saved ??
              data?.is_saved ??
              false
            )
          );

        } catch (
          error
        ) {

          if (
            !cancelled
          ) {

            console.error(
              "GET SAVED WRITING STATUS ERROR:",
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
    )
    &&
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


  // =======================================================
  // CATEGORY / LANGUAGE
  // =======================================================

  const category =
    getCategoryLabel(
      writing?.category
    );


  const languageCode =
    writing?.language ||
    "bn";


  const languageLabel =
    getLanguageLabel(
      languageCode
    );


  // =======================================================
  // TAGS
  // =======================================================

  const tags =
    useMemo(
      () => {

        const source = [];


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

                source.push({
                  name:
                    tag,
                });

                return;
              }


              if (
                tag &&
                typeof tag ===
                "object"
              ) {

                source.push({
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
          source.length === 0 &&
          Array.isArray(
            writing?.hashtags
          )
        ) {

          writing.hashtags.forEach(
            (
              hashtag
            ) => {

              source.push({
                name:
                  hashtag,
              });
            }
          );
        }


        const seen =
          new Set();


        return source
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
                name.toLocaleLowerCase();


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

                hashtag:
                  `#${name}`,
              };
            }
          )
          .filter(Boolean)
          .slice(
            0,
            20
          );
      },
      [
        writing?.tags,
        writing?.hashtags,
      ]
    );


  // =======================================================
  // CONTENT PREVIEW
  // =======================================================

  const preview =
    useMemo(
      () => {

        const text =
          String(
            writing?.content ||
            ""
          ).trim();


        if (
          !text
        ) {

          return (
            labels.previewUnavailable
          );
        }


        if (
          text.length <= 240
        ) {

          return text;
        }


        return (
          `${text
            .slice(
              0,
              240
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
  // FULL DATE
  // =======================================================

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
        language === "bn"
          ? "bn-IN"
          : language === "hi"
            ? "hi-IN"
            : undefined,
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


  // =======================================================
  // RELATIVE PUBLISHED TIME
  // =======================================================

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


    const differenceMs =
      date.getTime() -
      Date.now();


    const absoluteMs =
      Math.abs(
        differenceMs
      );


    const minute =
      60 * 1000;

    const hour =
      60 * minute;

    const day =
      24 * hour;

    const week =
      7 * day;


    let valueNumber;
    let unit;


    if (
      absoluteMs < hour
    ) {

      valueNumber =
        Math.round(
          differenceMs /
          minute
        );

      unit =
        "minute";

    } else if (
      absoluteMs < day
    ) {

      valueNumber =
        Math.round(
          differenceMs /
          hour
        );

      unit =
        "hour";

    } else if (
      absoluteMs < week
    ) {

      valueNumber =
        Math.round(
          differenceMs /
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
      valueNumber === 0
    ) {

      if (
        language === "bn"
      ) {
        return "এইমাত্র";
      }


      if (
        language === "hi"
      ) {
        return "अभी";
      }


      return "just now";
    }


    try {

      const formatter =
        new Intl.RelativeTimeFormat(
          language === "bn"
            ? "bn"
            : language === "hi"
              ? "hi"
              : "en",
          {
            numeric:
              "auto",
          }
        );


      return formatter.format(
        valueNumber,
        unit
      );

    } catch {

      return formatDate(
        value
      );
    }
  }


  const publishedValue =
    writing?.published_at ||
    writing?.created_at;


  const publishedDate =
    formatDate(
      publishedValue
    );


  const relativePublishedDate =
    formatRelativeTime(
      publishedValue
    );


  // =======================================================
  // LIKE / UNLIKE
  // =======================================================

  async function handleLike(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      liking ||
      !hasWritingId
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


    // Optimistic UI.

    setLiked(
      !previousLiked
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


      if (
        typeof data?.liked ===
        "boolean"
      ) {

        setLiked(
          data.liked
        );

      } else if (
        typeof data?.is_liked ===
        "boolean"
      ) {

        setLiked(
          data.is_liked
        );
      }


      if (
        Number.isFinite(
          Number(
            data?.likes_count
          )
        )
      ) {

        setLikesCount(
          safeNumber(
            data.likes_count
          )
        );

      } else if (
        Number.isFinite(
          Number(
            data?.writing
              ?.likes_count
          )
        )
      ) {

        setLikesCount(
          safeNumber(
            data.writing
              .likes_count
          )
        );

      } else if (
        Number.isFinite(
          Number(
            data?.likes
          )
        )
      ) {

        setLikesCount(
          safeNumber(
            data.likes
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
  // SAVE / UNSAVE
  // =======================================================

  async function handleSave(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      saving ||
      !hasWritingId
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


    setSaved(
      !previousSaved
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


      if (
        typeof data?.saved ===
        "boolean"
      ) {

        setSaved(
          data.saved
        );

      } else if (
        typeof data?.is_saved ===
        "boolean"
      ) {

        setSaved(
          data.is_saved
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
  // REPOST / UNREPOST
  // =======================================================

  async function handleRepost(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      reposting ||
      !hasWritingId
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


    const previousReposted =
      reposted;


    const previousCount =
      repostsCount;


    const nextReposted =
      !previousReposted;


    // =====================================================
    // OPTIMISTIC UI
    // =====================================================

    setReposted(
      nextReposted
    );


    setRepostsCount(

      Math.max(

        0,

        previousCount +
        (
          previousReposted
            ? -1
            : 1
        )

      )

    );


    setReposting(
      true
    );


    try {

      const data =
        previousReposted
          ? await unrepostWriting(
              writingId
            )
          : await repostWriting(
              writingId
            );


      // ===================================================
      // SERVER STATUS
      // ===================================================

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


      // ===================================================
      // SERVER COUNT
      // ===================================================

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


      // ===================================================
      // GLOBAL EVENT
      //
      // Other pages can later listen to this event if they
      // need to refresh repost/profile statistics.
      // ===================================================

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
                    : nextReposted,

                repostsCount:
                  Number.isFinite(
                    Number(
                      data?.reposts_count
                    )
                  )
                    ? safeNumber(
                        data.reposts_count
                      )
                    : (
                        previousCount +
                        (
                          previousReposted
                            ? -1
                            : 1
                        )
                      ),

              },
            }
          )

        );
      }

    } catch (
      error
    ) {

      // ===================================================
      // ROLLBACK OPTIMISTIC STATE
      // ===================================================

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
      shareResetTimerRef.current
    ) {

      window.clearTimeout(
        shareResetTimerRef.current
      );
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
  // COPY SHARE URL
  // =======================================================

  async function copyShareUrl(
    url
  ) {

    const copied =
      await copyText(
        url
      );


    if (
      !copied
    ) {

      throw new Error(
        "Unable to copy share link."
      );
    }


    setShareState(
      "copied"
    );


    resetShareStateLater();
  }


  // =======================================================
  // SHARE WRITING
  // =======================================================

  async function handleShare(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      !hasWritingId ||
      shareState === "sharing"
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
      language === "bn"
        ? `${authorName}-এর "${shareTitle}" লেখাটি SHOBDO-তে পড়ুন।`
        : language === "hi"
          ? `${authorName} की "${shareTitle}" रचना SHOBDO पर पढ़ें।`
          : `Read "${shareTitle}" by ${authorName} on SHOBDO.`;


    setShareState(
      "sharing"
    );


    // -----------------------------------------------------
    // NATIVE WEB SHARE
    //
    // Supported by many mobile browsers and some desktop
    // browsers. It can share directly to WhatsApp, Facebook,
    // Messages, Telegram, email, etc.
    // -----------------------------------------------------

    if (
      typeof navigator !==
        "undefined"
      &&
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


        resetShareStateLater();


        return;

      } catch (
        error
      ) {

        // User closed/cancelled native share sheet.
        if (
          error?.name ===
            "AbortError"
        ) {

          setShareState(
            "idle"
          );

          return;
        }


        // Native share failed.
        // Continue to clipboard fallback.
        console.warn(
          "NATIVE SHARE FAILED, USING COPY FALLBACK:",
          error
        );
      }
    }


    // -----------------------------------------------------
    // DESKTOP / FALLBACK
    // -----------------------------------------------------

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
  // SHARE PRESENTATION
  // =======================================================

  const shareSuccessful =
    shareState === "copied" ||
    shareState === "shared";


  const shareLabel =
    shareState === "copied"
      ? labels.copied
      : shareState === "shared"
        ? labels.shared
        : shareState === "error"
          ? labels.shareFailed
          : labels.share;


  // =======================================================
  // AUTHOR AVATAR
  // =======================================================

  const authorInitials =
    getInitials(
      authorName ||
      authorUsername
    );


  const authorAvatarContent =
    authorAvatar
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
              {
                authorInitials
              }
            </span>

          )
        : (

            <User
              size={17}
            />

          );


  // =======================================================
  // AUTHOR CONTENT
  // =======================================================

  const authorContent = (

    <>

      <div
        className="writing-author-avatar"
      >
        {
          authorAvatarContent
        }
      </div>


      <div
        className="writing-author-info"
      >

        <div
          className="writing-author-name-row"
        >

          <strong>
            {
              authorName
            }
          </strong>


          {authorUsername && (

            <span
              className="writing-author-username"
            >
              @{authorUsername}
            </span>

          )}

        </div>


        <span
          className="writing-author-byline"
        >
          {
            labels.by
          }
        </span>

      </div>

    </>
  );


  // =======================================================
  // INVALID WRITING SAFETY
  // =======================================================

  if (
    !writing ||
    !hasWritingId
  ) {

    return null;
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      className="writing-card"
    >

      {/* =================================================
          HEADER / AUTHOR
      ================================================== */}

      <div
        className="writing-card-header"
      >

        {hasAuthorId
          ? (

              <Link
                to={
                  `/users/${authorId}`
                }
                className="writing-card-author writing-card-author-link"
                aria-label={
                  `${authorName} profile`
                }
              >
                {
                  authorContent
                }
              </Link>

            )
          : (

              <div
                className="writing-card-author"
              >
                {
                  authorContent
                }
              </div>

            )}


        <div
          className="writing-card-header-meta"
        >

          {relativePublishedDate && (

            <span
              className="writing-card-published-time"
              title={
                publishedDate
              }
            >

              <CalendarDays
                size={13}
              />

              {
                relativePublishedDate
              }

            </span>

          )}

        </div>

      </div>


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
            {
              languageLabel
            }
          </span>

        </span>


        <span
          className="writing-category-badge"
        >
          {
            category
          }
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
          CONTENT PREVIEW
      ================================================== */}

      <p
        className="writing-card-preview"
      >
        {
          preview
        }
      </p>


      {/* =================================================
          CLICKABLE HASHTAGS
      ================================================== */}

      {tags.length > 0 && (

        <div
          className="writing-card-tags"
          aria-label="Hashtags"
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
                title={
                  tag.hashtag
                }
              >

                <Hash
                  size={13}
                  aria-hidden="true"
                />

                <span>
                  {
                    tag.name
                  }
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

          <span
            title={
              publishedDate
            }
          >

            <CalendarDays
              size={13}
            />

            {
              publishedDate
            }

          </span>

        )}


        <span>

          <Clock3
            size={13}
          />

          {
            readingTime
          }

          {" "}

          {
            labels.minutes
          }

        </span>


        <span>

          <BookOpen
            size={13}
          />

          {
            wordCount
          }

          {" "}

          {
            labels.words
          }

        </span>

      </div>


      {/* =================================================
          FOOTER ACTIONS
      ================================================== */}

      <div
        className="writing-card-footer"
      >

        <div
          className="writing-card-social"
        >

          {/* ===============================================
              LIKE
          ================================================ */}

          <button
            type="button"
            className={
              liked
                ? "writing-like-button liked"
                : "writing-like-button"
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
              liked
                ? labels.unlike
                : labels.like
            }
            title={
              liked
                ? labels.unlike
                : labels.like
            }
          >

            <Heart
              size={16}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {
                likesCount
              }
            </span>

          </button>


          {/* ===============================================
              COMMENTS
          ================================================ */}

          <Link
            to={
              `/writings/${writingId}#comments`
            }
            className="writing-comment-count"
            title={
              labels.comments
            }
            aria-label={
              `${labels.comments}: ${commentsCount}`
            }
          >

            <MessageCircle
              size={16}
            />

            <span>
              {
                commentsCount
              }
            </span>

          </Link>

          {/* ===============================================
              REPOST
          ================================================ */}

          <button
            type="button"
            className={
              reposted
                ? "writing-repost-button reposted"
                : "writing-repost-button"
            }
            onClick={
              handleRepost
            }
            disabled={
              reposting
            }
            aria-pressed={
              reposted
            }
            aria-label={
              reposted
                ? labels.unrepost
                : labels.repost
            }
            title={
              reposted
                ? labels.reposted
                : labels.repost
            }
          >

            <Repeat2
              size={16}
            />

            <span>
              {
                repostsCount
              }
            </span>

          </button>

          {/* ===============================================
              SHARE
          ================================================ */}

          <button
            type="button"
            className={
              shareSuccessful
                ? "writing-share-button success"
                : shareState === "error"
                  ? "writing-share-button error"
                  : "writing-share-button"
            }
            onClick={
              handleShare
            }
            disabled={
              shareState === "sharing"
            }
            aria-label={
              shareLabel
            }
            title={
              shareLabel
            }
          >

            {shareSuccessful
              ? (

                  <Check
                    size={16}
                  />

                )
              : (

                  <Share2
                    size={16}
                  />

                )}


            <span
              className="writing-share-label"
            >
              {
                shareLabel
              }
            </span>

          </button>


          {/* ===============================================
              SAVE
          ================================================ */}

          <button
            type="button"
            className={
              saved
                ? "writing-save-button saved"
                : "writing-save-button"
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
                ? labels.saved
                : labels.save
            }
          >

            <Bookmark
              size={16}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

          </button>

        </div>


        {/* ===============================================
            READ
        ================================================ */}

        <Link
          to={
            `/writings/${writingId}`
          }
          className="writing-read-link"
        >

          {
            labels.read
          }


          <span
            aria-hidden="true"
          >
            →
          </span>

        </Link>

      </div>

    </article>
  );
}


export default WritingCard;