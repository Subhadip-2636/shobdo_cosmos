from database import db
from models.notification import Notification


# =========================================================
# SUPPORTED NOTIFICATION TYPES
# =========================================================

VALID_NOTIFICATION_TYPES = {
    "like",
    "comment",
    "follow",
    "reply",
    "mention",
    "system",
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
    """
    Create a SHOBDO notification.

    The notification is added to the current SQLAlchemy
    transaction but is NOT committed here.

    The calling route should normally call:

        db.session.commit()

    This allows the original action and its notification
    to succeed or fail together.
    """

    # -----------------------------------------------------
    # RECIPIENT VALIDATION
    # -----------------------------------------------------

    if recipient_id is None:
        return None

    try:
        recipient_id = int(recipient_id)
    except (TypeError, ValueError):
        return None

    # -----------------------------------------------------
    # ACTOR VALIDATION
    # -----------------------------------------------------

    if actor_id is not None:

        try:
            actor_id = int(actor_id)
        except (TypeError, ValueError):
            return None

        # Prevent self-notifications.
        #
        # Example:
        # A user should not receive a notification
        # after liking their own writing.

        if actor_id == recipient_id:
            return None

    # -----------------------------------------------------
    # TYPE VALIDATION
    # -----------------------------------------------------

    notification_type = (
        str(notification_type)
        .strip()
        .lower()
    )

    if notification_type not in VALID_NOTIFICATION_TYPES:

        raise ValueError(
            f"Unsupported notification type: "
            f"{notification_type}"
        )

    # -----------------------------------------------------
    # OPTIONAL WRITING ID
    # -----------------------------------------------------

    if writing_id is not None:

        try:
            writing_id = int(writing_id)
        except (TypeError, ValueError):
            writing_id = None

    # -----------------------------------------------------
    # OPTIONAL COMMENT ID
    # -----------------------------------------------------

    if comment_id is not None:

        try:
            comment_id = int(comment_id)
        except (TypeError, ValueError):
            comment_id = None

    # -----------------------------------------------------
    # CREATE MODEL
    # -----------------------------------------------------

    notification = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=notification_type,
        writing_id=writing_id,
        comment_id=comment_id,
        is_read=False,
    )

    db.session.add(notification)

    return notification


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
    """
    Delete matching notifications.

    Useful when an action is reversed.

    Examples:
        unlike
        unfollow

    This function does NOT commit automatically.
    """

    if recipient_id is None:
        return 0

    try:
        recipient_id = int(recipient_id)
    except (TypeError, ValueError):
        return 0

    query = Notification.query.filter(
        Notification.recipient_id == recipient_id,
        Notification.type == notification_type,
    )

    if actor_id is not None:

        try:
            actor_id = int(actor_id)
        except (TypeError, ValueError):
            return 0

        query = query.filter(
            Notification.actor_id == actor_id
        )

    if writing_id is not None:

        try:
            writing_id = int(writing_id)
        except (TypeError, ValueError):
            return 0

        query = query.filter(
            Notification.writing_id == writing_id
        )

    if comment_id is not None:

        try:
            comment_id = int(comment_id)
        except (TypeError, ValueError):
            return 0

        query = query.filter(
            Notification.comment_id == comment_id
        )

    notifications = query.all()

    deleted_count = len(notifications)

    for notification in notifications:
        db.session.delete(notification)

    return deleted_count


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

def mark_notification_as_read(
    notification,
):
    if notification is None:
        return None

    notification.is_read = True

    return notification


# =========================================================
# MARK ALL USER NOTIFICATIONS AS READ
# =========================================================

def mark_all_notifications_as_read(
    recipient_id,
):
    try:
        recipient_id = int(recipient_id)
    except (TypeError, ValueError):
        return 0

    unread_notifications = (
        Notification.query
        .filter(
            Notification.recipient_id
            == recipient_id,
            Notification.is_read.is_(False),
        )
        .all()
    )

    updated_count = len(
        unread_notifications
    )

    for notification in unread_notifications:
        notification.is_read = True

    return updated_count


# =========================================================
# GET UNREAD COUNT
# =========================================================

def get_unread_notification_count(
    recipient_id,
):
    try:
        recipient_id = int(recipient_id)
    except (TypeError, ValueError):
        return 0

    return (
        Notification.query
        .filter(
            Notification.recipient_id
            == recipient_id,
            Notification.is_read.is_(False),
        )
        .count()
    )