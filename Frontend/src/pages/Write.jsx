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


const ARTWORK_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];


const ARTWORK_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];


const ARTWORK_CATEGORIES = [
  "Painting",
  "Sketch",
  "Digital Art",
  "Photography",
  "Calligraphy",
  "Illustration",
  "Other",
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
// PREMIUM TITLE AUTOCOMPLETE
// =========================================================

const RECENT_WRITING_TITLES_KEY =
  "shobdo_recent_writing_titles";

const RECENT_WRITING_TITLES_LIMIT =
  8;


const TITLE_SUGGESTION_COPY = {

  bn: {
    heading: "শিরোনামের অনুপ্রেরণা",
    description:
      "সাম্প্রতিক ও প্রস্তাবিত শিরোনাম থেকে বেছে নিন",
    recent: "সাম্প্রতিক",
    suggested: "প্রস্তাবিত",
    keyboard:
      "↑ ↓ নির্বাচন · Enter ব্যবহার · Esc বন্ধ",
  },

  hi: {
    heading: "शीर्षक प्रेरणा",
    description:
      "हाल के और सुझाए गए शीर्षकों में से चुनें",
    recent: "हाल का",
    suggested: "सुझाव",
    keyboard:
      "↑ ↓ चुनें · Enter उपयोग करें · Esc बंद करें",
  },

  en: {
    heading: "Title inspiration",
    description:
      "Choose from recent and suggested titles",
    recent: "Recent",
    suggested: "Suggested",
    keyboard:
      "↑ ↓ Select · Enter use · Esc close",
  },

};


const TITLE_STARTER_SUGGESTIONS = {

  bn: [
    "চক্রের ছায়ারূপ",
    "গ্রন্থ",
    "মানবতার বীণাবাদন",
    "বর্ষা যখন সঙ্গী",
    "তেপান্তরের অগ্নিবীণা",
  ],

  hi: [
    "शब्दों के पार",
    "बारिश जब साथी बनी",
    "मन की वीणा",
    "क्षितिज के उस पार",
    "एक अधूरी चिट्ठी",
  ],

  en: [
    "Echoes Between Pages",
    "When Rain Returns",
    "The Last Letter",
    "Beyond the Horizon",
    "A Sky Between Us",
  ],

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


function isAllowedArtworkFile(
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
    ARTWORK_FILE_TYPES.includes(
      file.type
    ) ||
    ARTWORK_EXTENSIONS.includes(
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
    getFileExtension(
      file.name
    ) === ".pdf"
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
// RECENT WRITING TITLES
// =========================================================

function getRecentWritingTitles() {

  try {

    const raw =
      localStorage.getItem(
        RECENT_WRITING_TITLES_KEY
      );


    if (!raw) {
      return [];
    }


    const parsed =
      JSON.parse(raw);


    if (!Array.isArray(parsed)) {
      return [];
    }


    return parsed
      .filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      )
      .map(
        (item) =>
          item.trim()
      )
      .slice(
        0,
        RECENT_WRITING_TITLES_LIMIT
      );


  } catch (
    storageError
  ) {

    console.warn(
      "Unable to read recent writing titles:",
      storageError
    );

    return [];
  }
}


function saveRecentWritingTitle(
  title
) {

  const cleanTitle =
    String(title || "")
      .trim();


  if (!cleanTitle) {
    return getRecentWritingTitles();
  }


  try {

    const currentTitles =
      getRecentWritingTitles();


    const normalizedTitle =
      cleanTitle
        .toLocaleLowerCase();


    const nextTitles = [

      cleanTitle,

      ...currentTitles.filter(
        (item) =>
          item
            .toLocaleLowerCase() !==
          normalizedTitle
      ),

    ].slice(
      0,
      RECENT_WRITING_TITLES_LIMIT
    );


    localStorage.setItem(
      RECENT_WRITING_TITLES_KEY,
      JSON.stringify(
        nextTitles
      )
    );


    return nextTitles;


  } catch (
    storageError
  ) {

    console.warn(
      "Unable to save recent writing title:",
      storageError
    );

    return [];
  }
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
  authErrorMessage,
  requestErrorMessage,
}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      authErrorMessage ||
        "Please log in before publishing a document."
    );
  }

  if (!file) {
    throw new Error(
      "Please select a PDF document first."
    );
  }

  const formData = new FormData();

  formData.append(
    "document",
    file
  );

  formData.append(
    "title",
    title || ""
  );

  formData.append(
    "description",
    description || ""
  );

  formData.append(
    "category",
    category || "প্রবন্ধ"
  );

  formData.append(
    "language",
    language || "bn"
  );

  formData.append(
    "visibility",
    visibility || "public"
  );

  formData.append(
    "allow_download",
    allowDownload
      ? "true"
      : "false"
  );

  formData.append(
    "status",
    status || "published"
  );

  console.log(
    "Publishing PDF to:",
    `${API_URL}/documents`
  );

  console.log(
    "PDF file:",
    file.name,
    file.size,
    file.type
  );

  let response;

  try {
    response = await fetch(
      `${API_URL}/documents`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );
  } catch (networkError) {
    console.error(
      "DOCUMENT NETWORK ERROR:",
      networkError
    );

    throw new Error(
      "Unable to connect to the SHOBDO server. Please check your internet connection or backend server."
    );
  }

  let data = null;

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      data = {
        message: text,
      };
    }
  } catch (parseError) {
    console.error(
      "Unable to parse document response:",
      parseError
    );

    data = null;
  }

  console.log(
    "Document API response:",
    response.status,
    data
  );

  if (!response.ok) {
    let message =
      data?.message ||
      data?.error ||
      data?.detail ||
      "";

    if (
      response.status === 400 &&
      !message
    ) {
      message =
        "The PDF information is invalid.";
    }

    if (
      response.status === 401
    ) {
      message =
        message ||
        "Your login session has expired. Please log in again.";
    }

    if (
      response.status === 403
    ) {
      message =
        message ||
        "You do not have permission to publish this document.";
    }

    if (
      response.status === 404
    ) {
      message =
        "PDF publishing API was not found. Make sure the /api/documents backend route is registered.";
    }

    if (
      response.status === 413
    ) {
      message =
        "The PDF file is too large.";
    }

    if (
      response.status >= 500
    ) {
      message =
        message ||
        "The server could not publish the PDF. Please check the backend logs.";
    }

    if (!message) {
      message =
        requestErrorMessage ||
        `Unable to publish PDF. Server returned ${response.status}.`;
    }

    const requestError =
      new Error(message);

    requestError.status =
      response.status;

    requestError.data =
      data;

    throw requestError;
  }

  return data;
}


// =========================================================
// ARTWORK API
// =========================================================

