// routes/settlementRoutes.js
import express from "express";
import {
  addOrderToSettlement,
  getAllSettlements,
  processWeeklySettlements,
} from "../controllers/settlementController.js";

const router = express.Router();
router.post("/add-order", addOrderToSettlement);
router.get("/", getAllSettlements);
router.post("/process-weekly", processWeeklySettlements);

export default router;
