import {
  useEffect,
  useMemo,
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
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Image,
  LoaderCircle,
  Lock,
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
// API CONFIGURATION
// =========================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";

const CLEAN_API_URL =
  RAW_API_URL
    .trim()
    .replace(/\/+$/, "");

const API_URL =
  CLEAN_API_URL.endsWith("/api")
    ? CLEAN_API_URL
    : `${CLEAN_API_URL}/api`;


// =========================================================
// CONSTANTS
// =========================================================

const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const WRITING_SCAN_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];


const WRITING_SCAN_EXTENSIONS = [
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


const DOCUMENT_LANGUAGES = [
  {
    code: "bn",
    label: "বাংলা — Bengali",
  },
  {
    code: "en",
    label: "English",
  },
  {
    code: "hi",
    label: "हिन्दी — Hindi",
  },
  {
    code: "as",
    label: "অসমীয়া — Assamese",
  },
  {
    code: "or",
    label: "ଓଡ଼ିଆ — Odia",
  },
  {
    code: "ta",
    label: "தமிழ் — Tamil",
  },
  {
    code: "te",
    label: "తెలుగు — Telugu",
  },
];


const OCR_SUPPORTED_LANGUAGES = [
  "bn",
  "en",
  "hi",
];


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


function isAllowedScanFile(
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
    WRITING_SCAN_FILE_TYPES.includes(
      file.type
    ) ||
    WRITING_SCAN_EXTENSIONS.includes(
      extension
    )
  );
}


function isPdfFile(
  file
) {

  if (!file) {
    return false;
  }

  return (
    file.type === "application/pdf" ||
    getFileExtension(file.name) === ".pdf"
  );
}


