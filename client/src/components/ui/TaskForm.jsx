import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useWorkspaceMembers } from "../../hooks/useWorkspaceDetail";

// workspaceId prop pass karna zaroori hai taake Assign To dropdown mein members aayen
const TaskForm = ({ onSubmit, initialData = {}, isLoading = false, workspaceId }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [priority, setPriority] = useState(initialData.priority || "Medium");
  const [dueDate, setDueDate] = useState(initialData.dueDate || "");
  // assignee populated object ho ya sirf id, dono handle
  const [assignee, setAssignee] = useState(
    initialData.assignee?._id || initialData.assignee || ""
  );
  const [error, setError] = useState("");

  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers(workspaceId);
 const members = (membersData?.members || []).filter((m) => m.role !== "owner");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    setError("");
    onSubmit?.({
      title,
      description,
      priority,
      dueDate,
      status: initialData.status || "todo",
      assignee: assignee || undefined, // khali string na jaye, warna ObjectId cast error aata hai
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="e.g. Design landing page hero"
        disabled={isLoading}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional details..."
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
        />
      </div>

      {/* Assign To */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          disabled={isLoading || membersLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
        >
          <option value="">
            {membersLoading ? "Loading members..." : "Unassigned"}
          </option>
          {members.map((m) => (
            <option key={m._id} value={m.user?._id}>
              {m.user?.name} ({m.role})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Task"}
      </Button>
    </form>
  );
};

export default TaskForm;