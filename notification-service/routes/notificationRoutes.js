import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import {
  sendEmailNotification,
  sendSmsNotification,
} from "../controllers/notificationApiController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// New notification API routes
router.post("/email", sendEmailNotification);
router.post("/sms", sendSmsNotification);

router.use(protect);

// Route to get notifications (admin only)
router.get("/", authorize("admin"), getNotifications);
router.put("/:id/read", authorize("admin"), markAsRead);
router.put("/read-all", authorize("admin"), markAllAsRead);
router.delete("/:id", authorize("admin"), deleteNotification);

export default router;
