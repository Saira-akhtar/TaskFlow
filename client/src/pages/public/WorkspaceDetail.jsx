import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MemberList from "../../components/ui/MemberList";
import InviteMemberForm from "../../components/ui/InviteMemberForm";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProjectForm from "../../components/ui/ProjectForm";
import ProjectList from "../../components/ui/ProjectList";

import {
  useWorkspaceDetail,
  useWorkspaceMembers,
  useAddMember,
  useRemoveMember,
  useProjects,
} from "../../hooks/useWorkspaceDetail";

import useAuthStore from "../../store/authStore";

const WorkspaceDetail = () => {
  const { id } = useParams();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useWorkspaceDetail(id);

  const { data: membersData, isLoading: isMembersLoading } =
    useWorkspaceMembers(id);

  const {
    mutate: addMember,
    isPending: isInviting,
    error: addError,
  } = useAddMember(id);

  const { mutate: removeMember } = useRemoveMember(id);

  // Projects ab alag hook se fetch ho rahe hain
  const { data: projects = [] } = useProjects(id);

  const workspace = workspaceData?.workspace;
  const members = membersData?.members || [];

  const currentMember = members.find(
    (m) => m.user?._id === currentUser?.id
  );

  const isOwner = workspace?.owner === currentUser?.id;

  const currentUserRole = isOwner
    ? "owner"
    : currentMember?.role || "member";

  const handleInvite = ({ email, role }) => {
    addMember(
      { email, role },
      {
        onSuccess: () => setShowInviteForm(false),
      }
    );
  };

  const handleRemoveMember = (memberId) => {
    removeMember(memberId);
  };

  if (isWorkspaceLoading) {
    return (
      <p className="text-center py-16 text-slate-400">
        Loading workspace...
      </p>
    );
  }

  if (workspaceError) {
    return (
      <p className="text-center py-16 text-red-600">
        {workspaceError.response?.data?.message ||
          "Failed to load workspace"}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">

        <Link
          to="/workspaces"
          className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
        >
          ← Back to Workspaces
        </Link>

        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {workspace?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {workspace?.name}
              </h1>

              <p className="text-slate-500 text-sm mt-1">
                {workspace?.description}
              </p>
            </div>

          </div>

          {/* New Project Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowProjectForm(!showProjectForm)}
          >
            {showProjectForm ? "Cancel" : "+ New Project"}
          </Button>

        </div>

        {/* New Project Form */}
        {showProjectForm && (
          <div className="mb-6">
            <Card className="p-6">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Create New Project
                </h2>

                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl"
                >
                  ×
                </button>
              </div>

              <ProjectForm
                workspaceId={id}
                onSuccess={() => setShowProjectForm(false)}
              />

            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="p-6">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Projects ({projects.length})
                </h2>
              </div>

              <ProjectList projects={projects} />

            </Card>

          </div>

          {/* Members Section */}
          <div className="space-y-6">

            <Card className="p-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-lg font-semibold text-slate-800">
                  Members ({members.length})
                </h2>

                {(currentUserRole === "owner" ||
                  currentUserRole === "admin") && (
                  <button
                    onClick={() =>
                      setShowInviteForm(!showInviteForm)
                    }
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {showInviteForm ? "Cancel" : "+ Invite"}
                  </button>
                )}

              </div>

              {addError && (
                <p className="text-red-600 text-sm mb-3">
                  {addError.response?.data?.message ||
                    "Failed to add member"}
                </p>
              )}

              {showInviteForm && (
                <div className="mb-5 pb-5 border-b border-slate-100">

                  <InviteMemberForm
                    onInvite={handleInvite}
                    isLoading={isInviting}
                  />

                </div>
              )}

              {isMembersLoading ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  Loading members...
                </p>
              ) : (
                <MemberList
                  members={members}
                  currentUserRole={currentUserRole}
                  onRemoveMember={handleRemoveMember}
                />
              )}

            </Card>

          </div>

        </div>

      </div>
    </div>
  );
};

export default WorkspaceDetail;