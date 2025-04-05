import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// Schema for tracking status changes
const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

// Schema for restaurant-specific part of an order
const restaurantOrderSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: [
      "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ],
    default: "PLACED",
  },
  statusHistory: [statusHistorySchema],
  estimatedReadyTime: {
    type: Date,
  },
  actualReadyTime: {
    type: Date,
  },
  assignedDriver: {
    driverId: Schema.Types.ObjectId,
    name: String,
    phone: String,
    vehiclePlate: String,
  },
  restaurantNotified: {
    type: Boolean,
    default: false,
  },
  notificationHistory: [
    {
      type: {
        type: String,
        enum: ["ORDER_PLACED", "STATUS_UPDATE", "DRIVER_ASSIGNED", "REMINDER"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      success: Boolean,
      details: String,
    },
  ],
  specialInstructions: {
    type: String,
    default: "",
  },
});

// Main order schema
const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["DELIVERY", "PICKUP"],
      required: true,
    },
    restaurantOrders: [restaurantOrderSchema],
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["CASH", "CARD", "WALLET"],
      default: "CASH",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "PAID", "FAILED", "REFUND_INITIATED", "REFUNDED"],
      default: "PENDING",
    },
    paymentDetails: {
      transactionId: String,
      paymentProcessor: String,
      cardLastFour: String,
      receiptUrl: String,
    },
    customerNotified: {
      type: Boolean,
      default: false,
    },
    customerNotificationHistory: [
      {
        type: {
          type: String,
          enum: [
            "ORDER_CONFIRMED",
            "STATUS_UPDATE",
            "DELIVERY_REMINDER",
            "DELIVERED",
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        success: Boolean,
        details: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Count total orders today to generate sequential number
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: today },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    this.orderId = `ORD-${year}${month}${day}-${sequence}`;
  }
  next();
});

orderSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("restaurantOrders")) {
    this.totalAmount = this.restaurantOrders.reduce((total, resto) => {
      return total + resto.subtotal + resto.tax + resto.deliveryFee;
    }, 0);
  }
  next();
});

orderSchema.virtual("overallStatus").get(function () {
  const statuses = new Set(this.restaurantOrders.map((ro) => ro.status));

  if (statuses.size === 1) {
    return this.restaurantOrders[0].status;
  }

  if (statuses.has("CANCELLED")) {
    return "PARTIALLY_CANCELLED";
  }

  const nonCompleteStatuses = this.restaurantOrders.filter(
    (ro) => ro.status !== "DELIVERED" && ro.status !== "CANCELLED"
  );

  if (nonCompleteStatuses.length === 0) {
    return "COMPLETED";
  }

  const statusOrder = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const activeStatuses = this.restaurantOrders
    .filter((ro) => ro.status !== "CANCELLED")
    .map((ro) => ro.status);

  const lowestStatusIndex = activeStatuses.reduce((lowest, status) => {
    const index = statusOrder.indexOf(status);
    return index < lowest ? index : lowest;
  }, statusOrder.length - 1);

  return statusOrder[lowestStatusIndex];
});

orderSchema.virtual("estimatedDeliveryTime").get(function () {
  if (this.type !== "DELIVERY") return null;

  const readyTimes = this.restaurantOrders
    .filter((ro) => ro.estimatedReadyTime)
    .map((ro) => ro.estimatedReadyTime);

  if (readyTimes.length === 0) return null;

  const latestReadyTime = new Date(Math.max(...readyTimes));

  const deliveryTime = new Date(latestReadyTime);
  deliveryTime.setMinutes(deliveryTime.getMinutes() + 20);

  return deliveryTime;
});

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ "restaurantOrders.restaurantId": 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ createdAt: 1 });

const Order = model("Order", orderSchema);

export default Order;
