import { Schema, model } from "mongoose";

const restaurantSettlementSchema = new Schema(
  {
    // Required References
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    weekEnding: {
      type: Date, // Sunday of the week being settled
      required: true,
    },

    // Financial Summary
    totalOrders: {
      type: Number,
      default: 0,
    },
    orderSubtotal: {
      type: Number,
      default: 0, // Sum of all order subtotals (food cost)
    },
    platformFee: {
      type: Number,
      default: 0, // Your commission (e.g., 20% of subtotal)
    },
    amountDue: {
      type: Number,
      required: true, // orderSubtotal - platformFee
    },

    // Payment Status
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED"],
      default: "PENDING",
    },
    paymentDate: Date, // When money was sent
    transactionId: String, // Bank/Payment gateway reference

    // Minimal Audit Trail
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Compound index for fast weekly lookups
restaurantSettlementSchema.index(
  {
    restaurantId: 1,
    weekEnding: 1,
  },
  { unique: true }
);

export default model("RestaurantSettlement", restaurantSettlementSchema);
