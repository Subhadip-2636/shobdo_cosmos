import {
  ArrowLeft,
  Hash,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getTrendingTopic,
  getWritingsByTag,
} from "../api/api";

import WritingCard from "../components/WritingCard";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./TagPage.css";


const PAGE_SIZE = 12;


// =========================================================
// HELPERS
// =========================================================

function safeNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? Math.max(
        0,
        number
      )
    : 0;
}


// =========================================================
// TAG PAGE
// =========================================================

export default function TagPage() {

  const {
    tagName: routeTagName,
  } = useParams();


  const {
    language,
  } = useLanguage();


  // =======================================================
  // TAG NAME
  // =======================================================

  const tagName =
    String(
      routeTagName || ""
    )
      .trim()
      .replace(
        /^#+/,
        ""
      )
      .trim();


  // =======================================================
  // LABELS
  // =======================================================

  const labels = {

    back:
      language === "bn"
        ? "ফিরে যান"
        : language === "hi"
          ? "वापस जाएँ"
          : "Go back",

    trending:
      language === "bn"
        ? "হ্যাশট্যাগ"
        : language === "hi"
          ? "हैशटैग"
          : "Hashtag",

    writings:
      language === "bn"
        ? "লেখা"
        : language === "hi"
          ? "रचनाएँ"
          : "writings",

    writing:
      language === "bn"
        ? "লেখা"
        : language === "hi"
          ? "रचना"
          : "writing",

    loading:
      language === "bn"
        ? "লেখাগুলো লোড হচ্ছে..."
        : language === "hi"
          ? "रचनाएँ लोड हो रही हैं..."
          : "Loading writings...",

    error:
      language === "bn"
        ? "এই হ্যাশট্যাগের লেখা লোড করা যায়নি।"
        : language === "hi"
          ? "इस हैशटैग की रचनाएँ लोड नहीं हो सकीं।"
          : "Unable to load writings for this hashtag.",

    retry:
      language === "bn"
        ? "আবার চেষ্টা করুন"
        : language === "hi"
          ? "फिर कोशिश करें"
          : "Try again",

    emptyTitle:
      language === "bn"
        ? "এখনও কোনো লেখা নেই"
        : language === "hi"
          ? "अभी कोई रचना नहीं है"
          : "No writings yet",

    emptyDescription:
      language === "bn"
        ? `#${tagName} হ্যাশট্যাগ ব্যবহার করে এখনও কোনো প্রকাশিত লেখা পাওয়া যায়নি।`
        : language === "hi"
          ? `#${tagName} हैशटैग के साथ अभी कोई प्रकाशित रचना नहीं मिली।`
          : `No published writings using #${tagName} were found yet.`,

    explore:
      language === "bn"
        ? "অন্যান্য লেখা দেখুন"
        : language === "hi"
          ? "अन्य रचनाएँ देखें"
          : "Explore other writings",

    loadMore:
      language === "bn"
        ? "আরও লেখা দেখুন"
        : language === "hi"
          ? "और रचनाएँ देखें"
          : "Load more",

    loadingMore:
      language === "bn"
        ? "আরও লেখা লোড হচ্ছে..."
        : language === "hi"
          ? "और रचनाएँ लोड हो रही हैं..."
          : "Loading more...",

    refresh:
      language === "bn"
        ? "রিফ্রেশ"
        : language === "hi"
          ? "रीफ़्रेश"
          : "Refresh",

  };


  // =======================================================
  // STATE
  // =======================================================

  const [
    writings,
    setWritings,
  ] = useState(
    []
  );


  const [
    topic,
    setTopic,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    loadingMore,
    setLoadingMore,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  const [
    page,
    setPage,
  ] = useState(
    1
  );


  const [
    hasNext,
    setHasNext,
  ] = useState(
    false
  );


  const [
    total,
    setTotal,
  ] = useState(
    0
  );


  // =======================================================
  // LOAD TAG PAGE
  // =======================================================

  const loadTagPage =
    useCallback(
      async ({
        pageNumber = 1,
        append = false,
      } = {}) => {

        if (
          !tagName
        ) {

          setError(
            labels.error
          );

          setLoading(
            false
          );

          return;

        }


        if (
          append
        ) {

          setLoadingMore(
            true
          );

        } else {

          setLoading(
            true
          );

        }


        try {

          const writingsPromise =
            getWritingsByTag(
              tagName,
              {
                page:
                  pageNumber,

                limit:
                  PAGE_SIZE,
              }
            );


          const topicPromise =
            pageNumber === 1
              ? getTrendingTopic(
                  tagName
                )
                  .catch(
                    () => null
                  )
              : Promise.resolve(
                  null
                );


          const [
            writingsResponse,
            topicResponse,
          ] = await Promise.all([
            writingsPromise,
            topicPromise,
          ]);


          const receivedWritings =
            Array.isArray(
              writingsResponse?.writings
            )
              ? writingsResponse.writings
              : Array.isArray(
                    writingsResponse?.items
                  )
                ? writingsResponse.items
                : [];


          if (
            append
          ) {

            setWritings(
              (
                previous
              ) => {

                const combined = [
                  ...previous,
                  ...receivedWritings,
                ];


                return Array.from(

                  new Map(

                    combined
                      .filter(
                        (
                          writing
                        ) =>
                          writing?.id
                      )
                      .map(
                        (
                          writing
                        ) => [
                          writing.id,
                          writing,
                        ]
                      )

                  ).values()

                );

              }
            );

          } else {

            setWritings(
              receivedWritings
            );

          }


          setPage(
            Number(
              writingsResponse?.page
            ) || pageNumber
          );


          setHasNext(
            Boolean(
              writingsResponse?.has_next
            )
          );


          setTotal(
            safeNumber(
              writingsResponse?.total
            )
          );


          if (
            topicResponse?.topic
          ) {

            setTopic(
              topicResponse.topic
            );

          } else if (
            writingsResponse?.tag
          ) {

            setTopic(
              writingsResponse.tag
            );

          }


          setError(
            ""
          );

        } catch (
          loadError
        ) {

          console.error(
            "TAG PAGE LOAD ERROR:",
            loadError
          );


          if (
            !append
          ) {

            setWritings(
              []
            );

          }


          setError(
            loadError?.message ||
            labels.error
          );

        } finally {

          setLoading(
            false
          );


          setLoadingMore(
            false
          );

        }

      },
      [
        tagName,
        labels.error,
      ]
    );


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(
    () => {

      setWritings(
        []
      );

      setTopic(
        null
      );

      setPage(
        1
      );

      setHasNext(
        false
      );

      setTotal(
        0
      );

      setError(
        ""
      );


      loadTagPage({
        pageNumber: 1,
        append: false,
      });

    },
    [
      loadTagPage,
    ]
  );


  // =======================================================
  // LOAD MORE
  // =======================================================

  function handleLoadMore() {

    if (
      loadingMore ||
      !hasNext
    ) {

      return;

    }


    loadTagPage({
      pageNumber:
        page + 1,

      append:
        true,
    });

  }


  // =======================================================
  // DISPLAY VALUES
  // =======================================================

  const displayTag =
    topic?.hashtag ||
    `#${tagName}`;


  const displayTotal =
    safeNumber(
      topic?.writings_count
    ) ||
    total;


  // =======================================================
  // UI
  // =======================================================

  return (

    <div
      className="tag-page"
    >

      {/* ===================================================
          HEADER
      ==================================================== */}

      <header
        className="tag-page-header"
      >

        <div
          className="tag-page-header-top"
        >

          <button
            type="button"
            className="tag-page-back"
            onClick={
              () =>
                window.history.back()
            }
            aria-label={
              labels.back
            }
            title={
              labels.back
            }
          >

            <ArrowLeft
              size={20}
            />

          </button>


          <div
            className="tag-page-header-label"
          >

            <TrendingUp
              size={17}
            />

            <span>
              {
                labels.trending
              }
            </span>

          </div>


          <button
            type="button"
            className="tag-page-refresh"
            onClick={
              () =>
                loadTagPage({
                  pageNumber: 1,
                  append: false,
                })
            }
            disabled={
              loading
            }
            title={
              labels.refresh
            }
            aria-label={
              labels.refresh
            }
          >

            {loading
              ? (

                <Loader2
                  size={18}
                  className="tag-page-spin"
                />

              )
              : (

                <RefreshCw
                  size={18}
                />

              )}

          </button>

        </div>


        <div
          className="tag-page-hero"
        >

          <div
            className="tag-page-hash-icon"
          >

            <Hash
              size={30}
            />

          </div>


          <div
            className="tag-page-title-wrap"
          >

            <h1>
              {
                displayTag
              }
            </h1>


            {!loading && (

              <p>

                <strong>
                  {
                    displayTotal
                  }
                </strong>

                {" "}

                {
                  displayTotal === 1
                    ? labels.writing
                    : labels.writings
                }

              </p>

            )}

          </div>

        </div>

      </header>


      {/* ===================================================
          LOADING
      ==================================================== */}

      {loading && (

        <section
          className="tag-page-state"
        >

          <Loader2
            size={30}
            className="tag-page-spin"
          />


          <h2>
            {
              labels.loading
            }
          </h2>

        </section>

      )}


      {/* ===================================================
          ERROR
      ==================================================== */}

      {!loading &&
        error && (

          <section
            className="tag-page-state tag-page-error"
          >

            <Hash
              size={34}
            />


            <h2>
              {
                labels.error
              }
            </h2>


            <p>
              {
                error
              }
            </p>


            <button
              type="button"
              onClick={
                () =>
                  loadTagPage({
                    pageNumber: 1,
                    append: false,
                  })
              }
            >

              <RefreshCw
                size={16}
              />

              {
                labels.retry
              }

            </button>

          </section>

        )}


      {/* ===================================================
          EMPTY
      ==================================================== */}

      {!loading &&
        !error &&
        writings.length === 0 && (

          <section
            className="tag-page-state"
          >

            <div
              className="tag-page-empty-icon"
            >

              <Hash
                size={34}
              />

            </div>


            <h2>
              {
                labels.emptyTitle
              }
            </h2>


            <p>
              {
                labels.emptyDescription
              }
            </p>


            <Link
              to="/explore"
              className="tag-page-explore-button"
            >

              {
                labels.explore
              }

            </Link>

          </section>

        )}


      {/* ===================================================
          WRITINGS
      ==================================================== */}

      {!loading &&
        !error &&
        writings.length > 0 && (

          <>

            <section
              className="tag-page-feed"
            >

              {writings.map(
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
              )}

            </section>


            {/* =============================================
                LOAD MORE
            ============================================== */}

            {hasNext && (

              <div
                className="tag-page-load-more-wrap"
              >

                <button
                  type="button"
                  className="tag-page-load-more"
                  disabled={
                    loadingMore
                  }
                  onClick={
                    handleLoadMore
                  }
                >

                  {loadingMore
                    ? (

                      <>

                        <Loader2
                          size={18}
                          className="tag-page-spin"
                        />

                        <span>
                          {
                            labels.loadingMore
                          }
                        </span>

                      </>

                    )
                    : (

                      <>

                        <RefreshCw
                          size={17}
                        />

                        <span>
                          {
                            labels.loadMore
                          }
                        </span>

                      </>

                    )}

                </button>

              </div>

            )}

          </>

        )}

    </div>

  );
}