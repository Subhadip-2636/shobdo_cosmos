from database import db

from models.notification import Notification


# =========================================================
# SUPPORTED NOTIFICATION TYPES
# =========================================================

VALID_NOTIFICATION_TYPES = {
    "like",
    "comment",
    "comment_reply",
    "follow",
    "mention",
    "repost",
    "system",
}


# =========================================================
# HELPERS
# =========================================================

def normalize_notification_type(
    notification_type,
):
    """
    Normalize notification type to SHOBDO's lowercase format.

    Examples:
        LIKE -> like
        Comment -> comment
        FOLLOW -> follow
    """

    if notification_type is None:
        return None

    notification_type = (
        str(notification_type)
        .strip()
        .lower()
    )

    if not notification_type:
        return None

    return notification_type


def normalize_optional_message(
    message,
):
    """
    Normalize optional notification message.
    """

    if message is None:
        return None

    message = str(message).strip()

    if not message:
        return None

    # Notification.message is VARCHAR(500)
    return message[:500]


# =========================================================
# CREATE NOTIFICATION
# =========================================================

def create_notification(
    recipient_id,
    actor_id=None,
    notification_type=None,
    writing_id=None,
    comment_id=None,
    message=None,
    commit=False,
):
    """
    Create a notification.

    By default this function DOES NOT commit.

    This is intentional so another action and its notification
    can be saved atomically.

    Example:

        db.session.add(like)

        notification = create_notification(
            recipient_id=writer.id,
            actor_id=user.id,
            notification_type="like",
            writing_id=writing.id,
        )

        db.session.commit()

    If the transaction fails, both the action and notification
    can be rolled back together.
    """

    # -----------------------------------------------------
    # VALIDATE RECIPIENT
    # -----------------------------------------------------

    if recipient_id is None:
        return None

    try:

        recipient_id = int(
            recipient_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return None


    # -----------------------------------------------------
    # VALIDATE ACTOR
    # -----------------------------------------------------

    if actor_id is not None:

        try:

            actor_id = int(
                actor_id
            )

        except (
            TypeError,
            ValueError,
        ):

            return None


    # -----------------------------------------------------
    # DO NOT CREATE SELF-NOTIFICATIONS
    # -----------------------------------------------------

    if (
        actor_id is not None
        and actor_id == recipient_id
    ):

        return None


    # -----------------------------------------------------
    # NORMALIZE TYPE
    # -----------------------------------------------------

    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )


    if not notification_type:
        return None


    # -----------------------------------------------------
    # VALIDATE TYPE
    # -----------------------------------------------------

    if (
        notification_type
        not in VALID_NOTIFICATION_TYPES
    ):

        raise ValueError(
            "Unsupported notification type: "
            f"{notification_type}"
        )


    # -----------------------------------------------------
    # NORMALIZE OPTIONAL IDS
    # -----------------------------------------------------

    if writing_id is not None:

        try:

            writing_id = int(
                writing_id
            )

        except (
            TypeError,
            ValueError,
        ):

            writing_id = None


    if comment_id is not None:

        try:

            comment_id = int(
                comment_id
            )

        except (
            TypeError,
            ValueError,
        ):

            comment_id = None


    # -----------------------------------------------------
    # MESSAGE
    # -----------------------------------------------------

    message = normalize_optional_message(
        message
    )


    # -----------------------------------------------------
    # CREATE DATABASE OBJECT
    # -----------------------------------------------------

    notification = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=notification_type,
        writing_id=writing_id,
        comment_id=comment_id,
        message=message,
        is_read=False,
    )


    db.session.add(
        notification
    )


    # -----------------------------------------------------
    # OPTIONAL COMMIT
    # -----------------------------------------------------

    if commit:

        db.session.commit()


    return notification


# =========================================================
# DELETE MATCHING NOTIFICATION
# =========================================================

