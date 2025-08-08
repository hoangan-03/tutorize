import useSWR, { mutate } from "swr";
import { writingService } from "../services/writingService";
import {
  WritingAssessment,
  PaginationParams,
  WritingType,
  IeltsLevel,
} from "../types/api";
import { toast } from "react-toastify";

// Get all writing assessments with pagination
export const useWritingAssessments = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/writing", params],
    ([, params]) => writingService.getAssessments(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    assessments: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/writing", params]),
  };
};

// Get single writing assessment
export const useWritingAssessment = (id: number | null) => {
  const {
    data: assessment,
    error,
    isLoading,
  } = useSWR(
    id ? `/writing/${id}` : null,
    () => writingService.getAssessment(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    assessment,
    isLoading,
    error,
    mutate: () => mutate(`/writing/${id}`),
  };
};

// Writing assessment management hooks
export const useWritingManagement = () => {
  const assessWriting = async (data: {
    title: string;
    content: string;
    type: WritingType;
  }) => {
    const assessment = await writingService.assessWriting(data);
    mutate("/writing");
    toast.success("Đánh giá bài viết thành công!");
    return assessment;
  };

  const updateAssessment = async (
    id: number,
    data: Partial<WritingAssessment>
  ) => {
    const assessment = await writingService.updateAssessment(id, data);
    mutate(`/writing/${id}`, assessment, false);
    mutate("/writing");
    toast.success("Cập nhật đánh giá thành công!");
    return assessment;
  };

  const deleteAssessment = async (id: number) => {
    await writingService.deleteAssessment(id);
    mutate("/writing");
    toast.success("Xóa đánh giá thành công!");
  };

  const addHumanFeedback = async (
    id: number,
    data: {
      humanScore: number;
      humanFeedback: string;
    }
  ) => {
    const assessment = await writingService.addHumanFeedback(id, data);
    mutate(`/writing/${id}`, assessment, false);
    mutate("/writing");
    toast.success("Thêm đánh giá của giáo viên thành công!");
    return assessment;
  };

  return {
    assessWriting,
    updateAssessment,
    deleteAssessment,
    addHumanFeedback,
  };
};

// Get writing statistics
export const useWritingStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/writing/stats", () => writingService.getWritingStats(), {
    revalidateOnFocus: false,
  });

  return {
    stats,
    isLoading,
    error,
  };
};

// Get my writing statistics
export const useMyWritingStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/writing/my-stats", () => writingService.getMyWritingStats(), {
    revalidateOnFocus: false,
  });

  return {
    stats,
    isLoading,
    error,
  };
};

// Writing Tasks hooks
export const useWritingTasks = (
  params?: PaginationParams & { level?: string; type?: string }
) => {
  const { data, error, isLoading } = useSWR(
    ["/writing/tasks", params],
    ([, params]) => writingService.listTasks(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    tasks: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/writing/tasks", params]),
  };
};

// Writing Task management hooks
export const useWritingTaskManagement = () => {
  const createTask = async (data: {
    title: string;
    prompt: string;
    type: WritingType;
    level?: IeltsLevel;
  }) => {
    const task = await writingService.createTask(data);
    mutate("/writing/tasks");
    toast.success("Tạo Writing Task thành công!");
    return task;
  };

  const submitTask = async (taskId: number, content: string) => {
    const submission = await writingService.submitTask(taskId, content);
    mutate(`/writing/tasks/${taskId}`);
    toast.success("Nộp bài thành công!");
    return submission;
  };

  const gradeTask = async (taskId: number) => {
    const result = await writingService.gradeTask(taskId);
    mutate(`/writing/tasks/${taskId}`);
    toast.success("Chấm điểm AI hoàn tất!");
    return result;
  };

  const editTask = async (
    taskId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: WritingType;
      level?: IeltsLevel;
    }
  ) => {
    const task = await writingService.editTask(taskId, data);
    mutate("/writing/tasks");
    mutate(`/writing/tasks/${taskId}`);
    toast.success("Cập nhật Writing Task thành công!");
    return task;
  };

  const deleteTask = async (taskId: number) => {
    await writingService.deleteTask(taskId);
    mutate("/writing/tasks");
    toast.success("Xóa Writing Task thành công!");
  };

  const getTaskSubmissions = async (taskId: number) => {
    const submissions = await writingService.getTaskSubmissions(taskId);
    return submissions;
  };

  return {
    createTask,
    submitTask,
    gradeTask,
    editTask,
    deleteTask,
    getTaskSubmissions,
  };
};
