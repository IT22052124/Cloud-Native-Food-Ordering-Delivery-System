import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startRegistrationConsumer } from "./consumers/notificationConsumer.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  order_url: process.env.ORDER_SERVICE_URL,
};

// Routes
app.use("/api/notifications", notificationRoutes);

// Start Kafka consumer
startRegistrationConsumer();

// Start server
const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
