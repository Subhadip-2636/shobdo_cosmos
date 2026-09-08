import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as SecureStore from "expo-secure-store";


// ==========================================================
// TYPES
// ==========================================================

export type LanguageCode =
  | "en"
  | "bn"
  | "hi";


export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};


type TranslationParams =
  Record<
    string,
    string | number
  >;


type LanguageContextType = {
  language: LanguageCode;
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  setLanguage: (
    language: LanguageCode
  ) => void;
  t: (
    key: string,
    params?: TranslationParams
  ) => string;
  loading: boolean;
};


type TranslationDictionary =
  Record<string, string>;


type TranslationMap =
  Record<
    LanguageCode,
    TranslationDictionary
  >;


// ==========================================================
// CONSTANTS
// ==========================================================

const LANGUAGE_STORAGE_KEY =
  "shobdo_ui_language";


export const LANGUAGES:
  LanguageOption[] = [
    {
      code: "en",
      label: "English",
      nativeLabel: "English",
    },
    {
      code: "bn",
      label: "Bengali",
      nativeLabel: "বাংলা",
    },
    {
      code: "hi",
      label: "Hindi",
      nativeLabel: "हिन्दी",
    },
  ];


// ==========================================================
// TRANSLATIONS
// ==========================================================

const translations:
  TranslationMap = {

    // ======================================================
    // ENGLISH
    // ======================================================

    en: {

      // ----------------------------------------------------
      // NAVBAR / TABS
      // ----------------------------------------------------

      "nav.home": "Home",
      "nav.explore": "Explore",
      "nav.write": "Write",
      "nav.myWritings": "My Writings",
      "nav.account": "Account",
      "nav.menu": "Menu",
      "nav.about": "About",

      "language.label": "Language",
      "language.english": "English",
      "language.bengali": "Bengali",
      "language.hindi": "Hindi",


      // ----------------------------------------------------
      // HOME
      // ----------------------------------------------------

      "home.eyebrow": "A HOME FOR EVERY VOICE",
      "home.title": "Your words, your story.",
      "home.description":
        "Read, write and share literature with a growing community of writers and readers.",
      "home.startWriting": "Start Writing",
      "home.explore": "Explore Writings",
      "home.categories": "Categories",
      "home.latest": "Latest Writings",
      "home.viewAll": "View All",
      "home.noWritings": "No writings yet",
      "home.noWritingsDescription":
        "Published writings will appear here.",
      "home.read": "Read",
      "home.likes": "Likes",
      "home.comments": "Comments",
      "home.writer": "Writer",
      "home.otherCategory": "Other",
      "home.ctaTitle": "Have something to say?",
      "home.ctaDescription":
        "Share your poem, story, feeling or article with the SHOBDO community.",
      "home.ctaButton": "Write Something",
      "home.loading": "Loading writings...",
      "home.loadError": "Unable to load writings.",
      "home.retry": "Try Again",


      // ----------------------------------------------------
      // EXPLORE
      // ----------------------------------------------------

      "explore.title": "Explore",
      "explore.description":
        "Discover new writers, new ideas and new stories.",
      "explore.search":
        "Search poems, stories or writers...",
      "explore.searchButton": "Search",
      "explore.clear": "Clear",
      "explore.loading": "Loading writings...",
      "explore.loadError":
        "Unable to load writings.",
      "explore.retry": "Try Again",
      "explore.noResults": "No writings found",
      "explore.noResultsDescription":
        "Try another search or explore all published writings.",
      "explore.noResultsFor":
        "No results found for “{query}”.",
      "explore.read": "Read",
      "explore.likes": "Likes",
      "explore.comments": "Comments",
      "explore.writer": "Writer",
      "explore.otherCategory": "Other",


      // ----------------------------------------------------
      // WRITE
      // ----------------------------------------------------

      "write.eyebrow": "CREATE",
      "write.title": "Write",
      "write.description":
        "Turn your thoughts into words and share them with the SHOBDO community.",
      "write.signInTitle": "Sign in to write",
      "write.signInDescription":
        "Please sign in from the Account tab before creating a writing.",
      "write.goToAccount": "Go to Account",

      "write.titleLabel": "Title",
      "write.titlePlaceholder":
        "Give your writing a title...",
      "write.categoryLabel": "Category",
      "write.categoryPlaceholder":
        "Choose a category",
      "write.languageLabel": "Writing Language",
      "write.languagePlaceholder":
        "Choose a language",
      "write.contentLabel": "Content",
      "write.contentPlaceholder":
        "Start writing here...",
      "write.words": "Words",
      "write.characters": "Characters",

      "write.saveDraft": "Save Draft",
      "write.publish": "Publish",
      "write.saving": "Saving...",
      "write.publishing": "Publishing...",
      "write.draftHint":
        "You can save your writing as a draft and publish it later.",

      "write.validationTitle": "Title required",
      "write.validationTitleDescription":
        "Please enter a title.",
      "write.validationCategory":
        "Category required",
      "write.validationCategoryDescription":
        "Please choose a category.",
      "write.validationLanguage":
        "Language required",
      "write.validationLanguageDescription":
        "Please choose a writing language.",
      "write.validationContent":
        "Content required",
      "write.validationContentDescription":
        "Please write some content.",

      "write.alert.draftSaved": "Draft saved",
      "write.alert.draftSavedDescription":
        "Your writing has been saved as a draft.",
      "write.alert.published": "Published",
      "write.alert.publishedDescription":
        "Your writing is now published.",
      "write.alert.saveError":
        "Unable to save writing",
      "write.alert.genericError":
        "Please try again.",

      "write.category.poem": "Poem",
      "write.category.story": "Story",
      "write.category.feeling": "Feeling",
      "write.category.article": "Article",
      "write.category.novel": "Novel",
      "write.category.other": "Other",


      // ----------------------------------------------------
      // MY WRITINGS
      // ----------------------------------------------------

      "myWritings.eyebrow": "YOUR LIBRARY",
      "myWritings.title": "My Writings",
      "myWritings.description":
        "Manage your drafts, published writings and Trash.",
      "myWritings.all": "All",
      "myWritings.published": "Published",
      "myWritings.drafts": "Drafts",
      "myWritings.draft": "Draft",
      "myWritings.trash": "Trash",
      "myWritings.publish": "Publish",
      "myWritings.edit": "Edit",
      "myWritings.restore": "Restore",
      "myWritings.delete": "Move to Trash",
      "myWritings.deletePermanently": "Delete Permanently",
      "myWritings.cancel": "Cancel",

      "myWritings.signInDescription":
        "Please sign in to view and manage your writings.",
      "myWritings.loadError":
        "Unable to load writings",
      "myWritings.loadErrorDescription":
        "Your writings could not be loaded.",
      "myWritings.retry": "Try Again",

      "myWritings.statusDraft": "DRAFT",
      "myWritings.statusPublished":
        "PUBLISHED",

      "myWritings.like": "Like",
      "myWritings.likes": "Likes",
      "myWritings.comment": "Comment",
      "myWritings.comments": "Comments",

      "myWritings.empty": "No writings found",
      "myWritings.emptyDescription":
        "Your writings for this filter will appear here.",
      "myWritings.noTrash": "Trash is empty",
      "myWritings.noTrashDescription":
        "There are no writings in Trash.",

      "myWritings.editEyebrow":
        "EDIT WRITING",
      "myWritings.titleLabel": "Title",
      "myWritings.titlePlaceholder":
        "Writing title...",
      "myWritings.categoryLabel":
        "Category",
      "myWritings.categoryPlaceholder":
        "Choose a category",
      "myWritings.languageCode":
        "Language",
      "myWritings.currentLanguage":
        "Current language",
      "myWritings.contentLabel":
        "Content",
      "myWritings.contentPlaceholder":
        "Write your content...",
      "myWritings.words": "Words",
      "myWritings.characters":
        "Characters",
      "myWritings.saveChanges":
        "Save Changes",

      "myWritings.category.poem": "Poem",
      "myWritings.category.story": "Story",
      "myWritings.category.feeling":
        "Feeling",
      "myWritings.category.article":
        "Article",
      "myWritings.category.novel": "Novel",
      "myWritings.category.other": "Other",

      "myWritings.alert.published":
        "Published",
      "myWritings.alert.publishedDescription":
        "Your writing has been published.",
      "myWritings.alert.publishError":
        "Unable to publish",
      "myWritings.alert.movedToDrafts":
        "Moved to drafts",
      "myWritings.alert.movedToDraftsDescription":
        "Your writing is now a draft.",
      "myWritings.alert.unpublishError":
        "Unable to move to drafts",
      "myWritings.alert.deleteTitle":
        "Move writing to Trash?",
      "myWritings.alert.deleteDescription":
        "“{title}” will be moved to Trash. You can restore it later.",
      "myWritings.alert.deleteError":
        "Unable to move writing to Trash",
      "myWritings.alert.restored":
        "Writing restored",
      "myWritings.alert.restoredPublishedDescription":
        "Your writing has been restored to Published.",
      "myWritings.alert.restoredDraftDescription":
        "Your writing has been restored to Drafts.",
      "myWritings.alert.restoreError":
        "Unable to restore writing",
      "myWritings.alert.permanentDeleteTitle":
        "Delete permanently?",
      "myWritings.alert.permanentDeleteDescription":
        "“{title}” will be permanently deleted. This action cannot be undone.",
      "myWritings.alert.permanentDeleteError":
        "Unable to permanently delete writing",
      "myWritings.alert.editError":
        "Unable to update writing",
      "myWritings.alert.updateError":
        "Unable to update writing",
      "myWritings.alert.updated":
        "Writing updated",
      "myWritings.alert.updatedDescription":
        "Your changes have been saved.",
      "myWritings.alert.titleRequired":
        "Title required",
      "myWritings.alert.titleRequiredDescription":
        "Please enter a title.",
      "myWritings.alert.contentRequired":
        "Content required",
      "myWritings.alert.contentRequiredDescription":
        "Please enter some content.",
      "myWritings.alert.contentTooShort":
        "Writing is too short",
      "myWritings.alert.contentTooShortDescription":
        "Published writing must contain at least 10 characters.",
      "myWritings.alert.genericError":
        "Please try again.",


      // ----------------------------------------------------
      // ACCOUNT
      // ----------------------------------------------------

      "account.title": "Account",
      "account.login": "Login",
      "account.register": "Register",
      "account.logout": "Logout",

      "account.checking":
        "Checking your account...",
      "account.profileEyebrow":
        "YOUR PROFILE",
      "account.shobdoAccount":
        "SHOBDO ACCOUNT",
      "account.sharedDescription":
        "Your SHOBDO account is shared across the website and mobile app.",

      "account.welcomeEyebrow":
        "WELCOME TO SHOBDO",
      "account.signIn": "Sign In",
      "account.createAccount":
        "Create Account",
      "account.loginDescription":
        "Sign in with your SHOBDO account to write, like and comment.",
      "account.registerDescription":
        "Create your SHOBDO account and start sharing your writing.",

      "account.name": "Name",
      "account.namePlaceholder":
        "Your name",
      "account.email": "Email",
      "account.emailPlaceholder":
        "you@example.com",
      "account.password": "Password",
      "account.passwordPlaceholder":
        "Your password",

      "account.validation.email":
        "Email required",
      "account.validation.emailDescription":
        "Please enter your email address.",
      "account.validation.password":
        "Password required",
      "account.validation.passwordDescription":
        "Please enter your password.",
      "account.validation.name":
        "Name required",
      "account.validation.nameDescription":
        "Please enter your name.",

      "account.alert.loginError":
        "Unable to sign in",
      "account.alert.registerError":
        "Unable to create account",
      "account.alert.logoutError":
        "Unable to log out",
      "account.alert.genericError":
        "Please try again.",


      // ----------------------------------------------------
      // WRITER PROFILE
      // ----------------------------------------------------

      "writer.invalidWriter":
        "Invalid writer.",
      "writer.loadErrorDescription":
        "Unable to load this writer.",
      "writer.loading":
        "Loading writer...",
      "writer.unavailable":
        "Writer unavailable",
      "writer.notFound":
        "This writer could not be found.",
      "writer.retry": "Try Again",
      "writer.profile": "Writer Profile",
      "writer.memberSince":
        "Member since",
      "writer.follow": "Follow",
      "writer.following": "Following",
      "writer.followers": "Followers",
      "writer.yourProfile":
        "Your profile",
      "writer.cannotFollowYourself":
        "You cannot follow yourself.",
      "writer.signInRequired":
        "Sign in required",
      "writer.signInRequiredDescription":
        "Please sign in before following writers.",
      "writer.signIn": "Sign In",
      "writer.cancel": "Cancel",
      "writer.followError":
        "Unable to follow",
      "writer.unfollowError":
        "Unable to unfollow",
      "writer.tryAgainDescription":
        "Please try again.",
      "writer.writings": "Writings",
      "writer.likes": "Likes",
      "writer.comments": "Comments",
      "writer.published": "PUBLISHED",
      "writer.noPublishedWritings":
        "No published writings",
      "writer.noPublishedDescription":
        "This writer has not published anything yet.",
      "writer.otherCategory": "Other",
      "writer.read": "Read",


      // ----------------------------------------------------
      // WRITING DETAILS
      // ----------------------------------------------------

      "writingDetails.invalidWriting":
        "Invalid writing.",
      "writingDetails.loadErrorDescription":
        "Unable to load this writing.",
      "writingDetails.loading":
        "Loading writing...",
      "writingDetails.unavailable":
        "Writing unavailable",
      "writingDetails.notFound":
        "This writing could not be found.",
      "writingDetails.retry": "Try Again",
      "writingDetails.headerTitle":
        "Writing",
      "writingDetails.writtenBy":
        "WRITTEN BY",
      "writingDetails.profile":
        "Profile",
      "writingDetails.like": "Like",
      "writingDetails.liked": "Liked",
      "writingDetails.comments":
        "Comments",
      "writingDetails.discussion":
        "DISCUSSION",
      "writingDetails.commentPlaceholder":
        "Share your thoughts...",
      "writingDetails.commentingAs":
        "Commenting as",
      "writingDetails.post": "Post",
      "writingDetails.joinDiscussion":
        "Join the discussion",
      "writingDetails.signInToLeaveComment":
        "Sign in to leave a comment.",
      "writingDetails.noComments":
        "No comments yet",
      "writingDetails.noCommentsDescription":
        "Be the first to share your thoughts about this writing.",

      "writingDetails.signInRequired":
        "Sign in required",
      "writingDetails.signInToLike":
        "Please sign in from the Account tab to like this writing.",
      "writingDetails.signInToComment":
        "Please sign in before commenting.",
      "writingDetails.likeError":
        "Unable to update like",
      "writingDetails.tryAgain":
        "Please try again.",

      "writingDetails.commentRequired":
        "Comment required",
      "writingDetails.commentRequiredDescription":
        "Please write a comment first.",
      "writingDetails.commentTooLong":
        "Comment too long",
      "writingDetails.commentTooLongDescription":
        "Comments can contain up to {max} characters.",
      "writingDetails.commentError":
        "Unable to comment",

      "writingDetails.profileUnavailable":
        "Profile unavailable",
      "writingDetails.profileUnavailableDescription":
        "This user's profile is not available.",
      "writingDetails.writerUnavailable":
        "Writer unavailable",
      "writingDetails.writerUnavailableDescription":
        "This writer profile is not available.",

      "writingDetails.deleteCommentTitle":
        "Delete comment?",
      "writingDetails.deleteCommentDescription":
        "This comment will be permanently removed.",
      "writingDetails.cancel": "Cancel",
      "writingDetails.delete": "Delete",
      "writingDetails.deleteError":
        "Unable to delete",

      "writingDetails.defaultWriter":
        "SHOBDO Writer",
      "writingDetails.defaultReader":
        "SHOBDO Reader",
      "writingDetails.otherCategory":
        "Other",
    },


    // ======================================================
    // BENGALI
    // ======================================================

    bn: {

      // ----------------------------------------------------
      // NAVBAR / TABS
      // ----------------------------------------------------

      "nav.home": "হোম",
      "nav.explore": "অন্বেষণ",
      "nav.write": "লিখুন",
      "nav.myWritings": "আমার লেখা",
      "nav.account": "অ্যাকাউন্ট",
      "nav.menu": "মেনু",
      "nav.about": "সম্পর্কে",

      "language.label": "ভাষা",
      "language.english": "ইংরেজি",
      "language.bengali": "বাংলা",
      "language.hindi": "হিন্দি",


      // ----------------------------------------------------
      // HOME
      // ----------------------------------------------------

      "home.eyebrow":
        "প্রতিটি কণ্ঠের জন্য একটি ঠিকানা",
      "home.title":
        "তোমার শব্দ, তোমার গল্প।",
      "home.description":
        "লেখক ও পাঠকদের ক্রমবর্ধমান সম্প্রদায়ের সঙ্গে সাহিত্য পড়ুন, লিখুন এবং ভাগ করে নিন।",
      "home.startWriting":
        "লেখা শুরু করুন",
      "home.explore":
        "লেখা পড়ুন",
      "home.categories": "বিভাগ",
      "home.latest": "সাম্প্রতিক লেখা",
      "home.viewAll": "সব দেখুন",
      "home.noWritings":
        "এখনও কোনও লেখা নেই",
      "home.noWritingsDescription":
        "প্রকাশিত লেখা এখানে দেখা যাবে।",
      "home.read": "পড়ুন",
      "home.likes": "লাইক",
      "home.comments": "মন্তব্য",
      "home.writer": "লেখক",
      "home.otherCategory": "অন্যান্য",
      "home.ctaTitle":
        "কিছু বলতে চান?",
      "home.ctaDescription":
        "আপনার কবিতা, গল্প, অনুভূতি বা প্রবন্ধ SHOBDO সম্প্রদায়ের সঙ্গে ভাগ করুন।",
      "home.ctaButton":
        "কিছু লিখুন",
      "home.loading":
        "লেখা লোড হচ্ছে...",
      "home.loadError":
        "লেখা লোড করা যায়নি।",
      "home.retry":
        "আবার চেষ্টা করুন",


      // ----------------------------------------------------
      // EXPLORE
      // ----------------------------------------------------

      "explore.title": "অন্বেষণ",
      "explore.description":
        "নতুন লেখক, নতুন ভাবনা, নতুন গল্প আবিষ্কার করুন।",
      "explore.search":
        "কবিতা, গল্প বা লেখক খুঁজুন...",
      "explore.searchButton": "খুঁজুন",
      "explore.clear": "মুছুন",
      "explore.loading":
        "লেখা লোড হচ্ছে...",
      "explore.loadError":
        "লেখা লোড করা যায়নি।",
      "explore.retry":
        "আবার চেষ্টা করুন",
      "explore.noResults":
        "কোনও লেখা পাওয়া যায়নি",
      "explore.noResultsDescription":
        "অন্য কিছু খুঁজুন অথবা সব প্রকাশিত লেখা দেখুন।",
      "explore.noResultsFor":
        "“{query}”-এর জন্য কোনও ফল পাওয়া যায়নি।",
      "explore.read": "পড়ুন",
      "explore.likes": "লাইক",
      "explore.comments": "মন্তব্য",
      "explore.writer": "লেখক",
      "explore.otherCategory": "অন্যান্য",


      // ----------------------------------------------------
      // WRITE
      // ----------------------------------------------------

      "write.eyebrow": "সৃষ্টি করুন",
      "write.title": "লিখুন",
      "write.description":
        "আপনার ভাবনাকে শব্দে রূপ দিন এবং SHOBDO সম্প্রদায়ের সঙ্গে ভাগ করুন।",
      "write.signInTitle":
        "লিখতে লগইন করুন",
      "write.signInDescription":
        "লেখা তৈরি করার আগে Account ট্যাব থেকে লগইন করুন।",
      "write.goToAccount":
        "অ্যাকাউন্টে যান",

      "write.titleLabel": "শিরোনাম",
      "write.titlePlaceholder":
        "লেখার একটি শিরোনাম দিন...",
      "write.categoryLabel": "বিভাগ",
      "write.categoryPlaceholder":
        "একটি বিভাগ বেছে নিন",
      "write.languageLabel":
        "লেখার ভাষা",
      "write.languagePlaceholder":
        "একটি ভাষা বেছে নিন",
      "write.contentLabel": "লেখা",
      "write.contentPlaceholder":
        "এখানে লেখা শুরু করুন...",
      "write.words": "শব্দ",
      "write.characters": "অক্ষর",

      "write.saveDraft":
        "খসড়া সংরক্ষণ করুন",
      "write.publish": "প্রকাশ করুন",
      "write.saving":
        "সংরক্ষণ হচ্ছে...",
      "write.publishing":
        "প্রকাশ হচ্ছে...",
      "write.draftHint":
        "আপনি লেখাটি খসড়া হিসেবে সংরক্ষণ করে পরে প্রকাশ করতে পারবেন।",

      "write.validationTitle":
        "শিরোনাম প্রয়োজন",
      "write.validationTitleDescription":
        "একটি শিরোনাম লিখুন।",
      "write.validationCategory":
        "বিভাগ প্রয়োজন",
      "write.validationCategoryDescription":
        "একটি বিভাগ বেছে নিন।",
      "write.validationLanguage":
        "ভাষা প্রয়োজন",
      "write.validationLanguageDescription":
        "লেখার ভাষা বেছে নিন।",
      "write.validationContent":
        "লেখা প্রয়োজন",
      "write.validationContentDescription":
        "কিছু লিখুন।",

      "write.alert.draftSaved":
        "খসড়া সংরক্ষিত",
      "write.alert.draftSavedDescription":
        "আপনার লেখাটি খসড়া হিসেবে সংরক্ষিত হয়েছে।",
      "write.alert.published":
        "প্রকাশিত",
      "write.alert.publishedDescription":
        "আপনার লেখাটি প্রকাশিত হয়েছে।",
      "write.alert.saveError":
        "লেখা সংরক্ষণ করা যায়নি",
      "write.alert.genericError":
        "আবার চেষ্টা করুন।",

      "write.category.poem": "কবিতা",
      "write.category.story": "গল্প",
      "write.category.feeling":
        "অনুভূতি",
      "write.category.article":
        "প্রবন্ধ",
      "write.category.novel":
        "উপন্যাস",
      "write.category.other":
        "অন্যান্য",


      // ----------------------------------------------------
      // MY WRITINGS
      // ----------------------------------------------------

      "myWritings.eyebrow":
        "আপনার সংগ্রহ",
      "myWritings.title": "আমার লেখা",
      "myWritings.description":
        "আপনার খসড়া, প্রকাশিত লেখা ও ট্র্যাশ পরিচালনা করুন।",
      "myWritings.all": "সব",
      "myWritings.published": "প্রকাশিত",
      "myWritings.drafts": "খসড়া",
      "myWritings.draft": "খসড়া",
      "myWritings.trash": "ট্র্যাশ",
      "myWritings.publish": "প্রকাশ করুন",
      "myWritings.edit": "সম্পাদনা",
      "myWritings.restore": "পুনরুদ্ধার করুন",
      "myWritings.delete": "ট্র্যাশে পাঠান",
      "myWritings.deletePermanently": "স্থায়ীভাবে মুছুন",
      "myWritings.cancel": "বাতিল",

      "myWritings.signInDescription":
        "আপনার লেখা দেখতে ও পরিচালনা করতে লগইন করুন।",
      "myWritings.loadError":
        "লেখা লোড করা যায়নি",
      "myWritings.loadErrorDescription":
        "আপনার লেখাগুলি লোড করা যায়নি।",
      "myWritings.retry":
        "আবার চেষ্টা করুন",

      "myWritings.statusDraft": "খসড়া",
      "myWritings.statusPublished":
        "প্রকাশিত",

      "myWritings.like": "লাইক",
      "myWritings.likes": "লাইক",
      "myWritings.comment": "মন্তব্য",
      "myWritings.comments": "মন্তব্য",

      "myWritings.empty":
        "কোনও লেখা পাওয়া যায়নি",
      "myWritings.emptyDescription":
        "এই ফিল্টারের লেখা এখানে দেখা যাবে।",
      "myWritings.noTrash": "ট্র্যাশ খালি",
      "myWritings.noTrashDescription":
        "ট্র্যাশে কোনও লেখা নেই।",

      "myWritings.editEyebrow":
        "লেখা সম্পাদনা",
      "myWritings.titleLabel": "শিরোনাম",
      "myWritings.titlePlaceholder":
        "লেখার শিরোনাম...",
      "myWritings.categoryLabel": "বিভাগ",
      "myWritings.categoryPlaceholder":
        "একটি বিভাগ বেছে নিন",
      "myWritings.languageCode": "ভাষা",
      "myWritings.currentLanguage":
        "বর্তমান ভাষা",
      "myWritings.contentLabel": "লেখা",
      "myWritings.contentPlaceholder":
        "আপনার লেখা লিখুন...",
      "myWritings.words": "শব্দ",
      "myWritings.characters": "অক্ষর",
      "myWritings.saveChanges":
        "পরিবর্তন সংরক্ষণ করুন",

      "myWritings.category.poem": "কবিতা",
      "myWritings.category.story": "গল্প",
      "myWritings.category.feeling":
        "অনুভূতি",
      "myWritings.category.article":
        "প্রবন্ধ",
      "myWritings.category.novel":
        "উপন্যাস",
      "myWritings.category.other":
        "অন্যান্য",

      "myWritings.alert.published":
        "প্রকাশিত",
      "myWritings.alert.publishedDescription":
        "আপনার লেখাটি প্রকাশিত হয়েছে।",
      "myWritings.alert.publishError":
        "প্রকাশ করা যায়নি",
      "myWritings.alert.movedToDrafts":
        "খসড়ায় সরানো হয়েছে",
      "myWritings.alert.movedToDraftsDescription":
        "আপনার লেখাটি এখন খসড়া।",
      "myWritings.alert.unpublishError":
        "খসড়ায় সরানো যায়নি",
      "myWritings.alert.deleteTitle":
        "লেখাটি ট্র্যাশে পাঠাবেন?",
      "myWritings.alert.deleteDescription":
        "“{title}” ট্র্যাশে পাঠানো হবে। পরে এটি পুনরুদ্ধার করা যাবে।",
      "myWritings.alert.deleteError":
        "লেখাটি ট্র্যাশে পাঠানো যায়নি",
      "myWritings.alert.restored":
        "লেখা পুনরুদ্ধার হয়েছে",
      "myWritings.alert.restoredPublishedDescription":
        "আপনার লেখাটি প্রকাশিত লেখায় পুনরুদ্ধার করা হয়েছে।",
      "myWritings.alert.restoredDraftDescription":
        "আপনার লেখাটি খসড়ায় পুনরুদ্ধার করা হয়েছে।",
      "myWritings.alert.restoreError":
        "লেখাটি পুনরুদ্ধার করা যায়নি",
      "myWritings.alert.permanentDeleteTitle":
        "স্থায়ীভাবে মুছবেন?",
      "myWritings.alert.permanentDeleteDescription":
        "“{title}” স্থায়ীভাবে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।",
      "myWritings.alert.permanentDeleteError":
        "লেখাটি স্থায়ীভাবে মোছা যায়নি",
      "myWritings.alert.editError":
        "লেখা আপডেট করা যায়নি",
      "myWritings.alert.updateError":
        "লেখা আপডেট করা যায়নি",
      "myWritings.alert.updated":
        "লেখা আপডেট হয়েছে",
      "myWritings.alert.updatedDescription":
        "আপনার পরিবর্তনগুলি সংরক্ষিত হয়েছে।",
      "myWritings.alert.titleRequired":
        "শিরোনাম প্রয়োজন",
      "myWritings.alert.titleRequiredDescription":
        "একটি শিরোনাম লিখুন।",
      "myWritings.alert.contentRequired":
        "লেখা প্রয়োজন",
      "myWritings.alert.contentRequiredDescription":
        "কিছু লিখুন।",
      "myWritings.alert.contentTooShort":
        "লেখাটি খুব ছোট",
      "myWritings.alert.contentTooShortDescription":
        "প্রকাশিত লেখায় অন্তত ১০টি অক্ষর থাকতে হবে।",
      "myWritings.alert.genericError":
        "আবার চেষ্টা করুন।",


      // ----------------------------------------------------
      // ACCOUNT
      // ----------------------------------------------------

      "account.title": "অ্যাকাউন্ট",
      "account.login": "লগইন",
      "account.register": "নিবন্ধন",
      "account.logout": "লগআউট",

      "account.checking":
        "আপনার অ্যাকাউন্ট যাচাই করা হচ্ছে...",
      "account.profileEyebrow":
        "আপনার প্রোফাইল",
      "account.shobdoAccount":
        "SHOBDO অ্যাকাউন্ট",
      "account.sharedDescription":
        "আপনার SHOBDO অ্যাকাউন্ট ওয়েবসাইট এবং মোবাইল অ্যাপ উভয় জায়গায় ব্যবহার করা যায়।",

      "account.welcomeEyebrow":
        "SHOBDO-তে স্বাগতম",
      "account.signIn": "লগইন করুন",
      "account.createAccount":
        "অ্যাকাউন্ট তৈরি করুন",
      "account.loginDescription":
        "লিখতে, লাইক দিতে এবং মন্তব্য করতে আপনার SHOBDO অ্যাকাউন্টে লগইন করুন।",
      "account.registerDescription":
        "আপনার SHOBDO অ্যাকাউন্ট তৈরি করুন এবং লেখা ভাগ করা শুরু করুন।",

      "account.name": "নাম",
      "account.namePlaceholder":
        "আপনার নাম",
      "account.email": "ইমেইল",
      "account.emailPlaceholder":
        "you@example.com",
      "account.password": "পাসওয়ার্ড",
      "account.passwordPlaceholder":
        "আপনার পাসওয়ার্ড",

      "account.validation.email":
        "ইমেইল প্রয়োজন",
      "account.validation.emailDescription":
        "আপনার ইমেইল ঠিকানা লিখুন।",
      "account.validation.password":
        "পাসওয়ার্ড প্রয়োজন",
      "account.validation.passwordDescription":
        "আপনার পাসওয়ার্ড লিখুন।",
      "account.validation.name":
        "নাম প্রয়োজন",
      "account.validation.nameDescription":
        "আপনার নাম লিখুন।",

      "account.alert.loginError":
        "লগইন করা যায়নি",
      "account.alert.registerError":
        "অ্যাকাউন্ট তৈরি করা যায়নি",
      "account.alert.logoutError":
        "লগআউট করা যায়নি",
      "account.alert.genericError":
        "আবার চেষ্টা করুন।",


      // ----------------------------------------------------
      // WRITER PROFILE
      // ----------------------------------------------------

      "writer.invalidWriter":
        "অবৈধ লেখক।",
      "writer.loadErrorDescription":
        "এই লেখকের তথ্য লোড করা যায়নি।",
      "writer.loading":
        "লেখকের তথ্য লোড হচ্ছে...",
      "writer.unavailable":
        "লেখককে পাওয়া যাচ্ছে না",
      "writer.notFound":
        "এই লেখককে খুঁজে পাওয়া যায়নি।",
      "writer.retry":
        "আবার চেষ্টা করুন",
      "writer.profile":
        "লেখকের প্রোফাইল",
      "writer.memberSince":
        "সদস্য হয়েছেন",
      "writer.follow":
        "অনুসরণ করুন",
      "writer.following":
        "অনুসরণ করছেন",
      "writer.followers":
        "অনুসরণকারী",
      "writer.yourProfile":
        "আপনার প্রোফাইল",
      "writer.cannotFollowYourself":
        "আপনি নিজেকে অনুসরণ করতে পারবেন না।",
      "writer.signInRequired":
        "লগইন প্রয়োজন",
      "writer.signInRequiredDescription":
        "লেখকদের অনুসরণ করতে প্রথমে লগইন করুন।",
      "writer.signIn": "লগইন করুন",
      "writer.cancel": "বাতিল",
      "writer.followError":
        "অনুসরণ করা যায়নি",
      "writer.unfollowError":
        "অনুসরণ বন্ধ করা যায়নি",
      "writer.tryAgainDescription":
        "আবার চেষ্টা করুন।",
      "writer.writings": "লেখা",
      "writer.likes": "লাইক",
      "writer.comments": "মন্তব্য",
      "writer.published": "প্রকাশিত",
      "writer.noPublishedWritings":
        "কোনও প্রকাশিত লেখা নেই",
      "writer.noPublishedDescription":
        "এই লেখক এখনও কোনও লেখা প্রকাশ করেননি।",
      "writer.otherCategory":
        "অন্যান্য",
      "writer.read": "পড়ুন",


      // ----------------------------------------------------
      // WRITING DETAILS
      // ----------------------------------------------------

      "writingDetails.invalidWriting":
        "অবৈধ লেখা।",
      "writingDetails.loadErrorDescription":
        "এই লেখাটি লোড করা যায়নি।",
      "writingDetails.loading":
        "লেখা লোড হচ্ছে...",
      "writingDetails.unavailable":
        "লেখাটি পাওয়া যাচ্ছে না",
      "writingDetails.notFound":
        "এই লেখাটি খুঁজে পাওয়া যায়নি।",
      "writingDetails.retry":
        "আবার চেষ্টা করুন",
      "writingDetails.headerTitle": "লেখা",
      "writingDetails.writtenBy":
        "লিখেছেন",
      "writingDetails.profile":
        "প্রোফাইল",
      "writingDetails.like": "লাইক",
      "writingDetails.liked":
        "লাইক করা হয়েছে",
      "writingDetails.comments":
        "মন্তব্য",
      "writingDetails.discussion":
        "আলোচনা",
      "writingDetails.commentPlaceholder":
        "আপনার মতামত লিখুন...",
      "writingDetails.commentingAs":
        "মন্তব্য করছেন",
      "writingDetails.post":
        "পোস্ট করুন",
      "writingDetails.joinDiscussion":
        "আলোচনায় যোগ দিন",
      "writingDetails.signInToLeaveComment":
        "মন্তব্য করতে লগইন করুন।",
      "writingDetails.noComments":
        "এখনও কোনও মন্তব্য নেই",
      "writingDetails.noCommentsDescription":
        "এই লেখা সম্পর্কে প্রথম মতামতটি আপনিই দিন।",

      "writingDetails.signInRequired":
        "লগইন প্রয়োজন",
      "writingDetails.signInToLike":
        "এই লেখায় লাইক দিতে Account ট্যাব থেকে লগইন করুন।",
      "writingDetails.signInToComment":
        "মন্তব্য করার আগে লগইন করুন।",
      "writingDetails.likeError":
        "লাইক আপডেট করা যায়নি",
      "writingDetails.tryAgain":
        "আবার চেষ্টা করুন।",

      "writingDetails.commentRequired":
        "মন্তব্য প্রয়োজন",
      "writingDetails.commentRequiredDescription":
        "প্রথমে একটি মন্তব্য লিখুন।",
      "writingDetails.commentTooLong":
        "মন্তব্যটি খুব বড়",
      "writingDetails.commentTooLongDescription":
        "মন্তব্য সর্বোচ্চ {max} অক্ষরের হতে পারে।",
      "writingDetails.commentError":
        "মন্তব্য করা যায়নি",

      "writingDetails.profileUnavailable":
        "প্রোফাইল পাওয়া যাচ্ছে না",
      "writingDetails.profileUnavailableDescription":
        "এই ব্যবহারকারীর প্রোফাইল পাওয়া যাচ্ছে না।",
      "writingDetails.writerUnavailable":
        "লেখকের প্রোফাইল পাওয়া যাচ্ছে না",
      "writingDetails.writerUnavailableDescription":
        "এই লেখকের প্রোফাইলটি পাওয়া যাচ্ছে না।",

      "writingDetails.deleteCommentTitle":
        "মন্তব্য মুছবেন?",
      "writingDetails.deleteCommentDescription":
        "এই মন্তব্যটি স্থায়ীভাবে মুছে যাবে।",
      "writingDetails.cancel": "বাতিল",
      "writingDetails.delete": "মুছুন",
      "writingDetails.deleteError":
        "মন্তব্য মুছতে সমস্যা হয়েছে",

      "writingDetails.defaultWriter":
        "SHOBDO লেখক",
      "writingDetails.defaultReader":
        "SHOBDO পাঠক",
      "writingDetails.otherCategory":
        "অন্যান্য",
    },


    // ======================================================
    // HINDI
    // ======================================================

    hi: {

      // ----------------------------------------------------
      // NAVBAR / TABS
      // ----------------------------------------------------

      "nav.home": "होम",
      "nav.explore": "अन्वेषण",
      "nav.write": "लिखें",
      "nav.myWritings": "मेरी रचनाएँ",
      "nav.account": "अकाउंट",
      "nav.menu": "मेनू",
      "nav.about": "परिचय",

      "language.label": "भाषा",
      "language.english": "अंग्रेज़ी",
      "language.bengali": "बांग्ला",
      "language.hindi": "हिन्दी",


      // ----------------------------------------------------
      // HOME
      // ----------------------------------------------------

      "home.eyebrow":
        "हर आवाज़ के लिए एक घर",
      "home.title":
        "आपके शब्द, आपकी कहानी।",
      "home.description":
        "लेखकों और पाठकों के बढ़ते समुदाय के साथ साहित्य पढ़ें, लिखें और साझा करें।",
      "home.startWriting":
        "लिखना शुरू करें",
      "home.explore":
        "रचनाएँ पढ़ें",
      "home.categories": "श्रेणियाँ",
      "home.latest": "नई रचनाएँ",
      "home.viewAll": "सभी देखें",
      "home.noWritings":
        "अभी कोई रचना नहीं",
      "home.noWritingsDescription":
        "प्रकाशित रचनाएँ यहाँ दिखाई देंगी।",
      "home.read": "पढ़ें",
      "home.likes": "लाइक",
      "home.comments": "टिप्पणियाँ",
      "home.writer": "लेखक",
      "home.otherCategory": "अन्य",
      "home.ctaTitle":
        "कुछ कहना चाहते हैं?",
      "home.ctaDescription":
        "अपनी कविता, कहानी, भावना या लेख SHOBDO समुदाय के साथ साझा करें।",
      "home.ctaButton":
        "कुछ लिखें",
      "home.loading":
        "रचनाएँ लोड हो रही हैं...",
      "home.loadError":
        "रचनाएँ लोड नहीं हो सकीं।",
      "home.retry":
        "फिर से प्रयास करें",


      // ----------------------------------------------------
      // EXPLORE
      // ----------------------------------------------------

      "explore.title": "अन्वेषण",
      "explore.description":
        "नए लेखक, नए विचार और नई कहानियाँ खोजें।",
      "explore.search":
        "कविता, कहानी या लेखक खोजें...",
      "explore.searchButton": "खोजें",
      "explore.clear": "साफ़ करें",
      "explore.loading":
        "रचनाएँ लोड हो रही हैं...",
      "explore.loadError":
        "रचनाएँ लोड नहीं हो सकीं।",
      "explore.retry":
        "फिर से प्रयास करें",
      "explore.noResults":
        "कोई रचना नहीं मिली",
      "explore.noResultsDescription":
        "कुछ और खोजें या सभी प्रकाशित रचनाएँ देखें।",
      "explore.noResultsFor":
        "“{query}” के लिए कोई परिणाम नहीं मिला।",
      "explore.read": "पढ़ें",
      "explore.likes": "लाइक",
      "explore.comments": "टिप्पणियाँ",
      "explore.writer": "लेखक",
      "explore.otherCategory": "अन्य",


      // ----------------------------------------------------
      // WRITE
      // ----------------------------------------------------

      "write.eyebrow": "रचना करें",
      "write.title": "लिखें",
      "write.description":
        "अपने विचारों को शब्द दें और उन्हें SHOBDO समुदाय के साथ साझा करें।",
      "write.signInTitle":
        "लिखने के लिए लॉगिन करें",
      "write.signInDescription":
        "रचना बनाने से पहले Account टैब से लॉगिन करें।",
      "write.goToAccount":
        "अकाउंट पर जाएँ",

      "write.titleLabel": "शीर्षक",
      "write.titlePlaceholder":
        "अपनी रचना को एक शीर्षक दें...",
      "write.categoryLabel": "श्रेणी",
      "write.categoryPlaceholder":
        "एक श्रेणी चुनें",
      "write.languageLabel":
        "रचना की भाषा",
      "write.languagePlaceholder":
        "एक भाषा चुनें",
      "write.contentLabel": "रचना",
      "write.contentPlaceholder":
        "यहाँ लिखना शुरू करें...",
      "write.words": "शब्द",
      "write.characters": "अक्षर",

      "write.saveDraft":
        "ड्राफ्ट सेव करें",
      "write.publish": "प्रकाशित करें",
      "write.saving":
        "सेव हो रहा है...",
      "write.publishing":
        "प्रकाशित हो रहा है...",
      "write.draftHint":
        "आप अपनी रचना को ड्राफ्ट के रूप में सेव करके बाद में प्रकाशित कर सकते हैं।",

      "write.validationTitle":
        "शीर्षक आवश्यक है",
      "write.validationTitleDescription":
        "कृपया शीर्षक लिखें।",
      "write.validationCategory":
        "श्रेणी आवश्यक है",
      "write.validationCategoryDescription":
        "कृपया एक श्रेणी चुनें।",
      "write.validationLanguage":
        "भाषा आवश्यक है",
      "write.validationLanguageDescription":
        "कृपया रचना की भाषा चुनें।",
      "write.validationContent":
        "रचना आवश्यक है",
      "write.validationContentDescription":
        "कृपया कुछ लिखें।",

      "write.alert.draftSaved":
        "ड्राफ्ट सेव हुआ",
      "write.alert.draftSavedDescription":
        "आपकी रचना ड्राफ्ट के रूप में सेव हो गई है।",
      "write.alert.published":
        "प्रकाशित",
      "write.alert.publishedDescription":
        "आपकी रचना प्रकाशित हो गई है।",
      "write.alert.saveError":
        "रचना सेव नहीं हो सकी",
      "write.alert.genericError":
        "फिर से प्रयास करें।",

      "write.category.poem": "कविता",
      "write.category.story": "कहानी",
      "write.category.feeling":
        "भावना",
      "write.category.article": "लेख",
      "write.category.novel":
        "उपन्यास",
      "write.category.other": "अन्य",


      // ----------------------------------------------------
      // MY WRITINGS
      // ----------------------------------------------------

      "myWritings.eyebrow":
        "आपका संग्रह",
      "myWritings.title":
        "मेरी रचनाएँ",
      "myWritings.description":
        "अपने ड्राफ्ट, प्रकाशित रचनाओं और ट्रैश को प्रबंधित करें।",
      "myWritings.all": "सभी",
      "myWritings.published":
        "प्रकाशित",
      "myWritings.drafts": "ड्राफ्ट",
      "myWritings.draft": "ड्राफ्ट",
      "myWritings.trash": "ट्रैश",
      "myWritings.publish":
        "प्रकाशित करें",
      "myWritings.edit":
        "संपादित करें",
      "myWritings.restore":
        "पुनर्स्थापित करें",
      "myWritings.delete":
        "ट्रैश में भेजें",
      "myWritings.deletePermanently":
        "स्थायी रूप से हटाएँ",
      "myWritings.cancel": "रद्द करें",

      "myWritings.signInDescription":
        "अपनी रचनाएँ देखने और प्रबंधित करने के लिए लॉगिन करें।",
      "myWritings.loadError":
        "रचनाएँ लोड नहीं हो सकीं",
      "myWritings.loadErrorDescription":
        "आपकी रचनाएँ लोड नहीं हो सकीं।",
      "myWritings.retry":
        "फिर से प्रयास करें",

      "myWritings.statusDraft": "ड्राफ्ट",
      "myWritings.statusPublished":
        "प्रकाशित",

      "myWritings.like": "लाइक",
      "myWritings.likes": "लाइक",
      "myWritings.comment": "टिप्पणी",
      "myWritings.comments":
        "टिप्पणियाँ",

      "myWritings.empty":
        "कोई रचना नहीं मिली",
      "myWritings.emptyDescription":
        "इस फ़िल्टर की रचनाएँ यहाँ दिखाई देंगी।",
      "myWritings.noTrash":
        "ट्रैश खाली है",
      "myWritings.noTrashDescription":
        "ट्रैश में कोई रचना नहीं है।",

      "myWritings.editEyebrow":
        "रचना संपादित करें",
      "myWritings.titleLabel": "शीर्षक",
      "myWritings.titlePlaceholder":
        "रचना का शीर्षक...",
      "myWritings.categoryLabel":
        "श्रेणी",
      "myWritings.categoryPlaceholder":
        "एक श्रेणी चुनें",
      "myWritings.languageCode": "भाषा",
      "myWritings.currentLanguage":
        "वर्तमान भाषा",
      "myWritings.contentLabel": "रचना",
      "myWritings.contentPlaceholder":
        "अपनी रचना लिखें...",
      "myWritings.words": "शब्द",
      "myWritings.characters": "अक्षर",
      "myWritings.saveChanges":
        "बदलाव सेव करें",

      "myWritings.category.poem": "कविता",
      "myWritings.category.story":
        "कहानी",
      "myWritings.category.feeling":
        "भावना",
      "myWritings.category.article":
        "लेख",
      "myWritings.category.novel":
        "उपन्यास",
      "myWritings.category.other":
        "अन्य",

      "myWritings.alert.published":
        "प्रकाशित",
      "myWritings.alert.publishedDescription":
        "आपकी रचना प्रकाशित हो गई है।",
      "myWritings.alert.publishError":
        "प्रकाशित नहीं किया जा सका",
      "myWritings.alert.movedToDrafts":
        "ड्राफ्ट में भेजा गया",
      "myWritings.alert.movedToDraftsDescription":
        "आपकी रचना अब ड्राफ्ट है।",
      "myWritings.alert.unpublishError":
        "ड्राफ्ट में नहीं भेजा जा सका",
      "myWritings.alert.deleteTitle":
        "रचना को ट्रैश में भेजें?",
      "myWritings.alert.deleteDescription":
        "“{title}” को ट्रैश में भेजा जाएगा। आप इसे बाद में पुनर्स्थापित कर सकते हैं।",
      "myWritings.alert.deleteError":
        "रचना को ट्रैश में नहीं भेजा जा सका",
      "myWritings.alert.restored":
        "रचना पुनर्स्थापित हुई",
      "myWritings.alert.restoredPublishedDescription":
        "आपकी रचना प्रकाशित रचनाओं में पुनर्स्थापित हो गई है।",
      "myWritings.alert.restoredDraftDescription":
        "आपकी रचना ड्राफ्ट में पुनर्स्थापित हो गई है।",
      "myWritings.alert.restoreError":
        "रचना पुनर्स्थापित नहीं की जा सकी",
      "myWritings.alert.permanentDeleteTitle":
        "स्थायी रूप से हटाएँ?",
      "myWritings.alert.permanentDeleteDescription":
        "“{title}” स्थायी रूप से हटा दी जाएगी। इस क्रिया को वापस नहीं किया जा सकता।",
      "myWritings.alert.permanentDeleteError":
        "रचना स्थायी रूप से नहीं हटाई जा सकी",
      "myWritings.alert.editError":
        "रचना अपडेट नहीं हो सकी",
      "myWritings.alert.updateError":
        "रचना अपडेट नहीं हो सकी",
      "myWritings.alert.updated":
        "रचना अपडेट हुई",
      "myWritings.alert.updatedDescription":
        "आपके बदलाव सेव हो गए हैं।",
      "myWritings.alert.titleRequired":
        "शीर्षक आवश्यक है",
      "myWritings.alert.titleRequiredDescription":
        "कृपया शीर्षक लिखें।",
      "myWritings.alert.contentRequired":
        "रचना आवश्यक है",
      "myWritings.alert.contentRequiredDescription":
        "कृपया कुछ लिखें।",
      "myWritings.alert.contentTooShort":
        "रचना बहुत छोटी है",
      "myWritings.alert.contentTooShortDescription":
        "प्रकाशित रचना में कम से कम 10 अक्षर होने चाहिए।",
      "myWritings.alert.genericError":
        "फिर से प्रयास करें।",


      // ----------------------------------------------------
      // ACCOUNT
      // ----------------------------------------------------

      "account.title": "अकाउंट",
      "account.login": "लॉगिन",
      "account.register": "रजिस्टर",
      "account.logout": "लॉगआउट",

      "account.checking":
        "आपका अकाउंट जाँचा जा रहा है...",
      "account.profileEyebrow":
        "आपकी प्रोफ़ाइल",
      "account.shobdoAccount":
        "SHOBDO अकाउंट",
      "account.sharedDescription":
        "आपका SHOBDO अकाउंट वेबसाइट और मोबाइल ऐप दोनों पर साझा है।",

      "account.welcomeEyebrow":
        "SHOBDO में आपका स्वागत है",
      "account.signIn": "साइन इन",
      "account.createAccount":
        "अकाउंट बनाएँ",
      "account.loginDescription":
        "लिखने, लाइक करने और टिप्पणी करने के लिए अपने SHOBDO अकाउंट से लॉगिन करें।",
      "account.registerDescription":
        "अपना SHOBDO अकाउंट बनाएँ और अपनी रचनाएँ साझा करना शुरू करें।",

      "account.name": "नाम",
      "account.namePlaceholder":
        "आपका नाम",
      "account.email": "ईमेल",
      "account.emailPlaceholder":
        "you@example.com",
      "account.password": "पासवर्ड",
      "account.passwordPlaceholder":
        "आपका पासवर्ड",

      "account.validation.email":
        "ईमेल आवश्यक है",
      "account.validation.emailDescription":
        "कृपया अपना ईमेल पता दर्ज करें।",
      "account.validation.password":
        "पासवर्ड आवश्यक है",
      "account.validation.passwordDescription":
        "कृपया अपना पासवर्ड दर्ज करें।",
      "account.validation.name":
        "नाम आवश्यक है",
      "account.validation.nameDescription":
        "कृपया अपना नाम दर्ज करें।",

      "account.alert.loginError":
        "लॉगिन नहीं हो सका",
      "account.alert.registerError":
        "अकाउंट नहीं बनाया जा सका",
      "account.alert.logoutError":
        "लॉगआउट नहीं हो सका",
      "account.alert.genericError":
        "फिर से प्रयास करें।",


      // ----------------------------------------------------
      // WRITER PROFILE
      // ----------------------------------------------------

      "writer.invalidWriter":
        "अमान्य लेखक।",
      "writer.loadErrorDescription":
        "इस लेखक की जानकारी लोड नहीं हो सकी।",
      "writer.loading":
        "लेखक की जानकारी लोड हो रही है...",
      "writer.unavailable":
        "लेखक उपलब्ध नहीं है",
      "writer.notFound":
        "यह लेखक नहीं मिला।",
      "writer.retry":
        "फिर से प्रयास करें",
      "writer.profile":
        "लेखक प्रोफ़ाइल",
      "writer.memberSince":
        "सदस्य बने",
      "writer.follow":
        "फ़ॉलो करें",
      "writer.following":
        "फ़ॉलो कर रहे हैं",
      "writer.followers":
        "फ़ॉलोअर्स",
      "writer.yourProfile":
        "आपकी प्रोफ़ाइल",
      "writer.cannotFollowYourself":
        "आप स्वयं को फ़ॉलो नहीं कर सकते।",
      "writer.signInRequired":
        "लॉगिन आवश्यक है",
      "writer.signInRequiredDescription":
        "लेखकों को फ़ॉलो करने के लिए पहले लॉगिन करें।",
      "writer.signIn":
        "लॉगिन करें",
      "writer.cancel": "रद्द करें",
      "writer.followError":
        "फ़ॉलो नहीं किया जा सका",
      "writer.unfollowError":
        "अनफ़ॉलो नहीं किया जा सका",
      "writer.tryAgainDescription":
        "फिर से प्रयास करें।",
      "writer.writings": "रचनाएँ",
      "writer.likes": "लाइक",
      "writer.comments":
        "टिप्पणियाँ",
      "writer.published":
        "प्रकाशित",
      "writer.noPublishedWritings":
        "कोई प्रकाशित रचना नहीं",
      "writer.noPublishedDescription":
        "इस लेखक ने अभी तक कोई रचना प्रकाशित नहीं की है।",
      "writer.otherCategory": "अन्य",
      "writer.read": "पढ़ें",


      // ----------------------------------------------------
      // WRITING DETAILS
      // ----------------------------------------------------

      "writingDetails.invalidWriting":
        "अमान्य रचना।",
      "writingDetails.loadErrorDescription":
        "यह रचना लोड नहीं हो सकी।",
      "writingDetails.loading":
        "रचना लोड हो रही है...",
      "writingDetails.unavailable":
        "रचना उपलब्ध नहीं है",
      "writingDetails.notFound":
        "यह रचना नहीं मिली।",
      "writingDetails.retry":
        "फिर से प्रयास करें",
      "writingDetails.headerTitle":
        "रचना",
      "writingDetails.writtenBy":
        "लेखक",
      "writingDetails.profile":
        "प्रोफ़ाइल",
      "writingDetails.like": "लाइक",
      "writingDetails.liked":
        "लाइक किया",
      "writingDetails.comments":
        "टिप्पणियाँ",
      "writingDetails.discussion":
        "चर्चा",
      "writingDetails.commentPlaceholder":
        "अपने विचार लिखें...",
      "writingDetails.commentingAs":
        "टिप्पणी कर रहे हैं",
      "writingDetails.post":
        "पोस्ट करें",
      "writingDetails.joinDiscussion":
        "चर्चा में शामिल हों",
      "writingDetails.signInToLeaveComment":
        "टिप्पणी करने के लिए लॉगिन करें।",
      "writingDetails.noComments":
        "अभी कोई टिप्पणी नहीं",
      "writingDetails.noCommentsDescription":
        "इस रचना पर अपने विचार साझा करने वाले पहले व्यक्ति बनें।",

      "writingDetails.signInRequired":
        "लॉगिन आवश्यक है",
      "writingDetails.signInToLike":
        "इस रचना को लाइक करने के लिए Account टैब से लॉगिन करें।",
      "writingDetails.signInToComment":
        "टिप्पणी करने से पहले लॉगिन करें।",
      "writingDetails.likeError":
        "लाइक अपडेट नहीं हो सका",
      "writingDetails.tryAgain":
        "फिर से प्रयास करें।",

      "writingDetails.commentRequired":
        "टिप्पणी आवश्यक है",
      "writingDetails.commentRequiredDescription":
        "पहले एक टिप्पणी लिखें।",
      "writingDetails.commentTooLong":
        "टिप्पणी बहुत लंबी है",
      "writingDetails.commentTooLongDescription":
        "टिप्पणी अधिकतम {max} अक्षरों की हो सकती है।",
      "writingDetails.commentError":
        "टिप्पणी नहीं की जा सकी",

      "writingDetails.profileUnavailable":
        "प्रोफ़ाइल उपलब्ध नहीं है",
      "writingDetails.profileUnavailableDescription":
        "इस उपयोगकर्ता की प्रोफ़ाइल उपलब्ध नहीं है।",
      "writingDetails.writerUnavailable":
        "लेखक उपलब्ध नहीं है",
      "writingDetails.writerUnavailableDescription":
        "इस लेखक की प्रोफ़ाइल उपलब्ध नहीं है।",

      "writingDetails.deleteCommentTitle":
        "टिप्पणी हटाएँ?",
      "writingDetails.deleteCommentDescription":
        "यह टिप्पणी स्थायी रूप से हटा दी जाएगी।",
      "writingDetails.cancel": "रद्द करें",
      "writingDetails.delete": "हटाएँ",
      "writingDetails.deleteError":
        "टिप्पणी हटाई नहीं जा सकी",

      "writingDetails.defaultWriter":
        "SHOBDO लेखक",
      "writingDetails.defaultReader":
        "SHOBDO पाठक",
      "writingDetails.otherCategory":
        "अन्य",
    },
  };


