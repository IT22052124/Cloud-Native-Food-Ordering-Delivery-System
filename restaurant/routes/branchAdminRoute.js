import express from "express";
import {
  createDish,
  restaurantAdminLogin,
  getAllDishes,
  getDishById,
  deleteDish,
  updateDishById,
  getOrdersForRestaurant,
  updateRestaurant,getRestaurantById,updateRestaurantStatus,
  getAdminCredentials,updateAdminCredentials
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
 router.put("/restaurants/:id",authMiddlewareAdmin, updateRestaurant);
 router.get("/restaurants/:id", getRestaurantById);
 router.patch("/restaurants/:id/status",authMiddlewareAdmin, updateRestaurantStatus);
 router.get("/restaurants/:id/usernames",authMiddlewareAdmin, getAdminCredentials);
 router.patch("/restaurants/:id/credentials",authMiddlewareAdmin, updateAdminCredentials);


 
 
export default router;
