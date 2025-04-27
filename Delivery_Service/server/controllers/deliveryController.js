const axios = require('axios');
const { getDistanceMatrix, getRouteAndETA } = require('../utils/geoUtils.js');
const { Delivery } = require('../models/Delivery.js');
const  LiveDriver  = require('../models/LiveDriver.js');
// const { retryDeliveryAssignment } = require('./deliveryController'); // ⛔ Commented for now

let retryQueue = {}; // In-memory retry tracking
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 15000; // 15 seconds between retries

/**
 * @desc    Assign delivery to an order (called by restaurant service)
 * @route   POST /api/deliveries/assign
 * @access  Private/Restaurant
 */
const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;

    const orderResponse = await axios.get(
      `${global.gConfig.order_url}/api/orders/${orderId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const order = orderResponse.data.order;

    if (!order || order.type !== 'DELIVERY' || order.restaurantOrder.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({ success: false, message: 'Invalid delivery assignment request' });
    }

    // 2. Get active live drivers with location
    const liveDrivers = await LiveDriver.find({ isAvailable: true, location: { $exists: true } });

    if (liveDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No available drivers' });
    }

    const origins = `${order.restaurantOrder.restaurantLocation.lat},${order.restaurantOrder.restaurantLocation.lng}`;
    const destinations = liveDrivers.map(driver => `${driver.location.coordinates[1]},${driver.location.coordinates[0]}`);

    const matrix = await getDistanceMatrix(origins, destinations.join('|'));
    const driversWithDistance = liveDrivers.map((driver, i) => ({
      ...driver.toObject(),
      distance: matrix.rows[0].elements[i].distance.value,
    }));

    // 3. Filter drivers within 10km
    const nearbyDrivers = driversWithDistance.filter(d => d.distance <= 10000);
    if (nearbyDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No drivers within 10km radius' });
    }

    // 4. Pick closest driver
    const assignedDriver = nearbyDrivers.sort((a, b) => a.distance - b.distance)[0];

    // 5. Create Delivery
    const delivery = await Delivery.create({
      orderId: order.orderId,
      orderRef: order._id,
      restaurant: {
        id: order.restaurantOrder.restaurantId,
        name: order.restaurantOrder.restaurantName,
        location: {
          type: 'Point',
          coordinates: [
            order.restaurantOrder.restaurantLocation.lng,
            order.restaurantOrder.restaurantLocation.lat
          ]
        }
      },
      customer: {
        id: order.customerId,
        name: order.customerName,
        phone: order.customerPhone,
        deliveryAddress: {
          street: order.deliveryAddress?.street,
          city: order.deliveryAddress?.city,
          coordinates: {
            type: 'Point',
            coordinates: [
              order.deliveryAddress?.coordinates?.lng,
              order.deliveryAddress?.coordinates?.lat
            ]
          }
        }
      },
      driver: {
        id: assignedDriver.driverId,
        name: assignedDriver.name,
        phone: assignedDriver.phone,
        assignedAt: new Date()
      },
      status: 'DRIVER_ASSIGNED',
      deliveryFee: order.restaurantOrder.deliveryFee,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus
      },
      earningsAmount: order.paymentMethod === 'CASH'
        ? -order.restaurantOrder.deliveryFee
        : order.restaurantOrder.deliveryFee
    });

    // Remove driver from available pool
    await LiveDriver.deleteOne({ driverId: assignedDriver.driverId });

    // 7. Notify assigned driver via Socket.IO
    const io = req.app.get('io');
    io.to(`user_${assignedDriver.driverId}`).emit('deliveryAssignedDirect', {
      deliveryId: delivery._id,
      orderId: order.orderId,
      restaurant: delivery.restaurant,
      deliveryAddress: delivery.customer.deliveryAddress,
      deliveryFee: delivery.deliveryFee
    });

    // Notify restaurant + customer
    io.to(`user_${delivery.restaurant.id}`).emit('driverAssigned', {
      deliveryId: delivery._id,
      orderId: delivery.orderId,
      driver: delivery.driver.id
    });
    io.to(`user_${delivery.customer.id}`).emit('driverAssigned', {
      deliveryId: delivery._id,
      orderId: delivery.orderId,
      driver: delivery.driver
    });

    res.status(201).json({ success: true, delivery });

  } catch (err) {
    console.error('assignDelivery error:', err.message);
    res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
};

module.exports = { assignDelivery };


async function findNearestDrivers(location) {
  const response = await axios.get(`${global.gConfig.auth_url}/api/users?role=delivery&status=active`);
  const drivers = response.data.users;

  // Fallback to user model location filtering (as per your current approach)
  return drivers
    .filter(driver => driver.driverIsAvailable && driver.location?.coordinates)
    .map(driver => ({
      id: driver._id,
      name: driver.name,
    }))
    .slice(0, 3); // Limit or sort if needed
}

/**
 * Retry delivery assignment if declined or timed out
 */
const retryDeliveryAssignment = async (deliveryId, io, token) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery || delivery.status !== 'PENDING_ASSIGNMENT') return;

  const attempt = retryQueue[deliveryId]?.attempt || 0;
  if (attempt >= MAX_RETRIES) {
    delivery.status = 'FAILED';
    await delivery.save();
    io.to(`user_${delivery.restaurant.id}`).emit('deliveryAssignmentFailed', {
      orderId: delivery.orderId,
      reason: 'No drivers accepted after multiple attempts'
    });
    delete retryQueue[deliveryId];
    return;
  }

  const coords = delivery.restaurant.location.coordinates;
  const drivers = await findNearestDrivers({
    type: 'Point',
    coordinates: coords
  });

  if (drivers.length === 0) {
    retryQueue[deliveryId] = { attempt: attempt + 1 };
    return setTimeout(() => retryDeliveryAssignment(deliveryId, io, token), RETRY_DELAY_MS);
  }

  delivery.proposedDrivers = drivers.map(d => ({ driverId: d.id, name: d.name }));
  await delivery.save();

  drivers.forEach(driver => {
    io.to(`user_${driver.id}`).emit('deliveryAssignment', {
      deliveryId: delivery._id,
      orderId: delivery.orderId,
      restaurant: delivery.restaurant,
      deliveryAddress: delivery.customer.deliveryAddress,
      deliveryFee: delivery.deliveryFee,
      expiresAt: new Date(Date.now() + 60000)
    });
  });

  retryQueue[deliveryId] = { attempt: attempt + 1 };
  setTimeout(() => retryDeliveryAssignment(deliveryId, io, token), RETRY_DELAY_MS);
};

/**
 * @desc    Get single delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Private (Driver or Customer)
 */
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const isDriver = delivery.driver?.id === req.user.id && req.user.role === 'delivery';
    const isCustomer = delivery.customer?.id === req.user.id && req.user.role === 'customer';

    if (!isDriver && !isCustomer) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this delivery' });
    }

    res.status(200).json({ success: true, delivery });
  } catch (error) {
    console.error('Get delivery by ID error:', error);
    res.status(500).json({ success: false, message: 'Error fetching delivery', error: error.message });
  }
};

/**
 * @desc    Get deliveries by filters (date/status/driver) – non-admin scoped for integrations
 * @route   GET /api/deliveries/query
 * @access  Private (Internal service)
 */
const getDeliveriesByQuery = async (req, res) => {
  try {
    const { status, driverId, from, to } = req.query;
    const query = {};

    if (status) query.status = status;
    if (driverId) query['driver.id'] = driverId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    console.error('Query deliveries error:', error);
    res.status(500).json({ success: false, message: 'Query failed', error: error.message });
  }
};

/**
 * @desc    Update delivery status (for drivers)
 * @route   PATCH /api/deliveries/:id/status
 * @access  Private/Delivery
 */
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = [
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
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Verify the driver is assigned to this delivery
    if (!delivery.driver || delivery.driver.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }
    
    // Update status and notes
    delivery.status = status;
    if (notes) {
      delivery.notes = delivery.notes ? `${delivery.notes}\n${notes}` : notes;
    }
    
    await delivery.save();
    
    // Notify customer about status change
    if (delivery.customer) {
      const io = req.app.get('io');
      io.to(`user_${delivery.customer.id}`).emit('deliveryStatusUpdated', {
        deliveryId: delivery._id,
        status: delivery.status,
        updatedAt: new Date()
      });
    }

    // Sync 'DELIVERED' status to Order Service
    if (status === 'DELIVERED') {
      try {
        // Sync order
        await axios.patch(
          `${process.env.ORDER_SERVICE_URL}/api/orders/${delivery.orderId}/status`,
          { status: 'DELIVERED' },
          { headers: { Authorization: req.headers.authorization } }
        );
    
        // ✅ Restore availability (add to LiveDriver)
        if (delivery.driver?.id && delivery.driver?.currentLocation) {
          await LiveDriver.findOneAndUpdate(
            { driverId: delivery.driverId },
            {
              driverId: delivery.driver.id,
              name: delivery.driver.name,
              phone: delivery.driver.phone,
              coordinates: delivery.driver.currentLocation.coordinates,
              isAvailable: true
            },
            { upsert: true }
          );
        }
      } catch (e) {
        console.warn('Sync or toggle back failed:', e.message);
      }
    }
    
    res.status(200).json({
      success: true,
      delivery
    });
    
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: error.message
    });
  }
};

/**
 * @desc    Update driver location
 * @route   PATCH /api/deliveries/:id/location
 * @access  Private/Delivery
 */
const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // 1. Validate and update delivery
    const delivery = await Delivery.findOneAndUpdate(
      {
        _id: req.params.id,
        'driver.id': req.user.id,
        status: { $in: ['DRIVER_ASSIGNED', 'EN_ROUTE_TO_RESTAURANT', 'PICKED_UP', 'EN_ROUTE_TO_CUSTOMER'] }
      },
      {
        'driver.currentLocation': {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $push: {
          locationHistory: {
            coordinates: [lng, lat],
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found or invalid status' });
    }

    // 2. Send real-time update
    const io = req.app.get('io');
    io.to(`user_${delivery.customer.id}`).emit('driverLocationUpdated', {
      deliveryId: delivery._id,
      location: { lat, lng },
      updatedAt: new Date()
    });

    // ✅ Sync to Order Service
    try {
      await axios.patch(
        `${global.gConfig.order_url}/api/orders/${delivery.orderId}/delivery-location`,
        { lat, lng },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (syncError) {
      console.warn('Order delivery-location sync failed:', syncError.message);
    }


    res.json({ success: true });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location'
    });
  }
};

/**
 * @desc    Toggle driver availability
 * @route   PUT /api/users/me/availability/toggle
 * @access  Private/Delivery
 */
const toggleAvailability = async (req, res) => {
  try {
    // Call user service to toggle availability
    const response = await axios.patch(
      `${global.gConfig.auth_url}/api/users/${req.user.id}/availability`,
      {}, 
      { headers: { Authorization: req.headers.authorization } }
    );

    // Notify all restaurants about driver availability change
    const io = req.app.get('io');
    io.to('restaurants_room').emit('driverAvailabilityChanged', {
      driverId: req.user.id,
      isAvailable: response.data.user.driverIsAvailable
    });

    res.json({
      success: true,
      isAvailable: response.data.user.driverIsAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability'
    });
  }
};

/**
 * @desc    Driver accepts/rejects delivery
 * @route   POST /api/drivers/respond
 * @access  Private/Delivery
 */
const respondToAssignment = async (req, res) => {
  try {
    const { deliveryId, accept } = req.body;
    
    // 1. Validate delivery
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      'proposedDrivers.driverId': req.user.id,
      status: 'PENDING_ASSIGNMENT'
    });
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Invalid delivery assignment' });
    }

    const io = req.app.get('io');

    if (accept) {
      // 2. Assign driver
      delivery.status = 'DRIVER_ASSIGNED';
      delivery.driver = {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        assignedAt: new Date()
      };
      
      await delivery.save();

      // 3. Update order service
      await axios.patch(
        `${global.gConfig.order_url}/api/orders/${delivery.orderId}/status`,
        { status: 'OUT_FOR_DELIVERY' },
        { headers: { Authorization: req.headers.authorization } }
      );

      // 4. Notify restaurant and customer
      io.to(`user_${delivery.restaurant.id}`).emit('driverAssigned', {
        orderId: delivery.orderId,
        driver: delivery.driver.id
      });
      
      io.to(`user_${delivery.customer.id}`).emit('driverAssigned', {
        orderId: delivery.orderId,
        driver: delivery.driver.id
      });

      res.json({ success: true, message: 'Delivery accepted' });
    } else {
      // Rejection logic
      delivery.proposedDrivers = delivery.proposedDrivers.filter(
        d => d.driverId !== req.user.id
      );
      
      await delivery.save();
      
      // Notify restaurant if no more drivers
      if (delivery.proposedDrivers.length === 0) {
        io.to(`user_${delivery.restaurant.id}`).emit('deliveryAssignmentFailed', {
          orderId: delivery.orderId,
          reason: 'All drivers declined'
        });
      }

      res.json({ success: true, message: 'Delivery declined' });
    }
  } catch (error) {
    console.error('Driver response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing response'
    });
  }
};

/**
 * @desc    Track delivery: returns route, ETA, and driver location
 * @route   GET /api/deliveries/:id/track
 * @access  Private (Customer/Driver)
 */
const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const driverLocation = delivery.driver.currentLocation;
    const destination = delivery.customer?.deliveryAddress?.coordinates;

    if (!driverLocation || !destination) {
      return res.status(400).json({ success: false, message: 'Incomplete delivery location data' });
    }

    const origin = `${driverLocation.coordinates[1]},${driverLocation.coordinates[0]}`;
    const dest = `${destination.coordinates[1]},${destination.coordinates[0]}`;

    const { route, eta } = await getRouteAndETA(origin, dest);

    res.json({
      success: true,
      driverLocation,
      deliveryLocation: delivery.customer.deliveryAddress.coordinates,
      route,
      eta
    });
  } catch (error) {
    console.error('Track delivery error:', error);
    res.status(500).json({ success: false, message: 'Tracking error', error: error.message });
  }
};

/**
 * Calculate and store earnings after each delivery completion
 * Called when delivery status is set to 'DELIVERED'
 */
const recordDeliveryEarning = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery || delivery.status !== 'DELIVERED') return;

    const order = await Order.findOne({ orderId: delivery.orderId });
    if (!order) return;

    const isCash = order.paymentMethod === 'CASH';
    const isPaid = order.paymentStatus === 'PAID';

    let amount = 0;
    let signedAmount = 0;

    if (isCash && !isPaid) {
      const subtotal = order.restaurantOrder.subtotal || 0;
      const tax = order.restaurantOrder.tax || 0;
      amount = subtotal + tax;
      signedAmount = -amount;
    } else {
      amount = order.restaurantOrder.deliveryFee || 0;
      signedAmount = amount;
    }

    delivery.earningsAmount = signedAmount;
    delivery.earningsRecorded = true;
    await delivery.save();

  } catch (err) {
    console.error('Error recording delivery earning:', err.message);
  }
};

/**
 * Get current month's total earnings
 * @route GET /api/earnings/current
 * @access Private (Delivery)
 */
const getCurrentEarnings = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const deliveries = await Delivery.find({
      'driver.id': req.user.id,
      earningsRecorded: true,
      createdAt: { $gte: startOfMonth }
    });

    const total = deliveries.reduce((sum, d) => sum + (d.earningsAmount || 0), 0);

    res.status(200).json({ success: true, total });
  } catch (err) {
    console.error('Error fetching current earnings:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * (Stub) Mark cash payment as paid (to be completed later)
 * Called by delivery person upon payment received from customer
 */
const markCashPaymentAsPaid = async (req, res) => {
  // Placeholder - waiting for Payment Service API
  return res.status(501).json({
    success: false,
    message: 'Payment status update not yet implemented. Will integrate once available.'
  });
};

/**
 * @desc    Get all completed deliveries with earnings for driver
 * @route   GET /api/deliveries/driver
 * @access  Private/Delivery
 */
const getDriverDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      'driver.id': req.user.id,
      status: 'DELIVERED'
    }).select('deliveryFee earningsAmount payment customer');

    res.json({ success: true, deliveries });
  } catch (error) {
    console.error('Failed to fetch driver deliveries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all completed deliveries for a customer
 * @route   GET /api/deliveries/customer
 * @access  Private/Customer
 */
const getCustomerDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      'customer.id': req.user.id,
      status: 'DELIVERED'
    }).select('restaurant driver status deliveryTime');

    res.json({ success: true, deliveries });
  } catch (error) {
    console.error('Failed to fetch customer deliveries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  assignDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  toggleAvailability,
  respondToAssignment,
  trackDelivery,
  retryDeliveryAssignment,
  getDeliveryById,
  getDeliveriesByQuery,
  getCurrentEarnings,
  recordDeliveryEarning,
  markCashPaymentAsPaid,
  getDriverDeliveries,
  getCustomerDeliveries
};
