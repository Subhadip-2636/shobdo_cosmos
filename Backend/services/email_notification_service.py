import html
import os
import smtplib

from email.message import EmailMessage
from email.utils import formataddr, parseaddr
from urllib.parse import urlparse


# =========================================================
# CONFIG HELPERS
# =========================================================


def get_env_bool(
    name,
    default=False,
):

    value = os.getenv(name)

    if value is None:
        return default

    return (
        str(value)
        .strip()
        .lower()
        in {
            "1",
            "true",
            "yes",
            "on",
        }
    )


def get_email_config():

    host = (
        os.getenv("MAIL_SERVER")
        or os.getenv("SMTP_HOST")
        or ""
    ).strip()

    port_raw = (
        os.getenv("MAIL_PORT")
        or os.getenv("SMTP_PORT")
        or "587"
    ).strip()

    username = (
        os.getenv("MAIL_USERNAME")
        or os.getenv("SMTP_USERNAME")
        or ""
    ).strip()

    password = (
        os.getenv("MAIL_PASSWORD")
        or os.getenv("SMTP_PASSWORD")
        or ""
    ).strip()

    raw_sender = (
        os.getenv("MAIL_DEFAULT_SENDER")
        or os.getenv("SMTP_FROM_EMAIL")
        or username
        or ""
    ).strip()

    configured_sender_name = (
        os.getenv("SMTP_FROM_NAME")
        or "SHOBDO"
    ).strip()

    # MAIL_DEFAULT_SENDER may be either:
    #
    #     address@gmail.com
    #
    # or:
    #
    #     SHOBDO <address@gmail.com>
    #
    parsed_name, parsed_email = parseaddr(
        raw_sender
    )

    sender_email = (
        parsed_email
        or raw_sender
    ).strip()

    sender_name = (
        parsed_name
        or configured_sender_name
        or "SHOBDO"
    ).strip()

    use_tls = get_env_bool(
        "MAIL_USE_TLS",
        get_env_bool(
            "SMTP_USE_TLS",
            True,
        ),
    )

    use_ssl = get_env_bool(
        "MAIL_USE_SSL",
        get_env_bool(
            "SMTP_USE_SSL",
            False,
        ),
    )

    enabled = get_env_bool(
        "EMAIL_NOTIFICATIONS_ENABLED",
        False,
    )

    try:
        port = int(port_raw)

    except (
        TypeError,
        ValueError,
    ):
        port = 587

    return {
        "enabled": enabled,
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "sender_email": sender_email,
        "sender_name": sender_name,
        "use_tls": use_tls,
        "use_ssl": use_ssl,
    }


# =========================================================
# VALIDATION
# =========================================================


def validate_email_config(
    config,
):

    if not config.get(
        "enabled"
    ):
        return (
            False,
            "Email notifications are disabled.",
        )

    required = [
        "host",
        "sender_email",
    ]

    for key in required:

        if not config.get(key):
            return (
                False,
                f"Missing email configuration: {key}",
            )

    if (
        config.get("use_ssl")
        and config.get("use_tls")
    ):
        return (
            False,
            (
                "SMTP SSL and TLS cannot "
                "both be enabled."
            ),
        )

    username = (
        config.get("username")
        or ""
    ).strip()

    password = (
        config.get("password")
        or ""
    ).strip()

    if username and not password:
        return (
            False,
            "SMTP password is missing.",
        )

    return (
        True,
        None,
    )


# =========================================================
# TEXT HELPERS
# =========================================================


def normalize_header_text(
    value,
    default="",
    max_length=250,
):

    value = str(
        value
        or default
    )

    # Prevent accidental/newline header injection.
    value = " ".join(
        value.splitlines()
    ).strip()

    return value[:max_length]


def normalize_plain_text(
    value,
    default="",
    max_length=5000,
):

    value = str(
        value
        or default
    ).strip()

    return value[:max_length]


