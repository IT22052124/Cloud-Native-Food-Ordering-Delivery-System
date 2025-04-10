import express from "express";
import { addRestaurant, getRestaurantById,getMyRestaurants,  updateRestaurant, deleteRestaurant } from "../Controller/ResturantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner Routes
router.post("/resturants/add", authMiddleware, addRestaurant);
 router.get("/resturants/", authMiddleware, getMyRestaurants);
router.get("/resturants/:id", authMiddleware, getRestaurantById);
router.put("/resturants/:id", authMiddleware, updateRestaurant);
router.delete("/resturants/:id", authMiddleware, deleteRestaurant);


export default router;
