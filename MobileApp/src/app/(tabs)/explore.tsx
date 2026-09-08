import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
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
  BookOpen,
  Check,
  ChevronDown,
  Filter,
  Globe2,
  Heart,
  MessageCircle,
  Search,
  SlidersHorizontal,
  User,
  Users,
  X,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  getFollowingFeed,
  getWritings,
  Writing,
} from "../../api/api";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer
  from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type FeedMode =
  | "for-you"
  | "following";

type SortMode =
  | "recent"
  | "oldest"
  | "popular";

type FilterSheet =
  | "language"
  | "category"
  | "sort"
  | null;

type ExploreWriting =
  Writing & {
    user_id?: number;

    author?: {
      id?: number;
      name?: string;
    };

    user?: {
      id?: number;
      name?: string;
    };

    author_name?: string;

    likes_count?: number;
    comments_count?: number;

    category?: string;
    language?: string;

    created_at?: string;
    published_at?: string;
  };

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  forYou: string;
  following: string;
  followingHint: string;
  signInFollowing: string;
  searchPlaceholder: string;
  results: string;
  result: string;
  allLanguages: string;
  allCategories: string;
  sortRecent: string;
  sortOldest: string;
  sortPopular: string;
  languageFilter: string;
  categoryFilter: string;
  sortFilter: string;
  filters: string;
  clearFilters: string;
  noResults: string;
  noResultsDescription: string;
  noFollowing: string;
  noFollowingDescription: string;
  unknownWriter: string;
  otherCategory: string;
  read: string;
  retry: string;
  loading: string;
};


// ==========================================================
// CONSTANTS
// ==========================================================

const CATEGORY_VALUES = [
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "উপন্যাস",
  "অন্যান্য",
];

const LANGUAGE_VALUES = [
  "bn",
  "en",
  "hi",
  "as",
  "or",
  "ta",
  "te",
  "ml",
  "kn",
  "mr",
  "gu",
  "pa",
  "ur",
];


// ==========================================================
// HELPERS
// ==========================================================

function safeNumber(
  value: unknown
) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;

}


function normalizeWritings(
  data: any
): ExploreWriting[] {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.writings
    )
  ) {
    return data.writings;
  }

  if (
    Array.isArray(
      data?.items
    )
  ) {
    return data.items;
  }

  return [];

}


function getLanguageLabel(
  value?: string
) {

  if (!value) {
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
    labels[value] ||
    value.toUpperCase()
  );

}


function getTimestamp(
  writing:
    ExploreWriting
) {

  const value =
    writing.published_at ||
    writing.created_at ||
    "";

  const timestamp =
    Date.parse(value);

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

}


// ==========================================================
// SCREEN
// ==========================================================

