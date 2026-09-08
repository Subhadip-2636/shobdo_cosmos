import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
  BookOpen,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe2,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react-native";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  deleteWriting,
  getMyWritings,
  permanentlyDeleteWriting,
  publishExistingWriting,
  restoreWriting,
  unpublishWriting,
  updateWriting,
  Writing,
} from "../../api/api";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type FilterType =
  | "all"
  | "published"
  | "draft"
  | "deleted";


type SortType =
  | "latest"
  | "oldest"
  | "title";


type WritingCounts = {
  draft: number;
  published: number;
  deleted: number;
};


type EditableWriting =
  Writing & {
    status?: string;
    previous_status?: string | null;
    deleted_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    published_at?: string | null;
    category?: string;
    language?: string;
    likes_count?: number;
    comments_count?: number;
  };


// ==========================================================
// HELPERS
// ==========================================================

const getLanguageLabel = (
  language?: string
) => {

  if (!language) {
    return "";
  }

  const languages:
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
    languages[language] ||
    language.toUpperCase()
  );

};


const getCategoryTranslationKey = (
  category?: string
) => {

  const keys:
    Record<string, string> = {
      "কবিতা":
        "myWritings.category.poem",
      "গল্প":
        "myWritings.category.story",
      "অনুভূতি":
        "myWritings.category.feeling",
      "প্রবন্ধ":
        "myWritings.category.article",
      "উপন্যাস":
        "myWritings.category.novel",
      "অন্যান্য":
        "myWritings.category.other",
  };

  return (
    category
      ? keys[category]
      : undefined
  );

};


const getWordCount = (
  content?: string
) => {

  const clean =
    content?.trim() || "";

  if (!clean) {
    return 0;
  }

  return clean
    .split(/\s+/)
    .length;

};


const getReadingMinutes = (
  wordCount: number
) =>
  Math.max(
    1,
    Math.ceil(
      wordCount / 200
    )
  );


const formatDate = (
  value?: string | null
) => {

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
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

};


// ==========================================================
// SCREEN
// ==========================================================

