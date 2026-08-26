import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Cloud,
  CloudOff,
  FileText,
  Feather,
  Globe2,
  Loader2,
  Save,
  Send,
  Tag,
  Type,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createDraft,
  createWriting,
  getMyWriting,
  publishWriting,
  updateWriting,
} from "../api/api";

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  getLanguageLabel,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// DATABASE CATEGORY VALUES
// =========================================================
//
// Do NOT translate these values.
//
// These are the actual values stored in PostgreSQL.
// Only the visible labels should change.
// =========================================================

const CATEGORY_VALUES = [
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
];


const AUTOSAVE_DELAY = 2000;

const TITLE_LIMIT = 200;


// =========================================================
// COMPONENT
// =========================================================

function Write({
  user,
  onWritingCreated,
}) {

  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    t,
  } = useLanguage();


  const isEditMode =
    Boolean(id);


  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState(
    "কবিতা"
  );

  const [
    language,
    setLanguage,
  ] = useState(
    DEFAULT_LANGUAGE
  );

  const [
    content,
    setContent,
  ] = useState("");


  // =====================================================
  // WRITING STATE
  // =====================================================

  const [
    writingId,
    setWritingId,
  ] = useState(
    id || null
  );

  const [
    writingStatus,
    setWritingStatus,
  ] = useState("new");


  // =====================================================
  // SAVE STATE
  // =====================================================

  const [
    saveStatus,
    setSaveStatus,
  ] = useState("idle");

  const [
    lastSavedAt,
    setLastSavedAt,
  ] = useState(null);

  const [
    isDirty,
    setIsDirty,
  ] = useState(false);


  // =====================================================
  // UI STATE
  // =====================================================

  const [
    loadingWriting,
    setLoadingWriting,
  ] = useState(
    isEditMode
  );

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    manualSaving,
    setManualSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // =====================================================
  // REFS
  // =====================================================

  const initializedRef =
    useRef(false);

  const autosaveTimerRef =
    useRef(null);

  const savingRef =
    useRef(false);

  const creatingDraftRef =
    useRef(false);

  const latestFormRef =
    useRef({
      title: "",
      category: "কবিতা",
      language:
        DEFAULT_LANGUAGE,
      content: "",
    });


  // =====================================================
  // CATEGORY LABEL
  // =====================================================

  function getCategoryLabel(
    value
  ) {

    const map = {

      "কবিতা":
        t(
          "categories.poetry"
        ),

      "গল্প":
        t(
          "categories.story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay"
        ),

      "অন্যান্য":
        t(
          "categories.other"
        ),
    };


    return (
      map[value] ||
      value
    );

  }


  // =====================================================
  // KEEP LATEST FORM
  // =====================================================

  useEffect(() => {

    latestFormRef.current = {
      title,
      category,
      language,
      content,
    };

  }, [
    title,
    category,
    language,
    content,
  ]);


  // =====================================================
  // LOAD EXISTING WRITING
  // =====================================================

  useEffect(() => {

    if (!isEditMode) {

      initializedRef.current =
        true;

      return;

    }


    let mounted = true;


    async function loadWriting() {

      setLoadingWriting(
        true
      );

      setError("");


      try {

        const data =
          await getMyWriting(
            id
          );


        const writing =
          data?.writing;


        if (!writing) {

          throw new Error(
            t(
              "writingDetails.notFound"
            )
          );

        }


        if (!mounted) {
          return;
        }


        const loadedTitle =
          writing.title ===
          "Untitled"
            ? ""
            : (
              writing.title ||
              ""
            );


        const loadedCategory =
          writing.category ||
          "অন্যান্য";


        const loadedLanguage =
          writing.language ||
          DEFAULT_LANGUAGE;


        const loadedContent =
          writing.content ||
          "";


        setWritingId(
          writing.id
        );

        setWritingStatus(
          writing.status ||
          "draft"
        );

        setTitle(
          loadedTitle
        );

        setCategory(
          loadedCategory
        );

        setLanguage(
          loadedLanguage
        );

        setContent(
          loadedContent
        );


        latestFormRef.current = {
          title:
            loadedTitle,

          category:
            loadedCategory,

          language:
            loadedLanguage,

          content:
            loadedContent,
        };


        setIsDirty(false);

        setSaveStatus(
          "saved"
        );

        initializedRef.current =
          true;


      } catch (err) {

        console.error(
          "LOAD WRITING ERROR:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err.message ||
          t(
            "errors.generic"
          )
        );


      } finally {

        if (mounted) {

          setLoadingWriting(
            false
          );

        }

      }

    }


    loadWriting();


    return () => {

      mounted = false;

    };

  }, [
    id,
    isEditMode,
    t,
  ]);


  // =====================================================
  // MARK DIRTY
  // =====================================================

  useEffect(() => {

    if (
      !initializedRef.current ||
      loadingWriting
    ) {

      return;

    }


    setIsDirty(true);

    setSaveStatus(
      "unsaved"
    );

    setSuccess("");

  }, [
    title,
    category,
    language,
    content,
    loadingWriting,
  ]);


  // =====================================================
  // BUILD PAYLOAD
  // =====================================================

  const buildPayload =
    useCallback(() => {

      const form =
        latestFormRef.current;


      return {

        title:
          form.title.trim(),

        category:
          form.category,

        language:
          form.language,

        content:
          form.content.trim(),
      };

    }, []);


  // =====================================================
  // SAVE TO DATABASE
  // =====================================================

  const saveToDatabase =
    useCallback(
      async ({
        manual = false,
      } = {}) => {

        if (
          savingRef.current ||
          creatingDraftRef.current
        ) {

          return null;

        }


        const payload =
          buildPayload();


        if (
          !writingId &&
          !payload.title &&
          !payload.content
        ) {

          return null;

        }


        savingRef.current =
          true;

        setSaveStatus(
          "saving"
        );

        setError("");


        if (manual) {

          setManualSaving(
            true
          );

        }


        try {

          let data;


          // =============================================
          // UPDATE EXISTING
          // =============================================

          if (writingId) {

            data =
              await updateWriting(
                writingId,
                payload
              );


            if (
              data?.writing?.status
            ) {

              setWritingStatus(
                data.writing.status
              );

            }


          } else {

            // ===========================================
            // CREATE INITIAL DRAFT
            // ===========================================

            creatingDraftRef.current =
              true;


            data =
              await createDraft(
                payload
              );


            const newId =
              data?.writing?.id;


            if (!newId) {

              throw new Error(
                t(
                  "errors.generic"
                )
              );

            }


            setWritingId(
              newId
            );

            setWritingStatus(
              data?.writing?.status ||
              "draft"
            );


            navigate(
              `/write/${newId}`,
              {
                replace: true,
              }
            );

          }


          setIsDirty(false);

          setSaveStatus(
            "saved"
          );

          setLastSavedAt(
            new Date()
          );


          if (manual) {

            setSuccess(
              t(
                "write.draftSaved"
              )
            );

          }


          return data;


        } catch (err) {

          console.error(
            "SAVE WRITING ERROR:",
            err
          );


          setSaveStatus(
            "error"
          );


          if (manual) {

            setError(
              err.message ||
              t(
                "errors.generic"
              )
            );

          }


          throw err;


        } finally {

          savingRef.current =
            false;

          creatingDraftRef.current =
            false;


          if (manual) {

            setManualSaving(
              false
            );

          }

        }

      },
      [
        buildPayload,
        navigate,
        t,
        writingId,
      ]
    );


  // =====================================================
  // AUTOSAVE
  // =====================================================

  useEffect(() => {

    if (
      !initializedRef.current ||
      loadingWriting ||
      publishing ||
      !isDirty
    ) {

      return;

    }


    if (
      autosaveTimerRef.current
    ) {

      clearTimeout(
        autosaveTimerRef.current
      );

    }


    autosaveTimerRef.current =
      setTimeout(
        async () => {

          try {

            await saveToDatabase();

          } catch {

            // save status is already updated.

          }

        },
        AUTOSAVE_DELAY
      );


    return () => {

      if (
        autosaveTimerRef.current
      ) {

        clearTimeout(
          autosaveTimerRef.current
        );

      }

    };

  }, [
    title,
    category,
    language,
    content,
    isDirty,
    loadingWriting,
    publishing,
    saveToDatabase,
  ]);


  // =====================================================
  // BROWSER EXIT PROTECTION
  // =====================================================

  useEffect(() => {

    function handleBeforeUnload(
      event
    ) {

      if (!isDirty) {
        return;
      }


      event.preventDefault();

      event.returnValue = "";

    }


    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );


    return () => {

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

    };

  }, [isDirty]);


  // =====================================================
  // WORD COUNT
  // =====================================================

  const wordCount =
    useMemo(() => {

      if (!content.trim()) {

        return 0;

      }


      return content
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    }, [content]);


  // =====================================================
  // CHARACTER COUNT
  // =====================================================

  const characterCount =
    content.length;


  // =====================================================
  // READING TIME
  // =====================================================

  const readingTime =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            wordCount / 180
          )
        ),
      [wordCount]
    );


  // =====================================================
  // LAST SAVED TEXT
  // =====================================================

  const lastSavedText =
    useMemo(() => {

      if (!lastSavedAt) {

        return "";

      }


      return lastSavedAt
        .toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

    }, [lastSavedAt]);


  // =====================================================
  // VALIDATION
  // =====================================================

  function validateForPublish() {

    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();


    if (!cleanTitle) {

      return t(
        "write.titleRequired"
      );

    }


    if (
      cleanTitle.length >
      TITLE_LIMIT
    ) {

      return (
        `${t(
          "write.titleTooLong"
        )} (${TITLE_LIMIT})`
      );

    }


    if (!language) {

      return t(
        "write.languageRequired"
      );

    }


    if (!cleanContent) {

      return t(
        "write.contentRequired"
      );

    }


    if (
      cleanContent.length < 10
    ) {

      return t(
        "write.contentTooShort"
      );

    }


    return "";

  }


  // =====================================================
  // MANUAL SAVE
  // =====================================================

  async function handleManualSave() {

    setSuccess("");

    setError("");


    try {

      const result =
        await saveToDatabase({
          manual: true,
        });


      if (
        !result &&
        !title.trim() &&
        !content.trim()
      ) {

        setError(
          t(
            "write.draftEmptyError"
          )
        );

      }


    } catch {

      // saveToDatabase already handles the error.

    }

  }


  // =====================================================
  // PUBLISH
  // =====================================================

  async function handlePublish(
    event
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    const validationError =
      validateForPublish();


    if (validationError) {

      setError(
        validationError
      );

      return;

    }


    if (
      autosaveTimerRef.current
    ) {

      clearTimeout(
        autosaveTimerRef.current
      );

    }


    setPublishing(
      true
    );


    try {

      let finalWritingId =
        writingId;

      let data;


      // ===============================================
      // EXISTING WRITING
      // ===============================================

      if (finalWritingId) {

        await updateWriting(
          finalWritingId,
          buildPayload()
        );


        setIsDirty(false);


        if (
          writingStatus ===
          "published"
        ) {

          data = {

            message:
              t(
                "write.updatedSuccess"
              ),

            writing: {
              id:
                finalWritingId,

              status:
                "published",
            },
          };


        } else {

          data =
            await publishWriting(
              finalWritingId
            );

        }


      } else {

        // =============================================
        // BRAND NEW PUBLISHED WRITING
        // =============================================

        data =
          await createWriting(
            buildPayload()
          );


        finalWritingId =
          data?.writing?.id;


        if (!finalWritingId) {

          throw new Error(
            t(
              "errors.generic"
            )
          );

        }

      }


      setWritingId(
        finalWritingId
      );

      setWritingStatus(
        "published"
      );

      setIsDirty(false);

      setSaveStatus(
        "saved"
      );

      setLastSavedAt(
        new Date()
      );


      setSuccess(
        writingStatus ===
        "published"
          ? t(
            "write.updatedSuccess"
          )
          : t(
            "write.publishedSuccess"
          )
      );


      if (
        onWritingCreated
      ) {

        await onWritingCreated();

      }


      navigate(
        `/writings/${finalWritingId}`
      );


    } catch (err) {

      console.error(
        "PUBLISH ERROR:",
        err
      );


      setError(
        err.message ||
        t(
          "errors.generic"
        )
      );


    } finally {

      setPublishing(
        false
      );

    }

  }


  // =====================================================
  // SAVE STATUS
  // =====================================================

  function renderSaveStatus() {

    if (
      saveStatus ===
      "saving"
    ) {

      return (
        <div className="editor-save-status saving">

          <Loader2
            size={14}
            className="spin"
          />

          <span>

            {t(
              "write.saving"
            )}

          </span>

        </div>
      );

    }


    if (
      saveStatus ===
      "saved"
    ) {

      return (
        <div className="editor-save-status saved">

          <Check size={14} />

          <span>

            {t(
              "write.saved"
            )}

            {
              lastSavedText
                ? (
                  ` ${t(
                    "write.savedAt"
                  )} ${lastSavedText}`
                )
                : ""
            }

          </span>

        </div>
      );

    }


    if (
      saveStatus ===
      "error"
    ) {

      return (
        <div className="editor-save-status error">

          <CloudOff size={14} />

          <span>

            {t(
              "write.autosaveFailed"
            )}

          </span>

        </div>
      );

    }


    if (
      saveStatus ===
      "unsaved"
    ) {

      return (
        <div className="editor-save-status unsaved">

          <Cloud size={14} />

          <span>

            {t(
              "write.unsavedChanges"
            )}

          </span>

        </div>
      );

    }


    return (
      <div className="editor-save-status">

        <Cloud size={14} />

        <span>

          {t(
            "write.autosaveReady"
          )}

        </span>

      </div>
    );

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  function getStatusLabel() {

    if (
      writingStatus ===
      "published"
    ) {

      return t(
        "write.publishedStatus"
      );

    }


    if (writingId) {

      return t(
        "write.draftStatus"
      );

    }


    return t(
      "write.newStatus"
    );

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loadingWriting) {

    return (
      <main className="write-page">

        <div className="write-shell">

          <section className="write-editor-card">

            <div className="my-writings-loading">

              <Loader2
                size={30}
                className="spin"
              />

              <p>

                {t(
                  "common.loading"
                )}

              </p>

            </div>

          </section>

        </div>

      </main>
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="write-page">

      <div className="write-shell">


        {/* ===============================================
            HEADER
        ================================================ */}

        <header className="write-hero">

          <div className="write-eyebrow">

            <Feather size={16} />

            <span>

              {
                isEditMode
                  ? t(
                    "write.eyebrowEdit"
                  )
                  : t(
                    "write.eyebrowCreate"
                  )
              }

            </span>

          </div>


          <h1>

            {
              isEditMode
                ? t(
                  "write.editTitle"
                )
                : t(
                  "write.newTitle"
                )
            }

          </h1>


          <p>

            {
              isEditMode
                ? t(
                  "write.editDescription"
                )
                : t(
                  "write.description"
                )
            }

          </p>

        </header>


        {/* ===============================================
            EDITOR
        ================================================ */}

        <section className="write-editor-card">


          {/* =============================================
              AUTHOR / SAVE STATUS
          ============================================== */}

          <div className="write-author-strip">

            <div className="write-author-avatar">

              {
                user?.name
                  ?.charAt(0)
                  ?.toUpperCase()
                || "S"
              }

            </div>


            <div className="write-author-details">

              <span>

                {t(
                  "write.writingAs"
                )}

              </span>

              <strong>

                {
                  user?.name ||
                  "SHOBDO"
                }

              </strong>

            </div>


            <div className="write-save-area">

              {renderSaveStatus()}


              <span
                className={
                  writingStatus ===
                  "published"
                    ? (
                      "write-status-badge published"
                    )
                    : (
                      "write-status-badge"
                    )
                }
              >

                {getStatusLabel()}

              </span>

            </div>

          </div>


          {/* =============================================
              ERROR
          ============================================== */}

          {error && (

            <div
              className="write-message error"
              role="alert"
            >

              <AlertCircle
                size={18}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* =============================================
              SUCCESS
          ============================================== */}

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


          {/* =============================================
              FORM
          ============================================== */}

          <form
            className="write-form"
            onSubmit={
              handlePublish
            }
          >


            {/* ===========================================
                TITLE
            ============================================ */}

            <div className="write-field">

              <div className="write-field-header">

                <label htmlFor="writing-title">

                  <Type size={17} />

                  {t(
                    "write.titleLabel"
                  )}

                </label>


                <span>

                  {title.length}
                  /
                  {TITLE_LIMIT}

                </span>

              </div>


              <input
                id="writing-title"

                className="write-title-input"

                type="text"

                placeholder={
                  t(
                    "write.titlePlaceholder"
                  )
                }

                value={title}

                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }

                maxLength={
                  TITLE_LIMIT
                }

                disabled={
                  publishing
                }

                autoComplete="off"
              />

            </div>


            {/* ===========================================
                CATEGORY + LANGUAGE
            ============================================ */}

            <div className="write-meta-grid write-meta-grid-language">


              {/* CATEGORY */}

              <div className="write-field">

                <label htmlFor="writing-category">

                  <Tag size={17} />

                  {t(
                    "write.categoryLabel"
                  )}

                </label>


                <select
                  id="writing-category"

                  className="write-select"

                  value={
                    category
                  }

                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }

                  disabled={
                    publishing
                  }
                >

                  {
                    CATEGORY_VALUES.map(
                      (item) => (

                        <option
                          key={
                            item
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
                    )
                  }

                </select>

              </div>


              {/* =========================================
                  WRITING LANGUAGE
              ========================================== */}

              <div className="write-field">

                <label htmlFor="writing-language">

                  <Globe2 size={17} />

                  {t(
                    "write.writingLanguageLabel"
                  )}

                </label>


                <select
                  id="writing-language"

                  className="write-select"

                  value={
                    language
                  }

                  onChange={(event) =>
                    setLanguage(
                      event.target.value
                    )
                  }

                  disabled={
                    publishing
                  }
                >

                  {
                    LANGUAGES.map(
                      (item) => (

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
                              : (
                                `${item.nativeName} — ${item.name}`
                              )
                          }

                        </option>

                      )
                    )
                  }

                </select>


                <small className="write-field-help">

                  {t(
                    "write.writingLanguageHelp"
                  )}

                </small>

              </div>


              {/* =========================================
                  STATS
              ========================================== */}

              <div className="write-stats-card">

                <div>

                  <BookOpen
                    size={17}
                  />

                  <span>

                    {wordCount}

                    {" "}

                    {t(
                      "write.wordCount"
                    )}

                  </span>

                </div>


                <div>

                  <FileText
                    size={17}
                  />

                  <span>

                    {readingTime}

                    {" "}

                    {t(
                      "write.readingTime"
                    )}

                  </span>

                </div>

              </div>

            </div>


            {/* ===========================================
                SELECTED WRITING LANGUAGE
            ============================================ */}

            <div className="write-language-info">

              <Globe2 size={15} />

              <span>

                {t(
                  "write.selectedLanguage"
                )}:

              </span>

              <strong>

                {
                  getLanguageLabel(
                    language
                  )
                }

              </strong>

            </div>


            {/* ===========================================
                CONTENT
            ============================================ */}

            <div className="write-field">

              <div className="write-field-header">

                <label htmlFor="writing-content">

                  <Feather size={17} />

                  {t(
                    "write.contentLabel"
                  )}

                </label>


                <span>

                  {characterCount}

                  {" "}

                  {t(
                    "write.characterCount"
                  )}

                </span>

              </div>


              <textarea
                id="writing-content"

                className="write-content-input"

                placeholder={
                  t(
                    "write.contentPlaceholderExtended"
                  )
                }

                value={
                  content
                }

                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }

                disabled={
                  publishing
                }
              />

            </div>


            {/* ===========================================
                FOOTER
            ============================================ */}

            <div className="write-editor-footer">

              <div className="write-document-info">

                <span>

                  {
                    getLanguageLabel(
                      language
                    )
                  }

                </span>

                <span>
                  •
                </span>


                <span>

                  {wordCount}

                  {" "}

                  {t(
                    "write.wordCount"
                  )}

                </span>


                <span>
                  •
                </span>


                <span>

                  {characterCount}

                  {" "}

                  {t(
                    "write.characterCount"
                  )}

                </span>


                <span>
                  •
                </span>


                <span>

                  ~{readingTime}

                  {" "}

                  {t(
                    "write.readingTime"
                  )}

                </span>

              </div>


              <div className="write-actions">


                {/* =======================================
                    SAVE DRAFT
                ======================================== */}

                <button
                  type="button"

                  className="write-draft-button"

                  onClick={
                    handleManualSave
                  }

                  disabled={
                    manualSaving ||
                    publishing ||
                    saveStatus ===
                    "saving"
                  }
                >

                  {
                    manualSaving
                      ? (
                        <Loader2
                          size={18}
                          className="spin"
                        />
                      )
                      : (
                        <Save
                          size={18}
                        />
                      )
                  }


                  {
                    manualSaving
                      ? t(
                        "write.savingDraft"
                      )
                      : t(
                        "write.saveDraft"
                      )
                  }

                </button>


                {/* =======================================
                    PUBLISH / UPDATE
                ======================================== */}

                <button
                  type="submit"

                  className="write-publish-button"

                  disabled={
                    publishing ||
                    manualSaving ||
                    saveStatus ===
                    "saving"
                  }
                >

                  {
                    publishing
                      ? (
                        <Loader2
                          size={18}
                          className="spin"
                        />
                      )
                      : (
                        <Send
                          size={18}
                        />
                      )
                  }


                  {
                    publishing
                      ? (
                        writingStatus ===
                        "published"
                          ? t(
                            "write.updating"
                          )
                          : t(
                            "write.publishing"
                          )
                      )
                      : (
                        writingStatus ===
                        "published"
                          ? t(
                            "write.updatePublished"
                          )
                          : t(
                            "write.publish"
                          )
                      )
                  }

                </button>

              </div>

            </div>

          </form>

        </section>


        {/* ===============================================
            AUTOSAVE NOTE
        ================================================ */}

        <div className="write-note">

          <Cloud size={14} />

          <span>

            {t(
              "write.autosaveNote"
            )}

            {" "}

            <strong>

              {
                getLanguageLabel(
                  language
                )
              }

            </strong>

          </span>

        </div>

      </div>

    </main>
  );

}


export default Write;