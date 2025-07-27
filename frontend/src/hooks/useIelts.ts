import useSWR, { mutate } from "swr";
import {
  ieltsService,
  IeltsTest,
  IeltsSection,
  IeltsQuestion,
} from "../services/ieltsService";
import { PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all IELTS tests with pagination
export const useIeltsTests = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/ielts/tests", params],
    ([, params]) => ieltsService.getTests(params),
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
    mutate: () => mutate(["/ielts/tests", params]),
  };
};

// Get single IELTS test
export const useIeltsTest = (id: number | null) => {
  const {
    data: test,
    error,
    isLoading,
  } = useSWR(
    id ? `/ielts/tests/${id}` : null,
    () => ieltsService.getTest(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    test,
    isLoading,
    error,
    mutate: () => mutate(`/ielts/tests/${id}`),
  };
};

// Get IELTS test with answers (for teacher view)
export const useIeltsTestWithAnswers = (id: number | null) => {
  const {
    data: test,
    error,
    isLoading,
  } = useSWR(
    id ? `/ielts/tests/${id}/with-answers` : null,
    () => ieltsService.getTestWithAnswers(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    test,
    isLoading,
    error,
    mutate: () => mutate(`/ielts/tests/${id}/with-answers`),
  };
};

// Get user's IELTS submissions
export const useIeltsSubmissions = () => {
  const {
    data: submissions,
    error,
    isLoading,
  } = useSWR("/ielts/submissions/my", () => ieltsService.getMySubmissions(), {
    revalidateOnFocus: false,
  });

  return {
    submissions: submissions || [],
    isLoading,
    error,
    mutate: () => mutate("/ielts/submissions/my"),
  };
};

// Get test submissions (for teacher view)
export const useIeltsTestSubmissions = (testId: number | null) => {
  const {
    data: submissions,
    error,
    isLoading,
  } = useSWR(
    testId ? `/ielts/tests/${testId}/submissions` : null,
    () => ieltsService.getTestSubmissions(testId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submissions: submissions || [],
    isLoading,
    error,
    mutate: () => mutate(`/ielts/tests/${testId}/submissions`),
  };
};

// Get submission details
export const useIeltsSubmissionDetails = (submissionId: number | null) => {
  const {
    data: submission,
    error,
    isLoading,
  } = useSWR(
    submissionId ? `/ielts/submissions/${submissionId}` : null,
    () => ieltsService.getSubmissionDetails(submissionId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    submission,
    isLoading,
    error,
    mutate: () => mutate(`/ielts/submissions/${submissionId}`),
  };
};

// Get resources by skill
export const useIeltsResourcesBySkill = (skill: string | null) => {
  const {
    data: resources,
    error,
    isLoading,
  } = useSWR(
    skill ? `/ielts/resources/${skill}` : null,
    () => ieltsService.getResourcesBySkill(skill!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    resources: resources || [],
    isLoading,
    error,
    mutate: () => mutate(`/ielts/resources/${skill}`),
  };
};

// IELTS test management hooks
export const useIeltsTestManagement = () => {
  const createTest = async (testData: Partial<IeltsTest>) => {
    const newTest = await ieltsService.createTest(testData);
    toast.success("Test created successfully!");
    mutate(["/ielts/tests"]);
    return newTest;
  };

  const updateTest = async (testId: number, testData: Partial<IeltsTest>) => {
    const updatedTest = await ieltsService.updateTest(testId, testData);
    toast.success("Test updated successfully!");
    mutate(`/ielts/tests/${testId}`);
    mutate(`/ielts/tests/${testId}/with-answers`);
    mutate(["/ielts/tests"]);
    return updatedTest;
  };

  const deleteTest = async (testId: number) => {
    await ieltsService.deleteTest(testId);
    toast.success("Test deleted successfully!");
    mutate(["/ielts/tests"]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTest = async (testId: number, submissionData: any) => {
    const result = await ieltsService.submitTest(testId, submissionData);
    toast.success("Test submitted successfully!");
    mutate("/ielts/submissions/my");
    mutate(`/ielts/tests/${testId}/submissions`);
    return result;
  };

  return {
    createTest,
    updateTest,
    deleteTest,
    submitTest,
  };
};

// IELTS section management hooks
export const useIeltsSectionManagement = () => {
  const createSection = async (
    testId: number,
    sectionData: Partial<IeltsSection>
  ) => {
    const newSection = await ieltsService.createSection(testId, sectionData);
    toast.success("Section created successfully!");
    mutate(`/ielts/tests/${testId}`);
    mutate(`/ielts/tests/${testId}/with-answers`);
    return newSection;
  };

  const updateSection = async (
    sectionId: number,
    sectionData: Partial<IeltsSection>
  ) => {
    const updatedSection = await ieltsService.updateSection(
      sectionId,
      sectionData
    );
    toast.success("Section updated successfully!");
    // Mutate all related test caches
    mutate((key) => typeof key === "string" && key.includes("/ielts/tests/"));
    return updatedSection;
  };

  const removeSection = async (sectionId: number) => {
    await ieltsService.removeSection(sectionId);
    toast.success("Section removed successfully!");
    // Mutate all related test caches
    mutate((key) => typeof key === "string" && key.includes("/ielts/tests/"));
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
    const newQuestion = await ieltsService.createQuestion(
      sectionId,
      questionData
    );
    toast.success("Question created successfully!");
    // Mutate all related test caches
    mutate((key) => typeof key === "string" && key.includes("/ielts/tests/"));
    return newQuestion;
  };

  const updateQuestion = async (
    questionId: number,
    questionData: Partial<IeltsQuestion>
  ) => {
    const updatedQuestion = await ieltsService.updateQuestion(
      questionId,
      questionData
    );
    toast.success("Question updated successfully!");
    // Mutate all related test caches
    mutate((key) => typeof key === "string" && key.includes("/ielts/tests/"));
    return updatedQuestion;
  };

  const removeQuestion = async (questionId: number) => {
    await ieltsService.removeQuestion(questionId);
    toast.success("Question removed successfully!");
    // Mutate all related test caches
    mutate((key) => typeof key === "string" && key.includes("/ielts/tests/"));
  };

  return {
    createQuestion,
    updateQuestion,
    removeQuestion,
  };
};
