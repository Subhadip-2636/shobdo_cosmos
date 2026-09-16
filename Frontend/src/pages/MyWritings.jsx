import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Files,
  Globe2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  deleteWriting,
  getMyWritings,
  permanentlyDeleteWriting,
  publishWriting,
  restoreWriting,
  unpublishWriting,
} from "../api/api";

import {
  getMyDocuments,
} from "../api/documents";

import {
  getMyArtworks,
} from "../api/artworks";

import {
  LANGUAGES,
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import DocumentCard
  from "../components/DocumentCard";

import ArtworkCard
  from "../components/ArtworkCard";


// =========================================================
// HELPERS
// =========================================================

function extractWritings(
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


  return [];
}


function extractDocuments(
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


  return [];
}


function extractArtworks(
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


// =========================================================
// MY WRITINGS
// =========================================================

function MyWritings() {

  const navigate =
    useNavigate();


  const {
    t,
    language:
      uiLanguage,
  } = useLanguage();


  // =======================================================
  // MULTILINGUAL TEXT FOR NEW CONTENT
  // =======================================================

  const localText =
    useMemo(
      () => {

        const values = {

          bn: {

            title:
              "আমার সৃজনশীল সংগ্রহ",

            description:
              "আপনার খসড়া, প্রকাশিত লেখা, PDF ডকুমেন্ট এবং শিল্পকর্ম এক জায়গা থেকে পরিচালনা করুন।",

            newContent:
              "নতুন কনটেন্ট",

            creativeUploads:
              "ডকুমেন্ট ও শিল্পকর্ম",

            pdfDocuments:
              "PDF ডকুমেন্ট",

            artwork:
              "শিল্পকর্ম",

            searchDocuments:
              "PDF ডকুমেন্ট খুঁজুন…",

            searchArtwork:
              "শিল্পকর্ম খুঁজুন…",

            loadingDocuments:
              "PDF ডকুমেন্ট লোড হচ্ছে…",

            loadingArtwork:
              "শিল্পকর্ম লোড হচ্ছে…",

            noDocuments:
              "কোনো PDF ডকুমেন্ট নেই",

            noDocumentsDescription:
              "আপনার সংরক্ষিত বা প্রকাশিত PDF ডকুমেন্ট এখানে দেখা যাবে।",

            noArtwork:
              "কোনো শিল্পকর্ম নেই",

            noArtworkDescription:
              "আপনার সংরক্ষিত বা প্রকাশিত শিল্পকর্ম এখানে দেখা যাবে।",

            publishPdf:
              "PDF প্রকাশ করুন",

            publishArtwork:
              "শিল্পকর্ম প্রকাশ করুন",

            permanentConfirm:
              "স্থায়ীভাবে এই লেখাটি মুছে ফেলবেন? এই কাজটি আর ফিরিয়ে আনা যাবে না।",
          },


          en: {

            title:
              "My Creative Library",

            description:
              "Manage your drafts, published writings, PDF documents and artwork in one place.",

            newContent:
              "New Content",

            creativeUploads:
              "Documents & Artwork",

            pdfDocuments:
              "PDF Documents",

            artwork:
              "Artwork",

            searchDocuments:
              "Search PDF documents…",

            searchArtwork:
              "Search artwork…",

            loadingDocuments:
              "Loading PDF documents…",

            loadingArtwork:
              "Loading artwork…",

            noDocuments:
              "No PDF documents yet",

            noDocumentsDescription:
              "Your saved and published PDF documents will appear here.",

            noArtwork:
              "No artwork yet",

            noArtworkDescription:
              "Your saved and published artwork will appear here.",

            publishPdf:
              "Publish PDF",

            publishArtwork:
              "Publish Artwork",

            permanentConfirm:
              "Permanently delete this writing? This action cannot be undone.",
          },


          hi: {

            title:
              "मेरा रचनात्मक संग्रह",

            description:
              "अपने ड्राफ्ट, प्रकाशित रचनाएँ, PDF दस्तावेज़ और कलाकृतियाँ एक ही स्थान से प्रबंधित करें।",

            newContent:
              "नई सामग्री",

            creativeUploads:
              "दस्तावेज़ और कलाकृति",

            pdfDocuments:
              "PDF दस्तावेज़",

            artwork:
              "कलाकृति",

            searchDocuments:
              "PDF दस्तावेज़ खोजें…",

            searchArtwork:
              "कलाकृति खोजें…",

            loadingDocuments:
              "PDF दस्तावेज़ लोड हो रहे हैं…",

            loadingArtwork:
              "कलाकृतियाँ लोड हो रही हैं…",

            noDocuments:
              "कोई PDF दस्तावेज़ नहीं है",

            noDocumentsDescription:
              "आपके सहेजे गए और प्रकाशित PDF दस्तावेज़ यहाँ दिखाई देंगे।",

            noArtwork:
              "कोई कलाकृति नहीं है",

            noArtworkDescription:
              "आपकी सहेजी गई और प्रकाशित कलाकृतियाँ यहाँ दिखाई देंगी।",

            publishPdf:
              "PDF प्रकाशित करें",

            publishArtwork:
              "कलाकृति प्रकाशित करें",

            permanentConfirm:
              "इस रचना को स्थायी रूप से हटाएँ? यह कार्रवाई वापस नहीं की जा सकती।",
          },
        };


        return (
          values[
            uiLanguage
          ] ||
          values.en
        );

      },
      [
        uiLanguage,
      ]
    );


  // =======================================================
  // MAIN TAB
  //
  // draft
  // published
  // uploads
  // deleted
  // =======================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "draft"
  );


  // =======================================================
  // UPLOAD SUB TAB
  //
  // documents
  // artworks
  // =======================================================

  const [
    uploadTab,
    setUploadTab,
  ] = useState(
    "documents"
  );


  // =======================================================
  // DATA
  // =======================================================

  const [
    writings,
    setWritings,
  ] = useState([]);


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    artworks,
    setArtworks,
  ] = useState([]);


  // =======================================================
  // COUNTS
  // =======================================================

  const [
    draftCount,
    setDraftCount,
  ] = useState(0);


  const [
    publishedCount,
    setPublishedCount,
  ] = useState(0);


  const [
    documentCount,
    setDocumentCount,
  ] = useState(0);


  const [
    artworkCount,
    setArtworkCount,
  ] = useState(0);


  const [
    trashCount,
    setTrashCount,
  ] = useState(0);


  // =======================================================
  // FILTER STATE
  // =======================================================

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    language,
    setLanguage,
  ] = useState("");


  const [
    sortBy,
    setSortBy,
  ] = useState(
    "recent"
  );


  // =======================================================
  // UI STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    actionId,
    setActionId,
  ] = useState(null);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =======================================================
  // DELETE MODAL
  // =======================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);


  const [
    deleting,
    setDeleting,
  ] = useState(false);


  // =======================================================
  // LOAD COUNTS
  // =======================================================

  const loadCounts =
    useCallback(
      async () => {

        const results =
          await Promise.allSettled([

            getMyWritings({
              status:
                "draft",
            }),

            getMyWritings({
              status:
                "published",
            }),

            getMyWritings({
              status:
                "deleted",
            }),

            getMyDocuments(),

            getMyArtworks(),
          ]);


        const [
          draftsResult,
          publishedResult,
          trashResult,
          documentsResult,
          artworksResult,
        ] = results;


        if (
          draftsResult.status ===
          "fulfilled"
        ) {

          setDraftCount(
            extractWritings(
              draftsResult.value
            ).length
          );
        }


        if (
          publishedResult.status ===
          "fulfilled"
        ) {

          setPublishedCount(
            extractWritings(
              publishedResult.value
            ).length
          );
        }


        if (
          trashResult.status ===
          "fulfilled"
        ) {

          setTrashCount(
            extractWritings(
              trashResult.value
            ).length
          );
        }


        if (
          documentsResult.status ===
          "fulfilled"
        ) {

          setDocumentCount(
            extractDocuments(
              documentsResult.value
            ).length
          );

        } else {

          console.error(
            "DOCUMENT COUNT ERROR:",
            documentsResult.reason
          );
        }


        if (
          artworksResult.status ===
          "fulfilled"
        ) {

          setArtworkCount(
            extractArtworks(
              artworksResult.value
            ).length
          );

        } else {

          console.error(
            "ARTWORK COUNT ERROR:",
            artworksResult.reason
          );
        }

      },
      []
    );


  // =======================================================
  // LOAD WRITINGS
  // =======================================================

  const loadWritings =
    useCallback(
      async (
        status,
        showMainLoader = true
      ) => {

        if (
          showMainLoader
        ) {

          setLoading(
            true
          );

        } else {

          setRefreshing(
            true
          );
        }


        setError(
          ""
        );


        try {

          const data =
            await getMyWritings({
              status,
            });


          const items =
            extractWritings(
              data
            );


          setWritings(
            items
          );


          setDocuments(
            []
          );


          setArtworks(
            []
          );


          if (
            status ===
            "draft"
          ) {

            setDraftCount(
              items.length
            );
          }


          if (
            status ===
            "published"
          ) {

            setPublishedCount(
              items.length
            );
          }


          if (
            status ===
            "deleted"
          ) {

            setTrashCount(
              items.length
            );
          }


        } catch (
          err
        ) {

          console.error(
            "MY WRITINGS ERROR:",
            err
          );


          setWritings(
            []
          );


          setError(
            err?.message ||
            t(
              "errors.generic"
            )
          );


        } finally {

          setLoading(
            false
          );


          setRefreshing(
            false
          );
        }

      },
      [
        t,
      ]
    );


  // =======================================================
  // LOAD DOCUMENTS
  // =======================================================

  const loadDocuments =
    useCallback(
      async (
        showMainLoader = true
      ) => {

        if (
          showMainLoader
        ) {

          setLoading(
            true
          );

        } else {

          setRefreshing(
            true
          );
        }


        setError(
          ""
        );


        try {

          const data =
            await getMyDocuments();


          const items =
            extractDocuments(
              data
            );


          setDocuments(
            items
          );


          setArtworks(
            []
          );


          setWritings(
            []
          );


          setDocumentCount(
            items.length
          );


        } catch (
          err
        ) {

          console.error(
            "MY DOCUMENTS ERROR:",
            err
          );


          setDocuments(
            []
          );


          setError(
            err?.message ||
            "Unable to load your PDF documents."
          );


        } finally {

          setLoading(
            false
          );


          setRefreshing(
            false
          );
        }

      },
      []
    );


  // =======================================================
  // LOAD ARTWORK
  // =======================================================

  const loadArtworks =
    useCallback(
      async (
        showMainLoader = true
      ) => {

        if (
          showMainLoader
        ) {

          setLoading(
            true
          );

        } else {

          setRefreshing(
            true
          );
        }


        setError(
          ""
        );


        try {

          const data =
            await getMyArtworks();


          const items =
            extractArtworks(
              data
            );


          setArtworks(
            items
          );


          setDocuments(
            []
          );


          setWritings(
            []
          );


          setArtworkCount(
            items.length
          );


        } catch (
          err
        ) {

          console.error(
            "MY ARTWORK ERROR:",
            err
          );


          setArtworks(
            []
          );


          setError(
            err?.message ||
            "Unable to load your artwork."
          );


        } finally {

          setLoading(
            false
          );


          setRefreshing(
            false
          );
        }

      },
      []
    );


  // =======================================================
  // INITIAL COUNTS
  // =======================================================

  useEffect(
    () => {

      loadCounts();

    },
    [
      loadCounts,
    ]
  );


  // =======================================================
  // ACTIVE CONTENT LOAD
  // =======================================================

  useEffect(
    () => {

      setSearch(
        ""
      );


      setLanguage(
        ""
      );


      setSortBy(
        "recent"
      );


      setSuccess(
        ""
      );


      setError(
        ""
      );


      if (
        activeTab ===
        "uploads"
      ) {

        if (
          uploadTab ===
          "artworks"
        ) {

          loadArtworks();

        } else {

          loadDocuments();
        }


        return;
      }


      loadWritings(
        activeTab
      );

    },
    [
      activeTab,
      uploadTab,
      loadArtworks,
      loadDocuments,
      loadWritings,
    ]
  );


  // =======================================================
  // FORMAT DATE
  // =======================================================

  function formatDate(
    dateString
  ) {

    if (
      !dateString
    ) {

      return t(
        "common.noData"
      );
    }


    const date =
      new Date(
        dateString
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return t(
        "common.noData"
      );
    }


    const localeMap = {
      bn:
        "bn-BD",
      en:
        "en-US",
      hi:
        "hi-IN",
    };


    try {

      return new Intl
        .DateTimeFormat(
          localeMap[
            uiLanguage
          ] ||
          undefined,
          {
            day:
              "numeric",

            month:
              "short",

            year:
              "numeric",

            hour:
              "numeric",

            minute:
              "2-digit",
          }
        )
        .format(
          date
        );

    } catch {

      return date
        .toLocaleString();
    }
  }


  // =======================================================
  // WORD COUNT
  // =======================================================

  function getWordCount(
    content
  ) {

    if (
      !content ||
      !content.trim()
    ) {

      return 0;
    }


    return content
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      )
      .length;
  }


  // =======================================================
  // READING TIME
  // =======================================================

  function getReadingTime(
    content
  ) {

    return Math.max(
      1,
      Math.ceil(
        getWordCount(
          content
        ) /
        180
      )
    );
  }


  // =======================================================
  // GENERIC CONTENT FILTER
  // =======================================================

  function filterMediaItems(
    items
  ) {

    const normalizedSearch =
      search
        .trim()
        .toLowerCase();


    let result = [
      ...items,
    ];


    if (
      normalizedSearch
    ) {

      result =
        result.filter(
          (
            item
          ) => {

            const title =
              String(
                item.title ||
                ""
              )
                .toLowerCase();


            const description =
              String(
                item.description ||
                ""
              )
                .toLowerCase();


            const category =
              String(
                item.category ||
                ""
              )
                .toLowerCase();


            const filename =
              String(
                item.original_filename ||
                ""
              )
                .toLowerCase();


            const languageCode =
              item.language ||
              "bn";


            let languageLabel =
              languageCode;


            try {

              languageLabel =
                getLanguageLabel(
                  languageCode
                )
                  .toLowerCase();

            } catch {

              languageLabel =
                String(
                  languageCode
                )
                  .toLowerCase();
            }


            return (
              title.includes(
                normalizedSearch
              )
              ||
              description.includes(
                normalizedSearch
              )
              ||
              category.includes(
                normalizedSearch
              )
              ||
              filename.includes(
                normalizedSearch
              )
              ||
              languageLabel.includes(
                normalizedSearch
              )
            );
          }
        );
    }


    if (
      language
    ) {

      result =
        result.filter(
          (
            item
          ) =>
            (
              item.language ||
              "bn"
            ) ===
            language
        );
    }


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
              a.updated_at ||
              a.published_at ||
              a.created_at ||
              0
            )
            -
            new Date(
              b.updated_at ||
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

          return (
            String(
              a.title ||
              ""
            )
              .localeCompare(
                String(
                  b.title ||
                  ""
                )
              )
          );
        }


        if (
          sortBy ===
          "created"
        ) {

          return (
            new Date(
              b.created_at ||
              0
            )
            -
            new Date(
              a.created_at ||
              0
            )
          );
        }


        return (
          new Date(
            b.updated_at ||
            b.published_at ||
            b.created_at ||
            0
          )
          -
          new Date(
            a.updated_at ||
            a.published_at ||
            a.created_at ||
            0
          )
        );
      }
    );


    return result;
  }


  // =======================================================
  // FILTER WRITINGS
  // =======================================================

  const filteredWritings =
    useMemo(
      () => {

        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        let result = [
          ...writings,
        ];


        if (
          normalizedSearch
        ) {

          result =
            result.filter(
              (
                writing
              ) => {

                const title =
                  String(
                    writing.title ||
                    ""
                  )
                    .toLowerCase();


                const content =
                  String(
                    writing.content ||
                    ""
                  )
                    .toLowerCase();


                const category =
                  String(
                    writing.category ||
                    ""
                  )
                    .toLowerCase();


                const languageCode =
                  writing.language ||
                  "bn";


                let languageLabel =
                  languageCode;


                try {

                  languageLabel =
                    getLanguageLabel(
                      languageCode
                    )
                      .toLowerCase();

                } catch {

                  languageLabel =
                    languageCode;
                }


                return (
                  title.includes(
                    normalizedSearch
                  )
                  ||
                  content.includes(
                    normalizedSearch
                  )
                  ||
                  category.includes(
                    normalizedSearch
                  )
                  ||
                  languageLabel.includes(
                    normalizedSearch
                  )
                );
              }
            );
        }


        if (
          language
        ) {

          result =
            result.filter(
              (
                writing
              ) =>
                (
                  writing.language ||
                  "bn"
                ) ===
                language
            );
        }


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
                  a.updated_at ||
                  a.created_at ||
                  0
                )
                -
                new Date(
                  b.updated_at ||
                  b.created_at ||
                  0
                )
              );
            }


            if (
              sortBy ===
              "title"
            ) {

              return (
                String(
                  a.title ||
                  ""
                )
                  .localeCompare(
                    String(
                      b.title ||
                      ""
                    )
                  )
              );
            }


            if (
              sortBy ===
              "created"
            ) {

              return (
                new Date(
                  b.created_at ||
                  0
                )
                -
                new Date(
                  a.created_at ||
                  0
                )
              );
            }


            return (
              new Date(
                b.updated_at ||
                b.created_at ||
                0
              )
              -
              new Date(
                a.updated_at ||
                a.created_at ||
                0
              )
            );
          }
        );


        return result;

      },
      [
        writings,
        search,
        language,
        sortBy,
      ]
    );


  // =======================================================
  // FILTER DOCUMENTS
  // =======================================================

  const filteredDocuments =
    useMemo(
      () =>
        filterMediaItems(
          documents
        ),
      [
        documents,
        search,
        language,
        sortBy,
      ]
    );


  // =======================================================
  // FILTER ARTWORK
  // =======================================================

  const filteredArtworks =
    useMemo(
      () =>
        filterMediaItems(
          artworks
        ),
      [
        artworks,
        search,
        language,
        sortBy,
      ]
    );


  // =======================================================
  // CURRENT RESULTS
  // =======================================================

  const currentItems =
    activeTab ===
    "uploads"
      ? (
          uploadTab ===
          "artworks"
            ? filteredArtworks
            : filteredDocuments
        )
      : filteredWritings;


  const currentTotal =
    activeTab ===
    "uploads"
      ? (
          uploadTab ===
          "artworks"
            ? artworks.length
            : documents.length
        )
      : writings.length;


  // =======================================================
  // PUBLISH WRITING
  // =======================================================

  async function handlePublish(
    writingId
  ) {

    setActionId(
      writingId
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      await publishWriting(
        writingId
      );


      setSuccess(
        t(
          "write.publishedSuccess"
        )
      );


      await Promise.all([

        loadWritings(
          "draft",
          false
        ),

        loadCounts(),
      ]);


    } catch (
      err
    ) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setActionId(
        null
      );
    }
  }


  // =======================================================
  // UNPUBLISH
  // =======================================================

  async function handleUnpublish(
    writingId
  ) {

    setActionId(
      writingId
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      await unpublishWriting(
        writingId
      );


      setSuccess(
        t(
          "myWritings.moveToDraft"
        )
      );


      await Promise.all([

        loadWritings(
          "published",
          false
        ),

        loadCounts(),
      ]);


    } catch (
      err
    ) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setActionId(
        null
      );
    }
  }


  // =======================================================
  // RESTORE
  // =======================================================

  async function handleRestore(
    writingId
  ) {

    setActionId(
      writingId
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      const response =
        await restoreWriting(
          writingId
        );


      const restoredWriting =
        response?.writing ||
        response;


      setWritings(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              writingId
          )
      );


      setTrashCount(
        (
          current
        ) =>
          Math.max(
            0,
            current - 1
          )
      );


      if (
        restoredWriting?.status ===
        "published"
      ) {

        setPublishedCount(
          (
            current
          ) =>
            current + 1
        );

      } else {

        setDraftCount(
          (
            current
          ) =>
            current + 1
        );
      }


      setSuccess(
        t(
          "myWritings.restored"
        )
      );


    } catch (
      err
    ) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setActionId(
        null
      );
    }
  }


  // =======================================================
  // PERMANENT DELETE
  // =======================================================

  async function handlePermanentDelete(
    writing
  ) {

    const confirmed =
      window.confirm(
        `${localText.permanentConfirm}\n\n“${
          writing.title ||
          t(
            "common.untitled"
          )
        }”`
      );


    if (
      !confirmed
    ) {

      return;
    }


    setActionId(
      writing.id
    );


    setError(
      ""
    );


    try {

      await permanentlyDeleteWriting(
        writing.id
      );


      setWritings(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              writing.id
          )
      );


      setTrashCount(
        (
          current
        ) =>
          Math.max(
            0,
            current - 1
          )
      );


      setSuccess(
        t(
          "myWritings.permanentlyDeleted"
        )
      );


    } catch (
      err
    ) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setActionId(
        null
      );
    }
  }


  // =======================================================
  // DELETE MODAL
  // =======================================================

  function openDeleteModal(
    writing
  ) {

    setDeleteTarget(
      writing
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );
  }


  function closeDeleteModal() {

    if (
      deleting
    ) {

      return;
    }


    setDeleteTarget(
      null
    );
  }


  async function confirmDelete() {

    if (
      !deleteTarget
    ) {

      return;
    }


    setDeleting(
      true
    );


    setActionId(
      deleteTarget.id
    );


    setError(
      ""
    );


    try {

      await deleteWriting(
        deleteTarget.id
      );


      setWritings(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              deleteTarget.id
          )
      );


      if (
        activeTab ===
        "draft"
      ) {

        setDraftCount(
          (
            current
          ) =>
            Math.max(
              0,
              current - 1
            )
        );
      }


      if (
        activeTab ===
        "published"
      ) {

        setPublishedCount(
          (
            current
          ) =>
            Math.max(
              0,
              current - 1
            )
        );
      }


      setTrashCount(
        (
          current
        ) =>
          current + 1
      );


      setSuccess(
        t(
          "myWritings.movedToTrash"
        )
      );


      setDeleteTarget(
        null
      );


    } catch (
      err
    ) {

      setError(
        err?.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setDeleting(
        false
      );


      setActionId(
        null
      );
    }
  }


  // =======================================================
  // EDIT
  // =======================================================

  function handleEdit(
    writing
  ) {

    navigate(
      `/write/${writing.id}`,
      {
        state: {
          writing,
        },
      }
    );
  }


  // =======================================================
  // REFRESH
  // =======================================================

  async function handleRefresh() {

    setSuccess(
      ""
    );


    if (
      activeTab ===
      "uploads"
    ) {

      if (
        uploadTab ===
        "artworks"
      ) {

        await Promise.all([
          loadArtworks(
            false
          ),
          loadCounts(),
        ]);

      } else {

        await Promise.all([
          loadDocuments(
            false
          ),
          loadCounts(),
        ]);
      }


      return;
    }


    await Promise.all([

      loadWritings(
        activeTab,
        false
      ),

      loadCounts(),
    ]);
  }


  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  function clearFilters() {

    setSearch(
      ""
    );


    setLanguage(
      ""
    );


    setSortBy(
      "recent"
    );
  }


  // =======================================================
  // SEARCH PLACEHOLDER
  // =======================================================

  function getSearchPlaceholder() {

    if (
      activeTab ===
      "uploads"
    ) {

      return (
        uploadTab ===
        "artworks"
          ? localText.searchArtwork
          : localText.searchDocuments
      );
    }


    if (
      activeTab ===
      "draft"
    ) {

      return t(
        "myWritings.searchDrafts"
      );
    }


    if (
      activeTab ===
      "published"
    ) {

      return t(
        "myWritings.searchPublished"
      );
    }


    return t(
      "myWritings.trash"
    );
  }


  // =======================================================
  // CURRENT TITLE
  // =======================================================

  function getCurrentTabTitle() {

    if (
      activeTab ===
      "draft"
    ) {

      return t(
        "myWritings.drafts"
      );
    }


    if (
      activeTab ===
      "published"
    ) {

      return t(
        "myWritings.published"
      );
    }


    if (
      activeTab ===
      "uploads"
    ) {

      return (
        uploadTab ===
        "artworks"
          ? localText.artwork
          : localText.pdfDocuments
      );
    }


    return t(
      "myWritings.trash"
    );
  }


  // =======================================================
  // UPLOAD TAB STYLE
  // =======================================================

  function uploadButtonStyle(
    selected
  ) {

    return {

      flex:
        "1 1 220px",

      minHeight:
        "50px",

      display:
        "flex",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        "9px",

      padding:
        "10px 16px",

      border:
        selected
          ? "1px solid #641a82"
          : "1px solid #e6ddd3",

      borderRadius:
        "12px",

      background:
        selected
          ? "#641a82"
          : "#ffffff",

      color:
        selected
          ? "#ffffff"
          : "#5f5146",

      font:
        "inherit",

      fontWeight:
        "700",

      cursor:
        "pointer",

      transition:
        "0.18s ease",
    };
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="my-writings-page"
    >

      <div
        className="my-writings-shell"
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <header
          className="my-writings-header"
        >

          <div>

            <p
              className="my-writings-eyebrow"
            >

              {t(
                "myWritings.eyebrow"
              )}

            </p>


            <h1>
              {localText.title}
            </h1>


            <p>
              {localText.description}
            </p>

          </div>


          <Link
            to="/write"
            className="my-writings-new-button"
          >

            <Edit3
              size={18}
            />

            {localText.newContent}

          </Link>

        </header>


        {/* =================================================
            SUMMARY
        ================================================== */}

        <section
          className="my-writing-summary"
        >

          {/* DRAFT */}

          <button
            type="button"
            className={
              activeTab ===
              "draft"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "draft"
              )
            }
          >

            <span
              className="my-writing-summary-icon draft"
            >

              <FileText
                size={20}
              />

            </span>


            <div>

              <span>
                {t(
                  "myWritings.drafts"
                )}
              </span>


              <strong>
                {draftCount}
              </strong>

            </div>

          </button>


          {/* PUBLISHED */}

          <button
            type="button"
            className={
              activeTab ===
              "published"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "published"
              )
            }
          >

            <span
              className="my-writing-summary-icon published"
            >

              <BookOpen
                size={20}
              />

            </span>


            <div>

              <span>
                {t(
                  "myWritings.published"
                )}
              </span>


              <strong>
                {publishedCount}
              </strong>

            </div>

          </button>


          {/* DOCUMENTS + ARTWORK */}

          <button
            type="button"
            className={
              activeTab ===
              "uploads"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() => {

              setActiveTab(
                "uploads"
              );

            }}
          >

            <span
              className="my-writing-summary-icon document"
            >

              <Files
                size={20}
              />

            </span>


            <div>

              <span>
                {localText.creativeUploads}
              </span>


              <strong>
                {
                  documentCount +
                  artworkCount
                }
              </strong>

            </div>

          </button>


          {/* TRASH */}

          <button
            type="button"
            className={
              activeTab ===
              "deleted"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "deleted"
              )
            }
          >

            <span
              className="my-writing-summary-icon trash"
            >

              <Trash2
                size={20}
              />

            </span>


            <div>

              <span>
                {t(
                  "myWritings.trash"
                )}
              </span>


              <strong>
                {trashCount}
              </strong>

            </div>

          </button>

        </section>


        {/* =================================================
            MESSAGES
        ================================================== */}

        {error && (

          <div
            className="write-message error"
            role="alert"
          >
            {error}
          </div>

        )}


        {success && (

          <div
            className="write-message success"
            role="status"
          >

            <CheckCircle2
              size={18}
            />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* =================================================
            DOCUMENT / ARTWORK SUB TABS
        ================================================== */}

        {activeTab ===
          "uploads" && (

          <section
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                "10px",

              padding:
                "7px",

              margin:
                "4px 0 18px",

              border:
                "1px solid #e9dfd5",

              borderRadius:
                "15px",

              background:
                "#fbf8f4",
            }}
          >

            <button
              type="button"
              style={
                uploadButtonStyle(
                  uploadTab ===
                  "documents"
                )
              }
              onClick={() =>
                setUploadTab(
                  "documents"
                )
              }
            >

              <FileText
                size={18}
              />

              <span>
                {localText.pdfDocuments}
              </span>

              <strong>
                {documentCount}
              </strong>

            </button>


            <button
              type="button"
              style={
                uploadButtonStyle(
                  uploadTab ===
                  "artworks"
                )
              }
              onClick={() =>
                setUploadTab(
                  "artworks"
                )
              }
            >

              <ImageIcon
                size={18}
              />

              <span>
                {localText.artwork}
              </span>

              <strong>
                {artworkCount}
              </strong>

            </button>

          </section>

        )}


        {/* =================================================
            FILTERS
        ================================================== */}

        <section
          className="my-writing-controls"
        >

          {/* SEARCH */}

          <div
            className="my-writing-search"
          >

            <Search
              size={17}
            />


            <input
              type="search"
              placeholder={
                getSearchPlaceholder()
              }
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label={
                t(
                  "common.search"
                )
              }
            />


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch(
                    ""
                  )
                }
                aria-label={
                  t(
                    "common.clear"
                  )
                }
              >

                <X
                  size={15}
                />

              </button>

            )}

          </div>


          {/* LANGUAGE */}

          <div
            className="my-writing-language-filter"
          >

            <Globe2
              size={16}
            />


            <select
              value={
                language
              }
              onChange={(
                event
              ) =>
                setLanguage(
                  event.target.value
                )
              }
              aria-label={
                t(
                  "common.language"
                )
              }
            >

              <option
                value=""
              >

                {t(
                  "myWritings.allLanguages"
                )}

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
                      item.nativeName ===
                      item.name
                        ? item.name
                        : `${item.nativeName} — ${item.name}`
                    }

                  </option>

                )
              )}

            </select>

          </div>


          {/* SORT */}

          <div
            className="my-writing-sort"
          >

            <SlidersHorizontal
              size={16}
            />


            <select
              value={
                sortBy
              }
              onChange={(
                event
              ) =>
                setSortBy(
                  event.target.value
                )
              }
            >

              <option
                value="recent"
              >
                {t(
                  "myWritings.recentlyUpdated"
                )}
              </option>


              <option
                value="created"
              >
                {t(
                  "myWritings.recentlyCreated"
                )}
              </option>


              <option
                value="oldest"
              >
                {t(
                  "myWritings.oldestFirst"
                )}
              </option>


              <option
                value="title"
              >
                {t(
                  "myWritings.titleAZ"
                )}
              </option>

            </select>

          </div>


          {/* REFRESH */}

          <button
            type="button"
            className="my-writing-refresh"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing ||
              loading
            }
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />


            <span>
              {t(
                "myWritings.refresh"
              )}
            </span>

          </button>

        </section>


        {/* =================================================
            RESULT INFO
        ================================================== */}

        <div
          className="my-writings-toolbar"
        >

          <div
            className="my-writings-result-info"
          >

            <span>

              {getCurrentTabTitle()}

              {" · "}

              {currentItems.length}


              {(
                search ||
                language
              ) && (
                <>
                  {" / "}
                  {currentTotal}
                </>
              )}

            </span>


            {language && (

              <span
                className="my-writing-active-language"
              >

                <Globe2
                  size={12}
                />

                {getLanguageLabel(
                  language
                )}

              </span>

            )}

          </div>


          {(search ||
            language) && (

            <button
              type="button"
              className="my-writing-clear-filters"
              onClick={
                clearFilters
              }
            >

              <X
                size={13}
              />

              {t(
                "myWritings.clearFilters"
              )}

            </button>

          )}

        </div>


        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (

          <div
            className="my-writings-loading"
          >

            <Loader2
              size={30}
              className="spin"
            />


            <p>

              {
                activeTab ===
                "uploads"
                  ? (
                      uploadTab ===
                      "artworks"
                        ? localText.loadingArtwork
                        : localText.loadingDocuments
                    )
                  : t(
                      "myWritings.loading"
                    )
              }

            </p>

          </div>

        )}


        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {!loading &&
        currentItems.length ===
          0 && (

          <section
            className="my-writings-empty"
          >

            <div
              className="my-writings-empty-icon"
            >

              {search ||
              language
                ? (

                    <Search
                      size={30}
                    />

                  )
                : activeTab ===
                  "uploads"
                  ? (
                      uploadTab ===
                      "artworks"
                        ? (
                            <ImageIcon
                              size={30}
                            />
                          )
                        : (
                            <FileText
                              size={30}
                            />
                          )
                    )
                  : activeTab ===
                    "draft"
                    ? (

                        <FileText
                          size={30}
                        />

                      )
                    : activeTab ===
                      "deleted"
                      ? (

                          <Trash2
                            size={30}
                          />

                        )
                      : (

                          <BookOpen
                            size={30}
                          />

                        )}

            </div>


            <h2>

              {
                search ||
                language
                  ? t(
                      "myWritings.noResults"
                    )
                  : activeTab ===
                    "uploads"
                    ? (
                        uploadTab ===
                        "artworks"
                          ? localText.noArtwork
                          : localText.noDocuments
                      )
                    : activeTab ===
                      "draft"
                      ? t(
                          "myWritings.noDrafts"
                        )
                      : activeTab ===
                        "deleted"
                        ? t(
                            "myWritings.noTrash"
                          )
                        : t(
                            "myWritings.noPublished"
                          )
              }

            </h2>


            <p>

              {
                search ||
                language
                  ? t(
                      "myWritings.noResultsDescription"
                    )
                  : activeTab ===
                    "uploads"
                    ? (
                        uploadTab ===
                        "artworks"
                          ? localText.noArtworkDescription
                          : localText.noDocumentsDescription
                      )
                    : activeTab ===
                      "draft"
                      ? t(
                          "myWritings.noDraftsDescription"
                        )
                      : activeTab ===
                        "deleted"
                        ? t(
                            "myWritings.noTrashDescription"
                          )
                        : t(
                            "myWritings.noPublishedDescription"
                          )
              }

            </p>


            {search ||
            language
              ? (

                  <button
                    type="button"
                    className="my-writings-new-button"
                    onClick={
                      clearFilters
                    }
                  >

                    {t(
                      "myWritings.clearFilters"
                    )}

                  </button>

                )
              : activeTab !==
                  "deleted"
                ? (

                    <Link
                      to="/write"
                      className="my-writings-new-button"
                    >

                      {activeTab ===
                      "uploads" &&
                      uploadTab ===
                        "artworks"
                        ? (

                            <ImageIcon
                              size={17}
                            />

                          )
                        : (

                            <Edit3
                              size={17}
                            />

                          )}


                      {
                        activeTab ===
                        "uploads"
                          ? (
                              uploadTab ===
                              "artworks"
                                ? localText.publishArtwork
                                : localText.publishPdf
                            )
                          : t(
                              "myWritings.startWriting"
                            )
                      }

                    </Link>

                  )
                : null}

          </section>

        )}


        {/* =================================================
            DOCUMENT GRID
        ================================================== */}

        {activeTab ===
          "uploads" &&
        uploadTab ===
          "documents" &&
        !loading &&
        filteredDocuments.length >
          0 && (

          <section
            className="explore-document-grid"
          >

            {filteredDocuments.map(
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
            ARTWORK GRID
        ================================================== */}

        {activeTab ===
          "uploads" &&
        uploadTab ===
          "artworks" &&
        !loading &&
        filteredArtworks.length >
          0 && (

          <section
            className="explore-artwork-grid"
          >

            {filteredArtworks.map(
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
            WRITINGS GRID
        ================================================== */}

        {activeTab !==
          "uploads" &&
        !loading &&
        filteredWritings.length >
          0 && (

          <section
            className="my-writings-grid"
          >

            {filteredWritings.map(
              (
                writing
              ) => {

                const busy =
                  actionId ===
                  writing.id;


                const wordCount =
                  getWordCount(
                    writing.content
                  );


                const readingTime =
                  getReadingTime(
                    writing.content
                  );


                const languageCode =
                  writing.language ||
                  "bn";


                return (

                  <article
                    key={
                      writing.id
                    }
                    className="my-writing-card"
                  >

                    {/* TOP */}

                    <div
                      className="my-writing-card-top"
                    >

                      <div
                        className="my-writing-card-badges"
                      >

                        <span
                          className={
                            writing.status ===
                            "published"
                              ? "my-writing-status published"
                              : writing.status ===
                                "deleted"
                                ? "my-writing-status deleted"
                                : "my-writing-status draft"
                          }
                        >

                          {
                            writing.status ===
                            "published"
                              ? t(
                                  "myWritings.published"
                                )
                              : writing.status ===
                                "deleted"
                                ? t(
                                    "myWritings.trash"
                                  )
                                : t(
                                    "myWritings.drafts"
                                  )
                          }

                        </span>


                        <span
                          className="my-writing-language-badge"
                        >

                          <Globe2
                            size={11}
                          />

                          {getLanguageLabel(
                            languageCode
                          )}

                        </span>

                      </div>


                      <span
                        className="my-writing-category"
                      >

                        {
                          writing.category ||
                          t(
                            "categories.other"
                          )
                        }

                      </span>

                    </div>


                    {/* TITLE */}

                    <h2>

                      {
                        writing.title ||
                        t(
                          "common.untitled"
                        )
                      }

                    </h2>


                    {/* PREVIEW */}

                    <p
                      className="my-writing-preview"
                    >

                      {
                        writing.content
                          ?.trim()
                          ?.slice(
                            0,
                            180
                          )
                        ||
                        t(
                          "common.noData"
                        )
                      }


                      {
                        writing.content
                          ?.length >
                        180
                          ? "..."
                          : ""
                      }

                    </p>


                    {/* STATS */}

                    <div
                      className="my-writing-card-stats"
                    >

                      <span>

                        <FileText
                          size={13}
                        />

                        {wordCount}

                        {" "}

                        {t(
                          "myWritings.words"
                        )}

                      </span>


                      <span>

                        <BookOpen
                          size={13}
                        />

                        {readingTime}

                        {" "}

                        {t(
                          "myWritings.readTime"
                        )}

                      </span>


                      <span>

                        <Globe2
                          size={13}
                        />

                        {getLanguageLabel(
                          languageCode
                        )}

                      </span>

                    </div>


                    {/* DATE */}

                    <div
                      className="my-writing-meta"
                    >

                      <span>

                        {t(
                          "myWritings.updated"
                        )}

                      </span>


                      <strong>

                        {formatDate(
                          writing.updated_at ||
                          writing.created_at
                        )}

                      </strong>

                    </div>


                    {/* ACTIONS */}

                    <div
                      className="my-writing-actions"
                    >

                      {writing.status ===
                      "deleted"
                        ? (

                            <>

                              <button
                                type="button"
                                className="primary"
                                onClick={() =>
                                  handleRestore(
                                    writing.id
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >

                                {busy
                                  ? (

                                      <Loader2
                                        size={16}
                                        className="spin"
                                      />

                                    )
                                  : (

                                      <RotateCcw
                                        size={16}
                                      />

                                    )}


                                {t(
                                  "myWritings.restore"
                                )}

                              </button>


                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handlePermanentDelete(
                                    writing
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >

                                <Trash2
                                  size={16}
                                />

                                {t(
                                  "myWritings.deletePermanently"
                                )}

                              </button>

                            </>

                          )
                        : (

                            <>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    writing
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >

                                <Edit3
                                  size={16}
                                />

                                {t(
                                  "myWritings.edit"
                                )}

                              </button>


                              {writing.status ===
                                "published" && (

                                <Link
                                  to={
                                    `/writings/${writing.id}`
                                  }
                                >

                                  <Eye
                                    size={16}
                                  />

                                  {t(
                                    "myWritings.view"
                                  )}

                                </Link>

                              )}


                              {writing.status ===
                                "draft" && (

                                <button
                                  type="button"
                                  className="primary"
                                  onClick={() =>
                                    handlePublish(
                                      writing.id
                                    )
                                  }
                                  disabled={
                                    busy
                                  }
                                >

                                  {busy
                                    ? (

                                        <Loader2
                                          size={16}
                                          className="spin"
                                        />

                                      )
                                    : (

                                        <Send
                                          size={16}
                                        />

                                      )}


                                  {t(
                                    "myWritings.publish"
                                  )}

                                </button>

                              )}


                              {writing.status ===
                                "published" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnpublish(
                                      writing.id
                                    )
                                  }
                                  disabled={
                                    busy
                                  }
                                >

                                  {busy
                                    ? (

                                        <Loader2
                                          size={16}
                                          className="spin"
                                        />

                                      )
                                    : (

                                        <RotateCcw
                                          size={16}
                                        />

                                      )}


                                  {t(
                                    "myWritings.moveToDraft"
                                  )}

                                </button>

                              )}


                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  openDeleteModal(
                                    writing
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >

                                <Trash2
                                  size={16}
                                />

                                {t(
                                  "myWritings.delete"
                                )}

                              </button>

                            </>

                          )}

                    </div>

                  </article>

                );
              }
            )}

          </section>

        )}

      </div>


      {/* ===================================================
          DELETE MODAL
      ==================================================== */}

      {deleteTarget && (

        <div
          className="delete-modal-overlay"
          role="presentation"
          onMouseDown={
            closeDeleteModal
          }
        >

          <section
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div
              className="delete-modal-icon"
            >

              <Trash2
                size={26}
              />

            </div>


            <button
              type="button"
              className="delete-modal-close"
              onClick={
                closeDeleteModal
              }
              disabled={
                deleting
              }
              aria-label={
                t(
                  "common.close"
                )
              }
            >

              <X
                size={18}
              />

            </button>


            <p
              className="delete-modal-eyebrow"
            >

              {t(
                "myWritings.deleteEyebrow"
              )}

            </p>


            <h2
              id="delete-modal-title"
            >

              {t(
                "myWritings.deleteTitle"
              )}

            </h2>


            <p
              className="delete-modal-description"
            >

              <strong>

                “{
                  deleteTarget.title ||
                  t(
                    "common.untitled"
                  )
                }”

              </strong>

              {" "}

              {t(
                "myWritings.deleteDescription"
              )}

            </p>


            <div
              className="delete-modal-writing-info"
            >

              <Globe2
                size={14}
              />

              <span>

                {getLanguageLabel(
                  deleteTarget.language ||
                  "bn"
                )}

              </span>

              <span>
                •
              </span>

              <span>

                {
                  deleteTarget.category ||
                  t(
                    "categories.other"
                  )
                }

              </span>

            </div>


            <div
              className="delete-modal-actions"
            >

              <button
                type="button"
                className="delete-modal-cancel"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleting
                }
              >

                {t(
                  "common.cancel"
                )}

              </button>


              <button
                type="button"
                className="delete-modal-confirm"
                onClick={
                  confirmDelete
                }
                disabled={
                  deleting
                }
              >

                {deleting
                  ? (

                      <Loader2
                        size={17}
                        className="spin"
                      />

                    )
                  : (

                      <Trash2
                        size={17}
                      />

                    )}


                {
                  deleting
                    ? t(
                        "myWritings.deleting"
                      )
                    : t(
                        "myWritings.deleteWriting"
                      )
                }

              </button>

            </div>

          </section>

        </div>

      )}

    </main>
  );
}


export default MyWritings;