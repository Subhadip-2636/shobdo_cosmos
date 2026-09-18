# =========================================================
# SHOBDO WRITING ROUTES
# =========================================================

from datetime import datetime, timezone
import io
import os
import re
import shutil
import unicodedata
from pathlib import Path

import pymupdf
import pytesseract

from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from PIL import (
    Image,
    ImageOps,
    UnidentifiedImageError,
)

from database import db

from models.writing import Writing
from models.comment import Comment
from models.like import Like
from models.tag import Tag


# =========================================================
# BLUEPRINT
# =========================================================

writings_bp = Blueprint(
    "writings",
    __name__,
)

# Compatibility alias if App.py imports writing_bp.
writing_bp = writings_bp


# =========================================================
# CONSTANTS
# =========================================================

MAX_FILE_SIZE = 10 * 1024 * 1024

MAX_PDF_PAGES = 30


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}


OCR_LANGUAGE_MAP = {
    "bn": "ben",
    "en": "eng",
    "hi": "hin",
}


ALLOWED_WRITING_LANGUAGES = {
    "bn",
    "en",
    "hi",
}


ALLOWED_CATEGORIES = {
    "কবিতা",
    "গল্প",
    "অনুভূতি",
    "প্রবন্ধ",
    "অন্যান্য",
}


# =========================================================
# HASHTAG CONFIGURATION
# =========================================================

MAX_HASHTAGS_PER_WRITING = 20

MAX_TAG_LENGTH = 60


# Detect only the hashtag marker here.
#
# The characters following "#" are parsed manually using
# Unicode categories so that Bengali, Hindi, English and
# other Indic scripts work correctly.
HASHTAG_MARKER_PATTERN = re.compile(
    r"(?<![\w#])#",
    flags=re.UNICODE,
)


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

def configure_tesseract():
    """
    Search order:

    1. TESSERACT_CMD environment variable
    2. Windows PATH
    3. Standard Windows installation locations
    """

    environment_command = os.getenv(
        "TESSERACT_CMD"
    )


    if (
        environment_command
        and
        Path(
            environment_command
        ).is_file()
    ):

        pytesseract.pytesseract.tesseract_cmd = (
            environment_command
        )

        return


    path_command = shutil.which(
        "tesseract"
    )


    if path_command:

        pytesseract.pytesseract.tesseract_cmd = (
            path_command
        )

        return


    possible_locations = [

        Path(
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        ),

        Path(
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        ),

    ]


    for location in possible_locations:

        if location.is_file():

            pytesseract.pytesseract.tesseract_cmd = (
                str(
                    location
                )
            )

            return


configure_tesseract()


# =========================================================
# GENERAL HELPERS
# =========================================================

def error_response(
    message,
    status_code=400,
):

    return (

        jsonify({
            "success":
                False,

            "message":
                message,
        }),

        status_code,

    )


# =========================================================


