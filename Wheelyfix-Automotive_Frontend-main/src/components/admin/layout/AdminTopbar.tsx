import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { WheelyfixLogo } from "../WheelyfixLogo";
import { analyticsApi } from "@/api/admin";
import { useNavigate } from "react-router-dom";

interface AdminTopbarProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onMenuToggle,
  isMobileMenuOpen,
}) => {
  const { user, logout } = useAdmin();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = (resolvedTheme || theme) === "dark";

  useEffect(() => setMounted(true), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const navigate = useNavigate();

  // Fetch recent activity logs and derive a notification count.
  const fetchNotificationsCount = async () => {
    try {
      // Get logs from last 24 hours (server will handle parsing); fetch up to 50 recent logs
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await analyticsApi.getActivityLogs({
        page: 1,
        limit: 50,
        startDate: since,
      });
      const data = res.data?.data;
      const logs = data?.logs || [];

      // Count logs that represent notifications: new orders (resource === 'ORDER') or user sign-ins (action === 'LOGIN')
      const count = logs.reduce((acc: number, l: any) => {
        const resource = (l.resource || "").toString().toUpperCase();
        const action = (l.action || "").toString().toUpperCase();
        if (resource === "ORDER") return acc + 1;
        if (action === "LOGIN") return acc + 1;
        return acc;
      }, 0);

      setNotificationCount(count);
    } catch (err) {
      // silently ignore notification fetch errors
      // console.debug('Notification fetch failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  useEffect(() => {
    // initial fetch and poll every 15s
    fetchNotificationsCount();
    const id = setInterval(fetchNotificationsCount, 15 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to notifications page updates (mark read, etc.)
  useEffect(() => {
    const handler = (e: any) => {
      const unread = Number(e?.detail?.unread ?? 0);
      if (!Number.isNaN(unread)) setNotificationCount(unread);
    };
    window.addEventListener("admin:notifications:update", handler as any);
    return () =>
      window.removeEventListener("admin:notifications:update", handler as any);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuToggle}
      >
        <span className="sr-only">Open sidebar</span>
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Logo for mobile */}
        <div className="lg:hidden flex items-center">
          <WheelyfixLogo size="sm" />
        </div>

        {/* Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search..."
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              onClick={toggleDarkMode}
            >
              <span className="sr-only">Toggle dark mode</span>
              {isDarkMode ? (
                <Sun className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Moon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
            onClick={() => navigate("/admin/notifications")}
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                  aria-hidden="true"
                >
                  {user?.name || "Admin"}
                </span>
              </span>
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <button
                  className="flex w-full items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Navigate to profile
                  }}
                >
                  <User className="mr-3 h-4 w-4 text-gray-400" />
                  Profile
                </button>
                <button
                  className="flex w-full items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Navigate to settings
                  }}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-400" />
                  Settings
                </button>
                <button
                  className="flex w-full items-center px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
