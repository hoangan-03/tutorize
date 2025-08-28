import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, Save } from "lucide-react";
import {
  useExerciseSubmission,
  useExerciseSubmissions,
  useModal,
} from "../hooks";
import { SubmissionStatus } from "../types/api";
import { Badge } from "../components/ui";
import { formatDateTime } from "../components/utils";
import { useTranslation } from "react-i18next";

export const TeacherSubmissionView: React.FC = () => {
  const { t } = useTranslation();
  const { submissionId } = useParams<{ submissionId: string }>();

  const {
    submission,
    isLoading: loading,
    mutate,
  } = useExerciseSubmission(submissionId ? parseInt(submissionId) : null);
  const { gradeSubmission } = useExerciseSubmissions();
  const { showSuccess, showError } = useModal();

  const [grading, setGrading] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (submission) {
      if (submission.submissionUrl) {
        try {
          const imageUrls = JSON.parse(
            submission.submissionUrl as unknown as string
          );
          setImages(Array.isArray(imageUrls) ? imageUrls : []);
        } catch {
          setImages([]);
        }
      }
      setScore(submission.score || 0);
      setFeedback(submission.feedback || "");
    }
  }, [submission]);

  const handleGradeSubmission = async () => {
    if (!submission) return;

    try {
      setGrading(true);
      await gradeSubmission(submission.id, score, feedback);
      mutate();
      showSuccess(t("submissions.submissionView.gradingSuccess"), {
        title: t("common.success"),
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      showError(
        t("submissions.submissionView.gradingError"),
        t("common.error")
      );
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const statusMap = {
      [SubmissionStatus.SUBMITTED]: {
        variant: "status" as const,
        className: "bg-blue-100 text-blue-800",
        text: t("submissions.submissionView.statusSubmitted"),
      },
      [SubmissionStatus.GRADED]: {
        variant: "status" as const,
        className: "bg-green-100 text-green-800",
        text: t("submissions.submissionView.statusGraded"),
      },
      [SubmissionStatus.LATE]: {
        variant: "status" as const,
        className: "bg-red-100 text-red-800",
        text: t("submissions.submissionView.statusLate"),
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: "status" as const,
      className: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.text}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return <div className="flex justify-center p-8">{t("common.loading")}</div>;
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        {t("submissions.submissionView.notFound")}
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 lg:px-16 xl:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-4 flex-row">
          <button
            aria-label={t("common.back")}
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold">{submission.exercise?.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(submission.status)}
              <div className="flex items-center gap-1 text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {submission.user?.profile?.lastName}{" "}
                  {submission.user?.profile?.firstName} (
                  {submission.user?.email})
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {t("submissions.submittedAt")}:{" "}
                  {formatDateTime(submission.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Images */}
        <div className="lg:col-span-2">
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`${t("submissions.submissionView.image")} ${
                      index + 1
                    }`}
                    className="w-full h-64 object-contain rounded-lg border bg-gray-50 cursor-pointer"
                    onClick={() => window.open(imageUrl, "_blank")}
                  />
                  <div className="absolute bottom-2 left-2">
                    <Badge
                      variant="status"
                      className="bg-gray-100 text-gray-800"
                    >
                      {t("submissions.submissionView.image")} {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              {t("submissions.submissionView.noImages")}
            </div>
          )}
        </div>

        {/* Grading Panel */}
        <div className="bg-white border rounded-lg p-6 h-fit">
          {/* Current Score Display */}
          {submission.score !== null && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                {t("submissions.submissionView.currentScore")}:
              </div>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  submission.score!
                )}`}
              >
                {submission.score}/10
              </div>
              {submission.gradedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {t("submissions.submissionView.gradedAt")}:{" "}
                  {formatDateTime(submission.gradedAt)}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* Score Input */}
            <div className="flex flex-col text-start">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("submissions.submissionView.score")} (0-10)
              </label>
              <input
                aria-label={t("submissions.submissionView.score")}
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("submissions.submissionView.enterScore")}
              />
            </div>

            {/* Feedback Input */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                {t("submissions.submissionView.feedback")}
              </label>
              <textarea
                aria-label={t("submissions.submissionView.feedback")}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t("submissions.submissionView.enterFeedback")}
              />
            </div>

            {/* Quick Score Buttons */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t("submissions.submissionView.quickScore")}:
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((quickScore) => (
                  <button
                    aria-label={`Điểm ${quickScore}`}
                    key={quickScore}
                    onClick={() => setScore(quickScore)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      score === quickScore
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {quickScore}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              aria-label={t("submissions.submissionView.saveGrade")}
              onClick={handleGradeSubmission}
              disabled={grading}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {grading
                ? t("submissions.submissionView.saving")
                : t("submissions.submissionView.saveGrade")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
