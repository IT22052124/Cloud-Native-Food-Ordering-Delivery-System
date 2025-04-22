import express from "express";
import paymentController from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all payment routes

// Payment initiation - accessible by customers only
router.post(
  "/initiate", // Only customers can initiate payments
  paymentController.initiatePayment
);

// Webhook endpoint - should be public (no protection)
router.post("/callback", paymentController.handleWebhook);

export default router;
