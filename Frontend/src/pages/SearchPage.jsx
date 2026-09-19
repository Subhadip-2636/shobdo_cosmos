import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";


import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Hash,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";


import {
  followUser,
  getToken,
  globalSearch,
  unfollowUser,
} from "../api/api";


import {
  useLanguage,
} from "../Language/LanguageContext";


import SEO from "../components/SEO";

import "./SearchPage.css";


// =========================================================
// CONSTANTS
// =========================================================

const PAGE_SIZE = 12;


const VALID_TYPES = [
  "all",
  "writings",
  "writers",
  "tags",
];


// =========================================================
// MULTILINGUAL COPY
// =========================================================

const COPY = {

  en: {

    eyebrow:
      "Discover SHOBDO",

    title:
      "Search",

    description:
      "Discover writers, writings and topics from the multilingual SHOBDO community.",

    placeholder:
      "Search writings, writers, topics or hashtags...",

    search:
      "Search",

    clear:
      "Clear search",

    all:
      "All",

    writings:
      "Writings",

    writers:
      "Writers",

    tags:
      "Tags",

    writersFound:
      "Writers",

    writingsFound:
      "Writings",

    topicsFound:
      "Topics",

    result:
      "result",

    results:
      "results",

    resultsFor:
      "Results for",

    follow:
      "Follow",

    following:
      "Following",

    you:
      "You",

    viewProfile:
      "View profile",

    readWriting:
      "Read writing",

    exploreTag:
      "Explore topic",

    matchedWritings:
      "matched writings",

    noResults:
      "No results found",

    noResultsDescription:
      "Try another writer name, username, title, keyword or hashtag.",

    noTags:
      "No matching topics found",

    noTagsDescription:
      "Try a different hashtag or search term.",

    startSearching:
      "Discover the SHOBDO community",

    startSearchingDescription:
      "Search for writers, poems, stories, essays, ideas and hashtags across SHOBDO.",

    initialWritings:
      "Writings",

    initialWriters:
      "Writers",

    initialTopics:
      "Topics",

    loading:
      "Searching SHOBDO...",

    error:
      "Unable to complete search.",

    retry:
      "Try again",

    previous:
      "Previous",

    next:
      "Next",

    page:
      "Page",

    of:
      "of",

    untitled:
      "Untitled",

    writing:
      "Writing",

    noBio:
      "SHOBDO writer",

    searchAgain:
      "Search again",

  },


  bn: {

    eyebrow:
      "SHOBDO আবিষ্কার করুন",

    title:
      "অনুসন্ধান",

    description:
      "বহুভাষিক SHOBDO সম্প্রদায়ের লেখক, লেখা ও বিষয় আবিষ্কার করুন।",

    placeholder:
      "লেখা, লেখক, বিষয় বা হ্যাশট্যাগ খুঁজুন...",

    search:
      "খুঁজুন",

    clear:
      "অনুসন্ধান মুছুন",

    all:
      "সব",

    writings:
      "লেখা",

    writers:
      "লেখক",

    tags:
      "ট্যাগ",

    writersFound:
      "লেখক",

    writingsFound:
      "লেখা",

    topicsFound:
      "বিষয়",

    result:
      "ফলাফল",

    results:
      "ফলাফল",

    resultsFor:
      "ফলাফল",

    follow:
      "অনুসরণ করুন",

    following:
      "অনুসরণ করছেন",

    you:
      "আপনি",

    viewProfile:
      "প্রোফাইল দেখুন",

    readWriting:
      "লেখাটি পড়ুন",

    exploreTag:
      "বিষয়টি দেখুন",

    matchedWritings:
      "মিলে যাওয়া লেখা",

    noResults:
      "কোনো ফলাফল পাওয়া যায়নি",

    noResultsDescription:
      "অন্য লেখকের নাম, ইউজারনেম, শিরোনাম, শব্দ বা হ্যাশট্যাগ দিয়ে চেষ্টা করুন।",

    noTags:
      "মিলে যাওয়া কোনো বিষয় পাওয়া যায়নি",

    noTagsDescription:
      "অন্য হ্যাশট্যাগ বা শব্দ দিয়ে চেষ্টা করুন।",

    startSearching:
      "SHOBDO সম্প্রদায়কে আবিষ্কার করুন",

    startSearchingDescription:
      "লেখক, কবিতা, গল্প, প্রবন্ধ, ভাবনা ও হ্যাশট্যাগ খুঁজে নিন।",

    initialWritings:
      "লেখা",

    initialWriters:
      "লেখক",

    initialTopics:
      "বিষয়",

    loading:
      "SHOBDO-তে খোঁজা হচ্ছে...",

    error:
      "অনুসন্ধান সম্পন্ন করা যায়নি।",

    retry:
      "আবার চেষ্টা করুন",

    previous:
      "পূর্ববর্তী",

    next:
      "পরবর্তী",

    page:
      "পৃষ্ঠা",

    of:
      "এর",

    untitled:
      "শিরোনামহীন",

    writing:
      "লেখা",

    noBio:
      "SHOBDO লেখক",

    searchAgain:
      "আবার খুঁজুন",

  },


  hi: {

    eyebrow:
      "SHOBDO खोजें",

    title:
      "खोज",

    description:
      "बहुभाषी SHOBDO समुदाय के लेखकों, रचनाओं और विषयों को खोजें।",

    placeholder:
      "रचनाएँ, लेखक, विषय या हैशटैग खोजें...",

    search:
      "खोजें",

    clear:
      "खोज साफ़ करें",

    all:
      "सभी",

    writings:
      "रचनाएँ",

    writers:
      "लेखक",

    tags:
      "टैग",

    writersFound:
      "लेखक",

    writingsFound:
      "रचनाएँ",

    topicsFound:
      "विषय",

    result:
      "परिणाम",

    results:
      "परिणाम",

    resultsFor:
      "परिणाम",

    follow:
      "फ़ॉलो करें",

    following:
      "फ़ॉलो कर रहे हैं",

    you:
      "आप",

    viewProfile:
      "प्रोफ़ाइल देखें",

    readWriting:
      "रचना पढ़ें",

    exploreTag:
      "विषय देखें",

    matchedWritings:
      "मिलती रचनाएँ",

    noResults:
      "कोई परिणाम नहीं मिला",

    noResultsDescription:
      "किसी दूसरे लेखक, यूज़रनेम, शीर्षक, शब्द या हैशटैग से खोजें।",

    noTags:
      "कोई मिलता विषय नहीं मिला",

    noTagsDescription:
      "किसी दूसरे हैशटैग या शब्द से खोजें।",

    startSearching:
      "SHOBDO समुदाय खोजें",

    startSearchingDescription:
      "लेखक, कविताएँ, कहानियाँ, निबंध, विचार और हैशटैग खोजें।",

    initialWritings:
      "रचनाएँ",

    initialWriters:
      "लेखक",

    initialTopics:
      "विषय",

    loading:
      "SHOBDO में खोजा जा रहा है...",

    error:
      "खोज पूरी नहीं हो सकी।",

    retry:
      "फिर कोशिश करें",

    previous:
      "पिछला",

    next:
      "अगला",

    page:
      "पृष्ठ",

    of:
      "में से",

    untitled:
      "बिना शीर्षक",

    writing:
      "रचना",

    noBio:
      "SHOBDO लेखक",

    searchAgain:
      "फिर खोजें",

  },

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
    ? number
    : 0;

}


