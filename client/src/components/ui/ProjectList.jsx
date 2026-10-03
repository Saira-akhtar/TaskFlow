import ProjectCard from "./ProjectCard";

const ProjectList = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <p className="text-slate-400 dark:text-slate-300 text-sm">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;