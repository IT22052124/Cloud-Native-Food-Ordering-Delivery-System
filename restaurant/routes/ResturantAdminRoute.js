import express from "express";
import {
  createDish,
  restaurantAdminLogin,
} from "../Controller/ResturantAdmin.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authMiddlewareAdmin from "../middleware/getToken.js";
const router = express.Router();

// Owner Routes
router.post("/add", authMiddlewareAdmin, createDish);
router.post("/login", restaurantAdminLogin);
//  router.get("/my-restaurants", authMiddleware, getMyRestaurants);
// router.get("/:id", authMiddleware, getRestaurantById);
// router.put("/:id", authMiddleware, updateRestaurant);
// router.delete("/:id", authMiddleware, deleteRestaurant);

export default router;
