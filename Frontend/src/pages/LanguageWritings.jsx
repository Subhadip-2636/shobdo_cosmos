import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Feather,
  Globe2,
  Loader2,
  Search,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getWritings,
} from "../api/api";

import {
  getLanguageByCode,
  isSupportedLanguage,
} from "../config/languages";

import WritingCard from "../components/WritingCard";


function LanguageWritings() {

  const { code } =
    useParams();


  // =====================================================
  // LANGUAGE
  // =====================================================

  const validLanguage =
    isSupportedLanguage(code);

  const language =
    useMemo(
      () =>
        validLanguage
          ? getLanguageByCode(code)
          : null,
      [
        code,
        validLanguage,
      ]
    );


  // =====================================================
  // STATE
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
    search,
    setSearch,
  ] = useState("");

  const [
    submittedSearch,
    setSubmittedSearch,
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
  // LOAD WRITINGS
  // =====================================================

  useEffect(() => {

    if (!validLanguage) {

      setLoading(false);

      return;

    }


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

            language:
              code,
          });


        if (!mounted) {
          return;
        }


        setWritings(
          data?.writings || []
        );


        setPagination(
          data?.pagination || null
        );


      } catch (err) {

        console.error(
          "LANGUAGE WRITINGS ERROR:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err.message ||
          "লেখাগুলো লোড করা যায়নি।"
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
    code,
    page,
    submittedSearch,
    validLanguage,
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
  // INVALID LANGUAGE
  // =====================================================

  if (!validLanguage) {

    return (
      <main className="language-writings-page">

        <div className="language-writings-shell">

          <section className="language-not-found">

            <Globe2 size={34} />

            <h1>
              Language not found
            </h1>

            <p>
              এই ভাষাটি বর্তমানে
              SHOBDO-তে সমর্থিত নয়।
            </p>

            <Link
              to="/languages"
              className="language-back-button"
            >

              <ArrowLeft size={17} />

              সব ভাষা দেখুন

            </Link>

          </section>

        </div>

      </main>
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="language-writings-page">

      <div className="language-writings-shell">


        {/* ===============================================
            BACK
        ================================================ */}

        <Link
          to="/languages"
          className="language-page-back"
        >

          <ArrowLeft size={16} />

          Languages

        </Link>


        {/* ===============================================
            HERO
        ================================================ */}

        <header className="language-community-hero">

          <div className="language-community-icon">

            <Globe2 size={25} />

          </div>


          <div>

            <div className="language-community-eyebrow">

              LANGUAGE COMMUNITY

            </div>


            <h1>

              {language.nativeName}

            </h1>


            <div className="language-community-name">

              {language.name}

            </div>


            <p>

              {language.nativeName} ভাষায়
              প্রকাশিত গল্প, কবিতা,
              অনুভূতি ও অন্যান্য লেখা
              আবিষ্কার করুন।

            </p>

          </div>

        </header>


        {/* ===============================================
            TOOLBAR
        ================================================ */}

        <section className="language-toolbar">

          <form
            className="language-search"
            onSubmit={
              handleSearch
            }
          >

            <Search size={17} />


            <input
              type="search"

              value={search}

              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }

              placeholder={
                `${language.nativeName} লেখায় খুঁজুন...`
              }

              aria-label={
                `Search ${language.name} writings`
              }
            />


            <button
              type="submit"
            >
              Search
            </button>

          </form>


          <div className="language-result-count">

            <BookOpen size={16} />

            <span>

              {
                pagination?.total ??
                writings.length
              }

              {" "}

              writings

            </span>

          </div>

        </section>


        {/* ===============================================
            ACTIVE SEARCH
        ================================================ */}

        {submittedSearch && (

          <div className="language-search-info">

            Results for

            <strong>
              “{submittedSearch}”
            </strong>


            <button
              type="button"
              onClick={() => {

                setSearch("");

                setSubmittedSearch("");

                setPage(1);

              }}
            >
              Clear
            </button>

          </div>

        )}


        {/* ===============================================
            ERROR
        ================================================ */}

        {error && (

          <section className="language-state-card">

            <Globe2 size={27} />

            <h2>
              লেখা লোড করা যায়নি
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
              আবার চেষ্টা করুন
            </button>

          </section>

        )}


        {/* ===============================================
            LOADING
        ================================================ */}

        {!error && loading && (

          <section className="language-loading">

            <Loader2
              size={28}
              className="spin"
            />

            <span>
              লেখা লোড হচ্ছে...
            </span>

          </section>

        )}


        {/* ===============================================
            EMPTY
        ================================================ */}

        {
          !error &&
          !loading &&
          writings.length === 0 &&
          (
            <section className="language-empty">

              <div className="language-empty-icon">

                <Feather size={28} />

              </div>


              <h2>

                {submittedSearch
                  ? "কোনো লেখা পাওয়া যায়নি"
                  : (
                    `${language.nativeName} ভাষায় এখনো কোনো প্রকাশিত লেখা নেই`
                  )
                }

              </h2>


              <p>

                {submittedSearch
                  ? (
                    "অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।"
                  )
                  : (
                    "এই ভাষার প্রথম লেখকদের একজন হয়ে আপনার গল্প, কবিতা বা ভাবনা প্রকাশ করুন।"
                  )
                }

              </p>


              {!submittedSearch && (

                <Link
                  to="/write"
                  className="language-write-cta"
                >

                  <Feather size={17} />

                  লেখা শুরু করুন

                </Link>

              )}

            </section>
          )
        }


        {/* ===============================================
            WRITING GRID
        ================================================ */}

        {
          !error &&
          !loading &&
          writings.length > 0 &&
          (
            <section className="language-writing-grid">

              {
                writings.map(
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
          )
        }


        {/* ===============================================
            PAGINATION
        ================================================ */}

        {
          !loading &&
          !error &&
          pagination &&
          pagination.pages > 1 &&
          (
            <nav
              className="language-pagination"
              aria-label="Writing pages"
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

                <ArrowLeft size={16} />

                Previous

              </button>


              <span>

                Page

                {" "}

                <strong>
                  {pagination.page}
                </strong>

                {" "}

                of

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

                Next

                <ArrowRight size={16} />

              </button>

            </nav>
          )
        }


        {/* ===============================================
            BOTTOM CTA
        ================================================ */}

        <section className="language-community-cta">

          <div>

            <span>
              CONTRIBUTE
            </span>

            <h2>
              {language.nativeName} ভাষায় লিখুন
            </h2>

            <p>
              আপনার ভাষা, আপনার অভিজ্ঞতা,
              আপনার কণ্ঠ — SHOBDO-তে
              প্রকাশ করুন।
            </p>

          </div>


          <Link
            to="/write"
            className="language-community-write"
          >

            লেখা শুরু করুন

            <ArrowRight size={17} />

          </Link>

        </section>

      </div>

    </main>
  );

}


export default LanguageWritings;