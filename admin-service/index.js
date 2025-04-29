import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import RestaurantSettlement from "./routes/restaurantPaymentRoutes.js";
import { processWeeklySettlements } from "./controllers/settlementController.js";
import cron from "node-cron";

dotenv.config();

// Initialize Express
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS globally
app.use(cors());

global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  order_url: process.env.ORDER_SERVICE_URL,
};

// Run every Sunday at 11:30 PM
cron.schedule(
  "30 23 * * 0",
  async () => {
    try {
      console.log("Auto-processing weekly settlements...");
      await processWeeklySettlements();
    } catch (error) {
      console.error("Auto-settlement failed:", error);
    }
  },
  {
    timezone: "Asia/Colombo",
    name: "WeeklySettlements",
  }
);

// Routes
app.use("/api/settlements", RestaurantSettlement);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
