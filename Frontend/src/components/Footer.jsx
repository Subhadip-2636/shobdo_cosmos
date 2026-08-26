import {
  Feather,
  Heart,
  Mail,
  MapPin,
  User,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";


function Footer() {

  const {
    t,
  } = useLanguage();


  const currentYear =
    new Date().getFullYear();


  // =====================================================
  // CONTACT DETAILS
  // =====================================================
  //
  // Replace these with your real public details.
  // =====================================================

  const contact = {
    email:
      "YOUR_REAL_EMAIL_HERE",

    location:
      "West Bengal, India",

    developer:
      "Subhadip Patra",
  };


  const hasRealEmail =
    contact.email &&
    contact.email !==
      "YOUR_REAL_EMAIL_HERE";


  return (
    <footer className="professional-footer">

      <div className="professional-footer-shell">


        {/* =================================================
            MAIN FOOTER GRID
        ================================================== */}

        <div className="professional-footer-grid">


          {/* ===============================================
              BRAND
          ================================================ */}

          <section className="footer-brand-column">

            <Link
              to="/"
              className="footer-brand-logo"
            >

              <span className="footer-brand-symbol">

                <Feather
                  size={22}
                />

              </span>


              <div className="footer-brand-copy">

                <strong>
                  SHOBDO
                </strong>

                <small>
                  শব্দ
                </small>

              </div>

            </Link>


            <p className="footer-brand-tagline">

              {t(
                "footer.tagline"
              )}

            </p>


            <p className="footer-brand-description">

              {t(
                "footer.description"
              )}

            </p>


            {/* EMAIL ICON */}

            {hasRealEmail && (

              <div className="footer-social-links">

                <a
                  href={
                    `mailto:${contact.email}`
                  }

                  aria-label={
                    t(
                      "footer.email"
                    )
                  }

                  title={
                    contact.email
                  }
                >

                  <Mail
                    size={17}
                  />

                </a>

              </div>

            )}

          </section>


          {/* ===============================================
              NAVIGATION
          ================================================ */}

          <section className="footer-link-column">

            <h3>

              {t(
                "footer.navigation"
              )}

            </h3>


            <Link to="/">

              {t(
                "footer.home"
              )}

            </Link>


            <Link to="/explore">

              {t(
                "footer.explore"
              )}

            </Link>


            <Link to="/write">

              {t(
                "footer.write"
              )}

            </Link>


            <Link to="/my-writings">

              {t(
                "footer.myWritings"
              )}

            </Link>

          </section>


          {/* ===============================================
              COMMUNITY / LEGAL
          ================================================ */}

          <section className="footer-link-column">

            <h3>

              {t(
                "footer.community"
              )}

            </h3>


            <Link to="/about">

              {t(
                "footer.about"
              )}

            </Link>


            <Link to="/privacy">

              {t(
                "footer.privacy"
              )}

            </Link>


            <Link to="/terms">

              {t(
                "footer.terms"
              )}

            </Link>


            <Link to="/register">

              {t(
                "footer.register"
              )}

            </Link>

          </section>


          {/* ===============================================
              CONTACT
          ================================================ */}

          <section className="footer-contact-column">

            <h3>

              {t(
                "footer.contact"
              )}

            </h3>


            {/* EMAIL */}

            {hasRealEmail && (

              <a
                href={
                  `mailto:${contact.email}`
                }

                className="footer-contact-item"
              >

                <span className="footer-contact-icon">

                  <Mail
                    size={16}
                  />

                </span>


                <div>

                  <small>

                    {t(
                      "footer.email"
                    )}

                  </small>

                  <strong>

                    {
                      contact.email
                    }

                  </strong>

                </div>

              </a>

            )}


            {/* LOCATION */}

            <div className="footer-contact-item">

              <span className="footer-contact-icon">

                <MapPin
                  size={16}
                />

              </span>


              <div>

                <small>

                  {t(
                    "footer.location"
                  )}

                </small>


                <strong>

                  {
                    contact.location
                  }

                </strong>

              </div>

            </div>


            {/* DEVELOPER */}

            <div className="footer-contact-item">

              <span className="footer-contact-icon">

                <User
                  size={16}
                />

              </span>


              <div>

                <small>

                  {t(
                    "footer.developedBy"
                  )}

                </small>


                <strong>

                  {
                    contact.developer
                  }

                </strong>

              </div>

            </div>

          </section>

        </div>


        {/* =================================================
            DIVIDER
        ================================================== */}

        <div className="professional-footer-divider" />


        {/* =================================================
            BOTTOM BAR
        ================================================== */}

        <div className="professional-footer-bottom">


          <p>

            © {currentYear}{" "}

            {t(
              "footer.copyright"
            )}

          </p>


          <div className="professional-footer-signature">

            <span>

              {t(
                "footer.madeWith"
              )}

            </span>


            <Heart
              size={13}
              fill="currentColor"
            />


            <span>

              {t(
                "footer.forWriters"
              )}

            </span>

          </div>

        </div>

      </div>

    </footer>
  );

}


export default Footer;