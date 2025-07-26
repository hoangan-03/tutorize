import axios from "axios";

// API Base Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login/signup pages or if it's a login attempt
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === "/login" ||
        currentPath === "/signup" ||
        currentPath === "/forgot-password";
      const isLoginAttempt = error.config?.url?.includes("/auth/login");

      if (!isAuthPage && !isLoginAttempt) {
        // Clear token and redirect to login only for protected routes
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      } else if (isLoginAttempt) {
        // For failed login attempts, don't clear localStorage yet
        // Let the component handle the error display first
        console.log("Login attempt failed, not clearing localStorage yet");
      }

      // For login attempts or auth pages, just let the error propagate
    }
    return Promise.reject(error);
  }
);

export default api;
