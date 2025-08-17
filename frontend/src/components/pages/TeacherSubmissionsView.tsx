import React, { useState } from "react";
import {
  User,
  FileText,
  Star,
  Eye,
  Edit3,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Exercise,
  ExerciseSubmission,
  SubmissionStatus,
} from "../../types/api";
import {
  useExerciseSubmissionsList,
  useExerciseSubmissions,
} from "../../hooks";

interface TeacherSubmissionsViewProps {
  exercise: Exercise;
  onBack: () => void;
}

export const TeacherSubmissionsView: React.FC<TeacherSubmissionsViewProps> = ({
  exercise,
  onBack,
}) => {
  const { t } = useTranslation();
  const { submissions, isLoading, mutate } = useExerciseSubmissionsList(
    exercise.id!
  );
  const { gradeSubmission } = useExerciseSubmissions();
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(
    null
  );
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );

  const handleGradeSubmission = async (submissionId: number) => {
    const success = await gradeSubmission(
      submissionId,
      gradeScore,
      gradeFeedback
    );
    if (success) {
      setGradingSubmission(null);
      setGradeScore(0);
      setGradeFeedback("");
      mutate(); // Refresh submissions data
    }
  };

  const startGrading = (submission: ExerciseSubmission) => {
    setGradingSubmission(submission.id);
    setGradeScore(submission.score || 0);
    setGradeFeedback(submission.feedback || "");
  };

  const cancelGrading = () => {
    setGradingSubmission(null);
    setGradeScore(0);
    setGradeFeedback("");
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.SUBMITTED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            {t("teacherSubmissionsView.waitingForGrading")}
          </span>
        );
      case SubmissionStatus.GRADED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("teacherSubmissionsView.graded")}
          </span>
        );
      case SubmissionStatus.LATE:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t("teacherSubmissionsView.lateSubmission")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const filteredSubmissions = submissions.filter((submission) =>
    filterStatus === "ALL" ? true : submission.status === filterStatus
  );

  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.status === SubmissionStatus.GRADED)
      .length,
    pending: submissions.filter((s) => s.status === "SUBMITTED").length,
    late: submissions.filter((s) => s.status === "LATE").length,
    averageScore:
      submissions
        .filter((s) => s.score !== null)
        .reduce((sum, s) => sum + (s.score || 0), 0) /
        submissions.filter((s) => s.score !== null).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={onBack}
                className="mb-4 text-white/80 hover:text-white flex items-center"
              >
                ← {t("teacherSubmissionsView.back")}
              </button>
              <h1 className="text-base md:text-xl lg:text-3xl font-bold text-white mb-2">
                {t("teacherSubmissionsView.submissionsFor")} {exercise.name}
              </h1>
              <p className="text-white/90 text-lg">
                {t("teacherSubmissionsView.manageAndGrade")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("teacherSubmissionsView.totalSubmissions")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("teacherSubmissionsView.graded")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.graded}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("teacherSubmissionsView.pending")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("teacherSubmissionsView.late")}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("teacherSubmissionsView.averageScore")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              {t("teacherSubmissionsView.filterByStatus")}
            </label>
            <select
              title={t("teacherSubmissionsView.filterByStatus")}
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as SubmissionStatus | "ALL")
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">{t("teacherSubmissionsView.all")}</option>
              <option value="SUBMITTED">
                {t("teacherSubmissionsView.pending")}
              </option>
              <option value={SubmissionStatus.GRADED}>
                {t("teacherSubmissionsView.graded")}
              </option>
              <option value="LATE">{t("teacherSubmissionsView.late")}</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("teacherSubmissionsView.noSubmissions")}
              </h3>
              <p className="text-gray-600">
                {t("teacherSubmissionsView.noSubmissionsForFilter")}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("teacherSubmissionsView.student")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("teacherSubmissionsView.submittedAt")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("teacherSubmissionsView.status")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("teacherSubmissionsView.score")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("teacherSubmissionsView.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <React.Fragment key={submission.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {/* Placeholder for avatar */}
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.user?.profile?.lastName +
                                  " " +
                                  submission.user?.profile?.firstName ||
                                  "Unknown Student"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.score === null
                            ? "N/A"
                            : `${submission.score}/${exercise.maxScore}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="flex items-center text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                /* TODO: Implement view details modal */
                              }}
                              title={t("teacherSubmissionsView.viewSubmission")}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t("teacherSubmissionsView.viewSubmission")}
                            </button>
                            {gradingSubmission === submission.id ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <input
                                    title={t("teacherSubmissionsView.score")}
                                    type="number"
                                    value={gradeScore}
                                    onChange={(e) =>
                                      setGradeScore(parseFloat(e.target.value))
                                    }
                                    className="w-20 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  />
                                  <button
                                    onClick={() =>
                                      handleGradeSubmission(submission.id)
                                    }
                                    className="p-2 text-green-600 hover:text-green-800"
                                    title={t(
                                      "teacherSubmissionsView.saveGrade"
                                    )}
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelGrading}
                                    className="p-2 text-red-600 hover:text-red-800"
                                    title={t("teacherSubmissionsView.cancel")}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="flex items-center text-green-600 hover:text-green-800"
                                onClick={() => startGrading(submission)}
                                title={
                                  submission.score === null
                                    ? t("teacherSubmissionsView.grade")
                                    : t("teacherSubmissionsView.editGrade")
                                }
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                {submission.score === null
                                  ? t("teacherSubmissionsView.grade")
                                  : t("teacherSubmissionsView.editGrade")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {gradingSubmission === submission.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("teacherSubmissionsView.feedback")}
                              </label>
                              <textarea
                                value={gradeFeedback}
                                onChange={(e) =>
                                  setGradeFeedback(e.target.value)
                                }
                                placeholder={t(
                                  "teacherSubmissionsView.feedbackPlaceholder"
                                )}
                                className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
