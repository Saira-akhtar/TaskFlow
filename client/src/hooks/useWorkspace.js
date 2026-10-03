import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, createWorkspace } from '../services/workspaceApi';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      // Workspace create hone ke baad list ko fresh karo
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};