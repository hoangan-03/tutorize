/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../lib/api";
import {
  Quiz,
  Question,
  QuizSubmission,
  QuizAnswer,
  PaginationParams,
  PaginatedResult,
} from "../types/api";

export const quizService = {
  async getQuizzes(
    url: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Quiz>> {
    const response = await api.get<PaginatedResult<Quiz>>(url, {
      params,
    });
    return response.data;
  },

  async getQuiz(id: number): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },

  async getQuizWithAnswers(id: number): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${id}/with-answers`);
    return response.data;
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await api.post<Quiz>("/quizzes", quizData);
    return response.data;
  },

  async updateQuiz(id: number, quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await api.patch<Quiz>(`/quizzes/${id}`, quizData);
    return response.data;
  },

  async deleteQuiz(id: number): Promise<void> {
    await api.delete(`/quizzes/${id}`);
  },

  async updateQuizStatus(id: number, status: string): Promise<Quiz> {
    const response = await api.patch<Quiz>(`/quizzes/${id}/status`, { status });
    return response.data;
  },

  async checkOverdueQuizzes(): Promise<any> {
    const response = await api.post("/quizzes/check-overdue");
    return response.data;
  },

  async publishQuiz(id: number): Promise<Quiz> {
    return this.updateQuizStatus(id, "ACTIVE");
  },

  async closeQuiz(id: number): Promise<Quiz> {
    return this.updateQuizStatus(id, "INACTIVE");
  },

  // Question Management
  async getQuizQuestions(quizId: number): Promise<Question[]> {
    const response = await api.get<Question[]>(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  async createQuestion(
    quizId: number,
    questionData: Partial<Question>
  ): Promise<Question> {
    const response = await api.post<Question>(
      `/quizzes/${quizId}/questions`,
      questionData
    );
    return response.data;
  },

  async updateQuestion(
    quizId: number,
    questionId: number,
    questionData: Partial<Question>
  ): Promise<Question> {
    const response = await api.put<Question>(
      `/quizzes/${quizId}/questions/${questionId}`,
      questionData
    );
    return response.data;
  },

  async deleteQuestion(quizId: number, questionId: number): Promise<void> {
    await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  // Quiz Taking
  async startQuiz(quizId: number): Promise<QuizSubmission> {
    const response = await api.post<QuizSubmission>(`/quizzes/${quizId}/start`);
    return response.data;
  },

  async getSubmission(submissionId: number): Promise<QuizSubmission> {
    const response = await api.get<QuizSubmission>(
      `/quiz-submissions/${submissionId}`
    );
    return response.data;
  },

  async saveAnswer(
    submissionId: number,
    questionId: number,
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

  async submitQuiz(
    quizId: number,
    submitData: {
      answers: Array<{
        questionId: number;
        userAnswer: string;
        timeTaken?: number;
      }>;
      timeSpent?: number;
    }
  ): Promise<QuizSubmission> {
    const response = await api.post<QuizSubmission>(
      `/quizzes/${quizId}/submit`,
      submitData
    );
    return response.data;
  },

  async submitQuizOld(submissionId: number): Promise<QuizSubmission> {
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
    quizId: number,
    params?: PaginationParams
  ): Promise<PaginatedResult<QuizSubmission>> {
    const response = await api.get<PaginatedResult<QuizSubmission>>(
      `/quizzes/${quizId}/submissions`,
      { params }
    );
    return response.data;
  },

  async gradeSubmission(
    submissionId: number,
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
  async getQuizStats(quizId: number): Promise<any> {
    const response = await api.get(`/quizzes/${quizId}/stats`);
    return response.data;
  },

  async getMyQuizStats(): Promise<any> {
    const response = await api.get("/quizzes/my-submission-stats");
    return response.data;
  },

  async getTeacherStats(): Promise<{
    totalQuizzes: number;
    activeQuizzes: number;
    overdueQuizzes: number;
    totalSubmissions: number;
  }> {
    const response = await api.get("/quizzes/teacher-stats");
    return response.data;
  },

  async getStudentStats(): Promise<{
    totalQuizzes: number;
    completedQuizzes: number;
    overdueQuizzes: number;
    averageScore: number;
    perfectCount: number;
  }> {
    const response = await api.get("/quizzes/student-stats");
    return response.data;
  },

  async getDetailedQuizStats(quizId: number): Promise<any> {
    const response = await api.get(`/quizzes/${quizId}/detailed-stats`);
    return response.data;
  },

  // Quiz Submission History
  async getQuizSubmissionHistory(quizId: number): Promise<{
    quiz: Quiz;
    submissions: QuizSubmission[];
    canRetake: boolean;
    remainingAttempts: number;
    currentAttempt: number;
    maxScore: number;
  }> {
    const response = await api.get(`/quizzes/${quizId}/submission-history`);
    return response.data;
  },

  // Get submission for student review
  async getSubmissionForReview(
    quizId: number,
    submissionId: number
  ): Promise<QuizSubmission> {
    const response = await api.get(`/quizzes/${quizId}/review/${submissionId}`);
    return response.data;
  },
};