def normalize_recipient_email(
    value,
):

    _, email_address = parseaddr(
        str(value or "")
    )

    return (
        email_address
        or str(value or "")
    ).strip()


def normalize_recipient_name(
    value,
):

    return normalize_header_text(
        value,
        default="",
        max_length=120,
    )


# =========================================================
# ACTION URL SECURITY
# =========================================================


def normalize_action_url(
    action_url,
):

    if not action_url:
        return None

    action_url = str(
        action_url
    ).strip()

    try:

        parsed = urlparse(
            action_url
        )

    except Exception:

        return None

    # Only permit normal website URLs.
    #
    # Reject:
    # javascript:
    # data:
    # file:
    # etc.
    if parsed.scheme not in {
        "http",
        "https",
    }:
        return None

    if not parsed.netloc:
        return None

    return action_url


# =========================================================
# BUILD EMAIL MESSAGE
# =========================================================


def build_email_message(
    recipient_email,
    subject,
    text_body,
    html_body=None,
    recipient_name=None,
):

    config = get_email_config()

    recipient_email = (
        normalize_recipient_email(
            recipient_email
        )
    )

    recipient_name = (
        normalize_recipient_name(
            recipient_name
        )
    )

    subject = normalize_header_text(
        subject,
        default="SHOBDO notification",
        max_length=250,
    )

    message = EmailMessage()

    message["Subject"] = subject

    message["From"] = formataddr(
        (
            config["sender_name"],
            config["sender_email"],
        )
    )

    if recipient_name:

        message["To"] = formataddr(
            (
                recipient_name,
                recipient_email,
            )
        )

    else:

        message["To"] = (
            recipient_email
        )

    message.set_content(
        text_body
    )

    if html_body:

        message.add_alternative(
            html_body,
            subtype="html",
        )

    return message


# =========================================================
# SEND EMAIL
# =========================================================


def send_email(
    recipient_email,
    subject,
    text_body,
    html_body=None,
    recipient_name=None,
):

    config = get_email_config()

    valid, error = (
        validate_email_config(
            config
        )
    )

    if not valid:

        return {
            "success": False,
            "skipped": True,
            "error": error,
        }

    recipient_email = (
        normalize_recipient_email(
            recipient_email
        )
    )

    if not recipient_email:

        return {
            "success": False,
            "skipped": True,
            "error":
                "Recipient email is missing.",
        }

    text_body = normalize_plain_text(
        text_body,
        default="",
        max_length=10000,
    )

    try:

        message = build_email_message(
            recipient_email=
                recipient_email,

            recipient_name=
                recipient_name,

            subject=
                subject,

            text_body=
                text_body,

            html_body=
                html_body,
        )

        if config["use_ssl"]:

            server = smtplib.SMTP_SSL(
                config["host"],
                config["port"],
                timeout=20,
            )

        else:

            server = smtplib.SMTP(
                config["host"],
                config["port"],
                timeout=20,
            )

        try:

            server.ehlo()

            if (
                config["use_tls"]
                and not config["use_ssl"]
            ):

                server.starttls()

                server.ehlo()

            if config["username"]:

                server.login(
                    config["username"],
                    config["password"],
                )

            server.send_message(
                message
            )

        finally:

            try:
                server.quit()

            except Exception:
                pass

        return {
            "success": True,
            "skipped": False,
            "error": None,
        }

    except Exception as error:

        print(
            "EMAIL SEND ERROR:",
            str(error),
        )

        return {
            "success": False,
            "skipped": False,
            "error": str(error),
        }


# =========================================================
# HTML TEMPLATE
# =========================================================


