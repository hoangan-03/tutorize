import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  IeltsTest,
  IeltsSkill,
  IeltsSubmission,
  IeltsLevel,
} from "../../types/api";
import {
  useAuth,
  useIeltsTests,
  useIeltsSubmissions,
  useIeltsTestManagement,
} from "../../hooks";
import { IeltsTestForm } from "./IeltsTestForm";
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
import { useNavigate } from "react-router-dom";
import { StatCard } from "../ui";

const StudentIeltsView: React.FC<{
  tests: IeltsTest[];
  submissions: IeltsSubmission[];
  loading: boolean;
  onStartTest: (id: number) => void;
  onViewResult: (id: number) => void;
}> = ({ tests, submissions, loading, onStartTest, onViewResult }) => {
  const { t } = useTranslation();
  const [activeSkill, setActiveSkill] = useState<IeltsSkill>(
    IeltsSkill.READING
  );

  const SKILLS: { name: IeltsSkill; label: string }[] = [
    { name: IeltsSkill.READING, label: t("ielts.reading") },
    { name: IeltsSkill.LISTENING, label: t("ielts.listening") },
    { name: IeltsSkill.WRITING, label: t("ielts.writing") },
    { name: IeltsSkill.SPEAKING, label: t("ielts.speaking") },
  ];

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
      <div className="p-4 md:px-12 lg:px-36 md:py-12">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 md:p-12 mb-3 md:mb-8 overflow-hidden shadow-xl h-[70px] md:h-[120px]">
          <div className="absolute top-0 left-0 h-full w-1 bg-white/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between w-full h-full">
            <div> </div>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-white">
              {t("ielts.centerTitle")}
            </h1>

            {/* Decorative IELTS Book/Test Element */}
            <div className="hidden md:block relative">
              <div className="relative">
                {/* Main book/document structure */}
                <div className="flex flex-col space-y-1 transform rotate-12">
                  {/* Book pages stack */}
                  <div className="w-12 h-16 bg-white rounded-r-md border-l-4 border-yellow-400 relative">
                    <div className="absolute top-2 left-2 w-6 h-1 bg-purple-200 rounded"></div>
                    <div className="absolute top-4 left-2 w-4 h-1 bg-purple-200 rounded"></div>
                    <div className="absolute top-6 left-2 w-5 h-1 bg-purple-200 rounded"></div>
                  </div>
                  <div className="w-12 h-16 bg-white/90 rounded-r-md border-l-4 border-blue-400 absolute top-1 left-1 -z-10"></div>
                  <div className="w-12 h-16 bg-white/80 rounded-r-md border-l-4 border-green-400 absolute top-2 left-2 -z-20"></div>
                </div>

                {/* Speaking bubble */}
                <div className="absolute -top-2 -right-3 w-6 h-4 bg-blue-400 rounded-full opacity-80"></div>
                <div className="absolute -top-1 -right-2 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>

                {/* Listening waves */}
                <div className="absolute -bottom-2 -left-2 flex space-x-1">
                  <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-5 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-6 bg-green-400 rounded-full"></div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute -top-4 -right-6 w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="absolute -bottom-3 right-4 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        </div>

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
          {loading ? (
            <p>{t("ielts.loading")}</p>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">
                {t("ielts.noTests")}
              </h3>
              <p className="text-gray-500 mt-1">{t("ielts.noTestsForSkill")}</p>
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
                          <p className="text-sm text-gray-500">
                            {t("ielts.highestScore")}
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {highestSubmission.score.toFixed(1)}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">
                            {t("ielts.notTaken")}
                          </p>
                          <p className="text-2xl font-bold text-gray-400">-</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onStartTest(resource.id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          {highestSubmission
                            ? t("ielts.retake")
                            : t("ielts.start")}
                        </button>
                        {highestSubmission && (
                          <button
                            onClick={() => onViewResult(highestSubmission.id)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            {t("ielts.viewResult")}
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
            {t("ielts.submissionHistory")}
          </h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p>{t("ielts.noSubmissions")}</p>
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
                          {t("ielts.submittedAt")}:{" "}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {t("ielts.score")}
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                          {submission.score.toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={() => onViewResult(submission.id)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        {t("ielts.review")}
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
  const { t } = useTranslation();
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
        return {
          label: t("ielts.reading"),
          color: "bg-blue-100 text-blue-800",
        };
      case "LISTENING":
        return {
          label: t("ielts.listening"),
          color: "bg-purple-100 text-purple-800",
        };
      case "WRITING":
        return {
          label: t("ielts.writing"),
          color: "bg-orange-100 text-orange-800",
        };
      case "SPEAKING":
        return {
          label: t("ielts.speaking"),
          color: "bg-teal-100 text-teal-800",
        };
      default:
        return { label: skill, color: "bg-gray-100 text-gray-800" };
    }
  };

  const getLevelInfo = (level: IeltsLevel) => {
    switch (level) {
      case "BEGINNER":
        return {
          label: t("ielts.level.beginner"),
          color: "bg-green-100 text-green-800",
        };
      case "INTERMEDIATE":
        return {
          label: t("ielts.level.intermediate"),
          color: "bg-yellow-100 text-yellow-800",
        };
      case "ADVANCED":
        return {
          label: t("ielts.level.advanced"),
          color: "bg-red-100 text-red-800",
        };
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
                  <h1 className="text-base md:text-xl lg:text-3xl font-bold text-white">
                    {t("ielts.teacher.manageTitle")}
                  </h1>
                </div>
              </div>
              <p className="text-white/90 text-lg leading-relaxed max-w-3xl text-start">
                {t("ielts.teacher.manageDescription")}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={onCreate}
                  className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span>{t("ielts.teacher.createNewTest")}</span>
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
            label={t("ielts.teacher.totalTests")}
            value={stats.total}
          />
          <StatCard
            icon={<Book className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-100"
            label={t("ielts.teacher.readingTests")}
            value={stats.reading}
          />
          <StatCard
            icon={<Headphones className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-100"
            label={t("ielts.teacher.listeningTests")}
            value={stats.listening}
          />
          <StatCard
            icon={<PenSquare className="h-6 w-6 text-orange-600" />}
            bgColor="bg-orange-100"
            label={t("ielts.teacher.writingTests")}
            value={stats.writing}
          />
          <StatCard
            icon={<Mic className="h-6 w-6 text-teal-600" />}
            bgColor="bg-teal-100"
            label={t("ielts.teacher.speakingTests")}
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
                {t("ielts.teacher.noTestsYet")}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t("ielts.teacher.createFirstTest")}
              </p>
              <button
                onClick={onCreate}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
              >
                {t("ielts.teacher.createNewTest")}
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
                            ? t("ielts.teacher.minutes", {
                                count: test.timeLimit,
                              })
                            : t("ielts.teacher.unlimitedTime")}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t("ielts.teacher.createdAt")}:{" "}
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
                        title={t("ielts.teacher.viewSubmissions")}
                      >
                        <BarChart3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(test.id)}
                        className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        title={t("ielts.teacher.edit")}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(test.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title={t("ielts.teacher.delete")}
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

export const IeltsCenter: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "form">("list");
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const testsParams = useMemo(() => {
    if (user?.role === "TEACHER") {
      return { limit: 100 };
    }
    return {};
  }, [user?.role]);

  const { tests: resources, isLoading: loading } = useIeltsTests(testsParams);
  const { submissions } = useIeltsSubmissions();
  const { deleteTest } = useIeltsTestManagement();
  const navigate = useNavigate();

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
    navigate(`/ielts/result/${submissionId}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("ielts.teacher.confirmDelete"))) {
      try {
        await deleteTest(id);
      } catch (error) {
        console.error("Failed to delete IELTS test:", error);
      }
    }
  };

  const handleBack = () => {
    setView("list");
    setCurrentTestId(null);
  };

  if (view === "form") {
    return <IeltsTestForm testId={currentTestId} onBack={handleBack} />;
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
    <StudentIeltsView
      tests={resources}
      submissions={submissions}
      loading={loading}
      onStartTest={handleStartTest}
      onViewResult={handleViewResult}
    />
  );
};
