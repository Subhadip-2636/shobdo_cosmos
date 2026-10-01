from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from database import db

from models.notification import Notification
from models.user import User
from models.writing import Writing
from models.comment import Comment

from services.notification_service import (
    get_unread_notification_count,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)


# =========================================================
# BLUEPRINT
# =========================================================

notification_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications",
)


# =========================================================
# HELPERS
# =========================================================

def get_current_user_id():

    identity = get_jwt_identity()

    if identity is None:
        return None

    try:
        return int(identity)

    except (
        TypeError,
        ValueError,
    ):
        return None


# =========================================================
# NOTIFICATION RESPONSE
# =========================================================

def notification_response(
    notification,
):

    """
    Convert Notification into frontend-friendly structured
    JSON.

    The frontend can translate notification text based on
    notification.type.
    """

    if notification is None:
        return None

    # =====================================================
    # ACTOR
    # =====================================================

    actor = None

    if notification.actor_id is not None:

        actor_user = db.session.get(
            User,
            notification.actor_id,
        )

        if actor_user:

            actor = {

                "id":
                    actor_user.id,

                "name":
                    getattr(
                        actor_user,
                        "name",
                        None,
                    ),

                "username":
                    getattr(
                        actor_user,
                        "username",
                        None,
                    ),

                "avatar_url":
                    getattr(
                        actor_user,
                        "avatar_url",
                        None,
                    ),
            }

    # =====================================================
    # WRITING
    # =====================================================

    writing = None

    if notification.writing_id is not None:

        writing_model = db.session.get(
            Writing,
            notification.writing_id,
        )

        if writing_model:

            writing = {

                "id":
                    writing_model.id,

                "title":
                    getattr(
                        writing_model,
                        "title",
                        "",
                    ),
            }

    # =====================================================
    # COMMENT
    # =====================================================

    comment = None

    if notification.comment_id is not None:

        comment_model = db.session.get(
            Comment,
            notification.comment_id,
        )

        if comment_model:

            comment = {

                "id":
                    comment_model.id,
            }

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "id":
            notification.id,

        "recipient_id":
            notification.recipient_id,

        "actor_id":
            notification.actor_id,

        "type":
            notification.type,

        "writing_id":
            notification.writing_id,

        "comment_id":
            notification.comment_id,

        "message":
            notification.message,

        # -------------------------------------------------
        # NEW SOCIAL NOTIFICATION FIELDS
        # -------------------------------------------------

        "target_url":
            getattr(
                notification,
                "target_url",
                None,
            ),

        "group_key":
            getattr(
                notification,
                "group_key",
                None,
            ),

        # -------------------------------------------------
        # READ STATE
        # -------------------------------------------------

        "is_read":
            notification.is_read,

        "read_at":
            (
                notification.read_at.isoformat()
                if getattr(
                    notification,
                    "read_at",
                    None,
                )
                else None
            ),

        # -------------------------------------------------
        # EMAIL STATE
        # -------------------------------------------------

        "email_sent":
            bool(
                getattr(
                    notification,
                    "email_sent",
                    False,
                )
            ),

        "email_sent_at":
            (
                notification.email_sent_at.isoformat()
                if getattr(
                    notification,
                    "email_sent_at",
                    None,
                )
                else None
            ),

        # -------------------------------------------------
        # TIMESTAMPS
        # -------------------------------------------------

        "created_at":
            (
                notification.created_at.isoformat()
                if notification.created_at
                else None
            ),

        "updated_at":
            (
                notification.updated_at.isoformat()
                if getattr(
                    notification,
                    "updated_at",
                    None,
                )
                else None
            ),

        # -------------------------------------------------
        # RELATED OBJECTS
        # -------------------------------------------------

        "actor":
            actor,

        "writing":
            writing,

        "comment":
            comment,
    }


# =========================================================
# GET NOTIFICATIONS
# =========================================================
#
# GET /api/notifications
#
# Optional:
#
# ?page=1
# ?per_page=20
# ?unread=true
#
# =========================================================

