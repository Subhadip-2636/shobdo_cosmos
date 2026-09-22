import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Eye,
  FileVideo2,
  Globe2,
  LoaderCircle,
  Lock,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  publishReel,
  REEL_LANGUAGES,
  validateReelVideo,
} from "../api/reels";

import "./CreateReel.css";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_CAPTION_LENGTH =
  5000;


// =========================================================
// MULTILINGUAL COPY
// =========================================================

const COPY = {

  // =======================================================
  // ENGLISH
  // =======================================================

  en: {

    pageTitle:
      "Create Reel",

    back:
      "Reels",

    eyebrow:
      "SHOBDO CREATOR",

    title:
      "Create a Reel",

    description:
      "Share poetry, storytelling, readings and creative moments with the SHOBDO community.",

    stepVideo:
      "Choose your video",

    reel:
      "REEL",

    uploadTitle:
      "Upload a short video",

    uploadDescription:
      "Drag your video here or choose one from your device.",

    chooseVideo:
      "Choose video",

    supportedFormats:
      "MP4, WEBM, MOV or M4V · Maximum 100 MB",

    preview:
      "Preview",

    removeVideo:
      "Remove video",

    changeVideo:
      "Choose another video",

    stepDetails:
      "Reel details",

    caption:
      "Caption",

    captionPlaceholder:
      "Tell the story behind this Reel...",

    language:
      "Language",

    visibility:
      "Who can watch?",

    public:
      "Public",

    publicDescription:
      "Anyone on SHOBDO can watch this Reel.",

    followers:
      "Followers",

    followersDescription:
      "Only people who follow you can watch.",

    private:
      "Private",

    privateDescription:
      "Only you can access this Reel.",

    allowComments:
      "Allow comments",

    allowCommentsDescription:
      "Let viewers respond to this Reel.",

    uploading:
      "Uploading your Reel",

    keepOpen:
      "Keep this page open while your video is being uploaded.",

    publicNotice:
      "Your Reel will appear in the public Reels feed.",

    followersNotice:
      "This Reel will be limited to your followers.",

    privateNotice:
      "This Reel will remain private.",

    publish:
      "Publish Reel",

    publishing:
      "Publishing...",

    noVideo:
      "Choose a video before publishing your Reel.",

    captionTooLong:
      "Caption cannot exceed 5000 characters.",

    publishError:
      "Unable to publish your Reel.",

    success:
      "Your Reel was published successfully.",

    loginRequired:
      "Please log in before creating a Reel.",

    invalidVideo:
      "Please choose a valid video file.",

    videoTooLarge:
      "The Reel video is too large. Maximum size is 100 MB.",

    unsupportedVideo:
      "Only MP4, WEBM, MOV and M4V videos are supported.",

    uploadFailed:
      "Unable to upload this Reel video.",

    connectionError:
      "Unable to connect to SHOBDO while uploading the Reel.",

  },


  // =======================================================
  // BENGALI
  // =======================================================

  bn: {

    pageTitle:
      "রিল তৈরি করুন",

    back:
      "রিলস",

    eyebrow:
      "SHOBDO স্রষ্টা",

    title:
      "একটি রিল তৈরি করুন",

    description:
      "SHOBDO কমিউনিটির সঙ্গে কবিতা, গল্প, আবৃত্তি এবং সৃজনশীল মুহূর্ত শেয়ার করুন।",

    stepVideo:
      "আপনার ভিডিও নির্বাচন করুন",

    reel:
      "রিল",

    uploadTitle:
      "একটি ছোট ভিডিও আপলোড করুন",

    uploadDescription:
      "ভিডিওটি এখানে টেনে আনুন অথবা আপনার ডিভাইস থেকে নির্বাচন করুন।",

    chooseVideo:
      "ভিডিও নির্বাচন করুন",

    supportedFormats:
      "MP4, WEBM, MOV অথবা M4V · সর্বোচ্চ 100 MB",

    preview:
      "প্রিভিউ",

    removeVideo:
      "ভিডিও সরান",

    changeVideo:
      "অন্য ভিডিও নির্বাচন করুন",

    stepDetails:
      "রিলের বিস্তারিত",

    caption:
      "ক্যাপশন",

    captionPlaceholder:
      "এই রিলের পেছনের গল্পটি লিখুন...",

    language:
      "ভাষা",

    visibility:
      "কারা দেখতে পারবেন?",

    public:
      "সর্বজনীন",

    publicDescription:
      "SHOBDO-র যে কেউ এই রিল দেখতে পারবেন।",

    followers:
      "অনুসারীরা",

    followersDescription:
      "শুধু যারা আপনাকে অনুসরণ করেন তারা দেখতে পারবেন।",

    private:
      "ব্যক্তিগত",

    privateDescription:
      "শুধুমাত্র আপনি এই রিল দেখতে পারবেন।",

    allowComments:
      "মন্তব্যের অনুমতি দিন",

    allowCommentsDescription:
      "দর্শকদের এই রিলে মন্তব্য করতে দিন।",

    uploading:
      "আপনার রিল আপলোড হচ্ছে",

    keepOpen:
      "ভিডিও আপলোড শেষ না হওয়া পর্যন্ত এই পেজটি খোলা রাখুন।",

    publicNotice:
      "আপনার রিল সর্বজনীন Reels ফিডে দেখা যাবে।",

    followersNotice:
      "এই রিল শুধুমাত্র আপনার অনুসারীদের জন্য থাকবে।",

    privateNotice:
      "এই রিল ব্যক্তিগত থাকবে।",

    publish:
      "রিল প্রকাশ করুন",

    publishing:
      "প্রকাশ করা হচ্ছে...",

    noVideo:
      "রিল প্রকাশ করার আগে একটি ভিডিও নির্বাচন করুন।",

    captionTooLong:
      "ক্যাপশন 5000 অক্ষরের বেশি হতে পারবে না।",

    publishError:
      "আপনার রিল প্রকাশ করা যায়নি।",

    success:
      "আপনার রিল সফলভাবে প্রকাশিত হয়েছে।",

    loginRequired:
      "রিল তৈরি করার আগে লগ ইন করুন।",

    invalidVideo:
      "একটি বৈধ ভিডিও ফাইল নির্বাচন করুন।",

    videoTooLarge:
      "রিল ভিডিওটি খুব বড়। সর্বোচ্চ আকার 100 MB।",

    unsupportedVideo:
      "শুধু MP4, WEBM, MOV এবং M4V ভিডিও সমর্থিত।",

    uploadFailed:
      "এই রিল ভিডিওটি আপলোড করা যায়নি।",

    connectionError:
      "রিল আপলোড করার সময় SHOBDO-র সঙ্গে সংযোগ করা যায়নি।",

  },


  // =======================================================
  // HINDI
  // =======================================================

  hi: {

    pageTitle:
      "रील बनाएँ",

    back:
      "रील्स",

    eyebrow:
      "SHOBDO CREATOR",

    title:
      "एक रील बनाएँ",

    description:
      "SHOBDO समुदाय के साथ कविता, कहानी, पाठ और रचनात्मक क्षण साझा करें।",

    stepVideo:
      "अपना वीडियो चुनें",

    reel:
      "रील",

    uploadTitle:
      "एक छोटा वीडियो अपलोड करें",

    uploadDescription:
      "वीडियो यहाँ खींचें या अपने डिवाइस से चुनें।",

    chooseVideo:
      "वीडियो चुनें",

    supportedFormats:
      "MP4, WEBM, MOV या M4V · अधिकतम 100 MB",

    preview:
      "पूर्वावलोकन",

    removeVideo:
      "वीडियो हटाएँ",

    changeVideo:
      "दूसरा वीडियो चुनें",

    stepDetails:
      "रील विवरण",

    caption:
      "कैप्शन",

    captionPlaceholder:
      "इस रील के पीछे की कहानी लिखें...",

    language:
      "भाषा",

    visibility:
      "कौन देख सकता है?",

    public:
      "सार्वजनिक",

    publicDescription:
      "SHOBDO पर कोई भी इस रील को देख सकता है।",

    followers:
      "फ़ॉलोअर्स",

    followersDescription:
      "केवल आपको फ़ॉलो करने वाले लोग देख सकते हैं।",

    private:
      "निजी",

    privateDescription:
      "केवल आप इस रील को देख सकते हैं।",

    allowComments:
      "टिप्पणियों की अनुमति दें",

    allowCommentsDescription:
      "दर्शकों को इस रील पर प्रतिक्रिया देने दें।",

    uploading:
      "आपकी रील अपलोड हो रही है",

    keepOpen:
      "वीडियो अपलोड होने तक इस पेज को खुला रखें।",

    publicNotice:
      "आपकी रील सार्वजनिक Reels फ़ीड में दिखाई देगी।",

    followersNotice:
      "यह रील केवल आपके फ़ॉलोअर्स के लिए होगी।",

    privateNotice:
      "यह रील निजी रहेगी।",

    publish:
      "रील प्रकाशित करें",

    publishing:
      "प्रकाशित हो रही है...",

    noVideo:
      "रील प्रकाशित करने से पहले वीडियो चुनें।",

    captionTooLong:
      "कैप्शन 5000 अक्षरों से अधिक नहीं हो सकता।",

    publishError:
      "आपकी रील प्रकाशित नहीं हो सकी।",

    success:
      "आपकी रील सफलतापूर्वक प्रकाशित हो गई।",

    loginRequired:
      "रील बनाने से पहले लॉग इन करें।",

    invalidVideo:
      "कृपया एक मान्य वीडियो फ़ाइल चुनें।",

    videoTooLarge:
      "रील वीडियो बहुत बड़ा है। अधिकतम आकार 100 MB है।",

    unsupportedVideo:
      "केवल MP4, WEBM, MOV और M4V वीडियो समर्थित हैं।",

    uploadFailed:
      "यह रील वीडियो अपलोड नहीं हो सका।",

    connectionError:
      "रील अपलोड करते समय SHOBDO से कनेक्ट नहीं हो सका।",

  },


  // =======================================================
  // ASSAMESE
  // =======================================================

  as: {

    pageTitle:
      "ৰিল তৈয়াৰ কৰক",

    back:
      "ৰিলছ",

    eyebrow:
      "SHOBDO সৃষ্টিকৰ্তা",

    title:
      "এটা ৰিল তৈয়াৰ কৰক",

    description:
      "SHOBDO সমাজৰ সৈতে কবিতা, গল্প, আবৃত্তি আৰু সৃজনশীল মুহূর্ত ভাগ-বতৰা কৰক।",

    stepVideo:
      "আপোনাৰ ভিডিঅ' বাছনি কৰক",

    reel:
      "ৰিল",

    uploadTitle:
      "এটা সৰু ভিডিঅ' আপলোড কৰক",

    uploadDescription:
      "ভিডিঅ'টো ইয়ালৈ টানি আনক অথবা আপোনাৰ ডিভাইচৰ পৰা বাছনি কৰক।",

    chooseVideo:
      "ভিডিঅ' বাছনি কৰক",

    supportedFormats:
      "MP4, WEBM, MOV বা M4V · সৰ্বাধিক 100 MB",

    preview:
      "পূৰ্বদৰ্শন",

    removeVideo:
      "ভিডিঅ' আঁতৰাওক",

    changeVideo:
      "অন্য ভিডিঅ' বাছনি কৰক",

    stepDetails:
      "ৰিলৰ বিৱৰণ",

    caption:
      "কেপচন",

    captionPlaceholder:
      "এই ৰিলৰ আঁৰৰ গল্প লিখক...",

    language:
      "ভাষা",

    visibility:
      "কোনে চাব পাৰিব?",

    public:
      "সাৰ্বজনীন",

    publicDescription:
      "SHOBDO-ৰ যিকোনো ব্যক্তিয়ে এই ৰিল চাব পাৰিব।",

    followers:
      "অনুসৰণকাৰী",

    followersDescription:
      "কেৱল আপোনাক অনুসৰণ কৰা লোকসকলে চাব পাৰিব।",

    private:
      "ব্যক্তিগত",

    privateDescription:
      "কেৱল আপুনি এই ৰিল চাব পাৰিব।",

    allowComments:
      "মন্তব্যৰ অনুমতি দিয়ক",

    allowCommentsDescription:
      "দৰ্শকক এই ৰিলত মন্তব্য কৰিবলৈ দিয়ক।",

    uploading:
      "আপোনাৰ ৰিল আপলোড হৈ আছে",

    keepOpen:
      "ভিডিঅ' আপলোড শেষ নোহোৱালৈ এই পৃষ্ঠা খোলা ৰাখক।",

    publicNotice:
      "আপোনাৰ ৰিল সাৰ্বজনীন Reels ফিডত দেখা যাব।",

    followersNotice:
      "এই ৰিল কেৱল আপোনাৰ অনুসৰণকাৰীৰ বাবে থাকিব।",

    privateNotice:
      "এই ৰিল ব্যক্তিগত হৈ থাকিব।",

    publish:
      "ৰিল প্ৰকাশ কৰক",

    publishing:
      "প্ৰকাশ হৈ আছে...",

    noVideo:
      "ৰিল প্ৰকাশ কৰাৰ আগতে এটা ভিডিঅ' বাছনি কৰক।",

    captionTooLong:
      "কেপচন 5000 আখৰৰ অধিক হ'ব নোৱাৰে।",

    publishError:
      "আপোনাৰ ৰিল প্ৰকাশ কৰিব পৰা নগ'ল।",

    success:
      "আপোনাৰ ৰিল সফলভাৱে প্ৰকাশিত হৈছে।",

    loginRequired:
      "ৰিল তৈয়াৰ কৰাৰ আগতে লগ ইন কৰক।",

    invalidVideo:
      "এটা বৈধ ভিডিঅ' ফাইল বাছনি কৰক।",

    videoTooLarge:
      "ৰিল ভিডিঅ'টো অতি ডাঙৰ। সৰ্বাধিক আকাৰ 100 MB।",

    unsupportedVideo:
      "কেৱল MP4, WEBM, MOV আৰু M4V ভিডিঅ' সমৰ্থিত।",

    uploadFailed:
      "এই ৰিল ভিডিঅ' আপলোড কৰিব পৰা নগ'ল।",

    connectionError:
      "ৰিল আপলোড কৰাৰ সময়ত SHOBDO-ৰ সৈতে সংযোগ কৰিব পৰা নগ'ল।",

  },


  // =======================================================
  // ODIA
  // =======================================================

  or: {

    pageTitle:
      "ରିଲ୍ ତିଆରି କରନ୍ତୁ",

    back:
      "ରିଲ୍ସ",

    eyebrow:
      "SHOBDO CREATOR",

    title:
      "ଏକ ରିଲ୍ ତିଆରି କରନ୍ତୁ",

    description:
      "SHOBDO ସମୁଦାୟ ସହ କବିତା, କାହାଣୀ, ପାଠ ଏବଂ ସୃଜନଶୀଳ ମୁହୂର୍ତ୍ତ ସେୟାର କରନ୍ତୁ।",

    stepVideo:
      "ଆପଣଙ୍କ ଭିଡିଓ ବାଛନ୍ତୁ",

    reel:
      "ରିଲ୍",

    uploadTitle:
      "ଏକ ଛୋଟ ଭିଡିଓ ଅପଲୋଡ୍ କରନ୍ତୁ",

    uploadDescription:
      "ଭିଡିଓକୁ ଏଠାକୁ ଡ୍ରାଗ୍ କରନ୍ତୁ କିମ୍ବା ଡିଭାଇସରୁ ବାଛନ୍ତୁ।",

    chooseVideo:
      "ଭିଡିଓ ବାଛନ୍ତୁ",

    supportedFormats:
      "MP4, WEBM, MOV କିମ୍ବା M4V · ସର୍ବାଧିକ 100 MB",

    preview:
      "ପ୍ରିଭ୍ୟୁ",

    removeVideo:
      "ଭିଡିଓ ହଟାନ୍ତୁ",

    changeVideo:
      "ଅନ୍ୟ ଭିଡିଓ ବାଛନ୍ତୁ",

    stepDetails:
      "ରିଲ୍ ବିବରଣୀ",

    caption:
      "କ୍ୟାପ୍ସନ୍",

    captionPlaceholder:
      "ଏହି ରିଲ୍ ପଛର କାହାଣୀ ଲେଖନ୍ତୁ...",

    language:
      "ଭାଷା",

    visibility:
      "କିଏ ଦେଖିପାରିବ?",

    public:
      "ସାର୍ବଜନୀନ",

    publicDescription:
      "SHOBDO-ରେ ସମସ୍ତେ ଏହି ରିଲ୍ ଦେଖିପାରିବେ।",

    followers:
      "ଅନୁସରଣକାରୀ",

    followersDescription:
      "କେବଳ ଆପଣଙ୍କୁ ଅନୁସରଣ କରୁଥିବା ଲୋକମାନେ ଦେଖିପାରିବେ।",

    private:
      "ବ୍ୟକ୍ତିଗତ",

    privateDescription:
      "କେବଳ ଆପଣ ଏହି ରିଲ୍ ଦେଖିପାରିବେ।",

    allowComments:
      "ମନ୍ତବ୍ୟକୁ ଅନୁମତି ଦିଅନ୍ତୁ",

    allowCommentsDescription:
      "ଦର୍ଶକମାନଙ୍କୁ ଏହି ରିଲ୍ ଉପରେ ମନ୍ତବ୍ୟ କରିବାକୁ ଦିଅନ୍ତୁ।",

    uploading:
      "ଆପଣଙ୍କ ରିଲ୍ ଅପଲୋଡ୍ ହେଉଛି",

    keepOpen:
      "ଭିଡିଓ ଅପଲୋଡ୍ ଶେଷ ହେବା ପର୍ଯ୍ୟନ୍ତ ଏହି ପୃଷ୍ଠା ଖୋଲା ରଖନ୍ତୁ।",

    publicNotice:
      "ଆପଣଙ୍କ ରିଲ୍ ସାର୍ବଜନୀନ Reels ଫିଡ୍‌ରେ ଦେଖାଯିବ।",

    followersNotice:
      "ଏହି ରିଲ୍ କେବଳ ଆପଣଙ୍କ ଅନୁସରଣକାରୀଙ୍କ ପାଇଁ ରହିବ।",

    privateNotice:
      "ଏହି ରିଲ୍ ବ୍ୟକ୍ତିଗତ ରହିବ।",

    publish:
      "ରିଲ୍ ପ୍ରକାଶ କରନ୍ତୁ",

    publishing:
      "ପ୍ରକାଶ ହେଉଛି...",

    noVideo:
      "ରିଲ୍ ପ୍ରକାଶ କରିବା ପୂର୍ବରୁ ଏକ ଭିଡିଓ ବାଛନ୍ତୁ।",

    captionTooLong:
      "କ୍ୟାପ୍ସନ୍ 5000 ଅକ୍ଷରରୁ ଅଧିକ ହୋଇପାରିବ ନାହିଁ।",

    publishError:
      "ଆପଣଙ୍କ ରିଲ୍ ପ୍ରକାଶ କରାଯାଇପାରିଲା ନାହିଁ।",

    success:
      "ଆପଣଙ୍କ ରିଲ୍ ସଫଳତାର ସହ ପ୍ରକାଶିତ ହୋଇଛି।",

    loginRequired:
      "ରିଲ୍ ତିଆରି କରିବା ପୂର୍ବରୁ ଲଗ୍ ଇନ୍ କରନ୍ତୁ।",

    invalidVideo:
      "ଏକ ବୈଧ ଭିଡିଓ ଫାଇଲ୍ ବାଛନ୍ତୁ।",

    videoTooLarge:
      "ରିଲ୍ ଭିଡିଓଟି ବହୁତ ବଡ଼। ସର୍ବାଧିକ ଆକାର 100 MB।",

    unsupportedVideo:
      "କେବଳ MP4, WEBM, MOV ଏବଂ M4V ଭିଡିଓ ସମର୍ଥିତ।",

    uploadFailed:
      "ଏହି ରିଲ୍ ଭିଡିଓ ଅପଲୋଡ୍ କରାଯାଇପାରିଲା ନାହିଁ।",

    connectionError:
      "ରିଲ୍ ଅପଲୋଡ୍ ସମୟରେ SHOBDO ସହ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ।",

  },


  // =======================================================
  // TAMIL
  // =======================================================

  ta: {

    pageTitle:
      "ரீலை உருவாக்குங்கள்",

    back:
      "ரீல்ஸ்",

    eyebrow:
      "SHOBDO CREATOR",

    title:
      "ஒரு ரீலை உருவாக்குங்கள்",

    description:
      "SHOBDO சமூகத்துடன் கவிதை, கதைகள், வாசிப்புகள் மற்றும் படைப்பாற்றல் தருணங்களை பகிருங்கள்.",

    stepVideo:
      "உங்கள் வீடியோவைத் தேர்ந்தெடுக்கவும்",

    reel:
      "ரீல்",

    uploadTitle:
      "ஒரு குறுகிய வீடியோவை பதிவேற்றுங்கள்",

    uploadDescription:
      "வீடியோவை இங்கே இழுத்து விடுங்கள் அல்லது உங்கள் சாதனத்திலிருந்து தேர்வு செய்யுங்கள்.",

    chooseVideo:
      "வீடியோவைத் தேர்வு செய்க",

    supportedFormats:
      "MP4, WEBM, MOV அல்லது M4V · அதிகபட்சம் 100 MB",

    preview:
      "முன்னோட்டம்",

    removeVideo:
      "வீடியோவை அகற்று",

    changeVideo:
      "வேறு வீடியோவைத் தேர்வு செய்க",

    stepDetails:
      "ரீல் விவரங்கள்",

    caption:
      "தலைப்பு",

    captionPlaceholder:
      "இந்த ரீலின் பின்னணி கதையை எழுதுங்கள்...",

    language:
      "மொழி",

    visibility:
      "யார் பார்க்கலாம்?",

    public:
      "பொது",

    publicDescription:
      "SHOBDO-வில் யாரும் இந்த ரீலை பார்க்கலாம்.",

    followers:
      "பின்தொடர்பவர்கள்",

    followersDescription:
      "உங்களை பின்தொடர்பவர்கள் மட்டுமே பார்க்கலாம்.",

    private:
      "தனிப்பட்டது",

    privateDescription:
      "நீங்கள் மட்டும் இந்த ரீலை பார்க்கலாம்.",

    allowComments:
      "கருத்துகளை அனுமதிக்கவும்",

    allowCommentsDescription:
      "பார்வையாளர்கள் இந்த ரீலுக்கு பதிலளிக்க அனுமதிக்கவும்.",

    uploading:
      "உங்கள் ரீல் பதிவேற்றப்படுகிறது",

    keepOpen:
      "வீடியோ பதிவேற்றம் முடியும் வரை இந்தப் பக்கத்தை திறந்தே வைத்திருங்கள்.",

    publicNotice:
      "உங்கள் ரீல் பொது Reels feed-ல் தோன்றும்.",

    followersNotice:
      "இந்த ரீல் உங்கள் பின்தொடர்பவர்களுக்கு மட்டும் இருக்கும்.",

    privateNotice:
      "இந்த ரீல் தனிப்பட்டதாக இருக்கும்.",

    publish:
      "ரீலை வெளியிடுங்கள்",

    publishing:
      "வெளியிடப்படுகிறது...",

    noVideo:
      "ரீலை வெளியிடுவதற்கு முன் வீடியோவைத் தேர்வு செய்யுங்கள்.",

    captionTooLong:
      "தலைப்பு 5000 எழுத்துகளை மீறக்கூடாது.",

    publishError:
      "உங்கள் ரீலை வெளியிட முடியவில்லை.",

    success:
      "உங்கள் ரீல் வெற்றிகரமாக வெளியிடப்பட்டது.",

    loginRequired:
      "ரீலை உருவாக்குவதற்கு முன் உள்நுழையவும்.",

    invalidVideo:
      "சரியான வீடியோ கோப்பைத் தேர்வு செய்யுங்கள்.",

    videoTooLarge:
      "ரீல் வீடியோ மிகப் பெரியது. அதிகபட்ச அளவு 100 MB.",

    unsupportedVideo:
      "MP4, WEBM, MOV மற்றும் M4V வீடியோக்கள் மட்டுமே ஆதரிக்கப்படுகின்றன.",

    uploadFailed:
      "இந்த ரீல் வீடியோவை பதிவேற்ற முடியவில்லை.",

    connectionError:
      "ரீல் பதிவேற்றும்போது SHOBDO-வை இணைக்க முடியவில்லை.",

  },


  // =======================================================
  // TELUGU
  // =======================================================

  te: {

    pageTitle:
      "రీల్ సృష్టించండి",

    back:
      "రీల్స్",

    eyebrow:
      "SHOBDO CREATOR",

    title:
      "ఒక రీల్ సృష్టించండి",

    description:
      "SHOBDO సమాజంతో కవిత్వం, కథలు, పఠనాలు మరియు సృజనాత్మక క్షణాలను పంచుకోండి.",

    stepVideo:
      "మీ వీడియోను ఎంచుకోండి",

    reel:
      "రీల్",

    uploadTitle:
      "చిన్న వీడియోను అప్‌లోడ్ చేయండి",

    uploadDescription:
      "వీడియోను ఇక్కడికి డ్రాగ్ చేయండి లేదా మీ పరికరం నుండి ఎంచుకోండి.",

    chooseVideo:
      "వీడియో ఎంచుకోండి",

    supportedFormats:
      "MP4, WEBM, MOV లేదా M4V · గరిష్ఠం 100 MB",

    preview:
      "ప్రివ్యూ",

    removeVideo:
      "వీడియో తొలగించండి",

    changeVideo:
      "మరొక వీడియోను ఎంచుకోండి",

    stepDetails:
      "రీల్ వివరాలు",

    caption:
      "క్యాప్షన్",

    captionPlaceholder:
      "ఈ రీల్ వెనుక కథను చెప్పండి...",

    language:
      "భాష",

    visibility:
      "ఎవరు చూడగలరు?",

    public:
      "పబ్లిక్",

    publicDescription:
      "SHOBDOలో ఎవరైనా ఈ రీల్‌ను చూడగలరు.",

    followers:
      "ఫాలోవర్లు",

    followersDescription:
      "మిమ్మల్ని ఫాలో అయ్యే వారు మాత్రమే చూడగలరు.",

    private:
      "ప్రైవేట్",

    privateDescription:
      "మీరు మాత్రమే ఈ రీల్‌ను చూడగలరు.",

    allowComments:
      "వ్యాఖ్యలను అనుమతించండి",

    allowCommentsDescription:
      "వీక్షకులు ఈ రీల్‌కు స్పందించడానికి అనుమతించండి.",

    uploading:
      "మీ రీల్ అప్‌లోడ్ అవుతోంది",

    keepOpen:
      "వీడియో అప్‌లోడ్ పూర్తయ్యే వరకు ఈ పేజీని తెరిచి ఉంచండి.",

    publicNotice:
      "మీ రీల్ పబ్లిక్ Reels ఫీడ్‌లో కనిపిస్తుంది.",

    followersNotice:
      "ఈ రీల్ మీ ఫాలోవర్లకు మాత్రమే కనిపిస్తుంది.",

    privateNotice:
      "ఈ రీల్ ప్రైవేట్‌గా ఉంటుంది.",

    publish:
      "రీల్ ప్రచురించండి",

    publishing:
      "ప్రచురిస్తోంది...",

    noVideo:
      "రీల్ ప్రచురించే ముందు వీడియోను ఎంచుకోండి.",

    captionTooLong:
      "క్యాప్షన్ 5000 అక్షరాలను మించకూడదు.",

    publishError:
      "మీ రీల్‌ను ప్రచురించలేకపోయాము.",

    success:
      "మీ రీల్ విజయవంతంగా ప్రచురించబడింది.",

    loginRequired:
      "రీల్ సృష్టించే ముందు లాగిన్ అవ్వండి.",

    invalidVideo:
      "దయచేసి సరైన వీడియో ఫైల్‌ను ఎంచుకోండి.",

    videoTooLarge:
      "రీల్ వీడియో చాలా పెద్దది. గరిష్ఠ పరిమాణం 100 MB.",

    unsupportedVideo:
      "MP4, WEBM, MOV మరియు M4V వీడియోలు మాత్రమే మద్దతు ఇస్తాయి.",

    uploadFailed:
      "ఈ రీల్ వీడియోను అప్‌లోడ్ చేయలేకపోయాము.",

    connectionError:
      "రీల్ అప్‌లోడ్ చేస్తున్నప్పుడు SHOBDOకు కనెక్ట్ కాలేకపోయాము.",

  },

};


