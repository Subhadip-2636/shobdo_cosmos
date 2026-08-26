from database import db


# =========================================================
# WRITING ↔ TAG ASSOCIATION
# =========================================================

writing_tags = db.Table(

    "writing_tags",

    db.Column(
        "writing_id",
        db.Integer,
        db.ForeignKey(
            "writings.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    db.Column(
        "tag_id",
        db.Integer,
        db.ForeignKey(
            "tags.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


class Tag(db.Model):

    __tablename__ = "tags"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    # =====================================================
    # TAG NAME
    # =====================================================

    name = db.Column(
        db.String(60),
        nullable=False,
        unique=True,
        index=True,
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    writings = db.relationship(
        "Writing",
        secondary=writing_tags,
        back_populates="tags",
        lazy="select",
    )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {
            "id":
                self.id,

            "name":
                self.name,
        }

    def __repr__(self):

        return (
            f"<Tag "
            f"id={self.id} "
            f"name={self.name!r}>"
        )