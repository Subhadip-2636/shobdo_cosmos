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
    # COMMENT
    # =====================================================

    content = db.Column(
        db.Text,
        nullable=False,
    )

    # =====================================================
    # USER
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
    # TIMESTAMP
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda:
            datetime.now(
                timezone.utc
            ),
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    author = db.relationship(
        "User",
        backref=db.backref(
            "comments",
            lazy=True,
            cascade="all, delete-orphan",
        ),
    )

    writing = db.relationship(
        "Writing",
        back_populates="comments",
    )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {
            "id":
                self.id,

            "content":
                self.content,

            "user_id":
                self.user_id,

            "writing_id":
                self.writing_id,

            "author": {
                "id":
                    self.author.id,

                "name":
                    self.author.name,
            }
            if self.author
            else None,

            "created_at":
                self.created_at.isoformat()
                if self.created_at
                else None,
        }

    def __repr__(self):

        return (
            f"<Comment "
            f"id={self.id} "
            f"writing_id={self.writing_id}>"
        )