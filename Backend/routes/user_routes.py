from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from extensions import db

from models.user import User
from models.writing import Writing
from models.follow import Follow


# ============================================================
# BLUEPRINT
# ============================================================

user_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users",
)


# ============================================================
# HELPERS
# ============================================================

def get_active_user(user_id):
    """
    Return an active user or None.
    """

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None

    user = db.session.get(
        User,
        user_id,
    )

    if not user:
        return None

    if not user.is_active:
        return None

    return user


def get_current_user_id():
    """
    Safely convert JWT identity to integer.
    """

    try:
        return int(
            get_jwt_identity()
        )

    except (
        TypeError,
        ValueError,
    ):
        return None


def public_user_dict(user):
    """
    Public-safe representation of a user.

    IMPORTANT:
    Email and other private account information
    are deliberately excluded.
    """

    return {
        "id": user.id,
        "name": user.name,

        "created_at": (
            user.created_at.isoformat()
            if user.created_at
            else None
        ),
    }


def get_followers_count(user_id):
    """
    Number of users following this user.
    """

    return (
        db.session.query(Follow)
        .filter(
            Follow.following_id
            == user_id
        )
        .count()
    )


def get_following_count(user_id):
    """
    Number of users this user follows.
    """

    return (
        db.session.query(Follow)
        .filter(
            Follow.follower_id
            == user_id
        )
        .count()
    )


def get_published_writings_query(user_id):
    """
    Base query for one writer's
    published writings.
    """

    return (
        Writing.query
        .filter(
            Writing.user_id
            == user_id,
            Writing.status
            == "published",
        )
        .order_by(
            Writing.published_at.desc(),
            Writing.created_at.desc(),
        )
    )


def get_writer_stats(user_id):
    """
    Aggregate public profile statistics.
    """

    writings = (
        Writing.query
        .filter(
            Writing.user_id
            == user_id,
            Writing.status
            == "published",
        )
        .all()
    )

    likes_count = sum(
        int(
            getattr(
                writing,
                "likes_count",
                0,
            )
            or 0
        )
        for writing in writings
    )

    comments_count = sum(
        int(
            getattr(
                writing,
                "comments_count",
                0,
            )
            or 0
        )
        for writing in writings
    )

    return {
        "writings_count":
            len(writings),

        "likes_count":
            likes_count,

        "comments_count":
            comments_count,

        "followers_count":
            get_followers_count(
                user_id
            ),

        "following_count":
            get_following_count(
                user_id
            ),
    }


# ============================================================
# PUBLIC WRITER PROFILE
# GET /api/users/<user_id>
# ============================================================

@user_bp.route(
    "/<int:user_id>",
    methods=["GET"],
)
def get_public_user(user_id):

    user = get_active_user(
        user_id
    )

    if not user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404

    stats = get_writer_stats(
        user.id
    )

    return jsonify({
        "user":
            public_user_dict(
                user
            ),

        "stats":
            stats,
    }), 200


# ============================================================
# PUBLIC WRITER WRITINGS
# GET /api/users/<user_id>/writings
# ============================================================

@user_bp.route(
    "/<int:user_id>/writings",
    methods=["GET"],
)
def get_public_user_writings(user_id):

    user = get_active_user(
        user_id
    )

    if not user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404

    writings = (
        get_published_writings_query(
            user.id
        )
        .all()
    )

    return jsonify({
        "user":
            public_user_dict(
                user
            ),

        "count":
            len(writings),

        "writings": [
            writing.to_dict()
            for writing
            in writings
        ],
    }), 200


# ============================================================
# FOLLOW STATUS
# GET /api/users/<user_id>/follow-status
# ============================================================

@user_bp.route(
    "/<int:user_id>/follow-status",
    methods=["GET"],
)
@jwt_required()
def get_follow_status(user_id):

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:
        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401

    current_user = (
        get_active_user(
            current_user_id
        )
    )

    if not current_user:
        return jsonify({
            "message":
                "Authenticated user not found."
        }), 404

    target_user = (
        get_active_user(
            user_id
        )
    )

    if not target_user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404

    is_self = (
        current_user.id
        == target_user.id
    )

    following = False

    if not is_self:
        following = (
            Follow.query
            .filter_by(
                follower_id=
                    current_user.id,

                following_id=
                    target_user.id,
            )
            .first()
            is not None
        )

    return jsonify({
        "following":
            following,

        "is_self":
            is_self,

        "followers_count":
            get_followers_count(
                target_user.id
            ),

        "following_count":
            get_following_count(
                target_user.id
            ),
    }), 200


