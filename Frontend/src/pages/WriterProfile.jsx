import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  Share2,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  followUser,
  getFollowStatus,
  getToken,
  getWriterProfile,
  getWriterWritings,
  removeMyProfileAvatar,
  removeMyProfileCover,
  unfollowUser,
  updateMyProfile,
  updateMyProfileCoverPosition,
  uploadMyProfileAvatar,
  uploadMyProfileCover,
  validateProfileAvatar,
  validateProfileCover,
} from "../api/api";

import {
  useLanguage,
} from "../Language/LanguageContext";

import SEO from "../components/SEO";

import "./WriterProfile.css";


const PROFILE_COPY = {

  en: {

    writerProfile:
      "Writer Profile",

    editProfile:
      "Edit Profile",

    follow:
      "Follow",

    following:
      "Following",

    followers:
      "Followers",

    writings:
      "Writings",

    about:
      "About",

    share:
      "Share",

    shareProfile:
      "Share profile",

    linkCopied:
      "Profile link copied",

    memberSince:
      "Member since {{date}}",

    website:
      "Website",

    location:
      "Location",

    likesReceived:
      "Likes received",

    comments:
      "Comments",

    publishedWritings:
      "Published writings",

    publishedWorks:
      "Published works",

    writingsBy:
      "Writings by {{name}}",

    writingCount:
      "{{count}} writing",

    writingsCount:
      "{{count}} writings",

    noWritings:
      "No published writings yet",

    noWritingsDescription:
      "This writer has not published any writings yet.",

    noBio:
      "This writer has not added a bio yet.",

    loading:
      "Loading writer profile...",

    notFound:
      "Writer not found",

    unavailable:
      "This writer profile is unavailable.",

    invalidWriter:
      "Invalid writer ID.",

    loadError:
      "Unable to load writer profile.",

    exploreWritings:
      "Explore writings",

    followError:
      "Unable to update follow status.",

    readWriting:
      "Read writing",

    writing:
      "Writing",

    untitled:
      "Untitled",

    profileInformation:
      "Profile information",

    creatorActivity:
      "Creator activity",

    accountProfile:
      "Account Profile",

    profilePhoto:
      "Profile photo",

    photoDescription:
      "JPG, PNG or WEBP. Maximum file size 5 MB.",

    choosePhoto:
      "Choose Photo",

    changePhoto:
      "Change Photo",

    uploadPhoto:
      "Upload Photo",

    uploading:
      "Uploading...",

    removePhoto:
      "Remove Photo",

    removing:
      "Removing...",

    cancelSelection:
      "Cancel Selection",

    removePhotoConfirm:
      "Remove your current profile photo?",

    photoUpdated:
      "Profile photo updated successfully.",

    photoRemoved:
      "Profile photo removed.",

    invalidPhoto:
      "Invalid profile image.",

    photoUploadError:
      "Unable to upload profile photo.",

    photoRemoveError:
      "Unable to remove profile photo.",

    coverPhoto:
      "Cover photo",

    coverDescription:
      "JPG, PNG or WEBP. Maximum file size 10 MB. Recommended ratio: 3:1.",

    chooseCover:
      "Choose Cover",

    changeCover:
      "Change Cover",

    uploadCover:
      "Upload Cover",

    removeCover:
      "Remove Cover",

    removeCoverConfirm:
      "Remove your current cover photo?",

    coverUpdated:
      "Cover photo updated successfully.",

    coverRemoved:
      "Cover photo removed.",

    invalidCover:
      "Invalid cover photo.",

    coverUploadError:
      "Unable to upload cover photo.",

    coverRemoveError:
      "Unable to remove cover photo.",

    coverPosition:
      "Cover position",

    coverPositionHelp:
      "Move the slider to choose which vertical part of the cover stays visible.",

    saveCoverPosition:
      "Save Position",

    savingPosition:
      "Saving position...",

    coverPositionSaved:
      "Cover position updated successfully.",

    coverPositionError:
      "Unable to update cover position.",

    selectedCover:
      "Selected cover preview",

    currentCover:
      "Current cover photo",

    defaultCover:
      "Default SHOBDO cover",

    name:
      "Name",

    username:
      "Username",

    bio:
      "Bio",

    namePlaceholder:
      "Your name",

    usernamePlaceholder:
      "username",

    bioPlaceholder:
      "Tell readers something about yourself...",

    locationPlaceholder:
      "City, Country",

    websitePlaceholder:
      "https://example.com",

    nameError:
      "Name must contain at least 2 characters.",

    saveProfile:
      "Save Profile",

    saving:
      "Saving...",

    cancel:
      "Cancel",

    close:
      "Close edit profile",

    profileUpdated:
      "Profile updated successfully.",

    profileUpdateError:
      "Unable to update profile.",

    selectedPhoto:
      "Selected profile preview",

    currentPhoto:
      "Current profile photo",

    joined:
      "Joined",

  },


  bn: {

    writerProfile:
      "লেখকের প্রোফাইল",

    editProfile:
      "প্রোফাইল সম্পাদনা",

    follow:
      "অনুসরণ করুন",

    following:
      "অনুসরণ করছেন",

    followers:
      "অনুসরণকারী",

    writings:
      "লেখা",

    about:
      "পরিচিতি",

    share:
      "শেয়ার",

    shareProfile:
      "প্রোফাইল শেয়ার করুন",

    linkCopied:
      "প্রোফাইলের লিঙ্ক কপি হয়েছে",

    memberSince:
      "{{date}} থেকে সদস্য",

    website:
      "ওয়েবসাইট",

    location:
      "অবস্থান",

    likesReceived:
      "প্রাপ্ত পছন্দ",

    comments:
      "মন্তব্য",

    publishedWritings:
      "প্রকাশিত লেখা",

    publishedWorks:
      "প্রকাশিত রচনা",

    writingsBy:
      "{{name}}-এর লেখা",

    writingCount:
      "{{count}}টি লেখা",

    writingsCount:
      "{{count}}টি লেখা",

    noWritings:
      "এখনও কোনো প্রকাশিত লেখা নেই",

    noWritingsDescription:
      "এই লেখক এখনও কোনো লেখা প্রকাশ করেননি।",

    noBio:
      "এই লেখক এখনও নিজের সম্পর্কে কিছু লেখেননি।",

    loading:
      "লেখকের প্রোফাইল লোড হচ্ছে...",

    notFound:
      "লেখককে পাওয়া যায়নি",

    unavailable:
      "এই লেখকের প্রোফাইলটি উপলভ্য নয়।",

    invalidWriter:
      "লেখকের আইডি সঠিক নয়।",

    loadError:
      "লেখকের প্রোফাইল লোড করা যায়নি।",

    exploreWritings:
      "লেখা অন্বেষণ করুন",

    followError:
      "অনুসরণের অবস্থা পরিবর্তন করা যায়নি।",

    readWriting:
      "লেখাটি পড়ুন",

    writing:
      "লেখা",

    untitled:
      "শিরোনামহীন",

    profileInformation:
      "প্রোফাইল তথ্য",

    creatorActivity:
      "লেখকের কার্যক্রম",

    accountProfile:
      "অ্যাকাউন্ট প্রোফাইল",

    profilePhoto:
      "প্রোফাইল ছবি",

    photoDescription:
      "JPG, PNG অথবা WEBP। সর্বোচ্চ ফাইল সাইজ ৫ MB।",

    choosePhoto:
      "ছবি নির্বাচন করুন",

    changePhoto:
      "ছবি পরিবর্তন করুন",

    uploadPhoto:
      "ছবি আপলোড করুন",

    uploading:
      "আপলোড হচ্ছে...",

    removePhoto:
      "ছবি সরান",

    removing:
      "সরানো হচ্ছে...",

    cancelSelection:
      "নির্বাচন বাতিল করুন",

    removePhotoConfirm:
      "আপনার বর্তমান প্রোফাইল ছবি সরাতে চান?",

    photoUpdated:
      "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে।",

    photoRemoved:
      "প্রোফাইল ছবি সরানো হয়েছে।",

    invalidPhoto:
      "প্রোফাইল ছবিটি সঠিক নয়।",

    photoUploadError:
      "প্রোফাইল ছবি আপলোড করা যায়নি।",

    photoRemoveError:
      "প্রোফাইল ছবি সরানো যায়নি।",

    coverPhoto:
      "কভার ছবি",

    coverDescription:
      "JPG, PNG অথবা WEBP। সর্বোচ্চ ফাইল সাইজ ১০ MB। প্রস্তাবিত অনুপাত ৩:১।",

    chooseCover:
      "কভার নির্বাচন করুন",

    changeCover:
      "কভার পরিবর্তন করুন",

    uploadCover:
      "কভার আপলোড করুন",

    removeCover:
      "কভার সরান",

    removeCoverConfirm:
      "আপনার বর্তমান কভার ছবি সরাতে চান?",

    coverUpdated:
      "কভার ছবি সফলভাবে আপডেট হয়েছে।",

    coverRemoved:
      "কভার ছবি সরানো হয়েছে।",

    invalidCover:
      "কভার ছবিটি সঠিক নয়।",

    coverUploadError:
      "কভার ছবি আপলোড করা যায়নি।",

    coverRemoveError:
      "কভার ছবি সরানো যায়নি।",

    coverPosition:
      "কভারের অবস্থান",

    coverPositionHelp:
      "কভারের কোন উল্লম্ব অংশটি দৃশ্যমান থাকবে তা বেছে নিতে স্লাইডার সরান।",

    saveCoverPosition:
      "অবস্থান সংরক্ষণ করুন",

    savingPosition:
      "অবস্থান সংরক্ষণ হচ্ছে...",

    coverPositionSaved:
      "কভারের অবস্থান সফলভাবে আপডেট হয়েছে।",

    coverPositionError:
      "কভারের অবস্থান আপডেট করা যায়নি।",

    selectedCover:
      "নির্বাচিত কভারের প্রিভিউ",

    currentCover:
      "বর্তমান কভার ছবি",

    defaultCover:
      "ডিফল্ট SHOBDO কভার",

    name:
      "নাম",

    username:
      "ইউজারনেম",

    bio:
      "পরিচিতি",

    namePlaceholder:
      "আপনার নাম",

    usernamePlaceholder:
      "ইউজারনেম",

    bioPlaceholder:
      "নিজের সম্পর্কে পাঠকদের কিছু বলুন...",

    locationPlaceholder:
      "শহর, দেশ",

    websitePlaceholder:
      "https://example.com",

    nameError:
      "নামে অন্তত ২টি অক্ষর থাকতে হবে।",

    saveProfile:
      "প্রোফাইল সংরক্ষণ করুন",

    saving:
      "সংরক্ষণ হচ্ছে...",

    cancel:
      "বাতিল",

    close:
      "প্রোফাইল সম্পাদনা বন্ধ করুন",

    profileUpdated:
      "প্রোফাইল সফলভাবে আপডেট হয়েছে।",

    profileUpdateError:
      "প্রোফাইল আপডেট করা যায়নি।",

    selectedPhoto:
      "নির্বাচিত ছবির প্রিভিউ",

    currentPhoto:
      "বর্তমান প্রোফাইল ছবি",

    joined:
      "যোগ দিয়েছেন",

  },


  hi: {

    writerProfile:
      "लेखक प्रोफ़ाइल",

    editProfile:
      "प्रोफ़ाइल संपादित करें",

    follow:
      "फ़ॉलो करें",

    following:
      "फ़ॉलो कर रहे हैं",

    followers:
      "फ़ॉलोअर्स",

    writings:
      "रचनाएँ",

    about:
      "परिचय",

    share:
      "साझा करें",

    shareProfile:
      "प्रोफ़ाइल साझा करें",

    linkCopied:
      "प्रोफ़ाइल लिंक कॉपी हो गया",

    memberSince:
      "{{date}} से सदस्य",

    website:
      "वेबसाइट",

    location:
      "स्थान",

    likesReceived:
      "प्राप्त पसंद",

    comments:
      "टिप्पणियाँ",

    publishedWritings:
      "प्रकाशित रचनाएँ",

    publishedWorks:
      "प्रकाशित रचनाएँ",

    writingsBy:
      "{{name}} की रचनाएँ",

    writingCount:
      "{{count}} रचना",

    writingsCount:
      "{{count}} रचनाएँ",

    noWritings:
      "अभी कोई प्रकाशित रचना नहीं है",

    noWritingsDescription:
      "इस लेखक ने अभी तक कोई रचना प्रकाशित नहीं की है।",

    noBio:
      "इस लेखक ने अभी अपने बारे में कुछ नहीं लिखा है।",

    loading:
      "लेखक प्रोफ़ाइल लोड हो रही है...",

    notFound:
      "लेखक नहीं मिला",

    unavailable:
      "यह लेखक प्रोफ़ाइल उपलब्ध नहीं है।",

    invalidWriter:
      "अमान्य लेखक आईडी।",

    loadError:
      "लेखक प्रोफ़ाइल लोड नहीं हो सकी।",

    exploreWritings:
      "रचनाएँ देखें",

    followError:
      "फ़ॉलो स्थिति अपडेट नहीं हो सकी।",

    readWriting:
      "रचना पढ़ें",

    writing:
      "रचना",

    untitled:
      "बिना शीर्षक",

    profileInformation:
      "प्रोफ़ाइल जानकारी",

    creatorActivity:
      "लेखक गतिविधि",

    accountProfile:
      "अकाउंट प्रोफ़ाइल",

    profilePhoto:
      "प्रोफ़ाइल फ़ोटो",

    photoDescription:
      "JPG, PNG या WEBP। अधिकतम फ़ाइल आकार 5 MB।",

    choosePhoto:
      "फ़ोटो चुनें",

    changePhoto:
      "फ़ोटो बदलें",

    uploadPhoto:
      "फ़ोटो अपलोड करें",

    uploading:
      "अपलोड हो रहा है...",

    removePhoto:
      "फ़ोटो हटाएँ",

    removing:
      "हटाया जा रहा है...",

    cancelSelection:
      "चयन रद्द करें",

    removePhotoConfirm:
      "क्या आप अपनी वर्तमान प्रोफ़ाइल फ़ोटो हटाना चाहते हैं?",

    photoUpdated:
      "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हुई।",

    photoRemoved:
      "प्रोफ़ाइल फ़ोटो हटा दी गई।",

    invalidPhoto:
      "अमान्य प्रोफ़ाइल फ़ोटो।",

    photoUploadError:
      "प्रोफ़ाइल फ़ोटो अपलोड नहीं हो सकी।",

    photoRemoveError:
      "प्रोफ़ाइल फ़ोटो हटाई नहीं जा सकी।",

    coverPhoto:
      "कवर फ़ोटो",

    coverDescription:
      "JPG, PNG या WEBP। अधिकतम फ़ाइल आकार 10 MB। अनुशंसित अनुपात 3:1।",

    chooseCover:
      "कवर चुनें",

    changeCover:
      "कवर बदलें",

    uploadCover:
      "कवर अपलोड करें",

    removeCover:
      "कवर हटाएँ",

    removeCoverConfirm:
      "क्या आप अपनी वर्तमान कवर फ़ोटो हटाना चाहते हैं?",

    coverUpdated:
      "कवर फ़ोटो सफलतापूर्वक अपडेट हुई।",

    coverRemoved:
      "कवर फ़ोटो हटा दी गई।",

    invalidCover:
      "अमान्य कवर फ़ोटो।",

    coverUploadError:
      "कवर फ़ोटो अपलोड नहीं हो सकी।",

    coverRemoveError:
      "कवर फ़ोटो हटाई नहीं जा सकी।",

    coverPosition:
      "कवर स्थिति",

    coverPositionHelp:
      "कवर का कौन-सा ऊर्ध्वाधर हिस्सा दिखाई दे, यह चुनने के लिए स्लाइडर चलाएँ।",

    saveCoverPosition:
      "स्थिति सहेजें",

    savingPosition:
      "स्थिति सहेजी जा रही है...",

    coverPositionSaved:
      "कवर स्थिति सफलतापूर्वक अपडेट हुई।",

    coverPositionError:
      "कवर स्थिति अपडेट नहीं हो सकी।",

    selectedCover:
      "चुनी गई कवर फ़ोटो का पूर्वावलोकन",

    currentCover:
      "वर्तमान कवर फ़ोटो",

    defaultCover:
      "डिफ़ॉल्ट SHOBDO कवर",

    name:
      "नाम",

    username:
      "यूज़रनेम",

    bio:
      "परिचय",

    namePlaceholder:
      "आपका नाम",

    usernamePlaceholder:
      "यूज़रनेम",

    bioPlaceholder:
      "अपने बारे में पाठकों को कुछ बताएँ...",

    locationPlaceholder:
      "शहर, देश",

    websitePlaceholder:
      "https://example.com",

    nameError:
      "नाम में कम से कम 2 अक्षर होने चाहिए।",

    saveProfile:
      "प्रोफ़ाइल सहेजें",

    saving:
      "सहेजा जा रहा है...",

    cancel:
      "रद्द करें",

    close:
      "प्रोफ़ाइल संपादन बंद करें",

    profileUpdated:
      "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई।",

    profileUpdateError:
      "प्रोफ़ाइल अपडेट नहीं हो सकी।",

    selectedPhoto:
      "चुनी गई फ़ोटो का पूर्वावलोकन",

    currentPhoto:
      "वर्तमान प्रोफ़ाइल फ़ोटो",

    joined:
      "जुड़े",

  },

};


