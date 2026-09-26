const SITE_URL = "https://shobdoverse.com";
const API_URL = "https://shobdo-cosmos.onrender.com";


function escapeHtml(value = "") {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function stripHtml(value = "") {

  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}


function truncate(value = "", maxLength = 160) {

  const clean =
    stripHtml(value);

  const characters =
    Array.from(clean);

  if (
    characters.length <=
    maxLength
  ) {
    return clean;
  }

  return (
    characters
      .slice(
        0,
        maxLength - 1
      )
      .join("")
      .trimEnd()
    +
    "?"
  );

}


function safeJson(value) {

  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

}


function replaceTitle(
  html,
  title
) {

  const safeTitle =
    escapeHtml(title);

  if (
    /<title>[\s\S]*?<\/title>/i
      .test(html)
  ) {

    return html.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${safeTitle}</title>`
    );

  }

  return html.replace(
    /<head([^>]*)>/i,
    `<head$1><title>${safeTitle}</title>`
  );

}


function removeExistingSeo(
  html
) {

  return html

    .replace(
      /<meta[^>]+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
      ""
    )

    .replace(
      /<link[^>]+rel=["']canonical["'][^>]*>\s*/gi,
      ""
    )

    .replace(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
      ""
    );

}


async function getSpaHtml(
  request,
  env
) {

  const indexUrl =
    new URL(
      "/",
      request.url
    );

  const assetResponse =
    await env.ASSETS.fetch(
      new Request(
        indexUrl.toString(),
        {
          method: "GET",
          headers: request.headers,
        }
      )
    );

  return {
    response:
      assetResponse,

    html:
      await assetResponse.text(),
  };

}


export async function onRequestGet(
  context
) {

  const {
    request,
    env,
    params,
  } = context;


  const writingId =
    String(
      params.id ||
      ""
    )
      .trim();


  if (
    !/^\d+$/.test(
      writingId
    )
  ) {

    return new Response(
      "Not found",
      {
        status: 404,
      }
    );

  }


  const canonicalUrl =
    `${SITE_URL}/writings/${writingId}`;


  let writing = null;


  try {

    const apiResponse =
      await fetch(
        `${API_URL}/api/writings/${writingId}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );


    if (
      apiResponse.status ===
      404
    ) {

      return new Response(
        "Writing not found",
        {
          status: 404,
        }
      );

    }


    if (
      !apiResponse.ok
    ) {

      throw new Error(
        `Writing API returned ${apiResponse.status}`
      );

    }


    writing =
      await apiResponse.json();


  } catch (error) {

    console.error(
      "SHOBDO WRITING SEO API ERROR:",
      error
    );


    return env.ASSETS.fetch(
      request
    );

  }


  if (
    !writing ||
    writing.status !==
      "published"
  ) {

    return new Response(
      "Writing not found",
      {
        status: 404,
      }
    );

  }


  const title =
    stripHtml(
      writing.title ||
      "Writing"
    );


  const pageTitle =
    `${title} | SHOBDO`;


  const description =
    truncate(
      writing.content ||
      `${title} on SHOBDO`,
      160
    );


  const authorName =
    stripHtml(
      writing.author_name ||
      writing.author?.name ||
      "SHOBDO Writer"
    );


  const authorId =
    writing.author_id ||
    writing.user_id ||
    writing.author?.id ||
    null;


  const language =
    String(
      writing.language ||
      "en"
    )
      .trim();


  const category =
    stripHtml(
      writing.category ||
      ""
    );


  const publishedAt =
    writing.published_at ||
    writing.created_at ||
    null;


  const modifiedAt =
    writing.updated_at ||
    writing.published_at ||
    writing.created_at ||
    null;


  const structuredData = {

    "@context":
      "https://schema.org",

    "@type":
      "Article",

    "@id":
      `${canonicalUrl}#article`,

    url:
      canonicalUrl,

    mainEntityOfPage: {

      "@type":
        "WebPage",

      "@id":
        canonicalUrl,

    },

    headline:
      title,

    description,

    inLanguage:
      language,

    ...(category
      ? {
          articleSection:
            category,
        }
      : {}),

    isAccessibleForFree:
      true,

    author: {

      "@type":
        "Person",

      name:
        authorName,

      ...(authorId
        ? {
            url:
              `${SITE_URL}/users/${authorId}`,
          }
        : {}),

    },

    publisher: {

      "@type":
        "Organization",

      "@id":
        `${SITE_URL}/#organization`,

      name:
        "SHOBDO",

      url:
        `${SITE_URL}/`,

    },

    ...(publishedAt
      ? {
          datePublished:
            publishedAt,
        }
      : {}),

    ...(modifiedAt
      ? {
          dateModified:
            modifiedAt,
        }
      : {}),

  };


  const {
    response: assetResponse,
    html: rawHtml,
  } =
    await getSpaHtml(
      request,
      env
    );


  let html =
    removeExistingSeo(
      rawHtml
    );


  html =
    replaceTitle(
      html,
      pageTitle
    );


  const seoTags = `
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">

    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="SHOBDO">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonicalUrl}">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">

    ${publishedAt
      ? `<meta property="article:published_time" content="${escapeHtml(publishedAt)}">`
      : ""}

    ${modifiedAt
      ? `<meta property="article:modified_time" content="${escapeHtml(modifiedAt)}">`
      : ""}

    <script
      type="application/ld+json"
      data-shobdo-edge-seo="true"
    >${safeJson(structuredData)}</script>
  `;


  html =
    html.replace(
      /<\/head>/i,
      `${seoTags}</head>`
    );


  const headers =
    new Headers(
      assetResponse.headers
    );


  headers.set(
    "Content-Type",
    "text/html; charset=UTF-8"
  );


  headers.set(
    "X-SHOBDO-SEO",
    "writing-edge"
  );


  headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300"
  );


  return new Response(
    html,
    {
      status: 200,
      headers,
    }
  );

}
