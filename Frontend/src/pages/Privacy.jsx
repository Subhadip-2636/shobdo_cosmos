import {
  ArrowLeft,
  BookOpen,
  Database,
  Eye,
  FileLock2,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";


function Privacy() {

  const {
    t,
  } = useLanguage();


  return (
    <main className="legal-page">

      {/* =================================================
          HERO
      ================================================== */}

      <section className="legal-hero">

        <div className="legal-hero-shell">

          <div className="legal-hero-icon">
            <ShieldCheck size={34} />
          </div>


          <div className="legal-hero-copy">

            <span className="legal-eyebrow">
              {t("privacy.eyebrow")}
            </span>


            <h1>
              {t("privacy.title")}
            </h1>


            <p>
              {t("privacy.description")}
            </p>


            <div className="legal-meta">

              <span>
                {t("privacy.lastUpdated")}
              </span>

              <strong>
                {t("privacy.updatedDate")}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENT
      ================================================== */}

      <section className="legal-content-section">

        <div className="legal-content-shell">


          {/* ===============================================
              SIDEBAR
          ================================================ */}

          <aside className="legal-sidebar">

            <div className="legal-sidebar-box">

              <span>
                {t("privacy.onThisPage")}
              </span>


              <a href="#information">
                {t("privacy.informationTitle")}
              </a>

              <a href="#use">
                {t("privacy.useTitle")}
              </a>

              <a href="#writings">
                {t("privacy.writingsTitle")}
              </a>

              <a href="#security">
                {t("privacy.securityTitle")}
              </a>

              <a href="#choices">
                {t("privacy.choicesTitle")}
              </a>

              <a href="#contact">
                {t("privacy.contactTitle")}
              </a>

            </div>

          </aside>


          {/* ===============================================
              ARTICLE
          ================================================ */}

          <article className="legal-article">


            {/* INTRO */}

            <section className="legal-intro">

              <p>
                {t("privacy.intro")}
              </p>

            </section>


            {/* =============================================
                INFORMATION
            ============================================== */}

            <section
              id="information"
              className="legal-section"
            >

              <div className="legal-section-icon">
                <Database size={21} />
              </div>

              <span className="legal-section-number">
                01
              </span>

              <h2>
                {t("privacy.informationTitle")}
              </h2>

              <p>
                {t("privacy.informationDescription")}
              </p>

              <ul>
                <li>
                  {t("privacy.accountInfo")}
                </li>

                <li>
                  {t("privacy.authInfo")}
                </li>

                <li>
                  {t("privacy.writingInfo")}
                </li>

                <li>
                  {t("privacy.activityInfo")}
                </li>

                <li>
                  {t("privacy.technicalInfo")}
                </li>
              </ul>

            </section>


            {/* =============================================
                HOW WE USE INFORMATION
            ============================================== */}

            <section
              id="use"
              className="legal-section"
            >

              <div className="legal-section-icon">
                <Eye size={21} />
              </div>

              <span className="legal-section-number">
                02
              </span>

              <h2>
                {t("privacy.useTitle")}
              </h2>

              <p>
                {t("privacy.useDescription")}
              </p>

              <ul>
                <li>
                  {t("privacy.useAccounts")}
                </li>

                <li>
                  {t("privacy.usePublishing")}
                </li>

                <li>
                  {t("privacy.usePersonalization")}
                </li>

                <li>
                  {t("privacy.useSecurity")}
                </li>

                <li>
                  {t("privacy.useImprovement")}
                </li>
              </ul>

            </section>


            {/* =============================================
                WRITINGS
            ============================================== */}

            <section
              id="writings"
              className="legal-section legal-highlight-section"
            >

              <div className="legal-section-icon">
                <BookOpen size={21} />
              </div>

              <span className="legal-section-number">
                03
              </span>

              <h2>
                {t("privacy.writingsTitle")}
              </h2>

              <p>
                {t("privacy.writingsDescription")}
              </p>


              <div className="legal-note">

                <strong>
                  {t("privacy.originalVoiceTitle")}
                </strong>

                <p>
                  {t("privacy.originalVoiceDescription")}
                </p>

              </div>

            </section>


            {/* =============================================
                SECURITY
            ============================================== */}

            <section
              id="security"
              className="legal-section"
            >

              <div className="legal-section-icon">
                <FileLock2 size={21} />
              </div>

              <span className="legal-section-number">
                04
              </span>

              <h2>
                {t("privacy.securityTitle")}
              </h2>

              <p>
                {t("privacy.securityDescription")}
              </p>

              <p>
                {t("privacy.passwordDescription")}
              </p>

            </section>


            {/* =============================================
                CHOICES
            ============================================== */}

            <section
              id="choices"
              className="legal-section"
            >

              <div className="legal-section-icon">
                <UserCheck size={21} />
              </div>

              <span className="legal-section-number">
                05
              </span>

              <h2>
                {t("privacy.choicesTitle")}
              </h2>

              <p>
                {t("privacy.choicesDescription")}
              </p>

              <ul>
                <li>
                  {t("privacy.choiceDraft")}
                </li>

                <li>
                  {t("privacy.choiceEdit")}
                </li>

                <li>
                  {t("privacy.choiceDelete")}
                </li>

                <li>
                  {t("privacy.choiceLanguage")}
                </li>
              </ul>

            </section>


            {/* =============================================
                THIRD PARTY
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                06
              </span>

              <h2>
                {t("privacy.thirdPartyTitle")}
              </h2>

              <p>
                {t("privacy.thirdPartyDescription")}
              </p>

            </section>


            {/* =============================================
                CHILDREN
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                07
              </span>

              <h2>
                {t("privacy.childrenTitle")}
              </h2>

              <p>
                {t("privacy.childrenDescription")}
              </p>

            </section>


            {/* =============================================
                CHANGES
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                08
              </span>

              <h2>
                {t("privacy.changesTitle")}
              </h2>

              <p>
                {t("privacy.changesDescription")}
              </p>

            </section>


            {/* =============================================
                CONTACT
            ============================================== */}

            <section
              id="contact"
              className="legal-section legal-contact-section"
            >

              <div className="legal-section-icon">
                <Mail size={21} />
              </div>

              <span className="legal-section-number">
                09
              </span>

              <h2>
                {t("privacy.contactTitle")}
              </h2>

              <p>
                {t("privacy.contactDescription")}
              </p>

            </section>


            {/* =============================================
                BOTTOM NAVIGATION
            ============================================== */}

            <div className="legal-bottom-navigation">

              <Link
                to="/"
                className="legal-back-link"
              >

                <ArrowLeft size={16} />

                {t("privacy.backHome")}

              </Link>


              <Link
                to="/terms"
                className="legal-next-link"
              >

                {t("privacy.readTerms")}

                <ArrowLeft
                  size={16}
                  className="legal-arrow-forward"
                />

              </Link>

            </div>

          </article>

        </div>

      </section>

    </main>
  );

}


export default Privacy;