import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getRestaurantOrders,
  getAllOrders,
  deleteOrder,
  assignDeliveryPerson,
  updateDeliveryLocation,
  getOrderTracking,
} from "../controller/orderController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router
  .route("/")
  .post(authorize("customer"), createOrder)
  .get(authorize("customer"), getUserOrders);

// Order details route - accessible by customer, restaurant (if part of the order), or admin
router
  .route("/:id")
  .get(authorize("customer", "restaurant", "admin", "delivery"), getOrderById)
  .delete(authorize("customer", "admin"), deleteOrder);

// Order tracking route - accessible by customer, restaurant (if part of the order), or admin
router
  .route("/:id/tracking")
  .get(
    authorize("customer", "restaurant", "admin", "delivery"),
    getOrderTracking
  );

// Restaurant routes
router.route("/restaurant").post(authorize("restaurant"), getRestaurantOrders);

// Admin routes
router.route("/admin/all").get(authorize("admin"), getAllOrders);

// Update order status - accessible by the restaurant or admin
router
  .route("/:id/status")
  .patch(authorize("restaurant", "admin", "customer"), updateOrderStatus);

// Delivery routes
router
  .route("/:id/delivery-person")
  .patch(authorize("admin", "delivery_service"), assignDeliveryPerson);

router
  .route("/:id/delivery-location")
  .patch(authorize("delivery"), updateDeliveryLocation);

export default router;
