import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";
import { WheelyfixLogo } from "../WheelyfixLogo";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  Tag,
  ShoppingCart,
  FileText,
  Image,
  Settings,
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  roles?: string[];
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "manage_users",
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Wrench,
    permission: "manage_services",
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    permission: "manage_products",
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: Tag,
    permission: "manage_brands",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    permission: "manage_orders",
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
    permission: "manage_content",
  },
  {
    title: "Media",
    href: "/admin/media",
    icon: Image,
    permission: "manage_media",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "manage_settings",
  },
  {
    title: "Activity Logs",
    href: "/admin/activity-logs",
    icon: Activity,
    permission: "view_reports",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const location = useLocation();
  const { hasPermission, hasRole } = useAdmin();

  const filteredItems = sidebarItems.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.roles && !hasRole(item.roles)) {
      return false;
    }
    return true;
  });

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <WheelyfixLogo size="md" />
        ) : (
          <WheelyfixLogo size="sm" showText={false} />
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="ml-3 truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Admin Panel
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
