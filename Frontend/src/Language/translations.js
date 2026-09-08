// =========================================================
// SHOBDO LANGUAGE CONFIGURATION
// =========================================================

export const DEFAULT_UI_LANGUAGE = "bn";

export const UI_LANGUAGES = [
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
];

// =========================================================
// TRANSLATIONS
// =========================================================

export const translations = {
  // =======================================================
  // BENGALI
  // =======================================================

  bn: {
    common: {
      brand: "শব্দ",
      brandEnglish: "SHOBDO",
      loading: "লোড হচ্ছে...",
      save: "সংরক্ষণ করুন",
      saved: "সংরক্ষিত",
      cancel: "বাতিল করুন",
      close: "বন্ধ করুন",
      delete: "মুছে ফেলুন",
      edit: "সম্পাদনা করুন",
      update: "আপডেট করুন",
      submit: "জমা দিন",
      continue: "চালিয়ে যান",
      back: "ফিরে যান",
      next: "পরবর্তী",
      previous: "পূর্ববর্তী",
      search: "খুঁজুন",
      clear: "মুছুন",
      optional: "ঐচ্ছিক",
      required: "আবশ্যক",
      yes: "হ্যাঁ",
      no: "না",
      all: "সব",
      readMore: "আরও পড়ুন",
      retry: "আবার চেষ্টা করুন",
      language: "ভাষা",
      category: "বিভাগ",
      title: "শিরোনাম",
      content: "লেখা",
      words: "শব্দ",
      characters: "অক্ষর",
      unknownAuthor: "অজানা লেখক",
      success: "সফল হয়েছে",
      error: "সমস্যা হয়েছে",
      confirm: "নিশ্চিত করুন",
      share: "শেয়ার করুন",
      copied: "কপি হয়েছে",
      noData: "তথ্য নেই",
      untitled: "শিরোনামহীন লেখা",
    },

    navbar: {
      home: "হোম",
      explore: "অন্বেষণ",
      write: "লিখুন",
      myWritings: "আমার লেখা",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      login: "লগইন",
      register: "নিবন্ধন",
      profile: "প্রোফাইল",
      logout: "লগআউট",
      openMenu: "মেনু খুলুন",
      closeMenu: "মেনু বন্ধ করুন",
      changeLanguage: "ভাষা পরিবর্তন করুন",
      websiteLanguage: "ওয়েবসাইটের ভাষা",
      lightMode: "লাইট মোড",
      darkMode: "ডার্ক মোড",
      signedInAs: "সাইন ইন করেছেন",
    },

    writerProfile: {

      title: "লেখক পরিচিতি",
      memberSince:"সদস্য হয়েছেন {{date}}",
      yourProfile:"আপনার প্রোফাইল",
      follow:"অনুসরণ করুন",
      following:"অনুসরণ করছেন",
      followers:"অনুসারী",
      publishedWritings:"প্রকাশিত লেখা",
      likesReceived:"প্রাপ্ত পছন্দ",
      comments:"মন্তব্য",
      publishedWorks:"প্রকাশিত রচনা",
      writingsBy:"{{name}}-এর লেখা",
      writings:"টি লেখা",
      noWritings:"এখনও কোনো প্রকাশিত লেখা নেই",
      noWritingsDescription:"এই লেখক এখনও কোনো লেখা প্রকাশ করেননি।",
      loading:"লেখকের প্রোফাইল লোড হচ্ছে...",
      notFound:"লেখককে পাওয়া যায়নি",
      unavailable:"এই লেখকের প্রোফাইলটি বর্তমানে উপলব্ধ নয়।",
      invalidId:"অবৈধ লেখক আইডি।",
      loadError:"লেখকের প্রোফাইল লোড করা যায়নি।",
      followError:"অনুসরণের অবস্থা পরিবর্তন করা যায়নি।",
      exploreWritings:"লেখা অন্বেষণ করুন",
    },

    home: {
      eyebrow: "বাংলা সাহিত্য সম্প্রদায়",
      title: "তোমার শব্দ, তোমার গল্প।",
      heroTitle: "তোমার শব্দ, তোমার গল্প।",
      subtitle:
        "নিজের চিন্তা, অনুভূতি ও কল্পনাকে শব্দে রূপ দিন।",
      heroDescription:
        "কবিতা, গল্প, অনুভূতি ও চিন্তাকে শব্দে রূপ দিন। নিজের লেখা প্রকাশ করুন এবং অন্য লেখকদের সৃষ্টির সঙ্গে যুক্ত হন।",
      startWriting: "লেখা শুরু করুন",
      exploreWriting: "লেখা পড়ুন",
      exploreWritings: "লেখা পড়ুন",
      explore: "অন্বেষণ করুন",
      categoriesTitle: "পছন্দের বিভাগ",
      categoriesSubtitle:
        "বিভিন্ন ধারার সাহিত্য আবিষ্কার করুন",
      latestTitle: "সাম্প্রতিক লেখা",
      latestSubtitle:
        "আমাদের লেখকদের নতুন সৃষ্টিগুলো পড়ুন",
      viewAll: "সব লেখা দেখুন",
      noWritings:
        "এখনও কোনো লেখা প্রকাশিত হয়নি।",
      ctaTitle:
        "আপনার ভেতরের গল্পটি অপেক্ষা করছে",
      ctaDescription:
        "একটি শব্দ দিয়ে শুরু করুন। আপনার লেখা হয়তো কারও মনে নতুন আলো জ্বালাবে।",
      ctaButton: "আজই লিখুন",

      writerInvitation:
        "কিছু গল্প শুধু আপনারই লেখার অপেক্ষায় আছে।",
      blankPageLabel: "একটি ফাঁকা পাতা",
      blankPageTitle: "আজ আপনি কী লিখবেন?",
      beginStory: "আপনার গল্প শুরু করুন",

      quoteEyebrow: "যে কথা থেকে যায়",
      quoteTitle:
        "যে কথাগুলো প্রজন্মের পর প্রজন্মকে ছুঁয়ে গেছে।",
      quoteDescription:
        "কখনো কখনো একটি বাক্যই যথেষ্ট, কাউকে কলম তুলে নিতে।",

      promptEyebrow: "আজকের ভাবনা",
      promptTitle:
        "এমন কিছু লিখুন যা আপনি কখনো মুখে বলেননি।",
      promptDescription:
        "নিখুঁত হতে হবে না। শুধু নিজের হতে হবে।",

      discoverEyebrow: "আবিষ্কার করুন",
      categoriesDescription:
        "বিভিন্ন ধারার সাহিত্য আবিষ্কার করুন",

      featuredEyebrow: "সম্প্রদায়ের পাতা থেকে",

      latestEyebrow: "সাম্প্রতিক লেখা",
      latestDescription:
        "আমাদের লেখকদের নতুন সৃষ্টিগুলো পড়ুন",

      emptyTitle: "এখনও কোনো লেখা নেই",
      emptyDescription:
        "প্রথম লেখাটি প্রকাশ করে এই জায়গাটি প্রাণবন্ত করে তুলুন।",

      finalEyebrow: "আপনার পাতা এখনও ফাঁকা",
      finalTitle:
        "কেউ হয়তো অপেক্ষা করছে শুধু আপনার লেখা পড়ার জন্য।",
      finalDescription:
        "একটি বাক্য দিয়ে শুরু করুন। বাকিটা নিজের পথ খুঁজে নেবে।",
      beginWriting: "কিছু লিখুন",
    },

    categories: {
      all: "সব বিভাগ",
      poetry: "কবিতা",
      story: "গল্প",
      feelings: "অনুভূতি",
      reflection: "অনুভূতি",
      essay: "প্রবন্ধ",
      other: "অন্যান্য",
    },

    explore: {
      eyebrow: "সাহিত্য আবিষ্কার করুন",
      title: "অন্বেষণ করুন",
      description:
        "কবিতা, গল্প, অনুভূতি, প্রবন্ধ এবং নতুন লেখক খুঁজে নিন।",

      searchPlaceholder:
        "কবিতা, গল্প বা লেখক খুঁজুন…",
      searchButton: "খুঁজুন",

      category: "বিভাগ",
      language: "লেখার ভাষা",

      allCategories: "সব বিভাগ",
      allLanguages: "সব ভাষা",

      latest: "সাম্প্রতিক",
      popular: "জনপ্রিয়",
      oldest: "পুরোনো",
      titleAZ: "শিরোনাম: অ–হ",

      results: "টি লেখা পাওয়া গেছে",
      writingsFound: "টি লেখা পাওয়া গেছে",

      loading: "লেখাগুলো লোড হচ্ছে...",

      loadError: "লেখা লোড করা যায়নি",
      loadErrorDescription:
        "Backend server-এর সঙ্গে সংযোগ করা যাচ্ছে না। Backend চালু আছে কি না পরীক্ষা করুন।",

      retry: "আবার চেষ্টা করুন",

      noResultsTitle: "কোনো লেখা পাওয়া যায়নি",
      noResultsDescription:
        "অন্য শব্দ বা বিভাগ ব্যবহার করে আবার চেষ্টা করুন।",

      clearFilters: "ফিল্টার মুছুন",
      loadMore: "আরও লেখা দেখুন",

      allWritings:"সবার লেখা",
      following:"অনুসরণ",
      followingDescription:
        "আপনি যেসব লেখককে অনুসরণ করেন তাদের সাম্প্রতিক প্রকাশিত লেখা।",
      followingWritings:"অনুসরণ করা লেখকদের লেখা",
      noFollowing:"অনুসরণ ফিড এখন খালি",
      noFollowingDescription:
        "লেখকদের অনুসরণ করলে তাদের প্রকাশিত লেখা এখানে দেখা যাবে।",
      signInFollowingTitle:
        "সাইন ইন প্রয়োজন",
      signInFollowing:
        "অনুসরণ করা লেখকদের লেখা দেখতে আপনার অ্যাকাউন্টে সাইন ইন করুন।",
      noResults: "কোনও লেখা পাওয়া যায়নি",
      noResultsDescription:"অন্য কোনও শব্দ, বিভাগ বা ফিল্টার দিয়ে আবার চেষ্টা করুন।",
      clearFilters:"ফিল্টার মুছুন",
    },

    writingCard: {
      read: "লেখাটি পড়ুন",
      readMore: "আরও পড়ুন",
      like: "পছন্দ করুন",
      unlike: "পছন্দ সরান",
      likes: "পছন্দ",
      comment: "মন্তব্য",
      comments: "মন্তব্য",
      by: "লেখক",
      unknownAuthor: "অজানা লেখক",
      untitled: "শিরোনামহীন লেখা",
      previewUnavailable: "প্রিভিউ উপলব্ধ নেই",
      minutes: "মিনিট পড়া",
      words: "শব্দ",
    },

    write: {
      eyebrow: "তোমার সৃষ্টির জায়গা",
      title: "নতুন কিছু লিখুন",
      subtitle:
        "মনের কথাকে শব্দে রূপ দিন। নিজে লিখুন অথবা হাতে লেখা পৃষ্ঠা ও PDF স্ক্যান করুন।",

      languageStep: "০১",
      languageTitle: "লেখার ভাষা",
      languageDescription:
        "OCR এই ভাষা অনুসারে লেখা শনাক্ত করবে।",
      languageNote:
        "ওয়েবসাইটের ভাষা পরিবর্তন হলেও আপনার লেখার ভাষা পরিবর্তন হবে না।",

      bengali: "বাংলা",
      english: "English",
      hindi: "हिन्दी",

      scanStep: "০২",
      scanTitle: "লেখা স্ক্যান করুন",
      scanOptional: "ঐচ্ছিক",
      scanDescription:
        "PDF অথবা হাতে লেখা পরিষ্কার ছবি নির্বাচন করুন। স্ক্যান করা লেখা সম্পাদক অংশে যোগ হবে।",
      dropTitle: "ফাইল এখানে ছেড়ে দিন",
      dropSubtitle:
        "অথবা আপনার ডিভাইস থেকে নির্বাচন করুন",
      selectFile: "ফাইল নির্বাচন করুন",
      supportedFiles:
        "PDF, JPG বা PNG • সর্বোচ্চ ১০ MB",
      selectedFile: "নির্বাচিত ফাইল",
      removeFile: "নির্বাচিত ফাইল সরান",
      ocrLabel: "OCR",
      extractButton: "স্ক্যান করে লেখা তুলুন",
      extracting: "লেখা শনাক্ত করা হচ্ছে...",
      extractionSuccess:
        "লেখা সফলভাবে স্ক্যান করা হয়েছে। প্রকাশের আগে প্রয়োজনমতো সম্পাদনা করুন।",
      extractionFailed:
        "লেখা স্ক্যান করা যায়নি। আবার চেষ্টা করুন।",
      noTextFound:
        "ফাইল থেকে কোনো লেখা পাওয়া যায়নি। পরিষ্কার ছবি বা PDF ব্যবহার করুন।",
      chooseFileFirst:
        "প্রথমে একটি PDF, JPG বা PNG ফাইল নির্বাচন করুন।",
      invalidFile:
        "শুধুমাত্র PDF, JPG, JPEG অথবা PNG ফাইল নির্বাচন করুন।",
      fileTooLarge:
        "ফাইলের আকার ১০ MB-এর বেশি হতে পারবে না।",
      emptyFile: "নির্বাচিত ফাইলটি খালি।",
      damagedImage:
        "ছবিটি ক্ষতিগ্রস্ত অথবা পড়া যাচ্ছে না।",
      damagedPdf:
        "PDF ফাইলটি ক্ষতিগ্রস্ত অথবা পড়া যাচ্ছে না।",
      tesseractMissing:
        "Tesseract OCR ইনস্টল করা নেই অথবা Windows PATH-এ পাওয়া যাচ্ছে না।",
      languageDataMissing:
        "OCR ভাষার ডেটা পাওয়া যায়নি। eng, ben এবং hin traineddata পরীক্ষা করুন।",
      serverUnavailable:
        "Backend server-এর সঙ্গে সংযোগ করা যাচ্ছে না।",
      ocrLanguageUnsupported:
        "এই ভাষার জন্য এখনও স্ক্যান (OCR) সুবিধা নেই। বাংলা, ইংরেজি বা হিন্দি ব্যবহার করুন, অথবা সরাসরি টাইপ করুন।",
      ocrLanguageNote:
        "স্ক্যান (OCR) সুবিধা আপাতত শুধুমাত্র বাংলা, ইংরেজি ও হিন্দিতে পাওয়া যায় — আপনি চাইলে এই ভাষায় সরাসরি টাইপ করতে পারেন।",

      editorStep: "০৩",
      editorTitle: "লেখা সম্পাদনা করুন",
      titleLabel: "শিরোনাম",
      titlePlaceholder:
        "আপনার লেখার একটি সুন্দর শিরোনাম দিন",
      titleHelp:
        "পাঠকদের আকর্ষণ করে এমন শিরোনাম লিখুন।",
      categoryLabel: "বিভাগ",
      languageLabel: "লেখার ভাষা",
      contentLabel: "আপনার লেখা",
      contentPlaceholder:
        "এখানে আপনার লেখা শুরু করুন...",
      editorHelp:
        "স্ক্যান করা লেখায় কোনো ভুল থাকলে প্রকাশের আগে এখানে সংশোধন করুন।",
      wordCount: "শব্দ",
      characterCount: "অক্ষর",

      saveDraft: "খসড়া সংরক্ষণ",
      draftSaved:
        "খসড়া এই ডিভাইসে সংরক্ষণ করা হয়েছে।",
      draftEmpty:
        "খসড়া সংরক্ষণ করতে শিরোনাম বা লেখার কিছু অংশ লিখুন।",
      publish: "লেখা প্রকাশ করুন",
      publishing: "প্রকাশ করা হচ্ছে...",
      published:
        "আপনার লেখা সফলভাবে প্রকাশিত হয়েছে।",
      publishedSuccess:
        "আপনার লেখা সফলভাবে প্রকাশিত হয়েছে।",

      loginRequired:
        "লেখা প্রকাশ করতে প্রথমে লগইন করুন।",
      titleRequired: "লেখার শিরোনাম লিখুন।",
      contentRequired:
        "লেখার মূল অংশ লিখুন অথবা একটি ফাইল স্ক্যান করুন।",
      titleTooLong:
        "শিরোনাম সর্বোচ্চ ২০০ অক্ষরের হতে পারবে।",
      publishFailed:
        "লেখাটি প্রকাশ করা যায়নি। আবার চেষ্টা করুন।",
    },

    writingDetails: {
      loading: "লেখাটি লোড হচ্ছে...",
      notFound: "লেখাটি পাওয়া যায়নি",
      notFoundDescription:
        "লেখাটি মুছে ফেলা হয়েছে অথবা ঠিকানাটি সঠিক নয়।",
      unavailable:
        "লেখাটি এই মুহূর্তে দেখা যাচ্ছে না।",
      retry: "আবার চেষ্টা করুন",
      backToExplore: "অন্বেষণে ফিরে যান",
      back: "ফিরে যান",
      writtenBy: "লিখেছেন",
      by: "লিখেছেন",
      publishedOn: "প্রকাশিত",
      readingTime: "মিনিটের পাঠ",
      words: "শব্দ",
      like: "পছন্দ করুন",
      liked: "পছন্দ হয়েছে",
      likeError:
        "পছন্দ আপডেট করা যায়নি। আবার চেষ্টা করুন।",
      comments: "মন্তব্য",
      share: "শেয়ার করুন",
      originalLanguage: "মূল ভাষা",
      moreWritings: "আরও লেখা দেখুন",
      edit: "সম্পাদনা করুন",
      delete: "মুছে ফেলুন",
      deleteTitle: "লেখাটি মুছে ফেলবেন?",
      deleteDescription:
        "এই কাজটি ফিরিয়ে নেওয়া যাবে না।",
      deleteConfirm: "হ্যাঁ, মুছে ফেলুন",
      deleting: "মুছে ফেলা হচ্ছে...",
      deleteSuccess:
        "লেখাটি সফলভাবে মুছে ফেলা হয়েছে।",
      deleteFailed:
        "লেখাটি মুছে ফেলা যায়নি।",
      copyLink: "লিংক কপি করুন",
      linkCopied: "লিংক কপি করা হয়েছে।",

      commentSection: {
        community: "সম্প্রদায়ের মতামত",
        title: "মন্তব্যসমূহ",
        placeholder:
          "লেখাটি সম্পর্কে আপনার মতামত লিখুন…",
        posting: "পাঠানো হচ্ছে…",
        post: "মন্তব্য করুন",
        loading: "মন্তব্য লোড হচ্ছে…",
        loadError: "মন্তব্য লোড করা যায়নি।",
        emptyTitle: "এখনও কোনো মন্তব্য নেই",
        emptyDescription:
          "প্রথম মন্তব্যটি করুন এবং আলোচনা শুরু করুন।",
        unknownUser: "অজানা ব্যবহারকারী",
        delete: "মন্তব্য মুছুন",
        tooLong:
          "মন্তব্য ২০০০ অক্ষরের বেশি হতে পারবে না।",
        addError:
          "মন্তব্য যোগ করা যায়নি। আবার চেষ্টা করুন।",
        deleteConfirm:
          "আপনি কি সত্যিই এই মন্তব্যটি মুছে ফেলতে চান?",
        deleteError:
          "মন্তব্য মুছে ফেলা যায়নি। আবার চেষ্টা করুন।",
      },
    },

    comments: {
      title: "মন্তব্য",
      singular: "মন্তব্য",
      plural: "মন্তব্য",
      placeholder:
        "লেখাটি সম্পর্কে আপনার মতামত লিখুন…",
      submit: "মন্তব্য করুন",
      submitting: "পাঠানো হচ্ছে...",
      loginRequired:
        "মন্তব্য করতে প্রথমে লগইন করুন।",
      empty:
        "এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন।",
      emptyComment:
        "মন্তব্য খালি রাখা যাবে না।",
      added: "মন্তব্য সফলভাবে যোগ হয়েছে।",
      addFailed: "মন্তব্য যোগ করা যায়নি।",
      delete: "মন্তব্য মুছুন",
      deleting: "মুছে ফেলা হচ্ছে...",
      deleteConfirm:
        "আপনি কি মন্তব্যটি মুছে ফেলতে চান?",
      deleteFailed:
        "মন্তব্য মুছে ফেলা যায়নি।",
      unknownUser: "অজানা ব্যবহারকারী",
    },

    auth: {
      loginTitle: "স্বাগতম",
      loginSubtitle:
        "আপনার SHOBDO অ্যাকাউন্টে লগইন করুন",
      registerTitle: "SHOBDO-তে যোগ দিন",
      registerSubtitle:
        "নিজের লেখা প্রকাশ করতে একটি অ্যাকাউন্ট তৈরি করুন",
      name: "নাম",
      namePlaceholder: "আপনার সম্পূর্ণ নাম",
      email: "ইমেইল",
      emailPlaceholder: "আপনার ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড",
      confirmPassword:
        "পাসওয়ার্ড নিশ্চিত করুন",
      confirmPasswordPlaceholder:
        "পাসওয়ার্ডটি আবার লিখুন",
      login: "লগইন",
      loggingIn: "লগইন হচ্ছে...",
      register: "নিবন্ধন করুন",
      registering: "অ্যাকাউন্ট তৈরি হচ্ছে...",
      noAccount: "এখনও অ্যাকাউন্ট নেই?",
      haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন",
      goToLogin: "লগইন করুন",
      logout: "লগআউট",
      loginSuccess: "সফলভাবে লগইন হয়েছে।",
      registerSuccess:
        "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।",
      passwordMismatch:
        "দুটি পাসওয়ার্ড মিলছে না।",
      invalidCredentials:
        "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      emailExists:
        "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।",
      loginRequired:
        "এই কাজটি করতে প্রথমে লগইন করুন।",
    },

    myWritings: {
      eyebrow: "আপনার সৃষ্টির সংগ্রহ",
      title: "আমার লেখা",
      description:
        "আপনার খসড়া ও প্রকাশিত লেখাগুলো পরিচালনা করুন।",
      newWriting: "নতুন লেখা",
      drafts: "খসড়া",
      published: "প্রকাশিত",
      trash: "ট্র্যাশ",
      restore: "পুনরুদ্ধার করুন",
      restored: "লেখাটি সফলভাবে পুনরুদ্ধার করা হয়েছে।",
      deletePermanently: "স্থায়ীভাবে মুছুন",
      permanentlyDeleted: "লেখাটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",
      noTrash: "ট্র্যাশ খালি",
      noTrashDescription: "ট্র্যাশে কোনো লেখা নেই।",
      movedToTrash: "লেখাটি ট্র্যাশে পাঠানো হয়েছে।",
      searchDrafts: "খসড়া লেখা খুঁজুন…",
      searchPublished:
        "প্রকাশিত লেখা খুঁজুন…",
      allLanguages: "সব ভাষা",
      recentlyUpdated: "সর্বশেষ আপডেট",
      recentlyCreated: "সর্বশেষ তৈরি",
      oldestFirst: "পুরোনো আগে",
      titleAZ: "শিরোনাম: অ–হ",
      refresh: "রিফ্রেশ করুন",
      clearFilters: "ফিল্টার মুছুন",
      loading:
        "আপনার লেখাগুলো লোড হচ্ছে…",
      noResults: "কোনো লেখা পাওয়া যায়নি",
      noDrafts: "কোনো খসড়া নেই",
      noPublished:
        "কোনো প্রকাশিত লেখা নেই",
      noResultsDescription:
        "অন্য শব্দ বা ফিল্টার দিয়ে আবার চেষ্টা করুন।",
      noDraftsDescription:
        "আপনার প্রথম লেখা শুরু করে খসড়া হিসেবে সংরক্ষণ করুন।",
      noPublishedDescription:
        "আপনার প্রকাশিত লেখাগুলো এখানে দেখা যাবে।",
      startWriting: "লেখা শুরু করুন",
      words: "শব্দ",
      readTime: "মিনিট পড়া",
      updated: "আপডেট",
      edit: "সম্পাদনা",
      view: "দেখুন",
      publish: "প্রকাশ করুন",
      moveToDraft:
        "লেখাটি খসড়ায় সরানো হয়েছে।",
      delete: "মুছুন",
      deleteEyebrow: "ট্র্যাশে পাঠান",
      deleteTitle: "লেখাটি ট্র্যাশে পাঠাবেন?",
      deleteDescription:
        "এই লেখাটি ট্র্যাশে সরানো হবে। পরে চাইলে এটি পুনরুদ্ধার করতে পারবেন।",
      deleting: "ট্র্যাশে পাঠানো হচ্ছে...",
      deleteWriting: "ট্র্যাশে পাঠান",
    },

    profile: {
      title: "আমার প্রোফাইল",
      editProfile: "প্রোফাইল সম্পাদনা",
      myWritings: "আমার লেখা",
      writings: "লেখা",
      joined: "যোগ দিয়েছেন",
      noWritings:
        "আপনি এখনও কোনো লেখা প্রকাশ করেননি।",
      startWriting: "প্রথম লেখা লিখুন",
    },

    about: {
      eyebrow: "আমাদের পরিচয়",
      title: "SHOBDO সম্পর্কে",
      description:
        "SHOBDO বাংলা, ইংরেজি ও হিন্দি ভাষার লেখক ও পাঠকদের জন্য একটি বহুভাষিক সাহিত্যভিত্তিক ডিজিটাল প্ল্যাটফর্ম।",

      quote:
        "প্রতিটি মানুষের ভেতরেই একটি গল্প আছে—SHOBDO সেই গল্পকে পৃথিবীর কাছে পৌঁছে দেওয়ার স্থান।",

      foundationEyebrow: "আমাদের ভিত্তি",
      foundationTitle:
        "শব্দের মাধ্যমে মানুষকে যুক্ত করা",
      foundationDescription:
        "স্বাধীন প্রকাশ, অর্থবহ সংযোগ এবং ভাষার বৈচিত্র্য—এই তিনটি নীতির ওপর SHOBDO গড়ে উঠেছে।",

      missionTitle: "সৃজনশীল প্রকাশ",
      missionDescription:
        "প্রত্যেক লেখককে নিজের চিন্তা, অনুভূতি ও সৃষ্টিকে স্বাধীনভাবে প্রকাশ করার একটি সুন্দর স্থান দেওয়া।",

      communityTitle: "সাহিত্যিক সম্প্রদায়",
      communityDescription:
        "লেখক ও পাঠকদের এমন একটি প্রাণবন্ত পরিসরে যুক্ত করা, যেখানে প্রতিটি কণ্ঠ সম্মান পায়।",

      languagesTitle: "বহুভাষিক পরিচয়",
      languagesDescription:
        "বাংলা, ইংরেজি ও হিন্দি ভাষায় সাহিত্য সৃষ্টি, প্রকাশ এবং আবিষ্কারের সুযোগ তৈরি করা।",

      whyEyebrow: "কেন SHOBDO",
      whyTitle: "লেখার চেয়েও বেশি কিছু",
      whyDescription:
        "SHOBDO এমন একটি সাহিত্যিক অভিজ্ঞতা তৈরি করে, যেখানে প্রকাশ, আবিষ্কার ও আপন হয়ে ওঠা একই সঙ্গে ঘটে।",

      valueExpressionTitle:
        "স্বাধীনভাবে প্রকাশ করুন",
      valueExpressionDescription:
        "কবিতা, গল্প, অনুভূতি কিংবা প্রবন্ধ—নিজের স্বতন্ত্র কণ্ঠে আপনার কথা লিখুন।",

      valueDiscoveryTitle:
        "নতুন লেখা আবিষ্কার করুন",
      valueDiscoveryDescription:
        "বিভিন্ন ভাষা ও ধারার লেখা পড়ুন এবং নতুন প্রতিভাবান লেখকদের খুঁজে নিন।",

      valueBelongingTitle:
        "একটি সম্প্রদায়ের অংশ হন",
      valueBelongingDescription:
        "পাঠক ও লেখকদের সঙ্গে যুক্ত হয়ে সাহিত্যকেন্দ্রিক অর্থবহ সম্পর্ক গড়ে তুলুন।",

      howEyebrow: "এটি যেভাবে কাজ করে",
      howTitle: "ভাবনা থেকে পাঠকের কাছে",
      howDescription:
        "মাত্র তিনটি সহজ ধাপে আপনার লেখা SHOBDO সম্প্রদায়ের কাছে পৌঁছে দিন।",

      processWriteTitle: "লিখুন",
      processWriteDescription:
        "সম্পাদকে সরাসরি লিখুন অথবা হাতে লেখা ছবি ও PDF স্ক্যান করে লেখা তুলে নিন।",

      processPublishTitle: "প্রকাশ করুন",
      processPublishDescription:
        "ভাষা ও বিভাগ নির্বাচন করে আপনার লেখা সুন্দরভাবে প্রকাশ করুন।",

      processConnectTitle: "সংযুক্ত হন",
      processConnectDescription:
        "অন্যদের লেখা পড়ুন, পছন্দ করুন, মন্তব্য করুন এবং নতুন সাহিত্যিক সম্পর্ক গড়ুন।",

      languageEyebrow: "ভাষার দর্শন",
      languageTitle:
        "প্রতিটি ভাষা একটি স্বতন্ত্র পৃথিবী",
      languageDescription:
        "আমরা বিশ্বাস করি ভাষা শুধু যোগাযোগের মাধ্যম নয়—এটি সংস্কৃতি, স্মৃতি ও পরিচয়ের ধারক। তাই SHOBDO প্রতিটি ভাষা ও কণ্ঠকে সমান মর্যাদা দেয়।",

      finalEyebrow: "আপনার গল্প গুরুত্বপূর্ণ",
      finalTitle:
        "আপনার শব্দের যাত্রা আজই শুরু হোক",
      finalDescription:
        "আপনার মনের গল্প লিখুন, প্রকাশ করুন এবং এমন পাঠকদের কাছে পৌঁছে দিন যারা সেটি পড়তে অপেক্ষা করছেন।",

      visionTitle: "আমাদের স্বপ্ন",
      visionDescription:
        "পাঠক এবং লেখকদের একটি প্রাণবন্ত সাহিত্য সম্প্রদায়ে যুক্ত করা।",
    },

    contact: {
      eyebrow: "আমাদের সঙ্গে কথা বলুন",
      title: "যোগাযোগ",
      description:
        "প্রশ্ন, মতামত অথবা সহযোগিতার জন্য আমাদের বার্তা পাঠান।",
      name: "আপনার নাম",
      email: "ইমেইল ঠিকানা",
      subject: "বিষয়",
      message: "আপনার বার্তা",
      namePlaceholder: "আপনার নাম লিখুন",
      emailPlaceholder: "আপনার ইমেইল লিখুন",
      subjectPlaceholder:
        "বার্তার বিষয় লিখুন",
      messagePlaceholder:
        "আপনার বার্তা লিখুন…",
      send: "বার্তা পাঠান",
      sending: "পাঠানো হচ্ছে...",
      sent:
        "আপনার বার্তা সফলভাবে পাঠানো হয়েছে।",
      failed:
        "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।",
      location: "পশ্চিমবঙ্গ, ভারত",
    },

    footer: {
      description:
        "লেখক ও পাঠকদের জন্য একটি বহুভাষিক সাহিত্য সম্প্রদায়।",
      quickLinks: "দ্রুত লিংক",
      navigation: "দ্রুত লিংক",
      community: "কমিউনিটি",
      legal: "আইনি তথ্য",
      contactTitle: "যোগাযোগ",
      home: "হোম",
      explore: "অন্বেষণ",
      write: "লিখুন",
      myWritings: "আমার লেখা",
      about: "আমাদের সম্পর্কে",
      login: "লগইন",
      register: "নিবন্ধন",
      privacy: "গোপনীয়তা নীতি",
      terms: "ব্যবহারের শর্তাবলি",
      contact: "যোগাযোগ",
      email: "ইমেইল",
      location: "পশ্চিমবঙ্গ, ভারত",
      developedBy: "তৈরি করেছেন",
      madeWith: "ভালোবাসা দিয়ে তৈরি",
      forWriters: "লেখক ও পাঠকদের জন্য",
      copyright: "সর্বস্বত্ব সংরক্ষিত।",
      tagline: "তোমার শব্দ, তোমার গল্প।",
    },

    login: {
      eyebrow: "নিরাপদ প্রবেশ",
      title: "লগইন",
      description: "আপনার SHOBDO অ্যাকাউন্টে প্রবেশ করুন।",
      email: "ইমেইল",
      emailPlaceholder: "আপনার ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      passwordPlaceholder: "আপনার পাসওয়ার্ড",
      showPassword: "পাসওয়ার্ড দেখান",
      hidePassword: "পাসওয়ার্ড লুকান",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      loginButton: "লগইন করুন",
      loggingIn: "লগইন হচ্ছে...",
      noAccount: "অ্যাকাউন্ট নেই?",
      createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন",
    },

    notFound: {
      code: "404",
      title: "পাতাটি পাওয়া যায়নি",
      description:
        "আপনি যে পাতাটি খুঁজছেন সেটি নেই অথবা সরিয়ে নেওয়া হয়েছে।",
      homeButton: "হোমে ফিরে যান",
    },

    errors: {
      generic:
        "কিছু একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      network:
        "সার্ভারের সঙ্গে সংযোগ করা যাচ্ছে না।",
      unauthorized:
        "এই কাজটি করার জন্য লগইন করুন।",
      forbidden:
        "এই কাজটি করার অনুমতি আপনার নেই।",
      notFound:
        "অনুরোধ করা তথ্য পাওয়া যায়নি।",
      server:
        "সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
    },

    privacy: {
      title: "গোপনীয়তা নীতি",
      updated: "সর্বশেষ আপডেট",
      introductionTitle: "ভূমিকা",
      introduction:
        "SHOBDO আপনার ব্যক্তিগত তথ্য ও গোপনীয়তাকে সম্মান করে।",
      informationTitle:
        "আমরা যে তথ্য সংগ্রহ করি",
      information:
        "অ্যাকাউন্ট পরিচালনার জন্য নাম, ইমেইল ও প্রকাশিত লেখা সংরক্ষণ করা হতে পারে।",
      usageTitle:
        "তথ্য কীভাবে ব্যবহার করা হয়",
      usage:
        "অ্যাকাউন্ট পরিচালনা, লেখা প্রকাশ এবং প্ল্যাটফর্ম উন্নত করতে তথ্য ব্যবহার করা হয়।",
      securityTitle: "তথ্যের নিরাপত্তা",
      security:
        "আপনার তথ্য সুরক্ষিত রাখতে যুক্তিসঙ্গত ব্যবস্থা নেওয়া হয়।",
      contactTitle: "যোগাযোগ",
      contact:
        "গোপনীয়তা সম্পর্কিত প্রশ্নের জন্য আমাদের সঙ্গে যোগাযোগ করুন।",
    },

    terms: {
      title: "ব্যবহারের শর্তাবলি",
      updated: "সর্বশেষ আপডেট",
      acceptanceTitle: "শর্ত গ্রহণ",
      acceptance:
        "SHOBDO ব্যবহার করে আপনি এই শর্তাবলি মেনে নিতে সম্মত হচ্ছেন।",
      accountTitle: "অ্যাকাউন্টের দায়িত্ব",
      account:
        "আপনার অ্যাকাউন্ট ও লগইন তথ্যের নিরাপত্তার দায়িত্ব আপনার।",
      contentTitle: "প্রকাশিত লেখা",
      content:
        "নিজের প্রকাশিত লেখার মালিকানা ও দায়িত্ব লেখকের।",
      conductTitle: "গ্রহণযোগ্য আচরণ",
      conduct:
        "অপমানজনক, বেআইনি অথবা অন্যের অধিকার লঙ্ঘনকারী লেখা প্রকাশ করা যাবে না।",
    },
  },


   // =======================================================
  // ENGLISH
  // =======================================================

  en: {
    common: {
      brand: "SHOBDO",
      brandEnglish: "SHOBDO",
      loading: "Loading...",
      save: "Save",
      saved: "Saved",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      edit: "Edit",
      update: "Update",
      submit: "Submit",
      continue: "Continue",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      clear: "Clear",
      optional: "Optional",
      required: "Required",
      yes: "Yes",
      no: "No",
      all: "All",
      readMore: "Read more",
      retry: "Try again",
      language: "Language",
      category: "Category",
      title: "Title",
      content: "Writing",
      words: "words",
      characters: "characters",
      unknownAuthor: "Unknown author",
      success: "Successful",
      error: "Something went wrong",
      confirm: "Confirm",
      share: "Share",
      copied: "Copied",
      noData: "No data",
      untitled: "Untitled writing",
    },

    navbar: {
      home: "Home",
      explore: "Explore",
      write: "Write",
      myWritings: "My writings",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
      profile: "Profile",
      logout: "Logout",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      changeLanguage: "Change language",
      websiteLanguage: "Website language",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      signedInAs: "Signed in as",
    },

    writerProfile: {
      title: "Writer Profile",
      memberSince:"Member since {{date}}",
      yourProfile:"Your Profile",
      follow:"Follow",
      following:"Following",
      followers:"Followers",
      publishedWritings:"Published Writings",
      likesReceived:"Likes Received",
      comments:"Comments",
      publishedWorks:"Published Works",
      writingsBy:"Writings by {{name}}",
      writings:"writings",
      noWritings:"No published writings yet",
      noWritingsDescription:"This writer has not published any writings yet.",
      loading:"Loading writer profile...",
      notFound:"Writer not found",
      unavailable:"This writer profile is unavailable.",
      invalidId:"Invalid writer ID.",
      loadError:"Unable to load writer profile.",
      followError:"Unable to update follow status.",
      exploreWritings:"Explore writings",

    },

    home: {
      eyebrow: "A multilingual literary community",
      title: "Your words, your story.",
      heroTitle: "Your words, your story.",
      subtitle:
        "Turn your thoughts, emotions and imagination into words.",
      heroDescription:
        "Publish poetry, stories, feelings and ideas, and connect with other writers.",
      startWriting: "Start writing",
      exploreWriting: "Explore writings",
      exploreWritings: "Explore writings",
      explore: "Explore",
      categoriesTitle: "Explore categories",
      categoriesSubtitle:
        "Discover literature across different forms",
      latestTitle: "Latest writings",
      latestSubtitle:
        "Read new creations from our writers",
      viewAll: "View all writings",
      noWritings:
        "No writings have been published yet.",
      ctaTitle:
        "The story inside you is waiting",
      ctaDescription:
        "Begin with one word. Your writing may bring light to someone’s life.",
      ctaButton: "Write today",

      writerInvitation:
        "Some stories are waiting for only you to write them.",
      blankPageLabel: "A BLANK PAGE",
      blankPageTitle: "What will you write today?",
      beginStory: "Begin your story",

      quoteEyebrow: "WORDS THAT REMAIN",
      quoteTitle: "Words that moved generations.",
      quoteDescription:
        "Sometimes one sentence is enough to make someone pick up a pen.",

      promptEyebrow: "A THOUGHT FOR TODAY",
      promptTitle:
        "Write about something you never said aloud.",
      promptDescription:
        "It does not have to be perfect. It only has to be yours.",

      discoverEyebrow: "DISCOVER",
      categoriesDescription:
        "Discover literature across different forms",

      featuredEyebrow: "FROM THE COMMUNITY",

      latestEyebrow: "FRESH INK",
      latestDescription:
        "Read new creations from our writers",

      emptyTitle: "No writings yet",
      emptyDescription:
        "Be the first to bring this space to life with your writing.",

      finalEyebrow: "YOUR PAGE IS STILL BLANK",
      finalTitle:
        "Someone may be waiting to read the words only you can write.",
      finalDescription:
        "Begin with one sentence. The rest can find its way.",
      beginWriting: "Write something",
    },

    categories: {
      all: "All categories",
      poetry: "Poetry",
      story: "Story",
      feelings: "Feelings",
      reflection: "Feelings",
      essay: "Essay",
      other: "Other",
    },

    explore: {
      eyebrow: "Discover literature",
      title: "Explore",
      description:
        "Discover poetry, stories, feelings, essays and new writers.",

      searchPlaceholder:
        "Search poems, stories or writers…",
      searchButton: "Search",

      category: "Category",
      language: "Writing language",

      allCategories: "All categories",
      allLanguages: "All languages",

      latest: "Latest",
      popular: "Popular",
      oldest: "Oldest",
      titleAZ: "Title: A–Z",

      results: "writings found",
      writingsFound: "writings found",

      loading: "Loading writings...",

      loadError: "Unable to load writings",
      loadErrorDescription:
        "Unable to connect to the backend server. Check that the backend is running and try again.",

      retry: "Try again",

      noResultsTitle: "No writings found",
      noResultsDescription:
        "Try another search term or category.",

      clearFilters: "Clear filters",
      loadMore: "Load more",

      allWritings:"All Writings",
      following:"Following",
      followingDescription:
        "Recent published writings from authors you follow.",
      followingWritings:
        "writings from followed authors",

      noFollowing:
        "Your following feed is empty",

      noFollowingDescription:
        "Follow writers and their published writings will appear here.",
      signInFollowingTitle:"Sign in required",

      signInFollowing:
        "Sign in to your account to see writings from authors you follow.",
      noResults: "No writings found",

      noResultsDescription:"Try another search term, category or filter.",
      clearFilters:"Clear filters",
    },

    writingCard: {
      read: "Read writing",
      readMore: "Read more",
      like: "Like",
      unlike: "Remove like",
      likes: "likes",
      comment: "comment",
      comments: "comments",
      by: "By",
      unknownAuthor: "Unknown author",
      untitled: "Untitled writing",
      previewUnavailable: "Preview unavailable",
      minutes: "min read",
      words: "words",
    },

    write: {
      eyebrow: "Your creative space",
      title: "Create something new",
      subtitle:
        "Turn your thoughts into words. Write manually or scan a handwritten page or PDF.",

      languageStep: "01",
      languageTitle: "Writing language",
      languageDescription:
        "OCR will recognize text using this language.",
      languageNote:
        "The website can change language. Your writing does not have to.",

      bengali: "বাংলা",
      english: "English",
      hindi: "हिन्दी",

      scanStep: "02",
      scanTitle: "Scan your writing",
      scanOptional: "Optional",
      scanDescription:
        "Select a clear handwritten image or PDF. The extracted text will be inserted into the editor.",
      dropTitle: "Drop your file here",
      dropSubtitle:
        "or select it from your device",
      selectFile: "Select file",
      supportedFiles:
        "PDF, JPG or PNG • Maximum 10 MB",
      selectedFile: "Selected file",
      removeFile: "Remove selected file",
      ocrLabel: "OCR",
      extractButton: "Scan and extract text",
      extracting: "Recognizing text...",
      extractionSuccess:
        "Text extracted successfully. Review and edit it before publishing.",
      extractionFailed:
        "Unable to scan the writing. Please try again.",
      noTextFound:
        "No readable text was found. Try a clearer image or PDF.",
      chooseFileFirst:
        "Select a PDF, JPG or PNG file first.",
      invalidFile:
        "Only PDF, JPG, JPEG and PNG files are supported.",
      fileTooLarge:
        "File size cannot exceed 10 MB.",
      emptyFile: "The selected file is empty.",
      damagedImage:
        "The selected image is damaged or unreadable.",
      damagedPdf:
        "The selected PDF is damaged or unreadable.",
      tesseractMissing:
        "Tesseract OCR is not installed or unavailable in Windows PATH.",
      languageDataMissing:
        "OCR language data is missing. Check eng, ben and hin traineddata.",
      serverUnavailable:
        "Unable to connect to the backend server.",
      ocrLanguageUnsupported:
        "OCR scanning isn't available yet for this language. Try Bengali, English or Hindi, or type your writing directly.",
      ocrLanguageNote:
        "Scanning (OCR) currently supports Bengali, English and Hindi only — you can still type your writing directly in this language.",

      editorStep: "03",
      editorTitle: "Edit your writing",
      titleLabel: "Title",
      titlePlaceholder:
        "Give your writing a meaningful title",
      titleHelp:
        "Choose a title that invites readers in.",
      categoryLabel: "Category",
      languageLabel: "Writing language",
      contentLabel: "Your writing",
      contentPlaceholder:
        "Start writing here...",
      editorHelp:
        "Correct any OCR mistakes before publishing.",
      wordCount: "words",
      characterCount: "characters",

      saveDraft: "Save draft",
      draftSaved:
        "Draft saved on this device.",
      draftEmpty:
        "Write a title or some content before saving a draft.",
      publish: "Publish writing",
      publishing: "Publishing...",
      published:
        "Your writing was published successfully.",
      publishedSuccess:
        "Your writing was published successfully.",

      loginRequired:
        "Please log in before publishing.",
      titleRequired: "Please enter a title.",
      contentRequired:
        "Write something or scan a document first.",
      titleTooLong:
        "The title cannot exceed 200 characters.",
      publishFailed:
        "Unable to publish the writing. Please try again.",
    },

    writingDetails: {
      loading: "Loading writing...",
      notFound: "Writing not found",
      notFoundDescription:
        "The writing may have been removed or the address is incorrect.",
      unavailable:
        "This writing isn't available right now.",
      retry: "Try again",
      backToExplore: "Back to Explore",
      back: "Back",
      writtenBy: "Written by",
      by: "Written by",
      publishedOn: "Published",
      readingTime: "minute read",
      words: "words",
      like: "Like",
      liked: "Liked",
      likeError:
        "Unable to update your like. Please try again.",
      comments: "Comments",
      share: "Share",
      originalLanguage: "Original language",
      moreWritings: "See more writings",
      edit: "Edit",
      delete: "Delete",
      deleteTitle: "Delete this writing?",
      deleteDescription:
        "This action cannot be undone.",
      deleteConfirm: "Yes, delete it",
      deleting: "Deleting...",
      deleteSuccess:
        "Writing deleted successfully.",
      deleteFailed:
        "Unable to delete the writing.",
      copyLink: "Copy link",
      linkCopied: "Link copied.",

      commentSection: {
        community: "COMMUNITY VOICES",
        title: "Comments",
        placeholder:
          "Share your thoughts about this writing…",
        posting: "Posting…",
        post: "Post comment",
        loading: "Loading comments…",
        loadError: "Unable to load comments.",
        emptyTitle: "No comments yet",
        emptyDescription:
          "Be the first to share your thoughts and start the conversation.",
        unknownUser: "Unknown user",
        delete: "Delete comment",
        tooLong:
          "Comment cannot exceed 2000 characters.",
        addError:
          "Unable to add the comment. Please try again.",
        deleteConfirm:
          "Are you sure you want to delete this comment?",
        deleteError:
          "Unable to delete the comment. Please try again.",
      },
    },

    comments: {
      title: "Comments",
      singular: "comment",
      plural: "comments",
      placeholder:
        "Share your thoughts about this writing…",
      submit: "Post comment",
      submitting: "Posting...",
      loginRequired:
        "Please log in to comment.",
      empty:
        "No comments yet. Be the first to respond.",
      emptyComment:
        "Comment cannot be empty.",
      added:
        "Comment added successfully.",
      addFailed:
        "Unable to add the comment.",
      delete: "Delete comment",
      deleting: "Deleting...",
      deleteConfirm:
        "Do you want to delete this comment?",
      deleteFailed:
        "Unable to delete the comment.",
      unknownUser: "Unknown user",
    },

    auth: {
      loginTitle: "Welcome back",
      loginSubtitle:
        "Log in to your SHOBDO account",
      registerTitle: "Join SHOBDO",
      registerSubtitle:
        "Create an account to publish your writing",
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "Your email address",
      password: "Password",
      passwordPlaceholder: "Your password",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder:
        "Enter your password again",
      login: "Login",
      loggingIn: "Logging in...",
      register: "Create account",
      registering: "Creating account...",
      noAccount: "Do not have an account?",
      haveAccount:
        "Already have an account?",
      createAccount: "Create a new account",
      goToLogin: "Login",
      logout: "Logout",
      loginSuccess:
        "Logged in successfully.",
      registerSuccess:
        "Account created successfully.",
      passwordMismatch:
        "The passwords do not match.",
      invalidCredentials:
        "The email or password is incorrect.",
      emailExists:
        "An account already exists with this email.",
      loginRequired:
        "Please log in to continue.",
    },

    myWritings: {
      eyebrow: "Your creative collection",
      title: "My writings",
      description:
        "Manage your drafts and published writings in one place.",
      newWriting: "New writing",
      drafts: "Drafts",
      published: "Published",
      trash: "Trash",
      restore: "Restore",
      restored: "Writing restored successfully.",
      deletePermanently: "Delete Permanently",
      permanentlyDeleted: "Writing permanently deleted.",
      noTrash: "Trash is empty",
      noTrashDescription: "There are no writings in Trash.",
      movedToTrash: "Writing moved to Trash.",
      searchDrafts: "Search drafts…",
      searchPublished:
        "Search published writings…",
      allLanguages: "All languages",
      recentlyUpdated: "Recently updated",
      recentlyCreated: "Recently created",
      oldestFirst: "Oldest first",
      titleAZ: "Title: A–Z",
      refresh: "Refresh",
      clearFilters: "Clear filters",
      loading: "Loading your writings…",
      noResults: "No writings found",
      noDrafts: "No drafts yet",
      noPublished:
        "No published writings yet",
      noResultsDescription:
        "Try another search term or filter.",
      noDraftsDescription:
        "Start your first writing and save it as a draft.",
      noPublishedDescription:
        "Your published writings will appear here.",
      startWriting: "Start writing",
      words: "words",
      readTime: "min read",
      updated: "Updated",
      edit: "Edit",
      view: "View",
      publish: "Publish",
      moveToDraft:
        "The writing was moved to drafts.",
      delete: "Delete",
      deleteEyebrow: "Move to Trash",
      deleteTitle: "Move this writing to Trash?",
      deleteDescription:
        "This writing will be moved to Trash. You can restore it later.",
      deleting: "Moving to Trash...",
      deleteWriting: "Move to Trash",
    },

    profile: {
      title: "My profile",
      editProfile: "Edit profile",
      myWritings: "My writings",
      writings: "writings",
      joined: "Joined",
      noWritings:
        "You have not published anything yet.",
      startWriting: "Write your first piece",
    },

    about: {
      eyebrow: "Who we are",
      title: "About SHOBDO",
      description:
        "SHOBDO is a multilingual literary platform created for Bengali, English and Hindi writers and readers.",

      quote:
        "There is a story within every person—SHOBDO is where that story finds its way into the world.",

      foundationEyebrow: "Our foundation",
      foundationTitle:
        "Connecting people through words",
      foundationDescription:
        "SHOBDO is built on three principles: creative freedom, meaningful connection and linguistic diversity.",

      missionTitle: "Creative expression",
      missionDescription:
        "To give every writer a beautiful space to express thoughts, emotions and creativity.",

      communityTitle: "Literary community",
      communityDescription:
        "To bring writers and readers together in a vibrant space where every voice is respected.",

      languagesTitle: "Multilingual identity",
      languagesDescription:
        "To make it easy to create, publish and discover literature in Bengali, English and Hindi.",

      whyEyebrow: "Why SHOBDO",
      whyTitle: "More than a place to write",
      whyDescription:
        "SHOBDO creates a literary experience where expression, discovery and belonging come together.",

      valueExpressionTitle:
        "Express yourself freely",
      valueExpressionDescription:
        "Share poetry, stories, feelings or essays in a voice that is unmistakably yours.",

      valueDiscoveryTitle:
        "Discover new writing",
      valueDiscoveryDescription:
        "Explore writing across languages and genres, and discover emerging literary voices.",

      valueBelongingTitle:
        "Find your community",
      valueBelongingDescription:
        "Connect with readers and writers to build meaningful relationships around literature.",

      howEyebrow: "How it works",
      howTitle: "From an idea to a reader",
      howDescription:
        "Bring your writing to the SHOBDO community in three simple steps.",

      processWriteTitle: "Write",
      processWriteDescription:
        "Write directly in the editor, or scan a handwritten image or PDF to extract its text.",

      processPublishTitle: "Publish",
      processPublishDescription:
        "Choose a language and category, then present your writing beautifully to the community.",

      processConnectTitle: "Connect",
      processConnectDescription:
        "Read, like and discuss other works while building new literary connections.",

      languageEyebrow:
        "Our language philosophy",
      languageTitle:
        "Every language holds a unique world",
      languageDescription:
        "We believe language is more than communication—it carries culture, memory and identity. SHOBDO therefore gives every language and every voice equal respect.",

      finalEyebrow: "Your story matters",
      finalTitle:
        "Let your journey with words begin today",
      finalDescription:
        "Write what is in your heart, publish it and reach the readers who are waiting to discover it.",

      visionTitle: "Our vision",
      visionDescription:
        "To connect readers and writers through a vibrant literary community.",
    },

    contact: {
      eyebrow: "Talk to us",
      title: "Contact",
      description:
        "Send us a message for questions, feedback or collaboration.",
      name: "Your name",
      email: "Email address",
      subject: "Subject",
      message: "Your message",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "Enter your email",
      subjectPlaceholder: "Enter the subject",
      messagePlaceholder:
        "Write your message…",
      send: "Send message",
      sending: "Sending...",
      sent:
        "Your message was sent successfully.",
      failed:
        "Unable to send the message. Please try again.",
      location: "West Bengal, India",
    },

    footer: {
      description:
        "A multilingual literary community for writers and readers.",
      quickLinks: "Quick links",
      navigation: "Quick links",
      community: "Community",
      legal: "Legal",
      contactTitle: "Contact",
      home: "Home",
      explore: "Explore",
      write: "Write",
      myWritings: "My writings",
      about: "About",
      login: "Login",
      register: "Register",
      privacy: "Privacy policy",
      terms: "Terms of use",
      contact: "Contact",
      email: "Email",
      location: "West Bengal, India",
      developedBy: "Developed by",
      madeWith: "Made with love",
      forWriters: "for writers and readers",
      copyright: "All rights reserved.",
      tagline: "Your words, your story.",
    },

    login: {
      eyebrow: "Secure sign in",
      title: "Login",
      description: "Log in to your SHOBDO account.",
      email: "Email",
      emailPlaceholder: "Your email address",
      password: "Password",
      passwordPlaceholder: "Your password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      forgotPassword: "Forgot password?",
      loginButton: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      createAccount: "Create a new account",
    },

    notFound: {
      code: "404",
      title: "Page not found",
      description:
        "The page you are looking for does not exist or has been moved.",
      homeButton: "Return home",
    },

    errors: {
      generic:
        "Something went wrong. Please try again.",
      network:
        "Unable to connect to the server.",
      unauthorized:
        "Please log in to perform this action.",
      forbidden:
        "You do not have permission to perform this action.",
      notFound:
        "The requested information was not found.",
      server:
        "The server encountered a problem. Try again later.",
    },

    privacy: {
      title: "Privacy policy",
      updated: "Last updated",
      introductionTitle: "Introduction",
      introduction:
        "SHOBDO respects your personal information and privacy.",
      informationTitle:
        "Information we collect",
      information:
        "We may store your name, email and published writings to operate your account.",
      usageTitle: "How information is used",
      usage:
        "Information is used to manage your account, publish writing and improve the platform.",
      securityTitle: "Information security",
      security:
        "Reasonable technical measures are used to protect your information.",
      contactTitle: "Contact",
      contact:
        "Contact us with questions about this privacy policy.",
    },

    terms: {
      title: "Terms of use",
      updated: "Last updated",
      acceptanceTitle: "Acceptance",
      acceptance:
        "By using SHOBDO, you agree to these terms.",
      accountTitle: "Account responsibility",
      account:
        "You are responsible for your account and login information.",
      contentTitle: "Published content",
      content:
        "Writers retain ownership and responsibility for their published work.",
      conductTitle: "Acceptable conduct",
      conduct:
        "Do not publish illegal, abusive or rights-infringing content.",
    },
  },


    // =======================================================
  // HINDI
  // =======================================================

  hi: {
    common: {
      brand: "शब्द",
      brandEnglish: "SHOBDO",
      loading: "लोड हो रहा है...",
      save: "सहेजें",
      saved: "सहेजा गया",
      cancel: "रद्द करें",
      close: "बंद करें",
      delete: "हटाएँ",
      edit: "संपादित करें",
      update: "अपडेट करें",
      submit: "जमा करें",
      continue: "जारी रखें",
      back: "वापस",
      next: "अगला",
      previous: "पिछला",
      search: "खोजें",
      clear: "साफ़ करें",
      optional: "वैकल्पिक",
      required: "आवश्यक",
      yes: "हाँ",
      no: "नहीं",
      all: "सभी",
      readMore: "और पढ़ें",
      retry: "फिर प्रयास करें",
      language: "भाषा",
      category: "श्रेणी",
      title: "शीर्षक",
      content: "लेखन",
      words: "शब्द",
      characters: "अक्षर",
      unknownAuthor: "अज्ञात लेखक",
      success: "सफल",
      error: "समस्या हुई",
      confirm: "पुष्टि करें",
      share: "साझा करें",
      copied: "कॉपी किया गया",
      noData: "जानकारी उपलब्ध नहीं",
      untitled: "बिना शीर्षक की रचना",
    },

    navbar: {
      home: "होम",
      explore: "खोजें",
      write: "लिखें",
      myWritings: "मेरी रचनाएँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "पंजीकरण",
      profile: "प्रोफ़ाइल",
      logout: "लॉगआउट",
      openMenu: "मेनू खोलें",
      closeMenu: "मेनू बंद करें",
      changeLanguage: "भाषा बदलें",
      websiteLanguage: "वेबसाइट की भाषा",
      lightMode: "लाइट मोड",
      darkMode: "डार्क मोड",
      signedInAs: "साइन इन किया गया",
    },

    writerProfile: {

      title: "लेखक परिचय",
      memberSince:"{{date}} से सदस्य",
      yourProfile:"आपकी प्रोफ़ाइल",
      follow:"फ़ॉलो करें",
      following:"फ़ॉलो कर रहे हैं",
      followers:"फ़ॉलोअर्स",
      publishedWritings:"प्रकाशित रचनाएँ",
      likesReceived:"प्राप्त पसंद",
      comments:"टिप्पणियाँ",
      publishedWorks:"प्रकाशित रचनाएँ",
      writingsBy:"{{name}} की रचनाएँ",
      writings:"रचनाएँ",
      noWritings:"अभी तक कोई प्रकाशित रचना नहीं",
      noWritingsDescription:"इस लेखक ने अभी तक कोई रचना प्रकाशित नहीं की है।",
      loading:"लेखक की प्रोफ़ाइल लोड हो रही है...",
      notFound:"लेखक नहीं मिला",
      unavailable:"यह लेखक प्रोफ़ाइल उपलब्ध नहीं है।",
      invalidId:"अमान्य लेखक आईडी।",
      loadError:"लेखक प्रोफ़ाइल लोड नहीं की जा सकी।",
      followError:"फ़ॉलो स्थिति अपडेट नहीं की जा सकी।",
      exploreWritings:"रचनाएँ देखें",
    },

    home: {
      eyebrow: "बहुभाषी साहित्यिक समुदाय",
      title: "आपके शब्द, आपकी कहानी।",
      heroTitle: "आपके शब्द, आपकी कहानी।",
      subtitle:
        "अपने विचारों, भावनाओं और कल्पना को शब्द दें।",
      heroDescription:
        "कविता, कहानी, भावनाओं और विचारों को प्रकाशित करें और दूसरे लेखकों से जुड़ें।",
      startWriting: "लिखना शुरू करें",
      exploreWriting: "रचनाएँ पढ़ें",
      exploreWritings: "रचनाएँ पढ़ें",
      explore: "खोजें",
      categoriesTitle: "श्रेणियाँ खोजें",
      categoriesSubtitle:
        "विभिन्न साहित्यिक विधाओं को पढ़ें",
      latestTitle: "नई रचनाएँ",
      latestSubtitle:
        "हमारे लेखकों की नई रचनाएँ पढ़ें",
      viewAll: "सभी रचनाएँ देखें",
      noWritings:
        "अभी तक कोई रचना प्रकाशित नहीं हुई है।",
      ctaTitle:
        "आपके भीतर की कहानी प्रतीक्षा कर रही है",
      ctaDescription:
        "एक शब्द से शुरुआत करें। आपकी रचना किसी के जीवन में रोशनी ला सकती है।",
      ctaButton: "आज लिखें",

      writerInvitation:
        "कुछ कहानियाँ केवल आपके लिखने की प्रतीक्षा कर रही हैं।",
      blankPageLabel: "एक खाली पन्ना",
      blankPageTitle: "आज आप क्या लिखेंगे?",
      beginStory: "अपनी कहानी शुरू करें",

      quoteEyebrow: "वे शब्द जो रह जाते हैं",
      quoteTitle: "ऐसे शब्द जिन्होंने पीढ़ियों को छुआ।",
      quoteDescription:
        "कभी-कभी एक वाक्य ही किसी को कलम उठाने के लिए काफी होता है।",

      promptEyebrow: "आज का विचार",
      promptTitle:
        "ऐसा कुछ लिखें जो आपने कभी ज़ोर से नहीं कहा।",
      promptDescription:
        "यह सही होना ज़रूरी नहीं है। बस आपका होना चाहिए।",

      discoverEyebrow: "खोजें",
      categoriesDescription:
        "विभिन्न साहित्यिक विधाओं को पढ़ें",

      featuredEyebrow: "समुदाय से",

      latestEyebrow: "नई स्याही",
      latestDescription:
        "हमारे लेखकों की नई रचनाएँ पढ़ें",

      emptyTitle: "अभी तक कोई रचना नहीं",
      emptyDescription:
        "अपनी रचना से इस जगह को जीवंत बनाने वाले पहले व्यक्ति बनें।",

      finalEyebrow: "आपका पन्ना अभी भी खाली है",
      finalTitle:
        "शायद कोई सिर्फ़ आपकी लिखी हुई बात पढ़ने का इंतज़ार कर रहा है।",
      finalDescription:
        "एक वाक्य से शुरुआत करें। बाकी रास्ता खुद बन जाएगा।",
      beginWriting: "कुछ लिखें",
    },

    categories: {
      all: "सभी श्रेणियाँ",
      poetry: "कविता",
      story: "कहानी",
      feelings: "भावनाएँ",
      reflection: "भावनाएँ",
      essay: "निबंध",
      other: "अन्य",
    },

    explore: {
      eyebrow: "साहित्य खोजें",
      title: "खोजें",
      description:
        "कविता, कहानी, भावनाएँ, निबंध और नए लेखक खोजें।",

      searchPlaceholder:
        "कविता, कहानी या लेखक खोजें…",
      searchButton: "खोजें",

      category: "श्रेणी",
      language: "लेखन की भाषा",

      allCategories: "सभी श्रेणियाँ",
      allLanguages: "सभी भाषाएँ",

      latest: "नवीनतम",
      popular: "लोकप्रिय",
      oldest: "पुरानी",
      titleAZ: "शीर्षक: अ–ह",

      results: "रचनाएँ मिलीं",
      writingsFound: "रचनाएँ मिलीं",

      loading: "रचनाएँ लोड हो रही हैं...",

      loadError: "रचनाएँ लोड नहीं हो सकीं",
      loadErrorDescription:
        "Backend server से संपर्क नहीं हो सका। जाँचें कि Backend चल रहा है और फिर प्रयास करें।",

      retry: "फिर प्रयास करें",

      noResultsTitle: "कोई रचना नहीं मिली",
      noResultsDescription:
        "दूसरे शब्द या श्रेणी के साथ प्रयास करें।",

      clearFilters: "फ़िल्टर हटाएँ",
      loadMore: "और देखें",
      allWritings:"सभी रचनाएँ",
      following:"फ़ॉलोइंग",
      followingDescription:
        "आप जिन लेखकों को फ़ॉलो करते हैं उनकी नवीनतम प्रकाशित रचनाएँ।",
      followingWritings:
        "फ़ॉलो किए गए लेखकों की रचनाएँ",
      noFollowing:
        "फ़ॉलोइंग फ़ीड खाली है",
      noFollowingDescription:
        "लेखकों को फ़ॉलो करें और उनकी प्रकाशित रचनाएँ यहाँ दिखाई देंगी।",
      signInFollowingTitle:"साइन इन आवश्यक है",
      signInFollowing:
        "फ़ॉलो किए गए लेखकों की रचनाएँ देखने के लिए अपने अकाउंट में साइन इन करें।",
      noResults: "कोई रचना नहीं मिली",
      noResultsDescription:"किसी अन्य खोज शब्द, श्रेणी या फ़िल्टर के साथ फिर से प्रयास करें।",
      clearFilters:"फ़िल्टर साफ़ करें",
    },

    writingCard: {
      read: "रचना पढ़ें",
      readMore: "और पढ़ें",
      like: "पसंद करें",
      unlike: "पसंद हटाएँ",
      likes: "पसंद",
      comment: "टिप्पणी",
      comments: "टिप्पणियाँ",
      by: "लेखक",
      unknownAuthor: "अज्ञात लेखक",
      untitled: "बिना शीर्षक की रचना",
      previewUnavailable: "पूर्वावलोकन उपलब्ध नहीं",
      minutes: "मिनट पढ़ने का समय",
      words: "शब्द",
    },

    write: {
      eyebrow: "आपका रचनात्मक स्थान",
      title: "कुछ नया लिखें",
      subtitle:
        "अपने विचारों को शब्द दें। स्वयं लिखें या हस्तलिखित पृष्ठ अथवा PDF स्कैन करें।",

      languageStep: "01",
      languageTitle: "लेखन की भाषा",
      languageDescription:
        "OCR इसी भाषा के अनुसार टेक्स्ट पहचानेगा।",
      languageNote:
        "वेबसाइट की भाषा बदल सकती है। आपकी रचना की भाषा नहीं बदलेगी।",

      bengali: "বাংলা",
      english: "English",
      hindi: "हिन्दी",

      scanStep: "02",
      scanTitle: "रचना स्कैन करें",
      scanOptional: "वैकल्पिक",
      scanDescription:
        "साफ़ हस्तलिखित चित्र या PDF चुनें। निकाला गया टेक्स्ट संपादक में जोड़ दिया जाएगा।",
      dropTitle: "फ़ाइल यहाँ छोड़ें",
      dropSubtitle:
        "या अपने डिवाइस से चुनें",
      selectFile: "फ़ाइल चुनें",
      supportedFiles:
        "PDF, JPG या PNG • अधिकतम 10 MB",
      selectedFile: "चुनी हुई फ़ाइल",
      removeFile: "चुनी हुई फ़ाइल हटाएँ",
      ocrLabel: "OCR",
      extractButton:
        "स्कैन करके टेक्स्ट निकालें",
      extracting:
        "टेक्स्ट पहचाना जा रहा है...",
      extractionSuccess:
        "टेक्स्ट सफलतापूर्वक निकाला गया। प्रकाशित करने से पहले संपादित करें।",
      extractionFailed:
        "रचना स्कैन नहीं हो सकी। फिर प्रयास करें।",
      noTextFound:
        "फ़ाइल में पढ़ने योग्य टेक्स्ट नहीं मिला। अधिक साफ़ चित्र या PDF चुनें।",
      chooseFileFirst:
        "पहले PDF, JPG या PNG फ़ाइल चुनें।",
      invalidFile:
        "केवल PDF, JPG, JPEG और PNG फ़ाइल समर्थित हैं।",
      fileTooLarge:
        "फ़ाइल का आकार 10 MB से अधिक नहीं हो सकता।",
      emptyFile: "चुनी हुई फ़ाइल खाली है।",
      damagedImage:
        "चुना हुआ चित्र खराब है या पढ़ा नहीं जा सकता।",
      damagedPdf:
        "चुनी हुई PDF खराब है या पढ़ी नहीं जा सकती।",
      tesseractMissing:
        "Tesseract OCR इंस्टॉल नहीं है या Windows PATH में उपलब्ध नहीं है।",
      languageDataMissing:
        "OCR भाषा डेटा नहीं मिला। eng, ben और hin traineddata जाँचें।",
      serverUnavailable:
        "Backend server से संपर्क नहीं हो सका।",
      ocrLanguageUnsupported:
        "इस भाषा के लिए अभी स्कैन (OCR) सुविधा उपलब्ध नहीं है। बांग्ला, अंग्रेज़ी या हिन्दी आज़माएँ, या सीधे टाइप करें।",
      ocrLanguageNote:
        "स्कैन (OCR) सुविधा फिलहाल केवल बांग्ला, अंग्रेज़ी और हिन्दी में उपलब्ध है — आप चाहें तो इस भाषा में सीधे टाइप कर सकते हैं।",

      editorStep: "03",
      editorTitle: "रचना संपादित करें",
      titleLabel: "शीर्षक",
      titlePlaceholder:
        "अपनी रचना को एक सुंदर शीर्षक दें",
      titleHelp:
        "ऐसा शीर्षक लिखें जो पाठकों को आकर्षित करे।",
      categoryLabel: "श्रेणी",
      languageLabel: "लेखन की भाषा",
      contentLabel: "आपकी रचना",
      contentPlaceholder:
        "यहाँ लिखना शुरू करें...",
      editorHelp:
        "प्रकाशित करने से पहले OCR की गलतियाँ सुधारें।",
      wordCount: "शब्द",
      characterCount: "अक्षर",

      saveDraft: "ड्राफ्ट सहेजें",
      draftSaved:
        "ड्राफ्ट इस डिवाइस पर सहेजा गया।",
      draftEmpty:
        "ड्राफ्ट सहेजने से पहले शीर्षक या कुछ सामग्री लिखें।",
      publish: "रचना प्रकाशित करें",
      publishing: "प्रकाशित हो रहा है...",
      published:
        "आपकी रचना सफलतापूर्वक प्रकाशित हुई।",
      publishedSuccess:
        "आपकी रचना सफलतापूर्वक प्रकाशित हुई।",

      loginRequired:
        "प्रकाशित करने से पहले लॉगिन करें।",
      titleRequired:
        "रचना का शीर्षक लिखें।",
      contentRequired:
        "कुछ लिखें या कोई दस्तावेज़ स्कैन करें।",
      titleTooLong:
        "शीर्षक 200 अक्षरों से अधिक नहीं हो सकता।",
      publishFailed:
        "रचना प्रकाशित नहीं हो सकी। फिर प्रयास करें।",
    },

    writingDetails: {
      loading: "रचना लोड हो रही है...",
      notFound: "रचना नहीं मिली",
      notFoundDescription:
        "रचना हटाई गई है या पता सही नहीं है।",
      unavailable:
        "यह रचना अभी उपलब्ध नहीं है।",
      retry: "फिर प्रयास करें",
      backToExplore: "खोज पर वापस जाएँ",
      back: "वापस",
      writtenBy: "लेखक",
      by: "लेखक",
      publishedOn: "प्रकाशित",
      readingTime: "मिनट का पठन",
      words: "शब्द",
      like: "पसंद करें",
      liked: "पसंद किया",
      likeError:
        "पसंद अपडेट नहीं हो सकी। फिर प्रयास करें।",
      comments: "टिप्पणियाँ",
      share: "साझा करें",
      originalLanguage: "मूल भाषा",
      moreWritings: "और रचनाएँ देखें",
      edit: "संपादित करें",
      delete: "हटाएँ",
      deleteTitle: "यह रचना हटाएँ?",
      deleteDescription:
        "इस कार्रवाई को वापस नहीं लिया जा सकता।",
      deleteConfirm: "हाँ, हटाएँ",
      deleting: "हटाया जा रहा है...",
      deleteSuccess:
        "रचना सफलतापूर्वक हटा दी गई।",
      deleteFailed:
        "रचना हटाई नहीं जा सकी।",
      copyLink: "लिंक कॉपी करें",
      linkCopied: "लिंक कॉपी किया गया।",

      commentSection: {
        community: "समुदाय की राय",
        title: "टिप्पणियाँ",
        placeholder:
          "इस रचना के बारे में अपनी राय लिखें…",
        posting: "भेजा जा रहा है…",
        post: "टिप्पणी करें",
        loading: "टिप्पणियाँ लोड हो रही हैं…",
        loadError: "टिप्पणियाँ लोड नहीं हो सकीं।",
        emptyTitle: "अभी कोई टिप्पणी नहीं है",
        emptyDescription:
          "पहली टिप्पणी करें और बातचीत शुरू करें।",
        unknownUser: "अज्ञात उपयोगकर्ता",
        delete: "टिप्पणी हटाएँ",
        tooLong:
          "टिप्पणी 2000 अक्षरों से अधिक नहीं हो सकती।",
        addError:
          "टिप्पणी जोड़ी नहीं जा सकी। फिर प्रयास करें।",
        deleteConfirm:
          "क्या आप वाकई यह टिप्पणी हटाना चाहते हैं?",
        deleteError:
          "टिप्पणी हटाई नहीं जा सकी। फिर प्रयास करें।",
      },
    },

    comments: {
      title: "टिप्पणियाँ",
      singular: "टिप्पणी",
      plural: "टिप्पणियाँ",
      placeholder:
        "इस रचना के बारे में अपनी राय लिखें…",
      submit: "टिप्पणी करें",
      submitting: "भेजा जा रहा है...",
      loginRequired:
        "टिप्पणी करने के लिए लॉगिन करें।",
      empty:
        "अभी कोई टिप्पणी नहीं है। पहली टिप्पणी करें।",
      emptyComment:
        "टिप्पणी खाली नहीं हो सकती।",
      added:
        "टिप्पणी सफलतापूर्वक जोड़ी गई।",
      addFailed:
        "टिप्पणी जोड़ी नहीं जा सकी।",
      delete: "टिप्पणी हटाएँ",
      deleting: "हटाया जा रहा है...",
      deleteConfirm:
        "क्या आप यह टिप्पणी हटाना चाहते हैं?",
      deleteFailed:
        "टिप्पणी हटाई नहीं जा सकी।",
      unknownUser: "अज्ञात उपयोगकर्ता",
    },

    auth: {
      loginTitle: "वापसी पर स्वागत है",
      loginSubtitle:
        "अपने SHOBDO खाते में लॉगिन करें",
      registerTitle: "SHOBDO से जुड़ें",
      registerSubtitle:
        "अपनी रचना प्रकाशित करने के लिए खाता बनाएँ",
      name: "नाम",
      namePlaceholder: "आपका पूरा नाम",
      email: "ईमेल",
      emailPlaceholder: "आपका ईमेल पता",
      password: "पासवर्ड",
      passwordPlaceholder: "आपका पासवर्ड",
      confirmPassword:
        "पासवर्ड की पुष्टि करें",
      confirmPasswordPlaceholder:
        "पासवर्ड दोबारा लिखें",
      login: "लॉगिन",
      loggingIn: "लॉगिन हो रहा है...",
      register: "खाता बनाएँ",
      registering:
        "खाता बनाया जा रहा है...",
      noAccount: "अभी खाता नहीं है?",
      haveAccount: "पहले से खाता है?",
      createAccount: "नया खाता बनाएँ",
      goToLogin: "लॉगिन करें",
      logout: "लॉगआउट",
      loginSuccess:
        "सफलतापूर्वक लॉगिन हुआ।",
      registerSuccess:
        "खाता सफलतापूर्वक बनाया गया।",
      passwordMismatch:
        "दोनों पासवर्ड मेल नहीं खाते।",
      invalidCredentials:
        "ईमेल या पासवर्ड सही नहीं है।",
      emailExists:
        "इस ईमेल से पहले ही खाता मौजूद है।",
      loginRequired:
        "जारी रखने के लिए लॉगिन करें।",
    },

    myWritings: {
      eyebrow: "आपकी रचनाओं का संग्रह",
      title: "मेरी रचनाएँ",
      description:
        "अपने ड्राफ्ट और प्रकाशित रचनाओं को एक ही जगह सँभालें।",
      newWriting: "नई रचना",
      drafts: "ड्राफ्ट",
      published: "प्रकाशित",
      trash: "ट्रैश",
      restore: "पुनर्स्थापित करें",
      restored: "लेखन सफलतापूर्वक पुनर्स्थापित किया गया।",
      deletePermanently: "स्थायी रूप से हटाएँ",
      permanentlyDeleted: "लेखन स्थायी रूप से हटा दिया गया।",
      noTrash: "ट्रैश खाली है",
      noTrashDescription: "ट्रैश में कोई लेखन नहीं है।",
      movedToTrash: "लेखन को ट्रैश में भेज दिया गया है।",
      searchDrafts: "ड्राफ्ट खोजें…",
      searchPublished:
        "प्रकाशित रचनाएँ खोजें…",
      allLanguages: "सभी भाषाएँ",
      recentlyUpdated:
        "हाल में अपडेट की गई",
      recentlyCreated:
        "हाल में बनाई गई",
      oldestFirst: "सबसे पुरानी पहले",
      titleAZ: "शीर्षक: अ–ह",
      refresh: "रिफ्रेश करें",
      clearFilters: "फ़िल्टर हटाएँ",
      loading:
        "आपकी रचनाएँ लोड हो रही हैं…",
      noResults: "कोई रचना नहीं मिली",
      noDrafts: "अभी कोई ड्राफ्ट नहीं है",
      noPublished:
        "अभी कोई प्रकाशित रचना नहीं है",
      noResultsDescription:
        "दूसरे शब्द या फ़िल्टर से फिर प्रयास करें।",
      noDraftsDescription:
        "अपनी पहली रचना लिखें और उसे ड्राफ्ट के रूप में सहेजें।",
      noPublishedDescription:
        "आपकी प्रकाशित रचनाएँ यहाँ दिखाई देंगी।",
      startWriting: "लिखना शुरू करें",
      words: "शब्द",
      readTime: "मिनट का पठन",
      updated: "अपडेट",
      edit: "संपादित करें",
      view: "देखें",
      publish: "प्रकाशित करें",
      moveToDraft:
        "रचना को ड्राफ्ट में भेज दिया गया है।",
      delete: "हटाएँ",
      deleteEyebrow: "ट्रैश में भेजें",
      deleteTitle: "इस लेखन को ट्रैश में भेजें?",
      deleteDescription:
        "यह लेखन ट्रैश में भेज दिया जाएगा। आप इसे बाद में पुनर्स्थापित कर सकते हैं।",
      deleting: "ट्रैश में भेजा जा रहा है...",
      deleteWriting: "ट्रैश में भेजें",
    },

    profile: {
      title: "मेरी प्रोफ़ाइल",
      editProfile: "प्रोफ़ाइल संपादित करें",
      myWritings: "मेरी रचनाएँ",
      writings: "रचनाएँ",
      joined: "जुड़े",
      noWritings:
        "आपने अभी कोई रचना प्रकाशित नहीं की है।",
      startWriting: "पहली रचना लिखें",
    },

    about: {
      eyebrow: "हम कौन हैं",
      title: "SHOBDO के बारे में",
      description:
        "SHOBDO बंगाली, अंग्रेज़ी और हिन्दी लेखकों तथा पाठकों के लिए बनाया गया एक बहुभाषी साहित्यिक मंच है।",

      quote:
        "हर व्यक्ति के भीतर एक कहानी होती है—SHOBDO वह स्थान है जहाँ वह कहानी दुनिया तक पहुँचती है।",

      foundationEyebrow: "हमारी नींव",
      foundationTitle:
        "शब्दों के माध्यम से लोगों को जोड़ना",
      foundationDescription:
        "SHOBDO रचनात्मक स्वतंत्रता, सार्थक जुड़ाव और भाषाई विविधता के तीन सिद्धांतों पर बना है।",

      missionTitle: "रचनात्मक अभिव्यक्ति",
      missionDescription:
        "हर लेखक को विचार, भावनाएँ और रचनात्मकता व्यक्त करने के लिए सुंदर स्थान देना।",

      communityTitle: "साहित्यिक समुदाय",
      communityDescription:
        "लेखकों और पाठकों को ऐसे जीवंत स्थान पर जोड़ना जहाँ हर आवाज़ का सम्मान हो।",

      languagesTitle: "बहुभाषी पहचान",
      languagesDescription:
        "बंगाली, अंग्रेज़ी और हिन्दी में साहित्य लिखने, प्रकाशित करने और खोजने का अवसर देना।",

      whyEyebrow: "SHOBDO क्यों",
      whyTitle:
        "केवल लिखने की जगह से कहीं अधिक",
      whyDescription:
        "SHOBDO ऐसा साहित्यिक अनुभव बनाता है जहाँ अभिव्यक्ति, खोज और अपनापन एक साथ मिलते हैं।",

      valueExpressionTitle:
        "स्वतंत्र रूप से व्यक्त करें",
      valueExpressionDescription:
        "कविता, कहानी, भावनाएँ या निबंध—अपनी विशिष्ट आवाज़ में अपनी बात लिखें।",

      valueDiscoveryTitle:
        "नई रचनाएँ खोजें",
      valueDiscoveryDescription:
        "विभिन्न भाषाओं और विधाओं की रचनाएँ पढ़ें तथा उभरते लेखकों को खोजें।",

      valueBelongingTitle:
        "अपने समुदाय से जुड़ें",
      valueBelongingDescription:
        "पाठकों और लेखकों से जुड़कर साहित्य पर आधारित सार्थक रिश्ते बनाएँ।",

      howEyebrow: "यह कैसे काम करता है",
      howTitle: "विचार से पाठक तक",
      howDescription:
        "तीन आसान चरणों में अपनी रचना SHOBDO समुदाय तक पहुँचाएँ।",

      processWriteTitle: "लिखें",
      processWriteDescription:
        "संपादक में सीधे लिखें या हस्तलिखित चित्र अथवा PDF स्कैन करके टेक्स्ट निकालें।",

      processPublishTitle: "प्रकाशित करें",
      processPublishDescription:
        "भाषा और श्रेणी चुनकर अपनी रचना को समुदाय के सामने सुंदर रूप में प्रस्तुत करें।",

      processConnectTitle: "जुड़ें",
      processConnectDescription:
        "दूसरों की रचनाएँ पढ़ें, पसंद करें, चर्चा करें और नए साहित्यिक संबंध बनाएँ।",

      languageEyebrow: "हमारा भाषा दर्शन",
      languageTitle:
        "हर भाषा अपने भीतर एक अनोखी दुनिया रखती है",
      languageDescription:
        "हम मानते हैं कि भाषा केवल संवाद नहीं है—यह संस्कृति, स्मृति और पहचान को सँजोती है। इसलिए SHOBDO हर भाषा और हर आवाज़ को समान सम्मान देता है।",

      finalEyebrow:
        "आपकी कहानी महत्त्वपूर्ण है",
      finalTitle:
        "शब्दों के साथ आपकी यात्रा आज ही शुरू हो",
      finalDescription:
        "अपने मन की बात लिखें, प्रकाशित करें और उन पाठकों तक पहुँचाएँ जो उसे पढ़ने की प्रतीक्षा कर रहे हैं।",

      visionTitle: "हमारा सपना",
      visionDescription:
        "पाठकों और लेखकों को एक जीवंत साहित्यिक समुदाय में जोड़ना।",
    },

    contact: {
      eyebrow: "हमसे बात करें",
      title: "संपर्क",
      description:
        "प्रश्न, सुझाव या सहयोग के लिए हमें संदेश भेजें।",
      name: "आपका नाम",
      email: "ईमेल पता",
      subject: "विषय",
      message: "आपका संदेश",
      namePlaceholder: "अपना नाम लिखें",
      emailPlaceholder: "अपना ईमेल लिखें",
      subjectPlaceholder:
        "संदेश का विषय लिखें",
      messagePlaceholder:
        "अपना संदेश लिखें…",
      send: "संदेश भेजें",
      sending: "भेजा जा रहा है...",
      sent:
        "आपका संदेश सफलतापूर्वक भेजा गया।",
      failed:
        "संदेश नहीं भेजा जा सका। फिर प्रयास करें।",
      location: "पश्चिम बंगाल, भारत",
    },

    footer: {
      description:
        "लेखकों और पाठकों के लिए एक बहुभाषी साहित्यिक समुदाय।",
      quickLinks: "त्वरित लिंक",
      navigation: "त्वरित लिंक",
      community: "समुदाय",
      legal: "कानूनी जानकारी",
      contactTitle: "संपर्क",
      home: "होम",
      explore: "खोजें",
      write: "लिखें",
      myWritings: "मेरी रचनाएँ",
      about: "हमारे बारे में",
      login: "लॉगिन",
      register: "पंजीकरण",
      privacy: "गोपनीयता नीति",
      terms: "उपयोग की शर्तें",
      contact: "संपर्क",
      email: "ईमेल",
      location: "पश्चिम बंगाल, भारत",
      developedBy: "निर्माता",
      madeWith: "प्यार से बनाया गया",
      forWriters:
        "लेखकों और पाठकों के लिए",
      copyright:
        "सर्वाधिकार सुरक्षित।",
      tagline: "आपके शब्द, आपकी कहानी।",
    },

    login: {
      eyebrow: "सुरक्षित लॉगिन",
      title: "लॉगिन",
      description: "अपने SHOBDO खाते में लॉगिन करें।",
      email: "ईमेल",
      emailPlaceholder: "आपका ईमेल पता",
      password: "पासवर्ड",
      passwordPlaceholder: "आपका पासवर्ड",
      showPassword: "पासवर्ड दिखाएँ",
      hidePassword: "पासवर्ड छिपाएँ",
      forgotPassword: "पासवर्ड भूल गए?",
      loginButton: "लॉगिन",
      loggingIn: "लॉगिन हो रहा है...",
      noAccount: "खाता नहीं है?",
      createAccount: "नया खाता बनाएँ",
    },

    notFound: {
      code: "404",
      title: "पृष्ठ नहीं मिला",
      description:
        "आप जिस पृष्ठ को खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।",
      homeButton: "होम पर जाएँ",
    },

    errors: {
      generic:
        "कुछ समस्या हुई। फिर प्रयास करें।",
      network:
        "सर्वर से संपर्क नहीं हो सका।",
      unauthorized:
        "यह कार्य करने के लिए लॉगिन करें।",
      forbidden:
        "आपको यह कार्य करने की अनुमति नहीं है।",
      notFound:
        "माँगी गई जानकारी नहीं मिली।",
      server:
        "सर्वर में समस्या हुई। बाद में प्रयास करें।",
    },

    privacy: {
      title: "गोपनीयता नीति",
      updated: "अंतिम अपडेट",
      introductionTitle: "परिचय",
      introduction:
        "SHOBDO आपकी व्यक्तिगत जानकारी और गोपनीयता का सम्मान करता है।",
      informationTitle:
        "हम कौन-सी जानकारी एकत्र करते हैं",
      information:
        "खाता चलाने के लिए नाम, ईमेल और प्रकाशित रचनाएँ सहेजी जा सकती हैं।",
      usageTitle: "जानकारी का उपयोग",
      usage:
        "खाता चलाने, रचनाएँ प्रकाशित करने और मंच सुधारने में जानकारी उपयोग होती है।",
      securityTitle: "जानकारी की सुरक्षा",
      security:
        "आपकी जानकारी की सुरक्षा के लिए उचित तकनीकी उपाय किए जाते हैं।",
      contactTitle: "संपर्क",
      contact:
        "गोपनीयता संबंधी प्रश्नों के लिए हमसे संपर्क करें।",
    },

    terms: {
      title: "उपयोग की शर्तें",
      updated: "अंतिम अपडेट",
      acceptanceTitle:
        "शर्तों की स्वीकृति",
      acceptance:
        "SHOBDO का उपयोग करके आप इन शर्तों से सहमत होते हैं।",
      accountTitle: "खाते की ज़िम्मेदारी",
      account:
        "अपने खाते और लॉगिन जानकारी की सुरक्षा की ज़िम्मेदारी आपकी है।",
      contentTitle: "प्रकाशित सामग्री",
      content:
        "लेखक अपनी प्रकाशित रचनाओं के स्वामित्व और ज़िम्मेदारी को बनाए रखते हैं।",
      conductTitle: "स्वीकार्य व्यवहार",
      conduct:
        "अवैध, अपमानजनक या अधिकारों का उल्लंघन करने वाली सामग्री प्रकाशित न करें।",
    },
  },
};