export default function MyWritingsScreen() {

  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    t,
    language,
  } = useLanguage();


  // ========================================================
  // LIST STATE
  // ========================================================

  const [
    writings,
    setWritings,
  ] =
    useState<EditableWriting[]>(
      []
    );

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>(
      "all"
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

  const [
    actionId,
    setActionId,
  ] =
    useState<number | null>(
      null
    );


  // ========================================================
  // DASHBOARD / DISCOVERY STATE
  // ========================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedLanguage,
    setSelectedLanguage,
  ] =
    useState("all");

  const [
    sortBy,
    setSortBy,
  ] =
    useState<SortType>(
      "latest"
    );

  const [
    counts,
    setCounts,
  ] =
    useState<WritingCounts>({
      draft: 0,
      published: 0,
      deleted: 0,
    });


  const ui =
    useCallback(
      (
        en: string,
        bn: string,
        hi: string
      ) => {

        if (
          language === "bn"
        ) {
          return bn;
        }

        if (
          language === "hi"
        ) {
          return hi;
        }

        return en;

      },
      [language]
    );


  // ========================================================
  // EDIT STATE
  // ========================================================

  const [
    editing,
    setEditing,
  ] =
    useState<EditableWriting | null>(
      null
    );

  const [
    editTitle,
    setEditTitle,
  ] =
    useState("");

  const [
    editContent,
    setEditContent,
  ] =
    useState("");

  const [
    editCategory,
    setEditCategory,
  ] =
    useState("");

  const [
    editLanguage,
    setEditLanguage,
  ] =
    useState("");

  const [
    savingEdit,
    setSavingEdit,
  ] =
    useState(false);


  // ========================================================
  // FILTER LABELS
  // ========================================================

  const filterItems =
    useMemo(
      () => [
        {
          value: "all" as FilterType,
          label:
            t(
              "myWritings.all"
            ),
        },
        {
          value:
            "published" as FilterType,
          label:
            t(
              "myWritings.published"
            ),
        },
        {
          value:
            "draft" as FilterType,
          label:
            t(
              "myWritings.drafts"
            ),
        },
        {
          value:
            "deleted" as FilterType,
          label:
            t(
              "myWritings.trash"
            ),
        },
      ],
      [t]
    );


  const languageOptions =
    useMemo(
      () => {

        const seen =
          new Set<string>();

        writings.forEach(
          (
            writing
          ) => {

            if (
              writing.language
            ) {
              seen.add(
                writing.language
              );
            }

          }
        );

        return [
          "all",
          ...Array.from(
            seen
          ).sort(),
        ];

      },
      [writings]
    );


  const visibleWritings =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLocaleLowerCase();

        const filtered =
          writings.filter(
            (
              writing
            ) => {

              const matchesSearch =
                !query ||
                (
                  writing.title ||
                  ""
                )
                  .toLocaleLowerCase()
                  .includes(
                    query
                  ) ||
                (
                  writing.content ||
                  ""
                )
                  .toLocaleLowerCase()
                  .includes(
                    query
                  );

              const matchesLanguage =
                selectedLanguage ===
                  "all" ||
                writing.language ===
                  selectedLanguage;

              return (
                matchesSearch &&
                matchesLanguage
              );

            }
          );

        return [
          ...filtered,
        ].sort(
          (
            a,
            b
          ) => {

            if (
              sortBy ===
              "title"
            ) {

              return (
                a.title ||
                ""
              ).localeCompare(
                b.title ||
                ""
              );

            }

            const aTime =
              new Date(
                a.updated_at ||
                a.published_at ||
                a.created_at ||
                0
              ).getTime();

            const bTime =
              new Date(
                b.updated_at ||
                b.published_at ||
                b.created_at ||
                0
              ).getTime();

            return (
              sortBy ===
              "oldest"
                ? aTime -
                  bTime
                : bTime -
                  aTime
            );

          }
        );

      },
      [
        writings,
        search,
        selectedLanguage,
        sortBy,
      ]
    );


  const loadCounts =
    useCallback(
      async () => {

        if (!user) {

          setCounts({
            draft: 0,
            published: 0,
            deleted: 0,
          });

          return;

        }

        try {

          const [
            drafts,
            published,
            deleted,
          ] =
            await Promise.all([
              getMyWritings(
                "draft"
              ),
              getMyWritings(
                "published"
              ),
              getMyWritings(
                "deleted"
              ),
            ]);

          const normalize =
            (
              data: any
            ) =>
              Array.isArray(
                data
              )
                ? data
                : Array.isArray(
                    data
                      ?.writings
                  )
                  ? data
                      .writings
                  : [];

          setCounts({
            draft:
              normalize(
                drafts
              ).length,
            published:
              normalize(
                published
              ).length,
            deleted:
              normalize(
                deleted
              ).length,
          });

        } catch (err) {

          console.error(
            "MY WRITINGS COUNTS ERROR:",
            err
          );

        }

      },
      [user]
    );


  // ========================================================
  // LOAD WRITINGS
  // ========================================================

  const loadWritings =
    useCallback(

      async (
        selectedFilter:
          FilterType
      ) => {

        if (!user) {

          setWritings([]);

          setLoading(false);

          setRefreshing(false);

          return;

        }

        try {

          setError("");

          const status =
            selectedFilter === "all"
              ? ""
              : selectedFilter;

          const data =
            await getMyWritings(
              status
            );

          const items =
            Array.isArray(data)
              ? data
              : Array.isArray(
                  (data as any)
                    ?.writings
                )
                ? (
                    data as any
                  ).writings
                : [];

          setWritings(
            items as EditableWriting[]
          );

        } catch (err: any) {

          console.error(
            "MY WRITINGS ERROR:",
            err
          );

          setError(
            err?.message ||
            t(
              "myWritings.loadErrorDescription"
            )
          );

          setWritings([]);

        } finally {

          setLoading(false);

          setRefreshing(false);

        }

      },

      [
        user,
        t,
      ]

    );


  // ========================================================
  // SCREEN FOCUS
  // ========================================================

  useFocusEffect(

    useCallback(() => {

      setLoading(true);

      void Promise.all([
        loadWritings(
          filter
        ),
        loadCounts(),
      ]);

    }, [
      filter,
      loadCounts,
      loadWritings,
    ])

  );


  // ========================================================
  // FILTER
  // ========================================================

  const changeFilter =
    async (
      selected:
        FilterType
    ) => {

      if (
        selected === filter
      ) {
        return;
      }

      setFilter(
        selected
      );

      setLoading(true);

      await loadWritings(
        selected
      );

    };


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh =
    async () => {

      setRefreshing(true);

      await Promise.all([
        loadWritings(
          filter
        ),
        loadCounts(),
      ]);

    };


  // ========================================================
  // DASHBOARD ACTIONS
  // ========================================================

  const handleNewWriting =
    () => {

      router.push(
        "/(tabs)/write"
      );

    };


  const resetDiscovery =
    () => {

      setSearch("");

      setSelectedLanguage(
        "all"
      );

      setSortBy(
        "latest"
      );

    };


  // ========================================================
  // VIEW
  // ========================================================

  const handleView =
    (
      writing:
        EditableWriting
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


  // ========================================================
  // PUBLISH
  // ========================================================

  const handlePublish =
    async (
      writing:
        EditableWriting
    ) => {

      try {

        setActionId(
          writing.id
        );

        await publishExistingWriting(
          writing.id
        );

        Alert.alert(
          t(
            "myWritings.alert.published"
          ),
          t(
            "myWritings.alert.publishedDescription"
          )
        );

        await Promise.all([
          loadWritings(
            filter
          ),
          loadCounts(),
        ]);

      } catch (err: any) {

        Alert.alert(
          t(
            "myWritings.alert.publishError"
          ),
          err?.message ||
          t(
            "myWritings.alert.genericError"
          )
        );

      } finally {

        setActionId(
          null
        );

      }

    };


  // ========================================================
  // UNPUBLISH
  // ========================================================

  const handleUnpublish =
    async (
      writing:
        EditableWriting
    ) => {

      try {

        setActionId(
          writing.id
        );

        await unpublishWriting(
          writing.id
        );

        Alert.alert(
          t(
            "myWritings.alert.movedToDrafts"
          ),
          t(
            "myWritings.alert.movedToDraftsDescription"
          )
        );

        await Promise.all([
          loadWritings(
            filter
          ),
          loadCounts(),
        ]);

      } catch (err: any) {

        Alert.alert(
          t(
            "myWritings.alert.unpublishError"
          ),
          err?.message ||
          t(
            "myWritings.alert.genericError"
          )
        );

      } finally {

        setActionId(
          null
        );

      }

    };


  // ========================================================
  // RESTORE
  // ========================================================

  const handleRestore =
    async (
      writing:
        EditableWriting
    ) => {

      try {

        setActionId(
          writing.id
        );

        const restored =
          await restoreWriting(
            writing.id
          );

        const restoredStatus =
          restored?.status ===
          "published"
            ? "published"
            : "draft";

        Alert.alert(
          t(
            "myWritings.alert.restored"
          ),
          restoredStatus ===
          "published"
            ? t(
                "myWritings.alert.restoredPublishedDescription"
              )
            : t(
                "myWritings.alert.restoredDraftDescription"
              )
        );

        await Promise.all([
          loadWritings(
            filter
          ),
          loadCounts(),
        ]);

      } catch (err: any) {

        Alert.alert(
          t(
            "myWritings.alert.restoreError"
          ),
          err?.message ||
          t(
            "myWritings.alert.genericError"
          )
        );

      } finally {

        setActionId(
          null
        );

      }

    };


  // ========================================================
  // MOVE TO TRASH
  // ========================================================

  const confirmDelete =
    (
      writing:
        EditableWriting
    ) => {

      Alert.alert(
        t(
          "myWritings.alert.deleteTitle"
        ),
        t(
          "myWritings.alert.deleteDescription",
          {
            title:
              writing.title,
          }
        ),
        [
          {
            text:
              t(
                "myWritings.cancel"
              ),
            style:
              "cancel",
          },
          {
            text:
              t(
                "myWritings.delete"
              ),
            style:
              "destructive",
            onPress:
              async () => {

                try {

                  setActionId(
                    writing.id
                  );

                  await deleteWriting(
                    writing.id
                  );

                  await loadWritings(
                    filter
                  );

                } catch (err: any) {

                  Alert.alert(
                    t(
                      "myWritings.alert.deleteError"
                    ),
                    err?.message ||
                    t(
                      "myWritings.alert.genericError"
                    )
                  );

                } finally {

                  setActionId(
                    null
                  );

                }

              },
          },
        ]
      );

    };


  // ========================================================
  // PERMANENT DELETE
  // ========================================================

  const confirmPermanentDelete =
    (
      writing:
        EditableWriting
    ) => {

      Alert.alert(
        t(
          "myWritings.alert.permanentDeleteTitle"
        ),
        t(
          "myWritings.alert.permanentDeleteDescription",
          {
            title:
              writing.title,
          }
        ),
        [
          {
            text:
              t(
                "myWritings.cancel"
              ),
            style:
              "cancel",
          },
          {
            text:
              t(
                "myWritings.deletePermanently"
              ),
            style:
              "destructive",
            onPress:
              async () => {

                try {

                  setActionId(
                    writing.id
                  );

                  await permanentlyDeleteWriting(
                    writing.id
                  );

                  await loadWritings(
                    filter
                  );

                } catch (err: any) {

                  Alert.alert(
                    t(
                      "myWritings.alert.permanentDeleteError"
                    ),
                    err?.message ||
                    t(
                      "myWritings.alert.genericError"
                    )
                  );

                } finally {

                  setActionId(
                    null
                  );

                }

              },
          },
        ]
      );

    };


  // ========================================================
  // EDIT
  // ========================================================

  const openEdit =
    (
      writing:
        EditableWriting
    ) => {

      setEditing(
        writing
      );

      setEditTitle(
        writing.title ||
        ""
      );

      setEditContent(
        writing.content ||
        ""
      );

      setEditCategory(
        writing.category ||
        "অন্যান্য"
      );

      setEditLanguage(
        writing.language ||
        "bn"
      );

    };


  const closeEdit =
    () => {

      if (
        savingEdit
      ) {
        return;
      }

      setEditing(
        null
      );

    };


  const saveEdit =
    async () => {

      if (!editing) {
        return;
      }

      if (
        !editTitle.trim()
      ) {

        Alert.alert(
          t(
            "myWritings.alert.titleRequired"
          ),
          t(
            "myWritings.alert.titleRequiredDescription"
          )
        );

        return;

      }

      if (
        editTitle.trim()
          .length > 200
      ) {

        Alert.alert(
          t(
            "myWritings.alert.titleRequired"
          ),
          t(
            "myWritings.alert.genericError"
          )
        );

        return;

      }

      if (
        !editContent.trim()
      ) {

        Alert.alert(
          t(
            "myWritings.alert.contentRequired"
          ),
          t(
            "myWritings.alert.contentRequiredDescription"
          )
        );

        return;

      }

      if (
        editing.status ===
          "published" &&
        editContent
          .trim()
          .length < 10
      ) {

        Alert.alert(
          t(
            "myWritings.alert.contentTooShort"
          ),
          t(
            "myWritings.alert.contentTooShortDescription"
          )
        );

        return;

      }

      try {

        setSavingEdit(
          true
        );

        await updateWriting(
          editing.id,
          {
            title:
              editTitle.trim(),
            content:
              editContent.trim(),
            category:
              editCategory.trim() ||
              "অন্যান্য",
            language:
              editLanguage.trim() ||
              "bn",
          }
        );

        setEditing(
          null
        );

        Alert.alert(
          t(
            "myWritings.alert.updated"
          ),
          t(
            "myWritings.alert.updatedDescription"
          )
        );

        await Promise.all([
          loadWritings(
            filter
          ),
          loadCounts(),
        ]);

      } catch (err: any) {

        Alert.alert(
          t(
            "myWritings.alert.updateError"
          ),
          err?.message ||
          t(
            "myWritings.alert.genericError"
          )
        );

      } finally {

        setSavingEdit(
          false
        );

      }

    };


  // ========================================================
  // AUTH LOADING
  // ========================================================

  if (authLoading) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <View
          style={
            styles.center
          }
        >

          <ActivityIndicator
            size="large"
            color="#9A6C20"
          />

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // SIGNED OUT
  // ========================================================

  if (!user) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        <View
          style={
            styles.centerContent
          }
        >

          <View
            style={
              styles.emptyIconCircle
            }
          >

            <BookOpen
              size={30}
              color="#8A641F"
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            {t(
              "myWritings.title"
            )}
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            {t(
              "myWritings.signInDescription"
            )}
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // SCREEN
  // ========================================================

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      <View
        style={
          styles.container
        }
      >

        {/* CONTENT */}

        {loading ? (

          <View
            style={
              styles.loadingArea
            }
          >

            <ActivityIndicator
              size="large"
              color="#9A6C20"
            />

          </View>

        ) : error ? (

          <View
            style={
              styles.centerContent
            }
          >

            <Text
              style={
                styles.errorTitle
              }
            >
              {t(
                "myWritings.loadError"
              )}
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <TouchableOpacity

              style={
                styles.retryButton
              }

              activeOpacity={
                0.85
              }

              onPress={() => {

                setLoading(
                  true
                );

                loadWritings(
                  filter
                );

              }}

            >

              <Text
                style={
                  styles.retryText
                }
              >
                {t(
                  "myWritings.retry"
                )}
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          <FlatList

            data={
              visibleWritings
            }

            style={{
              flex: 1,
            }}

            ListHeaderComponent={

        <View
          style={
            styles.header
          }
        >

          <View
            style={
              styles.headerTop
            }
          >

            <View
              style={
                styles.headerCopy
              }
            >

              <Text
                style={
                  styles.eyebrow
                }
              >
                {t(
                  "myWritings.eyebrow"
                )}
              </Text>

              <Text
                style={
                  styles.heading
                }
              >
                {t(
                  "myWritings.title"
                )}
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {t(
                  "myWritings.description"
                )}
              </Text>

            </View>


            <TouchableOpacity

              style={
                styles.newWritingButton
              }

              activeOpacity={
                0.85
              }

              onPress={
                handleNewWriting
              }

            >

              <Plus
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.newWritingText
                }
              >
                {
                  ui(
                    "New Writing",
                    "নতুন লেখা",
                    "नई रचना"
                  )
                }
              </Text>

            </TouchableOpacity>

          </View>


          {/* SUMMARY CARDS */}

          <View
            style={
              styles.summaryGrid
            }
          >

            <SummaryCard
              title={
                t(
                  "myWritings.drafts"
                )
              }
              count={
                counts.draft
              }
              icon={
                <FileText
                  size={20}
                  color="#8A641F"
                />
              }
              active={
                filter ===
                "draft"
              }
              onPress={() =>
                changeFilter(
                  "draft"
                )
              }
            />

            <SummaryCard
              title={
                t(
                  "myWritings.published"
                )
              }
              count={
                counts.published
              }
              icon={
                <BookOpen
                  size={20}
                  color="#47704D"
                />
              }
              active={
                filter ===
                "published"
              }
              onPress={() =>
                changeFilter(
                  "published"
                )
              }
            />

            <SummaryCard
              title={
                t(
                  "myWritings.trash"
                )
              }
              count={
                counts.deleted
              }
              icon={
                <Trash2
                  size={20}
                  color="#8C8174"
                />
              }
              active={
                filter ===
                "deleted"
              }
              fullWidth
              onPress={() =>
                changeFilter(
                  "deleted"
                )
              }
            />

          </View>


          {/* SEARCH */}

          <View
            style={
              styles.searchBox
            }
          >

            <Search
              size={18}
              color="#998C7F"
            />

            <TextInput
              style={
                styles.searchInput
              }
              value={
                search
              }
              onChangeText={
                setSearch
              }
              placeholder={
                ui(
                  "Search your writings...",
                  "আপনার লেখা খুঁজুন...",
                  "अपनी रचनाएँ खोजें..."
                )
              }
              placeholderTextColor="#A69B90"
              returnKeyType="search"
            />

            {!!search && (

              <TouchableOpacity
                style={
                  styles.searchClear
                }
                onPress={() =>
                  setSearch(
                    ""
                  )
                }
              >

                <X
                  size={16}
                  color="#81766B"
                />

              </TouchableOpacity>

            )}

          </View>


          {/* LANGUAGE FILTER */}

          <View
            style={
              styles.discoveryBlock
            }
          >

            <Text
              style={
                styles.discoveryLabel
              }
            >
              {
                ui(
                  "LANGUAGE",
                  "ভাষা",
                  "भाषा"
                )
              }
            </Text>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.chipRow
              }
            >

              {languageOptions.map(
                (
                  code
                ) => {

                  const active =
                    selectedLanguage ===
                    code;

                  const label =
                    code === "all"
                      ? ui(
                          "All Languages",
                          "সব ভাষা",
                          "सभी भाषाएँ"
                        )
                      : getLanguageLabel(
                          code
                        );

                  return (

                    <ChoiceChip
                      key={
                        code
                      }
                      label={
                        label
                      }
                      active={
                        active
                      }
                      onPress={() =>
                        setSelectedLanguage(
                          code
                        )
                      }
                    />

                  );

                }
              )}

            </ScrollView>

          </View>


          {/* SORT */}

          <View
            style={
              styles.discoveryBlock
            }
          >

            <Text
              style={
                styles.discoveryLabel
              }
            >
              {
                ui(
                  "SORT",
                  "সাজান",
                  "क्रम"
                )
              }
            </Text>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.chipRow
              }
            >

              <ChoiceChip
                label={
                  ui(
                    "Latest Updated",
                    "সর্বশেষ আপডেট",
                    "नवीनतम अपडेट"
                  )
                }
                active={
                  sortBy ===
                  "latest"
                }
                onPress={() =>
                  setSortBy(
                    "latest"
                  )
                }
              />

              <ChoiceChip
                label={
                  ui(
                    "Oldest Updated",
                    "পুরোনো আগে",
                    "सबसे पुराना"
                  )
                }
                active={
                  sortBy ===
                  "oldest"
                }
                onPress={() =>
                  setSortBy(
                    "oldest"
                  )
                }
              />

              <ChoiceChip
                label={
                  ui(
                    "Title A–Z",
                    "শিরোনাম অ–হ",
                    "शीर्षक अ–ह"
                  )
                }
                active={
                  sortBy ===
                  "title"
                }
                onPress={() =>
                  setSortBy(
                    "title"
                  )
                }
              />

            </ScrollView>

          </View>


          {/* RESET */}

          <TouchableOpacity

            style={
              styles.resetButton
            }

            activeOpacity={
              0.82
            }

            onPress={
              resetDiscovery
            }

          >

            <RotateCcw
              size={16}
              color="#62564B"
            />

            <Text
              style={
                styles.resetButtonText
              }
            >
              {
                ui(
                  "Reset Filters",
                  "ফিল্টার রিসেট করুন",
                  "फ़िल्टर रीसेट करें"
                )
              }
            </Text>

          </TouchableOpacity>


          {/* STATUS FILTERS */}

          <ScrollView

            horizontal

            nestedScrollEnabled

            showsHorizontalScrollIndicator={
              false
            }

            contentContainerStyle={
              styles.filters
            }

          >

            {filterItems.map(
              (
                item
              ) => (

                <FilterButton

                  key={
                    item.value
                  }

                  label={
                    item.label
                  }

                  active={
                    filter ===
                    item.value
                  }

                  onPress={() =>
                    changeFilter(
                      item.value
                    )
                  }

                />

              )
            )}

          </ScrollView>


          {/* RESULT COUNT */}

          <Text
            style={
              styles.resultCount
            }
          >
            {
              filter ===
              "published"
                ? t(
                    "myWritings.published"
                  )
                : filter ===
                    "draft"
                  ? t(
                      "myWritings.drafts"
                    )
                  : filter ===
                      "deleted"
                    ? t(
                        "myWritings.trash"
                      )
                    : t(
                        "myWritings.all"
                      )
            }{" "}
            ·{" "}
            {
              visibleWritings.length
            }
          </Text>

        </View>

            }

            keyExtractor={(
              item
            ) =>
              String(
                item.id
              )
            }

            showsVerticalScrollIndicator={
              false
            }

            contentContainerStyle={
              styles.list
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

            ListEmptyComponent={

              <View
                style={
                  styles.emptyState
                }
              >

                <View
                  style={
                    styles.emptyIconCircle
                  }
                >

                  {filter ===
                  "deleted" ? (

                    <Trash2
                      size={28}
                      color="#9B3D37"
                    />

                  ) : (

                    <FileText
                      size={28}
                      color="#8A641F"
                    />

                  )}

                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {
                    filter ===
                    "deleted"
                      ? t(
                          "myWritings.noTrash"
                        )
                      : t(
                          "myWritings.empty"
                        )
                  }
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  {
                    filter ===
                    "deleted"
                      ? t(
                          "myWritings.noTrashDescription"
                        )
                      : t(
                          "myWritings.emptyDescription"
                        )
                  }
                </Text>

              </View>

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

            renderItem={({
              item,
            }) => {

              const isBusy =
                actionId ===
                item.id;

              const isDraft =
                item.status ===
                "draft";

              const isPublished =
                item.status ===
                "published";

              const isDeleted =
                item.status ===
                "deleted";

              const wordCount =
                getWordCount(
                  item.content
                );

              const readingMinutes =
                getReadingMinutes(
                  wordCount
                );

              const updatedValue =
                item.updated_at ||
                item.published_at ||
                item.created_at;

              return (

                <View
                  style={
                    styles.card
                  }
                >

                  {/* STATUS / CATEGORY */}

                  <View
                    style={
                      styles.cardTopRow
                    }
                  >

                    <View
                      style={
                        styles.badgeGroup
                      }
                    >

                      <View
                        style={[
                          styles.statusBadge,
                          isDeleted
                            ? styles.deletedBadge
                            : isDraft
                              ? styles.draftBadge
                              : styles.publishedBadge,
                        ]}
                      >

                        <Text
                          style={[
                            styles.statusText,
                            isDeleted
                              ? styles.deletedStatusText
                              : isDraft
                                ? styles.draftStatusText
                                : styles.publishedStatusText,
                          ]}
                        >
                          {
                            isDeleted
                              ? t(
                                  "myWritings.trash"
                                )
                              : isDraft
                                ? t(
                                    "myWritings.statusDraft"
                                  )
                                : t(
                                    "myWritings.statusPublished"
                                  )
                          }
                        </Text>

                      </View>


                      <View
                        style={
                          styles.languageBadge
                        }
                      >

                        <Globe2
                          size={13}
                          color="#8A641F"
                        />

                        <Text
                          style={
                            styles.languageBadgeText
                          }
                        >
                          {
                            getLanguageLabel(
                              item.language
                            )
                          }
                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.categoryBadge
                      }
                    >

                      <Text
                        style={
                          styles.categoryBadgeText
                        }
                        numberOfLines={1}
                      >
                        {
                          t(
                            getCategoryTranslationKey(
                              item.category
                            ) ||
                            "myWritings.category.other"
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


                  {/* PREVIEW */}

                  <Text
                    style={
                      styles.preview
                    }
                    numberOfLines={3}
                  >
                    {item.content}
                  </Text>


                  {/* META */}

                  <View
                    style={
                      styles.metaRow
                    }
                  >

                    <View
                      style={
                        styles.metaItem
                      }
                    >

                      <FileText
                        size={14}
                        color="#8C7D6E"
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                      >
                        {wordCount}{" "}
                        {t(
                          "myWritings.words"
                        )}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.metaDivider
                      }
                    />


                    <View
                      style={
                        styles.metaItem
                      }
                    >

                      <Clock
                        size={14}
                        color="#8C7D6E"
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                      >
                        {readingMinutes}{" "}
                        {t(
                          "writingCard.minutes"
                        ) ===
                        "writingCard.minutes"
                          ? "min"
                          : t(
                              "writingCard.minutes"
                            )}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.metaDivider
                      }
                    />


                    <View
                      style={
                        styles.metaItem
                      }
                    >

                      <Globe2
                        size={14}
                        color="#8C7D6E"
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                      >
                        {
                          getLanguageLabel(
                            item.language
                          )
                        }
                      </Text>

                    </View>

                  </View>


                  {/* UPDATED */}

                  {!!updatedValue && (

                    <View
                      style={
                        styles.updatedSection
                      }
                    >

                      <Text
                        style={
                          styles.updatedLabel
                        }
                      >
                        {t(
                          "myWritings.updated"
                        ) ===
                        "myWritings.updated"
                          ? "Updated"
                          : t(
                              "myWritings.updated"
                            )}
                      </Text>

                      <Text
                        style={
                          styles.updatedValue
                        }
                      >
                        {
                          formatDate(
                            updatedValue
                          )
                        }
                      </Text>

                    </View>

                  )}


                  {/* ACTIONS */}

                  <View
                    style={
                      styles.actionsSection
                    }
                  >

                    {isDeleted ? (

                      <View
                        style={
                          styles.actionRow
                        }
                      >

                        <ActionButton
                          icon={
                            <RotateCcw
                              size={16}
                              color="#FFFFFF"
                            />
                          }
                          label={
                            t(
                              "myWritings.restore"
                            )
                          }
                          variant="primary"
                          loading={
                            isBusy
                          }
                          disabled={
                            isBusy
                          }
                          onPress={() =>
                            handleRestore(
                              item
                            )
                          }
                        />

                        <ActionButton
                          icon={
                            <Trash2
                              size={16}
                              color="#9B3D37"
                            />
                          }
                          label={
                            t(
                              "myWritings.deletePermanently"
                            )
                          }
                          variant="danger"
                          disabled={
                            isBusy
                          }
                          onPress={() =>
                            confirmPermanentDelete(
                              item
                            )
                          }
                        />

                      </View>

                    ) : (

                      <>

                        <View
                          style={
                            styles.actionRow
                          }
                        >

                          <ActionButton
                            icon={
                              <Edit3
                                size={16}
                                color="#62564B"
                              />
                            }
                            label={
                              t(
                                "myWritings.edit"
                              )
                            }
                            variant="secondary"
                            disabled={
                              isBusy
                            }
                            onPress={() =>
                              openEdit(
                                item
                              )
                            }
                          />


                          {isPublished ? (

                            <ActionButton
                              icon={
                                <Eye
                                  size={16}
                                  color="#62564B"
                                />
                              }
                              label={
                                t(
                                  "explore.read"
                                )
                              }
                              variant="secondary"
                              disabled={
                                isBusy
                              }
                              onPress={() =>
                                handleView(
                                  item
                                )
                              }
                            />

                          ) : (

                            <ActionButton
                              icon={
                                <Send
                                  size={16}
                                  color="#FFFFFF"
                                />
                              }
                              label={
                                t(
                                  "myWritings.publish"
                                )
                              }
                              variant="primary"
                              loading={
                                isBusy
                              }
                              disabled={
                                isBusy
                              }
                              onPress={() =>
                                handlePublish(
                                  item
                                )
                              }
                            />

                          )}

                        </View>


                        <View
                          style={
                            styles.actionRow
                          }
                        >

                          {isPublished && (

                            <ActionButton
                              icon={
                                <RotateCcw
                                  size={16}
                                  color="#725735"
                                />
                              }
                              label={
                                t(
                                  "myWritings.draft"
                                )
                              }
                              variant="warm"
                              loading={
                                isBusy
                              }
                              disabled={
                                isBusy
                              }
                              onPress={() =>
                                handleUnpublish(
                                  item
                                )
                              }
                            />

                          )}


                          <ActionButton
                            icon={
                              <Trash2
                                size={16}
                                color="#9B3D37"
                              />
                            }
                            label={
                              t(
                                "myWritings.delete"
                              )
                            }
                            variant="danger"
                            disabled={
                              isBusy
                            }
                            onPress={() =>
                              confirmDelete(
                                item
                              )
                            }
                          />

                        </View>

                      </>

                    )}

                  </View>

                </View>

              );

            }}

          />

        )}

      </View>


      {/* ====================================================
          EDIT MODAL
      ==================================================== */}

      <Modal
        visible={
          editing !==
          null
        }
        animationType="slide"
        transparent={false}
        onRequestClose={
          closeEdit
        }
      >

        <SafeAreaView
          style={
            styles.safeArea
          }
        >

          <ScrollView

            contentContainerStyle={
              styles.editContainer
            }

            keyboardShouldPersistTaps="handled"

            showsVerticalScrollIndicator={
              false
            }

          >

            <View
              style={
                styles.editHeader
              }
            >

              <View
                style={
                  styles.editHeaderText
                }
              >

                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  {t(
                    "myWritings.editEyebrow"
                  )}
                </Text>

                <Text
                  style={
                    styles.editHeading
                  }
                >
                  {t(
                    "myWritings.edit"
                  )}
                </Text>

              </View>


              <TouchableOpacity
                style={
                  styles.closeButton
                }
                activeOpacity={0.8}
                disabled={
                  savingEdit
                }
                onPress={
                  closeEdit
                }
              >

                <X
                  size={22}
                  color="#4F463E"
                />

              </TouchableOpacity>

            </View>


            {/* TITLE */}

            <Text
              style={
                styles.formLabel
              }
            >
              {
                t(
                  "myWritings.titleLabel"
                )
                  .toUpperCase()
              }
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                editTitle
              }
              onChangeText={
                setEditTitle
              }
              placeholder={
                t(
                  "myWritings.titlePlaceholder"
                )
              }
              placeholderTextColor="#AAA096"
              maxLength={200}
            />

            <Text
              style={
                styles.inputCounter
              }
            >
              {editTitle.length}/200
            </Text>


            {/* CATEGORY */}

            <Text
              style={
                styles.formLabel
              }
            >
              {
                t(
                  "myWritings.categoryLabel"
                )
                  .toUpperCase()
              }
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                editCategory
              }
              onChangeText={
                setEditCategory
              }
              placeholder={
                t(
                  "myWritings.categoryPlaceholder"
                )
              }
              placeholderTextColor="#AAA096"
            />


            {/* LANGUAGE */}

            <Text
              style={
                styles.formLabel
              }
            >
              {
                t(
                  "myWritings.languageCode"
                )
                  .toUpperCase()
              }
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                editLanguage
              }
              onChangeText={
                setEditLanguage
              }
              placeholder="bn"
              placeholderTextColor="#AAA096"
              autoCapitalize="none"
            />

            <Text
              style={
                styles.fieldHint
              }
            >
              {
                t(
                  "myWritings.currentLanguage"
                )
              }:{" "}
              {
                getLanguageLabel(
                  editLanguage
                )
              }
            </Text>


            {/* CONTENT */}

            <Text
              style={
                styles.formLabel
              }
            >
              {
                t(
                  "myWritings.contentLabel"
                )
                  .toUpperCase()
              }
            </Text>

            <TextInput
              style={
                styles.contentInput
              }
              value={
                editContent
              }
              onChangeText={
                setEditContent
              }
              placeholder={
                t(
                  "myWritings.contentPlaceholder"
                )
              }
              placeholderTextColor="#AAA096"
              multiline
              textAlignVertical="top"
            />


            <View
              style={
                styles.editStats
              }
            >

              <Text
                style={
                  styles.editStatText
                }
              >
                {
                  getWordCount(
                    editContent
                  )
                }{" "}
                {t(
                  "myWritings.words"
                )}
              </Text>

              <Text
                style={
                  styles.editStatText
                }
              >
                {
                  editContent.length
                }{" "}
                {t(
                  "myWritings.characters"
                )}
              </Text>

            </View>


            <TouchableOpacity

              style={[
                styles.saveButton,
                savingEdit &&
                styles.disabled,
              ]}

              activeOpacity={
                0.85
              }

              onPress={
                saveEdit
              }

              disabled={
                savingEdit
              }

            >

              {savingEdit ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              ) : (

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {t(
                    "myWritings.saveChanges"
                  )}
                </Text>

              )}

            </TouchableOpacity>

          </ScrollView>

        </SafeAreaView>

      </Modal>

    </SafeAreaView>

  );

}


