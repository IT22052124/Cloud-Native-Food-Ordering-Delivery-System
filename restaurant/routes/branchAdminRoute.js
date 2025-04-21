import express from "express";
import {
  createDish,
  restaurantAdminLogin,
  getAllDishes,
  getDishById,
  deleteDish,
  updateDishById,
  getOrdersForRestaurant,
} from "../controller/branchAdmin.js";
import authMiddlewareAdmin from "../middleware/getToken.js";
import { authorizeRole } from "../middleware/authRole.js";
const router = express.Router();

// Owner Routes
router.post("/add", authMiddlewareAdmin, createDish);
router.post("/login", restaurantAdminLogin);
 router.get("/", authMiddlewareAdmin, getAllDishes);
 router.get("/:id", authMiddlewareAdmin, getDishById);
 router.put("/:id", authMiddlewareAdmin, updateDishById);
 router.delete("/:id", authMiddlewareAdmin, deleteDish);
 router.get("/orders",authMiddlewareAdmin,authorizeRole("restaurant"),getOrdersForRestaurant)
export default router;
