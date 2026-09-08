import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import * as ImagePicker
  from "expo-image-picker";

import * as DocumentPicker
  from "expo-document-picker";

import {
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  FileImage,
  FileText,
  FolderOpen,
  Globe2,
  PenLine,
  Save,
  ScanText,
  Send,
  Sparkles,
  Tag,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  extractScannedText,
  getLanguages,
  publishWriting,
  saveDraft,
} from "../../api/api";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer
  from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type WritingLanguage = {
  code: string;
  label?: string;
  name?: string;

  nativeName?: string;
  native_name?: string;
};


type PickerType =
  | "category"
  | "language"
  | null;


type SelectedOCRFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};


type Copy = {
  eyebrow: string;
  heading: string;
  description: string;

  signInTitle: string;
  signInDescription: string;
  goToAccount: string;

  titleLabel: string;
  titlePlaceholder: string;
  titleHint: string;

  categoryLabel: string;
  languageLabel: string;
  languageHelp: string;

  statsWords: string;
  statsCharacters: string;
  statsReading: string;
  minuteRead: string;
  minutesRead: string;

  writingLanguage: string;
  contentLabel: string;
  contentPlaceholder: string;

  saveDraft: string;
  saving: string;
  publish: string;
  publishing: string;

  ready: string;
  draftReady: string;

  noteTitle: string;
  noteDescription: string;

  draftEmptyTitle: string;
  draftEmptyDescription: string;

  signInRequired: string;
  signInDraft: string;
  signInPublish: string;

  draftSaved: string;
  draftSavedDescription: string;
  draftError: string;
  draftErrorDescription: string;

  titleRequired: string;
  titleRequiredDescription: string;

  contentRequired: string;
  contentRequiredDescription: string;
  contentTooShort: string;
  contentTooShortDescription: string;

  published: string;
  publishedDescription: string;
  publishError: string;
  publishErrorDescription: string;

  continueWriting: string;
  myWritings: string;
  writeAnother: string;
  viewWriting: string;

  categoryPickerTitle: string;
  languagePickerTitle: string;
};


type OCRCopy = {
  title: string;
  description: string;

  camera: string;
  image: string;
  pdf: string;

  selected: string;

  extract: string;
  extracting: string;

  successTitle: string;
  success: string;

  errorTitle: string;

  permissionTitle: string;
  permission: string;

  invalid: string;
  tooLarge: string;

  remove: string;
};


// ==========================================================
// CONSTANTS
// ==========================================================

const CATEGORIES = [
  "কবিতা",
  "গল্প",
  "অনুভূতি",
  "প্রবন্ধ",
  "উপন্যাস",
  "অন্যান্য",
];


const FALLBACK_LANGUAGES:
  WritingLanguage[] = [
    {
      code: "bn",
      label: "বাংলা",
      nativeName: "বাংলা",
      name: "Bengali",
    },
    {
      code: "en",
      label: "English",
      nativeName: "English",
      name: "English",
    },
    {
      code: "hi",
      label: "हिन्दी",
      nativeName: "हिन्दी",
      name: "Hindi",
    },
  ];


const MAX_OCR_FILE_SIZE =
  10 * 1024 * 1024;


// ==========================================================
// HELPERS
// ==========================================================

function getLanguageLabel(
  item?: WritingLanguage
) {

  if (!item) {
    return "বাংলা";
  }


  return (
    item.nativeName ||
    item.native_name ||
    item.label ||
    item.name ||
    item.code.toUpperCase()
  );

}


function getLanguageEnglishName(
  item?: WritingLanguage
) {

  if (!item) {
    return "Bengali";
  }


  return (
    item.name ||
    item.label ||
    item.code.toUpperCase()
  );

}


function normalizeLanguages(
  data: any
): WritingLanguage[] {

  const source =
    Array.isArray(data)
      ? data
      : Array.isArray(
          data?.languages
        )
        ? data.languages
        : Array.isArray(
            data?.items
          )
          ? data.items
          : [];


  if (!source.length) {
    return FALLBACK_LANGUAGES;
  }


  return source.map(
    (
      item: any
    ) => ({
      code:
        String(
          item?.code || ""
        ),

      name:
        item?.name,

      label:
        item?.label,

      nativeName:
        item?.nativeName ||
        item?.native_name,

      native_name:
        item?.native_name,
    })
  );

}


// ==========================================================
// SCREEN
// ==========================================================

