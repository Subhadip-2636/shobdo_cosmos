import {
  ArrowRight,
  BookOpen,
  Heart,
  PenLine,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";
import WritingCard from "../components/WritingCard";

function Home({ writings = [], loading = false }) {
  const latestWritings = writings.slice(0, 6);

  const categories = [
    {
      name: "কবিতা",
      description: "শব্দে অনুভূতির ছন্দ",
      icon: "✦",
    },
    {
      name: "গল্প",
      description: "কল্পনা ও জীবনের কথা",
      icon: "⌘",
    },
    {
      name: "অনুভূতি",
      description: "মনের গভীরের কথা",
      icon: "♡",
    },
    {
      name: "প্রবন্ধ",
      description: "চিন্তা, বিশ্লেষণ ও মতামত",
      icon: "¶",
    },
  ];

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}

      <section className="home-hero">
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />

        <div className="home-container hero-content">

          <div className="hero-badge">
            <Sparkles size={15} />
            বাংলা সাহিত্য সম্প্রদায়
          </div>

          <h1 className="hero-title">
            তোমার শব্দ,
            <br />
            <span>তোমার গল্প।</span>
          </h1>

          <p className="hero-description">
            কবিতা, গল্প, অনুভূতি ও চিন্তার জন্য একটি মুক্ত বাংলা
            সাহিত্য প্ল্যাটফর্ম। লিখুন, পড়ুন এবং আপনার শব্দ পৌঁছে দিন
            আরও মানুষের কাছে।
          </p>

          <div className="hero-actions">

            <Link to="/write" className="btn btn-primary">
              <PenLine size={18} />
              লেখা শুরু করুন
            </Link>

            <Link to="/explore" className="btn btn-secondary">
              লেখা পড়ুন
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="hero-mini-info">
            <span>
              <BookOpen size={16} />
              স্বাধীনভাবে লিখুন
            </span>

            <span className="hero-dot">•</span>

            <span>
              <Heart size={16} />
              বাংলা সাহিত্যকে ভালোবাসুন
            </span>
          </div>

        </div>
      </section>


      {/* ================= CATEGORIES ================= */}

      <section className="home-section categories-section">

        <div className="home-container">

          <div className="section-header">

            <div>
              <span className="section-eyebrow">
                আবিষ্কার করুন
              </span>

              <h2>
                আপনার পছন্দের লেখা
              </h2>
            </div>

            <Link to="/explore" className="section-link">
              সব দেখুন
              <ArrowRight size={17} />
            </Link>

          </div>


          <div className="category-grid">

            {categories.map((category) => (

              <Link
                to={`/explore?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-card"
                key={category.name}
              >

                <div className="category-icon">
                  {category.icon}
                </div>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description}
                </p>

                <span className="category-arrow">
                  <ArrowRight size={18} />
                </span>

              </Link>

            ))}

          </div>

        </div>

      </section>


      {/* ================= LATEST WRITINGS ================= */}

      <section className="home-section writings-section">

        <div className="home-container">

          <div className="section-header">

            <div>
              <span className="section-eyebrow">
                নতুন প্রকাশনা
              </span>

              <h2>
                সর্বশেষ লেখা
              </h2>

              <p className="section-description">
                SHOBDO সম্প্রদায়ের নতুন কবিতা, গল্প এবং চিন্তা পড়ুন।
              </p>
            </div>

            <Link to="/explore" className="section-link">
              আরও পড়ুন
              <ArrowRight size={17} />
            </Link>

          </div>


          {/* Loading */}

          {loading && (

            <div className="writing-loading-grid">

              {[1, 2, 3].map((item) => (

                <div
                  className="writing-skeleton"
                  key={item}
                >
                  <div className="skeleton-line skeleton-small" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>

              ))}

            </div>

          )}


          {/* Writing List */}

          {!loading && latestWritings.length > 0 && (

            <div className="home-writing-grid">

              {latestWritings.map((writing) => (

                <WritingCard
                  key={writing.id}
                  writing={writing}
                />

              ))}

            </div>

          )}


          {/* Empty State */}

          {!loading && latestWritings.length === 0 && (

            <div className="empty-writings">

              <div className="empty-icon">
                <BookOpen size={28} />
              </div>

              <h3>
                এখনও কোনো লেখা প্রকাশিত হয়নি
              </h3>

              <p>
                SHOBDO-তে প্রথম লেখাটি আপনার হতে পারে।
              </p>

              <Link
                to="/write"
                className="btn btn-primary"
              >
                <PenLine size={17} />
                লেখা প্রকাশ করুন
              </Link>

            </div>

          )}

        </div>

      </section>


      {/* ================= QUOTE ================= */}

      <section className="literary-quote-section">

        <div className="home-container">

          <div className="literary-quote">

            <span className="quote-mark">
              “
            </span>

            <blockquote>
              প্রতিটি মানুষের ভেতরে একটি গল্প আছে।
              <br />
              শুধু প্রয়োজন তাকে শব্দ দেওয়ার।
            </blockquote>

            <div className="quote-line" />

            <span>
              SHOBDO
            </span>

          </div>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}

      <section className="home-section home-cta-section">

        <div className="home-container">

          <div className="home-cta-card">

            <div className="cta-content">

              <span className="section-eyebrow">
                আপনার গল্প শুরু হোক
              </span>

              <h2>
                আপনার শব্দ অপেক্ষা করছে
                <br />
                পাঠকের জন্য।
              </h2>

              <p>
                একটি কবিতা, একটি গল্প কিংবা একটি অনুভূতি —
                আজই SHOBDO-তে লিখে ফেলুন।
              </p>

            </div>


            <div className="cta-actions">

              <Link
                to="/write"
                className="btn cta-main-btn"
              >
                <PenLine size={18} />
                লেখা শুরু করুন
              </Link>

              <Link
                to="/register"
                className="cta-text-link"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;