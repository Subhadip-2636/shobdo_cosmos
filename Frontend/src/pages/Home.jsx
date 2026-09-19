import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getFollowingFeed,
  getWritings,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";

import "./Home.css";


// =========================================================
// CONSTANTS
// =========================================================

const PAGE_SIZE = 12;


// =========================================================
// HELPERS
// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name || ""
    ).trim();

  if (!safeName) {
    return "U";
  }

  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    `${parts[0][0]}${parts[1][0]}`
  ).toUpperCase();
}


// =========================================================
// NORMALIZE WRITINGS RESPONSE
// =========================================================

function normalizeWritings(
  response
) {

  if (
    Array.isArray(
      response
    )
  ) {

    return response;
  }

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
      response?.results
    )
  ) {

    return response.results;
  }

  return [];
}


// =========================================================
// HAS MORE
// =========================================================

function getHasMore({
  response,
  items,
  page,
}) {

  if (
    typeof response?.has_more ===
    "boolean"
  ) {

    return response.has_more;
  }


  if (
    typeof response?.pagination
      ?.has_next ===
    "boolean"
  ) {

    return (
      response.pagination.has_next
    );
  }


  if (
    Number.isFinite(
      Number(
        response?.pagination
          ?.pages
      )
    )
  ) {

    return (
      page <
      Number(
        response.pagination.pages
      )
    );
  }


  if (
    Number.isFinite(
      Number(
        response?.total_pages
      )
    )
  ) {

    return (
      page <
      Number(
        response.total_pages
      )
    );
  }


  return (
    items.length >=
    PAGE_SIZE
  );
}


// =========================================================
// SORT LATEST
// =========================================================

function sortLatest(
  writings
) {

  return [
    ...writings,
  ].sort(
    (
      first,
      second
    ) => {

      const firstDate =
        new Date(
          first?.published_at ||
          first?.created_at ||
          0
        ).getTime();

      const secondDate =
        new Date(
          second?.published_at ||
          second?.created_at ||
          0
        ).getTime();

      return (
        secondDate -
        firstDate
      );
    }
  );
}


// =========================================================
// REMOVE DUPLICATES
// =========================================================

function mergeUnique(
  current,
  incoming
) {

  const map =
    new Map();


  [
    ...current,
    ...incoming,
  ].forEach(
    (
      writing
    ) => {

      if (
        writing?.id ===
        undefined ||
        writing?.id ===
        null
      ) {
        return;
      }

      map.set(
        String(
          writing.id
        ),
        writing
      );
    }
  );


  return Array.from(
    map.values()
  );
}


// =========================================================
// FEED SKELETON
// =========================================================

function FeedSkeleton() {

  return (
    <div
      className="home-feed-skeletons"
      aria-hidden="true"
    >

      {[1, 2, 3].map(
        (
          item
        ) => (

          <article
            key={item}
            className="home-feed-skeleton"
          >

            <div
              className="home-skeleton-header"
            >

              <span
                className="home-skeleton-avatar"
              />

              <div
                className="home-skeleton-author"
              >
                <span />
                <span />
              </div>

            </div>


            <span
              className="home-skeleton-chip"
            />


            <div
              className="home-skeleton-title"
            >
              <span />
              <span />
            </div>


            <div
              className="home-skeleton-content"
            >
              <span />
              <span />
              <span />
            </div>


            <div
              className="home-skeleton-footer"
            >
              <span />
              <span />
              <span />
              <span />
            </div>

          </article>

        )
      )}

    </div>
  );
}


// =========================================================
// HOME
// =========================================================

