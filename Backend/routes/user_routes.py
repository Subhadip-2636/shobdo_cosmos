import re

from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from sqlalchemy import func

from extensions import db

from models.user import User
from models.writing import Writing
from models.follow import Follow
from models.repost import Repost

from services.notification_service import (
    create_notification,
    delete_notification,
    emit_notification,
)

from services.profile_image_storage import (
    upload_profile_avatar,
    delete_profile_avatar,
)


# ============================================================
# BLUEPRINT
# ============================================================

user_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users",
)


# ============================================================
# GENERAL HELPERS
# ============================================================


def get_active_user(user_id):
    """
    Return an active User or None.
    """

    try:
        user_id = int(user_id)

    except (
        TypeError,
        ValueError,
    ):
        return None


    user = db.session.get(
        User,
        user_id,
    )


    if not user:
        return None


    if not getattr(
        user,
        "is_active",
        True,
    ):
        return None


    return user


# ============================================================


def get_current_user_id():
    """
    Safely convert JWT identity into an integer ID.

    Works with optional JWT routes too. If there is no JWT,
    get_jwt_identity() returns None.
    """

    identity = get_jwt_identity()


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


def public_user_dict(user):
    """
    Public-safe user serializer.

    Never expose:
    - email
    - password hash
    - authentication information
    """

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
    }


# ============================================================


def get_followers_count(user_id):
    """
    Number of users following this writer.
    """

    return (
        db.session.query(
            Follow
        )
        .filter(
            Follow.following_id
            == user_id
        )
        .count()
    )


# ============================================================


def get_following_count(user_id):
    """
    Number of users followed by this writer.
    """

    return (
        db.session.query(
            Follow
        )
        .filter(
            Follow.follower_id
            == user_id
        )
        .count()
    )


# ============================================================


def get_published_writings_count(user_id):
    """
    Number of published writings created by a writer.
    """

    return (
        Writing.query
        .filter(
            Writing.user_id
            == user_id,

            Writing.status
            == "published",
        )
        .count()
    )


# ============================================================


def get_published_writings_query(user_id):
    """
    Base query containing one writer's published writings.
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


# ============================================================


def get_writer_stats(user_id):
    """
    Public profile statistics.
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

        for writing
        in writings

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

        for writing
        in writings

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


def parse_pagination(
    default_limit=20,
    max_limit=50,
):
    """
    Parse page + limit query parameters.

    Returns:
        (page, limit)

    or:
        None
    """

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
                default_limit,
            )
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


    page = max(
        page,
        1,
    )


    limit = max(
        1,
        min(
            limit,
            max_limit,
        ),
    )


    return (
        page,
        limit,
    )


# ============================================================


def suggestion_user_dict(
    user,
    followers_count=0,
    writings_count=0,
):
    """
    User representation used by Who To Follow.
    """

    data = public_user_dict(
        user
    )


    data.update({
        "followers_count":
            int(
                followers_count
                or 0
            ),

        "writings_count":
            int(
                writings_count
                or 0
            ),

        "following":
            False,

        "is_self":
            False,
    })


    return data



# ============================================================
# SOCIAL WRITING SERIALIZATION
#
# Used by:
# - public writer writings
# - following feed
#
# Repost count and current-user repost state are loaded in
# batches so feed cards do not make one repost query each.
# ============================================================


