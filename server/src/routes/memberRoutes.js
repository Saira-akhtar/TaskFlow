import express from "express";
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
} from "../controllers/memberController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireWorkspaceRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ workspaceId comes from BODY now
router.post("/addWorkspaceMember", authMiddleware, requireWorkspaceRole("owner"), addWorkspaceMember);
router.get("/getWorkspaceMembers", authMiddleware, requireWorkspaceRole("owner", "admin","member"), getWorkspaceMembers);
router.patch("/updateMemberRole/:memberId", authMiddleware, requireWorkspaceRole("owner"), updateMemberRole);
router.delete("/removeWorkspaceMember/:memberId", authMiddleware, requireWorkspaceRole("owner"), removeWorkspaceMember);

export default router;