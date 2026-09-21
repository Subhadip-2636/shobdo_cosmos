import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  PAGE_BACKGROUNDS,
  getBackgroundPageKey,
  getDefaultBackgroundId,
} from "../config/pageBackgrounds";


// =========================================================
// CONTEXT
// =========================================================

const PageBackgroundContext =
  createContext(null);


// =========================================================
// STORAGE KEYS
// =========================================================

const BACKGROUND_STORAGE_KEY =
  "shobdo_page_backgrounds";

const SETTINGS_STORAGE_KEY =
  "shobdo_page_background_settings";

const CUSTOM_BACKGROUND_STORAGE_KEY =
  "shobdo_custom_page_backgrounds";


// =========================================================
// DEFAULT SETTINGS
// =========================================================

const DEFAULT_BACKGROUND_SETTINGS = {
  brightness: 100,
  blur: 0,
  visibility: 55,
};


// =========================================================
// SAFE STORAGE READER
// =========================================================

function readStoredObject(
  key
) {

  try {

    const saved =
      localStorage.getItem(
        key
      );


    if (!saved) {
      return {};
    }


    const parsed =
      JSON.parse(saved);


    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }


    return {};

  } catch (
    error
  ) {

    console.warn(
      `Could not read ${key}:`,
      error
    );

    return {};

  }

}


// =========================================================
// PROVIDER
// =========================================================

