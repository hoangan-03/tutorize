import api from "../lib/api";
import {
  Exercise,
  ExerciseSubmission,
  PaginationParams,
  PaginatedResult,
} from "../types/api";

export const exerciseService = {
  // Exercise Management
  async getExercises(
    params?: PaginationParams
  ): Promise<PaginatedResult<Exercise>> {
    const response = await api.get<PaginatedResult<Exercise>>("/exercises", {
      params,
    });
    return response.data;
  },

  async getExercise(id: number): Promise<Exercise> {
    const response = await api.get<Exercise>(`/exercises/${id}`);
    return response.data;
  },

  async getExerciseWithAnswers(id: number): Promise<Exercise> {
    const response = await api.get<Exercise>(`/exercises/${id}/with-answers`);
    return response.data;
  },

  async createExercise(exerciseData: Partial<Exercise>): Promise<Exercise> {
    const response = await api.post<Exercise>("/exercises", exerciseData);
    return response.data;
  },

  async updateExercise(
    id: number,
    exerciseData: Partial<Exercise>
  ): Promise<Exercise> {
    const response = await api.put<Exercise>(`/exercises/${id}`, exerciseData);
    return response.data;
  },

  async deleteExercise(id: number): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },

  async publishExercise(id: number): Promise<Exercise> {
    const response = await api.post<Exercise>(`/exercises/${id}/publish`);
    return response.data;
  },

  async archiveExercise(id: number): Promise<Exercise> {
    const response = await api.post<Exercise>(`/exercises/${id}/archive`);
    return response.data;
  },

  // Exercise Submissions
  async submitExercise(
    exerciseid: number,
    content: string
  ): Promise<ExerciseSubmission> {
    const response = await api.post<ExerciseSubmission>(
      `/exercises/${exerciseId}/submit`,
      {
        content,
      }
    );
    return response.data;
  },

  async getSubmission(submissionId: number): Promise<ExerciseSubmission> {
    const response = await api.get<ExerciseSubmission>(
      `/exercise-submissions/${submissionId}`
    );
    return response.data;
  },

  async updateSubmission(
    submissionId: number,
    content: string
  ): Promise<ExerciseSubmission> {
    const response = await api.put<ExerciseSubmission>(
      `/exercise-submissions/${submissionId}`,
      {
        content,
      }
    );
    return response.data;
  },

  async getMySubmissions(
    params?: PaginationParams
  ): Promise<PaginatedResult<ExerciseSubmission>> {
    const response = await api.get<PaginatedResult<ExerciseSubmission>>(
      "/exercise-submissions/my",
      { params }
    );
    return response.data;
  },

  async getExerciseSubmissions(
    exerciseid: number,
    params?: PaginationParams
  ): Promise<PaginatedResult<ExerciseSubmission>> {
    const response = await api.get<PaginatedResult<ExerciseSubmission>>(
      `/exercises/${exerciseId}/submissions`,
      { params }
    );
    return response.data;
  },

  // Grading
  async gradeSubmission(
    submissionId: number,
    score: number,
    feedback?: string
  ): Promise<ExerciseSubmission> {
    const response = await api.post<ExerciseSubmission>(
      `/exercise-submissions/${submissionId}/grade`,
      {
        score,
        feedback,
      }
    );
    return response.data;
  },

  // Statistics
  async getExerciseStats(exerciseid: number): Promise<any> {
    const response = await api.get(`/exercises/${exerciseId}/stats`);
    return response.data;
  },

  async getMyExerciseStats(): Promise<any> {
    const response = await api.get("/exercise-submissions/stats");
    return response.data;
  },
};
