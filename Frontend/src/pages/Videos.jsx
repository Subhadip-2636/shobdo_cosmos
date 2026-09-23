import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  Clapperboard,
  Clock3,
  Eye,
  Film,
  Globe2,
  Link2,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  getReels,
} from "../api/reels";

import ReelsTab from "./ReelsTab";

import "./Videos.css";


// =========================================================
// API CONFIG
// =========================================================

const RAW_API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5000"
  )
    .trim()
    .replace(/\/+$/, "");


const API_URL =
  RAW_API_URL.endsWith("/api")
    ? RAW_API_URL
    : `${RAW_API_URL}/api`;


const API_ORIGIN =
  API_URL.replace(
    /\/api$/,
    ""
  );


const TOKEN_KEY =
  "shobdo_token";


// =========================================================
// CONSTANTS
// =========================================================

const VALID_TABS = [
  "videos",
  "reels",
  "following",
];


const PAGE_SIZE =
  40;


const VIDEO_BACKGROUND_VIDEO =
  "/backgrounds/shobdo-reels-bg.mp4";


const VIDEO_COPY = {
  "en": {
    "eyebrow": "SHOBDO MEDIA",
    "title": "Video",
    "description": "Watch videos, discover Reels and keep up with creators you follow.",
    "addVideo": "Add Video",
    "createReel": "Create Reel",
    "videos": "Videos",
    "reels": "Reels",
    "following": "Following",
    "communityFeed": "COMMUNITY FEED",
    "latestVideos": "Latest videos",
    "yourNetwork": "YOUR NETWORK",
    "fromPeopleYouFollow": "From people you follow",
    "yourLibrary": "YOUR LIBRARY",
    "videoTrash": "Video Trash",
    "trash": "Trash",
    "backToVideos": "Back to Videos",
    "refresh": "Refresh",
    "loading": "Loading videos...",
    "loadingTrash": "Loading Video Trash...",
    "unavailable": "Unable to load videos",
    "trashUnavailable": "Unable to load Video Trash",
    "tryAgain": "Try again",
    "noVideos": "No videos yet",
    "noVideosDescription": "Be the first to share a video with the SHOBDO community.",
    "noFollowingMedia": "No videos or Reels here yet",
    "noFollowingMediaDescription": "Follow creators to see their latest videos and Reels here.",
    "trashEmpty": "Video Trash is empty",
    "trashEmptyDescription": "Videos you move to Trash will appear here until you restore or permanently delete them.",
    "inTrash": "In Trash",
    "you": "You",
    "trashed": "Trashed",
    "reel": "Reel",
    "video": "Video",
    "moreOptions": "More options",
    "restore": "Restore",
    "restoring": "Restoring...",
    "deletePermanently": "Delete permanently",
    "deletingPermanently": "Deleting...",
    "share": "Share",
    "copyLink": "Copy link",
    "moveToTrash": "Move to Trash",
    "movingToTrash": "Moving...",
    "mediaUnavailable": "Video unavailable",
    "views": "views",
    "loadError": "Unable to load videos.",
    "followingLoadError": "Unable to load media from people you follow.",
    "trashLoadError": "Unable to load Video Trash.",
    "shareReelText": "Watch this Reel on SHOBDO.",
    "shareVideoText": "Watch this video on SHOBDO.",
    "linkCopied": "Link copied.",
    "copyThisLink": "Copy this link:",
    "moveToTrashTitle": "Move video to Trash?",
    "moveToTrashDescription": "This video will disappear from SHOBDO, but you can restore it later from Video Trash.",
    "moveToTrashError": "Unable to move this video to Trash.",
    "movedToTrash": "Video moved to Trash.",
    "restoreError": "Unable to restore this video.",
    "restored": "Video restored successfully.",
    "permanentDeletion": "PERMANENT DELETION",
    "permanentDeleteTitle": "Delete video permanently?",
    "permanentDeleteDescription": "This permanently removes the video from SHOBDO and deletes its stored media. This action cannot be undone.",
    "permanentDeleteError": "Unable to permanently delete this video.",
    "permanentlyDeleted": "Video permanently deleted.",
    "cancel": "Cancel",
    "close": "Close",
    "defaultReelTitle": "SHOBDO Reel",
    "untitledVideo": "Untitled video"
  },
  "bn": {
    "eyebrow": "SHOBDO মিডিয়া",
    "title": "ভিডিও",
    "description": "ভিডিও দেখুন, রিলস আবিষ্কার করুন এবং যাদের অনুসরণ করেন তাদের নতুন কনটেন্টের সঙ্গে থাকুন।",
    "addVideo": "ভিডিও যোগ করুন",
    "createReel": "রিল তৈরি করুন",
    "videos": "ভিডিও",
    "reels": "রিলস",
    "following": "অনুসরণ",
    "communityFeed": "কমিউনিটি ফিড",
    "latestVideos": "সর্বশেষ ভিডিও",
    "yourNetwork": "আপনার নেটওয়ার্ক",
    "fromPeopleYouFollow": "আপনি যাদের অনুসরণ করেন",
    "yourLibrary": "আপনার লাইব্রেরি",
    "videoTrash": "ভিডিও ট্র্যাশ",
    "trash": "ট্র্যাশ",
    "backToVideos": "ভিডিওতে ফিরুন",
    "refresh": "রিফ্রেশ",
    "loading": "ভিডিও লোড হচ্ছে...",
    "loadingTrash": "ভিডিও ট্র্যাশ লোড হচ্ছে...",
    "unavailable": "ভিডিও লোড করা যাচ্ছে না",
    "trashUnavailable": "ভিডিও ট্র্যাশ লোড করা যাচ্ছে না",
    "tryAgain": "আবার চেষ্টা করুন",
    "noVideos": "এখনও কোনো ভিডিও নেই",
    "noVideosDescription": "SHOBDO কমিউনিটিতে প্রথম ভিডিওটি শেয়ার করুন।",
    "noFollowingMedia": "এখানে এখনও কোনো ভিডিও বা রিলস নেই",
    "noFollowingMediaDescription": "স্রষ্টাদের অনুসরণ করুন, তাদের নতুন ভিডিও ও রিলস এখানে দেখুন।",
    "trashEmpty": "ভিডিও ট্র্যাশ খালি",
    "trashEmptyDescription": "আপনি ট্র্যাশে পাঠানো ভিডিওগুলি পুনরুদ্ধার বা স্থায়ীভাবে মুছে না ফেলা পর্যন্ত এখানে থাকবে।",
    "inTrash": "ট্র্যাশে",
    "you": "আপনি",
    "trashed": "ট্র্যাশে",
    "reel": "রিল",
    "video": "ভিডিও",
    "moreOptions": "আরও বিকল্প",
    "restore": "পুনরুদ্ধার",
    "restoring": "পুনরুদ্ধার হচ্ছে...",
    "deletePermanently": "স্থায়ীভাবে মুছুন",
    "deletingPermanently": "মুছে ফেলা হচ্ছে...",
    "share": "শেয়ার",
    "copyLink": "লিংক কপি",
    "moveToTrash": "ট্র্যাশে পাঠান",
    "movingToTrash": "পাঠানো হচ্ছে...",
    "mediaUnavailable": "ভিডিও উপলভ্য নয়",
    "views": "ভিউ",
    "loadError": "ভিডিও লোড করা যায়নি।",
    "followingLoadError": "আপনি যাদের অনুসরণ করেন তাদের মিডিয়া লোড করা যায়নি।",
    "trashLoadError": "ভিডিও ট্র্যাশ লোড করা যায়নি।",
    "shareReelText": "SHOBDO-তে এই রিলটি দেখুন।",
    "shareVideoText": "SHOBDO-তে এই ভিডিওটি দেখুন।",
    "linkCopied": "লিংক কপি হয়েছে।",
    "copyThisLink": "এই লিংকটি কপি করুন:",
    "moveToTrashTitle": "ভিডিওটি ট্র্যাশে পাঠাবেন?",
    "moveToTrashDescription": "ভিডিওটি SHOBDO থেকে সরিয়ে দেওয়া হবে, তবে পরে ভিডিও ট্র্যাশ থেকে পুনরুদ্ধার করতে পারবেন।",
    "moveToTrashError": "ভিডিওটি ট্র্যাশে পাঠানো যায়নি।",
    "movedToTrash": "ভিডিওটি ট্র্যাশে পাঠানো হয়েছে।",
    "restoreError": "ভিডিওটি পুনরুদ্ধার করা যায়নি।",
    "restored": "ভিডিওটি সফলভাবে পুনরুদ্ধার করা হয়েছে।",
    "permanentDeletion": "স্থায়ীভাবে মুছে ফেলা",
    "permanentDeleteTitle": "ভিডিওটি স্থায়ীভাবে মুছবেন?",
    "permanentDeleteDescription": "এতে ভিডিওটি SHOBDO থেকে স্থায়ীভাবে মুছে যাবে এবং সংরক্ষিত মিডিয়াও মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।",
    "permanentDeleteError": "ভিডিওটি স্থায়ীভাবে মুছে ফেলা যায়নি।",
    "permanentlyDeleted": "ভিডিওটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",
    "cancel": "বাতিল",
    "close": "বন্ধ করুন",
    "defaultReelTitle": "SHOBDO রিল",
    "untitledVideo": "শিরোনামহীন ভিডিও"
  },
  "hi": {
    "eyebrow": "SHOBDO मीडिया",
    "title": "वीडियो",
    "description": "वीडियो देखें, रील्स खोजें और जिन क्रिएटर्स को आप फ़ॉलो करते हैं उनके नए कंटेंट से जुड़े रहें।",
    "addVideo": "वीडियो जोड़ें",
    "createReel": "रील बनाएँ",
    "videos": "वीडियो",
    "reels": "रील्स",
    "following": "फ़ॉलोइंग",
    "communityFeed": "कम्युनिटी फ़ीड",
    "latestVideos": "नवीनतम वीडियो",
    "yourNetwork": "आपका नेटवर्क",
    "fromPeopleYouFollow": "जिन्हें आप फ़ॉलो करते हैं",
    "yourLibrary": "आपकी लाइब्रेरी",
    "videoTrash": "वीडियो ट्रैश",
    "trash": "ट्रैश",
    "backToVideos": "वीडियो पर वापस जाएँ",
    "refresh": "रीफ़्रेश",
    "loading": "वीडियो लोड हो रहे हैं...",
    "loadingTrash": "वीडियो ट्रैश लोड हो रहा है...",
    "unavailable": "वीडियो लोड नहीं हो सके",
    "trashUnavailable": "वीडियो ट्रैश लोड नहीं हो सका",
    "tryAgain": "फिर कोशिश करें",
    "noVideos": "अभी कोई वीडियो नहीं है",
    "noVideosDescription": "SHOBDO कम्युनिटी में पहला वीडियो शेयर करें।",
    "noFollowingMedia": "यहाँ अभी कोई वीडियो या रील नहीं है",
    "noFollowingMediaDescription": "क्रिएटर्स को फ़ॉलो करें और उनके नए वीडियो व रील्स यहाँ देखें।",
    "trashEmpty": "वीडियो ट्रैश खाली है",
    "trashEmptyDescription": "ट्रैश में भेजे गए वीडियो तब तक यहाँ रहेंगे जब तक आप उन्हें पुनर्स्थापित या स्थायी रूप से हटा नहीं देते।",
    "inTrash": "ट्रैश में",
    "you": "आप",
    "trashed": "ट्रैश में",
    "reel": "रील",
    "video": "वीडियो",
    "moreOptions": "और विकल्प",
    "restore": "पुनर्स्थापित करें",
    "restoring": "पुनर्स्थापित हो रहा है...",
    "deletePermanently": "स्थायी रूप से हटाएँ",
    "deletingPermanently": "हटाया जा रहा है...",
    "share": "शेयर",
    "copyLink": "लिंक कॉपी करें",
    "moveToTrash": "ट्रैश में भेजें",
    "movingToTrash": "भेजा जा रहा है...",
    "mediaUnavailable": "वीडियो उपलब्ध नहीं है",
    "views": "व्यू",
    "loadError": "वीडियो लोड नहीं किए जा सके।",
    "followingLoadError": "आप जिन लोगों को फ़ॉलो करते हैं उनका मीडिया लोड नहीं किया जा सका।",
    "trashLoadError": "वीडियो ट्रैश लोड नहीं किया जा सका।",
    "shareReelText": "SHOBDO पर यह रील देखें।",
    "shareVideoText": "SHOBDO पर यह वीडियो देखें।",
    "linkCopied": "लिंक कॉपी हो गया।",
    "copyThisLink": "यह लिंक कॉपी करें:",
    "moveToTrashTitle": "वीडियो को ट्रैश में भेजें?",
    "moveToTrashDescription": "वीडियो SHOBDO से हट जाएगा, लेकिन आप इसे बाद में वीडियो ट्रैश से पुनर्स्थापित कर सकते हैं।",
    "moveToTrashError": "वीडियो को ट्रैश में नहीं भेजा जा सका।",
    "movedToTrash": "वीडियो ट्रैश में भेज दिया गया।",
    "restoreError": "वीडियो पुनर्स्थापित नहीं किया जा सका।",
    "restored": "वीडियो सफलतापूर्वक पुनर्स्थापित हुआ।",
    "permanentDeletion": "स्थायी हटाना",
    "permanentDeleteTitle": "वीडियो को स्थायी रूप से हटाएँ?",
    "permanentDeleteDescription": "यह वीडियो को SHOBDO से स्थायी रूप से हटाएगा और संग्रहित मीडिया भी मिटा देगा। यह कार्रवाई वापस नहीं की जा सकती।",
    "permanentDeleteError": "वीडियो स्थायी रूप से नहीं हटाया जा सका।",
    "permanentlyDeleted": "वीडियो स्थायी रूप से हटा दिया गया।",
    "cancel": "रद्द करें",
    "close": "बंद करें",
    "defaultReelTitle": "SHOBDO रील",
    "untitledVideo": "बिना शीर्षक का वीडियो"
  },
  "as": {
    "eyebrow": "SHOBDO মিডিয়া",
    "title": "ভিডিঅ'",
    "description": "ভিডিঅ' চাওক, ৰিলছ আৱিষ্কাৰ কৰক আৰু আপুনি অনুসৰণ কৰা স্ৰষ্টাসকলৰ নতুন কনটেন্টৰ সৈতে সংযুক্ত থাকক।",
    "addVideo": "ভিডিঅ' যোগ কৰক",
    "createReel": "ৰিল তৈয়াৰ কৰক",
    "videos": "ভিডিঅ'",
    "reels": "ৰিলছ",
    "following": "অনুসৰণ",
    "communityFeed": "কমিউনিটি ফিড",
    "latestVideos": "শেহতীয়া ভিডিঅ'",
    "yourNetwork": "আপোনাৰ নেটৱৰ্ক",
    "fromPeopleYouFollow": "আপুনি অনুসৰণ কৰা লোকসকলৰ পৰা",
    "yourLibrary": "আপোনাৰ লাইব্ৰেৰী",
    "videoTrash": "ভিডিঅ' ট্রেশ",
    "trash": "ট্রেশ",
    "backToVideos": "ভিডিঅ'লৈ উভতি যাওক",
    "refresh": "ৰিফ্ৰেছ",
    "loading": "ভিডিঅ' লোড হৈ আছে...",
    "loadingTrash": "ভিডিঅ' ট্রেশ লোড হৈ আছে...",
    "unavailable": "ভিডিঅ' লোড কৰিব পৰা নগ'ল",
    "trashUnavailable": "ভিডিঅ' ট্রেশ লোড কৰিব পৰা নগ'ল",
    "tryAgain": "পুনৰ চেষ্টা কৰক",
    "noVideos": "এতিয়াও কোনো ভিডিঅ' নাই",
    "noVideosDescription": "SHOBDO কমিউনিটিত প্ৰথম ভিডিঅ'টো শ্বেয়াৰ কৰক।",
    "noFollowingMedia": "ইয়াত এতিয়াও কোনো ভিডিঅ' বা ৰিল নাই",
    "noFollowingMediaDescription": "স্ৰষ্টাসকলক অনুসৰণ কৰক আৰু তেওঁলোকৰ নতুন ভিডিঅ' আৰু ৰিল ইয়াত চাওক।",
    "trashEmpty": "ভিডিঅ' ট্রেশ খালী",
    "trashEmptyDescription": "ট্রেশলৈ পঠোৱা ভিডিঅ'সমূহ পুনৰুদ্ধাৰ বা স্থায়ীভাৱে মচি নোপোৱালৈকে ইয়াত থাকিব।",
    "inTrash": "ট্রেশত",
    "you": "আপুনি",
    "trashed": "ট্রেশত",
    "reel": "ৰিল",
    "video": "ভিডিঅ'",
    "moreOptions": "অধিক বিকল্প",
    "restore": "পুনৰুদ্ধাৰ",
    "restoring": "পুনৰুদ্ধাৰ হৈ আছে...",
    "deletePermanently": "স্থায়ীভাৱে মচক",
    "deletingPermanently": "মচি থকা হৈছে...",
    "share": "শ্বেয়াৰ",
    "copyLink": "লিংক কপি কৰক",
    "moveToTrash": "ট্রেশলৈ পঠাওক",
    "movingToTrash": "পঠোৱা হৈছে...",
    "mediaUnavailable": "ভিডিঅ' উপলভ্য নহয়",
    "views": "ভিউ",
    "loadError": "ভিডিঅ' লোড কৰিব পৰা নগ'ল।",
    "followingLoadError": "আপুনি অনুসৰণ কৰা লোকসকলৰ মিডিয়া লোড কৰিব পৰা নগ'ল।",
    "trashLoadError": "ভিডিঅ' ট্রেশ লোড কৰিব পৰা নগ'ল।",
    "shareReelText": "SHOBDO-ত এই ৰিলটো চাওক।",
    "shareVideoText": "SHOBDO-ত এই ভিডিঅ'টো চাওক।",
    "linkCopied": "লিংক কপি হৈছে।",
    "copyThisLink": "এই লিংকটো কপি কৰক:",
    "moveToTrashTitle": "ভিডিঅ'টো ট্রেশলৈ পঠাবনে?",
    "moveToTrashDescription": "ভিডিঅ'টো SHOBDO-ৰ পৰা আঁতৰি যাব, কিন্তু পাছত ভিডিঅ' ট্রেশৰ পৰা পুনৰুদ্ধাৰ কৰিব পাৰিব।",
    "moveToTrashError": "ভিডিঅ'টো ট্রেশলৈ পঠাব পৰা নগ'ল।",
    "movedToTrash": "ভিডিঅ'টো ট্রেশলৈ পঠোৱা হৈছে।",
    "restoreError": "ভিডিঅ'টো পুনৰুদ্ধাৰ কৰিব পৰা নগ'ল।",
    "restored": "ভিডিঅ'টো সফলভাৱে পুনৰুদ্ধাৰ কৰা হৈছে।",
    "permanentDeletion": "স্থায়ীভাৱে মচা",
    "permanentDeleteTitle": "ভিডিঅ'টো স্থায়ীভাৱে মচিবনে?",
    "permanentDeleteDescription": "ইয়াৰ ফলত ভিডিঅ'টো SHOBDO-ৰ পৰা স্থায়ীভাৱে মচি যাব আৰু সংৰক্ষিত মিডিয়াও মচি যাব। এই কাম পুনৰ ঘূৰাই আনিব নোৱাৰি।",
    "permanentDeleteError": "ভিডিঅ'টো স্থায়ীভাৱে মচিব পৰা নগ'ল।",
    "permanentlyDeleted": "ভিডিঅ'টো স্থায়ীভাৱে মচি দিয়া হৈছে।",
    "cancel": "বাতিল",
    "close": "বন্ধ কৰক",
    "defaultReelTitle": "SHOBDO ৰিল",
    "untitledVideo": "শিৰোনামহীন ভিডিঅ'"
  },
  "or": {
    "eyebrow": "SHOBDO ମିଡିଆ",
    "title": "ଭିଡିଓ",
    "description": "ଭିଡିଓ ଦେଖନ୍ତୁ, ରିଲ୍ସ ଖୋଜନ୍ତୁ ଏବଂ ଆପଣ ଅନୁସରଣ କରୁଥିବା ସୃଷ୍ଟାମାନଙ୍କର ନୂଆ କଣ୍ଟେଣ୍ଟ ସହିତ ଯୋଡ଼ିତ ରୁହନ୍ତୁ।",
    "addVideo": "ଭିଡିଓ ଯୋଡ଼ନ୍ତୁ",
    "createReel": "ରିଲ୍ ତିଆରି କରନ୍ତୁ",
    "videos": "ଭିଡିଓ",
    "reels": "ରିଲ୍ସ",
    "following": "ଅନୁସରଣ",
    "communityFeed": "କମ୍ୟୁନିଟି ଫିଡ୍",
    "latestVideos": "ସବୁଠାରୁ ନୂଆ ଭିଡିଓ",
    "yourNetwork": "ଆପଣଙ୍କ ନେଟୱର୍କ",
    "fromPeopleYouFollow": "ଆପଣ ଅନୁସରଣ କରୁଥିବା ଲୋକମାନଙ୍କଠାରୁ",
    "yourLibrary": "ଆପଣଙ୍କ ଲାଇବ୍ରେରୀ",
    "videoTrash": "ଭିଡିଓ ଟ୍ରାଶ୍",
    "trash": "ଟ୍ରାଶ୍",
    "backToVideos": "ଭିଡିଓକୁ ଫେରନ୍ତୁ",
    "refresh": "ରିଫ୍ରେଶ୍",
    "loading": "ଭିଡିଓ ଲୋଡ୍ ହେଉଛି...",
    "loadingTrash": "ଭିଡିଓ ଟ୍ରାଶ୍ ଲୋଡ୍ ହେଉଛି...",
    "unavailable": "ଭିଡିଓ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ",
    "trashUnavailable": "ଭିଡିଓ ଟ୍ରାଶ୍ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ",
    "tryAgain": "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
    "noVideos": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଭିଡିଓ ନାହିଁ",
    "noVideosDescription": "SHOBDO କମ୍ୟୁନିଟିରେ ପ୍ରଥମ ଭିଡିଓଟି ଶେୟାର୍ କରନ୍ତୁ।",
    "noFollowingMedia": "ଏଠାରେ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଭିଡିଓ କିମ୍ବା ରିଲ୍ ନାହିଁ",
    "noFollowingMediaDescription": "ସୃଷ୍ଟାମାନଙ୍କୁ ଅନୁସରଣ କରନ୍ତୁ ଏବଂ ସେମାନଙ୍କର ନୂଆ ଭିଡିଓ ଓ ରିଲ୍ସ ଏଠାରେ ଦେଖନ୍ତୁ।",
    "trashEmpty": "ଭିଡିଓ ଟ୍ରାଶ୍ ଖାଲି",
    "trashEmptyDescription": "ଟ୍ରାଶ୍‌କୁ ପଠାଇଥିବା ଭିଡିଓଗୁଡ଼ିକ ପୁନରୁଦ୍ଧାର କିମ୍ବା ସ୍ଥାୟୀଭାବେ ଡିଲିଟ୍ କରିବା ପର୍ଯ୍ୟନ୍ତ ଏଠାରେ ରହିବ।",
    "inTrash": "ଟ୍ରାଶ୍‌ରେ",
    "you": "ଆପଣ",
    "trashed": "ଟ୍ରାଶ୍‌ରେ",
    "reel": "ରିଲ୍",
    "video": "ଭିଡିଓ",
    "moreOptions": "ଅଧିକ ବିକଳ୍ପ",
    "restore": "ପୁନରୁଦ୍ଧାର",
    "restoring": "ପୁନରୁଦ୍ଧାର ହେଉଛି...",
    "deletePermanently": "ସ୍ଥାୟୀଭାବେ ଡିଲିଟ୍ କରନ୍ତୁ",
    "deletingPermanently": "ଡିଲିଟ୍ ହେଉଛି...",
    "share": "ଶେୟାର୍",
    "copyLink": "ଲିଙ୍କ କପି କରନ୍ତୁ",
    "moveToTrash": "ଟ୍ରାଶ୍‌କୁ ପଠାନ୍ତୁ",
    "movingToTrash": "ପଠାଯାଉଛି...",
    "mediaUnavailable": "ଭିଡିଓ ଉପଲବ୍ଧ ନାହିଁ",
    "views": "ଭ୍ୟୁ",
    "loadError": "ଭିଡିଓ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    "followingLoadError": "ଆପଣ ଅନୁସରଣ କରୁଥିବା ଲୋକମାନଙ୍କର ମିଡିଆ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    "trashLoadError": "ଭିଡିଓ ଟ୍ରାଶ୍ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    "shareReelText": "SHOBDO-ରେ ଏହି ରିଲ୍ ଦେଖନ୍ତୁ।",
    "shareVideoText": "SHOBDO-ରେ ଏହି ଭିଡିଓ ଦେଖନ୍ତୁ।",
    "linkCopied": "ଲିଙ୍କ କପି ହୋଇଛି।",
    "copyThisLink": "ଏହି ଲିଙ୍କ କପି କରନ୍ତୁ:",
    "moveToTrashTitle": "ଭିଡିଓଟି ଟ୍ରାଶ୍‌କୁ ପଠାଇବେ?",
    "moveToTrashDescription": "ଭିଡିଓଟି SHOBDOରୁ ହଟିଯିବ, କିନ୍ତୁ ପରେ ଭିଡିଓ ଟ୍ରାଶ୍‌ରୁ ପୁନରୁଦ୍ଧାର କରିପାରିବେ।",
    "moveToTrashError": "ଭିଡିଓଟି ଟ୍ରାଶ୍‌କୁ ପଠାଇପାରିଲା ନାହିଁ।",
    "movedToTrash": "ଭିଡିଓଟି ଟ୍ରାଶ୍‌କୁ ପଠାଯାଇଛି।",
    "restoreError": "ଭିଡିଓଟି ପୁନରୁଦ୍ଧାର ହୋଇପାରିଲା ନାହିଁ।",
    "restored": "ଭିଡିଓଟି ସଫଳତାର ସହ ପୁନରୁଦ୍ଧାର ହୋଇଛି।",
    "permanentDeletion": "ସ୍ଥାୟୀ ଡିଲିଟ୍",
    "permanentDeleteTitle": "ଭିଡିଓଟି ସ୍ଥାୟୀଭାବେ ଡିଲିଟ୍ କରିବେ?",
    "permanentDeleteDescription": "ଏହା ଭିଡିଓଟିକୁ SHOBDOରୁ ସ୍ଥାୟୀଭାବେ ହଟାଇବ ଏବଂ ସଞ୍ଚିତ ମିଡିଆକୁ ମଧ୍ୟ ଡିଲିଟ୍ କରିଦେବ। ଏହି କାର୍ଯ୍ୟ ପଛକୁ ଫେରାଇହେବ ନାହିଁ।",
    "permanentDeleteError": "ଭିଡିଓଟି ସ୍ଥାୟୀଭାବେ ଡିଲିଟ୍ ହୋଇପାରିଲା ନାହିଁ।",
    "permanentlyDeleted": "ଭିଡିଓଟି ସ୍ଥାୟୀଭାବେ ଡିଲିଟ୍ ହୋଇଛି।",
    "cancel": "ବାତିଲ୍",
    "close": "ବନ୍ଦ କରନ୍ତୁ",
    "defaultReelTitle": "SHOBDO ରିଲ୍",
    "untitledVideo": "ଶିରୋନାମହୀନ ଭିଡିଓ"
  },
  "ta": {
    "eyebrow": "SHOBDO மீடியா",
    "title": "வீடியோ",
    "description": "வீடியோக்களைப் பாருங்கள், ரீல்ஸை கண்டறியுங்கள், நீங்கள் பின்தொடரும் படைப்பாளர்களின் புதிய உள்ளடக்கத்துடன் இணைந்திருங்கள்.",
    "addVideo": "வீடியோ சேர்க்கவும்",
    "createReel": "ரீல் உருவாக்கவும்",
    "videos": "வீடியோக்கள்",
    "reels": "ரீல்ஸ்",
    "following": "பின்தொடர்பவை",
    "communityFeed": "சமூக ஃபீடு",
    "latestVideos": "சமீபத்திய வீடியோக்கள்",
    "yourNetwork": "உங்கள் நெட்வொர்க்",
    "fromPeopleYouFollow": "நீங்கள் பின்தொடர்பவர்களிடமிருந்து",
    "yourLibrary": "உங்கள் நூலகம்",
    "videoTrash": "வீடியோ குப்பை",
    "trash": "குப்பை",
    "backToVideos": "வீடியோக்களுக்கு திரும்பவும்",
    "refresh": "புதுப்பிக்கவும்",
    "loading": "வீடியோக்கள் ஏற்றப்படுகின்றன...",
    "loadingTrash": "வீடியோ குப்பை ஏற்றப்படுகிறது...",
    "unavailable": "வீடியோக்களை ஏற்ற முடியவில்லை",
    "trashUnavailable": "வீடியோ குப்பையை ஏற்ற முடியவில்லை",
    "tryAgain": "மீண்டும் முயற்சிக்கவும்",
    "noVideos": "இன்னும் வீடியோக்கள் இல்லை",
    "noVideosDescription": "SHOBDO சமூகத்தில் முதல் வீடியோவைப் பகிருங்கள்.",
    "noFollowingMedia": "இங்கே இன்னும் வீடியோக்கள் அல்லது ரீல்ஸ் இல்லை",
    "noFollowingMediaDescription": "படைப்பாளர்களைப் பின்தொடர்ந்து அவர்களின் புதிய வீடியோக்கள் மற்றும் ரீல்ஸை இங்கே பாருங்கள்.",
    "trashEmpty": "வீடியோ குப்பை காலியாக உள்ளது",
    "trashEmptyDescription": "குப்பைக்கு அனுப்பிய வீடியோக்கள் மீட்டெடுக்கப்படும் அல்லது நிரந்தரமாக நீக்கப்படும் வரை இங்கே இருக்கும்.",
    "inTrash": "குப்பையில்",
    "you": "நீங்கள்",
    "trashed": "குப்பையில்",
    "reel": "ரீல்",
    "video": "வீடியோ",
    "moreOptions": "மேலும் விருப்பங்கள்",
    "restore": "மீட்டெடுக்கவும்",
    "restoring": "மீட்டெடுக்கப்படுகிறது...",
    "deletePermanently": "நிரந்தரமாக நீக்கவும்",
    "deletingPermanently": "நீக்கப்படுகிறது...",
    "share": "பகிர்",
    "copyLink": "இணைப்பை நகலெடுக்கவும்",
    "moveToTrash": "குப்பைக்கு அனுப்பவும்",
    "movingToTrash": "அனுப்பப்படுகிறது...",
    "mediaUnavailable": "வீடியோ கிடைக்கவில்லை",
    "views": "பார்வைகள்",
    "loadError": "வீடியோக்களை ஏற்ற முடியவில்லை.",
    "followingLoadError": "நீங்கள் பின்தொடர்பவர்களின் மீடியாவை ஏற்ற முடியவில்லை.",
    "trashLoadError": "வீடியோ குப்பையை ஏற்ற முடியவில்லை.",
    "shareReelText": "SHOBDO-வில் இந்த ரீலைப் பாருங்கள்.",
    "shareVideoText": "SHOBDO-வில் இந்த வீடியோவைப் பாருங்கள்.",
    "linkCopied": "இணைப்பு நகலெடுக்கப்பட்டது.",
    "copyThisLink": "இந்த இணைப்பை நகலெடுக்கவும்:",
    "moveToTrashTitle": "வீடியோவை குப்பைக்கு அனுப்பவா?",
    "moveToTrashDescription": "வீடியோ SHOBDO-வில் இருந்து மறையும்; ஆனால் பின்னர் வீடியோ குப்பையிலிருந்து மீட்டெடுக்கலாம்.",
    "moveToTrashError": "வீடியோவை குப்பைக்கு அனுப்ப முடியவில்லை.",
    "movedToTrash": "வீடியோ குப்பைக்கு அனுப்பப்பட்டது.",
    "restoreError": "வீடியோவை மீட்டெடுக்க முடியவில்லை.",
    "restored": "வீடியோ வெற்றிகரமாக மீட்டெடுக்கப்பட்டது.",
    "permanentDeletion": "நிரந்தர நீக்கம்",
    "permanentDeleteTitle": "வீடியோவை நிரந்தரமாக நீக்கவா?",
    "permanentDeleteDescription": "இது வீடியோவை SHOBDO-வில் இருந்து நிரந்தரமாக நீக்கி, சேமிக்கப்பட்ட மீடியாவையும் அழிக்கும். இந்த செயலை மீட்டெடுக்க முடியாது.",
    "permanentDeleteError": "வீடியோவை நிரந்தரமாக நீக்க முடியவில்லை.",
    "permanentlyDeleted": "வீடியோ நிரந்தரமாக நீக்கப்பட்டது.",
    "cancel": "ரத்து",
    "close": "மூடு",
    "defaultReelTitle": "SHOBDO ரீல்",
    "untitledVideo": "தலைப்பில்லா வீடியோ"
  },
  "te": {
    "eyebrow": "SHOBDO మీడియా",
    "title": "వీడియో",
    "description": "వీడియోలు చూడండి, రీల్స్‌ను కనుగొనండి, మీరు ఫాలో అయ్యే సృష్టికర్తల కొత్త కంటెంట్‌తో కనెక్ట్‌గా ఉండండి.",
    "addVideo": "వీడియో జోడించండి",
    "createReel": "రీల్ సృష్టించండి",
    "videos": "వీడియోలు",
    "reels": "రీల్స్",
    "following": "ఫాలోయింగ్",
    "communityFeed": "కమ్యూనిటీ ఫీడ్",
    "latestVideos": "తాజా వీడియోలు",
    "yourNetwork": "మీ నెట్‌వర్క్",
    "fromPeopleYouFollow": "మీరు ఫాలో అయ్యే వారి నుండి",
    "yourLibrary": "మీ లైబ్రరీ",
    "videoTrash": "వీడియో ట్రాష్",
    "trash": "ట్రాష్",
    "backToVideos": "వీడియోలకు తిరిగి వెళ్లండి",
    "refresh": "రిఫ్రెష్",
    "loading": "వీడియోలు లోడ్ అవుతున్నాయి...",
    "loadingTrash": "వీడియో ట్రాష్ లోడ్ అవుతోంది...",
    "unavailable": "వీడియోలను లోడ్ చేయలేకపోయాం",
    "trashUnavailable": "వీడియో ట్రాష్‌ను లోడ్ చేయలేకపోయాం",
    "tryAgain": "మళ్లీ ప్రయత్నించండి",
    "noVideos": "ఇంకా వీడియోలు లేవు",
    "noVideosDescription": "SHOBDO కమ్యూనిటీలో మొదటి వీడియోను షేర్ చేయండి.",
    "noFollowingMedia": "ఇక్కడ ఇంకా వీడియోలు లేదా రీల్స్ లేవు",
    "noFollowingMediaDescription": "సృష్టికర్తలను ఫాలో అవ్వండి మరియు వారి తాజా వీడియోలు, రీల్స్‌ను ఇక్కడ చూడండి.",
    "trashEmpty": "వీడియో ట్రాష్ ఖాళీగా ఉంది",
    "trashEmptyDescription": "ట్రాష్‌కు పంపిన వీడియోలు మీరు వాటిని పునరుద్ధరించే వరకు లేదా శాశ్వతంగా తొలగించే వరకు ఇక్కడ కనిపిస్తాయి.",
    "inTrash": "ట్రాష్‌లో",
    "you": "మీరు",
    "trashed": "ట్రాష్‌లో",
    "reel": "రీల్",
    "video": "వీడియో",
    "moreOptions": "మరిన్ని ఎంపికలు",
    "restore": "పునరుద్ధరించండి",
    "restoring": "పునరుద్ధరిస్తోంది...",
    "deletePermanently": "శాశ్వతంగా తొలగించండి",
    "deletingPermanently": "తొలగిస్తోంది...",
    "share": "షేర్",
    "copyLink": "లింక్ కాపీ చేయండి",
    "moveToTrash": "ట్రాష్‌కు పంపండి",
    "movingToTrash": "పంపుతోంది...",
    "mediaUnavailable": "వీడియో అందుబాటులో లేదు",
    "views": "వ్యూస్",
    "loadError": "వీడియోలను లోడ్ చేయలేకపోయాం.",
    "followingLoadError": "మీరు ఫాలో అయ్యే వారి మీడియాను లోడ్ చేయలేకపోయాం.",
    "trashLoadError": "వీడియో ట్రాష్‌ను లోడ్ చేయలేకపోయాం.",
    "shareReelText": "SHOBDOలో ఈ రీల్ చూడండి.",
    "shareVideoText": "SHOBDOలో ఈ వీడియో చూడండి.",
    "linkCopied": "లింక్ కాపీ అయింది.",
    "copyThisLink": "ఈ లింక్‌ను కాపీ చేయండి:",
    "moveToTrashTitle": "వీడియోను ట్రాష్‌కు పంపాలా?",
    "moveToTrashDescription": "వీడియో SHOBDO నుంచి కనిపించదు, కానీ తర్వాత వీడియో ట్రాష్ నుంచి పునరుద్ధరించవచ్చు.",
    "moveToTrashError": "వీడియోను ట్రాష్‌కు పంపలేకపోయాం.",
    "movedToTrash": "వీడియో ట్రాష్‌కు పంపబడింది.",
    "restoreError": "వీడియోను పునరుద్ధరించలేకపోయాం.",
    "restored": "వీడియో విజయవంతంగా పునరుద్ధరించబడింది.",
    "permanentDeletion": "శాశ్వత తొలగింపు",
    "permanentDeleteTitle": "వీడియోను శాశ్వతంగా తొలగించాలా?",
    "permanentDeleteDescription": "ఇది వీడియోను SHOBDO నుంచి శాశ్వతంగా తొలగించి, నిల్వ చేసిన మీడియాను కూడా తొలగిస్తుంది. ఈ చర్యను తిరిగి మార్చలేరు.",
    "permanentDeleteError": "వీడియోను శాశ్వతంగా తొలగించలేకపోయాం.",
    "permanentlyDeleted": "వీడియో శాశ్వతంగా తొలగించబడింది.",
    "cancel": "రద్దు",
    "close": "మూసివేయండి",
    "defaultReelTitle": "SHOBDO రీల్",
    "untitledVideo": "శీర్షిక లేని వీడియో"
  }
};


