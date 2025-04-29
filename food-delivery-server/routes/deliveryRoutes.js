const express = require('express');
const {
  assignDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  toggleAvailability,
  getDeliveryById,
  getDeliveriesByQuery,
  getCustomerDeliveries,
  updateDeliveryVerification,
  getDriverDeliveries,
  getCurrentDriverDelivery,
  trackDelivery,
  getCurrentEarnings,
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// --- Public endpoints (for internal restaurant/order services)
router.post('/assign', assignDelivery);

// --- Delivery Tracking (must be before /:id)
router.get('/track/:id', protect, authorize('delivery'), trackDelivery);

// --- Driver endpoints
router.get('/driver/current', protect, authorize('delivery'), getCurrentDriverDelivery);
router.get('/driver/:driverId', protect, authorize('delivery'), getDriverDeliveries);
router.patch('/availability', protect, authorize('delivery'), toggleAvailability);

// --- Common endpoints
router.get('/customer/history', protect, authorize('customer'), getCustomerDeliveries);
router.get('/', protect, authorize('admin', 'restaurant', 'delivery'), getDeliveriesByQuery);


// --- Dynamic ID endpoints (MUST be last)
router.get('/:id', protect, authorize('customer', 'restaurant', 'delivery', 'admin'), getDeliveryById);
router.patch('/:id/status', protect, authorize('delivery'), updateDeliveryStatus);
router.patch('/:id/location', protect, authorize('delivery'), updateDriverLocation);
router.patch('/:id/verify', protect, authorize('delivery'), updateDeliveryVerification);


// router.patch('/earnings/cash-paid/:deliveryId', protect, authorize('delivery'), markCashPaymentAsPaid);

// // --- Retry assignment (Admin)
// router.post('/retry-assignment/:id', protect, authorize('admin'), retryDeliveryAssignment);


module.exports = router;