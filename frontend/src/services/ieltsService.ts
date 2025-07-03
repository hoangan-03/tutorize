import api from "../lib/api";
import { PaginationParams, PaginatedResult } from "../types/api";

export interface IeltsTest {
  id: number;
  title: string;
  description?: string;
  skill: "READING" | "WRITING" | "LISTENING" | "SPEAKING";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  timeLimit: number;
  instructions?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  sections: IeltsSection[];
}

export interface IeltsSection {
  id: number;
  title: string;
  description?: string;
  order: number;
  content?: string;
  audioUrl?: string;
  questions: IeltsQuestion[];
}

export interface IeltsQuestion {
  id: number;
  question: string;
  type:
    | "MULTIPLE_CHOICE"
    | "TRUE_FALSE"
    | "FILL_BLANK"
    | "ESSAY"
    | "MATCHING"
    | "ORDERING";
  options?: string[];
  correctAnswers?: string[];
  points: number;
  order: number;
  explanation?: string;
}

export interface IeltsSubmission {
  id: number;
  testId: number;
  userId: number;
  score: number;
  totalPoints: number;
  submittedAt: string;
  test: IeltsTest;
  answers: IeltsAnswer[];
}

export interface IeltsAnswer {
  id: number;
  submissionId: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  question: IeltsQuestion;
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
    testid: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    const response = await api.post<IeltsSection>(
      `/ielts/tests/${testId}/sections`,
      sectionData
    );
    return response.data;
  },

  // Question Management
  async createQuestion(
    sectionid: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    const response = await api.post<IeltsQuestion>(
      `/ielts/sections/${sectionId}/questions`,
      questionData
    );
    return response.data;
  },

  // Test Taking
  async submitTest(
    testid: number,
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

  async getTestSubmissions(testid: number): Promise<IeltsSubmission[]> {
    const response = await api.get<IeltsSubmission[]>(
      `/ielts/tests/${testId}/submissions`
    );
    return response.data;
  },

  // Get resources by skill (for IeltsCenter component)
  async getResourcesBySkill(skill: string): Promise<IeltsTest[]> {
    const response = await this.getTests({ skill });
    return response.data;
  },
};
