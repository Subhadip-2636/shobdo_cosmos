import os

from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

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
    "message",
    "new_writing",
    "system",
    "security",
}


# =========================================================
# DEFAULT EMAIL NOTIFICATION TYPES
# =========================================================
#
# Important:
#
# We intentionally DO NOT email every "like" by default.
# That would quickly become noisy for a social platform.
#
# Individual user notification preferences can be added
# later.
# =========================================================


DEFAULT_EMAIL_NOTIFICATION_TYPES = {
    "follow",
    "comment",
    "comment_reply",
    "mention",
    "repost",
    "security",
}


# =========================================================
# GENERAL HELPERS
# =========================================================


def normalize_notification_type(
    notification_type,
):

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

    if message is None:
        return None

    message = str(message).strip()

    if not message:
        return None

    return message[:500]


def normalize_optional_id(
    value,
):

    if value is None:
        return None

    try:
        return int(value)

    except (
        TypeError,
        ValueError,
    ):
        return None


# =========================================================
# TARGET URL
# =========================================================


def build_notification_target_url(
    notification_type,
    actor_id=None,
    writing_id=None,
    comment_id=None,
):

    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )

    if notification_type == "follow":

        if actor_id is not None:
            return (
                f"/users/{actor_id}"
            )

        return "/notifications"

    if notification_type == "message":

        return "/messages"

    if notification_type in {
        "like",
        "comment",
        "comment_reply",
        "mention",
        "repost",
        "new_writing",
    }:

        if writing_id is not None:

            target = (
                f"/writings/{writing_id}"
            )

            if (
                comment_id is not None
                and notification_type in {
                    "comment",
                    "comment_reply",
                    "mention",
                }
            ):

                target += (
                    f"?comment={comment_id}"
                )

            return target

    return "/notifications"


# =========================================================
# GROUP KEY
# =========================================================


def build_notification_group_key(
    notification_type,
    actor_id=None,
    writing_id=None,
    comment_id=None,
):

    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )

    if notification_type in {
        "like",
        "comment",
        "repost",
    }:

        if writing_id is not None:
            return (
                f"{notification_type}:"
                f"writing:{writing_id}"
            )

    if notification_type == "comment_reply":

        if comment_id is not None:
            return (
                "comment_reply:"
                f"comment:{comment_id}"
            )

    if notification_type == "mention":

        if comment_id is not None:
            return (
                "mention:"
                f"comment:{comment_id}"
            )

        if writing_id is not None:
            return (
                "mention:"
                f"writing:{writing_id}"
            )

    if notification_type == "follow":

        if actor_id is not None:
            return (
                f"follow:user:{actor_id}"
            )

    if notification_type == "new_writing":

        if actor_id is not None:
            return (
                "new_writing:"
                f"author:{actor_id}"
            )

    if notification_type == "message":

        if actor_id is not None:
            return (
                f"message:user:{actor_id}"
            )

    return None


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
    target_url=None,
    group_key=None,
):
    """
    Create a SHOBDO notification.

    IMPORTANT:

    This function DOES NOT emit Socket.IO events or send
    email before the database transaction succeeds.

    If commit=False, the caller controls the transaction.

    After a successful commit, call:

        deliver_notification(notification)

    This protects the social action from notification/email
    delivery failures.
    """

    recipient_id = (
        normalize_optional_id(
            recipient_id
        )
    )

    if recipient_id is None:
        return None

    actor_id = (
        normalize_optional_id(
            actor_id
        )
    )

    # -----------------------------------------------------
    # PREVENT SELF-NOTIFICATION
    # -----------------------------------------------------

    if (
        actor_id is not None
        and actor_id == recipient_id
    ):
        return None

    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )

    if not notification_type:
        return None

    if (
        notification_type
        not in VALID_NOTIFICATION_TYPES
    ):
        raise ValueError(
            "Unsupported notification type: "
            f"{notification_type}"
        )

    writing_id = (
        normalize_optional_id(
            writing_id
        )
    )

    comment_id = (
        normalize_optional_id(
            comment_id
        )
    )

    message = (
        normalize_optional_message(
            message
        )
    )

    # -----------------------------------------------------
    # TARGET
    # -----------------------------------------------------

    if target_url is None:

        target_url = (
            build_notification_target_url(
                notification_type=
                    notification_type,

                actor_id=
                    actor_id,

                writing_id=
                    writing_id,

                comment_id=
                    comment_id,
            )
        )

    else:

        target_url = (
            str(target_url)
            .strip()[:500]
        )

    # -----------------------------------------------------
    # GROUPING
    # -----------------------------------------------------

    if group_key is None:

        group_key = (
            build_notification_group_key(
                notification_type=
                    notification_type,

                actor_id=
                    actor_id,

                writing_id=
                    writing_id,

                comment_id=
                    comment_id,
            )
        )

    elif group_key:

        group_key = (
            str(group_key)
            .strip()[:255]
        )

    # -----------------------------------------------------
    # CREATE OBJECT
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

        message=
            message,

        target_url=
            target_url,

        group_key=
            group_key,

        is_read=False,

        email_sent=False,
    )

    db.session.add(
        notification
    )

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

    recipient_id = (
        normalize_optional_id(
            recipient_id
        )
    )

    if recipient_id is None:
        return 0

    notification_type = (
        normalize_notification_type(
            notification_type
        )
    )

    if not notification_type:
        return 0

    query = Notification.query.filter(
        Notification.recipient_id
        == recipient_id,

        Notification.type
        == notification_type,
    )

    if actor_id is not None:

        actor_id = (
            normalize_optional_id(
                actor_id
            )
        )

        if actor_id is None:
            return 0

        query = query.filter(
            Notification.actor_id
            == actor_id
        )

    if writing_id is not None:

        writing_id = (
            normalize_optional_id(
                writing_id
            )
        )

        if writing_id is None:
            return 0

        query = query.filter(
            Notification.writing_id
            == writing_id
        )

    if comment_id is not None:

        comment_id = (
            normalize_optional_id(
                comment_id
            )
        )

        if comment_id is None:
            return 0

        query = query.filter(
            Notification.comment_id
            == comment_id
        )

    deleted_count = query.delete(
        synchronize_session=False
    )

    if commit:
        db.session.commit()

    return deleted_count


