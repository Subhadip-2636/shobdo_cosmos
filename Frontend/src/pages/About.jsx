import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Feather,
  Globe2,
  Heart,
  PenLine,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useLanguage,
} from "../Language/LanguageContext";


import SEO from "../components/SEO";

import "./About.css";


// =========================================================
// ABOUT
// =========================================================

function About() {

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
        title="About SHOBDO"
        description="Learn about SHOBDO, a multilingual writing and reading community for writers, readers and creators."
        path="/about"
        type="website"
      />


      <main
        className="about-pro-page"
      >


        {/* =================================================
            HERO
        ================================================== */}

        <section
          className="about-pro-hero"
        >

          <div
            className="about-pro-hero-shell"
          >


            {/* ===============================================
                HERO COPY
            ================================================ */}

            <div
              className="about-pro-hero-copy"
            >

              <div
                className="about-pro-eyebrow"
              >

                <Sparkles
                  size={14}
                />

                <span>

                  {
                    translate(
                      "about.eyebrow",
                      "A home for every voice"
                    )
                  }

                </span>

              </div>


              <h1>

                {
                  translate(
                    "about.title",
                    "Stories become stronger when every language has a place to belong."
                  )
                }

              </h1>


              <p
                className="about-pro-hero-description"
              >

                {
                  translate(
                    "about.description",
                    "SHOBDO is a multilingual writing and reading community built for people who want to publish their ideas, discover original voices and connect through literature."
                  )
                }

              </p>


              <div
                className="about-pro-actions"
              >

                <Link
                  to="/register"
                  className="about-pro-primary"
                >

                  <Feather
                    size={16}
                  />

                  {
                    translate(
                      "about.join",
                      "Join SHOBDO"
                    )
                  }

                </Link>


                <Link
                  to="/explore"
                  className="about-pro-secondary"
                >

                  <BookOpen
                    size={16}
                  />

                  {
                    translate(
                      "home.exploreWriting",
                      "Explore writings"
                    )
                  }

                </Link>

              </div>


              {/* =============================================
                  HERO TRUST POINTS
              ============================================== */}

              <div
                className="about-pro-hero-points"
              >

                <span>

                  <CheckCircle2
                    size={13}
                  />

                  {
                    translate(
                      "about.heroPointOne",
                      "Multilingual publishing"
                    )
                  }

                </span>


                <span>

                  <CheckCircle2
                    size={13}
                  />

                  {
                    translate(
                      "about.heroPointTwo",
                      "Writer-first community"
                    )
                  }

                </span>


                <span>

                  <CheckCircle2
                    size={13}
                  />

                  {
                    translate(
                      "about.heroPointThree",
                      "Open reading experience"
                    )
                  }

                </span>

              </div>

            </div>


            {/* ===============================================
                BRAND CARD
            ================================================ */}

            <div
              className="about-pro-brand-card"
            >

              <div
                className="about-pro-brand-glow"
              />


              <div
                className="about-pro-brand-icon"
              >

                <Feather
                  size={40}
                />

              </div>


              <span
                className="about-pro-brand-name"
              >
                SHOBDO
              </span>


              <span
                className="about-pro-brand-native"
              >
                শব্দ
              </span>


              <div
                className="about-pro-brand-line"
              />


              <p>

                {
                  translate(
                    "footer.tagline",
                    "Every language deserves a place to be heard."
                  )
                }

              </p>


              <div
                className="about-pro-brand-languages"
              >

                <span>
                  বাংলা
                </span>

                <span>
                  English
                </span>

                <span>
                  हिन्दी
                </span>

                <span>
                  + more
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            QUOTE
        ================================================== */}

        <section
          className="about-pro-quote"
        >

          <div
            className="about-pro-quote-shell"
          >

            <Quote
              size={31}
            />


            <blockquote>

              {
                translate(
                  "about.quote",
                  "A language is more than a way to speak. It is a way to remember, imagine and belong."
                )
              }

            </blockquote>


            <span>
              SHOBDO
            </span>

          </div>

        </section>


        {/* =================================================
            FOUNDATION
        ================================================== */}

        <section
          className="about-pro-section"
        >

          <div
            className="about-pro-section-head"
          >

            <span>

              {
                translate(
                  "about.foundationEyebrow",
                  "Our foundation"
                )
              }

            </span>


            <h2>

              {
                translate(
                  "about.foundationTitle",
                  "Built around expression, community and language."
                )
              }

            </h2>


            <p>

              {
                translate(
                  "about.foundationDescription",
                  "SHOBDO is designed to make writing feel accessible, discovery feel meaningful and multilingual creativity feel native to the platform."
                )
              }

            </p>

          </div>


          <div
            className="about-pro-values-grid"
          >


            {/* ===============================================
                MISSION
            ================================================ */}

            <article>

              <div
                className="about-pro-value-top"
              >

                <span>
                  01
                </span>

                <Feather
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.missionTitle",
                    "Expression"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.missionDescription",
                    "Give writers a clean place to share poetry, stories, essays, thoughts and original ideas without losing the character of their language."
                  )
                }

              </p>

            </article>


            {/* ===============================================
                COMMUNITY
            ================================================ */}

            <article>

              <div
                className="about-pro-value-top"
              >

                <span>
                  02
                </span>

                <Users
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.communityTitle",
                    "Community"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.communityDescription",
                    "Help readers discover writers they care about and give creators meaningful ways to build an audience around their work."
                  )
                }

              </p>

            </article>


            {/* ===============================================
                LANGUAGES
            ================================================ */}

            <article>

              <div
                className="about-pro-value-top"
              >

                <span>
                  03
                </span>

                <Globe2
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.languagesTitle",
                    "Languages"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.languagesDescription",
                    "Support regional and global languages as first-class creative spaces instead of treating multilingual writing as an afterthought."
                  )
                }

              </p>

            </article>

          </div>

        </section>


        {/* =================================================
            WHY SHOBDO
        ================================================== */}

        <section
          className="about-pro-dark"
        >

          <div
            className="about-pro-dark-shell"
          >


            <div
              className="about-pro-dark-title"
            >

              <span>

                {
                  translate(
                    "about.whyEyebrow",
                    "Why SHOBDO"
                  )
                }

              </span>


              <h2>

                {
                  translate(
                    "about.whyTitle",
                    "A social platform designed around the writing itself."
                  )
                }

              </h2>


              <p>

                {
                  translate(
                    "about.whyDescription",
                    "SHOBDO combines the connection of a social network with the calm, focused experience of a literary publishing platform."
                  )
                }

              </p>

            </div>


            <div
              className="about-pro-dark-list"
            >


              <article>

                <span>
                  01
                </span>


                <div>

                  <h3>

                    {
                      translate(
                        "about.valueExpressionTitle",
                        "Create without distraction"
                      )
                    }

                  </h3>


                  <p>

                    {
                      translate(
                        "about.valueExpressionDescription",
                        "A writing-first publishing experience keeps attention on your title, language, category and words."
                      )
                    }

                  </p>

                </div>

              </article>


              <article>

                <span>
                  02
                </span>


                <div>

                  <h3>

                    {
                      translate(
                        "about.valueDiscoveryTitle",
                        "Discover beyond one language"
                      )
                    }

                  </h3>


                  <p>

                    {
                      translate(
                        "about.valueDiscoveryDescription",
                        "Explore writers and ideas across languages, categories, communities and creative traditions."
                      )
                    }

                  </p>

                </div>

              </article>


              <article>

                <span>
                  03
                </span>


                <div>

                  <h3>

                    {
                      translate(
                        "about.valueBelongingTitle",
                        "Build meaningful connections"
                      )
                    }

                  </h3>


                  <p>

                    {
                      translate(
                        "about.valueBelongingDescription",
                        "Follow writers, discuss their work and return to the voices that make the platform meaningful to you."
                      )
                    }

                  </p>

                </div>

              </article>

            </div>

          </div>

        </section>


        {/* =================================================
            HOW IT WORKS
        ================================================== */}

        <section
          className="about-pro-section"
        >

          <div
            className="about-pro-section-head"
          >

            <span>

              {
                translate(
                  "about.howEyebrow",
                  "How SHOBDO works"
                )
              }

            </span>


            <h2>

              {
                translate(
                  "about.howTitle",
                  "Write. Publish. Connect."
                )
              }

            </h2>


            <p>

              {
                translate(
                  "about.howDescription",
                  "The platform is designed to keep the path from an idea to a community simple."
                )
              }

            </p>

          </div>


          <div
            className="about-pro-process"
          >


            <article>

              <span
                className="about-pro-step"
              >
                01
              </span>


              <div
                className="about-pro-process-icon"
              >

                <PenLine
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.processWriteTitle",
                    "Write"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.processWriteDescription",
                    "Create your work in the language and category that best represents your voice."
                  )
                }

              </p>

            </article>


            <article>

              <span
                className="about-pro-step"
              >
                02
              </span>


              <div
                className="about-pro-process-icon"
              >

                <BookOpen
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.processPublishTitle",
                    "Publish"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.processPublishDescription",
                    "Share your writing through a clean reading experience designed for long-form and multilingual content."
                  )
                }

              </p>

            </article>


            <article>

              <span
                className="about-pro-step"
              >
                03
              </span>


              <div
                className="about-pro-process-icon"
              >

                <Users
                  size={21}
                />

              </div>


              <h3>

                {
                  translate(
                    "about.processConnectTitle",
                    "Connect"
                  )
                }

              </h3>


              <p>

                {
                  translate(
                    "about.processConnectDescription",
                    "Build relationships with readers and writers through follows, reactions, discussions and discovery."
                  )
                }

              </p>

            </article>

          </div>

        </section>


        {/* =================================================
            TRUST
        ================================================== */}

        <section
          className="about-pro-trust"
        >

          <div
            className="about-pro-trust-shell"
          >


            <div
              className="about-pro-trust-copy"
            >

              <span>

                {
                  translate(
                    "about.trustEyebrow",
                    "Built with trust in mind"
                  )
                }

              </span>


              <h2>

                {
                  translate(
                    "about.trustTitle",
                    "Your writing should feel like yours."
                  )
                }

              </h2>


              <p>

                {
                  translate(
                    "about.trustDescription",
                    "SHOBDO is being built with clear account controls, privacy-conscious design and transparent platform policies for writers and readers."
                  )
                }

              </p>


              <div
                className="about-pro-trust-links"
              >

                <Link
                  to="/privacy"
                >

                  {
                    translate(
                      "footer.privacy",
                      "Privacy"
                    )
                  }

                </Link>


                <Link
                  to="/terms"
                >

                  {
                    translate(
                      "footer.terms",
                      "Terms"
                    )
                  }

                </Link>


                <Link
                  to="/data-deletion"
                >

                  {
                    translate(
                      "footer.dataDeletion",
                      "Data deletion"
                    )
                  }

                </Link>

              </div>

            </div>


            <div
              className="about-pro-trust-card"
            >

              <ShieldCheck
                size={35}
              />


              <strong>

                {
                  translate(
                    "about.trustCardTitle",
                    "A community built around people, not noise."
                  )
                }

              </strong>


              <p>

                {
                  translate(
                    "about.trustCardDescription",
                    "Our goal is a respectful environment where creative work remains the center of the experience."
                  )
                }

              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            LANGUAGE PHILOSOPHY
        ================================================== */}

        <section
          className="about-pro-language"
        >

          <div
            className="about-pro-language-shell"
          >


            <div
              className="about-pro-language-icon"
            >

              <Globe2
                size={31}
              />

            </div>


            <div
              className="about-pro-language-copy"
            >

              <span>

                {
                  translate(
                    "about.languageEyebrow",
                    "Multilingual by design"
                  )
                }

              </span>


              <h2>

                {
                  translate(
                    "about.languageTitle",
                    "Your language should not limit your audience."
                  )
                }

              </h2>


              <p>

                {
                  translate(
                    "about.languageDescription",
                    "SHOBDO is designed for writing communities that use different scripts, traditions and voices while sharing the same platform."
                  )
                }

              </p>


              <div
                className="about-pro-language-list"
              >

                <span>
                  বাংলা
                </span>

                <span>
                  English
                </span>

                <span>
                  हिन्दी
                </span>

                <span>
                  অসমীয়া
                </span>

                <span>
                  ଓଡ଼ିଆ
                </span>

                <span>
                  தமிழ்
                </span>

                <span>
                  తెలుగు
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FINAL CTA
        ================================================== */}

        <section
          className="about-pro-final"
        >

          <div
            className="about-pro-final-shell"
          >


            <div
              className="about-pro-final-icon"
            >

              <Heart
                size={24}
              />

            </div>


            <span>

              {
                translate(
                  "about.finalEyebrow",
                  "Your story belongs here"
                )
              }

            </span>


            <h2>

              {
                translate(
                  "about.finalTitle",
                  "Read something meaningful. Write something that matters."
                )
              }

            </h2>


            <p>

              {
                translate(
                  "about.finalDescription",
                  "Explore the community today or create an account and begin building your own space on SHOBDO."
                )
              }

            </p>


            <div
              className="about-pro-final-actions"
            >

              <Link
                to="/register"
                className="about-pro-primary"
              >

                <Feather
                  size={16}
                />

                {
                  translate(
                    "about.join",
                    "Join SHOBDO"
                  )
                }

              </Link>


              <Link
                to="/explore"
                className="about-pro-final-link"
              >

                {
                  translate(
                    "home.exploreWriting",
                    "Explore writings"
                  )
                }

                <ArrowRight
                  size={15}
                />

              </Link>

            </div>

          </div>

        </section>


      </main>

    </>

  );

}


export default About;