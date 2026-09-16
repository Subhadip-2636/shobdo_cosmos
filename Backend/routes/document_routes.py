from datetime import (
    datetime,
    timezone,
)

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
# app.py registers:
#
# app.register_blueprint(
#     document_bp,
#     url_prefix="/api",
# )
#
# Therefore routes in this file begin with "/documents".
#
# Final endpoints:
#
# POST   /api/documents
# GET    /api/documents
# GET    /api/documents/mine
# GET    /api/documents/<id>
#
# DELETE /api/documents/<id>
#     -> SOFT DELETE / MOVE TO TRASH
#
# POST   /api/documents/<id>/restore
#     -> RESTORE FROM TRASH
#
# DELETE /api/documents/<id>/permanent
#     -> PERMANENT DELETE DATABASE + CLOUDINARY
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


# Status values allowed when initially
# creating a document.
CREATE_STATUSES = {
    "draft",
    "published",
}


# All status values used internally.
DOCUMENT_STATUSES = {
    "draft",
    "published",
    "deleted",
}


# =========================================================
# TIME
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
    """
    Owner can inspect their own document,
    including drafts and Trash items.

    Everyone else may only access a
    published public/unlisted document.
    """

    if (
        user_id is not None
        and
        str(document.user_id)
        ==
        str(user_id)
    ):

        return True


    if (
        document.status
        !=
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
# OWNER CHECK
# =========================================================

def verify_document_owner(
    document,
    user_id,
):

    if document is None:

        return (
            jsonify({
                "message":
                    "Document not found."
            }),
            404,
        )


    if (
        str(document.user_id)
        !=
        str(user_id)
    ):

        return (
            jsonify({
                "message":
                    "You do not have permission "
                    "to modify this document."
            }),
            403,
        )


    return None


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
    # VALIDATION
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
                "Document title cannot exceed 200 characters."
        }), 400


    if (
        len(description) >
        MAX_DESCRIPTION_LENGTH
    ):

        return jsonify({
            "message":
                "Description cannot exceed 5000 characters."
        }), 400


    if (
        len(category) >
        MAX_CATEGORY_LENGTH
    ):

        return jsonify({
            "message":
                "Category cannot exceed 80 characters."
        }), 400


    if not category:

        category = (
            "অন্যান্য"
        )


    if (
        language not in
        ALLOWED_LANGUAGES
    ):

        return jsonify({
            "message":
                "Unsupported document language."
        }), 400


    if (
        visibility not in
        ALLOWED_VISIBILITIES
    ):

        return jsonify({
            "message":
                "Invalid document visibility."
        }), 400


    if (
        status not in
        CREATE_STATUSES
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
    # STORAGE
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
                "Document storage returned "
                "an invalid response."
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
                "Cloud storage did not return "
                "a public ID."
            )


        if not file_url:

            raise RuntimeError(
                "Cloud storage did not return "
                "the document URL."
            )


        # =================================================
        # DATABASE
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

            previous_status=
                None,

            deleted_at=
                None,

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


        # Upload succeeded but database failed:
        # remove orphaned Cloudinary asset.

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
                        "DOCUMENT STORAGE CLEANUP ERROR:",
                        cleanup_error,
                    )


        print(
            "CREATE DOCUMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to publish document. "
                "Please try again."
        }), 500


# =========================================================
# PUBLIC DOCUMENT LIST
# =========================================================
#
# GET /api/documents
#
# Only:
# published + public
#
# Deleted documents can NEVER appear here.
#
# =========================================================