# =========================================================
# UNREAD COUNT
# =========================================================


def get_unread_notification_count(
    recipient_id,
):

    recipient_id = (
        normalize_optional_id(
            recipient_id
        )
    )

    if recipient_id is None:
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
# MARK ONE READ
# =========================================================


def mark_notification_as_read(
    notification,
):

    if notification is None:
        return None

    if hasattr(
        notification,
        "mark_as_read",
    ):

        notification.mark_as_read()

    else:

        notification.is_read = True

        notification.read_at = (
            datetime.now(
                timezone.utc
            )
        )

    return notification


# =========================================================
# MARK ONE UNREAD
# =========================================================


def mark_notification_as_unread(
    notification,
):

    if notification is None:
        return None

    if hasattr(
        notification,
        "mark_as_unread",
    ):

        notification.mark_as_unread()

    else:

        notification.is_read = False
        notification.read_at = None

    return notification


# =========================================================
# MARK ALL READ
# =========================================================


def mark_all_notifications_as_read(
    recipient_id,
):

    recipient_id = (
        normalize_optional_id(
            recipient_id
        )
    )

    if recipient_id is None:
        return 0

    now = datetime.now(
        timezone.utc
    )

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
                    True,

                Notification.read_at:
                    now,
            },
            synchronize_session=False,
        )
    )

    return updated_count


# =========================================================
# SERIALIZATION
# =========================================================


def serialize_notification(
    notification,
):

    if notification is None:
        return None

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

    created_at = getattr(
        notification,
        "created_at",
        None,
    )

    read_at = getattr(
        notification,
        "read_at",
        None,
    )

    email_sent_at = getattr(
        notification,
        "email_sent_at",
        None,
    )

    updated_at = getattr(
        notification,
        "updated_at",
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

        "is_read":
            bool(
                getattr(
                    notification,
                    "is_read",
                    False,
                )
            ),

        "read_at":
            (
                read_at.isoformat()
                if read_at
                else None
            ),

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
                email_sent_at.isoformat()
                if email_sent_at
                else None
            ),

        "created_at":
            (
                created_at.isoformat()
                if created_at
                else None
            ),

        "updated_at":
            (
                updated_at.isoformat()
                if updated_at
                else None
            ),
    }