// ==========================================================
// CONTEXT
// ==========================================================

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);


// ==========================================================
// HELPERS
// ==========================================================

function isLanguageCode(
  value: string | null
): value is LanguageCode {

  return (
    value === "en" ||
    value === "bn" ||
    value === "hi"
  );

}


function replaceParameters(
  text: string,
  params?: TranslationParams
) {

  if (!params) {
    return text;
  }


  return Object.entries(
    params
  ).reduce(
    (
      result,
      [key, value]
    ) => {

      return result.replace(
        new RegExp(
          `\\{${key}\\}`,
          "g"
        ),
        String(value)
      );

    },
    text
  );

}


// ==========================================================
// PROVIDER
// ==========================================================

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    language,
    setLanguageState,
  ] =
    useState<LanguageCode>(
      "en"
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  // --------------------------------------------------------
  // LOAD SAVED LANGUAGE
  // --------------------------------------------------------

  useEffect(() => {

    let mounted = true;


    async function loadSavedLanguage() {

      try {

        const savedLanguage =
          await SecureStore.getItemAsync(
            LANGUAGE_STORAGE_KEY
          );


        if (
          mounted &&
          isLanguageCode(
            savedLanguage
          )
        ) {

          setLanguageState(
            savedLanguage
          );

        }

      } catch (error) {

        console.error(
          "LANGUAGE LOAD ERROR:",
          error
        );

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadSavedLanguage();


    return () => {

      mounted = false;

    };

  }, []);


  // --------------------------------------------------------
  // CHANGE LANGUAGE
  // --------------------------------------------------------

  const setLanguage =
    useCallback(
      (
        newLanguage:
          LanguageCode
      ) => {

        if (
          !isLanguageCode(
            newLanguage
          )
        ) {

          return;

        }


        setLanguageState(
          newLanguage
        );


        SecureStore.setItemAsync(
          LANGUAGE_STORAGE_KEY,
          newLanguage
        ).catch(
          (error) => {

            console.error(
              "LANGUAGE SAVE ERROR:",
              error
            );

          }
        );

      },
      []
    );


  // --------------------------------------------------------
  // TRANSLATE
  // --------------------------------------------------------

  const t =
    useCallback(
      (
        key: string,
        params?:
          TranslationParams
      ) => {

        const translated =
          translations[
            language
          ]?.[key] ??
          translations.en[
            key
          ] ??
          key;


        return replaceParameters(
          translated,
          params
        );

      },
      [
        language,
      ]
    );


  // --------------------------------------------------------
  // SELECTED LANGUAGE
  // --------------------------------------------------------

  const selectedLanguage =
    useMemo(
      () => {

        return (
          LANGUAGES.find(
            (item) =>
              item.code ===
              language
          ) ??
          LANGUAGES[0]
        );

      },
      [
        language,
      ]
    );


  // --------------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------------

  const value =
    useMemo<
      LanguageContextType
    >(
      () => ({
        language,
        selectedLanguage,
        languages:
          LANGUAGES,
        setLanguage,
        t,
        loading,
      }),
      [
        language,
        selectedLanguage,
        setLanguage,
        t,
        loading,
      ]
    );


  return (

    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>

  );

}


// ==========================================================
// HOOK
// ==========================================================

export function useLanguage() {

  const context =
    useContext(
      LanguageContext
    );


  if (!context) {

    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );

  }


  return context;

}
