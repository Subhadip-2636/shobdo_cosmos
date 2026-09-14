from datetime import datetime, timezone

import pymupdf

from flask import (
    Blueprint,
    jsonify,
    request,
)

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from extensions import db

from models.document import Document

from services.document_storage import (
    delete_pdf,
    upload_pdf,
)


# =========================================================
# BLUEPRINT
# =========================================================
#
# IMPORTANT:
#
# app.py already registers this blueprint using:
#
# app.register_blueprint(
#     document_bp,
#     url_prefix="/api",
# )
#
# Therefore DO NOT add url_prefix="/api/documents" here.
#
# Routes in this file explicitly begin with "/documents".
#
# Final URLs:
#
# POST   /api/documents
# GET    /api/documents
# GET    /api/documents/mine
# GET    /api/documents/<id>
# DELETE /api/documents/<id>
#
# =========================================================

document_bp = Blueprint(
    "documents",
    __name__,
)


# =========================================================
# CONSTANTS
# =========================================================

MAX_PDF_SIZE = (
    10 * 1024 * 1024
)

MAX_PDF_PAGES = 30

MAX_EXTRACTED_TEXT_LENGTH = (
    100000
)

MAX_TITLE_LENGTH = 200

MAX_DESCRIPTION_LENGTH = 5000

MAX_CATEGORY_LENGTH = 80

MAX_FILENAME_LENGTH = 255


ALLOWED_LANGUAGES = {
    "bn",
    "en",
    "hi",
    "as",
    "or",
    "ta",
    "te",
}


ALLOWED_VISIBILITIES = {
    "public",
    "unlisted",
}


ALLOWED_STATUSES = {
    "draft",
    "published",
}


# =========================================================
# CURRENT UTC TIME
# =========================================================


def utc_now():

    return datetime.now(
        timezone.utc
    )


# =========================================================
# CURRENT USER
# =========================================================


def get_current_user_id():

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
# BOOLEAN PARSER
# =========================================================


def parse_boolean(
    value,
    default=True,
):

    if value is None:

        return default


    normalized = (
        str(value)
        .strip()
        .lower()
    )


    if normalized in {
        "true",
        "1",
        "yes",
        "on",
    }:

        return True


    if normalized in {
        "false",
        "0",
        "no",
        "off",
    }:

        return False


    return default


# =========================================================
# PDF INSPECTION
# =========================================================


def inspect_pdf(
    file_bytes,
):

    if not file_bytes:

        raise ValueError(
            "The uploaded PDF is empty."
        )


    try:

        pdf_document = (
            pymupdf.open(
                stream=file_bytes,
                filetype="pdf",
            )
        )

    except Exception as error:

        raise ValueError(
            "The uploaded file is not a valid PDF."
        ) from error


    try:

        # =================================================
        # PASSWORD PROTECTION
        # =================================================

        if pdf_document.needs_pass:

            raise ValueError(
                "Password-protected PDFs are not supported."
            )


        # =================================================
        # PAGE COUNT
        # =================================================

        page_count = (
            pdf_document.page_count
        )


        if page_count < 1:

            raise ValueError(
                "The PDF contains no pages."
            )


        if (
            page_count >
            MAX_PDF_PAGES
        ):

            raise ValueError(
                (
                    "PDF cannot contain more than "
                    f"{MAX_PDF_PAGES} pages."
                )
            )


        # =================================================
        # TEXT EXTRACTION
        # =================================================

        extracted_parts = []


        for page in pdf_document:

            try:

                page_text = (
                    page.get_text(
                        "text"
                    )
                    or ""
                ).strip()

            except Exception:

                page_text = ""


            if page_text:

                extracted_parts.append(
                    page_text
                )


        extracted_text = (
            "\n".join(
                extracted_parts
            )
            .strip()
        )


        # Prevent enormous amounts of text
        # from being stored in PostgreSQL.

        if (
            len(extracted_text) >
            MAX_EXTRACTED_TEXT_LENGTH
        ):

            extracted_text = (
                extracted_text[
                    :MAX_EXTRACTED_TEXT_LENGTH
                ]
            )


        return {
            "page_count":
                page_count,

            "extracted_text":
                extracted_text,
        }


    finally:

        pdf_document.close()


# =========================================================
# DOCUMENT ACCESS CHECK
# =========================================================


def can_view_document(
    document,
    user_id=None,
):

    # Owner may view their own drafts.

    if (
        user_id is not None
        and
        str(document.user_id)
        ==
        str(user_id)
    ):

        return True


    # Everyone else can only view
    # published documents.

    if (
        document.status !=
        "published"
    ):

        return False


    return (
        document.visibility
        in {
            "public",
            "unlisted",
        }
    )


