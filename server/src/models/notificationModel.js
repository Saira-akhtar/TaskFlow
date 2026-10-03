import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User who will receive the notification (Required)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
      index: true,
    },

    // Type of notification (categorizes why it was sent)
    type: {
      type: String,
      required: true,
      enum: {
        values: [
          "TASK_ASSIGNED",      // Task assigned to user
          "TASK_STATUS_CHANGED", // Task status updated (Kanban move)
          "COMMENT_ADDED",       // Someone commented on assigned task
          "PROJECT_CREATED",     // New project created in workspace
          "MEMBER_ADDED",        // New member joined workspace
          "MEMBER_REMOVED",      // Member removed from workspace
          "PROJECT_DEADLINE_SOON"// Project deadline approaching
        ],
        message:
          "{VALUE} is not a valid notification type",
      },
    },

    // Human-readable message shown to user
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [200, "Message cannot exceed 200 characters"],
    },

    // Reference to related task (optional - not all notifications have tasks)
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // Reference to related project (optional)
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    // Has user read this notification?
    isRead: {
      type: Boolean,
      default: false, // New notifications are unread by default
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries (Section 9.8 requirements)
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;