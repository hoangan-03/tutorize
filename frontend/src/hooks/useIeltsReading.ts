import useSWR, { mutate } from "swr";
import { ieltsReadingService } from "../services/ieltsReadingService";
import {
  PaginationParams,
  IeltsReadingTest,
  IeltsSection,
  IeltsQuestion,
} from "../types/api";
import { toast } from "react-toastify";

// Get all IELTS tests with pagination
export const useIeltsReadingTests = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/ielts-reading/tests", params],
    ([, params]) => ieltsReadingService.getTests(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    tests: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/ielts-reading/tests", params]),
  };
};

// Get single IELTS test
export const useIeltsReadingTest = (id: number | null) => {
  const {
    data: test,
    error,
    isLoading,
  } = useSWR(
    id ? `/ielts-reading/tests/${id}` : null,
    () => ieltsReadingService.getTest(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    test,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-reading/tests/${id}`),
  };
};

// Get IELTS test with answers (for teacher view)
export const useIeltsReadingTestWithAnswers = (id: number | null) => {
  const {
    data: test,
    error,
    isLoading,
  } = useSWR(
    id ? `/ielts-reading/tests/${id}/with-answers` : null,
    () => ieltsReadingService.getTestWithAnswers(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    test,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-reading/tests/${id}/with-answers`),
  };
};