export function PageBackgroundProvider({
  children,
}) {

  const location =
    useLocation();


  // =======================================================
  // CURRENT PAGE
  // =======================================================

  const pageKey =
    useMemo(
      () =>
        getBackgroundPageKey(
          location.pathname
        ),
      [
        location.pathname,
      ]
    );


  // =======================================================
  // SELECTED BACKGROUNDS
  // =======================================================

  const [
    selectedBackgrounds,
    setSelectedBackgrounds,
  ] =
    useState(
      () =>
        readStoredObject(
          BACKGROUND_STORAGE_KEY
        )
    );


  // =======================================================
  // BACKGROUND SETTINGS
  // =======================================================

  const [
    backgroundSettings,
    setBackgroundSettings,
  ] =
    useState(
      () =>
        readStoredObject(
          SETTINGS_STORAGE_KEY
        )
    );


  // =======================================================
  // CUSTOM USER BACKGROUNDS
  // =======================================================

  const [
    customBackgrounds,
    setCustomBackgrounds,
  ] =
    useState(
      () =>
        readStoredObject(
          CUSTOM_BACKGROUND_STORAGE_KEY
        )
    );


  // =======================================================
  // SAVE SELECTED BACKGROUNDS
  // =======================================================

  useEffect(() => {

    try {

      localStorage.setItem(
        BACKGROUND_STORAGE_KEY,
        JSON.stringify(
          selectedBackgrounds
        )
      );

    } catch (
      error
    ) {

      console.warn(
        "Could not save page backgrounds:",
        error
      );

    }

  }, [
    selectedBackgrounds,
  ]);


  // =======================================================
  // SAVE SETTINGS
  // =======================================================

  useEffect(() => {

    try {

      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
          backgroundSettings
        )
      );

    } catch (
      error
    ) {

      console.warn(
        "Could not save background settings:",
        error
      );

    }

  }, [
    backgroundSettings,
  ]);


  // =======================================================
  // SAVE CUSTOM BACKGROUNDS
  // =======================================================

  useEffect(() => {

    try {

      localStorage.setItem(
        CUSTOM_BACKGROUND_STORAGE_KEY,
        JSON.stringify(
          customBackgrounds
        )
      );

    } catch (
      error
    ) {

      console.warn(
        "Could not save custom backgrounds:",
        error
      );

    }

  }, [
    customBackgrounds,
  ]);


  // =======================================================
  // CURRENT CUSTOM BACKGROUND
  // =======================================================

  const currentCustomBackground =
    customBackgrounds[
      pageKey
    ] || null;


  // =======================================================
  // AVAILABLE BACKGROUNDS
  // =======================================================

  const backgrounds =
    useMemo(
      () => {

        if (
          !currentCustomBackground
        ) {
          return PAGE_BACKGROUNDS;
        }


        return [
          ...PAGE_BACKGROUNDS,

          {
            id: "custom",
            name: "My background",
            type: "image",
            value:
              currentCustomBackground,
            custom: true,
          },
        ];

      },
      [
        currentCustomBackground,
      ]
    );


  // =======================================================
  // SELECTED BACKGROUND ID
  // =======================================================

  const selectedId =
    selectedBackgrounds[
      pageKey
    ] ||
    getDefaultBackgroundId(
      pageKey
    );


  // =======================================================
  // CURRENT BACKGROUND OBJECT
  // =======================================================

  const currentBackground =
    useMemo(
      () => {

        return (
          backgrounds.find(
            (background) =>
              background.id ===
              selectedId
          ) ||
          PAGE_BACKGROUNDS[0]
        );

      },
      [
        backgrounds,
        selectedId,
      ]
    );


  // =======================================================
  // CURRENT SETTINGS
  // =======================================================

  const currentSettings =
    useMemo(
      () => ({
        ...DEFAULT_BACKGROUND_SETTINGS,

        ...backgroundSettings[
          pageKey
        ],
      }),
      [
        backgroundSettings,
        pageKey,
      ]
    );


  // =======================================================
  // SET BACKGROUND
  // =======================================================

  function setBackground(
    backgroundId
  ) {

    const exists =
      backgrounds.some(
        (background) =>
          background.id ===
          backgroundId
      );


    if (!exists) {
      return;
    }


    setSelectedBackgrounds(
      (current) => ({
        ...current,

        [pageKey]:
          backgroundId,
      })
    );

  }


  // =======================================================
  // SET CUSTOM BACKGROUND
  // =======================================================

  function setCustomBackground(
    imageData
  ) {

    if (
      !imageData ||
      typeof imageData !==
        "string"
    ) {
      return;
    }


    setCustomBackgrounds(
      (current) => ({
        ...current,

        [pageKey]:
          imageData,
      })
    );


    setSelectedBackgrounds(
      (current) => ({
        ...current,

        [pageKey]:
          "custom",
      })
    );

  }


  // =======================================================
  // REMOVE CUSTOM BACKGROUND
  // =======================================================

  function removeCustomBackground() {

    setCustomBackgrounds(
      (current) => {

        const next = {
          ...current,
        };


        delete next[
          pageKey
        ];


        return next;

      }
    );


    setSelectedBackgrounds(
      (current) => ({
        ...current,

        [pageKey]:
          "default",
      })
    );

  }


  // =======================================================
  // SET BRIGHTNESS
  // =======================================================

  function setBrightness(
    value
  ) {

    const safeValue =
      Math.min(
        140,
        Math.max(
          40,
          Number(value)
        )
      );


    setBackgroundSettings(
      (current) => ({
        ...current,

        [pageKey]: {
          ...DEFAULT_BACKGROUND_SETTINGS,

          ...current[
            pageKey
          ],

          brightness:
            safeValue,
        },
      })
    );

  }


  // =======================================================
  // SET BLUR
  // =======================================================

  function setBlur(
    value
  ) {

    const safeValue =
      Math.min(
        12,
        Math.max(
          0,
          Number(value)
        )
      );


    setBackgroundSettings(
      (current) => ({
        ...current,

        [pageKey]: {
          ...DEFAULT_BACKGROUND_SETTINGS,

          ...current[
            pageKey
          ],

          blur:
            safeValue,
        },
      })
    );

  }


  // =======================================================
  // RESET CURRENT PAGE
  // =======================================================

  function resetBackground() {

    setSelectedBackgrounds(
      (current) => {

        const next = {
          ...current,
        };


        // Remove the user's override.
        // The page will automatically return
        // to its official SHOBDO default.
        delete next[
          pageKey
        ];


        return next;

      }
    );


    setBackgroundSettings(
      (current) => ({
        ...current,

        [pageKey]: {
          ...DEFAULT_BACKGROUND_SETTINGS,
        },
      })
    );

  }


  // =======================================================
  // SET BACKGROUND VISIBILITY
  // =======================================================

  function setVisibility(
    value
  ) {
     const safeValue =
        Math.min(
            100,
            Math.max(
                20,
                Number(value)
            )
        );
     setBackgroundSettings(
        (current) => ({
            ...current,

            [pageKey]: {
                ...DEFAULT_BACKGROUND_SETTINGS,

                ...current[
                    pageKey
                ],
                visibility:
                    safeValue,
            },
        })
    );

  }

  // =======================================================
  // APPLY TO ALL PAGES
  // =======================================================

  function applyBackgroundToAll(
    backgroundId
  ) {

    const exists =
      backgrounds.some(
        (background) =>
          background.id ===
          backgroundId
      );


    if (!exists) {
      return;
    }


    const pages = [
      "home",
      "explore",
      "write",
      "notifications",
      "saved",
      "connections",
      "profile",
      "settings",
      "default",
    ];


    const newBackgrounds = {};

    const newSettings = {};


    pages.forEach(
      (page) => {

        newBackgrounds[
          page
        ] =
          backgroundId;


        newSettings[
          page
        ] = {
          ...currentSettings,
        };

      }
    );


    // -----------------------------------------------------
    // CUSTOM IMAGE MUST ALSO BE COPIED
    // -----------------------------------------------------

    if (
      backgroundId ===
        "custom" &&
      currentCustomBackground
    ) {

      setCustomBackgrounds(
        (current) => {

          const next = {
            ...current,
          };


          pages.forEach(
            (page) => {

              next[
                page
              ] =
                currentCustomBackground;

            }
          );


          return next;

        }
      );

    }


    setSelectedBackgrounds(
      newBackgrounds
    );


    setBackgroundSettings(
      newSettings
    );

  }


  // =======================================================
  // CONTEXT VALUE
  // =======================================================

  const value =
    useMemo(
      () => ({
        pageKey,

        backgrounds,

        selectedId,

        currentBackground,

        currentSettings,

        currentCustomBackground,

        setBackground,

        setCustomBackground,

        removeCustomBackground,

        setBrightness,

        setBlur,

        resetBackground,

        applyBackgroundToAll,
      }),
      [
        pageKey,
        backgrounds,
        selectedId,
        currentBackground,
        currentSettings,
        currentCustomBackground,
      ]
    );


  return (

    <PageBackgroundContext.Provider
      value={
        value
      }
    >

      {children}

    </PageBackgroundContext.Provider>

  );

}


// =========================================================
// HOOK
// =========================================================

export function usePageBackground() {

  const context =
    useContext(
      PageBackgroundContext
    );


  if (!context) {

    throw new Error(
      "usePageBackground must be used inside PageBackgroundProvider"
    );

  }


  return context;

}