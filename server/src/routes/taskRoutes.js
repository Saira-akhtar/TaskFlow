// server/src/routes/taskRoutes.js

import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

// Create a task
router.post("/createTask", authMiddleware, createTask);

// Get tasks with optional filters
router.get("/getTasks", authMiddleware, getTasks);

// Get one task
router.get("/getTaskById/:id", authMiddleware, getTaskById);

// Update task/status/assignee
router.patch("/updateTask/:id", authMiddleware, updateTask);

// Delete task
router.delete("/deleteTask/:id", authMiddleware, deleteTask);

export default router;