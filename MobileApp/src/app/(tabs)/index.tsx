import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
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
  ArrowRight,
  BookOpen,
  Feather,
  Globe2,
  Heart,
  MessageCircle,
  PenLine,
  Quote,
  Sparkles,
  User,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  getWritings,
  Writing,
} from "../../api/api";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer
  from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type HomeWriting =
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
): HomeWriting[] {

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
// HOME
// ==========================================================

export default function HomeScreen() {

  const {
    language,
    t,
  } = useLanguage();


  const [
    writings,
    setWritings,
  ] =
    useState<HomeWriting[]>(
      []
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
  // WRITER INSPIRATION — animated multilingual quotes
  // ========================================================

  const [
    quoteIndex,
    setQuoteIndex,
  ] =
    useState(0);


  const quoteOpacity =
    useRef(
      new Animated.Value(1)
    ).current;


  const inspirationQuotes =
    useMemo(
      () => {

        if (language === "bn") {
          return [
            "প্রথম বাক্যটি নিখুঁত হতে হবে না—শুধু লেখা শুরু হোক।",
            "সাদা পৃষ্ঠা শূন্য নয়—সে অপেক্ষা করছে তোমার কণ্ঠের জন্য।",
            "যে কথাটি মুখে বলা হয়নি, আজ তাকে শব্দে বাঁচিয়ে রাখো।",
            "তোমার ছোট্ট একটি অনুভূতিই হয়তো কারও মনে হয়ে উঠবে দীর্ঘ গল্প।",
          ];
        }

        if (language === "hi") {
          return [
            "पहला वाक्य पूर्ण होना ज़रूरी नहीं—बस उसका लिखा जाना ज़रूरी है।",
            "खाली पन्ना खाली नहीं होता—वह आपकी आवाज़ का इंतज़ार करता है।",
            "जिस बात को कह नहीं पाए, आज उसे शब्दों में जीने दो।",
            "आपकी एक सच्ची भावना किसी और के लिए यादगार कहानी बन सकती है।",
          ];
        }

        return [
          "Your first sentence doesn’t need to be perfect. It only needs to exist.",
          "A blank page is not empty—it is waiting for your voice.",
          "Write the thought you were afraid the world might never hear.",
          "One honest paragraph can become someone else’s unforgettable story.",
        ];

      },
      [language]
    );


  const inspirationLabel =
    language === "bn"
      ? "লেখার অনুপ্রেরণা"
      : language === "hi"
        ? "लेखन प्रेरणा"
        : "WRITER'S INSPIRATION";


  const inspirationAction =
    language === "bn"
      ? "লেখা শুরু করুন"
      : language === "hi"
        ? "लिखना शुरू करें"
        : "Start Writing";


  useEffect(
    () => {

      setQuoteIndex(0);
      quoteOpacity.setValue(1);

      const interval =
        setInterval(
          () => {
            Animated.timing(
              quoteOpacity,
              {
                toValue: 0,
                duration: 320,
                useNativeDriver: true,
              }
            ).start(() => {
              setQuoteIndex(
                current =>
                  (current + 1) % inspirationQuotes.length
              );

              Animated.timing(
                quoteOpacity,
                {
                  toValue: 1,
                  duration: 420,
                  useNativeDriver: true,
                }
              ).start();
            });
          },
          6500
        );

      return () => {
        clearInterval(interval);
        quoteOpacity.stopAnimation();
      };

    },
    [inspirationQuotes, quoteOpacity]
  );


  // ========================================================
  // LOCALIZED DECORATIVE COPY
  //
  // These strings are intentionally local to the Home screen
  // so index.tsx works immediately with the current
  // LanguageContext without exposing missing translation keys.
  // ========================================================

  const decorativeCopy =
    useMemo(
      () => {

        if (language === "bn") {

          return {
            quote:
              "কিছু শব্দ কাগজে লেখা হয়, আর কিছু শব্দ হৃদয়ে থেকে যায়।",
            quoteAuthor:
              "— SHOBDO",
            categoriesKicker:
              "অন্বেষণ",
            latestKicker:
              "সাম্প্রতিক",
            writerKicker:
              "লেখকদের জন্য",
            paperLabel:
              "আজ আপনি কী লিখবেন?",
            paperHint:
              "একটি ভাবনা থেকেই শুরু হতে পারে নতুন গল্প।",
          };

        }


        if (language === "hi") {

          return {
            quote:
              "कुछ शब्द कागज़ पर लिखे जाते हैं, और कुछ शब्द दिल में रह जाते हैं।",
            quoteAuthor:
              "— SHOBDO",
            categoriesKicker:
              "अन्वेषण",
            latestKicker:
              "नवीनतम",
            writerKicker:
              "लेखकों के लिए",
            paperLabel:
              "आज आप क्या लिखेंगे?",
            paperHint:
              "एक विचार से नई कहानी की शुरुआत हो सकती है।",
          };

        }


        return {
          quote:
            "Some words are written on paper, while some remain in the heart.",
          quoteAuthor:
            "— SHOBDO",
          categoriesKicker:
            "EXPLORE",
          latestKicker:
            "LATEST",
          writerKicker:
            "FOR WRITERS",
          paperLabel:
            "What will you write today?",
          paperHint:
            "A single thought can become a new story.",
        };

      },
      [
        language,
      ]
    );


  // ========================================================
  // LOAD WRITINGS
  // ========================================================

  const loadWritings =
    useCallback(
      async () => {

        try {

          setError("");

          const data =
            await getWritings(
              1,
              6,
              ""
            );

          setWritings(
            normalizeWritings(
              data
            )
          );

        } catch (err: any) {

          console.error(
            "HOME LOAD ERROR:",
            err
          );

          setError(
            err?.message ||
            t(
              "home.loadError"
            )
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      [
        t,
      ]
    );


  useEffect(
    () => {

      setLoading(true);

      loadWritings();

    },
    [
      loadWritings,
    ]
  );


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh =
    () => {

      setRefreshing(true);

      loadWritings();

    };


  // ========================================================
  // NAVIGATION
  // ========================================================

  const openExplore =
    () => {

      router.push(
        "/(tabs)/explore"
      );

    };


  const openWrite =
    () => {

      router.push(
        "/(tabs)/write"
      );

    };


  const openWriting =
    (
      writing:
        HomeWriting
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


  const getAuthorId =
    (
      writing:
        HomeWriting
    ) => {

      const rawId =
        writing.author?.id ??
        writing.user?.id ??
        writing.user_id;

      const authorId =
        Number(rawId);

      return (
        Number.isInteger(
          authorId
        ) &&
        authorId > 0
      )
        ? authorId
        : null;

    };


  const openAuthor =
    (
      writing:
        HomeWriting
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
  // DISPLAY HELPERS
  // ========================================================

  const getAuthorName =
    (
      writing:
        HomeWriting
    ) => {

      return (
        writing.author?.name ||
        writing.user?.name ||
        writing.author_name ||
        t("home.writer")
      );

    };


  const getCategoryLabel =
    (
      category?: string
    ) => {

      const keyMap:
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
        keyMap[category]
      ) {

        return t(
          keyMap[category]
        );

      }


      return (
        category ||
        t(
          "home.otherCategory"
        )
      );

    };


  // ========================================================
  // CATEGORY CARD
  // ========================================================

  const CategoryCard =
    ({
      symbol,
      title,
    }: {
      symbol: string;
      title: string;
    }) => (

      <TouchableOpacity

        activeOpacity={0.82}

        style={
          styles.categoryCard
        }

        onPress={
          openExplore
        }

      >

        <View
          style={
            styles.categorySymbol
          }
        >
          <Text
            style={
              styles.categorySymbolText
            }
          >
            {symbol}
          </Text>
        </View>


        <Text
          style={
            styles.categoryTitle
          }
        >
          {title}
        </Text>


        <View
          style={
            styles.categoryArrow
          }
        >
          <ArrowRight
            size={16}
            color="#8A611F"
          />
        </View>

      </TouchableOpacity>

    );


  // ========================================================
  // WRITING CARD
  // ========================================================

  const WritingCard =
    ({
      writing,
    }: {
      writing:
        HomeWriting;
    }) => {

      const author =
        getAuthorName(
          writing
        );

      const authorId =
        getAuthorId(
          writing
        );

      const likes =
        safeNumber(
          writing.likes_count
        );

      const comments =
        safeNumber(
          writing.comments_count
        );

      const languageLabel =
        getLanguageLabel(
          writing.language
        );


      return (

        <TouchableOpacity

          activeOpacity={0.88}

          style={
            styles.writingCard
          }

          onPress={() =>
            openWriting(
              writing
            )
          }

        >

          <View
            style={
              styles.writingCardTop
            }
          >

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
                    writing.category
                  )
                }
              </Text>
            </View>


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

          </View>


          <Text
            style={
              styles.writingTitle
            }
            numberOfLines={2}
          >
            {writing.title}
          </Text>


          <Text
            style={
              styles.writingPreview
            }
            numberOfLines={4}
          >
            {writing.content}
          </Text>


          <View
            style={
              styles.writingDivider
            }
          />


          <View
            style={
              styles.writingFooter
            }
          >

            <TouchableOpacity

              activeOpacity={0.7}

              disabled={
                !authorId
              }

              style={
                styles.authorButton
              }

              onPress={(
                event
              ) => {

                event.stopPropagation();

                openAuthor(
                  writing
                );

              }}

            >

              <View
                style={
                  styles.avatar
                }
              >
                <User
                  size={14}
                  color="#8A611F"
                />
              </View>

              <Text
                style={
                  styles.authorName
                }
                numberOfLines={1}
              >
                {author}
              </Text>

            </TouchableOpacity>


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
                  size={15}
                  color="#756A5E"
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
                  size={15}
                  color="#756A5E"
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

          </View>

        </TouchableOpacity>

      );

    };


  // ========================================================
  // RENDER
  //
  // NOTE:
  // The real mobile Navbar is rendered by app/(tabs)/_layout.tsx.
  // Do not render Navbar again here or Home will show two navbars.
  // Footer is rendered at the bottom of this Home scroll.
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

            tintColor="#9A6C20"

          />

        }

      >

        {/* ==================================================
            HERO — desktop-inspired mobile layout
        ================================================== */}

        <View
          style={
            styles.hero
          }
        >

          <View
            style={
              styles.heroGlowOne
            }
          />

          <View
            style={
              styles.heroGlowTwo
            }
          />


          <View
            style={
              styles.heroCopy
            }
          >

            <View
              style={
                styles.eyebrow
              }
            >

              <Sparkles
                size={14}
                color="#90651F"
              />

              <Text
                style={
                  styles.eyebrowText
                }
              >
                {t("home.eyebrow")}
              </Text>

            </View>


            <Text
              style={
                styles.heroTitle
              }
            >
              {t("home.title")}
            </Text>


            <Text
              style={
                styles.heroDescription
              }
            >
              {t(
                "home.description"
              )}
            </Text>


            <View
              style={
                styles.heroActions
              }
            >

              <TouchableOpacity

                activeOpacity={0.86}

                style={
                  styles.primaryButton
                }

                onPress={
                  openWrite
                }

              >

                <PenLine
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {
                    t(
                      "home.startWriting"
                    )
                  }
                </Text>

                <ArrowRight
                  size={16}
                  color="#FFFFFF"
                />

              </TouchableOpacity>


              <TouchableOpacity

                activeOpacity={0.84}

                style={
                  styles.secondaryButton
                }

                onPress={
                  openExplore
                }

              >

                <BookOpen
                  size={16}
                  color="#7B551B"
                />

                <Text
                  style={
                    styles.secondaryButtonText
                  }
                >
                  {
                    t(
                      "home.explore"
                    )
                  }
                </Text>

              </TouchableOpacity>

            </View>

          </View>


          {/* Desktop-inspired paper card */}

          <TouchableOpacity

            activeOpacity={0.9}

            style={
              styles.paperCard
            }

            onPress={
              openWrite
            }

          >

            <View
              style={
                styles.paperTop
              }
            >

              <View
                style={
                  styles.paperBrand
                }
              >

                <Feather
                  size={13}
                  color="#9A6C20"
                />

                <Text
                  style={
                    styles.paperBrandText
                  }
                >
                  SHOBDO
                </Text>

              </View>

            </View>


            <Text
              style={
                styles.paperLabel
              }
            >
              {
                decorativeCopy.paperLabel
              }
            </Text>


            <View
              style={
                styles.paperLine
              }
            />

            <View
              style={
                styles.paperLineShort
              }
            />


            <Text
              style={
                styles.paperHint
              }
            >
              {
                decorativeCopy.paperHint
              }
            </Text>

          </TouchableOpacity>


          {/* Animated multilingual inspiration quote */}

          <View
            style={
              styles.quoteCard
            }
          >

            <View
              style={
                styles.quoteHeader
              }
            >

              <View
                style={
                  styles.quoteIconWrap
                }
              >
                <Quote
                  size={17}
                  color="#A57933"
                />
              </View>

              <Text
                style={
                  styles.quoteKicker
                }
              >
                {inspirationLabel}
              </Text>

            </View>

            <Animated.View
              style={[
                styles.quoteAnimated,
                {
                  opacity:
                    quoteOpacity,
                },
              ]}
            >

              <Text
                style={
                  styles.quoteText
                }
              >
                {
                  inspirationQuotes[
                    quoteIndex
                  ]
                }
              </Text>

              <Text
                style={
                  styles.quoteAuthor
                }
              >
                — SHOBDO
              </Text>

            </Animated.View>

            <View
              style={
                styles.quoteBottomRow
              }
            >

              <View
                style={
                  styles.quoteDots
                }
              >
                {
                  inspirationQuotes.map(
                    (_, index) => (
                      <View
                        key={String(index)}
                        style={[
                          styles.quoteDot,
                          index === quoteIndex &&
                            styles.quoteDotActive,
                        ]}
                      />
                    )
                  )
                }
              </View>

              <TouchableOpacity
                activeOpacity={0.82}
                style={
                  styles.quoteWriteButton
                }
                onPress={
                  openWrite
                }
              >
                <PenLine
                  size={13}
                  color="#7A551D"
                />
                <Text
                  style={
                    styles.quoteWriteButtonText
                  }
                >
                  {inspirationAction}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>


        {/* ==================================================
            CATEGORIES
        ================================================== */}

        <View
          style={
            styles.section
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionHeadingCopy
              }
            >

              <Text
                style={
                  styles.sectionKicker
                }
              >
                {
                  decorativeCopy.categoriesKicker
                }
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                {
                  t(
                    "home.categories"
                  )
                }
              </Text>

            </View>


            <TouchableOpacity

              activeOpacity={0.75}

              style={
                styles.viewAll
              }

              onPress={
                openExplore
              }

            >

              <Text
                style={
                  styles.viewAllText
                }
              >
                {
                  t(
                    "home.viewAll"
                  )
                }
              </Text>

              <ArrowRight
                size={15}
                color="#916520"
              />

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.categoryGrid
            }
          >

            <CategoryCard
              symbol="ক"
              title={
                t(
                  "write.category.poem"
                )
              }
            />

            <CategoryCard
              symbol="গ"
              title={
                t(
                  "write.category.story"
                )
              }
            />

            <CategoryCard
              symbol="অ"
              title={
                t(
                  "write.category.feeling"
                )
              }
            />

            <CategoryCard
              symbol="প্র"
              title={
                t(
                  "write.category.article"
                )
              }
            />

          </View>

        </View>


        {/* ==================================================
            LATEST WRITINGS
        ================================================== */}

        <View
          style={[
            styles.section,
            styles.latestSection,
          ]}
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionHeadingCopy
              }
            >

              <Text
                style={
                  styles.sectionKicker
                }
              >
                {
                  decorativeCopy.latestKicker
                }
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                {
                  t(
                    "home.latest"
                  )
                }
              </Text>

            </View>


            <TouchableOpacity

              activeOpacity={0.75}

              style={
                styles.viewAll
              }

              onPress={
                openExplore
              }

            >

              <Text
                style={
                  styles.viewAllText
                }
              >
                {
                  t(
                    "home.viewAll"
                  )
                }
              </Text>

              <ArrowRight
                size={15}
                color="#916520"
              />

            </TouchableOpacity>

          </View>


          {loading ? (

            <View
              style={
                styles.stateCard
              }
            >

              <ActivityIndicator
                size="large"
                color="#9A6C20"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                {
                  t(
                    "home.loading"
                  )
                }
              </Text>

            </View>

          ) : error ? (

            <View
              style={
                styles.stateCard
              }
            >

              <BookOpen
                size={31}
                color="#9A6C20"
              />

              <Text
                style={
                  styles.stateTitle
                }
              >
                {
                  t(
                    "home.loadError"
                  )
                }
              </Text>

              <Text
                style={
                  styles.stateText
                }
              >
                {error}
              </Text>


              <TouchableOpacity

                activeOpacity={0.85}

                style={
                  styles.retryButton
                }

                onPress={() => {

                  setLoading(true);

                  loadWritings();

                }}

              >

                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  {
                    t(
                      "home.retry"
                    )
                  }
                </Text>

              </TouchableOpacity>

            </View>

          ) : writings.length === 0 ? (

            <View
              style={
                styles.stateCard
              }
            >

              <BookOpen
                size={32}
                color="#9A6C20"
              />

              <Text
                style={
                  styles.stateTitle
                }
              >
                {
                  t(
                    "home.noWritings"
                  )
                }
              </Text>

              <Text
                style={
                  styles.stateText
                }
              >
                {
                  t(
                    "home.noWritingsDescription"
                  )
                }
              </Text>


              <TouchableOpacity

                activeOpacity={0.86}

                style={
                  styles.primaryButton
                }

                onPress={
                  openWrite
                }

              >

                <PenLine
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {
                    t(
                      "home.startWriting"
                    )
                  }
                </Text>

              </TouchableOpacity>

            </View>

          ) : (

            writings.map(
              (
                writing
              ) => (

                <WritingCard
                  key={
                    String(
                      writing.id
                    )
                  }
                  writing={
                    writing
                  }
                />

              )
            )

          )}

        </View>


        {/* ==================================================
            WRITER CTA — dark desktop-style band
        ================================================== */}

        <View
          style={
            styles.writerCTA
          }
        >

          <View
            style={
              styles.writerGlow
            }
          />


          <View
            style={
              styles.writerIcon
            }
          >
            <Feather
              size={22}
              color="#E7C27C"
            />
          </View>


          <Text
            style={
              styles.writerKicker
            }
          >
            {
              decorativeCopy.writerKicker
            }
          </Text>


          <Text
            style={
              styles.writerTitle
            }
          >
            {
              t(
                "home.ctaTitle"
              )
            }
          </Text>


          <Text
            style={
              styles.writerDescription
            }
          >
            {
              t(
                "home.ctaDescription"
              )
            }
          </Text>


          <TouchableOpacity

            activeOpacity={0.86}

            style={
              styles.writerButton
            }

            onPress={
              openWrite
            }

          >

            <PenLine
              size={17}
              color="#7D571C"
            />

            <Text
              style={
                styles.writerButtonText
              }
            >
              {
                t(
                  "home.ctaButton"
                )
              }
            </Text>

            <ArrowRight
              size={16}
              color="#7D571C"
            />

          </TouchableOpacity>

        </View>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <Footer />

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
        "#F8F5EF",

    },


    scroll: {

      flex: 1,

    },


    scrollContent: {

      paddingBottom: 0,

    },


    // ======================================================
    // HERO
    // ======================================================

    hero: {

      position: "relative",

      overflow: "hidden",

      marginHorizontal: 14,
      marginTop: 12,

      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 22,

      borderRadius: 28,

      backgroundColor:
        "#EFE4D0",

    },


    heroGlowOne: {

      position: "absolute",

      width: 210,
      height: 210,

      top: -105,
      right: -85,

      borderRadius: 105,

      backgroundColor:
        "rgba(179,128,44,0.14)",

    },


    heroGlowTwo: {

      position: "absolute",

      width: 145,
      height: 145,

      left: -78,
      bottom: 145,

      borderRadius: 73,

      backgroundColor:
        "rgba(154,108,32,0.08)",

    },


    heroCopy: {

      zIndex: 2,

    },


    eyebrow: {

      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,

      paddingHorizontal: 10,
      paddingVertical: 6,

      borderRadius: 18,

      backgroundColor:
        "rgba(255,255,255,0.62)",

    },


    eyebrowText: {

      maxWidth: 250,

      fontSize: 10,
      lineHeight: 14,

      fontWeight: "800",

      letterSpacing: 0.7,

      color: "#7C5924",

    },


    heroTitle: {

      maxWidth: 330,

      marginTop: 21,

      fontSize: 39,
      lineHeight: 47,

      fontWeight: "900",

      letterSpacing: -1.2,

      color: "#27211C",

    },


    heroDescription: {

      maxWidth: 320,

      marginTop: 15,

      fontSize: 13,
      lineHeight: 22,

      color: "#6D6257",

    },


    heroActions: {

      marginTop: 22,

      flexDirection:
        "row",

      flexWrap: "wrap",

      gap: 10,

    },


    primaryButton: {

      minHeight: 44,

      paddingHorizontal: 15,

      borderRadius: 11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,

      backgroundColor:
        "#292522",

    },


    primaryButtonText: {

      fontSize: 11,

      fontWeight: "800",

      color: "#FFFFFF",

    },


    secondaryButton: {

      minHeight: 44,

      paddingHorizontal: 15,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        "#D7C7AE",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,

      backgroundColor:
        "rgba(255,255,255,0.55)",

    },


    secondaryButtonText: {

      fontSize: 11,

      fontWeight: "800",

      color: "#79531D",

    },


    paperCard: {

      alignSelf:
        "center",

      width: "91%",

      marginTop: 28,

      padding: 17,

      borderRadius: 4,

      shadowColor: "#463A2C",
      shadowOpacity: 0.13,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 3,

      transform: [
        {
          rotate:
            "-1.3deg",
        },
      ],

      backgroundColor:
        "#FFFDF8",

    },


    paperTop: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

    },


    paperBrand: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

    },


    paperBrandText: {

      fontSize: 7,

      fontWeight: "900",

      letterSpacing: 1.7,

      color: "#7E5C26",

    },


    paperLabel: {

      maxWidth: 260,

      marginTop: 23,

      fontSize: 22,
      lineHeight: 30,

      fontWeight: "800",

      color: "#342D27",

    },


    paperLine: {

      width: "92%",

      height: 1,

      marginTop: 23,

      backgroundColor:
        "#E7DFD3",

    },


    paperLineShort: {

      width: "66%",

      height: 1,

      marginTop: 11,

      backgroundColor:
        "#E7DFD3",

    },


    paperHint: {

      marginTop: 21,

      fontSize: 9,
      lineHeight: 15,

      color: "#A18764",

    },


    quoteCard: {

      marginTop: 22,

      padding: 17,

      borderRadius: 16,

      backgroundColor:
        "rgba(255,255,255,0.68)",

    },


    quoteHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    quoteIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(165,121,51,0.10)",
    },

    quoteKicker: {
      flex: 1,
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1.5,
      color: "#8B6224",
    },

    quoteAnimated: {
      minHeight: 106,
      justifyContent: "center",
    },

    quoteBottomRow: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    quoteDots: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    quoteDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#D7C7AE",
    },

    quoteDotActive: {
      width: 16,
      backgroundColor: "#A57933",
    },

    quoteWriteButton: {
      minHeight: 34,
      paddingHorizontal: 11,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: "#D9C6A7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "#FFF9EF",
    },

    quoteWriteButtonText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#7A551D",
    },


    quoteText: {

      marginTop: 7,

      fontSize: 13,
      lineHeight: 22,

      fontWeight: "600",

      color: "#54483C",

    },


    quoteAuthor: {

      marginTop: 9,

      fontSize: 9,

      fontWeight: "800",

      letterSpacing: 0.8,

      color: "#9A6C20",

    },


    // ======================================================
    // SECTION
    // ======================================================

    section: {

      paddingHorizontal: 16,

      paddingTop: 32,

    },


    latestSection: {

      paddingTop: 38,

    },


    sectionHeader: {

      marginBottom: 16,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap: 12,

    },


    sectionHeadingCopy: {

      flex: 1,

    },


    sectionKicker: {

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1.8,

      textTransform:
        "uppercase",

      color: "#9A6C20",

    },


    sectionTitle: {

      marginTop: 5,

      fontSize: 24,
      lineHeight: 31,

      fontWeight: "900",

      color: "#2F2924",

    },


    viewAll: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

      paddingBottom: 3,

    },


    viewAllText: {

      fontSize: 10,

      fontWeight: "800",

      color: "#8A611F",

    },


    // ======================================================
    // CATEGORY GRID
    // ======================================================

    categoryGrid: {

      flexDirection:
        "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",

      gap: 10,

    },


    categoryCard: {

      width: "48.4%",

      minHeight: 89,

      padding: 13,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#E7DDD0",

      backgroundColor:
        "#FFFFFF",

    },


    categorySymbol: {

      width: 34,
      height: 34,

      borderRadius: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3E7D4",

    },


    categorySymbolText: {

      fontSize: 13,

      fontWeight: "900",

      color: "#8A611F",

    },


    categoryTitle: {

      marginTop: 12,

      paddingRight: 25,

      fontSize: 12,

      fontWeight: "800",

      color: "#40362D",

    },


    categoryArrow: {

      position: "absolute",

      right: 12,
      bottom: 12,

      width: 27,
      height: 27,

      borderRadius: 14,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F7F0E6",

    },


    // ======================================================
    // WRITING CARD
    // ======================================================

    writingCard: {

      marginBottom: 13,

      padding: 16,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#E6DDD3",

      backgroundColor:
        "#FFFFFF",

    },


    writingCardTop: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 10,

    },


    categoryBadge: {

      maxWidth: "60%",

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 15,

      backgroundColor:
        "#F1E5D2",

    },


    categoryBadgeText: {

      fontSize: 9,

      fontWeight: "800",

      color: "#79531B",

    },


    languageBadge: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

    },


    languageBadgeText: {

      fontSize: 9,

      fontWeight: "700",

      color: "#8D7654",

    },


    writingTitle: {

      marginTop: 13,

      fontSize: 19,
      lineHeight: 27,

      fontWeight: "800",

      color: "#342C26",

    },


    writingPreview: {

      marginTop: 8,

      fontSize: 12,
      lineHeight: 20,

      color: "#6F6358",

    },


    writingDivider: {

      height: 1,

      marginTop: 14,

      backgroundColor:
        "#EEE7DF",

    },


    writingFooter: {

      marginTop: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 12,

    },


    authorButton: {

      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,

    },


    avatar: {

      width: 29,
      height: 29,

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3E7D4",

    },


    authorName: {

      flex: 1,

      fontSize: 10,

      fontWeight: "700",

      color: "#62554A",

    },


    engagement: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 12,

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

      fontWeight: "700",

      color: "#756A5E",

    },


    // ======================================================
    // STATES
    // ======================================================

    stateCard: {

      minHeight: 170,

      paddingHorizontal: 24,
      paddingVertical: 30,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#E6DDD3",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

    },


    stateTitle: {

      marginTop: 13,

      textAlign: "center",

      fontSize: 16,
      lineHeight: 23,

      fontWeight: "800",

      color: "#40372F",

    },


    stateText: {

      maxWidth: 280,

      marginTop: 7,

      textAlign: "center",

      fontSize: 11,
      lineHeight: 18,

      color: "#81766B",

    },


    retryButton: {

      minHeight: 40,

      marginTop: 16,

      paddingHorizontal: 16,

      borderRadius: 9,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#292522",

    },


    retryButtonText: {

      fontSize: 10,

      fontWeight: "800",

      color: "#FFFFFF",

    },


    // ======================================================
    // WRITER CTA
    // ======================================================

    writerCTA: {

      position: "relative",

      overflow: "hidden",

      marginTop: 40,

      paddingHorizontal: 24,
      paddingTop: 34,
      paddingBottom: 36,

      alignItems:
        "center",

      backgroundColor:
        "#211D1A",

    },


    writerGlow: {

      position: "absolute",

      width: 220,
      height: 220,

      top: -145,
      right: -90,

      borderRadius: 110,

      backgroundColor:
        "rgba(196,151,78,0.08)",

    },


    writerIcon: {

      width: 48,
      height: 48,

      borderRadius: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "rgba(213,170,98,0.10)",

    },


    writerKicker: {

      marginTop: 15,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 2,

      color: "#C89B51",

    },


    writerTitle: {

      maxWidth: 320,

      marginTop: 10,

      textAlign: "center",

      fontSize: 27,
      lineHeight: 35,

      fontWeight: "900",

      color: "#FFF9EF",

    },


    writerDescription: {

      maxWidth: 310,

      marginTop: 11,

      textAlign: "center",

      fontSize: 11,
      lineHeight: 19,

      color: "#C5B8A8",

    },


    writerButton: {

      minHeight: 45,

      marginTop: 21,

      paddingHorizontal: 17,

      borderRadius: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,

      backgroundColor:
        "#F2E3C7",

    },


    writerButtonText: {

      fontSize: 11,

      fontWeight: "800",

      color: "#74501A",

    },

  });