export default function WriteScreen() {

  const {
    user,
    loading:
      authLoading,
  } = useAuth();


  const {
    language:
      uiLanguage,
    t,
  } = useLanguage();


  // ========================================================
  // MAIN COPY
  // ========================================================

  const copy =
    useMemo<Copy>(
      () => {

        if (
          uiLanguage === "bn"
        ) {

          return {
            eyebrow:
              "আপনার কণ্ঠ লিখুন",

            heading:
              "আজ কী লিখতে চান?",

            description:
              "নিজের ভাষায় নিজের অনুভূতি, গল্প, কবিতা বা চিন্তা লিখুন। আপনার লেখা আপনারই কণ্ঠ।",

            signInTitle:
              "লিখতে সাইন ইন করুন",

            signInDescription:
              "খসড়া সংরক্ষণ বা লেখা প্রকাশ করতে আপনার SHOBDO অ্যাকাউন্টে সাইন ইন করুন।",

            goToAccount:
              "অ্যাকাউন্টে যান",

            titleLabel:
              "শিরোনাম",

            titlePlaceholder:
              "আপনার লেখার একটি শিরোনাম দিন...",

            titleHint:
              "সর্বোচ্চ ২০০ অক্ষর",

            categoryLabel:
              "বিভাগ",

            languageLabel:
              "লেখার ভাষা",

            languageHelp:
              "আপনি যে ভাষায় লেখাটি লিখছেন সেটি নির্বাচন করুন।",

            statsWords:
              "শব্দ",

            statsCharacters:
              "অক্ষর",

            statsReading:
              "পাঠ",

            minuteRead:
              "মিনিট",

            minutesRead:
              "মিনিট",

            writingLanguage:
              "লেখার ভাষা",

            contentLabel:
              "আপনার লেখা",

            contentPlaceholder:
              "এখানে আপনার লেখা শুরু করুন...\n\nনিজের ভাষায় নিজের অনুভূতি, গল্প, কবিতা বা চিন্তা লিখুন।",

            saveDraft:
              "খসড়া সংরক্ষণ",

            saving:
              "সংরক্ষণ হচ্ছে...",

            publish:
              "প্রকাশ করুন",

            publishing:
              "প্রকাশ হচ্ছে...",

            ready:
              "প্রকাশের জন্য প্রস্তুত",

            draftReady:
              "খসড়া হিসেবে সংরক্ষণ করা যাবে",

            noteTitle:
              "আপনার লেখা আপনারই",

            noteDescription:
              "খসড়া ব্যক্তিগত থাকে। প্রকাশ করলে লেখাটি SHOBDO সম্প্রদায়ে দৃশ্যমান হবে।",

            draftEmptyTitle:
              "কিছু লিখুন",

            draftEmptyDescription:
              "খসড়া সংরক্ষণ করতে শিরোনাম বা লেখার অংশ দিন।",

            signInRequired:
              "সাইন ইন প্রয়োজন",

            signInDraft:
              "খসড়া সংরক্ষণ করতে সাইন ইন করুন।",

            signInPublish:
              "লেখা প্রকাশ করতে সাইন ইন করুন।",

            draftSaved:
              "খসড়া সংরক্ষিত",

            draftSavedDescription:
              "আপনার লেখা খসড়া হিসেবে সংরক্ষণ করা হয়েছে।",

            draftError:
              "খসড়া সংরক্ষণ করা যায়নি",

            draftErrorDescription:
              "আবার চেষ্টা করুন।",

            titleRequired:
              "শিরোনাম প্রয়োজন",

            titleRequiredDescription:
              "প্রকাশ করার আগে একটি শিরোনাম লিখুন।",

            contentRequired:
              "লেখা প্রয়োজন",

            contentRequiredDescription:
              "প্রকাশ করার আগে আপনার লেখা লিখুন।",

            contentTooShort:
              "লেখাটি খুব ছোট",

            contentTooShortDescription:
              "প্রকাশ করার আগে অন্তত ১০ অক্ষর লিখুন।",

            published:
              "লেখা প্রকাশিত হয়েছে",

            publishedDescription:
              "আপনার লেখা সফলভাবে SHOBDO-তে প্রকাশিত হয়েছে।",

            publishError:
              "প্রকাশ করা যায়নি",

            publishErrorDescription:
              "আবার চেষ্টা করুন।",

            continueWriting:
              "আরও লিখুন",

            myWritings:
              "আমার লেখা",

            writeAnother:
              "নতুন লেখা",

            viewWriting:
              "লেখাটি দেখুন",

            categoryPickerTitle:
              "বিভাগ নির্বাচন করুন",

            languagePickerTitle:
              "লেখার ভাষা নির্বাচন করুন",
          };

        }


        if (
          uiLanguage === "hi"
        ) {

          return {
            eyebrow:
              "अपनी आवाज़ लिखें",

            heading:
              "आज आप क्या लिखना चाहते हैं?",

            description:
              "अपनी भाषा में अपनी भावना, कहानी, कविता या विचार लिखें। आपकी रचना आपकी आवाज़ है।",

            signInTitle:
              "लिखने के लिए साइन इन करें",

            signInDescription:
              "ड्राफ़्ट सेव करने या रचना प्रकाशित करने के लिए अपने SHOBDO अकाउंट में साइन इन करें।",

            goToAccount:
              "अकाउंट पर जाएँ",

            titleLabel:
              "शीर्षक",

            titlePlaceholder:
              "अपनी रचना का शीर्षक लिखें...",

            titleHint:
              "अधिकतम 200 अक्षर",

            categoryLabel:
              "श्रेणी",

            languageLabel:
              "रचना की भाषा",

            languageHelp:
              "जिस भाषा में आप लिख रहे हैं उसे चुनें।",

            statsWords:
              "शब्द",

            statsCharacters:
              "अक्षर",

            statsReading:
              "पढ़ने का समय",

            minuteRead:
              "मिनट",

            minutesRead:
              "मिनट",

            writingLanguage:
              "रचना की भाषा",

            contentLabel:
              "आपकी रचना",

            contentPlaceholder:
              "यहाँ लिखना शुरू करें...\n\nअपनी भाषा में अपनी भावना, कहानी, कविता या विचार लिखें।",

            saveDraft:
              "ड्राफ़्ट सेव करें",

            saving:
              "सेव हो रहा है...",

            publish:
              "प्रकाशित करें",

            publishing:
              "प्रकाशित हो रहा है...",

            ready:
              "प्रकाशन के लिए तैयार",

            draftReady:
              "ड्राफ़्ट के रूप में सेव किया जा सकता है",

            noteTitle:
              "आपकी रचना आपकी है",

            noteDescription:
              "ड्राफ़्ट निजी रहता है। प्रकाशित करने पर रचना SHOBDO समुदाय को दिखाई देगी।",

            draftEmptyTitle:
              "कुछ लिखें",

            draftEmptyDescription:
              "ड्राफ़्ट सेव करने के लिए शीर्षक या रचना लिखें।",

            signInRequired:
              "साइन इन आवश्यक",

            signInDraft:
              "ड्राफ़्ट सेव करने के लिए साइन इन करें।",

            signInPublish:
              "रचना प्रकाशित करने के लिए साइन इन करें।",

            draftSaved:
              "ड्राफ़्ट सेव हो गया",

            draftSavedDescription:
              "आपकी रचना ड्राफ़्ट के रूप में सेव हो गई है।",

            draftError:
              "ड्राफ़्ट सेव नहीं हुआ",

            draftErrorDescription:
              "कृपया फिर कोशिश करें।",

            titleRequired:
              "शीर्षक आवश्यक है",

            titleRequiredDescription:
              "प्रकाशित करने से पहले शीर्षक लिखें।",

            contentRequired:
              "रचना आवश्यक है",

            contentRequiredDescription:
              "प्रकाशित करने से पहले अपनी रचना लिखें।",

            contentTooShort:
              "रचना बहुत छोटी है",

            contentTooShortDescription:
              "प्रकाशित करने से पहले कम से कम 10 अक्षर लिखें।",

            published:
              "रचना प्रकाशित हो गई",

            publishedDescription:
              "आपकी रचना SHOBDO पर सफलतापूर्वक प्रकाशित हो गई है।",

            publishError:
              "प्रकाशित नहीं हुआ",

            publishErrorDescription:
              "कृपया फिर कोशिश करें।",

            continueWriting:
              "लिखना जारी रखें",

            myWritings:
              "मेरी रचनाएँ",

            writeAnother:
              "नई रचना",

            viewWriting:
              "रचना देखें",

            categoryPickerTitle:
              "श्रेणी चुनें",

            languagePickerTitle:
              "रचना की भाषा चुनें",
          };

        }


        return {
          eyebrow:
            "WRITE YOUR VOICE",

          heading:
            "What do you want to write today?",

          description:
            "Write your feelings, story, poem or thoughts in your own language. Your writing is your voice.",

          signInTitle:
            "Sign in to write",

          signInDescription:
            "Sign in to your SHOBDO account to save drafts or publish your writing.",

          goToAccount:
            "Go to Account",

          titleLabel:
            "Title",

          titlePlaceholder:
            "Give your writing a title...",

          titleHint:
            "Maximum 200 characters",

          categoryLabel:
            "Category",

          languageLabel:
            "Writing Language",

          languageHelp:
            "Choose the language in which you are writing.",

          statsWords:
            "Words",

          statsCharacters:
            "Characters",

          statsReading:
            "Read",

          minuteRead:
            "min",

          minutesRead:
            "min",

          writingLanguage:
            "Writing Language",

          contentLabel:
            "Your Writing",

          contentPlaceholder:
            "Start writing here...\n\nWrite your feelings, story, poem or thoughts in your own language.",

          saveDraft:
            "Save Draft",

          saving:
            "Saving...",

          publish:
            "Publish",

          publishing:
            "Publishing...",

          ready:
            "Ready to publish",

          draftReady:
            "Ready to save as draft",

          noteTitle:
            "Your writing stays yours",

          noteDescription:
            "Drafts remain private. Published writing becomes visible to the SHOBDO community.",

          draftEmptyTitle:
            "Write something first",

          draftEmptyDescription:
            "Add a title or some content before saving a draft.",

          signInRequired:
            "Sign in required",

          signInDraft:
            "Sign in before saving a draft.",

          signInPublish:
            "Sign in before publishing your writing.",

          draftSaved:
            "Draft saved",

          draftSavedDescription:
            "Your writing has been saved as a draft.",

          draftError:
            "Unable to save draft",

          draftErrorDescription:
            "Please try again.",

          titleRequired:
            "Title required",

          titleRequiredDescription:
            "Add a title before publishing.",

          contentRequired:
            "Writing required",

          contentRequiredDescription:
            "Add your writing before publishing.",

          contentTooShort:
            "Writing is too short",

          contentTooShortDescription:
            "Write at least 10 characters before publishing.",

          published:
            "Writing published",

          publishedDescription:
            "Your writing has been published successfully on SHOBDO.",

          publishError:
            "Unable to publish",

          publishErrorDescription:
            "Please try again.",

          continueWriting:
            "Continue Writing",

          myWritings:
            "My Writings",

          writeAnother:
            "Write Another",

          viewWriting:
            "View Writing",

          categoryPickerTitle:
            "Choose Category",

          languagePickerTitle:
            "Choose Writing Language",
        };

      },
      [
        uiLanguage,
      ]
    );


  // ========================================================
  // OCR COPY
  // ========================================================

  const ocrCopy =
    useMemo<OCRCopy>(
      () => {

        if (
          uiLanguage === "bn"
        ) {

          return {
            title:
              "লেখা স্ক্যান করুন",

            description:
              "ক্যামেরায় ছবি তুলুন অথবা ছবি/PDF নির্বাচন করুন। SHOBDO লেখাটি শনাক্ত করে নিচের এডিটরে যুক্ত করবে।",

            camera:
              "ক্যামেরা",

            image:
              "ছবি নির্বাচন",

            pdf:
              "PDF নির্বাচন",

            selected:
              "নির্বাচিত ফাইল",

            extract:
              "স্ক্যান করে লেখা বের করুন",

            extracting:
              "লেখা শনাক্ত হচ্ছে...",

            successTitle:
              "লেখা শনাক্ত হয়েছে",

            success:
              "স্ক্যান করা লেখাটি এডিটরে যোগ করা হয়েছে। প্রকাশের আগে ভুল থাকলে ঠিক করে নিন।",

            errorTitle:
              "স্ক্যান করা যায়নি",

            permissionTitle:
              "ক্যামেরা অনুমতি প্রয়োজন",

            permission:
              "ছবি তুলতে SHOBDO-কে ক্যামেরা ব্যবহারের অনুমতি দিন।",

            invalid:
              "শুধুমাত্র PDF, JPG, JPEG এবং PNG ফাইল ব্যবহার করুন।",

            tooLarge:
              "ফাইলের আকার ১০ MB-এর মধ্যে হতে হবে।",

            remove:
              "ফাইল সরান",
          };

        }


        if (
          uiLanguage === "hi"
        ) {

          return {
            title:
              "रचना स्कैन करें",

            description:
              "कैमरे से फोटो लें या image/PDF चुनें। SHOBDO टेक्स्ट पहचान कर editor में जोड़ देगा।",

            camera:
              "कैमरा",

            image:
              "चित्र चुनें",

            pdf:
              "PDF चुनें",

            selected:
              "चुनी गई फ़ाइल",

            extract:
              "स्कैन करके टेक्स्ट निकालें",

            extracting:
              "टेक्स्ट पहचाना जा रहा है...",

            successTitle:
              "टेक्स्ट मिल गया",

            success:
              "स्कैन किया गया टेक्स्ट editor में जोड़ दिया गया है। प्रकाशित करने से पहले जाँच लें।",

            errorTitle:
              "स्कैन नहीं हो सका",

            permissionTitle:
              "कैमरा अनुमति आवश्यक",

            permission:
              "फोटो लेने के लिए SHOBDO को कैमरा इस्तेमाल करने की अनुमति दें।",

            invalid:
              "केवल PDF, JPG, JPEG और PNG फ़ाइलें समर्थित हैं।",

            tooLarge:
              "फ़ाइल का आकार 10 MB से अधिक नहीं हो सकता।",

            remove:
              "फ़ाइल हटाएँ",
          };

        }


        return {
          title:
            "Scan your writing",

          description:
            "Take a photo or choose an image/PDF. SHOBDO will recognize the text and insert it into the editor below.",

          camera:
            "Camera",

          image:
            "Choose Image",

          pdf:
            "Choose PDF",

          selected:
            "Selected file",

          extract:
            "Scan & Extract Text",

          extracting:
            "Recognizing text...",

          successTitle:
            "Text extracted",

          success:
            "The scanned text has been added to the editor. Review it before publishing.",

          errorTitle:
            "Unable to scan",

          permissionTitle:
            "Camera permission required",

          permission:
            "Allow SHOBDO to use your camera to scan writing.",

          invalid:
            "Only PDF, JPG, JPEG and PNG files are supported.",

          tooLarge:
            "File size cannot exceed 10 MB.",

          remove:
            "Remove file",
        };

      },
      [
        uiLanguage,
      ]
    );


  // ========================================================
  // FORM STATE
  // ========================================================

  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    content,
    setContent,
  ] =
    useState("");


  const [
    category,
    setCategory,
  ] =
    useState(
      "কবিতা"
    );


  const [
    writingLanguage,
    setWritingLanguage,
  ] =
    useState(
      "bn"
    );


  const [
    languages,
    setLanguages,
  ] =
    useState<
      WritingLanguage[]
    >(
      FALLBACK_LANGUAGES
    );


  const [
    languageLoading,
    setLanguageLoading,
  ] =
    useState(false);


  const [
    picker,
    setPicker,
  ] =
    useState<PickerType>(
      null
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    submitMode,
    setSubmitMode,
  ] =
    useState<
      "draft" |
      "publish" |
      null
    >(
      null
    );


  const [
    selectedOCRFile,
    setSelectedOCRFile,
  ] =
    useState<
      SelectedOCRFile | null
    >(
      null
    );


  const [
    extractingOCR,
    setExtractingOCR,
  ] =
    useState(false);


  // ========================================================
  // LOAD LANGUAGES
  // ========================================================

  useEffect(
    () => {

      let active =
        true;


      async function loadLanguages() {

        try {

          setLanguageLoading(
            true
          );


          const response =
            await getLanguages();


          const normalized =
            normalizeLanguages(
              response
            );


          if (!active) {
            return;
          }


          setLanguages(
            normalized
          );


          const hasBengali =
            normalized.some(
              (
                item
              ) =>
                item.code ===
                "bn"
            );


          if (
            hasBengali
          ) {

            setWritingLanguage(
              "bn"
            );

          } else if (
            normalized[0]?.code
          ) {

            setWritingLanguage(
              normalized[0].code
            );

          }

        } catch (
          error
        ) {

          console.error(
            "WRITE LANGUAGE LOAD ERROR:",
            error
          );


          if (
            active
          ) {

            setLanguages(
              FALLBACK_LANGUAGES
            );

          }

        } finally {

          if (
            active
          ) {

            setLanguageLoading(
              false
            );

          }

        }

      }


      loadLanguages();


      return () => {

        active =
          false;

      };

    },
    []
  );


  // ========================================================
  // SELECTED LANGUAGE
  // ========================================================

  const selectedLanguage =
    useMemo(
      () => {

        return (
          languages.find(
            (
              item
            ) =>
              item.code ===
              writingLanguage
          ) ||
          FALLBACK_LANGUAGES[0]
        );

      },
      [
        languages,
        writingLanguage,
      ]
    );


  // ========================================================
  // CATEGORY LABEL
  // ========================================================

  const getCategoryLabel =
    (
      value:
        string
    ) => {

      const keys:
        Record<
          string,
          string
        > = {

          "কবিতা":
            "write.category.poem",

          "গল্প":
            "write.category.story",

          "অনুভূতি":
            "write.category.feeling",

          "প্রবন্ধ":
            "write.category.article",

          "উপন্যাস":
            "write.category.novel",

          "অন্যান্য":
            "write.category.other",

        };


      const key =
        keys[value];


      if (key) {

        const translated =
          t(key);


        if (
          translated !==
          key
        ) {

          return translated;

        }

      }


      return value;

    };


  // ========================================================
  // COUNTERS
  // ========================================================

  const titleCount =
    title.length;


  const contentCount =
    content.length;


  const wordCount =
    useMemo(
      () => {

        const trimmed =
          content.trim();


        if (!trimmed) {
          return 0;
        }


        return trimmed
          .split(
            /\s+/
          )
          .filter(
            Boolean
          )
          .length;

      },
      [
        content,
      ]
    );


  const readingMinutes =
    useMemo(
      () => {

        if (
          wordCount === 0
        ) {

          return 0;

        }


        return Math.max(
          1,
          Math.ceil(
            wordCount /
            200
          )
        );

      },
      [
        wordCount,
      ]
    );


  const canPublish =
    Boolean(
      title.trim() &&
      content.trim().length >= 10
    );


  const canSaveDraft =
    Boolean(
      title.trim() ||
      content.trim()
    );


  // ========================================================
  // RESET
  // ========================================================

  const resetForm =
    () => {

      setTitle("");
      setContent("");

      setCategory(
        "কবিতা"
      );


      const hasBengali =
        languages.some(
          (
            item
          ) =>
            item.code ===
            "bn"
        );


      setWritingLanguage(
        hasBengali
          ? "bn"
          : (
              languages[0]?.code ||
              "bn"
            )
      );


      setPicker(
        null
      );


      setSelectedOCRFile(
        null
      );

    };


  // ========================================================
  // OCR VALIDATION
  // ========================================================

  const validateOCRFile =
    (
      file:
        SelectedOCRFile
    ) => {

      const lowerName =
        file.name.toLowerCase();


      const isValid =
        lowerName.endsWith(
          ".pdf"
        ) ||
        lowerName.endsWith(
          ".jpg"
        ) ||
        lowerName.endsWith(
          ".jpeg"
        ) ||
        lowerName.endsWith(
          ".png"
        );


      if (
        !isValid
      ) {

        Alert.alert(
          ocrCopy.errorTitle,
          ocrCopy.invalid
        );

        return false;

      }


      if (
        typeof file.size ===
          "number" &&
        file.size >
          MAX_OCR_FILE_SIZE
      ) {

        Alert.alert(
          ocrCopy.errorTitle,
          ocrCopy.tooLarge
        );

        return false;

      }


      return true;

    };


  // ========================================================
  // CAMERA
  // ========================================================

  const handleCamera =
    async () => {

      try {

        const permission =
          await ImagePicker
            .requestCameraPermissionsAsync();


        if (
          !permission.granted
        ) {

          Alert.alert(
            ocrCopy.permissionTitle,
            ocrCopy.permission
          );

          return;

        }


        const result =
          await ImagePicker
            .launchCameraAsync({

              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              allowsEditing:
                false,

              quality:
                1,

            });


        if (
          result.canceled ||
          !result.assets?.length
        ) {

          return;

        }


        const asset =
          result.assets[0];


        const fileName =
          asset.fileName ||
          `camera-${Date.now()}.jpg`;


        const file:
          SelectedOCRFile = {

          uri:
            asset.uri,

          name:
            fileName,

          type:
            asset.mimeType ||
            "image/jpeg",

          size:
            typeof asset.fileSize ===
              "number"
              ? asset.fileSize
              : undefined,

        };


        if (
          validateOCRFile(
            file
          )
        ) {

          setSelectedOCRFile(
            file
          );

        }

      } catch (
        error: any
      ) {

        Alert.alert(
          ocrCopy.errorTitle,

          error?.message ||
          "Unable to open camera."
        );

      }

    };


  // ========================================================
  // IMAGE PICKER
  // ========================================================

  const handleChooseImage =
    async () => {

      try {

        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();


        if (
          !permission.granted
        ) {

          Alert.alert(
            ocrCopy.permissionTitle,
            "Please allow SHOBDO to access your photos."
          );

          return;

        }


        const result =
          await ImagePicker
            .launchImageLibraryAsync({

              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              allowsEditing:
                false,

              quality:
                1,

            });


        if (
          result.canceled ||
          !result.assets?.length
        ) {

          return;

        }


        const asset =
          result.assets[0];


        let name =
          asset.fileName ||
          `image-${Date.now()}.jpg`;


        if (
          !/\.(jpg|jpeg|png)$/i
            .test(
              name
            )
        ) {

          if (
            asset.mimeType ===
            "image/png"
          ) {

            name += ".png";

          } else {

            name += ".jpg";

          }

        }


        const file:
          SelectedOCRFile = {

          uri:
            asset.uri,

          name,

          type:
            asset.mimeType ||
            (
              name
                .toLowerCase()
                .endsWith(
                  ".png"
                )
                ? "image/png"
                : "image/jpeg"
            ),

          size:
            typeof asset.fileSize ===
              "number"
              ? asset.fileSize
              : undefined,

        };


        if (
          validateOCRFile(
            file
          )
        ) {

          setSelectedOCRFile(
            file
          );

        }

      } catch (
        error: any
      ) {

        Alert.alert(
          ocrCopy.errorTitle,

          error?.message ||
          "Unable to select image."
        );

      }

    };


  // ========================================================
  // PDF PICKER
  // ========================================================

  const handleChoosePDF =
    async () => {

      try {

        const result =
          await DocumentPicker
            .getDocumentAsync({

              type:
                "application/pdf",

              multiple:
                false,

              copyToCacheDirectory:
                true,

            });


        if (
          result.canceled ||
          !result.assets?.length
        ) {

          return;

        }


        const asset =
          result.assets[0];


        const file:
          SelectedOCRFile = {

          uri:
            asset.uri,

          name:
            asset.name ||
            `document-${Date.now()}.pdf`,

          type:
            asset.mimeType ||
            "application/pdf",

          size:
            typeof asset.size ===
              "number"
              ? asset.size
              : undefined,

        };


        if (
          validateOCRFile(
            file
          )
        ) {

          setSelectedOCRFile(
            file
          );

        }

      } catch (
        error: any
      ) {

        Alert.alert(
          ocrCopy.errorTitle,

          error?.message ||
          "Unable to select PDF."
        );

      }

    };


  // ========================================================
  // OCR EXTRACTION
  // ========================================================

  const handleExtractOCR =
    async () => {

      if (
        !selectedOCRFile
      ) {

        return;

      }


      try {

        setExtractingOCR(
          true
        );


        const result =
          await extractScannedText(
            selectedOCRFile,
            writingLanguage
          );


        const extractedText =
          result?.text
            ?.trim();


        if (
          !extractedText
        ) {

          throw new Error(
            "No readable text was found."
          );

        }


        setContent(
          (
            current
          ) => {

            if (
              !current.trim()
            ) {

              return extractedText;

            }


            return (
              current.trimEnd() +
              "\n\n" +
              extractedText
            );

          }
        );


        setSelectedOCRFile(
          null
        );


        Alert.alert(
          ocrCopy.successTitle,
          ocrCopy.success
        );

      } catch (
        error: any
      ) {

        Alert.alert(
          ocrCopy.errorTitle,

          error?.message ||
          "Unable to extract text."
        );

      } finally {

        setExtractingOCR(
          false
        );

      }

    };


  // ========================================================
  // SAVE DRAFT
  // ========================================================

  const handleSaveDraft =
    async () => {

      if (!user) {

        Alert.alert(
          copy.signInRequired,
          copy.signInDraft
        );

        return;

      }


      if (
        !canSaveDraft
      ) {

        Alert.alert(
          copy.draftEmptyTitle,
          copy.draftEmptyDescription
        );

        return;

      }


      try {

        setSubmitting(
          true
        );

        setSubmitMode(
          "draft"
        );


        await saveDraft({

          title:
            title.trim(),

          content:
            content.trim(),

          category,

          language:
            writingLanguage,

        });


        Alert.alert(
          copy.draftSaved,
          copy.draftSavedDescription,
          [
            {
              text:
                copy.continueWriting,
            },
            {
              text:
                copy.myWritings,

              onPress:
                () =>
                  router.push(
                    "/(tabs)/my-writings"
                  ),
            },
          ]
        );

      } catch (
        error: any
      ) {

        Alert.alert(
          copy.draftError,

          error?.message ||
          copy.draftErrorDescription
        );

      } finally {

        setSubmitting(
          false
        );

        setSubmitMode(
          null
        );

      }

    };


  // ========================================================
  // PUBLISH
  // ========================================================

  const handlePublish =
    async () => {

      if (!user) {

        Alert.alert(
          copy.signInRequired,
          copy.signInPublish
        );

        return;

      }


      if (
        !title.trim()
      ) {

        Alert.alert(
          copy.titleRequired,
          copy.titleRequiredDescription
        );

        return;

      }


      if (
        title.trim().length >
        200
      ) {

        Alert.alert(
          "Title too long",
          copy.titleHint
        );

        return;

      }


      if (
        !content.trim()
      ) {

        Alert.alert(
          copy.contentRequired,
          copy.contentRequiredDescription
        );

        return;

      }


      if (
        content.trim().length <
        10
      ) {

        Alert.alert(
          copy.contentTooShort,
          copy.contentTooShortDescription
        );

        return;

      }


      try {

        setSubmitting(
          true
        );

        setSubmitMode(
          "publish"
        );


        const writing =
          await publishWriting({

            title:
              title.trim(),

            content:
              content.trim(),

            category,

            language:
              writingLanguage,

          });


        Alert.alert(
          copy.published,
          copy.publishedDescription,
          [
            {
              text:
                copy.writeAnother,

              onPress:
                resetForm,
            },
            {
              text:
                copy.viewWriting,

              onPress: () => {

                resetForm();


                if (
                  writing?.id
                ) {

                  router.push({
                    pathname:
                      "/writings/[id]",

                    params: {
                      id:
                        String(
                          writing.id
                        ),
                    },
                  });

                }

              },
            },
          ]
        );

      } catch (
        error: any
      ) {

        Alert.alert(
          copy.publishError,

          error?.message ||
          copy.publishErrorDescription
        );

      } finally {

        setSubmitting(
          false
        );

        setSubmitMode(
          null
        );

      }

    };


  // ========================================================
  // AUTH LOADING
  // ========================================================

  if (
    authLoading
  ) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "left",
          "right",
        ]}
      >

        <View
          style={
            styles.center
          }
        >

          <ActivityIndicator
            size="large"
            color="#9A6C20"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // SIGN-IN GATE
  // ========================================================

  if (
    !user
  ) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "left",
          "right",
        ]}
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.signInScroll
          }
        >

          <View
            style={
              styles.signInCard
            }
          >

            <View
              style={
                styles.signInIcon
              }
            >

              <PenLine
                size={26}
                color="#986A20"
              />

            </View>


            <Text
              style={
                styles.signInTitle
              }
            >
              {copy.signInTitle}
            </Text>


            <Text
              style={
                styles.signInDescription
              }
            >
              {copy.signInDescription}
            </Text>


            <TouchableOpacity
              activeOpacity={0.84}
              style={
                styles.signInButton
              }
              onPress={() =>
                router.push(
                  "/(tabs)/account"
                )
              }
            >

              <User
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.signInButtonText
                }
              >
                {copy.goToAccount}
              </Text>

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.footerWrap
            }
          >

            <Footer />

          </View>

        </ScrollView>

      </SafeAreaView>

    );

  }


  // ========================================================
  // MAIN
  // ========================================================

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "left",
        "right",
      ]}
    >

      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >

          {/* HERO */}

          <View
            style={
              styles.hero
            }
          >

            <View
              style={
                styles.heroIcon
              }
            >

              <PenLine
                size={22}
                color="#93641A"
              />

            </View>


            <View
              style={
                styles.heroCopy
              }
            >

              <View
                style={
                  styles.eyebrowRow
                }
              >

                <Sparkles
                  size={13}
                  color="#9A6C20"
                />

                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  {copy.eyebrow}
                </Text>

              </View>


              <Text
                style={
                  styles.heroTitle
                }
              >
                {copy.heading}
              </Text>


              <Text
                style={
                  styles.heroDescription
                }
              >
                {copy.description}
              </Text>

            </View>

          </View>


          {/* OCR */}

          <View
            style={
              styles.ocrCard
            }
          >

            <View
              style={
                styles.ocrHeader
              }
            >

              <View
                style={
                  styles.ocrIcon
                }
              >

                <ScanText
                  size={21}
                  color="#946823"
                />

              </View>


              <View
                style={
                  styles.ocrHeaderCopy
                }
              >

                <Text
                  style={
                    styles.ocrTitle
                  }
                >
                  {ocrCopy.title}
                </Text>

                <Text
                  style={
                    styles.ocrDescription
                  }
                >
                  {ocrCopy.description}
                </Text>

              </View>

            </View>


            <View
              style={
                styles.ocrButtonGrid
              }
            >

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.ocrSourceButton
                }
                onPress={
                  handleCamera
                }
              >

                <Camera
                  size={20}
                  color="#73531D"
                />

                <Text
                  style={
                    styles.ocrSourceText
                  }
                >
                  {ocrCopy.camera}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.ocrSourceButton
                }
                onPress={
                  handleChooseImage
                }
              >

                <FileImage
                  size={20}
                  color="#73531D"
                />

                <Text
                  style={
                    styles.ocrSourceText
                  }
                >
                  {ocrCopy.image}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.ocrSourceButton
                }
                onPress={
                  handleChoosePDF
                }
              >

                <FolderOpen
                  size={20}
                  color="#73531D"
                />

                <Text
                  style={
                    styles.ocrSourceText
                  }
                >
                  {ocrCopy.pdf}
                </Text>

              </TouchableOpacity>

            </View>


            {selectedOCRFile && (

              <View
                style={
                  styles.selectedFileCard
                }
              >

                <FileText
                  size={20}
                  color="#8A6323"
                />


                <View
                  style={
                    styles.selectedFileCopy
                  }
                >

                  <Text
                    style={
                      styles.selectedFileLabel
                    }
                  >
                    {ocrCopy.selected}
                  </Text>

                  <Text
                    style={
                      styles.selectedFileName
                    }
                    numberOfLines={1}
                  >
                    {selectedOCRFile.name}
                  </Text>

                </View>


                <TouchableOpacity
                  activeOpacity={0.7}
                  style={
                    styles.removeFileButton
                  }
                  onPress={() =>
                    setSelectedOCRFile(
                      null
                    )
                  }
                >

                  <Trash2
                    size={17}
                    color="#985043"
                  />

                </TouchableOpacity>

              </View>

            )}


            {selectedOCRFile && (

              <TouchableOpacity
                activeOpacity={0.84}
                disabled={
                  extractingOCR
                }
                style={[
                  styles.extractButton,

                  extractingOCR &&
                    styles.buttonDisabled,
                ]}
                onPress={
                  handleExtractOCR
                }
              >

                {extractingOCR ? (

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                ) : (

                  <ScanText
                    size={18}
                    color="#FFFFFF"
                  />

                )}


                <Text
                  style={
                    styles.extractButtonText
                  }
                >
                  {
                    extractingOCR
                      ? ocrCopy.extracting
                      : ocrCopy.extract
                  }
                </Text>

              </TouchableOpacity>

            )}

          </View>


          {/* EDITOR */}

          <View
            style={
              styles.editorCard
            }
          >

            {/* TITLE */}

            <View
              style={
                styles.fieldBlock
              }
            >

              <View
                style={
                  styles.fieldLabelRow
                }
              >

                <View
                  style={
                    styles.fieldLabelLeft
                  }
                >

                  <FileText
                    size={15}
                    color="#6E5A37"
                  />

                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    {copy.titleLabel}
                  </Text>

                </View>


                <Text
                  style={
                    styles.fieldCount
                  }
                >
                  {titleCount}/200
                </Text>

              </View>


              <TextInput
                value={
                  title
                }
                onChangeText={
                  setTitle
                }
                maxLength={200}
                placeholder={
                  copy.titlePlaceholder
                }
                placeholderTextColor="#ADA297"
                style={
                  styles.titleInput
                }
              />


              <Text
                style={
                  styles.fieldHint
                }
              >
                {copy.titleHint}
              </Text>

            </View>


            {/* CATEGORY */}

            <View
              style={
                styles.selectionColumn
              }
            >

              <View
                style={
                  styles.fieldLabelLeft
                }
              >

                <Tag
                  size={15}
                  color="#6E5A37"
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  {copy.categoryLabel}
                </Text>

              </View>


              <TouchableOpacity
                activeOpacity={0.78}
                style={
                  styles.selectButton
                }
                onPress={() =>
                  setPicker(
                    "category"
                  )
                }
              >

                <Text
                  style={
                    styles.selectText
                  }
                >
                  {
                    getCategoryLabel(
                      category
                    )
                  }
                </Text>

                <ChevronDown
                  size={17}
                  color="#776B5F"
                />

              </TouchableOpacity>

            </View>


            {/* LANGUAGE */}

            <View
              style={[
                styles.selectionColumn,
                styles.languageColumn,
              ]}
            >

              <View
                style={
                  styles.fieldLabelLeft
                }
              >

                <Globe2
                  size={15}
                  color="#6E5A37"
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  {copy.languageLabel}
                </Text>

              </View>


              <TouchableOpacity
                activeOpacity={0.78}
                style={
                  styles.selectButton
                }
                disabled={
                  languageLoading
                }
                onPress={() =>
                  setPicker(
                    "language"
                  )
                }
              >

                <Text
                  style={
                    styles.selectText
                  }
                  numberOfLines={1}
                >
                  {
                    languageLoading
                      ? "..."
                      : (
                          getLanguageLabel(
                            selectedLanguage
                          ) +
                          " — " +
                          getLanguageEnglishName(
                            selectedLanguage
                          )
                        )
                  }
                </Text>

                <ChevronDown
                  size={17}
                  color="#776B5F"
                />

              </TouchableOpacity>


              <Text
                style={
                  styles.languageHelp
                }
              >
                {copy.languageHelp}
              </Text>

            </View>


            {/* STATS */}

            <View
              style={
                styles.statsCard
              }
            >

              <StatItem
                icon={
                  <BookOpen
                    size={15}
                    color="#8A672D"
                  />
                }
                value={
                  wordCount
                }
                label={
                  copy.statsWords
                }
              />


              <View
                style={
                  styles.statDivider
                }
              />


              <StatItem
                icon={
                  <FileText
                    size={15}
                    color="#8A672D"
                  />
                }
                value={
                  contentCount
                }
                label={
                  copy.statsCharacters
                }
              />


              <View
                style={
                  styles.statDivider
                }
              />


              <StatItem
                icon={
                  <Timer
                    size={15}
                    color="#8A672D"
                  />
                }
                value={
                  readingMinutes
                }
                label={
                  copy.statsReading
                }
              />

            </View>


            {/* LANGUAGE DISPLAY */}

            <View
              style={
                styles.languageDisplay
              }
            >

              <Globe2
                size={16}
                color="#302A24"
              />

              <Text
                style={
                  styles.languageDisplayLabel
                }
              >
                {copy.writingLanguage}:
              </Text>

              <Text
                style={
                  styles.languageDisplayValue
                }
                numberOfLines={1}
              >
                {
                  getLanguageLabel(
                    selectedLanguage
                  )
                }
                {" · "}
                {
                  getLanguageEnglishName(
                    selectedLanguage
                  )
                }
              </Text>

            </View>


            {/* CONTENT */}

            <View
              style={
                styles.contentBlock
              }
            >

              <View
                style={
                  styles.fieldLabelRow
                }
              >

                <View
                  style={
                    styles.fieldLabelLeft
                  }
                >

                  <PenLine
                    size={15}
                    color="#6E5A37"
                  />

                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    {copy.contentLabel}
                  </Text>

                </View>


                <Text
                  style={
                    styles.fieldCount
                  }
                >
                  {contentCount}{" "}
                  {copy.statsCharacters}
                </Text>

              </View>


              <TextInput
                value={
                  content
                }
                onChangeText={
                  setContent
                }
                multiline
                textAlignVertical="top"
                placeholder={
                  copy.contentPlaceholder
                }
                placeholderTextColor="#AAA095"
                style={
                  styles.contentInput
                }
              />


              <Text
                style={
                  styles.contentMetaText
                }
              >
                {
                  getLanguageLabel(
                    selectedLanguage
                  )
                }
                {" · "}
                {wordCount}{" "}
                {copy.statsWords}
                {" · "}
                {contentCount}{" "}
                {copy.statsCharacters}
                {" · ~"}
                {readingMinutes}{" "}
                {
                  readingMinutes === 1
                    ? copy.minuteRead
                    : copy.minutesRead
                }
              </Text>

            </View>


            {/* STATUS */}

            <View
              style={
                styles.inlineStatus
              }
            >

              <View
                style={
                  styles.statusLeft
                }
              >

                <Text
                  style={
                    styles.statusLanguage
                  }
                >
                  {
                    getLanguageLabel(
                      selectedLanguage
                    )
                  }
                </Text>

                <Text
                  style={
                    styles.statusMeta
                  }
                >
                  {wordCount}{" "}
                  {copy.statsWords}
                  {" · "}
                  {contentCount}{" "}
                  {copy.statsCharacters}
                </Text>

              </View>


              <View
                style={[
                  styles.readyBadge,

                  canPublish
                    ? styles.readyBadgePublished
                    : styles.readyBadgeDraft,
                ]}
              >

                <View
                  style={[
                    styles.readyDot,

                    canPublish
                      ? styles.readyDotPublished
                      : styles.readyDotDraft,
                  ]}
                />

                <Text
                  style={[
                    styles.readyText,

                    canPublish
                      ? styles.readyTextPublished
                      : styles.readyTextDraft,
                  ]}
                >
                  {
                    canPublish
                      ? copy.ready
                      : copy.draftReady
                  }
                </Text>

              </View>

            </View>

          </View>


          {/* ACTIONS */}

          <View
            style={
              styles.actions
            }
          >

            <TouchableOpacity
              activeOpacity={0.84}
              disabled={
                submitting
              }
              style={[
                styles.draftButton,

                submitting &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleSaveDraft
              }
            >

              {
                submitting &&
                submitMode ===
                  "draft"
                  ? (

                    <ActivityIndicator
                      size="small"
                      color="#765820"
                    />

                  )
                  : (

                    <Save
                      size={18}
                      color="#765820"
                    />

                  )
              }

              <Text
                style={
                  styles.draftButtonText
                }
              >
                {
                  submitting &&
                  submitMode ===
                    "draft"
                    ? copy.saving
                    : copy.saveDraft
                }
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              activeOpacity={0.84}
              disabled={
                submitting
              }
              style={[
                styles.publishButton,

                submitting &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handlePublish
              }
            >

              {
                submitting &&
                submitMode ===
                  "publish"
                  ? (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  )
                  : (

                    <Send
                      size={18}
                      color="#FFFFFF"
                    />

                  )
              }

              <Text
                style={
                  styles.publishButtonText
                }
              >
                {
                  submitting &&
                  submitMode ===
                    "publish"
                    ? copy.publishing
                    : copy.publish
                }
              </Text>

            </TouchableOpacity>

          </View>


          {/* NOTE */}

          <View
            style={
              styles.noteCard
            }
          >

            <View
              style={
                styles.noteIcon
              }
            >

              <PenLine
                size={18}
                color="#9A6C20"
              />

            </View>


            <View
              style={
                styles.noteCopy
              }
            >

              <Text
                style={
                  styles.noteTitle
                }
              >
                {copy.noteTitle}
              </Text>

              <Text
                style={
                  styles.noteDescription
                }
              >
                {copy.noteDescription}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.footerWrap
            }
          >

            <Footer />

          </View>

        </ScrollView>


        {/* PICKER */}

        <PickerModal
          visible={
            picker !== null
          }
          title={
            picker ===
            "category"
              ? copy.categoryPickerTitle
              : copy.languagePickerTitle
          }
          onClose={() =>
            setPicker(
              null
            )
          }
        >

          {
            picker ===
              "category" &&
            CATEGORIES.map(
              (
                item
              ) => (

                <OptionRow
                  key={
                    item
                  }
                  label={
                    getCategoryLabel(
                      item
                    )
                  }
                  selected={
                    category ===
                    item
                  }
                  onPress={() => {

                    setCategory(
                      item
                    );

                    setPicker(
                      null
                    );

                  }}
                />

              )
            )
          }


          {
            picker ===
              "language" &&
            languages.map(
              (
                item
              ) => (

                <OptionRow
                  key={
                    item.code
                  }
                  label={
                    getLanguageLabel(
                      item
                    )
                  }
                  description={
                    getLanguageEnglishName(
                      item
                    )
                  }
                  selected={
                    writingLanguage ===
                    item.code
                  }
                  onPress={() => {

                    setWritingLanguage(
                      item.code
                    );

                    setPicker(
                      null
                    );

                  }}
                />

              )
            )
          }

        </PickerModal>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );

}


