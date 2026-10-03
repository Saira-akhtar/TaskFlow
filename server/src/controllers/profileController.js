import Profile from "../models/profileModel.js";
import User from "../models/userModel.js";
import WorkspaceMember from "../models/workspaceMember.js";
import Task from "../models/taskModel.js";

// ==========================================
// GET CURRENT USER PROFILE
// GET /api/profile/me
// ==========================================
export const getMyProfile = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);

    // Find user basic info
    const user = await User.findById(loggedInUserId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find profile (or create if doesn't exist)
    let profile = await Profile.findOne({ user: loggedInUserId });

    if (!profile) {
      // Auto-create empty profile on first access
      profile = await Profile.create({ user: loggedInUserId });
    }

    // Get user's workspaces (where they are a member)
    const memberships = await WorkspaceMember.find({
      user: loggedInUserId,
    }).populate("workspace", "name description");

    // Get user's assigned tasks (where assignee = loggedIn user)
    const assignedTasks = await Task.find({
      assignee: loggedInUserId,
    })
      .populate("project", "name")
      .select("title status priority dueDate project")
      .sort({ dueDate: 1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
      workspaces: memberships.map((m) => ({
        ...m.workspace._doc,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      assignedTasks,
      stats: {
        totalWorkspaces: memberships.length,
        totalAssignedTasks: assignedTasks.length,
      },
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET PROFILE BY USER ID
// GET /api/profile/:userId
// ==========================================
export const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get profile by ID error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// UPDATE PROFILE
// PATCH /api/profile/me
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const loggedInUserId =
      req.userId || (req.user && req.user._id);

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      name,
      email,
      bio,
      jobTitle,
      department,
      phone,
      location,
      avatar,
      socialLinks,
      skills,
      theme,
    } = req.body;

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findById(loggedInUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // Update User Information
    // ==========================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      user.email = email.trim().toLowerCase();
    }

    await user.save();

    // ==========================================
    // Validate Theme
    // ==========================================

    if (
      theme !== undefined &&
      !["light", "dark", "system"].includes(theme)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme. Use light, dark, or system.",
      });
    }

    // ==========================================
    // Find Profile or Create
    // ==========================================

    let profile = await Profile.findOne({
      user: loggedInUserId,
    });

    if (!profile) {
      profile = new Profile({
        user: loggedInUserId,
      });
    }

    // ==========================================
    // Update Profile Fields
    // ==========================================

    if (bio !== undefined) {
      profile.bio = bio;
    }

    if (jobTitle !== undefined) {
      profile.jobTitle = jobTitle;
    }

    if (department !== undefined) {
      profile.department = department;
    }

    if (phone !== undefined) {
      profile.phone = phone;
    }

    if (location !== undefined) {
      profile.location = location;
    }

    if (avatar !== undefined) {
      profile.avatar = avatar;
    }

    // ==========================================
    // Update Theme
    // ==========================================

    if (theme !== undefined) {
      profile.theme = theme;
    }

    // ==========================================
    // Update Social Links
    // ==========================================

    if (socialLinks !== undefined) {
      profile.socialLinks = {
        github:
          socialLinks.github ??
          profile.socialLinks?.github ??
          "",

        linkedin:
          socialLinks.linkedin ??
          profile.socialLinks?.linkedin ??
          "",

        twitter:
          socialLinks.twitter ??
          profile.socialLinks?.twitter ??
          "",

        website:
          socialLinks.website ??
          profile.socialLinks?.website ??
          "",
      };
    }

    // ==========================================
    // Update Skills
    // ==========================================

    if (
      skills !== undefined &&
      Array.isArray(skills)
    ) {
      profile.skills = skills;
    }

    // ==========================================
    // Save Profile
    // ==========================================

    await profile.save();

    // ==========================================
    // Return Updated Data
    // ==========================================

    const updatedUser = await User.findById(
      loggedInUserId
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: updatedUser,

      profile,
    });

  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    // Duplicate email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE USER BASIC INFO (name)
// PATCH /api/profile/me/user-info
// ==========================================
export const updateUserInfo = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      loggedInUserId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User info updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user info error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE PROFILE (Rarely used)
// DELETE /api/profile/me
// ==========================================
export const deleteProfile = async (req, res) => {
  try {
    const loggedInUserId = req.userId || (req.user && req.user._id);

    await Profile.findOneAndDelete({ user: loggedInUserId });

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};