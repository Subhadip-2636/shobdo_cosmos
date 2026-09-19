import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Bookmark,
  FileText,
  Filter,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getFollowingFeed,
  getSavedWritings,
  getToken,
  getWritings,
} from "../api/api";

import {
  getDocuments,
} from "../api/documents";

import {
  getArtworks,
} from "../api/artworks";

import {
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import WritingCard
  from "../components/WritingCard";

import DocumentCard
  from "../components/DocumentCard";

import ArtworkCard
  from "../components/ArtworkCard";

import SEO
  from "../components/SEO";

import "./Explore.css";


// =========================================================
// CONSTANTS
// =========================================================

const PAGE_SIZE = 12;


const WRITING_CATEGORY_VALUES = [
  "",
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
];


const ARTWORK_CATEGORY_VALUES = [
  "",
  "Digital Art",
  "Painting",
  "Sketch",
  "Illustration",
  "Photography",
  "Calligraphy",
  "Other",
];


const VALID_SORTS = [
  "latest",
  "oldest",
  "title",
];


// =========================================================
// RESPONSE HELPERS
// =========================================================

function normalizeWritingResponse(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;

  }


  if (
    Array.isArray(
      data?.writings
    )
  ) {

    return data.writings;

  }


  if (
    Array.isArray(
      data?.items
    )
  ) {

    return data.items;

  }


  if (
    Array.isArray(
      data?.results
    )
  ) {

    return data.results;

  }


  if (
    Array.isArray(
      data?.data?.writings
    )
  ) {

    return data.data.writings;

  }


  return [];

}


function normalizeDocumentResponse(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;

  }


  if (
    Array.isArray(
      data?.documents
    )
  ) {

    return data.documents;

  }


  if (
    Array.isArray(
      data?.items
    )
  ) {

    return data.items;

  }


  if (
    Array.isArray(
      data?.data?.documents
    )
  ) {

    return data.data.documents;

  }


  return [];

}


function normalizeArtworkResponse(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;

  }


  if (
    Array.isArray(
      data?.artworks
    )
  ) {

    return data.artworks;

  }


  if (
    Array.isArray(
      data?.items
    )
  ) {

    return data.items;

  }


  if (
    Array.isArray(
      data?.data?.artworks
    )
  ) {

    return data.data.artworks;

  }


  return [];

}


function normalizePagination(
  data,
  fallbackPage = 1
) {

  const source =
    data?.pagination ||
    data?.data?.pagination;


  if (
    source &&
    typeof source ===
      "object"
  ) {

    return source;

  }


  const page =
    Number(
      data?.page
    ) ||
    fallbackPage;


  const pages =
    Number(
      data?.pages
    ) ||
    0;


  const total =
    Number(
      data?.total
    ) ||
    0;


  if (
    pages ||
    total
  ) {

    return {

      page,

      pages,

      total,

      has_prev:
        Boolean(
          data?.has_prev
        ),

      has_next:
        Boolean(
          data?.has_next
        ),

    };

  }


  return null;

}


// =========================================================
// EXPLORE
// =========================================================