const CATEGORY_LABELS = {

  en: {
    কবিতা: "Poetry",
    গল্প: "Story",
    অনুভূতি: "Feelings",
    প্রবন্ধ: "Essay",
    উপন্যাস: "Novel",
    অন্যান্য: "Other",
  },

  bn: {
    কবিতা: "কবিতা",
    গল্প: "গল্প",
    অনুভূতি: "অনুভূতি",
    প্রবন্ধ: "প্রবন্ধ",
    উপন্যাস: "উপন্যাস",
    অন্যান্য: "অন্যান্য",
  },

  hi: {
    কবিতা: "कविता",
    গল্প: "कहानी",
    অনুভূতি: "भावनाएँ",
    প্রবন্ধ: "निबंध",
    উপন্যাস: "उपन्यास",
    অন্যান্য: "अन्य",
  },

};


const WRITING_LANGUAGE_LABELS = {

  en: {
    bn: "Bengali",
    en: "English",
    hi: "Hindi",
    as: "Assamese",
    or: "Odia",
    ta: "Tamil",
    te: "Telugu",
  },

  bn: {
    bn: "বাংলা",
    en: "ইংরেজি",
    hi: "হিন্দি",
    as: "অসমীয়া",
    or: "ওড়িয়া",
    ta: "তামিল",
    te: "তেলুগু",
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


function safeNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


function cleanMetaText(
  value
) {

  return String(
    value ||
    ""
  )
    .replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


function truncateMetaDescription(
  value,
  maxLength = 158
) {

  const clean =
    cleanMetaText(
      value
    );


  if (
    clean.length <=
    maxLength
  ) {

    return clean;

  }


  return (
    `${clean
      .slice(
        0,
        Math.max(
          1,
          maxLength - 1
        )
      )
      .trim()}…`
  );

}


function getInitial(
  name
) {

  const normalized =
    String(
      name ||
      ""
    ).trim();


  if (
    !normalized
  ) {

    return "?";

  }


  return normalized
    .charAt(
      0
    )
    .toUpperCase();

}


function getWebsiteLabel(
  website
) {

  if (
    !website
  ) {

    return "";

  }


  try {

    const url =
      new URL(
        website
      );


    return url.hostname
      .replace(
        /^www\./,
        ""
      );


  } catch {

    return website;

  }

}


function interpolate(
  value,
  params = {}
) {

  let result =
    String(
      value ||
      ""
    );


  Object.entries(
    params
  ).forEach(
    ([
      key,
      replacement,
    ]) => {

      result =
        result.replaceAll(
          `{{${key}}}`,
          String(
            replacement ??
            ""
          )
        );

    }
  );


  return result;

}


function getLocale(
  language
) {

  const map = {

    en:
      "en-IN",

    bn:
      "bn-IN",

    hi:
      "hi-IN",

  };


  return (
    map[
      language
    ] ||
    "en-IN"
  );

}


function getCategoryLabel(
  language,
  category,
  fallback
) {

  return (

    CATEGORY_LABELS[
      language
    ]?.[
      category
    ]

    ||

    CATEGORY_LABELS
      .en[
        category
      ]

    ||

    fallback

    ||

    category

  );

}


function getWritingLanguageLabel(
  language,
  writingLanguage
) {

  const normalized =
    String(
      writingLanguage ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    !normalized
  ) {

    return "";

  }


  return (

    WRITING_LANGUAGE_LABELS[
      language
    ]?.[
      normalized
    ]

    ||

    WRITING_LANGUAGE_LABELS
      .en[
        normalized
      ]

    ||

    normalized.toUpperCase()

  );

}


function WriterProfile() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    language,
  } = useLanguage();


  const copy =
    PROFILE_COPY[
      language
    ] ||
    PROFILE_COPY.en;


  const avatarInputRef =
    useRef(
      null
    );


  const coverInputRef =
    useRef(
      null
    );


  const userId =
    Number(
      id
    );


  const validUserId =
    Number.isInteger(
      userId
    ) &&
    userId >
      0;


  const isLoggedIn =
    Boolean(
      getToken()
    );


  const [
    profile,
    setProfile,
  ] = useState(
    null
  );


  const [
    stats,
    setStats,
  ] = useState({

    writings_count:
      0,

    likes_count:
      0,

    comments_count:
      0,

    followers_count:
      0,

    following_count:
      0,

  });


  const [
    writings,
    setWritings,
  ] = useState(
    []
  );


  const [
    following,
    setFollowing,
  ] = useState(
    false
  );


  const [
    isSelf,
    setIsSelf,
  ] = useState(
    false
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
    activeTab,
    setActiveTab,
  ] = useState(
    "writings"
  );


  const [
    shareStatus,
    setShareStatus,
  ] = useState(
    ""
  );


  const [
    followLoading,
    setFollowLoading,
  ] = useState(
    false
  );


  const [
    editOpen,
    setEditOpen,
  ] = useState(
    false
  );


  const [
    editForm,
    setEditForm,
  ] = useState({

    name:
      "",

    username:
      "",

    bio:
      "",

    location:
      "",

    website:
      "",

  });


  const [
    profileSaving,
    setProfileSaving,
  ] = useState(
    false
  );


  const [
    profileError,
    setProfileError,
  ] = useState(
    ""
  );


  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState(
    ""
  );


  const [
    avatarFile,
    setAvatarFile,
  ] = useState(
    null
  );


  const [
    avatarPreviewUrl,
    setAvatarPreviewUrl,
  ] = useState(
    ""
  );


  const [
    avatarUploading,
    setAvatarUploading,
  ] = useState(
    false
  );


  const [
    avatarRemoving,
    setAvatarRemoving,
  ] = useState(
    false
  );


  const [
    avatarError,
    setAvatarError,
  ] = useState(
    ""
  );


  const [
    avatarSuccess,
    setAvatarSuccess,
  ] = useState(
    ""
  );


  const [
    avatarVersion,
    setAvatarVersion,
  ] = useState(
    Date.now()
  );


  const [
    coverFile,
    setCoverFile,
  ] = useState(
    null
  );


  const [
    coverPreviewUrl,
    setCoverPreviewUrl,
  ] = useState(
    ""
  );


  const [
    coverUploading,
    setCoverUploading,
  ] = useState(
    false
  );


  const [
    coverRemoving,
    setCoverRemoving,
  ] = useState(
    false
  );


  const [
    coverPositionSaving,
    setCoverPositionSaving,
  ] = useState(
    false
  );


  const [
    coverError,
    setCoverError,
  ] = useState(
    ""
  );


  const [
    coverSuccess,
    setCoverSuccess,
  ] = useState(
    ""
  );


  const [
    coverDraftPosition,
    setCoverDraftPosition,
  ] = useState(
    50
  );


  const [
    coverVersion,
    setCoverVersion,
  ] = useState(
    Date.now()
  );


  useEffect(
    () => {

      let mounted =
        true;


      async function loadProfile() {

        if (
          !validUserId
        ) {

          if (
            mounted
          ) {

            setProfile(
              null
            );


            setError(
              copy.invalidWriter
            );


            setLoading(
              false
            );

          }


          return;

        }


        setLoading(
          true
        );


        setError(
          ""
        );


        try {

          const [
            profileData,
            writingsData,
          ] =
            await Promise.all([

              getWriterProfile(
                userId
              ),

              getWriterWritings(
                userId
              ),

            ]);


          if (
            !mounted
          ) {

            return;

          }


          const loadedProfile =

            profileData
              ?.user

            ||

            (
              profileData?.id
                ? profileData
                : null
            );


          if (
            !loadedProfile
          ) {

            throw new Error(
              copy.notFound
            );

          }


          setProfile(
            loadedProfile
          );


          setStats({

            writings_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.writings_count
              ),

            likes_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.likes_count
              ),

            comments_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.comments_count
              ),

            followers_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.followers_count
              ),

            following_count:
              safeNumber(
                profileData
                  ?.stats
                  ?.following_count
              ),

          });


          setWritings(

            Array.isArray(
              writingsData
                ?.writings
            )

              ? writingsData
                  .writings

              : Array.isArray(
                  writingsData
                )

                ? writingsData

                : []

          );


          if (
            isLoggedIn
          ) {

            try {

              const followData =
                await getFollowStatus(
                  userId
                );


              if (
                !mounted
              ) {

                return;

              }


              setFollowing(
                Boolean(
                  followData
                    ?.following
                )
              );


              setIsSelf(
                Boolean(
                  followData
                    ?.is_self
                )
              );


              setStats(
                (
                  current
                ) => ({

                  ...current,

                  followers_count:
                    safeNumber(
                      followData
                        ?.followers_count
                      ??
                      current
                        .followers_count
                    ),

                  following_count:
                    safeNumber(
                      followData
                        ?.following_count
                      ??
                      current
                        .following_count
                    ),

                })
              );


            } catch (
              followStatusError
            ) {

              console.error(
                "FOLLOW STATUS ERROR:",
                followStatusError
              );

            }


          } else {

            setFollowing(
              false
            );


            setIsSelf(
              false
            );

          }


        } catch (
          loadError
        ) {

          console.error(
            "WRITER PROFILE ERROR:",
            loadError
          );


          if (
            mounted
          ) {

            setProfile(
              null
            );


            setError(

              language ===
                "en"

                ? (
                    loadError
                      ?.message
                    ||
                    copy.loadError
                  )

                : copy.loadError

            );

          }


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


      loadProfile();


      return () => {

        mounted =
          false;

      };

    },
    [
      userId,
      validUserId,
      isLoggedIn,
      language,
      copy.invalidWriter,
      copy.loadError,
      copy.notFound,
    ]
  );


  useEffect(
    () => {

      return () => {

        if (
          avatarPreviewUrl
        ) {

          URL.revokeObjectURL(
            avatarPreviewUrl
          );

        }

      };

    },
    [
      avatarPreviewUrl,
    ]
  );


  useEffect(
    () => {

      return () => {

        if (
          coverPreviewUrl
        ) {

          URL.revokeObjectURL(
            coverPreviewUrl
          );

        }

      };

    },
    [
      coverPreviewUrl,
    ]
  );


  useEffect(
    () => {

      if (
        !shareStatus
      ) {

        return undefined;

      }


      const timer =
        window.setTimeout(
          () => {

            setShareStatus(
              ""
            );

          },
          2500
        );


      return () => {

        window.clearTimeout(
          timer
        );

      };

    },
    [
      shareStatus,
    ]
  );


  const memberSince =
    useMemo(
      () => {

        if (
          !profile?.created_at
        ) {

          return "";

        }


        const date =
          new Date(
            profile.created_at
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return "";

        }


        try {

          return (
            new Intl.DateTimeFormat(
              getLocale(
                language
              ),
              {
                month:
                  "long",

                year:
                  "numeric",
              }
            ).format(
              date
            )
          );


        } catch {

          return date
            .toLocaleDateString();

        }

      },
      [
        profile?.created_at,
        language,
      ]
    );


  const displayedAvatarUrl =
    useMemo(
      () => {

        if (
          !profile?.avatar_url
        ) {

          return "";

        }


        try {

          const url =
            new URL(
              profile.avatar_url
            );


          url.searchParams.set(
            "shobdo_avatar",
            String(
              avatarVersion
            )
          );


          return url.toString();


        } catch {

          return profile
            .avatar_url;

        }

      },
      [
        profile?.avatar_url,
        avatarVersion,
      ]
    );


  const displayedCoverUrl =
    useMemo(
      () => {

        if (
          !profile?.cover_photo_url
        ) {

          return "";

        }


        try {

          const url =
            new URL(
              profile.cover_photo_url
            );


          url.searchParams.set(
            "shobdo_cover",
            String(
              coverVersion
            )
          );


          return url.toString();


        } catch {

          return profile
            .cover_photo_url;

        }

      },
      [
        profile?.cover_photo_url,
        coverVersion,
      ]
    );


  const currentCoverPosition =
    Math.max(
      0,
      Math.min(
        100,
        safeNumber(
          profile
            ?.cover_photo_position_y ??
          50
        )
      )
    );


  function openEditProfile() {

    if (
      !isSelf ||
      !profile
    ) {

      return;

    }


    setEditForm({

      name:
        profile.name ||
        "",

      username:
        profile.username ||
        "",

      bio:
        profile.bio ||
        "",

      location:
        profile.location ||
        "",

      website:
        profile.website ||
        "",

    });


    setProfileError(
      ""
    );


    setProfileSuccess(
      ""
    );


    setAvatarError(
      ""
    );


    setAvatarSuccess(
      ""
    );


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    setCoverDraftPosition(
      Math.max(
        0,
        Math.min(
          100,
          safeNumber(
            profile
              .cover_photo_position_y ??
            50
          )
        )
      )
    );


    setEditOpen(
      true
    );

  }


  function closeEditProfile() {

    if (
      profileSaving ||
      avatarUploading ||
      avatarRemoving ||
      coverUploading ||
      coverRemoving ||
      coverPositionSaving
    ) {

      return;

    }


    if (
      avatarPreviewUrl
    ) {

      URL.revokeObjectURL(
        avatarPreviewUrl
      );

    }


    setAvatarFile(
      null
    );


    setAvatarPreviewUrl(
      ""
    );


    setAvatarError(
      ""
    );


    setAvatarSuccess(
      ""
    );


    if (
      coverPreviewUrl
    ) {

      URL.revokeObjectURL(
        coverPreviewUrl
      );

    }


    setCoverFile(
      null
    );


    setCoverPreviewUrl(
      ""
    );


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    setCoverDraftPosition(
      currentCoverPosition
    );


    setProfileError(
      ""
    );


    setProfileSuccess(
      ""
    );


    setEditOpen(
      false
    );


    if (
      avatarInputRef
        .current
    ) {

      avatarInputRef
        .current
        .value =
        "";

    }


    if (
      coverInputRef
        .current
    ) {

      coverInputRef
        .current
        .value =
        "";

    }

  }


  function handleEditChange(
    event
  ) {

    const {
      name,
      value,
    } =
      event.target;


    setEditForm(
      (
        current
      ) => ({

        ...current,

        [name]:
          value,

      })
    );


    setProfileError(
      ""
    );


    setProfileSuccess(
      ""
    );

  }


  async function handleSaveProfile(
    event
  ) {

    event.preventDefault();


    if (
      profileSaving
    ) {

      return;

    }


    const normalizedName =
      editForm
        .name
        .trim();


    const normalizedUsername =
      editForm
        .username
        .trim()
        .replace(
          /^@+/,
          ""
        );


    if (
      normalizedName.length <
        2
    ) {

      setProfileError(
        copy.nameError
      );


      return;

    }


    setProfileSaving(
      true
    );


    setProfileError(
      ""
    );


    setProfileSuccess(
      ""
    );


    try {

      const result =
        await updateMyProfile({

          name:
            normalizedName,

          username:
            normalizedUsername,

          bio:
            editForm
              .bio
              .trim(),

          location:
            editForm
              .location
              .trim(),

          website:
            editForm
              .website
              .trim(),

        });


      if (
        result?.user
      ) {

        setProfile(
          (
            current
          ) => ({

            ...current,

            ...result.user,

          })
        );


        setEditForm(
          (
            current
          ) => ({

            ...current,

            name:
              result
                .user
                ?.name
              ??
              current.name,

            username:
              result
                .user
                ?.username
              ??
              "",

            bio:
              result
                .user
                ?.bio
              ??
              "",

            location:
              result
                .user
                ?.location
              ??
              "",

            website:
              result
                .user
                ?.website
              ??
              "",

          })
        );

      }


      setProfileSuccess(
        copy.profileUpdated
      );


    } catch (
      saveError
    ) {

      console.error(
        "PROFILE UPDATE ERROR:",
        saveError
      );


      setProfileError(

        language ===
          "en"

          ? (
              saveError
                ?.message
              ||
              copy.profileUpdateError
            )

          : copy.profileUpdateError

      );


    } finally {

      setProfileSaving(
        false
      );

    }

  }


  function handleAvatarSelection(
    event
  ) {

    const file =
      event.target
        .files?.[
          0
        ];


    if (
      !file
    ) {

      return;

    }


    setAvatarError(
      ""
    );


    setAvatarSuccess(
      ""
    );


    try {

      validateProfileAvatar(
        file
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );

      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      setAvatarFile(
        file
      );


      setAvatarPreviewUrl(
        previewUrl
      );


    } catch (
      validationError
    ) {

      console.error(
        "AVATAR VALIDATION ERROR:",
        validationError
      );


      setAvatarFile(
        null
      );


      setAvatarPreviewUrl(
        ""
      );


      setAvatarError(

        language ===
          "en"

          ? (
              validationError
                ?.message
              ||
              copy.invalidPhoto
            )

          : copy.invalidPhoto

      );


      if (
        avatarInputRef
          .current
      ) {

        avatarInputRef
          .current
          .value =
          "";

      }

    }

  }


  function cancelAvatarSelection() {

    if (
      avatarUploading
    ) {

      return;

    }


    if (
      avatarPreviewUrl
    ) {

      URL.revokeObjectURL(
        avatarPreviewUrl
      );

    }


    setAvatarFile(
      null
    );


    setAvatarPreviewUrl(
      ""
    );


    setAvatarError(
      ""
    );


    if (
      avatarInputRef
        .current
    ) {

      avatarInputRef
        .current
        .value =
        "";

    }

  }


  async function handleAvatarUpload() {

    if (
      !avatarFile ||
      avatarUploading
    ) {

      return;

    }


    setAvatarUploading(
      true
    );


    setAvatarError(
      ""
    );


    setAvatarSuccess(
      ""
    );


    try {

      const result =
        await uploadMyProfileAvatar(
          avatarFile
        );


      const nextAvatarUrl =

        result?.avatar_url

        ||

        result
          ?.user
          ?.avatar_url

        ||

        "";


      setProfile(
        (
          current
        ) => ({

          ...current,

          ...(
            result?.user ||
            {}
          ),

          avatar_url:
            nextAvatarUrl ||
            current
              ?.avatar_url ||
            null,

        })
      );


      setAvatarVersion(
        Date.now()
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );

      }


      setAvatarFile(
        null
      );


      setAvatarPreviewUrl(
        ""
      );


      if (
        avatarInputRef
          .current
      ) {

        avatarInputRef
          .current
          .value =
          "";

      }


      setAvatarSuccess(
        copy.photoUpdated
      );


    } catch (
      uploadError
    ) {

      console.error(
        "PROFILE AVATAR UPLOAD ERROR:",
        uploadError
      );


      setAvatarError(

        language ===
          "en"

          ? (
              uploadError
                ?.message
              ||
              copy.photoUploadError
            )

          : copy.photoUploadError

      );


    } finally {

      setAvatarUploading(
        false
      );

    }

  }


  async function handleRemoveAvatar() {

    if (
      avatarRemoving ||
      !profile?.avatar_url
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        copy.removePhotoConfirm
      );


    if (
      !confirmed
    ) {

      return;

    }


    setAvatarRemoving(
      true
    );


    setAvatarError(
      ""
    );


    setAvatarSuccess(
      ""
    );


    try {

      const result =
        await removeMyProfileAvatar();


      setProfile(
        (
          current
        ) => ({

          ...current,

          ...(
            result?.user ||
            {}
          ),

          avatar_url:
            null,

        })
      );


      setAvatarVersion(
        Date.now()
      );


      if (
        avatarPreviewUrl
      ) {

        URL.revokeObjectURL(
          avatarPreviewUrl
        );

      }


      setAvatarFile(
        null
      );


      setAvatarPreviewUrl(
        ""
      );


      if (
        avatarInputRef
          .current
      ) {

        avatarInputRef
          .current
          .value =
          "";

      }


      setAvatarSuccess(
        copy.photoRemoved
      );


    } catch (
      removeError
    ) {

      console.error(
        "PROFILE AVATAR REMOVE ERROR:",
        removeError
      );


      setAvatarError(

        language ===
          "en"

          ? (
              removeError
                ?.message
              ||
              copy.photoRemoveError
            )

          : copy.photoRemoveError

      );


    } finally {

      setAvatarRemoving(
        false
      );

    }

  }


  function handleCoverSelection(
    event
  ) {

    const file =
      event.target
        .files?.[
          0
        ];


    if (
      !file
    ) {

      return;

    }


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    try {

      validateProfileCover(
        file
      );


      if (
        coverPreviewUrl
      ) {

        URL.revokeObjectURL(
          coverPreviewUrl
        );

      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      setCoverFile(
        file
      );


      setCoverPreviewUrl(
        previewUrl
      );


      setCoverDraftPosition(
        currentCoverPosition
      );


      if (
        !editOpen
      ) {

        openEditProfile();

      }


    } catch (
      validationError
    ) {

      console.error(
        "COVER VALIDATION ERROR:",
        validationError
      );


      setCoverFile(
        null
      );


      setCoverPreviewUrl(
        ""
      );


      setCoverError(

        language ===
          "en"

          ? (
              validationError
                ?.message
              ||
              copy.invalidCover
            )

          : copy.invalidCover

      );


      if (
        coverInputRef
          .current
      ) {

        coverInputRef
          .current
          .value =
          "";

      }

    }

  }


  function cancelCoverSelection() {

    if (
      coverUploading
    ) {

      return;

    }


    if (
      coverPreviewUrl
    ) {

      URL.revokeObjectURL(
        coverPreviewUrl
      );

    }


    setCoverFile(
      null
    );


    setCoverPreviewUrl(
      ""
    );


    setCoverError(
      ""
    );


    setCoverDraftPosition(
      currentCoverPosition
    );


    if (
      coverInputRef
        .current
    ) {

      coverInputRef
        .current
        .value =
        "";

    }

  }


  async function handleCoverUpload() {

    if (
      !coverFile ||
      coverUploading
    ) {

      return;

    }


    const requestedPosition =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            safeNumber(
              coverDraftPosition
            )
          )
        )
      );


    setCoverUploading(
      true
    );


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    try {

      const result =
        await uploadMyProfileCover(
          coverFile
        );


      const nextCoverUrl =

        result
          ?.cover_photo_url

        ||

        result
          ?.user
          ?.cover_photo_url

        ||

        "";


      let nextPosition =
        Math.max(
          0,
          Math.min(
            100,
            safeNumber(
              result
                ?.cover_photo_position_y
              ??
              result
                ?.user
                ?.cover_photo_position_y
              ??
              50
            )
          )
        );


      let mergedUser = {

        ...(
          result?.user ||
          {}
        ),

      };


      if (
        nextCoverUrl &&
        requestedPosition !==
          nextPosition
      ) {

        try {

          const positionResult =
            await updateMyProfileCoverPosition(
              requestedPosition
            );


          nextPosition =
            Math.max(
              0,
              Math.min(
                100,
                safeNumber(
                  positionResult
                    ?.cover_photo_position_y
                  ??
                  positionResult
                    ?.user
                    ?.cover_photo_position_y
                  ??
                  requestedPosition
                )
              )
            );


          mergedUser = {

            ...mergedUser,

            ...(
              positionResult
                ?.user ||
              {}
            ),

          };


        } catch (
          positionError
        ) {

          console.error(
            "COVER POSITION AFTER UPLOAD ERROR:",
            positionError
          );


          setCoverError(
            copy.coverPositionError
          );

        }

      }


      setProfile(
        (
          current
        ) => ({

          ...current,

          ...mergedUser,

          cover_photo_url:
            nextCoverUrl ||
            current
              ?.cover_photo_url ||
            null,

          cover_photo_position_y:
            nextPosition,

        })
      );


      setCoverDraftPosition(
        nextPosition
      );


      setCoverVersion(
        Date.now()
      );


      if (
        coverPreviewUrl
      ) {

        URL.revokeObjectURL(
          coverPreviewUrl
        );

      }


      setCoverFile(
        null
      );


      setCoverPreviewUrl(
        ""
      );


      if (
        coverInputRef
          .current
      ) {

        coverInputRef
          .current
          .value =
          "";

      }


      setCoverSuccess(
        copy.coverUpdated
      );


    } catch (
      uploadError
    ) {

      console.error(
        "PROFILE COVER UPLOAD ERROR:",
        uploadError
      );


      setCoverError(

        language ===
          "en"

          ? (
              uploadError
                ?.message
              ||
              copy.coverUploadError
            )

          : copy.coverUploadError

      );


    } finally {

      setCoverUploading(
        false
      );

    }

  }


  async function handleRemoveCover() {

    if (
      coverRemoving ||
      !profile
        ?.cover_photo_url
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        copy.removeCoverConfirm
      );


    if (
      !confirmed
    ) {

      return;

    }


    setCoverRemoving(
      true
    );


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    try {

      const result =
        await removeMyProfileCover();


      setProfile(
        (
          current
        ) => ({

          ...current,

          ...(
            result?.user ||
            {}
          ),

          cover_photo_url:
            null,

          cover_photo_position_y:
            50,

        })
      );


      setCoverVersion(
        Date.now()
      );


      setCoverDraftPosition(
        50
      );


      if (
        coverPreviewUrl
      ) {

        URL.revokeObjectURL(
          coverPreviewUrl
        );

      }


      setCoverFile(
        null
      );


      setCoverPreviewUrl(
        ""
      );


      if (
        coverInputRef
          .current
      ) {

        coverInputRef
          .current
          .value =
          "";

      }


      setCoverSuccess(
        copy.coverRemoved
      );


    } catch (
      removeError
    ) {

      console.error(
        "PROFILE COVER REMOVE ERROR:",
        removeError
      );


      setCoverError(

        language ===
          "en"

          ? (
              removeError
                ?.message
              ||
              copy.coverRemoveError
            )

          : copy.coverRemoveError

      );


    } finally {

      setCoverRemoving(
        false
      );

    }

  }


  async function handleSaveCoverPosition() {

    if (
      coverPositionSaving ||
      !profile
        ?.cover_photo_url
    ) {

      return;

    }


    const normalizedPosition =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            safeNumber(
              coverDraftPosition
            )
          )
        )
      );


    setCoverPositionSaving(
      true
    );


    setCoverError(
      ""
    );


    setCoverSuccess(
      ""
    );


    try {

      const result =
        await updateMyProfileCoverPosition(
          normalizedPosition
        );


      const nextPosition =
        Math.max(
          0,
          Math.min(
            100,
            safeNumber(
              result
                ?.cover_photo_position_y
              ??
              result
                ?.user
                ?.cover_photo_position_y
              ??
              normalizedPosition
            )
          )
        );


      setProfile(
        (
          current
        ) => ({

          ...current,

          ...(
            result?.user ||
            {}
          ),

          cover_photo_position_y:
            nextPosition,

        })
      );


      setCoverDraftPosition(
        nextPosition
      );


      setCoverSuccess(
        copy.coverPositionSaved
      );


    } catch (
      positionError
    ) {

      console.error(
        "COVER POSITION UPDATE ERROR:",
        positionError
      );


      setCoverError(

        language ===
          "en"

          ? (
              positionError
                ?.message
              ||
              copy.coverPositionError
            )

          : copy.coverPositionError

      );


    } finally {

      setCoverPositionSaving(
        false
      );

    }

  }


  async function handleFollow() {

    if (
      followLoading ||
      !validUserId
    ) {

      return;

    }


    if (
      !isLoggedIn
    ) {

      navigate(
        "/login",
        {
          state: {

            from:
              `${location.pathname}${location.search}${location.hash}`,

          },
        }
      );


      return;

    }


    if (
      isSelf
    ) {

      return;

    }


    const previousFollowing =
      following;


    const previousFollowers =
      safeNumber(
        stats
          ?.followers_count
      );


    setFollowLoading(
      true
    );


    setFollowing(
      !previousFollowing
    );


    setStats(
      (
        current
      ) => ({

        ...current,

        followers_count:
          Math.max(
            0,
            previousFollowers +
            (
              previousFollowing
                ? -1
                : 1
            )
          ),

      })
    );


    try {

      const result =
        previousFollowing

          ? await unfollowUser(
              userId
            )

          : await followUser(
              userId
            );


      setFollowing(

        typeof result
          ?.following ===
          "boolean"

          ? result.following

          : !previousFollowing

      );


      setStats(
        (
          current
        ) => ({

          ...current,

          followers_count:
            safeNumber(
              result
                ?.followers_count
              ??
              current
                .followers_count
            ),

          following_count:
            safeNumber(
              result
                ?.following_count
              ??
              current
                .following_count
            ),

        })
      );


    } catch (
      followError
    ) {

      console.error(
        "FOLLOW ACTION ERROR:",
        followError
      );


      setFollowing(
        previousFollowing
      );


      setStats(
        (
          current
        ) => ({

          ...current,

          followers_count:
            previousFollowers,

        })
      );


      window.alert(

        language ===
          "en"

          ? (
              followError
                ?.message
              ||
              copy.followError
            )

          : copy.followError

      );


    } finally {

      setFollowLoading(
        false
      );

    }

  }


  async function handleShareProfile() {

    if (
      !profile
    ) {

      return;

    }


    const profileUrl =
      window.location.href;


    const shareDescription =
      truncateMetaDescription(

        profile.bio

        ||

        `Discover ${profile.name || "this writer"} on SHOBDO.`

      );


    const shareData = {

      title:
        `${profile.name || "Writer"} — SHOBDO`,

      text:
        shareDescription,

      url:
        profileUrl,

    };


    try {

      if (
        navigator.share
      ) {

        await navigator.share(
          shareData
        );


        return;

      }


      if (
        navigator.clipboard
      ) {

        await navigator
          .clipboard
          .writeText(
            profileUrl
          );


        setShareStatus(
          copy.linkCopied
        );


        return;

      }


      window.prompt(
        copy.shareProfile,
        profileUrl
      );


    } catch (
      shareError
    ) {

      if (
        shareError
          ?.name !==
        "AbortError"
      ) {

        console.error(
          "PROFILE SHARE ERROR:",
          shareError
        );

      }

    }

  }


  function getWritingDate(
    writing
  ) {

    const value =

      writing
        ?.published_at

      ||

      writing
        ?.created_at;


    if (
      !value
    ) {

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


    try {

      return (
        new Intl.DateTimeFormat(
          getLocale(
            language
          ),
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
        )
      );


    } catch {

      return "";

    }

  }


  if (
    loading
  ) {

    return (

      <>

        <SEO
          title="Loading Writer Profile"
          description="Loading a writer profile from the SHOBDO community."
          noIndex
        />


        <main
          className="writer-profile-page"
        >

          <div
            className="writer-profile-shell"
          >

            <div
              className="writer-profile-state"
              role="status"
              aria-live="polite"
            >

              <Loader2
                size={36}
                className="spin"
              />


              <p>
                {copy.loading}
              </p>

            </div>

          </div>

        </main>

      </>

    );

  }


  if (
    error ||
    !profile
  ) {

    return (

      <>

        <SEO
          title="Writer Not Found"
          description="This SHOBDO writer profile could not be found or is currently unavailable."
          noIndex
        />


        <main
          className="writer-profile-page"
        >

          <div
            className="writer-profile-shell"
          >

            <section
              className="writer-profile-state"
            >

              <Users
                size={42}
              />


              <h1>
                {copy.notFound}
              </h1>


              <p>

                {
                  error ||
                  copy.unavailable
                }

              </p>


              <Link
                to="/explore"
                className="writer-profile-primary-link"
              >

                {copy.exploreWritings}

              </Link>

            </section>

          </div>

        </main>

      </>

    );

  }


  const writingsCount =
    safeNumber(
      stats
        .writings_count
      ||
      writings.length
    );


  const followersCount =
    safeNumber(
      stats
        .followers_count
    );


  const followingCount =
    safeNumber(
      stats
        .following_count
    );


  const likesCount =
    safeNumber(
      stats
        .likes_count
    );


  const commentsCount =
    safeNumber(
      stats
        .comments_count
    );


  const seoProfileName =
    cleanMetaText(

      profile.name

      ||

      profile.username

      ||

      copy.writerProfile

    );


  const seoUsername =
    String(
      profile.username ||
      ""
    )
      .trim()
      .replace(
        /^@+/,
        ""
      );


  const seoTitle =
    seoUsername

      ? `${seoProfileName} (@${seoUsername})`

      : seoProfileName;


  const seoFallbackDescription =

    language ===
      "bn"

      ? `${seoProfileName}-এর প্রকাশিত লেখা, পরিচিতি ও SHOBDO প্রোফাইল দেখুন।`

      : language ===
          "hi"

        ? `${seoProfileName} की प्रकाशित रचनाएँ, परिचय और SHOBDO प्रोफ़ाइल देखें।`

        : `Discover ${seoProfileName}'s published writings, profile and creative work on SHOBDO.`;


  const seoDescription =
    truncateMetaDescription(

      profile.bio

      ||

      seoFallbackDescription

    );


  const seoPath =
    `/users/${
      profile.id ||
      userId
    }`;


  const seoImage =
    profile.cover_photo_url ||
    profile.avatar_url ||
    undefined;


  // =====================================================
  // GOOGLE STRUCTURED DATA
  // PROFILE PAGE + PERSON
  // =====================================================

  const siteUrl =
    String(
      import.meta.env.VITE_PUBLIC_SITE_URL ||
      "https://shobdoverse.com"
    )
      .trim()
      .replace(
        /\/+$/,
        ""
      );


  const profileUrl =
    `${siteUrl}${seoPath}`;


  const personId =
    `${profileUrl}#person`;


  const profilePageStructuredData = {

    "@type":
      "ProfilePage",

    "@id":
      `${profileUrl}#profilepage`,

    url:
      profileUrl,

    name:
      seoTitle,

    description:
      seoDescription,

    inLanguage:
      language ||
      "en",

    mainEntity: {

      "@id":
        personId,

    },

  };


  const personStructuredData = {

    "@type":
      "Person",

    "@id":
      personId,

    name:
      seoProfileName,

    url:
      profileUrl,

    ...(seoUsername
      ? {

          alternateName:
            `@${seoUsername}`,

          identifier:
            seoUsername,

        }
      : {

          identifier:
            String(
              profile.id ||
              userId
            ),

        }),

    ...(profile.bio
      ? {

          description:
            cleanMetaText(
              profile.bio
            ),

        }
      : {}),

    ...(profile.avatar_url
      ? {

          image:
            profile.avatar_url,

        }
      : {}),

    ...(profile.website
      ? {

          sameAs: [
            profile.website,
          ],

        }
      : {}),

    ...(profile.location
      ? {

          homeLocation: {

            "@type":
              "Place",

            name:
              cleanMetaText(
                profile.location
              ),

          },

        }
      : {}),

  };


  const profileStructuredData = [

    profilePageStructuredData,

    personStructuredData,

  ];


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
          seoPath
        }
        type="profile"
        image={
          seoImage
        }
        structuredData={
          profileStructuredData
        }
      />


      <main
        className="writer-profile-page"
      >

        <div
          className="writer-profile-shell"
        >

          <section
            className="writer-social-profile-card"
          >

            <div
              className={
                (
                  coverPreviewUrl ||
                  displayedCoverUrl
                )

                  ? "writer-social-cover has-cover-photo"

                  : "writer-social-cover"
              }
              style={
                (
                  coverPreviewUrl ||
                  displayedCoverUrl
                )

                  ? {
                      backgroundImage:
                        `url("${
                          coverPreviewUrl ||
                          displayedCoverUrl
                        }")`,

                      backgroundPosition:
                        `center ${
                          coverPreviewUrl
                            ? coverDraftPosition
                            : currentCoverPosition
                        }%`,
                    }

                  : undefined
              }
            >

              {
                !(
                  coverPreviewUrl ||
                  displayedCoverUrl
                ) && (

                  <span
                    className="writer-cover-word"
                  >
                    SHOBDO
                  </span>

                )
              }


              {
                isSelf && (

                  <>

                    <input
                      ref={
                        coverInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      hidden
                      onChange={
                        handleCoverSelection
                      }
                    />


                    <button
                      type="button"
                      className="writer-cover-edit-button"
                      onClick={
                        () =>
                          coverInputRef
                            .current
                            ?.click()
                      }
                      disabled={
                        coverUploading ||
                        coverRemoving ||
                        coverPositionSaving
                      }
                    >

                      <Camera
                        size={17}
                      />

                      <span>

                        {
                          profile
                            .cover_photo_url

                            ? copy.changeCover

                            : copy.chooseCover
                        }

                      </span>

                    </button>

                  </>

                )
              }

            </div>


            <div
              className="writer-social-profile-content"
            >

              <div
                className="writer-social-profile-top"
              >

                <div
                  className="writer-profile-avatar"
                >

                  {
                    displayedAvatarUrl

                      ? (

                          <img
                            src={
                              displayedAvatarUrl
                            }
                            alt={
                              `${profile.name || "Writer"} profile`
                            }
                            onLoad={
                              (
                                event
                              ) => {

                                event
                                  .currentTarget
                                  .style
                                  .display =
                                  "block";

                              }
                            }
                            onError={
                              (
                                event
                              ) => {

                                event
                                  .currentTarget
                                  .style
                                  .display =
                                  "none";

                              }
                            }
                          />

                        )

                      : getInitial(
                          profile.name
                        )
                  }

                </div>


                <div
                  className="writer-profile-actions"
                >

                  {
                    !isSelf && (

                      <button
                        type="button"
                        className={
                          following

                            ? "writer-follow-button following"

                            : "writer-follow-button"
                        }
                        onClick={
                          handleFollow
                        }
                        disabled={
                          followLoading
                        }
                      >

                        {
                          followLoading

                            ? (

                                <Loader2
                                  size={17}
                                  className="spin"
                                />

                              )

                            : following

                              ? (

                                  <UserCheck
                                    size={17}
                                  />

                                )

                              : (

                                  <UserPlus
                                    size={17}
                                  />

                                )
                        }


                        <span>

                          {
                            following

                              ? copy.following

                              : copy.follow
                          }

                        </span>

                      </button>

                    )
                  }


                  {
                    isSelf && (

                      <button
                        type="button"
                        className="writer-profile-edit-button"
                        onClick={
                          openEditProfile
                        }
                      >

                        <Pencil
                          size={16}
                        />

                        <span>
                          {copy.editProfile}
                        </span>

                      </button>

                    )
                  }


                  <button
                    type="button"
                    className="writer-profile-share-button"
                    onClick={
                      handleShareProfile
                    }
                    title={
                      copy.shareProfile
                    }
                  >

                    {
                      shareStatus

                        ? (

                            <CheckCircle2
                              size={17}
                            />

                          )

                        : (

                            <Share2
                              size={17}
                            />

                          )
                    }


                    <span>

                      {
                        shareStatus ||
                        copy.share
                      }

                    </span>

                  </button>

                </div>

              </div>


              <div
                className="writer-social-identity"
              >

                <p
                  className="writer-profile-eyebrow"
                >
                  {copy.writerProfile}
                </p>


                <h1>
                  {profile.name}
                </h1>


                {
                  profile.username && (

                    <p
                      className="writer-profile-username"
                    >
                      @{profile.username}
                    </p>

                  )
                }


                {
                  profile.bio && (

                    <p
                      className="writer-profile-bio"
                    >
                      {profile.bio}
                    </p>

                  )
                }


                <div
                  className="writer-profile-meta"
                >

                  {
                    profile.location && (

                      <span>

                        <MapPin
                          size={15}
                        />

                        {
                          profile.location
                        }

                      </span>

                    )
                  }


                  {
                    profile.website && (

                      <a
                        href={
                          profile.website
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >

                        <Globe2
                          size={15}
                        />

                        {
                          getWebsiteLabel(
                            profile.website
                          )
                        }

                        <ExternalLink
                          size={12}
                        />

                      </a>

                    )
                  }


                  {
                    memberSince && (

                      <span>

                        <CalendarDays
                          size={15}
                        />

                        {
                          interpolate(
                            copy.memberSince,
                            {
                              date:
                                memberSince,
                            }
                          )
                        }

                      </span>

                    )
                  }

                </div>


                <div
                  className="writer-social-stats"
                >

                  <button
                    type="button"
                    className="writer-social-stat"
                    onClick={
                      () =>
                        setActiveTab(
                          "writings"
                        )
                    }
                  >

                    <strong>
                      {writingsCount}
                    </strong>

                    <span>
                      {copy.writings}
                    </span>

                  </button>


                  <Link
                    to={
                      `/users/${userId}/followers`
                    }
                    className="writer-social-stat"
                  >

                    <strong>
                      {followersCount}
                    </strong>

                    <span>
                      {copy.followers}
                    </span>

                  </Link>


                  <Link
                    to={
                      `/users/${userId}/following`
                    }
                    className="writer-social-stat"
                  >

                    <strong>
                      {followingCount}
                    </strong>

                    <span>
                      {copy.following}
                    </span>

                  </Link>

                </div>

              </div>

            </div>

          </section>


          {
            isSelf &&
            editOpen && (

              <section
                className="writer-profile-edit-panel"
              >

                <div
                  className="writer-profile-edit-heading"
                >

                  <div>

                    <p
                      className="writer-profile-eyebrow"
                    >
                      {copy.accountProfile}
                    </p>

                    <h2>
                      {copy.editProfile}
                    </h2>

                  </div>


                  <button
                    type="button"
                    className="writer-profile-close-button"
                    onClick={
                      closeEditProfile
                    }
                    disabled={
                      profileSaving ||
                      avatarUploading ||
                      avatarRemoving ||
                      coverUploading ||
                      coverRemoving ||
                      coverPositionSaving
                    }
                    aria-label={
                      copy.close
                    }
                  >

                    <X
                      size={18}
                    />

                  </button>

                </div>


                <div
                  className="writer-profile-photo-editor"
                >

                  <div
                    className="writer-profile-photo-preview"
                  >

                    {
                      avatarPreviewUrl

                        ? (

                            <img
                              src={
                                avatarPreviewUrl
                              }
                              alt={
                                copy.selectedPhoto
                              }
                            />

                          )

                        : displayedAvatarUrl

                          ? (

                              <img
                                src={
                                  displayedAvatarUrl
                                }
                                alt={
                                  copy.currentPhoto
                                }
                              />

                            )

                          : (

                              <span>

                                {
                                  getInitial(
                                    profile.name
                                  )
                                }

                              </span>

                            )
                    }

                  </div>


                  <div
                    className="writer-profile-photo-controls"
                  >

                    <div
                      className="writer-profile-photo-copy"
                    >

                      <h3>
                        {copy.profilePhoto}
                      </h3>

                      <p>
                        {copy.photoDescription}
                      </p>

                    </div>


                    <input
                      ref={
                        avatarInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      hidden
                      onChange={
                        handleAvatarSelection
                      }
                    />


                    <div
                      className="writer-profile-photo-buttons"
                    >

                      <button
                        type="button"
                        className="writer-profile-photo-select-button"
                        onClick={
                          () =>
                            avatarInputRef
                              .current
                              ?.click()
                        }
                        disabled={
                          avatarUploading ||
                          avatarRemoving
                        }
                      >

                        <Camera
                          size={16}
                        />

                        {
                          profile.avatar_url

                            ? copy.changePhoto

                            : copy.choosePhoto
                        }

                      </button>


                      {
                        avatarFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-upload-button"
                            onClick={
                              handleAvatarUpload
                            }
                            disabled={
                              avatarUploading ||
                              avatarRemoving
                            }
                          >

                            {
                              avatarUploading

                                ? (

                                    <Loader2
                                      size={16}
                                      className="spin"
                                    />

                                  )

                                : (

                                    <Upload
                                      size={16}
                                    />

                                  )
                            }


                            {
                              avatarUploading

                                ? copy.uploading

                                : copy.uploadPhoto
                            }

                          </button>

                        )
                      }


                      {
                        avatarFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-cancel-button"
                            onClick={
                              cancelAvatarSelection
                            }
                            disabled={
                              avatarUploading
                            }
                          >

                            <X
                              size={16}
                            />

                            {
                              copy.cancelSelection
                            }

                          </button>

                        )
                      }


                      {
                        profile.avatar_url &&
                        !avatarFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-remove-button"
                            onClick={
                              handleRemoveAvatar
                            }
                            disabled={
                              avatarRemoving ||
                              avatarUploading
                            }
                          >

                            {
                              avatarRemoving

                                ? (

                                    <Loader2
                                      size={16}
                                      className="spin"
                                    />

                                  )

                                : (

                                    <Trash2
                                      size={16}
                                    />

                                  )
                            }


                            {
                              avatarRemoving

                                ? copy.removing

                                : copy.removePhoto
                            }

                          </button>

                        )
                      }

                    </div>


                    {
                      avatarFile && (

                        <div
                          className="writer-profile-selected-file"
                        >

                          <strong>
                            {avatarFile.name}
                          </strong>

                          <span>

                            {
                              (
                                avatarFile.size /
                                (
                                  1024 *
                                  1024
                                )
                              ).toFixed(
                                2
                              )
                            }

                            {" MB"}

                          </span>

                        </div>

                      )
                    }


                    {
                      avatarError && (

                        <p
                          className="writer-profile-form-error"
                        >
                          {avatarError}
                        </p>

                      )
                    }


                    {
                      avatarSuccess && (

                        <p
                          className="writer-profile-form-success"
                        >
                          {avatarSuccess}
                        </p>

                      )
                    }

                  </div>

                </div>


                <div
                  className="writer-profile-cover-editor"
                >

                  <div
                    className="writer-profile-cover-preview"
                    style={
                      (
                        coverPreviewUrl ||
                        displayedCoverUrl
                      )

                        ? {
                            backgroundImage:
                              `url("${
                                coverPreviewUrl ||
                                displayedCoverUrl
                              }")`,

                            backgroundPosition:
                              `center ${coverDraftPosition}%`,
                          }

                        : undefined
                    }
                    aria-label={
                      coverPreviewUrl

                        ? copy.selectedCover

                        : displayedCoverUrl

                          ? copy.currentCover

                          : copy.defaultCover
                    }
                  >

                    {
                      !(
                        coverPreviewUrl ||
                        displayedCoverUrl
                      ) && (

                        <span>
                          SHOBDO
                        </span>

                      )
                    }

                  </div>


                  <div
                    className="writer-profile-cover-controls"
                  >

                    <div
                      className="writer-profile-photo-copy"
                    >

                      <h3>
                        {copy.coverPhoto}
                      </h3>

                      <p>
                        {copy.coverDescription}
                      </p>

                    </div>


                    <div
                      className="writer-profile-photo-buttons"
                    >

                      <button
                        type="button"
                        className="writer-profile-photo-select-button"
                        onClick={
                          () =>
                            coverInputRef
                              .current
                              ?.click()
                        }
                        disabled={
                          coverUploading ||
                          coverRemoving ||
                          coverPositionSaving
                        }
                      >

                        <Camera
                          size={16}
                        />

                        {
                          profile
                            .cover_photo_url

                            ? copy.changeCover

                            : copy.chooseCover
                        }

                      </button>


                      {
                        coverFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-upload-button"
                            onClick={
                              handleCoverUpload
                            }
                            disabled={
                              coverUploading ||
                              coverRemoving ||
                              coverPositionSaving
                            }
                          >

                            {
                              coverUploading

                                ? (

                                    <Loader2
                                      size={16}
                                      className="spin"
                                    />

                                  )

                                : (

                                    <Upload
                                      size={16}
                                    />

                                  )
                            }


                            {
                              coverUploading

                                ? copy.uploading

                                : copy.uploadCover
                            }

                          </button>

                        )
                      }


                      {
                        coverFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-cancel-button"
                            onClick={
                              cancelCoverSelection
                            }
                            disabled={
                              coverUploading
                            }
                          >

                            <X
                              size={16}
                            />

                            {
                              copy.cancelSelection
                            }

                          </button>

                        )
                      }


                      {
                        profile
                          .cover_photo_url &&
                        !coverFile && (

                          <button
                            type="button"
                            className="writer-profile-photo-remove-button"
                            onClick={
                              handleRemoveCover
                            }
                            disabled={
                              coverRemoving ||
                              coverUploading ||
                              coverPositionSaving
                            }
                          >

                            {
                              coverRemoving

                                ? (

                                    <Loader2
                                      size={16}
                                      className="spin"
                                    />

                                  )

                                : (

                                    <Trash2
                                      size={16}
                                    />

                                  )
                            }


                            {
                              coverRemoving

                                ? copy.removing

                                : copy.removeCover
                            }

                          </button>

                        )
                      }

                    </div>


                    {
                      coverFile && (

                        <div
                          className="writer-profile-selected-file"
                        >

                          <strong>
                            {coverFile.name}
                          </strong>

                          <span>

                            {
                              (
                                coverFile.size /
                                (
                                  1024 *
                                  1024
                                )
                              ).toFixed(
                                2
                              )
                            }

                            {" MB"}

                          </span>

                        </div>

                      )
                    }


                    {
                      (
                        coverPreviewUrl ||
                        profile
                          .cover_photo_url
                      ) && (

                        <div
                          className="writer-cover-position-editor"
                        >

                          <div
                            className="writer-cover-position-heading"
                          >

                            <div>

                              <strong>
                                {copy.coverPosition}
                              </strong>

                              <p>
                                {copy.coverPositionHelp}
                              </p>

                            </div>


                            <span>
                              {
                                Math.round(
                                  coverDraftPosition
                                )
                              }%
                            </span>

                          </div>


                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={
                              coverDraftPosition
                            }
                            onChange={
                              (
                                event
                              ) =>
                                setCoverDraftPosition(
                                  Number(
                                    event
                                      .target
                                      .value
                                  )
                                )
                            }
                            disabled={
                              coverUploading ||
                              coverRemoving ||
                              coverPositionSaving
                            }
                            aria-label={
                              copy.coverPosition
                            }
                          />


                          {
                            profile
                              .cover_photo_url &&
                            !coverFile && (

                              <button
                                type="button"
                                className="writer-cover-position-save-button"
                                onClick={
                                  handleSaveCoverPosition
                                }
                                disabled={
                                  coverPositionSaving ||
                                  coverUploading ||
                                  coverRemoving ||
                                  Math.round(
                                    coverDraftPosition
                                  ) ===
                                  Math.round(
                                    currentCoverPosition
                                  )
                                }
                              >

                                {
                                  coverPositionSaving

                                    ? (

                                        <Loader2
                                          size={16}
                                          className="spin"
                                        />

                                      )

                                    : (

                                        <Save
                                          size={16}
                                        />

                                      )
                                }


                                {
                                  coverPositionSaving

                                    ? copy.savingPosition

                                    : copy.saveCoverPosition
                                }

                              </button>

                            )
                          }

                        </div>

                      )
                    }


                    {
                      coverError && (

                        <p
                          className="writer-profile-form-error"
                        >
                          {coverError}
                        </p>

                      )
                    }


                    {
                      coverSuccess && (

                        <p
                          className="writer-profile-form-success"
                        >
                          {coverSuccess}
                        </p>

                      )
                    }

                  </div>

                </div>


                <form
                  className="writer-profile-edit-form"
                  onSubmit={
                    handleSaveProfile
                  }
                >

                  <div
                    className="writer-profile-form-grid"
                  >

                    <label>

                      <span>
                        {copy.name}
                      </span>

                      <input
                        type="text"
                        name="name"
                        value={
                          editForm.name
                        }
                        onChange={
                          handleEditChange
                        }
                        minLength={2}
                        maxLength={120}
                        required
                        disabled={
                          profileSaving
                        }
                        placeholder={
                          copy.namePlaceholder
                        }
                      />

                    </label>


                    <label>

                      <span>
                        {copy.username}
                      </span>


                      <div
                        className="writer-profile-username-input"
                      >

                        <span>
                          @
                        </span>

                        <input
                          type="text"
                          name="username"
                          value={
                            editForm.username
                          }
                          onChange={
                            handleEditChange
                          }
                          maxLength={30}
                          disabled={
                            profileSaving
                          }
                          placeholder={
                            copy.usernamePlaceholder
                          }
                          autoCapitalize="none"
                          autoCorrect="off"
                        />

                      </div>

                    </label>


                    <label
                      className="writer-profile-wide-field"
                    >

                      <span>
                        {copy.bio}
                      </span>

                      <textarea
                        name="bio"
                        value={
                          editForm.bio
                        }
                        onChange={
                          handleEditChange
                        }
                        maxLength={500}
                        disabled={
                          profileSaving
                        }
                        placeholder={
                          copy.bioPlaceholder
                        }
                      />

                      <small>

                        {
                          editForm
                            .bio
                            .length
                        }

                        /500

                      </small>

                    </label>


                    <label>

                      <span>
                        {copy.location}
                      </span>

                      <input
                        type="text"
                        name="location"
                        value={
                          editForm.location
                        }
                        onChange={
                          handleEditChange
                        }
                        maxLength={100}
                        disabled={
                          profileSaving
                        }
                        placeholder={
                          copy.locationPlaceholder
                        }
                      />

                    </label>


                    <label>

                      <span>
                        {copy.website}
                      </span>

                      <input
                        type="url"
                        name="website"
                        value={
                          editForm.website
                        }
                        onChange={
                          handleEditChange
                        }
                        maxLength={255}
                        disabled={
                          profileSaving
                        }
                        placeholder={
                          copy.websitePlaceholder
                        }
                      />

                    </label>

                  </div>


                  {
                    profileError && (

                      <p
                        className="writer-profile-form-error"
                      >
                        {profileError}
                      </p>

                    )
                  }


                  {
                    profileSuccess && (

                      <p
                        className="writer-profile-form-success"
                      >
                        {profileSuccess}
                      </p>

                    )
                  }


                  <div
                    className="writer-profile-edit-actions"
                  >

                    <button
                      type="button"
                      className="writer-profile-cancel-button"
                      onClick={
                        closeEditProfile
                      }
                      disabled={
                        profileSaving ||
                        avatarUploading ||
                        avatarRemoving ||
                        coverUploading ||
                        coverRemoving ||
                        coverPositionSaving
                      }
                    >

                      {copy.cancel}

                    </button>


                    <button
                      type="submit"
                      className="writer-profile-save-button"
                      disabled={
                        profileSaving
                      }
                    >

                      {
                        profileSaving

                          ? (

                              <Loader2
                                size={17}
                                className="spin"
                              />

                            )

                          : (

                              <Save
                                size={17}
                              />

                            )
                      }


                      {
                        profileSaving

                          ? copy.saving

                          : copy.saveProfile
                      }

                    </button>

                  </div>

                </form>

              </section>

            )
          }


          <nav
            className="writer-profile-tabs"
          >

            <button
              type="button"
              className={
                activeTab ===
                  "writings"

                  ? "active"

                  : ""
              }
              onClick={
                () =>
                  setActiveTab(
                    "writings"
                  )
              }
            >

              <BookOpen
                size={17}
              />

              {copy.writings}

              <span>
                {writingsCount}
              </span>

            </button>


            <button
              type="button"
              className={
                activeTab ===
                  "about"

                  ? "active"

                  : ""
              }
              onClick={
                () =>
                  setActiveTab(
                    "about"
                  )
              }
            >

              <Users
                size={17}
              />

              {copy.about}

            </button>

          </nav>


          {
            activeTab ===
              "writings" && (

              <section
                className="writer-profile-feed"
              >

                <div
                  className="writer-profile-section-heading"
                >

                  <div>

                    <p
                      className="writer-profile-eyebrow"
                    >
                      {copy.publishedWorks}
                    </p>


                    <h2>

                      {
                        interpolate(
                          copy.writingsBy,
                          {
                            name:
                              profile.name,
                          }
                        )
                      }

                    </h2>

                  </div>


                  <span
                    className="writer-writing-count"
                  >

                    {
                      interpolate(

                        writings.length ===
                          1

                          ? copy.writingCount

                          : copy.writingsCount,

                        {
                          count:
                            writings.length,
                        }

                      )
                    }

                  </span>

                </div>


                {
                  writings.length ===
                    0

                    ? (

                        <div
                          className="writer-profile-empty"
                        >

                          <BookOpen
                            size={38}
                          />

                          <h3>
                            {copy.noWritings}
                          </h3>

                          <p>
                            {copy.noWritingsDescription}
                          </p>

                        </div>

                      )

                    : (

                        <div
                          className="writer-profile-writing-list"
                        >

                          {
                            writings.map(
                              (
                                writing
                              ) => {

                                const content =
                                  cleanMetaText(
                                    writing
                                      ?.content ||
                                    ""
                                  );


                                const writingDate =
                                  getWritingDate(
                                    writing
                                  );


                                return (

                                  <article
                                    key={
                                      writing.id
                                    }
                                    className="writer-profile-writing-card"
                                  >

                                    <div
                                      className="writer-writing-author-row"
                                    >

                                      <div
                                        className="writer-writing-mini-avatar"
                                      >

                                        {
                                          displayedAvatarUrl

                                            ? (

                                                <img
                                                  src={
                                                    displayedAvatarUrl
                                                  }
                                                  alt=""
                                                />

                                              )

                                            : getInitial(
                                                profile.name
                                              )
                                        }

                                      </div>


                                      <div>

                                        <strong>
                                          {profile.name}
                                        </strong>


                                        <div
                                          className="writer-writing-post-meta"
                                        >

                                          {
                                            profile.username && (

                                              <span>
                                                @{profile.username}
                                              </span>

                                            )
                                          }


                                          {
                                            writingDate && (

                                              <span>
                                                · {writingDate}
                                              </span>

                                            )
                                          }

                                        </div>

                                      </div>

                                    </div>


                                    <div
                                      className="writer-profile-writing-top"
                                    >

                                      <span>

                                        {
                                          getCategoryLabel(
                                            language,
                                            writing.category,
                                            copy.writing
                                          )
                                        }

                                      </span>


                                      {
                                        writing.language && (

                                          <small>

                                            {
                                              getWritingLanguageLabel(
                                                language,
                                                writing.language
                                              )
                                            }

                                          </small>

                                        )
                                      }

                                    </div>


                                    <Link
                                      to={
                                        `/writings/${writing.id}`
                                      }
                                      className="writer-writing-content-link"
                                    >

                                      <h3>

                                        {
                                          writing.title ||
                                          copy.untitled
                                        }

                                      </h3>


                                      {
                                        content && (

                                          <p>

                                            {
                                              content.slice(
                                                0,
                                                320
                                              )
                                            }

                                            {
                                              content.length >
                                                320

                                                ? "…"

                                                : ""
                                            }

                                          </p>

                                        )
                                      }

                                    </Link>


                                    <div
                                      className="writer-profile-writing-footer"
                                    >

                                      <div
                                        className="writer-profile-writing-meta"
                                      >

                                        <span>

                                          <Heart
                                            size={16}
                                          />

                                          {
                                            safeNumber(
                                              writing
                                                .likes_count
                                            )
                                          }

                                        </span>


                                        <span>

                                          <MessageCircle
                                            size={16}
                                          />

                                          {
                                            safeNumber(
                                              writing
                                                .comments_count
                                            )
                                          }

                                        </span>

                                      </div>


                                      <Link
                                        to={
                                          `/writings/${writing.id}`
                                        }
                                        className="writer-read-writing"
                                      >

                                        {copy.readWriting}

                                        <ArrowUpRight
                                          size={15}
                                        />

                                      </Link>

                                    </div>

                                  </article>

                                );

                              }
                            )
                          }

                        </div>

                      )
                }

              </section>

            )
          }


          {
            activeTab ===
              "about" && (

              <section
                className="writer-profile-about"
              >

                <div
                  className="writer-about-main"
                >

                  <div
                    className="writer-about-card"
                  >

                    <p
                      className="writer-profile-eyebrow"
                    >
                      {copy.about}
                    </p>


                    <h2>
                      {profile.name}
                    </h2>


                    <p
                      className="writer-about-bio"
                    >

                      {
                        profile.bio ||
                        copy.noBio
                      }

                    </p>

                  </div>


                  <div
                    className="writer-about-card"
                  >

                    <p
                      className="writer-profile-eyebrow"
                    >
                      {copy.profileInformation}
                    </p>


                    <div
                      className="writer-about-info-list"
                    >

                      {
                        profile.location && (

                          <div>

                            <MapPin
                              size={18}
                            />

                            <span>

                              <small>
                                {copy.location}
                              </small>

                              <strong>
                                {profile.location}
                              </strong>

                            </span>

                          </div>

                        )
                      }


                      {
                        profile.website && (

                          <div>

                            <Globe2
                              size={18}
                            />

                            <span>

                              <small>
                                {copy.website}
                              </small>


                              <a
                                href={
                                  profile.website
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >

                                {
                                  getWebsiteLabel(
                                    profile.website
                                  )
                                }

                                <ExternalLink
                                  size={12}
                                />

                              </a>

                            </span>

                          </div>

                        )
                      }


                      {
                        memberSince && (

                          <div>

                            <CalendarDays
                              size={18}
                            />

                            <span>

                              <small>
                                {copy.joined}
                              </small>

                              <strong>
                                {memberSince}
                              </strong>

                            </span>

                          </div>

                        )
                      }

                    </div>

                  </div>

                </div>


                <aside
                  className="writer-about-sidebar"
                >

                  <div
                    className="writer-activity-card"
                  >

                    <p
                      className="writer-profile-eyebrow"
                    >
                      {copy.creatorActivity}
                    </p>


                    <div
                      className="writer-activity-stat"
                    >

                      <BookOpen
                        size={20}
                      />

                      <div>

                        <strong>
                          {writingsCount}
                        </strong>

                        <span>
                          {copy.publishedWritings}
                        </span>

                      </div>

                    </div>


                    <div
                      className="writer-activity-stat"
                    >

                      <Heart
                        size={20}
                      />

                      <div>

                        <strong>
                          {likesCount}
                        </strong>

                        <span>
                          {copy.likesReceived}
                        </span>

                      </div>

                    </div>


                    <div
                      className="writer-activity-stat"
                    >

                      <MessageCircle
                        size={20}
                      />

                      <div>

                        <strong>
                          {commentsCount}
                        </strong>

                        <span>
                          {copy.comments}
                        </span>

                      </div>

                    </div>

                  </div>

                </aside>

              </section>

            )
          }

        </div>

      </main>

    </>

  );

}


export default WriterProfile;