// ==========================================================
// SUMMARY CARD
// ==========================================================

function SummaryCard({
  title,
  count,
  icon,
  active,
  fullWidth = false,
  onPress,
}: {
  title: string;
  count: number;
  icon: ReactNode;
  active: boolean;
  fullWidth?: boolean;
  onPress: () => void;
}) {

  return (

    <TouchableOpacity

      style={[
        styles.summaryCard,
        fullWidth &&
        styles.summaryCardWide,
        active &&
        styles.summaryCardActive,
      ]}

      activeOpacity={
        0.82
      }

      onPress={
        onPress
      }

    >

      <View
        style={
          styles.summaryIcon
        }
      >
        {icon}
      </View>

      <View
        style={
          styles.summaryText
        }
      >

        <Text
          style={
            styles.summaryTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.summaryCount
          }
        >
          {count}
        </Text>

      </View>

    </TouchableOpacity>

  );

}


// ==========================================================
// CHOICE CHIP
// ==========================================================

function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {

  return (

    <TouchableOpacity

      style={[
        styles.choiceChip,
        active &&
        styles.choiceChipActive,
      ]}

      activeOpacity={
        0.8
      }

      onPress={
        onPress
      }

    >

      <Text
        style={[
          styles.choiceChipText,
          active &&
          styles.choiceChipTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

    </TouchableOpacity>

  );

}


// ==========================================================
// FILTER BUTTON
// ==========================================================

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {

  return (

    <TouchableOpacity

      style={[
        styles.filterButton,
        active &&
        styles.filterButtonActive,
      ]}

      activeOpacity={0.8}

      onPress={
        onPress
      }

    >

      <Text
        style={[
          styles.filterText,
          active &&
          styles.filterTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

    </TouchableOpacity>

  );

}


// ==========================================================
// ACTION BUTTON
// ==========================================================

type ActionVariant =
  | "primary"
  | "secondary"
  | "warm"
  | "danger";


function ActionButton({
  icon,
  label,
  variant,
  loading = false,
  disabled = false,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  variant: ActionVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {

  const buttonStyle =
    variant === "primary"
      ? styles.primaryAction
      : variant === "warm"
        ? styles.warmAction
        : variant === "danger"
          ? styles.dangerAction
          : styles.secondaryAction;

  const textStyle =
    variant === "primary"
      ? styles.primaryActionText
      : variant === "warm"
        ? styles.warmActionText
        : variant === "danger"
          ? styles.dangerActionText
          : styles.secondaryActionText;


  return (

    <TouchableOpacity

      style={[
        styles.actionButton,
        buttonStyle,
        disabled &&
        styles.disabled,
      ]}

      activeOpacity={0.82}

      disabled={
        disabled
      }

      onPress={
        onPress
      }

    >

      {loading ? (

        <ActivityIndicator
          size="small"
          color={
            variant === "primary"
              ? "#FFFFFF"
              : "#725735"
          }
        />

      ) : (

        <>
          {icon}

          <Text
            style={[
              styles.actionButtonText,
              textStyle,
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
        </>

      )}

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
        "#FBFAF7",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#FBFAF7",
    },

    // ======================================================
    // HEADER
    // ======================================================

    header: {
      paddingTop: 22,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor:
        "#FBFAF7",
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.8,
      color: "#9A6C20",
    },

    heading: {
      marginTop: 8,
      fontSize: 34,
      lineHeight: 42,
      fontWeight: "700",
      color: "#211C18",
    },

    subtitle: {
      marginTop: 7,
      maxWidth: 560,
      fontSize: 13.5,
      lineHeight: 21,
      color: "#7B7167",
    },

    headerTop: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap: 12,
    },

    headerCopy: {
      flex: 1,
    },

    newWritingButton: {
      minHeight: 42,
      marginTop: 22,
      paddingHorizontal: 13,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      borderRadius: 10,
      backgroundColor:
        "#292522",
    },

    newWritingText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    summaryGrid: {
      marginTop: 20,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },

    summaryCard: {
      width: "48%",
      minHeight: 92,
      padding: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E4DBD1",
    },

    summaryCardWide: {
      width: "100%",
    },

    summaryCardActive: {
      borderColor:
        "#BE8A34",
      backgroundColor:
        "#FFFCF6",
    },

    summaryIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F5EFE5",
    },

    summaryText: {
      flex: 1,
    },

    summaryTitle: {
      fontSize: 11,
      fontWeight: "700",
      color: "#817468",
    },

    summaryCount: {
      marginTop: 3,
      fontSize: 26,
      lineHeight: 31,
      fontWeight: "800",
      color: "#241F1B",
    },

    searchBox: {
      minHeight: 50,
      marginTop: 16,
      paddingHorizontal: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DDD4CB",
    },

    searchInput: {
      flex: 1,
      paddingVertical: 0,
      fontSize: 13,
      color: "#302A25",
    },

    searchClear: {
      width: 30,
      height: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 15,
      backgroundColor:
        "#F3EEE8",
    },

    discoveryBlock: {
      marginTop: 14,
    },

    discoveryLabel: {
      marginBottom: 7,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
      color: "#9A8D80",
    },

    chipRow: {
      gap: 7,
      paddingRight: 12,
    },

    choiceChip: {
      minHeight: 36,
      paddingHorizontal: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 9,
      backgroundColor:
        "#F4EFE8",
      borderWidth: 1,
      borderColor:
        "#E4DBD1",
    },

    choiceChipActive: {
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#BE8A34",
    },

    choiceChipText: {
      fontSize: 10.5,
      fontWeight: "600",
      color: "#81766B",
    },

    choiceChipTextActive: {
      fontWeight: "800",
      color: "#805817",
    },

    resetButton: {
      minHeight: 42,
      marginTop: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      borderRadius: 10,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DDD4CB",
    },

    resetButtonText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#62564B",
    },

    resultCount: {
      marginTop: 12,
      fontSize: 10.5,
      fontWeight: "700",
      color: "#8C8175",
    },

    // ======================================================
    // FILTERS
    // ======================================================

    filters: {
      marginTop: 20,
      padding: 4,
      gap: 4,
      borderRadius: 12,
      backgroundColor:
        "#EFE8DE",
    },

    filterButton: {
      minWidth: 84,
      minHeight: 39,
      paddingHorizontal: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 9,
    },

    filterButtonActive: {
      backgroundColor:
        "#FFFFFF",
      shadowColor:
        "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 1,
    },

    filterText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#8A8075",
    },

    filterTextActive: {
      fontWeight: "800",
      color: "#805817",
    },

    // ======================================================
    // LIST
    // ======================================================

    loadingArea: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    list: {
      paddingTop: 2,
      paddingBottom: 0,
    },

    emptyList: {
      flexGrow: 1,
    },

    footerWrap: {
      width: "100%",
      marginTop: 18,
      marginBottom: 0,
    },

    // ======================================================
    // CARD
    // ======================================================

    card: {
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 16,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5DDD3",
      shadowColor:
        "#000000",
      shadowOpacity: 0.025,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 1,
    },

    cardTopRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap: 10,
    },

    badgeGroup: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap:
        "wrap",
      gap: 7,
    },

    statusBadge: {
      minHeight: 28,
      paddingHorizontal: 10,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 999,
      borderWidth: 1,
    },

    publishedBadge: {
      backgroundColor:
        "#EDF7EF",
      borderColor:
        "#C9E2CF",
    },

    draftBadge: {
      backgroundColor:
        "#FBF3E3",
      borderColor:
        "#E7D5AF",
    },

    deletedBadge: {
      backgroundColor:
        "#FFF0EE",
      borderColor:
        "#EBC9C5",
    },

    statusText: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    publishedStatusText: {
      color: "#47704D",
    },

    draftStatusText: {
      color: "#89611F",
    },

    deletedStatusText: {
      color: "#A0443D",
    },

    languageBadge: {
      minHeight: 28,
      paddingHorizontal: 9,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      borderRadius: 999,
      backgroundColor:
        "#FBF6EC",
      borderWidth: 1,
      borderColor:
        "#E6D4AA",
    },

    languageBadgeText: {
      maxWidth: 95,
      fontSize: 10,
      fontWeight: "600",
      color: "#76541D",
    },

    categoryBadge: {
      maxWidth: 95,
      minHeight: 28,
      paddingHorizontal: 10,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 999,
      backgroundColor:
        "#F8F5F0",
      borderWidth: 1,
      borderColor:
        "#E6DED4",
    },

    categoryBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#77695C",
    },

    cardTitle: {
      marginTop: 20,
      fontSize: 23,
      lineHeight: 31,
      fontWeight: "700",
      color: "#231E1A",
    },

    preview: {
      marginTop: 8,
      fontSize: 14.5,
      lineHeight: 23,
      color: "#74685E",
    },

    // ======================================================
    // META
    // ======================================================

    metaRow: {
      marginTop: 17,
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap:
        "wrap",
      rowGap: 8,
    },

    metaItem: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    metaText: {
      fontSize: 11,
      color: "#887B6F",
    },

    metaDivider: {
      width: 1,
      height: 14,
      marginHorizontal: 10,
      backgroundColor:
        "#D7CEC4",
    },

    // ======================================================
    // UPDATED
    // ======================================================

    updatedSection: {
      marginTop: 18,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        "#EEE7DF",
    },

    updatedLabel: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.7,
      textTransform:
        "uppercase",
      color: "#9A8E82",
    },

    updatedValue: {
      marginTop: 7,
      fontSize: 12,
      fontWeight: "600",
      color: "#62564B",
    },

    // ======================================================
    // ACTIONS
    // ======================================================

    actionsSection: {
      marginTop: 16,
      paddingTop: 15,
      gap: 9,
      borderTopWidth: 1,
      borderTopColor:
        "#EEE7DF",
    },

    actionRow: {
      flexDirection:
        "row",
      gap: 9,
    },

    actionButton: {
      flex: 1,
      minHeight: 46,
      paddingHorizontal: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      borderRadius: 10,
      borderWidth: 1,
    },

    actionButtonText: {
      flexShrink: 1,
      textAlign:
        "center",
      fontSize: 11.5,
      fontWeight: "700",
    },

    primaryAction: {
      backgroundColor:
        "#2B2723",
      borderColor:
        "#2B2723",
    },

    primaryActionText: {
      color: "#FFFFFF",
    },

    secondaryAction: {
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#DDD4CB",
    },

    secondaryActionText: {
      color: "#62564B",
    },

    warmAction: {
      backgroundColor:
        "#FBF3E3",
      borderColor:
        "#E8D7B7",
    },

    warmActionText: {
      color: "#725735",
    },

    dangerAction: {
      backgroundColor:
        "#FFF3F1",
      borderColor:
        "#ECCECB",
    },

    dangerActionText: {
      color: "#9B3D37",
    },

    disabled: {
      opacity: 0.5,
    },

    // ======================================================
    // EMPTY / ERROR
    // ======================================================

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    centerContent: {
      flex: 1,
      paddingHorizontal: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyState: {
      flex: 1,
      minHeight: 380,
      paddingHorizontal: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyIconCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor:
        "#F3EADF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 16,
      textAlign:
        "center",
      fontSize: 21,
      fontWeight: "700",
      color: "#2D2722",
    },

    emptyText: {
      marginTop: 8,
      maxWidth: 320,
      textAlign:
        "center",
      fontSize: 13.5,
      lineHeight: 21,
      color: "#786F66",
    },

    errorTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: "#332C26",
    },

    errorText: {
      marginTop: 8,
      textAlign:
        "center",
      lineHeight: 20,
      color: "#9A3F39",
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        "#292522",
    },

    retryText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    // ======================================================
    // EDIT MODAL
    // ======================================================

    editContainer: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 60,
    },

    editHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 16,
      marginBottom: 24,
    },

    editHeaderText: {
      flex: 1,
    },

    editHeading: {
      marginTop: 7,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700",
      color: "#25201C",
    },

    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#F0EAE3",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    formLabel: {
      marginTop: 18,
      marginBottom: 7,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: "#77695C",
    },

    input: {
      minHeight: 52,
      paddingHorizontal: 15,
      borderRadius: 10,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DDD3C8",
      fontSize: 15,
      color: "#29231E",
    },

    inputCounter: {
      marginTop: 6,
      textAlign:
        "right",
      fontSize: 10,
      color: "#9A9188",
    },

    fieldHint: {
      marginTop: 7,
      fontSize: 10,
      color: "#91857A",
    },

    contentInput: {
      minHeight: 280,
      padding: 16,
      borderRadius: 10,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DDD3C8",
      fontSize: 16,
      lineHeight: 25,
      color: "#29231E",
    },

    editStats: {
      marginTop: 8,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
    },

    editStatText: {
      fontSize: 10,
      color: "#978C82",
    },

    saveButton: {
      minHeight: 54,
      marginTop: 28,
      borderRadius: 10,
      backgroundColor:
        "#292522",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

  });
