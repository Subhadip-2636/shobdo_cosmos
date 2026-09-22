import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Eye,
  FileVideo2,
  Globe2,
  LoaderCircle,
  Lock,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  publishReel,
  REEL_LANGUAGES,
  validateReelVideo,
} from "../api/reels";

import "./CreateReel.css";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_CAPTION_LENGTH =
  5000;


const VISIBILITY_OPTIONS = [

  {
    value:
      "public",

    label:
      "Public",

    description:
      "Anyone on SHOBDO can watch this Reel.",

    icon:
      Globe2,
  },

  {
    value:
      "followers",

    label:
      "Followers",

    description:
      "Only people who follow you can watch.",

    icon:
      Users,
  },

  {
    value:
      "private",

    label:
      "Private",

    description:
      "Only you can access this Reel.",

    icon:
      Lock,
  },

];


// =========================================================
// HELPERS
// =========================================================

function formatFileSize(
  bytes
) {

  const size =
    Number(bytes) || 0;


  if (
    size < 1024
  ) {

    return `${size} B`;

  }


  if (
    size <
    1024 * 1024
  ) {

    return `${(
      size /
      1024
    ).toFixed(1)} KB`;

  }


  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(1)} MB`;

}


// =========================================================

function formatDuration(
  value
) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        Number(value) || 0
      )
    );


  const minutes =
    Math.floor(
      totalSeconds /
      60
    );


  const seconds =
    totalSeconds %
    60;


  return `${minutes}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;

}


// =========================================================

function detectAspectRatio(
  width,
  height
) {

  const safeWidth =
    Number(width) || 0;


  const safeHeight =
    Number(height) || 0;


  if (
    !safeWidth ||
    !safeHeight
  ) {

    return "9:16";

  }


  const ratio =
    safeWidth /
    safeHeight;


  if (
    ratio >= 0.52 &&
    ratio <= 0.60
  ) {

    return "9:16";

  }


  if (
    ratio >= 0.95 &&
    ratio <= 1.05
  ) {

    return "1:1";

  }


  if (
    ratio >= 1.70 &&
    ratio <= 1.82
  ) {

    return "16:9";

  }


  if (
    ratio >= 0.72 &&
    ratio <= 0.80
  ) {

    return "3:4";

  }


  return `${safeWidth}:${safeHeight}`;

}


// =========================================================
// CREATE REEL PAGE
// =========================================================