// =========================================================
// CONTENT-LANGUAGE DISPLAY NAMES
// =========================================================

const LANGUAGE_NAMES = {

  en: {
    bn: "Bengali",
    hi: "Hindi",
    en: "English",
    as: "Assamese",
    or: "Odia",
    ta: "Tamil",
    te: "Telugu",
  },

  bn: {
    bn: "বাংলা",
    hi: "হিন্দি",
    en: "ইংরেজি",
    as: "অসমীয়া",
    or: "ওড়িয়া",
    ta: "তামিল",
    te: "তেলুগু",
  },

  hi: {
    bn: "बंगाली",
    hi: "हिन्दी",
    en: "अंग्रेज़ी",
    as: "असमिया",
    or: "ओड़िया",
    ta: "तमिल",
    te: "तेलुगु",
  },

  as: {
    bn: "বাংলা",
    hi: "হিন্দী",
    en: "ইংৰাজী",
    as: "অসমীয়া",
    or: "ওড়িয়া",
    ta: "তামিল",
    te: "তেলুগু",
  },

  or: {
    bn: "ବଙ୍ଗାଳୀ",
    hi: "ହିନ୍ଦୀ",
    en: "ଇଂରାଜୀ",
    as: "ଆସାମୀୟ",
    or: "ଓଡ଼ିଆ",
    ta: "ତାମିଲ",
    te: "ତେଲୁଗୁ",
  },

  ta: {
    bn: "வங்காளம்",
    hi: "இந்தி",
    en: "ஆங்கிலம்",
    as: "அசாமியம்",
    or: "ஒடியா",
    ta: "தமிழ்",
    te: "தெலுங்கு",
  },

  te: {
    bn: "బెంగాలీ",
    hi: "హిందీ",
    en: "ఇంగ్లీష్",
    as: "అస్సామీ",
    or: "ఒడియా",
    ta: "తమిళం",
    te: "తెలుగు",
  },

};


