// notification-service/src/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "RESTAURANT_REGISTRATION", // System notification about new restaurant
        "DRIVER_REGISTRATION", // System notification about new driver
        "ORDER_ASSIGNED", // To driver
        "ORDER_READY", // To driver
        "ORDER_DELAYED", // To customer
        "ORDER_COMPLETED", // To restaurant and customer
        "NEW_REVIEW", // To restaurant
        "ACCOUNT_APPROVED", // To restaurant or driver
        "ACCOUNT_SUSPENDED", // To restaurant or driver
        "SETTLEMENT_PROCESSED", // To restaurant when payment is successful
        "SETTLEMENT_FAILED", // To restaurant when payment fails
      ],
    },

    // Who should receive this notification
    recipientType: {
      type: String,
      enum: ["system", "restaurant", "driver", "customer"],
      required: true,
    },

    // ID of the recipient (if specific)
    recipientId: {
      type: String,
      required: function () {
        return this.recipientType !== "system";
      },
    },

    // Related entity details
    relatedEntity: {
      id: { type: String, required: true },
      type: {
        type: String,
        enum: ["restaurant", "driver", "order", "review", "settlement"],
        required: true,
      },
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Additional data for the notification
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },

    expiresAt: {
      type: Date,
      index: { expires: "30d" }, // Keep notifications for 30 days
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
