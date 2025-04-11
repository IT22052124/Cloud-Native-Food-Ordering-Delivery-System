import express from "express";
import {
  addRestaurant,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  deleteRestaurant,
} from "../controller/ResturantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/restaurants/add", authMiddleware, addRestaurant);
router.get("/restaurants/", authMiddleware, getMyRestaurants);
router.get("/restaurants/:id", authMiddleware, getRestaurantById);
router.put("/restaurants/:id", authMiddleware, updateRestaurant);
router.delete("/restaurants/:id", authMiddleware, deleteRestaurant);

export default router;
