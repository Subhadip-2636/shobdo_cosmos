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
  Heart,
  MessageCircle,
  MoreHorizontal,
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
// WRITING URL
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
// WRITING CARD
// =========================================================

function WritingCard({
  writing,
}) {

  const navigate =
    useNavigate();


  const {
    t,
    language,
  } = useLanguage();


  const shareResetTimerRef =
    useRef(
      null
    );


  const menuRef =
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

      // Use local fallback.
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
      language === "bn"
        ? "লেখক"
        : language === "hi"
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

    read:
      translate(
        "writingCard.read",
        "লেখাটি পড়ুন",
        "Read more",
        "और पढ़ें"
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

    comment:
      language === "bn"
        ? "মন্তব্য"
        : language === "hi"
          ? "टिप्पणी"
          : "Comment",

    repost:
      language === "bn"
        ? "রিপোস্ট"
        : language === "hi"
          ? "रीपोस्ट"
          : "Repost",

    unrepost:
      language === "bn"
        ? "রিপোস্ট সরান"
        : language === "hi"
          ? "रीपोस्ट हटाएँ"
          : "Remove repost",

    share:
      language === "bn"
        ? "শেয়ার"
        : language === "hi"
          ? "शेयर"
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
        ? "শেয়ার করা যায়নি"
        : language === "hi"
          ? "शेयर नहीं हो सका"
          : "Unable to share",

    save:
      language === "bn"
        ? "সংরক্ষণ"
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
          : "Remove from saved",

    more:
      language === "bn"
        ? "আরও অপশন"
        : language === "hi"
          ? "अधिक विकल्प"
          : "More options",

    openPost:
      language === "bn"
        ? "লেখাটি খুলুন"
        : language === "hi"
          ? "रचना खोलें"
          : "Open post",

    copyLink:
      language === "bn"
        ? "লিংক কপি করুন"
        : language === "hi"
          ? "लिंक कॉपी करें"
          : "Copy link",

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
  // MENU
  // =======================================================

  const [
    menuOpen,
    setMenuOpen,
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
  // RESET SHARE STATE
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
  // CLEAN TIMER
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
  // CLOSE MENU OUTSIDE
  // =======================================================

  useEffect(
    () => {

      function handleOutsideClick(
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
      }


      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );


      return () => {

        document.removeEventListener(
          "mousedown",
          handleOutsideClick
        );
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


        if (
          !getToken()
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
  // COMMENTS
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

  const languageCode =
    writing?.language ||
    "bn";


  const languageLabel =
    getLanguageLabel(
      languageCode
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

                return;
              }


              if (
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
          collected.length === 0 &&
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
          text.length <= 320
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

    if (!value) {
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

    if (!value) {
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


  const publishedDate =
    formatDate(
      publishedValue
    );


  const relativePublishedDate =
    formatRelativeTime(
      publishedValue
    );


  // =======================================================
  // LIKE
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


      const serverLiked =
        data?.liked ??
        data?.is_liked;


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
  // REPOST
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
                    : nextReposted,

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
  // SHARE RESET
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
  // COPY URL
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
        "Unable to copy link."
      );
    }


    setShareState(
      "copied"
    );


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
      language === "bn"
        ? `${authorName}-এর "${shareTitle}" লেখাটি SHOBDO-তে পড়ুন।`
        : language === "hi"
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
  // COPY LINK FROM MENU
  // =======================================================

  async function handleMenuCopyLink() {

    setMenuOpen(
      false
    );


    if (
      !hasWritingId
    ) {

      return;
    }


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
  // SHARE PRESENTATION
  // =======================================================

  const shareSuccessful =
    shareState ===
      "copied" ||
    shareState ===
      "shared";


  const shareLabel =
    shareState === "copied"
      ? labels.copied
      : shareState === "shared"
        ? labels.shared
        : shareState === "error"
          ? labels.shareFailed
          : labels.share;


  // =======================================================
  // SAFETY
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
          HEADER
      ================================================== */}

      <header
        className="writing-card-header"
      >

        <div
          className="writing-author-section"
        >

          {hasAuthorId
            ? (

              <Link
                to={
                  `/users/${authorId}`
                }
                className="writing-author-avatar"
                aria-label={
                  `${authorName} profile`
                }
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
                        {
                          authorInitials
                        }
                      </span>

                    )
                    : (

                      <User
                        size={18}
                      />

                    )}

              </Link>

            )
            : (

              <div
                className="writing-author-avatar"
              >

                {authorInitials
                  ? (
                    <span>
                      {
                        authorInitials
                      }
                    </span>
                  )
                  : (
                    <User
                      size={18}
                    />
                  )}

              </div>

            )}


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
              () =>
                setMenuOpen(
                  (
                    current
                  ) =>
                    !current
                )
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
                  () => {

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
          SOCIAL ACTIONS — COMPACT ICON-ONLY TOOLBAR
      ================================================== */}

      <footer
        className="writing-card-footer writing-card-footer--compact"
      >

        <div
          className="writing-card-actions writing-card-actions--icons"
          role="group"
          aria-label={
            language === "bn"
              ? "লেখার কার্যক্রম"
              : language === "hi"
                ? "रचना क्रियाएँ"
                : "Writing actions"
          }
        >

          {/* LIKE */}

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
              }${
                likesCount > 0
                  ? ` (${likesCount})`
                  : ""
              }`
            }
            title={
              `${
                liked
                  ? labels.unlike
                  : labels.like
              }${
                likesCount > 0
                  ? ` · ${likesCount}`
                  : ""
              }`
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

          </button>


          {/* COMMENT */}

          <Link
            to={
              `/writings/${writingId}#comments`
            }
            className="writing-action-button writing-comment-button"
            aria-label={
              `${labels.comment}${
                commentsCount > 0
                  ? ` (${commentsCount})`
                  : ""
              }`
            }
            title={
              `${labels.comment}${
                commentsCount > 0
                  ? ` · ${commentsCount}`
                  : ""
              }`
            }
          >

            <MessageCircle
              size={20}
              strokeWidth={1.9}
              aria-hidden="true"
            />

          </Link>


          {/* REPOST */}

          <button
            type="button"
            className={
              reposted
                ? "writing-action-button writing-repost-button active"
                : "writing-action-button writing-repost-button"
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
              `${
                reposted
                  ? labels.unrepost
                  : labels.repost
              }${
                repostsCount > 0
                  ? ` (${repostsCount})`
                  : ""
              }`
            }
            title={
              `${
                reposted
                  ? labels.unrepost
                  : labels.repost
              }${
                repostsCount > 0
                  ? ` · ${repostsCount}`
                  : ""
              }`
            }
          >

            <Repeat2
              size={20}
              strokeWidth={1.9}
              aria-hidden="true"
            />

          </button>


          {/* SHARE */}

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
              shareLabel
            }
            title={
              shareLabel
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

          </button>


          {/* SAVE */}

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