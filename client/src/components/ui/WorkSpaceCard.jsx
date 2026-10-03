import { Link } from "react-router-dom";

const WorkspaceCard = ({ workspace }) => {
  const { _id, name, description } = workspace;

  return (
    <Link to={`/workspaces/${_id}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-300 transition cursor-pointer h-full flex flex-col">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mb-3">
          <span className="text-white font-bold text-lg">
            {name?.charAt(0).toUpperCase() || "W"}
          </span>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">{name}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
          {description || "No description provided."}
        </p>
      </div>
    </Link>
  );
};

export default WorkspaceCard;
