import {
  CalendarDays,
  Download,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  UserRound,
} from "lucide-react";

import "./ArtworkCard.css";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
  value
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


  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(
  bytes
) {

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
// ARTWORK CARD
// =========================================================

function ArtworkCard({
  artwork,
}) {

  if (!artwork) {
    return null;
  }


  const imageUrl =
    artwork.image_url ||
    artwork.file_url ||
    artwork.url ||
    "";


  const authorName =
    artwork.author?.name ||
    artwork.author?.username ||
    artwork.user?.name ||
    artwork.artist?.name ||
    "SHOBDO Artist";


  const dateLabel =
    formatDate(
      artwork.published_at ||
      artwork.created_at
    );


  const description =
    (
      artwork.description ||
      ""
    ).trim();


  const sizeLabel =
    formatFileSize(
      artwork.file_size
    );


  return (

    <article
      className="artwork-card"
    >

      {/* =============================================== */}
      {/* IMAGE                                           */}
      {/* =============================================== */}

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
      >

        {imageUrl
          ? (

              <img
                src={
                  imageUrl
                }
                alt={
                  artwork.title ||
                  "Artwork"
                }
                loading="lazy"
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
                  ARTWORK
                </span>

              </div>

            )}


        <span
          className="artwork-card-badge"
        >
          ART
        </span>

      </a>


      {/* =============================================== */}
      {/* BODY                                            */}
      {/* =============================================== */}

      <div
        className="artwork-card-body"
      >

        <div
          className="artwork-card-meta"
        >

          <span
            className="artwork-card-category"
          >

            {
              artwork.category ||
              "Artwork"
            }

          </span>


          {artwork.language && (

            <span
              className="artwork-card-language"
            >

              <Globe2
                size={13}
              />

              {
                artwork.language
                  .toUpperCase()
              }

            </span>

          )}

        </div>


        <h3
          className="artwork-card-title"
        >

          {
            artwork.title ||
            "Untitled Artwork"
          }

        </h3>


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


        <div
          className="artwork-card-info"
        >

          {sizeLabel && (

            <span>
              {sizeLabel}
            </span>

          )}


          {dateLabel && (

            <span>

              <CalendarDays
                size={13}
              />

              {dateLabel}

            </span>

          )}

        </div>


        {/* ============================================= */}
        {/* ACTIONS                                       */}
        {/* ============================================= */}

        {imageUrl && (

          <div
            className="artwork-card-actions"
          >

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

              View Artwork

            </a>


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

                Download

              </a>

            )}

          </div>

        )}

      </div>

    </article>
  );
}


export default ArtworkCard;