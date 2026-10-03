import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

// ==============================
// API FUNCTIONS
// ==============================

const fetchNotifications = async () => {
  const token = localStorage.getItem("token");

  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};

const markNotificationRead = async (id) => {
  const token = localStorage.getItem("token");

  await axios.patch(
    `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");

  await axios.patch(
    `${import.meta.env.VITE_API_URL}/notifications/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const deleteNotificationApi = async (id) => {
  const token = localStorage.getItem("token");

  await axios.delete(
    `${import.meta.env.VITE_API_URL}/notifications/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// ==============================
// NOTIFICATIONS COMPONENT
// ==============================

const Notifications = () => {
  const [filter, setFilter] = useState("all");

  const queryClient = useQueryClient();

  // ==============================
  // FETCH NOTIFICATIONS
  // ==============================

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // ==============================
  // MARK SINGLE AS READ
  // ==============================

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  // ==============================
  // MARK ALL AS READ
  // ==============================

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  // ==============================
  // DELETE NOTIFICATION
  // ==============================

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationApi,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  // ==============================
  // FILTER
  // ==============================

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.isRead;
    }

    return true;
  });

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-red-500 dark:text-red-400">
          Failed to load notifications. Please try again.
        </p>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">

        {/* =========================
            HEADER
        ========================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your workspace activities and task assignments.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="
                text-xs font-semibold
                text-indigo-600 dark:text-indigo-400
                bg-indigo-50 dark:bg-indigo-950/50
                hover:bg-indigo-100 dark:hover:bg-indigo-900/60
                border border-transparent dark:border-indigo-900
                px-3.5 py-2
                rounded-lg
                transition
                disabled:opacity-50
              "
            >
              {markAllReadMutation.isPending
                ? "Marking..."
                : "Mark all as read"}
            </button>
          )}
        </div>

        {/* =========================
            TABS
        ========================== */}

        <div
          className="
            flex items-center justify-between
            border-b
            border-slate-200 dark:border-slate-800
            pb-4 mb-6
          "
        >
          <div className="flex items-center gap-2">

            {/* ALL */}

            <button
              onClick={() => setFilter("all")}
              className={`
                px-4 py-1.5
                rounded-lg
                text-xs font-semibold
                transition
                ${
                  filter === "all"
                    ? `
                      bg-indigo-600
                      dark:bg-indigo-500
                      text-white
                      shadow-sm
                    `
                    : `
                      bg-slate-100
                      dark:bg-slate-800
                      text-slate-600
                      dark:text-slate-300
                      hover:bg-slate-200
                      dark:hover:bg-slate-700
                    `
                }
              `}
            >
              All ({notifications.length})
            </button>

            {/* UNREAD */}

            <button
              onClick={() => setFilter("unread")}
              className={`
                px-4 py-1.5
                rounded-lg
                text-xs font-semibold
                transition
                ${
                  filter === "unread"
                    ? `
                      bg-indigo-600
                      dark:bg-indigo-500
                      text-white
                      shadow-sm
                    `
                    : `
                      bg-slate-100
                      dark:bg-slate-800
                      text-slate-600
                      dark:text-slate-300
                      hover:bg-slate-200
                      dark:hover:bg-slate-700
                    `
                }
              `}
            >
              Unread ({unreadCount})
            </button>

          </div>

          {/* ALL CAUGHT UP */}

          {unreadCount === 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              ✓ All caught up
            </span>
          )}
        </div>

        {/* =========================
            NOTIFICATION LIST
        ========================== */}

        <div className="space-y-3">

          {filteredNotifications.length === 0 ? (

            /* EMPTY STATE */

            <div
              className="
                text-center
                py-16
                bg-white dark:bg-slate-900
                border
                border-dashed
                border-slate-300 dark:border-slate-700
                rounded-2xl
                transition-colors
              "
            >

              <div
                className="
                  w-12 h-12
                  bg-slate-50 dark:bg-slate-800
                  text-slate-400 dark:text-slate-500
                  rounded-full
                  flex items-center justify-center
                  mx-auto mb-3
                  text-xl font-bold
                "
              >
                🔔
              </div>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No notifications found
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                You do not have any notifications in this view.
              </p>

            </div>

          ) : (

            /* NOTIFICATION CARDS */

            filteredNotifications.map((notif) => (

              <div
                key={notif._id}
                onClick={() =>
                  !notif.isRead &&
                  markReadMutation.mutate(notif._id)
                }
                className={`
                  group relative
                  border
                  rounded-xl
                  p-4
                  transition-all duration-200
                  flex items-start justify-between
                  gap-4
                  cursor-pointer

                  ${
                    notif.isRead
                      ? `
                        bg-white
                        dark:bg-slate-900

                        border-slate-200
                        dark:border-slate-800

                        hover:border-slate-300
                        dark:hover:border-slate-700
                      `
                      : `
                        bg-indigo-50/70
                        dark:bg-indigo-950/40

                        border-indigo-200
                        dark:border-indigo-800

                        shadow-sm
                        hover:shadow
                      `
                  }
                `}
              >

                {/* UNREAD DOT */}

                {!notif.isRead && (
                  <span
                    className="
                      absolute
                      left-2 top-5
                      w-2 h-2
                      bg-indigo-600
                      dark:bg-indigo-400
                      rounded-full
                    "
                  />
                )}

                {/* CONTENT */}

                <div
                  className={`
                    flex-1
                    ${!notif.isRead ? "pl-3" : ""}
                  `}
                >

                  {/* TITLE */}

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {notif.relatedTask?.title
                        ? `Task: ${notif.relatedTask.title}`
                        : "System Notification"}
                    </h3>

                    {!notif.isRead && (
                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider

                          bg-indigo-100
                          dark:bg-indigo-900/70

                          text-indigo-700
                          dark:text-indigo-300

                          px-2
                          py-0.5
                          rounded-full
                        "
                      >
                        New
                      </span>
                    )}

                  </div>

                  {/* MESSAGE */}

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* DATE */}

                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 dark:text-slate-500">

                    <span>
                      {new Date(notif.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}

                      {" "}at{" "}

                      {new Date(notif.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>

                    {notif.relatedProject?.name && (
                      <>
                        <span>•</span>

                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {notif.relatedProject.name}
                        </span>
                      </>
                    )}

                  </div>

                </div>

                {/* =========================
                    DELETE BUTTON
                ========================== */}

                <div className="flex items-center gap-2">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(notif._id);
                    }}
                    className="
                      opacity-0
                      group-hover:opacity-100

                      text-slate-400
                      dark:text-slate-500

                      hover:text-red-600
                      dark:hover:text-red-400

                      p-1.5
                      rounded-lg

                      hover:bg-red-50
                      dark:hover:bg-red-950/40

                      transition
                    "
                    title="Delete notification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                </div>

              </div>

            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default Notifications;