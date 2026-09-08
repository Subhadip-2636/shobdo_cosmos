import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  FileImage,
  FileText,
  LoaderCircle,
  PenLine,
  Save,
  ScanText,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  createDraft,
  createWriting,
  extractScannedText,
  publishWriting,
  unpublishWriting,
  updateWriting,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./Write.css";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];


const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];


const WRITING_LANGUAGES = [
  {
    code: "bn",
    nativeName: "বাংলা",
    englishName: "Bengali",
    shortName: "BN",
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    shortName: "HI",
  },
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    shortName: "EN",
  },
  {
    code: "as",
    nativeName: "অসমীয়া",
    englishName: "Assamese",
    shortName: "AS",
  },
  {
    code: "or",
    nativeName: "ଓଡ଼ିଆ",
    englishName: "Odia",
    shortName: "OR",
  },
  {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    shortName: "MR",
  },
  {
    code: "gu",
    nativeName: "ગુજરાતી",
    englishName: "Gujarati",
    shortName: "GU",
  },
  {
    code: "pa",
    nativeName: "ਪੰਜਾਬੀ",
    englishName: "Punjabi",
    shortName: "PA",
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    shortName: "TA",
  },
  {
    code: "te",
    nativeName: "తెలుగు",
    englishName: "Telugu",
    shortName: "TE",
  },
  {
    code: "kn",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
    shortName: "KN",
  },
  {
    code: "ml",
    nativeName: "മലയാളം",
    englishName: "Malayalam",
    shortName: "ML",
  },
  {
    code: "ur",
    nativeName: "اردو",
    englishName: "Urdu",
    shortName: "UR",
    rtl: true,
  },
  {
    code: "ne",
    nativeName: "नेपाली",
    englishName: "Nepali",
    shortName: "NE",
  },
  {
    code: "other",
    nativeName: "Other",
    englishName: "Other",
    shortName: "OT",
  },
];


// Languages whose OCR/text-extraction support depends on the
// backend having the matching Tesseract traineddata installed.
// bn / en / hi are the only ones guaranteed to work out of the box.
const OCR_SUPPORTED_LANGUAGES = [
  "bn",
  "en",
  "hi",
];


// Database category values stay in Bengali — only the
// displayed label is translated (see categoryLabel below).
const CATEGORIES = [
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "অন্যান্য",
];


const CONTENT_PLACEHOLDERS = {
  bn: "এখানে আপনার লেখা শুরু করুন...",
  hi: "यहाँ अपना लेखन शुरू करें...",
  en: "Start writing here...",
  as: "ইয়াতে আপোনাৰ লিখা আৰম্ভ কৰক...",
  or: "ଏଠାରେ ଲେଖିବା ଆରମ୍ଭ କରନ୍ତୁ...",
  mr: "इथे लिहायला सुरुवात करा...",
  gu: "અહીં લખવાનું શરૂ કરો...",
  pa: "ਇੱਥੇ ਲਿਖਣਾ ਸ਼ੁਰੂ ਕਰੋ...",
  ta: "இங்கே எழுதத் தொடங்குங்கள்...",
  te: "ఇక్కడ రాయడం ప్రారంభించండి...",
  kn: "ಇಲ್ಲಿ ಬರೆಯಲು ಪ್ರಾರಂಭಿಸಿ...",
  ml: "ഇവിടെ എഴുതാൻ തുടങ്ങുക...",
  ur: "یہاں لکھنا شروع کریں...",
  ne: "यहाँ लेख्न सुरु गर्नुहोस्...",
  other: "Start writing here...",
};


// =========================================================
// HELPERS
// =========================================================

function getFileExtension(
  fileName = ""
) {

  const dotIndex =
    fileName.lastIndexOf(".");


  if (dotIndex === -1) {

    return "";

  }


  return fileName
    .slice(dotIndex)
    .toLowerCase();

}


function isAllowedFile(
  file
) {

  if (!file) {

    return false;

  }


  const extension =
    getFileExtension(
      file.name
    );


  return (
    ALLOWED_FILE_TYPES.includes(
      file.type
    ) ||
    ALLOWED_FILE_EXTENSIONS.includes(
      extension
    )
  );

}


