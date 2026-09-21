import {
  usePageBackground,
} from "../context/PageBackgroundContext";

import "./PageBackground.css";


export default function PageBackground() {

  const {
    currentBackground,
    currentSettings,
  } =
    usePageBackground();


  // =========================================================
  // SETTINGS
  // =========================================================

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


  // =========================================================
  // READABILITY OVERLAY
  // =========================================================

  const overlayOpacity =
    (
      currentBackground.type === "image" ||
      currentBackground.type === "video"
    )
      ? Math.max(
          0,
          Math.min(
            0.82,
            (100 - visibility) /
              100
          )
        )
      : 0;


  // =========================================================
  // FILTER
  // =========================================================

  const mediaFilter =
    `brightness(${brightness}%) blur(${blur}px)`;


  // =========================================================
  // TYPE
  // =========================================================

  const backgroundClassName =
    currentBackground.type === "video"
      ? "is-video"
      : currentBackground.type === "image"
        ? "is-image"
        : currentBackground.type === "solid"
          ? "is-solid"
          : "is-gradient";


  // =========================================================
  // STATIC BASE STYLE
  // =========================================================

  const containerStyle =
    currentBackground.type === "gradient" ||
    currentBackground.type === "solid"
      ? {
          background:
            currentBackground.value,
        }
      : undefined;


  // =========================================================
  // STATIC IMAGE STYLE
  // =========================================================

  const imageStyle =
    currentBackground.type === "image"
      ? {
          backgroundImage:
            `url("${currentBackground.value}")`,

          filter:
            mediaFilter,
        }
      : undefined;


  // =========================================================
  // REDUCED MOTION
  // =========================================================

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia
      ? window
          .matchMedia(
            "(prefers-reduced-motion: reduce)"
          )
          .matches
      : false;


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className={
        `shobdo-page-background ${backgroundClassName}`
      }
      style={
        containerStyle
      }
      aria-hidden="true"
    >

      {/* ===================================================
          STATIC IMAGE
      ==================================================== */}

      {
        currentBackground.type === "image" && (

          <div
            className="shobdo-page-background-media shobdo-page-background-image"
            style={
              imageStyle
            }
          />

        )
      }


      {/* ===================================================
          ANIMATED VIDEO
      ==================================================== */}

      {
        currentBackground.type === "video" && (

          <video
            className="shobdo-page-background-media shobdo-page-background-video"
            src={
              currentBackground.value
            }
            autoPlay={
              !prefersReducedMotion
            }
            loop={
              !prefersReducedMotion
            }
            muted
            playsInline
            preload="metadata"
            style={{
              filter:
                mediaFilter,
            }}
          />

        )
      }


      {/* ===================================================
          READABILITY OVERLAY
      ==================================================== */}

      <div
        className="shobdo-page-background-overlay"
        style={{
          opacity:
            overlayOpacity,
        }}
      />

    </div>

  );

}