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
  deleteDocument,
  getMyDocuments,
  permanentlyDeleteDocument,
  restoreDocument,
} from "../api/documents";

import {
  deleteArtwork,
  getMyArtworks,
  permanentlyDeleteArtwork,
  restoreArtwork,
} from "../api/artworks";

import {
  LANGUAGES,
} from "../config/languages";

import {
  useLanguage,
} from "../Language/LanguageContext";

import DocumentCard
  from "../components/DocumentCard";

import ArtworkCard
  from "../components/ArtworkCard";


// =========================================================
// RESPONSE HELPERS
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
// TOTAL HELPER
// =========================================================

function extractTotal(
  data,
  items
) {

  const possibleTotal =
    Number(
      data?.pagination?.total ??
      data?.total
    );


  if (
    Number.isFinite(
      possibleTotal
    )
  ) {

    return possibleTotal;
  }


  return (
    Array.isArray(
      items
    )
      ? items.length
      : 0
  );
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
  // MULTILINGUAL LOCAL TEXT
  // =======================================================

  const localText =
    useMemo(
      () => {

        const values = {

          // =================================================
          // BENGALI
          // =================================================

          bn: {

            title:
              "আমার সৃজনশীল সংগ্রহ",

            description:
              "আপনার খসড়া, প্রকাশিত লেখা, PDF ডকুমেন্ট, শিল্পকর্ম এবং ট্র্যাশ এক জায়গা থেকে পরিচালনা করুন।",

            newContent:
              "নতুন কনটেন্ট",

            creativeUploads:
              "ডকুমেন্ট ও শিল্পকর্ম",

            pdfDocuments:
              "PDF ডকুমেন্ট",

            artwork:
              "শিল্পকর্ম",

            writings:
              "লেখা",

            trash:
              "ট্র্যাশ",

            trashWritings:
              "লেখা",

            trashDocuments:
              "PDF ডকুমেন্ট",

            trashArtwork:
              "শিল্পকর্ম",

            searchDocuments:
              "PDF ডকুমেন্ট খুঁজুন…",

            searchArtwork:
              "শিল্পকর্ম খুঁজুন…",

            searchTrashWritings:
              "ট্র্যাশে লেখা খুঁজুন…",

            searchTrashDocuments:
              "ট্র্যাশে PDF ডকুমেন্ট খুঁজুন…",

            searchTrashArtwork:
              "ট্র্যাশে শিল্পকর্ম খুঁজুন…",

            loadingDocuments:
              "PDF ডকুমেন্ট লোড হচ্ছে…",

            loadingArtwork:
              "শিল্পকর্ম লোড হচ্ছে…",

            loadingTrash:
              "ট্র্যাশ লোড হচ্ছে…",

            noDocuments:
              "কোনো PDF ডকুমেন্ট নেই",

            noDocumentsDescription:
              "আপনার সংরক্ষিত বা প্রকাশিত PDF ডকুমেন্ট এখানে দেখা যাবে।",

            noArtwork:
              "কোনো শিল্পকর্ম নেই",

            noArtworkDescription:
              "আপনার সংরক্ষিত বা প্রকাশিত শিল্পকর্ম এখানে দেখা যাবে।",

            noTrashWritings:
              "ট্র্যাশে কোনো লেখা নেই",

            noTrashWritingsDescription:
              "মুছে ফেলা লেখাগুলি এখানে দেখা যাবে।",

            noTrashDocuments:
              "ট্র্যাশে কোনো PDF ডকুমেন্ট নেই",

            noTrashDocumentsDescription:
              "মুছে ফেলা PDF ডকুমেন্ট এখানে দেখা যাবে এবং পুনরুদ্ধার করা যাবে।",

            noTrashArtwork:
              "ট্র্যাশে কোনো শিল্পকর্ম নেই",

            noTrashArtworkDescription:
              "মুছে ফেলা শিল্পকর্ম এখানে দেখা যাবে এবং পুনরুদ্ধার করা যাবে।",

            publishPdf:
              "PDF প্রকাশ করুন",

            publishArtwork:
              "শিল্পকর্ম প্রকাশ করুন",

            updated:
              "আপডেট",

            deletedAt:
              "মুছে ফেলার সময়",

            draft:
              "খসড়া",

            published:
              "প্রকাশিত",

            deleted:
              "ট্র্যাশ",

            moveToTrash:
              "ট্র্যাশে পাঠান",

            movingToTrash:
              "ট্র্যাশে পাঠানো হচ্ছে…",

            restore:
              "পুনরুদ্ধার",

            restoring:
              "পুনরুদ্ধার হচ্ছে…",

            deletePermanently:
              "স্থায়ীভাবে মুছুন",

            deletingPermanently:
              "স্থায়ীভাবে মুছে ফেলা হচ্ছে…",

            writingMovedToTrash:
              "লেখাটি ট্র্যাশে পাঠানো হয়েছে।",

            documentMovedToTrash:
              "PDF ডকুমেন্টটি ট্র্যাশে পাঠানো হয়েছে।",

            artworkMovedToTrash:
              "শিল্পকর্মটি ট্র্যাশে পাঠানো হয়েছে।",

            writingRestored:
              "লেখাটি পুনরুদ্ধার করা হয়েছে।",

            documentRestored:
              "PDF ডকুমেন্টটি পুনরুদ্ধার করা হয়েছে।",

            artworkRestored:
              "শিল্পকর্মটি পুনরুদ্ধার করা হয়েছে।",

            writingPermanentlyDeleted:
              "লেখাটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",

            documentPermanentlyDeleted:
              "PDF ডকুমেন্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",

            artworkPermanentlyDeleted:
              "শিল্পকর্মটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",

            deleteWritingTitle:
              "এই লেখাটি ট্র্যাশে পাঠাবেন?",

            deleteWritingDescription:
              "লেখাটি ট্র্যাশে পাঠানো হবে। পরে এটি পুনরুদ্ধার করতে পারবেন।",

            deleteDocumentTitle:
              "এই PDF ডকুমেন্টটি ট্র্যাশে পাঠাবেন?",

            deleteDocumentDescription:
              "PDF ডকুমেন্টটি ট্র্যাশে পাঠানো হবে। আসল PDF ফাইলটি সংরক্ষিত থাকবে এবং পরে পুনরুদ্ধার করা যাবে।",

            deleteArtworkTitle:
              "এই শিল্পকর্মটি ট্র্যাশে পাঠাবেন?",

            deleteArtworkDescription:
              "শিল্পকর্মটি ট্র্যাশে পাঠানো হবে। আসল ছবিটি সংরক্ষিত থাকবে এবং পরে পুনরুদ্ধার করা যাবে।",

            permanentWritingConfirm:
              "এই লেখাটি স্থায়ীভাবে মুছে ফেলবেন? এই কাজটি আর ফিরিয়ে আনা যাবে না।",

            permanentDocumentConfirm:
              "এই PDF ডকুমেন্টটি স্থায়ীভাবে মুছে ফেলবেন? PDF ফাইলটিও Cloudinary থেকে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।",

            permanentArtworkConfirm:
              "এই শিল্পকর্মটি স্থায়ীভাবে মুছে ফেলবেন? ছবিটিও Cloudinary থেকে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।",

            allLanguages:
              "সব ভাষা",

            refresh:
              "রিফ্রেশ",

            noDate:
              "তারিখ নেই",
          },


          // =================================================
          // ENGLISH
          // =================================================

          en: {

            title:
              "My Creative Library",

            description:
              "Manage your drafts, published writings, PDF documents, artwork and Trash in one place.",

            newContent:
              "New Content",

            creativeUploads:
              "Documents & Artwork",

            pdfDocuments:
              "PDF Documents",

            artwork:
              "Artwork",

            writings:
              "Writings",

            trash:
              "Trash",

            trashWritings:
              "Writings",

            trashDocuments:
              "PDF Documents",

            trashArtwork:
              "Artwork",

            searchDocuments:
              "Search PDF documents…",

            searchArtwork:
              "Search artwork…",

            searchTrashWritings:
              "Search deleted writings…",

            searchTrashDocuments:
              "Search deleted PDF documents…",

            searchTrashArtwork:
              "Search deleted artwork…",

            loadingDocuments:
              "Loading PDF documents…",

            loadingArtwork:
              "Loading artwork…",

            loadingTrash:
              "Loading Trash…",

            noDocuments:
              "No PDF documents yet",

            noDocumentsDescription:
              "Your saved and published PDF documents will appear here.",

            noArtwork:
              "No artwork yet",

            noArtworkDescription:
              "Your saved and published artwork will appear here.",

            noTrashWritings:
              "No writings in Trash",

            noTrashWritingsDescription:
              "Deleted writings will appear here.",

            noTrashDocuments:
              "No PDF documents in Trash",

            noTrashDocumentsDescription:
              "Deleted PDF documents will appear here and can be restored.",

            noTrashArtwork:
              "No artwork in Trash",

            noTrashArtworkDescription:
              "Deleted artwork will appear here and can be restored.",

            publishPdf:
              "Publish PDF",

            publishArtwork:
              "Publish Artwork",

            updated:
              "Updated",

            deletedAt:
              "Deleted",

            draft:
              "Draft",

            published:
              "Published",

            deleted:
              "Trash",

            moveToTrash:
              "Move to Trash",

            movingToTrash:
              "Moving to Trash…",

            restore:
              "Restore",

            restoring:
              "Restoring…",

            deletePermanently:
              "Delete Permanently",

            deletingPermanently:
              "Deleting permanently…",

            writingMovedToTrash:
              "Writing moved to Trash.",

            documentMovedToTrash:
              "PDF document moved to Trash.",

            artworkMovedToTrash:
              "Artwork moved to Trash.",

            writingRestored:
              "Writing restored successfully.",

            documentRestored:
              "PDF document restored successfully.",

            artworkRestored:
              "Artwork restored successfully.",

            writingPermanentlyDeleted:
              "Writing permanently deleted.",

            documentPermanentlyDeleted:
              "PDF document permanently deleted.",

            artworkPermanentlyDeleted:
              "Artwork permanently deleted.",

            deleteWritingTitle:
              "Move this writing to Trash?",

            deleteWritingDescription:
              "The writing will be moved to Trash. You can restore it later.",

            deleteDocumentTitle:
              "Move this PDF document to Trash?",

            deleteDocumentDescription:
              "The PDF document will be moved to Trash. The original PDF file will remain stored and can be restored later.",

            deleteArtworkTitle:
              "Move this artwork to Trash?",

            deleteArtworkDescription:
              "The artwork will be moved to Trash. The original image will remain stored and can be restored later.",

            permanentWritingConfirm:
              "Permanently delete this writing? This action cannot be undone.",

            permanentDocumentConfirm:
              "Permanently delete this PDF document? The PDF will also be removed from Cloudinary. This action cannot be undone.",

            permanentArtworkConfirm:
              "Permanently delete this artwork? The image will also be removed from Cloudinary. This action cannot be undone.",

            allLanguages:
              "All languages",

            refresh:
              "Refresh",

            noDate:
              "No date",
          },


          // =================================================
          // HINDI
          // =================================================

          hi: {

            title:
              "मेरा रचनात्मक संग्रह",

            description:
              "अपने ड्राफ्ट, प्रकाशित रचनाएँ, PDF दस्तावेज़, कलाकृतियाँ और ट्रैश एक ही स्थान से प्रबंधित करें।",

            newContent:
              "नई सामग्री",

            creativeUploads:
              "दस्तावेज़ और कलाकृति",

            pdfDocuments:
              "PDF दस्तावेज़",

            artwork:
              "कलाकृति",

            writings:
              "रचनाएँ",

            trash:
              "ट्रैश",

            trashWritings:
              "रचनाएँ",

            trashDocuments:
              "PDF दस्तावेज़",

            trashArtwork:
              "कलाकृति",

            searchDocuments:
              "PDF दस्तावेज़ खोजें…",

            searchArtwork:
              "कलाकृति खोजें…",

            searchTrashWritings:
              "हटाई गई रचनाएँ खोजें…",

            searchTrashDocuments:
              "हटाए गए PDF दस्तावेज़ खोजें…",

            searchTrashArtwork:
              "हटाई गई कलाकृतियाँ खोजें…",

            loadingDocuments:
              "PDF दस्तावेज़ लोड हो रहे हैं…",

            loadingArtwork:
              "कलाकृतियाँ लोड हो रही हैं…",

            loadingTrash:
              "ट्रैश लोड हो रहा है…",

            noDocuments:
              "कोई PDF दस्तावेज़ नहीं है",

            noDocumentsDescription:
              "आपके सहेजे गए और प्रकाशित PDF दस्तावेज़ यहाँ दिखाई देंगे।",

            noArtwork:
              "कोई कलाकृति नहीं है",

            noArtworkDescription:
              "आपकी सहेजी गई और प्रकाशित कलाकृतियाँ यहाँ दिखाई देंगी।",

            noTrashWritings:
              "ट्रैश में कोई रचना नहीं है",

            noTrashWritingsDescription:
              "हटाई गई रचनाएँ यहाँ दिखाई देंगी।",

            noTrashDocuments:
              "ट्रैश में कोई PDF दस्तावेज़ नहीं है",

            noTrashDocumentsDescription:
              "हटाए गए PDF दस्तावेज़ यहाँ दिखाई देंगे और पुनर्स्थापित किए जा सकेंगे।",

            noTrashArtwork:
              "ट्रैश में कोई कलाकृति नहीं है",

            noTrashArtworkDescription:
              "हटाई गई कलाकृतियाँ यहाँ दिखाई देंगी और पुनर्स्थापित की जा सकेंगी।",

            publishPdf:
              "PDF प्रकाशित करें",

            publishArtwork:
              "कलाकृति प्रकाशित करें",

            updated:
              "अपडेट",

            deletedAt:
              "हटाने का समय",

            draft:
              "ड्राफ्ट",

            published:
              "प्रकाशित",

            deleted:
              "ट्रैश",

            moveToTrash:
              "ट्रैश में भेजें",

            movingToTrash:
              "ट्रैश में भेजा जा रहा है…",

            restore:
              "पुनर्स्थापित करें",

            restoring:
              "पुनर्स्थापित किया जा रहा है…",

            deletePermanently:
              "स्थायी रूप से हटाएँ",

            deletingPermanently:
              "स्थायी रूप से हटाया जा रहा है…",

            writingMovedToTrash:
              "रचना ट्रैश में भेज दी गई।",

            documentMovedToTrash:
              "PDF दस्तावेज़ ट्रैश में भेज दिया गया।",

            artworkMovedToTrash:
              "कलाकृति ट्रैश में भेज दी गई।",

            writingRestored:
              "रचना पुनर्स्थापित की गई।",

            documentRestored:
              "PDF दस्तावेज़ पुनर्स्थापित किया गया।",

            artworkRestored:
              "कलाकृति पुनर्स्थापित की गई।",

            writingPermanentlyDeleted:
              "रचना स्थायी रूप से हटा दी गई।",

            documentPermanentlyDeleted:
              "PDF दस्तावेज़ स्थायी रूप से हटा दिया गया।",

            artworkPermanentlyDeleted:
              "कलाकृति स्थायी रूप से हटा दी गई।",

            deleteWritingTitle:
              "इस रचना को ट्रैश में भेजें?",

            deleteWritingDescription:
              "रचना ट्रैश में भेजी जाएगी। आप इसे बाद में पुनर्स्थापित कर सकते हैं।",

            deleteDocumentTitle:
              "इस PDF दस्तावेज़ को ट्रैश में भेजें?",

            deleteDocumentDescription:
              "PDF दस्तावेज़ ट्रैश में भेजा जाएगा। मूल PDF सुरक्षित रहेगा और बाद में पुनर्स्थापित किया जा सकेगा।",

            deleteArtworkTitle:
              "इस कलाकृति को ट्रैश में भेजें?",

            deleteArtworkDescription:
              "कलाकृति ट्रैश में भेजी जाएगी। मूल चित्र सुरक्षित रहेगा और बाद में पुनर्स्थापित किया जा सकेगा।",

            permanentWritingConfirm:
              "इस रचना को स्थायी रूप से हटाएँ? यह कार्रवाई वापस नहीं की जा सकती।",

            permanentDocumentConfirm:
              "इस PDF दस्तावेज़ को स्थायी रूप से हटाएँ? PDF Cloudinary से भी हटा दिया जाएगा। यह कार्रवाई वापस नहीं की जा सकती।",

            permanentArtworkConfirm:
              "इस कलाकृति को स्थायी रूप से हटाएँ? चित्र Cloudinary से भी हटा दिया जाएगा। यह कार्रवाई वापस नहीं की जा सकती।",

            allLanguages:
              "सभी भाषाएँ",

            refresh:
              "रीफ़्रेश",

            noDate:
              "तारीख उपलब्ध नहीं",
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
  // =======================================================

  const [
    uploadTab,
    setUploadTab,
  ] = useState(
    "documents"
  );


  // =======================================================
  // TRASH SUB TAB
  // =======================================================
  //
  // writings
  // documents
  // artworks
  //
  // =======================================================

  const [
    trashTab,
    setTrashTab,
  ] = useState(
    "writings"
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
    deletedWritingCount,
    setDeletedWritingCount,
  ] = useState(0);


  const [
    deletedDocumentCount,
    setDeletedDocumentCount,
  ] = useState(0);


  const [
    deletedArtworkCount,
    setDeletedArtworkCount,
  ] = useState(0);


  const trashCount =
    deletedWritingCount +
    deletedDocumentCount +
    deletedArtworkCount;


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
    actionKey,
    setActionKey,
  ] = useState("");


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
  //
  // {
  //   type: "writing" | "document" | "artwork",
  //   item: {...}
  // }
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
  // LOCALIZED LANGUAGE LABEL
  // =======================================================

  function getLocalizedLanguageLabel(
    languageCode
  ) {

    const code =
      String(
        languageCode ||
        "bn"
      )
        .trim()
        .toLowerCase();


    const values = {

      bn: {
        bn: "বাংলা",
        en: "ইংরেজি",
        hi: "হিন্দি",
        as: "অসমীয়া",
        or: "ওড়িয়া",
        ta: "তামিল",
        te: "তেলুগু",
      },

      en: {
        bn: "Bengali",
        en: "English",
        hi: "Hindi",
        as: "Assamese",
        or: "Odia",
        ta: "Tamil",
        te: "Telugu",
      },

      hi: {
        bn: "बंगाली",
        en: "अंग्रेज़ी",
        hi: "हिन्दी",
        as: "असमिया",
        or: "ओड़िया",
        ta: "तमिल",
        te: "तेलुगु",
      },
    };


    const current =
      values[
        uiLanguage
      ] ||
      values.en;


    return (
      current[
        code
      ] ||
      code.toUpperCase()
    );
  }


  // =======================================================
  // FORMAT DATE + TIME
  // =======================================================

  function formatDateTime(
    dateString
  ) {

    if (
      !dateString
    ) {

      return (
        localText.noDate
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

      return (
        localText.noDate
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

      return (
        new Intl.DateTimeFormat(
          localeMap[
            uiLanguage
          ] ||
          "en-US",
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
          )
      );


    } catch {

      return (
        date.toLocaleString()
      );
    }
  }


  // =======================================================
  // BUSY
  // =======================================================

  function getActionKey(
    type,
    id
  ) {

    return (
      `${type}-${id}`
    );
  }


  function isBusy(
    type,
    id
  ) {

    return (
      actionKey ===
      getActionKey(
        type,
        id
      )
    );
  }


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

            getMyDocuments({
              status:
                "active",
              limit:
                100,
            }),

            getMyDocuments({
              status:
                "deleted",
              limit:
                100,
            }),

            getMyArtworks({
              status:
                "active",
              limit:
                100,
            }),

            getMyArtworks({
              status:
                "deleted",
              limit:
                100,
            }),
          ]);


        const [
          draftsResult,
          publishedResult,
          deletedWritingsResult,
          activeDocumentsResult,
          deletedDocumentsResult,
          activeArtworksResult,
          deletedArtworksResult,
        ] = results;


        // =================================================
        // WRITING DRAFTS
        // =================================================

        if (
          draftsResult.status ===
          "fulfilled"
        ) {

          const items =
            extractWritings(
              draftsResult.value
            );


          setDraftCount(
            extractTotal(
              draftsResult.value,
              items
            )
          );
        }


        // =================================================
        // WRITING PUBLISHED
        // =================================================

        if (
          publishedResult.status ===
          "fulfilled"
        ) {

          const items =
            extractWritings(
              publishedResult.value
            );


          setPublishedCount(
            extractTotal(
              publishedResult.value,
              items
            )
          );
        }


        // =================================================
        // WRITING TRASH
        // =================================================

        if (
          deletedWritingsResult.status ===
          "fulfilled"
        ) {

          const items =
            extractWritings(
              deletedWritingsResult.value
            );


          setDeletedWritingCount(
            extractTotal(
              deletedWritingsResult.value,
              items
            )
          );
        }


        // =================================================
        // ACTIVE PDF
        // =================================================

        if (
          activeDocumentsResult.status ===
          "fulfilled"
        ) {

          const items =
            extractDocuments(
              activeDocumentsResult.value
            );


          setDocumentCount(
            extractTotal(
              activeDocumentsResult.value,
              items
            )
          );

        } else {

          console.error(
            "DOCUMENT COUNT ERROR:",
            activeDocumentsResult.reason
          );
        }


        // =================================================
        // DELETED PDF
        // =================================================

        if (
          deletedDocumentsResult.status ===
          "fulfilled"
        ) {

          const items =
            extractDocuments(
              deletedDocumentsResult.value
            );


          setDeletedDocumentCount(
            extractTotal(
              deletedDocumentsResult.value,
              items
            )
          );

        } else {

          console.error(
            "DELETED DOCUMENT COUNT ERROR:",
            deletedDocumentsResult.reason
          );
        }


        // =================================================
        // ACTIVE ARTWORK
        // =================================================

        if (
          activeArtworksResult.status ===
          "fulfilled"
        ) {

          const items =
            extractArtworks(
              activeArtworksResult.value
            );


          setArtworkCount(
            extractTotal(
              activeArtworksResult.value,
              items
            )
          );

        } else {

          console.error(
            "ARTWORK COUNT ERROR:",
            activeArtworksResult.reason
          );
        }


        // =================================================
        // DELETED ARTWORK
        // =================================================

        if (
          deletedArtworksResult.status ===
          "fulfilled"
        ) {

          const items =
            extractArtworks(
              deletedArtworksResult.value
            );


          setDeletedArtworkCount(
            extractTotal(
              deletedArtworksResult.value,
              items
            )
          );

        } else {

          console.error(
            "DELETED ARTWORK COUNT ERROR:",
            deletedArtworksResult.reason
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


          const total =
            extractTotal(
              data,
              items
            );


          if (
            status ===
            "draft"
          ) {

            setDraftCount(
              total
            );
          }


          if (
            status ===
            "published"
          ) {

            setPublishedCount(
              total
            );
          }


          if (
            status ===
            "deleted"
          ) {

            setDeletedWritingCount(
              total
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
        status = "active",
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
            await getMyDocuments({
              status,
              limit:
                100,
            });


          const items =
            extractDocuments(
              data
            );


          setDocuments(
            items
          );


          setWritings(
            []
          );


          setArtworks(
            []
          );


          const total =
            extractTotal(
              data,
              items
            );


          if (
            status ===
            "deleted"
          ) {

            setDeletedDocumentCount(
              total
            );

          } else {

            setDocumentCount(
              total
            );
          }


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
        status = "active",
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
            await getMyArtworks({
              status,
              limit:
                100,
            });


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


          const total =
            extractTotal(
              data,
              items
            );


          if (
            status ===
            "deleted"
          ) {

            setDeletedArtworkCount(
              total
            );

          } else {

            setArtworkCount(
              total
            );
          }


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


      // ===================================================
      // DOCUMENTS / ARTWORK
      // ===================================================

      if (
        activeTab ===
        "uploads"
      ) {

        if (
          uploadTab ===
          "artworks"
        ) {

          loadArtworks(
            "active"
          );

        } else {

          loadDocuments(
            "active"
          );
        }


        return;
      }


      // ===================================================
      // TRASH
      // ===================================================

      if (
        activeTab ===
        "deleted"
      ) {

        if (
          trashTab ===
          "documents"
        ) {

          loadDocuments(
            "deleted"
          );


          return;
        }


        if (
          trashTab ===
          "artworks"
        ) {

          loadArtworks(
            "deleted"
          );


          return;
        }


        loadWritings(
          "deleted"
        );


        return;
      }


      // ===================================================
      // WRITING DRAFT / PUBLISHED
      // ===================================================

      loadWritings(
        activeTab
      );

    },
    [
      activeTab,
      uploadTab,
      trashTab,
      loadArtworks,
      loadDocuments,
      loadWritings,
    ]
  );


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


    return (
      content
        .trim()
        .split(
          /\s+/
        )
        .filter(
          Boolean
        )
        .length
    );
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
  // SEARCH / FILTER / SORT
  // =======================================================

  function filterItems(
    items,
    type
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
                type ===
                "writing"
                  ? item.content ||
                    ""
                  : item.description ||
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


            const languageLabel =
              getLocalizedLanguageLabel(
                item.language ||
                "bn"
              )
                .toLowerCase();


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

        // =================================================
        // TITLE
        // =================================================

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


        // =================================================
        // CREATED
        // =================================================

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


        // =================================================
        // TRASH ITEMS USE DELETION DATE
        // =================================================

        const firstDate =
          a.deleted_at ||
          a.updated_at ||
          a.published_at ||
          a.created_at ||
          0;


        const secondDate =
          b.deleted_at ||
          b.updated_at ||
          b.published_at ||
          b.created_at ||
          0;


        if (
          sortBy ===
          "oldest"
        ) {

          return (
            new Date(
              firstDate
            )
            -
            new Date(
              secondDate
            )
          );
        }


        // =================================================
        // RECENT
        // =================================================

        return (
          new Date(
            secondDate
          )
          -
          new Date(
            firstDate
          )
        );
      }
    );


    return result;
  }


  // =======================================================
  // FILTERED ITEMS
  // =======================================================

  const filteredWritings =
    useMemo(
      () =>
        filterItems(
          writings,
          "writing"
        ),
      [
        writings,
        search,
        language,
        sortBy,
        uiLanguage,
      ]
    );


  const filteredDocuments =
    useMemo(
      () =>
        filterItems(
          documents,
          "document"
        ),
      [
        documents,
        search,
        language,
        sortBy,
        uiLanguage,
      ]
    );


  const filteredArtworks =
    useMemo(
      () =>
        filterItems(
          artworks,
          "artwork"
        ),
      [
        artworks,
        search,
        language,
        sortBy,
        uiLanguage,
      ]
    );


  // =======================================================
  // CURRENT ITEMS
  // =======================================================

  let currentItems =
    filteredWritings;


  let currentTotal =
    writings.length;


  if (
    activeTab ===
    "uploads"
  ) {

    if (
      uploadTab ===
      "artworks"
    ) {

      currentItems =
        filteredArtworks;


      currentTotal =
        artworks.length;

    } else {

      currentItems =
        filteredDocuments;


      currentTotal =
        documents.length;
    }
  }


  if (
    activeTab ===
    "deleted"
  ) {

    if (
      trashTab ===
      "documents"
    ) {

      currentItems =
        filteredDocuments;


      currentTotal =
        documents.length;

    } else if (
      trashTab ===
      "artworks"
    ) {

      currentItems =
        filteredArtworks;


      currentTotal =
        artworks.length;

    } else {

      currentItems =
        filteredWritings;


      currentTotal =
        writings.length;
    }
  }


  // =======================================================
  // PUBLISH WRITING
  // =======================================================

  async function handlePublish(
    writingId
  ) {

    const key =
      getActionKey(
        "writing",
        writingId
      );


    setActionKey(
      key
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

      setActionKey(
        ""
      );
    }
  }


  // =======================================================
  // UNPUBLISH WRITING
  // =======================================================

  async function handleUnpublish(
    writingId
  ) {

    const key =
      getActionKey(
        "writing",
        writingId
      );


    setActionKey(
      key
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

      setActionKey(
        ""
      );
    }
  }


  // =======================================================
  // OPEN SOFT DELETE MODAL
  // =======================================================

  function openDeleteModal(
    type,
    item
  ) {

    setDeleteTarget({
      type,
      item,
    });


    setError(
      ""
    );


    setSuccess(
      ""
    );
  }


  // =======================================================
  // CLOSE SOFT DELETE MODAL
  // =======================================================

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


  // =======================================================
  // DELETE COPY
  // =======================================================

  function getDeleteModalTitle() {

    if (
      deleteTarget?.type ===
      "document"
    ) {

      return (
        localText.deleteDocumentTitle
      );
    }


    if (
      deleteTarget?.type ===
      "artwork"
    ) {

      return (
        localText.deleteArtworkTitle
      );
    }


    return (
      localText.deleteWritingTitle
    );
  }


  function getDeleteModalDescription() {

    if (
      deleteTarget?.type ===
      "document"
    ) {

      return (
        localText.deleteDocumentDescription
      );
    }


    if (
      deleteTarget?.type ===
      "artwork"
    ) {

      return (
        localText.deleteArtworkDescription
      );
    }


    return (
      localText.deleteWritingDescription
    );
  }


  // =======================================================
  // CONFIRM SOFT DELETE
  // =======================================================

  async function confirmDelete() {

    if (
      !deleteTarget?.item
    ) {

      return;
    }


    const {
      type,
      item,
    } = deleteTarget;


    const key =
      getActionKey(
        type,
        item.id
      );


    setDeleting(
      true
    );


    setActionKey(
      key
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      // ===================================================
      // WRITING
      // ===================================================

      if (
        type ===
        "writing"
      ) {

        await deleteWriting(
          item.id
        );


        setWritings(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.writingMovedToTrash
        );
      }


      // ===================================================
      // PDF DOCUMENT
      // ===================================================

      if (
        type ===
        "document"
      ) {

        await deleteDocument(
          item.id
        );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.documentMovedToTrash
        );
      }


      // ===================================================
      // ARTWORK
      // ===================================================

      if (
        type ===
        "artwork"
      ) {

        await deleteArtwork(
          item.id
        );


        setArtworks(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.artworkMovedToTrash
        );
      }


      setDeleteTarget(
        null
      );


      await loadCounts();


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


      setActionKey(
        ""
      );
    }
  }


  // =======================================================
  // RESTORE FROM TRASH
  // =======================================================

  async function handleRestore(
    type,
    item
  ) {

    const key =
      getActionKey(
        type,
        item.id
      );


    setActionKey(
      key
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      if (
        type ===
        "writing"
      ) {

        await restoreWriting(
          item.id
        );


        setWritings(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.writingRestored
        );
      }


      if (
        type ===
        "document"
      ) {

        await restoreDocument(
          item.id
        );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.documentRestored
        );
      }


      if (
        type ===
        "artwork"
      ) {

        await restoreArtwork(
          item.id
        );


        setArtworks(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.artworkRestored
        );
      }


      await loadCounts();


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

      setActionKey(
        ""
      );
    }
  }


  // =======================================================
  // PERMANENT DELETE
  // =======================================================

  async function handlePermanentDelete(
    type,
    item
  ) {

    let confirmationText =
      localText.permanentWritingConfirm;


    if (
      type ===
      "document"
    ) {

      confirmationText =
        localText.permanentDocumentConfirm;
    }


    if (
      type ===
      "artwork"
    ) {

      confirmationText =
        localText.permanentArtworkConfirm;
    }


    const confirmed =
      window.confirm(
        `${confirmationText}\n\n“${
          item.title ||
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


    const key =
      getActionKey(
        type,
        item.id
      );


    setActionKey(
      key
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );


    try {

      // ===================================================
      // WRITING
      // ===================================================

      if (
        type ===
        "writing"
      ) {

        await permanentlyDeleteWriting(
          item.id
        );


        setWritings(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.writingPermanentlyDeleted
        );
      }


      // ===================================================
      // PDF
      // ===================================================

      if (
        type ===
        "document"
      ) {

        await permanentlyDeleteDocument(
          item.id
        );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.documentPermanentlyDeleted
        );
      }


      // ===================================================
      // ARTWORK
      // ===================================================

      if (
        type ===
        "artwork"
      ) {

        await permanentlyDeleteArtwork(
          item.id
        );


        setArtworks(
          (
            current
          ) =>
            current.filter(
              (
                currentItem
              ) =>
                currentItem.id !==
                item.id
            )
        );


        setSuccess(
          localText.artworkPermanentlyDeleted
        );
      }


      await loadCounts();


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

      setActionKey(
        ""
      );
    }
  }


  // =======================================================
  // EDIT WRITING
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


    // =====================================================
    // UPLOADS
    // =====================================================

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
            "active",
            false
          ),

          loadCounts(),
        ]);

      } else {

        await Promise.all([

          loadDocuments(
            "active",
            false
          ),

          loadCounts(),
        ]);
      }


      return;
    }


    // =====================================================
    // TRASH
    // =====================================================

    if (
      activeTab ===
      "deleted"
    ) {

      if (
        trashTab ===
        "documents"
      ) {

        await Promise.all([

          loadDocuments(
            "deleted",
            false
          ),

          loadCounts(),
        ]);


        return;
      }


      if (
        trashTab ===
        "artworks"
      ) {

        await Promise.all([

          loadArtworks(
            "deleted",
            false
          ),

          loadCounts(),
        ]);


        return;
      }


      await Promise.all([

        loadWritings(
          "deleted",
          false
        ),

        loadCounts(),
      ]);


      return;
    }


    // =====================================================
    // WRITING
    // =====================================================

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
      "deleted"
    ) {

      if (
        trashTab ===
        "documents"
      ) {

        return (
          localText.searchTrashDocuments
        );
      }


      if (
        trashTab ===
        "artworks"
      ) {

        return (
          localText.searchTrashArtwork
        );
      }


      return (
        localText.searchTrashWritings
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


    return t(
      "myWritings.searchPublished"
    );
  }


  // =======================================================
  // CURRENT TAB TITLE
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


    if (
      trashTab ===
      "documents"
    ) {

      return (
        `${localText.trash} · ${localText.trashDocuments}`
      );
    }


    if (
      trashTab ===
      "artworks"
    ) {

      return (
        `${localText.trash} · ${localText.trashArtwork}`
      );
    }


    return (
      `${localText.trash} · ${localText.trashWritings}`
    );
  }


  // =======================================================
  // EMPTY TITLE
  // =======================================================

  function getEmptyTitle() {

    if (
      search ||
      language
    ) {

      return t(
        "myWritings.noResults"
      );
    }


    if (
      activeTab ===
      "uploads"
    ) {

      return (
        uploadTab ===
        "artworks"
          ? localText.noArtwork
          : localText.noDocuments
      );
    }


    if (
      activeTab ===
      "deleted"
    ) {

      if (
        trashTab ===
        "documents"
      ) {

        return (
          localText.noTrashDocuments
        );
      }


      if (
        trashTab ===
        "artworks"
      ) {

        return (
          localText.noTrashArtwork
        );
      }


      return (
        localText.noTrashWritings
      );
    }


    if (
      activeTab ===
      "draft"
    ) {

      return t(
        "myWritings.noDrafts"
      );
    }


    return t(
      "myWritings.noPublished"
    );
  }


  // =======================================================
  // EMPTY DESCRIPTION
  // =======================================================

  function getEmptyDescription() {

    if (
      search ||
      language
    ) {

      return t(
        "myWritings.noResultsDescription"
      );
    }


    if (
      activeTab ===
      "uploads"
    ) {

      return (
        uploadTab ===
        "artworks"
          ? localText.noArtworkDescription
          : localText.noDocumentsDescription
      );
    }


    if (
      activeTab ===
      "deleted"
    ) {

      if (
        trashTab ===
        "documents"
      ) {

        return (
          localText.noTrashDocumentsDescription
        );
      }


      if (
        trashTab ===
        "artworks"
      ) {

        return (
          localText.noTrashArtworkDescription
        );
      }


      return (
        localText.noTrashWritingsDescription
      );
    }


    if (
      activeTab ===
      "draft"
    ) {

      return t(
        "myWritings.noDraftsDescription"
      );
    }


    return t(
      "myWritings.noPublishedDescription"
    );
  }


  // =======================================================
  // SUBTAB BUTTON STYLE
  // =======================================================

  function subTabButtonStyle(
    selected
  ) {

    return {

      flex:
        "1 1 190px",

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
  // MEDIA MANAGEMENT FOOTER
  // =======================================================

  function renderMediaManagement(
    type,
    item
  ) {

    const busy =
      isBusy(
        type,
        item.id
      );


    const isDeleted =
      item.status ===
      "deleted";


    const activityDate =
      isDeleted
        ? (
            item.deleted_at ||
            item.updated_at ||
            item.created_at
          )
        : (
            item.updated_at ||
            item.published_at ||
            item.created_at
          );


    return (

      <div
        style={{
          padding:
            "14px 16px",

          border:
            "1px solid #eadfd6",

          borderRadius:
            "14px",

          background:
            "#ffffff",

          display:
            "grid",

          gap:
            "12px",
        }}
      >

        {/* ===============================================
            STATUS + LANGUAGE
        ================================================ */}

        <div
          style={{
            display:
              "flex",

            flexWrap:
              "wrap",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              "10px",
          }}
        >

          <span
            className={
              isDeleted
                ? "my-writing-status deleted"
                : item.status ===
                  "draft"
                  ? "my-writing-status draft"
                  : "my-writing-status published"
            }
          >

            {
              isDeleted
                ? localText.deleted
                : item.status ===
                  "draft"
                  ? localText.draft
                  : localText.published
            }

          </span>


          <span
            className="my-writing-language-badge"
          >

            <Globe2
              size={11}
            />

            {getLocalizedLanguageLabel(
              item.language ||
              "bn"
            )}

          </span>

        </div>


        {/* ===============================================
            DATE + TIME
        ================================================ */}

        <div
          className="my-writing-meta"
        >

          <span>

            {
              isDeleted
                ? localText.deletedAt
                : localText.updated
            }

          </span>


          <strong>

            {formatDateTime(
              activityDate
            )}

          </strong>

        </div>


        {/* ===============================================
            ACTIONS
        ================================================ */}

        <div
          className="my-writing-actions"
        >

          {isDeleted
            ? (

                <>
                  <button
                    type="button"
                    className="primary"
                    onClick={() =>
                      handleRestore(
                        type,
                        item
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


                    {localText.restore}

                  </button>


                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      handlePermanentDelete(
                        type,
                        item
                      )
                    }
                    disabled={
                      busy
                    }
                  >

                    <Trash2
                      size={16}
                    />

                    {localText.deletePermanently}

                  </button>
                </>

              )
            : (

                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    openDeleteModal(
                      type,
                      item
                    )
                  }
                  disabled={
                    busy
                  }
                >

                  <Trash2
                    size={16}
                  />

                  {localText.moveToTrash}

                </button>

              )}

        </div>

      </div>
    );
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
            onClick={() =>
              setActiveTab(
                "uploads"
              )
            }
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
                {localText.trash}
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
            DOCUMENT / ARTWORK SUBTABS
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
                subTabButtonStyle(
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
                subTabButtonStyle(
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
            TRASH SUBTABS
        ================================================== */}

        {activeTab ===
          "deleted" && (

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
                "1px solid #eadfd6",

              borderRadius:
                "15px",

              background:
                "#fbf8f4",
            }}
          >

            {/* WRITINGS */}

            <button
              type="button"
              style={
                subTabButtonStyle(
                  trashTab ===
                  "writings"
                )
              }
              onClick={() =>
                setTrashTab(
                  "writings"
                )
              }
            >

              <BookOpen
                size={18}
              />

              <span>
                {localText.trashWritings}
              </span>

              <strong>
                {deletedWritingCount}
              </strong>

            </button>


            {/* PDF */}

            <button
              type="button"
              style={
                subTabButtonStyle(
                  trashTab ===
                  "documents"
                )
              }
              onClick={() =>
                setTrashTab(
                  "documents"
                )
              }
            >

              <FileText
                size={18}
              />

              <span>
                {localText.trashDocuments}
              </span>

              <strong>
                {deletedDocumentCount}
              </strong>

            </button>


            {/* ARTWORK */}

            <button
              type="button"
              style={
                subTabButtonStyle(
                  trashTab ===
                  "artworks"
                )
              }
              onClick={() =>
                setTrashTab(
                  "artworks"
                )
              }
            >

              <ImageIcon
                size={18}
              />

              <span>
                {localText.trashArtwork}
              </span>

              <strong>
                {deletedArtworkCount}
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
                {localText.allLanguages}
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

                    {getLocalizedLanguageLabel(
                      item.code
                    )}

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
              {localText.refresh}
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

                {getLocalizedLanguageLabel(
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
                  : activeTab ===
                    "deleted"
                    ? localText.loadingTrash
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
                    "deleted"
                    ? (
                        <Trash2
                          size={30}
                        />
                      )
                    : activeTab ===
                      "draft"
                      ? (
                          <FileText
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
              {getEmptyTitle()}
            </h2>


            <p>
              {getEmptyDescription()}
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
            PDF GRID
            ACTIVE + TRASH
        ================================================== */}

        {(
          (
            activeTab ===
            "uploads" &&
            uploadTab ===
            "documents"
          )
          ||
          (
            activeTab ===
            "deleted" &&
            trashTab ===
            "documents"
          )
        ) &&
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

                <div
                  key={
                    document.id
                  }
                  style={{
                    display:
                      "grid",

                    gap:
                      "10px",

                    alignContent:
                      "start",
                  }}
                >

                  <DocumentCard
                    document={
                      document
                    }
                  />


                  {renderMediaManagement(
                    "document",
                    document
                  )}

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            ARTWORK GRID
            ACTIVE + TRASH
        ================================================== */}

        {(
          (
            activeTab ===
            "uploads" &&
            uploadTab ===
            "artworks"
          )
          ||
          (
            activeTab ===
            "deleted" &&
            trashTab ===
            "artworks"
          )
        ) &&
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

                <div
                  key={
                    artwork.id
                  }
                  style={{
                    display:
                      "grid",

                    gap:
                      "10px",

                    alignContent:
                      "start",
                  }}
                >

                  <ArtworkCard
                    artwork={
                      artwork
                    }
                  />


                  {renderMediaManagement(
                    "artwork",
                    artwork
                  )}

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            WRITING GRID
        ================================================== */}

        {(
          activeTab ===
          "draft"
          ||
          activeTab ===
          "published"
          ||
          (
            activeTab ===
            "deleted" &&
            trashTab ===
            "writings"
          )
        ) &&
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
                  isBusy(
                    "writing",
                    writing.id
                  );


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


                const isDeleted =
                  writing.status ===
                  "deleted";


                return (

                  <article
                    key={
                      writing.id
                    }
                    className="my-writing-card"
                  >

                    {/* =====================================
                        TOP
                    ====================================== */}

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
                              : isDeleted
                                ? "my-writing-status deleted"
                                : "my-writing-status draft"
                          }
                        >

                          {
                            writing.status ===
                            "published"
                              ? localText.published
                              : isDeleted
                                ? localText.deleted
                                : localText.draft
                          }

                        </span>


                        <span
                          className="my-writing-language-badge"
                        >

                          <Globe2
                            size={11}
                          />

                          {getLocalizedLanguageLabel(
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


                    {/* =====================================
                        TITLE
                    ====================================== */}

                    <h2>

                      {
                        writing.title ||
                        t(
                          "common.untitled"
                        )
                      }

                    </h2>


                    {/* =====================================
                        PREVIEW
                    ====================================== */}

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


                    {/* =====================================
                        STATS
                    ====================================== */}

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

                        {getLocalizedLanguageLabel(
                          languageCode
                        )}

                      </span>

                    </div>


                    {/* =====================================
                        DATE + TIME
                    ====================================== */}

                    <div
                      className="my-writing-meta"
                    >

                      <span>

                        {
                          isDeleted
                            ? localText.deletedAt
                            : localText.updated
                        }

                      </span>


                      <strong>

                        {formatDateTime(
                          isDeleted
                            ? (
                                writing.deleted_at ||
                                writing.updated_at ||
                                writing.created_at
                              )
                            : (
                                writing.updated_at ||
                                writing.created_at
                              )
                        )}

                      </strong>

                    </div>


                    {/* =====================================
                        ACTIONS
                    ====================================== */}

                    <div
                      className="my-writing-actions"
                    >

                      {isDeleted
                        ? (

                            <>
                              <button
                                type="button"
                                className="primary"
                                onClick={() =>
                                  handleRestore(
                                    "writing",
                                    writing
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


                                {localText.restore}

                              </button>


                              <button
                                type="button"
                                className="danger"
                                onClick={() =>
                                  handlePermanentDelete(
                                    "writing",
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

                                {localText.deletePermanently}

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
                                    "writing",
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

                                {localText.moveToTrash}

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
          SOFT DELETE MODAL
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

              {localText.moveToTrash}

            </p>


            <h2
              id="delete-modal-title"
            >

              {getDeleteModalTitle()}

            </h2>


            <p
              className="delete-modal-description"
            >

              <strong>

                “{
                  deleteTarget.item?.title ||
                  t(
                    "common.untitled"
                  )
                }”

              </strong>

              {" "}

              {getDeleteModalDescription()}

            </p>


            <div
              className="delete-modal-writing-info"
            >

              <Globe2
                size={14}
              />


              <span>

                {getLocalizedLanguageLabel(
                  deleteTarget.item?.language ||
                  "bn"
                )}

              </span>


              <span>
                •
              </span>


              <span>

                {
                  deleteTarget.type ===
                  "document"
                    ? localText.pdfDocuments
                    : deleteTarget.type ===
                      "artwork"
                      ? localText.artwork
                      : (
                          deleteTarget.item?.category ||
                          t(
                            "categories.other"
                          )
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
                    ? localText.movingToTrash
                    : localText.moveToTrash
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