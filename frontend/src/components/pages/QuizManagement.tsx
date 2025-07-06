import React, { useState, useEffect } from "react";
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
  MoreVertical,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { QuizForm } from "./QuizForm";
import { QuizDashboard } from "./QuizDashboard";
import { QuizPreview } from "./QuizPreview";
import { quizService } from "../../services/quizService";
import { Quiz } from "../../types/api";

export const QuizManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "dashboard" | "preview"
  >("list");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherStats, setTeacherStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    overdueQuizzes: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    loadQuizzes();
    loadTeacherStats();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await quizService.getQuizzes({ limit: 100 });
      setQuizzes(result.data);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setError("Không thể tải danh sách quiz. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherStats = async () => {
    try {
      const stats = await quizService.getTeacherStats();
      setTeacherStats(stats);
    } catch (err) {
      console.error("Error loading teacher stats:", err);
    }
  };

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
    loadQuizzes(); // Refresh data when returning to list
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quiz này?")) return;

    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => String(q.id) !== String(quizId)));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("Không thể xóa quiz. Vui lòng thử lại.");
    }
  };

  const handleUpdateQuizStatus = async (quizId: number, newStatus: string) => {
    try {
      await quizService.updateQuizStatus(quizId, newStatus);
      setQuizzes(
        quizzes.map((q) =>
          q.id === quizId
            ? ({
                ...q,
                status: newStatus,
              } as Quiz)
            : q
        )
      );
    } catch (err) {
      console.error("Error updating quiz status:", err);
      alert("Không thể cập nhật trạng thái quiz. Vui lòng thử lại.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800";
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
      case "INACTIVE":
        return "Tạm dừng";
      case "OVERDUE":
        return "Quá hạn";
      default:
        return status;
    }
  };

  // Transform QuizForm data to API format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformQuizData = (formData: any): Partial<Quiz> => {
    // Filter out unwanted fields from questions and ensure order is set

    const cleanQuestions = formData.questions?.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (question: any, index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, quizId, createdAt, updatedAt, ...cleanQuestion } = question;
        return {
          ...cleanQuestion,
          order: cleanQuestion.order || index + 1,
        };
      }
    );

    return {
      ...formData,
      questions: cleanQuestions.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q: any) => ({
          ...q,
          // Convert frontend type to backend type
          type:
            q.type === "multiple-choice"
              ? "MULTIPLE_CHOICE"
              : q.type === "true-false"
              ? "TRUE_FALSE"
              : q.type === "short-answer"
              ? "FILL_BLANK"
              : q.type,
        })
      ),
      status:
        formData.status === "active"
          ? "ACTIVE"
          : formData.status === "draft"
          ? "DRAFT"
          : formData.status === "inactive"
          ? "INACTIVE"
          : formData.status,
    };
  };

  // Calculate stats
  const stats = {
    total: teacherStats.totalQuizzes,
    active: teacherStats.activeQuizzes,
    overdue: teacherStats.overdueQuizzes,
    totalSubmissions: teacherStats.totalSubmissions,
  };

  // Quiz List View
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Quản lý Quiz
                    </h1>
                  </div>
                </div>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl text-start">
                  Tạo và quản lý các bài quiz trắc nghiệm cho học sinh. Hỗ trợ
                  nhiều loại câu hỏi và chấm điểm tự động.
                </p>
                <div className="flex items-center space-x-6 mt-4 text-sm text-white/80">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{stats.total} quiz</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{stats.totalSubmissions} lượt làm bài</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Cập nhật gần nhất:{" "}
                      {new Date().toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateQuiz}
                    className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Tạo Quiz mới</span>
                  </button>
                </div>
                <p className="text-xs text-white/70 text-right">
                  Nhấn để tạo quiz
                  <br />
                  với trình tạo câu hỏi thông minh
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Quiz</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Đang hoạt động
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Lượt làm bài
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSubmissions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadQuizzes}
                className="mt-2 text-red-600 hover:text-red-700 underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Quiz List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Chưa có quiz nào
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Tạo quiz đầu tiên để bắt đầu quản lý bài kiểm tra cho học
                  sinh.
                </p>
                <button
                  onClick={handleCreateQuiz}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Tạo Quiz mới
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {quiz.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              quiz.status
                            )}`}
                          >
                            {getStatusText(quiz.status)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm leading-relaxed text-start">
                          {quiz.description}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {quiz.timeLimit
                              ? `${quiz.timeLimit} phút`
                              : "Không giới hạn"}
                          </div>
                          {quiz.deadline && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(quiz.deadline).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {quiz.submissions?.length || 0} lượt làm
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            {quiz.questions?.length || 0} câu hỏi
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDashboard(quiz)}
                          className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                          title="Xem kết quả"
                        >
                          <BarChart3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewQuiz(quiz)}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Xem trước"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        {/* Status Management Dropdown */}
                        <div className="relative">
                          <button
                            className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                            title="Quản lý trạng thái"
                            onClick={() => {
                              const dropdown = document.getElementById(
                                `status-dropdown-${quiz.id}`
                              );
                              if (dropdown) {
                                dropdown.classList.toggle("hidden");
                              }
                            }}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <div
                            id={`status-dropdown-${quiz.id}`}
                            className="hidden absolute right-0 bottom-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-100"
                          >
                            <div className="py-1">
                              {(quiz.status as string) === "DRAFT" && (
                                <button
                                  onClick={() => {
                                    handleUpdateQuizStatus(quiz.id, "ACTIVE");
                                    document
                                      .getElementById(
                                        `status-dropdown-${quiz.id}`
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Kích hoạt
                                </button>
                              )}
                              {(quiz.status as string) === "ACTIVE" && (
                                <button
                                  onClick={() => {
                                    handleUpdateQuizStatus(quiz.id, "INACTIVE");
                                    document
                                      .getElementById(
                                        `status-dropdown-${quiz.id}`
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Tạm dừng
                                </button>
                              )}
                              {(quiz.status as string) === "INACTIVE" && (
                                <button
                                  onClick={() => {
                                    handleUpdateQuizStatus(quiz.id, "ACTIVE");
                                    document
                                      .getElementById(
                                        `status-dropdown-${quiz.id}`
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Kích hoạt lại
                                </button>
                              )}
                              {(quiz.status as string) === "OVERDUE" && (
                                <div className="px-4 py-2 text-sm text-gray-500 italic">
                                  Quiz quá hạn - Cần cập nhật deadline
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Other views will be rendered by separate components
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-700 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại danh sách
          </button>
        </div>

        {/* Content Container with Enhanced Styling */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {currentView === "create" && (
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Tạo Quiz mới
                </h1>
                <p className="text-gray-600">
                  Thiết kế bài kiểm tra tương tác cho học sinh
                </p>
              </div>
              <QuizForm
                onBack={handleBack}
                onSave={async (quizData) => {
                  try {
                    const transformedData = transformQuizData(quizData);
                    await quizService.createQuiz(transformedData);
                    alert("Quiz đã được tạo thành công!");
                    handleBack();
                  } catch (err) {
                    console.error("Error creating quiz:", err);
                    alert("Không thể tạo quiz. Vui lòng thử lại.");
                  }
                }}
              />
            </div>
          )}
          {currentView === "edit" && selectedQuiz && (
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Chỉnh sửa Quiz
                </h1>
              </div>
              <QuizForm
                quiz={selectedQuiz}
                onBack={handleBack}
                onSave={async (quizData) => {
                  try {
                    const transformedData = transformQuizData(quizData);
                    await quizService.updateQuiz(
                      selectedQuiz.id,
                      transformedData
                    );
                    alert("Quiz đã được cập nhật thành công!");
                    handleBack();
                  } catch (err) {
                    console.error("Error updating quiz:", err);
                    alert("Không thể cập nhật quiz. Vui lòng thử lại.");
                  }
                }}
              />
            </div>
          )}
          {currentView === "dashboard" && selectedQuiz && (
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Thống kê Quiz
                </h1>
                <p className="text-gray-600">
                  Xem kết quả và phân tích chi tiết
                </p>
              </div>
              <QuizDashboard quiz={selectedQuiz} onBack={handleBack} />
            </div>
          )}
          {currentView === "preview" && selectedQuiz && (
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Xem trước Quiz
                </h1>
                <p className="text-gray-600">Kiểm tra giao diện và nội dung</p>
              </div>
              <QuizPreview quiz={selectedQuiz} onBack={handleBack} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
