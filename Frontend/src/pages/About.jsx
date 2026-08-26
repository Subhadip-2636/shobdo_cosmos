import {
  ArrowRight,
  BookOpen,
  Feather,
  Globe2,
  Heart,
  PenLine,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";


function About() {

  const {
    t,
  } = useLanguage();


  return (
    <main className="about-pro-page">


      {/* =================================================
          HERO
      ================================================== */}

      <section className="about-pro-hero">

        <div className="about-pro-hero-shell">


          <div className="about-pro-hero-copy">

            <div className="about-pro-eyebrow">

              <Sparkles size={15} />

              <span>
                {t("about.eyebrow")}
              </span>

            </div>


            <h1>
              {t("about.title")}
            </h1>


            <p>
              {t("about.description")}
            </p>


            <div className="about-pro-actions">

              <Link
                to="/write"
                className="about-pro-primary"
              >

                <PenLine size={17} />

                {t("home.startWriting")}

              </Link>


              <Link
                to="/explore"
                className="about-pro-secondary"
              >

                <BookOpen size={17} />

                {t("home.exploreWriting")}

              </Link>

            </div>

          </div>


          <div className="about-pro-brand-card">

            <div className="about-pro-brand-icon">

              <Feather size={44} />

            </div>


            <span className="about-pro-brand-name">
              SHOBDO
            </span>


            <span className="about-pro-brand-native">
              শব্দ
            </span>


            <div className="about-pro-brand-line" />


            <p>
              {t("footer.tagline")}
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          QUOTE
      ================================================== */}

      <section className="about-pro-quote">

        <div className="about-pro-quote-shell">

          <Quote size={38} />


          <blockquote>

            {t("about.quote")}

          </blockquote>


          <span>
            SHOBDO
          </span>

        </div>

      </section>


      {/* =================================================
          FOUNDATION
      ================================================== */}

      <section className="about-pro-section">

        <div className="about-pro-section-head">

          <span>
            {t("about.foundationEyebrow")}
          </span>


          <h2>
            {t("about.foundationTitle")}
          </h2>


          <p>
            {t("about.foundationDescription")}
          </p>

        </div>


        <div className="about-pro-values-grid">


          <article>

            <div className="about-pro-value-top">

              <span>
                01
              </span>

              <Feather size={22} />

            </div>


            <h3>
              {t("about.missionTitle")}
            </h3>


            <p>
              {t("about.missionDescription")}
            </p>

          </article>


          <article>

            <div className="about-pro-value-top">

              <span>
                02
              </span>

              <Users size={22} />

            </div>


            <h3>
              {t("about.communityTitle")}
            </h3>


            <p>
              {t("about.communityDescription")}
            </p>

          </article>


          <article>

            <div className="about-pro-value-top">

              <span>
                03
              </span>

              <Globe2 size={22} />

            </div>


            <h3>
              {t("about.languagesTitle")}
            </h3>


            <p>
              {t("about.languagesDescription")}
            </p>

          </article>

        </div>

      </section>


      {/* =================================================
          WHY SHOBDO
      ================================================== */}

      <section className="about-pro-dark">

        <div className="about-pro-dark-shell">


          <div className="about-pro-dark-title">

            <span>
              {t("about.whyEyebrow")}
            </span>


            <h2>
              {t("about.whyTitle")}
            </h2>


            <p>
              {t("about.whyDescription")}
            </p>

          </div>


          <div className="about-pro-dark-list">


            <article>

              <span>
                01
              </span>

              <div>

                <h3>
                  {t("about.valueExpressionTitle")}
                </h3>

                <p>
                  {t("about.valueExpressionDescription")}
                </p>

              </div>

            </article>


            <article>

              <span>
                02
              </span>

              <div>

                <h3>
                  {t("about.valueDiscoveryTitle")}
                </h3>

                <p>
                  {t("about.valueDiscoveryDescription")}
                </p>

              </div>

            </article>


            <article>

              <span>
                03
              </span>

              <div>

                <h3>
                  {t("about.valueBelongingTitle")}
                </h3>

                <p>
                  {t("about.valueBelongingDescription")}
                </p>

              </div>

            </article>

          </div>

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================== */}

      <section className="about-pro-section">

        <div className="about-pro-section-head">

          <span>
            {t("about.howEyebrow")}
          </span>


          <h2>
            {t("about.howTitle")}
          </h2>


          <p>
            {t("about.howDescription")}
          </p>

        </div>


        <div className="about-pro-process">


          <article>

            <span className="about-pro-step">
              01
            </span>

            <PenLine size={22} />


            <h3>
              {t("about.processWriteTitle")}
            </h3>


            <p>
              {t("about.processWriteDescription")}
            </p>

          </article>


          <article>

            <span className="about-pro-step">
              02
            </span>

            <BookOpen size={22} />


            <h3>
              {t("about.processPublishTitle")}
            </h3>


            <p>
              {t("about.processPublishDescription")}
            </p>

          </article>


          <article>

            <span className="about-pro-step">
              03
            </span>

            <Users size={22} />


            <h3>
              {t("about.processConnectTitle")}
            </h3>


            <p>
              {t("about.processConnectDescription")}
            </p>

          </article>

        </div>

      </section>


      {/* =================================================
          LANGUAGE PHILOSOPHY
      ================================================== */}

      <section className="about-pro-language">

        <div className="about-pro-language-shell">


          <div className="about-pro-language-icon">

            <Globe2 size={34} />

          </div>


          <div>

            <span>
              {t("about.languageEyebrow")}
            </span>


            <h2>
              {t("about.languageTitle")}
            </h2>


            <p>
              {t("about.languageDescription")}
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FINAL CTA
      ================================================== */}

      <section className="about-pro-final">

        <div className="about-pro-final-shell">


          <div className="about-pro-final-icon">

            <Heart size={27} />

          </div>


          <span>
            {t("about.finalEyebrow")}
          </span>


          <h2>
            {t("about.finalTitle")}
          </h2>


          <p>
            {t("about.finalDescription")}
          </p>


          <div className="about-pro-final-actions">

            <Link
              to="/write"
              className="about-pro-primary"
            >

              <PenLine size={17} />

              {t("home.startWriting")}

            </Link>


            <Link
              to="/explore"
              className="about-pro-final-link"
            >

              {t("home.exploreWriting")}

              <ArrowRight size={16} />

            </Link>

          </div>

        </div>

      </section>

    </main>
  );

}


export default About;