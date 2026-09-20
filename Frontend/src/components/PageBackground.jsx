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
  // VISIBILITY
  // =========================================================
  //
  // Higher visibility:
  //   weaker white overlay
  //   wallpaper becomes clearer
  //
  // Lower visibility:
  //   stronger white overlay
  //   cleaner / softer feed
  //
  // =========================================================

  const visibility =
    Number(
      currentSettings?.visibility ??
      55
    );


  const overlayOpacity =
    currentBackground.type === "image"
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
  // BACKGROUND STYLE
  // =========================================================

  const backgroundStyle =
    currentBackground.type === "image"
      ? {
          backgroundImage:
            `url("${currentBackground.value}")`,

          filter:
            `brightness(${currentSettings.brightness}%) blur(${currentSettings.blur}px)`,
        }
      : {
          background:
            currentBackground.value,

          filter:
            "none",
        };


  // =========================================================
  // BACKGROUND TYPE
  // =========================================================

  const backgroundClassName =
    currentBackground.type === "image"
      ? "is-image"
      : currentBackground.type === "solid"
        ? "is-solid"
        : "is-gradient";


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className={
        `shobdo-page-background ${backgroundClassName}`
      }
      style={
        backgroundStyle
      }
      aria-hidden="true"
    >

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