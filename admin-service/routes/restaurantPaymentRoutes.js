// routes/restaurantPaymentRoutes.js
import express from "express";
import {
  getRestaurantPayments,
  generateWeeklyPayments,
  processPayment,
  processBulkPayments,
  updatePaymentStatus,
  getPaymentDetails,
  getCurrentWeekSummary,
} from "../controllers/restaurantPaymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticate);

// Get restaurant payments with filtering
router.get("/", getRestaurantPayments);

// Generate weekly payments
router.post("/generate-weekly", generateWeeklyPayments);

// Process a single payment
router.post("/:paymentId/process", processPayment);

// Process multiple payments
router.post("/process-bulk", processBulkPayments);

// Update payment status
router.patch("/:paymentId/status", updatePaymentStatus);

// Get payment details
router.get("/:paymentId", getPaymentDetails);

// Get current week summary
router.get("/summary/current-week", getCurrentWeekSummary);

export default router;
