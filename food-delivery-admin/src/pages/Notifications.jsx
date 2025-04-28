import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../utils/api";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      console.log("Data from API:", data); // Log the data directly
      setNotifications(data);
    } catch (error) {
      console.error("Notification fetch failed:", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((notif) => notif.status === "unread")
      : notifications.filter((notif) => notif.status === "read");

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
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, status: "read" } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notif) => ({ ...notif, status: "read" }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Navigate to restaurant details
  const navigateToRestaurantDetails = (restaurantId) => {
    navigate(`/restaurants?view=${restaurantId}`);
  };

  // Navigate to driver details
  const navigateToDriverDetails = (driverId) => {
    navigate(`/drivers?view=${driverId}`);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "RESTAURANT_REGISTRATION":
        return "🏪";
      case "DRIVER_REGISTRATION":
        return "🚗";
      case "ORDER_ASSIGNED":
        return "📋";
      case "ORDER_READY":
        return "✅";
      case "ORDER_DELAYED":
        return "⏱️";
      case "ORDER_COMPLETED":
        return "🎉";
      case "NEW_REVIEW":
        return "⭐";
      case "ACCOUNT_APPROVED":
        return "✅";
      case "ACCOUNT_SUSPENDED":
        return "🚫";
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
          onClick={handleMarkAllAsRead}
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
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
              key={notification._id}
              className={`rounded-lg shadow-md p-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } ${
                notification.status === "unread"
                  ? "border-l-4 border-blue-500"
                  : ""
              }`}
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
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-4 flex">
                    {notification.status === "unread" && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="mr-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}

                    {notification.type === "RESTAURANT_REGISTRATION" && (
                      <button
                        className="mr-4 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        onClick={() =>
                          navigateToRestaurantDetails(
                            notification.relatedEntity.id
                          )
                        }
                      >
                        View Restaurant
                      </button>
                    )}

                    {notification.type === "DRIVER_REGISTRATION" && (
                      <button
                        className="mr-4 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        onClick={() =>
                          navigateToDriverDetails(notification.relatedEntity.id)
                        }
                      >
                        View Driver
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
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
