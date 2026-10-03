import TaskCard from "./TaskCard";

const KanbanBoard = ({ tasks, onStatusChange, onDelete }) => {
  const columns = [
    { key: "todo", label: "To Do", bg: "bg-slate-100 dark:bg-slate-800/70" },
    { key: "in_progress", label: "In Progress", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { key: "in_review", label: "In Review", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { key: "completed", label: "Completed", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            className={`${col.bg} p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-full`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-100 text-sm uppercase tracking-wider">
                {col.label} ({columnTasks.length})
              </h2>
            </div>

            <div className="space-y-3 flex-1">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
              {columnTasks.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-300 text-center py-6">
                  No tasks in this column
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;