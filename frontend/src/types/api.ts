// Base API Response interface
export interface ApiResponse<T = unknown> {
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

// Enums
export enum Role {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum QuizStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum Subject {
  MATH = "MATH",
  PHYSICS = "PHYSICS",
  LITERATURE = "LITERATURE",
  CHEMISTRY = "CHEMISTRY",
  BIOLOGY = "BIOLOGY",
  NATURAL_SCIENCE = "NATURAL_SCIENCE",
  ENGLISH = "ENGLISH",
  HISTORY = "HISTORY",
  GEOGRAPHY = "GEOGRAPHY",
  CIVICS = "CIVICS",
  CAREER_GUIDANCE = "CAREER_GUIDANCE",
  LOCAL_STUDIES = "LOCAL_STUDIES",
  ECONOMICS_LAW = "ECONOMICS_LAW",
  TECHNOLOGY = "TECHNOLOGY",
  ART = "ART",
  MUSIC = "MUSIC",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  FILL_BLANK = "FILL_BLANK",
  ESSAY = "ESSAY",
}

export enum SubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  IN_PROGRESS = "IN_PROGRESS",
  LATE = "LATE",
}

export enum ExerciseStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum DocumentType {
  PDF = "PDF",
  VIDE = "VIDE",
  IMAGE = "IMAGE",
  PRESENTATION = "PRESENTATION",
  WORD = "WORD",
}

export enum AccessAction {
  VIEW = "VIEW",
  DOWNLOAD = "DOWNLOAD",
  SHARE = "SHARE",
}

export enum IeltsSkill {
  READING = "READING",
  WRITING = "WRITING",
  LISTENING = "LISTENING",
  SPEAKING = "SPEAKING",
}

export enum IeltsLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum IeltsQuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  FILL_BLANK = "FILL_BLANK",
  MATCHING = "MATCHING",
  TRUE_FALSE_NOT_GIVEN = "TRUE_FALSE_NOT_GIVEN",
  ESSAY = "ESSAY",
}

export enum WritingType {
  ESSAY = "ESSAY",
  IELTS_TASK1 = "IELTS_TASK1",
  IELTS_TASK2 = "IELTS_TASK2",
  CREATIVE = "CREATIVE",
  ACADEMIC = "ACADEMIC",
}

export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  QUIZ_ASSIGNED = "QUIZ_ASSIGNED",
  EXERCISE_ASSIGNED = "EXERCISE_ASSIGNED",
  GRADE_RELEASED = "GRADE_RELEASED",
  DEADLINE_REMINDER = "DEADLINE_REMINDER",
}

// User Types
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar?: string;
  grade?: number;
  subject?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  profile?: UserProfile;
  quizzesCreated?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  exercisesCreated?: Exercise[];
  exerciseSubmissions?: ExerciseSubmission[];
  documentsUploaded?: Document[];
  documentAccesses?: DocumentAccess[];
  ieltsSubmissions?: IeltsSubmission[];
  writingAssessments?: WritingAssessment[];
  notifications?: Notification[];
  systemLogs?: SystemLog[];
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  school?: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
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
  role: Role;
  grade?: number;
  subject?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  school?: string;
  dateOfBirth?: string;
}

// Quiz Types
export interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  grade: number;
  timeLimit: number;
  deadline: string;
  status: QuizStatus;
  createdBy: number;
  totalQuestions: number;
  totalSubmissions: number;
  averageScore: number;
  isPublic: boolean;
  tags: string[];
  instructions?: string;
  maxAttempts: number;
  isAllowedReviewed: boolean;
  isAllowedViewAnswerAfterSubmit: boolean;
  showResultsImmediately: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  creator?: User;
  questions?: Question[];
  submissions?: QuizSubmission[];
}

export interface Question {
  id: number;
  quizId: number;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  order: number;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  quiz?: Quiz;
  answers?: QuizAnswer[];
}

