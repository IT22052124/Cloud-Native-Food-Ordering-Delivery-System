import express from "express";
import paymentController from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply protection to all routes EXCEPT webhook
router.use((req, res, next) => {
  if (req.path === "/webhook") return next();
  protect(req, res, next);
});

// Payment initiation - accessible by customers only
router.post(
  "/initiate",
  authorize("customer"),
  paymentController.initiatePayment
);

router.post(
  "/initiateCOD",
  authorize("delivery"),
  paymentController.createCodPayment
);

// Stripe webhook endpoint - must use raw body parser
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Critical for Stripe
  paymentController.handleWebhook
);

export default router;
