import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  Globe2,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  followUser,
  getFollowStatus,
  getToken,
  getWriterProfile,
  getWriterWritings,
  unfollowUser,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./WriterProfile.css";


// =========================================================
// WRITER PROFILE
// =========================================================

function WriterProfile() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    t,
  } = useLanguage();


  const userId =
    Number(id);


  const isLoggedIn =
    Boolean(
      getToken()
    );


  // =====================================================
  // STATE
  // =====================================================

  const [
    profile,
    setProfile,
  ] = useState(null);


  const [
    stats,
    setStats,
  ] = useState({
    writings_count: 0,
    likes_count: 0,
    comments_count: 0,
    followers_count: 0,
    following_count: 0,
  });


  const [
    writings,
    setWritings,
  ] = useState([]);


  const [
    following,
    setFollowing,
  ] = useState(false);


  const [
    isSelf,
    setIsSelf,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    followLoading,
    setFollowLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // VALID USER ID
  // =====================================================

  const validUserId =
    Number.isFinite(
      userId
    ) &&
    userId > 0;


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    let mounted = true;


    async function loadProfile() {

      if (
        !validUserId
      ) {

        setError(
          t(
            "writerProfile.invalidId"
          )
        );

        setLoading(
          false
        );

        return;

      }


      setLoading(
        true
      );

      setError(
        ""
      );


      try {

        const [
          profileData,
          writingsData,
        ] =
          await Promise.all([
            getWriterProfile(
              userId
            ),

            getWriterWritings(
              userId
            ),
          ]);


        if (
          !mounted
        ) {
          return;
        }


        setProfile(
          profileData?.user ||
          null
        );


        setStats(
          profileData?.stats || {
            writings_count: 0,
            likes_count: 0,
            comments_count: 0,
            followers_count: 0,
            following_count: 0,
          }
        );


        setWritings(
          Array.isArray(
            writingsData?.writings
          )
            ? writingsData.writings
            : []
        );


        // -----------------------------------------------
        // FOLLOW STATUS
        // -----------------------------------------------

        if (
          isLoggedIn
        ) {

          try {

            const followData =
              await getFollowStatus(
                userId
              );


            if (
              !mounted
            ) {
              return;
            }


            setFollowing(
              Boolean(
                followData?.following
              )
            );


            setIsSelf(
              Boolean(
                followData?.is_self
              )
            );


            setStats(
              (
                current
              ) => ({
                ...current,

                followers_count:
                  Number(
                    followData?.followers_count ??
                    current.followers_count ??
                    0
                  ),

                following_count:
                  Number(
                    followData?.following_count ??
                    current.following_count ??
                    0
                  ),
              })
            );

          } catch (
            followError
          ) {

            console.error(
              "FOLLOW STATUS ERROR:",
              followError
            );

          }

        }


      } catch (
        err
      ) {

        console.error(
          "WRITER PROFILE ERROR:",
          err
        );


        if (
          mounted
        ) {

          setError(
            err?.message ||
            t(
              "writerProfile.loadError"
            )
          );

        }


      } finally {

        if (
          mounted
        ) {

          setLoading(
            false
          );

        }

      }

    }


    loadProfile();


    return () => {

      mounted = false;

    };

  }, [
    userId,
    validUserId,
    isLoggedIn,
    t,
  ]);


  // =====================================================
  // MEMBER DATE
  // =====================================================

  const memberSince =
    useMemo(
      () => {

        if (
          !profile?.created_at
        ) {
          return "";
        }


        const date =
          new Date(
            profile.created_at
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
            undefined,
            {
              month: "long",
              year: "numeric",
            }
          ).format(
            date
          );

        } catch {

          return date
            .toLocaleDateString();

        }

      },
      [
        profile?.created_at,
      ]
    );


  // =====================================================
  // PROFILE INITIALS
  // =====================================================

  const profileInitials =
    useMemo(
      () => {

        const name =
          profile?.name
            ?.trim() ||
          "";


        if (
          !name
        ) {
          return "?";
        }


        return name
          .split(/\s+/)
          .slice(0, 2)
          .map(
            (part) =>
              part
                .charAt(0)
                .toUpperCase()
          )
          .join("");

      },
      [
        profile?.name,
      ]
    );


  // =====================================================
  // FOLLOW / UNFOLLOW
  // =====================================================

  async function handleFollow() {

    if (
      followLoading ||
      !validUserId
    ) {
      return;
    }


    if (
      !isLoggedIn
    ) {

      navigate(
        "/login"
      );

      return;

    }


    if (
      isSelf
    ) {
      return;
    }


    const previousFollowing =
      following;


    const previousFollowers =
      Number(
        stats?.followers_count ||
        0
      );


    setFollowLoading(
      true
    );


    // Optimistic update

    setFollowing(
      !previousFollowing
    );


    setStats(
      (
        current
      ) => ({
        ...current,

        followers_count:
          Math.max(
            0,
            previousFollowers +
            (
              previousFollowing
                ? -1
                : 1
            )
          ),
      })
    );


    try {

      const data =
        previousFollowing
          ? await unfollowUser(
              userId
            )
          : await followUser(
              userId
            );


      setFollowing(
        Boolean(
          data?.following
        )
      );


      if (
        typeof data?.followers_count ===
        "number"
      ) {

        setStats(
          (
            current
          ) => ({
            ...current,

            followers_count:
              data.followers_count,

            following_count:
              Number(
                data?.following_count ??
                current.following_count ??
                0
              ),
          })
        );

      }


    } catch (
      err
    ) {

      console.error(
        "FOLLOW ACTION ERROR:",
        err
      );


      // Roll back optimistic update

      setFollowing(
        previousFollowing
      );


      setStats(
        (
          current
        ) => ({
          ...current,

          followers_count:
            previousFollowers,
        })
      );


      window.alert(
        err?.message ||
        t(
          "writerProfile.followError"
        )
      );


    } finally {

      setFollowLoading(
        false
      );

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading
  ) {

    return (

      <main className="writer-profile-page">

        <div className="writer-profile-shell">

          <div className="writer-profile-state">

            <Loader2
              size={34}
              className="spin"
            />

            <p>

              {
                t(
                  "writerProfile.loading"
                )
              }

            </p>

          </div>

        </div>

      </main>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (
    error ||
    !profile
  ) {

    return (

      <main className="writer-profile-page">

        <div className="writer-profile-shell">

          <section className="writer-profile-state">

            <Users
              size={38}
            />

            <h1>

              {
                t(
                  "writerProfile.notFound"
                )
              }

            </h1>

            <p>

              {
                error ||
                t(
                  "writerProfile.unavailable"
                )
              }

            </p>

            <Link
              to="/explore"
              className="writer-profile-primary-link"
            >

              {
                t(
                  "writerProfile.exploreWritings"
                )
              }

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

    <main className="writer-profile-page">

      <div className="writer-profile-shell">


        {/* ===============================================
            PROFILE HEADER
        ================================================ */}

        <section className="writer-profile-header">


          {/* =============================================
              AVATAR
          ============================================== */}

          <div className="writer-profile-avatar">

            <span className="writer-profile-avatar-initial">

              {
                profileInitials
              }

            </span>


            {profile?.avatar_url && (

              <img
                src={
                  profile.avatar_url
                }
                alt={
                  `${profile.name} profile`
                }
                className="writer-profile-avatar-image"
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

          </div>


          {/* =============================================
              MAIN PROFILE INFO
          ============================================== */}

          <div className="writer-profile-main">

            <div className="writer-profile-heading-row">

              <div className="writer-profile-heading-content">

                <p className="writer-profile-eyebrow">

                  {
                    t(
                      "writerProfile.title"
                    )
                  }

                </p>


                <h1>

                  {
                    profile.name
                  }

                </h1>


                {profile?.username && (

                  <p className="writer-profile-username">

                    @
                    {
                      profile.username
                    }

                  </p>

                )}

              </div>


              {/* =========================================
                  FOLLOW BUTTON
              ========================================== */}

              {!isSelf && (

                <button
                  type="button"
                  className={
                    following
                      ? "writer-follow-button following"
                      : "writer-follow-button"
                  }
                  onClick={
                    handleFollow
                  }
                  disabled={
                    followLoading
                  }
                >

                  {
                    followLoading
                      ? (
                          <Loader2
                            size={17}
                            className="spin"
                          />
                        )
                      : following
                        ? (
                            <UserCheck
                              size={17}
                            />
                          )
                        : (
                            <UserPlus
                              size={17}
                            />
                          )
                  }


                  <span>

                    {
                      following
                        ? t(
                            "writerProfile.following"
                          )
                        : t(
                            "writerProfile.follow"
                          )
                    }

                  </span>

                </button>

              )}


              {/* =========================================
                  EDIT OWN PROFILE
              ========================================== */}

              {isSelf && (

                <Link
                  to="/profile/edit"
                  className="writer-profile-edit-button"
                >

                  <Pencil
                    size={16}
                  />

                  <span>
                    {t("profile.editProfile")}
                  </span>

                </Link>

              )}

            </div>


            {/* =========================================
                BIO
            ========================================== */}

            {profile?.bio && (

              <p className="writer-profile-bio">

                {
                  profile.bio
                }

              </p>

            )}


            {/* =========================================
                PROFILE META
            ========================================== */}

            <div className="writer-profile-meta">


              {profile?.location && (

                <div className="writer-profile-meta-item">

                  <MapPin
                    size={16}
                  />

                  <span>

                    {
                      profile.location
                    }

                  </span>

                </div>

              )}


              {profile?.website && (

                <a
                  href={
                    profile.website
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="writer-profile-meta-item writer-profile-website"
                >

                  <Globe2
                    size={16}
                  />

                  <span>

                    {
                      profile.website
                        .replace(
                          /^https?:\/\//,
                          ""
                        )
                        .replace(
                          /\/$/,
                          ""
                        )
                    }

                  </span>

                  <ExternalLink
                    size={13}
                  />

                </a>

              )}


              {memberSince && (

                <div className="writer-profile-meta-item">

                  <CalendarDays
                    size={16}
                  />

                  <span>

                    {t("writerProfile.memberSince").replace("{{date}}", memberSince)}

                  </span>

                </div>

              )}

            </div>

          </div>

        </section>


        {/* ===============================================
            FOLLOW STATS
        ================================================ */}

        <section className="writer-follow-stats">

          <Link
            to={
              `/users/${userId}/followers`
            }
            className="writer-follow-stat"
          >

            <strong>

              {
                Number(
                  stats.followers_count ||
                  0
                )
              }

            </strong>

            <span>
              {t("writerProfile.followers")}
            </span>

          </Link>


          <Link
            to={
              `/users/${userId}/following`
            }
            className="writer-follow-stat"
          >

            <strong>

              {
                Number(
                  stats.following_count ||
                  0
                )
              }

            </strong>

            <span>
              {t("writerProfile.following")}
            </span>

          </Link>

        </section>


        {/* ===============================================
            COMMUNITY STATS
        ================================================ */}

        <section className="writer-profile-stats">


          <div className="writer-profile-stat">

            <BookOpen
              size={20}
            />

            <div>

              <strong>

                {
                  Number(
                    stats.writings_count ||
                    writings.length ||
                    0
                  )
                }

              </strong>

              <span>
                {t("writerProfile.publishedWritings")}
              </span>

            </div>

          </div>


          <div className="writer-profile-stat">

            <Heart
              size={20}
            />

            <div>

              <strong>

                {
                  Number(
                    stats.likes_count ||
                    0
                  )
                }

              </strong>

              <span>
                {t("writerProfile.likesReceived")}
              </span>

            </div>

          </div>


          <div className="writer-profile-stat">

            <MessageCircle
              size={20}
            />

            <div>

              <strong>

                {
                  Number(
                    stats.comments_count ||
                    0
                  )
                }

              </strong>

              <span>
                {t("writerProfile.comments")}
              </span>

            </div>

          </div>

        </section>


        {/* ===============================================
            WRITINGS
        ================================================ */}

        <section className="writer-profile-writings">

          <div className="writer-profile-section-heading">

            <div>

              <p className="writer-profile-eyebrow">
                {t("writerProfile.publishedWorks")}
              </p>

              <h2>

                {t("writerProfile.writingsBy").replace("{{name}}", profile.name)}

              </h2>

            </div>


            <span className="writer-writing-count">

              {
                writings.length
              }

              {" "}

              writings

            </span>

          </div>


          {writings.length === 0 ? (

            <div className="writer-profile-empty">

              <BookOpen
                size={34}
              />

              <h3>
                {t("writerProfile.noWritings")}
              </h3>

              <p>
                This writer has not published
                any writings yet.
              </p>

            </div>

          ) : (

            <div className="writer-profile-writing-grid">

              {
                writings.map(
                  (
                    writing
                  ) => (

                    <Link
                      key={
                        writing.id
                      }
                      to={
                        `/writings/${writing.id}`
                      }
                      className="writer-profile-writing-card"
                    >

                      <div className="writer-profile-writing-top">

                        <span>

                          {
                            writing.category ||
                            "Writing"
                          }

                        </span>


                        {writing.language && (

                          <small>

                            {
                              writing.language
                                .toUpperCase()
                            }

                          </small>

                        )}

                      </div>


                      <h3>

                        {
                          writing.title ||
                          "Untitled"
                        }

                      </h3>


                      <p>

                        {
                          (
                            writing.content ||
                            ""
                          )
                            .trim()
                            .slice(
                              0,
                              180
                            )
                        }

                        {
                          (
                            writing.content ||
                            ""
                          ).trim().length >
                          180
                            ? "..."
                            : ""
                        }

                      </p>


                      <div className="writer-profile-writing-meta">

                        <span>

                          <Heart
                            size={14}
                          />

                          {
                            Number(
                              writing.likes_count ||
                              0
                            )
                          }

                        </span>


                        <span>

                          <MessageCircle
                            size={14}
                          />

                          {
                            Number(
                              writing.comments_count ||
                              0
                            )
                          }

                        </span>

                      </div>

                    </Link>

                  )
                )
              }

            </div>

          )}

        </section>

      </div>

    </main>

  );

}


export default WriterProfile;