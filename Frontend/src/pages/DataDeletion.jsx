import {
  CheckCircle2,
  Clock3,
  Database,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import "./legal.css";


const SUPPORT_EMAIL =
  String(
    import.meta.env.VITE_SUPPORT_EMAIL ||
    ""
  ).trim();


function DataDeletion() {

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


  return (

    <main className="legal-page">

      <section className="legal-hero">

        <div className="legal-badge">

          <Trash2 size={16} />

          Privacy & Data Control

        </div>


        <h1>
          User Data Deletion
        </h1>


        <p>
          SHOBDO users can request deletion of their
          account and associated personal information.
        </p>


        <div className="legal-updated">
          Last updated: 17 September 2026
        </div>

      </section>


      <section className="legal-container">


        <article className="legal-card">

          <div className="legal-icon-title">

            <ShieldCheck size={20} />

            <h2>
              How to request deletion
            </h2>

          </div>


          <p>
            If you signed in to SHOBDO using Google,
            Facebook or an email and password, you may
            request deletion of the SHOBDO account
            associated with your email address.
          </p>


          {deletionMailLink ? (

            <a
              className="legal-action legal-danger-action"
              href={
                deletionMailLink
              }
            >
              <Trash2 size={17} />

              Request Data Deletion
            </a>

          ) : (

            <div className="legal-notice">

              Configure a SHOBDO support email using
              the <strong>VITE_SUPPORT_EMAIL</strong>{" "}
              environment variable to enable the
              direct deletion-request button.

            </div>

          )}

        </article>


        <article className="legal-card">

          <h2>
            Information to include
          </h2>

          <p>
            Your request should include the email
            address associated with your SHOBDO
            account.
          </p>

          <p>
            For security, SHOBDO may ask you to verify
            that you control the relevant account before
            deletion is processed.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <Database size={20} />

            <h2>
              What will be deleted
            </h2>

          </div>

          <p>
            Subject to applicable requirements and
            technical dependencies, account deletion
            may include personal account information
            such as your name, email address, profile
            information and linked social-login
            identifiers.
          </p>

          <p>
            Content and activity associated with the
            account may also be deleted or anonymized
            as appropriate.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            Facebook Login users
          </h2>

          <p>
            If you used Facebook Login with SHOBDO,
            requesting deletion through this page also
            requests deletion of the Facebook-linked
            identity information stored by SHOBDO.
          </p>

          <p>
            Removing SHOBDO from your Facebook account
            does not necessarily remove information
            already stored by SHOBDO, so you should
            also submit a deletion request here when
            you want your SHOBDO account data removed.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <Clock3 size={20} />

            <h2>
              Processing
            </h2>

          </div>

          <p>
            SHOBDO will review valid deletion requests
            and process them within a reasonable period,
            subject to account verification and any
            information that must be retained for
            legitimate security, legal or operational
            reasons.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <CheckCircle2 size={20} />

            <h2>
              Confirmation
            </h2>

          </div>

          <p>
            Where practical, confirmation will be
            provided after a verified deletion request
            has been processed.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            Privacy Policy
          </h2>

          <p>
            For additional information about how SHOBDO
            handles personal information, read our
            Privacy Policy.
          </p>


          <a
            className="legal-action"
            href="/privacy"
          >
            Read Privacy Policy
          </a>

        </article>

      </section>

    </main>

  );

}


export default DataDeletion;