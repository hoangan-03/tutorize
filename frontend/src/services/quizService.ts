import api from "../lib/api";
import {
  Quiz,
  QuizQuestion,
  QuizSubmission,
  QuizAnswer,
  PaginationParams,
  PaginatedResult,
} from "../types/api";

export const quizService = {
  // Quiz Management
  async getQuizzes(params?: PaginationParams): Promise<PaginatedResult<Quiz>> {
    const response = await api.get<PaginatedResult<Quiz>>("/quizzes", {
      params,
    });
    return response.data;
  },

  async getQuiz(id: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },

  async getQuizWithAnswers(id: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${id}/with-answers`);
    return response.data;
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await api.post<Quiz>("/quizzes", quizData);
    return response.data;
  },

  async updateQuiz(id: string, quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await api.put<Quiz>(`/quizzes/${id}`, quizData);
    return response.data;
  },

  async deleteQuiz(id: string): Promise<void> {
    await api.delete(`/quizzes/${id}`);
  },

  async publishQuiz(id: string): Promise<Quiz> {
    const response = await api.post<Quiz>(`/quizzes/${id}/publish`);
    return response.data;
  },

  async closeQuiz(id: string): Promise<Quiz> {
    const response = await api.post<Quiz>(`/quizzes/${id}/close`);
    return response.data;
  },

  // Question Management
  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    const response = await api.get<QuizQuestion[]>(
      `/quizzes/${quizId}/questions`
    );
    return response.data;
  },

  async createQuestion(
    quizId: string,
    questionData: Partial<QuizQuestion>
  ): Promise<QuizQuestion> {
    const response = await api.post<QuizQuestion>(
      `/quizzes/${quizId}/questions`,
      questionData
    );
    return response.data;
  },

  async updateQuestion(
    quizId: string,
    questionId: string,
    questionData: Partial<QuizQuestion>
  ): Promise<QuizQuestion> {
    const response = await api.put<QuizQuestion>(
      `/quizzes/${quizId}/questions/${questionId}`,
      questionData
    );
    return response.data;
  },

  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  // Quiz Taking
  async startQuiz(quizId: string): Promise<QuizSubmission> {
    const response = await api.post<QuizSubmission>(`/quizzes/${quizId}/start`);
    return response.data;
  },

  async getSubmission(submissionId: string): Promise<QuizSubmission> {
    const response = await api.get<QuizSubmission>(
      `/quiz-submissions/${submissionId}`
    );
    return response.data;
  },

  async saveAnswer(
    submissionId: string,
    questionId: string,
    answer: string
  ): Promise<QuizAnswer> {
    const response = await api.post<QuizAnswer>(
      `/quiz-submissions/${submissionId}/answers`,
      {
        questionId,
        answer,
      }
    );
    return response.data;
  },

  async submitQuiz(submissionId: string): Promise<QuizSubmission> {
    const response = await api.post<QuizSubmission>(
      `/quiz-submissions/${submissionId}/submit`
    );
    return response.data;
  },

  // Submissions and Results
  async getMySubmissions(
    params?: PaginationParams
  ): Promise<PaginatedResult<QuizSubmission>> {
    const response = await api.get<PaginatedResult<QuizSubmission>>(
      "/quiz-submissions/my",
      { params }
    );
    return response.data;
  },

  async getQuizSubmissions(
    quizId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<QuizSubmission>> {
    const response = await api.get<PaginatedResult<QuizSubmission>>(
      `/quizzes/${quizId}/submissions`,
      { params }
    );
    return response.data;
  },

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<QuizSubmission> {
    const response = await api.post<QuizSubmission>(
      `/quiz-submissions/${submissionId}/grade`,
      {
        score,
        feedback,
      }
    );
    return response.data;
  },

  // Statistics
  async getQuizStats(quizId: string): Promise<any> {
    const response = await api.get(`/quizzes/${quizId}/stats`);
    return response.data;
  },

  async getMyQuizStats(): Promise<any> {
    const response = await api.get("/quiz-submissions/stats");
    return response.data;
  },
};
