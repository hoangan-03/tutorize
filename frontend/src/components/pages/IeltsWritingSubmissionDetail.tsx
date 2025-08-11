import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Award,
  User,
  Clock,
  Bot,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  useIeltsWritingTestManagement,
  useIeltsWritingSubmissionForGrading,
} from "../../hooks/useIeltsWriting";
import { useModal } from "../../hooks";
import { Badge } from "../ui/Badge";

export const IeltsWritingSubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submission, mutate } = useIeltsWritingSubmissionForGrading(
    parseInt(submissionId || "0")
  );

  const { gradeSubmission } = useIeltsWritingTestManagement();
  const { showSuccess, showError } = useModal();

  const [isGrading, setIsGrading] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [detailedScores, setDetailedScores] = useState({
    taskResponse: 0,
    coherenceCohesion: 0,
    lexicalResource: 0,
    grammaticalRange: 0,
  });

  const isTeacher = user?.role === "TEACHER";

  React.useEffect(() => {
    if (submission) {
      setTeacherFeedback(submission.teacherFeedback || "");
      if (submission.detailedScore) {
        setDetailedScores({
          taskResponse: submission.detailedScore.taskResponse || 0,
          coherenceCohesion: submission.detailedScore.coherenceCohesion || 0,
          lexicalResource: submission.detailedScore.lexicalResource || 0,
          grammaticalRange: submission.detailedScore.grammaticalRange || 0,
        });
      }
    }
  }, [submission]);

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("common.accessDenied")}
          </h2>
          <button
            onClick={() => navigate("/ielts-writing/submissions")}
            className="text-blue-600 hover:text-blue-500"
          >
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("ieltsWriting.submission.notFound")}
          </h2>
          <button
            onClick={() => navigate("/ielts-writing/submissions")}
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

  const getBandScore = (score: number) => {
    return Math.round(score * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    const percentage = (score / 9) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSubmitGrade = async () => {
    try {
      setIsGrading(true);

      // Calculate overall score from detailed scores
      const overallScore =
        (detailedScores.taskResponse +
          detailedScores.coherenceCohesion +
          detailedScores.lexicalResource +
          detailedScores.grammaticalRange) /
        4;

      await gradeSubmission(submission.id, {
        score: {
          overallScore: overallScore,
          taskResponse: detailedScores.taskResponse,
          coherenceCohesion: detailedScores.coherenceCohesion,
          lexicalResource: detailedScores.lexicalResource,
          grammaticalRange: detailedScores.grammaticalRange,
        },
        feedback: {
          teacherFeedback: teacherFeedback,
        },
      });

      await mutate();

      showSuccess(t("ieltsWriting.submission.gradeSuccess"), {
        title: t("common.success"),
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      showError(t("ieltsWriting.submission.gradeError"));
    } finally {
      setIsGrading(false);
    }
  };

  const averageScore =
    (detailedScores.taskResponse +
      detailedScores.coherenceCohesion +
      detailedScores.lexicalResource +
      detailedScores.grammaticalRange) /
    4;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ielts-writing/submissions")}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("ieltsWriting.submission.backToSubmissions")}
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("ieltsWriting.submission.title")}
                </h1>
                <p className="text-gray-600 mb-4">
                  {submission.task?.title ||
                    t("ieltsWriting.submission.untitled")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      {submission.student?.firstName}{" "}
                      {submission.student?.lastName}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(submission.submittedAt)} at{" "}
                      {formatTime(submission.submittedAt)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-blue-600" />
                    <span
                      className={`font-semibold ${getScoreColor(
                        submission.score || 0
                      )}`}
                    >
                      {t("ieltsWriting.submission.currentScore")}:{" "}
                      {getBandScore(submission.score || 0)}
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
                    ? t("ieltsWriting.submission.graded")
                    : t("ieltsWriting.submission.pending")}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Essay Content */}
          <div className="space-y-6">
            {/* Task Prompt */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("ieltsWriting.submission.taskPrompt")}
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">
                  {submission.task?.prompt ||
                    t("ieltsWriting.submission.noPrompt")}
                </p>
              </div>
            </div>

            {/* Student Essay */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("ieltsWriting.submission.studentResponse")}
                </h2>
                <div className="text-sm text-gray-500">
                  {t("ieltsWriting.submission.wordCount")}:{" "}
                  {submission.content?.split(/\s+/).length || 0}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {submission.content || t("ieltsWriting.submission.noContent")}
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            {submission.aiFeedback && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  {t("ieltsWriting.submission.aiFeedback")}
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed">
                    {submission.aiFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Grading Interface */}
          <div className="space-y-6">
            {/* Detailed Scoring */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                {t("ieltsWriting.submission.detailedScoring")}
              </h2>

              <div className="space-y-4">
                {Object.entries(detailedScores).map(([criterion, score]) => (
                  <div key={criterion} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {t(`ieltsWriting.criteria.${criterion}`)}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        title={t(`ieltsWriting.criteria.${criterion}`)}
                        type="range"
                        min="0"
                        max="9"
                        step="0.5"
                        value={score}
                        onChange={(e) =>
                          setDetailedScores((prev) => ({
                            ...prev,
                            [criterion]: parseFloat(e.target.value),
                          }))
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="w-16 text-center">
                        <span
                          className={`font-semibold ${getScoreColor(score)}`}
                        >
                          {getBandScore(score)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">
                      {t("ieltsWriting.submission.overallScore")}:
                    </span>
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        averageScore
                      )}`}
                    >
                      {getBandScore(averageScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Feedback */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("ieltsWriting.submission.teacherFeedback")}
              </h2>

              <textarea
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder={t("ieltsWriting.submission.feedbackPlaceholder")}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />

              <div className="mt-4 text-sm text-gray-500">
                {t("ieltsWriting.submission.feedbackHint")}
              </div>
            </div>

            {/* Submit Grade Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleSubmitGrade}
                disabled={isGrading || !teacherFeedback.trim()}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("ieltsWriting.submission.submittingGrade")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("ieltsWriting.submission.submitGrade")}
                  </>
                )}
              </button>

              {!teacherFeedback.trim() && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  {t("ieltsWriting.submission.feedbackRequired")}
                </p>
              )}
            </div>

            {/* Previous Feedback */}
            {submission.isGraded && submission.teacherFeedback && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("ieltsWriting.submission.previousFeedback")}
                </h2>
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-gray-700 leading-relaxed">
                    {submission.teacherFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
