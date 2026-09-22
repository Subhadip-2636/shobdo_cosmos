import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Share2,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import {
  getReels,
  registerReelView,
} from "../api/reels";

import "./Reels.css";


// =========================================================
// MULTILINGUAL REELS COPY
// =========================================================

const COPY = {

  en: {
    reels: "Reels",
    loadingTitle: "Loading Reels",
    loadingDescription:
      "Discover stories, poetry, performances and creative voices from the SHOBDO community.",
    unavailableTitle: "Reels are unavailable",
    unavailableDescription: "Unable to load Reels.",
    retry: "Try again",

    eyebrow: "SHOBDO REELS",
    emptyTitle: "Your stories deserve a stage.",
    emptyDescription:
      "Publish poetry recitations, storytelling, literary performances and short creative videos.",
    createFirst: "Create your first Reel",
    formats: "MP4, WEBM, MOV or M4V · Up to 100 MB",

    guestTitle: "Reels are coming to SHOBDO",
    guestDescription:
      "Short literary videos, poetry recitations, storytelling and creative voices will appear here.",
    loginToCreate: "Log in to create a Reel",
    explore: "Explore SHOBDO",

    create: "Create",
    login: "Log in",
    play: "Play Reel",
    pause: "Pause Reel",
    mute: "Mute",
    unmute: "Unmute",

    like: "Like",
    comment: "Comment",
    save: "Save",
    share: "Share",
    more: "More options",

    previous: "Previous Reel",
    next: "Next Reel",

    yourReel: "Your Reel",
    follow: "Follow",
    views: "views",

    sharedText: "Watch this Reel on SHOBDO.",
    copied: "Reel link copied.",
  },


  bn: {
    reels: "রিলস",
    loadingTitle: "রিলস লোড হচ্ছে",
    loadingDescription:
      "SHOBDO কমিউনিটির গল্প, কবিতা, পরিবেশনা ও সৃজনশীল কণ্ঠ আবিষ্কার করুন।",
    unavailableTitle: "রিলস এখন উপলভ্য নয়",
    unavailableDescription: "রিলস লোড করা যায়নি।",
    retry: "আবার চেষ্টা করুন",

    eyebrow: "SHOBDO রিলস",
    emptyTitle: "আপনার গল্পেরও একটি মঞ্চ প্রাপ্য।",
    emptyDescription:
      "কবিতা আবৃত্তি, গল্প বলা, সাহিত্যিক পরিবেশনা এবং ছোট সৃজনশীল ভিডিও প্রকাশ করুন।",
    createFirst: "আপনার প্রথম রিল তৈরি করুন",
    formats: "MP4, WEBM, MOV বা M4V · সর্বোচ্চ 100 MB",

    guestTitle: "SHOBDO-তে রিলস আসছে",
    guestDescription:
      "ছোট সাহিত্যিক ভিডিও, কবিতা আবৃত্তি, গল্প বলা এবং সৃজনশীল কণ্ঠ এখানে দেখা যাবে।",
    loginToCreate: "রিল তৈরি করতে লগ ইন করুন",
    explore: "SHOBDO অন্বেষণ করুন",

    create: "তৈরি করুন",
    login: "লগ ইন",
    play: "রিল চালান",
    pause: "রিল থামান",
    mute: "শব্দ বন্ধ করুন",
    unmute: "শব্দ চালু করুন",

    like: "পছন্দ",
    comment: "মন্তব্য",
    save: "সংরক্ষণ",
    share: "শেয়ার",
    more: "আরও বিকল্প",

    previous: "আগের রিল",
    next: "পরের রিল",

    yourReel: "আপনার রিল",
    follow: "অনুসরণ",
    views: "ভিউ",

    sharedText: "SHOBDO-তে এই রিলটি দেখুন।",
    copied: "রিলের লিংক কপি হয়েছে।",
  },


  hi: {
    reels: "रील्स",
    loadingTitle: "रील्स लोड हो रही हैं",
    loadingDescription:
      "SHOBDO समुदाय की कहानियाँ, कविताएँ, प्रस्तुतियाँ और रचनात्मक आवाज़ें खोजें।",
    unavailableTitle: "रील्स उपलब्ध नहीं हैं",
    unavailableDescription: "रील्स लोड नहीं हो सकीं।",
    retry: "फिर कोशिश करें",

    eyebrow: "SHOBDO रील्स",
    emptyTitle: "आपकी कहानियाँ भी एक मंच की हकदार हैं।",
    emptyDescription:
      "कविता पाठ, कहानी, साहित्यिक प्रस्तुतियाँ और छोटे रचनात्मक वीडियो प्रकाशित करें।",
    createFirst: "अपनी पहली रील बनाएँ",
    formats: "MP4, WEBM, MOV या M4V · अधिकतम 100 MB",

    guestTitle: "SHOBDO पर रील्स आ रही हैं",
    guestDescription:
      "छोटे साहित्यिक वीडियो, कविता पाठ, कहानी और रचनात्मक आवाज़ें यहाँ दिखाई देंगी।",
    loginToCreate: "रील बनाने के लिए लॉग इन करें",
    explore: "SHOBDO एक्सप्लोर करें",

    create: "बनाएँ",
    login: "लॉग इन",
    play: "रील चलाएँ",
    pause: "रील रोकें",
    mute: "आवाज़ बंद करें",
    unmute: "आवाज़ चालू करें",

    like: "पसंद",
    comment: "टिप्पणी",
    save: "सहेजें",
    share: "शेयर",
    more: "और विकल्प",

    previous: "पिछली रील",
    next: "अगली रील",

    yourReel: "आपकी रील",
    follow: "फ़ॉलो",
    views: "व्यू",

    sharedText: "SHOBDO पर यह रील देखें।",
    copied: "रील लिंक कॉपी हो गया।",
  },


  as: {
    reels: "ৰিলছ",
    loadingTitle: "ৰিলছ লোড হৈ আছে",
    loadingDescription:
      "SHOBDO সমাজৰ গল্প, কবিতা, পৰিবেশন আৰু সৃজনশীল কণ্ঠ আবিষ্কাৰ কৰক।",
    unavailableTitle: "ৰিলছ উপলব্ধ নহয়",
    unavailableDescription: "ৰিলছ লোড কৰিব পৰা নগ'ল।",
    retry: "পুনৰ চেষ্টা কৰক",

    eyebrow: "SHOBDO ৰিলছ",
    emptyTitle: "আপোনাৰ গল্পেও এটা মঞ্চৰ যোগ্য।",
    emptyDescription:
      "কবিতা আবৃত্তি, গল্পকথন, সাহিত্যিক পৰিবেশন আৰু সৰু সৃজনশীল ভিডিঅ' প্ৰকাশ কৰক।",
    createFirst: "আপোনাৰ প্ৰথম ৰিল তৈয়াৰ কৰক",
    formats: "MP4, WEBM, MOV বা M4V · সৰ্বাধিক 100 MB",

    guestTitle: "SHOBDO-ত ৰিলছ আহি আছে",
    guestDescription:
      "সৰু সাহিত্যিক ভিডিঅ', কবিতা আবৃত্তি, গল্প আৰু সৃজনশীল কণ্ঠ ইয়াত দেখা যাব।",
    loginToCreate: "ৰিল তৈয়াৰ কৰিবলৈ লগ ইন কৰক",
    explore: "SHOBDO অন্বেষণ কৰক",

    create: "তৈয়াৰ কৰক",
    login: "লগ ইন",
    play: "ৰিল চলাওক",
    pause: "ৰিল ৰখাওক",
    mute: "শব্দ বন্ধ কৰক",
    unmute: "শব্দ চালু কৰক",

    like: "পছন্দ",
    comment: "মন্তব্য",
    save: "সংৰক্ষণ",
    share: "শ্বেয়াৰ",
    more: "অধিক বিকল্প",

    previous: "আগৰ ৰিল",
    next: "পিছৰ ৰিল",

    yourReel: "আপোনাৰ ৰিল",
    follow: "অনুসৰণ",
    views: "ভিউ",

    sharedText: "SHOBDO-ত এই ৰিলটো চাওক।",
    copied: "ৰিলৰ লিংক কপি কৰা হৈছে।",
  },


  or: {
    reels: "ରିଲ୍ସ",
    loadingTitle: "ରିଲ୍ସ ଲୋଡ୍ ହେଉଛି",
    loadingDescription:
      "SHOBDO ସମୁଦାୟର କାହାଣୀ, କବିତା, ପ୍ରଦର୍ଶନ ଓ ସୃଜନଶୀଳ ସ୍ୱର ଖୋଜନ୍ତୁ।",
    unavailableTitle: "ରିଲ୍ସ ଉପଲବ୍ଧ ନାହିଁ",
    unavailableDescription: "ରିଲ୍ସ ଲୋଡ୍ କରାଯାଇପାରିଲା ନାହିଁ।",
    retry: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",

    eyebrow: "SHOBDO ରିଲ୍ସ",
    emptyTitle: "ଆପଣଙ୍କ କାହାଣୀ ମଧ୍ୟ ଏକ ମଞ୍ଚର ଯୋଗ୍ୟ।",
    emptyDescription:
      "କବିତା ପାଠ, କାହାଣୀ, ସାହିତ୍ୟିକ ପ୍ରଦର୍ଶନ ଓ ଛୋଟ ସୃଜନଶୀଳ ଭିଡିଓ ପ୍ରକାଶ କରନ୍ତୁ।",
    createFirst: "ଆପଣଙ୍କ ପ୍ରଥମ ରିଲ୍ ତିଆରି କରନ୍ତୁ",
    formats: "MP4, WEBM, MOV କିମ୍ବା M4V · ସର୍ବାଧିକ 100 MB",

    guestTitle: "SHOBDO-ରେ ରିଲ୍ସ ଆସୁଛି",
    guestDescription:
      "ଛୋଟ ସାହିତ୍ୟିକ ଭିଡିଓ, କବିତା ପାଠ, କାହାଣୀ ଓ ସୃଜନଶୀଳ ସ୍ୱର ଏଠାରେ ଦେଖାଯିବ।",
    loginToCreate: "ରିଲ୍ ତିଆରି କରିବାକୁ ଲଗ୍ ଇନ୍ କରନ୍ତୁ",
    explore: "SHOBDO ଅନ୍ୱେଷଣ କରନ୍ତୁ",

    create: "ତିଆରି କରନ୍ତୁ",
    login: "ଲଗ୍ ଇନ୍",
    play: "ରିଲ୍ ଚଲାନ୍ତୁ",
    pause: "ରିଲ୍ ବନ୍ଦ କରନ୍ତୁ",
    mute: "ଶବ୍ଦ ବନ୍ଦ",
    unmute: "ଶବ୍ଦ ଚାଲୁ",

    like: "ପସନ୍ଦ",
    comment: "ମନ୍ତବ୍ୟ",
    save: "ସଂରକ୍ଷଣ",
    share: "ସେୟାର",
    more: "ଅଧିକ ବିକଳ୍ପ",

    previous: "ପୂର୍ବ ରିଲ୍",
    next: "ପରବର୍ତ୍ତୀ ରିଲ୍",

    yourReel: "ଆପଣଙ୍କ ରିଲ୍",
    follow: "ଅନୁସରଣ",
    views: "ଭ୍ୟୁ",

    sharedText: "SHOBDO-ରେ ଏହି ରିଲ୍ ଦେଖନ୍ତୁ।",
    copied: "ରିଲ୍ ଲିଙ୍କ କପି ହୋଇଛି।",
  },


  ta: {
    reels: "ரீல்ஸ்",
    loadingTitle: "ரீல்ஸ் ஏற்றப்படுகிறது",
    loadingDescription:
      "SHOBDO சமூகத்தின் கதைகள், கவிதைகள், நிகழ்ச்சிகள் மற்றும் படைப்பாற்றல் குரல்களை கண்டறியுங்கள்.",
    unavailableTitle: "ரீல்ஸ் கிடைக்கவில்லை",
    unavailableDescription: "ரீல்ஸை ஏற்ற முடியவில்லை.",
    retry: "மீண்டும் முயற்சிக்கவும்",

    eyebrow: "SHOBDO ரீல்ஸ்",
    emptyTitle: "உங்கள் கதைகளுக்கும் ஒரு மேடை தேவை.",
    emptyDescription:
      "கவிதை வாசிப்பு, கதை சொல்லல், இலக்கிய நிகழ்ச்சிகள் மற்றும் குறும்பட படைப்புகளை வெளியிடுங்கள்.",
    createFirst: "உங்கள் முதல் ரீலை உருவாக்குங்கள்",
    formats: "MP4, WEBM, MOV அல்லது M4V · அதிகபட்சம் 100 MB",

    guestTitle: "SHOBDO-வில் ரீல்ஸ் வருகிறது",
    guestDescription:
      "குறுகிய இலக்கிய வீடியோக்கள், கவிதை வாசிப்பு, கதை சொல்லல் மற்றும் படைப்பாற்றல் குரல்கள் இங்கே தோன்றும்.",
    loginToCreate: "ரீல் உருவாக்க உள்நுழையவும்",
    explore: "SHOBDO-வை ஆராயுங்கள்",

    create: "உருவாக்கு",
    login: "உள்நுழை",
    play: "ரீலை இயக்கவும்",
    pause: "ரீலை நிறுத்தவும்",
    mute: "ஒலியை அணைக்கவும்",
    unmute: "ஒலியை இயக்கவும்",

    like: "விருப்பு",
    comment: "கருத்து",
    save: "சேமி",
    share: "பகிர்",
    more: "மேலும் விருப்பங்கள்",

    previous: "முந்தைய ரீல்",
    next: "அடுத்த ரீல்",

    yourReel: "உங்கள் ரீல்",
    follow: "பின்தொடர்",
    views: "பார்வைகள்",

    sharedText: "SHOBDO-வில் இந்த ரீலை பாருங்கள்.",
    copied: "ரீல் இணைப்பு நகலெடுக்கப்பட்டது.",
  },


  te: {
    reels: "రీల్స్",
    loadingTitle: "రీల్స్ లోడ్ అవుతున్నాయి",
    loadingDescription:
      "SHOBDO సమాజంలోని కథలు, కవితలు, ప్రదర్శనలు మరియు సృజనాత్మక స్వరాలను కనుగొనండి.",
    unavailableTitle: "రీల్స్ అందుబాటులో లేవు",
    unavailableDescription: "రీల్స్‌ను లోడ్ చేయలేకపోయాము.",
    retry: "మళ్లీ ప్రయత్నించండి",

    eyebrow: "SHOBDO రీల్స్",
    emptyTitle: "మీ కథలకు కూడా ఒక వేదిక అర్హం.",
    emptyDescription:
      "కవితా పఠనం, కథనం, సాహిత్య ప్రదర్శనలు మరియు చిన్న సృజనాత్మక వీడియోలను ప్రచురించండి.",
    createFirst: "మీ మొదటి రీల్‌ను సృష్టించండి",
    formats: "MP4, WEBM, MOV లేదా M4V · గరిష్ఠం 100 MB",

    guestTitle: "SHOBDOలో రీల్స్ వస్తున్నాయి",
    guestDescription:
      "చిన్న సాహిత్య వీడియోలు, కవితా పఠనం, కథలు మరియు సృజనాత్మక స్వరాలు ఇక్కడ కనిపిస్తాయి.",
    loginToCreate: "రీల్ సృష్టించడానికి లాగిన్ అవ్వండి",
    explore: "SHOBDOను అన్వేషించండి",

    create: "సృష్టించండి",
    login: "లాగిన్",
    play: "రీల్ ప్లే చేయండి",
    pause: "రీల్ ఆపండి",
    mute: "శబ్దం ఆఫ్ చేయండి",
    unmute: "శబ్దం ఆన్ చేయండి",

    like: "ఇష్టం",
    comment: "వ్యాఖ్య",
    save: "సేవ్",
    share: "షేర్",
    more: "మరిన్ని ఎంపికలు",

    previous: "మునుపటి రీల్",
    next: "తదుపరి రీల్",

    yourReel: "మీ రీల్",
    follow: "ఫాలో",
    views: "వ్యూస్",

    sharedText: "SHOBDOలో ఈ రీల్ చూడండి.",
    copied: "రీల్ లింక్ కాపీ అయింది.",
  },

};


