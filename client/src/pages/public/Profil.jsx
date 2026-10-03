import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================
const fetchMyProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token is missing");
  }

  const { data } = await axios.get(
    "http://localhost:3000/api/profile/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("BACKEND PROFILE RESPONSE:", data);

  // Return the complete backend response
  return data;
};

// ==========================================
// UPDATE PROFILE
// ==========================================
const updateMyProfileApi = async (updatedData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token is missing");
  }

  const { data } = await axios.patch(
    "http://localhost:3000/api/profile/me",
    updatedData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("UPDATE PROFILE RESPONSE:", data);

  return data;
};

// ==========================================
// PROFILE COMPONENT
// ==========================================
const Profile = () => {
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  

  // ==========================================
  // FETCH PROFILE
  // ==========================================
  const {
    data: profileData,
    isLoading,
    isError: isFetchingError,
    error: fetchingError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
  });

  // ==========================================
  // COMBINE USER + PROFILE DATA
  // ==========================================
  const currentProfile = {
    ...(profileData?.user || {}),
    ...(profileData?.profile || {}),
  };

  console.log("CURRENT PROFILE:", currentProfile);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================
  const profileMutation = useMutation({
    mutationFn: updateMyProfileApi,

    onSuccess: async (data) => {
      console.log("PROFILE UPDATED:", data);

      setMessage("Profile updated successfully!");
      setIsError(false);

      // Fetch latest data from backend
      await queryClient.invalidateQueries({
        queryKey: ["myProfile"],
      });
    },

    onError: (error) => {
      console.error("PROFILE UPDATE ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile."
      );

      setIsError(true);
    },
  });

  // ==========================================
  // PROFILE FORM SUBMIT
  // ==========================================
  const handleProfileSubmit = (e) => {
    e.preventDefault();

    setMessage("");

    const updatedData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      jobTitle: e.target.jobTitle.value.trim(),
      bio: e.target.bio.value.trim(),
    };

    console.log("SENDING PROFILE DATA:", updatedData);

    profileMutation.mutate(updatedData);
  };



  // ==========================================
  // LOADING
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (isFetchingError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm font-medium">
          Failed to load profile data.
        </p>

        <p className="text-gray-500 text-xs mt-2">
          {fetchingError?.response?.data?.message ||
            fetchingError?.message ||
            "Something went wrong."}
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Profile Settings
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage your personal information, account security, and preferences.
          </p>
        </div>

        {/* ======================================
            MESSAGE
        ====================================== */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
              isError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">

          {/* ====================================
              PERSONAL INFORMATION
          ==================================== */}
          <Card className="p-6">

            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Personal Information
            </h2>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">

              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {currentProfile?.name
                  ? currentProfile.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 text-base">
                  {currentProfile?.name || "User"}
                </h3>

                <p className="text-xs text-slate-500">
                  {currentProfile?.role || "User"}
                </p>
              </div>

            </div>

            {/* ==================================
                PROFILE FORM
            ================================== */}
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-4"
            >

              {/* Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Input
                  name="name"
                  label="Full Name"
                  type="text"
                  defaultValue={currentProfile?.name || ""}
                  disabled={profileMutation.isPending}
                />

                <Input
                  name="email"
                  label="Email Address"
                  type="email"
                  defaultValue={currentProfile?.email || ""}
                  disabled={profileMutation.isPending}
                />

              </div>

              {/* Job Title */}
              <Input
                name="jobTitle"
                label="Role / Title"
                type="text"
                defaultValue={currentProfile?.jobTitle || ""}
                disabled={profileMutation.isPending}
              />

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bio
                </label>

                <textarea
                  name="bio"
                  defaultValue={currentProfile?.bio || ""}
                  rows={4}
                  disabled={profileMutation.isPending}
                  placeholder="Tell us a little about yourself..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </div>

            </form>
          </Card>

         

        </div>
      </div>
    </div>
  );
};

export default Profile;