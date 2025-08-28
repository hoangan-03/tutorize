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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuizSubmission } from "../hooks";

interface AnswerDetail {
  id: number;
  isCorrect: boolean;
  userAnswer: string;
  question?: {
    question: string;
    type: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    points: number;
    imageUrls?: string[];
  };
}

export const QuizSubmissionsTeacherView: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const parsedSubmissionId = submissionId ? parseInt(submissionId) : null;

  const { submission, isLoading, error } =
    useQuizSubmission(parsedSubmissionId);

  const handleBack = () => {
    // Navigate back to quiz dashboard - we need the quiz ID from submission
    if (submission?.quiz?.id) {
      navigate(`/quiz/dashboard/${submission.quiz.id}`);
    } else {
      navigate("/quiz-dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("quizzes.submission.notFound")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("quizzes.submission.notFoundDesc")}
          </p>
          <button
            onClick={handleBack}
            className="flex items-center px-3 py-2 text-sm rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2 mt-1" />
            {t("common.goBack")}
          </button>
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

  return (
    <div className="mx-auto p-6 lg:px-16 xl:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t("common.goBack")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col text-start">
            <p className="text-gray-600">
              {submission.quiz?.title || t("quizzes.submission.quizTitle")}
            </p>
          </div>
        </div>
      </div>

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
              <p className="text-gray-400 text-sm mt-2">
                This submission appears to have no saved answers. This could
                happen if:
              </p>
              <ul className="text-gray-400 text-sm mt-2 list-disc list-inside">
                <li>The quiz was submitted without answering questions</li>
                <li>The answers were not properly saved during submission</li>
                <li>There was a database issue during submission</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-6">
              {submission.answers?.map(
                (answer: AnswerDetail, index: number) => (
                  <div
                    key={answer.id}
                    className={`border rounded-lg p-6 ${
                      answer.isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        {t("quizzes.question")} {index + 1}
                      </h4>
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
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-2">
                        <strong>{t("quizzes.submission.question")}:</strong>{" "}
                        {answer.question?.question}
                      </p>

                      {/* Question Images */}
                      {answer.question?.imageUrls &&
                        answer.question.imageUrls.length > 0 && (
                          <div className="mt-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Hình ảnh đính kèm:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {answer.question.imageUrls.map(
                                (imageUrl, imageIndex) => (
                                  <div
                                    key={imageIndex}
                                    className="relative group"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Question image ${imageIndex + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() =>
                                        window.open(imageUrl, "_blank")
                                      }
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                      {imageIndex + 1}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("quizzes.submission.studentAnswer")}:
                        </p>
                        <div
                          className={`p-3 rounded-lg ${
                            answer.isCorrect ? "bg-green-100" : "bg-red-100"
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

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("quizzes.submission.correctAnswer")}:
                        </p>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm">
                            {formatMultipleChoiceAnswer(
                              answer.question?.correctAnswer || "",
                              answer.question?.options || [],
                              answer.question?.type || ""
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {answer.question?.explanation && (
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
                        {answer.isCorrect ? answer.question?.points || 1 : 0} /{" "}
                        {answer.question?.points || 1}
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