async function createArtworkRequest({
  file,
  title,
  description,
  category,
  language,
  visibility,
  allowDownload,
  status,
  authErrorMessage,
  requestErrorMessage,
}) {

  const token =
    getToken();

  if (!token) {
    throw new Error(
      authErrorMessage
    );
  }

  const formData =
    new FormData();

  formData.append(
    "artwork",
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
      `${API_URL}/artworks`,
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

    const serverMessage =
      data?.message ||
      data?.error ||
      "";

    const requestError =
      new Error(
        serverMessage ||
        requestErrorMessage
      );

    requestError.status =
      response.status;

    requestError.serverMessage =
      serverMessage;

    throw requestError;
  }

  return data;
}


// =========================================================
// WRITE PAGE
// =========================================================

function getDefaultWritingLanguage(
  uiLanguage
) {

  if (
    ["bn", "en", "hi"].includes(
      uiLanguage
    )
  ) {
    return uiLanguage;
  }

  return "bn";
}

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
    language: uiLanguage,
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
  ] = useState(
    "writing"
  );


  useEffect(() => {

    if (isEditMode) {

      setPublishMode(
        "writing"
      );
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

    setPublishMode(
      mode
    );
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
          "categories.poetry",
          "Poetry"
        ),

      "গল্প":
        t(
          "categories.story",
          "Story"
        ),

      "অনুভূতি":
        t(
          "categories.reflection",
          "Feelings"
        ),

      "প্রবন্ধ":
        t(
          "categories.essay",
          "Essay"
        ),

      "অন্যান্য":
        t(
          "categories.other",
          "Other"
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
    () =>
      getDefaultWritingLanguage(
        uiLanguage
      )
  );


  const [
    publishing,
    setPublishing,
  ] = useState(false);

  // =======================================================
// PREMIUM TITLE AUTOCOMPLETE STATE
// =======================================================

const titleAutocompleteRef =
  useRef(null);


const titleInputRef =
  useRef(null);


const [
  recentWritingTitles,
  setRecentWritingTitles,
] = useState(
  () =>
    getRecentWritingTitles()
);


const [
  titleSuggestionsOpen,
  setTitleSuggestionsOpen,
] = useState(false);


const [
  activeTitleSuggestionIndex,
  setActiveTitleSuggestionIndex,
] = useState(-1);


const titleSuggestionCopy =
  TITLE_SUGGESTION_COPY[
    uiLanguage
  ] ||
  TITLE_SUGGESTION_COPY.en;


const filteredTitleSuggestions =
  useMemo(
    () => {

      const query =
        title
          .trim()
          .toLocaleLowerCase();


      const recentItems =
        recentWritingTitles
          .map(
            (item) => ({
              title: item,
              source: "recent",
            })
          );


      const recentKeys =
        new Set(
          recentItems.map(
            (item) =>
              item.title
                .toLocaleLowerCase()
          )
        );


      const starterItems =
        (
          TITLE_STARTER_SUGGESTIONS[
            writingLanguage
          ] ||
          []
        )
          .filter(
            (item) =>
              !recentKeys.has(
                item
                  .toLocaleLowerCase()
              )
          )
          .map(
            (item) => ({
              title: item,
              source: "suggested",
            })
          );


      return [
        ...recentItems,
        ...starterItems,
      ]
        .filter(
          (item) => {

            const normalized =
              item.title
                .toLocaleLowerCase();


            if (
              normalized ===
              query &&
              query
            ) {

              return false;
            }


            if (!query) {
              return true;
            }


            return normalized
              .includes(
                query
              );
          }
        )
        .slice(
          0,
          RECENT_WRITING_TITLES_LIMIT
        );

    },
    [
      title,
      recentWritingTitles,
      writingLanguage,
    ]
  );


const showTitleSuggestions =
  titleSuggestionsOpen &&
  filteredTitleSuggestions
    .length > 0 &&
  !publishing;


// =======================================================
// CLOSE TITLE MENU WHEN CLICKING OUTSIDE
// =======================================================

useEffect(() => {

  function handleTitleOutsideClick(
    event
  ) {

    if (
      titleAutocompleteRef.current &&
      !titleAutocompleteRef
        .current
        .contains(
          event.target
        )
    ) {

      setTitleSuggestionsOpen(
        false
      );

      setActiveTitleSuggestionIndex(
        -1
      );
    }
  }


  document.addEventListener(
    "mousedown",
    handleTitleOutsideClick
  );


  return () => {

    document.removeEventListener(
      "mousedown",
      handleTitleOutsideClick
    );

  };

}, []);


// =======================================================
// TITLE CHANGE
// =======================================================

function handleWritingTitleChange(
  event
) {

  const nextValue =
    event.target.value;


  setTitle(
    nextValue
  );


  setActiveTitleSuggestionIndex(
    -1
  );


  setTitleSuggestionsOpen(
    true
  );
}


// =======================================================
// CHOOSE TITLE SUGGESTION
// =======================================================

function chooseTitleSuggestion(
  suggestion
) {

  const nextTitle =
    typeof suggestion === "string"
      ? suggestion
      : suggestion?.title ||
        "";


  if (!nextTitle) {
    return;
  }


  setTitle(
    nextTitle
  );


  setTitleSuggestionsOpen(
    false
  );


  setActiveTitleSuggestionIndex(
    -1
  );


  requestAnimationFrame(
    () => {

      titleInputRef
        .current
        ?.focus();

    }
  );
}


// =======================================================
// TITLE KEYBOARD NAVIGATION
// =======================================================

function handleTitleKeyDown(
  event
) {

  if (
    !showTitleSuggestions
  ) {

    if (
      event.key ===
      "ArrowDown" &&
      filteredTitleSuggestions
        .length
    ) {

      event.preventDefault();

      setTitleSuggestionsOpen(
        true
      );

      setActiveTitleSuggestionIndex(
        0
      );
    }


    return;
  }


  if (
    event.key ===
    "ArrowDown"
  ) {

    event.preventDefault();


    setActiveTitleSuggestionIndex(
      (
        current
      ) => {

        if (
          current >=
          filteredTitleSuggestions
            .length -
            1
        ) {

          return 0;
        }


        return current + 1;
      }
    );


    return;
  }


  if (
    event.key ===
    "ArrowUp"
  ) {

    event.preventDefault();


    setActiveTitleSuggestionIndex(
      (
        current
      ) => {

        if (
          current <= 0
        ) {

          return (
            filteredTitleSuggestions
              .length -
            1
          );
        }


        return current - 1;
      }
    );


    return;
  }


  if (
    event.key ===
    "Enter" &&
    activeTitleSuggestionIndex >=
      0
  ) {

    event.preventDefault();


    const selected =
      filteredTitleSuggestions[
        activeTitleSuggestionIndex
      ];


    if (selected) {

      chooseTitleSuggestion(
        selected
      );

    }


    return;
  }


  if (
    event.key ===
    "Escape"
  ) {

    event.preventDefault();


    setTitleSuggestionsOpen(
      false
    );


    setActiveTitleSuggestionIndex(
      -1
    );
  }
}


// =======================================================
// REMEMBER A TITLE
// =======================================================

function rememberWritingTitle(
  value
) {

  const cleanValue =
    String(value || "")
      .trim();


  if (!cleanValue) {
    return;
  }


  const updatedTitles =
    saveRecentWritingTitle(
      cleanValue
    );


  setRecentWritingTitles(
    updatedTitles
  );
}


  // =======================================================
  // SYNC NEW WRITING LANGUAGE WITH WEBSITE LANGUAGE
  // =======================================================
  //
  // A new, empty writing follows the current website
  // language (বাংলা / English / हिन्दी).
  //
  // Once the user starts writing, the selected content
  // language is preserved independently from the UI.
  // =======================================================

  useEffect(() => {

    if (isEditMode) {
      return;
    }


    const hasStartedWriting =
      Boolean(
        title.trim() ||
        content.trim()
      );


    if (hasStartedWriting) {
      return;
    }


    setWritingLanguage(
      getDefaultWritingLanguage(
        uiLanguage
      )
    );

  }, [
    uiLanguage,
    isEditMode,
    title,
    content,
  ]);


  // =======================================================
  // EDIT PREFILL
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
        event.key ===
        "Escape"
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

      return (
        language.englishName
      );
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
  // OCR STATE
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


    if (
      !isAllowedScanFile(
        file
      )
    ) {

      setSelectedFile(
        null
      );

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

      setSelectedFile(
        null
      );

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

    setSelectedFile(
      null
    );

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

    setIsDragging(
      true
    );
  }


  function handleScanDragLeave(
    event
  ) {

    event.preventDefault();

    setIsDragging(
      false
    );
  }


  function handleScanDrop(
    event
  ) {

    event.preventDefault();

    setIsDragging(
      false
    );

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
        t(
          "write.ocrLanguageUnsupported",
          "OCR currently supports Bengali, English and Hindi only."
        )
      );

      return;
    }


    try {

      setExtracting(
        true
      );


      const response =
        await extractScannedText(
          selectedFile,
          writingLanguage
        );


      const extractedText =
        typeof response ===
        "string"
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

      setExtracting(
        false
      );
    }
  }


  // =======================================================
  // SAVE WRITING DRAFT
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

      setPublishing(
        true
      );


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
          t(
            "write.draftIdMissing",
            "Draft saved, but no writing ID was returned."
          )
        );
      }


      localStorage.removeItem(
        "shobdo_writing_draft"
      );


      rememberWritingTitle(
        title
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

      setPublishing(
        false
      );
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

      setPublishing(
        true
      );


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


      rememberWritingTitle(
        title
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

      setPublishing(
        false
      );
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
    () =>
      getDefaultWritingLanguage(
        uiLanguage
      )
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


  // =======================================================
  // SYNC NEW DOCUMENT LANGUAGE WITH WEBSITE LANGUAGE
  // =======================================================
  //
  // A new, untouched PDF form follows the website language.
  // Once the user selects a file or starts entering document
  // information, the document language is preserved.
  // =======================================================

  useEffect(() => {

    const hasStartedDocument =
      Boolean(
        documentFile ||
        documentTitle.trim() ||
        documentDescription.trim()
      );


    if (hasStartedDocument) {
      return;
    }


    setDocumentLanguage(
      getDefaultWritingLanguage(
        uiLanguage
      )
    );

  }, [
    uiLanguage,
    documentFile,
    documentTitle,
    documentDescription,
  ]);


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

      setDocumentFile(
        null
      );

      setError(
        t(
          "write.documentOnlyPdf",
          "Only PDF documents can be published in Document mode."
        )
      );

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      setDocumentFile(
        null
      );

      setError(
        t(
          "write.documentFileTooLarge",
          "PDF size cannot exceed 10 MB."
        )
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
    status = "published"
  ) {

    setError("");
    setSuccess("");

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const token = getToken();

  if (!token) {
    setError(
      t(
        "write.documentLoginRequired",
        "Please log in before publishing a document."
      )
    );

    setTimeout(() => {
      navigate(
        "/login",
        {
          state: {
            from:
              location.pathname,
          },
        }
      );
    }, 1000);

    return;
  }

  // =====================================================
  // FILE VALIDATION
  // =====================================================

  if (!documentFile) {
    setError(
      t(
        "write.documentFileRequired",
        "Select a PDF document first."
      )
    );

    return;
  }

  if (
    !isPdfFile(
      documentFile
    )
  ) {
    setError(
      t(
        "write.documentOnlyPdf",
        "Only PDF documents can be published."
      )
    );

    return;
  }

  if (
    documentFile.size >
    MAX_FILE_SIZE
  ) {
    setError(
      t(
        "write.documentFileTooLarge",
        "PDF size cannot exceed 10 MB."
      )
    );

    return;
  }

  // =====================================================
  // TITLE VALIDATION
  // =====================================================

  const cleanTitle =
    documentTitle.trim();

  if (!cleanTitle) {
    setError(
      t(
        "write.documentTitleRequired",
        "Document title is required."
      )
    );

    return;
  }

  if (
    cleanTitle.length >
    200
  ) {
    setError(
      t(
        "write.documentTitleTooLong",
        "Document title cannot exceed 200 characters."
      )
    );

    return;
  }

  // =====================================================
  // DESCRIPTION VALIDATION
  // =====================================================

  const cleanDescription =
    documentDescription.trim();

  if (
    cleanDescription.length >
    5000
  ) {
    setError(
      t(
        "write.documentDescriptionTooLong",
        "Description cannot exceed 5000 characters."
      )
    );

    return;
  }

  // =====================================================
  // START PUBLISHING
  // =====================================================

  try {
    setDocumentPublishing(
      true
    );

    console.log(
      "Starting document publication..."
    );

    console.log({
      file:
        documentFile.name,

      fileSize:
        documentFile.size,

      title:
        cleanTitle,

      category:
        documentCategory,

      language:
        documentLanguage,

      visibility:
        documentVisibility,

      allowDownload,

      status,
    });

    const response =
      await createDocumentRequest({
        file:
          documentFile,

        title:
          cleanTitle,

        description:
          cleanDescription,

        category:
          documentCategory,

        language:
          documentLanguage,

        visibility:
          documentVisibility,

        allowDownload,

        status,

        authErrorMessage:
          t(
            "write.documentLoginRequired",
            "Please log in before publishing a document."
          ),

        requestErrorMessage:
          t(
            "write.documentPublishFailed",
            "Unable to publish PDF document."
          ),
      });

    console.log(
      "DOCUMENT PUBLISH SUCCESS:",
      response
    );

    const savedDocument =
      response?.document ||
      response?.data?.document ||
      response?.data ||
      response;

    if (
      !savedDocument
    ) {
      throw new Error(
        "The server accepted the PDF but did not return document information."
      );
    }

    setLastPublishedDocument(
      savedDocument
    );

    setSuccess(
      status ===
        "published"
        ? t(
            "write.documentPublished",
            "PDF document published successfully."
          )
        : t(
            "write.documentDraftSaved",
            "PDF document saved as draft."
          )
    );

    // ===================================================
    // OPTIONAL GLOBAL UPDATE
    // ===================================================

    if (
      typeof onPublished ===
        "function" &&
      status ===
        "published"
    ) {
      onPublished(
        savedDocument
      );
    }

    // ===================================================
    // RESET FORM
    // ===================================================

    setDocumentFile(
      null
    );

    if (
      documentInputRef.current
    ) {
      documentInputRef.current.value =
        "";
    }

    setDocumentTitle(
      ""
    );

    setDocumentDescription(
      ""
    );

    setDocumentCategory(
      "প্রবন্ধ"
    );

    setDocumentLanguage(
      getDefaultWritingLanguage(
        uiLanguage
      )
    );

    setDocumentVisibility(
      "public"
    );

    setAllowDownload(
      true
    );

    // Scroll upward so the success message is visible.
    setTimeout(() => {
      const form =
        document.querySelector(
          ".document-publish-form"
        );

      form?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return savedDocument;

  } catch (
    requestError
  ) {
    console.error(
      "DOCUMENT PUBLISH ERROR:",
      requestError
    );

    let message =
      requestError?.message ||
      t(
        "write.documentPublishFailed",
        "Unable to publish PDF document."
      );

    if (
      requestError?.status ===
      401
    ) {
      localStorage.removeItem(
        "shobdo_token"
      );

      message =
        t(
          "write.sessionExpired",
          "Your login session has expired. Please log in again."
        );
    }

    setError(
      message
    );

    // Your error box is at the TOP of the form.
    // Without this, clicking the bottom button can look like
    // nothing happened.
    setTimeout(() => {
      const form =
        document.querySelector(
          ".document-publish-form"
        );

      form?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return null;

  } finally {
    setDocumentPublishing(
      false
    );
  }
}


  async function handleDocumentSubmit(
    event
  ) {

    event.preventDefault();

    if (
      documentPublishing
    ) {
      return;
    }

    await submitDocument(
      "published"
    );
  }


  // =======================================================
  // ARTWORK STATE
  // =======================================================

  const artworkInputRef =
    useRef(null);

  const [
    artworkFile,
    setArtworkFile,
  ] = useState(null);

  const [
    artworkDragging,
    setArtworkDragging,
  ] = useState(false);

  const [
    artworkTitle,
    setArtworkTitle,
  ] = useState("");

  const [
    artworkDescription,
    setArtworkDescription,
  ] = useState("");

  const [
    artworkCategory,
    setArtworkCategory,
  ] = useState(
    "Digital Art"
  );

  const [
    artworkLanguage,
    setArtworkLanguage,
  ] = useState(
    () =>
      getDefaultWritingLanguage(
        uiLanguage
      )
  );

  const [
    artworkVisibility,
    setArtworkVisibility,
  ] = useState(
    "public"
  );

  const [
    artworkAllowDownload,
    setArtworkAllowDownload,
  ] = useState(
    true
  );

  const [
    artworkPublishing,
    setArtworkPublishing,
  ] = useState(
    false
  );

  const [
    lastPublishedArtwork,
    setLastPublishedArtwork,
  ] = useState(null);


  useEffect(() => {

    const hasStartedArtwork =
      Boolean(
        artworkFile ||
        artworkTitle.trim() ||
        artworkDescription.trim()
      );

    if (hasStartedArtwork) {
      return;
    }

    setArtworkLanguage(
      getDefaultWritingLanguage(
        uiLanguage
      )
    );

  }, [
    uiLanguage,
    artworkFile,
    artworkTitle,
    artworkDescription,
  ]);


  const artworkPreviewUrl =
    useMemo(
      () => {

        if (!artworkFile) {
          return "";
        }

        return URL.createObjectURL(
          artworkFile
        );
      },
      [
        artworkFile,
      ]
    );


  useEffect(() => {

    return () => {

      if (
        artworkPreviewUrl
      ) {
        URL.revokeObjectURL(
          artworkPreviewUrl
        );
      }
    };

  }, [
    artworkPreviewUrl,
  ]);


  function validateArtworkFile(
    file
  ) {

    setError("");
    setSuccess("");

    if (!file) {
      return;
    }

    if (
      !isAllowedArtworkFile(
        file
      )
    ) {

      setArtworkFile(
        null
      );

      setError(
        t(
          "write.artworkInvalidFile",
          "Only JPG, JPEG, PNG and WEBP images can be published as artwork."
        )
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      setArtworkFile(
        null
      );

      setError(
        t(
          "write.artworkFileTooLarge",
          "Artwork image size cannot exceed 10 MB."
        )
      );

      return;
    }

    setArtworkFile(
      file
    );

    if (
      !artworkTitle.trim()
    ) {

      const titleFromFile =
        file.name
          .replace(
            /\.(jpg|jpeg|png|webp)$/i,
            ""
          )
          .replace(
            /[_-]+/g,
            " "
          )
          .trim();

      setArtworkTitle(
        titleFromFile.slice(
          0,
          200
        )
      );
    }
  }


  function handleArtworkFileChange(
    event
  ) {

    validateArtworkFile(
      event.target.files?.[0]
    );

    event.target.value =
      "";
  }


  function handleArtworkDragOver(
    event
  ) {

    event.preventDefault();

    setArtworkDragging(
      true
    );
  }


  function handleArtworkDragLeave(
    event
  ) {

    event.preventDefault();

    setArtworkDragging(
      false
    );
  }


  function handleArtworkDrop(
    event
  ) {

    event.preventDefault();

    setArtworkDragging(
      false
    );

    validateArtworkFile(
      event.dataTransfer
        .files?.[0]
    );
  }


  function removeArtworkFile() {

    setArtworkFile(
      null
    );

    setError("");
    setSuccess("");

    if (
      artworkInputRef.current
    ) {
      artworkInputRef.current.value =
        "";
    }
  }


  async function submitArtwork(
    status
  ) {

    setError("");
    setSuccess("");

    if (!user) {

      setError(
        t(
          "write.artworkLoginRequired",
          "Please log in before publishing artwork."
        )
      );

      return;
    }

    if (!artworkFile) {

      setError(
        t(
          "write.artworkFileRequired",
          "Select an artwork image first."
        )
      );

      return;
    }

    if (
      !artworkTitle.trim()
    ) {

      setError(
        t(
          "write.artworkTitleRequired",
          "Artwork title is required."
        )
      );

      return;
    }

    if (
      artworkTitle
        .trim()
        .length >
      200
    ) {

      setError(
        t(
          "write.artworkTitleTooLong",
          "Artwork title cannot exceed 200 characters."
        )
      );

      return;
    }

    if (
      artworkDescription.length >
      5000
    ) {

      setError(
        t(
          "write.artworkDescriptionTooLong",
          "Artwork description cannot exceed 5000 characters."
        )
      );

      return;
    }

    try {

      setArtworkPublishing(
        true
      );

      const response =
        await createArtworkRequest({

          file:
            artworkFile,

          title:
            artworkTitle.trim(),

          description:
            artworkDescription.trim(),

          category:
            artworkCategory,

          language:
            artworkLanguage,

          visibility:
            artworkVisibility,

          allowDownload:
            artworkAllowDownload,

          status,

          authErrorMessage:
            t(
              "write.artworkLoginRequired",
              "Please log in before publishing artwork."
            ),

          requestErrorMessage:
            t(
              "write.artworkPublishFailed",
              "Unable to publish artwork."
            ),
        });

      const savedArtwork =
        response?.artwork ||
        response?.data?.artwork ||
        response;

      setLastPublishedArtwork(
        savedArtwork
      );

      setSuccess(
        status === "published"
          ? t(
              "write.artworkPublished",
              "Artwork published successfully."
            )
          : t(
              "write.artworkDraftSaved",
              "Artwork saved as draft."
            )
      );

      if (
        typeof onPublished ===
          "function" &&
        savedArtwork
      ) {
        onPublished(
          savedArtwork
        );
      }

      setArtworkFile(
        null
      );

      setArtworkTitle("");
      setArtworkDescription("");

      setArtworkCategory(
        "Digital Art"
      );

      setArtworkLanguage(
        getDefaultWritingLanguage(
          uiLanguage
        )
      );

      setArtworkVisibility(
        "public"
      );

      setArtworkAllowDownload(
        true
      );

    } catch (
      requestError
    ) {

      console.error(
        "ARTWORK PUBLISH ERROR:",
        requestError
      );

      setError(
        requestError?.message ||
        t(
          "write.artworkPublishFailed",
          "Unable to publish artwork."
        )
      );

    } finally {

      setArtworkPublishing(
        false
      );
    }
  }


  function handleArtworkSubmit(
    event
  ) {

    event.preventDefault();

    submitArtwork(
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
  // STATUS MESSAGES
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
              aria-label={
                t(
                  "common.close",
                  "Close"
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
                  "common.close",
                  "Close"
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

            ) : publishMode ===
              "artwork" ? (

              <Image
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

              {t(
                "write.creatorEyebrow",
                "SHOBDO Creator Studio"
              )}

            </span>


            <h1>

              {isEditMode
                ? t(
                    "write.creatorEditTitle",
                    "Edit your writing"
                  )
                : t(
                    "write.creatorTitle",
                    "Create and publish"
                  )}

            </h1>


            <p>

              {t(
                "write.creatorSubtitleWithArtwork",
                "Share original writing, PDF documents or visual artwork with the SHOBDO community."
              )}

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

                {t(
                  "write.createStep",
                  "CREATE"
                )}

              </span>


              <h2>

                {t(
                  "write.createQuestion",
                  "What would you like to publish?"
                )}

              </h2>


              <p>

                {t(
                  "write.createDescription",
                  "Choose the format that best fits your work."
                )}

              </p>

            </div>


            <div
              className="publish-type-tabs"
              role="tablist"
              aria-label={
                t(
                  "write.publishingTypeAria",
                  "Publishing type"
                )
              }
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

                    {t(
                      "write.writingMode",
                      "Writing"
                    )}

                  </strong>


                  <small>

                    {t(
                      "write.writingModeDescription",
                      "Poetry, stories, essays and thoughts"
                    )}

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

                    {t(
                      "write.documentMode",
                      "PDF Document"
                    )}

                  </strong>


                  <small>

                    {t(
                      "write.documentModeDescription",
                      "Publish complete PDF files"
                    )}

                  </small>

                </span>

              </button>


              <button
                type="button"
                role="tab"
                aria-selected={
                  publishMode ===
                  "artwork"
                }
                className={
                  publishMode ===
                  "artwork"
                    ? "publish-type-tab active"
                    : "publish-type-tab"
                }
                onClick={() =>
                  changeMode(
                    "artwork"
                  )
                }
              >

                <span className="publish-type-icon">

                  <Image
                    size={22}
                  />

                </span>


                <span>

                  <strong>

                    {t(
                      "write.artworkMode",
                      "Artwork"
                    )}

                  </strong>


                  <small>

                    {t(
                      "write.artworkModeReadyDescription",
                      "Paintings, sketches, photography and digital art"
                    )}

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
            autoComplete="off"
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

                    {t(
                      "write.languageStep",
                      "01"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.writingLanguageTitle",
                      "Writing language"
                    )}

                  </h2>

                </div>


                <p>

                  {t(
                    "write.writingLanguageDescription",
                    "Choose the language of your writing."
                  )}

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

                  {t(
                    "write.ocrLanguageNote",
                    "Scanning currently supports Bengali, English and Hindi only. You can still type directly in this language."
                  )}

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

                    {t(
                      "write.scanStep",
                      "02"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.ocrImportTitle",
                      "Import text from document"
                    )}

                  </h2>

                </div>


                <span className="optional-badge">

                  {t(
                    "common.optional",
                    "Optional"
                  )}

                </span>

              </div>


              <p className="scan-description">

                {t(
                  "write.ocrImportDescription",
                  "Upload a scanned PDF or image and extract its text into your writing editor. This does not publish the original PDF."
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

                    {t(
                      "write.scanDocumentToText",
                      "Scan document to text"
                    )}

                  </h3>


                  <p>

                    {t(
                      "write.scanDocumentSubtitle",
                      "Drag a PDF or image here, or choose a file."
                    )}

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


                    {t(
                      "write.selectScan",
                      "Select scan"
                    )}

                  </button>


                  <small>

                    {t(
                      "write.scanSupported",
                      "PDF, JPG, JPEG or PNG • Maximum 10 MB"
                    )}

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

                      {" • "}

                      {t(
                        "write.ocrImportReady",
                        "OCR import"
                      )}

                    </span>

                  </div>


                  <button
                    type="button"
                    className="remove-file-button"
                    aria-label={
                      t(
                        "write.removeFile",
                        "Remove selected file"
                      )
                    }
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
                  ? t(
                      "write.extractingText",
                      "Extracting text..."
                    )
                  : t(
                      "write.extractText",
                      "Extract text"
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
                      "write.editorStep",
                      "03"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.writingDetailsTitle",
                      "Writing details"
                    )}

                  </h2>

                </div>

              </div>


              <div className="write-field write-title-field">

                <label htmlFor="writing-title">

                  {t(
                    "write.titleLabel",
                    "Title"
                  )}

                  <span aria-hidden="true">
                    *
                  </span>

                </label>


                <div
                  className="writing-title-autocomplete"
                  ref={
                    titleAutocompleteRef
                  }
                >

                  <input
                    ref={
                      titleInputRef
                    }
                    id="writing-title"
                    name="shobdo-writing-title-v2"
                    className="writing-title-input"
                    type="text"
                    value={title}
                    maxLength={200}
                    placeholder={
                      t(
                        "write.writingTitlePlaceholder",
                        "Give your writing a title"
                      )
                    }
                    disabled={
                      publishing
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={true}
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    aria-autocomplete="list"
                    aria-expanded={
                      showTitleSuggestions
                    }
                    aria-controls={
                      showTitleSuggestions
                        ? "writing-title-suggestions"
                        : undefined
                    }
                    aria-activedescendant={
                      activeTitleSuggestionIndex >=
                      0
                        ? `writing-title-suggestion-${activeTitleSuggestionIndex}`
                        : undefined
                    }
                    onChange={
                      handleWritingTitleChange
                    }
                    onFocus={() => {

                      if (
                        filteredTitleSuggestions
                          .length
                      ) {

                        setTitleSuggestionsOpen(
                          true
                        );

                      }

                    }}
                    onBlur={() => {

                      rememberWritingTitle(
                        title
                      );


                      window.setTimeout(
                        () => {

                          setTitleSuggestionsOpen(
                            false
                          );

                          setActiveTitleSuggestionIndex(
                            -1
                          );

                        },
                        140
                      );

                    }}
                    onKeyDown={
                      handleTitleKeyDown
                    }
                  />


                  {showTitleSuggestions && (

                    <div
                      id="writing-title-suggestions"
                      className="writing-title-suggestions"
                      role="listbox"
                      aria-label={
                        titleSuggestionCopy
                          .heading
                      }
                    >

                      <div className="writing-title-suggestions-arrow" />


                      <div className="writing-title-suggestions-header">

                        <div className="writing-title-suggestions-header-icon">

                          <PenLine
                            size={17}
                            strokeWidth={2}
                          />

                        </div>


                        <div className="writing-title-suggestions-header-copy">

                          <strong>
                            {
                              titleSuggestionCopy
                                .heading
                            }
                          </strong>

                          <span>
                            {
                              titleSuggestionCopy
                                .description
                            }
                          </span>

                        </div>

                      </div>


                      <div className="writing-title-suggestions-list">

                        {filteredTitleSuggestions.map(
                          (
                            suggestion,
                            index
                          ) => {

                            const isActive =
                              index ===
                              activeTitleSuggestionIndex;


                            return (

                              <button
                                key={
                                  `${suggestion.source}-${suggestion.title}`
                                }
                                id={
                                  `writing-title-suggestion-${index}`
                                }
                                type="button"
                                role="option"
                                aria-selected={
                                  isActive
                                }
                                className={
                                  isActive
                                    ? "writing-title-suggestion active"
                                    : "writing-title-suggestion"
                                }
                                onMouseEnter={() =>
                                  setActiveTitleSuggestionIndex(
                                    index
                                  )
                                }
                                onMouseDown={(
                                  event
                                ) => {
                                  event.preventDefault();
                                }}
                                onClick={() =>
                                  chooseTitleSuggestion(
                                    suggestion
                                  )
                                }
                              >

                                <span className="writing-title-suggestion-icon">

                                  <PenLine
                                    size={17}
                                    strokeWidth={1.9}
                                  />

                                </span>


                                <span className="writing-title-suggestion-copy">

                                  <strong>
                                    {suggestion.title}
                                  </strong>

                                  <small>
                                    {
                                      suggestion.source ===
                                      "recent"
                                        ? titleSuggestionCopy
                                            .recent
                                        : titleSuggestionCopy
                                            .suggested
                                    }
                                  </small>

                                </span>


                                <span className="writing-title-suggestion-status">

                                  {isActive && (

                                    <Check
                                      size={18}
                                      strokeWidth={2.4}
                                    />

                                  )}

                                </span>

                              </button>

                            );

                          }
                        )}

                      </div>


                      <div className="writing-title-suggestions-footer">

                        <span>
                          {
                            titleSuggestionCopy
                              .keyboard
                          }
                        </span>

                      </div>

                    </div>

                  )}

                </div>


                <div className="field-meta">

                  <span>

                    {t(
                      "write.makeMemorable",
                      "Make it memorable."
                    )}

                  </span>


                  <span
                    className={
                      title.length >=
                      180
                        ? "field-character-count near-limit"
                        : "field-character-count"
                    }
                  >
                    {title.length}/200
                  </span>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="writing-category">

                  {t(
                    "write.categoryLabel",
                    "Category"
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

                    {t(
                      "write.contentLabel",
                      "Your writing"
                    )}

                    <span aria-hidden="true">
                      *
                    </span>

                  </label>


                  <div className="content-stats">

                    <span>

                      {wordCount}{" "}

                      {t(
                        "write.wordCount",
                        "words"
                      )}

                    </span>


                    <span>

                      {characterCount}{" "}

                      {t(
                        "write.characterCount",
                        "characters"
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


                {t(
                  "write.saveDraft",
                  "Save draft"
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
                      "write.publishing",
                      "Publishing..."
                    )
                  : t(
                      "write.publishWritingButton",
                      "Publish writing"
                    )}

              </button>

            </div>

          </form>

        )}


        {/* ================================================= */}
        {/* PDF DOCUMENT MODE                                 */}
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

                    {t(
                      "write.documentUploadStep",
                      "01"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.documentUploadTitle",
                      "Upload your PDF"
                    )}

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

                {t(
                  "write.documentUploadDescription",
                  "The original PDF will be stored securely and published as a document on SHOBDO."
                )}

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

                    {t(
                      "write.dropPdfTitle",
                      "Drop your PDF here"
                    )}

                  </h3>


                  <p>

                    {t(
                      "write.dropPdfDescription",
                      "Upload manuscripts, essays, research, magazines or other literary documents."
                    )}

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


                    {t(
                      "write.choosePdf",
                      "Choose PDF"
                    )}

                  </button>


                  <small>

                    {t(
                      "write.pdfRequirements",
                      "PDF only • Maximum 10 MB • Maximum 30 pages"
                    )}

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

                        {" • "}

                        {t(
                          "write.readyToPublish",
                          "Ready to publish"
                        )}

                      </span>

                    </div>


                    <button
                      type="button"
                      className="remove-file-button"
                      aria-label={
                        t(
                          "write.removeFile",
                          "Remove selected file"
                        )
                      }
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

                            {t(
                              "write.pdfPreview",
                              "PDF Preview"
                            )}

                          </span>

                        </div>


                        <a
                          href={
                            documentPreviewUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >

                          {t(
                            "write.openPreview",
                            "Open preview"
                          )}

                        </a>

                      </div>


                      <iframe
                        src={
                          documentPreviewUrl
                        }
                        title={
                          t(
                            "write.pdfPreview",
                            "PDF Preview"
                          )
                        }
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

                    {t(
                      "write.documentInfoStep",
                      "02"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.documentInfoTitle",
                      "Document information"
                    )}

                  </h2>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="document-title">

                  {t(
                    "write.documentTitleLabel",
                    "Document title"
                  )}

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
                  placeholder={
                    t(
                      "write.documentTitlePlaceholder",
                      "Enter the document title"
                    )
                  }
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

                    {t(
                      "write.documentTitleHelp",
                      "This title will appear publicly on SHOBDO."
                    )}

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

                    {t(
                      "write.documentCategoryLabel",
                      "Category"
                    )}

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

                    {t(
                      "write.documentLanguageLabel",
                      "Document language"
                    )}

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

                  {t(
                    "write.documentDescriptionLabel",
                    "Description"
                  )}

                </label>


                <textarea
                  id="document-description"
                  value={
                    documentDescription
                  }
                  rows={6}
                  maxLength={5000}
                  placeholder={
                    t(
                      "write.documentDescriptionPlaceholder",
                      "Tell readers what this document is about..."
                    )
                  }
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

                    {t(
                      "write.documentDescriptionHelp",
                      "Optional, but recommended."
                    )}

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

                    {t(
                      "write.documentSettingsStep",
                      "03"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.documentSettingsTitle",
                      "Publishing settings"
                    )}

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

                      {t(
                        "write.visibilityPublic",
                        "Public"
                      )}

                    </strong>


                    <small>

                      {t(
                        "write.visibilityPublicDescription",
                        "Anyone can discover and read this document."
                      )}

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

                      {t(
                        "write.visibilityUnlisted",
                        "Unlisted"
                      )}

                    </strong>


                    <small>

                      {t(
                        "write.visibilityUnlistedDescription",
                        "Accessible by direct link but not publicly listed."
                      )}

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

                    {t(
                      "write.allowDownload",
                      "Allow readers to download"
                    )}

                  </strong>


                  <small>

                    {t(
                      "write.allowDownloadDescription",
                      "Readers can save the original PDF file."
                    )}

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
                onClick={async () => {
                  if (
                    documentPublishing
                  ) {
                    return;
                  }

                  await submitDocument(
                    "draft"
                  );
                }}
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


                {documentPublishing
                  ? t(
                      "write.savingDocument",
                      "Saving..."
                    )
                  : t(
                      "write.saveDocumentDraft",
                      "Save Document Draft"
                    )}

              </button>


              <button
                type="button"
                className="publish-button"
                disabled={
                  documentPublishing ||
                  !documentFile
                }
                onClick={async () => {
                  if (
                    documentPublishing
                  ) {
                    return;
                  }

                  await submitDocument(
                    "published"
                  );
                }}
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
                  ? t(
                      "write.publishingPdf",
                      "Publishing PDF..."
                    )
                  : t(
                      "write.publishPdf",
                      "Publish PDF"
                    )}

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

                    {t(
                      "write.documentStored",
                      "Your document was stored successfully."
                    )}

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

                    {t(
                      "write.viewPdf",
                      "View PDF"
                    )}

                  </a>

                )}

              </div>

            )}

          </form>

        )}


        {/* ================================================= */}
        {/* ARTWORK MODE                                     */}
        {/* ================================================= */}

        {publishMode ===
        "artwork" && (

          <form
            className="write-form-card document-publish-form"
            onSubmit={
              handleArtworkSubmit
            }
          >

            <StatusMessages />


            {/* ============================================= */}
            {/* ARTWORK UPLOAD                                */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">

                    {t(
                      "write.artworkUploadStep",
                      "01"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.artworkUploadTitle",
                      "Upload your artwork"
                    )}

                  </h2>

                </div>


                <span className="document-format-badge">

                  <Image
                    size={15}
                  />

                  JPG · PNG · WEBP

                </span>

              </div>


              <p className="scan-description">

                {t(
                  "write.artworkUploadDescription",
                  "Upload an original painting, sketch, illustration, photograph, calligraphy piece or digital artwork."
                )}

              </p>


              {!artworkFile ? (

                <div
                  className={
                    artworkDragging
                      ? "document-drop-zone dragging"
                      : "document-drop-zone"
                  }
                  onDragOver={
                    handleArtworkDragOver
                  }
                  onDragLeave={
                    handleArtworkDragLeave
                  }
                  onDrop={
                    handleArtworkDrop
                  }
                >

                  <input
                    ref={
                      artworkInputRef
                    }
                    type="file"
                    id="publish-artwork-image"
                    className="scan-file-input"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handleArtworkFileChange
                    }
                  />


                  <div className="document-upload-icon">

                    <Image
                      size={30}
                    />

                  </div>


                  <h3>

                    {t(
                      "write.dropArtworkTitle",
                      "Drop your artwork here"
                    )}

                  </h3>


                  <p>

                    {t(
                      "write.dropArtworkDescription",
                      "Share paintings, sketches, illustrations, photography, calligraphy or digital art."
                    )}

                  </p>


                  <button
                    type="button"
                    className="scan-select-button"
                    onClick={() =>
                      artworkInputRef
                        .current
                        ?.click()
                    }
                  >

                    <FileImage
                      size={18}
                    />


                    {t(
                      "write.chooseArtwork",
                      "Choose image"
                    )}

                  </button>


                  <small>

                    {t(
                      "write.artworkRequirements",
                      "JPG, JPEG, PNG or WEBP • Maximum 10 MB"
                    )}

                  </small>

                </div>

              ) : (

                <>

                  <div className="document-selected-card">

                    <div className="document-selected-icon">

                      <FileImage
                        size={30}
                      />

                    </div>


                    <div className="document-selected-info">

                      <strong>
                        {artworkFile.name}
                      </strong>


                      <span>

                        {
                          formatFileSize(
                            artworkFile.size
                          )
                        }

                        {" • "}

                        {t(
                          "write.readyToPublish",
                          "Ready to publish"
                        )}

                      </span>

                    </div>


                    <button
                      type="button"
                      className="remove-file-button"
                      aria-label={
                        t(
                          "write.removeArtwork",
                          "Remove selected artwork"
                        )
                      }
                      disabled={
                        artworkPublishing
                      }
                      onClick={
                        removeArtworkFile
                      }
                    >

                      <Trash2
                        size={19}
                      />

                    </button>

                  </div>


                  {artworkPreviewUrl && (

                    <div className="document-preview">

                      <div className="document-preview-header">

                        <div>

                          <Image
                            size={18}
                          />


                          <span>

                            {t(
                              "write.artworkPreview",
                              "Artwork Preview"
                            )}

                          </span>

                        </div>

                      </div>


                      <img
                        src={
                          artworkPreviewUrl
                        }
                        alt={
                          artworkTitle ||
                          t(
                            "write.artworkPreview",
                            "Artwork Preview"
                          )
                        }
                        style={{
                          display:
                            "block",
                          width:
                            "100%",
                          maxHeight:
                            "560px",
                          objectFit:
                            "contain",
                          borderRadius:
                            "16px",
                          background:
                            "#f7f5fa",
                        }}
                      />

                    </div>

                  )}

                </>

              )}

            </div>


            {/* ============================================= */}
            {/* ARTWORK INFORMATION                           */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">

                    {t(
                      "write.artworkInfoStep",
                      "02"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.artworkInfoTitle",
                      "Artwork information"
                    )}

                  </h2>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="artwork-title">

                  {t(
                    "write.artworkTitleLabel",
                    "Artwork title"
                  )}

                  <span aria-hidden="true">
                    *
                  </span>

                </label>


                <input
                  id="artwork-title"
                  type="text"
                  maxLength={200}
                  value={
                    artworkTitle
                  }
                  placeholder={
                    t(
                      "write.artworkTitlePlaceholder",
                      "Give your artwork a title"
                    )
                  }
                  disabled={
                    artworkPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setArtworkTitle(
                        event.target
                          .value
                      )
                  }
                />


                <div className="field-meta">

                  <span>

                    {t(
                      "write.artworkTitleHelp",
                      "This title will appear publicly on SHOBDO."
                    )}

                  </span>


                  <span>
                    {artworkTitle.length}/200
                  </span>

                </div>

              </div>


              <div className="document-field-grid">

                <div className="write-field">

                  <label htmlFor="artwork-category">

                    {t(
                      "write.artworkCategoryLabel",
                      "Category"
                    )}

                  </label>


                  <select
                    id="artwork-category"
                    value={
                      artworkCategory
                    }
                    disabled={
                      artworkPublishing
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setArtworkCategory(
                          event.target
                            .value
                        )
                    }
                  >

                    {ARTWORK_CATEGORIES.map(
                      (
                        item
                      ) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="write-field">

                  <label htmlFor="artwork-language">

                    {t(
                      "write.artworkLanguageLabel",
                      "Artwork language"
                    )}

                  </label>


                  <select
                    id="artwork-language"
                    value={
                      artworkLanguage
                    }
                    disabled={
                      artworkPublishing
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setArtworkLanguage(
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
                          {language.label}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="write-field">

                <label htmlFor="artwork-description">

                  {t(
                    "write.artworkDescriptionLabel",
                    "Description"
                  )}

                </label>


                <textarea
                  id="artwork-description"
                  value={
                    artworkDescription
                  }
                  rows={6}
                  maxLength={5000}
                  placeholder={
                    t(
                      "write.artworkDescriptionPlaceholder",
                      "Tell viewers about the artwork, its inspiration, medium or story..."
                    )
                  }
                  disabled={
                    artworkPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setArtworkDescription(
                        event.target
                          .value
                      )
                  }
                />


                <div className="field-meta">

                  <span>

                    {t(
                      "write.artworkDescriptionHelp",
                      "Optional, but recommended."
                    )}

                  </span>


                  <span>
                    {artworkDescription.length}/5000
                  </span>

                </div>

              </div>

            </div>


            {/* ============================================= */}
            {/* ARTWORK SETTINGS                              */}
            {/* ============================================= */}

            <div className="write-section">

              <div className="write-section-heading">

                <div>

                  <span className="write-step">

                    {t(
                      "write.artworkSettingsStep",
                      "03"
                    )}

                  </span>


                  <h2>

                    {t(
                      "write.artworkSettingsTitle",
                      "Publishing settings"
                    )}

                  </h2>

                </div>

              </div>


              <div className="document-settings-grid">

                <label
                  className={
                    artworkVisibility ===
                    "public"
                      ? "document-setting-card active"
                      : "document-setting-card"
                  }
                >

                  <input
                    type="radio"
                    name="artwork-visibility"
                    value="public"
                    checked={
                      artworkVisibility ===
                      "public"
                    }
                    disabled={
                      artworkPublishing
                    }
                    onChange={() =>
                      setArtworkVisibility(
                        "public"
                      )
                    }
                  />


                  <BookOpen
                    size={21}
                  />


                  <span>

                    <strong>

                      {t(
                        "write.visibilityPublic",
                        "Public"
                      )}

                    </strong>


                    <small>

                      {t(
                        "write.artworkVisibilityPublicDescription",
                        "Anyone can discover and view this artwork."
                      )}

                    </small>

                  </span>

                </label>


                <label
                  className={
                    artworkVisibility ===
                    "unlisted"
                      ? "document-setting-card active"
                      : "document-setting-card"
                  }
                >

                  <input
                    type="radio"
                    name="artwork-visibility"
                    value="unlisted"
                    checked={
                      artworkVisibility ===
                      "unlisted"
                    }
                    disabled={
                      artworkPublishing
                    }
                    onChange={() =>
                      setArtworkVisibility(
                        "unlisted"
                      )
                    }
                  />


                  <Lock
                    size={21}
                  />


                  <span>

                    <strong>

                      {t(
                        "write.visibilityUnlisted",
                        "Unlisted"
                      )}

                    </strong>


                    <small>

                      {t(
                        "write.artworkVisibilityUnlistedDescription",
                        "Accessible by direct link but not publicly listed."
                      )}

                    </small>

                  </span>

                </label>

              </div>


              <label className="document-download-toggle">

                <input
                  type="checkbox"
                  checked={
                    artworkAllowDownload
                  }
                  disabled={
                    artworkPublishing
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setArtworkAllowDownload(
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

                    {t(
                      "write.artworkAllowDownload",
                      "Allow viewers to download"
                    )}

                  </strong>


                  <small>

                    {t(
                      "write.artworkAllowDownloadDescription",
                      "Viewers can save the published artwork image."
                    )}

                  </small>

                </span>

              </label>

            </div>


            {/* ============================================= */}
            {/* ARTWORK ACTIONS                               */}
            {/* ============================================= */}

            <div className="write-form-actions">

              <button
                type="button"
                className="draft-button"
                disabled={
                  artworkPublishing ||
                  !artworkFile
                }
                onClick={() =>
                  submitArtwork(
                    "draft"
                  )
                }
              >

                {artworkPublishing ? (

                  <LoaderCircle
                    className="spin"
                    size={19}
                  />

                ) : (

                  <Save
                    size={19}
                  />

                )}


                {t(
                  "write.saveArtworkDraft",
                  "Save Artwork Draft"
                )}

              </button>


              <button
                type="submit"
                className="publish-button"
                disabled={
                  artworkPublishing ||
                  !artworkFile
                }
              >

                {artworkPublishing ? (

                  <LoaderCircle
                    className="spin"
                    size={20}
                  />

                ) : (

                  <Send
                    size={19}
                  />

                )}


                {artworkPublishing
                  ? t(
                      "write.publishingArtwork",
                      "Publishing artwork..."
                    )
                  : t(
                      "write.publishArtwork",
                      "Publish Artwork"
                    )}

              </button>

            </div>


            {/* ============================================= */}
            {/* LAST PUBLISHED ARTWORK                        */}
            {/* ============================================= */}

            {lastPublishedArtwork && (

              <div className="document-published-result">

                <CheckCircle2
                  size={22}
                />


                <div>

                  <strong>
                    {lastPublishedArtwork.title}
                  </strong>


                  <span>

                    {t(
                      "write.artworkStored",
                      "Your artwork was stored successfully."
                    )}

                  </span>

                </div>


                {lastPublishedArtwork
                  .image_url && (

                  <a
                    href={
                      lastPublishedArtwork
                        .image_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >

                    {t(
                      "write.viewArtwork",
                      "View artwork"
                    )}

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