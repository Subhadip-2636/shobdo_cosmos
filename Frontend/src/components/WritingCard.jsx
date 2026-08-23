import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  User,
} from "lucide-react";


function WritingCard({ writing }) {
  // =========================================================
  // SAFETY
  // =========================================================

  if (!writing) {
    return null;
  }


  // =========================================================
  // EXTRACT DATA
  // =========================================================

  const {
    id,
    title = "শিরোনামহীন লেখা",
    content = "",
    category = "অন্যান্য",
    created_at,
    author,
  } = writing;


  // =========================================================
  // AUTHOR
  // =========================================================

  const authorName =
    author?.name || "অজানা লেখক";


  // =========================================================
  // CONTENT PREVIEW
  // =========================================================

  function createExcerpt(text, maxLength = 180) {
    if (!text) {
      return "";
    }

    const cleanText = text
      .replace(/\s+/g, " ")
      .trim();

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    return (
      cleanText
        .slice(0, maxLength)
        .trim() + "..."
    );
  }


  const excerpt =
    createExcerpt(content);


  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount =
    content
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;


  // =========================================================
  // READING TIME
  // =========================================================

  const readingTime =
    Math.max(
      1,
      Math.ceil(wordCount / 180)
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


  const formattedDate =
    formatDate(created_at);


  // =========================================================
  // CATEGORY CLASS
  // =========================================================

  function getCategoryClass(categoryName) {
    switch (categoryName) {
      case "কবিতা":
        return "poetry";

      case "গল্প":
        return "story";

      case "অনুভূতি":
        return "feeling";

      case "প্রবন্ধ":
        return "essay";

      default:
        return "other";
    }
  }


  const categoryClass =
    getCategoryClass(category);


  // =========================================================
  // UI
  // =========================================================

  return (
    <article className="writing-card">

      {/* ===================================================
         TOP
         =================================================== */}

      <div className="writing-card-top">

        <span
          className={`
            writing-category
            writing-category-${categoryClass}
          `}
        >
          {category}
        </span>


        <div className="writing-date">

          <CalendarDays size={14} />

          <span>
            {formattedDate}
          </span>

        </div>

      </div>


      {/* ===================================================
         TITLE
         =================================================== */}

      <Link
        to={`/writings/${id}`}
        className="writing-title-link"
      >

        <h3 className="writing-card-title">
          {title}
        </h3>

      </Link>


      {/* ===================================================
         EXCERPT
         =================================================== */}

      <p className="writing-card-excerpt">
        {excerpt || "এই লেখার কোনো সংক্ষিপ্ত অংশ নেই।"}
      </p>


      {/* ===================================================
         AUTHOR
         =================================================== */}

      <div className="writing-author">

        <div className="writing-author-avatar">

          <User size={15} />

        </div>


        <div className="writing-author-info">

          <span className="writing-author-name">
            {authorName}
          </span>


          <span className="writing-read-time">

            <Clock3 size={13} />

            {readingTime} মিনিট পাঠ

          </span>

        </div>

      </div>


      {/* ===================================================
         FOOTER
         =================================================== */}

      <div className="writing-card-footer">

        <div className="writing-word-count">
          {wordCount} শব্দ
        </div>


        <Link
          to={`/writings/${id}`}
          className="writing-read-link"
          aria-label={`${title} পড়ুন`}
        >

          পড়ুন

          <ArrowRight size={16} />

        </Link>

      </div>

    </article>
  );
}


export default WritingCard;