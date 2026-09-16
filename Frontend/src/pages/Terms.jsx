import {
  BookOpen,
  FileCheck2,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

import "./legal.css";


function Terms() {

  return (

    <main className="legal-page">

      <section className="legal-hero">

        <div className="legal-badge">

          <Scale size={16} />

          SHOBDO Legal

        </div>


        <h1>
          Terms of Service
        </h1>


        <p>
          These Terms describe the rules for accessing
          and using SHOBDO and its publishing and
          community features.
        </p>


        <div className="legal-updated">
          Last updated: 17 September 2026
        </div>

      </section>


      <section className="legal-container">

        <article className="legal-card">

          <div className="legal-icon-title">

            <FileCheck2 size={20} />

            <h2>
              1. Acceptance of these terms
            </h2>

          </div>

          <p>
            By creating an account or using SHOBDO,
            you agree to follow these Terms and
            applicable laws and regulations.
          </p>

          <p>
            If you do not agree with these Terms,
            you should not use the service.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <Users size={20} />

            <h2>
              2. Accounts
            </h2>

          </div>

          <p>
            You are responsible for maintaining the
            security of your account and for activity
            performed through it.
          </p>

          <p>
            Information provided when creating or
            maintaining an account should be accurate
            and should not impersonate another person.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            3. Google and Facebook authentication
          </h2>

          <p>
            SHOBDO may allow users to authenticate
            through supported third-party identity
            providers.
          </p>

          <p>
            Use of those services may also be subject
            to the provider&apos;s own terms and
            policies.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <BookOpen size={20} />

            <h2>
              4. User content
            </h2>

          </div>

          <p>
            You remain responsible for content you
            upload, publish or share through SHOBDO.
          </p>

          <p>
            You should only publish material you have
            the right to publish and must respect the
            rights of other people.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            5. Prohibited use
          </h2>

          <p>
            You must not use SHOBDO to unlawfully
            access accounts or systems, distribute
            malicious software, intentionally disrupt
            the service, impersonate others, violate
            intellectual-property rights, or engage
            in unlawful activity.
          </p>

        </article>


        <article className="legal-card">

          <div className="legal-icon-title">

            <ShieldCheck size={20} />

            <h2>
              6. Moderation
            </h2>

          </div>

          <p>
            SHOBDO may restrict or remove content or
            accounts where reasonably necessary to
            enforce platform rules, protect users,
            maintain security or comply with applicable
            requirements.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            7. Service availability
          </h2>

          <p>
            SHOBDO may change, improve, temporarily
            interrupt or discontinue features as the
            service develops.
          </p>

          <p>
            Continuous or error-free availability
            cannot be guaranteed.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            8. Account termination
          </h2>

          <p>
            Access may be restricted where an account
            violates these Terms, presents a security
            risk or must be restricted to comply with
            applicable requirements.
          </p>

        </article>


        <article className="legal-card">

          <h2>
            9. Privacy
          </h2>

          <p>
            Our handling of personal information is
            described in the SHOBDO Privacy Policy.
          </p>


          <a
            className="legal-action"
            href="/privacy"
          >
            Read Privacy Policy
          </a>

        </article>


        <article className="legal-card">

          <h2>
            10. Changes to these terms
          </h2>

          <p>
            These Terms may be updated as SHOBDO
            develops. The latest version will be
            published on this page with its updated
            date.
          </p>

        </article>

      </section>

    </main>

  );

}


export default Terms;