function formatFileSize(
  bytes
) {

  if (!bytes) {

    return "0 KB";

  }


  const sizeInMB =
    bytes / (1024 * 1024);


  if (sizeInMB >= 1) {

    return `${sizeInMB.toFixed(2)} MB`;

  }


  return `${(
    bytes / 1024
  ).toFixed(1)} KB`;

}


// =========================================================
// WRITE PAGE
// =========================================================

function Write({
  user,
  onPublished,
}) {

  const navigate =
    useNavigate();
  const location =
    useLocation();
  const {
    id,
  } = useParams();
  const editingWriting =
    location.state?.writing || null;
  const isEditMode =
    Boolean(id);

  const {
    t,
  } = useLanguage();


  const fileInputRef =
    useRef(null);


  // =======================================================
  // CATEGORY LABEL (translated display, raw db value)
  // =======================================================

  function categoryLabel(
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


  // =======================================================
  // FORM STATE
  // =======================================================

  const [
    title,
    setTitle,
  ] = useState("");


  const [
    content,
    setContent,
  ] = useState("");


  const [
    category,
    setCategory,
  ] = useState(
    "কবিতা"
  );


  const [
    writingLanguage,
    setWritingLanguage,
  ] = useState(
    "bn"
  );

  // =======================================================
// EDIT MODE PREFILL
// =======================================================

useEffect(() => {

  if (
    !isEditMode ||
    !editingWriting
  ) {
    return;
  }

  setTitle(
    editingWriting.title || ""
  );

  setContent(
    editingWriting.content || ""
  );

  setCategory(
    editingWriting.category ||
    "কবিতা"
  );

  setWritingLanguage(
    editingWriting.language ||
    "bn"
  );

}, [
  id,
  isEditMode,
  editingWriting,
]);


  const [
    languageMenuOpen,
    setLanguageMenuOpen,
  ] = useState(false);


  const languageMenuRef =
    useRef(null);


  useEffect(() => {

    function handleOutsideClick(
      event
    ) {

      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(
          event.target
        )
      ) {

        setLanguageMenuOpen(
          false
        );

      }

    }


    function handleEscapeKey(
      event
    ) {

      if (
        event.key === "Escape"
      ) {

        setLanguageMenuOpen(
          false
        );

      }

    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );

    };

  }, []);


  function languageLabel(
    language
  ) {

    if (
      !language ||
      language.nativeName ===
        language.englishName
    ) {

      return (
        language?.englishName ||
        ""
      );

    }


    return (
      `${language.nativeName} — ${language.englishName}`
    );

  }


  // =======================================================
  // FILE AND OCR STATE
  // =======================================================

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);


  const [
    isDragging,
    setIsDragging,
  ] = useState(false);


  const [
    extracting,
    setExtracting,
  ] = useState(false);


  // =======================================================
  // FORM STATUS
  // =======================================================

  const [
    publishing,
    setPublishing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =======================================================
  // FILE VALIDATION
  // =======================================================

  function validateAndSelectFile(
    file
  ) {

    setError("");
    setSuccess("");


    if (!file) {

      return;

    }


    if (!isAllowedFile(file)) {

      setSelectedFile(null);

      setError(
        t(
          "write.invalidFile"
        )
      );

      return;

    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      setSelectedFile(null);

      setError(
        t(
          "write.fileTooLarge"
        )
      );

      return;

    }


    setSelectedFile(file);

  }


  function handleFileChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    validateAndSelectFile(
      file
    );


    event.target.value = "";

  }


  function removeSelectedFile() {

    setSelectedFile(null);
    setError("");
    setSuccess("");


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  }


  // =======================================================
  // DRAG AND DROP
  // =======================================================

  function handleDragOver(
    event
  ) {

    event.preventDefault();

    setIsDragging(true);

  }


  function handleDragLeave(
    event
  ) {

    event.preventDefault();

    setIsDragging(false);

  }


  function handleDrop(
    event
  ) {

    event.preventDefault();

    setIsDragging(false);


    const file =
      event.dataTransfer
        .files?.[0];


    validateAndSelectFile(
      file
    );

  }


  // =======================================================
  // OCR EXTRACTION
  // =======================================================

  async function handleExtractText() {

    setError("");
    setSuccess("");


    if (!selectedFile) {

      setError(
        t(
          "write.chooseFileFirst"
        )
      );

      return;

    }


    if (
      !OCR_SUPPORTED_LANGUAGES.includes(
        writingLanguage
      )
    ) {

      const languageInfo =
        WRITING_LANGUAGES.find(
          (item) =>
            item.code ===
            writingLanguage
        );


      setError(
        t(
          "write.ocrLanguageUnsupported",
          `OCR isn't available yet for ${
            languageInfo?.englishName ||
            "this language"
          }. Try Bengali, English or Hindi, or type your writing directly.`
        )
      );

      return;

    }


    try {

      setExtracting(true);


      const response =
        await extractScannedText(
          selectedFile,
          writingLanguage
        );


      const extractedText =
        typeof response === "string"
          ? response
          : response?.text ||
            response?.content ||
            response?.extracted_text ||
            "";


      if (
        !extractedText.trim()
      ) {

        setError(
          t(
            "write.noTextFound"
          )
        );

        return;

      }


      setContent(
        (previousContent) => {

          if (
            !previousContent.trim()
          ) {

            return extractedText.trim();

          }


          return (
            `${previousContent.trim()}\n\n` +
            extractedText.trim()
          );

        }
      );


      setSuccess(
        t(
          "write.extractionSuccess"
        )
      );


      setSelectedFile(null);


    } catch (requestError) {

      console.error(
        "OCR extraction failed:",
        requestError
      );


      setError(
        requestError?.message ||
        t(
          "write.extractionFailed"
        )
      );


    } finally {

      setExtracting(false);

    }

  }


 // =======================================================