// ==========================================================
// STAT
// ==========================================================

function StatItem({
  icon,
  value,
  label,
}: {
  icon:
    React.ReactNode;
  value:
    number;
  label:
    string;
}) {

  return (

    <View
      style={
        styles.statItem
      }
    >

      {icon}

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }
        numberOfLines={1}
      >
        {label}
      </Text>

    </View>

  );

}


// ==========================================================
// PICKER MODAL
// ==========================================================

function PickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible:
    boolean;
  title:
    string;
  onClose:
    () => void;
  children:
    React.ReactNode;
}) {

  return (

    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >

      <View
        style={
          styles.modalRoot
        }
      >

        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={
            onClose
          }
        />

        <View
          style={
            styles.pickerSheet
          }
        >

          <View
            style={
              styles.sheetHandle
            }
          />


          <View
            style={
              styles.sheetHeader
            }
          >

            <Text
              style={
                styles.sheetTitle
              }
            >
              {title}
            </Text>

            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={
                onClose
              }
            >

              <X
                size={18}
                color="#5D5247"
              />

            </TouchableOpacity>

          </View>


          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.optionList
            }
          >

            {children}

          </ScrollView>

        </View>

      </View>

    </Modal>

  );

}


// ==========================================================
// OPTION
// ==========================================================