def get_current_user_id():

    identity = (
        get_jwt_identity()
    )


    try:

        return int(
            identity
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


# =========================================================


def get_optional_user_id():

    identity = (
        get_jwt_identity()
    )


    if identity is None:

        return None


    try:

        return int(
            identity
        )


    except (
        TypeError,
        ValueError,
    ):

        return None


# =========================================================


def get_model_item(
    model,
    item_id,
):

    return db.session.get(
        model,
        item_id,
    )


# =========================================================


def get_author_name(
    user,
):

    if user is None:

        return (
            "Unknown Author"
        )


    return (

        getattr(
            user,
            "name",
            None,
        )

        or

        getattr(
            user,
            "username",
            None,
        )

        or

        "Unknown Author"

    )


# =========================================================


def get_author_id(
    user,
):

    if user is None:

        return None


    return getattr(
        user,
        "id",
        None,
    )


# =========================================================


def get_created_at(
    item,
):

    created_at = getattr(
        item,
        "created_at",
        None,
    )


    return (

        created_at.isoformat()

        if created_at

        else None

    )


# =========================================================


def get_updated_at(
    item,
):

    updated_at = getattr(
        item,
        "updated_at",
        None,
    )


    return (

        updated_at.isoformat()

        if updated_at

        else None

    )


# =========================================================


def parse_page_and_limit(
    default_limit=12,
    max_limit=50,
):

    try:

        page = int(

            request.args.get(
                "page",
                1,
            )

        )


    except (
        TypeError,
        ValueError,
    ):

        page = 1


    try:

        limit = int(

            request.args.get(
                "limit",
                default_limit,
            )

        )


    except (
        TypeError,
        ValueError,
    ):

        limit = (
            default_limit
        )


    page = max(
        page,
        1,
    )


    limit = min(

        max(
            limit,
            1,
        ),

        max_limit,

    )


    return (
        page,
        limit,
    )


# =========================================================
# HASHTAG HELPERS
# =========================================================

def is_hashtag_start_character(
    character,
):
    """
    A hashtag may begin with a Unicode letter or number.

    Examples:

    #কবিতা
    #कविता
    #Poetry
    #2026
    """

    if not character:

        return False


    category = (
        unicodedata.category(
            character
        )
    )


    return category.startswith(
        (
            "L",
            "N",
        )
    )


# =========================================================


def is_hashtag_character(
    character,
):
    """
    Characters allowed after the first hashtag character:

    - Unicode letters
    - Unicode combining marks
    - Unicode numbers
    - underscore
    - ZWNJ
    - ZWJ
    """

    if not character:

        return False


    if character in {
        "_",
        "\u200c",
        "\u200d",
    }:

        return True


    category = (
        unicodedata.category(
            character
        )
    )


    return category.startswith(
        (
            "L",
            "M",
            "N",
        )
    )


# =========================================================


def normalize_tag_name(
    value,
):
    """
    Normalize one hashtag.

    Input examples:

    #কবিতা
    কবিতা
    #Poetry

    Returned value does not contain "#".
    """

    value = (
        unicodedata.normalize(
            "NFKC",
            str(
                value or ""
            ),
        )
        .strip()
    )


    if value.startswith(
        "#"
    ):

        value = value[
            1:
        ]


    if not value:

        return None


    characters = []


    for character in value:

        if not characters:

            if not is_hashtag_start_character(
                character
            ):

                return None


            characters.append(
                character
            )

            continue


        if not is_hashtag_character(
            character
        ):

            break


        characters.append(
            character
        )


        if (
            len(
                characters
            )
            >
            MAX_TAG_LENGTH
        ):

            return None


    tag_name = (
        "".join(
            characters
        )
        .strip(
            "_"
        )
    )


    if not tag_name:

        return None


    if (
        len(
            tag_name
        )
        >
        MAX_TAG_LENGTH
    ):

        return None


    return tag_name


# =========================================================


def extract_hashtags(
    title="",
    content="",
):
    """
    Extract unique hashtags from title + content.

    Example:

    আজ #কবিতা লিখলাম।
    #বাংলাসাহিত্য #প্রকৃতি

    Result:

    [
        "কবিতা",
        "বাংলাসাহিত্য",
        "প্রকৃতি",
    ]
    """

    combined_text = (
        unicodedata.normalize(
            "NFKC",
            (
                f"{title or ''}\n"
                f"{content or ''}"
            ),
        )
    )


    tag_names = []

    seen = set()


    for marker in (
        HASHTAG_MARKER_PATTERN
        .finditer(
            combined_text
        )
    ):

        start_index = (
            marker.end()
        )


        if (
            start_index
            >=
            len(
                combined_text
            )
        ):

            continue


        first_character = (
            combined_text[
                start_index
            ]
        )


        if not is_hashtag_start_character(
            first_character
        ):

            continue


        characters = [
            first_character
        ]


        current_index = (
            start_index + 1
        )


        while (
            current_index
            <
            len(
                combined_text
            )
        ):

            character = (
                combined_text[
                    current_index
                ]
            )


            if not is_hashtag_character(
                character
            ):

                break


            characters.append(
                character
            )


            if (
                len(
                    characters
                )
                >
                MAX_TAG_LENGTH
            ):

                break


            current_index += 1


        if (
            len(
                characters
            )
            >
            MAX_TAG_LENGTH
        ):

            continue


        tag_name = (
            normalize_tag_name(
                "".join(
                    characters
                )
            )
        )


        if not tag_name:

            continue


        key = (
            tag_name.lower()
        )


        if key in seen:

            continue


        seen.add(
            key
        )


        tag_names.append(
            tag_name
        )


        if (
            len(
                tag_names
            )
            >=
            MAX_HASHTAGS_PER_WRITING
        ):

            break


    return tag_names


# =========================================================


def serialize_tag(
    tag,
):

    name = str(

        getattr(
            tag,
            "name",
            "",
        )

        or ""

    )


    return {

        "id":
            getattr(
                tag,
                "id",
                None,
            ),

        "name":
            name,

        "hashtag":
            (
                f"#{name}"

                if name

                else ""
            ),

    }


# =========================================================


def sync_writing_tags(
    writing,
):
    """
    Synchronize Writing.tags with hashtags in the current
    title and content.

    Existing tags are reused.

    Missing tags are automatically created.

    Removed hashtags are automatically detached from the
    writing.

    The caller controls db.session.commit().
    """

    tag_names = (
        extract_hashtags(

            title=
                getattr(
                    writing,
                    "title",
                    "",
                ),

            content=
                getattr(
                    writing,
                    "content",
                    "",
                ),

        )
    )


    if not tag_names:

        writing.tags = []

        return []


    match_keys = [

        tag_name.lower()

        for tag_name
        in tag_names

    ]


    existing_tags = (

        Tag.query

        .filter(

            db.func.lower(
                Tag.name
            )
            .in_(
                match_keys
            )

        )

        .all()

    )


    tags_by_key = {

        str(
            tag.name
            or ""
        ).lower():
            tag

        for tag
        in existing_tags

    }


    resolved_tags = []


    for tag_name in tag_names:

        key = (
            tag_name.lower()
        )


        tag = (
            tags_by_key.get(
                key
            )
        )


        if tag is None:

            tag = Tag(
                name=
                    tag_name
            )


            db.session.add(
                tag
            )


            tags_by_key[
                key
            ] = tag


        resolved_tags.append(
            tag
        )


    writing.tags = (
        resolved_tags
    )


    return resolved_tags


# =========================================================
# COMMENT SERIALIZATION
# =========================================================

def serialize_comment(
    comment,
):

    user = getattr(
        comment,
        "user",
        None,
    )


    if user is None:

        user = getattr(
            comment,
            "author",
            None,
        )


    author_name = (
        get_author_name(
            user
        )
    )


    author_id_value = (
        get_author_id(
            user
        )
    )


    return {

        "id":
            comment.id,

        "content":
            comment.content,

        "user_id":
            getattr(
                comment,
                "user_id",
                None,
            ),

        "author_id":
            author_id_value,

        "author_name":
            author_name,

        "author": {

            "id":
                author_id_value,

            "name":
                author_name,

            "username":
                (
                    getattr(
                        user,
                        "username",
                        None,
                    )

                    if user

                    else None
                ),

            "avatar_url":
                (
                    getattr(
                        user,
                        "avatar_url",
                        None,
                    )

                    if user

                    else None
                ),

        },

        "created_at":
            get_created_at(
                comment
            ),

    }


# =========================================================
# WRITING SERIALIZATION
# =========================================================

def serialize_writing(
    writing,
    current_user_id=None,
):

    author = getattr(
        writing,
        "author",
        None,
    )


    if author is None:

        author = getattr(
            writing,
            "user",
            None,
        )


    writing_likes = getattr(
        writing,
        "likes",
        [],
    )


    writing_comments = getattr(
        writing,
        "comments",
        [],
    )


    writing_tags = getattr(
        writing,
        "tags",
        [],
    )


    try:

        likes_count = len(
            writing_likes
        )


    except TypeError:

        likes_count = 0


    try:

        comments_count = len(
            writing_comments
        )


    except TypeError:

        comments_count = 0


    try:

        serialized_tags = [

            serialize_tag(
                tag
            )

            for tag
            in writing_tags

        ]


    except TypeError:

        serialized_tags = []


    is_liked = False


    if current_user_id:

        try:

            is_liked = any(

                getattr(
                    like,
                    "user_id",
                    None,
                )
                ==
                current_user_id

                for like
                in writing_likes

            )


        except TypeError:

            is_liked = False


    return {

        # -------------------------------------------------
        # WRITING
        # -------------------------------------------------

        "id":
            writing.id,

        "title":
            writing.title,

        "content":
            writing.content,

        "category":
            writing.category,

        "language":
            getattr(
                writing,
                "language",
                "bn",
            ),

        # -------------------------------------------------
        # AUTHOR
        # -------------------------------------------------

        "user_id":
            getattr(
                writing,
                "user_id",
                None,
            ),

        "author_id":
            get_author_id(
                author
            ),

        "author_name":
            get_author_name(
                author
            ),

        "author_username":
            (
                getattr(
                    author,
                    "username",
                    None,
                )

                if author

                else None
            ),

        "author_avatar_url":
            (
                getattr(
                    author,
                    "avatar_url",
                    None,
                )

                if author

                else None
            ),

        "author": {

            "id":
                get_author_id(
                    author
                ),

            "name":
                get_author_name(
                    author
                ),

            "username":
                (
                    getattr(
                        author,
                        "username",
                        None,
                    )

                    if author

                    else None
                ),

            "avatar_url":
                (
                    getattr(
                        author,
                        "avatar_url",
                        None,
                    )

                    if author

                    else None
                ),

        },

        # -------------------------------------------------
        # TAGS
        # -------------------------------------------------

        "tags":
            serialized_tags,

        "hashtags": [

            item[
                "hashtag"
            ]

            for item
            in serialized_tags

            if item.get(
                "hashtag"
            )

        ],

        # -------------------------------------------------
        # ENGAGEMENT
        # -------------------------------------------------

        "likes":
            likes_count,

        "likes_count":
            likes_count,

        "comments_count":
            comments_count,

        "is_liked":
            is_liked,

        # -------------------------------------------------
        # DATES
        # -------------------------------------------------

        "created_at":
            get_created_at(
                writing
            ),

        "updated_at":
            get_updated_at(
                writing
            ),

        "published_at":
            (
                writing
                .published_at
                .isoformat()

                if getattr(
                    writing,
                    "published_at",
                    None,
                )

                else None
            ),

        # -------------------------------------------------
        # STATUS
        # -------------------------------------------------

        "status":
            getattr(
                writing,
                "status",
                "draft",
            ),

        "previous_status":
            getattr(
                writing,
                "previous_status",
                None,
            ),

        "deleted_at":
            (
                writing
                .deleted_at
                .isoformat()

                if getattr(
                    writing,
                    "deleted_at",
                    None,
                )

                else None
            ),

    }


# =========================================================
# GET SUPPORTED LANGUAGES
# =========================================================

@writings_bp.route(
    "/languages",
    methods=["GET"],
)
def get_supported_languages():

    return jsonify({

        "success":
            True,

        "languages": [

            {
                "code":
                    "bn",

                "name":
                    "Bengali",

                "label":
                    "বাংলা",

                "nativeName":
                    "বাংলা",

                "native_name":
                    "বাংলা",
            },

            {
                "code":
                    "en",

                "name":
                    "English",

                "label":
                    "English",

                "nativeName":
                    "English",

                "native_name":
                    "English",
            },

            {
                "code":
                    "hi",

                "name":
                    "Hindi",

                "label":
                    "हिन्दी",

                "nativeName":
                    "हिन्दी",

                "native_name":
                    "हिन्दी",
            },

        ],

    }), 200


# =========================================================
# GET ALL PUBLISHED WRITINGS
#
# GET /api/writings
#
# Supports:
#
# ?search=
# ?category=
# ?language=
# ?tag=
# ?page=
# ?limit=
# =========================================================

@writings_bp.route(
    "",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_writings():

    try:

        current_user_id = (
            get_optional_user_id()
        )


        search = (
            request.args.get(
                "search",
                "",
            )
            .strip()
        )


        category = (
            request.args.get(
                "category",
                "",
            )
            .strip()
        )


        language = (
            request.args.get(
                "language",
                "",
            )
            .strip()
            .lower()
        )


        tag = (
            request.args.get(
                "tag",
                "",
            )
            .strip()
        )


        (
            page,
            limit,
        ) = (
            parse_page_and_limit()
        )


        query = (

            Writing.query

            .filter(
                Writing.status
                ==
                "published"
            )

        )


        # =================================================
        # SEARCH
        # =================================================

        if search:

            search_pattern = (
                f"%{search}%"
            )


            query = query.filter(

                db.or_(

                    Writing.title.ilike(
                        search_pattern
                    ),

                    Writing.content.ilike(
                        search_pattern
                    ),

                )

            )


        # =================================================
        # CATEGORY
        # =================================================

        if category:

            query = query.filter(
                Writing.category
                ==
                category
            )


        # =================================================
        # LANGUAGE
        # =================================================

        if language:

            query = query.filter(
                Writing.language
                ==
                language
            )


        # =================================================
        # HASHTAG
        # =================================================

        if tag:

            normalized_tag = (
                normalize_tag_name(
                    tag
                )
            )


            if not normalized_tag:

                return error_response(
                    "Invalid hashtag.",
                    400,
                )


            query = (

                query

                .join(
                    Writing.tags
                )

                .filter(

                    db.func.lower(
                        Tag.name
                    )
                    ==
                    normalized_tag.lower()

                )

                .distinct()

            )


        # =================================================
        # ORDER
        # =================================================

        query = query.order_by(

            Writing
            .published_at
            .desc(),

            Writing
            .created_at
            .desc(),

            Writing
            .id
            .desc(),

        )


        # =================================================
        # PAGINATION
        # =================================================

        pagination = (
            query.paginate(

                page=
                    page,

                per_page=
                    limit,

                error_out=
                    False,

            )
        )


        writings = [

            serialize_writing(
                writing,
                current_user_id,
            )

            for writing
            in pagination.items

        ]


        return jsonify({

            "success":
                True,

            "writings":
                writings,

            "items":
                writings,

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "limit":
                limit,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,

        }), 200


    except Exception as error:

        print(
            "Get writings error:",
            error,
        )


        return error_response(
            "Unable to load writings.",
            500,
        )


# =========================================================
# GET WRITINGS BY HASHTAG
#
# GET /api/writings/tags/<tag_name>
# =========================================================

@writings_bp.route(
    "/tags/<path:tag_name>",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_writings_by_tag(
    tag_name,
):

    try:

        current_user_id = (
            get_optional_user_id()
        )


        normalized_tag = (
            normalize_tag_name(
                tag_name
            )
        )


        if not normalized_tag:

            return error_response(
                "Invalid hashtag.",
                400,
            )


        (
            page,
            limit,
        ) = (
            parse_page_and_limit()
        )


        query = (

            Writing.query

            .join(
                Writing.tags
            )

            .filter(

                Writing.status
                ==
                "published",

                db.func.lower(
                    Tag.name
                )
                ==
                normalized_tag.lower(),

            )

            .order_by(

                Writing
                .published_at
                .desc(),

                Writing
                .created_at
                .desc(),

                Writing
                .id
                .desc(),

            )

            .distinct()

        )


        pagination = (
            query.paginate(

                page=
                    page,

                per_page=
                    limit,

                error_out=
                    False,

            )
        )


        writings = [

            serialize_writing(
                writing,
                current_user_id,
            )

            for writing
            in pagination.items

        ]


        matched_tag = (

            Tag.query

            .filter(

                db.func.lower(
                    Tag.name
                )
                ==
                normalized_tag.lower()

            )

            .first()

        )


        return jsonify({

            "success":
                True,

            "tag":
                (

                    serialize_tag(
                        matched_tag
                    )

                    if matched_tag

                    else {

                        "id":
                            None,

                        "name":
                            normalized_tag,

                        "hashtag":
                            f"#{normalized_tag}",

                    }

                ),

            "writings":
                writings,

            "items":
                writings,

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "limit":
                limit,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,

        }), 200


    except Exception as error:

        print(
            "Get writings by hashtag error:",
            error,
        )


        return error_response(
            "Unable to load writings for this hashtag.",
            500,
        )


# =========================================================
# GET CURRENT USER'S WRITINGS
# =========================================================

@writings_bp.route(
    "/mine",
    methods=["GET"],
)
@jwt_required()
def get_my_writings():

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        search = (
            request.args.get(
                "search",
                "",
            )
            .strip()
        )


        language = (
            request.args.get(
                "language",
                "",
            )
            .strip()
            .lower()
        )


        status = (
            request.args.get(
                "status",
                "",
            )
            .strip()
            .lower()
        )


        (
            page,
            limit,
        ) = (
            parse_page_and_limit()
        )


        query = (
            Writing.query
            .filter(
                Writing.user_id
                ==
                user_id
            )
        )


        if (
            status
            !=
            "deleted"
        ):

            query = query.filter(
                Writing.status
                !=
                "deleted"
            )


        if search:

            search_pattern = (
                f"%{search}%"
            )


            query = query.filter(

                db.or_(

                    Writing.title.ilike(
                        search_pattern
                    ),

                    Writing.content.ilike(
                        search_pattern
                    ),

                )

            )


        if language:

            query = query.filter(
                Writing.language
                ==
                language
            )


        if status:

            query = query.filter(
                Writing.status
                ==
                status
            )


        query = query.order_by(

            Writing
            .created_at
            .desc(),

            Writing
            .id
            .desc(),

        )


        pagination = (
            query.paginate(

                page=
                    page,

                per_page=
                    limit,

                error_out=
                    False,

            )
        )


        writings = [

            serialize_writing(
                writing,
                user_id,
            )

            for writing
            in pagination.items

        ]


        return jsonify({

            "success":
                True,

            "writings":
                writings,

            "items":
                writings,

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "limit":
                limit,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,

        }), 200


    except Exception as error:

        print(
            "Get my writings error:",
            error,
        )


        return error_response(
            "Unable to load your writings.",
            500,
        )


# =========================================================
# GET ONE PUBLISHED WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["GET"],
)
@jwt_required(
    optional=True
)
def get_writing(
    writing_id,
):

    try:

        current_user_id = (
            get_optional_user_id()
        )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if (
            writing is None
            or
            writing.status
            !=
            "published"
        ):

            return error_response(
                "Writing not found.",
                404,
            )


        writing_data = (
            serialize_writing(
                writing,
                current_user_id,
            )
        )


        comments = getattr(
            writing,
            "comments",
            [],
        )


        try:

            writing_data[
                "comments"
            ] = [

                serialize_comment(
                    comment
                )

                for comment
                in sorted(

                    comments,

                    key=lambda item:
                        getattr(
                            item,
                            "created_at",
                            item.id,
                        ),

                )

            ]


        except TypeError:

            writing_data[
                "comments"
            ] = []


        return jsonify(
            writing_data
        ), 200


    except Exception as error:

        print(
            "Get writing error:",
            error,
        )


        return error_response(
            "Unable to load the writing.",
            500,
        )


# =========================================================
# CREATE + PUBLISH WRITING
#
# POST /api/writings
# =========================================================

@writings_bp.route(
    "",
    methods=["POST"],
)
@jwt_required()
def create_writing():

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        data = (
            request.get_json(
                silent=True
            )
            or {}
        )


        title = str(

            data.get(
                "title",
                "",
            )

        ).strip()


        content = str(

            data.get(
                "content",
                "",
            )

        ).strip()


        category = str(

            data.get(
                "category",
                "অন্যান্য",
            )

        ).strip()


        language = (
            str(

                data.get(
                    "language",
                    "bn",
                )

            )
            .strip()
            .lower()
        )


        if not title:

            return error_response(
                "Title is required."
            )


        if not content:

            return error_response(
                "Writing content is required."
            )


        if (
            len(
                title
            )
            >
            200
        ):

            return error_response(
                "Title cannot exceed 200 characters."
            )


        if (
            category
            not in
            ALLOWED_CATEGORIES
        ):

            category = (
                "অন্যান্য"
            )


        if (
            language
            not in
            ALLOWED_WRITING_LANGUAGES
        ):

            language = "bn"


        writing = Writing(

            title=
                title,

            content=
                content,

            category=
                category,

            language=
                language,

            user_id=
                user_id,

            status=
                "published",

            published_at=
                datetime.now(
                    timezone.utc
                ),

        )


        db.session.add(
            writing
        )


        # Automatically extract + attach hashtags.
        sync_writing_tags(
            writing
        )


        db.session.commit()


        return jsonify(

            serialize_writing(
                writing,
                user_id,
            )

        ), 201


    except Exception as error:

        db.session.rollback()


        print(
            "Create writing error:",
            error,
        )


        return error_response(
            "Unable to publish the writing.",
            500,
        )


# =========================================================
# CREATE DRAFT
#
# POST /api/writings/drafts
# =========================================================

@writings_bp.route(
    "/drafts",
    methods=["POST"],
)
@jwt_required()
def create_draft():

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        data = (
            request.get_json(
                silent=True
            )
            or {}
        )


        title = (

            str(
                data.get(
                    "title",
                    "",
                )
                or ""
            )

            .strip()

        )


        content = (

            str(
                data.get(
                    "content",
                    "",
                )
                or ""
            )

            .strip()

        )


        category = (

            str(
                data.get(
                    "category",
                    "অন্যান্য",
                )
                or
                "অন্যান্য"
            )

            .strip()

        )


        language = (

            str(
                data.get(
                    "language",
                    "bn",
                )
                or
                "bn"
            )

            .strip()
            .lower()

        )


        if (
            not title
            and
            not content
        ):

            return error_response(
                "Draft must contain a title or content.",
                400,
            )


        if (
            len(
                title
            )
            >
            200
        ):

            return error_response(
                "Title cannot exceed 200 characters.",
                400,
            )


        if (
            category
            not in
            ALLOWED_CATEGORIES
        ):

            category = (
                "অন্যান্য"
            )


        if (
            language
            not in
            ALLOWED_WRITING_LANGUAGES
        ):

            language = "bn"


        writing = Writing(

            title=
                (
                    title
                    or
                    "Untitled Draft"
                ),

            content=
                content,

            category=
                category,

            language=
                language,

            user_id=
                user_id,

            status=
                "draft",

        )


        db.session.add(
            writing
        )


        sync_writing_tags(
            writing
        )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Draft saved successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 201


    except Exception as error:

        db.session.rollback()


        print(
            "Create draft error:",
            error,
        )


        return error_response(
            "Unable to save draft.",
            500,
        )


# =========================================================
# UPDATE WRITING
#
# PATCH /api/writings/<writing_id>
# PUT   /api/writings/<writing_id>
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=[
        "PUT",
        "PATCH",
    ],
)
@jwt_required()
def update_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to edit this writing.",
                403,
            )


        if (
            writing.status
            ==
            "deleted"
        ):

            return error_response(
                "Restore this writing before editing it.",
                400,
            )


        data = (
            request.get_json(
                silent=True
            )
            or {}
        )


        hashtags_need_sync = (
            False
        )


        # =================================================
        # TITLE
        # =================================================

        if "title" in data:

            title = str(

                data.get(
                    "title",
                    "",
                )

            ).strip()


            if not title:

                return error_response(
                    "Title cannot be empty."
                )


            if (
                len(
                    title
                )
                >
                200
            ):

                return error_response(
                    "Title cannot exceed 200 characters."
                )


            writing.title = (
                title
            )


            hashtags_need_sync = (
                True
            )


        # =================================================
        # CONTENT
        # =================================================

        if "content" in data:

            content = str(

                data.get(
                    "content",
                    "",
                )

            ).strip()


            if not content:

                return error_response(
                    "Writing content cannot be empty."
                )


            writing.content = (
                content
            )


            hashtags_need_sync = (
                True
            )


        # =================================================
        # CATEGORY
        # =================================================

        if "category" in data:

            category = str(

                data.get(
                    "category",
                    "",
                )

            ).strip()


            if (
                category
                not in
                ALLOWED_CATEGORIES
            ):

                return error_response(
                    "Invalid writing category."
                )


            writing.category = (
                category
            )


        # =================================================
        # LANGUAGE
        # =================================================

        if "language" in data:

            language = (
                str(

                    data.get(
                        "language",
                        "",
                    )

                )
                .strip()
                .lower()
            )


            if (
                language
                not in
                ALLOWED_WRITING_LANGUAGES
            ):

                return error_response(
                    "Invalid writing language."
                )


            writing.language = (
                language
            )


        # =================================================
        # RE-SYNC TAGS ONLY WHEN TITLE / CONTENT CHANGES
        # =================================================

        if hashtags_need_sync:

            sync_writing_tags(
                writing
            )


        db.session.commit()


        return jsonify(

            serialize_writing(
                writing,
                user_id,
            )

        ), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Update writing error:",
            error,
        )


        return error_response(
            "Unable to update the writing.",
            500,
        )


