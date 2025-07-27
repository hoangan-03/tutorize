import api from "../lib/api";
import {
  PaginationParams,
  PaginatedResult,
  IeltsTest,
  IeltsSection,
  IeltsQuestion,
  IeltsSubmission,
} from "../types/api";

export interface IeltsSubmissionResult extends IeltsSubmission {
  test: IeltsTest & {
    sections: (IeltsSection & {
      questions: (IeltsQuestion & {
        userAnswer?: string;
        isCorrect?: boolean;
      })[];
    })[];
  };
}

export const ieltsService = {
  // IELTS Test Management
  async getTests(
    params?: PaginationParams & {
      skill?: string;
      level?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<IeltsTest>> {
    const response = await api.get<PaginatedResult<IeltsTest>>("/ielts/tests", {
      params,
    });
    return response.data;
  },

  async getTest(id: number): Promise<IeltsTest> {
    const response = await api.get<IeltsTest>(`/ielts/tests/${id}`);
    return response.data;
  },

  async getTestWithAnswers(id: number): Promise<IeltsTest> {
    const response = await api.get<IeltsTest>(
      `/ielts/tests/${id}/with-answers`
    );
    return response.data;
  },

  async createTest(testData: Partial<IeltsTest>): Promise<IeltsTest> {
    const response = await api.post<IeltsTest>("/ielts/tests", testData);
    return response.data;
  },

  async updateTest(
    id: number,
    testData: Partial<IeltsTest>
  ): Promise<IeltsTest> {
    const response = await api.patch<IeltsTest>(`/ielts/tests/${id}`, testData);
    return response.data;
  },

  async deleteTest(id: number): Promise<void> {
    await api.delete(`/ielts/tests/${id}`);
  },

  // Section Management
  async createSection(
    testId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    const response = await api.post<IeltsSection>(
      `/ielts/tests/${testId}/sections`,
      sectionData
    );
    return response.data;
  },

  async updateSection(
    sectionId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    const response = await api.patch<IeltsSection>(
      `/ielts/sections/${sectionId}`,
      sectionData
    );
    return response.data;
  },

  async removeSection(sectionId: number): Promise<void> {
    await api.delete(`/ielts/sections/${sectionId}`);
  },

  // Question Management
  async createQuestion(
    sectionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    const response = await api.post<IeltsQuestion>(
      `/ielts/sections/${sectionId}/questions`,
      questionData
    );
    return response.data;
  },

  async updateQuestion(
    questionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    const response = await api.patch<IeltsQuestion>(
      `/ielts/questions/${questionId}`,
      questionData
    );
    return response.data;
  },

  async removeQuestion(questionId: number): Promise<void> {
    await api.delete(`/ielts/questions/${questionId}`);
  },

  // Test Taking
  async submitTest(
    testId: number,
    answers: { questionId: number; answer: string }[]
  ): Promise<IeltsSubmission> {
    const response = await api.post<IeltsSubmission>(
      `/ielts/tests/${testId}/submit`,
      { answers }
    );
    return response.data;
  },

  // Submissions and Results
  async getMySubmissions(): Promise<IeltsSubmission[]> {
    const response = await api.get<IeltsSubmission[]>("/ielts/my-submissions");
    return response.data;
  },

  async getTestSubmissions(testId: number): Promise<IeltsSubmission[]> {
    const response = await api.get<PaginatedResult<IeltsSubmission>>(
      `/ielts/tests/${testId}/submissions`
    );
    return response.data.data;
  },

  async getSubmissionDetails(
    submissionId: number
  ): Promise<IeltsSubmissionResult> {
    const response = await api.get<IeltsSubmissionResult>(
      `/ielts/submissions/${submissionId}/details`
    );
    return response.data;
  },

  // Get resources by skill (for IeltsCenter component)
  async getResourcesBySkill(skill: string): Promise<IeltsTest[]> {
    const response = await this.getTests({ skill });
    return response.data;
  },
};
