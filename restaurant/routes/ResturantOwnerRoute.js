import express from "express";
import {
  addRestaurant,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  deleteRestaurant,
  restaurantDishes,
  getRestaurantByOwnerId,
  updateRestaurantStatus
} from "../Controller/ResturantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/restaurants/add", authMiddleware, addRestaurant);
router.get("/restaurants/", authMiddleware, getMyRestaurants);
router.get("/restaurants/:id/dishes", authMiddleware, restaurantDishes);
router.get("/restaurants/:id", getRestaurantById);
router.put("/restaurants/:id", authMiddleware, updateRestaurant);
router.delete("/restaurants/:id", authMiddleware, deleteRestaurant);
router.patch("/restaurants/:id/status", authMiddleware, updateRestaurantStatus);


router.get(
  "/restaurants/:id/restaurant",
  authMiddleware,
  getRestaurantByOwnerId
);

export default router;
