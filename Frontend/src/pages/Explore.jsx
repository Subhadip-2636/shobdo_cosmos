import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Bookmark,
  FileText,
  Filter,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getFollowingFeed,
  getSavedWritings,
  getToken,
  getWritings,
} from "../api/api";

import {
  getDocuments,
} from "../api/documents";

import {
  getArtworks,
} from "../api/artworks";

import {
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";

import DocumentCard
  from "../components/DocumentCard";

import ArtworkCard
  from "../components/ArtworkCard";


// =========================================================
// WRITING / DOCUMENT CATEGORY VALUES
// =========================================================

const WRITING_CATEGORY_VALUES = [
  "",
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
];


// =========================================================
// ARTWORK CATEGORY VALUES
// =========================================================

const ARTWORK_CATEGORY_VALUES = [
  "",
  "Digital Art",
  "Painting",
  "Sketch",
  "Illustration",
  "Photography",
  "Calligraphy",
  "Other",
];


// =========================================================
// EXPLORE PAGE
// =========================================================

function Explore() {

  const {
    t,
  } = useLanguage();


  const navigate =
    useNavigate();


  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  // =======================================================
  // INITIAL URL VALUES
  // =======================================================

  const initialSearch =
    searchParams.get(
      "search"
    ) || "";


  const initialLanguage =
    searchParams.get(
      "language"
    ) || "";


  const initialCategory =
    searchParams.get(
      "category"
    ) || "";


  const urlType =
    searchParams.get(
      "type"
    );


  const urlFeed =
    searchParams.get(
      "feed"
    );


  const initialContentMode =
    urlType === "documents"
      ? "documents"
      : urlType === "artworks"
        ? "artworks"
        : "writings";


  const initialFeedMode =
    urlFeed === "following"
      ? "following"
      : urlFeed === "saved"
        ? "saved"
        : "all";


  // =======================================================
  // CONTENT TYPE
  //
  // writings
  // documents
  // artworks
  // =======================================================

  const [
    contentMode,
    setContentMode,
  ] = useState(
    initialContentMode
  );


  // =======================================================
  // WRITING FEED
  //
  // all
  // following
  // saved
  // =======================================================

  const [
    feedMode,
    setFeedMode,
  ] = useState(
    initialFeedMode
  );


  // =======================================================
  // FILTERS
  // =======================================================

  const [
    search,
    setSearch,
  ] = useState(
    initialSearch
  );


  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState(
    initialSearch
  );


  const [
    language,
    setLanguage,
  ] = useState(
    initialLanguage
  );


  const [
    category,
    setCategory,
  ] = useState(
    initialCategory
  );


  const [
    sortBy,
    setSortBy,
  ] = useState(
    "latest"
  );


  // =======================================================
  // DATA
  // =======================================================

  const [
    writings,
    setWritings,
  ] = useState([]);


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    artworks,
    setArtworks,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    page,
    setPage,
  ] = useState(1);


  const [
    pagination,
    setPagination,
  ] = useState(null);


  // =======================================================
  // AUTH
  // =======================================================

  const isLoggedIn =
    Boolean(
      getToken()
    );


  // =======================================================
  // WRITING CATEGORY LABEL
  // =======================================================

  function getWritingCategoryLabel(
    value
  ) {

    const map = {

      "":
        t(
          "explore.allCategories",
          "All Categories"
        ),

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
      value
    );

  }


  // =======================================================
  // ARTWORK CATEGORY LABEL
  // =======================================================

  function getArtworkCategoryLabel(
    value
  ) {

    const map = {

      "":
        t(
          "explore.allCategories",
          "All Categories"
        ),

      "Digital Art":
        t(
          "explore.digitalArt",
          "Digital Art"
        ),

      Painting:
        t(
          "explore.painting",
          "Painting"
        ),

      Sketch:
        t(
          "explore.sketch",
          "Sketch"
        ),

      Illustration:
        t(
          "explore.illustration",
          "Illustration"
        ),

      Photography:
        t(
          "explore.photography",
          "Photography"
        ),

      Calligraphy:
        t(
          "explore.calligraphy",
          "Calligraphy"
        ),

      Other:
        t(
          "explore.otherArtwork",
          "Other"
        ),
    };


    return (
      map[value] ||
      value
    );

  }


  // =======================================================
  // CATEGORY LABEL
  // =======================================================

  function getCategoryLabel(
    value
  ) {

    if (
      contentMode ===
      "artworks"
    ) {

      return getArtworkCategoryLabel(
        value
      );

    }


    return getWritingCategoryLabel(
      value
    );

  }


  // =======================================================
  // LANGUAGE LABEL
  // =======================================================

  function getLanguageLabel(
    code,
    fallbackItem = null
  ) {

    const normalized =
      String(
        code || ""
      )
        .trim()
        .toLowerCase();


    const map = {

      bn:
        t(
          "explore.languageBengali",
          "Bengali"
        ),

      en:
        t(
          "explore.languageEnglish",
          "English"
        ),

      hi:
        t(
          "explore.languageHindi",
          "Hindi"
        ),

      as:
        t(
          "explore.languageAssamese",
          "Assamese"
        ),

      or:
        t(
          "explore.languageOdia",
          "Odia"
        ),

      ta:
        t(
          "explore.languageTamil",
          "Tamil"
        ),

      te:
        t(
          "explore.languageTelugu",
          "Telugu"
        ),
    };


    if (
      map[normalized]
    ) {

      return map[
        normalized
      ];

    }


    if (
      fallbackItem
    ) {

      return (
        fallbackItem.nativeName ||
        fallbackItem.name ||
        normalized.toUpperCase()
      );

    }


    return normalized.toUpperCase();

  }


  // =======================================================
  // CURRENT CATEGORY OPTIONS
  // =======================================================

  const categoryOptions =
    contentMode === "artworks"
      ? ARTWORK_CATEGORY_VALUES
      : WRITING_CATEGORY_VALUES;


  // =======================================================
  // CHANGE CONTENT TYPE
  // =======================================================

  function changeContentMode(
    mode
  ) {

    if (
      mode === contentMode
    ) {

      return;

    }


    setContentMode(
      mode
    );


    setFeedMode(
      "all"
    );


    setSearch(
      ""
    );


    setSubmittedSearch(
      ""
    );


    setLanguage(
      ""
    );


    setCategory(
      ""
    );


    setSortBy(
      "latest"
    );


    setPage(
      1
    );


    setPagination(
      null
    );


    setError(
      ""
    );

  }


  // =======================================================
  // UPDATE URL
  // =======================================================

  useEffect(
    () => {

      const params =
        new URLSearchParams();


      // ---------------------------------------------------
      // CONTENT TYPE
      // ---------------------------------------------------

      if (
        contentMode ===
        "documents"
      ) {

        params.set(
          "type",
          "documents"
        );

      }


      if (
        contentMode ===
        "artworks"
      ) {

        params.set(
          "type",
          "artworks"
        );

      }


      // ---------------------------------------------------
      // WRITING FEED
      // ---------------------------------------------------

      if (
        contentMode ===
        "writings" &&
        feedMode ===
        "following"
      ) {

        params.set(
          "feed",
          "following"
        );

      }


      if (
        contentMode ===
        "writings" &&
        feedMode ===
        "saved"
      ) {

        params.set(
          "feed",
          "saved"
        );

      }


      // ---------------------------------------------------
      // SEARCH/FILTERS ONLY FOR ALL WRITINGS
      // ---------------------------------------------------

      if (
        contentMode ===
        "writings" &&
        feedMode ===
        "all" &&
        submittedSearch
      ) {

        params.set(
          "search",
          submittedSearch
        );

      }


      if (
        (
          contentMode !== "writings" ||
          feedMode === "all"
        ) &&
        language
      ) {

        params.set(
          "language",
          language
        );

      }


      if (
        (
          contentMode !== "writings" ||
          feedMode === "all"
        ) &&
        category
      ) {

        params.set(
          "category",
          category
        );

      }


      setSearchParams(
        params,
        {
          replace: true,
        }
      );

    },
    [
      contentMode,
      feedMode,
      submittedSearch,
      language,
      category,
      setSearchParams,
    ]
  );


  // =======================================================
  // LOAD CONTENT
  // =======================================================

  useEffect(
    () => {

      let mounted =
        true;


      async function loadContent() {

        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          // =================================================
          // DOCUMENTS
          // =================================================

          if (
            contentMode ===
            "documents"
          ) {

            const data =
              await getDocuments({
                page,
                limit: 12,
                language,
                category,
              });


            if (
              !mounted
            ) {

              return;

            }


            const items =
              Array.isArray(
                data?.documents
              )
                ? data.documents
                : [];


            setDocuments(
              items
            );


            setWritings(
              []
            );


            setArtworks(
              []
            );


            setPagination(
              data?.pagination ||
              null
            );


            return;

          }


          // =================================================
          // ARTWORK
          // =================================================

          if (
            contentMode ===
            "artworks"
          ) {

            const data =
              await getArtworks({
                page,
                limit: 12,
                language,
                category,
              });


            if (
              !mounted
            ) {

              return;

            }


            const items =
              Array.isArray(
                data?.artworks
              )
                ? data.artworks
                : Array.isArray(
                    data?.items
                  )
                  ? data.items
                  : Array.isArray(
                      data?.data
                        ?.artworks
                    )
                    ? data.data
                        .artworks
                    : [];


            setArtworks(
              items
            );


            setWritings(
              []
            );


            setDocuments(
              []
            );


            setPagination(
              data?.pagination ||
              data?.data?.pagination ||
              null
            );


            return;

          }


          // =================================================
          // FOLLOWING WRITINGS
          // =================================================

          if (
            feedMode ===
            "following"
          ) {

            if (
              !isLoggedIn
            ) {

              if (
                mounted
              ) {

                setWritings(
                  []
                );

                setDocuments(
                  []
                );

                setArtworks(
                  []
                );

                setPagination(
                  null
                );

              }


              return;

            }


            const data =
              await getFollowingFeed({
                page,
                limit: 12,
              });


            if (
              !mounted
            ) {

              return;

            }


            setWritings(
              Array.isArray(
                data?.writings
              )
                ? data.writings
                : []
            );


            setDocuments(
              []
            );


            setArtworks(
              []
            );


            setPagination({
              page:
                Number(
                  data?.page
                ) ||
                page,

              pages:
                Number(
                  data?.pages
                ) ||
                0,

              total:
                Number(
                  data?.total
                ) ||
                0,

              has_prev:
                Boolean(
                  data?.has_prev
                ),

              has_next:
                Boolean(
                  data?.has_next
                ),
            });


            return;

          }


          // =================================================
          // SAVED WRITINGS
          // =================================================

          if (
            feedMode ===
            "saved"
          ) {

            if (
              !isLoggedIn
            ) {

              if (
                mounted
              ) {

                setWritings(
                  []
                );

                setDocuments(
                  []
                );

                setArtworks(
                  []
                );

                setPagination(
                  null
                );

              }


              return;

            }


            const data =
              await getSavedWritings({
                page,
                perPage: 12,
              });


            if (
              !mounted
            ) {

              return;

            }


            const savedItems =
              Array.isArray(
                data?.saved_writings
              )
                ? data.saved_writings
                : [];


            const savedWritings =
              savedItems
                .map(
                  (
                    item
                  ) => {

                    if (
                      !item?.writing
                    ) {

                      return null;

                    }


                    return {
                      ...item.writing,

                      // WritingCard can immediately
                      // render this as saved.
                      is_saved:
                        true,

                      saved_by_current_user:
                        true,

                      saved_at:
                        item.saved_at,
                    };

                  }
                )
                .filter(
                  Boolean
                );


            setWritings(
              savedWritings
            );


            setDocuments(
              []
            );


            setArtworks(
              []
            );


            setPagination(
              data?.pagination ||
              null
            );


            return;

          }


          // =================================================
          // ALL WRITINGS
          // =================================================

          const data =
            await getWritings({
              page,
              limit: 12,
              search:
                submittedSearch,
              language,
              category,
            });


          if (
            !mounted
          ) {

            return;

          }


          setWritings(
            Array.isArray(
              data?.writings
            )
              ? data.writings
              : []
          );


          setDocuments(
            []
          );


          setArtworks(
            []
          );


          setPagination(
            data?.pagination ||
            null
          );


        } catch (
          requestError
        ) {

          console.error(
            "EXPLORE ERROR:",
            requestError
          );


          if (
            !mounted
          ) {

            return;

          }


          setWritings(
            []
          );


          setDocuments(
            []
          );


          setArtworks(
            []
          );


          setPagination(
            null
          );


          setError(
            requestError?.message ||
            t(
              "explore.loadError",
              "Unable to load content."
            )
          );


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


      loadContent();


      return () => {

        mounted =
          false;

      };

    },
    [
      contentMode,
      feedMode,
      page,
      submittedSearch,
      language,
      category,
      isLoggedIn,
      t,
    ]
  );


  // =======================================================
  // CHANGE WRITING FEED
  // =======================================================

  function changeFeed(
    mode
  ) {

    if (
      mode ===
      feedMode
    ) {

      return;

    }


    // -----------------------------------------------------
    // LOGIN REQUIRED
    // -----------------------------------------------------

    if (
      (
        mode ===
          "following" ||
        mode ===
          "saved"
      ) &&
      !isLoggedIn
    ) {

      navigate(
        "/login"
      );

      return;

    }


    setPage(
      1
    );


    setError(
      ""
    );


    // -----------------------------------------------------
    // PERSONAL FEEDS DON'T USE GLOBAL FILTERS
    // -----------------------------------------------------

    if (
      mode ===
        "following" ||
      mode ===
        "saved"
    ) {

      setSearch(
        ""
      );


      setSubmittedSearch(
        ""
      );


      setLanguage(
        ""
      );


      setCategory(
        ""
      );


      setSortBy(
        "latest"
      );

    }


    setFeedMode(
      mode
    );

  }


  // =======================================================
  // SEARCH WRITINGS
  // =======================================================

  function handleSearch(
    event
  ) {

    event.preventDefault();


    if (
      contentMode !==
        "writings" ||
      feedMode !==
        "all"
    ) {

      return;

    }


    setPage(
      1
    );


    setSubmittedSearch(
      search.trim()
    );

  }


  // =======================================================
  // CLEAR SEARCH
  // =======================================================

  function clearSearch() {

    setSearch(
      ""
    );


    setSubmittedSearch(
      ""
    );


    setPage(
      1
    );

  }


  // =======================================================
  // RESET FILTERS
  // =======================================================

  function resetFilters() {

    setSearch(
      ""
    );


    setSubmittedSearch(
      ""
    );


    setLanguage(
      ""
    );


    setCategory(
      ""
    );


    setSortBy(
      "latest"
    );


    setPage(
      1
    );

  }


  // =======================================================
  // CURRENT ITEMS
  // =======================================================

  const currentItems =
    contentMode ===
    "documents"
      ? documents
      : contentMode ===
        "artworks"
        ? artworks
        : writings;


  // =======================================================
  // SORT
  // =======================================================

  const sortedItems =
    useMemo(
      () => {

        const result = [
          ...currentItems,
        ];


        result.sort(
          (
            a,
            b
          ) => {

            if (
              sortBy ===
              "oldest"
            ) {

              return (
                new Date(
                  a.published_at ||
                  a.created_at ||
                  0
                )
                -
                new Date(
                  b.published_at ||
                  b.created_at ||
                  0
                )
              );

            }


            if (
              sortBy ===
              "title"
            ) {

              return String(
                a.title || ""
              ).localeCompare(
                String(
                  b.title || ""
                )
              );

            }


            // -------------------------------------------------
            // SAVED MODE:
            // newest saved item first if saved_at exists
            // -------------------------------------------------

            if (
              feedMode ===
              "saved"
            ) {

              return (
                new Date(
                  b.saved_at ||
                  b.published_at ||
                  b.created_at ||
                  0
                )
                -
                new Date(
                  a.saved_at ||
                  a.published_at ||
                  a.created_at ||
                  0
                )
              );

            }


            return (
              new Date(
                b.published_at ||
                b.created_at ||
                0
              )
              -
              new Date(
                a.published_at ||
                a.created_at ||
                0
              )
            );

          }
        );


        return result;

      },
      [
        currentItems,
        sortBy,
        feedMode,
      ]
    );


  // =======================================================
  // ACTIVE FILTERS
  // =======================================================

  const hasActiveFilters =
    Boolean(
      (
        contentMode ===
          "writings" &&
        feedMode ===
          "all" &&
        submittedSearch
      )
      ||
      language
      ||
      category
    );


  // =======================================================
  // SELECTED LANGUAGE
  // =======================================================

  const selectedLanguage =
    LANGUAGES.find(
      (
        item
      ) =>
        item.code ===
        language
    );


  // =======================================================
  // RESULT COUNT
  // =======================================================

  const totalResults =
    pagination?.total ??
    sortedItems.length;


  // =======================================================
  // RESULT LABEL
  // =======================================================

  function getResultLabel() {

    if (
      contentMode ===
      "documents"
    ) {

      return t(
        "explore.documentsFound",
        "PDF documents found"
      );

    }


    if (
      contentMode ===
      "artworks"
    ) {

      return t(
        "explore.artworksFound",
        "artworks found"
      );

    }


    if (
      feedMode ===
      "following"
    ) {

      return t(
        "explore.followingWritings",
        "following writings"
      );

    }


    if (
      feedMode ===
      "saved"
    ) {

      return t(
        "explore.savedWritingsFound",
        "saved writings"
      );

    }


    return t(
      "explore.writingsFound",
      "writings found"
    );

  }


  // =======================================================
  // EMPTY TITLE
  // =======================================================

  function getEmptyTitle() {

    if (
      contentMode ===
      "artworks"
    ) {

      return t(
        "explore.noArtwork",
        "No artwork found"
      );

    }


    if (
      contentMode ===
      "documents"
    ) {

      return t(
        "explore.noDocuments",
        "No PDF documents found"
      );

    }


    if (
      feedMode ===
      "following"
    ) {

      if (
        !isLoggedIn
      ) {

        return t(
          "explore.signInFollowingTitle",
          "Sign in required"
        );

      }


      return t(
        "explore.followingEmpty",
        "Following feed is empty"
      );

    }


    if (
      feedMode ===
      "saved"
    ) {

      if (
        !isLoggedIn
      ) {

        return t(
          "explore.signInSavedTitle",
          "Sign in required"
        );

      }


      return t(
        "explore.savedEmpty",
        "No saved writings yet"
      );

    }


    return t(
      "explore.noResultsTitle",
      "No writings found"
    );

  }


  // =======================================================
  // EMPTY DESCRIPTION
  // =======================================================

  function getEmptyDescription() {

    if (
      contentMode ===
      "artworks"
    ) {

      return t(
        "explore.noArtworkDescription",
        "Published public artwork will appear here."
      );

    }


    if (
      contentMode ===
      "documents"
    ) {

      return t(
        "explore.noDocumentsDescription",
        "Published public PDF documents will appear here."
      );

    }


    if (
      feedMode ===
      "following"
    ) {

      if (
        !isLoggedIn
      ) {

        return t(
          "explore.signInFollowing",
          "Sign in to see writings from authors you follow."
        );

      }


      return t(
        "explore.followingEmptyDescription",
        "New writings from authors you follow will appear here."
      );

    }


    if (
      feedMode ===
      "saved"
    ) {

      if (
        !isLoggedIn
      ) {

        return t(
          "explore.signInSaved",
          "Sign in to view your saved writings."
        );

      }


      return t(
        "explore.savedEmptyDescription",
        "Use the bookmark button on a writing to save it for later."
      );

    }


    return t(
      "explore.noResultsDescription",
      "Try another search term, category or language."
    );

  }


  // =======================================================
  // LOADING TEXT
  // =======================================================

  function getLoadingText() {

    if (
      contentMode ===
      "documents"
    ) {

      return t(
        "explore.loadingDocuments",
        "Loading PDF documents..."
      );

    }


    if (
      contentMode ===
      "artworks"
    ) {

      return t(
        "explore.loadingArtwork",
        "Loading artwork..."
      );

    }


    if (
      feedMode ===
      "following"
    ) {

      return t(
        "explore.loadingFollowing",
        "Loading writings from authors you follow..."
      );

    }


    if (
      feedMode ===
      "saved"
    ) {

      return t(
        "explore.loadingSaved",
        "Loading your saved writings..."
      );

    }


    return t(
      "explore.loading",
      "Loading writings..."
    );

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="explore-page"
    >

      <div
        className="explore-shell"
      >


        {/* =================================================
            HERO
        ================================================== */}

        <header
          className="explore-hero"
        >

          <div
            className="explore-eyebrow"
          >

            <BookOpen
              size={16}
            />

            <span>

              {t(
                "explore.eyebrow",
                "DISCOVER"
              )}

            </span>

          </div>


          <h1>

            {t(
              "explore.title",
              "Explore SHOBDO"
            )}

          </h1>


          <p>

            {t(
              "explore.description",
              "Discover writings, PDF documents and artwork from the SHOBDO community."
            )}

          </p>

        </header>


        {/* =================================================
            MAIN CONTENT TABS
        ================================================== */}

        <div
          className="explore-content-tabs"
          role="tablist"
          aria-label="Explore content"
        >

          {/* WRITINGS */}

          <button
            type="button"
            role="tab"
            aria-selected={
              contentMode ===
              "writings"
            }
            className={
              contentMode ===
              "writings"
                ? "explore-content-tab active"
                : "explore-content-tab"
            }
            onClick={
              () =>
                changeContentMode(
                  "writings"
                )
            }
          >

            <BookOpen
              size={18}
            />

            <span>

              {t(
                "explore.writingsTab",
                "Writings"
              )}

            </span>

          </button>


          {/* PDF DOCUMENTS */}

          <button
            type="button"
            role="tab"
            aria-selected={
              contentMode ===
              "documents"
            }
            className={
              contentMode ===
              "documents"
                ? "explore-content-tab active"
                : "explore-content-tab"
            }
            onClick={
              () =>
                changeContentMode(
                  "documents"
                )
            }
          >

            <FileText
              size={18}
            />

            <span>

              {t(
                "explore.documentsTab",
                "PDF Documents"
              )}

            </span>

          </button>


          {/* ARTWORK */}

          <button
            type="button"
            role="tab"
            aria-selected={
              contentMode ===
              "artworks"
            }
            className={
              contentMode ===
              "artworks"
                ? "explore-content-tab active"
                : "explore-content-tab"
            }
            onClick={
              () =>
                changeContentMode(
                  "artworks"
                )
            }
          >

            <ImageIcon
              size={18}
            />

            <span>

              {t(
                "explore.artworkTab",
                "Artwork"
              )}

            </span>

          </button>

        </div>


        {/* =================================================
            WRITING FEED TABS
        ================================================== */}

        {
          contentMode ===
            "writings" && (

            <div
              className="explore-feed-tabs"
              role="tablist"
              aria-label="Writing feed"
            >


              {/* ALL WRITINGS */}

              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                  "all"
                }
                className={
                  feedMode ===
                  "all"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "all"
                    )
                }
              >

                <BookOpen
                  size={16}
                />

                {t(
                  "explore.allWritings",
                  "All Writings"
                )}

              </button>


              {/* FOLLOWING */}

              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                  "following"
                }
                className={
                  feedMode ===
                  "following"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "following"
                    )
                }
              >

                <Users
                  size={16}
                />

                {t(
                  "explore.following",
                  "Following"
                )}

              </button>


              {/* SAVED */}

              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                  "saved"
                }
                className={
                  feedMode ===
                  "saved"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "saved"
                    )
                }
              >

                <Bookmark
                  size={16}
                  fill={
                    feedMode ===
                    "saved"
                      ? "currentColor"
                      : "none"
                  }
                />

                {t(
                  "explore.saved",
                  "Saved"
                )}

              </button>

            </div>

          )
        }


        {/* =================================================
            FOLLOWING NOTICE
        ================================================== */}

        {
          contentMode ===
            "writings" &&
          feedMode ===
            "following" && (

            <div
              className="explore-following-notice"
            >

              <Users
                size={17}
              />

              <span>

                {
                  isLoggedIn
                    ? t(
                        "explore.followingDescription",
                        "Recent writings from authors you follow."
                      )
                    : t(
                        "explore.signInFollowing",
                        "Sign in to see writings from authors you follow."
                      )
                }

              </span>

            </div>

          )
        }


        {/* =================================================
            SAVED NOTICE
        ================================================== */}

        {
          contentMode ===
            "writings" &&
          feedMode ===
            "saved" && (

            <div
              className="explore-following-notice explore-saved-notice"
            >

              <Bookmark
                size={17}
              />

              <span>

                {
                  isLoggedIn
                    ? t(
                        "explore.savedDescription",
                        "Your private collection of bookmarked writings."
                      )
                    : t(
                        "explore.signInSaved",
                        "Sign in to view your saved writings."
                      )
                }

              </span>

            </div>

          )
        }


        {/* =================================================
            DOCUMENT NOTICE
        ================================================== */}

        {
          contentMode ===
            "documents" && (

            <div
              className="explore-document-notice"
            >

              <FileText
                size={18}
              />

              <span>

                {t(
                  "explore.documentsDescription",
                  "Browse PDF books, essays, poetry collections and manuscripts published by the SHOBDO community."
                )}

              </span>

            </div>

          )
        }


        {/* =================================================
            ARTWORK NOTICE
        ================================================== */}

        {
          contentMode ===
            "artworks" && (

            <div
              className="explore-document-notice"
            >

              <ImageIcon
                size={18}
              />

              <span>

                {t(
                  "explore.artworksDescription",
                  "Discover paintings, illustrations, photography, sketches and digital artwork from SHOBDO creators."
                )}

              </span>

            </div>

          )
        }


        {/* =================================================
            WRITING SEARCH
        ================================================== */}

        {
          contentMode ===
            "writings" &&
          feedMode ===
            "all" && (

            <form
              className="explore-search"
              onSubmit={
                handleSearch
              }
            >

              <Search
                size={18}
              />


              <input
                type="search"
                value={
                  search
                }
                onChange={
                  (
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                }
                placeholder={
                  t(
                    "explore.searchPlaceholder",
                    "Search poems, stories, topics or authors..."
                  )
                }
              />


              {
                search && (

                  <button
                    type="button"
                    className="explore-search-clear"
                    onClick={
                      clearSearch
                    }
                    aria-label={
                      t(
                        "common.clear",
                        "Clear"
                      )
                    }
                  >

                    <X
                      size={16}
                    />

                  </button>

                )
              }


              <button
                type="submit"
                className="explore-search-submit"
              >

                {t(
                  "explore.searchButton",
                  "Search"
                )}

              </button>

            </form>

          )
        }


        {/* =================================================
            FILTERS

            Filters are intentionally hidden from Following
            and Saved feeds.
        ================================================== */}

        {
          (
            contentMode !==
              "writings" ||
            feedMode ===
              "all"
          ) && (

            <section
              className="explore-filters"
            >


              {/* LANGUAGE */}

              <div
                className="explore-filter-control"
              >

                <Globe2
                  size={16}
                />


                <select
                  value={
                    language
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setLanguage(
                        event.target.value
                      );

                      setPage(
                        1
                      );

                    }
                  }
                >

                  <option
                    value=""
                  >

                    {t(
                      "explore.allLanguages",
                      "All Languages"
                    )}

                  </option>


                  {
                    LANGUAGES.map(
                      (
                        item
                      ) => (

                        <option
                          key={
                            item.code
                          }
                          value={
                            item.code
                          }
                        >

                          {
                            getLanguageLabel(
                              item.code,
                              item
                            )
                          }

                        </option>

                      )
                    )
                  }

                </select>

              </div>


              {/* CATEGORY */}

              <div
                className="explore-filter-control"
              >

                <Filter
                  size={16}
                />


                <select
                  value={
                    category
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setCategory(
                        event.target.value
                      );

                      setPage(
                        1
                      );

                    }
                  }
                >

                  {
                    categoryOptions.map(
                      (
                        item
                      ) => (

                        <option
                          key={
                            item ||
                            "all"
                          }
                          value={
                            item
                          }
                        >

                          {
                            getCategoryLabel(
                              item
                            )
                          }

                        </option>

                      )
                    )
                  }

                </select>

              </div>


              {/* SORT */}

              <div
                className="explore-filter-control"
              >

                <SlidersHorizontal
                  size={16}
                />


                <select
                  value={
                    sortBy
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSortBy(
                        event.target.value
                      )
                  }
                >

                  <option
                    value="latest"
                  >

                    {t(
                      "explore.latest",
                      "Latest"
                    )}

                  </option>


                  <option
                    value="oldest"
                  >

                    {t(
                      "explore.oldest",
                      "Oldest First"
                    )}

                  </option>


                  <option
                    value="title"
                  >

                    {t(
                      "explore.titleAZ",
                      "Title A-Z"
                    )}

                  </option>

                </select>

              </div>


              {/* RESET */}

              {
                hasActiveFilters && (

                  <button
                    type="button"
                    className="explore-reset-button"
                    onClick={
                      resetFilters
                    }
                  >

                    <X
                      size={15}
                    />

                    {t(
                      "explore.clearFilters",
                      "Clear Filters"
                    )}

                  </button>

                )
              }

            </section>

          )
        }


        {/* =================================================
            RESULT SUMMARY
        ================================================== */}

        <div
          className="explore-result-summary"
        >

          <span>

            {totalResults}

            {" "}

            {getResultLabel()}

          </span>


          {
            contentMode ===
              "writings" &&
            feedMode ===
              "all" &&
            submittedSearch && (

              <span
                className="explore-active-filter"
              >

                “{submittedSearch}”

              </span>

            )
          }


          {
            selectedLanguage && (

              <span
                className="explore-active-filter"
              >

                <Globe2
                  size={11}
                />

                {
                  getLanguageLabel(
                    selectedLanguage.code,
                    selectedLanguage
                  )
                }

              </span>

            )
          }


          {
            category && (

              <span
                className="explore-active-filter"
              >

                {
                  getCategoryLabel(
                    category
                  )
                }

              </span>

            )
          }

        </div>


        {/* =================================================
            LOADING
        ================================================== */}

        {
          loading && (

            <div
              className="explore-loading"
            >

              <Loader2
                size={30}
                className="spin"
              />

              <p>
                {getLoadingText()}
              </p>

            </div>

          )
        }


        {/* =================================================
            ERROR
        ================================================== */}

        {
          !loading &&
          error && (

            <section
              className="explore-state"
            >

              {
                contentMode ===
                "artworks"
                  ? (
                      <ImageIcon
                        size={32}
                      />
                    )
                  : contentMode ===
                    "documents"
                    ? (
                        <FileText
                          size={32}
                        />
                      )
                    : feedMode ===
                      "saved"
                      ? (
                          <Bookmark
                            size={32}
                          />
                        )
                      : (
                          <BookOpen
                            size={32}
                          />
                        )
              }


              <h2>

                {t(
                  "explore.loadContentError",
                  "Unable to load content"
                )}

              </h2>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  () =>
                    window.location
                      .reload()
                }
              >

                {t(
                  "explore.retry",
                  "Try Again"
                )}

              </button>

            </section>

          )
        }


        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {
          !loading &&
          !error &&
          sortedItems.length ===
            0 && (

            <section
              className="explore-state"
            >

              {
                contentMode ===
                "artworks"
                  ? (
                      <ImageIcon
                        size={32}
                      />
                    )
                  : contentMode ===
                    "documents"
                    ? (
                        <FileText
                          size={32}
                        />
                      )
                    : feedMode ===
                      "following"
                      ? (
                          <Users
                            size={32}
                          />
                        )
                      : feedMode ===
                        "saved"
                        ? (
                            <Bookmark
                              size={34}
                            />
                          )
                        : (
                            <Search
                              size={32}
                            />
                          )
              }


              <h2>
                {getEmptyTitle()}
              </h2>


              <p>
                {getEmptyDescription()}
              </p>


              {
                hasActiveFilters && (

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                  >

                    {t(
                      "explore.clearFilters",
                      "Clear Filters"
                    )}

                  </button>

                )
              }

            </section>

          )
        }


        {/* =================================================
            WRITINGS GRID
        ================================================== */}

        {
          contentMode ===
            "writings" &&
          !loading &&
          !error &&
          sortedItems.length >
            0 && (

            <section
              className="explore-writing-grid"
            >

              {
                sortedItems.map(
                  (
                    writing
                  ) => (

                    <WritingCard
                      key={
                        writing.id
                      }
                      writing={
                        writing
                      }
                    />

                  )
                )
              }

            </section>

          )
        }


        {/* =================================================
            DOCUMENT GRID
        ================================================== */}

        {
          contentMode ===
            "documents" &&
          !loading &&
          !error &&
          sortedItems.length >
            0 && (

            <section
              className="explore-document-grid"
            >

              {
                sortedItems.map(
                  (
                    document
                  ) => (

                    <DocumentCard
                      key={
                        document.id
                      }
                      document={
                        document
                      }
                    />

                  )
                )
              }

            </section>

          )
        }


        {/* =================================================
            ARTWORK GRID
        ================================================== */}

        {
          contentMode ===
            "artworks" &&
          !loading &&
          !error &&
          sortedItems.length >
            0 && (

            <section
              className="explore-artwork-grid"
            >

              {
                sortedItems.map(
                  (
                    artwork
                  ) => (

                    <ArtworkCard
                      key={
                        artwork.id
                      }
                      artwork={
                        artwork
                      }
                    />

                  )
                )
              }

            </section>

          )
        }


        {/* =================================================
            PAGINATION
        ================================================== */}

        {
          !loading &&
          !error &&
          pagination &&
          pagination.pages >
            1 && (

            <nav
              className="explore-pagination"
              aria-label="Explore pagination"
            >

              <button
                type="button"
                disabled={
                  !pagination
                    .has_prev
                }
                onClick={
                  () => {

                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    );


                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });

                  }
                }
              >

                {t(
                  "explore.previous",
                  "Previous"
                )}

              </button>


              <span>

                {t(
                  "explore.page",
                  "Page"
                )}

                {" "}

                <strong>
                  {
                    pagination.page
                  }
                </strong>

                {" "}

                {t(
                  "explore.of",
                  "of"
                )}

                {" "}

                {
                  pagination.pages
                }

              </span>


              <button
                type="button"
                disabled={
                  !pagination
                    .has_next
                }
                onClick={
                  () => {

                    setPage(
                      (
                        current
                      ) =>
                        current + 1
                    );


                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });

                  }
                }
              >

                {t(
                  "explore.next",
                  "Next"
                )}

              </button>

            </nav>

          )
        }


      </div>

    </main>

  );

}


export default Explore;