// =========================================================
// TOKEN
// =========================================================

function getToken() {

  try {

    return (
      window.localStorage.getItem(
        TOKEN_KEY
      ) || ""
    );

  } catch {

    return "";

  }

}


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  {
    method = "GET",
    authenticated = false,
    signal,
  } = {}
) {

  const headers = {
    Accept:
      "application/json",
  };


  if (authenticated) {

    const token =
      getToken();


    if (token) {

      headers.Authorization =
        `Bearer ${token}`;

    }

  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        method,
        headers,
        signal,
      }
    );


  let data = {};


  try {

    data =
      await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
        data?.error ||
        data?.detail ||
        `Request failed with status ${response.status}.`
      );


    error.status =
      response.status;

    error.data =
      data;


    throw error;

  }


  return data;

}


// =========================================================
// HELPERS
// =========================================================

function absoluteMediaUrl(
  value
) {

  const url =
    String(
      value || ""
    )
      .trim();


  if (!url) {

    return "";

  }


  if (
    url.startsWith(
      "http://"
    ) ||
    url.startsWith(
      "https://"
    ) ||
    url.startsWith(
      "blob:"
    ) ||
    url.startsWith(
      "data:"
    )
  ) {

    return url;

  }


  if (
    url.startsWith("/")
  ) {

    return (
      `${API_ORIGIN}${url}`
    );

  }


  return (
    `${API_ORIGIN}/${url}`
  );

}


