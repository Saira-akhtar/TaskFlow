import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  getProfileById,
  updateProfile,
  updateUserInfo,
  deleteProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get current logged-in user's profile
router.get("/me", getMyProfile);

// Update current logged-in user's profile
router.patch("/me", updateProfile);

// Update user's basic info (name)
router.patch("/me/user-info", updateUserInfo);

// Delete current logged-in user's profile
router.delete("/me", deleteProfile);

// Get another user's profile by ID
router.get("/:userId", getProfileById);

export default router;