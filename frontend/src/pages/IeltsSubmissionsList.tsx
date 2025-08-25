import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useIeltsReadingAllSubmissions } from "../hooks/useIeltsReading";
import { IeltsSkill, IeltsLevel } from "../types/api";
import { BookOpen, Calendar, User, Eye, BarChart3, Search } from "lucide-react";
import { getBandScoreColor, getLevelInfo } from "../components/utils";

export const IeltsSubmissionsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submissions, isLoading, error } = useIeltsReadingAllSubmissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState<IeltsSkill | "ALL">("ALL");
  const [levelFilter, setLevelFilter] = useState<IeltsLevel | "ALL">("ALL");

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const userName =
        submission.user?.profile?.firstName &&
        submission.user?.profile?.lastName
          ? `${submission.user.profile.firstName} ${submission.user.profile.lastName}`
          : "";

      const matchesSearch =
        searchTerm === "" ||
        (submission.test?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.user?.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === "ALL" || submission.test?.level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [submissions, searchTerm, levelFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-600 mb-4">{t("common.error")}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate("/ielts")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-24">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t("ielts.submissions.title")}
              </h1>
              <p className="text-gray-600 mt-2">
                {t("ielts.submissions.subtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/ielts")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t("common.back")}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("ielts.submissions.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={skillFilter}
              onChange={(e) =>
                setSkillFilter(e.target.value as IeltsSkill | "ALL")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label={t("ielts.submissions.allSkills")}
            >
              <option value="ALL">{t("ielts.submissions.allSkills")}</option>
              <option value="READING">{t("ielts.reading")}</option>
              <option value="LISTENING">{t("ielts.listening")}</option>
              <option value="WRITING">{t("ielts.writing")}</option>
              <option value="SPEAKING">{t("ielts.speaking")}</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) =>
                setLevelFilter(e.target.value as IeltsLevel | "ALL")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label={t("ielts.submissions.allLevels")}
            >
              <option value="ALL">{t("ielts.submissions.allLevels")}</option>
              <option value="BEGINNER">{t("ielts.level.beginner")}</option>
              <option value="INTERMEDIATE">
                {t("ielts.level.intermediate")}
              </option>
              <option value="ADVANCED">{t("ielts.level.advanced")}</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("ielts.submissions.totalSubmissions")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredSubmissions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("ielts.submissions.uniqueStudents")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredSubmissions.map((s) => s.user?.id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("ielts.submissions.averageScore")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredSubmissions.length > 0
                    ? (
                        filteredSubmissions.reduce(
                          (sum, s) => sum + s.score,
                          0
                        ) / filteredSubmissions.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("ielts.submissions.uniqueTests")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    new Set(
                      filteredSubmissions.map((s) => s.test?.id).filter(Boolean)
                    ).size
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("ielts.submissions.submissionsList")}
            </h2>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {t("ielts.submissions.noSubmissions")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.test?.title ||
                            t("ielts.submissions.unknownTest")}
                        </h3>
                        {submission.test?.level && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              getLevelInfo(submission.test.level, t).color
                            }`}
                          >
                            {getLevelInfo(submission.test.level, t).label}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            {submission.user?.profile?.firstName &&
                            submission.user?.profile?.lastName
                              ? `${submission.user.profile.firstName} ${submission.user.profile.lastName}`
                              : submission.user?.email ||
                                t("ielts.submissions.unknownUser")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span
                            className={`font-semibold px-2 py-1 rounded ${getBandScoreColor(
                              submission.score
                            )}`}
                          >
                            {t("ielts.submissions.bandScore")}:{" "}
                            {submission.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/ielts/submission/${submission.id}`)
                      }
                      className="ml-4 p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title={t("ielts.submissions.viewDetails")}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
