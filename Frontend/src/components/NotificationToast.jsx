import {
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./NotificationToast.css";


function NotificationToast({
  notification,
  onClose,
}) {

  const navigate =
    useNavigate();


  if (!notification) {

    return null;

  }


  const actorName =
    notification?.actor?.name ||
    "Someone";


  const writingTitle =
    notification?.writing?.title ||
    "";


  function getContent() {

    switch (
      notification.type
    ) {

      case "like":

        return {
          icon:
            <Heart size={20} />,

          message:
            `${actorName} liked your writing`,
        };


      case "comment":

        return {
          icon:
            <MessageCircle size={20} />,

          message:
            `${actorName} commented on your writing`,
        };


      case "follow":

        return {
          icon:
            <UserPlus size={20} />,

          message:
            `${actorName} started following you`,
        };


      default:

        return {
          icon:
            <Bell size={20} />,

          message:
            "You have a new notification",
        };

    }

  }


  const content =
    getContent();


  function handleOpen() {

    onClose?.();


    if (
      notification.type === "follow" &&
      notification.actor_id
    ) {

      navigate(
        `/users/${notification.actor_id}`
      );

      return;

    }


    if (
      notification.writing_id
    ) {

      navigate(
        `/writings/${notification.writing_id}`
      );

      return;

    }


    navigate(
      "/notifications"
    );

  }


  return (

    <div
      className="shobdo-notification-toast"
      role="status"
    >

      <button
        type="button"
        className="shobdo-notification-toast-main"
        onClick={handleOpen}
      >

        <span className="shobdo-notification-toast-icon">

          {content.icon}

        </span>


        <span className="shobdo-notification-toast-content">

          <strong>

            {content.message}

          </strong>


          {writingTitle && (

            <span>

              {writingTitle}

            </span>

          )}

        </span>

      </button>


      <button
        type="button"
        className="shobdo-notification-toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >

        <X size={16} />

      </button>

    </div>

  );

}


export default NotificationToast;