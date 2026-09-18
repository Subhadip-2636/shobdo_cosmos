# =========================================================
# SHOBDO TRENDING ROUTES
# =========================================================

from datetime import datetime, timedelta, timezone

from flask import (
    Blueprint,
    jsonify,
    request,
)

from database import db

from models.writing import Writing
from models.tag import (
    Tag,
    writing_tags,
)


# =========================================================
# BLUEPRINT
# =========================================================

trending_bp = Blueprint(
    "trending",
    __name__,
    url_prefix="/api/trending",
)


# =========================================================
# CONSTANTS
# =========================================================

DEFAULT_LIMIT = 8

MAX_LIMIT = 20

DEFAULT_PERIOD_DAYS = 7

ALLOWED_PERIODS = {
    1,
    7,
    30,
    90,
}


# =========================================================
# HELPERS
# =========================================================

def error_response(
    message,
    status_code=400,
):

    return (
        jsonify({
            "success": False,
            "message": message,
        }),
        status_code,
    )


# =========================================================


def parse_limit():

    try:

        limit = int(
            request.args.get(
                "limit",
                DEFAULT_LIMIT,
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        limit = DEFAULT_LIMIT


    return min(
        max(
            limit,
            1,
        ),
        MAX_LIMIT,
    )


# =========================================================


def parse_period_days():

    raw_period = (
        request.args.get(
            "period",
            str(
                DEFAULT_PERIOD_DAYS
            ),
        )
        or ""
    ).strip().lower()


    if raw_period in {
        "all",
        "all-time",
        "all_time",
    }:

        return None


    try:

        period_days = int(
            raw_period
        )

    except (
        TypeError,
        ValueError,
    ):

        period_days = (
            DEFAULT_PERIOD_DAYS
        )


    if (
        period_days
        not in
        ALLOWED_PERIODS
    ):

        period_days = (
            DEFAULT_PERIOD_DAYS
        )


    return period_days


# =========================================================
# BUILD TRENDING QUERY
# =========================================================

def build_trending_query(
    period_days,
):

    query = (
        db.session.query(
            Tag.id.label(
                "tag_id"
            ),
            Tag.name.label(
                "tag_name"
            ),
            db.func.count(
                db.distinct(
                    Writing.id
                )
            ).label(
                "writings_count"
            ),
            db.func.max(
                Writing.published_at
            ).label(
                "latest_published_at"
            ),
        )

        .select_from(
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
            "published"
        )
    )


    if (
        period_days
        is not None
    ):

        cutoff = (
            datetime.now(
                timezone.utc
            )
            -
            timedelta(
                days=period_days
            )
        )


        query = query.filter(
            Writing.published_at
            >=
            cutoff
        )


    return (
        query
        .group_by(
            Tag.id,
            Tag.name,
        )
    )


# =========================================================
# SERIALIZE TRENDING TOPIC
# =========================================================

def serialize_topic(
    row,
    rank,
):

    tag_name = str(
        row.tag_name
        or ""
    )


    writings_count = int(
        row.writings_count
        or 0
    )


    latest_published_at = (
        row.latest_published_at
    )


    return {

        "rank":
            rank,

        "id":
            row.tag_id,

        "name":
            tag_name,

        "hashtag":
            f"#{tag_name}",

        "writings_count":
            writings_count,

        "latest_published_at":
            (
                latest_published_at
                .isoformat()

                if latest_published_at

                else None
            ),

    }


# =========================================================
# GET TRENDING TOPICS
#
# GET /api/trending/topics
#
# Examples:
#
# /api/trending/topics
#
# /api/trending/topics?limit=5
#
# /api/trending/topics?period=7
#
# /api/trending/topics?period=30&limit=10
#
# /api/trending/topics?period=all
# =========================================================

@trending_bp.route(
    "/topics",
    methods=["GET"],
)
def get_trending_topics():

    try:

        limit = (
            parse_limit()
        )


        period_days = (
            parse_period_days()
        )


        query = (
            build_trending_query(
                period_days
            )
        )


        rows = (
            query
            .order_by(
                db.desc(
                    "writings_count"
                ),
                db.desc(
                    "latest_published_at"
                ),
                Tag.name.asc(),
            )
            .limit(
                limit
            )
            .all()
        )


        # =================================================
        # FALLBACK
        #
        # If no hashtags have been used during the selected
        # recent period, use all-time published hashtag data.
        # =================================================

        fallback_used = False


        if (
            not rows
            and
            period_days is not None
        ):

            fallback_used = True


            rows = (
                build_trending_query(
                    None
                )
                .order_by(
                    db.desc(
                        "writings_count"
                    ),
                    db.desc(
                        "latest_published_at"
                    ),
                    Tag.name.asc(),
                )
                .limit(
                    limit
                )
                .all()
            )


        topics = [

            serialize_topic(
                row,
                index + 1,
            )

            for index, row
            in enumerate(
                rows
            )

        ]


        return jsonify({

            "success":
                True,

            "period_days":
                period_days,

            "fallback_used":
                fallback_used,

            "limit":
                limit,

            "total":
                len(
                    topics
                ),

            "topics":
                topics,

        }), 200


    except Exception as error:

        print(
            "GET TRENDING TOPICS ERROR:",
            error,
        )


        return error_response(
            "Unable to load trending topics.",
            500,
        )


# =========================================================
# GET ONE TAG SUMMARY
#
# GET /api/trending/topics/<tag_name>
# =========================================================

@trending_bp.route(
    "/topics/<path:tag_name>",
    methods=["GET"],
)
def get_topic_summary(
    tag_name,
):

    try:

        normalized_name = (
            str(
                tag_name
                or ""
            )
            .strip()
        )


        if normalized_name.startswith(
            "#"
        ):

            normalized_name = (
                normalized_name[
                    1:
                ]
                .strip()
            )


        if not normalized_name:

            return error_response(
                "Tag name is required.",
                400,
            )


        tag = (
            Tag.query
            .filter(
                db.func.lower(
                    Tag.name
                )
                ==
                normalized_name.lower()
            )
            .first()
        )


        if tag is None:

            return error_response(
                "Tag not found.",
                404,
            )


        published_count = (
            db.session.query(
                db.func.count(
                    db.distinct(
                        Writing.id
                    )
                )
            )
            .select_from(
                Writing
            )
            .join(
                writing_tags,
                writing_tags.c.writing_id
                ==
                Writing.id,
            )
            .filter(
                writing_tags.c.tag_id
                ==
                tag.id,
                Writing.status
                ==
                "published",
            )
            .scalar()
            or 0
        )


        latest_writing = (
            Writing.query
            .join(
                writing_tags,
                writing_tags.c.writing_id
                ==
                Writing.id,
            )
            .filter(
                writing_tags.c.tag_id
                ==
                tag.id,
                Writing.status
                ==
                "published",
            )
            .order_by(
                Writing.published_at.desc(),
                Writing.created_at.desc(),
            )
            .first()
        )


        return jsonify({

            "success":
                True,

            "topic": {

                "id":
                    tag.id,

                "name":
                    tag.name,

                "hashtag":
                    f"#{tag.name}",

                "writings_count":
                    int(
                        published_count
                    ),

                "latest_published_at":
                    (
                        latest_writing
                        .published_at
                        .isoformat()

                        if (
                            latest_writing
                            and
                            latest_writing.published_at
                        )

                        else None
                    ),

            },

        }), 200


    except Exception as error:

        print(
            "GET TOPIC SUMMARY ERROR:",
            error,
        )


        return error_response(
            "Unable to load this topic.",
            500,
        )