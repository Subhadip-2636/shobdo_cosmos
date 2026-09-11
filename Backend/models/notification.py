from datetime import datetime, timezone

from database import db


class Notification(db.Model):

    __tablename__ = "notifications"

    # =====================================================
    # TABLE INDEXES
    # =====================================================

    __table_args__ = (
        db.Index(
            "ix_notifications_recipient_read_created",
            "recipient_id",
            "is_read",
            "created_at",
        ),
    )

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # RECIPIENT
    # =====================================================
    #
    # The user who receives the notification.
    #
    # Example:
    #
    # Rahul likes Subhadip's writing.
    #
    # recipient_id = Subhadip
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

    # =====================================================
    # ACTOR
    # =====================================================
    #
    # The user who performed the action.
    #
    # Example:
    #
    # Rahul likes Subhadip's writing.
    #
    # actor_id = Rahul
    #
    # System notifications can have actor_id = NULL.
    #
    # =====================================================

    actor_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="SET NULL",
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
    # like
    # comment
    # follow
    # reply
    # mention
    # system
    #
    # =====================================================

    type = db.Column(
        db.String(30),
        nullable=False,
        index=True,
    )

    # =====================================================
    # WRITING REFERENCE
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
    # COMMENT REFERENCE
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
    # READ STATUS
    # =====================================================

    is_read = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default=db.text("false"),
        index=True,
    )

    # =====================================================
    # CREATED TIME
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {
            "id": self.id,
            "recipient_id": self.recipient_id,
            "actor_id": self.actor_id,
            "type": self.type,
            "writing_id": self.writing_id,
            "comment_id": self.comment_id,
            "is_read": self.is_read,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }

    # =====================================================
    # DEBUG REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Notification "
            f"id={self.id} "
            f"type={self.type} "
            f"recipient_id={self.recipient_id} "
            f"actor_id={self.actor_id} "
            f"is_read={self.is_read}>"
        )