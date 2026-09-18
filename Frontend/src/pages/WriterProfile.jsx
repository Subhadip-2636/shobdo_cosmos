import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  Camera,
  ExternalLink,
  Globe2,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
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
  removeMyProfileAvatar,
  unfollowUser,
  updateMyProfile,
  uploadMyProfileAvatar,
  validateProfileAvatar,
} from "../api/api";

import "./WriterProfile.css";


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


function getInitial(
  name
) {

  const normalized =
    String(
      name || ""
    ).trim();


  if (!normalized) {
    return "?";
  }


  return normalized
    .charAt(0)
    .toUpperCase();
}


function getWebsiteLabel(
  website
) {

  if (!website) {
    return "";
  }


  try {

    const url =
      new URL(
        website
      );


    return (
      url.hostname +
      (
        url.pathname !== "/"
          ? url.pathname
          : ""
      )
    );

  } catch {

    return website;
  }
}


// =========================================================
// WRITER PROFILE
// =========================================================

function WriterProfile() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const avatarInputRef =
    useRef(null);


  const userId =
    Number(
      id
    );


  const validUserId =
    Number.isInteger(
      userId
    ) &&
    userId > 0;


  const isLoggedIn =
    Boolean(
      getToken()
    );


  // =======================================================
  // PROFILE STATE
  // =======================================================

  const [
    profile,
    setProfile,
  ] = useState(
    null
  );


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
  ] = useState(
    false
  );


  const [
    isSelf,
    setIsSelf,
  ] = useState(
    false
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


  // =======================================================
  // FOLLOW STATE
  // =======================================================

  const [
    followLoading,
    setFollowLoading,
  ] = useState(
    false
  );


  // =======================================================
  // EDIT PROFILE STATE
  // =======================================================

  const [
    editOpen,
    setEditOpen,
  ] = useState(
    false
  );


  const [
    editForm,
    setEditForm,
  ] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  });


  const [
    profileSaving,
    setProfileSaving,
  ] = useState(
    false
  );


  const [
    profileError,
    setProfileError,
  ] = useState(
    ""
  );


  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState(
    ""
  );


  // =======================================================
  // AVATAR STATE
  // =======================================================

  const [
    avatarFile,
    setAvatarFile,
  ] = useState(
    null
  );


  const [
    avatarPreviewUrl,
    setAvatarPreviewUrl,
  ] = useState(
    ""
  );


  const [
    avatarUploading,
    setAvatarUploading,
  ] = useState(
    false
  );


  const [
    avatarRemoving,
    setAvatarRemoving,
  ] = useState(
    false
  );


  const [
    avatarError,
    setAvatarError,
  ] = useState(
    ""
  );


  const [
    avatarSuccess,
    setAvatarSuccess,
  ] = useState(
    ""
  );


  const [
    avatarVersion,
    setAvatarVersion,
  ] = useState(
    Date.now()
  );


  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(
    () => {

      let mounted =
        true;


      async function loadProfile() {

        if (
          !validUserId
        ) {

          setError(
            "Invalid writer ID."
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


          setStats({
            writings_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.writings_count
              ),

            likes_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.likes_count
              ),

            comments_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.comments_count
              ),

            followers_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.followers_count
              ),

            following_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.following_count
              ),
          });


          setWritings(
            Array.isArray(
              writingsData
                ?.writings
            )
              ? writingsData
                  .writings
              : []
          );


          // ===============================================
          // FOLLOW STATUS
          // ===============================================

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
                  followData
                    ?.following
                )
              );


              setIsSelf(
                Boolean(
                  followData
                    ?.is_self
                )
              );


              setStats(
                (
                  current
                ) => ({
                  ...current,

                  followers_count:
                    safeNumber(
                      followData
                        ?.followers_count ??
                      current
                        .followers_count
                    ),

                  following_count:
                    safeNumber(
                      followData
                        ?.following_count ??
                      current
                        .following_count
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

          } else {

            setFollowing(
              false
            );

            setIsSelf(
              false
            );
          }


        } catch (
          loadError
        ) {

          console.error(
            "WRITER PROFILE ERROR:",
            loadError
          );


          if (
            mounted
          ) {

            setError(
              loadError?.message ||
              "Unable to load writer profile."
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

        mounted =
          false;
      };

    },
    [
      userId,
      validUserId,
      isLoggedIn,
    ]
  );


  // =======================================================
  // AVATAR PREVIEW CLEANUP
  // =======================================================

  useEffect(
    () => {

      return () => {

        if (
          avatarPreviewUrl
        ) {

          URL.revokeObjectURL(
            avatarPreviewUrl
          );
        }
      };

    },
    [
      avatarPreviewUrl,
    ]
  );


  // =======================================================
  // MEMBER SINCE
  // =======================================================

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

          return (
            new Intl
              .DateTimeFormat(
                undefined,
                {
                  month:
                    "long",

                  year:
                    "numeric",
                }
              )
              .format(
                date
              )
          );

        } catch {

          return (
            date
              .toLocaleDateString()
          );
        }
      },
      [
        profile?.created_at,
      ]
    );


  // =======================================================
  // PROFILE AVATAR URL
  // =======================================================

  const displayedAvatarUrl =
    useMemo(
      () => {

        if (
          !profile
            ?.avatar_url
        ) {
          return "";
        }


        try {

          const url =
            new URL(
              profile.avatar_url
            );


          url.searchParams.set(
            "shobdo_avatar",
            String(
              avatarVersion
            )
          );


          return (
            url.toString()
          );

        } catch {

          return (
            profile.avatar_url
          );
        }

      },
      [
        profile?.avatar_url,
        avatarVersion,
      ]
    );


  // =======================================================
  // OPEN EDIT PROFILE
  // =======================================================

  function openEditProfile() {

    if (
      !isSelf ||
      !profile
    ) {
      return;
    }


    setEditForm({
      name:
        profile.name ||
        "",

      username:
        profile.username ||
        "",

      bio:
        profile.bio ||
        "",

      location:
        profile.location ||
        "",

      website:
        profile.website ||
        "",
    });


    setProfileError(
      ""
    );

    setProfileSuccess(
      ""
    );

    setAvatarError(
      ""
    );

    setAvatarSuccess(
      ""
    );


    setEditOpen(
      true
    );
  }


  // =======================================================
  // CLOSE EDIT PROFILE
  // =======================================================

  function closeEditProfile() {

    if (
      profileSaving ||
      avatarUploading ||
      avatarRemoving
    ) {
      return;
    }


    if (
      avatarPreviewUrl
    ) {

      URL.revokeObjectURL(
        avatarPreviewUrl
      );
    }


    setAvatarFile(
      null
    );

    setAvatarPreviewUrl(
      ""
    );

    setAvatarError(
      ""
    );

    setAvatarSuccess(
      ""
    );

    setProfileError(
      ""
    );

    setProfileSuccess(
      ""
    );

    setEditOpen(
      false
    );


    if (
      avatarInputRef.current
    ) {

      avatarInputRef
        .current
        .value =
        "";
    }
  }


  // =======================================================
  // EDIT FIELD CHANGE
  // =======================================================

  function handleEditChange(
    event
  ) {

    const {
      name,
      value,
    } =
      event.target;


    setEditForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );


    setProfileError(
      ""
    );

    setProfileSuccess(
      ""
    );
  }


  // =======================================================
  // SAVE PROFILE
  // =======================================================

  async function handleSaveProfile(
    event
  ) {

    event.preventDefault();


    if (
      profileSaving
    ) {
      return;
    }


    const normalizedName =
      editForm
        .name
        .trim();


    const normalizedUsername =
      editForm
        .username
        .trim()
        .replace(
          /^@+/,
          ""
        );


    if (
      normalizedName.length <
      2
    ) {

      setProfileError(
        "Name must contain at least 2 characters."
      );

      return;
    }


    setProfileSaving(
      true
    );

    setProfileError(
      ""
    );

    setProfileSuccess(
      ""
    );


    try {

      const result =
        await updateMyProfile({
          name:
            normalizedName,

          username:
            normalizedUsername,

          bio:
            editForm
              .bio
              .trim(),

          location:
            editForm
              .location
              .trim(),

          website:
            editForm
              .website
              .trim(),
        });


      if (
        result?.user
      ) {

        setProfile(
          (
            current
          ) => ({
            ...current,
            ...result.user,
          })
        );


        setEditForm(
          (
            current
          ) => ({
            ...current,

            name:
              result.user
                ?.name ??
              current.name,

            username:
              result.user
                ?.username ??
              "",
          })
        );
      }


      setProfileSuccess(
        result?.message ||
        "Profile updated successfully."
      );


    } catch (
      saveError
    ) {

      console.error(
        "PROFILE UPDATE ERROR:",
        saveError
      );


      setProfileError(
        saveError?.message ||
        "Unable to update profile."
      );


    } finally {

      setProfileSaving(
        false
      );
    }
  }


  // =======================================================
  // SELECT AVATAR
  // =======================================================

  function handleAvatarSelection(
    event
  ) {

    const file =
      event.target
        .files
        ?.[0];


    if (!file) {
      return;
    }


    setAvatarError(
      ""
    );

    setAvatarSuccess(
      ""
    );


    try {

      validateProfileAvatar(
        file
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );
      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      setAvatarFile(
        file
      );


      setAvatarPreviewUrl(
        previewUrl
      );


    } catch (
      validationError
    ) {

      setAvatarFile(
        null
      );

      setAvatarPreviewUrl(
        ""
      );


      setAvatarError(
        validationError?.message ||
        "Invalid profile image."
      );


      if (
        avatarInputRef.current
      ) {

        avatarInputRef
          .current
          .value =
          "";
      }
    }
  }


  // =======================================================
  // CANCEL SELECTED AVATAR
  // =======================================================

  function cancelAvatarSelection() {

    if (
      avatarUploading
    ) {
      return;
    }


    if (
      avatarPreviewUrl
    ) {

      URL.revokeObjectURL(
        avatarPreviewUrl
      );
    }


    setAvatarFile(
      null
    );

    setAvatarPreviewUrl(
      ""
    );

    setAvatarError(
      ""
    );


    if (
      avatarInputRef.current
    ) {

      avatarInputRef
        .current
        .value =
        "";
    }
  }


  // =======================================================
  // UPLOAD AVATAR
  // =======================================================

  async function handleAvatarUpload() {

    if (
      !avatarFile ||
      avatarUploading
    ) {
      return;
    }


    setAvatarUploading(
      true
    );

    setAvatarError(
      ""
    );

    setAvatarSuccess(
      ""
    );


    try {

      const result =
        await uploadMyProfileAvatar(
          avatarFile
        );


      const nextAvatarUrl =
        result?.avatar_url ||
        result
          ?.user
          ?.avatar_url ||
        "";


      setProfile(
        (
          current
        ) => ({
          ...current,

          ...(
            result?.user ||
            {}
          ),

          avatar_url:
            nextAvatarUrl ||
            current
              ?.avatar_url ||
            null,
        })
      );


      setAvatarVersion(
        Date.now()
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );
      }


      setAvatarFile(
        null
      );

      setAvatarPreviewUrl(
        ""
      );


      if (
        avatarInputRef.current
      ) {

        avatarInputRef
          .current
          .value =
          "";
      }


      setAvatarSuccess(
        result?.message ||
        "Profile photo updated successfully."
      );


    } catch (
      uploadError
    ) {

      console.error(
        "PROFILE AVATAR UPLOAD ERROR:",
        uploadError
      );


      setAvatarError(
        uploadError?.message ||
        "Unable to upload profile photo."
      );


    } finally {

      setAvatarUploading(
        false
      );
    }
  }


  // =======================================================
  // REMOVE AVATAR
  // =======================================================

  async function handleRemoveAvatar() {

    if (
      avatarRemoving ||
      !profile?.avatar_url
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "Remove your current profile photo?"
      );


    if (
      !confirmed
    ) {
      return;
    }


    setAvatarRemoving(
      true
    );

    setAvatarError(
      ""
    );

    setAvatarSuccess(
      ""
    );


    try {

      const result =
        await removeMyProfileAvatar();


      setProfile(
        (
          current
        ) => ({
          ...current,

          ...(
            result?.user ||
            {}
          ),

          avatar_url:
            null,
        })
      );


      setAvatarVersion(
        Date.now()
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );
      }


      setAvatarFile(
        null
      );

      setAvatarPreviewUrl(
        ""
      );


      if (
        avatarInputRef.current
      ) {

        avatarInputRef
          .current
          .value =
          "";
      }


      setAvatarSuccess(
        result?.message ||
        "Profile photo removed."
      );


    } catch (
      removeError
    ) {

      console.error(
        "PROFILE AVATAR REMOVE ERROR:",
        removeError
      );


      setAvatarError(
        removeError?.message ||
        "Unable to remove profile photo."
      );


    } finally {

      setAvatarRemoving(
        false
      );
    }
  }


  // =======================================================
  // FOLLOW / UNFOLLOW
  // =======================================================

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
      safeNumber(
        stats
          ?.followers_count
      );


    setFollowLoading(
      true
    );


    // Optimistic UI

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

      const result =
        previousFollowing
          ? await unfollowUser(
              userId
            )

          : await followUser(
              userId
            );


      setFollowing(
        Boolean(
          result
            ?.following
        )
      );


      setStats(
        (
          current
        ) => ({
          ...current,

          followers_count:
            safeNumber(
              result
                ?.followers_count ??
              current
                .followers_count
            ),

          following_count:
            safeNumber(
              result
                ?.following_count ??
              current
                .following_count
            ),
        })
      );


    } catch (
      followError
    ) {

      console.error(
        "FOLLOW ACTION ERROR:",
        followError
      );


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
        followError?.message ||
        "Unable to update follow status."
      );


    } finally {

      setFollowLoading(
        false
      );
    }
  }


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {

    return (

      <main
        className=
          "writer-profile-page"
      >

        <div
          className=
            "writer-profile-shell"
        >

          <div
            className=
              "writer-profile-state"
          >

            <Loader2
              size={34}
              className="spin"
            />

            <p>
              Loading writer profile...
            </p>

          </div>

        </div>

      </main>
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error ||
    !profile
  ) {

    return (

      <main
        className=
          "writer-profile-page"
      >

        <div
          className=
            "writer-profile-shell"
        >

          <section
            className=
              "writer-profile-state"
          >

            <Users
              size={38}
            />

            <h1>
              Writer not found
            </h1>

            <p>
              {
                error ||
                "This writer profile is unavailable."
              }
            </p>

            <Link
              to="/explore"
              className=
                "writer-profile-primary-link"
            >
              Explore writings
            </Link>

          </section>

        </div>

      </main>
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className=
        "writer-profile-page"
    >

      <div
        className=
          "writer-profile-shell"
      >


        {/* ===============================================
            PROFILE HEADER
        ================================================ */}

        <section
          className=
            "writer-profile-header"
        >

          <div
            className=
              "writer-profile-avatar"
          >

            {
              displayedAvatarUrl
                ? (

                    <img
                      src={
                        displayedAvatarUrl
                      }
                      alt={`${profile.name || "Writer"} profile`}
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

                : getInitial(
                    profile.name
                  )
            }

          </div>


          <div
            className=
              "writer-profile-main"
          >

            <div
              className=
                "writer-profile-heading-row"
            >

              <div>

                <p
                  className=
                    "writer-profile-eyebrow"
                >
                  Writer Profile
                </p>


                <h1>
                  {
                    profile.name
                  }
                </h1>


                {
                  profile
                    .username && (

                    <p
                      className=
                        "writer-profile-username"
                    >
                      @
                      {
                        profile
                          .username
                      }
                    </p>
                  )
                }

              </div>


              <div
                className=
                  "writer-profile-actions"
              >

                {
                  !isSelf && (

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
                            ? "Following"
                            : "Follow"
                        }
                      </span>

                    </button>
                  )
                }


                {
                  isSelf && (

                    <button
                      type="button"
                      className=
                        "writer-profile-edit-button"
                      onClick={
                        openEditProfile
                      }
                    >

                      <Pencil
                        size={16}
                      />

                      Edit Profile

                    </button>
                  )
                }

              </div>

            </div>


            {
              profile
                .bio && (

                <p
                  className=
                    "writer-profile-bio"
                >
                  {
                    profile.bio
                  }
                </p>
              )
            }


            <div
              className=
                "writer-profile-meta"
            >

              {
                profile
                  .location && (

                  <span>

                    <MapPin
                      size={15}
                    />

                    {
                      profile
                        .location
                    }

                  </span>
                )
              }


              {
                profile
                  .website && (

                  <a
                    href={
                      profile
                        .website
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >

                    <Globe2
                      size={15}
                    />

                    {
                      getWebsiteLabel(
                        profile
                          .website
                      )
                    }

                    <ExternalLink
                      size={13}
                    />

                  </a>
                )
              }


              {
                memberSince && (

                  <span>

                    <CalendarDays
                      size={15}
                    />

                    Member since{" "}
                    {
                      memberSince
                    }

                  </span>
                )
              }

            </div>

          </div>

        </section>


        {/* ===============================================
            EDIT PROFILE PANEL
        ================================================ */}

        {
          isSelf &&
          editOpen && (

            <section
              className=
                "writer-profile-edit-panel"
            >

              <div
                className=
                  "writer-profile-edit-heading"
              >

                <div>

                  <p
                    className=
                      "writer-profile-eyebrow"
                  >
                    Account Profile
                  </p>

                  <h2>
                    Edit Profile
                  </h2>

                </div>


                <button
                  type="button"
                  className=
                    "writer-profile-close-button"
                  onClick={
                    closeEditProfile
                  }
                  disabled={
                    profileSaving ||
                    avatarUploading ||
                    avatarRemoving
                  }
                  aria-label=
                    "Close edit profile"
                >

                  <X
                    size={18}
                  />

                </button>

              </div>


              {/* =========================================
                  PROFILE PHOTO
              ========================================== */}

              <div
                className=
                  "writer-profile-photo-editor"
              >

                <div
                  className=
                    "writer-profile-photo-preview"
                >

                  {
                    avatarPreviewUrl
                      ? (

                          <img
                            src={
                              avatarPreviewUrl
                            }
                            alt=
                              "Selected profile preview"
                          />

                        )

                      : displayedAvatarUrl
                        ? (

                            <img
                              src={
                                displayedAvatarUrl
                              }
                              alt=
                                "Current profile"
                            />

                          )

                        : (

                            <span>
                              {
                                getInitial(
                                  profile.name
                                )
                              }
                            </span>
                          )
                  }

                </div>


                <div
                  className=
                    "writer-profile-photo-controls"
                >

                  <div>

                    <h3>
                      Profile photo
                    </h3>

                    <p>
                      JPG, PNG or WEBP.
                      Maximum file size 5 MB.
                    </p>

                  </div>


                  <input
                    ref={
                      avatarInputRef
                    }
                    type="file"
                    accept=
                      "image/jpeg,image/jpg,image/png,image/webp"
                    hidden
                    onChange={
                      handleAvatarSelection
                    }
                  />


                  <div
                    className=
                      "writer-profile-photo-buttons"
                  >

                    <button
                      type="button"
                      className=
                        "writer-profile-photo-select-button"
                      onClick={
                        () =>
                          avatarInputRef
                            .current
                            ?.click()
                      }
                      disabled={
                        avatarUploading ||
                        avatarRemoving
                      }
                    >

                      <Camera
                        size={16}
                      />

                      {
                        profile
                          .avatar_url
                          ? "Change Photo"
                          : "Choose Photo"
                      }

                    </button>


                    {
                      avatarFile && (

                        <button
                          type="button"
                          className=
                            "writer-profile-photo-upload-button"
                          onClick={
                            handleAvatarUpload
                          }
                          disabled={
                            avatarUploading ||
                            avatarRemoving
                          }
                        >

                          {
                            avatarUploading
                              ? (

                                  <Loader2
                                    size={16}
                                    className="spin"
                                  />

                                )

                              : (

                                  <Upload
                                    size={16}
                                  />

                                )
                          }

                          {
                            avatarUploading
                              ? "Uploading..."
                              : "Upload Photo"
                          }

                        </button>
                      )
                    }


                    {
                      avatarFile && (

                        <button
                          type="button"
                          className=
                            "writer-profile-photo-cancel-button"
                          onClick={
                            cancelAvatarSelection
                          }
                          disabled={
                            avatarUploading
                          }
                        >

                          <X
                            size={16}
                          />

                          Cancel Selection

                        </button>
                      )
                    }


                    {
                      profile
                        .avatar_url &&
                      !avatarFile && (

                        <button
                          type="button"
                          className=
                            "writer-profile-photo-remove-button"
                          onClick={
                            handleRemoveAvatar
                          }
                          disabled={
                            avatarRemoving ||
                            avatarUploading
                          }
                        >

                          {
                            avatarRemoving
                              ? (

                                  <Loader2
                                    size={16}
                                    className="spin"
                                  />

                                )

                              : (

                                  <Trash2
                                    size={16}
                                  />

                                )
                          }

                          {
                            avatarRemoving
                              ? "Removing..."
                              : "Remove Photo"
                          }

                        </button>
                      )
                    }

                  </div>


                  {
                    avatarFile && (

                      <div
                        className=
                          "writer-profile-selected-file"
                      >

                        <strong>
                          {
                            avatarFile
                              .name
                          }
                        </strong>

                        <span>
                          {
                            (
                              avatarFile
                                .size /
                              (
                                1024 *
                                1024
                              )
                            ).toFixed(
                              2
                            )
                          }{" "}
                          MB
                        </span>

                      </div>
                    )
                  }


                  {
                    avatarError && (

                      <p
                        className=
                          "writer-profile-form-error"
                      >
                        {
                          avatarError
                        }
                      </p>
                    )
                  }


                  {
                    avatarSuccess && (

                      <p
                        className=
                          "writer-profile-form-success"
                      >
                        {
                          avatarSuccess
                        }
                      </p>
                    )
                  }

                </div>

              </div>


              {/* =========================================
                  PROFILE INFORMATION
              ========================================== */}

              <form
                className=
                  "writer-profile-edit-form"
                onSubmit={
                  handleSaveProfile
                }
              >

                <div
                  className=
                    "writer-profile-form-grid"
                >

                  <label>

                    <span>
                      Name
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={
                        editForm
                          .name
                      }
                      onChange={
                        handleEditChange
                      }
                      minLength={2}
                      maxLength={120}
                      required
                      disabled={
                        profileSaving
                      }
                      placeholder=
                        "Your name"
                    />

                  </label>


                  <label>

                    <span>
                      Username
                    </span>

                    <div
                      className=
                        "writer-profile-username-input"
                    >

                      <span>
                        @
                      </span>

                      <input
                        type="text"
                        name="username"
                        value={
                          editForm
                            .username
                        }
                        onChange={
                          handleEditChange
                        }
                        maxLength={30}
                        disabled={
                          profileSaving
                        }
                        placeholder=
                          "username"
                        autoCapitalize="none"
                        autoCorrect="off"
                      />

                    </div>

                  </label>


                  <label
                    className=
                      "writer-profile-wide-field"
                  >

                    <span>
                      Bio
                    </span>

                    <textarea
                      name="bio"
                      value={
                        editForm
                          .bio
                      }
                      onChange={
                        handleEditChange
                      }
                      maxLength={500}
                      disabled={
                        profileSaving
                      }
                      placeholder=
                        "Tell readers something about yourself..."
                    />

                    <small>
                      {
                        editForm
                          .bio
                          .length
                      }
                      /500
                    </small>

                  </label>


                  <label>

                    <span>
                      Location
                    </span>

                    <input
                      type="text"
                      name="location"
                      value={
                        editForm
                          .location
                      }
                      onChange={
                        handleEditChange
                      }
                      maxLength={100}
                      disabled={
                        profileSaving
                      }
                      placeholder=
                        "Kolkata, India"
                    />

                  </label>


                  <label>

                    <span>
                      Website
                    </span>

                    <input
                      type="url"
                      name="website"
                      value={
                        editForm
                          .website
                      }
                      onChange={
                        handleEditChange
                      }
                      maxLength={255}
                      disabled={
                        profileSaving
                      }
                      placeholder=
                        "https://example.com"
                    />

                  </label>

                </div>


                {
                  profileError && (

                    <p
                      className=
                        "writer-profile-form-error"
                    >
                      {
                        profileError
                      }
                    </p>
                  )
                }


                {
                  profileSuccess && (

                    <p
                      className=
                        "writer-profile-form-success"
                    >
                      {
                        profileSuccess
                      }
                    </p>
                  )
                }


                <div
                  className=
                    "writer-profile-edit-actions"
                >

                  <button
                    type="button"
                    className=
                      "writer-profile-cancel-button"
                    onClick={
                      closeEditProfile
                    }
                    disabled={
                      profileSaving ||
                      avatarUploading ||
                      avatarRemoving
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className=
                      "writer-profile-save-button"
                    disabled={
                      profileSaving
                    }
                  >

                    {
                      profileSaving
                        ? (

                            <Loader2
                              size={17}
                              className="spin"
                            />

                          )

                        : (

                            <Save
                              size={17}
                            />

                          )
                    }

                    {
                      profileSaving
                        ? "Saving..."
                        : "Save Profile"
                    }

                  </button>

                </div>

              </form>

            </section>
          )
        }


        {/* ===============================================
            FOLLOW STATS
        ================================================ */}

        <section
          className=
            "writer-follow-stats"
        >

          <Link
            to={
              `/users/${userId}/followers`
            }
            className=
              "writer-follow-stat"
          >

            <strong>
              {
                safeNumber(
                  stats
                    .followers_count
                )
              }
            </strong>

            <span>
              Followers
            </span>

          </Link>


          <Link
            to={
              `/users/${userId}/following`
            }
            className=
              "writer-follow-stat"
          >

            <strong>
              {
                safeNumber(
                  stats
                    .following_count
                )
              }
            </strong>

            <span>
              Following
            </span>

          </Link>

        </section>


        {/* ===============================================
            COMMUNITY STATS
        ================================================ */}

        <section
          className=
            "writer-profile-stats"
        >

          <div
            className=
              "writer-profile-stat"
          >

            <BookOpen
              size={20}
            />

            <div>

              <strong>
                {
                  safeNumber(
                    stats
                      .writings_count ||
                    writings
                      .length
                  )
                }
              </strong>

              <span>
                Published Writings
              </span>

            </div>

          </div>


          <div
            className=
              "writer-profile-stat"
          >

            <Heart
              size={20}
            />

            <div>

              <strong>
                {
                  safeNumber(
                    stats
                      .likes_count
                  )
                }
              </strong>

              <span>
                Likes Received
              </span>

            </div>

          </div>


          <div
            className=
              "writer-profile-stat"
          >

            <MessageCircle
              size={20}
            />

            <div>

              <strong>
                {
                  safeNumber(
                    stats
                      .comments_count
                  )
                }
              </strong>

              <span>
                Comments
              </span>

            </div>

          </div>

        </section>


        {/* ===============================================
            WRITINGS
        ================================================ */}

        <section
          className=
            "writer-profile-writings"
        >

          <div
            className=
              "writer-profile-section-heading"
          >

            <div>

              <p
                className=
                  "writer-profile-eyebrow"
              >
                Published Works
              </p>

              <h2>
                Writings by{" "}
                {
                  profile.name
                }
              </h2>

            </div>


            <span
              className=
                "writer-writing-count"
            >

              {
                writings
                  .length
              }
              {" "}
              writings

            </span>

          </div>


          {
            writings.length ===
            0
              ? (

                  <div
                    className=
                      "writer-profile-empty"
                  >

                    <BookOpen
                      size={34}
                    />

                    <h3>
                      No published writings yet
                    </h3>

                    <p>
                      This writer has not published any writings yet.
                    </p>

                  </div>
                )

              : (

                  <div
                    className=
                      "writer-profile-writing-grid"
                  >

                    {
                      writings.map(
                        (
                          writing
                        ) => {

                          const content =
                            String(
                              writing
                                ?.content ||
                              ""
                            )
                              .trim();


                          return (

                            <Link
                              key={
                                writing.id
                              }
                              to={
                                `/writings/${writing.id}`
                              }
                              className=
                                "writer-profile-writing-card"
                            >

                              <div
                                className=
                                  "writer-profile-writing-top"
                              >

                                <span>
                                  {
                                    writing
                                      .category ||
                                    "Writing"
                                  }
                                </span>


                                {
                                  writing
                                    .language && (

                                    <small>
                                      {
                                        String(
                                          writing
                                            .language
                                        )
                                          .toUpperCase()
                                      }
                                    </small>
                                  )
                                }

                              </div>


                              <h3>
                                {
                                  writing
                                    .title ||
                                  "Untitled"
                                }
                              </h3>


                              <p>

                                {
                                  content
                                    .slice(
                                      0,
                                      180
                                    )
                                }

                                {
                                  content
                                    .length >
                                  180
                                    ? "..."
                                    : ""
                                }

                              </p>


                              <div
                                className=
                                  "writer-profile-writing-meta"
                              >

                                <span>

                                  <Heart
                                    size={14}
                                  />

                                  {
                                    safeNumber(
                                      writing
                                        .likes_count
                                    )
                                  }

                                </span>


                                <span>

                                  <MessageCircle
                                    size={14}
                                  />

                                  {
                                    safeNumber(
                                      writing
                                        .comments_count
                                    )
                                  }

                                </span>

                              </div>

                            </Link>
                          );
                        }
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