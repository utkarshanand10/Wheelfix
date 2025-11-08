import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authApi } from "@/api/admin";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  lastLogin?: string;
  avatarUrl?: string;
}

interface AdminState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AdminAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

const initialState: AdminState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

interface AdminContextType extends AdminState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_access_token");
      if (token) {
        try {
          const response = await authApi.getProfile();
          dispatch({ type: "SET_USER", payload: response.data.data.user });
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          dispatch({ type: "SET_USER", payload: null });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    // Add a small delay to prevent blocking the initial render
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_refresh_token", refreshToken);

      dispatch({ type: "SET_USER", payload: user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      dispatch({ type: "LOGOUT" });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      dispatch({ type: "SET_USER", payload: response.data.data.user });
    } catch (error) {
      console.error("Refresh user failed:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === "superadmin") return true;
    // Explicit permission
    if (state.user.permissions.includes(permission)) return true;
    // Fallback defaults mirrored from backend ROLE_DEFAULT_PERMISSIONS
    const ROLE_DEFAULTS: Record<string, string[]> = {
      admin: [
        "manage_users",
        "manage_services",
        "manage_products",
        "manage_brands",
        "manage_orders",
        "view_reports",
        "manage_settings",
        "manage_content",
        "manage_media",
      ],
      manager: [
        "manage_users",
        "manage_orders",
        "view_reports",
        "manage_media",
        "manage_products",
        "manage_settings",
      ],
    };
    const defaults = ROLE_DEFAULTS[state.user.role] || [];
    return defaults.includes(permission);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const value: AdminContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
