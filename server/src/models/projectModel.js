import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    // Associated Workspace (A project must belong to a workspace)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
      index: true,
    },

    // Project Name
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    // Project Description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Project Status
    status: {
      type: String,
      enum: {
        values: ["PLANNING", "ACTIVE", "COMPLETED", "ON_HOLD"],
        message: "{VALUE} is not a valid project status",
      },
      default: "ACTIVE",
    },

    // Timeline Dates
    startDate: {
      type: Date,
      default: Date.now,
    },

    deadline: {
      type: Date,
      default: null,
    },

    // Assigned Team Members for this specific project
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // User who created the project
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project creator is required"],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index to search projects quickly within a workspace
projectSchema.index({ workspace: 1, status: 1 });
projectSchema.index({ workspace: 1, name: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;