# =========================================================
# CREATE DOCUMENT
# =========================================================
#
# POST /api/documents
#
# multipart/form-data:
#
# document
# title
# description
# category
# language
# visibility
# status
# allow_download
#
# =========================================================


@document_bp.route(
    "/documents",
    methods=[
        "POST",
    ],
)
@jwt_required()
def create_document():

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    # =====================================================
    # PDF FILE
    # =====================================================

    uploaded_file = (
        request.files.get(
            "document"
        )
    )


    if uploaded_file is None:

        return jsonify({
            "message":
                "PDF file is required."
        }), 400


    original_filename = (
        uploaded_file.filename
        or ""
    ).strip()


    if not original_filename:

        return jsonify({
            "message":
                "The uploaded file has no filename."
        }), 400


    if (
        len(original_filename) >
        MAX_FILENAME_LENGTH
    ):

        return jsonify({
            "message":
                (
                    "The PDF filename is too long. "
                    "Maximum length is 255 characters."
                )
        }), 400


    if not (
        original_filename
        .lower()
        .endswith(
            ".pdf"
        )
    ):

        return jsonify({
            "message":
                "Only PDF files are supported."
        }), 400


    # =====================================================
    # MIME TYPE
    # =====================================================

    mime_type = (
        uploaded_file.mimetype
        or ""
    ).lower()


    if (
        mime_type
        and
        mime_type
        not in {
            "application/pdf",
            "application/octet-stream",
        }
    ):

        return jsonify({
            "message":
                "The selected file is not a PDF."
        }), 400


    # =====================================================
    # READ FILE
    # =====================================================

    try:

        # Read one extra byte so oversized files
        # can be rejected without unnecessarily
        # loading a very large request into memory.

        file_bytes = (
            uploaded_file.read(
                MAX_PDF_SIZE + 1
            )
        )

    except Exception as error:

        print(
            "DOCUMENT FILE READ ERROR:",
            error,
        )

        return jsonify({
            "message":
                "Unable to read the uploaded PDF."
        }), 400


    if not file_bytes:

        return jsonify({
            "message":
                "The uploaded PDF is empty."
        }), 400


    if (
        len(file_bytes) >
        MAX_PDF_SIZE
    ):

        return jsonify({
            "message":
                "PDF size cannot exceed 10 MB."
        }), 413


    # =====================================================
    # PDF SIGNATURE
    # =====================================================

    if not (
        file_bytes.startswith(
            b"%PDF-"
        )
    ):

        return jsonify({
            "message":
                "The uploaded file is not a valid PDF."
        }), 400


    # =====================================================
    # FORM FIELDS
    # =====================================================

    title = (
        request.form.get(
            "title"
        )
        or ""
    ).strip()


    description = (
        request.form.get(
            "description"
        )
        or ""
    ).strip()


    category = (
        request.form.get(
            "category"
        )
        or "অন্যান্য"
    ).strip()


    language = (
        request.form.get(
            "language"
        )
        or "bn"
    ).strip().lower()


    visibility = (
        request.form.get(
            "visibility"
        )
        or "public"
    ).strip().lower()


    status = (
        request.form.get(
            "status"
        )
        or "published"
    ).strip().lower()


    allow_download = (
        parse_boolean(
            request.form.get(
                "allow_download"
            ),
            default=True,
        )
    )


    # =====================================================
    # TITLE VALIDATION
    # =====================================================

    if not title:

        return jsonify({
            "message":
                "Document title is required."
        }), 400


    if (
        len(title) >
        MAX_TITLE_LENGTH
    ):

        return jsonify({
            "message":
                (
                    "Document title cannot exceed "
                    "200 characters."
                )
        }), 400


    # =====================================================
    # DESCRIPTION VALIDATION
    # =====================================================

    if (
        len(description) >
        MAX_DESCRIPTION_LENGTH
    ):

        return jsonify({
            "message":
                (
                    "Description cannot exceed "
                    "5000 characters."
                )
        }), 400


    # =====================================================
    # CATEGORY VALIDATION
    # =====================================================

    if (
        len(category) >
        MAX_CATEGORY_LENGTH
    ):

        return jsonify({
            "message":
                (
                    "Category cannot exceed "
                    "80 characters."
                )
        }), 400


    if not category:

        category = (
            "অন্যান্য"
        )


    # =====================================================
    # LANGUAGE VALIDATION
    # =====================================================

    if (
        language not in
        ALLOWED_LANGUAGES
    ):

        return jsonify({
            "message":
                "Unsupported document language."
        }), 400


    # =====================================================
    # VISIBILITY VALIDATION
    # =====================================================

    if (
        visibility not in
        ALLOWED_VISIBILITIES
    ):

        return jsonify({
            "message":
                "Invalid document visibility."
        }), 400


    # =====================================================
    # STATUS VALIDATION
    # =====================================================

    if (
        status not in
        ALLOWED_STATUSES
    ):

        return jsonify({
            "message":
                "Invalid document status."
        }), 400


    # =====================================================
    # INSPECT PDF
    # =====================================================

    try:

        pdf_info = (
            inspect_pdf(
                file_bytes
            )
        )

    except ValueError as error:

        return jsonify({
            "message":
                str(error)
        }), 400


    # =====================================================
    # UPLOAD TO EXTERNAL STORAGE
    # =====================================================

    storage_result = None


    try:

        storage_result = (
            upload_pdf(
                file_bytes
            )
        )


        if not isinstance(
            storage_result,
            dict,
        ):

            raise RuntimeError(
                (
                    "Document storage returned "
                    "an invalid response."
                )
            )


        public_id = (
            storage_result.get(
                "public_id"
            )
        )


        file_url = (
            storage_result.get(
                "file_url"
            )
        )


        thumbnail_url = (
            storage_result.get(
                "thumbnail_url"
            )
        )


        if not public_id:

            raise RuntimeError(
                (
                    "Cloud storage did not return "
                    "a public ID."
                )
            )


        if not file_url:

            raise RuntimeError(
                (
                    "Cloud storage did not return "
                    "the document URL."
                )
            )


        # =================================================
        # DATABASE RECORD
        # =================================================

        new_document = Document(

            user_id=
                user_id,

            title=
                title,

            description=(
                description
                if description
                else None
            ),

            category=
                category,

            language=
                language,

            original_filename=
                original_filename,

            file_url=
                file_url,

            storage_public_id=
                public_id,

            mime_type=
                "application/pdf",

            file_size=
                len(file_bytes),

            page_count=
                pdf_info[
                    "page_count"
                ],

            thumbnail_url=
                thumbnail_url,

            extracted_text=(
                pdf_info[
                    "extracted_text"
                ]
                or None
            ),

            allow_download=
                allow_download,

            visibility=
                visibility,

            status=
                status,

            published_at=(
                utc_now()
                if status ==
                "published"
                else None
            ),
        )


        db.session.add(
            new_document
        )


        db.session.commit()


        return jsonify({

            "message":
                (
                    "Document published successfully."
                    if status ==
                    "published"
                    else
                    "Document draft saved successfully."
                ),

            "document":
                new_document.to_dict(),

        }), 201


    except Exception as error:

        db.session.rollback()


        # =================================================
        # REMOVE STORAGE FILE IF DATABASE FAILED
        # =================================================
        #
        # If upload succeeded but PostgreSQL failed,
        # delete the orphaned Cloudinary asset.
        #
        # =================================================

        if storage_result:

            public_id = (
                storage_result.get(
                    "public_id"
                )
                if isinstance(
                    storage_result,
                    dict,
                )
                else None
            )


            if public_id:

                try:

                    delete_pdf(
                        public_id
                    )

                except Exception as cleanup_error:

                    print(
                        (
                            "DOCUMENT STORAGE "
                            "CLEANUP ERROR:"
                        ),
                        cleanup_error,
                    )


        print(
            "CREATE DOCUMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                (
                    "Unable to publish document. "
                    "Please try again."
                )
        }), 500


