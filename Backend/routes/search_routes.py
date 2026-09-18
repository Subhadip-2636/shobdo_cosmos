# ============================================================
# SHOBDO GLOBAL SEARCH
#
# GET:
#
# /api/search?q=poetry
# /api/search?q=subhadip&type=writers
# /api/search?q=কবিতা&type=writings
#
# Supported types:
#
# all
# writers
# writings
#
# ============================================================


from flask import (
    Blueprint,
    jsonify,
    request,
)


from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)


from sqlalchemy import (
    case,
    func,
    or_,
)


from extensions import db


from models.user import User
from models.writing import Writing
from models.follow import Follow



# ============================================================
# BLUEPRINT
# ============================================================


search_bp = Blueprint(
    "search",
    __name__,
    url_prefix="/api/search",
)



# ============================================================
# CONSTANTS
# ============================================================


ALLOWED_TYPES = {
    "all",
    "writers",
    "writings",
}


DEFAULT_PAGE = 1

DEFAULT_LIMIT = 12

MAX_LIMIT = 30

MAX_QUERY_LENGTH = 120



# ============================================================
# OPTIONAL CURRENT USER
# ============================================================


def get_optional_user_id():

    identity = (
        get_jwt_identity()
    )


    if identity is None:

        return None


    try:

        return int(
            identity
        )


    except (
        TypeError,
        ValueError,
    ):

        return None



# ============================================================
# PUBLIC USER SERIALIZER
# ============================================================


def serialize_writer(
    user,
    current_user_id=None,
    following_user_ids=None,
):

    following_user_ids = (
        following_user_ids
        or set()
    )


    is_self = bool(
        current_user_id
        and
        int(current_user_id)
        ==
        int(user.id)
    )


    following = bool(
        not is_self
        and
        user.id
        in following_user_ids
    )


    return {

        "id":
            user.id,

        "name":
            user.name,

        "username":
            getattr(
                user,
                "username",
                None,
            ),

        "bio":
            getattr(
                user,
                "bio",
                None,
            ),

        "avatar_url":
            getattr(
                user,
                "avatar_url",
                None,
            ),

        "location":
            getattr(
                user,
                "location",
                None,
            ),

        "website":
            getattr(
                user,
                "website",
                None,
            ),

        "created_at":
            (
                user.created_at.isoformat()
                if getattr(
                    user,
                    "created_at",
                    None,
                )
                else None
            ),

        "following":
            following,

        "is_self":
            is_self,

    }



# ============================================================
# WRITING AUTHOR
# ============================================================


def get_writing_author(
    writing
):

    author = getattr(
        writing,
        "author",
        None,
    )


    if author is None:

        author = getattr(
            writing,
            "user",
            None,
        )


    return author



# ============================================================
# WRITING SERIALIZER
# ============================================================


def serialize_writing(
    writing
):

    author = (
        get_writing_author(
            writing
        )
    )


    likes = getattr(
        writing,
        "likes",
        [],
    )


    comments = getattr(
        writing,
        "comments",
        [],
    )


    try:

        likes_count = len(
            likes
        )

    except TypeError:

        likes_count = int(
            getattr(
                writing,
                "likes_count",
                0,
            )
            or 0
        )


    try:

        comments_count = len(
            comments
        )

    except TypeError:

        comments_count = int(
            getattr(
                writing,
                "comments_count",
                0,
            )
            or 0
        )


    return {

        "id":
            writing.id,

        "title":
            writing.title,

        "content":
            writing.content,

        "category":
            writing.category,

        "language":
            getattr(
                writing,
                "language",
                "bn",
            ),

        "user_id":
            getattr(
                writing,
                "user_id",
                None,
            ),

        "author": (
            {

                "id":
                    author.id,

                "name":
                    author.name,

                "username":
                    getattr(
                        author,
                        "username",
                        None,
                    ),

                "avatar_url":
                    getattr(
                        author,
                        "avatar_url",
                        None,
                    ),

            }
            if author
            else None
        ),

        "likes_count":
            likes_count,

        "comments_count":
            comments_count,

        "created_at":
            (
                writing.created_at
                .isoformat()
                if getattr(
                    writing,
                    "created_at",
                    None,
                )
                else None
            ),

        "published_at":
            (
                writing.published_at
                .isoformat()
                if getattr(
                    writing,
                    "published_at",
                    None,
                )
                else None
            ),

    }



