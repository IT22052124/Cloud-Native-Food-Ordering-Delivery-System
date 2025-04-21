/*import express from 'express';
import { validateToken } from '../middleware/auth.js';
import {
  toggleAvailability,
  getAssignedOrders,
  updateOrderStatus,
} from '../controllers/deliveryController.js';

const router = express.Router();

// Protected routes (require valid JWT)
router.use(validateToken);

// Delivery-specific endpoints
router.put('/availability/toggle', toggleAvailability);
router.get('/orders', getAssignedOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;*/