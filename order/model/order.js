const { Schema, Types, model } = require("mongoose");

const OrderItemSchema = new Schema(
  {
    itemId: {
      type: Types.ObjectId,
      required: true,
    },
    restaurantId: {
      type: Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    customerId: {
      type: Types.ObjectId,
      required: true,
    },
    orderItems: [OrderItemSchema],
    restaurantIds: [{ type: Types.ObjectId, required: true }],
    type: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
      updatedAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ["PLACED", "PREPARING", "PICKUP_READY", "COMPLETE", "CANCEL"],
      default: "PLACED",
    },
    trackingStatus: {
      type: String,
      enum: [
        "PENDING_ASSIGNMENT",
        "EN_ROUTE_TO_PICKUP",
        "WAITING_AT_RESTAURANT",
        "EN_ROUTE_TO_DELIVERY",
        "DELIVERED",
      ],
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);
export default Order;
