import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  FileCheck2,
  FileText,
  Gavel,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";


function Terms() {

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

            <Gavel
              size={34}
            />

          </div>


          <div className="legal-hero-copy">

            <span className="legal-eyebrow">

              {t(
                "terms.eyebrow",
                "TERMS OF USE"
              )}

            </span>


            <h1>

              {t(
                "terms.title",
                "Simple terms for a respectful writing community."
              )}

            </h1>


            <p>

              {t(
                "terms.description",
                "These Terms of Use explain the rules that apply when you create an account, publish writing, interact with content, or otherwise use SHOBDO."
              )}

            </p>


            <div className="legal-meta">

              <span>

                {t(
                  "terms.lastUpdated",
                  "Last updated"
                )}

              </span>

              <strong>
                27 August 2026
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

                {t(
                  "terms.onThisPage",
                  "ON THIS PAGE"
                )}

              </span>


              <a href="#acceptance">

                {t(
                  "terms.acceptanceTitle",
                  "Acceptance of terms"
                )}

              </a>


              <a href="#accounts">

                {t(
                  "terms.accountsTitle",
                  "Accounts"
                )}

              </a>


              <a href="#content">

                {t(
                  "terms.contentTitle",
                  "Your content"
                )}

              </a>


              <a href="#conduct">

                {t(
                  "terms.conductTitle",
                  "Community conduct"
                )}

              </a>


              <a href="#moderation">

                {t(
                  "terms.moderationTitle",
                  "Moderation"
                )}

              </a>


              <a href="#availability">

                {t(
                  "terms.availabilityTitle",
                  "Service availability"
                )}

              </a>


              <a href="#contact">

                {t(
                  "terms.contactTitle",
                  "Contact"
                )}

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

                {t(
                  "terms.intro",
                  "SHOBDO is intended to be a respectful space for original writing, reading and literary expression. By using the platform, you agree to use it responsibly and in accordance with these terms."
                )}

              </p>

            </section>


            {/* =============================================
                ACCEPTANCE
            ============================================== */}

            <section
              id="acceptance"
              className="legal-section"
            >

              <div className="legal-section-icon">

                <FileCheck2
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                01
              </span>


              <h2>

                {t(
                  "terms.acceptanceTitle",
                  "Acceptance of these terms"
                )}

              </h2>


              <p>

                {t(
                  "terms.acceptanceDescription",
                  "By accessing or using SHOBDO, you agree to these Terms of Use and any policies that are linked from them. If you do not agree, you should not use the platform."
                )}

              </p>

            </section>


            {/* =============================================
                ACCOUNTS
            ============================================== */}

            <section
              id="accounts"
              className="legal-section"
            >

              <div className="legal-section-icon">

                <UserCheck
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                02
              </span>


              <h2>

                {t(
                  "terms.accountsTitle",
                  "Accounts and account security"
                )}

              </h2>


              <p>

                {t(
                  "terms.accountsDescription",
                  "Some SHOBDO features require an account. You are responsible for the information you provide and for keeping your login credentials secure."
                )}

              </p>


              <ul>

                <li>

                  {t(
                    "terms.accountAccurate",
                    "Provide accurate information when creating your account."
                  )}

                </li>

                <li>

                  {t(
                    "terms.accountSecure",
                    "Keep your password confidential and do not intentionally share access to your account."
                  )}

                </li>

                <li>

                  {t(
                    "terms.accountResponsibility",
                    "You are responsible for activity performed through your account unless unauthorized use is reported."
                  )}

                </li>

                <li>

                  {t(
                    "terms.accountMisuse",
                    "Do not create accounts for impersonation, abuse, fraud or disruption."
                  )}

                </li>

              </ul>

            </section>


            {/* =============================================
                YOUR CONTENT
            ============================================== */}

            <section
              id="content"
              className="legal-section legal-highlight-section"
            >

              <div className="legal-section-icon">

                <BookOpen
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                03
              </span>


              <h2>

                {t(
                  "terms.contentTitle",
                  "Your writings and ownership"
                )}

              </h2>


              <p>

                {t(
                  "terms.contentDescription",
                  "You remain responsible for the writing and other content you publish on SHOBDO. You should only publish content that you created or that you have the right to share."
                )}

              </p>


              <div className="legal-note">

                <strong>

                  {t(
                    "terms.ownershipTitle",
                    "Your words remain yours"
                  )}

                </strong>


                <p>

                  {t(
                    "terms.ownershipDescription",
                    "Publishing on SHOBDO does not transfer ownership of your original writing to the platform. SHOBDO only needs the practical permission required to store, display and deliver your published content through the service."
                  )}

                </p>

              </div>


              <ul>

                <li>

                  {t(
                    "terms.originalContent",
                    "Do not knowingly publish another person's writing as your own."
                  )}

                </li>

                <li>

                  {t(
                    "terms.rightsContent",
                    "Do not upload content that infringes copyright, privacy or other legal rights."
                  )}

                </li>

                <li>

                  {t(
                    "terms.contentResponsibility",
                    "You are responsible for the accuracy, legality and consequences of content you publish."
                  )}

                </li>

              </ul>

            </section>


            {/* =============================================
                COMMUNITY CONDUCT
            ============================================== */}

            <section
              id="conduct"
              className="legal-section"
            >

              <div className="legal-section-icon">

                <ShieldCheck
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                04
              </span>


              <h2>

                {t(
                  "terms.conductTitle",
                  "Community conduct"
                )}

              </h2>


              <p>

                {t(
                  "terms.conductDescription",
                  "SHOBDO is intended for constructive literary and cultural participation. Users should interact respectfully and should not use the service to harm other people or the platform."
                )}

              </p>


              <ul>

                <li>

                  {t(
                    "terms.noHarassment",
                    "Do not harass, threaten or intentionally target other users."
                  )}

                </li>

                <li>

                  {t(
                    "terms.noSpam",
                    "Do not use SHOBDO for spam, automated abuse or deceptive promotion."
                  )}

                </li>

                <li>

                  {t(
                    "terms.noMalware",
                    "Do not attempt to distribute malware or harmful code."
                  )}

                </li>

                <li>

                  {t(
                    "terms.noInterference",
                    "Do not attempt to interfere with the platform, its servers, authentication or security systems."
                  )}

                </li>

                <li>

                  {t(
                    "terms.noIllegalUse",
                    "Do not use the platform for unlawful activity."
                  )}

                </li>

              </ul>

            </section>


            {/* =============================================
                MODERATION
            ============================================== */}

            <section
              id="moderation"
              className="legal-section"
            >

              <div className="legal-section-icon">

                <AlertTriangle
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                05
              </span>


              <h2>

                {t(
                  "terms.moderationTitle",
                  "Moderation and removal"
                )}

              </h2>


              <p>

                {t(
                  "terms.moderationDescription",
                  "SHOBDO may review, restrict or remove content when reasonably necessary to enforce these terms, protect users, comply with law or maintain platform integrity."
                )}

              </p>


              <p>

                {t(
                  "terms.moderationFuture",
                  "As the platform develops, additional reporting and moderation tools may be introduced."
                )}

              </p>

            </section>


            {/* =============================================
                SERVICE AVAILABILITY
            ============================================== */}

            <section
              id="availability"
              className="legal-section"
            >

              <div className="legal-section-icon">

                <FileText
                  size={21}
                />

              </div>


              <span className="legal-section-number">
                06
              </span>


              <h2>

                {t(
                  "terms.availabilityTitle",
                  "Service availability and changes"
                )}

              </h2>


              <p>

                {t(
                  "terms.availabilityDescription",
                  "SHOBDO may change, improve, suspend or discontinue features as the service develops. Temporary interruptions may also occur because of maintenance, technical issues or infrastructure changes."
                )}

              </p>


              <p>

                {t(
                  "terms.noGuarantee",
                  "The platform is provided on an as-available basis. While reasonable efforts may be made to maintain reliability, uninterrupted availability cannot be guaranteed."
                )}

              </p>

            </section>


            {/* =============================================
                EXTERNAL SERVICES
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                07
              </span>


              <h2>

                {t(
                  "terms.externalTitle",
                  "External services and links"
                )}

              </h2>


              <p>

                {t(
                  "terms.externalDescription",
                  "SHOBDO may eventually link to or rely on third-party services. Those services operate under their own terms and policies, and SHOBDO does not control third-party websites or services."
                )}

              </p>

            </section>


            {/* =============================================
                LIABILITY
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                08
              </span>


              <h2>

                {t(
                  "terms.liabilityTitle",
                  "Responsibility and limitations"
                )}

              </h2>


              <p>

                {t(
                  "terms.liabilityDescription",
                  "Users are responsible for their own writings, account activity and interactions. SHOBDO is not responsible for every statement, opinion or piece of user-generated content published by users."
                )}

              </p>


              <p>

                {t(
                  "terms.backupDescription",
                  "Users should keep their own copies of important writings. A digital platform should not be treated as the only backup of valuable original work."
                )}

              </p>

            </section>


            {/* =============================================
                TERMINATION
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                09
              </span>


              <h2>

                {t(
                  "terms.terminationTitle",
                  "Restriction or termination"
                )}

              </h2>


              <p>

                {t(
                  "terms.terminationDescription",
                  "Access may be restricted or terminated where there is serious or repeated misuse of the service, security abuse, unlawful activity or violation of these terms."
                )}

              </p>

            </section>


            {/* =============================================
                CHANGES
            ============================================== */}

            <section className="legal-section">

              <span className="legal-section-number">
                10
              </span>


              <h2>

                {t(
                  "terms.changesTitle",
                  "Changes to these terms"
                )}

              </h2>


              <p>

                {t(
                  "terms.changesDescription",
                  "These Terms of Use may be updated as SHOBDO grows or introduces new functionality. The latest revision date will be shown at the top of this page."
                )}

              </p>

            </section>


            {/* =============================================
                CONTACT
            ============================================== */}

            <section
              id="contact"
              className="legal-section legal-contact-section"
            >

              <span className="legal-section-number">
                11
              </span>


              <h2>

                {t(
                  "terms.contactTitle",
                  "Questions about these terms"
                )}

              </h2>


              <p>

                {t(
                  "terms.contactDescription",
                  "If you have questions about these Terms of Use, use the official contact information published on the SHOBDO website."
                )}

              </p>

            </section>


            {/* =============================================
                BOTTOM NAVIGATION
            ============================================== */}

            <div className="legal-bottom-navigation">

              <Link
                to="/privacy"
                className="legal-back-link"
              >

                <ArrowLeft
                  size={16}
                />

                {t(
                  "terms.readPrivacy",
                  "Privacy Policy"
                )}

              </Link>


              <Link
                to="/"
                className="legal-next-link"
              >

                {t(
                  "terms.backHome",
                  "Back to Home"
                )}

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


export default Terms;