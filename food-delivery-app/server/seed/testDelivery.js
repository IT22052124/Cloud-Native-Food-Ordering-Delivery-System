// seed/testDelivery.js
require('dotenv').config();
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

const MONGO_URI = process.env.DELIVERY_MONGO_DB_URI;

const mockDelivery = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newDelivery = await Delivery.create({
      orderId: new mongoose.Types.ObjectId(), // fake order
      driverId: '67eb6c30aa2c236465f4b158',       // ⬅️ use delivery@example.com user._id
      status: 'pending',
      currentLocation: {
        lat: 12.9716,
        lng: 77.5946,
        updatedAt: new Date(),
      },
      estimatedArrival: new Date(Date.now() + 30 * 60000), // 30 mins later
      history: [],
    });

    console.log('✅ Mock delivery created:', newDelivery);
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding delivery:', err);
    process.exit(1);
  }
};

mockDelivery();