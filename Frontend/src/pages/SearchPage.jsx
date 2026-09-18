import {
  useEffect,
  useMemo,
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
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
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


import "./SearchPage.css";



const PAGE_SIZE = 12;



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
      "Discover writers, stories, poems and ideas from the SHOBDO community.",

    placeholder:
      "Search writers, usernames or writings...",

    search:
      "Search",

    clear:
      "Clear search",

    all:
      "All",

    writers:
      "Writers",

    writings:
      "Writings",

    writersFound:
      "Writers",

    writingsFound:
      "Writings",

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

    noResults:
      "No results found",

    noResultsDescription:
      "Try another name, username, title or keyword.",

    startSearching:
      "Discover the SHOBDO community",

    startSearchingDescription:
      "Search for writers, poems, stories, essays and other creative works.",

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

  },


  bn: {

    eyebrow:
      "SHOBDO আবিষ্কার করুন",

    title:
      "অনুসন্ধান",

    description:
      "SHOBDO সম্প্রদায়ের লেখক, গল্প, কবিতা ও ভাবনা খুঁজে নিন।",

    placeholder:
      "লেখক, ইউজারনেম বা লেখা খুঁজুন...",

    search:
      "খুঁজুন",

    clear:
      "অনুসন্ধান মুছুন",

    all:
      "সব",

    writers:
      "লেখক",

    writings:
      "লেখা",

    writersFound:
      "লেখক",

    writingsFound:
      "লেখা",

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

    noResults:
      "কোনো ফলাফল পাওয়া যায়নি",

    noResultsDescription:
      "অন্য নাম, ইউজারনেম, শিরোনাম বা শব্দ দিয়ে চেষ্টা করুন।",

    startSearching:
      "SHOBDO সম্প্রদায়কে আবিষ্কার করুন",

    startSearchingDescription:
      "লেখক, কবিতা, গল্প, প্রবন্ধ ও অন্যান্য সৃজনশীল লেখা খুঁজুন।",

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

  },


  hi: {

    eyebrow:
      "SHOBDO खोजें",

    title:
      "खोज",

    description:
      "SHOBDO समुदाय के लेखकों, कहानियों, कविताओं और विचारों को खोजें।",

    placeholder:
      "लेखक, यूज़रनेम या रचनाएँ खोजें...",

    search:
      "खोजें",

    clear:
      "खोज साफ़ करें",

    all:
      "सभी",

    writers:
      "लेखक",

    writings:
      "रचनाएँ",

    writersFound:
      "लेखक",

    writingsFound:
      "रचनाएँ",

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

    noResults:
      "कोई परिणाम नहीं मिला",

    noResultsDescription:
      "किसी दूसरे नाम, यूज़रनेम, शीर्षक या शब्द से खोजें।",

    startSearching:
      "SHOBDO समुदाय खोजें",

    startSearchingDescription:
      "लेखक, कविताएँ, कहानियाँ, निबंध और अन्य रचनाएँ खोजें।",

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

  },

};



// =========================================================
// HELPERS
// =========================================================


function getInitials(
  name
) {

  const value =
    String(
      name || ""
    )
      .trim();


  if (!value) {
    return "?";
  }


  const pieces =
    value
      .split(/\s+/)
      .filter(Boolean);


  if (
    pieces.length === 1
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
      .toUpperCase()
  );

}



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



function stripHtml(
  value
) {

  return String(
    value || ""
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
    language === "bn"
  ) {
    return "bn-BD";
  }


  if (
    language === "hi"
  ) {
    return "hi-IN";
  }


  return "en-IN";

}



function formatDate(
  value,
  language
) {

  if (!value) {
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

    return (
      new Intl.DateTimeFormat(
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
      )
    );


  } catch {

    return "";

  }

}



// =========================================================
// AVATAR
// =========================================================