// SAVE DRAFT TO DATABASE
// =======================================================

async function handleSaveDraft() {

  setError("");
  setSuccess("");


  if (!user) {

    setError(
      t(
        "write.loginRequired"
      )
    );

    return;

  }


  if (
    !title.trim() &&
    !content.trim()
  ) {

    setError(
      t(
        "write.draftEmpty"
      )
    );

    return;

  }


  const payload = {

    title:
      title.trim(),

    content:
      content.trim(),

    category,

    language:
      writingLanguage,

  };


  try {

    setPublishing(true);


    let savedDraft;


    // ===================================================
    // EXISTING WRITING
    // ===================================================

    if (isEditMode && id) {

      const updated =
        await updateWriting(
          id,
          payload
        );


      const updatedWriting =
        updated?.writing ||
        updated;


      // If this writing was published,
      // Save Draft should move it back to Drafts.
      if (
        updatedWriting?.status === "published"
      ) {

        const unpublished =
          await unpublishWriting(
            id
          );


        savedDraft =
          unpublished?.writing ||
          unpublished;

      } else {

        savedDraft =
          updatedWriting;

      }

    }

    // ===================================================
    // NEW WRITING
    // ===================================================

    else {

      const created =
        await createDraft(
          payload
        );


      savedDraft =
        created?.writing ||
        created;

    }


    const draftId =
      savedDraft?.id ||
      id;


    if (!draftId) {

      throw new Error(
        "Draft was saved but no writing ID was returned."
      );

    }


    localStorage.removeItem(
      "shobdo_writing_draft"
    );


    setSuccess(
      t(
        "write.draftSaved"
      )
    );


    // Switch the editor to the database-backed draft URL.
    // This prevents another Save Draft from creating a duplicate.
    if (!isEditMode) {

      navigate(
        `/write/${draftId}`,
        {
          replace: true,

          state: {
            writing: {
              ...savedDraft,
              status: "draft",
            },
          },
        }
      );

    }


  } catch (requestError) {

    console.error(
      "SAVE DRAFT ERROR:",
      requestError
    );


    setError(
      requestError?.message ||
      t(
        "errors.generic"
      )
    );


  } finally {

    setPublishing(false);

  }

}


  // =======================================================
  // PUBLISH WRITING
  // =======================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!user) {

      setError(
        t(
          "write.loginRequired"
        )
      );


      setTimeout(() => {

        navigate("/login");

      }, 1000);


      return;

    }


    if (!title.trim()) {

      setError(
        t(
          "write.titleRequired"
        )
      );

      return;

    }


    if (!content.trim()) {

      setError(
        t(
          "write.contentRequired"
        )
      );

      return;

    }


    if (
      title.trim().length >
      200
    ) {

      setError(
        t(
          "write.titleTooLong"
        )
      );

      return;

    }


    try {

      setPublishing(true);


      const payload = {
        title:
          title.trim(),

        content:
          content.trim(),

        category,

        language:
          writingLanguage,
      };


      let savedWriting;

      if (isEditMode && id) {

        // First save the latest title/content/category/language.
        savedWriting = await updateWriting(
          id,
          payload
        );
        // Then actually change status to "published".
        const published =
          await publishWriting(id);
        savedWriting =
          published?.writing ||
          published;

        } else {

          savedWriting =
            await createWriting(
              payload
            );

        }

      localStorage.removeItem(
        "shobdo_writing_draft"
      );


      setSuccess(
        t(
          "write.publishedSuccess"
        )
      );


      setTitle("");
      setContent("");
      setCategory("কবিতা");
      setWritingLanguage("bn");
      setSelectedFile(null);


      if (
        typeof onPublished ===
        "function"
      ) {

        onPublished(
          savedWriting
        );

      }


      const writingId =
        savedWriting?.id ||
        savedWriting?.writing?.id ||
        id;

      const writingStatus =
        savedWriting?.status ||
        savedWriting?.writing?.status;

      setTimeout(() => {

        if (
          writingId &&
          writingStatus === "published"
        ) {

          navigate(
            `/writings/${writingId}`
          );

        } else {

          navigate(
            "/my-writings"
          );

        }

      }, 900);


    } catch (requestError) {

      console.error(
        "Writing publication failed:",
        requestError
      );


      setError(
        requestError?.message ||
        t(
          "write.publishFailed"
        )
      );


    } finally {

      setPublishing(false);

    }

  }


  // =======================================================
  // WORD AND CHARACTER COUNT
  // =======================================================

  const characterCount =
    content.length;


  const wordCount =
    content.trim()
      ? content
          .trim()
          .split(/\s+/)
          .length
      : 0;


  const currentLanguage =
    WRITING_LANGUAGES.find(
      (item) =>
        item.code ===
        writingLanguage
    );


  // =======================================================
  // UI
  // =======================================================

  return (

    <main className="write-page">

      <section className="write-hero">

        <div className="write-hero-content">

          <div className="write-hero-icon">

            <PenLine
              size={25}
            />

          </div>


          <div>

            <span className="write-eyebrow">

              {t(
                "write.eyebrow"
              )}

            </span>


            <h1>

              {t(
                "write.title"
              )}

            </h1>


            <p>

              {t(
                "write.subtitle"
              )}

            </p>

          </div>

        </div>

      </section>


      <section className="write-container">

        <form
          className="write-form-card"
          onSubmit={handleSubmit}
        >

          {/* ============================================= */}
          {/* STATUS MESSAGES                               */}
          {/* ============================================= */}

          {error && (

            <div
              className="form-message form-message-error"
              role="alert"
            >

              <AlertCircle
                size={20}
              />

              <span>
                {error}
              </span>

              <button
                type="button"
                aria-label={
                  t(
                    "common.close"
                  )
                }
                onClick={() =>
                  setError("")
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>

          )}


          {success && (

            <div
              className="form-message form-message-success"
              role="status"
            >

              <CheckCircle2
                size={20}
              />

              <span>
                {success}
              </span>

              <button
                type="button"
                aria-label={
                  t(
                    "common.close"
                  )
                }
                onClick={() =>
                  setSuccess("")
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>

          )}


          {/* ============================================= */}
          {/* LANGUAGE                                      */}
          {/* ============================================= */}

          <div className="write-section">

            <div className="write-section-heading">

              <div>

                <span className="write-step">

                  {t(
                    "write.languageStep"
                  )}

                </span>


                <h2>

                  {t(
                    "write.languageTitle"
                  )}

                </h2>

              </div>


              <p>

                {t(
                  "write.languageDescription"
                )}

              </p>

            </div>


            <div
              className="language-select-wrap"
              ref={languageMenuRef}
            >

              <button
                type="button"
                className="language-select-trigger"
                aria-haspopup="listbox"
                aria-expanded={
                  languageMenuOpen
                }
                onClick={() =>
                  setLanguageMenuOpen(
                    (current) =>
                      !current
                  )
                }
              >

                <span className="language-short-name">

                  {
                    currentLanguage?.shortName ||
                    "?"
                  }

                </span>


                <span className="language-select-trigger-label">

                  {
                    languageLabel(
                      currentLanguage
                    )
                  }

                </span>


                <ChevronDown
                  size={18}
                  className={
                    languageMenuOpen
                      ? "language-select-chevron open"
                      : "language-select-chevron"
                  }
                />

              </button>


              {languageMenuOpen && (

                <ul
                  className="language-dropdown"
                  role="listbox"
                >

                  {WRITING_LANGUAGES.map(
                    (language) => (

                      <li
                        key={
                          language.code
                        }
                        role="option"
                        aria-selected={
                          writingLanguage ===
                          language.code
                        }
                      >

                        <button
                          type="button"
                          className={
                            writingLanguage ===
                            language.code
                              ? "language-dropdown-item active"
                              : "language-dropdown-item"
                          }
                          onClick={() => {

                            setWritingLanguage(
                              language.code
                            );

                            setError("");
                            setSuccess("");

                            setLanguageMenuOpen(
                              false
                            );

                          }}
                        >

                          <span>

                            {
                              languageLabel(
                                language
                              )
                            }

                          </span>


                          {writingLanguage ===
                          language.code && (

                            <Check
                              size={16}
                            />

                          )}

                        </button>

                      </li>

                    )
                  )}

                </ul>

              )}

            </div>


            {!OCR_SUPPORTED_LANGUAGES.includes(
              writingLanguage
            ) && (

              <p className="language-ocr-note">

                {t(
                  "write.ocrLanguageNote",
                  "Scanning (OCR) currently supports Bengali, English and Hindi only — you can still type your writing directly in this language."
                )}

              </p>

            )}

          </div>


          {/* ============================================= */}
          {/* SCAN DOCUMENT                                 */}
          {/* ============================================= */}

          <div className="write-section scan-section">

            <div className="write-section-heading">

              <div>

                <span className="write-step">

                  {t(
                    "write.scanStep"
                  )}

                </span>


                <h2>

                  {t(
                    "write.scanTitle"
                  )}

                </h2>

              </div>


              <span className="optional-badge">

                {t(
                  "write.scanOptional"
                )}

              </span>

            </div>


            <p className="scan-description">

              {t(
                "write.scanDescription"
              )}

            </p>


            {!selectedFile ? (

              <div
                className={
                  isDragging
                    ? "scan-drop-zone dragging"
                    : "scan-drop-zone"
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  id="writing-document"
                  className="scan-file-input"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={
                    handleFileChange
                  }
                />


                <div className="scan-upload-icon">

                  <Upload
                    size={28}
                  />

                </div>


                <h3>

                  {t(
                    "write.dropTitle"
                  )}

                </h3>


                <p>

                  {t(
                    "write.dropSubtitle"
                  )}

                </p>


                <button
                  type="button"
                  className="scan-select-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >

                  <FileImage
                    size={18}
                  />

                  {t(
                    "write.selectFile"
                  )}

                </button>


                <small>

                  {t(
                    "write.supportedFiles"
                  )}

                </small>

              </div>

            ) : (

              <div className="selected-file-card">

                <div className="selected-file-icon">

                  {selectedFile.type ===
                  "application/pdf" ? (

                    <FileText
                      size={28}
                    />

                  ) : (

                    <FileImage
                      size={28}
                    />

                  )}

                </div>


                <div className="selected-file-info">

                  <strong>

                    {
                      selectedFile.name
                    }

                  </strong>


                  <span>

                    {
                      formatFileSize(
                        selectedFile.size
                      )
                    }

                    {" • "}

                    {
                      currentLanguage
                        ? currentLanguage.englishName
                        : ""
                    }

                    {" "}

                    {t(
                      "write.ocrLabel"
                    )}

                  </span>

                </div>


                <button
                  type="button"
                  className="remove-file-button"
                  aria-label={
                    t(
                      "write.removeFile"
                    )
                  }
                  disabled={extracting}
                  onClick={
                    removeSelectedFile
                  }
                >

                  <Trash2
                    size={19}
                  />

                </button>

              </div>

            )}


            <button
              type="button"
              className="extract-text-button"
              disabled={
                !selectedFile ||
                extracting ||
                publishing
              }
              onClick={
                handleExtractText
              }
            >

              {extracting ? (

                <LoaderCircle
                  className="spin"
                  size={20}
                />

              ) : (

                <ScanText
                  size={20}
                />

              )}


              {extracting
                ? t(
                  "write.extracting"
                )
                : t(
                  "write.extractButton"
                )}

            </button>

          </div>


          {/* ============================================= */}
          {/* WRITING DETAILS                               */}
          {/* ============================================= */}

          <div className="write-section">

            <div className="write-section-heading">

              <div>

                <span className="write-step">

                  {t(
                    "write.editorStep"
                  )}

                </span>


                <h2>

                  {t(
                    "write.editorTitle"
                  )}

                </h2>

              </div>

            </div>


            <div className="write-field">

              <label htmlFor="writing-title">

                {t(
                  "write.titleLabel"
                )}

                <span aria-hidden="true">

                  *

                </span>

              </label>


              <input
                id="writing-title"
                type="text"
                value={title}
                maxLength={200}
                placeholder={
                  t(
                    "write.titlePlaceholder"
                  )
                }
                disabled={
                  publishing
                }
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
              />


              <div className="field-meta">

                <span>

                  {t(
                    "write.titleHelp"
                  )}

                </span>


                <span>

                  {title.length}/200

                </span>

              </div>

            </div>


            <div className="write-field">

              <label htmlFor="writing-category">

                {t(
                  "write.categoryLabel"
                )}

                <span aria-hidden="true">

                  *

                </span>

              </label>


              <select
                id="writing-category"
                value={category}
                disabled={
                  publishing
                }
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >

                {CATEGORIES.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >

                      {
                        categoryLabel(
                          item
                        )
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            <div className="write-field content-field">

              <div className="content-label-row">

                <label htmlFor="writing-content">

                  {t(
                    "write.contentLabel"
                  )}

                  <span aria-hidden="true">

                    *

                  </span>

                </label>


                <div className="content-stats">

                  <span>

                    {wordCount}{" "}
                    {t(
                      "write.wordCount"
                    )}

                  </span>


                  <span>

                    {characterCount}{" "}
                    {t(
                      "write.characterCount"
                    )}

                  </span>

                </div>

              </div>


              <textarea
                id="writing-content"
                value={content}
                rows={18}
                dir={
                  currentLanguage?.rtl
                    ? "rtl"
                    : "ltr"
                }
                placeholder={
                  CONTENT_PLACEHOLDERS[
                    writingLanguage
                  ] ||
                  CONTENT_PLACEHOLDERS.en
                }
                disabled={
                  publishing
                }
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
              />


              <p className="editor-help">

                {t(
                  "write.editorHelp"
                )}

              </p>

            </div>

          </div>


          {/* ============================================= */}
          {/* FORM ACTIONS                                  */}
          {/* ============================================= */}

          <div className="write-form-actions">

            <button
              type="button"
              className="draft-button"
              disabled={
                publishing ||
                extracting
              }
              onClick={
                handleSaveDraft
              }
            >

              <Save
                size={19}
              />

              {t(
                "write.saveDraft"
              )}

            </button>


            <button
              type="submit"
              className="publish-button"
              disabled={
                publishing ||
                extracting
              }
            >

              {publishing ? (

                <LoaderCircle
                  className="spin"
                  size={20}
                />

              ) : (

                <Send
                  size={19}
                />

              )}


              {publishing
                ? t(
                  "write.publishing"
                )
                : t(
                  "write.publish"
                )}

            </button>

          </div>

        </form>

      </section>

    </main>

  );

}


export default Write;