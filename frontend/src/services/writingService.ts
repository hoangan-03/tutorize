/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../lib/api";
import {
  WritingAssessment,
  PaginationParams,
  PaginatedResult,
} from "../types/api";

export const writingService = {
  // Writing Assessment
  async assessWriting(data: {
    title: string;
    content: string;
    type: "ESSAY" | "IELTS_TASK1" | "IELTS_TASK2" | "CREATIVE" | "ACADEMIC";
  }): Promise<WritingAssessment> {
    const response = await api.post<WritingAssessment>("/writing/assess", data);
    return response.data;
  },

  async getAssessments(
    params?: PaginationParams
  ): Promise<PaginatedResult<WritingAssessment>> {
    const response = await api.get<PaginatedResult<WritingAssessment>>(
      "/writing",
      { params }
    );
    return response.data;
  },

  async getAssessment(id: number): Promise<WritingAssessment> {
    const response = await api.get<WritingAssessment>(`/writing/${id}`);
    return response.data;
  },

  async updateAssessment(
    id: number,
    data: Partial<WritingAssessment>
  ): Promise<WritingAssessment> {
    const response = await api.put<WritingAssessment>(`/writing/${id}`, data);
    return response.data;
  },

  async deleteAssessment(id: number): Promise<void> {
    await api.delete(`/writing/${id}`);
  },

  // Human Review
  async addHumanFeedback(
    id: number,
    data: {
      humanScore: number;
      humanFeedback: string;
    }
  ): Promise<WritingAssessment> {
    const response = await api.post<WritingAssessment>(
      `/writing/${id}/human-feedback`,
      data
    );
    return response.data;
  },

  // Statistics
  async getWritingStats(): Promise<any> {
    const response = await api.get("/writing/stats");
    return response.data;
  },

  async getMyWritingStats(): Promise<any> {
    const response = await api.get("/writing/my-stats");
    return response.data;
  },

  // Writing Tasks
  async createTask(data: {
    title: string;
    prompt: string;
    type: "IELTS_TASK1" | "IELTS_TASK2";
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }): Promise<any> {
    const response = await api.post("/writing/tasks", data);
    return response.data;
  },

  async listTasks(
    params?: PaginationParams & { level?: string; type?: string }
  ) {
    const response = await api.get("/writing/tasks", { params });
    return response.data;
  },

  async submitTask(taskId: number, content: string): Promise<any> {
    const response = await api.post(`/writing/tasks/${taskId}/submit`, {
      content,
    });
    return response.data;
  },

  async gradeTask(taskId: number): Promise<any> {
    const response = await api.post(`/writing/tasks/${taskId}/grade`, {});
    return response.data;
  },

  async editTask(
    taskId: number,
    data: {
      title?: string;
      prompt?: string;
      type?: "IELTS_TASK1" | "IELTS_TASK2";
      level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    }
  ): Promise<any> {
    const response = await api.put(`/writing/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId: number): Promise<void> {
    await api.delete(`/writing/tasks/${taskId}`);
  },

  async getTaskSubmissions(taskId: number): Promise<any> {
    const response = await api.get(`/writing/tasks/${taskId}/submissions`);
    return response.data;
  },
};