@notification_bp.get("")
@jwt_required()
def get_notifications():

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401

    # -----------------------------------------------------
    # PAGINATION
    # -----------------------------------------------------

    page = request.args.get(
        "page",
        default=1,
        type=int,
    )

    per_page = request.args.get(
        "per_page",
        default=20,
        type=int,
    )

    if page is None or page < 1:
        page = 1

    if per_page is None or per_page < 1:
        per_page = 20

    per_page = min(
        per_page,
        100,
    )

    # -----------------------------------------------------
    # QUERY
    # -----------------------------------------------------

    query = Notification.query.filter(

        Notification.recipient_id
        == current_user_id
    )

    # -----------------------------------------------------
    # OPTIONAL UNREAD FILTER
    # -----------------------------------------------------

    unread = (

        request.args
        .get(
            "unread",
            default="",
        )
        .strip()
        .lower()
    )

    if unread in {
        "true",
        "1",
        "yes",
    }:

        query = query.filter(

            Notification.is_read.is_(
                False
            )
        )

    # -----------------------------------------------------
    # NEWEST FIRST
    # -----------------------------------------------------

    query = query.order_by(

        Notification.created_at.desc(),

        Notification.id.desc(),
    )

    # -----------------------------------------------------
    # PAGINATION
    # -----------------------------------------------------

    pagination = query.paginate(

        page=page,

        per_page=per_page,

        error_out=False,
    )

    notifications = [

        notification_response(
            notification
        )

        for notification
        in pagination.items
    ]

    unread_count = (
        get_unread_notification_count(
            current_user_id
        )
    )

    return jsonify({

        "success":
            True,

        "notifications":
            notifications,

        "unread_count":
            unread_count,

        "pagination": {

            "page":
                pagination.page,

            "per_page":
                pagination.per_page,

            "total":
                pagination.total,

            "pages":
                pagination.pages,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },

    }), 200


# =========================================================
# GET UNREAD COUNT
# =========================================================

@notification_bp.get(
    "/unread-count"
)
@jwt_required()
def unread_notification_count():

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401

    count = (
        get_unread_notification_count(
            current_user_id
        )
    )

    return jsonify({

        "success":
            True,

        "unread_count":
            count,

    }), 200


# =========================================================
# MARK ONE AS READ
# =========================================================

@notification_bp.patch(
    "/<int:notification_id>/read"
)
@jwt_required()
def read_notification(
    notification_id,
):

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401

    notification = db.session.get(
        Notification,
        notification_id,
    )

    if notification is None:

        return jsonify({

            "success":
                False,

            "message":
                "Notification not found.",

        }), 404

    # -----------------------------------------------------
    # SECURITY
    # -----------------------------------------------------

    if (
        notification.recipient_id
        != current_user_id
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Notification not found.",

        }), 404

    # -----------------------------------------------------
    # UPDATE READ STATE
    # -----------------------------------------------------

    if not notification.is_read:

        mark_notification_as_read(
            notification
        )

        db.session.commit()

    # -----------------------------------------------------
    # CURRENT UNREAD COUNT
    # -----------------------------------------------------

    unread_count = (
        get_unread_notification_count(
            current_user_id
        )
    )

    return jsonify({

        "success":
            True,

        "notification":
            notification_response(
                notification
            ),

        "unread_count":
            unread_count,

    }), 200


# =========================================================
# MARK ALL AS READ
# =========================================================

@notification_bp.patch(
    "/read-all"
)
@jwt_required()
def read_all_notifications():

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401

    updated_count = (
        mark_all_notifications_as_read(
            current_user_id
        )
    )

    db.session.commit()

    return jsonify({

        "success":
            True,

        "message":
            "All notifications marked as read.",

        "updated_count":
            updated_count,

        "unread_count":
            0,

    }), 200


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@notification_bp.delete(
    "/<int:notification_id>"
)
@jwt_required()
def delete_user_notification(
    notification_id,
):

    current_user_id = (
        get_current_user_id()
    )

    if current_user_id is None:

        return jsonify({

            "success":
                False,

            "message":
                "Invalid authenticated user.",

        }), 401

    notification = db.session.get(
        Notification,
        notification_id,
    )

    if notification is None:

        return jsonify({

            "success":
                False,

            "message":
                "Notification not found.",

        }), 404

    # -----------------------------------------------------
    # SECURITY
    # -----------------------------------------------------

    if (
        notification.recipient_id
        != current_user_id
    ):

        return jsonify({

            "success":
                False,

            "message":
                "Notification not found.",

        }), 404

    was_unread = (
        not notification.is_read
    )

    db.session.delete(
        notification
    )

    db.session.commit()

    unread_count = (
        get_unread_notification_count(
            current_user_id
        )
    )

    return jsonify({

        "success":
            True,

        "message":
            "Notification deleted.",

        "notification_id":
            notification_id,

        "was_unread":
            was_unread,

        "unread_count":
            unread_count,

    }), 200