@document_bp.route(
    "/documents",
    methods=[
        "GET",
    ],
)
def get_documents():

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


    query = (
        Document.query
        .filter(
            Document.status
            ==
            "published",

            Document.visibility
            ==
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
                Document.language
                ==
                language
            )
        )


    if category:

        query = (
            query.filter(
                Document.category
                ==
                category
            )
        )


    query = (
        query.order_by(
            Document.published_at.desc(),
            Document.created_at.desc(),
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
# Optional:
#
# ?status=draft
# ?status=published
# ?status=deleted
# ?status=all
# ?status=active
#
# Default = active
#
# active means:
# draft + published
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


    # =====================================================
    # STATUS
    # =====================================================

    status = (
        request.args.get(
            "status",
            "active",
        )
        or "active"
    ).strip().lower()


    allowed_filters = {
        "active",
        "all",
        "draft",
        "published",
        "deleted",
    }


    if (
        status not in
        allowed_filters
    ):

        return jsonify({
            "message":
                "Invalid document status filter."
        }), 400


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
        default=50,
        type=int,
    )


    page = max(
        page or 1,
        1,
    )


    limit = max(
        1,
        min(
            limit or 50,
            100,
        ),
    )


    # =====================================================
    # QUERY
    # =====================================================

    query = (
        Document.query
        .filter(
            Document.user_id
            ==
            user_id
        )
    )


    if (
        status ==
        "active"
    ):

        query = (
            query.filter(
                Document.status.in_({
                    "draft",
                    "published",
                })
            )
        )


    elif (
        status !=
        "all"
    ):

        query = (
            query.filter(
                Document.status
                ==
                status
            )
        )


    # Deleted items should be sorted by deletion time.
    if (
        status ==
        "deleted"
    ):

        query = (
            query.order_by(
                Document.deleted_at.desc(),
                Document.updated_at.desc(),
            )
        )

    else:

        query = (
            query.order_by(
                Document.updated_at.desc(),
                Document.created_at.desc(),
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

            "per_page":
                pagination.per_page,

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
# Owner:
# may inspect own active/deleted document.
#
# Public:
# only published public/unlisted.
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
# SOFT DELETE DOCUMENT
# =========================================================
#
# DELETE /api/documents/<id>
#
# Moves document to Trash.
#
# DOES NOT:
# - delete database row
# - delete Cloudinary PDF
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


    owner_error = (
        verify_document_owner(
            document,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        document.status
        ==
        "deleted"
    ):

        return jsonify({
            "message":
                "Document is already in Trash."
        }), 400


    try:

        # =================================================
        # REMEMBER PREVIOUS STATUS
        # =================================================

        document.previous_status = (
            document.status
            if document.status
            in {
                "draft",
                "published",
            }
            else "draft"
        )


        # =================================================
        # SOFT DELETE
        # =================================================

        document.status = (
            "deleted"
        )


        document.deleted_at = (
            utc_now()
        )


        # Do NOT remove:
        #
        # file_url
        # storage_public_id
        # published_at
        #
        # They are needed for restore.


        db.session.commit()


        db.session.refresh(
            document
        )


        return jsonify({

            "message":
                "Document moved to Trash successfully.",

            "document":
                document.to_dict(),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "SOFT DELETE DOCUMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to move document to Trash."
        }), 500


# =========================================================
# RESTORE DOCUMENT
# =========================================================
#
# POST /api/documents/<id>/restore
#
# Restores:
#
# deleted -> previous_status
#
# published -> deleted -> published
# draft     -> deleted -> draft
#
# =========================================================

@document_bp.route(
    "/documents/<int:document_id>/restore",
    methods=[
        "POST",
    ],
)
@jwt_required()
def restore_document(
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


    owner_error = (
        verify_document_owner(
            document,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        document.status
        !=
        "deleted"
    ):

        return jsonify({
            "message":
                "This document is not in Trash."
        }), 400


    restore_status = (
        document.previous_status
        if document.previous_status
        in {
            "draft",
            "published",
        }
        else "draft"
    )


    try:

        document.status = (
            restore_status
        )


        document.previous_status = (
            None
        )


        document.deleted_at = (
            None
        )


        # If a document originally came from Published,
        # preserve its original published_at.
        #
        # If somehow missing, create one.

        if (
            restore_status
            ==
            "published"
        ):

            if (
                document.published_at
                is None
            ):

                document.published_at = (
                    utc_now()
                )


        # Draft documents should not contain
        # a published timestamp.

        elif (
            restore_status
            ==
            "draft"
        ):

            document.published_at = (
                None
            )


        db.session.commit()


        db.session.refresh(
            document
        )


        return jsonify({

            "message":
                "Document restored successfully.",

            "restored_status":
                restore_status,

            "document":
                document.to_dict(),

        }), 200


    except Exception as error:

        db.session.rollback()


        print(
            "RESTORE DOCUMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to restore document."
        }), 500


# =========================================================
# PERMANENTLY DELETE DOCUMENT
# =========================================================
#
# DELETE /api/documents/<id>/permanent
#
# ONLY documents already in Trash can use this endpoint.
#
# Process:
#
# 1. Delete database record
# 2. Commit
# 3. Delete PDF from Cloudinary
#
# =========================================================

@document_bp.route(
    "/documents/<int:document_id>/permanent",
    methods=[
        "DELETE",
    ],
)
@jwt_required()
def permanently_delete_document(
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


    owner_error = (
        verify_document_owner(
            document,
            user_id,
        )
    )


    if owner_error:

        return owner_error


    if (
        document.status
        !=
        "deleted"
    ):

        return jsonify({
            "message":
                (
                    "Only documents in Trash "
                    "can be permanently deleted."
                )
        }), 400


    public_id = (
        document.storage_public_id
    )


    # =====================================================
    # DATABASE DELETE
    # =====================================================

    try:

        db.session.delete(
            document
        )


        db.session.commit()


    except Exception as error:

        db.session.rollback()


        print(
            "PERMANENT DOCUMENT DELETE "
            "DATABASE ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to permanently delete document."
        }), 500


    # =====================================================
    # CLOUDINARY DELETE
    # =====================================================
    #
    # Only now do we remove the actual PDF.
    #
    # =====================================================

    cloudinary_deleted = (
        True
    )


    if public_id:

        try:

            delete_pdf(
                public_id
            )

        except Exception as error:

            cloudinary_deleted = (
                False
            )


            print(
                "PERMANENT DOCUMENT "
                "CLOUDINARY DELETE ERROR:",
                error,
            )


    return jsonify({

        "message":
            "Document permanently deleted.",

        "storage_deleted":
            cloudinary_deleted,

    }), 200