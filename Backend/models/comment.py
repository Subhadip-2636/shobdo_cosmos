from datetime import datetime, timezone

from database import db


class Comment(db.Model):

    __tablename__ = "comments"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # COMMENT CONTENT
    # =====================================================

    content = db.Column(
        db.Text,
        nullable=False,
    )

    # =====================================================
    # USER / AUTHOR
    # =====================================================

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # WRITING
    # =====================================================

    writing_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "writings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # PARENT COMMENT
    # =====================================================
    #
    # NULL:
    #     Normal top-level comment
    #
    # Integer:
    #     Reply to another comment
    #
    # Example:
    #
    # Comment 10
    #     parent_id = NULL
    #
    # Reply 11
    #     parent_id = 10
    #
    # =====================================================

    parent_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # CREATED TIMESTAMP
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda:
            datetime.now(
                timezone.utc
            ),
        index=True,
    )

    # =====================================================
    # UPDATED TIMESTAMP
    # =====================================================
    #
    # Remains NULL until the comment is edited.
    #
    # =====================================================

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # RELATIONSHIP — AUTHOR
    # =====================================================

    author = db.relationship(
        "User",
        foreign_keys=[user_id],
        backref=db.backref(
            "comments",
            lazy=True,
            cascade="all, delete-orphan",
        ),
    )

    # =====================================================
    # RELATIONSHIP — WRITING
    # =====================================================

    writing = db.relationship(
        "Writing",
        foreign_keys=[writing_id],
        back_populates="comments",
    )

    # =====================================================
    # SELF-REFERENTIAL COMMENT RELATIONSHIPS
    # =====================================================
    #
    # parent:
    #     The comment this comment replies to.
    #
    # replies:
    #     Replies belonging to this comment.
    #
    # =====================================================

    parent = db.relationship(
        "Comment",

        remote_side=[
            id
        ],

        foreign_keys=[
            parent_id
        ],

        back_populates=
            "replies",
    )


    replies = db.relationship(
        "Comment",

        foreign_keys=[
            parent_id
        ],

        back_populates=
            "parent",

        cascade=
            "all, delete-orphan",

        passive_deletes=
            True,

        order_by=
            "Comment.created_at.asc()",

        lazy=
            "select",
    )

    # =====================================================
    # DATABASE INDEXES / CONSTRAINTS
    # =====================================================

    __table_args__ = (

        db.CheckConstraint(
            (
                "parent_id IS NULL "
                "OR parent_id <> id"
            ),
            name=
                "ck_comment_not_own_parent",
        ),

        db.Index(
            "ix_comments_writing_parent_created",
            "writing_id",
            "parent_id",
            "created_at",
        ),
    )

    # =====================================================
    # PROPERTIES
    # =====================================================

    @property
    def is_reply(self):
        """
        True when this comment is a reply.
        """

        return (
            self.parent_id
            is not None
        )


    @property
    def is_edited(self):
        """
        True when the comment has been edited.
        """

        return (
            self.updated_at
            is not None
        )


    @property
    def reply_count(self):
        """
        Number of direct replies.
        """

        try:

            return len(
                self.replies
            )

        except Exception:

            return 0

    # =====================================================
    # EDIT HELPER
    # =====================================================

    def update_content(
        self,
        content,
    ):
        """
        Update comment content and set edit timestamp.

        The caller controls db.session.commit().
        """

        normalized_content = (
            str(
                content or ""
            )
            .strip()
        )


        if not normalized_content:

            raise ValueError(
                "Comment cannot be empty."
            )


        self.content = (
            normalized_content
        )


        self.updated_at = (
            datetime.now(
                timezone.utc
            )
        )


        return self

    # =====================================================
    # AUTHOR SERIALIZATION
    # =====================================================

    def get_author_dict(self):

        if not self.author:

            return None


        return {

            "id":
                self.author.id,

            "name":
                getattr(
                    self.author,
                    "name",
                    None,
                ),

            "username":
                getattr(
                    self.author,
                    "username",
                    None,
                ),

            "avatar_url":
                getattr(
                    self.author,
                    "avatar_url",
                    None,
                ),
        }

    # =====================================================
    # PARENT SERIALIZATION
    # =====================================================

    def get_parent_dict(self):

        if not self.parent:

            return None


        return {

            "id":
                self.parent.id,

            "user_id":
                self.parent.user_id,

            "author":
                self.parent
                .get_author_dict(),
        }

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(
        self,
        include_replies=False,
        reply_depth=1,
    ):
        """
        Convert comment to JSON-safe dictionary.

        include_replies=False
            keeps compatibility with existing SHOBDO routes.

        include_replies=True
            includes nested replies.

        reply_depth controls how deeply nested replies are
        serialized.

        Example:

            comment.to_dict(
                include_replies=True,
                reply_depth=2,
            )
        """

        data = {

            "id":
                self.id,

            "content":
                self.content,

            "user_id":
                self.user_id,

            "writing_id":
                self.writing_id,

            "parent_id":
                self.parent_id,

            "is_reply":
                self.is_reply,

            "is_edited":
                self.is_edited,

            "reply_count":
                self.reply_count,

            "author":
                self.get_author_dict(),

            "parent":
                self.get_parent_dict(),

            "created_at":
                (
                    self.created_at
                    .isoformat()

                    if self.created_at
                    else None
                ),

            "updated_at":
                (
                    self.updated_at
                    .isoformat()

                    if self.updated_at
                    else None
                ),
        }


        # =================================================
        # OPTIONAL NESTED REPLIES
        # =================================================

        if (
            include_replies
            and reply_depth > 0
        ):

            data["replies"] = [

                reply.to_dict(
                    include_replies=True,
                    reply_depth=
                        reply_depth - 1,
                )

                for reply
                in self.replies

            ]

        else:

            data["replies"] = []


        return data

    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Comment "
            f"id={self.id} "
            f"writing_id={self.writing_id} "
            f"user_id={self.user_id} "
            f"parent_id={self.parent_id}>"
        )