function OptionRow({
  label,
  description,
  selected,
  onPress,
}: {
  label:
    string;
  description?:
    string;
  selected:
    boolean;
  onPress:
    () => void;
}) {

  return (

    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.optionRow,

        selected &&
          styles.optionRowSelected,
      ]}
      onPress={
        onPress
      }
    >

      <View
        style={
          styles.optionCopy
        }
      >

        <Text
          style={[
            styles.optionLabel,

            selected &&
              styles.optionLabelSelected,
          ]}
        >
          {label}
        </Text>

        {
          description &&
          description !==
            label && (

            <Text
              style={
                styles.optionDescription
              }
            >
              {description}
            </Text>

          )
        }

      </View>


      <View
        style={[
          styles.optionCheck,

          selected &&
            styles.optionCheckSelected,
        ]}
      >

        {
          selected && (

            <Check
              size={14}
              color="#FFFFFF"
            />

          )
        }

      </View>

    </TouchableOpacity>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        "#F8F5EF",
    },


    keyboardView: {
      flex: 1,
    },


    scroll: {
      flex: 1,
    },


    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 0,
    },


    footerWrap: {
      marginHorizontal: -18,
      marginTop: 20,
    },


    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    loadingText: {
      marginTop: 10,
      fontSize: 11,
      fontWeight: "700",
      color: "#786B5E",
    },


    signInScroll: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingTop: 28,
    },


    signInCard: {
      minHeight: 330,
      padding: 26,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#DDD2C5",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFDF9",
    },


    signInIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F1E5D2",
    },


    signInTitle: {
      marginTop: 16,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "900",
      textAlign:
        "center",
      color: "#302A24",
    },


    signInDescription: {
      maxWidth: 300,
      marginTop: 9,
      fontSize: 12,
      lineHeight: 20,
      textAlign:
        "center",
      color: "#7E7164",
    },


    signInButton: {
      minHeight: 46,
      marginTop: 20,
      paddingHorizontal: 18,
      borderRadius: 11,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        "#302A24",
    },


    signInButtonText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#FFFFFF",
    },


    hero: {
      padding: 19,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        "#DFD5C8",
      flexDirection:
        "row",
      backgroundColor:
        "#F3EBDD",
    },


    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF9EF",
    },


    heroCopy: {
      flex: 1,
      marginLeft: 12,
    },


    eyebrowRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },


    eyebrow: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1.4,
      color: "#946823",
    },


    heroTitle: {
      marginTop: 6,
      fontSize: 23,
      lineHeight: 30,
      fontWeight: "900",
      color: "#302A24",
    },


    heroDescription: {
      marginTop: 7,
      fontSize: 11,
      lineHeight: 18,
      color: "#75695D",
    },


    ocrCard: {
      marginTop: 16,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#DED2C2",
      backgroundColor:
        "#FFFDF9",
    },


    ocrHeader: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
    },


    ocrIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F4E9D8",
    },


    ocrHeaderCopy: {
      flex: 1,
      marginLeft: 11,
    },


    ocrTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#302A24",
    },


    ocrDescription: {
      marginTop: 4,
      fontSize: 9,
      lineHeight: 15,
      color: "#827568",
    },


    ocrButtonGrid: {
      marginTop: 15,
      flexDirection:
        "row",
      gap: 8,
    },


    ocrSourceButton: {
      flex: 1,
      minHeight: 72,
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#DDD0BE",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F9F3EA",
    },


    ocrSourceText: {
      marginTop: 6,
      textAlign:
        "center",
      fontSize: 8,
      lineHeight: 12,
      fontWeight: "800",
      color: "#675437",
    },


    selectedFileCard: {
      marginTop: 13,
      minHeight: 61,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#DED5C9",
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#F8F4EE",
    },


    selectedFileCopy: {
      flex: 1,
      marginLeft: 10,
    },


    selectedFileLabel: {
      fontSize: 7,
      fontWeight: "700",
      color: "#998B7B",
    },


    selectedFileName: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: "800",
      color: "#4B4137",
    },


    removeFileButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F3E4E0",
    },


    extractButton: {
      minHeight: 49,
      marginTop: 12,
      borderRadius: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        "#A97822",
    },


    extractButtonText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
    },


    editorCard: {
      marginTop: 16,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#DCD2C5",
      backgroundColor:
        "#FFFDF9",
    },


    fieldBlock: {
      width: "100%",
    },


    fieldLabelRow: {
      minHeight: 25,
      marginBottom: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    fieldLabelLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },


    fieldLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: "#5D4F3D",
    },


    fieldCount: {
      fontSize: 8,
      fontWeight: "600",
      color: "#998A7B",
    },


    fieldHint: {
      marginTop: 6,
      fontSize: 8,
      color: "#A09488",
    },


    titleInput: {
      minHeight: 52,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#DDD4C9",
      fontSize: 14,
      color: "#312A24",
      backgroundColor:
        "#FFFFFF",
    },


    selectionColumn: {
      width: "100%",
      marginTop: 18,
    },


    languageColumn: {
      marginTop: 16,
    },


    selectButton: {
      minHeight: 52,
      marginTop: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#DCD3C8",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
    },


    selectText: {
      flex: 1,
      marginRight: 8,
      fontSize: 12,
      fontWeight: "700",
      color: "#4C4137",
    },


    languageHelp: {
      marginTop: 7,
      fontSize: 8,
      lineHeight: 14,
      color: "#998A7C",
    },


    statsCard: {
      minHeight: 64,
      marginTop: 18,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#E1D8CD",
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#F8F4EE",
    },


    statItem: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    statValue: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "900",
      color: "#524634",
    },


    statLabel: {
      marginTop: 1,
      fontSize: 7,
      fontWeight: "600",
      color: "#948777",
    },


    statDivider: {
      width: 1,
      height: 35,
      backgroundColor:
        "#E3DACE",
    },


    languageDisplay: {
      marginTop: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    languageDisplayLabel: {
      marginLeft: 7,
      fontSize: 10,
      fontWeight: "800",
      color: "#554A3E",
    },


    languageDisplayValue: {
      flex: 1,
      marginLeft: 4,
      fontSize: 10,
      fontWeight: "900",
      color: "#302A24",
    },


    contentBlock: {
      marginTop: 18,
    },


    contentInput: {
      minHeight: 330,
      paddingHorizontal: 15,
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#D9D0C5",
      fontSize: 15,
      lineHeight: 25,
      color: "#332C26",
      backgroundColor:
        "#FFFFFF",
    },


    contentMetaText: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        "#ECE5DC",
      fontSize: 8,
      lineHeight: 14,
      color: "#958779",
    },


    inlineStatus: {
      marginTop: 18,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        "#E7DED3",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 10,
    },


    statusLeft: {
      flex: 1,
    },


    statusLanguage: {
      fontSize: 9,
      fontWeight: "700",
      color: "#7B6E60",
    },


    statusMeta: {
      marginTop: 3,
      fontSize: 8,
      color: "#9C8F81",
    },


    readyBadge: {
      maxWidth: 145,
      minHeight: 32,
      paddingHorizontal: 10,
      borderRadius: 16,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },


    readyBadgeDraft: {
      backgroundColor:
        "#F3ECE3",
    },


    readyBadgePublished: {
      backgroundColor:
        "#F0E3C8",
    },


    readyDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },


    readyDotDraft: {
      backgroundColor:
        "#AD9D89",
    },


    readyDotPublished: {
      backgroundColor:
        "#9A6C20",
    },


    readyText: {
      flexShrink: 1,
      fontSize: 7,
      fontWeight: "800",
    },


    readyTextDraft: {
      color: "#7F7164",
    },


    readyTextPublished: {
      color: "#805A1E",
    },


    actions: {
      marginTop: 16,
      flexDirection:
        "row",
      gap: 10,
    },


    draftButton: {
      flex: 1,
      minHeight: 51,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#D7C8B2",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        "#FFFDF9",
    },


    draftButtonText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#765820",
    },


    publishButton: {
      flex: 1,
      minHeight: 51,
      borderRadius: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        "#A97822",
    },


    publishButtonText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
    },


    buttonDisabled: {
      opacity: 0.6,
    },


    noteCard: {
      marginTop: 17,
      padding: 15,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#DECDB7",
      flexDirection:
        "row",
      backgroundColor:
        "#F1E4D0",
    },


    noteIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF9EE",
    },


    noteCopy: {
      flex: 1,
      marginLeft: 11,
    },


    noteTitle: {
      fontSize: 10,
      fontWeight: "900",
      color: "#634923",
    },


    noteDescription: {
      marginTop: 4,
      fontSize: 8,
      lineHeight: 14,
      color: "#8D7759",
    },


    modalRoot: {
      flex: 1,
      justifyContent:
        "flex-end",
    },


    modalBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        "rgba(28,23,19,0.35)",
    },


    pickerSheet: {
      maxHeight: "78%",
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      backgroundColor:
        "#FBF8F2",
    },


    sheetHandle: {
      alignSelf:
        "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "#CEC0AF",
    },


    sheetHeader: {
      marginTop: 14,
      marginBottom: 13,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    sheetTitle: {
      flex: 1,
      marginRight: 12,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "900",
      color: "#342D27",
    },


    closeButton: {
      width: 35,
      height: 35,
      borderRadius: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EFE7DD",
    },


    optionList: {
      paddingBottom: 12,
    },


    optionRow: {
      minHeight: 58,
      marginBottom: 8,
      paddingHorizontal: 13,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#DED5C9",
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFDF9",
    },


    optionRowSelected: {
      borderColor:
        "#B58A45",
      backgroundColor:
        "#F6EBD8",
    },


    optionCopy: {
      flex: 1,
    },


    optionLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: "#55493E",
    },


    optionLabelSelected: {
      color: "#815B1E",
    },


    optionDescription: {
      marginTop: 2,
      fontSize: 8,
      color: "#968777",
    },


    optionCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#CCBFAE",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    optionCheckSelected: {
      borderColor:
        "#9A6C20",
      backgroundColor:
        "#9A6C20",
    },

  });