function getInitials(
  name
) {

  const value =
    String(
      name ||
      ""
    )
      .trim();


  if (
    !value
  ) {

    return "?";

  }


  const pieces =
    value
      .split(
        /\s+/
      )
      .filter(
        Boolean
      );


  if (
    pieces.length ===
      1
  ) {

    return pieces[0]
      .slice(
        0,
        2
      )
      .toUpperCase();

  }


  return (
    `${pieces[0][0]}${pieces[pieces.length - 1][0]}`
  ).toUpperCase();

}


function stripHtml(
  value
) {

  return String(
    value ||
    ""
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


function getLocale(
  language
) {

  if (
    language ===
      "bn"
  ) {

    return "bn-IN";

  }


  if (
    language ===
      "hi"
  ) {

    return "hi-IN";

  }


  if (
    language ===
      "as"
  ) {

    return "as-IN";

  }


  if (
    language ===
      "or"
  ) {

    return "or-IN";

  }


  if (
    language ===
      "ta"
  ) {

    return "ta-IN";

  }


  if (
    language ===
      "te"
  ) {

    return "te-IN";

  }


  return "en-IN";

}


function formatDate(
  value,
  language
) {

  if (
    !value
  ) {

    return "";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  try {

    return new Intl.DateTimeFormat(
      getLocale(
        language
      ),
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    ).format(
      date
    );

  } catch {

    return "";

  }

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


function getWritingTags(
  writing
) {

  const rawTags =
    [];


  if (
    Array.isArray(
      writing?.tags
    )
  ) {

    rawTags.push(
      ...writing.tags
    );

  }


  if (
    Array.isArray(
      writing?.hashtags
    )
  ) {

    rawTags.push(
      ...writing.hashtags
    );

  }


  const unique =
    new Map();


  rawTags.forEach(
    (
      item
    ) => {

      const value =
        typeof item ===
          "string"
          ? item
          : item?.name;


      const normalized =
        normalizeTagName(
          value
        );


      if (
        !normalized
      ) {

        return;

      }


      const key =
        normalized
          .toLocaleLowerCase();


      if (
        !unique.has(
          key
        )
      ) {

        unique.set(
          key,
          normalized
        );

      }

    }
  );


  return Array.from(
    unique.values()
  );

}


// =========================================================
// WRITER AVATAR
// =========================================================

function WriterAvatar({
  writer,
}) {

  return (

    <div
      className="search-writer-avatar"
    >

      <span>

        {
          getInitials(
            writer?.name ||
            writer?.username
          )
        }

      </span>


      {writer?.avatar_url && (

        <img
          src={
            writer.avatar_url
          }
          alt=""
          loading="lazy"
          onError={
            (
              event
            ) => {

              event.currentTarget
                .style
                .display =
                "none";

            }
          }
        />

      )}

    </div>

  );

}


// =========================================================
// SEARCH SKELETON
// =========================================================

function SearchSkeleton({
  type,
}) {

  return (

    <section
      className="search-skeleton"
      aria-hidden="true"
    >

      {(type ===
        "all" ||
        type ===
          "writers") && (

        <div
          className="search-skeleton-writers"
        >

          {Array.from({
            length:
              3,
          }).map(
            (
              _,
              index
            ) => (

              <div
                key={
                  `writer-skeleton-${index}`
                }
                className="search-writer-skeleton"
              >

                <div
                  className="search-skeleton-avatar"
                />


                <div
                  className="search-skeleton-writer-copy"
                >

                  <span />

                  <span />

                  <span />

                </div>

              </div>

            )
          )}

        </div>

      )}


      {(type ===
        "all" ||
        type ===
          "writings" ||
        type ===
          "tags") && (

        <div
          className="search-skeleton-writing-list"
        >

          {Array.from({
            length:
              3,
          }).map(
            (
              _,
              index
            ) => (

              <div
                key={
                  `writing-skeleton-${index}`
                }
                className="search-writing-skeleton"
              >

                <div
                  className="search-skeleton-writing-author"
                >

                  <div
                    className="search-skeleton-mini-avatar"
                  />

                  <div>

                    <span />

                    <span />

                  </div>

                </div>


                <div
                  className="search-skeleton-title"
                />


                <div
                  className="search-skeleton-copy"
                >

                  <span />

                  <span />

                  <span />

                </div>

              </div>

            )
          )}

        </div>

      )}

    </section>

  );

}


// =========================================================
// SEARCH PAGE
// =========================================================

function SearchPage() {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const {
    language,
  } =
    useLanguage();


  const copy =
    COPY[
      language
    ] ||
    COPY.en;


  const searchInputRef =
    useRef(
      null
    );


  const resultsRef =
    useRef(
      null
    );


  // =======================================================
  // URL STATE
  // =======================================================

  const query =
    String(
      searchParams.get(
        "q"
      ) ||
      ""
    )
      .trim();


  const rawType =
    String(
      searchParams.get(
        "type"
      ) ||
      "all"
    )
      .trim()
      .toLowerCase();


  const type =
    VALID_TYPES.includes(
      rawType
    )
      ? rawType
      : "all";


  const page =
    Math.max(
      Number(
        searchParams.get(
          "page"
        )
      ) ||
      1,
      1
    );


  // =======================================================
  // STATE
  // =======================================================

  const [
    input,
    setInput,
  ] =
    useState(
      query
    );


  const [
    data,
    setData,
  ] =
    useState(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    followLoading,
    setFollowLoading,
  ] =
    useState({});


  const [
    retryKey,
    setRetryKey,
  ] =
    useState(
      0
    );


  // =======================================================
  // SYNC INPUT WITH URL
  // =======================================================

  useEffect(
    () => {

      setInput(
        query
      );

    },
    [
      query,
    ]
  );


  // =======================================================
  // SEO
  // =======================================================

  const seoTypeLabel =
    type ===
      "writers"
      ? copy.writers
      : type ===
          "writings"
        ? copy.writings
        : type ===
            "tags"
          ? copy.tags
          : "";


  const seoTitle =
    query
      ? [
          `${copy.search} “${query}”`,

          seoTypeLabel,

          page > 1
            ? `${copy.page} ${page}`
            : "",
        ]
          .filter(
            Boolean
          )
          .join(
            " — "
          )
      : copy.title;


  const seoDescription =
    useMemo(
      () => {

        if (
          !query
        ) {

          return copy.description;

        }


        if (
          language ===
            "bn"
        ) {

          if (
            type ===
              "writers"
          ) {

            return `SHOBDO-তে “${query}” নাম বা পরিচয়ের লেখকদের খুঁজুন।`;

          }


          if (
            type ===
              "writings"
          ) {

            return `SHOBDO-তে “${query}” সম্পর্কিত প্রকাশিত লেখা, কবিতা, গল্প ও প্রবন্ধ খুঁজুন।`;

          }


          if (
            type ===
              "tags"
          ) {

            return `SHOBDO-তে “${query}” সম্পর্কিত বিষয় ও হ্যাশট্যাগ আবিষ্কার করুন।`;

          }


          return `SHOBDO-তে “${query}” সম্পর্কিত লেখক, লেখা ও বিষয় খুঁজুন।`;

        }


        if (
          language ===
            "hi"
        ) {

          if (
            type ===
              "writers"
          ) {

            return `SHOBDO पर “${query}” नाम या पहचान वाले लेखकों को खोजें।`;

          }


          if (
            type ===
              "writings"
          ) {

            return `SHOBDO पर “${query}” से संबंधित रचनाएँ, कविताएँ, कहानियाँ और निबंध खोजें।`;

          }


          if (
            type ===
              "tags"
          ) {

            return `SHOBDO पर “${query}” से संबंधित विषय और हैशटैग खोजें।`;

          }


          return `SHOBDO पर “${query}” से संबंधित लेखक, रचनाएँ और विषय खोजें।`;

        }


        if (
          type ===
            "writers"
        ) {

          return `Search SHOBDO for writers matching “${query}”.`;

        }


        if (
          type ===
            "writings"
        ) {

          return `Search SHOBDO for writings, poems, stories and essays related to “${query}”.`;

        }


        if (
          type ===
            "tags"
        ) {

          return `Discover SHOBDO topics and hashtags related to “${query}”.`;

        }


        return `Search SHOBDO for writers, writings and topics related to “${query}”.`;

      },
      [
        query,
        type,
        language,
        copy.description,
      ]
    );


  /*
   * The base /search discovery page can be indexed.
   *
   * Actual search-result URLs are intentionally noindex
   * because internal search pages can generate a very
   * large number of low-value or duplicate URL variants.
   *
   * With the current SEO.jsx implementation, noIndex
   * results in "noindex, nofollow".
   */

  const seoNoIndex =
    Boolean(
      query
    ) ||
    type !==
      "all" ||
    page > 1;


  const seoPath =
    seoNoIndex
      ? ""
      : "/search";


  // =======================================================
  // LOAD SEARCH RESULTS
  // =======================================================

  useEffect(
    () => {

      let active =
        true;


      async function loadSearch() {

        if (
          !query
        ) {

          setData(
            null
          );


          setError(
            ""
          );


          setLoading(
            false
          );


          return;

        }


        try {

          setLoading(
            true
          );


          setError(
            ""
          );


          /*
           * Backend currently supports:
           *
           * all
           * writers
           * writings
           *
           * Tags are derived from writing results,
           * so the tags tab requests writings.
           */

          const apiType =
            type ===
              "tags"
              ? "writings"
              : type;


          const response =
            await globalSearch({

              query,

              type:
                apiType,

              page,

              limit:
                PAGE_SIZE,

            });


          if (
            !active
          ) {

            return;

          }


          setData(
            response ||
            null
          );

        } catch (
          searchError
        ) {

          console.error(
            "GLOBAL SEARCH ERROR:",
            searchError
          );


          if (
            !active
          ) {

            return;

          }


          setError(
            searchError?.message ||
            copy.error
          );

        } finally {

          if (
            active
          ) {

            setLoading(
              false
            );

          }

        }

      }


      loadSearch();


      return () => {

        active =
          false;

      };

    },
    [
      query,
      type,
      page,
      retryKey,
      copy.error,
    ]
  );


  // =======================================================
  // RAW RESULTS
  // =======================================================

  const writers =
    Array.isArray(
      data
        ?.writers
        ?.items
    )
      ? data
          .writers
          .items
      : [];


  const writings =
    Array.isArray(
      data
        ?.writings
        ?.items
    )
      ? data
          .writings
          .items
      : [];


  const writersTotal =
    safeNumber(
      data
        ?.totals
        ?.writers
    );


  const writingsTotal =
    safeNumber(
      data
        ?.totals
        ?.writings
    );


  const total =
    safeNumber(
      data
        ?.totals
        ?.all
    );


  const writerPages =
    Math.max(
      safeNumber(
        data
          ?.writers
          ?.pages
      ),
      1
    );


  const writingPages =
    Math.max(
      safeNumber(
        data
          ?.writings
          ?.pages
      ),
      1
    );


  // =======================================================
  // DERIVED TAG RESULTS
  // =======================================================

  const tags =
    useMemo(
      () => {

        const map =
          new Map();


        const cleanQuery =
          normalizeTagName(
            query
          )
            .toLocaleLowerCase();


        writings.forEach(
          (
            writing
          ) => {

            getWritingTags(
              writing
            ).forEach(
              (
                name
              ) => {

                const key =
                  name
                    .toLocaleLowerCase();


                if (
                  cleanQuery &&
                  !key.includes(
                    cleanQuery
                  )
                ) {

                  return;

                }


                if (
                  !map.has(
                    key
                  )
                ) {

                  map.set(
                    key,
                    {
                      name,

                      count:
                        0,
                    }
                  );

                }


                map.get(
                  key
                ).count +=
                  1;

              }
            );

          }
        );


        return Array.from(
          map.values()
        )
          .sort(
            (
              a,
              b
            ) => {

              if (
                b.count !==
                  a.count
              ) {

                return (
                  b.count -
                  a.count
                );

              }


              return a.name.localeCompare(
                b.name
              );

            }
          )
          .slice(
            0,
            24
          );

      },
      [
        writings,
        query,
      ]
    );


  const tagsTotal =
    tags.length;


  // =======================================================
  // TOTAL PAGES
  // =======================================================

  const totalPages =
    type ===
      "writers"
      ? writerPages
      : type ===
          "writings" ||
        type ===
          "tags"
        ? writingPages
        : Math.max(
            writerPages,
            writingPages,
            1
          );


  // =======================================================
  // RESULT PRESENCE
  // =======================================================

  const hasVisibleResults =
    type ===
      "writers"
      ? writers.length >
          0
      : type ===
          "writings"
        ? writings.length >
            0
        : type ===
            "tags"
          ? tags.length >
              0
          : (
              writers.length >
                0 ||
              writings.length >
                0 ||
              tags.length >
                0
            );


  // =======================================================
  // SEARCH SUBMIT
  // =======================================================

  function handleSubmit(
    event
  ) {

    event.preventDefault();


    const nextQuery =
      input.trim();


    if (
      !nextQuery
    ) {

      setSearchParams({});

      return;

    }


    const nextParams = {

      q:
        nextQuery,

    };


    if (
      type !==
        "all"
    ) {

      nextParams.type =
        type;

    }


    setSearchParams(
      nextParams
    );

  }


  // =======================================================
  // CLEAR
  // =======================================================

  function handleClear() {

    setInput(
      ""
    );


    setData(
      null
    );


    setError(
      ""
    );


    setSearchParams({});


    requestAnimationFrame(
      () => {

        searchInputRef
          .current
          ?.focus();

      }
    );

  }


  // =======================================================
  // TAB
  // =======================================================

  function handleTypeChange(
    nextType
  ) {

    const params =
      {};


    if (
      query
    ) {

      params.q =
        query;

    }


    if (
      nextType !==
        "all"
    ) {

      params.type =
        nextType;

    }


    setSearchParams(
      params
    );

  }


  // =======================================================
  // PAGE
  // =======================================================

  function changePage(
    nextPage
  ) {

    const normalizedPage =
      Math.min(
        Math.max(
          nextPage,
          1
        ),
        totalPages
      );


    const params = {

      q:
        query,

    };


    if (
      type !==
        "all"
    ) {

      params.type =
        type;

    }


    if (
      normalizedPage >
        1
    ) {

      params.page =
        String(
          normalizedPage
        );

    }


    setSearchParams(
      params
    );


    requestAnimationFrame(
      () => {

        resultsRef
          .current
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });

      }
    );

  }


  // =======================================================
  // FOLLOW / UNFOLLOW
  // =======================================================

  async function handleFollowToggle(
    writer
  ) {

    if (
      !writer?.id ||
      writer?.is_self
    ) {

      return;

    }


    if (
      !getToken()
    ) {

      navigate(
        "/login",
        {
          state: {

            from:
              `${location.pathname}${location.search}`,

          },
        }
      );


      return;

    }


    const writerId =
      Number(
        writer.id
      );


    if (
      followLoading[
        writerId
      ]
    ) {

      return;

    }


    const previousFollowing =
      Boolean(
        writer.following
      );


    const nextFollowing =
      !previousFollowing;


    setFollowLoading(
      (
        current
      ) => ({

        ...current,

        [writerId]:
          true,

      })
    );


    // =====================================================
    // OPTIMISTIC UPDATE
    // =====================================================

    setData(
      (
        current
      ) => {

        if (
          !current
        ) {

          return current;

        }


        return {

          ...current,

          writers: {

            ...current.writers,

            items:
              (
                current
                  ?.writers
                  ?.items ||
                []
              )
                .map(
                  (
                    item
                  ) =>

                    Number(
                      item.id
                    ) ===
                      writerId
                      ? {

                          ...item,

                          following:
                            nextFollowing,

                        }
                      : item
                ),

          },

        };

      }
    );


    try {

      const response =
        previousFollowing
          ? await unfollowUser(
              writerId
            )
          : await followUser(
              writerId
            );


      setData(
        (
          current
        ) => {

          if (
            !current
          ) {

            return current;

          }


          return {

            ...current,

            writers: {

              ...current.writers,

              items:
                (
                  current
                    ?.writers
                    ?.items ||
                  []
                )
                  .map(
                    (
                      item
                    ) =>

                      Number(
                        item.id
                      ) ===
                        writerId
                        ? {

                            ...item,

                            following:
                              typeof response
                                ?.following ===
                                "boolean"
                                ? response.following
                                : nextFollowing,

                          }
                        : item
                  ),

            },

          };

        }
      );

    } catch (
      followError
    ) {

      console.error(
        "SEARCH FOLLOW ERROR:",
        followError
      );


      // ===================================================
      // ROLLBACK
      // ===================================================

      setData(
        (
          current
        ) => {

          if (
            !current
          ) {

            return current;

          }


          return {

            ...current,

            writers: {

              ...current.writers,

              items:
                (
                  current
                    ?.writers
                    ?.items ||
                  []
                )
                  .map(
                    (
                      item
                    ) =>

                      Number(
                        item.id
                      ) ===
                        writerId
                        ? {

                            ...item,

                            following:
                              previousFollowing,

                          }
                        : item
                  ),

            },

          };

        }
      );

    } finally {

      setFollowLoading(
        (
          current
        ) => ({

          ...current,

          [writerId]:
            false,

        })
      );

    }

  }


  // =======================================================
  // RESULT LABEL
  // =======================================================

  const resultLabel =
    useMemo(
      () => {

        const count =
          type ===
            "writers"
            ? writersTotal
            : type ===
                "writings"
              ? writingsTotal
              : type ===
                  "tags"
                ? tagsTotal
                : total;


        return (
          `${count} ${
            count ===
              1
              ? copy.result
              : copy.results
          }`
        );

      },
      [
        type,
        writersTotal,
        writingsTotal,
        tagsTotal,
        total,
        copy.result,
        copy.results,
      ]
    );


  // =======================================================
  // TABS
  // =======================================================

  const tabs = [

    {
      id:
        "all",

      label:
        copy.all,

      icon:
        Search,

      count:
        total,
    },


    {
      id:
        "writings",

      label:
        copy.writings,

      icon:
        BookOpen,

      count:
        writingsTotal,
    },


    {
      id:
        "writers",

      label:
        copy.writers,

      icon:
        Users,

      count:
        writersTotal,
    },


    {
      id:
        "tags",

      label:
        copy.tags,

      icon:
        Hash,

      count:
        tagsTotal,
    },

  ];


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


      <main
        className="search-page"
      >

        <div
          className="search-page-shell"
        >


          {/* =================================================
              HERO
          ================================================== */}

          <section
            className="search-hero"
          >

            <div
              className="search-hero-glow"
              aria-hidden="true"
            />


            <div
              className="search-hero-copy"
            >

              <div
                className="search-eyebrow"
              >

                <Sparkles
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  {
                    copy.eyebrow
                  }
                </span>

              </div>


              <h1>
                {
                  copy.title
                }
              </h1>


              <p
                className="search-description"
              >
                {
                  copy.description
                }
              </p>

            </div>


            {/* ===============================================
                SEARCH FORM
            ================================================ */}

            <form
              className="global-search-form"
              onSubmit={
                handleSubmit
              }
              role="search"
            >

              <div
                className="global-search-input-wrap"
              >

                <Search
                  size={20}
                  aria-hidden="true"
                />


                <input
                  ref={
                    searchInputRef
                  }
                  type="search"
                  value={
                    input
                  }
                  onChange={
                    (
                      event
                    ) =>

                      setInput(
                        event.target.value
                      )
                  }
                  placeholder={
                    copy.placeholder
                  }
                  maxLength={
                    120
                  }
                  autoComplete="off"
                  enterKeyHint="search"
                  spellCheck="false"
                  aria-label={
                    copy.placeholder
                  }
                />


                {input && (

                  <button
                    type="button"
                    className="global-search-clear"
                    onClick={
                      handleClear
                    }
                    aria-label={
                      copy.clear
                    }
                    title={
                      copy.clear
                    }
                  >

                    <X
                      size={17}
                      aria-hidden="true"
                    />

                  </button>

                )}

              </div>


              <button
                type="submit"
                className="global-search-submit"
                disabled={
                  !input.trim()
                }
              >

                <Search
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  {
                    copy.search
                  }
                </span>

              </button>

            </form>

          </section>


          {/* =================================================
              TABS
          ================================================== */}

          {query && (

            <section
              className="search-tabs-bar"
            >

              <div
                className="search-tabs"
                role="tablist"
                aria-label={
                  copy.title
                }
              >

                {tabs.map(
                  (
                    tab
                  ) => {

                    const Icon =
                      tab.icon;


                    return (

                      <button
                        key={
                          tab.id
                        }
                        type="button"
                        role="tab"
                        aria-selected={
                          type ===
                            tab.id
                        }
                        className={
                          type ===
                            tab.id
                            ? "search-tab active"
                            : "search-tab"
                        }
                        onClick={
                          () =>
                            handleTypeChange(
                              tab.id
                            )
                        }
                      >

                        <Icon
                          size={16}
                          aria-hidden="true"
                        />


                        <span
                          className="search-tab-label"
                        >
                          {
                            tab.label
                          }
                        </span>


                        {data &&
                          !loading && (

                          <span
                            className="search-tab-count"
                          >
                            {
                              tab.count
                            }
                          </span>

                        )}

                      </button>

                    );

                  }
                )}

              </div>


              {data &&
                !loading && (

                <p
                  className="search-result-count"
                  aria-live="polite"
                >
                  {
                    resultLabel
                  }
                </p>

              )}

            </section>

          )}


          {/* =================================================
              INITIAL STATE
          ================================================== */}

          {!query && (

            <section
              className="search-initial-state"
            >

              <div
                className="search-state-icon"
              >

                <Search
                  size={29}
                  aria-hidden="true"
                />

              </div>


              <h2>
                {
                  copy.startSearching
                }
              </h2>


              <p>
                {
                  copy.startSearchingDescription
                }
              </p>


              <div
                className="search-discovery-types"
              >

                <div>

                  <BookOpen
                    size={19}
                    aria-hidden="true"
                  />

                  <span>
                    {
                      copy.initialWritings
                    }
                  </span>

                </div>


                <div>

                  <Users
                    size={19}
                    aria-hidden="true"
                  />

                  <span>
                    {
                      copy.initialWriters
                    }
                  </span>

                </div>


                <div>

                  <Hash
                    size={19}
                    aria-hidden="true"
                  />

                  <span>
                    {
                      copy.initialTopics
                    }
                  </span>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              LOADING
          ================================================== */}

          {query &&
            loading && (

            <div
              className="search-loading-wrap"
              aria-live="polite"
              aria-busy="true"
            >

              <div
                className="search-loading-heading"
              >

                <Loader2
                  size={18}
                  className="search-spin"
                  aria-hidden="true"
                />

                <span>
                  {
                    copy.loading
                  }
                </span>

              </div>


              <SearchSkeleton
                type={
                  type
                }
              />

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================== */}

          {query &&
            error &&
            !loading && (

            <section
              className="search-error-state"
            >

              <div
                className="search-state-icon error"
              >

                <Search
                  size={29}
                  aria-hidden="true"
                />

              </div>


              <h2>
                {
                  copy.error
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
                    setRetryKey(
                      (
                        current
                      ) =>
                        current + 1
                    )
                }
              >

                {
                  copy.retry
                }

              </button>

            </section>

          )}


          {/* =================================================
              RESULTS
          ================================================== */}

          {query &&
            !loading &&
            !error &&
            data && (

            <div
              className="search-results"
              ref={
                resultsRef
              }
            >


              {/* ===============================================
                  QUERY HEADER
              ================================================ */}

              <header
                className="search-results-header"
              >

                <p>
                  {
                    copy.resultsFor
                  }
                </p>


                <h2>
                  “{query}”
                </h2>

              </header>


              {/* ===============================================
                  TAG RESULTS
              ================================================ */}

              {(type ===
                "all" ||
                type ===
                  "tags") &&
                tags.length >
                  0 && (

                <section
                  className="search-result-section"
                >

                  <div
                    className="search-section-heading"
                  >

                    <div>

                      <p
                        className="search-section-kicker"
                      >
                        {
                          copy.topicsFound
                        }
                      </p>


                      <h3>
                        {
                          copy.tags
                        }
                      </h3>

                    </div>


                    <span>
                      {
                        tags.length
                      }
                    </span>

                  </div>


                  <div
                    className="search-tag-grid"
                  >

                    {tags.map(
                      (
                        tag
                      ) => (

                        <Link
                          key={
                            tag.name
                          }
                          to={
                            `/tag/${encodeURIComponent(
                              tag.name
                            )}`
                          }
                          className="search-tag-card"
                        >

                          <span
                            className="search-tag-icon"
                          >

                            <Hash
                              size={19}
                              aria-hidden="true"
                            />

                          </span>


                          <span
                            className="search-tag-copy"
                          >

                            <strong>
                              #{tag.name}
                            </strong>


                            <small>

                              {tag.count}

                              {" "}

                              {
                                copy.matchedWritings
                              }

                            </small>

                          </span>


                          <ArrowRight
                            size={16}
                            className="search-tag-arrow"
                            aria-hidden="true"
                          />

                        </Link>

                      )
                    )}

                  </div>

                </section>

              )}


              {/* ===============================================
                  WRITERS
              ================================================ */}

              {(type ===
                "all" ||
                type ===
                  "writers") &&
                writers.length >
                  0 && (

                <section
                  className="search-result-section"
                >

                  <div
                    className="search-section-heading"
                  >

                    <div>

                      <p
                        className="search-section-kicker"
                      >
                        {
                          copy.writersFound
                        }
                      </p>


                      <h3>
                        {
                          copy.writers
                        }
                      </h3>

                    </div>


                    <span>
                      {
                        writersTotal
                      }
                    </span>

                  </div>


                  <div
                    className="search-writer-grid"
                  >

                    {writers.map(
                      (
                        writer
                      ) => {

                        const writerId =
                          Number(
                            writer.id
                          );


                        const busy =
                          Boolean(
                            followLoading[
                              writerId
                            ]
                          );


                        return (

                          <article
                            key={
                              writer.id
                            }
                            className="search-writer-card"
                          >

                            <Link
                              to={
                                `/users/${writer.id}`
                              }
                              className="search-writer-main"
                            >

                              <WriterAvatar
                                writer={
                                  writer
                                }
                              />


                              <div
                                className="search-writer-info"
                              >

                                <h4>
                                  {
                                    writer.name ||
                                    copy.noBio
                                  }
                                </h4>


                                {writer.username && (

                                  <p
                                    className="search-writer-username"
                                  >
                                    @{writer.username}
                                  </p>

                                )}


                                <p
                                  className="search-writer-bio"
                                >
                                  {
                                    writer.bio ||
                                    copy.noBio
                                  }
                                </p>


                                <div
                                  className="search-writer-meta"
                                >

                                  {writer.location && (

                                    <span>

                                      <MapPin
                                        size={13}
                                        aria-hidden="true"
                                      />

                                      <span>
                                        {
                                          writer.location
                                        }
                                      </span>

                                    </span>

                                  )}


                                  {writer.website && (

                                    <span>

                                      <Globe2
                                        size={13}
                                        aria-hidden="true"
                                      />

                                      <span>
                                        {
                                          copy.viewProfile
                                        }
                                      </span>

                                    </span>

                                  )}

                                </div>

                              </div>

                            </Link>


                            <div
                              className="search-writer-actions"
                            >

                              {writer.is_self
                                ? (

                                    <span
                                      className="search-you-badge"
                                    >
                                      {
                                        copy.you
                                      }
                                    </span>

                                  )
                                : (

                                    <button
                                      type="button"
                                      className={
                                        writer.following
                                          ? "search-follow-button following"
                                          : "search-follow-button"
                                      }
                                      onClick={
                                        () =>
                                          handleFollowToggle(
                                            writer
                                          )
                                      }
                                      disabled={
                                        busy
                                      }
                                    >

                                      {busy
                                        ? (

                                            <Loader2
                                              size={15}
                                              className="search-spin"
                                              aria-hidden="true"
                                            />

                                          )
                                        : writer.following
                                          ? (

                                              <UserCheck
                                                size={15}
                                                aria-hidden="true"
                                              />

                                            )
                                          : (

                                              <UserPlus
                                                size={15}
                                                aria-hidden="true"
                                              />

                                            )}


                                      <span>
                                        {
                                          writer.following
                                            ? copy.following
                                            : copy.follow
                                        }
                                      </span>

                                    </button>

                                  )}


                              <Link
                                to={
                                  `/users/${writer.id}`
                                }
                                className="search-profile-link"
                                aria-label={
                                  copy.viewProfile
                                }
                                title={
                                  copy.viewProfile
                                }
                              >

                                <ArrowRight
                                  size={16}
                                  aria-hidden="true"
                                />

                              </Link>

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>

                </section>

              )}


              {/* ===============================================
                  WRITINGS
              ================================================ */}

              {(type ===
                "all" ||
                type ===
                  "writings") &&
                writings.length >
                  0 && (

                <section
                  className="search-result-section"
                >

                  <div
                    className="search-section-heading"
                  >

                    <div>

                      <p
                        className="search-section-kicker"
                      >
                        {
                          copy.writingsFound
                        }
                      </p>


                      <h3>
                        {
                          copy.writings
                        }
                      </h3>

                    </div>


                    <span>
                      {
                        writingsTotal
                      }
                    </span>

                  </div>


                  <div
                    className="search-writing-list"
                  >

                    {writings.map(
                      (
                        writing
                      ) => {

                        const author =
                          writing.author ||
                          {};


                        const text =
                          stripHtml(
                            writing.content
                          );


                        const date =
                          formatDate(
                            writing.published_at ||
                            writing.created_at,
                            language
                          );


                        const writingTags =
                          getWritingTags(
                            writing
                          )
                            .slice(
                              0,
                              3
                            );


                        return (

                          <article
                            key={
                              writing.id
                            }
                            className="search-writing-card"
                          >

                            {/* =================================
                                AUTHOR
                            ================================== */}

                            <div
                              className="search-writing-author"
                            >

                              {author.id
                                ? (

                                    <Link
                                      to={
                                        `/users/${author.id}`
                                      }
                                      className="search-writing-author-avatar"
                                    >

                                      <span>
                                        {
                                          getInitials(
                                            author.name
                                          )
                                        }
                                      </span>


                                      {author.avatar_url && (

                                        <img
                                          src={
                                            author.avatar_url
                                          }
                                          alt=""
                                          loading="lazy"
                                          onError={
                                            (
                                              event
                                            ) => {

                                              event
                                                .currentTarget
                                                .style
                                                .display =
                                                "none";

                                            }
                                          }
                                        />

                                      )}

                                    </Link>

                                  )
                                : (

                                    <div
                                      className="search-writing-author-avatar"
                                    >
                                      ?
                                    </div>

                                  )}


                              <div
                                className="search-writing-author-copy"
                              >

                                {author.id
                                  ? (

                                      <Link
                                        to={
                                          `/users/${author.id}`
                                        }
                                        className="search-writing-author-name"
                                      >
                                        {
                                          author.name ||
                                          copy.noBio
                                        }
                                      </Link>

                                    )
                                  : (

                                      <strong>
                                        {
                                          copy.noBio
                                        }
                                      </strong>

                                    )}


                                <div
                                  className="search-writing-author-meta"
                                >

                                  {author.username && (

                                    <span>
                                      @{author.username}
                                    </span>

                                  )}


                                  {date && (

                                    <span>
                                      {
                                        date
                                      }
                                    </span>

                                  )}

                                </div>

                              </div>

                            </div>


                            {/* =================================
                                CONTENT
                            ================================== */}

                            <Link
                              to={
                                `/writings/${writing.id}`
                              }
                              className="search-writing-content"
                            >

                              <div
                                className="search-writing-badges"
                              >

                                <span>
                                  {
                                    writing.category ||
                                    copy.writing
                                  }
                                </span>


                                {writing.language && (

                                  <small>
                                    {
                                      String(
                                        writing.language
                                      )
                                        .toUpperCase()
                                    }
                                  </small>

                                )}

                              </div>


                              <h4>
                                {
                                  writing.title ||
                                  copy.untitled
                                }
                              </h4>


                              {text && (

                                <p>

                                  {
                                    text.slice(
                                      0,
                                      260
                                    )
                                  }

                                  {
                                    text.length >
                                      260
                                      ? "…"
                                      : ""
                                  }

                                </p>

                              )}

                            </Link>


                            {/* =================================
                                TAGS
                            ================================== */}

                            {writingTags.length >
                              0 && (

                              <div
                                className="search-writing-tags"
                              >

                                {writingTags.map(
                                  (
                                    tag
                                  ) => (

                                    <Link
                                      key={
                                        tag
                                      }
                                      to={
                                        `/tag/${encodeURIComponent(
                                          tag
                                        )}`
                                      }
                                    >
                                      #{tag}
                                    </Link>

                                  )
                                )}

                              </div>

                            )}


                            {/* =================================
                                FOOTER
                            ================================== */}

                            <div
                              className="search-writing-footer"
                            >

                              <div
                                className="search-writing-engagement"
                              >

                                <span>

                                  <Heart
                                    size={15}
                                    aria-hidden="true"
                                  />

                                  {
                                    safeNumber(
                                      writing.likes_count
                                    )
                                  }

                                </span>


                                <span>

                                  <MessageCircle
                                    size={15}
                                    aria-hidden="true"
                                  />

                                  {
                                    safeNumber(
                                      writing.comments_count
                                    )
                                  }

                                </span>

                              </div>


                              <Link
                                to={
                                  `/writings/${writing.id}`
                                }
                                className="search-read-link"
                              >

                                {
                                  copy.readWriting
                                }

                                <ArrowRight
                                  size={15}
                                  aria-hidden="true"
                                />

                              </Link>

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>

                </section>

              )}


              {/* ===============================================
                  EMPTY
              ================================================ */}

              {!hasVisibleResults && (

                <section
                  className="search-empty-state"
                >

                  <div
                    className="search-state-icon"
                  >

                    {type ===
                      "tags"
                      ? (

                          <Hash
                            size={29}
                            aria-hidden="true"
                          />

                        )
                      : (

                          <Search
                            size={29}
                            aria-hidden="true"
                          />

                        )}

                  </div>


                  <h3>
                    {
                      type ===
                        "tags"
                        ? copy.noTags
                        : copy.noResults
                    }
                  </h3>


                  <p>
                    {
                      type ===
                        "tags"
                        ? copy.noTagsDescription
                        : copy.noResultsDescription
                    }
                  </p>


                  <button
                    type="button"
                    onClick={
                      () => {

                        setInput(
                          ""
                        );


                        setSearchParams({});


                        requestAnimationFrame(
                          () => {

                            searchInputRef
                              .current
                              ?.focus();

                          }
                        );

                      }
                    }
                  >

                    {
                      copy.searchAgain
                    }

                  </button>

                </section>

              )}


              {/* ===============================================
                  PAGINATION
              ================================================ */}

              {hasVisibleResults &&
                totalPages >
                  1 && (

                <nav
                  className="search-pagination"
                  aria-label="Search pagination"
                >

                  <button
                    type="button"
                    onClick={
                      () =>
                        changePage(
                          page - 1
                        )
                    }
                    disabled={
                      page <=
                        1
                    }
                  >

                    <ChevronLeft
                      size={16}
                      aria-hidden="true"
                    />

                    <span>
                      {
                        copy.previous
                      }
                    </span>

                  </button>


                  <div
                    className="search-pagination-current"
                  >

                    <span>
                      {
                        copy.page
                      }
                    </span>

                    <strong>
                      {
                        page
                      }
                    </strong>

                    <span>
                      {
                        copy.of
                      }
                    </span>

                    <strong>
                      {
                        totalPages
                      }
                    </strong>

                  </div>


                  <button
                    type="button"
                    onClick={
                      () =>
                        changePage(
                          page + 1
                        )
                    }
                    disabled={
                      page >=
                        totalPages
                    }
                  >

                    <span>
                      {
                        copy.next
                      }
                    </span>

                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                    />

                  </button>

                </nav>

              )}

            </div>

          )}

        </div>

      </main>

    </>

  );

}


export default SearchPage;