/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Home,
  BookOpen,
  FileText,
  Award,
  PenTool,
  LogOut,
  Edit,
  Brain,
} from "lucide-react";

interface SidebarProps {
  setCurrentPage: (page: string) => void;
  setUser: (user: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  setCurrentPage,
  setUser,
}) => (
  <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg">
    <div className="p-6">
      <nav className="space-y-2">
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5 mr-3" />
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage("documents")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <BookOpen className="h-5 w-5 mr-3" />
          Document Library
        </button>
        <button
          onClick={() => setCurrentPage("quizzes")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <FileText className="h-5 w-5 mr-3" />
          Online Quizzes
        </button>
        <button
          onClick={() => setCurrentPage("ielts")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <Award className="h-5 w-5 mr-3" />
          IELTS Center
        </button>
        <button
          onClick={() => setCurrentPage("exercises")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <Edit className="h-5 w-5 mr-3" />
          Exercise Management
        </button>
        <button
          onClick={() => setCurrentPage("quiz-management")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <Brain className="h-5 w-5 mr-3" />
          Quiz Management
        </button>
        <button
          onClick={() => setCurrentPage("writing")}
          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <PenTool className="h-5 w-5 mr-3" />
          AI Writing Grader
        </button>
        <hr className="my-4" />
        <button
          onClick={() => setUser(null)}
          className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  </div>
);
