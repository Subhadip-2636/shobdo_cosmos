import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Loader2,
  MapPin,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";


import {
  followUser,
  getFollowStatus,
  getToken,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
} from "../api/api";


import "./ConnectionsPage.css";



const PAGE_SIZE = 20;



// =========================================================
// HELPERS
// =========================================================


function getInitials(name) {

  const safeName =
    String(name || "")
      .trim();


  if (!safeName) {
    return "?";
  }


  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);


  if (parts.length === 1) {

    return (
      parts[0]
        .slice(0, 2)
        .toUpperCase()
    );

  }


  return (
    `${parts[0][0]}${parts[parts.length - 1][0]}`
      .toUpperCase()
  );

}



// =========================================================
// PROFILE AVATAR
// =========================================================


function ProfileAvatar({
  user,
  large = false,
}) {

  return (

    <div
      className={
        large
          ? "connections-avatar connections-avatar-large"
          : "connections-avatar"
      }
    >

      <span>
        {
          getInitials(
            user?.name
          )
        }
      </span>


      {
        user?.avatar_url && (

          <img
            src={
              user.avatar_url
            }
            alt={
              user?.name
                ? `${user.name} profile`
                : "Writer profile"
            }
            loading="lazy"
            onError={
              (event) => {

                event.currentTarget.style.display =
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
// PAGE
// =========================================================


function ConnectionsPage({
  mode = "followers",
}) {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const location =
    useLocation();


  const userId =
    Number(id);


  const isFollowers =
    mode === "followers";


  const isLoggedIn =
    Boolean(
      getToken()
    );



  // =======================================================
  // MAIN STATE
  // =======================================================


  const [
    page,
    setPage,
  ] = useState(1);


  const [
    data,
    setData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");



  // =======================================================
  // FOLLOW STATE
  // =======================================================


  const [
    followStates,
    setFollowStates,
  ] = useState({});


  const [
    ownerIsSelf,
    setOwnerIsSelf,
  ] = useState(false);



  // =======================================================
  // RESET PAGE
  // =======================================================


  useEffect(
    () => {

      setPage(1);

      setData(
        null
      );

      setError("");

      setFollowStates({});

      setOwnerIsSelf(
        false
      );

    },
    [
      userId,
      mode,
    ]
  );



  // =======================================================
  // LOAD CONNECTIONS
  // =======================================================


  useEffect(
    () => {

      let active =
        true;


      async function loadConnections() {

        if (
          !Number.isFinite(
            userId
          ) ||
          userId <= 0
        ) {

          if (active) {

            setError(
              "Invalid writer ID."
            );

            setLoading(
              false
            );

          }

          return;

        }


        try {

          setLoading(
            true
          );

          setError("");


          const response =
            isFollowers
              ? await getUserFollowers(
                  userId,
                  {
                    page,
                    limit:
                      PAGE_SIZE,
                  }
                )
              : await getUserFollowing(
                  userId,
                  {
                    page,
                    limit:
                      PAGE_SIZE,
                  }
                );


          if (!active) {
            return;
          }


          setData(
            response || {}
          );


        } catch (
          err
        ) {

          console.error(
            "CONNECTIONS LOAD ERROR:",
            err
          );


          if (!active) {
            return;
          }


          setError(
            err?.message ||
            "Unable to load writers."
          );


        } finally {

          if (active) {

            setLoading(
              false
            );

          }

        }

      }


      loadConnections();


      return () => {

        active =
          false;

      };

    },
    [
      userId,
      page,
      isFollowers,
    ]
  );



  // =======================================================
  // DERIVED USERS
  // =======================================================


  const owner =
    data?.user ||
    null;


  const users =
    useMemo(
      () => {

        return Array.isArray(
          data?.users
        )
          ? data.users
          : [];

      },
      [
        data?.users,
      ]
    );



  // =======================================================
  // LOAD FOLLOW STATUS
  // =======================================================


  useEffect(
    () => {

      let active =
        true;


      async function loadFollowStatuses() {

        if (
          !isLoggedIn ||
          !data
        ) {

          setFollowStates({});

          setOwnerIsSelf(
            false
          );

          return;

        }


        // -------------------------------------------------
        // MARK VISIBLE WRITERS AS LOADING
        // -------------------------------------------------

        const loadingStates =
          {};


        users.forEach(
          (writer) => {

            if (!writer?.id) {
              return;
            }


            loadingStates[
              writer.id
            ] = {

              following:
                false,

              isSelf:
                false,

              loading:
                true,

            };

          }
        );


        if (active) {

          setFollowStates(
            loadingStates
          );

        }


        // -------------------------------------------------
        // CHECK WHETHER PAGE OWNER IS CURRENT USER
        // -------------------------------------------------

        const ownerPromise =
          owner?.id
            ? getFollowStatus(
                owner.id
              )
            : Promise.resolve(
                null
              );


        // -------------------------------------------------
        // CHECK EACH VISIBLE WRITER
        // -------------------------------------------------

        const writerPromises =
          users.map(
            async (
              writer
            ) => {

              if (!writer?.id) {

                return {
                  id:
                    null,
                };

              }


              try {

                const status =
                  await getFollowStatus(
                    writer.id
                  );


                return {

                  id:
                    writer.id,

                  following:
                    Boolean(
                      status?.following
                    ),

                  isSelf:
                    Boolean(
                      status?.is_self
                    ),

                  loading:
                    false,

                };


              } catch (
                err
              ) {

                console.error(
                  `FOLLOW STATUS ERROR FOR USER ${writer.id}:`,
                  err
                );


                return {

                  id:
                    writer.id,

                  following:
                    false,

                  isSelf:
                    false,

                  loading:
                    false,

                  failed:
                    true,

                };

              }

            }
          );


        const [
          ownerResult,
          writerResults,
        ] =
          await Promise.all([

            ownerPromise
              .catch(
                () => null
              ),

            Promise.all(
              writerPromises
            ),

          ]);


        if (!active) {
          return;
        }


        setOwnerIsSelf(
          Boolean(
            ownerResult?.is_self
          )
        );


        const nextStates =
          {};


        writerResults.forEach(
          (result) => {

            if (!result?.id) {
              return;
            }


            nextStates[
              result.id
            ] = {

              following:
                Boolean(
                  result.following
                ),

              isSelf:
                Boolean(
                  result.isSelf
                ),

              loading:
                false,

              failed:
                Boolean(
                  result.failed
                ),

            };

          }
        );


        setFollowStates(
          nextStates
        );

      }


      loadFollowStatuses();


      return () => {

        active =
          false;

      };

    },
    [
      data,
      users,
      owner?.id,
      isLoggedIn,
    ]
  );



  // =======================================================
  // FOLLOW / UNFOLLOW
  // =======================================================


  async function handleFollowToggle(
    writer
  ) {

    if (!writer?.id) {
      return;
    }


    // -----------------------------------------------------
    // LOGIN REQUIRED
    // -----------------------------------------------------

    if (!isLoggedIn) {

      navigate(
        "/login",
        {
          state: {
            from:
              location.pathname,
          },
        }
      );

      return;

    }


    const writerId =
      writer.id;


    const currentState =
      followStates[
        writerId
      ] || {};


    // -----------------------------------------------------
    // CANNOT FOLLOW YOURSELF
    // -----------------------------------------------------

    if (
      currentState.isSelf
    ) {

      return;

    }


    if (
      currentState.loading
    ) {

      return;

    }


    const previousFollowing =
      Boolean(
        currentState.following
      );


    const nextFollowing =
      !previousFollowing;


    // -----------------------------------------------------
    // OPTIMISTIC UPDATE
    // -----------------------------------------------------

    setFollowStates(
      (
        current
      ) => ({

        ...current,

        [writerId]: {

          ...current[
            writerId
          ],

          following:
            nextFollowing,

          loading:
            true,

          failed:
            false,

        },

      })
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


      const confirmedFollowing =
        typeof response?.following ===
        "boolean"
          ? response.following
          : nextFollowing;


      setFollowStates(
        (
          current
        ) => ({

          ...current,

          [writerId]: {

            ...current[
              writerId
            ],

            following:
              confirmedFollowing,

            loading:
              false,

            failed:
              false,

          },

        })
      );


      // ---------------------------------------------------
      // IMPORTANT:
      //
      // If user is viewing THEIR OWN "Following" page
      // and unfollows someone, remove that writer from the
      // list immediately.
      // ---------------------------------------------------

      if (
        ownerIsSelf &&
        !isFollowers &&
        previousFollowing &&
        !confirmedFollowing
      ) {

        const currentUserCount =
          users.length;


        setData(
          (
            current
          ) => {

            if (!current) {
              return current;
            }


            const currentUsers =
              Array.isArray(
                current.users
              )
                ? current.users
                : [];


            const nextUsers =
              currentUsers.filter(
                (
                  item
                ) =>
                  item.id !==
                  writerId
              );


            const nextTotal =
              Math.max(
                Number(
                  current.total ||
                  0
                ) - 1,
                0
              );


            const nextPages =
              Math.max(
                Math.ceil(
                  nextTotal /
                  PAGE_SIZE
                ),
                1
              );


            return {

              ...current,

              users:
                nextUsers,

              total:
                nextTotal,

              pages:
                nextPages,

              has_prev:
                page > 1,

              has_next:
                page <
                nextPages,

            };

          }
        );


        // If last user on this page was removed,
        // move back one page.

        if (
          currentUserCount ===
            1 &&
          page > 1
        ) {

          setPage(
            (
              current
            ) =>
              Math.max(
                current - 1,
                1
              )
          );

        }

      }


    } catch (
      err
    ) {

      console.error(
        "FOLLOW TOGGLE ERROR:",
        err
      );


      // ---------------------------------------------------
      // ROLLBACK
      // ---------------------------------------------------

      setFollowStates(
        (
          current
        ) => ({

          ...current,

          [writerId]: {

            ...current[
              writerId
            ],

            following:
              previousFollowing,

            loading:
              false,

            failed:
              true,

          },

        })
      );


      setError(
        err?.message ||
        (
          previousFollowing
            ? "Unable to unfollow this writer."
            : "Unable to follow this writer."
        )
      );

    }

  }



  // =======================================================
  // PAGINATION VALUES
  // =======================================================


  const total =
    Number(
      data?.total ||
      0
    );


  const totalPages =
    Math.max(
      Number(
        data?.pages ||
        1
      ),
      1
    );


  const hasNext =
    Boolean(
      data?.has_next
    );


  const hasPrev =
    Boolean(
      data?.has_prev
    );



  // =======================================================
  // TEXT
  // =======================================================


  const pageTitle =
    isFollowers
      ? "Followers"
      : "Following";


  const emptyTitle =
    isFollowers
      ? "No followers yet"
      : "Not following anyone yet";


  const emptyDescription =
    isFollowers
      ? "When readers follow this writer, they will appear here."
      : "Writers followed by this profile will appear here.";



  // =======================================================
  // ERROR
  // =======================================================


  if (
    error &&
    !data
  ) {

    return (

      <main className="connections-page">

        <div className="connections-shell">

          <section className="connections-state">

            <Users
              size={38}
            />


            <h1>
              Unable to load
            </h1>


            <p>
              {error}
            </p>


            <Link
              to={`/users/${userId}`}
              className="connections-primary-button"
            >

              <ArrowLeft
                size={17}
              />

              Back to profile

            </Link>

          </section>

        </div>

      </main>

    );

  }



  // =======================================================
  // INITIAL LOADING
  // =======================================================


  if (
    loading &&
    !data
  ) {

    return (

      <main className="connections-page">

        <div className="connections-shell">

          <section className="connections-state">

            <Loader2
              size={34}
              className="connections-spin"
            />


            <p>
              Loading {pageTitle.toLowerCase()}...
            </p>

          </section>

        </div>

      </main>

    );

  }



  // =======================================================
  // UI
  // =======================================================


  return (

    <main className="connections-page">

      <div className="connections-shell">


        {/* =================================================
            BACK
        ================================================== */}

        <Link
          to={`/users/${userId}`}
          className="connections-back-link"
        >

          <ArrowLeft
            size={17}
          />

          Back to profile

        </Link>



        {/* =================================================
            HEADER
        ================================================== */}

        <section className="connections-header">

          {
            owner && (

              <ProfileAvatar
                user={owner}
                large
              />

            )
          }


          <div className="connections-header-copy">

            <p className="connections-eyebrow">
              SHOBDO COMMUNITY
            </p>


            <h1>
              {pageTitle}
            </h1>


            {
              owner && (

                <div className="connections-owner">

                  <span>
                    {
                      owner.name ||
                      "SHOBDO Writer"
                    }
                  </span>


                  {
                    owner.username && (

                      <span className="connections-owner-username">
                        @{owner.username}
                      </span>

                    )
                  }

                </div>

              )
            }


            <p className="connections-total">

              {
                total === 1
                  ? "1 writer"
                  : `${total} writers`
              }

            </p>

          </div>

        </section>



        {/* =================================================
            ERROR BANNER
        ================================================== */}

        {
          error && (

            <div
              className="connections-error"
              role="alert"
            >

              <span>
                {error}
              </span>


              <button
                type="button"
                onClick={
                  () =>
                    setError("")
                }
                aria-label="Close error"
              >
                ×
              </button>

            </div>

          )
        }



        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {
          users.length === 0 &&
          !loading
            ? (

                <section className="connections-empty">

                  <div className="connections-empty-icon">

                    <Users
                      size={30}
                    />

                  </div>


                  <h2>
                    {emptyTitle}
                  </h2>


                  <p>
                    {emptyDescription}
                  </p>


                  <Link
                    to="/explore"
                    className="connections-primary-button"
                  >
                    Explore writers
                  </Link>

                </section>

              )
            : (

                /* =========================================
                   WRITER LIST
                ========================================= */

                <section className="connections-list">

                  {
                    users.map(
                      (
                        writer
                      ) => {

                        const followState =
                          followStates[
                            writer.id
                          ] || {};


                        const following =
                          Boolean(
                            followState.following
                          );


                        const isSelf =
                          Boolean(
                            followState.isSelf
                          );


                        const followLoading =
                          Boolean(
                            followState.loading
                          );


                        return (

                          <article
                            key={
                              writer.id
                            }
                            className="connection-card"
                          >


                            {/* =============================
                                PROFILE AREA
                            ============================== */}

                            <Link
                              to={`/users/${writer.id}`}
                              className="connection-profile-link"
                            >

                              <ProfileAvatar
                                user={
                                  writer
                                }
                              />


                              <div className="connection-card-main">

                                <div className="connection-name-row">

                                  <h2>

                                    {
                                      writer.name ||
                                      "SHOBDO Writer"
                                    }

                                  </h2>


                                  {
                                    writer.username && (

                                      <span>
                                        @{writer.username}
                                      </span>

                                    )
                                  }

                                </div>


                                {
                                  writer.bio && (

                                    <p className="connection-bio">
                                      {writer.bio}
                                    </p>

                                  )
                                }


                                <div className="connection-meta">

                                  {
                                    writer.location && (

                                      <span>

                                        <MapPin
                                          size={14}
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
                                          size={14}
                                        />

                                        Website

                                      </span>

                                    )
                                  }

                                </div>

                              </div>

                            </Link>



                            {/* =============================
                                ACTIONS
                            ============================== */}

                            <div className="connection-actions">


                              {
                                !isSelf && (

                                  <button
                                    type="button"
                                    className={
                                      following
                                        ? "connection-follow-button following"
                                        : "connection-follow-button"
                                    }
                                    onClick={
                                      () =>
                                        handleFollowToggle(
                                          writer
                                        )
                                    }
                                    disabled={
                                      followLoading
                                    }
                                    aria-label={
                                      following
                                        ? `Unfollow ${writer.name || "writer"}`
                                        : `Follow ${writer.name || "writer"}`
                                    }
                                  >

                                    {
                                      followLoading
                                        ? (

                                            <Loader2
                                              size={16}
                                              className="connections-spin"
                                            />

                                          )
                                        : following
                                          ? (

                                              <UserCheck
                                                size={16}
                                              />

                                            )
                                          : (

                                              <UserPlus
                                                size={16}
                                              />

                                            )
                                    }


                                    <span>

                                      {
                                        followLoading
                                          ? "Please wait"
                                          : following
                                            ? "Following"
                                            : isLoggedIn
                                              ? "Follow"
                                              : "Follow"
                                      }

                                    </span>

                                  </button>

                                )
                              }


                              {
                                isSelf && (

                                  <span className="connection-self-badge">
                                    You
                                  </span>

                                )
                              }


                              <Link
                                to={`/users/${writer.id}`}
                                className="connection-view-button"
                              >
                                View profile
                              </Link>

                            </div>

                          </article>

                        );

                      }
                    )
                  }

                </section>

              )
        }



        {/* =================================================
            PAGINATION
        ================================================== */}

        {
          totalPages > 1 && (

            <nav
              className="connections-pagination"
              aria-label={`${pageTitle} pages`}
            >

              <button
                type="button"
                onClick={
                  () => {

                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          current - 1,
                          1
                        )
                    );


                    window.scrollTo({
                      top:
                        0,

                      behavior:
                        "smooth",
                    });

                  }
                }
                disabled={
                  !hasPrev ||
                  loading
                }
              >

                <ChevronLeft
                  size={17}
                />

                Previous

              </button>


              <span className="connections-page-number">

                Page

                <strong>
                  {page}
                </strong>

                of

                <strong>
                  {totalPages}
                </strong>

              </span>


              <button
                type="button"
                onClick={
                  () => {

                    setPage(
                      (
                        current
                      ) =>
                        Math.min(
                          current + 1,
                          totalPages
                        )
                    );


                    window.scrollTo({
                      top:
                        0,

                      behavior:
                        "smooth",
                    });

                  }
                }
                disabled={
                  !hasNext ||
                  loading
                }
              >

                Next

                <ChevronRight
                  size={17}
                />

              </button>

            </nav>

          )
        }



        {/* =================================================
            PAGE REFRESH LOADER
        ================================================== */}

        {
          loading &&
          data && (

            <div className="connections-refreshing">

              <Loader2
                size={17}
                className="connections-spin"
              />

              Loading...

            </div>

          )
        }

      </div>

    </main>

  );

}



export default ConnectionsPage;