def serialize_social_writings(
    writings,
    current_user_id=None,
):

    writings = list(
        writings or []
    )


    writing_ids = [

        int(
            writing.id
        )

        for writing
        in writings

        if getattr(
            writing,
            "id",
            None,
        )

    ]


    if not writing_ids:

        return []


    # ========================================================
    # BATCH REPOST COUNTS
    # ========================================================

    repost_count_rows = (

        db.session.query(

            Repost.writing_id,

            func.count(
                Repost.id
            ).label(
                "reposts_count"
            ),

        )

        .filter(
            Repost.writing_id.in_(
                writing_ids
            )
        )

        .group_by(
            Repost.writing_id
        )

        .all()

    )


    repost_counts = {

        int(
            writing_id
        ):
            int(
                reposts_count
                or 0
            )

        for (
            writing_id,
            reposts_count,
        )
        in repost_count_rows

    }


    # ========================================================
    # CURRENT USER REPOST STATUS
    # ========================================================

    reposted_ids = set()


    if current_user_id is not None:

        reposted_rows = (

            db.session.query(
                Repost.writing_id
            )

            .filter(

                Repost.user_id
                == current_user_id,

                Repost.writing_id.in_(
                    writing_ids
                ),

            )

            .all()

        )


        reposted_ids = {

            int(
                writing_id
            )

            for (
                writing_id,
            )
            in reposted_rows

        }


    # ========================================================
    # SERIALIZE
    # ========================================================

    serialized = []


    for writing in writings:

        data = writing.to_dict()


        # ----------------------------------------------------
        # FULL PUBLIC AUTHOR SHAPE
        # ----------------------------------------------------

        author = getattr(
            writing,
            "author",
            None,
        )


        if author is not None:

            author_data = {

                "id":
                    getattr(
                        author,
                        "id",
                        None,
                    ),

                "name":
                    getattr(
                        author,
                        "name",
                        None,
                    ),

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


            data["author"] = (
                author_data
            )


            data["author_id"] = (
                author_data[
                    "id"
                ]
            )


            data["author_name"] = (
                author_data[
                    "name"
                ]
            )


            data["author_username"] = (
                author_data[
                    "username"
                ]
            )


            data["author_avatar_url"] = (
                author_data[
                    "avatar_url"
                ]
            )


        # ----------------------------------------------------
        # LIKE STATUS
        # ----------------------------------------------------

        is_liked = False


        if current_user_id is not None:

            try:

                is_liked = any(

                    getattr(
                        like,
                        "user_id",
                        None,
                    )
                    == current_user_id

                    for like
                    in getattr(
                        writing,
                        "likes",
                        [],
                    )

                )

            except TypeError:

                is_liked = False


        data["is_liked"] = (
            is_liked
        )


        data[
            "liked_by_current_user"
        ] = is_liked


        # ----------------------------------------------------
        # REPOST STATUS / COUNT
        # ----------------------------------------------------

        reposted = (
            writing.id
            in reposted_ids
        )


        reposts_count = (
            repost_counts.get(
                writing.id,
                0,
            )
        )


        data["reposts_count"] = (
            reposts_count
        )


        data["reposted_by_me"] = (
            reposted
        )


        # Compatibility aliases while older frontend code is
        # still being upgraded.
        data[
            "reposted_by_current_user"
        ] = reposted


        data["is_reposted"] = (
            reposted
        )


        data["reposted"] = (
            reposted
        )


        serialized.append(
            data
        )


    return serialized


# ============================================================
# ============================================================
# UPDATE OWN PROFILE
#
# PATCH /api/users/me/profile
# ============================================================


@user_bp.route(
    "/me/profile",
    methods=["PATCH"],
)
@jwt_required()
def update_my_profile():

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid authentication identity."
        }), 401


    user = get_active_user(
        current_user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Authenticated user not found."
        }), 404


    # ========================================================
    # REQUEST BODY
    # ========================================================

    data = request.get_json(
        silent=True
    )


    if not isinstance(
        data,
        dict,
    ):

        return jsonify({
            "success":
                False,

            "message":
                "Invalid request body."
        }), 400


    # ========================================================
    # NAME
    # ========================================================

    if "name" in data:

        name = str(
            data.get(
                "name"
            )
            or ""
        ).strip()


        if len(
            name
        ) < 2:

            return jsonify({
                "success":
                    False,

                "message":
                    "Name must contain at least 2 characters."
            }), 400


        if len(
            name
        ) > 120:

            return jsonify({
                "success":
                    False,

                "message":
                    "Name cannot exceed 120 characters."
            }), 400


        user.name = name


    # ========================================================
    # USERNAME
    # ========================================================

    if "username" in data:

        username = str(
            data.get(
                "username"
            )
            or ""
        ).strip().lower()


        if username.startswith(
            "@"
        ):

            username = username[
                1:
            ]


        if username:

            if len(
                username
            ) < 3:

                return jsonify({
                    "success":
                        False,

                    "message":
                        "Username must contain at least 3 characters."
                }), 400


            if len(
                username
            ) > 30:

                return jsonify({
                    "success":
                        False,

                    "message":
                        "Username cannot exceed 30 characters."
                }), 400


            if not re.fullmatch(
                r"[a-z0-9][a-z0-9._]*",
                username,
            ):

                return jsonify({
                    "success":
                        False,

                    "message":
                        (
                            "Username may contain lowercase "
                            "letters, numbers, dots and underscores."
                        )
                }), 400


            existing_user = (
                User.query
                .filter(
                    User.username
                    == username,

                    User.id
                    != user.id,
                )
                .first()
            )


            if existing_user:

                return jsonify({
                    "success":
                        False,

                    "message":
                        "This username is already taken."
                }), 409


            user.username = (
                username
            )


        else:

            user.username = None


    # ========================================================
    # BIO
    # ========================================================

    if "bio" in data:

        bio = str(
            data.get(
                "bio"
            )
            or ""
        ).strip()


        if len(
            bio
        ) > 500:

            return jsonify({
                "success":
                    False,

                "message":
                    "Bio cannot exceed 500 characters."
            }), 400


        user.bio = (
            bio
            if bio
            else None
        )


    # ========================================================
    # LOCATION
    # ========================================================

    if "location" in data:

        location = str(
            data.get(
                "location"
            )
            or ""
        ).strip()


        if len(
            location
        ) > 100:

            return jsonify({
                "success":
                    False,

                "message":
                    "Location cannot exceed 100 characters."
            }), 400


        user.location = (
            location
            if location
            else None
        )


    # ========================================================
    # WEBSITE
    # ========================================================

    if "website" in data:

        website = str(
            data.get(
                "website"
            )
            or ""
        ).strip()


        if len(
            website
        ) > 255:

            return jsonify({
                "success":
                    False,

                "message":
                    "Website URL is too long."
            }), 400


        if (
            website
            and not (
                website.startswith(
                    "https://"
                )
                or website.startswith(
                    "http://"
                )
            )
        ):

            return jsonify({
                "success":
                    False,

                "message":
                    (
                        "Website must start with "
                        "http:// or https://."
                    )
            }), 400


        user.website = (
            website
            if website
            else None
        )


    # ========================================================
    # AVATAR URL
    # ========================================================

    if "avatar_url" in data:

        avatar_url = str(
            data.get(
                "avatar_url"
            )
            or ""
        ).strip()


        if len(
            avatar_url
        ) > 500:

            return jsonify({
                "success":
                    False,

                "message":
                    "Avatar URL is too long."
            }), 400


        if (
            avatar_url
            and not (
                avatar_url.startswith(
                    "https://"
                )
                or avatar_url.startswith(
                    "http://"
                )
            )
        ):

            return jsonify({
                "success":
                    False,

                "message":
                    (
                        "Avatar URL must start with "
                        "http:// or https://."
                    )
            }), 400


        user.avatar_url = (
            avatar_url
            if avatar_url
            else None
        )


    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "PROFILE UPDATE ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to update profile."
        }), 500


    return jsonify({
        "success":
            True,

        "message":
            "Profile updated successfully.",

        "user":
            public_user_dict(
                user
            ),
    }), 200


