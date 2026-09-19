import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Feather,
  Globe2,
  Heart,
  Loader2,
  PenLine,
  Quote,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getWritings,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";

import "./PublicHome.css";

import SEO from "../components/SEO";


const PUBLIC_WRITING_LIMIT = 6;


// =========================================================
// NORMALIZE WRITINGS
// =========================================================

function normalizeWritings(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;
  }


  const candidates = [
    data?.writings,
    data?.items,
    data?.results,
    data?.data,
  ];


  for (
    const candidate
    of candidates
  ) {

    if (
      Array.isArray(
        candidate
      )
    ) {

      return candidate;
    }
  }


  return [];
}


// =========================================================
// PUBLIC HOME
// =========================================================

function PublicHome() {

  const navigate =
    useNavigate();


  const {
    language,
  } = useLanguage();


  const [
    searchQuery,
    setSearchQuery,
  ] = useState(
    ""
  );


  const [
    writings,
    setWritings,
  ] = useState(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  // =======================================================
  // COPY
  // =======================================================

  const copy =
    useMemo(
      () => {

        const content = {

          en: {

            eyebrow:
              "A multilingual literary community",

            titleStart:
              "Stories have no borders.",

            titleAccent:
              "Languages shouldn't either.",

            description:
              "Read, write and discover poetry, stories, essays and reflections from voices across languages.",

            searchPlaceholder:
              "Search writings, writers, topics or hashtags",

            search:
              "Search",

            explore:
              "Explore writings",

            join:
              "Join SHOBDO",

            write:
              "Start writing",

            discoverEyebrow:
              "Discover SHOBDO",

            discoverTitle:
              "A home for words in every language",

            discoverDescription:
              "SHOBDO brings writers and readers together through literature, ideas and shared human experiences.",

            featureReadTitle:
              "Read freely",

            featureReadText:
              "Explore public writings and writer profiles without creating an account.",

            featureWriteTitle:
              "Publish your voice",

            featureWriteText:
              "Create an account and publish poetry, stories, essays and personal reflections.",

            featureCommunityTitle:
              "Find your community",

            featureCommunityText:
              "Follow writers, join conversations and discover voices that matter to you.",

            categoryEyebrow:
              "Browse",

            categoryTitle:
              "Explore by category",

            categoryDescription:
              "Find the kind of writing you want to read.",

            poetry:
              "Poetry",

            poetryDescription:
              "Verses, rhythm and emotion.",

            story:
              "Stories",

            storyDescription:
              "Fiction, memories and narratives.",

            reflection:
              "Reflections",

            reflectionDescription:
              "Thoughts, feelings and lived experiences.",

            essay:
              "Essays",

            essayDescription:
              "Ideas, perspectives and long-form writing.",

            languagesEyebrow:
              "Multilingual",

            languagesTitle:
              "Read beyond one language",

            languagesDescription:
              "SHOBDO is being built for literature across Indian languages and English.",

            bengali:
              "Bengali",

            english:
              "English",

            hindi:
              "Hindi",

            browseLanguage:
              "Browse",

            latestEyebrow:
              "From the community",

            latestTitle:
              "Latest writings",

            latestDescription:
              "Discover recently published work from the SHOBDO community.",

            viewAll:
              "View all writings",

            loading:
              "Loading writings...",

            loadError:
              "We couldn't load the latest writings.",

            retry:
              "Try again",

            noWritings:
              "No public writings are available yet.",

            communityEyebrow:
              "Write · Read · Belong",

            communityTitle:
              "Your words deserve a place to belong.",

            communityDescription:
              "Join SHOBDO to publish your writing, follow writers, save your favourite pieces and take part in conversations.",

            createAccount:
              "Create free account",

            login:
              "Log in",

            publicNote:
              "Reading and exploring public writings does not require an account.",

          },


          bn: {

            eyebrow:
              "একটি বহুভাষিক সাহিত্য সম্প্রদায়",

            titleStart:
              "গল্পের কোনো সীমানা নেই।",

            titleAccent:
              "ভাষারও থাকা উচিত নয়।",

            description:
              "বিভিন্ন ভাষার কবিতা, গল্প, প্রবন্ধ ও অনুভূতি পড়ুন, লিখুন এবং নতুন কণ্ঠ আবিষ্কার করুন।",

            searchPlaceholder:
              "লেখা, লেখক, বিষয় বা হ্যাশট্যাগ খুঁজুন",

            search:
              "খুঁজুন",

            explore:
              "লেখা অন্বেষণ করুন",

            join:
              "SHOBDO-তে যোগ দিন",

            write:
              "লেখা শুরু করুন",

            discoverEyebrow:
              "SHOBDO আবিষ্কার করুন",

            discoverTitle:
              "প্রতিটি ভাষার শব্দের জন্য একটি ঘর",

            discoverDescription:
              "সাহিত্য, চিন্তা ও মানুষের অভিজ্ঞতার মাধ্যমে SHOBDO লেখক ও পাঠকদের একত্র করে।",

            featureReadTitle:
              "স্বাধীনভাবে পড়ুন",

            featureReadText:
              "অ্যাকাউন্ট ছাড়াই প্রকাশিত লেখা ও লেখকের প্রোফাইল দেখুন।",

            featureWriteTitle:
              "নিজের কণ্ঠ প্রকাশ করুন",

            featureWriteText:
              "অ্যাকাউন্ট তৈরি করে কবিতা, গল্প, প্রবন্ধ ও অনুভূতি প্রকাশ করুন।",

            featureCommunityTitle:
              "নিজের সম্প্রদায় খুঁজুন",

            featureCommunityText:
              "লেখকদের অনুসরণ করুন, আলোচনায় যোগ দিন এবং নতুন কণ্ঠ আবিষ্কার করুন।",

            categoryEyebrow:
              "বিভাগ",

            categoryTitle:
              "বিভাগ অনুযায়ী পড়ুন",

            categoryDescription:
              "আপনার পছন্দের ধরনের লেখা খুঁজে নিন।",

            poetry:
              "কবিতা",

            poetryDescription:
              "ছন্দ, অনুভূতি ও কাব্যের জগৎ।",

            story:
              "গল্প",

            storyDescription:
              "কল্পকাহিনি, স্মৃতি ও বিভিন্ন আখ্যান।",

            reflection:
              "অনুভূতি",

            reflectionDescription:
              "চিন্তা, অনুভব ও জীবনের অভিজ্ঞতা।",

            essay:
              "প্রবন্ধ",

            essayDescription:
              "ভাবনা, মতামত ও বিশদ লেখা।",

            languagesEyebrow:
              "বহুভাষিক",

            languagesTitle:
              "একটি ভাষার বাইরে পড়ুন",

            languagesDescription:
              "SHOBDO ভারতীয় ভাষা ও ইংরেজির সাহিত্যকে একই জায়গায় নিয়ে আসার জন্য তৈরি হচ্ছে।",

            bengali:
              "বাংলা",

            english:
              "ইংরেজি",

            hindi:
              "হিন্দি",

            browseLanguage:
              "দেখুন",

            latestEyebrow:
              "সম্প্রদায় থেকে",

            latestTitle:
              "সাম্প্রতিক লেখা",

            latestDescription:
              "SHOBDO সম্প্রদায়ের সদ্য প্রকাশিত লেখা আবিষ্কার করুন।",

            viewAll:
              "সব লেখা দেখুন",

            loading:
              "লেখা লোড হচ্ছে...",

            loadError:
              "সাম্প্রতিক লেখা লোড করা যায়নি।",

            retry:
              "আবার চেষ্টা করুন",

            noWritings:
              "এখনও কোনো প্রকাশ্য লেখা পাওয়া যায়নি।",

            communityEyebrow:
              "লিখুন · পড়ুন · যুক্ত হোন",

            communityTitle:
              "আপনার শব্দেরও একটি নিজের জায়গা থাকা উচিত।",

            communityDescription:
              "নিজের লেখা প্রকাশ করুন, লেখকদের অনুসরণ করুন, পছন্দের লেখা সংরক্ষণ করুন এবং আলোচনায় অংশ নিন।",

            createAccount:
              "ফ্রি অ্যাকাউন্ট তৈরি করুন",

            login:
              "লগ ইন",

            publicNote:
              "প্রকাশ্য লেখা পড়া ও অন্বেষণের জন্য অ্যাকাউন্ট প্রয়োজন নেই।",

          },


          hi: {

            eyebrow:
              "एक बहुभाषी साहित्यिक समुदाय",

            titleStart:
              "कहानियों की कोई सीमा नहीं होती।",

            titleAccent:
              "भाषाओं की भी नहीं होनी चाहिए।",

            description:
              "विभिन्न भाषाओं की कविताएँ, कहानियाँ, निबंध और अनुभव पढ़ें, लिखें और नई आवाज़ें खोजें।",

            searchPlaceholder:
              "रचनाएँ, लेखक, विषय या हैशटैग खोजें",

            search:
              "खोजें",

            explore:
              "रचनाएँ खोजें",

            join:
              "SHOBDO से जुड़ें",

            write:
              "लिखना शुरू करें",

            discoverEyebrow:
              "SHOBDO को जानें",

            discoverTitle:
              "हर भाषा के शब्दों के लिए एक घर",

            discoverDescription:
              "SHOBDO साहित्य, विचारों और साझा अनुभवों के माध्यम से लेखकों और पाठकों को जोड़ता है।",

            featureReadTitle:
              "स्वतंत्र रूप से पढ़ें",

            featureReadText:
              "बिना अकाउंट बनाए सार्वजनिक रचनाएँ और लेखक प्रोफ़ाइल देखें।",

            featureWriteTitle:
              "अपनी आवाज़ प्रकाशित करें",

            featureWriteText:
              "अकाउंट बनाकर कविता, कहानी, निबंध और अनुभव प्रकाशित करें।",

            featureCommunityTitle:
              "अपना समुदाय खोजें",

            featureCommunityText:
              "लेखकों को फॉलो करें, चर्चाओं में शामिल हों और नई आवाज़ें खोजें।",

            categoryEyebrow:
              "खोजें",

            categoryTitle:
              "श्रेणी के अनुसार पढ़ें",

            categoryDescription:
              "अपनी पसंद की रचनाएँ खोजें।",

            poetry:
              "कविता",

            poetryDescription:
              "भावना, लय और काव्य।",

            story:
              "कहानियाँ",

            storyDescription:
              "कथा, स्मृतियाँ और जीवन की कहानियाँ।",

            reflection:
              "अनुभूति",

            reflectionDescription:
              "विचार, भावनाएँ और जीवन के अनुभव।",

            essay:
              "निबंध",

            essayDescription:
              "विचार, दृष्टिकोण और विस्तृत लेखन।",

            languagesEyebrow:
              "बहुभाषी",

            languagesTitle:
              "एक भाषा से आगे पढ़ें",

            languagesDescription:
              "SHOBDO भारतीय भाषाओं और अंग्रेज़ी के साहित्य को एक स्थान पर लाने के लिए बनाया जा रहा है।",

            bengali:
              "बांग्ला",

            english:
              "अंग्रेज़ी",

            hindi:
              "हिंदी",

            browseLanguage:
              "देखें",

            latestEyebrow:
              "समुदाय से",

            latestTitle:
              "नई रचनाएँ",

            latestDescription:
              "SHOBDO समुदाय की हाल ही में प्रकाशित रचनाएँ पढ़ें।",

            viewAll:
              "सभी रचनाएँ देखें",

            loading:
              "रचनाएँ लोड हो रही हैं...",

            loadError:
              "नई रचनाएँ लोड नहीं हो सकीं।",

            retry:
              "फिर कोशिश करें",

            noWritings:
              "अभी कोई सार्वजनिक रचना उपलब्ध नहीं है।",

            communityEyebrow:
              "लिखें · पढ़ें · जुड़ें",

            communityTitle:
              "आपके शब्दों को भी अपना स्थान मिलना चाहिए।",

            communityDescription:
              "अपनी रचनाएँ प्रकाशित करें, लेखकों को फॉलो करें, पसंदीदा रचनाएँ सहेजें और बातचीत में शामिल हों।",

            createAccount:
              "मुफ़्त अकाउंट बनाएँ",

            login:
              "लॉग इन",

            publicNote:
              "सार्वजनिक रचनाएँ पढ़ने और खोजने के लिए अकाउंट आवश्यक नहीं है।",

          },

        };


        return (
          content[language] ||
          content.en
        );

      },
      [
        language,
      ]
    );


  // =======================================================
  // CATEGORIES
  // =======================================================

  const categories =
    useMemo(
      () => [

        {
          key:
            "poetry",

          query:
            "কবিতা",

          icon:
            Feather,

          title:
            copy.poetry,

          description:
            copy.poetryDescription,
        },

        {
          key:
            "story",

          query:
            "গল্প",

          icon:
            BookOpen,

          title:
            copy.story,

          description:
            copy.storyDescription,
        },

        {
          key:
            "reflection",

          query:
            "অনুভূতি",

          icon:
            Heart,

          title:
            copy.reflection,

          description:
            copy.reflectionDescription,
        },

        {
          key:
            "essay",

          query:
            "প্রবন্ধ",

          icon:
            Quote,

          title:
            copy.essay,

          description:
            copy.essayDescription,
        },

      ],
      [
        copy,
      ]
    );


  // =======================================================
  // LANGUAGES
  // =======================================================

  const discoveryLanguages =
    useMemo(
      () => [

        {
          code:
            "bn",

          label:
            copy.bengali,

          native:
            "বাংলা",
        },

        {
          code:
            "en",

          label:
            copy.english,

          native:
            "English",
        },

        {
          code:
            "hi",

          label:
            copy.hindi,

          native:
            "हिन्दी",
        },

      ],
      [
        copy,
      ]
    );


  // =======================================================
  // LOAD WRITINGS
  // =======================================================

  async function loadLatestWritings() {

    setLoading(
      true
    );


    setError(
      ""
    );


    try {

      const data =
        await getWritings({
          page:
            1,

          limit:
            PUBLIC_WRITING_LIMIT,
        });


      setWritings(
        normalizeWritings(
          data
        )
      );

    } catch (
      requestError
    ) {

      console.error(
        "PUBLIC HOME WRITINGS ERROR:",
        requestError
      );


      setError(
        copy.loadError
      );

    } finally {

      setLoading(
        false
      );
    }
  }


  useEffect(
    () => {

      loadLatestWritings();

      // eslint-disable-next-line react-hooks/exhaustive-deps

    },
    []
  );


  // =======================================================
  // SEARCH
  // =======================================================

  function handleSearch(
    event
  ) {

    event.preventDefault();


    const query =
      searchQuery.trim();


    if (!query) {

      navigate(
        "/search"
      );

      return;
    }


    navigate(
      `/search?q=${encodeURIComponent(
        query
      )}`
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <>
      <SEO
        title="SHOBDO — Multilingual Writing & Reading Community"
        description="Discover stories, poetry, essays and original voices on SHOBDO, a multilingual community for writers and readers."
        path="/"
        type="website"
      />
      <main
        className="public-home"
      >

      {/* =================================================
          HERO
      ================================================== */}

      <section
        className="public-hero"
      >

        <div
          className="public-hero-decoration public-hero-decoration-one"
        />


        <div
          className="public-hero-decoration public-hero-decoration-two"
        />


        <div
          className="public-hero-inner"
        >

          <div
            className="public-hero-copy"
          >

            <div
              className="public-eyebrow"
            >

              <Sparkles
                size={14}
              />

              <span>
                {copy.eyebrow}
              </span>

            </div>


            <h1>

              <span>
                {copy.titleStart}
              </span>

              <strong>
                {copy.titleAccent}
              </strong>

            </h1>


            <p
              className="public-hero-description"
            >
              {copy.description}
            </p>


            {/* SEARCH */}

            <form
              className="public-hero-search"
              onSubmit={
                handleSearch
              }
            >

              <Search
                size={19}
              />


              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={
                  (
                    event
                  ) =>
                    setSearchQuery(
                      event.target.value
                    )
                }
                placeholder={
                  copy.searchPlaceholder
                }
                aria-label={
                  copy.searchPlaceholder
                }
              />


              <button
                type="submit"
              >
                <span>
                  {copy.search}
                </span>

                <ArrowRight
                  size={16}
                />
              </button>

            </form>


            {/* CTA */}

            <div
              className="public-hero-actions"
            >

              <Link
                to="/explore"
                className="public-primary-button"
              >

                <BookOpen
                  size={17}
                />

                <span>
                  {copy.explore}
                </span>

              </Link>


              <Link
                to="/register"
                className="public-secondary-button"
              >

                <Users
                  size={17}
                />

                <span>
                  {copy.join}
                </span>

              </Link>

            </div>


            <p
              className="public-access-note"
            >
              {copy.publicNote}
            </p>

          </div>


          {/* HERO VISUAL */}

          <div
            className="public-hero-visual"
            aria-hidden="true"
          >

            <div
              className="public-manuscript-card public-manuscript-card-back"
            >

              <span />

              <span />

              <span />

              <span />

            </div>


            <div
              className="public-manuscript-card public-manuscript-card-main"
            >

              <div
                className="public-manuscript-mark"
              >
                <Feather
                  size={25}
                />
              </div>


              <div
                className="public-manuscript-lines"
              >
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>


              <div
                className="public-manuscript-signature"
              >
                SHOBDO
              </div>

            </div>


            <div
              className="public-floating-language public-floating-language-bn"
            >
              বাংলা
            </div>


            <div
              className="public-floating-language public-floating-language-hi"
            >
              हिन्दी
            </div>


            <div
              className="public-floating-language public-floating-language-en"
            >
              English
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          DISCOVER
      ================================================== */}

      <section
        className="public-section public-discover-section"
      >

        <div
          className="public-section-heading public-section-heading-centered"
        >

          <span
            className="public-section-eyebrow"
          >
            {copy.discoverEyebrow}
          </span>


          <h2>
            {copy.discoverTitle}
          </h2>


          <p>
            {copy.discoverDescription}
          </p>

        </div>


        <div
          className="public-feature-grid"
        >

          <article
            className="public-feature-card"
          >

            <div
              className="public-feature-icon"
            >
              <BookOpen
                size={21}
              />
            </div>

            <h3>
              {copy.featureReadTitle}
            </h3>

            <p>
              {copy.featureReadText}
            </p>

          </article>


          <article
            className="public-feature-card"
          >

            <div
              className="public-feature-icon"
            >
              <PenLine
                size={21}
              />
            </div>

            <h3>
              {copy.featureWriteTitle}
            </h3>

            <p>
              {copy.featureWriteText}
            </p>

          </article>


          <article
            className="public-feature-card"
          >

            <div
              className="public-feature-icon"
            >
              <Users
                size={21}
              />
            </div>

            <h3>
              {copy.featureCommunityTitle}
            </h3>

            <p>
              {copy.featureCommunityText}
            </p>

          </article>

        </div>

      </section>


      {/* =================================================
          CATEGORIES
      ================================================== */}

      <section
        className="public-section"
      >

        <div
          className="public-section-heading"
        >

          <div>

            <span
              className="public-section-eyebrow"
            >
              {copy.categoryEyebrow}
            </span>


            <h2>
              {copy.categoryTitle}
            </h2>


            <p>
              {copy.categoryDescription}
            </p>

          </div>


          <Link
            to="/explore"
            className="public-heading-link"
          >
            {copy.explore}

            <ArrowRight
              size={15}
            />
          </Link>

        </div>


        <div
          className="public-category-grid"
        >

          {categories.map(
            (
              category
            ) => {

              const Icon =
                category.icon;


              return (

                <Link
                  key={
                    category.key
                  }
                  to={
                    `/search?q=${encodeURIComponent(
                      category.query
                    )}`
                  }
                  className="public-category-card"
                >

                  <span
                    className="public-category-icon"
                  >
                    <Icon
                      size={20}
                    />
                  </span>


                  <span
                    className="public-category-copy"
                  >

                    <strong>
                      {category.title}
                    </strong>

                    <small>
                      {category.description}
                    </small>

                  </span>


                  <ArrowRight
                    className="public-category-arrow"
                    size={17}
                  />

                </Link>

              );
            }
          )}

        </div>

      </section>


      {/* =================================================
          LANGUAGES
      ================================================== */}

      <section
        className="public-section public-language-section"
      >

        <div
          className="public-language-copy"
        >

          <div
            className="public-language-symbol"
          >
            <Globe2
              size={25}
            />
          </div>


          <span
            className="public-section-eyebrow"
          >
            {copy.languagesEyebrow}
          </span>


          <h2>
            {copy.languagesTitle}
          </h2>


          <p>
            {copy.languagesDescription}
          </p>

        </div>


        <div
          className="public-language-grid"
        >

          {discoveryLanguages.map(
            (
              item
            ) => (

              <Link
                key={
                  item.code
                }
                to={
                  `/explore?language=${item.code}`
                }
                className="public-language-card"
              >

                <span
                  className="public-language-native"
                >
                  {item.native}
                </span>


                <span
                  className="public-language-name"
                >
                  {item.label}
                </span>


                <span
                  className="public-language-action"
                >

                  {copy.browseLanguage}

                  <ArrowRight
                    size={14}
                  />

                </span>

              </Link>

            )
          )}

        </div>

      </section>


      {/* =================================================
          LATEST WRITINGS
      ================================================== */}

      <section
        className="public-section public-latest-section"
      >

        <div
          className="public-section-heading"
        >

          <div>

            <span
              className="public-section-eyebrow"
            >
              {copy.latestEyebrow}
            </span>


            <h2>
              {copy.latestTitle}
            </h2>


            <p>
              {copy.latestDescription}
            </p>

          </div>


          <Link
            to="/explore"
            className="public-heading-link"
          >

            {copy.viewAll}

            <ArrowRight
              size={15}
            />

          </Link>

        </div>


        {/* LOADING */}

        {loading && (

          <div
            className="public-loading"
          >

            <Loader2
              className="public-spin"
              size={22}
            />

            <span>
              {copy.loading}
            </span>

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

          <div
            className="public-error"
          >

            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={
                loadLatestWritings
              }
            >

              {copy.retry}

            </button>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          writings.length ===
            0 && (

          <div
            className="public-empty"
          >

            <BookOpen
              size={25}
            />

            <p>
              {copy.noWritings}
            </p>

          </div>

        )}


        {/* WRITINGS */}

        {!loading &&
          !error &&
          writings.length >
            0 && (

          <div
            className="public-writing-list"
          >

            {writings.map(
              (
                writing
              ) => (

                <WritingCard
                  key={
                    writing.id
                  }
                  writing={
                    writing
                  }
                />

              )
            )}

          </div>

        )}


        {!loading &&
          writings.length >
            0 && (

          <div
            className="public-view-all-wrap"
          >

            <Link
              to="/explore"
              className="public-view-all-button"
            >

              {copy.viewAll}

              <ArrowRight
                size={16}
              />

            </Link>

          </div>

        )}

      </section>


      {/* =================================================
          COMMUNITY CTA
      ================================================== */}

      <section
        className="public-community-cta"
      >

        <div
          className="public-community-decoration"
        >
          <Feather
            size={120}
          />
        </div>


        <div
          className="public-community-content"
        >

          <span
            className="public-community-eyebrow"
          >
            {copy.communityEyebrow}
          </span>


          <h2>
            {copy.communityTitle}
          </h2>


          <p>
            {copy.communityDescription}
          </p>


          <div
            className="public-community-actions"
          >

            <Link
              to="/register"
              className="public-community-primary"
            >

              <Users
                size={17}
              />

              <span>
                {copy.createAccount}
              </span>

            </Link>


            <Link
              to="/login"
              className="public-community-secondary"
            >
              {copy.login}
            </Link>

          </div>

        </div>

      </section>

      </main>
    </>
  );
}


export default PublicHome;