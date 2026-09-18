import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Feather,
  Lightbulb,
  Loader2,
  PenLine,
  Quote,
  RefreshCw,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import WritingCard from "../components/WritingCard";

import {
  getFollowingFeed,
  getToken,
  getWritings,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// CONSTANTS
// =========================================================

const FEED_PAGE_SIZE = 12;


// =========================================================
// CLASSIC PUBLIC-DOMAIN QUOTES
// =========================================================

const LITERARY_QUOTES = [

  {
    quote:
      "To thine own self be true.",

    author:
      "William Shakespeare",

    source:
      "Hamlet",
  },

  {
    quote:
      "There is no charm equal to tenderness of heart.",

    author:
      "Jane Austen",

    source:
      "Emma",
  },

  {
    quote:
      "I am no bird; and no net ensnares me.",

    author:
      "Charlotte Brontë",

    source:
      "Jane Eyre",
  },

  {
    quote:
      "Forever is composed of nows.",

    author:
      "Emily Dickinson",

    source:
      "Poem 690",
  },

];


// =========================================================
// DATABASE CATEGORY VALUES
// =========================================================

const CATEGORIES = [

  {
    value:
      "কবিতা",

    translationKey:
      "categories.poetry",

    symbol:
      "✦",

    number:
      "01",
  },

  {
    value:
      "গল্প",

    translationKey:
      "categories.story",

    symbol:
      "◈",

    number:
      "02",
  },

  {
    value:
      "অনুভূতি",

    translationKey:
      "categories.reflection",

    symbol:
      "●",

    number:
      "03",
  },

  {
    value:
      "প্রবন্ধ",

    translationKey:
      "categories.essay",

    symbol:
      "◇",

    number:
      "04",
  },

];


// =========================================================
// FEED TABS
// =========================================================

const FEED_TYPES = {
  FOR_YOU:
    "for-you",

  FOLLOWING:
    "following",

  LATEST:
    "latest",
};


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
// DATE VALUE
// =========================================================

function getWritingTimestamp(
  writing
) {

  const value =
    writing?.published_at ||
    writing?.created_at ||
    writing?.updated_at;


  if (!value) {

    return 0;

  }


  const timestamp =
    new Date(
      value
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;
}


// =========================================================
// TEMPORARY "FOR YOU" RELEVANCE SCORE
//
// Until SHOBDO gets a dedicated personalized recommendation
// endpoint, public posts are ranked using engagement +
// freshness.
//
// This keeps For You different from Latest without pretending
// that the backend already has a full recommendation engine.
// =========================================================

function getRecommendationScore(
  writing
) {

  const likes =
    safeNumber(
      writing?.likes_count ??
      writing?.likes
    );


  const comments =
    safeNumber(
      writing?.comments_count
    );


  const timestamp =
    getWritingTimestamp(
      writing
    );


  let freshnessScore =
    0;


  if (timestamp > 0) {

    const ageHours =
      Math.max(
        0,
        (
          Date.now() -
          timestamp
        ) /
        (
          1000 *
          60 *
          60
        )
      );


    // Recent activity gets a modest ranking bonus.
    freshnessScore =
      Math.max(
        0,
        168 - ageHours
      ) / 24;

  }


  return (
    likes * 2
    +
    comments * 3
    +
    freshnessScore
  );
}


// =========================================================
// SORT FEED
// =========================================================

function sortFeedItems(
  items,
  feedType
) {

  const safeItems =
    Array.isArray(
      items
    )
      ? [...items]
      : [];


  if (
    feedType ===
    FEED_TYPES.FOR_YOU
  ) {

    return safeItems.sort(
      (
        first,
        second
      ) => {

        const scoreDifference =
          getRecommendationScore(
            second
          )
          -
          getRecommendationScore(
            first
          );


        if (
          scoreDifference !== 0
        ) {

          return scoreDifference;

        }


        return (
          getWritingTimestamp(
            second
          )
          -
          getWritingTimestamp(
            first
          )
        );

      }
    );

  }


  if (
    feedType ===
    FEED_TYPES.LATEST
  ) {

    return safeItems.sort(
      (
        first,
        second
      ) =>
        getWritingTimestamp(
          second
        )
        -
        getWritingTimestamp(
          first
        )
    );

  }


  // Following feed keeps backend ordering.

  return safeItems;
}


// =========================================================
// EXTRACT WRITINGS FROM API RESPONSE
// =========================================================

function extractFeedItems(
  response
) {

  if (
    Array.isArray(
      response?.writings
    )
  ) {

    return response.writings;

  }


  if (
    Array.isArray(
      response?.items
    )
  ) {

    return response.items;

  }


  if (
    Array.isArray(
      response?.feed
    )
  ) {

    return response.feed;

  }


  if (
    Array.isArray(
      response
    )
  ) {

    return response;

  }


  return [];
}


// =========================================================
// REMOVE DUPLICATE WRITINGS
// =========================================================

function mergeUniqueWritings(
  existing,
  incoming
) {

  const combined = [
    ...(
      Array.isArray(
        existing
      )
        ? existing
        : []
    ),

    ...(
      Array.isArray(
        incoming
      )
        ? incoming
        : []
    ),
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

            Number(
              writing.id
            ),

            writing,

          ]
        )

    ).values()

  );
}


