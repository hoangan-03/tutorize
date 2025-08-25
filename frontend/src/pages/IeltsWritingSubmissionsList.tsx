import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Clock,
  Award,
  User,
  ChevronDown,
  Eye,
  Edit,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useIeltsWritingTestSubmissions,
  useIeltsWritingTest,
} from "../hooks/useIeltsWriting";
import { IeltsWritingSubmission, IeltsWritingTest } from "@/types/api";

export const IeltsWritingSubmissionsList: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const submissionsData = useIeltsWritingTestSubmissions(
    parseInt(testId || "0")
  );

  const { submissions, isLoading } = submissionsData;
  console.log("Submissions Data:", submissions);
  const { tasks } = useIeltsWritingTest({ page: 1, limit: 100 });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getBandScore = (score: number | undefined) => {
    if (!score) return "N/A";
    return Math.round(score * 10) / 10;
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return "text-gray-500";
    const percentage = (score / 9) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewSubmission = (submissionId: number) => {
    navigate(`/ielts-writing/${testId}/submission/${submissionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ielts")}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.backToIelts")}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("ieltsWriting.submissions.title")}
          </h1>
          <p className="text-gray-600">
            {t("ieltsWriting.submissions.description")}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("ieltsWriting.submissions.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Test Filter */}
            <div className="relative">
              <select
                title={t("ieltsWriting.submissions.testFilter")}
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">
                  {t("ieltsWriting.submissions.allTests")}
                </option>
                {tasks?.map((test: IeltsWritingTest) => (
                  <option key={test.id} value={test.id.toString()}>
                    {test.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Grade Filter */}
            <div className="relative">
              <select
                title={t("ieltsWriting.submissions.gradeFilter")}
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">
                  {t("ieltsWriting.submissions.allGrades")}
                </option>
                <option value="graded">
                  {t("ieltsWriting.submissions.graded")}
                </option>
                <option value="pending">
                  {t("ieltsWriting.submissions.pending")}
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.student")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.test")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.submittedDate")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.score")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ieltsWriting.submissions.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission: IeltsWritingSubmission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.user?.profile?.firstName}{" "}
                              {submission.user?.profile?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.test?.title ||
                            t("ieltsWriting.submissions.unknownTest")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(submission.submittedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1 text-blue-600" />
                          <span
                            className={`text-sm font-medium ${getScoreColor(
                              submission.humanGeneralScore
                            )}`}
                          >
                            {getBandScore(submission.humanGeneralScore)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewSubmission(submission.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title={t(
                              "ielts.writing.submissions.viewSubmission"
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewSubmission(submission.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                            title={t(
                              "ielts.writing.submissions.gradeSubmission"
                            )}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {t("ieltsWriting.submissions.noSubmissions")}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {submissions && submissions.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("ieltsWriting.submissions.summary")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("ieltsWriting.submissions.totalSubmissions")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    submissions.filter(
                      (s: IeltsWritingSubmission) =>
                        s.aiGeneralScore &&
                        s.humanGeneralScore &&
                        s.aiGeneralScore >= 7 &&
                        s.humanGeneralScore >= 7
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {t("ieltsWriting.submissions.highScores")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
