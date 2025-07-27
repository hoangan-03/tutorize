/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { mutate } from "swr";
import { quizService } from "../services/quizService";
import { Quiz, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all quizzes with pagination
export const useQuizzes = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/quizzes", params],
    ([url, params]) => quizService.getQuizzes(url, params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    quizzes: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/quizzes", params]),
  };
};

// Get single quiz
export const useQuiz = (id: number | null) => {
  const {
    data: quiz,
    error,
    isLoading,
  } = useSWR(id ? `/quizzes/${id}` : null, () => quizService.getQuiz(id!), {
    revalidateOnFocus: false,
  });

  return {
    quiz,
    isLoading,
    error,
    mutate: () => mutate(`/quizzes/${id}`),
  };
};

// Quiz management hooks
export const useQuizManagement = () => {
  const createQuiz = async (quizData: Partial<Quiz>) => {
    try {
      const quiz = await quizService.createQuiz(quizData);
      mutate("/quizzes");
      toast.success("Tạo quiz thành công!");
      return quiz;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Tạo quiz thất bại";
      toast.error(message);
      throw error;
    }
  };

  const updateQuiz = async (id: number, quizData: Partial<Quiz>) => {
    try {
      const quiz = await quizService.updateQuiz(id, quizData);
      mutate(`/quizzes/${id}`, quiz, false);
      mutate("/quizzes");
      toast.success("Cập nhật quiz thành công!");
      return quiz;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Cập nhật quiz thất bại";
      toast.error(message);
      throw error;
    }
  };

  const deleteQuiz = async (id: number) => {
    try {
      await quizService.deleteQuiz(id);
      mutate("/quizzes");
      toast.success("Xóa quiz thành công!");
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Xóa quiz thất bại";
      toast.error(message);
      throw error;
    }
  };

  const publishQuiz = async (id: number) => {
    try {
      const quiz = await quizService.publishQuiz(id);
      mutate(`/quizzes/${id}`, quiz, false);
      mutate("/quizzes");
      toast.success("Xuất bản quiz thành công!");
      return quiz;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Xuất bản quiz thất bại";
      toast.error(message);
      throw error;
    }
  };

  const closeQuiz = async (id: number) => {
    try {
      const quiz = await quizService.closeQuiz(id);
      mutate(`/quizzes/${id}`, quiz, false);
      mutate("/quizzes");
      toast.success("Đóng quiz thành công!");
      return quiz;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Đóng quiz thất bại";
      toast.error(message);
      throw error;
    }
  };

  return {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    closeQuiz,
  };
};

// Quiz taking hooks
export const useQuizTaking = () => {
  const startQuiz = async (quizId: number) => {
    try {
      const submission = await quizService.startQuiz(quizId);
      toast.success("Bắt đầu làm quiz!");
      return submission;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Không thể bắt đầu quiz";
      toast.error(message);
      throw error;
    }
  };

  const saveAnswer = async (
    submissionId: number,
    questionId: number,
    answer: string
  ) => {
    try {
      const answerData = await quizService.saveAnswer(
        submissionId,
        questionId,
        answer
      );
      // Don't show toast for auto-save
      return answerData;
    } catch (error: any) {
      console.error("Auto-save failed:", error);
      throw error;
    }
  };

  const submitQuiz = async (submissionId: number) => {
    try {
      const submission = await quizService.submitQuizOld(submissionId);
      toast.success("Nộp bài thành công!");
      return submission;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Nộp bài thất bại";
      toast.error(message);
      throw error;
    }
  };

  const submitQuizWithAnswers = async (
    quizId: number,
    submitData: {
      answers: Array<{
        questionId: number;
        userAnswer: string;
        timeTaken?: number;
      }>;
      timeSpent?: number;
    }
  ) => {
    const submission = await quizService.submitQuiz(quizId, submitData);
    // Don't show toast here as the component handles the messages
    return submission;
  };

  return {
    startQuiz,
    saveAnswer,
    submitQuiz,
    submitQuizWithAnswers,
  };
};

// Get quiz submission
export const useQuizSubmission = (submissionId: number | null) => {
  const {
    data: submission,
    error,
    isLoading,
  } = useSWR(
    submissionId ? `/quiz-submissions/${submissionId}` : null,
    () => quizService.getSubmission(submissionId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds during quiz taking
    }
  );

  return {
    submission,
    isLoading,
    error,
    mutate: () => mutate(`/quiz-submissions/${submissionId}`),
  };
};

// Get my quiz submissions
export const useMyQuizSubmissions = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/quiz-submissions/my", params],
    () => quizService.getMySubmissions(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/quiz-submissions/my", params]),
  };
};

// Get quiz statistics
export const useQuizStats = (quizId: number | null) => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    quizId ? `/quizzes/${quizId}/stats` : null,
    () => quizService.getQuizStats(quizId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    stats,
    isLoading,
    error,
  };
};

// Get detailed quiz statistics
export const useDetailedQuizStats = (quizId: number | null) => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    quizId ? `/quizzes/${quizId}/detailed-stats` : null,
    () => quizService.getDetailedQuizStats(quizId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    stats,
    isLoading,
    error,
  };
};

// Get quiz with answers for teacher view
export const useQuizWithAnswers = (id: number | null) => {
  const {
    data: quiz,
    error,
    isLoading,
  } = useSWR(
    id ? `/quizzes/${id}/with-answers` : null,
    () => quizService.getQuizWithAnswers(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    quiz,
    isLoading,
    error,
    mutate: () => mutate(`/quizzes/${id}/with-answers`),
  };
};

// Get quiz submission history
export const useQuizSubmissionHistory = (quizId: number | null) => {
  const {
    data: submissionHistory,
    error,
    isLoading,
  } = useSWR(
    quizId ? `/quizzes/${quizId}/submission-history` : null,
    () => quizService.getQuizSubmissionHistory(quizId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissionHistory,
    isLoading,
    error,
    mutate: () => mutate(`/quizzes/${quizId}/submission-history`),
  };
};

// Get teacher statistics
export const useTeacherStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/quizzes/teacher-stats", () => quizService.getTeacherStats(), {
    revalidateOnFocus: false,
  });

  return {
    stats: stats || {
      totalQuizzes: 0,
      publishedQuizzes: 0,
      activeQuizzes: 0,
      overdueQuizzes: 0,
      totalSubmissions: 0,
    },
    isLoading,
    error,
  };
};

// Get student statistics
export const useStudentStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/quizzes/student-stats", () => quizService.getStudentStats(), {
    revalidateOnFocus: false,
  });

  return {
    stats: stats || {
      totalQuizzes: 0,
      completedQuizzes: 0,
      overdueQuizzes: 0,
      averageScore: 0,
      perfectCount: 0,
    },
    isLoading,
    error,
  };
};
