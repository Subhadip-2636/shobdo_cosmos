import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Globe2,
  Heart,
  MessageCircle,
  RefreshCw,
  Send,
  Trash2,
  User,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  addComment,
  deleteComment,
  getComments,
  getMyLikeStatus,
  getWriting,
  getWritingLikes,
  likeWriting,
  unlikeWriting,
  Writing,
} from "../../api/api";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useLanguage,
} from "../../Language/LanguageContext";


// ==========================================================
// TYPES
// ==========================================================

type DetailAuthor = {
  id?: number;
  name?: string;
  email?: string;
};


type DetailWriting =
  Writing & {

    author?: DetailAuthor;

    user?: DetailAuthor;

    author_id?: number;

    user_id?: number;

    author_name?: string;

    category?: string;

    language?: string;

    created_at?: string;

    published_at?: string;

    likes_count?: number;

    comments_count?: number;

  };


type CommentAuthor = {
  id?: number;
  name?: string;
};


type WritingComment = {

  id: number;

  content: string;

  user_id?: number;

  writing_id?: number;

  created_at?: string;

  author?: CommentAuthor;

};


// ==========================================================
// CONSTANTS
// ==========================================================

const MAX_COMMENT_LENGTH =
  2000;


// ==========================================================
// LANGUAGE
// ==========================================================

function getLanguageLabel(
  language?: string
) {

  if (!language) {
    return "";
  }


  const labels:
    Record<string, string> = {

      bn: "বাংলা",

      en: "English",

      hi: "हिन्दी",

      as: "অসমীয়া",

      or: "ଓଡ଼ିଆ",

      ta: "தமிழ்",

      te: "తెలుగు",

      ml: "മലയാളം",

      kn: "ಕನ್ನಡ",

      mr: "मराठी",

      gu: "ગુજરાતી",

      pa: "ਪੰਜਾਬੀ",

      ur: "اردو",

  };


  return (
    labels[language] ||
    language.toUpperCase()
  );

}


// ==========================================================
// DATE
// ==========================================================

function formatDate(
  value?: string
) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

}


// ==========================================================
// COMMENT DATE
// ==========================================================

function formatCommentDate(
  value?: string
) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }
  );

}


// ==========================================================
// AUTHOR NAME
// ==========================================================

function getAuthorName(
  writing: DetailWriting,
  fallbackName: string
) {

  return (
    writing.author?.name ||
    writing.user?.name ||
    writing.author_name ||
    fallbackName
  );

}


// ==========================================================
// AUTHOR ID
// ==========================================================

function getAuthorId(
  writing: DetailWriting
) {

  return (
    writing.author?.id ||
    writing.user?.id ||
    writing.author_id ||
    writing.user_id ||
    undefined
  );

}


// ==========================================================
// NORMALIZE COMMENTS
// ==========================================================

function normalizeComments(
  data: any
): WritingComment[] {

  if (
    Array.isArray(data)
  ) {

    return data;

  }


  if (
    Array.isArray(
      data?.comments
    )
  ) {

    return data.comments;

  }


  return [];

}


// ==========================================================
// NORMALIZE LIKE COUNT
// ==========================================================

function getLikeCount(
  data: any,
  fallback = 0
) {

  if (
    typeof data === "number"
  ) {

    return data;

  }


  const possibleValues = [

    data?.count,

    data?.likes_count,

    data?.likes,

  ];


  for (
    const value
    of possibleValues
  ) {

    if (
      typeof value === "number"
    ) {

      return value;

    }

  }


  return fallback;

}


// ==========================================================
// NORMALIZE LIKED STATUS
// ==========================================================

function getLikedStatus(
  data: any
) {

  return Boolean(
    data?.liked ??
    data?.is_liked ??
    data?.has_liked ??
    false
  );

}


// ==========================================================
// SCREEN
// ==========================================================

