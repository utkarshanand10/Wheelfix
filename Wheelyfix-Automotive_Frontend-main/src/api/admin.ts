import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("admin_refresh_token");
        if (refreshToken) {
          const response = await adminApi.post("/auth/refresh-token", {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("admin_access_token", accessToken);
          localStorage.setItem("admin_refresh_token", newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    adminApi.post("/auth/login", credentials),

  refreshToken: (refreshToken: string) =>
    adminApi.post("/auth/refresh-token", { refreshToken }),

  logout: () => adminApi.post("/auth/logout"),

  getProfile: () => adminApi.get("/auth/profile"),

  updateProfile: (data: any) => adminApi.put("/auth/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    adminApi.put("/auth/change-password", data),
};

// Users API
export const usersApi = {
  getUsers: (params?: any) => adminApi.get("/users", { params }),

  getUserById: (id: string) => adminApi.get(`/users/${id}`),

  createUser: (data: any) => adminApi.post("/users", data),

  updateUser: (id: string, data: any) => adminApi.put(`/users/${id}`, data),

  deleteUser: (id: string) => adminApi.delete(`/users/${id}`),

  toggleUserStatus: (id: string, status: string) =>
    adminApi.patch(`/users/${id}/status`, { status }),

  resetUserPassword: (id: string, newPassword: string) =>
    adminApi.patch(`/users/${id}/reset-password`, { newPassword }),

  getUserStats: () => adminApi.get("/users/stats"),

  exportUsers: (format = "csv") =>
    adminApi.get("/users/export", { params: { format } }),
};

// Services API
export const servicesApi = {
  getServices: (params?: any) => adminApi.get("/services", { params }),

  getServiceById: (id: string) => adminApi.get(`/services/${id}`),

  createService: (data: any) => adminApi.post("/services", data),

  updateService: (id: string, data: any) =>
    adminApi.put(`/services/${id}`, data),

  deleteService: (id: string) => adminApi.delete(`/services/${id}`),

  bulkUpdateServices: (serviceIds: string[], updateData: any) =>
    adminApi.patch("/services/bulk-update", { serviceIds, updateData }),

  toggleServiceStatus: (id: string, status: string) =>
    adminApi.patch(`/services/${id}/status`, { status }),

  getServiceStats: () => adminApi.get("/services/stats"),

  toggleServiceVisibility: (id: string, data: { visible: boolean }) =>
    adminApi.patch(`/services/${id}/visibility`, data),

  getServicesByType: (type: string) => adminApi.get(`/services/type/${type}`),
  // Vehicle specific merged services (with overrides). POST expects { brand, model, fuel }
  // NOTE: Endpoint is outside /api/admin namespace (no auth required to view), so use direct axios
  getVehicleServicesMerged: async (payload: {
    brand: string;
    model: string;
    fuel: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/vehicle-services`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response;
  },
  // Update / upsert a vehicle-specific price override
  // Note: This endpoint is at /api/vehicle-services (not /api/admin), so we call it directly
  updateVehicleServicePrice: async (payload: {
    brand: string;
    model: string;
    fuel: string;
    serviceName: string;
    price: number;
  }) => {
    // Get admin token
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      throw new Error("Admin access token not found");
    }

    // Make request to the correct endpoint with retry logic for token refresh
    try {
      const response = await axios.put(
        `${API_BASE_URL}/vehicle-services/override/price`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error: any) {
      // If 401, try to refresh token and retry
      if (error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem("admin_refresh_token");
          if (refreshToken) {
            const refreshResponse = await adminApi.post("/auth/refresh-token", {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } =
              refreshResponse.data.data;
            localStorage.setItem("admin_access_token", accessToken);
            localStorage.setItem("admin_refresh_token", newRefreshToken);

            // Retry with new token
            const retryResponse = await axios.put(
              `${API_BASE_URL}/vehicle-services/override/price`,
              payload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            return retryResponse;
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.href = "/admin/login";
          throw refreshError;
        }
      }
      throw error;
    }
  },
};

// Products API
export const productsApi = {
  getProducts: (params?: any) => adminApi.get("/products", { params }),

  getProductById: (id: string) => adminApi.get(`/products/${id}`),

  createProduct: (data: any) => adminApi.post("/products", data),

  updateProduct: (id: string, data: any) =>
    adminApi.put(`/products/${id}`, data),

  deleteProduct: (id: string) => adminApi.delete(`/products/${id}`),

  bulkUpdateProducts: (productIds: string[], updateData: any) =>
    adminApi.patch("/products/bulk-update", { productIds, updateData }),

  toggleProductStatus: (id: string, status: string) =>
    adminApi.patch(`/products/${id}/status`, { status }),

  getProductStats: () => adminApi.get("/products/stats"),
};

// Brands API
export const brandsApi = {
  getBrands: (params?: any) => adminApi.get("/brands", { params }),

  getBrandById: (id: string) => adminApi.get(`/brands/${id}`),

  createBrand: (data: any) => adminApi.post("/brands", data),

  updateBrand: (id: string, data: any) => adminApi.put(`/brands/${id}`, data),

  deleteBrand: (id: string) => adminApi.delete(`/brands/${id}`),

  getBrandStats: () => adminApi.get("/brands/stats"),

  toggleBrandVisibility: (id: string, data: { visibleOnHome: boolean }) =>
    adminApi.patch(`/brands/${id}/visibility`, data),

  toggleBrandStatus: (id: string, status: string) =>
    adminApi.patch(`/brands/${id}/status`, { status }),

  reorderBrands: (brandOrders: { id: string; orderIndex: number }[]) =>
    adminApi.patch("/brands/reorder", { brandOrders }),

  bulkUpdateBrands: (brandIds: string[], updateData: any) =>
    adminApi.patch("/brands/bulk-update", { brandIds, updateData }),

  // Aggregated vehicle brands (cars + bikes) from datasets
  getVehicleBrands: () => adminApi.get("/brands/vehicle/all"),
};

// Orders API
export const ordersApi = {
  getOrders: (params?: any) => adminApi.get("/orders", { params }),

  getOrderById: (id: string) => adminApi.get(`/orders/${id}`),

  updateOrder: (id: string, data: any) => adminApi.put(`/orders/${id}`, data),

  capturePayment: (id: string) => adminApi.post(`/orders/${id}/capture`),

  refundOrder: (id: string, data: any) =>
    adminApi.post(`/orders/${id}/refund`, data),

  getOrderStats: () => adminApi.get("/orders/stats"),
};

// Settings API
export const settingsApi = {
  getSettings: () => adminApi.get("/settings"),

  updateSettings: (data: any) => adminApi.put("/settings", data),
};

// Media API
export const mediaApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminApi.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMedia: (params?: any) => adminApi.get("/media", { params }),

  deleteMedia: (id: string) => adminApi.delete(`/media/${id}`),
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: () => adminApi.get("/analytics/dashboard"),

  getRevenueChart: (period: string) =>
    adminApi.get(`/analytics/revenue?period=${period}`),

  getServiceChart: (period: string) =>
    adminApi.get(`/analytics/services?period=${period}`),

  getActivityLogs: (params?: any) =>
    adminApi.get("/analytics/activity-logs", { params }),
};

export default adminApi;
