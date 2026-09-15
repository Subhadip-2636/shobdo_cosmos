import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
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
  useSearchParams,
} from "react-router-dom";

import {
  getFollowingFeed,
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
// WRITING CATEGORY VALUES
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


  const initialContentMode =
    urlType ===
    "documents"
      ? "documents"
      : urlType ===
        "artworks"
        ? "artworks"
        : "writings";


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
  // =======================================================

  const [
    feedMode,
    setFeedMode,
  ] = useState(
    "all"
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
  // CURRENT CATEGORY OPTIONS
  // =======================================================

  const categoryOptions =
    contentMode ===
    "artworks"
      ? ARTWORK_CATEGORY_VALUES
      : WRITING_CATEGORY_VALUES;


  // =======================================================
  // CHANGE CONTENT MODE
  // =======================================================

  function changeContentMode(
    mode
  ) {

    if (
      mode ===
      contentMode
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

  useEffect(() => {

    const params =
      new URLSearchParams();


    // -----------------------------------------------------
    // CONTENT TYPE
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // FOLLOWING
    // -----------------------------------------------------

    if (
      contentMode ===
        "writings" &&
      feedMode ===
        "following"
    ) {

      setSearchParams(
        params,
        {
          replace: true,
        }
      );


      return;
    }


    // -----------------------------------------------------
    // WRITING SEARCH
    // -----------------------------------------------------

    if (
      contentMode ===
        "writings" &&
      submittedSearch
    ) {

      params.set(
        "search",
        submittedSearch
      );
    }


    // -----------------------------------------------------
    // LANGUAGE
    // -----------------------------------------------------

    if (
      language
    ) {

      params.set(
        "language",
        language
      );
    }


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (
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

  }, [
    contentMode,
    feedMode,
    submittedSearch,
    language,
    category,
    setSearchParams,
  ]);


  // =======================================================
  // LOAD CONTENT
  // =======================================================

  useEffect(() => {

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

              limit:
                12,

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
        // ARTWORKS
        // =================================================

        if (
          contentMode ===
          "artworks"
        ) {

          const data =
            await getArtworks({

              page,

              limit:
                12,

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
                    data?.data?.artworks
                  )
                  ? data.data.artworks
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

              limit:
                12,
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
              ) || page,

            pages:
              Number(
                data?.pages
              ) || 0,

            total:
              Number(
                data?.total
              ) || 0,

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
        // ALL WRITINGS
        // =================================================

        const data =
          await getWritings({

            page,

            limit:
              12,

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

  }, [
    contentMode,
    feedMode,
    page,
    submittedSearch,
    language,
    category,
    isLoggedIn,
    t,
  ]);


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


    setPage(
      1
    );


    setError(
      ""
    );


    if (
      mode ===
      "following"
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

            // ---------------------------------------------
            // OLDEST
            // ---------------------------------------------

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


            // ---------------------------------------------
            // TITLE
            // ---------------------------------------------

            if (
              sortBy ===
              "title"
            ) {

              return (
                (
                  a.title ||
                  ""
                )
                  .localeCompare(
                    b.title ||
                    ""
                  )
              );
            }


            // ---------------------------------------------
            // LATEST
            // ---------------------------------------------

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
      ]
    );


  // =======================================================
  // FILTER STATUS
  // =======================================================

  const hasActiveFilters =
    Boolean(

      (
        contentMode ===
          "writings" &&
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
        "documents found"
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


    return t(
      "explore.writingsFound",
      "writings found"
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

              {
                t(
                  "explore.eyebrow",
                  "DISCOVER"
                )
              }

            </span>

          </div>


          <h1>

            {
              t(
                "explore.title",
                "Explore SHOBDO"
              )
            }

          </h1>


          <p>

            {
              t(
                "explore.description",
                "Discover writings, PDF documents and artwork from the SHOBDO community."
              )
            }

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
            onClick={() =>
              changeContentMode(
                "writings"
              )
            }
          >

            <BookOpen
              size={18}
            />


            <span>

              {
                t(
                  "explore.writingsTab",
                  "Writings"
                )
              }

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
            onClick={() =>
              changeContentMode(
                "documents"
              )
            }
          >

            <FileText
              size={18}
            />


            <span>

              {
                t(
                  "explore.documentsTab",
                  "PDF Documents"
                )
              }

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
            onClick={() =>
              changeContentMode(
                "artworks"
              )
            }
          >

            <ImageIcon
              size={18}
            />


            <span>

              {
                t(
                  "explore.artworkTab",
                  "Artwork"
                )
              }

            </span>

          </button>

        </div>


        {/* =================================================
            WRITING FEED TABS
        ================================================== */}

        {contentMode ===
          "writings" && (

          <div
            className="explore-feed-tabs"
            role="tablist"
          >

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
              onClick={() =>
                changeFeed(
                  "all"
                )
              }
            >

              <BookOpen
                size={16}
              />


              {
                t(
                  "explore.allWritings",
                  "All Writings"
                )
              }

            </button>


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
              onClick={() =>
                changeFeed(
                  "following"
                )
              }
            >

              <Users
                size={16}
              />


              {
                t(
                  "explore.following",
                  "Following"
                )
              }

            </button>

          </div>

        )}


        {/* =================================================
            FOLLOWING NOTICE
        ================================================== */}

        {contentMode ===
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

        )}


        {/* =================================================
            DOCUMENT NOTICE
        ================================================== */}

        {contentMode ===
          "documents" && (

          <div
            className="explore-document-notice"
          >

            <FileText
              size={18}
            />


            <span>

              {
                t(
                  "explore.documentsDescription",
                  "Browse PDF books, essays, poetry collections and manuscripts published by the SHOBDO community."
                )
              }

            </span>

          </div>

        )}


        {/* =================================================
            ARTWORK NOTICE
        ================================================== */}

        {contentMode ===
          "artworks" && (

          <div
            className="explore-document-notice"
          >

            <ImageIcon
              size={18}
            />


            <span>

              {
                t(
                  "explore.artworksDescription",
                  "Discover paintings, illustrations, photography, sketches and digital artwork from SHOBDO creators."
                )
              }

            </span>

          </div>

        )}


        {/* =================================================
            WRITING SEARCH
        ================================================== */}

        {contentMode ===
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
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                t(
                  "explore.searchPlaceholder",
                  "Search poems, stories, topics or writers..."
                )
              }
            />


            {search && (

              <button
                type="button"
                className="explore-search-clear"
                onClick={
                  clearSearch
                }
              >

                <X
                  size={16}
                />

              </button>

            )}


            <button
              type="submit"
              className="explore-search-submit"
            >

              {
                t(
                  "explore.searchButton",
                  "Search"
                )
              }

            </button>

          </form>

        )}


        {/* =================================================
            FILTERS
        ================================================== */}

        {(
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
                onChange={(
                  event
                ) => {

                  setLanguage(
                    event.target.value
                  );


                  setPage(
                    1
                  );
                }}
              >

                <option
                  value=""
                >

                  {
                    t(
                      "explore.allLanguages",
                      "All Languages"
                    )
                  }

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
                          item.nativeName ===
                          item.name
                            ? item.name
                            : `${item.nativeName} — ${item.name}`
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
                onChange={(
                  event
                ) => {

                  setCategory(
                    event.target.value
                  );


                  setPage(
                    1
                  );
                }}
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
                          contentMode ===
                          "artworks"
                            ? (
                                item ||
                                t(
                                  "explore.allCategories",
                                  "All Categories"
                                )
                              )
                            : getWritingCategoryLabel(
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
                onChange={(
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
                  Latest
                </option>


                <option
                  value="oldest"
                >
                  Oldest First
                </option>


                <option
                  value="title"
                >
                  Title A-Z
                </option>

              </select>

            </div>


            {hasActiveFilters && (

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

                Clear Filters

              </button>

            )}

          </section>

        )}


        {/* =================================================
            RESULT SUMMARY
        ================================================== */}

        <div
          className="explore-result-summary"
        >

          <span>

            {totalResults}

            {" "}

            {
              getResultLabel()
            }

          </span>


          {contentMode ===
            "writings" &&
          submittedSearch && (

            <span
              className="explore-active-filter"
            >

              “{submittedSearch}”

            </span>

          )}


          {selectedLanguage && (

            <span
              className="explore-active-filter"
            >

              <Globe2
                size={11}
              />


              {
                selectedLanguage
                  .nativeName
              }

            </span>

          )}


          {category && (

            <span
              className="explore-active-filter"
            >

              {category}

            </span>

          )}

        </div>


        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (

          <div
            className="explore-loading"
          >

            <Loader2
              size={30}
              className="spin"
            />


            <p>

              {
                contentMode ===
                "documents"
                  ? "Loading PDF documents..."
                  : contentMode ===
                    "artworks"
                    ? "Loading artwork..."
                    : "Loading writings..."
              }

            </p>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================== */}

        {!loading &&
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
                  : (
                      <BookOpen
                        size={32}
                      />
                    )
            }


            <h2>
              Unable to load content
            </h2>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                window.location
                  .reload()
              }
            >
              Try Again
            </button>

          </section>

        )}


        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading &&
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
                    : (
                        <Search
                          size={32}
                        />
                      )
            }


            <h2>

              {
                contentMode ===
                "artworks"
                  ? "No artwork found"
                  : contentMode ===
                    "documents"
                    ? "No PDF documents found"
                    : feedMode ===
                      "following"
                      ? "Following feed is empty"
                      : "No writings found"
              }

            </h2>


            <p>

              {
                contentMode ===
                "artworks"
                  ? "Published public artwork will appear here."
                  : contentMode ===
                    "documents"
                    ? "Published public PDF documents will appear here."
                    : "Try another search term or change your filters."
              }

            </p>


            {hasActiveFilters && (

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                Clear Filters
              </button>

            )}

          </section>

        )}


        {/* =================================================
            WRITINGS GRID
        ================================================== */}

        {contentMode ===
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

        )}


        {/* =================================================
            DOCUMENT GRID
        ================================================== */}

        {contentMode ===
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

        )}


        {/* =================================================
            ARTWORK GRID
        ================================================== */}

        {contentMode ===
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

        )}


        {/* =================================================
            PAGINATION
        ================================================== */}

        {!loading &&
        !error &&
        pagination &&
        pagination.pages >
          1 && (

          <nav
            className="explore-pagination"
          >

            <button
              type="button"
              disabled={
                !pagination
                  .has_prev
              }
              onClick={() => {

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

              }}
            >
              Previous
            </button>


            <span>

              Page

              {" "}

              <strong>
                {
                  pagination.page
                }
              </strong>

              {" "}

              of

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
              onClick={() => {

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

              }}
            >
              Next
            </button>

          </nav>

        )}

      </div>

    </main>
  );
}


export default Explore;