// Get user's IELTS submissions
export const useIeltsReadingSubmissions = () => {
  const {
    data: submissions,
    error,
    isLoading,
  } = useSWR(
    "/ielts-reading/submissions/my",
    () => ieltsReadingService.getMySubmissions(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: submissions || [],
    isLoading,
    error,
    mutate: () => mutate("/ielts-reading/submissions/my"),
  };
};

// Get test submissions (for teacher view)
export const useIeltsReadingTestSubmissions = (testId: number | null) => {
  const {
    data: submissions,
    error,
    isLoading,
  } = useSWR(
    testId ? `/ielts-reading/tests/${testId}/submissions` : null,
    () => ieltsReadingService.getTestSubmissions(testId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: submissions || [],
    isLoading,
    error,
    mutate: () => mutate(`/ielts-reading/tests/${testId}/submissions`),
  };
};

// Get all submissions (for teacher view)
export const useIeltsReadingAllSubmissions = () => {
  const {
    data: submissions,
    error,
    isLoading,
  } = useSWR(
    "/ielts-reading/submissions/all",
    () => ieltsReadingService.getAllSubmissions(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: submissions || [],
    isLoading,
    error,
    mutate: () => mutate("/ielts-reading/submissions/all"),
  };
};

// Get submission details
export const useIeltsReadingSubmissionDetails = (
  submissionId: number | null
) => {
  const {
    data: submission,
    error,
    isLoading,
  } = useSWR(
    submissionId ? `/ielts-reading/submissions/${submissionId}` : null,
    () => ieltsReadingService.getSubmissionDetails(submissionId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission,
    isLoading,
    error,
    mutate: () => mutate(`/ielts-reading/submissions/${submissionId}`),
  };
};

// IELTS test management hooks
export const useIeltsReadingTestManagement = () => {
  const createTest = async (testData: Partial<IeltsReadingTest>) => {
    const newTest = await ieltsReadingService.createTest(testData);
    toast.success("Test created successfully!");
    // Invalidate all test list caches with any params
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return newTest;
  };

  const updateIeltsReadingTest = async (
    testId: number,
    testData: Partial<IeltsReadingTest>
  ) => {
    const updatedTest = await ieltsReadingService.updateTest(testId, testData);
    toast.success("Test updated successfully!");
    // Invalidate specific test caches
    mutate(`/ielts-reading/tests/${testId}`, undefined, { revalidate: true });
    mutate(`/ielts-reading/tests/${testId}/with-answers`, undefined, {
      revalidate: true,
    });
    // Invalidate all test list caches with any params
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return updatedTest;
  };

  const deleteIeltsReadingTest = async (testId: number) => {
    await ieltsReadingService.deleteTest(testId);
    toast.success("Test deleted successfully!");
    // Invalidate all test list caches with any params
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    // Also invalidate the specific test cache
    mutate(`/ielts-reading/tests/${testId}`, undefined, { revalidate: false });
    mutate(`/ielts-reading/tests/${testId}/with-answers`, undefined, {
      revalidate: false,
    });
  };

  const submitIeltsReadingTest = async (
    testId: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionData: any
  ) => {
    const result = await ieltsReadingService.submitTest(testId, submissionData);
    toast.success("Test submitted successfully!");
    mutate("/ielts-reading/submissions/my", undefined, { revalidate: true });
    mutate(`/ielts-reading/tests/${testId}/submissions`, undefined, {
      revalidate: true,
    });
    return result;
  };

  return {
    createTest,
    updateTest: updateIeltsReadingTest,
    deleteTest: deleteIeltsReadingTest,
    submitTest: submitIeltsReadingTest,
  };
};

// IELTS section management hooks
export const useIeltsSectionManagement = () => {
  const createSection = async (
    testId: number,
    sectionData: Partial<IeltsSection>
  ) => {
    const newSection = await ieltsReadingService.createSection(
      testId,
      sectionData
    );
    toast.success("Section created successfully!");
    // Invalidate specific test caches
    mutate(`/ielts-reading/tests/${testId}`, undefined, { revalidate: true });
    mutate(`/ielts-reading/tests/${testId}/with-answers`, undefined, {
      revalidate: true,
    });
    // Invalidate all test list caches
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return newSection;
  };

  const updateSection = async (
    sectionId: number,
    sectionData: Partial<IeltsSection>
  ) => {
    const updatedSection = await ieltsReadingService.updateSection(
      sectionId,
      sectionData
    );
    toast.success("Section updated successfully!");
    // Mutate all related test caches
    mutate(
      (key) => typeof key === "string" && key.includes("/ielts-reading/tests/"),
      undefined,
      { revalidate: true }
    );
    // Also invalidate test lists
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return updatedSection;
  };

  const removeSection = async (sectionId: number) => {
    await ieltsReadingService.removeSection(sectionId);
    toast.success("Section removed successfully!");
    // Mutate all related test caches
    mutate(
      (key) => typeof key === "string" && key.includes("/ielts-reading/tests/"),
      undefined,
      { revalidate: true }
    );
    // Also invalidate test lists
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
  };

  return {
    createSection,
    updateSection,
    removeSection,
  };
};

// IELTS question management hooks
export const useIeltsQuestionManagement = () => {
  const createQuestion = async (
    sectionId: number,
    questionData: Partial<IeltsQuestion>
  ) => {
    const newQuestion = await ieltsReadingService.createQuestion(
      sectionId,
      questionData
    );
    toast.success("Question created successfully!");
    // Mutate all related test caches
    mutate(
      (key) => typeof key === "string" && key.includes("/ielts-reading/tests/"),
      undefined,
      { revalidate: true }
    );
    // Also invalidate test lists
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return newQuestion;
  };

  const updateQuestion = async (
    questionId: number,
    questionData: Partial<IeltsQuestion>
  ) => {
    const updatedQuestion = await ieltsReadingService.updateQuestion(
      questionId,
      questionData
    );
    toast.success("Question updated successfully!");
    // Mutate all related test caches
    mutate(
      (key) => typeof key === "string" && key.includes("/ielts-reading/tests/"),
      undefined,
      { revalidate: true }
    );
    // Also invalidate test lists
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
    return updatedQuestion;
  };

  const removeQuestion = async (questionId: number) => {
    await ieltsReadingService.removeQuestion(questionId);
    toast.success("Question removed successfully!");
    // Mutate all related test caches
    mutate(
      (key) => typeof key === "string" && key.includes("/ielts-reading/tests/"),
      undefined,
      { revalidate: true }
    );
    // Also invalidate test lists
    mutate(
      (key) => Array.isArray(key) && key[0] === "/ielts-reading/tests",
      undefined,
      { revalidate: true }
    );
  };

  return {
    createQuestion,
    updateQuestion,
    removeQuestion,
  };
};
