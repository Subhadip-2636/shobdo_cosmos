import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Clock3,
  Globe2,
  Hash,
  Heart,
  MessageCircle,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getSavedWritingStatus,
  getToken,
  saveWriting,
  toggleLike,
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
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    `${parts[0][0]}${parts[1][0]}`
  ).toUpperCase();
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


  // Keep local interaction state synchronized if this card
  // receives another writing or refreshed server data.

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
  // RESET SAVE STATE WHEN WRITING CHANGES
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
  // TAGS / HASHTAGS
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
                typeof tag === "string"
              ) {

                source.push({
                  name:
                    tag,
                });

                return;

              }


              if (
                tag &&
                typeof tag === "object"
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
                  tag?.name || ""
                )
                  .trim()
                  .replace(
                    /^#+/,
                    ""
                  )
                  .trim();


              if (!name) {

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


        if (!text) {

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
          `${text.slice(
            0,
            240
          ).trim()}…`
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


        if (!content) {

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
        wordCount / 180
      )
    );


  // =======================================================
  // FULL DATE
  // =======================================================

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


    // -----------------------------------------------------
    // OPTIMISTIC UI
    // -----------------------------------------------------

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

      // Restore optimistic state.

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


    // -----------------------------------------------------
    // OPTIMISTIC UI
    // -----------------------------------------------------

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

      {/* ===============================================
          HEADER / AUTHOR
      ================================================ */}

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


      {/* ===============================================
          BADGES
      ================================================ */}

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


      {/* ===============================================
          TITLE
      ================================================ */}

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


      {/* ===============================================
          CONTENT PREVIEW
      ================================================ */}

      <p
        className="writing-card-preview"
      >

        {
          preview
        }

      </p>


      {/* ===============================================
          CLICKABLE HASHTAGS
      ================================================ */}

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


      {/* ===============================================
          READING META
      ================================================ */}

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


      {/* ===============================================
          FOOTER ACTIONS
      ================================================ */}

      <div
        className="writing-card-footer"
      >

        <div
          className="writing-card-social"
        >

          {/* ===========================================
              LIKE
          ============================================ */}

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


          {/* ===========================================
              COMMENTS
          ============================================ */}

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


          {/* ===========================================
              SAVE
          ============================================ */}

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


        {/* =============================================
            READ
        ============================================== */}

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