/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { mutate } from "swr";
import { authService } from "../services/authService";
import {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../types/api";
import { toast } from "react-toastify";

// Auth state hook
export const useAuth = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useSWR<User | null>(
    authService.isAuthenticated() ? "/auth/me" : null,
    () => authService.getProfile(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onError: (error) => {
        if (error?.response?.status === 401) {
          authService.clearAuth();
        }
      },
    }
  );

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      authService.saveToken(response.accessToken);
      authService.saveUser(response.user);

      // Revalidate user data
      mutate("/auth/me", response.user, false);

      toast.success("Đăng nhập thành công!");
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Đăng nhập thất bại";
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData);
      authService.saveToken(response.accessToken);
      authService.saveUser(response.user);

      // Revalidate user data
      mutate("/auth/me", response.user, false);

      toast.success("Đăng ký thành công!");
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Đăng ký thất bại";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();

      // Clear all SWR cache
      mutate(() => true, undefined, { revalidate: false });

      toast.success("Đăng xuất thành công!");
    } catch (error) {
      // Still logout locally even if API call fails
      authService.clearAuth();
      mutate(() => true, undefined, { revalidate: false });
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await authService.updateProfile(data);

      // Revalidate user data
      mutate("/auth/me");

      toast.success(response.message);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Cập nhật thất bại";
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await authService.changePassword(data);
      toast.success(response.message);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Đổi mật khẩu thất bại";
      toast.error(message);
      throw error;
    }
  };

  return {
    user: user || authService.getUser(),
    isLoading,
    error,
    isAuthenticated: !!user || authService.isAuthenticated(),
    isTeacher:
      user?.role === "TEACHER" || authService.getUser()?.role === "TEACHER",
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};
