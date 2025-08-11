/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../lib/api";
import { IeltsLevel, IeltsWritingType, PaginationParams } from "../types/api";

export const ieltsWritingService = {
  // IELTS Writing Tests
  async createWritingTest(data: {
    title: string;
    prompt: string;
    type: IeltsWritingType;
    level?: IeltsLevel;
  }): Promise<any> {
    const response = await api.post("/ielts-writing", data);
    return response.data;
  },

  async listTests(
    params?: PaginationParams & { level?: string; type?: string }
  ) {
    const response = await api.get("/ielts-writing", { params });
    return response.data;
  },

  async getTest(testId: number): Promise<any> {
    const response = await api.get(`/ielts-writing/${testId}`);
    return response.data;
  },

  async submitWritingSubmission(testId: number, content: string): Promise<any> {
    const response = await api.post(`/ielts-writing/${testId}/submit`, {
      content,
    });
    return response.data;
  },

  async manualGradeWritingTest(
    testId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ): Promise<any> {
    const response = await api.post(
      `/ielts-writing/${testId}/manual-grade`,
      data
    );
    return response.data;
  },

  async editWritingTest(
    testId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: IeltsWritingType;
      level?: IeltsLevel;
    }
  ): Promise<any> {
    const response = await api.put(`/ielts-writing/${testId}`, data);
    return response.data;
  },

  async deleteWritingTest(testId: number): Promise<void> {
    await api.delete(`/ielts-writing/${testId}`);
  },

  async getWritingTestSubmissions(testId: number): Promise<any> {
    const response = await api.get(`/ielts-writing/${testId}/submissions`);
    return response.data;
  },

  async getWritingTestSubmission(
    testId: number,
    submissionId: number
  ): Promise<any> {
    const response = await api.get(
      `/ielts-writing/${testId}/submission/${submissionId}`
    );
    return response.data;
  },

  async getMySubmissions(): Promise<any> {
    const response = await api.get("/ielts-writing/my-submissions");
    return response.data;
  },

  async getMySubmission(submissionId: number): Promise<any> {
    const response = await api.get(
      `/ielts-writing/my-submission/${submissionId}`
    );
    return response.data;
  },

  async getSubmissionForGrading(submissionId: number): Promise<any> {
    const response = await api.get(`/ielts-writing/submission/${submissionId}`);
    return response.data;
  },

  async gradeSubmission(
    submissionId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ): Promise<any> {
    const response = await api.post(
      `/ielts-writing/submission/${submissionId}/grade`,
      data
    );
    return response.data;
  },
};
