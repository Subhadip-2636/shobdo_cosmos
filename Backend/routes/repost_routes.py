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

from sqlalchemy.exc import (
    IntegrityError,
)

from extensions import db

from models.repost import Repost
from models.user import User
from models.writing import Writing

from services.notification_service import (
    create_notification,
    delete_notification,
    emit_notification,
)


# =========================================================
# BLUEPRINT
# =========================================================
#
# No url_prefix here because this blueprint serves:
#
# /api/reposts/...
#
# AND
#
# /api/users/<id>/reposts
#
# =========================================================

repost_bp = Blueprint(
    "reposts",
    __name__,
)


# =========================================================
# HELPERS
# =========================================================

def get_current_user_id():

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


# =========================================================


def get_active_user(
    user_id
):

    try:

        user_id = int(
            user_id
        )

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


# =========================================================


def get_public_writing(
    writing_id
):

    try:

        writing_id = int(
            writing_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


    writing = db.session.get(
        Writing,
        writing_id,
    )


    if not writing:

        return None


    # -----------------------------------------------------
    # ONLY PUBLIC / PUBLISHED WRITINGS CAN BE REPOSTED
    # -----------------------------------------------------

    if (
        getattr(
            writing,
            "status",
            None,
        )
        !=
        "published"
    ):

        return None


    # -----------------------------------------------------
    # ADDITIONAL SOFT DELETE SAFETY
    # -----------------------------------------------------

    if getattr(
        writing,
        "deleted_at",
        None,
    ) is not None:

        return None


    return writing


# =========================================================


def parse_pagination(
    default_limit=20,
    max_limit=50,
):

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


# =========================================================


def public_user_dict(
    user
):

    if not user:

        return None


    return {

        "id":
            user.id,

        "name":
            getattr(
                user,
                "name",
                None,
            ),

        "username":
            getattr(
                user,
                "username",
                None,
            ),

        "avatar_url":
            getattr(
                user,
                "avatar_url",
                None,
            ),

        "bio":
            getattr(
                user,
                "bio",
                None,
            ),
    }


# =========================================================


def get_repost_count(
    writing_id
):

    return (
        db.session.query(
            func.count(
                Repost.id
            )
        )
        .filter(
            Repost.writing_id
            == writing_id
        )
        .scalar()
        or 0
    )


# =========================================================


def get_repost_counts(
    writing_ids
):

    writing_ids = [

        int(
            writing_id
        )

        for writing_id
        in writing_ids

        if writing_id is not None

    ]


    if not writing_ids:

        return {}


    rows = (

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


    return {

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
        in rows

    }


# =========================================================


def get_current_user_reposted_ids(
    current_user_id,
    writing_ids,
):

    if (
        current_user_id is None
        or
        not writing_ids
    ):

        return set()


    rows = (

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


    return {

        int(
            row[0]
        )

        for row
        in rows

    }


# =========================================================


def serialize_writing(
    writing,
    *,
    reposts_count=0,
    reposted_by_current_user=False,
):

    if hasattr(
        writing,
        "to_dict",
    ):

        try:

            data = (
                writing.to_dict()
            )

        except Exception:

            data = {}

    else:

        data = {}


    if not isinstance(
        data,
        dict,
    ):

        data = {}


    # -----------------------------------------------------
    # REQUIRED BASIC WRITING DATA
    # -----------------------------------------------------

    data.setdefault(
        "id",
        writing.id,
    )


    data.setdefault(
        "title",
        getattr(
            writing,
            "title",
            "",
        ),
    )


    data.setdefault(
        "content",
        getattr(
            writing,
            "content",
            "",
        ),
    )


    data.setdefault(
        "category",
        getattr(
            writing,
            "category",
            None,
        ),
    )


    data.setdefault(
        "language",
        getattr(
            writing,
            "language",
            "bn",
        ),
    )


    data.setdefault(
        "status",
        getattr(
            writing,
            "status",
            None,
        ),
    )


    data.setdefault(
        "user_id",
        getattr(
            writing,
            "user_id",
            None,
        ),
    )


    # -----------------------------------------------------
    # AUTHOR
    # -----------------------------------------------------

    author = getattr(
        writing,
        "author",
        None,
    )


    if author:

        data["author"] = {

            "id":
                author.id,

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


        data["author_id"] = (
            author.id
        )


        data["author_name"] = (
            getattr(
                author,
                "name",
                None,
            )
        )


    # -----------------------------------------------------
    # REPOST INFORMATION
    # -----------------------------------------------------

    data["reposts_count"] = int(
        reposts_count
        or 0
    )


    data[
        "reposted_by_current_user"
    ] = bool(
        reposted_by_current_user
    )


    data["is_reposted"] = bool(
        reposted_by_current_user
    )


    return data


# =========================================================
# CREATE REPOST
#
# POST /api/reposts/writing/<writing_id>
# =========================================================

@repost_bp.route(
    "/api/reposts/writing/<int:writing_id>",
    methods=["POST"],
)
@jwt_required()
def repost_writing(
    writing_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authentication identity.",

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
                "Authenticated user not found.",

        }), 404


    writing = (
        get_public_writing(
            writing_id
        )
    )


    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

        }), 404


    # =====================================================
    # IDEMPOTENT CHECK
    # =====================================================

    existing_repost = (

        Repost.query

        .filter_by(
            user_id=
                current_user.id,

            writing_id=
                writing.id,
        )

        .first()

    )


    if existing_repost:

        return jsonify({

            "success":
                True,

            "message":
                "Writing already reposted.",

            "reposted":
                True,

            "is_reposted":
                True,

            "reposts_count":
                get_repost_count(
                    writing.id
                ),

            "repost":
                existing_repost.to_dict(),

        }), 200


    # =====================================================
    # CREATE REPOST + NOTIFICATION
    # =====================================================

    repost = Repost(

        user_id=
            current_user.id,

        writing_id=
            writing.id,
    )


    notification = None


    try:

        db.session.add(
            repost
        )


        # -------------------------------------------------
        # REPOST NOTIFICATION
        #
        # create_notification does not commit.
        #
        # Repost + notification are therefore written in
        # one transaction.
        #
        # Self-reposts do not create notifications because
        # notification_service blocks self-notifications.
        # -------------------------------------------------

        notification = (
            create_notification(

                recipient_id=
                    writing.user_id,

                actor_id=
                    current_user.id,

                notification_type=
                    "repost",

                writing_id=
                    writing.id,

                message=
                    "reposted your writing",
            )
        )


        db.session.commit()


    except IntegrityError:

        db.session.rollback()


        # -------------------------------------------------
        # CONCURRENT DUPLICATE SAFETY
        # -------------------------------------------------

        existing_repost = (

            Repost.query

            .filter_by(
                user_id=
                    current_user.id,

                writing_id=
                    writing.id,
            )

            .first()

        )


        if existing_repost:

            return jsonify({

                "success":
                    True,

                "message":
                    "Writing already reposted.",

                "reposted":
                    True,

                "is_reposted":
                    True,

                "reposts_count":
                    get_repost_count(
                        writing.id
                    ),

                "repost":
                    existing_repost.to_dict(),

            }), 200


        return jsonify({

            "success":
                False,

            "message":
                "Unable to repost writing.",

        }), 500


    except Exception as error:

        db.session.rollback()


        print(
            "REPOST CREATE ERROR:",
            repr(
                error
            ),
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to repost writing.",

        }), 500


    # =====================================================
    # REAL-TIME NOTIFICATION
    # =====================================================
    #
    # Emit only after the database transaction succeeded.
    # =====================================================

    if notification:

        try:

            emit_notification(
                notification
            )

        except Exception as error:

            print(
                "REPOST NOTIFICATION "
                "EMIT ERROR:",
                repr(
                    error
                ),
            )


    return jsonify({

        "success":
            True,

        "message":
            "Writing reposted successfully.",

        "reposted":
            True,

        "is_reposted":
            True,

        "reposts_count":
            get_repost_count(
                writing.id
            ),

        "repost":
            repost.to_dict(),

    }), 201


