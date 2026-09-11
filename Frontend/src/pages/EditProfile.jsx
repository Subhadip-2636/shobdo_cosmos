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


function WriterProfile() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const { t } =
    useLanguage();

  const userId =
    Number(id);

  const isLoggedIn =
    Boolean(getToken());


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
    Number.isFinite(userId) &&
    userId > 0;


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!validUserId) {
        setError(
          t(
            "writerProfile.invalidId"
          )
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");

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

        if (!mounted) {
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


        // ===============================================
        // FOLLOW STATUS
        // ===============================================

        if (isLoggedIn) {
          try {
            const followData =
              await getFollowStatus(
                userId
              );

            if (!mounted) {
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
              (current) => ({
                ...current,

                followers_count:
                  Number(
                    followData
                      ?.followers_count ??
                      current
                        .followers_count ??
                      0
                  ),

                following_count:
                  Number(
                    followData
                      ?.following_count ??
                      current
                        .following_count ??
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
      } catch (err) {
        console.error(
          "WRITER PROFILE ERROR:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              t(
                "writerProfile.loadError"
              )
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
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
  ]);


  // =====================================================
  // MEMBER DATE
  // =====================================================

  const memberSince =
    useMemo(() => {
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
        ).format(date);
      } catch {
        return date
          .toLocaleDateString();
      }
    }, [
      profile?.created_at,
    ]);


  // =====================================================
  // PROFILE INITIALS
  // =====================================================

  const initials =
    useMemo(() => {
      const name =
        profile?.name
          ?.trim();

      if (!name) {
        return "?";
      }

      const parts =
        name
          .split(/\s+/)
          .filter(Boolean);

      if (
        parts.length === 1
      ) {
        return parts[0]
          .charAt(0)
          .toUpperCase();
      }

      return (
        parts[0]
          .charAt(0) +
        parts[1]
          .charAt(0)
      ).toUpperCase();
    }, [
      profile?.name,
    ]);


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

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isSelf) {
      return;
    }

    const previousFollowing =
      following;

    const previousFollowers =
      Number(
        stats
          ?.followers_count ||
          0
      );

    setFollowLoading(true);


    // ===============================================
    // OPTIMISTIC UI
    // ===============================================

    setFollowing(
      !previousFollowing
    );

    setStats(
      (current) => ({
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
        typeof data
          ?.followers_count ===
        "number"
      ) {
        setStats(
          (current) => ({
            ...current,

            followers_count:
              data.followers_count,

            following_count:
              Number(
                data
                  ?.following_count ??
                  current
                    .following_count ??
                  0
              ),
          })
        );
      }
    } catch (err) {
      console.error(
        "FOLLOW ACTION ERROR:",
        err
      );


      // ===============================================
      // ROLLBACK
      // ===============================================

      setFollowing(
        previousFollowing
      );

      setStats(
        (current) => ({
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
      setFollowLoading(false);
    }
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
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

            <Users size={38} />

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


        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="writer-profile-header">

          <div className="writer-profile-avatar">

            {
              profile.avatar_url
                ? (
                  <img
                    src={
                      profile.avatar_url
                    }
                    alt={
                      profile.name
                    }
                    onError={(
                      event
                    ) => {
                      event
                        .currentTarget
                        .style
                        .display =
                        "none";
                    }}
                  />
                )
                : (
                  <span>
                    {initials}
                  </span>
                )
            }

          </div>


          <div className="writer-profile-main">

            <div className="writer-profile-heading-row">

              <div className="writer-profile-heading">

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


                {/* USERNAME */}

                {
                  profile.username && (
                    <p className="writer-profile-username">
                      @
                      {
                        profile.username
                      }
                    </p>
                  )
                }

              </div>


              {/* =========================================
                  PROFILE ACTION
              ========================================== */}

              {
                isSelf
                  ? (
                    <Link
                      to="/profile/edit"
                      className="writer-profile-edit-button"
                    >

                      <Pencil
                        size={17}
                      />

                      <span>
                        {
                          t(
                            "profile.editProfile"
                          )
                        }
                      </span>

                    </Link>
                  )
                  : (
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
                  )
              }

            </div>


            {/* =========================================
                BIO
            ========================================== */}

            {
              profile.bio && (
                <p className="writer-profile-bio">
                  {
                    profile.bio
                  }
                </p>
              )
            }


            {/* =========================================
                PROFILE META
            ========================================== */}

            <div className="writer-profile-meta">


              {/* LOCATION */}

              {
                profile.location && (
                  <span className="writer-profile-meta-item">

                    <MapPin
                      size={16}
                    />

                    {
                      profile.location
                    }

                  </span>
                )
              }


              {/* WEBSITE */}

              {
                profile.website && (
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
                        (() => {
                          try {
                            return new URL(
                              profile.website
                            ).hostname;
                          } catch {
                            return profile.website;
                          }
                        })()
                      }
                    </span>

                    <ExternalLink
                      size={13}
                    />

                  </a>
                )
              }


              {/* MEMBER SINCE */}

              {
                memberSince && (
                  <span className="writer-profile-meta-item">

                    <CalendarDays
                      size={16}
                    />

                    {
                      t(
                        "writerProfile.memberSince"
                      ).replace(
                        "{{date}}",
                        memberSince
                      )
                    }

                  </span>
                )
              }

            </div>

          </div>

        </section>


        {/* =================================================
            FOLLOW STATS
        ================================================= */}

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
                  stats
                    .followers_count ||
                  0
                )
              }
            </strong>

            <span>
              {
                t(
                  "writerProfile.followers"
                )
              }
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
                  stats
                    .following_count ||
                  0
                )
              }
            </strong>

            <span>
              {
                t(
                  "writerProfile.following"
                )
              }
            </span>

          </Link>

        </section>


        {/* =================================================
            COMMUNITY STATS
        ================================================= */}

        <section className="writer-profile-stats">


          {/* PUBLISHED WRITINGS */}

          <div className="writer-profile-stat">

            <BookOpen
              size={20}
            />

            <div>

              <strong>
                {
                  Number(
                    stats
                      .writings_count ||
                    writings.length ||
                    0
                  )
                }
              </strong>

              <span>
                {
                  t(
                    "writerProfile.publishedWritings"
                  )
                }
              </span>

            </div>

          </div>


          {/* LIKES */}

          <div className="writer-profile-stat">

            <Heart
              size={20}
            />

            <div>

              <strong>
                {
                  Number(
                    stats
                      .likes_count ||
                    0
                  )
                }
              </strong>

              <span>
                {
                  t(
                    "writerProfile.likesReceived"
                  )
                }
              </span>

            </div>

          </div>


          {/* COMMENTS */}

          <div className="writer-profile-stat">

            <MessageCircle
              size={20}
            />

            <div>

              <strong>
                {
                  Number(
                    stats
                      .comments_count ||
                    0
                  )
                }
              </strong>

              <span>
                {
                  t(
                    "writerProfile.comments"
                  )
                }
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            WRITINGS
        ================================================= */}

        <section className="writer-profile-writings">

          <div className="writer-profile-section-heading">

            <div>

              <p className="writer-profile-eyebrow">
                {
                  t(
                    "writerProfile.publishedWorks"
                  )
                }
              </p>

              <h2>
                {
                  t(
                    "writerProfile.writingsBy"
                  ).replace(
                    "{{name}}",
                    profile.name
                  )
                }
              </h2>

            </div>


            <span className="writer-writing-count">

              {
                writings.length
              }

              {" "}

              {
                t(
                  "writerProfile.writings"
                )
              }

            </span>

          </div>


          {/* ===============================================
              EMPTY WRITINGS
          ================================================ */}

          {
            writings.length === 0
              ? (
                <div className="writer-profile-empty">

                  <BookOpen
                    size={34}
                  />

                  <h3>
                    {
                      t(
                        "writerProfile.noWritings"
                      )
                    }
                  </h3>

                  <p>
                    {
                      t(
                        "writerProfile.noWritingsDescription"
                      )
                    }
                  </p>

                </div>
              )
              : (

                /* =========================================
                   WRITING GRID
                ========================================== */

                <div className="writer-profile-writing-grid">

                  {
                    writings.map(
                      (writing) => (

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
                                t(
                                  "common.category"
                                )
                              }
                            </span>

                            {
                              writing.language && (
                                <small>
                                  {
                                    writing
                                      .language
                                      .toUpperCase()
                                  }
                                </small>
                              )
                            }

                          </div>


                          <h3>
                            {
                              writing.title ||
                              t(
                                "common.untitled"
                              )
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
                              )
                                .trim()
                                .length >
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
                                  writing
                                    .likes_count ||
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
                                  writing
                                    .comments_count ||
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
              )
          }

        </section>

      </div>

    </main>
  );
}


export default WriterProfile;