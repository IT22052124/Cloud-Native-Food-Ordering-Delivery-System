import express from "express";
import { addRestaurant, getRestaurantById,getMyRestaurants,  updateRestaurant, deleteRestaurant } from "../Controller/ResturantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/add", authMiddleware, addRestaurant);
 router.get("/", authMiddleware, getMyRestaurants);
router.get("/:id", authMiddleware, getRestaurantById);
router.put("/:id", authMiddleware, updateRestaurant);
router.delete("/:id", authMiddleware, deleteRestaurant);


export default router;