# =========================================================
# REMOVE REPOST
#
# DELETE /api/reposts/writing/<writing_id>
# =========================================================

@repost_bp.route(
    "/api/reposts/writing/<int:writing_id>",
    methods=["DELETE"],
)
@jwt_required()
def unrepost_writing(
    writing_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authentication identity.",

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
                "Authenticated user not found.",

        }), 404


    writing = (
        get_public_writing(
            writing_id
        )
    )


    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

        }), 404


    repost = (

        Repost.query

        .filter_by(
            user_id=
                current_user.id,

            writing_id=
                writing.id,
        )

        .first()

    )


    # =====================================================
    # IDEMPOTENT DELETE
    # =====================================================

    if not repost:

        return jsonify({

            "success":
                True,

            "message":
                "Writing is not reposted.",

            "reposted":
                False,

            "is_reposted":
                False,

            "reposts_count":
                get_repost_count(
                    writing.id
                ),

        }), 200


    # =====================================================
    # DELETE REPOST + CORRESPONDING NOTIFICATION
    # =====================================================

    try:

        delete_notification(

            recipient_id=
                writing.user_id,

            actor_id=
                current_user.id,

            notification_type=
                "repost",

            writing_id=
                writing.id,
        )


        db.session.delete(
            repost
        )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "REPOST DELETE ERROR:",
            repr(
                error
            ),
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to remove repost.",

        }), 500


    return jsonify({

        "success":
            True,

        "message":
            "Repost removed successfully.",

        "reposted":
            False,

        "is_reposted":
            False,

        "reposts_count":
            get_repost_count(
                writing.id
            ),

    }), 200


# =========================================================
# GET REPOST STATUS FOR CURRENT USER
#
# GET /api/reposts/writing/<writing_id>/me
# =========================================================

