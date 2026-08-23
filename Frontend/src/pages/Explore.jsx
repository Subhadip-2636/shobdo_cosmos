import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  ArrowRight,
  X,
} from "lucide-react";

import WritingCard from "../components/WritingCard";


function Explore({
  writings = [],
  loading = false,
  error = "",
}) {
  // =========================================================
  // FILTER STATE
  // =========================================================

  const [searchText, setSearchText] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("সব");

  const [sortBy, setSortBy] =
    useState("newest");


  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "সব",
    "কবিতা",
    "গল্প",
    "অনুভূতি",
    "প্রবন্ধ",
    "অন্যান্য",
  ];


  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredWritings =
    useMemo(() => {
      let result = [...writings];


      // -----------------------------------------------------
      // CATEGORY FILTER
      // -----------------------------------------------------

      if (
        selectedCategory !== "সব"
      ) {
        result = result.filter(
          (writing) =>
            writing.category ===
            selectedCategory
        );
      }


      // -----------------------------------------------------
      // SEARCH FILTER
      // -----------------------------------------------------

      const query =
        searchText
          .trim()
          .toLowerCase();


      if (query) {
        result = result.filter(
          (writing) => {
            const title =
              writing.title
                ?.toLowerCase() || "";

            const content =
              writing.content
                ?.toLowerCase() || "";

            const author =
              writing.author?.name
                ?.toLowerCase() || "";

            const category =
              writing.category
                ?.toLowerCase() || "";


            return (
              title.includes(query) ||
              content.includes(query) ||
              author.includes(query) ||
              category.includes(query)
            );
          }
        );
      }


      // -----------------------------------------------------
      // SORT
      // -----------------------------------------------------

      result.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.created_at || 0
            ).getTime();

          const dateB =
            new Date(
              b.created_at || 0
            ).getTime();


          if (
            sortBy === "oldest"
          ) {
            return dateA - dateB;
          }


          if (
            sortBy === "title"
          ) {
            return (
              a.title || ""
            ).localeCompare(
              b.title || "",
              "bn"
            );
          }


          return dateB - dateA;
        }
      );


      return result;
    }, [
      writings,
      searchText,
      selectedCategory,
      sortBy,
    ]);


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("সব");
    setSortBy("newest");
  }


  // =========================================================
  // ACTIVE FILTER CHECK
  // =========================================================

  const hasActiveFilters =
    searchText.trim() !== "" ||
    selectedCategory !== "সব" ||
    sortBy !== "newest";


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="explore-page">

      <div className="explore-container">


        {/* =================================================
           HEADER
           ================================================= */}

        <section className="explore-header">

          <div>

            <span className="section-kicker">
              DISCOVER
            </span>


            <h1>
              বাংলা লেখার জগৎ
            </h1>


            <p>
              কবিতা, গল্প, অনুভূতি ও প্রবন্ধ —
              SHOBDO-র লেখকদের নতুন সৃষ্টি
              আবিষ্কার করুন।
            </p>

          </div>


          <div className="explore-count">

            <BookOpen size={19} />

            <span>
              {writings.length}
            </span>

            <small>
              প্রকাশিত লেখা
            </small>

          </div>

        </section>


        {/* =================================================
           FILTER PANEL
           ================================================= */}

        <section className="explore-filter-panel">


          {/* ===============================================
             SEARCH
             =============================================== */}

          <div className="explore-search">

            <Search
              size={19}
              className="explore-search-icon"
            />


            <input
              type="search"

              value={searchText}

              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }

              placeholder="শিরোনাম, লেখক বা লেখা খুঁজুন..."

              aria-label="Search writings"
            />


            {searchText && (

              <button
                type="button"
                className="search-clear-button"

                onClick={() =>
                  setSearchText("")
                }

                aria-label="Clear search"
              >
                <X size={17} />
              </button>

            )}

          </div>


          {/* ===============================================
             SORT
             =============================================== */}

          <div className="explore-sort">

            <SlidersHorizontal
              size={17}
            />


            <select
              value={sortBy}

              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }

              aria-label="Sort writings"
            >
              <option value="newest">
                নতুন প্রথমে
              </option>

              <option value="oldest">
                পুরনো প্রথমে
              </option>

              <option value="title">
                শিরোনাম অনুযায়ী
              </option>
            </select>

          </div>

        </section>


        {/* =================================================
           CATEGORY FILTER
           ================================================= */}

        <section className="category-filter-row">

          <div className="category-filter-list">

            {categories.map(
              (category) => (

                <button
                  key={category}

                  type="button"

                  className={
                    selectedCategory === category
                      ? "category-filter active"
                      : "category-filter"
                  }

                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>


          {hasActiveFilters && (

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              সব ফিল্টার মুছুন
            </button>

          )}

        </section>


        {/* =================================================
           ERROR
           ================================================= */}

        {error && (

          <div
            className="explore-error"
            role="alert"
          >
            <strong>
              লেখাগুলো লোড করা যায়নি।
            </strong>

            <span>
              {error}
            </span>
          </div>

        )}


        {/* =================================================
           LOADING
           ================================================= */}

        {loading && (

          <section className="explore-grid">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (

                <div
                  key={item}
                  className="explore-skeleton-card"
                >
                  <div className="skeleton-line skeleton-small" />

                  <div className="skeleton-line skeleton-title" />

                  <div className="skeleton-line" />

                  <div className="skeleton-line" />

                  <div className="skeleton-line skeleton-medium" />
                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
           RESULTS HEADER
           ================================================= */}

        {!loading && (

          <div className="explore-results-header">

            <div>

              <strong>
                {filteredWritings.length}
              </strong>

              <span>
                টি লেখা পাওয়া গেছে
              </span>

            </div>


            {selectedCategory !== "সব" && (

              <span className="active-category-label">
                {selectedCategory}
              </span>

            )}

          </div>

        )}


        {/* =================================================
           WRITING GRID
           ================================================= */}

        {!loading &&
          filteredWritings.length > 0 && (

            <section className="explore-grid">

              {filteredWritings.map(
                (writing) => (

                  <WritingCard
                    key={writing.id}
                    writing={writing}
                  />

                )
              )}

            </section>

          )}


        {/* =================================================
           EMPTY STATE
           ================================================= */}

        {!loading &&
          filteredWritings.length === 0 && (

            <section className="explore-empty">

              <div className="explore-empty-icon">

                <BookOpen size={30} />

              </div>


              <h2>
                কোনো লেখা পাওয়া যায়নি
              </h2>


              <p>
                আপনার সার্চ বা ফিল্টারের সঙ্গে
                মিলছে এমন কোনো লেখা নেই।
              </p>


              {hasActiveFilters ? (

                <button
                  type="button"
                  className="primary-button"
                  onClick={clearFilters}
                >
                  সব লেখা দেখুন

                  <ArrowRight size={17} />
                </button>

              ) : (

                <p className="explore-empty-note">
                  SHOBDO-তে প্রথম লেখা প্রকাশ করুন।
                </p>

              )}

            </section>

          )}

      </div>

    </main>
  );
}


export default Explore;