# ============================================================
# UPLOAD PROFILE IMAGE
#
# POST /api/users/me/avatar
#
# multipart/form-data
# field: avatar
# ============================================================


@user_bp.route(
    "/me/avatar",
    methods=["POST"],
)
@jwt_required()
def upload_my_avatar():

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid authentication identity."
        }), 401


    user = get_active_user(
        current_user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Authenticated user not found."
        }), 404


    avatar = request.files.get(
        "avatar"
    )


    if avatar is None:

        return jsonify({
            "success":
                False,

            "message":
                "Profile image is required."
        }), 400


    if not (
        avatar.filename
        or ""
    ).strip():

        return jsonify({
            "success":
                False,

            "message":
                "Please select a profile image."
        }), 400


    try:

        file_bytes = avatar.read()


    except Exception as error:

        print(
            "AVATAR FILE READ ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to read profile image."
        }), 400


    # ========================================================
    # STORAGE UPLOAD
    # ========================================================

    try:

        upload_result = (
            upload_profile_avatar(
                user_id=
                    user.id,

                file_bytes=
                    file_bytes,

                content_type=
                    avatar.mimetype,
            )
        )


    except ValueError as error:

        return jsonify({
            "success":
                False,

            "message":
                str(
                    error
                )
        }), 400


    except RuntimeError as error:

        print(
            "AVATAR STORAGE ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to upload profile image."
        }), 500


    except Exception as error:

        print(
            "UNEXPECTED AVATAR UPLOAD ERROR:",
            repr(
                error
            ),
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to upload profile image."
        }), 500


    avatar_url = (
        str(
            upload_result.get(
                "avatar_url"
            )
            or ""
        )
        .strip()
    )


    if not avatar_url:

        return jsonify({
            "success":
                False,

            "message":
                (
                    "Profile image upload "
                    "returned no image URL."
                )
        }), 500


    user.avatar_url = (
        avatar_url
    )


    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "AVATAR DATABASE ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                (
                    "Profile image uploaded, "
                    "but the profile could not "
                    "be updated."
                )
        }), 500


    return jsonify({
        "success":
            True,

        "message":
            "Profile image updated successfully.",

        "avatar_url":
            user.avatar_url,

        "user":
            public_user_dict(
                user
            ),
    }), 200


