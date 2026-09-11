import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

import {
  useLanguage,
} from "../Language/LanguageContext";

import "./Notifications.css";


const PAGE_SIZE = 20;


// =========================================================
// PAGE TRANSLATIONS
// =========================================================

const TEXT = {

  en: {
    title: "Notifications",
    subtitle:
      "Stay updated with activity around your writings and profile.",

    all: "All",
    unread: "Unread",

    markAllRead:
      "Mark all as read",

    markingAll:
      "Marking...",

    refresh:
      "Refresh",

    loading:
      "Loading notifications...",

    loadError:
      "Unable to load notifications.",

    retry:
      "Try again",

    emptyTitle:
      "No notifications yet",

    emptyDescription:
      "Likes, comments and new followers will appear here.",

    unreadEmptyTitle:
      "You're all caught up",

    unreadEmptyDescription:
      "You have no unread notifications.",

    delete:
      "Delete",

    markRead:
      "Mark as read",

    loadMore:
      "Load more",

    loadingMore:
      "Loading...",

    new:
      "New",

    someone:
      "Someone",

    writing:
      "your writing",

    like:
      (name, title) =>
        `${name} liked your writing “${title}”`,

    comment:
      (name, title) =>
        `${name} commented on your writing “${title}”`,

    follow:
      (name) =>
        `${name} started following you`,

    reply:
      (name, title) =>
        `${name} replied to your comment on “${title}”`,

    mention:
      (name, title) =>
        `${name} mentioned you in “${title}”`,

    system:
      "You have a new SHOBDO notification.",

    justNow:
      "Just now",

    minuteAgo:
      "1 minute ago",

    minutesAgo:
      (value) => `${value} minutes ago`,

    hourAgo:
      "1 hour ago",

    hoursAgo:
      (value) => `${value} hours ago`,

    dayAgo:
      "1 day ago",

    daysAgo:
      (value) => `${value} days ago`,
  },


  bn: {
    title: "বিজ্ঞপ্তি",

    subtitle:
      "আপনার লেখা ও প্রোফাইলের সাম্প্রতিক কার্যকলাপ দেখুন।",

    all: "সব",

    unread: "অপঠিত",

    markAllRead:
      "সব পড়া হয়েছে হিসেবে চিহ্নিত করুন",

    markingAll:
      "চিহ্নিত হচ্ছে...",

    refresh:
      "রিফ্রেশ",

    loading:
      "বিজ্ঞপ্তি লোড হচ্ছে...",

    loadError:
      "বিজ্ঞপ্তি লোড করা যায়নি।",

    retry:
      "আবার চেষ্টা করুন",

    emptyTitle:
      "এখনও কোনো বিজ্ঞপ্তি নেই",

    emptyDescription:
      "লাইক, মন্তব্য এবং নতুন অনুসরণকারীর তথ্য এখানে দেখা যাবে।",

    unreadEmptyTitle:
      "সব বিজ্ঞপ্তি দেখা হয়েছে",

    unreadEmptyDescription:
      "আপনার কোনো অপঠিত বিজ্ঞপ্তি নেই।",

    delete:
      "মুছুন",

    markRead:
      "পড়া হয়েছে",

    loadMore:
      "আরও দেখুন",

    loadingMore:
      "লোড হচ্ছে...",

    new:
      "নতুন",

    someone:
      "কেউ",

    writing:
      "আপনার লেখা",

    like:
      (name, title) =>
        `${name} আপনার লেখা “${title}” পছন্দ করেছেন`,

    comment:
      (name, title) =>
        `${name} আপনার লেখা “${title}”-তে মন্তব্য করেছেন`,

    follow:
      (name) =>
        `${name} আপনাকে অনুসরণ করা শুরু করেছেন`,

    reply:
      (name, title) =>
        `${name} “${title}”-এ আপনার মন্তব্যের উত্তর দিয়েছেন`,

    mention:
      (name, title) =>
        `${name} “${title}”-এ আপনাকে উল্লেখ করেছেন`,

    system:
      "SHOBDO-তে আপনার একটি নতুন বিজ্ঞপ্তি আছে।",

    justNow:
      "এইমাত্র",

    minuteAgo:
      "১ মিনিট আগে",

    minutesAgo:
      (value) => `${value} মিনিট আগে`,

    hourAgo:
      "১ ঘণ্টা আগে",

    hoursAgo:
      (value) => `${value} ঘণ্টা আগে`,

    dayAgo:
      "১ দিন আগে",

    daysAgo:
      (value) => `${value} দিন আগে`,
  },


  hi: {
    title: "सूचनाएँ",

    subtitle:
      "अपनी रचनाओं और प्रोफ़ाइल से जुड़ी गतिविधियाँ देखें।",

    all: "सभी",

    unread: "अपठित",

    markAllRead:
      "सभी को पढ़ा हुआ चिह्नित करें",

    markingAll:
      "चिह्नित किया जा रहा है...",

    refresh:
      "रीफ़्रेश",

    loading:
      "सूचनाएँ लोड हो रही हैं...",

    loadError:
      "सूचनाएँ लोड नहीं हो सकीं।",

    retry:
      "फिर से प्रयास करें",

    emptyTitle:
      "अभी कोई सूचना नहीं",

    emptyDescription:
      "लाइक, टिप्पणियाँ और नए फ़ॉलोअर यहाँ दिखाई देंगे।",

    unreadEmptyTitle:
      "आपने सब देख लिया",

    unreadEmptyDescription:
      "आपके पास कोई अपठित सूचना नहीं है।",

    delete:
      "हटाएँ",

    markRead:
      "पढ़ा हुआ चिह्नित करें",

    loadMore:
      "और दिखाएँ",

    loadingMore:
      "लोड हो रहा है...",

    new:
      "नई",

    someone:
      "किसी उपयोगकर्ता ने",

    writing:
      "आपकी रचना",

    like:
      (name, title) =>
        `${name} ने आपकी रचना “${title}” को पसंद किया`,

    comment:
      (name, title) =>
        `${name} ने आपकी रचना “${title}” पर टिप्पणी की`,

    follow:
      (name) =>
        `${name} ने आपको फ़ॉलो करना शुरू किया`,

    reply:
      (name, title) =>
        `${name} ने “${title}” पर आपकी टिप्पणी का उत्तर दिया`,

    mention:
      (name, title) =>
        `${name} ने “${title}” में आपका उल्लेख किया`,

    system:
      "SHOBDO पर आपके लिए एक नई सूचना है।",

    justNow:
      "अभी",

    minuteAgo:
      "1 मिनट पहले",

    minutesAgo:
      (value) => `${value} मिनट पहले`,

    hourAgo:
      "1 घंटे पहले",

    hoursAgo:
      (value) => `${value} घंटे पहले`,

    dayAgo:
      "1 दिन पहले",

    daysAgo:
      (value) => `${value} दिन पहले`,
  },

};


