import React, { useState } from "react";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuizzes, useQuizManagement } from "../../hooks/useQuiz";
import { Quiz } from "../../types/api";

export const QuizManagementReal: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "dashboard" | "preview"
  >("list");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Use real API data
  const { quizzes, total, page, totalPages, isLoading, error, mutate } =
    useQuizzes({
      page: currentPage,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const { createQuiz, updateQuiz, deleteQuiz, publishQuiz, closeQuiz } =
    useQuizManagement();

  const handleCreateQuiz = () => {
    setCurrentView("create");
    setSelectedQuiz(null);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setCurrentView("edit");
    setSelectedQuiz(quiz);
  };

  const handleViewQuiz = (quiz: Quiz) => {
    setCurrentView("preview");
    setSelectedQuiz(quiz);
  };

  const handleViewDashboard = (quiz: Quiz) => {
    setCurrentView("dashboard");
    setSelectedQuiz(quiz);
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedQuiz(null);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa quiz này không?")) {
      try {
        await deleteQuiz(quizId);
        mutate(); // Refresh the list
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      await publishQuiz(quizId);
      mutate(); // Refresh the list
    } catch (error) {
      console.error("Error publishing quiz:", error);
    }
  };

  const handleCloseQuiz = async (quizId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn đóng quiz này không?")) {
      try {
        await closeQuiz(quizId);
        mutate(); // Refresh the list
      } catch (error) {
        console.error("Error closing quiz:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "DRAFT":
        return "Bản nháp";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

  // Loading state
  if (isLoading && quizzes.length === 0) {
    return (
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-8xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Lỗi tải dữ liệu
              </h3>
              <p className="text-red-600 mt-1">
                Không thể tải danh sách quiz. Vui lòng thử lại sau.
              </p>
              <button
                onClick={() => mutate()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz List View
  if (currentView === "list") {
    return (
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Quiz</h1>
            <p className="text-gray-600 mt-2">
              Tạo và quản lý các bài quiz cho học sinh
            </p>
          </div>
          <button
            onClick={handleCreateQuiz}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tạo Quiz mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Quiz</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.filter((q) => q.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Lượt làm bài
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce(
                    (sum, q) => sum + (q.submissions?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trang</p>
                <p className="text-2xl font-bold text-gray-900">
                  {page}/{totalPages}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách Quiz
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {quiz.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          quiz.status
                        )}`}
                      >
                        {getStatusText(quiz.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-1">{quiz.description}</p>

                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quiz.timeLimit
                          ? `${quiz.timeLimit} phút`
                          : "Không giới hạn"}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {quiz.questions?.length || 0} câu hỏi
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {quiz.submissions?.length || 0} lượt làm
                      </div>
                      {quiz.deadline && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Hạn:{" "}
                          {new Date(quiz.deadline).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewQuiz(quiz)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem trước"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleViewDashboard(quiz)}
                      className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Thống kê"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </button>

                    {quiz.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublishQuiz(quiz.id)}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Xuất bản"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}

                    {quiz.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCloseQuiz(quiz.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Đóng quiz"
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Hiển thị {(page - 1) * 10 + 1} đến{" "}
                  {Math.min(page * 10, total)} trong tổng số {total} quiz
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Other views (create, edit, dashboard, preview) would be implemented here
  // For now, just show a placeholder
  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {currentView === "create" && "Tạo Quiz mới"}
          {currentView === "edit" && `Chỉnh sửa: ${selectedQuiz?.title}`}
          {currentView === "preview" && `Xem trước: ${selectedQuiz?.title}`}
          {currentView === "dashboard" && `Thống kê: ${selectedQuiz?.title}`}
        </h2>
        <p className="text-gray-600">
          Giao diện này sẽ được implement để {currentView} quiz.
        </p>
      </div>
    </div>
  );
};
