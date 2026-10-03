import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import WorkspaceMember from "../models/workspaceMember.js";
import { createNotification } from "./notificationController.js";

// ==========================================
// CREATE TASK
// POST /api/tasks
// ==========================================
export const createTask = async (req, res) => {
  try {
    const {
      projectId,
      workspaceId,
      title,
      description,
      priority,
      status,
      assignee,
      dueDate,
    } = req.body;

    if (!projectId || !workspaceId || !title) {
      return res.status(400).json({
        message: "Project ID, workspace ID, and title are required",
      });
    }

    const loggedInUserId = req.userId || (req.user && req.user._id);

    // 1. Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2. Check workspace membership & role
    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return res.status(403).json({
        message: "Only Owner or Admin can create tasks",
      });
    }

    // 3. Assignee must be a member of this workspace
    const assigneeId = assignee || undefined; // "" ko undefined bana do
    if (assigneeId) {
      const assigneeMember = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: assigneeId,
      });

      if (!assigneeMember) {
        return res.status(400).json({
          message: "Assignee must be a member of this workspace",
        });
      }
    }

    // 4. Create the task
    const task = await Task.create({
      project: projectId,
      workspace: workspaceId,
      title,
      description,
      priority,
      status,
      assignee: assigneeId,
      dueDate,
      createdBy: loggedInUserId,
    });

    // 🔔 Notify the assignee (agar khud ko assign nahi kiya)
    if (assigneeId && assigneeId.toString() !== loggedInUserId.toString()) {
      await createNotification({
        recipient: assigneeId,
        type: "TASK_ASSIGNED",
        message: `You were assigned a task: "${String(title).slice(0, 100)}"`,
        relatedTask: task._id,
        relatedProject: projectId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL TASKS (with filters & search)
// GET /api/tasks?workspaceId=xxx&projectId=xxx&status=TODO&priority=HIGH
// ==========================================
export const getTasks = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);
    const { workspaceId, projectId, status, priority, assignee, search } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    // 1. Check workspace membership
    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // 2. Build dynamic query
    let query = { workspace: workspaceId };

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;

    // 3. Search by title (Section 9.9)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// GET SINGLE TASK BY ID
// GET /api/tasks/:id
// ==========================================
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const task = await Task.findById(id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name status")
      .populate("workspace", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check workspace membership
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace._id,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// UPDATE TASK (Kanban drag-drop, edit details)
// PATCH /api/tasks/:id
// ==========================================
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee, dueDate } = req.body;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 1. Check workspace membership & role
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // 2. Permission logic:
    // Owner/Admin can update anything
    // Member can only update status if assigned to them, or edit description
    const isOwnerOrAdmin = membership.role === "owner" || membership.role === "admin";
    const isAssignee = task.assignee && task.assignee.toString() === loggedInUserId.toString();

    if (!isOwnerOrAdmin && !isAssignee) {
      return res.status(403).json({
        message: "You can only update tasks assigned to you",
      });
    }

    // Members can't change priority or assignee
    if (!isOwnerOrAdmin) {
      if (priority !== undefined || assignee !== undefined || title !== undefined) {
        return res.status(403).json({
          message: "Members cannot change priority, assignee, or title",
        });
      }
    }

    // 3. New assignee must be a member of this workspace
    const previousAssignee = task.assignee ? task.assignee.toString() : null;

    if (assignee) {
      const assigneeMember = await WorkspaceMember.findOne({
        workspace: task.workspace,
        user: assignee,
      });

      if (!assigneeMember) {
        return res.status(400).json({
          message: "Assignee must be a member of this workspace",
        });
      }
    }

    // 4. Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null; // "" = unassign
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    // 🔔 Notify the new assignee (sirf jab assignee badla ho)
    if (
      assignee &&
      assignee.toString() !== previousAssignee &&
      assignee.toString() !== loggedInUserId.toString()
    ) {
      await createNotification({
        recipient: assignee,
        type: "TASK_ASSIGNED",
        message: `You were assigned a task: "${String(task.title).slice(0, 100)}"`,
        relatedTask: task._id,
        relatedProject: task.project,
      });
    }

    const updatedTask = await Task.findById(id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// DELETE TASK
// DELETE /api/tasks/:id
// ==========================================
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only Owner or Admin can delete
    const membership = await WorkspaceMember.findOne({
      workspace: task.workspace,
      user: loggedInUserId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return res.status(403).json({
        message: "Only Owner or Admin can delete tasks",
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};