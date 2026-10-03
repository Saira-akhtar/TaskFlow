import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/createProject", authMiddleware, createProject);
router.get("/getProjects", authMiddleware, getProjects);
router.get("/getProjectById/:id", authMiddleware, getProjectById);
router.patch("/updateProject/:id", authMiddleware, updateProject);
router.delete("/deleteProject/:id", authMiddleware, deleteProject);     

export default router;