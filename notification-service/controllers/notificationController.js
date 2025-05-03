// controllers/notificationController.js
import Notification from "../models/Notification.js";

export const createNotification = async (req, res) => {
  try {
    const {
      type,
      recipientType,
      recipientId,
      relatedEntity,
      title,
      message,
      metadata,
      status = "unread",
      expiresAt,
    } = req.body;

    // Validate required fields
    if (!type || !recipientType || !relatedEntity || !title || !message) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields (type, recipientType, relatedEntity, title, message)",
      });
    }

    // Validate recipientId if recipientType is not system
    if (recipientType !== "system" && !recipientId) {
      return res.status(400).json({
        success: false,
        error: "recipientId is required when recipientType is not system",
      });
    }

    // Create the notification
    const notification = new Notification({
      type,
      recipientType,
      recipientId,
      relatedEntity,
      title,
      message,
      metadata,
      status,
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    });

    const savedNotification = await notification.save();

    res.status(201).json({
      success: true,
      notification: savedNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create notification",
      details: error.message,
    });
  }
};

// Get all notifications for admin
export const getNotifications = async (req, res) => {
  try {
    const { type, recipientType, status } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (recipientType) query.recipientType = recipientType;
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "read";
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.query;

    const query = { status: "unread" };
    if (recipientType) query.recipientType = recipientType;
    if (recipientId) query.recipientId = recipientId;

    const result = await Notification.updateMany(query, {
      $set: { status: "read" },
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: result,
    });
  } catch (err) {
    console.error("❌ Error marking all notifications as read:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
