import {
  ArrowLeft,
  Clapperboard,
  Plus,
  Sparkles,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../Language/LanguageContext";

import CreateReel from "./CreateReel";
import Reels from "./Reels";

import "./ReelsTab.css";


// =========================================================
// MULTILINGUAL COPY
// =========================================================

const COPY = {

  en: {

    eyebrow:
      "SHOBDO SHORT VIDEO",

    title:
      "Reels",

    description:
      "Discover poetry, storytelling, readings and creative moments from the SHOBDO community.",

    create:
      "Create Reel",

    back:
      "Back to Reels",

    creatorEyebrow:
      "SHOBDO CREATOR",

    creatorTitle:
      "Create a Reel",

    creatorDescription:
      "Publish a short literary video without leaving the Video hub.",

  },


  bn: {

    eyebrow:
      "SHOBDO শর্ট ভিডিও",

    title:
      "রিলস",

    description:
      "SHOBDO কমিউনিটির কবিতা, গল্প, আবৃত্তি ও সৃজনশীল মুহূর্ত আবিষ্কার করুন।",

    create:
      "রিল তৈরি করুন",

    back:
      "রিলসে ফিরুন",

    creatorEyebrow:
      "SHOBDO স্রষ্টা",

    creatorTitle:
      "একটি রিল তৈরি করুন",

    creatorDescription:
      "Video hub ছেড়ে না গিয়েই একটি ছোট সাহিত্যিক ভিডিও প্রকাশ করুন।",

  },


  hi: {

    eyebrow:
      "SHOBDO शॉर्ट वीडियो",

    title:
      "रील्स",

    description:
      "SHOBDO समुदाय की कविता, कहानी, पाठ और रचनात्मक क्षण खोजें।",

    create:
      "रील बनाएँ",

    back:
      "रील्स पर वापस जाएँ",

    creatorEyebrow:
      "SHOBDO CREATOR",

    creatorTitle:
      "एक रील बनाएँ",

    creatorDescription:
      "Video hub छोड़े बिना एक छोटा साहित्यिक वीडियो प्रकाशित करें।",

  },


  as: {

    eyebrow:
      "SHOBDO SHORT VIDEO",

    title:
      "ৰিলছ",

    description:
      "SHOBDO সমাজৰ কবিতা, গল্প, আবৃত্তি আৰু সৃষ্টিশীল মুহূর্ত আৱিষ্কাৰ কৰক।",

    create:
      "ৰিল তৈয়াৰ কৰক",

    back:
      "ৰিলছলৈ উভতি যাওক",

    creatorEyebrow:
      "SHOBDO সৃষ্টিকৰ্তা",

    creatorTitle:
      "এটা ৰিল তৈয়াৰ কৰক",

    creatorDescription:
      "Video hub এৰি নোযোৱাকৈ এটা সৰু সাহিত্যিক ভিডিঅ' প্ৰকাশ কৰক।",

  },


  or: {

    eyebrow:
      "SHOBDO SHORT VIDEO",

    title:
      "ରିଲ୍ସ",

    description:
      "SHOBDO ସମୁଦାୟର କବିତା, କାହାଣୀ, ପାଠ ଓ ସୃଜନଶୀଳ ମୁହୂର୍ତ୍ତ ଆବିଷ୍କାର କରନ୍ତୁ।",

    create:
      "ରିଲ୍ ତିଆରି କରନ୍ତୁ",

    back:
      "ରିଲ୍ସକୁ ଫେରନ୍ତୁ",

    creatorEyebrow:
      "SHOBDO CREATOR",

    creatorTitle:
      "ଏକ ରିଲ୍ ତିଆରି କରନ୍ତୁ",

    creatorDescription:
      "Video hub ଛାଡ଼ିବା ବିନା ଏକ ଛୋଟ ସାହିତ୍ୟିକ ଭିଡିଓ ପ୍ରକାଶ କରନ୍ତୁ।",

  },


  ta: {

    eyebrow:
      "SHOBDO SHORT VIDEO",

    title:
      "ரீல்ஸ்",

    description:
      "SHOBDO சமூகத்தின் கவிதை, கதை, வாசிப்பு மற்றும் படைப்பாற்றல் தருணங்களை கண்டறியுங்கள்.",

    create:
      "ரீல் உருவாக்கு",

    back:
      "ரீல்ஸுக்கு திரும்பு",

    creatorEyebrow:
      "SHOBDO CREATOR",

    creatorTitle:
      "ஒரு ரீலை உருவாக்குங்கள்",

    creatorDescription:
      "Video hub-ஐ விட்டு வெளியேறாமல் ஒரு குறுகிய இலக்கிய வீடியோவை வெளியிடுங்கள்.",

  },


  te: {

    eyebrow:
      "SHOBDO SHORT VIDEO",

    title:
      "రీల్స్",

    description:
      "SHOBDO సమాజంలోని కవిత్వం, కథలు, పఠనాలు మరియు సృజనాత్మక క్షణాలను కనుగొనండి.",

    create:
      "రీల్ సృష్టించండి",

    back:
      "రీల్స్‌కు తిరిగి వెళ్లండి",

    creatorEyebrow:
      "SHOBDO CREATOR",

    creatorTitle:
      "ఒక రీల్ సృష్టించండి",

    creatorDescription:
      "Video hub నుండి బయటకు వెళ్లకుండా ఒక చిన్న సాహిత్య వీడియోను ప్రచురించండి.",

  },

};


// =========================================================
// VIEW NORMALIZER
// =========================================================

function normalizeView(
  value
) {

  return value ===
    "create"
      ? "create"
      : "feed";

}


// =========================================================
// REELS TAB
// =========================================================

export default function ReelsTab({
  user,
}) {

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const {
    language,
  } =
    useLanguage();


  const copy =
    COPY[
      language
    ] ||
    COPY.en;


  // =======================================================
  // CURRENT INTERNAL VIEW
  // =======================================================

  const view =
    normalizeView(
      searchParams.get(
        "view"
      )
    );


  const creating =
    view ===
    "create";


  // =======================================================
  // CHANGE VIEW
  // =======================================================

  function setView(
    nextView
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    next.set(
      "tab",
      "reels"
    );


    if (
      nextView ===
      "create"
    ) {

      next.set(
        "view",
        "create"
      );

    } else {

      next.delete(
        "view"
      );

    }


    setSearchParams(
      next,
      {
        replace:
          false,
      }
    );

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <section
      className={
        creating
          ? "shobdo-reels-tab shobdo-reels-tab-creator"
          : "shobdo-reels-tab"
      }
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <header
        className="shobdo-reels-tab-header"
      >

        <div
          className="shobdo-reels-tab-heading"
        >

          <div
            className="shobdo-reels-tab-icon"
          >

            {creating
              ? (

                <Sparkles
                  size={22}
                />

              )
              : (

                <Clapperboard
                  size={22}
                />

              )}

          </div>


          <div>

            <span
              className="shobdo-reels-tab-eyebrow"
            >

              {creating
                ? copy.creatorEyebrow
                : copy.eyebrow}

            </span>


            <h2>

              {creating
                ? copy.creatorTitle
                : copy.title}

            </h2>


            <p>

              {creating
                ? copy.creatorDescription
                : copy.description}

            </p>

          </div>

        </div>


        {/* =================================================
            CREATE / BACK BUTTON
        ================================================== */}

        {creating
          ? (

            <button
              type="button"
              className="shobdo-reels-tab-action shobdo-reels-tab-action-secondary"
              onClick={
                () =>
                  setView(
                    "feed"
                  )
              }
            >

              <ArrowLeft
                size={17}
              />

              <span>
                {copy.back}
              </span>

            </button>

          )
          : (

            <button
              type="button"
              className="shobdo-reels-tab-action"
              onClick={
                () =>
                  setView(
                    "create"
                  )
              }
            >

              <Plus
                size={18}
              />

              <span>
                {copy.create}
              </span>

            </button>

          )}

      </header>


      {/* =================================================
          CONTENT
      ================================================== */}

      <div
        className="shobdo-reels-tab-content"
      >

        {creating
          ? (

            <CreateReel
              embedded
            />

          )
          : (

            <Reels
              user={
                user
              }
              embedded
              createPath="/videos?tab=reels&view=create"
            />

          )}

      </div>

    </section>

  );

}