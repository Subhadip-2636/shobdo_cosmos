import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
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
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";


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
  // INITIAL VALUES FROM URL
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


  // =======================================================
  // FEED MODE
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
  // CURRENT AUTH STATE
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
          "explore.allCategories"
        ),

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
      value
    );

  }


  // =======================================================
  // UPDATE URL QUERY
  // =======================================================

  useEffect(() => {

    /*
     * The Following feed does not use Explore search
     * parameters, so keep the URL clean in Following mode.
     */

    if (
      feedMode ===
      "following"
    ) {

      setSearchParams(
        {},
        {
          replace: true,
        }
      );

      return;

    }


    const params =
      new URLSearchParams();


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
    feedMode,
    submittedSearch,
    language,
    category,
    setSearchParams,
  ]);


  // =======================================================
  // LOAD WRITINGS
  // =======================================================

  useEffect(() => {

    let mounted = true;


    async function loadWritings() {

      setLoading(true);
      setError("");


      try {

        let data;


        // ---------------------------------------------------
        // FOLLOWING
        // ---------------------------------------------------

        if (
          feedMode ===
          "following"
        ) {

          /*
           * Do not make an authenticated request if
           * there is no local JWT.
           */

          if (
            !isLoggedIn
          ) {

            if (
              mounted
            ) {

              setWritings(
                []
              );

              setPagination(
                null
              );

            }


            return;

          }


          data =
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


        // ---------------------------------------------------
        // ALL WRITINGS
        // ---------------------------------------------------

        data =
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


        setPagination(
          data?.pagination ||
          null
        );


      } catch (
        err
      ) {

        console.error(
          "EXPLORE ERROR:",
          err
        );


        if (
          !mounted
        ) {
          return;
        }


        setWritings(
          []
        );


        setPagination(
          null
        );


        setError(
          err?.message ||
          t(
            "explore.loadError"
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


    loadWritings();


    return () => {

      mounted =
        false;

    };

  }, [
    page,
    submittedSearch,
    language,
    category,
    feedMode,
    isLoggedIn,
    t,
  ]);


  // =======================================================
  // CHANGE FEED
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

      /*
       * Following-feed endpoint currently supports
       * pagination only, so clear Explore-only filters.
       */

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
  // CLIENT-SIDE SORT
  // =======================================================

  const sortedWritings =
    useMemo(
      () => {

        const result = [
          ...writings,
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
        writings,
        sortBy,
      ]
    );


  // =======================================================
  // ACTIVE FILTERS
  // =======================================================

  const hasActiveFilters =
    Boolean(
      submittedSearch ||
      language ||
      category
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
  // RESULT TOTAL
  // =======================================================

  const totalResults =
    pagination?.total ??
    sortedWritings.length;


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


        {/* ===============================================
            HERO
        ================================================ */}

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
                  "explore.eyebrow"
                )
              }
            </span>

          </div>


          <h1>

            {
              t(
                "explore.title"
              )
            }

          </h1>


          <p>

            {
              t(
                "explore.description"
              )
            }

          </p>

        </header>


        {/* ===============================================
            ALL WRITINGS / FOLLOWING
        ================================================ */}

        <div
          className="explore-feed-tabs"
          role="tablist"
          aria-label="Explore feed"
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

            <span>
              {
                t(
                  "explore.allWritings"
                )
              }
            </span>

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

            <span>
              {
                t(
                  "explore.following"
                )
              }
            </span>

          </button>

        </div>


        {/* ===============================================
            FOLLOWING DESCRIPTION
        ================================================ */}

        {feedMode ===
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
                      "explore.followingDescription"
                    )
                  : t(
                      "explore.signInFollowing"
                    )
              }

            </span>

          </div>

        )}


        {/* ===============================================
            SEARCH + FILTERS

            Only relevant to All Writings.
        ================================================ */}

        {feedMode ===
          "all" && (

          <>

            {/* ===========================================
                SEARCH
            ============================================ */}

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
                    event
                      .target
                      .value
                  )
                }

                placeholder={
                  t(
                    "explore.searchPlaceholder"
                  )
                }

                aria-label={
                  t(
                    "common.search"
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
                      "common.clear"
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
                    "explore.searchButton"
                  )
                }

              </button>

            </form>


            {/* ===========================================
                FILTER BAR
            ============================================ */}

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
                      event
                        .target
                        .value
                    );

                    setPage(
                      1
                    );

                  }}

                  aria-label={
                    t(
                      "common.language"
                    )
                  }

                >

                  <option
                    value=""
                  >

                    {
                      t(
                        "explore.allLanguages"
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
                      event
                        .target
                        .value
                    );

                    setPage(
                      1
                    );

                  }}

                  aria-label={
                    t(
                      "common.category"
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
                      event
                        .target
                        .value
                    )
                  }

                  aria-label="Sort writings"

                >

                  <option
                    value="latest"
                  >

                    {
                      t(
                        "explore.latest"
                      )
                    }

                  </option>


                  <option
                    value="oldest"
                  >

                    {
                      t(
                        "explore.oldest"
                      )
                    }

                  </option>


                  <option
                    value="title"
                  >

                    {
                      t(
                        "explore.titleAZ"
                      )
                    }

                  </option>

                </select>

              </div>


              {/* RESET */}

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
                      "explore.clearFilters"
                    )
                  }

                </button>

              )}

            </section>

          </>

        )}


        {/* ===============================================
            RESULTS SUMMARY
        ================================================ */}

        <div
          className="explore-result-summary"
        >

          <span>

            {totalResults}

            {" "}

            {
              feedMode ===
              "following"
                ? t(
                    "explore.followingWritings"
                  )
                : t(
                    "explore.writingsFound"
                  )
            }

          </span>


          {/* SEARCH CHIP */}

          {feedMode ===
            "all" &&
          submittedSearch && (

            <span
              className="explore-active-filter"
            >

              “{submittedSearch}”

            </span>

          )}


          {/* LANGUAGE CHIP */}

          {feedMode ===
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


          {/* CATEGORY CHIP */}

          {feedMode ===
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


        {/* ===============================================
            LOADING
        ================================================ */}

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
                t(
                  "explore.loading"
                )
              }

            </p>

          </div>

        )}


        {/* ===============================================
            ERROR
        ================================================ */}

        {!loading &&
        error && (

          <section
            className="explore-state"
          >

            <BookOpen
              size={30}
            />


            <h2>

              {
                t(
                  "explore.loadError"
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
                  "explore.retry"
                )
              }

            </button>

          </section>

        )}


        {/* ===============================================
            EMPTY
        ================================================ */}

        {!loading &&
        !error &&
        sortedWritings.length ===
          0 && (

          <section
            className="explore-state"
          >

            {
              feedMode ===
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
                feedMode ===
                "following"
                  ? isLoggedIn
                    ? t(
                        "explore.noFollowing"
                      )
                    : t(
                        "explore.signInFollowingTitle"
                      )
                  : t(
                      "explore.noResults"
                    )
              }

            </h2>


            <p>

              {
                feedMode ===
                "following"
                  ? isLoggedIn
                    ? t(
                        "explore.noFollowingDescription"
                      )
                    : t(
                        "explore.signInFollowing"
                      )
                  : t(
                      "explore.noResultsDescription"
                    )
              }

            </p>


            {feedMode ===
              "all" &&
            hasActiveFilters && (

              <button

                type="button"

                onClick={
                  resetFilters
                }

              >

                {
                  t(
                    "explore.clearFilters"
                  )
                }

              </button>

            )}

          </section>

        )}


        {/* ===============================================
            WRITING GRID
        ================================================ */}

        {!loading &&
        !error &&
        sortedWritings.length >
          0 && (

          <section
            className="explore-writing-grid"
          >

            {
              sortedWritings.map(
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


        {/* ===============================================
            PAGINATION
        ================================================ */}

        {!loading &&
        !error &&
        pagination &&
        pagination.pages >
          1 && (

          <nav

            className="explore-pagination"

            aria-label="Explore pages"

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

              {
                t(
                  "explore.previous"
                )
              }

            </button>


            <span>

              {
                t(
                  "common.page"
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
                  "common.of"
                )
              }

              {" "}

              {
                pagination
                  .pages
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

              {
                t(
                  "explore.next"
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