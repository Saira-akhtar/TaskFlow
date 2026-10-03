import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Task to which this comment belongs (Required)
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
      index: true,
    },

    // User who wrote the comment (Required)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    // Comment text content
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

// Compound index: Quickly fetch all comments of a task, sorted by newest first
commentSchema.index({ task: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;