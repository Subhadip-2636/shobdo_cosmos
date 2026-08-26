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
  X,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  getWritings,
} from "../api/api";

import {
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard from "../components/WritingCard";


// =========================================================
// DATABASE CATEGORY VALUES
// =========================================================
//
// Keep these values stable because they are stored in
// PostgreSQL and used by the backend filters.
// Only their visible labels are translated.
// =========================================================

const CATEGORY_VALUES = [
  "",
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
];


function Explore() {

  const {
    t,
  } = useLanguage();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  // =====================================================
  // INITIAL VALUES FROM URL
  // =====================================================

  const initialSearch =
    searchParams.get("search") || "";

  const initialLanguage =
    searchParams.get("language") || "";

  const initialCategory =
    searchParams.get("category") || "";


  // =====================================================
  // FILTER STATE
  // =====================================================

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
  ] = useState("latest");


  // =====================================================
  // DATA STATE
  // =====================================================

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


  // =====================================================
  // CATEGORY LABEL
  // =====================================================

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


  // =====================================================
  // UPDATE URL QUERY
  // =====================================================

  useEffect(() => {

    const params =
      new URLSearchParams();


    if (submittedSearch) {

      params.set(
        "search",
        submittedSearch
      );

    }


    if (language) {

      params.set(
        "language",
        language
      );

    }


    if (category) {

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
    submittedSearch,
    language,
    category,
    setSearchParams,
  ]);


  // =====================================================
  // LOAD WRITINGS
  // =====================================================

  useEffect(() => {

    let mounted = true;


    async function loadWritings() {

      setLoading(true);
      setError("");


      try {

        const data =
          await getWritings({
            page,
            limit: 12,

            search:
              submittedSearch,

            language,

            category,
          });


        if (!mounted) {
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
          data?.pagination || null
        );


      } catch (err) {

        console.error(
          "EXPLORE ERROR:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err.message ||
          t(
            "explore.loadError"
          )
        );


      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadWritings();


    return () => {

      mounted = false;

    };

  }, [
    page,
    submittedSearch,
    language,
    category,
    t,
  ]);


  // =====================================================
  // SEARCH
  // =====================================================

  function handleSearch(
    event
  ) {

    event.preventDefault();

    setPage(1);

    setSubmittedSearch(
      search.trim()
    );

  }


  // =====================================================
  // CLEAR SEARCH INPUT
  // =====================================================

  function clearSearch() {

    setSearch("");

    setSubmittedSearch("");

    setPage(1);

  }


  // =====================================================
  // RESET FILTERS
  // =====================================================

  function resetFilters() {

    setSearch("");

    setSubmittedSearch("");

    setLanguage("");

    setCategory("");

    setSortBy("latest");

    setPage(1);

  }


  // =====================================================
  // CLIENT-SIDE SORT
  // =====================================================
  //
  // Backend currently handles filtering and pagination.
  // Sort is applied to the current page only.
  // =====================================================

  const sortedWritings =
    useMemo(() => {

      const result = [
        ...writings,
      ];


      result.sort(
        (
          a,
          b
        ) => {

          // OLD -> NEW

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


          // TITLE A-Z

          if (
            sortBy ===
            "title"
          ) {

            return (
              (
                a.title || ""
              )
                .localeCompare(
                  b.title || ""
                )
            );

          }


          // NEW -> OLD

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

    }, [
      writings,
      sortBy,
    ]);


  // =====================================================
  // ACTIVE FILTERS
  // =====================================================

  const hasActiveFilters =
    Boolean(
      submittedSearch ||
      language ||
      category
    );


  // =====================================================
  // SELECTED LANGUAGE
  // =====================================================

  const selectedLanguage =
    LANGUAGES.find(
      (item) =>
        item.code ===
        language
    );


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="explore-page">

      <div className="explore-shell">


        {/* ===============================================
            HERO
        ================================================ */}

        <header className="explore-hero">

          <div className="explore-eyebrow">

            <BookOpen size={16} />

            <span>
              {t(
                "explore.eyebrow"
              )}
            </span>

          </div>


          <h1>
            {t(
              "explore.title"
            )}
          </h1>


          <p>
            {t(
              "explore.description"
            )}
          </p>

        </header>


        {/* ===============================================
            SEARCH
        ================================================ */}

        <form
          className="explore-search"
          onSubmit={
            handleSearch
          }
        >

          <Search size={18} />


          <input
            type="search"

            value={search}

            onChange={(event) =>
              setSearch(
                event.target.value
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

              <X size={16} />

            </button>

          )}


          <button
            type="submit"
            className="explore-search-submit"
          >

            {t(
              "explore.searchButton"
            )}

          </button>

        </form>


        {/* ===============================================
            FILTER BAR
        ================================================ */}

        <section className="explore-filters">


          {/* LANGUAGE */}

          <div className="explore-filter-control">

            <Globe2 size={16} />


            <select
              value={language}

              onChange={(event) => {

                setLanguage(
                  event.target.value
                );

                setPage(1);

              }}

              aria-label={
                t(
                  "common.language"
                )
              }
            >

              <option value="">

                {t(
                  "explore.allLanguages"
                )}

              </option>


              {
                LANGUAGES.map(
                  (item) => (

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
                          : (
                            `${item.nativeName} — ${item.name}`
                          )
                      }

                    </option>

                  )
                )
              }

            </select>

          </div>


          {/* CATEGORY */}

          <div className="explore-filter-control">

            <Filter size={16} />


            <select
              value={category}

              onChange={(event) => {

                setCategory(
                  event.target.value
                );

                setPage(1);

              }}

              aria-label={
                t(
                  "common.category"
                )
              }
            >

              {
                CATEGORY_VALUES.map(
                  (item) => (

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

          <div className="explore-filter-control">

            <SlidersHorizontal
              size={16}
            />


            <select
              value={sortBy}

              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }

              aria-label="Sort writings"
            >

              <option value="latest">

                {t(
                  "explore.latest"
                )}

              </option>


              <option value="oldest">

                {t(
                  "explore.oldest"
                )}

              </option>


              <option value="title">

                {t(
                  "explore.titleAZ"
                )}

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

              <X size={15} />

              {t(
                "explore.clearFilters"
              )}

            </button>

          )}

        </section>


        {/* ===============================================
            RESULTS SUMMARY
        ================================================ */}

        <div className="explore-result-summary">

          <span>

            {
              pagination?.total ??
              sortedWritings.length
            }

            {" "}

            {t(
              "explore.writingsFound"
            )}

          </span>


          {/* SEARCH CHIP */}

          {submittedSearch && (

            <span className="explore-active-filter">

              “{submittedSearch}”

            </span>

          )}


          {/* LANGUAGE CHIP */}

          {selectedLanguage && (

            <span className="explore-active-filter">

              <Globe2 size={11} />

              {
                selectedLanguage.nativeName
              }

            </span>

          )}


          {/* CATEGORY CHIP */}

          {category && (

            <span className="explore-active-filter">

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

          <div className="explore-loading">

            <Loader2
              size={30}
              className="spin"
            />

            <p>
              {t(
                "explore.loading"
              )}
            </p>

          </div>

        )}


        {/* ===============================================
            ERROR
        ================================================ */}

        {!loading &&
        error && (

          <section className="explore-state">

            <h2>
              {t(
                "explore.loadError"
              )}
            </h2>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >

              {t(
                "explore.retry"
              )}

            </button>

          </section>

        )}


        {/* ===============================================
            EMPTY
        ================================================ */}

        {!loading &&
        !error &&
        sortedWritings.length === 0 && (

          <section className="explore-state">

            <Search size={30} />


            <h2>
              {t(
                "explore.noResults"
              )}
            </h2>


            <p>
              {t(
                "explore.noResultsDescription"
              )}
            </p>


            {hasActiveFilters && (

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >

                {t(
                  "explore.clearFilters"
                )}

              </button>

            )}

          </section>

        )}


        {/* ===============================================
            WRITING GRID
        ================================================ */}

        {!loading &&
        !error &&
        sortedWritings.length > 0 && (

          <section className="explore-writing-grid">

            {
              sortedWritings.map(
                (writing) => (

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
        pagination.pages > 1 && (

          <nav
            className="explore-pagination"
            aria-label="Explore pages"
          >

            <button
              type="button"

              disabled={
                !pagination.has_prev
              }

              onClick={() => {

                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                );


                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });

              }}
            >

              {t(
                "explore.previous"
              )}

            </button>


            <span>

              {t(
                "common.page"
              )}

              {" "}

              <strong>
                {pagination.page}
              </strong>

              {" "}

              {t(
                "common.of"
              )}

              {" "}

              {pagination.pages}

            </span>


            <button
              type="button"

              disabled={
                !pagination.has_next
              }

              onClick={() => {

                setPage(
                  (current) =>
                    current + 1
                );


                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });

              }}
            >

              {t(
                "explore.next"
              )}

            </button>

          </nav>

        )}

      </div>

    </main>
  );

}


export default Explore;