export default function WritingDetailsScreen() {

  const {
    user,
    loading: authLoading,
  } = useAuth();


  const {
    t,
  } = useLanguage();


  const params =
    useLocalSearchParams<{
      id?: string;
    }>();


  const writingId =
    Number(params.id);
  
  const [
    writing,
    setWriting,
  ] =
    useState<DetailWriting | null>(
      null
    );


  const [
    comments,
    setComments,
  ] =
    useState<WritingComment[]>(
      []
    );


  const [
    liked,
    setLiked,
  ] =
    useState(false);


  const [
    likesCount,
    setLikesCount,
  ] =
    useState(0);


  const [
    commentText,
    setCommentText,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    likeLoading,
    setLikeLoading,
  ] =
    useState(false);


  const [
    commentLoading,
    setCommentLoading,
  ] =
    useState(false);


  const [
    deletingCommentId,
    setDeletingCommentId,
  ] =
    useState<number | null>(
      null
    );


  const [
    error,
    setError,
  ] =
    useState("");


  // ========================================================
  // VALID ID
  // ========================================================

  const validWritingId =
    Number.isInteger(
      writingId
    ) &&
    writingId > 0;


  // ========================================================
  // LOAD WRITING
  // ========================================================

  const loadWriting =
    useCallback(
      async () => {

        if (!validWritingId) {

          throw new Error(
            t("writingDetails.invalidWriting")
          );

        }


        const data =
          await getWriting(
            writingId
          );


        const result =
          (
            data as any
          )?.writing ??
          data;


        const item =
          result as DetailWriting;


        setWriting(
          item
        );


        if (
          typeof item?.likes_count ===
          "number"
        ) {

          setLikesCount(
            item.likes_count
          );

        }

      },
      [
        validWritingId,
        writingId,
        t,
      ]
    );


  // ========================================================
  // LOAD COMMENTS
  // ========================================================

  const loadComments =
    useCallback(
      async () => {

        if (!validWritingId) {
          return;
        }


        const data =
          await getComments(
            writingId
          );


        setComments(
          normalizeComments(
            data
          )
        );

      },
      [
        validWritingId,
        writingId,
      ]
    );


  // ========================================================
  // LOAD PUBLIC LIKE COUNT
  // ========================================================

  const loadPublicLikes =
    useCallback(
      async () => {

        if (!validWritingId) {
          return;
        }


        const data =
          await getWritingLikes(
            writingId
          );


        setLikesCount(
          (
            previous
          ) =>
            getLikeCount(
              data,
              previous
            )
        );

      },
      [
        validWritingId,
        writingId,
      ]
    );


  // ========================================================
  // LOAD MY LIKE
  // ========================================================

  const loadMyLike =
    useCallback(
      async () => {

        if (
          !validWritingId ||
          !user
        ) {

          setLiked(false);

          return;

        }


        try {

          const data =
            await getMyLikeStatus(
              writingId
            );


          setLiked(
            getLikedStatus(
              data
            )
          );


          setLikesCount(
            (
              previous
            ) =>
              getLikeCount(
                data,
                previous
              )
          );

        } catch (err) {

          console.error(
            "LIKE STATUS ERROR:",
            err
          );

        }

      },
      [
        validWritingId,
        writingId,
        user,
      ]
    );


  // ========================================================
  // LOAD EVERYTHING
  // ========================================================

  const loadPage =
    useCallback(
      async () => {

        if (!validWritingId) {

          setError(
            t("writingDetails.invalidWriting")
          );

          setLoading(false);

          setRefreshing(false);

          return;

        }


        try {

          setError("");


          // The writing itself is required.
          // If this request fails, show the page error.
          await loadWriting();


          // Comments and likes are secondary data.
          // Their failure must not hide a valid writing.
          const secondaryResults =
            await Promise.allSettled([

              loadComments(),

              loadPublicLikes(),

            ]);


          secondaryResults.forEach(
            (
              result,
              index
            ) => {

              if (
                result.status ===
                "rejected"
              ) {

                console.warn(
                  index === 0
                    ? "COMMENTS LOAD WARNING:"
                    : "LIKES LOAD WARNING:",
                  result.reason
                );

              }

            }
          );


        } catch (err: any) {

          console.error(
            "WRITING DETAILS ERROR:",
            err
          );


          setError(
            err?.message ||
            t("writingDetails.loadErrorDescription")
          );


        } finally {

          setLoading(false);

          setRefreshing(false);

        }

      },
      [
        validWritingId,
        loadWriting,
        loadComments,
        loadPublicLikes,
        t,
      ]
    );


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {

    setLoading(true);

    loadPage();

  }, [loadPage]);


  // ========================================================
  // LOAD LOGIN-SPECIFIC LIKE STATUS
  // ========================================================

  useEffect(() => {

    if (authLoading) {
      return;
    }


    loadMyLike();

  }, [
    authLoading,
    loadMyLike,
  ]);


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh =
    async () => {

      setRefreshing(true);


      try {

        await loadPage();


        if (user) {

          await loadMyLike();

        }

      } finally {

        setRefreshing(false);

      }

    };


  // ========================================================
  // WRITER PROFILE
  // ========================================================

  const openWriterProfile =
    () => {

      if (!writing) {
        return;
      }


      const authorId =
        getAuthorId(
          writing
        );


      if (!authorId) {

        Alert.alert(
          t("writingDetails.writerUnavailable"),
          t("writingDetails.writerUnavailableDescription")
        );

        return;

      }


      router.push({

        pathname:
          "/users/[id]",

        params: {
          id:
            String(
              authorId
            ),
        },

      });

    };


  // ========================================================
  // LIKE / UNLIKE
  // ========================================================

  const handleLike =
    async () => {

      if (!user) {

        Alert.alert(
          t("writingDetails.signInRequired"),
          t("writingDetails.signInToLike")
        );

        return;

      }


      if (
        likeLoading ||
        !validWritingId
      ) {

        return;

      }


      const previousLiked =
        liked;


      const previousCount =
        likesCount;


      try {

        setLikeLoading(true);


        if (liked) {

          setLiked(false);

          setLikesCount(
            Math.max(
              0,
              likesCount - 1
            )
          );


          const data =
            await unlikeWriting(
              writingId
            );


          setLiked(
            data?.liked !== undefined
              ? getLikedStatus(data)
              : false
          );


          setLikesCount(
            getLikeCount(
              data,
              Math.max(
                0,
                previousCount - 1
              )
            )
          );


        } else {

          setLiked(true);

          setLikesCount(
            likesCount + 1
          );


          const data =
            await likeWriting(
              writingId
            );


          setLiked(
            data?.liked !== undefined
              ? getLikedStatus(data)
              : true
          );


          setLikesCount(
            getLikeCount(
              data,
              previousCount + 1
            )
          );

        }


      } catch (err: any) {

        setLiked(
          previousLiked
        );

        setLikesCount(
          previousCount
        );


        Alert.alert(
          t("writingDetails.likeError"),
          err?.message ||
          t("writingDetails.tryAgain")
        );


      } finally {

        setLikeLoading(false);

      }

    };


  // ========================================================
  // ADD COMMENT
  // ========================================================

  const handleAddComment =
    async () => {

      if (!user) {

        Alert.alert(
          t("writingDetails.signInRequired"),
          t("writingDetails.signInToComment")
        );

        return;

      }


      const content =
        commentText.trim();


      if (!content) {

        Alert.alert(
          t("writingDetails.commentRequired"),
          t("writingDetails.commentRequiredDescription")
        );

        return;

      }


      if (
        content.length >
        MAX_COMMENT_LENGTH
      ) {

        Alert.alert(
          t("writingDetails.commentTooLong"),
          t("writingDetails.commentTooLongDescription", { max: MAX_COMMENT_LENGTH })
        );

        return;

      }


      if (!validWritingId) {
        return;
      }


      try {

        setCommentLoading(
          true
        );


        const data =
          await addComment(
            writingId,
            content
          );


        const created =
          (
            data as any
          )?.comment ??
          data;


        if (
          created &&
          typeof created.id ===
            "number"
        ) {

          const normalized:
            WritingComment = {

              ...created,

              author:
                created.author || {
                  id: user.id,
                  name: user.name,
                },

            };


          setComments(
            (
              previous
            ) => [
              normalized,
              ...previous,
            ]
          );


        } else {

          await loadComments();

        }


        setCommentText("");


      } catch (err: any) {

        Alert.alert(
          t("writingDetails.commentError"),
          err?.message ||
          t("writingDetails.tryAgain")
        );


      } finally {

        setCommentLoading(
          false
        );

      }

    };


  // ========================================================
  // OPEN COMMENT AUTHOR PROFILE
  // ========================================================

  const openCommentAuthorProfile =
    (
      comment:
        WritingComment
    ) => {

      const commentAuthorId =
        comment.author?.id ||
        comment.user_id;


      if (!commentAuthorId) {

        Alert.alert(
          t("writingDetails.profileUnavailable"),
          t("writingDetails.profileUnavailableDescription")
        );

        return;

      }


      router.push({

        pathname:
          "/users/[id]",

        params: {
          id:
            String(
              commentAuthorId
            ),
        },

      });

    };


  // ========================================================
  // DELETE COMMENT
  // ========================================================

  const confirmDeleteComment =
    (
      comment:
        WritingComment
    ) => {

      Alert.alert(

        t("writingDetails.deleteCommentTitle"),

        t("writingDetails.deleteCommentDescription"),

        [

          {
            text: t("writingDetails.cancel"),
            style: "cancel",
          },

          {
            text: t("writingDetails.delete"),
            style:
              "destructive",

            onPress:
              async () => {

                try {

                  setDeletingCommentId(
                    comment.id
                  );


                  await deleteComment(
                    comment.id
                  );


                  setComments(
                    (
                      previous
                    ) =>
                      previous.filter(
                        (
                          item
                        ) =>
                          item.id !==
                          comment.id
                      )
                  );


                } catch (err: any) {

                  Alert.alert(
                    t("writingDetails.deleteError"),
                    err?.message ||
                    t("writingDetails.tryAgain")
                  );


                } finally {

                  setDeletingCommentId(
                    null
                  );

                }

              },

          },

        ]

      );

    };


  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color="#9A6C20"
          />


          <Text
            style={
              styles.loadingText
            }
          >
            {t("writingDetails.loading")}
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // ERROR
  // ========================================================

  if (
    error ||
    !writing
  ) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <View
          style={
            styles.header
          }
        >

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >

            <ArrowLeft
              size={21}
              color="#302922"
            />

          </TouchableOpacity>

        </View>


        <View
          style={
            styles.errorContainer
          }
        >

          <RefreshCw
            size={38}
            color="#A38460"
          />


          <Text
            style={
              styles.errorTitle
            }
          >
            {t("writingDetails.unavailable")}
          </Text>


          <Text
            style={
              styles.errorText
            }
          >
            {
              error ||
              t("writingDetails.notFound")
            }
          </Text>


          <TouchableOpacity

            style={
              styles.retryButton
            }

            onPress={() => {

              setLoading(true);

              loadPage();

            }}

          >

            <Text
              style={
                styles.retryText
              }
            >
              {t("writingDetails.retry")}
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // DATA
  // ========================================================

  const authorId =
    getAuthorId(
      writing
    );


  const authorName =
    getAuthorName(
      writing,
      t("writingDetails.defaultWriter")
    );


  const publishedDate =
    writing.published_at ||
    writing.created_at;


  // ========================================================
  // SCREEN
  // ========================================================

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      {/* ====================================================
          TOP HEADER
      ==================================================== */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity

          style={
            styles.backButton
          }

          activeOpacity={
            0.8
          }

          onPress={() =>
            router.back()
          }

        >

          <ArrowLeft
            size={21}
            color="#302922"
          />

        </TouchableOpacity>


        <View
          style={
            styles.headerTitleContainer
          }
        >

          <BookOpen
            size={15}
            color="#9A6C20"
          />


          <Text
            style={
              styles.headerTitle
            }
          >
            {t("writingDetails.headerTitle")}
          </Text>

        </View>


        <View
          style={
            styles.headerSpacer
          }
        />

      </View>


      {/* ====================================================
          SCROLL
      ==================================================== */}

      <ScrollView

        style={
          styles.scroll
        }

        contentContainerStyle={
          styles.scrollContent
        }

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              handleRefresh
            }

          />

        }

      >

        {/* ==================================================
            CATEGORY + LANGUAGE
        ================================================== */}

        <View
          style={
            styles.metaTop
          }
        >

          <View
            style={
              styles.categoryBadge
            }
          >

            <Text
              style={
                styles.categoryText
              }
            >
              {
                writing.category ||
                t("writingDetails.otherCategory")
              }
            </Text>

          </View>


          {!!writing.language && (

            <View
              style={
                styles.languageRow
              }
            >

              <Globe2
                size={14}
                color="#927348"
              />


              <Text
                style={
                  styles.languageText
                }
              >
                {
                  getLanguageLabel(
                    writing.language
                  )
                }
              </Text>

            </View>

          )}

        </View>


        {/* ==================================================
            TITLE
        ================================================== */}

        <Text
          style={
            styles.title
          }
        >
          {writing.title}
        </Text>


        {/* ==================================================
            AUTHOR PROFILE
        ================================================== */}

        <TouchableOpacity

          style={
            styles.authorCard
          }

          activeOpacity={
            authorId
              ? 0.78
              : 1
          }

          disabled={
            !authorId
          }

          onPress={
            openWriterProfile
          }

        >

          <View
            style={
              styles.avatar
            }
          >

            <User
              size={18}
              color="#FFFFFF"
            />

          </View>


          <View
            style={
              styles.authorInfo
            }
          >

            <Text
              style={
                styles.authorLabel
              }
            >
              {t("writingDetails.writtenBy")}
            </Text>


            <Text
              style={
                styles.authorName
              }
            >
              {authorName}
            </Text>


            {!!publishedDate && (

              <View
                style={
                  styles.dateRow
                }
              >

                <CalendarDays
                  size={12}
                  color="#94887C"
                />


                <Text
                  style={
                    styles.dateText
                  }
                >
                  {
                    formatDate(
                      publishedDate
                    )
                  }
                </Text>

              </View>

            )}

          </View>


          {authorId && (

            <View
              style={
                styles.profileAction
              }
            >

              <Text
                style={
                  styles.profileText
                }
              >
                {t("writingDetails.profile")}
              </Text>


              <ChevronRight
                size={17}
                color="#9A6C20"
              />

            </View>

          )}

        </TouchableOpacity>


        {/* ==================================================
            DIVIDER
        ================================================== */}

        <View
          style={
            styles.divider
          }
        />


        {/* ==================================================
            WRITING CONTENT
        ================================================== */}

        <Text
          style={
            styles.content
          }
        >
          {writing.content}
        </Text>


        {/* ==================================================
            ENGAGEMENT
        ================================================== */}

        <View
          style={
            styles.engagementCard
          }
        >

          <TouchableOpacity

            style={[
              styles.likeButton,

              liked &&
                styles.likeButtonActive,
            ]}

            activeOpacity={
              0.8
            }

            disabled={
              likeLoading
            }

            onPress={
              handleLike
            }

          >

            {likeLoading ? (

              <ActivityIndicator
                size="small"
                color={
                  liked
                    ? "#934B46"
                    : "#6F6257"
                }
              />

            ) : (

              <Heart

                size={20}

                color={
                  liked
                    ? "#934B46"
                    : "#6F6257"
                }

                fill={
                  liked
                    ? "#934B46"
                    : "transparent"
                }

              />

            )}


            <Text
              style={[
                styles.likeText,

                liked &&
                  styles.likeTextActive,
              ]}
            >
              {
                liked
                  ? t("writingDetails.liked")
                  : t("writingDetails.like")
              }
            </Text>


            <Text
              style={
                styles.engagementCount
              }
            >
              {likesCount}
            </Text>

          </TouchableOpacity>


          <View
            style={
              styles.engagementDivider
            }
          />


          <View
            style={
              styles.commentCount
            }
          >

            <MessageCircle
              size={20}
              color="#6F6257"
            />


            <Text
              style={
                styles.commentCountText
              }
            >
              {t("writingDetails.comments")}
            </Text>


            <Text
              style={
                styles.engagementCount
              }
            >
              {comments.length}
            </Text>

          </View>

        </View>


        {/* ==================================================
            COMMENTS HEADER
        ================================================== */}

        <View
          style={
            styles.commentsHeader
          }
        >

          <View>

            <Text
              style={
                styles.sectionEyebrow
              }
            >
              {t("writingDetails.discussion")}
            </Text>


            <Text
              style={
                styles.commentsTitle
              }
            >
              {t("writingDetails.comments")}
            </Text>

          </View>


          <View
            style={
              styles.commentNumberBadge
            }
          >

            <Text
              style={
                styles.commentNumber
              }
            >
              {comments.length}
            </Text>

          </View>

        </View>


        {/* ==================================================
            COMMENT FORM
        ================================================== */}

        {authLoading ? (

          <View
            style={
              styles.authLoading
            }
          >

            <ActivityIndicator
              size="small"
              color="#9A6C20"
            />

          </View>

        ) : user ? (

          <View
            style={
              styles.commentForm
            }
          >

            <View
              style={
                styles.commentUserRow
              }
            >

              <View
                style={
                  styles.smallAvatar
                }
              >

                <User
                  size={14}
                  color="#FFFFFF"
                />

              </View>


              <Text
                style={
                  styles.commentingAs
                }
              >
                {t("writingDetails.commentingAs")}{" "}
                <Text
                  style={
                    styles.commentingName
                  }
                >
                  {user.name}
                </Text>
              </Text>

            </View>


            <TextInput

              value={
                commentText
              }

              onChangeText={
                setCommentText
              }

              placeholder={t("writingDetails.commentPlaceholder")}

              placeholderTextColor="#A49B92"

              style={
                styles.commentInput
              }

              multiline

              maxLength={
                MAX_COMMENT_LENGTH
              }

              textAlignVertical="top"

            />


            <View
              style={
                styles.commentFormFooter
              }
            >

              <Text
                style={
                  styles.characterCount
                }
              >
                {
                  commentText.length
                }
                /
                {
                  MAX_COMMENT_LENGTH
                }
              </Text>


              <TouchableOpacity

                style={[
                  styles.sendButton,

                  (
                    !commentText.trim() ||
                    commentLoading
                  ) &&
                    styles.sendButtonDisabled,
                ]}

                disabled={
                  !commentText.trim() ||
                  commentLoading
                }

                activeOpacity={
                  0.85
                }

                onPress={
                  handleAddComment
                }

              >

                {commentLoading ? (

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                ) : (

                  <>

                    <Send
                      size={15}
                      color="#FFFFFF"
                    />


                    <Text
                      style={
                        styles.sendText
                      }
                    >
                      {t("writingDetails.post")}
                    </Text>

                  </>

                )}

              </TouchableOpacity>

            </View>

          </View>

        ) : (

          <TouchableOpacity

            style={
              styles.signInCard
            }

            activeOpacity={
              0.8
            }

            onPress={() => {

              router.push(
                "/(tabs)/account"
              );

            }}

          >

            <View
              style={
                styles.signInIcon
              }
            >

              <User
                size={18}
                color="#8A5C19"
              />

            </View>


            <View
              style={{
                flex: 1,
              }}
            >

              <Text
                style={
                  styles.signInTitle
                }
              >
                {t("writingDetails.joinDiscussion")}
              </Text>


              <Text
                style={
                  styles.signInText
                }
              >
                {t("writingDetails.signInToLeaveComment")}
              </Text>

            </View>


            <ChevronRight
              size={18}
              color="#9A6C20"
            />

          </TouchableOpacity>

        )}


        {/* ==================================================
            COMMENTS
        ================================================== */}

        <View
          style={
            styles.commentsList
          }
        >

          {comments.length === 0 ? (

            <View
              style={
                styles.emptyComments
              }
            >

              <View
                style={
                  styles.emptyCommentIcon
                }
              >

                <MessageCircle
                  size={27}
                  color="#A08056"
                />

              </View>


              <Text
                style={
                  styles.emptyCommentsTitle
                }
              >
                {t("writingDetails.noComments")}
              </Text>


              <Text
                style={
                  styles.emptyCommentsText
                }
              >
                {t("writingDetails.noCommentsDescription")}
              </Text>

            </View>

          ) : (

            comments.map(
              (
                comment
              ) => {

                const commentAuthor =
                  comment.author?.name ||
                  t("writingDetails.defaultReader");


                const commentUserId =
                  comment.author?.id ||
                  comment.user_id;


                const isMine =
                  Boolean(
                    user &&
                    commentUserId &&
                    Number(
                      commentUserId
                    ) ===
                      Number(
                        user.id
                      )
                  );


                return (

                  <View
                    key={
                      String(
                        comment.id
                      )
                    }
                    style={
                      styles.commentCard
                    }
                  >

                    <View
                      style={
                        styles.commentCardTop
                      }
                    >

                      <TouchableOpacity

                        style={
                          styles.commentProfile
                        }

                        activeOpacity={
                          commentUserId
                            ? 0.75
                            : 1
                        }

                        disabled={
                          !commentUserId
                        }

                        onPress={() =>
                          openCommentAuthorProfile(
                            comment
                          )
                        }

                      >

                        <View
                          style={
                            styles.commentAvatar
                          }
                        >

                          <User
                            size={14}
                            color="#FFFFFF"
                          />

                        </View>


                        <View
                          style={
                            styles.commentAuthorInfo
                          }
                        >

                          <View
                            style={
                              styles.commentAuthorNameRow
                            }
                          >

                            <Text
                              style={
                                styles.commentAuthor
                              }
                            >
                              {
                                commentAuthor
                              }
                            </Text>


                            {commentUserId && (

                              <ChevronRight
                                size={13}
                                color="#A18460"
                              />

                            )}

                          </View>


                          {!!comment.created_at && (

                            <Text
                              style={
                                styles.commentDate
                              }
                            >
                              {
                                formatCommentDate(
                                  comment.created_at
                                )
                              }
                            </Text>

                          )}

                        </View>

                      </TouchableOpacity>


                      {isMine && (

                        <TouchableOpacity

                          style={
                            styles.deleteButton
                          }

                          disabled={
                            deletingCommentId ===
                            comment.id
                          }

                          onPress={() =>
                            confirmDeleteComment(
                              comment
                            )
                          }

                        >

                          {
                            deletingCommentId ===
                            comment.id
                              ? (

                                <ActivityIndicator
                                  size="small"
                                  color="#A65A55"
                                />

                              )
                              : (

                                <Trash2
                                  size={15}
                                  color="#A65A55"
                                />

                              )
                          }

                        </TouchableOpacity>

                      )}

                    </View>


                    <Text
                      style={
                        styles.commentContent
                      }
                    >
                      {comment.content}
                    </Text>

                  </View>

                );

              }
            )

          )}

        </View>

      </ScrollView>

    </SafeAreaView>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    safeArea: {

      flex: 1,

      backgroundColor:
        "#FBFAF7",

    },


    // ======================================================
    // HEADER
    // ======================================================

    header: {

      height:
        58,

      paddingHorizontal:
        20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEE7DE",

      backgroundColor:
        "#FBFAF7",

    },


    backButton: {

      width:
        40,

      height:
        40,

      borderRadius:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EAE2",

    },


    headerTitleContainer: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

    },


    headerTitle: {

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#40372F",

    },


    headerSpacer: {

      width:
        40,

    },


    // ======================================================
    // SCROLL
    // ======================================================

    scroll: {

      flex:
        1,

    },


    scrollContent: {

      paddingHorizontal:
        20,

      paddingTop:
        24,

      paddingBottom:
        60,

    },


    // ======================================================
    // METADATA
    // ======================================================

    metaTop: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    categoryBadge: {

      paddingHorizontal:
        11,

      paddingVertical:
        6,

      borderRadius:
        20,

      backgroundColor:
        "#F1E5D2",

    },


    categoryText: {

      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#7A531A",

    },


    languageRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

    },


    languageText: {

      fontSize:
        11,

      fontWeight:
        "600",

      color:
        "#887866",

    },


    // ======================================================
    // TITLE
    // ======================================================

    title: {

      marginTop:
        19,

      fontSize:
        32,

      lineHeight:
        43,

      fontWeight:
        "700",

      color:
        "#261F1A",

    },


    // ======================================================
    // AUTHOR
    // ======================================================

    authorCard: {

      marginTop:
        22,

      padding:
        14,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        "#E4DACE",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

    },


    avatar: {

      width:
        45,

      height:
        45,

      borderRadius:
        23,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#542777",

    },


    authorInfo: {

      flex:
        1,

      marginLeft:
        11,

    },


    authorLabel: {

      fontSize:
        8,

      fontWeight:
        "700",

      letterSpacing:
        1.3,

      color:
        "#9A6C20",

    },


    authorName: {

      marginTop:
        3,

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#453A31",

    },


    dateRow: {

      marginTop:
        4,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

    },


    dateText: {

      fontSize:
        10,

      color:
        "#94887C",

    },


    profileAction: {

      marginLeft:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    profileText: {

      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#8A5C19",

    },


    // ======================================================
    // CONTENT
    // ======================================================

    divider: {

      height:
        1,

      marginVertical:
        25,

      backgroundColor:
        "#EDE5DC",

    },


    content: {

      fontSize:
        16,

      lineHeight:
        30,

      color:
        "#413830",

    },


    // ======================================================
    // ENGAGEMENT
    // ======================================================

    engagementCard: {

      marginTop:
        31,

      minHeight:
        62,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        "#E3D9CE",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

    },


    likeButton: {

      flex:
        1,

      height:
        60,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

    },


    likeButtonActive: {

      backgroundColor:
        "#FCF4F2",

      borderTopLeftRadius:
        12,

      borderBottomLeftRadius:
        12,

    },


    likeText: {

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#665A50",

    },


    likeTextActive: {

      color:
        "#934B46",

    },


    engagementCount: {

      minWidth:
        20,

      paddingHorizontal:
        6,

      paddingVertical:
        2,

      borderRadius:
        12,

      textAlign:
        "center",

      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#665A50",

      backgroundColor:
        "#F2ECE5",

    },


    engagementDivider: {

      width:
        1,

      height:
        31,

      backgroundColor:
        "#E7DED5",

    },


    commentCount: {

      flex:
        1,

      height:
        60,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

    },


    commentCountText: {

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#665A50",

    },


    // ======================================================
    // COMMENTS HEADER
    // ======================================================

    commentsHeader: {

      marginTop:
        36,

      marginBottom:
        17,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

    },


    sectionEyebrow: {

      fontSize:
        9,

      fontWeight:
        "700",

      letterSpacing:
        1.7,

      color:
        "#9A6C20",

    },


    commentsTitle: {

      marginTop:
        5,

      fontSize:
        25,

      fontWeight:
        "700",

      color:
        "#2D261F",

    },


    commentNumberBadge: {

      minWidth:
        30,

      height:
        30,

      paddingHorizontal:
        9,

      borderRadius:
        15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F1E5D2",

    },


    commentNumber: {

      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#79531B",

    },


    // ======================================================
    // COMMENT FORM
    // ======================================================

    commentForm: {

      padding:
        15,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E2D8CC",

      backgroundColor:
        "#FFFFFF",

    },


    commentUserRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    smallAvatar: {

      width:
        29,

      height:
        29,

      borderRadius:
        15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#542777",

    },


    commentingAs: {

      marginLeft:
        8,

      fontSize:
        11,

      color:
        "#8B8075",

    },


    commentingName: {

      fontWeight:
        "700",

      color:
        "#574B41",

    },


    commentInput: {

      minHeight:
        100,

      maxHeight:
        190,

      marginTop:
        13,

      paddingHorizontal:
        13,

      paddingVertical:
        12,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        "#DED5CB",

      fontSize:
        13,

      lineHeight:
        20,

      color:
        "#332C26",

      backgroundColor:
        "#FCFBF9",

    },


    commentFormFooter: {

      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    characterCount: {

      fontSize:
        9,

      color:
        "#A0968C",

    },


    sendButton: {

      minWidth:
        85,

      height:
        38,

      paddingHorizontal:
        15,

      borderRadius:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      backgroundColor:
        "#292522",

    },


    sendButtonDisabled: {

      opacity:
        0.45,

    },


    sendText: {

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#FFFFFF",

    },


    authLoading: {

      paddingVertical:
        30,

      alignItems:
        "center",

    },


    // ======================================================
    // SIGN IN
    // ======================================================

    signInCard: {

      padding:
        15,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        "#E4D6C3",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FBF5EB",

    },


    signInIcon: {

      width:
        40,

      height:
        40,

      marginRight:
        11,

      borderRadius:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0E1C9",

    },


    signInTitle: {

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#4F4236",

    },


    signInText: {

      marginTop:
        3,

      fontSize:
        10,

      color:
        "#8A7B6C",

    },


    // ======================================================
    // COMMENTS
    // ======================================================

    commentsList: {

      marginTop:
        16,

    },


    commentCard: {

      marginBottom:
        12,

      padding:
        15,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        "#E7DED4",

      backgroundColor:
        "#FFFFFF",

    },


    commentCardTop: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    commentProfile: {

      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    commentAuthorNameRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,

    },


    commentAvatar: {

      width:
        32,

      height:
        32,

      borderRadius:
        16,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#6B4A80",

    },


    commentAuthorInfo: {

      flex:
        1,

      marginLeft:
        9,

    },


    commentAuthor: {

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#4F443B",

    },


    commentDate: {

      marginTop:
        2,

      fontSize:
        9,

      color:
        "#A0968C",

    },


    deleteButton: {

      width:
        34,

      height:
        34,

      borderRadius:
        17,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FBF0EF",

    },


    commentContent: {

      marginTop:
        11,

      fontSize:
        13,

      lineHeight:
        21,

      color:
        "#62564C",

    },


    // ======================================================
    // EMPTY COMMENTS
    // ======================================================

    emptyComments: {

      paddingVertical:
        45,

      alignItems:
        "center",

    },


    emptyCommentIcon: {

      width:
        61,

      height:
        61,

      borderRadius:
        31,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3EADF",

    },


    emptyCommentsTitle: {

      marginTop:
        14,

      fontSize:
        17,

      fontWeight:
        "700",

      color:
        "#40372F",

    },


    emptyCommentsText: {

      maxWidth:
        260,

      marginTop:
        6,

      textAlign:
        "center",

      fontSize:
        11,

      lineHeight:
        18,

      color:
        "#897E73",

    },


    // ======================================================
    // LOADING / ERROR
    // ======================================================

    loadingContainer: {

      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    loadingText: {

      marginTop:
        12,

      fontSize:
        13,

      color:
        "#786F65",

    },


    errorContainer: {

      flex:
        1,

      paddingHorizontal:
        30,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    errorTitle: {

      marginTop:
        15,

      fontSize:
        21,

      fontWeight:
        "700",

      color:
        "#332C26",

    },


    errorText: {

      marginTop:
        8,

      textAlign:
        "center",

      fontSize:
        13,

      lineHeight:
        20,

      color:
        "#7F746A",

    },


    retryButton: {

      marginTop:
        19,

      paddingHorizontal:
        22,

      paddingVertical:
        11,

      borderRadius:
        9,

      backgroundColor:
        "#292522",

    },


    retryText: {

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#FFFFFF",

    },

  });