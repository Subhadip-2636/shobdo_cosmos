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

from database import db
from models.document import Document

from services.document_storage import (
    delete_pdf,
    upload_pdf,
)


# =========================================================
# BLUEPRINT
# =========================================================

document_bp = Blueprint(
    "documents",
    __name__,
    url_prefix="/api/documents",
)


# =========================================================
# CONSTANTS
# =========================================================

MAX_PDF_SIZE = 10 * 1024 * 1024
MAX_PDF_PAGES = 30
MAX_EXTRACTED_TEXT_LENGTH = 100000

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
# HELPERS
# =========================================================

def get_current_user_id():

    identity = get_jwt_identity()

    try:
        return int(identity)

    except (TypeError, ValueError):
        return None


def parse_boolean(
    value,
    default=True,
):

    if value is None:
        return default

    value = str(value).strip().lower()

    if value in {
        "true",
        "1",
        "yes",
        "on",
    }:
        return True

    if value in {
        "false",
        "0",
        "no",
        "off",
    }:
        return False

    return default


def inspect_pdf(
    file_bytes,
):

    try:

        document = pymupdf.open(
            stream=file_bytes,
            filetype="pdf",
        )

    except Exception as error:

        raise ValueError(
            "The uploaded file is not a valid PDF."
        ) from error


    try:

        if document.needs_pass:

            raise ValueError(
                "Password-protected PDFs are not supported."
            )


        page_count = document.page_count

        if page_count < 1:

            raise ValueError(
                "The PDF contains no pages."
            )


        if page_count > MAX_PDF_PAGES:

            raise ValueError(
                f"PDF cannot contain more than "
                f"{MAX_PDF_PAGES} pages."
            )


        extracted_parts = []


        for page in document:

            try:

                text = (
                    page.get_text("text")
                    or ""
                ).strip()

            except Exception:

                text = ""


            if text:

                extracted_parts.append(
                    text
                )


        extracted_text = "\n".join(
            extracted_parts
        ).strip()


        if (
            len(extracted_text)
            > MAX_EXTRACTED_TEXT_LENGTH
        ):

            extracted_text = extracted_text[
                :MAX_EXTRACTED_TEXT_LENGTH
            ]


        return {
            "page_count":
                page_count,

            "extracted_text":
                extracted_text,
        }


    finally:

        document.close()


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
    "",
    methods=["POST"],
)
@jwt_required()
def create_document():

    user_id = get_current_user_id()


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    # =====================================================
    # PDF FILE
    # =====================================================

    uploaded_file = request.files.get(
        "document"
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


    if not original_filename.lower().endswith(
        ".pdf"
    ):

        return jsonify({
            "message":
                "Only PDF files are supported."
        }), 400


    file_bytes = uploaded_file.read()


    if not file_bytes:

        return jsonify({
            "message":
                "The uploaded PDF is empty."
        }), 400


    if len(file_bytes) > MAX_PDF_SIZE:

        return jsonify({
            "message":
                "PDF size cannot exceed 10 MB."
        }), 413


    # Basic PDF signature check.

    if not file_bytes.startswith(
        b"%PDF-"
    ):

        return jsonify({
            "message":
                "The uploaded file is not a valid PDF."
        }), 400


    # =====================================================
    # FORM FIELDS
    # =====================================================

    title = (
        request.form.get("title")
        or ""
    ).strip()


    description = (
        request.form.get("description")
        or ""
    ).strip()


    category = (
        request.form.get("category")
        or "অন্যান্য"
    ).strip()


    language = (
        request.form.get("language")
        or "bn"
    ).strip().lower()


    visibility = (
        request.form.get("visibility")
        or "public"
    ).strip().lower()


    status = (
        request.form.get("status")
        or "published"
    ).strip().lower()


    allow_download = parse_boolean(
        request.form.get(
            "allow_download"
        ),
        default=True,
    )


    # =====================================================
    # FIELD VALIDATION
    # =====================================================

    if not title:

        return jsonify({
            "message":
                "Document title is required."
        }), 400


    if len(title) > 200:

        return jsonify({
            "message":
                "Document title cannot exceed "
                "200 characters."
        }), 400


    if len(description) > 5000:

        return jsonify({
            "message":
                "Description cannot exceed "
                "5000 characters."
        }), 400


    if len(category) > 80:

        return jsonify({
            "message":
                "Category cannot exceed "
                "80 characters."
        }), 400


    if language not in ALLOWED_LANGUAGES:

        return jsonify({
            "message":
                "Unsupported document language."
        }), 400


    if visibility not in ALLOWED_VISIBILITIES:

        return jsonify({
            "message":
                "Invalid document visibility."
        }), 400


    if status not in ALLOWED_STATUSES:

        return jsonify({
            "message":
                "Invalid document status."
        }), 400


    # =====================================================
    # INSPECT PDF
    # =====================================================

    try:

        pdf_info = inspect_pdf(
            file_bytes
        )

    except ValueError as error:

        return jsonify({
            "message":
                str(error)
        }), 400


    # =====================================================
    # CLOUDINARY UPLOAD
    # =====================================================

    storage_result = None


    try:

        storage_result = upload_pdf(
            file_bytes
        )


        public_id = storage_result.get(
            "public_id"
        )

        file_url = storage_result.get(
            "file_url"
        )

        thumbnail_url = storage_result.get(
            "thumbnail_url"
        )


        if not public_id or not file_url:

            raise RuntimeError(
                "Cloud storage did not return "
                "the required document information."
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
                datetime.now(
                    timezone.utc
                )
                if status == "published"
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
                    if status == "published"
                    else
                    "Document draft saved successfully."
                ),

            "document":
                new_document.to_dict(),
        }), 201


    except Exception as error:

        db.session.rollback()


        # If Cloudinary upload succeeded but the database
        # operation failed, clean up the uploaded asset.

        if storage_result:

            public_id = storage_result.get(
                "public_id"
            )

            if public_id:

                try:

                    delete_pdf(
                        public_id
                    )

                except Exception as cleanup_error:

                    print(
                        "DOCUMENT STORAGE "
                        "CLEANUP ERROR:",
                        cleanup_error,
                    )


        print(
            "CREATE DOCUMENT ERROR:",
            error,
        )


        return jsonify({
            "message":
                "Unable to publish document."
        }), 500