# ============================================================
# PAGINATION RESPONSE
# ============================================================


def pagination_response(
    pagination,
    items,
):

    return {

        "items":
            items,

        "page":
            pagination.page,

        "pages":
            pagination.pages,

        "total":
            pagination.total,

        "has_next":
            pagination.has_next,

        "has_prev":
            pagination.has_prev,

    }



# ============================================================
# EMPTY PAGINATION RESPONSE
# ============================================================


def empty_results(
    page=1,
):

    return {

        "items":
            [],

        "page":
            page,

        "pages":
            0,

        "total":
            0,

        "has_next":
            False,

        "has_prev":
            False,

    }



# ============================================================
# GLOBAL SEARCH
# ============================================================


@search_bp.route(
    "",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def global_search():

    try:

        # ====================================================
        # SEARCH QUERY
        # ====================================================

        search_query = str(
            request.args.get(
                "q",
                "",
            )
            or ""
        ).strip()


        if not search_query:

            return jsonify({

                "query":
                    "",

                "type":
                    "all",

                "writers":
                    empty_results(),

                "writings":
                    empty_results(),

                "totals": {

                    "writers":
                        0,

                    "writings":
                        0,

                    "all":
                        0,

                },

            }), 200


        if (
            len(search_query)
            >
            MAX_QUERY_LENGTH
        ):

            return jsonify({

                "message":
                    (
                        "Search query cannot exceed "
                        f"{MAX_QUERY_LENGTH} characters."
                    )

            }), 400



        # ====================================================
        # RESULT TYPE
        # ====================================================

        search_type = str(
            request.args.get(
                "type",
                "all",
            )
            or "all"
        ).strip().lower()


        if (
            search_type
            not in
            ALLOWED_TYPES
        ):

            return jsonify({

                "message":
                    (
                        "Invalid search type. "
                        "Use all, writers or writings."
                    )

            }), 400



        # ====================================================
        # PAGINATION
        # ====================================================

        try:

            page = max(
                int(
                    request.args.get(
                        "page",
                        DEFAULT_PAGE,
                    )
                ),
                1,
            )


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

            return jsonify({

                "message":
                    "Invalid pagination values."

            }), 400


        limit = max(
            1,
            min(
                limit,
                MAX_LIMIT,
            ),
        )



        # ====================================================
        # CURRENT USER
        # ====================================================

        current_user_id = (
            get_optional_user_id()
        )



        # ====================================================
        # NORMALIZED SEARCH
        # ====================================================

        writer_query = (
            search_query[1:]
            if search_query.startswith("@")
            else search_query
        )


        contains_pattern = (
            f"%{search_query}%"
        )


        writer_contains_pattern = (
            f"%{writer_query}%"
        )


        writer_prefix_pattern = (
            f"{writer_query}%"
        )


        name_prefix_pattern = (
            f"{search_query}%"
        )



        # ====================================================
        # DEFAULT RESPONSES
        # ====================================================

        writer_response = (
            empty_results(
                page
            )
        )


        writing_response = (
            empty_results(
                page
            )
        )



        # ====================================================
        # SEARCH WRITERS
        # ====================================================

        if (
            search_type
            in {
                "all",
                "writers",
            }
        ):

            writer_search_query = (
                User.query
                .filter(
                    User.is_active
                    .is_(True)
                )
                .filter(

                    or_(

                        User.name.ilike(
                            contains_pattern
                        ),

                        User.username.ilike(
                            writer_contains_pattern
                        ),

                        User.bio.ilike(
                            contains_pattern
                        ),

                    )

                )
            )


            # ------------------------------------------------
            # RESULT RELEVANCE
            #
            # 1. Exact username
            # 2. Exact name
            # 3. Username starts with query
            # 4. Name starts with query
            # 5. Other matches
            # ------------------------------------------------

            writer_relevance = case(

                (
                    func.lower(
                        User.username
                    )
                    ==
                    writer_query.lower(),
                    0,
                ),

                (
                    func.lower(
                        User.name
                    )
                    ==
                    search_query.lower(),
                    1,
                ),

                (
                    User.username.ilike(
                        writer_prefix_pattern
                    ),
                    2,
                ),

                (
                    User.name.ilike(
                        name_prefix_pattern
                    ),
                    3,
                ),

                else_=4,

            )


            writer_search_query = (
                writer_search_query
                .order_by(

                    writer_relevance.asc(),

                    User.id.desc(),

                )
            )


            writer_pagination = (
                writer_search_query
                .paginate(
                    page=page,
                    per_page=limit,
                    error_out=False,
                )
            )



            # ------------------------------------------------
            # CURRENT USER FOLLOWING IDS
            # ------------------------------------------------

            following_user_ids = (
                set()
            )


            if current_user_id:

                visible_user_ids = {

                    user.id
                    for user
                    in writer_pagination.items

                }


                if visible_user_ids:

                    follow_rows = (

                        db.session.query(
                            Follow.following_id
                        )
                        .filter(

                            Follow.follower_id
                            ==
                            current_user_id,

                            Follow.following_id
                            .in_(
                                visible_user_ids
                            ),

                        )
                        .all()

                    )


                    following_user_ids = {

                        row[0]
                        for row
                        in follow_rows

                    }



            writers = [

                serialize_writer(

                    user,

                    current_user_id=
                        current_user_id,

                    following_user_ids=
                        following_user_ids,

                )

                for user
                in writer_pagination.items

            ]


            writer_response = (
                pagination_response(
                    writer_pagination,
                    writers,
                )
            )



        # ====================================================
        # SEARCH WRITINGS
        # ====================================================

        if (
            search_type
            in {
                "all",
                "writings",
            }
        ):

            writing_search_query = (
                Writing.query
                .filter(
                    Writing.status
                    ==
                    "published"
                )
                .filter(

                    or_(

                        Writing.title.ilike(
                            contains_pattern
                        ),

                        Writing.content.ilike(
                            contains_pattern
                        ),

                    )

                )
            )



            # ------------------------------------------------
            # WRITING RELEVANCE
            #
            # Exact title first, then title prefix,
            # then title match, then content match.
            # ------------------------------------------------

            writing_relevance = case(

                (
                    func.lower(
                        Writing.title
                    )
                    ==
                    search_query.lower(),
                    0,
                ),

                (
                    Writing.title.ilike(
                        f"{search_query}%"
                    ),
                    1,
                ),

                (
                    Writing.title.ilike(
                        contains_pattern
                    ),
                    2,
                ),

                else_=3,

            )


            writing_search_query = (
                writing_search_query
                .order_by(

                    writing_relevance.asc(),

                    func.coalesce(
                        Writing.published_at,
                        Writing.created_at,
                    ).desc(),

                    Writing.id.desc(),

                )
            )


            writing_pagination = (
                writing_search_query
                .paginate(
                    page=page,
                    per_page=limit,
                    error_out=False,
                )
            )


            writings = [

                serialize_writing(
                    writing
                )

                for writing
                in writing_pagination.items

            ]


            writing_response = (
                pagination_response(
                    writing_pagination,
                    writings,
                )
            )



        # ====================================================
        # TOTAL COUNTS
        # ====================================================

        writers_total = int(
            writer_response.get(
                "total",
                0,
            )
            or 0
        )


        writings_total = int(
            writing_response.get(
                "total",
                0,
            )
            or 0
        )



        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "query":
                search_query,

            "type":
                search_type,

            "page":
                page,

            "limit":
                limit,

            "writers":
                writer_response,

            "writings":
                writing_response,

            "totals": {

                "writers":
                    writers_total,

                "writings":
                    writings_total,

                "all":
                    (
                        writers_total
                        +
                        writings_total
                    ),

            },

        }), 200



    except Exception as error:

        print(
            "GLOBAL SEARCH ERROR:",
            error,
        )


        return jsonify({

            "message":
                "Unable to complete search."

        }), 500