export interface QuizSubmission {
  id: number;
  quizId: number;
  userId: number;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  timeSpent: number;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  status: SubmissionStatus;

  // Relations
  quiz?: Quiz;
  user?: User;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  submissionId: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
  createdAt: string;

  // Relations
  submission?: QuizSubmission;
  question?: Question;
}

// Exercise Types
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  subject: string;
  grade: number;
  deadline: string;
  note?: string;
  content: string;
  latexContent?: string;
  createdBy: number;
  submissions: number;
  status: ExerciseStatus;
  maxScore: number;
  allowLateSubmission: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  creator?: User;
  attachments?: ExerciseAttachment[];
  exerciseSubmissions?: ExerciseSubmission[];
  rubric?: GradingRubric;
}

export interface ExerciseAttachment {
  id: number;
  exerciseId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;

  // Relations
  exercise?: Exercise;
}

export interface ExerciseSubmission {
  id: number;
  exerciseId: number;
  userId: number;
  content: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: number;
  status: SubmissionStatus;
  version: number;

  // Relations
  exercise?: Exercise;
  user?: User;
  attachments?: SubmissionAttachment[];
}

export interface SubmissionAttachment {
  id: number;
  submissionId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;

  // Relations
  submission?: ExerciseSubmission;
}

export interface GradingRubric {
  id: number;
  exerciseId: number;
  criteria: Record<string, unknown>;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  exercise?: Exercise;
}

// Document Types
export interface Document {
  id: number;
  title: string;
  description: string;
  subject: string;
  grade: number;
  type: DocumentType;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  duration?: number;
  downloadCount: number;
  viewCount: number;
  tags: string[];
  uploadedBy: number;
  isPublic: boolean;
  isApproved: boolean;
  approvedBy?: number;
  approvedAt?: string;
  uploadedAt: string;
  updatedAt: string;

  // Relations
  uploader?: User;
  accesses?: DocumentAccess[];
}

export interface DocumentAccess {
  id: number;
  documentId: number;
  userId: number;
  action: AccessAction;
  accessedAt: string;
  ipAddress?: string;
  userAgent?: string;

  // Relations
  document?: Document;
  user?: User;
}

// IELTS Types
export interface IeltsTest {
  id: number;
  title: string;
  description: string;
  skill: IeltsSkill;
  level: IeltsLevel;
  timeLimit: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  sections?: IeltsSection[];
  submissions?: IeltsSubmission[];
}

export interface IeltsSection {
  id: number;
  testId: number;
  title: string;
  instructions: string;
  timeLimit: number;
  order: number;
  passageText?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  test?: IeltsTest;
  questions?: IeltsQuestion[];
}

export interface IeltsQuestion {
  id: number;
  sectionId: number;
  question: string;
  type: IeltsQuestionType;
  options: string[];
  correctAnswer: string;
  order: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  section?: IeltsSection;
  answers?: IeltsAnswer[];
}

export interface IeltsSubmission {
  id: number;
  testId: number;
  userId: number;
  skill: IeltsSkill;
  score: number;
  detailedScores: Record<string, unknown>;
  feedback: string;
  submittedAt: string;
  gradedAt?: string;
  audioRecording?: string;

  // Relations
  test?: IeltsTest;
  user?: User;
  answers?: IeltsAnswer[];
}

export interface IeltsAnswer {
  id: number;
  submissionId: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: string;

  // Relations
  submission?: IeltsSubmission;
  question?: IeltsQuestion;
}

// Writing Assessment Types
export interface WritingAssessment {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: WritingType;
  prompt?: string;
  wordCount: number;
  aiScore: Record<string, unknown>;
  humanScore?: Record<string, unknown>;
  feedback: Record<string, unknown>;
  submittedAt: string;
  gradedAt: string;
  isPublic: boolean;

  // Relations
  user?: User;
}

// System Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;

  // Relations
  user?: User;
}

export interface SystemLog {
  id: number;
  userId?: number;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;

  // Relations
  user?: User;
}

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
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
