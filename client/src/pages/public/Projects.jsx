import { useState } from "react";
import ProjectList from "../../components/ui/ProjectList";
import ProjectForm from "../../components/ui/ProjectForm";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useProjects } from "../../hooks/useWorkspaceDetail";
import { useWorkspaces } from "../../hooks/useWorkspace";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Projects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("all"); // Default "all" rakh sakte hain ya pehla workspace

  const { data: workspacesData } = useWorkspaces();
  const workspaces = Array.isArray(workspacesData)
    ? workspacesData
    : workspacesData?.workspaces || [];

  const activeWorkspaceId = selectedWorkspaceId || workspaces[0]?._id || "";

  
  const fetchAllProjects = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
     
      const promises = workspaces.map(async (ws) => {
        const wsId = ws._id || ws.id;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/projects/getProjects?workspaceId=${wsId}`,
          { headers },
        );
        const resData = res.data;
        let projs = [];
        if (resData && Array.isArray(resData.projects))
          projs = resData.projects;
        else if (Array.isArray(resData)) projs = resData;
       
        return projs.map((p) => ({ ...p, workspaceName: ws.name }));
      });

      const results = await Promise.all(promises);
      return results.flat(); 
    } catch (err) {
      console.error("Error fetching all projects:", err);
      return [];
    }
  };

  
  const { data: singleWsProjects = [], isLoading: singleLoading } = useProjects(
    activeWorkspaceId !== "all" ? activeWorkspaceId : null,
  );

  const { data: allWsProjects = [], isLoading: allLoading } = useQuery({
    queryKey: ["allWorkspacesProjects", workspaces.map((w) => w._id)],
    queryFn: fetchAllProjects,
    enabled: activeWorkspaceId === "all" && workspaces.length > 0,
  });

  const projects =
    activeWorkspaceId === "all" ? allWsProjects : singleWsProjects;
  const isLoading = activeWorkspaceId === "all" ? allLoading : singleLoading;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All Projects</h1>
            <p className="text-slate-500 mt-1">
              Manage tasks and track project milestones across teams.
            </p>
          </div>

          <div className="flex items-center gap-3">
           
            {workspaces.length > 0 && (
              <select
                value={activeWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">📁 All Workspaces</option>
                {workspaces.map((ws) => (
                  <option key={ws._id} value={ws._id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="primary"
              size="md"
              disabled={!activeWorkspaceId || activeWorkspaceId === "all"}
              onClick={() => setShowCreateModal(!showCreateModal)}
            >
              {showCreateModal ? "Cancel" : "+ New Project"}
            </Button>
          </div>
        </div>

        {showCreateModal && activeWorkspaceId !== "all" && (
          <Card className="p-6 mb-8 max-w-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Create New Project
            </h2>
            <ProjectForm
              workspaceId={activeWorkspaceId}
              onSuccess={() => setShowCreateModal(false)}
            />
          </Card>
        )}

        {isLoading ? (
          <p className="text-center py-16 text-slate-400">
            Loading projects...
          </p>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </div>
  );
};

export default Projects;
