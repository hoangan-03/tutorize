import React, { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Star,
  Edit3,
  Trash2,
  Eye,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../hooks";
import {
  ExerciseSubmission,
  Exercise,
  SubmissionStatus,
} from "../../types/api";
import { formatDate, formatDateTime } from "../utils";

interface StudentSubmissionViewProps {
  submission: ExerciseSubmission;
  exercise: Exercise;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = ({
  submission,
  exercise,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { showConfirm } = useModal();
  const [showImages, setShowImages] = useState(false);

  // Parse image links from submission URL
  const getImageLinks = (): string[] => {
    try {
      return JSON.parse(submission.submissionUrl as unknown as string) || [];
    } catch {
      return [];
    }
  };

  const imageLinks = getImageLinks();

  // Handle delete with confirmation modal
  const handleDeleteWithConfirmation = () => {
    if (onDelete) {
      showConfirm(
        t("submissions.confirmDeleteMessage") ||
          "Bạn có chắc chắn muốn xóa bài nộp này? Hành động này không thể hoàn tác.",
        onDelete,
        {
          title: t("submissions.confirmDelete") || "Xác nhận xóa",
          confirmText: t("common.delete") || "Xóa",
          cancelText: t("common.cancel") || "Hủy",
        }
      );
    }
  };

  const getStatusBadge = () => {
    switch (submission.status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4 mr-1" />
            {t("submissions.waitingForGrade")}
          </span>
        );
      case SubmissionStatus.GRADED:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            {t("submissions.graded")}
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            {t("submissions.lateSubmission")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            {t("common.back")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("submissions.submissionDetails")}
          </h1>
          <p className="text-gray-600">{exercise.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("submissions.overview")}
                </h2>
                {getStatusBadge()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("submissions.submittedAt")}
                    </p>
                    <p className="font-medium">
                      {formatDateTime(submission.submittedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("submissions.version")}
                    </p>
                    <p className="font-medium">v{submission.version}</p>
                  </div>
                </div>

                {submission.gradedAt && (
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {t("submissions.gradedAt")}
                      </p>
                      <p className="font-medium">
                        {formatDateTime(submission.gradedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {submission.score !== null &&
                  submission.score !== undefined && (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {t("submissions.score")}
                        </p>
                        <p className="font-medium text-lg">
                          {submission.score}/{exercise.maxScore || 10}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Submitted Images */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  {t("submissions.submittedImages")} ({imageLinks.length})
                </h2>
                {imageLinks.length > 0 && (
                  <button
                    onClick={() => setShowImages(!showImages)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showImages ? t("common.hide") : t("common.show")}
                  </button>
                )}
              </div>

              {imageLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("submissions.noImages")}</p>
                </div>
              ) : (
                <>
                  {showImages && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imageLinks.map((link, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <img
                            src={link}
                            alt={`Submission ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.jpg";
                            }}
                          />
                          <div className="p-3 bg-gray-50">
                            <p className="text-sm text-gray-600">
                              {t("submissions.image")} {index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Teacher Feedback */}
            {submission.feedback && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t("submissions.teacherFeedback")}
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-800 leading-relaxed">
                    {submission.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercise Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t("exercises.exerciseInfo")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("exercises.subject")}
                  </p>
                  <p className="font-medium">{exercise.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("exercises.grade")}
                  </p>
                  <p className="font-medium">{exercise.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("exercises.deadline")}
                  </p>
                  <p className="font-medium">{formatDate(exercise.deadline)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("exercises.maxScore")}
                  </p>
                  <p className="font-medium">{exercise.maxScore || 10}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {submission.status !== SubmissionStatus.GRADED && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {t("common.actions")}
                </h3>
                <div className="space-y-3">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {t("submissions.editSubmission")}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDeleteWithConfirmation}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("submissions.deleteSubmission")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Grading History */}
            {submission.status === SubmissionStatus.GRADED && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {t("submissions.gradingHistory")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("submissions.finalScore")}
                    </span>
                    <span className="font-bold text-lg text-green-600">
                      {submission.score}/{exercise.maxScore || 10}
                    </span>
                  </div>
                  {submission.gradedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {t("submissions.gradedOn")}
                      </span>
                      <span className="text-sm">
                        {formatDateTime(submission.gradedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
