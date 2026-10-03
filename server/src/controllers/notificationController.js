import Notification from "../models/notificationModel.js";
import WorkspaceMember from "../models/workspaceMember.js";

// ==========================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// GET /api/notifications
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);
    const { isRead } = req.query; // Optional filter: ?isRead=true or ?isRead=false

    let query = { recipient: loggedInUserId };

    if (isRead !== undefined) {
      query.isRead = isRead === "true"; // Convert string to boolean
    }

    const notifications = await Notification.find(query)
      .populate("relatedTask", "title status")
      .populate("relatedProject", "name")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    // Count unread notifications (Section 9.8: "Unread count")
    const unreadCount = await Notification.countDocuments({
      recipient: loggedInUserId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ==========================================
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only recipient can mark their own notifications as read
    if (notification.recipient.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        message: "You can only read your own notifications",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ (Section 9.8)
// PATCH /api/notifications/read-all
// ==========================================
export const markAllAsRead = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const result = await Notification.updateMany(
      { recipient: loggedInUserId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE A NOTIFICATION (Optional - cleanup)
// DELETE /api/notifications/:id
// ==========================================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only recipient can delete
    if (notification.recipient.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own notifications",
      });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// HELPER FUNCTION: CREATE NOTIFICATION
// Call this from other controllers (taskController, commentController, etc.)
// This is not an API route but a utility function
// ==========================================
export const createNotification = async ({
  recipient,
  type,
  message,
  relatedTask = null,
  relatedProject = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      message,
      relatedTask,
      relatedProject,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};