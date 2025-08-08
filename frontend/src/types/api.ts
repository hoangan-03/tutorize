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

export enum Role {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum QuizStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OVERDUE = "OVERDUE",
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
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  LATE = "LATE",
}

export enum ExerciseStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OVERDUE = "OVERDUE",
}

export enum DocumentType {
  PDF = "PDF",
  VIDEO = "VIDEO",
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
  IDENTIFYING_INFORMATION = "IDENTIFYING_INFORMATION", // True/False/Not Given, Yes/No/Not Given
  MATCHING = "MATCHING", // Matching headings, features, sentence endings
  COMPLETION = "COMPLETION", // Sentence, summary, note, table, flow-chart completion
  SHORT_ANSWER = "SHORT_ANSWER",
}

export enum IeltsWritingType {
  IELTS_TASK1 = "IELTS_TASK1",
  IELTS_TASK2 = "IELTS_TASK2",
}

export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

// User Types
export interface User {
  id: number;
  email: string;
  password: string;
  role: Role;

  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  profile?: UserProfile;
  quizzesCreated?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  exercisesCreated?: Exercise[];
  exerciseSubmissions?: ExerciseSubmission[];
  documentsUploaded?: Document[];
  documentAccesses?: DocumentAccess[];
  ieltsSubmissions?: IeltsSubmission[];
  ieltsWritingSubmissions?: IeltsWritingSubmission[];
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  grade?: number;
  subject?: string;
  address?: string;
  school?: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

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
  firstName: string;
  lastName: string;
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
  subject: Subject;
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

  submission?: QuizSubmission;
  question?: Question;
}

// Exercise Types
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  subject: Subject;
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

  creator?: User;
  attachments?: ExerciseAttachment[];
  exerciseSubmissions?: ExerciseSubmission[];
  rubric?: GradingRubric;
  _count?: {
    exerciseSubmissions: number;
  };
}

export enum EditMode {
  RICH = "rich",
  LATEX = "latex",
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

  exercise?: Exercise;
}

export interface ExerciseSubmission {
  id: number;
  exerciseId: number;
  userId: number;
  submissionUrl: JSON;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: number;
  status: SubmissionStatus;
  version: number;

  exercise?: Exercise;
  user?: User;
}

export interface GradingRubric {
  id: number;
  exerciseId: number;
  criteria: Record<string, unknown>;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;

  exercise?: Exercise;
}

// Document Types
export interface Document {
  id: number;
  title: string;
  description: string;
  subject: Subject;
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

  document?: Document;
  user?: User;
}

// IELTS Types
export interface IeltsReadingTest {
  id: number;
  title: string;
  description: string;
  level: IeltsLevel;
  timeLimit: number;
  isActive: boolean;
  createdBy: number;
  instructions?: string;
  createdAt: string;
  updatedAt: string;

  creator?: User;
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
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;

  test?: IeltsReadingTest;
  questions?: IeltsQuestion[];
}

export interface IeltsQuestion {
  id: number;
  sectionId: number;
  question: string;
  type: IeltsQuestionType;
  subQuestions?: string[];
  options: string[];
  correctAnswers: string[];
  order: number;
  imageUrl?: string;
  points: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;

  section?: IeltsSection;
  answers?: IeltsAnswer[];
}

export interface IeltsDetailedScores {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  sectionScores?: Record<string, number>;
}

export interface IeltsSubmission {
  id: number;
  testId: number;
  userId: number;
  score: number;
  detailedScores: IeltsDetailedScores;
  feedback: string;
  submittedAt: string;
  gradedAt?: string;
  audioRecording?: string;

  test?: IeltsReadingTest;
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

  submission?: IeltsSubmission;
  question?: IeltsQuestion;
}

export interface IeltsWritingTest {
  id: number;
  title: string;
  prompt?: string;
  type: IeltsWritingType;
  level: IeltsLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  creator?: User;
  submissions?: IeltsWritingSubmission[];
}

export interface IeltsWritingSubmission {
  id: number;
  testId: number;
  userId: number;
  content: string;
  submittedAt: string;
  gradedAt?: string;
  aiScore?: Record<string, unknown>;
  aiFeedback?: Record<string, unknown>;
  humanScore?: Record<string, unknown>;
  humanFeedback?: Record<string, unknown>;

  test?: IeltsWritingTest;
  user?: User;
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
