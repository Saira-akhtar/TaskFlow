import api from "./api"; // Your configured Axios instance

// Create a new project inside a workspace
export const createProject = async (projectData) => {
  const response = await api.post("/projects/createProject", projectData);
  return response.data;
};
export const getProjects = async (workspaceId) => {
  const response = await api.get("/projects/getProjects", {
    params: { workspaceId },
  });
  return response.data.projects;
};
export const getProjectById = async (id) => {
  const response = await api.get(`/projects/getProjectById/${id}`);
  return response.data.project;
};