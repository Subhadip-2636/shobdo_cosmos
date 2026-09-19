import {
  BookOpen,
  Feather,
  Heart,
  LogIn,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useLanguage,
} from "../Language/LanguageContext";


import "./Footer.css";


// =========================================================
// FOOTER
// =========================================================

function Footer() {

  const {
    t,
  } = useLanguage();


  const currentYear =
    new Date().getFullYear();


  // =======================================================
  // TRANSLATION HELPER
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
  // PUBLIC CONTACT DETAILS
  // =======================================================
  //
  // Keep email empty until you have a real support email.
  // Do not publish a placeholder address.
  //
  // =======================================================

  const contact = {

    email: "",

    location:
      "West Bengal, India",

    developer:
      "Subhadip Patra",

  };


  const hasRealEmail =
    Boolean(
      contact.email
        ?.trim()
    );


  return (

    <footer
      className="professional-footer"
    >

      <div
        className="professional-footer-shell"
      >


        {/* =================================================
            MAIN FOOTER
        ================================================== */}

        <div
          className="professional-footer-grid"
        >


          {/* ===============================================
              BRAND
          ================================================ */}

          <section
            className="footer-brand-column"
          >

            <Link
              to="/"
              className="footer-brand-logo"
              aria-label="SHOBDO home"
            >

              <span
                className="footer-brand-symbol"
                aria-hidden="true"
              >

                <Feather
                  size={20}
                />

              </span>


              <span
                className="footer-brand-copy"
              >

                <strong>
                  SHOBDO
                </strong>

                <small>
                  শব্দ
                </small>

              </span>

            </Link>


            <p
              className="footer-brand-tagline"
            >

              {
                translate(
                  "footer.tagline",
                  "Every language deserves a place to be heard."
                )
              }

            </p>


            <p
              className="footer-brand-description"
            >

              {
                translate(
                  "footer.description",
                  "A multilingual community for writers, readers and creators to publish, discover and connect through words."
                )
              }

            </p>


            {/* =============================================
                BRAND LANGUAGES
            ============================================== */}

            <div
              className="footer-language-strip"
              aria-label="SHOBDO languages"
            >

              <span>
                বাংলা
              </span>

              <span>
                English
              </span>

              <span>
                हिन्दी
              </span>

              <span>
                + more
              </span>

            </div>


            {/* =============================================
                EMAIL SHORTCUT
            ============================================== */}

            {
              hasRealEmail && (

                <div
                  className="footer-social-links"
                >

                  <a
                    href={
                      `mailto:${contact.email}`
                    }
                    aria-label={
                      translate(
                        "footer.email",
                        "Email"
                      )
                    }
                    title={
                      contact.email
                    }
                  >

                    <Mail
                      size={16}
                    />

                  </a>

                </div>

              )
            }

          </section>


          {/* ===============================================
              DISCOVER
          ================================================ */}

          <section
            className="footer-link-column"
          >

            <h3>

              {
                translate(
                  "footer.navigation",
                  "Discover"
                )
              }

            </h3>


            <Link
              to="/"
            >

              <BookOpen
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.home",
                    "Home"
                  )
                }

              </span>

            </Link>


            <Link
              to="/explore"
            >

              <Feather
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.explore",
                    "Explore"
                  )
                }

              </span>

            </Link>


            <Link
              to="/search"
            >

              <Search
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.search",
                    "Search"
                  )
                }

              </span>

            </Link>


            <Link
              to="/write"
            >

              <Feather
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.write",
                    "Start writing"
                  )
                }

              </span>

            </Link>

          </section>


          {/* ===============================================
              COMMUNITY
          ================================================ */}

          <section
            className="footer-link-column"
          >

            <h3>

              {
                translate(
                  "footer.community",
                  "Community"
                )
              }

            </h3>


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


            <Link
              to="/register"
            >

              <UserPlus
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.register",
                    "Join SHOBDO"
                  )
                }

              </span>

            </Link>


            <Link
              to="/login"
            >

              <LogIn
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.login",
                    "Sign in"
                  )
                }

              </span>

            </Link>


            <Link
              to="/privacy"
            >

              {
                translate(
                  "footer.privacy",
                  "Privacy"
                )
              }

            </Link>


            <Link
              to="/terms"
            >

              {
                translate(
                  "footer.terms",
                  "Terms"
                )
              }

            </Link>


            <Link
              to="/data-deletion"
            >

              <ShieldCheck
                size={14}
              />

              <span>

                {
                  translate(
                    "footer.dataDeletion",
                    "Data deletion"
                  )
                }

              </span>

            </Link>

          </section>


          {/* ===============================================
              CONTACT
          ================================================ */}

          <section
            className="footer-contact-column"
          >

            <h3>

              {
                translate(
                  "footer.contact",
                  "SHOBDO"
                )
              }

            </h3>


            {/* =============================================
                LOCATION
            ============================================== */}

            <div
              className="footer-contact-item"
            >

              <span
                className="footer-contact-icon"
              >

                <MapPin
                  size={15}
                />

              </span>


              <div>

                <small>

                  {
                    translate(
                      "footer.location",
                      "Based in"
                    )
                  }

                </small>


                <strong>

                  {
                    contact.location
                  }

                </strong>

              </div>

            </div>


            {/* =============================================
                EMAIL
            ============================================== */}

            {
              hasRealEmail && (

                <a
                  href={
                    `mailto:${contact.email}`
                  }
                  className="footer-contact-item"
                >

                  <span
                    className="footer-contact-icon"
                  >

                    <Mail
                      size={15}
                    />

                  </span>


                  <div>

                    <small>

                      {
                        translate(
                          "footer.email",
                          "Email"
                        )
                      }

                    </small>


                    <strong>

                      {
                        contact.email
                      }

                    </strong>

                  </div>

                </a>

              )
            }


            {/* =============================================
                DEVELOPER
            ============================================== */}

            <div
              className="footer-contact-item"
            >

              <span
                className="footer-contact-icon"
              >

                <User
                  size={15}
                />

              </span>


              <div>

                <small>

                  {
                    translate(
                      "footer.developedBy",
                      "Developed by"
                    )
                  }

                </small>


                <strong>

                  {
                    contact.developer
                  }

                </strong>

              </div>

            </div>


            {/* =============================================
                COMMUNITY MESSAGE
            ============================================== */}

            <div
              className="footer-community-note"
            >

              <Feather
                size={15}
              />

              <p>

                {
                  translate(
                    "footer.communityMessage",
                    "Built for stories, poetry, ideas and voices across languages."
                  )
                }

              </p>

            </div>

          </section>

        </div>


        {/* =================================================
            DIVIDER
        ================================================== */}

        <div
          className="professional-footer-divider"
        />


        {/* =================================================
            BOTTOM BAR
        ================================================== */}

        <div
          className="professional-footer-bottom"
        >

          <div
            className="professional-footer-copyright"
          >

            <p>

              © {currentYear}{" "}

              {
                translate(
                  "footer.copyright",
                  "SHOBDO. All rights reserved."
                )
              }

            </p>


            <span>
              শব্দ • SHOBDO
            </span>

          </div>


          <div
            className="professional-footer-signature"
          >

            <span>

              {
                translate(
                  "footer.madeWith",
                  "Made with"
                )
              }

            </span>


            <Heart
              size={12}
              fill="currentColor"
            />


            <span>

              {
                translate(
                  "footer.forWriters",
                  "for writers and readers"
                )
              }

            </span>

          </div>

        </div>

      </div>

    </footer>

  );

}


export default Footer;