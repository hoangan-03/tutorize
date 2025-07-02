/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { mutate } from "swr";
import { quizService } from "../services/quizService";
import { Quiz, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all quizzes with pagination
export const useQuizzes = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/quizzes", params],
    ([url, params]) => quizService.getQuizzes(params),
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
export const useQuiz = (id: string | null) => {
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

  const updateQuiz = async (id: string, quizData: Partial<Quiz>) => {
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

  const deleteQuiz = async (id: string) => {
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

  const publishQuiz = async (id: string) => {
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

  const closeQuiz = async (id: string) => {
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
  const startQuiz = async (quizId: string) => {
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
    submissionId: string,
    questionId: string,
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

  const submitQuiz = async (submissionId: string) => {
    try {
      const submission = await quizService.submitQuiz(submissionId);
      toast.success("Nộp bài thành công!");
      return submission;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Nộp bài thất bại";
      toast.error(message);
      throw error;
    }
  };

  return {
    startQuiz,
    saveAnswer,
    submitQuiz,
  };
};

// Get quiz submission
export const useQuizSubmission = (submissionId: string | null) => {
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
    ([url, params]) => quizService.getMySubmissions(params),
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
export const useQuizStats = (quizId: string | null) => {
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
