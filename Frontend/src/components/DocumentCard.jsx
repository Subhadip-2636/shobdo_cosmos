import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  UserRound,
} from "lucide-react";

import {
  useLanguage,
} from "../Language/LanguageContext";

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
  language
) {

  if (
    language === "bn"
  ) {

    return "bn-BD";
  }


  if (
    language === "hi"
  ) {

    return "hi-IN";
  }


  return "en-US";
}


// =========================================================
// DATE
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


  return new Intl.DateTimeFormat(
    getLocale(
      uiLanguage
    ),
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    date
  );
}


// =========================================================
// DOCUMENT CARD
// =========================================================

function DocumentCard({
  document,
}) {

  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  if (!document) {
    return null;
  }


  // =======================================================
  // BASIC DATA
  // =======================================================

  const fileUrl =
    document.file_url ||
    document.url ||
    "";


  const thumbnailUrl =
    document.thumbnail_url ||
    "";


  const authorName =
    document.author?.name ||
    document.author?.username ||
    document.user?.name ||
    document.user?.username ||
    t(
      "explore.unknownWriter",
      "SHOBDO Writer"
    );


  const publishedDate =
    formatDate(
      document.published_at ||
      document.created_at,
      uiLanguage
    );


  const fileSize =
    formatFileSize(
      document.file_size
    );


  const pageCount =
    Number(
      document.page_count
    ) || 0;


  // =======================================================
  // CATEGORY
  // =======================================================

  function getCategoryLabel(
    category
  ) {

    const map = {

      "কবিতা":
        t(
          "categories.poetry",
          "Poetry"
        ),

      "গল্প":
        t(
          "categories.story",
          "Story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection",
          "Feelings"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay",
          "Essay"
        ),

      "অন্যান্য":
        t(
          "categories.other",
          "Other"
        ),
    };


    return (
      map[category] ||
      category ||
      t(
        "categories.other",
        "Other"
      )
    );
  }


  // =======================================================
  // DOCUMENT LANGUAGE
  // =======================================================

  function getDocumentLanguageLabel(
    language
  ) {

    const normalized =
      String(
        language ||
        ""
      ).toLowerCase();


    if (
      normalized === "bn"
    ) {

      return t(
        "write.bengali",
        "বাংলা"
      );
    }


    if (
      normalized === "en"
    ) {

      return t(
        "write.english",
        "English"
      );
    }


    if (
      normalized === "hi"
    ) {

      return t(
        "write.hindi",
        "हिन्दी"
      );
    }


    return normalized
      ? normalized.toUpperCase()
      : "";
  }


  const documentLanguage =
    getDocumentLanguageLabel(
      document.language
    );


  // =======================================================
  // PAGE LABEL
  // =======================================================

  const pageLabel =
    pageCount === 1
      ? t(
          "explore.pdfPage",
          "page"
        )
      : t(
          "explore.pdfPages",
          "pages"
        );


  // =======================================================
  // UI
  // =======================================================

  return (

    <article
      className="document-card"
    >

      {/* =================================================
          THUMBNAIL
      ================================================== */}

      <a
        className="document-card-thumbnail"
        href={
          fileUrl ||
          "#"
        }
        target={
          fileUrl
            ? "_blank"
            : undefined
        }
        rel={
          fileUrl
            ? "noopener noreferrer"
            : undefined
        }
        onClick={(
          event
        ) => {

          if (!fileUrl) {

            event.preventDefault();
          }
        }}
      >

        {thumbnailUrl
          ? (

            <img
              src={
                thumbnailUrl
              }
              alt={
                document.title ||
                t(
                  "explore.untitledPdf",
                  "Untitled PDF"
                )
              }
              loading="lazy"
                  decoding="async"
            />

          )
          : (

            <div
              className="document-card-thumbnail-fallback"
            >

              <FileText
                size={54}
              />


              <span>
                {t(
                  "explore.pdfLabel",
                  "PDF"
                )}
              </span>

            </div>

          )}


        <span
          className="document-card-pdf-badge"
        >

          {t(
            "explore.pdfLabel",
            "PDF"
          )}

        </span>

      </a>


      {/* =================================================
          BODY
      ================================================== */}

      <div
        className="document-card-body"
      >

        {/* ===============================================
            CATEGORY + LANGUAGE
        ================================================ */}

        <div
          className="document-card-meta"
        >

          <span
            className="document-card-category"
          >

            {
              getCategoryLabel(
                document.category
              )
            }

          </span>


          {documentLanguage && (

            <span
              className="document-card-language"
            >

              <Globe2
                size={14}
              />


              {
                documentLanguage
              }

            </span>

          )}

        </div>


        {/* ===============================================
            TITLE
        ================================================ */}

        <h3
          className="document-card-title"
        >

          {
            document.title ||
            t(
              "explore.untitledPdf",
              "Untitled PDF"
            )
          }

        </h3>


        {/* ===============================================
            DESCRIPTION
        ================================================ */}

        {document.description && (

          <p
            className="document-card-description"
          >

            {
              document.description
            }

          </p>

        )}


        {/* ===============================================
            AUTHOR
        ================================================ */}

        <div
          className="document-card-author"
        >

          <UserRound
            size={16}
          />


          <span>
            {authorName}
          </span>

        </div>


        {/* ===============================================
            DOCUMENT INFO
        ================================================ */}

        <div
          className="document-card-info"
        >

          {pageCount > 0 && (

            <span>

              {pageCount}

              {" "}

              {pageLabel}

            </span>

          )}


          {fileSize && (

            <span>
              {fileSize}
            </span>

          )}


          {publishedDate && (

            <span>

              <CalendarDays
                size={14}
              />


              {
                publishedDate
              }

            </span>

          )}

        </div>


        {/* ===============================================
            ACTION BUTTONS
        ================================================ */}

        {fileUrl && (

          <div
            className="document-card-actions"
          >

            <a
              className="document-card-view"
              href={
                fileUrl
              }
              target="_blank"
              rel="noopener noreferrer"
            >

              <ExternalLink
                size={17}
              />


              {t(
                "explore.viewPdf",
                "View PDF"
              )}

            </a>


            {document.allow_download && (

              <a
                className="document-card-download"
                href={
                  fileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                download={
                  document.original_filename ||
                  undefined
                }
              >

                <Download
                  size={17}
                />


                {t(
                  "explore.download",
                  "Download"
                )}

              </a>

            )}

          </div>

        )}

      </div>

    </article>
  );
}


export default DocumentCard;