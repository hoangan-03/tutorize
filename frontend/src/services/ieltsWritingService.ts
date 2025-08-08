/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../lib/api";
import { IeltsLevel, IeltsWritingType, PaginationParams } from "../types/api";

export const ieltsWritingService = {
  // Writing Tests
  async createTest(data: {
    title: string;
    prompt: string;
    type: IeltsWritingType;
    level?: IeltsLevel;
  }): Promise<any> {
    const response = await api.post("/ielts-writing/tests", data);
    return response.data;
  },

  async listTests(
    params?: PaginationParams & { level?: string; type?: string }
  ) {
    const response = await api.get("/ielts-writing/tests", { params });
    return response.data;
  },

  async getTest(testId: number): Promise<any> {
    const response = await api.get(`/ielts-writing/tests/${testId}`);
    return response.data;
  },

  async submitTest(testId: number, content: string): Promise<any> {
    const response = await api.post(`/ielts-writing/tests/${testId}/submit`, {
      content,
    });
    return response.data;
  },

  async manualGradeTest(
    testId: number,
    data: {
      score: Record<string, unknown>;
      feedback: Record<string, unknown>;
    }
  ): Promise<any> {
    const response = await api.post(
      `/ielts-writing/tests/${testId}/manual-grade`,
      data
    );
    return response.data;
  },

  async editTest(
    testId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: IeltsWritingType;
      level?: IeltsLevel;
    }
  ): Promise<any> {
    const response = await api.put(`/ielts-writing/tests/${testId}`, data);
    return response.data;
  },

  async deleteTest(testId: number): Promise<void> {
    await api.delete(`/ielts-writing/tests/${testId}`);
  },

  async getTestSubmissions(testId: number): Promise<any> {
    const response = await api.get(
      `/ielts-writing/tests/${testId}/submissions`
    );
    return response.data;
  },

  async getMySubmissions(): Promise<any> {
    const response = await api.get("/ielts-writing/submissions");
    return response.data;
  },
};
