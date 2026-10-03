import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // Task belongs to a Project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },

    // Task belongs to a Workspace (helps in faster workspace-level queries)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
      index: true,
    },

    // Task Title
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },

    // Task Description (Optional details)
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Task Status (Kanban columns)
    status: {
      type: String,
      enum: {
        values: ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"],
        message: "{VALUE} is not a valid task status",
      },
      default: "TODO",
    },

    // Task Priority
    priority: {
      type: String,
      enum: {
        values: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        message: "{VALUE} is not a valid priority",
      },
      default: "MEDIUM",
    },

    // Task Assignee (Single user to whom task is assigned)
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Due Date
    dueDate: {
      type: Date,
      default: null,
    },

    // User who created the task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster filtering (Section 9.9: Search and Filters)
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ workspace: 1, priority: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;