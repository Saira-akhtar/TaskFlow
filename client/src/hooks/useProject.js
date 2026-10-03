import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../services/projectApi";

export const useCreateProject = (workspaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData) => createProject({ ...projectData, workspace: workspaceId }),
    onSuccess: () => {
      // Invalidate project list query so it fetches fresh data automatically
      queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};