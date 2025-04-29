// routes/settlementRoutes.js
import express from "express";
import { addOrderToSettlement } from "../controllers/settlementController.js";

const router = express.Router();
router.post("/add-order", addOrderToSettlement);

export default router;
