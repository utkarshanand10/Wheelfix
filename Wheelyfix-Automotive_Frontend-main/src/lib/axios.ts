import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance
// Base URL can be overridden via Vite env; falls back to proxy '/api'
const axiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // If error is 401 and we haven't tried to refresh token yet
    // Do not attempt refresh on auth endpoints to avoid loops
    const urlPath: string = originalRequest.url || '';
    const isAuthEndpoint = /\/users\/(login|register|logout)/.test(urlPath);
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken,
          });

          if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (error) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Map timeout and network errors to clearer messages; otherwise show server message
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '');
    const isNetwork = !error.response && !isTimeout;

    if (isTimeout) {
      toast({
        title: 'Request timed out',
        description: 'Server took too long to respond. Please make sure the backend is running and try again.',
        variant: 'destructive',
      });
    } else if (isNetwork) {
      toast({
        title: 'Network error',
        description: 'Unable to reach the server. Check your internet and backend status.',
        variant: 'destructive',
      });
    } else if (error.response?.status !== 401) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'An error occurred',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, config = {}) =>
    axiosInstance.get<T>(url, config).then((response) => response.data),

  post: <T>(url: string, data = {}, config = {}) =>
    axiosInstance.post<T>(url, data, config).then((response) => response.data),

  put: <T>(url: string, data = {}, config = {}) =>
    axiosInstance.put<T>(url, data, config).then((response) => response.data),

  delete: <T>(url: string, config = {}) =>
    axiosInstance.delete<T>(url, config).then((response) => response.data),
};
