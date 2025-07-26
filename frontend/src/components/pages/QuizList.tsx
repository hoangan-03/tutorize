/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  ChevronRight,
  Users,
  BarChart3,
  BookOpen,
  BookCheck,
  AlertTriangle,
} from "lucide-react";
import { quizService } from "../../services/quizService";
import { Quiz } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";

export const QuizList: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    overdueQuizzes: 0,
    averageScore: 0,
    perfectCount: 0,
  });

  useEffect(() => {
    loadQuizzes();
    loadStudentStats();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const result = await quizService.getQuizzes();
      // Filter quizzes to show only active ones for students
      const filteredQuizzes = result.data.filter(
        (quiz: Quiz) => quiz.status === "ACTIVE"
      );
      setQuizzes(filteredQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentStats = async () => {
    try {
      console.log("Loading student stats for user role: student");
      const stats = await quizService.getStudentStats();
      console.log("Student stats loaded successfully:", stats);
      // Ensure averageScore is always a number
      setUserStats({
        totalQuizzes: stats.totalQuizzes || 0,
        completedQuizzes: stats.completedQuizzes || 0,
        overdueQuizzes: stats.overdueQuizzes || 0,
        averageScore: stats.averageScore || 0,
        perfectCount: stats.perfectCount || 0,
      });
    } catch (error) {
      console.error("Error loading student stats:", error);
      // Keep default values when API fails
      setUserStats({
        totalQuizzes: 0,
        completedQuizzes: 0,
        overdueQuizzes: 0,
        averageScore: 0,
        perfectCount: 0,
      });
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      const submissionHistory = await quizService.getQuizSubmissionHistory(
        quiz.id
      );

      if (
        submissionHistory.submissions &&
        submissionHistory.submissions.length > 0
      ) {
        // User has taken this quiz, show history view
        navigate(`/quiz/${quiz.id}/results`);
      } else {
        // This is the first attempt, navigate to the player
        navigate(`/quiz/${quiz.id}/play`);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
      // Navigate to play anyway
      navigate(`/quiz/${quiz.id}/play`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 h-full w-1 bg-white/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t("quizzes.onlineQuizzes")}
              </h1>
            </div>

            {/* Decorative Quiz Elements */}
            <div className="hidden md:block relative">
              <div className="relative">
                {/* Quiz answer bubbles */}
                <div className="grid grid-cols-2 gap-2 transform rotate-12">
                  {/* Multiple choice bubbles */}
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white/20"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-lime-400"></div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-white/20"></div>
                </div>

                {/* Question marks */}
                <div className="absolute -top-3 -right-4 text-white/60 text-xl font-bold transform rotate-45">
                  ?
                </div>
                <div className="absolute -bottom-3 -left-3 text-white/40 text-lg font-bold transform -rotate-12">
                  ?
                </div>

                {/* Check mark for correct answer */}
                <div className="absolute top-6 right-6 w-4 h-4 border-2 border-lime-400 rounded flex items-center justify-center">
                  <div className="w-2 h-1 border-b-2 border-r-2 border-lime-400 transform rotate-45 translate-y-0.5"></div>
                </div>

                {/* Timer element */}
                <div className="absolute -top-2 left-8 w-3 h-3 rounded-full bg-amber-400 relative">
                  <div className="absolute inset-0 border border-white/40 rounded-full"></div>
                  <div className="absolute top-0.5 left-1 w-0.5 h-1 bg-white/80 rounded"></div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute -top-4 -right-2 w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute -bottom-2 right-2 w-1 h-1 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        </div>

        {/* Content based on active tab */}
        <>
          {/* Quizzes Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-w-8xl mx-auto">
              {/* Stats Cards - Student view */}
              <div className="flex flex-wrap gap-3 md:gap-6 mb-8">
                <div className="bg-white px-3 py-2 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0 relative overflow-hidden">
                  {/* Blue ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {userStats.totalQuizzes}
                    </p>
                    <p className="text-base font-medium text-gray-600">
                      {t("quizzes.totalQuizzes")}
                    </p>
                  </div>
                </div>

                <div className="bg-white px-3 py-2 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0 relative overflow-hidden">
                  {/* Green ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {userStats.completedQuizzes}
                    </p>
                    <p className="ml-2 text-base font-medium text-gray-600">
                      {t("quizzes.completed")}
                    </p>
                  </div>
                </div>

                <div className="bg-white px-3 py-2 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0 relative overflow-hidden">
                  {/* Red ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {userStats.overdueQuizzes}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {t("quizzes.overdue")}
                    </p>
                  </div>
                </div>

                <div className="bg-white px-3 py-2 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0 relative overflow-hidden">
                  {/* Purple ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {userStats.perfectCount}
                    </p>
                    <p className="text-base font-medium text-gray-600">
                      {t("quizzes.perfect")}
                    </p>
                  </div>
                </div>

                <div className="bg-white px-3 py-2 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0 relative overflow-hidden">
                  {/* Orange ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {(userStats.averageScore || 0).toFixed(1)}
                    </p>
                    <p className="text-base font-medium text-gray-600">
                      {t("quizzes.averageScore")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
                  >
                    <div className="p-2 bg-green-100 rounded-bl-lg absolute top-0 right-0 rounded-tr-xl">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex-col mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-start mr-2 h-14">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-start  h-8">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                          <Badge variant="subject">
                            {t(`subject.${quiz.subject.toLowerCase()}`)}
                          </Badge>
                          <Badge variant="grade">
                            {t("exercises.class")} {quiz.grade || "Chung"}
                          </Badge>
                          <Badge
                            variant="status"
                            className={`${
                              (quiz.status as string) === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : (quiz.status as string) === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : (quiz.status as string) === "OVERDUE"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {(quiz.status as string) === "ACTIVE"
                              ? t("status.active")
                              : (quiz.status as string) === "DRAFT"
                              ? t("status.draft")
                              : (quiz.status as string) === "OVERDUE"
                              ? t("status.overdue")
                              : t("status.inactive")}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>
                            {quiz.totalQuestions || 0} {t("quizzes.questions")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {quiz.timeLimit || 15} {t("quizzes.minutes")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <BookCheck className="h-4 w-4 mr-1" />
                          <span>
                            {quiz.submissions?.length || 0}{" "}
                            {t("quizzes.submissions")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 text-start flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{quiz.creator?.name || "Không xác định"}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      disabled={quiz.status !== "ACTIVE"}
                      className={`w-full flex text-sm items-center font-bold justify-center px-4 py-2 rounded-md transition-colors ${
                        quiz.status !== "ACTIVE"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-700 text-white hover:bg-blue-800"
                      }`}
                    >
                      {t("quizzes.startQuiz")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quizzes.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có quiz nào
              </h3>
              <p className="text-gray-600">
                Các quiz sẽ hiển thị ở đây khi giáo viên tạo.
              </p>
            </div>
          )}
        </>
      </div>
    </div>
  );
};
