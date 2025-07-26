/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Phone,
  MapPin,
  School,
  Calendar,
  Save,
  Key,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Role, Subject } from "../../types/api";
import { authService } from "../../services/authService";

interface AuthFormProps {
  mode: "login" | "signup" | "forgot-password" | "change-password" | "profile";
}

// Validation requirements for password
interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  validChars: boolean;
}

// Component to show password validation requirements
const PasswordValidation: React.FC<{
  password: string;
  showValidation: boolean;
}> = ({ password, showValidation }) => {
  const { t } = useTranslation();

  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    validChars: /^[a-zA-Z\d@$!%*?&]*$/.test(password),
  };

  if (!showValidation) return null;

  const RequirementItem: React.FC<{
    met: boolean;
    text: string;
  }> = ({ met, text }) => (
    <div
      className={`flex items-center space-x-2 text-sm text-start  ${
        met ? "text-green-600" : "text-red-500"
      }`}
    >
      {met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <p className="text-sm font-medium text-gray-700 mb-2">
        {t("auth.passwordRequirements")}:
      </p>
      <div className="space-y-1">
        <RequirementItem
          met={requirements.minLength}
          text={t("auth.passwordMinLength")}
        />
        <RequirementItem
          met={requirements.hasLowercase}
          text={t("auth.passwordHasLowercase")}
        />
        <RequirementItem
          met={requirements.hasUppercase}
          text={t("auth.passwordHasUppercase")}
        />
        <RequirementItem
          met={requirements.hasNumber}
          text={t("auth.passwordHasNumber")}
        />
        <RequirementItem
          met={requirements.validChars}
          text={t("auth.passwordValidChars")}
        />
      </div>
    </div>
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: Role.STUDENT,
    grade: 10,
    subject: Subject.MATH,
    // Profile fields
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    school: "",
    dateOfBirth: "",
    // Change password fields
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    user,
    login,
    register,
    updateProfile,
    changePassword,
    isAuthenticated,
    error: authError,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Load user profile data if in profile mode
    if (mode === "profile" && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        school: user.profile?.school || "",
        dateOfBirth: user.profile?.dateOfBirth || "",
      }));
    }
  }, [mode, user]);

  // Combined error from both local and auth context
  const error = useMemo(
    () => localError || authError || "",
    [localError, authError]
  );

  // Check authentication status and auto-redirect
  useEffect(() => {
    console.log("AuthForm: Authentication check:", {
      isAuthenticated,
      user,
      mode,
      from,
      location: location.pathname,
      hasError: !!error,
    });

    // Only redirect if authenticated AND no current error being displayed
    if (isAuthenticated && (mode === "login" || mode === "signup") && !error) {
      console.log(
        "AuthForm: User already authenticated, redirecting to:",
        from
      );
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, mode, navigate, from, location.pathname, error]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLocalError("");
    setSuccess("");
    clearError(); // Clear auth context error
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    console.log("🎯 Login form submitted");

    // Prevent multiple submissions
    if (isLoading) {
      console.log("⏸️ Already loading, ignoring duplicate submission");
      return;
    }

    setIsLoading(true);
    setLocalError("");
    clearError(); // Clear any existing auth errors

    try {
      console.log("🚀 Attempting login with:", {
        email: formData.email,
        password: "***masked***",
      });

      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Login successful:", result);
      console.log("📍 Navigation target:", from);

      // Check localStorage immediately after login
      console.log("💾 LocalStorage check:", {
        token: localStorage.getItem("auth_token") ? "present" : "absent",
        user: localStorage.getItem("auth_user") ? "present" : "absent",
      });

      // Only navigate if login was successful (no exception thrown)
      // Wait a bit to ensure state updates are complete
      setTimeout(() => {
        console.log("🔄 Navigating after successful login...");
        navigate(from, { replace: true });
      }, 100);
    } catch (err: any) {
      console.log("❌ Login failed:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        authError,
      });

      // Always set local error message to ensure it displays
      let errorMessage = t("errors.loginFailed");

      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      console.log("🚨 Setting error message:", errorMessage);
      setLocalError(errorMessage);

      // Explicitly prevent any navigation
      console.log("🛑 Error occurred - NOT navigating, staying on login page");

      // Do NOT navigate on error - stay on login page to show error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError("");
    clearError();

    try {
      if (formData.password !== formData.confirmPassword) {
        setLocalError(t("errors.passwordMismatch"));
        return;
      }

      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        grade: formData.role === Role.STUDENT ? formData.grade : undefined,
        subject: formData.role === Role.TEACHER ? formData.subject : undefined,
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = t("errors.registerFailed");

      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          // Join multiple validation errors
          errorMessage = err.response.data.message.join(", ");
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError("");
    setSuccess("");

    try {
      const response = await authService.forgotPassword(formData.email);
      setSuccess(response.message);

      // For demo purposes, show the temporary password
      if (response.tempPassword) {
        setTempPassword(response.tempPassword);
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message || t("errors.forgotPasswordFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError("");
    setSuccess("");

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        setLocalError(t("errors.passwordMismatch"));
        return;
      }

      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(t("auth.passwordChangeSuccess"));
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = t("errors.changePasswordFailed");

      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError("");
    setSuccess("");

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        school: formData.school,
        dateOfBirth: formData.dateOfBirth,
      });

      setSuccess(t("auth.profileUpdateSuccess"));
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message || t("errors.profileUpdateFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (mode) {
      case "login":
        return t("auth.loginToAccount");
      case "signup":
        return t("auth.createNewAccount");
      case "forgot-password":
        return t("auth.forgotPassword");
      case "change-password":
        return t("auth.changePassword");
      case "profile":
        return t("auth.updateProfile");
      default:
        return "";
    }
  };

  const getSubmitText = () => {
    if (isLoading) return t("common.loading");
    switch (mode) {
      case "login":
        return t("auth.login");
      case "signup":
        return t("auth.register");
      case "forgot-password":
        return t("auth.sendResetEmail");
      case "change-password":
        return t("auth.changePassword");
      case "profile":
        return t("auth.updateProfile");
      default:
        return t("common.submit");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    switch (mode) {
      case "login":
        return handleLogin(e);
      case "signup":
        return handleSignup(e);
      case "forgot-password":
        return handleForgotPassword(e);
      case "change-password":
        return handleChangePassword(e);
      case "profile":
        return handleUpdateProfile(e);
      default:
        e.preventDefault();
    }
  };

  const renderAuthLinks = () => {
    if (mode === "profile" || mode === "change-password") return null;

    return (
      <p className="mt-2 text-center text-sm text-gray-600">
        {mode === "login" && (
          <>
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.signUpNow")}
            </Link>
            {" | "}
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.forgotPassword")}
            </Link>
          </>
        )}
        {mode === "signup" && (
          <>
            {t("auth.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.login")}
            </Link>
          </>
        )}
        {mode === "forgot-password" && (
          <>
            {t("auth.rememberPassword")}{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {(mode === "profile" || mode === "change-password") && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </button>
        )}

        <div className="flex justify-center">
          <div className="flex items-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">
              {t("common.appName")}
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getPageTitle()}
        </h2>

        {renderAuthLinks()}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {tempPassword && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                {t("auth.tempPasswordTitle")}
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                {t("auth.tempPasswordMessage")}
              </p>
              <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
                <code className="text-yellow-900 font-mono text-lg">
                  {tempPassword}
                </code>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                {t("auth.tempPasswordWarning")}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Login Form */}
            {mode === "login" && (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.email")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterEmail")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.password")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Signup Form */}
            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.fullName")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterFullName")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.email")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterEmail")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.role")}
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                      handleInputChange("role", e.target.value as Role)
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value={Role.STUDENT}>{t("auth.student")}</option>
                    {/* <option value={Role.TEACHER}>{t("auth.teacher")}</option> */}
                  </select>
                </div>

                {formData.role === Role.STUDENT && (
                  <div>
                    <label
                      htmlFor="grade"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("auth.grade")}
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={(e) =>
                        handleInputChange("grade", parseInt(e.target.value))
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <option key={grade} value={grade}>
                          {t("auth.gradeNumber", { grade })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === Role.TEACHER && (
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("auth.subject")}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value as Subject)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                      {Object.values(Subject).map((subject) => (
                        <option key={subject} value={subject}>
                          {t(`subjects.${subject.toLowerCase()}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.password")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <PasswordValidation
                    password={formData.password}
                    showValidation={
                      passwordFocused || formData.password.length > 0
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.confirmPassword")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Forgot Password Form */}
            {mode === "forgot-password" && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("auth.email")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t("auth.enterEmail")}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {t("auth.forgotPasswordDescription")}
                </p>
              </div>
            )}

            {/* Change Password Form */}
            {mode === "change-password" && (
              <>
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.currentPassword")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterCurrentPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.newPassword")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.newPassword}
                      onChange={(e) =>
                        handleInputChange("newPassword", e.target.value)
                      }
                      onFocus={() => setShowPasswordValidation(true)}
                      onBlur={() => setShowPasswordValidation(false)}
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterNewPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <PasswordValidation
                    password={formData.newPassword}
                    showValidation={
                      showPasswordValidation || formData.newPassword.length > 0
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.confirmNewPassword")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.confirmNewPassword")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Profile Form */}
            {mode === "profile" && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("auth.firstName")}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("auth.enterFirstName")}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("auth.lastName")}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("auth.enterLastName")}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.phone")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterPhone")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.dateOfBirth")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("auth.dateFormat")}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.address")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterAddress")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("auth.school")}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="school"
                      name="school"
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        handleInputChange("school", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterSchool")}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "profile" && <Save className="h-5 w-5 mr-2" />}
                {getSubmitText()}
              </button>
            </div>
          </form>

          {/* {mode === "login" && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t("auth.orDemoLogin")}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      email: "teacher@tutorplatform.com",
                      password: "Teacher123!",
                    }));
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <User className="h-5 w-5 text-blue-500 mr-2" />
                  {t("auth.demoTeacher")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      email: "student@tutorplatform.com",
                      password: "Student123!",
                    }));
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <User className="h-5 w-5 text-green-500 mr-2" />
                  {t("auth.demoStudent")}
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
