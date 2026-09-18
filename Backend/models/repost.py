from datetime import datetime, timezone

from database import db


# =========================================================
# TIME HELPER
# =========================================================

def utc_now():

    return datetime.now(
        timezone.utc
    )


# =========================================================
# REPOST MODEL
# =========================================================

class Repost(db.Model):

    __tablename__ = "reposts"


    # =====================================================
    # TABLE CONSTRAINTS / INDEXES
    # =====================================================

    __table_args__ = (

        db.UniqueConstraint(
            "user_id",
            "writing_id",
            name="uq_reposts_user_writing",
        ),

        db.Index(
            "ix_reposts_writing_created_at",
            "writing_id",
            "created_at",
        ),

        db.Index(
            "ix_reposts_user_created_at",
            "user_id",
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
    # CREATED AT
    # =====================================================

    created_at = db.Column(
        db.DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    user = db.relationship(
        "User",
        foreign_keys=[user_id],
        lazy="joined",
    )


    writing = db.relationship(
        "Writing",
        foreign_keys=[writing_id],
        lazy="joined",
    )


    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        user_data = None


        if self.user:

            user_data = {

                "id":
                    self.user.id,

                "name":
                    getattr(
                        self.user,
                        "name",
                        None,
                    ),

                "username":
                    getattr(
                        self.user,
                        "username",
                        None,
                    ),

                "avatar_url":
                    getattr(
                        self.user,
                        "avatar_url",
                        None,
                    ),
            }


        return {

            "id":
                self.id,

            "user_id":
                self.user_id,

            "writing_id":
                self.writing_id,

            "user":
                user_data,

            "created_at":
                (
                    self.created_at.isoformat()
                    if self.created_at
                    else None
                ),
        }


    # =====================================================
    # DEBUG
    # =====================================================

    def __repr__(self):

        return (
            f"<Repost "
            f"id={self.id} "
            f"user_id={self.user_id} "
            f"writing_id={self.writing_id}>"
        )