# =========================================================
# PUBLISH EXISTING DRAFT
#
# POST /api/writings/<writing_id>/publish
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/publish",
    methods=["POST"],
)
@jwt_required()
def publish_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to publish this writing.",
                403,
            )


        if (
            writing.status
            ==
            "deleted"
        ):

            return error_response(
                "Deleted writings cannot be published.",
                400,
            )


        if not str(
            writing.title
            or ""
        ).strip():

            return error_response(
                "Title is required before publishing.",
                400,
            )


        if not str(
            writing.content
            or ""
        ).strip():

            return error_response(
                "Writing content is required before publishing.",
                400,
            )


        writing.status = (
            "published"
        )


        writing.previous_status = (
            None
        )


        writing.deleted_at = (
            None
        )


        writing.published_at = (
            datetime.now(
                timezone.utc
            )
        )


        sync_writing_tags(
            writing
        )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Writing published successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Publish writing error:",
            error,
        )


        return error_response(
            "Unable to publish writing.",
            500,
        )


# =========================================================
# UNPUBLISH WRITING
#
# POST /api/writings/<writing_id>/unpublish
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/unpublish",
    methods=["POST"],
)
@jwt_required()
def unpublish_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to modify this writing.",
                403,
            )


        if (
            writing.status
            ==
            "deleted"
        ):

            return error_response(
                "Restore this writing before unpublishing it.",
                400,
            )


        writing.status = (
            "draft"
        )


        writing.published_at = (
            None
        )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Writing unpublished successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Unpublish writing error:",
            error,
        )


        return error_response(
            "Unable to unpublish writing.",
            500,
        )


