import express from "express";
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  validateToken,
  registerWorker,
} from "../controller/authController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

//Private route for restaurant owner to create workers
router.post("/registerWorker", authorize("restaurant"), registerWorker);

// Token validation endpoint (for internal service use)
router.get("/validate-token", validateToken);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);

export default router;
