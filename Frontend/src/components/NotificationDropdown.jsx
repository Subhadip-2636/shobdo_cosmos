import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./NotificationDropdown.css";


const PREVIEW_LIMIT = 8;


function getInitial(
  notification
) {

  const value =
    notification?.actor?.name ||
    notification?.actor?.username ||
    "S";

  return String(value)
    .trim()
    .slice(0, 1)
    .toUpperCase();
}


function NotificationDropdown({
  unreadCount = 0,
  setUnreadCount,
  active = false,
}) {

  const navigate =
    useNavigate();

  const {
    language,
  } = useLanguage();

  const wrapperRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);


  const text = {

    title:
      language === "bn"
        ? "বিজ্ঞপ্তি"
        : language === "hi"
          ? "सूचनाएँ"
          : "Notifications",

    markAll:
      language === "bn"
        ? "সব পড়া হয়েছে"
        : language === "hi"
          ? "सभी पढ़े हुए"
          : "Mark all as read",

    seeAll:
      language === "bn"
        ? "সব বিজ্ঞপ্তি দেখুন"
        : language === "hi"
          ? "सभी सूचनाएँ देखें"
          : "See all notifications",

    empty:
      language === "bn"
        ? "এখনও কোনো বিজ্ঞপ্তি নেই"
        : language === "hi"
          ? "अभी कोई सूचना नहीं"
          : "No notifications yet",

    loading:
      language === "bn"
        ? "লোড হচ্ছে..."
        : language === "hi"
          ? "लोड हो रहा है..."
          : "Loading...",

    error:
      language === "bn"
        ? "বিজ্ঞপ্তি লোড করা যায়নি"
        : language === "hi"
          ? "सूचनाएँ लोड नहीं हो सकीं"
          : "Unable to load notifications",

    new:
      language === "bn"
        ? "নতুন"
        : language === "hi"
          ? "नई"
          : "New",
  };


  function getMessage(
    notification
  ) {

    const name =
      notification?.actor?.name ||
      notification?.actor?.username ||
      (
        language === "bn"
          ? "কেউ"
          : language === "hi"
            ? "किसी उपयोगकर्ता ने"
            : "Someone"
      );

    const title =
      notification?.writing?.title ||
      (
        language === "bn"
          ? "আপনার লেখা"
          : language === "hi"
            ? "आपकी रचना"
            : "your writing"
      );

    if (language === "bn") {

      switch (
        notification?.type
      ) {

        case "follow":
          return `${name} আপনাকে অনুসরণ করা শুরু করেছেন`;

        case "like":
          return `${name} আপনার লেখা “${title}” পছন্দ করেছেন`;

        case "comment":
          return `${name} আপনার লেখা “${title}”-তে মন্তব্য করেছেন`;

        case "comment_reply":
          return `${name} আপনার মন্তব্যের উত্তর দিয়েছেন`;

        case "mention":
          return `${name} আপনাকে উল্লেখ করেছেন`;

        case "repost":
          return `${name} আপনার লেখা “${title}” পুনরায় শেয়ার করেছেন`;

        case "message":
          return `${name} আপনাকে একটি বার্তা পাঠিয়েছেন`;

        case "new_writing":
          return `${name} নতুন লেখা “${title}” প্রকাশ করেছেন`;

        default:
          return (
            notification?.message ||
            "SHOBDO-তে নতুন একটি বিজ্ঞপ্তি আছে।"
          );
      }
    }


    if (language === "hi") {

      switch (
        notification?.type
      ) {

        case "follow":
          return `${name} ने आपको फ़ॉलो करना शुरू किया`;

        case "like":
          return `${name} ने आपकी रचना “${title}” को पसंद किया`;

        case "comment":
          return `${name} ने आपकी रचना “${title}” पर टिप्पणी की`;

        case "comment_reply":
          return `${name} ने आपकी टिप्पणी का उत्तर दिया`;

        case "mention":
          return `${name} ने आपका उल्लेख किया`;

        case "repost":
          return `${name} ने आपकी रचना “${title}” को रीपोस्ट किया`;

        case "message":
          return `${name} ने आपको एक संदेश भेजा`;

        case "new_writing":
          return `${name} ने नई रचना “${title}” प्रकाशित की`;

        default:
          return (
            notification?.message ||
            "SHOBDO पर आपके लिए एक नई सूचना है।"
          );
      }
    }


    switch (
      notification?.type
    ) {

      case "follow":
        return `${name} started following you`;

      case "like":
        return `${name} liked your writing “${title}”`;

      case "comment":
        return `${name} commented on “${title}”`;

      case "comment_reply":
        return `${name} replied to your comment`;

      case "mention":
        return `${name} mentioned you`;

      case "repost":
        return `${name} reposted your writing “${title}”`;

      case "message":
        return `${name} sent you a message`;

      case "new_writing":
        return `${name} published “${title}”`;

      default:
        return (
          notification?.message ||
          "You have a new SHOBDO notification."
        );
    }
  }


  function getTypeIcon(
    type
  ) {

    switch (type) {

      case "like":
        return <Heart size={13} />;

      case "comment":
      case "comment_reply":
      case "mention":
        return (
          <MessageCircle
            size={13}
          />
        );

      case "follow":
        return (
          <UserPlus
            size={13}
          />
        );

      case "repost":
        return (
          <Repeat2
            size={13}
          />
        );

      default:
        return (
          <Bell
            size={13}
          />
        );
    }
  }


  function formatTime(
    value
  ) {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    const difference =
      Math.max(
        0,
        Date.now() -
          date.getTime()
      );

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1) {

      return language === "bn"
        ? "এইমাত্র"
        : language === "hi"
          ? "अभी"
          : "Just now";
    }

    if (minutes < 60) {

      return language === "bn"
        ? `${minutes} মিনিট আগে`
        : language === "hi"
          ? `${minutes} मिनट पहले`
          : `${minutes}m`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {

      return language === "bn"
        ? `${hours} ঘণ্টা আগে`
        : language === "hi"
          ? `${hours} घंटे पहले`
          : `${hours}h`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    return language === "bn"
      ? `${days} দিন আগে`
      : language === "hi"
        ? `${days} दिन पहले`
        : `${days}d`;
  }


  async function loadNotifications() {

    setLoading(true);
    setError("");

    try {

      const data =
        await getNotifications({
          page: 1,
          perPage:
            PREVIEW_LIMIT,
        });

      const items =
        Array.isArray(
          data?.notifications
        )
          ? data.notifications
          : [];

      setNotifications(
        items
      );

      const nextCount =
        Number(
          data?.unread_count
        );

      if (
        Number.isFinite(
          nextCount
        ) &&
        typeof setUnreadCount ===
          "function"
      ) {

        setUnreadCount(
          Math.max(
            nextCount,
            0
          )
        );
      }

    } catch (
      requestError
    ) {

      console.error(
        "NAVBAR NOTIFICATION LOAD ERROR:",
        requestError
      );

      setError(
        requestError?.message ||
        text.error
      );

    } finally {

      setLoading(false);
    }
  }


  function toggleDropdown() {

    setOpen(
      (current) =>
        !current
    );
  }


  useEffect(() => {

    if (open) {
      loadNotifications();
    }

  }, [
    open,
  ]);


  useEffect(() => {

    function handleOutside(
      event
    ) {

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {

        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    return () => {

      document.removeEventListener(
        "pointerdown",
        handleOutside
      );
    };

  }, []);


  useEffect(() => {

    function handleKeyDown(
      event
    ) {

      if (
        event.key ===
        "Escape"
      ) {

        setOpen(false);
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

  }, []);


  useEffect(() => {

    function handleChanged() {

      if (open) {
        loadNotifications();
      }
    }

    window.addEventListener(
      "shobdo:notifications-changed",
      handleChanged
    );

    window.addEventListener(
      "shobdo:notification-received",
      handleChanged
    );

    return () => {

      window.removeEventListener(
        "shobdo:notifications-changed",
        handleChanged
      );

      window.removeEventListener(
        "shobdo:notification-received",
        handleChanged
      );
    };

  }, [
    open,
  ]);


  async function handleNotificationClick(
    notification
  ) {

    if (!notification) {
      return;
    }

    if (
      !notification.is_read
    ) {

      try {

        const data =
          await markNotificationRead(
            notification.id
          );

        const nextCount =
          Number(
            data?.unread_count
          );

        if (
          typeof setUnreadCount ===
            "function"
        ) {

          setUnreadCount(
            Number.isFinite(
              nextCount
            )
              ? Math.max(
                  nextCount,
                  0
                )
              : Math.max(
                  unreadCount - 1,
                  0
                )
          );
        }

      } catch (
        requestError
      ) {

        console.error(
          "NAVBAR MARK READ ERROR:",
          requestError
        );
      }
    }

    setOpen(false);

    window.dispatchEvent(
      new Event(
        "shobdo:notifications-changed"
      )
    );

    const target =
      notification?.target_url;

    if (target) {

      navigate(target);
      return;
    }

    if (
      notification?.type ===
      "follow"
    ) {

      const actorId =
        notification?.actor?.id ||
        notification?.actor_id;

      if (actorId) {

        navigate(
          `/users/${actorId}`
        );
      }

      return;
    }

    const writingId =
      notification?.writing?.id ||
      notification?.writing_id;

    if (writingId) {

      navigate(
        `/writings/${writingId}`
      );
    }
  }


  async function handleMarkAll() {

    if (
      markingAll ||
      unreadCount <= 0
    ) {

      return;
    }

    setMarkingAll(true);

    try {

      await markAllNotificationsRead();

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              is_read: true,
            })
          )
      );

      if (
        typeof setUnreadCount ===
          "function"
      ) {

        setUnreadCount(0);
      }

      window.dispatchEvent(
        new Event(
          "shobdo:notifications-changed"
        )
      );

    } catch (
      requestError
    ) {

      console.error(
        "NAVBAR MARK ALL READ ERROR:",
        requestError
      );

    } finally {

      setMarkingAll(false);
    }
  }


  function handleSeeAll() {

    setOpen(false);

    navigate(
      "/notifications"
    );
  }


  const badge =
    unreadCount > 99
      ? "99+"
      : unreadCount;


  return (

    <div
      className="shobdo-notification-dropdown-wrapper"
      ref={wrapperRef}
    >

      <button
        type="button"
        className={[
          "shobdo-navbar-icon-button",
          "shobdo-notification-button",
          active
            ? "active"
            : "",
          open
            ? "dropdown-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={
          toggleDropdown
        }
        aria-label={
          unreadCount > 0
            ? `${text.title}: ${unreadCount}`
            : text.title
        }
        aria-expanded={
          open
        }
        aria-haspopup="menu"
        title={
          text.title
        }
      >

        <Bell
          size={19}
          strokeWidth={1.9}
        />

        {
          unreadCount > 0 && (

            <span
              className="shobdo-navbar-notification-badge"
              aria-hidden="true"
            >

              {badge}

            </span>
          )
        }

      </button>


      {
        open && (

          <div
            className="shobdo-notification-dropdown shobdo-dropdown-animate"
            role="menu"
          >

            <div className="shobdo-notification-dropdown-header">

              <div>

                <h3>
                  {text.title}
                </h3>

                {
                  unreadCount > 0 && (

                    <span>
                      {unreadCount} {text.new}
                    </span>
                  )
                }

              </div>


              {
                unreadCount > 0 && (

                  <button
                    type="button"
                    className="shobdo-notification-mark-all"
                    onClick={
                      handleMarkAll
                    }
                    disabled={
                      markingAll
                    }
                  >

                    <CheckCheck
                      size={15}
                    />

                    <span>
                      {text.markAll}
                    </span>

                  </button>
                )
              }

            </div>


            <div className="shobdo-notification-dropdown-body">

              {
                loading && (

                  <div className="shobdo-notification-dropdown-state">

                    <div className="shobdo-notification-mini-spinner" />

                    <span>
                      {text.loading}
                    </span>

                  </div>
                )
              }


              {
                !loading &&
                error && (

                  <div className="shobdo-notification-dropdown-state error">

                    <Bell
                      size={22}
                    />

                    <span>
                      {text.error}
                    </span>

                    <button
                      type="button"
                      onClick={
                        loadNotifications
                      }
                    >
                      Retry
                    </button>

                  </div>
                )
              }


              {
                !loading &&
                !error &&
                notifications.length ===
                  0 && (

                  <div className="shobdo-notification-dropdown-state empty">

                    <div className="shobdo-notification-empty-icon">

                      <Bell
                        size={22}
                      />

                    </div>

                    <span>
                      {text.empty}
                    </span>

                  </div>
                )
              }


              {
                !loading &&
                !error &&
                notifications.map(
                  (
                    notification
                  ) => (

                    <button
                      type="button"
                      key={
                        notification.id
                      }
                      className={[
                        "shobdo-notification-preview-item",

                        !notification.is_read
                          ? "unread"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      role="menuitem"
                    >

                      <div className="shobdo-notification-preview-avatar">

                        {
                          notification?.actor?.avatar_url
                            ? (

                              <img
                                src={
                                  notification
                                    .actor
                                    .avatar_url
                                }
                                alt=""
                              />

                            )
                            : (

                              <span>
                                {
                                  getInitial(
                                    notification
                                  )
                                }
                              </span>
                            )
                        }

                        <div
                          className={
                            `shobdo-notification-preview-type ${
                              notification.type ||
                              "system"
                            }`
                          }
                        >

                          {
                            getTypeIcon(
                              notification.type
                            )
                          }

                        </div>

                      </div>


                      <div className="shobdo-notification-preview-copy">

                        <p>
                          {
                            getMessage(
                              notification
                            )
                          }
                        </p>

                        <small>
                          {
                            formatTime(
                              notification.created_at
                            )
                          }
                        </small>

                      </div>


                      {
                        !notification.is_read && (

                          <span
                            className="shobdo-notification-preview-dot"
                            aria-label={
                              text.new
                            }
                          />
                        )
                      }

                    </button>
                  )
                )
              }

            </div>


            <button
              type="button"
              className="shobdo-notification-see-all"
              onClick={
                handleSeeAll
              }
            >

              {text.seeAll}

            </button>

          </div>
        )
      }

    </div>
  );
}


export default NotificationDropdown;