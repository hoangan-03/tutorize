/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useMemo } from "react";
import {
  ieltsService,
  IeltsTest,
  IeltsSkill,
  IeltsSubmission,
  IeltsLevel,
} from "../../services/ieltsService";
import { useAuth } from "../../hooks/useAuth";
import { IeltsTestForm } from "./IeltsTestForm";
import { IeltsTestPlayer } from "./IeltsTestPlayer";
import { IeltsTestResult } from "./IeltsTestResult";
import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
  BarChart3,
  Calendar,
  Clock,
  Mic,
  Book,
  PenSquare,
  Headphones,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SKILLS: { name: IeltsSkill; label: string }[] = [
  { name: "READING", label: "Reading" },
  { name: "LISTENING", label: "Listening" },
  { name: "WRITING", label: "Writing" },
  { name: "SPEAKING", label: "Speaking" },
];

const StudentIeltsView: React.FC<{
  tests: IeltsTest[];
  submissions: IeltsSubmission[];
  loading: boolean;
  onStartTest: (id: number) => void;
  onViewResult: (id: number) => void;
}> = ({ tests, submissions, loading, onStartTest, onViewResult }) => {
  const [activeSkill, setActiveSkill] = useState<IeltsSkill>("READING");

  const filteredTests = useMemo(() => {
    return tests.filter((resource) => resource.skill === activeSkill);
  }, [tests, activeSkill]);

  const getHighestScoreSubmission = (testId: number) => {
    const testSubmissions = submissions.filter((s) => s.testId === testId);
    if (testSubmissions.length === 0) return null;
    return testSubmissions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Trung tâm IELTS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Luyện tập các kỹ năng và làm bài thi thử để chuẩn bị cho kỳ thi IELTS.
        </p>

        {/* Skill Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {SKILLS.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => setActiveSkill(skill.name)}
                  className={`${
                    activeSkill === skill.name
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {skill.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Available Tests */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Bài test có sẵn
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">
                Không có bài test nào
              </h3>
              <p className="text-gray-500 mt-1">
                Chưa có bài test nào cho kỹ năng này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((resource) => {
                const highestSubmission = getHighestScoreSubmission(
                  resource.id
                );
                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {resource.description}
                      </p>
                    </div>
                    <div>
                      {highestSubmission ? (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Điểm cao nhất</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {highestSubmission.score.toFixed(1)}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Chưa làm</p>
                          <p className="text-2xl font-bold text-gray-400">-</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onStartTest(resource.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          {highestSubmission ? "Làm lại" : "Bắt đầu"}
                        </button>
                        {highestSubmission && (
                          <button
                            onClick={() => onViewResult(highestSubmission.id)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Xem kết quả
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submission History */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Lịch sử làm bài
          </h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p>Bạn chưa làm bài test nào.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {submissions
                  .sort(
                    (a, b) =>
                      new Date(b.submittedAt).getTime() -
                      new Date(a.submittedAt).getTime()
                  )
                  .map((submission) => (
                    <li
                      key={submission.id}
                      className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="text-start">
                        <h3 className="text-md font-semibold text-gray-800">
                          {submission.test?.title ||
                            `Test ID: ${submission.testId}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Nộp lúc:{" "}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Điểm</p>
                        <p className="text-xl font-bold text-indigo-600">
                          {submission.score.toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={() => onViewResult(submission.id)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        Xem lại
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TeacherIeltsView: React.FC<{
  resources: IeltsTest[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}> = ({ resources, loading, onEdit, onDelete, onCreate }) => {
  const stats = {
    total: resources.length,
    reading: resources.filter((r) => r.skill === "READING").length,
    listening: resources.filter((r) => r.skill === "LISTENING").length,
    writing: resources.filter((r) => r.skill === "WRITING").length,
    speaking: resources.filter((r) => r.skill === "SPEAKING").length,
  };

  const getSkillInfo = (skill: IeltsSkill) => {
    switch (skill) {
      case "READING":
        return { label: "Reading", color: "bg-blue-100 text-blue-800" };
      case "LISTENING":
        return { label: "Listening", color: "bg-purple-100 text-purple-800" };
      case "WRITING":
        return { label: "Writing", color: "bg-orange-100 text-orange-800" };
      case "SPEAKING":
        return { label: "Speaking", color: "bg-teal-100 text-teal-800" };
      default:
        return { label: skill, color: "bg-gray-100 text-gray-800" };
    }
  };

  const getLevelInfo = (level: IeltsLevel) => {
    switch (level) {
      case "BEGINNER":
        return { label: "Beginner", color: "bg-green-100 text-green-800" };
      case "INTERMEDIATE":
        return {
          label: "Intermediate",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "ADVANCED":
        return { label: "Advanced", color: "bg-red-100 text-red-800" };
      default:
        return { label: level, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Quản lý Bài test IELTS
                  </h1>
                </div>
              </div>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl text-start">
                Tạo và quản lý các bài test IELTS cho bốn kỹ năng: Nghe, Nói,
                Đọc, Viết.
              </p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={onCreate}
                  className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span>Tạo Test mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
            bgColor="bg-indigo-100"
            label="Tổng số Test"
            value={stats.total}
          />
          <StatCard
            icon={<Book className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-100"
            label="Tests Đọc"
            value={stats.reading}
          />
          <StatCard
            icon={<Headphones className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-100"
            label="Tests Nghe"
            value={stats.listening}
          />
          <StatCard
            icon={<PenSquare className="h-6 w-6 text-orange-600" />}
            bgColor="bg-orange-100"
            label="Tests Viết"
            value={stats.writing}
          />
          <StatCard
            icon={<Mic className="h-6 w-6 text-teal-600" />}
            bgColor="bg-teal-100"
            label="Tests Nói"
            value={stats.speaking}
          />
        </div>

        {/* Test List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chưa có bài test nào
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Tạo bài test IELTS đầu tiên để bắt đầu.
              </p>
              <button
                onClick={onCreate}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
              >
                Tạo Test mới
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {resources.map((test) => (
                <div
                  key={test.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {test.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            getSkillInfo(test.skill).color
                          }`}
                        >
                          {getSkillInfo(test.skill).label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            getLevelInfo(test.level).color
                          }`}
                        >
                          {getLevelInfo(test.level).label}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed text-start">
                        {test.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {test.timeLimit
                            ? `${test.timeLimit} phút`
                            : "Không giới hạn"}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Tạo ngày:{" "}
                          {new Date(test.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          /* handleViewSubmissions(test) */
                        }}
                        className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                        title="Xem kết quả"
                      >
                        <BarChart3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(test.id)}
                        className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(test.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 ${bgColor} rounded-xl`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export const IeltsCenter: React.FC = () => {
  const { user, isTeacher } = useAuth();
  const [view, setView] = useState<"list" | "form" | "player" | "result">(
    "list"
  );
  const [resources, setResources] = useState<IeltsTest[]>([]);
  const [submissions, setSubmissions] = useState<IeltsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<number | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    loadIeltsResources();
  }, [user]);

  const loadIeltsResources = async () => {
    setLoading(true);
    try {
      if (user?.role === "TEACHER") {
        const fetchedResources = await ieltsService.getTests({ limit: 100 });
        setResources(fetchedResources.data);
      } else if (user?.role === "STUDENT") {
        const fetchedResources = await ieltsService.getTests({});
        setResources(fetchedResources.data);
        const fetchedSubmissions = await ieltsService.getMySubmissions();
        setSubmissions(fetchedSubmissions);
      } else {
        const fetchedResources = await ieltsService.getTests({});
        const publicResources = fetchedResources.data.filter(
          (test: IeltsTest & { isPublic?: boolean }) => test.isPublic
        );
        setResources(publicResources);
      }
    } catch (error) {
      console.error("Failed to load IELTS resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentTestId(null);
    setView("form");
  };

  const handleEdit = (id: number) => {
    setCurrentTestId(id);
    setView("form");
  };

  const handleStartTest = (testId: number) => {
    navigate(`/ielts-test/${testId}/play`);
  };

  const handleViewResult = (submissionId: number) => {
    setCurrentSubmissionId(submissionId);
    setView("result");
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài test này không?")) {
      try {
        await ieltsService.deleteTest(id);
        loadIeltsResources();
      } catch (error) {
        console.error("Failed to delete IELTS test:", error);
      }
    }
  };

  const handleBack = () => {
    setView("list");
    setCurrentTestId(null);
    setCurrentSubmissionId(null);
    loadIeltsResources();
  };

  if (view === "form") {
    return <IeltsTestForm testId={currentTestId} onBack={handleBack} />;
  }

  if (view === "player" && currentTestId) {
    return <IeltsTestPlayer testId={currentTestId} onBack={handleBack} />;
  }

  if (view === "result" && currentSubmissionId) {
    return (
      <IeltsTestResult submissionId={currentSubmissionId} onBack={handleBack} />
    );
  }

  if (user?.role === "TEACHER") {
    return (
      <TeacherIeltsView
        resources={resources}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <StudentIeltsView
        tests={resources}
        submissions={submissions}
        loading={loading}
        onStartTest={handleStartTest}
        onViewResult={handleViewResult}
      />
    </div>
  );
};
