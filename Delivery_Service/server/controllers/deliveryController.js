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
    const orderResponse = await axios.get(`${global.gConfig.order_url}/api/orders/${orderId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
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
    
    // 2. Create delivery record
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
    
    // 3. Update order status in order service
    await axios.patch(
      `${global.gConfig.order_url}/api/orders/${orderId}/status`,
      { status: 'OUT_FOR_DELIVERY' },
      { headers: { Authorization: req.headers.authorization } }
    );
    
    // 4. Notify available drivers via Socket.IO
    const io = req.app.get('io');
    io.to('drivers_room').emit('newDeliveryAvailable', {
      deliveryId: delivery._id,
      restaurant: delivery.restaurant,
      deliveryAddress: delivery.customer.deliveryAddress,
      deliveryFee: delivery.deliveryFee
    });
    
    res.status(201).json({
      success: true,
      delivery
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
 * @desc    Update driver's location (real-time tracking)
 * @route   PATCH /api/deliveries/:id/location
 * @access  Private/Delivery
 */
export const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
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
    
    // Update driver's current location
    delivery.driver.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    
    await delivery.save();
    
    // Send real-time update to customer
    const io = req.app.get('io');
    io.to(`user_${delivery.customer.id}`).emit('driverLocationUpdated', {
      deliveryId: delivery._id,
      location: { lat, lng },
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Location updated'
    });
    
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};

// Other controller methods will be implemented in subsequent phases
export const getDeliveryDetails = async (req, res) => { /* ... */ };
export const getDriverDeliveries = async (req, res) => { /* ... */ };
export const confirmCashPayment = async (req, res) => { /* ... */ };