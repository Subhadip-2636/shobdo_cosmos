import {
  Database,
  Eye,
  FileText,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
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
// PUBLIC CONTACT
// =========================================================

const SUPPORT_EMAIL =
  String(
    import.meta.env.VITE_SUPPORT_EMAIL ||
    ""
  ).trim();


// =========================================================
// PRIVACY POLICY
// =========================================================

function Privacy() {

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
        title="Privacy Policy"
        description="Learn how SHOBDO handles account information, authentication data, public content, privacy requests and personal information."
        path="/privacy"
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

            <ShieldCheck
              size={16}
            />

            {
              translate(
                "privacy.badge",
                "SHOBDO Legal"
              )
            }

          </div>


          <h1>

            {
              translate(
                "privacy.title",
                "Privacy Policy"
              )
            }

          </h1>


          <p>

            {
              translate(
                "privacy.description",
                "This Privacy Policy explains how SHOBDO handles information when you use our website, account services, publishing tools and community features."
              )
            }

          </p>


          <div
            className="legal-updated"
          >

            {
              translate(
                "privacy.lastUpdated",
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
              PRIVACY SUMMARY
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
                    "privacy.summaryTitle",
                    "Privacy at a glance"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.summaryDescription",
                  "SHOBDO processes information needed to provide accounts, publishing, profiles and community features. Public content may be visible to other visitors, while authentication credentials and private security information are not intended to be publicly displayed."
                )
              }

            </p>

          </article>


          {/* =================================================
              1. INFORMATION WE COLLECT
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Database
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.informationTitle",
                    "1. Information we collect"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.informationAccount",
                  "Depending on the features you use, SHOBDO may process information such as your name, email address, username, profile information, profile image and account authentication information."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.informationContent",
                  "When you create or interact with content, SHOBDO may also store writings, drafts, comments, likes, follows, saved items, documents, artwork, notifications and related account activity."
                )
              }

            </p>

          </article>


          {/* =================================================
              2. ACCOUNT AUTHENTICATION
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
                    "privacy.authenticationTitle",
                    "2. Account authentication"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.authenticationDescription",
                  "When you create an account directly with SHOBDO, information required to identify and authenticate your account is processed so that you can securely access the platform."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.passwordDescription",
                  "Passwords should be stored using secure password-hashing mechanisms rather than as readable plain-text passwords."
                )
              }

            </p>

          </article>


          {/* =================================================
              3. SOCIAL LOGIN
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
                    "privacy.socialLoginTitle",
                    "3. Social sign-in"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.socialLoginDescription",
                  "SHOBDO may offer sign-in through third-party identity providers such as Google or Facebook."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.socialLoginInformation",
                  "When you choose a social sign-in option, SHOBDO may receive information made available by that provider, such as a provider-specific account identifier, your name, verified email address or profile image."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.socialLoginPassword",
                  "SHOBDO does not need your Google or Facebook password and does not intentionally store those provider passwords."
                )
              }

            </p>

          </article>


          {/* =================================================
              4. HOW INFORMATION IS USED
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <FileText
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.useTitle",
                    "4. How information is used"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.useDescription",
                  "Information may be used to create and operate accounts, authenticate users, provide profiles, publish content, deliver community interactions and notifications, maintain platform security and operate SHOBDO's services."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.useImprovement",
                  "Information may also be used where reasonably necessary to diagnose technical problems, prevent misuse and improve the reliability of the platform."
                )
              }

            </p>

          </article>


          {/* =================================================
              5. PUBLIC INFORMATION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Eye
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.publicTitle",
                    "5. Public information"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.publicDescription",
                  "Information you intentionally publish or make public may be visible to other SHOBDO users and visitors."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.publicExamples",
                  "This may include published writings, your public profile, display name, username, profile image, biography, public comments and other content intended for public viewing."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.privateCredentials",
                  "Password hashes, authentication tokens and private security credentials are not intended to be displayed as public profile information."
                )
              }

            </p>

          </article>


          {/* =================================================
              6. SECURITY
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <LockKeyhole
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.securityTitle",
                    "6. Security"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.securityDescription",
                  "SHOBDO uses technical and organizational measures intended to reduce unauthorized access, alteration, disclosure or loss of account information."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.securityLimit",
                  "No internet service or storage system can guarantee absolute security. Users should also protect their passwords, devices and account sessions."
                )
              }

            </p>

          </article>


          {/* =================================================
              7. THIRD-PARTY SERVICES
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
                    "privacy.thirdPartyTitle",
                    "7. Third-party services"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.thirdPartyDescription",
                  "SHOBDO may rely on third-party providers for services such as authentication, hosting, database infrastructure, media storage, deployment and other technical functionality."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.thirdPartyPolicies",
                  "Those providers may process information according to their own terms, privacy policies and agreements."
                )
              }

            </p>

          </article>


          {/* =================================================
              8. DATA RETENTION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Database
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.retentionTitle",
                    "8. Data retention"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.retentionDescription",
                  "Information may be retained for as long as reasonably necessary to operate your account, provide requested features, maintain security, resolve disputes or satisfy applicable legal obligations."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.retentionBackups",
                  "Some information may remain temporarily in backups, logs or technical systems after deletion where immediate removal is not technically practical or where retention is required for legitimate operational or legal reasons."
                )
              }

            </p>

          </article>


          {/* =================================================
              9. ACCOUNT AND DATA DELETION
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
                    "privacy.deletionTitle",
                    "9. Account and data deletion"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.deletionDescription",
                  "You may request deletion of your SHOBDO account and associated personal information through the data deletion process provided by the platform."
                )
              }

            </p>


            <Link
              className="legal-action"
              to="/data-deletion"
            >

              <Trash2
                size={15}
              />

              {
                translate(
                  "privacy.deletionAction",
                  "View Data Deletion Instructions"
                )
              }

            </Link>

          </article>


          {/* =================================================
              10. USER RIGHTS
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
                    "privacy.rightsTitle",
                    "10. Your choices and rights"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "privacy.rightsDescription",
                  "Depending on the laws that apply to you, you may have rights concerning your personal information, including rights to request access, correction or deletion of certain information."
                )
              }

            </p>


            <p>

              {
                translate(
                  "privacy.rightsProfile",
                  "Some account and profile information may also be updated directly through SHOBDO's available account settings."
                )
              }

            </p>

          </article>


          {/* =================================================
              11. CHILDREN AND MINIMUM AGE
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "privacy.childrenTitle",
                  "11. Children and minimum age"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "privacy.childrenDescription",
                  "Users must satisfy the minimum age requirements that apply in their jurisdiction and any age requirements imposed by third-party authentication providers they choose to use."
                )
              }

            </p>

          </article>


          {/* =================================================
              12. POLICY CHANGES
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "privacy.changesTitle",
                  "12. Changes to this Privacy Policy"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "privacy.changesDescription",
                  "This Privacy Policy may change as SHOBDO develops, introduces new features or updates its practices. The latest revision date will be shown near the top of this page."
                )
              }

            </p>

          </article>


          {/* =================================================
              13. CONTACT
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Mail
                size={20}
              />

              <h2>

                {
                  translate(
                    "privacy.contactTitle",
                    "13. Contact"
                  )
                }

              </h2>

            </div>


            {
              SUPPORT_EMAIL
                ? (

                    <p>

                      {
                        translate(
                          "privacy.contactPrefix",
                          "For privacy questions, account requests or data-related enquiries, contact"
                        )
                      }

                      {" "}

                      <a
                        href={
                          `mailto:${SUPPORT_EMAIL}`
                        }
                      >

                        {
                          SUPPORT_EMAIL
                        }

                      </a>.

                    </p>

                  )
                : (

                    <p>

                      {
                        translate(
                          "privacy.contactFallback",
                          "Privacy and data requests can be submitted through the official SHOBDO contact channel. A dedicated support email can be configured for the public website."
                        )
                      }

                    </p>

                  )
            }

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
                  "privacy.related",
                  "Related"
                )
              }

            </span>


            <Link
              to="/terms"
            >

              {
                translate(
                  "footer.terms",
                  "Terms of Service"
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


export default Privacy;