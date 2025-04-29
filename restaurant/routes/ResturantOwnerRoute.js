import express from "express";
import {
  addRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant,
  deleteRestaurant,
  restaurantDishes,
  getRestaurantByOwnerId,
  updateRestaurantStatus,
  getFoodCategories,
  updateRestaurantVerification,
  getMyRestaurants,
  searchRestaurants,
  getRestaurantsByLocation,
  searchRestaurantsWithDishes,
} from "../controller/ResturantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/restaurants/add", authMiddleware, addRestaurant);
router.get("/restaurants/", getRestaurants);
router.get("/owner/restaurants/", authMiddleware, getMyRestaurants);
router.get("/restaurants/search", searchRestaurants);
router.get("/restaurants/advanced-search", searchRestaurantsWithDishes);
router.get("/restaurants/nearby", getRestaurantsByLocation);
router.get("/restaurants/:id/dishes", restaurantDishes);
router.get("/restaurants/:id", getRestaurantById);
router.put("/restaurants/:id", authMiddleware, updateRestaurant);
router.delete("/restaurants/:id", authMiddleware, deleteRestaurant);
router.patch("/restaurants/:id/status", authMiddleware, updateRestaurantStatus);

router.patch("/restaurants/:id/verfication", updateRestaurantVerification); //mufeez call this

// Retrieve categories
router.get("/categories", getFoodCategories);

router.get(
  "/restaurants/:id/restaurant",
  authMiddleware,
  getRestaurantByOwnerId
);

export default router;
