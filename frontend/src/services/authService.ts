/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import api from "../lib/api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UpdateProfileRequest,
} from "../types/api";

export const authService = {
  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  async logout(): Promise<void> {
    // Call logout endpoint if available
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continue with local logout even if API call fails
    }

    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  // Profile Management
  async getProfile(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<{ message: string; profile: any }> {
    const response = await api.put<{ message: string; profile: any }>(
      "/auth/profile",
      data
    );
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/change-password",
      data
    );
    return response.data;
  },

  async forgotPassword(
    email: string
  ): Promise<{ message: string; resetToken?: string }> {
    const response = await api.post<{ message: string; resetToken?: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  // Token management
  saveToken(token: string): void {
    localStorage.setItem("accessToken", token);
  },

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  saveUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  clearAuth(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
