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


  const userId =
    String(
      params.id ||
      ""
    )
      .trim();


  if (
    !/^\d+$/.test(
      userId
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
    `${SITE_URL}/users/${userId}`;


  let payload = null;


  try {

    const apiResponse =
      await fetch(
        `${API_URL}/api/users/${userId}`,
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
        "Writer not found",
        {
          status: 404,
        }
      );

    }


    if (
      !apiResponse.ok
    ) {

      throw new Error(
        `User API returned ${apiResponse.status}`
      );

    }


    payload =
      await apiResponse.json();


  } catch (error) {

    console.error(
      "SHOBDO PROFILE SEO API ERROR:",
      error
    );


    return env.ASSETS.fetch(
      request
    );

  }


  const user =
    payload?.user;


  if (
    !payload?.success ||
    !user
  ) {

    return new Response(
      "Writer not found",
      {
        status: 404,
      }
    );

  }


  const profileName =
    stripHtml(
      user.name ||
      user.username ||
      "SHOBDO Writer"
    );


  const username =
    String(
      user.username ||
      ""
    )
      .trim()
      .replace(
        /^@+/,
        ""
      );


  const pageTitle =
    username
      ? `${profileName} (@${username}) | SHOBDO`
      : `${profileName} | SHOBDO`;


  const fallbackDescription =
    `Discover ${profileName}'s published writings, profile and creative work on SHOBDO.`;


  const description =
    truncate(
      user.bio ||
      fallbackDescription,
      160
    );


  const personId =
    `${canonicalUrl}#person`;


  const profilePage = {

    "@type":
      "ProfilePage",

    "@id":
      `${canonicalUrl}#profilepage`,

    url:
      canonicalUrl,

    name:
      pageTitle,

    description,

    mainEntity: {

      "@id":
        personId,

    },

  };


  const person = {

    "@type":
      "Person",

    "@id":
      personId,

    name:
      profileName,

    url:
      canonicalUrl,

    identifier:
      username ||
      String(
        user.id ||
        userId
      ),

    ...(username
      ? {
          alternateName:
            `@${username}`,
        }
      : {}),

    ...(user.bio
      ? {
          description:
            stripHtml(
              user.bio
            ),
        }
      : {}),

    ...(user.avatar_url
      ? {
          image:
            user.avatar_url,
        }
      : {}),

    ...(user.website
      ? {
          sameAs: [
            user.website,
          ],
        }
      : {}),

    ...(user.location
      ? {
          homeLocation: {

            "@type":
              "Place",

            name:
              stripHtml(
                user.location
              ),

          },
        }
      : {}),

  };


  const structuredData = {

    "@context":
      "https://schema.org",

    "@graph": [

      profilePage,

      person,

    ],

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


  const imageTags =
    user.avatar_url
      ? `
        <meta property="og:image" content="${escapeHtml(user.avatar_url)}">
        <meta name="twitter:image" content="${escapeHtml(user.avatar_url)}">
      `
      : "";


  const seoTags = `
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">

    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:type" content="profile">
    <meta property="og:site_name" content="SHOBDO">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonicalUrl}">
    ${imageTags}

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">

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
    "profile-edge"
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
