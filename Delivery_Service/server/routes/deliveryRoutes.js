import express from 'express';
import { 
  assignDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  getDeliveryDetails,
  getDriverDeliveries,
  confirmCashPayment,
  toggleAvailability
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Restaurant endpoints
router.post('/assign', authorize('restaurant'), assignDelivery);

// Driver endpoints
router.get('/driver', authorize('delivery'), getDriverDeliveries);
router.patch('/availability', protect, authorize('delivery'), toggleAvailability);
router.patch('/:id/status', authorize('delivery'), updateDeliveryStatus);
router.patch('/:id/location', authorize('delivery'), updateDriverLocation);
router.patch('/:id/confirm-payment', authorize('delivery'), confirmCashPayment);

// Shared endpoints
router.get('/:id', authorize('customer', 'restaurant', 'delivery', 'admin'), getDeliveryDetails);

export default router;