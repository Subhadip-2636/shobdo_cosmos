from extensions import (
    db,
    socketio,
)

from models.notification import Notification


# =========================================================
# SUPPORTED NOTIFICATION TYPES
# =========================================================

SUPPORTED_NOTIFICATION_TYPES = {
    "like",
    "comment",
    "follow",
    "reply",
    "mention",
    "system",
}


# =========================================================
# PRIVATE USER ROOM
# =========================================================

def get_notification_room(
    user_id
):

    return f"user_{user_id}"


# =========================================================
# SERIALIZE NOTIFICATION
# =========================================================

def serialize_notification(
    notification
):

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

        "is_read":
            notification.is_read,

        "created_at":
            (
                notification.created_at.isoformat()
                if notification.created_at
                else None
            ),
    }


# =========================================================
# CREATE NOTIFICATION
# =========================================================

def create_notification(
    recipient_id,
    notification_type,
    actor_id=None,
    writing_id=None,
    comment_id=None,
):

    # -----------------------------------------------------
    # RECIPIENT REQUIRED
    # -----------------------------------------------------

    if recipient_id is None:

        return None


    # -----------------------------------------------------
    # VALID TYPE
    # -----------------------------------------------------

    if (
        notification_type
        not in SUPPORTED_NOTIFICATION_TYPES
    ):

        raise ValueError(
            f"Unsupported notification type: "
            f"{notification_type}"
        )


    # -----------------------------------------------------
    # DON'T NOTIFY YOURSELF
    # -----------------------------------------------------

    if (
        actor_id is not None
        and
        int(actor_id) ==
        int(recipient_id)
    ):

        return None


    # -----------------------------------------------------
    # CREATE DATABASE OBJECT
    # -----------------------------------------------------

    notification = Notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        type=
            notification_type,

        writing_id=
            writing_id,

        comment_id=
            comment_id,

        is_read=False,
    )


    db.session.add(
        notification
    )


    # Generate notification.id
    # without committing the transaction.
    db.session.flush()


    return notification


# =========================================================
# EMIT REAL-TIME NOTIFICATION
# =========================================================

def emit_notification(
    notification
):

    if notification is None:

        return False


    room = get_notification_room(
        notification.recipient_id
    )


    payload = serialize_notification(
        notification
    )


    socketio.emit(
        "notification:new",
        payload,
        to=room,
    )


    print(
        "REAL-TIME NOTIFICATION SENT:",
        f"type={notification.type},",
        f"recipient={notification.recipient_id},",
        f"room={room}",
    )


    return True


# =========================================================
# DELETE NOTIFICATION
# =========================================================

def delete_notification(
    recipient_id,
    notification_type,
    actor_id=None,
    writing_id=None,
    comment_id=None,
):

    query = Notification.query.filter_by(
        recipient_id=
            recipient_id,

        type=
            notification_type,
    )


    if actor_id is not None:

        query = query.filter_by(
            actor_id=
                actor_id
        )


    if writing_id is not None:

        query = query.filter_by(
            writing_id=
                writing_id
        )


    if comment_id is not None:

        query = query.filter_by(
            comment_id=
                comment_id
        )


    notifications = query.all()


    for notification in notifications:

        db.session.delete(
            notification
        )


    return len(
        notifications
    )


# =========================================================
# MARK ONE AS READ
# =========================================================

def mark_notification_as_read(
    notification
):

    if notification is None:

        return None


    notification.is_read = True


    return notification


# =========================================================
# MARK ALL AS READ
# =========================================================

def mark_all_notifications_as_read(
    recipient_id
):

    notifications = (
        Notification.query
        .filter_by(
            recipient_id=
                recipient_id,

            is_read=False,
        )
        .all()
    )


    for notification in notifications:

        notification.is_read = True


    return len(
        notifications
    )


# =========================================================
# UNREAD COUNT
# =========================================================

def get_unread_notification_count(
    recipient_id
):

    return (
        Notification.query
        .filter_by(
            recipient_id=
                recipient_id,

            is_read=False,
        )
        .count()
    )