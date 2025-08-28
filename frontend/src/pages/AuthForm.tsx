/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
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
  Save,
  Key,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { convertISOToDMY } from "../components/utils";
import { Role, Subject } from "../types/api";
import { DateInput } from "../components/ui";

interface AuthFormProps {
  mode: "login" | "signup" | "forgot-password" | "change-password" | "profile";
}

interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  validChars: boolean;
}

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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: Role.STUDENT,
    grade: 10,
    subject: Subject.MATH,
    phone: "",
    address: "",
    school: "",
    dateOfBirth: "",
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const {
    user,
    login,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    refreshUser,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (mode === "profile" && user?.profile) {
      let formattedDateOfBirth = "";

      if (user.profile.dateOfBirth) {
        const raw = String(user.profile.dateOfBirth);
        // Support both ISO (YYYY-MM-DD or with time) and DMY inputs
        const isoLike = raw.length >= 10 ? raw.substring(0, 10) : raw;
        formattedDateOfBirth = convertISOToDMY(isoLike);
      }

      setFormData((prev) => ({
        ...prev,
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        school: user.profile?.school || "",
        dateOfBirth: formattedDateOfBirth,
      }));
    }
  }, [mode, user?.profile]);

  useEffect(() => {
    if (mode === "profile" && isAuthenticated && !user?.profile) {
      setIsLoadingProfile(true);
      refreshUser()
        .then(() => {
          setIsLoadingProfile(false);
        })
        .catch(() => {
          setIsLoadingProfile(false);
        });
    }
  }, [mode, isAuthenticated, user?.profile, refreshUser]);

  useEffect(() => {
    if (isAuthenticated && (mode === "login" || mode === "signup")) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, mode, navigate, from]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const email = (formData.email || "").toString().trim();
      const password = (formData.password || "").toString().trim();

      await login({
        email,
        password,
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (err: any) {
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

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (formData.password !== formData.confirmPassword) {
        setError(t("errors.passwordMismatch"));
        return;
      }

      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        grade: formData.role === Role.STUDENT ? formData.grade : undefined,
        subject: formData.role === Role.TEACHER ? formData.subject : undefined,
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = t("errors.registerFailed");

      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword(formData.email);
      setSuccess(response.message);

      if (response.tempPassword) {
        setTempPassword(response.tempPassword);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("errors.forgotPasswordFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        setError(t("errors.passwordMismatch"));
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

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let formattedDateOfBirth: string | undefined = undefined;

      // Only include dateOfBirth if it has a valid value (expect DD-MM-YYYY)
      if (formData.dateOfBirth && formData.dateOfBirth.trim() !== "") {
        formattedDateOfBirth = formData.dateOfBirth; // stored/sent as DD-MM-YYYY
      }

      const profileData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        school: formData.school,
      };

      // Only include dateOfBirth if it's properly formatted
      if (formattedDateOfBirth) {
        profileData.dateOfBirth = formattedDateOfBirth;
      }

      await updateProfile(profileData);

      setSuccess(t("auth.profileUpdateSuccess"));
    } catch (err: any) {
      let errorMessage = t("errors.profileUpdateFailed");

      if (err.response?.data) {
        const data = err.response.data;

        if (data.error && Array.isArray(data.error.message)) {
          errorMessage = data.error.message.join(", ");
        } else if (data.error && typeof data.error.message === "string") {
          errorMessage = data.error.message;
        } else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(", ");
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        } else if (data.error && typeof data.error === "string") {
          errorMessage = data.error;
        } else {
          errorMessage = JSON.stringify(data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {(mode === "profile" || mode === "change-password") && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-500 pl-4 lg:pl-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </button>
        )}

        <div className="flex justify-center">
          <div className="flex items-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <span className="ml-3 text-base md:text-xl lg:text-3xl font-bold text-gray-900">
              {t("common.appName")}
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getPageTitle()}
        </h2>

        {renderAuthLinks()}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
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
                      required
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
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("auth.enterLastName")}
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
                        handleInputChange("subject", e.target.value)
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
                {isLoadingProfile && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-sm text-blue-600">
                      {t("auth.loadingProfile")}
                    </p>
                  </div>
                )}

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
                  <DateInput
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(value) =>
                      handleInputChange("dateOfBirth", value)
                    }
                  />
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
                disabled={isLoading || (mode === "profile" && isLoadingProfile)}
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
                      email: "teacher@gmail.com",
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
