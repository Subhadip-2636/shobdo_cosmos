import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
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
// SUPPORT EMAIL
// =========================================================

const SUPPORT_EMAIL =
  String(
    import.meta.env.VITE_SUPPORT_EMAIL ||
    ""
  ).trim();


// =========================================================
// DATA DELETION
// =========================================================

function DataDeletion() {

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
  // EMAIL REQUEST
  // =======================================================

  const emailSubject =
    encodeURIComponent(
      "SHOBDO Account and Data Deletion Request"
    );


  const emailBody =
    encodeURIComponent(
      [
        "Hello SHOBDO Support,",
        "",
        "I would like to request deletion of my SHOBDO account and associated personal data.",
        "",
        "SHOBDO account email:",
        "",
        "Username (if known):",
        "",
        "Sign-in method:",
        "Email / Google / Facebook",
        "",
        "Please let me know if additional verification is required.",
        "",
        "Thank you.",
      ].join("\n")
    );


  const deletionMailLink =
    SUPPORT_EMAIL
      ? (
          `mailto:${SUPPORT_EMAIL}` +
          `?subject=${emailSubject}` +
          `&body=${emailBody}`
        )
      : null;


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <>

      {/* ===================================================
          SEO
      ==================================================== */}

      <SEO
        title="Account & Data Deletion"
        description="Learn how to request deletion of your SHOBDO account and associated personal information, including data linked to email, Google or Facebook sign-in."
        path="/data-deletion"
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

            <Trash2
              size={16}
            />

            {
              translate(
                "dataDeletion.badge",
                "Privacy & Data Control"
              )
            }

          </div>


          <h1>

            {
              translate(
                "dataDeletion.title",
                "Account & Data Deletion"
              )
            }

          </h1>


          <p>

            {
              translate(
                "dataDeletion.description",
                "SHOBDO users can request deletion of their account and associated personal information."
              )
            }

          </p>


          <div
            className="legal-updated"
          >

            {
              translate(
                "dataDeletion.lastUpdated",
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

              <ShieldCheck
                size={20}
              />

              <h2>

                {
                  translate(
                    "dataDeletion.summaryTitle",
                    "Your data, your choice"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.summaryDescription",
                  "If you no longer want to use SHOBDO, you may request deletion of your account and personal information associated with that account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.summaryImportant",
                  "For account security, SHOBDO may need to verify that the person requesting deletion controls the account concerned."
                )
              }

            </p>

          </article>


          {/* =================================================
              1. HOW TO REQUEST DELETION
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
                    "dataDeletion.requestTitle",
                    "1. How to request deletion"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.requestDescription",
                  "If you signed in to SHOBDO using email and password, Google, Facebook or another supported authentication method, you may request deletion of the SHOBDO account associated with your email address."
                )
              }

            </p>


            {
              deletionMailLink
                ? (

                    <a
                      className="legal-action legal-danger-action"
                      href={
                        deletionMailLink
                      }
                    >

                      <Trash2
                        size={15}
                      />

                      {
                        translate(
                          "dataDeletion.requestAction",
                          "Request Account Deletion"
                        )
                      }

                    </a>

                  )
                : (

                    <div
                      className="legal-notice"
                    >

                      {
                        translate(
                          "dataDeletion.supportUnavailable",
                          "A direct deletion-request button will appear here after the official SHOBDO support email is configured."
                        )
                      }


                      <br />


                      <strong>
                        VITE_SUPPORT_EMAIL
                      </strong>

                    </div>

                  )
            }

          </article>


          {/* =================================================
              2. INFORMATION TO INCLUDE
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
                    "dataDeletion.informationTitle",
                    "2. Information to include"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.informationDescription",
                  "To help identify the correct account, include the email address associated with your SHOBDO account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.informationOptional",
                  "You may also include your username and the authentication method you used, such as email, Google or Facebook."
                )
              }

            </p>


            <div
              className="legal-info-list"
            >

              <div
                className="legal-info-row"
              >

                <strong>

                  {
                    translate(
                      "dataDeletion.infoEmail",
                      "Account email"
                    )
                  }

                </strong>


                <span>

                  {
                    translate(
                      "dataDeletion.infoEmailDescription",
                      "The email address connected to your SHOBDO account."
                    )
                  }

                </span>

              </div>


              <div
                className="legal-info-row"
              >

                <strong>

                  {
                    translate(
                      "dataDeletion.infoUsername",
                      "Username"
                    )
                  }

                </strong>


                <span>

                  {
                    translate(
                      "dataDeletion.infoUsernameDescription",
                      "Your SHOBDO username, if you know it."
                    )
                  }

                </span>

              </div>


              <div
                className="legal-info-row"
              >

                <strong>

                  {
                    translate(
                      "dataDeletion.infoLogin",
                      "Sign-in method"
                    )
                  }

                </strong>


                <span>

                  {
                    translate(
                      "dataDeletion.infoLoginDescription",
                      "Email, Google, Facebook or another supported provider."
                    )
                  }

                </span>

              </div>

            </div>

          </article>


          {/* =================================================
              3. VERIFICATION
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
                    "dataDeletion.verificationTitle",
                    "3. Account verification"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.verificationDescription",
                  "Before processing a deletion request, SHOBDO may ask for reasonable verification to confirm that you control the relevant account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.verificationReason",
                  "Verification helps prevent another person from attempting to delete an account that does not belong to them."
                )
              }

            </p>

          </article>


          {/* =================================================
              4. WHAT MAY BE DELETED
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
                    "dataDeletion.deletedTitle",
                    "4. What may be deleted"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.deletedDescription",
                  "Subject to applicable requirements and technical dependencies, deletion may include personal account information associated with your SHOBDO account."
                )
              }

            </p>


            <ul>

              <li>

                {
                  translate(
                    "dataDeletion.deletedName",
                    "name and account identity information;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "dataDeletion.deletedEmail",
                    "email address and username;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "dataDeletion.deletedProfile",
                    "profile information and profile image references;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "dataDeletion.deletedSocial",
                    "stored third-party sign-in identifiers associated with the SHOBDO account;"
                  )
                }

              </li>


              <li>

                {
                  translate(
                    "dataDeletion.deletedActivity",
                    "account-related activity and other personal information where deletion is appropriate."
                  )
                }

              </li>

            </ul>

          </article>


          {/* =================================================
              5. WRITINGS AND COMMUNITY CONTENT
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
                    "dataDeletion.contentTitle",
                    "5. Writings and community content"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.contentDescription",
                  "Content associated with the account, such as writings, drafts, comments or other activity, may be deleted, disconnected from the account or anonymized where appropriate."
                )
              }

            </p>


            <div
              className="legal-notice"
            >

              {
                translate(
                  "dataDeletion.contentNotice",
                  "The exact treatment of content may depend on how the content is stored, technical dependencies and requirements that apply at the time of deletion."
                )
              }

            </div>

          </article>


          {/* =================================================
              6. FACEBOOK LOGIN
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "dataDeletion.facebookTitle",
                  "6. Facebook Login users"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "dataDeletion.facebookDescription",
                  "If you used Facebook Login with SHOBDO, a verified deletion request can include deletion of Facebook-linked identity information stored as part of your SHOBDO account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.facebookRemoval",
                  "Removing SHOBDO from your Facebook account does not necessarily remove information already stored within SHOBDO's own systems, so you should also use the SHOBDO deletion process when you want your SHOBDO account data deleted."
                )
              }

            </p>

          </article>


          {/* =================================================
              7. GOOGLE LOGIN
          ================================================== */}

          <article
            className="legal-card"
          >

            <h2>

              {
                translate(
                  "dataDeletion.googleTitle",
                  "7. Google Sign-In users"
                )
              }

            </h2>


            <p>

              {
                translate(
                  "dataDeletion.googleDescription",
                  "If your SHOBDO account was created using Google Sign-In, the deletion request applies to information stored by SHOBDO in connection with that account."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.googleAccount",
                  "Deleting a SHOBDO account does not delete your Google account or other unrelated information held by Google."
                )
              }

            </p>

          </article>


          {/* =================================================
              8. RETENTION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Clock3
                size={20}
              />

              <h2>

                {
                  translate(
                    "dataDeletion.retentionTitle",
                    "8. Retention after a deletion request"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.retentionDescription",
                  "Some limited information may need to remain temporarily in backups, logs or technical systems after an account is deleted."
                )
              }

            </p>


            <p>

              {
                translate(
                  "dataDeletion.retentionReason",
                  "Certain information may also be retained where reasonably necessary for security, fraud prevention, dispute handling, legal compliance or other legitimate operational requirements."
                )
              }

            </p>

          </article>


          {/* =================================================
              9. PROCESSING
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <Clock3
                size={20}
              />

              <h2>

                {
                  translate(
                    "dataDeletion.processingTitle",
                    "9. Processing the request"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.processingDescription",
                  "SHOBDO will review valid deletion requests and process them within a reasonable period, subject to account verification, technical requirements and any information that must legitimately be retained."
                )
              }

            </p>

          </article>


          {/* =================================================
              10. CONFIRMATION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <CheckCircle2
                size={20}
              />

              <h2>

                {
                  translate(
                    "dataDeletion.confirmationTitle",
                    "10. Confirmation"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.confirmationDescription",
                  "Where practical, SHOBDO will provide confirmation after a verified deletion request has been processed."
                )
              }

            </p>

          </article>


          {/* =================================================
              11. BEFORE REQUESTING DELETION
          ================================================== */}

          <article
            className="legal-card"
          >

            <div
              className="legal-icon-title"
            >

              <AlertTriangle
                size={20}
              />

              <h2>

                {
                  translate(
                    "dataDeletion.warningTitle",
                    "11. Before requesting deletion"
                  )
                }

              </h2>

            </div>


            <p>

              {
                translate(
                  "dataDeletion.warningDescription",
                  "Account deletion may be irreversible. After deletion is completed, you may lose access to your profile, writings, saved content, followers, account history and other associated data."
                )
              }

            </p>


            <div
              className="legal-notice danger"
            >

              <strong>

                {
                  translate(
                    "dataDeletion.warningStrong",
                    "Important:"
                  )
                }

              </strong>

              {" "}

              {
                translate(
                  "dataDeletion.warningNotice",
                  "Save or export anything you want to keep before submitting a deletion request."
                )
              }

            </div>

          </article>


          {/* =================================================
              12. CONTACT
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
                    "dataDeletion.contactTitle",
                    "12. Contact"
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
                          "dataDeletion.contactPrefix",
                          "For deletion or privacy requests, contact"
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
                          "dataDeletion.contactFallback",
                          "A dedicated SHOBDO support email will be displayed here once it is configured for the public website."
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
                  "dataDeletion.related",
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


export default DataDeletion;