import Comment from "../models/commentModel.js";
import Task from "../models/taskModel.js";
import WorkspaceMember from "../models/workspaceMember.js";

// ==========================================
// GET ALL COMMENTS FOR A TASK
// GET /api/tasks/:taskId/comments
// ==========================================
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    // 1. Find the task to get the workspace ID for permission check
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Check workspace membership (Section 9.7: "Authenticated project members can comment")
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // 3. Fetch comments (newest first, with author details populated)
    const comments = await Comment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get task comments error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// CREATE A NEW COMMENT
// POST /api/tasks/:taskId/comments
// ==========================================
export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // 1. Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Check workspace membership
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You must be a workspace member to comment",
      });
    }

    // 3. Create the comment
    const comment = await Comment.create({
      task: taskId,
      user: loggedInUserId,
      text,
    });

    // Populate user details for the response
    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE COMMENT
// DELETE /api/comments/:id
// ==========================================
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find task to get workspace for permission check
    const task = await Task.findById(comment.task);
    if (!task) {
      return res.status(404).json({ message: "Associated task not found" });
    }

    // Get user membership in workspace
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    
    const isAuthor = comment.user.toString() === loggedInUserId.toString();
    const isOwner = membership.role === "owner";

    if (!isAuthor && !isOwner) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};