@repost_bp.route(
    "/api/reposts/writing/<int:writing_id>/me",
    methods=["GET"],
)
@jwt_required()
def get_my_repost_status(
    writing_id
):

    current_user_id = (
        get_current_user_id()
    )


    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authentication identity.",

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
                "Authenticated user not found.",

        }), 404


    writing = (
        get_public_writing(
            writing_id
        )
    )


    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

        }), 404


    repost = (

        Repost.query

        .filter_by(
            user_id=
                current_user.id,

            writing_id=
                writing.id,
        )

        .first()

    )


    reposted = (
        repost is not None
    )


    return jsonify({

        "success":
            True,

        "writing_id":
            writing.id,

        "reposted":
            reposted,

        "is_reposted":
            reposted,

        "reposts_count":
            get_repost_count(
                writing.id
            ),

        "repost":
            (
                repost.to_dict()
                if repost
                else None
            ),

    }), 200


# =========================================================
# GET USERS WHO REPOSTED A WRITING
#
# GET /api/reposts/writing/<writing_id>
#
# Optional:
#
# ?page=1
# ?limit=20
# =========================================================

@repost_bp.route(
    "/api/reposts/writing/<int:writing_id>",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_writing_reposts(
    writing_id
):

    writing = (
        get_public_writing(
            writing_id
        )
    )


    if not writing:

        return jsonify({

            "success":
                False,

            "message":
                "Writing not found.",

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
                "Invalid pagination values.",

        }), 400


    page, limit = (
        pagination_values
    )


    current_user_id = (
        get_current_user_id()
    )


    # =====================================================
    # QUERY
    # =====================================================

    query = (

        Repost.query

        .join(
            User,
            User.id
            ==
            Repost.user_id,
        )

        .filter(
            Repost.writing_id
            ==
            writing.id,

            User.is_active.is_(
                True
            ),
        )

        .order_by(
            Repost.created_at.desc(),
            Repost.id.desc(),
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


    reposts = [

        repost.to_dict()

        for repost
        in pagination.items

    ]


    users = [

        public_user_dict(
            repost.user
        )

        for repost
        in pagination.items

        if repost.user

    ]


    current_user_reposted = False


    if current_user_id is not None:

        current_user_reposted = (

            Repost.query

            .filter_by(
                user_id=
                    current_user_id,

                writing_id=
                    writing.id,
            )

            .first()

            is not None
        )


    return jsonify({

        "success":
            True,

        "writing_id":
            writing.id,

        "reposted":
            current_user_reposted,

        "is_reposted":
            current_user_reposted,

        "reposts_count":
            pagination.total,

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

        "reposts":
            reposts,

        "users":
            users,

    }), 200


# =========================================================
# GET A USER'S PUBLIC REPOSTS
#
# GET /api/users/<user_id>/reposts
#
# Optional:
#
# ?page=1
# ?limit=20
# =========================================================

@repost_bp.route(
    "/api/users/<int:user_id>/reposts",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_user_reposts(
    user_id
):

    user = (
        get_active_user(
            user_id
        )
    )


    if not user:

        return jsonify({

            "success":
                False,

            "message":
                "Writer not found.",

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
                "Invalid pagination values.",

        }), 400


    page, limit = (
        pagination_values
    )


    current_user_id = (
        get_current_user_id()
    )


    # =====================================================
    # QUERY
    # =====================================================

    query = (

        Repost.query

        .join(
            Writing,
            Writing.id
            ==
            Repost.writing_id,
        )

        .filter(
            Repost.user_id
            ==
            user.id,

            Writing.status
            ==
            "published",
        )

    )


    if hasattr(
        Writing,
        "deleted_at",
    ):

        query = query.filter(
            Writing.deleted_at.is_(
                None
            )
        )


    query = query.order_by(
        Repost.created_at.desc(),
        Repost.id.desc(),
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


    # =====================================================
    # BATCH REPOST COUNTS
    # =====================================================

    writing_ids = [

        repost.writing_id

        for repost
        in pagination.items

        if repost.writing_id

    ]


    repost_counts = (
        get_repost_counts(
            writing_ids
        )
    )


    current_user_reposted_ids = (
        get_current_user_reposted_ids(
            current_user_id,
            writing_ids,
        )
    )


    # =====================================================
    # SERIALIZATION
    # =====================================================

    reposts = []


    writings = []


    for repost in pagination.items:

        writing = (
            repost.writing
        )


        if not writing:

            continue


        writing_data = (
            serialize_writing(

                writing,

                reposts_count=
                    repost_counts.get(
                        writing.id,
                        0,
                    ),

                reposted_by_current_user=
                    (
                        writing.id
                        in
                        current_user_reposted_ids
                    ),
            )
        )


        repost_data = {

            "id":
                repost.id,

            "user_id":
                repost.user_id,

            "writing_id":
                repost.writing_id,

            "created_at":
                (
                    repost.created_at.isoformat()
                    if repost.created_at
                    else None
                ),

            "writing":
                writing_data,
        }


        reposts.append(
            repost_data
        )


        writings.append(
            writing_data
        )


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

        "reposts":
            reposts,

        # Convenience alias for frontend feeds.

        "writings":
            writings,

        "items":
            writings,

    }), 200