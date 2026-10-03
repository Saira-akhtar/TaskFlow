import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useState } from "react";

// API helper functions
const fetchNotifications = async () => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get("http://localhost:3000/api/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const markNotificationRead = async (id) => {
  const token = localStorage.getItem("token");
  await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");
  await axios.patch("http://localhost:3000/api/notifications/read-all", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const deleteNotificationApi = async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(`http://localhost:3000/api/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  // 1. Fetch Notifications using TanStack Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // 2. Mutations for actions
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-12 text-red-500 text-sm">Failed to load notifications. Please try again.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with your workspace activities and task assignments.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition"
          >
            {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Tabs & Count Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "unread"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount === 0 && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            ✓ All caught up
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              🔔
            </div>
            <p className="text-sm font-medium text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">You do not have any notifications in this view.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
              className={`group relative border rounded-xl p-4 transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer ${
                notif.isRead
                  ? "bg-white border-slate-200 hover:border-slate-300"
                  : "bg-indigo-50/50 border-indigo-200 shadow-sm hover:shadow"
              }`}
            >
              {!notif.isRead && (
                <span className="absolute left-2 top-5 w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}

              <div className={`flex-1 ${!notif.isRead ? "pl-3" : ""}`}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {notif.relatedTask?.title ? `Task: ${notif.relatedTask.title}` : "System Notification"}
                  </h3>
                  {!notif.isRead && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                  <span>
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notif.relatedProject?.name && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-indigo-600">
                        {notif.relatedProject.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(notif._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  title="Delete notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;