import {
  useEffect,
  useMemo,
} from "react";


import {
  useLanguage,
} from "../Language/LanguageContext";


// =========================================================
// SEO CONFIG
// =========================================================

const SITE_NAME =
  "SHOBDO";


const DEFAULT_DESCRIPTION =
  "SHOBDO is a multilingual writing and reading community for stories, poetry, ideas and meaningful connections.";


// =========================================================
// LANGUAGE / LOCALE
// =========================================================

const HTML_LANGUAGES = {

  bn: "bn",

  en: "en",

  hi: "hi",

  as: "as",

  or: "or",

  ta: "ta",

  te: "te",

};


const OPEN_GRAPH_LOCALES = {

  bn: "bn_IN",

  en: "en_IN",

  hi: "hi_IN",

  as: "as_IN",

  or: "or_IN",

  ta: "ta_IN",

  te: "te_IN",

};


// =========================================================
// HELPERS
// =========================================================

function cleanString(
  value
) {

  return String(
    value || ""
  ).trim();

}


// =========================================================
// SITE URL
// =========================================================

function getSiteUrl() {

  return cleanString(
    import.meta.env.VITE_PUBLIC_SITE_URL
  ).replace(
    /\/+$/,
    ""
  );

}


// =========================================================
// ABSOLUTE URL
// =========================================================

function makeAbsoluteUrl(
  value,
  siteUrl
) {

  const safeValue =
    cleanString(
      value
    );


  if (!safeValue) {
    return "";
  }


  if (
    safeValue.startsWith(
      "http://"
    ) ||
    safeValue.startsWith(
      "https://"
    )
  ) {

    return safeValue;

  }


  if (!siteUrl) {
    return "";
  }


  return (
    `${siteUrl}/` +
    safeValue.replace(
      /^\/+/,
      ""
    )
  );

}


// =========================================================
// META MANAGER
// =========================================================

function setMetaTag({
  attribute,
  key,
  content,
}) {

  if (!content) {
    return null;
  }


  let element =
    document.head.querySelector(
      `meta[${attribute}="${key}"]`
    );


  const existed =
    Boolean(
      element
    );


  if (!element) {

    element =
      document.createElement(
        "meta"
      );


    element.setAttribute(
      attribute,
      key
    );


    element.setAttribute(
      "data-shobdo-seo",
      "true"
    );


    document.head.appendChild(
      element
    );

  }


  const previousContent =
    element.getAttribute(
      "content"
    );


  element.setAttribute(
    "content",
    content
  );


  return () => {

    if (!element) {
      return;
    }


    if (!existed) {

      element.remove();

      return;

    }


    if (
      previousContent === null
    ) {

      element.removeAttribute(
        "content"
      );

      return;

    }


    element.setAttribute(
      "content",
      previousContent
    );

  };

}


// =========================================================
// CANONICAL LINK MANAGER
// =========================================================

function setCanonical(
  canonicalUrl
) {

  if (!canonicalUrl) {
    return null;
  }


  let element =
    document.head.querySelector(
      'link[rel="canonical"]'
    );


  const existed =
    Boolean(
      element
    );


  if (!element) {

    element =
      document.createElement(
        "link"
      );


    element.setAttribute(
      "rel",
      "canonical"
    );


    element.setAttribute(
      "data-shobdo-seo",
      "true"
    );


    document.head.appendChild(
      element
    );

  }


  const previousHref =
    element.getAttribute(
      "href"
    );


  element.setAttribute(
    "href",
    canonicalUrl
  );


  return () => {

    if (!element) {
      return;
    }


    if (!existed) {

      element.remove();

      return;

    }


    if (
      previousHref === null
    ) {

      element.removeAttribute(
        "href"
      );

      return;

    }


    element.setAttribute(
      "href",
      previousHref
    );

  };

}


// =========================================================
// SEO COMPONENT
// =========================================================