function Explore() {

  const navigate =
    useNavigate();


  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const {
    t,

    language:
      uiLanguage,

  } = useLanguage();


  const isLoggedIn =
    Boolean(
      getToken()
    );


  // =======================================================
  // TRANSLATION
  // =======================================================

  function translate(
    key,
    fallbackBn,
    fallbackEn,
    fallbackHi = null
  ) {

    try {

      const translated =
        t(
          key
        );


      if (
        translated &&
        translated !== key
      ) {

        return translated;

      }

    } catch {

      // Use local fallback.

    }


    if (
      uiLanguage ===
        "bn"
    ) {

      return fallbackBn;

    }


    if (
      uiLanguage ===
        "hi"
    ) {

      return (
        fallbackHi ||
        fallbackEn
      );

    }


    return fallbackEn;

  }


  // =======================================================
  // TEXT
  // =======================================================

  const labels = {

    eyebrow:
      translate(
        "explore.eyebrow",
        "আবিষ্কার করুন",
        "DISCOVER",
        "खोजें"
      ),


    title:
      translate(
        "explore.title",
        "SHOBDO অন্বেষণ করুন",
        "Explore SHOBDO",
        "SHOBDO खोजें"
      ),


    description:
      translate(
        "explore.description",
        "SHOBDO সম্প্রদায়ের লেখা, PDF নথি ও শিল্পকর্ম আবিষ্কার করুন।",
        "Discover writings, PDF documents and artwork from the SHOBDO community.",
        "SHOBDO समुदाय की रचनाएँ, PDF दस्तावेज़ और कलाकृतियाँ खोजें।"
      ),


    writings:
      translate(
        "explore.writingsTab",
        "লেখা",
        "Writings",
        "रचनाएँ"
      ),


    documents:
      translate(
        "explore.documentsTab",
        "PDF নথি",
        "PDF Documents",
        "PDF दस्तावेज़"
      ),


    artworks:
      translate(
        "explore.artworkTab",
        "শিল্পকর্ম",
        "Artwork",
        "कलाकृति"
      ),


    all:
      translate(
        "explore.allWritings",
        "সব লেখা",
        "All writings",
        "सभी रचनाएँ"
      ),


    following:
      translate(
        "explore.following",
        "অনুসরণ",
        "Following",
        "फ़ॉलोइंग"
      ),


    saved:
      translate(
        "explore.saved",
        "সংরক্ষিত",
        "Saved",
        "सहेजे गए"
      ),


    searchPlaceholder:
      translate(
        "explore.searchPlaceholder",
        "কবিতা, গল্প, বিষয় বা লেখক খুঁজুন...",
        "Search poems, stories, topics or writers...",
        "कविता, कहानी, विषय या लेखक खोजें..."
      ),


    search:
      translate(
        "explore.searchButton",
        "খুঁজুন",
        "Search",
        "खोजें"
      ),


    allLanguages:
      translate(
        "explore.allLanguages",
        "সব ভাষা",
        "All languages",
        "सभी भाषाएँ"
      ),


    allCategories:
      translate(
        "explore.allCategories",
        "সব বিভাগ",
        "All categories",
        "सभी श्रेणियाँ"
      ),


    latest:
      translate(
        "explore.latest",
        "সাম্প্রতিক",
        "Latest",
        "नवीनतम"
      ),


    oldest:
      translate(
        "explore.oldest",
        "পুরোনো আগে",
        "Oldest first",
        "सबसे पुराना पहले"
      ),


    titleAZ:
      translate(
        "explore.titleAZ",
        "শিরোনাম A-Z",
        "Title A-Z",
        "शीर्षक A-Z"
      ),


    clearFilters:
      translate(
        "explore.clearFilters",
        "ফিল্টার মুছুন",
        "Clear filters",
        "फ़िल्टर साफ़ करें"
      ),


    publicNotice:
      translate(
        "explore.publicNotice",
        "অ্যাকাউন্ট ছাড়াই প্রকাশ্য লেখা, PDF ও শিল্পকর্ম অন্বেষণ করুন।",
        "Explore public writings, PDFs and artwork without an account.",
        "बिना अकाउंट के सार्वजनिक रचनाएँ, PDF और कलाकृतियाँ खोजें।"
      ),


    join:
      translate(
        "explore.join",
        "SHOBDO-তে যোগ দিন",
        "Join SHOBDO",
        "SHOBDO से जुड़ें"
      ),


    login:
      translate(
        "navbar.login",
        "লগ ইন",
        "Log in",
        "लॉग इन"
      ),


    followingDescription:
      translate(
        "explore.followingDescription",
        "আপনি যাদের অনুসরণ করেন তাদের সাম্প্রতিক লেখা।",
        "Recent writings from writers you follow.",
        "आपके फ़ॉलो किए गए लेखकों की नई रचनाएँ।"
      ),


    savedDescription:
      translate(
        "explore.savedDescription",
        "আপনার সংরক্ষিত লেখার ব্যক্তিগত সংগ্রহ।",
        "Your private collection of saved writings.",
        "आपकी सहेजी गई रचनाओं का निजी संग्रह।"
      ),


    documentsDescription:
      translate(
        "explore.documentsDescription",
        "SHOBDO সম্প্রদায়ের প্রকাশিত PDF বই, প্রবন্ধ, কবিতা সংকলন ও পাণ্ডুলিপি দেখুন।",
        "Browse PDF books, essays, poetry collections and manuscripts published by the SHOBDO community.",
        "SHOBDO समुदाय द्वारा प्रकाशित PDF पुस्तकें, निबंध, कविता संग्रह और पांडुलिपियाँ देखें।"
      ),


    artworksDescription:
      translate(
        "explore.artworksDescription",
        "SHOBDO নির্মাতাদের চিত্রকর্ম, ইলাস্ট্রেশন, ফটোগ্রাফি, স্কেচ ও ডিজিটাল আর্ট দেখুন।",
        "Discover paintings, illustrations, photography, sketches and digital art from SHOBDO creators.",
        "SHOBDO रचनाकारों की पेंटिंग, इलस्ट्रेशन, फोटोग्राफी, स्केच और डिजिटल आर्ट देखें।"
      ),


    loading:
      translate(
        "explore.loading",
        "কনটেন্ট লোড হচ্ছে...",
        "Loading content...",
        "सामग्री लोड हो रही है..."
      ),


    retry:
      translate(
        "explore.retry",
        "আবার চেষ্টা করুন",
        "Try again",
        "फिर कोशिश करें"
      ),


    previous:
      translate(
        "explore.previous",
        "আগের",
        "Previous",
        "पिछला"
      ),


    next:
      translate(
        "explore.next",
        "পরের",
        "Next",
        "अगला"
      ),


    page:
      translate(
        "explore.page",
        "পৃষ্ঠা",
        "Page",
        "पृष्ठ"
      ),


    of:
      translate(
        "explore.of",
        "এর",
        "of",
        "में से"
      ),

  };


  // =======================================================
  // URL STATE
  // =======================================================

  const typeParam =
    searchParams.get(
      "type"
    );


  const contentMode =
    typeParam ===
      "documents"
      ? "documents"
      : typeParam ===
          "artworks"
        ? "artworks"
        : "writings";


  const feedParam =
    searchParams.get(
      "feed"
    );


  const feedMode =
    isLoggedIn &&
    (
      feedParam ===
        "following" ||
      feedParam ===
        "saved"
    )
      ? feedParam
      : "all";


  const submittedSearch =
    searchParams.get(
      "search"
    ) ||
    searchParams.get(
      "q"
    ) ||
    "";


  const contentLanguage =
    searchParams.get(
      "language"
    ) ||
    "";


  const category =
    searchParams.get(
      "category"
    ) ||
    "";


  const requestedSort =
    searchParams.get(
      "sort"
    ) ||
    "latest";


  const sortBy =
    VALID_SORTS.includes(
      requestedSort
    )
      ? requestedSort
      : "latest";


  const page =
    Math.max(
      1,
      Number(
        searchParams.get(
          "page"
        )
      ) ||
      1
    );


  // =======================================================
  // SEARCH INPUT
  // =======================================================

  const [
    search,
    setSearch,
  ] = useState(
    submittedSearch
  );


  useEffect(
    () => {

      setSearch(
        submittedSearch
      );

    },
    [
      submittedSearch,
    ]
  );


  // =======================================================
  // DATA STATE
  // =======================================================

  const [
    writings,
    setWritings,
  ] = useState(
    []
  );


  const [
    documents,
    setDocuments,
  ] = useState(
    []
  );


  const [
    artworks,
    setArtworks,
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


  const [
    pagination,
    setPagination,
  ] = useState(
    null
  );


  // =======================================================
  // URL HELPERS
  // =======================================================

  function replaceParams(
    callback
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    callback(
      next
    );


    setSearchParams(
      next,
      {
        replace:
          true,
      }
    );

  }


  function removePage(
    params
  ) {

    params.delete(
      "page"
    );

  }


  // =======================================================
  // CATEGORY LABEL
  // =======================================================

  function getWritingCategoryLabel(
    value
  ) {

    const map = {

      "":
        labels.allCategories,


      "কবিতা":
        translate(
          "categories.poetry",
          "কবিতা",
          "Poetry",
          "कविता"
        ),


      "গল্প":
        translate(
          "categories.story",
          "গল্প",
          "Story",
          "कहानी"
        ),


      "অনুভূতি":
        translate(
          "categories.reflection",
          "অনুভূতি",
          "Reflection",
          "अनुभूति"
        ),


      "প্রবন্ধ":
        translate(
          "categories.essay",
          "প্রবন্ধ",
          "Essay",
          "निबंध"
        ),


      "অন্যান্য":
        translate(
          "categories.other",
          "অন্যান্য",
          "Other",
          "अन्य"
        ),

    };


    return (
      map[value] ||
      value
    );

  }


  function getArtworkCategoryLabel(
    value
  ) {

    const map = {

      "":
        labels.allCategories,


      "Digital Art":
        translate(
          "explore.digitalArt",
          "ডিজিটাল আর্ট",
          "Digital Art",
          "डिजिटल आर्ट"
        ),


      Painting:
        translate(
          "explore.painting",
          "চিত্রকর্ম",
          "Painting",
          "पेंटिंग"
        ),


      Sketch:
        translate(
          "explore.sketch",
          "স্কেচ",
          "Sketch",
          "स्केच"
        ),


      Illustration:
        translate(
          "explore.illustration",
          "ইলাস্ট্রেশন",
          "Illustration",
          "इलस्ट्रेशन"
        ),


      Photography:
        translate(
          "explore.photography",
          "ফটোগ্রাফি",
          "Photography",
          "फोटोग्राफी"
        ),


      Calligraphy:
        translate(
          "explore.calligraphy",
          "ক্যালিগ্রাফি",
          "Calligraphy",
          "कैलिग्राफी"
        ),


      Other:
        translate(
          "explore.otherArtwork",
          "অন্যান্য",
          "Other",
          "अन्य"
        ),

    };


    return (
      map[value] ||
      value
    );

  }


  function getCategoryLabel(
    value
  ) {

    if (
      contentMode ===
        "artworks"
    ) {

      return (
        getArtworkCategoryLabel(
          value
        )
      );

    }


    return (
      getWritingCategoryLabel(
        value
      )
    );

  }


  // =======================================================
  // LANGUAGE LABEL
  // =======================================================

  function getContentLanguageLabel(
    code,
    fallbackItem = null
  ) {

    const normalized =
      String(
        code ||
        ""
      )
        .trim()
        .toLowerCase();


    const map = {

      bn:
        translate(
          "explore.languageBengali",
          "বাংলা",
          "Bengali",
          "बांग्ला"
        ),


      en:
        translate(
          "explore.languageEnglish",
          "ইংরেজি",
          "English",
          "अंग्रेज़ी"
        ),


      hi:
        translate(
          "explore.languageHindi",
          "হিন্দি",
          "Hindi",
          "हिंदी"
        ),


      as:
        translate(
          "explore.languageAssamese",
          "অসমীয়া",
          "Assamese",
          "असमिया"
        ),


      or:
        translate(
          "explore.languageOdia",
          "ওড়িয়া",
          "Odia",
          "ओड़िया"
        ),


      ta:
        translate(
          "explore.languageTamil",
          "তামিল",
          "Tamil",
          "तमिल"
        ),


      te:
        translate(
          "explore.languageTelugu",
          "তেলুগু",
          "Telugu",
          "तेलुगु"
        ),

    };


    if (
      map[normalized]
    ) {

      return map[
        normalized
      ];

    }


    return (
      fallbackItem?.nativeName ||
      fallbackItem?.name ||
      normalized.toUpperCase()
    );

  }


  const selectedLanguage =
    LANGUAGES.find(
      (
        item
      ) =>
        item.code ===
          contentLanguage
    );


  const categoryOptions =
    contentMode ===
      "artworks"
      ? ARTWORK_CATEGORY_VALUES
      : WRITING_CATEGORY_VALUES;


  // =======================================================
  // CONTENT MODE
  // =======================================================

  function changeContentMode(
    mode
  ) {

    if (
      mode ===
        contentMode
    ) {

      return;

    }


    const next =
      new URLSearchParams();


    if (
      mode ===
        "documents"
    ) {

      next.set(
        "type",
        "documents"
      );

    }


    if (
      mode ===
        "artworks"
    ) {

      next.set(
        "type",
        "artworks"
      );

    }


    setSearch(
      ""
    );


    setError(
      ""
    );


    setPagination(
      null
    );


    setSearchParams(
      next,
      {
        replace:
          true,
      }
    );

  }


  // =======================================================
  // WRITING FEED
  // =======================================================

  function changeFeed(
    mode
  ) {

    if (
      mode ===
        feedMode
    ) {

      return;

    }


    if (
      (
        mode ===
          "following" ||
        mode ===
          "saved"
      ) &&
      !isLoggedIn
    ) {

      navigate(
        "/login"
      );


      return;

    }


    const next =
      new URLSearchParams();


    if (
      mode ===
        "following" ||
      mode ===
        "saved"
    ) {

      next.set(
        "feed",
        mode
      );

    }


    setSearch(
      ""
    );


    setError(
      ""
    );


    setSearchParams(
      next,
      {
        replace:
          true,
      }
    );

  }


  // =======================================================
  // SEARCH
  // =======================================================

  function handleSearch(
    event
  ) {

    event.preventDefault();


    if (
      contentMode !==
        "writings" ||
      feedMode !==
        "all"
    ) {

      return;

    }


    const value =
      search.trim();


    replaceParams(
      (
        params
      ) => {

        params.delete(
          "q"
        );


        if (
          value
        ) {

          params.set(
            "search",
            value
          );

        } else {

          params.delete(
            "search"
          );

        }


        removePage(
          params
        );

      }
    );

  }


  function clearSearch() {

    setSearch(
      ""
    );


    replaceParams(
      (
        params
      ) => {

        params.delete(
          "search"
        );


        params.delete(
          "q"
        );


        removePage(
          params
        );

      }
    );

  }


  // =======================================================
  // FILTER CHANGE
  // =======================================================

  function setFilter(
    key,
    value
  ) {

    replaceParams(
      (
        params
      ) => {

        if (
          value
        ) {

          params.set(
            key,
            value
          );

        } else {

          params.delete(
            key
          );

        }


        removePage(
          params
        );

      }
    );

  }


  // =======================================================
  // RESET FILTERS
  // =======================================================

  function resetFilters() {

    setSearch(
      ""
    );


    replaceParams(
      (
        params
      ) => {

        params.delete(
          "search"
        );


        params.delete(
          "q"
        );


        params.delete(
          "language"
        );


        params.delete(
          "category"
        );


        params.delete(
          "sort"
        );


        params.delete(
          "page"
        );

      }
    );

  }


  // =======================================================
  // PAGE CHANGE
  // =======================================================

  function goToPage(
    nextPage
  ) {

    const safePage =
      Math.max(
        1,
        Number(
          nextPage
        ) ||
        1
      );


    replaceParams(
      (
        params
      ) => {

        if (
          safePage <= 1
        ) {

          params.delete(
            "page"
          );

        } else {

          params.set(
            "page",
            String(
              safePage
            )
          );

        }

      }
    );


    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });

  }


  // =======================================================
  // LOAD CONTENT
  // =======================================================

  useEffect(
    () => {

      let mounted =
        true;


      async function loadContent() {

        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          // ===============================================
          // DOCUMENTS
          // ===============================================

          if (
            contentMode ===
              "documents"
          ) {

            const data =
              await getDocuments({

                page,

                limit:
                  PAGE_SIZE,

                language:
                  contentLanguage,

                category,

              });


            if (
              !mounted
            ) {

              return;

            }


            setDocuments(
              normalizeDocumentResponse(
                data
              )
            );


            setWritings(
              []
            );


            setArtworks(
              []
            );


            setPagination(
              normalizePagination(
                data,
                page
              )
            );


            return;

          }


          // ===============================================
          // ARTWORK
          // ===============================================

          if (
            contentMode ===
              "artworks"
          ) {

            const data =
              await getArtworks({

                page,

                limit:
                  PAGE_SIZE,

                language:
                  contentLanguage,

                category,

              });


            if (
              !mounted
            ) {

              return;

            }


            setArtworks(
              normalizeArtworkResponse(
                data
              )
            );


            setWritings(
              []
            );


            setDocuments(
              []
            );


            setPagination(
              normalizePagination(
                data,
                page
              )
            );


            return;

          }


          // ===============================================
          // FOLLOWING WRITINGS
          // ===============================================

          if (
            feedMode ===
              "following"
          ) {

            if (
              !isLoggedIn
            ) {

              setWritings(
                []
              );


              setPagination(
                null
              );


              return;

            }


            const data =
              await getFollowingFeed({

                page,

                limit:
                  PAGE_SIZE,

              });


            if (
              !mounted
            ) {

              return;

            }


            setWritings(
              normalizeWritingResponse(
                data
              )
            );


            setDocuments(
              []
            );


            setArtworks(
              []
            );


            setPagination(
              normalizePagination(
                data,
                page
              )
            );


            return;

          }


          // ===============================================
          // SAVED WRITINGS
          // ===============================================

          if (
            feedMode ===
              "saved"
          ) {

            if (
              !isLoggedIn
            ) {

              setWritings(
                []
              );


              setPagination(
                null
              );


              return;

            }


            const data =
              await getSavedWritings({

                page,

                perPage:
                  PAGE_SIZE,

              });


            if (
              !mounted
            ) {

              return;

            }


            const savedItems =
              Array.isArray(
                data?.saved_writings
              )
                ? data.saved_writings
                : [];


            const savedWritings =
              savedItems
                .map(
                  (
                    item
                  ) => {

                    if (
                      !item?.writing
                    ) {

                      return null;

                    }


                    return {

                      ...item.writing,

                      is_saved:
                        true,

                      saved_by_current_user:
                        true,

                      saved_at:
                        item.saved_at,

                    };

                  }
                )
                .filter(
                  Boolean
                );


            setWritings(
              savedWritings
            );


            setDocuments(
              []
            );


            setArtworks(
              []
            );


            setPagination(
              normalizePagination(
                data,
                page
              )
            );


            return;

          }


          // ===============================================
          // PUBLIC WRITINGS
          // ===============================================

          const data =
            await getWritings({

              page,

              limit:
                PAGE_SIZE,

              search:
                submittedSearch,

              language:
                contentLanguage,

              category,

            });


          if (
            !mounted
          ) {

            return;

          }


          setWritings(
            normalizeWritingResponse(
              data
            )
          );


          setDocuments(
            []
          );


          setArtworks(
            []
          );


          setPagination(
            normalizePagination(
              data,
              page
            )
          );

        } catch (
          requestError
        ) {

          console.error(
            "EXPLORE ERROR:",
            requestError
          );


          if (
            !mounted
          ) {

            return;

          }


          setWritings(
            []
          );


          setDocuments(
            []
          );


          setArtworks(
            []
          );


          setPagination(
            null
          );


          setError(
            requestError?.message ||
            translate(
              "explore.loadError",
              "কনটেন্ট লোড করা যায়নি।",
              "Unable to load content.",
              "सामग्री लोड नहीं हो सकी।"
            )
          );

        } finally {

          if (
            mounted
          ) {

            setLoading(
              false
            );

          }

        }

      }


      loadContent();


      return () => {

        mounted =
          false;

      };

    },
    [
      contentMode,
      feedMode,
      page,
      submittedSearch,
      contentLanguage,
      category,
      isLoggedIn,
    ]
  );


  // =======================================================
  // CURRENT ITEMS
  // =======================================================

  const currentItems =
    contentMode ===
      "documents"
      ? documents
      : contentMode ===
          "artworks"
        ? artworks
        : writings;


  // =======================================================
  // SORT CURRENT PAGE
  // =======================================================

  const sortedItems =
    useMemo(
      () => {

        const result = [
          ...currentItems,
        ];


        result.sort(
          (
            a,
            b
          ) => {

            if (
              sortBy ===
                "oldest"
            ) {

              return (
                new Date(
                  a.published_at ||
                  a.created_at ||
                  0
                )
                -
                new Date(
                  b.published_at ||
                  b.created_at ||
                  0
                )
              );

            }


            if (
              sortBy ===
                "title"
            ) {

              return String(
                a.title ||
                ""
              ).localeCompare(
                String(
                  b.title ||
                  ""
                )
              );

            }


            if (
              feedMode ===
                "saved"
            ) {

              return (
                new Date(
                  b.saved_at ||
                  b.published_at ||
                  b.created_at ||
                  0
                )
                -
                new Date(
                  a.saved_at ||
                  a.published_at ||
                  a.created_at ||
                  0
                )
              );

            }


            return (
              new Date(
                b.published_at ||
                b.created_at ||
                0
              )
              -
              new Date(
                a.published_at ||
                a.created_at ||
                0
              )
            );

          }
        );


        return result;

      },
      [
        currentItems,
        sortBy,
        feedMode,
      ]
    );


  // =======================================================
  // FILTER STATE
  // =======================================================

  const hasActiveFilters =
    Boolean(
      submittedSearch ||
      contentLanguage ||
      category ||
      sortBy !==
        "latest"
    );


  const totalResults =
    pagination?.total ??
    sortedItems.length;


  // =======================================================
  // DYNAMIC SEO
  // =======================================================

  const seoNoIndex =
    Boolean(
      submittedSearch
    ) ||
    feedMode !==
      "all" ||
    sortBy !==
      "latest";


  const seoLanguageLabel =
    selectedLanguage
      ? getContentLanguageLabel(
          selectedLanguage.code,
          selectedLanguage
        )
      : "";


  const seoCategoryLabel =
    category
      ? getCategoryLabel(
          category
        )
      : "";


  let seoBaseTitle =
    labels.title;


  if (
    contentMode ===
      "documents"
  ) {

    seoBaseTitle =
      labels.documents;

  } else if (
    contentMode ===
      "artworks"
  ) {

    seoBaseTitle =
      labels.artworks;

  } else if (
    feedMode ===
      "following"
  ) {

    seoBaseTitle =
      labels.following;

  } else if (
    feedMode ===
      "saved"
  ) {

    seoBaseTitle =
      labels.saved;

  }


  if (
    submittedSearch
  ) {

    seoBaseTitle =
      translate(
        "explore.seoSearchTitle",
        `“${submittedSearch}” অনুসন্ধান`,
        `Search for “${submittedSearch}”`,
        `“${submittedSearch}” की खोज`
      );

  } else if (
    seoCategoryLabel
  ) {

    seoBaseTitle =
      `${seoCategoryLabel} — ${seoBaseTitle}`;

  }


  const seoTitle =
    [
      seoBaseTitle,

      seoLanguageLabel,

      page > 1
        ? `${labels.page} ${page}`
        : "",
    ]
      .filter(
        Boolean
      )
      .join(
        " — "
      );


  let seoDescription =
    labels.description;


  if (
    contentMode ===
      "documents"
  ) {

    seoDescription =
      labels.documentsDescription;

  } else if (
    contentMode ===
      "artworks"
  ) {

    seoDescription =
      labels.artworksDescription;

  } else if (
    feedMode ===
      "following"
  ) {

    seoDescription =
      labels.followingDescription;

  } else if (
    feedMode ===
      "saved"
  ) {

    seoDescription =
      labels.savedDescription;

  }


  if (
    submittedSearch
  ) {

    seoDescription =
      translate(
        "explore.seoSearchDescription",
        `SHOBDO-তে “${submittedSearch}” সম্পর্কিত প্রকাশ্য লেখা খুঁজুন।`,
        `Discover public SHOBDO writings related to “${submittedSearch}”.`,
        `SHOBDO पर “${submittedSearch}” से संबंधित सार्वजनिक रचनाएँ खोजें।`
      );

  } else if (
    seoCategoryLabel ||
    seoLanguageLabel
  ) {

    const filterSummary =
      [
        seoCategoryLabel,
        seoLanguageLabel,
      ]
        .filter(
          Boolean
        )
        .join(
          " · "
        );


    seoDescription =
      `${seoDescription} ${filterSummary}.`;

  }


  const canonicalParams =
    new URLSearchParams();


  if (
    contentMode ===
      "documents"
  ) {

    canonicalParams.set(
      "type",
      "documents"
    );

  }


  if (
    contentMode ===
      "artworks"
  ) {

    canonicalParams.set(
      "type",
      "artworks"
    );

  }


  if (
    contentLanguage
  ) {

    canonicalParams.set(
      "language",
      contentLanguage
    );

  }


  if (
    category
  ) {

    canonicalParams.set(
      "category",
      category
    );

  }


  if (
    page > 1
  ) {

    canonicalParams.set(
      "page",
      String(
        page
      )
    );

  }


  const canonicalQuery =
    canonicalParams.toString();


  const seoCanonicalPath =
    seoNoIndex
      ? ""
      : canonicalQuery
        ? `/explore?${canonicalQuery}`
        : "/explore";


  // =======================================================
  // RESULT LABEL
  // =======================================================

  function getResultLabel() {

    if (
      contentMode ===
        "documents"
    ) {

      return translate(
        "explore.documentsFound",
        "টি PDF নথি পাওয়া গেছে",
        "PDF documents found",
        "PDF दस्तावेज़ मिले"
      );

    }


    if (
      contentMode ===
        "artworks"
    ) {

      return translate(
        "explore.artworksFound",
        "টি শিল্পকর্ম পাওয়া গেছে",
        "artworks found",
        "कलाकृतियाँ मिलीं"
      );

    }


    if (
      feedMode ===
        "following"
    ) {

      return translate(
        "explore.followingWritings",
        "টি অনুসরণকৃত লেখা",
        "following writings",
        "फ़ॉलो की गई रचनाएँ"
      );

    }


    if (
      feedMode ===
        "saved"
    ) {

      return translate(
        "explore.savedWritingsFound",
        "টি সংরক্ষিত লেখা",
        "saved writings",
        "सहेजी गई रचनाएँ"
      );

    }


    return translate(
      "explore.writingsFound",
      "টি লেখা পাওয়া গেছে",
      "writings found",
      "रचनाएँ मिलीं"
    );

  }


  // =======================================================
  // EMPTY STATE
  // =======================================================

  function getEmptyTitle() {

    if (
      contentMode ===
        "artworks"
    ) {

      return translate(
        "explore.noArtwork",
        "কোনো শিল্পকর্ম পাওয়া যায়নি",
        "No artwork found",
        "कोई कलाकृति नहीं मिली"
      );

    }


    if (
      contentMode ===
        "documents"
    ) {

      return translate(
        "explore.noDocuments",
        "কোনো PDF নথি পাওয়া যায়নি",
        "No PDF documents found",
        "कोई PDF दस्तावेज़ नहीं मिला"
      );

    }


    if (
      feedMode ===
        "following"
    ) {

      return translate(
        "explore.followingEmpty",
        "Following feed খালি",
        "Following feed is empty",
        "फ़ॉलोइंग फ़ीड खाली है"
      );

    }


    if (
      feedMode ===
        "saved"
    ) {

      return translate(
        "explore.savedEmpty",
        "এখনও কোনো লেখা সংরক্ষণ করা হয়নি",
        "No saved writings yet",
        "अभी कोई रचना सहेजी नहीं गई है"
      );

    }


    return translate(
      "explore.noResultsTitle",
      "কোনো লেখা পাওয়া যায়নি",
      "No writings found",
      "कोई रचना नहीं मिली"
    );

  }


  function getEmptyDescription() {

    if (
      contentMode ===
        "artworks"
    ) {

      return translate(
        "explore.noArtworkDescription",
        "প্রকাশিত শিল্পকর্ম এখানে দেখা যাবে।",
        "Published public artwork will appear here.",
        "प्रकाशित सार्वजनिक कलाकृतियाँ यहाँ दिखाई देंगी।"
      );

    }


    if (
      contentMode ===
        "documents"
    ) {

      return translate(
        "explore.noDocumentsDescription",
        "প্রকাশিত PDF নথি এখানে দেখা যাবে।",
        "Published public PDF documents will appear here.",
        "प्रकाशित सार्वजनिक PDF दस्तावेज़ यहाँ दिखाई देंगे।"
      );

    }


    if (
      feedMode ===
        "following"
    ) {

      return translate(
        "explore.followingEmptyDescription",
        "আপনি যাদের অনুসরণ করেন তাদের নতুন লেখা এখানে দেখা যাবে।",
        "New writings from writers you follow will appear here.",
        "आपके फ़ॉलो किए गए लेखकों की नई रचनाएँ यहाँ दिखाई देंगी।"
      );

    }


    if (
      feedMode ===
        "saved"
    ) {

      return translate(
        "explore.savedEmptyDescription",
        "কোনো লেখা পরে পড়ার জন্য সংরক্ষণ করলে এখানে দেখা যাবে।",
        "Use the bookmark button on a writing to save it for later.",
        "बाद में पढ़ने के लिए किसी रचना को बुकमार्क करें।"
      );

    }


    return translate(
      "explore.noResultsDescription",
      "অন্য সার্চ শব্দ, বিভাগ বা ভাষা ব্যবহার করে দেখুন।",
      "Try another search term, category or language.",
      "कोई दूसरा खोज शब्द, श्रेणी या भाषा आज़माएँ।"
    );

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <>

      <SEO
        title={
          seoTitle
        }
        description={
          seoDescription
        }
        path={
          seoCanonicalPath
        }
        type="website"
        noIndex={
          seoNoIndex
        }
      />


      <main
        className={
          isLoggedIn
            ? "explore-page"
            : "explore-page explore-page-public"
        }
      >

        <div
          className="explore-shell"
        >


          {/* =================================================
              HERO
          ================================================== */}

          <header
            className="explore-hero"
          >

            <div
              className="explore-eyebrow"
            >

              <BookOpen
                size={16}
              />

              <span>
                {labels.eyebrow}
              </span>

            </div>


            <h1>
              {labels.title}
            </h1>


            <p>
              {labels.description}
            </p>

          </header>


          {/* =================================================
              PUBLIC VISITOR BANNER
          ================================================== */}

          {!isLoggedIn && (

            <section
              className="explore-public-banner"
            >

              <div
                className="explore-public-banner-copy"
              >

                <Globe2
                  size={18}
                />

                <span>
                  {labels.publicNotice}
                </span>

              </div>


              <div
                className="explore-public-banner-actions"
              >

                <Link
                  to="/login"
                >
                  {labels.login}
                </Link>


                <Link
                  to="/register"
                  className="primary"
                >
                  {labels.join}
                </Link>

              </div>

            </section>

          )}


          {/* =================================================
              CONTENT TYPE
          ================================================== */}

          <div
            className="explore-content-tabs"
            role="tablist"
            aria-label="Explore content"
          >

            <button
              type="button"
              role="tab"
              aria-selected={
                contentMode ===
                  "writings"
              }
              className={
                contentMode ===
                  "writings"
                  ? "explore-content-tab active"
                  : "explore-content-tab"
              }
              onClick={
                () =>
                  changeContentMode(
                    "writings"
                  )
              }
            >

              <BookOpen
                size={18}
              />

              <span>
                {labels.writings}
              </span>

            </button>


            <button
              type="button"
              role="tab"
              aria-selected={
                contentMode ===
                  "documents"
              }
              className={
                contentMode ===
                  "documents"
                  ? "explore-content-tab active"
                  : "explore-content-tab"
              }
              onClick={
                () =>
                  changeContentMode(
                    "documents"
                  )
              }
            >

              <FileText
                size={18}
              />

              <span>
                {labels.documents}
              </span>

            </button>


            <button
              type="button"
              role="tab"
              aria-selected={
                contentMode ===
                  "artworks"
              }
              className={
                contentMode ===
                  "artworks"
                  ? "explore-content-tab active"
                  : "explore-content-tab"
              }
              onClick={
                () =>
                  changeContentMode(
                    "artworks"
                  )
              }
            >

              <ImageIcon
                size={18}
              />

              <span>
                {labels.artworks}
              </span>

            </button>

          </div>


          {/* =================================================
              LOGGED-IN WRITING FEEDS
          ================================================== */}

          {contentMode ===
            "writings" &&
            isLoggedIn && (

            <div
              className="explore-feed-tabs"
              role="tablist"
              aria-label="Writing feed"
            >

              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                    "all"
                }
                className={
                  feedMode ===
                    "all"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "all"
                    )
                }
              >

                <BookOpen
                  size={16}
                />

                {labels.all}

              </button>


              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                    "following"
                }
                className={
                  feedMode ===
                    "following"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "following"
                    )
                }
              >

                <Users
                  size={16}
                />

                {labels.following}

              </button>


              <button
                type="button"
                role="tab"
                aria-selected={
                  feedMode ===
                    "saved"
                }
                className={
                  feedMode ===
                    "saved"
                    ? "explore-feed-tab active"
                    : "explore-feed-tab"
                }
                onClick={
                  () =>
                    changeFeed(
                      "saved"
                    )
                }
              >

                <Bookmark
                  size={16}
                  fill={
                    feedMode ===
                      "saved"
                      ? "currentColor"
                      : "none"
                  }
                />

                {labels.saved}

              </button>

            </div>

          )}


          {/* =================================================
              FEED / MODE DESCRIPTION
          ================================================== */}

          {contentMode ===
            "writings" &&
            feedMode ===
              "following" && (

            <div
              className="explore-following-notice"
            >

              <Users
                size={17}
              />

              <span>
                {
                  labels.followingDescription
                }
              </span>

            </div>

          )}


          {contentMode ===
            "writings" &&
            feedMode ===
              "saved" && (

            <div
              className="explore-following-notice explore-saved-notice"
            >

              <Bookmark
                size={17}
              />

              <span>
                {
                  labels.savedDescription
                }
              </span>

            </div>

          )}


          {contentMode ===
            "documents" && (

            <div
              className="explore-document-notice"
            >

              <FileText
                size={18}
              />

              <span>
                {
                  labels.documentsDescription
                }
              </span>

            </div>

          )}


          {contentMode ===
            "artworks" && (

            <div
              className="explore-document-notice"
            >

              <ImageIcon
                size={18}
              />

              <span>
                {
                  labels.artworksDescription
                }
              </span>

            </div>

          )}


          {/* =================================================
              SEARCH
          ================================================== */}

          {contentMode ===
            "writings" &&
            feedMode ===
              "all" && (

            <form
              className="explore-search"
              onSubmit={
                handleSearch
              }
            >

              <Search
                size={18}
              />


              <input
                type="search"
                value={
                  search
                }
                onChange={
                  (
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                }
                placeholder={
                  labels.searchPlaceholder
                }
                aria-label={
                  labels.searchPlaceholder
                }
              />


              {search && (

                <button
                  type="button"
                  className="explore-search-clear"
                  onClick={
                    clearSearch
                  }
                  aria-label={
                    translate(
                      "explore.clearSearch",
                      "সার্চ মুছুন",
                      "Clear search",
                      "खोज साफ़ करें"
                    )
                  }
                >

                  <X
                    size={16}
                  />

                </button>

              )}


              <button
                type="submit"
                className="explore-search-submit"
              >
                {labels.search}
              </button>

            </form>

          )}


          {/* =================================================
              FILTERS
          ================================================== */}

          {(
            contentMode !==
              "writings" ||
            feedMode ===
              "all"
          ) && (

            <section
              className="explore-filters"
            >

              {/* LANGUAGE */}

              <div
                className="explore-filter-control"
              >

                <Globe2
                  size={16}
                />


                <select
                  value={
                    contentLanguage
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setFilter(
                        "language",
                        event.target.value
                      )
                  }
                >

                  <option
                    value=""
                  >
                    {
                      labels.allLanguages
                    }
                  </option>


                  {LANGUAGES.map(
                    (
                      item
                    ) => (

                      <option
                        key={
                          item.code
                        }
                        value={
                          item.code
                        }
                      >

                        {
                          getContentLanguageLabel(
                            item.code,
                            item
                          )
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* CATEGORY */}

              <div
                className="explore-filter-control"
              >

                <Filter
                  size={16}
                />


                <select
                  value={
                    category
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setFilter(
                        "category",
                        event.target.value
                      )
                  }
                >

                  {categoryOptions.map(
                    (
                      item
                    ) => (

                      <option
                        key={
                          item ||
                          "all"
                        }
                        value={
                          item
                        }
                      >

                        {
                          getCategoryLabel(
                            item
                          )
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* SORT */}

              <div
                className="explore-filter-control"
              >

                <SlidersHorizontal
                  size={16}
                />


                <select
                  value={
                    sortBy
                  }
                  onChange={
                    (
                      event
                    ) => {

                      const value =
                        event.target.value;


                      setFilter(
                        "sort",
                        value ===
                          "latest"
                          ? ""
                          : value
                      );

                    }
                  }
                >

                  <option
                    value="latest"
                  >
                    {labels.latest}
                  </option>


                  <option
                    value="oldest"
                  >
                    {labels.oldest}
                  </option>


                  <option
                    value="title"
                  >
                    {labels.titleAZ}
                  </option>

                </select>

              </div>


              {hasActiveFilters && (

                <button
                  type="button"
                  className="explore-reset-button"
                  onClick={
                    resetFilters
                  }
                >

                  <X
                    size={15}
                  />

                  {
                    labels.clearFilters
                  }

                </button>

              )}

            </section>

          )}


          {/* =================================================
              RESULT SUMMARY
          ================================================== */}

          <div
            className="explore-result-summary"
            aria-live="polite"
          >

            <span>

              {totalResults}

              {" "}

              {getResultLabel()}

            </span>


            {submittedSearch && (

              <span
                className="explore-active-filter"
              >
                “{submittedSearch}”
              </span>

            )}


            {selectedLanguage && (

              <span
                className="explore-active-filter"
              >

                <Globe2
                  size={11}
                />

                {
                  getContentLanguageLabel(
                    selectedLanguage.code,
                    selectedLanguage
                  )
                }

              </span>

            )}


            {category && (

              <span
                className="explore-active-filter"
              >
                {
                  getCategoryLabel(
                    category
                  )
                }
              </span>

            )}

          </div>


          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (

            <div
              className="explore-loading"
              role="status"
              aria-live="polite"
            >

              <Loader2
                size={29}
                className="spin"
              />

              <p>
                {labels.loading}
              </p>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================== */}

          {!loading &&
            error && (

            <section
              className="explore-state"
            >

              <BookOpen
                size={32}
              />


              <h2>

                {
                  translate(
                    "explore.loadContentError",
                    "কনটেন্ট লোড করা যায়নি",
                    "Unable to load content",
                    "सामग्री लोड नहीं हो सकी"
                  )
                }

              </h2>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  () =>
                    window.location.reload()
                }
              >

                {
                  labels.retry
                }

              </button>

            </section>

          )}


          {/* =================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            sortedItems.length ===
              0 && (

            <section
              className="explore-state"
            >

              {
                contentMode ===
                  "artworks"
                  ? (

                      <ImageIcon
                        size={32}
                      />

                    )
                  : contentMode ===
                      "documents"
                    ? (

                        <FileText
                          size={32}
                        />

                      )
                    : feedMode ===
                        "following"
                      ? (

                          <Users
                            size={32}
                          />

                        )
                      : feedMode ===
                          "saved"
                        ? (

                            <Bookmark
                              size={32}
                            />

                          )
                        : (

                            <Search
                              size={32}
                            />

                          )
              }


              <h2>
                {getEmptyTitle()}
              </h2>


              <p>
                {getEmptyDescription()}
              </p>


              {hasActiveFilters && (

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >

                  {
                    labels.clearFilters
                  }

                </button>

              )}

            </section>

          )}


          {/* =================================================
              WRITINGS
          ================================================== */}

          {contentMode ===
            "writings" &&
            !loading &&
            !error &&
            sortedItems.length >
              0 && (

            <section
              className="explore-writing-grid"
            >

              {sortedItems.map(
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

            </section>

          )}


          {/* =================================================
              DOCUMENTS
          ================================================== */}

          {contentMode ===
            "documents" &&
            !loading &&
            !error &&
            sortedItems.length >
              0 && (

            <section
              className="explore-document-grid"
            >

              {sortedItems.map(
                (
                  document
                ) => (

                  <DocumentCard
                    key={
                      document.id
                    }
                    document={
                      document
                    }
                  />

                )
              )}

            </section>

          )}


          {/* =================================================
              ARTWORK
          ================================================== */}

          {contentMode ===
            "artworks" &&
            !loading &&
            !error &&
            sortedItems.length >
              0 && (

            <section
              className="explore-artwork-grid"
            >

              {sortedItems.map(
                (
                  artwork
                ) => (

                  <ArtworkCard
                    key={
                      artwork.id
                    }
                    artwork={
                      artwork
                    }
                  />

                )
              )}

            </section>

          )}


          {/* =================================================
              PAGINATION
          ================================================== */}

          {!loading &&
            !error &&
            pagination &&
            Number(
              pagination.pages
            ) > 1 && (

            <nav
              className="explore-pagination"
              aria-label="Explore pagination"
            >

              <button
                type="button"
                disabled={
                  !pagination.has_prev
                }
                onClick={
                  () =>
                    goToPage(
                      page - 1
                    )
                }
              >

                {
                  labels.previous
                }

              </button>


              <span>

                {labels.page}

                {" "}

                <strong>
                  {
                    pagination.page ||
                    page
                  }
                </strong>

                {" "}

                {labels.of}

                {" "}

                {
                  pagination.pages
                }

              </span>


              <button
                type="button"
                disabled={
                  !pagination.has_next
                }
                onClick={
                  () =>
                    goToPage(
                      page + 1
                    )
                }
              >

                {
                  labels.next
                }

              </button>

            </nav>

          )}

        </div>

      </main>

    </>

  );

}


export default Explore;