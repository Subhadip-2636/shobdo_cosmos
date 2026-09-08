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
  Send,
  Share2,
  Trash2,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWriting,

  getWritingLikes,
  getMyLikeStatus,
  likeWriting,
  unlikeWriting,

  getComments,
  addComment,
  deleteComment,
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


  // =====================================================
  // LIKE STATE
  // =====================================================

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


  // =====================================================
  // COMMENT STATE
  // =====================================================

  const [
    comments,
    setComments,
  ] = useState([]);


  const [
    commentsLoading,
    setCommentsLoading,
  ] = useState(false);


  const [
    commentText,
    setCommentText,
  ] = useState("");


  const [
    submittingComment,
    setSubmittingComment,
  ] = useState(false);


  const [
    deletingCommentId,
    setDeletingCommentId,
  ] = useState(null);


  const [
    commentError,
    setCommentError,
  ] = useState("");


  // =====================================================
  // SHARE STATE
  // =====================================================

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
  // WRITING ID
  // =====================================================

  const writingId =
    Number(id);


  // =====================================================
  // LOAD WRITING
  // =====================================================

  useEffect(() => {

    let mounted = true;


    async function loadWriting() {

      setLoading(true);

      setError("");


      try {

        if (
          !Number.isFinite(
            writingId
          ) ||
          writingId <= 0
        ) {

          throw new Error(
            t(
              "writingDetails.notFound"
            )
          );

        }


        const data =
          await getWriting(
            writingId
          );


        if (!mounted) {
          return;
        }


        const loadedWriting =
          data?.writing ||
          (
            data?.id
              ? data
              : null
          );


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
          Number(
            loadedWriting
              ?.likes_count ||
            0
          )
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
          err?.message ||
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
    writingId,
    t,
  ]);


  // =====================================================
  // LOAD LIKE COUNT
  // =====================================================

  useEffect(() => {

    if (!writing?.id) {
      return;
    }


    let mounted = true;


    async function loadLikes() {

      try {

        const data =
          await getWritingLikes(
            writing.id
          );


        if (!mounted) {
          return;
        }


        setLikesCount(
          Number(
            data?.likes_count ??
            data?.count ??
            0
          )
        );


      } catch (err) {

        console.error(
          "LOAD LIKES ERROR:",
          err
        );

      }

    }


    loadLikes();


    return () => {

      mounted = false;

    };

  }, [
    writing?.id,
  ]);


  // =====================================================
  // LOAD CURRENT USER LIKE STATUS
  // =====================================================

  useEffect(() => {

    if (!writing?.id) {
      return;
    }


    let mounted = true;


    async function loadLikeStatus() {

      try {

        const data =
          await getMyLikeStatus(
            writing.id
          );


        if (!mounted) {
          return;
        }


        setLiked(
          Boolean(
            data?.liked ??
            data?.is_liked ??
            data?.has_liked
          )
        );


        if (
          typeof data?.likes_count
          === "number"
        ) {

          setLikesCount(
            data.likes_count
          );

        }


      } catch (err) {

        if (mounted) {

          setLiked(false);

        }

      }

    }


    loadLikeStatus();


    return () => {

      mounted = false;

    };

  }, [
    writing?.id,
  ]);


  // =====================================================
  // LOAD COMMENTS
  // =====================================================

  useEffect(() => {

    if (!writing?.id) {
      return;
    }


    let mounted = true;


    async function loadComments() {

      setCommentsLoading(
        true
      );

      setCommentError("");


      try {

        const data =
          await getComments(
            writing.id
          );


        if (!mounted) {
          return;
        }


        const loadedComments =
          Array.isArray(data)
            ? data
            : (
                Array.isArray(
                  data?.comments
                )
                  ? data.comments
                  : []
              );


        setComments(
          loadedComments
        );


      } catch (err) {

        console.error(
          "LOAD COMMENTS ERROR:",
          err
        );


        if (!mounted) {
          return;
        }


        setCommentError(
          err?.message ||
          t(
            "writingDetails.commentSection.loadError"
          )
        );


      } finally {

        if (mounted) {

          setCommentsLoading(
            false
          );

        }

      }

    }


    loadComments();


    return () => {

      mounted = false;

    };

  }, [
    writing?.id,
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

    }, [
      writing,
    ]);


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

      [
        wordCount,
      ]
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
          day:
            "numeric",

          month:
            "long",

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


  // =====================================================
  // LIKE / UNLIKE
  // =====================================================

  async function handleLike() {

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
        liked
          ? await unlikeWriting(
              writing.id
            )
          : await likeWriting(
              writing.id
            );


      if (
        typeof data?.liked
        === "boolean"
      ) {

        setLiked(
          data.liked
        );

      } else {

        setLiked(
          !liked
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


      window.alert(
        err?.message ||
        t(
          "writingDetails.likeError"
        )
      );


    } finally {

      setLiking(
        false
      );

    }

  }


  // =====================================================
  // ADD COMMENT
  // =====================================================

  async function handleCommentSubmit(
    event
  ) {

    event.preventDefault();


    if (
      submittingComment ||
      !writing?.id
    ) {

      return;

    }


    const content =
      commentText.trim();


    if (!content) {

      return;

    }


    if (
      content.length > 2000
    ) {

      setCommentError(
        t(
          "writingDetails.commentSection.tooLong"
        )
      );

      return;

    }


    setSubmittingComment(
      true
    );

    setCommentError("");


    try {

      const data =
        await addComment(
          writing.id,
          content
        );


      const newComment =
        data?.comment ||
        data;


      if (
        newComment?.id
      ) {

        setComments(
          (
            currentComments
          ) => [

            newComment,

            ...currentComments,

          ]
        );

      }


      setCommentText("");


    } catch (err) {

      console.error(
        "ADD COMMENT ERROR:",
        err
      );


      setCommentError(
        err?.message ||
        t(
          "writingDetails.commentSection.addError"
        )
      );


    } finally {

      setSubmittingComment(
        false
      );

    }

  }


  // =====================================================
  // DELETE COMMENT
  // =====================================================

  async function handleDeleteComment(
    commentId
  ) {

    if (
      !commentId ||
      deletingCommentId
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        t(
          "writingDetails.commentSection.deleteConfirm"
        )
      );


    if (!confirmed) {

      return;

    }


    setDeletingCommentId(
      commentId
    );

    setCommentError("");


    try {

      await deleteComment(
        commentId
      );


      setComments(
        (
          currentComments
        ) =>
          currentComments.filter(
            (comment) =>
              comment.id !==
              commentId
          )
      );


    } catch (err) {

      console.error(
        "DELETE COMMENT ERROR:",
        err
      );


      setCommentError(
        err?.message ||
        t(
          "writingDetails.commentSection.deleteError"
        )
      );


    } finally {

      setDeletingCommentId(
        null
      );

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


      setShareSuccess(
        true
      );


      window.setTimeout(
        () => {

          setShareSuccess(
            false
          );

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
    writing.user?.name ||
    writing.author_name ||
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


        {/* =================================================
            BACK
        ================================================== */}

        <button
          type="button"

          className="writing-details-back"

          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft
            size={17}
          />

          {t(
            "writingDetails.back"
          )}

        </button>


        {/* =================================================
            ARTICLE
        ================================================== */}

        <article className="writing-details-article">


          {/* ===============================================
              HEADER
          ================================================ */}

          <header className="writing-details-header">


            {/* LANGUAGE + CATEGORY */}

            <div className="writing-details-badges">

              <span className="writing-details-language">

                <Globe2
                  size={13}
                />

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
                  <User
                    size={18}
                  />
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


                  <span>

                    <CalendarDays
                      size={14}
                    />

                    {publishedDate}

                  </span>


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


            {/* =============================================
                ACTION BAR
            ============================================== */}

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

              <a
                href="#comments"

                className="writing-details-action"
              >

                <MessageCircle
                  size={16}
                />

                <span>

                  {t(
                    "writingDetails.comments"
                  )}

                </span>

                <strong>

                  {comments.length}

                </strong>

              </a>


              {/* SHARE */}

              <button
                type="button"

                className="writing-details-action"

                onClick={
                  handleShare
                }
              >

                <Share2
                  size={16}
                />

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


          {/* ===============================================
              DIVIDER
          ================================================ */}

          <div className="writing-details-divider" />


          {/* ===============================================
              ORIGINAL LANGUAGE
          ================================================ */}

          <div className="writing-original-language">

            <Globe2
              size={14}
            />

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


          {/* ===============================================
              WRITING CONTENT
          ================================================ */}

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


          {/* ===============================================
              COMMENTS
          ================================================ */}

          <section
            id="comments"

            className="writing-comments-section"
          >

            <div className="writing-comments-heading">

              <div>

                <span className="writing-comments-eyebrow">

                  {t(
                    "writingDetails.commentSection.community"
                  )}

                </span>


                <h2>

                  <MessageCircle
                    size={22}
                  />

                  {t(
                    "writingDetails.commentSection.title"
                  )}

                </h2>

              </div>


              <span className="writing-comments-total">

                {comments.length}

              </span>

            </div>


            {/* =============================================
                COMMENT FORM
            ============================================== */}

            <form
              className="writing-comment-form"

              onSubmit={
                handleCommentSubmit
              }
            >

              <div className="writing-comment-input-wrap">

                <div className="writing-comment-avatar writing-comment-avatar-me">

                  <User
                    size={18}
                  />

                </div>


                <textarea
                  value={
                    commentText
                  }

                  onChange={
                    (event) => {

                      setCommentText(
                        event.target.value
                      );


                      if (
                        commentError
                      ) {

                        setCommentError("");

                      }

                    }
                  }

                  placeholder={
                    t(
                      "writingDetails.commentSection.placeholder"
                    )
                  }

                  rows={4}

                  maxLength={2000}
                />

              </div>


              <div className="writing-comment-form-footer">

                <span className="writing-comment-limit">

                  {commentText.length}/2000

                </span>


                <button
                  type="submit"

                  className="writing-comment-submit"

                  disabled={
                    submittingComment ||
                    !commentText.trim()
                  }
                >

                  {
                    submittingComment
                      ? (

                        <Loader2
                          size={17}
                          className="spin"
                        />

                      )
                      : (

                        <Send
                          size={17}
                        />

                      )
                  }


                  <span>

                    {
                      submittingComment
                        ? t(
                            "writingDetails.commentSection.posting"
                          )
                        : t(
                            "writingDetails.commentSection.post"
                          )
                    }

                  </span>

                </button>

              </div>

            </form>


            {/* =============================================
                COMMENT ERROR
            ============================================== */}

            {
              commentError && (

                <div className="writing-comment-error">

                  <AlertCircle
                    size={17}
                  />

                  <span>

                    {commentError}

                  </span>

                </div>

              )
            }


            {/* =============================================
                COMMENTS LIST
            ============================================== */}

            <div className="writing-comments-list">

              {
                commentsLoading
                  ? (

                    <div className="writing-comments-loading">

                      <Loader2
                        size={23}
                        className="spin"
                      />

                      <span>

                        {t(
                          "writingDetails.commentSection.loading"
                        )}

                      </span>

                    </div>

                  )
                  : comments.length === 0
                    ? (

                      <div className="writing-comments-empty">

                        <div className="writing-comments-empty-icon">

                          <MessageCircle
                            size={27}
                          />

                        </div>


                        <strong>

                          {t(
                            "writingDetails.commentSection.emptyTitle"
                          )}

                        </strong>


                        <p>

                          {t(
                            "writingDetails.commentSection.emptyDescription"
                          )}

                        </p>

                      </div>

                    )
                    : (

                      comments.map(
                        (
                          comment
                        ) => {

                          const commentAuthor =
                            comment
                              ?.author
                              ?.name ||
                            comment
                              ?.user
                              ?.name ||
                            comment
                              ?.author_name ||
                            t(
                              "writingDetails.commentSection.unknownUser"
                            );


                          const commentDate =
                            formatDate(
                              comment
                                ?.created_at
                            );


                          return (

                            <article
                              key={
                                comment.id
                              }

                              className="writing-comment-card"
                            >

                              <div className="writing-comment-avatar">

                                {
                                  commentAuthor
                                    ?.trim()
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                  ||
                                  <User
                                    size={17}
                                  />
                                }

                              </div>


                              <div className="writing-comment-body">

                                <div className="writing-comment-header">

                                  <div className="writing-comment-author">

                                    <strong>

                                      {commentAuthor}

                                    </strong>


                                    {
                                      comment
                                        ?.created_at && (

                                        <span>

                                          {commentDate}

                                        </span>

                                      )
                                    }

                                  </div>


                                  <button
                                    type="button"

                                    className="writing-comment-delete"

                                    onClick={() =>
                                      handleDeleteComment(
                                        comment.id
                                      )
                                    }

                                    disabled={
                                      deletingCommentId ===
                                      comment.id
                                    }

                                    title={
                                      t(
                                        "writingDetails.commentSection.delete"
                                      )
                                    }

                                    aria-label={
                                      t(
                                        "writingDetails.commentSection.delete"
                                      )
                                    }
                                  >

                                    {
                                      deletingCommentId ===
                                      comment.id
                                        ? (

                                          <Loader2
                                            size={15}
                                            className="spin"
                                          />

                                        )
                                        : (

                                          <Trash2
                                            size={15}
                                          />

                                        )
                                    }

                                  </button>

                                </div>


                                <p>

                                  {comment.content}

                                </p>

                              </div>

                            </article>

                          );

                        }
                      )

                    )
              }

            </div>

          </section>


          {/* ===============================================
              FOOTER
          ================================================ */}

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