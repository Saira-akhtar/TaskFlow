import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();

router.post("/createWorkspace", authMiddleware, createWorkspace);
router.get("/getWorkspaces", authMiddleware, getWorkspaces);
router.get("/getWorkspaceById/:id", authMiddleware, getWorkspaceById);
router.put("/updateWorkspace/:id", authMiddleware, updateWorkspace);
router.delete("/deleteWorkspace/:id", authMiddleware, deleteWorkspace);

export default router;  