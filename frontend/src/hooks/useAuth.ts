/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import {
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  AuthResponse,
} from "../types/api";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (
    data: UpdateProfileRequest
  ) => Promise<{ message: string; profile: any }>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ message: string }>;
  forgotPassword: (
    email: string
  ) => Promise<{ message: string; tempPassword?: string }>;
  resetPassword: (data: {
    token: string;
    password: string;
  }) => Promise<{ message: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());

  const isAuthenticated = !!user && !!token;

  // Debug logging for authentication state changes
  useEffect(() => {
    console.log("🔍 Auth state changed:", {
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      token: token ? "present" : "absent",
      isAuthenticated,
      timestamp: new Date().toISOString(),
    });
  }, [user, token, isAuthenticated]);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getProfile();
          setUser(currentUser);
          setToken(token);
          authService.saveUser(currentUser);
        } catch (err) {
          // Token is invalid, clear auth
          authService.clearAuth();
          setUser(null);
          setToken(null);
        }
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("useAuth: Starting login...");
      const response = await authService.login(credentials);
      console.log("useAuth: Login response:", response);

      authService.saveToken(response.accessToken);
      authService.saveUser(response.user);
      setUser(response.user);
      setToken(response.accessToken);

      console.log("useAuth: User state updated:", response.user);
      console.log("useAuth: Token state updated:", response.accessToken);
      console.log(
        "useAuth: Is authenticated:",
        !!response.user && !!response.accessToken
      );

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);

      authService.saveToken(response.accessToken);
      authService.saveUser(response.user);
      setUser(response.user);
      setToken(response.accessToken);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err: any) {
      console.error("Logout error:", err);
    } finally {
      authService.clearAuth();
      setUser(null);
      setToken(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    data: UpdateProfileRequest
  ): Promise<{ message: string; profile: any }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfile(data);

      // Refresh user data
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      authService.saveUser(updatedUser);

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Cập nhật thông tin thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.changePassword(data);

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Đổi mật khẩu thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ message: string; tempPassword?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.forgotPassword(email);

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Quên mật khẩu thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.resetPassword(data);

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Reset mật khẩu thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getProfile();
      setUser(currentUser);
      setToken(authService.getToken());
      authService.saveUser(currentUser);
    } catch (err: any) {
      console.error("Failed to refresh user:", err);
      // If refresh fails, user might need to re-login
      if (err.response?.status === 401) {
        authService.clearAuth();
        setUser(null);
        setToken(null);
      }
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshUser,
    clearError,
  };
};
