import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useCreateProject } from "../../hooks/useWorkspaceDetail"; // Adjust import as per your file structure

const ProjectForm = ({ workspaceId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const { mutate: createProject, isPending, error } = useCreateProject(workspaceId);

  const handleSubmit = (e) => {
  e.preventDefault();
  createProject(
    { ...formData, workspaceId },
    {
      onSuccess: () => {
        setFormData({ name: "", description: "", startDate: "", deadline: "" });
        if (onSuccess) onSuccess();
      },
    }
  );
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-red-600 text-sm">
          {error.response?.data?.message || "Failed to create project"}
        </p>
      )}

      <Input
        label="Project Name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g. Website Redesign"
        required
        disabled={isPending}
      />

      <Input
        label="Description"
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Brief description of the project"
        disabled={isPending}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          disabled={isPending}
        />
        <Input
          label="Deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={isPending}>
          {isPending ? "Creating..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;