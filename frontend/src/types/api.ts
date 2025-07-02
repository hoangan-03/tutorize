// Base API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string[];
    error: string;
    statusCode: number;
  };
  statusCode: number;
  timestamp: string;
  path: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "TEACHER" | "STUDENT";
  grade?: number;
  subject?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "TEACHER" | "STUDENT";
  grade?: number;
  subject?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  address?: string;
  school?: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
    emailNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  school?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  timeLimit?: number; // minutes
  maxAttempts?: number;
  deadline?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  submissions?: QuizSubmission[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY";
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED";
  startedAt?: string;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  timeSpent?: number; // minutes
  answers: QuizAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsEarned?: number;
  createdAt: string;
  updatedAt: string;
}

// Exercise Types
export interface Exercise {
  id: string;
  title: string;
  description?: string;
  content: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedTime?: number; // minutes
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  submissions?: ExerciseSubmission[];
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  content: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED";
  score?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "PRESENTATION" | "WORD";
  uploadedById: string;
  uploadedBy?: User;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Writing Assessment Types
export interface WritingAssessment {
  id: string;
  title: string;
  content: string;
  type: "ESSAY" | "IELTS_TASK1" | "IELTS_TASK2" | "CREATIVE" | "ACADEMIC";
  userId: string;
  user?: User;
  aiScore?: number;
  aiFeedback?: string;
  humanScore?: number;
  humanFeedback?: string;
  assessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
