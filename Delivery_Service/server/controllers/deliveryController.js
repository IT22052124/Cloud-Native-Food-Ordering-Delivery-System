import Delivery from '../models/Delivery.js';
import axios from 'axios';
import { getDistanceMatrix, getRouteAndETA } from '../utils/geoUtils.js';

let retryQueue = {}; // In-memory retry tracking
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 15000; // 15 seconds between retries

/**
 * @desc    Assign delivery to an order (called by restaurant service)
 * @route   POST /api/deliveries/assign
 * @access  Private/Restaurant
 */
export const assignDelivery = async (req, res) => {
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

    // 1. Get available drivers from auth service
    const usersResponse = await axios.get(
      `${global.gConfig.auth_url}/api/users?role=delivery&status=active`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const availableDrivers = usersResponse.data.users.filter(u => u.driverIsAvailable && u.location?.coordinates);

    if (availableDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No available drivers' });
    }

    // 2. Use Google Distance Matrix API to sort by proximity
    const origins = `${order.restaurantOrder.restaurantLocation.lat},${order.restaurantOrder.restaurantLocation.lng}`;
    const destinations = availableDrivers.map(
      d => `${d.location.coordinates[1]},${d.location.coordinates[0]}`
    );

    const matrix = await getDistanceMatrix(origins, destinations.join('|'));
    const sortedDrivers = availableDrivers.map((driver, i) => ({
      ...driver,
      distance: matrix.rows[0].elements[i].distance.value
    })).sort((a, b) => a.distance - b.distance);

    // 3. Create delivery record
    const deliveryData = {
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
      status: 'PENDING_ASSIGNMENT',
      proposedDrivers: sortedDrivers.map(d => ({ driverId: d._id, name: d.name, distance: d.distance })),
      deliveryFee: order.restaurantOrder.deliveryFee,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus
      },
      earningsAmount: order.paymentMethod === 'CASH' ? -order.restaurantOrder.deliveryFee : order.restaurantOrder.deliveryFee
    };

    const delivery = await Delivery.create(deliveryData);

    // 4. Notify top 3 drivers (or all if <3) via socket
    const io = req.app.get('io');
    sortedDrivers.slice(0, 3).forEach(driver => {
      io.to(`user_${driver._id}`).emit('deliveryAssignment', {
        deliveryId: delivery._id,
        orderId: order.orderId,
        restaurant: delivery.restaurant,
        deliveryAddress: delivery.customer.deliveryAddress,
        deliveryFee: delivery.deliveryFee,
        expiresAt: new Date(Date.now() + 60000)
      });
    });

    res.status(201).json({
      success: true,
      delivery,
      notifiedDrivers: sortedDrivers.length
    });

    // 5. Set fallback timeout
    setTimeout(() => retryDeliveryAssignment(delivery._id, io, req.headers.authorization), 60000);
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Retry delivery assignment if declined or timed out
 */
async function retryDeliveryAssignment(deliveryId, io, token) {
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
    setTimeout(() => retryDeliveryAssignment(deliveryId, io, token), RETRY_DELAY_MS);
    retryQueue[deliveryId] = { attempt: attempt + 1 };
    return;
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

  setTimeout(() => retryDeliveryAssignment(deliveryId, io, token), 60000);
}

/**
 * @desc    Get single delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Private (Driver or Customer)
 */
export const getDeliveryById = async (req, res) => {
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
export const getDeliveriesByQuery = async (req, res) => {
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
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Verify the driver is assigned to this delivery
    if (delivery.driver.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }
    
    delivery.status = status;
    if (notes) {
      delivery.notes = notes;
    }
    
    await delivery.save();
    
    // Notify customer about status change
    const io = req.app.get('io');
    io.to(`user_${delivery.customer.id}`).emit('deliveryStatusUpdated', {
      deliveryId: delivery._id,
      status: delivery.status,
      updatedAt: new Date()
    });
    
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
export const updateDriverLocation = async (req, res) => {
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
 * @route   PATCH /api/drivers/availability
 * @access  Private/Delivery
 */
export const toggleAvailability = async (req, res) => {
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
export const respondToAssignment = async (req, res) => {
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
        driver: delivery.driver
      });
      
      io.to(`user_${delivery.customer.id}`).emit('driverAssigned', {
        orderId: delivery.orderId,
        driver: delivery.driver
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
export const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const driverLocation = delivery.driver?.currentLocation;
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

// Export the new method
export {
  assignDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  toggleAvailability,
  respondToAssignment,
  trackDelivery,
  getDeliveryById,
  getDeliveriesByQuery
};


// Other controller methods will be implemented in subsequent phases
export const getDeliveryDetails = async (req, res) => { /* ... */ };
export const getDriverDeliveries = async (req, res) => { /* ... */ };
export const confirmCashPayment = async (req, res) => { /* ... */ };