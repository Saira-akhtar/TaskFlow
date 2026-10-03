import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for logged-in user (with optional isRead filter)
router.get("/", authMiddleware, getNotifications);

// Mark single notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read (Section 9.8 requirement)
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete a specific notification
router.delete("/:id", authMiddleware, deleteNotification);

export default router;