def build_notification_html(
    title,
    message,
    action_url=None,
    action_label="View on SHOBDO",
):

    # HTML escaping is mandatory because notification text
    # may ultimately contain user-controlled values.

    safe_title = html.escape(
        normalize_plain_text(
            title,
            default="SHOBDO",
            max_length=250,
        )
    )

    safe_message = html.escape(
        normalize_plain_text(
            message,
            default="",
            max_length=5000,
        )
    )

    # Preserve plain-text line breaks in HTML safely.
    safe_message = (
        safe_message.replace(
            "\n",
            "<br>"
        )
    )

    safe_action_label = html.escape(
        normalize_plain_text(
            action_label,
            default="View on SHOBDO",
            max_length=100,
        )
    )

    action_url = normalize_action_url(
        action_url
    )

    action_html = ""

    if action_url:

        safe_action_url = html.escape(
            action_url,
            quote=True,
        )

        action_html = f"""
        <div style="
            margin-top:24px;
        ">
            <a
                href="{safe_action_url}"
                style="
                    display:inline-block;
                    padding:11px 18px;
                    border-radius:10px;
                    background:#5a3b6d;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:14px;
                    font-weight:700;
                "
            >
                {safe_action_label}
            </a>
        </div>
        """

    return f"""
    <!doctype html>

    <html>

    <head>

        <meta charset="utf-8">

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
        >

    </head>

    <body
        style="
            margin:0;
            padding:0;
            background:#f5f1eb;
            font-family:
                Arial,
                Helvetica,
                sans-serif;
            color:#342d28;
        "
    >

        <div
            style="
                width:100%;
                padding:32px 16px;
                box-sizing:border-box;
            "
        >

            <div
                style="
                    max-width:620px;
                    margin:0 auto;
                    background:#fffdfa;
                    border:1px solid #e9dfd4;
                    border-radius:18px;
                    overflow:hidden;
                    box-shadow:
                        0 10px 30px
                        rgba(
                            55,
                            42,
                            29,
                            0.08
                        );
                "
            >

                <div
                    style="
                        padding:22px 28px;
                        background:
                            linear-gradient(
                                135deg,
                                #2e1d3d,
                                #65476f
                            );
                        color:#ffffff;
                    "
                >

                    <div
                        style="
                            font-family:
                                Georgia,
                                serif;
                            font-size:24px;
                            font-weight:700;
                            letter-spacing:0.06em;
                        "
                    >
                        SHOBDO
                    </div>

                    <div
                        style="
                            margin-top:5px;
                            color:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    0.78
                                );
                            font-size:12px;
                        "
                    >
                        Words connecting people across languages
                    </div>

                </div>

                <div
                    style="
                        padding:28px;
                    "
                >

                    <h2
                        style="
                            margin:0 0 12px;
                            font-family:
                                Georgia,
                                serif;
                            font-size:22px;
                            color:#302720;
                        "
                    >
                        {safe_title}
                    </h2>

                    <p
                        style="
                            margin:0;
                            color:#62574e;
                            font-size:15px;
                            line-height:1.65;
                        "
                    >
                        {safe_message}
                    </p>

                    {action_html}

                </div>

                <div
                    style="
                        padding:16px 28px;
                        border-top:
                            1px solid #eee4da;
                        color:#93877c;
                        font-size:11px;
                        line-height:1.5;
                    "
                >
                    This email was sent by SHOBDO because
                    notification emails are enabled for your account.
                </div>

            </div>

        </div>

    </body>

    </html>
    """


# =========================================================
# NOTIFICATION EMAIL
# =========================================================


def send_notification_email(
    recipient_email,
    recipient_name,
    subject,
    message,
    action_url=None,
):

    subject = normalize_header_text(
        subject,
        default="SHOBDO notification",
        max_length=250,
    )

    message = normalize_plain_text(
        message,
        default="",
        max_length=5000,
    )

    action_url = normalize_action_url(
        action_url
    )

    text_body = message

    if action_url:

        text_body += (
            "\n\n"
            "View on SHOBDO:\n"
            f"{action_url}"
        )

    html_body = (
        build_notification_html(
            title=subject,
            message=message,
            action_url=action_url,
        )
    )

    return send_email(
        recipient_email=
            recipient_email,

        recipient_name=
            recipient_name,

        subject=
            subject,

        text_body=
            text_body,

        html_body=
            html_body,
    )