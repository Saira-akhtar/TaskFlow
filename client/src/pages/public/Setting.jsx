import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import { useThemeStore } from "../../store/useThemeStore";

const Settings = () => {
  const queryClient = useQueryClient();

  const { theme: globalTheme, setTheme } = useThemeStore();

  // --------------------------------
  // Local form state
  // --------------------------------

  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(null);
  const [localTheme, setLocalTheme] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------
  // Get token
  // --------------------------------

  const token = localStorage.getItem("token");

  // --------------------------------
  // Fetch profile
  // --------------------------------

  const fetchProfile = async () => {
    const { data } = await axios.get(
      import.meta.env.VITE_API_URL + "/profile/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchProfile,
    enabled: !!token,
  });

  // --------------------------------
  // Values from backend
  // --------------------------------

  const backendName = data?.user?.name || "";
  const backendEmail = data?.user?.email || "";

  const backendNotifications = data?.profile?.notificationsEnabled ?? true;

  const backendTheme = data?.profile?.theme || globalTheme || "light";

  // --------------------------------
  // Use local value if user changed it,
  // otherwise use backend value
  // --------------------------------

  const currentName = name !== null ? name : backendName;

  const currentEmail = email !== null ? email : backendEmail;

  const currentNotifications =
    notificationsEnabled !== null ? notificationsEnabled : backendNotifications;

  const currentTheme = localTheme !== null ? localTheme : backendTheme;

  // --------------------------------
  // Update settings
  // --------------------------------

  const updateSettings = async (settings) => {
    const { data } = await axios.patch(
      import.meta.env.VITE_API_URL + "/profile/me",
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  };

  const mutation = useMutation({
    mutationFn: updateSettings,

    onSuccess: () => {
      // Apply selected theme globally
      setTheme(currentTheme);

      // Refresh profile data
      queryClient.invalidateQueries({
        queryKey: ["myProfile"],
      });

      // Reset local form overrides
      setName(null);
      setEmail(null);
      setNotificationsEnabled(null);
      setLocalTheme(null);

      // Success message
      setSuccessMessage("Settings updated successfully!");

      setErrorMessage("");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    },

    onError: (error) => {
      console.error("Settings update error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to update settings.",
      );

      setSuccessMessage("");
    },
  });

  // --------------------------------
  // Handle save
  // --------------------------------

  const handleSave = (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    mutation.mutate({
      name: currentName.trim(),
      email: currentEmail.trim(),
      theme: currentTheme,
      notificationsEnabled: currentNotifications,
    });
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error?.response?.data?.message || "Failed to load settings."}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Account Settings
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Manage your profile settings, preferences, and notifications.
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* ==============================
              Profile Information
          ============================== */}

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Profile Information
            </h2>

            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={currentName}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                value={currentEmail}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </Card>

          {/* ==============================
              Preferences
          ============================== */}

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Preferences
            </h2>

            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Theme Mode
                </label>

                <select
                  value={currentTheme}
                  onChange={(e) => {
                    const selectedTheme = e.target.value;

                    setLocalTheme(selectedTheme);

                    // Apply immediately
                    setTheme(selectedTheme);
                  }}
                  className="
                    w-full
                    px-3
                    py-2
                    border
                    border-slate-300
                    dark:border-slate-600
                    rounded-lg
                    text-sm
                    bg-white
                    dark:bg-slate-700
                    text-slate-700
                    dark:text-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                  "
                >
                  <option value="light">Light Mode</option>

                  <option value="dark">Dark Mode</option>

                  <option value="system">System Default</option>
                </select>
              </div>
            </div>
          </Card>

          {/* ==============================
              Save Button
          ============================== */}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
