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

  // const getSubmissionsForTest = (testId: number) => {
  //   return submissions.filter((s) => s.testId === testId);
  // };

  const getHighestScoreSubmission = (testId: number) => {
    const testSubmissions = submissions.filter((s) => s.testId === testId);
    if (testSubmissions.length === 0) return null;
    return testSubmissions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">IELTS Center</h1>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {SKILLS.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setActiveSkill(skill.name)}
              className={`${
                activeSkill === skill.name
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap text-start py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {skill.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Các bài test có sẵn
            </h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {filteredTests.map((resource) => {
                  const highestSubmission = getHighestScoreSubmission(
                    resource.id
                  );
                  return (
                    <li key={resource.id} className="py-5">
                      <div className="relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {resource.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {resource.description}
                        </p>
                        {highestSubmission ? (
                          <div className="mt-2 text-sm text-gray-500">
                            Điểm cao nhất:{" "}
                            <span className="font-bold text-indigo-600">
                              {highestSubmission.score.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-gray-500">
                            Chưa làm lần nào.
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <button
                          onClick={() => onStartTest(resource.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          {highestSubmission ? "Làm lại" : "Làm bài"}
                        </button>
                        {highestSubmission && (
                          <button
                            onClick={() => onViewResult(highestSubmission.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Xem kết quả (cao nhất)
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <h3 className="mt-12 text-lg font-medium leading-6 text-gray-900">
              Lịch sử làm bài
            </h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission.id} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {submission.test?.title ||
                          `Test ID: ${submission.testId}`}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Nộp lúc:{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-800">
                        Điểm: {submission.score.toFixed(1)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => onViewResult(submission.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        Xem lại kết quả
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
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
  const { user } = useAuth();
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

  const handleStartTest = (id: number) => {
    setCurrentTestId(id);
    setView("player");
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
