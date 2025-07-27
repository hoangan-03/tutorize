/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Users,
  Clock,
  BarChart3,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDetailedQuizStats } from "../../hooks/useQuiz";

interface QuizDashboardProps {
  quiz: any;
  onBack: () => void;
}

// Helper function to format time from seconds to human readable format
const formatTime = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0s";

  // Round to nearest second to avoid decimal places
  const roundedSeconds = Math.round(seconds);

  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;

  let result = "";

  if (hours > 0) {
    result += `${hours}hr`;
  }

  if (minutes > 0) {
    result += `${minutes}min`;
  }

  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
    result += `${remainingSeconds}s`;
  }

  return result;
};

export const QuizDashboard: React.FC<QuizDashboardProps> = ({
  quiz,
  onBack,
}) => {
  const { t } = useTranslation();
  const { stats, isLoading: loading } = useDetailedQuizStats(quiz?.id);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "questions"
  >("overview");

  const exportResults = () => {
    if (!stats?.submissions) return;

    const csvContent = [
      [
        t("quizzes.dashboard.student"),
        t("quizzes.dashboard.score"),
        t("quizzes.dashboard.time"),
        t("quizzes.dashboard.submittedAt"),
        t("quizzes.dashboard.status"),
      ],
      ...stats.submissions.map((submission: any) => [
        submission.user?.name || "Không xác định",
        submission.score.toString(),
        formatTime(submission.timeSpent || 0),
        new Date(submission.submittedAt).toLocaleString("vi-VN"),
        submission.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `quiz_results_${quiz.title}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-8xl mx-auto">
        <div className="text-center py-16">
          <p className="text-gray-600">
            {t("quizzes.dashboard.cannotLoadStats")}
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("quizzes.dashboard.goBack")}
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSubmissions = stats.submissions.length;
  const averageScore =
    totalSubmissions > 0
      ? stats.submissions.reduce(
          (sum: number, submission: any) => sum + submission.score,
          0
        ) / totalSubmissions
      : 0;
  const averageTime =
    totalSubmissions > 0
      ? stats.submissions.reduce(
          (sum: number, submission: any) => sum + submission.timeSpent,
          0
        ) / totalSubmissions
      : 0;
  const passRate =
    totalSubmissions > 0
      ? (stats.submissions.filter((submission: any) => submission.score >= 5)
          .length /
          totalSubmissions) *
        100
      : 0;

  // Grade distribution
  const gradeDistribution = {
    excellent: stats.submissions.filter(
      (submission: any) => submission.score >= 9
    ).length,
    good: stats.submissions.filter(
      (submission: any) => submission.score >= 7 && submission.score < 9
    ).length,
    average: stats.submissions.filter(
      (submission: any) => submission.score >= 5 && submission.score < 7
    ).length,
    poor: stats.submissions.filter((submission: any) => submission.score < 5)
      .length,
  };

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={exportResults}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          {t("quizzes.dashboard.exportResults")}
        </button>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">
                {t("quizzes.dashboard.timeLimit")}
              </p>
              <p className="font-semibold">
                {quiz.timeLimit} {t("quizzes.minutes")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">
                {t("quizzes.dashboard.deadline")}
              </p>
              <p className="font-semibold">
                {new Date(quiz.deadline).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">
                {t("quizzes.dashboard.totalQuestions")}
              </p>
              <p className="font-semibold">{quiz.totalQuestions}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">
                {t("quizzes.dashboard.status")}
              </p>
              <p className="font-semibold capitalize">{quiz.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("quizzes.dashboard.overview")}
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("quizzes.dashboard.students")}
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "questions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("quizzes.dashboard.questions")}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("quizzes.dashboard.totalSubmissions")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSubmissions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("quizzes.dashboard.averageScore")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(averageScore || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("quizzes.dashboard.averageTime")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(averageTime || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("quizzes.dashboard.passRate")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(passRate || 0).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("quizzes.dashboard.gradeDistribution")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-8 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {gradeDistribution.excellent}
                </p>
                <p className="text-sm text-gray-600">
                  {t("quizzes.dashboard.excellent")}
                </p>
              </div>
              <div className="text-center p-8 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {gradeDistribution.good}
                </p>
                <p className="text-sm text-gray-600">
                  {t("quizzes.dashboard.good")}
                </p>
              </div>
              <div className="text-center p-8 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {gradeDistribution.average}
                </p>
                <p className="text-sm text-gray-600">
                  {t("quizzes.dashboard.average")}
                </p>
              </div>
              <div className="text-center p-8 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {gradeDistribution.poor}
                </p>
                <p className="text-sm text-gray-600">
                  {t("quizzes.dashboard.poor")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("quizzes.dashboard.studentResults")}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("quizzes.dashboard.student")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("quizzes.dashboard.score")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("quizzes.dashboard.time")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("quizzes.dashboard.submittedAt")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("quizzes.dashboard.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.submissions.map((submission: any) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.user?.name || "Không xác định"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold">
                          {submission.score}
                        </span>
                        <span className="text-gray-500">
                          /{submission.totalPoints}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(submission.timeSpent || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.score >= 5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("quizzes.dashboard.passed")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t("quizzes.dashboard.failed")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("quizzes.dashboard.questionAnalysis")}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {stats.questionAnalysis?.map(
                (questionStat: any, index: number) => (
                  <div
                    key={questionStat.id}
                    className="border border-gray-200 rounded-lg p-8"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        {t("quizzes.question")} {index + 1}
                      </h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {t("quizzes.dashboard.accuracy")}
                        </p>
                        <p className="text-lg font-semibold text-blue-600">
                          {questionStat.accuracy}%
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {questionStat.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-lg font-semibold text-blue-600">
                          {questionStat.totalAnswers}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("quizzes.dashboard.totalAnswers")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-semibold text-green-600">
                          {questionStat.correctAnswers}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("quizzes.dashboard.correctAnswers")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-lg font-semibold text-orange-600">
                          {questionStat.points}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("quizzes.dashboard.points")}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${questionStat.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