export default function Home({
  user = null,
  writings = [],
  loading = false,
}) {

  const navigate =
    useNavigate();


  const {
    language,
  } = useLanguage();


  // =======================================================
  // LANGUAGE COPY
  // =======================================================

  const copy =
    useMemo(
      () => {

        if (
          language === "bn"
        ) {

          return {

            feedTitle:
              "আপনার ফিড",

            feedSubtitle:
              "লেখা, গল্প, কবিতা এবং মানুষের ভাবনা আবিষ্কার করুন।",

            forYou:
              "আপনার জন্য",

            following:
              "অনুসরণ করছেন",

            latest:
              "সাম্প্রতিক",

            composePlaceholder:
              `${user?.name || "আপনি"}, কী ভাবছেন?`,

            createWriting:
              "লেখা",

            poetry:
              "কবিতা",

            artwork:
              "শিল্পকর্ম",

            document:
              "ডকুমেন্ট",

            publish:
              "তৈরি করুন",

            refresh:
              "রিফ্রেশ",

            refreshing:
              "রিফ্রেশ হচ্ছে",

            loadMore:
              "আরও দেখুন",

            loadingMore:
              "লোড হচ্ছে",

            emptyTitle:
              "এখানে এখনও কোনো লেখা নেই",

            emptyDescription:
              "কমিউনিটির জন্য নতুন কিছু লিখুন অথবা আরও লেখককে অনুসরণ করুন।",

            followingEmptyTitle:
              "আপনার Following feed এখনও খালি",

            followingEmptyDescription:
              "আরও লেখককে অনুসরণ করলে তাদের নতুন লেখা এখানে দেখা যাবে।",

            exploreWriters:
              "লেখক খুঁজুন",

            startWriting:
              "লেখা শুরু করুন",

            errorTitle:
              "ফিড লোড করা যায়নি",

            retry:
              "আবার চেষ্টা করুন",

            loginTitle:
              "SHOBDO-তে যোগ দিন",

            loginDescription:
              "লেখা প্রকাশ, অনুসরণ, পছন্দ এবং সংরক্ষণ করতে লগ ইন করুন।",

            login:
              "লগ ইন",

            createAccount:
              "অ্যাকাউন্ট তৈরি করুন",

          };

        }


        if (
          language === "hi"
        ) {

          return {

            feedTitle:
              "आपकी फ़ीड",

            feedSubtitle:
              "लेखन, कहानियाँ, कविताएँ और नए विचार खोजें।",

            forYou:
              "आपके लिए",

            following:
              "फ़ॉलोइंग",

            latest:
              "नवीनतम",

            composePlaceholder:
              `${user?.name || "आप"}, क्या सोच रहे हैं?`,

            createWriting:
              "लेखन",

            poetry:
              "कविता",

            artwork:
              "कला",

            document:
              "दस्तावेज़",

            publish:
              "बनाएँ",

            refresh:
              "रीफ़्रेश",

            refreshing:
              "रीफ़्रेश हो रहा है",

            loadMore:
              "और दिखाएँ",

            loadingMore:
              "लोड हो रहा है",

            emptyTitle:
              "अभी यहाँ कोई रचना नहीं है",

            emptyDescription:
              "समुदाय के लिए कुछ नया लिखें या अधिक लेखकों को फ़ॉलो करें।",

            followingEmptyTitle:
              "आपकी Following feed अभी खाली है",

            followingEmptyDescription:
              "लेखकों को फ़ॉलो करें और उनकी नई रचनाएँ यहाँ दिखाई देंगी।",

            exploreWriters:
              "लेखक खोजें",

            startWriting:
              "लिखना शुरू करें",

            errorTitle:
              "फ़ीड लोड नहीं हो सकी",

            retry:
              "फिर कोशिश करें",

            loginTitle:
              "SHOBDO से जुड़ें",

            loginDescription:
              "पोस्ट करने, फ़ॉलो करने, लाइक करने और सेव करने के लिए लॉग इन करें।",

            login:
              "लॉग इन",

            createAccount:
              "अकाउंट बनाएँ",

          };

        }


        return {

          feedTitle:
            "Your feed",

          feedSubtitle:
            "Discover writing, stories, poetry and ideas from the community.",

          forYou:
            "For you",

          following:
            "Following",

          latest:
            "Latest",

          composePlaceholder:
            `What's on your mind, ${user?.name || "writer"}?`,

          createWriting:
            "Writing",

          poetry:
            "Poetry",

          artwork:
            "Artwork",

          document:
            "Document",

          publish:
            "Create",

          refresh:
            "Refresh",

          refreshing:
            "Refreshing",

          loadMore:
            "Load more",

          loadingMore:
            "Loading",

          emptyTitle:
            "Nothing has been published here yet",

          emptyDescription:
            "Create something for the community or discover more writers.",

          followingEmptyTitle:
            "Your Following feed is quiet",

          followingEmptyDescription:
            "Follow writers and their newest work will appear here.",

          exploreWriters:
            "Discover writers",

          startWriting:
            "Start writing",

          errorTitle:
            "Unable to load your feed",

          retry:
            "Try again",

          loginTitle:
            "Join the SHOBDO community",

          loginDescription:
            "Log in to publish, follow writers, like posts and save your favourites.",

          login:
            "Log in",

          createAccount:
            "Create account",

        };

      },
      [
        language,
        user?.name,
      ]
    );


  // =======================================================
  // STATE
  // =======================================================

  const [
    activeFeed,
    setActiveFeed,
  ] = useState(
    "for-you"
  );


  const [
    publicWritings,
    setPublicWritings,
  ] = useState(
    Array.isArray(
      writings
    )
      ? writings
      : []
  );


  const [
    followingWritings,
    setFollowingWritings,
  ] = useState([]);


  const [
    publicPage,
    setPublicPage,
  ] = useState(1);


  const [
    followingPage,
    setFollowingPage,
  ] = useState(1);


  const [
    publicHasMore,
    setPublicHasMore,
  ] = useState(
    Array.isArray(
      writings
    ) &&
    writings.length >=
      PAGE_SIZE
  );


  const [
    followingHasMore,
    setFollowingHasMore,
  ] = useState(true);


  const [
    feedLoading,
    setFeedLoading,
  ] = useState(
    loading
  );


  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    feedError,
    setFeedError,
  ] = useState("");


  const [
    followingLoaded,
    setFollowingLoaded,
  ] = useState(false);


  // =======================================================
  // SYNC APP WRITINGS
  // =======================================================

  useEffect(
    () => {

      if (
        Array.isArray(
          writings
        )
      ) {

        setPublicWritings(
          writings
        );

        setPublicPage(
          1
        );

        setPublicHasMore(
          writings.length >=
          PAGE_SIZE
        );
      }

    },
    [
      writings,
    ]
  );


  // =======================================================
  // SYNC APP LOADING
  // =======================================================

  useEffect(
    () => {

      setFeedLoading(
        loading
      );

    },
    [
      loading,
    ]
  );


  // =======================================================
  // PUBLIC FEED
  // =======================================================

  async function loadPublicFeed({
    page = 1,
    append = false,
    refresh = false,
  } = {}) {

    if (
      refresh
    ) {

      setRefreshing(
        true
      );

    } else if (
      append
    ) {

      setLoadingMore(
        true
      );

    } else {

      setFeedLoading(
        true
      );

    }


    setFeedError(
      ""
    );


    try {

      const response =
        await getWritings({

          page,

          limit:
            PAGE_SIZE,

        });


      const items =
        normalizeWritings(
          response
        );


      setPublicWritings(
        (
          previous
        ) =>

          append
            ? mergeUnique(
                previous,
                items
              )
            : items
      );


      setPublicPage(
        page
      );


      setPublicHasMore(
        getHasMore({
          response,
          items,
          page,
        })
      );


    } catch (
      error
    ) {

      console.error(
        "HOME PUBLIC FEED ERROR:",
        error
      );


      setFeedError(
        error?.message ||
        copy.errorTitle
      );

    } finally {

      setFeedLoading(
        false
      );

      setLoadingMore(
        false
      );

      setRefreshing(
        false
      );

    }

  }


  // =======================================================
  // FOLLOWING FEED
  // =======================================================

  async function loadFollowingFeed({
    page = 1,
    append = false,
    refresh = false,
  } = {}) {

    if (
      !user?.id
    ) {

      navigate(
        "/login"
      );

      return;
    }


    if (
      refresh
    ) {

      setRefreshing(
        true
      );

    } else if (
      append
    ) {

      setLoadingMore(
        true
      );

    } else {

      setFeedLoading(
        true
      );

    }


    setFeedError(
      ""
    );


    try {

      const response =
        await getFollowingFeed({

          page,

          limit:
            PAGE_SIZE,

        });


      const items =
        normalizeWritings(
          response
        );


      setFollowingWritings(
        (
          previous
        ) =>

          append
            ? mergeUnique(
                previous,
                items
              )
            : items
      );


      setFollowingPage(
        page
      );


      setFollowingHasMore(
        getHasMore({
          response,
          items,
          page,
        })
      );


      setFollowingLoaded(
        true
      );


    } catch (
      error
    ) {

      console.error(
        "HOME FOLLOWING FEED ERROR:",
        error
      );


      if (
        error?.status ===
        401
      ) {

        navigate(
          "/login"
        );

        return;
      }


      setFeedError(
        error?.message ||
        copy.errorTitle
      );

    } finally {

      setFeedLoading(
        false
      );

      setLoadingMore(
        false
      );

      setRefreshing(
        false
      );

    }

  }


  // =======================================================
  // SELECT FEED TAB
  // =======================================================

  async function handleFeedChange(
    feed
  ) {

    if (
      feed ===
        "following" &&
      !user?.id
    ) {

      navigate(
        "/login"
      );

      return;
    }


    setActiveFeed(
      feed
    );


    setFeedError(
      ""
    );


    if (
      feed ===
        "following" &&
      !followingLoaded
    ) {

      await loadFollowingFeed({
        page: 1,
      });

    }

  }


  // =======================================================
  // REFRESH
  // =======================================================

  async function handleRefresh() {

    if (
      activeFeed ===
      "following"
    ) {

      await loadFollowingFeed({
        page: 1,
        refresh: true,
      });

      return;
    }


    await loadPublicFeed({
      page: 1,
      refresh: true,
    });

  }


  // =======================================================
  // LOAD MORE
  // =======================================================

  async function handleLoadMore() {

    if (
      loadingMore
    ) {
      return;
    }


    if (
      activeFeed ===
      "following"
    ) {

      if (
        !followingHasMore
      ) {
        return;
      }


      await loadFollowingFeed({

        page:
          followingPage +
          1,

        append:
          true,

      });


      return;
    }


    if (
      !publicHasMore
    ) {
      return;
    }


    await loadPublicFeed({

      page:
        publicPage +
        1,

      append:
        true,

    });

  }


  // =======================================================
  // CURRENT FEED
  // =======================================================

  const currentWritings =
    useMemo(
      () => {

        if (
          activeFeed ===
          "following"
        ) {

          return (
            followingWritings
          );
        }


        if (
          activeFeed ===
          "latest"
        ) {

          return sortLatest(
            publicWritings
          );
        }


        return publicWritings;

      },
      [
        activeFeed,
        publicWritings,
        followingWritings,
      ]
    );


  const currentHasMore =
    activeFeed ===
    "following"
      ? followingHasMore
      : publicHasMore;


  // =======================================================
  // USER AVATAR
  // =======================================================

  const userInitials =
    getInitials(
      user?.name
    );


  // =======================================================
  // UI
  // =======================================================

  return (

    <div
      className="home-social-feed"
    >

      {/* =================================================
          FEED HEADER
      ================================================== */}

      <header
        className="home-feed-header"
      >

        <div>

          <span
            className="home-feed-eyebrow"
          >
            <Sparkles
              size={14}
            />

            SHOBDO
          </span>


          <h1>
            {copy.feedTitle}
          </h1>


          <p>
            {copy.feedSubtitle}
          </p>

        </div>


        <button
          type="button"
          className="home-refresh-button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing ||
            feedLoading
          }
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "home-spin"
                : ""
            }
          />

          <span>
            {
              refreshing
                ? copy.refreshing
                : copy.refresh
            }
          </span>

        </button>

      </header>


      {/* =================================================
          COMPOSER
      ================================================== */}

      {user ? (

        <section
          className="home-composer"
        >

          <div
            className="home-composer-main"
          >

            <Link
              to={
                `/users/${user.id}`
              }
              className="home-composer-avatar"
            >

              {user?.avatar_url
                ? (

                  <img
                    src={
                      user.avatar_url
                    }
                    alt=""
                  />

                )
                : (

                  <span>
                    {userInitials}
                  </span>

                )}

            </Link>


            <button
              type="button"
              className="home-composer-input"
              onClick={
                () =>
                  navigate(
                    "/write"
                  )
              }
            >

              {
                copy.composePlaceholder
              }

            </button>


            <button
              type="button"
              className="home-composer-create"
              onClick={
                () =>
                  navigate(
                    "/write"
                  )
              }
            >

              <PenLine
                size={17}
              />

              <span>
                {copy.publish}
              </span>

            </button>

          </div>


          <div
            className="home-composer-actions"
          >

            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/write"
                  )
              }
            >

              <PenLine
                size={17}
              />

              <span>
                {copy.createWriting}
              </span>

            </button>


            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/write?mode=writing&category=কবিতা"
                  )
              }
            >

              <BookOpen
                size={17}
              />

              <span>
                {copy.poetry}
              </span>

            </button>


            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/write?mode=artwork"
                  )
              }
            >

              <ImageIcon
                size={17}
              />

              <span>
                {copy.artwork}
              </span>

            </button>


            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/write?mode=document"
                  )
              }
            >

              <FileText
                size={17}
              />

              <span>
                {copy.document}
              </span>

            </button>

          </div>

        </section>

      ) : (

        <section
          className="home-guest-card"
        >

          <div
            className="home-guest-icon"
          >
            <PenLine
              size={22}
            />
          </div>


          <div
            className="home-guest-copy"
          >

            <h2>
              {copy.loginTitle}
            </h2>

            <p>
              {
                copy.loginDescription
              }
            </p>

          </div>


          <div
            className="home-guest-actions"
          >

            <Link
              to="/login"
              className="home-guest-login"
            >
              {copy.login}
            </Link>


            <Link
              to="/register"
              className="home-guest-register"
            >
              {
                copy.createAccount
              }
            </Link>

          </div>

        </section>

      )}


      {/* =================================================
          FEED TOOLBAR
      ================================================== */}

      <section
        className="home-feed-toolbar"
      >

        <div
          className="home-feed-tabs"
          role="tablist"
          aria-label="Feed"
        >

          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              "for-you"
            }
            className={
              activeFeed ===
              "for-you"
                ? "active"
                : ""
            }
            onClick={
              () =>
                handleFeedChange(
                  "for-you"
                )
            }
          >

            <Sparkles
              size={16}
            />

            {copy.forYou}

          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              "following"
            }
            className={
              activeFeed ===
              "following"
                ? "active"
                : ""
            }
            onClick={
              () =>
                handleFeedChange(
                  "following"
                )
            }
          >

            <Users
              size={16}
            />

            {copy.following}

          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              activeFeed ===
              "latest"
            }
            className={
              activeFeed ===
              "latest"
                ? "active"
                : ""
            }
            onClick={
              () =>
                handleFeedChange(
                  "latest"
                )
            }
          >

            <BookOpen
              size={16}
            />

            {copy.latest}

          </button>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================== */}

      {feedError && (
        <section
          className="home-feed-error"
        >

          <div>

            <strong>
              {copy.errorTitle}
            </strong>

            <p>
              {feedError}
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleRefresh
            }
          >

            <RefreshCw
              size={16}
            />

            {copy.retry}

          </button>

        </section>
      )}


      {/* =================================================
          LOADING
      ================================================== */}

      {feedLoading &&
        currentWritings.length ===
          0 && (

        <FeedSkeleton />

      )}


      {/* =================================================
          EMPTY
      ================================================== */}

      {!feedLoading &&
        !feedError &&
        currentWritings.length ===
          0 && (

        <section
          className="home-empty-feed"
        >

          <div
            className="home-empty-icon"
          >

            {activeFeed ===
            "following"
              ? (

                <Users
                  size={28}
                />

              )
              : (

                <BookOpen
                  size={28}
                />

              )}

          </div>


          <h2>

            {
              activeFeed ===
              "following"
                ? copy.followingEmptyTitle
                : copy.emptyTitle
            }

          </h2>


          <p>

            {
              activeFeed ===
              "following"
                ? copy.followingEmptyDescription
                : copy.emptyDescription
            }

          </p>


          <div
            className="home-empty-actions"
          >

            <Link
              to="/explore"
              className="home-empty-secondary"
            >
              {
                copy.exploreWriters
              }
            </Link>


            <Link
              to={
                user
                  ? "/write"
                  : "/login"
              }
              className="home-empty-primary"
            >

              <PenLine
                size={16}
              />

              {
                copy.startWriting
              }

            </Link>

          </div>

        </section>

      )}


      {/* =================================================
          WRITING FEED
      ================================================== */}

      {currentWritings.length >
        0 && (

        <section
          className="home-writing-feed"
        >

          {currentWritings.map(
            (
              writing
            ) => (

              <div
                className="home-feed-post"
                key={
                  writing.id
                }
              >

                <WritingCard
                  writing={
                    writing
                  }
                />

              </div>

            )
          )}

        </section>

      )}


      {/* =================================================
          LOAD MORE
      ================================================== */}

      {!feedLoading &&
        !feedError &&
        currentWritings.length >
          0 &&
        currentHasMore && (

        <div
          className="home-load-more-wrap"
        >

          <button
            type="button"
            className="home-load-more"
            onClick={
              handleLoadMore
            }
            disabled={
              loadingMore
            }
          >

            {loadingMore
              ? (
                <>
                  <Loader2
                    size={17}
                    className="home-spin"
                  />

                  {
                    copy.loadingMore
                  }
                </>
              )
              : (
                copy.loadMore
              )}

          </button>

        </div>

      )}


      {/* =================================================
          END MESSAGE
      ================================================== */}

      {!feedLoading &&
        !currentHasMore &&
        currentWritings.length >
          3 && (

        <div
          className="home-feed-end"
        >

          <span />

          <p>
            SHOBDO
          </p>

          <span />

        </div>

      )}

    </div>

  );
}