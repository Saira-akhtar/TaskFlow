import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceById } from '../services/workspaceApi';
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
} from '../services/memberApi';
import { createProject, getProjects, getProjectById } from '../services/projectApi';

export const useWorkspaceDetail = (id) => {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => getWorkspaceById(id),
    enabled: !!id,
  });
};

export const useWorkspaceMembers = (workspaceId) => {
  return useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAddMember = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addWorkspaceMember({ workspaceId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
    },
  });
};

export const useRemoveMember = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => removeWorkspaceMember({ workspaceId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
    },
  });
};
export const useProjectById = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
};

// --- PROJECTS ---
export const useProjects = (workspaceId) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => getProjects(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useCreateProject = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectData) => createProject({ ...projectData, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};