export default function ExploreScreen() {

  const {
    user,
    loading:
      authLoading,
  } = useAuth();


  const {
    language,
    t,
  } = useLanguage();


  // ========================================================
  // LOCALIZED COPY
  //
  // These are deliberately local because the current global
  // LanguageContext does not contain every desktop Explore
  // label yet. User-authored writing text is never translated.
  // ========================================================

  const copy =
    useMemo<Copy>(
      () => {

        if (
          language === "bn"
        ) {

          return {
            eyebrow:
              "আবিষ্কার করুন",
            title:
              "লেখার জগৎ ঘুরে দেখুন",
            description:
              "কবিতা, গল্প, অনুভূতি ও প্রবন্ধের মধ্যে খুঁজে নিন আপনার পরবর্তী প্রিয় লেখা।",
            forYou:
              "সবার লেখা",
            following:
              "অনুসরণ",
            followingHint:
              "আপনি যেসব লেখককে অনুসরণ করেন তাদের সাম্প্রতিক লেখা।",
            signInFollowing:
              "অনুসরণ করা লেখকদের লেখা দেখতে অ্যাকাউন্টে সাইন ইন করুন।",
            searchPlaceholder:
              "কবিতা, গল্প, বিষয় বা লেখক খুঁজুন...",
            results:
              "টি লেখা পাওয়া গেছে",
            result:
              "টি লেখা পাওয়া গেছে",
            allLanguages:
              "সব ভাষা",
            allCategories:
              "সব বিভাগ",
            sortRecent:
              "সাম্প্রতিক",
            sortOldest:
              "পুরনো আগে",
            sortPopular:
              "জনপ্রিয়",
            languageFilter:
              "ভাষা",
            categoryFilter:
              "বিভাগ",
            sortFilter:
              "সাজান",
            filters:
              "ফিল্টার",
            clearFilters:
              "সব মুছুন",
            noResults:
              "কোনও লেখা পাওয়া যায়নি",
            noResultsDescription:
              "অন্য শব্দ বা ফিল্টার ব্যবহার করে আবার চেষ্টা করুন।",
            noFollowing:
              "অনুসরণ ফিড এখন খালি",
            noFollowingDescription:
              "লেখকদের অনুসরণ করলে তাদের প্রকাশিত লেখা এখানে দেখা যাবে।",
            unknownWriter:
              "SHOBDO লেখক",
            otherCategory:
              "অন্যান্য",
            read:
              "পড়ুন",
            retry:
              "আবার চেষ্টা করুন",
            loading:
              "লেখা লোড হচ্ছে...",
          };

        }


        if (
          language === "hi"
        ) {

          return {
            eyebrow:
              "खोजें",
            title:
              "रचनाओं की दुनिया देखें",
            description:
              "कविता, कहानी, भावनाएँ और लेख खोजें और अपनी अगली पसंदीदा रचना पढ़ें।",
            forYou:
              "सभी रचनाएँ",
            following:
              "फ़ॉलोइंग",
            followingHint:
              "आप जिन लेखकों को फ़ॉलो करते हैं उनकी नवीनतम रचनाएँ।",
            signInFollowing:
              "फ़ॉलो किए गए लेखकों की रचनाएँ देखने के लिए अकाउंट में साइन इन करें।",
            searchPlaceholder:
              "कविता, कहानी, विषय या लेखक खोजें...",
            results:
              "रचनाएँ मिलीं",
            result:
              "रचना मिली",
            allLanguages:
              "सभी भाषाएँ",
            allCategories:
              "सभी श्रेणियाँ",
            sortRecent:
              "नवीनतम",
            sortOldest:
              "पुरानी पहले",
            sortPopular:
              "लोकप्रिय",
            languageFilter:
              "भाषा",
            categoryFilter:
              "श्रेणी",
            sortFilter:
              "क्रम",
            filters:
              "फ़िल्टर",
            clearFilters:
              "साफ़ करें",
            noResults:
              "कोई रचना नहीं मिली",
            noResultsDescription:
              "दूसरे शब्द या फ़िल्टर के साथ फिर कोशिश करें।",
            noFollowing:
              "फ़ॉलोइंग फ़ीड खाली है",
            noFollowingDescription:
              "लेखकों को फ़ॉलो करें और उनकी प्रकाशित रचनाएँ यहाँ देखें।",
            unknownWriter:
              "SHOBDO लेखक",
            otherCategory:
              "अन्य",
            read:
              "पढ़ें",
            retry:
              "फिर कोशिश करें",
            loading:
              "रचनाएँ लोड हो रही हैं...",
          };

        }


        return {
          eyebrow:
            "DISCOVER",
          title:
            "Explore the world of writing",
          description:
            "Discover poems, stories, feelings and articles from writers across the SHOBDO community.",
          forYou:
            "All Writings",
          following:
            "Following",
          followingHint:
            "Recent writings from authors you follow.",
          signInFollowing:
            "Sign in to your account to see writings from authors you follow.",
          searchPlaceholder:
            "Search poems, stories, topics or writers...",
          results:
            "writings found",
          result:
            "writing found",
          allLanguages:
            "All Languages",
          allCategories:
            "All Categories",
          sortRecent:
            "Recent",
          sortOldest:
            "Oldest First",
          sortPopular:
            "Popular",
          languageFilter:
            "Language",
          categoryFilter:
            "Category",
          sortFilter:
            "Sort",
          filters:
            "Filters",
          clearFilters:
            "Clear All",
          noResults:
            "No writings found",
          noResultsDescription:
            "Try another search term or change your filters.",
          noFollowing:
            "Your following feed is empty",
          noFollowingDescription:
            "Follow writers and their published writings will appear here.",
          unknownWriter:
            "SHOBDO Writer",
          otherCategory:
            "Other",
          read:
            "Read",
          retry:
            "Try Again",
          loading:
            "Loading writings...",
        };

      },
      [
        language,
      ]
    );


  // ========================================================
  // STATE
  // ========================================================

  const [
    feedMode,
    setFeedMode,
  ] =
    useState<FeedMode>(
      "for-you"
    );


  const [
    sourceWritings,
    setSourceWritings,
  ] =
    useState<
      ExploreWriting[]
    >(
      []
    );


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    submittedSearch,
    setSubmittedSearch,
  ] =
    useState("");


  const [
    selectedLanguage,
    setSelectedLanguage,
  ] =
    useState("");


  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState("");


  const [
    sortMode,
    setSortMode,
  ] =
    useState<SortMode>(
      "recent"
    );


  const [
    filterSheet,
    setFilterSheet,
  ] =
    useState<FilterSheet>(
      null
    );


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
    error,
    setError,
  ] =
    useState("");


  // ========================================================
  // WRITER HELPERS
  // ========================================================

  const getAuthorName =
    useCallback(
      (
        writing:
          ExploreWriting
      ) => {

        return (
          writing.author?.name ||
          writing.user?.name ||
          writing.author_name ||
          copy.unknownWriter
        );

      },
      [
        copy.unknownWriter,
      ]
    );


  const getAuthorId =
    useCallback(
      (
        writing:
          ExploreWriting
      ) => {

        const value =
          writing.author?.id ??
          writing.user?.id ??
          writing.user_id;

        const id =
          Number(value);

        return (
          Number.isFinite(id) &&
          id > 0
        )
          ? id
          : null;

      },
      []
    );


  // ========================================================
  // CATEGORY LABEL
  // ========================================================

  const getCategoryLabel =
    useCallback(
      (
        category?: string
      ) => {

        const keys:
          Record<
            string,
            string
          > = {

            "কবিতা":
              "write.category.poem",

            "গল্প":
              "write.category.story",

            "অনুভূতি":
              "write.category.feeling",

            "প্রবন্ধ":
              "write.category.article",

            "উপন্যাস":
              "write.category.novel",

            "অন্যান্য":
              "write.category.other",

          };


        if (
          category &&
          keys[category]
        ) {

          const translated =
            t(
              keys[category]
            );

          if (
            translated !==
            keys[category]
          ) {
            return translated;
          }

        }


        return (
          category ||
          copy.otherCategory
        );

      },
      [
        copy.otherCategory,
        t,
      ]
    );


  // ========================================================
  // LOAD DATA
  // ========================================================

  const loadForYou =
    useCallback(
      async (
        query =
          submittedSearch
      ) => {

        const data =
          await getWritings(
            1,
            50,
            query.trim()
          );


        setSourceWritings(
          normalizeWritings(
            data
          )
        );

      },
      [
        submittedSearch,
      ]
    );


  const loadFollowing =
    useCallback(
      async () => {

        if (!user) {

          setSourceWritings(
            []
          );

          return;

        }


        const data =
          await getFollowingFeed(
            1,
            50
          );


        setSourceWritings(
          normalizeWritings(
            data
          )
        );

      },
      [
        user,
      ]
    );


  const loadFeed =
    useCallback(
      async (
        mode:
          FeedMode =
            feedMode
      ) => {

        try {

          setError("");


          if (
            mode ===
            "following"
          ) {

            await loadFollowing();

          } else {

            await loadForYou();

          }

        } catch (
          err: any
        ) {

          console.error(
            "EXPLORE LOAD ERROR:",
            err
          );


          setSourceWritings(
            []
          );


          setError(
            err?.message ||
            t(
              "explore.loadError"
            )
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      [
        feedMode,
        loadFollowing,
        loadForYou,
        t,
      ]
    );


  useEffect(
    () => {

      if (
        authLoading
      ) {
        return;
      }


      setLoading(true);


      loadFeed(
        feedMode
      );

    },
    [
      authLoading,
      feedMode,
      loadFeed,
    ]
  );


  // ========================================================
  // SEARCH
  // ========================================================

  const handleSearch =
    async () => {

      if (
        feedMode !==
        "for-you"
      ) {
        return;
      }


      const query =
        search.trim();


      setSubmittedSearch(
        query
      );

      setLoading(true);
      setError("");


      try {

        const data =
          await getWritings(
            1,
            50,
            query
          );


        setSourceWritings(
          normalizeWritings(
            data
          )
        );

      } catch (
        err: any
      ) {

        console.error(
          "EXPLORE SEARCH ERROR:",
          err
        );


        setSourceWritings(
          []
        );


        setError(
          err?.message ||
          t(
            "explore.loadError"
          )
        );

      } finally {

        setLoading(false);

      }

    };


  const clearSearch =
    async () => {

      setSearch("");
      setSubmittedSearch("");

      if (
        feedMode !==
        "for-you"
      ) {
        return;
      }


      setLoading(true);
      setError("");


      try {

        const data =
          await getWritings(
            1,
            50,
            ""
          );


        setSourceWritings(
          normalizeWritings(
            data
          )
        );

      } catch (
        err: any
      ) {

        setSourceWritings(
          []
        );

        setError(
          err?.message ||
          t(
            "explore.loadError"
          )
        );

      } finally {

        setLoading(false);

      }

    };


  // ========================================================
  // FEED SWITCH
  // ========================================================

  const changeFeed =
    (
      mode:
        FeedMode
    ) => {

      if (
        mode ===
        feedMode
      ) {
        return;
      }


      setError("");

      setSelectedLanguage("");
      setSelectedCategory("");
      setSortMode(
        "recent"
      );


      if (
        mode ===
        "following"
      ) {

        setSearch("");
        setSubmittedSearch("");

      }


      setFeedMode(
        mode
      );

    };


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh =
    async () => {

      setRefreshing(
        true
      );

      await loadFeed(
        feedMode
      );

    };


  // ========================================================
  // FILTERED / SORTED RESULT
  // ========================================================

  const displayedWritings =
    useMemo(
      () => {

        let result =
          [...sourceWritings];


        if (
          selectedLanguage
        ) {

          result =
            result.filter(
              (
                item
              ) =>
                item.language ===
                selectedLanguage
            );

        }


        if (
          selectedCategory
        ) {

          result =
            result.filter(
              (
                item
              ) =>
                item.category ===
                selectedCategory
            );

        }


        if (
          sortMode ===
          "popular"
        ) {

          result.sort(
            (
              a,
              b
            ) =>
              (
                safeNumber(
                  b.likes_count
                ) +
                safeNumber(
                  b.comments_count
                )
              ) -
              (
                safeNumber(
                  a.likes_count
                ) +
                safeNumber(
                  a.comments_count
                )
              )
          );

        } else if (
          sortMode ===
          "oldest"
        ) {

          result.sort(
            (
              a,
              b
            ) =>
              getTimestamp(a) -
              getTimestamp(b)
          );

        } else {

          result.sort(
            (
              a,
              b
            ) =>
              getTimestamp(b) -
              getTimestamp(a)
          );

        }


        return result;

      },
      [
        selectedCategory,
        selectedLanguage,
        sortMode,
        sourceWritings,
      ]
    );


  // ========================================================
  // NAVIGATION
  // ========================================================

  const openWriting =
    (
      writing:
        ExploreWriting
    ) => {

      router.push({
        pathname:
          "/writings/[id]",

        params: {
          id:
            String(
              writing.id
            ),
        },
      });

    };


  const openAuthor =
    (
      writing:
        ExploreWriting
    ) => {

      const authorId =
        getAuthorId(
          writing
        );


      if (!authorId) {
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
  // FILTER DISPLAY LABELS
  // ========================================================

  const selectedLanguageLabel =
    selectedLanguage
      ? getLanguageLabel(
          selectedLanguage
        )
      : copy.allLanguages;


  const selectedCategoryLabel =
    selectedCategory
      ? getCategoryLabel(
          selectedCategory
        )
      : copy.allCategories;


  const selectedSortLabel =
    sortMode === "popular"
      ? copy.sortPopular
      : sortMode === "oldest"
      ? copy.sortOldest
      : copy.sortRecent;


  const clearFilters =
    () => {

      setSelectedLanguage("");
      setSelectedCategory("");
      setSortMode(
        "recent"
      );

    };


  const hasFilters =
    Boolean(
      selectedLanguage ||
      selectedCategory ||
      sortMode !== "recent"
    );


  // ========================================================
  // RENDER CARD
  // ========================================================

  const renderWriting =
    ({
      item,
    }: {
      item:
        ExploreWriting;
    }) => {

      const author =
        getAuthorName(
          item
        );

      const authorId =
        getAuthorId(
          item
        );

      const languageLabel =
        getLanguageLabel(
          item.language
        );

      const likes =
        safeNumber(
          item.likes_count
        );

      const comments =
        safeNumber(
          item.comments_count
        );


      return (

        <TouchableOpacity

          activeOpacity={0.88}

          style={
            styles.card
          }

          onPress={() =>
            openWriting(
              item
            )
          }

        >

          {/* BADGES */}

          <View
            style={
              styles.cardTop
            }
          >

            {!!languageLabel && (

              <View
                style={
                  styles.languageBadge
                }
              >

                <Globe2
                  size={12}
                  color="#8A611F"
                />

                <Text
                  style={
                    styles.languageBadgeText
                  }
                >
                  {languageLabel}
                </Text>

              </View>

            )}


            <View
              style={
                styles.categoryBadge
              }
            >

              <Text
                style={
                  styles.categoryBadgeText
                }
              >
                {
                  getCategoryLabel(
                    item.category
                  )
                }
              </Text>

            </View>

          </View>


          {/* TITLE */}

          <Text
            style={
              styles.cardTitle
            }
            numberOfLines={2}
          >
            {item.title}
          </Text>


          {/* CONTENT */}

          <Text
            style={
              styles.cardPreview
            }
            numberOfLines={4}
          >
            {item.content}
          </Text>


          {/* AUTHOR */}

          <View
            style={
              styles.authorDivider
            }
          />


          <TouchableOpacity

            activeOpacity={0.72}

            disabled={
              !authorId
            }

            style={
              styles.authorRow
            }

            onPress={() =>
              openAuthor(
                item
              )
            }

          >

            <View
              style={
                styles.avatar
              }
            >

              <User
                size={15}
                color="#FFFFFF"
              />

            </View>


            <View
              style={
                styles.authorCopy
              }
            >

              <Text
                style={
                  styles.authorLabel
                }
              >
                {t("home.writer")}
              </Text>

              <Text
                style={
                  styles.authorName
                }
                numberOfLines={1}
              >
                {author}
              </Text>

            </View>

          </TouchableOpacity>


          {/* ENGAGEMENT */}

          <View
            style={
              styles.cardBottom
            }
          >

            <View
              style={
                styles.engagement
              }
            >

              <View
                style={
                  styles.engagementItem
                }
              >

                <Heart
                  size={16}
                  color="#827667"
                />

                <Text
                  style={
                    styles.engagementText
                  }
                >
                  {likes}
                </Text>

              </View>


              <View
                style={
                  styles.engagementItem
                }
              >

                <MessageCircle
                  size={16}
                  color="#827667"
                />

                <Text
                  style={
                    styles.engagementText
                  }
                >
                  {comments}
                </Text>

              </View>

            </View>


            <Text
              style={
                styles.readText
              }
            >
              {copy.read} →
            </Text>

          </View>

        </TouchableOpacity>

      );

    };


  // ========================================================
  // HEADER
  // ========================================================

  const renderHeader =
    () => (

      <View
        style={
          styles.headerContainer
        }
      >

        {/* ==================================================
            PAGE INTRO — inspired by desktop Explore
        ================================================== */}

        <View
          style={
            styles.pageHeader
          }
        >

          <View
            style={
              styles.eyebrowRow
            }
          >

            <BookOpen
              size={14}
              color="#9A6C20"
            />

            <Text
              style={
                styles.eyebrow
              }
            >
              {copy.eyebrow}
            </Text>

          </View>


          <Text
            style={
              styles.heading
            }
          >
            {copy.title}
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            {copy.description}
          </Text>

        </View>


        {/* ==================================================
            FEED MODE
        ================================================== */}

        <View
          style={
            styles.feedSwitch
          }
        >

          <TouchableOpacity

            activeOpacity={0.84}

            style={[
              styles.feedButton,

              feedMode ===
                "for-you" &&
                styles.feedButtonActive,
            ]}

            onPress={() =>
              changeFeed(
                "for-you"
              )
            }

          >

            <BookOpen
              size={15}
              color={
                feedMode ===
                  "for-you"
                  ? "#FFFFFF"
                  : "#786C5F"
              }
            />

            <Text
              style={[
                styles.feedButtonText,

                feedMode ===
                  "for-you" &&
                  styles.feedButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {copy.forYou}
            </Text>

          </TouchableOpacity>


          <TouchableOpacity

            activeOpacity={0.84}

            style={[
              styles.feedButton,

              feedMode ===
                "following" &&
                styles.feedButtonActive,
            ]}

            onPress={() =>
              changeFeed(
                "following"
              )
            }

          >

            <Users
              size={15}
              color={
                feedMode ===
                  "following"
                  ? "#FFFFFF"
                  : "#786C5F"
              }
            />

            <Text
              style={[
                styles.feedButtonText,

                feedMode ===
                  "following" &&
                  styles.feedButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {copy.following}
            </Text>

          </TouchableOpacity>

        </View>


        {/* ==================================================
            SEARCH — desktop-inspired full-width bar
        ================================================== */}

        {feedMode ===
          "for-you" && (

          <View
            style={
              styles.searchSection
            }
          >

            <View
              style={
                styles.searchBox
              }
            >

              <Search
                size={19}
                color="#84786A"
              />


              <TextInput

                value={
                  search
                }

                onChangeText={
                  setSearch
                }

                onSubmitEditing={
                  handleSearch
                }

                returnKeyType="search"

                placeholder={
                  copy.searchPlaceholder
                }

                placeholderTextColor="#A59B8F"

                style={
                  styles.searchInput
                }

              />


              {!!search && (

                <TouchableOpacity

                  activeOpacity={0.68}

                  onPress={
                    clearSearch
                  }

                >

                  <X
                    size={18}
                    color="#7A6D5F"
                  />

                </TouchableOpacity>

              )}

            </View>


            <TouchableOpacity

              activeOpacity={0.85}

              style={
                styles.searchButton
              }

              onPress={
                handleSearch
              }

            >

              <Search
                size={19}
                color="#FFFFFF"
              />

            </TouchableOpacity>

          </View>

        )}


        {/* ==================================================
            FILTERS — mobile version of desktop 3-column row
        ================================================== */}

        <View
          style={
            styles.filterTitleRow
          }
        >

          <View
            style={
              styles.filterTitleLeft
            }
          >

            <SlidersHorizontal
              size={14}
              color="#8D6729"
            />

            <Text
              style={
                styles.filterTitle
              }
            >
              {copy.filters}
            </Text>

          </View>


          {hasFilters && (

            <TouchableOpacity
              onPress={
                clearFilters
              }
            >

              <Text
                style={
                  styles.clearFiltersText
                }
              >
                {
                  copy.clearFilters
                }
              </Text>

            </TouchableOpacity>

          )}

        </View>


        <View
          style={
            styles.filters
          }
        >

          <FilterButton
            icon={
              <Globe2
                size={14}
                color="#806331"
              />
            }
            label={
              selectedLanguageLabel
            }
            onPress={() =>
              setFilterSheet(
                "language"
              )
            }
          />


          <FilterButton
            icon={
              <Filter
                size={14}
                color="#806331"
              />
            }
            label={
              selectedCategoryLabel
            }
            onPress={() =>
              setFilterSheet(
                "category"
              )
            }
          />


          <FilterButton
            icon={
              <SlidersHorizontal
                size={14}
                color="#806331"
              />
            }
            label={
              selectedSortLabel
            }
            onPress={() =>
              setFilterSheet(
                "sort"
              )
            }
          />

        </View>


        {/* ==================================================
            RESULT COUNT / FOLLOWING INFO
        ================================================== */}

        {feedMode ===
          "following" ? (

          <View
            style={
              styles.followingNotice
            }
          >

            <Users
              size={15}
              color="#8A611F"
            />

            <Text
              style={
                styles.followingNoticeText
              }
            >
              {
                user
                  ? copy.followingHint
                  : copy.signInFollowing
              }
            </Text>

          </View>

        ) : (

          <View
            style={
              styles.resultRow
            }
          >

            <Text
              style={
                styles.resultText
              }
            >
              {
                displayedWritings.length
              }{" "}
              {
                displayedWritings.length === 1
                  ? copy.result
                  : copy.results
              }
            </Text>


            {!!submittedSearch && (

              <Text
                style={
                  styles.queryText
                }
                numberOfLines={1}
              >
                “{submittedSearch}”
              </Text>

            )}

          </View>

        )}

      </View>

    );


  // ========================================================
  // EMPTY
  // ========================================================

  const renderEmpty =
    () => {

      if (
        loading
      ) {

        return (

          <View
            style={
              styles.stateCard
            }
          >

            <ActivityIndicator
              size="small"
              color="#9A6C20"
            />

            <Text
              style={
                styles.stateTitle
              }
            >
              {copy.loading}
            </Text>

          </View>

        );

      }


      if (
        error
      ) {

        return (

          <View
            style={
              styles.stateCard
            }
          >

            <BookOpen
              size={25}
              color="#9A6C20"
            />

            <Text
              style={
                styles.stateTitle
              }
            >
              {
                t(
                  "explore.loadError"
                )
              }
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              {error}
            </Text>


            <TouchableOpacity

              activeOpacity={0.82}

              style={
                styles.retryButton
              }

              onPress={() => {

                setLoading(
                  true
                );

                loadFeed(
                  feedMode
                );

              }}

            >

              <Text
                style={
                  styles.retryButtonText
                }
              >
                {copy.retry}
              </Text>

            </TouchableOpacity>

          </View>

        );

      }


      const following =
        feedMode ===
        "following";


      return (

        <View
          style={
            styles.stateCard
          }
        >

          <BookOpen
            size={26}
            color="#9A6C20"
          />


          <Text
            style={
              styles.stateTitle
            }
          >
            {
              following
                ? copy.noFollowing
                : copy.noResults
            }
          </Text>


          <Text
            style={
              styles.stateDescription
            }
          >
            {
              following
                ? copy.noFollowingDescription
                : copy.noResultsDescription
            }
          </Text>

        </View>

      );

    };


  // ========================================================
  // MAIN RENDER
  //
  // Navbar is intentionally NOT rendered here.
  // app/(tabs)/_layout.tsx owns the shared Navbar.
  // Footer is attached to the end of this Explore list.
  // ========================================================

  return (

    <SafeAreaView

      style={
        styles.safeArea
      }

      edges={[
        "left",
        "right",
      ]}

    >

      <FlatList

        data={
          displayedWritings
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item.id ??
            index
          )
        }

        renderItem={
          renderWriting
        }

        ListHeaderComponent={
          renderHeader
        }

        ListEmptyComponent={
          renderEmpty
        }

        ListFooterComponent={
          <View
            style={
              styles.footerWrap
            }
          >
            <Footer />
          </View>
        }

        contentContainerStyle={
          displayedWritings.length
            ? styles.listContent
            : styles.emptyContent
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

            tintColor="#9A6C20"

          />

        }

      />


      {/* ====================================================
          FILTER SHEET
      ==================================================== */}

      <FilterModal

        visible={
          filterSheet !==
          null
        }

        title={
          filterSheet ===
            "language"
            ? copy.languageFilter
            : filterSheet ===
              "category"
            ? copy.categoryFilter
            : copy.sortFilter
        }

        onClose={() =>
          setFilterSheet(
            null
          )
        }

      >

        {filterSheet ===
          "language" && (

          <>

            <OptionRow

              label={
                copy.allLanguages
              }

              selected={
                !selectedLanguage
              }

              onPress={() => {

                setSelectedLanguage(
                  ""
                );

                setFilterSheet(
                  null
                );

              }}

            />


            {LANGUAGE_VALUES.map(
              (
                code
              ) => (

                <OptionRow

                  key={
                    code
                  }

                  label={
                    getLanguageLabel(
                      code
                    )
                  }

                  selected={
                    selectedLanguage ===
                    code
                  }

                  onPress={() => {

                    setSelectedLanguage(
                      code
                    );

                    setFilterSheet(
                      null
                    );

                  }}

                />

              )
            )}

          </>

        )}


        {filterSheet ===
          "category" && (

          <>

            <OptionRow

              label={
                copy.allCategories
              }

              selected={
                !selectedCategory
              }

              onPress={() => {

                setSelectedCategory(
                  ""
                );

                setFilterSheet(
                  null
                );

              }}

            />


            {CATEGORY_VALUES.map(
              (
                category
              ) => (

                <OptionRow

                  key={
                    category
                  }

                  label={
                    getCategoryLabel(
                      category
                    )
                  }

                  selected={
                    selectedCategory ===
                    category
                  }

                  onPress={() => {

                    setSelectedCategory(
                      category
                    );

                    setFilterSheet(
                      null
                    );

                  }}

                />

              )
            )}

          </>

        )}


        {filterSheet ===
          "sort" && (

          <>

            <OptionRow
              label={
                copy.sortRecent
              }
              selected={
                sortMode ===
                "recent"
              }
              onPress={() => {

                setSortMode(
                  "recent"
                );

                setFilterSheet(
                  null
                );

              }}
            />

            <OptionRow
              label={
                copy.sortOldest
              }
              selected={
                sortMode ===
                "oldest"
              }
              onPress={() => {

                setSortMode(
                  "oldest"
                );

                setFilterSheet(
                  null
                );

              }}
            />

            <OptionRow
              label={
                copy.sortPopular
              }
              selected={
                sortMode ===
                "popular"
              }
              onPress={() => {

                setSortMode(
                  "popular"
                );

                setFilterSheet(
                  null
                );

              }}
            />

          </>

        )}

      </FilterModal>

    </SafeAreaView>

  );

}


// ==========================================================
// FILTER BUTTON
// ==========================================================

function FilterButton({
  icon,
  label,
  onPress,
}: {
  icon:
    React.ReactNode;
  label: string;
  onPress:
    () => void;
}) {

  return (

    <TouchableOpacity

      activeOpacity={0.78}

      style={
        styles.filterButton
      }

      onPress={
        onPress
      }

    >

      <View
        style={
          styles.filterIcon
        }
      >
        {icon}
      </View>

      <Text
        style={
          styles.filterButtonText
        }
        numberOfLines={1}
      >
        {label}
      </Text>

      <ChevronDown
        size={13}
        color="#897C6E"
      />

    </TouchableOpacity>

  );

}


// ==========================================================
// FILTER MODAL
// ==========================================================

function FilterModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose:
    () => void;
  children:
    React.ReactNode;
}) {

  return (

    <Modal

      visible={
        visible
      }

      transparent

      animationType="fade"

      statusBarTranslucent

      onRequestClose={
        onClose
      }

    >

      <View
        style={
          styles.modalRoot
        }
      >

        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={
            onClose
          }
        />


        <View
          style={
            styles.filterSheet
          }
        >

          <View
            style={
              styles.sheetHandle
            }
          />


          <View
            style={
              styles.sheetHeader
            }
          >

            <Text
              style={
                styles.sheetTitle
              }
            >
              {title}
            </Text>


            <TouchableOpacity
              style={
                styles.sheetClose
              }
              onPress={
                onClose
              }
            >

              <X
                size={18}
                color="#5D5247"
              />

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.optionList
            }
          >
            {children}
          </View>

        </View>

      </View>

    </Modal>

  );

}


// ==========================================================
// OPTION ROW
// ==========================================================

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress:
    () => void;
}) {

  return (

    <TouchableOpacity

      activeOpacity={0.75}

      style={[
        styles.optionRow,

        selected &&
          styles.optionRowSelected,
      ]}

      onPress={
        onPress
      }

    >

      <Text
        style={[
          styles.optionText,

          selected &&
            styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>


      <View
        style={[
          styles.optionCheck,

          selected &&
            styles.optionCheckSelected,
        ]}
      >

        {selected && (

          <Check
            size={14}
            color="#FFFFFF"
          />

        )}

      </View>

    </TouchableOpacity>

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
        "#F8F5EF",
    },


    listContent: {
      paddingHorizontal: 18,

      paddingBottom: 0,
    },


    emptyContent: {
      flexGrow: 1,

      paddingHorizontal: 18,

      paddingBottom: 0,
    },


    footerWrap: {
      marginHorizontal: -18,
    },


    // ======================================================
    // INTRO
    // ======================================================

    headerContainer: {
      paddingTop: 22,
      paddingBottom: 15,
    },


    pageHeader: {
      paddingBottom: 20,

      borderBottomWidth: 1,

      borderBottomColor:
        "#E2D9CE",
    },


    eyebrowRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,
    },


    eyebrow: {
      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1.8,

      color: "#9A6C20",
    },


    heading: {
      marginTop: 10,

      maxWidth: 335,

      fontSize: 31,
      lineHeight: 38,

      fontWeight: "900",

      letterSpacing: -0.5,

      color: "#2F2923",
    },


    subtitle: {
      maxWidth: 335,

      marginTop: 9,

      fontSize: 13,
      lineHeight: 21,

      color: "#74695D",
    },


    // ======================================================
    // FEED SWITCH
    // ======================================================

    feedSwitch: {
      marginTop: 17,
      marginBottom: 15,

      padding: 4,

      borderRadius: 14,

      flexDirection:
        "row",

      backgroundColor:
        "#ECE5DC",
    },


    feedButton: {
      flex: 1,

      minHeight: 42,

      paddingHorizontal: 8,

      borderRadius: 11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 6,
    },


    feedButtonActive: {
      backgroundColor:
        "#302A24",
    },


    feedButtonText: {
      flexShrink: 1,

      fontSize: 11,

      fontWeight: "700",

      color: "#786C5F",
    },


    feedButtonTextActive: {
      color: "#FFFFFF",
    },


    // ======================================================
    // SEARCH
    // ======================================================

    searchSection: {
      flexDirection:
        "row",

      gap: 8,

      marginBottom: 16,
    },


    searchBox: {
      flex: 1,

      minHeight: 50,

      paddingHorizontal: 13,

      borderWidth: 1,

      borderColor:
        "#DCD2C5",

      borderRadius: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#FFFDF9",
    },


    searchInput: {
      flex: 1,

      paddingVertical: 0,

      fontSize: 12,

      color: "#302A24",
    },


    searchButton: {
      width: 50,
      height: 50,

      borderRadius: 12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#302A24",
    },


    // ======================================================
    // FILTERS
    // ======================================================

    filterTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 9,
    },


    filterTitleLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,
    },


    filterTitle: {
      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1.2,

      textTransform:
        "uppercase",

      color: "#8D6729",
    },


    clearFiltersText: {
      fontSize: 9,

      fontWeight: "800",

      color: "#956922",
    },


    filters: {
      gap: 8,

      marginBottom: 15,
    },


    filterButton: {
      minHeight: 47,

      paddingHorizontal: 12,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        "#DDD3C7",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFDF9",
    },


    filterIcon: {
      width: 27,
      height: 27,

      marginRight: 8,

      borderRadius: 9,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F1E7D7",
    },


    filterButtonText: {
      flex: 1,

      fontSize: 11,

      fontWeight: "700",

      color: "#5E544A",
    },


    // ======================================================
    // RESULTS
    // ======================================================

    resultRow: {
      minHeight: 34,

      marginBottom: 10,

      paddingHorizontal: 2,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    resultText: {
      fontSize: 10,

      fontWeight: "600",

      color: "#8A7C6D",
    },


    queryText: {
      maxWidth: 145,

      fontSize: 9,

      fontWeight: "700",

      color: "#9A6C20",
    },


    followingNotice: {
      marginBottom: 12,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#F1E6D4",
    },


    followingNoticeText: {
      flex: 1,

      fontSize: 10,
      lineHeight: 16,

      fontWeight: "600",

      color: "#735A32",
    },


    // ======================================================
    // CARD
    // ======================================================

    card: {
      marginBottom: 15,

      padding: 17,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#DDD5CA",

      backgroundColor:
        "#FFFDF9",

      shadowColor:
        "#000000",

      shadowOpacity: 0.04,

      shadowRadius: 9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },


    cardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 8,

      marginBottom: 13,
    },


    languageBadge: {
      alignSelf:
        "flex-start",

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        "#DEC9A8",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

      backgroundColor:
        "#F5E9D8",
    },


    languageBadgeText: {
      fontSize: 8,

      fontWeight: "800",

      color: "#7E571B",
    },


    categoryBadge: {
      alignSelf:
        "flex-start",

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        "#E1D7CA",

      backgroundColor:
        "#F6F1E9",
    },


    categoryBadgeText: {
      fontSize: 8,

      fontWeight: "700",

      color: "#6F6255",
    },


    cardTitle: {
      fontSize: 22,
      lineHeight: 29,

      fontWeight: "900",

      color: "#26221E",
    },


    cardPreview: {
      marginTop: 9,

      fontSize: 13,
      lineHeight: 22,

      color: "#716559",
    },


    authorDivider: {
      height: 1,

      marginTop: 16,
      marginBottom: 13,

      backgroundColor:
        "#EAE3DA",
    },


    authorRow: {
      alignSelf:
        "flex-start",

      maxWidth: "75%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    avatar: {
      width: 37,
      height: 37,

      borderRadius: 19,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#A87924",
    },


    authorCopy: {
      flexShrink: 1,

      marginLeft: 9,
    },


    authorLabel: {
      fontSize: 7,

      color: "#9B8F82",
    },


    authorName: {
      marginTop: 2,

      fontSize: 11,

      fontWeight: "800",

      color: "#4D4135",
    },


    cardBottom: {
      marginTop: 13,
      paddingTop: 11,

      borderTopWidth: 1,

      borderTopColor:
        "#EAE3DA",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    engagement: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 13,
    },


    engagementItem: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,
    },


    engagementText: {
      fontSize: 9,

      fontWeight: "600",

      color: "#83776B",
    },


    readText: {
      fontSize: 9,

      fontWeight: "800",

      color: "#976A21",
    },


    // ======================================================
    // STATE
    // ======================================================

    stateCard: {
      marginTop: 12,
      marginBottom: 20,

      minHeight: 210,

      padding: 24,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#DDD4C8",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFDF9",
    },


    stateTitle: {
      marginTop: 12,

      textAlign:
        "center",

      fontSize: 15,

      fontWeight: "800",

      color: "#40362E",
    },


    stateDescription: {
      maxWidth: 280,

      marginTop: 7,

      textAlign:
        "center",

      fontSize: 11,
      lineHeight: 18,

      color: "#85786A",
    },


    retryButton: {
      marginTop: 15,

      paddingHorizontal: 16,
      paddingVertical: 10,

      borderRadius: 10,

      backgroundColor:
        "#9A6C20",
    },


    retryButtonText: {
      fontSize: 10,

      fontWeight: "800",

      color: "#FFFFFF",
    },


    // ======================================================
    // FILTER MODAL
    // ======================================================

    modalRoot: {
      flex: 1,

      justifyContent:
        "flex-end",
    },


    modalBackdrop: {
      ...StyleSheet.absoluteFill,

      backgroundColor:
        "rgba(28, 23, 19, 0.35)",
    },


    filterSheet: {
      maxHeight: "78%",

      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 30,

      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,

      borderWidth: 1,

      borderColor:
        "#E0D5C8",

      backgroundColor:
        "#FBF8F2",
    },


    sheetHandle: {
      alignSelf:
        "center",

      width: 40,
      height: 4,

      borderRadius: 2,

      backgroundColor:
        "#D0C2B2",
    },


    sheetHeader: {
      marginTop: 14,
      marginBottom: 13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    sheetTitle: {
      fontSize: 18,

      fontWeight: "900",

      color: "#352F29",
    },


    sheetClose: {
      width: 35,
      height: 35,

      borderRadius: 18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EEE7DE",
    },


    optionList: {
      gap: 8,
    },


    optionRow: {
      minHeight: 50,

      paddingHorizontal: 13,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        "#E1D7CB",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",
    },


    optionRowSelected: {
      borderColor:
        "#B88B3F",

      backgroundColor:
        "#F3E6D2",
    },


    optionText: {
      flex: 1,

      fontSize: 11,

      fontWeight: "700",

      color: "#5E5349",
    },


    optionTextSelected: {
      color: "#755018",
    },


    optionCheck: {
      width: 25,
      height: 25,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        "#D6C9BA",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F8F4EE",
    },


    optionCheckSelected: {
      borderColor:
        "#9A6C20",

      backgroundColor:
        "#9A6C20",
    },

  });