// =========================================================
// HELPERS
// =========================================================

function formatFileSize(
  bytes
) {

  const size =
    Number(bytes) || 0;


  if (
    size < 1024
  ) {

    return `${size} B`;

  }


  if (
    size <
    1024 * 1024
  ) {

    return `${(
      size /
      1024
    ).toFixed(1)} KB`;

  }


  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(1)} MB`;

}


// =========================================================

function formatDuration(
  value
) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        Number(value) || 0
      )
    );


  const minutes =
    Math.floor(
      totalSeconds /
      60
    );


  const seconds =
    totalSeconds %
    60;


  return `${minutes}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;

}


// =========================================================

function detectAspectRatio(
  width,
  height
) {

  const safeWidth =
    Number(width) || 0;


  const safeHeight =
    Number(height) || 0;


  if (
    !safeWidth ||
    !safeHeight
  ) {

    return "9:16";

  }


  const ratio =
    safeWidth /
    safeHeight;


  if (
    ratio >= 0.52 &&
    ratio <= 0.60
  ) {

    return "9:16";

  }


  if (
    ratio >= 0.95 &&
    ratio <= 1.05
  ) {

    return "1:1";

  }


  if (
    ratio >= 1.70 &&
    ratio <= 1.82
  ) {

    return "16:9";

  }


  if (
    ratio >= 0.72 &&
    ratio <= 0.80
  ) {

    return "3:4";

  }


  return `${safeWidth}:${safeHeight}`;

}


