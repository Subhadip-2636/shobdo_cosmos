import {
  BookOpen,
  FileCheck2,
  Globe2,
  KeyRound,
  Scale,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  Users,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useLanguage,
} from "../Language/LanguageContext";


import SEO from "../components/SEO";

import "./legal.css";


// =========================================================
// TERMS OF SERVICE
// =========================================================

function Terms() {

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
        title="Terms of Service"
        description="Read the terms governing accounts, publishing, community participation, user content and use of the SHOBDO platform."
        path="/terms"
        type="website"
      />


      <main
        className="legal-page"
      >


        {/* =================================================
            HERO
        ================================================== */}

        <section
          className="legal-hero"
        >

          <div
            className="legal-badge"
          >

            <Scale
              size={16}
            />

            {
              translate(
                "terms.badge",
                "SHOBDO Legal"
              )
            }

          </div>


          <h1>

            {
              translate(
                "terms.title",
                "Terms of Service"
              )
            }

          </h1>


          <p>

            {
              translate(
                "terms.description",
                "These Terms describe the rules and conditions for accessing and using SHOBDO, including its publishing, profile and community features."
              )
            }

          </p>


          <div
            className="legal-updated"
          >

            {
              translate(
                "terms.lastUpdated",
                "Last updated: 19 September 2026"
              )
            }

          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================== */}

        <section
          className="legal-container"
        >


          {/* =================================================
              SUMMARY
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Scale
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.summaryTitle",
                    "Terms at a glance"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.summaryDescription",
                  "SHOBDO is a community for publishing, reading and interacting with creative work. Users are responsible for their accounts and content, must respect other people and their rights, and must not misuse the platform."
                )
              }

            </p>

          </article>


          {/* =================================================
              1. ACCEPTANCE
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <FileCheck2
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.acceptanceTitle",
                    "1. Acceptance of these Terms"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.acceptanceDescription",
                  "By accessing SHOBDO, creating an account or using its services, you agree to follow these Terms and any laws or regulations that apply to your use of the platform."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.acceptanceDecline",
                  "If you do not agree with these Terms, you should not create an account or continue using SHOBDO."
                )
              }

            </p>

          </article>


          {/* =================================================
              2. ELIGIBILITY
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <UserRoundCheck
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.eligibilityTitle",
                    "2. Eligibility"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.eligibilityDescription",
                  "You must satisfy any minimum age and legal capacity requirements that apply to you in order to use SHOBDO or create an account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.eligibilityProviders",
                  "If you use a third-party authentication provider, you must also satisfy that provider's applicable account and age requirements."
                )
              }

            </p>

          </article>


          {/* =================================================
              3. ACCOUNTS
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Users
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.accountsTitle",
                    "3. Accounts"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.accountsSecurity",
                  "You are responsible for maintaining the security of your account and for activity performed through your account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.accountsAccuracy",
                  "Information you provide when creating or maintaining an account should be accurate and should not intentionally impersonate another person or organization."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.accountsCredentials",
                  "You should keep your login credentials private and notify SHOBDO through the available support channel if you believe your account has been accessed without authorization."
                )
              }

            </p>

          </article>


          {/* =================================================
              4. THIRD-PARTY AUTHENTICATION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <KeyRound
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.authenticationTitle",
                    "4. Third-party authentication"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.authenticationDescription",
                  "SHOBDO may allow users to authenticate through supported third-party identity providers such as Google or Facebook."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.authenticationProviders",
                  "Use of those services may also be subject to the provider's own terms, privacy policies and account requirements."
                )
              }

            </p>

          </article>


          {/* =================================================
              5. YOUR CONTENT
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <BookOpen
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.contentTitle",
                    "5. Your content"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.contentResponsibility",
                  "You remain responsible for writings, comments, artwork, documents, profile information and other material that you upload, publish or share through SHOBDO."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.contentRights",
                  "You should only upload or publish material that you own or otherwise have permission or legal authority to use."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.contentRespect",
                  "You are responsible for respecting copyright, privacy, personality, intellectual-property and other rights belonging to other people."
                )
              }

            </p>

          </article>


          {/* =================================================
              6. CONTENT LICENSE
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.licenseTitle",
                  "6. Permission needed to operate the platform"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.licenseOwnership",
                  "You retain ownership of content that you own."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.licenseDescription",
                  "When you publish content through SHOBDO, you permit SHOBDO to host, store, reproduce and display that content as reasonably necessary to provide the platform and make the content available according to the visibility you selected."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.licensePurpose",
                  "This permission is intended to allow SHOBDO to technically operate and present your content and does not transfer ownership of your original work to SHOBDO."
                )
              }

            </p>

          </article>


          {/* =================================================
              7. PUBLIC CONTENT
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Globe2
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.publicContentTitle",
                    "7. Public content"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.publicContentDescription",
                  "Content that you publish publicly may be viewed by other SHOBDO users and visitors and may be shared using the platform's available sharing features."
                )
              }

            </p>


            <div
              className="legal-notice"
            >

              {
                translate(
                  "terms.publicContentNotice",
                  "Consider carefully before publishing information or material that you do not want to be publicly accessible."
                )
              }

            </div>

          </article>


          {/* =================================================
              8. PROHIBITED USE
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <ShieldCheck
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.prohibitedTitle",
                    "8. Prohibited use"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.prohibitedIntro",
                  "You must not misuse SHOBDO. Prohibited conduct includes using the platform to:"
                )
              }

            </p>


            <ul>

              <li>

                {
                  translate(
                    "terms.prohibitedOne",
                    "gain unauthorized access to another person's account, data or computer system;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "terms.prohibitedTwo",
                    "distribute malware, harmful code or other malicious software;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "terms.prohibitedThree",
                    "intentionally interfere with, overload, attack or disrupt the service;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "terms.prohibitedFour",
                    "impersonate another person or misrepresent your identity in a deceptive manner;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "terms.prohibitedFive",
                    "publish material that unlawfully violates another person's intellectual-property, privacy or other legal rights;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "terms.prohibitedSix",
                    "use SHOBDO for activity that is unlawful under applicable law."
                  )
                }

              </li>

            </ul>

          </article>


          {/* =================================================
              9. COMMUNITY SAFETY / MODERATION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <ShieldCheck
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.moderationTitle",
                    "9. Community safety and moderation"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.moderationDescription",
                  "SHOBDO may review reports and may restrict, hide or remove content or accounts where reasonably necessary to enforce platform rules, protect users, address security concerns or comply with applicable requirements."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.moderationNoGuarantee",
                  "Moderation systems may not identify every inappropriate or unlawful item immediately, and the availability of moderation does not remove each user's responsibility for their own conduct."
                )
              }

            </p>

          </article>


          {/* =================================================
              10. SERVICE AVAILABILITY
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.availabilityTitle",
                  "10. Service availability"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.availabilityDescription",
                  "SHOBDO may add, change, improve, temporarily interrupt or discontinue features as the service develops."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.availabilityGuarantee",
                  "Continuous, uninterrupted or error-free availability cannot be guaranteed."
                )
              }

            </p>

          </article>


          {/* =================================================
              11. PLATFORM PROPERTY
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.platformPropertyTitle",
                  "11. SHOBDO platform and branding"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.platformPropertyDescription",
                  "The SHOBDO name, branding, interface, software and platform materials may be protected by intellectual-property rights. These Terms do not grant permission to copy or misuse SHOBDO branding or proprietary platform materials."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.platformPropertyUserContent",
                  "This section does not claim ownership of original user content merely because it is published through SHOBDO."
                )
              }

            </p>

          </article>


          {/* =================================================
              12. ACCOUNT RESTRICTION
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.restrictionTitle",
                  "12. Account restriction or termination"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.restrictionDescription",
                  "Access to some or all of SHOBDO may be restricted where an account materially violates these Terms, creates a security risk, abuses the platform or must be restricted to comply with applicable requirements."
                )
              }

            </p>

          </article>


          {/* =================================================
              13. LEAVING SHOBDO
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Trash2
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.deletionTitle",
                    "13. Leaving SHOBDO"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.deletionDescription",
                  "You may request deletion of your SHOBDO account through the data deletion process made available by the platform."
                )
              }

            </p>


            <Link
              to="/data-deletion"
              className="legal-action"
            >

              <Trash2
                size={15}
              />

              {
                translate(
                  "terms.deletionAction",
                  "View Data Deletion"
                )
              }

            </Link>

          </article>


          {/* =================================================
              14. THIRD-PARTY SERVICES
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Globe2
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.thirdPartyTitle",
                    "14. Third-party services"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.thirdPartyDescription",
                  "SHOBDO may use or link to third-party services, including authentication, hosting, database, media or infrastructure providers."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.thirdPartyResponsibility",
                  "Those services may be governed by their own terms and policies, and SHOBDO does not control every aspect of third-party services."
                )
              }

            </p>

          </article>


          {/* =================================================
              15. SERVICE DISCLAIMER
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.disclaimerTitle",
                  "15. Service disclaimer"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.disclaimerDescription",
                  "SHOBDO is provided as an online publishing and community service. Features may contain errors, experience downtime or change as the platform develops."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.disclaimerUserContent",
                  "Views, opinions and statements published by users belong to those users and do not automatically represent SHOBDO."
                )
              }

            </p>

          </article>


          {/* =================================================
              16. PRIVACY
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <ShieldCheck
                size={20}
              />

              <h2>

                {
                  translate(
                    "terms.privacyTitle",
                    "16. Privacy"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "terms.privacyDescription",
                  "Information about how SHOBDO handles personal information is provided in the Privacy Policy."
                )
              }

            </p>


            <Link
              className="legal-action"
              to="/privacy"
            >

              <ShieldCheck
                size={15}
              />

              {
                translate(
                  "terms.privacyAction",
                  "Read Privacy Policy"
                )
              }

            </Link>

          </article>


          {/* =================================================
              17. CHANGES
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "terms.changesTitle",
                  "17. Changes to these Terms"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "terms.changesDescription",
                  "These Terms may be updated as SHOBDO develops, introduces new functionality or changes its practices. The current revision date will be shown near the top of this page."
                )
              }

            </p>


            <p>

              {
                translate(
                  "terms.changesContinuedUse",
                  "Where appropriate, continuing to use SHOBDO after updated Terms become effective may constitute acceptance of the updated Terms."
                )
              }

            </p>

          </article>


          {/* =================================================
              RELATED POLICIES
          ================================================== */}

          <div
            className="legal-related"
          >

            <span>

              {
                translate(
                  "terms.related",
                  "Related"
                )
              }

            </span>


            <Link
              to="/privacy"
            >

              {
                translate(
                  "footer.privacy",
                  "Privacy Policy"
                )
              }

            </Link>


            <Link
              to="/data-deletion"
            >

              {
                translate(
                  "footer.dataDeletion",
                  "Data Deletion"
                )
              }

            </Link>


            <Link
              to="/about"
            >

              {
                translate(
                  "footer.about",
                  "About SHOBDO"
                )
              }

            </Link>

          </div>


        </section>


      </main>

    </>

  );

}


export default Terms;