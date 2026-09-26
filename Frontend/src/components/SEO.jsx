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
// CLEAN STRUCTURED DATA
// =========================================================

function cleanStructuredData(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return undefined;

  }


  if (
    Array.isArray(
      value
    )
  ) {

    const cleanedArray =
      value
        .map(
          cleanStructuredData
        )
        .filter(
          (
            item
          ) =>
            item !== undefined
        );


    return cleanedArray.length
      ? cleanedArray
      : undefined;

  }


  if (
    typeof value ===
    "object"
  ) {

    const cleanedObject =
      {};


    Object
      .entries(
        value
      )
      .forEach(
        ([
          key,
          itemValue,
        ]) => {

          const cleanedValue =
            cleanStructuredData(
              itemValue
            );


          if (
            cleanedValue !==
            undefined
          ) {

            cleanedObject[
              key
            ] =
              cleanedValue;

          }

        }
      );


    return Object
      .keys(
        cleanedObject
      )
      .length

      ? cleanedObject

      : undefined;

  }


  if (
    typeof value ===
    "string"
  ) {

    const cleaned =
      value.trim();


    return cleaned
      ? cleaned
      : undefined;

  }


  return value;

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
    document
      .head
      .querySelector(
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


    document
      .head
      .appendChild(
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
      previousContent ===
      null
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
    document
      .head
      .querySelector(
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


    document
      .head
      .appendChild(
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
      previousHref ===
      null
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
// JSON-LD MANAGER
// =========================================================

function setStructuredData(
  structuredData
) {

  const cleanedData =
    cleanStructuredData(
      structuredData
    );


  if (!cleanedData) {
    return null;
  }


  let element =
    document
      .head
      .querySelector(
        'script[data-shobdo-jsonld="true"]'
      );


  const existed =
    Boolean(
      element
    );


  if (!element) {

    element =
      document.createElement(
        "script"
      );


    element.type =
      "application/ld+json";


    element.setAttribute(
      "data-shobdo-jsonld",
      "true"
    );


    document
      .head
      .appendChild(
        element
      );

  }


  const previousContent =
    element.textContent;


  try {

    element.textContent =
      JSON.stringify(
        cleanedData
      );

  } catch (
    error
  ) {

    console.error(
      "SHOBDO JSON-LD ERROR:",
      error
    );


    if (!existed) {
      element.remove();
    }


    return null;

  }


  return () => {

    if (!element) {
      return;
    }


    if (!existed) {

      element.remove();

      return;

    }


    element.textContent =
      previousContent || "";

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

  imageAlt = "",

  noIndex =
    false,

  author = "",

  publishedTime = "",

  modifiedTime = "",

  structuredData =
    null,

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
      () =>
        getSiteUrl(),
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
              SITE_NAME
                .toLowerCase()
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
  // CANONICAL URL
  // =======================================================

  const canonicalUrl =
    useMemo(
      () => {

        if (!siteUrl) {
          return "";
        }


        if (!path) {
          return `${siteUrl}/`;
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
  // SOCIAL IMAGE
  // =======================================================

  const defaultOgImage =
    cleanString(
      import.meta.env
        .VITE_DEFAULT_OG_IMAGE
    );


  const socialImage =
    makeAbsoluteUrl(
      image ||
      defaultOgImage,
      siteUrl
    );


  const socialImageAlt =
    cleanString(
      imageAlt
    ) ||
    (
      title
        ? `${cleanString(title)} on ${SITE_NAME}`
        : `${SITE_NAME} social preview`
    );


  // =======================================================
  // STRUCTURED DATA
  // =======================================================

  const finalStructuredData =
    useMemo(
      () => {

        if (
          !structuredData ||
          noIndex
        ) {

          return null;

        }


        const data =
          typeof structuredData ===
          "function"

            ? structuredData({
                siteUrl,
                canonicalUrl,
                pageTitle,
                pageDescription,
                socialImage,
                language:
                  currentLanguage,
              })

            : structuredData;


        if (!data) {
          return null;
        }


        if (
          Array.isArray(
            data
          )
        ) {

          return {
            "@context":
              "https://schema.org",

            "@graph":
              data,
          };

        }


        if (
          typeof data ===
          "object" &&
          !data["@context"]
        ) {

          return {
            "@context":
              "https://schema.org",

            ...data,
          };

        }


        return data;

      },
      [
        structuredData,
        noIndex,
        siteUrl,
        canonicalUrl,
        pageTitle,
        pageDescription,
        socialImage,
        currentLanguage,
      ]
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
        document
          .documentElement;


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

          : "index, follow, max-image-preview:large";


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
              socialImageAlt,
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


        cleanupFunctions.push(
          setMetaTag({
            attribute:
              "name",

            key:
              "twitter:image:alt",

            content:
              socialImageAlt,
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
      // JSON-LD STRUCTURED DATA
      // ===================================================

      if (
        finalStructuredData
      ) {

        cleanupFunctions.push(
          setStructuredData(
            finalStructuredData
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

              try {

                cleanup();

              } catch (
                error
              ) {

                console.error(
                  "SHOBDO SEO CLEANUP ERROR:",
                  error
                );

              }

            }
          );

      };

    },
    [
      author,
      canonicalUrl,
      currentLanguage,
      currentLocale,
      finalStructuredData,
      modifiedTime,
      noIndex,
      pageDescription,
      pageTitle,
      publishedTime,
      socialImage,
      socialImageAlt,
      type,
    ]
  );


  return null;

}


export default SEO;