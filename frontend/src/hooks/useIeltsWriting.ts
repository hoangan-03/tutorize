import useSWR, { mutate } from "swr";
import { ieltsWritingService } from "../services/ieltsWritingService";
import { PaginationParams, IeltsWritingType, IeltsLevel } from "../types/api";
import { toast } from "react-toastify";

export const useIeltsWritingTest = (
  params?: PaginationParams & { level?: string; type?: string }
) => {
  const { data, error, isLoading } = useSWR(
    ["/ielts-writing", params],
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
    mutate: () => mutate(["/ielts-writing", params]),
  };
};

export const useIeltsWritingTestById = (testId: number | null) => {
  const { data, error, isLoading } = useSWR(
    testId ? `/ielts-writing/${testId}` : null,
    () => (testId ? ieltsWritingService.getTest(testId) : null),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    test: data || null,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-writing/${testId}`),
  };
};

export const useIeltsWritingMySubmissions = () => {
  const { data, error, isLoading } = useSWR(
    "/ielts-writing/my-submissions",
    () => ieltsWritingService.getMySubmissions(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: data || [],
    isLoading,
    error,
    mutate: () => mutate("/ielts-writing/my-submissions"),
  };
};

export const useIeltsWritingMySubmission = (submissionId: number) => {
  const { data, error, isLoading } = useSWR(
    `/ielts-writing/my-submission/${submissionId}`,
    () => ieltsWritingService.getMySubmission(submissionId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission: data || null,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-writing/my-submission/${submissionId}`),
  };
};

export const useIeltsWritingSubmissionForGrading = (submissionId: number) => {
  const { data, error, isLoading } = useSWR(
    `/ielts-writing/submission/${submissionId}`,
    () => ieltsWritingService.getSubmissionForGrading(submissionId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission: data || null,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-writing/submission/${submissionId}`),
  };
};

export const useIeltsWritingTestSubmissions = (testId: number) => {
  const { data, error, isLoading } = useSWR(
    `/ielts-writing/${testId}/submissions`,
    () => ieltsWritingService.getWritingTestSubmissions(testId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: data || [],
    isLoading,
    error,
    mutate: () => mutate(`/ielts-writing/${testId}/submissions`),
  };
};

export const useIeltsWritingTestSubmission = (
  testId: number,
  submissionId: number
) => {
  const { data, error, isLoading } = useSWR(
    `/ielts-writing/${testId}/submission/${submissionId}`,
    () => ieltsWritingService.getWritingTestSubmission(testId, submissionId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission: data || null,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-writing/${testId}/submission/${submissionId}`),
  };
};

export const useIeltsWritingTestManagement = () => {
  const createWritingTest = async (data: {
    title: string;
    prompt: string;
    type: IeltsWritingType;
    level?: IeltsLevel;
  }) => {
    const task = await ieltsWritingService.createWritingTest(data);
    mutate("/ielts-writing");
    toast.success("Tạo Writing Task thành công!");
    return task;
  };

  const submitWritingSubmission = async (testId: number, content: string) => {
    const submission = await ieltsWritingService.submitWritingSubmission(
      testId,
      content
    );
    mutate(`/ielts-writing/${testId}`);
    toast.success("Nộp bài thành công!");
    return submission;
  };

  const gradeWritingTest = async (
    testId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ) => {
    const result = await ieltsWritingService.manualGradeWritingTest(
      testId,
      data
    );
    mutate(`/ielts-writing/${testId}`);
    toast.success("Chấm điểm AI hoàn tất!");
    return result;
  };

  const editWritingTest = async (
    testId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: IeltsWritingType;
      level?: IeltsLevel;
    }
  ) => {
    const task = await ieltsWritingService.editWritingTest(testId, data);
    mutate("/ielts-writing");
    mutate(`/ielts-writing/${testId}`);
    toast.success("Cập nhật Writing Task thành công!");
    return task;
  };

  const deleteWritingTest = async (testId: number) => {
    await ieltsWritingService.deleteWritingTest(testId);
    mutate("/ielts-writing");
    toast.success("Xóa Writing Task thành công!");
  };

  const gradeSubmission = async (
    submissionId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ) => {
    const result = await ieltsWritingService.gradeSubmission(
      submissionId,
      data
    );
    mutate(`/ielts-writing/submission/${submissionId}`);
    toast.success("Chấm điểm thành công!");
    return result;
  };

  return {
    createWritingTest,
    submitWritingSubmission,
    gradeWritingTest,
    editWritingTest,
    deleteWritingTest,
    gradeSubmission,
  };
};