// =========================================================

function getCreator(
  item
) {

  return (
    item?.creator ||
    item?.user ||
    item?.author ||
    item?.owner ||
    {}
  );

}


// =========================================================

function getOwnerId(
  item
) {

  const creator =
    getCreator(
      item
    );


  return (
    item?.user_id ??
    item?.creator_id ??
    item?.owner_id ??
    item?.author_id ??
    creator?.id ??
    creator?.user_id ??
    null
  );

}


// =========================================================

function isOwnItem(
  item,
  user
) {

  if (
    !item ||
    !user
  ) {

    return false;

  }


  if (
    item.is_owner === true ||
    item.is_mine === true ||
    item.owned_by_current_user ===
      true
  ) {

    return true;

  }


  const ownerId =
    Number(
      getOwnerId(
        item
      )
    );


  const currentUserId =
    Number(
      user?.id
    );


  return (
    Number.isFinite(
      ownerId
    ) &&
    Number.isFinite(
      currentUserId
    ) &&
    ownerId ===
      currentUserId
  );

}


// =========================================================

function getCreatorName(
  item
) {

  const creator =
    getCreator(
      item
    );


  return (
    creator?.name ||
    creator?.full_name ||
    creator?.display_name ||
    item?.user_name ||
    item?.creator_name ||
    item?.author_name ||
    "SHOBDO Creator"
  );

}


