import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "next-themes";
import { AdminLayout } from "../components/admin/layout/AdminLayout";
import { AdminProtectedRoute } from "../components/admin/AdminProtectedRoute";
import { AdminLogin } from "../pages/admin/AdminLogin";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminServices } from "../pages/admin/AdminServices";
import { AdminBrands } from "../pages/admin/AdminBrands";
import { AdminOrders } from "../pages/admin/AdminOrders";
import { AdminSettings } from "../pages/admin/AdminSettings";
import { AdminActivityLogs } from "../pages/admin/AdminActivityLogs";
import { AdminNotifications } from "../pages/admin/AdminNotifications";
import { AdminTest } from "../pages/admin/AdminTest";
import { AdminDebug } from "../pages/admin/AdminDebug";

export const AdminRouter: React.FC = () => {
  return (
    <AdminProvider>
      {/* Scoped theme provider so dark mode only affects admin routes */}
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/test" element={<AdminTest />} />
          <Route path="/debug" element={<AdminDebug />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="users"
              element={
                <AdminProtectedRoute requiredPermission="manage_users">
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="services"
              element={
                <AdminProtectedRoute requiredPermission="manage_services">
                  <AdminServices />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="products"
              element={<Navigate to="/admin/brands" replace />}
            />
            <Route
              path="brands"
              element={
                <AdminProtectedRoute requiredPermission="manage_brands">
                  <AdminBrands />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <AdminProtectedRoute requiredPermission="manage_orders">
                  <AdminOrders />
                </AdminProtectedRoute>
              }
            />
            {/* Content and Media removed per admin request */}
            <Route
              path="settings"
              element={
                <AdminProtectedRoute requiredPermission="manage_settings">
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="activity-logs"
              element={
                <AdminProtectedRoute requiredPermission="view_reports">
                  <AdminActivityLogs />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <AdminProtectedRoute requiredPermission="manage_settings">
                  <AdminNotifications />
                </AdminProtectedRoute>
              }
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ThemeProvider>
    </AdminProvider>
  );
};
