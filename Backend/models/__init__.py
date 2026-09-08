# =========================================================
# SHOBDO — MODEL REGISTRY
# =========================================================

from models.user import User
from models.writing import Writing
from models.comment import Comment
from models.like import Like
from models.follow import Follow
from models.tag import (
    Tag,
    writing_tags,
)


__all__ = [
    "User",
    "Writing",
    "Comment",
    "Like",
    "Follow",
    "Tag",
    "writing_tags",
]