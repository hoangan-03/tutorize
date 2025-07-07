/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
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
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";
import { QuizManagement } from "./QuizManagement";

// Student Quiz Component
const StudentQuizView: React.FC = () => {
  const { user, isTeacher } = useAuth();
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<
    "list" | "quiz" | "result" | "teacher-view"
  >("list");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>(
    []
  );
  const [quizResults, setQuizResults] = useState<any>(null);
  console.log("quizResults", quizResults);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  console.log(quizzes);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    overdueQuizzes: 0,
    averageScore: 0,
    perfectCount: 0,
  });
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds remaining

  const storageKey = useMemo(() => {
    if (!user || !quizId) return null;
    return `quiz-attempt-${user.id}-${quizId}`;
  }, [user, quizId]);

  // Load state from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        setSelectedAnswers(state.answers);
        setTimeLeft(state.timeLeft);
      }
    }
  }, [storageKey]);

  // Persist state to localStorage
  useEffect(() => {
    if (storageKey && currentView === "quiz") {
      const stateToSave = { answers: selectedAnswers, timeLeft };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [selectedAnswers, timeLeft, storageKey, currentView]);

  useEffect(() => {
    // If there is a quizId in the URL, start the quiz directly
    if (quizId && !currentQuiz) {
      beginQuizAttempt(Number(quizId));
    } else if (!quizId) {
      // Otherwise, load the list of quizzes
      loadQuizzes();
      if (!isTeacher) {
        loadStudentStats();
      }
    }
  }, [quizId, isTeacher]);

  const clearAttemptAndNavigate = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    navigate("/quizzes");
  }, [storageKey, navigate]);

  // Updated to handle submission for unload
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (currentView === "quiz" && quizId) {
      event.preventDefault();
      // This will trigger the submission
      finishQuiz(true);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentView, quizId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const result = await quizService.getQuizzes();
      // Filter quizzes based on user role
      const filteredQuizzes = isTeacher
        ? result.data // Teachers can see all quizzes
        : result.data.filter((quiz: Quiz) => quiz.status === "ACTIVE"); // Students only see active quizzes
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
      console.log(
        "Loading student stats for user role:",
        isTeacher ? "teacher" : "student"
      );
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

  const resetQuiz = () => {
    setCurrentView("list");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
    setTimeLeft(0);
  };

  const handleExitQuiz = async () => {
    if (currentView === "quiz" && currentQuiz && !isTeacher) {
      const confirmExit = window.confirm(
        "Bạn có chắc muốn thoát? Bài làm sẽ được tự động nộp với kết quả hiện tại."
      );

      if (confirmExit) {
        await finishQuiz(true); // Auto-submit on exit
        clearAttemptAndNavigate(); // Clear state and navigate away
      }
    } else {
      // For other views or for teachers, just go back
      clearAttemptAndNavigate();
    }
  };

  const beginQuizAttempt = async (id: number) => {
    try {
      const detailedQuiz = await quizService.getQuiz(id);

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
        // User has taken this quiz, show history view
        setCurrentQuiz(submissionHistory.quiz);
        setQuizResults({
          ...submissionHistory,
          isSubmissionHistory: true,
        });
        setCurrentView("result");
      } else {
        // This is the first attempt, navigate to the player
        navigate(`/quiz/${quiz.id}/play`);
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
            (_answer: any, index: number) =>
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

        console.log("SubmissionHistory response:", submissionHistory);
        console.log(
          "maxScore from submissionHistory:",
          submissionHistory.maxScore
        );

        // Calculate results from submission
        const results = {
          correct:
            submission.answers?.filter((a: any) => a.isCorrect).length || 0,
          total: questions.length,
          passed: submission.score / submission.totalPoints >= 0.7,
          submission: submission,
          isAutoSubmit: isAutoSubmit,
          submissions: submissionHistory.submissions,
          canRetake: submissionHistory.canRetake,
          remainingAttempts: submissionHistory.remainingAttempts,
          currentAttempt: submissionHistory.currentAttempt,
          maxScore: submissionHistory.maxScore,
          isSubmissionHistory: true,
        };

        setQuizResults(results);
        setCurrentView("result");
        setTimeLeft(0); // Stop the timer

        // Reload stats after submission
        loadStudentStats();
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
                  <span>8.5 {t("quizzes.avgScore")}</span>
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
                    {/* Multiple Choice Questions */}
                    {question.type === "MULTIPLE_CHOICE" &&
                      question.options &&
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

                    {/* True/False Questions */}
                    {question.type === "TRUE_FALSE" && (
                      <div className="space-y-3">
                        <div
                          className={`p-3 border rounded-lg ${
                            question.correctAnswer === "true"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                question.correctAnswer === "true"
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {question.correctAnswer === "true" && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="font-medium text-lg">Đúng</span>
                            {question.correctAnswer === "true" && (
                              <span className="ml-auto text-green-600 font-medium">
                                {t("quizzes.correctAnswer")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`p-3 border rounded-lg ${
                            question.correctAnswer === "false"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                question.correctAnswer === "false"
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {question.correctAnswer === "false" && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="font-medium text-lg">Sai</span>
                            {question.correctAnswer === "false" && (
                              <span className="ml-auto text-green-600 font-medium">
                                {t("quizzes.correctAnswer")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
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
                  {/* {timeLeft <= 300 && (
                    <span className="ml-2 text-sm font-medium animate-pulse">
                      {t("quizzes.timeRunningOut")}
                    </span>
                  )} */}
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
                <div className="flex items-center justify-start">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <div className="text-start">
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
                {question.type === "MULTIPLE_CHOICE" &&
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

                {/* True/False Questions */}
                {question.type === "TRUE_FALSE" && (
                  <div className="space-y-4">
                    <button
                      onClick={() => selectAnswer("true")}
                      className={`w-full text-left p-8 border-2 rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === "true"
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            selectedAnswers[currentQuestionIndex] === "true"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === "true" && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg">Đúng</span>
                      </div>
                    </button>
                    <button
                      onClick={() => selectAnswer("false")}
                      className={`w-full text-left p-8 border-2 rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === "false"
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            selectedAnswers[currentQuestionIndex] === "false"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] ===
                            "false" && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg">Sai</span>
                      </div>
                    </button>
                  </div>
                )}

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
                onClick={handleExitQuiz}
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

              {/* Final Score Section */}
              {quizResults.maxScore !== undefined &&
                quizResults.maxScore !== null && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xl font-semibold text-blue-900 text-center">
                      {t("quizzes.finalScore")}{" "}
                      {(quizResults.maxScore || 0).toFixed(1)}
                    </p>
                  </div>
                )}

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
                      onClick={() => beginQuizAttempt(Number(quizId))}
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
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className="text-xl font-semibold text-gray-900">
                    {(
                      ((quizResults.submission.score || 0) /
                        (quizResults.submission.totalPoints || 1)) *
                      10
                    ).toFixed(1)}
                  </p>
                  <p className="text-gray-600">{t("quizzes.score")}</p>
                </div>
              </div>
            </div>

            {/* Show final score if available */}
            {quizResults.maxScore !== undefined &&
              quizResults.maxScore !== null && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900">
                    {t("quizzes.finalScore")}{" "}
                    {(quizResults.maxScore || 0).toFixed(1)}
                  </p>
                </div>
              )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t("quizzes.backToList")}
              </button>
              <button
                onClick={() => beginQuizAttempt(Number(quizId))}
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
    <div className="p-18">
      <div className="max-w-8xl mx-auto">
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
              {!isTeacher && (
                <div className="flex flex-row gap-6 mb-8">
                  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
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

                  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
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

                  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
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

                  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
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

                  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-[180px]">
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
              )}

              {/* Stats Cards - Teacher view */}
              {isTeacher && (
                <div className="flex flex-row gap-6 mb-8">
                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {quizzes.length}
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.totalQuizzes")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {quizzes.filter((q) => q.status === "ACTIVE").length}
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.active")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {quizzes.reduce(
                            (total, quiz) =>
                              total + (quiz.submissions?.length || 0),
                            0
                          )}
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.submissions")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {quizzes.filter((q) => q.status === "DRAFT").length}
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.draft")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

// Main OnlineQuizzes component
export const OnlineQuizzes: React.FC = () => {
  const { isTeacher } = useAuth();

  // If user is a teacher, show QuizManagement
  if (isTeacher) {
    return <QuizManagement />;
  }

  // If user is a student, show StudentQuizView
  return <StudentQuizView />;
};
