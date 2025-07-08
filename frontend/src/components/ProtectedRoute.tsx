import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "@/types/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isTeacher = user?.role === Role.TEACHER;
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    isAuthenticated,
    isTeacher,
    user,
    requireAdmin,
    currentPath: location.pathname,
  });

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isTeacher) {
    console.log("ProtectedRoute: Not admin, redirecting to dashboard");
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute: Access granted");
  return <>{children}</>;
};
