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
  Users,
  BarChart3,
  BookOpen,
  BookCheck,
  AlertTriangle,
  ArrowLeft,
  RotateCw,
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
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>(
    []
  );
  const [quizResults, setQuizResults] = useState<any>(null);
  console.log(quizResults);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completed: 0,
    averageScore: 0,
    excellent: 0,
    averageTime: 0,
  });
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds remaining

  useEffect(() => {
    loadQuizzes();
    if (!isTeacher) {
      loadUserStats();
    }
  }, [isTeacher]);

  // Countdown timer effect
  useEffect(() => {
    if (currentView === "quiz" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up! Auto submit
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentView, timeLeft]);

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

  const resetQuiz = () => {
    setCurrentView("list");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
    setTimeLeft(0);
  };

  const beginQuizAttempt = async (quiz: Quiz) => {
    try {
      // Luôn lấy chi tiết quiz mới nhất với các câu hỏi cho một lượt làm bài mới
      const detailedQuiz = await quizService.getQuiz(quiz.id);

      if (!detailedQuiz.questions || detailedQuiz.questions.length === 0) {
        alert("Quiz này hiện không có câu hỏi nào để làm.");
        resetQuiz();
        return;
      }

      setCurrentQuiz(detailedQuiz);
      setCurrentView("quiz");
      setQuizStartTime(Date.now());
      setTimeLeft((detailedQuiz.timeLimit || 15) * 60);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setQuizResults(null);
    } catch (error) {
      console.error("Lỗi khi bắt đầu lượt làm bài mới:", error);
      alert("Có lỗi khi bắt đầu lượt làm bài mới. Vui lòng thử lại.");
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      if (isTeacher) {
        const detailedQuiz = await quizService.getQuizWithAnswers(quiz.id);
        setCurrentQuiz(detailedQuiz);
        setCurrentView("teacher-view");
        return;
      }

      const submissionHistory = await quizService.getQuizSubmissionHistory(
        quiz.id
      );

      if (
        submissionHistory.submissions &&
        submissionHistory.submissions.length > 0
      ) {
        // Người dùng đã làm bài này trước đó, hiển thị view lịch sử
        setCurrentQuiz(submissionHistory.quiz);
        setQuizResults({
          ...submissionHistory,
          isSubmissionHistory: true,
        });
        setCurrentView("result");
      } else {
        // Đây là lần làm bài đầu tiên
        await beginQuizAttempt(quiz);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết quiz:", error);
      alert("Có lỗi khi tải chi tiết quiz. Vui lòng thử lại.");
    }
  };

  const selectAnswer = (answer: number | string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
    selectAnswer(text);
  };

  const goToQuestion = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const nextQuestion = () => {
    const questions = currentQuiz?.questions || [];
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async (isAutoSubmit = false) => {
    if (!currentQuiz || !currentQuiz.questions) return;

    const questions = currentQuiz.questions;

    // Submit quiz if not teacher
    if (!isTeacher) {
      try {
        // Filter out unanswered questions
        const validAnswers = selectedAnswers
          .map((answer, index) => ({
            questionId: questions[index].id,
            userAnswer:
              answer !== undefined && answer !== ""
                ? answer.toString().trim()
                : "",
            timeTaken: 0, // You can track time per question if needed
          }))
          .filter(
            (answer, index) =>
              selectedAnswers[index] !== undefined &&
              selectedAnswers[index] !== "" &&
              (typeof selectedAnswers[index] === "string"
                ? (selectedAnswers[index] as string).trim() !== ""
                : true)
          );

        const submitData = {
          answers: validAnswers,
          timeSpent: Math.floor((Date.now() - quizStartTime) / 1000), // Time in seconds
        };

        if (isAutoSubmit) {
          // Show auto-submit notification
          alert(
            `Hết giờ làm bài! Hệ thống đã tự động nộp bài với ${validAnswers.length}/${questions.length} câu đã trả lời.`
          );
        }

        const submission = await quizService.submitQuiz(
          currentQuiz.id,
          submitData
        );

        // Sau khi nộp, lấy lại lịch sử để cập nhật số lượt còn lại
        const submissionHistory = await quizService.getQuizSubmissionHistory(
          currentQuiz.id
        );

        // Calculate results from submission
        const results = {
          correct:
            submission.answers?.filter((a: any) => a.isCorrect).length || 0,
          total: questions.length,
          percentage: Math.round(
            (submission.score / submission.totalPoints) * 100
          ),
          passed: submission.score / submission.totalPoints >= 0.7,
          submission: submission,
          isAutoSubmit: isAutoSubmit,
          submissions: submissionHistory.submissions,
          canRetake: submissionHistory.canRetake,
          remainingAttempts: submissionHistory.remainingAttempts,
          currentAttempt: submissionHistory.currentAttempt,
          isSubmissionHistory: true,
        };

        setQuizResults(results);
        setCurrentView("result");
        setTimeLeft(0); // Stop the timer

        // Reload stats after submission
        loadUserStats();
      } catch (error: any) {
        console.error("Error submitting quiz:", error);

        // Handle specific error cases
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage.includes("đã nộp bài")) {
            alert(
              "Bạn đã hoàn thành quiz này trước đó rồi. Bạn sẽ được chuyển về danh sách quiz."
            );
            resetQuiz();
            return;
          } else if (errorMessage.includes("hết hạn")) {
            alert("Quiz này đã hết hạn nộp bài.");
            resetQuiz();
            return;
          }
        }

        alert("Có lỗi khi nộp bài quiz. Vui lòng thử lại.");
      }
    }
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
                            question.correctAnswer === optionIndex.toString();

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
                {t("quizzes.back")}
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
                <div
                  className={`flex items-center ${
                    timeLeft <= 300
                      ? "text-red-600"
                      : timeLeft <= 600
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-mono text-lg">
                    {Math.floor(timeLeft / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                  {timeLeft <= 300 && (
                    <span className="ml-2 text-sm font-medium animate-pulse">
                      {t("quizzes.timeRunningOut")}
                    </span>
                  )}
                </div>
                <div className="text-gray-600">
                  {t("quizzes.question")} {currentQuestionIndex + 1}/
                  {questions.length}
                </div>
              </div>
            </div>

            {/* Time Warning Banner */}
            {timeLeft <= 300 && timeLeft > 0 && (
              <div
                className={`mb-6 p-4 rounded-lg border-l-4 ${
                  timeLeft <= 60
                    ? "bg-red-50 border-red-500 text-red-800"
                    : timeLeft <= 180
                    ? "bg-orange-50 border-orange-500 text-orange-800"
                    : "bg-yellow-50 border-yellow-500 text-yellow-800"
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium">
                      {timeLeft <= 60
                        ? "Chỉ còn ít hơn 1 phút!"
                        : timeLeft <= 180
                        ? "Chỉ còn ít hơn 3 phút!"
                        : "Chỉ còn ít hơn 5 phút!"}
                    </h3>
                    <p className="text-sm opacity-80">
                      Hãy hoàn thành các câu hỏi còn lại và nộp bài trước khi
                      hết giờ.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              {/* Quiz Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Time Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 300
                      ? "bg-red-500"
                      : timeLeft <= 600
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      (timeLeft / ((currentQuiz.timeLimit || 15) * 60)) * 100
                    )}%`,
                  }}
                ></div>
              </div>

              {/* Question Navigation */}
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {t("quizzes.questions")}:
                </span>
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-blue-600 text-white"
                        : selectedAnswers[index] !== undefined &&
                          selectedAnswers[index] !== "" &&
                          (typeof selectedAnswers[index] === "string"
                            ? (selectedAnswers[index] as string).trim() !== ""
                            : true)
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-white text-gray-600 border border-gray-300"
                    } hover:bg-blue-100`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {question.question}
              </h2>

              <div className="space-y-4">
                {/* Multiple Choice Questions */}
                {(question.type === "MULTIPLE_CHOICE" ||
                  question.type === "TRUE_FALSE") &&
                  question.options &&
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

                {/* Fill in the Blank Questions */}
                {question.type === "FILL_BLANK" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập câu trả lời của bạn:
                    </label>
                    <input
                      type="text"
                      value={
                        typeof selectedAnswers[currentQuestionIndex] ===
                        "string"
                          ? selectedAnswers[currentQuestionIndex]
                          : ""
                      }
                      onChange={(e) => handleTextAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Essay Questions */}
                {question.type === "ESSAY" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viết câu trả lời của bạn:
                    </label>
                    <textarea
                      value={
                        typeof selectedAnswers[currentQuestionIndex] ===
                        "string"
                          ? selectedAnswers[currentQuestionIndex]
                          : ""
                      }
                      onChange={(e) => handleTextAnswer(e.target.value)}
                      placeholder="Viết câu trả lời chi tiết..."
                      rows={6}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Câu hỏi tự luận cần được giáo viên chấm điểm thủ công.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("quizzes.exit")}
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  {t("quizzes.previousQuestion")}
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={
                    selectedAnswers[currentQuestionIndex] === undefined ||
                    selectedAnswers[currentQuestionIndex] === "" ||
                    (typeof selectedAnswers[currentQuestionIndex] ===
                      "string" &&
                      (
                        selectedAnswers[currentQuestionIndex] as string
                      ).trim() === "")
                  }
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
      </div>
    );
  }

  if (currentView === "result" && quizResults) {
    // Check if this is submission history view
    if (quizResults.isSubmissionHistory) {
      return (
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentQuiz?.title}
                </h1>
              </div>

              {/* Submission History */}
              <div className="space-y-6">
                {quizResults.submissions?.map(
                  (submission: any, index: number) => (
                    <div
                      key={submission.id}
                      className="bg-gray-50 rounded-lg p-6 border"
                    >
                      <div className="flex items-center justify-between mb-4">
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
                            {Math.round(
                              (submission.score / submission.totalPoints) * 100
                            )}
                            %
                          </div>
                          <div className="text-sm text-gray-600">
                            {submission.score}/{submission.totalPoints}{" "}
                            {t("quizzes.points")}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-lg font-semibold text-green-600">
                            {submission.answers?.filter((a: any) => a.isCorrect)
                              .length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("quizzes.correctAnswers")}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-lg font-semibold text-gray-600">
                            {submission.answers?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("quizzes.totalQuestions")}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-lg font-semibold text-orange-600">
                            {Math.floor(submission.timeSpent / 60)}:
                            {(submission.timeSpent % 60)
                              .toString()
                              .padStart(2, "0")}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("quizzes.time")}
                          </div>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {t("quizzes.feedback")}:
                          </h4>
                          <p className="text-blue-800">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("quizzes.back")}</span>
                </button>
                <div className="flex items-center space-x-4">
                  {quizResults.currentAttempt > 0 ? (
                    <button
                      onClick={() => beginQuizAttempt(currentQuiz!)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>
                        {t("quizzes.retake")} ({quizResults.currentAttempt}{" "}
                        {t("quizzes.attemptsLeft")})
                      </span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg italic text-sm font-medium">
                      {t("quizzes.outOfAttempts")}
                    </div>
                  )}
                </div>
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
                onClick={() => beginQuizAttempt(currentQuiz!)}
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
          <div className="border-b border-gray-200 pl-12">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-lg ${
                  activeTab === "quizzes"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("quizzes.tests")}
              </button>
              <button
                onClick={() => setActiveTab("exercises")}
                className={`py-2 px-1 border-b-2 font-medium text-lg ${
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
            {/* Quizzes Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {/* Stats Cards - Student view */}
                {!isTeacher && (
                  <div className="flex flex-row gap-6 mb-8 col-span-full">
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {userStats.completed}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Đã hoàn thành
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {userStats.averageScore}%
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Điểm TB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {userStats.excellent}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Xuất sắc
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {userStats.averageTime}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Phút TB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Cards - Teacher view */}
                {isTeacher && (
                  <div className="flex flex-row gap-6 mb-8 col-span-full">
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {quizzes.length}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Tổng quiz
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {
                              quizzes.filter((q) => q.status === "ACTIVE")
                                .length
                            }
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Đang hoạt động
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {quizzes.reduce(
                              (total, quiz) =>
                                total + (quiz.submissions?.length || 0),
                              0
                            )}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Lượt nộp bài
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[180px]">
                      <div className="flex items-center justify-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-2 flex flex-row items-center gap-5">
                          <p className="text-xl font-semibold text-gray-900">
                            {quizzes.filter((q) => q.status === "DRAFT").length}
                          </p>
                          <p className="text-base font-medium text-gray-600">
                            Nháp
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                              quiz.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : quiz.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {quiz.status === "ACTIVE"
                              ? t("status.active")
                              : quiz.status === "DRAFT"
                              ? t("status.draft")
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
                      disabled={quiz.status !== "ACTIVE" && !isTeacher}
                      className={`w-full flex text-sm items-center font-bold justify-center px-4 py-2 rounded-md transition-colors ${
                        quiz.status !== "ACTIVE" && !isTeacher
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isTeacher
                          ? "bg-green-700 text-white hover:bg-green-800"
                          : "bg-blue-700 text-white hover:bg-blue-800"
                      }`}
                    >
                      {isTeacher ? (
                        <>{t("quizzes.viewWithAnswersButton")}</>
                      ) : (
                        <>{t("quizzes.startQuiz")}</>
                      )}
                    </button>
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
