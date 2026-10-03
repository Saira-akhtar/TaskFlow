import { useState } from "react";
import WorkspaceCard from "../../components/ui/WorkSpaceCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useWorkspaces, useCreateWorkspace } from "../../hooks/useWorkspace";

const Workspace = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });

  const { data, isLoading, error } = useWorkspaces();
  const { mutate: createWorkspaceMutate, isPending: isCreating, error: createError } = useCreateWorkspace();

  const workspaces = data?.workspaces || [];

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    createWorkspaceMutate(newWorkspace, {
      onSuccess: () => {
        setNewWorkspace({ name: "", description: "" });
        setShowCreateForm(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Workspaces</h1>
            <p className="text-slate-500 mt-1">
              Manage your teams and collaborate on projects.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            + New Workspace
          </Button>
        </div>

        {error && (
          <p className="text-red-600 mb-4">
            {error.response?.data?.message || "Failed to load workspaces"}
          </p>
        )}
        {createError && (
          <p className="text-red-600 mb-4">
            {createError.response?.data?.message || "Failed to create workspace"}
          </p>
        )}

        {showCreateForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Create Workspace
            </h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <Input
                label="Workspace Name"
                type="text"
                name="name"
                value={newWorkspace.name}
                onChange={(e) =>
                  setNewWorkspace((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Client Projects"
                required
                disabled={isCreating}
              />
              <Input
                label="Description"
                type="text"
                name="description"
                value={newWorkspace.description}
                onChange={(e) =>
                  setNewWorkspace((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="What's this workspace for?"
                disabled={isCreating}
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" size="md" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <p className="text-slate-400 text-center py-16">Loading workspaces...</p>
        ) : workspaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace._id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-4">
              You don't have any workspaces yet.
            </p>
            <Button variant="primary" size="md" onClick={() => setShowCreateForm(true)}>
              Create your first workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;