// =========================================================
// HOME
// =========================================================

function Home({
  writings = [],
  loading = false,
}) {

  const {
    t,
    language,
  } = useLanguage();


  // =======================================================
  // TRANSLATION FALLBACK
  // =======================================================

  function translate(
    key,
    fallbackBn,
    fallbackEn,
    fallbackHi = null,
  ) {

    try {

      const translated =
        t(
          key
        );


      if (
        translated &&
        translated !== key
      ) {

        return translated;

      }

    } catch {

      // Use fallback below.

    }


    if (
      language === "bn"
    ) {

      return fallbackBn;

    }


    if (
      language === "hi"
    ) {

      return (
        fallbackHi ||
        fallbackEn
      );

    }


    return fallbackEn;

  }


  // =======================================================
  // LABELS
  // =======================================================

  const labels = {

    feedEyebrow:
      language === "bn"
        ? "আপনার ফিড"
        : language === "hi"
          ? "आपकी फ़ीड"
          : "YOUR FEED",

    feedTitle:
      language === "bn"
        ? "SHOBDO-তে কী লেখা হচ্ছে"
        : language === "hi"
          ? "SHOBDO पर क्या लिखा जा रहा है"
          : "What's being written on SHOBDO",

    feedDescription:
      language === "bn"
        ? "নতুন লেখক, অনুসরণ করা মানুষ এবং সদ্য প্রকাশিত লেখা আবিষ্কার করুন।"
        : language === "hi"
          ? "नए लेखक, फ़ॉलो किए गए लोगों और नई रचनाओं को खोजें।"
          : "Discover writers, people you follow, and newly published work.",

    forYou:
      language === "bn"
        ? "আপনার জন্য"
        : language === "hi"
          ? "आपके लिए"
          : "For You",

    following:
      language === "bn"
        ? "অনুসরণ"
        : language === "hi"
          ? "फ़ॉलोइंग"
          : "Following",

    latest:
      language === "bn"
        ? "সর্বশেষ"
        : language === "hi"
          ? "नवीनतम"
          : "Latest",

    refresh:
      language === "bn"
        ? "রিফ্রেশ"
        : language === "hi"
          ? "रीफ़्रेश"
          : "Refresh",

    loadingFeed:
      language === "bn"
        ? "ফিড লোড হচ্ছে..."
        : language === "hi"
          ? "फ़ीड लोड हो रही है..."
          : "Loading your feed...",

    feedError:
      language === "bn"
        ? "ফিড লোড করা যায়নি।"
        : language === "hi"
          ? "फ़ीड लोड नहीं हो सकी।"
          : "The feed could not be loaded.",

    retry:
      language === "bn"
        ? "আবার চেষ্টা করুন"
        : language === "hi"
          ? "फिर कोशिश करें"
          : "Try again",

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

    noForYou:
      language === "bn"
        ? "এই মুহূর্তে কোনো প্রস্তাবিত লেখা নেই।"
        : language === "hi"
          ? "अभी कोई सुझाई गई रचना नहीं है।"
          : "No recommended writings right now.",

    noFollowing:
      language === "bn"
        ? "আপনি যাদের অনুসরণ করেন তাদের নতুন কোনো লেখা নেই।"
        : language === "hi"
          ? "जिन लोगों को आप फ़ॉलो करते हैं उनकी कोई नई रचना नहीं है।"
          : "There are no new writings from people you follow.",

    noLatest:
      language === "bn"
        ? "এখনও কোনো প্রকাশিত লেখা নেই।"
        : language === "hi"
          ? "अभी कोई प्रकाशित रचना नहीं है।"
          : "There are no published writings yet.",

    followingLoginTitle:
      language === "bn"
        ? "আপনার Following Feed দেখুন"
        : language === "hi"
          ? "अपनी Following Feed देखें"
          : "See your Following feed",

    followingLoginDescription:
      language === "bn"
        ? "আপনি যাদের অনুসরণ করেন তাদের লেখা দেখতে লগ ইন করুন।"
        : language === "hi"
          ? "जिन लोगों को आप फ़ॉलो करते हैं उनकी रचनाएँ देखने के लिए लॉग इन करें।"
          : "Log in to see writings from people you follow.",

    login:
      translate(
        "navbar.login",
        "লগ ইন",
        "Log in",
        "लॉग इन"
      ),

    explore:
      translate(
        "navbar.explore",
        "অন্বেষণ করুন",
        "Explore",
        "एक्सप्लोर"
      ),

  };


  // =======================================================
  // QUOTE STATE
  // =======================================================

  const [
    quoteIndex,
    setQuoteIndex,
  ] = useState(
    0
  );


  // =======================================================
  // FEED STATE
  // =======================================================

  const [
    activeFeed,
    setActiveFeed,
  ] = useState(
    FEED_TYPES.FOR_YOU
  );


  const [
    feedWritings,
    setFeedWritings,
  ] = useState(
    []
  );


  const [
    feedLoading,
    setFeedLoading,
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
    feedError,
    setFeedError,
  ] = useState(
    ""
  );


  const [
    feedPage,
    setFeedPage,
  ] = useState(
    1
  );


  const [
    feedTotal,
    setFeedTotal,
  ] = useState(
    0
  );


  const [
    feedHasNext,
    setFeedHasNext,
  ] = useState(
    false
  );


  const [
    followingRequiresLogin,
    setFollowingRequiresLogin,
  ] = useState(
    false
  );


  // =======================================================
  // AUTO ROTATE QUOTES
  // =======================================================

  useEffect(
    () => {

      const timer =
        window.setInterval(
          () => {

            setQuoteIndex(
              (
                current
              ) =>
                (
                  current + 1
                )
                %
                LITERARY_QUOTES.length
            );

          },
          7000
        );


      return () => {

        window.clearInterval(
          timer
        );

      };

    },
    []
  );


  // =======================================================
  // QUOTE CONTROLS
  // =======================================================

  function previousQuote() {

    setQuoteIndex(
      (
        current
      ) =>
        (
          current -
          1 +
          LITERARY_QUOTES.length
        )
        %
        LITERARY_QUOTES.length
    );

  }


  function nextQuote() {

    setQuoteIndex(
      (
        current
      ) =>
        (
          current + 1
        )
        %
        LITERARY_QUOTES.length
    );

  }


  const activeQuote =
    LITERARY_QUOTES[
      quoteIndex
    ];


  // =======================================================
  // FEATURED WRITING
  // =======================================================

  const featuredWriting =
    useMemo(
      () =>
        Array.isArray(
          writings
        )
          ? writings[0] || null
          : null,
      [
        writings,
      ]
    );


  // =======================================================
  // CATEGORY LABEL
  // =======================================================

  function categoryLabel(
    value
  ) {

    const map = {

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
  // LOAD FEED
  // =======================================================

  const loadFeed =
    useCallback(
      async ({
        feedType,
        pageNumber = 1,
        append = false,
      }) => {

        const selectedFeed =
          feedType ||
          FEED_TYPES.FOR_YOU;


        // =================================================
        // FOLLOWING REQUIRES AUTHENTICATION
        // =================================================

        if (
          selectedFeed ===
            FEED_TYPES.FOLLOWING
          &&
          !getToken()
        ) {

          setFollowingRequiresLogin(
            true
          );


          setFeedWritings(
            []
          );


          setFeedPage(
            1
          );


          setFeedTotal(
            0
          );


          setFeedHasNext(
            false
          );


          setFeedError(
            ""
          );


          setFeedLoading(
            false
          );


          setLoadingMore(
            false
          );


          return;

        }


        setFollowingRequiresLogin(
          false
        );


        if (
          append
        ) {

          setLoadingMore(
            true
          );

        } else {

          setFeedLoading(
            true
          );

          setFeedError(
            ""
          );

        }


        try {

          let response;


          // ===============================================
          // FOLLOWING
          // ===============================================

          if (
            selectedFeed ===
            FEED_TYPES.FOLLOWING
          ) {

            response =
              await getFollowingFeed({
                page:
                  pageNumber,

                limit:
                  FEED_PAGE_SIZE,
              });

          }


          // ===============================================
          // PUBLIC FEEDS
          // ===============================================

          else {

            response =
              await getWritings({
                page:
                  pageNumber,

                limit:
                  FEED_PAGE_SIZE,
              });

          }


          let received =
            extractFeedItems(
              response
            );


          received =
            sortFeedItems(
              received,
              selectedFeed
            );


          if (
            append
          ) {

            setFeedWritings(
              (
                previous
              ) => {

                const combined =
                  mergeUniqueWritings(
                    previous,
                    received
                  );


                return (
                  selectedFeed ===
                    FEED_TYPES.FOLLOWING
                    ? combined
                    : sortFeedItems(
                        combined,
                        selectedFeed
                      )
                );

              }
            );

          } else {

            setFeedWritings(
              received
            );

          }


          const currentPage =
            Number(
              response?.page
            ) ||
            pageNumber;


          const pages =
            safeNumber(
              response?.pages
            );


          const explicitHasNext =
            typeof response?.has_next ===
            "boolean"
              ? response.has_next
              : null;


          const inferredHasNext =
            explicitHasNext !== null
              ? explicitHasNext
              : pages > 0
                ? currentPage < pages
                : received.length >=
                  FEED_PAGE_SIZE;


          setFeedPage(
            currentPage
          );


          setFeedHasNext(
            inferredHasNext
          );


          setFeedTotal(
            safeNumber(
              response?.total
            )
          );


          setFeedError(
            ""
          );

        } catch (
          error
        ) {

          console.error(
            "HOME FEED ERROR:",
            error
          );


          if (
            !append
          ) {

            setFeedWritings(
              []
            );

          }


          setFeedError(
            error?.message ||
            "Unable to load feed."
          );


          if (
            error?.status === 401 ||
            error?.status === 422
          ) {

            if (
              selectedFeed ===
              FEED_TYPES.FOLLOWING
            ) {

              setFollowingRequiresLogin(
                true
              );


              setFeedError(
                ""
              );

            }

          }

        } finally {

          setFeedLoading(
            false
          );


          setLoadingMore(
            false
          );

        }

      },
      []
    );


  // =======================================================
  // LOAD FEED WHEN TAB CHANGES
  // =======================================================

  useEffect(
    () => {

      setFeedWritings(
        []
      );


      setFeedPage(
        1
      );


      setFeedHasNext(
        false
      );


      setFeedTotal(
        0
      );


      setFeedError(
        ""
      );


      loadFeed({
        feedType:
          activeFeed,

        pageNumber:
          1,

        append:
          false,
      });

    },
    [
      activeFeed,
      loadFeed,
    ]
  );


  // =======================================================
  // REFRESH FEED
  // =======================================================

  function handleRefreshFeed() {

    loadFeed({
      feedType:
        activeFeed,

      pageNumber:
        1,

      append:
        false,
    });

  }


  // =======================================================
  // LOAD MORE
  // =======================================================

  function handleLoadMore() {

    if (
      loadingMore ||
      feedLoading ||
      !feedHasNext
    ) {

      return;

    }


    loadFeed({
      feedType:
        activeFeed,

      pageNumber:
        feedPage + 1,

      append:
        true,
    });

  }


  // =======================================================
  // EMPTY MESSAGE
  // =======================================================

  const emptyFeedMessage =
    activeFeed ===
      FEED_TYPES.FOLLOWING
      ? labels.noFollowing
      : activeFeed ===
          FEED_TYPES.LATEST
        ? labels.noLatest
        : labels.noForYou;


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="literary-home"
    >

      {/* =================================================
          HERO
      ================================================== */}

      <section
        className="literary-hero"
      >

        <div
          className="literary-hero-noise"
        />


        <div
          className="literary-hero-inner"
        >

          {/* LEFT */}

          <div
            className="literary-hero-copy"
          >

            <div
              className="literary-kicker"
            >

              <Sparkles
                size={14}
              />


              <span>

                {
                  t(
                    "home.eyebrow"
                  )
                }

              </span>

            </div>


            <h1>

              {
                t(
                  "home.heroTitle"
                )
              }

            </h1>


            <p
              className="literary-hero-description"
            >

              {
                t(
                  "home.heroDescription"
                )
              }

            </p>


            <div
              className="literary-hero-buttons"
            >

              <Link
                to="/write"
                className="literary-primary-button"
              >

                <PenLine
                  size={17}
                />

                {
                  t(
                    "home.startWriting"
                  )
                }

              </Link>


              <Link
                to="/explore"
                className="literary-text-button"
              >

                {
                  t(
                    "home.exploreWriting"
                  )
                }

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>


            <div
              className="literary-hero-footnote"
            >

              <span />


              <p>

                {
                  t(
                    "home.writerInvitation",
                    "Some stories are waiting for only you to write them."
                  )
                }

              </p>

            </div>

          </div>


          {/* RIGHT — MANUSCRIPT */}

          <div
            className="literary-manuscript-wrap"
          >

            <div
              className="literary-manuscript-shadow"
            />


            <div
              className="literary-manuscript"
            >

              <div
                className="manuscript-top"
              >

                <Feather
                  size={25}
                />

                <span>
                  SHOBDO
                </span>

              </div>


              <div
                className="manuscript-rule"
              />


              <p
                className="manuscript-small"
              >

                {
                  t(
                    "home.blankPageLabel",
                    "A BLANK PAGE"
                  )
                }

              </p>


              <h2>

                {
                  t(
                    "home.blankPageTitle",
                    "What will you write today?"
                  )
                }

              </h2>


              <div
                className="manuscript-lines"
              >

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>


              <Link
                to="/write"
                className="manuscript-write-link"
              >

                <PenLine
                  size={15}
                />

                {
                  t(
                    "home.beginStory",
                    "Begin your story"
                  )
                }

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          QUOTE EXPERIENCE
      ================================================== */}

      <section
        className="literary-quotes-section"
      >

        <div
          className="literary-quotes-shell"
        >

          <div
            className="quote-section-side"
          >

            <span
              className="quote-side-number"
            >
              01
            </span>


            <div>

              <p
                className="literary-section-label"
              >

                {
                  t(
                    "home.quoteEyebrow",
                    "WORDS THAT REMAIN"
                  )
                }

              </p>


              <h2>

                {
                  t(
                    "home.quoteTitle",
                    "Words that moved generations."
                  )
                }

              </h2>


              <p>

                {
                  t(
                    "home.quoteDescription",
                    "Sometimes one sentence is enough to make someone pick up a pen."
                  )
                }

              </p>

            </div>

          </div>


          <div
            className="quote-stage"
          >

            <Quote
              className="quote-stage-icon"
              size={46}
            />


            <blockquote>
              “{activeQuote.quote}”
            </blockquote>


            <div
              className="quote-author"
            >

              <span />


              <div>

                <strong>
                  {activeQuote.author}
                </strong>

                <small>
                  {activeQuote.source}
                </small>

              </div>

            </div>


            <div
              className="quote-navigation"
            >

              <button
                type="button"
                onClick={
                  previousQuote
                }
                aria-label="Previous quote"
              >

                <ArrowLeft
                  size={16}
                />

              </button>


              <div
                className="quote-dots"
              >

                {LITERARY_QUOTES.map(
                  (
                    item,
                    index
                  ) => (

                    <button
                      key={
                        `${item.author}-${index}`
                      }
                      type="button"
                      className={
                        index === quoteIndex
                          ? "active"
                          : ""
                      }
                      onClick={
                        () =>
                          setQuoteIndex(
                            index
                          )
                      }
                      aria-label={
                        `Quote ${index + 1}`
                      }
                    />

                  )
                )}

              </div>


              <button
                type="button"
                onClick={
                  nextQuote
                }
                aria-label="Next quote"
              >

                <ArrowRight
                  size={16}
                />

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          WRITING INVITATION
      ================================================== */}

      <section
        className="literary-prompt-section"
      >

        <div
          className="literary-prompt-card"
        >

          <div
            className="prompt-light"
          >

            <Lightbulb
              size={25}
            />

          </div>


          <div
            className="prompt-content"
          >

            <span>

              {
                t(
                  "home.promptEyebrow",
                  "A THOUGHT FOR TODAY"
                )
              }

            </span>


            <h2>

              {
                t(
                  "home.promptTitle",
                  "Write about something you never said aloud."
                )
              }

            </h2>


            <p>

              {
                t(
                  "home.promptDescription",
                  "It does not have to be perfect. It only has to be yours."
                )
              }

            </p>

          </div>


          <Link
            to="/write"
            className="prompt-write-button"
          >

            <PenLine
              size={17}
            />

            {
              t(
                "home.startWriting"
              )
            }

          </Link>

        </div>

      </section>


      {/* =================================================
          CATEGORIES
      ================================================== */}

      <section
        className="literary-content-section"
      >

        <div
          className="literary-section-header"
        >

          <div>

            <span
              className="literary-section-label"
            >

              {
                t(
                  "home.discoverEyebrow",
                  "DISCOVER"
                )
              }

            </span>


            <h2>

              {
                t(
                  "home.categoriesTitle"
                )
              }

            </h2>


            <p>

              {
                t(
                  "home.categoriesDescription"
                )
              }

            </p>

          </div>


          <Link
            to="/explore"
            className="literary-view-all"
          >

            {
              t(
                "home.viewAll"
              )
            }

            <ArrowRight
              size={15}
            />

          </Link>

        </div>


        <div
          className="literary-category-grid"
        >

          {CATEGORIES.map(
            (
              item
            ) => (

              <Link
                key={
                  item.value
                }
                to={
                  `/explore?category=${encodeURIComponent(
                    item.value
                  )}`
                }
                className="literary-category-card"
              >

                <div
                  className="category-card-top"
                >

                  <span
                    className="category-number"
                  >
                    {item.number}
                  </span>


                  <span
                    className="category-symbol"
                  >
                    {item.symbol}
                  </span>

                </div>


                <div
                  className="category-card-bottom"
                >

                  <div>

                    <h3>

                      {
                        t(
                          item.translationKey
                        )
                      }

                    </h3>


                    <p>

                      {
                        t(
                          "home.exploreWriting"
                        )
                      }

                    </p>

                  </div>


                  <ArrowRight
                    size={17}
                  />

                </div>

              </Link>

            )
          )}

        </div>

      </section>


      {/* =================================================
          FEATURED COMMUNITY WRITING
      ================================================== */}

      {!loading &&
        featuredWriting && (

          <section
            className="literary-featured-section"
          >

            <div
              className="literary-featured-shell"
            >

              <div
                className="featured-side-label"
              >

                <span>
                  02
                </span>


                <p>

                  {
                    t(
                      "home.featuredEyebrow",
                      "FROM THE COMMUNITY"
                    )
                  }

                </p>

              </div>


              <article
                className="literary-featured-article"
              >

                <div
                  className="featured-article-meta"
                >

                  <span>

                    {
                      categoryLabel(
                        featuredWriting.category
                      )
                    }

                  </span>


                  <i />


                  <span>

                    {
                      featuredWriting
                        ?.author
                        ?.name
                      ||
                      featuredWriting
                        ?.author_name
                      ||
                      t(
                        "common.unknownAuthor"
                      )
                    }

                  </span>

                </div>


                <h2>

                  {
                    featuredWriting.title
                    ||
                    t(
                      "common.untitled"
                    )
                  }

                </h2>


                <p>

                  {
                    featuredWriting
                      ?.content
                      ?.trim()
                      ?.slice(
                        0,
                        420
                      )
                    ||
                    t(
                      "writingCard.previewUnavailable"
                    )
                  }


                  {
                    featuredWriting
                      ?.content
                      ?.length >
                    420
                      ? "…"
                      : ""
                  }

                </p>


                <Link
                  to={
                    `/writings/${featuredWriting.id}`
                  }
                >

                  {
                    t(
                      "writingCard.read"
                    )
                  }

                  <ArrowRight
                    size={16}
                  />

                </Link>

              </article>


              <div
                className="featured-quote-mark"
              >

                <Quote
                  size={72}
                />

              </div>

            </div>

          </section>

        )}


      {/* =================================================
          PROFESSIONAL SOCIAL FEED
      ================================================== */}

      <section
        className="literary-content-section home-feed-section"
      >

        {/* ===============================================
            FEED HEADER
        ================================================ */}

        <div
          className="literary-section-header home-feed-heading"
        >

          <div>

            <span
              className="literary-section-label"
            >

              {
                labels.feedEyebrow
              }

            </span>


            <h2>
              {
                labels.feedTitle
              }
            </h2>


            <p>
              {
                labels.feedDescription
              }
            </p>

          </div>


          <button
            type="button"
            className="home-feed-refresh"
            onClick={
              handleRefreshFeed
            }
            disabled={
              feedLoading
            }
            title={
              labels.refresh
            }
            aria-label={
              labels.refresh
            }
          >

            {feedLoading
              ? (

                <Loader2
                  size={17}
                  className="home-feed-spin"
                />

              )
              : (

                <RefreshCw
                  size={17}
                />

              )}

            <span>
              {
                labels.refresh
              }
            </span>

          </button>

        </div>


        {/* ===============================================
            FEED TAB BAR
        ================================================ */}

        <div
          className="home-feed-tabs"
          role="tablist"
          aria-label="SHOBDO feed"
        >

          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              FEED_TYPES.FOR_YOU
            }
            className={
              activeFeed ===
              FEED_TYPES.FOR_YOU
                ? "home-feed-tab home-feed-tab-active"
                : "home-feed-tab"
            }
            onClick={
              () =>
                setActiveFeed(
                  FEED_TYPES.FOR_YOU
                )
            }
          >

            <Sparkles
              size={17}
            />

            <span>
              {
                labels.forYou
              }
            </span>

          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              FEED_TYPES.FOLLOWING
            }
            className={
              activeFeed ===
              FEED_TYPES.FOLLOWING
                ? "home-feed-tab home-feed-tab-active"
                : "home-feed-tab"
            }
            onClick={
              () =>
                setActiveFeed(
                  FEED_TYPES.FOLLOWING
                )
            }
          >

            <UsersRound
              size={17}
            />

            <span>
              {
                labels.following
              }
            </span>

          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              FEED_TYPES.LATEST
            }
            className={
              activeFeed ===
              FEED_TYPES.LATEST
                ? "home-feed-tab home-feed-tab-active"
                : "home-feed-tab"
            }
            onClick={
              () =>
                setActiveFeed(
                  FEED_TYPES.LATEST
                )
            }
          >

            <Clock3
              size={17}
            />

            <span>
              {
                labels.latest
              }
            </span>

          </button>

        </div>


        {/* ===============================================
            FOLLOWING LOGIN REQUIRED
        ================================================ */}

        {!feedLoading &&
          followingRequiresLogin &&
          activeFeed ===
            FEED_TYPES.FOLLOWING && (

            <div
              className="home-feed-state home-feed-auth-state"
            >

              <div
                className="home-feed-state-icon"
              >

                <UsersRound
                  size={28}
                />

              </div>


              <h3>
                {
                  labels.followingLoginTitle
                }
              </h3>


              <p>
                {
                  labels.followingLoginDescription
                }
              </p>


              <Link
                to="/login"
                className="literary-primary-button"
              >

                {
                  labels.login
                }

              </Link>

            </div>

          )}


        {/* ===============================================
            LOADING
        ================================================ */}

        {feedLoading &&
          !followingRequiresLogin && (

            <div
              className="home-feed-state"
            >

              <Loader2
                size={30}
                className="home-feed-spin"
              />


              <span>
                {
                  labels.loadingFeed
                }
              </span>

            </div>

          )}


        {/* ===============================================
            ERROR
        ================================================ */}

        {!feedLoading &&
          !followingRequiresLogin &&
          feedError && (

            <div
              className="home-feed-state home-feed-error-state"
            >

              <Feather
                size={30}
              />


              <h3>
                {
                  labels.feedError
                }
              </h3>


              <p>
                {
                  feedError
                }
              </p>


              <button
                type="button"
                onClick={
                  handleRefreshFeed
                }
              >

                <RefreshCw
                  size={16}
                />

                {
                  labels.retry
                }

              </button>

            </div>

          )}


        {/* ===============================================
            EMPTY
        ================================================ */}

        {!feedLoading &&
          !followingRequiresLogin &&
          !feedError &&
          feedWritings.length === 0 && (

            <div
              className="home-feed-state"
            >

              <div
                className="home-feed-state-icon"
              >

                <Feather
                  size={28}
                />

              </div>


              <h3>
                {
                  emptyFeedMessage
                }
              </h3>


              <Link
                to="/explore"
                className="literary-text-button"
              >

                {
                  labels.explore
                }

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>

          )}


        {/* ===============================================
            FEED
        ================================================ */}

        {!feedLoading &&
          !followingRequiresLogin &&
          !feedError &&
          feedWritings.length > 0 && (

            <>

              <div
                className="home-feed-list"
              >

                {feedWritings.map(
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

              </div>


              {/* =========================================
                  FEED SUMMARY
              ========================================== */}

              {feedTotal > 0 && (

                <div
                  className="home-feed-summary"
                >

                  <span>
                    {
                      feedWritings.length
                    }
                  </span>

                  <span>
                    /
                  </span>

                  <span>
                    {
                      feedTotal
                    }
                  </span>

                </div>

              )}


              {/* =========================================
                  LOAD MORE
              ========================================== */}

              {feedHasNext && (

                <div
                  className="home-feed-load-more-wrap"
                >

                  <button
                    type="button"
                    className="home-feed-load-more"
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
                            className="home-feed-spin"
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

                          <BookOpen
                            size={18}
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

      </section>


      {/* =================================================
          FINAL CALL TO WRITE
      ================================================== */}

      <section
        className="literary-final-section"
      >

        <div
          className="final-background-word"
        >
          SHOBDO
        </div>


        <div
          className="literary-final-inner"
        >

          <Feather
            size={34}
          />


          <span>

            {
              t(
                "home.finalEyebrow",
                "YOUR PAGE IS STILL BLANK"
              )
            }

          </span>


          <h2>

            {
              t(
                "home.finalTitle",
                "Someone may be waiting to read the words only you can write."
              )
            }

          </h2>


          <p>

            {
              t(
                "home.finalDescription",
                "Begin with one sentence. The rest can find its way."
              )
            }

          </p>


          <Link
            to="/write"
            className="literary-final-button"
          >

            {
              t(
                "home.beginWriting",
                "Write something"
              )
            }

            <ArrowRight
              size={17}
            />

          </Link>

        </div>

      </section>

    </main>

  );

}


export default Home;