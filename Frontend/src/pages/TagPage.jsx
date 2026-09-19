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
  useMemo,
  useRef,
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


import WritingCard
  from "../components/WritingCard";


import SEO
  from "../components/SEO";


import {
  useLanguage,
} from "../Language/LanguageContext";


import "./TagPage.css";


// =========================================================
// CONSTANTS
// =========================================================

const PAGE_SIZE =
  12;


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


function normalizeTagName(
  value
) {

  return String(
    value ||
    ""
  )
    .trim()
    .replace(
      /^#+/,
      ""
    )
    .trim();

}


function cleanMetaText(
  value
) {

  return String(
    value ||
    ""
  )
    .replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


function truncateMetaDescription(
  value,
  maxLength = 158
) {

  const clean =
    cleanMetaText(
      value
    );


  if (
    clean.length <=
      maxLength
  ) {

    return clean;

  }


  return (
    `${clean
      .slice(
        0,
        Math.max(
          1,
          maxLength - 1
        )
      )
      .trim()}…`
  );

}


// =========================================================
// TAG PAGE
// =========================================================

export default function TagPage() {

  const {
    tagName:
      routeTagName,
  } = useParams();


  const {
    language,
  } = useLanguage();


  const requestVersionRef =
    useRef(
      0
    );


  // =======================================================
  // TAG NAME
  // =======================================================

  const tagName =
    normalizeTagName(
      routeTagName
    );


  const validTagName =
    tagName.length >
      0 &&
    tagName.length <=
      100;


  // =======================================================
  // LABELS
  // =======================================================

  const labels =
    useMemo(
      () => ({

        back:
          language ===
            "bn"
            ? "ফিরে যান"
            : language ===
                "hi"
              ? "वापस जाएँ"
              : "Go back",


        trending:
          language ===
            "bn"
            ? "হ্যাশট্যাগ"
            : language ===
                "hi"
              ? "हैशटैग"
              : "Hashtag",


        writings:
          language ===
            "bn"
            ? "লেখা"
            : language ===
                "hi"
              ? "रचनाएँ"
              : "writings",


        writing:
          language ===
            "bn"
            ? "লেখা"
            : language ===
                "hi"
              ? "रचना"
              : "writing",


        loading:
          language ===
            "bn"
            ? "লেখাগুলো লোড হচ্ছে..."
            : language ===
                "hi"
              ? "रचनाएँ लोड हो रही हैं..."
              : "Loading writings...",


        error:
          language ===
            "bn"
            ? "এই হ্যাশট্যাগের লেখা লোড করা যায়নি।"
            : language ===
                "hi"
              ? "इस हैशटैग की रचनाएँ लोड नहीं हो सकीं।"
              : "Unable to load writings for this hashtag.",


        invalid:
          language ===
            "bn"
            ? "হ্যাশট্যাগটি সঠিক নয়।"
            : language ===
                "hi"
              ? "यह हैशटैग मान्य नहीं है।"
              : "This hashtag is invalid.",


        retry:
          language ===
            "bn"
            ? "আবার চেষ্টা করুন"
            : language ===
                "hi"
              ? "फिर कोशिश करें"
              : "Try again",


        emptyTitle:
          language ===
            "bn"
            ? "এখনও কোনো লেখা নেই"
            : language ===
                "hi"
              ? "अभी कोई रचना नहीं है"
              : "No writings yet",


        emptyDescription:
          language ===
            "bn"
            ? `#${tagName} হ্যাশট্যাগ ব্যবহার করে এখনও কোনো প্রকাশিত লেখা পাওয়া যায়নি।`
            : language ===
                "hi"
              ? `#${tagName} हैशटैग के साथ अभी कोई प्रकाशित रचना नहीं मिली।`
              : `No published writings using #${tagName} were found yet.`,


        explore:
          language ===
            "bn"
            ? "অন্যান্য লেখা দেখুন"
            : language ===
                "hi"
              ? "अन्य रचनाएँ देखें"
              : "Explore other writings",


        loadMore:
          language ===
            "bn"
            ? "আরও লেখা দেখুন"
            : language ===
                "hi"
              ? "और रचनाएँ देखें"
              : "Load more",


        loadingMore:
          language ===
            "bn"
            ? "আরও লেখা লোড হচ্ছে..."
            : language ===
                "hi"
              ? "और रचनाएँ लोड हो रही हैं..."
              : "Loading more...",


        refresh:
          language ===
            "bn"
            ? "রিফ্রেশ"
            : language ===
                "hi"
              ? "रीफ़्रेश"
              : "Refresh",

      }),
      [
        language,
        tagName,
      ]
    );


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
          !validTagName
        ) {

          setError(
            labels.invalid
          );


          setLoading(
            false
          );


          setLoadingMore(
            false
          );


          return;

        }


        const requestVersion =
          ++requestVersionRef
            .current;


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


          setError(
            ""
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
            pageNumber ===
              1
              ? getTrendingTopic(
                  tagName
                )
                  .catch(
                    () =>
                      null
                  )
              : Promise.resolve(
                  null
                );


          const [
            writingsResponse,
            topicResponse,
          ] =
            await Promise.all([
              writingsPromise,
              topicPromise,
            ]);


          if (
            requestVersion !==
              requestVersionRef
                .current
          ) {

            return;

          }


          const receivedWritings =
            Array.isArray(
              writingsResponse
                ?.writings
            )
              ? writingsResponse
                  .writings
              : Array.isArray(
                  writingsResponse
                    ?.items
                )
                ? writingsResponse
                    .items
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
                          writing
                            ?.id
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
              writingsResponse
                ?.page
            ) ||
            pageNumber
          );


          setHasNext(
            Boolean(
              writingsResponse
                ?.has_next
            )
          );


          setTotal(
            safeNumber(
              writingsResponse
                ?.total
            )
          );


          if (
            topicResponse
              ?.topic
          ) {

            setTopic(
              topicResponse
                .topic
            );


          } else if (
            writingsResponse
              ?.tag
          ) {

            setTopic(
              writingsResponse
                .tag
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
            requestVersion !==
              requestVersionRef
                .current
          ) {

            return;

          }


          if (
            !append
          ) {

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

          }


          setError(
            loadError
              ?.message ||
            labels.error
          );


        } finally {

          if (
            requestVersion ===
              requestVersionRef
                .current
          ) {

            setLoading(
              false
            );


            setLoadingMore(
              false
            );

          }

        }

      },
      [
        tagName,
        validTagName,
        labels.error,
        labels.invalid,
      ]
    );


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(
    () => {

      requestVersionRef
        .current +=
        1;


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
        pageNumber:
          1,

        append:
          false,
      });


      return () => {

        requestVersionRef
          .current +=
          1;

      };

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
  // REFRESH
  // =======================================================

  function handleRefresh() {

    if (
      loading ||
      loadingMore
    ) {

      return;

    }


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

      pageNumber:
        1,

      append:
        false,

    });

  }


  // =======================================================
  // DISPLAY VALUES
  // =======================================================

  const displayTag =
    topic?.hashtag
      ? String(
          topic.hashtag
        ).startsWith(
          "#"
        )
        ? String(
            topic.hashtag
          )
        : `#${topic.hashtag}`
      : `#${tagName}`;


  const displayTotal =
    safeNumber(
      topic
        ?.writings_count
    )
    ||
    total;


  // =======================================================
  // DYNAMIC SEO
  // =======================================================

  const canonicalTag =
    normalizeTagName(
      topic?.hashtag ||
      tagName
    );


  const seoTitle =
    canonicalTag
      ? `#${canonicalTag}`
      : (
          language ===
            "bn"
            ? "হ্যাশট্যাগ"
            : language ===
                "hi"
              ? "हैशटैग"
              : "Hashtag"
        );


  const seoDescription =
    useMemo(
      () => {

        if (
          !canonicalTag
        ) {

          return (
            language ===
              "bn"
              ? "SHOBDO-তে হ্যাশট্যাগ ও বিষয়ভিত্তিক লেখা আবিষ্কার করুন।"
              : language ===
                  "hi"
                ? "SHOBDO पर हैशटैग और विषय आधारित रचनाएँ खोजें।"
                : "Discover hashtag and topic-based writings on SHOBDO."
          );

        }


        const count =
          displayTotal;


        if (
          language ===
            "bn"
        ) {

          if (
            count >
              0
          ) {

            return truncateMetaDescription(
              `#${canonicalTag} বিষয়ের ${count}টি প্রকাশিত লেখা SHOBDO-তে পড়ুন এবং নতুন লেখক ও ভাবনা আবিষ্কার করুন।`
            );

          }


          return truncateMetaDescription(
            `#${canonicalTag} হ্যাশট্যাগের প্রকাশিত লেখা ও নতুন বিষয় SHOBDO-তে আবিষ্কার করুন।`
          );

        }


        if (
          language ===
            "hi"
        ) {

          if (
            count >
              0
          ) {

            return truncateMetaDescription(
              `SHOBDO पर #${canonicalTag} विषय की ${count} प्रकाशित रचनाएँ पढ़ें और नए लेखक व विचार खोजें।`
            );

          }


          return truncateMetaDescription(
            `SHOBDO पर #${canonicalTag} हैशटैग से जुड़ी प्रकाशित रचनाएँ और विषय खोजें।`
          );

        }


        if (
          count >
            0
        ) {

          return truncateMetaDescription(
            `Read ${count} published writings about #${canonicalTag} on SHOBDO and discover writers, stories, poetry and ideas around this topic.`
          );

        }


        return truncateMetaDescription(
          `Discover published writings, writers and ideas around #${canonicalTag} on SHOBDO.`
        );

      },
      [
        canonicalTag,
        displayTotal,
        language,
      ]
    );


  const seoPath =
    validTagName
      ? `/tag/${encodeURIComponent(
          canonicalTag ||
          tagName
        )}`
      : "";


  /*
   * A valid topic page stays indexable even when it
   * currently has zero writings. This allows the URL
   * to remain a stable topic landing page.
   *
   * Invalid and unavailable/error routes are noindex.
   */

  const seoNoIndex =
    !validTagName ||
    Boolean(
      error
    );


  // =======================================================
  // UI
  // =======================================================

  return (

    <>

      {/* ===================================================
          SEO
      ==================================================== */}

      <SEO
        title={
          seoTitle
        }
        description={
          seoDescription
        }
        path={
          seoPath
        }
        type="website"
        noIndex={
          seoNoIndex
        }
      />


      <div
        className="tag-page"
      >

        {/* =================================================
            HEADER
        ================================================== */}

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
                  window.history
                    .back()
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
                aria-hidden="true"
              />

            </button>


            <div
              className="tag-page-header-label"
            >

              <TrendingUp
                size={17}
                aria-hidden="true"
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
                handleRefresh
              }
              disabled={
                loading ||
                loadingMore
              }
              title={
                labels.refresh
              }
              aria-label={
                labels.refresh
              }
            >

              {
                loading
                  ? (

                      <Loader2
                        size={18}
                        className="tag-page-spin"
                        aria-hidden="true"
                      />

                    )
                  : (

                      <RefreshCw
                        size={18}
                        aria-hidden="true"
                      />

                    )
              }

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
                aria-hidden="true"
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


              {!loading &&
                !error && (

                <p>

                  <strong>
                    {
                      displayTotal
                    }
                  </strong>

                  {" "}

                  {
                    displayTotal ===
                      1
                      ? labels.writing
                      : labels.writings
                  }

                </p>

              )}

            </div>

          </div>

        </header>


        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (

          <section
            className="tag-page-state"
            role="status"
            aria-live="polite"
          >

            <Loader2
              size={30}
              className="tag-page-spin"
              aria-hidden="true"
            />


            <h2>
              {
                labels.loading
              }
            </h2>

          </section>

        )}


        {/* =================================================
            ERROR
        ================================================== */}

        {!loading &&
          error && (

          <section
            className="tag-page-state tag-page-error"
          >

            <Hash
              size={34}
              aria-hidden="true"
            />


            <h2>
              {
                validTagName
                  ? labels.error
                  : labels.invalid
              }
            </h2>


            <p>
              {
                error
              }
            </p>


            {validTagName && (

              <button
                type="button"
                onClick={
                  handleRefresh
                }
              >

                <RefreshCw
                  size={16}
                  aria-hidden="true"
                />

                {
                  labels.retry
                }

              </button>

            )}


            {!validTagName && (

              <Link
                to="/explore"
                className="tag-page-explore-button"
              >

                {
                  labels.explore
                }

              </Link>

            )}

          </section>

        )}


        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          writings.length ===
            0 && (

          <section
            className="tag-page-state"
          >

            <div
              className="tag-page-empty-icon"
            >

              <Hash
                size={34}
                aria-hidden="true"
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


        {/* =================================================
            WRITINGS
        ================================================== */}

        {!loading &&
          !error &&
          writings.length >
            0 && (

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

                  {
                    loadingMore
                      ? (

                          <>

                            <Loader2
                              size={18}
                              className="tag-page-spin"
                              aria-hidden="true"
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
                              aria-hidden="true"
                            />

                            <span>
                              {
                                labels.loadMore
                              }
                            </span>

                          </>

                        )
                  }

                </button>

              </div>

            )}

          </>

        )}

      </div>

    </>

  );

}