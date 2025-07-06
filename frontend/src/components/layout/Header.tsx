import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Menu,
  X,
  Home,
  FileText,
  Award,
  Library,
  Edit,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, logout, isTeacher } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDemoLogin = () => {
    // Demo functionality would be implemented here
    navigate("/login");
  };

  // Teacher Navigation - 4 tabs: Exercise, Quiz, IELTS, Document
  const TeacherNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-1">
      <button
        onClick={() => handleNavigation("/exercises")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/exercises")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Edit className="h-4 w-4 mr-2" />
        {t("navigation.exercises")}
      </button>
      <button
        onClick={() => handleNavigation("/quizzes")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/quizzes")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <FileText className="h-4 w-4 mr-2" />
        {t("navigation.quizzes")}
      </button>
      <button
        onClick={() => handleNavigation("/ielts")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/ielts")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Award className="h-4 w-4 mr-2" />
        {t("navigation.ielts")}
      </button>
      <button
        onClick={() => handleNavigation("/library")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/library")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Library className="h-4 w-4 mr-2" />
        {t("navigation.documents")}
      </button>
    </nav>
  );

  // Student Navigation - 4 tabs: Exercise, Quiz, IELTS, Document
  const StudentNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-1">
      <button
        onClick={() => handleNavigation("/exercises")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/exercises")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Edit className="h-4 w-4 mr-2" />
        {t("navigation.exercises")}
      </button>
      <button
        onClick={() => handleNavigation("/quizzes")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/quizzes")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <FileText className="h-4 w-4 mr-2" />
        {t("navigation.quizzes")}
      </button>
      <button
        onClick={() => handleNavigation("/ielts")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/ielts")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Award className="h-4 w-4 mr-2" />
        {t("navigation.ielts")}
      </button>
      <button
        onClick={() => handleNavigation("/library")}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActivePath("/library")
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <Library className="h-4 w-4 mr-2" />
        {t("navigation.documents")}
      </button>
    </nav>
  );

  // Mobile Teacher Navigation
  const MobileTeacherNavigation = () => (
    <>
      <button
        onClick={() => handleNavigation("/exercises")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Edit className="h-5 w-5 mr-3" />
        {t("navigation.exercises")}
      </button>
      <button
        onClick={() => handleNavigation("/quizzes")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <FileText className="h-5 w-5 mr-3" />
        {t("navigation.quizzes")}
      </button>
      <button
        onClick={() => handleNavigation("/ielts")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Award className="h-5 w-5 mr-3" />
        {t("navigation.ielts")}
      </button>
      <button
        onClick={() => handleNavigation("/library")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Library className="h-5 w-5 mr-3" />
        {t("navigation.documents")}
      </button>
    </>
  );

  // Mobile Student Navigation
  const MobileStudentNavigation = () => (
    <>
      <button
        onClick={() => handleNavigation("/exercises")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Edit className="h-5 w-5 mr-3" />
        {t("navigation.exercises")}
      </button>
      <button
        onClick={() => handleNavigation("/quizzes")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <FileText className="h-5 w-5 mr-3" />
        {t("navigation.quizzes")}
      </button>
      <button
        onClick={() => handleNavigation("/ielts")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Award className="h-5 w-5 mr-3" />
        {t("navigation.ielts")}
      </button>
      <button
        onClick={() => handleNavigation("/library")}
        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Library className="h-5 w-5 mr-3" />
        {t("navigation.documents")}
      </button>
    </>
  );

  return (
    <div className="bg-gray-50 py-4">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => handleNavigation("/")}
                >
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900">
                      Tutorize
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {user ? (
                /* Logged in navigation */
                isTeacher ? (
                  <TeacherNavigation />
                ) : (
                  <StudentNavigation />
                )
              ) : (
                /* Not logged in navigation */
                <nav className="hidden lg:flex items-center space-x-1">
                  <button
                    onClick={() => handleNavigation("/")}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath("/")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <FileText className="h-4 w-4 mr-2" />
                    Features
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Award className="h-4 w-4 mr-2" />
                    About
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Library className="h-4 w-4 mr-2" />
                    Contact
                  </button>
                </nav>
              )}

              {/* Auth buttons */}
              <div className="hidden lg:flex items-center space-x-3">
                {/* Language Switcher */}
                <LanguageSwitcher />

                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {user.name}{" "}
                      {isTeacher && (
                        <span className="text-blue-600 font-medium">
                          (Teacher)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t("navigation.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleNavigation("/login")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {t("navigation.login")}
                    </button>
                    <button
                      onClick={() => handleNavigation("/signup")}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      {t("navigation.register")}
                    </button>
                    <button
                      onClick={handleDemoLogin}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Demo
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile actions */}
              <div className="lg:hidden flex items-center space-x-2">
                <LanguageSwitcher />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-gray-100 mt-4">
                <div className="py-4 space-y-2">
                  {user ? (
                    <>
                      {isTeacher ? (
                        <MobileTeacherNavigation />
                      ) : (
                        <MobileStudentNavigation />
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation("/")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Home className="h-5 w-5 mr-3" />
                        Home
                      </button>
                      <button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 mr-3" />
                        Features
                      </button>
                      <button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Award className="h-5 w-5 mr-3" />
                        About
                      </button>
                      <button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Library className="h-5 w-5 mr-3" />
                        Contact
                      </button>
                    </>
                  )}

                  <hr className="my-3" />

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      {t("navigation.logout")}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleNavigation("/login")}
                        className="w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {t("navigation.login")}
                      </button>
                      <button
                        onClick={() => handleNavigation("/signup")}
                        className="w-full px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        {t("navigation.register")}
                      </button>
                      <button
                        onClick={handleDemoLogin}
                        className="w-full px-3 py-2 text-base font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        Demo Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      </div>
    </div>
  );
};
