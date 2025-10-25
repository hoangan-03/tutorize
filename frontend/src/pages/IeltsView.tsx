import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  IeltsReadingTest,
  IeltsSkill,
  IeltsSubmission,
  IeltsWritingSubmission,
  IeltsWritingTest,
  IeltsItemType,
} from "../types/api";
import {
  useAuth,
  useIeltsTests,
  useIeltsSubmissions,
  useIeltsTestManagement,
  useIeltsWritingMySubmissions,
  useIeltsWritingTest,
  useIeltsWritingTestManagement,
} from "../hooks";
import { IeltsTestForm } from "./IeltsTestForm";
import { WritingTestManagement } from "./WritingTestManagement";
import { BookOpen, Plus, PenSquare } from "lucide-react";
import { formatDateTime } from "../components/utils";
import { RichTextEditor, LoadingSpinner, EmptyState } from "../components/ui";
import {
  IeltsStatsCards,
  IeltsTestCard,
  WritingTaskCard,
  IeltsItemRow,
} from "./IeltsComponents";

const StudentIeltsView: React.FC<{
  tests: IeltsReadingTest[];
  submissions: IeltsSubmission[];
  loading: boolean;
  onStartTest: (id: number) => void;
  onViewResult: (id: number) => void;
  onViewWritingResult: (id: number) => void;
}> = ({
  tests,
  submissions,
  loading,
  onStartTest,
  onViewResult,
  onViewWritingResult,
}) => {
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

  const [currentWritingTest, setCurrentWritingTest] =
    useState<IeltsWritingTest | null>(null);
  const [submissionContent, setSubmissionContent] = useState<string>("");

  // Get writing tests and submissions
  const { tasks: writingTests } = useIeltsWritingTest({ page: 1, limit: 20 });
  const { submissions: writingSubmissions } = useIeltsWritingMySubmissions();
  const { submitWritingSubmission, gradeWritingTest } =
    useIeltsWritingTestManagement();

  const filteredTests = useMemo(() => {
    // Since IeltsReadingTest is only for READING, show tests only when READING is active
    return activeSkill === IeltsSkill.READING ? tests : [];
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
        <LoadingSpinner />
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

        {/* Available Tests - Hide for Writing tab since we have separate Writing Tasks */}
        {activeSkill !== IeltsSkill.WRITING && (
          <div>
            {loading ? (
              <p>{t("ielts.loading")}</p>
            ) : filteredTests.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-16 w-16" />}
                title={t("ielts.noTests")}
                description={t("ielts.noTestsForSkill")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                {filteredTests.map((resource) => {
                  const highestSubmission = getHighestScoreSubmission(
                    resource.id
                  );
                  return (
                    <IeltsTestCard
                      key={resource.id}
                      test={resource}
                      highestSubmission={highestSubmission}
                      onStartTest={onStartTest}
                      onViewResult={onViewResult}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Writing Tasks for students */}
        {activeSkill === IeltsSkill.WRITING && (
          <div>
            {writingTests.length === 0 ? (
              <EmptyState
                icon={<PenSquare className="h-16 w-16" />}
                title={t("ielts.noTests")}
                description={t("ielts.noTestsForSkill")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {writingTests.map((task: IeltsWritingTest) => (
                  <WritingTaskCard
                    key={task.id}
                    task={task}
                    onStartTask={setCurrentWritingTest}
                  />
                ))}
              </div>
            )}

            {currentWritingTest && (
              <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-end mb-2">
                  <button
                    className="text-red-800 hover:text-red-700"
                    onClick={() => setCurrentWritingTest(null)}
                  >
                    {t("ielts.writingTasks.close")}
                  </button>
                </div>

                <div className="mt-3">
                  <RichTextEditor
                    value={submissionContent}
                    onChange={setSubmissionContent}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lime-600 hover:bg-lime-700 max-w-[150px]"
                    onClick={async () => {
                      await submitWritingSubmission(
                        currentWritingTest.id,
                        submissionContent
                      );
                    }}
                  >
                    {t("ielts.writingTasks.submit")}
                  </button>
                  <button
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 max-w-[150px]"
                    onClick={async () => {
                      await gradeWritingTest(currentWritingTest.id, {
                        score: {
                          taskResponse: 0.5,
                          coherenceAndCohesion: 0.5,
                          lexicalResource: 0.5,
                          grammaticalRange: 0.5,
                        },
                        feedback: {
                          taskResponse: "Feedback for task achievement",
                          coherenceAndCohesion:
                            "Feedback for coherence and cohesion",
                          lexicalResource: "Feedback for lexical resource",
                          grammaticalRange: "Feedback for grammatical range",
                        },
                      });
                    }}
                  >
                    {t("ielts.writingTasks.gradeWithAI")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submission History */}
        <div className="mt-6 lg:mt-16 mx-2">
          <h2 className="text-lg lg:text-2xl font-semibold text-gray-800 mb-2 lg:mb-6 text-start">
            {t("ielts.submissionHistory")}
          </h2>
          {(() => {
            // Filter submissions based on active skill
            type AnySubmission = IeltsSubmission | IeltsWritingSubmission;
            const filteredSubmissions: AnySubmission[] =
              activeSkill === IeltsSkill.READING
                ? submissions
                : activeSkill === IeltsSkill.WRITING
                ? writingSubmissions
                : [];

            if (filteredSubmissions.length === 0) {
              return (
                <EmptyState
                  icon={<BookOpen className="h-16 w-16" />}
                  title={t("ielts.noSubmissions")}
                  description=""
                />
              );
            }

            return (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                  {filteredSubmissions
                    .sort(
                      (a: AnySubmission, b: AnySubmission) =>
                        new Date(b.submittedAt).getTime() -
                        new Date(a.submittedAt).getTime()
                    )
                    .map((submission: AnySubmission) => (
                      <li
                        key={submission.id}
                        className="px-3 lg:px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="text-start">
                          <h3 className="text-base lg:text-md font-semibold text-gray-800 pr-2">
                            {submission.test?.title ||
                              `Test ID: ${submission.testId}`}
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-500">
                            {t("ielts.submittedAt")}:{" "}
                            {formatDateTime(submission.submittedAt)}
                          </p>
                        </div>
                        <div className="text-right ">
                          <p className="text-sm text-gray-500">
                            {t("ielts.score")}
                          </p>
                          <p className="text-base lg:text-xl font-bold text-indigo-600">
                            {activeSkill === IeltsSkill.WRITING
                              ? (submission as IeltsWritingSubmission)
                                  .aiScore ||
                                (submission as IeltsWritingSubmission)
                                  .humanScore
                                ? "Chấm điểm"
                                : "Chưa chấm"
                              : (submission as IeltsSubmission).score?.toFixed(
                                  1
                                ) || "0.0"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            activeSkill === IeltsSkill.WRITING
                              ? onViewWritingResult(submission.id)
                              : onViewResult(submission.id)
                          }
                          className="ml-2 lg:ml-4 inline-flex items-center px-3 py-1 lg:px-5 lg:py-2 border border-transparent text-xs lg:text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          {t("ielts.review")}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

const TeacherIeltsView: React.FC<{
  readingTests: IeltsReadingTest[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onViewSubmissions: (type: IeltsItemType) => void;
  onEditWritingTask: (testId: number | null) => void;
}> = ({
  readingTests,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onViewSubmissions,
  onEditWritingTask,
}) => {
  const { t } = useTranslation();

  const { tasks: writingTest } = useIeltsWritingTest();
  const { deleteWritingTest } = useIeltsWritingTestManagement();

  const stats = {
    total: readingTests.length + writingTest.length,
    reading: readingTests.length,
    listening: 0,
    speaking: 0,
    writing: writingTest.length,
  };

  const handleCreateWritingTest = () => {
    onEditWritingTask(null); // Pass null for create new
  };

  const handleDeleteWritingTest = async (testId: number) => {
    if (window.confirm(t("ielts.teacher.confirmDelete"))) {
      try {
        await deleteWritingTest(testId);
      } catch (error) {
        console.error("Failed to delete Writing Test:", error);
      }
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
                  onClick={handleCreateWritingTest}
                  className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <PenSquare className="h-5 w-5 mr-2" />
                  <span>{t("ielts.writingTasks.createTask")}</span>
                </button>
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
        <IeltsStatsCards stats={stats} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner />
            </div>
          ) : readingTests.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-20 w-20" />}
              title={t("ielts.teacher.noTestsYet")}
              description={t("ielts.teacher.createFirstTest")}
              action={{
                label: t("ielts.teacher.createNewTest"),
                onClick: onCreate,
              }}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {readingTests.map((test) => (
                <IeltsItemRow
                  key={test.id}
                  item={test}
                  type={IeltsItemType.READING_TEST}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewSubmissions={onViewSubmissions}
                />
              ))}
            </div>
          )}
        </div>

        {writingTest.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {writingTest.map((task: IeltsWritingTest) => (
                <IeltsItemRow
                  key={task.id}
                  item={task}
                  type={IeltsItemType.WRITING_TEST}
                  onEdit={onEditWritingTask}
                  onDelete={handleDeleteWritingTest}
                  onViewSubmissions={onViewSubmissions}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const IeltsView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "form" | "writingForm">("list");
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);
  const [currentWritingTaskId, setCurrentWritingTaskId] = useState<
    number | null
  >(null);

  const testsParams = useMemo(() => {
    if (user?.role === "TEACHER") {
      return { limit: 100 };
    }
    return {};
  }, [user?.role]);

  const { tests: readingTests, isLoading: loading } =
    useIeltsTests(testsParams);
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

  const handleViewWritingResult = (submissionId: number) => {
    navigate(`/ielts-writing/my-submission/${submissionId}`);
  };

  const handleViewAllSubmissionsByTestType = (type: IeltsItemType) => {
    if (type === IeltsItemType.READING_TEST) {
      navigate("/ielts/submissions");
    } else if (type === IeltsItemType.WRITING_TEST) {
      navigate("/ielts-writing/submissions");
    }
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

  const handleEditWritingTask = (testId: number | null) => {
    setCurrentWritingTaskId(testId);
    setView("writingForm");
  };

  const handleBackToList = () => {
    setView("list");
    setCurrentTestId(null);
    setCurrentWritingTaskId(null);
  };

  if (view === "form") {
    return <IeltsTestForm testId={currentTestId} onBack={handleBackToList} />;
  }

  if (view === "writingForm") {
    return (
      <WritingTestManagement
        testId={currentWritingTaskId}
        onBack={handleBackToList}
      />
    );
  }

  if (user?.role === "TEACHER") {
    return (
      <TeacherIeltsView
        readingTests={readingTests}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onViewSubmissions={handleViewAllSubmissionsByTestType}
        onEditWritingTask={handleEditWritingTask}
      />
    );
  }

  return (
    <StudentIeltsView
      tests={readingTests}
      submissions={submissions}
      loading={loading}
      onStartTest={handleStartTest}
      onViewResult={handleViewResult}
      onViewWritingResult={handleViewWritingResult}
    />
  );
};