function formatFileSize(
  bytes
) {

  if (!bytes) {
    return "0 KB";
  }

  const mb =
    bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${(
    bytes / 1024
  ).toFixed(1)} KB`;
}


function getToken() {

  return localStorage.getItem(
    "shobdo_token"
  );
}


// =========================================================
// DOCUMENT API
// =========================================================

async function createDocumentRequest({
  file,
  title,
  description,
  category,
  language,
  visibility,
  allowDownload,
  status,
}) {

  const token =
    getToken();

  if (!token) {
    throw new Error(
      "Please log in before publishing a document."
    );
  }


  const formData =
    new FormData();

  formData.append(
    "document",
    file
  );

  formData.append(
    "title",
    title
  );

  formData.append(
    "description",
    description
  );

  formData.append(
    "category",
    category
  );

  formData.append(
    "language",
    language
  );

  formData.append(
    "visibility",
    visibility
  );

  formData.append(
    "allow_download",
    allowDownload
      ? "true"
      : "false"
  );

  formData.append(
    "status",
    status
  );


  const response =
    await fetch(
      `${API_URL}/documents`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body:
          formData,
      }
    );


  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (!response.ok) {

    throw new Error(
      data?.message ||
      `Document request failed (${response.status}).`
    );
  }


  return data;
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

  const {
    t,
  } = useLanguage();


  const editingWriting =
    location.state?.writing ||
    null;

  const isEditMode =
    Boolean(id);


  // =======================================================
  // PUBLISH MODE
  // =======================================================

  const [
    publishMode,
    setPublishMode,
  ] = useState("writing");


  useEffect(() => {

    if (isEditMode) {
      setPublishMode("writing");
    }

  }, [
    isEditMode,
  ]);


  // =======================================================
  // COMMON STATUS
  // =======================================================

  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  function changeMode(
    mode
  ) {

    if (
      isEditMode &&
      mode !== "writing"
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setPublishMode(mode);
  }


  // =======================================================
  // CATEGORY LABEL
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
  // WRITING STATE
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


  const [
    publishing,
    setPublishing,
  ] = useState(false);


  // =======================================================
  // EDIT WRITING PREFILL
  // =======================================================

  useEffect(() => {

    if (
      !isEditMode ||
      !editingWriting
    ) {
      return;
    }

    setTitle(
      editingWriting.title ||
      ""
    );

    setContent(
      editingWriting.content ||
      ""
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


  // =======================================================
  // WRITING LANGUAGE MENU
  // =======================================================

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


    function handleEscape(
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
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };

  }, []);


  function languageLabel(
    language
  ) {

    if (!language) {
      return "";
    }

    if (
      language.nativeName ===
      language.englishName
    ) {
      return language.englishName;
    }

    return (
      `${language.nativeName} — ${language.englishName}`
    );
  }


  const currentLanguage =
    WRITING_LANGUAGES.find(
      (item) =>
        item.code ===
        writingLanguage
    );


  // =======================================================
  // WRITING OCR STATE
  // =======================================================

  const scanFileInputRef =
    useRef(null);


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


  function validateAndSelectScanFile(
    file
  ) {

    setError("");
    setSuccess("");


    if (!file) {
      return;
    }


    if (!isAllowedScanFile(file)) {

      setSelectedFile(null);

      setError(
        t(
          "write.invalidFile",
          "Please select a PDF, JPG, JPEG or PNG file."
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
          "write.fileTooLarge",
          "File size cannot exceed 10 MB."
        )
      );

      return;
    }


    setSelectedFile(
      file
    );
  }


  function handleScanFileChange(
    event
  ) {

    validateAndSelectScanFile(
      event.target.files?.[0]
    );

    event.target.value =
      "";
  }


  function removeSelectedFile() {

    setSelectedFile(null);

    setError("");
    setSuccess("");

    if (
      scanFileInputRef.current
    ) {

      scanFileInputRef.current.value =
        "";
    }
  }


  function handleScanDragOver(
    event
  ) {

    event.preventDefault();

    setIsDragging(true);
  }


  function handleScanDragLeave(
    event
  ) {

    event.preventDefault();

    setIsDragging(false);
  }


  function handleScanDrop(
    event
  ) {

    event.preventDefault();

    setIsDragging(false);

    validateAndSelectScanFile(
      event.dataTransfer
        .files?.[0]
    );
  }


  async function handleExtractText() {

    setError("");
    setSuccess("");


    if (!selectedFile) {

      setError(
        t(
          "write.chooseFileFirst",
          "Choose a document or image first."
        )
      );

      return;
    }


    if (
      !OCR_SUPPORTED_LANGUAGES.includes(
        writingLanguage
      )
    ) {

      setError(
        "OCR currently supports Bengali, English and Hindi only."
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
            "write.noTextFound",
            "No readable text was found."
          )
        );

        return;
      }


      setContent(
        (previous) => {

          if (
            !previous.trim()
          ) {

            return (
              extractedText.trim()
            );
          }


          return (
            `${previous.trim()}\n\n${extractedText.trim()}`
          );
        }
      );


      setSuccess(
        t(
          "write.extractionSuccess",
          "Text extracted successfully."
        )
      );


      setSelectedFile(
        null
      );


    } catch (
      requestError
    ) {

      console.error(
        "OCR extraction failed:",
        requestError
      );


      setError(
        requestError?.message ||
        t(
          "write.extractionFailed",
          "Unable to extract text."
        )
      );


    } finally {

      setExtracting(false);
    }
  }


  // =======================================================
  // WRITING DRAFT
  // =======================================================

  async function handleSaveDraft() {

    setError("");
    setSuccess("");


    if (!user) {

      setError(
        t(
          "write.loginRequired",
          "Please log in first."
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
          "write.draftEmpty",
          "Write something before saving a draft."
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


      if (
        isEditMode &&
        id
      ) {

        const updated =
          await updateWriting(
            id,
            payload
          );


        const updatedWriting =
          updated?.writing ||
          updated;


        if (
          updatedWriting?.status ===
          "published"
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


      } else {

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
          "Draft saved, but no writing ID was returned."
        );
      }


      localStorage.removeItem(
        "shobdo_writing_draft"
      );


      setSuccess(
        t(
          "write.draftSaved",
          "Draft saved successfully."
        )
      );


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


    } catch (
      requestError
    ) {

      console.error(
        "SAVE DRAFT ERROR:",
        requestError
      );


      setError(
        requestError?.message ||
        t(
          "errors.generic",
          "Something went wrong."
        )
      );


    } finally {

      setPublishing(false);
    }
  }


  // =======================================================
  // PUBLISH WRITING
  // =======================================================

  async function handleWritingSubmit(
    event
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!user) {

      setError(
        t(
          "write.loginRequired",
          "Please log in first."
        )
      );


      setTimeout(
        () => {
          navigate(
            "/login"
          );
        },
        1000
      );

      return;
    }


    if (!title.trim()) {

      setError(
        t(
          "write.titleRequired",
          "Title is required."
        )
      );

      return;
    }


    if (!content.trim()) {

      setError(
        t(
          "write.contentRequired",
          "Writing content is required."
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
          "write.titleTooLong",
          "Title cannot exceed 200 characters."
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


      if (
        isEditMode &&
        id
      ) {

        await updateWriting(
          id,
          payload
        );


        const published =
          await publishWriting(
            id
          );


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
          "write.publishedSuccess",
          "Writing published successfully."
        )
      );


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


      setTimeout(
        () => {

          if (writingId) {

            navigate(
              `/writings/${writingId}`
            );

          } else {

            navigate(
              "/my-writings"
            );
          }

        },
        800
      );


    } catch (
      requestError
    ) {

      console.error(
        "Writing publication failed:",
        requestError
      );


      setError(
        requestError?.message ||
        t(
          "write.publishFailed",
          "Unable to publish writing."
        )
      );


    } finally {

      setPublishing(false);
    }
  }


  // =======================================================
  // DOCUMENT STATE
  // =======================================================

  const documentInputRef =
    useRef(null);


  const [
    documentFile,
    setDocumentFile,
  ] = useState(null);


  const [
    documentDragging,
    setDocumentDragging,
  ] = useState(false);


  const [
    documentTitle,
    setDocumentTitle,
  ] = useState("");


  const [
    documentDescription,
    setDocumentDescription,
  ] = useState("");


  const [
    documentCategory,
    setDocumentCategory,
  ] = useState(
    "প্রবন্ধ"
  );


  const [
    documentLanguage,
    setDocumentLanguage,
  ] = useState(
    "bn"
  );


  const [
    documentVisibility,
    setDocumentVisibility,
  ] = useState(
    "public"
  );


  const [
    allowDownload,
    setAllowDownload,
  ] = useState(
    true
  );


  const [
    documentPublishing,
    setDocumentPublishing,
  ] = useState(
    false
  );


  const [
    lastPublishedDocument,
    setLastPublishedDocument,
  ] = useState(null);


  const documentPreviewUrl =
    useMemo(
      () => {

        if (!documentFile) {
          return "";
        }

        return URL.createObjectURL(
          documentFile
        );

      },
      [
        documentFile,
      ]
    );


  useEffect(() => {

    return () => {

      if (
        documentPreviewUrl
      ) {

        URL.revokeObjectURL(
          documentPreviewUrl
        );
      }
    };

  }, [
    documentPreviewUrl,
  ]);


  function validateDocumentFile(
    file
  ) {

    setError("");
    setSuccess("");


    if (!file) {
      return;
    }


    if (!isPdfFile(file)) {

      setDocumentFile(null);

      setError(
        "Only PDF documents can be published in Document mode."
      );

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      setDocumentFile(null);

      setError(
        "PDF size cannot exceed 10 MB."
      );

      return;
    }


    setDocumentFile(
      file
    );


    if (
      !documentTitle.trim()
    ) {

      const titleFromFile =
        file.name
          .replace(
            /\.pdf$/i,
            ""
          )
          .replace(
            /[_-]+/g,
            " "
          )
          .trim();


      setDocumentTitle(
        titleFromFile.slice(
          0,
          200
        )
      );
    }
  }


  function handleDocumentFileChange(
    event
  ) {

    validateDocumentFile(
      event.target.files?.[0]
    );

    event.target.value =
      "";
  }


  function handleDocumentDragOver(
    event
  ) {

    event.preventDefault();

    setDocumentDragging(
      true
    );
  }


  function handleDocumentDragLeave(
    event
  ) {

    event.preventDefault();

    setDocumentDragging(
      false
    );
  }


  function handleDocumentDrop(
    event
  ) {

    event.preventDefault();

    setDocumentDragging(
      false
    );


    validateDocumentFile(
      event.dataTransfer
        .files?.[0]
    );
  }


  function removeDocumentFile() {

    setDocumentFile(
      null
    );

    setError("");
    setSuccess("");

    if (
      documentInputRef.current
    ) {

      documentInputRef.current.value =
        "";
    }
  }


  async function submitDocument(
    status
  ) {

    setError("");
    setSuccess("");


    if (!user) {

      setError(
        "Please log in before publishing a document."
      );

      return;
    }


    if (!documentFile) {

      setError(
        "Select a PDF document first."
      );

      return;
    }


    if (!documentTitle.trim()) {

      setError(
        "Document title is required."
      );

      return;
    }


    if (
      documentTitle.trim().length >
      200
    ) {

      setError(
        "Document title cannot exceed 200 characters."
      );

      return;
    }


    if (
      documentDescription.length >
      5000
    ) {

      setError(
        "Description cannot exceed 5000 characters."
      );

      return;
    }


    try {

      setDocumentPublishing(
        true
      );


      const response =
        await createDocumentRequest({
          file:
            documentFile,

          title:
            documentTitle.trim(),

          description:
            documentDescription.trim(),

          category:
            documentCategory,

          language:
            documentLanguage,

          visibility:
            documentVisibility,

          allowDownload,

          status,
        });


      const savedDocument =
        response?.document ||
        null;


      setLastPublishedDocument(
        savedDocument
      );


      setSuccess(
        status === "published"
          ? "PDF document published successfully."
          : "PDF document saved as draft."
      );


      setDocumentFile(
        null
      );

      setDocumentTitle("");
      setDocumentDescription("");
      setDocumentCategory(
        "প্রবন্ধ"
      );
      setDocumentLanguage(
        "bn"
      );
      setDocumentVisibility(
        "public"
      );
      setAllowDownload(
        true
      );


    } catch (
      requestError
    ) {

      console.error(
        "DOCUMENT PUBLISH ERROR:",
        requestError
      );


      setError(
        requestError?.message ||
        "Unable to publish PDF document."
      );


    } finally {

      setDocumentPublishing(
        false
      );
    }
  }


  function handleDocumentSubmit(
    event
  ) {

    event.preventDefault();

    submitDocument(
      "published"
    );
  }


  // =======================================================
  // COUNTS
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


  // =======================================================
  // STATUS MESSAGE COMPONENT
  // =======================================================

  function StatusMessages() {

    return (
      <>
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
              aria-label="Close"
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
              aria-label="Close"
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
      </>
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <main className="write-page">

      {/* ================================================= */}
      {/* HERO                                              */}
      {/* ================================================= */}

      <section className="write-hero">

        <div className="write-hero-content">

          <div className="write-hero-icon">

            {publishMode ===
            "document" ? (

              <FileText
                size={25}
              />

            ) : (

              <PenLine
                size={25}
              />

            )}

          </div>


          <div>

            <span className="write-eyebrow">

              SHOBDO Creator Studio

            </span>


            <h1>

              {isEditMode
                ? "Edit your writing"
                : "Create and publish"}

            </h1>


            <p>

              Share original writing or publish
              a PDF document with the SHOBDO
              community.

            </p>

          </div>

        </div>

      </section>


      <section className="write-container">

        {/* ================================================= */}
        {/* CONTENT TYPE SELECTOR                             */}
        {/* ================================================= */}

        {!isEditMode && (

          <div className="publish-type-card">

            <div className="publish-type-heading">

              <span>
                CREATE
              </span>

              <h2>
                What would you like to publish?
              </h2>

              <p>
                Choose the format that best fits
                your work.
              </p>

            </div>


            <div
              className="publish-type-tabs"
              role="tablist"
              aria-label="Publishing type"
            >

              <button
                type="button"
                role="tab"
                aria-selected={
                  publishMode ===
                  "writing"
                }
                className={
                  publishMode ===
                  "writing"
                    ? "publish-type-tab active"
                    : "publish-type-tab"
                }
                onClick={() =>
                  changeMode(
                    "writing"
                  )
                }
              >

                <span className="publish-type-icon">

                  <PenLine
                    size={22}
                  />

                </span>

                <span>

                  <strong>
                    Writing
                  </strong>

                  <small>
                    Poetry, stories, essays
                    and thoughts
                  </small>

                </span>

              </button>


              <button
                type="button"
                role="tab"
                aria-selected={
                  publishMode ===
                  "document"
                }
                className={
                  publishMode ===
                  "document"
                    ? "publish-type-tab active"
                    : "publish-type-tab"
                }
                onClick={() =>
                  changeMode(
                    "document"
                  )
                }
              >

                <span className="publish-type-icon">

                  <FileText
                    size={22}
                  />

                </span>

                <span>

                  <strong>
                    PDF Document
                  </strong>

                  <small>
                    Publish complete PDF files
                  </small>

                </span>

              </button>


              <button
                type="button"
                className="publish-type-tab disabled"
                disabled
                title="Artwork publishing will be added next."
              >

                <span className="publish-type-icon">

                  <Image
                    size={22}
                  />

                </span>

                <span>

                  <strong>
                    Artwork
                  </strong>

                  <small>
                    Coming soon
                  </small>

                </span>

              </button>

            </div>

          </div>

        )}


        {/* ================================================= */}
        {/* WRITING MODE                                     */}
        {/* ================================================= */}

        {publishMode ===
        "writing" && (

          <form
            className="write-form-card"
            onSubmit={
              handleWritingSubmit
            }
          >

            <StatusMessages />


            {/* ============================================= */}
            {/* LANGUAGE                                      */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    01
                  </span>

                  <h2>
                    Writing language
                  </h2>

                </div>


                <p>
                  Choose the language of your
                  writing.
                </p>

              </div>


              <div
                className="language-select-wrap"
                ref={
                  languageMenuRef
                }
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
                      currentLanguage
                        ?.shortName ||
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
                      (
                        language
                      ) => (

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

                              setLanguageMenuOpen(
                                false
                              );

                              setError("");
                              setSuccess("");

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

                  OCR currently supports
                  Bengali, English and Hindi.
                  You can still type directly
                  in this language.

                </p>

              )}

            </div>


            {/* ============================================= */}
            {/* OCR IMPORT                                    */}
            {/* ============================================= */}

            <div className="write-section scan-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    02
                  </span>

                  <h2>
                    Import text from document
                  </h2>

                </div>


                <span className="optional-badge">
                  Optional
                </span>

              </div>


              <p className="scan-description">

                Upload a scanned PDF or image
                and extract its text into your
                writing editor. This does not
                publish the original PDF.

              </p>


              {!selectedFile ? (

                <div
                  className={
                    isDragging
                      ? "scan-drop-zone dragging"
                      : "scan-drop-zone"
                  }
                  onDragOver={
                    handleScanDragOver
                  }
                  onDragLeave={
                    handleScanDragLeave
                  }
                  onDrop={
                    handleScanDrop
                  }
                >

                  <input
                    ref={
                      scanFileInputRef
                    }
                    type="file"
                    id="writing-document"
                    className="scan-file-input"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={
                      handleScanFileChange
                    }
                  />


                  <div className="scan-upload-icon">

                    <ScanText
                      size={28}
                    />

                  </div>


                  <h3>
                    Scan document to text
                  </h3>


                  <p>
                    Drag a PDF or image here,
                    or choose a file.
                  </p>


                  <button
                    type="button"
                    className="scan-select-button"
                    onClick={() =>
                      scanFileInputRef
                        .current
                        ?.click()
                    }
                  >

                    <FileImage
                      size={18}
                    />

                    Select scan

                  </button>


                  <small>
                    PDF, JPG, JPEG or PNG ·
                    Maximum 10 MB
                  </small>

                </div>

              ) : (

                <div className="selected-file-card">

                  <div className="selected-file-icon">

                    {isPdfFile(
                      selectedFile
                    ) ? (

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

                      {" • OCR import"}

                    </span>

                  </div>


                  <button
                    type="button"
                    className="remove-file-button"
                    disabled={
                      extracting
                    }
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
                  ? "Extracting text..."
                  : "Extract text"}

              </button>

            </div>


            {/* ============================================= */}
            {/* WRITING DETAILS                               */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    03
                  </span>

                  <h2>
                    Writing details
                  </h2>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="writing-title">

                  Title

                  <span aria-hidden="true">
                    *
                  </span>

                </label>


                <input
                  id="writing-title"
                  type="text"
                  value={title}
                  maxLength={200}
                  placeholder="Give your writing a title"
                  disabled={
                    publishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTitle(
                        event.target
                          .value
                      )
                  }
                />


                <div className="field-meta">

                  <span>
                    Make it memorable.
                  </span>

                  <span>
                    {title.length}/200
                  </span>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="writing-category">

                  Category

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
                  onChange={
                    (
                      event
                    ) =>
                      setCategory(
                        event.target
                          .value
                      )
                  }
                >

                  {CATEGORIES.map(
                    (
                      item
                    ) => (

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

                    Your writing

                    <span aria-hidden="true">
                      *
                    </span>

                  </label>


                  <div className="content-stats">

                    <span>
                      {wordCount} words
                    </span>

                    <span>
                      {characterCount} characters
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
                  onChange={
                    (
                      event
                    ) =>
                      setContent(
                        event.target
                          .value
                      )
                  }
                />

              </div>

            </div>


            {/* ============================================= */}
            {/* WRITING ACTIONS                               */}
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

                Save Draft

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
                  ? "Publishing..."
                  : "Publish Writing"}

              </button>

            </div>

          </form>

        )}


        {/* ================================================= */}
        {/* PDF DOCUMENT MODE                                */}
        {/* ================================================= */}

        {publishMode ===
        "document" && (

          <form
            className="write-form-card document-publish-form"
            onSubmit={
              handleDocumentSubmit
            }
          >

            <StatusMessages />


            {/* ============================================= */}
            {/* PDF UPLOAD                                    */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    01
                  </span>

                  <h2>
                    Upload your PDF
                  </h2>

                </div>


                <span className="document-format-badge">

                  <FileText
                    size={15}
                  />

                  PDF

                </span>

              </div>


              <p className="scan-description">

                The original PDF will be stored
                securely and published as a
                document on SHOBDO.

              </p>


              {!documentFile ? (

                <div
                  className={
                    documentDragging
                      ? "document-drop-zone dragging"
                      : "document-drop-zone"
                  }
                  onDragOver={
                    handleDocumentDragOver
                  }
                  onDragLeave={
                    handleDocumentDragLeave
                  }
                  onDrop={
                    handleDocumentDrop
                  }
                >

                  <input
                    ref={
                      documentInputRef
                    }
                    type="file"
                    id="publish-pdf-document"
                    className="scan-file-input"
                    accept=".pdf,application/pdf"
                    onChange={
                      handleDocumentFileChange
                    }
                  />


                  <div className="document-upload-icon">

                    <Upload
                      size={30}
                    />

                  </div>


                  <h3>
                    Drop your PDF here
                  </h3>


                  <p>
                    Upload manuscripts,
                    essays, research,
                    magazines or other
                    literary documents.
                  </p>


                  <button
                    type="button"
                    className="scan-select-button"
                    onClick={() =>
                      documentInputRef
                        .current
                        ?.click()
                    }
                  >

                    <FileText
                      size={18}
                    />

                    Choose PDF

                  </button>


                  <small>
                    PDF only · Maximum 10 MB ·
                    Maximum 30 pages
                  </small>

                </div>

              ) : (

                <>

                  <div className="document-selected-card">

                    <div className="document-selected-icon">

                      <FileText
                        size={30}
                      />

                    </div>


                    <div className="document-selected-info">

                      <strong>
                        {
                          documentFile.name
                        }
                      </strong>

                      <span>

                        {
                          formatFileSize(
                            documentFile.size
                          )
                        }

                        {" • Ready to publish"}

                      </span>

                    </div>


                    <button
                      type="button"
                      className="remove-file-button"
                      disabled={
                        documentPublishing
                      }
                      onClick={
                        removeDocumentFile
                      }
                    >

                      <Trash2
                        size={19}
                      />

                    </button>

                  </div>


                  {documentPreviewUrl && (

                    <div className="document-preview">

                      <div className="document-preview-header">

                        <div>

                          <FileText
                            size={18}
                          />

                          <span>
                            PDF Preview
                          </span>

                        </div>


                        <a
                          href={
                            documentPreviewUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >

                          Open preview

                        </a>

                      </div>


                      <iframe
                        src={
                          documentPreviewUrl
                        }
                        title="PDF preview"
                      />

                    </div>

                  )}

                </>

              )}

            </div>


            {/* ============================================= */}
            {/* DOCUMENT INFORMATION                          */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    02
                  </span>

                  <h2>
                    Document information
                  </h2>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="document-title">

                  Document title

                  <span aria-hidden="true">
                    *
                  </span>

                </label>


                <input
                  id="document-title"
                  type="text"
                  maxLength={200}
                  value={
                    documentTitle
                  }
                  placeholder="Enter the document title"
                  disabled={
                    documentPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDocumentTitle(
                        event.target
                          .value
                      )
                  }
                />


                <div className="field-meta">

                  <span>
                    This title will appear
                    publicly on SHOBDO.
                  </span>

                  <span>
                    {
                      documentTitle
                        .length
                    }/200
                  </span>

                </div>

              </div>


              <div className="document-field-grid">

                <div className="write-field">

                  <label htmlFor="document-category">
                    Category
                  </label>


                  <select
                    id="document-category"
                    value={
                      documentCategory
                    }
                    disabled={
                      documentPublishing
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setDocumentCategory(
                          event.target
                            .value
                        )
                    }
                  >

                    {CATEGORIES.map(
                      (
                        item
                      ) => (

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


                <div className="write-field">

                  <label htmlFor="document-language">
                    Language
                  </label>


                  <select
                    id="document-language"
                    value={
                      documentLanguage
                    }
                    disabled={
                      documentPublishing
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setDocumentLanguage(
                          event.target
                            .value
                        )
                    }
                  >

                    {DOCUMENT_LANGUAGES.map(
                      (
                        language
                      ) => (

                        <option
                          key={
                            language.code
                          }
                          value={
                            language.code
                          }
                        >

                          {
                            language.label
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="document-description">
                  Description
                </label>


                <textarea
                  id="document-description"
                  value={
                    documentDescription
                  }
                  rows={6}
                  maxLength={5000}
                  placeholder="Tell readers what this document is about..."
                  disabled={
                    documentPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDocumentDescription(
                        event.target
                          .value
                      )
                  }
                />


                <div className="field-meta">

                  <span>
                    Optional, but recommended.
                  </span>

                  <span>
                    {
                      documentDescription
                        .length
                    }/5000
                  </span>

                </div>

              </div>

            </div>


            {/* ============================================= */}
            {/* DOCUMENT SETTINGS                             */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">
                    03
                  </span>

                  <h2>
                    Publishing settings
                  </h2>

                </div>

              </div>


              <div className="document-settings-grid">

                <label
                  className={
                    documentVisibility ===
                    "public"
                      ? "document-setting-card active"
                      : "document-setting-card"
                  }
                >

                  <input
                    type="radio"
                    name="document-visibility"
                    value="public"
                    checked={
                      documentVisibility ===
                      "public"
                    }
                    disabled={
                      documentPublishing
                    }
                    onChange={() =>
                      setDocumentVisibility(
                        "public"
                      )
                    }
                  />


                  <BookOpen
                    size={21}
                  />


                  <span>

                    <strong>
                      Public
                    </strong>

                    <small>
                      Anyone can discover
                      and read this document.
                    </small>

                  </span>

                </label>


                <label
                  className={
                    documentVisibility ===
                    "unlisted"
                      ? "document-setting-card active"
                      : "document-setting-card"
                  }
                >

                  <input
                    type="radio"
                    name="document-visibility"
                    value="unlisted"
                    checked={
                      documentVisibility ===
                      "unlisted"
                    }
                    disabled={
                      documentPublishing
                    }
                    onChange={() =>
                      setDocumentVisibility(
                        "unlisted"
                      )
                    }
                  />


                  <Lock
                    size={21}
                  />


                  <span>

                    <strong>
                      Unlisted
                    </strong>

                    <small>
                      Accessible by direct
                      link but not publicly
                      listed.
                    </small>

                  </span>

                </label>

              </div>


              <label className="document-download-toggle">

                <input
                  type="checkbox"
                  checked={
                    allowDownload
                  }
                  disabled={
                    documentPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setAllowDownload(
                        event.target
                          .checked
                      )
                  }
                />


                <span className="document-toggle-icon">

                  <Download
                    size={19}
                  />

                </span>


                <span>

                  <strong>
                    Allow readers to download
                  </strong>

                  <small>
                    Readers can save the
                    original PDF file.
                  </small>

                </span>

              </label>

            </div>


            {/* ============================================= */}
            {/* DOCUMENT ACTIONS                              */}
            {/* ============================================= */}

            <div className="write-form-actions">

              <button
                type="button"
                className="draft-button"
                disabled={
                  documentPublishing ||
                  !documentFile
                }
                onClick={() =>
                  submitDocument(
                    "draft"
                  )
                }
              >

                {documentPublishing ? (

                  <LoaderCircle
                    className="spin"
                    size={19}
                  />

                ) : (

                  <Save
                    size={19}
                  />

                )}

                Save Document Draft

              </button>


              <button
                type="submit"
                className="publish-button"
                disabled={
                  documentPublishing ||
                  !documentFile
                }
              >

                {documentPublishing ? (

                  <LoaderCircle
                    className="spin"
                    size={20}
                  />

                ) : (

                  <Send
                    size={19}
                  />

                )}


                {documentPublishing
                  ? "Publishing PDF..."
                  : "Publish PDF"}

              </button>

            </div>


            {/* ============================================= */}
            {/* LAST PUBLISHED DOCUMENT                       */}
            {/* ============================================= */}

            {lastPublishedDocument && (

              <div className="document-published-result">

                <CheckCircle2
                  size={22}
                />


                <div>

                  <strong>
                    {
                      lastPublishedDocument
                        .title
                    }
                  </strong>

                  <span>
                    Your document was stored
                    successfully.
                  </span>

                </div>


                {lastPublishedDocument
                  .file_url && (

                  <a
                    href={
                      lastPublishedDocument
                        .file_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >

                    View PDF

                  </a>

                )}

              </div>

            )}

          </form>

        )}

      </section>

    </main>

  );
}


export default Write;