// =========================================================
// COMPONENT
// =========================================================

function Notifications() {

  const navigate =
    useNavigate();

  const {
    language,
  } = useLanguage();


  const ui =
    TEXT[language] ||
    TEXT.en;


  // =====================================================
  // STATE
  // =====================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    hasNext,
    setHasNext,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // NAVBAR REFRESH
  // =====================================================

  function notifyNavbar() {

    window.dispatchEvent(
      new Event(
        "shobdo:notifications-changed"
      )
    );

  }


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications =
    useCallback(
      async ({
        targetPage = 1,
        append = false,
      } = {}) => {

        if (append) {

          setLoadingMore(true);

        } else {

          setLoading(true);

        }


        setError("");


        try {

          const data =
            await getNotifications({
              page: targetPage,
              perPage: PAGE_SIZE,
              unreadOnly:
                filter === "unread",
            });


          const items =
            Array.isArray(
              data?.notifications
            )
              ? data.notifications
              : [];


          setNotifications(
            (current) =>
              append
                ? [
                    ...current,
                    ...items,
                  ]
                : items
          );


          setUnreadCount(
            Number(
              data?.unread_count
            ) || 0
          );


          setPage(
            Number(
              data?.pagination?.page
            ) || targetPage
          );


          setHasNext(
            Boolean(
              data?.pagination?.has_next
            )
          );

        } catch (requestError) {

          console.error(
            "LOAD NOTIFICATIONS ERROR:",
            requestError
          );


          if (
            requestError?.status === 401 ||
            requestError?.status === 422
          ) {

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;

          }


          setError(
            requestError?.message ||
            ui.loadError
          );

        } finally {

          setLoading(false);

          setLoadingMore(false);

        }

      },
      [
        filter,
        navigate,
        ui.loadError,
      ]
    );


  // =====================================================
  // INITIAL LOAD / FILTER CHANGE
  // =====================================================

  useEffect(() => {

    loadNotifications({
      targetPage: 1,
      append: false,
    });

  }, [
    loadNotifications,
  ]);


  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(
    value
  ) {

    if (!value) {
      return "";
    }


    const created =
      new Date(value);

    const now =
      new Date();


    const difference =
      Math.max(
        0,
        now.getTime() -
        created.getTime()
      );


    const minutes =
      Math.floor(
        difference / 60000
      );


    if (minutes < 1) {
      return ui.justNow;
    }


    if (minutes === 1) {
      return ui.minuteAgo;
    }


    if (minutes < 60) {

      return ui.minutesAgo(
        minutes
      );

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (hours === 1) {
      return ui.hourAgo;
    }


    if (hours < 24) {

      return ui.hoursAgo(
        hours
      );

    }


    const days =
      Math.floor(
        hours / 24
      );


    if (days === 1) {
      return ui.dayAgo;
    }


    if (days < 7) {

      return ui.daysAgo(
        days
      );

    }


    try {

      return created.toLocaleDateString(
        language === "bn"
          ? "bn-BD"
          : language === "hi"
            ? "hi-IN"
            : "en-IN",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

    } catch {

      return created.toLocaleDateString();

    }

  }


  // =====================================================
  // MESSAGE
  // =====================================================

  function getNotificationMessage(
    notification
  ) {

    const actorName =
      notification?.actor?.name ||
      ui.someone;


    const writingTitle =
      notification?.writing?.title ||
      ui.writing;


    switch (
      notification?.type
    ) {

      case "like":

        return ui.like(
          actorName,
          writingTitle
        );


      case "comment":

        return ui.comment(
          actorName,
          writingTitle
        );


      case "follow":

        return ui.follow(
          actorName
        );


      case "reply":

        return ui.reply(
          actorName,
          writingTitle
        );


      case "mention":

        return ui.mention(
          actorName,
          writingTitle
        );


      default:

        return ui.system;

    }

  }


  // =====================================================
  // ICON
  // =====================================================

  function getNotificationIcon(
    type
  ) {

    switch (type) {

      case "like":

        return (
          <Heart size={20} />
        );


      case "comment":

      case "reply":

        return (
          <MessageCircle size={20} />
        );


      case "follow":

        return (
          <UserPlus size={20} />
        );


      default:

        return (
          <Bell size={20} />
        );

    }

  }


  // =====================================================
  // OPEN NOTIFICATION
  // =====================================================

  async function handleOpen(
    notification
  ) {

    if (!notification) {
      return;
    }


    if (!notification.is_read) {

      try {

        await markNotificationRead(
          notification.id
        );


        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
            )
        );


        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );


        notifyNavbar();

      } catch (requestError) {

        console.error(
          "MARK NOTIFICATION READ ERROR:",
          requestError
        );

      }

    }


    if (
      notification.type ===
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


  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  async function handleMarkRead(
    event,
    notification
  ) {

    event.stopPropagation();


    if (
      !notification ||
      notification.is_read
    ) {
      return;
    }


    try {

      await markNotificationRead(
        notification.id
      );


      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
          )
      );


      setUnreadCount(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );


      if (
        filter === "unread"
      ) {

        setNotifications(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                notification.id
            )
        );

      }


      notifyNavbar();

    } catch (requestError) {

      console.error(
        "MARK READ ERROR:",
        requestError
      );

    }

  }


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  async function handleMarkAllRead() {

    if (
      unreadCount <= 0 ||
      markingAll
    ) {
      return;
    }


    setMarkingAll(true);


    try {

      await markAllNotificationsRead();


      setUnreadCount(0);


      if (
        filter === "unread"
      ) {

        setNotifications([]);

      } else {

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            )
        );

      }


      notifyNavbar();

    } catch (requestError) {

      console.error(
        "MARK ALL READ ERROR:",
        requestError
      );

    } finally {

      setMarkingAll(false);

    }

  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    event,
    notification
  ) {

    event.stopPropagation();


    if (!notification) {
      return;
    }


    try {

      await deleteNotification(
        notification.id
      );


      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              notification.id
          )
      );


      if (
        !notification.is_read
      ) {

        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );

      }


      notifyNavbar();

    } catch (requestError) {

      console.error(
        "DELETE NOTIFICATION ERROR:",
        requestError
      );

    }

  }


  // =====================================================
  // LOAD MORE
  // =====================================================

  async function handleLoadMore() {

    if (
      loadingMore ||
      !hasNext
    ) {
      return;
    }


    await loadNotifications({
      targetPage:
        page + 1,
      append: true,
    });

  }


  // =====================================================
  // EMPTY CONTENT
  // =====================================================

  const emptyContent =
    useMemo(
      () => {

        if (
          filter === "unread"
        ) {

          return {
            title:
              ui.unreadEmptyTitle,

            description:
              ui.unreadEmptyDescription,
          };

        }


        return {
          title:
            ui.emptyTitle,

          description:
            ui.emptyDescription,
        };

      },
      [
        filter,
        ui,
      ]
    );


  // =====================================================
  // UI
  // =====================================================

  return (

    <main className="notifications-page">

      <div className="notifications-shell">


        {/* ===============================================
            HEADER
        ================================================ */}

        <section className="notifications-header">

          <div className="notifications-heading">

            <div className="notifications-heading-icon">

              <Bell size={23} />

            </div>


            <div>

              <h1>
                {ui.title}
              </h1>

              <p>
                {ui.subtitle}
              </p>

            </div>

          </div>


          <div className="notifications-header-actions">

            <button
              type="button"
              className="notifications-refresh-button"
              onClick={() =>
                loadNotifications({
                  targetPage: 1,
                  append: false,
                })
              }
              disabled={
                loading
              }
            >

              <RefreshCw
                size={16}
                className={
                  loading
                    ? "spin"
                    : ""
                }
              />

              <span>
                {ui.refresh}
              </span>

            </button>


            <button
              type="button"
              className="notifications-read-all-button"
              onClick={
                handleMarkAllRead
              }
              disabled={
                unreadCount <= 0 ||
                markingAll
              }
            >

              <CheckCheck size={17} />

              <span>

                {
                  markingAll
                    ? ui.markingAll
                    : ui.markAllRead
                }

              </span>

            </button>

          </div>

        </section>


        {/* ===============================================
            FILTERS
        ================================================ */}

        <section className="notifications-toolbar">

          <div className="notifications-tabs">

            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >

              {ui.all}

            </button>


            <button
              type="button"
              className={
                filter === "unread"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("unread")
              }
            >

              {ui.unread}

              {
                unreadCount > 0 && (

                  <span className="notifications-tab-count">

                    {
                      unreadCount > 99
                        ? "99+"
                        : unreadCount
                    }

                  </span>

                )
              }

            </button>

          </div>

        </section>


        {/* ===============================================
            CONTENT
        ================================================ */}

        <section className="notifications-list-card">


          {/* LOADING */}

          {
            loading && (

              <div className="notifications-state">

                <div className="notifications-spinner" />

                <p>
                  {ui.loading}
                </p>

              </div>

            )
          }


          {/* ERROR */}

          {
            !loading &&
            error && (

              <div className="notifications-state">

                <Bell size={30} />

                <h2>
                  {ui.loadError}
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadNotifications({
                      targetPage: 1,
                      append: false,
                    })
                  }
                >

                  {ui.retry}

                </button>

              </div>

            )
          }


          {/* EMPTY */}

          {
            !loading &&
            !error &&
            notifications.length === 0 && (

              <div className="notifications-state notifications-empty">

                <div className="notifications-empty-icon">

                  <Bell size={30} />

                </div>

                <h2>
                  {emptyContent.title}
                </h2>

                <p>
                  {emptyContent.description}
                </p>

              </div>

            )
          }


          {/* NOTIFICATIONS */}

          {
            !loading &&
            !error &&
            notifications.length > 0 && (

              <div className="notifications-list">

                {
                  notifications.map(
                    (notification) => (

                      <article
                        key={
                          notification.id
                        }
                        className={
                          notification.is_read
                            ? "notification-item"
                            : "notification-item unread"
                        }
                        onClick={() =>
                          handleOpen(
                            notification
                          )
                        }
                      >

                        <div className={
                          `notification-type-icon ${notification.type || "system"}`
                        }>

                          {
                            getNotificationIcon(
                              notification.type
                            )
                          }

                        </div>


                        <div className="notification-content">

                          <div className="notification-message">

                            {
                              getNotificationMessage(
                                notification
                              )
                            }

                          </div>


                          <div className="notification-meta">

                            <span>

                              {
                                formatTime(
                                  notification.created_at
                                )
                              }

                            </span>


                            {
                              !notification.is_read && (

                                <span className="notification-new-label">

                                  {ui.new}

                                </span>

                              )
                            }

                          </div>

                        </div>


                        <div className="notification-actions">

                          {
                            !notification.is_read && (

                              <button
                                type="button"
                                className="notification-action-button"
                                title={
                                  ui.markRead
                                }
                                aria-label={
                                  ui.markRead
                                }
                                onClick={
                                  (event) =>
                                    handleMarkRead(
                                      event,
                                      notification
                                    )
                                }
                              >

                                <Check size={16} />

                              </button>

                            )
                          }


                          <button
                            type="button"
                            className="notification-action-button danger"
                            title={
                              ui.delete
                            }
                            aria-label={
                              ui.delete
                            }
                            onClick={
                              (event) =>
                                handleDelete(
                                  event,
                                  notification
                                )
                            }
                          >

                            <Trash2 size={16} />

                          </button>

                        </div>

                      </article>

                    )
                  )
                }

              </div>

            )
          }


          {/* LOAD MORE */}

          {
            !loading &&
            !error &&
            notifications.length > 0 &&
            hasNext && (

              <div className="notifications-load-more">

                <button
                  type="button"
                  onClick={
                    handleLoadMore
                  }
                  disabled={
                    loadingMore
                  }
                >

                  {
                    loadingMore
                      ? ui.loadingMore
                      : ui.loadMore
                  }

                </button>

              </div>

            )
          }

        </section>

      </div>

    </main>

  );

}


export default Notifications;