import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const TaskDetail = () => {
  const { id } = useParams();

  // 🧪 Dummy data — wire up to useQuery later
  const [task, setTask] = useState({
    id: id || "t1",
    title: "Implement contact form validation",
    description: "Ensure regex checking works for emails and required fields show proper inline errors.",
    status: "in_progress",
    priority: "Urgent",
    dueDate: "2026-10-01",
    assignedTo: "Sara Akhtar",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
          ← Back to Project / Tasks
        </Link>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                Task Details
              </span>
              <h1 className="text-xl font-bold text-slate-800 mt-2">{task.title}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Task"}
            </Button>
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</h3>
                  <span className="text-sm font-medium text-slate-800 capitalize bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</h3>
                  <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                    {task.priority}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</h3>
                  <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={task.description}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;