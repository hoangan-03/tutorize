/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  ChevronRight,
  PlayCircle,
  Eye,
  Users,
  BarChart3,
} from "lucide-react";
import { quizService } from "../../services/quizService";
import { Question, Quiz } from "../../types/api";
import { ExercisePublicView } from "./ExercisePublicView";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";

export const OnlineQuizzes: React.FC = () => {
  const { isTeacher } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"quizzes" | "exercises">(
    "quizzes"
  );
  const [currentView, setCurrentView] = useState<
    "list" | "quiz" | "result" | "teacher-view"
  >("list");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completed: 0,
    averageScore: 0,
    excellent: 0,
    averageTime: 0,
  });

  useEffect(() => {
    loadQuizzes();
    if (!isTeacher) {
      loadUserStats();
    }
  }, [isTeacher]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const result = await quizService.getQuizzes();
      setQuizzes(result.data);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Load user's quiz submissions to calculate stats
      const submissions = await quizService.getMySubmissions();
      const completedQuizzes = submissions.data.filter(
        (s: { status: string }) =>
          s.status === "SUBMITTED" || s.status === "GRADED"
      );

      const totalScore = completedQuizzes.reduce(
        (sum: any, sub: { score: any }) => sum + (sub.score || 0),
        0
      );
      const avgScore =
        completedQuizzes.length > 0
          ? Math.round(totalScore / completedQuizzes.length)
          : 0;
      const excellentCount = completedQuizzes.filter(
        (sub: { score: any }) => (sub.score || 0) >= 90
      ).length;
      const avgTime =
        completedQuizzes.length > 0
          ? Math.round(
              completedQuizzes.reduce(
                (sum: any, sub: { timeSpent: any }) =>
                  sum + (sub.timeSpent || 0),
                0
              ) / completedQuizzes.length
            )
          : 0;

      setUserStats({
        completed: completedQuizzes.length,
        averageScore: avgScore,
        excellent: excellentCount,
        averageTime: avgTime,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    if (isTeacher) {
      setCurrentView("teacher-view");
    } else {
      setCurrentView("quiz");
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    const questions = currentQuiz?.questions || [];
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!currentQuiz || !currentQuiz.questions) return;

    const questions = currentQuiz.questions;
    const correct = selectedAnswers.reduce((count, answer, index) => {
      const question = questions[index];
      const correctAnswers = question.correctAnswers;
      return (
        count +
        (Array.isArray(correctAnswers) &&
        correctAnswers.includes(answer.toString())
          ? 1
          : 0)
      );
    }, 0);

    const results = {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      passed: correct / questions.length >= 0.7,
    };

    setQuizResults(results);
    setCurrentView("result");

    // Submit quiz results to API if not teacher
    if (!isTeacher) {
      try {
        // TODO: Implement proper quiz submission flow
        // Need to create submission first, then save answers, then submit
        // const answers = selectedAnswers.map((answer, index) => ({
        //   questionId: currentQuiz.questions![index].id,
        //   answer: answer.toString(),
        // }));
        // await quizService.submitQuiz(submissionId);
        // Reload stats after submission
        loadUserStats();
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentView("list");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  // Teacher View for Quiz with Answers
  if (currentView === "teacher-view" && currentQuiz) {
    const questions = currentQuiz.questions || [];

    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentQuiz.title}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t("quizzes.viewWithAnswers")}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {currentQuiz.timeLimit || 15} {t("quizzes.minutes")}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>
                    {currentQuiz.submissions?.length || 0}{" "}
                    {t("quizzes.submissions")}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span>85% {t("quizzes.avgScore")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {questions.map((question: Question, questionIndex: number) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("quizzes.question")} {questionIndex + 1}:{" "}
                      {question.question}
                    </h3>
                    <Badge variant="points" className="px-2 py-1 text-sm">
                      {question.points || 1} {t("quizzes.point")}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {question.options &&
                      question.options.map(
                        (option: string, optionIndex: number) => {
                          const isCorrect =
                            question.correctAnswers === optionIndex.toString();

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 border rounded-lg ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                    isCorrect
                                      ? "border-green-500 bg-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isCorrect && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="ml-2">{option}</span>
                                {isCorrect && (
                                  <span className="ml-auto text-green-600 font-medium">
                                    {t("quizzes.correctAnswer")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("quizzes.backToList")}
              </button>
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t("quizzes.viewStatistics")}
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {t("quizzes.viewSubmissions")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "quiz" && currentQuiz) {
    const questions = currentQuiz.questions || [];
    if (questions.length === 0) {
      return (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Quiz không có câu hỏi
              </h2>
              <p className="text-gray-600 mb-6">
                Quiz này chưa được thiết lập câu hỏi.
              </p>
              <button
                onClick={resetQuiz}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      );
    }

    const question = questions[currentQuestionIndex];

    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentQuiz.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{currentQuiz.timeLimit || 15}:00</span>
                </div>
                <div className="text-gray-600">
                  {t("quizzes.question")} {currentQuestionIndex + 1}/
                  {questions.length}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options &&
                  question.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-8 border-2 rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            selectedAnswers[currentQuestionIndex] === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === index && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="ml-2">{option}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("quizzes.exit")}
              </button>
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {currentQuestionIndex < questions.length - 1
                  ? t("quizzes.nextQuestion")
                  : t("quizzes.finish")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "result" && quizResults) {
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
                  <h1 className="text-3xl font-bold">
                    {t("quizzes.tryHarder")}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {t("quizzes.needMoreStudy")}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {quizResults.correct}
                </div>
                <div className="text-gray-600">
                  {t("quizzes.correctAnswers")}
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {quizResults.total}
                </div>
                <div className="text-gray-600">
                  {t("quizzes.totalQuestions")}
                </div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {quizResults.percentage}%
                </div>
                <div className="text-gray-600">{t("quizzes.score")}</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("quizzes.backToList")}
              </button>
              <button
                onClick={() => startQuiz(currentQuiz!)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t("quizzes.retake")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("quizzes.testsAndExercises")}
          </h1>
          <p className="text-gray-600 mt-2">{t("quizzes.challengeYourself")}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("quizzes.tests")}
              </button>
              <button
                onClick={() => setActiveTab("exercises")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "exercises"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("quizzes.exercises")}
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {(activeTab as string) === "quizzes" && (
          <>
            {/* Stats Cards - Only show for students */}
            {!isTeacher && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Bài quiz đã hoàn thành
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {userStats.completed}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Điểm trung bình
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {userStats.averageScore}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Bài quiz xuất sắc
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {userStats.excellent}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Thời gian trung bình
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {userStats.averageTime} phút
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quizzes Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex-row flex items-start justify-start mb-4 w-full h-auto">
                        <div className="p-2 bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-start ml-3">
                          {quiz.title}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{quiz.questions?.length || 0} câu hỏi</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{quiz.timeLimit || 15} phút</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                          <Badge
                            variant="status"
                            className={`px-2 py-1 text-sm ${
                              quiz.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : quiz.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {quiz.status === "ACTIVE"
                              ? "Đang mở"
                              : quiz.status === "DRAFT"
                              ? "Nháp"
                              : "Đã đóng"}
                          </Badge>
                          {quiz.createdBy && (
                            <Badge
                              variant="default"
                              className="px-2 py-1 text-sm"
                            >
                              {quiz.createdBy}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {quiz.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <button
                        onClick={() => startQuiz(quiz)}
                        disabled={quiz.status !== "ACTIVE" && !isTeacher}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                          quiz.status !== "ACTIVE" && !isTeacher
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : isTeacher
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isTeacher ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem với đáp án
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Bắt đầu làm bài
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
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
        )}

        {/* Exercise Tab Content */}
        {activeTab === "exercises" && (
          <div>
            <ExercisePublicView />
          </div>
        )}
      </div>
    </div>
  );
};