# =========================================================
# PUBLIC DOCUMENT LIST
# =========================================================
#
# GET /api/documents
#
# =========================================================

@document_bp.route(
    "",
    methods=["GET"],
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


    query = (
        Document.query
        .filter(
            Document.status
            == "published",

            Document.visibility
            == "public",
        )
        .order_by(
            Document.published_at.desc(),
            Document.created_at.desc(),
        )
    )


    pagination = query.paginate(
        page=page,
        per_page=limit,
        error_out=False,
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
# CURRENT USER DOCUMENTS
# =========================================================
#
# GET /api/documents/mine
#
# Includes drafts and published documents.
#
# =========================================================

@document_bp.route(
    "/mine",
    methods=["GET"],
)
@jwt_required()
def get_my_documents():

    user_id = get_current_user_id()


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    documents = (
        Document.query
        .filter(
            Document.user_id
            == user_id
        )
        .order_by(
            Document.created_at.desc()
        )
        .all()
    )


    return jsonify({
        "documents": [
            document.to_dict()
            for document
            in documents
        ]
    }), 200


# =========================================================
# SINGLE DOCUMENT
# =========================================================
#
# GET /api/documents/<id>
#
# =========================================================

@document_bp.route(
    "/<int:document_id>",
    methods=["GET"],
)
def get_document(
    document_id,
):

    document = db.session.get(
        Document,
        document_id,
    )


    if document is None:

        return jsonify({
            "message":
                "Document not found."
        }), 404


    if document.status != "published":

        return jsonify({
            "message":
                "Document not found."
        }), 404


    if document.visibility not in {
        "public",
        "unlisted",
    }:

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
# =========================================================

@document_bp.route(
    "/<int:document_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_document(
    document_id,
):

    user_id = get_current_user_id()


    if user_id is None:

        return jsonify({
            "message":
                "Invalid authentication identity."
        }), 401


    document = db.session.get(
        Document,
        document_id,
    )


    if document is None:

        return jsonify({
            "message":
                "Document not found."
        }), 404


    if document.user_id != user_id:

        return jsonify({
            "message":
                "You do not have permission "
                "to delete this document."
        }), 403


    public_id = (
        document.storage_public_id
    )


    # Delete the database record first.
    # If Cloudinary cleanup fails afterward,
    # the user's application data is still deleted.

    try:

        db.session.delete(
            document
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "DELETE DOCUMENT ERROR:",
            error,
        )

        return jsonify({
            "message":
                "Unable to delete document."
        }), 500


    # Remove Cloudinary asset.

    if public_id:

        try:

            delete_pdf(
                public_id
            )

        except Exception as error:

            print(
                "DOCUMENT CLOUDINARY "
                "DELETE ERROR:",
                error,
            )


    return jsonify({
        "message":
            "Document deleted successfully."
    }), 200