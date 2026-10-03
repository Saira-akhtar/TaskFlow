import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "../services/taskApi";

export const useTasks = (workspaceId, projectId) => {
  return useQuery({
    queryKey: ["tasks", workspaceId, projectId],
    queryFn: () => getTasks({ workspaceId, projectId }),
    enabled: !!workspaceId && !!projectId,
  });
};

export const useCreateTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId, projectId] });
    },
  });
};

export const useUpdateTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId, projectId] });
    },
  });
};

export const useDeleteTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId, projectId] });
    },
  });
};