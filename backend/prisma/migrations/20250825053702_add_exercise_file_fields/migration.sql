-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('MATH', 'PHYSICS', 'LITERATURE', 'CHEMISTRY', 'BIOLOGY', 'NATURAL_SCIENCE', 'ENGLISH', 'HISTORY', 'GEOGRAPHY', 'CIVICS', 'CAREER_GUIDANCE', 'LOCAL_STUDIES', 'ECONOMICS_LAW', 'TECHNOLOGY', 'ART', 'MUSIC');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'OVERDUE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED', 'LATE');

-- CreateEnum
CREATE TYPE "ExerciseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'PRESENTATION', 'WORD');

-- CreateEnum
CREATE TYPE "IeltsLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "IeltsReadingQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'IDENTIFYING_INFORMATION', 'MATCHING', 'COMPLETION', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "IeltsWritingType" AS ENUM ('IELTS_TASK1', 'IELTS_TASK2');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "avatar" TEXT,
    "grade" INTEGER,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "school" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "grade" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "instructions" TEXT,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "isAllowedReviewed" BOOLEAN NOT NULL DEFAULT false,
    "isAllowedViewAnswerAfterSubmit" BOOLEAN NOT NULL DEFAULT false,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleAnswers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctAnswer" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswer" TEXT NOT NULL DEFAULT '',
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeTaken" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" "Subject" NOT NULL,
    "grade" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileKey" TEXT,
    "createdBy" INTEGER NOT NULL,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "status" "ExerciseStatus" NOT NULL DEFAULT 'DRAFT',
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_attachments" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_submissions" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "submissionUrl" JSONB NOT NULL DEFAULT '{}',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "gradedBy" INTEGER,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "exercise_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "grade" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedBy" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_tests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" "IeltsLevel" NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "ielts_reading_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_sections" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "passageText" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_reading_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_questions" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "type" "IeltsReadingQuestionType" NOT NULL,
    "subQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_reading_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_submissions" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "detailedScores" JSONB NOT NULL DEFAULT '{}',
    "feedback" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "ielts_reading_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_answers" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswer" TEXT NOT NULL DEFAULT '',
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ielts_reading_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_writing_tests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "IeltsWritingType" NOT NULL,
    "level" "IeltsLevel" NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_writing_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_writing_submissions" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "aiScore" JSONB,
    "aiFeedback" JSONB,
    "humanScore" JSONB,
    "humanFeedback" JSONB,
    "aiGeneralScore" DOUBLE PRECISION,
    "humanGeneralScore" DOUBLE PRECISION,

    CONSTRAINT "ielts_writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_submissions_quizId_userId_attemptNumber_key" ON "quiz_submissions"("quizId", "userId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_writing_submissions_testId_userId_key" ON "ielts_writing_submissions"("testId", "userId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "quiz_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attachments" ADD CONSTRAINT "exercise_attachments_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_submissions" ADD CONSTRAINT "exercise_submissions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_submissions" ADD CONSTRAINT "exercise_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_tests" ADD CONSTRAINT "ielts_reading_tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_sections" ADD CONSTRAINT "ielts_reading_sections_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ielts_reading_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_questions" ADD CONSTRAINT "ielts_reading_questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ielts_reading_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_submissions" ADD CONSTRAINT "ielts_reading_submissions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ielts_reading_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_submissions" ADD CONSTRAINT "ielts_reading_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_answers" ADD CONSTRAINT "ielts_reading_answers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ielts_reading_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_answers" ADD CONSTRAINT "ielts_reading_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ielts_reading_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_tests" ADD CONSTRAINT "ielts_writing_tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_submissions" ADD CONSTRAINT "ielts_writing_submissions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ielts_writing_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_submissions" ADD CONSTRAINT "ielts_writing_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
