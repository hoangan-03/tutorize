import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  User,
  BookOpen,
  Filter,
  Search,
} from "lucide-react";
import {
  useMyExerciseSubmissions,
  useAllExerciseSubmissions,
} from "../../hooks";
import { SubmissionStatus } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";
import { formatDateTime } from "../utils";

export const SubmissionsList: React.FC = () => {
  const { isTeacher } = useAuth();
  const [filter, setFilter] = useState<"all" | "submitted" | "graded">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Use appropriate hook based on user role
  const params = { page: 1, limit: 100 };
  const { submissions: mySubmissions, isLoading: myLoading } =
    useMyExerciseSubmissions(!isTeacher ? params : undefined);

  const { submissions: allSubmissions, isLoading: allLoading } =
    useAllExerciseSubmissions(isTeacher ? params : undefined);

  const submissions = isTeacher ? allSubmissions : mySubmissions;
  const loading = isTeacher ? allLoading : myLoading;

  const getStatusBadge = (status: SubmissionStatus, score?: number | null) => {
    if (status === SubmissionStatus.GRADED) {
      const variant = "status" as const;
      const className =
        score && score >= 5
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
      return (
        <Badge variant={variant} className={className}>
          Đã chấm điểm
        </Badge>
      );
    }
    if (status === "SUBMITTED") {
      return (
        <Badge variant="status" className="bg-blue-100 text-blue-800">
          Chờ chấm điểm
        </Badge>
      );
    }
    return (
      <Badge variant="status" className="bg-gray-100 text-gray-800">
        {status}
      </Badge>
    );
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return "Chưa chấm";

    const color =
      score >= 8
        ? "text-green-600"
        : score >= 6
        ? "text-yellow-600"
        : score >= 4
        ? "text-orange-600"
        : "text-red-600";

    return <span className={`font-bold ${color}`}>{score}/10</span>;
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "submitted" && submission.status === "SUBMITTED") ||
      (filter === "graded" && submission.status === SubmissionStatus.GRADED);

    const matchesSearch =
      !searchTerm ||
      submission.exercise?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isTeacher ? "Quản lý bài nộp" : "Bài nộp của tôi"}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="submitted">Chờ chấm điểm</option>
            <option value="graded">Đã chấm điểm</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Không có bài nộp nào
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "Chưa có bài nộp nào được tìm thấy"
              : `Không có bài nộp nào ở trạng thái ${
                  filter === "submitted" ? "chờ chấm điểm" : "đã chấm điểm"
                }`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={
                        isTeacher
                          ? `/teacher/submissions/${submission.id}`
                          : `/submissions/${submission.id}`
                      }
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {submission.exercise?.name}
                    </Link>
                    {getStatusBadge(submission.status, submission.score)}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {isTeacher && submission.user && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {submission.user.profile?.firstName}{" "}
                          {submission.user.profile?.lastName}(
                          {submission.user.email})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Nộp lúc: {formatDateTime(submission.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Nhận xét:
                      </div>
                      <div className="text-sm text-gray-600">
                        {submission.feedback}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">
                    {getScoreDisplay(submission.score ?? null)}
                  </div>
                  {submission.status === SubmissionStatus.GRADED &&
                    submission.gradedAt && (
                      <div className="text-xs text-gray-500">
                        Chấm lúc: {formatDateTime(submission.gradedAt)}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Tổng bài nộp</h4>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {submissions.length}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Chờ chấm điểm</h4>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {submissions.filter((s) => s.status === "SUBMITTED").length}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Đã chấm điểm</h4>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {
              submissions.filter((s) => s.status === SubmissionStatus.GRADED)
                .length
            }
          </div>
        </div>
      </div>
    </div>
  );
};