export default function CreateReel() {

  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const previewVideoRef =
    useRef(null);


  // =======================================================
  // FILE STATE
  // =======================================================

  const [
    videoFile,
    setVideoFile,
  ] = useState(null);


  const [
    dragging,
    setDragging,
  ] = useState(false);


  const [
    durationSeconds,
    setDurationSeconds,
  ] = useState(0);


  const [
    aspectRatio,
    setAspectRatio,
  ] = useState(
    "9:16"
  );


  // =======================================================
  // FORM STATE
  // =======================================================

  const [
    caption,
    setCaption,
  ] = useState("");


  const [
    language,
    setLanguage,
  ] = useState(
    "bn"
  );


  const [
    visibility,
    setVisibility,
  ] = useState(
    "public"
  );


  const [
    commentsEnabled,
    setCommentsEnabled,
  ] = useState(
    true
  );


  // =======================================================
  // PUBLISH STATE
  // =======================================================

  const [
    publishing,
    setPublishing,
  ] = useState(false);


  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =======================================================
  // PREVIEW URL
  // =======================================================

  const previewUrl =
    useMemo(
      () => {

        if (
          !videoFile
        ) {

          return "";

        }


        return URL.createObjectURL(
          videoFile
        );

      },
      [
        videoFile,
      ]
    );


  useEffect(
    () => {

      return () => {

        if (
          previewUrl
        ) {

          URL.revokeObjectURL(
            previewUrl
          );

        }

      };

    },
    [
      previewUrl,
    ]
  );


  // =======================================================
  // SET VIDEO
  // =======================================================

  function selectVideo(
    file
  ) {

    setError("");
    setSuccess("");


    try {

      validateReelVideo(
        file
      );


      setVideoFile(
        file
      );


      setDurationSeconds(
        0
      );


      setAspectRatio(
        "9:16"
      );


      setUploadProgress(
        0
      );

    } catch (
      validationError
    ) {

      setVideoFile(
        null
      );


      setError(
        validationError?.message ||
        "Unable to use this video."
      );

    }

  }


  // =======================================================
  // FILE INPUT
  // =======================================================

  function handleFileChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (
      file
    ) {

      selectVideo(
        file
      );

    }


    event.target.value =
      "";

  }


  // =======================================================
  // DRAG / DROP
  // =======================================================

  function handleDragOver(
    event
  ) {

    event.preventDefault();


    if (
      publishing
    ) {

      return;

    }


    setDragging(
      true
    );

  }


  function handleDragLeave(
    event
  ) {

    event.preventDefault();


    setDragging(
      false
    );

  }


  function handleDrop(
    event
  ) {

    event.preventDefault();


    setDragging(
      false
    );


    if (
      publishing
    ) {

      return;

    }


    const file =
      event.dataTransfer
        .files?.[0];


    if (
      file
    ) {

      selectVideo(
        file
      );

    }

  }


  // =======================================================
  // REMOVE VIDEO
  // =======================================================

  function removeVideo() {

    if (
      publishing
    ) {

      return;

    }


    setVideoFile(
      null
    );


    setDurationSeconds(
      0
    );


    setAspectRatio(
      "9:16"
    );


    setUploadProgress(
      0
    );


    setError("");
    setSuccess("");


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  }


  // =======================================================
  // VIDEO METADATA
  // =======================================================

  function handleMetadataLoaded(
    event
  ) {

    const video =
      event.currentTarget;


    const duration =
      Number(
        video.duration
      );


    if (
      Number.isFinite(
        duration
      )
    ) {

      setDurationSeconds(
        duration
      );

    }


    setAspectRatio(

      detectAspectRatio(
        video.videoWidth,
        video.videoHeight
      )

    );

  }


  // =======================================================
  // PUBLISH
  // =======================================================

  async function handlePublish(
    event
  ) {

    event.preventDefault();


    if (
      publishing
    ) {

      return;

    }


    setError("");
    setSuccess("");


    if (
      !videoFile
    ) {

      setError(
        "Choose a video before publishing your Reel."
      );

      return;

    }


    if (
      caption.length >
      MAX_CAPTION_LENGTH
    ) {

      setError(
        `Caption cannot exceed ${MAX_CAPTION_LENGTH} characters.`
      );

      return;

    }


    try {

      setPublishing(
        true
      );


      setUploadProgress(
        0
      );


      const result =
        await publishReel({

          file:
            videoFile,

          caption:
            caption.trim(),

          language,

          visibility,

          commentsEnabled,

          durationSeconds,

          aspectRatio,

          onProgress:
            (
              progress
            ) => {

              setUploadProgress(
                progress
              );

            },

        });


      const reel =
        result?.reel ||
        result?.response?.reel ||
        null;


      setSuccess(
        "Your Reel was published successfully."
      );


      window.dispatchEvent(

        new CustomEvent(
          "shobdo:reel-published",
          {
            detail:
              reel,
          }
        )

      );


      window.setTimeout(
        () => {

          if (
            reel?.id
          ) {

            navigate(
              `/reels/${reel.id}`,
              {
                replace:
                  true,
              }
            );

          } else {

            navigate(
              "/reels",
              {
                replace:
                  true,
              }
            );

          }

        },
        700
      );

    } catch (
      publishError
    ) {

      console.error(
        "REEL PUBLISH ERROR:",
        publishError
      );


      setError(
        publishError?.message ||
        "Unable to publish your Reel."
      );

    } finally {

      setPublishing(
        false
      );

    }

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="create-reel-page"
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <section
        className="create-reel-header"
      >

        <Link
          to="/reels"
          className="create-reel-back"
        >

          <ArrowLeft
            size={18}
          />

          <span>
            Reels
          </span>

        </Link>


        <div
          className="create-reel-heading"
        >

          <div
            className="create-reel-heading-icon"
          >

            <Clapperboard
              size={24}
            />

          </div>


          <div>

            <span
              className="create-reel-eyebrow"
            >
              SHOBDO CREATOR
            </span>


            <h1>
              Create a Reel
            </h1>


            <p>
              Share poetry, storytelling,
              readings and creative moments
              with the SHOBDO community.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          STATUS
      ================================================== */}

      {error && (

        <div
          className="create-reel-message create-reel-message-error"
          role="alert"
        >

          <AlertCircle
            size={19}
          />


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

            <X
              size={17}
            />

          </button>

        </div>

      )}


      {success && (

        <div
          className="create-reel-message create-reel-message-success"
          role="status"
        >

          <CheckCircle2
            size={19}
          />


          <span>
            {success}
          </span>

        </div>

      )}


      {/* =================================================
          FORM
      ================================================== */}

      <form
        className="create-reel-layout"
        onSubmit={
          handlePublish
        }
      >

        {/* ===============================================
            LEFT — VIDEO
        ================================================ */}

        <section
          className="create-reel-video-panel"
        >

          <div
            className="create-reel-section-heading"
          >

            <div>

              <span>
                01
              </span>

              <h2>
                Choose your video
              </h2>

            </div>


            <span
              className="create-reel-format-badge"
            >

              <FileVideo2
                size={15}
              />

              REEL

            </span>

          </div>


          {!videoFile
            ? (

              <div
                className={[
                  "create-reel-dropzone",

                  dragging
                    ? "dragging"
                    : "",

                ]
                  .filter(Boolean)
                  .join(" ")
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
              >

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={
                    handleFileChange
                  }
                  className="create-reel-file-input"
                />


                <div
                  className="create-reel-upload-icon"
                >

                  <Upload
                    size={30}
                  />

                </div>


                <h3>
                  Upload a short video
                </h3>


                <p>
                  Drag your video here or
                  choose one from your device.
                </p>


                <button
                  type="button"
                  className="create-reel-select-button"
                  onClick={
                    () =>
                      fileInputRef
                        .current
                        ?.click()
                  }
                >

                  <Upload
                    size={17}
                  />

                  Choose video

                </button>


                <small>
                  MP4, WEBM, MOV or M4V · Maximum 100 MB
                </small>

              </div>

            )
            : (

              <div
                className="create-reel-preview-shell"
              >

                <div
                  className="create-reel-phone"
                >

                  <video
                    ref={
                      previewVideoRef
                    }
                    src={
                      previewUrl
                    }
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={
                      handleMetadataLoaded
                    }
                  />


                  <div
                    className="create-reel-preview-badge"
                  >

                    <Play
                      size={13}
                      fill="currentColor"
                    />

                    Preview

                  </div>

                </div>


                <div
                  className="create-reel-file-card"
                >

                  <div
                    className="create-reel-file-icon"
                  >

                    <FileVideo2
                      size={22}
                    />

                  </div>


                  <div
                    className="create-reel-file-info"
                  >

                    <strong>
                      {videoFile.name}
                    </strong>


                    <span>

                      {
                        formatFileSize(
                          videoFile.size
                        )
                      }

                      {" · "}

                      {
                        formatDuration(
                          durationSeconds
                        )
                      }

                      {" · "}

                      {
                        aspectRatio
                      }

                    </span>

                  </div>


                  <button
                    type="button"
                    className="create-reel-remove"
                    disabled={
                      publishing
                    }
                    onClick={
                      removeVideo
                    }
                    aria-label="Remove video"
                  >

                    <X
                      size={18}
                    />

                  </button>

                </div>


                <button
                  type="button"
                  className="create-reel-change-video"
                  disabled={
                    publishing
                  }
                  onClick={
                    () =>
                      fileInputRef
                        .current
                        ?.click()
                  }
                >

                  <Upload
                    size={16}
                  />

                  Choose another video

                </button>


                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={
                    handleFileChange
                  }
                  className="create-reel-file-input"
                />

              </div>

            )}

        </section>


        {/* ===============================================
            RIGHT — SETTINGS
        ================================================ */}

        <section
          className="create-reel-settings-panel"
        >

          <div
            className="create-reel-section-heading"
          >

            <div>

              <span>
                02
              </span>

              <h2>
                Reel details
              </h2>

            </div>


            <Sparkles
              size={20}
              className="create-reel-heading-sparkle"
            />

          </div>


          {/* =============================================
              CAPTION
          ============================================== */}

          <div
            className="create-reel-field"
          >

            <div
              className="create-reel-label-row"
            >

              <label
                htmlFor="reel-caption"
              >
                Caption
              </label>


              <span>

                {caption.length}

                /

                {
                  MAX_CAPTION_LENGTH
                }

              </span>

            </div>


            <textarea
              id="reel-caption"
              value={
                caption
              }
              onChange={
                (
                  event
                ) => {

                  setCaption(
                    event.target.value
                  );

                }
              }
              maxLength={
                MAX_CAPTION_LENGTH
              }
              placeholder="Tell the story behind this Reel..."
              disabled={
                publishing
              }
              rows={6}
            />

          </div>


          {/* =============================================
              LANGUAGE
          ============================================== */}

          <div
            className="create-reel-field"
          >

            <label
              htmlFor="reel-language"
            >
              Language
            </label>


            <div
              className="create-reel-select-wrap"
            >

              <Globe2
                size={17}
              />


              <select
                id="reel-language"
                value={
                  language
                }
                disabled={
                  publishing
                }
                onChange={
                  (
                    event
                  ) =>
                    setLanguage(
                      event.target.value
                    )
                }
              >

                {REEL_LANGUAGES.map(
                  (
                    item
                  ) => (

                    <option
                      key={
                        item.code
                      }
                      value={
                        item.code
                      }
                    >

                      {
                        item.nativeName
                      }

                      {
                        item.name !==
                        item.nativeName
                          ? ` — ${item.name}`
                          : ""
                      }

                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* =============================================
              VISIBILITY
          ============================================== */}

          <fieldset
            className="create-reel-visibility"
          >

            <legend>
              Who can watch?
            </legend>


            <div
              className="create-reel-visibility-options"
            >

              {VISIBILITY_OPTIONS.map(
                (
                  option
                ) => {

                  const Icon =
                    option.icon;


                  const selected =
                    visibility ===
                    option.value;


                  return (

                    <label
                      key={
                        option.value
                      }
                      className={[
                        "create-reel-visibility-option",

                        selected
                          ? "selected"
                          : "",

                      ]
                        .filter(Boolean)
                        .join(" ")
                      }
                    >

                      <input
                        type="radio"
                        name="reel-visibility"
                        value={
                          option.value
                        }
                        checked={
                          selected
                        }
                        disabled={
                          publishing
                        }
                        onChange={
                          () =>
                            setVisibility(
                              option.value
                            )
                        }
                      />


                      <span
                        className="create-reel-visibility-icon"
                      >

                        <Icon
                          size={18}
                        />

                      </span>


                      <span
                        className="create-reel-visibility-copy"
                      >

                        <strong>
                          {option.label}
                        </strong>


                        <small>
                          {
                            option.description
                          }
                        </small>

                      </span>


                      <span
                        className="create-reel-radio-indicator"
                      />

                    </label>

                  );

                }
              )}

            </div>

          </fieldset>


          {/* =============================================
              COMMENTS
          ============================================== */}

          <div
            className="create-reel-comments-setting"
          >

            <div
              className="create-reel-comments-copy"
            >

              <span
                className="create-reel-comments-icon"
              >

                <MessageCircle
                  size={19}
                />

              </span>


              <div>

                <strong>
                  Allow comments
                </strong>


                <small>
                  Let viewers respond to this Reel.
                </small>

              </div>

            </div>


            <label
              className="create-reel-switch"
            >

              <input
                type="checkbox"
                checked={
                  commentsEnabled
                }
                disabled={
                  publishing
                }
                onChange={
                  (
                    event
                  ) =>
                    setCommentsEnabled(
                      event.target.checked
                    )
                }
              />


              <span />

            </label>

          </div>


          {/* =============================================
              UPLOAD PROGRESS
          ============================================== */}

          {publishing && (

            <div
              className="create-reel-progress-card"
            >

              <div
                className="create-reel-progress-heading"
              >

                <div>

                  <LoaderCircle
                    size={17}
                    className="create-reel-spin"
                  />


                  <span>
                    Uploading your Reel
                  </span>

                </div>


                <strong>
                  {uploadProgress}%
                </strong>

              </div>


              <div
                className="create-reel-progress-track"
              >

                <div
                  className="create-reel-progress-value"
                  style={{
                    width:
                      `${uploadProgress}%`,
                  }}
                />

              </div>


              <small>

                Keep this page open while
                your video is being uploaded.

              </small>

            </div>

          )}


          {/* =============================================
              PUBLISH
          ============================================== */}

          <div
            className="create-reel-publish-area"
          >

            <div
              className="create-reel-publish-info"
            >

              <Eye
                size={17}
              />


              <span>

                {
                  visibility ===
                  "public"
                    ? "Your Reel will appear in the public Reels feed."
                    : visibility ===
                      "followers"
                      ? "This Reel will be limited to your followers."
                      : "This Reel will remain private."
                }

              </span>

            </div>


            <button
              type="submit"
              className="create-reel-publish-button"
              disabled={
                publishing ||
                !videoFile
              }
            >

              {publishing
                ? (

                  <>

                    <LoaderCircle
                      size={19}
                      className="create-reel-spin"
                    />

                    Publishing...

                  </>

                )
                : (

                  <>

                    <Send
                      size={18}
                    />

                    Publish Reel

                  </>

                )}

            </button>

          </div>

        </section>

      </form>

    </main>

  );

}