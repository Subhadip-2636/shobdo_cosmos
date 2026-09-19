import "./WritingCardSkeleton.css";


// =========================================================
// WRITING CARD SKELETON
// =========================================================

function WritingCardSkeleton() {

  return (

    <article
      className="writing-card-skeleton"
      aria-hidden="true"
    >

      {/* =================================================
          AUTHOR
      ================================================== */}

      <div
        className="writing-card-skeleton-header"
      >

        <div
          className="skeleton-avatar skeleton-shimmer"
        />


        <div
          className="skeleton-author-info"
        >

          <div
            className="skeleton-line skeleton-author-name skeleton-shimmer"
          />

          <div
            className="skeleton-line skeleton-author-meta skeleton-shimmer"
          />

        </div>


        <div
          className="skeleton-line skeleton-time skeleton-shimmer"
        />

      </div>


      {/* =================================================
          BADGES
      ================================================== */}

      <div
        className="writing-card-skeleton-badges"
      >

        <div
          className="skeleton-pill skeleton-shimmer"
        />

        <div
          className="skeleton-pill skeleton-pill-small skeleton-shimmer"
        />

      </div>


      {/* =================================================
          TITLE
      ================================================== */}

      <div
        className="skeleton-line skeleton-title skeleton-shimmer"
      />


      {/* =================================================
          CONTENT
      ================================================== */}

      <div
        className="writing-card-skeleton-content"
      >

        <div
          className="skeleton-line skeleton-text skeleton-shimmer"
        />

        <div
          className="skeleton-line skeleton-text skeleton-shimmer"
        />

        <div
          className="skeleton-line skeleton-text skeleton-text-medium skeleton-shimmer"
        />

      </div>


      {/* =================================================
          TAGS
      ================================================== */}

      <div
        className="writing-card-skeleton-tags"
      >

        <div
          className="skeleton-tag skeleton-shimmer"
        />

        <div
          className="skeleton-tag skeleton-tag-medium skeleton-shimmer"
        />

        <div
          className="skeleton-tag skeleton-tag-small skeleton-shimmer"
        />

      </div>


      {/* =================================================
          META
      ================================================== */}

      <div
        className="writing-card-skeleton-meta"
      >

        <div
          className="skeleton-line skeleton-meta-item skeleton-shimmer"
        />

        <div
          className="skeleton-line skeleton-meta-item skeleton-shimmer"
        />

        <div
          className="skeleton-line skeleton-meta-short skeleton-shimmer"
        />

      </div>


      {/* =================================================
          FOOTER
      ================================================== */}

      <div
        className="writing-card-skeleton-footer"
      >

        <div
          className="skeleton-social-actions"
        >

          <div
            className="skeleton-action skeleton-shimmer"
          />

          <div
            className="skeleton-action skeleton-shimmer"
          />

          <div
            className="skeleton-action skeleton-shimmer"
          />

          <div
            className="skeleton-action skeleton-action-small skeleton-shimmer"
          />

        </div>


        <div
          className="skeleton-read-button skeleton-shimmer"
        />

      </div>

    </article>

  );

}


export default WritingCardSkeleton;