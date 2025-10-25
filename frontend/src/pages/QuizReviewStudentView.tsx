import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDateTime } from "../components/utils";
import {
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuizSubmissionForReview } from "../hooks";
import { ActionButton, LoadingSpinner } from "../components/ui";

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface AnswerDetail {
  id: number;
  isCorrect: boolean;
  userAnswer: string;
  question?: {
    id: number;
    question: string;
    type: string;
    options: string[];
    correctAnswer?: string; // Only present if quiz allows viewing answers
    explanation?: string; // Only present if quiz allows viewing answers
    points: number;
    order: number;
    imageUrls?: string[];
    audioUrl?: string;
  };
}

interface QuizSubmissionForReview {
  id: number;
  score: number;
  totalPoints: number;
  timeSpent: number;
  submittedAt: string;
  user: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  quiz: {
    id: number;
    title: string;
    subject: string;
    grade: number;
    totalQuestions: number;
    timeLimit: number;
    isAllowedViewAnswerAfterSubmit: boolean;
  };
  answers: AnswerDetail[];
}

export const QuizStudentReview: React.FC = () => {
  const { quizId, submissionId } = useParams<{
    quizId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const parsedQuizId = quizId ? parseInt(quizId) : null;
  const parsedSubmissionId = submissionId ? parseInt(submissionId) : null;

  const { submission, isLoading, error } = useQuizSubmissionForReview(
    parsedQuizId,
    parsedSubmissionId
  ) as {
    submission: QuizSubmissionForReview | undefined;
    isLoading: boolean;
    error: ApiError | null;
  };

  const handleBack = () => {
    // Navigate back to quiz list or quiz detail
    if (parsedQuizId) {
      navigate(`/quiz/${parsedQuizId}`);
    } else {
      navigate("/quizzes");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <LoadingSpinner size="sm" color="border-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("quizzes.submission.loading")}
          </h2>
          <p className="text-gray-600">{t("common.pleaseWait")}</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("quizzes.submission.notFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("quizzes.submission.notFoundDesc")}
          </p>
          <ActionButton
            onClick={handleBack}
            colorTheme="blue"
            hasIcon={true}
            icon={ArrowLeft}
            text={t("common.goBack")}
            size="sm"
          />
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0))
      result += `${remainingSeconds}s`;

    return result.trim();
  };

  // Helper function to format multiple choice answers
  const formatMultipleChoiceAnswer = (
    answerValue: string,
    options: string[],
    questionType: string
  ): string => {
    if (
      questionType !== "MULTIPLE_CHOICE" ||
      !options ||
      options.length === 0
    ) {
      return answerValue;
    }

    // If answerValue is a number (index), convert to letter format
    const answerIndex = parseInt(answerValue);
    if (
      !isNaN(answerIndex) &&
      answerIndex >= 0 &&
      answerIndex < options.length
    ) {
      const letter = String.fromCharCode(65 + answerIndex); // A, B, C, D...
      return `${letter}. ${options[answerIndex]}`;
    }

    // If answerValue is already text, find its index and format it
    const optionIndex = options.findIndex((option) => option === answerValue);
    if (optionIndex !== -1) {
      const letter = String.fromCharCode(65 + optionIndex);
      return `${letter}. ${answerValue}`;
    }

    // Fallback: return as is
    return answerValue;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const canViewAnswers = submission.quiz.isAllowedViewAnswerAfterSubmit;

  return (
    <div className="mx-auto p-6 lg:px-16 xl:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ActionButton
            onClick={handleBack}
            colorTheme="transparent"
            textColor="text-gray-600 hover:text-gray-900"
            hasIcon={true}
            icon={ArrowLeft}
            iconOnly={true}
            size="md"
            title={t("common.goBack")}
            className="mr-4 hover:bg-gray-100"
          />
          <div className="flex flex-col text-start">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("quizzes.review.title")}
            </h1>
            <p className="text-gray-600">
              {submission.quiz?.title || t("quizzes.submission.quizTitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Visibility Notice */}
      {!canViewAnswers && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <EyeOff className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              {t("quizzes.review.answersNotVisible")}
            </p>
          </div>
        </div>
      )}

      {canViewAnswers && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              {t("quizzes.review.answersVisible")}
            </p>
          </div>
        </div>
      )}

      {/* Submission Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-500">
                {t("quizzes.submission.student")}
              </p>
              <p className="font-semibold">
                {submission.user?.profile?.lastName +
                  " " +
                  submission.user?.profile?.firstName || t("common.unknown")}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-500">
                {t("quizzes.submission.score")}
              </p>
              <p
                className={`font-semibold text-lg ${getScoreColor(
                  submission.score,
                  submission.totalPoints
                )}`}
              >
                {submission.score}/{submission.totalPoints}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-500">
                {t("quizzes.submission.timeSpent")}
              </p>
              <p className="font-semibold">
                {formatTime(submission.timeSpent || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-500">
                {t("quizzes.submission.submittedAt")}
              </p>
              <p className="font-semibold">
                {formatDateTime(submission.submittedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Detail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("quizzes.submission.answers")}
          </h3>
        </div>
        <div className="p-6">
          {!submission.answers || submission.answers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {t("quizzes.submission.noAnswersFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {submission.answers?.map(
                (answer: AnswerDetail, index: number) => (
                  <div
                    key={answer.id}
                    className={`border rounded-lg p-6 ${
                      canViewAnswers
                        ? answer.isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        {t("quizzes.question")} {index + 1}
                      </h4>
                      {canViewAnswers && (
                        <div className="flex items-center">
                          {answer.isCorrect ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-1" />
                              <span className="text-sm font-medium">
                                {t("quizzes.submission.correct")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="h-5 w-5 mr-1" />
                              <span className="text-sm font-medium">
                                {t("quizzes.submission.incorrect")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-2">
                        <strong>{t("quizzes.submission.question")}:</strong>{" "}
                        {answer.question?.question}
                      </p>
                    </div>

                    <div
                      className={`grid grid-cols-1 ${
                        canViewAnswers ? "md:grid-cols-2" : ""
                      } gap-4`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("quizzes.submission.yourAnswer")}:
                        </p>
                        <div
                          className={`p-3 rounded-lg ${
                            canViewAnswers
                              ? answer.isCorrect
                                ? "bg-green-100"
                                : "bg-red-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <p className="text-sm">
                            {formatMultipleChoiceAnswer(
                              answer.userAnswer ||
                                t("quizzes.submission.noAnswer"),
                              answer.question?.options || [],
                              answer.question?.type || ""
                            )}
                          </p>
                        </div>
                      </div>

                      {canViewAnswers && answer.question?.correctAnswer && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {t("quizzes.submission.correctAnswer")}:
                          </p>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <p className="text-sm">
                              {formatMultipleChoiceAnswer(
                                answer.question.correctAnswer,
                                answer.question.options || [],
                                answer.question.type || ""
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {canViewAnswers && answer.question?.explanation && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("quizzes.submission.explanation")}:
                        </p>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {answer.question.explanation}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-right">
                      <span className="text-sm text-gray-600">
                        {t("quizzes.submission.points")}:{" "}
                        {canViewAnswers
                          ? `${
                              answer.isCorrect
                                ? answer.question?.points || 1
                                : 0
                            } / ${answer.question?.points || 1}`
                          : `${answer.question?.points || 1} ${t(
                              "quizzes.submission.pointsTotal"
                            )}`}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
