import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Share2,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getReels,
  registerReelView,
} from "../api/reels";

import "./Reels.css";


// =========================================================
// HELPERS
// =========================================================

function formatCount(
  value
) {

  const number =
    Number(value) || 0;


  if (
    number >=
    1_000_000
  ) {

    return `${(
      number /
      1_000_000
    ).toFixed(1)}M`;

  }


  if (
    number >=
    1_000
  ) {

    return `${(
      number /
      1_000
    ).toFixed(1)}K`;

  }


  return String(
    number
  );

}


// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name || "Writer"
    ).trim();


  if (
    !safeName
  ) {

    return "W";

  }


  return safeName
    .split(/\s+/)
    .slice(
      0,
      2
    )
    .map(
      (
        part
      ) =>
        part[0]
    )
    .join("")
    .toUpperCase();

}


// =========================================================
// REEL ITEM
// =========================================================

function ReelItem({
  reel,
  active,
  user,
  onVisible,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) {

  const videoRef =
    useRef(null);


  const itemRef =
    useRef(null);


  const [
    muted,
    setMuted,
  ] = useState(
    true
  );


  const [
    playing,
    setPlaying,
  ] = useState(
    false
  );


  const [
    progress,
    setProgress,
  ] = useState(
    0
  );


  // =======================================================
  // INTERSECTION
  // =======================================================

  useEffect(
    () => {

      const element =
        itemRef.current;


      if (
        !element
      ) {

        return undefined;

      }


      const observer =
        new IntersectionObserver(
          (
            [
              entry,
            ]
          ) => {

            if (
              entry.isIntersecting &&
              entry.intersectionRatio >=
                0.65
            ) {

              onVisible(
                reel.id
              );

            }

          },
          {
            threshold: [
              0.65,
            ],
          }
        );


      observer.observe(
        element
      );


      return () => {

        observer.disconnect();

      };

    },
    [
      onVisible,
      reel.id,
    ]
  );


  // =======================================================
  // AUTO PLAY
  // =======================================================

  useEffect(
    () => {

      const video =
        videoRef.current;


      if (
        !video
      ) {

        return;

      }


      if (
        active
      ) {

        const playPromise =
          video.play();


        if (
          playPromise &&
          typeof playPromise.catch ===
            "function"
        ) {

          playPromise
            .then(
              () => {

                setPlaying(
                  true
                );

              }
            )
            .catch(
              () => {

                setPlaying(
                  false
                );

              }
            );

        }

      } else {

        video.pause();


        setPlaying(
          false
        );

      }

    },
    [
      active,
    ]
  );


  // =======================================================
  // PLAY
  // =======================================================

  function togglePlay() {

    const video =
      videoRef.current;


    if (
      !video
    ) {

      return;

    }


    if (
      video.paused
    ) {

      video
        .play()
        .then(
          () => {

            setPlaying(
              true
            );

          }
        )
        .catch(
          () => {}
        );

    } else {

      video.pause();


      setPlaying(
        false
      );

    }

  }


  // =======================================================
  // SOUND
  // =======================================================

  function toggleMute(
    event
  ) {

    event.stopPropagation();


    const nextMuted =
      !muted;


    setMuted(
      nextMuted
    );


    if (
      videoRef.current
    ) {

      videoRef.current.muted =
        nextMuted;

    }

  }


  // =======================================================
  // PROGRESS
  // =======================================================

  function handleTimeUpdate(
    event
  ) {

    const video =
      event.currentTarget;


    if (
      !video.duration ||
      Number.isNaN(
        video.duration
      )
    ) {

      setProgress(
        0
      );

      return;

    }


    setProgress(
      (
        video.currentTime /
        video.duration
      ) *
        100
    );

  }


  // =======================================================
  // SHARE
  // =======================================================

  async function handleShare(
    event
  ) {

    event.stopPropagation();


    const reelUrl =
      `${window.location.origin}/reels/${reel.id}`;


    try {

      if (
        navigator.share
      ) {

        await navigator.share({

          title:
            "SHOBDO Reel",

          text:
            reel.caption ||
            "Watch this Reel on SHOBDO.",

          url:
            reelUrl,

        });


        return;

      }


      await navigator.clipboard.writeText(
        reelUrl
      );


      window.alert(
        "Reel link copied."
      );

    } catch {

      // Share sheet cancelled.

    }

  }


  // =======================================================
  // CREATOR
  // =======================================================

  const creator =
    reel.creator ||
    reel.user ||
    {};


  const creatorName =
    creator.name ||
    creator.full_name ||
    reel.user_name ||
    `Writer ${reel.user_id || ""}`;


  const avatar =
    creator.profile_picture ||
    creator.avatar_url ||
    creator.avatar ||
    reel.user_avatar ||
    null;


  const creatorPath =
    reel.user_id
      ? `/users/${reel.user_id}`
      : "/reels";


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      className="shobdo-reel"
      ref={
        itemRef
      }
      data-reel-id={
        reel.id
      }
    >

      {/* ===============================================
          VIDEO
      ================================================ */}

      <button
        type="button"
        className="shobdo-reel-video-button"
        onClick={
          togglePlay
        }
        aria-label={
          playing
            ? "Pause Reel"
            : "Play Reel"
        }
      >

        <video
          ref={
            videoRef
          }
          className="shobdo-reel-video"
          src={
            reel.video_url
          }
          poster={
            reel.thumbnail_url ||
            undefined
          }
          muted={
            muted
          }
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={
            () =>
              setPlaying(
                true
              )
          }
          onPause={
            () =>
              setPlaying(
                false
              )
          }
        />

      </button>


      <div
        className="shobdo-reel-gradient"
        aria-hidden="true"
      />


      {/* ===============================================
          TOP BAR
      ================================================ */}

      <div
        className="shobdo-reel-topbar"
      >

        <div
          className="shobdo-reel-topbar-title"
        >

          <span
            className="shobdo-reel-logo-mark"
          >
            শ
          </span>


          <span>
            Reels
          </span>

        </div>


        {user
          ? (

            <Link
              to="/reels/create"
              className="shobdo-reel-create-top"
            >

              <Plus
                size={16}
              />

              Create

            </Link>

          )
          : (

            <Link
              to="/login"
              className="shobdo-reel-login"
            >
              Log in
            </Link>

          )}

      </div>


      {/* ===============================================
          PLAY INDICATOR
      ================================================ */}

      {!playing && (

        <button
          type="button"
          className="shobdo-reel-center-play"
          onClick={
            togglePlay
          }
          aria-label="Play Reel"
        >

          <Play
            size={32}
            fill="currentColor"
          />

        </button>

      )}


      {/* ===============================================
          SOUND
      ================================================ */}

      <button
        type="button"
        className="shobdo-reel-sound"
        onClick={
          toggleMute
        }
        aria-label={
          muted
            ? "Unmute"
            : "Mute"
        }
      >

        {muted
          ? (
            <VolumeX
              size={20}
            />
          )
          : (
            <Volume2
              size={20}
            />
          )}

      </button>


      {/* ===============================================
          ACTIONS
      ================================================ */}

      <aside
        className="shobdo-reel-actions"
      >

        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label="Like"
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >
            <Heart
              size={25}
            />
          </span>


          <span>
            {
              formatCount(
                reel.likes_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label="Comment"
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >
            <MessageCircle
              size={25}
            />
          </span>


          <span>
            {
              formatCount(
                reel.comments_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label="Save"
          onClick={
            (
              event
            ) => {

              if (
                user
              ) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >
            <Bookmark
              size={24}
            />
          </span>


          <span>
            {
              formatCount(
                reel.saves_count
              )
            }
          </span>

        </Link>


        <button
          type="button"
          className="shobdo-reel-action"
          onClick={
            handleShare
          }
          aria-label="Share"
        >

          <span
            className="shobdo-reel-action-circle"
          >
            <Share2
              size={24}
            />
          </span>


          <span>
            {
              formatCount(
                reel.shares_count
              )
            }
          </span>

        </button>


        <button
          type="button"
          className="shobdo-reel-action"
          aria-label="More options"
        >

          <span
            className="shobdo-reel-action-circle"
          >
            <MoreHorizontal
              size={25}
            />
          </span>

        </button>

      </aside>


      {/* ===============================================
          INFO
      ================================================ */}

      <div
        className="shobdo-reel-info"
      >

        <div
          className="shobdo-reel-author-row"
        >

          <Link
            to={
              creatorPath
            }
            className="shobdo-reel-author"
          >

            {avatar
              ? (

                <img
                  src={
                    avatar
                  }
                  alt=""
                  className="shobdo-reel-avatar"
                />

              )
              : (

                <div
                  className="shobdo-reel-avatar shobdo-reel-avatar-fallback"
                >

                  {
                    getInitials(
                      creatorName
                    )
                  }

                </div>

              )}


            <span
              className="shobdo-reel-author-name"
            >
              {creatorName}
            </span>

          </Link>


          {user &&
          Number(user.id) ===
            Number(reel.user_id)
            ? (

              <span
                className="shobdo-reel-own-badge"
              >
                Your Reel
              </span>

            )
            : (

              <Link
                to={
                  user
                    ? creatorPath
                    : "/login"
                }
                className="shobdo-reel-follow"
              >
                Follow
              </Link>

            )}

        </div>


        {reel.caption && (

          <p
            className="shobdo-reel-caption"
          >
            {reel.caption}
          </p>

        )}


        <div
          className="shobdo-reel-meta"
        >

          <span
            className="shobdo-reel-language"
          >

            {
              String(
                reel.language ||
                "bn"
              ).toUpperCase()
            }

          </span>


          <span>

            {
              formatCount(
                reel.views_count
              )
            }

            {" "}
            views

          </span>

        </div>

      </div>


      {/* ===============================================
          NAVIGATION
      ================================================ */}

      <div
        className="shobdo-reel-navigation"
      >

        <button
          type="button"
          disabled={
            !hasPrevious
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();


              onPrevious();

            }
          }
          aria-label="Previous Reel"
        >

          <ChevronUp
            size={25}
          />

        </button>


        <button
          type="button"
          disabled={
            !hasNext
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();


              onNext();

            }
          }
          aria-label="Next Reel"
        >

          <ChevronDown
            size={25}
          />

        </button>

      </div>


      {/* ===============================================
          PROGRESS
      ================================================ */}

      <div
        className="shobdo-reel-progress"
      >

        <div
          className="shobdo-reel-progress-value"
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

    </article>

  );

}


// =========================================================
// REELS PAGE
// =========================================================

export default function Reels({
  user,
}) {

  const {
    reelId,
  } = useParams();


  const containerRef =
    useRef(null);


  const viewedReelsRef =
    useRef(
      new Set()
    );


  const [
    reels,
    setReels,
  ] = useState(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  const [
    activeReelId,
    setActiveReelId,
  ] = useState(
    null
  );


  // =======================================================
  // LOAD
  // =======================================================

  const loadReels =
    useCallback(
      async () => {

        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          const data =
            await getReels({
              page: 1,
              perPage: 30,
            });


          let items =
            Array.isArray(
              data?.reels
            )
              ? data.reels
              : [];


          // -------------------------------------------------
          // OPEN SHARED REEL FIRST
          // -------------------------------------------------

          if (
            reelId
          ) {

            const requestedId =
              Number(
                reelId
              );


            const requestedIndex =
              items.findIndex(
                (
                  reel
                ) =>
                  Number(
                    reel.id
                  ) ===
                  requestedId
              );


            if (
              requestedIndex > 0
            ) {

              const [
                requestedReel,
              ] =
                items.splice(
                  requestedIndex,
                  1
                );


              items = [
                requestedReel,
                ...items,
              ];

            }

          }


          setReels(
            items
          );


          if (
            items.length > 0
          ) {

            setActiveReelId(
              items[0].id
            );

          }

        } catch (
          loadError
        ) {

          console.error(
            "LOAD REELS ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            "Unable to load Reels."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        reelId,
      ]
    );


  useEffect(
    () => {

      loadReels();

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // RELOAD AFTER PUBLISH
  // =======================================================

  useEffect(
    () => {

      function handlePublished() {

        loadReels();

      }


      window.addEventListener(
        "shobdo:reel-published",
        handlePublished
      );


      return () => {

        window.removeEventListener(
          "shobdo:reel-published",
          handlePublished
        );

      };

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // VISIBLE
  // =======================================================

  const handleVisible =
    useCallback(
      (
        id
      ) => {

        setActiveReelId(
          id
        );


        // -------------------------------------------------
        // Avoid counting the same Reel repeatedly during
        // normal up/down scrolling in one page session.
        // -------------------------------------------------

        if (
          viewedReelsRef
            .current
            .has(
              id
            )
        ) {

          return;

        }


        viewedReelsRef
          .current
          .add(
            id
          );


        registerReelView(
          id
        ).catch(
          () => {}
        );

      },
      []
    );


  // =======================================================
  // SCROLL
  // =======================================================

  function scrollToIndex(
    index
  ) {

    if (
      index < 0 ||
      index >=
        reels.length
    ) {

      return;

    }


    const reel =
      reels[
        index
      ];


    const element =
      containerRef
        .current
        ?.querySelector(
          `[data-reel-id="${reel.id}"]`
        );


    element?.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start",

    });

  }


  const activeIndex =
    reels.findIndex(
      (
        reel
      ) =>
        reel.id ===
        activeReelId
    );


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {

    return (

      <main
        className="shobdo-reels-state"
      >

        <LoaderCircle
          className="shobdo-reels-spinner"
          size={36}
        />


        <h1>
          Loading Reels
        </h1>


        <p>
          Discover stories, poetry,
          performances and creative voices
          from the SHOBDO community.
        </p>

      </main>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error
  ) {

    return (

      <main
        className="shobdo-reels-state"
      >

        <h1>
          Reels are unavailable
        </h1>


        <p>
          {error}
        </p>


        <button
          type="button"
          onClick={
            loadReels
          }
          className="shobdo-reels-retry"
        >
          Try again
        </button>

      </main>

    );

  }


  // =======================================================
  // EMPTY
  // =======================================================

  if (
    reels.length === 0
  ) {

    return (

      <main
        className="shobdo-reels-state shobdo-reels-empty-state"
      >

        <div
          className="shobdo-reels-empty-icon"
        >

          <Clapperboard
            size={34}
          />

        </div>


        {user
          ? (

            <>

              <span
                className="shobdo-reels-empty-eyebrow"
              >
                SHOBDO REELS
              </span>


              <h1>
                Your stories deserve a stage.
              </h1>


              <p>

                Publish poetry recitations,
                storytelling, literary
                performances and short
                creative videos.

              </p>


              <Link
                to="/reels/create"
                className="shobdo-reels-create-button"
              >

                <Upload
                  size={18}
                />

                Create your first Reel

              </Link>


              <small
                className="shobdo-reels-empty-note"
              >
                MP4, WEBM, MOV or M4V · Up to 100 MB
              </small>

            </>

          )
          : (

            <>

              <h1>
                Reels are coming to SHOBDO
              </h1>


              <p>

                Short literary videos,
                poetry recitations,
                storytelling and creative
                voices will appear here.

              </p>


              <div
                className="shobdo-reels-empty-actions"
              >

                <Link
                  to="/login"
                  className="shobdo-reels-create-button"
                >

                  <Video
                    size={18}
                  />

                  Log in to create a Reel

                </Link>


                <Link
                  to="/"
                  className="shobdo-reels-home-link"
                >
                  Explore SHOBDO
                </Link>

              </div>

            </>

          )}

      </main>

    );

  }


  // =======================================================
  // REELS
  // =======================================================

  return (

    <main
      ref={
        containerRef
      }
      className="shobdo-reels-page"
    >

      {reels.map(
        (
          reel,
          index
        ) => (

          <ReelItem
            key={
              reel.id
            }
            reel={
              reel
            }
            user={
              user
            }
            active={
              reel.id ===
              activeReelId
            }
            onVisible={
              handleVisible
            }
            hasPrevious={
              index > 0
            }
            hasNext={
              index <
              reels.length - 1
            }
            onPrevious={
              () =>
                scrollToIndex(
                  index - 1
                )
            }
            onNext={
              () =>
                scrollToIndex(
                  index + 1
                )
            }
          />

        )
      )}


      {user && (

        <Link
          to="/reels/create"
          className="shobdo-reels-floating-create"
          aria-label="Create Reel"
          title="Create Reel"
        >

          <Plus
            size={23}
          />

        </Link>

      )}

    </main>

  );

}