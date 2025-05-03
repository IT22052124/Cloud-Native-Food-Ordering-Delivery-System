// utils/notificationHelper.js
import axios from "axios";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5007";

export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      notificationData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
    throw error;
  }
};