function SEO({

  title = "",

  description =
    DEFAULT_DESCRIPTION,

  path = "",

  type =
    "website",

  image = "",

  noIndex =
    false,

  author = "",

  publishedTime = "",

  modifiedTime = "",

}) {

  const {
    language,
  } = useLanguage();


  // =======================================================
  // CURRENT LANGUAGE
  // =======================================================

  const currentLanguage =
    HTML_LANGUAGES[
      language
    ] ||
    "bn";


  const currentLocale =
    OPEN_GRAPH_LOCALES[
      language
    ] ||
    "bn_IN";


  // =======================================================
  // SITE URL
  // =======================================================

  const siteUrl =
    useMemo(
      () => getSiteUrl(),
      []
    );


  // =======================================================
  // PAGE TITLE
  // =======================================================

  const pageTitle =
    useMemo(
      () => {

        const safeTitle =
          cleanString(
            title
          );


        if (!safeTitle) {
          return SITE_NAME;
        }


        if (
          safeTitle
            .toLowerCase()
            .includes(
              SITE_NAME.toLowerCase()
            )
        ) {

          return safeTitle;

        }


        return (
          `${safeTitle} | ${SITE_NAME}`
        );

      },
      [
        title,
      ]
    );


  // =======================================================
  // DESCRIPTION
  // =======================================================

  const pageDescription =
    cleanString(
      description
    ) ||
    DEFAULT_DESCRIPTION;


  // =======================================================
  // CANONICAL
  // =======================================================

  const canonicalUrl =
    useMemo(
      () => {

        if (
          !siteUrl ||
          !path
        ) {

          return "";

        }


        return (
          `${siteUrl}/` +
          String(
            path
          ).replace(
            /^\/+/,
            ""
          )
        );

      },
      [
        siteUrl,
        path,
      ]
    );


  // =======================================================
  // OG IMAGE
  // =======================================================

  const defaultOgImage =
    cleanString(
      import.meta.env.VITE_DEFAULT_OG_IMAGE
    );


  const socialImage =
    makeAbsoluteUrl(
      image ||
      defaultOgImage,
      siteUrl
    );


  // =======================================================
  // EFFECT
  // =======================================================

  useEffect(
    () => {

      const cleanupFunctions =
        [];


      // ===================================================
      // DOCUMENT TITLE
      // ===================================================

      const previousTitle =
        document.title;


      document.title =
        pageTitle;


      cleanupFunctions.push(
        () => {

          document.title =
            previousTitle;

        }
      );


      // ===================================================
      // HTML LANGUAGE
      // ===================================================

      const html =
        document.documentElement;


      const previousLanguage =
        html.getAttribute(
          "lang"
        );


      html.setAttribute(
        "lang",
        currentLanguage
      );


      cleanupFunctions.push(
        () => {

          if (
            previousLanguage
          ) {

            html.setAttribute(
              "lang",
              previousLanguage
            );

          } else {

            html.removeAttribute(
              "lang"
            );

          }

        }
      );


      // ===================================================
      // DESCRIPTION
      // ===================================================

      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "description",

          content:
            pageDescription,
        })
      );


      // ===================================================
      // ROBOTS
      // ===================================================

      const robotsValue =
        noIndex
          ? "noindex, nofollow"
          : "index, follow";


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "robots",

          content:
            robotsValue,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "googlebot",

          content:
            robotsValue,
        })
      );


      // ===================================================
      // OPEN GRAPH
      // ===================================================

      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "property",

          key:
            "og:type",

          content:
            type,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "property",

          key:
            "og:site_name",

          content:
            SITE_NAME,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "property",

          key:
            "og:title",

          content:
            pageTitle,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "property",

          key:
            "og:description",

          content:
            pageDescription,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "property",

          key:
            "og:locale",

          content:
            currentLocale,
        })
      );


      if (
        canonicalUrl
      ) {

        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "property",

            key:
              "og:url",

            content:
              canonicalUrl,
          })
        );

      }


      if (
        socialImage
      ) {

        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "property",

            key:
              "og:image",

            content:
              socialImage,
          })
        );


        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "property",

            key:
              "og:image:alt",

            content:
              `${SITE_NAME} social preview`,
          })
        );

      }


      // ===================================================
      // TWITTER / X
      // ===================================================

      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "twitter:card",

          content:
            socialImage
              ? "summary_large_image"
              : "summary",
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "twitter:title",

          content:
            pageTitle,
        })
      );


      cleanupFunctions.push(
        setMetaTag({
          attribute:
            "name",

          key:
            "twitter:description",

          content:
            pageDescription,
        })
      );


      if (
        socialImage
      ) {

        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "name",

            key:
              "twitter:image",

            content:
              socialImage,
          })
        );

      }


      // ===================================================
      // AUTHOR
      // ===================================================

      if (
        cleanString(
          author
        )
      ) {

        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "name",

            key:
              "author",

            content:
              cleanString(
                author
              ),
          })
        );

      }


      // ===================================================
      // ARTICLE METADATA
      // ===================================================

      if (
        type ===
        "article"
      ) {

        if (
          publishedTime
        ) {

          cleanupFunctions.push(
            setMetaTag({
              attribute:
                "property",

              key:
                "article:published_time",

              content:
                publishedTime,
            })
          );

        }


        if (
          modifiedTime
        ) {

          cleanupFunctions.push(
            setMetaTag({
              attribute:
                "property",

              key:
                "article:modified_time",

              content:
                modifiedTime,
            })
          );

        }


        if (
          author
        ) {

          cleanupFunctions.push(
            setMetaTag({
              attribute:
                "property",

              key:
                "article:author",

              content:
                cleanString(
                  author
                ),
            })
          );

        }

      }


      // ===================================================
      // CANONICAL
      // ===================================================

      if (
        canonicalUrl
      ) {

        cleanupFunctions.push(
          setCanonical(
            canonicalUrl
          )
        );

      }


      // ===================================================
      // CLEANUP
      // ===================================================

      return () => {

        cleanupFunctions
          .filter(
            Boolean
          )
          .reverse()
          .forEach(
            (
              cleanup
            ) => {

              cleanup();

            }
          );

      };

    },
    [
      author,
      canonicalUrl,
      currentLanguage,
      currentLocale,
      modifiedTime,
      noIndex,
      pageDescription,
      pageTitle,
      publishedTime,
      socialImage,
      type,
    ]
  );


  return null;

}


export default SEO;