# ============================================================
# FOLLOW WRITER
# POST /api/users/<user_id>/follow
# ============================================================

@user_bp.route(
    "/<int:user_id>/follow",
    methods=["POST"],
)
@jwt_required()
def follow_user(user_id):

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:
        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401

    current_user = (
        get_active_user(
            current_user_id
        )
    )

    if not current_user:
        return jsonify({
            "message":
                "Authenticated user not found."
        }), 404

    target_user = (
        get_active_user(
            user_id
        )
    )

    if not target_user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404

    if (
        current_user.id
        == target_user.id
    ):
        return jsonify({
            "message":
                "You cannot follow yourself.",

            "following":
                False,

            "followers_count":
                get_followers_count(
                    target_user.id
                ),

            "following_count":
                get_following_count(
                    target_user.id
                ),
        }), 400

    existing_follow = (
        Follow.query
        .filter_by(
            follower_id=
                current_user.id,

            following_id=
                target_user.id,
        )
        .first()
    )

    # --------------------------------------------------------
    # IDEMPOTENT
    # --------------------------------------------------------

    if existing_follow:
        return jsonify({
            "message":
                "You are already following this writer.",

            "following":
                True,

            "followers_count":
                get_followers_count(
                    target_user.id
                ),

            "following_count":
                get_following_count(
                    target_user.id
                ),
        }), 200

    follow = Follow(
        follower_id=
            current_user.id,

        following_id=
            target_user.id,
    )

    try:
        db.session.add(
            follow
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "FOLLOW CREATE ERROR:",
            error,
        )

        return jsonify({
            "message":
                "Unable to follow this writer."
        }), 500

    return jsonify({
        "message":
            "Writer followed successfully.",

        "following":
            True,

        "followers_count":
            get_followers_count(
                target_user.id
            ),

        "following_count":
            get_following_count(
                target_user.id
            ),
    }), 201


# ============================================================
# UNFOLLOW WRITER
# DELETE /api/users/<user_id>/follow
# ============================================================

@user_bp.route(
    "/<int:user_id>/follow",
    methods=["DELETE"],
)
@jwt_required()
def unfollow_user(user_id):

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:
        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401

    current_user = (
        get_active_user(
            current_user_id
        )
    )

    if not current_user:
        return jsonify({
            "message":
                "Authenticated user not found."
        }), 404

    target_user = (
        get_active_user(
            user_id
        )
    )

    if not target_user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404

    if (
        current_user.id
        == target_user.id
    ):
        return jsonify({
            "message":
                "You cannot unfollow yourself.",

            "following":
                False,

            "followers_count":
                get_followers_count(
                    target_user.id
                ),

            "following_count":
                get_following_count(
                    target_user.id
                ),
        }), 400

    follow = (
        Follow.query
        .filter_by(
            follower_id=
                current_user.id,

            following_id=
                target_user.id,
        )
        .first()
    )

    # --------------------------------------------------------
    # IDEMPOTENT
    # --------------------------------------------------------

    if not follow:
        return jsonify({
            "message":
                "You are not following this writer.",

            "following":
                False,

            "followers_count":
                get_followers_count(
                    target_user.id
                ),

            "following_count":
                get_following_count(
                    target_user.id
                ),
        }), 200

    try:
        db.session.delete(
            follow
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "FOLLOW DELETE ERROR:",
            error,
        )

        return jsonify({
            "message":
                "Unable to unfollow this writer."
        }), 500

    return jsonify({
        "message":
            "Writer unfollowed successfully.",

        "following":
            False,

        "followers_count":
            get_followers_count(
                target_user.id
            ),

        "following_count":
            get_following_count(
                target_user.id
            ),
    }), 200


# ============================================================
# FOLLOWING FEED
#
# GET:
# /api/users/me/following-feed?page=1&limit=20
#
# Requires JWT
# ============================================================

