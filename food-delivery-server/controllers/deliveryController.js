const axios = require('axios');
const mongoose = require('mongoose');
const {calculateDistance, getDistanceMatrix, getRoutePolyline } = require('../utils/geoUtils.js');
const { Delivery, DeliveryEarningsReport } = require('../models/Delivery.js');
const  LiveDriver  = require('../models/LiveDriver.js');
// const { retryDeliveryAssignment } = require('./deliveryController'); // ⛔ Commented for now

let retryQueue = {}; // In-memory retry tracking
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 15000; // 15 seconds between retries

/**
 * @desc    Restaurent calls this for an order
 * @route   POST /api/deliveries/assign
 * @access  Private (Driver or Restaurent Admin)
 */
const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;

    const orderResponse = await axios.get(
      `${global.gConfig.order_url}/api/orders/${orderId}`,
      { 
        headers: { Authorization: req.headers.authorization },
        validateStatus: () => true
      }
    );

    const order = orderResponse.data.order;
    if (!order || order.type !== 'DELIVERY' || order.restaurantOrder.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({ success: false, message: 'Invalid delivery assignment request' });
    }

    const liveDrivers = await LiveDriver.find({ isAvailable: true, coordinates: { $exists: true } });

    if (liveDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No available drivers' });
    }

    const restaurantLat = order.restaurantOrder.restaurantLocation.lat;
    const restaurantLng = order.restaurantOrder.restaurantLocation.lng;

    // 3. Calculate distances from restaurant to all drivers
    const driversWithDistance = await Promise.all(liveDrivers.map(async (driver) => {
      const [driverLng, driverLat] = driver.coordinates;
      const origin = `${driverLat},${driverLng}`;
      const destination = `${restaurantLat},${restaurantLng}`;
    
      try {
        const { distanceMeters } = await getDistanceMatrix(origin, destination);
        return { ...driver.toObject(), distanceMeters };
      } catch (err) {
        console.warn(`Fallback: calculating haversine for ${driver.driverId}`);
        const distanceKm = calculateDistance(restaurantLat, restaurantLng, driverLat, driverLng);
        return { ...driver.toObject(), distanceMeters: distanceKm * 1000 };
      }
    }));

    console.log('Live drivers found:', liveDrivers.length);
    liveDrivers.forEach(d => console.log(`Driver ${d.driverId} @ ${d.coordinates}`));

    const availableDrivers = driversWithDistance.filter(Boolean); // Remove nulls

    if (availableDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No available drivers' });
    }

    // Assign the absolutely closest one regardless of distance
    const assignedDriver = availableDrivers.sort((a, b) => a.distanceMeters - b.distanceMeters)[0];

    const delivery = await Delivery.create({
      orderId: order.orderId,
      orderRef: order._id,
      restaurant: {
        id: order.restaurantOrder.restaurantId,
        name: order.restaurantOrder.restaurantName,
        location: {
          type: 'Point',
          coordinates: [restaurantLng, restaurantLat]
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

    try {
      await axios.patch(
        `${global.gConfig.order_url}/api/orders/${order.orderId}/delivery-person`,
        {
          deliveryPersonId: assignedDriver.driverId,
          name: assignedDriver.name,
          phone: assignedDriver.phone,
          vehicleDetails: assignedDriver.vehicleDetails || '',
          vehicleNumber: assignedDriver.vehicleNumber || '',
          rating: assignedDriver.rating || 4,
          profileImage: assignedDriver.profileImage || '',
        },
        {
          headers: {
            Authorization: req.headers.authorization, // Forward token
          },
        }
      );
    } catch (error) {
      console.error('Failed to update delivery person in order service:', error?.response?.data || error.message);
      // Don't fail the assignment due to this; log it and continue
    }

    // Remove assigned driver from available
    await LiveDriver.deleteOne({ driverId: assignedDriver.driverId });

    // Notify via Socket.IO
    const io = req.app.get('io');
    io.to(`user_${assignedDriver.driverId}`).emit('deliveryAssignedDirect', {
      deliveryId: delivery._id,
      orderId: delivery.orderId,
      restaurant: delivery.restaurant,
      deliveryAddress: delivery.customer.deliveryAddress,
      deliveryFee: delivery.deliveryFee
    });

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
    console.error('assignDelivery error:', err?.response?.data || err);
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
 * @desc    Get currently active delivery for driver
 * @route   GET /api/deliveries/driver/current
 * @access  Private/Delivery
 */
const getCurrentDriverDelivery = async (req, res) => {
  try {
    const driverId = req.user.id; // pulled from protect middleware
    const delivery = await Delivery.findOne({
      'driver.id': driverId,
      status: { $in: [
        'DRIVER_ASSIGNED',
        'EN_ROUTE_TO_RESTAURANT',
        'ARRIVED_AT_RESTAURANT',
        'PICKED_UP',
        'EN_ROUTE_TO_CUSTOMER',
        'ARRIVED_AT_CUSTOMER',
      ]}
    }).sort({ createdAt: -1 });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'No current delivery found' });
    }

    res.status(200).json({ success: true, delivery });
  } catch (error) {
    console.error('Get current driver delivery error:', error);
    res.status(500).json({ success: false, message: 'Error fetching delivery' });
  }
};

/**
 * @desc    Update restaurant verification status (Admin-only)
 * @route   PATCH /api/deliveries/:id/verify
 * @access  Private (Admin)
 */
//
const updateDeliveryVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    // 1. Validate input
    if (
      !isVerified ||
      !["active", "suspended", "pending"].includes(isVerified)
    ) {
      return res.status(400).json({
        message:
          "Invalid status. Must be: 'active', 'suspended', or 'pending'.",
      });
    }

    // 2. Check if restaurant exists
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // 3. Verify requester is an admin (add your admin check logic here)
    // Example: if (!req.user.isAdmin) return res.status(403).json(...);

    // 4. Update only the `isVerified` field
    delivery.isVerified = isVerified;
    await restaurant.save();

    res.json({
      message: `Delivery verification status updated to '${isVerified}'.`,
      restaurant,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ message: "Server error", error });
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
    const deliveryId = req.params.id;

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
        message: 'Invalid status',
        validStatuses
      });
    }

    // Get and validate delivery
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Authorization check
    if (!delivery.driver || delivery.driver.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }

    // Status transition validation
    const currentStatusIndex = validStatuses.indexOf(delivery.status);
    const newStatusIndex = validStatuses.indexOf(status);
    
    if (newStatusIndex < currentStatusIndex && status !== 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Cannot revert status from ${delivery.status} to ${status}`
      });
    }

    // Update delivery status
    delivery.status = status;
    if (notes) {
      delivery.notes = delivery.notes ? `${delivery.notes}\n${notes}` : notes;
    }

    // Map delivery status to order status
    const statusMap = {
      'PICKED_UP': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED'
    };

    let orderStatusUpdate = null;
    if (statusMap[status]) {
      orderStatusUpdate = statusMap[status];
    }

    // Start transaction for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save delivery changes
      await delivery.save({ session });

      // Sync to Order Service if needed
      if (orderStatusUpdate) {
        await axios.patch(
          `${process.env.ORDER_SERVICE_URL}/api/orders/${delivery.orderId}/status`,
          { 
            status: orderStatusUpdate,
            notes: `Delivery status updated: ${status}`
          },
          { 
            headers: { 
              Authorization: req.headers.authorization,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
      }

      // Handle DELIVERED status updates
      if (status === 'DELIVERED') {
        // Complete LiveDriver update with all required fields
        await LiveDriver.findOneAndUpdate(
          { driverId: delivery.driver.id },
          {
            driverId: delivery.driver.id,
            name: delivery.driver.name,
            phone: delivery.driver.phone,
            coordinates: delivery.driver.currentLocation.coordinates,
            isAvailable: true,
            lastDeliveryCompleted: new Date(),
            $inc: { completedDeliveries: 1 },
            updatedAt: new Date()
          },
          { 
            upsert: true,
            session,
            new: true,
            setDefaultsOnInsert: true
          }
        );

        // Record earnings
        if (delivery.earningsAmount) {
          await DeliveryEarningsReport.findOneAndUpdate(
            {
              driverId: delivery.driver.id,
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1
            },
            {
              $inc: { total: delivery.earningsAmount },
              $addToSet: { deliveries: delivery._id }
            },
            { upsert: true, session }
          );
        }

        // Update driver's last known location if available
        if (delivery.customer?.deliveryAddress?.coordinates) {
          await LiveDriver.findOneAndUpdate(
            { driverId: delivery.driver.id },
            {
              coordinates: delivery.customer.deliveryAddress.coordinates
            },
            { session }
          );
        }
      }

      await session.commitTransaction();

      // Notifications
      if (delivery.customer?.id) {
        const io = req.app.get('io');
        io.to(`user_${delivery.customer.id}`).emit('deliveryStatusUpdated', {
          deliveryId: delivery._id,
          orderId: delivery.orderId,
          status: delivery.status,
          updatedAt: new Date(),
          driverLocation: delivery.driver.currentLocation // Include driver location
        });
      }

      res.status(200).json({
        success: true,
        delivery: {
          _id: delivery._id,
          status: delivery.status,
          orderId: delivery.orderId,
          updatedAt: delivery.updatedAt,
          driverAvailable: status === 'DELIVERED' // Indicate if driver is now available
        }
      });

    } catch (transactionError) {
      await session.abortTransaction();
      console.error('Transaction failed:', {
        error: transactionError.message,
        stack: transactionError.stack,
        deliveryId,
        status
      });
      throw transactionError;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Update delivery status error:', {
      error: error.message,
      stack: error.stack,
      deliveryId: req.params.id,
      status: req.body.status
    });

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error updating delivery status';

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        errorDetails: {
          message: error.message,
          stack: error.stack
        }
      })
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
    const delivery = await Delivery.findById(req.params.id)
      .select('driver.currentLocation customer.deliveryAddress.coordinates status')
      .lean();

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Validate driver data
    if (!delivery.driver?.currentLocation?.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Driver location unavailable'
      });
    }

    // Validate delivery address
    if (!delivery.customer?.deliveryAddress?.coordinates?.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address missing'
      });
    }

    // Format coordinates (convert from GeoJSON [lng,lat] to "lat,lng")
    const [driverLng, driverLat] = delivery.driver.currentLocation.coordinates;
    const [deliveryLng, deliveryLat] = delivery.customer.deliveryAddress.coordinates.coordinates;

    const origin = `${driverLat},${driverLng}`;
    const destination = `${deliveryLat},${deliveryLng}`;

    // Get route data
    const route = await getRoutePolyline(origin, destination);
    const { durationSeconds } = await getDistanceMatrix(origin, destination);

    res.json({
      success: true,
      data: {
        driverLocation: { longitude: driverLng, latitude: driverLat },
        deliveryLocation: { longitude: deliveryLng, latitude: deliveryLat },
        route,
        etaMinutes: Math.ceil(durationSeconds / 60),
        currentStatus: delivery.status
      }
    });

  } catch (error) {
    console.error('Track delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track delivery',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
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
 * @route GET /api/earnings/current/:id
 * @access Private (Delivery)
 */
const getCurrentEarnings = async (req, res) => {
  try {
    const driverId = req.params.id; // Get ID from URL params
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Validate driver ID
    if (!driverId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver ID is required' 
      });
    }

    // Get completed deliveries with earnings for current month
    const deliveries = await Delivery.find({
      'driver.id': driverId, // Use the param ID instead of req.user.id
      status: 'DELIVERED',
      earningsRecorded: true,
      deliveryTime: { 
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    })
    .select('earningsAmount deliveryTime')
    .lean();

    const total = deliveries.reduce((sum, delivery) => {
      return sum + (delivery.earningsAmount || 0);
    }, 0);

    // Create/update monthly earnings record
    await DeliveryEarningsReport.findOneAndUpdate(
      {
        driverId: driverId, // Use the param ID
        year: now.getFullYear(),
        month: now.getMonth() + 1
      },
      {
        $set: { total },
        $addToSet: { deliveries: { $each: deliveries.map(d => d._id) } }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ 
      success: true, 
      total,
      currency: 'USD',
      deliveryCount: deliveries.length,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      driverId // Include the driver ID in response
    });

  } catch (err) {
    console.error('Detailed error:', {
      message: err.message,
      stack: err.stack,
      queryParams: req.params
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
  getCustomerDeliveries,
  updateDeliveryVerification,
  getCurrentDriverDelivery,
};
