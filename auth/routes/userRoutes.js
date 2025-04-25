import express from "express";
import {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  updateProfile,
  deleteUser,
  updateUserStatus,
  changePassword,
  toggleDriverAvailability,
  getUserAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  removeAddress,
} from "../controller/userController.js";
import { getCurrentUser } from "../controller/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Routes accessible by all authenticated users
router.get("/me", getCurrentUser);
router.patch("/me", updateProfile);
router.put("/me/password", changePassword);

// Address management routes
router.get("/me/addresses", getUserAddresses);
router.post("/me/addresses", addAddress);
router.put("/me/addresses/:addressId", updateAddress);
router.put("/me/addresses/:addressId/default", setDefaultAddress);
router.delete("/me/addresses/:addressId", removeAddress);

// Admin only routes
router.get("/", authorize("admin"), getAllUsers);
router.get("/pending-approval", authorize("admin"), getPendingApprovalUsers);
router.put("/:id/approve", authorize("admin"), approveUser);
router.put("/:id/status", authorize("admin"), updateUserStatus);
router.delete("/:id", authorize("admin"), deleteUser);

// Delivery Person only route
router.put(
  "/me/availability/toggle",
  authorize("delivery"),
  toggleDriverAvailability
);

export default router;
