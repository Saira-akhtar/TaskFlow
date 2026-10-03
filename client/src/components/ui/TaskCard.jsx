import { Link } from "react-router-dom";

const priorityColors = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
  Medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
  Urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const { id, title, description, status, priority, dueDate, assignee } = task;

  // assignee populated object ho to naam, warna Unassigned
  const assigneeName = assignee?.name || null;
  const assigneeInitial = assigneeName ? assigneeName.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Link to Task Detail Page */}
          <Link
            to={`/tasks/${id}`}
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {title}
          </Link>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              priorityColors[priority] || priorityColors.Low
            }`}
          >
            {priority}
          </span>
        </div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-300 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Assignee */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              assigneeName
                ? "bg-indigo-600 text-white"
                : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-100"
            }`}
          >
            {assigneeInitial}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-200">
            {assigneeName || "Unassigned"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-300">
        <span>{dueDate ? `Due: ${dueDate}` : "No due date"}</span>
        <div className="flex items-center gap-2">
          {onStatusChange && (
            <select
              value={status}
              onChange={(e) => onStatusChange(id, e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-600 rounded px-1.5 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium ml-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;