import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Feather,
  Lightbulb,
  PenLine,
  Quote,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import WritingCard from "../components/WritingCard";

import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// CLASSIC PUBLIC-DOMAIN QUOTES
// =========================================================

const LITERARY_QUOTES = [

  {
    quote:
      "To thine own self be true.",

    author:
      "William Shakespeare",

    source:
      "Hamlet",
  },

  {
    quote:
      "There is no charm equal to tenderness of heart.",

    author:
      "Jane Austen",

    source:
      "Emma",
  },

  {
    quote:
      "I am no bird; and no net ensnares me.",

    author:
      "Charlotte Brontë",

    source:
      "Jane Eyre",
  },

  {
    quote:
      "Forever is composed of nows.",

    author:
      "Emily Dickinson",

    source:
      "Poem 690",
  },

];


// =========================================================
// DATABASE CATEGORY VALUES
// =========================================================

const CATEGORIES = [

  {
    value:
      "কবিতা",

    translationKey:
      "categories.poetry",

    symbol:
      "✦",

    number:
      "01",
  },

  {
    value:
      "গল্প",

    translationKey:
      "categories.story",

    symbol:
      "◈",

    number:
      "02",
  },

  {
    value:
      "অনুভূতি",

    translationKey:
      "categories.reflection",

    symbol:
      "●",

    number:
      "03",
  },

  {
    value:
      "প্রবন্ধ",

    translationKey:
      "categories.essay",

    symbol:
      "◇",

    number:
      "04",
  },

];


// =========================================================
// HOME
// =========================================================

