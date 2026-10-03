import WorkspaceMember from "../models/workspaceMember.js";

export const requireWorkspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // URL params, body, ya query string, teeno se workspaceId lo
      const workspaceId =
        req.params?.id || req.body?.workspaceId || req.query?.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          message: "Workspace ID is required",
        });
      }

      const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.userId,
      });

      if (!membership) {
        return res.status(403).json({
          message: "You are not a member of this workspace",
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      req.workspaceMember = membership;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};