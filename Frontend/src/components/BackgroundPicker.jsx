import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  Eye,
  Image,
  ImagePlus,
  RotateCcw,
  SlidersHorizontal,
  SunMedium,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";

import {
  usePageBackground,
} from "../context/PageBackgroundContext";

import "./BackgroundPicker.css";


// =========================================================
// CUSTOM IMAGE SETTINGS
// =========================================================

const MAX_UPLOAD_SIZE =
  8 * 1024 * 1024;

const MAX_IMAGE_WIDTH =
  1920;

const MAX_IMAGE_HEIGHT =
  1080;

const OUTPUT_QUALITY =
  0.82;


// =========================================================
// COMPRESS IMAGE
// =========================================================

function compressImage(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();


      reader.onload =
        () => {

          const image =
            new window.Image();


          image.onload =
            () => {

              let width =
                image.width;

              let height =
                image.height;


              // =============================================
              // SCALE IMAGE
              // =============================================

              const widthRatio =
                MAX_IMAGE_WIDTH /
                width;

              const heightRatio =
                MAX_IMAGE_HEIGHT /
                height;


              const ratio =
                Math.min(
                  1,
                  widthRatio,
                  heightRatio
                );


              width =
                Math.round(
                  width * ratio
                );

              height =
                Math.round(
                  height * ratio
                );


              // =============================================
              // CANVAS
              // =============================================

              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;

              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              if (!context) {

                reject(
                  new Error(
                    "Unable to process image."
                  )
                );

                return;

              }


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              // =============================================
              // CONVERT TO WEBP
              // =============================================

              const compressed =
                canvas.toDataURL(
                  "image/webp",
                  OUTPUT_QUALITY
                );


              resolve(
                compressed
              );

            };


          image.onerror =
            () => {

              reject(
                new Error(
                  "Invalid image file."
                )
              );

            };


          image.src =
            reader.result;

        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Unable to read image."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// =========================================================
// COMPONENT
// =========================================================

export default function BackgroundPicker() {

  // =======================================================
  // MODAL STATE
  // =======================================================

  const [
    open,
    setOpen,
  ] =
    useState(false);


  // =======================================================
  // UPLOAD STATE
  // =======================================================

  const [
    uploadError,
    setUploadError,
  ] =
    useState("");


  const [
    uploading,
    setUploading,
  ] =
    useState(false);


  // =======================================================
  // FILE INPUT
  // =======================================================

  const fileInputRef =
    useRef(null);


  // =======================================================
  // BACKGROUND CONTEXT
  // =======================================================

  const {
    backgrounds,
    selectedId,
    pageKey,
    currentBackground,
    currentSettings,
    currentCustomBackground,

    setBackground,
    setCustomBackground,
    removeCustomBackground,

    setBrightness,
    setBlur,
    setVisibility,

    resetBackground,
    applyBackgroundToAll,
  } =
    usePageBackground();


  // =======================================================
  // CLOSE WITH ESC
  // =======================================================

  useEffect(
    () => {

      function handleKeyDown(
        event
      ) {

        if (
          event.key ===
          "Escape"
        ) {

          setOpen(
            false
          );

        }

      }


      window.addEventListener(
        "keydown",
        handleKeyDown
      );


      return () => {

        window.removeEventListener(
          "keydown",
          handleKeyDown
        );

      };

    },
    []
  );


  // =======================================================
  // PAGE NAME
  // =======================================================

  const pageName =
    pageKey
      ? pageKey
          .charAt(0)
          .toUpperCase() +
        pageKey.slice(1)
      : "Page";


  // =======================================================
  // IMAGE CONTROL VISIBILITY
  // =======================================================

  const showImageControls =
    currentBackground?.type ===
    "image";


  // =======================================================
  // CURRENT VALUES
  // =======================================================

  const brightness =
    Number(
      currentSettings?.brightness ??
      100
    );


  const blur =
    Number(
      currentSettings?.blur ??
      0
    );


  const visibility =
    Number(
      currentSettings?.visibility ??
      55
    );


  // =======================================================
  // OPEN FILE PICKER
  // =======================================================

  function handleUploadClick() {

    setUploadError(
      ""
    );


    fileInputRef
      .current
      ?.click();

  }


  // =======================================================
  // HANDLE CUSTOM IMAGE
  // =======================================================

  async function handleImageUpload(
    event
  ) {

    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    setUploadError(
      ""
    );


    // =====================================================
    // VALIDATE FILE TYPE
    // =====================================================

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setUploadError(
        "Please select a valid image file."
      );


      event.target.value =
        "";


      return;

    }


    // =====================================================
    // VALIDATE FILE SIZE
    // =====================================================

    if (
      file.size >
      MAX_UPLOAD_SIZE
    ) {

      setUploadError(
        "Image is too large. Maximum upload size is 8 MB."
      );


      event.target.value =
        "";


      return;

    }


    try {

      setUploading(
        true
      );


      const compressedImage =
        await compressImage(
          file
        );


      setCustomBackground(
        compressedImage
      );


    } catch (
      error
    ) {

      console.error(
        "CUSTOM BACKGROUND ERROR:",
        error
      );


      setUploadError(
        "Could not process this image. Please try another image."
      );


    } finally {

      setUploading(
        false
      );


      event.target.value =
        "";

    }

  }


  // =======================================================
  // REMOVE CUSTOM IMAGE
  // =======================================================

  function handleRemoveCustom() {

    removeCustomBackground();


    setUploadError(
      ""
    );

  }


  // =======================================================
  // RESET CURRENT PAGE
  // =======================================================

  function handleReset() {

    resetBackground();


    setUploadError(
      ""
    );

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <>

      {/* =================================================
          FLOATING TRIGGER
      ================================================= */}

      <button
        type="button"
        className="background-picker-trigger"
        onClick={() =>
          setOpen(
            true
          )
        }
        aria-label="Change page background"
        title="Change background"
      >

        <Image
          size={19}
          strokeWidth={1.8}
        />

      </button>


      {/* =================================================
          MODAL
      ================================================= */}

      {
        open && (

          <div
            className="background-picker-backdrop"
            onMouseDown={() =>
              setOpen(
                false
              )
            }
          >

            <div
              className="background-picker-panel"
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
              role="dialog"
              aria-modal="true"
              aria-label="Page background settings"
            >

              {/* =========================================
                  HEADER
              ========================================= */}

              <div className="background-picker-header">

                <div>

                  <span className="background-picker-eyebrow">

                    SHOBDO APPEARANCE

                  </span>


                  <h2>

                    Page background

                  </h2>


                  <p>

                    Choose a background for{" "}

                    <strong>
                      {pageName}
                    </strong>

                  </p>

                </div>


                <button
                  type="button"
                  className="background-picker-close"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  aria-label="Close background picker"
                >

                  <X
                    size={19}
                  />

                </button>

              </div>


              {/* =========================================
                  CUSTOM BACKGROUND UPLOAD
              ========================================= */}

              <div className="background-upload-section">

                <div className="background-upload-info">

                  <div className="background-upload-icon">

                    <ImagePlus
                      size={20}
                    />

                  </div>


                  <div>

                    <h3>

                      Custom background

                    </h3>


                    <p>

                      Upload your own image for this page.

                    </p>

                  </div>

                </div>


                {/* =======================================
                    HIDDEN FILE INPUT
                ======================================== */}

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="background-file-input"
                  onChange={
                    handleImageUpload
                  }
                />


                {/* =======================================
                    UPLOAD ACTIONS
                ======================================== */}

                <div className="background-upload-actions">

                  <button
                    type="button"
                    className="background-upload-button"
                    onClick={
                      handleUploadClick
                    }
                    disabled={
                      uploading
                    }
                  >

                    <Upload
                      size={16}
                    />


                    {
                      uploading
                        ? "Processing..."
                        : currentCustomBackground
                          ? "Replace image"
                          : "Upload image"
                    }

                  </button>


                  {
                    currentCustomBackground && (

                      <button
                        type="button"
                        className="background-remove-button"
                        onClick={
                          handleRemoveCustom
                        }
                      >

                        <Trash2
                          size={16}
                        />

                        Remove

                      </button>

                    )
                  }

                </div>


                <p className="background-upload-hint">

                  JPG, PNG, WebP or AVIF · up to 8 MB · automatically optimized

                </p>


                {
                  uploadError && (

                    <div
                      className="background-upload-error"
                      role="alert"
                    >

                      {
                        uploadError
                      }

                    </div>

                  )
                }

              </div>


              {/* =========================================
                  BACKGROUND OPTIONS
              ========================================= */}

              <div className="background-picker-grid">

                {
                  backgrounds.map(
                    (
                      background
                    ) => {

                      const selected =
                        background.id ===
                        selectedId;


                      const previewStyle =
                        background.type ===
                        "image"
                          ? {
                              backgroundImage:
                                `url("${background.value}")`,
                            }
                          : {
                              background:
                                background.value,
                            };


                      return (

                        <button
                          type="button"
                          key={
                            background.id
                          }
                          className={
                            `background-option ${
                              selected
                                ? "selected"
                                : ""
                            }`
                          }
                          onClick={() =>
                            setBackground(
                              background.id
                            )
                          }
                          aria-pressed={
                            selected
                          }
                        >

                          <span
                            className="background-option-preview"
                            style={
                              previewStyle
                            }
                          >

                            {
                              selected && (

                                <span className="background-option-check">

                                  <Check
                                    size={15}
                                    strokeWidth={2.5}
                                  />

                                </span>

                              )
                            }

                          </span>


                          <span className="background-option-name">

                            {
                              background.name
                            }

                          </span>

                        </button>

                      );

                    }
                  )
                }

              </div>


              {/* =========================================
                  IMAGE ADJUSTMENTS
              ========================================= */}

              {
                showImageControls && (

                  <div className="background-controls">

                    {/* ===================================
                        CONTROLS HEADER
                    ==================================== */}

                    <div className="background-controls-heading">

                      <div className="background-controls-title">

                        <SlidersHorizontal
                          size={17}
                        />

                        <span>

                          Image adjustments

                        </span>

                      </div>


                      <span className="background-controls-note">

                        Current page

                      </span>

                    </div>


                    {/* ===================================
                        BRIGHTNESS
                    ==================================== */}

                    <div className="background-control-row">

                      <div className="background-control-label">

                        <div className="background-control-label-main">

                          <SunMedium
                            size={17}
                          />

                          <span>

                            Brightness

                          </span>

                        </div>


                        <strong>

                          {brightness}%

                        </strong>

                      </div>


                      <input
                        type="range"
                        className="background-range"
                        min="40"
                        max="140"
                        step="1"
                        value={
                          brightness
                        }
                        onChange={(
                          event
                        ) =>
                          setBrightness(
                            event.target.value
                          )
                        }
                        aria-label="Background brightness"
                      />


                      <div className="background-range-scale">

                        <span>
                          Darker
                        </span>

                        <span>
                          Normal
                        </span>

                        <span>
                          Brighter
                        </span>

                      </div>

                    </div>


                    {/* ===================================
                        BLUR
                    ==================================== */}

                    <div className="background-control-row">

                      <div className="background-control-label">

                        <div className="background-control-label-main">

                          <SlidersHorizontal
                            size={17}
                          />

                          <span>

                            Blur

                          </span>

                        </div>


                        <strong>

                          {blur} px

                        </strong>

                      </div>


                      <input
                        type="range"
                        className="background-range"
                        min="0"
                        max="12"
                        step="0.5"
                        value={
                          blur
                        }
                        onChange={(
                          event
                        ) =>
                          setBlur(
                            event.target.value
                          )
                        }
                        aria-label="Background blur"
                      />


                      <div className="background-range-scale">

                        <span>
                          Sharp
                        </span>

                        <span>
                          Soft
                        </span>

                        <span>
                          Blurred
                        </span>

                      </div>

                    </div>


                    {/* ===================================
                        BACKGROUND VISIBILITY
                    ==================================== */}

                    <div className="background-control-row">

                      <div className="background-control-label">

                        <div className="background-control-label-main">

                          <Eye
                            size={17}
                          />

                          <span>

                            Background visibility

                          </span>

                        </div>


                        <strong>

                          {visibility}%

                        </strong>

                      </div>


                      <input
                        type="range"
                        className="background-range"
                        min="20"
                        max="100"
                        step="1"
                        value={
                          visibility
                        }
                        onChange={(
                          event
                        ) =>
                          setVisibility(
                            event.target.value
                          )
                        }
                        aria-label="Background visibility"
                      />


                      <div className="background-range-scale">

                        <span>
                          Subtle
                        </span>

                        <span>
                          Balanced
                        </span>

                        <span>
                          Clear
                        </span>

                      </div>

                    </div>

                  </div>

                )
              }


              {/* =========================================
                  FOOTER
              ========================================= */}

              <div className="background-picker-footer">

                <button
                  type="button"
                  className="background-reset-button"
                  onClick={
                    handleReset
                  }
                >

                  <RotateCcw
                    size={16}
                  />

                  Reset

                </button>


                <button
                  type="button"
                  className="background-apply-all-button"
                  onClick={() =>
                    applyBackgroundToAll(
                      selectedId
                    )
                  }
                >

                  Apply to all pages

                </button>

              </div>

            </div>

          </div>

        )
      }

    </>

  );

}