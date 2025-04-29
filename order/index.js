import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import orderRoutes from "./routes/orderRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import { setupWebSocket } from "./websocket.js";

dotenv.config();
const app = express();

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Set global configuration for service URLs
global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  admin_url: process.env.ADMIN_SERVICE_URL,
};

// Routes
app.use("/api/orders/", orderRoutes);
app.use("/api/cart", cartRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "Order Service" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5002;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // Initialize and setup WebSocket server
    const wss = setupWebSocket(server);

    // Start HTTP server instead of Express app directly
    server.listen(PORT, () => {
      console.log(`Order Service is running on port ${PORT}`);
      console.log(
        `WebSocket server is running on ws://localhost:${PORT}/ws/orders/:id`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
