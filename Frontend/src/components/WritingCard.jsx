import {
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  Clock3,
  Globe2,
  Heart,
  MessageCircle,
  User,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  likeWriting,
} from "../api/api";

import {
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// WRITING CARD
// =========================================================

function WritingCard({
  writing,
}) {

  const {
    t,
  } = useLanguage();


  // =====================================================
  // LIKE STATE
  // =====================================================

  const [
    likesCount,
    setLikesCount,
  ] = useState(
    Number(
      writing?.likes_count ??
      writing?.likes ??
      0
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


  // =====================================================
  // CATEGORY LABEL
  // =====================================================

  function getCategoryLabel(
    value
  ) {

    const map = {

      "কবিতা":
        t(
          "categories.poetry"
        ),

      "গল্প":
        t(
          "categories.story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay"
        ),

      "অন্যান্য":
        t(
          "categories.other"
        ),

    };


    return (
      map[value] ||
      value ||
      t(
        "categories.other"
      )
    );

  }


  // =====================================================
  // AUTHOR DATA
  // =====================================================

  const authorId =
    Number(
      writing?.author?.id ??
      writing?.user?.id ??
      writing?.user_id ??
      writing?.author_id ??
      0
    );


  const hasAuthorId =
    Number.isFinite(
      authorId
    ) &&
    authorId > 0;


  const authorName =
    writing?.author?.name ||
    writing?.user?.name ||
    writing?.author_name ||
    writing?.user_name ||
    t(
      "common.unknownAuthor"
    );


  // =====================================================
  // CATEGORY / LANGUAGE
  // =====================================================

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


  // =====================================================
  // PREVIEW
  // =====================================================

  const preview =
    useMemo(
      () => {

        const text =
          writing?.content
            ?.trim() ||
          "";


        if (
          !text
        ) {

          return t(
            "writingCard.previewUnavailable"
          );

        }


        if (
          text.length <=
          190
        ) {

          return text;

        }


        return (
          `${text.slice(
            0,
            190
          )}...`
        );

      },
      [
        writing?.content,
        t,
      ]
    );


  // =====================================================
  // WORD COUNT
  // =====================================================

  const wordCount =
    useMemo(
      () => {

        const content =
          writing?.content ||
          "";


        if (
          !content.trim()
        ) {

          return 0;

        }


        return content
          .trim()
          .split(
            /\s+/
          )
          .filter(
            Boolean
          )
          .length;

      },
      [
        writing?.content,
      ]
    );


  // =====================================================
  // READING TIME
  // =====================================================

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        wordCount /
        180
      )
    );


  // =====================================================
  // DATE
  // =====================================================

  function formatDate(
    dateString
  ) {

    if (
      !dateString
    ) {

      return "";

    }


    const date =
      new Date(
        dateString
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
        undefined,
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

      return date
        .toLocaleDateString();

    }

  }


  const publishedDate =
    formatDate(
      writing?.published_at ||
      writing?.created_at
    );


  // =====================================================
  // LIKE
  // =====================================================

  async function handleLike(
    event
  ) {

    event.preventDefault();

    event.stopPropagation();


    if (
      liking ||
      !writing?.id
    ) {

      return;

    }


    setLiking(
      true
    );


    try {

      const data =
        await likeWriting(
          writing.id
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
        typeof data?.likes_count ===
        "number"
      ) {

        setLikesCount(
          data.likes_count
        );

      } else if (
        typeof data?.writing
          ?.likes_count ===
        "number"
      ) {

        setLikesCount(
          data.writing
            .likes_count
        );

      } else if (
        typeof data?.likes ===
        "number"
      ) {

        setLikesCount(
          data.likes
        );

      }


    } catch (
      error
    ) {

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


  // =====================================================
  // AUTHOR CONTENT
  // =====================================================

  const authorContent = (

    <>

      <div
        className="writing-author-avatar"
      >

        {
          authorName
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase()
          ||
          <User
            size={15}
          />
        }

      </div>


      <div
        className="writing-author-info"
      >

        <span>

          {
            t(
              "writingCard.by"
            )
          }

        </span>


        <strong>

          {
            authorName
          }

        </strong>

      </div>

    </>

  );


  // =====================================================
  // UI
  // =====================================================

  return (

    <article
      className="writing-card"
    >


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
          `/writings/${writing.id}`
        }

        className="writing-card-title-link"

      >

        <h2
          className="writing-card-title"
        >

          {
            writing?.title ||
            t(
              "common.untitled"
            )
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
          AUTHOR
      ================================================ */}

      {
        hasAuthorId
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

            )
      }


      {/* ===============================================
          META
      ================================================ */}

      <div
        className="writing-card-meta"
      >


        {
          publishedDate && (

            <span>

              <CalendarDays
                size={13}
              />

              {
                publishedDate
              }

            </span>

          )
        }


        <span>

          <Clock3
            size={13}
          />

          {
            readingTime
          }

          {" "}

          {
            t(
              "writingCard.minutes"
            )
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
            t(
              "writingCard.words"
            )
          }

        </span>

      </div>


      {/* ===============================================
          FOOTER
      ================================================ */}

      <div
        className="writing-card-footer"
      >


        {/* =============================================
            SOCIAL STATS
        ============================================== */}

        <div
          className="writing-card-social"
        >


          {/* LIKE */}

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

            aria-label={
              t(
                "writingCard.like"
              )
            }

            title={
              t(
                "writingCard.like"
              )
            }

          >

            <Heart

              size={15}

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


          {/* COMMENTS */}

          <span

            className="writing-comment-count"

            title={
              t(
                "writingCard.comments"
              )
            }

          >

            <MessageCircle
              size={15}
            />

            {
              Number(
                writing?.comments_count ??
                writing?.comments ??
                0
              )
            }

          </span>

        </div>


        {/* =============================================
            READ
        ============================================== */}

        <Link

          to={
            `/writings/${writing.id}`
          }

          className="writing-read-link"

        >

          {
            t(
              "writingCard.read"
            )
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