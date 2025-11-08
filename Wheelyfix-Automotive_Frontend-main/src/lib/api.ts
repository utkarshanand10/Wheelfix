// Resolve API base URL from environment for production; fall back to dev proxy '/api'
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

const getAuthHeader = () => {
  // Prefer admin token if available (admin pages). Fallback to user token.
  const adminToken = localStorage.getItem("admin_access_token");
  const token = adminToken || localStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

export const api = {
  async get<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...options.headers,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      };
    }
  },

  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...options.headers,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error:
            responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          ...(responseData.error && { error: responseData.error }),
        };
      }

      return { data: responseData, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      };
    }
  },

  async authGet<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const result = await this.get<T>(endpoint, options);
    if (result.error) throw new Error(result.error);
    return result.data as T;
  },

  async authPost<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const result = await this.post<T>(endpoint, data, options);
    if (result.error) throw new Error(result.error);
    return result.data as T;
  },

  async authDelete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const result = await this.delete<T>(endpoint, options);
    if (result.error) throw new Error(result.error);
    return result.data as T;
  },

  async authPut<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const result = await this.put<T>(endpoint, data, options);
    if (result.error) throw new Error(result.error);
    return result.data as T;
  },

  async authPatch<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const result = await this.patch<T>(endpoint, data, options);
    if (result.error) throw new Error(result.error);
    return result.data as T;
  },

  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...options.headers,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error:
            responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          ...(responseData.error && { error: responseData.error }),
        };
      }

      return { data: responseData, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      };
    }
  },

  async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...options.headers,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      };
    }
  },

  async patch<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...options.headers,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error:
            responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          ...(responseData.error && { error: responseData.error }),
        };
      }

      return { data: responseData, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      };
    }
  },
};
