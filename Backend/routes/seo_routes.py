# =========================================================
# SHOBDO SEO ROUTES
# =========================================================

from urllib.parse import quote
from xml.sax.saxutils import escape

from flask import (
    Blueprint,
    Response,
)

from extensions import db

from models.user import User
from models.writing import Writing
from models.tag import (
    Tag,
    writing_tags,
)


# =========================================================
# BLUEPRINT
# =========================================================

seo_bp = Blueprint(
    "seo",
    __name__,
    url_prefix="/api/seo",
)


# =========================================================
# CANONICAL PUBLIC WEBSITE
# =========================================================

SITE_URL = "https://shobdoverse.com"


# =========================================================
# STATIC PUBLIC PAGES
# =========================================================

STATIC_PUBLIC_PATHS = [
    "/",
    "/explore",
    "/about",
    "/privacy",
    "/terms",
    "/data-deletion",
    "/videos",
    "/reels",
]


# =========================================================
# HELPERS
# =========================================================

def format_lastmod(value):
    """
    Convert a datetime/date value into a sitemap-compatible
    YYYY-MM-DD value.
    """

    if not value:
        return None


    try:

        return value.date().isoformat()

    except AttributeError:

        try:

            return value.isoformat()

        except Exception:

            return None


# =========================================================


def build_url_entry(
    url,
    lastmod=None,
):
    """
    Build one <url> entry.
    """

    safe_url = escape(
        str(
            url
        )
    )


    lines = [
        "  <url>",
        f"    <loc>{safe_url}</loc>",
    ]


    if lastmod:

        lines.append(
            f"    <lastmod>{escape(str(lastmod))}</lastmod>"
        )


    lines.append(
        "  </url>"
    )


    return "\n".join(
        lines
    )


# =========================================================
# DYNAMIC SITEMAP
#
# GET /api/seo/sitemap.xml
# =========================================================

@seo_bp.route(
    "/sitemap.xml",
    methods=[
        "GET",
    ],
)
def sitemap():

    # =====================================================
    # URL COLLECTION
    # =====================================================

    entries = []

    seen_urls = set()


    def add_url(
        url,
        lastmod=None,
    ):

        if not url:
            return


        url = str(
            url
        ).strip()


        if not url:
            return


        if url in seen_urls:
            return


        seen_urls.add(
            url
        )


        entries.append(
            build_url_entry(
                url=url,
                lastmod=lastmod,
            )
        )


    # =====================================================
    # STATIC PUBLIC PAGES
    # =====================================================

    for path in STATIC_PUBLIC_PATHS:

        if path == "/":

            page_url = (
                f"{SITE_URL}/"
            )

        else:

            page_url = (
                f"{SITE_URL}{path}"
            )


        add_url(
            page_url
        )


    # =====================================================
    # PUBLIC WRITINGS
    #
    # Only:
    #
    # - published
    # - not deleted
    # =====================================================

    writings = (

        Writing.query

        .filter(

            Writing.status
            ==
            "published",

            Writing.deleted_at.is_(
                None
            ),

        )

        .order_by(
            Writing.id.asc()
        )

        .all()

    )


    for writing in writings:

        lastmod = (

            writing.updated_at

            or

            writing.published_at

            or

            writing.created_at

        )


        add_url(

            f"{SITE_URL}/writings/{writing.id}",

            format_lastmod(
                lastmod
            ),

        )


    # =====================================================
    # PUBLIC WRITER PROFILES
    #
    # Include:
    #
    # - active users
    # - users with at least one published writing
    #
    # This avoids indexing empty/thin profile pages.
    # =====================================================

    writers = (

        db.session.query(
            User
        )

        .join(

            Writing,

            Writing.user_id
            ==
            User.id,

        )

        .filter(

            User.is_active.is_(
                True
            ),

            Writing.status
            ==
            "published",

            Writing.deleted_at.is_(
                None
            ),

        )

        .distinct()

        .order_by(
            User.id.asc()
        )

        .all()

    )


    for user in writers:

        add_url(

            f"{SITE_URL}/users/{user.id}",

            format_lastmod(
                user.updated_at
                or
                user.created_at
            ),

        )


    # =====================================================
    # PUBLIC TAG PAGES
    #
    # Include only tags connected to at least one
    # published, non-deleted writing.
    # =====================================================

    tags = (

        db.session.query(
            Tag
        )

        .join(

            writing_tags,

            writing_tags.c.tag_id
            ==
            Tag.id,

        )

        .join(

            Writing,

            Writing.id
            ==
            writing_tags.c.writing_id,

        )

        .filter(

            Writing.status
            ==
            "published",

            Writing.deleted_at.is_(
                None
            ),

        )

        .distinct()

        .order_by(
            Tag.name.asc()
        )

        .all()

    )


    for tag in tags:

        safe_tag = quote(
            str(
                tag.name
            ),
            safe="",
        )


        add_url(
            f"{SITE_URL}/tag/{safe_tag}"
        )


    # =====================================================
    # XML DOCUMENT
    # =====================================================

    xml = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',

            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

            *entries,

            "</urlset>",
        ]
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    response = Response(

        xml,

        status=200,

        content_type=
            "application/xml; charset=UTF-8",

    )


    # -----------------------------------------------------
    # Short cache:
    #
    # Google does not need a brand-new DB query every second,
    # while new SHOBDO content will still enter the sitemap
    # reasonably quickly.
    # -----------------------------------------------------

    response.headers[
        "Cache-Control"
    ] = (
        "public, max-age=300"
    )


    return response