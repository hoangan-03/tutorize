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

  async getAssessment(id: string): Promise<WritingAssessment> {
    const response = await api.get<WritingAssessment>(`/writing/${id}`);
    return response.data;
  },

  async updateAssessment(
    id: string,
    data: Partial<WritingAssessment>
  ): Promise<WritingAssessment> {
    const response = await api.put<WritingAssessment>(`/writing/${id}`, data);
    return response.data;
  },

  async deleteAssessment(id: string): Promise<void> {
    await api.delete(`/writing/${id}`);
  },

  // Human Review
  async addHumanFeedback(
    id: string,
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
};
