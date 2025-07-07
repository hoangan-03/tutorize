import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  FileText,
  Star,
  MessageSquare,
  Download,
  Eye,
  Edit3,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Exercise,
  ExerciseSubmission,
  SubmissionStatus,
} from "../../types/api";
import { exerciseService } from "../../services/exerciseService";

interface TeacherSubmissionsViewProps {
  exercise: Exercise;
  onBack: () => void;
}

export const TeacherSubmissionsView: React.FC<TeacherSubmissionsViewProps> = ({
  exercise,
  onBack,
}) => {
  const [submissions, setSubmissions] = useState<ExerciseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(
    null
  );
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "ALL">(
    "ALL"
  );

  useEffect(() => {
    loadSubmissions();
  }, [exercise.id]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const result = await exerciseService.getExerciseSubmissions(exercise.id!);
      setSubmissions(result.data);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    try {
      await exerciseService.gradeSubmission(
        submissionId,
        gradeScore,
        gradeFeedback
      );
      setGradingSubmission(null);
      setGradeScore(0);
      setGradeFeedback("");
      await loadSubmissions();
    } catch (error) {
      console.error("Error grading submission:", error);
      alert("Có lỗi khi chấm điểm. Vui lòng thử lại.");
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
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Chờ chấm
          </span>
        );
      case "GRADED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã chấm
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Nộp muộn
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
    graded: submissions.filter((s) => s.status === "GRADED").length,
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
                ← Quay lại
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bài nộp: {exercise.name}
              </h1>
              <p className="text-white/90 text-lg">
                Quản lý và chấm điểm bài nộp của học sinh
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
                  Tổng bài nộp
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
                <p className="text-sm font-medium text-gray-600">Đã chấm</p>
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
                <p className="text-sm font-medium text-gray-600">Chờ chấm</p>
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
                <p className="text-sm font-medium text-gray-600">Nộp muộn</p>
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
                <p className="text-sm font-medium text-gray-600">Điểm TB</p>
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
              Lọc theo trạng thái:
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as SubmissionStatus | "ALL")
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="SUBMITTED">Chờ chấm</option>
              <option value="GRADED">Đã chấm</option>
              <option value="LATE">Nộp muộn</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chưa có bài nộp nào
              </h3>
              <p className="text-gray-600">
                {filterStatus === "ALL"
                  ? "Chưa có học sinh nào nộp bài."
                  : `Không có bài nộp nào với trạng thái "${filterStatus}".`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {submission.user?.name ||
                              `User ${submission.userId}`}
                          </h3>
                        </div>
                        {getStatusBadge(submission.status)}
                        {submission.score !== null && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            <Star className="h-4 w-4 mr-1" />
                            {submission.score}/{exercise.maxScore} điểm
                          </span>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Nội dung bài làm:
                        </h4>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {submission.content}
                        </p>
                      </div>

                      {submission.attachments &&
                        submission.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              File đính kèm:
                            </h4>
                            <div className="space-y-2">
                              {submission.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                  <FileText className="h-5 w-5 text-blue-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900">
                                      {attachment.originalName}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                      {(attachment.size / 1024 / 1024).toFixed(
                                        2
                                      )}{" "}
                                      MB
                                    </p>
                                  </div>
                                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {submission.feedback && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                          <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Phản hồi từ giáo viên:
                          </h4>
                          <p className="text-green-900">
                            {submission.feedback}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Nộp lúc:{" "}
                          {new Date(submission.submittedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                        {submission.gradedAt && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Chấm lúc:{" "}
                            {new Date(submission.gradedAt).toLocaleString(
                              "vi-VN"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {gradingSubmission === submission.id ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 ml-4">
                          <h4 className="text-sm font-medium text-yellow-800 mb-3">
                            Chấm điểm
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Điểm số (/{exercise.maxScore})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={exercise.maxScore}
                                step="0.1"
                                value={gradeScore}
                                onChange={(e) =>
                                  setGradeScore(parseFloat(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phản hồi
                              </label>
                              <textarea
                                value={gradeFeedback}
                                onChange={(e) =>
                                  setGradeFeedback(e.target.value)
                                }
                                placeholder="Nhập phản hồi cho học sinh..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleGradeSubmission(submission.id)
                                }
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Lưu
                              </button>
                              <button
                                onClick={cancelGrading}
                                className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Hủy
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startGrading(submission)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Chấm điểm"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
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
