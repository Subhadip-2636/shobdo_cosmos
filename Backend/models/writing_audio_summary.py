from datetime import datetime, timezone

from database import db


class WritingAudioSummary(db.Model):

    __tablename__ = "writing_audio_summaries"

    # =====================================================
    # TABLE CONSTRAINTS
    # =====================================================

    __table_args__ = (

        db.UniqueConstraint(
            "writing_id",
            "language",
            name="uq_writing_audio_summary_language",
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
    # LANGUAGE
    # =====================================================
    #
    # Supported SHOBDO language codes:
    #
    # bn = Bengali
    # hi = Hindi
    # en = English
    # as = Assamese
    # or = Odia
    # ta = Tamil
    # te = Telugu
    #
    # Each writing can have one cached summary/audio
    # for each language.
    #
    # =====================================================

    language = db.Column(
        db.String(20),
        nullable=False,
        index=True,
    )

    # =====================================================
    # SUMMARY TEXT
    # =====================================================

    summary_text = db.Column(
        db.Text,
        nullable=True,
    )

    # =====================================================
    # GENERATION STATUS
    # =====================================================
    #
    # pending
    # summarizing
    # translating
    # synthesizing
    # ready
    # failed
    #
    # =====================================================

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending",
        server_default="pending",
        index=True,
    )

    # =====================================================
    # SUMMARY AI
    # =====================================================

    summary_provider = db.Column(
        db.String(100),
        nullable=True,
    )

    summary_model = db.Column(
        db.String(150),
        nullable=True,
    )

    # =====================================================
    # TRANSLATION AI
    # =====================================================

    translation_provider = db.Column(
        db.String(100),
        nullable=True,
    )

    translation_model = db.Column(
        db.String(150),
        nullable=True,
    )

    # =====================================================
    # TEXT TO SPEECH
    # =====================================================

    tts_provider = db.Column(
        db.String(100),
        nullable=True,
    )

    tts_model = db.Column(
        db.String(150),
        nullable=True,
    )

    voice = db.Column(
        db.String(150),
        nullable=True,
    )

    # =====================================================
    # AUDIO STORAGE
    # =====================================================

    audio_url = db.Column(
        db.Text,
        nullable=True,
    )

    audio_public_id = db.Column(
        db.String(500),
        nullable=True,
    )

    audio_duration_seconds = db.Column(
        db.Float,
        nullable=True,
    )

    # =====================================================
    # ERROR INFORMATION
    # =====================================================

    error_message = db.Column(
        db.Text,
        nullable=True,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(
            timezone.utc
        ),
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

    generated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    writing = db.relationship(
        "Writing",
        back_populates="audio_summaries",
    )

    # =====================================================
    # HELPERS
    # =====================================================

    @property
    def is_ready(self):

        return (
            self.status == "ready"
            and bool(self.audio_url)
        )

    @property
    def has_summary(self):

        return bool(
            self.summary_text
        )

    @property
    def has_audio(self):

        return bool(
            self.audio_url
        )

    # =====================================================
    # SERIALIZATION
    # =====================================================

    def to_dict(self):

        return {

            "id":
                self.id,

            "writing_id":
                self.writing_id,

            "language":
                self.language,

            "summary_text":
                self.summary_text,

            "status":
                self.status,

            "is_ready":
                self.is_ready,

            "has_summary":
                self.has_summary,

            "has_audio":
                self.has_audio,

            "audio_url":
                self.audio_url,

            "audio_duration_seconds":
                self.audio_duration_seconds,

            "voice":
                self.voice,

            "tts_provider":
                self.tts_provider,

            "tts_model":
                self.tts_model,

            "summary_provider":
                self.summary_provider,

            "summary_model":
                self.summary_model,

            "translation_provider":
                self.translation_provider,

            "translation_model":
                self.translation_model,

            "error_message":
                self.error_message,

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

            "generated_at":
                (
                    self.generated_at.isoformat()

                    if self.generated_at

                    else None
                ),

        }

    # =====================================================
    # DEBUG REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (

            f"<WritingAudioSummary "

            f"id={self.id} "

            f"writing_id={self.writing_id} "

            f"language={self.language!r} "

            f"status={self.status!r}>"
        )