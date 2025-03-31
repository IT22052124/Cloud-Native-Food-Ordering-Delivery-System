import express from "express";
import {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  updateProfile,
  deleteUser,
  updateUserStatus,
  changePassword,
} from "../controller/userController.js";
import { getCurrentUser } from "../controller/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Routes accessible by all authenticated users
router.get("/me", getCurrentUser);
router.put("/me", updateProfile);
router.put("/me/password", changePassword);

// Admin only routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/pending-approval", authorize("admin"), getPendingApprovalUsers);
router.put("/:id/approve", authorize("admin"), approveUser);
router.put("/:id/status", authorize("admin"), updateUserStatus);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
