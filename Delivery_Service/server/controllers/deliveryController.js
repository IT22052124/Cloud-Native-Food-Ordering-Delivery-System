import Delivery from '../models/Delivery.js';
import axios from 'axios';

/**
 * @desc    Assign delivery to an order (called by restaurant service)
 * @route   POST /api/deliveries/assign
 * @access  Private/Restaurant
 */
export const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // 1. Validate order exists and is ready for delivery
    const orderResponse = await axios.get(
      `${global.gConfig.order_url}/api/orders/${orderId}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    
    const order = orderResponse.data.order;
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.type !== 'DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Only delivery orders can be assigned'
      });
    }
    
    if (order.restaurantOrder.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for pickup'
      });
    }
    
    // 2. Find nearest available drivers
    const drivers = await findNearestDrivers({
      type: 'Point',
      coordinates: [
        order.restaurantOrder.restaurantLocation.lng,
        order.restaurantOrder.restaurantLocation.lat
      ]
    });
    
    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available drivers found'
      });
    }

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
      proposedDrivers: drivers.map(d => ({
        driverId: d.id,
        name: d.name,
        distance: d.distance
      })),
      deliveryFee: order.restaurantOrder.deliveryFee,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus
      },
      earningsAmount: order.paymentMethod === 'CASH' 
        ? -order.restaurantOrder.deliveryFee 
        : order.restaurantOrder.deliveryFee
    };
    
    const delivery = await Delivery.create(deliveryData);
    
    // 4. Update order status in order service
    await axios.patch(
      `${global.gConfig.order_url}/api/orders/${orderId}/status`,
      { status: 'OUT_FOR_DELIVERY' },
      { headers: { Authorization: req.headers.authorization } }
    );
    
    // 5. Notify drivers via Socket.IO
    const io = req.app.get('io');
    drivers.forEach(driver => {
      io.to(`user_${driver.id}`).emit('deliveryAssignment', {
        deliveryId: delivery._id,
        orderId: order.orderId,
        restaurant: delivery.restaurant,
        deliveryAddress: delivery.customer.deliveryAddress,
        deliveryFee: delivery.deliveryFee,
        expiresAt: new Date(Date.now() + 60000) // 1 minute to respond
      });
    });

    // 6. Set timeout for driver response
    setTimeout(async () => {
      const updatedDelivery = await Delivery.findById(delivery._id);
      if (updatedDelivery.status === 'PENDING_ASSIGNMENT') {
        updatedDelivery.status = 'DRIVER_TIMEOUT';
        await updatedDelivery.save();
        
        // Notify restaurant
        io.to(`user_${order.restaurantOrder.restaurantId}`).emit('deliveryAssignmentFailed', {
          orderId: order.orderId,
          reason: 'No drivers accepted in time'
        });
      }
    }, 60000); // 1 minute timeout

    res.status(201).json({
      success: true,
      delivery,
      notifiedDrivers: drivers.length
    });
    
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning delivery',
      error: error.message
    });
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

// Other controller methods will be implemented in subsequent phases
export const getDeliveryDetails = async (req, res) => { /* ... */ };
export const getDriverDeliveries = async (req, res) => { /* ... */ };
export const confirmCashPayment = async (req, res) => { /* ... */ };