// =========================================================
// ERROR LOCALIZER
// =========================================================

function localizeError(
  error,
  copy
) {

  const message =
    String(
      error?.message || ""
    ).toLowerCase();


  if (
    message.includes(
      "log in"
    ) ||
    message.includes(
      "login"
    ) ||
    error?.status === 401
  ) {

    return copy.loginRequired;

  }


  if (
    message.includes(
      "100 mb"
    ) ||
    message.includes(
      "too large"
    ) ||
    error?.status === 413
  ) {

    return copy.videoTooLarge;

  }


  if (
    message.includes(
      "mp4"
    ) &&
    message.includes(
      "webm"
    )
  ) {

    return copy.unsupportedVideo;

  }


  if (
    message.includes(
      "connect"
    ) ||
    message.includes(
      "network"
    ) ||
    message.includes(
      "failed to fetch"
    )
  ) {

    return copy.connectionError;

  }


  if (
    message.includes(
      "upload"
    )
  ) {

    return copy.uploadFailed;

  }


  return (
    error?.message ||
    copy.publishError
  );

}


// =========================================================
// CREATE REEL PAGE
// =========================================================

export default function CreateReel() {

  const navigate =
    useNavigate();


  const {
    language:
      interfaceLanguage,
  } =
    useLanguage();


  const copy =
    COPY[
      interfaceLanguage
    ] ||
    COPY.en;


  const fileInputRef =
    useRef(null);


  const previewVideoRef =
    useRef(null);


  // =======================================================
  // FILE STATE
  // =======================================================

  const [
    videoFile,
    setVideoFile,
  ] = useState(null);


  const [
    dragging,
    setDragging,
  ] = useState(false);


  const [
    durationSeconds,
    setDurationSeconds,
  ] = useState(0);


  const [
    aspectRatio,
    setAspectRatio,
  ] = useState(
    "9:16"
  );


  // =======================================================
  // FORM STATE
  // =======================================================

  const [
    caption,
    setCaption,
  ] = useState("");


  const [
    reelLanguage,
    setReelLanguage,
  ] = useState(
    REEL_LANGUAGES.some(
      (item) =>
        item.code ===
        interfaceLanguage
    )
      ? interfaceLanguage
      : "bn"
  );


  const [
    visibility,
    setVisibility,
  ] = useState(
    "public"
  );


  const [
    commentsEnabled,
    setCommentsEnabled,
  ] = useState(
    true
  );


  // =======================================================
  // PUBLISH STATE
  // =======================================================

  const [
    publishing,
    setPublishing,
  ] = useState(false);


  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =======================================================
  // PAGE TITLE
  // =======================================================

  useEffect(
    () => {

      const previousTitle =
        document.title;


      document.title =
        `${copy.pageTitle} | SHOBDO`;


      return () => {

        document.title =
          previousTitle;

      };

    },
    [
      copy.pageTitle,
    ]
  );


  // =======================================================
  // VISIBILITY OPTIONS
  // =======================================================

  const visibilityOptions =
    useMemo(
      () => [

        {
          value:
            "public",

          label:
            copy.public,

          description:
            copy.publicDescription,

          icon:
            Globe2,
        },

        {
          value:
            "followers",

          label:
            copy.followers,

          description:
            copy.followersDescription,

          icon:
            Users,
        },

        {
          value:
            "private",

          label:
            copy.private,

          description:
            copy.privateDescription,

          icon:
            Lock,
        },

      ],
      [
        copy,
      ]
    );


  // =======================================================
  // LANGUAGE DISPLAY NAMES
  // =======================================================

  const languageNames =
    LANGUAGE_NAMES[
      interfaceLanguage
    ] ||
    LANGUAGE_NAMES.en;


  // =======================================================
  // PREVIEW URL
  // =======================================================

  const previewUrl =
    useMemo(
      () => {

        if (
          !videoFile
        ) {

          return "";

        }


        return URL.createObjectURL(
          videoFile
        );

      },
      [
        videoFile,
      ]
    );


  useEffect(
    () => {

      return () => {

        if (
          previewUrl
        ) {

          URL.revokeObjectURL(
            previewUrl
          );

        }

      };

    },
    [
      previewUrl,
    ]
  );


  // =======================================================
  // SET VIDEO
  // =======================================================

  function selectVideo(
    file
  ) {

    setError("");
    setSuccess("");


    try {

      validateReelVideo(
        file
      );


      setVideoFile(
        file
      );


      setDurationSeconds(
        0
      );


      setAspectRatio(
        "9:16"
      );


      setUploadProgress(
        0
      );

    } catch (
      validationError
    ) {

      setVideoFile(
        null
      );


      setError(
        localizeError(
          validationError,
          copy
        )
      );

    }

  }


  // =======================================================
  // FILE INPUT
  // =======================================================

  function handleFileChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (
      file
    ) {

      selectVideo(
        file
      );

    }


    event.target.value =
      "";

  }


  // =======================================================
  // DRAG / DROP
  // =======================================================

  function handleDragOver(
    event
  ) {

    event.preventDefault();


    if (
      publishing
    ) {

      return;

    }


    setDragging(
      true
    );

  }


  function handleDragLeave(
    event
  ) {

    event.preventDefault();


    setDragging(
      false
    );

  }


  function handleDrop(
    event
  ) {

    event.preventDefault();


    setDragging(
      false
    );


    if (
      publishing
    ) {

      return;

    }


    const file =
      event.dataTransfer
        .files?.[0];


    if (
      file
    ) {

      selectVideo(
        file
      );

    }

  }


  // =======================================================
  // REMOVE VIDEO
  // =======================================================

  function removeVideo() {

    if (
      publishing
    ) {

      return;

    }


    setVideoFile(
      null
    );


    setDurationSeconds(
      0
    );


    setAspectRatio(
      "9:16"
    );


    setUploadProgress(
      0
    );


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
  // VIDEO METADATA
  // =======================================================

  function handleMetadataLoaded(
    event
  ) {

    const video =
      event.currentTarget;


    const duration =
      Number(
        video.duration
      );


    if (
      Number.isFinite(
        duration
      )
    ) {

      setDurationSeconds(
        duration
      );

    }


    setAspectRatio(

      detectAspectRatio(
        video.videoWidth,
        video.videoHeight
      )

    );

  }


  // =======================================================
  // PUBLISH
  // =======================================================

  async function handlePublish(
    event
  ) {

    event.preventDefault();


    if (
      publishing
    ) {

      return;

    }


    setError("");
    setSuccess("");


    if (
      !videoFile
    ) {

      setError(
        copy.noVideo
      );

      return;

    }


    if (
      caption.length >
      MAX_CAPTION_LENGTH
    ) {

      setError(
        copy.captionTooLong
      );

      return;

    }


    try {

      setPublishing(
        true
      );


      setUploadProgress(
        0
      );


      const result =
        await publishReel({

          file:
            videoFile,

          caption:
            caption.trim(),

          language:
            reelLanguage,

          visibility,

          commentsEnabled,

          durationSeconds,

          aspectRatio,

          onProgress:
            (
              progress
            ) => {

              setUploadProgress(
                progress
              );

            },

        });


      const reel =
        result?.reel ||
        result?.response?.reel ||
        null;


      setSuccess(
        copy.success
      );


      window.dispatchEvent(

        new CustomEvent(
          "shobdo:reel-published",
          {
            detail:
              reel,
          }
        )

      );


      window.setTimeout(
        () => {

          if (
            reel?.id
          ) {

            navigate(
              `/reels/${reel.id}`,
              {
                replace:
                  true,
              }
            );

          } else {

            navigate(
              "/reels",
              {
                replace:
                  true,
              }
            );

          }

        },
        700
      );

    } catch (
      publishError
    ) {

      console.error(
        "REEL PUBLISH ERROR:",
        publishError
      );


      setError(
        localizeError(
          publishError,
          copy
        )
      );

    } finally {

      setPublishing(
        false
      );

    }

  }


  // =======================================================
  // CURRENT VISIBILITY NOTICE
  // =======================================================

  const visibilityNotice =
    visibility ===
    "public"
      ? copy.publicNotice
      : visibility ===
        "followers"
        ? copy.followersNotice
        : copy.privateNotice;


  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="create-reel-page"
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <section
        className="create-reel-header"
      >

        <Link
          to="/reels"
          className="create-reel-back"
        >

          <ArrowLeft
            size={18}
          />

          <span>
            {copy.back}
          </span>

        </Link>


        <div
          className="create-reel-heading"
        >

          <div
            className="create-reel-heading-icon"
          >

            <Clapperboard
              size={24}
            />

          </div>


          <div>

            <span
              className="create-reel-eyebrow"
            >
              {copy.eyebrow}
            </span>


            <h1>
              {copy.title}
            </h1>


            <p>
              {copy.description}
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          STATUS
      ================================================== */}

      {error && (

        <div
          className="create-reel-message create-reel-message-error"
          role="alert"
        >

          <AlertCircle
            size={19}
          />


          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={
              () =>
                setError("")
            }
            aria-label="Close"
          >

            <X
              size={17}
            />

          </button>

        </div>

      )}


      {success && (

        <div
          className="create-reel-message create-reel-message-success"
          role="status"
        >

          <CheckCircle2
            size={19}
          />


          <span>
            {success}
          </span>

        </div>

      )}


      {/* =================================================
          FORM
      ================================================== */}

      <form
        className="create-reel-layout"
        onSubmit={
          handlePublish
        }
      >

        {/* ===============================================
            VIDEO
        ================================================ */}

        <section
          className="create-reel-video-panel"
        >

          <div
            className="create-reel-section-heading"
          >

            <div>

              <span>
                01
              </span>

              <h2>
                {copy.stepVideo}
              </h2>

            </div>


            <span
              className="create-reel-format-badge"
            >

              <FileVideo2
                size={15}
              />

              {copy.reel}

            </span>

          </div>


          {!videoFile
            ? (

              <div
                className={[
                  "create-reel-dropzone",

                  dragging
                    ? "dragging"
                    : "",

                ]
                  .filter(Boolean)
                  .join(" ")
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
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={
                    handleFileChange
                  }
                  className="create-reel-file-input"
                />


                <div
                  className="create-reel-upload-icon"
                >

                  <Upload
                    size={30}
                  />

                </div>


                <h3>
                  {copy.uploadTitle}
                </h3>


                <p>
                  {
                    copy.uploadDescription
                  }
                </p>


                <button
                  type="button"
                  className="create-reel-select-button"
                  onClick={
                    () =>
                      fileInputRef
                        .current
                        ?.click()
                  }
                >

                  <Upload
                    size={17}
                  />

                  {copy.chooseVideo}

                </button>


                <small>
                  {
                    copy.supportedFormats
                  }
                </small>

              </div>

            )
            : (

              <div
                className="create-reel-preview-shell"
              >

                <div
                  className="create-reel-phone"
                >

                  <video
                    ref={
                      previewVideoRef
                    }
                    src={
                      previewUrl
                    }
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={
                      handleMetadataLoaded
                    }
                  />


                  <div
                    className="create-reel-preview-badge"
                  >

                    <Play
                      size={13}
                      fill="currentColor"
                    />

                    {copy.preview}

                  </div>

                </div>


                <div
                  className="create-reel-file-card"
                >

                  <div
                    className="create-reel-file-icon"
                  >

                    <FileVideo2
                      size={22}
                    />

                  </div>


                  <div
                    className="create-reel-file-info"
                  >

                    <strong>
                      {videoFile.name}
                    </strong>


                    <span>

                      {
                        formatFileSize(
                          videoFile.size
                        )
                      }

                      {" · "}

                      {
                        formatDuration(
                          durationSeconds
                        )
                      }

                      {" · "}

                      {
                        aspectRatio
                      }

                    </span>

                  </div>


                  <button
                    type="button"
                    className="create-reel-remove"
                    disabled={
                      publishing
                    }
                    onClick={
                      removeVideo
                    }
                    aria-label={
                      copy.removeVideo
                    }
                    title={
                      copy.removeVideo
                    }
                  >

                    <X
                      size={18}
                    />

                  </button>

                </div>


                <button
                  type="button"
                  className="create-reel-change-video"
                  disabled={
                    publishing
                  }
                  onClick={
                    () =>
                      fileInputRef
                        .current
                        ?.click()
                  }
                >

                  <Upload
                    size={16}
                  />

                  {
                    copy.changeVideo
                  }

                </button>


                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={
                    handleFileChange
                  }
                  className="create-reel-file-input"
                />

              </div>

            )}

        </section>


        {/* ===============================================
            SETTINGS
        ================================================ */}

        <section
          className="create-reel-settings-panel"
        >

          <div
            className="create-reel-section-heading"
          >

            <div>

              <span>
                02
              </span>

              <h2>
                {copy.stepDetails}
              </h2>

            </div>


            <Sparkles
              size={20}
              className="create-reel-heading-sparkle"
            />

          </div>


          {/* =============================================
              CAPTION
          ============================================== */}

          <div
            className="create-reel-field"
          >

            <div
              className="create-reel-label-row"
            >

              <label
                htmlFor="reel-caption"
              >
                {copy.caption}
              </label>


              <span>

                {caption.length}

                /

                {
                  MAX_CAPTION_LENGTH
                }

              </span>

            </div>


            <textarea
              id="reel-caption"
              value={
                caption
              }
              onChange={
                (
                  event
                ) => {

                  setCaption(
                    event.target.value
                  );

                }
              }
              maxLength={
                MAX_CAPTION_LENGTH
              }
              placeholder={
                copy.captionPlaceholder
              }
              disabled={
                publishing
              }
              rows={6}
            />

          </div>


          {/* =============================================
              LANGUAGE
          ============================================== */}

          <div
            className="create-reel-field"
          >

            <label
              htmlFor="reel-language"
            >
              {copy.language}
            </label>


            <div
              className="create-reel-select-wrap"
            >

              <Globe2
                size={17}
              />


              <select
                id="reel-language"
                value={
                  reelLanguage
                }
                disabled={
                  publishing
                }
                onChange={
                  (
                    event
                  ) =>
                    setReelLanguage(
                      event.target.value
                    )
                }
              >

                {REEL_LANGUAGES.map(
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
                        item.nativeName
                      }

                      {
                        languageNames[
                          item.code
                        ] &&
                        languageNames[
                          item.code
                        ] !==
                          item.nativeName
                          ? ` — ${
                              languageNames[
                                item.code
                              ]
                            }`
                          : ""
                      }

                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* =============================================
              VISIBILITY
          ============================================== */}

          <fieldset
            className="create-reel-visibility"
          >

            <legend>
              {copy.visibility}
            </legend>


            <div
              className="create-reel-visibility-options"
            >

              {visibilityOptions.map(
                (
                  option
                ) => {

                  const Icon =
                    option.icon;


                  const selected =
                    visibility ===
                    option.value;


                  return (

                    <label
                      key={
                        option.value
                      }
                      className={[
                        "create-reel-visibility-option",

                        selected
                          ? "selected"
                          : "",

                      ]
                        .filter(Boolean)
                        .join(" ")
                      }
                    >

                      <input
                        type="radio"
                        name="reel-visibility"
                        value={
                          option.value
                        }
                        checked={
                          selected
                        }
                        disabled={
                          publishing
                        }
                        onChange={
                          () =>
                            setVisibility(
                              option.value
                            )
                        }
                      />


                      <span
                        className="create-reel-visibility-icon"
                      >

                        <Icon
                          size={18}
                        />

                      </span>


                      <span
                        className="create-reel-visibility-copy"
                      >

                        <strong>
                          {option.label}
                        </strong>


                        <small>
                          {
                            option.description
                          }
                        </small>

                      </span>


                      <span
                        className="create-reel-radio-indicator"
                      />

                    </label>

                  );

                }
              )}

            </div>

          </fieldset>


          {/* =============================================
              COMMENTS
          ============================================== */}

          <div
            className="create-reel-comments-setting"
          >

            <div
              className="create-reel-comments-copy"
            >

              <span
                className="create-reel-comments-icon"
              >

                <MessageCircle
                  size={19}
                />

              </span>


              <div>

                <strong>
                  {copy.allowComments}
                </strong>


                <small>
                  {
                    copy.allowCommentsDescription
                  }
                </small>

              </div>

            </div>


            <label
              className="create-reel-switch"
            >

              <input
                type="checkbox"
                checked={
                  commentsEnabled
                }
                disabled={
                  publishing
                }
                onChange={
                  (
                    event
                  ) =>
                    setCommentsEnabled(
                      event.target.checked
                    )
                }
              />


              <span />

            </label>

          </div>


          {/* =============================================
              UPLOAD PROGRESS
          ============================================== */}

          {publishing && (

            <div
              className="create-reel-progress-card"
            >

              <div
                className="create-reel-progress-heading"
              >

                <div>

                  <LoaderCircle
                    size={17}
                    className="create-reel-spin"
                  />


                  <span>
                    {copy.uploading}
                  </span>

                </div>


                <strong>
                  {uploadProgress}%
                </strong>

              </div>


              <div
                className="create-reel-progress-track"
              >

                <div
                  className="create-reel-progress-value"
                  style={{
                    width:
                      `${uploadProgress}%`,
                  }}
                />

              </div>


              <small>
                {copy.keepOpen}
              </small>

            </div>

          )}


          {/* =============================================
              PUBLISH
          ============================================== */}

          <div
            className="create-reel-publish-area"
          >

            <div
              className="create-reel-publish-info"
            >

              <Eye
                size={17}
              />


              <span>
                {
                  visibilityNotice
                }
              </span>

            </div>


            <button
              type="submit"
              className="create-reel-publish-button"
              disabled={
                publishing ||
                !videoFile
              }
            >

              {publishing
                ? (

                  <>

                    <LoaderCircle
                      size={19}
                      className="create-reel-spin"
                    />

                    {
                      copy.publishing
                    }

                  </>

                )
                : (

                  <>

                    <Send
                      size={18}
                    />

                    {
                      copy.publish
                    }

                  </>

                )}

            </button>

          </div>

        </section>

      </form>

    </main>

  );

}