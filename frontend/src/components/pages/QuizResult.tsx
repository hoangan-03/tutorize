/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";
import { quizService } from "../../services/quizService";
import { Quiz } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";

export const QuizResult: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      loadQuizResults();
    }
  }, [quizId]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const submissionHistory = await quizService.getQuizSubmissionHistory(
        Number(quizId)
      );

      if (
        submissionHistory.submissions &&
        submissionHistory.submissions.length > 0
      ) {
        setQuiz(submissionHistory.quiz);
        setQuizResults({
          ...submissionHistory,
          isSubmissionHistory: true,
        });
      } else {
        // No submissions found, redirect to quiz list
        navigate("/quizzes");
      }
    } catch (error) {
      console.error("Error loading quiz results:", error);
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    if (quiz) {
      navigate(`/quiz/${quiz.id}/play`);
    }
  };

  const handleBackToList = () => {
    navigate("/quizzes");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !quizResults) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy kết quả quiz
            </h2>
            <p className="text-gray-600 mb-6">
              Quiz này chưa được thực hiện hoặc không tồn tại.
            </p>
            <button
              onClick={handleBackToList}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("quizzes.back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if this is submission history view
  if (quizResults.isSubmissionHistory) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {quiz.title}
                </h1>
                <button
                  onClick={handleBackToList}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("quizzes.back")}
                </button>
              </div>
            </div>

            {/* Submission History */}
            <div className="space-y-6">
              {quizResults.submissions?.map(
                (submission: any, index: number) => (
                  <div
                    key={submission.id}
                    className="bg-gray-50 rounded-lg p-6 border"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-start">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("quizzes.attempt")} #{index + 1}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {(
                            ((submission.score || 0) /
                              (submission.totalPoints || 1)) *
                            10
                          ).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {submission.score}/{submission.totalPoints}{" "}
                          {t("quizzes.points")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center">
                        <div className="w-8 flex-shrink-0 flex items-center justify-center">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex flex-col">
                          <p className="text-lg font-semibold text-gray-900">
                            {submission.correct || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("quizzes.correctAnswers")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center">
                        <div className="w-8 flex-shrink-0 flex items-center justify-center">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex flex-col">
                          <p className="text-lg font-semibold text-gray-900">
                            {submission.total || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("quizzes.totalQuestions")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center">
                        <div className="w-8 flex-shrink-0 flex items-center justify-center">
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex flex-col">
                          <p className="text-lg font-semibold text-gray-900">
                            {Math.floor((submission.timeSpent || 0) / 60)}:
                            {((submission.timeSpent || 0) % 60)
                              .toString()
                              .padStart(2, "0")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("quizzes.timeSpent")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Retake Button */}
            <div className="mt-8 flex justify-center">
              {quizResults.currentAttempt < (quiz.maxAttempts || 1) ? (
                <button
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>
                    {t("quizzes.retake")} ({quizResults.currentAttempt}{" "}
                    {t("quizzes.attemptsLeft")})
                  </span>
                </button>
              ) : (
                <div className="w-full md:w-auto text-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg italic text-sm font-medium">
                  {t("quizzes.outOfAttempts")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original single submission result view
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-8">
            {quizResults.passed ? (
              <div className="text-green-600">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold">
                  {t("quizzes.congratulations")}
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  {t("quizzes.passedQuiz")}
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <XCircle className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold">{t("quizzes.tryHarder")}</h1>
                <p className="text-lg text-gray-600 mt-2">
                  {t("quizzes.needMoreStudy")}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="p-6 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-gray-900">
                  {quizResults.correct}
                </p>
                <p className="text-gray-600">{t("quizzes.correctAnswers")}</p>
              </div>
            </div>
            <div className="p-6 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-gray-900">
                  {quizResults.total}
                </p>
                <p className="text-gray-600">{t("quizzes.totalQuestions")}</p>
              </div>
            </div>
            <div className="p-6 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-gray-900">
                  {quizResults.score}
                </p>
                <p className="text-gray-600">{t("quizzes.score")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToList}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t("quizzes.back")}
            </button>
            {quizResults.currentAttempt < (quiz.maxAttempts || 1) && (
              <button
                onClick={handleRetakeQuiz}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t("quizzes.retake")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