// =========================================================
// CHECK SUPPORTED LANGUAGE
// Required by LanguageContext.jsx
// =========================================================

export function isSupportedUILanguage(language) {
  return UI_LANGUAGES.some(
    (item) => item.code === language
  );
}

// =========================================================
// GET SAVED UI LANGUAGE
// Required by LanguageContext.jsx
// =========================================================

export function getUILanguage(preferredLanguage) {
  if (isSupportedUILanguage(preferredLanguage)) {
    return preferredLanguage;
  }

  if (typeof window !== "undefined") {
    const savedLanguage =
      localStorage.getItem("shobdo_ui_language") ||
      localStorage.getItem("shobdo_language") ||
      localStorage.getItem("language");

    if (isSupportedUILanguage(savedLanguage)) {
      return savedLanguage;
    }
  }

  return DEFAULT_UI_LANGUAGE;
}

// =========================================================
// NORMALIZE LANGUAGE
// =========================================================

export function normalizeLanguage(language) {
  return isSupportedUILanguage(language)
    ? language
    : DEFAULT_UI_LANGUAGE;
}

// =========================================================
// GET ALL TRANSLATIONS FOR ONE LANGUAGE
// =========================================================

export function getTranslations(
  language = DEFAULT_UI_LANGUAGE
) {
  const selectedLanguage =
    normalizeLanguage(language);

  return translations[selectedLanguage];
}