# =========================================================
# PUBLIC DOCUMENT LIST
# =========================================================
#
# GET /api/documents
#
# =========================================================


@document_bp.route(
    "/documents",
    methods=[
        "GET",
    ],
)
def get_documents():

    # =====================================================
    # PAGINATION
    # =====================================================

    page = request.args.get(
        "page",
        default=1,
        type=int,
    )


    limit = request.args.get(
        "limit",
        default=12,
        type=int,
    )


    page = max(
        page or 1,
        1,
    )


    limit = max(
        1,
        min(
            limit or 12,
            50,
        ),
    )


    # =====================================================
    # FILTER OPTIONS
    # =====================================================

    language = (
        request.args.get(
            "language",
            ""
        )
        .strip()
        .lower()
    )


    category = (
        request.args.get(
            "category",
            ""
        )
        .strip()
    )


    # =====================================================
    # QUERY
    # =====================================================

    query = (
        Document.query
        .filter(
            Document.status ==
                "published",

            Document.visibility ==
                "public",
        )
    )


    if language:

        if (
            language not in
            ALLOWED_LANGUAGES
        ):

            return jsonify({
                "message":
                    "Unsupported document language."
            }), 400


        query = (
            query.filter(
                Document.language ==
                    language
            )
        )


    if category:

        query = (
            query.filter(
                Document.category ==
                    category
            )
        )


    query = (
        query.order_by(
            Document.published_at.desc(),
            Document.created_at.desc(),
        )
    )


    # =====================================================
    # PAGINATE
    # =====================================================

    pagination = (
        query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )
    )


    return jsonify({

        "documents": [

            document.to_dict()

            for document
            in pagination.items
        ],

        "pagination": {

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "per_page":
                pagination.per_page,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },

    }), 200


