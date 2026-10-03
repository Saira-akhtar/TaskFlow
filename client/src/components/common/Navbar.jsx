import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Badge from "../ui/Badge";
import useAuthStore from "../../store/authStore"; // Auth store import agar logout ke liye zaroori ho

// API helper to fetch notifications unread count
const fetchNotificationCount = async () => {
  const token = localStorage.getItem("token");
  if (!token) return 0;
  try {
    const { data } = await axios.get("http://localhost:3000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data?.unreadCount || 0;
  } 
  catch (error) {
    console.error("Error fetching notification count:", error);
    return 0;
  }
};

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const logoutStore = useAuthStore((state) => state.logout);

  // Fetch logged-in user profile to get the real name dynamically
  const fetchNavbarProfile = async () => {
    if (!token) return null;
    const { data } = await axios.get("http://localhost:3000/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  };

  const { data: profileData } = useQuery({
    queryKey: ["navbarProfile"],
    queryFn: fetchNavbarProfile,
    enabled: !!token,
  });

  // Fetch real-time unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationCount,
    enabled: !!token,
    refetchInterval: 30000, // Optional: Background refresh every 30s
  });

  const userName = profileData?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (logoutStore) logoutStore();
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Helper function for active link styling
  const navLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1"
        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`;

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between relative transition-colors">
      {/* Logo & Main Nav */}
      <div className="flex items-center gap-8">
        <NavLink to="/projects" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-sm">T</span>
          TaskFlow
        </NavLink>

        {/* Main Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/home" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/workspaces" className={navLinkClass}>
            Workspaces
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            Projects
          </NavLink>
        </div>
      </div>

      {/* Right Side: Notification Icon & Profile Dropdown */}
      <div className="flex items-center gap-5 relative">
        
        {/* Notification Icon Link */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative p-2 rounded-full transition-colors flex items-center justify-center ${
              isActive
                ? "bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`
          }
          title="Notifications"
        >
          {/* Bell SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          
          {/* Dynamic Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1">
              <Badge size="sm" variant="danger">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </span>
          )}
        </NavLink>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center focus:outline-none"
            title="Profile Menu"
          >
            <span className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm hover:opacity-90 transition">
              {userInitial}
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
              <NavLink
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Settings
              </NavLink>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;