/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "../lib/api";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UpdateProfileRequest,
} from "../types/api";

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "auth_user";

  // Token management
  saveToken(token: string): void {
    console.log("authService: Saving token:", token);
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log("authService: Token saved to localStorage");
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token;
  }

  // User management
  saveUser(user: User): void {
    console.log("authService: Saving user:", user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log("authService: User saved to localStorage");
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    const user = userData ? JSON.parse(userData) : null;
    return user;
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("authService: Making login request...");
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    console.log("authService: Login API response:", response.data);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Even if logout API fails, clear local storage
      console.error("Logout API error:", error);
    } finally {
      this.clearAuth();
    }
  }

  // Profile management
  async getProfile(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{
    message: string;
    profile: any;
  }> {
    const response = await api.patch<{
      message: string;
      profile: any;
    }>("/auth/profile", data);
    return response.data;
  }

  // Password management
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      "/auth/change-password",
      data
    );
    return response.data;
  }

  async forgotPassword(email: string): Promise<{
    message: string;
    tempPassword?: string;
  }> {
    const response = await api.post<{
      message: string;
      tempPassword?: string;
    }>("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
    return response.data;
  }

  // Utility methods
  isTeacher(): boolean {
    const user = this.getUser();
    return user?.role === "TEACHER";
  }

  isStudent(): boolean {
    const user = this.getUser();
    return user?.role === "STUDENT";
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  getUserEmail(): string | null {
    const user = this.getUser();
    return user?.email || null;
  }

  getUserName(): string | null {
    const user = this.getUser();
    return user?.name || null;
  }

  // Check if user has permission for certain actions
  canCreateContent(): boolean {
    return this.isTeacher();
  }

  canEditContent(contentUserId?: number): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Teachers can edit their own content
    if (this.isTeacher() && contentUserId === user.id) {
      return true;
    }

    // Admin can edit any content (if we add admin role later)
    return false;
  }

  canDeleteContent(contentUserId?: number): boolean {
    return this.canEditContent(contentUserId);
  }
}

export const authService = new AuthService();