# =========================================================
# REAL-TIME SOCKET.IO
# =========================================================


def emit_notification(
    notification,
):

    if notification is None:
        return False

    recipient_id = getattr(
        notification,
        "recipient_id",
        None,
    )

    if recipient_id is None:
        return False

    from extensions import socketio

    data = (
        serialize_notification(
            notification
        )
    )

    if data is None:
        return False

    room = (
        f"user_{recipient_id}"
    )

    socketio.emit(
        "notification:new",
        data,
        room=room,
    )

    try:

        unread_count = (
            get_unread_notification_count(
                recipient_id
            )
        )

        socketio.emit(
            "notification:unread-count",
            {
                "unread_count":
                    unread_count,
            },
            room=room,
        )

    except Exception as error:

        print(
            "NOTIFICATION UNREAD EMIT WARNING:",
            error,
        )

    return True


# =========================================================
# EMAIL TYPE CONFIG
# =========================================================


def get_email_notification_types():

    raw_value = os.getenv(
        "EMAIL_NOTIFICATION_TYPES"
    )

    if not raw_value:

        return set(
            DEFAULT_EMAIL_NOTIFICATION_TYPES
        )

    configured_types = {
        item.strip().lower()

        for item in raw_value.split(",")

        if item.strip()
    }

    return (
        configured_types
        & VALID_NOTIFICATION_TYPES
    )


def should_email_notification(
    notification,
):

    if notification is None:
        return False

    notification_type = (
        normalize_notification_type(
            getattr(
                notification,
                "type",
                None,
            )
        )
    )

    if not notification_type:
        return False

    return (
        notification_type
        in get_email_notification_types()
    )


# =========================================================
# USER DISPLAY NAME
# =========================================================


def get_user_display_name(
    user,
    fallback="Someone",
):

    if user is None:
        return fallback

    for attribute in (
        "name",
        "username",
    ):

        value = getattr(
            user,
            attribute,
            None,
        )

        if value:

            value = str(
                value
            ).strip()

            if value:
                return value[:120]

    return fallback


# =========================================================
# EMAIL SUBJECT
# =========================================================


def build_notification_email_subject(
    notification,
):

    notification_type = (
        normalize_notification_type(
            getattr(
                notification,
                "type",
                None,
            )
        )
    )

    subjects = {
        "like":
            "Someone liked your writing on SHOBDO",

        "comment":
            "New comment on your SHOBDO writing",

        "comment_reply":
            "New reply to your comment on SHOBDO",

        "follow":
            "You have a new follower on SHOBDO",

        "mention":
            "You were mentioned on SHOBDO",

        "repost":
            "Your writing was reposted on SHOBDO",

        "message":
            "You have a new message on SHOBDO",

        "new_writing":
            "New writing from someone you follow",

        "security":
            "SHOBDO security notification",

        "system":
            "SHOBDO notification",
    }

    return subjects.get(
        notification_type,
        "New notification on SHOBDO",
    )


# =========================================================
# EMAIL MESSAGE
# =========================================================


def build_notification_email_message(
    notification,
    actor_name=None,
):

    raw_message = (
        getattr(
            notification,
            "message",
            None,
        )
    )

    raw_message = (
        str(raw_message).strip()
        if raw_message
        else ""
    )

    notification_type = (
        normalize_notification_type(
            getattr(
                notification,
                "type",
                None,
            )
        )
    )

    if notification_type in {
        "system",
        "security",
    }:

        return (
            raw_message
            or "You have a new SHOBDO notification."
        )

    if actor_name and raw_message:

        return (
            f"{actor_name} {raw_message}."
        )

    if raw_message:
        return raw_message

    return (
        "You have a new notification on SHOBDO."
    )


# =========================================================
# ABSOLUTE WEBSITE URL
# =========================================================


