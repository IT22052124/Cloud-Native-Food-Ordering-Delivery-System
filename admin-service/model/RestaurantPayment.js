import mongoose from "mongoose";

const RestaurantPaymentSchema = new mongoose.Schema(
  {
    // Payment identification
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

    // Restaurant details
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },

    // Period details
    periodType: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },

    // Weekly period details
    weekNumber: Number,
    weekStartDate: Date,
    weekEndDate: Date,

    // Monthly period details
    month: String,
    year: Number,
    monthStartDate: Date,
    monthEndDate: Date,

    // Order and sales details
    orderIds: [
      {
        type: String,
      },
    ],
    ordersCount: {
      type: Number,
      required: true,
    },
    salesAmount: {
      type: Number,
      required: true,
    },

    // Commission and payment details
    commissionRate: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    netPayable: {
      type: Number,
      required: true,
    },

    // Payment status and timing
    paymentStatus: {
      type: String,
      enum: ["pending", "scheduled", "processing", "paid", "failed"],
      default: "pending",
    },
    scheduledDate: Date,
    paymentDate: Date,
    paidAt: Date,

    // Payment method and reference
    paymentMethod: {
      type: String,
      default: "Bank Transfer",
    },
    paymentReference: String,
    notes: String,

    // Tracking information
    createdBy: {
      type: String,
    },
    processedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate paymentId before saving
RestaurantPaymentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const prefix = this.periodType === "weekly" ? "WP" : "MP";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Generate sequential number for the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: today },
    });

    const sequence = (count + 1).toString().padStart(3, "0");
    this.paymentId = `${prefix}-${year}${month}${day}-${sequence}`;
  }
  next();
});

// Create indexes for faster queries
RestaurantPaymentSchema.index({
  restaurantId: 1,
  periodType: 1,
  weekNumber: 1,
});
RestaurantPaymentSchema.index({
  restaurantId: 1,
  periodType: 1,
  month: 1,
  year: 1,
});
RestaurantPaymentSchema.index({ paymentStatus: 1 });
RestaurantPaymentSchema.index({ scheduledDate: 1 });

const RestaurantPayment = mongoose.model(
  "RestaurantPayment",
  RestaurantPaymentSchema
);
export default RestaurantPayment;
