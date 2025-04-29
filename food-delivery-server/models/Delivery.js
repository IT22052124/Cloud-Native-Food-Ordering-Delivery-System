const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "PENDING_ASSIGNMENT",
      "DRIVER_ASSIGNED",
      "EN_ROUTE_TO_RESTAURANT",
      "ARRIVED_AT_RESTAURANT",
      "PICKED_UP",
      "EN_ROUTE_TO_CUSTOMER",
      "ARRIVED_AT_CUSTOMER",
      "DELIVERED",
      "CANCELLED",
      "FAILED"
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const paymentSchema = new Schema({
  method: {
    type: String,
    enum: ["CASH", "CARD", "COD"],
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },
  amount: Number,
  processedAt: Date,
  details: {
    transactionId: String,
    receiptUrl: String
  }
});

const DeliverySchema = new Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  orderRef: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  restaurant: {
    id: String,
    name: String,
    location: locationSchema
  },
  customer: {
    id: String,
    name: String,
    phone: String,
    deliveryAddress: {
      street: String,
      city: String,
      coordinates: locationSchema
    }
  },
  driver: {
    id: String,
    isVerified: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
      required: false,
    },
    name: String,
    phone: String,
    vehicleDetails: String,
    currentLocation: locationSchema,
    assignedAt: Date
  },
  status: {
    type: String,
    required: true,
    enum: [
      "PENDING_ASSIGNMENT",
      "DRIVER_ASSIGNED",
      "EN_ROUTE_TO_RESTAURANT",
      "ARRIVED_AT_RESTAURANT",
      "PICKED_UP",
      "EN_ROUTE_TO_CUSTOMER",
      "ARRIVED_AT_CUSTOMER",
      "DELIVERED",
      "CANCELLED",
      "FAILED"
    ],
    default: "PENDING_ASSIGNMENT"
  },
  statusHistory: [statusHistorySchema],
  pickupTime: Date,
  deliveryTime: Date,
  estimatedDeliveryTime: Date,
  deliveryFee: {
    type: Number,
    required: true
  },
  payment: paymentSchema,
  earningsRecorded: {
    type: Boolean,
    default: false
  },
  earningsAmount: Number, // Positive for card/wallet, negative for cash until paid
  notes: String
}, {
  timestamps: true
});

// Indexes for faster queries
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ 'driver.id': 1 });
DeliverySchema.index({ 'customer.id': 1 });
DeliverySchema.index({ createdAt: 1 });
DeliverySchema.index({ 'restaurant.location': '2dsphere' });

// Pre-save hook to manage status history
DeliverySchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.status,
      notes: `Status changed to ${this.status}`
    });

    if (this.status === 'PICKED_UP') {
      this.pickupTime = new Date();
    } else if (this.status === 'DELIVERED') {
      this.deliveryTime = new Date();

      if (this.payment.method === 'CASH') {
        this.payment.status = 'PAID';
        this.payment.processedAt = new Date();
        this.earningsAmount = Math.abs(this.earningsAmount); // Convert to positive
      }
    }
  }
  next();
});

const Delivery = model('Delivery', DeliverySchema);

// 📦 Delivery Earnings Monthly Report Schema
const earningsRecordSchema = new Schema({
  driverId: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveries: [{ type: Schema.Types.ObjectId, ref: 'Delivery' }],
}, { timestamps: true });

const DeliveryEarningsReport = model('DeliveryEarningsReport', earningsRecordSchema);

module.exports = {
  Delivery,
  DeliveryEarningsReport,
};
