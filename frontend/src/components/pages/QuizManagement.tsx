import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { quizzesData } from "../../data/sampleData";
import { QuizForm } from "./QuizForm";
import { QuizDashboard } from "./QuizDashboard";
import { QuizPreview } from "./QuizPreview";
import { useAuth } from "../../contexts/AuthContext";

interface Quiz {
  id: number;
  title: string;
  subject: string;
  grade: number;
  description: string;
  timeLimit: number;
  deadline: string;
  status: string;
  createdBy: string;
  createdAt: string;
  totalQuestions: number;
  totalSubmissions: number;
  averageScore: number;
  questions: Question[];
}

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export const QuizManagement: React.FC = () => {
  const { user, isTeacher } = useAuth();
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "dashboard" | "preview"
  >("list");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Filter quizzes to show only those created by current teacher
  const quizzes = useMemo(() => {
    if (!isTeacher || !user) return quizzesData;

    // For now, using mock data but in real app this would be an API call
    // with createdBy filter
    return quizzesData.filter((quiz) => quiz.createdBy === user.email);
  }, [isTeacher, user]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "draft":
        return "Bản nháp";
      case "closed":
        return "Đã đóng";
      default:
        return status;
    }
  };

  // Quiz List View
  if (currentView === "list") {
    return (
      <div className="max-w-8xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 mb-8 border border-green-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Quản lý Quiz
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-sm text-green-600 font-medium">
                      Hệ thống đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Tạo và quản lý các bài quiz trắc nghiệm cho học sinh. Hỗ trợ
                nhiều loại câu hỏi và chấm điểm tự động.
              </p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{quizzes.length} quiz</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {quizzes.reduce((sum, q) => sum + q.totalSubmissions, 0)}{" "}
                    lượt làm bài
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Cập nhật gần nhất: {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              <button
                onClick={handleCreateQuiz}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Tạo Quiz mới</span>
              </button>
              <p className="text-xs text-gray-500 text-right">
                Nhấn để tạo quiz
                <br />
                với trình tạo câu hỏi thông minh
              </p>
            </div>
          </div>
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
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.length}
                </p>
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
                  {quizzes.filter((q) => q.status === "active").length}
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
                  {quizzes.reduce((sum, q) => sum + q.totalSubmissions, 0)}
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
                <p className="text-sm font-medium text-gray-600">Điểm TB</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    quizzes.reduce((sum, q) => sum + q.averageScore, 0) /
                    quizzes.length
                  ).toFixed(1)}
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
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quiz.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          quiz.status
                        )}`}
                      >
                        {getStatusText(quiz.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{quiz.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {quiz.subject}
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Lớp {quiz.grade}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quiz.timeLimit} phút
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(quiz.deadline).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {quiz.totalSubmissions} lượt làm
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDashboard(quiz)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Xem kết quả"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewQuiz(quiz)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem trước"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Other views will be rendered by separate components
  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          ← Quay lại danh sách
        </button>
      </div>

      {currentView === "create" && (
        <QuizForm
          onBack={handleBack}
          onSave={(quizData) => {
            console.log("Tạo quiz mới:", quizData);
            alert("Quiz đã được tạo thành công!");
            handleBack();
          }}
        />
      )}
      {currentView === "edit" && selectedQuiz && (
        <QuizForm
          quiz={selectedQuiz}
          onBack={handleBack}
          onSave={(quizData) => {
            console.log("Cập nhật quiz:", quizData);
            alert("Quiz đã được cập nhật thành công!");
            handleBack();
          }}
        />
      )}
      {currentView === "dashboard" && selectedQuiz && (
        <QuizDashboard quiz={selectedQuiz} onBack={handleBack} />
      )}
      {currentView === "preview" && selectedQuiz && (
        <QuizPreview quiz={selectedQuiz} onBack={handleBack} />
      )}
    </div>
  );
};