def delete_notification(
    recipient_id,
    actor_id=None,
    notification_type=None,
    writing_id=None,
    comment_id=None,
    commit=False,
):
    """
    Delete notifications matching the supplied relationship.

    Used when actions such as:

        unlike
        unfollow
        comment deletion

    should remove their corresponding notification.

    Returns:
        Number of deleted notifications.
    """

    if recipient_id is None:
        return 0


    try:

        recipient_id = int(
            recipient_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )


    if not notification_type:
        return 0


    # -----------------------------------------------------
    # BASE QUERY
    # -----------------------------------------------------

    query = Notification.query.filter(
        Notification.recipient_id
        == recipient_id,

        Notification.type
        == notification_type,
    )


    # -----------------------------------------------------
    # ACTOR FILTER
    # -----------------------------------------------------

    if actor_id is not None:

        try:

            actor_id = int(
                actor_id
            )

        except (
            TypeError,
            ValueError,
        ):

            return 0


        query = query.filter(
            Notification.actor_id
            == actor_id
        )


    # -----------------------------------------------------
    # WRITING FILTER
    # -----------------------------------------------------

    if writing_id is not None:

        try:

            writing_id = int(
                writing_id
            )

        except (
            TypeError,
            ValueError,
        ):

            return 0


        query = query.filter(
            Notification.writing_id
            == writing_id
        )


    # -----------------------------------------------------
    # COMMENT FILTER
    # -----------------------------------------------------

    if comment_id is not None:

        try:

            comment_id = int(
                comment_id
            )

        except (
            TypeError,
            ValueError,
        ):

            return 0


        query = query.filter(
            Notification.comment_id
            == comment_id
        )


    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    deleted_count = query.delete(
        synchronize_session=False
    )


    if commit:

        db.session.commit()


    return deleted_count


# =========================================================
# GET UNREAD NOTIFICATION COUNT
# =========================================================