// =========================================================
// HELPERS
// =========================================================

function formatCount(value) {

  const number =
    Number(value) || 0;


  if (number >= 1_000_000) {

    return `${(
      number /
      1_000_000
    ).toFixed(1)}M`;

  }


  if (number >= 1_000) {

    return `${(
      number /
      1_000
    ).toFixed(1)}K`;

  }


  return String(number);

}


function getInitials(name) {

  const safeName =
    String(
      name ||
      "Writer"
    ).trim();


  if (!safeName) {

    return "W";

  }


  return safeName
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
    )
    .join("")
    .toUpperCase();

}


// =========================================================
// REEL ITEM
// =========================================================

function ReelItem({
  reel,
  active,
  user,
  copy,
  onVisible,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) {

  const videoRef =
    useRef(null);


  const itemRef =
    useRef(null);


  const [
    muted,
    setMuted,
  ] = useState(true);


  const [
    playing,
    setPlaying,
  ] = useState(false);


  const [
    progress,
    setProgress,
  ] = useState(0);


  // =======================================================
  // VISIBILITY OBSERVER
  // =======================================================

  useEffect(
    () => {

      const element =
        itemRef.current;


      if (!element) {

        return undefined;

      }


      const observer =
        new IntersectionObserver(
          ([entry]) => {

            if (
              entry.isIntersecting &&
              entry.intersectionRatio >=
                0.65
            ) {

              onVisible(
                reel.id
              );

            }

          },
          {
            threshold: [0.65],
          }
        );


      observer.observe(
        element
      );


      return () => {

        observer.disconnect();

      };

    },
    [
      onVisible,
      reel.id,
    ]
  );


  // =======================================================
  // AUTOPLAY ACTIVE REEL
  // =======================================================

  useEffect(
    () => {

      const video =
        videoRef.current;


      if (!video) {

        return;

      }


      if (active) {

        video
          .play()
          .then(
            () =>
              setPlaying(true)
          )
          .catch(
            () =>
              setPlaying(false)
          );

      } else {

        video.pause();

        setPlaying(false);

      }

    },
    [active]
  );


  // =======================================================
  // PLAY / PAUSE
  // =======================================================

  function togglePlay() {

    const video =
      videoRef.current;


    if (!video) {

      return;

    }


    if (video.paused) {

      video
        .play()
        .then(
          () =>
            setPlaying(true)
        )
        .catch(
          () => {}
        );

    } else {

      video.pause();

      setPlaying(false);

    }

  }


  // =======================================================
  // MUTE
  // =======================================================

  function toggleMute(event) {

    event.stopPropagation();


    const nextMuted =
      !muted;


    setMuted(
      nextMuted
    );


    if (
      videoRef.current
    ) {

      videoRef.current.muted =
        nextMuted;

    }

  }


  // =======================================================
  // PROGRESS
  // =======================================================

  function handleTimeUpdate(
    event
  ) {

    const video =
      event.currentTarget;


    if (
      !video.duration ||
      Number.isNaN(
        video.duration
      )
    ) {

      setProgress(0);

      return;

    }


    setProgress(
      (
        video.currentTime /
        video.duration
      ) *
        100
    );

  }


  // =======================================================
  // SHARE
  // =======================================================

  async function handleShare(
    event
  ) {

    event.stopPropagation();


    const reelUrl =
      `${window.location.origin}/reels/${reel.id}`;


    try {

      if (
        navigator.share
      ) {

        await navigator.share({
          title:
            "SHOBDO Reel",

          text:
            reel.caption ||
            copy.sharedText,

          url:
            reelUrl,
        });


        return;

      }


      await navigator
        .clipboard
        .writeText(
          reelUrl
        );


      window.alert(
        copy.copied
      );

    } catch {

      // User cancelled sharing.

    }

  }


  // =======================================================
  // CREATOR
  // =======================================================

  const creator =
    reel.creator ||
    reel.user ||
    {};


  const creatorName =
    creator.name ||
    creator.full_name ||
    reel.user_name ||
    `Writer ${reel.user_id || ""}`;


  const avatar =
    creator.profile_picture ||
    creator.avatar_url ||
    creator.avatar ||
    reel.user_avatar ||
    null;


  const creatorPath =
    reel.user_id
      ? `/users/${reel.user_id}`
      : "/reels";


  return (

    <article
      ref={itemRef}
      className="shobdo-reel"
      data-reel-id={
        reel.id
      }
    >

      <button
        type="button"
        className="shobdo-reel-video-button"
        onClick={
          togglePlay
        }
        aria-label={
          playing
            ? copy.pause
            : copy.play
        }
      >

        <video
          ref={videoRef}
          className="shobdo-reel-video"
          src={
            reel.video_url
          }
          poster={
            reel.thumbnail_url ||
            undefined
          }
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={
            () =>
              setPlaying(true)
          }
          onPause={
            () =>
              setPlaying(false)
          }
        />

      </button>


      <div
        className="shobdo-reel-gradient"
        aria-hidden="true"
      />


      <div
        className="shobdo-reel-topbar"
      >

        <div
          className="shobdo-reel-topbar-title"
        >

          <span
            className="shobdo-reel-logo-mark"
          >
            শ
          </span>


          <span>
            {copy.reels}
          </span>

        </div>


        {user
          ? (

            <Link
              to="/reels/create"
              className="shobdo-reel-create-top"
            >

              <Plus size={16} />

              {copy.create}

            </Link>

          )
          : (

            <Link
              to="/login"
              className="shobdo-reel-login"
            >
              {copy.login}
            </Link>

          )}

      </div>


      {!playing && (

        <button
          type="button"
          className="shobdo-reel-center-play"
          onClick={
            togglePlay
          }
          aria-label={
            copy.play
          }
        >

          <Play
            size={32}
            fill="currentColor"
          />

        </button>

      )}


      <button
        type="button"
        className="shobdo-reel-sound"
        onClick={
          toggleMute
        }
        aria-label={
          muted
            ? copy.unmute
            : copy.mute
        }
      >

        {muted
          ? (
            <VolumeX
              size={20}
            />
          )
          : (
            <Volume2
              size={20}
            />
          )}

      </button>


      <aside
        className="shobdo-reel-actions"
      >

        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.like
          }
          onClick={
            (event) => {

              if (user) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Heart size={25} />

          </span>


          <span>
            {
              formatCount(
                reel.likes_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.comment
          }
          onClick={
            (event) => {

              if (user) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <MessageCircle
              size={25}
            />

          </span>


          <span>
            {
              formatCount(
                reel.comments_count
              )
            }
          </span>

        </Link>


        <Link
          to={
            user
              ? "#"
              : "/login"
          }
          className="shobdo-reel-action"
          aria-label={
            copy.save
          }
          onClick={
            (event) => {

              if (user) {

                event.preventDefault();

              }

            }
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Bookmark
              size={24}
            />

          </span>


          <span>
            {
              formatCount(
                reel.saves_count
              )
            }
          </span>

        </Link>


        <button
          type="button"
          className="shobdo-reel-action"
          onClick={
            handleShare
          }
          aria-label={
            copy.share
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <Share2
              size={24}
            />

          </span>


          <span>
            {
              formatCount(
                reel.shares_count
              )
            }
          </span>

        </button>


        <button
          type="button"
          className="shobdo-reel-action"
          aria-label={
            copy.more
          }
        >

          <span
            className="shobdo-reel-action-circle"
          >

            <MoreHorizontal
              size={25}
            />

          </span>

        </button>

      </aside>


      <div
        className="shobdo-reel-info"
      >

        <div
          className="shobdo-reel-author-row"
        >

          <Link
            to={creatorPath}
            className="shobdo-reel-author"
          >

            {avatar
              ? (

                <img
                  src={avatar}
                  alt=""
                  className="shobdo-reel-avatar"
                />

              )
              : (

                <div
                  className="shobdo-reel-avatar shobdo-reel-avatar-fallback"
                >
                  {
                    getInitials(
                      creatorName
                    )
                  }
                </div>

              )}


            <span
              className="shobdo-reel-author-name"
            >
              {creatorName}
            </span>

          </Link>


          {user &&
          Number(user.id) ===
            Number(
              reel.user_id
            )
            ? (

              <span
                className="shobdo-reel-own-badge"
              >
                {copy.yourReel}
              </span>

            )
            : (

              <Link
                to={
                  user
                    ? creatorPath
                    : "/login"
                }
                className="shobdo-reel-follow"
              >
                {copy.follow}
              </Link>

            )}

        </div>


        {reel.caption && (

          <p
            className="shobdo-reel-caption"
          >
            {reel.caption}
          </p>

        )}


        <div
          className="shobdo-reel-meta"
        >

          <span
            className="shobdo-reel-language"
          >
            {
              String(
                reel.language ||
                "bn"
              ).toUpperCase()
            }
          </span>


          <span>

            {
              formatCount(
                reel.views_count
              )
            }

            {" "}

            {copy.views}

          </span>

        </div>

      </div>


      <div
        className="shobdo-reel-navigation"
      >

        <button
          type="button"
          disabled={
            !hasPrevious
          }
          onClick={
            (event) => {

              event.stopPropagation();

              onPrevious();

            }
          }
          aria-label={
            copy.previous
          }
        >

          <ChevronUp
            size={25}
          />

        </button>


        <button
          type="button"
          disabled={
            !hasNext
          }
          onClick={
            (event) => {

              event.stopPropagation();

              onNext();

            }
          }
          aria-label={
            copy.next
          }
        >

          <ChevronDown
            size={25}
          />

        </button>

      </div>


      <div
        className="shobdo-reel-progress"
      >

        <div
          className="shobdo-reel-progress-value"
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

    </article>

  );

}


// =========================================================
// REELS PAGE
// =========================================================

export default function Reels({
  user,
}) {

  const {
    reelId,
  } = useParams();


  const {
    language,
  } = useLanguage();


  const copy =
    COPY[language] ||
    COPY.en;


  const containerRef =
    useRef(null);


  const viewedReelsRef =
    useRef(
      new Set()
    );


  const [
    reels,
    setReels,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    activeReelId,
    setActiveReelId,
  ] = useState(null);


  // =======================================================
  // FULL SCREEN REELS MODE
  // =======================================================

  useEffect(
    () => {

      document.body.classList.add(
        "shobdo-reels-route-active"
      );


      return () => {

        document.body.classList.remove(
          "shobdo-reels-route-active"
        );

      };

    },
    []
  );


  // =======================================================
  // PAGE TITLE
  // =======================================================

  useEffect(
    () => {

      const previousTitle =
        document.title;


      document.title =
        `${copy.reels} | SHOBDO`;


      return () => {

        document.title =
          previousTitle;

      };

    },
    [
      copy.reels,
    ]
  );


  // =======================================================
  // LOAD REELS
  // =======================================================

  const loadReels =
    useCallback(
      async () => {

        setLoading(true);
        setError("");


        try {

          const data =
            await getReels({
              page: 1,
              perPage: 30,
            });


          let items =
            Array.isArray(
              data?.reels
            )
              ? [
                  ...data.reels,
                ]
              : [];


          if (reelId) {

            const requestedId =
              Number(reelId);


            const requestedIndex =
              items.findIndex(
                (reel) =>
                  Number(
                    reel.id
                  ) ===
                  requestedId
              );


            if (
              requestedIndex > 0
            ) {

              const [
                requestedReel,
              ] =
                items.splice(
                  requestedIndex,
                  1
                );


              items = [
                requestedReel,
                ...items,
              ];

            }

          }


          setReels(items);


          setActiveReelId(
            items[0]?.id ||
            null
          );

        } catch (
          loadError
        ) {

          console.error(
            "LOAD REELS ERROR:",
            loadError
          );


          setError(
            loadError?.message ||
            copy.unavailableDescription
          );

        } finally {

          setLoading(false);

        }

      },
      [
        reelId,
        copy.unavailableDescription,
      ]
    );


  useEffect(
    () => {

      loadReels();

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // REFRESH AFTER PUBLISH
  // =======================================================

  useEffect(
    () => {

      function handlePublished() {

        loadReels();

      }


      window.addEventListener(
        "shobdo:reel-published",
        handlePublished
      );


      return () => {

        window.removeEventListener(
          "shobdo:reel-published",
          handlePublished
        );

      };

    },
    [
      loadReels,
    ]
  );


  // =======================================================
  // ACTIVE REEL
  // =======================================================

  const handleVisible =
    useCallback(
      (id) => {

        setActiveReelId(id);


        if (
          viewedReelsRef
            .current
            .has(id)
        ) {

          return;

        }


        viewedReelsRef
          .current
          .add(id);


        registerReelView(id)
          .catch(
            () => {}
          );

      },
      []
    );


  // =======================================================
  // SCROLL
  // =======================================================

  function scrollToIndex(
    index
  ) {

    if (
      index < 0 ||
      index >= reels.length
    ) {

      return;

    }


    const reel =
      reels[index];


    const element =
      containerRef
        .current
        ?.querySelector(
          `[data-reel-id="${reel.id}"]`
        );


    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  }


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <main
        className="shobdo-reels-state shobdo-reels-loading-state"
      >

        <LoaderCircle
          className="shobdo-reels-spinner"
          size={36}
        />


        <h1>
          {copy.loadingTitle}
        </h1>


        <p>
          {copy.loadingDescription}
        </p>

      </main>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (

      <main
        className="shobdo-reels-state shobdo-reels-error-state"
      >

        <Clapperboard
          size={38}
        />


        <h1>
          {copy.unavailableTitle}
        </h1>


        <p>
          {error}
        </p>


        <button
          type="button"
          onClick={
            loadReels
          }
          className="shobdo-reels-retry"
        >
          {copy.retry}
        </button>

      </main>

    );

  }


  // =======================================================
  // EMPTY
  // =======================================================

  if (
    reels.length === 0
  ) {

    return (

      <main
        className="shobdo-reels-state shobdo-reels-empty-state"
      >

        <div
          className="shobdo-reels-empty-icon"
        >

          <Clapperboard
            size={34}
          />

        </div>


        {user
          ? (

            <>

              <span
                className="shobdo-reels-empty-eyebrow"
              >
                {copy.eyebrow}
              </span>


              <h1>
                {copy.emptyTitle}
              </h1>


              <p>
                {
                  copy.emptyDescription
                }
              </p>


              <Link
                to="/reels/create"
                className="shobdo-reels-create-button"
              >

                <Upload
                  size={18}
                />

                {copy.createFirst}

              </Link>


              <small
                className="shobdo-reels-empty-note"
              >
                {copy.formats}
              </small>

            </>

          )
          : (

            <>

              <span
                className="shobdo-reels-empty-eyebrow"
              >
                {copy.eyebrow}
              </span>


              <h1>
                {copy.guestTitle}
              </h1>


              <p>
                {
                  copy.guestDescription
                }
              </p>


              <div
                className="shobdo-reels-empty-actions"
              >

                <Link
                  to="/login"
                  className="shobdo-reels-create-button"
                >

                  <Video
                    size={18}
                  />

                  {
                    copy.loginToCreate
                  }

                </Link>


                <Link
                  to="/"
                  className="shobdo-reels-home-link"
                >
                  {copy.explore}
                </Link>

              </div>

            </>

          )}

      </main>

    );

  }


  // =======================================================
  // REEL FEED
  // =======================================================

  return (

    <main
      ref={containerRef}
      className="shobdo-reels-page"
    >

      {reels.map(
        (
          reel,
          index
        ) => (

          <ReelItem
            key={reel.id}
            reel={reel}
            user={user}
            copy={copy}
            active={
              reel.id ===
              activeReelId
            }
            onVisible={
              handleVisible
            }
            hasPrevious={
              index > 0
            }
            hasNext={
              index <
              reels.length - 1
            }
            onPrevious={
              () =>
                scrollToIndex(
                  index - 1
                )
            }
            onNext={
              () =>
                scrollToIndex(
                  index + 1
                )
            }
          />

        )
      )}


      {user && (

        <Link
          to="/reels/create"
          className="shobdo-reels-floating-create"
          aria-label={
            copy.create
          }
          title={
            copy.create
          }
        >

          <Plus
            size={23}
          />

        </Link>

      )}

    </main>

  );

}