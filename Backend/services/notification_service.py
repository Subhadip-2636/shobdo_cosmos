from database import db

from models.notification import Notification


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

    # -----------------------------------------------------
    # VALIDATE RECIPIENT
    # -----------------------------------------------------

    if recipient_id is None:
        return None


    # -----------------------------------------------------
    # DO NOT NOTIFY USER ABOUT THEIR OWN ACTION
    # -----------------------------------------------------

    if actor_id is not None:

        try:

            if int(actor_id) == int(recipient_id):
                return None

        except (
            TypeError,
            ValueError,
        ):

            if actor_id == recipient_id:
                return None


    # -----------------------------------------------------
    # VALIDATE TYPE
    # -----------------------------------------------------

    if not notification_type:
        return None


    # -----------------------------------------------------
    # NORMALIZE TYPE
    # -----------------------------------------------------
    #
    # SHOBDO uses lowercase notification types:
    #
    # like
    # comment
    # comment_reply
    # follow
    # mention
    # repost
    # system
    #
    # -----------------------------------------------------

    notification_type = (
        str(notification_type)
        .strip()
        .lower()
    )


    # -----------------------------------------------------
    # CREATE NOTIFICATION
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
    #
    # Usually this should remain False.
    #
    # Example:
    #
    # db.session.add(like)
    #
    # create_notification(...)
    #
    # db.session.commit()
    #
    # This commits both operations in one transaction.
    #
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

    if recipient_id is None:
        return 0


    if not notification_type:
        return 0


    notification_type = (
        str(notification_type)
        .strip()
        .lower()
    )


    # -----------------------------------------------------
    # BUILD QUERY
    # -----------------------------------------------------

    query = Notification.query.filter_by(
        recipient_id=recipient_id,
        type=notification_type,
    )


    if actor_id is not None:

        query = query.filter_by(
            actor_id=actor_id,
        )


    if writing_id is not None:

        query = query.filter_by(
            writing_id=writing_id,
        )


    if comment_id is not None:

        query = query.filter_by(
            comment_id=comment_id,
        )


    # -----------------------------------------------------
    # DELETE MATCHING NOTIFICATIONS
    # -----------------------------------------------------

    notifications = query.all()


    deleted_count = 0


    for notification in notifications:

        db.session.delete(
            notification
        )

        deleted_count += 1


    if commit:
        db.session.commit()


    return deleted_count


# =========================================================
# REAL-TIME EMIT
# =========================================================

def emit_notification(
    notification,
):

    if not notification:
        return False


    # -----------------------------------------------------
    # Import here to avoid circular imports
    # -----------------------------------------------------

    from extensions import socketio


    # -----------------------------------------------------
    # SERIALIZE
    # -----------------------------------------------------

    if hasattr(
        notification,
        "to_dict",
    ):

        data = notification.to_dict()

    else:

        data = {
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
                getattr(
                    notification,
                    "is_read",
                    False,
                ),
        }


    recipient_id = getattr(
        notification,
        "recipient_id",
        None,
    )


    if recipient_id is None:
        return False


    # -----------------------------------------------------
    # USER ROOM
    # -----------------------------------------------------
    #
    # IMPORTANT:
    # socket_handlers.py must join users to exactly this
    # same room format.
    #
    # Example:
    #
    # user_1
    # user_2
    # user_27
    #
    # -----------------------------------------------------

    room = f"user_{recipient_id}"


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