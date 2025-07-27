import useSWR, { mutate } from "swr";
import { exerciseService } from "../services/exerciseService";
import { Exercise, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all exercises with pagination
export const useExercises = (params?: PaginationParams) => {
  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR(
    ["/exercises", params],
    ([, params]) => exerciseService.getExercises(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    exercises: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: swrMutate,
  };
};

// Get single exercise
export const useExercise = (id: number | null) => {
  const {
    data: exercise,
    error,
    isLoading,
  } = useSWR(
    id ? `/exercises/${id}` : null,
    () => exerciseService.getExercise(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    exercise,
    isLoading,
    error,
    mutate: () => mutate(`/exercises/${id}`),
  };
};

// Get exercise with answers
export const useExerciseWithAnswers = (id: number | null) => {
  const {
    data: exercise,
    error,
    isLoading,
  } = useSWR(
    id ? `/exercises/${id}/with-answers` : null,
    () => exerciseService.getExerciseWithAnswers(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    exercise,
    isLoading,
    error,
    mutate: () => mutate(`/exercises/${id}/with-answers`),
  };
};

// Exercise management hooks
export const useExerciseManagement = () => {
  const createExercise = async (exerciseData: Partial<Exercise>) => {
    try {
      const exercise = await exerciseService.createExercise(exerciseData);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Tạo bài tập thành công!");
      return exercise;
    } catch (error) {
      toast.error("Tạo bài tập thất bại!");
      throw error;
    }
  };

  const updateExercise = async (
    id: number,
    exerciseData: Partial<Exercise>
  ) => {
    try {
      const exercise = await exerciseService.updateExercise(id, exerciseData);
      // Update specific exercise cache
      mutate(`/exercises/${id}`, exercise, false);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Cập nhật bài tập thành công!");
      return exercise;
    } catch (error) {
      toast.error("Cập nhật bài tập thất bại!");
      throw error;
    }
  };

  const deleteExercise = async (id: number) => {
    try {
      await exerciseService.deleteExercise(id);
      // Remove specific exercise from cache
      mutate(`/exercises/${id}`, undefined, false);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Xóa bài tập thành công!");
    } catch (error) {
      toast.error("Xóa bài tập thất bại!");
      throw error;
    }
  };

  const publishExercise = async (id: number) => {
    try {
      const exercise = await exerciseService.publishExercise(id);
      // Update specific exercise cache
      mutate(`/exercises/${id}`, exercise, false);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Xuất bản bài tập thành công!");
      return exercise;
    } catch (error) {
      toast.error("Xuất bản bài tập thất bại!");
      throw error;
    }
  };

  const archiveExercise = async (id: number) => {
    try {
      const exercise = await exerciseService.archiveExercise(id);
      // Update specific exercise cache
      mutate(`/exercises/${id}`, exercise, false);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Lưu trữ bài tập thành công!");
      return exercise;
    } catch (error) {
      toast.error("Lưu trữ bài tập thất bại!");
      throw error;
    }
  };

  const closeExercise = async (id: number) => {
    try {
      const exercise = await exerciseService.closeExercise(id);
      // Update specific exercise cache
      mutate(`/exercises/${id}`, exercise, false);
      // Invalidate all exercise lists
      mutate((key) => Array.isArray(key) && key[0] === "/exercises");
      toast.success("Đóng bài tập thành công!");
      return exercise;
    } catch (error) {
      toast.error("Đóng bài tập thất bại!");
      throw error;
    }
  };

  return {
    createExercise,
    updateExercise,
    deleteExercise,
    publishExercise,
    archiveExercise,
    closeExercise,
  };
};

// Exercise submission hooks
export const useExerciseSubmissions = () => {
  const submitExercise = async (
    exerciseId: number,
    content: string,
    files?: File[]
  ) => {
    const submission = await exerciseService.submitExercise(
      exerciseId,
      content,
      files
    );
    toast.success("Nộp bài thành công!");
    return submission;
  };

  const updateSubmission = async (submissionId: number, content: string) => {
    const submission = await exerciseService.updateSubmission(
      submissionId,
      content
    );
    mutate(`/exercise-submissions/${submissionId}`, submission, false);
    toast.success("Cập nhật bài nộp thành công!");
    return submission;
  };

  const gradeSubmission = async (
    submissionId: number,
    score: number,
    feedback?: string
  ) => {
    const submission = await exerciseService.gradeSubmission(
      submissionId,
      score,
      feedback
    );
    mutate(`/exercise-submissions/${submissionId}`, submission, false);
    toast.success("Chấm điểm thành công!");
    return submission;
  };

  return {
    submitExercise,
    updateSubmission,
    gradeSubmission,
  };
};

// Get exercise submissions
export const useExerciseSubmissionsList = (
  exerciseId: number | null,
  params?: PaginationParams
) => {
  const { data, error, isLoading } = useSWR(
    exerciseId ? [`/exercises/${exerciseId}/submissions`, params] : null,
    ([, params]) => exerciseService.getExerciseSubmissions(exerciseId!, params),
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
    mutate: () => mutate([`/exercises/${exerciseId}/submissions`, params]),
  };
};

// Get single submission
export const useExerciseSubmission = (submissionId: number | null) => {
  const {
    data: submission,
    error,
    isLoading,
  } = useSWR(
    submissionId ? `/exercise-submissions/${submissionId}` : null,
    () => exerciseService.getSubmission(submissionId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission,
    isLoading,
    error,
    mutate: () => mutate(`/exercise-submissions/${submissionId}`),
  };
};

// Get my submissions
export const useMyExerciseSubmissions = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/exercise-submissions/my", params],
    ([, params]) => exerciseService.getMySubmissions(params),
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
    mutate: () => mutate(["/exercise-submissions/my", params]),
  };
};

// Get exercise statistics
export const useExerciseStats = (exerciseId: number | null) => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    exerciseId ? `/exercises/${exerciseId}/stats` : null,
    () => exerciseService.getExerciseStats(exerciseId!),
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

// Get my exercise statistics
export const useMyExerciseStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    "/exercise-submissions/stats",
    () => exerciseService.getMyExerciseStats(),
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
