const roleColors = {
  owner: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
  member: "bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-100",
};

const MemberList = ({ members = [], currentUserRole = "member", onRemoveMember }) => {
  const canManage = currentUserRole === "owner";

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member._id}
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {member.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {member.user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {member.user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                roleColors[member.role] || roleColors.member
              }`}
            >
              {member.role}
            </span>

            {canManage && member.role !== "owner" && (
              <button
                onClick={() => onRemoveMember?.(member._id)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-300 text-center py-6">
          No members yet.
        </p>
      )}
    </div>
  );
};

export default MemberList;