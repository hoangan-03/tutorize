/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode } from "react";
import { useAuth as useRealAuth } from "../hooks/useAuth";
import { User } from "../types/api";

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from "../hooks/useAuth";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isLoading: boolean;
  error: any;
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
        email: "teacher@tutorplatform.com",
        password: "Teacher123!",
      })
      .catch(() => {
        console.warn("Demo login failed, using fallback demo user");
      });
  };

  const value: AuthContextType = {
    user: auth.user,
    login: (email: string, password: string) => auth.login({ email, password }),
    logout: auth.logout,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isTeacher,
    isTeacher: auth.isTeacher, // Since TEACHER role is also admin in our system
    isLoading: auth.isLoading,
    error: auth.error,
    loginDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
