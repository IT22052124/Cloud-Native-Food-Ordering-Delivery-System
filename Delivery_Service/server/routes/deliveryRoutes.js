const express = require('express');
const {
  assignDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  toggleAvailability,
  respondToAssignment,
  getDeliveryById,
  getDeliveriesByQuery,
  getCustomerDeliveries,
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Restaurant endpoints
router.post('/assign', authorize('restaurant'), assignDelivery);

// Driver endpoints
router.patch('/availability', authorize('delivery'), toggleAvailability);
router.patch('/:id/status', authorize('delivery'), updateDeliveryStatus);
router.patch('/:id/location', authorize('delivery'), updateDriverLocation);
router.post('/respond', authorize('delivery'), respondToAssignment);

// Shared endpoints
router.get('/:id', authorize('customer', 'restaurant', 'delivery', 'admin'), getDeliveryById);
router.get('/', authorize('admin', 'restaurant', 'delivery'), getDeliveriesByQuery);
router.get('/customer/history', authorize('customer'), getCustomerDeliveries);

module.exports = router;