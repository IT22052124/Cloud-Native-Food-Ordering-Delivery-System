const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Delivery = require('../models/delivery.model'); // your local delivery model
require('dotenv').config();

const restaurantDbUri = process.env.RESTAURANT_MONGO_DB_URI;

// Trigger delivery creation
router.post('/trigger', async (req, res) => {
  try {
    const order = req.body;

    // Validate order data
    if (
      !order ||
      order.type !== 'DELIVERY' ||
      order.restaurantOrder?.status !== 'PREPARING'
    ) {
      return res.status(400).json({ message: 'Order not eligible for delivery' });
    }

    const { customer, restaurantId, deliveryAddress } = order;

    if (!restaurantId || !customer || !deliveryAddress) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    // Connect to restaurant DB
    const restaurantConnection = await mongoose.createConnection(restaurantDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Define a dynamic schema to query restaurants
    const Restaurant = restaurantConnection.model(
      'Restaurant',
      new mongoose.Schema(
        {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
          location: {
            lat: Number,
            lng: Number,
          },
        },
        { collection: 'restaurants' }
      )
    );

    const restaurant = await Restaurant.findById(restaurantId).lean();

    if (!restaurant) {
      await restaurantConnection.close();
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create new delivery document
    const newDelivery = new Delivery({
      orderId: order._id,
      customer,
      restaurantId,
      deliveryAddress,
      restaurantLocation: restaurant.location,
      status: 'READY_FOR_PICKUP',
      statusHistory: [
        {
          status: 'READY_FOR_PICKUP',
          timestamp: new Date(),
          updatedBy: 'system',
        },
      ],
    });

    await newDelivery.save();
    await restaurantConnection.close();

    res.status(201).json({ message: 'Delivery created', delivery: newDelivery });
  } catch (error) {
    console.error('[DELIVERY_TRIGGER_ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
