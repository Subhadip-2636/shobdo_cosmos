import {
  CalendarDays,
  Download,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  UserRound,
} from "lucide-react";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./ArtworkCard.css";


// =========================================================
// FORMAT FILE SIZE
// =========================================================

function formatFileSize(bytes) {

  const value =
    Number(bytes);


  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    return "";
  }


  if (
    value >=
    1024 * 1024
  ) {

    return `${
      (
        value /
        (
          1024 *
          1024
        )
      ).toFixed(2)
    } MB`;
  }


  return `${
    (
      value /
      1024
    ).toFixed(1)
  } KB`;
}


// =========================================================
// UI LOCALE
// =========================================================

function getLocale(
  uiLanguage
) {

  switch (
    uiLanguage
  ) {

    case "bn":

      return "bn-BD";


    case "hi":

      return "hi-IN";


    default:

      return "en-US";
  }
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
  value,
  uiLanguage
) {

  if (!value) {

    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  try {

    return new Intl
      .DateTimeFormat(
        getLocale(
          uiLanguage
        ),
        {
          day:
            "numeric",

          month:
            "short",

          year:
            "numeric",
        }
      )
      .format(
        date
      );


  } catch {

    return date
      .toLocaleDateString();
  }
}


// =========================================================
// CONTENT LANGUAGE LABELS
// =========================================================

const CONTENT_LANGUAGE_LABELS = {

  // =======================================================
  // BENGALI UI
  // =======================================================

  bn: {

    bn:
      "বাংলা",

    en:
      "ইংরেজি",

    hi:
      "হিন্দি",

    as:
      "অসমীয়া",

    or:
      "ওড়িয়া",

    ta:
      "তামিল",

    te:
      "তেলুগু",
  },


  // =======================================================
  // ENGLISH UI
  // =======================================================

  en: {

    bn:
      "Bengali",

    en:
      "English",

    hi:
      "Hindi",

    as:
      "Assamese",

    or:
      "Odia",

    ta:
      "Tamil",

    te:
      "Telugu",
  },


  // =======================================================
  // HINDI UI
  // =======================================================

  hi: {

    bn:
      "बंगाली",

    en:
      "अंग्रेज़ी",

    hi:
      "हिन्दी",

    as:
      "असमिया",

    or:
      "ओड़िया",

    ta:
      "तमिल",

    te:
      "तेलुगु",
  },
};


// =========================================================
// ART BADGE LABELS
// =========================================================

const ART_BADGE_LABELS = {

  bn:
    "শিল্প",

  en:
    "ART",

  hi:
    "कला",
};


// =========================================================
// ARTWORK CARD
// =========================================================

function ArtworkCard({
  artwork,
}) {

  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  if (!artwork) {

    return null;
  }


  // =======================================================
  // IMAGE URL
  // =======================================================

  const imageUrl =
    artwork.image_url ||
    artwork.file_url ||
    artwork.url ||
    "";


  // =======================================================
  // AUTHOR
  // =======================================================

  const authorName =
    artwork.author?.name ||
    artwork.author?.username ||
    artwork.user?.name ||
    artwork.user?.username ||
    artwork.artist?.name ||
    artwork.artist?.username ||
    t(
      "explore.unknownArtist",
      "SHOBDO Artist"
    );


  // =======================================================
  // DESCRIPTION
  // =======================================================

  const description =
    String(
      artwork.description ||
      ""
    ).trim();


  // =======================================================
  // DATE
  // =======================================================

  const dateLabel =
    formatDate(
      artwork.published_at ||
      artwork.created_at,
      uiLanguage
    );


  // =======================================================
  // FILE SIZE
  // =======================================================

  const fileSizeLabel =
    formatFileSize(
      artwork.file_size ||
      artwork.bytes
    );


  // =======================================================
  // CATEGORY TRANSLATION
  // =======================================================

  function getCategoryLabel(
    category
  ) {

    const value =
      String(
        category ||
        ""
      ).trim();


    const categoryMap = {

      "Digital Art":
        t(
          "explore.digitalArt",
          "Digital Art"
        ),

      "Painting":
        t(
          "explore.painting",
          "Painting"
        ),

      "Sketch":
        t(
          "explore.sketch",
          "Sketch"
        ),

      "Illustration":
        t(
          "explore.illustration",
          "Illustration"
        ),

      "Photography":
        t(
          "explore.photography",
          "Photography"
        ),

      "Calligraphy":
        t(
          "explore.calligraphy",
          "Calligraphy"
        ),

      "Other":
        t(
          "explore.otherArtwork",
          "Other"
        ),
    };


    return (
      categoryMap[value] ||
      value ||
      t(
        "explore.otherArtwork",
        "Other"
      )
    );
  }


  // =======================================================
  // CONTENT LANGUAGE TRANSLATION
  // =======================================================

  function getArtworkLanguageLabel(
    languageCode
  ) {

    const code =
      String(
        languageCode ||
        ""
      )
        .trim()
        .toLowerCase();


    if (!code) {

      return "";
    }


    const uiMap =
      CONTENT_LANGUAGE_LABELS[
        uiLanguage
      ] ||
      CONTENT_LANGUAGE_LABELS.en;


    return (
      uiMap[code] ||
      code.toUpperCase()
    );
  }


  // =======================================================
  // TRANSLATED VALUES
  // =======================================================

  const categoryLabel =
    getCategoryLabel(
      artwork.category
    );


  const languageLabel =
    getArtworkLanguageLabel(
      artwork.language
    );


  const artBadgeLabel =
    ART_BADGE_LABELS[
      uiLanguage
    ] ||
    ART_BADGE_LABELS.en;


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      className="artwork-card"
    >

      {/* =================================================
          ARTWORK IMAGE
      ================================================== */}

      <a
        className="artwork-card-image"
        href={
          imageUrl ||
          "#"
        }
        target={
          imageUrl
            ? "_blank"
            : undefined
        }
        rel={
          imageUrl
            ? "noopener noreferrer"
            : undefined
        }
        onClick={(
          event
        ) => {

          if (!imageUrl) {

            event.preventDefault();
          }

        }}
        aria-label={
          artwork.title ||
          t(
            "explore.untitledArtwork",
            "Untitled Artwork"
          )
        }
      >

        {imageUrl
          ? (

            <img
              src={
                imageUrl
              }
              alt={
                artwork.title ||
                t(
                  "explore.untitledArtwork",
                  "Untitled Artwork"
                )
              }
              loading="lazy"
                  decoding="async"
            />

          )
          : (

            <div
              className="artwork-card-image-fallback"
            >

              <ImageIcon
                size={52}
              />


              <span>

                {t(
                  "explore.artworkLabel",
                  "Artwork"
                )}

              </span>

            </div>

          )}


        {/* ===============================================
            ART BADGE
        ================================================ */}

        <span
          className="artwork-card-badge"
        >

          {artBadgeLabel}

        </span>

      </a>


      {/* =================================================
          CARD BODY
      ================================================== */}

      <div
        className="artwork-card-body"
      >

        {/* ===============================================
            CATEGORY + LANGUAGE
        ================================================ */}

        <div
          className="artwork-card-meta"
        >

          <span
            className="artwork-card-category"
          >

            {categoryLabel}

          </span>


          {languageLabel && (

            <span
              className="artwork-card-language"
            >

              <Globe2
                size={13}
              />


              <span>
                {languageLabel}
              </span>

            </span>

          )}

        </div>


        {/* ===============================================
            ARTWORK TITLE
        ================================================ */}

        <h3
          className="artwork-card-title"
        >

          {
            artwork.title ||
            t(
              "explore.untitledArtwork",
              "Untitled Artwork"
            )
          }

        </h3>


        {/* ===============================================
            DESCRIPTION
        ================================================ */}

        {description && (

          <p
            className="artwork-card-description"
          >

            {
              description.length >
              160
                ? `${
                    description.slice(
                      0,
                      160
                    )
                  }…`
                : description
            }

          </p>

        )}


        {/* ===============================================
            AUTHOR
        ================================================ */}

        <div
          className="artwork-card-author"
        >

          <UserRound
            size={15}
          />


          <span>
            {authorName}
          </span>

        </div>


        {/* ===============================================
            ARTWORK INFORMATION
        ================================================ */}

        <div
          className="artwork-card-info"
        >

          {fileSizeLabel && (

            <span>
              {fileSizeLabel}
            </span>

          )}


          {dateLabel && (

            <span>

              <CalendarDays
                size={13}
              />


              <span>
                {dateLabel}
              </span>

            </span>

          )}

        </div>


        {/* ===============================================
            ACTION BUTTONS
        ================================================ */}

        {imageUrl && (

          <div
            className="artwork-card-actions"
          >

            {/* VIEW ARTWORK */}

            <a
              className="artwork-card-view"
              href={
                imageUrl
              }
              target="_blank"
              rel="noopener noreferrer"
            >

              <ExternalLink
                size={16}
              />


              <span>

                {t(
                  "explore.viewArtwork",
                  "View Artwork"
                )}

              </span>

            </a>


            {/* DOWNLOAD */}

            {artwork.allow_download && (

              <a
                className="artwork-card-download"
                href={
                  imageUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                download={
                  artwork.original_filename ||
                  undefined
                }
              >

                <Download
                  size={16}
                />


                <span>

                  {t(
                    "explore.download",
                    "Download"
                  )}

                </span>

              </a>

            )}

          </div>

        )}

      </div>

    </article>
  );
}


export default ArtworkCard;