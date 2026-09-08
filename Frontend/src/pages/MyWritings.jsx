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
  Globe2,
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
  LANGUAGES,
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";


function MyWritings() {

  const navigate =
    useNavigate();

  const {
    t,
  } = useLanguage();


  // =====================================================
  // MAIN STATE
  // =====================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState("draft");

  const [
    writings,
    setWritings,
  ] = useState([]);

  const [
    draftCount,
    setDraftCount,
  ] = useState(0);

  const [
    publishedCount,
    setPublishedCount,
  ] = useState(0);

  const [
    trashCount,
    setTrashCount,
  ] = useState(0);


  // =====================================================
  // FILTER STATE
  // =====================================================

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
  ] = useState("recent");


  // =====================================================
  // UI STATE
  // =====================================================

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


  // =====================================================
  // DELETE MODAL
  // =====================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  // =====================================================
  // LOAD COUNTS
  // =====================================================

  const loadCounts =
    useCallback(async () => {

      try {

        const [
          draftsData,
          publishedData,
          trashData,
        ] = await Promise.all([

          getMyWritings({
            status: "draft",
          }),

          getMyWritings({
            status: "published",
          }),

          getMyWritings({
            status: "deleted",
          }),

        ]);


        const drafts =
          Array.isArray(
            draftsData?.writings
          )
            ? draftsData.writings
            : [];


        const published =
          Array.isArray(
            publishedData?.writings
          )
            ? publishedData.writings
            : [];


        const trash =
          Array.isArray(
            trashData?.writings
          )
            ? trashData.writings
            : [];


        setDraftCount(
          drafts.length
        );

        setPublishedCount(
          published.length
        );

        setTrashCount(
          trash.length
        );

      } catch (err) {

        console.error(
          "COUNT LOAD ERROR:",
          err
        );

      }

    }, []);


  // =====================================================
  // LOAD CURRENT TAB
  // =====================================================

  const loadWritings =
    useCallback(
      async (
        status,
        showMainLoader = true
      ) => {

        if (showMainLoader) {

          setLoading(true);

        } else {

          setRefreshing(true);

        }


        setError("");


        try {

          const data =
            await getMyWritings({
              status,
            });


          const items =
            Array.isArray(
              data?.writings
            )
              ? data.writings
              : [];


          setWritings(
            items
          );


          if (
            status === "draft"
          ) {

            setDraftCount(
              items.length
            );

          }


          if (
            status === "published"
          ) {

            setPublishedCount(
              items.length
            );

          }


          if (
            status === "deleted"
          ) {

            setTrashCount(
              items.length
            );

          }

        } catch (err) {

          console.error(
            "MY WRITINGS ERROR:",
            err
          );


          setError(
            err.message ||
            t(
              "errors.generic"
            )
          );


          setWritings([]);

        } finally {

          setLoading(false);

          setRefreshing(false);

        }

      },
      [t]
    );


  // =====================================================
  // INITIAL COUNTS
  // =====================================================

  useEffect(() => {

    loadCounts();

  }, [loadCounts]);


  // =====================================================
  // ACTIVE TAB LOAD
  // =====================================================

  useEffect(() => {

    setSearch("");

    setLanguage("");

    setSuccess("");

    loadWritings(
      activeTab
    );

  }, [
    activeTab,
    loadWritings,
  ]);


  // =====================================================
  // DATE FORMAT
  // =====================================================

  function formatDate(
    dateString
  ) {

    if (!dateString) {

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


    try {

      return new Intl.DateTimeFormat(
        undefined,
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      ).format(date);

    } catch {

      return date
        .toLocaleString();

    }

  }


  // =====================================================
  // WORD COUNT
  // =====================================================

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
      .split(/\s+/)
      .filter(Boolean)
      .length;

  }


  // =====================================================
  // READING TIME
  // =====================================================

  function getReadingTime(
    content
  ) {

    const count =
      getWordCount(
        content
      );


    return Math.max(
      1,
      Math.ceil(
        count / 180
      )
    );

  }


  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredWritings =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      let result = [
        ...writings,
      ];


      if (normalizedSearch) {

        result =
          result.filter(
            (writing) => {

              const title =
                (
                  writing.title ||
                  ""
                ).toLowerCase();

              const content =
                (
                  writing.content ||
                  ""
                ).toLowerCase();

              const category =
                (
                  writing.category ||
                  ""
                ).toLowerCase();

              const languageCode =
                writing.language ||
                "bn";

              const languageLabel =
                getLanguageLabel(
                  languageCode
                ).toLowerCase();


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


      if (language) {

        result =
          result.filter(
            (writing) =>
              (
                writing.language ||
                "bn"
              ) === language
          );

      }


      result.sort(
        (a, b) => {

          if (
            sortBy === "oldest"
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
            sortBy === "title"
          ) {

            return (
              (
                a.title ||
                ""
              ).localeCompare(
                b.title ||
                ""
              )
            );

          }


          if (
            sortBy === "created"
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

    }, [
      writings,
      search,
      language,
      sortBy,
    ]);


  // =====================================================
  // PUBLISH
  // =====================================================

  async function handlePublish(
    writingId
  ) {

    setActionId(
      writingId
    );

    setError("");
    setSuccess("");


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

    } catch (err) {

      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );

    } finally {

      setActionId(null);

    }

  }


  // =====================================================
  // UNPUBLISH
  // =====================================================

  async function handleUnpublish(
    writingId
  ) {

    setActionId(
      writingId
    );

    setError("");
    setSuccess("");


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

    } catch (err) {

      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );

    } finally {

      setActionId(null);

    }

  }


  // =====================================================
  // RESTORE FROM TRASH
  // =====================================================

  async function handleRestore(
    writingId
  ) {

    setActionId(
      writingId
    );

    setError("");
    setSuccess("");


    try {

      const response =
        await restoreWriting(
          writingId
        );


      const restoredWriting =
        response?.writing ||
        response;


      setWritings(
        (current) =>
          current.filter(
            (item) =>
              item.id !== writingId
          )
      );


      setTrashCount(
        (current) =>
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
          (current) =>
            current + 1
        );

      } else {

        setDraftCount(
          (current) =>
            current + 1
        );

      }


      setSuccess(
        t(
          "myWritings.restored"
        )
      );

    } catch (err) {

      console.error(
        "RESTORE WRITING ERROR:",
        err
      );


      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );

    } finally {

      setActionId(null);

    }

  }


  // =====================================================
  // PERMANENT DELETE
  // =====================================================

  async function handlePermanentDelete(
    writing
  ) {

    const confirmed =
      window.confirm(
        `Permanently delete "${writing.title}"?\n\nThis action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    setActionId(
      writing.id
    );

    setError("");
    setSuccess("");


    try {

      await permanentlyDeleteWriting(
        writing.id
      );


      setWritings(
        (current) =>
          current.filter(
            (item) =>
              item.id !== writing.id
          )
      );


      setTrashCount(
        (current) =>
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

    } catch (err) {

      console.error(
        "PERMANENT DELETE ERROR:",
        err
      );


      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );

    } finally {

      setActionId(null);

    }

  }


  // =====================================================
  // DELETE MODAL
  // =====================================================

  function openDeleteModal(
    writing
  ) {

    setDeleteTarget(
      writing
    );

    setError("");
    setSuccess("");

  }


  function closeDeleteModal() {

    if (deleting) {

      return;

    }


    setDeleteTarget(
      null
    );

  }


  // =====================================================
  // MOVE TO TRASH
  // =====================================================

  async function confirmDelete() {

    if (!deleteTarget) {

      return;

    }


    setDeleting(true);

    setActionId(
      deleteTarget.id
    );

    setError("");
    setSuccess("");


    try {

      await deleteWriting(
        deleteTarget.id
      );


      setWritings(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              deleteTarget.id
          )
      );


      if (
        activeTab === "draft"
      ) {

        setDraftCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );

      }


      if (
        activeTab === "published"
      ) {

        setPublishedCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );

      }


      setTrashCount(
        (current) =>
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

    } catch (err) {

      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );

    } finally {

      setDeleting(false);

      setActionId(null);

    }

  }


  // =====================================================
  // EDIT
  // =====================================================

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


  // =====================================================
  // REFRESH
  // =====================================================

  async function handleRefresh() {

    setSuccess("");

    await Promise.all([

      loadWritings(
        activeTab,
        false
      ),

      loadCounts(),

    ]);

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  function clearFilters() {

    setSearch("");

    setLanguage("");

    setSortBy(
      "recent"
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <main className="my-writings-page">

      <div className="my-writings-shell">


        {/* HEADER */}

        <header className="my-writings-header">

          <div>

            <p className="my-writings-eyebrow">
              {t(
                "myWritings.eyebrow"
              )}
            </p>

            <h1>
              {t(
                "myWritings.title"
              )}
            </h1>

            <p>
              {t(
                "myWritings.description"
              )}
            </p>

          </div>


          <Link
            to="/write"
            className="my-writings-new-button"
          >

            <Edit3 size={18} />

            {t(
              "myWritings.newWriting"
            )}

          </Link>

        </header>


        {/* SUMMARY */}

        <section className="my-writing-summary">

          <button
            type="button"
            className={
              activeTab === "draft"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "draft"
              )
            }
          >

            <span className="my-writing-summary-icon draft">
              <FileText size={20} />
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


          <button
            type="button"
            className={
              activeTab === "published"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "published"
              )
            }
          >

            <span className="my-writing-summary-icon published">
              <BookOpen size={20} />
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


          <button
            type="button"
            className={
              activeTab === "deleted"
                ? "my-writing-summary-card active"
                : "my-writing-summary-card"
            }
            onClick={() =>
              setActiveTab(
                "deleted"
              )
            }
          >

            <span className="my-writing-summary-icon trash">
              <Trash2 size={20} />
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


        {/* MESSAGES */}

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


        {/* FILTERS */}

        <section className="my-writing-controls">

          <div className="my-writing-search">

            <Search size={17} />

            <input
              type="search"
              placeholder={
                activeTab === "draft"
                  ? t(
                      "myWritings.drafts"
                    )
                  : activeTab === "published"
                    ? t(
                        "myWritings.published"
                      )
                    : t(
                        "myWritings.trash"
                      )
              }
              value={search}
              onChange={(event) =>
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
                  setSearch("")
                }
                aria-label={
                  t(
                    "common.clear"
                  )
                }
              >

                <X size={15} />

              </button>

            )}

          </div>


          <div className="my-writing-language-filter">

            <Globe2 size={16} />

            <select
              value={language}
              onChange={(event) =>
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

              <option value="">
                {t(
                  "myWritings.allLanguages"
                )}
              </option>

              {LANGUAGES.map(
                (item) => (

                  <option
                    key={
                      item.code
                    }
                    value={
                      item.code
                    }
                  >

                    {item.nativeName ===
                    item.name
                      ? item.name
                      : `${item.nativeName} — ${item.name}`
                    }

                  </option>

                )
              )}

            </select>

          </div>


          <div className="my-writing-sort">

            <SlidersHorizontal
              size={16}
            />

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >

              <option value="recent">
                {t(
                  "myWritings.recentlyUpdated"
                )}
              </option>

              <option value="created">
                {t(
                  "myWritings.recentlyCreated"
                )}
              </option>

              <option value="oldest">
                {t(
                  "myWritings.oldestFirst"
                )}
              </option>

              <option value="title">
                {t(
                  "myWritings.titleAZ"
                )}
              </option>

            </select>

          </div>


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


        {/* RESULT INFO */}

        <div className="my-writings-toolbar">

          <div className="my-writings-result-info">

            <span>

              {activeTab === "draft"
                ? t(
                    "myWritings.drafts"
                  )
                : activeTab === "published"
                  ? t(
                      "myWritings.published"
                    )
                  : t(
                      "myWritings.trash"
                    )
              }

              {" · "}

              {filteredWritings.length}

              {search || language
                ? ` / ${writings.length}`
                : ""
              }

            </span>


            {language && (

              <span className="my-writing-active-language">

                <Globe2 size={12} />

                {getLanguageLabel(
                  language
                )}

              </span>

            )}

          </div>


          {(search || language) && (

            <button
              type="button"
              className="my-writing-clear-filters"
              onClick={
                clearFilters
              }
            >

              <X size={13} />

              {t(
                "myWritings.clearFilters"
              )}

            </button>

          )}

        </div>


        {/* LOADING */}

        {loading && (

          <div className="my-writings-loading">

            <Loader2
              size={30}
              className="spin"
            />

            <p>
              {t(
                "myWritings.loading"
              )}
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
        filteredWritings.length === 0 && (

          <section className="my-writings-empty">

            <div className="my-writings-empty-icon">

              {search || language ? (

                <Search size={30} />

              ) : activeTab === "draft" ? (

                <FileText size={30} />

              ) : activeTab === "deleted" ? (

                <Trash2 size={30} />

              ) : (

                <BookOpen size={30} />

              )}

            </div>


            <h2>

              {search || language
                ? t(
                    "myWritings.noResults"
                  )
                : activeTab === "draft"
                  ? t(
                      "myWritings.noDrafts"
                    )
                  : activeTab === "deleted"
                    ? t(
                        "myWritings.noTrash"
                      )
                    : t(
                        "myWritings.noPublished"
                      )
              }

            </h2>


            <p>

              {search || language
                ? t(
                    "myWritings.noResultsDescription"
                  )
                : activeTab === "draft"
                  ? t(
                      "myWritings.noDraftsDescription"
                    )
                  : activeTab === "deleted"
                    ? t(
                        "myWritings.noTrashDescription"
                      )
                    : t(
                        "myWritings.noPublishedDescription"
                      )
              }

            </p>


            {search || language ? (

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

            ) : activeTab !== "deleted" ? (

              <Link
                to="/write"
                className="my-writings-new-button"
              >

                <Edit3 size={17} />

                {t(
                  "myWritings.startWriting"
                )}

              </Link>

            ) : null}

          </section>

        )}


        {/* WRITINGS GRID */}

        {!loading &&
        filteredWritings.length > 0 && (

          <section className="my-writings-grid">

            {filteredWritings.map(
              (writing) => {

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

                    <div className="my-writing-card-top">

                      <div className="my-writing-card-badges">

                        <span
                          className={
                            writing.status === "published"
                              ? "my-writing-status published"
                              : writing.status === "deleted"
                                ? "my-writing-status deleted"
                                : "my-writing-status draft"
                          }
                        >

                          {writing.status === "published"
                            ? t(
                                "myWritings.published"
                              )
                            : writing.status === "deleted"
                              ? t(
                                  "myWritings.trash"
                                )
                              : t(
                                  "myWritings.drafts"
                                )
                          }

                        </span>


                        <span className="my-writing-language-badge">

                          <Globe2
                            size={11}
                          />

                          {getLanguageLabel(
                            languageCode
                          )}

                        </span>

                      </div>


                      <span className="my-writing-category">

                        {writing.category ||
                          t(
                            "categories.other"
                          )
                        }

                      </span>

                    </div>


                    <h2>

                      {writing.title ||
                        t(
                          "common.untitled"
                        )
                      }

                    </h2>


                    <p className="my-writing-preview">

                      {writing.content
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

                      {writing.content
                        ?.length > 180
                          ? "..."
                          : ""
                      }

                    </p>


                    <div className="my-writing-card-stats">

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


                    <div className="my-writing-meta">

                      <span>
                        {t(
                          "myWritings.updated"
                        )}
                      </span>

                      <strong>
                        {formatDate(
                          writing.updated_at
                        )}
                      </strong>

                    </div>


                    {/* ACTIONS */}

                    <div className="my-writing-actions">

                      {writing.status === "deleted" ? (

                        <>

                          <button
                            type="button"
                            className="primary"
                            onClick={() =>
                              handleRestore(
                                writing.id
                              )
                            }
                            disabled={busy}
                          >

                            {busy ? (

                              <Loader2
                                size={16}
                                className="spin"
                              />

                            ) : (

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
                            disabled={busy}
                          >

                            <Trash2
                              size={16}
                            />

                            {t(
                              "myWritings.deletePermanently"
                            )}

                          </button>

                        </>

                      ) : (

                        <>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                writing
                              )
                            }
                            disabled={busy}
                          >

                            <Edit3 size={16} />

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

                              <Eye size={16} />

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
                              disabled={busy}
                            >

                              {busy ? (

                                <Loader2
                                  size={16}
                                  className="spin"
                                />

                              ) : (

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
                              disabled={busy}
                            >

                              {busy ? (

                                <Loader2
                                  size={16}
                                  className="spin"
                                />

                              ) : (

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
                            disabled={busy}
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


      {/* DELETE / MOVE TO TRASH MODAL */}

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
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="delete-modal-icon">

              <Trash2 size={26} />

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

              <X size={18} />

            </button>


            <p className="delete-modal-eyebrow">

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


            <p className="delete-modal-description">

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


            <div className="delete-modal-writing-info">

              <Globe2 size={14} />

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

                {deleteTarget.category ||
                  t(
                    "categories.other"
                  )
                }

              </span>

            </div>


            <div className="delete-modal-actions">

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

                {deleting ? (

                  <Loader2
                    size={17}
                    className="spin"
                  />

                ) : (

                  <Trash2
                    size={17}
                  />

                )}


                {deleting
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