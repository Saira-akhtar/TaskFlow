import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTaskComments,
  createComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Get all comments of a task
router.get("/tasks/:taskId/comments", authMiddleware, getTaskComments);

// Create a comment
router.post("/tasks/:taskId/comments", authMiddleware, createComment);

// Delete a comment (by comment ID)
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;