# =========================================================
# DELETE WRITING — SOFT DELETE
# =========================================================

@writings_bp.route(
    "/<int:writing_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to delete this writing.",
                403,
            )


        if (
            writing.status
            ==
            "deleted"
        ):

            return error_response(
                "Writing is already in Trash.",
                400,
            )


        writing.previous_status = (
            writing.status
        )


        writing.status = (
            "deleted"
        )


        writing.deleted_at = (
            datetime.now(
                timezone.utc
            )
        )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Writing moved to Trash successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Delete writing error:",
            error,
        )


        return error_response(
            "Unable to move the writing to Trash.",
            500,
        )


# =========================================================
# RESTORE WRITING FROM TRASH
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/restore",
    methods=["POST"],
)
@jwt_required()
def restore_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to restore this writing.",
                403,
            )


        if (
            writing.status
            !=
            "deleted"
        ):

            return error_response(
                "This writing is not in Trash.",
                400,
            )


        restore_status = (

            writing.previous_status

            if writing.previous_status
            in (
                "draft",
                "published",
            )

            else "draft"

        )


        writing.status = (
            restore_status
        )


        writing.deleted_at = (
            None
        )


        writing.previous_status = (
            None
        )


        if (
            restore_status
            ==
            "published"
        ):

            if (
                writing.published_at
                is None
            ):

                writing.published_at = (
                    datetime.now(
                        timezone.utc
                    )
                )


            sync_writing_tags(
                writing
            )


        else:

            writing.published_at = (
                None
            )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Writing restored successfully.",

            "writing":
                serialize_writing(
                    writing,
                    user_id,
                ),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Restore writing error:",
            error,
        )


        return error_response(
            "Unable to restore the writing.",
            500,
        )


