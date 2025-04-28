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
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Get restaurant payments with filtering
router.get("/", authorize("admin"), getRestaurantPayments);

// Generate weekly payments
router.post("/generate-weekly", authorize("admin"), generateWeeklyPayments);

// Process a single payment
router.post("/:paymentId/process", authorize("admin"), processPayment);

// Process multiple payments
router.post("/process-bulk", authorize("admin"), processBulkPayments);

// Update payment status
router.patch("/:paymentId/status", authorize("admin"), updatePaymentStatus);

// Get payment details
router.get("/:paymentId", authorize("admin"), getPaymentDetails);

// Get current week summary
router.get("/summary/current-week", authorize("admin"), getCurrentWeekSummary);

export default router;
