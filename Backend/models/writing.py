from datetime import datetime, timezone

from database import db


class Writing(db.Model):

    __tablename__ = "writings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(250),
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    category = db.Column(
        db.String(50),
        nullable=False,
        default="অন্যান্য"
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="published",
        index=True
    )

    author_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    author = db.relationship(
        "User",
        back_populates="writings"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "status": self.status,
            "author_id": self.author_id,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),

            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),

            "author": {
                "id": self.author.id,
                "name": self.author.name
            } if self.author else None
        }

    def __repr__(self):
        return f"<Writing id={self.id} title={self.title}>"