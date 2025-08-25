/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  RotateCw,
  CalendarClock,
  Eye,
} from "lucide-react";
import { quizService } from "../services/quizService";

import { Question, Quiz, QuizStatus, QuizSubmission, Role } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

import {
  useModal,
  useQuiz,
  useQuizSubmissionHistory,
  useQuizTaking,
  useQuizzes,
  useStudentStats,
} from "../hooks";
import { mutate } from "swr";
import { formatDate, formatDateTime } from "../components/utils";
import { ActionButton, Badge, StatCard } from "../components/ui";

const StudentQuizView: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === Role.TEACHER;
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess, showConfirm } = useModal();

  const [currentView, setCurrentView] = useState<
    "list" | "quiz" | "result" | "teacher-view"
  >("list");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>(
    []
  );

  const { quizzes, isLoading: loading, mutate: mutateQuizzes } = useQuizzes();
  const { stats: userStats } = useStudentStats();
  const { submitQuizWithAnswers } = useQuizTaking();

  const parsedQuizId = quizId ? parseInt(quizId) : null;
  const isPlayRoute = window.location.pathname.includes("/play");

  const { quiz: detailedQuizData } = useQuiz(
    currentView === "quiz" || currentView === "teacher-view" || isPlayRoute
      ? parsedQuizId
      : null
  );

  const { submissionHistory, mutate: mutateSubmissionHistory } =
    useQuizSubmissionHistory(
      currentView === "result" || (quizId && !isPlayRoute) ? parsedQuizId : null
    );

  const [quizResults, setQuizResults] = useState<{
    score?: number;
    totalQuestions?: number;
    correctAnswers?: number;
    percentage?: number;
    passed: boolean;
    correct?: number;
    total?: number;
    submission?: QuizSubmission;
    isAutoSubmit?: boolean;
    submissions?: QuizSubmission[];
    canRetake?: boolean;
    remainingAttempts?: number;
    currentAttempt?: number;
    maxScore?: number;
    isSubmissionHistory?: boolean;
    quiz?: Quiz;
  } | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds remaining

  const storageKey = useMemo(() => {
    if (!user || !quizId) return null;
    return `quiz-attempt-${user.id}-${quizId}`;
  }, [user, quizId]);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          const maxAge = 6 * 60 * 60 * 1000; // 6 hours
          if (state.timestamp && Date.now() - state.timestamp < maxAge) {
            setSelectedAnswers(state.answers || []);
            setCurrentQuestionIndex(state.currentQuestionIndex || 0);
            setQuizStartTime(state.quizStartTime || Date.now());

            const elapsedSinceLastSave = Math.floor(
              (Date.now() - state.timestamp) / 1000
            );
            const adjustedTimeLeft = Math.max(
              0,
              (state.timeLeft || 0) - elapsedSinceLastSave
            );
            setTimeLeft(adjustedTimeLeft);
          } else {
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.error("Error parsing saved quiz state:", error);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && currentView === "quiz" && currentQuiz) {
      const stateToSave = {
        answers: selectedAnswers,
        timeLeft,
        currentQuestionIndex,
        quizStartTime,
        quizId: currentQuiz.id,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [
    selectedAnswers,
    timeLeft,
    currentQuestionIndex,
    quizStartTime,
    storageKey,
    currentView,
    currentQuiz,
  ]);

  useEffect(() => {
    const isPlayRoute = window.location.pathname.includes("/play");

    if (isPlayRoute && detailedQuizData && !currentQuiz) {
      beginQuizAttempt(detailedQuizData.id);
    }
  }, [detailedQuizData, currentQuiz]);

  useEffect(() => {
    const isPlayRoute = window.location.pathname.includes("/play");

    if (!isPlayRoute && quizId && submissionHistory && !currentQuiz) {
      if (isTeacher) {
        setCurrentQuiz(detailedQuizData || null);
        setCurrentView("teacher-view");
      } else if (
        submissionHistory.submissions &&
        submissionHistory.submissions.length > 0
      ) {
        setCurrentQuiz(submissionHistory.quiz);
        setQuizResults({
          ...submissionHistory,
          passed: false,
          isSubmissionHistory: true,
        });
        setCurrentView("result");
      } else {
        navigate(`/quiz/${quizId}/play`);
      }
    }
  }, [
    submissionHistory,
    quizId,
    currentQuiz,
    isTeacher,
    navigate,
    detailedQuizData,
  ]);

  useEffect(() => {
    if (!quizId) {
      setCurrentView("list");
      setCurrentQuiz(null);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setQuizResults(null);
      setTimeLeft(0);
    }
  }, [quizId]);

  const clearAttemptAndNavigate = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    setCurrentView("list");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
    setTimeLeft(0);

    navigate("/quizzes", { replace: true });
  }, [storageKey, navigate]);

  // Timer effect for countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentView === "quiz" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimeout(async () => {
              try {
                showSuccess(
                  "Hết giờ làm bài! Hệ thống đang tự động nộp bài...",
                  {
                    title: "Hết thời gian",
                    autoClose: true,
                    autoCloseDelay: 5000,
                  }
                );
                await finishQuiz(true);
              } catch (error) {
                console.error("Error during auto-submit:", error);
                clearAttemptAndNavigate();
              }
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentView, timeLeft]);

  const autoSubmitWithZeroScore = async () => {
    if (!currentQuiz || !currentQuiz.questions || isTeacher) return;

    try {
      const submitData = {
        answers: [],
        timeSpent: Math.floor((Date.now() - quizStartTime) / 1000),
      };

      await submitQuizWithAnswers(currentQuiz.id, submitData);

      // Invalidate submission history cache
      mutateSubmissionHistory();

      // Also invalidate quiz list to update submission counts
      mutateQuizzes();

      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error auto-submitting quiz:", error);
    }
  };

  const handleQuizExit = async () => {
    if (currentView === "quiz" && currentQuiz && !isTeacher) {
      console.log("Quiz exit requested - auto-submitting with score 0");
      await autoSubmitWithZeroScore();
    }
    clearAttemptAndNavigate();
  };

  useEffect(() => {
    const handleBeforeUnloadFixed = (event: BeforeUnloadEvent) => {
      if (currentView === "quiz" && currentQuiz && !isTeacher) {
        event.preventDefault();
        event.returnValue =
          "Bạn có chắc muốn rời khỏi trang? Bài làm sẽ được tự động nộp với điểm 0.";
        return event.returnValue;
      }
    };

    const handleVisibilityChangeFixed = () => {
      if (
        document.hidden &&
        currentView === "quiz" &&
        currentQuiz &&
        !isTeacher
      ) {
        console.log(
          "Tab switched while in quiz - auto-submitting with score 0"
        );
        autoSubmitWithZeroScore();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnloadFixed);
    document.addEventListener("visibilitychange", handleVisibilityChangeFixed);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnloadFixed);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChangeFixed
      );
    };
  }, [currentView, currentQuiz, isTeacher]);

  // Handle browser navigation (back button, etc.)
  useEffect(() => {
    const handlePopState = async () => {
      if (currentView === "quiz" && currentQuiz && !isTeacher) {
        console.log(
          "Browser navigation detected during quiz - auto-submitting with score 0"
        );
        await autoSubmitWithZeroScore();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentView, currentQuiz, isTeacher, autoSubmitWithZeroScore]);

  const beginQuizAttempt = async (id: number) => {
    try {
      if (!id || id <= 0) {
        console.error("Invalid quiz ID:", id);
        showError("ID quiz không hợp lệ.");
        return;
      }

      console.log("Beginning quiz attempt for ID:", id);

      const detailedQuiz = detailedQuizData;
      if (!detailedQuiz) {
        console.log("No quiz data available, will retry when data loads");
        return; // Let the hook load the data
      }

      if (!detailedQuiz.questions || detailedQuiz.questions.length === 0) {
        showError("Quiz này hiện không có câu hỏi nào để làm.");
        clearAttemptAndNavigate();
        return;
      }

      const savedState = storageKey ? localStorage.getItem(storageKey) : null;
      let hasValidSavedState = false;

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const maxAge = 6 * 60 * 60 * 1000;
          if (
            state.timestamp &&
            Date.now() - state.timestamp < maxAge &&
            state.quizId === id
          ) {
            hasValidSavedState = true;
            console.log(
              "Found valid saved state, will preserve timer and progress"
            );
          }
        } catch (error) {
          console.error("Error checking saved state:", error);
        }
      }

      setCurrentQuiz(detailedQuiz);
      setCurrentView("quiz");

      if (!hasValidSavedState) {
        setQuizStartTime(Date.now());
        setTimeLeft((detailedQuiz.timeLimit || 15) * 60);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
        console.log("Starting fresh quiz attempt");
      } else {
        console.log("Preserving existing quiz state from localStorage");
      }

      setQuizResults(null);

      console.log("Quiz attempt started successfully for:", detailedQuiz.title);
    } catch (error: unknown) {
      console.error("Lỗi khi bắt đầu lượt làm bài mới:", error);

      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          alert("Không tìm thấy quiz này.");
        } else if (httpError.response?.status === 403) {
          alert("Bạn không có quyền truy cập quiz này.");
        } else if (httpError.response?.status === 400) {
          alert("Quiz này đã hết hạn hoặc không còn hoạt động.");
        } else {
          alert("Có lỗi khi bắt đầu lượt làm bài mới. Vui lòng thử lại.");
        }
      } else {
        alert("Có lỗi khi bắt đầu lượt làm bài mới. Vui lòng thử lại.");
      }
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      if (isTeacher) {
        navigate(`/quiz/${quiz.id}?view=teacher`);
        return;
      }
      navigate(`/quiz/${quiz.id}`);
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

    if (!isTeacher) {
      try {
        const validAnswers = selectedAnswers
          .map((answer, index) => {
            const userAnswer =
              answer !== undefined && answer !== ""
                ? answer.toString().trim()
                : "";

            return {
              questionId: questions[index].id,
              userAnswer: userAnswer,
              timeTaken: 0,
            };
          })
          .filter(
            (_answer: unknown, index: number) =>
              selectedAnswers[index] !== undefined &&
              selectedAnswers[index] !== "" &&
              (typeof selectedAnswers[index] === "string"
                ? (selectedAnswers[index] as string).trim() !== ""
                : true)
          );

        const submitData = {
          answers: validAnswers,
          timeSpent: Math.floor((Date.now() - quizStartTime) / 1000), // in seconds
        };

        if (isAutoSubmit) {
          console.log("Quiz auto-submitted due to timeout");
        }

        const submission = await submitQuizWithAnswers(
          currentQuiz.id,
          submitData
        );

        // Get fresh submission history data
        const freshSubmissionHistory =
          await quizService.getQuizSubmissionHistory(currentQuiz.id);

        console.log(
          "Fresh submission history after submit:",
          freshSubmissionHistory
        );
        console.log(
          "Number of submissions:",
          freshSubmissionHistory.submissions?.length
        );

        const results = {
          correct: submission.answers?.filter((a) => a.isCorrect).length || 0,
          total: questions.length,
          passed: submission.score / submission.totalPoints >= 0.7,
          submission: submission,
          isAutoSubmit: isAutoSubmit,
          submissions: freshSubmissionHistory.submissions,
          canRetake: freshSubmissionHistory.canRetake,
          remainingAttempts: freshSubmissionHistory.remainingAttempts,
          currentAttempt: freshSubmissionHistory.currentAttempt,
          maxScore: freshSubmissionHistory.maxScore ?? undefined,
          isSubmissionHistory: true,
          quiz: freshSubmissionHistory.quiz || currentQuiz,
        };

        console.log("Quiz results with fresh data:", results);

        // Remove the timeout since we'll invalidate before setting view

        if (isAutoSubmit) {
          showSuccess(
            `Hết giờ làm bài! Quiz đã được nộp với ${validAnswers.length}/${
              questions.length
            } câu trả lời. Điểm: ${(
              (submission.score / submission.totalPoints) *
              10
            ).toFixed(1)}`,
            { autoClose: true, autoCloseDelay: 8000 }
          );

          setTimeout(() => {
            clearAttemptAndNavigate();
          }, 8500);
        } else {
          // Update cache with fresh data immediately
          mutate(
            `/quizzes/${currentQuiz.id}/submission-history`,
            freshSubmissionHistory,
            false
          );
          mutate(["/quizzes", undefined], undefined, { revalidate: true });

          setQuizResults(results);
          setCurrentView("result");

          if (storageKey) {
            localStorage.removeItem(storageKey);
          }

          navigate(`/quiz/${currentQuiz.id}`, { replace: true });
        }

        setTimeLeft(0);
      } catch (error: unknown) {
        console.error("Error submitting quiz:", error);

        if (error && typeof error === "object" && "response" in error) {
          const httpError = error as {
            response?: { status?: number; data?: { message?: string } };
          };
          if (httpError.response?.status === 400) {
            const errorMessage =
              httpError.response?.data?.message || "Unknown error";
            if (errorMessage.includes("đã nộp bài")) {
              alert(
                "Bạn đã hoàn thành quiz này trước đó rồi. Bạn sẽ được chuyển về danh sách quiz."
              );
              clearAttemptAndNavigate();
              return;
            } else if (errorMessage.includes("hết hạn")) {
              alert("Quiz này đã hết hạn nộp bài.");
              clearAttemptAndNavigate();
              return;
            }
          }
        }

        if (isAutoSubmit) {
          console.error("Auto-submit failed, navigating back to quiz list");
          clearAttemptAndNavigate();
        } else {
          alert("Có lỗi khi nộp bài quiz. Vui lòng thử lại.");
        }
      }
    }
  };

  if (currentView === "teacher-view" && currentQuiz) {
    const questions = currentQuiz.questions || [];

    return (
      <div className="p-3 lg:p-8">
        <div className="mx-auto p-2 lg:p-6 lg:px-16 xl:px-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-8">
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

                  {/* Display question images if they exist */}
                  {question.imageUrls && question.imageUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.imageUrls.map(
                          (imageUrl: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Question ${questionIndex + 1} image ${
                                  index + 1
                                }`}
                                className="w-full h-auto max-h-48 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => {
                                  window.open(imageUrl, "_blank");
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

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
              <ActionButton
                onClick={clearAttemptAndNavigate}
                colorTheme="white"
                hasIcon={false}
                text={t("quizzes.backToList")}
                size="md"
                className="px-6 py-2 border border-gray-300 text-gray-700"
              />
              <div className="flex space-x-4">
                <ActionButton
                  colorTheme="blue"
                  hasIcon={true}
                  icon={BarChart3}
                  text={t("quizzes.viewStatistics")}
                  size="md"
                  className="px-6 py-2"
                  onClick={() => {}}
                />
                <ActionButton
                  colorTheme="green"
                  hasIcon={true}
                  icon={Users}
                  text={t("quizzes.viewSubmissions")}
                  size="md"
                  className="px-6 py-2"
                  onClick={() => {}}
                />
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
        <div className="p-3 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Quiz không có câu hỏi
              </h2>
              <p className="text-gray-600 mb-6">
                Quiz này chưa được thiết lập câu hỏi.
              </p>
              <ActionButton
                onClick={clearAttemptAndNavigate}
                colorTheme="blue"
                hasIcon={false}
                text={t("quizzes.back")}
                size="md"
                className="px-6 py-2"
              />
            </div>
          </div>
        </div>
      );
    }

    const question = questions[currentQuestionIndex];

    return (
      <div className="p-2 md:p-3 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-3 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
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
                  <span className="font-mono text-base md:text-lg">
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
                <div className="text-gray-600 text-sm md:text-base">
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
                        ? t("quizzes.lessThan1Minute")
                        : timeLeft <= 180
                        ? t("quizzes.lessThan3Minutes")
                        : t("quizzes.lessThan5Minutes")}
                    </h3>
                    <p className="text-sm opacity-80">
                      {t("quizzes.timeRunningOut")}
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
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg items-center">
                {/* <span className="text-sm font-medium text-gray-700 mr-2 items-center justify-center">
                  {t("quizzes.questions")}:
                </span> */}
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

              {/* Display question images if they exist */}
              {question.imageUrls && question.imageUrls.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.imageUrls.map(
                      (imageUrl: string, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Question image ${index + 1}`}
                            className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              // Open image in modal/lightbox - you can implement this if needed
                              window.open(imageUrl, "_blank");
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Multiple Choice Questions */}
                {question.type === "MULTIPLE_CHOICE" &&
                  question.options &&
                  question.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-4 md:p-3 lg:p-8 border-2 rounded-lg transition-colors ${
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
                      className={`w-full text-left p-4 md:p-3 lg:p-8 border-2 rounded-lg transition-colors ${
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
                        <span className="font-medium text-base md:text-lg">
                          Đúng
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => selectAnswer("false")}
                      className={`w-full text-left p-4 md:p-3 lg:p-8 border-2 rounded-lg transition-colors ${
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
                        <span className="font-medium text-base md:text-lg">
                          Sai
                        </span>
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
              {/* Hide Exit button for first attempt */}
              {submissionHistory?.submissions &&
                submissionHistory.submissions.length > 0 && (
                  <ActionButton
                    onClick={() => {
                      console.log(
                        "Exit button clicked, current view:",
                        currentView
                      );
                      if (currentView === "quiz" && currentQuiz && !isTeacher) {
                        showConfirm(
                          "Bạn có chắc muốn thoát khỏi quiz? Lượt làm bài này sẽ được tính là 0 điểm.",
                          () => {
                            handleQuizExit();
                          },
                          {
                            title: "Xác nhận thoát",
                            confirmText: "Thoát",
                            cancelText: "Tiếp tục làm bài",
                          }
                        );
                      } else {
                        clearAttemptAndNavigate();
                      }
                    }}
                    colorTheme="white"
                    hasIcon={false}
                    text={t("quizzes.exit")}
                    size="md"
                    className="px-4 py-2 md:px-6 text-sm md:text-base border border-gray-300 text-gray-700"
                  />
                )}
              {/* Spacer for first attempt to maintain layout */}
              {(!submissionHistory?.submissions ||
                submissionHistory.submissions.length === 0) && <div></div>}
              <div className="flex space-x-2 md:space-x-4">
                <ActionButton
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  colorTheme="white"
                  hasIcon={false}
                  text={t("quizzes.previousQuestion")}
                  size="md"
                  className="px-4 py-2 md:px-6 text-sm md:text-base border border-gray-300 text-gray-700 [&>svg]:rotate-180"
                  textColor="gray"
                />
                <ActionButton
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
                  colorTheme="blue"
                  hasIcon={false}
                  text={
                    currentQuestionIndex < questions.length - 1
                      ? t("quizzes.nextQuestion")
                      : t("quizzes.finish")
                  }
                  size="md"
                  className="px-4 py-2 md:px-6 text-sm md:text-base [&>svg]:ml-2"
                />
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
        <div className="p-3 lg:p-8">
          <div className="mx-auto p-2 lg:p-6 lg:px-16 xl:px-20">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-8">
              <div className="mb-2">
                <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {currentQuiz?.title}
                </h1>
              </div>

              {/* Submission History */}
              <div className="space-y-6">
                {quizResults.submissions?.map(
                  (submission: QuizSubmission, index: number) => (
                    <div
                      key={submission.id}
                      className="bg-gray-50 rounded-lg p-6 border"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col text-start">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                            {t("quizzes.attempt")} #{index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(submission.submittedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg lg:text-2xl font-bold text-blue-600">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1 lg:mb-4">
                        <div className="text-center p-3 bg-white rounded">
                          <div className="text-lg font-semibold text-green-600">
                            {submission.answers?.filter((a) => a.isCorrect)
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
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {t("quizzes.feedback")}:
                          </h4>
                          <p className="text-blue-800">{submission.feedback}</p>
                        </div>
                      )}

                      {/* Review Button */}
                      <div className="flex justify-end">
                        <ActionButton
                          onClick={() => {
                            const quizIdForReview =
                              currentQuiz?.id || Number(quizId);
                            if (quizIdForReview) {
                              navigate(
                                `/quiz/submission/review/${quizIdForReview}/${submission.id}`
                              );
                            }
                          }}
                          colorTheme="white"
                          hasIcon={true}
                          icon={Eye}
                          text={t("ielts.review")}
                          size="md"
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100"
                          textColor="blue"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Final Score Section */}
              {quizResults.maxScore !== undefined &&
                quizResults.maxScore !== null && (
                  <div className="mt-2 lg:mt-8 p-2 lg:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-base lg:text-xl font-semibold text-blue-900 text-center">
                      {t("quizzes.finalScore")}{" "}
                      {(quizResults.maxScore || 0).toFixed(1)}
                    </p>
                  </div>
                )}

              {/* Action buttons */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2 lg:mt-10 border-t border-gray-200">
                <ActionButton
                  onClick={clearAttemptAndNavigate}
                  colorTheme="white"
                  hasIcon={true}
                  icon={ArrowLeft}
                  text={t("quizzes.back")}
                  size="md"
                  className="w-full md:w-auto border border-gray-300"
                  textColor="gray"
                />
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  {quizResults.canRetake &&
                  (quizResults.remainingAttempts ?? 0) > 0 ? (
                    <ActionButton
                      onClick={() => {
                        const quizIdToRetake =
                          currentQuiz?.id ||
                          quizResults.quiz?.id ||
                          Number(quizId);
                        if (quizIdToRetake) {
                          // Clear localStorage before retaking
                          if (storageKey) {
                            localStorage.removeItem(storageKey);
                          }
                          navigate(`/quiz/${quizIdToRetake}/play`);
                        } else {
                          showError(
                            "Không thể làm lại quiz. Vui lòng thử lại."
                          );
                        }
                      }}
                      colorTheme="blue"
                      hasIcon={true}
                      icon={RotateCw}
                      text={`${t("quizzes.retake")} (${
                        quizResults.remainingAttempts
                      } ${t("quizzes.attemptsLeft")})`}
                      size="md"
                      className="w-full md:w-auto font-bold"
                    />
                  ) : (
                    <div className="w-full md:w-auto text-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg italic text-sm font-medium">
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

    return (
      <div className="p-3 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-8 text-center">
            <div className="mb-8">
              {quizResults.passed ? (
                <div className="text-green-600">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  <h1 className="text-base md:text-xl lg:text-3xl font-bold">
                    {t("quizzes.congratulations")}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {t("quizzes.passedQuiz")}
                  </p>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="h-16 w-16 mx-auto mb-4" />
                  <h1 className="text-base md:text-xl lg:text-3xl font-bold">
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
                      ((quizResults.submission?.score || 0) /
                        (quizResults.submission?.totalPoints || 1)) *
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
              <ActionButton
                onClick={clearAttemptAndNavigate}
                colorTheme="white"
                hasIcon={false}
                text={t("quizzes.backToList")}
                size="md"
                className="px-6 py-2 border border-gray-300 text-gray-700"
              />
              <ActionButton
                onClick={() => {
                  console.log(
                    "Retake clicked (single result), currentQuiz:",
                    currentQuiz
                  );
                  const quizIdToRetake = currentQuiz?.id || Number(quizId);
                  console.log(
                    "Quiz ID for retake (single result):",
                    quizIdToRetake
                  );
                  if (quizIdToRetake) {
                    // Clear localStorage before retaking
                    if (storageKey) {
                      localStorage.removeItem(storageKey);
                    }
                    navigate(`/quiz/${quizIdToRetake}/play`);
                  } else {
                    showError("Không thể làm lại quiz. Vui lòng thử lại.");
                  }
                }}
                colorTheme="blue"
                hasIcon={false}
                text={t("quizzes.retake")}
                size="md"
                className="px-6 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizId && !currentQuiz && currentView === "list") {
    return (
      <div className="p-3 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("common.loading")}
            </h2>
            <p className="text-gray-600">Đang tải quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-12 lg:px-36 md:py-12">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-2 md:p-12 mb-3 lg:mb-8 overflow-hidden shadow-xl h-[70px] lg:h-[120px]">
          <div className="absolute top-0 left-0 h-full w-1 bg-white/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between w-full h-full">
            <div></div>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-white">
              {isTeacher
                ? t("quizzes.quizManagement")
                : t("quizzes.onlineQuizzes")}
            </h1>
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
                <div className="absolute -top-2 left-8 w-3 h-3 rounded-full bg-amber-400">
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
              {!isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                  <StatCard
                    icon={<FileText className="h-6 w-6 text-blue-600" />}
                    bgColor="bg-blue-100"
                    label={t("quizzes.totalQuizzes")}
                    value={userStats.totalQuizzes}
                  />

                  <StatCard
                    icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                    bgColor="bg-green-100"
                    label={t("quizzes.completed")}
                    value={userStats.completedQuizzes}
                  />

                  <StatCard
                    icon={<Clock className="h-6 w-6 text-red-600" />}
                    bgColor="bg-red-100"
                    label={t("quizzes.overdue")}
                    value={userStats.overdueQuizzes}
                  />

                  <StatCard
                    icon={<Trophy className="h-6 w-6 text-purple-600" />}
                    bgColor="bg-purple-100"
                    label={t("quizzes.perfect")}
                    value={userStats.perfectCount}
                  />

                  <StatCard
                    icon={<BarChart3 className="h-6 w-6 text-orange-600" />}
                    bgColor="bg-orange-100"
                    label={t("quizzes.averageScore")}
                    value={(userStats.averageScore || 0).toFixed(1)}
                  />
                </div>
              )}

              {/* Stats Cards - Teacher view */}
              {isTeacher && (
                <div className="flex flex-wrap gap-4 md:gap-6 mb-8">
                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-1 md:flex-initial md:w-[220px]">
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

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-1 md:flex-initial md:w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {
                            quizzes.filter(
                              (q) => q.status === QuizStatus.ACTIVE
                            ).length
                          }
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.active")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-1 md:flex-initial md:w-[220px]">
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

                  <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center flex-1 md:flex-initial md:w-[220px]">
                    <div className="flex items-center justify-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-2 flex flex-row items-center gap-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {
                            quizzes.filter((q) => q.status === QuizStatus.DRAFT)
                              .length
                          }
                        </p>
                        <p className="text-base font-medium text-gray-600">
                          {t("quizzes.draft")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 text-start mr-2 h-14">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-start  h-8">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                          <Badge variant="subject">
                            {t(`subjects.${quiz.subject.toLowerCase()}`)}
                          </Badge>
                          <Badge variant="grade">
                            {t("exercises.class")} {quiz.grade || "Chung"}
                          </Badge>
                          <Badge
                            variant="status"
                            className={`${
                              (quiz.status as string) === QuizStatus.ACTIVE
                                ? "bg-green-100 text-green-800"
                                : (quiz.status as string) ===
                                  QuizStatus.INACTIVE
                                ? "bg-yellow-100 text-yellow-800"
                                : (quiz.status as string) === QuizStatus.OVERDUE
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {(quiz.status as string) === QuizStatus.ACTIVE
                              ? t("status.active")
                              : (quiz.status as string) === QuizStatus.DRAFT
                              ? t("status.draft")
                              : (quiz.status as string) === QuizStatus.OVERDUE
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
                          <CalendarClock className="h-4 w-4 mr-1" />
                          <span>
                            {t("quizzes.deadline")}: {formatDate(quiz.deadline)}{" "}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 text-start flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {quiz.creator?.profile?.firstName ||
                              "Không xác định"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ActionButton
                      onClick={() => startQuiz(quiz)}
                      disabled={quiz.status !== QuizStatus.ACTIVE && !isTeacher}
                      colorTheme={
                        quiz.status !== QuizStatus.ACTIVE && !isTeacher
                          ? "gray"
                          : isTeacher
                          ? "green"
                          : "blue"
                      }
                      hasIcon={false}
                      text={
                        isTeacher
                          ? t("quizzes.viewWithAnswersButton")
                          : t("quizzes.startQuiz")
                      }
                      size="md"
                      className="w-full text-sm font-bold px-4 py-2"
                    />
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

export const OnlineQuizzes: React.FC = () => {
  return <StudentQuizView />;
};
