import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import TaskForm from "../../components/ui/TaskForm";
import KanbanBoard from "../../components/ui/KanbanBoard";
import TaskFilters from "../../components/ui/TaskFilters";
import { useProjectById } from "../../hooks/useWorkspaceDetail";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../../hooks/useTasks";

// ---- Backend <-> Frontend value converters ----
const STATUS_TO_UI = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_progress", // board mein 3 hi columns hain
  COMPLETED: "completed",
};

const STATUS_TO_API = {
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
};

const priorityToUI = (p) =>
  p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : "Medium";

const priorityToAPI = (p) => (p ? p.toUpperCase() : undefined);

const toUITask = (t) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  status: STATUS_TO_UI[t.status] || "todo",
  priority: priorityToUI(t.priority),
  dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
  assignee: t.assignee || null, // populated object: { _id, name, email }
});
// -----------------------------------------------

const ProjectDetails = () => {
  const { id } = useParams();

  const { data: project, isLoading, error } = useProjectById(id);
  const workspaceId = project?.workspace?._id || project?.workspace;

  const { data: apiTasks = [], isLoading: tasksLoading } = useTasks(workspaceId, id);
  const { mutate: createTask, isPending: isSubmitting, error: createError } =
    useCreateTask(workspaceId, id);
  const { mutate: updateTask, error: updateError } = useUpdateTask(workspaceId, id);
  const { mutate: deleteTask, error: deleteError } = useDeleteTask(workspaceId, id);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const tasks = apiTasks.map(toUITask);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (taskId, newStatus) => {
    updateTask({ taskId, status: STATUS_TO_API[newStatus] });
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleCreateTask = (formData) => {
    const payload = {
      ...formData, // is mein assignee bhi shamil hai
      priority: priorityToAPI(formData.priority),
      status: STATUS_TO_API[formData.status] || "TODO", // FIX: "todo" -> "TODO"
      projectId: id,
      workspaceId,
    };

    // Khali values backend ko mat bhejo
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) delete payload[key];
    });

    createTask(payload, {
      onSuccess: () => setShowTaskForm(false),
    });
  };

  if (isLoading) {
    return <p className="text-center py-16 text-slate-400">Loading project...</p>;
  }

  if (error || !project) {
    return (
      <p className="text-center py-16 text-red-600">
        {error?.response?.data?.message || "Failed to load project"}
      </p>
    );
  }

  const actionError = createError || updateError || deleteError;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
          ← Back to Projects
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{project.description}</p>
            <p className="text-slate-400 text-xs mt-2">
              {project.workspace?.name && <>Workspace: {project.workspace.name} · </>}
              Status: {project.status || "-"} · Start:{" "}
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"} ·
              Deadline:{" "}
              {project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
            {showTaskForm ? "Cancel" : "+ Add Task"}
          </Button>
        </div>

        {actionError && (
          <p className="text-red-600 text-sm mb-4">
            {actionError.response?.data?.message || "Something went wrong"}
          </p>
        )}

        {showTaskForm && (
          <Card className="p-6 mb-8 max-w-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Task</h2>
            <TaskForm
              workspaceId={workspaceId}
              onSubmit={handleCreateTask}
              isLoading={isSubmitting}
            />
          </Card>
        )}

        <TaskFilters
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
          priority={priorityFilter}
          setPriority={setPriorityFilter}
        />

        {tasksLoading ? (
          <p className="text-center py-10 text-slate-400">Loading tasks...</p>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;