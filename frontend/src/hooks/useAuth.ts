import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import {
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  AuthResponse,
  Role,
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
  ) => Promise<{ message: string; profile: User }>;
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
  isTeacher: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && savedUser) {
        const currentUser = await authService.getProfile();
        setUser(currentUser);
        setToken(token);
        authService.saveUser(currentUser);
        console.log("User initialized:", currentUser);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.login(credentials);

    authService.saveToken(response.accessToken);
    authService.saveUser(response.user);
    setUser(response.user);
    setToken(response.accessToken);

    setIsLoading(false);
    return response;
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.register(userData);

    authService.saveToken(response.accessToken);
    authService.saveUser(response.user);
    setUser(response.user);
    setToken(response.accessToken);

    setIsLoading(false);
    return response;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await authService.logout();
    authService.clearAuth();
    setUser(null);
    setToken(null);
    setError(null);
    setIsLoading(false);
  };

  const updateProfile = async (
    data: UpdateProfileRequest
  ): Promise<{ message: string; profile: User }> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.updateProfile(data);

    const updatedUser = await authService.getProfile();
    setUser(updatedUser);
    authService.saveUser(updatedUser);

    setIsLoading(false);
    return response;
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.changePassword(data);

    setIsLoading(false);
    return response;
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ message: string; tempPassword?: string }> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.forgotPassword(email);

    setIsLoading(false);
    return response;
  };

  const resetPassword = async (data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> => {
    setIsLoading(true);
    setError(null);

    const response = await authService.resetPassword(data);

    setIsLoading(false);
    return response;
  };

  const refreshUser = async (): Promise<void> => {
    const currentUser = await authService.getProfile();
    setUser(currentUser);
    setToken(authService.getToken());
    authService.saveUser(currentUser);
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
    isTeacher: user?.role === Role.TEACHER,
  };
};
