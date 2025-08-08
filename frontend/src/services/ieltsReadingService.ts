import api from "../lib/api";
import {
  PaginationParams,
  PaginatedResult,
  IeltsReadingTest,
  IeltsSection,
  IeltsQuestion,
  IeltsSubmission,
} from "../types/api";

export interface IeltsSubmissionResult extends IeltsSubmission {
  test: IeltsReadingTest & {
    sections: (IeltsSection & {
      questions: (IeltsQuestion & {
        userAnswer?: string;
        isCorrect?: boolean;
      })[];
    })[];
  };
}

export const ieltsReadingService = {
  // IELTS Test Management
  async getTests(
    params?: PaginationParams & {
      skill?: string;
      level?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<IeltsReadingTest>> {
    const response = await api.get<PaginatedResult<IeltsReadingTest>>(
      "/ielts-reading/tests",
      {
        params,
      }
    );
    return response.data;
  },

  async getTest(id: number): Promise<IeltsReadingTest> {
    const response = await api.get<IeltsReadingTest>(
      `/ielts-reading/tests/${id}`
    );
    return response.data;
  },

  async getTestWithAnswers(id: number): Promise<IeltsReadingTest> {
    const response = await api.get<IeltsReadingTest>(
      `/ielts-reading/tests/${id}/with-answers`
    );
    return response.data;
  },

  async createTest(
    testData: Partial<IeltsReadingTest>
  ): Promise<IeltsReadingTest> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      title: testData.title,
      description: testData.description,
      level: testData.level,
      timeLimit: testData.timeLimit,
      instructions: testData.instructions,
      sections: testData.sections,
    };

    const response = await api.post<IeltsReadingTest>(
      "/ielts-reading/tests",
      createData
    );
    return response.data;
  },

  async updateTest(
    id: number,
    testData: Partial<IeltsReadingTest>
  ): Promise<IeltsReadingTest> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      title: testData.title,
      description: testData.description,
      level: testData.level,
      timeLimit: testData.timeLimit,
      instructions: testData.instructions,
    };

    const response = await api.patch<IeltsReadingTest>(
      `/ielts-reading/tests/${id}`,
      updateData
    );
    return response.data;
  },

  async deleteTest(id: number): Promise<void> {
    await api.delete(`/ielts-reading/tests/${id}`);
  },

  // Section Management
  async createSection(
    testId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      title: sectionData.title,
      instructions: sectionData.instructions,
      timeLimit: sectionData.timeLimit,
      order: sectionData.order,
      passageText: sectionData.passageText,
      audioUrl: sectionData.audioUrl,
      imageUrl: sectionData.imageUrl,
      questions: sectionData.questions,
    };

    const response = await api.post<IeltsSection>(
      `/ielts-reading/tests/${testId}/sections`,
      createData
    );
    return response.data;
  },

  async updateSection(
    sectionId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      title: sectionData.title,
      instructions: sectionData.instructions,
      timeLimit: sectionData.timeLimit,
      order: sectionData.order,
      passageText: sectionData.passageText,
      audioUrl: sectionData.audioUrl,
      imageUrl: sectionData.imageUrl,
    };

    const response = await api.patch<IeltsSection>(
      `/ielts-reading/sections/${sectionId}`,
      updateData
    );
    return response.data;
  },

  async removeSection(sectionId: number): Promise<void> {
    await api.delete(`/ielts-reading/sections/${sectionId}`);
  },

  // Question Management
  async createQuestion(
    sectionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      question: questionData.question,
      type: questionData.type,
      subQuestions: questionData.subQuestions,
      options: questionData.options,
      correctAnswers: questionData.correctAnswers,
      points: questionData.points,
      order: questionData.order,
      explanation: questionData.explanation,
      imageUrl: questionData.imageUrl,
    };

    const response = await api.post<IeltsQuestion>(
      `/ielts-reading/sections/${sectionId}/questions`,
      createData
    );
    return response.data;
  },

  async updateQuestion(
    questionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      question: questionData.question,
      type: questionData.type,
      subQuestions: questionData.subQuestions,
      options: questionData.options,
      correctAnswers: questionData.correctAnswers,
      points: questionData.points,
      order: questionData.order,
      explanation: questionData.explanation,
      imageUrl: questionData.imageUrl,
    };

    const response = await api.patch<IeltsQuestion>(
      `/ielts-reading/questions/${questionId}`,
      updateData
    );
    return response.data;
  },

  async removeQuestion(questionId: number): Promise<void> {
    await api.delete(`/ielts-reading/questions/${questionId}`);
  },

  // Test Taking
  async submitTest(
    testId: number,
    answers: { questionId: number; answer: string }[]
  ): Promise<IeltsSubmission> {
    const response = await api.post<IeltsSubmission>(
      `/ielts-reading/tests/${testId}/submit`,
      { answers }
    );
    return response.data;
  },

  // Submissions and Results
  async getMySubmissions(): Promise<IeltsSubmission[]> {
    const response = await api.get<IeltsSubmission[]>(
      "/ielts-reading/my-submissions"
    );
    return response.data;
  },

  async getTestSubmissions(testId: number): Promise<IeltsSubmission[]> {
    const response = await api.get<PaginatedResult<IeltsSubmission>>(
      `/ielts-reading/tests/${testId}/submissions`
    );
    return response.data.data;
  },

  async getAllSubmissions(): Promise<IeltsSubmission[]> {
    const response = await api.get<IeltsSubmission[]>(
      "/ielts-reading/submissions"
    );
    return response.data;
  },

  async getSubmissionDetails(
    submissionId: number
  ): Promise<IeltsSubmissionResult> {
    const response = await api.get<IeltsSubmissionResult>(
      `/ielts-reading/submissions/${submissionId}/details`
    );
    return response.data;
  },
};
