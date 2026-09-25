// =========================================================
// SHOBDO DYNAMIC SITEMAP
//
// Public URL:
// https://shobdoverse.com/sitemap.xml
//
// Dynamic source:
// https://shobdo-cosmos.onrender.com/api/seo/sitemap.xml
// =========================================================

const SITEMAP_SOURCE =
  "https://shobdo-cosmos.onrender.com/api/seo/sitemap.xml";


// =========================================================
// FALLBACK SITEMAP
// =========================================================

const FALLBACK_SITEMAP =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shobdoverse.com/</loc>
  </url>

  <url>
    <loc>https://shobdoverse.com/explore</loc>
  </url>

  <url>
    <loc>https://shobdoverse.com/about</loc>
  </url>

  <url>
    <loc>https://shobdoverse.com/privacy</loc>
  </url>

  <url>
    <loc>https://shobdoverse.com/terms</loc>
  </url>

  <url>
    <loc>https://shobdoverse.com/data-deletion</loc>
  </url>
</urlset>`;


// =========================================================
// HEADERS
// =========================================================

function createHeaders(source) {

  return {
    "Content-Type":
      "application/xml; charset=UTF-8",

    "Cache-Control":
      "public, max-age=300",

    "X-Content-Type-Options":
      "nosniff",

    "X-SHOBDO-Sitemap-Source":
      source,
  };

}


// =========================================================
// REQUEST HANDLER
// =========================================================

export async function onRequest(context) {

  const request =
    context.request;


  // =======================================================
  // ONLY GET / HEAD
  // =======================================================

  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {

    return new Response(
      "Method Not Allowed",
      {
        status: 405,

        headers: {
          Allow:
            "GET, HEAD",
        },
      }
    );

  }


  try {

    // =====================================================
    // FETCH LIVE SITEMAP FROM RENDER
    // =====================================================

    const upstream =
      await fetch(
        SITEMAP_SOURCE,
        {
          method: "GET",

          headers: {
            Accept:
              "application/xml,text/xml;q=0.9,*/*;q=0.8",
          },
        }
      );


    if (
      !upstream.ok
    ) {

      throw new Error(
        `Sitemap backend returned ${upstream.status}`
      );

    }


    const xml =
      await upstream.text();


    // =====================================================
    // BASIC XML VALIDATION
    // =====================================================

    if (
      !xml.includes("<urlset") ||
      !xml.includes("</urlset>")
    ) {

      throw new Error(
        "Invalid sitemap response"
      );

    }


    // =====================================================
    // HEAD
    // =====================================================

    if (
      request.method === "HEAD"
    ) {

      return new Response(
        null,
        {
          status: 200,
          headers:
            createHeaders("dynamic"),
        }
      );

    }


    // =====================================================
    // GET
    // =====================================================

    return new Response(
      xml,
      {
        status: 200,
        headers:
          createHeaders("dynamic"),
      }
    );


  } catch (error) {

    console.error(
      "SHOBDO sitemap error:",
      error
    );


    // =====================================================
    // SAFE FALLBACK
    // =====================================================

    if (
      request.method === "HEAD"
    ) {

      return new Response(
        null,
        {
          status: 200,
          headers:
            createHeaders("fallback"),
        }
      );

    }


    return new Response(
      FALLBACK_SITEMAP,
      {
        status: 200,
        headers:
          createHeaders("fallback"),
      }
    );

  }

}