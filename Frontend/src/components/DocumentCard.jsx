import {
  useState,
} from "react";

import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  UserRound,
} from "lucide-react";

import "./DocumentCard.css";


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

    return "PDF";
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
// DATE
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
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    }
  );
}


// =========================================================
// DOCUMENT CARD
// =========================================================

function DocumentCard({
  document,
}) {

  const [
    previewFailed,
    setPreviewFailed,
  ] = useState(false);


  if (!document) {
    return null;
  }


  const authorName =
    document.author?.name ||
    document.author?.username ||
    "SHOBDO Writer";


  const date =
    formatDate(
      document.published_at ||
      document.created_at
    );


  const description =
    (
      document.description ||
      ""
    ).trim();


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      className="document-card"
    >

      {/* =================================================
          PREVIEW
      ================================================== */}

      <a
        className="document-card-preview"
        href={
          document.file_url
        }
        target="_blank"
        rel="noopener noreferrer"
      >

        {
          document.thumbnail_url &&
          !previewFailed
            ? (

                <img
                  src={
                    document.thumbnail_url
                  }
                  alt={
                    document.title ||
                    "PDF preview"
                  }
                  loading="lazy"
                  onError={() =>
                    setPreviewFailed(
                      true
                    )
                  }
                />

              )
            : (

                <div
                  className="document-card-preview-fallback"
                >

                  <FileText
                    size={52}
                  />

                  <span>
                    PDF
                  </span>

                </div>

              )
        }


        <span
          className="document-card-pdf-badge"
        >
          PDF
        </span>

      </a>


      {/* =================================================
          BODY
      ================================================== */}

      <div
        className="document-card-body"
      >

        {/* CATEGORY + LANGUAGE */}

        <div
          className="document-card-meta"
        >

          <span
            className="document-card-category"
          >

            {
              document.category ||
              "অন্যান্য"
            }

          </span>


          {document.language && (

            <span
              className="document-card-language"
            >

              <Globe2
                size={13}
              />

              {
                document.language
                  .toUpperCase()
              }

            </span>

          )}

        </div>


        {/* TITLE */}

        <h3
          className="document-card-title"
        >

          {
            document.title ||
            "Untitled PDF"
          }

        </h3>


        {/* DESCRIPTION */}

        {description && (

          <p
            className="document-card-description"
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


        {/* AUTHOR */}

        <div
          className="document-card-author"
        >

          <UserRound
            size={15}
          />

          <span>
            {authorName}
          </span>

        </div>


        {/* DOCUMENT DETAILS */}

        <div
          className="document-card-info"
        >

          <span>

            {
              Number(
                document.page_count
              ) || 0
            }

            {" pages"}

          </span>


          <span>

            {
              formatFileSize(
                document.file_size
              )
            }

          </span>


          {date && (

            <span>

              <CalendarDays
                size={13}
              />

              {date}

            </span>

          )}

        </div>


        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="document-card-actions"
        >

          <a
            className="document-card-view"
            href={
              document.file_url
            }
            target="_blank"
            rel="noopener noreferrer"
          >

            <ExternalLink
              size={16}
            />

            View PDF

          </a>


          {document.allow_download && (

            <a
              className="document-card-download"
              href={
                document.file_url
              }
              target="_blank"
              rel="noopener noreferrer"
              download={
                document.original_filename ||
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

      </div>

    </article>
  );
}


export default DocumentCard;