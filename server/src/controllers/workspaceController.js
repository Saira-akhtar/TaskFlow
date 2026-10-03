import Workspace from "../models/workspaceModel.js";
import WorkspaceMember from "../models/workspaceMember.js";
import User from "../models/userModel.js";

// ==========================================
// Create Workspace
// ==========================================
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if workspace name is provided
    if (!name) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    // Create a new workspace
    const workspace = await Workspace.create({
      name,
      description,
      owner: req.userId,
    });

    // ✅ Creator ko AUTOMATICALLY owner ke roop mein WorkspaceMember mein save karo
    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.userId,
      role: "owner",
    });

    // Send success response
    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (err) {
    console.log(err);

    // Send error response
    res.status(500).json({
      message: "Failed to create workspace",
      error: err.message,
    });
  }
};


// ==========================================
// Get all workspaces of logged-in user
// ==========================================
const getWorkspaces = async (req, res) => {
  try {
    // ✅ Sirf woh workspaces jahan logged-in user member hai
    const memberships = await WorkspaceMember.find({
      user: req.userId,
    });

    const workspaceIds = memberships.map((m) => m.workspace);

    const workspaces = await Workspace.find({
      _id: { $in: workspaceIds },
    }).sort({ createdAt: -1 });

    // Send workspaces in response
    res.status(200).json({
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (err) {
    console.log(err);

    // Send error response
    res.status(500).json({
      message: "Failed to fetch workspaces",
      error: err.message,
    });
  }
};


// ==========================================
// Get single workspace
// ==========================================
const getWorkspaceById = async (req, res) => {
  try {
    // Get workspace ID from URL
    const { id } = req.params;

    // ✅ Check if logged-in user is member of this workspace
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.userId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Find workspace
    const workspace = await Workspace.findById(id);

    // Check if workspace exists
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Send workspace in response
    res.status(200).json({
      message: "Workspace fetched successfully",
      workspace,
    });
  } catch (err) {
    console.log(err);

    // Send error response
    res.status(500).json({
      message: "Failed to fetch workspace",
      error: err.message,
    });
  }
};


// ==========================================
// Update Workspace
// ==========================================
const updateWorkspace = async (req, res) => {
  try {
    // Get workspace ID from URL
    const { id } = req.params;

    // ✅ Sirf owner update kar sakta hai
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.userId,
    });

    if (!membership || membership.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can update workspace",
      });
    }

    // Get updated data from request body
    const { name, description } = req.body;

    // Find workspace
    const workspace = await Workspace.findById(id);

    // Check if workspace exists
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Update workspace name if provided
    if (name !== undefined) {
      workspace.name = name;
    }

    // Update workspace description if provided
    if (description !== undefined) {
      workspace.description = description;
    }

    // Save updated workspace
    await workspace.save();

    // Send updated workspace in response
    res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (err) {
    console.log(err);

    // Send error response
    res.status(500).json({
      message: "Failed to update workspace",
      error: err.message,
    });
  }
};


// ==========================================
// Delete Workspace
// ==========================================
const deleteWorkspace = async (req, res) => {
  try {
    // Get workspace ID from URL
    const { id } = req.params;

    // ✅ Sirf owner delete kar sakta hai
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.userId,
    });

    if (!membership || membership.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can delete workspace",
      });
    }

    // Find workspace
    const workspace = await Workspace.findById(id);

    // Check if workspace exists
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // ✅ Workspace ke saath saare members bhi delete karo
    await WorkspaceMember.deleteMany({ workspace: id });

    // Delete workspace
    await Workspace.findByIdAndDelete(id);

    // Send success response
    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (err) {
    console.log(err);

    // Send error response
    res.status(500).json({
      message: "Failed to delete workspace",
      error: err.message,
    });
  }
};


// Export workspace controller functions
export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};