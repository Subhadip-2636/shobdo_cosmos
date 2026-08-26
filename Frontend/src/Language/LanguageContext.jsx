import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_UI_LANGUAGE,
  getUILanguage,
  isSupportedUILanguage,
  translations,
  UI_LANGUAGES,
} from "./translations";


const STORAGE_KEY =
  "shobdo_ui_language";


// =========================================================
// CONTEXT
// =========================================================

const LanguageContext =
  createContext(null);


// =========================================================
// TRANSLATION LOOKUP
// =========================================================

function getNestedValue(
  object,
  path
) {

  return path
    .split(".")
    .reduce(
      (
        current,
        key
      ) => {

        if (
          current &&
          Object.prototype
            .hasOwnProperty
            .call(
              current,
              key
            )
        ) {

          return current[key];

        }

        return undefined;

      },
      object
    );

}


// =========================================================
// PROVIDER
// =========================================================

export function LanguageProvider({
  children,
}) {

  const [
    language,
    setLanguageState,
  ] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        saved &&
        isSupportedUILanguage(
          saved
        )
      ) {

        return saved;

      }

    } catch {

      // localStorage unavailable

    }

    return DEFAULT_UI_LANGUAGE;

  });


  // =====================================================
  // UPDATE DOCUMENT LANGUAGE
  // =====================================================

  useEffect(() => {

    const html =
      document.documentElement;

    html.lang =
      language;

    if (
      language === "ur"
    ) {

      html.dir = "rtl";

    } else {

      html.dir = "ltr";

    }

  }, [language]);


  // =====================================================
  // CHANGE LANGUAGE
  // =====================================================

  function setLanguage(
    code
  ) {

    if (
      !isSupportedUILanguage(
        code
      )
    ) {

      return false;

    }


    setLanguageState(
      code
    );


    try {

      localStorage.setItem(
        STORAGE_KEY,
        code
      );

    } catch {

      // localStorage unavailable

    }


    return true;

  }


  // =====================================================
  // TRANSLATE
  // =====================================================

  function t(
    key,
    fallback = ""
  ) {

    const currentTranslations =
      translations[
        language
      ];


    const defaultTranslations =
      translations[
        DEFAULT_UI_LANGUAGE
      ];


    const currentValue =
      getNestedValue(
        currentTranslations,
        key
      );


    if (
      currentValue !==
      undefined
    ) {

      return currentValue;

    }


    const defaultValue =
      getNestedValue(
        defaultTranslations,
        key
      );


    if (
      defaultValue !==
      undefined
    ) {

      return defaultValue;

    }


    return (
      fallback ||
      key
    );

  }


  // =====================================================
  // CURRENT LANGUAGE INFO
  // =====================================================

  const currentLanguage =
    useMemo(
      () =>
        getUILanguage(
          language
        ),
      [language]
    );


  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value =
    useMemo(
      () => ({
        language,

        setLanguage,

        t,

        currentLanguage,

        languages:
          UI_LANGUAGES,
      }),
      [
        language,
        currentLanguage,
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


// =========================================================
// HOOK
// =========================================================

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


export default LanguageContext;