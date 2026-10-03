import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Badge from "../ui/Badge";
import useAuthStore from "../../store/authStore";


const fetchNotificationCount = async () => {
  const token = localStorage.getItem("token");
  if (!token) return 0;

  try {
    const { data } = await axios.get(
      import.meta.env.VITE_API_URL + "/notifications",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data?.unreadCount || 0;
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return 0;
  }
};

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const logoutStore = useAuthStore((state) => state.logout);

  // Fetch logged-in user profile
  const fetchNavbarProfile = async () => {
    if (!token) return null;

    const { data } = await axios.get(
      import.meta.env.VITE_API_URL + "/profile/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  };

  const { data: profileData } = useQuery({
    queryKey: ["navbarProfile"],
    queryFn: fetchNavbarProfile,
    enabled: !!token,
  });

  // Fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationCount,
    enabled: !!token,
    refetchInterval: 30000,
  });

  const userName = profileData?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (logoutStore) logoutStore();

    localStorage.removeItem("token");

    setDropdownOpen(false);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  // Desktop nav link styling
  const navLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1"
        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`;

  // Mobile nav link styling
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? "bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold"
        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
    }`;

  return (
    <>
      {/* =========================
          MAIN NAVBAR
      ========================== */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between relative transition-colors z-40">

        {/* Logo + Desktop Navigation */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/projects"
            className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400"
          >
            <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-sm">
              T
            </span>

            <span>TaskFlow</span>
          </NavLink>

          {/* Desktop Navigation */}
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

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="flex items-center gap-3 sm:gap-5 relative">

          {/* Notification */}
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

                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* =========================
              MOBILE HAMBURGER
          ========================== */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            aria-label="Open menu"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* =========================
          MOBILE OVERLAY
      ========================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================
          MOBILE SIDEBAR
      ========================== */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 max-w-[85%] bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >

        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <NavLink
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400"
          >
            <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-sm">
              T
            </span>

            TaskFlow
          </NavLink>

          {/* Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {userInitial}
            </span>

            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white truncate">
                {userName}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                TaskFlow User
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="p-4 space-y-2">

          <NavLink
            to="/home"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/workspaces"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Workspaces
          </NavLink>

          <NavLink
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Projects
          </NavLink>

          <NavLink
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            <div className="flex items-center justify-between">
              <span>Notifications</span>

              {unreadCount > 0 && (
                <Badge size="sm" variant="danger">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </div>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Profile
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Settings
          </NavLink>
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;