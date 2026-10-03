import WorkspaceMember from "../models/workspaceMember.js";
import WorkspaceModel from "../models/workspaceModel.js";
import User from "../models/userModel.js";
import { createNotification } from "./notificationController.js";

// ==========================================
// GET ALL MEMBERS OF A WORKSPACE
// ==========================================
export const getWorkspaceMembers = async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || req.params.id;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const members = await WorkspaceMember.find({ workspace: workspaceId })
      .populate("user", "name email")
      .sort({ joinedAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get workspace members error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// ADD MEMBER TO WORKSPACE
// ==========================================
export const addWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = req.body.workspaceId || req.params.id;
    const { email, role = "member" } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const loggedInUserId = req.userId || (req.user && req.user._id);

    // Check logged-in user's membership
    const currentMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!currentMember || currentMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can add members",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: user._id,
    });

    if (existingMember) {
      return res.status(409).json({
        message: "User is already a member of this workspace",
      });
    }

    if (role === "owner") {
      return res.status(400).json({
        message: "Owner role cannot be assigned when adding a member",
      });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const member = await WorkspaceMember.create({
      workspace: workspaceId,
      user: user._id,
      role,
    });

    const populatedMember = await WorkspaceMember.findById(member._id).populate(
      "user",
      "name email"
    );

    // 🔔 Notify the added user
    const owner = await User.findById(loggedInUserId).select("name");
    await createNotification({
      recipient: user._id, // the person being added
      type: "MEMBER_ADDED",
      message: `${owner?.name || "Someone"} added you to the workspace "${workspace.name}" as ${role}`,
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: populatedMember,
    });
  } catch (error) {
    console.error("Add workspace member error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// UPDATE MEMBER ROLE
// ==========================================
export const updateMemberRole = async (req, res) => {
  try {
    const workspaceId = req.body.workspaceId || req.params.id;
    const { memberId } = req.params;
    const { role } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or member" });
    }

    const loggedInUserId = req.userId || (req.user && req.user._id);

    const currentMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!currentMember || currentMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can change member roles",
      });
    }

    const member = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: workspaceId,
    });

    if (!member) {
      return res.status(404).json({ message: "Workspace member not found" });
    }

    if (member.role === "owner") {
      return res.status(403).json({
        message: "Workspace owner role cannot be changed",
      });
    }

    member.role = role;
    await member.save();

    const updatedMember = await WorkspaceMember.findById(member._id).populate(
      "user",
      "name email"
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// REMOVE MEMBER
// ==========================================
export const removeWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = req.body.workspaceId || req.params.id;
    const { memberId } = req.params;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const loggedInUserId = req.userId || (req.user && req.user._id);

    const currentMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!currentMember || currentMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can remove members",
      });
    }

    const member = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: workspaceId,
    });

    if (!member) {
      return res.status(404).json({ message: "Workspace member not found" });
    }

    if (member.role === "owner") {
      return res.status(403).json({
        message: "Workspace owner cannot be removed",
      });
    }

    // Save these before deleting
    const removedUserId = member.user;
    const workspace = await WorkspaceModel.findById(workspaceId);

    await member.deleteOne();

    // 🔔 Notify the removed user
    await createNotification({
      recipient: removedUserId,
      type: "MEMBER_REMOVED",
      message: `You were removed from the workspace "${workspace?.name || "a workspace"}"`,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove workspace member error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};