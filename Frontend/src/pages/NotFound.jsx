import {
  ArrowLeft,
  BookOpen,
  Feather,
  Home,
  Search,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useLanguage,
} from "../Language/LanguageContext";


import SEO from "../components/SEO";

import "./NotFound.css";


// =========================================================
// NOT FOUND
// =========================================================

function NotFound() {

  const {
    t,
  } = useLanguage();


  // =======================================================
  // SAFE TRANSLATION
  // =======================================================

  function translate(
    key,
    fallback
  ) {

    try {

      const value =
        t(
          key,
          fallback
        );


      if (
        value &&
        value !== key
      ) {

        return value;

      }

    } catch {

      // Use fallback below.

    }


    return fallback;

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <>

      {/* ===================================================
          SEO
      ==================================================== */}

      <SEO
        title="Page Not Found"
        description="The requested SHOBDO page could not be found."
        type="website"
        noIndex
      />


      <main
        className="not-found-page"
      >

        <div
          className="not-found-shell"
        >


          {/* =================================================
              BRAND
          ================================================== */}

          <Link
            to="/"
            className="not-found-brand"
            aria-label={
              translate(
                "notFound.brandHome",
                "Go to SHOBDO home"
              )
            }
          >

            <span
              className="not-found-brand-icon"
              aria-hidden="true"
            >

              <Feather
                size={20}
              />

            </span>


            <span>

              <strong>
                SHOBDO
              </strong>

              <small>
                শব্দ
              </small>

            </span>

          </Link>


          {/* =================================================
              DECORATIVE ERROR NUMBER
          ================================================== */}

          <div
            className="not-found-number"
            aria-hidden="true"
          >
            404
          </div>


          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="not-found-content"
          >

            <span
              className="not-found-eyebrow"
            >

              {
                translate(
                  "notFound.eyebrow",
                  "Page not found"
                )
              }

            </span>


            <h1>

              {
                translate(
                  "notFound.title",
                  "This page seems to have lost its words."
                )
              }

            </h1>


            <p>

              {
                translate(
                  "notFound.description",
                  "The page you are looking for may have been moved, deleted, or the address may be incorrect."
                )
              }

            </p>


            {/* ===============================================
                PRIMARY ACTIONS
            ================================================ */}

            <div
              className="not-found-actions"
            >

              <Link
                to="/"
                className="not-found-primary"
              >

                <Home
                  size={16}
                  aria-hidden="true"
                />

                <span>

                  {
                    translate(
                      "notFound.home",
                      "Back to home"
                    )
                  }

                </span>

              </Link>


              <Link
                to="/explore"
                className="not-found-secondary"
              >

                <BookOpen
                  size={16}
                  aria-hidden="true"
                />

                <span>

                  {
                    translate(
                      "notFound.explore",
                      "Explore writings"
                    )
                  }

                </span>

              </Link>

            </div>


            {/* ===============================================
                SECONDARY LINKS
            ================================================ */}

            <div
              className="not-found-links"
            >

              <Link
                to="/search"
              >

                <Search
                  size={14}
                  aria-hidden="true"
                />

                <span>

                  {
                    translate(
                      "notFound.search",
                      "Search SHOBDO"
                    )
                  }

                </span>

              </Link>


              <Link
                to="/about"
              >

                <ArrowLeft
                  size={14}
                  aria-hidden="true"
                />

                <span>

                  {
                    translate(
                      "notFound.about",
                      "About SHOBDO"
                    )
                  }

                </span>

              </Link>

            </div>


            {/* ===============================================
                SUPPORTING MESSAGE
            ================================================ */}

            <div
              className="not-found-help"
            >

              <Feather
                size={13}
                aria-hidden="true"
              />

              <span>

                {
                  translate(
                    "notFound.help",
                    "You can return home, explore new writing, or search for what you were looking for."
                  )
                }

              </span>

            </div>

          </div>

        </div>

      </main>

    </>

  );

}


export default NotFound;