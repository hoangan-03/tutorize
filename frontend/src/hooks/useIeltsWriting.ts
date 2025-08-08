import useSWR, { mutate } from "swr";
import { ieltsWritingService } from "../services/ieltsWritingService";
import { PaginationParams, IeltsWritingType, IeltsLevel } from "../types/api";
import { toast } from "react-toastify";

// IELTS Writing Tests hooks
export const useIeltsWritingTest = (
  params?: PaginationParams & { level?: string; type?: string }
) => {
  const { data, error, isLoading } = useSWR(
    ["/ielts-writing/tests", params],
    ([, params]) => ieltsWritingService.listTests(params),
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
    mutate: () => mutate(["/ielts-writing/tests", params]),
  };
};

// IELTS Writing Submissions hooks
export const useIeltsWritingSubmissions = () => {
  const { data, error, isLoading } = useSWR(
    "/ielts-writing/submissions",
    () => ieltsWritingService.getMySubmissions(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: data || [],
    isLoading,
    error,
    mutate: () => mutate("/ielts-writing/submissions"),
  };
};

// IELTS Writing Test management hooks
export const useIeltsWritingTestManagement = () => {
  const createTest = async (data: {
    title: string;
    prompt: string;
    type: IeltsWritingType;
    level?: IeltsLevel;
  }) => {
    const task = await ieltsWritingService.createTest(data);
    mutate("/ielts-writing/tests");
    toast.success("Tạo Writing Task thành công!");
    return task;
  };

  const submitTask = async (taskId: number, content: string) => {
    const submission = await ieltsWritingService.submitTest(taskId, content);
    mutate(`/ielts-writing/tests/${taskId}`);
    toast.success("Nộp bài thành công!");
    return submission;
  };

  const gradeTask = async (
    taskId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ) => {
    const result = await ieltsWritingService.manualGradeTest(taskId, data);
    mutate(`/ielts-writing/tests/${taskId}`);
    toast.success("Chấm điểm AI hoàn tất!");
    return result;
  };

  const editTask = async (
    taskId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: IeltsWritingType;
      level?: IeltsLevel;
    }
  ) => {
    const task = await ieltsWritingService.editTest(taskId, data);
    mutate("/ielts-writing/tests");
    mutate(`/ielts-writing/tests/${taskId}`);
    toast.success("Cập nhật Writing Task thành công!");
    return task;
  };

  const deleteTask = async (taskId: number) => {
    await ieltsWritingService.deleteTest(taskId);
    mutate("/ielts-writing/tests");
    toast.success("Xóa Writing Task thành công!");
  };

  const getWritingTestSubmissions = async (taskId: number) => {
    const submissions = await ieltsWritingService.getTestSubmissions(taskId);
    return submissions;
  };

  return {
    createTask: createTest,
    submitTask,
    gradeTask,
    editTask,
    deleteTask,
    getWritingTestSubmissions,
  };
};
