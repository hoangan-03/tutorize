/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  School,
  Calendar,
  Save,
  Key,
  Shield,
  BookOpen,
  Award,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { convertISOToDMY } from "../components/utils";
import { Role, Subject } from "../types/api";
import { ActionButton, DateInput } from "../components/ui";

export const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    school: "",
    dateOfBirth: "",
    grade: 10,
    subject: Subject.MATH as Subject,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.profile) {
      let formattedDateOfBirth = "";
      if (user.profile.dateOfBirth) {
        const dateObj = new Date(user.profile.dateOfBirth);
        formattedDateOfBirth = convertISOToDMY(dateObj.toISOString());
      }

      setFormData({
        firstName: user.profile.firstName || "",
        lastName: user.profile.lastName || "",
        email: user.email || "",
        phone: user.profile.phone || "",
        address: user.profile.address || "",
        school: user.profile.school || "",
        dateOfBirth: formattedDateOfBirth,
        grade: user.profile.grade || 10,
        subject: (user.profile.subject || Subject.MATH) as Subject,
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        school: formData.school,
        dateOfBirth: formData.dateOfBirth
          ? new Date(
              formData.dateOfBirth.split("/").reverse().join("-")
            ).toISOString()
          : undefined,
      };

      if (user?.role === Role.STUDENT) {
        updateData.grade = formData.grade;
        updateData.subject = formData.subject;
      }

      await updateProfile(updateData);
      await refreshUser();

      setSuccess(t("auth.profileUpdated"));
      setIsEditing(false);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      let errorMessage = t("errors.updateFailed");

      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isTeacher = user?.role === Role.TEACHER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-400 rounded-full p-2 border-4 border-white shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2 text-start">
                  {formData.firstName} {formData.lastName}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    {isTeacher ? (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {t("auth.teacher")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {t("auth.student")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              {!isEditing && (
                <ActionButton
                  onClick={() => setIsEditing(true)}
                  colorTheme="transparent"
                  hasIcon={true}
                  icon={Edit2}
                  text={t("common.edit")}
                  size="md"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                />
              )}
              <ActionButton
                onClick={() => navigate("/change-password")}
                colorTheme="transparent"
                hasIcon={true}
                icon={Key}
                text={t("auth.changePassword")}
                size="md"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  {t("profile.accountStatus")}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {t("profile.status")}
                  </span>
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t("profile.active")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    {t("profile.role")}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {isTeacher ? t("auth.teacher") : t("auth.student")}
                  </span>
                </div>
                {!isTeacher && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {t("auth.grade")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {t("common.grade")} {formData.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">
                        {t("auth.subject")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {t(`subjects.${formData.subject.toLowerCase()}`)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Main Content - Profile Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("profile.personalInformation")}
                </h2>
                {isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t("common.cancel")}
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("auth.firstName")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        placeholder={t("auth.enterFirstName")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("auth.lastName")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        placeholder={t("auth.enterLastName")}
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t("profile.emailCannotBeChanged")}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.phone")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                      placeholder={t("auth.enterPhone")}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.dateOfBirth")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <DateInput
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(value) =>
                        handleInputChange("dateOfBirth", value)
                      }
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.address")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                      placeholder={t("auth.enterAddress")}
                    />
                  </div>
                </div>

                {/* School */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("auth.school")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        handleInputChange("school", e.target.value)
                      }
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                      placeholder={t("auth.enterSchool")}
                    />
                  </div>
                </div>

                {/* Save Button - Only show when editing */}
                {isEditing && (
                  <div className="pt-4">
                    <ActionButton
                      type="submit"
                      disabled={isLoading}
                      colorTheme="blue"
                      hasIcon={true}
                      icon={Save}
                      text={
                        isLoading ? t("common.saving") : t("common.saveChanges")
                      }
                      size="lg"
                      className="w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