// Compatibility export
export const getTranslation = getTranslations;

// =========================================================
// GET TRANSLATION BY PATH
//
// Example:
// translate("bn", "write.scanTitle")
// =========================================================

export function translate(
  language,
  path,
  fallback = ""
) {
  const selectedLanguage =
    normalizeLanguage(language);

  const keys = String(path)
    .split(".")
    .filter(Boolean);

  let value = translations[selectedLanguage];

  for (const key of keys) {
    if (
      value === null ||
      value === undefined ||
      typeof value !== "object" ||
      !(key in value)
    ) {
      value = undefined;
      break;
    }

    value = value[key];
  }

  if (typeof value === "string") {
    return value;
  }

  let defaultValue =
    translations[DEFAULT_UI_LANGUAGE];

  for (const key of keys) {
    if (
      defaultValue === null ||
      defaultValue === undefined ||
      typeof defaultValue !== "object" ||
      !(key in defaultValue)
    ) {
      defaultValue = undefined;
      break;
    }

    defaultValue = defaultValue[key];
  }

  if (typeof defaultValue === "string") {
    return defaultValue;
  }

  return fallback || path;
}

// =========================================================
// CATEGORY LABEL
// Database category remains Bengali
// =========================================================

export function getCategoryLabel(
  category,
  language = DEFAULT_UI_LANGUAGE
) {
  const categoryKeys = {
    কবিতা: "poetry",
    গল্প: "story",
    অনুভূতি: "feelings",
    প্রবন্ধ: "essay",
    অন্যান্য: "other",
  };

  const categoryKey = categoryKeys[category];

  if (!categoryKey) {
    return category;
  }

  return translate(
    language,
    `categories.${categoryKey}`,
    category
  );
}

// =========================================================
// WRITING LANGUAGE LABEL
// =========================================================

export function getWritingLanguageLabel(
  writingLanguage,
  interfaceLanguage = DEFAULT_UI_LANGUAGE
) {
  const languageKeys = {
    bn: "bengali",
    en: "english",
    hi: "hindi",
  };

  const languageKey =
    languageKeys[writingLanguage];

  if (!languageKey) {
    return writingLanguage;
  }

  return translate(
    interfaceLanguage,
    `write.${languageKey}`,
    writingLanguage
  );
}

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default translations;