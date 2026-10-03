import api from './api.js';

export const getWorkspaceMembers = async (workspaceId) => {
  const res = await api.get('/members/getWorkspaceMembers', {
    params: { workspaceId },
  });
  return res.data;
};

export const addWorkspaceMember = async ({ workspaceId, email, role }) => {
  const res = await api.post('/members/addWorkspaceMember', { workspaceId, email, role });
  return res.data;
};

export const removeWorkspaceMember = async ({ workspaceId, memberId }) => {
  const res = await api.delete(`/members/removeWorkspaceMember/${memberId}`, {
    data: { workspaceId },
  });
  return res.data;
};