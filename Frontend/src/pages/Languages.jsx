import {
  ArrowRight,
  BookOpen,
  Globe2,
  Languages as LanguagesIcon,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  LANGUAGES,
} from "../config/languages";


function Languages() {

  return (
    <main className="languages-page">

      <div className="languages-shell">


        {/* ===============================================
            HERO
        ================================================ */}

        <header className="languages-hero">

          <div className="languages-eyebrow">

            <Globe2 size={17} />

            <span>
              LANGUAGE COMMUNITIES
            </span>

          </div>


          <h1>
            নিজের ভাষায় লিখুন
          </h1>


          <p>
            বাংলা থেকে हिन्दी, தமிழ் থেকে తెలుగు —
            SHOBDO-তে নিজের আঞ্চলিক ভাষায়
            আপনার চিন্তা, গল্প, কবিতা ও অনুভূতি
            ভাগ করে নিন।
          </p>

        </header>


        {/* ===============================================
            FEATURE STRIP
        ================================================ */}

        <section className="languages-feature-strip">

          <div>

            <LanguagesIcon size={20} />

            <span>
              Multiple regional languages
            </span>

          </div>


          <div>

            <BookOpen size={20} />

            <span>
              One literary community
            </span>

          </div>

        </section>


        {/* ===============================================
            LANGUAGE GRID
        ================================================ */}

        <section className="languages-grid">

          {
            LANGUAGES.map(
              (language) => (

                <Link
                  key={
                    language.code
                  }

                  to={
                    `/languages/${language.code}`
                  }

                  className="language-card"
                >


                  <div className="language-card-top">

                    <span className="language-code">

                      {
                        language.code
                          .toUpperCase()
                      }

                    </span>


                    <ArrowRight
                      size={17}
                      className="language-arrow"
                    />

                  </div>


                  <div className="language-native">

                    {
                      language.nativeName
                    }

                  </div>


                  <div className="language-english">

                    {
                      language.name
                    }

                  </div>


                  <p>
                    এই ভাষায় লেখা,
                    গল্প, কবিতা এবং
                    অনুভূতি পড়ুন।
                  </p>

                </Link>

              )
            )
          }

        </section>


        {/* ===============================================
            CTA
        ================================================ */}

        <section className="languages-cta">

          <div>

            <p className="languages-cta-eyebrow">
              YOUR LANGUAGE. YOUR VOICE.
            </p>

            <h2>
              আপনার ভাষায় আপনার গল্প লিখুন
            </h2>

            <p>
              যে ভাষায় আপনি সবচেয়ে স্বচ্ছন্দ,
              সেই ভাষায় লিখুন এবং SHOBDO-র
              পাঠকদের সঙ্গে ভাগ করে নিন।
            </p>

          </div>


          <Link
            to="/write"
            className="languages-write-button"
          >

            লেখা শুরু করুন

            <ArrowRight size={17} />

          </Link>

        </section>

      </div>

    </main>
  );

}


export default Languages;