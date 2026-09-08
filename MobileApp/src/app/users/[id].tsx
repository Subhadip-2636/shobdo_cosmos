import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
  Check,
  ChevronRight,
  FileText,
  Heart,
  MessageCircle,
  RefreshCw,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  API_URL,
} from "../../api/config";

import {
  authFetch,
} from "../../api/auth";

import type {
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

type PublicUser = {
  id: number;
  name: string;
  created_at?: string;
};


type UserStats = {
  writings_count: number;
  likes_count: number;
  comments_count: number;
  followers_count: number;
  following_count: number;
};


type ProfileResponse = {
  user: PublicUser;
  stats: UserStats;
};


type WritingsResponse = {
  user?: PublicUser;
  count?: number;
  writings?: Writing[];
};


type FollowStatusResponse = {
  following: boolean;
  is_self: boolean;
  followers_count: number;
  following_count: number;
};


type FollowResponse = {
  message?: string;
  following: boolean;
  followers_count: number;
  following_count?: number;
};


// ==========================================================
// DEFAULT STATS
// ==========================================================

const EMPTY_STATS: UserStats = {
  writings_count: 0,
  likes_count: 0,
  comments_count: 0,
  followers_count: 0,
  following_count: 0,
};


// ==========================================================
// PUBLIC REQUEST
// ==========================================================

async function publicRequest<T>(
  endpoint: string
): Promise<T> {

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );


  let data: any = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      "Requested resource was not found."
    );

  }


  return data as T;

}


// ==========================================================
// AUTHENTICATED REQUEST
// ==========================================================

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const response =
    await authFetch(
      endpoint,
      options
    );


  let data: any = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      "Request failed."
    );

  }


  return data as T;

}


// ==========================================================
// SAFE NUMBER
// ==========================================================

function safeNumber(
  value: unknown
) {

  const result =
    Number(value);


  return Number.isFinite(
    result
  )
    ? result
    : 0;

}


// ==========================================================
// INITIALS
// ==========================================================

function getInitials(
  name?: string
) {

  if (!name) {
    return "S";
  }


  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    words.length === 0
  ) {

    return "S";

  }


  if (
    words.length === 1
  ) {

    return words[0]
      .charAt(0)
      .toUpperCase();

  }


  return (
    words[0].charAt(0) +
    words[
      words.length - 1
    ].charAt(0)
  ).toUpperCase();

}


// ==========================================================
// WRITING LANGUAGE
// ==========================================================

function getLanguageLabel(
  code?: string
) {

  if (!code) {
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
    labels[code] ||
    code.toUpperCase()
  );

}


// ==========================================================
// WRITER PROFILE SCREEN
// ==========================================================

