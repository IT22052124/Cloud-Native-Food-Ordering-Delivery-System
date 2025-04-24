import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { notifications as notificationsData } from "../data/notifications";

function Notifications() {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeTab, setActiveTab] = useState("all");

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((notif) => !notif.read)
      : notifications.filter((notif) => notif.read);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "restaurant_registration":
        return "🏪";
      case "driver_registration":
        return "🚗";
      case "order_issue":
        return "⚠️";
      case "payment_issue":
        return "💵";
      case "system_alert":
        return "🔔";
      default:
        return "📣";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Notifications
        </h1>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium focus:outline-none"
        >
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("all")}
            className={`mr-8 py-4 px-1 text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`mr-8 py-4 px-1 text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === "unread"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveTab("read")}
            className={`mr-8 py-4 px-1 text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === "read"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Read
          </button>
        </nav>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div
            className={`rounded-lg shadow-md p-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } text-center`}
          >
            <p className="text-gray-500 dark:text-gray-400">
              No notifications to display
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg shadow-md p-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } ${!notification.read ? "border-l-4 border-blue-500" : ""}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(notification.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-4 flex">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mr-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.type === "restaurant_registration" && (
                      <button className="mr-4 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                        Approve Restaurant
                      </button>
                    )}
                    {notification.type === "driver_registration" && (
                      <button className="mr-4 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                        Approve Driver
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
