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

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [managementDropdownOpen, setManagementDropdownOpen] = useState(false);
  const { user, logout, isTeacher: isAdmin, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setManagementDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate("/dashboard");
  };

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
                <nav className="hidden lg:flex items-center space-x-1">
                  <button
                    onClick={() => handleNavigation("/dashboard")}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath("/dashboard")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
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
                    Exercises
                  </button>
                  {/* <button
                    onClick={() => handleNavigation("/exercises")}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath("/exercises")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Exercise
                  </button> */}
                  <button
                    onClick={() => handleNavigation("/ielts")}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath("/ielts")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    IELTS
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
                    Library
                  </button>

                  {/* Management Dropdown - Admin Only */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setManagementDropdownOpen(!managementDropdownOpen)
                        }
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActivePath("/management/exercises") ||
                          isActivePath("/management/quizzes")
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Management
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            managementDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {managementDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={() =>
                              handleNavigation("/management/exercises")
                            }
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Exercise Management
                          </button>
                          <button
                            onClick={() =>
                              handleNavigation("/management/quizzes")
                            }
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Quiz Management
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </nav>
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
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Xin chào, {user.name}{" "}
                      {isAdmin && (
                        <span className="text-blue-600 font-medium">
                          (Admin)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleNavigation("/login")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleNavigation("/signup")}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Sign Up
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

              {/* Mobile menu button */}
              <div className="lg:hidden">
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
                      <button
                        onClick={() => handleNavigation("/dashboard")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Home className="h-5 w-5 mr-3" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleNavigation("/quizzes")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        Exercises
                      </button>
                      {/* <button
                        onClick={() => handleNavigation("/exercises")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-5 w-5 mr-3" />
                        Exercise
                      </button> */}
                      <button
                        onClick={() => handleNavigation("/ielts")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Award className="h-5 w-5 mr-3" />
                        IELTS
                      </button>
                      <button
                        onClick={() => handleNavigation("/library")}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Library className="h-5 w-5 mr-3" />
                        Library
                      </button>

                      {/* Mobile Management Menu - Admin Only */}
                      {isAdmin && (
                        <>
                          <div className="pl-6 text-xs font-medium text-gray-500 uppercase tracking-wide mt-4 mb-2">
                            Management (Admin)
                          </div>
                          <button
                            onClick={() =>
                              handleNavigation("/management/exercises")
                            }
                            className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="h-5 w-5 mr-3" />
                            Exercise Management
                          </button>
                          <button
                            onClick={() =>
                              handleNavigation("/management/quizzes")
                            }
                            className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <FileText className="h-5 w-5 mr-3" />
                            Quiz Management
                          </button>
                        </>
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
                      Logout
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleNavigation("/login")}
                        className="w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleNavigation("/signup")}
                        className="w-full px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Sign Up
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

      {/* Overlay to close dropdown when clicking outside */}
      {managementDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setManagementDropdownOpen(false)}
        />
      )}
    </div>
  );
};
