import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/payment", paymentRoutes);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
