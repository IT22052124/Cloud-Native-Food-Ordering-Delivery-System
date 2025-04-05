import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createOrder,
  getOrderById,
  // updateOrderStatus,
  getUserOrders,
  getRestaurantOrders,
  getAllOrders,
  deleteOrder,
  updateRestaurantOrderStatus,
} from "../controller/orderController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router
  .route("/")
  .post(authorize("customer"), createOrder)
  .get(authorize("customer"), getUserOrders);

// Order details route - accessible by customer, restaurant (if part of the order), 
router
  .route("/:id")
  .get(authorize("customer", "restaurant"), getOrderById)
  .delete(authorize("customer"), deleteOrder);

// Restaurant routes
router.route("/restaurant").get(authorize("restaurant"), getRestaurantOrders);

// Admin routes
router.route("/admin/all").get(authorize("admin"), getAllOrders);

// Update overall order status - accessible by admin only
// router.route("/:id/status").patch(authorize("admin"), updateOrderStatus);

// Update restaurant-specific part of an order - accessible by the specific restaurant 
router
  .route("/:id/restaurant/:restaurantId/status")
  .patch(authorize("restaurant"), updateRestaurantOrderStatus);

export default router;