@user_bp.route(
    "/me/following-feed",
    methods=["GET"],
)
@jwt_required()
def get_following_feed():

    # --------------------------------------------------------
    # AUTH USER
    # --------------------------------------------------------

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:
        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401

    current_user = (
        get_active_user(
            current_user_id
        )
    )

    if not current_user:
        return jsonify({
            "message":
                "Authenticated user not found."
        }), 404

    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    try:
        page = int(
            request.args.get(
                "page",
                1,
            )
        )

        limit = int(
            request.args.get(
                "limit",
                20,
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

    page = max(
        page,
        1,
    )

    # Prevent excessively large
    # feed requests.
    limit = max(
        1,
        min(
            limit,
            50,
        ),
    )

    # --------------------------------------------------------
    # FOLLOWING IDS SUBQUERY
    # --------------------------------------------------------

    following_ids = (
        db.session.query(
            Follow.following_id
        )
        .filter(
            Follow.follower_id
            == current_user.id
        )
    )

    # --------------------------------------------------------
    # FEED QUERY
    # --------------------------------------------------------

    query = (
        Writing.query
        .filter(
            Writing.user_id.in_(
                following_ids
            ),
            Writing.status
            == "published",
        )
        .order_by(
            Writing.published_at.desc(),
            Writing.created_at.desc(),
        )
    )

    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    pagination = (
        query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )
    )

    writings = [
        writing.to_dict()
        for writing
        in pagination.items
    ]

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return jsonify({
        "page":
            pagination.page,

        "limit":
            limit,

        "total":
            pagination.total,

        "pages":
            pagination.pages,

        "has_next":
            pagination.has_next,

        "has_prev":
            pagination.has_prev,

        "writings":
            writings,
    }), 200

    # ============================================================
# FOLLOWERS LIST
#
# GET:
# /api/users/<user_id>/followers?page=1&limit=20
#
# Public endpoint
# ============================================================

@user_bp.route(
    "/<int:user_id>/followers",
    methods=["GET"],
)
def get_user_followers(user_id):

    # --------------------------------------------------------
    # TARGET USER
    # --------------------------------------------------------

    user = get_active_user(
        user_id
    )

    if not user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404


    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    try:
        page = int(
            request.args.get(
                "page",
                1,
            )
        )

        limit = int(
            request.args.get(
                "limit",
                20,
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


    page = max(
        page,
        1,
    )

    limit = max(
        1,
        min(
            limit,
            50,
        ),
    )


    # --------------------------------------------------------
    # QUERY
    #
    # Follow.following_id = profile being followed
    # Follow.follower_id  = user who follows profile
    # --------------------------------------------------------

    query = (
        User.query
        .join(
            Follow,
            Follow.follower_id
            == User.id,
        )
        .filter(
            Follow.following_id
            == user.id,
            User.is_active.is_(True),
        )
        .order_by(
            Follow.created_at.desc(),
            User.id.desc(),
        )
    )


    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    pagination = (
        query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )
    )


    # --------------------------------------------------------
    # PUBLIC-SAFE USERS
    # --------------------------------------------------------

    users = [
        public_user_dict(
            follower
        )
        for follower
        in pagination.items
    ]


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return jsonify({
        "user":
            public_user_dict(
                user
            ),

        "page":
            pagination.page,

        "limit":
            limit,

        "total":
            pagination.total,

        "pages":
            pagination.pages,

        "has_next":
            pagination.has_next,

        "has_prev":
            pagination.has_prev,

        "users":
            users,
    }), 200


# ============================================================
# FOLLOWING LIST
#
# GET:
# /api/users/<user_id>/following?page=1&limit=20
#
# Public endpoint
# ============================================================

@user_bp.route(
    "/<int:user_id>/following",
    methods=["GET"],
)
def get_user_following(user_id):

    # --------------------------------------------------------
    # TARGET USER
    # --------------------------------------------------------

    user = get_active_user(
        user_id
    )

    if not user:
        return jsonify({
            "message":
                "Writer not found."
        }), 404


    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    try:
        page = int(
            request.args.get(
                "page",
                1,
            )
        )

        limit = int(
            request.args.get(
                "limit",
                20,
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


    page = max(
        page,
        1,
    )

    limit = max(
        1,
        min(
            limit,
            50,
        ),
    )


    # --------------------------------------------------------
    # QUERY
    #
    # Follow.follower_id  = profile owner
    # Follow.following_id = writer being followed
    # --------------------------------------------------------

    query = (
        User.query
        .join(
            Follow,
            Follow.following_id
            == User.id,
        )
        .filter(
            Follow.follower_id
            == user.id,
            User.is_active.is_(True),
        )
        .order_by(
            Follow.created_at.desc(),
            User.id.desc(),
        )
    )


    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    pagination = (
        query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )
    )


    # --------------------------------------------------------
    # PUBLIC-SAFE USERS
    # --------------------------------------------------------

    users = [
        public_user_dict(
            following_user
        )
        for following_user
        in pagination.items
    ]


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return jsonify({
        "user":
            public_user_dict(
                user
            ),

        "page":
            pagination.page,

        "limit":
            limit,

        "total":
            pagination.total,

        "pages":
            pagination.pages,

        "has_next":
            pagination.has_next,

        "has_prev":
            pagination.has_prev,

        "users":
            users,
    }), 200