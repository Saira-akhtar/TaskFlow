import api from "./api.js";

export const getTasks = async ({ workspaceId, projectId }) => {
  const res = await api.get("/tasks/getTasks", {
    params: { workspaceId, projectId },
  });
  return res.data.tasks;
};

export const createTask = async (data) => {
  const res = await api.post("/tasks/createTask", data);
  return res.data.task;
};

export const updateTask = async ({ taskId, ...data }) => {
  const res = await api.patch(`/tasks/updateTask/${taskId}`, data);
  return res.data.task;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/tasks/deleteTask/${taskId}`);
  return res.data;
};