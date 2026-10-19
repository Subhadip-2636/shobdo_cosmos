
import {
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  X,
  Repeat2,
  AtSign,
  Mail,
  FileText,
  ShieldAlert,
  Reply,
} from "lucide-react";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSafeNotificationTarget,
} from "../api/notifications";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./NotificationToast.css";

// =========================================================
// TRANSLATIONS
// =========================================================

const TRANSLATIONS = {
  en: {
    someone: "Someone",
    like: "liked your writing",
    comment: "commented on your writing",
    comment_reply: "replied to your comment",
    follow: "started following you",
    mention: "mentioned you",
    repost: "reposted your writing",
    message: "sent you a message",
    new_writing: "published a new writing",
    system: "SHOBDO announcement",
    security: "SHOBDO security alert",
    default: "You have a new notification",
    close: "Close notification",
    open: "Open notification",
  },

  bn: {
    someone: "কেউ",
    like: "আপনার লেখা পছন্দ করেছেন",
    comment: "আপনার লেখায় মন্তব্য করেছেন",
    comment_reply: "আপনার মন্তব্যের উত্তর দিয়েছেন",
    follow: "আপনাকে অনুসরণ করা শুরু করেছেন",
    mention: "আপনাকে উল্লেখ করেছেন",
    repost: "আপনার লেখা পুনরায় শেয়ার করেছেন",
    message: "আপনাকে একটি বার্তা পাঠিয়েছেন",
    new_writing: "একটি নতুন লেখা প্রকাশ করেছেন",
    system: "SHOBDO ঘোষণা",
    security: "SHOBDO নিরাপত্তা সতর্কতা",
    default: "আপনার একটি নতুন বিজ্ঞপ্তি এসেছে",
    close: "বিজ্ঞপ্তি বন্ধ করুন",
    open: "বিজ্ঞপ্তি খুলুন",
  },

  hi: {
    someone: "किसी ने",
    like: "आपकी रचना पसंद की",
    comment: "आपकी रचना पर टिप्पणी की",
    comment_reply: "आपकी टिप्पणी का उत्तर दिया",
    follow: "आपको फ़ॉलो करना शुरू किया",
    mention: "आपका उल्लेख किया",
    repost: "आपकी रचना को रीपोस्ट किया",
    message: "आपको एक संदेश भेजा",
    new_writing: "एक नई रचना प्रकाशित की",
    system: "SHOBDO घोषणा",
    security: "SHOBDO सुरक्षा चेतावनी",
    default: "आपके लिए एक नई सूचना है",
    close: "सूचना बंद करें",
    open: "सूचना खोलें",
  },
};

// =========================================================
// ICON CONFIGURATION
// =========================================================

function getNotificationIcon(type) {
  switch (type) {
    case "like":
      return <Heart size={20} />;

    case "comment":
      return <MessageCircle size={20} />;

    case "comment_reply":
      return <Reply size={20} />;

    case "follow":
      return <UserPlus size={20} />;

    case "mention":
      return <AtSign size={20} />;

    case "repost":
      return <Repeat2 size={20} />;

    case "message":
      return <Mail size={20} />;

    case "new_writing":
      return <FileText size={20} />;

    case "security":
      return <ShieldAlert size={20} />;

    default:
      return <Bell size={20} />;
  }
}

// =========================================================
// INTERNAL NAVIGATION
// =========================================================

function getNotificationTarget(notification) {
  if (notification?.target_url) {
    return getSafeNotificationTarget(
      notification.target_url
    );
  }

  const actorId =
    notification?.actor?.id ??
    notification?.actor_id;

  const writingId =
    notification?.writing?.id ??
    notification?.writing_id;

  if (
    notification?.type === "follow" &&
    Number.isSafeInteger(Number(actorId)) &&
    Number(actorId) > 0
  ) {
    return `/users/${Number(actorId)}`;
  }

  if (
    Number.isSafeInteger(Number(writingId)) &&
    Number(writingId) > 0
  ) {
    return `/writings/${Number(writingId)}`;
  }

  if (notification?.type === "message") {
    return "/messages";
  }

  return "/notifications";
}

// =========================================================
// COMPONENT
// =========================================================

function NotificationToast({
  notification,
  onClose,
}) {
  const navigate = useNavigate();

  const { language } = useLanguage();

  const locale = TRANSLATIONS[language]
    ? language
    : "en";

  const text = TRANSLATIONS[locale];

  // -------------------------------------------------------
  // KEYBOARD SUPPORT
  // -------------------------------------------------------

  useEffect(() => {
    if (!notification) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [notification, onClose]);

  if (!notification) {
    return null;
  }

  // -------------------------------------------------------
  // NOTIFICATION DATA
  // -------------------------------------------------------

  const actorName =
    notification?.actor?.name ||
    notification?.actor?.username ||
    text.someone;

  const writingTitle =
    notification?.writing?.title || "";

  const notificationType =
    String(notification?.type || "system")
      .toLowerCase();

  const systemType =
    notificationType === "system" ||
    notificationType === "security";

  const description =
    text[notificationType] ||
    text.default;

  const message = systemType
    ? notification?.message || description
    : text[notificationType]
      ? `${actorName} ${description}`
      : notification?.message || description;

  const icon =
    getNotificationIcon(notificationType);

  // -------------------------------------------------------
  // OPEN NOTIFICATION
  // -------------------------------------------------------

  function handleOpen() {
    const target =
      getNotificationTarget(notification);

    onClose?.();

    navigate(target);
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <div
      className={[
        "shobdo-notification-toast",
        `shobdo-notification-toast--${notificationType}`,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <button
        type="button"
        className="shobdo-notification-toast-main"
        onClick={handleOpen}
        aria-label={`${text.open}: ${message}`}
      >
        {/* NOTIFICATION ICON */}

        <span
          className="shobdo-notification-toast-icon"
          aria-hidden="true"
        >
          {icon}
        </span>

        {/* NOTIFICATION MESSAGE */}

        <span className="shobdo-notification-toast-content">
          <strong>
            {message}
          </strong>

          {writingTitle && (
            <span>
              {writingTitle}
            </span>
          )}
        </span>
      </button>

      {/* CLOSE BUTTON */}

      <button
        type="button"
        className="shobdo-notification-toast-close"
        onClick={() => onClose?.()}
        aria-label={text.close}
        title={text.close}
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default NotificationToast;