// =========================================================

function getCreatorAvatar(
  item
) {

  const creator =
    getCreator(
      item
    );


  const avatar =
    creator?.avatar_url ||
    creator?.profile_picture ||
    creator?.profile_image ||
    creator?.avatar ||
    item?.user_avatar ||
    item?.creator_avatar ||
    "";


  return absoluteMediaUrl(
    avatar
  );

}


// =========================================================

function getInitials(
  name
) {

  const safeName =
    String(
      name || ""
    )
      .trim();


  if (!safeName) {

    return "S";

  }


  const parts =
    safeName
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();

  }


  return (
    `${parts[0][0]}${parts[1][0]}`
      .toUpperCase()
  );

}


// =========================================================

function getMediaSource(
  item
) {

  return absoluteMediaUrl(
    item?.video_url ||
    item?.media_url ||
    item?.playback_url ||
    item?.file_url ||
    item?.video ||
    item?.url ||
    ""
  );

}


// =========================================================

function getPoster(
  item
) {

  return absoluteMediaUrl(
    item?.thumbnail_url ||
    item?.poster_url ||
    item?.cover_url ||
    item?.preview_url ||
    ""
  );

}


// =========================================================

function getTitle(
  item,
  type,
  t
) {

  if (
    item?.title
  ) {

    return item.title;

  }


  if (
    item?.caption
  ) {

    const caption =
      String(
        item.caption
      )
        .trim();


    if (
      caption.length <=
      90
    ) {

      return caption;

    }


    return (
      `${caption.slice(
        0,
        87
      )}...`
    );

  }


  return (
    type === "reel"
      ? t(
          "videos.defaultReelTitle",
          "SHOBDO Reel"
        )
      : t(
          "videos.untitledVideo",
          "Untitled video"
        )
  );

}


// =========================================================

function getDescription(
  item
) {

  const description =
    item?.description ||
    item?.caption ||
    "";


  const title =
    item?.title ||
    "";


  if (
    description ===
    title
  ) {

    return "";

  }


  return String(
    description || ""
  )
    .trim();

}


// =========================================================

function getCreatedAt(
  item
) {

  return (
    item?.published_at ||
    item?.created_at ||
    item?.uploaded_at ||
    item?.updated_at ||
    null
  );

}


// =========================================================

