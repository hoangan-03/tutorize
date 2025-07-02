/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { mutate } from "swr";
import { writingService } from "../services/writingService";
import { WritingAssessment, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all writing assessments with pagination
export const useWritingAssessments = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/writing", params],
    ([url, params]) => writingService.getAssessments(params),
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
export const useWritingAssessment = (id: string | null) => {
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
    type: "ESSAY" | "IELTS_TASK1" | "IELTS_TASK2" | "CREATIVE" | "ACADEMIC";
  }) => {
    try {
      const assessment = await writingService.assessWriting(data);
      mutate("/writing");
      toast.success("Đánh giá bài viết thành công!");
      return assessment;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] ||
        "Đánh giá bài viết thất bại";
      toast.error(message);
      throw error;
    }
  };

  const updateAssessment = async (
    id: string,
    data: Partial<WritingAssessment>
  ) => {
    try {
      const assessment = await writingService.updateAssessment(id, data);
      mutate(`/writing/${id}`, assessment, false);
      mutate("/writing");
      toast.success("Cập nhật đánh giá thành công!");
      return assessment;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] ||
        "Cập nhật đánh giá thất bại";
      toast.error(message);
      throw error;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      await writingService.deleteAssessment(id);
      mutate("/writing");
      toast.success("Xóa đánh giá thành công!");
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Xóa đánh giá thất bại";
      toast.error(message);
      throw error;
    }
  };

  const addHumanFeedback = async (
    id: string,
    data: {
      humanScore: number;
      humanFeedback: string;
    }
  ) => {
    try {
      const assessment = await writingService.addHumanFeedback(id, data);
      mutate(`/writing/${id}`, assessment, false);
      mutate("/writing");
      toast.success("Thêm đánh giá của giáo viên thành công!");
      return assessment;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Thêm đánh giá thất bại";
      toast.error(message);
      throw error;
    }
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
