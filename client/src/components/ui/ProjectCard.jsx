import { Link } from "react-router-dom";

const statusColors = {
  active: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
  "in progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
  "on hold": "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
  "not started": "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
};

const defaultStatusColor =
  "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200";

const ProjectCard = ({ project }) => {
  const {
    _id: id,
    name,
    description,
    status = "active",
    taskCount,
    tasks = [],
  } = project;

  // Task count calculate karne ke liye (chahe backend se taskCount aaye ya tasks array)
  const totalTasks = taskCount ?? tasks.length ?? 0;

  // Agar tasks maujood hain aur sab ke sab completed hain, to status automatically "completed" dikhaye ga
  const allTasksCompleted =
    tasks.length > 0 &&
    tasks.every((t) => t.status === "completed" || t.status === "COMPLETED");
  const currentStatus = allTasksCompleted ? "completed" : status;

  return (
    <Link to={`/projects/${id}`}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {name}
          </h3>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              statusColors[currentStatus?.toLowerCase()] || defaultStatusColor
            }`}
          >
            {currentStatus}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-300 mb-4 line-clamp-2 flex-1">
          {description || "No description provided."}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-700">
          <span>
            📁 {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            View Kanban →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;