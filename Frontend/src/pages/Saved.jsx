import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bookmark,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getSavedWritings,
} from "../api/api";

import WritingCard from "../components/WritingCard";

import {
  useLanguage,
} from "../Language/LanguageContext";


function Saved() {

  // =====================================================
  // LANGUAGE
  // =====================================================

  const {
    t,
  } = useLanguage();


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
    hasError,
    setHasError,
  ] = useState(false);


  // =====================================================
  // LOAD SAVED WRITINGS
  // =====================================================

  const loadSavedWritings =
    useCallback(
      async () => {

        setLoading(true);

        setHasError(false);


        try {

          const data =
            await getSavedWritings({
              page: 1,
              perPage: 50,
            });


          const items =
            Array.isArray(
              data?.saved_writings
            )
              ? data.saved_writings
              : [];


          const extractedWritings =
            items
              .map(
                (item) =>
                  item?.writing
              )
              .filter(Boolean);


          setWritings(
            extractedWritings
          );


        } catch (error) {

          console.error(
            "LOAD SAVED WRITINGS ERROR:",
            error
          );


          setHasError(true);


        } finally {

          setLoading(false);

        }

      },
      []
    );


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(
    () => {

      loadSavedWritings();

    },
    [
      loadSavedWritings,
    ]
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <main className="saved-page">

        <div className="saved-page-container">

          <div
            className="saved-page-status"
            role="status"
            aria-live="polite"
          >

            <LoaderCircle
              className="saved-page-spinner"
              size={34}
              aria-hidden="true"
            />


            <h2>
              {
                t(
                  "savedWritings.loading"
                )
              }
            </h2>

          </div>

        </div>

      </main>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (hasError) {

    return (

      <main className="saved-page">

        <div className="saved-page-container">

          <div
            className="saved-page-status"
            role="alert"
          >

            <Bookmark
              size={38}
              aria-hidden="true"
            />


            <h2>
              {
                t(
                  "savedWritings.loadError"
                )
              }
            </h2>


            <p>
              {
                t(
                  "savedWritings.loadErrorDescription"
                )
              }
            </p>


            <button
              type="button"
              className="saved-page-refresh"
              onClick={
                loadSavedWritings
              }
            >

              <RefreshCw
                size={17}
                aria-hidden="true"
              />


              <span>
                {
                  t(
                    "savedWritings.retry"
                  )
                }
              </span>

            </button>

          </div>

        </div>

      </main>

    );

  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <main className="saved-page">

      <div className="saved-page-container">


        {/* =============================================
            HEADER
        ============================================== */}

        <header className="saved-page-header">

          <div
            className="saved-page-heading-icon"
            aria-hidden="true"
          >

            <Bookmark
              size={26}
            />

          </div>


          <div>

            <h1>

              {
                t(
                  "savedWritings.title"
                )
              }

            </h1>


            <p>

              {
                t(
                  "savedWritings.subtitle"
                )
              }

            </p>

          </div>

        </header>


        {/* =============================================
            EMPTY STATE
        ============================================== */}

        {
          writings.length === 0
            ? (

                <section
                  className="saved-page-empty"
                  aria-live="polite"
                >

                  <Bookmark
                    size={42}
                    aria-hidden="true"
                  />


                  <h2>

                    {
                      t(
                        "savedWritings.emptyTitle"
                      )
                    }

                  </h2>


                  <p>

                    {
                      t(
                        "savedWritings.emptyDescription"
                      )
                    }

                  </p>

                </section>

              )
            : (

                <>

                  {/* =====================================
                      SAVED WRITING COUNT
                  ====================================== */}

                  <div className="saved-page-summary">

                    <strong>
                      {writings.length}
                    </strong>


                    <span>

                      {
                        writings.length === 1
                          ? t(
                              "savedWritings.savedWriting"
                            )
                          : t(
                              "savedWritings.savedWritings"
                            )
                      }

                    </span>

                  </div>


                  {/* =====================================
                      SAVED WRITINGS
                  ====================================== */}

                  <section
                    className="saved-writings-grid"
                    aria-label={
                      t(
                        "savedWritings.title"
                      )
                    }
                  >

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

                </>

              )
        }

      </div>

    </main>

  );

}


export default Saved;