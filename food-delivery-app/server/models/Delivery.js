// models/Delivery.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'on-the-way', 'delivered'], default: 'pending' },
  route: { type: Object }, // Optional: directions from API
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  estimatedArrival: Date,
  history: [
    {
      lat: Number,
      lng: Number,
      timestamp: Date,
    },
  ],
}, { timestamps: true });

// Create a custom connection
const DELIVERY_MONGO_URI = process.env.DELIVERY_MONGO_DB_URI;
const deliveryConn = mongoose.createConnection(DELIVERY_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Export the connected model
module.exports = deliveryConn.model('Delivery', deliverySchema, 'delivery');
