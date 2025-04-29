import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import RestaurantSettlement from "./routes/restaurantPaymentRoutes.js";

dotenv.config();

// Initialize Express
const app = express();

// Apply CORS globally
app.use(cors());

global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  order_url: process.env.ORDER_SERVICE_URL,
};

// Routes
app.use("/api/settlements", RestaurantSettlement );

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
