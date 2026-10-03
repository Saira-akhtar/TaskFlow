import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import Card from "../../components/ui/Card";

const API = "http://localhost:3000/api";

const Home = () => {
  const { user } = useAuthStore();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Fetch ALL workspaces of the logged-in user
  const fetchWorkspaces = async () => {
    if (!token) return [];
    try {
      const response = await axios.get(`${API}/workspaces/getWorkspaces`, {
        headers,
      });
      const resData = response.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData.workspaces)) return resData.workspaces;
      if (Array.isArray(resData.data)) return resData.data;
      if (Array.isArray(resData.data?.workspaces))
        return resData.data.workspaces;
      return [];
    } catch (err) {
      console.error(
        "Error fetching workspaces:",
        err.response?.data || err.message,
      );
      return [];
    }
  };

  const { data: workspaces = [], isLoading: workspacesLoading } = useQuery({
    queryKey: ["homeWorkspaces"],
    queryFn: fetchWorkspaces,
    enabled: !!token,
  });

  // IDs of every workspace (not just the first one)
  const workspaceIds = workspaces.map((w) => w?._id || w?.id).filter(Boolean);
  const workspaceKey = workspaceIds.join(",");

  // Remove duplicates by _id
  const uniqueById = (items) => {
    const map = new Map();
    items.forEach((item) => {
      if (item?._id) map.set(item._id, item);
    });
    return Array.from(map.values());
  };

  // 2. Fetch projects of ALL workspaces
  const fetchProjects = async () => {
    if (!token || workspaceIds.length === 0) return [];
    const results = await Promise.all(
      workspaceIds.map(async (id) => {
        try {
          const response = await axios.get(
            `${API}/projects/getProjects?workspaceId=${id}`,
            { headers },
          );
          const resData = response.data;
          if (resData && Array.isArray(resData.projects))
            return resData.projects;
          if (Array.isArray(resData)) return resData;
          return [];
        } catch (err) {
          console.error(
            "Error fetching projects:",
            err.response?.data || err.message,
          );
          return [];
        }
      }),
    );
    return uniqueById(results.flat());
  };

  // 3. Fetch tasks of ALL workspaces
  const fetchTasks = async () => {
    if (!token || workspaceIds.length === 0) return [];
    const results = await Promise.all(
      workspaceIds.map(async (id) => {
        try {
          const response = await axios.get(
            `${API}/tasks/getTasks?workspaceId=${id}`,
            { headers },
          );
          const resData = response.data;
          if (Array.isArray(resData)) return resData;
          if (Array.isArray(resData.tasks)) return resData.tasks;
          if (Array.isArray(resData.data)) return resData.data;
          return [];
        } catch (err) {
          console.error(
            "Error fetching tasks:",
            err.response?.data || err.message,
          );
          return [];
        }
      }),
    );
    return uniqueById(results.flat());
  };

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["homeProjects", workspaceKey],
    queryFn: fetchProjects,
    enabled: !!token && workspaceIds.length > 0,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["homeTasks", workspaceKey],
    queryFn: fetchTasks,
    enabled: !!token && workspaceIds.length > 0,
  });

  // Calculate stats safely
  const totalProjects = Array.isArray(projects) ? projects.length : 0;
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

  const completedProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        const s = p?.status?.toLowerCase();
        return s === "completed" || s === "done";
      }).length
    : 0;

  const inProgressProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        const s = p?.status?.toLowerCase();
        return s === "active" || s === "in-progress" || s === "in_progress";
      }).length
    : 0;

  const overdueProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        if (!p?.deadline) return false;
        const deadlineDate = new Date(p.deadline);
        return (
          deadlineDate < new Date() && p?.status?.toLowerCase() !== "completed"
        );
      }).length
    : 0;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      color:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    },
    {
      label: "Completed Projects",
      value: completedProjects,
      color:
        "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "In Progress Projects",
      value: inProgressProjects,
      color:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    },
    {
      label: "Overdue",
      value: overdueProjects,
      color: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    },
  ];

  const isLoading = workspacesLoading || projectsLoading || tasksLoading;

  // Upcoming deadlines: projects with a deadline, nearest first
  const upcomingProjects = Array.isArray(projects)
    ? [...projects]
        .filter((p) => p?.deadline && p?.status?.toLowerCase() !== "completed")
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3)
    : [];

  // If no project has a deadline, still show the first 3 projects
  const deadlineList =
    upcomingProjects.length > 0
      ? upcomingProjects
      : Array.isArray(projects)
        ? projects.slice(0, 3)
        : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/workspaces"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            + New Workspace
          </Link>
          <Link
            to="/projects"
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
          >
            + New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <div
                className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold mb-2 ${stat.color}`}
              >
                {stat.label}
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {isLoading ? (
                  <span className="inline-block animate-pulse text-slate-300 dark:text-slate-600">
                    ...
                  </span>
                ) : (
                  stat.value
                )}
              </p>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Upcoming Deadlines
              </h2>
              <Link
                to="/projects"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {deadlineList.map((proj) => (
                <div
                  key={proj?._id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {proj?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {proj?.description
                        ? proj.description.substring(0, 40) + "..."
                        : "Project"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                    {proj?.deadline
                      ? new Date(proj.deadline).toLocaleDateString()
                      : "No Deadline"}
                  </span>
                </div>
              ))}
              {deadlineList.length === 0 && !isLoading && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No projects found.
                </p>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Recent Activity
            </h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Dashboard synced successfully.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Just now
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