# ============================================================
# REMOVE PROFILE IMAGE
#
# DELETE /api/users/me/avatar
# ============================================================


@user_bp.route(
    "/me/avatar",
    methods=["DELETE"],
)
@jwt_required()
def remove_my_avatar():

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid authentication identity."
        }), 401


    user = get_active_user(
        current_user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Authenticated user not found."
        }), 404


    if not (
        getattr(
            user,
            "avatar_url",
            None,
        )
        or ""
    ).strip():

        return jsonify({
            "success":
                True,

            "message":
                "Profile image is already removed.",

            "avatar_url":
                None,

            "user":
                public_user_dict(
                    user
                ),
        }), 200


    # ========================================================
    # DATABASE IS SOURCE OF TRUTH
    # ========================================================

    user.avatar_url = None


    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "REMOVE AVATAR DATABASE ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to update profile."
        }), 500


    # ========================================================
    # STORAGE CLEANUP
    # ========================================================

    storage_cleanup_succeeded = True


    try:

        delete_profile_avatar(
            user.id
        )


    except Exception as error:

        storage_cleanup_succeeded = (
            False
        )


        print(
            "REMOVE AVATAR STORAGE ERROR:",
            repr(
                error
            ),
        )


    response = {
        "success":
            True,

        "message":
            "Profile image removed successfully.",

        "avatar_url":
            None,

        "user":
            public_user_dict(
                user
            ),

        "storage_cleanup_succeeded":
            storage_cleanup_succeeded,
    }


    if not storage_cleanup_succeeded:

        response[
            "message"
        ] = (
            "Profile image was removed "
            "from your SHOBDO profile, "
            "but storage cleanup did not "
            "complete successfully."
        )


    return jsonify(
        response
    ), 200


# ============================================================
# SUGGESTED WRITERS
#
# GET:
# /api/users/suggestions?page=1&limit=5
#
# JWT is OPTIONAL.
#
# Logged-in:
# - excludes current user
# - excludes writers already followed
#
# Guest:
# - returns popular active writers
#
# Ranking:
# 1. Followers
# 2. Published writings
# 3. Newer account
# ============================================================


@user_bp.route(
    "/suggestions",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_user_suggestions():

    pagination = (
        parse_pagination(
            default_limit=5,
            max_limit=20,
        )
    )


    if pagination is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid pagination values."
        }), 400


    page, limit = (
        pagination
    )


    # ========================================================
    # OPTIONAL CURRENT USER
    # ========================================================

    current_user_id = (
        get_current_user_id()
    )


    current_user = None


    if current_user_id is not None:

        current_user = (
            get_active_user(
                current_user_id
            )
        )


        if not current_user:

            return jsonify({
                "success":
                    False,

                "message":
                    "Authenticated user not found."
            }), 404


    # ========================================================
    # FOLLOWER COUNT SUBQUERY
    # ========================================================

    follower_count_subquery = (

        db.session.query(
            Follow.following_id.label(
                "user_id"
            ),

            func.count(
                Follow.follower_id
            ).label(
                "followers_count"
            ),
        )

        .group_by(
            Follow.following_id
        )

        .subquery()
    )


    # ========================================================
    # PUBLISHED WRITING COUNT SUBQUERY
    # ========================================================

    writing_count_subquery = (

        db.session.query(
            Writing.user_id.label(
                "user_id"
            ),

            func.count(
                Writing.id
            ).label(
                "writings_count"
            ),
        )

        .filter(
            Writing.status
            == "published"
        )

        .group_by(
            Writing.user_id
        )

        .subquery()
    )


    followers_score = (
        func.coalesce(
            follower_count_subquery
            .c
            .followers_count,
            0,
        )
    )


    writings_score = (
        func.coalesce(
            writing_count_subquery
            .c
            .writings_count,
            0,
        )
    )


    # ========================================================
    # BASE QUERY
    # ========================================================

    query = (

        db.session.query(
            User,
            followers_score.label(
                "followers_count"
            ),
            writings_score.label(
                "writings_count"
            ),
        )

        .outerjoin(
            follower_count_subquery,
            follower_count_subquery
            .c
            .user_id
            == User.id,
        )

        .outerjoin(
            writing_count_subquery,
            writing_count_subquery
            .c
            .user_id
            == User.id,
        )

        .filter(
            User.is_active.is_(
                True
            )
        )
    )


    # ========================================================
    # AUTHENTICATED FILTERS
    # ========================================================

    if current_user:

        followed_user_ids = (

            db.session.query(
                Follow.following_id
            )

            .filter(
                Follow.follower_id
                == current_user.id
            )
        )


        query = (
            query
            .filter(
                User.id
                != current_user.id,

                ~User.id.in_(
                    followed_user_ids
                ),
            )
        )


    # ========================================================
    # ORDERING
    # ========================================================

    query = (
        query
        .order_by(
            followers_score.desc(),
            writings_score.desc(),
            User.created_at.desc(),
            User.id.desc(),
        )
    )


    # ========================================================
    # TOTAL
    # ========================================================

    total = query.count()


    pages = (
        (total + limit - 1)
        // limit
    )


    offset = (
        (page - 1)
        * limit
    )


    rows = (
        query
        .offset(
            offset
        )
        .limit(
            limit
        )
        .all()
    )


    # ========================================================
    # SERIALIZATION
    # ========================================================

    users = []


    for (
        suggested_user,
        followers_count,
        writings_count,
    ) in rows:

        users.append(
            suggestion_user_dict(
                suggested_user,

                followers_count=
                    followers_count,

                writings_count=
                    writings_count,
            )
        )


    # ========================================================
    # RESPONSE
    # ========================================================

    return jsonify({
        "success":
            True,

        "page":
            page,

        "limit":
            limit,

        "total":
            total,

        "pages":
            pages,

        "has_next":
            page < pages,

        "has_prev":
            page > 1,

        "users":
            users,
    }), 200