def build_absolute_notification_url(
    notification,
):

    base_url = (
        os.getenv(
            "PRODUCTION_FRONTEND_URL"
        )
        or os.getenv(
            "FRONTEND_URL"
        )
        or "https://shobdoverse.com"
    )

    base_url = (
        str(base_url)
        .strip()
        .rstrip("/")
    )

    target_url = (
        getattr(
            notification,
            "target_url",
            None,
        )
        or "/notifications"
    )

    target_url = (
        str(target_url)
        .strip()
    )

    # Never permit a stored notification target to redirect
    # an email button to an unrelated external website.
    parsed_target = urlparse(
        target_url
    )

    if parsed_target.scheme:

        target_url = "/notifications"

    if not target_url.startswith("/"):
        target_url = (
            "/" + target_url
        )

    return urljoin(
        base_url + "/",
        target_url.lstrip("/"),
    )


# =========================================================
# EMAIL STATE
# =========================================================


def mark_notification_email_sent(
    notification,
):

    if notification is None:
        return None

    if hasattr(
        notification,
        "mark_email_sent",
    ):

        notification.mark_email_sent()

    else:

        notification.email_sent = True

        notification.email_sent_at = (
            datetime.now(
                timezone.utc
            )
        )

        notification.email_error = None

    return notification


def mark_notification_email_failed(
    notification,
    error,
):

    if notification is None:
        return None

    if hasattr(
        notification,
        "mark_email_failed",
    ):

        notification.mark_email_failed(
            error
        )

    else:

        notification.email_sent = False
        notification.email_sent_at = None

        notification.email_error = (
            str(error or "")[:500]
        )

    return notification


# =========================================================
# SEND EMAIL FOR NOTIFICATION
# =========================================================


def send_notification_email_for_notification(
    notification,
):
    """
    Best-effort email delivery.

    IMPORTANT:

    Call only AFTER the original social action and
    notification have committed.

    Email failure must never roll back:
        like
        comment
        follow
        repost
        etc.
    """

    if notification is None:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Notification is missing.",
        }

    if not should_email_notification(
        notification
    ):

        return {
            "success": False,
            "skipped": True,
            "error":
                "Notification type is not enabled for email.",
        }

    recipient_id = getattr(
        notification,
        "recipient_id",
        None,
    )

    if recipient_id is None:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Notification recipient is missing.",
        }

    # -----------------------------------------------------
    # IMPORT LOCALLY TO REDUCE CIRCULAR IMPORT RISK
    # -----------------------------------------------------

    from models.user import User

    recipient = db.session.get(
        User,
        recipient_id,
    )

    if recipient is None:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Recipient user does not exist.",
        }

    recipient_email = (
        getattr(
            recipient,
            "email",
            None,
        )
    )

    if not recipient_email:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Recipient has no email address.",
        }

    email_verified = bool(
        getattr(
            recipient,
            "email_verified",
            False,
        )
    )

    if not email_verified:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Recipient email is not verified.",
        }

    actor = None

    actor_id = getattr(
        notification,
        "actor_id",
        None,
    )

    if actor_id is not None:

        actor = db.session.get(
            User,
            actor_id,
        )

    actor_name = (
        get_user_display_name(
            actor
        )
        if actor
        else None
    )

    recipient_name = (
        get_user_display_name(
            recipient,
            fallback="SHOBDO user",
        )
    )

    subject = (
        build_notification_email_subject(
            notification
        )
    )

    message = (
        build_notification_email_message(
            notification,
            actor_name=
                actor_name,
        )
    )

    action_url = (
        build_absolute_notification_url(
            notification
        )
    )

    try:

        from services.email_notification_service import (
            send_notification_email,
        )

        result = send_notification_email(
            recipient_email=
                recipient_email,

            recipient_name=
                recipient_name,

            subject=
                subject,

            message=
                message,

            action_url=
                action_url,
        )

    except Exception as error:

        result = {
            "success": False,
            "skipped": False,
            "error": str(error),
        }

    # -----------------------------------------------------
    # STORE EMAIL DELIVERY STATE
    # -----------------------------------------------------

    try:

        if result.get("success"):

            mark_notification_email_sent(
                notification
            )

        elif not result.get("skipped"):

            mark_notification_email_failed(
                notification,
                result.get("error"),
            )

        db.session.commit()

    except Exception as state_error:

        db.session.rollback()

        print(
            "NOTIFICATION EMAIL STATE WARNING:",
            state_error,
        )

    return result