def get_unread_notification_count(
    recipient_id,
):
    """
    Return the number of unread notifications for a user.

    Used by:
        GET /api/notifications/unread-count
    """

    if recipient_id is None:
        return 0


    try:

        recipient_id = int(
            recipient_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


    return (
        Notification.query

        .filter(
            Notification.recipient_id
            == recipient_id,

            Notification.is_read.is_(
                False
            ),
        )

        .count()
    )


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

def mark_notification_as_read(
    notification,
):
    """
    Mark one Notification object as read.

    This function intentionally DOES NOT commit.

    notification_routes.py controls the transaction.
    """

    if notification is None:
        return None


    notification.is_read = True


    return notification


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

def mark_all_notifications_as_read(
    recipient_id,
):
    """
    Mark every unread notification belonging to one user
    as read.

    Returns:
        Number of rows updated.

    This function intentionally DOES NOT commit.
    """

    if recipient_id is None:
        return 0


    try:

        recipient_id = int(
            recipient_id
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


    updated_count = (
        Notification.query

        .filter(
            Notification.recipient_id
            == recipient_id,

            Notification.is_read.is_(
                False
            ),
        )

        .update(
            {
                Notification.is_read:
                    True
            },
            synchronize_session=False,
        )
    )


    return updated_count


# =========================================================
# SERIALIZE NOTIFICATION FOR SOCKET.IO
# =========================================================

def serialize_notification(
    notification,
):
    """
    Convert a Notification object into JSON-safe data
    for real-time Socket.IO delivery.
    """

    if notification is None:
        return None


    # -----------------------------------------------------
    # USE MODEL SERIALIZER WHEN AVAILABLE
    # -----------------------------------------------------

    if hasattr(
        notification,
        "to_dict",
    ):

        try:

            return notification.to_dict()

        except Exception as error:

            print(
                "NOTIFICATION SERIALIZATION WARNING:",
                error,
            )


    # -----------------------------------------------------
    # SAFE FALLBACK
    # -----------------------------------------------------

    created_at = getattr(
        notification,
        "created_at",
        None,
    )


    return {

        "id":
            getattr(
                notification,
                "id",
                None,
            ),

        "recipient_id":
            getattr(
                notification,
                "recipient_id",
                None,
            ),

        "actor_id":
            getattr(
                notification,
                "actor_id",
                None,
            ),

        "type":
            getattr(
                notification,
                "type",
                None,
            ),

        "writing_id":
            getattr(
                notification,
                "writing_id",
                None,
            ),

        "comment_id":
            getattr(
                notification,
                "comment_id",
                None,
            ),

        "message":
            getattr(
                notification,
                "message",
                None,
            ),

        "is_read":
            bool(
                getattr(
                    notification,
                    "is_read",
                    False,
                )
            ),

        "created_at":
            (
                created_at.isoformat()
                if created_at
                else None
            ),
    }


# =========================================================
# REAL-TIME NOTIFICATION
# =========================================================

def emit_notification(
    notification,
):
    """
    Send a newly-created notification to the recipient's
    private Socket.IO room.

    socket_handlers.py uses rooms such as:

        user_1
        user_5
        user_27

    IMPORTANT:
        Call this only AFTER the database transaction
        has successfully committed.
    """

    if notification is None:
        return False


    recipient_id = getattr(
        notification,
        "recipient_id",
        None,
    )


    if recipient_id is None:
        return False


    # -----------------------------------------------------
    # IMPORT HERE TO REDUCE CIRCULAR-IMPORT RISK
    # -----------------------------------------------------

    from extensions import socketio


    # -----------------------------------------------------
    # SERIALIZE
    # -----------------------------------------------------

    data = serialize_notification(
        notification
    )


    if data is None:
        return False


    # -----------------------------------------------------
    # PRIVATE USER ROOM
    # -----------------------------------------------------

    room = (
        f"user_{recipient_id}"
    )


    # -----------------------------------------------------
    # EMIT
    # -----------------------------------------------------

    socketio.emit(
        "notification:new",
        data,
        room=room,
    )


    return True


# =========================================================
# LIKE NOTIFICATION
# =========================================================

def notify_like(
    recipient_id,
    actor_id,
    writing_id,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="like",
        writing_id=writing_id,
        message="liked your writing",
        commit=commit,
    )


# =========================================================
# COMMENT NOTIFICATION
# =========================================================

def notify_comment(
    recipient_id,
    actor_id,
    writing_id,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="comment",
        writing_id=writing_id,
        comment_id=comment_id,
        message="commented on your writing",
        commit=commit,
    )


# =========================================================
# COMMENT REPLY NOTIFICATION
# =========================================================

def notify_comment_reply(
    recipient_id,
    actor_id,
    writing_id,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="comment_reply",
        writing_id=writing_id,
        comment_id=comment_id,
        message="replied to your comment",
        commit=commit,
    )


# =========================================================
# FOLLOW NOTIFICATION
# =========================================================

def notify_follow(
    recipient_id,
    actor_id,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="follow",
        message="started following you",
        commit=commit,
    )


# =========================================================
# MENTION NOTIFICATION
# =========================================================

def notify_mention(
    recipient_id,
    actor_id,
    writing_id=None,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="mention",
        writing_id=writing_id,
        comment_id=comment_id,
        message="mentioned you",
        commit=commit,
    )


# =========================================================
# REPOST NOTIFICATION
# =========================================================

def notify_repost(
    recipient_id,
    actor_id,
    writing_id,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        notification_type="repost",
        writing_id=writing_id,
        message="reposted your writing",
        commit=commit,
    )


# =========================================================
# SYSTEM NOTIFICATION
# =========================================================

def notify_system(
    recipient_id,
    message,
    commit=False,
):

    return create_notification(
        recipient_id=recipient_id,
        actor_id=None,
        notification_type="system",
        message=message,
        commit=commit,
    )