# ============================================================
# PUBLIC WRITER PROFILE
#
# GET /api/users/<user_id>
# ============================================================


@user_bp.route(
    "/<int:user_id>",
    methods=["GET"],
)
def get_public_user(
    user_id
):

    user = get_active_user(
        user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    stats = get_writer_stats(
        user.id
    )


    return jsonify({
        "success":
            True,

        "user":
            public_user_dict(
                user
            ),

        "stats":
            stats,
    }), 200


# ============================================================
# PUBLIC WRITER WRITINGS
#
# GET /api/users/<user_id>/writings
# ============================================================


@user_bp.route(
    "/<int:user_id>/writings",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_public_user_writings(
    user_id
):

    current_user_id = (
        get_current_user_id()
    )


    user = get_active_user(
        user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    writings = (
        get_published_writings_query(
            user.id
        )
        .all()
    )


    serialized_writings = (
        serialize_social_writings(
            writings,
            current_user_id,
        )
    )


    return jsonify({
        "success":
            True,

        "user":
            public_user_dict(
                user
            ),

        "count":
            len(
                serialized_writings
            ),

        "writings":
            serialized_writings,

        "items":
            serialized_writings,
    }), 200


# ============================================================
# FOLLOW STATUS
#
# GET /api/users/<user_id>/follow-status
# ============================================================


@user_bp.route(
    "/<int:user_id>/follow-status",
    methods=["GET"],
)
@jwt_required()
def get_follow_status(
    user_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

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
            "success":
                False,

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
            "success":
                False,

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
        "success":
            True,

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
#
# POST /api/users/<user_id>/follow
# ============================================================


@user_bp.route(
    "/<int:user_id>/follow",
    methods=["POST"],
)
@jwt_required()
def follow_user(
    user_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

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
            "success":
                False,

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
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    # ========================================================
    # PREVENT SELF-FOLLOW
    # ========================================================

    if (
        current_user.id
        == target_user.id
    ):

        return jsonify({
            "success":
                False,

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


    # ========================================================
    # EXISTING FOLLOW
    # ========================================================

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


    if existing_follow:

        return jsonify({
            "success":
                True,

            "message":
                (
                    "You are already "
                    "following this writer."
                ),

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


    # ========================================================
    # CREATE FOLLOW
    # ========================================================

    follow = Follow(
        follower_id=
            current_user.id,

        following_id=
            target_user.id,
    )


    notification = None


    try:

        db.session.add(
            follow
        )


        # ----------------------------------------------------
        # FOLLOW NOTIFICATION
        #
        # notification_service intentionally does not commit.
        # Follow + notification commit together.
        # ----------------------------------------------------

        notification = (
            create_notification(
                recipient_id=
                    target_user.id,

                actor_id=
                    current_user.id,

                notification_type=
                    "follow",
            )
        )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "FOLLOW CREATE ERROR:",
            error,
        )


        return jsonify({
            "success":
                False,

            "message":
                "Unable to follow this writer."
        }), 500


    # ========================================================
    # REAL-TIME NOTIFICATION
    #
    # Emit after successful database transaction.
    # ========================================================

    if notification:

        try:

            emit_notification(
                notification
            )


        except Exception as error:

            print(
                "FOLLOW REAL-TIME "
                "NOTIFICATION ERROR:",
                error,
            )


    return jsonify({
        "success":
            True,

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
#
# DELETE /api/users/<user_id>/follow
# ============================================================


@user_bp.route(
    "/<int:user_id>/follow",
    methods=["DELETE"],
)
@jwt_required()
def unfollow_user(
    user_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

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
            "success":
                False,

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
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    # ========================================================
    # SELF
    # ========================================================

    if (
        current_user.id
        == target_user.id
    ):

        return jsonify({
            "success":
                False,

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


    # ========================================================
    # FIND FOLLOW
    # ========================================================

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


    # ========================================================
    # IDEMPOTENT UNFOLLOW
    # ========================================================

    if not follow:

        return jsonify({
            "success":
                True,

            "message":
                (
                    "You are not following "
                    "this writer."
                ),

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


    # ========================================================
    # DELETE FOLLOW + MATCHING NOTIFICATION
    # ========================================================

    try:

        delete_notification(
            recipient_id=
                target_user.id,

            actor_id=
                current_user.id,

            notification_type=
                "follow",
        )


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
            "success":
                False,

            "message":
                "Unable to unfollow this writer."
        }), 500


    return jsonify({
        "success":
            True,

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
# ============================================================


@user_bp.route(
    "/me/following-feed",
    methods=["GET"],
)
@jwt_required()
def get_following_feed():

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({
            "success":
                False,

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
            "success":
                False,

            "message":
                "Authenticated user not found."
        }), 404


    pagination_values = (
        parse_pagination(
            default_limit=20,
            max_limit=50,
        )
    )


    if pagination_values is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid pagination values."
        }), 400


    page, limit = (
        pagination_values
    )


    # ========================================================
    # WRITERS CURRENT USER FOLLOWS
    # ========================================================

    following_ids = (

        db.session.query(
            Follow.following_id
        )

        .filter(
            Follow.follower_id
            == current_user.id
        )
    )


    # ========================================================
    # FEED
    # ========================================================

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


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    writings = (
        serialize_social_writings(
            pagination.items,
            current_user.id,
        )
    )


    return jsonify({
        "success":
            True,

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
# Public
# ============================================================


@user_bp.route(
    "/<int:user_id>/followers",
    methods=["GET"],
)
def get_user_followers(
    user_id
):

    user = get_active_user(
        user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    pagination_values = (
        parse_pagination(
            default_limit=20,
            max_limit=50,
        )
    )


    if pagination_values is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid pagination values."
        }), 400


    page, limit = (
        pagination_values
    )


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

            User.is_active.is_(
                True
            ),
        )

        .order_by(
            Follow.created_at.desc(),
            User.id.desc(),
        )
    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    users = [
        public_user_dict(
            follower
        )
        for follower
        in pagination.items
    ]


    return jsonify({
        "success":
            True,

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
# Public
# ============================================================


@user_bp.route(
    "/<int:user_id>/following",
    methods=["GET"],
)
def get_user_following(
    user_id
):

    user = get_active_user(
        user_id
    )


    if not user:

        return jsonify({
            "success":
                False,

            "message":
                "Writer not found."
        }), 404


    pagination_values = (
        parse_pagination(
            default_limit=20,
            max_limit=50,
        )
    )


    if pagination_values is None:

        return jsonify({
            "success":
                False,

            "message":
                "Invalid pagination values."
        }), 400


    page, limit = (
        pagination_values
    )


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

            User.is_active.is_(
                True
            ),
        )

        .order_by(
            Follow.created_at.desc(),
            User.id.desc(),
        )
    )


    pagination = (
        query.paginate(
            page=
                page,

            per_page=
                limit,

            error_out=
                False,
        )
    )


    users = [
        public_user_dict(
            following_user
        )
        for following_user
        in pagination.items
    ]


    return jsonify({
        "success":
            True,

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