# =========================================================
# DELIVER AFTER COMMIT
# =========================================================


def deliver_notification(
    notification,
    send_email=True,
):
    """
    Deliver an already committed notification.

    This is intentionally separate from create_notification().

    Flow:

        social action
            ↓
        create notification
            ↓
        db.session.commit()
            ↓
        deliver_notification(notification)
            ↓
        Socket.IO
            +
        email where eligible

    Delivery problems do not undo the original action.
    """

    result = {
        "socket_sent": False,
        "email": None,
    }

    if notification is None:
        return result

    # -----------------------------------------------------
    # SOCKET.IO
    # -----------------------------------------------------

    try:

        result["socket_sent"] = (
            emit_notification(
                notification
            )
        )

    except Exception as error:

        print(
            "NOTIFICATION SOCKET ERROR:",
            error,
        )

    # -----------------------------------------------------
    # EMAIL
    # -----------------------------------------------------

    if send_email:

        try:

            result["email"] = (
                send_notification_email_for_notification(
                    notification
                )
            )

        except Exception as error:

            print(
                "NOTIFICATION EMAIL ERROR:",
                error,
            )

            result["email"] = {
                "success": False,
                "skipped": False,
                "error": str(error),
            }

    return result


# =========================================================
# LIKE
# =========================================================


def notify_like(
    recipient_id,
    actor_id,
    writing_id,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "like",

        writing_id=
            writing_id,

        message=
            "liked your writing",

        commit=
            commit,
    )


# =========================================================
# COMMENT
# =========================================================


def notify_comment(
    recipient_id,
    actor_id,
    writing_id,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "comment",

        writing_id=
            writing_id,

        comment_id=
            comment_id,

        message=
            "commented on your writing",

        commit=
            commit,
    )


# =========================================================
# COMMENT REPLY
# =========================================================


def notify_comment_reply(
    recipient_id,
    actor_id,
    writing_id,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "comment_reply",

        writing_id=
            writing_id,

        comment_id=
            comment_id,

        message=
            "replied to your comment",

        commit=
            commit,
    )


# =========================================================
# FOLLOW
# =========================================================


def notify_follow(
    recipient_id,
    actor_id,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "follow",

        message=
            "started following you",

        commit=
            commit,
    )


# =========================================================
# MENTION
# =========================================================


def notify_mention(
    recipient_id,
    actor_id,
    writing_id=None,
    comment_id=None,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "mention",

        writing_id=
            writing_id,

        comment_id=
            comment_id,

        message=
            "mentioned you",

        commit=
            commit,
    )


# =========================================================
# REPOST
# =========================================================


def notify_repost(
    recipient_id,
    actor_id,
    writing_id,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "repost",

        writing_id=
            writing_id,

        message=
            "reposted your writing",

        commit=
            commit,
    )


# =========================================================
# MESSAGE
# =========================================================


def notify_message(
    recipient_id,
    actor_id,
    message=None,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "message",

        message=
            (
                message
                or "sent you a message"
            ),

        commit=
            commit,
    )


# =========================================================
# NEW WRITING
# =========================================================


def notify_new_writing(
    recipient_id,
    actor_id,
    writing_id,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=
            actor_id,

        notification_type=
            "new_writing",

        writing_id=
            writing_id,

        message=
            "published a new writing",

        commit=
            commit,
    )


# =========================================================
# SYSTEM
# =========================================================


def notify_system(
    recipient_id,
    message,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=None,

        notification_type=
            "system",

        message=
            message,

        commit=
            commit,
    )


# =========================================================
# SECURITY
# =========================================================


def notify_security(
    recipient_id,
    message,
    commit=False,
):

    return create_notification(
        recipient_id=
            recipient_id,

        actor_id=None,

        notification_type=
            "security",

        message=
            message,

        commit=
            commit,
    )