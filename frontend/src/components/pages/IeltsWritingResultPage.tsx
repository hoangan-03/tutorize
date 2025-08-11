import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, Award, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import { useIeltsWritingMySubmission } from "@/hooks/useIeltsWriting";

export const IeltsWritingResultPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { submission } = useIeltsWritingMySubmission(
    parseInt(submissionId || "1")
  );

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("ieltsWriting.result.notFound")}
          </h2>
          <button
            onClick={() => navigate("/ielts")}
            className="text-blue-600 hover:text-blue-500"
          >
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  const getScoreColor = (score: number | undefined, maxScore: number = 9) => {
    if (!score) return "text-gray-500";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBandScore = (score: number | undefined) => {
    if (!score) return "N/A";
    // Convert to IELTS band score (0-9 scale)
    return Math.round(score * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ielts")}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.backToIelts")}
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("ieltsWriting.result.title")}
                </h1>
                <p className="text-gray-600 mb-4">
                  {submission.task?.title || t("ieltsWriting.result.untitled")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {t("ieltsWriting.result.submittedOn")}:{" "}
                      {formatDate(submission.submittedAt)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>
                      {t("ieltsWriting.result.timeSubmitted")}:{" "}
                      {formatTime(submission.submittedAt)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-600" />
                    <span
                      className={`font-semibold ${getScoreColor(
                        submission.score
                      )}`}
                    >
                      {t("ieltsWriting.result.bandScore")}:{" "}
                      {getBandScore(submission.score)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <Badge
                  variant={submission.isGraded ? "grade" : "status"}
                  className="text-sm"
                >
                  {submission.isGraded
                    ? t("ieltsWriting.result.graded")
                    : t("ieltsWriting.result.pending")}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Essay Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("ieltsWriting.result.yourEssay")}
          </h2>

          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("ieltsWriting.result.prompt")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {submission.task?.prompt || t("ieltsWriting.result.noPrompt")}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t("ieltsWriting.result.yourResponse")}
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {submission.content || t("ieltsWriting.result.noContent")}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                {t("ieltsWriting.result.wordCount")}:{" "}
                {submission.content?.split(/\s+/).length || 0}{" "}
                {t("ieltsWriting.result.words")}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback and Scoring */}
        {submission.isGraded && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("ieltsWriting.result.feedback")}
            </h2>

            {/* AI Feedback */}
            {submission.aiFeedback && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                  {t("ieltsWriting.result.aiFeedback")}
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed">
                    {submission.aiFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Feedback */}
            {submission.teacherFeedback && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  {t("ieltsWriting.result.teacherFeedback")}
                </h3>
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-gray-700 leading-relaxed">
                    {submission.teacherFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Scoring */}
            {submission.detailedScore && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t("ieltsWriting.result.detailedScoring")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(submission.detailedScore).map(
                    ([criterion, score]) => (
                      <div
                        key={criterion}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {criterion.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span
                            className={`font-semibold ${getScoreColor(
                              score as number
                            )}`}
                          >
                            {getBandScore(score as number)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/ielts")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("ieltsWriting.result.backToTests")}
          </button>
        </div>
      </div>
    </div>
  );
};
