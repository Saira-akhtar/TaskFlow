import Project from "../models/projectModel.js";
import WorkspaceMember from "../models/workspaceMember.js";
import Workspace from "../models/workspaceModel.js";
import Task from "../models/taskModel.js";

// ==========================================
// CREATE PROJECT
// POST /api/projects
// ==========================================
export const createProject = async (req, res) => {
  try {
    const { workspaceId, name, description, startDate, deadline, members } = req.body;

    if (!workspaceId || !name) {
      return res.status(400).json({ message: "Workspace ID and project name are required" });
    }

    // 1. Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // 2. Check membership of logged-in user
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    // Owner or Admin can create projects
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return res.status(403).json({
        message: "Only Owner or Admin can create a project",
      });
    }

    // 3. Create the project
    const project = await Project.create({
      workspace: workspaceId,
      name,
      description,
      startDate,
      deadline,
      members: members || [],
      createdBy: loggedInUserId,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL PROJECTS IN A WORKSPACE
// GET /api/projects?workspaceId=xxx
// ==========================================
export const getProjects = async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const loggedInUserId = req.userId || (req.user && req.user._id);

    // 1. Check if user is a member of the workspace
    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // 2. Fetch projects based on role
    let query = { workspace: workspaceId };

   

    const projectsList = await Project.find(query)
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Attach task count and auto-complete status based on tasks
    const projects = await Promise.all(
      projectsList.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const taskCount = tasks.length;

        const allCompleted = taskCount > 0 && tasks.every(
          (t) => t.status === "COMPLETED" || t.status === "completed"
        );

        return {
          ...project,
          taskCount,
          tasks,
          status: allCompleted ? "completed" : project.status,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// GET SINGLE PROJECT BY ID
// GET /api/projects/:id
// ==========================================
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const project = await Project.findById(id)
      .populate("workspace", "name")
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check workspace membership
    const membership = await WorkspaceMember.findOne({
      workspace: project.workspace._id,
      user: loggedInUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// UPDATE PROJECT
// PATCH /api/projects/:id
// ==========================================
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, deadline, members } = req.body;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 1. Check workspace membership & role
    const membership = await WorkspaceMember.findOne({
      workspace: project.workspace,
      user: loggedInUserId,
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return res.status(403).json({
        message: "Only Owner or Admin can update a project",
      });
    }

    // 2. Update fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline;
    if (members !== undefined) project.members = members;

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// DELETE PROJECT
// DELETE /api/projects/:id
// ==========================================
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.userId || (req.user && req.user._id);

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check workspace membership & role (Owner can delete)
    const membership = await WorkspaceMember.findOne({
      workspace: project.workspace,
      user: loggedInUserId,
    });

    if (!membership || membership.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can delete a project",
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};