export default function WriterProfileScreen() {

  // ========================================================
  // AUTH
  // ========================================================

  const {
    user: currentUser,
    loading: authLoading,
  } = useAuth();


  // ========================================================
  // LANGUAGE
  // ========================================================

  const {
    t,
    language,
  } = useLanguage();


  // ========================================================
  // ROUTE
  // ========================================================

  const params =
    useLocalSearchParams<{
      id?: string;
    }>();


  const userId =
    Number(
      params.id
    );


  const validUserId =
    Number.isInteger(
      userId
    ) &&
    userId > 0;


  // ========================================================
  // STATE
  // ========================================================

  const [
    profile,
    setProfile,
  ] =
    useState<PublicUser | null>(
      null
    );


  const [
    stats,
    setStats,
  ] =
    useState<UserStats>(
      EMPTY_STATS
    );


  const [
    writings,
    setWritings,
  ] =
    useState<Writing[]>(
      []
    );


  const [
    following,
    setFollowing,
  ] =
    useState(
      false
    );


  const [
    isSelf,
    setIsSelf,
  ] =
    useState(
      false
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    followLoading,
    setFollowLoading,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  // ========================================================
  // LOCALIZED MEMBER DATE
  // ========================================================

  const memberSince =
    useMemo(
      () => {

        if (
          !profile?.created_at
        ) {

          return "";

        }


        const date =
          new Date(
            profile.created_at
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return "";

        }


        try {

          const locale =
            language === "bn"
              ? "bn-BD"
              : language === "hi"
                ? "hi-IN"
                : "en-IN";


          return new Intl.DateTimeFormat(
            locale,
            {
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

      },
      [
        profile?.created_at,
        language,
      ]
    );


  // ========================================================
  // PROFILE
  // ========================================================

  const loadProfile =
    useCallback(
      async () => {

        if (
          !validUserId
        ) {

          throw new Error(
            t(
              "writer.invalidWriter"
            )
          );

        }


        const data =
          await publicRequest<
            ProfileResponse
          >(
            `/users/${userId}`
          );


        setProfile(
          data.user
        );


        setStats({

          writings_count:
            safeNumber(
              data.stats
                ?.writings_count
            ),

          likes_count:
            safeNumber(
              data.stats
                ?.likes_count
            ),

          comments_count:
            safeNumber(
              data.stats
                ?.comments_count
            ),

          followers_count:
            safeNumber(
              data.stats
                ?.followers_count
            ),

          following_count:
            safeNumber(
              data.stats
                ?.following_count
            ),

        });

      },
      [
        validUserId,
        userId,
        t,
      ]
    );


  // ========================================================
  // WRITINGS
  // ========================================================

  const loadWritings =
    useCallback(
      async () => {

        if (
          !validUserId
        ) {

          return;

        }


        const data =
          await publicRequest<
            WritingsResponse
          >(
            `/users/${userId}/writings`
          );


        setWritings(
          Array.isArray(
            data?.writings
          )
            ? data.writings
            : []
        );

      },
      [
        validUserId,
        userId,
      ]
    );


  // ========================================================
  // FOLLOW STATUS
  // ========================================================

  const loadFollowStatus =
    useCallback(
      async () => {

        if (
          !validUserId
        ) {

          return;

        }


        if (
          !currentUser
        ) {

          setFollowing(
            false
          );

          setIsSelf(
            false
          );

          return;

        }


        const ownProfile =
          Number(
            currentUser.id
          ) === userId;


        if (
          ownProfile
        ) {

          setFollowing(
            false
          );

          setIsSelf(
            true
          );

          return;

        }


        setIsSelf(
          false
        );


        try {

          const data =
            await authenticatedRequest<
              FollowStatusResponse
            >(
              `/users/${userId}/follow-status`,
              {
                method:
                  "GET",
              }
            );


          setFollowing(
            Boolean(
              data.following
            )
          );


          setIsSelf(
            Boolean(
              data.is_self
            )
          );


          setStats(
            previous => ({

              ...previous,

              followers_count:
                safeNumber(
                  data.followers_count
                ),

              following_count:
                safeNumber(
                  data.following_count
                ),

            })
          );


        } catch (
          followStatusError
        ) {

          console.error(
            "FOLLOW STATUS ERROR:",
            followStatusError
          );

        }

      },
      [
        validUserId,
        userId,
        currentUser,
      ]
    );


  // ========================================================
  // LOAD PAGE
  // ========================================================

  const loadPage =
    useCallback(
      async () => {

        if (
          !validUserId
        ) {

          setError(
            t(
              "writer.invalidWriter"
            )
          );

          setLoading(
            false
          );

          setRefreshing(
            false
          );

          return;

        }


        try {

          setError(
            ""
          );


          await Promise.all([
            loadProfile(),
            loadWritings(),
          ]);


        } catch (
          loadError: any
        ) {

          console.error(
            "WRITER PROFILE ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            t(
              "writer.loadErrorDescription"
            )
          );


        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        validUserId,
        loadProfile,
        loadWritings,
        t,
      ]
    );


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(
    () => {

      setLoading(
        true
      );

      loadPage();

    },
    [
      loadPage,
    ]
  );


  // ========================================================
  // FOLLOW STATUS AFTER AUTH LOAD
  // ========================================================

  useEffect(
    () => {

      if (
        authLoading
      ) {

        return;

      }


      loadFollowStatus();

    },
    [
      authLoading,
      loadFollowStatus,
    ]
  );


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh =
    async () => {

      setRefreshing(
        true
      );


      try {

        await Promise.all([
          loadProfile(),
          loadWritings(),
        ]);


        if (
          !authLoading
        ) {

          await loadFollowStatus();

        }


      } catch (
        refreshError
      ) {

        console.error(
          "PROFILE REFRESH ERROR:",
          refreshError
        );


      } finally {

        setRefreshing(
          false
        );

      }

    };


  // ========================================================
  // FOLLOW / UNFOLLOW
  // ========================================================

  const handleFollow =
    async () => {

      // ----------------------------------------------------
      // NOT LOGGED IN
      // ----------------------------------------------------

      if (
        !currentUser
      ) {

        Alert.alert(
          t(
            "writer.signInRequired"
          ),
          t(
            "writer.signInRequiredDescription"
          ),
          [
            {
              text:
                t(
                  "writer.cancel"
                ),

              style:
                "cancel",
            },
            {
              text:
                t(
                  "writer.signIn"
                ),

              onPress:
                () => {

                  router.push(
                    "/(tabs)/account"
                  );

                },
            },
          ]
        );

        return;

      }


      // ----------------------------------------------------
      // SELF
      // ----------------------------------------------------

      if (
        isSelf
      ) {

        Alert.alert(
          t(
            "writer.yourProfile"
          ),
          t(
            "writer.cannotFollowYourself"
          )
        );

        return;

      }


      if (
        followLoading ||
        !validUserId
      ) {

        return;

      }


      const previousFollowing =
        following;


      const previousFollowers =
        stats.followers_count;


      try {

        setFollowLoading(
          true
        );


        // --------------------------------------------------
        // OPTIMISTIC UNFOLLOW
        // --------------------------------------------------

        if (
          previousFollowing
        ) {

          setFollowing(
            false
          );


          setStats(
            previous => ({

              ...previous,

              followers_count:
                Math.max(
                  0,
                  previous
                    .followers_count -
                  1
                ),

            })
          );


          const data =
            await authenticatedRequest<
              FollowResponse
            >(
              `/users/${userId}/follow`,
              {
                method:
                  "DELETE",
              }
            );


          setFollowing(
            Boolean(
              data.following
            )
          );


          setStats(
            previous => ({

              ...previous,

              followers_count:
                safeNumber(
                  data.followers_count
                ),

              following_count:
                data.following_count !==
                undefined
                  ? safeNumber(
                      data.following_count
                    )
                  : previous
                      .following_count,

            })
          );

        }

        // --------------------------------------------------
        // OPTIMISTIC FOLLOW
        // --------------------------------------------------

        else {

          setFollowing(
            true
          );


          setStats(
            previous => ({

              ...previous,

              followers_count:
                previous
                  .followers_count +
                1,

            })
          );


          const data =
            await authenticatedRequest<
              FollowResponse
            >(
              `/users/${userId}/follow`,
              {
                method:
                  "POST",
              }
            );


          setFollowing(
            Boolean(
              data.following
            )
          );


          setStats(
            previous => ({

              ...previous,

              followers_count:
                safeNumber(
                  data.followers_count
                ),

              following_count:
                data.following_count !==
                undefined
                  ? safeNumber(
                      data.following_count
                    )
                  : previous
                      .following_count,

            })
          );

        }


      } catch (
        followError: any
      ) {

        // rollback
        setFollowing(
          previousFollowing
        );


        setStats(
          previous => ({

            ...previous,

            followers_count:
              previousFollowers,

          })
        );


        console.error(
          "FOLLOW ERROR:",
          followError
        );


        Alert.alert(
          previousFollowing
            ? t(
                "writer.unfollowError"
              )
            : t(
                "writer.followError"
              ),
          followError?.message ||
          t(
            "writer.tryAgainDescription"
          )
        );


      } finally {

        setFollowLoading(
          false
        );

      }

    };


  // ========================================================
  // OPEN WRITING
  // ========================================================

  const openWriting =
    (
      writingId: number
    ) => {

      router.push({
        pathname:
          "/writings/[id]",

        params: {
          id:
            String(
              writingId
            ),
        },
      });

    };


  // ========================================================
  // LOADING
  // ========================================================

  if (
    loading
  ) {

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

            {
              t(
                "writer.loading"
              )
            }

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
    !profile
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
            activeOpacity={0.8}
            onPress={
              () =>
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
              styles.headerSpacer
            }
          />

        </View>


        <View
          style={
            styles.errorContainer
          }
        >

          <RefreshCw
            size={40}
            color="#A38460"
          />


          <Text
            style={
              styles.errorTitle
            }
          >

            {
              t(
                "writer.unavailable"
              )
            }

          </Text>


          <Text
            style={
              styles.errorText
            }
          >

            {
              error ||
              t(
                "writer.notFound"
              )
            }

          </Text>


          <TouchableOpacity
            style={
              styles.retryButton
            }
            activeOpacity={0.84}
            onPress={
              () => {

                setLoading(
                  true
                );

                loadPage();

              }
            }
          >

            <Text
              style={
                styles.retryText
              }
            >

              {
                t(
                  "writer.retry"
                )
              }

            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // MAIN SCREEN
  // ========================================================

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      {/* ====================================================
          HEADER
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
          activeOpacity={0.8}
          onPress={
            () =>
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
            styles.headerTitleRow
          }
        >

          <User
            size={15}
            color="#9A6C20"
          />


          <Text
            style={
              styles.headerTitle
            }
          >

            {
              t(
                "writer.profile"
              )
            }

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
            PROFILE HERO
        ================================================== */}

        <View
          style={
            styles.profileHero
          }
        >

          <View
            style={
              styles.avatarOuter
            }
          >

            <View
              style={
                styles.avatar
              }
            >

              <Text
                style={
                  styles.avatarText
                }
              >

                {
                  getInitials(
                    profile.name
                  )
                }

              </Text>

            </View>

          </View>


          <Text
            style={
              styles.profileName
            }
          >

            {
              profile.name
            }

          </Text>


          {!!memberSince && (

            <View
              style={
                styles.joinedRow
              }
            >

              <CalendarDays
                size={13}
                color="#8C7C6D"
              />


              <Text
                style={
                  styles.joinedText
                }
              >

                {
                  t(
                    "writer.memberSince"
                  )
                }

                {" "}

                {
                  memberSince
                }

              </Text>

            </View>

          )}


          {/* ================================================
              FOLLOW BUTTON
          ================================================ */}

          {!authLoading &&
            !isSelf && (

            <TouchableOpacity
              style={[
                styles.followButton,

                following &&
                  styles.followingButton,

                followLoading &&
                  styles.followButtonDisabled,
              ]}
              activeOpacity={0.84}
              disabled={
                followLoading
              }
              onPress={
                handleFollow
              }
            >

              {followLoading ? (

                <ActivityIndicator
                  size="small"
                  color={
                    following
                      ? "#6F5D4D"
                      : "#FFFFFF"
                  }
                />

              ) : following ? (

                <UserCheck
                  size={17}
                  color="#725D47"
                />

              ) : (

                <UserPlus
                  size={17}
                  color="#FFFFFF"
                />

              )}


              <Text
                style={[
                  styles.followButtonText,

                  following &&
                    styles.followingButtonText,
                ]}
              >

                {
                  following
                    ? t(
                        "writer.following"
                      )
                    : t(
                        "writer.follow"
                      )
                }

              </Text>


              {following &&
                !followLoading && (

                <Check
                  size={14}
                  color="#725D47"
                />

              )}

            </TouchableOpacity>

          )}


          {/* ================================================
              OWN PROFILE BADGE
          ================================================ */}

          {isSelf && (

            <View
              style={
                styles.ownProfileBadge
              }
            >

              <User
                size={14}
                color="#765C35"
              />


              <Text
                style={
                  styles.ownProfileText
                }
              >

                {
                  t(
                    "writer.yourProfile"
                  )
                }

              </Text>

            </View>

          )}

        </View>


        {/* ==================================================
            FOLLOW STATS
        ================================================== */}

        <View
          style={
            styles.followStatsCard
          }
        >

          <View
            style={
              styles.followStat
            }
          >

            <Text
              style={
                styles.followStatNumber
              }
            >

              {
                stats.followers_count
              }

            </Text>


            <Text
              style={
                styles.followStatLabel
              }
            >

              {
                t(
                  "writer.followers"
                )
              }

            </Text>

          </View>


          <View
            style={
              styles.verticalDivider
            }
          />


          <View
            style={
              styles.followStat
            }
          >

            <Text
              style={
                styles.followStatNumber
              }
            >

              {
                stats.following_count
              }

            </Text>


            <Text
              style={
                styles.followStatLabel
              }
            >

              {
                t(
                  "writer.following"
                )
              }

            </Text>

          </View>

        </View>


        {/* ==================================================
            COMMUNITY STATS
        ================================================== */}

        <View
          style={
            styles.statsCard
          }
        >

          {/* WRITINGS */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <BookOpen
                size={16}
                color="#9A6C20"
              />

            </View>


            <Text
              style={
                styles.statNumber
              }
            >

              {
                stats.writings_count
              }

            </Text>


            <Text
              style={
                styles.statLabel
              }
              numberOfLines={1}
            >

              {
                t(
                  "writer.writings"
                )
              }

            </Text>

          </View>


          <View
            style={
              styles.statDivider
            }
          />


          {/* LIKES */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <Heart
                size={16}
                color="#9A6C20"
              />

            </View>


            <Text
              style={
                styles.statNumber
              }
            >

              {
                stats.likes_count
              }

            </Text>


            <Text
              style={
                styles.statLabel
              }
              numberOfLines={1}
            >

              {
                t(
                  "writer.likes"
                )
              }

            </Text>

          </View>


          <View
            style={
              styles.statDivider
            }
          />


          {/* COMMENTS */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <MessageCircle
                size={16}
                color="#9A6C20"
              />

            </View>


            <Text
              style={
                styles.statNumber
              }
            >

              {
                stats.comments_count
              }

            </Text>


            <Text
              style={
                styles.statLabel
              }
              numberOfLines={1}
            >

              {
                t(
                  "writer.comments"
                )
              }

            </Text>

          </View>

        </View>


        {/* ==================================================
            PUBLISHED WRITINGS HEADER
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <View
            style={
              styles.sectionHeaderText
            }
          >

            <Text
              style={
                styles.sectionEyebrow
              }
            >

              {
                t(
                  "writer.published"
                )
              }

            </Text>


            <Text
              style={
                styles.sectionTitle
              }
            >

              {
                language === "bn"
                  ? `${profile.name}-এর ${t(
                      "writer.writings"
                    )}`
                  : language === "hi"
                    ? `${profile.name} की ${t(
                        "writer.writings"
                      )}`
                    : `${t(
                        "writer.writings"
                      )} by ${profile.name}`
              }

            </Text>

          </View>


          <View
            style={
              styles.writingCountBadge
            }
          >

            <FileText
              size={13}
              color="#7F581B"
            />


            <Text
              style={
                styles.writingCountText
              }
            >

              {
                writings.length
              }

            </Text>

          </View>

        </View>


        {/* ==================================================
            EMPTY
        ================================================== */}

        {writings.length === 0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >

              <BookOpen
                size={27}
                color="#9A6C20"
              />

            </View>


            <Text
              style={
                styles.emptyTitle
              }
            >

              {
                t(
                  "writer.noPublishedWritings"
                )
              }

            </Text>


            <Text
              style={
                styles.emptyText
              }
            >

              {
                t(
                  "writer.noPublishedDescription"
                )
              }

            </Text>

          </View>

        ) : (

          writings.map(
            (
              writing
            ) => {

              const content =
                (
                  writing?.content ||
                  ""
                ).trim();


              const preview =
                content.length > 170
                  ? `${content.slice(
                      0,
                      170
                    )}...`
                  : content;


              return (

                <TouchableOpacity
                  key={
                    String(
                      writing.id
                    )
                  }
                  style={
                    styles.writingCard
                  }
                  activeOpacity={0.84}
                  onPress={
                    () =>
                      openWriting(
                        Number(
                          writing.id
                        )
                      )
                  }
                >

                  {/* META */}

                  <View
                    style={
                      styles.writingMeta
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
                          t(
                            "writer.otherCategory"
                          )
                        }

                      </Text>

                    </View>


                    {!!writing.language && (

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

                    )}

                  </View>


                  {/* TITLE */}

                  <Text
                    style={
                      styles.writingTitle
                    }
                    numberOfLines={2}
                  >

                    {
                      writing.title ||
                      "Untitled"
                    }

                  </Text>


                  {/* PREVIEW */}

                  {!!preview && (

                    <Text
                      style={
                        styles.writingPreview
                      }
                      numberOfLines={4}
                    >

                      {
                        preview
                      }

                    </Text>

                  )}


                  {/* FOOTER */}

                  <View
                    style={
                      styles.writingFooter
                    }
                  >

                    <View
                      style={
                        styles.engagementRow
                      }
                    >

                      <View
                        style={
                          styles.engagementItem
                        }
                      >

                        <Heart
                          size={14}
                          color="#8C7763"
                        />


                        <Text
                          style={
                            styles.engagementText
                          }
                        >

                          {
                            safeNumber(
                              writing
                                ?.likes_count
                            )
                          }

                        </Text>

                      </View>


                      <View
                        style={
                          styles.engagementItem
                        }
                      >

                        <MessageCircle
                          size={14}
                          color="#8C7763"
                        />


                        <Text
                          style={
                            styles.engagementText
                          }
                        >

                          {
                            safeNumber(
                              writing
                                ?.comments_count
                            )
                          }

                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.readRow
                      }
                    >

                      <Text
                        style={
                          styles.readText
                        }
                      >

                        {
                          t(
                            "writer.read"
                          )
                        }

                      </Text>


                      <ChevronRight
                        size={15}
                        color="#8A5D1B"
                      />

                    </View>

                  </View>

                </TouchableOpacity>

              );

            }
          )

        )}

      </ScrollView>

    </SafeAreaView>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    // ======================================================
    // ROOT
    // ======================================================

    safeArea: {

      flex: 1,

      backgroundColor:
        "#FBFAF7",

    },


    // ======================================================
    // HEADER
    // ======================================================

    header: {

      height: 58,

      paddingHorizontal: 20,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

      borderBottomColor:
        "#EEE7DE",

      backgroundColor:
        "#FBFAF7",

    },


    backButton: {

      width: 40,

      height: 40,

      borderRadius: 20,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#F0EAE2",

    },


    headerTitleRow: {

      flexDirection: "row",

      alignItems: "center",

      gap: 6,

    },


    headerTitle: {

      fontSize: 13,

      fontWeight: "700",

      color: "#40372F",

    },


    headerSpacer: {

      width: 40,

    },


    // ======================================================
    // SCROLL
    // ======================================================

    scroll: {

      flex: 1,

    },


    scrollContent: {

      paddingHorizontal: 20,

      paddingTop: 25,

      paddingBottom: 80,

    },


    // ======================================================
    // PROFILE
    // ======================================================

    profileHero: {

      alignItems: "center",

    },


    avatarOuter: {

      width: 96,

      height: 96,

      borderRadius: 48,

      padding: 5,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#EFE2CF",

    },


    avatar: {

      width: 86,

      height: 86,

      borderRadius: 43,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#542777",

    },


    avatarText: {

      fontSize: 28,

      fontWeight: "800",

      color: "#FFFFFF",

    },


    profileName: {

      marginTop: 16,

      paddingHorizontal: 12,

      textAlign: "center",

      fontSize: 26,

      lineHeight: 34,

      fontWeight: "800",

      color: "#29221D",

    },


    joinedRow: {

      marginTop: 8,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 6,

    },


    joinedText: {

      fontSize: 11,

      color: "#8C7C6D",

    },


    // ======================================================
    // FOLLOW BUTTON
    // ======================================================

    followButton: {

      minWidth: 145,

      minHeight: 43,

      marginTop: 19,

      paddingHorizontal: 20,

      paddingVertical: 10,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,

      backgroundColor:
        "#292522",

    },


    followingButton: {

      borderWidth: 1,

      borderColor:
        "#D9C9B7",

      backgroundColor:
        "#F5EFE7",

    },


    followButtonDisabled: {

      opacity: 0.6,

    },


    followButtonText: {

      fontSize: 12,

      fontWeight: "800",

      color: "#FFFFFF",

    },


    followingButtonText: {

      color: "#725D47",

    },


    ownProfileBadge: {

      minHeight: 38,

      marginTop: 18,

      paddingHorizontal: 15,

      paddingVertical: 9,

      borderRadius: 19,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 6,

      backgroundColor:
        "#F2E7D6",

    },


    ownProfileText: {

      fontSize: 11,

      fontWeight: "700",

      color: "#765C35",

    },


    // ======================================================
    // FOLLOW STATS
    // ======================================================

    followStatsCard: {

      marginTop: 27,

      paddingVertical: 17,

      borderWidth: 1,

      borderColor:
        "#E3D8CB",

      borderRadius: 14,

      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        "#FFFFFF",

    },


    followStat: {

      flex: 1,

      alignItems: "center",

      justifyContent: "center",

    },


    followStatNumber: {

      fontSize: 19,

      fontWeight: "800",

      color: "#352E28",

    },


    followStatLabel: {

      marginTop: 4,

      textAlign: "center",

      fontSize: 10,

      fontWeight: "600",

      color: "#8B7E72",

    },


    verticalDivider: {

      width: 1,

      height: 34,

      backgroundColor:
        "#E7DED5",

    },


    // ======================================================
    // STATS
    // ======================================================

    statsCard: {

      marginTop: 12,

      paddingVertical: 17,

      borderWidth: 1,

      borderColor:
        "#E4DAD0",

      borderRadius: 14,

      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        "#FFFFFF",

    },


    statItem: {

      flex: 1,

      minWidth: 0,

      alignItems: "center",

      justifyContent: "center",

    },


    statIcon: {

      width: 31,

      height: 31,

      marginBottom: 6,

      borderRadius: 16,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#F4EDE4",

    },


    statNumber: {

      fontSize: 16,

      fontWeight: "800",

      color: "#3E352E",

    },


    statLabel: {

      width: "100%",

      marginTop: 3,

      paddingHorizontal: 3,

      textAlign: "center",

      fontSize: 9,

      fontWeight: "600",

      color: "#8D8176",

    },


    statDivider: {

      width: 1,

      height: 44,

      backgroundColor:
        "#E8E0D8",

    },


    // ======================================================
    // SECTION
    // ======================================================

    sectionHeader: {

      marginTop: 34,

      marginBottom: 16,

      flexDirection: "row",

      alignItems: "flex-end",

      justifyContent:
        "space-between",

      gap: 10,

    },


    sectionHeaderText: {

      flex: 1,

      minWidth: 0,

    },


    sectionEyebrow: {

      fontSize: 9,

      fontWeight: "800",

      letterSpacing: 1.3,

      color: "#9A6C20",

    },


    sectionTitle: {

      marginTop: 5,

      fontSize: 23,

      lineHeight: 30,

      fontWeight: "800",

      color: "#2D261F",

    },


    writingCountBadge: {

      minWidth: 48,

      height: 31,

      paddingHorizontal: 10,

      borderRadius: 16,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 5,

      backgroundColor:
        "#F1E5D2",

    },


    writingCountText: {

      fontSize: 11,

      fontWeight: "800",

      color: "#7F581B",

    },


    // ======================================================
    // WRITING CARD
    // ======================================================

    writingCard: {

      marginBottom: 13,

      padding: 16,

      borderWidth: 1,

      borderColor:
        "#E6DDD3",

      borderRadius: 14,

      backgroundColor:
        "#FFFFFF",

    },


    writingMeta: {

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 10,

    },


    categoryBadge: {

      flexShrink: 1,

      paddingHorizontal: 10,

      paddingVertical: 5,

      borderRadius: 18,

      backgroundColor:
        "#F2E5D1",

    },


    categoryText: {

      fontSize: 9,

      fontWeight: "800",

      color: "#815A1C",

    },


    languageText: {

      flexShrink: 0,

      fontSize: 10,

      fontWeight: "600",

      color: "#8B7D70",

    },


    writingTitle: {

      marginTop: 13,

      fontSize: 18,

      lineHeight: 25,

      fontWeight: "800",

      color: "#302821",

    },


    writingPreview: {

      marginTop: 8,

      fontSize: 12,

      lineHeight: 21,

      color: "#71655B",

    },


    writingFooter: {

      marginTop: 15,

      paddingTop: 12,

      borderTopWidth: 1,

      borderTopColor:
        "#EFE8E0",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

    },


    engagementRow: {

      flexDirection: "row",

      alignItems: "center",

      gap: 14,

    },


    engagementItem: {

      flexDirection: "row",

      alignItems: "center",

      gap: 5,

    },


    engagementText: {

      fontSize: 10,

      fontWeight: "700",

      color: "#7B7067",

    },


    readRow: {

      flexDirection: "row",

      alignItems: "center",

      gap: 2,

    },


    readText: {

      fontSize: 10,

      fontWeight: "800",

      color: "#8A5D1B",

    },


    // ======================================================
    // EMPTY
    // ======================================================

    emptyCard: {

      paddingVertical: 46,

      paddingHorizontal: 25,

      borderWidth: 1,

      borderColor:
        "#E7DED4",

      borderRadius: 14,

      alignItems: "center",

      backgroundColor:
        "#FFFFFF",

    },


    emptyIcon: {

      width: 62,

      height: 62,

      borderRadius: 31,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#F3EADF",

    },


    emptyTitle: {

      marginTop: 14,

      textAlign: "center",

      fontSize: 17,

      lineHeight: 23,

      fontWeight: "800",

      color: "#40372F",

    },


    emptyText: {

      maxWidth: 270,

      marginTop: 6,

      textAlign: "center",

      fontSize: 11,

      lineHeight: 18,

      color: "#897E73",

    },


    // ======================================================
    // LOADING
    // ======================================================

    loadingContainer: {

      flex: 1,

      alignItems: "center",

      justifyContent: "center",

    },


    loadingText: {

      marginTop: 12,

      paddingHorizontal: 25,

      textAlign: "center",

      fontSize: 13,

      color: "#786F65",

    },


    // ======================================================
    // ERROR
    // ======================================================

    errorContainer: {

      flex: 1,

      paddingHorizontal: 30,

      alignItems: "center",

      justifyContent: "center",

    },


    errorTitle: {

      marginTop: 15,

      textAlign: "center",

      fontSize: 21,

      fontWeight: "800",

      color: "#332C26",

    },


    errorText: {

      marginTop: 8,

      textAlign: "center",

      fontSize: 13,

      lineHeight: 20,

      color: "#7F746A",

    },


    retryButton: {

      marginTop: 19,

      paddingHorizontal: 22,

      paddingVertical: 11,

      borderRadius: 9,

      backgroundColor:
        "#292522",

    },


    retryText: {

      fontSize: 13,

      fontWeight: "700",

      color: "#FFFFFF",

    },

  });