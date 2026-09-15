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
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";

import DocumentCard
  from "../components/DocumentCard";


// =========================================================
// DATABASE CATEGORY VALUES
// =========================================================

const CATEGORY_VALUES = [
  "",
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
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
  // INITIAL VALUES
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


  const initialContentMode =
    searchParams.get(
      "type"
    ) === "documents"
      ? "documents"
      : "writings";


  // =======================================================
  // CONTENT MODE
  //
  // writings
  // documents
  // =======================================================

  const [
    contentMode,
    setContentMode,
  ] = useState(
    initialContentMode
  );


  // =======================================================
  // WRITING FEED MODE
  //
  // all
  // following
  // =======================================================

  const [
    feedMode,
    setFeedMode,
  ] = useState(
    "all"
  );


  // =======================================================
  // FILTER STATE
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
  // DATA STATE
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
  // CATEGORY LABEL
  // =======================================================

  function getCategoryLabel(
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


    setError(
      ""
    );


    setPage(
      1
    );


    setPagination(
      null
    );


    setSortBy(
      "latest"
    );


    if (
      mode ===
      "documents"
    ) {

      setFeedMode(
        "all"
      );
    }
  }


  // =======================================================
  // UPDATE URL
  // =======================================================

  useEffect(() => {

    const params =
      new URLSearchParams();


    // -----------------------------------------------------
    // DOCUMENT MODE
    // -----------------------------------------------------

    if (
      contentMode ===
      "documents"
    ) {

      params.set(
        "type",
        "documents"
      );


      setSearchParams(
        params,
        {
          replace: true,
        }
      );


      return;
    }


    // -----------------------------------------------------
    // FOLLOWING MODE
    // -----------------------------------------------------

    if (
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
    // WRITING FILTERS
    // -----------------------------------------------------

    if (
      submittedSearch
    ) {

      params.set(
        "search",
        submittedSearch
      );
    }


    if (
      language
    ) {

      params.set(
        "language",
        language
      );
    }


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
  // LOAD EXPLORE CONTENT
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
            });


          if (
            !mounted
          ) {
            return;
          }


          setDocuments(
            Array.isArray(
              data?.documents
            )
              ? data.documents
              : []
          );


          setWritings(
            []
          );


          setPagination(
            data?.pagination ||
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


    setError(
      ""
    );


    setPage(
      1
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
  // SEARCH
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

            // -----------------------------------------------
            // OLDEST FIRST
            // -----------------------------------------------

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


            // -----------------------------------------------
            // TITLE A-Z
            // -----------------------------------------------

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


            // -----------------------------------------------
            // LATEST FIRST
            // -----------------------------------------------

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
  // ACTIVE WRITING FILTERS
  // =======================================================

  const hasActiveFilters =
    Boolean(

      contentMode ===
        "writings" &&

      feedMode ===
        "all" &&

      (
        submittedSearch ||
        language ||
        category
      )
    );


  // =======================================================
  // SELECTED LANGUAGE
  // =======================================================

  const selectedLanguage =
    LANGUAGES.find(
      (item) =>
        item.code ===
        language
    );


  // =======================================================
  // TOTAL RESULTS
  // =======================================================

  const totalResults =
    pagination?.total ??
    sortedItems.length;


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
                "Discover writings and PDF documents from the SHOBDO community."
              )
            }

          </p>

        </header>


        {/* =================================================
            WRITINGS / PDF DOCUMENTS
        ================================================== */}

        <div
          className="explore-content-tabs"
          role="tablist"
          aria-label="Explore content type"
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


          {/* DOCUMENTS */}

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

        </div>


        {/* =================================================
            ALL WRITINGS / FOLLOWING

            Only shown for writing mode.
        ================================================== */}

        {contentMode ===
          "writings" && (

          <div
            className="explore-feed-tabs"
            role="tablist"
            aria-label="Explore writings"
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
              onClick={() =>
                changeFeed(
                  "all"
                )
              }
            >

              <BookOpen
                size={16}
              />


              <span>

                {
                  t(
                    "explore.allWritings",
                    "All Writings"
                  )
                }

              </span>

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
              onClick={() =>
                changeFeed(
                  "following"
                )
              }
            >

              <Users
                size={16}
              />


              <span>

                {
                  t(
                    "explore.following",
                    "Following"
                  )
                }

              </span>

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
                  "Browse PDF books, poems, essays, manuscripts and documents published by the SHOBDO community."
                )
              }

            </span>

          </div>

        )}


        {/* =================================================
            WRITING SEARCH

            Documents currently don't need text search.
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
              aria-label={
                t(
                  "common.search",
                  "Search"
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
            WRITING FILTER BAR
        ================================================== */}

        {contentMode ===
          "writings" &&
        feedMode ===
          "all" && (

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
                aria-label={
                  t(
                    "common.language",
                    "Language"
                  )
                }
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
                aria-label={
                  t(
                    "common.category",
                    "Category"
                  )
                }
              >

                {
                  CATEGORY_VALUES.map(
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
                onChange={(
                  event
                ) =>
                  setSortBy(
                    event.target.value
                  )
                }
                aria-label="Sort writings"
              >

                <option
                  value="latest"
                >

                  {
                    t(
                      "explore.latest",
                      "Latest"
                    )
                  }

                </option>


                <option
                  value="oldest"
                >

                  {
                    t(
                      "explore.oldest",
                      "Oldest First"
                    )
                  }

                </option>


                <option
                  value="title"
                >

                  {
                    t(
                      "explore.titleAZ",
                      "Title A-Z"
                    )
                  }

                </option>

              </select>

            </div>


            {/* CLEAR */}

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


                {
                  t(
                    "explore.clearFilters",
                    "Clear Filters"
                  )
                }

              </button>

            )}

          </section>

        )}


        {/* =================================================
            DOCUMENT SORT
        ================================================== */}

        {contentMode ===
          "documents" && (

          <section
            className="explore-filters"
          >

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
                aria-label="Sort documents"
              >

                <option
                  value="latest"
                >

                  {
                    t(
                      "explore.latest",
                      "Latest"
                    )
                  }

                </option>


                <option
                  value="oldest"
                >

                  {
                    t(
                      "explore.oldest",
                      "Oldest First"
                    )
                  }

                </option>


                <option
                  value="title"
                >

                  {
                    t(
                      "explore.titleAZ",
                      "Title A-Z"
                    )
                  }

                </option>

              </select>

            </div>

          </section>

        )}


        {/* =================================================
            RESULTS SUMMARY
        ================================================== */}

        <div
          className="explore-result-summary"
        >

          <span>

            {totalResults}

            {" "}

            {
              contentMode ===
              "documents"
                ? t(
                    "explore.documentsFound",
                    "documents found"
                  )
                : feedMode ===
                  "following"
                  ? t(
                      "explore.followingWritings",
                      "following writings"
                    )
                  : t(
                      "explore.writingsFound",
                      "writings found"
                    )
            }

          </span>


          {/* WRITING SEARCH CHIP */}

          {contentMode ===
            "writings" &&
          feedMode ===
            "all" &&
          submittedSearch && (

            <span
              className="explore-active-filter"
            >
              “{submittedSearch}”
            </span>

          )}


          {/* WRITING LANGUAGE CHIP */}

          {contentMode ===
            "writings" &&
          feedMode ===
            "all" &&
          selectedLanguage && (

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


          {/* WRITING CATEGORY CHIP */}

          {contentMode ===
            "writings" &&
          feedMode ===
            "all" &&
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
                  ? t(
                      "explore.loadingDocuments",
                      "Loading PDF documents..."
                    )
                  : t(
                      "explore.loading",
                      "Loading writings..."
                    )
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
              "documents"
                ? (
                    <FileText
                      size={30}
                    />
                  )
                : (
                    <BookOpen
                      size={30}
                    />
                  )
            }


            <h2>

              {
                contentMode ===
                "documents"
                  ? t(
                      "explore.documentLoadError",
                      "Unable to load PDF documents."
                    )
                  : t(
                      "explore.loadError",
                      "Unable to load writings."
                    )
              }

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

              {
                t(
                  "explore.retry",
                  "Try Again"
                )
              }

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
                        size={30}
                      />
                    )
            }


            <h2>

              {
                contentMode ===
                "documents"
                  ? t(
                      "explore.noDocuments",
                      "No PDF documents found"
                    )
                  : feedMode ===
                    "following"
                    ? isLoggedIn
                      ? t(
                          "explore.noFollowing",
                          "Your following feed is empty"
                        )
                      : t(
                          "explore.signInFollowingTitle",
                          "Sign in to view your following feed"
                        )
                    : t(
                        "explore.noResults",
                        "No writings found"
                      )
              }

            </h2>


            <p>

              {
                contentMode ===
                "documents"
                  ? t(
                      "explore.noDocumentsDescription",
                      "Published public PDF documents will appear here."
                    )
                  : feedMode ===
                    "following"
                    ? isLoggedIn
                      ? t(
                          "explore.noFollowingDescription",
                          "Follow writers and their published writings will appear here."
                        )
                      : t(
                          "explore.signInFollowing",
                          "Sign in to see writings from authors you follow."
                        )
                    : t(
                        "explore.noResultsDescription",
                        "Try another search term or change your filters."
                      )
              }

            </p>


            {hasActiveFilters && (

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >

                {
                  t(
                    "explore.clearFilters",
                    "Clear Filters"
                  )
                }

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
            PAGINATION
        ================================================== */}

        {!loading &&
        !error &&
        pagination &&
        pagination.pages >
          1 && (

          <nav
            className="explore-pagination"
            aria-label="Explore pages"
          >

            {/* PREVIOUS */}

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

              {
                t(
                  "explore.previous",
                  "Previous"
                )
              }

            </button>


            {/* PAGE NUMBER */}

            <span>

              {
                t(
                  "common.page",
                  "Page"
                )
              }

              {" "}


              <strong>

                {
                  pagination
                    .page
                }

              </strong>


              {" "}


              {
                t(
                  "common.of",
                  "of"
                )
              }


              {" "}


              {
                pagination
                  .pages
              }

            </span>


            {/* NEXT */}

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

              {
                t(
                  "explore.next",
                  "Next"
                )
              }

            </button>

          </nav>

        )}

      </div>

    </main>
  );
}


export default Explore;