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
  specialInstructions: {
    type: String,
    default: "",
  },
});

// Schema for tracking status changes
const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "PLACED",
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
  notes: {
    type: String,
    default: "",
  },
});

// Schema for delivery person details
const deliveryPersonSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  vehicleDetails: {
    type: String,
  },
  vehicleNumber: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  profileImage: {
    type: String,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
});

// Schema for restaurant order details
const restaurantOrderSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  restaurantLocation: {
    lat: Number,
    lng: Number,
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
    restaurantOrder: restaurantOrderSchema,
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
    deliveryPerson: deliveryPersonSchema,
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["CARD", "COD"],
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
  if (this.isNew || this.isModified("restaurantOrder")) {
    const ro = this.restaurantOrder;
    this.totalAmount = ro.subtotal + ro.tax + ro.deliveryFee;
  }
  next();
});

orderSchema.virtual("status").get(function () {
  return this.restaurantOrder.status;
});

// orderSchema.virtual("estimatedDeliveryTime").get(function () {
//   if (this.type !== "DELIVERY") return null;

//   // If we have an explicitly set delivery time, use that
//   if (this.estimatedDeliveryTime) return this.estimatedDeliveryTime;

//   // Otherwise calculate it based on restaurant ready time
//   if (!this.restaurantOrder.estimatedReadyTime) return null;

//   const deliveryTime = new Date(this.restaurantOrder.estimatedReadyTime);
//   deliveryTime.setMinutes(deliveryTime.getMinutes() + 20);

//   return deliveryTime;
// });

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ "restaurantOrder.restaurantId": 1, createdAt: -1 });
// orderSchema.index({ orderId: 1 });
orderSchema.index({ createdAt: 1 });

const Order = model("Order", orderSchema);

export default Order;