function WriterAvatar({
  writer,
}) {

  return (

    <div className="search-writer-avatar">

      <span>
        {
          getInitials(
            writer?.name
          )
        }
      </span>


      {
        writer?.avatar_url && (

          <img
            src={
              writer.avatar_url
            }
            alt={
              writer?.name ||
              "Writer"
            }
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

        )
      }

    </div>

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



  // =======================================================
  // URL STATE
  // =======================================================


  const query =
    String(
      searchParams.get(
        "q"
      ) ||
      ""
    ).trim();


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
    [
      "all",
      "writers",
      "writings",
    ].includes(
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
  // LOAD SEARCH
  // =======================================================


  useEffect(
    () => {

      let active =
        true;


      async function loadSearch() {

        if (!query) {

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


          const response =
            await globalSearch({

              query,

              type,

              page,

              limit:
                PAGE_SIZE,

            });


          if (!active) {
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


          if (!active) {
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
      copy.error,
    ]
  );



  // =======================================================
  // DERIVED RESULTS
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


  const totalPages =
    type === "writers"
      ? writerPages
      : type === "writings"
        ? writingPages
        : Math.max(
            writerPages,
            writingPages,
          );


  const hasResults =
    writers.length > 0 ||
    writings.length > 0;



  // =======================================================
  // SUBMIT SEARCH
  // =======================================================


  function handleSubmit(
    event
  ) {

    event.preventDefault();


    const nextQuery =
      input.trim();


    if (!nextQuery) {

      setSearchParams({});

      return;

    }


    const nextParams = {

      q:
        nextQuery,

    };


    if (
      type !== "all"
    ) {

      nextParams.type =
        type;

    }


    setSearchParams(
      nextParams
    );

  }



  // =======================================================
  // CLEAR SEARCH
  // =======================================================


  function handleClear() {

    setInput(
      ""
    );


    setData(
      null
    );


    setSearchParams({});

  }



  // =======================================================
  // TAB
  // =======================================================


  function handleTypeChange(
    nextType
  ) {

    const params = {};


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
      type !== "all"
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


    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });

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


    // optimistic update

    setData(
      (
        current
      ) => {

        if (!current) {
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

          if (!current) {
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
                                ? response
                                    .following
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


      // rollback

      setData(
        (
          current
        ) => {

          if (!current) {
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
              : total;


        return (
          `${count} ${
            count === 1
              ? copy.result
              : copy.results
          }`
        );

      },
      [
        type,
        writersTotal,
        writingsTotal,
        total,
        copy.result,
        copy.results,
      ]
    );



  // =======================================================
  // UI
  // =======================================================


  return (

    <main className="search-page">

      <div className="search-page-shell">


        {/* =================================================
            HERO
        ================================================== */}

        <section className="search-hero">

          <div className="search-hero-copy">

            <p className="search-eyebrow">
              {copy.eyebrow}
            </p>


            <h1>
              {copy.title}
            </h1>


            <p className="search-description">
              {copy.description}
            </p>

          </div>



          {/* ===============================================
              SEARCH BAR
          ================================================ */}

          <form
            className="global-search-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="global-search-input-wrap">

              <Search
                size={20}
              />


              <input
                type="search"
                value={
                  input
                }
                onChange={
                  (
                    event
                  ) =>
                    setInput(
                      event.target
                        .value
                    )
                }
                placeholder={
                  copy.placeholder
                }
                maxLength={120}
                autoComplete="off"
                aria-label={
                  copy.placeholder
                }
              />


              {
                input && (

                  <button
                    type="button"
                    className="global-search-clear"
                    onClick={
                      handleClear
                    }
                    aria-label={
                      copy.clear
                    }
                  >

                    <X
                      size={17}
                    />

                  </button>

                )
              }

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
              />

              <span>
                {copy.search}
              </span>

            </button>

          </form>

        </section>



        {/* =================================================
            TABS
        ================================================== */}

        {
          query && (

            <section className="search-tabs-bar">

              <div className="search-tabs">

                <button
                  type="button"
                  className={
                    type === "all"
                      ? "active"
                      : ""
                  }
                  onClick={
                    () =>
                      handleTypeChange(
                        "all"
                      )
                  }
                >

                  <Search
                    size={16}
                  />

                  {copy.all}

                  {
                    data && (

                      <span>
                        {total}
                      </span>

                    )
                  }

                </button>


                <button
                  type="button"
                  className={
                    type ===
                    "writers"
                      ? "active"
                      : ""
                  }
                  onClick={
                    () =>
                      handleTypeChange(
                        "writers"
                      )
                  }
                >

                  <Users
                    size={16}
                  />

                  {copy.writers}

                  {
                    data && (

                      <span>
                        {writersTotal}
                      </span>

                    )
                  }

                </button>


                <button
                  type="button"
                  className={
                    type ===
                    "writings"
                      ? "active"
                      : ""
                  }
                  onClick={
                    () =>
                      handleTypeChange(
                        "writings"
                      )
                  }
                >

                  <BookOpen
                    size={16}
                  />

                  {copy.writings}

                  {
                    data && (

                      <span>
                        {writingsTotal}
                      </span>

                    )
                  }

                </button>

              </div>


              {
                data &&
                !loading && (

                  <p className="search-result-count">
                    {resultLabel}
                  </p>

                )
              }

            </section>

          )
        }



        {/* =================================================
            INITIAL
        ================================================== */}

        {
          !query && (

            <section className="search-initial-state">

              <div className="search-state-icon">

                <Search
                  size={31}
                />

              </div>


              <h2>
                {copy.startSearching}
              </h2>


              <p>
                {copy.startSearchingDescription}
              </p>

            </section>

          )
        }



        {/* =================================================
            LOADING
        ================================================== */}

        {
          query &&
          loading && (

            <section className="search-loading-state">

              <Loader2
                size={32}
                className="search-spin"
              />

              <p>
                {copy.loading}
              </p>

            </section>

          )
        }



        {/* =================================================
            ERROR
        ================================================== */}

        {
          query &&
          error &&
          !loading && (

            <section className="search-error-state">

              <Search
                size={32}
              />


              <h2>
                {copy.error}
              </h2>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  () => {

                    setSearchParams(
                      new URLSearchParams(
                        searchParams
                      )
                    );

                  }
                }
              >
                {copy.retry}
              </button>

            </section>

          )
        }



        {/* =================================================
            RESULTS
        ================================================== */}

        {
          query &&
          !loading &&
          !error &&
          data && (

            <div className="search-results">


              {/* ===========================================
                  QUERY HEADER
              ============================================ */}

              <header className="search-results-header">

                <p>
                  {copy.resultsFor}
                </p>


                <h2>
                  “{query}”
                </h2>

              </header>



              {/* ===========================================
                  WRITERS
              ============================================ */}

              {
                (
                  type === "all" ||
                  type ===
                    "writers"
                ) &&
                writers.length >
                  0 && (

                  <section className="search-result-section">


                    <div className="search-section-heading">

                      <div>

                        <p className="search-section-kicker">
                          {copy.writersFound}
                        </p>

                        <h3>
                          {copy.writers}
                        </h3>

                      </div>


                      <span>
                        {writersTotal}
                      </span>

                    </div>



                    <div className="search-writer-grid">

                      {
                        writers.map(
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
                                  to={`/users/${writer.id}`}
                                  className="search-writer-main"
                                >

                                  <WriterAvatar
                                    writer={
                                      writer
                                    }
                                  />


                                  <div className="search-writer-info">

                                    <h4>
                                      {
                                        writer.name ||
                                        copy.noBio
                                      }
                                    </h4>


                                    {
                                      writer.username && (

                                        <p className="search-writer-username">
                                          @{writer.username}
                                        </p>

                                      )
                                    }


                                    <p className="search-writer-bio">

                                      {
                                        writer.bio ||
                                        copy.noBio
                                      }

                                    </p>


                                    <div className="search-writer-meta">

                                      {
                                        writer.location && (

                                          <span>

                                            <MapPin
                                              size={13}
                                            />

                                            {
                                              writer.location
                                            }

                                          </span>

                                        )
                                      }


                                      {
                                        writer.website && (

                                          <span>

                                            <Globe2
                                              size={13}
                                            />

                                            {
                                              copy.viewProfile
                                            }

                                          </span>

                                        )
                                      }

                                    </div>

                                  </div>

                                </Link>



                                <div className="search-writer-actions">


                                  {
                                    writer.is_self
                                      ? (

                                          <span className="search-you-badge">
                                            {copy.you}
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

                                            {
                                              busy
                                                ? (

                                                    <Loader2
                                                      size={15}
                                                      className="search-spin"
                                                    />

                                                  )
                                                : writer.following
                                                  ? (

                                                      <UserCheck
                                                        size={15}
                                                      />

                                                    )
                                                  : (

                                                      <UserPlus
                                                        size={15}
                                                      />

                                                    )
                                            }


                                            <span>

                                              {
                                                writer.following
                                                  ? copy.following
                                                  : copy.follow
                                              }

                                            </span>

                                          </button>

                                        )
                                  }


                                  <Link
                                    to={`/users/${writer.id}`}
                                    className="search-profile-link"
                                  >

                                    <ArrowRight
                                      size={16}
                                    />

                                  </Link>

                                </div>

                              </article>

                            );

                          }
                        )
                      }

                    </div>

                  </section>

                )
              }



              {/* ===========================================
                  WRITINGS
              ============================================ */}

              {
                (
                  type === "all" ||
                  type ===
                    "writings"
                ) &&
                writings.length >
                  0 && (

                  <section className="search-result-section">


                    <div className="search-section-heading">

                      <div>

                        <p className="search-section-kicker">
                          {copy.writingsFound}
                        </p>

                        <h3>
                          {copy.writings}
                        </h3>

                      </div>


                      <span>
                        {writingsTotal}
                      </span>

                    </div>



                    <div className="search-writing-list">

                      {
                        writings.map(
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


                            return (

                              <article
                                key={
                                  writing.id
                                }
                                className="search-writing-card"
                              >


                                {/* =========================
                                    AUTHOR
                                ========================== */}

                                <div className="search-writing-author">

                                  {
                                    author.id
                                      ? (

                                          <Link
                                            to={`/users/${author.id}`}
                                            className="search-writing-author-avatar"
                                          >

                                            {
                                              author.avatar_url
                                                ? (

                                                    <img
                                                      src={
                                                        author.avatar_url
                                                      }
                                                      alt={
                                                        author.name ||
                                                        ""
                                                      }
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

                                                  )
                                                : getInitials(
                                                    author.name
                                                  )
                                            }

                                          </Link>

                                        )
                                      : (

                                          <div className="search-writing-author-avatar">
                                            ?
                                          </div>

                                        )
                                  }


                                  <div>

                                    {
                                      author.id
                                        ? (

                                            <Link
                                              to={`/users/${author.id}`}
                                            >
                                              {
                                                author.name ||
                                                copy.noBio
                                              }
                                            </Link>

                                          )
                                        : (

                                            <strong>
                                              {copy.noBio}
                                            </strong>

                                          )
                                    }


                                    <div>

                                      {
                                        author.username && (

                                          <span>
                                            @{author.username}
                                          </span>

                                        )
                                      }


                                      {
                                        date && (

                                          <span>
                                            {date}
                                          </span>

                                        )
                                      }

                                    </div>

                                  </div>

                                </div>



                                {/* =========================
                                    CONTENT
                                ========================== */}

                                <Link
                                  to={`/writings/${writing.id}`}
                                  className="search-writing-content"
                                >

                                  <div className="search-writing-tags">

                                    <span>
                                      {
                                        writing.category ||
                                        copy.writing
                                      }
                                    </span>


                                    {
                                      writing.language && (

                                        <small>
                                          {
                                            String(
                                              writing.language
                                            )
                                              .toUpperCase()
                                          }
                                        </small>

                                      )
                                    }

                                  </div>


                                  <h4>
                                    {
                                      writing.title ||
                                      copy.untitled
                                    }
                                  </h4>


                                  {
                                    text && (

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
                                            ? "..."
                                            : ""
                                        }

                                      </p>

                                    )
                                  }

                                </Link>



                                {/* =========================
                                    FOOTER
                                ========================== */}

                                <div className="search-writing-footer">

                                  <div className="search-writing-engagement">

                                    <span>

                                      <Heart
                                        size={15}
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
                                      />

                                      {
                                        safeNumber(
                                          writing.comments_count
                                        )
                                      }

                                    </span>

                                  </div>


                                  <Link
                                    to={`/writings/${writing.id}`}
                                    className="search-read-link"
                                  >

                                    {copy.readWriting}

                                    <ArrowRight
                                      size={15}
                                    />

                                  </Link>

                                </div>

                              </article>

                            );

                          }
                        )
                      }

                    </div>

                  </section>

                )
              }



              {/* ===========================================
                  EMPTY
              ============================================ */}

              {
                !hasResults && (

                  <section className="search-empty-state">

                    <div className="search-state-icon">

                      <Search
                        size={30}
                      />

                    </div>


                    <h3>
                      {copy.noResults}
                    </h3>


                    <p>
                      {copy.noResultsDescription}
                    </p>

                  </section>

                )
              }



              {/* ===========================================
                  PAGINATION
              ============================================ */}

              {
                hasResults &&
                totalPages >
                1 && (

                  <nav className="search-pagination">

                    <button
                      type="button"
                      onClick={
                        () =>
                          changePage(
                            page - 1
                          )
                      }
                      disabled={
                        page <= 1
                      }
                    >

                      <ChevronLeft
                        size={16}
                      />

                      {copy.previous}

                    </button>


                    <span>

                      {copy.page}

                      <strong>
                        {page}
                      </strong>

                      {copy.of}

                      <strong>
                        {totalPages}
                      </strong>

                    </span>


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

                      {copy.next}

                      <ChevronRight
                        size={16}
                      />

                    </button>

                  </nav>

                )
              }

            </div>

          )
        }

      </div>

    </main>

  );

}


export default SearchPage;