function Home({
  writings = [],
  loading = false,
}) {

  const {
    t,
  } = useLanguage();


  // =====================================================
  // QUOTE STATE
  // =====================================================

  const [
    quoteIndex,
    setQuoteIndex,
  ] = useState(0);


  // =====================================================
  // AUTO ROTATE QUOTES
  // =====================================================

  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          setQuoteIndex(
            (current) =>
              (
                current + 1
              )
              %
              LITERARY_QUOTES.length
          );

        },
        7000
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, []);


  // =====================================================
  // QUOTE CONTROLS
  // =====================================================

  function previousQuote() {

    setQuoteIndex(
      (current) =>
        (
          current -
          1 +
          LITERARY_QUOTES.length
        )
        %
        LITERARY_QUOTES.length
    );

  }


  function nextQuote() {

    setQuoteIndex(
      (current) =>
        (
          current + 1
        )
        %
        LITERARY_QUOTES.length
    );

  }


  const activeQuote =
    LITERARY_QUOTES[
      quoteIndex
    ];


  // =====================================================
  // WRITINGS
  // =====================================================

  const featuredWriting =
    writings[0] || null;


  const latestWritings =
    featuredWriting
      ? writings.slice(
        1,
        7
      )
      : writings.slice(
        0,
        6
      );


  // =====================================================
  // CATEGORY LABEL
  // =====================================================

  function categoryLabel(
    value
  ) {

    const map = {

      "কবিতা":
        t(
          "categories.poetry"
        ),

      "গল্প":
        t(
          "categories.story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay"
        ),

      "অন্যান্য":
        t(
          "categories.other"
        ),
    };


    return (
      map[value] ||
      value
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="literary-home">


      {/* =================================================
          HERO
      ================================================== */}

      <section className="literary-hero">

        <div className="literary-hero-noise" />


        <div className="literary-hero-inner">


          {/* LEFT */}

          <div className="literary-hero-copy">

            <div className="literary-kicker">

              <Sparkles
                size={14}
              />

              <span>

                {t(
                  "home.eyebrow"
                )}

              </span>

            </div>


            <h1>

              {t(
                "home.heroTitle"
              )}

            </h1>


            <p className="literary-hero-description">

              {t(
                "home.heroDescription"
              )}

            </p>


            <div className="literary-hero-buttons">

              <Link
                to="/write"
                className="literary-primary-button"
              >

                <PenLine
                  size={17}
                />

                {t(
                  "home.startWriting"
                )}

              </Link>


              <Link
                to="/explore"
                className="literary-text-button"
              >

                {t(
                  "home.exploreWriting"
                )}

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>


            <div className="literary-hero-footnote">

              <span />

              <p>

                {t(
                  "home.writerInvitation",
                  "Some stories are waiting for only you to write them."
                )}

              </p>

            </div>

          </div>


          {/* RIGHT — MANUSCRIPT */}

          <div className="literary-manuscript-wrap">

            <div className="literary-manuscript-shadow" />


            <div className="literary-manuscript">

              <div className="manuscript-top">

                <Feather
                  size={25}
                />

                <span>
                  SHOBDO
                </span>

              </div>


              <div className="manuscript-rule" />


              <p className="manuscript-small">

                {t(
                  "home.blankPageLabel",
                  "A BLANK PAGE"
                )}

              </p>


              <h2>

                {t(
                  "home.blankPageTitle",
                  "What will you write today?"
                )}

              </h2>


              <div className="manuscript-lines">

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>


              <Link
                to="/write"
                className="manuscript-write-link"
              >

                <PenLine
                  size={15}
                />

                {t(
                  "home.beginStory",
                  "Begin your story"
                )}

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          QUOTE EXPERIENCE
      ================================================== */}

      <section className="literary-quotes-section">

        <div className="literary-quotes-shell">


          <div className="quote-section-side">

            <span className="quote-side-number">
              01
            </span>


            <div>

              <p className="literary-section-label">

                {t(
                  "home.quoteEyebrow",
                  "WORDS THAT REMAIN"
                )}

              </p>


              <h2>

                {t(
                  "home.quoteTitle",
                  "Words that moved generations."
                )}

              </h2>


              <p>

                {t(
                  "home.quoteDescription",
                  "Sometimes one sentence is enough to make someone pick up a pen."
                )}

              </p>

            </div>

          </div>


          <div className="quote-stage">

            <Quote
              className="quote-stage-icon"
              size={46}
            />


            <blockquote>

              “{activeQuote.quote}”

            </blockquote>


            <div className="quote-author">

              <span />

              <div>

                <strong>

                  {activeQuote.author}

                </strong>

                <small>

                  {activeQuote.source}

                </small>

              </div>

            </div>


            <div className="quote-navigation">

              <button
                type="button"
                onClick={
                  previousQuote
                }
                aria-label="Previous quote"
              >

                <ArrowLeft
                  size={16}
                />

              </button>


              <div className="quote-dots">

                {
                  LITERARY_QUOTES.map(
                    (
                      item,
                      index
                    ) => (

                      <button
                        key={
                          `${item.author}-${index}`
                        }

                        type="button"

                        className={
                          index ===
                          quoteIndex
                            ? "active"
                            : ""
                        }

                        onClick={() =>
                          setQuoteIndex(
                            index
                          )
                        }

                        aria-label={
                          `Quote ${index + 1}`
                        }
                      />

                    )
                  )
                }

              </div>


              <button
                type="button"
                onClick={
                  nextQuote
                }
                aria-label="Next quote"
              >

                <ArrowRight
                  size={16}
                />

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          WRITING INVITATION
      ================================================== */}

      <section className="literary-prompt-section">

        <div className="literary-prompt-card">

          <div className="prompt-light">

            <Lightbulb
              size={25}
            />

          </div>


          <div className="prompt-content">

            <span>

              {t(
                "home.promptEyebrow",
                "A THOUGHT FOR TODAY"
              )}

            </span>


            <h2>

              {t(
                "home.promptTitle",
                "Write about something you never said aloud."
              )}

            </h2>


            <p>

              {t(
                "home.promptDescription",
                "It does not have to be perfect. It only has to be yours."
              )}

            </p>

          </div>


          <Link
            to="/write"
            className="prompt-write-button"
          >

            <PenLine
              size={17}
            />

            {t(
              "home.startWriting"
            )}

          </Link>

        </div>

      </section>


      {/* =================================================
          CATEGORIES
      ================================================== */}

      <section className="literary-content-section">

        <div className="literary-section-header">

          <div>

            <span className="literary-section-label">

              {t(
                "home.discoverEyebrow",
                "DISCOVER"
              )}

            </span>


            <h2>

              {t(
                "home.categoriesTitle"
              )}

            </h2>


            <p>

              {t(
                "home.categoriesDescription"
              )}

            </p>

          </div>


          <Link
            to="/explore"
            className="literary-view-all"
          >

            {t(
              "home.viewAll"
            )}

            <ArrowRight
              size={15}
            />

          </Link>

        </div>


        <div className="literary-category-grid">

          {
            CATEGORIES.map(
              (item) => (

                <Link
                  key={
                    item.value
                  }

                  to={
                    `/explore?category=${encodeURIComponent(
                      item.value
                    )}`
                  }

                  className="literary-category-card"
                >

                  <div className="category-card-top">

                    <span className="category-number">

                      {item.number}

                    </span>


                    <span className="category-symbol">

                      {item.symbol}

                    </span>

                  </div>


                  <div className="category-card-bottom">

                    <div>

                      <h3>

                        {t(
                          item.translationKey
                        )}

                      </h3>


                      <p>

                        {t(
                          "home.exploreWriting"
                        )}

                      </p>

                    </div>


                    <ArrowRight
                      size={17}
                    />

                  </div>

                </Link>

              )
            )
          }

        </div>

      </section>


      {/* =================================================
          FEATURED COMMUNITY WRITING
      ================================================== */}

      {!loading &&
      featuredWriting && (

        <section className="literary-featured-section">

          <div className="literary-featured-shell">


            <div className="featured-side-label">

              <span>
                02
              </span>

              <p>

                {t(
                  "home.featuredEyebrow",
                  "FROM THE COMMUNITY"
                )}

              </p>

            </div>


            <article className="literary-featured-article">

              <div className="featured-article-meta">

                <span>

                  {
                    categoryLabel(
                      featuredWriting
                        .category
                    )
                  }

                </span>

                <i />

                <span>

                  {
                    featuredWriting
                      .author
                      ?.name ||
                    t(
                      "common.unknownAuthor"
                    )
                  }

                </span>

              </div>


              <h2>

                {
                  featuredWriting
                    .title ||
                  t(
                    "common.untitled"
                  )
                }

              </h2>


              <p>

                {
                  featuredWriting
                    .content
                    ?.trim()
                    ?.slice(
                      0,
                      420
                    )
                  ||
                  t(
                    "writingCard.previewUnavailable"
                  )
                }

                {
                  featuredWriting
                    .content
                    ?.length >
                  420
                    ? "…"
                    : ""
                }

              </p>


              <Link
                to={
                  `/writings/${featuredWriting.id}`
                }
              >

                {t(
                  "writingCard.read"
                )}

                <ArrowRight
                  size={16}
                />

              </Link>

            </article>


            <div className="featured-quote-mark">

              <Quote
                size={72}
              />

            </div>

          </div>

        </section>

      )}


      {/* =================================================
          LATEST WRITINGS
      ================================================== */}

      <section className="literary-content-section literary-latest">

        <div className="literary-section-header">

          <div>

            <span className="literary-section-label">

              {t(
                "home.latestEyebrow",
                "FRESH INK"
              )}

            </span>


            <h2>

              {t(
                "home.latestTitle"
              )}

            </h2>


            <p>

              {t(
                "home.latestDescription"
              )}

            </p>

          </div>


          <Link
            to="/explore"
            className="literary-view-all"
          >

            {t(
              "home.viewAll"
            )}

            <ArrowRight
              size={15}
            />

          </Link>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="literary-loading">

            <Feather
              size={28}
            />

            <span>

              {t(
                "common.loading"
              )}

            </span>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
        writings.length === 0 && (

          <div className="literary-empty-state">

            <Feather
              size={32}
            />


            <h3>

              {t(
                "home.emptyTitle"
              )}

            </h3>


            <p>

              {t(
                "home.emptyDescription"
              )}

            </p>


            <Link
              to="/write"
              className="literary-primary-button"
            >

              <PenLine
                size={17}
              />

              {t(
                "home.startWriting"
              )}

            </Link>

          </div>

        )}


        {/* GRID */}

        {!loading &&
        latestWritings.length > 0 && (

          <div className="literary-writing-grid">

            {
              latestWritings.map(
                (writing) => (

                  <WritingCard
                    key={
                      writing.id
                    }

                    writing={
                      writing
                    }
                  />

                )
              )
            }

          </div>

        )}

      </section>


      {/* =================================================
          FINAL CALL TO WRITE
      ================================================== */}

      <section className="literary-final-section">

        <div className="final-background-word">
          SHOBDO
        </div>


        <div className="literary-final-inner">

          <Feather
            size={34}
          />


          <span>

            {t(
              "home.finalEyebrow",
              "YOUR PAGE IS STILL BLANK"
            )}

          </span>


          <h2>

            {t(
              "home.finalTitle",
              "Someone may be waiting to read the words only you can write."
            )}

          </h2>


          <p>

            {t(
              "home.finalDescription",
              "Begin with one sentence. The rest can find its way."
            )}

          </p>


          <Link
            to="/write"
            className="literary-final-button"
          >

            {t(
              "home.beginWriting",
              "Write something"
            )}

            <ArrowRight
              size={17}
            />

          </Link>

        </div>

      </section>

    </main>
  );

}


export default Home;