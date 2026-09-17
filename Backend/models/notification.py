from datetime import datetime, timezone

from database import db


class Notification(db.Model):

    __tablename__ = "notifications"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # USERS
    # =====================================================
    #
    # recipient_id = user receiving the notification
    # actor_id     = user who caused the notification
    #
    # Example:
    #
    # Rahul liked Subhadip's writing
    #
    # recipient_id = Subhadip
    # actor_id     = Rahul
    #
    # =====================================================

    recipient_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    actor_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # NOTIFICATION TYPE
    # =====================================================
    #
    # Supported values:
    #
    # LIKE
    # COMMENT
    # COMMENT_REPLY
    # FOLLOW
    # MENTION
    # REPOST
    # SYSTEM
    #
    # =====================================================

    type = db.Column(
        db.String(50),
        nullable=False,
        index=True,
    )

    # =====================================================
    # RELATED WRITING
    # =====================================================

    writing_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "writings.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # RELATED COMMENT
    # =====================================================

    comment_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # OPTIONAL MESSAGE
    # =====================================================

    message = db.Column(
        db.String(500),
        nullable=True,
    )

    # =====================================================
    # READ STATUS
    # =====================================================

    is_read = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    # =====================================================
    # CREATED DATE
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        index=True,
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    recipient = db.relationship(
        "User",
        foreign_keys=[recipient_id],
        lazy="joined",
    )

    actor = db.relationship(
        "User",
        foreign_keys=[actor_id],
        lazy="joined",
    )

    writing = db.relationship(
        "Writing",
        foreign_keys=[writing_id],
        lazy="joined",
    )

    # =====================================================
    # JSON RESPONSE
    # =====================================================

    def to_dict(self):

        actor_data = None

        if self.actor:

            actor_data = {
                "id": self.actor.id,
                "name": getattr(
                    self.actor,
                    "name",
                    None,
                ),
                "username": getattr(
                    self.actor,
                    "username",
                    None,
                ),
                "avatar_url": getattr(
                    self.actor,
                    "avatar_url",
                    None,
                ),
            }

        writing_data = None

        if self.writing:

            writing_data = {
                "id": self.writing.id,
                "title": self.writing.title,
            }

        return {

            "id": self.id,

            "type": self.type,

            "recipient_id":
                self.recipient_id,

            "actor":
                actor_data,

            "writing":
                writing_data,

            "comment_id":
                self.comment_id,

            "message":
                self.message,

            "is_read":
                self.is_read,

            "created_at":
                (
                    self.created_at.isoformat()
                    if self.created_at
                    else None
                ),
        }