import {
  Database,
  Eye,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import "./legal.css";


const SUPPORT_EMAIL =
  String(
    import.meta.env.VITE_SUPPORT_EMAIL ||
    ""
  ).trim();


function Privacy() {

  return (

    <main className="legal-page">

      <section className="legal-hero">

        <div className="legal-badge">

          <ShieldCheck size={16} />

          SHOBDO Legal

        </div>


        <h1>
          Privacy Policy
        </h1>


        <p>
          This Privacy Policy explains how SHOBDO
          collects, uses and protects information when
          you use our website, authentication services
          and community features.
        </p>


        <div className="legal-updated">
          Last updated: 17 September 2026
        </div>

      </section>


      <section className="legal-container">

        <article className="legal-card">

          <h2>
            1. Information we collect
          </h2>

          <p>
            Depending on the features you use, SHOBDO
            may process information such as your name,
            email address, username, profile information,
            profile image and account authentication
            information.
          </p>

          <p>
            When you publish or interact with content,
            SHOBDO may also store writings, comments,
            likes, follows, artwork, documents,
            notifications and related activity.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <UserRoundCheck size={20} />

            <h2>
              2. Social sign-in
            </h2>

          </div>

          <p>
            SHOBDO may allow authentication through
            third-party identity providers such as
            Google or Facebook.
          </p>

          <p>
            When you choose social sign-in, we may
            receive information made available by that
            provider, such as your provider-specific
            account identifier, name, verified email
            address and profile image.
          </p>

          <p>
            SHOBDO does not require your Google or
            Facebook password and does not store those
            passwords.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <Database size={20} />

            <h2>
              3. How information is used
            </h2>

          </div>

          <p>
            Information may be used to operate your
            account, authenticate users, display public
            profiles, publish content, provide community
            interactions, deliver notifications, improve
            security and maintain the SHOBDO service.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <Eye size={20} />

            <h2>
              4. Public information
            </h2>

          </div>

          <p>
            Information you intentionally make public,
            including published writings, public profile
            information and other public content, may be
            visible to other visitors.
          </p>

          <p>
            Your password hash, authentication tokens
            and private security credentials are not
            intentionally displayed as public profile
            information.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <LockKeyhole size={20} />

            <h2>
              5. Security
            </h2>

          </div>

          <p>
            SHOBDO uses reasonable technical measures
            intended to protect accounts and data,
            including password hashing and authenticated
            API access.
          </p>

          <p>
            No online service can guarantee absolute
            security, so users should also protect their
            passwords, devices and account access.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            6. Third-party services
          </h2>

          <p>
            SHOBDO may rely on third-party infrastructure
            and services for authentication, hosting,
            database storage, media storage and related
            platform functionality.
          </p>

          <p>
            Those providers may process information
            according to their own applicable policies
            and agreements.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            7. Data retention and deletion
          </h2>

          <p>
            Information may be retained while necessary
            to operate your account, provide requested
            features, maintain security and satisfy
            applicable obligations.
          </p>

          <p>
            You may request deletion of your SHOBDO
            account and associated personal information
            through our Data Deletion page.
          </p>


          <a
            className="legal-action"
            href="/data-deletion"
          >
            View Data Deletion Instructions
          </a>

        </article>


        <article className="legal-card">

          <h2>
            8. Children
          </h2>

          <p>
            Users must comply with the minimum age
            requirements applicable to them and to any
            third-party authentication provider they use.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            9. Changes to this policy
          </h2>

          <p>
            This Privacy Policy may be updated as SHOBDO
            develops. Material changes may be reflected
            by updating the date shown on this page.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            10. Contact
          </h2>


          {SUPPORT_EMAIL ? (

            <p>

              Privacy questions or requests can be sent
              to{" "}

              <a
                href={
                  `mailto:${SUPPORT_EMAIL}`
                }
              >
                {SUPPORT_EMAIL}
              </a>.

            </p>

          ) : (

            <p>
              Privacy and data requests can be submitted
              through the official SHOBDO contact
              channel. A dedicated support email can
              also be configured for this website.
            </p>

          )}

        </article>

      </section>

    </main>

  );

}


export default Privacy;