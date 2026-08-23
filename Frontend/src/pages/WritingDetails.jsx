import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";


function WritingDetails({ apiUrl }) {
  const { id } = useParams();

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [writing, setWriting] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // FETCH WRITING
  // =========================================================

  useEffect(() => {
    async function fetchWriting() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${apiUrl}/api/writings/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "লেখাটি পাওয়া যায়নি।"
          );
        }

        setWriting(
          data.writing
        );

      } catch (err) {
        console.error(
          "WRITING DETAILS ERROR:",
          err
        );

        setError(
          err.message ||
          "লেখাটি লোড করা যায়নি।"
        );

      } finally {
        setLoading(false);
      }
    }


    fetchWriting();

  }, [
    apiUrl,
    id,
  ]);


  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount =
    writing?.content
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .length || 0;


  // =========================================================
  // READING TIME
  // =========================================================

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        wordCount / 180
      )
    );


  // =========================================================
  // DATE FORMAT
  // =========================================================

  function formatDate(dateString) {
    if (!dateString) {
      return "তারিখ নেই";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "তারিখ নেই";
    }

    try {
      return new Intl.DateTimeFormat(
        "bn-BD",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(date);

    } catch {
      return date.toLocaleDateString();
    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="writing-details-page">

        <div className="writing-details-container">

          <div className="writing-details-loading">

            <div className="details-skeleton details-small" />

            <div className="details-skeleton details-title" />

            <div className="details-skeleton" />

            <div className="details-skeleton" />

            <div className="details-skeleton details-medium" />

          </div>

        </div>

      </main>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !writing) {
    return (
      <main className="writing-details-page">

        <div className="writing-details-container">

          <section className="writing-details-error">

            <div className="details-error-icon">
              <AlertCircle size={30} />
            </div>

            <h1>
              লেখাটি পাওয়া যায়নি
            </h1>

            <p>
              {error ||
                "এই লেখাটি আর উপলব্ধ নেই।"}
            </p>

            <div className="details-error-actions">

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                <RefreshCw size={17} />
                আবার চেষ্টা করুন
              </button>

              <Link
                to="/explore"
                className="details-secondary-link"
              >
                <ArrowLeft size={17} />
                Explore-এ ফিরে যান
              </Link>

            </div>

          </section>

        </div>

      </main>
    );
  }


  // =========================================================
  // DATA
  // =========================================================

  const authorName =
    writing.author?.name ||
    "অজানা লেখক";

  const formattedDate =
    formatDate(
      writing.created_at
    );


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="writing-details-page">

      <div className="writing-details-container">


        {/* =================================================
           BACK
           ================================================= */}

        <button
          type="button"
          className="writing-details-back"
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={17} />

          ফিরে যান
        </button>


        {/* =================================================
           ARTICLE HEADER
           ================================================= */}

        <article className="writing-details-article">

          <header className="writing-details-header">


            {/* CATEGORY */}

            <div className="writing-details-category">
              {writing.category || "অন্যান্য"}
            </div>


            {/* TITLE */}

            <h1>
              {writing.title}
            </h1>


            {/* AUTHOR */}

            <div className="writing-details-author">

              <div className="details-author-avatar">
                <User size={18} />
              </div>


              <div>

                <strong>
                  {authorName}
                </strong>


                <div className="writing-details-meta">

                  <span>
                    <CalendarDays size={14} />
                    {formattedDate}
                  </span>


                  <span>
                    <Clock3 size={14} />
                    {readingTime} মিনিট পাঠ
                  </span>


                  <span>
                    <BookOpen size={14} />
                    {wordCount} শব্দ
                  </span>

                </div>

              </div>

            </div>

          </header>


          {/* =================================================
             DIVIDER
             ================================================= */}

          <div className="writing-details-divider" />


          {/* =================================================
             WRITING CONTENT
             ================================================= */}

          <section className="writing-details-content">

            {writing.content
              .split("\n")
              .map(
                (
                  paragraph,
                  index
                ) => {

                  if (
                    !paragraph.trim()
                  ) {
                    return (
                      <div
                        key={index}
                        className="writing-empty-line"
                      />
                    );
                  }


                  return (
                    <p key={index}>
                      {paragraph}
                    </p>
                  );
                }
              )}

          </section>


          {/* =================================================
             BOTTOM
             ================================================= */}

          <footer className="writing-details-footer">

            <div>

              <span>
                লিখেছেন
              </span>

              <strong>
                {authorName}
              </strong>

            </div>


            <Link
              to="/explore"
              className="writing-details-explore-link"
            >
              আরও লেখা পড়ুন
            </Link>

          </footer>

        </article>

      </div>

    </main>
  );
}


export default WritingDetails;