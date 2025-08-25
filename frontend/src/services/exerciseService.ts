import api from "../lib/api";
import {
  Exercise,
  ExerciseSubmission,
  PaginationParams,
  PaginatedResult,
  ExerciseStatus,
} from "../types/api";

// Type for updating exercises - only allowed fields
type UpdateExerciseData = Pick<
  Exercise,
  | "name"
  | "description"
  | "subject"
  | "grade"
  | "deadline"
  | "note"
  | "content"
  | "latexContent"
  | "status"
>;

export const exerciseService = {
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

  async getMaxScore(submissionId: number): Promise<number> {
    const response = await api.get<{ maxScore: number }>(
      `/exercise-submissions/${submissionId}/max-score`
    );
    return response.data.maxScore;
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
    // Only send fields that are allowed for updates
    const allowedFields: (keyof UpdateExerciseData)[] = [
      "name",
      "description",
      "subject",
      "grade",
      "deadline",
      "note",
      "content",
      "latexContent",
      "status",
    ];

    const updateData: Partial<UpdateExerciseData> = {};
    allowedFields.forEach((field) => {
      if (exerciseData[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData[field] = exerciseData[field] as any;
      }
    });

    const response = await api.patch<Exercise>(`/exercises/${id}`, updateData);
    return response.data;
  },

  async deleteExercise(id: number): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },

  async closeExercise(id: number): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/exercises/${id}/status`, {
      status: ExerciseStatus.INACTIVE,
    });
    return response.data;
  },

  async publishExercise(id: number): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/exercises/${id}/status`, {
      status: ExerciseStatus.ACTIVE,
    });
    return response.data;
  },

  async archiveExercise(id: number): Promise<Exercise> {
    const response = await api.patch<Exercise>(`/exercises/${id}/status`, {
      status: ExerciseStatus.INACTIVE,
    });
    return response.data;
  },

  async uploadFile(id: number, file: File): Promise<Exercise> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<Exercise>(
      `/exercises/${id}/upload-file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async getFileUrl(id: number): Promise<{ fileUrl: string; fileName: string }> {
    const response = await api.get<{ fileUrl: string; fileName: string }>(
      `/exercises/${id}/file-url`
    );
    return response.data;
  },

  // Exercise Submissions
  async submitExerciseWithImages(
    exerciseId: number,
    imageLinks: string[]
  ): Promise<ExerciseSubmission> {
    const response = await api.post<ExerciseSubmission>(
      `/exercises/${exerciseId}/submit`,
      {
        imageLinks,
        submittedAt: new Date().toISOString(),
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
    imageLinks: string[]
  ): Promise<ExerciseSubmission> {
    const response = await api.put<ExerciseSubmission>(
      `/exercise-submissions/${submissionId}`,
      {
        imageLinks,
        submittedAt: new Date().toISOString(),
      }
    );
    return response.data;
  },

  async deleteSubmission(submissionId: number): Promise<void> {
    await api.delete(`/exercise-submissions/${submissionId}`);
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

  async getAllSubmissions(
    params?: PaginationParams
  ): Promise<PaginatedResult<ExerciseSubmission>> {
    const response = await api.get<PaginatedResult<ExerciseSubmission>>(
      "/exercise-submissions/all",
      { params }
    );
    return response.data;
  },

  async getExerciseSubmissions(
    exerciseId: number,
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
    const response = await api.patch<ExerciseSubmission>(
      `/exercises/submissions/${submissionId}/grade`,
      {
        score,
        feedback,
      }
    );
    return response.data;
  },

  // Statistics
  async getExerciseStats(exerciseId: number): Promise<unknown> {
    const response = await api.get(`/exercises/${exerciseId}/stats`);
    return response.data;
  },

  async getMyExerciseStats(): Promise<unknown> {
    const response = await api.get("/exercise-submissions/stats");
    return response.data;
  },
};