function formatDate(
  value,
  language
) {

  if (!value) {

    return "";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  const localeMap = {

    bn:
      "bn-IN",

    hi:
      "hi-IN",

    en:
      "en-IN",

    as:
      "as-IN",

    or:
      "or-IN",

    ta:
      "ta-IN",

    te:
      "te-IN",

  };


  try {

    return new Intl.DateTimeFormat(
      localeMap[
        language
      ] ||
      "en-IN",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    ).format(
      date
    );

  } catch {

    return date
      .toLocaleDateString();

  }

}


// =========================================================

function formatDuration(
  value
) {

  const seconds =
    Math.max(
      0,
      Math.round(
        Number(
          value
        ) || 0
      )
    );


  if (!seconds) {

    return "";

  }


  const hours =
    Math.floor(
      seconds /
      3600
    );


  const minutes =
    Math.floor(
      (
        seconds %
        3600
      ) /
      60
    );


  const remainingSeconds =
    seconds %
    60;


  if (
    hours > 0
  ) {

    return (
      `${hours}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        remainingSeconds
      ).padStart(
        2,
        "0"
      )}`
    );

  }


  return (
    `${minutes}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`
  );

}


// =========================================================

function getViews(
  item
) {

  return Number(
    item?.views_count ??
    item?.view_count ??
    item?.views ??
    0
  ) || 0;

}


// =========================================================

function getLanguageLabel(
  value
) {

  const language =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();


  const labels = {

    bn:
      "বাংলা",

    hi:
      "हिन्दी",

    en:
      "English",

    as:
      "অসমীয়া",

    or:
      "ଓଡ଼ିଆ",

    ta:
      "தமிழ்",

    te:
      "తెలుగు",

  };


  return (
    labels[
      language
    ] ||
    ""
  );

}


// =========================================================
// CREATOR AVATAR
// =========================================================

function CreatorAvatar({
  item,
}) {

  const creatorName =
    getCreatorName(
      item
    );


  const avatar =
    getCreatorAvatar(
      item
    );


  if (avatar) {

    return (

      <img
        className="shobdo-video-avatar"
        src={avatar}
        alt=""
        loading="lazy"
      />

    );

  }


  return (

    <div
      className="shobdo-video-avatar shobdo-video-avatar-fallback"
      aria-hidden="true"
    >

      {getInitials(
        creatorName
      )}

    </div>

  );

}


// =========================================================
// VIDEO CARD
// =========================================================

function VideoCard({
  item,
  type = "video",
  user,
  language,
  menuOpen,
  deleting,
  restoring,
  permanentlyDeleting,
  trashMode = false,
  onToggleMenu,
  onDelete,
  onRestore,
  onPermanentDelete,
  onShare,
  onCopy,
  onPlay,
  t,
}) {

  const source =
    getMediaSource(
      item
    );


  const poster =
    getPoster(
      item
    );


  const creatorName =
    getCreatorName(
      item
    );


  const createdAt =
    formatDate(
      trashMode
        ? (
            item?.deleted_at ||
            getCreatedAt(
              item
            )
          )
        : getCreatedAt(
            item
          ),
      language
    );


  const own =
    trashMode ||
    (
      type === "video" &&
      isOwnItem(
        item,
        user
      )
    );


  const title =
    getTitle(
      item,
      type,
      t
    );


  const description =
    getDescription(
      item
    );


  const views =
    getViews(
      item
    );


  const duration =
    formatDuration(
      item?.duration_seconds ||
      item?.duration
    );


  const languageLabel =
    getLanguageLabel(
      item?.language
    );


  const busy =
    Boolean(
      deleting ||
      restoring ||
      permanentlyDeleting
    );


  return (

    <article
      className="shobdo-video-post"
    >

      {/* ===============================================
          POST HEADER
      ================================================ */}

      <header
        className="shobdo-video-post-header"
      >

        <div
          className="shobdo-video-author"
        >

          <CreatorAvatar
            item={item}
          />


          <div
            className="shobdo-video-author-copy"
          >

            <div
              className="shobdo-video-author-name-row"
            >

              <strong>
                {creatorName}
              </strong>


              {own && (

                <span
                  className="shobdo-video-owner-badge"
                >
                  {trashMode
                    ? t(
                        "videos.inTrash",
                        "In Trash"
                      )
                    : t(
                        "videos.you",
                        "You"
                      )}
                </span>

              )}

            </div>


            <div
              className="shobdo-video-post-meta"
            >

              {createdAt && (

                <span>
                  {createdAt}
                </span>

              )}


              {createdAt && (

                <span
                  aria-hidden="true"
                >
                  ·
                </span>

              )}


              <span
                className="shobdo-video-visibility"
              >

                {trashMode
                  ? (
                      <Trash2
                        size={13}
                      />
                    )
                  : (
                      <Globe2
                        size={13}
                      />
                    )}


                {trashMode
                  ? t(
                      "videos.trashed",
                      "Trashed"
                    )
                  : type === "reel"
                    ? t(
                        "videos.reel",
                        "Reel"
                      )
                    : t(
                        "videos.video",
                        "Video"
                      )}

              </span>

            </div>

          </div>

        </div>


        <div
          className="shobdo-video-menu-shell"
          onClick={
            (
              event
            ) =>
              event
                .stopPropagation()
          }
        >

          <button
            type="button"
            className={
              menuOpen
                ? "shobdo-video-menu-trigger active"
                : "shobdo-video-menu-trigger"
            }
            aria-label={t(
              "videos.moreOptions",
              "More options"
            )}
            aria-expanded={
              menuOpen
            }
            onClick={
              onToggleMenu
            }
          >

            <MoreHorizontal
              size={22}
            />

          </button>


          {menuOpen && (

            <div
              className="shobdo-video-menu"
              role="menu"
            >

              {trashMode
                ? (
                    <>

                      <button
                        type="button"
                        role="menuitem"
                        disabled={
                          busy
                        }
                        onClick={
                          () =>
                            onRestore(
                              item
                            )
                        }
                      >

                        {restoring
                          ? (
                              <LoaderCircle
                                size={17}
                                className="shobdo-video-spin"
                              />
                            )
                          : (
                              <RotateCcw
                                size={17}
                              />
                            )}


                        <span>
                          {restoring
                            ? t(
                                "videos.restoring",
                                "Restoring..."
                              )
                            : t(
                                "videos.restore",
                                "Restore video"
                              )}
                        </span>

                      </button>


                      <div
                        className="shobdo-video-menu-divider"
                      />


                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        disabled={
                          busy
                        }
                        onClick={
                          () =>
                            onPermanentDelete(
                              item
                            )
                        }
                      >

                        <Trash2
                          size={17}
                        />

                        <span>
                          {t(
                            "videos.deletePermanently",
                            "Delete permanently"
                          )}
                        </span>

                      </button>

                    </>
                  )
                : (
                    <>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={
                          onShare
                        }
                      >

                        <Share2
                          size={17}
                        />

                        <span>
                          {t(
                            "videos.share",
                            "Share"
                          )}
                        </span>

                      </button>


                      <button
                        type="button"
                        role="menuitem"
                        onClick={
                          onCopy
                        }
                      >

                        <Link2
                          size={17}
                        />

                        <span>
                          {t(
                            "videos.copyLink",
                            "Copy link"
                          )}
                        </span>

                      </button>


                      {own && (

                        <>

                          <div
                            className="shobdo-video-menu-divider"
                          />


                          <button
                            type="button"
                            role="menuitem"
                            className="danger"
                            disabled={
                              deleting
                            }
                            onClick={
                              () =>
                                onDelete(
                                  item
                                )
                            }
                          >

                            {deleting
                              ? (
                                  <LoaderCircle
                                    size={17}
                                    className="shobdo-video-spin"
                                  />
                                )
                              : (
                                  <Trash2
                                    size={17}
                                  />
                                )}


                            <span>
                              {deleting
                                ? t(
                                    "videos.movingToTrash",
                                    "Moving..."
                                  )
                                : t(
                                    "videos.moveToTrash",
                                    "Move to Trash"
                                  )}
                            </span>

                          </button>

                        </>

                      )}

                    </>
                  )}

            </div>

          )}

        </div>

      </header>


      {/* ===============================================
          TITLE / DESCRIPTION
      ================================================ */}

      <div
        className="shobdo-video-post-copy"
      >

        <h2>
          {title}
        </h2>


        {description && (

          <p>
            {description}
          </p>

        )}

      </div>


      {/* ===============================================
          MEDIA
      ================================================ */}

      {source
        ? (

            <div
              className={
                type === "reel"
                  ? "shobdo-video-media shobdo-video-media-reel"
                  : "shobdo-video-media"
              }
            >

              <video
                controls
                playsInline
                preload="metadata"
                poster={
                  poster ||
                  undefined
                }
                src={source}
                onPlay={
                  () => {

                    if (
                      !trashMode
                    ) {

                      onPlay(
                        item,
                        type
                      );

                    }

                  }
                }
              />

            </div>

          )
        : (

            <div
              className="shobdo-video-media-missing"
            >

              <Film
                size={30}
              />

              <span>
                {t(
                  "videos.mediaUnavailable",
                  "Video unavailable"
                )}
              </span>

            </div>

          )}


      {/* ===============================================
          SOCIAL INFORMATION
      ================================================ */}

      <div
        className="shobdo-video-stats"
      >

        <div
          className="shobdo-video-stat-group"
        >

          <span>

            <Eye
              size={15}
            />

            {views.toLocaleString()}

            {" "}

            {t(
              "videos.views",
              "views"
            )}

          </span>


          {duration && (

            <span>

              <Clock3
                size={15}
              />

              {duration}

            </span>

          )}


          {languageLabel && (

            <span>

              <Globe2
                size={15}
              />

              {languageLabel}

            </span>

          )}

        </div>

      </div>


      {/* ===============================================
          ACTION BAR
      ================================================ */}

      {trashMode
        ? (

            <footer
              className="shobdo-video-actions"
              style={{
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              }}
            >

              <button
                type="button"
                disabled={
                  busy
                }
                onClick={
                  () =>
                    onRestore(
                      item
                    )
                }
              >

                {restoring
                  ? (
                      <LoaderCircle
                        size={18}
                        className="shobdo-video-spin"
                      />
                    )
                  : (
                      <RotateCcw
                        size={18}
                      />
                    )}


                <span>
                  {restoring
                    ? t(
                        "videos.restoring",
                        "Restoring..."
                      )
                    : t(
                        "videos.restore",
                        "Restore"
                      )}
                </span>

              </button>


              <button
                type="button"
                className="shobdo-video-action-delete"
                disabled={
                  busy
                }
                onClick={
                  () =>
                    onPermanentDelete(
                      item
                    )
                }
              >

                <Trash2
                  size={18}
                />

                <span>
                  {t(
                    "videos.deletePermanently",
                    "Delete permanently"
                  )}
                </span>

              </button>

            </footer>

          )
        : (

            <footer
              className="shobdo-video-actions"
            >

              <button
                type="button"
                onClick={
                  onShare
                }
              >

                <Share2
                  size={18}
                />

                <span>
                  {t(
                    "videos.share",
                    "Share"
                  )}
                </span>

              </button>


              <button
                type="button"
                onClick={
                  onCopy
                }
              >

                <Link2
                  size={18}
                />

                <span>
                  {t(
                    "videos.copyLink",
                    "Copy link"
                  )}
                </span>

              </button>


              {own && (

                <button
                  type="button"
                  className="shobdo-video-action-delete"
                  disabled={
                    deleting
                  }
                  onClick={
                    () =>
                      onDelete(
                        item
                      )
                  }
                >

                  {deleting
                    ? (
                        <LoaderCircle
                          size={18}
                          className="shobdo-video-spin"
                        />
                      )
                    : (
                        <Trash2
                          size={18}
                        />
                      )}


                  <span>
                    {deleting
                      ? t(
                          "videos.movingToTrash",
                          "Moving..."
                        )
                      : t(
                          "videos.moveToTrash",
                          "Move to Trash"
                        )}
                  </span>

                </button>

              )}

            </footer>

          )}

    </article>

  );

}


// =========================================================
// MAIN PAGE
// =========================================================

export default function Videos({
  user,
}) {

  const {
    t:
      globalT,
    language,
  } =
    useLanguage();


  const t =
    useCallback(
      (
        key,
        fallback = ""
      ) => {

        if (
          String(
            key || ""
          ).startsWith(
            "videos."
          )
        ) {

          const copy =
            VIDEO_COPY[
              language
            ] ||
            VIDEO_COPY.en;


          const englishCopy =
            VIDEO_COPY.en;


          const localKey =
            String(
              key
            ).slice(
              "videos.".length
            );


          return (
            copy?.[
              localKey
            ] ??
            englishCopy?.[
              localKey
            ] ??
            fallback
          );

        }


        return (
          globalT?.(
            key,
            fallback
          ) ??
          fallback
        );

      },
      [
        globalT,
        language,
      ]
    );


  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const [
    reduceMotion,
    setReduceMotion,
  ] =
    useState(false);


  useEffect(
    () => {

      if (
        typeof window ===
          "undefined" ||
        !window.matchMedia
      ) {

        return undefined;

      }


      const mediaQuery =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        );


      const syncPreference =
        () => {

          setReduceMotion(
            mediaQuery.matches
          );

        };


      syncPreference();


      if (
        mediaQuery.addEventListener
      ) {

        mediaQuery.addEventListener(
          "change",
          syncPreference
        );


        return () =>
          mediaQuery.removeEventListener(
            "change",
            syncPreference
          );

      }


      mediaQuery.addListener?.(
        syncPreference
      );


      return () =>
        mediaQuery.removeListener?.(
          syncPreference
        );

    },
    []
  );


  const requestedTab =
    String(
      searchParams.get(
        "tab"
      ) ||
      "videos"
    )
      .trim()
      .toLowerCase();


  const activeTab =
    VALID_TABS.includes(
      requestedTab
    )
      ? requestedTab
      : "videos";


  const requestedView =
    String(
      searchParams.get(
        "view"
      ) ||
      ""
    )
      .trim()
      .toLowerCase();


  const isTrashView =
    (
      activeTab ===
        "videos" &&
      requestedView ===
        "trash"
    );


  // =======================================================
  // STATE
  // =======================================================

  const [
    videos,
    setVideos,
  ] =
    useState([]);


  const [
    followingMedia,
    setFollowingMedia,
  ] =
    useState([]);


  const [
    trashVideos,
    setTrashVideos,
  ] =
    useState([]);


  const [
    trashTotal,
    setTrashTotal,
  ] =
    useState(0);


  const [
    loadingVideos,
    setLoadingVideos,
  ] =
    useState(true);


  const [
    loadingFollowing,
    setLoadingFollowing,
  ] =
    useState(false);


  const [
    loadingTrash,
    setLoadingTrash,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    followingError,
    setFollowingError,
  ] =
    useState("");


  const [
    trashError,
    setTrashError,
  ] =
    useState("");


  const [
    openMenuId,
    setOpenMenuId,
  ] =
    useState(null);


  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState(null);


  const [
    permanentDeleteTarget,
    setPermanentDeleteTarget,
  ] =
    useState(null);


  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);


  const [
    restoringId,
    setRestoringId,
  ] =
    useState(null);


  const [
    permanentlyDeletingId,
    setPermanentlyDeletingId,
  ] =
    useState(null);


  const [
    toast,
    setToast,
  ] =
    useState("");


  const viewedVideoIds =
    useRef(
      new Set()
    );


  // =======================================================
  // PAGE TITLE
  // =======================================================

  useEffect(
    () => {

      const previousTitle =
        document.title;


      document.title =
        `${t(
          "videos.title",
          "Video"
        )} | SHOBDO`;


      return () => {

        document.title =
          previousTitle;

      };

    },
    [
      t,
    ]
  );


  // =======================================================
  // TOAST AUTO CLOSE
  // =======================================================

  useEffect(
    () => {

      if (!toast) {

        return undefined;

      }


      const timer =
        window.setTimeout(
          () => {

            setToast("");

          },
          2800
        );


      return () =>
        window.clearTimeout(
          timer
        );

    },
    [
      toast,
    ]
  );


  // =======================================================
  // MAIN TAB
  // =======================================================

  function changeTab(
    tab
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    next.set(
      "tab",
      tab
    );


    if (
      tab !==
      "reels"
    ) {

      next.delete(
        "view"
      );

    }


    if (
      tab !==
      "videos"
    ) {

      next.delete(
        "video"
      );

    }


    setSearchParams(
      next
    );


    setOpenMenuId(
      null
    );

  }


  // =======================================================
  // OPEN TRASH
  // =======================================================

  function openTrashView() {

    const next =
      new URLSearchParams(
        searchParams
      );


    next.set(
      "tab",
      "videos"
    );

    next.set(
      "view",
      "trash"
    );

    next.delete(
      "video"
    );


    setSearchParams(
      next
    );

    setOpenMenuId(
      null
    );

  }


  // =======================================================
  // CLOSE TRASH
  // =======================================================

  function closeTrashView() {

    const next =
      new URLSearchParams(
        searchParams
      );


    next.set(
      "tab",
      "videos"
    );

    next.delete(
      "view"
    );


    setSearchParams(
      next
    );

    setOpenMenuId(
      null
    );

  }


  // =======================================================
  // LOAD VIDEOS
  // =======================================================

  const loadVideos =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (!silent) {

          setLoadingVideos(
            true
          );

        }


        setError("");


        try {

          const data =
            await apiRequest(
              `/videos?page=1&limit=${PAGE_SIZE}`,
              {
                authenticated:
                  Boolean(
                    getToken()
                  ),
              }
            );


          const items =
            Array.isArray(
              data?.videos
            )
              ? data.videos
              : Array.isArray(
                    data?.items
                  )
                ? data.items
                : [];


          setVideos(
            items
          );


        } catch (
          loadError
        ) {

          console.error(
            "LOAD VIDEOS ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            t(
              "videos.loadError",
              "Unable to load videos."
            )
          );


        } finally {

          if (!silent) {

            setLoadingVideos(
              false
            );

          }

        }

      },
      [
        t,
      ]
    );


  // =======================================================
  // INITIAL VIDEO LOAD
  // =======================================================

  useEffect(
    () => {

      loadVideos();

    },
    [
      loadVideos,
    ]
  );


  // =======================================================
  // LOAD TRASH
  // =======================================================

  const loadTrash =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        const token =
          getToken();


        if (
          !token ||
          !user?.id
        ) {

          setTrashVideos(
            []
          );

          setTrashTotal(
            0
          );

          setTrashError(
            ""
          );

          return;

        }


        if (!silent) {

          setLoadingTrash(
            true
          );

        }


        setTrashError(
          ""
        );


        try {

          const data =
            await apiRequest(
              `/videos/trash?page=1&limit=${PAGE_SIZE}`,
              {
                authenticated:
                  true,
              }
            );


          const items =
            Array.isArray(
              data?.videos
            )
              ? data.videos
              : Array.isArray(
                    data?.items
                  )
                ? data.items
                : [];


          setTrashVideos(
            items
          );


          setTrashTotal(
            Number(
              data?.total ??
              data?.pagination
                ?.total ??
              items.length
            ) || 0
          );


        } catch (
          loadError
        ) {

          console.error(
            "LOAD VIDEO TRASH ERROR:",
            loadError
          );


          setTrashError(
            loadError?.message ||
            t(
              "videos.trashLoadError",
              "Unable to load Video Trash."
            )
          );


        } finally {

          if (!silent) {

            setLoadingTrash(
              false
            );

          }

        }

      },
      [
        t,
        user?.id,
      ]
    );


  // =======================================================
  // LOAD TRASH COUNT / VIEW
  // =======================================================

  useEffect(
    () => {

      if (
        !user?.id ||
        !getToken()
      ) {

        return;

      }


      loadTrash({
        silent:
          !isTrashView,
      });

    },
    [
      user?.id,
      isTrashView,
      loadTrash,
    ]
  );


  // =======================================================
  // FOLLOWING MEDIA
  // =======================================================

  const loadFollowingMedia =
    useCallback(
      async () => {

        if (
          !user?.id
        ) {

          setFollowingMedia(
            []
          );

          return;

        }


        setLoadingFollowing(
          true
        );


        setFollowingError(
          ""
        );


        try {

          const [
            followingResponse,
            videoResponse,
            reelsResponse,
          ] =
            await Promise.all([

              apiRequest(
                `/users/${user.id}/following?page=1&limit=50`,
                {
                  authenticated:
                    true,
                }
              ),

              apiRequest(
                `/videos?page=1&limit=${PAGE_SIZE}`,
                {
                  authenticated:
                    true,
                }
              ),

              getReels({
                page:
                  1,

                perPage:
                  PAGE_SIZE,
              }),

            ]);


          const followingUsers =
            Array.isArray(
              followingResponse
                ?.users
            )
              ? followingResponse
                  .users
              : [];


          const followingIds =
            new Set(
              followingUsers
                .map(
                  (
                    followedUser
                  ) =>
                    Number(
                      followedUser
                        ?.id
                    )
                )
                .filter(
                  Number.isFinite
                )
            );


          const followedVideos =
            (
              Array.isArray(
                videoResponse
                  ?.videos
              )
                ? videoResponse
                    .videos
                : Array.isArray(
                      videoResponse
                        ?.items
                    )
                  ? videoResponse
                      .items
                  : []
            )
              .filter(
                (
                  video
                ) =>
                  followingIds.has(
                    Number(
                      getOwnerId(
                        video
                      )
                    )
                  )
              )
              .map(
                (
                  video
                ) => ({
                  ...video,

                  __mediaType:
                    "video",
                })
              );


          const followedReels =
            (
              Array.isArray(
                reelsResponse
                  ?.reels
              )
                ? reelsResponse
                    .reels
                : []
            )
              .filter(
                (
                  reel
                ) =>
                  followingIds.has(
                    Number(
                      getOwnerId(
                        reel
                      )
                    )
                  )
              )
              .map(
                (
                  reel
                ) => ({
                  ...reel,

                  __mediaType:
                    "reel",
                })
              );


          const merged = [
            ...followedVideos,
            ...followedReels,
          ];


          merged.sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  getCreatedAt(
                    first
                  ) || 0
                )
                  .getTime();


              const secondDate =
                new Date(
                  getCreatedAt(
                    second
                  ) || 0
                )
                  .getTime();


              return (
                secondDate -
                firstDate
              );

            }
          );


          setFollowingMedia(
            merged
          );


        } catch (
          loadError
        ) {

          console.error(
            "LOAD FOLLOWING MEDIA ERROR:",
            loadError
          );


          setFollowingError(
            loadError?.message ||
            t(
              "videos.followingLoadError",
              "Unable to load media from people you follow."
            )
          );


        } finally {

          setLoadingFollowing(
            false
          );

        }

      },
      [
        user?.id,
        t,
      ]
    );


  useEffect(
    () => {

      if (
        activeTab ===
        "following"
      ) {

        loadFollowingMedia();

      }

    },
    [
      activeTab,
      loadFollowingMedia,
    ]
  );


  // =======================================================
  // MOVE TO TRASH
  // =======================================================

  async function confirmMoveToTrash() {

    const videoId =
      Number(
        deleteTarget?.id
      );


    if (
      !Number.isFinite(
        videoId
      )
    ) {

      return;

    }


    try {

      setDeletingId(
        videoId
      );


      const data =
        await apiRequest(
          `/videos/${videoId}`,
          {
            method:
              "DELETE",

            authenticated:
              true,
          }
        );


      setVideos(
        (
          current
        ) =>
          current.filter(
            (
              video
            ) =>
              Number(
                video?.id
              ) !==
              videoId
          )
      );


      setFollowingMedia(
        (
          current
        ) =>
          current.filter(
            (
              media
            ) =>
              !(
                media
                  ?.__mediaType ===
                  "video" &&
                Number(
                  media?.id
                ) ===
                  videoId
              )
          )
      );


      if (
        data?.video
      ) {

        setTrashVideos(
          (
            current
          ) => {

            const exists =
              current.some(
                (
                  video
                ) =>
                  Number(
                    video?.id
                  ) ===
                  videoId
              );


            if (exists) {

              return current;

            }


            return [
              data.video,
              ...current,
            ];

          }
        );

      }


      setTrashTotal(
        (
          current
        ) =>
          current + 1
      );


      setDeleteTarget(
        null
      );


      setOpenMenuId(
        null
      );


      setToast(
        t(
          "videos.movedToTrash",
          "Video moved to Trash."
        )
      );


    } catch (
      deleteError
    ) {

      console.error(
        "MOVE VIDEO TO TRASH ERROR:",
        deleteError
      );


      window.alert(
        deleteError?.message ||
        t(
          "videos.moveToTrashError",
          "Unable to move this video to Trash."
        )
      );


    } finally {

      setDeletingId(
        null
      );

    }

  }


  // =======================================================
  // RESTORE VIDEO
  // =======================================================

  async function restoreVideo(
    video
  ) {

    const videoId =
      Number(
        video?.id
      );


    if (
      !Number.isFinite(
        videoId
      )
    ) {

      return;

    }


    try {

      setRestoringId(
        videoId
      );


      await apiRequest(
        `/videos/${videoId}/restore`,
        {
          method:
            "POST",

          authenticated:
            true,
        }
      );


      setTrashVideos(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              Number(
                item?.id
              ) !==
              videoId
          )
      );


      setTrashTotal(
        (
          current
        ) =>
          Math.max(
            0,
            current - 1
          )
      );


      setOpenMenuId(
        null
      );


      await loadVideos({
        silent:
          true,
      });


      setToast(
        t(
          "videos.restored",
          "Video restored successfully."
        )
      );


    } catch (
      restoreError
    ) {

      console.error(
        "RESTORE VIDEO ERROR:",
        restoreError
      );


      window.alert(
        restoreError?.message ||
        t(
          "videos.restoreError",
          "Unable to restore this video."
        )
      );


    } finally {

      setRestoringId(
        null
      );

    }

  }


  // =======================================================
  // PERMANENT DELETE
  // =======================================================

  async function confirmPermanentDelete() {

    const videoId =
      Number(
        permanentDeleteTarget?.id
      );


    if (
      !Number.isFinite(
        videoId
      )
    ) {

      return;

    }


    try {

      setPermanentlyDeletingId(
        videoId
      );


      await apiRequest(
        `/videos/${videoId}/permanent`,
        {
          method:
            "DELETE",

          authenticated:
            true,
        }
      );


      setTrashVideos(
        (
          current
        ) =>
          current.filter(
            (
              video
            ) =>
              Number(
                video?.id
              ) !==
              videoId
          )
      );


      setTrashTotal(
        (
          current
        ) =>
          Math.max(
            0,
            current - 1
          )
      );


      setPermanentDeleteTarget(
        null
      );


      setOpenMenuId(
        null
      );


      setToast(
        t(
          "videos.permanentlyDeleted",
          "Video permanently deleted."
        )
      );


    } catch (
      deleteError
    ) {

      console.error(
        "PERMANENT DELETE VIDEO ERROR:",
        deleteError
      );


      window.alert(
        deleteError?.message ||
        t(
          "videos.permanentDeleteError",
          "Unable to permanently delete this video."
        )
      );


    } finally {

      setPermanentlyDeletingId(
        null
      );

    }

  }


  // =======================================================
  // SHARE URL
  // =======================================================

  function getShareUrl(
    item,
    type
  ) {

    if (
      type ===
      "reel"
    ) {

      return (
        `${window.location.origin}/reels/${item.id}`
      );

    }


    return (
      `${window.location.origin}/videos?video=${item.id}`
    );

  }


  // =======================================================
  // SHARE
  // =======================================================

  async function shareItem(
    item,
    type
  ) {

    const url =
      getShareUrl(
        item,
        type
      );


    const title =
      getTitle(
        item,
        type
      );


    try {

      if (
        navigator.share
      ) {

        await navigator.share({

          title,

          text:
            type === "reel"
              ? t(
                  "videos.shareReelText",
                  "Watch this Reel on SHOBDO."
                )
              : t(
                  "videos.shareVideoText",
                  "Watch this video on SHOBDO."
                ),

          url,

        });


        return;

      }


      await navigator.clipboard
        .writeText(
          url
        );


      setToast(
        t(
          "videos.linkCopied",
          "Link copied."
        )
      );


    } catch (
      shareError
    ) {

      if (
        shareError?.name ===
        "AbortError"
      ) {

        return;

      }


      console.error(
        "SHARE VIDEO ERROR:",
        shareError
      );

    }

  }


  // =======================================================
  // COPY
  // =======================================================

  async function copyItemLink(
    item,
    type
  ) {

    const url =
      getShareUrl(
        item,
        type
      );


    try {

      await navigator.clipboard
        .writeText(
          url
        );


      setToast(
        t(
          "videos.linkCopied",
          "Link copied."
        )
      );


    } catch {

      window.prompt(
        t(
          "videos.copyThisLink",
          "Copy this link:"
        ),
        url
      );

    }

  }


  // =======================================================
  // REGISTER VIEW
  // =======================================================

  async function handlePlay(
    item,
    type
  ) {

    if (
      type !==
      "video"
    ) {

      return;

    }


    const id =
      Number(
        item?.id
      );


    if (
      !Number.isFinite(
        id
      ) ||
      viewedVideoIds
        .current
        .has(
          id
        )
    ) {

      return;

    }


    viewedVideoIds
      .current
      .add(
        id
      );


    try {

      await apiRequest(
        `/videos/${id}/view`,
        {
          method:
            "POST",

          authenticated:
            Boolean(
              getToken()
            ),
        }
      );


      setVideos(
        (
          current
        ) =>
          current.map(
            (
              video
            ) => {

              if (
                Number(
                  video?.id
                ) !==
                id
              ) {

                return video;

              }


              return {
                ...video,

                views_count:
                  getViews(
                    video
                  ) +
                  1,
              };

            }
          )
      );


    } catch {

      // View registration should never block playback.

    }

  }


  // =======================================================
  // DISPLAY ITEMS
  // =======================================================

  const currentItems =
    useMemo(
      () => {

        if (
          activeTab ===
          "following"
        ) {

          return (
            followingMedia
          );

        }


        if (
          isTrashView
        ) {

          return trashVideos.map(
            (
              video
            ) => ({
              ...video,

              __mediaType:
                "video",
            })
          );

        }


        return videos.map(
          (
            video
          ) => ({
            ...video,

            __mediaType:
              "video",
          })
        );

      },
      [
        activeTab,
        isTrashView,
        videos,
        trashVideos,
        followingMedia,
      ]
    );


  // =======================================================
  // REFRESH
  // =======================================================

  async function refreshCurrent() {

    if (
      isTrashView
    ) {

      await loadTrash();

      return;

    }


    if (
      activeTab ===
      "following"
    ) {

      await loadFollowingMedia();

      return;

    }


    await loadVideos();

  }


  // =======================================================
  // CURRENT STATE
  // =======================================================

  const currentLoading =
    isTrashView
      ? loadingTrash
      : activeTab ===
          "following"
        ? loadingFollowing
        : loadingVideos;


  const currentError =
    isTrashView
      ? trashError
      : activeTab ===
          "following"
        ? followingError
        : error;


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main
      className="shobdo-video-page"
      onClick={
        () =>
          setOpenMenuId(
            null
          )
      }
    >

      {/* =================================================
          ANIMATED PAGE BACKGROUND
      ================================================== */}

      <div
        className="shobdo-video-animated-background"
        aria-hidden="true"
      >

        {!reduceMotion && (

          <video
            className="shobdo-video-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >

            <source
              src={
                VIDEO_BACKGROUND_VIDEO
              }
              type="video/mp4"
            />

          </video>

        )}


        <div
          className="shobdo-video-background-overlay"
        />

      </div>


      {/* =================================================
          HERO
      ================================================== */}

      <section
        className="shobdo-video-hero"
      >

        <div
          className="shobdo-video-hero-main"
        >

          <div
            className="shobdo-video-hero-icon"
          >

            <Film
              size={28}
            />

          </div>


          <div
            className="shobdo-video-hero-copy"
          >

            <span
              className="shobdo-video-eyebrow"
            >
              {t(
                "videos.eyebrow",
                "SHOBDO MEDIA"
              )}
            </span>


            <h1>
              {t(
                "videos.title",
                "Video"
              )}
            </h1>


            <p>
              {t(
                "videos.description",
                "Watch videos, discover Reels and keep up with creators you follow."
              )}
            </p>

          </div>

        </div>


        <div
          className="shobdo-video-create-actions"
        >

          <Link
            to="/write?mode=video"
            className="shobdo-video-create-button"
          >

            <Plus
              size={18}
            />

            <span>
              {t(
                "videos.addVideo",
                "Add Video"
              )}
            </span>

          </Link>


          <button
            type="button"
            className="shobdo-video-create-button shobdo-video-create-button-secondary"
            onClick={
              (
                event
              ) => {

                event.stopPropagation();


                const next =
                  new URLSearchParams(
                    searchParams
                  );


                next.set(
                  "tab",
                  "reels"
                );

                next.set(
                  "view",
                  "create"
                );


                setSearchParams(
                  next
                );

              }
            }
          >

            <Clapperboard
              size={18}
            />

            <span>
              {t(
                "videos.createReel",
                "Create Reel"
              )}
            </span>

          </button>

        </div>

      </section>


      {/* =================================================
          PRIMARY TABS
      ================================================== */}

      <section
        className="shobdo-video-tabs-shell"
      >

        <button
          type="button"
          className={
            activeTab ===
            "videos"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "videos"
              );

            }
          }
        >

          <Film
            size={18}
          />

          <span>
            {t(
              "videos.videos",
              "Videos"
            )}
          </span>

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "reels"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "reels"
              );

            }
          }
        >

          <Clapperboard
            size={18}
          />

          <span>
            {t(
              "videos.reels",
              "Reels"
            )}
          </span>

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "following"
              ? "shobdo-video-tab active"
              : "shobdo-video-tab"
          }
          onClick={
            (
              event
            ) => {

              event.stopPropagation();

              changeTab(
                "following"
              );

            }
          }
        >

          <Users
            size={18}
          />

          <span>
            {t(
              "videos.following",
              "Following"
            )}
          </span>

        </button>

      </section>


      {/* =================================================
          REELS
      ================================================== */}

      {activeTab ===
        "reels" && (

        <section
          className="shobdo-video-reels-container"
          onClick={
            (
              event
            ) =>
              event
                .stopPropagation()
          }
        >

          <ReelsTab
            user={user}
          />

        </section>

      )}


      {/* =================================================
          VIDEOS / FOLLOWING / TRASH
      ================================================== */}

      {activeTab !==
        "reels" && (

        <section
          className="shobdo-video-feed"
        >

          <div
            className="shobdo-video-feed-toolbar"
          >

            <div>

              <span
                className="shobdo-video-feed-kicker"
              >

                {isTrashView
                  ? t(
                      "videos.yourLibrary",
                      "YOUR LIBRARY"
                    )
                  : activeTab ===
                      "following"
                    ? t(
                        "videos.yourNetwork",
                        "YOUR NETWORK"
                      )
                    : t(
                        "videos.communityFeed",
                        "COMMUNITY FEED"
                      )}

              </span>


              <h2>

                {isTrashView
                  ? t(
                      "videos.videoTrash",
                      "Video Trash"
                    )
                  : activeTab ===
                      "following"
                    ? t(
                        "videos.fromPeopleYouFollow",
                        "From people you follow"
                      )
                    : t(
                        "videos.latestVideos",
                        "Latest videos"
                      )}

              </h2>

            </div>


            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",
              }}
            >

              {activeTab ===
                "videos" &&
                user?.id && (

                <button
                  type="button"
                  className="shobdo-video-refresh-button"
                  onClick={
                    (
                      event
                    ) => {

                      event.stopPropagation();


                      if (
                        isTrashView
                      ) {

                        closeTrashView();

                      } else {

                        openTrashView();

                      }

                    }
                  }
                >

                  {isTrashView
                    ? (
                        <Film
                          size={17}
                        />
                      )
                    : (
                        <Trash2
                          size={17}
                        />
                      )}


                  <span>
                    {isTrashView
                      ? t(
                          "videos.backToVideos",
                          "Back to Videos"
                        )
                      : (
                          <>
                            {t(
                              "videos.trash",
                              "Trash"
                            )}

                            {trashTotal > 0
                              ? ` (${trashTotal})`
                              : ""}
                          </>
                        )}
                  </span>

                </button>

              )}


              <button
                type="button"
                className="shobdo-video-refresh-button"
                disabled={
                  currentLoading
                }
                onClick={
                  (
                    event
                  ) => {

                    event.stopPropagation();

                    refreshCurrent();

                  }
                }
                aria-label={t(
                  "videos.refresh",
                  "Refresh videos"
                )}
                title={t(
                  "videos.refresh",
                  "Refresh videos"
                )}
              >

                <RefreshCw
                  size={18}
                  className={
                    currentLoading
                      ? "shobdo-video-spin"
                      : ""
                  }
                />

                <span>
                  {t(
                    "videos.refresh",
                    "Refresh"
                  )}
                </span>

              </button>

            </div>

          </div>


          {/* =============================================
              LOADING
          ============================================== */}

          {currentLoading && (

            <div
              className="shobdo-video-state"
            >

              <LoaderCircle
                size={30}
                className="shobdo-video-spin"
              />


              <strong>

                {isTrashView
                  ? t(
                      "videos.loadingTrash",
                      "Loading Video Trash..."
                    )
                  : t(
                      "videos.loading",
                      "Loading videos..."
                    )}

              </strong>

            </div>

          )}


          {/* =============================================
              ERROR
          ============================================== */}

          {!currentLoading &&
            currentError && (

            <div
              className="shobdo-video-state shobdo-video-state-error"
            >

              <AlertTriangle
                size={30}
              />


              <strong>

                {isTrashView
                  ? t(
                      "videos.trashUnavailable",
                      "Unable to load Video Trash"
                    )
                  : t(
                      "videos.unavailable",
                      "Unable to load videos"
                    )}

              </strong>


              <p>
                {currentError}
              </p>


              <button
                type="button"
                onClick={
                  refreshCurrent
                }
              >

                <RefreshCw
                  size={17}
                />

                {t(
                  "videos.tryAgain",
                  "Try again"
                )}

              </button>

            </div>

          )}


          {/* =============================================
              EMPTY
          ============================================== */}

          {!currentLoading &&
            !currentError &&
            currentItems.length ===
              0 && (

            <div
              className="shobdo-video-state shobdo-video-state-empty"
            >

              {isTrashView
                ? (
                    <Trash2
                      size={34}
                    />
                  )
                : activeTab ===
                    "following"
                  ? (
                      <Users
                        size={34}
                      />
                    )
                  : (
                      <Film
                        size={34}
                      />
                    )}


              <strong>

                {isTrashView
                  ? t(
                      "videos.trashEmpty",
                      "Video Trash is empty"
                    )
                  : activeTab ===
                      "following"
                    ? t(
                        "videos.noFollowingMedia",
                        "No videos or Reels here yet"
                      )
                    : t(
                        "videos.noVideos",
                        "No videos yet"
                      )}

              </strong>


              <p>

                {isTrashView
                  ? t(
                      "videos.trashEmptyDescription",
                      "Videos you move to Trash will appear here until you restore or permanently delete them."
                    )
                  : activeTab ===
                      "following"
                    ? t(
                        "videos.noFollowingMediaDescription",
                        "Follow creators to see their latest videos and Reels here."
                      )
                    : t(
                        "videos.noVideosDescription",
                        "Be the first to share a video with the SHOBDO community."
                      )}

              </p>


              {!isTrashView &&
                activeTab ===
                  "videos" && (

                <Link
                  to="/write?mode=video"
                >

                  <Plus
                    size={17}
                  />

                  {t(
                    "videos.addVideo",
                    "Add Video"
                  )}

                </Link>

              )}

            </div>

          )}


          {/* =============================================
              POSTS
          ============================================== */}

          {!currentLoading &&
            !currentError &&
            currentItems.length >
              0 && (

            <div
              className="shobdo-video-post-list"
            >

              {currentItems.map(
                (
                  item
                ) => {

                  const mediaType =
                    item
                      ?.__mediaType ||
                    "video";


                  const menuKey =
                    `${isTrashView
                      ? "trash"
                      : mediaType}-${item.id}`;


                  return (

                    <VideoCard
                      key={
                        menuKey
                      }
                      item={
                        item
                      }
                      type={
                        mediaType
                      }
                      user={
                        user
                      }
                      language={
                        language
                      }
                      t={
                        t
                      }
                      trashMode={
                        isTrashView
                      }
                      menuOpen={
                        openMenuId ===
                        menuKey
                      }
                      deleting={
                        !isTrashView &&
                        mediaType ===
                          "video" &&
                        Number(
                          deletingId
                        ) ===
                        Number(
                          item.id
                        )
                      }
                      restoring={
                        isTrashView &&
                        Number(
                          restoringId
                        ) ===
                        Number(
                          item.id
                        )
                      }
                      permanentlyDeleting={
                        isTrashView &&
                        Number(
                          permanentlyDeletingId
                        ) ===
                        Number(
                          item.id
                        )
                      }
                      onToggleMenu={
                        (
                          event
                        ) => {

                          event
                            .stopPropagation();


                          setOpenMenuId(
                            (
                              current
                            ) =>
                              current ===
                              menuKey
                                ? null
                                : menuKey
                          );

                        }
                      }
                      onDelete={
                        (
                          video
                        ) => {

                          setOpenMenuId(
                            null
                          );


                          setDeleteTarget(
                            video
                          );

                        }
                      }
                      onRestore={
                        async (
                          video
                        ) => {

                          setOpenMenuId(
                            null
                          );


                          await restoreVideo(
                            video
                          );

                        }
                      }
                      onPermanentDelete={
                        (
                          video
                        ) => {

                          setOpenMenuId(
                            null
                          );


                          setPermanentDeleteTarget(
                            video
                          );

                        }
                      }
                      onShare={
                        async (
                          event
                        ) => {

                          event
                            ?.stopPropagation?.();


                          setOpenMenuId(
                            null
                          );


                          await shareItem(
                            item,
                            mediaType
                          );

                        }
                      }
                      onCopy={
                        async (
                          event
                        ) => {

                          event
                            ?.stopPropagation?.();


                          setOpenMenuId(
                            null
                          );


                          await copyItemLink(
                            item,
                            mediaType
                          );

                        }
                      }
                      onPlay={
                        handlePlay
                      }
                    />

                  );

                }
              )}

            </div>

          )}

        </section>

      )}


      {/* =================================================
          MOVE TO TRASH CONFIRMATION
      ================================================== */}

      {deleteTarget && (

        <div
          className="shobdo-video-modal-backdrop"
          role="presentation"
          onClick={
            () => {

              if (
                deletingId
              ) {

                return;

              }


              setDeleteTarget(
                null
              );

            }
          }
        >

          <div
            className="shobdo-video-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trash-video-title"
            onClick={
              (
                event
              ) =>
                event
                  .stopPropagation()
            }
          >

            <button
              type="button"
              className="shobdo-video-modal-close"
              disabled={
                Boolean(
                  deletingId
                )
              }
              onClick={
                () =>
                  setDeleteTarget(
                    null
                  )
              }
              aria-label={t(
                "videos.close",
                "Close"
              )}
            >

              <X
                size={20}
              />

            </button>


            <div
              className="shobdo-video-delete-icon"
            >

              <Trash2
                size={25}
              />

            </div>


            <span
              className="shobdo-video-modal-eyebrow"
            >
              {t(
                "videos.videoTrash",
                "VIDEO TRASH"
              )}
            </span>


            <h2
              id="trash-video-title"
            >
              {t(
                "videos.moveToTrashTitle",
                "Move video to Trash?"
              )}
            </h2>


            <p>
              {t(
                "videos.moveToTrashDescription",
                "This video will disappear from SHOBDO, but you can restore it later from Video Trash."
              )}
            </p>


            <div
              className="shobdo-video-delete-preview"
            >

              <Film
                size={17}
              />

              <span>
                {getTitle(
                  deleteTarget,
                  "video"
                )}
              </span>

            </div>


            <div
              className="shobdo-video-modal-actions"
            >

              <button
                type="button"
                className="shobdo-video-modal-cancel"
                disabled={
                  Boolean(
                    deletingId
                  )
                }
                onClick={
                  () =>
                    setDeleteTarget(
                      null
                    )
                }
              >
                {t(
                  "videos.cancel",
                  "Cancel"
                )}
              </button>


              <button
                type="button"
                className="shobdo-video-modal-delete"
                disabled={
                  Boolean(
                    deletingId
                  )
                }
                onClick={
                  confirmMoveToTrash
                }
              >

                {deletingId
                  ? (
                      <LoaderCircle
                        size={18}
                        className="shobdo-video-spin"
                      />
                    )
                  : (
                      <Trash2
                        size={18}
                      />
                    )}


                <span>
                  {deletingId
                    ? t(
                        "videos.movingToTrash",
                        "Moving..."
                      )
                    : t(
                        "videos.moveToTrash",
                        "Move to Trash"
                      )}
                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          PERMANENT DELETE CONFIRMATION
      ================================================== */}

      {permanentDeleteTarget && (

        <div
          className="shobdo-video-modal-backdrop"
          role="presentation"
          onClick={
            () => {

              if (
                permanentlyDeletingId
              ) {

                return;

              }


              setPermanentDeleteTarget(
                null
              );

            }
          }
        >

          <div
            className="shobdo-video-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="permanent-delete-video-title"
            onClick={
              (
                event
              ) =>
                event
                  .stopPropagation()
            }
          >

            <button
              type="button"
              className="shobdo-video-modal-close"
              disabled={
                Boolean(
                  permanentlyDeletingId
                )
              }
              onClick={
                () =>
                  setPermanentDeleteTarget(
                    null
                  )
              }
              aria-label={t(
                "videos.close",
                "Close"
              )}
            >

              <X
                size={20}
              />

            </button>


            <div
              className="shobdo-video-delete-icon"
            >

              <AlertTriangle
                size={25}
              />

            </div>


            <span
              className="shobdo-video-modal-eyebrow"
            >
              {t(
                "videos.permanentDeletion",
                "PERMANENT DELETION"
              )}
            </span>


            <h2
              id="permanent-delete-video-title"
            >
              {t(
                "videos.permanentDeleteTitle",
                "Delete video permanently?"
              )}
            </h2>


            <p>
              {t(
                "videos.permanentDeleteDescription",
                "This permanently removes the video from SHOBDO and deletes its stored media. This action cannot be undone."
              )}
            </p>


            <div
              className="shobdo-video-delete-preview"
            >

              <Film
                size={17}
              />

              <span>
                {getTitle(
                  permanentDeleteTarget,
                  "video"
                )}
              </span>

            </div>


            <div
              className="shobdo-video-modal-actions"
            >

              <button
                type="button"
                className="shobdo-video-modal-cancel"
                disabled={
                  Boolean(
                    permanentlyDeletingId
                  )
                }
                onClick={
                  () =>
                    setPermanentDeleteTarget(
                      null
                    )
                }
              >
                {t(
                  "videos.cancel",
                  "Cancel"
                )}
              </button>


              <button
                type="button"
                className="shobdo-video-modal-delete"
                disabled={
                  Boolean(
                    permanentlyDeletingId
                  )
                }
                onClick={
                  confirmPermanentDelete
                }
              >

                {permanentlyDeletingId
                  ? (
                      <LoaderCircle
                        size={18}
                        className="shobdo-video-spin"
                      />
                    )
                  : (
                      <Trash2
                        size={18}
                      />
                    )}


                <span>
                  {permanentlyDeletingId
                    ? t(
                        "videos.deletingPermanently",
                        "Deleting..."
                      )
                    : t(
                        "videos.deletePermanently",
                        "Delete permanently"
                      )}
                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          TOAST
      ================================================== */}

      {toast && (

        <div
          className="shobdo-video-toast"
          role="status"
        >

          <Check
            size={17}
          />

          <span>
            {toast}
          </span>

        </div>

      )}

    </main>

  );

}