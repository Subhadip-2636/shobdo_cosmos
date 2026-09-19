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
  Check,
  Clock3,
  Edit3,
  Globe2,
  Heart,
  Loader2,
  MessageCircle,
  RefreshCw,
  Reply,
  Send,
  Share2,
  Trash2,
  User,
  X,
} from "lucide-react";


import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  addComment,
  deleteComment,
  getComments,
  getMyLikeStatus,
  getToken,
  getWriting,
  getWritingLikes,
  likeWriting,
  replyToComment,
  unlikeWriting,
  updateComment,
} from "../api/api";


import {
  getCurrentUser,
} from "../api/auth";


import {
  getLanguageLabel,
} from "../config/languages";


import {
  useLanguage,
} from "../Language/LanguageContext";


import SEO from "../components/SEO";

import "./WritingDetails.css";


// =========================================================
// GENERAL HELPERS
// =========================================================

function countCommentTree(
  items = []
) {

  return items.reduce(
    (
      total,
      item
    ) => {

      return (
        total +
        1 +
        countCommentTree(
          item?.replies || []
        )
      );

    },
    0
  );

}


// =========================================================
// APPEND REPLY INSIDE NESTED COMMENT TREE
// =========================================================

function appendReplyToTree(
  items,
  parentId,
  reply
) {

  return items.map(
    (
      item
    ) => {

      if (
        Number(
          item.id
        ) ===
        Number(
          parentId
        )
      ) {

        return {

          ...item,

          reply_count:
            Number(
              item.reply_count ||
              0
            ) + 1,

          replies: [

            ...(
              Array.isArray(
                item.replies
              )
                ? item.replies
                : []
            ),

            reply,

          ],

        };

      }


      return {

        ...item,

        replies:
          appendReplyToTree(
            Array.isArray(
              item.replies
            )
              ? item.replies
              : [],

            parentId,

            reply
          ),

      };

    }
  );

}


// =========================================================
// UPDATE COMMENT INSIDE TREE
// =========================================================

function updateCommentInTree(
  items,
  updatedComment
) {

  return items.map(
    (
      item
    ) => {

      if (
        Number(
          item.id
        ) ===
        Number(
          updatedComment.id
        )
      ) {

        return {

          ...item,

          ...updatedComment,

          replies:
            updatedComment
              ?.replies
              ?.length
              ? updatedComment.replies
              : item.replies ||
                [],

        };

      }


      return {

        ...item,

        replies:
          updateCommentInTree(
            Array.isArray(
              item.replies
            )
              ? item.replies
              : [],

            updatedComment
          ),

      };

    }
  );

}


// =========================================================
// REMOVE COMMENT INSIDE TREE
// =========================================================

function removeCommentFromTree(
  items,
  commentId
) {

  return items

    .filter(
      (
        item
      ) =>

        Number(
          item.id
        ) !==
        Number(
          commentId
        )
    )

    .map(
      (
        item
      ) => {

        const oldReplies =
          Array.isArray(
            item.replies
          )
            ? item.replies
            : [];


        const newReplies =
          removeCommentFromTree(
            oldReplies,
            commentId
          );


        return {

          ...item,

          reply_count:
            newReplies.length !==
            oldReplies.length

              ? Math.max(
                  0,
                  Number(
                    item.reply_count ||
                    0
                  ) - 1
                )

              : item.reply_count,

          replies:
            newReplies,

        };

      }
    );

}


// =========================================================
// SEO HELPERS
// =========================================================

