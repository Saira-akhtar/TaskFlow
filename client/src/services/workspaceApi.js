import api from './api.js';

export const createWorkspace = async (data) => {
  const res = await api.post('/workspaces/createWorkspace', data);
  return res.data;
};

export const getWorkspaces = async () => {
  const res = await api.get('/workspaces/getWorkspaces');
  return res.data;
};

export const getWorkspaceById = async (id) => {
  const res = await api.get(`/workspaces/getWorkspaceById/${id}`);
  return res.data;
};