import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Required References
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "LKR",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CARD", "CASH_ON_DELIVERY", "WALLET"], // Standardized uppercase
      required: true,
    },

    // Payment Status
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], // Standardized uppercase
      default: "PENDING",
    },

    // Payment Processor Details (for card payments)
    paymentProcessor: {
      type: String,
      enum: ["STRIPE", "PAYPAL", null],
      default: null,
    },
    paymentIntentId: String, // For Stripe
    transactionId: String, // Generic transaction ID
    receiptUrl: String,

    // Card Details (if applicable)
    cardDetails: {
      brand: String, // visa, mastercard
      last4: String,
      country: String,
      funding: String, // credit/debit
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: Date,
    failedAt: Date,
    refundedAt: Date,

    // Metadata
    metadata: mongoose.Schema.Types.Mixed, // For additional data
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for faster queries
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ paymentIntentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: 1 });

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