function stripHtml(
  value
) {

  return String(
    value ||
    ""
  )
    .replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


function makeSeoDescription(
  content,
  title = ""
) {

  const cleanContent =
    stripHtml(
      content
    );


  const cleanTitle =
    stripHtml(
      title
    );


  const source =
    cleanContent ||
    cleanTitle ||
    "Read this writing on SHOBDO.";


  if (
    source.length <=
      158
  ) {

    return source;

  }


  return (
    `${source
      .slice(
        0,
        155
      )
      .trim()}…`
  );

}


function toIsoDate(
  value
) {

  if (
    !value
  ) {

    return undefined;

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

    return undefined;

  }


  return date.toISOString();

}


// =========================================================
// COMMENT THREAD COMPONENT
// =========================================================

function CommentThreadItem({

  comment,

  depth = 0,

  currentUser,

  t,

  formatCommentDate,

  replyingToId,

  replyText,

  submittingReplyId,

  editingCommentId,

  editText,

  updatingCommentId,

  deletingCommentId,

  onStartReply,

  onCancelReply,

  onReplyTextChange,

  onSubmitReply,

  onStartEdit,

  onCancelEdit,

  onEditTextChange,

  onSubmitEdit,

  onDelete,

}) {

  // =======================================================
  // AUTHOR
  // =======================================================

  const author =
    comment?.author ||
    comment?.user ||
    {};


  const authorName =

    author?.name ||

    comment?.author_name ||

    t(
      "writingDetails.commentSection.unknownUser",
      "Unknown user"
    );


  const username =

    author?.username

      ? `@${author.username}`

      : "";


  const avatarUrl =

    author?.avatar_url ||

    author?.profile_image ||

    author?.profile_picture ||

    "";


  // =======================================================
  // OWNERSHIP
  // =======================================================

  const isOwner =

    currentUser?.id &&

    Number(
      currentUser.id
    ) ===
    Number(
      comment?.user_id
    );


  // =======================================================
  // UI STATE
  // =======================================================

  const isReplying =

    Number(
      replyingToId
    ) ===
    Number(
      comment?.id
    );


  const isEditing =

    Number(
      editingCommentId
    ) ===
    Number(
      comment?.id
    );


  const replies =

    Array.isArray(
      comment?.replies
    )

      ? comment.replies

      : [];


  const canNestMore =
    depth < 4;


  return (

    <div
      className={
        `writing-comment-thread ${
          depth > 0
            ? "is-reply"
            : ""
        }`
      }

      style={{
        "--comment-depth":
          Math.min(
            depth,
            4
          ),
      }}
    >

      {/* =================================================
          COMMENT CARD
      ================================================== */}

      <article
        className="writing-comment-card"
      >

        {/* ===============================================
            AVATAR
        ================================================ */}

        <div
          className="writing-comment-avatar"
        >

          {
            avatarUrl
              ? (

                  <img
                    src={
                      avatarUrl
                    }

                    alt={
                      authorName
                    }

                    loading="lazy"
                  />

                )
              : (

                  authorName
                    ?.trim()
                    ?.charAt(
                      0
                    )
                    ?.toUpperCase()

                  ||

                  <User
                    size={17}
                    aria-hidden="true"
                  />

                )
          }

        </div>


        {/* ===============================================
            BODY
        ================================================ */}

        <div
          className="writing-comment-body"
        >

          {/* =============================================
              AUTHOR / DATE
          ============================================== */}

          <div
            className="writing-comment-header"
          >

            <div
              className="writing-comment-author"
            >

              {
                author?.id
                  ? (

                      <Link
                        to={
                          `/users/${author.id}`
                        }

                        className="writing-comment-author-link"
                      >

                        <strong>
                          {authorName}
                        </strong>

                      </Link>

                    )
                  : (

                      <strong>
                        {authorName}
                      </strong>

                    )
              }


              {
                username && (

                  <span
                    className="writing-comment-username"
                  >

                    {username}

                  </span>

                )
              }


              {
                comment
                  ?.created_at && (

                  <span
                    className="writing-comment-date"
                  >

                    {
                      formatCommentDate(
                        comment.created_at
                      )
                    }

                  </span>

                )
              }


              {
                comment
                  ?.is_edited && (

                  <span
                    className="writing-comment-edited"
                  >

                    {
                      t(
                        "writingDetails.commentSection.edited",
                        "edited"
                      )
                    }

                  </span>

                )
              }

            </div>

          </div>


          {/* =============================================
              EDIT MODE
          ============================================== */}

          {
            isEditing
              ? (

                  <form
                    className="
                      writing-comment-inline-form
                      writing-comment-edit-form
                    "

                    onSubmit={
                      (
                        event
                      ) =>
                        onSubmitEdit(
                          event,
                          comment.id
                        )
                    }
                  >

                    <textarea
                      value={
                        editText
                      }

                      onChange={
                        (
                          event
                        ) =>
                          onEditTextChange(
                            event
                              .target
                              .value
                          )
                      }

                      rows={3}

                      maxLength={2000}

                      autoFocus

                      placeholder={
                        t(
                          "writingDetails.commentSection.editPlaceholder",
                          "Edit your comment..."
                        )
                      }
                    />


                    <div
                      className="writing-comment-inline-footer"
                    >

                      <span
                        className="writing-comment-limit"
                      >

                        {
                          editText
                            .length
                        }/2000

                      </span>


                      <div
                        className="writing-comment-inline-actions"
                      >

                        <button
                          type="button"

                          className="
                            writing-comment-mini-button
                            secondary
                          "

                          onClick={
                            onCancelEdit
                          }

                          disabled={
                            Number(
                              updatingCommentId
                            ) ===
                            Number(
                              comment.id
                            )
                          }
                        >

                          <X
                            size={14}
                            aria-hidden="true"
                          />

                          {
                            t(
                              "writingDetails.commentSection.cancel",
                              "Cancel"
                            )
                          }

                        </button>


                        <button
                          type="submit"

                          className="
                            writing-comment-mini-button
                            primary
                          "

                          disabled={
                            Number(
                              updatingCommentId
                            ) ===
                            Number(
                              comment.id
                            )
                            ||
                            !editText
                              .trim()
                          }
                        >

                          {
                            Number(
                              updatingCommentId
                            ) ===
                            Number(
                              comment.id
                            )
                              ? (

                                  <Loader2
                                    size={14}

                                    className="spin"
                                  />

                                )
                              : (

                                  <Check
                                    size={14}
                                    aria-hidden="true"
                                  />

                                )
                          }


                          {
                            Number(
                              updatingCommentId
                            ) ===
                            Number(
                              comment.id
                            )

                              ? t(
                                  "writingDetails.commentSection.saving",
                                  "Saving..."
                                )

                              : t(
                                  "writingDetails.commentSection.saveEdit",
                                  "Save"
                                )
                          }

                        </button>

                      </div>

                    </div>

                  </form>

                )
              : (

                  <p
                    className="writing-comment-content"
                  >

                    {
                      comment
                        ?.content
                    }

                  </p>

                )
          }


          {/* =============================================
              COMMENT ACTIONS
          ============================================== */}

          {
            !isEditing && (

              <div
                className="writing-comment-actions-row"
              >

                {
                  canNestMore && (

                    <button
                      type="button"

                      className="writing-comment-text-action"

                      onClick={
                        () =>
                          onStartReply(
                            comment
                          )
                      }
                    >

                      <Reply
                        size={14}
                        aria-hidden="true"
                      />

                      {
                        t(
                          "writingDetails.commentSection.reply",
                          "Reply"
                        )
                      }

                    </button>

                  )
                }


                {
                  isOwner && (

                    <button
                      type="button"

                      className="writing-comment-text-action"

                      onClick={
                        () =>
                          onStartEdit(
                            comment
                          )
                      }
                    >

                      <Edit3
                        size={14}
                        aria-hidden="true"
                      />

                      {
                        t(
                          "writingDetails.commentSection.edit",
                          "Edit"
                        )
                      }

                    </button>

                  )
                }


                {
                  isOwner && (

                    <button
                      type="button"

                      className="
                        writing-comment-text-action
                        danger
                      "

                      onClick={
                        () =>
                          onDelete(
                            comment.id
                          )
                      }

                      disabled={
                        Number(
                          deletingCommentId
                        ) ===
                        Number(
                          comment.id
                        )
                      }
                    >

                      {
                        Number(
                          deletingCommentId
                        ) ===
                        Number(
                          comment.id
                        )
                          ? (

                              <Loader2
                                size={14}

                                className="spin"
                              />

                            )
                          : (

                              <Trash2
                                size={14}
                                aria-hidden="true"
                              />

                            )
                      }


                      {
                        t(
                          "writingDetails.commentSection.delete",
                          "Delete"
                        )
                      }

                    </button>

                  )
                }


                {
                  replies.length >
                    0 && (

                    <span
                      className="writing-comment-reply-count"
                    >

                      <MessageCircle
                        size={13}
                        aria-hidden="true"
                      />

                      {
                        replies.length
                      }

                    </span>

                  )
                }

              </div>

            )
          }


          {/* =============================================
              REPLY FORM
          ============================================== */}

          {
            isReplying && (

              <form
                className="
                  writing-comment-inline-form
                  writing-comment-reply-form
                "

                onSubmit={
                  (
                    event
                  ) =>
                    onSubmitReply(
                      event,
                      comment
                    )
                }
              >

                <div
                  className="writing-comment-replying-to"
                >

                  {
                    t(
                      "writingDetails.commentSection.replyingTo",
                      "Replying to"
                    )
                  }

                  {" "}

                  <strong>
                    {authorName}
                  </strong>

                </div>


                <textarea
                  value={
                    replyText
                  }

                  onChange={
                    (
                      event
                    ) =>
                      onReplyTextChange(
                        event
                          .target
                          .value
                      )
                  }

                  rows={3}

                  maxLength={2000}

                  autoFocus

                  placeholder={
                    t(
                      "writingDetails.commentSection.replyPlaceholder",
                      "Write a reply..."
                    )
                  }
                />


                <div
                  className="writing-comment-inline-footer"
                >

                  <span
                    className="writing-comment-limit"
                  >

                    {
                      replyText
                        .length
                    }/2000

                  </span>


                  <div
                    className="writing-comment-inline-actions"
                  >

                    <button
                      type="button"

                      className="
                        writing-comment-mini-button
                        secondary
                      "

                      onClick={
                        onCancelReply
                      }

                      disabled={
                        Number(
                          submittingReplyId
                        ) ===
                        Number(
                          comment.id
                        )
                      }
                    >

                      <X
                        size={14}
                        aria-hidden="true"
                      />

                      {
                        t(
                          "writingDetails.commentSection.cancel",
                          "Cancel"
                        )
                      }

                    </button>


                    <button
                      type="submit"

                      className="
                        writing-comment-mini-button
                        primary
                      "

                      disabled={
                        Number(
                          submittingReplyId
                        ) ===
                        Number(
                          comment.id
                        )
                        ||
                        !replyText
                          .trim()
                      }
                    >

                      {
                        Number(
                          submittingReplyId
                        ) ===
                        Number(
                          comment.id
                        )
                          ? (

                              <Loader2
                                size={14}

                                className="spin"
                              />

                            )
                          : (

                              <Send
                                size={14}
                                aria-hidden="true"
                              />

                            )
                      }


                      {
                        Number(
                          submittingReplyId
                        ) ===
                        Number(
                          comment.id
                        )

                          ? t(
                              "writingDetails.commentSection.replying",
                              "Replying..."
                            )

                          : t(
                              "writingDetails.commentSection.sendReply",
                              "Reply"
                            )
                      }

                    </button>

                  </div>

                </div>

              </form>

            )
          }

        </div>

      </article>


      {/* =================================================
          CHILD REPLIES
      ================================================== */}

      {
        replies.length >
          0 && (

          <div
            className="writing-comment-replies"
          >

            {
              replies.map(
                (
                  reply
                ) => (

                  <CommentThreadItem
                    key={
                      reply.id
                    }

                    comment={
                      reply
                    }

                    depth={
                      depth + 1
                    }

                    currentUser={
                      currentUser
                    }

                    t={
                      t
                    }

                    formatCommentDate={
                      formatCommentDate
                    }

                    replyingToId={
                      replyingToId
                    }

                    replyText={
                      replyText
                    }

                    submittingReplyId={
                      submittingReplyId
                    }

                    editingCommentId={
                      editingCommentId
                    }

                    editText={
                      editText
                    }

                    updatingCommentId={
                      updatingCommentId
                    }

                    deletingCommentId={
                      deletingCommentId
                    }

                    onStartReply={
                      onStartReply
                    }

                    onCancelReply={
                      onCancelReply
                    }

                    onReplyTextChange={
                      onReplyTextChange
                    }

                    onSubmitReply={
                      onSubmitReply
                    }

                    onStartEdit={
                      onStartEdit
                    }

                    onCancelEdit={
                      onCancelEdit
                    }

                    onEditTextChange={
                      onEditTextChange
                    }

                    onSubmitEdit={
                      onSubmitEdit
                    }

                    onDelete={
                      onDelete
                    }
                  />

                )
              )
            }

          </div>

        )
      }

    </div>

  );

}


// =========================================================
// WRITING DETAILS PAGE
// =========================================================

function WritingDetails() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    t,
  } = useLanguage();


  const writingId =
    Number(
      id
    );


  // =====================================================
  // WRITING STATE
  // =====================================================

  const [
    writing,
    setWriting,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  // =====================================================
  // CURRENT USER
  // =====================================================

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    null
  );


  const [
    authLoading,
    setAuthLoading,
  ] = useState(
    Boolean(
      getToken()
    )
  );


  // =====================================================
  // LIKE STATE
  // =====================================================

  const [
    likesCount,
    setLikesCount,
  ] = useState(
    0
  );


  const [
    liked,
    setLiked,
  ] = useState(
    false
  );


  const [
    liking,
    setLiking,
  ] = useState(
    false
  );


  // =====================================================
  // COMMENT STATE
  // =====================================================

  const [
    comments,
    setComments,
  ] = useState(
    []
  );


  const [
    commentsLoading,
    setCommentsLoading,
  ] = useState(
    false
  );


  const [
    commentText,
    setCommentText,
  ] = useState(
    ""
  );


  const [
    submittingComment,
    setSubmittingComment,
  ] = useState(
    false
  );


  const [
    commentError,
    setCommentError,
  ] = useState(
    ""
  );


  // =====================================================
  // REPLY STATE
  // =====================================================

  const [
    replyingToId,
    setReplyingToId,
  ] = useState(
    null
  );


  const [
    replyText,
    setReplyText,
  ] = useState(
    ""
  );


  const [
    submittingReplyId,
    setSubmittingReplyId,
  ] = useState(
    null
  );


  // =====================================================
  // EDIT STATE
  // =====================================================

  const [
    editingCommentId,
    setEditingCommentId,
  ] = useState(
    null
  );


  const [
    editText,
    setEditText,
  ] = useState(
    ""
  );


  const [
    updatingCommentId,
    setUpdatingCommentId,
  ] = useState(
    null
  );


  // =====================================================
  // DELETE STATE
  // =====================================================

  const [
    deletingCommentId,
    setDeletingCommentId,
  ] = useState(
    null
  );


  // =====================================================
  // SHARE STATE
  // =====================================================

  const [
    shareSuccess,
    setShareSuccess,
  ] = useState(
    false
  );


  // =====================================================
  // CATEGORY
  // =====================================================

  function getCategoryLabel(
    value
  ) {

    const map = {

      "কবিতা":
        t(
          "categories.poetry",
          "Poetry"
        ),

      "গল্প":
        t(
          "categories.story",
          "Story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection",
          "Feelings"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay",
          "Essay"
        ),

      "অন্যান্য":
        t(
          "categories.other",
          "Other"
        ),

    };


    return (

      map[value] ||

      value ||

      t(
        "categories.other",
        "Other"
      )

    );

  }


  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(
    () => {

      let mounted =
        true;


      async function loadCurrentUser() {

        if (
          !getToken()
        ) {

          if (
            mounted
          ) {

            setCurrentUser(
              null
            );


            setAuthLoading(
              false
            );

          }


          return;

        }


        setAuthLoading(
          true
        );


        try {

          const data =
            await getCurrentUser();


          if (
            !mounted
          ) {

            return;

          }


          setCurrentUser(

            data?.user ||

            data ||

            null

          );


        } catch {

          if (
            mounted
          ) {

            setCurrentUser(
              null
            );

          }


        } finally {

          if (
            mounted
          ) {

            setAuthLoading(
              false
            );

          }

        }

      }


      loadCurrentUser();


      return () => {

        mounted =
          false;

      };

    },
    []
  );


  // =====================================================
  // LOAD WRITING
  // =====================================================

  useEffect(
    () => {

      let mounted =
        true;


      async function loadWriting() {

        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          if (
            !Number.isFinite(
              writingId
            )
            ||
            writingId <=
              0
          ) {

            throw new Error(

              t(
                "writingDetails.notFound",
                "Writing not found"
              )

            );

          }


          const data =
            await getWriting(
              writingId
            );


          if (
            !mounted
          ) {

            return;

          }


          const loadedWriting =

            data?.writing ||

            (
              data?.id
                ? data
                : null
            );


          if (
            !loadedWriting
          ) {

            throw new Error(

              t(
                "writingDetails.notFound",
                "Writing not found"
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
              ?.liked_by_current_user ===
            "boolean"
          ) {

            setLiked(
              loadedWriting
                .liked_by_current_user
            );

          }


        } catch (
          err
        ) {

          console.error(
            "WRITING DETAILS ERROR:",
            err
          );


          if (
            mounted
          ) {

            setWriting(
              null
            );


            setError(

              err?.message ||

              t(
                "writingDetails.unavailable",
                "Writing unavailable"
              )

            );

          }


        } finally {

          if (
            mounted
          ) {

            setLoading(
              false
            );

          }

        }

      }


      loadWriting();


      return () => {

        mounted =
          false;

      };

    },
    [
      writingId,
      t,
    ]
  );


  // =====================================================
  // LOAD LIKE COUNT
  // =====================================================

  useEffect(
    () => {

      if (
        !writing?.id
      ) {

        return;

      }


      let mounted =
        true;


      async function loadLikes() {

        try {

          const data =
            await getWritingLikes(
              writing.id
            );


          if (
            !mounted
          ) {

            return;

          }


          setLikesCount(

            Number(

              data?.likes_count ??

              data?.count ??

              0

            )

          );


        } catch (
          err
        ) {

          console.error(
            "LOAD LIKES ERROR:",
            err
          );

        }

      }


      loadLikes();


      return () => {

        mounted =
          false;

      };

    },
    [
      writing?.id,
    ]
  );


  // =====================================================
  // LOAD LIKE STATUS
  // =====================================================

  useEffect(
    () => {

      if (
        !writing?.id ||
        !getToken()
      ) {

        return;

      }


      let mounted =
        true;


      async function loadLikeStatus() {

        try {

          const data =
            await getMyLikeStatus(
              writing.id
            );


          if (
            !mounted
          ) {

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
            typeof data
              ?.likes_count ===
            "number"
          ) {

            setLikesCount(
              data.likes_count
            );

          }


        } catch {

          if (
            mounted
          ) {

            setLiked(
              false
            );

          }

        }

      }


      loadLikeStatus();


      return () => {

        mounted =
          false;

      };

    },
    [
      writing?.id,
    ]
  );


  // =====================================================
  // LOAD COMMENTS
  // =====================================================

  useEffect(
    () => {

      if (
        !writing?.id
      ) {

        return;

      }


      let mounted =
        true;


      async function loadComments() {

        setCommentsLoading(
          true
        );


        setCommentError(
          ""
        );


        try {

          const data =
            await getComments(
              writing.id
            );


          if (
            !mounted
          ) {

            return;

          }


          const loadedComments =

            Array.isArray(
              data
            )

              ? data

              : Array.isArray(
                  data?.comments
                )

                ? data.comments

                : [];


          setComments(
            loadedComments
          );


        } catch (
          err
        ) {

          console.error(
            "LOAD COMMENTS ERROR:",
            err
          );


          if (
            !mounted
          ) {

            return;

          }


          setCommentError(

            err?.message ||

            t(
              "writingDetails.commentSection.loadError",
              "Unable to load comments."
            )

          );


        } finally {

          if (
            mounted
          ) {

            setCommentsLoading(
              false
            );

          }

        }

      }


      loadComments();


      return () => {

        mounted =
          false;

      };

    },
    [
      writing?.id,
      t,
    ]
  );


  // =====================================================
  // WORD COUNT
  // =====================================================

  const wordCount =
    useMemo(
      () => {

        if (
          !writing
            ?.content
            ?.trim()
        ) {

          return 0;

        }


        return writing
          .content
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
    useMemo(
      () =>

        Math.max(
          1,

          Math.ceil(
            wordCount /
            180
          )
        ),

      [
        wordCount,
      ]
    );


  // =====================================================
  // TOTAL COMMENTS
  // =====================================================

  const totalComments =
    useMemo(
      () =>

        countCommentTree(
          comments
        ),

      [
        comments,
      ]
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

      return t(
        "common.noData",
        "No data"
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
        "common.noData",
        "No data"
      );

    }


    try {

      return new Intl
        .DateTimeFormat(
          undefined,
          {

            day:
              "numeric",

            month:
              "long",

            year:
              "numeric",

          }
        )
        .format(
          date
        );


    } catch {

      return date
        .toLocaleDateString();

    }

  }


  // =====================================================
  // COMMENT DATE
  // =====================================================

  function formatCommentDate(
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


    const difference =
      Date.now() -
      date.getTime();


    const minute =
      60 *
      1000;


    const hour =
      60 *
      minute;


    const day =
      24 *
      hour;


    if (
      difference >=
        0 &&
      difference <
        minute
    ) {

      return t(
        "writingDetails.commentSection.justNow",
        "Just now"
      );

    }


    if (
      difference >=
        minute &&
      difference <
        hour
    ) {

      const minutes =
        Math.max(
          1,

          Math.floor(
            difference /
            minute
          )
        );


      const label =
        t(
          "writingDetails.commentSection.minutesAgo",
          "{count}m ago"
        );


      return String(
        label
      ).replace(
        "{count}",
        String(
          minutes
        )
      );

    }


    if (
      difference >=
        hour &&
      difference <
        day
    ) {

      const hours =
        Math.max(
          1,

          Math.floor(
            difference /
            hour
          )
        );


      const label =
        t(
          "writingDetails.commentSection.hoursAgo",
          "{count}h ago"
        );


      return String(
        label
      ).replace(
        "{count}",
        String(
          hours
        )
      );

    }


    return formatDate(
      dateString
    );

  }


  // =====================================================
  // LOGIN RETURN PATH
  // =====================================================

  const currentPagePath =
    `${location.pathname}${location.search}${location.hash}`;


  function requireLogin() {

    if (
      currentUser?.id
    ) {

      return true;

    }


    navigate(
      "/login",
      {
        state: {
          from:
            currentPagePath,
        },
      }
    );


    return false;

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


    if (
      !requireLogin()
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
        typeof data
          ?.liked ===
        "boolean"
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
          ?.likes_count ===
        "number"
      ) {

        setLikesCount(
          data.likes_count
        );


      } else {

        setLikesCount(
          (
            current
          ) =>

            liked

              ? Math.max(
                  0,
                  current - 1
                )

              : current + 1
        );

      }


    } catch (
      err
    ) {

      console.error(
        "LIKE WRITING ERROR:",
        err
      );


      window.alert(

        err?.message ||

        t(
          "writingDetails.likeError",
          "Unable to update like."
        )

      );


    } finally {

      setLiking(
        false
      );

    }

  }


  // =====================================================
  // ADD TOP LEVEL COMMENT
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


    if (
      !requireLogin()
    ) {

      return;

    }


    const content =
      commentText
        .trim();


    if (
      !content
    ) {

      return;

    }


    if (
      content.length >
        2000
    ) {

      setCommentError(

        t(
          "writingDetails.commentSection.tooLong",
          "Comment cannot exceed 2000 characters."
        )

      );


      return;

    }


    setSubmittingComment(
      true
    );


    setCommentError(
      ""
    );


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
            current
          ) => [

            {

              ...newComment,

              replies:
                Array.isArray(
                  newComment.replies
                )

                  ? newComment.replies

                  : [],

            },

            ...current,

          ]
        );

      }


      setCommentText(
        ""
      );


    } catch (
      err
    ) {

      console.error(
        "ADD COMMENT ERROR:",
        err
      );


      setCommentError(

        err?.message ||

        t(
          "writingDetails.commentSection.addError",
          "Unable to post comment."
        )

      );


    } finally {

      setSubmittingComment(
        false
      );

    }

  }


  // =====================================================
  // START REPLY
  // =====================================================

  function handleStartReply(
    comment
  ) {

    if (
      !requireLogin()
    ) {

      return;

    }


    setEditingCommentId(
      null
    );


    setEditText(
      ""
    );


    setReplyingToId(
      comment.id
    );


    setReplyText(
      ""
    );


    setCommentError(
      ""
    );

  }


  function handleCancelReply() {

    setReplyingToId(
      null
    );


    setReplyText(
      ""
    );

  }


  // =====================================================
  // SUBMIT REPLY
  // =====================================================

  async function handleReplySubmit(
    event,
    parentComment
  ) {

    event.preventDefault();


    if (
      !writing?.id ||
      !parentComment?.id ||
      submittingReplyId
    ) {

      return;

    }


    if (
      !requireLogin()
    ) {

      return;

    }


    const content =
      replyText
        .trim();


    if (
      !content
    ) {

      return;

    }


    if (
      content.length >
        2000
    ) {

      setCommentError(

        t(
          "writingDetails.commentSection.tooLong",
          "Comment cannot exceed 2000 characters."
        )

      );


      return;

    }


    setSubmittingReplyId(
      parentComment.id
    );


    setCommentError(
      ""
    );


    try {

      const data =
        await replyToComment(

          writing.id,

          parentComment.id,

          content

        );


      const newReply =

        data?.comment ||

        data;


      if (
        newReply?.id
      ) {

        setComments(
          (
            current
          ) =>

            appendReplyToTree(

              current,

              parentComment.id,

              {

                ...newReply,

                replies:
                  Array.isArray(
                    newReply.replies
                  )

                    ? newReply.replies

                    : [],

              }

            )
        );

      }


      setReplyingToId(
        null
      );


      setReplyText(
        ""
      );


    } catch (
      err
    ) {

      console.error(
        "REPLY COMMENT ERROR:",
        err
      );


      setCommentError(

        err?.message ||

        t(
          "writingDetails.commentSection.replyError",
          "Unable to post reply."
        )

      );


    } finally {

      setSubmittingReplyId(
        null
      );

    }

  }


  // =====================================================
  // START EDIT
  // =====================================================

  function handleStartEdit(
    comment
  ) {

    if (
      !requireLogin()
    ) {

      return;

    }


    if (
      Number(
        currentUser?.id
      ) !==
      Number(
        comment?.user_id
      )
    ) {

      return;

    }


    setReplyingToId(
      null
    );


    setReplyText(
      ""
    );


    setEditingCommentId(
      comment.id
    );


    setEditText(
      comment.content ||
      ""
    );


    setCommentError(
      ""
    );

  }


  function handleCancelEdit() {

    setEditingCommentId(
      null
    );


    setEditText(
      ""
    );

  }


  // =====================================================
  // SUBMIT EDIT
  // =====================================================

  async function handleEditSubmit(
    event,
    commentId
  ) {

    event.preventDefault();


    if (
      !commentId ||
      updatingCommentId
    ) {

      return;

    }


    const content =
      editText
        .trim();


    if (
      !content
    ) {

      return;

    }


    if (
      content.length >
        2000
    ) {

      setCommentError(

        t(
          "writingDetails.commentSection.tooLong",
          "Comment cannot exceed 2000 characters."
        )

      );


      return;

    }


    setUpdatingCommentId(
      commentId
    );


    setCommentError(
      ""
    );


    try {

      const data =
        await updateComment(
          commentId,
          content
        );


      const updated =

        data?.comment ||

        data;


      if (
        updated?.id
      ) {

        setComments(
          (
            current
          ) =>

            updateCommentInTree(
              current,
              updated
            )
        );

      }


      setEditingCommentId(
        null
      );


      setEditText(
        ""
      );


    } catch (
      err
    ) {

      console.error(
        "UPDATE COMMENT ERROR:",
        err
      );


      setCommentError(

        err?.message ||

        t(
          "writingDetails.commentSection.editError",
          "Unable to update comment."
        )

      );


    } finally {

      setUpdatingCommentId(
        null
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
          "writingDetails.commentSection.deleteConfirm",
          "Delete this comment?"
        )

      );


    if (
      !confirmed
    ) {

      return;

    }


    setDeletingCommentId(
      commentId
    );


    setCommentError(
      ""
    );


    try {

      await deleteComment(
        commentId
      );


      setComments(
        (
          current
        ) =>

          removeCommentFromTree(
            current,
            commentId
          )
      );


      if (
        Number(
          replyingToId
        ) ===
        Number(
          commentId
        )
      ) {

        handleCancelReply();

      }


      if (
        Number(
          editingCommentId
        ) ===
        Number(
          commentId
        )
      ) {

        handleCancelEdit();

      }


    } catch (
      err
    ) {

      console.error(
        "DELETE COMMENT ERROR:",
        err
      );


      setCommentError(

        err?.message ||

        t(
          "writingDetails.commentSection.deleteError",
          "Unable to delete comment."
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

    if (
      !writing
    ) {

      return;

    }


    const description =
      makeSeoDescription(
        writing.content,
        writing.title
      );


    const shareData = {

      title:
        writing.title ||
        "SHOBDO",

      text:
        description,

      url:
        window.location.href,

    };


    try {

      if (
        navigator.share
      ) {

        await navigator
          .share(
            shareData
          );


        return;

      }


      await navigator
        .clipboard
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


    } catch (
      err
    ) {

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

  if (
    loading
  ) {

    return (

      <>

        <SEO
          title="Loading Writing"
          description="Loading a writing from the SHOBDO community."
          noIndex
        />


        <main
          className="writing-details-page"
        >

          <div
            className="writing-details-container"
          >

            <div
              className="writing-details-loading"
              role="status"
              aria-live="polite"
            >

              <Loader2
                size={30}

                className="spin"
              />


              <p>

                {
                  t(
                    "writingDetails.loading",
                    "Loading writing..."
                  )
                }

              </p>

            </div>

          </div>

        </main>

      </>

    );

  }


  // =====================================================
  // ERROR / UNAVAILABLE
  // =====================================================

  if (
    error ||
    !writing
  ) {

    return (

      <>

        <SEO
          title="Writing Not Found"
          description="This SHOBDO writing could not be found or is currently unavailable."
          noIndex
        />


        <main
          className="writing-details-page"
        >

          <div
            className="writing-details-container"
          >

            <section
              className="writing-details-error"
            >

              <div
                className="details-error-icon"
              >

                <AlertCircle
                  size={30}
                />

              </div>


              <h1>

                {
                  t(
                    "writingDetails.notFound",
                    "Writing not found"
                  )
                }

              </h1>


              <p>

                {
                  error ||

                  t(
                    "writingDetails.unavailable",
                    "This writing is currently unavailable."
                  )
                }

              </p>


              <div
                className="details-error-actions"
              >

                <button
                  type="button"

                  className="primary-button"

                  onClick={
                    () =>
                      window
                        .location
                        .reload()
                  }
                >

                  <RefreshCw
                    size={17}
                  />

                  {
                    t(
                      "writingDetails.retry",
                      "Try again"
                    )
                  }

                </button>


                <Link
                  to="/explore"

                  className="details-secondary-link"
                >

                  <ArrowLeft
                    size={17}
                  />

                  {
                    t(
                      "writingDetails.backToExplore",
                      "Back to Explore"
                    )
                  }

                </Link>

              </div>

            </section>

          </div>

        </main>

      </>

    );

  }


  // =====================================================
  // WRITING DATA
  // =====================================================

  const author =

    writing.author ||

    writing.user ||

    {};


  const authorName =

    author
      ?.name ||

    writing.author_name ||

    t(
      "common.unknownAuthor",
      "Unknown author"
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


  const publishedValue =

    writing.published_at ||

    writing.created_at;


  const publishedDate =
    formatDate(
      publishedValue
    );


  const paragraphs =

    writing.content

      ? writing.content
          .split(
            "\n"
          )

      : [];


  // =====================================================
  // DYNAMIC SEO
  // =====================================================

  const seoTitle =

    stripHtml(
      writing.title
    )

    ||

    t(
      "common.untitled",
      "Untitled"
    );


  const seoDescription =
    makeSeoDescription(
      writing.content,
      seoTitle
    );


  const seoPublishedTime =
    toIsoDate(
      publishedValue
    );


  const canonicalPath =
    `/writings/${writing.id}`;


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      {/* ===================================================
          DYNAMIC ARTICLE SEO
      ==================================================== */}

      <SEO
        title={
          seoTitle
        }
        description={
          seoDescription
        }
        path={
          canonicalPath
        }
        type="article"
        author={
          authorName
        }
        publishedTime={
          seoPublishedTime
        }
      />


      <main
        className="writing-details-page"
      >

        <div
          className="writing-details-container"
        >

          {/* =================================================
              BACK
          ================================================== */}

          <button
            type="button"

            className="writing-details-back"

            onClick={
              () =>
                navigate(
                  -1
                )
            }
          >

            <ArrowLeft
              size={17}
            />

            {
              t(
                "writingDetails.back",
                "Back"
              )
            }

          </button>


          {/* =================================================
              ARTICLE
          ================================================== */}

          <article
            className="writing-details-article"
          >

            {/* ===============================================
                HEADER
            ================================================ */}

            <header
              className="writing-details-header"
            >

              {/* LANGUAGE + CATEGORY */}

              <div
                className="writing-details-badges"
              >

                <span
                  className="writing-details-language"
                >

                  <Globe2
                    size={13}
                  />

                  {
                    languageLabel
                  }

                </span>


                <span
                  className="writing-details-category"
                >

                  {
                    category
                  }

                </span>

              </div>


              {/* TITLE */}

              <h1>

                {
                  writing.title ||

                  t(
                    "common.untitled",
                    "Untitled"
                  )
                }

              </h1>


              {/* AUTHOR */}

              <div
                className="writing-details-author"
              >

                <div
                  className="details-author-avatar"
                >

                  {
                    authorName
                      ?.trim()
                      ?.charAt(
                        0
                      )
                      ?.toUpperCase()

                    ||

                    <User
                      size={18}
                    />
                  }

                </div>


                <div>

                  <span
                    className="writing-details-author-label"
                  >

                    {
                      t(
                        "writingDetails.by",
                        "By"
                      )
                    }

                  </span>


                  {
                    author?.id
                      ? (

                          <Link
                            to={
                              `/users/${author.id}`
                            }
                          >

                            <strong>
                              {
                                authorName
                              }
                            </strong>

                          </Link>

                        )
                      : (

                          <strong>
                            {
                              authorName
                            }
                          </strong>

                        )
                  }


                  <div
                    className="writing-details-meta"
                  >

                    <span>

                      <CalendarDays
                        size={14}
                      />

                      {
                        publishedDate
                      }

                    </span>


                    <span>

                      <Clock3
                        size={14}
                      />

                      {
                        readingTime
                      }

                      {" "}

                      {
                        t(
                          "writingDetails.readingTime",
                          "min read"
                        )
                      }

                    </span>


                    <span>

                      <BookOpen
                        size={14}
                      />

                      {
                        wordCount
                      }

                      {" "}

                      {
                        t(
                          "writingDetails.words",
                          "words"
                        )
                      }

                    </span>

                  </div>

                </div>

              </div>


              {/* =============================================
                  ACTION BAR
              ============================================== */}

              <div
                className="writing-details-actions"
              >

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
                    liking ||
                    authLoading
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
                            "writingDetails.liked",
                            "Liked"
                          )
                        : t(
                            "writingDetails.like",
                            "Like"
                          )
                    }

                  </span>


                  <strong>

                    {
                      likesCount
                    }

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

                    {
                      t(
                        "writingDetails.comments",
                        "Comments"
                      )
                    }

                  </span>


                  <strong>

                    {
                      totalComments
                    }

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
                            "writingDetails.share",
                            "Share"
                          )
                    }

                  </span>

                </button>

              </div>

            </header>


            {/* ===============================================
                DIVIDER
            ================================================ */}

            <div
              className="writing-details-divider"
            />


            {/* ===============================================
                ORIGINAL LANGUAGE
            ================================================ */}

            <div
              className="writing-original-language"
            >

              <Globe2
                size={14}
              />


              <span>

                {
                  t(
                    "writingDetails.originalLanguage",
                    "Original language"
                  )
                }

                :

              </span>


              <strong>

                {
                  languageLabel
                }

              </strong>

            </div>


            {/* ===============================================
                WRITING CONTENT
            ================================================ */}

            <section
              className="writing-details-content"
            >

              {
                paragraphs.map(
                  (
                    paragraph,
                    index
                  ) => {

                    if (
                      !paragraph
                        .trim()
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

                        {
                          paragraph
                        }

                      </p>

                    );

                  }
                )
              }

            </section>


            {/* =================================================
                COMMENTS
            ================================================== */}

            <section
              id="comments"

              className="writing-comments-section"
            >

              {/* =============================================
                  HEADING
              ============================================== */}

              <div
                className="writing-comments-heading"
              >

                <div>

                  <span
                    className="writing-comments-eyebrow"
                  >

                    {
                      t(
                        "writingDetails.commentSection.community",
                        "Community"
                      )
                    }

                  </span>


                  <h2>

                    <MessageCircle
                      size={22}
                    />

                    {
                      t(
                        "writingDetails.commentSection.title",
                        "Discussion"
                      )
                    }

                  </h2>

                </div>


                <span
                  className="writing-comments-total"
                >

                  {
                    totalComments
                  }

                </span>

              </div>


              {/* =============================================
                  LOGGED-IN COMMENT FORM
              ============================================== */}

              {
                !authLoading &&
                currentUser?.id
                  ? (

                      <form
                        className="writing-comment-form"

                        onSubmit={
                          handleCommentSubmit
                        }
                      >

                        <div
                          className="writing-comment-input-wrap"
                        >

                          <div
                            className="
                              writing-comment-avatar
                              writing-comment-avatar-me
                            "
                          >

                            {
                              currentUser
                                ?.avatar_url
                                ? (

                                    <img
                                      src={
                                        currentUser
                                          .avatar_url
                                      }

                                      alt={
                                        currentUser
                                          ?.name ||
                                        "User"
                                      }
                                    />

                                  )
                                : (

                                    currentUser
                                      ?.name
                                      ?.trim()
                                      ?.charAt(
                                        0
                                      )
                                      ?.toUpperCase()

                                    ||

                                    <User
                                      size={18}
                                    />

                                  )
                            }

                          </div>


                          <textarea
                            value={
                              commentText
                            }

                            onChange={
                              (
                                event
                              ) => {

                                setCommentText(
                                  event
                                    .target
                                    .value
                                );


                                if (
                                  commentError
                                ) {

                                  setCommentError(
                                    ""
                                  );

                                }

                              }
                            }

                            placeholder={
                              t(
                                "writingDetails.commentSection.placeholder",
                                "Share your thoughts..."
                              )
                            }

                            rows={4}

                            maxLength={2000}
                          />

                        </div>


                        <div
                          className="writing-comment-form-footer"
                        >

                          <span
                            className="writing-comment-limit"
                          >

                            {
                              commentText
                                .length
                            }/2000

                          </span>


                          <button
                            type="submit"

                            className="writing-comment-submit"

                            disabled={
                              submittingComment
                              ||
                              !commentText
                                .trim()
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
                                      "writingDetails.commentSection.posting",
                                      "Posting..."
                                    )

                                  : t(
                                      "writingDetails.commentSection.post",
                                      "Post comment"
                                    )
                              }

                            </span>

                          </button>

                        </div>

                      </form>

                    )

                  : authLoading
                    ? (

                        <div
                          className="writing-comments-auth-loading"
                        >

                          <Loader2
                            size={18}

                            className="spin"
                          />

                        </div>

                      )
                    : (

                        <div
                          className="writing-comments-login-card"
                        >

                          <div
                            className="writing-comments-login-icon"
                          >

                            <MessageCircle
                              size={21}
                            />

                          </div>


                          <div>

                            <strong>

                              {
                                t(
                                  "writingDetails.commentSection.signInTitle",
                                  "Join the discussion"
                                )
                              }

                            </strong>


                            <p>

                              {
                                t(
                                  "writingDetails.commentSection.signInDescription",
                                  "Sign in to comment and reply to other readers."
                                )
                              }

                            </p>

                          </div>


                          <button
                            type="button"

                            onClick={
                              () =>
                                navigate(
                                  "/login",
                                  {
                                    state: {
                                      from:
                                        currentPagePath,
                                    },
                                  }
                                )
                            }
                          >

                            {
                              t(
                                "writingDetails.commentSection.signIn",
                                "Sign in"
                              )
                            }

                          </button>

                        </div>

                      )
              }


              {/* =============================================
                  COMMENT ERROR
              ============================================== */}

              {
                commentError && (

                  <div
                    className="writing-comment-error"
                    role="alert"
                  >

                    <AlertCircle
                      size={17}
                    />


                    <span>

                      {
                        commentError
                      }

                    </span>

                  </div>

                )
              }


              {/* =============================================
                  COMMENTS
              ============================================== */}

              <div
                className="writing-comments-list"
              >

                {
                  commentsLoading
                    ? (

                        <div
                          className="writing-comments-loading"
                        >

                          <Loader2
                            size={23}

                            className="spin"
                          />


                          <span>

                            {
                              t(
                                "writingDetails.commentSection.loading",
                                "Loading comments..."
                              )
                            }

                          </span>

                        </div>

                      )

                    : comments.length ===
                      0
                      ? (

                          <div
                            className="writing-comments-empty"
                          >

                            <div
                              className="writing-comments-empty-icon"
                            >

                              <MessageCircle
                                size={27}
                              />

                            </div>


                            <strong>

                              {
                                t(
                                  "writingDetails.commentSection.emptyTitle",
                                  "No comments yet"
                                )
                              }

                            </strong>


                            <p>

                              {
                                t(
                                  "writingDetails.commentSection.emptyDescription",
                                  "Start the conversation by sharing your thoughts."
                                )
                              }

                            </p>

                          </div>

                        )

                      : (

                          comments.map(
                            (
                              comment
                            ) => (

                              <CommentThreadItem
                                key={
                                  comment.id
                                }

                                comment={
                                  comment
                                }

                                currentUser={
                                  currentUser
                                }

                                t={
                                  t
                                }

                                formatCommentDate={
                                  formatCommentDate
                                }

                                replyingToId={
                                  replyingToId
                                }

                                replyText={
                                  replyText
                                }

                                submittingReplyId={
                                  submittingReplyId
                                }

                                editingCommentId={
                                  editingCommentId
                                }

                                editText={
                                  editText
                                }

                                updatingCommentId={
                                  updatingCommentId
                                }

                                deletingCommentId={
                                  deletingCommentId
                                }

                                onStartReply={
                                  handleStartReply
                                }

                                onCancelReply={
                                  handleCancelReply
                                }

                                onReplyTextChange={
                                  setReplyText
                                }

                                onSubmitReply={
                                  handleReplySubmit
                                }

                                onStartEdit={
                                  handleStartEdit
                                }

                                onCancelEdit={
                                  handleCancelEdit
                                }

                                onEditTextChange={
                                  setEditText
                                }

                                onSubmitEdit={
                                  handleEditSubmit
                                }

                                onDelete={
                                  handleDeleteComment
                                }
                              />

                            )
                          )

                        )
                }

              </div>

            </section>


            {/* ===============================================
                FOOTER
            ================================================ */}

            <footer
              className="writing-details-footer"
            >

              <div
                className="writing-details-footer-author"
              >

                <span>

                  {
                    t(
                      "writingDetails.by",
                      "By"
                    )
                  }

                </span>


                {
                  author?.id
                    ? (

                        <Link
                          to={
                            `/users/${author.id}`
                          }
                        >

                          <strong>
                            {
                              authorName
                            }
                          </strong>

                        </Link>

                      )
                    : (

                        <strong>
                          {
                            authorName
                          }
                        </strong>

                      )
                }

              </div>


              <div
                className="writing-details-footer-links"
              >

                <span
                  className="writing-details-footer-language"
                >

                  <Globe2
                    size={15}
                  />

                  {
                    languageLabel
                  }

                </span>


                <Link
                  to="/explore"
                >

                  {
                    t(
                      "writingDetails.moreWritings",
                      "Explore more writings"
                    )
                  }

                </Link>

              </div>

            </footer>

          </article>

        </div>

      </main>

    </>

  );

}


export default WritingDetails;