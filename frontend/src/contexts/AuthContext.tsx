/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode } from "react";
import { useAuth as useRealAuth } from "../hooks/useAuth";
import {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  AuthResponse,
} from "../types/api";

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "../hooks/useAuth";

interface AuthContextType {
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
  // Helper properties
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  // Legacy methods for backwards compatibility
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useRealAuth();

  const loginDemo = () => {
    // For demo purposes, use a real login with demo credentials
    auth
      .login({
        email: "teacher@gmail.com",
        password: "Teacher123!",
      })
      .catch(() => {
        console.warn("Demo login failed, using fallback demo user");
      });
  };

  const value: AuthContextType = {
    // Core auth state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Auth methods
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
    forgotPassword: auth.forgotPassword,
    resetPassword: auth.resetPassword,
    refreshUser: auth.refreshUser,
    clearError: auth.clearError,

    // Helper properties
    isAdmin: auth.user?.role === "TEACHER", // Teachers are admins in our system
    isTeacher: auth.user?.role === "TEACHER",
    isStudent: auth.user?.role === "STUDENT",

    // Legacy method
    loginDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