# =========================================================
# CURRENT USER DOCUMENTS
# =========================================================
#
# GET /api/documents/mine
#
# Includes:
#
# draft
# published
#
# =========================================================


@document_bp.route(
    "/documents/mine",
    methods=[
        "GET",
    ],
)
@jwt_required()
def get_my_documents():

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    page = request.args.get(
        "page",
        default=1,
        type=int,
    )


    limit = request.args.get(
        "limit",
        default=20,
        type=int,
    )


    page = max(
        page or 1,
        1,
    )


    limit = max(
        1,
        min(
            limit or 20,
            100,
        ),
    )


    query = (
        Document.query
        .filter(
            Document.user_id ==
                user_id
        )
        .order_by(
            Document.created_at.desc()
        )
    )


    pagination = (
        query.paginate(
            page=page,
            per_page=limit,
            error_out=False,
        )
    )


    return jsonify({

        "documents": [

            document.to_dict()

            for document
            in pagination.items
        ],

        "pagination": {

            "page":
                pagination.page,

            "pages":
                pagination.pages,

            "total":
                pagination.total,

            "has_next":
                pagination.has_next,

            "has_prev":
                pagination.has_prev,
        },

    }), 200


# =========================================================
# SINGLE DOCUMENT
# =========================================================
#
# GET /api/documents/<id>
#
# Published:
#   Public/unlisted viewers may access.
#
# Draft:
#   Owner only.
#
# =========================================================


@document_bp.route(
    "/documents/<int:document_id>",
    methods=[
        "GET",
    ],
)
@jwt_required(
    optional=True
)
def get_document(
    document_id,
):

    document = (
        db.session.get(
            Document,
            document_id,
        )
    )


    if document is None:

        return jsonify({
            "message":
                "Document not found."
        }), 404


    user_id = (
        get_current_user_id()
    )


    if not can_view_document(
        document,
        user_id,
    ):

        return jsonify({
            "message":
                "Document not found."
        }), 404


    return jsonify({
        "document":
            document.to_dict()
    }), 200


# =========================================================
# DELETE DOCUMENT
# =========================================================
#
# DELETE /api/documents/<id>
#
# Only the owner may delete it.
#
# =========================================================


@document_bp.route(
    "/documents/<int:document_id>",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def delete_document(
    document_id,
):

    user_id = (
        get_current_user_id()
    )


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    document = (
        db.session.get(
            Document,
            document_id,
        )
    )


    if document is None:

        return jsonify({
            "message":
                "Document not found."
        }), 404


    if (
        str(document.user_id)
        !=
        str(user_id)
    ):

        return jsonify({
            "message":
                (
                    "You do not have permission "
                    "to delete this document."
                )
        }), 403


    public_id = (
        document.storage_public_id
    )


    # =====================================================
    # DELETE DATABASE RECORD
    # =====================================================

    try:

        db.session.delete(
            document
        )

        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "DELETE DOCUMENT DATABASE ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to delete document."
        }), 500


    # =====================================================
    # DELETE CLOUD STORAGE ASSET
    # =====================================================
    #
    # The database deletion is already committed.
    #
    # If Cloudinary cleanup fails, the user-facing
    # document remains deleted. The orphan can later be
    # cleaned from Cloudinary manually.
    #
    # =====================================================

    if public_id:

        try:

            delete_pdf(
                public_id
            )

        except Exception as error:

            print(
                (
                    "DOCUMENT CLOUDINARY "
                    "DELETE ERROR:"
                ),
                error,
            )


    return jsonify({
        "message":
            "Document deleted successfully."
    }), 200