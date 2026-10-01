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
    # Rahul followed Subhadip
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
    # Recommended values:
    #
    # LIKE
    # COMMENT
    # COMMENT_REPLY
    # FOLLOW
    # MENTION
    # REPOST
    # MESSAGE
    # NEW_WRITING
    # SYSTEM
    # SECURITY
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
    #
    # This should be considered fallback/custom text.
    #
    # Normal social notifications should preferably be
    # generated from:
    #
    # type
    # actor
    # writing
    # comment
    #
    # This allows multilingual notification rendering.
    #
    # =====================================================

    message = db.Column(
        db.String(500),
        nullable=True,
    )

    # =====================================================
    # TARGET URL
    # =====================================================
    #
    # Where the user should go after clicking notification.
    #
    # Examples:
    #
    # /users/12
    # /writings/8
    # /writings/8?comment=24
    # /messages/5
    #
    # =====================================================

    target_url = db.Column(
        db.String(500),
        nullable=True,
    )

    # =====================================================
    # GROUP KEY
    # =====================================================
    #
    # Used later for Facebook-style grouping.
    #
    # Example:
    #
    # LIKE:writing:8
    #
    # Multiple likes on writing 8 can then become:
    #
    # "Rahul, Priya and 3 others liked your writing."
    #
    # =====================================================

    group_key = db.Column(
        db.String(255),
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
        index=True,
    )

    read_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # EMAIL DELIVERY
    # =====================================================

    email_sent = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    email_sent_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    email_error = db.Column(
        db.String(500),
        nullable=True,
    )

    # =====================================================
    # CREATED / UPDATED DATE
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        index=True,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
        onupdate=lambda: datetime.now(
            timezone.utc
        ),
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
    # HELPERS
    # =====================================================

    def mark_as_read(self):

        if not self.is_read:

            self.is_read = True

            self.read_at = datetime.now(
                timezone.utc
            )

    def mark_as_unread(self):

        self.is_read = False
        self.read_at = None

    def mark_email_sent(self):

        self.email_sent = True

        self.email_sent_at = datetime.now(
            timezone.utc
        )

        self.email_error = None

    def mark_email_failed(
        self,
        error=None,
    ):

        self.email_sent = False
        self.email_sent_at = None

        if error:

            self.email_error = str(error)[:500]

    # =====================================================
    # JSON RESPONSE
    # =====================================================

    def to_dict(self):

        actor_data = None

        if self.actor:

            actor_data = {

                "id":
                    self.actor.id,

                "name":
                    getattr(
                        self.actor,
                        "name",
                        None,
                    ),

                "username":
                    getattr(
                        self.actor,
                        "username",
                        None,
                    ),

                "avatar_url":
                    getattr(
                        self.actor,
                        "avatar_url",
                        None,
                    ),
            }

        writing_data = None

        if self.writing:

            writing_data = {

                "id":
                    self.writing.id,

                "title":
                    self.writing.title,
            }

        return {

            "id":
                self.id,

            "type":
                self.type,

            "recipient_id":
                self.recipient_id,

            "actor_id":
                self.actor_id,

            "actor":
                actor_data,

            "writing_id":
                self.writing_id,

            "writing":
                writing_data,

            "comment_id":
                self.comment_id,

            "message":
                self.message,

            "target_url":
                self.target_url,

            "group_key":
                self.group_key,

            "is_read":
                self.is_read,

            "read_at":
                (
                    self.read_at.isoformat()
                    if self.read_at
                    else None
                ),

            "email_sent":
                self.email_sent,

            "email_sent_at":
                (
                    self.email_sent_at.isoformat()
                    if self.email_sent_at
                    else None
                ),

            "created_at":
                (
                    self.created_at.isoformat()
                    if self.created_at
                    else None
                ),

            "updated_at":
                (
                    self.updated_at.isoformat()
                    if self.updated_at
                    else None
                ),
        }