# =========================================================
# PERMANENTLY DELETE WRITING
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/permanent",
    methods=["DELETE"],
)
@jwt_required()
def permanently_delete_writing(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if writing is None:

            return error_response(
                "Writing not found.",
                404,
            )


        if (
            writing.user_id
            !=
            user_id
        ):

            return error_response(
                "You are not allowed to delete this writing.",
                403,
            )


        if (
            writing.status
            !=
            "deleted"
        ):

            return error_response(
                "Only writings in Trash can be permanently deleted.",
                400,
            )


        db.session.delete(
            writing
        )


        db.session.commit()


        return jsonify({

            "success":
                True,

            "message":
                "Writing permanently deleted.",

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Permanent delete writing error:",
            error,
        )


        return error_response(
            "Unable to permanently delete the writing.",
            500,
        )


# =========================================================
# LEGACY LIKE TOGGLE
#
# Compatibility endpoint.
#
# New frontend:
#
# /api/likes/writing/<writing_id>
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/like",
    methods=["POST"],
)
@jwt_required()
def toggle_writing_like(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if (
            writing is None
            or
            writing.status
            !=
            "published"
        ):

            return error_response(
                "Writing not found.",
                404,
            )


        existing_like = (

            Like.query

            .filter_by(

                user_id=
                    user_id,

                writing_id=
                    writing_id,

            )

            .first()

        )


        if existing_like:

            db.session.delete(
                existing_like
            )


            liked = False


            message = (
                "Like removed successfully."
            )


        else:

            new_like = Like(

                user_id=
                    user_id,

                writing_id=
                    writing_id,

            )


            db.session.add(
                new_like
            )


            liked = True


            message = (
                "Writing liked successfully."
            )


        db.session.commit()


        likes_count = (

            Like.query

            .filter_by(
                writing_id=
                    writing_id
            )

            .count()

        )


        return jsonify({

            "success":
                True,

            "message":
                message,

            "liked":
                liked,

            "is_liked":
                liked,

            "likes":
                likes_count,

            "likes_count":
                likes_count,

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "Legacy like writing error:",
            error,
        )


        return error_response(
            "Unable to update the like.",
            500,
        )


# =========================================================
# LEGACY GET COMMENTS
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/comments",
    methods=["GET"],
)
def get_comments(
    writing_id,
):

    try:

        writing = get_model_item(
            Writing,
            writing_id,
        )


        if (
            writing is None
            or
            writing.status
            !=
            "published"
        ):

            return error_response(
                "Writing not found.",
                404,
            )


        comments = (

            Comment.query

            .filter_by(
                writing_id=
                    writing_id
            )

            .order_by(
                Comment.created_at.asc()
            )

            .all()

        )


        serialized_comments = [

            serialize_comment(
                comment
            )

            for comment
            in comments

        ]


        return jsonify({

            "success":
                True,

            "comments":
                serialized_comments,

            "total":
                len(
                    serialized_comments
                ),

        }), 200


    except Exception as error:

        print(
            "Get comments error:",
            error,
        )


        return error_response(
            "Unable to load comments.",
            500,
        )


# =========================================================
# LEGACY CREATE COMMENT
# =========================================================

@writings_bp.route(
    "/<int:writing_id>/comments",
    methods=["POST"],
)
@jwt_required()
def create_comment(
    writing_id,
):

    try:

        user_id = (
            get_current_user_id()
        )


        if user_id is None:

            return error_response(
                "Invalid authentication identity.",
                401,
            )


        writing = get_model_item(
            Writing,
            writing_id,
        )


        if (
            writing is None
            or
            writing.status
            !=
            "published"
        ):

            return error_response(
                "Writing not found.",
                404,
            )


        data = (
            request.get_json(
                silent=True
            )
            or {}
        )


        content = (
            str(

                data.get(
                    "content",
                    "",
                )

            )
            .strip()
        )


        if not content:

            return error_response(
                "Comment cannot be empty."
            )


        comment = Comment(

            content=
                content,

            user_id=
                user_id,

            writing_id=
                writing_id,

        )


        db.session.add(
            comment
        )


        db.session.commit()


        return jsonify(

            serialize_comment(
                comment
            )

        ), 201


    except Exception as error:

        db.session.rollback()


        print(
            "Create comment error:",
            error,
        )


        return error_response(
            "Unable to publish the comment.",
            500,
        )


# =========================================================
# OCR HELPERS
# =========================================================

def get_file_extension(
    filename,
):

    return Path(
        filename
        or ""
    ).suffix.lower()


# =========================================================


def validate_ocr_file(
    uploaded_file,
):

    if uploaded_file is None:

        return (
            False,
            "Please select a PDF, JPG or PNG file.",
        )


    if not uploaded_file.filename:

        return (
            False,
            "The selected file has no filename.",
        )


    extension = (
        get_file_extension(
            uploaded_file.filename
        )
    )


    mime_type = (

        uploaded_file.mimetype

        or ""

    ).lower()


    if (
        extension
        not in
        ALLOWED_EXTENSIONS
    ):

        return (

            False,

            (
                "Only PDF, JPG, JPEG "
                "and PNG files are supported."
            ),

        )


    if (
        mime_type
        and
        mime_type
        not in
        ALLOWED_MIME_TYPES
    ):

        return (

            False,

            (
                "The selected file type "
                "is not supported."
            ),

        )


    return (
        True,
        None,
    )


# =========================================================


def prepare_image_for_ocr(
    image,
):

    image = (
        ImageOps.exif_transpose(
            image
        )
    )


    if image.mode not in (
        "RGB",
        "L",
    ):

        image = image.convert(
            "RGB"
        )


    width, height = (
        image.size
    )


    if (
        max(
            width,
            height,
        )
        <
        1600
    ):

        image = image.resize(

            (
                width * 2,
                height * 2,
            ),

            Image.Resampling.LANCZOS,

        )


    return image


# =========================================================


def extract_text_from_image(
    file_bytes,
    tesseract_language,
):

    with Image.open(

        io.BytesIO(
            file_bytes
        )

    ) as image:

        prepared_image = (
            prepare_image_for_ocr(
                image
            )
        )


        text = (

            pytesseract

            .image_to_string(

                prepared_image,

                lang=
                    tesseract_language,

                config=
                    "--oem 3 --psm 6",

            )

        )


    return text.strip()


# =========================================================


def extract_text_from_pdf(
    file_bytes,
    tesseract_language,
):

    extracted_pages = []


    document = pymupdf.open(

        stream=
            file_bytes,

        filetype=
            "pdf",

    )


    try:

        if (
            document.page_count
            ==
            0
        ):

            return ""


        if (
            document.page_count
            >
            MAX_PDF_PAGES
        ):

            raise ValueError(

                (
                    "PDF cannot contain more than "
                    f"{MAX_PDF_PAGES} pages."
                )

            )


        for page_number in range(
            document.page_count
        ):

            page = (
                document.load_page(
                    page_number
                )
            )


            # ---------------------------------------------
            # FIRST: NORMAL PDF TEXT
            # ---------------------------------------------

            direct_text = (

                page.get_text(
                    "text"
                )

                or ""

            ).strip()


            if direct_text:

                extracted_pages.append(
                    direct_text
                )

                continue


            # ---------------------------------------------
            # FALLBACK: OCR SCANNED PAGE
            # ---------------------------------------------

            matrix = pymupdf.Matrix(
                2.5,
                2.5,
            )


            pixmap = (
                page.get_pixmap(

                    matrix=
                        matrix,

                    alpha=
                        False,

                )
            )


            image = Image.open(

                io.BytesIO(

                    pixmap.tobytes(
                        "png"
                    )

                )

            )


            try:

                prepared_image = (
                    prepare_image_for_ocr(
                        image
                    )
                )


                page_text = (

                    pytesseract

                    .image_to_string(

                        prepared_image,

                        lang=
                            tesseract_language,

                        config=
                            "--oem 3 --psm 6",

                    )

                ).strip()


                if page_text:

                    extracted_pages.append(
                        page_text
                    )


            finally:

                image.close()


    finally:

        document.close()


    return (

        "\n\n"

        .join(
            extracted_pages
        )

        .strip()

    )


# =========================================================
# OCR ENDPOINT
#
# POST /api/writings/ocr
# =========================================================

@writings_bp.route(
    "/ocr",
    methods=["POST"],
)
@jwt_required()
def extract_scanned_writing():

    try:

        uploaded_file = (
            request.files.get(
                "document"
            )
        )


        language = (

            request.form.get(
                "language",
                "bn",
            )

            .strip()

            .lower()

        )


        (
            valid_file,
            validation_error,
        ) = (

            validate_ocr_file(
                uploaded_file
            )

        )


        if not valid_file:

            return error_response(
                validation_error
            )


        if (
            language
            not in
            OCR_LANGUAGE_MAP
        ):

            return error_response(
                "OCR language must be bn, en or hi."
            )


        file_bytes = (
            uploaded_file.read(
                MAX_FILE_SIZE + 1
            )
        )


        if not file_bytes:

            return error_response(
                "The selected file is empty."
            )


        if (
            len(
                file_bytes
            )
            >
            MAX_FILE_SIZE
        ):

            return error_response(
                "File size cannot exceed 10 MB.",
                413,
            )


        extension = (
            get_file_extension(
                uploaded_file.filename
            )
        )


        tesseract_language = (
            OCR_LANGUAGE_MAP[
                language
            ]
        )


        if extension == ".pdf":

            extracted_text = (
                extract_text_from_pdf(

                    file_bytes,

                    tesseract_language,

                )
            )


        else:

            extracted_text = (
                extract_text_from_image(

                    file_bytes,

                    tesseract_language,

                )
            )


        if not extracted_text:

            return error_response(

                (
                    "No readable text was found "
                    "in the selected file."
                ),

                422,

            )


        return jsonify({

            "success":
                True,

            "message":
                "Text extracted successfully.",

            "text":
                extracted_text,

            "content":
                extracted_text,

            "extracted_text":
                extracted_text,

            "language":
                language,

            "ocr_language":
                tesseract_language,

            "filename":
                uploaded_file.filename,

        }), 200


    except (
        pytesseract
        .pytesseract
        .TesseractNotFoundError
    ):

        return error_response(

            (
                "Tesseract OCR is not installed "
                "or is not available in the Windows PATH."
            ),

            500,

        )


    except (
        pytesseract
        .pytesseract
        .TesseractError
    ) as error:

        print(
            "Tesseract OCR error:",
            error,
        )


        return error_response(

            (
                "The selected OCR language data is missing. "
                "Check eng, ben and hin traineddata files."
            ),

            500,

        )


    except UnidentifiedImageError:

        return error_response(

            (
                "The selected image is damaged "
                "or cannot be read."
            ),

            422,

        )


    except pymupdf.FileDataError:

        return error_response(

            (
                "The selected PDF is damaged "
                "or cannot be read."
            ),

            422,

        )


    except ValueError as error:

        return error_response(
            str(
                error
            )
        )


    except Exception as error:

        print(
            "OCR extraction error:",
            error,
        )


        return error_response(

            (
                "Unable to extract text "
                "from the selected file."
            ),

            500,

        )


# =========================================================
# OPTIONAL REGISTRATION FUNCTION
# =========================================================

def register_writing_routes(
    app,
):
    """
    Compatibility helper if App.py calls:

        register_writing_routes(app)

    If App.py already calls:

        app.register_blueprint(writings_bp)

    this helper is not required.
    """

    app.register_blueprint(
        writings_bp
    )