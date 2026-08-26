import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  Globe2,
  Heart,
  Loader2,
  MessageCircle,
  RefreshCw,
  Share2,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWriting,
  likeWriting,
} from "../api/api";

import {
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";


function WritingDetails() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    t,
  } = useLanguage();


  // =====================================================
  // STATE
  // =====================================================

  const [
    writing,
    setWriting,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    likesCount,
    setLikesCount,
  ] = useState(0);

  const [
    liked,
    setLiked,
  ] = useState(false);

  const [
    liking,
    setLiking,
  ] = useState(false);

  const [
    shareSuccess,
    setShareSuccess,
  ] = useState(false);


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
  // LOAD WRITING
  // =====================================================

  useEffect(() => {

    let mounted = true;


    async function loadWriting() {

      setLoading(true);

      setError("");


      try {

        const data =
          await getWriting(
            id
          );


        if (!mounted) {
          return;
        }


        const loadedWriting =
          data?.writing ||
          null;


        if (!loadedWriting) {

          throw new Error(
            t(
              "writingDetails.notFound"
            )
          );

        }


        setWriting(
          loadedWriting
        );


        setLikesCount(
          loadedWriting
            ?.likes_count ||
          0
        );


        if (
          typeof loadedWriting
            ?.liked_by_current_user
          === "boolean"
        ) {

          setLiked(
            loadedWriting
              .liked_by_current_user
          );

        }


      } catch (err) {

        console.error(
          "WRITING DETAILS ERROR:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err.message ||
          t(
            "writingDetails.unavailable"
          )
        );


      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadWriting();


    return () => {

      mounted = false;

    };

  }, [
    id,
    t,
  ]);


  // =====================================================
  // WORD COUNT
  // =====================================================

  const wordCount =
    useMemo(() => {

      if (
        !writing?.content
      ) {

        return 0;

      }


      const content =
        writing.content.trim();


      if (!content) {

        return 0;

      }


      return content
        .split(/\s+/)
        .filter(Boolean)
        .length;

    }, [writing]);


  // =====================================================
  // READING TIME
  // =====================================================

  const readingTime =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            wordCount / 180
          )
        ),
      [wordCount]
    );


  // =====================================================
  // DATE
  // =====================================================

  function formatDate(
    dateString
  ) {

    if (!dateString) {

      return t(
        "common.noData"
      );

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

      return t(
        "common.noData"
      );

    }


    try {

      return new Intl.DateTimeFormat(
        undefined,
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(date);

    } catch {

      return date
        .toLocaleDateString();

    }

  }


  // =====================================================
  // LIKE
  // =====================================================

  async function handleLike() {

    if (
      liking ||
      !writing?.id
    ) {

      return;

    }


    setLiking(true);


    try {

      const data =
        await likeWriting(
          writing.id
        );


      if (
        typeof data?.liked
        === "boolean"
      ) {

        setLiked(
          data.liked
        );

      }


      if (
        typeof data
          ?.likes_count
        === "number"
      ) {

        setLikesCount(
          data.likes_count
        );

      }


    } catch (err) {

      console.error(
        "LIKE WRITING ERROR:",
        err
      );


    } finally {

      setLiking(false);

    }

  }


  // =====================================================
  // SHARE
  // =====================================================

  async function handleShare() {

    const shareData = {

      title:
        writing?.title ||
        "SHOBDO",

      text:
        writing?.title ||
        "SHOBDO",

      url:
        window.location.href,
    };


    try {

      if (
        navigator.share
      ) {

        await navigator.share(
          shareData
        );

        return;

      }


      await navigator.clipboard
        .writeText(
          window.location.href
        );


      setShareSuccess(true);


      window.setTimeout(
        () => {

          setShareSuccess(false);

        },
        1800
      );


    } catch (err) {

      if (
        err?.name !==
        "AbortError"
      ) {

        console.error(
          "SHARE ERROR:",
          err
        );

      }

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <main className="writing-details-page">

        <div className="writing-details-container">

          <div className="writing-details-loading">

            <Loader2
              size={30}
              className="spin"
            />

            <p>

              {t(
                "writingDetails.loading"
              )}

            </p>

          </div>

        </div>

      </main>
    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (
    error ||
    !writing
  ) {

    return (
      <main className="writing-details-page">

        <div className="writing-details-container">

          <section className="writing-details-error">

            <div className="details-error-icon">

              <AlertCircle
                size={30}
              />

            </div>


            <h1>

              {t(
                "writingDetails.notFound"
              )}

            </h1>


            <p>

              {
                error ||
                t(
                  "writingDetails.unavailable"
                )
              }

            </p>


            <div className="details-error-actions">

              <button
                type="button"

                className="primary-button"

                onClick={() =>
                  window.location.reload()
                }
              >

                <RefreshCw
                  size={17}
                />

                {t(
                  "writingDetails.retry"
                )}

              </button>


              <Link
                to="/explore"
                className="details-secondary-link"
              >

                <ArrowLeft
                  size={17}
                />

                {t(
                  "writingDetails.backToExplore"
                )}

              </Link>

            </div>

          </section>

        </div>

      </main>
    );

  }


  // =====================================================
  // DATA
  // =====================================================

  const authorName =
    writing.author?.name ||
    t(
      "common.unknownAuthor"
    );


  const category =
    getCategoryLabel(
      writing.category
    );


  const languageCode =
    writing.language ||
    "bn";


  const languageLabel =
    getLanguageLabel(
      languageCode
    );


  const publishedDate =
    formatDate(
      writing.published_at ||
      writing.created_at
    );


  const paragraphs =
    writing.content
      ? writing.content.split(
        "\n"
      )
      : [];


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="writing-details-page">

      <div className="writing-details-container">


        {/* ===============================================
            BACK
        ================================================ */}

        <button
          type="button"

          className="writing-details-back"

          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft size={17} />

          {t(
            "writingDetails.back"
          )}

        </button>


        {/* ===============================================
            ARTICLE
        ================================================ */}

        <article className="writing-details-article">


          {/* =============================================
              HEADER
          ============================================== */}

          <header className="writing-details-header">


            {/* LANGUAGE + CATEGORY */}

            <div className="writing-details-badges">

              <span className="writing-details-language">

                <Globe2 size={13} />

                {languageLabel}

              </span>


              <span className="writing-details-category">

                {category}

              </span>

            </div>


            {/* TITLE */}

            <h1>

              {
                writing.title ||
                t(
                  "common.untitled"
                )
              }

            </h1>


            {/* AUTHOR */}

            <div className="writing-details-author">

              <div className="details-author-avatar">

                {
                  authorName
                    ?.trim()
                    ?.charAt(0)
                    ?.toUpperCase()
                  ||
                  <User size={18} />
                }

              </div>


              <div>

                <span className="writing-details-author-label">

                  {t(
                    "writingDetails.by"
                  )}

                </span>


                <strong>

                  {authorName}

                </strong>


                <div className="writing-details-meta">


                  {/* DATE */}

                  <span>

                    <CalendarDays
                      size={14}
                    />

                    {publishedDate}

                  </span>


                  {/* READING TIME */}

                  <span>

                    <Clock3
                      size={14}
                    />

                    {readingTime}

                    {" "}

                    {t(
                      "writingDetails.readingTime"
                    )}

                  </span>


                  {/* WORD COUNT */}

                  <span>

                    <BookOpen
                      size={14}
                    />

                    {wordCount}

                    {" "}

                    {t(
                      "writingDetails.words"
                    )}

                  </span>

                </div>

              </div>

            </div>


            {/* ===========================================
                ACTION BAR
            ============================================ */}

            <div className="writing-details-actions">


              {/* LIKE */}

              <button
                type="button"

                className={
                  liked
                    ? "writing-details-action liked"
                    : "writing-details-action"
                }

                onClick={
                  handleLike
                }

                disabled={
                  liking
                }
              >

                {
                  liking
                    ? (
                      <Loader2
                        size={16}
                        className="spin"
                      />
                    )
                    : (
                      <Heart
                        size={16}
                        fill={
                          liked
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )
                }


                <span>

                  {
                    liked
                      ? t(
                        "writingDetails.liked"
                      )
                      : t(
                        "writingDetails.like"
                      )
                  }

                </span>


                <strong>
                  {likesCount}
                </strong>

              </button>


              {/* COMMENTS */}

              <div className="writing-details-action">

                <MessageCircle
                  size={16}
                />

                <span>

                  {t(
                    "writingDetails.comments"
                  )}

                </span>

                <strong>

                  {
                    writing
                      .comments_count ||
                    0
                  }

                </strong>

              </div>


              {/* SHARE */}

              <button
                type="button"

                className="writing-details-action"

                onClick={
                  handleShare
                }
              >

                <Share2 size={16} />

                <span>

                  {
                    shareSuccess
                      ? t(
                        "common.saved",
                        "Copied"
                      )
                      : t(
                        "writingDetails.share"
                      )
                  }

                </span>

              </button>

            </div>

          </header>


          {/* =============================================
              DIVIDER
          ============================================== */}

          <div className="writing-details-divider" />


          {/* =============================================
              ORIGINAL LANGUAGE NOTE
          ============================================== */}

          <div className="writing-original-language">

            <Globe2 size={14} />

            <span>

              {t(
                "writingDetails.originalLanguage"
              )}

              :

            </span>

            <strong>

              {languageLabel}

            </strong>

          </div>


          {/* =============================================
              ORIGINAL WRITING CONTENT
          ============================================== */}

          <section className="writing-details-content">

            {
              paragraphs.map(
                (
                  paragraph,
                  index
                ) => {

                  if (
                    !paragraph.trim()
                  ) {

                    return (
                      <div
                        key={
                          `empty-${index}`
                        }
                        className="writing-empty-line"
                      />
                    );

                  }


                  return (
                    <p
                      key={
                        `paragraph-${index}`
                      }
                    >

                      {paragraph}

                    </p>
                  );

                }
              )
            }

          </section>


          {/* =============================================
              FOOTER
          ============================================== */}

          <footer className="writing-details-footer">

            <div className="writing-details-footer-author">

              <span>

                {t(
                  "writingDetails.by"
                )}

              </span>

              <strong>

                {authorName}

              </strong>

            </div>


            <div className="writing-details-footer-links">

              <span className="writing-details-footer-language">

                <Globe2
                  size={15}
                />

                {languageLabel}

              </span>


              <Link
                to="/explore"
              >

                {t(
                  "writingDetails.moreWritings"
                )}

              </Link>

            </div>

          </footer>

        </article>

      </div>

    </main>
  );

}


export default WritingDetails;